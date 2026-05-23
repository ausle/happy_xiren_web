import http from "@/api/http";
import type { CategoryArticleListResponse, HomeIndexResponse } from "@/types/home";

const categoryArticleCache = new Map<string, CategoryArticleListResponse>();
const categoryArticleRequestCache = new Map<string, Promise<CategoryArticleListResponse>>();

export async function fetchHomeIndex(category?: string) {
  const { data } = await http.get<HomeIndexResponse>("/", {
    params: category ? { category } : undefined,
  });

  return data;
}

export async function fetchCategoryArticles(category: string, page = 1, size = 12) {
  const cacheKey = buildCategoryArticleCacheKey(category, page, size);
  const cachedData = categoryArticleCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const pendingRequest = categoryArticleRequestCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = http
    .get<CategoryArticleListResponse>(`/article/category/${encodeURIComponent(category)}`, {
      params: { page, size },
    })
    .then(({ data }) => {
      categoryArticleCache.set(cacheKey, data);
      return data;
    })
    .finally(() => {
      categoryArticleRequestCache.delete(cacheKey);
    });

  categoryArticleRequestCache.set(cacheKey, request);
  return request;
}

function buildCategoryArticleCacheKey(category: string, page: number, size: number) {
  return `${category}::${page}::${size}`;
}
