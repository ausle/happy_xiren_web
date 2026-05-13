<template>
  <div class="article-page">
    <div class="page-shell article-page__shell">
      <button class="article-page__back" type="button" @click="router.back()">
        <ArrowLeft :size="15" />
        返回
      </button>

      <div v-if="loading" class="article-page__state">正在加载文章详情...</div>
      <div v-else-if="errorMessage" class="article-page__state article-page__state--error">
        {{ errorMessage }}
      </div>
      <article v-else-if="article" class="article-card panel">
        <div class="article-card__head">
          <div class="article-card__meta-row">
            <span v-if="article.category?.category" class="article-card__category">{{ article.category.category }}</span>
            <span v-for="tag in article.tags ?? []" :key="tag.tagId" class="article-card__tag">
              {{ tag.tag }}
            </span>
          </div>

          <h1 class="article-card__title">{{ article.title }}</h1>

          <p v-if="article.summary" class="article-card__summary">{{ article.summary }}</p>

          <div class="article-card__author">
            <img
              v-if="article.authorAvatar"
              :src="article.authorAvatar"
              :alt="article.authorName"
              class="article-card__avatar"
            />
            <BaseAvatar v-else :initials="authorInitials" :size="42" color="#d4a43a" rounded="999px" />
            <div>
              <div class="article-card__author-name">{{ article.authorName || "匿名作者" }}</div>
              <div class="article-card__author-meta">
                <span>{{ formatArticleDate(article.createTime ?? article.lastUpdateTime) }}</span>
                <span>阅读 {{ formatCount(article.count?.readCount) }}</span>
                <span>点赞 {{ formatCount(article.count?.praiseCount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <img v-if="article.cover" :src="article.cover" :alt="article.title" class="article-card__cover" />

        <div class="article-card__content markdown-body" v-html="article.content || ''"></div>
      </article>
      <div v-else class="article-page__state">文章不存在</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchArticleDetail } from "@/api/article";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import type { HomeArticle } from "@/types/home";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const article = ref<HomeArticle | null>(null);

const articleId = computed(() => Number(route.params.id));
const authorInitials = computed(() => {
  const name = article.value?.authorName?.trim();
  return name ? name.slice(0, 1).toUpperCase() : "U";
});

watch(
  () => route.params.id,
  () => {
    void loadArticle();
  },
);

onMounted(() => {
  void loadArticle();
});

async function loadArticle() {
  if (!Number.isFinite(articleId.value) || articleId.value <= 0) {
    article.value = null;
    errorMessage.value = "文章不存在";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    article.value = await fetchArticleDetail(articleId.value);
    if (!article.value) {
      errorMessage.value = "文章不存在";
    }
  } catch (error) {
    article.value = null;
    errorMessage.value = error instanceof Error ? error.message : "文章详情加载失败，请稍后重试。";
  } finally {
    loading.value = false;
  }
}

function formatArticleDate(timestamp?: number | null) {
  if (!timestamp) {
    return "刚刚";
  }

  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCount(value?: number | null) {
  if (!value) {
    return "0";
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`;
  }

  return `${value}`;
}
</script>

<style scoped>
.article-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 28px 0 42px;
}

.article-page__shell {
  max-width: 900px;
}

.article-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  color: #6b7280;
  font-size: 14px;
  transition: color 0.18s ease;
}

.article-page__back:hover {
  color: #111827;
}

.article-page__state {
  padding: 72px 0;
  color: #6b7280;
  font-size: 15px;
  text-align: center;
}

.article-page__state--error {
  color: #dc2626;
}

.article-card {
  padding: 34px 38px 42px;
}

.article-card__head {
  margin-bottom: 28px;
}

.article-card__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.article-card__category,
.article-card__tag {
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
}

.article-card__category {
  background: #111827;
  color: #ffffff;
}

.article-card__tag {
  background: #f3f4f6;
  color: #4b5563;
}

.article-card__title {
  margin: 0;
  color: #111827;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.25;
}

.article-card__summary {
  margin: 18px 0 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.9;
}

.article-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.article-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  object-fit: cover;
}

.article-card__author-name {
  color: #111827;
  font-size: 15px;
  font-weight: 600;
}

.article-card__author-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
  color: #9ca3af;
  font-size: 13px;
}

.article-card__cover {
  width: 100%;
  margin-bottom: 30px;
  border-radius: 20px;
  object-fit: cover;
}

.article-card__content {
  color: #1f2937;
  font-size: 16px;
  line-height: 1.95;
}

.article-card__content:deep(img) {
  max-width: 100%;
  border-radius: 16px;
}

.article-card__content:deep(pre) {
  overflow-x: auto;
  border-radius: 16px;
  background: #0f172a;
  padding: 18px;
  color: #e2e8f0;
}

.article-card__content:deep(code) {
  font-family: "IBM Plex Mono", Consolas, monospace;
}

.article-card__content:deep(blockquote) {
  margin: 20px 0;
  border-left: 4px solid #f97316;
  background: #fff7ed;
  padding: 12px 16px;
  color: #9a3412;
}

@media (max-width: 768px) {
  .article-page {
    padding-top: 18px;
  }

  .article-card {
    padding: 24px 20px 28px;
  }
}
</style>
