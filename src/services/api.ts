/**
 * QuantStorm Researcher API Client Layer with Resilient Fallback
 * Connects researcher frontends to the backend server (VITE_API_BASE_URL)
 * or gracefully falls back to local data if the backend is not yet running.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export function getToken(): string | null {
  try {
    return localStorage.getItem("quantstorm_token");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem("quantstorm_token", token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem("quantstorm_token");
  } catch {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      console.warn(`[API] ${endpoint} returned HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    return (json?.data !== undefined ? json.data : json) as T;
  } catch {
    // Offline or connection failure; return null gracefully
    return null;
  }
}

export const api = {
  auth: {
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
    async register(name: string, email: string, pass: string) {
      const res = await request<{ accessToken?: string; token?: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password: pass }),
      });
      const t = res?.accessToken || res?.token;
      if (t) setToken(t);
      return res;
    },
    async logout() {
      await request("/auth/logout", { method: "POST" });
      clearToken();
    },
    async ensureSession() {
      const existing = await this.me();
      if (existing) return existing;
      // Auto-authenticate default researcher session if available
      const loginRes = await this.login("researcher@quantstorm.com", "password123");
      if (loginRes) return this.me();
      return null;
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
        body: JSON.stringify({ rawText, dataset, region }),
      });
    },
    async extractAi(text: string, dataset?: string, region = "USA") {
      return request<{ fields: any[]; rejected?: any[] }>("/datafields/import/ai", {
        method: "POST",
        body: JSON.stringify({ text, dataset, region }),
      });
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
    async pyramid(params: { region?: string; status?: string } = {}) {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return request<any>(`/journey/pyramid?${q}`);
    },
    async timeline() {
      return request<any[]>("/journey/timeline");
    },
    async activities() {
      return request<any[]>("/journey/activities");
    },
    async claimActivity(id: string) {
      return request<any>(`/journey/activities/${id}/claim`, { method: "POST" });
    },
    async recommendations() {
      return request<any>("/journey/recommendations");
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
          ...entry,
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
