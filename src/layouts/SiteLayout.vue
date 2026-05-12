<template>
  <div class="site-layout">
    <header class="site-header">
      <div class="page-shell site-header__inner">
        <div class="site-header__left">
          <SiteLogo />
          <div class="site-header__spacer" />
          <nav class="site-nav desktop-only">
            <RouterLink class="site-nav__item" :class="{ active: route.path === '/' }" to="/">首页</RouterLink>
            <RouterLink class="site-nav__item" :class="{ active: route.path.startsWith('/traffic') }" to="/traffic">流量</RouterLink>
            <button class="site-nav__item" type="button">创作</button>
            <button class="site-nav__item" type="button">文档</button>
          </nav>
        </div>
        <div class="site-header__right">
          <button class="site-lang desktop-only" type="button">
            <Globe :size="15" />
            <span>中文</span>
          </button>
          <button class="login-trigger" type="button" @click="uiStore.setLoginOpen(true)">登录</button>
        </div>
      </div>
      <div class="page-shell mobile-only">
        <nav class="site-nav site-nav--mobile">
          <RouterLink class="site-nav__item" :class="{ active: route.path === '/' }" to="/">首页</RouterLink>
          <RouterLink class="site-nav__item" :class="{ active: route.path.startsWith('/traffic') }" to="/traffic">流量</RouterLink>
          <button class="site-nav__item" type="button">创作</button>
          <button class="site-nav__item" type="button">文档</button>
        </nav>
      </div>

      <div
        v-if="isHome"
        class="sub-nav-wrap"
        :style="{ maxHeight: subNavVisible ? '48px' : '0px' }"
      >
        <div class="sub-nav-inner" :style="subNavStyle">
          <div class="page-shell">
            <div class="sub-nav">
              <button
                v-for="category in HOME_CATEGORIES"
                :key="category"
                class="sub-nav__item"
                :class="{ active: uiStore.activeCategory === category }"
                type="button"
                @click="uiStore.setActiveCategory(category)"
              >
                {{ category }}
              </button>
              <div class="sub-nav__search">
                <button type="button">
                  <Search :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="site-layout__main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="page-shell site-footer__inner">
        <SiteLogo />
        <div class="site-footer__links">
          <a class="fade-link" href="#">About</a>
          <span>© 2026 喜人同乐. All rights reserved.</span>
        </div>
      </div>
    </footer>

    <LoginDialog v-if="uiStore.loginOpen" @close="uiStore.setLoginOpen(false)" />
  </div>
</template>

<script setup lang="ts">
import { Globe, Search } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import LoginDialog from "@/components/common/LoginDialog.vue";
import SiteLogo from "@/components/common/SiteLogo.vue";
import { HOME_CATEGORIES, useUiStore } from "@/stores/ui";

const route = useRoute();
const uiStore = useUiStore();
const isHome = computed(() => route.path === "/");
const subNavVisible = ref(true);
const lastScrollY = ref(0);
const animating = ref(false);
let animatingTimer: number | undefined;

const subNavStyle = computed(() => ({
  opacity: subNavVisible.value ? "1" : "0",
  transform: subNavVisible.value ? "translateY(0)" : "translateY(-6px)",
}));

watch(
  () => route.path,
  () => {
    subNavVisible.value = true;
    lastScrollY.value = window.scrollY;
  },
);

const handleScroll = () => {
  if (!isHome.value) return;

  const currentY = window.scrollY;
  const delta = currentY - lastScrollY.value;

  lastScrollY.value = currentY;

  if (animating.value || Math.abs(delta) < 6) {
    return;
  }

  const shouldHide = delta > 0 && currentY > 80;
  const shouldShow = delta < 0;

  if (!shouldHide && !shouldShow) {
    return;
  }

  animating.value = true;
  if (animatingTimer) {
    window.clearTimeout(animatingTimer);
  }
  animatingTimer = window.setTimeout(() => {
    animating.value = false;
  }, 420);

  subNavVisible.value = shouldShow;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  if (animatingTimer) {
    window.clearTimeout(animatingTimer);
  }
});
</script>

<style scoped>
.site-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #ffffff;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
}

.site-header__inner {
  display: flex;
  height: 56px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.site-header__left,
.site-header__right {
  display: flex;
  align-items: center;
}

.site-header__left {
  min-width: 0;
}

.site-header__spacer {
  width: 16px;
  flex-shrink: 0;
}

.site-nav {
  display: flex;
  align-items: center;
  min-width: 0;
}

.site-nav__item {
  flex-shrink: 0;
  border-radius: 10px;
  padding: 6px 12px;
  color: #4b5563;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.site-nav__item:hover {
  background: #f9fafb;
  color: #111827;
}

.site-nav__item.active {
  background: #f3f4f6;
  color: #111827;
  font-weight: 500;
}

.site-header__right {
  gap: 12px;
  flex-shrink: 0;
}

.site-lang,
.login-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

.site-lang:hover,
.login-trigger:hover {
  color: #111827;
}

.login-trigger {
  border-radius: 10px;
  padding: 6px 12px;
}

.login-trigger:hover {
  background: #f9fafb;
}

.site-nav--mobile {
  display: none;
}

.sub-nav-wrap {
  overflow: hidden;
  border-top: 1px solid #f3f4f6;
  transition: max-height 0.36s cubic-bezier(0.4, 0, 0.2, 1);
}

.sub-nav-inner {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.sub-nav {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-nav::-webkit-scrollbar {
  display: none;
}

.sub-nav__item {
  position: relative;
  flex-shrink: 0;
  padding: 12px 16px;
  color: #9ca3af;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
}

.sub-nav__item:hover {
  color: #1f2937;
}

.sub-nav__item.active {
  color: #111827;
  font-weight: 500;
}

.sub-nav__item.active::after {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 8px;
  height: 2px;
  border-radius: 999px;
  background: #f4830a;
  content: "";
}

.sub-nav__search {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: auto;
  padding-left: 16px;
  border-left: 1px solid #f3f4f6;
}

.sub-nav__search button {
  padding: 12px 0;
  color: #9ca3af;
  cursor: pointer;
}

.sub-nav__search button:hover {
  color: #4b5563;
}

.site-layout__main {
  flex: 1;
}

.site-footer {
  margin-top: 32px;
  border-top: 1px solid #f3f4f6;
  padding: 24px 0;
}

.site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.site-footer__links {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #9ca3af;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .site-nav--mobile {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding: 0 0 10px;
    scrollbar-width: none;
  }

  .site-nav--mobile::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 768px) {
  .site-header__inner {
    height: auto;
    min-height: 56px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .site-header__spacer {
    display: none;
  }

  .site-header__right {
    gap: 8px;
  }

  .login-trigger {
    padding: 6px 10px;
    font-size: 13px;
  }

  .site-nav--mobile {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding: 0 0 10px;
    scrollbar-width: none;
  }

  .site-nav--mobile::-webkit-scrollbar {
    display: none;
  }

  .site-nav--mobile .site-nav__item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .site-footer__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-footer__links {
    flex-wrap: wrap;
  }
}
</style>
