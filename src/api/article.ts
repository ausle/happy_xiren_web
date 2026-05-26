import http from "@/api/http";
import { parseAndUnwrapApiResponse } from "@/api/response";
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

export async function fetchArticleDetail(articleId: number, urlSlug?: string) {
  const detailPath = urlSlug?.trim()
    ? `/article/detail/${articleId}/${encodeURIComponent(urlSlug.trim())}`
    : `/article/detail/${articleId}`;

  const { data } = await http.get<string | ArticleDetailResponse>(detailPath, {
    transformResponse: [(value) => value],
  });

  return parseAndUnwrapApiResponse<ArticleDetailResponse>(data);
}
