import http from "@/api/http";
import { type ApiResponse, unwrapApiResponse } from "@/api/response";

export type InterfaceInfo = {
  id?: number;
  name: string;
  description?: string;
  url: string;
  requestParams?: string;
  requestHeader?: string;
  responseHeader?: string;
  status?: number;
  method: string;
  userId?: number;
  createTime?: string;
  updateTime?: string;
};

export type InterfaceInfoPageQuery = {
  current: number;
  pageSize: number;
  name?: string;
  description?: string;
  status?: number;
  sortField?: string;
  sortOrder?: "ascend" | "descend";
};

export type MyBatisPageResponse<T> = {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
};

export async function fetchOnlineInterfaces(params: InterfaceInfoPageQuery) {
  const { data } = await http.get<ApiResponse<MyBatisPageResponse<InterfaceInfo>>>("/interfaceInfo/list/page", {
    params: {
      ...params,
      status: 1,
      sortField: params.sortField ?? "createTime",
      sortOrder: params.sortOrder ?? "descend",
    },
  });

  return unwrapApiResponse(data);
}

export async function fetchInterfaceDetail(id: number) {
  const { data } = await http.get<ApiResponse<InterfaceInfo>>("/interfaceInfo/get", {
    params: { id },
  });

  return unwrapApiResponse(data);
}

export async function invokeInterface(id: number, userRequestParams: string) {
  const { data } = await http.post<ApiResponse<unknown>>("/interfaceInfo/invoke", {
    id,
    userRequestParams,
  });

  return unwrapApiResponse(data);
}
