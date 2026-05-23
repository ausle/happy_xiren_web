<template>
  <div class="write-page">
    <div class="write-page__topline" aria-hidden="true"></div>

    <header class="write-page__header">
      <input
        v-model="title"
        class="write-page__title"
        maxlength="120"
        placeholder="输入文章标题..."
        type="text"
      />

      <div class="write-page__actions">
        <button class="write-page__save" type="button" @click="openPublishDialog">保存</button>

        <div class="write-page__avatar">
          <img
            v-if="showPhotoAvatar"
            :src="authStore.user?.photo"
            :alt="authStore.user?.username"
            class="write-page__avatar-photo"
            @error="avatarLoadError = true"
          />
          <BaseAvatar
            v-else
            :initials="authStore.initials"
            :size="38"
            color="#d4a43a"
            rounded="999px"
          />
        </div>
      </div>
    </header>

    <main class="write-page__body">
      <div v-if="pendingDraft" class="draft-banner">
        <span>检测到上次未发布的草稿。</span>
        <div class="draft-banner__actions">
          <button class="draft-banner__action draft-banner__action--primary" type="button" @click="restoreDraft">
            恢复草稿
          </button>
          <button class="draft-banner__action" type="button" @click="discardDraft">
            丢弃草稿
          </button>
        </div>
      </div>

      <div :id="editorId" ref="editorElement" class="write-page__editor">
        <textarea style="display: none"></textarea>
      </div>
    </main>

    <ElDialog
      v-model="publishDialogVisible"
      class="publish-dialog"
      width="760px"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <template #header>
        <div class="publish-dialog__title">发布文章</div>
      </template>

      <div class="publish-form">
        <section class="publish-form__section">
          <div class="publish-form__label"><span>*</span> 分类</div>
          <div class="publish-choice-grid">
            <button
              v-for="category in categories"
              :key="category.categoryId"
              class="publish-choice"
              :class="{ 'publish-choice--active': selectedCategoryId === category.categoryId }"
              type="button"
              @click="selectedCategoryId = category.categoryId"
            >
              {{ category.category }}
            </button>
          </div>
        </section>

        <section class="publish-form__section">
          <div class="publish-form__label"><span>*</span> 添加标签</div>
          <ElSelect
            v-model="selectedTagIds"
            class="publish-form__select"
            collapse-tags
            collapse-tags-tooltip
            filterable
            multiple
            :multiple-limit="3"
            placeholder="请选择你需要的标签，最多三个"
            remote
            reserve-keyword
            :loading="loadingTags"
            @change="handleTagChange"
            @visible-change="handleTagSelectVisible"
            :remote-method="handleTagSearch"
          >
            <ElOption v-for="tag in tagOptions" :key="tag.tagId" :label="tag.tag" :value="tag.tagId" />
          </ElSelect>
        </section>

        <section class="publish-form__section">
          <div class="publish-form__label"><span>*</span> 阅读类型</div>
          <div class="publish-choice-row">
            <button
              v-for="option in readTypeOptions"
              :key="option.value"
              class="publish-choice"
              :class="{ 'publish-choice--active': selectedReadType === option.value }"
              type="button"
              @click="selectedReadType = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </section>

        <section class="publish-form__section">
          <div class="publish-form__label">文章封面</div>
          <button class="cover-picker" :disabled="uploadingCover" type="button" @click="triggerCoverUpload">
            <img v-if="coverUrl" :src="coverUrl" alt="文章封面" class="cover-picker__image" />
            <template v-else>
              <ImagePlus :size="28" />
              <span>{{ uploadingCover ? "上传中..." : "上传封面" }}</span>
            </template>
          </button>
          <p class="cover-picker__hint">支持 JPG、PNG、WEBP，建议横向大图。</p>
        </section>

        <section class="publish-form__section">
          <div class="publish-summary__head">
            <div class="publish-form__label"><span>*</span> 文章摘要</div>
            <button
              class="summary-generate"
              :disabled="generatingSummary"
              type="button"
              @click="handleGenerateSummary"
            >
              <Sparkles :size="15" />
              {{ generatingSummary ? "提取中..." : "一键提取" }}
            </button>
          </div>
          <div class="publish-summary__wrap">
            <textarea
              v-model="summary"
              class="publish-summary__textarea"
              maxlength="256"
              placeholder="摘要会展示在文章列表中，建议控制在 256 字以内。"
            />
            <span class="publish-summary__count">{{ summary.length }}/256</span>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="publish-dialog__footer">
          <button class="publish-dialog__action publish-dialog__action--primary" :disabled="publishing" type="button" @click="handlePublish">
            {{ publishing ? "发布中..." : "发布" }}
          </button>
          <button class="publish-dialog__action publish-dialog__action--secondary" :disabled="publishing" type="button" @click="handleSaveDraft">
            存草稿
          </button>
        </div>
      </template>
    </ElDialog>

    <input ref="coverInputRef" accept="image/*" class="write-page__hidden-input" type="file" @change="handleCoverSelected" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ImagePlus, Sparkles } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  extractApiErrorMessage,
  fetchWriteCategories,
  generateArticleSummary,
  saveRemoteArticleImage,
  searchWriteTags,
  submitArticle,
  uploadArticleCover,
} from "@/api/write";
import BaseAvatar from "@/components/common/BaseAvatar.vue";
import { useAuthStore } from "@/stores/auth";
import type { HomeCategory, HomeTag } from "@/types/home";

type EditorMdInstance = {
  getMarkdown?: () => string;
  setMarkdown?: (value: string) => void;
  resize?: (width: string, height: number) => void;
};

type DraftTag = {
  tagId: number;
  tag: string;
};

type WriteDraft = {
  title?: string;
  markdown?: string;
  categoryId?: number | null;
  tagIds?: number[];
  tags?: DraftTag[];
  readType?: number;
  cover?: string;
  summary?: string;
};

type ReadTypeOption = {
  value: number;
  label: string;
};

declare global {
  interface Window {
    $?: (...args: unknown[]) => unknown;
    jQuery?: (...args: unknown[]) => unknown;
    editormd?: (id: string, options: Record<string, unknown>) => EditorMdInstance;
    __EDITOR_MD_SAVE_IMAGE__?: (imgUrl: string) => Promise<string>;
    __EDITOR_MD_TOAST__?: (message: string, type?: "success" | "warning" | "error" | "info") => void;
  }
}

const DRAFT_STORAGE_KEY = "happy-vue3:write-article-draft";
const editorId = "write-article-editor";
const editorBase = `${import.meta.env.BASE_URL}vendor/editor.md/`;
const vendorBase = `${import.meta.env.BASE_URL}vendor/`;
const readTypeOptions: ReadTypeOption[] = [
  { value: 0, label: "全部可读" },
  { value: 1, label: "登录阅读" },
  { value: 4, label: "付费阅读" },
];

const authStore = useAuthStore();
const router = useRouter();
const title = ref("");
const avatarLoadError = ref(false);
const draftMarkdown = ref("");
const editorElement = ref<HTMLElement | null>(null);
const editorInstance = ref<EditorMdInstance | null>(null);
const publishDialogVisible = ref(false);
const categories = ref<HomeCategory[]>([]);
const selectedCategoryId = ref<number | null>(null);
const selectedTagIds = ref<number[]>([]);
const tagOptions = ref<HomeTag[]>([]);
const selectedReadType = ref(0);
const coverUrl = ref("");
const summary = ref("");
const coverInputRef = ref<HTMLInputElement | null>(null);
const loadingTags = ref(false);
const uploadingCover = ref(false);
const generatingSummary = ref(false);
const publishing = ref(false);
const pendingDraft = ref<WriteDraft | null>(null);

const showPhotoAvatar = computed(() => !!authStore.user?.photo && !avatarLoadError.value);

const getEditorMarkdown = () => editorInstance.value?.getMarkdown?.() ?? draftMarkdown.value;

const showEditorToast = (message: string, type: "success" | "warning" | "error" | "info" = "warning") => {
  ElMessage({
    message,
    type,
    grouping: true,
  });
};

const buildDraftTags = () =>
  selectedTagIds.value
    .map((tagId) => tagOptions.value.find((item) => item.tagId === tagId))
    .filter((item): item is HomeTag => Boolean(item))
    .map((item) => ({
      tagId: item.tagId,
      tag: item.tag,
    }));

const applyDraft = (parsed: WriteDraft) => {
  title.value = parsed.title ?? "";
  draftMarkdown.value = parsed.markdown ?? "";
  selectedCategoryId.value = parsed.categoryId ?? null;
  selectedTagIds.value = parsed.tagIds ?? [];
  selectedReadType.value = parsed.readType ?? 0;
  coverUrl.value = parsed.cover ?? "";
  summary.value = parsed.summary ?? "";
  tagOptions.value = (parsed.tags ?? []).map((item) => ({
    tagId: item.tagId,
    tag: item.tag,
  }));
  editorInstance.value?.setMarkdown?.(draftMarkdown.value);
};

const inspectDraft = () => {
  try {
    const cached = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as WriteDraft;
    const hasContent = Boolean(
      parsed.title?.trim() ||
      parsed.markdown?.trim() ||
      parsed.summary?.trim() ||
      parsed.cover ||
      parsed.tagIds?.length ||
      parsed.categoryId,
    );

    return hasContent ? parsed : null;
  } catch {
    return null;
  }
};

const hasMeaningfulDraft = () =>
  Boolean(
    title.value.trim() ||
    getEditorMarkdown().trim() ||
    summary.value.trim() ||
    coverUrl.value ||
    selectedTagIds.value.length ||
    selectedCategoryId.value,
  );

const persistLocalDraft = () => {
  if (!hasMeaningfulDraft()) {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      title: title.value.trim(),
      markdown: getEditorMarkdown(),
      categoryId: selectedCategoryId.value,
      tagIds: selectedTagIds.value,
      tags: buildDraftTags(),
      readType: selectedReadType.value,
      cover: coverUrl.value,
      summary: summary.value.trim(),
    }),
  );
};

const ensureStyle = (href: string, id: string) => {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
};

const loadScript = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.body.appendChild(script);
  });

const resizeEditor = () => {
  const nextHeight = Math.max(window.innerHeight - 58, 620);
  editorInstance.value?.resize?.("100%", nextHeight);
};

const initEditor = () => {
  if (!window.editormd || !editorElement.value) return;

  editorElement.value.innerHTML = '<textarea style="display:none;"></textarea>';
  editorInstance.value = window.editormd(editorId, {
    width: "100%",
    height: Math.max(window.innerHeight - 58, 620),
    path: `${editorBase}lib/`,
    markdown: draftMarkdown.value,
    placeholder: "Enjoy Markdown! coding now...",
    watch: true,
    syncScrolling: "single",
    searchReplace: true,
    saveHTMLToTextarea: true,
    imageUpload: true,
    imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
    imageUploadURL: `${import.meta.env.VITE_API_BASE_URL ?? "/api"}/image/upload`,
    toolbarIcons: "full",
    onload() {
      resizeEditor();
    },
  });
};

const mergeTagOptions = (nextOptions: HomeTag[]) => {
  const merged = new Map<number, HomeTag>();
  tagOptions.value.forEach((item) => merged.set(item.tagId, item));
  nextOptions.forEach((item) => merged.set(item.tagId, item));
  tagOptions.value = Array.from(merged.values());
};

const loadCategories = async () => {
  try {
    categories.value = await fetchWriteCategories();
  } catch (value) {
    ElMessage.error(extractApiErrorMessage(value));
  }
};

const handleTagSearch = async (keyword: string) => {
  loadingTags.value = true;

  try {
    const tags = await searchWriteTags(keyword);
    mergeTagOptions(tags);
  } catch (value) {
    ElMessage.error(extractApiErrorMessage(value));
  } finally {
    loadingTags.value = false;
  }
};

const handleTagSelectVisible = (visible: boolean) => {
  if (visible && tagOptions.value.length === 0) {
    void handleTagSearch("");
  }
};

const handleTagChange = (value: number[]) => {
  if (value.length <= 3) {
    selectedTagIds.value = value;
    return;
  }

  selectedTagIds.value = value.slice(0, 3);
  ElMessage.warning("最多选择 3 个标签");
};

const openPublishDialog = () => {
  publishDialogVisible.value = true;
  if (categories.value.length === 0) {
    void loadCategories();
  }
};

const triggerCoverUpload = () => {
  if (uploadingCover.value) return;
  coverInputRef.value?.click();
};

const handleCoverSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  uploadingCover.value = true;

  try {
    coverUrl.value = await uploadArticleCover(file);
    ElMessage.success("封面上传成功");
  } catch (value) {
    ElMessage.error(extractApiErrorMessage(value));
  } finally {
    uploadingCover.value = false;
    if (input) {
      input.value = "";
    }
  }
};

const restoreDraft = () => {
  if (!pendingDraft.value) return;
  applyDraft(pendingDraft.value);
  pendingDraft.value = null;
  ElMessage.success("已恢复上次草稿");
};

const discardDraft = () => {
  pendingDraft.value = null;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  ElMessage.success("已丢弃草稿");
};

const handleGenerateSummary = async () => {
  const markdown = getEditorMarkdown().trim();
  if (!markdown) {
    ElMessage.warning("请先输入文章内容");
    return;
  }

  generatingSummary.value = true;

  try {
    summary.value = (await generateArticleSummary(markdown)).trim().slice(0, 256);
    ElMessage.success("摘要已生成");
  } catch (value) {
    ElMessage.error(extractApiErrorMessage(value));
  } finally {
    generatingSummary.value = false;
  }
};

const handleSaveDraft = () => {
  persistLocalDraft();
  publishDialogVisible.value = false;
  ElMessage.success("已保存到本地草稿");
};

const handlePublish = async () => {
  const nextTitle = title.value.trim();
  const markdown = getEditorMarkdown().trim();
  const nextSummary = summary.value.trim();

  if (!nextTitle) {
    ElMessage.warning("请先输入文章标题");
    return;
  }

  if (!markdown) {
    ElMessage.warning("请先输入文章内容");
    return;
  }

  if (!selectedCategoryId.value) {
    ElMessage.warning("请选择文章分类");
    return;
  }

  if (!selectedTagIds.value.length) {
    ElMessage.warning("请至少选择一个标签");
    return;
  }

  if (!nextSummary) {
    ElMessage.warning("请先生成或填写文章摘要");
    return;
  }

  publishing.value = true;

  try {
    const result = await submitArticle({
      title: nextTitle,
      content: markdown,
      categoryId: selectedCategoryId.value,
      tagIds: selectedTagIds.value,
      summary: nextSummary,
      cover: coverUrl.value,
      readType: selectedReadType.value,
      actionType: "post",
    });

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    publishDialogVisible.value = false;
    ElMessage.success("文章发布成功");

    const articleUrl = router.resolve({
      name: "article",
      params: {
        id: result.articleId,
        slug: result.urlSlug || undefined,
      },
    }).href;
    window.location.assign(articleUrl);
  } catch (value) {
    ElMessage.error(extractApiErrorMessage(value));
  } finally {
    publishing.value = false;
  }
};

watch(
  () => authStore.user?.photo,
  () => {
    avatarLoadError.value = false;
  },
);

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.fetchLoginStatus();
  }

  window.__EDITOR_MD_SAVE_IMAGE__ = saveRemoteArticleImage;
  window.__EDITOR_MD_TOAST__ = showEditorToast;
  pendingDraft.value = inspectDraft();
  ensureStyle(`${editorBase}css/editormd.min.css`, "editormd-style");

  try {
    await loadScript(`${vendorBase}jquery/jquery.min.js`, "jquery-script");
    await loadScript(`${editorBase}editormd.min.js`, "editormd-script");
    initEditor();
    window.addEventListener("resize", resizeEditor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "编辑器加载失败";
    ElMessage.error(message);
  }

  void loadCategories();
});

onBeforeUnmount(() => {
  persistLocalDraft();
  delete window.__EDITOR_MD_SAVE_IMAGE__;
  delete window.__EDITOR_MD_TOAST__;
  window.removeEventListener("resize", resizeEditor);
});
</script>

<style scoped>
.write-page {
  min-height: 100vh;
  background: #ffffff;
}

.write-page__topline {
  height: 4px;
  background: linear-gradient(90deg, #413642 0%, #4b4452 100%);
}

.write-page__header {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #d9d9d9;
  background: #ffffff;
  padding: 0 18px;
}

.write-page__title {
  width: 100%;
  min-width: 0;
  border: none;
  padding: 12px 0;
  color: #4b5563;
  font-size: 20px;
  outline: none;
}

.write-page__title::placeholder {
  color: #7b8794;
}

.write-page__actions {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.write-page__save {
  min-width: 68px;
  border-radius: 2px;
  background: #d8a26b;
  padding: 8px 16px;
  color: #ffffff;
  font-size: 15px;
  line-height: 1;
  transition: filter 0.16s ease, transform 0.16s ease;
}

.write-page__save:hover {
  filter: brightness(1.04);
}

.write-page__save:active {
  transform: translateY(1px);
}

.write-page__avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(180deg, #f4e7ab 0%, #ccb66a 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.7),
    0 4px 12px rgba(15, 23, 42, 0.14);
}

.write-page__avatar-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.write-page__body {
  height: calc(100vh - 56px);
  overflow: hidden;
}

.draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff7ed;
  padding: 10px 18px;
  color: #9a3412;
  font-size: 14px;
}

.draft-banner__actions {
  display: inline-flex;
  gap: 8px;
}

.draft-banner__action {
  border: 1px solid #fdba74;
  border-radius: 999px;
  background: #ffffff;
  padding: 6px 12px;
  color: #c2410c;
  font-size: 13px;
}

.draft-banner__action--primary {
  background: #f97316;
  color: #ffffff;
}

.write-page__editor {
  height: 100%;
}

.write-page__hidden-input {
  display: none;
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.publish-form__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.publish-form__label {
  color: #374151;
  font-size: 15px;
  font-weight: 500;
}

.publish-form__label span {
  color: #ef4444;
}

.publish-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 10px;
}

.publish-choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.publish-choice {
  min-height: 42px;
  border: 1px solid #eceff4;
  background: #f8fafc;
  padding: 0 18px;
  color: #4b5563;
  font-size: 15px;
  transition: all 0.18s ease;
}

.publish-choice:hover {
  border-color: #f2c49b;
  background: #fff7ed;
  color: #d97706;
}

.publish-choice--active {
  border-color: #f2c49b;
  background: #fff1e6;
  color: #ea580c;
}

.publish-form__select {
  width: 100%;
}

.cover-picker {
  display: inline-flex;
  width: 180px;
  height: 118px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  color: #9ca3af;
  transition: border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease;
}

.cover-picker:hover:not(:disabled) {
  border-color: #f2c49b;
  background: #fff7ed;
  color: #ea580c;
}

.cover-picker:disabled {
  cursor: wait;
  opacity: 0.7;
}

.cover-picker__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-picker__hint {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
}

.publish-summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.summary-generate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #f3f4f6;
  padding: 7px 14px;
  color: #4b5563;
  font-size: 13px;
  transition: all 0.18s ease;
}

.summary-generate:hover:not(:disabled) {
  background: #fff1e6;
  color: #ea580c;
}

.summary-generate:disabled {
  cursor: wait;
  opacity: 0.7;
}

.publish-summary__wrap {
  position: relative;
}

.publish-summary__textarea {
  width: 100%;
  min-height: 128px;
  border: 1px solid #dbe1ea;
  background: #f8fafc;
  padding: 14px 16px 30px;
  color: #374151;
  font-size: 14px;
  line-height: 1.8;
  resize: vertical;
  outline: none;
  transition: border-color 0.18s ease;
}

.publish-summary__textarea:focus {
  border-color: #f2c49b;
}

.publish-summary__count {
  position: absolute;
  right: 14px;
  bottom: 10px;
  color: #9ca3af;
  font-size: 12px;
}

.publish-dialog__title {
  color: #111827;
  font-size: 24px;
  font-weight: 600;
}

.publish-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 6px;
}

.publish-dialog__action {
  min-width: 92px;
  padding: 10px 22px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  transition: filter 0.18s ease;
}

.publish-dialog__action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.publish-dialog__action--primary {
  background: #f97316;
}

.publish-dialog__action--secondary {
  background: #6b7280;
}

.publish-dialog__action:hover:not(:disabled) {
  filter: brightness(1.04);
}

.write-page :deep(.editormd) {
  margin: 0;
  border: none;
}

.write-page :deep(.editormd-toolbar) {
  border-top: none;
  border-right: none;
  border-left: none;
  background: #ffffff;
}

.write-page :deep(.editormd-toolbar-container) {
  min-height: 38px;
}

.write-page :deep(.editormd-toolbar ul > li > a) {
  transition: background-color 0.16s ease, color 0.16s ease;
}

.write-page :deep(.editormd-toolbar ul > li > a:hover) {
  background: #f3f4f6;
}

.write-page :deep(.editormd-preview-container),
.write-page :deep(.CodeMirror) {
  font-size: 16px;
}

.write-page :deep(.CodeMirror-lines) {
  padding-top: 8px;
}

.write-page :deep(.editormd-preview),
.write-page :deep(.editormd-html-preview) {
  background: #ffffff;
}

.write-page :deep(.publish-dialog) {
  max-width: calc(100vw - 24px);
  border-radius: 14px;
}

.write-page :deep(.publish-dialog .el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #f1f5f9;
  padding: 20px 24px 18px;
}

.write-page :deep(.publish-dialog .el-dialog__body) {
  padding: 22px 24px 14px;
}

.write-page :deep(.publish-dialog .el-dialog__footer) {
  border-top: 1px solid #f1f5f9;
  padding: 18px 24px 22px;
}

.write-page :deep(.publish-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 18px;
}

.write-page :deep(.el-select__wrapper) {
  min-height: 44px;
}

@media (max-width: 860px) {
  .write-page__header {
    gap: 14px;
    padding-right: 12px;
    padding-left: 12px;
  }

  .write-page__title {
    font-size: 18px;
  }

  .write-page__actions {
    gap: 12px;
  }

  .write-page__save {
    min-width: 60px;
    padding: 8px 12px;
    font-size: 14px;
  }

  .draft-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .publish-choice-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cover-picker {
    width: 100%;
    max-width: 220px;
  }

  .publish-summary__head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
