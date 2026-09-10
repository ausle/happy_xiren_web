<template>
  <div>
    <section class="hero-section">
      <div class="page-shell">
        <div class="hero-panel">
          <div class="hero-panel__inner">
            <div class="hero-panel__copy">
              <p class="hero-panel__eyebrow">PORTFOLIO / LAB NOTES</p>
              <h1 class="hero-panel__title">把灵感做成真正能跑的作品</h1>
              <p class="hero-panel__description">
                我是 Chance，喜欢把编程、设计和内容实验串起来。这里记录从想法、原型、前后端实现，
                到上线复盘的完整过程。
              </p>

              <div class="hero-panel__metrics" aria-label="站点内容概览">
                <div v-for="metric in heroMetrics" :key="metric.label" class="hero-panel__metric">
                  <strong>{{ metric.value }}</strong>
                  <span>{{ metric.label }}</span>
                </div>
              </div>
            </div>

            <div class="hero-panel__visual">
              <img
                class="hero-panel__photo"
                :src="activeHeroSlide.image"
                :alt="activeHeroSlide.alt"
              />
              <button
                class="hero-carousel__nav hero-carousel__nav--prev"
                type="button"
                aria-label="上一张轮播图"
                @click="showPreviousHeroSlide"
              >
                ‹
              </button>
              <button
                class="hero-carousel__nav hero-carousel__nav--next"
                type="button"
                aria-label="下一张轮播图"
                @click="showNextHeroSlide"
              >
                ›
              </button>
              <div class="hero-panel__photo-caption">
                <span class="hero-panel__photo-dot" />
                <div>
                  <strong>{{ activeHeroSlide.title }}</strong>
                  <small>{{ activeHeroSlide.subtitle }}</small>
                </div>
              </div>
              <div class="hero-carousel__dots" aria-label="首页图片轮播">
                <button
                  v-for="(slide, index) in heroSlides"
                  :key="slide.title"
                  class="hero-carousel__dot"
                  :class="{ active: index === activeHeroSlideIndex }"
                  type="button"
                  :aria-label="`切换到 ${slide.title}`"
                  @click="setHeroSlide(index)"
                />
              </div>
            </div>
          </div>

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

          <div ref="bottomSentinel" class="article-list__sentinel" aria-hidden="true" />

          <div
            v-if="loadingMore"
            class="article-list__load-more"
            aria-live="polite"
            aria-busy="true"
          >
            <span class="article-list__spinner" />
            <span>正在加载更多文章...</span>
          </div>

          <div v-else-if="loadMoreErrorMessage" class="article-list__load-more article-list__load-more--error">
            {{ loadMoreErrorMessage }}
          </div>

          <div v-else-if="!hasMoreArticles" class="article-list__load-more article-list__load-more--end">
            没有更多文章了
          </div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchCategoryArticles, fetchHomeIndex } from "@/api/home";
import heroCarouselGamingUrl from "@/assets/hero-carousel-gaming.webp";
import heroCarouselLifeUrl from "@/assets/hero-carousel-life.webp";
import heroCarouselLoveUrl from "@/assets/hero-carousel-love.webp";
import heroCarouselNightCodeUrl from "@/assets/hero-carousel-night-code.webp";
import heroCarouselOutdoorUrl from "@/assets/hero-carousel-outdoor.webp";
import heroCarouselReadingUrl from "@/assets/hero-carousel-reading.webp";
import heroCarouselTravelUrl from "@/assets/hero-carousel-travel.webp";
import heroCarouselWorkUrl from "@/assets/hero-carousel-work.webp";
import { DEFAULT_HOME_CATEGORY, useUiStore } from "@/stores/ui";
import type { CategoryArticleListResponse, HomeArticle } from "@/types/home";

interface PortfolioCard {
  label: string;
  title: string;
  summary: string;
  href?: string;
}

const DEFAULT_PAGE_SIZE = 10;

const uiStore = useUiStore();
const router = useRouter();
const loading = ref(false);
const loadingMore = ref(false);
const errorMessage = ref("");
const loadMoreErrorMessage = ref("");
const displayArticles = ref<HomeArticle[]>([]);
const currentPage = ref(1);
const pageSize = ref(DEFAULT_PAGE_SIZE);
const total = ref(0);
const hasMoreArticles = ref(false);
const skipNextCategoryWatch = ref(false);
const bottomSentinel = ref<HTMLElement | null>(null);
const loadingPlaceholders = Array.from({ length: DEFAULT_PAGE_SIZE }, (_, index) => index);
const activeHeroSlideIndex = ref(0);
let activeCategoryRequestId = 0;
let bottomObserver: IntersectionObserver | null = null;
let heroCarouselTimer: number | undefined;

const heroMetrics = [
  { value: "Works", label: "项目作品" },
  { value: "Notes", label: "开发手记" },
  { value: "Ship", label: "持续迭代" },
];

const heroSlides = [
  {
    image: heroCarouselWorkUrl,
    title: "Coding Mode",
    subtitle: "typing code in daylight",
    alt: "动漫风年轻开发者穿白色上衣和蓝色外套，在明亮工作台前敲代码",
  },
  {
    image: heroCarouselLifeUrl,
    title: "Cafe Reset",
    subtitle: "quiet coffee and notebook",
    alt: "动漫风咖啡馆桌面静物，有咖啡、笔记本和电脑",
  },
  {
    image: heroCarouselTravelUrl,
    title: "Travel Notes",
    subtitle: "ideas collected on the road",
    alt: "动漫风年轻男性穿米色外套，背包站在明亮旅行场景中",
  },
  {
    image: heroCarouselGamingUrl,
    title: "Game Night",
    subtitle: "playful focus after work",
    alt: "动漫风年轻男性穿红黑夹克，在夜晚游戏房中打游戏",
  },
  {
    image: heroCarouselLoveUrl,
    title: "With Love",
    subtitle: "a warm walk at blue hour",
    alt: "动漫风年轻男性穿奶油色毛衣，与爱人在傍晚街道散步",
  },
  {
    image: heroCarouselReadingUrl,
    title: "Study Desk",
    subtitle: "books, rain and quiet growth",
    alt: "动漫风无人图书馆学习桌，有书、电脑和暖色台灯",
  },
  {
    image: heroCarouselOutdoorUrl,
    title: "Fresh Air",
    subtitle: "weekend energy outside",
    alt: "动漫风年轻男性穿绿色户外夹克，在公园或山坡上微笑",
  },
  {
    image: heroCarouselNightCodeUrl,
    title: "Night Build",
    subtitle: "late code and city lights",
    alt: "动漫风年轻男性穿黑色高领，在夜晚桌前敲代码",
  },
];

const activeHeroSlide = computed(() => heroSlides[activeHeroSlideIndex.value] ?? heroSlides[0]);

const portfolioCards: PortfolioCard[] = [
  {
    label: "COLLECTION",
    title: "Vibe Coding 开发手记",
    summary: "记录从灵感、设计到网页落地的真实开发过程。",
  },
  {
    label: "WORKS",
    title: "值得反复研究的网站作品",
    summary: "整理独立开发、网页设计与视觉表达相关的优质项目。",
  },
  {
    label: "GITHUB",
    title: "开源仓库与小工具",
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

watch(
  [bottomSentinel, hasMoreArticles, loading, loadingMore, () => displayArticles.value.length],
  async () => {
    await nextTick();
    syncBottomObserver();
  },
  { flush: "post" },
);

onMounted(() => {
  // clearHomeLocalStorage();
  void initHomePage();
  startHeroCarousel();
});

onBeforeUnmount(() => {
  disconnectBottomObserver();
  stopHeroCarousel();
});

// function clearHomeLocalStorage() {
//   try {
//     window.localStorage.clear();
//   } catch {
//     // Ignore storage access failures so the home page can still render.
//   }
// }

function startHeroCarousel() {
  stopHeroCarousel();
  heroCarouselTimer = window.setInterval(() => {
    activeHeroSlideIndex.value = (activeHeroSlideIndex.value + 1) % heroSlides.length;
  }, 4200);
}

function stopHeroCarousel() {
  if (heroCarouselTimer) {
    window.clearInterval(heroCarouselTimer);
    heroCarouselTimer = undefined;
  }
}

function setHeroSlide(index: number) {
  activeHeroSlideIndex.value = index;
  startHeroCarousel();
}

function showPreviousHeroSlide() {
  activeHeroSlideIndex.value =
    (activeHeroSlideIndex.value - 1 + heroSlides.length) % heroSlides.length;
  startHeroCarousel();
}

function showNextHeroSlide() {
  activeHeroSlideIndex.value = (activeHeroSlideIndex.value + 1) % heroSlides.length;
  startHeroCarousel();
}

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

async function loadCategoryPage(category: string, page: number, append = false) {
  const requestId = ++activeCategoryRequestId;

  if (append) {
    loadingMore.value = true;
    loadMoreErrorMessage.value = "";
  } else {
    loading.value = true;
    loadingMore.value = false;
    errorMessage.value = "";
    loadMoreErrorMessage.value = "";
  }

  try {
    const response = await fetchCategoryArticles(category, page, DEFAULT_PAGE_SIZE);
    if (requestId !== activeCategoryRequestId) {
      return;
    }

    applyCategoryResponse(response, append);
  } catch (error) {
    if (requestId !== activeCategoryRequestId) {
      return;
    }

    if (append) {
      loadMoreErrorMessage.value = resolveErrorMessage(error, "更多文章加载失败，请稍后重试。");
      return;
    }

    displayArticles.value = [];
    hasMoreArticles.value = false;
    total.value = 0;
    currentPage.value = 1;
    errorMessage.value = resolveErrorMessage(error, "分类文章加载失败，请稍后重试。");
  } finally {
    if (requestId !== activeCategoryRequestId) {
      return;
    }

    if (append) {
      loadingMore.value = false;
    } else {
      loading.value = false;
    }
  }
}

function applyCategoryResponse(response: CategoryArticleListResponse, append: boolean) {
  const nextPageSize = Math.max(1, Number(response.pageSize ?? DEFAULT_PAGE_SIZE));
  const nextTotal = Math.max(0, Number(response.total ?? 0));
  const nextPageTotal = Math.ceil(nextTotal / nextPageSize);
  const nextPageNum = Math.max(1, Number(response.pageNum ?? 1));
  const nextArticles = response.articles?.list ?? [];

  displayArticles.value = append ? mergeArticles(displayArticles.value, nextArticles) : nextArticles;
  pageSize.value = nextPageSize;
  total.value = nextTotal;
  currentPage.value = nextPageTotal > 0 ? Math.min(nextPageNum, nextPageTotal) : 1;
  hasMoreArticles.value =
    typeof response.articles?.hasMore === "boolean"
      ? response.articles.hasMore
      : currentPage.value < nextPageTotal;
}

function mergeArticles(currentArticles: HomeArticle[], nextArticles: HomeArticle[]) {
  const articleMap = new Map<number, HomeArticle>();

  currentArticles.forEach((article) => {
    articleMap.set(article.articleId, article);
  });

  nextArticles.forEach((article) => {
    articleMap.set(article.articleId, article);
  });

  return Array.from(articleMap.values());
}

function loadNextPage() {
  if (loading.value || loadingMore.value || !hasMoreArticles.value) {
    return;
  }

  const nextPage = currentPage.value + 1;
  if (pageTotal.value > 0 && nextPage > pageTotal.value) {
    hasMoreArticles.value = false;
    return;
  }

  void loadCategoryPage(currentCategoryLabel.value, nextPage, true);
}

function selectCategory(category: string) {
  if (category === uiStore.activeCategory || loading.value || loadingMore.value) {
    return;
  }
  uiStore.setActiveCategory(category);
}

function disconnectBottomObserver() {
  bottomObserver?.disconnect();
  bottomObserver = null;
}

function syncBottomObserver() {
  disconnectBottomObserver();

  if (
    typeof window === "undefined" ||
    typeof IntersectionObserver === "undefined" ||
    !bottomSentinel.value ||
    !displayArticles.value.length ||
    !hasMoreArticles.value ||
    loading.value ||
    loadingMore.value
  ) {
    return;
  }

  bottomObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNextPage();
      }
    },
    {
      rootMargin: "0px 0px 180px 0px",
      threshold: 0.1,
    },
  );

  bottomObserver.observe(bottomSentinel.value);
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
  padding: 36px 0 12px;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 32px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 247, 255, 0.9) 58%, rgba(236, 253, 245, 0.9) 100%);
  padding: 46px 46px 34px;
  box-shadow: 0 28px 70px rgba(18, 19, 26, 0.1);
}

.hero-panel::before {
  position: absolute;
  inset: auto -12% -38% 42%;
  height: 420px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.14), transparent 62%);
  content: "";
  pointer-events: none;
}

.hero-panel__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr);
  align-items: center;
  gap: 40px;
}

.hero-panel__copy {
  min-width: 0;
}

.hero-panel__eyebrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin: 0;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.07);
  padding: 0 16px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-panel__title {
  max-width: 720px;
  margin: 26px 0 18px;
  color: var(--text-primary);
  font-size: clamp(44px, 5.8vw, 76px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.98;
}

.hero-panel__description {
  max-width: 620px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.9;
}

.hero-panel__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.hero-panel__metric {
  min-width: 112px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.68);
  padding: 14px 16px;
  box-shadow: 0 12px 26px rgba(18, 19, 26, 0.06);
}

.hero-panel__metric strong,
.hero-panel__metric span {
  display: block;
}

.hero-panel__metric strong {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.hero-panel__metric span {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.hero-panel__visual {
  position: relative;
  aspect-ratio: 3 / 2;
  min-height: 0;
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 26px 64px rgba(18, 19, 26, 0.16);
}

.hero-panel__photo {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 52% 48%;
  filter: saturate(1.02) contrast(1.01);
  animation: hero-image-in 0.45s ease both;
}

.hero-carousel__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: rgba(18, 19, 26, 0.78);
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 12px 28px rgba(18, 19, 26, 0.14);
  backdrop-filter: blur(16px);
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.hero-carousel__nav:hover {
  transform: translateY(-50%) scale(1.06);
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-primary);
}

.hero-carousel__nav--prev {
  left: 16px;
}

.hero-carousel__nav--next {
  right: 16px;
}

.hero-panel__photo-caption {
  position: absolute;
  right: 18px;
  bottom: 48px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  max-width: calc(100% - 36px);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  padding: 12px 14px;
  box-shadow: 0 16px 34px rgba(18, 19, 26, 0.16);
  backdrop-filter: blur(18px);
}

.hero-carousel__dots {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, 0.68);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 10px;
  box-shadow: 0 12px 28px rgba(18, 19, 26, 0.12);
  backdrop-filter: blur(16px);
}

.hero-carousel__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(18, 19, 26, 0.24);
  cursor: pointer;
  transition: width 0.2s ease, background-color 0.2s ease;
}

.hero-carousel__dot.active {
  width: 22px;
  background: #2563eb;
}

.hero-panel__photo-dot {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #16a34a;
  box-shadow: 0 0 0 7px rgba(22, 163, 74, 0.14);
}

.hero-panel__photo-caption strong,
.hero-panel__photo-caption small {
  display: block;
}

.hero-panel__photo-caption strong {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.hero-panel__photo-caption small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@keyframes hero-image-in {
  from {
    opacity: 0;
    transform: scale(1.015);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-panel__divider {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 1px;
  margin: 34px 0 0;
  background: linear-gradient(90deg, transparent 0%, rgba(18, 19, 26, 0.12) 16%, rgba(18, 19, 26, 0.12) 84%, transparent 100%);
}

.hero-card-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 26px;
}

.hero-card {
  display: flex;
  min-height: 142px;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.66);
  padding: 18px 20px 20px;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  backdrop-filter: blur(14px);
}

.hero-card--clickable {
  cursor: pointer;
}

.hero-card:hover {
  transform: translateY(-4px);
  border-color: rgba(37, 99, 235, 0.18);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 38px rgba(37, 99, 235, 0.1);
}

.hero-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-card__label {
  margin: 0;
  color: #2563eb;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 800;
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
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.45;
}

.hero-card__summary {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.75;
}

.hero-category-section {
  padding: 10px 0 0;
  background: transparent;
}

.hero-category-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(18, 19, 26, 0.08);
  padding: 0 0 22px;
}

.hero-category {
  min-height: 40px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 999px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.64);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.hero-category:hover,
.hero-category.active {
  color: #111827;
  border-color: rgba(37, 99, 235, 0.24);
  background: #ffffff;
  transform: translateY(-1px);
}

.hero-category.active {
  border-color: #12131a;
  background: #12131a;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(18, 19, 26, 0.14);
}

.home-content {
  padding-top: 30px;
  padding-bottom: 44px;
  background: transparent;
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
  gap: 26px;
}

.article-grid--loading {
  gap: 30px;
}

.article-card {
  min-width: 0;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  padding: 12px;
  box-shadow: 0 14px 34px rgba(18, 19, 26, 0.06);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background-color 0.22s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  border-color: rgba(37, 99, 235, 0.16);
  background: #ffffff;
  box-shadow: 0 22px 46px rgba(18, 19, 26, 0.11);
}

.article-card--skeleton {
  cursor: default;
}

.article-card__image-wrap {
  overflow: hidden;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 18px;
  background: #f8fafc;
  aspect-ratio: 1.48 / 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.54);
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
  margin: 14px 4px 8px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
  min-height: calc(1.45em * 2);
  max-height: calc(1.45em * 2);
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.article-card__summary {
  margin: 0 4px;
  display: -webkit-box;
  color: var(--text-secondary);
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
  margin: 14px 4px 0;
  color: var(--text-muted);
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
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
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

.article-list__sentinel {
  width: 100%;
  height: 1px;
}

.article-list__load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 42px;
  color: #6b7280;
  font-size: 14px;
}

.article-list__load-more--error {
  color: #dc2626;
}

.article-list__load-more--end {
  color: #9ca3af;
}

.article-list__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(17, 24, 39, 0.12);
  border-top-color: #111827;
  border-radius: 999px;
  animation: article-spin 0.8s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@keyframes article-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
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
  .hero-panel {
    padding: 38px 30px 30px;
  }

  .hero-panel__inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .hero-panel__visual {
    aspect-ratio: 16 / 9;
  }

  .hero-card-grid {
    grid-template-columns: 1fr;
  }

  .article-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero-panel {
    padding: 32px 24px 24px;
  }
}

@media (max-width: 768px) {
  .hero-panel__title {
    margin-top: 24px;
    font-size: clamp(38px, 12vw, 56px);
    letter-spacing: -0.035em;
  }

  .hero-panel__description {
    font-size: 15px;
    line-height: 1.9;
  }

  .hero-card-grid {
    gap: 12px;
  }

  .hero-panel__metrics {
    gap: 10px;
  }

  .hero-panel__metric {
    min-width: calc(50% - 5px);
  }

  .article-loading {
    gap: 20px;
  }

  .article-loading__title {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding-top: 18px;
  }

  .hero-panel {
    border-radius: 24px;
    padding: 28px 18px 18px;
  }

  .hero-panel__eyebrow {
    min-height: 36px;
    padding: 0 14px;
  }

  .hero-panel__description {
    font-size: 14px;
  }

  .hero-panel__visual {
    aspect-ratio: 4 / 3;
  }

  .hero-carousel__nav {
    width: 32px;
    height: 32px;
    font-size: 24px;
  }

  .hero-panel__photo-caption {
    right: 12px;
    bottom: 44px;
    left: 12px;
  }

  .hero-carousel__dots {
    right: 12px;
    bottom: 12px;
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
