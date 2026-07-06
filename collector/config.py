"""ソフィBe 口コミ収集の設定。"""

import os

# --- 監視対象 ---
APP_STORE_APP_ID = "6480158120"  # ソフィBe (iOS, 日本ストア)
APP_STORE_COUNTRY = "jp"
APP_STORE_RSS_PAGES = 2  # 1ページ50件。定期実行なら2ページで十分

GOOGLE_PLAY_APP_ID = "jp.sofy.be"
GOOGLE_PLAY_FETCH_COUNT = 100

# X API v2 recent search クエリ。完全一致フレーズ + RT除外
X_SEARCH_QUERY = '"ソフィBe" -is:retweet'
X_MAX_RESULTS = 50

# --- 実行時設定（環境変数） ---
SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL", "")
X_BEARER_TOKEN = os.environ.get("X_BEARER_TOKEN", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
DRY_RUN = os.environ.get("DRY_RUN", "") == "1"

# 1回の実行でSlackに流す最大件数（初回や障害復帰時の洪水防止）
MAX_POSTS_PER_RUN = int(os.environ.get("MAX_POSTS_PER_RUN", "20"))
# 初回実行（state が空）のとき、過去分は何件だけ流すか
FIRST_RUN_POSTS_PER_SOURCE = int(os.environ.get("FIRST_RUN_POSTS_PER_SOURCE", "3"))

STATE_FILE = os.environ.get("STATE_FILE", "state/seen.json")
# 各ソースで記憶しておく既読IDの上限
SEEN_IDS_KEEP = 3000
