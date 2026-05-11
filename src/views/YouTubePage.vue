<template>
  <div class="page-shell youtube-page">
    <h1 class="youtube-page__title">YouTube 增长工具集</h1>
    <p class="youtube-page__subtitle">
      覆盖从找方向到做内容的完整链路。无论你想做英文 YouTube 进军全球，还是研究海外赛道做本土化复刻，这里都是你的起点。
    </p>

    <section class="youtube-grid">
      <article
        v-for="tool in allTools"
        :key="tool.title"
        class="panel youtube-card"
        @click="tool.href && router.push(tool.href)"
      >
        <div class="youtube-card__icon">
          <IconByName :name="tool.icon" :size="18" color="#6B7280" />
        </div>
        <div class="youtube-card__content">
          <div class="youtube-card__head">
            <span class="youtube-card__title">{{ tool.title }}</span>
            <span v-if="tool.available" class="youtube-card__badge">可用</span>
          </div>
          <p class="youtube-card__desc">{{ tool.desc }}</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import IconByName from "@/components/common/IconByName.vue";
import { freeTools, memberTools } from "@/data/traffic";

const router = useRouter();
const allTools = computed(() => [...freeTools, ...memberTools]);
</script>

<style scoped>
.youtube-page {
  max-width: 960px;
  padding-top: 48px;
  padding-bottom: 48px;
}

.youtube-page__title {
  margin: 0 0 16px;
  color: #111827;
  font-size: 40px;
  font-weight: 700;
}

.youtube-page__subtitle {
  max-width: 720px;
  margin: 0 0 64px;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.75;
}

.youtube-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.youtube-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.youtube-card:hover {
  border-color: #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.youtube-card__icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f9fafb;
}

.youtube-card__content {
  min-width: 0;
}

.youtube-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.youtube-card__title {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.youtube-card__badge {
  border-radius: 8px;
  background: #f0fdf4;
  padding: 2px 8px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 500;
}

.youtube-card__desc {
  margin: 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .youtube-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .youtube-page__title {
    font-size: 32px;
  }

  .youtube-grid {
    grid-template-columns: 1fr;
  }
}
</style>
