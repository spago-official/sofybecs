import { Fragment } from "react";
import { VisuallyHiddenText } from "smarthr-ui";
import type { Item } from "../types";
import { SOURCE_LABEL, stars } from "../lib";

type Props = {
  data: Item[];
  shown: number;
  onMore: () => void;
};

/** 日付見出し（h2）でグルーピングした口コミ一覧 + ページング。 */
export function ReviewList({ data, shown, onMore }: Props) {
  if (!data.length) {
    return <p className="empty">条件に合う口コミがありません</p>;
  }

  let currentDate: string | null = null;
  return (
    <div>
      {data.slice(0, shown).map((d) => {
        const date = d.created_at ? d.created_at.slice(0, 10) : "日付不明";
        const head = date !== currentDate;
        currentDate = date;
        return (
          <Fragment key={d.id}>
            {head && <h2 className="date-head">{date}</h2>}
            <article className="card">
              <div className="card-meta">
                <span className="badge">{SOURCE_LABEL[d.source] || d.source}</span>
                {d.rating ? (
                  <span className="stars" role="img" aria-label={`評価 ${d.rating}`}>
                    {stars(d.rating)}
                  </span>
                ) : null}
                {d.version ? <span>v{d.version}</span> : null}
                {d.author ? <span>{d.author}</span> : null}
                {(d.features || []).map((f) => (
                  <span key={f} className="tag">
                    {f}
                  </span>
                ))}
                <a className="card-link" href={d.url} target="_blank" rel="noopener">
                  開く<VisuallyHiddenText>（新しいタブで開く）</VisuallyHiddenText>
                </a>
              </div>
              {d.title ? <div className="card-title">{d.title}</div> : null}
              {d.body ? <div className="card-body">{d.body}</div> : null}
            </article>
          </Fragment>
        );
      })}
      {data.length > shown && (
        <button type="button" className="more" onClick={onMore}>
          さらに表示（残り {data.length - shown} 件）
        </button>
      )}
    </div>
  );
}
