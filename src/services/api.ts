/**
 * QuantStorm API Client Layer with Offline Mock Fallback
 * Connects frontends to the backend server (VITE_API_BASE_URL)
 * or gracefully falls back to mock data if the backend is not yet running.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      console.warn(`[API] ${endpoint} returned HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // Backend server is not running or offline; fall back gracefully
    return null;
  }
}

export const api = {
  auth: {
    async me() {
      return request<{ user: any; quota: { submittedToday: number; target: number } }>("/auth/me");
    },
    async login(email: string, pass: string) {
      return request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });
    },
  },

  alphas: {
    async list(params: { region?: string; status?: string; minSharpe?: string } = {}) {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return request<{ items: any[]; total: number }>(`/alphas?${query}`);
    },
    async create(alpha: Record<string, any>) {
      return request<any>("/alphas", {
        method: "POST",
        body: JSON.stringify(alpha),
      });
    },
    async submit(alphaId: string) {
      return request<{ status: string; dailySubmittedCount: number }>(`/alphas/${alphaId}/submit`, {
        method: "POST",
      });
    },
  },

  datafields: {
    async list(region = "USA") {
      return request<any[]>(`/datafields?region=${encodeURIComponent(region)}`);
    },
    async extract(rawText: string) {
      return request<{ fields: any[]; datasets: string[] }>("/datafields/extract", {
        method: "POST",
        body: JSON.stringify({ rawText }),
      });
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
      return request<{ items: any[]; totalEarnings: number }>("/finance/earnings");
    },
    async addEntry(entry: { date: string; type: string; amount: number; description: string }) {
      return request<any>("/finance/earnings", {
        method: "POST",
        body: JSON.stringify(entry),
      });
    },
  },
};
