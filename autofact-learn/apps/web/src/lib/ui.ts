export function scoreToGrade(score: number): { label: string; tier: "a" | "b" | "c" } {
  // score expected on 1–10 (also tolerates legacy 1–5 by scaling if < 5.5 avg context)
  const s = score <= 5.5 && score > 0 ? score * 2 : score;
  if (s >= 9.2) return { label: "S", tier: "a" };
  if (s >= 8.5) return { label: "5A", tier: "a" };
  if (s >= 7.5) return { label: "4.5", tier: "a" };
  if (s >= 6.5) return { label: "4B", tier: "b" };
  if (s >= 5.5) return { label: "3.5", tier: "b" };
  if (s >= 4.5) return { label: "3C", tier: "c" };
  return { label: "2", tier: "c" };
}

export function scoreColor(score: number) {
  if (score >= 8) return "var(--lime)";
  if (score >= 6) return "var(--warn)";
  return "var(--danger)";
}

export function formatPrice(kopecks: number) {
  return `${Math.round(kopecks / 100).toLocaleString("ru-RU")}₽`;
}

export function formatKm(km: number) {
  return `${km.toLocaleString("ru-RU")} км`;
}

export function formatDate(iso: string | Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(typeof iso === "string" ? new Date(iso) : iso);
}

const FAV_KEY = "autofact_favorites_v1";

export type FavoriteState = {
  reports: string[];
  experts: string[];
};

export function getFavorites(): FavoriteState {
  if (typeof window === "undefined") return { reports: [], experts: [] };
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '{"reports":[],"experts":[]}');
  } catch {
    return { reports: [], experts: [] };
  }
}

export function toggleFavorite(kind: "reports" | "experts", id: string) {
  const state = getFavorites();
  const list = new Set(state[kind]);
  if (list.has(id)) list.delete(id);
  else list.add(id);
  const next = { ...state, [kind]: [...list] };
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
}

export function isFavorite(kind: "reports" | "experts", id: string) {
  return getFavorites()[kind].includes(id);
}

export const DEFECT_LABELS: Record<string, string> = {
  scratch: "Царапина",
  dent: "Вмятина",
  rust: "Коррозия",
  chip: "Скол",
  crack: "Трещина",
  replace: "Замена детали",
  paint: "Перекрас",
  other: "Прочее",
};
