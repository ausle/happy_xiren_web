<template>
  <RouterLink class="site-logo" to="/">
    <span class="site-logo__mark" aria-hidden="true">
      <span>喜</span>
    </span>
    <div class="site-logo__text">
      <span class="site-logo__title">喜人同乐</span>
      <span class="site-logo__subtitle">Code & Joy</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.site-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.site-logo__mark {
  position: relative;
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  background:
    radial-gradient(circle at 28% 18%, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0) 28%),
    linear-gradient(135deg, #15171f 0%, #2563eb 52%, #12c6c1 100%);
  box-shadow:
    0 14px 30px rgba(37, 99, 235, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.38);
}

.site-logo__mark::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.38) 48%, transparent 72%);
  content: "";
  transform: translateX(-48%);
}

.site-logo__mark span {
  position: relative;
  z-index: 1;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.22);
}

.site-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.site-logo__title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.site-logo__subtitle {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>
