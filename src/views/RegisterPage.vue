<template>
  <div class="auth-shell">
    <div class="auth-wrap">
      <div class="auth-logo">
        <RouterLink class="auth-logo__link" to="/">
          <img class="auth-logo__icon" :src="smileLogoUrl" alt="喜人同乐" />
          <div>
            <p class="auth-logo__title">喜人同乐</p>
            <p class="auth-logo__subtitle">一起开心</p>
          </div>
        </RouterLink>
      </div>

      <div class="auth-card panel">
        <div v-if="success" class="success-state">
          <div class="success-state__icon">
            <CheckCircle2 :size="32" class="success-state__icon-svg" />
          </div>
          <div>
            <h2 class="auth-card__title">注册成功！</h2>
            <p class="auth-card__meta">欢迎加入喜人同乐，验证邮件已发送至 {{ form.email }}</p>
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
              <input v-model="form.username" :class="inputClass(!!errors.username)" placeholder="请输入用户名（2-20 个字符）" type="text" />
              <p v-if="errors.username" class="auth-error">{{ errors.username }}</p>
            </div>
            <div>
              <label class="auth-label">邮箱</label>
              <input v-model="form.email" :class="inputClass(!!errors.email)" placeholder="请输入邮箱地址" type="email" />
              <p v-if="errors.email" class="auth-error">{{ errors.email }}</p>
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
                  我已阅读并同意 <span class="auth-text-link">用户协议</span> 和 <span class="auth-text-link">隐私政策</span>
                </span>
              </label>
              <p v-if="errors.agreed" class="auth-error">{{ errors.agreed }}</p>
            </div>
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
import { CheckCircle2, Eye, EyeOff } from "lucide-vue-next";
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const smileLogoUrl = `${import.meta.env.BASE_URL}smile-logo.svg`;
const form = reactive({ username: "", email: "", password: "", confirm: "" });
const showPassword = ref(false);
const showConfirm = ref(false);
const agreed = ref(false);
const loading = ref(false);
const success = ref(false);
const errors = ref<Record<string, string>>({});

const inputClass = (hasError: boolean) =>
  `auth-input ${hasError ? "auth-input--error" : ""}`;

const validate = () => {
  const nextErrors: Record<string, string> = {};
  if (!form.username.trim()) nextErrors.username = "请输入用户名";
  else if (form.username.length < 2) nextErrors.username = "用户名至少 2 个字符";
  if (!form.email.trim()) nextErrors.email = "请输入邮箱";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "邮箱格式不正确";
  if (!form.password) nextErrors.password = "请输入密码";
  else if (form.password.length < 6) nextErrors.password = "密码至少 6 位";
  if (form.confirm !== form.password) nextErrors.confirm = "两次密码不一致";
  if (!agreed.value) nextErrors.agreed = "请阅读并同意用户协议";
  return nextErrors;
};

const handleSubmit = () => {
  errors.value = validate();
  if (Object.keys(errors.value).length) {
    return;
  }

  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
    success.value = true;
  }, 1000);
};
</script>

<style scoped>
.auth-shell {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 48px 16px;
}

.auth-wrap {
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
  background: #fafafa;
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
</style>
