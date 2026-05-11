<template>
  <div class="author-shell">
    <div class="author-hero">
      <div class="author-hero__bubble author-hero__bubble--large" />
      <div class="author-hero__bubble author-hero__bubble--small" />
    </div>

    <div class="page-shell author-wrap">
      <div class="panel author-card">
        <button class="back-button" type="button" @click="router.back()">
          <ArrowLeft :size="14" />
          返回
        </button>

        <div class="author-card__body">
          <img v-if="author.avatar" :src="author.avatar" :alt="author.name" class="author-card__image" />
          <BaseAvatar v-else :initials="author.initials" :size="64" />

          <div class="author-card__profile">
            <h1>{{ author.name }}</h1>
            <div class="author-card__location">
              <MapPin :size="12" />
              <span>IP属地：{{ author.ip }}</span>
            </div>
            <p>{{ author.bio }}</p>
          </div>

          <div class="author-card__stats">
            <div class="author-card__numbers">
              <div>
                <strong>{{ author.joinDays }}</strong>
                <span>加入天数</span>
              </div>
              <div class="divider" />
              <div>
                <strong>{{ author.followingCount }}</strong>
                <span>关注数</span>
              </div>
              <div class="divider" />
              <div>
                <strong>{{ followerCount }}</strong>
                <span>粉丝数</span>
              </div>
            </div>
            <button class="follow-button" :class="{ active: isFollowing }" type="button" @click="toggleFollow">
              <UserCheck v-if="isFollowing" :size="15" />
              <UserPlus v-else :size="15" />
              {{ isFollowing ? "已关注" : "关注" }}
            </button>
          </div>
        </div>
      </div>

      <div class="author-layout">
        <section class="panel author-main">
          <div class="tab-nav">
            <button v-for="item in tabs" :key="item.key" class="tab-nav__item" :class="{ active: activeTab === item.key }" type="button" @click="activeTab = item.key">
              {{ item.label }}
            </button>
          </div>

          <div class="tab-content">
            <template v-if="activeTab === 'articles'">
              <div v-if="authorArticles.length">
                <article v-for="article in authorArticles" :key="article.id" class="article-row">
                  <h3 class="article-row__title" :class="{ featured: article.featured }" @click="router.push(`/article/${article.id}`)">
                    <span v-if="article.featured" class="article-row__badge">推荐</span>
                    {{ article.title }}
                  </h3>
                  <p class="article-row__summary line-clamp-2">{{ article.summary }}</p>
                  <div class="article-row__meta">
                    <BaseAvatar :initials="article.author.initials" :size="24" />
                    <span>{{ article.author.name }}</span>
                    <span class="dot-separator">·</span>
                    <span class="muted-text">{{ article.date }}</span>
                    <span><Eye :size="13" /> {{ article.views }}</span>
                    <span><MessageCircle :size="13" /> {{ article.comments }}</span>
                    <span><ThumbsUp :size="13" /> {{ article.likes }}</span>
                    <div class="article-row__tags">
                      <span v-for="tag in article.tags" :key="tag" class="article-row__tag">{{ tag }}</span>
                    </div>
                  </div>
                </article>
              </div>
              <p v-else class="empty-state">暂无文章~</p>
            </template>

            <template v-else-if="activeTab === 'following'">
              <div class="follow-tabs">
                <button class="follow-tabs__item" :class="{ active: followTab === 'following' }" type="button" @click="followTab = 'following'">关注列表</button>
                <button class="follow-tabs__item" :class="{ active: followTab === 'followers' }" type="button" @click="followTab = 'followers'">粉丝列表</button>
              </div>
              <div class="follow-content">
                <p class="empty-state">{{ followStateText }}</p>
              </div>
            </template>

            <template v-else>
              <div v-if="bookmarkedArticles.length">
                <article v-for="article in bookmarkedArticles" :key="article.id" class="article-row">
                  <h3 class="article-row__title" @click="router.push(`/article/${article.id}`)">{{ article.title }}</h3>
                  <p class="article-row__summary line-clamp-2">{{ article.summary }}</p>
                  <div class="article-row__meta">
                    <BaseAvatar :initials="article.author.initials" :size="24" />
                    <span>{{ article.author.name }}</span>
                    <span class="dot-separator">·</span>
                    <span class="muted-text">{{ article.date }}</span>
                    <span><Eye :size="13" /> {{ article.views }}</span>
                    <span><MessageCircle :size="13" /> {{ article.comments }}</span>
                    <span><ThumbsUp :size="13" /> {{ article.likes }}</span>
                    <span class="article-row__tag">{{ article.tags[0] }}</span>
                  </div>
                </article>
              </div>
              <p v-else class="empty-state">暂无收藏~</p>
            </template>
          </div>
        </section>

        <aside class="author-sidebar desktop-only">
          <div class="panel sidebar-card">
            <h4>个人成就</h4>
            <div class="achievement-row" v-for="item in author.achievements" :key="item.label">
              <div class="achievement-row__left">
                <span class="achievement-row__icon" :style="{ background: `${item.color}18` }">{{ item.icon }}</span>
                <span class="achievement-row__label">{{ item.label }}</span>
              </div>
              <strong>{{ item.value }}</strong>
            </div>
          </div>

          <div v-if="author.history.length" class="panel sidebar-card">
            <h4>创造历程</h4>
            <div class="history-row" v-for="item in author.history" :key="item.year">
              <span>{{ item.year }}共发表文章</span>
              <strong>{{ item.count }} 篇</strong>
            </div>
          </div>

          <div class="sidebar-banner">
            <p class="sidebar-banner__title">🎉 粉丝动态</p>
            <p class="sidebar-banner__text">本周新增粉丝 <strong>12</strong> 人，继续加油！</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Eye, MapPin, MessageCircle, ThumbsUp, UserCheck, UserPlus } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import { articles } from "@/data/articles";
import { authors } from "@/data/authors";

const route = useRoute();
const router = useRouter();
const decodedName = computed(() => decodeURIComponent(String(route.params.name ?? "")));

const author = computed(() => authors[decodedName.value] ?? {
  name: decodedName.value,
  initials: decodedName.value[0] ?? "U",
  avatar: null,
  ip: "未知",
  bio: "点击添加简介，让大家认识你吧",
  joinDays: 1,
  followingCount: 0,
  followerCount: 0,
  achievements: [],
  history: [],
});

const isFollowing = ref(false);
const followerCount = ref(author.value.followerCount);
const activeTab = ref<"articles" | "following" | "bookmarks">("articles");
const followTab = ref<"following" | "followers">("following");

const tabs = [
  { key: "articles", label: "文章" },
  { key: "following", label: "关注" },
  { key: "bookmarks", label: "收藏" },
] as const;

const authorArticles = computed(() => articles.filter((item) => item.author.name === author.value.name));
const bookmarkedArticles = computed(() => authorArticles.value.slice(0, 2));
const followStateText = computed(() => {
  if (followTab.value === "following") {
    return author.value.followingCount === 0 ? "列表为空~" : "暂无更多数据";
  }
  return followerCount.value === 0 ? "列表为空~" : "暂无更多数据";
});

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
  followerCount.value += isFollowing.value ? 1 : -1;
};
</script>

<style scoped>
.author-shell {
  min-height: 100vh;
  background: #f9fafb;
}

.author-hero {
  position: relative;
  min-height: 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #f4830a 0%, #e8600a 60%, #ff9b6b 100%);
}

.author-hero__bubble {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
}

.author-hero__bubble--large {
  top: -32px;
  right: -32px;
  width: 160px;
  height: 160px;
  opacity: 0.2;
}

.author-hero__bubble--small {
  top: 16px;
  right: 128px;
  width: 80px;
  height: 80px;
  opacity: 0.15;
}

.author-wrap {
  padding-bottom: 48px;
}

.author-card {
  position: relative;
  z-index: 2;
  margin-top: -32px;
  padding: 24px 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
}

.author-card__body {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.author-card__image {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 0 0 4px #ffffff, 0 10px 18px rgba(15, 23, 42, 0.12);
}

.author-card__profile {
  flex: 1;
  min-width: 0;
}

.author-card__profile h1 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
}

.author-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #9ca3af;
  font-size: 12px;
}

.author-card__profile p {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
}

.author-card__stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  flex-shrink: 0;
}

.author-card__numbers {
  display: flex;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.author-card__numbers div {
  display: flex;
  flex-direction: column;
}

.author-card__numbers strong {
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.author-card__numbers span {
  color: #9ca3af;
  font-size: 12px;
}

.divider {
  width: 1px;
  height: 40px;
  background: #f3f4f6;
}

.follow-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f4830a 0%, #e8600a 100%);
  padding: 8px 20px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.follow-button.active {
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #6b7280;
}

.author-layout {
  display: flex;
  gap: 24px;
  margin-top: 24px;
}

.author-main {
  flex: 1;
  min-width: 0;
  padding: 20px 24px 8px;
}

.tab-nav {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.tab-nav__item {
  position: relative;
  padding-bottom: 12px;
  color: #9ca3af;
  font-size: 15px;
  cursor: pointer;
}

.tab-nav__item.active {
  color: #f4830a;
  font-weight: 600;
}

.tab-nav__item.active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: #f4830a;
  content: "";
}

.tab-content {
  padding-top: 8px;
}

.article-row {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.article-row__title {
  margin: 0 0 6px;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
}

.article-row__title.featured {
  color: #d97706;
}

.article-row__badge {
  display: inline-block;
  margin-right: 6px;
  border-radius: 6px;
  background: #f59e0b;
  padding: 2px 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
}

.article-row__summary {
  margin: 0 0 12px;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.6;
}

.article-row__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 12px;
}

.article-row__meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.article-row__tags {
  display: flex;
  gap: 6px;
  margin-left: auto;
  flex-wrap: wrap;
}

.article-row__tag {
  border-radius: 999px;
  background: #f3f4f6;
  padding: 2px 8px;
  color: #6b7280;
  font-size: 11px;
}

.follow-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.follow-tabs__item {
  position: relative;
  padding-bottom: 8px;
  color: #9ca3af;
  font-size: 14px;
  cursor: pointer;
}

.follow-tabs__item.active {
  color: #f4830a;
  font-weight: 600;
}

.follow-tabs__item.active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: #f4830a;
  content: "";
}

.follow-content {
  border-top: 1px solid #f3f4f6;
  padding-top: 24px;
}

.empty-state {
  padding: 32px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.author-sidebar {
  width: 240px;
  flex-shrink: 0;
}

.sidebar-card {
  margin-bottom: 16px;
  padding: 20px;
}

.sidebar-card h4 {
  margin: 0 0 16px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.achievement-row,
.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.achievement-row:last-child,
.history-row:last-child {
  margin-bottom: 0;
}

.achievement-row__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.achievement-row__icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.achievement-row__label,
.history-row span {
  color: #6b7280;
  font-size: 13px;
}

.achievement-row strong,
.history-row strong {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
}

.sidebar-banner {
  border-radius: 16px;
  background: linear-gradient(135deg, #f4830a 0%, #e8600a 100%);
  padding: 20px;
  color: #ffffff;
}

.sidebar-banner__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.sidebar-banner__text {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  line-height: 1.6;
}

.sidebar-banner__text strong {
  color: #ffffff;
}

@media (max-width: 1024px) {
  .author-card__body,
  .author-layout {
    display: block;
  }

  .author-card__stats {
    align-items: flex-start;
    margin-top: 16px;
  }
}
</style>
