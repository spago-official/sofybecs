import type { Item } from "./types";

export const SOURCE_LABEL: Record<string, string> = {
  app_store: "App Store",
  google_play: "Google Play",
};

export const FEATURES = [
  "HOME",
  "記録",
  "チャット",
  "カレンダー",
  "レポート",
  "コンテンツ",
  "設定",
  "その他",
] as const;

export const PAGE_SIZE = 200;
export const VERSION_LIMIT = 8; // バージョン群の折りたたみ時に表示する最新件数

/** "4.16"(iOS) と "4.16.0"(Android) を同じリリースに束ねる */
export const verKey = (item: Item): string => {
  const v = (item.version || "").trim();
  if (!v) return "不明";
  return v.split(".").slice(0, 2).join(".");
};

export const stars = (rating: number): string =>
  "★".repeat(rating) + "☆".repeat(5 - rating);

export type Filters = {
  source: string; // "all" | source key（単一選択）
  ratings: Set<number>;
  versions: Set<string>;
  features: Set<string>;
  query: string;
};

export const hasActiveFilter = (f: Filters): boolean =>
  f.source !== "all" || f.ratings.size > 0 || f.versions.size > 0 || f.features.size > 0;

export const activeFilterCount = (f: Filters): number =>
  (f.source !== "all" ? 1 : 0) + f.ratings.size + f.versions.size + f.features.size;

export function applyFilters(items: Item[], f: Filters): Item[] {
  const q = f.query.trim().toLowerCase();
  const words = q ? q.split(/\s+/) : [];
  return items.filter((d) => {
    if (f.source !== "all" && d.source !== f.source) return false;
    if (f.ratings.size && !(d.rating != null && f.ratings.has(d.rating))) return false;
    if (f.versions.size && !f.versions.has(verKey(d))) return false;
    if (f.features.size && !(d.features || ["その他"]).some((x) => f.features.has(x))) return false;
    if (words.length) {
      const text = `${d.title || ""} ${d.body || ""} ${d.author || ""}`.toLowerCase();
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  });
}

export function toggled<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/** 絞り込み状態をURLクエリに反映する（チームでの共有用）。 */
export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams();
  if (f.query.trim()) p.set("q", f.query);
  if (f.source !== "all") p.set("source", f.source);
  if (f.ratings.size) p.set("ratings", [...f.ratings].sort((a, b) => b - a).join(","));
  if (f.features.size) p.set("features", [...f.features].join(","));
  if (f.versions.size) p.set("versions", [...f.versions].join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function filtersFromSearch(search: string): Filters {
  const p = new URLSearchParams(search);
  return {
    query: p.get("q") || "",
    source: p.get("source") || "all",
    ratings: new Set(
      (p.get("ratings") || "")
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter((n) => n >= 1 && n <= 5),
    ),
    features: new Set((p.get("features") || "").split(",").filter(Boolean)),
    versions: new Set((p.get("versions") || "").split(",").filter(Boolean)),
  };
}
