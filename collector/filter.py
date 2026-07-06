"""X投稿の関連性フィルタ。

1段目: キーワード（「ソフィBe」を含むか。大文字小文字・全半角ゆらぎを正規化）
2段目: ANTHROPIC_API_KEY があれば Claude Haiku で「ユニ・チャームの
       生理管理アプリ ソフィBe の話か」を判定。API失敗時は通す（フェイルオープン）。
"""

import json
import unicodedata

from . import config
from .http_util import post_json
from .models import Item

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
CLASSIFY_MODEL = "claude-haiku-4-5"


def _normalize(text: str) -> str:
    return unicodedata.normalize("NFKC", text).lower()


def keyword_match(item: Item) -> bool:
    return "ソフィbe" in _normalize(item.body)


def llm_filter(items: list[Item]) -> list[Item]:
    """Claudeで一括判定。キー未設定・失敗時はそのまま返す。"""
    if not config.ANTHROPIC_API_KEY or not items:
        return items

    numbered = "\n".join(
        f"{i}: {item.body[:280]}" for i, item in enumerate(items)
    )
    prompt = (
        "以下はX(Twitter)の投稿です。それぞれについて、ユニ・チャームの"
        "生理・体調管理アプリ「ソフィBe」に関する言及（感想・不満・要望・紹介など）"
        "かどうかを判定してください。単なる無関係な文字列一致は false にしてください。\n"
        "回答はJSON配列のみ。例: [true, false, true]\n\n"
        f"{numbered}"
    )
    try:
        res = post_json(
            ANTHROPIC_URL,
            {
                "model": CLASSIFY_MODEL,
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}],
            },
            headers={
                "x-api-key": config.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
        )
        text = json.loads(res)["content"][0]["text"]
        start, end = text.find("["), text.rfind("]")
        flags = json.loads(text[start : end + 1])
        if len(flags) == len(items):
            return [item for item, ok in zip(items, flags) if ok]
    except Exception as e:  # 判定失敗で通知を落とさない
        print(f"[filter] LLM判定をスキップ: {e}")
    return items


def filter_x_items(items: list[Item]) -> list[Item]:
    items = [i for i in items if keyword_match(i)]
    return llm_filter(items)
