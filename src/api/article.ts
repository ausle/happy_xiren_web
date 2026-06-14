import http from "@/api/http";
import { parseAndUnwrapApiResponse, type ApiResponse, unwrapApiResponse } from "@/api/response";
import type { HomeArticle, SideBarSection } from "@/types/home";

export const ARTICLE_FAVOR_TYPE = {
  PRAISE: 2,
  COLLECTION: 3,
  CANCEL_PRAISE: 4,
  CANCEL_COLLECTION: 5,
} as const;

export type ArticleFavorType = (typeof ARTICLE_FAVOR_TYPE)[keyof typeof ARTICLE_FAVOR_TYPE];

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

export async function fetchArticleDetail(articleId: number, urlSlug?: string) {
  const detailPath = urlSlug?.trim()
    ? `/article/detail/${articleId}/${encodeURIComponent(urlSlug.trim())}`
    : `/article/detail/${articleId}`;

  const { data } = await http.get<string | ArticleDetailResponse>(detailPath, {
    transformResponse: [(value) => value],
  });

  return parseAndUnwrapApiResponse<ArticleDetailResponse>(data);
}

export async function favorArticle(articleId: number, type: ArticleFavorType) {
  const { data } = await http.get<ApiResponse<boolean> | boolean>("/article/favor", {
    params: { articleId, type },
  });

  return unwrapApiResponse(data);
}
