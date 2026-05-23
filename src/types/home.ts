export interface HomeCategory {
  categoryId: number;
  category: string;
  rank?: number;
  status?: number;
  selected?: boolean;
}

export interface HomeTag {
  tagId: number;
  tag: string;
  status?: number | null;
  selected?: boolean | null;
}

export interface HomeArticleCount {
  praiseCount?: number;
  readCount?: number;
  collectionCount?: number;
  commentCount?: number;
}

export interface HomeArticle {
  articleId: number;
  articleType?: number;
  author?: number;
  authorName: string;
  authorAvatar?: string;
  title: string;
  shortTitle?: string;
  urlSlug?: string;
  summary?: string;
  cover?: string;
  content?: string | null;
  sourceType?: string;
  sourceUrl?: string;
  status?: number;
  readType?: number;
  canRead?: boolean | null;
  officalStat?: number;
  toppingStat?: number;
  creamStat?: number;
  createTime?: number;
  lastUpdateTime?: number;
  category?: HomeCategory | null;
  tags?: HomeTag[];
  praised?: boolean | null;
  commented?: boolean | null;
  collected?: boolean | null;
  count?: HomeArticleCount | null;
  payAmount?: string;
  payWay?: string | null;
}

export interface HomePageList<T> {
  list: T[];
  hasMore: boolean;
}

export interface SideBarVisit {
  visit?: number;
  download?: number;
  rate?: string;
}

export interface SideBarItem {
  title?: string | null;
  name?: string | null;
  url?: string | null;
  img?: string | null;
  time?: number | null;
  tags?: number[] | null;
  visit?: SideBarVisit | null;
}

export interface SideBarSection {
  title: string;
  subTitle?: string | null;
  icon?: string | null;
  img?: string | null;
  url?: string | null;
  content?: string | null;
  items: SideBarItem[];
  style?: number | null;
}

export interface HomeCarouselItem {
  name: string;
  imgUrl: string;
  actionUrl: string;
}

export interface HomeIndexResponse {
  categories: HomeCategory[];
  currentCategory: string;
  categoryId: number;
  topArticles: HomeArticle[];
  articles: HomePageList<HomeArticle>;
  user?: unknown;
  sideBarItems: SideBarSection[];
  homeCarouselList?: HomeCarouselItem[];
}

export interface CategoryArticleListResponse {
  archives: string;
  archiveId: number;
  articles: HomePageList<HomeArticle>;
  pageNum: number;
  pageSize: number;
  pageTotal: number;
  total: number;
}
