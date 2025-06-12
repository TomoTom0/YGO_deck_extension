# 遊戯王DBデッキサポート API リファレンス v3.1.1

## 📋 概要

遊戯王DBデッキサポート拡張機能は、`window.YGO` グローバルオブジェクトを通じて豊富なAPIを提供します。これらのAPIにより、デッキ管理、カード検索、MouseUI操作などの機能にプログラムからアクセスできます。

## 🌐 グローバルオブジェクト構造

```javascript
window.YGO = {
    DeckSupport: { /* 拡張機能の基本情報とメタデータ */ },
    MouseUI: { /* MouseUIモード関連の操作 */ },
    DeckManager: { /* デッキ管理機能 */ },
    CardSearch: { /* カード検索機能 */ },
    Utils: { /* ユーティリティ関数 */ },
    Events: { /* イベントシステム */ }
}
```

## 🎯 YGO.DeckSupport

拡張機能の基本情報とメタデータを提供します。

### プロパティ

| プロパティ | 型 | 説明 |
|------------|----|----|
| `version` | `string` | 拡張機能のバージョン (例: "3.1.1") |
| `instance` | `YGODeckSupport` | メインクラスのインスタンス |
| `initialized` | `boolean` | 初期化状態 |
| `currentPage` | `string` | 現在のページタイプ |
| `features` | `object` | 利用可能な機能フラグ |

### 使用例

```javascript
// 拡張機能情報の取得
console.log('バージョン:', window.YGO.DeckSupport.version);
console.log('現在のページ:', window.YGO.DeckSupport.currentPage);
console.log('利用可能な機能:', window.YGO.DeckSupport.features);

// 初期化状態の確認
if (window.YGO.DeckSupport.initialized) {
    console.log('拡張機能は正常に初期化されています');
}
```

### features オブジェクト

```javascript
{
    mouseUI: true,     // MouseUIモードが利用可能
    deckAreas: true,   // デッキエリア管理が利用可能
    cardSearch: true,  // カード検索機能が利用可能
    import: true,      // インポート機能が利用可能
    export: true       // エクスポート機能が利用可能
}
```

## 🖱️ YGO.MouseUI

MouseUIモードの操作とデッキ編集機能を提供します。

### メソッド

#### `toggle()` → `void`
MouseUIモードのON/OFFを切り替えます。

```javascript
// MouseUIモードを切り替え
window.YGO.MouseUI.toggle();
```

#### `sort()` → `void`
現在のデッキをソートします（攻撃力、名前、レアリティ等の基準）。

```javascript
// デッキをソート
window.YGO.MouseUI.sort();
```

#### `shuffle()` → `void`
現在のデッキをシャッフルします。

```javascript
// デッキをシャッフル
window.YGO.MouseUI.shuffle();
```

#### `clear()` → `void`
現在のデッキをクリアします。

```javascript
// デッキをクリア
window.YGO.MouseUI.clear();
```

#### `export()` → `void`
現在のデッキをエクスポートします。

```javascript
// デッキをエクスポート
window.YGO.MouseUI.export();
```

#### `import()` → `void`
デッキをインポートします。

```javascript
// デッキをインポート
window.YGO.MouseUI.import();
```

#### `save()` → `void`
現在のデッキを保存します。

```javascript
// デッキを保存
window.YGO.MouseUI.save();
```

### プロパティ

| プロパティ | 型 | 説明 |
|------------|----|----|
| `enabled` | `boolean` | MouseUIモードの有効状態 |

### 使用例

```javascript
// MouseUIモードの状態確認
if (window.YGO.MouseUI.enabled) {
    console.log('MouseUIモードは有効です');
} else {
    console.log('MouseUIモードは無効です');
}

// 一連のデッキ操作
window.YGO.MouseUI.toggle();  // MouseUIモードを有効化
window.YGO.MouseUI.shuffle(); // デッキをシャッフル
window.YGO.MouseUI.sort();    // ソート
window.YGO.MouseUI.save();    // 保存
```

## 🃏 YGO.DeckManager

デッキ管理機能を提供します。デッキの構成、カードの追加・削除、エリア管理が可能です。

### プロパティ

| プロパティ | 型 | 説明 |
|------------|----|----|
| `mainDeck` | `Array` | メインデッキのカード配列 |
| `extraDeck` | `Array` | エクストラデッキのカード配列 |
| `sideDeck` | `Array` | サイドデッキのカード配列 |

### メソッド

#### `getDeckInfo()` → `object`
現在のデッキ構成情報を取得します。

**戻り値:**
```javascript
{
    main: number,   // メインデッキの枚数
    extra: number,  // エクストラデッキの枚数
    side: number,   // サイドデッキの枚数
    total: number   // 総カード数
}
```

#### `addCard(card, area)` → `void`
指定されたエリアにカードを追加します。

**パラメータ:**
- `card` (object): 追加するカード情報
- `area` (string): 追加先エリア ('main', 'extra', 'side')

#### `removeCard(cardId, area)` → `void`
指定されたエリアからカードを削除します。

**パラメータ:**
- `cardId` (string): 削除するカードID
- `area` (string): 削除元エリア ('main', 'extra', 'side')

#### `clearDeck(area)` → `void`
指定されたデッキエリアをクリアします。

**パラメータ:**
- `area` (string): クリア対象エリア ('main', 'extra', 'side')

### 使用例

```javascript
// デッキ情報の取得
const deckInfo = window.YGO.DeckManager.getDeckInfo();
console.log(`メイン: ${deckInfo.main}枚, エクストラ: ${deckInfo.extra}枚, サイド: ${deckInfo.side}枚`);
console.log(`総計: ${deckInfo.total}枚`);

// カードの操作
const newCard = { id: '12345', name: 'ブルーアイズ・ホワイト・ドラゴン' };
window.YGO.DeckManager.addCard(newCard, 'main');
window.YGO.DeckManager.removeCard('12345', 'main');

// エリアのクリア
window.YGO.DeckManager.clearDeck('side');
```

## 🔍 YGO.CardSearch

カード検索機能を提供します。

### プロパティ

| プロパティ | 型 | 説明 |
|------------|----|----|
| `searchTerm` | `string` | 現在の検索キーワード |
| `results` | `Array` | 検索結果のカード配列 |

### メソッド

#### `search(term)` → `Array`
指定されたキーワードでカード検索を実行します。

**パラメータ:**
- `term` (string): 検索キーワード

**戻り値:**
- `Array`: 検索結果のカード配列

#### `filter(criteria)` → `Array`
指定された条件でカードをフィルタリングします。

**パラメータ:**
- `criteria` (object): フィルタリング条件

**戻り値:**
- `Array`: フィルタリング結果のカード配列

#### `getCardInfo(cardId)` → `object`
指定されたカードIDの詳細情報を取得します。

**パラメータ:**
- `cardId` (string): カードID

**戻り値:**
- `object`: カード詳細情報

### 使用例

```javascript
// カード検索
const searchResults = window.YGO.CardSearch.search('青眼');
console.log('検索結果:', searchResults);

// フィルタリング
const filterCriteria = {
    type: 'モンスター',
    attribute: '光',
    attack: { min: 2500 }
};
const filteredCards = window.YGO.CardSearch.filter(filterCriteria);

// カード詳細情報取得
const cardInfo = window.YGO.CardSearch.getCardInfo('89631139');
console.log('カード詳細:', cardInfo);

// 現在の検索状態
console.log('現在の検索キーワード:', window.YGO.CardSearch.searchTerm);
console.log('検索結果数:', window.YGO.CardSearch.results.length);
```

## 🔧 YGO.Utils

ユーティリティ関数を提供します。

### メソッド

#### `getPageType()` → `string`
現在のページタイプを取得します。

**戻り値:**
- `string`: ページタイプ ('home', 'deck_edit', 'deck_detail', 'card_search' など)

#### `isExtensionLoaded()` → `boolean`
拡張機能の読み込み状態を確認します。

**戻り値:**
- `boolean`: 拡張機能が読み込まれている場合 `true`

#### `getVersion()` → `string`
拡張機能のバージョンを取得します。

**戻り値:**
- `string`: バージョン文字列

#### `reload()` → `void`
拡張機能を再初期化します。

#### `debug()` → `void`
デバッグ情報を表示します。

### 使用例

```javascript
// 基本情報の取得
console.log('ページタイプ:', window.YGO.Utils.getPageType());
console.log('バージョン:', window.YGO.Utils.getVersion());
console.log('読み込み状態:', window.YGO.Utils.isExtensionLoaded());

// デバッグ情報表示
window.YGO.Utils.debug();

// 拡張機能の再初期化
window.YGO.Utils.reload();
```

## 📡 YGO.Events

イベントシステムを提供します。拡張機能の動作にイベントリスナーを登録できます。

### メソッド

#### `on(event, callback)` → `void`
イベントリスナーを登録します。

**パラメータ:**
- `event` (string): イベント名
- `callback` (function): コールバック関数

#### `emit(event, data)` → `void`
イベントを発火します。

**パラメータ:**
- `event` (string): イベント名  
- `data` (any): イベントデータ

### プロパティ

| プロパティ | 型 | 説明 |
|------------|----|----|
| `listeners` | `object` | 登録されたイベントリスナーの管理オブジェクト |

### イベント一覧

| イベント名 | データ | 説明 |
|------------|--------|------|
| `cardAdded` | `{card, area}` | カードがデッキに追加された |
| `cardRemoved` | `{cardId, area}` | カードがデッキから削除された |
| `deckAreaCleared` | `{area}` | デッキエリアがクリアされた |
| `cardSearched` | `{term}` | カード検索が実行された |
| `cardFiltered` | `{criteria}` | カードフィルタリングが実行された |

### 使用例

```javascript
// イベントリスナーの登録
window.YGO.Events.on('cardAdded', (data) => {
    console.log(`カードが追加されました: ${data.card.name} → ${data.area}`);
});

window.YGO.Events.on('cardRemoved', (data) => {
    console.log(`カードが削除されました: ${data.cardId} from ${data.area}`);
});

window.YGO.Events.on('cardSearched', (data) => {
    console.log(`カード検索実行: ${data.term}`);
});

// カスタムイベントの発火
window.YGO.Events.emit('customEvent', { message: 'Hello World' });

// 複数のイベントリスナー登録
const events = ['cardAdded', 'cardRemoved', 'deckAreaCleared'];
events.forEach(event => {
    window.YGO.Events.on(event, (data) => {
        console.log(`イベント発生: ${event}`, data);
    });
});
```

## 🛠️ 高度な使用例

### デッキ分析ツール

```javascript
function analyzeDeck() {
    const deckInfo = window.YGO.DeckManager.getDeckInfo();
    
    console.log('=== デッキ分析 ===');
    console.log(`メインデッキ: ${deckInfo.main}枚`);
    console.log(`エクストラデッキ: ${deckInfo.extra}枚`);
    console.log(`サイドデッキ: ${deckInfo.side}枚`);
    console.log(`総計: ${deckInfo.total}枚`);
    
    // デッキの妥当性チェック
    if (deckInfo.main < 40) {
        console.warn('⚠️ メインデッキが40枚未満です');
    }
    if (deckInfo.extra > 15) {
        console.warn('⚠️ エクストラデッキが15枚を超えています');
    }
}

// 使用例
analyzeDeck();
```

### リアルタイムデッキ監視

```javascript
class DeckMonitor {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.YGO.Events.on('cardAdded', this.onCardAdded.bind(this));
        window.YGO.Events.on('cardRemoved', this.onCardRemoved.bind(this));
        window.YGO.Events.on('deckAreaCleared', this.onDeckCleared.bind(this));
    }
    
    onCardAdded(data) {
        console.log(`✅ カード追加: ${data.card.name} → ${data.area}`);
        this.updateDeckStatus();
    }
    
    onCardRemoved(data) {
        console.log(`❌ カード削除: ${data.cardId} ← ${data.area}`);
        this.updateDeckStatus();
    }
    
    onDeckCleared(data) {
        console.log(`🗑️ エリアクリア: ${data.area}`);
        this.updateDeckStatus();
    }
    
    updateDeckStatus() {
        const deckInfo = window.YGO.DeckManager.getDeckInfo();
        console.log(`📊 現在の構成: M${deckInfo.main}/E${deckInfo.extra}/S${deckInfo.side}`);
    }
}

// 使用例
const monitor = new DeckMonitor();
```

### カスタムカード検索

```javascript
async function searchAndFilter(keyword, filterOptions = {}) {
    // カード検索実行
    const searchResults = window.YGO.CardSearch.search(keyword);
    
    // フィルタリング条件の適用
    const filteredResults = window.YGO.CardSearch.filter({
        type: filterOptions.type || '',
        attribute: filterOptions.attribute || '',
        race: filterOptions.race || '',
        ...filterOptions
    });
    
    console.log(`検索結果: ${searchResults.length}件`);
    console.log(`フィルタ後: ${filteredResults.length}件`);
    
    return filteredResults;
}

// 使用例
searchAndFilter('ドラゴン', {
    type: 'モンスター',
    attribute: '光',
    attack: { min: 2000 }
}).then(results => {
    console.log('検索完了:', results);
});
```

## ⚠️ 注意事項

### API利用時の注意点

1. **初期化確認**: APIを使用する前に `window.YGO.DeckSupport.initialized` を確認してください
2. **ページタイプ**: 一部のAPIは特定のページでのみ動作します
3. **エラーハンドリング**: ネットワークエラーや予期しない状況に対する適切な処理を実装してください
4. **パフォーマンス**: 大量のカード操作時はバッチ処理を検討してください

### エラーハンドリング例

```javascript
try {
    // API利用前の確認
    if (!window.YGO || !window.YGO.DeckSupport.initialized) {
        throw new Error('拡張機能が初期化されていません');
    }
    
    // API使用
    const deckInfo = window.YGO.DeckManager.getDeckInfo();
    console.log('デッキ情報:', deckInfo);
    
} catch (error) {
    console.error('API実行エラー:', error);
}
```

## 🔄 バージョン互換性

| バージョン | 変更点 | 非互換性 |
|------------|-------|---------|
| v3.1.1 | 安定性向上、バグ修正 | なし |
| v3.1.0 | グローバルYGOオブジェクト追加 | 一部メソッド名変更 |
| v3.0.0 | Manifest v3対応、アーキテクチャ刷新 | 全面的な再設計 |

---

**最終更新**: 2025年6月12日  
**対応バージョン**: v3.1.1  
**API仕様**: Stable