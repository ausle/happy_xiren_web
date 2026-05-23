<template>
  <div class="article-shell">
    <div class="page-shell article-wrap">
      <button class="back-button" type="button" @click="router.back()">
        <ArrowLeft :size="15" />
        返回
      </button>

      <div v-if="loading" class="missing-state">
        <p>正在加载文章详情...</p>
      </div>

      <div v-else-if="errorMessage" class="missing-state">
        <p>{{ errorMessage }}</p>
        <RouterLink class="missing-state__link" to="/">返回首页</RouterLink>
      </div>

      <div v-else-if="article" class="article-layout">
        <div class="side-actions">
          <div class="side-actions__sticky">
            <button class="side-action" :class="{ active: liked, orange: liked }" type="button" @click="handleLike">
              <div class="side-action__circle">
                <ThumbsUp :size="17" :fill="liked ? '#F4830A' : 'none'" />
              </div>
              <span>{{ likeCount }}</span>
            </button>
            <button class="side-action" type="button" @click="scrollToComments">
              <div class="side-action__circle">
                <MessageCircle :size="17" />
              </div>
              <span>{{ comments.length }}</span>
            </button>
            <button class="side-action" :class="{ active: bookmarked }" type="button" @click="bookmarked = !bookmarked">
              <div class="side-action__circle">
                <Bookmark :size="17" :fill="bookmarked ? '#6C63FF' : 'none'" />
              </div>
              <span>收藏</span>
            </button>
          </div>
        </div>

        <div class="article-main">
          <article class="panel article-card">
            <h1 class="article-card__title">{{ article.title }}</h1>

            <div class="article-card__meta">
              <BaseAvatar :clickable="true" :initials="article.author.initials" @click="goToAuthor" />
              <div class="article-card__author">
                <button class="article-card__author-name" type="button" @click="goToAuthor">{{ article.author.name }}</button>
                <div class="article-card__author-meta">
                  <span>{{ article.date }}</span>
                  <span class="article-card__views"><Eye :size="12" /> 阅读 {{ article.views }}</span>
                  <span class="article-card__views"><MessageCircle :size="12" /> 评论 {{ article.commentCount }}</span>
                </div>
              </div>
              <div v-if="article.tags.length" class="article-card__tags">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="article-card__tag"
                  :style="{ background: `${getTagColor(tag)}18`, color: getTagColor(tag) }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <p v-if="article.summary" class="article-card__summary">{{ article.summary }}</p>

            <div class="article-card__divider" />
            <div class="article-card__body markdown-body" v-html="article.contentHtml" />

            <div class="like-section">
              <button class="like-section__button" :class="{ active: liked }" type="button" @click="handleLike">
                <ThumbsUp :size="22" :fill="liked ? '#F4830A' : 'none'" />
              </button>
              <div class="like-section__line">
                <span />
                <strong>{{ liked ? `${likeCount} 人觉得有帮助` : "觉得有帮助的话，点个赞吧" }}</strong>
                <span />
              </div>
            </div>

            <div ref="commentRef" class="comment-section">
              <div class="comment-editor">
                <BaseAvatar initials="我" :size="36" />
                <div class="comment-editor__box">
                  <textarea
                    v-model="commentText"
                    class="comment-editor__textarea"
                    placeholder="写下你的评论..."
                    rows="3"
                  />
                  <div class="comment-editor__footer">
                    <span>{{ commentText.length }}/512</span>
                    <button class="comment-editor__submit" :disabled="!commentText.trim()" type="button" @click="submitComment">
                      评论
                    </button>
                  </div>
                </div>
              </div>

              <div class="comment-list">
                <h3 class="comment-list__title"><span>{{ comments.length }}</span> 条评论</h3>

                <div v-if="!comments.length" class="comment-list__empty">还没有评论，欢迎发表第一条评论。</div>

                <article v-for="comment in comments" :key="comment.id" class="comment-item">
                  <BaseAvatar :color="comment.color" :initials="comment.initials" :size="34" />
                  <div class="comment-item__content">
                    <div class="comment-item__head">
                      <span class="comment-item__author">{{ comment.author }}</span>
                      <span class="comment-item__date">{{ comment.date }}</span>
                    </div>
                    <p class="comment-item__text">{{ comment.content }}</p>
                    <div class="comment-item__actions">
                      <button
                        class="comment-item__action"
                        :class="{ active: commentLikeState[comment.id] }"
                        type="button"
                        @click="toggleCommentLike(comment.id)"
                      >
                        <ThumbsUp :size="13" :fill="commentLikeState[comment.id] ? '#F4830A' : 'none'" />
                        点赞{{ commentLikeCounts[comment.id] > 0 ? ` ${commentLikeCounts[comment.id]}` : "" }}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </article>

          <div v-if="relatedArticles.length" class="panel related-panel">
            <h3 class="related-panel__title">相关文章</h3>
            <article
              v-for="(related, index) in relatedArticles"
              :key="`${related.id}-${index}`"
              class="related-item"
              :class="{ last: index === relatedArticles.length - 1 }"
              @click="openArticle(related.id, related.slug)"
            >
              <h4 class="related-item__title">{{ related.title }}</h4>
              <p v-if="related.summary" class="related-item__summary line-clamp-2">{{ related.summary }}</p>
              <div class="related-item__meta">
                <span><Eye :size="12" /> {{ related.views }}</span>
                <span><MessageCircle :size="12" /> {{ related.comments }}</span>
                <span><ThumbsUp :size="12" /> {{ related.likes }}</span>
                <span v-if="related.tag" class="related-item__tag" :style="{ background: `${getTagColor(related.tag)}15`, color: getTagColor(related.tag) }">
                  {{ related.tag }}
                </span>
              </div>
            </article>
          </div>
        </div>

        <aside class="article-sidebar">
          <div class="panel sidebar-panel">
            <h4 class="sidebar-panel__label">作者信息</h4>
            <div class="sidebar-author">
              <BaseAvatar :clickable="true" :initials="article.author.initials" :size="56" @click="goToAuthor" />
              <button class="sidebar-author__name" type="button" @click="goToAuthor">{{ article.author.name }}</button>
              <p class="sidebar-author__meta">已加入 {{ authorJoinDays }} 天</p>
            </div>
            <div class="sidebar-stats">
              <div v-for="item in authorStats" :key="item.label">
                <strong>{{ item.value }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>

          <div v-if="tocItems.length" class="panel sidebar-panel">
            <h4 class="sidebar-panel__title">目录</h4>
            <div class="sidebar-toc">
              <div v-for="item in tocItems" :key="item" class="sidebar-toc__item">
                <span class="sidebar-toc__dot" />
                <span>{{ item }}</span>
              </div>
            </div>
          </div>

          <div v-if="relatedArticles.length" class="panel sidebar-panel">
            <h4 class="sidebar-panel__title">相关内容</h4>
            <div
              v-for="(related, index) in relatedArticles"
              :key="`${related.title}-${index}`"
              class="sidebar-related"
              @click="openArticle(related.id, related.slug)"
            >
              <span class="sidebar-related__index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <p class="sidebar-related__title line-clamp-2">{{ related.title }}</p>
            </div>
          </div>
        </aside>
      </div>

      <div v-else class="missing-state">
        <p>文章不存在</p>
        <RouterLink class="missing-state__link" to="/">返回首页</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Bookmark, Eye, MessageCircle, ThumbsUp } from "lucide-vue-next";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { fetchArticleDetail, type ArticleDetailAuthor, type ArticleDetailComment } from "@/api/article";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import type { SideBarSection } from "@/types/home";

interface CommentItem {
  id: number;
  author: string;
  initials: string;
  color: string;
  date: string;
  content: string;
  likes: number;
  liked: boolean;
}

interface ArticleAuthorViewModel {
  name: string;
  initials: string;
}

interface ArticleViewModel {
  id: number;
  urlSlug?: string;
  title: string;
  summary: string;
  cover?: string;
  date: string;
  views: number;
  likes: number;
  commentCount: number;
  tags: string[];
  contentHtml: string;
  author: ArticleAuthorViewModel;
}

interface RelatedArticle {
  id: number;
  slug?: string;
  title: string;
  summary: string;
  views: number;
  comments: number;
  likes: number;
  tag?: string;
}

const route = useRoute();
const router = useRouter();
const commentRef = ref<HTMLElement | null>(null);
const liked = ref(false);
const bookmarked = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const article = ref<ArticleViewModel | null>(null);
const comments = ref<CommentItem[]>([]);
const commentText = ref("");
const likeCount = ref(0);
const articleAuthor = ref<ArticleDetailAuthor | null>(null);
const sideBarSections = ref<SideBarSection[]>([]);
const commentLikeState = reactive<Record<number, boolean>>({});
const commentLikeCounts = reactive<Record<number, number>>({});

const tagColors: Record<string, string> = {
  AI: "#8B5CF6",
  后端: "#3B82F6",
  前端: "#10B981",
  架构: "#F59E0B",
  源码: "#EC4899",
  文章: "#6366F1",
  教程: "#EF4444",
};

const tocItems = computed(() => extractHeadings(article.value?.contentHtml ?? ""));

const relatedArticles = computed<RelatedArticle[]>(() => {
  const relatedSection = sideBarSections.value.find((item) => {
    const title = item.title ?? "";
    return title.includes("相关文章") || title.includes("推荐") || title.includes("热门");
  });

  return (relatedSection?.items ?? [])
    .map((item, index) => {
      const routeInfo = parseArticleRoute(item.url);
      return {
        id: routeInfo.id ?? index + 1,
        slug: routeInfo.slug,
        title: item.title || item.name || "未命名文章",
        summary: "",
        views: item.visit?.visit ?? 0,
        comments: 0,
        likes: 0,
        tag: article.value?.tags[0],
      };
    })
    .filter((item) => item.id > 0);
});

const authorStats = computed(() => [
  { label: "文章数", value: articleAuthor.value?.articleCount ?? 0 },
  { label: "点赞数", value: articleAuthor.value?.praiseCount ?? 0 },
  { label: "收藏数", value: articleAuthor.value?.collectionCount ?? 0 },
  { label: "粉丝数", value: articleAuthor.value?.fansCount ?? 0 },
]);

const authorJoinDays = computed(() => articleAuthor.value?.joinDayCount ?? 0);

watch(
  () => [route.params.id, route.params.slug],
  () => {
    void loadArticle();
  },
  { immediate: true },
);

async function loadArticle() {
  const articleId = Number(route.params.id);
  const urlSlug = typeof route.params.slug === "string" ? route.params.slug : undefined;

  if (!Number.isFinite(articleId) || articleId <= 0) {
    resetArticleState();
    errorMessage.value = "文章不存在";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const detail = await fetchArticleDetail(articleId, urlSlug);
    if (!detail.article) {
      resetArticleState();
      errorMessage.value = "文章不存在";
      return;
    }

    const authorName = detail.article.authorName || detail.author?.userName || "匿名作者";
    article.value = {
      id: detail.article.articleId,
      urlSlug: detail.article.urlSlug || undefined,
      title: detail.article.title,
      summary: detail.article.summary || "",
      cover: detail.article.cover || undefined,
      date: formatTimestamp(detail.article.createTime ?? detail.article.lastUpdateTime),
      views: detail.article.count?.readCount ?? 0,
      likes: detail.article.count?.praiseCount ?? 0,
      commentCount: detail.article.count?.commentCount ?? detail.comments?.length ?? 0,
      tags: (detail.article.tags ?? []).map((item) => item.tag).filter(Boolean),
      contentHtml: detail.article.content ?? "",
      author: {
        name: authorName,
        initials: getInitials(authorName),
      },
    };

    articleAuthor.value = detail.author ?? null;
    sideBarSections.value = detail.sideBarItems ?? [];
    comments.value = (detail.comments ?? []).map(mapComment);
    resetInteractiveState(detail.article.praised === true, detail.article.collected === true, detail.article.count?.praiseCount ?? 0);
  } catch (error) {
    resetArticleState();
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
}

function resetArticleState() {
  article.value = null;
  comments.value = [];
  articleAuthor.value = null;
  sideBarSections.value = [];
  likeCount.value = 0;
  liked.value = false;
  bookmarked.value = false;
}

function resetInteractiveState(initialLiked: boolean, initialBookmarked: boolean, initialLikes: number) {
  liked.value = initialLiked;
  bookmarked.value = initialBookmarked;
  commentText.value = "";
  likeCount.value = initialLikes;

  Object.keys(commentLikeState).forEach((key) => delete commentLikeState[Number(key)]);
  Object.keys(commentLikeCounts).forEach((key) => delete commentLikeCounts[Number(key)]);

  comments.value.forEach((item) => {
    commentLikeState[item.id] = item.liked;
    commentLikeCounts[item.id] = item.likes;
  });
}

function mapComment(item: ArticleDetailComment): CommentItem {
  const author = item.userName || "匿名用户";
  return {
    id: Number(item.commentId ?? Date.now()),
    author,
    initials: getInitials(author),
    color: "#6C63FF",
    date: item.commentTimeStr || formatTimestamp(item.commentTime),
    content: item.commentContent || "",
    likes: item.praiseCount ?? 0,
    liked: item.praised === true,
  };
}

function getInitials(name?: string) {
  const value = name?.trim();
  return value ? value.slice(0, 1).toUpperCase() : "U";
}

function getTagColor(tag: string) {
  return tagColors[tag] ?? "#6B7280";
}

function formatTimestamp(value?: number | null) {
  if (!value) {
    return "刚刚";
  }

  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractHeadings(html: string) {
  const matches = Array.from(html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi));
  return matches.map((item) => stripHtml(item[1])).filter(Boolean);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function parseArticleRoute(url?: string | null) {
  if (!url) {
    return { id: null as number | null, slug: undefined as string | undefined };
  }

  const detailMatch = url.match(/\/article\/detail\/(\d+)(?:\/([^/?#]+))?/);
  if (detailMatch) {
    return {
      id: Number(detailMatch[1]),
      slug: detailMatch[2] ? decodeURIComponent(detailMatch[2]) : undefined,
    };
  }

  const legacyMatch = url.match(/\/article\/(\d+)/);
  return {
    id: legacyMatch ? Number(legacyMatch[1]) : null,
    slug: undefined,
  };
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "文章详情加载失败，请稍后重试。";
}

const handleLike = () => {
  liked.value = !liked.value;
  likeCount.value += liked.value ? 1 : -1;
};

const toggleCommentLike = (id: number) => {
  commentLikeState[id] = !commentLikeState[id];
  commentLikeCounts[id] += commentLikeState[id] ? 1 : -1;
};

const scrollToComments = () => {
  commentRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const submitComment = () => {
  const value = commentText.value.trim();
  if (!value) {
    return;
  }

  const newComment: CommentItem = {
    id: Date.now(),
    author: "我",
    initials: "我",
    color: "#6C63FF",
    date: formatTimestamp(Date.now()),
    content: value,
    likes: 0,
    liked: false,
  };

  comments.value.unshift(newComment);
  commentLikeState[newComment.id] = false;
  commentLikeCounts[newComment.id] = 0;
  commentText.value = "";
};

const goToAuthor = () => {
  if (article.value) {
    router.push(`/author/${encodeURIComponent(article.value.author.name)}`);
  }
};

const openArticle = (id: number, slug?: string) => {
  router.push({
    name: "article",
    params: {
      id,
      slug: slug || undefined,
    },
  });
};
</script>

<style scoped>
.article-shell {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0 48px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.article-layout {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 260px;
  gap: 24px;
}

.side-actions__sticky {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 40px;
}

.side-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
}

.side-action__circle {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.side-action.active {
  color: #6c63ff;
}

.side-action.active .side-action__circle {
  border-color: #6c63ff;
  background: rgba(108, 99, 255, 0.06);
}

.side-action.orange {
  color: #f4830a;
}

.side-action.orange .side-action__circle {
  border-color: #f4830a;
  background: #fff7ed;
}

.article-main {
  min-width: 0;
}

.article-card {
  padding: 32px;
}

.article-card__cover {
  margin-bottom: 24px;
  overflow: hidden;
  border-radius: 20px;
}

.article-card__cover img {
  display: block;
  width: 100%;
  object-fit: cover;
}

.article-card__title {
  margin: 0 0 16px;
  color: #111827;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.35;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.article-card__author {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-card__author-name {
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.article-card__author-name:hover {
  color: #6c63ff;
}

.article-card__author-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 12px;
}

.article-card__views {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.article-card__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;
}

.article-card__tag {
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11px;
}

.article-card__summary {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.8;
}

.article-card__divider {
  margin-bottom: 24px;
  border-top: 1px solid #f3f4f6;
}

.article-card__body {
  color: #374151;
  font-size: 15px;
  line-height: 1.9;
}

.article-card__body :deep(h1),
.article-card__body :deep(h2),
.article-card__body :deep(h3) {
  color: #111827;
  font-weight: 700;
}

.article-card__body :deep(h1) {
  margin: 32px 0 16px;
  font-size: 28px;
}

.article-card__body :deep(h2) {
  margin: 28px 0 14px;
  font-size: 22px;
}

.article-card__body :deep(h3) {
  margin: 20px 0 12px;
  font-size: 18px;
}

.article-card__body :deep(p),
.article-card__body :deep(ul),
.article-card__body :deep(ol) {
  margin: 14px 0;
}

.article-card__body :deep(img) {
  max-width: 100%;
  border-radius: 16px;
}

.article-card__body :deep(pre) {
  overflow-x: auto;
  border-radius: 16px;
  background: #0f172a;
  padding: 18px;
  color: #e2e8f0;
}

.article-card__body :deep(code) {
  font-family: "IBM Plex Mono", Consolas, monospace;
}

.article-card__body :deep(blockquote) {
  margin: 20px 0;
  border-left: 4px solid #f97316;
  background: #fff7ed;
  padding: 12px 16px;
  color: #9a3412;
}

.like-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  border-top: 1px solid #f3f4f6;
  padding-top: 36px;
}

.like-section__button {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 2px solid #d1d5db;
  border-radius: 999px;
  background: #ffffff;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.like-section__button.active {
  border-color: #f4830a;
  background: #fff7ed;
  color: #f4830a;
  box-shadow: 0 0 0 4px rgba(244, 131, 10, 0.1);
  transform: scale(1.08);
}

.like-section__line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-section__line span {
  width: 64px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(244, 131, 10, 0.4));
}

.like-section__line span:last-child {
  background: linear-gradient(to left, transparent, rgba(244, 131, 10, 0.4));
}

.like-section__line strong {
  color: #f4830a;
  font-size: 13px;
  font-weight: 500;
}

.comment-section {
  margin-top: 24px;
  border-top: 1px solid #f3f4f6;
  padding-top: 24px;
}

.comment-editor {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-editor__box {
  flex: 1;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fafafa;
}

.comment-editor__box:focus-within {
  border-color: #6c63ff;
}

.comment-editor__textarea {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 12px 16px 4px;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.7;
  resize: none;
  outline: none;
}

.comment-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 8px;
  color: #9ca3af;
  font-size: 12px;
}

.comment-editor__submit {
  border-radius: 8px;
  background: #6c63ff;
  padding: 4px 16px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.comment-editor__submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.comment-list__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.comment-list__title span {
  color: #f4830a;
}

.comment-list__empty {
  border-radius: 16px;
  background: #f9fafb;
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #f9fafb;
}

.comment-item__content {
  flex: 1;
  min-width: 0;
}

.comment-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.comment-item__author {
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}

.comment-item__date {
  color: #9ca3af;
  font-size: 12px;
}

.comment-item__text {
  margin: 0 0 8px;
  color: #374151;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.comment-item__actions {
  display: flex;
  gap: 16px;
}

.comment-item__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
}

.comment-item__action.active {
  color: #f4830a;
}

.related-panel {
  margin-top: 24px;
  padding: 24px 24px 8px;
}

.related-panel__title {
  margin: 0 0 16px;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.related-item {
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.related-item.last {
  border-bottom: 0;
}

.related-item__title {
  margin: 0 0 6px;
  color: #111827;
  font-size: 15px;
  font-weight: 600;
}

.related-item:hover .related-item__title {
  color: #6c63ff;
}

.related-item__summary {
  margin: 0 0 10px;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.6;
}

.related-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 12px;
}

.related-item__meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.related-item__tag {
  margin-left: auto;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}

.article-sidebar {
  width: 260px;
}

.sidebar-panel {
  margin-bottom: 16px;
  padding: 20px;
}

.sidebar-panel__label,
.sidebar-panel__title {
  margin: 0 0 16px;
}

.sidebar-panel__label {
  color: #6b7280;
  font-size: 13px;
}

.sidebar-panel__title {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.sidebar-author {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sidebar-author__name {
  margin-top: 12px;
  color: #111827;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.sidebar-author__name:hover {
  color: #6c63ff;
}

.sidebar-author__meta {
  margin: 4px 0 0;
  color: #9ca3af;
  font-size: 12px;
}

.sidebar-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid #f9fafb;
  padding-top: 12px;
}

.sidebar-stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.sidebar-stats strong {
  color: #111827;
  font-size: 14px;
}

.sidebar-stats span {
  color: #9ca3af;
  font-size: 10px;
}

.sidebar-toc {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-toc__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.sidebar-toc__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  margin-top: 6px;
  border-radius: 999px;
  background: #f4830a;
}

.sidebar-related {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}

.sidebar-related__index {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #d1d5db;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.sidebar-related__index.top {
  background: #f59e0b;
}

.sidebar-related__title {
  margin: 2px 0 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

.missing-state {
  display: flex;
  min-height: 60vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.missing-state p {
  margin: 0;
  color: #6b7280;
}

.missing-state__link {
  color: #6c63ff;
  font-size: 14px;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 1200px) {
  .article-layout {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .article-sidebar {
    display: none;
  }
}

@media (max-width: 900px) {
  .article-layout {
    grid-template-columns: 1fr;
  }

  .side-actions {
    display: none;
  }

  .article-card,
  .related-panel {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
