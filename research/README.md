# 遊戯王DB公式サイト調査ツール

## 概要

このツールは遊戯王公式カードデータベースの現在の構造を調査し、Chrome拡張機能の開発に必要な情報を収集します。

## 機能

- **自動ログイン**: 公式サイトへの自動ログイン
- **ページ構造分析**: HTML要素、フォーム、リンク等の詳細分析
- **スクリーンショット取得**: 各ページの画面キャプチャ
- **レポート生成**: JSON形式での分析結果出力

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して、遊戯王DBのログイン情報を設定：

```env
YGO_USERNAME=your_actual_username
YGO_PASSWORD=your_actual_password
```

### 2. 実行方法

#### 推奨: Playwright版ハイブリッド分析（Rye）

```bash
# Ryeで依存関係をインストール
rye sync

# Playwrightブラウザをインストール
rye run playwright install

# ハイブリッド分析を実行
rye run python src/playwright_analyzer.py
```

**流れ:**
1. 既存セッションがあればヘッドレスで分析実行
2. なければブラウザが開いて画像選択を手動で行う
3. セッション保存後、ヘッドレスで詳細分析を自動実行

#### Selenium版（従来）

```bash
# Selenium版ハイブリッド分析
rye run python src/hybrid_analyzer.py
```

#### 対話的分析のみ（画像選択の構造調査）

```bash
rye run python src/interactive_login.py
```

#### 従来の完全自動分析（画像選択で失敗する可能性あり）

```bash
rye run python src/main.py
```

### 3. Docker環境での実行

```bash
# イメージをビルド
docker-compose build

# コンテナを起動
docker-compose up -d

# コンテナに入る
docker-compose exec ygo-research bash

# 各種分析を実行
rye run python src/playwright_analyzer.py    # 推奨
rye run python src/interactive_login.py      # 対話的
rye run python src/main.py                  # 完全自動
```

## 出力ファイル

### ハイブリッド分析の出力

#### セッション管理 (`data/sessions/`)
- `cookies.pkl` - 保存されたセッションクッキー
- `session_info.json` - セッション情報

#### 対話的分析結果 (`data/interactive/`)
- `image_selection_analysis.json` - 画像選択画面の詳細分析
- `image_selection_full.png` - 画像選択画面のスクリーンショット
- `login_success_deck_page.png` - ログイン成功後のデッキページ

#### ヘッドレス分析結果 (`data/headless_analysis/`)
- `deck_list_analysis.json` - デッキ一覧ページの分析結果
- `deck_edit_analysis.json` - デッキ編集ページの分析結果
- `card_search_analysis.json` - カード検索ページの分析結果
- `member_page_analysis.json` - メンバーページの分析結果
- 各ページのスクリーンショット

### 従来分析の出力 (`data/`)
- `deck_list_analysis.json` - デッキ一覧ページの分析結果
- `deck_edit_analysis.json` - デッキ編集ページの分析結果
- `card_search_analysis.json` - カード検索ページの分析結果
- `summary_report.json` - 総合レポート

### スクリーンショットディレクトリ (`data/screenshots/`)
- 各段階のスクリーンショット（ログイン、画像選択、エラー等）

### ログディレクトリ (`logs/`)
- `research.log` - 実行ログ

## 分析内容

### 各ページで収集される情報
1. **基本情報**
   - ページタイトル、URL、ページソースサイズ
   - スクリーンショット

2. **HTML要素**
   - テーブル、フォーム、入力欄等の要素数
   - デッキ関連、カード関連要素の特定
   - 各要素のサンプル（属性、テキスト等）

3. **フォーム分析**
   - フォームのaction、method
   - 入力フィールドの詳細

4. **リンク分析**
   - 外部・内部リンクの収集
   - デッキ関連リンクの特定

5. **JavaScript分析**
   - 外部スクリプト、インラインスクリプトの検出

## 注意事項

- **ログイン情報の管理**: `.env`ファイルは絶対にgitにコミットしないでください
- **利用規約の遵守**: 公式サイトの利用規約を遵守し、過度な負荷をかけないよう配慮してください
- **レート制限**: リクエスト間に適切な間隔を設けています（デフォルト2秒）

## トラブルシューティング

### ログインに失敗する場合
1. ログイン情報が正しいか確認
2. 公式サイトでブラウザから正常にログインできるか確認
3. 2段階認証等が有効になっていないか確認

### Chrome/ChromeDriverのエラー
1. Dockerを使用している場合、コンテナを再ビルド
2. ローカル環境の場合、ChromeDriverのバージョンを確認

### 権限エラー
```bash
# ログディレクトリの権限を確認
chmod -R 755 logs/
chmod -R 755 data/
```

## 開発者向け情報

### 新しいページの分析を追加
`src/site_analyzer.py`の`run_analysis()`メソッド内の`pages_to_analyze`リストに追加してください。

### 分析内容のカスタマイズ
`_analyze_elements()`等のメソッドを修正して、収集する情報を変更できます。