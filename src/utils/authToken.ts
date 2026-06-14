const AUTH_TOKEN_STORAGE_KEY = "happy-vue3:auth-token";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "happy-vue3:auth-refresh-token";
const BEARER_PREFIX = "Bearer ";
const DEFAULT_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

type JwtPayload = {
  exp?: number;
  photo?: string;
  userId?: number | string;
  userName?: string;
  username?: string;
};

export type AuthTokenPair = {
  token: string;
  refreshToken: string;
};

const hasWindow = () => typeof window !== "undefined";

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;
  return window.atob(padded);
};

export function normalizeAuthToken(token?: string | null) {
  const normalized = token?.trim() ?? "";
  if (!normalized) {
    return "";
  }

  return normalized.startsWith(BEARER_PREFIX) ? normalized.slice(BEARER_PREFIX.length).trim() : normalized;
}

export function getAuthToken() {
  if (!hasWindow()) {
    return "";
  }

  try {
    return normalizeAuthToken(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
  } catch {
    return "";
  }
}

export function getRefreshToken() {
  if (!hasWindow()) {
    return "";
  }

  try {
    return normalizeAuthToken(window.localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY));
  } catch {
    return "";
  }
}

export function setAuthToken(token?: string | null) {
  const normalized = normalizeAuthToken(token);
  if (!hasWindow()) {
    return normalized;
  }

  try {
    if (normalized) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures so auth can still proceed in-memory for this session.
  }

  return normalized;
}

export function setRefreshToken(refreshToken?: string | null) {
  const normalized = normalizeAuthToken(refreshToken);
  if (!hasWindow()) {
    return normalized;
  }

  try {
    if (normalized) {
      window.localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures so auth can still proceed in-memory for this session.
  }

  return normalized;
}

export function setAuthTokens(tokens: Partial<AuthTokenPair>) {
  const token = setAuthToken(tokens.token);
  const refreshToken = setRefreshToken(tokens.refreshToken);
  return { token, refreshToken };
}

export function clearAuthToken() {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures while clearing auth state.
  }
}

export const clearAuthTokens = clearAuthToken;

export function buildAuthorizationHeader(token?: string | null) {
  const normalized = normalizeAuthToken(token);
  return normalized ? `${BEARER_PREFIX}${normalized}` : "";
}

export function buildAuthHeaders(token?: string | null) {
  const normalized = normalizeAuthToken(token) || getAuthToken();
  if (!normalized) {
    return {};
  }

  return {
    Authorization: buildAuthorizationHeader(normalized),
    token: normalized,
  };
}

export function parseAuthTokenPayload(token?: string | null): JwtPayload | null {
  const normalized = normalizeAuthToken(token) || getAuthToken();
  if (!normalized) {
    return null;
  }

  const segments = normalized.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(segments[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAuthTokenExpired(token?: string | null) {
  const expiresAt = getAuthTokenExpiresAt(token);
  return expiresAt > 0 && expiresAt <= Date.now();
}

export function getAuthTokenExpiresAt(token?: string | null) {
  const payload = parseAuthTokenPayload(token);
  if (!payload?.exp) {
    return 0;
  }

  return payload.exp * 1000;
}

export function shouldRefreshAuthToken(token?: string | null, thresholdMs = DEFAULT_REFRESH_THRESHOLD_MS) {
  const normalized = normalizeAuthToken(token) || getAuthToken();
  if (!normalized) {
    return false;
  }

  const expiresAt = getAuthTokenExpiresAt(normalized);
  if (!expiresAt) {
    return false;
  }

  return expiresAt - Date.now() <= thresholdMs;
}
