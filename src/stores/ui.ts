import { defineStore } from "pinia";
import type { HomeCategory } from "@/types/home";

export const DEFAULT_HOME_CATEGORY = "全部";

export const useUiStore = defineStore("ui", {
  state: () => ({
    loginOpen: false,
    activeCategory: DEFAULT_HOME_CATEGORY,
    homeCategories: [] as HomeCategory[],
  }),
  getters: {
    homeCategoryNames: (state) => state.homeCategories.map((item) => item.category),
  },
  actions: {
    setLoginOpen(value: boolean) {
      this.loginOpen = value;
    },
    setActiveCategory(value: string) {
      this.activeCategory = value;
    },
    setHomeCategories(categories: HomeCategory[], activeCategory?: string) {
      this.homeCategories = categories;

      const categoryNames = categories.map((item) => item.category);
      const nextCategory =
        activeCategory ??
        categories.find((item) => item.selected)?.category ??
        categoryNames[0] ??
        DEFAULT_HOME_CATEGORY;

      if (!this.activeCategory || !categoryNames.includes(this.activeCategory) || activeCategory) {
        this.activeCategory = nextCategory;
      }
    },
    clearHomeCategories() {
      this.homeCategories = [];
      this.activeCategory = DEFAULT_HOME_CATEGORY;
    },
  },
});
