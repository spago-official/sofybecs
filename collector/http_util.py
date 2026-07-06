"""標準ライブラリのみの小さなHTTPヘルパー。"""

import json
import urllib.error
import urllib.request

USER_AGENT = "sofybe-review-collector/1.0"


def get_json(url: str, headers: dict | None = None, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def post_json(url: str, payload: dict, headers: dict | None = None, timeout: int = 30) -> str:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            **(headers or {}),
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read().decode("utf-8")
