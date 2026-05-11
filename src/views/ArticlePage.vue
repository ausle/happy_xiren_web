<template>
  <div class="article-shell">
    <div class="page-shell article-wrap">
      <button class="back-button" type="button" @click="router.back()">
        <ArrowLeft :size="15" />
        返回
      </button>

      <div v-if="article" class="article-layout">
        <div class="side-actions desktop-only">
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
            <button class="side-action" type="button">
              <div class="side-action__circle">
                <Share2 :size="17" />
              </div>
              <span>分享</span>
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
                </div>
              </div>
              <div class="article-card__tags">
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

            <div class="article-card__divider" />

            <div class="article-card__body">
              <template v-for="block in bodyBlocks" :key="block.key">
                <h1 v-if="block.type === 'h1'" class="body-h1">{{ block.text }}</h1>
                <h2 v-else-if="block.type === 'h2'" class="body-h2">{{ block.text }}</h2>
                <ul v-else-if="block.type === 'list'" class="body-list">
                  <li v-for="item in block.items" :key="item">{{ item }}</li>
                </ul>
                <p v-else class="body-paragraph">
                  <template v-for="segment in block.segments" :key="segment.text + segment.strong">
                    <strong v-if="segment.strong">{{ segment.text }}</strong>
                    <template v-else>{{ segment.text }}</template>
                  </template>
                </p>
              </template>
            </div>

            <div class="like-section">
              <button class="like-section__button" :class="{ active: liked }" type="button" @click="handleLike">
                <ThumbsUp :size="22" :fill="liked ? '#F4830A' : 'none'" />
              </button>
              <div class="like-section__line">
                <span />
                <strong>{{ liked ? `${likeCount} 人已点赞` : "真诚点赞 诚不我欺" }}</strong>
                <span />
              </div>
              <div v-if="liked" class="like-section__avatars">
                <div
                  v-for="(item, index) in likerAvatars"
                  :key="`${item.initials}-${index}`"
                  class="like-section__avatar-wrap"
                  :style="{ marginLeft: index > 0 ? '-8px' : '0' }"
                >
                  <BaseAvatar :color="item.color" :initials="item.initials" />
                </div>
                <BaseAvatar color="#F4830A" initials="你" />
              </div>
            </div>

            <div ref="commentRef" class="comment-section">
              <div class="comment-editor">
                <BaseAvatar initials="你" :size="36" />
                <div class="comment-editor__box">
                  <textarea
                    v-model="commentText"
                    class="comment-editor__textarea"
                    placeholder="讨论应以学习和精进为目的。请勿发布不友善或者负能量的内容，与人为善，比聪明更重要！"
                    rows="3"
                  />
                  <div class="comment-editor__footer">
                    <button class="comment-editor__emoji" type="button">
                      <Smile :size="18" />
                    </button>
                    <div class="comment-editor__actions">
                      <span>{{ commentText.length }}/512</span>
                      <button class="comment-editor__submit" :disabled="!commentText.trim()" type="button" @click="submitComment">
                        评论
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="comments.length" class="comment-list">
                <h3 class="comment-list__title"><span>{{ comments.length }}</span> 条评论</h3>
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
                      <button class="comment-item__action" type="button" @click="replyingId = replyingId === comment.id ? null : comment.id">
                        <MessageCircle :size="13" />
                        回复
                      </button>
                    </div>
                    <div v-if="replyingId === comment.id" class="comment-item__reply">
                      <input
                        v-model="replyText"
                        class="comment-item__reply-input"
                        :placeholder="`回复 ${comment.author}...`"
                        type="text"
                        @keydown.enter="replyingId = null"
                      />
                      <button class="comment-item__reply-submit" type="button" @click="replyingId = null">回复</button>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <div class="mobile-actions mobile-only">
              <button class="mobile-action" type="button" @click="handleLike">
                <ThumbsUp :size="15" :fill="liked ? '#F4830A' : 'none'" />
                {{ likeCount > 0 ? likeCount : "点赞" }}
              </button>
              <button class="mobile-action" type="button" @click="scrollToComments">
                <MessageCircle :size="15" />
                评论
              </button>
              <button class="mobile-action" :class="{ bookmarked }" type="button" @click="bookmarked = !bookmarked">
                <Bookmark :size="15" :fill="bookmarked ? '#6C63FF' : 'none'" />
                收藏
              </button>
            </div>
          </article>

          <div class="panel related-panel">
            <h3 class="related-panel__title">相关推荐</h3>
            <article
              v-for="(related, index) in recommendedArticles"
              :key="related.id"
              class="related-item"
              :class="{ last: index === recommendedArticles.length - 1 }"
              @click="openArticle(related.id)"
            >
              <h4 class="related-item__title">{{ related.title }}</h4>
              <p class="related-item__summary line-clamp-2">{{ related.summary }}</p>
              <div class="related-item__meta">
                <div class="related-item__author">
                  <BaseAvatar :initials="related.author.initials" :size="20" />
                  <span>{{ related.author.name }}</span>
                  <span class="dot-separator">·</span>
                  <span class="muted-text">{{ related.date }}</span>
                </div>
                <span><Eye :size="12" /> {{ related.views }}</span>
                <span><MessageCircle :size="12" /> {{ related.comments }}</span>
                <span><ThumbsUp :size="12" /> {{ related.likes }}</span>
                <span class="related-item__tag" :style="{ background: `${getTagColor(related.tags[0])}15`, color: getTagColor(related.tags[0]) }">
                  {{ related.tags[0] }}
                </span>
              </div>
            </article>
          </div>
        </div>

        <aside class="article-sidebar desktop-only">
          <div class="panel sidebar-panel">
            <h4 class="sidebar-panel__label">作者介绍</h4>
            <div class="sidebar-author">
              <BaseAvatar :clickable="true" :initials="article.author.initials" :size="56" @click="goToAuthor" />
              <button class="sidebar-author__name" type="button" @click="goToAuthor">{{ article.author.name }}</button>
              <p class="sidebar-author__meta">已加入 1224 天 ✓</p>
              <button class="sidebar-author__btn" type="button">教程</button>
            </div>
            <div class="sidebar-stats">
              <div v-for="item in authorStats" :key="item.label">
                <strong>{{ item.value }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>

          <div class="panel sidebar-panel">
            <h4 class="sidebar-panel__title">目录</h4>
            <div class="sidebar-toc">
              <div v-for="(item, index) in tocItems" :key="item" class="sidebar-toc__item">
                <span class="sidebar-toc__dot" :class="{ active: index === 0 }" />
                <span>{{ item }}</span>
              </div>
            </div>
          </div>

          <div class="panel sidebar-panel">
            <h4 class="sidebar-panel__title">优质 PDF</h4>
            <div class="sidebar-pdf">
              <div class="sidebar-pdf__icon">📄</div>
              <div>
                <p class="sidebar-pdf__name">面渣逆袭 2.0 PDF</p>
                <p class="sidebar-pdf__score">★★★★★ <span>9.1</span></p>
                <p class="sidebar-pdf__meta">👁 313382 &nbsp;⬇ 55122</p>
              </div>
            </div>
            <button class="sidebar-pdf__btn" type="button">立即下载</button>
          </div>

          <div class="panel sidebar-panel">
            <h4 class="sidebar-panel__title">相关文章</h4>
            <div v-for="(title, index) in relatedArticles" :key="title" class="sidebar-related" @click="openArticle(recommendedArticles[0]?.id ?? article.id)">
              <span class="sidebar-related__index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <p class="sidebar-related__title line-clamp-2">{{ title }}</p>
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
import { ArrowLeft, Bookmark, Eye, MessageCircle, Share2, Smile, ThumbsUp } from "lucide-vue-next";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import { articles, relatedArticles } from "@/data/articles";

interface CommentItem {
  id: number;
  author: string;
  initials: string;
  color: string;
  date: string;
  content: string;
  likes: number;
}

type BodyBlock =
  | { key: string; type: "h1"; text: string }
  | { key: string; type: "h2"; text: string }
  | { key: string; type: "list"; items: string[] }
  | { key: string; type: "paragraph"; segments: { text: string; strong: boolean }[] };

const likerAvatars = [
  { initials: "王", color: "#6C63FF" },
  { initials: "李", color: "#F59E0B" },
  { initials: "张", color: "#10B981" },
];

const initialComments: CommentItem[] = [
  { id: 1, author: "阿苏勒", initials: "苏", color: "#6C63FF", date: "2026年05月11日 18:01", content: "嗯嗯嗯", likes: 0 },
  { id: 2, author: "深夜码字人", initials: "深", color: "#F59E0B", date: "2026年05月10日 22:30", content: "写得很好，收藏了，希望作者继续更新！", likes: 2 },
];

const route = useRoute();
const router = useRouter();
const commentRef = ref<HTMLElement | null>(null);
const liked = ref(false);
const bookmarked = ref(false);
const comments = ref<CommentItem[]>([]);
const commentText = ref("");
const replyingId = ref<number | null>(null);
const replyText = ref("");
const commentLikeState = reactive<Record<number, boolean>>({});
const commentLikeCounts = reactive<Record<number, number>>({});

const article = computed(() => articles.find((item) => item.id === Number(route.params.id)));
const likeCount = ref(0);

watch(
  article,
  (current) => {
    liked.value = false;
    bookmarked.value = false;
    commentText.value = "";
    replyingId.value = null;
    replyText.value = "";
    comments.value = initialComments.map((item) => ({ ...item }));
    likeCount.value = current?.likes ?? 0;
    Object.keys(commentLikeState).forEach((key) => delete commentLikeState[Number(key)]);
    Object.keys(commentLikeCounts).forEach((key) => delete commentLikeCounts[Number(key)]);
    comments.value.forEach((item) => {
      commentLikeState[item.id] = false;
      commentLikeCounts[item.id] = item.likes;
    });
  },
  { immediate: true },
);

const tagColors: Record<string, string> = {
  AI: "#8B5CF6",
  工具推荐: "#3B82F6",
  增长策略: "#10B981",
  变现方法: "#F59E0B",
  案例拆解: "#EC4899",
  精选专栏: "#6366F1",
  内容: "#EF4444",
  面试: "#14B8A6",
  求职: "#F97316",
};

const getTagColor = (tag: string) => tagColors[tag] ?? "#6B7280";

const bodyBlocks = computed<BodyBlock[]>(() => {
  if (!article.value) return [];

  return article.value.body.split("\n\n").map((paragraph: string, index: number) => {
    if (paragraph.startsWith("## ")) {
      return { key: `${index}-h2`, type: "h2", text: paragraph.slice(3) };
    }
    if (paragraph.startsWith("# ")) {
      return { key: `${index}-h1`, type: "h1", text: paragraph.slice(2) };
    }
    const lines = paragraph.split("\n");
    if (lines.every((line: string) => /^(\d+\.|[-*])/.test(line.trim()))) {
      return {
        key: `${index}-list`,
        type: "list",
        items: lines.map((line: string) => line.replace(/^(\d+\.|[-*])\s*/, "")),
      };
    }
    const segments = paragraph.split(/\*\*(.*?)\*\*/g).map((segment: string, segmentIndex: number) => ({
      text: segment,
      strong: segmentIndex % 2 === 1,
    }));
    return { key: `${index}-p`, type: "paragraph", segments };
  });
});

const tocItems = computed(() =>
  bodyBlocks.value
    .filter((item): item is Extract<BodyBlock, { type: "h2" }> => item.type === "h2")
    .map((item) => item.text),
);

const recommendedArticles = computed(() =>
  articles.filter((item) => item.id !== article.value?.id).slice(0, 5),
);

const authorStats = [
  { label: "文章数", value: 316 },
  { label: "点赞数", value: 1188 },
  { label: "收藏数", value: 82 },
  { label: "粉丝数", value: 98 },
];

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
  if (!value) return;

  comments.value.unshift({
    id: Date.now(),
    author: "你",
    initials: "你",
    color: "#6C63FF",
    date: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\//g, "年").replace(" ", "日 "),
    content: value,
    likes: 0,
  });

  const newComment = comments.value[0];
  commentLikeState[newComment.id] = false;
  commentLikeCounts[newComment.id] = 0;
  commentText.value = "";
};

const goToAuthor = () => {
  if (article.value) {
    router.push(`/author/${encodeURIComponent(article.value.author.name)}`);
  }
};

const openArticle = (id: number) => {
  router.push(`/article/${id}`);
};
</script>

<style scoped>
.article-shell {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 0;
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
  display: flex;
  gap: 24px;
}

.side-actions {
  width: 52px;
  flex-shrink: 0;
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
  flex: 1;
  min-width: 0;
}

.article-card {
  padding: 32px;
}

.article-card__title {
  margin: 0 0 16px;
  color: #111827;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.article-card__author {
  display: flex;
  flex-direction: column;
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
  gap: 8px;
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
  padding: 2px 8px;
  font-size: 11px;
}

.article-card__divider {
  margin-bottom: 24px;
  border-top: 1px solid #f3f4f6;
}

.body-h1,
.body-h2 {
  color: #111827;
  font-weight: 700;
}

.body-h1 {
  margin: 32px 0 16px;
  font-size: 26px;
}

.body-h2 {
  margin: 24px 0 12px;
  font-size: 20px;
}

.body-paragraph {
  margin: 12px 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.9;
}

.body-paragraph strong {
  color: #111827;
  font-weight: 600;
}

.body-list {
  margin: 12px 0;
  padding-left: 24px;
}

.body-list li {
  color: #374151;
  font-size: 15px;
  line-height: 1.8;
}

.like-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  border-top: 1px solid #f3f4f6;
  padding-top: 40px;
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

.like-section__avatars {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.like-section__avatar-wrap {
  border-radius: 999px;
  box-shadow: 0 0 0 2px #ffffff;
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
}

.comment-editor__emoji {
  color: #9ca3af;
  cursor: pointer;
}

.comment-editor__actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.comment-item__reply {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.comment-item__reply-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
}

.comment-item__reply-input:focus {
  border-color: #6c63ff;
}

.comment-item__reply-submit {
  border-radius: 10px;
  background: #6c63ff;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
}

.mobile-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.mobile-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 12px;
  cursor: pointer;
}

.mobile-action.bookmarked {
  color: #6c63ff;
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

.related-item__author {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.related-item__tag {
  margin-left: auto;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}

.article-sidebar {
  width: 260px;
  flex-shrink: 0;
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

.sidebar-author__btn {
  margin-top: 12px;
  border-radius: 10px;
  background: #f59e0b;
  padding: 6px 16px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
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
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 12px;
}

.sidebar-toc__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #d1d5db;
}

.sidebar-toc__dot.active {
  background: #f4830a;
}

.sidebar-pdf {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-pdf__icon {
  display: flex;
  width: 56px;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: #ffffff;
  font-size: 24px;
}

.sidebar-pdf__name {
  margin: 0;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
}

.sidebar-pdf__score,
.sidebar-pdf__meta {
  margin: 4px 0 0;
  font-size: 11px;
}

.sidebar-pdf__score {
  color: #f59e0b;
}

.sidebar-pdf__score span,
.sidebar-pdf__meta {
  color: #9ca3af;
}

.sidebar-pdf__btn {
  width: 100%;
  margin-top: 12px;
  border-radius: 10px;
  background: #6c63ff;
  padding: 6px 12px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
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

@media (max-width: 1024px) {
  .article-layout {
    display: block;
  }

  .article-card,
  .related-panel {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
