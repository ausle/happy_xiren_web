<template>
  <RouterLink class="site-logo" to="/">
    <img class="site-logo__icon" :src="smileLogoUrl" alt="喜人同乐" />
    <div class="site-logo__text">
      <span class="site-logo__title">喜人同乐</span>
      <span class="site-logo__subtitle">一起开心</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

const smileLogoUrl = `${import.meta.env.BASE_URL}smile-logo.svg`;
</script>

<style scoped>
.site-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.site-logo__icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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
