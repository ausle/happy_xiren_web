<template>
  <div class="page-shell traffic-page">
    <div class="traffic-page__tag">
      <div class="traffic-page__tag-icon">
        <TrendingUp :size="14" color="white" />
      </div>
      <span>流量</span>
    </div>

    <h1 class="traffic-page__title">拿到注意力，是一切的起点</h1>
    <p class="traffic-page__subtitle">
      一个人创业，第一道门槛永远是流量。我们覆盖海外和国内主流内容平台，针对每个平台的内容生态、流量算法、变现路径深度定制工具。
    </p>

    <section class="traffic-section">
      <div class="traffic-section__head">
        <div class="traffic-section__icon traffic-section__icon--purple">
          <Globe :size="16" color="#6C63FF" />
        </div>
        <h2>海外平台</h2>
      </div>
      <p class="traffic-section__subtitle">12 个，内容生态成熟，工具矩阵最全面</p>
      <div class="traffic-grid">
        <component
          :is="platform.href ? RouterLink : 'div'"
          v-for="platform in overseasPlatforms"
          :key="platform.name"
          :to="platform.href"
          class="traffic-card panel"
        >
          <div class="traffic-card__top">
            <div class="traffic-card__title">
              <div class="traffic-card__icon" :style="{ background: platform.iconBg }">
                <IconByName :name="platform.icon" :size="17" color="white" />
              </div>
              <div class="traffic-card__name">
                <span>{{ platform.name }}</span>
                <span v-if="platform.badge" class="traffic-card__badge">{{ platform.badge }}</span>
              </div>
            </div>
            <ChevronRight :size="16" class="traffic-card__chevron" />
          </div>
          <p class="traffic-card__desc">{{ platform.features.join(" / ") }}</p>
        </component>
      </div>
    </section>

    <section class="traffic-section">
      <div class="traffic-section__head">
        <div class="traffic-section__icon traffic-section__icon--orange">
          <Globe :size="16" color="#D97706" />
        </div>
        <h2>国内平台</h2>
      </div>
      <p class="traffic-section__subtitle">4 个，流量大，变现路径短，针对每个平台性定制</p>
      <div class="traffic-grid">
        <div v-for="platform in domesticPlatforms" :key="platform.name" class="traffic-card panel">
          <div class="traffic-card__top">
            <div class="traffic-card__title">
              <div class="traffic-card__icon" :style="{ background: platform.iconBg }">
                <IconByName :name="platform.icon" :size="17" color="white" />
              </div>
              <div class="traffic-card__name">
                <span>{{ platform.name }}</span>
                <span v-if="platform.badge" class="traffic-card__badge">{{ platform.badge }}</span>
              </div>
            </div>
            <ChevronRight :size="16" class="traffic-card__chevron" />
          </div>
          <p class="traffic-card__desc">{{ platform.features.join(" / ") }}</p>
        </div>
      </div>
    </section>

    <section class="traffic-section">
      <div class="traffic-section__head">
        <div class="traffic-section__icon traffic-section__icon--green">
          <Grid3x3 :size="16" color="#16A34A" />
        </div>
        <h2>跨平台</h2>
      </div>
      <p class="traffic-section__subtitle">把多平台数据聚合到一个视图</p>
      <div class="traffic-grid traffic-grid--single">
        <div v-for="platform in crossPlatforms" :key="platform.name" class="traffic-card panel">
          <div class="traffic-card__top">
            <div class="traffic-card__title">
              <div class="traffic-card__icon" :style="{ background: platform.iconBg }">
                <IconByName :name="platform.icon" :size="17" color="white" />
              </div>
              <div class="traffic-card__name">
                <span>{{ platform.name }}</span>
              </div>
            </div>
            <ChevronRight :size="16" class="traffic-card__chevron" />
          </div>
          <p class="traffic-card__desc">{{ platform.features.join(" / ") }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Globe, Grid3x3, TrendingUp } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import IconByName from "@/components/common/IconByName.vue";
import { crossPlatforms, domesticPlatforms, overseasPlatforms } from "@/data/traffic";
</script>

<style scoped>
.traffic-page {
  padding-top: 52px;
  padding-bottom: 56px;
}

.traffic-page__tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.07);
  padding: 6px 12px 6px 8px;
}

.traffic-page__tag-icon {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
}

.traffic-page__tag span {
  color: #2563eb;
  font-size: 14px;
  font-weight: 800;
}

.traffic-page__title {
  margin: 0 0 16px;
  max-width: 760px;
  color: var(--text-primary);
  font-size: clamp(38px, 5vw, 64px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.02;
}

.traffic-page__subtitle {
  max-width: 680px;
  margin: 0 0 64px;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.85;
}

.traffic-section {
  margin-bottom: 52px;
  border: 1px solid rgba(18, 19, 26, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.62);
  padding: 28px;
  box-shadow: 0 18px 46px rgba(18, 19, 26, 0.06);
  backdrop-filter: blur(16px);
}

.traffic-section__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.traffic-section__head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 800;
}

.traffic-section__icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.traffic-section__icon--purple {
  background: #dbeafe;
}

.traffic-section__icon--orange {
  background: #fef3c7;
}

.traffic-section__icon--green {
  background: #dcfce7;
}

.traffic-section__subtitle {
  margin: 0 0 24px 44px;
  color: var(--text-muted);
  font-size: 14px;
}

.traffic-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.traffic-grid--single {
  max-width: 360px;
  grid-template-columns: 1fr;
}

.traffic-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.78);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.traffic-card:hover {
  transform: translateY(-4px);
  border-color: rgba(37, 99, 235, 0.18);
  background: #ffffff;
  box-shadow: 0 18px 38px rgba(18, 19, 26, 0.1);
}

.traffic-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.traffic-card__title {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.traffic-card__icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 10px 22px rgba(18, 19, 26, 0.12);
}

.traffic-card__name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
}

.traffic-card__badge {
  border-radius: 8px;
  background: #12131a;
  padding: 2px 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
}

.traffic-card__chevron {
  margin-top: 2px;
  color: #d1d5db;
}

.traffic-card__desc {
  margin: 12px 0 0 48px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 960px) {
  .traffic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .traffic-page__title {
    font-size: 36px;
  }

  .traffic-section {
    padding: 20px;
  }

  .traffic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
