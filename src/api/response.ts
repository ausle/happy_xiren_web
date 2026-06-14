import axios from "axios";

export type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};

export function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return !!payload && typeof payload === "object" && "code" in payload && "message" in payload;
}

export function unwrapApiResponse<T>(payload: ApiResponse<T> | T) {
  if (!isApiResponse<T>(payload)) {
    return payload as T;
  }

  if (payload.code !== 0) {
    throw new Error(payload.message || "请求失败");
  }

  return payload.data;
}

export function parseAndUnwrapApiResponse<T>(payload: string | ApiResponse<T> | T) {
  const normalized = typeof payload === "string" ? (JSON.parse(payload) as ApiResponse<T> | T) : payload;
  return unwrapApiResponse(normalized);
}

export function extractApiErrorMessage(error: unknown, fallback = "请求失败，请稍后重试") {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;
    if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
      return payload.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
