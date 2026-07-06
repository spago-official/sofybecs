"""X (Twitter) API v2 recent search でソフィBeの言及を取得。

従量課金のため、since_id で前回以降の差分だけを取りに行く。
X_BEARER_TOKEN 未設定時はスキップ（呼び出し側で制御）。
"""

import urllib.parse

from .. import config
from ..http_util import get_json
from ..models import Item

SEARCH_URL = "https://api.twitter.com/2/tweets/search/recent"


def fetch(since_id: str | None = None) -> tuple[list[Item], str | None]:
    """(items, newest_id) を返す。newest_id は次回の since_id に使う。"""
    params = {
        "query": config.X_SEARCH_QUERY,
        "max_results": str(config.X_MAX_RESULTS),
        "tweet.fields": "created_at,author_id,public_metrics",
        "expansions": "author_id",
        "user.fields": "username,name",
    }
    if since_id:
        params["since_id"] = since_id
    url = SEARCH_URL + "?" + urllib.parse.urlencode(params)
    data = get_json(url, headers={"Authorization": f"Bearer {config.X_BEARER_TOKEN}"})

    users = {
        u["id"]: u for u in data.get("includes", {}).get("users", [])
    }
    items: list[Item] = []
    for t in data.get("data", []):
        user = users.get(t.get("author_id", ""), {})
        username = user.get("username", "")
        items.append(
            Item(
                source="x",
                id=t["id"],
                body=t.get("text", ""),
                author=f"@{username}" if username else "",
                created_at=t.get("created_at", ""),
                url=f"https://x.com/{username or 'i'}/status/{t['id']}",
            )
        )
    newest_id = data.get("meta", {}).get("newest_id")
    return items, newest_id
