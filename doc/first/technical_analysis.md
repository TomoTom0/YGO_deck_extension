# 技術的詳細解析 - 遊戯王公式DB

## URL構造とパラメータ

### 主要エンドポイント

```
ベースURL: https://www.db.yugioh-card.com/yugiohdb/

【デッキ管理関連】
- デッキ一覧: /member_deck.action?ope=4&wname=MemberDeck&cgid={session_id}
- デッキ詳細: /member_deck.action?ope=1&wname=MemberDeck&ytkn={token}&cgid={session_id}&dno={deck_number}
- デッキ編集: /member_deck.action?ope=2&wname=MemberDeck&cgid={session_id}&dno={deck_number}
- 新規作成: /member_deck.action?ope=6&wname=MemberDeck&ytkn={token}&cgid={session_id}&dno={deck_number}
- デッキコピー: /member_deck.action?ope=8&wname=MemberDeck&cgid={session_id}&dno={deck_number}

【認証関連】
- ログイン: https://my.konami.net/en_US/signin
- 戻りURL: /yugiohdb/ (ログイン後リダイレクト)
```

### パラメータ解析

| パラメータ | 用途 | 例 |
|------------|------|-----|
| `ope` | 操作種別 | 1=詳細, 2=編集, 4=一覧, 6=新規, 8=コピー |
| `wname` | ワークフロー名 | MemberDeck, CardSearch, MyCard |
| `cgid` | セッションID | 3d839f01a4d87b01928c60f262150bec |
| `ytkn` | CSRFトークン | 292a4423781f02dcb948ce0dfa395c931a702f996984197fc226208796251387 |
| `dno` | デッキ番号 | 1, 2, 3... |
| `request_locale` | 言語設定 | ja, en |

## HTML構造解析

### DOM構造の特徴

```html
<!-- 基本レイアウト -->
<div class="container">
  <banner> <!-- ヘッダー・ナビゲーション -->
    <navigation> <!-- メインメニュー -->
      <list> <!-- 機能一覧 -->
  </banner>
  
  <main> <!-- メインコンテンツ -->
    <navigation> <!-- パンくずリスト -->
    <article> <!-- デッキ内容 -->
      <generic> <!-- デッキ情報 -->
      <list> <!-- カードリスト -->
        <listitem> <!-- 各カード -->
  </main>
  
  <contentinfo> <!-- フッター -->
</div>
```

### CSSクラス構造（推測）

```css
/* レイアウト系 */
.container { /* メインコンテナ */ }
.deck-editor { /* デッキ編集エリア */ }
.card-list { /* カードリスト */ }
.deck-sections { /* メイン/エクストラ/サイド分割 */ }

/* 機能系 */
.deck-controls { /* 編集コントロール */ }
.card-item { /* 個別カード */ }
.deck-summary { /* デッキサマリー */ }
```

## JavaScript API 推測

### デッキ操作系API

```javascript
// 推測されるAPI構造
window.DeckEditor = {
  // デッキ編集関連
  addCard: function(cardId, deckType) {},
  removeCard: function(cardId, deckType) {},
  moveCard: function(cardId, fromDeck, toDeck) {},
  
  // デッキ管理
  saveDeck: function() {},
  loadDeck: function(deckId) {},
  
  // 表示制御
  setViewMode: function(mode) {}, // 'text', 'detail', 'image'
  setSortOrder: function(order) {}, // 'register', 'name', 'level'
  
  // バリデーション
  validateDeck: function() {},
  getDeckCounts: function() {}
};
```

### フォーム送信パターン

```html
<!-- 典型的なフォーム構造 -->
<form method="POST" action="/yugiohdb/member_deck.action">
  <input type="hidden" name="ope" value="2" />
  <input type="hidden" name="wname" value="MemberDeck" />
  <input type="hidden" name="cgid" value="{session_id}" />
  <input type="hidden" name="ytkn" value="{csrf_token}" />
  <input type="hidden" name="dno" value="{deck_number}" />
  <!-- カードデータ -->
  <input type="hidden" name="cardData" value="{json_data}" />
</form>
```

## ネットワーク通信

### HTTPヘッダー

```http
# 想定されるリクエストヘッダー
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: ja,en;q=0.5
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID=xxx; KONAMI_ID=xxx
Referer: https://www.db.yugioh-card.com/yugiohdb/
User-Agent: Mozilla/5.0 (compatible browser)
```

### セッション管理

```
【セッション維持】
1. KONAMI ID認証 → セッションCookie取得
2. cgid (セッションID) → サーバーサイドセッション識別
3. ytkn (CSRFトークン) → フォーム送信時のセキュリティ

【有効期限】
- セッションタイムアウト: 推定30分-1時間
- CSRFトークン: ページごとに更新
```

## セキュリティ制約

### Content Security Policy (CSP)

```http
# 推測されるCSPディレクティブ
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
  frame-src 'none';
```

### Chrome拡張機能への影響

```json
// manifest.json での対応
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "permissions": [
    "activeTab",
    "storage",
    "https://www.db.yugioh-card.com/*"
  ],
  "content_scripts": [{
    "matches": ["https://www.db.yugioh-card.com/yugiohdb/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

## パフォーマンス分析

### ページサイズ問題

```
【現在の状況】
- HTML サイズ: 37,000+ トークン (推定150KB+)
- DOM要素数: 数千個
- JavaScript処理: 重い

【影響】
- 初期読み込み時間: 3-5秒
- DOM操作レスポンス: 遅延あり
- メモリ使用量: 高い
```

### 最適化案

```javascript
// Chrome拡張での最適化アプローチ
const optimizer = {
  // 遅延読み込み
  lazyLoadCards: function() {
    // viewport外のカードは後で読み込み
  },
  
  // DOM操作最適化  
  batchDOMUpdates: function() {
    // 複数変更をまとめて実行
  },
  
  // キャッシュ活用
  cacheCardData: function() {
    // ローカルストレージでキャッシュ
  }
};
```

## データ構造

### カード情報構造

```typescript
interface Card {
  id: string;           // カードID
  name: string;         // カード名
  type: string;         // カード種類
  level?: number;       // レベル/ランク/リンク
  attribute?: string;   // 属性
  race?: string;        // 種族
  atk?: number;         // 攻撃力
  def?: number;         // 守備力
  effect: string;       // 効果テキスト
  limitation: number;   // 制限(0=制限なし,1=準制限,2=制限,3=禁止)
}

interface Deck {
  id: string;
  name: string;
  type: 'ocg' | 'speed' | 'duel_links' | 'master_duel';
  main: Card[];         // メインデッキ (40-60枚)
  extra: Card[];        // エクストラデッキ (0-15枚)  
  side: Card[];         // サイドデッキ (0-15枚)
  isPublic: boolean;
  style?: string;       // デッキスタイル
  comment?: string;     // コメント
}
```

## 次回調査項目

1. **JavaScript詳細解析**
   - 実際のAPI関数名の特定
   - イベントハンドラーの構造
   - AJAX通信パターン

2. **CSS詳細調査**  
   - 実際のクラス名とスタイル
   - レスポンシブ対応状況
   - アニメーション実装

3. **エラーハンドリング**
   - バリデーションルール
   - エラーメッセージパターン
   - 復旧メカニズム