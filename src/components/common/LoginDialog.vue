<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="dialog panel">
      <button class="dialog__close" type="button" @click="emit('close')">
        <X :size="18" />
      </button>

      <div class="dialog__header">
        <img class="dialog__logo" :src="smileLogoUrl" alt="喜人同乐" />
        <h2 class="dialog__title">登录喜人同乐</h2>
        <p class="dialog__subtitle">喜人同乐，欢迎回来</p>
      </div>

      <form class="dialog__form" @submit.prevent="handleLogin">
        <div>
          <label class="dialog__label">账号</label>
          <input v-model="username" class="dialog__input" placeholder="请输入账号或邮箱" type="text" />
        </div>
        <div>
          <label class="dialog__label">密码</label>
          <div class="password-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="dialog__input dialog__input--password"
              placeholder="请输入密码"
            />
            <button class="password-toggle" type="button" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="15" />
              <Eye v-else :size="15" />
            </button>
          </div>
        </div>
        <p v-if="error" class="dialog__error">{{ error }}</p>
        <button class="dialog__submit brand-gradient" :disabled="loading" type="submit">
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>

      <div class="dialog__footer">
        <button class="dialog__link secondary-text" type="button" @click="goTo('/forgot-password')">忘记密码？</button>
        <button class="dialog__link dialog__link--brand" type="button" @click="goTo('/register')">没有账号？注册</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff, X } from "lucide-vue-next";
import { ref } from "vue";
import { useRouter } from "vue-router";
import http from "@/api/http";
import { type ApiResponse, extractApiErrorMessage, unwrapApiResponse } from "@/api/response";
import { useAuthStore } from "@/stores/auth";
import { setAuthTokens } from "@/utils/authToken";

const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const authStore = useAuthStore();
const smileLogoUrl = `${import.meta.env.BASE_URL}smile-logo.svg`;
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const error = ref("");

const toFormData = (payload: Record<string, string>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value);
  });
  return params;
};

const postForm = async <T>(url: string, payload: Record<string, string>) => {
  const response = await http.post<ApiResponse<T>>(url, toFormData(payload));
  return {
    data: unwrapApiResponse(response.data),
    headers: response.headers,
  };
};

type LoginTokenResponse = {
  Authorization?: string;
  authorization?: string;
  jwt?: string;
  refreshToken?: string;
  token?: string;
};

const handleLogin = async () => {
  error.value = "";

  const normalizedUsername = username.value.trim();
  const normalizedPassword = password.value.trim();
  if (!normalizedUsername || !normalizedPassword) {
    error.value = "请输入账号和密码";
    return;
  }

  loading.value = true;

  try {
    username.value = normalizedUsername;
    password.value = normalizedPassword;
    const loginResponse = await postForm<LoginTokenResponse | boolean>("/login/username", {
      username: normalizedUsername,
      password: normalizedPassword,
    });
    const bodyToken =
      typeof loginResponse.data === "object" && loginResponse.data
        ? loginResponse.data.Authorization ?? loginResponse.data.authorization ?? loginResponse.data.token ?? loginResponse.data.jwt
        : "";
    const headerToken =
      loginResponse.headers.authorization ??
      loginResponse.headers.Authorization ??
      loginResponse.headers.token;
    const refreshToken =
      typeof loginResponse.data === "object" && loginResponse.data ? loginResponse.data.refreshToken ?? "" : "";
    setAuthTokens({
      token: bodyToken || headerToken,
      refreshToken,
    });
    await authStore.fetchLoginStatus();
    emit("close");
  } catch (value) {
    error.value = extractApiErrorMessage(value, "登录失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const goTo = (path: string) => {
  emit("close");
  router.push(path);
};
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}

.dialog {
  position: relative;
  width: min(100%, 384px);
  margin: 0 16px;
  padding: 32px 28px 28px;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.2);
}

.dialog__close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #9ca3af;
  cursor: pointer;
}

.dialog__close:hover {
  color: #4b5563;
}

.dialog__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.dialog__logo {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.dialog__title {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 600;
}

.dialog__subtitle {
  margin: 4px 0 0;
  color: #9ca3af;
  font-size: 13px;
}

.dialog__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog__label {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
}

.dialog__input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  padding: 10px 16px;
  color: #111827;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.dialog__input:focus {
  border-color: #6c63ff;
}

.password-wrap {
  position: relative;
}

.dialog__input--password {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #9ca3af;
  cursor: pointer;
}

.password-toggle:hover {
  color: #4b5563;
}

.dialog__error {
  margin: 0;
  color: #ef4444;
  font-size: 12px;
}

.dialog__submit {
  width: 100%;
  margin-top: 4px;
  border-radius: 12px;
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.dialog__submit:disabled {
  opacity: 0.7;
}

.dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.dialog__link {
  font-size: 12px;
  cursor: pointer;
}

.dialog__link--brand {
  color: #6c63ff;
}

.dialog__link:hover {
  opacity: 0.82;
}
</style>
