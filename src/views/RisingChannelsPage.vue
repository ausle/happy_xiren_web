<template>
  <div class="ranking-shell">
    <div class="page-shell ranking-wrap">
      <button class="back-button" type="button" @click="router.push('/traffic/youtube')">
        <ArrowLeft :size="15" />
        返回
      </button>

      <div class="headline">
        <TrendingUp :size="20" class="headline__icon" />
        <h1 class="headline__title">潜力新账号</h1>
      </div>
      <p class="page-subtitle">订阅 &lt;10 万且近 7 日涨粉 ≥1000 的活跃频道 · {{ filteredChannels.length.toLocaleString() }} 个潜力账号</p>

      <div class="toolbar">
        <LanguageSelect v-model="language" :options="risingLanguages" />
      </div>

      <div class="list">
        <article v-for="(channel, index) in filteredChannels" :key="channel.id" class="rising-card panel">
          <div class="rising-card__rank" :class="rankClass(index + 1)">{{ index + 1 }}</div>
          <div class="rising-card__avatar" :style="{ background: channel.avatarBg }">{{ channel.avatar }}</div>
          <div class="rising-card__content">
            <div class="rising-card__title">
              <span class="rising-card__name">{{ channel.name }}</span>
              <span class="growth growth--count"><TrendingUp :size="10" /> {{ channel.growthCount }}</span>
              <span class="growth">{{ channel.growthPct }}</span>
              <span v-if="channel.hasViral" class="viral-badge">✦ 有爆款</span>
              <span v-for="tag in channel.categories" :key="tag" class="tag" :style="tagStyle(tag)">{{ tag }}</span>
            </div>
            <p class="rising-card__desc">{{ channel.desc }}</p>
            <div class="rising-card__stats">
              <span><Users :size="11" /> {{ channel.subs }} 订阅</span>
              <span>📹 {{ channel.videosPerMonth }} / 30日视频</span>
              <span>📍 {{ channel.country }}</span>
            </div>
          </div>
        </article>
        <div v-if="!filteredChannels.length" class="empty-state">该语言暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, TrendingUp, Users } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import LanguageSelect from "@/components/common/LanguageSelect.vue";
import { risingChannels, risingLanguages } from "@/data/youtube";

const router = useRouter();
const language = ref("全部语言");

const tagColors: Record<string, { bg: string; text: string }> = {
  娱乐: { bg: "#faf5ff", text: "#a855f7" },
  科技: { bg: "#eff6ff", text: "#2563eb" },
  爱好: { bg: "#f5f3ff", text: "#7c3aed" },
  音乐: { bg: "#ecfeff", text: "#0891b2" },
  游戏: { bg: "#eef2ff", text: "#6366f1" },
  知识: { bg: "#ecfdf5", text: "#059669" },
  生活: { bg: "#fff7ed", text: "#f97316" },
  美食: { bg: "#fff7ed", text: "#ea580c" },
  体育: { bg: "#f0fdfa", text: "#0d9488" },
  旅游: { bg: "#f5f3ff", text: "#7c3aed" },
  教育: { bg: "#ecfdf5", text: "#059669" },
  影视: { bg: "#fdf2f8", text: "#ec4899" },
  新闻: { bg: "#eff6ff", text: "#2563eb" },
  时尚: { bg: "#fdf2f8", text: "#db2777" },
  宠物: { bg: "#fffbeb", text: "#d97706" },
};

const filteredChannels = computed(() => {
  if (language.value === "全部语言") {
    return risingChannels;
  }
  return risingChannels.filter((channel) => channel.language === language.value);
});

const tagStyle = (tag: string) => tagColors[tag] ?? { bg: "#f3f4f6", text: "#6b7280" };
const rankClass = (rank: number) => ({ gold: rank === 1, silver: rank === 2, bronze: rank === 3 });
</script>

<style scoped>
.ranking-shell {
  min-height: 100vh;
  background: #f9fafb;
}

.ranking-wrap {
  max-width: 960px;
  padding-top: 40px;
  padding-bottom: 40px;
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
  margin: 0 0 24px;
  color: #9ca3af;
  font-size: 13px;
}

.toolbar {
  margin-bottom: 24px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rising-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.rising-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.rising-card__rank {
  width: 24px;
  flex-shrink: 0;
  padding-top: 4px;
  color: #c4c4c4;
  font-size: 15px;
  font-weight: 700;
  text-align: right;
}

.rising-card__rank.gold { color: #f59e0b; font-size: 20px; }
.rising-card__rank.silver { color: #9ca3af; font-size: 20px; }
.rising-card__rank.bronze { color: #f97316; font-size: 20px; }

.rising-card__avatar {
  display: flex;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.rising-card__content {
  flex: 1;
  min-width: 0;
}

.rising-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.rising-card__name {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
}

.growth,
.viral-badge {
  border-radius: 8px;
  background: #f0fdf4;
  padding: 2px 8px;
  color: #16a34a;
  font-size: 11px;
  font-weight: 600;
}

.growth--count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.viral-badge {
  white-space: nowrap;
}

.tag {
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}

.rising-card__desc {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.rising-card__stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 12px;
}

.rising-card__stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  padding: 64px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}
</style>
