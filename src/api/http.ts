import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";
import {
  buildAuthHeaders,
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setAuthTokens,
  shouldRefreshAuthToken,
  type AuthTokenPair,
} from "@/utils/authToken";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
  withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _tokenRefreshRetried?: boolean;
};

let refreshTokenRequest: Promise<AuthTokenPair | null> | null = null;

const getPathname = (url?: string) => {
  if (!url) {
    return "";
  }

  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
};

const shouldSkipTokenRefresh = (url?: string) => {
  const pathname = getPathname(url);
  return pathname.endsWith("/refreshToken") || pathname.endsWith("/login/username");
};

const shouldUseStoredTokenWithoutRefresh = (url?: string) => {
  return getPathname(url).endsWith("/logout");
};

const applyAuthHeaders = (config: InternalAxiosRequestConfig, token?: string | null) => {
  const authHeaders = buildAuthHeaders(token);
  if (authHeaders.token) {
    config.headers.set("token", authHeaders.token);
    config.headers.set("Authorization", authHeaders.Authorization);
  }

  return config;
};

const refreshAuthTokens = async () => {
  if (refreshTokenRequest) {
    return refreshTokenRequest;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthTokens();
    return null;
  }

  refreshTokenRequest = refreshClient
    .post<ApiResponse<AuthTokenPair> | AuthTokenPair>("/refreshToken", { refreshToken })
    .then(({ data }) => {
      const tokens = unwrapApiResponse<AuthTokenPair>(data);
      if (!tokens.token || !tokens.refreshToken) {
        throw new Error("Invalid refresh token response");
      }

      return setAuthTokens(tokens);
    })
    .catch((error) => {
      clearAuthTokens();
      throw error;
    })
    .finally(() => {
      refreshTokenRequest = null;
    });

  return refreshTokenRequest;
};

const ensureFreshAuthToken = async (url?: string) => {
  if (shouldSkipTokenRefresh(url)) {
    return "";
  }

  const token = getAuthToken();
  if (shouldUseStoredTokenWithoutRefresh(url)) {
    return token;
  }

  if (!token || shouldRefreshAuthToken(token)) {
    const tokens = await refreshAuthTokens();
    return tokens?.token ?? "";
  }

  return token;
};

const readHeader = (headers: unknown, name: string) => {
  if (!headers || typeof headers !== "object") {
    return "";
  }

  const maybeHeaders = headers as Record<string, unknown> & {
    get?: (headerName: string) => unknown;
  };
  const value = maybeHeaders.get?.(name) ?? maybeHeaders[name] ?? maybeHeaders[name.toLowerCase()];
  return typeof value === "string" ? value : "";
};

http.interceptors.request.use(async (config) => {
  const token = await ensureFreshAuthToken(config.url);
  applyAuthHeaders(config, token);
  return config;
});

http.interceptors.response.use(
  (response) => {
    const newToken = readHeader(response.headers, "New-Token");
    if (newToken) {
      setAuthToken(newToken);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._tokenRefreshRetried ||
      shouldSkipTokenRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._tokenRefreshRetried = true;

    try {
      const tokens = await refreshAuthTokens();
      if (!tokens?.token) {
        return Promise.reject(error);
      }

      applyAuthHeaders(originalRequest, tokens.token);
      return http(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default http;
