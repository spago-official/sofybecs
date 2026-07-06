"""Google Play レビュー取得（google-play-scraper・無料）。"""

from .. import config
from ..models import Item


def fetch() -> list[Item]:
    # 依存が無い環境（ローカル試行など）でも他ソースが動くよう遅延import
    from google_play_scraper import Sort, reviews

    result, _ = reviews(
        config.GOOGLE_PLAY_APP_ID,
        lang="ja",
        country="jp",
        sort=Sort.NEWEST,
        count=config.GOOGLE_PLAY_FETCH_COUNT,
    )
    items: list[Item] = []
    for r in result:
        items.append(
            Item(
                source="google_play",
                id=str(r["reviewId"]),
                body=r.get("content") or "",
                rating=r.get("score"),
                author=r.get("userName") or "",
                created_at=r["at"].isoformat() if r.get("at") else "",
                url=f"https://play.google.com/store/apps/details?id={config.GOOGLE_PLAY_APP_ID}&showAllReviews=true",
                extra={"version": r.get("reviewCreatedVersion") or ""},
            )
        )
    return items
