<template>
  <div class="auth-shell">
    <div class="auth-shell__background" aria-hidden="true"></div>
    <div class="auth-wrap">
      <div class="auth-logo">
        <RouterLink class="auth-logo__link" to="/">
          <img class="auth-logo__icon" :src="smileLogoUrl" alt="喜人同乐" />
          <div>
            <p class="auth-logo__title">喜人同乐</p>
            <p class="auth-logo__subtitle">一起开心，一起成长</p>
          </div>
        </RouterLink>
      </div>

      <div class="auth-card panel">
        <div v-if="success" class="success-state">
          <div class="success-state__icon">
            <CheckCircle2 :size="32" class="success-state__icon-svg" />
          </div>
          <div>
            <h2 class="auth-card__title">注册成功</h2>
            <p class="auth-card__meta">欢迎加入喜人同乐，注册邮箱 {{ form.email }} 已完成验证。</p>
          </div>
          <button class="auth-submit brand-gradient" type="button" @click="router.push('/')">前往首页</button>
        </div>
        <template v-else>
          <h2 class="auth-card__title">创建账号</h2>
          <p class="auth-card__meta">
            已有账号？
            <button class="auth-text-link" type="button" @click="router.push('/')">立即登录</button>
          </p>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div>
              <label class="auth-label">用户名</label>
              <input
                v-model="form.username"
                :class="inputClass(!!errors.username)"
                maxlength="20"
                placeholder="2-20 位，仅支持中文、字母、数字和下划线"
                type="text"
              />
              <p v-if="errors.username" class="auth-error">{{ errors.username }}</p>
            </div>

            <div>
              <label class="auth-label">邮箱</label>
              <input
                v-model="form.email"
                :class="inputClass(!!errors.email)"
                placeholder="请输入注册邮箱"
                type="email"
              />
              <p v-if="errors.email" class="auth-error">{{ errors.email }}</p>
            </div>

            <div>
              <label class="auth-label">邮箱验证码</label>
              <div class="auth-code-row">
                <input
                  v-model="form.verifyCode"
                  :class="inputClass(!!errors.verifyCode)"
                  maxlength="6"
                  placeholder="请输入邮箱验证码"
                  type="text"
                />
                <button
                  class="auth-code-button"
                  :disabled="sendingCode || countdown > 0"
                  type="button"
                  @click="handleSendCode"
                >
                  {{ sendingCode ? "发送中..." : countdown > 0 ? `${countdown}s 后重发` : "发送验证码" }}
                </button>
              </div>
              <p v-if="errors.verifyCode" class="auth-error">{{ errors.verifyCode }}</p>
            </div>

            <div>
              <label class="auth-label">密码</label>
              <div class="auth-password">
                <input
                  v-model="form.password"
                  :class="inputClass(!!errors.password) + ' auth-password__input'"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码（至少 6 位）"
                />
                <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" :size="15" />
                  <Eye v-else :size="15" />
                </button>
              </div>
              <p v-if="errors.password" class="auth-error">{{ errors.password }}</p>
            </div>

            <div>
              <label class="auth-label">确认密码</label>
              <div class="auth-password">
                <input
                  v-model="form.confirm"
                  :class="inputClass(!!errors.confirm) + ' auth-password__input'"
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="请再次输入密码"
                />
                <button class="auth-password__toggle" type="button" @click="showConfirm = !showConfirm">
                  <EyeOff v-if="showConfirm" :size="15" />
                  <Eye v-else :size="15" />
                </button>
              </div>
              <p v-if="errors.confirm" class="auth-error">{{ errors.confirm }}</p>
            </div>

            <div>
              <label class="auth-checkbox">
                <input v-model="agreed" type="checkbox" />
                <span>
                  我已阅读并同意
                  <span class="auth-text-link">用户协议</span>
                  和
                  <span class="auth-text-link">隐私政策</span>
                </span>
              </label>
              <p v-if="errors.agreed" class="auth-error">{{ errors.agreed }}</p>
            </div>

            <p v-if="notice.text" :class="['auth-notice', `auth-notice--${notice.type}`]">{{ notice.text }}</p>

            <button class="auth-submit brand-gradient" :disabled="loading" type="submit">
              {{ loading ? "注册中..." : "注册" }}
            </button>
          </form>
        </template>
      </div>

      <p class="auth-copyright">© 2026 喜人同乐. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { CheckCircle2, Eye, EyeOff } from "lucide-vue-next";
import { onBeforeUnmount, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import http from "@/api/http";

type ApiResponse<T> = {
  status: {
    code: number;
    msg: string;
  };
  result: T;
};

const router = useRouter();
const smileLogoUrl = `${import.meta.env.BASE_URL}smile-logo.svg`;
const usernamePattern = /^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = reactive({
  username: "",
  email: "",
  verifyCode: "",
  password: "",
  confirm: "",
});
const showPassword = ref(false);
const showConfirm = ref(false);
const agreed = ref(false);
const loading = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
const success = ref(false);
const errors = ref<Record<string, string>>({});
const notice = reactive<{ type: "" | "success" | "error"; text: string }>({
  type: "",
  text: "",
});

let countdownTimer: number | undefined;

const inputClass = (hasError: boolean) => `auth-input ${hasError ? "auth-input--error" : ""}`;

const setNotice = (type: "success" | "error", text: string) => {
  notice.type = type;
  notice.text = text;
};

const clearNotice = () => {
  notice.type = "";
  notice.text = "";
};

const normalizeEmail = () => form.email.trim().toLowerCase();

const validateEmailOnly = () => {
  if (!form.email.trim()) return "请输入邮箱";
  if (!emailPattern.test(normalizeEmail())) return "邮箱格式不正确";
  return "";
};

const validate = () => {
  const nextErrors: Record<string, string> = {};

  if (!form.username.trim()) nextErrors.username = "请输入用户名";
  else if (!usernamePattern.test(form.username.trim())) nextErrors.username = "用户名需为 2-20 位，仅支持中文、字母、数字和下划线";

  const emailError = validateEmailOnly();
  if (emailError) nextErrors.email = emailError;

  if (!form.verifyCode.trim()) nextErrors.verifyCode = "请输入邮箱验证码";
  else if (!/^\d{6}$/.test(form.verifyCode.trim())) nextErrors.verifyCode = "验证码应为 6 位数字";

  if (!form.password) nextErrors.password = "请输入密码";
  else if (form.password.length < 6) nextErrors.password = "密码至少 6 位";

  if (!form.confirm) nextErrors.confirm = "请再次输入密码";
  else if (form.confirm !== form.password) nextErrors.confirm = "两次输入的密码不一致";

  if (!agreed.value) nextErrors.agreed = "请阅读并同意用户协议";

  return nextErrors;
};

const toFormData = (payload: Record<string, string>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value);
  });
  return params;
};

const postForm = async <T>(url: string, payload: Record<string, string>) => {
  const { data } = await http.post<ApiResponse<T>>(url, toFormData(payload));
  if (data.status.code !== 0) {
    throw new Error(data.status.msg || "请求失败");
  }
  return data.result;
};

const extractErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.status?.msg;
    if (responseMessage) return responseMessage;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "请求失败，请稍后重试";
};

const startCountdown = (seconds: number) => {
  countdown.value = seconds;
  if (countdownTimer) window.clearInterval(countdownTimer);

  countdownTimer = window.setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0;
      if (countdownTimer) {
        window.clearInterval(countdownTimer);
        countdownTimer = undefined;
      }
      return;
    }

    countdown.value -= 1;
  }, 1000);
};

const clearFieldError = (field: string) => {
  if (!errors.value[field]) return;
  const nextErrors = { ...errors.value };
  delete nextErrors[field];
  errors.value = nextErrors;
};

const handleSendCode = async () => {
  const emailError = validateEmailOnly();
  if (emailError) {
    errors.value = { ...errors.value, email: emailError };
    setNotice("error", emailError);
    return;
  }

  clearFieldError("email");
  clearFieldError("verifyCode");
  clearNotice();
  sendingCode.value = true;

  try {
    form.email = normalizeEmail();
    await postForm<boolean>("/login/register/code", { email: form.email });
    startCountdown(60);
    setNotice("success", "验证码已发送，请查收邮箱");
  } catch (error) {
    setNotice("error", extractErrorMessage(error));
  } finally {
    sendingCode.value = false;
  }
};

const handleSubmit = async () => {
  clearNotice();
  errors.value = validate();
  if (Object.keys(errors.value).length) {
    return;
  }

  loading.value = true;

  try {
    form.username = form.username.trim();
    form.email = normalizeEmail();
    form.verifyCode = form.verifyCode.trim();
    await postForm<number>("/login/register", {
      username: form.username,
      email: form.email,
      verifyCode: form.verifyCode,
      password: form.password,
    });
    success.value = true;
  } catch (error) {
    setNotice("error", extractErrorMessage(error));
  } finally {
    loading.value = false;
  }
};

onBeforeUnmount(() => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.auth-shell {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(255, 232, 236, 0.96), transparent 34%),
    radial-gradient(circle at 88% 72%, rgba(123, 16, 39, 0.12), transparent 30%),
    linear-gradient(135deg, #fff8f5 0%, #fff4f7 44%, #f8edf3 100%);
  padding: 48px 16px;
}

.auth-shell__background {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 250, 246, 0.98) 0%, rgba(255, 247, 250, 0.92) 34%, rgba(255, 244, 248, 0.58) 56%, rgba(255, 242, 246, 0.18) 72%),
    radial-gradient(circle at 12% 24%, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0) 28%),
    radial-gradient(circle at 84% 18%, rgba(182, 43, 74, 0.22), rgba(182, 43, 74, 0) 26%),
    radial-gradient(circle at 78% 86%, rgba(255, 211, 144, 0.26), rgba(255, 211, 144, 0) 22%);
  background-repeat: no-repeat;
}

.auth-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 448px;
}

.auth-logo {
  margin-bottom: 32px;
  text-align: center;
}

.auth-logo__link {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.auth-logo__icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
}

.auth-logo__title {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.auth-logo__subtitle {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
}

.auth-card {
  padding: 32px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 26px 60px rgba(148, 83, 120, 0.16);
  backdrop-filter: blur(14px);
}

.auth-card__title {
  margin: 0 0 4px;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
}

.auth-card__meta {
  margin: 0 0 24px;
  color: #9ca3af;
  font-size: 13px;
}

.auth-text-link {
  color: #6c63ff;
  cursor: pointer;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-label {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
}

.auth-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  padding: 10px 16px;
  color: #111827;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.auth-input:focus {
  border-color: #6c63ff;
}

.auth-input--error,
.auth-input--error:focus {
  border-color: #fca5a5;
}

.auth-code-row {
  display: flex;
  gap: 12px;
}

.auth-code-row .auth-input {
  flex: 1;
}

.auth-code-button {
  min-width: 118px;
  border: 1px solid #d8d4ff;
  border-radius: 12px;
  background: #f4f1ff;
  padding: 0 14px;
  color: #5b50d6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-code-button:hover:not(:disabled) {
  border-color: #bfb8ff;
  background: #ede9ff;
}

.auth-code-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.auth-password {
  position: relative;
}

.auth-password__input {
  padding-right: 40px;
}

.auth-password__toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #9ca3af;
  cursor: pointer;
}

.auth-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.auth-checkbox input {
  margin-top: 2px;
  accent-color: #6c63ff;
}

.auth-error {
  margin: 4px 0 0;
  color: #ef4444;
  font-size: 12px;
}

.auth-notice {
  margin: -4px 0 0;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}

.auth-notice--success {
  background: #ecfdf3;
  color: #047857;
}

.auth-notice--error {
  background: #fef2f2;
  color: #b91c1c;
}

.auth-submit {
  width: 100%;
  border-radius: 12px;
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.auth-submit:disabled {
  opacity: 0.7;
}

.auth-copyright {
  margin: 24px 0 0;
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  text-align: center;
}

.success-state__icon {
  display: flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #dcfce7;
}

.success-state__icon-svg {
  color: #22c55e;
}

@media (max-width: 520px) {
  .auth-shell {
    padding: 24px 12px;
  }

  .auth-shell__background {
    background:
      linear-gradient(180deg, rgba(255, 249, 246, 0.98) 0%, rgba(255, 246, 249, 0.92) 36%, rgba(255, 245, 248, 0.8) 100%),
      radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0) 28%),
      radial-gradient(circle at 92% 88%, rgba(123, 16, 39, 0.14), rgba(123, 16, 39, 0) 26%);
  }

  .auth-card {
    padding: 24px 20px;
    background: rgba(255, 255, 255, 0.92);
  }

  .auth-code-row {
    flex-direction: column;
  }

  .auth-code-button {
    min-height: 42px;
  }
}
</style>
