import { createRouter, createWebHistory } from "vue-router";
import SiteLayout from "@/layouts/SiteLayout.vue";

const routes = [
  {
    path: "/",
    component: SiteLayout,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/HomePage.vue"),
      },
      {
        path: "traffic",
        name: "traffic",
        component: () => import("@/views/TrafficPage.vue"),
      },
      {
        path: "traffic/youtube",
        name: "youtube",
        component: () => import("@/views/YouTubePage.vue"),
      },
      {
        path: "traffic/youtube/channels",
        name: "channel-ranking",
        component: () => import("@/views/ChannelRankingPage.vue"),
      },
      {
        path: "traffic/youtube/trending",
        name: "trending-videos",
        component: () => import("@/views/TrendingVideosPage.vue"),
      },
      {
        path: "traffic/youtube/rising",
        name: "rising-channels",
        component: () => import("@/views/RisingChannelsPage.vue"),
      },
      {
        path: "article/:id",
        name: "article",
        component: () => import("@/views/ArticlePage.vue"),
      },
      {
        path: "author/:name",
        name: "author",
        component: () => import("@/views/AuthorPage.vue"),
      },
    ],
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterPage.vue"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/ForgotPasswordPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
