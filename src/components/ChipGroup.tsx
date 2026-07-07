export type ChipOption = {
  value: string | number;
  label: string;
  count: number;
};

type Collapse = {
  limit: number;
  expanded: boolean;
  onToggle: () => void;
};

type Props = {
  legend: string;
  options: ChipOption[];
  selectedValues: Array<string | number>;
  onToggle: (value: string | number) => void;
  collapse?: Collapse;
};

/** 件数付きトグルチップのグループ。fieldset/legend でグループ名を支援技術に伝える。 */
export function ChipGroup({ legend, options, selectedValues, onToggle, collapse }: Props) {
  // 折りたたみ時は先頭 limit 件 + 選択中の値のみ表示（選択状態は常に見える）
  const collapsible = !!collapse && options.length > collapse.limit;
  const visible =
    collapsible && !collapse.expanded
      ? options.filter((o, i) => i < collapse.limit || selectedValues.includes(o.value))
      : options;

  return (
    <fieldset className="filter-group">
      <legend className="filter-label">{legend}</legend>
      <div className="chips">
        {visible.map((option) => {
          const selected = selectedValues.includes(option.value);
          return (
            <button
              key={String(option.value)}
              type="button"
              className={"chip" + (selected ? " chip-selected" : "")}
              aria-pressed={selected}
              onClick={() => onToggle(option.value)}
            >
              <span>{option.label}</span>
              <span className="chip-count">{option.count}</span>
            </button>
          );
        })}
      </div>
      {collapsible && (
        <button
          type="button"
          className="chips-toggle"
          aria-expanded={collapse.expanded}
          onClick={collapse.onToggle}
        >
          {collapse.expanded ? "折りたたむ" : `すべて表示（${options.length}）`}
        </button>
      )}
    </fieldset>
  );
}
