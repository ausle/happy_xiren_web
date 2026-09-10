export type RaffleResponse<T> = {
  code: string;
  info?: string;
  data?: T;
};

export type RaffleAward = {
  awardId: number;
  awardTitle: string;
  awardSubtitle?: string | null;
  sort: number;
  awardRuleLockCount?: number | null;
  isAwardUnlock?: boolean;
  waitUnLockCount?: number;
};

export type ActivityAccount = {
  totalCount?: number;
  totalCountSurplus?: number;
  dayCount?: number;
  dayCountSurplus?: number;
  monthCount?: number;
  monthCountSurplus?: number;
};

export type DrawResult = {
  awardId: number;
  awardTitle: string;
  awardIndex: number;
};

const raffleApiBaseUrl = (import.meta.env.VITE_RAFFLE_API_BASE_URL ?? "http://localhost:8091").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${raffleApiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  let payload: RaffleResponse<T>;
  try {
    payload = (await response.json()) as RaffleResponse<T>;
  } catch {
    throw new Error(`抽奖服务返回了无法解析的响应（HTTP ${response.status}）`);
  }

  if (!response.ok) {
    throw new Error(payload.info || `抽奖服务请求失败（HTTP ${response.status}）`);
  }

  return payload;
}

function jsonBody(userId: string, activityId: number) {
  return JSON.stringify({ userId, activityId });
}

export function armoryActivity(activityId: number) {
  return request<boolean>(`/api/v1/raffle/activity/armory?activityId=${encodeURIComponent(activityId)}`, {
    method: "GET",
  });
}

export function fetchRaffleAwards(userId: string, activityId: number) {
  return request<RaffleAward[]>("/api/v1/raffle/strategy/query_raffle_award_list", {
    method: "POST",
    body: jsonBody(userId, activityId),
  });
}

export function drawRaffle(userId: string, activityId: number) {
  return request<DrawResult>("/api/v1/raffle/activity/draw", {
    method: "POST",
    body: jsonBody(userId, activityId),
  });
}

export function fetchActivityAccount(userId: string, activityId: number) {
  const params = new URLSearchParams({ userId, activityId: String(activityId) });
  return request<ActivityAccount>(`/api/v1/raffle/activity/query_user_activity_account?${params.toString()}`, {
    method: "POST",
  });
}

export function fetchSignInStatus(userId: string) {
  return request<boolean>(`/api/v1/raffle/activity/is_calendar_sign_rebate?userId=${encodeURIComponent(userId)}`, {
    method: "POST",
  });
}

export function signIn(userId: string) {
  return request<boolean>(`/api/v1/raffle/activity/calendar_sign_rebate?userId=${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
