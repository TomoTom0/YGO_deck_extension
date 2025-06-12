# 遊戯王DBデッキサポート - 開発ガイド 2025

## 🚀 クイックスタート

### 必要な環境
- **Node.js** 18+ 
- **Chrome** 120+
- **Git**

### 初期セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd YGO_deck_extension

# 依存関係インストール
npm install

# 基本テスト実行
node test-extension.js
```

### Chrome拡張機能インストール

1. Chromeで `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `src/` フォルダを選択

## 🧪 開発・テストワークフロー

### 1. 基本開発サイクル

```bash
# 1. コード変更
vim src/js/content.js

# 2. 拡張機能リロード (Chrome extensions画面で更新ボタン)

# 3. 基本テスト実行
node test-extension.js

# 4. 包括テスト実行
node comprehensive-test.js
```

### 2. サイト調査・分析

```bash
# サイト構造調査
node site-investigation.js

# デッキページ詳細分析
node deck-analysis.js
```

### 3. デバッグ手順

```bash
# 1. デバッグモードでテスト実行
DEBUG=1 node test-extension.js

# 2. Chromeコンソールでログ確認
# F12 > Console > "YGO Deck Support" で検索

# 3. 拡張機能の状態確認
# Chrome > Extensions > 遊戯王DBデッキサポート > Details > Inspect views
```

## 📁 プロジェクト構造詳細

```
YGO_deck_extension/
├── 📁 src/                    # Chrome拡張機能本体
│   ├── manifest.json          # 拡張機能設定
│   ├── 📁 js/
│   │   ├── content.js         # メインスクリプト
│   │   ├── content-debug.js   # デバッグ用
│   │   ├── popup.js           # ポップアップ
│   │   └── options.js         # オプション画面
│   ├── 📁 css/
│   │   └── content.css        # スタイルシート
│   ├── 📁 images/             # アイコン類
│   ├── popup.html
│   └── options.html
├── 📁 doc/                    # ドキュメント
├── 📁 chrome-profile/         # Chromeプロファイル (gitignore)
├── 📁 test-scripts/           # テストスクリプト
│   ├── test-extension.js      # 基本テスト
│   ├── comprehensive-test.js  # 包括テスト
│   ├── site-investigation.js  # サイト調査
│   └── deck-analysis.js       # デッキ分析
├── package.json
└── .gitignore
```

## ⚙️ 設定・カスタマイズ

### Chrome拡張機能設定

#### manifest.json の主要設定

```json
{
  "permissions": [
    "storage",      // データ保存
    "activeTab",    // アクティブタブアクセス
    "scripting"     // スクリプト注入
  ],
  "host_permissions": [
    "https://www.db.yugioh-card.com/*"  // 対象サイト
  ],
  "content_scripts": [
    {
      "matches": ["https://www.db.yugioh-card.com/yugiohdb/*"],
      "js": ["js/content.js"],
      "css": ["css/content.css"]
    }
  ]
}
```

### Playwright設定

#### テストスクリプトの設定

```javascript
const context = await chromium.launchPersistentContext(
    '/path/to/chrome-profile',
    {
        headless: false,           // ブラウザ表示
        args: [
            '--disable-extensions-except=/path/to/src',
            '--load-extension=/path/to/src',
            '--disable-web-security',
            '--no-sandbox'
        ]
    }
);
```

## 🔧 開発時の重要ポイント

### 1. ページタイプ検出

```javascript
// 新しいページタイプを追加する場合
detectCurrentPage() {
    const url = window.location.href;
    
    // 新しいパターンを追加
    if (url.includes('new_feature.action')) {
        return 'new_feature';
    }
    
    // 既存のロジック...
}

// 対応する初期化関数を追加
initNewFeaturePage() {
    console.log('新機能ページ初期化');
    // 機能実装...
}
```

### 2. UI要素の追加

```javascript
// UI要素追加の基本パターン
addUIElement() {
    // 既存要素の重複チェック
    const existing = document.getElementById('ygo-new-element');
    if (existing) existing.remove();
    
    // 新要素作成
    const element = document.createElement('div');
    element.id = 'ygo-new-element';
    element.innerHTML = `<div class="ygo-panel">...</div>`;
    
    // 適切な場所に挿入
    const target = document.querySelector('article') || document.body;
    target.appendChild(element);
    
    // イベントリスナー追加
    this.attachEventListeners(element);
}
```

### 3. CSS スタイリング

```css
/* 新しいUI要素のスタイル */
#ygo-new-element {
    /* 基本スタイル */
    position: relative;
    margin: 10px 0;
    z-index: 9999;
}

.ygo-panel {
    /* パネル共通スタイル */
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    #ygo-new-element {
        width: 100%;
        margin: 5px;
    }
}
```

## 🧪 テスト作成ガイド

### 新しいテストの追加

```javascript
// comprehensive-test.js に追加
async testNewFeature() {
    console.log('🆕 新機能テスト');
    
    await this.page.goto('https://target-url');
    await this.page.waitForLoadState('networkidle');
    
    // テストロジック
    const featureElement = await this.page.locator('#ygo-new-feature');
    const isVisible = await featureElement.isVisible();
    
    this.addTestResult('新機能表示', isVisible, '新機能が正常に表示されるか');
}

// runAllTests() メソッドに追加
async runAllTests() {
    // 既存テスト...
    await this.testNewFeature();
    // ...
}
```

### サイト調査スクリプトの拡張

```javascript
// site-investigation.js に追加
async investigateNewPage() {
    console.log('🔍 新ページ調査中...');
    
    await page.goto('https://new-page-url');
    await page.waitForLoadState('networkidle');
    
    // 要素分析
    const elements = await page.locator('.new-element').all();
    console.log(`📊 新要素数: ${elements.length}`);
    
    // 構造分析
    if (elements.length > 0) {
        const firstElement = elements[0];
        const html = await firstElement.innerHTML();
        console.log('🎯 要素構造:', html.substring(0, 200));
    }
}
```

## 🚨 トラブルシューティング

### よくある問題と解決法

#### 1. 拡張機能が読み込まれない

```bash
# 1. manifest.json の構文確認
node -e "console.log(JSON.parse(require('fs').readFileSync('src/manifest.json')))"

# 2. ファイルパスの確認
ls -la src/js/content.js

# 3. Chrome拡張機能ページでエラー確認
# chrome://extensions/ > エラーメッセージを確認
```

#### 2. コンテンツスクリプトが実行されない

```javascript
// デバッグ用コードを追加
console.log('🎮 スクリプト読み込み開始');
window.YGO_DEBUG = true;

// 読み込み確認用グローバル変数
window.YGO_EXTENSION_LOADED = true;
```

#### 3. Playwrightテストが失敗する

```javascript
// タイムアウト調整
await page.waitForLoadState('networkidle', { timeout: 30000 });

// 要素待機
await page.waitForSelector('#ygo-element', { timeout: 10000 });

// エラーログ確認
page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
page.on('pageerror', error => console.error(`[ERROR] ${error.message}`));
```

#### 4. CSS スタイルが適用されない

```css
/* 詳細度を上げる */
#ygo-element.ygo-panel {
    background: blue !important;
}

/* 既存スタイルとの競合回避 */
.ygo-custom-style {
    all: initial;
    /* カスタムスタイル */
}
```

## 📊 パフォーマンス最適化

### 1. DOM操作の最適化

```javascript
// 非効率な例
elements.forEach(el => {
    document.body.appendChild(el); // 複数回リフロー
});

// 効率的な例
const fragment = document.createDocumentFragment();
elements.forEach(el => fragment.appendChild(el));
document.body.appendChild(fragment); // 1回のリフロー
```

### 2. イベントリスナーの最適化

```javascript
// 非効率な例
cards.forEach(card => {
    card.addEventListener('click', handleClick);
});

// 効率的な例（イベント委譲）
container.addEventListener('click', (e) => {
    if (e.target.matches('.card')) {
        handleClick(e);
    }
});
```

### 3. メモリリーク対策

```javascript
// クリーンアップ関数の実装
class FeatureManager {
    constructor() {
        this.eventListeners = [];
        this.timers = [];
    }
    
    addEventListeners(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    cleanup() {
        // イベントリスナー削除
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // タイマー削除
        this.timers.forEach(timer => clearTimeout(timer));
    }
}
```

## 🔄 継続的改善

### コードレビューチェックリスト

- [ ] manifest.json の構文正確性
- [ ] console.log の本番用調整
- [ ] CSS の詳細度適切性
- [ ] メモリリーク対策
- [ ] エラーハンドリング
- [ ] ユーザビリティ
- [ ] パフォーマンス影響
- [ ] セキュリティ考慮

### 品質指標

```bash
# テスト成功率確認
node comprehensive-test.js | grep "成功率"

# パフォーマンス測定
node performance-test.js

# コード品質チェック
npm run lint  # 将来実装予定
```

## 📚 参考資料

### Chrome拡張機能開発
- [Chrome Extensions Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)

### Playwright自動化
- [Playwright Documentation](https://playwright.dev/)
- [Chrome Extension Testing](https://playwright.dev/docs/chrome-extensions)

### 遊戯王公式サイト
- [公式カードデータベース](https://www.db.yugioh-card.com/yugiohdb/)
- [KONAMI ID](https://my.konami.net/)

## 📞 サポート・コミュニティ

### 開発支援
- **GitHub Issues**: バグ報告・機能要望
- **Documentation**: `doc/` フォルダ内資料
- **Test Reports**: `test-report.json` 詳細結果

### 貢献方法
1. Fork リポジトリ
2. Feature ブランチ作成
3. 変更実装・テスト
4. Pull Request 作成