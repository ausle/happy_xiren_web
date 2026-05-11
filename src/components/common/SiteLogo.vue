<template>
  <RouterLink class="site-logo" to="/">
    <div class="site-logo__icon brand-gradient">😊</div>
    <div class="site-logo__text">
      <span class="site-logo__title">Happy</span>
      <span class="site-logo__subtitle">喜人同乐</span>
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
  gap: 8px;
  flex-shrink: 0;
}

.site-logo__icon {
  display: flex;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.site-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.site-logo__title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.site-logo__subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: #9ca3af;
}
</style>
