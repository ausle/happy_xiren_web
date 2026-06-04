import http from "@/api/http";
import { type ApiResponse, extractApiErrorMessage, unwrapApiResponse } from "@/api/response";
import type { HomeCategory, HomeTag } from "@/types/home";

type PageResponse<T> = {
  list: T[];
  pageSize: number;
  pageNum: number;
  pageTotal: number;
  total: number;
};

type ImageUploadResult = {
  imagePath?: string;
};

export type PublishActionType = "post" | "save";

export interface PublishArticlePayload {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
  summary: string;
  cover: string;
  readType: number;
  actionType: PublishActionType;
}

export interface PublishArticleResult {
  articleId: number;
  urlSlug?: string | null;
}

const ARTICLE_EDIT_PATH = "/article/edit";

export { extractApiErrorMessage };

export async function fetchWriteCategories() {
  const { data } = await http.get<ApiResponse<HomeCategory[]>>("/article/api/category/list", {
    params: { ignoreNoArticles: true },
  });

  return unwrapApiResponse(data).filter((item) => item.categoryId > 0);
}

export async function searchWriteTags(keyword = "") {
  const { data } = await http.get<ApiResponse<PageResponse<HomeTag>>>("/article/api/tag/list", {
    params: {
      key: keyword.trim() || undefined,
      pageNumber: 1,
      pageSize: 10,
    },
  });

  return unwrapApiResponse(data).list ?? [];
}

export async function generateArticleSummary(content: string) {
  const { data } = await http.post<ApiResponse<string>>("/article/api/generateSummary", {
    content,
  });

  return unwrapApiResponse(data);
}

export async function uploadArticleCover(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await http.post<ApiResponse<ImageUploadResult>>("/image/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const result = unwrapApiResponse(data);
  if (!result.imagePath) {
    throw new Error("封面上传失败");
  }

  return result.imagePath;
}

export async function saveRemoteArticleImage(imgUrl: string) {
  const { data } = await http.get<ApiResponse<ImageUploadResult>>("/image/save", {
    params: {
      img: imgUrl,
    },
  });

  const result = unwrapApiResponse(data);
  if (!result.imagePath) {
    throw new Error("图片转存失败");
  }

  return result.imagePath;
}

export async function submitArticle(payload: PublishArticlePayload) {
  const { data } = await http.post<ApiResponse<PublishArticleResult>>("/article/api/post", {
    title: payload.title,
    shortTitle: payload.title.slice(0, 40),
    categoryId: payload.categoryId,
    tagIds: payload.tagIds,
    summary: payload.summary,
    content: payload.content,
    cover: payload.cover || undefined,
    articleType: "BLOG",
    source: 2,
    actionType: payload.actionType,
    readType: payload.readType,
  });

  return unwrapApiResponse(data);
}

export async function ensureArticleEditorReady(origin: string) {
  const requestUrl = new URL(ARTICLE_EDIT_PATH, origin).toString();
  const response = await http.get<string>(requestUrl, {
    withCredentials: true,
    headers: {
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const responseUrl = response.request?.responseURL;
  if (typeof responseUrl === "string") {
    const finalPath = new URL(responseUrl).pathname;
    if (!finalPath.startsWith(ARTICLE_EDIT_PATH)) {
      throw new Error("登录状态已失效，请重新登录后再写文章");
    }
  }
}
