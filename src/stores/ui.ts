import { defineStore } from "pinia";

export const HOME_CATEGORIES = [
  "全部",
  "精选专栏",
  "AI",
  "增长策略",
  "变现方法",
  "YouTube",
  "GitHub",
  "案例拆解",
  "出海经验",
  "工具推荐",
  "代码人生",
];

export const useUiStore = defineStore("ui", {
  state: () => ({
    loginOpen: false,
    activeCategory: "全部",
  }),
  actions: {
    setLoginOpen(value: boolean) {
      this.loginOpen = value;
    },
    setActiveCategory(value: string) {
      this.activeCategory = value;
    },
  },
});
