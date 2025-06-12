# YGO Deck Extension - プロジェクト構造

## 📁 ディレクトリ構成

```
YGO_deck_extension/
├── 📄 重要ファイル
│   ├── CLAUDE.md                          # プロジェクト指示書
│   ├── README.md                          # プロジェクト概要
│   ├── LICENSE.md                         # ライセンス
│   ├── PrivacyPolicy.md                   # プライバシーポリシー
│   ├── package.json                       # Node.js依存関係
│   ├── .env                               # 環境変数（Git除外）
│   └── .env.example                       # 環境変数サンプル
│
├── 🚀 メイン機能
│   ├── src/                               # Chrome拡張機能本体
│   │   ├── manifest.json                  # 拡張機能設定
│   │   ├── js/                            # JavaScript実装
│   │   │   ├── content.js                 # メインスクリプト
│   │   │   ├── mouseui-core.js            # MouseUI機能
│   │   │   ├── deck-integration.js        # デッキ制限チェック
│   │   │   ├── ui-display-manager.js      # UI表示切替
│   │   │   ├── popup.js                   # ポップアップ
│   │   │   └── options.js                 # オプション
│   │   ├── css/                           # スタイルシート
│   │   ├── images/                        # アイコン画像
│   │   ├── popup.html                     # ポップアップUI
│   │   └── options.html                   # オプションUI
│   │
│   └── scripts/                           # 自動化スクリプト
│       └── send-reports.js                # レポート自動送信
│
├── 🧪 テスト・品質保証
│   ├── tests/                             # テストスクリプト
│   │   ├── comprehensive-test.js          # 包括的テスト
│   │   ├── test-extension.js              # 拡張機能テスト
│   │   ├── test-deck-limits*.js           # デッキ制限テスト
│   │   ├── test-ui-display-manager.js     # UI表示テスト
│   │   └── debug-manifest.js              # デバッグツール
│   │
│   ├── playwright/                        # E2Eテスト
│   │   ├── tests/                         # テストケース
│   │   ├── screenshots/                   # スクリーンショット
│   │   └── take-ss/                       # 自動スクリーンショット
│   │
│   └── test-results/                      # テスト実行結果
│
├── 🔧 開発ツール
│   ├── tools/                             # 調査・分析ツール
│   │   ├── site-investigation.js          # サイト構造調査
│   │   ├── card-search-investigation.js   # カード検索調査
│   │   ├── deck-analysis.js               # デッキ分析
│   │   ├── ygo-db-*.js                    # 各種DB調査ツール
│   │   └── screenshot-with-login.js       # ログイン付きスクリーンショット
│   │
│   └── config/                            # 設定・セットアップ
│       ├── install-extension.sh           # 拡張機能インストール
│       ├── start-chrome-for-login.sh      # Chrome起動スクリプト
│       ├── auto-install.html              # 自動インストールページ
│       ├── deck_edit_page.html            # デッキ編集ページ
│       └── extension-state-investigation.json
│
├── 📊 レポート・ドキュメント
│   ├── reports/                           # 開発レポート
│   │   ├── PHASE1-FINAL-SUMMARY.md        # Phase 1完了サマリー
│   │   ├── README.md                      # レポート概要
│   │   ├── PDCA*-*.md                     # PDCAサイクルレポート
│   │   └── *-report.json                  # テスト結果詳細
│   │
│   ├── docs/                              # プロジェクトドキュメント
│   │   ├── CLAUDE_AUTO_REPORTS_INSTRUCTION.md  # Claude指示書
│   │   ├── REPORTS_API_SETUP.md           # API設定ガイド
│   │   ├── README_INSTALL.md              # インストールガイド
│   │   ├── TROUBLESHOOTING.md             # トラブルシューティング
│   │   ├── TEST_REPORT.md                 # テスト報告
│   │   └── mouseui-implementation-analysis.md
│   │
│   └── doc/                               # 既存ドキュメント
│       ├── first/                         # 初期調査資料
│       ├── api/                           # API仕様
│       ├── development/                   # 開発ガイド
│       └── screenshots/                   # 仕様書用画像
│
├── 🗃️ データ・アセット
│   ├── data/                              # カードデータベース
│   │   ├── ygo_db_simple.tsv              # カード基本情報
│   │   └── fromConstant.tsv               # 定数データ
│   │
│   ├── assets/                            # 画像・アセット
│   │   ├── *.png                          # スクリーンショット
│   │   └── *.jpg                          # 調査画像
│   │
│   └── intro/                             # 紹介資料
│       ├── NEWS_*.md                      # 更新情報
│       └── imgs/                          # 紹介画像
│
├── 🐳 開発環境
│   ├── docker/                            # Docker環境
│   │   ├── Dockerfile                     # コンテナ設定
│   │   ├── docker-compose.yml             # 開発環境
│   │   └── src/                           # DB更新スクリプト
│   │
│   ├── research/                          # 研究・プロトタイプ
│   │   ├── src/                           # 調査スクリプト
│   │   └── config/                        # 調査設定
│   │
│   └── 🗂️ セッション・キャッシュ
│       ├── chrome-profile/                # Chrome開発プロファイル
│       ├── playwright-session/            # Playwrightセッション
│       └── node_modules/                  # Node.js依存関係
│
└── 📜 レガシー
    └── src_old/                           # 旧実装（参考用）
        ├── script/                        # 旧スクリプト
        ├── css/                           # 旧スタイル
        └── images/                        # 旧画像
```

## 🎯 ファイル配置ルール

### ✅ ルートディレクトリに配置すべきファイル
- **プロジェクト設定**: `package.json`, `.env`, `.gitignore`
- **プロジェクト文書**: `CLAUDE.md`, `README.md`, `LICENSE.md`
- **設定サンプル**: `.env.example`

### ❌ ルートディレクトリに配置しないファイル
- **テストファイル** → `tests/` へ
- **調査スクリプト** → `tools/` へ  
- **設定スクリプト** → `config/` へ
- **スクリーンショット** → `assets/` へ
- **ドキュメント** → `docs/` へ（重要ファイル除く）

## 🚀 開発コマンド

```bash
# テスト実行
npm run test                    # 基本テスト
npm run test:comprehensive     # 包括テスト
npm run test:playwright        # E2Eテスト
npm run test:all               # 全テスト

# 開発ツール
npm run dev:debug              # デバッグモード
npm run dev:install            # 拡張機能インストール
npm run dev:chrome             # Chrome起動

# レポート送信
npm run send-reports           # 手動レポート送信
# git commit時に自動送信
```

## 📝 今後の方針

1. **新規ファイル作成時**: 適切なディレクトリに配置
2. **一時ファイル**: `temp/` または `/tmp/` 使用
3. **生成ファイル**: `.gitignore` で除外
4. **設定ファイル**: `config/` に集約
5. **ドキュメント**: 重要度に応じて `./` または `docs/`

この構造により、プロジェクトの可読性・保守性・拡張性が大幅に向上します。