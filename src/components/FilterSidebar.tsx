import { useState } from "react";
import { SearchInput } from "smarthr-ui";
import type { Item } from "../types";
import {
  FEATURES,
  SOURCE_LABEL,
  VERSION_LIMIT,
  activeFilterCount,
  hasActiveFilter,
  toggled,
  verKey,
  type Filters,
} from "../lib";
import { ChipGroup } from "./ChipGroup";

type Props = {
  items: Item[];
  filters: Filters;
  versions: string[];
  onChange: (next: Filters) => void;
  onClear: () => void;
};

export function FilterSidebar({ items, filters, versions, onChange, onClear }: Props) {
  const [open, setOpen] = useState(false); // モバイルの絞り込み開閉
  const active = hasActiveFilter(filters);
  const activeCount = activeFilterCount(filters);

  const sourceCounts: Record<string, number> = {};
  for (const d of items) sourceCounts[d.source] = (sourceCounts[d.source] || 0) + 1;

  const ratingCounts: Record<number, number> = {};
  for (const d of items) if (d.rating) ratingCounts[d.rating] = (ratingCounts[d.rating] || 0) + 1;

  const featCounts: Record<string, number> = {};
  for (const d of items)
    for (const f of d.features || ["その他"]) featCounts[f] = (featCounts[f] || 0) + 1;

  const verCounts: Record<string, number> = {};
  for (const d of items) verCounts[verKey(d)] = (verCounts[verKey(d)] || 0) + 1;

  const [versionExpanded, setVersionExpanded] = useState(false);

  const clearButton = (extraClass: string) =>
    active && (
      <button type="button" className={`sidebar-clear ${extraClass}`} onClick={onClear}>
        絞り込みをクリア
      </button>
    );

  return (
    <aside className="sidebar" aria-label="検索と絞り込み">
      <SearchInput
        className="search-field"
        name="search"
        tooltipMessage="キーワードで絞り込み"
        placeholder="キーワードで絞り込み（例: 記録 消えた）"
        aria-label="キーワード検索"
        spellCheck={false}
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />
      {/* デスクトップ: 検索直下のクイッククリア導線（≤980pxでは非表示） */}
      {clearButton("sidebar-clear-desktop")}
      <button
        type="button"
        className="filter-toggle"
        aria-expanded={open}
        aria-controls="filter-body"
        onClick={() => setOpen(!open)}
      >
        <span>絞り込み</span>
        <span className="filter-toggle-meta">
          {activeCount ? `${activeCount}件適用中` : "未適用"}
        </span>
      </button>
      <div className={"filter-body" + (open ? " open" : "")} id="filter-body">
        <ChipGroup
          legend="ソース"
          options={(["app_store", "google_play"] as const)
            .filter((key) => sourceCounts[key])
            .map((key) => ({ value: key, label: SOURCE_LABEL[key], count: sourceCounts[key] }))}
          selectedValues={filters.source === "all" ? [] : [filters.source]}
          // 単一選択: 選択済みを再度押すと解除（all に戻す）
          onToggle={(value) =>
            onChange({ ...filters, source: filters.source === value ? "all" : String(value) })
          }
        />
        <ChipGroup
          legend="評価"
          options={[5, 4, 3, 2, 1].map((r) => ({
            value: r,
            label: `星${r}`,
            count: ratingCounts[r] || 0,
          }))}
          selectedValues={[...filters.ratings]}
          onToggle={(value) =>
            onChange({ ...filters, ratings: toggled(filters.ratings, Number(value)) })
          }
        />
        <ChipGroup
          legend="機能"
          options={FEATURES.map((f) => ({ value: f, label: f, count: featCounts[f] || 0 }))}
          selectedValues={[...filters.features]}
          onToggle={(value) =>
            onChange({ ...filters, features: toggled(filters.features, String(value)) })
          }
        />
        <ChipGroup
          legend="バージョン"
          options={versions.map((v) => ({
            value: v,
            label: v === "不明" ? v : `v${v}`,
            count: verCounts[v],
          }))}
          selectedValues={[...filters.versions]}
          onToggle={(value) =>
            onChange({ ...filters, versions: toggled(filters.versions, String(value)) })
          }
          collapse={{
            limit: VERSION_LIMIT,
            expanded: versionExpanded,
            onToggle: () => setVersionExpanded(!versionExpanded),
          }}
        />
        {/* モバイル: パネル内末尾のクリア導線（>980pxでは非表示） */}
        {clearButton("sidebar-clear-mobile")}
      </div>
    </aside>
  );
}
