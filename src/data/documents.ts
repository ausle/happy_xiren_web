export const DOCUMENT_TABS = [
  "综合",
  "随笔",
  "文章",
  "资源",
  "问答",
  "简历",
  "面试题",
  "笔记",
  "求资源",
  "直播",
  "用户",
] as const;

export const DOCUMENT_SORT_OPTIONS = ["综合", "最热", "最新"] as const;

export type DocumentTab = (typeof DOCUMENT_TABS)[number];
export type DocumentSort = (typeof DOCUMENT_SORT_OPTIONS)[number];

export interface DocumentItem {
  id: number;
  type: Exclude<DocumentTab, "综合">;
  featured: boolean;
  title: string;
  excerpt: string;
  authorName: string;
  authorInitials: string;
  authorBadges: string[];
  publishedAt: string;
  likes: number;
  comments: number;
  views: number;
  favorites: number;
  tags: string[];
}

export const documents: DocumentItem[] = [
  {
    id: 1,
    type: "文章",
    featured: true,
    title: "Java 服务慢查询定位实战：从接口超时到 SQL 优化闭环",
    excerpt:
      "把一次真实的线上排查过程拆开讲清楚，包括线程池观察、接口链路定位、慢 SQL 分析、索引调整和发布后的回归验证。",
    authorName: "holwell",
    authorInitials: "H",
    authorBadges: ["V1", "会员"],
    publishedAt: "2026-05-20T13:00:00",
    likes: 34,
    comments: 12,
    views: 4200,
    favorites: 18,
    tags: ["Java", "MySQL", "性能优化", "后端"],
  },
  {
    id: 2,
    type: "资源",
    featured: false,
    title: "Spring Boot 后台管理脚手架清单：权限、审计、上传、监控一套配齐",
    excerpt:
      "整理了我近一年常用的后台项目基础能力和开源组合，适合拿来做内部系统或个人产品 MVP。",
    authorName: "阿泽",
    authorInitials: "阿",
    authorBadges: ["作者"],
    publishedAt: "2026-05-18T09:30:00",
    likes: 27,
    comments: 8,
    views: 2860,
    favorites: 31,
    tags: ["Spring Boot", "权限系统", "开源", "工程化"],
  },
  {
    id: 3,
    type: "问答",
    featured: false,
    title: "为什么 Java 里 CompletableFuture 经常越写越乱？",
    excerpt:
      "这条问答把常见误区和推荐写法放在一起讲，重点是线程切换、异常处理和链式组合的边界。",
    authorName: "Mika",
    authorInitials: "M",
    authorBadges: ["答主"],
    publishedAt: "2026-05-16T20:15:00",
    likes: 18,
    comments: 21,
    views: 1980,
    favorites: 9,
    tags: ["Java", "并发", "CompletableFuture"],
  },
  {
    id: 4,
    type: "面试题",
    featured: true,
    title: "JVM 高频面试题 30 问：内存结构、GC、类加载器一次梳理",
    excerpt:
      "不只是罗列题目，而是把每道题背后的答题结构、延伸追问和容易踩坑的点一起补全。",
    authorName: "程默",
    authorInitials: "程",
    authorBadges: ["精选"],
    publishedAt: "2026-05-14T11:10:00",
    likes: 66,
    comments: 19,
    views: 6120,
    favorites: 44,
    tags: ["Java", "JVM", "面试", "后端"],
  },
  {
    id: 5,
    type: "笔记",
    featured: true,
    title: "MCP 能力调研笔记：文件、浏览器、文档、自动化这四类最值得先接",
    excerpt:
      "记录我给 Agent 接工具时的判断标准，哪些值得优先做、哪些只是看起来很酷但短期收益有限。",
    authorName: "Chance",
    authorInitials: "C",
    authorBadges: ["作者", "会员"],
    publishedAt: "2026-05-13T22:40:00",
    likes: 41,
    comments: 10,
    views: 3510,
    favorites: 29,
    tags: ["AI", "MCP", "Agent", "工作流"],
  },
  {
    id: 6,
    type: "随笔",
    featured: false,
    title: "从一个需求评审会里学到的事：技术方案为什么总在最后一刻返工",
    excerpt:
      "不是每次返工都因为实现差，更多时候是目标不清、验收不清、约束没摆在台面上。",
    authorName: "Yuki",
    authorInitials: "Y",
    authorBadges: [],
    publishedAt: "2026-05-11T18:05:00",
    likes: 23,
    comments: 6,
    views: 1440,
    favorites: 7,
    tags: ["团队协作", "需求分析", "项目复盘"],
  },
  {
    id: 7,
    type: "简历",
    featured: false,
    title: "后端工程师简历拆解：项目经历怎么写才不会像技术栈清单",
    excerpt:
      "围绕项目背景、目标、动作、结果来写经历，并补了可以直接套用的 STAR 结构示例。",
    authorName: "Lin",
    authorInitials: "L",
    authorBadges: ["内推官"],
    publishedAt: "2026-05-09T15:20:00",
    likes: 38,
    comments: 14,
    views: 4020,
    favorites: 36,
    tags: ["简历", "求职", "STAR", "后端"],
  },
  {
    id: 8,
    type: "求资源",
    featured: false,
    title: "求推荐一套适合独立开发者的支付、发票和订阅管理资料",
    excerpt:
      "重点想找国内外都能参考的实践，最好包含产品形态、税务流程和技术实现经验。",
    authorName: "Nora",
    authorInitials: "N",
    authorBadges: [],
    publishedAt: "2026-05-07T08:50:00",
    likes: 9,
    comments: 17,
    views: 860,
    favorites: 4,
    tags: ["订阅支付", "独立开发", "SaaS"],
  },
  {
    id: 9,
    type: "直播",
    featured: true,
    title: "本周六直播：Vue 3 后台页面重构，边写边讲状态管理和表单设计",
    excerpt:
      "会从一个真实页面入手，把筛选区、列表区和抽屉表单拆成可维护的组件结构。",
    authorName: "安可",
    authorInitials: "安",
    authorBadges: ["主讲"],
    publishedAt: "2026-05-05T19:30:00",
    likes: 52,
    comments: 24,
    views: 4880,
    favorites: 26,
    tags: ["Vue 3", "直播", "前端", "组件设计"],
  },
  {
    id: 10,
    type: "用户",
    featured: false,
    title: "用户档案：做了 3 个 AI 工具之后，他是怎么把内容站做起来的",
    excerpt:
      "这个用户页记录了产品方向、增长动作和复盘习惯，适合对独立开发路径感兴趣的人看。",
    authorName: "舟一",
    authorInitials: "舟",
    authorBadges: ["创作者"],
    publishedAt: "2026-05-03T10:00:00",
    likes: 21,
    comments: 5,
    views: 1690,
    favorites: 8,
    tags: ["用户故事", "AI", "增长"],
  },
  {
    id: 11,
    type: "文章",
    featured: false,
    title: "Vue 3 权限路由设计：菜单、按钮、接口权限三层怎么对齐",
    excerpt:
      "把前端常见的权限点拆成页面、组件、动作三层，并给出和后端角色模型对接的落地方式。",
    authorName: "Pixel",
    authorInitials: "P",
    authorBadges: ["V2"],
    publishedAt: "2026-05-02T14:45:00",
    likes: 31,
    comments: 9,
    views: 2740,
    favorites: 19,
    tags: ["Vue 3", "权限系统", "前端", "工程化"],
  },
  {
    id: 12,
    type: "资源",
    featured: true,
    title: "AI Agent 工具箱导航：提示词、RAG、浏览器自动化、评测一页看完",
    excerpt:
      "适合刚开始搭 Agent 的同学做地图使用，我把常用能力拆分成模块并附了学习顺序建议。",
    authorName: "Chance",
    authorInitials: "C",
    authorBadges: ["作者"],
    publishedAt: "2026-04-30T21:10:00",
    likes: 58,
    comments: 16,
    views: 5370,
    favorites: 47,
    tags: ["AI", "Agent", "RAG", "MCP"],
  },
];
