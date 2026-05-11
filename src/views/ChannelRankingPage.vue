<template>
  <div class="ranking-shell">
    <div class="page-shell ranking-wrap">
      <button class="back-button" type="button" @click="router.push('/traffic/youtube')">
        <ArrowLeft :size="15" />
        返回
      </button>

      <h1 class="page-title">YouTube Top 100</h1>
      <p class="page-subtitle">YouTube 频道订阅数排行榜</p>

      <div class="category-tabs">
        <button
          v-for="category in channelCategories"
          :key="category"
          class="category-tab"
          :class="{ active: activeCategory === category }"
          type="button"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="list">
        <article v-for="(channel, index) in filteredChannels" :key="channel.id" class="list-card panel">
          <div class="list-card__rank" :class="rankClass(index + 1)">{{ index + 1 }}</div>
          <div class="list-card__avatar" :style="{ background: channel.avatarBg }">{{ channel.avatar }}</div>
          <div class="list-card__content">
            <div class="list-card__title">
              <span class="list-card__name">{{ channel.name }}</span>
              <span v-for="tag in channel.tags" :key="tag" class="tag" :style="tagStyle(tag)">{{ tag }}</span>
            </div>
            <p class="list-card__desc">{{ channel.desc }}</p>
            <div class="list-card__stats">
              <span>订阅 <strong>{{ channel.subs }}</strong></span>
              <span>观看 <strong>{{ channel.views }}</strong></span>
              <span>视频 <strong>{{ channel.videos }}</strong></span>
              <span>预估收入 <strong class="income">{{ channel.incomeMin }} - {{ channel.incomeMax }}</strong></span>
            </div>
          </div>
        </article>

        <div v-if="!filteredChannels.length" class="empty-state">该分类暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { channelCategories, channels } from "@/data/youtube";

const router = useRouter();
const activeCategory = ref("全部");

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
  英国: { bg: "#eff6ff", text: "#3b82f6" },
  印度: { bg: "#fff7ed", text: "#ea580c" },
  英语: { bg: "#ecfdf5", text: "#16a34a" },
  韩语: { bg: "#fdf2f8", text: "#db2777" },
  日语: { bg: "#fef2f2", text: "#dc2626" },
  西班牙语: { bg: "#fffbeb", text: "#d97706" },
  葡萄牙语: { bg: "#f7fee7", text: "#65a30d" },
};

const filteredChannels = computed(() => {
  if (activeCategory.value === "全部") {
    return channels;
  }
  return channels.filter((channel) => channel.tags.includes(activeCategory.value) || channel.category === activeCategory.value);
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

.page-title {
  margin: 0 0 4px;
  color: #111827;
  font-size: 36px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0 0 32px;
  color: #9ca3af;
  font-size: 14px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.category-tab {
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  padding: 4px 12px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.category-tab.active {
  border-color: #6c63ff;
  background: #6c63ff;
  color: #ffffff;
  font-weight: 600;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px 24px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.list-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.list-card__rank {
  width: 32px;
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
}

.list-card__rank.gold { color: #f59e0b; font-size: 22px; }
.list-card__rank.silver { color: #9ca3af; font-size: 22px; }
.list-card__rank.bronze { color: #f97316; font-size: 22px; }

.list-card__avatar {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.list-card__content {
  flex: 1;
  min-width: 0;
}

.list-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.list-card__name {
  color: #111827;
  font-size: 15px;
  font-weight: 600;
}

.tag {
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}

.list-card__desc {
  margin: 0 0 10px;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
}

.list-card__stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #9ca3af;
  font-size: 12px;
}

.list-card__stats strong {
  color: #4b5563;
  font-weight: 500;
}

.list-card__stats .income {
  color: #16a34a;
}

.empty-state {
  padding: 64px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}
</style>
