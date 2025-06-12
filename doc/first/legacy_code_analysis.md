# 旧コード(src_old/)分析レポート

## 📋 旧実装の概要

バージョン2.16.0.0の遊戯王DBデッキサポート拡張機能の詳細分析結果。

## 🗂️ ファイル構成

### JavaScript実装
| ファイル | 役割 | 重要度 |
|----------|------|--------|
| `main_functions.js` | **コア機能・ユーティリティ** | ⭐⭐⭐ |
| `content_script.js` | **メインContent Script** | ⭐⭐⭐ |
| `db_functions.js` | **データベース操作・カードデータ** | ⭐⭐⭐ |
| `card_search_script.js` | カード検索機能 | ⭐⭐ |
| `listen.js` | イベントハンドリング | ⭐⭐ |
| `screenshot_functions.js` | スクリーンショット機能 | ⭐ |
| `popup.js` | ポップアップUI | ⭐ |
| `options.js` | 設定画面 | ⭐ |

### 外部ライブラリ
- `jquery-3.7.1.min.js` - DOM操作
- `html2canvas.min.js` - スクリーンショット生成
- `async.min.js` - 非同期処理
- `qrcode.min.js` - QRコード生成

## 🔍 主要機能分析

### 1. 設定システム（main_functions.js）

```javascript
const defaultSettings = {
    autoUpdateDB: true,
    valid_feature_importExport: true,     // Import/Export機能
    valid_feature_sortShuffle: true,      // Sort/Shuffle機能
    valid_feature_deckHeader: true,       // ヘッダー表示制御
    valid_feature_deckEditImage: true,    // 画像編集機能
    valid_feature_deckManager: true,      // デッキ管理機能
    valid_feature_saveDeckImage: true,    // デッキ画像保存
    // ... その他の設定
};
```

**活用価値**: ⭐⭐⭐
- 機能のオン/オフ制御システム
- ユーザー設定の永続化
- デフォルト値管理

### 2. SVGアイコンシステム

```javascript
const svgs = {
    shuffle: `<svg>...</svg>`,
    sort: `<svg>...</svg>`,
    delete: `<svg>...</svg>`,
    // ... 15個以上のアイコン
};
```

**活用価値**: ⭐⭐⭐
- 統一されたアイコンデザイン
- スケーラブルな表示
- 軽量なリソース

### 3. DOM操作ユーティリティ

```javascript
const createElement = (tag, attr = {}, append = null, flag_forceAppend = false) => {
    const el = document.createElement(tag);
    Object.entries(attr).forEach(([key, value]) => el.setAttribute(key, value));
    // ...
    return el;
}

const addStyle = (element, style_dic) => {
    Object.entries(style_dic).forEach(([key, value]) => element.style[key] = value);
    return element;
}
```

**活用価値**: ⭐⭐⭐
- 効率的なDOM操作
- 一貫したコーディングスタイル
- エラー耐性のある実装

### 4. URL解析システム（content_script.js）

```javascript
const html_parse_dic = parse_YGODB_URL(url_now, true);
const url_body = parse_YGODB_URL_body(url_now);
if (url_body !== "member_deck.action") return;
```

**活用価値**: ⭐⭐⭐
- 遊戯王DB固有のURL構造理解
- ページタイプの確実な判定
- 条件分岐による機能制御

### 5. デッキ編集画面での機能追加

```javascript
if (["2", "8"].indexOf(html_parse_dic.ope) !== -1) {
    const IsCopyMode = html_parse_dic.ope === "8";
    const area_bottom = document.getElementById("bottom_btn_set");
    
    const button_bottom_dic = {
        back: createElement("a", {...}, svgs.arrowBack),
        headerShowHide: createElement("a", {...}, svgs.toc),
        export: createElement("a", {...}, svgs.download),
        // ...
    };
}
```

**活用価値**: ⭐⭐⭐
- 実際のHTML要素ID (`bottom_btn_set`) 判明
- ボタン配置パターンの実装例
- 機能別の条件分岐ロジック

### 6. データベース機能（db_functions.js）

```javascript
const defaultRepoInfo = {
    CDB: { user: "ProjectIgnis", repo: "BabelCDB", path: "" },
    ConstantLua: { user: "NaimSantos", repo: "DataEditorX", path: "..." },
    MyRepo: { user: "TomoTom0", repo: "ygo_db", path: "data/ygo_db.json" }
}

const obtainDF = async (lang = null) => { /* カードデータ取得 */ }
```

**活用価値**: ⭐⭐
- カードデータベースの取得・更新システム
- 外部リポジトリとの連携
- 多言語対応機能

## 🎯 再利用可能な部分

### 高優先度（即座に活用）

1. **設定システム**
   ```javascript
   // src/js/content.js に統合
   const settings = await operateStorage({ settings: "{}" }, "sync")
   ```

2. **DOM操作ユーティリティ**
   ```javascript
   // src/js/utils.js として分離
   const { createElement, addStyle, addAttr } = utils;
   ```

3. **SVGアイコン**
   ```javascript
   // src/js/icons.js として分離
   import { svgs } from './icons.js';
   ```

4. **URL解析**
   ```javascript
   // 現在のdetectCurrentPage()関数を強化
   const html_parse_dic = parse_YGODB_URL(location.href, true);
   ```

### 中優先度（改修して活用）

1. **デッキ操作機能**
   - Import/Export機能の基盤
   - Sort/Shuffle機能
   - スクリーンショット機能

2. **UI改善機能**
   - ヘッダー表示制御
   - デッキ画像表示切り替え
   - レスポンシブ対応

### 低優先度（参考程度）

1. **外部データベース連携**
   - ProjectIgnis/BabelCDB連携
   - DataEditorX連携
   - 自動更新機能

## 🔄 移植戦略

### Phase 1: コアユーティリティの統合
```javascript
// 1. main_functions.js から抽出
//    - createElement, addStyle, addAttr
//    - svgs オブジェクト
//    - defaultSettings

// 2. content_script.js から抽出  
//    - URL解析関数
//    - ページ判定ロジック
//    - DOM要素検索パターン
```

### Phase 2: 機能モジュールの実装
```javascript
// 1. 設定管理モジュール
// 2. UI部品モジュール  
// 3. デッキ操作モジュール
// 4. Import/Export モジュール
```

### Phase 3: 高度機能の実装
```javascript
// 1. MouseUI（ドラッグ&ドロップ）
// 2. スクリーンショット機能
// 3. データベース連携
```

## ⚠️ 注意点

### 1. 依存関係の整理
```javascript
// 旧実装で使用されていた外部ライブラリ
// - jQuery 3.7.1 (必須)
// - html2canvas (スクリーンショット用)
// - qrcode.js (QRコード生成用)
// - async.js (非同期処理用)
```

### 2. 公式サイト構造の変更対応
```javascript
// 旧実装で使用されていた要素ID
document.getElementById("bottom_btn_set") // ボタン配置エリア
document.getElementById("footer_icon")     // フッターアイコン

// 現在のサイトで要確認
```

### 3. Manifest V3対応
```javascript
// 旧manifest.json から新manifest.json への移行
// - permissions の整理
// - content_scripts の最適化
// - web_accessible_resources の調整
```

## 📊 コード品質評価

| 項目 | 評価 | コメント |
|------|------|----------|
| **アーキテクチャ** | ⭐⭐⭐ | モジュール化され、再利用性が高い |
| **エラーハンドリング** | ⭐⭐ | 基本的な処理はあるが改善余地あり |
| **パフォーマンス** | ⭐⭐ | jQuery依存、最適化の余地あり |
| **保守性** | ⭐⭐⭐ | コメント豊富、構造が明確 |
| **機能性** | ⭐⭐⭐ | 豊富な機能、実用性が高い |

## 🚀 次のアクション

1. **utils.js モジュール作成** - DOM操作ユーティリティ
2. **icons.js モジュール作成** - SVGアイコン定義
3. **settings.js モジュール作成** - 設定管理システム
4. **URL解析機能の統合** - 現在のdetectCurrentPage()強化
5. **ボタン配置システムの実装** - bottom_btn_set への機能追加

調査日時: 2025年6月11日  
対象: src_old/ 全体（8ファイル、4外部ライブラリ）  
結論: **高い再利用価値、段階的移植が最適**