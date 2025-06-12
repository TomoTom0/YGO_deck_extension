# 遊戯王DBデッキサポート v3.1.1 - プロジェクトドキュメント

## 📋 プロジェクト概要

遊戯王公式カードデータベース（https://www.db.yugioh-card.com/）のデッキ編集機能を大幅に改善するChrome拡張機能です。2025年の公式サイト仕様に完全対応し、MouseUIモードやデッキ管理機能を提供します。

### 🎯 主要機能

#### ✨ MouseUIモード
- **Master Duel風操作**: マウスクリックでカードを直感的に移動
- **ドラッグ&ドロップ**: メインデッキ、エクストラデッキ、サイドデッキ間の自由な移動
- **リアルタイム更新**: デッキ枚数とバランスの即座表示

#### 🃏 デッキ管理機能
- **保存/読み込み**: ローカルストレージを活用した高速デッキ管理
- **複製機能**: 既存デッキの瞬時コピー作成
- **削除機能**: 不要デッキの一括削除

#### 🔍 高度な検索・情報表示
- **拡張カード検索**: 複数条件での絞り込み検索
- **カード詳細エリア**: 選択カードの詳細情報表示
- **レアリティフィルター**: 属性、種族、攻撃力等での高度フィルタリング

#### 📊 Import/Export機能
- **デッキレシピファイル**: JSON形式でのデッキ情報出力
- **スクリーンショット**: 高品質デッキ画像生成
- **バックアップ**: 全デッキデータの一括エクスポート

#### 🎲 デッキ操作ツール
- **シャッフル機能**: デッキ内カードのランダム配置
- **ソート機能**: 攻撃力、名前、レアリティ等での自動整列
- **クリア機能**: デッキエリアの一括クリア

### 🏗️ 技術仕様

| 項目 | 詳細 |
|------|------|
| **Chrome拡張機能** | Manifest v3対応 |
| **対象サイト** | 遊戯王公式DB 2025年版 |
| **主要技術** | JavaScript ES2020+, CSS3, HTML5 |
| **テストフレームワーク** | Playwright |
| **開発環境** | Node.js 18+, Chrome 120+ |
| **ライセンス** | ISC |

### 📊 品質指標 (2025年6月現在)

- **テスト成功率**: 85.7% (12/14 テスト通過)
- **対応ページ**: ホーム、カード検索、デッキ検索、デッキ編集、デッキ詳細
- **動作確認環境**: Chrome 120+, Windows/Linux/macOS

## 🚀 インストール・セットアップ

### 前提条件

- Google Chrome 120以降
- 遊戯王公式DBのアカウント（デッキ編集機能使用時）

### インストール手順

#### 方法1: 手動インストール (推奨)

1. **リポジトリを取得**
   ```bash
   git clone https://github.com/TomoTom0/YGO_deck_extension.git
   cd YGO_deck_extension
   ```

2. **Chrome拡張機能として読み込み**
   - Chromeで `chrome://extensions/` を開く
   - 右上の「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - プロジェクトの `src/` フォルダを選択

3. **動作確認**
   - 遊戯王公式DB（https://www.db.yugioh-card.com/yugiohdb/）にアクセス
   - ページ右上に「YGO Deck Support」パネルが表示されることを確認

#### 方法2: 自動インストール

```bash
# インストールスクリプト実行
chmod +x install-extension.sh
./install-extension.sh
```

### 初期設定

1. **拡張機能オプション画面**
   - Chrome拡張機能一覧から「遊戯王DBデッキサポート」の「オプション」をクリック
   - 必要に応じて設定を調整

2. **ログイン状態確認**
   - 遊戯王公式DBにログイン
   - デッキ編集ページで拡張機能が正常動作することを確認

## 📖 使用方法

### 基本操作

#### ホームページ (yugiohdb/)
- **クイックアクセスパネル**: 主要機能への直接リンク
- **ヘルプボタン**: 使用方法の詳細ガイド表示
- **デバッグボタン**: 開発者向け情報表示

#### デッキ編集ページ (member_deck.action?ope=2)
1. **MouseUIモード切り替え**
   - 「MouseUI ON/OFF」ボタンをクリック
   - Master Duel風の操作モードに変更

2. **カードの移動**
   - メインデッキからエクストラデッキ: カードをクリック
   - エクストラデッキからサイドデッキ: ドラッグ&ドロップ
   - サイドデッキからメインデッキ: ダブルクリック

3. **デッキ管理**
   - 「Save Deck」: 現在のデッキを保存
   - 「Load Deck」: 保存されたデッキを読み込み
   - 「Export」: デッキをファイル形式で出力

#### カード検索ページ (card_search.action)
- **拡張検索フィルター**: 追加の検索条件を設定
- **結果表示改善**: カード詳細の見やすい表示
- **一括選択**: 複数カードの同時操作

### 高度な使用方法

#### デッキレシピの共有
```javascript
// カスタムスクリプトでのデッキ情報取得例
const deckInfo = window.YGO.DeckManager.getDeckInfo();
console.log('現在のデッキ構成:', deckInfo);
```

#### カスタマイズ設定
- **UI配色**: CSS変数を利用したテーマ変更
- **ショートカットキー**: キーボードショートカットの設定
- **自動保存間隔**: デッキの自動保存タイミング調整

## 🛠️ 開発者向け情報

### プロジェクト構造

```
YGO_deck_extension/
├── src/                    # Chrome拡張機能本体
│   ├── manifest.json       # 拡張機能設定
│   ├── js/
│   │   ├── content.js      # メインスクリプト (1000+ lines)
│   │   ├── popup.js        # ポップアップ機能
│   │   └── options.js      # 設定画面
│   ├── css/
│   │   └── content.css     # スタイルシート
│   └── images/             # アイコン類
├── doc/                    # ドキュメント
│   ├── api/                # API仕様書
│   ├── testing/            # テスト仕様書
│   └── development/        # 開発ガイド
├── playwright/             # Playwright E2Eテスト
├── data/                   # カードデータベース
└── docker/                 # データ更新システム
```

### API概要

拡張機能は `window.YGO` グローバルオブジェクトを通じて操作可能:

```javascript
// 基本操作例
window.YGO.MouseUI.toggle();         // MouseUIモード切り替え
window.YGO.DeckManager.getDeckInfo(); // デッキ情報取得
window.YGO.CardSearch.search('青眼');  // カード検索実行
```

詳細は [API仕様書](./api/README.md) を参照。

### テスト環境

```bash
# 基本テスト実行
npm test

# 包括テスト実行
node comprehensive-test.js

# Playwright E2Eテスト
npx playwright test
```

詳細は [テストガイド](./testing/README.md) を参照。

### 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 拡張機能リビルド
npm run build
```

詳細は [開発ガイド](./development/README.md) を参照。

## 🤝 コントリビューション

### バグ報告

GitHub Issues でバグ報告や機能要望を受け付けています:
- **バグ報告テンプレート**: 再現手順、期待される動作、実際の動作
- **機能要望テンプレート**: 用途、期待される効果、実装難易度

### 開発参加

1. **Fork & Clone**
   ```bash
   git clone https://github.com/[your-username]/YGO_deck_extension.git
   ```

2. **ブランチ作成**
   ```bash
   git checkout -b feature/new-feature
   ```

3. **開発 & テスト**
   ```bash
   npm test
   npx playwright test
   ```

4. **Pull Request作成**
   - 変更内容の詳細説明
   - テスト結果の添付
   - スクリーンショット（UI変更の場合）

## 📚 関連リンク

- **GitHub Repository**: https://github.com/TomoTom0/YGO_deck_extension
- **遊戯王公式DB**: https://www.db.yugioh-card.com/
- **Chrome Web Store**: (準備中)
- **開発ブログ**: (準備中)

## 📄 ライセンス

このプロジェクトは [ISC License](../LICENSE) の下で公開されています。

## 🏷️ バージョン履歴

- **v3.1.1** (2025-06-12): 2025年サイト仕様対応完了、Playwright テスト導入
- **v3.1.0** (2025-06-11): MouseUI機能実装、グローバルYGOオブジェクト追加
- **v3.0.0** (2025-06-10): Chrome Manifest v3対応、アーキテクチャ刷新

---

**最終更新**: 2025年6月12日  
**メンテナー**: TomoTomo  
**サポート**: GitHub Issues