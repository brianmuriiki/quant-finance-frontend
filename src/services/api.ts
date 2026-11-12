/**
 * QuantStorm Researcher API client. Application data is loaded from the API;
 * failed requests are surfaced to the screen instead of replaced with demo data.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string) {
  accessToken = token;
}

export function clearToken() {
  accessToken = null;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        const token = res.ok ? json?.data?.accessToken : null;
        if (token) setToken(token);
        else clearToken();
        return token || null;
      })
      .catch(() => { clearToken(); return null; })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(typeof FormData !== "undefined" && options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers,
  };
  let res = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
  const refreshableAuthEndpoint = endpoint === "/auth/me" || endpoint === "/auth/sessions" || endpoint.startsWith("/auth/sessions/");
  if (res.status === 401 && (!endpoint.startsWith("/auth/") || refreshableAuthEndpoint)) {
    token = await refreshAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestOptions, headers });
    }
  }
  const json = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error?.message || json?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return (json?.data !== undefined ? json.data : json) as T;
}

export const api = {
  auth: {
    async providers() {
      return request<{ google: boolean }>("/auth/providers");
    },
    async me() {
      return request<{ user: any; quota: { submittedToday: number; target: number } }>("/auth/me");
    },
    async login(email: string, pass: string) {
      const res = await request<{ accessToken?: string; token?: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
      const t = res?.accessToken || res?.token;
      if (t) setToken(t);
      return res;
    },
    async register(name: string, email: string, pass: string, timezone?: string, referralCode?: string) {
      const res = await request<{ accessToken?: string; token?: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password: pass, timezone, referralCode }),
      });
      const t = res?.accessToken || res?.token;
      if (t) setToken(t);
      return res;
    },
    async logout() {
      try { await request("/auth/logout", { method: "POST" }); }
      finally { clearToken(); }
    },
    async ensureSession() {
      if (!getToken() && !(await refreshAccessToken())) throw new Error("Not signed in");
      return this.me();
    },
    async startGoogleOAuth(referralCode?: string) {
      const query = referralCode ? `?referralCode=${encodeURIComponent(referralCode)}` : "";
      window.location.assign(`${API_BASE_URL}/auth/oauth/google${query}`);
    },
    async sessions() {
      return request<any[]>("/auth/sessions");
    },
    async revokeSession(id: string) {
      return request(`/auth/sessions/${id}`, { method: "DELETE" });
    },
    async revokeOtherSessions() {
      return request("/auth/sessions", { method: "DELETE" });
    },
    async forgotPassword(email: string) {
      return request<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    },
    async resetPassword(token: string, password: string) {
      return request<{ ok: boolean }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
    },
    async verifyEmail(token: string) {
      return request<{ ok: boolean }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
    },
    async resendVerification() {
      return request<{ ok: boolean; alreadyVerified?: boolean }>("/auth/resend-verification", { method: "POST" });
    },
    async acceptInvite(token: string, name: string, password: string, timezone?: string) {
      const res = await request<{ accessToken?: string; token?: string; user: any }>("/auth/accept-invite", {
        method: "POST",
        body: JSON.stringify({ token, name, password, timezone }),
      });
      const access = res?.accessToken || res?.token;
      if (access) setToken(access);
      return res;
    },
  },

  users: {
    async getProfile() {
      return request<any>("/users/me");
    },
    async updateProfile(patch: Record<string, any>) {
      return request<any>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
  },

  alphas: {
    async list(params: { region?: string; status?: string; minSharpe?: string } = {}) {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await request<any[] | { items: any[]; total: number }>(`/alphas?${query}`);
      if (Array.isArray(res)) return { items: res, total: res.length };
      return res;
    },
    async create(alpha: Record<string, any>) {
      return request<any>("/alphas", {
        method: "POST",
        body: JSON.stringify(alpha),
      });
    },
    async update(id: string, patch: Record<string, any>) {
      return request<any>(`/alphas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    async submit(alphaId: string) {
      return request<{ status: string; dailySubmittedCount: number }>(`/alphas/${alphaId}/submit`, {
        method: "POST",
      });
    },
    async delete(id: string) {
      return request<{ deleted: boolean }>(`/alphas/${id}`, {
        method: "DELETE",
      });
    },
    async bulk(ids: string[], action: "submit" | "archive" | "delete") {
      return request<{ count: number }>("/alphas/bulk", {
        method: "POST",
        body: JSON.stringify({ ids, action }),
      });
    },
    async checkFields(expression: string, region = "USA") {
      return request<{ detected: string[]; overlap?: any }>("/alphas/check-fields", {
        method: "POST",
        body: JSON.stringify({ expression, region }),
      });
    },
  },

  datafields: {
    async list(region = "USA") {
      return request<any[]>(`/datafields?region=${encodeURIComponent(region)}`);
    },
    async fresh(region = "USA") {
      return request<{ untouchedDatasets: any[]; partiallyUsed: any[] }>(`/datafields/fresh?region=${encodeURIComponent(region)}`);
    },
    async extract(rawText: string, dataset?: string, region = "USA") {
      return request<{ fields: any[]; datasets: string[]; total?: number }>("/datafields/extract", {
        method: "POST",
        body: JSON.stringify({ text: rawText, dataset, region }),
      });
    },
    async extractAi(text: string, dataset?: string, region = "USA") {
      return request<{ fields: any[]; rejected?: any[] }>("/datafields/import/ai", {
        method: "POST",
        body: JSON.stringify({ text, dataset, region }),
      });
    },
    async upload(file: File, region = "USA") {
      const body = new FormData();
      body.append("file", file);
      body.append("region", region);
      return request<any>("/datafields/upload", { method: "POST", body });
    },
    async commit(region: string, fields: Array<{ fieldId: string; dataset?: string; description?: string }>) {
      return request<{ added: number; skippedExisting: number; datasets: number }>("/datafields/commit", {
        method: "POST",
        body: JSON.stringify({ region, fields }),
      });
    },
    async toggleUsed(id: string, used: boolean) {
      return request<any>(`/datafields/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ used }),
      });
    },
  },

  journey: {
    async overview() {
      return request<any>("/journey");
    },
    async methodology() {
      return request<any>("/journey/methodology");
    },
    async pyramid(params: { region?: string; status?: string } = {}) {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<any>(`/journey/pyramid?${q}`);
    },
    async timeline() {
      return request<any[]>("/journey/timeline");
    },
    async objectives() { return request<{ objectives: any[]; activities: any[] }>("/journey/objectives"); },
    async achievements() { return request<any[]>("/journey/achievements"); },
    async analytics(range = "30d") { return request<any>(`/journey/analytics?range=${range}`); },
    async cell(region: string, delay: number, category: string) {
      const q = new URLSearchParams({ region, delay: String(delay), category }).toString();
      return request<any>(`/journey/pyramid/cell?${q}`);
    },
    async activities() {
      const result = await request<{ activities: any[] }>("/journey/objectives");
      return result.activities || [];
    },
    async claimActivity(id: string) {
      return request<any>(`/journey/activities/${id}/complete`, { method: "POST" });
    },
    async recommendations() {
      return request<any>("/journey/next-action");
    },
  },

  daily: {
    async getStatus() {
      return request<any>("/daily/status");
    },
  },

  assistant: {
    async chat(message: string, context?: Record<string, any>) {
      return request<{ reply: string; code?: string }>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message, context }),
      });
    },
  },

  finance: {
    async list() {
      const res = await request<any>("/finance/earnings");
      if (Array.isArray(res)) {
        return {
          items: res,
          totalEarnings: res.reduce((acc: number, item: any) => acc + (item.amount || 0), 0),
        };
      }
      return res;
    },
    async addEntry(entry: { date: string; type: string; amount: number; note?: string; description?: string }) {
      return request<any>("/finance/earnings", {
        method: "POST",
        body: JSON.stringify({
          date: entry.date,
          type: entry.type,
          amount: entry.amount,
          note: entry.note || entry.description || "",
        }),
      });
    },
    async deleteEntry(id: string) {
      return request<{ deleted: boolean }>(`/finance/${id}`, {
        method: "DELETE",
      });
    },
    async summary() {
      return request<any>("/finance/summary");
    },
  },

  regions: {
    async list() {
      return request<{ regions: Array<{ code: string; alphaCount: number; datafieldCount: number; datasetCount: number }>; suggested: string[] }>("/regions");
    },
    async add(code: string) {
      return request<any>("/regions", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    async delete(code: string, force = false) {
      return request<any>(`/regions/${code}?force=${force}`, {
        method: "DELETE",
      });
    },
  },

  notifications: {
    async list() {
      return request<any[]>("/notifications");
    },
    async markAllRead() {
      return request<{ ok: boolean }>("/notifications/read-all", {
        method: "POST",
      });
    },
    async markRead(id: string) {
      return request<{ ok: boolean }>(`/notifications/${id}/read`, {
        method: "PATCH",
      });
    },
  },

  push: {
    async publicKey() {
      return request<{ publicKey: string }>("/push/public-key");
    },
    async subscribe(subscription: PushSubscriptionJSON) {
      return request<{ ok: boolean }>("/push/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
      });
    },
    async unsubscribe(endpoint: string) {
      return request<{ ok: boolean }>("/push/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint }),
      });
    },
  },

  guide: {
    async list() {
      return request<any[]>("/guide");
    },
  },

  combos: {
    async list() {
      return request<any[]>("/combos");
    },
  },

  ideas: {
    async getToday() {
      return request<{ batch: any; ideas: any[]; today: string }>("/ideas/today");
    },
    async regenerateToday() {
      return request<{ batch: any; ideas: any[]; today: string }>("/ideas/today/regenerate", {
        method: "POST",
      });
    },
    async swap(id: string) {
      return request<{ batch: any; idea: any; swappedOutId: string }>(`/ideas/${id}/swap`, {
        method: "POST",
      });
    },
    async start(id: string) {
      return request<{ idea: any; prefill: any }>(`/ideas/${id}/start`, {
        method: "POST",
      });
    },
    async update(id: string, patch: { status?: string; dismissReason?: string; feedback?: string | null }) {
      return request<any>(`/ideas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    async list(params: { from?: string; to?: string; status?: string; region?: string; category?: string; outcome?: string; cursor?: string; limit?: number } = {}) {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
      });
      return request<{ data: any[]; items: any[]; total: number; meta: { nextCursor: string | null } }>(`/ideas?${q.toString()}`);
    },
    async getStats() {
      return request<{
        totalGenerated: number;
        totalTried: number;
        totalSubmitted: number;
        totalQualifying: number;
        triedThisWeek: number;
        tryRatePct: number;
        submittedRatePct: number;
        qualifyingRatePct: number;
      }>("/ideas/stats");
    },
    async getSettings() {
      return request<{
        enabled: boolean;
        notifyTime: string;
        regions: string[];
        avoidCategories: string[];
        difficulty: string;
        shareExpressions: boolean;
      }>("/ideas/settings");
    },
    async updateSettings(patch: Record<string, any>) {
      return request<any>("/ideas/settings", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
  },
};
