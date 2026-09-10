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
        <div v-if="sent" class="success-state">
          <div class="success-state__icon success-state__icon--purple">
            <CheckCircle2 :size="32" color="#6C63FF" />
          </div>
          <div>
            <h2 class="auth-card__title">邮件已发送</h2>
            <p class="success-text">
              重置密码链接已发送至<br />
              <span class="success-text__strong">{{ email }}</span><br />
              请查收邮件并点击链接重置密码。
            </p>
          </div>
          <p class="auth-card__meta auth-card__meta--center">
            没有收到？请检查垃圾邮件，或
            <button class="auth-text-link" type="button" @click="sent = false">重新发送</button>
          </p>
          <button class="auth-submit brand-gradient" type="button" @click="router.push('/')">返回首页</button>
        </div>
        <template v-else>
          <button class="back-button" type="button" @click="router.back()">
            <ArrowLeft :size="14" />
            返回
          </button>

          <div class="forgot-head">
            <div class="forgot-head__icon">
              <Mail :size="26" color="#6C63FF" />
            </div>
            <h2 class="auth-card__title">忘记密码？</h2>
            <p class="auth-card__meta auth-card__meta--center">
              输入你的注册邮箱，我们会发送一封<br />
              密码重置邮件给你。
            </p>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div>
              <label class="auth-label">邮箱地址</label>
              <input v-model="email" :class="inputClass(!!error)" placeholder="请输入注册邮箱" type="email" />
              <p v-if="error" class="auth-error">{{ error }}</p>
            </div>
            <button class="auth-submit brand-gradient" :disabled="loading" type="submit">
              {{ loading ? "发送中..." : "发送重置邮件" }}
            </button>
          </form>

          <div class="forgot-foot">
            <p class="auth-card__meta auth-card__meta--center">
              想起密码了？
              <button class="auth-text-link" type="button" @click="router.push('/')">返回登录</button>
            </p>
            <p class="auth-card__meta auth-card__meta--center">
              没有账号？
              <RouterLink class="auth-text-link" to="/register">立即注册</RouterLink>
            </p>
          </div>
        </template>
      </div>

      <p class="auth-copyright">© 2026 喜人同乐. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Mail } from "lucide-vue-next";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const smileLogoUrl = `${import.meta.env.BASE_URL}smile-logo.svg`;
const email = ref("");
const loading = ref(false);
const error = ref("");
const sent = ref(false);

const inputClass = (hasError: boolean) => `auth-input ${hasError ? "auth-input--error" : ""}`;

const handleSubmit = () => {
  error.value = "";
  if (!email.value.trim()) {
    error.value = "请输入邮箱地址";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = "邮箱格式不正确";
    return;
  }
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
    sent.value = true;
  }, 1000);
};
</script>

<style scoped>
.auth-shell {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 12% 0%, rgba(37, 99, 235, 0.12), transparent 26rem),
    radial-gradient(circle at 88% 18%, rgba(6, 182, 212, 0.12), transparent 26rem),
    linear-gradient(180deg, #fbfcff 0%, #f5f7fb 100%);
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
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 800;
}

.auth-logo__subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.auth-card {
  padding: 32px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 24px 58px rgba(18, 19, 26, 0.1);
  backdrop-filter: blur(18px);
}

.auth-card__title {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.auth-card__meta {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.auth-card__meta--center {
  text-align: center;
}

.auth-text-link {
  color: #2563eb;
  cursor: pointer;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
}

.forgot-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  text-align: center;
}

.forgot-head__icon {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border-radius: 18px;
  background: #dbeafe;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.auth-input {
  width: 100%;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.auth-input:focus {
  border-color: rgba(37, 99, 235, 0.42);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.auth-input--error,
.auth-input--error:focus {
  border-color: #fca5a5;
}

.auth-error {
  margin: 4px 0 0;
  color: #ef4444;
  font-size: 12px;
}

.auth-submit {
  width: 100%;
  border-radius: 14px;
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.2);
}

.auth-submit:disabled {
  opacity: 0.7;
}

.forgot-foot {
  margin-top: 20px;
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
  background: #dbeafe;
}

.success-state__icon--purple {
  background: #dbeafe;
}

.success-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.success-text__strong {
  color: var(--text-primary);
  font-weight: 500;
}

.auth-copyright {
  margin: 24px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}
</style>
