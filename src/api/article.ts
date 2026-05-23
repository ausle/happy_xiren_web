import http from "@/api/http";
import type { HomeArticle, SideBarSection } from "@/types/home";

export interface ArticleDetailComment {
  commentId?: number;
  userId?: number;
  userName?: string;
  userPhoto?: string;
  commentTime?: number;
  commentTimeStr?: string;
  commentContent?: string;
  praiseCount?: number;
  praised?: boolean | null;
}

export interface ArticleDetailAuthor {
  userId?: number;
  userName?: string;
  photo?: string;
  joinDayCount?: number;
  articleCount?: number;
  praiseCount?: number;
  collectionCount?: number;
  fansCount?: number;
}

export interface ArticleDetailResponse {
  article: HomeArticle | null;
  comments?: ArticleDetailComment[];
  author?: ArticleDetailAuthor | null;
  sideBarItems?: SideBarSection[];
}

function parseArticleDetailResponse(data: ArticleDetailResponse | string) {
  if (typeof data === "string") {
    return JSON.parse(data) as ArticleDetailResponse;
  }

  return data;
}

export async function fetchArticleDetail(articleId: number, urlSlug?: string) {
  const detailPath = urlSlug?.trim()
    ? `/article/detail/${articleId}/${encodeURIComponent(urlSlug.trim())}`
    : `/article/detail/${articleId}`;

  const { data } = await http.get<ArticleDetailResponse | string>(detailPath, {
    transformResponse: [(value) => value],
  });

  return parseArticleDetailResponse(data);
}
