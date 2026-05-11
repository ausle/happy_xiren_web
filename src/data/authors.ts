export interface AuthorProfile {
  name: string;
  initials: string;
  avatar: string | null;
  ip: string;
  bio: string;
  joinDays: number;
  followingCount: number;
  followerCount: number;
  achievements: { label: string; value: string; icon: string; color: string }[];
  history: { year: string; count: number }[];
}

export const authors: Record<string, AuthorProfile> = {
  沉默王二: {
    name: "沉默王二",
    initials: "王",
    avatar: "https://images.unsplash.com/photo-1654110455429-cf322b40a906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    ip: "河南省·洛阳市",
    bio: "点击添加简介，让大家认识你吧",
    joinDays: 223,
    followingCount: 0,
    followerCount: 110,
    achievements: [
      { label: "已发布文章", value: "75 篇", icon: "📝", color: "#F59E0B" },
      { label: "文章被点赞", value: "80 次", icon: "👍", color: "#EF4444" },
      { label: "文章被阅读", value: "110806 次", icon: "👁", color: "#6C63FF" },
      { label: "文章被收藏", value: "57 篇", icon: "⭐", color: "#F97316" },
    ],
    history: [
      { year: "2025 年", count: 64 },
      { year: "2026 年", count: 11 },
    ],
  },
  管理员: {
    name: "管理员",
    initials: "A",
    avatar: null,
    ip: "北京市",
    bio: "Happy 喜人同乐官方账号，分享一人公司创业者的增长经验与工具干货。",
    joinDays: 1224,
    followingCount: 5,
    followerCount: 980,
    achievements: [
      { label: "已发布文章", value: "316 篇", icon: "📝", color: "#F59E0B" },
      { label: "文章被点赞", value: "1188 次", icon: "👍", color: "#EF4444" },
      { label: "文章被阅读", value: "438200 次", icon: "👁", color: "#6C63FF" },
      { label: "文章被收藏", value: "82 篇", icon: "⭐", color: "#F97316" },
    ],
    history: [
      { year: "2024 年", count: 128 },
      { year: "2025 年", count: 177 },
      { year: "2026 年", count: 11 },
    ],
  },
};
