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
          <template v-if="authStore.loggedIn">
            <button class="write-trigger brand-gradient" type="button" @click="openArticleEditor">写文章</button>

            <div ref="userMenuRef" class="user-menu" :class="{ 'user-menu--open': userMenuOpen }">
              <button class="user-menu__trigger" type="button" @click="toggleUserMenu">
                <span class="user-menu__avatar">
                  <img
                    v-if="showPhotoAvatar"
                    :src="authStore.user?.photo"
                    :alt="authStore.user?.username"
                    class="user-menu__photo"
                    @error="avatarLoadError = true"
                  />
                  <BaseAvatar
                    v-else
                    :initials="authStore.initials"
                    :size="38"
                    color="#d4a43a"
                    rounded="999px"
                  />
                </span>
                <ChevronDown class="user-menu__chevron" :size="16" />
              </button>

              <div v-if="userMenuOpen" class="user-menu__dropdown panel">
                <button class="user-menu__item" type="button" @click="openAdminCenter">管理后台</button>
                <button class="user-menu__item" type="button" @click="openPersonalHome">个人主页</button>
                <button class="user-menu__item user-menu__item--danger" type="button" @click="logout">登出</button>
              </div>
            </div>
          </template>

          <button v-else-if="authStore.initialized" class="login-trigger" type="button" @click="uiStore.setLoginOpen(true)">
            登录
          </button>
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
import { ChevronDown } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import LoginDialog from "@/components/common/LoginDialog.vue";
import SiteLogo from "@/components/common/SiteLogo.vue";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";
const userMenuOpen = ref(false);
const avatarLoadError = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const backendOrigin = computed(() => {
  if (apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")) {
    return new URL(apiBaseUrl).origin;
  }

  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return isLocalHost ? "http://localhost:8080" : window.location.origin;
});

const showPhotoAvatar = computed(() => !!authStore.user?.photo && !avatarLoadError.value);
const adminHomeUrl = computed(() => `${backendOrigin.value}/admin`);
const personalHomeUrl = computed(() =>
  authStore.user ? `${backendOrigin.value}/user/home?userId=${authStore.user.userId}` : "",
);

watch(
  () => route.path,
  () => {
    userMenuOpen.value = false;
  },
);

watch(
  () => authStore.user?.photo,
  () => {
    avatarLoadError.value = false;
  },
);

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (userMenuRef.value?.contains(target)) return;
  userMenuOpen.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    userMenuOpen.value = false;
  }
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener");
};

const openArticleEditor = () => {
  const articleEditorUrl = router.resolve({ name: "write-article" }).href;
  window.open(articleEditorUrl, "_blank", "noopener");
};

const openAdminCenter = () => {
  userMenuOpen.value = false;
  openInNewTab(adminHomeUrl.value);
};

const openPersonalHome = () => {
  if (!personalHomeUrl.value) return;
  userMenuOpen.value = false;
  openInNewTab(personalHomeUrl.value);
};

const buildApiPath = (path: string) => `${apiBaseUrl.replace(/\/$/, "")}${path}`;

const logout = () => {
  userMenuOpen.value = false;
  authStore.clearUser();
  window.location.assign(buildApiPath("/logout"));
};

onMounted(() => {
  void authStore.fetchLoginStatus();
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
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

.login-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
}

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

.write-trigger {
  min-height: 36px;
  border-radius: 999px;
  padding: 0 16px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(244, 131, 10, 0.24);
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
}

.write-trigger:hover {
  box-shadow: 0 14px 28px rgba(244, 131, 10, 0.3);
  filter: saturate(1.03);
}

.write-trigger:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 8px 16px rgba(244, 131, 10, 0.2);
}

.user-menu {
  position: relative;
  flex-shrink: 0;
}

.user-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0;
  color: #6b7280;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.user-menu__trigger:hover,
.user-menu--open .user-menu__trigger {
  color: #111827;
}

.user-menu__avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(180deg, #f4e7ab 0%, #ccb66a 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.65),
    0 6px 14px rgba(15, 23, 42, 0.16);
}

.user-menu__photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-menu__chevron {
  flex-shrink: 0;
  color: inherit;
  transition: transform 0.2s ease;
}

.user-menu--open .user-menu__chevron {
  transform: rotate(180deg);
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: -10px;
  display: flex;
  min-width: 136px;
  flex-direction: column;
  gap: 0;
  padding: 10px 0;
  border: none;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.2);
}

.user-menu__dropdown::before {
  position: absolute;
  top: -8px;
  right: 22px;
  width: 16px;
  height: 16px;
  transform: rotate(45deg);
  border-radius: 2px;
  background: #ffffff;
  box-shadow: -2px -2px 8px rgba(15, 23, 42, 0.04);
  content: "";
}

.user-menu__item {
  position: relative;
  z-index: 1;
  padding: 8px 18px;
  color: #1f2937;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.user-menu__item:hover {
  background: #f8fafc;
}

.user-menu__item--danger {
  color: #b91c1c;
}

.user-menu__item--danger:hover {
  background: #fef2f2;
}

.site-nav--mobile {
  display: none;
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

  .write-trigger {
    min-height: 34px;
    padding: 0 12px;
    font-size: 12px;
  }

  .user-menu__trigger {
    gap: 5px;
  }

  .user-menu__avatar {
    width: 34px;
    height: 34px;
  }

  .user-menu__dropdown {
    right: -6px;
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
