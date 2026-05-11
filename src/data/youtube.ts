export const channelCategories = [
  "全部", "娱乐", "知识", "音乐", "游戏", "社会",
  "科技", "美食", "健康", "体育", "旅游", "商业", "宠物", "交通工具",
];

export const trendingLanguages = [
  "全部语言", "南非荷兰语", "阿姆哈拉语", "阿拉伯语", "阿萨姆语",
  "阿塞拜疆语", "白俄罗斯语", "保加利亚语", "孟加拉语", "波斯尼亚语",
  "加泰罗尼亚语", "捷克语", "丹麦语", "德语", "希腊语",
  "英语", "英语(英)", "英语(印)", "西班牙语", "西班牙语(拉美)",
  "爱沙尼亚语", "芬兰语", "法语", "爱尔兰语", "加利西亚语",
  "古吉拉特语", "印地语", "克罗地亚语", "匈牙利语", "亚美尼亚语",
  "印度尼西亚语", "冰岛语", "意大利语", "日语", "格鲁吉亚语",
  "哈萨克语", "高棉语", "卡纳达语", "韩语", "立陶宛语",
  "拉脱维亚语", "马其顿语", "马拉雅拉姆语", "马拉地语", "马来语",
  "挪威语", "尼泊尔语", "荷兰语", "旁遮普语", "波兰语",
  "葡萄牙语", "葡萄牙语(巴西)", "罗马尼亚语", "俄语", "僧伽罗语",
  "斯洛伐克语", "斯洛文尼亚语", "阿尔巴尼亚语", "塞尔维亚语", "瑞典语",
  "斯瓦希里语", "泰米尔语", "泰卢固语", "泰语", "土耳其语",
  "乌克兰语", "乌尔都语", "乌兹别克语", "越南语", "中文(简体)",
  "中文(繁体)", "祖鲁语",
];

export const risingLanguages = [
  "全部语言", "南非荷兰语", "阿拉伯语", "孟加拉语", "保加利亚语",
  "加泰罗尼亚语", "捷克语", "丹麦语", "德语", "希腊语",
  "英语", "英语(英)", "英语(印)", "西班牙语", "西班牙语(拉美)",
  "爱沙尼亚语", "芬兰语", "法语", "古吉拉特语", "印地语",
  "克罗地亚语", "匈牙利语", "印度尼西亚语", "意大利语", "日语",
  "韩语", "立陶宛语", "马来语", "挪威语", "荷兰语",
  "波兰语", "葡萄牙语", "葡萄牙语(巴西)", "罗马尼亚语", "俄语",
  "斯洛伐克语", "塞尔维亚语", "瑞典语", "泰米尔语", "泰语",
  "土耳其语", "乌克兰语", "越南语", "中文(简体)", "中文(繁体)",
];

export interface Channel {
  id: number;
  name: string;
  avatar: string;
  avatarBg: string;
  tags: string[];
  desc: string;
  subs: string;
  views: string;
  videos: string;
  incomeMin: string;
  incomeMax: string;
  category: string;
}

export const channels: Channel[] = [
  {
    id: 1, name: "MrBeast", avatar: "🐶", avatarBg: "#1db954",
    tags: ["生活", "美国", "英语"],
    desc: "Terms & Conditions of Current Sweepstakes: https://bit.ly/mrbeastbowandarrow SUBSCRIBE FOR A COOKIE! New MrBeast or MrBeast Gaming every single Saturday at noon ea...",
    subs: "4.8亿", views: "1209.8亿", videos: "976", incomeMin: "¥21.8亿", incomeMax: "¥43.6亿", category: "生活",
  },
  {
    id: 2, name: "T-Series", avatar: "T", avatarBg: "#e53935",
    tags: ["娱乐", "印度"],
    desc: "Music can change the world®. T-Series is India's largest Music Label & Movie Studio, believes in bringing world close together through its music. For over thirty years, we've been more ...",
    subs: "3.1亿", views: "3404.5亿", videos: "2.6万", incomeMin: "¥3.1亿", incomeMax: "¥8.2亿", category: "娱乐",
  },
  {
    id: 3, name: "Cocomelon - Nursery Rhymes", avatar: "🍉", avatarBg: "#ff6b6b",
    tags: ["影视", "美国", "英语"],
    desc: "Welcome to CoComelon! At CoComelon, early learning and fun come together through the power of music. Our videos support preschoolers in building life skills through ...",
    subs: "2.0亿", views: "2214.2亿", videos: "1,993", incomeMin: "¥23.9亿", incomeMax: "¥63.8亿", category: "娱乐",
  },
  {
    id: 4, name: "YouTube Movies", avatar: "🎬", avatarBg: "#212121",
    tags: ["影视", "美国"],
    desc: "YouTube's movies destination featuring the latest new releases, blockbusters and more.",
    subs: "2.0亿", views: "—", videos: "—", incomeMin: "¥0", incomeMax: "¥0", category: "影视",
  },
  {
    id: 5, name: "SET India", avatar: "S", avatarBg: "#1565c0",
    tags: ["娱乐", "印度"],
    desc: "Sony Entertainment Television is one of the leading Hindi General Entertainment Channel in India. Since its launch in October 1995, it has created a unique space in prog...",
    subs: "1.9亿", views: "1882.4亿", videos: "17.1万", incomeMin: "¥9035万", incomeMax: "¥2.3亿", category: "娱乐",
  },
  {
    id: 6, name: "Kids Diana Show", avatar: "👧", avatarBg: "#e91e8c",
    tags: ["生活", "美国", "英语"],
    desc: "Hi! We are Diana and Roma! We make fun videos and playing with lots of toys. Subscribe to our channel to watch all our videos.",
    subs: "1.3亿", views: "92.4亿", videos: "1,102", incomeMin: "¥1.3亿", incomeMax: "¥2.6亿", category: "生活",
  },
  {
    id: 7, name: "Vlad and Niki", avatar: "🎮", avatarBg: "#6c63ff",
    tags: ["游戏", "美国", "英语"],
    desc: "Hi, I'm Vlad and this is my brother Niki! We play games, do fun challenges and make awesome videos for kids. New videos every week!",
    subs: "1.2亿", views: "87.2亿", videos: "745", incomeMin: "¥8900万", incomeMax: "¥1.8亿", category: "游戏",
  },
  {
    id: 8, name: "Like Nastya", avatar: "🌸", avatarBg: "#ff4081",
    tags: ["生活", "美国", "英语"],
    desc: "Hi! My name is Nastya and I am 9 years old. My family and I create fun adventures and educational content for children all around the world.",
    subs: "1.2亿", views: "96.1亿", videos: "834", incomeMin: "¥9200万", incomeMax: "¥1.9亿", category: "生活",
  },
  {
    id: 9, name: "BLACKPINK", avatar: "💗", avatarBg: "#ff1744",
    tags: ["音乐", "韩语"],
    desc: "BLACKPINK Official YouTube Channel. BLACKPINK - 'Pink Venom' M/V out now! Subscribe to BLACKPINK YouTube channel.",
    subs: "9300万", views: "33.1亿", videos: "412", incomeMin: "¥900万", incomeMax: "¥1800万", category: "音乐",
  },
  {
    id: 10, name: "Zee Music Company", avatar: "🎵", avatarBg: "#7b1fa2",
    tags: ["音乐", "印度"],
    desc: "Zee Music Company is India's fastest growing music label. We bring you the latest Bollywood songs, romantic songs and more.",
    subs: "1.1亿", views: "102.3亿", videos: "1.4万", incomeMin: "¥1200万", incomeMax: "¥3100万", category: "音乐",
  },
  {
    id: 11, name: "Whindersson Nunes", avatar: "😂", avatarBg: "#ff6d00",
    tags: ["娱乐", "葡萄牙语"],
    desc: "Sou Whindersson Nunes, e esse canal é meu e dela, gosto muito de fazer vídeos e agradeço imensamente cada inscrito que tenho aqui.",
    subs: "4600万", views: "9.7亿", videos: "326", incomeMin: "¥200万", incomeMax: "¥600万", category: "娱乐",
  },
  {
    id: 12, name: "Canal KondZilla", avatar: "🎤", avatarBg: "#00c853",
    tags: ["音乐", "葡萄牙语"],
    desc: "O maior canal de funk do mundo! KondZilla é o maior produtor de clipes de funk do Brasil, com mais de 40 bilhões de visualizações.",
    subs: "6700万", views: "48.2亿", videos: "2,800", incomeMin: "¥500万", incomeMax: "¥1300万", category: "音乐",
  },
];

export interface TrendingVideo {
  id: number;
  thumbnail: string;
  thumbnailBg: string;
  title: string;
  channel: string;
  channelAvatar: string;
  channelAvatarBg: string;
  tags: string[];
  growthViews7d: string;
  growthPct7d: string;
  totalViews: string;
  likes: string;
  publishedAt: string;
  duration: string;
}

export const videos7d: TrendingVideo[] = [
  { id: 1, thumbnail: "🎯", thumbnailBg: "#1db954", title: "I Spent 50 Hours Buried Alive", channel: "MrBeast", channelAvatar: "🐶", channelAvatarBg: "#1db954", tags: ["生活", "美国", "英语"], growthViews7d: "+4821万", growthPct7d: "+892.3%", totalViews: "5407万", likes: "241万", publishedAt: "3天前", duration: "21:34" },
  { id: 2, thumbnail: "🎵", thumbnailBg: "#7b1fa2", title: "APT. - ROSE & Bruno Mars (Official M/V)", channel: "ROSE", channelAvatar: "🌹", channelAvatarBg: "#e91e63", tags: ["音乐", "韩语"], growthViews7d: "+3204万", growthPct7d: "+537.5%", totalViews: "4182万", likes: "312万", publishedAt: "5天前", duration: "03:20" },
  { id: 3, thumbnail: "🤖", thumbnailBg: "#0288d1", title: "OpenAI发布o3 — 比你更聪明的AI来了", channel: "科技前沿", channelAvatar: "🤖", channelAvatarBg: "#0288d1", tags: ["科技", "中文"], growthViews7d: "+2871万", growthPct7d: "+1204.7%", totalViews: "3109万", likes: "98万", publishedAt: "6天前", duration: "15:42" },
  { id: 4, thumbnail: "⚽", thumbnailBg: "#388e3c", title: "Champions League Final 2025 — Full Highlights", channel: "UEFA", channelAvatar: "⚽", channelAvatarBg: "#1565c0", tags: ["体育", "英语"], growthViews7d: "+2543万", growthPct7d: "+321.8%", totalViews: "3877万", likes: "#177万", publishedAt: "2天前", duration: "08:52" },
  { id: 5, thumbnail: "🍜", thumbnailBg: "#f57c00", title: "맛있는 라멘 만들기 — 집에서 완벽한 일본 라멘", channel: "쿠킹하루", channelAvatar: "🍜", channelAvatarBg: "#f57c00", tags: ["美食", "韩语"], growthViews7d: "+1987万", growthPct7d: "+423.1%", totalViews: "2354万", likes: "89万", publishedAt: "4天前", duration: "18:07" },
  { id: 6, thumbnail: "🎮", thumbnailBg: "#6c63ff", title: "GTA VI — Official Gameplay Trailer (4K)", channel: "Rockstar Games", channelAvatar: "🎮", channelAvatarBg: "#6c63ff", tags: ["游戏", "英语"], growthViews7d: "+1742万", growthPct7d: "+289.4%", totalViews: "8831万", likes: "554万", publishedAt: "7天前", duration: "02:48" },
  { id: 7, thumbnail: "🎬", thumbnailBg: "#c62828", title: "如何一个人做一家公司｜一人创业全流程", channel: "创业日记", channelAvatar: "📊", channelAvatarBg: "#e53935", tags: ["知识", "中文"], growthViews7d: "+1638万", growthPct7d: "+956.8%", totalViews: "1804万", likes: "73万", publishedAt: "5天前", duration: "32:15" },
  { id: 8, thumbnail: "🌏", thumbnailBg: "#00838f", title: "Solo Travel Japan — 2 Weeks in Tokyo on a Budget", channel: "Wanderlust Wendy", channelAvatar: "✈️", channelAvatarBg: "#00838f", tags: ["旅游", "英语"], growthViews7d: "+1421万", growthPct7d: "+412.6%", totalViews: "1895万", likes: "68万", publishedAt: "6天前", duration: "24:33" },
  { id: 9, thumbnail: "💪", thumbnailBg: "#e53935", title: "30天减脂挑战完结 — 真实对比", channel: "健康达人", channelAvatar: "💪", channelAvatarBg: "#e53935", tags: ["生活", "中文"], growthViews7d: "+1203万", growthPct7d: "+291.1%", totalViews: "1540万", likes: "61万", publishedAt: "7天前", duration: "19:28" },
  { id: 10, thumbnail: "🎙️", thumbnailBg: "#4527a0", title: "Podcast: 做 YouTube 两年 — 踩坑与收入复盘", channel: "海外创作者", channelAvatar: "🎙️", channelAvatarBg: "#4527a0", tags: ["知识", "中文"], growthViews7d: "+987万", growthPct7d: "+169.7%", totalViews: "1122万", likes: "44万", publishedAt: "4天前", duration: "56:02" },
  { id: 11, thumbnail: "📱", thumbnailBg: "#0277bd", title: "iPhone 17 Pro Review — Worth the Upgrade?", channel: "MKBHD", channelAvatar: "📱", channelAvatarBg: "#0277bd", tags: ["科技", "英语", "美国"], growthViews7d: "+891万", growthPct7d: "+234.5%", totalViews: "1204万", likes: "52万", publishedAt: "5天前", duration: "14:18" },
  { id: 12, thumbnail: "🐱", thumbnailBg: "#ff8f00", title: "猫咪第一次见到狗狗的反应竟然是...", channel: "宠物日常", channelAvatar: "🐱", channelAvatarBg: "#ff8f00", tags: ["生活", "中文"], growthViews7d: "+754万", growthPct7d: "+318.9%", totalViews: "892万", likes: "38万", publishedAt: "3天前", duration: "08:44" },
];

export const videos30d: TrendingVideo[] = [
  { id: 1, thumbnail: "🎮", thumbnailBg: "#6c63ff", title: "GTA VI — Official Gameplay Trailer (4K)", channel: "Rockstar Games", channelAvatar: "🎮", channelAvatarBg: "#6c63ff", tags: ["游戏", "英语"], growthViews7d: "+8.2亿", growthPct7d: "+1893.5%", totalViews: "8831万", likes: "554万", publishedAt: "25天前", duration: "02:48" },
  { id: 2, thumbnail: "🎯", thumbnailBg: "#1db954", title: "I Built 100 Businesses In 100 Days", channel: "MrBeast", channelAvatar: "🐶", channelAvatarBg: "#1db954", tags: ["生活", "美国", "英语"], growthViews7d: "+1.2亿", growthPct7d: "+2140.7%", totalViews: "1.3亿", likes: "612万", publishedAt: "28天前", duration: "21:34" },
  { id: 3, thumbnail: "🎵", thumbnailBg: "#7b1fa2", title: "APT. - ROSE & Bruno Mars (Official M/V)", channel: "ROSE", channelAvatar: "🌹", channelAvatarBg: "#e91e63", tags: ["音乐", "韩语"], growthViews7d: "+9804万", growthPct7d: "+1654.2%", totalViews: "1.1亿", likes: "789万", publishedAt: "22天前", duration: "03:20" },
  { id: 4, thumbnail: "🤖", thumbnailBg: "#0288d1", title: "OpenAI发布o3 — 比你更聪明的AI来了", channel: "科技前沿", channelAvatar: "🤖", channelAvatarBg: "#0288d1", tags: ["科技", "中文"], growthViews7d: "+6721万", growthPct7d: "+2834.6%", totalViews: "7204万", likes: "241万", publishedAt: "20天前", duration: "15:42" },
  { id: 5, thumbnail: "⚽", thumbnailBg: "#388e3c", title: "Champions League Final 2025 — Full Highlights", channel: "UEFA", channelAvatar: "⚽", channelAvatarBg: "#1565c0", tags: ["体育", "英语"], growthViews7d: "+5841万", growthPct7d: "+742.1%", totalViews: "6934万", likes: "421万", publishedAt: "18天前", duration: "08:52" },
  { id: 6, thumbnail: "💡", thumbnailBg: "#e53935", title: "如何一个人做一家公司｜一人创业全流程", channel: "创业日记", channelAvatar: "📊", channelAvatarBg: "#e53935", tags: ["知识", "中文"], growthViews7d: "+4920万", growthPct7d: "+2891.3%", totalViews: "5304万", likes: "198万", publishedAt: "15天前", duration: "32:15" },
  { id: 7, thumbnail: "🍜", thumbnailBg: "#f57c00", title: "맛있는 라멘 만들기 — 집에서 완벽한 일본 라멘", channel: "쿠킹하루", channelAvatar: "🍜", channelAvatarBg: "#f57c00", tags: ["美食", "韩语"], growthViews7d: "+4201万", growthPct7d: "+892.4%", totalViews: "5017万", likes: "211万", publishedAt: "12天前", duration: "18:07" },
  { id: 8, thumbnail: "📱", thumbnailBg: "#0277bd", title: "iPhone 17 Pro Review — Worth the Upgrade?", channel: "MKBHD", channelAvatar: "📱", channelAvatarBg: "#0277bd", tags: ["科技", "英语", "美国"], growthViews7d: "+3872万", growthPct7d: "+1023.7%", totalViews: "4541万", likes: "178万", publishedAt: "14天前", duration: "14:18" },
  { id: 9, thumbnail: "🌏", thumbnailBg: "#00838f", title: "Solo Travel Japan — 2 Weeks in Tokyo on a Budget", channel: "Wanderlust Wendy", channelAvatar: "✈️", channelAvatarBg: "#00838f", tags: ["旅游", "英语"], growthViews7d: "+3214万", growthPct7d: "#934.8%", totalViews: "4023万", likes: "154万", publishedAt: "19天前", duration: "24:33" },
  { id: 10, thumbnail: "💪", thumbnailBg: "#c62828", title: "30天减脂挑战完结 — 真实对比", channel: "健康达人", channelAvatar: "💪", channelAvatarBg: "#c62828", tags: ["生活", "中文"], growthViews7d: "+2891万", growthPct7d: "+698.2%", totalViews: "3476万", likes: "139万", publishedAt: "21天前", duration: "19:28" },
];

export interface RisingChannel {
  id: number;
  avatar: string;
  avatarBg: string;
  avatarIsText: boolean;
  name: string;
  growthCount: string;
  growthPct: string;
  hasViral: boolean;
  categories: string[];
  desc: string;
  subs: string;
  videosPerMonth: number;
  country: string;
  language: string;
}

export const risingChannels: RisingChannel[] = [
  { id: 1, avatar: "김", avatarBg: "#1a1a2e", avatarIsText: true, name: "랭킹김", growthCount: "+6.5万/7日", growthPct: "+537.5%", hasViral: true, categories: ["娱乐"], desc: "\"이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.\" 전세계 랭킹을 단 하루만에 🙂✅ 가장 흥미롭고 임팩트 있는 순간들을 모아 독창적인 랭킹 형식으로 재해석합니다", subs: "7.7万", videosPerMonth: 15, country: "韩国", language: "韩语" },
  { id: 2, avatar: "E", avatarBg: "#1565c0", avatarIsText: true, name: "Expert of How", growthCount: "+3.0万/7日", growthPct: "+956.8%", hasViral: false, categories: ["科技"], desc: "I use 3D animation to create interesting and visually clear explanations of how things work. Here, you'll see how machines, tools, and mechanisms operate behind the scenes—shown in simple, high-quality visuals. Thanks for visiting my channel! If you have an idea for something you'd like to see animated, feel free to comment on my latest video.", subs: "3.4万", videosPerMonth: 2, country: "印度", language: "英语" },
  { id: 3, avatar: "彩", avatarBg: "#e91e63", avatarIsText: true, name: "彩彩麻麻呀", growthCount: "+2.4万/7日", growthPct: "+291.1%", hasViral: true, categories: ["爱好"], desc: "📣欢迎进进【彩彩麻麻呀】宝妈实用分享频道❤️！这里没有复杂套路，不搞虚假宣传，主打宝宝早教益智智玩具，带娃好物分享，宝宝穿搭日常，全是接地气、高实用的宝妈干货，替各位宝妈省时、省力、更省钱🙌！不管你是新手宝妈、待产妈妈、还是想给宝宝选玩具、国好物、搭衣服的家长，都能在这里找到参考。", subs: "3.3万", videosPerMonth: 36, country: "香港", language: "中文(繁体)" },
  { id: 4, avatar: "M", avatarBg: "#7b1fa2", avatarIsText: true, name: "Mi Mi Magic", growthCount: "+3.3万/7日", growthPct: "+169.7%", hasViral: true, categories: ["爱好"], desc: "Welcome to our happy corner of fun and creativity! 🎉🌈 Here you'll find exciting games, colorful crafts, and endless laughter that brightens every day! 🌟💕 We love sharing joyful moments, silly challenges, and magical surprises that spark imagination and smiles. 😊 If you love to play, learn, and explore new adventures, subscribe and join our cheerful family!", subs: "5.3万", videosPerMonth: 15, country: "美国", language: "英语" },
  { id: 5, avatar: "🎵", avatarBg: "#00897b", avatarIsText: false, name: "Chill Beats Studio", growthCount: "+1.9万/7日", growthPct: "+412.3%", hasViral: false, categories: ["音乐"], desc: "Lofi hip hop, study beats, and chill music to help you focus and relax. New mixes every week. Perfect for studying, working, or just unwinding after a long day. Subscribe to never miss a beat!", subs: "2.1万", videosPerMonth: 8, country: "美国", language: "英语" },
  { id: 6, avatar: "游", avatarBg: "#6c63ff", avatarIsText: true, name: "游戏达人小明", growthCount: "+2.1万/7日", growthPct: "+338.5%", hasViral: true, categories: ["游戏"], desc: "专注于主机和PC游戏攻略、评测与实况。每周更新最新游戏内容，帮助你快速通关、了解游戏机制。订阅频道，和我一起探索游戏世界！", subs: "4.8万", videosPerMonth: 22, country: "中国大陆", language: "中文(简体)" },
  { id: 7, avatar: "🌿", avatarBg: "#2e7d32", avatarIsText: false, name: "Green Life Daily", growthCount: "+1.6万/7日", growthPct: "+284.9%", hasViral: false, categories: ["生活", "知识"], desc: "Sustainable living tips, zero-waste lifestyle, and eco-friendly DIY projects. Join our growing community of people who care about the planet and want to make a difference one small step at a time.", subs: "3.8万", videosPerMonth: 10, country: "英国", language: "英语" },
  { id: 8, avatar: "食", avatarBg: "#f57c00", avatarIsText: true, name: "食在好吃", growthCount: "+1.4万/7日", growthPct: "+196.4%", hasViral: true, categories: ["美食"], desc: "分享最正宗的家常菜、粤菜、川菜食谱，还有街头小吃探店。用最简单的食材做出最美味的料理，每周三更新，周末有探店特辑。让做饭变成一件快乐的事！", subs: "6.2万", videosPerMonth: 18, country: "香港", language: "中文(繁体)" },
  { id: 9, avatar: "T", avatarBg: "#c62828", avatarIsText: true, name: "Tech Simplified", growthCount: "+1.2万/7日", growthPct: "+453.8%", hasViral: false, categories: ["科技", "教育"], desc: "Making technology easy to understand for everyone. From smartphone tips to AI tools and productivity hacks, I break down complex tech concepts into simple, actionable guides you can use today.", subs: "1.9万", videosPerMonth: 6, country: "印度", language: "英语" },
  { id: 10, avatar: "🐾", avatarBg: "#ff8f00", avatarIsText: false, name: "萌宠日记本", growthCount: "+1.1万/7日", growthPct: "+167.2%", hasViral: true, categories: ["宠物", "生活"], desc: "记录猫咪和狗狗的日常生活，有搞笑的、有感人的，每一条都是真实发生的故事。养宠经验分享，帮助你成为更好的铲屎官～", subs: "4.1万", videosPerMonth: 28, country: "中国大陆", language: "中文(简体)" },
  { id: 11, avatar: "V", avatarBg: "#00838f", avatarIsText: true, name: "Voyage Libre", growthCount: "+0.9万/7日", growthPct: "+211.6%", hasViral: false, categories: ["旅游"], desc: "Des aventures en solo à travers le monde avec un budget limité. Asie, Europe, Amérique du Sud — je partage mes itinéraires, conseils pratiques et moments authentiques loin des sentiers battus.", subs: "2.7万", videosPerMonth: 5, country: "法国", language: "法语" },
  { id: 12, avatar: "運", avatarBg: "#1565c0", avatarIsText: true, name: "運動革命", growthCount: "+0.8万/7日", growthPct: "+189.3%", hasViral: false, categories: ["体育", "知识"], desc: "專業健身教練帶你科學減脂、增肌！提供居家訓練和健身房訓練計劃，還有運動營養知識分享。不管你是新手還是進階者，這裡都有適合你的內容。", subs: "5.8万", videosPerMonth: 12, country: "台湾", language: "中文(繁体)" },
];
