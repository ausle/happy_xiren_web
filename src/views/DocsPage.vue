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
            v-for="tab in tabOptions"
            :key="tab"
            class="docs-tabs__item"
            :class="{ active: activeTab === tab }"
            type="button"
            @click="changeTab(tab)"
          >
            {{ tab }}
          </button>
        </div>
      </section>

      <section class="docs-results">
        <div class="docs-results__head">
          <div>
            <p class="docs-results__eyebrow">SEARCH</p>
            <h1 class="docs-results__title">文档搜索</h1>
            <p class="docs-results__subtitle">{{ resultLabel }}</p>
          </div>
          <div class="docs-results__summary">
            <span class="docs-results__count">{{ totalCount }}</span>
            <span>条结果</span>
          </div>
        </div>

        <div v-if="loading" class="panel docs-empty-state">
          <p class="docs-empty-state__title">正在加载数据</p>
          <p class="docs-empty-state__text">正在按分页拉取全部结果，请稍候。</p>
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
              <div class="docs-result-list">
                <article v-for="item in articleResults" :key="`article-${item.id ?? item.title}`" class="panel docs-card">
                  <div class="docs-card__top">
                    <div class="docs-card__author">
                      <div class="docs-avatar">
                        <img
                          v-if="item.user?.userAvatar"
                          :src="item.user.userAvatar"
                          :alt="item.user?.userName || '用户头像'"
                          class="docs-avatar__image"
                        />
                        <BaseAvatar
                          v-else
                          :initials="getUserInitials(item.user?.userName)"
                          :size="48"
                          color="#d4a43a"
                          rounded="999px"
                        />
                      </div>
                      <div class="docs-card__author-body">
                        <button class="docs-card__author-name" type="button" @click="openAuthor(item.user?.userName)">
                          {{ item.user?.userName || "匿名用户" }}
                        </button>
                        <p class="docs-card__author-meta">
                          <CalendarDays :size="13" />
                          <span>{{ formatDate(item.createTime) }}</span>
                        </p>
                      </div>
                    </div>
                    <span class="docs-card__type">文章</span>
                  </div>

                  <button class="docs-card__title docs-card__title--button" type="button" @click="openArticle(item.id)">
                    {{ item.title || "未命名文章" }}
                  </button>
                  <p class="docs-card__excerpt">{{ getArticleExcerpt(item.content) }}</p>

                  <div v-if="item.tagList?.length" class="docs-card__tags">
                    <span v-for="tag in item.tagList" :key="`${item.id}-${tag}`" class="docs-card__tag">
                      {{ tag }}
                    </span>
                  </div>

                  <div class="docs-card__meta">
                    <span>
                      <ThumbsUp :size="14" />
                      {{ formatCount(item.thumbNum ?? 0) }}
                    </span>
                    <span>
                      <Bookmark :size="14" />
                      {{ formatCount(item.favourNum ?? 0) }}
                    </span>
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
                >
                  <img v-if="item.url" :src="item.url" :alt="item.title || '图片'" class="docs-picture-card__image" loading="lazy" />
                  <div v-else class="docs-picture-card__placeholder">暂无图片</div>
                  <p class="docs-picture-card__title">{{ item.title || "未命名图片" }}</p>
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
          <div v-if="articleResults.length" class="docs-result-list">
            <article v-for="item in articleResults" :key="`article-${item.id ?? item.title}`" class="panel docs-card">
              <div class="docs-card__top">
                <div class="docs-card__author">
                  <div class="docs-avatar">
                    <img
                      v-if="item.user?.userAvatar"
                      :src="item.user.userAvatar"
                      :alt="item.user?.userName || '用户头像'"
                      class="docs-avatar__image"
                    />
                    <BaseAvatar
                      v-else
                      :initials="getUserInitials(item.user?.userName)"
                      :size="48"
                      color="#d4a43a"
                      rounded="999px"
                    />
                  </div>
                  <div class="docs-card__author-body">
                    <button class="docs-card__author-name" type="button" @click="openAuthor(item.user?.userName)">
                      {{ item.user?.userName || "匿名用户" }}
                    </button>
                    <p class="docs-card__author-meta">
                      <CalendarDays :size="13" />
                      <span>{{ formatDate(item.createTime) }}</span>
                    </p>
                  </div>
                </div>
                <span class="docs-card__type">文章</span>
              </div>

              <button class="docs-card__title docs-card__title--button" type="button" @click="openArticle(item.id)">
                {{ item.title || "未命名文章" }}
              </button>
              <p class="docs-card__excerpt">{{ getArticleExcerpt(item.content) }}</p>

              <div v-if="item.tagList?.length" class="docs-card__tags">
                <span v-for="tag in item.tagList" :key="`${item.id}-${tag}`" class="docs-card__tag">
                  {{ tag }}
                </span>
              </div>

              <div class="docs-card__meta">
                <span>
                  <ThumbsUp :size="14" />
                  {{ formatCount(item.thumbNum ?? 0) }}
                </span>
                <span>
                  <Bookmark :size="14" />
                  {{ formatCount(item.favourNum ?? 0) }}
                </span>
              </div>
            </article>
          </div>

          <div v-else class="panel docs-empty-state">
            <p class="docs-empty-state__title">暂无文章结果</p>
            <p class="docs-empty-state__text">当前关键词下没有匹配的文章数据。</p>
          </div>
        </template>

        <template v-else-if="activeTab === '图片'">
          <div v-if="pictureResults.length" class="docs-picture-grid">
            <article
              v-for="item in pictureResults"
              :key="`picture-${item.url ?? item.title}`"
              class="panel docs-picture-card"
            >
              <img v-if="item.url" :src="item.url" :alt="item.title || '图片'" class="docs-picture-card__image" loading="lazy" />
              <div v-else class="docs-picture-card__placeholder">暂无图片</div>
              <p class="docs-picture-card__title">{{ item.title || "未命名图片" }}</p>
            </article>
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
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bookmark, CalendarDays, Search, ThumbsUp } from "lucide-vue-next";
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { searchAll, type SearchArticleItem, type SearchPictureItem, type SearchTabType, type SearchUserItem } from "@/api/search";
import BaseAvatar from "@/components/common/BaseAvatar.vue";

type DocsTab = "综合" | "文章" | "图片" | "用户";

const PAGE_SIZE = 5;
const tabOptions: DocsTab[] = ["综合", "文章", "图片", "用户"];

const router = useRouter();
const route = useRoute();

const initialKeyword = typeof route.query.q === "string" ? route.query.q : "";
const initialTab = isDocsTab(route.query.tab) ? route.query.tab : "综合";

const searchInput = ref(initialKeyword);
const keyword = ref(initialKeyword);
const activeTab = ref<DocsTab>(initialTab);
const loading = ref(false);
const errorMessage = ref("");
const articleResults = ref<SearchArticleItem[]>([]);
const pictureResults = ref<SearchPictureItem[]>([]);
const userResults = ref<SearchUserItem[]>([]);

let latestRequestId = 0;

const totalCount = computed(() => articleResults.value.length + pictureResults.value.length + userResults.value.length);
const hasAnyResults = computed(() => totalCount.value > 0);
const resultLabel = computed(() => {
  const keywordText = keyword.value.trim();
  const tabText = activeTab.value === "综合" ? "综合" : activeTab.value;
  return keywordText
    ? `当前分类：${tabText}，关键词：“${keywordText}”`
    : `当前分类：${tabText}，未填写搜索词，展示全部数据`;
});

onMounted(() => {
  void loadResults();
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
  void loadResults();
}

async function loadResults() {
  const requestId = ++latestRequestId;
  loading.value = true;
  errorMessage.value = "";

  try {
    const searchType = getSearchType(activeTab.value);
    const searchText = keyword.value.trim();

    const nextArticles: SearchArticleItem[] = [];
    const nextPictures: SearchPictureItem[] = [];
    const nextUsers: SearchUserItem[] = [];

    let pageNum = 1;

    while (true) {
      const result = await searchAll({
        searchText,
        type: searchType,
        pageNum,
        pageSize: PAGE_SIZE,
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

        if (postChunk.length < PAGE_SIZE && pictureChunk.length < PAGE_SIZE && userChunk.length < PAGE_SIZE) {
          break;
        }
      } else if (searchType === "post") {
        const chunk = (result.dataList ?? []) as SearchArticleItem[];
        nextArticles.push(...chunk);
        if (chunk.length < PAGE_SIZE) {
          break;
        }
      } else if (searchType === "picture") {
        const chunk = (result.dataList ?? []) as SearchPictureItem[];
        nextPictures.push(...chunk);
        if (chunk.length < PAGE_SIZE) {
          break;
        }
      } else {
        const chunk = (result.dataList ?? []) as SearchUserItem[];
        nextUsers.push(...chunk);
        if (chunk.length < PAGE_SIZE) {
          break;
        }
      }

      pageNum += 1;
    }

    if (requestId !== latestRequestId) {
      return;
    }

    articleResults.value = nextArticles;
    pictureResults.value = nextPictures;
    userResults.value = nextUsers;
    await router.replace({
      query: {
        ...route.query,
        tab: activeTab.value,
        q: keyword.value.trim() || undefined,
      },
    });
  } catch (error) {
    if (requestId !== latestRequestId) {
      return;
    }

    articleResults.value = [];
    pictureResults.value = [];
    userResults.value = [];
    errorMessage.value = "搜索接口调用失败，请稍后重试。";
    ElMessage.error(errorMessage.value);
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false;
    }
  }
}

function getSearchType(tab: DocsTab): SearchTabType {
  if (tab === "文章") {
    return "post";
  }

  if (tab === "图片") {
    return "picture";
  }

  if (tab === "用户") {
    return "user";
  }

  return "";
}

function openArticle(articleId?: number) {
  if (!articleId) {
    return;
  }

  void router.push(`/article/${articleId}`);
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

function getArticleExcerpt(content?: string) {
  const plainText = (content ?? "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*`_-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "暂无摘要";
  }

  return plainText.length > 140 ? `${plainText.slice(0, 140)}...` : plainText;
}

function formatDate(value?: string) {
  if (!value) {
    return "未知时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCount(value: number) {
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

.docs-result-list {
  display: grid;
  gap: 18px;
}

.docs-card {
  padding: 22px 24px;
  border-radius: 22px;
  background: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.docs-card:hover {
  transform: translateY(-2px);
  border-color: rgba(244, 131, 10, 0.14);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.docs-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.docs-card__author {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.docs-avatar,
.docs-user-card__avatar {
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.docs-user-card__avatar {
  width: 64px;
  height: 64px;
}

.docs-avatar__image,
.docs-user-card__avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.docs-card__author-body {
  min-width: 0;
}

.docs-card__author-name {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.docs-card__author-name:hover {
  color: #d97706;
}

.docs-card__author-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 12px;
}

.docs-card__type {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0 12px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
  font-weight: 600;
}

.docs-card__title {
  margin: 18px 0 10px;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  text-align: left;
}

.docs-card__title--button {
  cursor: pointer;
}

.docs-card__title--button:hover {
  color: #d97706;
}

.docs-card__excerpt {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.85;
}

.docs-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.docs-card__tag {
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  color: #4b5563;
  font-size: 12px;
}

.docs-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  color: #6b7280;
  font-size: 13px;
}

.docs-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
}

.docs-picture-card__image,
.docs-picture-card__placeholder {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
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
  padding: 12px 14px 16px;
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
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

@media (max-width: 1024px) {
  .docs-search-panel {
    padding: 22px 22px 24px;
  }

  .docs-results__head {
    align-items: flex-start;
    flex-direction: column;
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

  .docs-results__title {
    font-size: 24px;
  }

  .docs-card {
    padding: 18px 18px 20px;
  }

  .docs-card__top {
    flex-direction: column;
  }

  .docs-card__title {
    font-size: 20px;
  }

  .docs-picture-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .docs-user-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
