# 遊戯王DBデッキサポート v3.0 実装計画

## 概要

遊戯王公式カードデータベースのデッキ編集機能を改善するChrome拡張機能 v3.0の実装計画。
2025年の現在のサイト構造に対応した抜本的な作り直しを行う。

## 技術環境

### 現在の実装状況
- **Chrome拡張機能**: Manifest v3 対応済み
- **ターゲットサイト**: https://www.db.yugioh-card.com/yugiohdb/*
- **Content Script**: content.js（基本構造実装済み）
- **開発環境**: Claude Code + MCP Playwright

### 調査済み技術仕様
- **サイト構造**: 2025年版（Yu-Gi-Oh! Neuron）
- **認証**: KONAMI ID (my.konami.net)
- **DOM構造**: HTML5セマンティック要素（article, navigation, banner等）
- **ページタイプ**: URL + ope パラメータによる判定

## フェーズ1: 基盤整備（完了済み）

### ✅ 完了タスク
1. **Chrome拡張機能の基本構造構築**
   - Manifest v3 設定完了
   - content.js基本フレームワーク実装
   - options.html, popup.html基本UI作成

2. **ページ認識システム**
   - URL解析による現在ページ判定機能
   - 操作種別（ope）による機能分岐
   - DOM読み込み完了待機処理

3. **開発環境整備**
   - MCP Playwright設定
   - デバッグ用content-debug.js作成
   - 自動インストールスクリプト

## フェーズ2: コア機能実装

### 優先度: High

#### 2.1 デッキ編集画面の改善
**対象URL**: `member_deck.action?ope=2`

**実装内容**:
1. **Modern UI オーバーレイ**
   ```javascript
   // 実装済みの enhanceDeckEditUI() を拡張
   - サポートパネル表示
   - デバッグ情報表示機能
   - リアルタイム分析機能
   ```

2. **ページ構造分析の強化**
   ```javascript
   // analyzeDeckEditStructure() の改善
   - 2025年版DOM要素の完全マッピング
   - セレクタ最適化
   - 動的要素の監視
   ```

3. **カードエリア識別**
   - メインデッキエリア特定
   - エクストラデッキエリア特定  
   - サイドデッキエリア特定
   - カード要素の構造解析

#### 2.2 カード操作システム
1. **マウスUI実装**
   - カードクリック検知
   - ドラッグ&ドロップ基盤
   - ホバーエフェクト

2. **カード情報取得**
   - カードID抽出
   - カード詳細情報連携
   - 制限情報の確認

### 優先度: Medium

#### 2.3 デッキ詳細画面の改善
**対象URL**: `member_deck.action?ope=1`

1. **詳細表示の拡張**
   - デッキ統計情報
   - カードバランス分析
   - コスト配分グラフ

2. **操作性の改善**
   - 編集開始ボタンの強化
   - プレビュー機能
   - 共有機能の拡張

#### 2.4 デッキ一覧の改善
**対象URL**: `member_deck.action?ope=4`

1. **リスト表示の改善**
   - フィルタリング機能
   - 並び替えオプション拡張
   - 一括操作機能

2. **検索機能の追加**
   - デッキ名検索
   - タグ機能
   - 使用カード検索

## フェーズ3: 高度機能実装

### 優先度: Low

#### 3.1 カード検索連携
**対象URL**: `card_search.action`

1. **検索結果の改善**
   - プレビュー表示
   - デッキ追加ボタン
   - 関連カード提案

2. **フィルタリング強化**
   - 高度検索オプション
   - 保存済み検索条件
   - 検索履歴

#### 3.2 Import/Export機能
1. **データ形式対応**
   - JSON形式エクスポート
   - CSV形式エクスポート
   - デッキコード連携

2. **画像生成**
   - デッキレシピ画像作成
   - ソーシャル共有対応
   - カスタムテンプレート

## 技術実装詳細

### DOM操作戦略
```javascript
// 2025年版サイト構造に対応
const selectors = {
    deckAreas: {
        main: 'article section[data-deck="main"]',
        extra: 'article section[data-deck="extra"]', 
        side: 'article section[data-deck="side"]'
    },
    cards: {
        item: '.card-item, [class*="card"]',
        image: 'img[src*="card"]',
        link: 'link[href*="card_search"]'
    },
    forms: {
        deckEdit: 'form[action*="member_deck.action"]',
        hidden: 'input[type="hidden"]'
    }
};
```

### イベント監視システム
```javascript
// 動的コンテンツ対応
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // 新しく追加されたカード要素を検知
            this.bindCardEvents(mutation.addedNodes);
        }
    });
});
```

### ストレージ設計
```javascript
// Chrome Storage API 活用
chrome.storage.local.set({
    'deck_analysis': analysisData,
    'user_preferences': preferences,
    'cache_card_data': cardCache
});
```

## セキュリティ対策

### 1. CSP 対応
- インラインスクリプト使用回避
- 外部リソース読み込み制限遵守
- nonce/hash 対応

### 2. CSRF 対策
- 既存のytknトークン尊重
- フォーム送信の干渉回避
- セッション状態の保持

### 3. プライバシー保護
- ユーザーデータの暗号化
- ローカルストレージのみ使用
- 外部送信の回避

## テスト計画

### 1. 単体テスト
- 各機能モジュールの個別テスト
- DOM操作の正確性検証
- エラーハンドリング確認

### 2. 統合テスト
- 公式サイトとの互換性確認
- パフォーマンス影響測定
- 複数ブラウザでの動作確認

### 3. ユーザビリティテスト
- 実際のデッキ編集作業での検証
- 既存ワークフローとの比較
- フィードバック収集

## リリース計画

### v3.0.0 - フェーズ1完了（現在）
- 基本構造の実装完了
- デバッグ環境整備

### v3.1.0 - フェーズ2完了予定
- デッキ編集画面改善
- カード操作システム基盤
- **目標: 2週間後**

### v3.2.0 - フェーズ3完了予定  
- 高度機能実装
- Import/Export対応
- **目標: 1ヶ月後**

## 技術的課題と対策

### 1. 大きなDOM構造
**課題**: ページサイズが37,000トークン超
**対策**: 
- 効率的なセレクタの使用
- 必要最小限の要素監視
- 遅延読み込み対応

### 2. 動的コンテンツ
**課題**: JavaScript による動的要素生成
**対策**:
- MutationObserver による監視
- イベント委譲の活用
- 再初期化機能の実装

### 3. 認証システム
**課題**: KONAMI ID ログイン必須
**対策**:
- 既存認証システムの尊重
- セッション状態の監視
- ログアウト時の適切な処理

## 成功指標

### 機能面
- [ ] デッキ編集効率の向上（時間短縮）
- [ ] ユーザビリティの改善（操作回数減少）
- [ ] エラー率の削減

### 技術面
- [ ] ページ読み込み時間への影響最小化
- [ ] メモリ使用量の適正化
- [ ] 公式サイト機能との互換性100%

### ユーザー満足度
- [ ] 既存ユーザーからの肯定的フィードバック
- [ ] 新規機能の利用率
- [ ] 不具合報告数の最小化

---
*最終更新: 2025年6月12日*
*作成者: Claude Code Assistant*