"""App Store レビュー取得（Apple公式RSSフィード・無料・認証不要）。"""

from .. import config
from ..http_util import get_json
from ..models import Item

RSS_URL = (
    "https://itunes.apple.com/{country}/rss/customerreviews/"
    "page={page}/id={app_id}/sortby=mostrecent/json"
)


def fetch() -> list[Item]:
    items: list[Item] = []
    for page in range(1, config.APP_STORE_RSS_PAGES + 1):
        url = RSS_URL.format(
            country=config.APP_STORE_COUNTRY,
            page=page,
            app_id=config.APP_STORE_APP_ID,
        )
        feed = get_json(url).get("feed", {})
        entries = feed.get("entry", [])
        # レビューが1件だけのページは dict で返ることがある
        if isinstance(entries, dict):
            entries = [entries]
        for e in entries:
            review_id = e.get("id", {}).get("label", "")
            if not review_id:
                continue
            items.append(
                Item(
                    source="app_store",
                    id=review_id,
                    title=e.get("title", {}).get("label", ""),
                    body=e.get("content", {}).get("label", ""),
                    rating=int(e.get("im:rating", {}).get("label", 0)) or None,
                    author=e.get("author", {}).get("name", {}).get("label", ""),
                    created_at=e.get("updated", {}).get("label", ""),
                    url=f"https://apps.apple.com/{config.APP_STORE_COUNTRY}/app/id{config.APP_STORE_APP_ID}?see-all=reviews",
                    extra={"version": e.get("im:version", {}).get("label", "")},
                )
            )
        if not entries:
            break
    return items
