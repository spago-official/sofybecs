import { FEATURES, SOURCE_LABEL, hasActiveFilter, toggled, type Filters } from "../lib";

type Props = {
  total: number;
  shownCount: number;
  latestDate: string;
  loadState: "loading" | "ready" | "error";
  filters: Filters;
  versions: string[];
  onChange: (next: Filters) => void;
  onClear: () => void;
};

/** 結果件数 + 適用中フィルターの削除可能チップ + すべてクリア。sticky。 */
export function SummaryBar({
  total,
  shownCount,
  latestDate,
  loadState,
  filters,
  versions,
  onChange,
  onClear,
}: Props) {
  const active: Array<{ label: string; remove: () => void }> = [];
  if (filters.source !== "all") {
    active.push({
      label: SOURCE_LABEL[filters.source],
      remove: () => onChange({ ...filters, source: "all" }),
    });
  }
  for (const r of [5, 4, 3, 2, 1].filter((r) => filters.ratings.has(r))) {
    active.push({
      label: `星${r}`,
      remove: () => onChange({ ...filters, ratings: toggled(filters.ratings, r) }),
    });
  }
  for (const f of FEATURES.filter((f) => filters.features.has(f))) {
    active.push({
      label: f,
      remove: () => onChange({ ...filters, features: toggled(filters.features, f) }),
    });
  }
  for (const v of versions.filter((v) => filters.versions.has(v))) {
    active.push({
      label: v === "不明" ? v : `v${v}`,
      remove: () => onChange({ ...filters, versions: toggled(filters.versions, v) }),
    });
  }

  return (
    <div className="summary">
      {/* 絞り込み結果の変化を支援技術にも通知する */}
      <span aria-live="polite">
        {loadState === "loading" && "読み込み中…"}
        {loadState === "error" && "データの読み込みに失敗しました"}
        {loadState === "ready" &&
          `全 ${total} 件中 ${shownCount} 件を表示 ・ 最新の口コミ日: ${latestDate}`}
      </span>
      <span className="chips">
        {active.map((item) => (
          <button
            key={item.label}
            type="button"
            className="chip chip-selected"
            aria-label={`${item.label} の絞り込みを解除`}
            onClick={item.remove}
          >
            {item.label} <span className="chip-remove">×</span>
          </button>
        ))}
      </span>
      {hasActiveFilter(filters) && (
        <button type="button" className="summary-clear" onClick={onClear}>
          すべてクリア
        </button>
      )}
    </div>
  );
}
