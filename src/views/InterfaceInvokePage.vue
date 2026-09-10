<template>
  <div class="interface-page">
    <div class="page-shell interface-page__shell">
      <section class="panel interface-hero">
        <div>
          <div class="interface-hero__tag">
            <Server :size="15" />
            <span>已上线接口</span>
          </div>
          <h1 class="interface-hero__title">接口调用</h1>
        </div>

        <form class="interface-search" @submit.prevent="search">
          <input v-model="keyword" class="interface-search__input" type="search" placeholder="搜索接口描述" />
          <button class="interface-search__button orange-gradient" type="submit">
            <Search :size="16" />
            <span>查询</span>
          </button>
        </form>
      </section>

      <div class="interface-workbench">
        <section class="panel interface-list">
          <div class="interface-list__head">
            <div>
              <p class="interface-list__eyebrow">ONLINE</p>
              <h2>接口列表</h2>
            </div>
            <button class="icon-button" :disabled="loading" type="button" @click="loadInterfaces">
              <RefreshCw :size="17" />
            </button>
          </div>

          <div v-if="loading" class="interface-list__state">
            <span class="loading-dot" />
            <span>加载中</span>
          </div>
          <div v-else-if="errorMessage" class="interface-list__state interface-list__state--error">
            {{ errorMessage }}
          </div>
          <div v-else-if="!records.length" class="interface-list__state">暂无已上线接口</div>
          <div v-else class="interface-list__items">
            <button
              v-for="item in records"
              :key="item.id ?? item.name"
              class="interface-item"
              :class="{ active: selectedId === item.id }"
              type="button"
              @click="selectInterface(item)"
            >
              <span class="interface-item__method">{{ item.method }}</span>
              <span class="interface-item__body">
                <strong>{{ item.name }}</strong>
                <span>{{ item.description || item.url }}</span>
              </span>
              <ChevronRight :size="16" />
            </button>
          </div>

          <div class="interface-pagination">
            <button :disabled="!canGoPrev || loading" type="button" @click="goPrev">上一页</button>
            <span>{{ query.current }} / {{ totalPages }}</span>
            <button :disabled="!canGoNext || loading" type="button" @click="goNext">下一页</button>
          </div>
        </section>

        <section class="panel interface-detail">
          <div v-if="!selected" class="interface-empty">
            <MousePointerClick :size="30" />
            <p>请选择一个接口</p>
          </div>

          <template v-else>
            <div class="interface-detail__head">
              <div>
                <p class="interface-detail__eyebrow">DETAIL</p>
                <h2>{{ selected.name }}</h2>
              </div>
              <span class="interface-detail__method">{{ selected.method }}</span>
            </div>

            <div v-if="detailLoading" class="interface-detail__loading">详情加载中</div>

            <div v-else class="interface-detail__content">
              <p v-if="selected.description" class="interface-detail__description">{{ selected.description }}</p>

              <dl class="interface-meta">
                <div>
                  <dt>接口地址</dt>
                  <dd>{{ selected.url }}</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd>
                    <el-tag type="success">已上线</el-tag>
                  </dd>
                </div>
                <div>
                  <dt>请求头</dt>
                  <dd>
                    <pre>{{ selected.requestHeader || "-" }}</pre>
                  </dd>
                </div>
                <div>
                  <dt>响应头</dt>
                  <dd>
                    <pre>{{ selected.responseHeader || "-" }}</pre>
                  </dd>
                </div>
              </dl>

              <div class="invoke-panel">
                <label class="field-label" for="requestParams">请求参数</label>
                <textarea id="requestParams" v-model="requestParams" class="request-editor" spellcheck="false" />
                <div class="invoke-actions">
                  <button class="secondary-button" type="button" @click="fillExampleParams">填入示例</button>
                  <button
                    class="invoke-button brand-gradient"
                    :disabled="invoking || !selected.id"
                    type="button"
                    @click="sendRequest"
                  >
                    <Send :size="16" />
                    <span>{{ invoking ? "发送中" : "发送接口" }}</span>
                  </button>
                </div>
              </div>

              <div class="result-panel" :class="{ 'result-panel--error': !!invokeError }">
                <div class="result-panel__head">
                  <span>响应结果</span>
                  <button v-if="resultText" class="copy-button" type="button" @click="copyResult">
                    <Copy :size="15" />
                    <span>复制</span>
                  </button>
                </div>
                <pre>{{ resultText || "暂无响应" }}</pre>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ChevronRight, Copy, MousePointerClick, RefreshCw, Search, Send, Server } from "lucide-vue-next";
import {
  fetchInterfaceDetail,
  fetchOnlineInterfaces,
  invokeInterface,
  type InterfaceInfo,
  type InterfaceInfoPageQuery,
} from "@/api/interfaces";
import { extractApiErrorMessage } from "@/api/response";

const keyword = ref("");
const loading = ref(false);
const detailLoading = ref(false);
const invoking = ref(false);
const errorMessage = ref("");
const invokeError = ref("");
const invokeResult = ref<unknown>();
const records = ref<InterfaceInfo[]>([]);
const selected = ref<InterfaceInfo>();
const selectedId = ref<number>();
const requestParams = ref("{}");
const total = ref(0);
const query = reactive<InterfaceInfoPageQuery>({
  current: 1,
  pageSize: 8,
  status: 1,
  sortField: "createTime",
  sortOrder: "descend",
});
let searchTimer: number | undefined;
let latestRequestId = 0;

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.pageSize)));
const canGoPrev = computed(() => query.current > 1);
const canGoNext = computed(() => query.current < totalPages.value);
const resultText = computed(() => {
  if (invokeError.value) {
    return invokeError.value;
  }

  return formatPayload(invokeResult.value);
});

async function loadInterfaces() {
  const requestId = ++latestRequestId;
  loading.value = true;
  errorMessage.value = "";

  try {
    const trimmedKeyword = keyword.value.trim();
    const page = await fetchOnlineInterfaces({
      ...query,
      description: trimmedKeyword || undefined,
    });

    if (requestId !== latestRequestId) {
      return;
    }

    records.value = page.records ?? [];
    total.value = page.total ?? 0;

    const currentSelected = records.value.find((item) => item.id === selectedId.value);
    if (currentSelected) {
      await selectInterface(currentSelected);
    } else if (records.value[0]) {
      await selectInterface(records.value[0]);
    } else {
      selected.value = undefined;
      selectedId.value = undefined;
      requestParams.value = "{}";
      invokeResult.value = undefined;
      invokeError.value = "";
    }
  } catch (error) {
    if (requestId !== latestRequestId) {
      return;
    }

    records.value = [];
    total.value = 0;
    selected.value = undefined;
    selectedId.value = undefined;
    errorMessage.value = extractApiErrorMessage(error);
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false;
    }
  }
}

function search() {
  query.current = 1;
  void loadInterfaces();
}

function scheduleSearch() {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    search();
  }, 320);
}

async function selectInterface(item: InterfaceInfo) {
  if (!item.id) {
    return;
  }

  selectedId.value = item.id;
  selected.value = item;
  detailLoading.value = true;
  invokeResult.value = undefined;
  invokeError.value = "";

  try {
    const detail = await fetchInterfaceDetail(item.id);
    selected.value = detail;
    requestParams.value = normalizeParams(detail.requestParams);
  } catch (error) {
    ElMessage.error(extractApiErrorMessage(error));
    requestParams.value = normalizeParams(item.requestParams);
  } finally {
    detailLoading.value = false;
  }
}

function fillExampleParams() {
  requestParams.value = normalizeParams(selected.value?.requestParams);
}

async function sendRequest() {
  if (!selected.value?.id) {
    return;
  }

  invoking.value = true;
  invokeResult.value = undefined;
  invokeError.value = "";

  try {
    invokeResult.value = await invokeInterface(selected.value.id, requestParams.value.trim() || "{}");
    ElMessage.success("接口已发送");
  } catch (error) {
    invokeError.value = extractApiErrorMessage(error);
    ElMessage.error(invokeError.value);
  } finally {
    invoking.value = false;
  }
}

async function copyResult() {
  if (!resultText.value) {
    return;
  }

  await navigator.clipboard.writeText(resultText.value);
  ElMessage.success("响应结果已复制");
}

function goPrev() {
  if (!canGoPrev.value) {
    return;
  }

  query.current -= 1;
  void loadInterfaces();
}

function goNext() {
  if (!canGoNext.value) {
    return;
  }

  query.current += 1;
  void loadInterfaces();
}

function normalizeParams(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "{}";
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return trimmed;
  }
}

function formatPayload(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

watch(keyword, scheduleSearch);

onMounted(loadInterfaces);
</script>

<style scoped>
.interface-page {
  min-height: 100vh;
}

.interface-page__shell {
  padding-top: 32px;
  padding-bottom: 56px;
}

.interface-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(241, 247, 255, 0.78));
}

.interface-hero__tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 999px;
  padding: 0 13px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
}

.interface-hero__title {
  margin: 16px 0 0;
  color: var(--text-primary);
  font-size: 42px;
  font-weight: 800;
  line-height: 1.12;
}

.interface-search {
  display: flex;
  width: min(100%, 520px);
  gap: 12px;
}

.interface-search__input {
  width: 100%;
  min-height: 48px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.84);
  padding: 0 16px;
  color: var(--text-primary);
  outline: none;
}

.interface-search__input:focus,
.request-editor:focus {
  border-color: rgba(37, 99, 235, 0.42);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  background: #ffffff;
}

.interface-search__button,
.invoke-button,
.secondary-button,
.icon-button,
.copy-button,
.interface-pagination button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.interface-search__button {
  min-width: 108px;
  min-height: 48px;
  border-radius: 16px;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.2);
}

.interface-search__button:hover,
.invoke-button:hover,
.secondary-button:hover,
.icon-button:hover,
.copy-button:hover,
.interface-pagination button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.interface-workbench {
  display: grid;
  grid-template-columns: minmax(300px, 0.92fr) minmax(0, 1.55fr);
  gap: 22px;
  margin-top: 24px;
  align-items: start;
}

.interface-list,
.interface-detail {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
}

.interface-list {
  overflow: hidden;
}

.interface-list__head,
.interface-detail__head,
.result-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.interface-list__head {
  padding: 22px 22px 14px;
}

.interface-list__eyebrow,
.interface-detail__eyebrow {
  margin: 0 0 6px;
  color: #2563eb;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.interface-list__head h2,
.interface-detail__head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 14px;
  background: #ffffff;
  color: #5d6472;
}

.interface-list__items {
  display: grid;
  gap: 8px;
  padding: 0 14px 14px;
}

.interface-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 72px;
  border: 1px solid transparent;
  border-radius: 18px;
  padding: 12px;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.interface-item:hover,
.interface-item.active {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.16);
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(18, 19, 26, 0.06);
}

.interface-item__method,
.interface-detail__method {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  background: #12131a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.interface-item__body {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.interface-item__body strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.interface-item__body span {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.interface-list__state,
.interface-empty,
.interface-detail__loading {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 14px;
}

.interface-list__state--error {
  padding: 24px;
  color: #b91c1c;
  text-align: center;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #2563eb;
  animation: pulse 1s ease-in-out infinite;
}

.interface-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid rgba(18, 19, 26, 0.08);
  padding: 14px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
}

.interface-pagination button,
.secondary-button,
.copy-button {
  min-height: 36px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 999px;
  background: #ffffff;
  padding: 0 14px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.interface-detail {
  min-height: 640px;
  padding: 26px;
}

.interface-empty {
  min-height: 560px;
  flex-direction: column;
}

.interface-empty p {
  margin: 0;
}

.interface-detail__method {
  min-width: 72px;
  padding: 0 14px;
}

.interface-detail__description {
  margin: 22px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
}

.interface-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 22px 0 0;
}

.interface-meta div {
  min-width: 0;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.72);
  padding: 14px;
}

.interface-meta div:first-child {
  grid-column: 1 / -1;
}

.interface-meta dt {
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
}

.interface-meta dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.65;
}

.interface-meta pre,
.result-panel pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.invoke-panel {
  display: grid;
  gap: 10px;
  margin-top: 22px;
}

.field-label {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.request-editor {
  width: 100%;
  min-height: 190px;
  resize: vertical;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  padding: 14px;
  color: var(--text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.7;
  outline: none;
}

.invoke-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.invoke-button {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 18px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.2);
}

.result-panel {
  margin-top: 22px;
  overflow: hidden;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 18px;
  background: #0f172a;
  color: #dbeafe;
}

.result-panel--error {
  border-color: rgba(185, 28, 28, 0.28);
  background: #2b1111;
  color: #fee2e2;
}

.result-panel__head {
  min-height: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 14px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.result-panel pre {
  min-height: 140px;
  max-height: 360px;
  overflow: auto;
  padding: 14px;
  font-size: 13px;
  line-height: 1.7;
}

.copy-button {
  min-height: 30px;
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.48;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .interface-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .interface-search {
    width: 100%;
  }

  .interface-workbench {
    grid-template-columns: 1fr;
  }

  .interface-detail {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .interface-page__shell {
    padding-top: 18px;
    padding-bottom: 36px;
  }

  .interface-hero,
  .interface-detail {
    padding: 20px;
  }

  .interface-hero__title {
    font-size: 32px;
  }

  .interface-search,
  .invoke-actions {
    flex-direction: column;
  }

  .interface-search__button,
  .secondary-button,
  .invoke-button {
    width: 100%;
  }

  .interface-meta {
    grid-template-columns: 1fr;
  }
}
</style>
