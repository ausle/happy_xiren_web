import { defineStore } from "pinia";
import http from "@/api/http";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";
import { clearAuthTokens, isAuthTokenExpired, parseAuthTokenPayload } from "@/utils/authToken";

export type LoginStatusResult = {
  loggedIn: boolean;
  authorities?: Array<string | { authority?: string; role?: string }>;
  role?: string | number;
  roles?: Array<string | number>;
  userId?: number | string;
  username?: string;
  userName?: string;
  photo?: string;
  userAvatar?: string;
  userRole?: string | number;
  riskTip?: string;
};

export type AuthUser = {
  userId: number;
  username: string;
  photo: string;
  role: string;
};

const ADMIN_ROLE = "ADMIN";

const normalizeRole = (value: unknown) => {
  if (value === 1) {
    return ADMIN_ROLE;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase();
  return normalized.startsWith("ROLE_") ? normalized.slice(5) : normalized;
};

const getRoleFromCollection = (values: unknown) => {
  if (!Array.isArray(values)) {
    return "";
  }

  for (const item of values) {
    if (typeof item === "object" && item) {
      const role = getRoleFromValue((item as { authority?: unknown; role?: unknown }).authority) ||
        getRoleFromValue((item as { authority?: unknown; role?: unknown }).role);
      if (role) {
        return role;
      }
      continue;
    }

    const role = getRoleFromValue(item);
    if (role) {
      return role;
    }
  }

  return "";
};

const getRoleFromValue = (value: unknown): string => {
  const normalized = normalizeRole(value);
  if (normalized) {
    return normalized;
  }

  return getRoleFromCollection(value);
};

const resolveUserRole = (
  source: Pick<LoginStatusResult, "authorities" | "role" | "roles" | "userRole"> | null | undefined,
  fallbackUser?: AuthUser | null,
) => {
  return (
    getRoleFromValue(source?.role) ||
    getRoleFromValue(source?.userRole) ||
    getRoleFromCollection(source?.roles) ||
    getRoleFromCollection(source?.authorities) ||
    fallbackUser?.role ||
    ""
  );
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    initialized: false,
    loading: false,
    user: null as AuthUser | null,
  }),
  getters: {
    loggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === ADMIN_ROLE,
    initials: (state) => {
      const firstChar = state.user?.username?.trim().charAt(0) ?? "";
      return firstChar ? firstChar.toUpperCase() : "U";
    },
  },
  actions: {
    normalizeUser(result: LoginStatusResult | null, fallbackUser?: AuthUser | null) {
      if (!result?.loggedIn) {
        return null;
      }

      const resolvedUserId = Number(result.userId ?? fallbackUser?.userId ?? 0);
      const username =
        result.username?.trim() ||
        result.userName?.trim() ||
        fallbackUser?.username?.trim() ||
        "用户";

      this.user = {
        userId: Number.isFinite(resolvedUserId) && resolvedUserId > 0 ? resolvedUserId : 0,
        username,
        photo: result.photo ?? result.userAvatar ?? fallbackUser?.photo ?? "",
        role: resolveUserRole(result, fallbackUser),
      };
      return this.user;
    },
    restoreUserFromToken() {
      if (isAuthTokenExpired()) {
        this.clearUser();
        return null;
      }

      const payload = parseAuthTokenPayload();
      const userId = Number(payload?.userId);
      const username = payload?.username?.trim() || payload?.userName?.trim() || payload?.sub?.trim() || "";
      if (!Number.isFinite(userId) || !username) {
        return null;
      }

      this.user = {
        userId,
        username,
        photo: payload?.photo ?? "",
        role: resolveUserRole(payload),
      };
      return this.user;
    },
    setUser(result: LoginStatusResult | null, fallbackUser?: AuthUser | null) {
      const nextUser = this.normalizeUser(result, fallbackUser);
      this.user = nextUser;
      return nextUser;
    },
    clearUser() {
      clearAuthTokens();
      this.user = null;
    },
    async logout() {
      await http.post<ApiResponse<string>>("/logout");
      this.clearUser();
    },
    async fetchLoginStatus() {
      const fallbackUser = this.restoreUserFromToken();
      this.loading = true;

      try {
        const { data } = await http.get<ApiResponse<LoginStatusResult>>("/login/status");
        const result = unwrapApiResponse(data);
        return this.setUser(result, fallbackUser);
      } catch {
        this.user = fallbackUser;
        return fallbackUser;
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },
  },
});
