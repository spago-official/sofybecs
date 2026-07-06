"""口コミをアプリ機能でタグ付けする分類器。

ANTHROPIC_API_KEY があれば Claude Haiku に文脈を読ませて分類し、
無い場合・失敗時はキーワード分類にフォールバックする。
一度付いたタグは保持される（store.py 側で未分類のものだけ渡す）。
"""

import json
import unicodedata

from . import config
from .http_util import post_json

CLASSIFY_MODEL = "claude-haiku-4-5"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
BATCH_SIZE = 40

OTHER = "その他"
FEATURE_NAMES = ["HOME", "記録", "チャット", "カレンダー", "レポート", "コンテンツ", "設定", OTHER]

# 機能の定義。LLMプロンプトとキーワードフォールバックの両方で使う
FEATURE_DEFS: dict[str, dict] = {
    "HOME": {
        "desc": "ホーム画面。今日の体調・ホルモン状態の表示、画面デザイン全般、ウィジェット",
        "keywords": ["ホーム", "home", "トップ画面", "ウィジェット"],
    },
    "記録": {
        "desc": "生理日・体温・体重・症状・気分などの入力/記録。記録操作の手間、記録データの消失",
        "keywords": ["記録", "入力", "基礎体温", "体温", "体重", "メモ", "つけ忘れ"],
    },
    "チャット": {
        "desc": "AIチャットでの相談・質問機能",
        "keywords": ["チャット", "ai", "相談", "質問"],
    },
    "カレンダー": {
        "desc": "カレンダー表示、生理日・排卵日の予測とその精度、生理周期のズレ",
        "keywords": ["カレンダー", "生理日", "予定日", "周期", "予測"],
    },
    "レポート": {
        "desc": "ホルモングラフ、体調の分析・振り返りレポート",
        "keywords": ["レポート", "グラフ", "ホルモン", "分析"],
    },
    "コンテンツ": {
        "desc": "コラム・記事・動画などの読み物コンテンツ",
        "keywords": ["コラム", "記事", "動画", "コンテンツ"],
    },
    "設定": {
        "desc": "ログイン・アカウント、通知設定、機種変更・引き継ぎ、外部機器連携（体温計等）、同期・バックアップ",
        "keywords": [
            "設定", "ログイン", "アカウント", "通知", "引き継ぎ", "引継ぎ",
            "パスワード", "機種変更", "連携", "同期", "データ移行", "バックアップ",
        ],
    },
}

CLASSIFY_PROMPT = """あなたはユニ・チャームの生理・ホルモン管理アプリ「ソフィBe」のレビュー分析を担当しています。
以下のレビューそれぞれに、言及されている機能のタグを付けてください。

機能の定義:
{defs}

ルール:
- 複数の機能に言及していれば複数付ける
- 「使いやすい」「可愛い」など全般的な感想だけで特定機能に触れていない場合は「{other}」のみ
- 生理・妊活・ホルモンの話題でも、どの機能の話かを文脈で判断する
  （例:「予測が当たらない」→カレンダー、「ホルモングラフが見づらい」→レポート、
  「アップデートで記録が消えた」→記録と設定）
- 出力はJSONのみ。形式: {{"0": ["記録"], "1": ["カレンダー", "設定"], ...}}
  タグは {names} のいずれかに限る

レビュー:
{reviews}"""


def _normalize(text: str) -> str:
    return unicodedata.normalize("NFKC", text or "").lower()


def classify_keywords(text: str) -> list[str]:
    t = _normalize(text)
    tags = [
        name for name, d in FEATURE_DEFS.items()
        if any(w in t for w in d["keywords"])
    ]
    return tags or [OTHER]


def _classify_batch_llm(texts: list[str]) -> list[list[str]]:
    defs = "\n".join(f"- {name}: {d['desc']}" for name, d in FEATURE_DEFS.items())
    reviews = "\n".join(f"{i}: {t[:300]}" for i, t in enumerate(texts))
    prompt = CLASSIFY_PROMPT.format(
        defs=defs, other=OTHER, names=" / ".join(FEATURE_NAMES), reviews=reviews
    )
    res = post_json(
        ANTHROPIC_URL,
        {
            "model": CLASSIFY_MODEL,
            "max_tokens": 4000,
            "messages": [{"role": "user", "content": prompt}],
        },
        headers={
            "x-api-key": config.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        timeout=120,
    )
    text = json.loads(res)["content"][0]["text"]
    start, end = text.find("{"), text.rfind("}")
    parsed = json.loads(text[start : end + 1])
    result = []
    for i, t in enumerate(texts):
        tags = [x for x in parsed.get(str(i), []) if x in FEATURE_NAMES]
        result.append(tags or classify_keywords(t))
    return result


def classify_texts(texts: list[str]) -> list[list[str]]:
    """テキスト群を機能タグに分類。LLM優先・キーワードフォールバック。"""
    if not texts:
        return []
    if not config.ANTHROPIC_API_KEY:
        return [classify_keywords(t) for t in texts]
    result: list[list[str]] = []
    for i in range(0, len(texts), BATCH_SIZE):
        chunk = texts[i : i + BATCH_SIZE]
        try:
            result.extend(_classify_batch_llm(chunk))
        except Exception as e:
            print(f"[features] LLM分類失敗、キーワードで代替: {e}")
            result.extend(classify_keywords(t) for t in chunk)
    return result
