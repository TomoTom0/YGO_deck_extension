# Reports API Setup Guide

## 概要
Claude Codeが作成する開発レポートを自動的に `gin-arcv.scioj.com/reports` に送信するシステム。

## セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# .envファイルを作成
cp .env.example .env

# エディタで.envを編集し、APIトークンを設定
# REPORTS_API_TOKEN=your_actual_token_here
```

### 3. 動作確認
```bash
# 手動でレポート送信テスト
npm run send-reports
```

## 自動送信の仕組み

### Git Hook統合
- `git commit` 実行後に自動的にレポート送信
- `.git/hooks/post-commit` で実装
- エラー時もcommitは正常完了

### 送信対象
- `reports/`フォルダ内の全ファイル
- 対応形式: `.md`, `.json`, `.html`, `.txt`
- 自動的にHTML形式に変換して送信

## API仕様

### エンドポイント
- **URL**: `https://gin-arcv.scioj.com/reports`
- **Method**: POST
- **Auth**: Bearer Token

### 送信データ形式
```json
{
  "timestamp": "2025-06-12T10:30:00.000Z",
  "project": "/home/user/YGO_deck_extension",
  "author": "claude-code",
  "path": "reports/pdca/cycle1-action",
  "title": "PDCA Cycle 1 - Action",
  "ext": "html",
  "content": "<!DOCTYPE html>..."
}
```

### パス階層の例
- `reports/pdca/cycle1-action` - PDCAレポート
- `reports/tests/deck-limits` - テスト結果
- `reports/investigation/dom-structure` - 調査結果
- `reports/phase/summary` - フェーズサマリー

## HTMLテンプレート機能

### 自動生成される要素
1. **目次**: コンテンツから自動抽出
2. **要約**: レポートタイプに基づく自動生成
3. **Next Actions**: ユーザー・LLM向けアクション分離

### スタイリング
- レスポンシブデザイン
- 色分けされたセクション
- 読みやすいタイポグラフィ

## トラブルシューティング

### よくある問題
1. **認証エラー**: `.env`のトークンを確認
2. **ネットワークエラー**: インターネット接続を確認
3. **依存関係エラー**: `npm install` を再実行

### ログ確認
```bash
# 詳細ログ付きで実行
DEBUG=1 npm run send-reports
```

### 手動送信
```bash
# git hookを使わず手動送信
node scripts/send-reports.js
```

## 設定のカスタマイズ

### 送信タイミングの変更
`package.json` の `postcommit` スクリプトを編集

### パス階層のカスタマイズ
`scripts/send-reports.js` の `processFile()` メソッドを編集

### HTMLテンプレートの変更
`scripts/send-reports.js` の `wrapWithHTMLTemplate()` メソッドを編集

---

**設定完了後、通常通り開発を続けるだけでレポートが自動送信されます。**