export interface Article {
  id: number;
  featured: boolean;
  category: string;
  title: string;
  summary: string;
  author: {
    name: string;
    initials: string;
  };
  date: string;
  views: number;
  comments: number;
  likes: number;
  tags: string[];
  thumbnail: string | null;
  body: string;
}

export interface FeaturedCard {
  id: number;
  image: string;
  title: string;
  tags: string[];
  author: string;
  date: string;
}

export const featuredCards: FeaturedCard[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1666158630180-bb5358b0c5e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    title: "Happy 内容助手 v2.0 上线，类 Dify 工作流、RAG 集成、AI 写作一体...",
    tags: ["AI", "工具", "效率"],
    author: "管理员",
    date: "2026/03/15",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1595853119997-1fcb58fb29b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    title: "8 大实战项目 + 4 个付费专栏的获取方式（密码已重置）",
    tags: ["实战", "后端", "面试"],
    author: "沉默王二",
    date: "2026/01/21",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1695173184180-6e3919fde201?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    title: "靠这套增长策略，3 个月 YouTube 频道突破 10 万订阅...",
    tags: ["求职", "简历", "增长"],
    author: "管理员",
    date: "2025/10/10",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1633428620790-99dc3ca163e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    title: "如何加入喜人同乐？如何解锁付费专栏？常见问题完整答疑",
    tags: ["社区", "付费"],
    author: "沉默王二",
    date: "2023/07/10",
  },
];

export const announcements = [
  { id: 1, tag: "官宣", title: "喜人同乐正式上线！", desc: "欢迎加入，就上喜人同乐？！", btn: "立即查看" },
  { id: 2, tag: "资源", title: "面渣逆袭 2.0 PDF 可下载了！", desc: "GitHub 星标 16000+，高质量八股，神一般存在。", btn: "立即查看" },
];

export const hotArticles = [
  { id: 1, title: "解决中文乱码：字符编码全攻略 - ASCII、Unicode、UTF-8、GB2312..." },
  { id: 2, title: "Happy RAG 知识库项目上线！AI 时代，你值得拥有！" },
  { id: 3, title: "IDEA 激活码 2026 永久激活，亲测有效，随时更新" },
  { id: 4, title: "Happy RAG 项目如何写到简历上？（附 20 道精选 AI 面试题）" },
  { id: 5, title: "如何学习喜人同乐这个 Spring Boot + React 前后端分离项目？" },
];

export const articles: Article[] = [
  {
    id: 1,
    featured: true,
    category: "精选专栏",
    title: "如何加入喜人同乐社区？附 30 元优惠券，性价比最高的内容平台",
    summary:
      "喜人同乐社区是国内为数不多真正聚焦一人公司创业者的内容平台，没有之一！AI 工作流编排、前后端分离完整项目、RAG 知识库集成、Go 版微服务，全都有...",
    author: { name: "沉默王二", initials: "王" },
    date: "2025年12月02日 14:52",
    views: 4907,
    comments: 17,
    likes: 14,
    tags: ["内容", "面试", "求职"],
    thumbnail:
      "https://images.unsplash.com/photo-1666158630180-bb5358b0c5e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    body: `大家好，我是二哥。

2025 年 9 月初，我就立项了喜人同乐 Agent 项目，除了调研、编码，就是不停地肝教程，几乎每天所有的空闲时间都扑在这个项目上，但依然到 2026 年 2 月份整体的教程才趋于完善。

给大家看一下整体的教程内容，一共 195344 字，光攒稿时间就足足 1450 小时，如果一天 24 小时都在攒稿，需要足足 60 天（我滴乖乖）。

## 为什么要创建喜人同乐？

过去几年，随着信息爆炸，真正有价值的内容变得越来越难以找到。喜人同乐的目标就是成为创作者和读者之间的桥梁，帮助优质内容找到真正需要它的人。

## 平台核心功能

1. **内容社区**：汇聚一人公司创业者、独立开发者、内容创作者的优质文章和经验分享。
2. **工具集成**：内置 AI 写作助手、YouTube 数据分析、增长策略建议等实用工具。
3. **付费专栏**：订阅优质创作者的深度内容，包括完整的项目实战、行业分析报告等。
4. **社区互动**：评论、点赞、收藏、关注，构建真实的创作者网络。

## 如何加入？

访问官网 happy.com，点击「注册」按钮，填写基本信息即可免费加入基础版本。高级功能需要订阅会员，目前有 30 元优惠券赠送给新用户。

## 内容分类

- **增长策略**：YouTube/Twitter/Reddit 等平台的增长技巧和案例
- **变现方法**：广告、赞助、付费内容、数字产品等变现路径
- **工具推荐**：提升效率的 AI 工具和 SaaS 产品评测
- **案例拆解**：成功创作者和一人公司的详细案例分析

加入我们，和数千名一人公司创业者一起成长！`,
  },
  {
    id: 2,
    featured: false,
    category: "AI",
    title: "AI 内容创作实战：10 个让效率翻倍的工具与技巧",
    summary:
      "DeepSeek 深度实测，AI 辅助内容创作的完整路径，和 Claude Code 到底差在哪？本文从实际使用场景出发，逐一比较核心功能。",
    author: { name: "管理员", initials: "A" },
    date: "2026年05月10日 08:29",
    views: 87,
    comments: 0,
    likes: 0,
    tags: ["AI"],
    thumbnail: null,
    body: `AI 工具正在以前所未有的速度改变内容创作的方式。本文整理了 10 个真正能提升效率的工具，并结合实际使用场景做了详细测评。

## 1. Claude Code — 代码与文案双修

Claude Code 在代码生成和长文案写作方面表现出色，上下文窗口大，适合处理复杂的结构化内容。

## 2. DeepSeek — 性价比之王

DeepSeek 在中文内容生成方面有明显优势，API 价格也更亲民，适合批量生成内容的场景。

## 3. Perplexity — 联网搜索写作

需要基于最新数据写作时，Perplexity 是首选。它会自动检索来源并整合成完整文章。

## 4. Notion AI — 无缝集成工作流

如果你的写作工作流在 Notion 上，Notion AI 的集成体验是最顺畅的。

## 5. Gamma — PPT 自动生成

把文章或大纲一键转换为精美 PPT，特别适合需要制作演示文稿的场景。

## 效率提升策略

组合使用 AI 工具的关键是：先用 AI 生成框架和初稿，再人工润色和注入个人观点，最后用 AI 优化语言和排版。这套流程可以将内容生产效率提升 3-5 倍。`,
  },
  {
    id: 3,
    featured: false,
    category: "增长策略",
    title: "web-access Skill 上线：内容助手的联网能力拉到满分",
    summary:
      "本文详解为 Happy 内容助手添加 web-access Skill，实现 Agent 在 web_fetch、Chrome DevTools 等场景中智能决策与绕过拦截，提升日常浏览效率。",
    author: { name: "管理员", initials: "A" },
    date: "2026年05月08日 22:45",
    views: 192,
    comments: 0,
    likes: 0,
    tags: ["增长策略"],
    thumbnail: null,
    body: `联网能力是 Agent 最关键的能力之一。本次更新的 web-access Skill 让内容助手可以实时获取网络信息，大幅提升内容的时效性和准确性。

## 核心功能

- **实时搜索**：自动搜索相关资料并整合到内容中
- **页面爬取**：支持访问指定 URL 获取最新信息
- **智能去重**：自动过滤重复信息，只保留有价值的内容

这是内容创作助手进化的重要一步。`,
  },
  {
    id: 4,
    featured: false,
    category: "工具推荐",
    title: "Agent 直连你的 Chrome 浏览器，天然携带登录态",
    summary:
      "内容助手第 14 期，实现 CDP 会话复用，Agent 直连你的 Chrome 浏览器，访问 GitHub 私仓、内部系统、邮箱等需要登录态的页面。",
    author: { name: "管理员", initials: "A" },
    date: "2026年05月08日 22:41",
    views: 180,
    comments: 0,
    likes: 1,
    tags: ["工具推荐"],
    thumbnail: null,
    body: `通过 Chrome DevTools Protocol，我们实现了 Agent 与真实浏览器的直接连接。这意味着 Agent 可以使用你已经登录的账号访问各种需要身份认证的页面。

## 应用场景

1. 访问 GitHub 私有仓库，自动生成代码文档
2. 登录邮箱，整理和分类重要邮件
3. 访问付费内容平台，辅助整理学习笔记
4. 操作内部系统，自动化日常工作流程

## 安全设计

- 敏感页面保护机制，防止数据泄露
- 标签页防误关设计
- 完整的操作日志记录`,
  },
  {
    id: 5,
    featured: false,
    category: "案例拆解",
    title: "Happy Agent 如何写到简历上？类 Claude Code 的 Java 版 CLI Agent",
    summary:
      "100 种简历写法，Happy 内容助手如何写到简历上，包括 ReAct、RAG、Memory、Multi-Agent、Chrome DevTools MCP 等内容。",
    author: { name: "管理员", initials: "A" },
    date: "2026年05月07日 16:30",
    views: 499,
    comments: 1,
    likes: 0,
    tags: ["案例拆解"],
    thumbnail: null,
    body: `如何把参与过的项目写成亮眼的简历经历，是很多开发者的痛点。本文以 Happy Agent 项目为例，详细拆解简历写法。

## 简历框架

**项目名称**：Happy AI 内容助手 (CLI Agent)

**技术栈**：Java 21 + Spring AI + LangChain4j + Chrome DevTools Protocol

**项目描述**：基于 ReAct 框架设计的多能力 AI Agent，支持工具调用、记忆管理、RAG 知识库检索，以及通过 CDP 直连浏览器进行自动化操作。

**核心亮点**：
- 实现 ReAct 循环，支持复杂多步骤任务推理
- 集成 RAG 知识库，支持私有文档问答
- 通过 CDP 实现有状态浏览器自动化

这样写出来的简历经历，既展示了技术深度，又体现了实际应用价值。`,
  },
  {
    id: 6,
    featured: false,
    category: "精选专栏",
    title: "一人公司从 0 到月入 5 万：我的完整增长路径复盘",
    summary:
      "离职 18 个月后，我是如何通过内容创作 + AI 工具 + 社区运营，实现月入 5 万的完整路径。没有捷径，只有系统方法论和持续执行。",
    author: { name: "沉默王二", initials: "王" },
    date: "2026年04月20日 10:15",
    views: 2341,
    comments: 45,
    likes: 88,
    tags: ["变现方法"],
    thumbnail: null,
    body: `2024 年 10 月，我从一家大厂辞职，开始尝试一人公司的路径。18 个月后，实现月入 5 万稳定收入。

## 第一阶段：内容积累（0-6 个月）

前 6 个月几乎没有收入，但专注做了一件事：每天发布一篇优质内容。

选题策略是关键——找自己真正懂的领域，写真正有价值的内容，不追热点。

## 第二阶段：社区建设（6-12 个月）

开始建立自己的读者群体，从评论互动中了解读者真实需求，针对性地创作内容。

在这个阶段，YouTube 频道开始起量，Twitter 也积累了 5000+ 真实粉丝。

## 第三阶段：变现验证（12-18 个月）

开始推出付费专栏，第一个专栏定价 99 元，第一个月卖出了 200 份。

之后陆续上线了工具类订阅、赞助合作、咨询服务，逐步实现收入多元化。

## 核心经验

1. **选对赛道**：做自己真正擅长且有需求的领域
2. **持续输出**：内容质量比数量重要，但数量也不能太少
3. **建立信任**：真实分享，不过度包装，读者感受得到
4. **工具加持**：AI 工具可以帮你提升 3 倍效率`,
  },
];

export const relatedArticles = [
  "Happy RAG 知识库项目上线！AI 时代，你值得拥有！",
  "Happy RAG 项目如何写到简历上？（附 20 道精选 AI 面试题）",
  "如何学习喜人同乐这个 Spring Boot + React 前后端分离项目？",
  "面渣逆袭 2.0 PDF 可下载了！GitHub 星标 16000+",
  "解决中文乱码：字符编码全攻略 - ASCII、Unicode、UTF-8、GB2312...",
];
