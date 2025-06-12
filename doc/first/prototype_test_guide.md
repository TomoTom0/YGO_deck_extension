# Chrome拡張機能プロトタイプ テスト手順

## 📦 プロトタイプの構成

### 更新されたファイル
- `src/manifest.json` - Chrome拡張機能の設定（Manifest V3対応）
- `src/js/content.js` - 調査結果に基づくContent Script
- `src/css/content.css` - デッキ編集UI改善用CSS

## 🧪 テスト手順

### 1. Chrome拡張機能の読み込み

```bash
# 1. Chromeを起動
# 2. chrome://extensions/ にアクセス
# 3. 「デベロッパーモード」を有効化
# 4. 「パッケージ化されていない拡張機能を読み込む」をクリック
# 5. YGO_deck_extension/src/ フォルダを選択
```

### 2. 動作確認対象ページ

| ページ種別 | URL | 期待動作 |
|------------|-----|----------|
| **デッキ一覧** | `/member_deck.action?ope=4` | ページタイプ検出: `deck_list` |
| **デッキ詳細** | `/member_deck.action?ope=1` | ページタイプ検出: `deck_detail` |
| **デッキ編集** | `/member_deck.action?ope=2` | ページタイプ検出: `deck_edit` |
| **カード検索** | `/card_search.action` | ページタイプ検出: `card_search` |

### 3. 確認項目

#### 基本動作確認
- [ ] 各ページでContent Scriptが正常に読み込まれる
- [ ] ページタイプが正しく検出される
- [ ] サポートパネルが右上に表示される
- [ ] コンソールにログが出力される

#### DOM構造分析
- [ ] `再分析`ボタンクリックでページ構造が分析される
- [ ] Chrome DevTools > Application > Storage > Local Storage で分析結果確認
- [ ] コンソールで`page_analysis`オブジェクト確認

#### CSS適用確認
- [ ] サポートパネルのスタイルが適用される
- [ ] 既存ページレイアウトが破壊されない
- [ ] レスポンシブ表示（画面幅を700px以下にする）

## 🔍 デバッグ方法

### Console Logs の確認

```javascript
// Chrome DevTools > Console で以下のログを確認
"YGO Deck Support - Initializing on page: deck_edit"
"YGO Deck Support - Initializing deck edit features"  
"YGO Deck Support - Page structure analysis:"
"YGO Deck Support - Initialization complete"
```

### ローカルストレージの確認

```javascript
// Chrome DevTools > Application > Local Storage で確認
chrome.storage.local.get(['page_analysis'], (result) => {
    console.log('Stored analysis:', result.page_analysis);
});
```

### DOM要素の確認

```javascript
// Console で実行
document.querySelector('#ygo-deck-support-ui'); // サポートパネル
document.querySelectorAll('table'); // デッキテーブル
document.querySelectorAll('input[type="hidden"]'); // hidden inputs
```

## 📊 期待される分析結果

### デッキ編集ページ（ope=2）で期待される要素

```javascript
{
  timestamp: "2025-06-11T...",
  url: "https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2&...",
  elements: {
    "form[action*=\"member_deck.action\"]": { count: 1, sample: "..." },
    "input[type=\"hidden\"][name=\"ope\"]": { count: 1, sample: "..." },
    "input[type=\"hidden\"][name=\"ytkn\"]": { count: 1, sample: "..." },
    "input[type=\"hidden\"][name=\"cgid\"]": { count: 1, sample: "..." },
    "table": { count: "複数", sample: "..." }
  }
}
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. Content Scriptが読み込まれない
```
原因: manifest.jsonの設定問題
対策: URLパターンの確認、権限設定の確認
```

#### 2. ページタイプが'unknown'になる
```
原因: URL検出ロジックの問題  
対策: URLパラメータ、パス構造の再確認
```

#### 3. DOM要素が見つからない
```
原因: ページ構造の変更、読み込みタイミング
対策: 待機処理の追加、セレクタの見直し
```

#### 4. CSSが適用されない
```
原因: Content Security Policy制限
対策: インラインスタイル回避、CSP準拠CSS
```

## 🎯 成功判定基準

### 最低限の成功基準
- [ ] 4つの主要ページタイプを正しく検出
- [ ] サポートパネルが表示される
- [ ] DOM分析が実行される
- [ ] 既存機能を破壊しない

### 理想的な成功基準  
- [ ] すべてのDOM要素が正しく検出される
- [ ] hidden inputからトークン情報取得
- [ ] テーブル構造の詳細分析
- [ ] jQuery UIライブラリの存在確認

## 📝 結果記録

テスト実行後、以下の情報を記録：

```
実行日時: 
ブラウザ: Chrome バージョン
実行環境: 
成功/失敗: 
発見された問題: 
DOM分析結果: 
改善提案: 
```

## 🚀 次のステップ

プロトタイプテスト成功後の開発方向：

1. **実際のDOM構造に基づく機能実装**
2. **jQuery UIを活用したドラッグ&ドロップ**
3. **Ajax通信の詳細調査**
4. **旧コード(src_old/)との統合検討**