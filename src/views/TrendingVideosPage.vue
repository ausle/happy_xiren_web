<template>
  <div class="ranking-shell">
    <div class="page-shell ranking-wrap ranking-wrap--wide">
      <button class="back-button" type="button" @click="router.push('/traffic/youtube')">
        <ArrowLeft :size="15" />
        返回
      </button>

      <div class="headline">
        <TrendingUp :size="22" class="headline__icon" />
        <h1 class="headline__title">爆款视频追踪</h1>
      </div>
      <p class="page-subtitle">近 {{ period === '7d' ? '7' : '30' }} 天高速增长的视频，发现下一个内容机会 · {{ videos.length }} 个结果</p>

      <div class="toolbar">
        <div class="period-switch">
          <button :class="{ active: period === '7d' }" type="button" @click="period = '7d'">近 7 天</button>
          <button :class="{ active: period === '30d' }" type="button" @click="period = '30d'">近 30 天</button>
        </div>
        <LanguageSelect v-model="language" :options="trendingLanguages" />
      </div>

      <div class="list">
        <article v-for="(video, index) in videos" :key="video.id" class="video-card panel">
          <div class="video-card__rank" :class="rankClass(index + 1)">{{ index + 1 }}</div>
          <div class="video-thumb" :style="{ background: video.thumbnailBg }">
            <span class="video-thumb__emoji">{{ video.thumbnail }}</span>
            <span class="video-thumb__duration">{{ video.duration }}</span>
            <div class="video-thumb__overlay">
              <Play :size="24" color="white" fill="white" />
            </div>
          </div>
          <div class="video-card__content">
            <p class="video-card__title">{{ video.title }}</p>
            <div class="video-card__meta">
              <span>{{ video.channel }}</span>
              <span class="dot-separator">·</span>
              <span v-for="tag in video.tags" :key="tag" class="tag" :style="tagStyle(tag)">{{ tag }}</span>
            </div>
            <div class="video-card__stats">
              <span class="video-card__growth"><TrendingUp :size="11" /> {{ video.growthViews7d }} / {{ video.growthPct7d }}</span>
              <span><Eye :size="11" /> {{ video.totalViews }}</span>
              <span><ThumbsUp :size="11" /> {{ video.likes }}</span>
              <span><Clock3 :size="11" /> {{ video.publishedAt }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Clock3, Eye, Play, ThumbsUp, TrendingUp } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import LanguageSelect from "@/components/common/LanguageSelect.vue";
import { trendingLanguages, videos30d, videos7d } from "@/data/youtube";

const router = useRouter();
const period = ref<"7d" | "30d">("7d");
const language = ref("全部语言");

const tagColors: Record<string, { bg: string; text: string }> = {
  生活: { bg: "#fff7ed", text: "#f97316" },
  娱乐: { bg: "#faf5ff", text: "#a855f7" },
  影视: { bg: "#fdf2f8", text: "#ec4899" },
  音乐: { bg: "#ecfeff", text: "#0891b2" },
  游戏: { bg: "#eef2ff", text: "#6366f1" },
  知识: { bg: "#ecfdf5", text: "#059669" },
  美食: { bg: "#fff7ed", text: "#ea580c" },
  体育: { bg: "#f0fdfa", text: "#0d9488" },
  旅游: { bg: "#f5f3ff", text: "#7c3aed" },
  科技: { bg: "#eff6ff", text: "#2563eb" },
  美国: { bg: "#eff6ff", text: "#3b82f6" },
  英语: { bg: "#ecfdf5", text: "#16a34a" },
  韩语: { bg: "#fdf2f8", text: "#db2777" },
  中文: { bg: "#fffbeb", text: "#d97706" },
};

const videos = computed(() => (period.value === "7d" ? videos7d : videos30d));
const tagStyle = (tag: string) => tagColors[tag] ?? { bg: "#f3f4f6", text: "#6b7280" };
const rankClass = (rank: number) => ({ gold: rank === 1, silver: rank === 2, bronze: rank === 3 });
</script>

<style scoped>
.ranking-shell {
  min-height: 100vh;
  background: #f9fafb;
}

.ranking-wrap {
  padding-top: 40px;
  padding-bottom: 40px;
}

.ranking-wrap--wide {
  max-width: 1040px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 32px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
}

.headline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.headline__icon {
  color: #22c55e;
}

.headline__title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0 0 32px;
  color: #9ca3af;
  font-size: 14px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.period-switch {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.period-switch button {
  padding: 8px 16px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.period-switch button.active {
  background: #6c63ff;
  color: #ffffff;
  font-weight: 600;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.video-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.video-card__rank {
  width: 28px;
  flex-shrink: 0;
  color: #c4c4c4;
  font-size: 16px;
  font-weight: 700;
  text-align: right;
}

.video-card__rank.gold { color: #f59e0b; font-size: 20px; }
.video-card__rank.silver { color: #9ca3af; font-size: 20px; }
.video-card__rank.bronze { color: #f97316; font-size: 20px; }

.video-thumb {
  position: relative;
  display: flex;
  width: 148px;
  height: 84px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
}

.video-thumb__emoji {
  font-size: 32px;
}

.video-thumb__duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.72);
  padding: 0 4px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
}

.video-thumb__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.video-card:hover .video-thumb__overlay {
  opacity: 1;
}

.video-card__content {
  flex: 1;
  min-width: 0;
}

.video-card__title {
  margin: 0 0 8px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.video-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 12px;
}

.tag {
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}

.dot-separator {
  color: #d1d5db;
}

.video-card__stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 12px;
}

.video-card__stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.video-card__growth {
  border-radius: 8px;
  background: #f0fdf4;
  padding: 2px 8px;
  color: #16a34a;
  font-weight: 600;
}
</style>
