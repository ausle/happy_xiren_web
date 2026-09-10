<template>
  <div class="lottery-page">
    <div class="lottery-page__glow lottery-page__glow--left" />
    <div class="lottery-page__glow lottery-page__glow--right" />

    <div class="page-shell lottery-page__shell">
      <header class="lottery-hero">
        <div>
          <p class="lottery-hero__eyebrow">HAPPY XIREN · LUCKY DRAW</p>
          <h1 class="lottery-hero__title">好运九宫格</h1>
          <p class="lottery-hero__description">点击中心按钮，看看今天的幸运奖品。每次结果都会记录在右侧的中奖记录中。</p>
        </div>
        <div class="lottery-hero__activity">
          <span class="lottery-hero__activity-dot" :class="{ 'lottery-hero__activity-dot--loading': pageLoading }" />
          <span>{{ pageLoading ? "连接抽奖服务" : armoryReady ? "活动进行中" : "等待装配" }}</span>
          <small>活动 {{ activityId }}</small>
        </div>
      </header>

      <section class="lottery-stats" aria-label="抽奖状态">
        <button
          class="lottery-stat lottery-stat--blue lottery-stat--button"
          type="button"
          :disabled="armoryReady || armoryLoading"
          @click="handleArmory"
        >
          <span class="lottery-stat__icon">✦</span>
          <span>
            <strong>{{ armoryReady ? "已装配" : armoryLoading ? "装配中..." : "装配抽奖" }}</strong>
            <small>{{ armoryReady ? "活动数据已预热" : armoryError || "点击装配活动数据" }}</small>
          </span>
        </button>
        <div class="lottery-stat lottery-stat--gold">
          <span class="lottery-stat__icon">↻</span>
          <span>
            <strong>{{ accountLoading ? "今日可抽奖读取中" : `今日可抽奖 ${attemptsRemaining} 次` }}</strong>
            <small>每次抽奖消耗 1 次机会</small>
          </span>
        </div>
        <button class="lottery-stat lottery-stat--green lottery-stat--button" type="button" :disabled="isSignedIn === true || signInLoading" @click="handleSignIn">
          <span class="lottery-stat__icon">✓</span>
          <span>
            <strong>{{ signInText }}</strong>
            <small>签到可获得额外抽奖机会</small>
          </span>
        </button>
      </section>

      <div v-if="apiError || statusError" class="lottery-alert" role="alert">
        <strong>{{ apiErrorTitle }}</strong>
        <span>{{ apiError || statusError }}</span>
        <button type="button" @click="loadPage">重新连接</button>
      </div>

      <main class="lottery-content">
        <section class="grid-card" aria-label="九宫格抽奖">
          <div class="grid-card__topline">
            <div>
              <p class="section-kicker">LUCKY GRID</p>
              <h2>九宫格抽奖</h2>
            </div>
            <span class="grid-card__hint">
              {{ pageLoading && !awardListReady ? "正在读取奖品列表…" : !awardListReady ? "奖品列表未连接" : spinning ? "好运加载中…" : "点击中心开始抽奖" }}
            </span>
          </div>

          <div class="grid-stage">
            <div class="grid-stage__sparkle grid-stage__sparkle--one">✦</div>
            <div class="grid-stage__sparkle grid-stage__sparkle--two">✧</div>
            <div class="grid-stage__sparkle grid-stage__sparkle--three">·</div>

            <div class="grid-board">
              <div class="grid-cells">
                <template v-for="(slot, index) in gridSlots" :key="slot ? slot.id : `center-${index}`">
                  <div
                    v-if="slot"
                    class="grid-cell"
                    :class="{ 'grid-cell--active': activeSlot === index, 'grid-cell--locked': slot.locked, 'grid-cell--empty': slot.empty }"
                    :style="{ background: slot.locked ? '#dfe2e7' : slot.color }"
                  >
                    <span class="grid-cell__shine" />
                    <img v-if="slot.image" class="grid-cell__image" :src="slot.image" :alt="slot.title" />
                    <span v-else class="grid-cell__icon">{{ slot.emoji }}</span>
                    <strong>{{ slot.title }}</strong>
                    <small>{{ slot.locked ? `再抽${slot.unlockCount}次可解锁` : slot.subtitle }}</small>
                    <span v-if="slot.locked" class="grid-cell__lock">🔒</span>
                  </div>
                  <button
                    v-else
                    class="grid-center"
                    :class="{ 'grid-center--spinning': spinning }"
                    :disabled="!canDraw"
                    type="button"
                    @click="startLottery"
                  >
                    <strong>{{ pageLoading && !awardListReady ? "加载中" : spinning ? "抽奖中" : "点击抽奖" }}</strong>
                    <small>{{ pageLoading && !awardListReady ? "请稍候" : spinning ? "好运转动中" : "点击后获取结果" }}</small>
                    <span class="grid-center__burst">✦</span>
                  </button>
                </template>
              </div>

              <div v-if="activeSlot !== null && activeSlot !== 4" class="grid-mask-layer" aria-hidden="true">
                <button
                  class="grid-mask"
                  :class="{ 'grid-mask--spinning': spinning }"
                  :style="gridMaskStyle"
                  type="button"
                  tabindex="-1"
                  disabled
                  aria-label="抽奖指针"
                />
              </div>
            </div>
          </div>

          <div class="grid-result" :class="{ 'grid-result--active': latestResult }" aria-live="polite">
            <span class="grid-result__spark">✦</span>
            <div>
              <small>{{ latestResult ? "本次抽奖结果" : "准备好了吗" }}</small>
              <strong>{{ latestResult || "点击中心按钮，转出你的幸运奖品" }}</strong>
            </div>
          </div>
        </section>

        <aside class="lottery-sidebar">
          <section class="prize-card">
            <div class="prize-card__heading">
              <div>
                <p class="section-kicker">PRIZE LIST</p>
                <h2>奖品一览</h2>
              </div>
              <span class="prize-card__count">{{ prizes.length }} 项</span>
            </div>
            <div class="prize-list">
              <div v-for="(prize, index) in prizes" :key="prize.id" class="prize-row">
                <span class="prize-row__index">{{ String(index + 1).padStart(2, "0") }}</span>
                <span class="prize-row__emoji" :style="{ background: prize.color }">{{ prize.emoji }}</span>
                <span class="prize-row__copy">
                  <strong>{{ prize.title }}</strong>
                  <small>{{ prize.locked ? `再抽${prize.unlockCount}次可解锁` : prize.subtitle }}</small>
                </span>
              </div>
            </div>
          </section>

          <section class="history-card">
            <div class="history-card__heading">
              <div>
                <p class="section-kicker">RECENT LUCK</p>
                <h2>中奖记录</h2>
              </div>
              <span v-if="history.length" class="history-card__badge">{{ history.length }}</span>
            </div>
            <div v-if="history.length" class="history-list">
              <div v-for="item in history" :key="item.id" class="history-row">
                <span class="history-row__dot" />
                <span>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.time }}</small>
                </span>
              </div>
            </div>
            <div v-else class="history-empty">
              <span>◌</span>
              <p>还没有中奖记录<br />快去转动好运吧</p>
            </div>
          </section>

          <section class="rules-card">
            <p class="section-kicker">HOW TO PLAY</p>
            <h2>抽奖说明</h2>
            <ol>
              <li>先点击“装配抽奖”，预热当前活动数据。</li>
              <li>点击九宫格中心按钮，消耗一次抽奖机会。</li>
              <li>奖品和次数以活动服务端最终结果为准。</li>
            </ol>
          </section>
        </aside>
      </main>
    </div>

    <Transition name="lottery-dialog">
      <div
        v-if="resultDialogVisible && resultDialogPrize"
        class="lottery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lottery-dialog-title"
        @click.self="closeResultDialog"
      >
        <div class="lottery-dialog__card">
          <div class="lottery-dialog__confetti" aria-hidden="true">✦ · ✧ ✦ · ✧</div>
          <p class="lottery-dialog__eyebrow">LUCKY YOU</p>
          <h2 id="lottery-dialog-title">恭喜中奖！</h2>
          <p class="lottery-dialog__caption">本次抽奖抽中了</p>
          <div class="lottery-dialog__prize">
            <img v-if="resultDialogPrize.image" :src="resultDialogPrize.image" :alt="resultDialogPrize.title" />
            <span>{{ resultDialogPrize.title }}</span>
          </div>
          <p class="lottery-dialog__subtitle">{{ resultDialogPrize.subtitle }}</p>
          <button class="lottery-dialog__button" type="button" @click="closeResultDialog">太棒了</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  armoryActivity,
  drawRaffle,
  fetchActivityAccount,
  fetchRaffleAwards,
  fetchSignInStatus,
  signIn,
  type RaffleAward,
} from "@/api/raffle";

type Prize = {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  image?: string;
  sort?: number;
  isAwardUnlock?: boolean;
  locked?: boolean;
  unlockCount?: number;
  empty?: boolean;
};

type HistoryItem = {
  id: number;
  title: string;
  time: string;
};

const route = useRoute();
const fallbackPrizes: Prize[] = [
  { id: 101, title: "随机积分", subtitle: "随机积分", emoji: "✦", color: "#fff1b8" },
  { id: 103, title: "10次使用", subtitle: "10次使用", emoji: "◆", color: "#dfe7ff" },
  { id: 104, title: "20次使用", subtitle: "20次使用", emoji: "¥", color: "#ffe0e6" },
  { id: 105, title: "增加gpt-4对话模型", subtitle: "增加gpt-4对话模型", emoji: "☻", color: "#d9f4ed" },
  { id: 106, title: "增加dall-e-2画图模型", subtitle: "增加dall-e-2画图模型", emoji: "☼", color: "#ffe8c2" },
  { id: 107, title: "增加dall-e-3画图模型", subtitle: "抽奖1次后解锁", emoji: "↻", color: "#e8e2ff" },
  { id: 108, title: "增加100次使用", subtitle: "抽奖2次后解锁", emoji: "★", color: "#e2f0ff", locked: true, unlockCount: 1 },
  { id: 109, title: "解锁全部模型", subtitle: "抽奖6次后解锁", emoji: "?", color: "#ffd9cf", locked: true, unlockCount: 5 },
];

const prizes = ref<Prize[]>(fallbackPrizes);
const spinning = ref(false);
const activeSlot = ref<number | null>(null);
const attemptsRemaining = ref(0);
const latestResult = ref("");
const history = ref<HistoryItem[]>([]);
const resultDialogVisible = ref(false);
const resultDialogPrize = ref<Prize | null>(null);
const pageLoading = ref(true);
const accountLoading = ref(true);
const armoryReady = ref(false);
const armoryLoading = ref(false);
const armoryError = ref("");
const awardListReady = ref(false);
const apiError = ref("");
const statusError = ref("");
const isSignedIn = ref<boolean | null>(null);
const signInLoading = ref(false);
let gridTimer: number | undefined;
let gridPathIndex = 0;
const clockwiseGridPath = [0, 1, 2, 5, 8, 7, 6, 3];

const activityId = computed(() => String(route.query.activityId || "100301"));
const userId = computed(() => String(route.query.userId || "asule"));
const numericActivityId = computed(() => Number(activityId.value));
const accountQueryUserId = "asule";
const accountQueryActivityId = 100301;
const signInText = computed(() => {
  if (signInLoading.value) return "签到中...";
  if (isSignedIn.value === null) return "签到状态读取中";
  return isSignedIn.value ? "今日已签到" : "点击签到";
});
const apiErrorTitle = computed(() => (apiError.value ? "抽奖服务暂时不可用" : "抽奖状态接口异常"));
const canDraw = computed(() => awardListReady.value && !spinning.value);

const gridSlots = computed<(Prize | null)[]>(() => {
  const slots = [0, 1, 2, 3, -1, 4, 5, 6, 7];
  return slots.map((prizeIndex, slotIndex) => {
    if (prizeIndex === -1) return null;
    return prizes.value[prizeIndex] ?? {
      id: -100 - slotIndex,
      title: "奖品待配置",
      subtitle: "等待活动配置",
      emoji: "…",
      color: "#f0f1f4",
      empty: true,
    };
  });
});

const prizeColors = ["#fff1b8", "#dfe7ff", "#ffe0e6", "#d9f4ed", "#ffe8c2", "#e8e2ff", "#e2f0ff", "#ffd9cf"];
const prizeEmojis = ["✦", "◆", "¥", "☻", "☼", "↻", "★", "?"];
const prizeAssets = [
  { unlocked: "/raffle-award-00.png" },
  { unlocked: "/raffle-award-01.png" },
  { unlocked: "/raffle-award-02.png" },
  { unlocked: "/raffle-award-12.png" },
  { unlocked: "/raffle-award-22.png", locked: "/raffle-award-22-lock.png" },
  { unlocked: "/raffle-award-21.png", locked: "/raffle-award-21-lock.png" },
  { unlocked: "/raffle-award-20.png", locked: "/raffle-award-20-lock.png" },
  { unlocked: "/raffle-award-10.png" },
];
const prizeAssetsByAwardId: Record<number, { unlocked: string; locked?: string }> = {
  101: { unlocked: "/raffle-award-00.png" },
  103: { unlocked: "/raffle-award-01.png" },
  104: { unlocked: "/raffle-award-02.png" },
  105: { unlocked: "/raffle-award-12.png" },
  106: { unlocked: "/raffle-award-22.png", locked: "/raffle-award-22-lock.png" },
  107: { unlocked: "/raffle-award-21.png", locked: "/raffle-award-21-lock.png" },
  108: { unlocked: "/raffle-award-20.png", locked: "/raffle-award-20-lock.png" },
  109: { unlocked: "/raffle-award-10.png" },
};

const gridMaskStyle = computed<Record<string, string>>(() => {
  const current = activeSlot.value ?? 0;
  const row = Math.floor(current / 3);
  const column = current % 3;
  const cellSize = "((100% - 8px) / 3)";
  const step = `(${cellSize} + 4px)`;

  return {
    left: `calc(${column} * ${step})`,
    top: `calc(${row} * ${step})`,
    width: `calc(${cellSize})`,
    height: `calc(${cellSize})`,
  };
});

const getApiError = (value: unknown, fallback: string) => (value instanceof Error ? value.message : fallback);
const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration));

const toPrize = (award: RaffleAward, index: number): Prize => {
  const isAwardUnlock = award.isAwardUnlock === true;
  const unlockCount = Math.max(0, Number(award.waitUnLockCount ?? 0));
  const locked = !isAwardUnlock;
  const asset = prizeAssetsByAwardId[award.awardId] ?? prizeAssets[index % prizeAssets.length];

  return {
    id: award.awardId,
    title: award.awardTitle,
    subtitle: award.awardSubtitle || "幸运奖品",
    emoji: prizeEmojis[index % prizeEmojis.length],
    color: prizeColors[index % prizeColors.length],
    image: locked && asset.locked ? asset.locked : asset.unlocked,
    sort: award.sort,
    isAwardUnlock,
    locked,
    unlockCount,
  };
};

const nowLabel = () =>
  new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(new Date());

const closeResultDialog = () => {
  resultDialogVisible.value = false;
};

const loadPage = async () => {
  pageLoading.value = true;
  accountLoading.value = true;
  awardListReady.value = false;
  apiError.value = "";
  statusError.value = "";

  try {
    const [awardResult, accountResult, signResult] = await Promise.allSettled([
      fetchRaffleAwards(userId.value, numericActivityId.value),
      fetchActivityAccount(accountQueryUserId, accountQueryActivityId),
      fetchSignInStatus(userId.value),
    ]);

    const awardErrors: string[] = [];
    const statusErrors: string[] = [];
    const awardResponse = awardResult.status === "fulfilled" ? awardResult.value : null;
    const accountResponse = accountResult.status === "fulfilled" ? accountResult.value : null;
    const signResponse = signResult.status === "fulfilled" ? signResult.value : null;

    if (awardResponse?.code === "0000" && awardResponse.data?.length) {
      awardListReady.value = true;
      prizes.value = awardResponse.data
        .slice()
        .sort((left, right) => (left.sort ?? Number.MAX_SAFE_INTEGER) - (right.sort ?? Number.MAX_SAFE_INTEGER))
        .map(toPrize);
    } else {
      awardErrors.push(awardResponse?.info || "奖品列表为空");
    }

    if (accountResponse?.code === "0000" && accountResponse.data) {
      attemptsRemaining.value = Math.max(
        0,
        Number(accountResponse.data.dayCountSurplus ?? accountResponse.data.totalCountSurplus ?? 0),
      );
    } else {
      statusErrors.push(accountResponse?.info || "活动账户查询失败");
    }

    isSignedIn.value = signResponse?.code === "0000" ? Boolean(signResponse.data) : null;
    if (signResponse && signResponse.code !== "0000") {
      statusErrors.push(signResponse.info || "签到状态查询失败");
    }
    apiError.value = awardErrors.join("；");
    statusError.value = statusErrors.join("；");
  } catch (value) {
    awardListReady.value = false;
    apiError.value = getApiError(value, "请确认 big-market 已启动在 localhost:8091");
  } finally {
    pageLoading.value = false;
    accountLoading.value = false;
  }
};

const handleArmory = async () => {
  if (armoryReady.value || armoryLoading.value) return;

  armoryLoading.value = true;
  armoryError.value = "";
  try {
    const response = await armoryActivity(numericActivityId.value);
    if (response.code !== "0000") {
      throw new Error(response.info || "活动装配失败");
    }
    armoryReady.value = true;
  } catch (value) {
    armoryError.value = getApiError(value, "活动装配失败");
  } finally {
    armoryLoading.value = false;
  }
};

const handleSignIn = async () => {
  if (signInLoading.value || isSignedIn.value === true) return;

  signInLoading.value = true;
  try {
    const response = await signIn(userId.value);
    if (response.code !== "0000" && response.code !== "0003") {
      throw new Error(response.info || "签到失败");
    }
    isSignedIn.value = true;
    await loadPage();
  } catch (value) {
    apiError.value = getApiError(value, "签到失败，请稍后重试");
  } finally {
    signInLoading.value = false;
  }
};

const startGridAnimation = () => {
  stopGridAnimation();
  gridPathIndex = 0;
  activeSlot.value = clockwiseGridPath[gridPathIndex];
  gridTimer = window.setInterval(() => {
    gridPathIndex = (gridPathIndex + 1) % clockwiseGridPath.length;
    activeSlot.value = clockwiseGridPath[gridPathIndex];
  }, 280);
};

const stopGridAnimation = () => {
  if (gridTimer) window.clearInterval(gridTimer);
  gridTimer = undefined;
};

const moveGridMaskToTarget = async (targetSlot: number) => {
  const targetPathIndex = clockwiseGridPath.indexOf(targetSlot);
  if (targetPathIndex < 0) return;

  const pathLength = clockwiseGridPath.length;
  let steps = (targetPathIndex - gridPathIndex + pathLength) % pathLength;

  while (steps > 0) {
    await wait(320);
    gridPathIndex = (gridPathIndex + 1) % pathLength;
    activeSlot.value = clockwiseGridPath[gridPathIndex];
    steps -= 1;
  }

  await wait(280);
};

const startLottery = async () => {
  if (!canDraw.value) return;

  spinning.value = true;
  resultDialogVisible.value = false;
  resultDialogPrize.value = null;
  latestResult.value = "";
  startGridAnimation();
  const spinDuration = 3500 + Math.floor(Math.random() * 800);
  const spinStartedAt = Date.now();

  try {
    const drawResponse = await drawRaffle(userId.value, numericActivityId.value);
    if (drawResponse.code !== "0000" || !drawResponse.data) {
      throw new Error(drawResponse.info || "抽奖失败，请稍后重试");
    }

    const targetPrize = prizes.value.find((prize) => prize.id === drawResponse.data?.awardId);
    const targetSlot = gridSlots.value.findIndex((prize) => prize?.id === drawResponse.data?.awardId);
    if (!targetPrize || targetSlot < 0) {
      throw new Error(`后端返回了未配置的奖品：${drawResponse.data.awardTitle || drawResponse.data.awardId}`);
    }
    if (targetPrize.locked) {
      throw new Error(`后端返回了未解锁奖品：${targetPrize.title}`);
    }

    await wait(Math.max(0, spinDuration - (Date.now() - spinStartedAt)));
    stopGridAnimation();
    await moveGridMaskToTarget(targetSlot);

    attemptsRemaining.value = Math.max(0, attemptsRemaining.value - 1);
    latestResult.value = `恭喜你抽中「${targetPrize.title}」`;
    resultDialogPrize.value = targetPrize;
    history.value.unshift({
      id: Date.now(),
      title: targetPrize.title,
      time: `刚刚 · ${nowLabel()}`,
    });
    history.value = history.value.slice(0, 4);
    resultDialogVisible.value = true;
  } catch (value) {
    stopGridAnimation();
    activeSlot.value = null;
    apiError.value = getApiError(value, "抽奖失败，请稍后重试");
  } finally {
    spinning.value = false;
  }
};

onMounted(() => {
  void loadPage();
});

onBeforeUnmount(() => {
  stopGridAnimation();
});
</script>

<style scoped>
.lottery-page {
  position: relative;
  min-height: calc(100vh - 70px);
  overflow: hidden;
  background:
    radial-gradient(circle at 8% 16%, rgba(255, 255, 255, 0.22), transparent 16rem),
    radial-gradient(circle at 92% 18%, rgba(255, 225, 165, 0.3), transparent 20rem),
    linear-gradient(135deg, #e7305e 0%, #ec2a63 44%, #d92367 100%);
  color: #2f2341;
}

.lottery-page::before {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image:
    radial-gradient(circle, #ffffff 0 2px, transparent 2.5px),
    radial-gradient(circle, #7ff7ef 0 2px, transparent 2.5px),
    linear-gradient(120deg, transparent 0 47%, rgba(255, 255, 255, 0.55) 48% 52%, transparent 53%);
  background-position: 8% 12%, 86% 64%, 42% 26%;
  background-size: 120px 120px, 180px 180px, 160px 160px;
  content: "";
  pointer-events: none;
}

.lottery-page__glow {
  position: absolute;
  width: 360px;
  height: 360px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  opacity: 0.72;
  pointer-events: none;
}

.lottery-page__glow::after,
.lottery-page__glow::before {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: inherit;
  content: "";
}

.lottery-page__glow::before { inset: 28px; }
.lottery-page__glow::after { inset: 72px; }
.lottery-page__glow--left { top: 180px; left: -290px; }
.lottery-page__glow--right { right: -280px; bottom: 90px; }

.lottery-page__shell {
  position: relative;
  z-index: 1;
  padding-top: 54px;
  padding-bottom: 72px;
}

.lottery-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  color: #ffffff;
}

.lottery-hero__eyebrow,
.section-kicker {
  margin: 0;
  font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.lottery-hero__eyebrow { opacity: 0.78; }

.lottery-hero__title {
  margin: 12px 0 10px;
  font-size: clamp(44px, 6.4vw, 82px);
  font-weight: 850;
  letter-spacing: -0.07em;
  line-height: 0.98;
  text-shadow: 0 12px 26px rgba(112, 13, 55, 0.22);
}

.lottery-hero__description {
  max-width: 540px;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  line-height: 1.8;
}

.lottery-hero__activity {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: rgba(121, 11, 62, 0.2);
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 750;
  backdrop-filter: blur(16px);
}

.lottery-hero__activity small {
  margin-left: 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.32);
  padding-left: 12px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  font-weight: 600;
}

.lottery-hero__activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #9affd5;
  box-shadow: 0 0 0 6px rgba(154, 255, 213, 0.12);
}

.lottery-hero__activity-dot--loading {
  background: #ffdc83;
  animation: activity-pulse 1s ease-in-out infinite alternate;
}

@keyframes activity-pulse {
  from { opacity: 0.46; transform: scale(0.78); }
  to { opacity: 1; transform: scale(1.12); }
}

.lottery-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
}

.lottery-stat {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 13px;
  min-height: 74px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 20px;
  padding: 12px 18px;
  color: #ffffff;
  text-align: left;
  box-shadow: 0 14px 28px rgba(126, 18, 65, 0.12);
  backdrop-filter: blur(18px);
}

.lottery-stat--blue { background: rgba(45, 112, 239, 0.8); }
.lottery-stat--gold { background: rgba(236, 164, 8, 0.88); }
.lottery-stat--green { background: rgba(22, 157, 80, 0.84); }

.lottery-stat--button {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.lottery-stat--button:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.lottery-stat--button:disabled { cursor: default; }

.lottery-stat__icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 21px;
  font-weight: 800;
}

.lottery-stat strong,
.lottery-stat small { display: block; }
.lottery-stat strong { font-size: 14px; font-weight: 800; }
.lottery-stat small { margin-top: 5px; color: rgba(255, 255, 255, 0.7); font-size: 11px; }

.lottery-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  border: 1px solid rgba(255, 230, 183, 0.54);
  border-radius: 16px;
  background: rgba(90, 25, 63, 0.28);
  padding: 12px 15px;
  color: #ffffff;
  font-size: 12px;
  backdrop-filter: blur(16px);
}

.lottery-alert strong { flex-shrink: 0; color: #ffe4a7; }
.lottery-alert span { min-width: 0; overflow: hidden; color: rgba(255, 255, 255, 0.76); text-overflow: ellipsis; white-space: nowrap; }
.lottery-alert button { flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.32); border-radius: 999px; padding: 5px 10px; color: #ffffff; font-size: 11px; font-weight: 800; cursor: pointer; }
.lottery-alert button:hover { background: rgba(255, 255, 255, 0.12); }

.lottery-content {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(330px, 0.75fr);
  gap: 18px;
  margin-top: 20px;
}

.grid-card,
.prize-card,
.history-card,
.rules-card {
  border: 1px solid rgba(255, 255, 255, 0.74);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 28px 70px rgba(114, 17, 62, 0.16);
  backdrop-filter: blur(20px);
}

.grid-card { min-height: 720px; border-radius: 30px; padding: 30px; }

.grid-card__topline,
.prize-card__heading,
.history-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-kicker { color: #e7305e; }

.grid-card h2,
.prize-card h2,
.history-card h2,
.rules-card h2 {
  margin: 7px 0 0;
  color: #2f2341;
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.grid-card__hint {
  border-radius: 999px;
  background: #fff1f4;
  padding: 8px 12px;
  color: #d92759;
  font-size: 12px;
  font-weight: 750;
  text-align: right;
}

.grid-stage {
  position: relative;
  display: flex;
  min-height: 500px;
  align-items: center;
  justify-content: center;
}

.grid-board {
  position: relative;
  display: block;
  width: min(520px, 78vw);
  aspect-ratio: 1;
  border: 10px solid #fff9e9;
  border-radius: 25px;
  background: #fff9e9;
  box-shadow:
    0 26px 40px rgba(157, 55, 51, 0.2),
    0 0 0 8px rgba(246, 193, 49, 0.92),
    inset 0 0 0 1px rgba(153, 86, 29, 0.15);
  overflow: hidden;
}

.grid-cells,
.grid-mask-layer {
  position: absolute;
  inset: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.grid-cells { z-index: 1; }

.grid-cell,
.grid-center {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 9px;
  color: #3b2d42;
  text-align: center;
}

.grid-cell {
  padding: 10px 7px 8px;
  transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease;
}

.grid-cell--active {
  z-index: 2;
  transform: scale(0.95);
  filter: brightness(1.08) saturate(1.14);
  box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 8px #f85c67, 0 0 0 3px #f85c67;
}

.grid-cell--locked {
  background: #dfe2e7 !important;
  filter: grayscale(0.72);
}
.grid-cell--empty { color: #9b9da7; }

.grid-cell__shine {
  position: absolute;
  inset: -40% -40% auto;
  height: 80%;
  transform: rotate(-20deg);
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  pointer-events: none;
}

.grid-cell__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: clamp(42px, 7vw, 80px);
  height: clamp(42px, 7vw, 80px);
  align-items: center;
  justify-content: center;
  color: #51404d;
  font-size: clamp(25px, 4.5vw, 50px);
  font-weight: 850;
  line-height: 1;
}

.grid-cell__image {
  position: relative;
  z-index: 1;
  display: block;
  width: clamp(48px, 8vw, 96px);
  height: clamp(48px, 8vw, 96px);
  object-fit: contain;
  transition: filter 0.2s ease, opacity 0.2s ease;
}

.grid-cell--locked .grid-cell__image {
  filter: grayscale(1);
  opacity: 0.58;
}

.grid-cell strong,
.grid-cell small {
  position: relative;
  z-index: 1;
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grid-cell strong { margin-top: 3px; font-size: clamp(11px, 1.25vw, 16px); font-weight: 850; }
.grid-cell small { margin-top: 4px; color: rgba(59, 45, 66, 0.66); font-size: clamp(9px, 0.9vw, 12px); }

.grid-cell__lock {
  position: absolute;
  top: 7px;
  right: 8px;
  z-index: 2;
  font-size: clamp(11px, 1.5vw, 17px);
}

.grid-center {
  border-color: #f6a523;
  background: linear-gradient(145deg, #db2f13 0%, #b91d0b 70%, #8e170b 100%);
  color: #ffffff;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 232, 155, 0.26);
  transition: transform 0.2s ease, filter 0.2s ease;
}

.grid-center:hover:not(:disabled) { transform: scale(0.97); filter: brightness(1.1); }
.grid-center:active:not(:disabled) { transform: scale(0.93); }
.grid-center:disabled { cursor: not-allowed; opacity: 0.9; }
.grid-center strong { max-width: 92%; font-size: clamp(16px, 2.6vw, 31px); font-weight: 900; line-height: 1.15; }
.grid-center small { margin-top: 7px; color: rgba(255, 255, 255, 0.72); font-size: clamp(9px, 1vw, 12px); font-weight: 700; }

.grid-center__burst {
  position: absolute;
  right: 7px;
  bottom: 5px;
  color: #ffd96e;
  font-size: clamp(20px, 3vw, 36px);
}

.grid-center--spinning { animation: center-pulse 0.7s ease-in-out infinite alternate; }

.grid-mask-layer {
  z-index: 5;
  display: block;
  pointer-events: none;
}

.grid-mask {
  position: absolute;
  display: block;
  box-sizing: border-box;
  margin: 0;
  border: 4px solid rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  background: rgba(255, 214, 35, 0.68);
  box-shadow:
    inset 0 0 0 3px rgba(245, 84, 85, 0.92),
    0 0 0 3px rgba(255, 202, 70, 0.82),
    0 0 24px rgba(255, 236, 126, 0.96);
  opacity: 0.98;
  pointer-events: none;
  transition: left 0.24s ease-in-out, top 0.24s ease-in-out, width 0.24s ease-in-out, height 0.24s ease-in-out;
}

.grid-mask--spinning { animation: mask-pulse 0.42s ease-in-out infinite alternate; }

@keyframes mask-pulse {
  from { filter: brightness(0.98); opacity: 0.78; }
  to { filter: brightness(1.18); opacity: 1; }
}

@keyframes center-pulse {
  from { filter: brightness(0.98); }
  to { filter: brightness(1.18); }
}

.grid-stage__sparkle { position: absolute; color: rgba(231, 48, 94, 0.46); font-size: 30px; font-weight: 800; }
.grid-stage__sparkle--one { top: 84px; left: 12%; }
.grid-stage__sparkle--two { right: 11%; bottom: 94px; font-size: 23px; }
.grid-stage__sparkle--three { top: 30%; right: 14%; font-size: 46px; }

.grid-result {
  display: flex;
  align-items: center;
  gap: 13px;
  border: 1px dashed #f1c6cf;
  border-radius: 18px;
  background: #fff9fb;
  padding: 13px 16px;
  color: #756875;
}

.grid-result--active { border-style: solid; border-color: #f1a9bc; background: linear-gradient(135deg, #fff7ed 0%, #fff1f6 100%); color: #a92e57; }
.grid-result__spark { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 11px; background: #ffe1e8; color: #e7305e; font-size: 18px; }
.grid-result small, .grid-result strong { display: block; }
.grid-result small { font-size: 11px; font-weight: 700; }
.grid-result strong { margin-top: 2px; font-size: 14px; font-weight: 800; }

.lottery-sidebar { display: grid; align-content: start; gap: 18px; }
.prize-card, .history-card, .rules-card { border-radius: 26px; padding: 24px; }
.prize-card__count, .history-card__badge { display: inline-flex; min-width: 34px; min-height: 28px; align-items: center; justify-content: center; border-radius: 999px; background: #fff1f4; color: #d92759; font-size: 11px; font-weight: 800; }
.prize-list, .history-list { display: grid; gap: 7px; margin-top: 20px; }
.prize-row { display: flex; align-items: center; gap: 10px; min-height: 48px; border-radius: 14px; padding: 5px 8px; transition: background-color 0.2s ease, transform 0.2s ease; }
.prize-row:hover { background: #fff7f8; transform: translateX(3px); }
.prize-row__index { width: 21px; color: #baaab2; font-family: "IBM Plex Mono", monospace; font-size: 10px; }
.prize-row__emoji { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 12px; color: #53404b; font-size: 17px; font-weight: 850; }
.prize-row__copy strong, .prize-row__copy small { display: block; }
.prize-row__copy strong { color: #33273b; font-size: 13px; font-weight: 800; }
.prize-row__copy small { margin-top: 3px; color: #a0939e; font-size: 10px; }
.history-card { background: rgba(255, 247, 250, 0.94); }
.history-row { display: flex; align-items: flex-start; gap: 10px; padding: 5px 0; }
.history-row__dot { width: 8px; height: 8px; margin-top: 5px; flex-shrink: 0; border-radius: 999px; background: #e7305e; box-shadow: 0 0 0 5px rgba(231, 48, 94, 0.11); }
.history-row strong, .history-row small { display: block; }
.history-row strong { color: #4a3545; font-size: 12px; font-weight: 800; }
.history-row small { margin-top: 3px; color: #a6939d; font-size: 10px; }
.history-empty { display: flex; min-height: 80px; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; border: 1px dashed #f1ccd6; border-radius: 16px; color: #b2a2ab; text-align: center; }
.history-empty span { color: #e998ad; font-size: 28px; }
.history-empty p { margin: 0; font-size: 11px; line-height: 1.65; }
.rules-card { background: #302640; color: rgba(255, 255, 255, 0.78); }
.rules-card .section-kicker, .rules-card h2 { color: #ffffff; }
.rules-card ol { display: grid; gap: 10px; margin: 17px 0 0; padding-left: 18px; font-size: 12px; line-height: 1.7; }
.rules-card li::marker { color: #ffcb63; font-weight: 800; }

.lottery-dialog {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(54, 13, 44, 0.58);
  padding: 24px;
  backdrop-filter: blur(8px);
}

.lottery-dialog__card {
  position: relative;
  width: min(390px, 100%);
  overflow: hidden;
  border: 5px solid #f6c13d;
  border-radius: 28px;
  background: linear-gradient(145deg, #fffdf1 0%, #fff2f5 100%);
  padding: 34px 28px 28px;
  box-shadow: 0 28px 80px rgba(39, 7, 39, 0.36), 0 0 0 8px rgba(255, 255, 255, 0.16);
  color: #3b2742;
  text-align: center;
}

.lottery-dialog__card::before,
.lottery-dialog__card::after {
  position: absolute;
  width: 110px;
  height: 110px;
  border: 1px solid rgba(231, 48, 94, 0.16);
  border-radius: 999px;
  content: "";
  pointer-events: none;
}

.lottery-dialog__card::before { top: -72px; left: -44px; }
.lottery-dialog__card::after { right: -48px; bottom: -70px; }

.lottery-dialog__confetti {
  position: absolute;
  top: 14px;
  right: 23px;
  left: 23px;
  color: #e7305e;
  font-size: 21px;
  letter-spacing: 18px;
  opacity: 0.72;
  white-space: nowrap;
}

.lottery-dialog__eyebrow { margin: 12px 0 0; color: #e7305e; font-size: 11px; font-weight: 900; letter-spacing: 0.24em; }
.lottery-dialog h2 { margin: 10px 0 0; color: #ae1c45; font-size: 31px; font-weight: 950; letter-spacing: -0.06em; }
.lottery-dialog__caption { margin: 9px 0 0; color: #9b7889; font-size: 13px; }

.lottery-dialog__prize {
  display: flex;
  min-height: 132px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  border: 1px solid #f1ced4;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  padding: 14px 20px;
  color: #3d2c42;
  font-size: 20px;
  font-weight: 900;
}

.lottery-dialog__prize img { width: 96px; height: 96px; object-fit: contain; }
.lottery-dialog__subtitle { margin: 12px 0 0; color: #9b7889; font-size: 12px; }

.lottery-dialog__button {
  min-width: 170px;
  margin-top: 22px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #e7305e, #bd2051);
  padding: 12px 24px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 850;
  box-shadow: 0 12px 22px rgba(189, 32, 81, 0.25);
  cursor: pointer;
}

.lottery-dialog__button:hover { filter: brightness(1.08); transform: translateY(-1px); }

.lottery-dialog-enter-active,
.lottery-dialog-leave-active { transition: opacity 0.2s ease; }
.lottery-dialog-enter-active .lottery-dialog__card,
.lottery-dialog-leave-active .lottery-dialog__card { transition: transform 0.24s ease, opacity 0.24s ease; }
.lottery-dialog-enter-from,
.lottery-dialog-leave-to { opacity: 0; }
.lottery-dialog-enter-from .lottery-dialog__card,
.lottery-dialog-leave-to .lottery-dialog__card { opacity: 0; transform: translateY(18px) scale(0.94); }

@media (max-width: 1024px) {
  .lottery-content { grid-template-columns: 1fr; }
  .lottery-sidebar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rules-card { grid-column: 1 / -1; }
}

@media (max-width: 768px) {
  .lottery-page { min-height: calc(100vh - 126px); }
  .lottery-page__shell { padding-top: 34px; padding-bottom: 48px; }
  .lottery-hero { align-items: flex-start; flex-direction: column; }
  .lottery-hero__activity { align-self: flex-start; }
  .lottery-stats { grid-template-columns: 1fr; gap: 9px; margin-top: 24px; }
  .lottery-stat { min-height: 62px; }
  .lottery-content { margin-top: 12px; }
  .grid-card { min-height: 0; padding: 20px 14px; }
  .grid-card__topline { align-items: flex-start; flex-direction: column; }
  .grid-card__hint { text-align: left; }
  .grid-stage { min-height: 390px; }
  .grid-board { width: min(440px, 88vw); border-width: 7px; border-radius: 18px; }
  .grid-cell { padding: 6px 3px; }
  .grid-cell__lock { top: 4px; right: 4px; }
  .grid-stage__sparkle--one { left: 3%; }
  .grid-stage__sparkle--two { right: 2%; }
  .grid-stage__sparkle--three { right: 3%; }
  .lottery-dialog { padding: 16px; }
  .lottery-dialog__card { padding: 30px 20px 22px; }
  .lottery-sidebar { grid-template-columns: 1fr; }
  .rules-card { grid-column: auto; }
  .lottery-alert { align-items: flex-start; flex-wrap: wrap; }
  .lottery-alert span { flex: 1 1 calc(100% - 130px); white-space: normal; }
}

@media (max-width: 420px) {
  .lottery-hero__title { font-size: 48px; }
  .lottery-hero__description { font-size: 13px; }
  .grid-stage { min-height: 330px; }
  .grid-board { width: min(350px, 90vw); border-width: 5px; }
  .grid-cell__icon { width: 35px; height: 35px; }
  .grid-cell strong { font-size: 10px; }
  .grid-cell small { font-size: 8px; }
}
</style>
