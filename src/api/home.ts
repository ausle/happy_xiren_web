import http from "@/api/http";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";
import type { CategoryArticleListResponse, HomeIndexResponse } from "@/types/home";

const categoryArticleRequestCache = new Map<string, Promise<CategoryArticleListResponse>>();

export async function fetchHomeIndex(category?: string) {
  const { data } = await http.get<ApiResponse<HomeIndexResponse> | HomeIndexResponse>("/", {
    params: category ? { category } : undefined,
  });

  return unwrapApiResponse(data);
}

export async function fetchCategoryArticles(category: string, page = 1, size = 12) {
  const cacheKey = buildCategoryArticleCacheKey(category, page, size);
  const pendingRequest = categoryArticleRequestCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = http
    .get<ApiResponse<CategoryArticleListResponse> | CategoryArticleListResponse>(
      `/article/category/${encodeURIComponent(category)}`,
      {
        params: { page, size },
      },
    )
    .then(({ data }) => unwrapApiResponse(data))
    .finally(() => {
      categoryArticleRequestCache.delete(cacheKey);
    });

  categoryArticleRequestCache.set(cacheKey, request);
  return request;
}

function buildCategoryArticleCacheKey(category: string, page: number, size: number) {
  return `${category}::${page}::${size}`;
}
