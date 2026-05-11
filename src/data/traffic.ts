export interface Platform {
  name: string;
  icon: string;
  iconBg: string;
  badge?: string;
  features: string[];
  href?: string;
}

export interface ToolItem {
  icon: string;
  title: string;
  desc: string;
  available: boolean;
  href?: string;
}

export const overseasPlatforms: Platform[] = [
  { name: "YouTube", icon: "Youtube", iconBg: "#FF0000", badge: "已上线", features: ["频道分析", "数据榜单", "CPM 收入指南", "选题工具"], href: "/traffic/youtube" },
  { name: "X", icon: "Hash", iconBg: "#000000", features: ["推主增长分析", "Thread 遮盖（即将上线）"] },
  { name: "TikTok", icon: "Music2", iconBg: "#010101", features: ["短视频分析", "跨境内容（即将上线）"] },
  { name: "Reddit", icon: "MessageSquare", iconBg: "#FF4500", features: ["subreddit 分析", "爆款追踪", "AI 遮盖（即将上线）"] },
  { name: "Instagram", icon: "Image", iconBg: "#E1306C", features: ["Reels 拆解", "爆款遮盖（即将上线）"] },
  { name: "Substack", icon: "Mail", iconBg: "#FF6719", features: ["Newsletter 增长追踪", "对标作者拆解（即将上线）"] },
  { name: "Medium", icon: "FileText", iconBg: "#00AB6C", features: ["作者分析", "Publication 追踪（即将上线）"] },
  { name: "Pinterest", icon: "Image", iconBg: "#E60023", features: ["Pin 分析", "长尾关键词", "电商引流（即将上线）"] },
  { name: "Twitch", icon: "Tv", iconBg: "#9146FF", features: ["主播主分析", "品类热度（即将上线）"] },
  { name: "Telegram", icon: "Send", iconBg: "#2CA5E0", features: ["频道分析", "Bot 框架", "付费群（即将上线）"] },
  { name: "Product Hunt", icon: "Rocket", iconBg: "#DA552F", badge: "已上线", features: ["发布检索历史", "趋势分析"] },
  { name: "GitHub", icon: "Github", iconBg: "#24292E", badge: "已上线", features: ["Trending 历史榜单", "深度搜索分析"] },
];

export const domesticPlatforms: Platform[] = [
  { name: "抖音", icon: "Music2", iconBg: "#161823", badge: "已上线", features: ["短视频文案提取", "热点追踪"] },
  { name: "小红书", icon: "BookOpen", iconBg: "#FE2C55", features: ["笔记拆解", "爆款遮盖（即将上线）"] },
  { name: "微信公众号", icon: "MessageSquare", iconBg: "#07C160", features: ["图文深度分析（即将上线）"] },
  { name: "B 站", icon: "Video", iconBg: "#00AEEC", features: ["UP 主分析", "知识区遮盖（即将上线）"] },
];

export const crossPlatforms: Platform[] = [
  { name: "跨平台数据看板", icon: "Grid3x3", iconBg: "#6C63FF", features: ["多视频账号标定 + 统一数据视图（即将上线）"] },
];

export const freeTools: ToolItem[] = [
  { icon: "BarChart2", title: "频道数据榜单", desc: "按分类、地区、订阅量、增长速度查看 YouTube 热门频道", available: true, href: "/traffic/youtube/channels" },
  { icon: "Users", title: "潜力新账号", desc: "订阅 <10 万且近 7 日涨粉 ≥1000 的活跃频道，发现下一个对标对象", available: true, href: "/traffic/youtube/rising" },
];

export const memberTools: ToolItem[] = [
  { icon: "TrendingUp", title: "爆款视频追踪", desc: "近 7/30 天高速增长的视频，发现下一个内容机会", available: true, href: "/traffic/youtube/trending" },
  { icon: "Search", title: "频道详细分析", desc: "输入频道 URL 自动拆解：定位、内容支柱、数据节奏、变现", available: true },
  { icon: "FileText", title: "视频脚本拆解", desc: "AI 自动提取视频开场 hook、信息密度、剪辑结构", available: true },
  { icon: "Lightbulb", title: "AI 选题工具", desc: "输入领域关键词，AI 给出基于热点和长尾词的选题建议", available: true },
  { icon: "Users", title: "对标频道对比", desc: "和 1–3 个同领域频道对比内容支柱、上传节奏、平均观看", available: true },
];
