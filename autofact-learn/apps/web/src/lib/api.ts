const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api/v1";
const FILES_URL = process.env.NEXT_PUBLIC_FILES_URL ?? "http://localhost:3010";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: "CLIENT" | "EXPERT" | "ADMIN" };
};

const TOKEN_KEY = "ai_session";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

export function fileUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${FILES_URL}${path}`;
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const session = getSession();
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Ошибка запроса";
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type ReportListItem = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  city: string;
  status: string;
  expertOverallScore: number;
  platformScore: number | null;
  priceKopecks: number;
  priceMultiplier: number;
  ageDays: number;
  coverUrl: string | null;
  createdAt: string;
  expert: { id: string; fullName: string; rating: number; region: string; city: string };
};
