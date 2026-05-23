import http from "@/api/http";

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

interface SearchResponse<T> {
  result: T;
}

export interface SearchRequestPayload {
  searchText: string;
  type: SearchTabType;
  pageNum: number;
  pageSize: number;
}

export async function searchAll(payload: SearchRequestPayload) {
  const { data } = await http.post<SearchResponse<SearchResult>>("/article/all", payload);
  return data.result;
}
