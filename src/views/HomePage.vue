<template>
  <div>
    <section class="hero-section">
      <div class="page-shell">
        <div class="hero-panel">
          <div class="hero-panel__inner">
            <p class="hero-panel__eyebrow">PORTFOLIO</p>
            <h1 class="hero-panel__title">程序与想象</h1>
            <p class="hero-panel__description">
              我是 Chance，热爱编程，也喜欢把灵感做成真实可用的作品。这里记录设计、前后端实现，
              以及那些从想法走到落地的过程。
            </p>

            <div class="hero-panel__divider" />

            <div class="hero-card-grid">
              <article
                v-for="card in portfolioCards"
                :key="card.title"
                class="hero-card"
                :class="{ 'hero-card--clickable': !!card.href }"
                @click="openPortfolioCard(card)"
              >
                <div class="hero-card__top">
                  <p class="hero-card__label">{{ card.label }}</p>
                  <ArrowRight class="hero-card__arrow" :size="16" />
                </div>
                <h3 class="hero-card__title line-clamp-2">{{ card.title }}</h3>
                <p class="hero-card__summary line-clamp-2">{{ card.summary }}</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="hero-category-section">
      <div class="page-shell">
        <div class="hero-category-bar">
          <button
            v-for="category in articleCategories"
            :key="category"
            class="hero-category"
            :class="{ active: uiStore.activeCategory === category }"
            type="button"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <div class="page-shell home-content">
      <section class="article-list">
        <div v-if="loading" class="article-loading" aria-live="polite" aria-busy="true">
          <div class="article-loading__header">
            <span class="article-loading__eyebrow">CURATED POSTS</span>
            <p class="article-loading__title">正在整理这一页的文章</p>
          </div>

          <div class="article-grid article-grid--loading">
            <article
              v-for="placeholder in loadingPlaceholders"
              :key="placeholder"
              class="article-card article-card--skeleton"
            >
              <div class="article-card__image-wrap article-card__image-wrap--skeleton">
                <span class="article-skeleton article-skeleton--image" />
              </div>

              <div class="article-card__title-skeleton">
                <span class="article-skeleton article-skeleton--title article-skeleton--title-wide" />
                <span class="article-skeleton article-skeleton--title article-skeleton--title-narrow" />
              </div>

              <div class="article-card__summary-skeleton">
                <span class="article-skeleton article-skeleton--summary" />
                <span class="article-skeleton article-skeleton--summary article-skeleton--summary-short" />
              </div>

              <div class="article-card__meta">
                <span class="article-skeleton article-skeleton--meta" />
                <span class="article-skeleton article-skeleton--meta article-skeleton--meta-short" />
              </div>
            </article>
          </div>
        </div>

        <div v-else-if="errorMessage" class="article-list__state article-list__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="displayArticles.length">
          <div class="article-grid">
            <article
              v-for="(article, index) in displayArticles"
              :key="article.articleId"
              class="article-card"
              @click="openArticle(article)"
            >
              <div class="article-card__image-wrap">
                <img
                  :src="getArticleCover(article, index)"
                  :alt="article.title"
                  class="article-card__image"
                />
              </div>

              <h3 class="article-card__title line-clamp-2">{{ article.title }}</h3>
              <p class="article-card__summary">
                {{ article.summary || article.shortTitle || "暂无摘要" }}
              </p>

              <div class="article-card__meta">
                <span class="article-card__author">{{ article.authorName || "匿名作者" }}</span>
                <div class="article-card__meta-right">
                  <div v-if="getArticleTags(article).length" class="article-card__tags">
                    <span
                      v-for="tag in getArticleTags(article)"
                      :key="`${article.articleId}-${tag}`"
                      class="article-card__tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <span class="article-card__views">
                    <Eye :size="14" />
                    {{ formatCount(article.count?.readCount) }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <nav v-if="showPagination" class="pagination" aria-label="文章分页">
            <button class="pagination__item" :disabled="currentPage <= 1" type="button" @click="goToPage(1)">
              首页
            </button>
            <button class="pagination__item" :disabled="currentPage <= 1" type="button" @click="goToPage(currentPage - 1)">
              上一页
            </button>
            <button
              v-for="page in visiblePageNumbers"
              :key="page"
              class="pagination__item"
              :class="{ active: page === currentPage }"
              type="button"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button
              class="pagination__item"
              :disabled="currentPage >= pageTotal"
              type="button"
              @click="goToPage(currentPage + 1)"
            >
              下一页
            </button>
            <button class="pagination__item" :disabled="currentPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
              尾页
            </button>
          </nav>
        </template>

        <div v-else class="article-list__state">
          {{ currentCategoryLabel }} 暂无文章
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Eye } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchCategoryArticles, fetchHomeIndex } from "@/api/home";
import { DEFAULT_HOME_CATEGORY, useUiStore } from "@/stores/ui";
import type { CategoryArticleListResponse, HomeArticle } from "@/types/home";

interface PortfolioCard {
  label: string;
  title: string;
  summary: string;
  href?: string;
}

const DEFAULT_PAGE_SIZE = 12;
const MAX_VISIBLE_PAGES = 7;

const uiStore = useUiStore();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const displayArticles = ref<HomeArticle[]>([]);
const currentPage = ref(1);
const pageSize = ref(DEFAULT_PAGE_SIZE);
const total = ref(0);
const skipNextCategoryWatch = ref(false);
const loadingPlaceholders = Array.from({ length: DEFAULT_PAGE_SIZE }, (_, index) => index);

const portfolioCards: PortfolioCard[] = [
  {
    label: "COLLECTION",
    title: "Vibe Coding 开发指北",
    summary: "记录从灵感、设计到网页落地的真实开发过程。",
  },
  {
    label: "WORKS",
    title: "值得反复研究的网站作品",
    summary: "整理独立开发、网页设计与视觉表达相关的优质项目。",
  },
  {
    label: "GITHUB",
    title: "开源仓库",
    summary: "沉淀模板、工具和实验性小项目，持续更新中。",
  },
];

const articleCategories = computed(() => {
  const categories = uiStore.homeCategoryNames.filter(Boolean);
  return categories.length ? categories : [DEFAULT_HOME_CATEGORY];
});

const currentCategoryLabel = computed(() => uiStore.activeCategory || DEFAULT_HOME_CATEGORY);
const pageTotal = computed(() => {
  if (pageSize.value <= 0) {
    return 0;
  }

  return Math.ceil(total.value / pageSize.value);
});
const showPagination = computed(() => pageTotal.value > 1);
const visiblePageNumbers = computed(() => {
  const totalPages = pageTotal.value;
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(MAX_VISIBLE_PAGES / 2);
  let start = Math.max(1, currentPage.value - half);
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

watch(
  () => uiStore.activeCategory,
  (category) => {
    if (!category) {
      return;
    }

    if (skipNextCategoryWatch.value) {
      skipNextCategoryWatch.value = false;
      return;
    }

    void loadCategoryPage(category, 1);
  },
);

onMounted(() => {
  void initHomePage();
});

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function initHomePage() {
  try {
    const response = await fetchHomeIndex();
    const currentCategory =
      response.currentCategory ||
      response.categories?.find((item) => item.selected)?.category ||
      response.categories?.[0]?.category ||
      DEFAULT_HOME_CATEGORY;

    skipNextCategoryWatch.value = true;
    uiStore.setHomeCategories(response.categories ?? [], currentCategory);
    await loadCategoryPage(currentCategory, 1);
    skipNextCategoryWatch.value = false;
  } catch (error) {
    errorMessage.value = resolveErrorMessage(error, "首页数据加载失败，请稍后重试。");
  }
}

async function loadCategoryPage(category: string, page: number) {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetchCategoryArticles(category, page, DEFAULT_PAGE_SIZE);
    applyCategoryResponse(response);
  } catch (error) {
    errorMessage.value = resolveErrorMessage(error, "分类文章加载失败，请稍后重试。");
  } finally {
    loading.value = false;
  }
}

function applyCategoryResponse(response: CategoryArticleListResponse) {
  const nextPageSize = Math.max(1, Number(response.pageSize ?? DEFAULT_PAGE_SIZE));
  const nextTotal = Math.max(0, Number(response.total ?? 0));
  const nextPageTotal = Math.ceil(nextTotal / nextPageSize);
  const nextPageNum = Math.max(1, Number(response.pageNum ?? 1));

  displayArticles.value = response.articles?.list ?? [];
  pageSize.value = nextPageSize;
  total.value = nextTotal;
  currentPage.value = nextPageTotal > 0 ? Math.min(nextPageNum, nextPageTotal) : 1;
}

function goToPage(page: number) {
  if (page < 1 || page > pageTotal.value || page === currentPage.value || loading.value) {
    return;
  }
  void loadCategoryPage(currentCategoryLabel.value, page);
}

function selectCategory(category: string) {
  if (category === uiStore.activeCategory || loading.value) {
    return;
  }
  uiStore.setActiveCategory(category);
}

function getArticleTags(article: HomeArticle) {
  const tags = article.tags?.map((tag) => tag.tag).filter(Boolean) ?? [];
  if (tags.length) {
    return tags;
  }
  return article.category?.category ? [article.category.category] : [];
}

function openPortfolioCard(card: PortfolioCard) {
  if (!card.href) {
    return;
  }
  window.open(card.href, "_blank", "noopener");
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

function getArticleDisplayType(article: HomeArticle) {
  const tag = getArticleTags(article)[0];
  const mapping: Record<string, string> = {
    后端: "Backend",
    前端: "Frontend",
    Java: "Article",
    AI: "Article",
    架构: "Architecture",
    源码: "Source",
  };
  return `- ${mapping[tag ?? ""] ?? "Article"} -`;
}

function getArticleCover(article: HomeArticle, index: number) {
  if (article.cover) {
    return article.cover;
  }

  const palette = [
    ["#101827", "#7c3aed", "#22d3ee"],
    ["#201515", "#f97316", "#fb7185"],
    ["#0f172a", "#38bdf8", "#a78bfa"],
    ["#111827", "#f59e0b", "#f472b6"],
  ][index % 4];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 780">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="55%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="780" rx="40" fill="url(#bg)" />
      <circle cx="1030" cy="160" r="160" fill="rgba(255,255,255,0.10)" />
      <circle cx="240" cy="620" r="220" fill="rgba(255,255,255,0.08)" />
      <path d="M70 520 C 260 410, 410 330, 640 430 S 980 590, 1150 430" stroke="rgba(255,255,255,0.72)" stroke-width="18" fill="none" stroke-linecap="round"/>
      <text x="78" y="110" fill="rgba(255,255,255,0.96)" font-size="40" font-family="Inter, Arial, sans-serif">${getArticleDisplayType(article).replace(/&/g, "&amp;")}</text>
      <text x="78" y="660" fill="rgba(255,255,255,0.16)" font-size="150" font-weight="700" font-family="Inter, Arial, sans-serif">${article.title.slice(0, 10).replace(/&/g, "&amp;")}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function openArticle(article: HomeArticle) {
  void router.push({
    name: "article",
    params: {
      id: article.articleId,
      slug: article.urlSlug || undefined,
    },
  });
}
</script>

<style scoped>
.hero-section {
  padding: 42px 0 10px;
}

.hero-panel {
  background: #ffffff;
  padding: 34px 0 12px;
}

.hero-panel::after {
  content: none;
}

.hero-panel__inner {
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}

.hero-panel__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin: 0;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 999px;
  padding: 0 18px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-panel__title {
  margin: 28px 0 18px;
  color: #111827;
  font-family: "Noto Serif SC", "Songti SC", "STSong", serif;
  font-size: clamp(46px, 7vw, 78px);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1.04;
}

.hero-panel__description {
  max-width: 760px;
  margin: 0 auto;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.95;
}

.hero-panel__divider {
  width: min(100%, 292px);
  height: 1px;
  margin: 28px auto 0;
  background: linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.34) 20%, rgba(148, 163, 184, 0.34) 80%, transparent 100%);
}

.hero-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
}

.hero-card {
  display: flex;
  min-height: 128px;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  padding: 16px 18px 18px;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  backdrop-filter: blur(10px);
}

.hero-card--clickable {
  cursor: pointer;
}

.hero-card:hover {
  transform: translateY(-3px);
  border-color: rgba(249, 115, 22, 0.2);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.06);
}

.hero-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-card__label {
  margin: 0;
  color: #7c6f64;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.hero-card__arrow {
  flex-shrink: 0;
  color: #9ca3af;
  transition: transform 0.2s ease, color 0.2s ease;
}

.hero-card:hover .hero-card__arrow {
  transform: translateX(2px);
  color: #111827;
}

.hero-card__title {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
}

.hero-card__summary {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.75;
}

.hero-category-section {
  padding: 8px 0 0;
  background: #ffffff;
}

.hero-category-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 0 22px;
  border-bottom: 1px solid #ececec;
}

.hero-category {
  min-height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  padding: 0 18px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.hero-category:hover,
.hero-category.active {
  color: #111827;
  border-color: #111827;
  transform: translateY(-1px);
}

.hero-category.active {
  background: #111827;
  color: #ffffff;
}

.home-content {
  padding-top: 28px;
  padding-bottom: 36px;
  background: #ffffff;
}

.article-list {
  padding: 0;
}

.article-loading {
  display: grid;
  gap: 24px;
}

.article-loading__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.article-loading__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 999px;
  padding: 0 14px;
  color: #7c6f64;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.article-loading__title {
  margin: 0;
  color: #4b5563;
  font-family: "Noto Serif SC", "Songti SC", "STSong", serif;
  font-size: 20px;
  line-height: 1.5;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 34px 30px;
}

.article-grid--loading {
  gap: 30px;
}

.article-card {
  min-width: 0;
  cursor: pointer;
}

.article-card--skeleton {
  cursor: default;
}

.article-card__image-wrap {
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 16px;
  background: #f8fafc;
  aspect-ratio: 1.48 / 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.article-card__image-wrap--skeleton {
  border-color: rgba(148, 163, 184, 0.12);
  box-shadow: none;
}

.article-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.38s ease, filter 0.38s ease;
}

.article-card:hover .article-card__image {
  transform: scale(1.06);
  filter: saturate(1.08);
}

.article-card__title {
  margin: 14px 0 8px;
  color: #111827;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
}

.article-card__summary {
  margin: 0;
  display: -webkit-box;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
  min-height: calc(1.7em * 3);
  max-height: calc(1.7em * 3);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.article-card__meta {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: #6b7280;
  font-size: 13px;
}

.article-card__author {
  min-width: 0;
}

.article-card__meta-right {
  display: inline-flex;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.article-card__tags {
  display: flex;
  max-width: 140px;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  text-align: right;
}

.article-card__tag {
  color: #7c6f64;
  font-size: 12px;
  line-height: 1.35;
}

.article-card__views {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.article-card__title-skeleton,
.article-card__summary-skeleton {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.article-skeleton {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.72) 0%, rgba(241, 245, 249, 0.98) 50%, rgba(226, 232, 240, 0.72) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.35s ease-in-out infinite;
}

.article-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.46) 50%, transparent 100%);
  transform: translateX(-100%);
  animation: sweep 1.35s ease-in-out infinite;
}

.article-skeleton--image {
  width: 100%;
  height: 100%;
  border-radius: 16px;
}

.article-skeleton--title {
  height: 18px;
}

.article-skeleton--title-wide {
  width: 88%;
}

.article-skeleton--title-narrow {
  width: 62%;
}

.article-skeleton--summary {
  height: 14px;
  width: 100%;
}

.article-skeleton--summary-short {
  width: 74%;
}

.article-skeleton--meta {
  width: 92px;
  height: 14px;
}

.article-skeleton--meta-short {
  width: 68px;
}

.article-list__state {
  padding: 64px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.article-list__state--error {
  color: #dc2626;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 42px;
}

.pagination__item {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0 14px;
  background: transparent;
  color: #4b5563;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.pagination__item:hover:not(:disabled) {
  transform: translateY(-1px);
  color: #111827;
}

.pagination__item.active {
  background: #5d6776;
  color: #ffffff;
}

.pagination__item:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@keyframes sweep {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1024px) {
  .hero-card-grid {
    grid-template-columns: 1fr;
  }

  .article-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero-panel {
    padding: 28px 0 10px;
  }
}

@media (max-width: 768px) {
  .hero-panel__title {
    margin-top: 24px;
    font-size: clamp(38px, 14vw, 58px);
  }

  .hero-panel__description {
    font-size: 15px;
    line-height: 1.9;
  }

  .hero-card-grid {
    gap: 12px;
  }

  .article-loading {
    gap: 20px;
  }

  .article-loading__title {
    font-size: 18px;
  }

  .pagination {
    gap: 8px;
  }

  .pagination__item {
    min-width: 40px;
    min-height: 40px;
    font-size: 14px;
    padding: 0 12px;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding-top: 18px;
  }

  .hero-panel {
    border-radius: 26px;
    padding: 34px 18px 18px;
  }

  .hero-panel__eyebrow {
    min-height: 36px;
    padding: 0 14px;
  }

  .hero-panel__description {
    font-size: 14px;
  }

  .hero-category-section {
    padding-top: 14px;
  }

  .hero-category-bar {
    gap: 10px;
    padding-bottom: 18px;
  }

  .hero-category {
    min-height: 38px;
    padding: 0 14px;
    font-size: 13px;
  }

  .hero-card {
    min-height: 118px;
    border-radius: 18px;
    padding: 14px 16px 16px;
  }

  .hero-card__title {
    font-size: 16px;
  }

  .article-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .article-loading__title {
    font-size: 17px;
  }
}
</style>
