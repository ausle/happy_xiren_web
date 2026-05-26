import http from "@/api/http";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";
import type { HomeTag } from "@/types/home";

type PageResponse<T> = {
  list: T[];
  pageSize: number;
  pageNum: number;
  pageTotal: number;
  total: number;
};

export type SearchTabType = "" | "post" | "picture" | "user";

export interface SearchUserItem {
  id?: number;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
  createTime?: string;
}

export interface SearchArticleItem {
  id?: number;
  title?: string;
  shortTitle?: string;
  summary?: string;
  cover?: string;
  urlSlug?: string;
  content?: string;
  thumbNum?: number;
  favourNum?: number;
  readNum?: number;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  tagList?: string[];
  user?: SearchUserItem;
  hasThumb?: boolean;
  hasFavour?: boolean;
}

export interface SearchPictureItem {
  title?: string;
  url?: string;
  description?: string;
}

export interface SearchResult {
  userList?: SearchUserItem[];
  postList?: SearchArticleItem[];
  pictureList?: SearchPictureItem[];
  dataList?: unknown[];
  total?: number;
}

export interface SearchRequestPayload {
  searchText: string;
  type: SearchTabType;
  pageNum: number;
  pageSize: number;
  tags?: string[];
}

export async function fetchSearchTagsPage(keyword = "", pageNumber = 1, pageSize = 10) {
  const { data } = await http.get<ApiResponse<PageResponse<HomeTag>>>("/article/tag/list", {
    params: {
      key: keyword.trim() || undefined,
      pageNumber,
      pageSize,
    },
  });

  return unwrapApiResponse(data);
}

export async function searchAll(payload: SearchRequestPayload) {
  const { data } = await http.post<ApiResponse<SearchResult>>("/article/all", payload);
  return unwrapApiResponse(data);
}
