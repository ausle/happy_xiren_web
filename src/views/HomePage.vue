<template>
  <div>
    <section class="hero-section orange-gradient">
      <div class="page-shell">
        <div class="featured-grid">
          <article v-for="card in featuredCards" :key="card.id" class="featured-card">
            <div class="featured-card__image-wrap">
              <img :alt="card.title" :src="card.image" class="featured-card__image" />
            </div>
            <div class="featured-card__body">
              <p class="featured-card__title line-clamp-2">{{ card.title }}</p>
              <div class="featured-card__tags">
                <span v-for="tag in card.tags" :key="tag" class="featured-card__tag" :style="{ color: getTagColor(tag) }">
                  <span class="featured-card__dot" :style="{ background: getTagColor(tag) }" />
                  {{ tag }}
                </span>
              </div>
              <div class="featured-card__meta">{{ card.author }}，{{ card.date }}</div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div class="page-shell home-content">
      <div class="home-main">
        <section class="panel article-list">
          <template v-if="filteredArticles.length">
            <article v-for="article in filteredArticles" :key="article.id" class="article-item">
              <div class="article-item__content">
                <div class="article-item__head">
                  <span v-if="article.featured" class="article-item__badge">推荐</span>
                  <h3
                    class="article-item__title"
                    :class="{ featured: article.featured }"
                    @click="router.push(`/article/${article.id}`)"
                  >
                    {{ article.title }}
                  </h3>
                </div>
                <p class="article-item__summary line-clamp-2">{{ article.summary }}</p>
                <div class="article-item__meta">
                  <div class="article-item__author">
                    <BaseAvatar :initials="article.author.initials" :size="28" />
                    <span>{{ article.author.name }}</span>
                    <span class="dot-separator">·</span>
                    <span class="muted-text">{{ article.date }}</span>
                  </div>
                  <div class="article-item__stats">
                    <span><Eye :size="13" /> {{ article.views }}</span>
                    <span><MessageCircle :size="13" /> {{ article.comments }}</span>
                    <span><ThumbsUp :size="13" /> {{ article.likes }}</span>
                  </div>
                  <div class="article-item__tags">
                    <span
                      v-for="tag in article.tags"
                      :key="tag"
                      class="article-item__tag"
                      :style="{ background: `${getTagColor(tag)}15`, color: getTagColor(tag) }"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="article.thumbnail" class="article-item__thumb" @click="router.push(`/article/${article.id}`)">
                <img alt="" :src="article.thumbnail" />
              </div>
            </article>
            <div class="article-list__footer">
              <button class="article-list__more" type="button">加载更多</button>
            </div>
          </template>
          <div v-else class="article-list__empty">该分类暂无文章</div>
        </section>

        <aside class="home-sidebar desktop-only">
          <div class="panel sidebar-card">
            <h4 class="sidebar-card__title">关于喜人同乐</h4>
            <div class="sidebar-announcement" v-for="item in announcements" :key="item.id">
              <div class="sidebar-announcement__row">
                <div class="sidebar-announcement__title">
                  <span class="sidebar-announcement__badge">{{ item.tag }}</span>
                  <span>{{ item.title }}</span>
                </div>
                <button class="sidebar-announcement__btn" type="button">{{ item.btn }}</button>
              </div>
              <p class="sidebar-announcement__desc">{{ item.desc }}</p>
            </div>
          </div>

          <div class="sidebar-banner purple-gradient">
            <div class="sidebar-banner__title">🎉 春季写作活动</div>
            <p class="sidebar-banner__desc">参与活动，赢取精美周边 + 年度会员资格！截止 6 月 30 日。</p>
            <button class="sidebar-banner__btn" type="button">查看详情 →</button>
          </div>

          <div class="panel sidebar-card">
            <h4 class="sidebar-card__title">热门文章</h4>
            <div v-for="(item, index) in hotArticles" :key="item.id" class="sidebar-hot">
              <span class="sidebar-hot__index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <p class="sidebar-hot__title line-clamp-2">{{ item.title }}</p>
            </div>
          </div>

          <div class="sidebar-quick">
            <h4 class="sidebar-card__title">快速入口</h4>
            <div class="sidebar-quick__grid">
              <button v-for="item in quickEntries" :key="item.label" class="sidebar-quick__item" type="button">
                <span class="sidebar-quick__label">{{ item.label }}</span>
                <span class="sidebar-quick__desc">{{ item.desc }}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, MessageCircle, ThumbsUp } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import { announcements, articles, featuredCards, hotArticles } from "@/data/articles";
import { useUiStore } from "@/stores/ui";

const router = useRouter();
const uiStore = useUiStore();

const tagColors: Record<string, string> = {
  AI: "#8B5CF6",
  工具: "#3B82F6",
  效率: "#06B6D4",
  增长: "#10B981",
  实战: "#F59E0B",
  后端: "#6366F1",
  面试: "#EC4899",
  求职: "#14B8A6",
  简历: "#F97316",
  内容: "#EF4444",
  社区: "#84CC16",
  付费: "#A78BFA",
  一人公司: "#06B6D4",
  Agent: "#7C3AED",
  增长策略: "#10B981",
  变现方法: "#F59E0B",
  案例拆解: "#EC4899",
  工具推荐: "#3B82F6",
};

const quickEntries = [
  { label: "📚 学习路线", desc: "系统化路径" },
  { label: "💼 简历优化", desc: "免费模板" },
  { label: "🎯 项目实战", desc: "12 个项目" },
  { label: "💬 技术答疑", desc: "专家在线" },
];

const getTagColor = (tag: string) => tagColors[tag] ?? "#6B7280";

const filteredArticles = computed(() => {
  if (uiStore.activeCategory === "全部") {
    return articles;
  }

  return articles.filter(
    (item) => item.category === uiStore.activeCategory || item.tags.includes(uiStore.activeCategory),
  );
});
</script>

<style scoped>
.hero-section {
  padding: 32px 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.featured-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.featured-card:hover {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.featured-card__image-wrap {
  height: 144px;
  overflow: hidden;
}

.featured-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-card__body {
  padding: 12px;
}

.featured-card__title {
  margin: 0 0 8px;
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
}

.featured-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.featured-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.featured-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.featured-card__meta {
  color: #9ca3af;
  font-size: 11px;
}

.home-content {
  padding-top: 24px;
  padding-bottom: 24px;
}

.home-main {
  display: flex;
  gap: 24px;
}

.article-list {
  flex: 1;
  min-width: 0;
  padding: 0 20px;
}

.article-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.article-item:last-of-type {
  border-bottom: 0;
}

.article-item__content {
  flex: 1;
  min-width: 0;
}

.article-item__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.article-item__badge {
  margin-top: 2px;
  border-radius: 6px;
  background: #f59e0b;
  padding: 2px 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
}

.article-item__title {
  margin: 0;
  color: #111827;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.article-item__title:hover {
  opacity: 0.75;
}

.article-item__title.featured {
  color: #d97706;
}

.article-item__summary {
  margin: 0 0 10px;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.article-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.article-item__author {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 12px;
}

.dot-separator {
  color: #d1d5db;
}

.article-item__stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
}

.article-item__stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.article-item__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  flex-wrap: wrap;
}

.article-item__tag {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}

.article-item__thumb {
  width: 96px;
  height: 64px;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
}

.article-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-list__footer {
  padding: 16px 0;
  text-align: center;
}

.article-list__more {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 24px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.article-list__more:hover {
  border-color: #d1d5db;
  color: #374151;
}

.article-list__empty {
  padding: 64px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.home-sidebar {
  width: 256px;
  flex-shrink: 0;
}

.sidebar-card {
  padding: 16px;
  margin-bottom: 16px;
}

.sidebar-card__title {
  margin: 0 0 12px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.sidebar-announcement {
  padding-bottom: 12px;
  border-bottom: 1px solid #f9fafb;
  margin-bottom: 12px;
}

.sidebar-announcement:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: 0;
}

.sidebar-announcement__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-announcement__title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
}

.sidebar-announcement__badge,
.sidebar-announcement__btn {
  border-radius: 6px;
  background: #f59e0b;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
}

.sidebar-announcement__badge {
  padding: 2px 6px;
}

.sidebar-announcement__btn {
  padding: 4px 10px;
  font-size: 11px;
  cursor: pointer;
}

.sidebar-announcement__desc {
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.5;
}

.sidebar-banner {
  margin-bottom: 16px;
  border-radius: 16px;
  padding: 16px;
  color: #ffffff;
}

.sidebar-banner__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

.sidebar-banner__desc {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  line-height: 1.5;
}

.sidebar-banner__btn {
  width: 100%;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.sidebar-banner__btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-hot {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar-hot:last-child {
  margin-bottom: 0;
}

.sidebar-hot__index {
  display: inline-flex;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #d1d5db;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.sidebar-hot__index.top {
  background: #f59e0b;
}

.sidebar-hot__title {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.sidebar-quick {
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  background: #f9fafb;
  padding: 16px;
}

.sidebar-quick__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sidebar-quick__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  background: #ffffff;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sidebar-quick__item:hover {
  border-color: #e5e7eb;
}

.sidebar-quick__label {
  color: #374151;
  font-size: 12px;
  font-weight: 500;
}

.sidebar-quick__desc {
  color: #9ca3af;
  font-size: 11px;
}

@media (max-width: 1024px) {
  .home-main {
    display: block;
  }
}

@media (max-width: 900px) {
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .article-item {
    flex-direction: column;
  }

  .article-item__stats {
    margin-left: 0;
  }

  .article-item__tags {
    margin-left: 0;
  }
}
</style>
