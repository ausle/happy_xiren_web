import { defineStore } from "pinia";
import http from "@/api/http";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";

export type LoginStatusResult = {
  loggedIn: boolean;
  userId?: number;
  username?: string;
  photo?: string;
  riskTip?: string;
};

export type AuthUser = {
  userId: number;
  username: string;
  photo: string;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    initialized: false,
    loading: false,
    user: null as AuthUser | null,
  }),
  getters: {
    loggedIn: (state) => !!state.user,
    initials: (state) => {
      const firstChar = state.user?.username?.trim().charAt(0) ?? "";
      return firstChar ? firstChar.toUpperCase() : "U";
    },
  },
  actions: {
    setUser(result: LoginStatusResult | null) {
      if (!result?.loggedIn || !result.userId || !result.username) {
        this.user = null;
        return null;
      }

      this.user = {
        userId: result.userId,
        username: result.username,
        photo: result.photo ?? "",
      };
      return this.user;
    },
    clearUser() {
      this.user = null;
    },
    async fetchLoginStatus() {
      this.loading = true;

      try {
        const { data } = await http.get<ApiResponse<LoginStatusResult>>("/login/status");
        return this.setUser(unwrapApiResponse(data));
      } catch {
        this.user = null;
        return null;
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },
  },
});
