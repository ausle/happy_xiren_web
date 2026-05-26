<template>
  <div class="docs-page">
    <div class="page-shell docs-page__shell">
      <section class="panel docs-search-panel">
        <form class="docs-search-form" @submit.prevent="executeSearch">
          <input
            v-model="searchInput"
            class="docs-search-form__input"
            placeholder="搜索文章、图片或用户"
            type="search"
          />
          <button class="docs-search-form__button orange-gradient" type="submit">
            <Search :size="16" />
            <span>搜索</span>
          </button>
        </form>

        <div class="docs-tabs" role="tablist" aria-label="文档搜索分类">
          <button
            v-for="tab in visibleTabOptions"
            :key="tab"
            class="docs-tabs__item"
            :class="{ active: activeTab === tab }"
            type="button"
            @click="changeTab(tab)"
          >
            {{ tab }}
          </button>
        </div>
        <div v-if="false && showArticleTagFilter" class="docs-tag-filter">
          <span class="docs-tag-filter__label">标签筛选（最多 3 个）</span>
          <div class="docs-tag-filter__list">
            <button
              class="docs-tag-filter__item"
              :class="{ active: !selectedArticleTags.length }"
              type="button"
              @click="clearArticleTags()"
            >
              全部
            </button>
            <button
              v-for="tag in availableArticleTags"
              :key="tag"
              class="docs-tag-filter__item"
              :class="{ active: selectedArticleTags.includes(tag) }"
              type="button"
              @click="toggleArticleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
        <div v-if="showArticleTagFilter" class="docs-tag-filter">
          <span class="docs-tag-filter__label">标签筛选</span>
          <ElSelect
            v-model="selectedArticleTags"
            class="docs-tag-filter__select"
            collapse-tags
            collapse-tags-tooltip
            filterable
            multiple
            :multiple-limit="3"
            placeholder="请选择你需要的标签，最多3个"
            popper-class="docs-tag-select-popper"
            remote
            reserve-keyword
            :loading="loadingArticleTags"
            @change="handleArticleTagChange"
            @visible-change="handleArticleTagSelectVisible"
            :remote-method="handleArticleTagSearch"
          >
            <ElOption v-for="tag in availableArticleTags" :key="tag" :label="tag" :value="tag" />
          </ElSelect>
        </div>
        <nav v-if="showPagination" class="docs-pagination pagination" aria-label="Search pagination">
          <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
            首页
          </button>
          <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
            上一页
          </button>
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            class="pagination__item"
            :class="{ active: page === currentSearchPage }"
            type="button"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
            下一页
          </button>
          <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
            尾页
          </button>
        </nav>

        <ElDialog
          v-model="picturePreviewVisible"
          class="picture-preview-dialog"
          width="1120px"
          :show-close="true"
          :destroy-on-close="true"
          align-center
        >
          <template #header>
            <div class="picture-preview-dialog__title">{{ activePicture?.title || "图片预览" }}</div>
          </template>

          <div class="picture-preview">
            <div class="picture-preview__media">
              <img
                v-if="activePicture?.url"
                :src="activePicture.url"
                :alt="activePicture.title || '图片预览'"
                class="picture-preview__image"
              />
              <div v-else class="picture-preview__empty">暂无可预览图片</div>
            </div>
            <p v-if="activePicture?.description" class="picture-preview__description">{{ activePicture.description }}</p>
          </div>
        </ElDialog>
      </section>

      <section class="docs-results">
        <div class="docs-results__head">
          <div>
            <p class="docs-results__eyebrow">SEARCH</p>
            <h1 class="docs-results__title">文档搜索</h1>
            <p class="docs-results__subtitle">{{ docsSearchSummaryText }}</p>
          </div>
          <div class="docs-results__summary">
            <span class="docs-results__count">{{ totalCount }}</span>
            <span>条结果</span>
          </div>
        </div>

        <div v-if="loading" class="article-loading" aria-live="polite" aria-busy="true">
          <div class="article-loading__header">
            <span class="article-loading__eyebrow">CURATED POSTS</span>
            <p class="article-loading__title">正在整理这一页的内容</p>
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

        <div v-else-if="errorMessage" class="panel docs-empty-state">
          <p class="docs-empty-state__title">加载失败</p>
          <p class="docs-empty-state__text">{{ errorMessage }}</p>
        </div>

        <template v-else-if="activeTab === '综合'">
          <div v-if="hasAnyResults" class="docs-sections">
            <section v-if="articleResults.length" class="docs-section">
              <div class="docs-section__head">
                <h2 class="docs-section__title">文章</h2>
                <span class="docs-section__count">{{ articleResults.length }}</span>
              </div>
              <div class="article-grid">
                <article
                  v-for="(article, index) in articleResults"
                  :key="`article-${article.id ?? article.title}`"
                  class="article-card"
                  @click="openArticle(article)"
                >
                  <div class="article-card__image-wrap">
                    <img
                      :src="getArticleCover(article, index)"
                      :alt="article.title || '文章封面'"
                      class="article-card__image"
                    />
                  </div>

                  <h3 class="article-card__title line-clamp-2">{{ article.title || "未命名文章" }}</h3>
                  <p class="article-card__summary">{{ article.summary || article.shortTitle || "暂无摘要" }}</p>

                  <div class="article-card__meta">
                    <span class="article-card__author">{{ article.user?.userName || "匿名作者" }}</span>
                    <div class="article-card__meta-right">
                      <div v-if="getVisibleArticleTags(article).length" class="article-card__tags">
                        <span
                          v-for="tag in getVisibleArticleTags(article)"
                          :key="`${article.id}-${tag}`"
                          class="article-card__tag"
                        >
                          {{ tag }}
                        </span>
                      </div>
                      <span class="article-card__views">
                        <Eye :size="14" />
                        {{ formatCount(article.readNum) }}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section v-if="pictureResults.length" class="docs-section">
              <div class="docs-section__head">
                <h2 class="docs-section__title">图片</h2>
                <span class="docs-section__count">{{ pictureResults.length }}</span>
              </div>
              <div class="docs-picture-grid">
                <article
                  v-for="item in pictureResults"
                  :key="`picture-${item.url ?? item.title}`"
                  class="panel docs-picture-card"
                  @click="openPicturePreview(item)"
                >
                  <img v-if="item.url" :src="item.url" :alt="item.title || '图片'" class="docs-picture-card__image" loading="lazy" />
                  <div v-else class="docs-picture-card__placeholder">暂无图片</div>
                  <p class="docs-picture-card__title">{{ item.title || "未命名图片" }}</p>
                  <p v-if="item.description" class="docs-picture-card__description">{{ item.description }}</p>
                </article>
              </div>
            </section>

            <section v-if="userResults.length" class="docs-section">
              <div class="docs-section__head">
                <h2 class="docs-section__title">用户</h2>
                <span class="docs-section__count">{{ userResults.length }}</span>
              </div>
              <div class="docs-user-grid">
                <article
                  v-for="item in userResults"
                  :key="`user-${item.id ?? item.userName}`"
                  class="panel docs-user-card"
                  @click="openAuthor(item.userName)"
                >
                  <div class="docs-user-card__avatar">
                    <img
                      v-if="item.userAvatar"
                      :src="item.userAvatar"
                      :alt="item.userName || '用户头像'"
                      class="docs-user-card__avatar-image"
                    />
                    <BaseAvatar
                      v-else
                      :initials="getUserInitials(item.userName)"
                      :size="64"
                      color="#d4a43a"
                      rounded="999px"
                    />
                  </div>
                  <p class="docs-user-card__name">{{ item.userName || "未命名用户" }}</p>
                </article>
              </div>
            </section>
          </div>

          <div v-else class="panel docs-empty-state">
            <p class="docs-empty-state__title">没有找到匹配内容</p>
            <p class="docs-empty-state__text">试试更换关键词，或者切换到其他分类查看。</p>
          </div>
        </template>

        <template v-else-if="activeTab === '文章'">
          <div v-if="articleResults.length">
            <div class="article-grid">
            <article
              v-for="(article, index) in articleResults"
              :key="`article-${article.id ?? article.title}`"
              class="article-card"
              @click="openArticle(article)"
            >
              <div class="article-card__image-wrap">
                <img
                  :src="getArticleCover(article, index)"
                  :alt="article.title || '文章封面'"
                  class="article-card__image"
                />
              </div>

              <h3 class="article-card__title line-clamp-2">{{ article.title || "未命名文章" }}</h3>
              <p class="article-card__summary">{{ article.summary || article.shortTitle || "暂无摘要" }}</p>

              <div class="article-card__meta">
                <span class="article-card__author">{{ article.user?.userName || "匿名作者" }}</span>
                <div class="article-card__meta-right">
                  <div v-if="getVisibleArticleTags(article).length" class="article-card__tags">
                    <span
                      v-for="tag in getVisibleArticleTags(article)"
                      :key="`${article.id}-${tag}`"
                      class="article-card__tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <span class="article-card__views">
                    <Eye :size="14" />
                    {{ formatCount(article.readNum) }}
                  </span>
                </div>
              </div>
              </article>
            </div>

            <nav v-if="showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>

            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>

            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>

            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>

            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>
            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>
            <nav v-if="false && showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button
                v-for="page in visiblePageNumbers"
                :key="page"
                class="pagination__item"
                :class="{ active: page === currentSearchPage }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>
          </div>

          <div v-else class="panel docs-empty-state">
            <p class="docs-empty-state__title">暂无文章结果</p>
            <p class="docs-empty-state__text">当前关键词下没有匹配的文章数据。</p>
          </div>
        </template>

        <template v-else-if="activeTab === '图片'">
          <div v-if="pictureResults.length">
            <div class="docs-picture-grid">
            <article
              v-for="item in pictureResults"
              :key="`picture-${item.url ?? item.title}`"
              class="panel docs-picture-card"
              @click="openPicturePreview(item)"
            >
              <img v-if="item.url" :src="item.url" :alt="item.title || '图片'" class="docs-picture-card__image" loading="lazy" />
              <div v-else class="docs-picture-card__placeholder">暂无图片</div>
              <p class="docs-picture-card__title">{{ item.title || "未命名图片" }}</p>
              <p v-if="item.description" class="docs-picture-card__description">{{ item.description }}</p>
            </article>
            </div>

            <nav v-if="showPagination" class="pagination" aria-label="Search pagination">
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
                首页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
                上一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
                下一页
              </button>
              <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
                尾页
              </button>
            </nav>
          </div>

          <div v-else class="panel docs-empty-state">
            <p class="docs-empty-state__title">暂无图片结果</p>
            <p class="docs-empty-state__text">当前关键词下没有匹配的图片数据。</p>
          </div>
        </template>

        <template v-else>
          <div v-if="userResults.length" class="docs-user-grid">
            <article
              v-for="item in userResults"
              :key="`user-${item.id ?? item.userName}`"
              class="panel docs-user-card"
              @click="openAuthor(item.userName)"
            >
              <div class="docs-user-card__avatar">
                <img
                  v-if="item.userAvatar"
                  :src="item.userAvatar"
                  :alt="item.userName || '用户头像'"
                  class="docs-user-card__avatar-image"
                />
                <BaseAvatar
                  v-else
                  :initials="getUserInitials(item.userName)"
                  :size="64"
                  color="#d4a43a"
                  rounded="999px"
                />
              </div>
              <p class="docs-user-card__name">{{ item.userName || "未命名用户" }}</p>
            </article>
          </div>

          <div v-else class="panel docs-empty-state">
            <p class="docs-empty-state__title">暂无用户结果</p>
            <p class="docs-empty-state__text">当前关键词下没有匹配的用户数据。</p>
          </div>
        </template>
        <nav v-if="showPagination" class="docs-pagination pagination" aria-label="Search pagination">
          <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(1)">
            首页
          </button>
          <button class="pagination__item" :disabled="currentSearchPage <= 1" type="button" @click="goToPage(currentSearchPage - 1)">
            上一页
          </button>
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            class="pagination__item"
            :class="{ active: page === currentSearchPage }"
            type="button"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(currentSearchPage + 1)">
            下一页
          </button>
          <button class="pagination__item" :disabled="currentSearchPage >= pageTotal" type="button" @click="goToPage(pageTotal)">
            尾页
          </button>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, Search } from "lucide-vue-next";
import { ElMessage } from "element-plus";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchSearchTagsPage, searchAll, type SearchArticleItem, type SearchPictureItem, type SearchTabType, type SearchUserItem } from "@/api/search";
import BaseAvatar from "@/components/common/BaseAvatar.vue";

type DocsTab = "综合" | "文章" | "图片" | "用户";

const DEFAULT_PAGE_SIZE = 12;
const PICTURE_PAGE_SIZE = 15;
const MAX_VISIBLE_PAGES = 7;
const loadingPlaceholders = Array.from({ length: DEFAULT_PAGE_SIZE }, (_, index) => index);
const tabOptions: DocsTab[] = ["综合", "文章", "图片", "用户"];

const ALL_TAB = tabOptions[0];
const visibleTabOptions = tabOptions.filter((tab) => tab !== ALL_TAB);
const ARTICLE_TAB = tabOptions[1];
const PICTURE_TAB = tabOptions[2];
const USER_TAB = tabOptions[3];

const router = useRouter();
const route = useRoute();

const initialKeyword = typeof route.query.q === "string" ? route.query.q : "";
const initialTab = isDocsTab(route.query.tab) && route.query.tab !== ALL_TAB ? route.query.tab : ARTICLE_TAB;
const initialTagQuery =
  typeof route.query.tags === "string"
    ? route.query.tags
    : typeof route.query.tag === "string"
      ? route.query.tag
      : "";
const initialTags = initialTagQuery
  ? initialTagQuery
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 3)
  : [];

const searchInput = ref(initialKeyword);
const keyword = ref(initialKeyword);
const activeTab = ref<DocsTab>(initialTab);
const selectedArticleTags = ref<string[]>(initialTags);
const selectedArticleTag = computed(() => selectedArticleTags.value[0] ?? "");
const loading = ref(false);
const errorMessage = ref("");
const articleResults = ref<SearchArticleItem[]>([]);
const pictureResults = ref<SearchPictureItem[]>([]);
const userResults = ref<SearchUserItem[]>([]);
const articleTotal = ref(0);
const pictureTotal = ref(0);
const currentArticlePage = ref(1);
const currentPicturePage = ref(1);
const picturePreviewVisible = ref(false);
const activePicture = ref<SearchPictureItem | null>(null);
const articleTagCatalog = ref<string[]>([]);
const loadingArticleTags = ref(false);
const articleTagKeyword = ref("");
const articleTagPageNumber = ref(0);
const articleTagPageTotal = ref(0);

let articleTagDropdownWrap: HTMLElement | null = null;

let latestRequestId = 0;

const showArticleTagFilter = computed(() => activeTab.value === ARTICLE_TAB);
const availableArticleTags = computed(() => {
  const tags = new Set<string>();

  articleTagCatalog.value.forEach((tag) => {
    const value = tag.trim();
    if (value) {
      tags.add(value);
    }
  });

  articleResults.value.forEach((article) => {
    getArticleTags(article).forEach((tag) => {
      const value = tag.trim();
      if (value) {
        tags.add(value);
      }
    });
  });

  selectedArticleTags.value.forEach((tag) => tags.add(tag));

  return Array.from(tags);
});
const totalCount = computed(() => {
  if (activeTab.value === ARTICLE_TAB) {
    return articleTotal.value;
  }

  if (activeTab.value === PICTURE_TAB) {
    return pictureTotal.value;
  }

  return articleResults.value.length + pictureResults.value.length + userResults.value.length;
});
const hasAnyResults = computed(() => totalCount.value > 0);
const currentSearchPage = computed(() => (activeTab.value === PICTURE_TAB ? currentPicturePage.value : currentArticlePage.value));
const currentSearchTotal = computed(() => (activeTab.value === PICTURE_TAB ? pictureTotal.value : articleTotal.value));
const currentPageSize = computed(() => (activeTab.value === PICTURE_TAB ? PICTURE_PAGE_SIZE : DEFAULT_PAGE_SIZE));
const pageTotal = computed(() => {
  if (activeTab.value !== ARTICLE_TAB && activeTab.value !== PICTURE_TAB) {
    return 0;
  }

  return Math.ceil(currentSearchTotal.value / currentPageSize.value);
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
  let start = Math.max(1, currentSearchPage.value - half);
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});
const resultLabel = computed(() => {
  const keywordText = keyword.value.trim();
  const tabText = activeTab.value === ALL_TAB ? ALL_TAB : activeTab.value;
  return keywordText
    ? `当前分类：${tabText}，关键词：“${keywordText}”`
    : `当前分类：${tabText}，未填写搜索词，展示全部数据`;
});

onMounted(() => {
  void loadResults();
});

onBeforeUnmount(() => {
  unbindArticleTagScroll();
});

const docsSearchSummaryText = computed(() => {
  void searchSummaryText.value;
  const keywordText = keyword.value.trim();
  const tabText = activeTab.value === ALL_TAB ? ALL_TAB : activeTab.value;
  const tagText =
    activeTab.value === ARTICLE_TAB && selectedArticleTags.value.length
      ? `，标签：“${selectedArticleTags.value.join("、")}”`
      : "";

  return keywordText
    ? `当前分类：${tabText}，关键词：“${keywordText}”${tagText}`
    : `当前分类：${tabText}，未填写搜索词，展示全部数据${tagText}`;
});

const searchSummaryText = computed(() => {
  void resultLabel.value;
  const keywordText = keyword.value.trim();
  const tabText = activeTab.value === ALL_TAB ? ALL_TAB : activeTab.value;
  const tagText = activeTab.value === ARTICLE_TAB && selectedArticleTag.value ? `，标签：“${selectedArticleTag.value}”` : "";

  return keywordText
    ? `当前分类：${tabText}，关键词：“${keywordText}”${tagText}`
    : `当前分类：${tabText}，未填写搜索词，展示全部数据${tagText}`;
});

function isDocsTab(value: unknown): value is DocsTab {
  return typeof value === "string" && tabOptions.includes(value as DocsTab);
}

function changeTab(tab: DocsTab) {
  if (activeTab.value === tab) {
    return;
  }

  activeTab.value = tab;
  void loadResults();
}

function executeSearch() {
  keyword.value = searchInput.value.trim();
  currentArticlePage.value = 1;
  currentPicturePage.value = 1;
  void loadResults();
}

async function loadArticleTagOptions() {
  if (loadingArticleTags.value) {
    return;
  }

  loadingArticleTags.value = true;

  try {
    const result = await fetchSearchTagsPage(articleTagKeyword.value, articleTagPageNumber.value + 1, 10);
    const nextTags = (result.list ?? [])
      .map((item) => item.tag?.trim() ?? "")
      .filter(Boolean);
    const merged = new Set<string>();

    articleTagCatalog.value.forEach((tag) => merged.add(tag));
    selectedArticleTags.value.forEach((tag) => merged.add(tag));
    nextTags.forEach((tag) => merged.add(tag));

    articleTagCatalog.value = Array.from(merged);
    articleTagPageNumber.value = Number(result.pageNum ?? articleTagPageNumber.value + 1);
    articleTagPageTotal.value = Number(result.pageTotal ?? 0);
  } catch {
    if (articleTagPageNumber.value === 0) {
      articleTagCatalog.value = [...selectedArticleTags.value];
    }
  } finally {
    loadingArticleTags.value = false;
  }
}

function clearArticleTags() {
  if (!selectedArticleTags.value.length) {
    return;
  }

  selectedArticleTags.value = [];
  currentArticlePage.value = 1;
  void loadResults();
}

function toggleArticleTag(tag: string) {
  const value = tag.trim();
  if (!value) {
    return;
  }

  if (selectedArticleTags.value.includes(value)) {
    selectedArticleTags.value = selectedArticleTags.value.filter((item) => item !== value);
    currentArticlePage.value = 1;
    void loadResults();
    return;
  }

  if (selectedArticleTags.value.length >= 3) {
    ElMessage.warning("最多可选择 3 个标签");
    return;
  }

  selectedArticleTags.value = [...selectedArticleTags.value, value];
  currentArticlePage.value = 1;
  void loadResults();
}

function unbindArticleTagScroll() {
  if (!articleTagDropdownWrap) {
    return;
  }

  articleTagDropdownWrap.removeEventListener("scroll", handleArticleTagDropdownScroll);
  articleTagDropdownWrap = null;
}

async function bindArticleTagScroll() {
  await nextTick();
  unbindArticleTagScroll();

  articleTagDropdownWrap = document.querySelector(".docs-tag-select-popper .el-select-dropdown__wrap");
  articleTagDropdownWrap?.addEventListener("scroll", handleArticleTagDropdownScroll);
}

function handleArticleTagDropdownScroll() {
  if (!articleTagDropdownWrap || loadingArticleTags.value) {
    return;
  }

  const { scrollTop, clientHeight, scrollHeight } = articleTagDropdownWrap;
  const reachedBottom = scrollTop + clientHeight >= scrollHeight - 24;
  const hasMore = articleTagPageNumber.value < articleTagPageTotal.value;

  if (reachedBottom && hasMore) {
    void loadArticleTagOptions();
  }
}

function handleArticleTagSearch(keywordText: string) {
  articleTagKeyword.value = keywordText.trim();
  articleTagPageNumber.value = 0;
  articleTagPageTotal.value = 0;
  articleTagCatalog.value = [...selectedArticleTags.value];
  void loadArticleTagOptions();
}

function handleArticleTagSelectVisible(visible: boolean) {
  if (!visible) {
    unbindArticleTagScroll();
    return;
  }

  articleTagKeyword.value = "";
  articleTagPageNumber.value = 0;
  articleTagPageTotal.value = 0;
  articleTagCatalog.value = [...selectedArticleTags.value];
  void loadArticleTagOptions();
  void bindArticleTagScroll();
}

function handleArticleTagChange(value: string[]) {
  if (value.length > 3) {
    selectedArticleTags.value = value.slice(0, 3);
    ElMessage.warning("最多可选择 3 个标签");
    return;
  }

  selectedArticleTags.value = value;
  currentArticlePage.value = 1;
  void loadResults();
}

function getPageSize(searchType: SearchTabType) {
  return searchType === "picture" ? PICTURE_PAGE_SIZE : DEFAULT_PAGE_SIZE;
}

async function loadResults() {
  const requestId = ++latestRequestId;
  loading.value = true;
  errorMessage.value = "";

  try {
    const searchType = getSearchType(activeTab.value);
    const searchText = keyword.value.trim();
    const pageSize = getPageSize(searchType);

    const nextArticles: SearchArticleItem[] = [];
    const nextPictures: SearchPictureItem[] = [];
    const nextUsers: SearchUserItem[] = [];

    const pageNum =
      searchType === "post"
        ? currentArticlePage.value
        : searchType === "picture"
          ? currentPicturePage.value
          : 1;
    let loopPageNum = pageNum;

    while (true) {
      const result = await searchAll({
        searchText,
        type: searchType,
        pageNum: loopPageNum,
        pageSize,
        tags: searchType === "post" && selectedArticleTags.value.length ? selectedArticleTags.value : undefined,
      });

      if (requestId !== latestRequestId) {
        return;
      }

      if (searchType === "") {
        const postChunk = result.postList ?? [];
        const pictureChunk = result.pictureList ?? [];
        const userChunk = result.userList ?? [];

        nextArticles.push(...postChunk);
        nextPictures.push(...pictureChunk);
        nextUsers.push(...userChunk);

        if (postChunk.length < pageSize && pictureChunk.length < pageSize && userChunk.length < pageSize) {
          break;
        }
      } else if (searchType === "post") {
        articleResults.value = (result.dataList ?? []) as SearchArticleItem[];
        pictureResults.value = [];
        userResults.value = [];
        articleTotal.value = result.total ?? 0;
        pictureTotal.value = 0;
        break;
      } else if (searchType === "picture") {
        articleResults.value = [];
        pictureResults.value = (result.dataList ?? []) as SearchPictureItem[];
        userResults.value = [];
        articleTotal.value = 0;
        pictureTotal.value = result.total ?? 0;
        break;
      } else {
        const chunk = (result.dataList ?? []) as SearchUserItem[];
        nextUsers.push(...chunk);
        if (chunk.length < pageSize) {
          break;
        }
      }

      loopPageNum += 1;
    }

    if (requestId !== latestRequestId) {
      return;
    }

    if (searchType === "") {
      articleResults.value = nextArticles;
      pictureResults.value = nextPictures;
      userResults.value = nextUsers;
      articleTotal.value = nextArticles.length;
      pictureTotal.value = nextPictures.length;
    } else if (searchType === "user") {
      articleResults.value = [];
      pictureResults.value = [];
      userResults.value = nextUsers;
      articleTotal.value = 0;
      pictureTotal.value = 0;
    }
    await router.replace({
      query: {
        ...route.query,
        tab: activeTab.value,
        q: keyword.value.trim() || undefined,
        tag: undefined,
        tags: activeTab.value === ARTICLE_TAB && selectedArticleTags.value.length ? selectedArticleTags.value.join(",") : undefined,
      },
    });
  } catch {
    if (requestId !== latestRequestId) {
      return;
    }

    articleResults.value = [];
    pictureResults.value = [];
    userResults.value = [];
    articleTotal.value = 0;
    pictureTotal.value = 0;
    errorMessage.value = "搜索接口调用失败，请稍后重试。";
    ElMessage.error(errorMessage.value);
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false;
    }
  }
}

function goToPage(page: number) {
  if (!showPagination.value || loading.value || page < 1 || page > pageTotal.value || page === currentSearchPage.value) {
    return;
  }

  if (activeTab.value === ARTICLE_TAB) {
    currentArticlePage.value = page;
  } else if (activeTab.value === PICTURE_TAB) {
    currentPicturePage.value = page;
  } else {
    return;
  }

  void loadResults();
}

function getSearchType(tab: DocsTab): SearchTabType {
  if (tab === ARTICLE_TAB) {
    return "post";
  }

  if (tab === PICTURE_TAB) {
    return "picture";
  }

  if (tab === USER_TAB) {
    return "user";
  }

  return "";
}

function getArticleTags(article: SearchArticleItem) {
  return article.tagList?.filter(Boolean) ?? [];
}

function getVisibleArticleTags(article: SearchArticleItem) {
  return getArticleTags(article).slice(0, 3);
}

function getArticleDisplayType(article: SearchArticleItem) {
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

function getArticleCover(article: SearchArticleItem, index: number) {
  if (article.cover) {
    return article.cover;
  }

  const title = article.title ?? "Article";
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
      <text x="78" y="660" fill="rgba(255,255,255,0.16)" font-size="150" font-weight="700" font-family="Inter, Arial, sans-serif">${title.slice(0, 10).replace(/&/g, "&amp;")}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function openArticle(article: SearchArticleItem) {
  if (!article.id) {
    return;
  }

  void router.push({
    name: "article",
    params: {
      id: article.id,
      slug: article.urlSlug || undefined,
    },
  });
}

function openPicturePreview(picture: SearchPictureItem) {
  if (!picture.url) {
    return;
  }

  activePicture.value = picture;
  picturePreviewVisible.value = true;
}

function openAuthor(authorName?: string) {
  if (!authorName) {
    return;
  }

  void router.push(`/author/${encodeURIComponent(authorName)}`);
}

function getUserInitials(userName?: string) {
  const value = userName?.trim();
  if (!value) {
    return "用户";
  }
  return value.slice(0, 2);
}

function formatCount(value?: number | null) {
  if (!value) {
    return "0";
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}w`;
  }
  return `${value}`;
}
</script>

<style scoped>
.docs-page {
  min-height: 100vh;
  background: #f8f8f7;
}

.docs-page__shell {
  padding-top: 28px;
  padding-bottom: 44px;
}

.docs-search-panel {
  padding: 26px 28px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.04);
}

.docs-search-form {
  display: flex;
  gap: 12px;
}

.docs-search-form__input {
  width: 100%;
  min-height: 52px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fcfcfc;
  padding: 0 18px;
  color: #111827;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.docs-search-form__input:focus {
  border-color: rgba(244, 131, 10, 0.5);
  box-shadow: 0 0 0 4px rgba(244, 131, 10, 0.1);
  background: #ffffff;
}

.docs-search-form__button {
  display: inline-flex;
  min-width: 116px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(244, 131, 10, 0.22);
}

.docs-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 24px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 18px;
}

.docs-tabs__item {
  position: relative;
  padding: 4px 2px 12px;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.docs-tabs__item:hover,
.docs-tabs__item.active {
  color: #111827;
}

.docs-tabs__item.active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f4830a 0%, #ffb357 100%);
  content: "";
}

.docs-tag-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.docs-tag-filter__label {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.docs-tag-filter__select {
  width: min(100%, 440px);
}

.docs-tag-filter__list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 10px;
}

.docs-tag-filter__item {
  min-height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0 14px;
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.docs-tag-filter__item:hover {
  transform: translateY(-1px);
  border-color: rgba(244, 131, 10, 0.42);
  color: #111827;
}

.docs-tag-filter__item.active {
  border-color: transparent;
  background: linear-gradient(90deg, #f4830a 0%, #ffb357 100%);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(244, 131, 10, 0.18);
}

.docs-page :deep(.docs-tag-filter__select .el-select__wrapper) {
  min-height: 44px;
  border-radius: 12px;
}

.docs-page :deep(.docs-tag-select-popper .el-select-dropdown__wrap) {
  max-height: 240px;
}

.docs-results {
  margin-top: 24px;
}

.docs-results__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.docs-results__eyebrow {
  margin: 0 0 8px;
  color: #7c6f64;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.docs-results__title {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.docs-results__subtitle {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.docs-results__summary {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.docs-results__count {
  color: #f4830a;
  font-size: 24px;
  font-weight: 700;
}

.docs-sections {
  display: grid;
  gap: 24px;
}

.docs-section {
  display: grid;
  gap: 16px;
}

.docs-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.docs-section__title {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
}

.docs-section__count {
  color: #d97706;
  font-size: 14px;
  font-weight: 600;
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
  max-width: 180px;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow: hidden;
  white-space: nowrap;
}

.article-card__tag {
  flex-shrink: 0;
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

.docs-picture-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.docs-picture-card {
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.docs-picture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.docs-picture-card__image,
.docs-picture-card__placeholder {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.docs-picture-card__image {
  transition: transform 0.38s ease, filter 0.38s ease;
}

.docs-picture-card:hover .docs-picture-card__image {
  transform: scale(1.06);
  filter: saturate(1.08);
}

.docs-picture-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 14px;
}

.docs-picture-card__title {
  margin: 0;
  padding: 12px 14px 0;
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
}

.docs-picture-card__description {
  margin: 0;
  padding: 8px 14px 16px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.picture-preview {
  display: grid;
  gap: 16px;
}

.picture-preview__media {
  display: flex;
  max-height: min(76vh, 920px);
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 20px;
  background: #f8fafc;
}

.picture-preview__image {
  display: block;
  max-width: 100%;
  max-height: min(76vh, 920px);
  object-fit: contain;
}

.picture-preview__empty {
  display: flex;
  min-height: 320px;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}

.picture-preview__description {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.8;
}

.picture-preview-dialog__title {
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.docs-user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.docs-user-card {
  display: flex;
  min-height: 160px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.docs-user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.docs-user-card__avatar {
  display: inline-flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.docs-user-card__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.docs-user-card__name {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.docs-empty-state {
  padding: 44px 24px;
  border-radius: 22px;
  text-align: center;
}

.docs-empty-state__title {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.docs-empty-state__text {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 42px;
}

.docs-results .pagination {
  display: none;
}

.docs-search-panel > .docs-pagination {
  display: none !important;
}

.docs-results > .docs-pagination {
  display: flex;
}

.docs-page :deep(.picture-preview-dialog) {
  max-width: calc(100vw - 32px);
  border-radius: 18px;
}

.docs-page :deep(.picture-preview-dialog .el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #f1f5f9;
  padding: 20px 24px 18px;
}

.docs-page :deep(.picture-preview-dialog .el-dialog__body) {
  padding: 20px 24px 24px;
}

.docs-page :deep(.picture-preview-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 18px;
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
  .docs-search-panel {
    padding: 22px 22px 24px;
  }

  .docs-results__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .article-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .docs-picture-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .docs-page__shell {
    padding-top: 16px;
    padding-bottom: 28px;
  }

  .docs-search-form {
    flex-direction: column;
  }

  .docs-search-form__button {
    min-height: 48px;
  }

  .docs-tabs {
    gap: 6px 14px;
    padding-bottom: 14px;
  }

  .docs-tabs__item {
    padding-bottom: 10px;
    font-size: 15px;
  }

  .docs-tag-filter {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .docs-tag-filter__list {
    width: 100%;
  }

  .docs-results__title {
    font-size: 24px;
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

  .docs-picture-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .docs-user-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .docs-tag-filter__item {
    min-height: 34px;
    padding: 0 12px;
    font-size: 12px;
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
