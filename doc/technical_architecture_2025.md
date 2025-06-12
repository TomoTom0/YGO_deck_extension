# 遊戯王DBデッキサポート - 技術アーキテクチャ詳細 2025

## 🏗️ システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                    開発・テスト環境                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ローカルPlaywright│  │Chrome拡張機能   │  │自動テストスイート│ │
│  │- 拡張機能読み込み │  │- Manifest v3    │  │- 14項目テスト   │ │
│  │- プロファイル管理 │  │- コンテンツ注入 │  │- 85.7%成功率   │ │
│  │- 自動化制御     │  │- UI改善        │  │- 継続的品質保証 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 注入・実行
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  遊戯王公式サイト (2025年版)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ホームページ      │  │カード検索       │  │デッキ検索       │ │
│  │- クイックアクセス │  │- 拡張検索UI     │  │- 結果表示改善   │ │
│  │- ヘルプ・デバッグ │  │- ステータス表示 │  │- フィルタ機能   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │デッキ編集       │  │デッキ詳細       │  │認証・ログイン    │ │
│  │- MouseUIモード  │  │- 統計情報表示   │  │- KONAMI ID対応  │ │
│  │- 編集支援機能   │  │- Export機能     │  │- セッション管理 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Chrome拡張機能アーキテクチャ

### Manifest v3 構成

```json
{
  "name": "遊戯王DBデッキサポート",
  "version": "3.0.0",
  "manifest_version": 3,
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://www.db.yugioh-card.com/*"],
  "content_scripts": [
    {
      "matches": ["https://www.db.yugioh-card.com/yugiohdb/*"],
      "js": ["js/content.js"],
      "css": ["css/content.css"]
    }
  ]
}
```

### コンテンツスクリプト設計

```javascript
// メインクラス構造
class YGODeckSupport {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.isInitialized = false;
    }
    
    // ページタイプ別初期化
    async init() {
        switch (this.currentPage) {
            case 'deck_edit': this.initDeckEditPage(); break;
            case 'deck_detail': this.initDeckDetailPage(); break;
            case 'card_search': this.initCardSearchPage(); break;
            case 'home': this.initHomePage(); break;
            // ...その他のページタイプ
        }
    }
}
```

## 🎯 ページタイプ検出システム

### URL解析ロジック

```javascript
detectCurrentPage() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const ope = urlParams.get('ope');
    const wname = urlParams.get('wname');
    
    // member_deck.actionの操作種別判定
    if (url.includes('member_deck.action')) {
        return {
            '1': 'deck_detail',  // デッキ詳細表示
            '2': 'deck_edit',    // デッキ編集
            '4': 'deck_list',    // デッキ一覧
            '6': 'deck_new',     // 新規デッキ作成
            '8': 'deck_copy'     // デッキコピー
        }[ope] || 'deck_unknown';
    }
    
    // その他のページタイプ
    if (url.includes('card_search.action')) return 'card_search';
    if (url.includes('deck_search.action')) return 'deck_search';
    if (url.includes('my.konami.net')) return 'konami_login';
    
    return 'unknown';
}
```

### 対応ページマトリックス

| ページタイプ | URL パターン | 主要機能 | 実装状況 |
|------------|-------------|---------|----------|
| `home` | `/yugiohdb/` | クイックアクセス | ✅ 完了 |
| `card_search` | `card_search.action` | 検索UI改善 | ✅ 完了 |
| `deck_search` | `deck_search.action` | 結果表示改善 | ✅ 完了 |
| `deck_edit` | `member_deck.action?ope=2` | MouseUI | 🔄 基盤完了 |
| `deck_detail` | `member_deck.action?ope=1` | 詳細表示 | 🔄 基盤完了 |
| `deck_list` | `member_deck.action?ope=4` | 一覧管理 | 🔄 基盤完了 |
| `konami_login` | `my.konami.net` | 認証支援 | 🔄 基盤完了 |

## 🎨 UI/UX コンポーネント設計

### CSS アーキテクチャ

```css
/* BEM命名規則採用 */
.ygo-support-panel { /* ブロック */ }
.ygo-support-panel__header { /* エレメント */ }
.ygo-support-panel--minimized { /* モディファイア */ }

/* レスポンシブ設計 */
@media (max-width: 768px) {
    .ygo-support-panel {
        position: relative;
        width: 100%;
    }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
    .ygo-support-panel {
        background: #263238;
        color: #E0E0E0;
    }
}
```

### コンポーネント階層

```
UI Components
├── Panel Components
│   ├── QuickAccessPanel (ホーム)
│   ├── ControlPanel (デッキ編集)
│   └── StatusPanel (全ページ)
├── Interactive Components
│   ├── MouseUI (デッキ編集)
│   ├── CardPreview (カード表示)
│   └── DebugDisplay (開発用)
└── Utility Components
    ├── LoadingIndicator
    ├── ErrorDisplay
    └── TooltipManager
```

## 🧪 テスト・品質保証アーキテクチャ

### Playwright テスト環境

```javascript
// テスト実行環境設定
const context = await chromium.launchPersistentContext(
    '/project/chrome-profile',
    {
        headless: false,
        args: [
            '--disable-extensions-except=/project/src',
            '--load-extension=/project/src',
            '--disable-web-security',
            '--no-sandbox'
        ]
    }
);
```

### テストスイート構成

```
Test Architecture
├── Unit Tests (コンポーネント単位)
│   ├── ページ検出テスト
│   ├── UI生成テスト
│   └── 機能動作テスト
├── Integration Tests (統合テスト)
│   ├── ページ遷移テスト
│   ├── 拡張機能読み込みテスト
│   └── UI相互作用テスト
└── E2E Tests (エンドツーエンド)
    ├── 実サイトナビゲーション
    ├── 機能フローテスト
    └── エラーハンドリングテスト
```

### テスト項目マトリックス

| カテゴリ | テスト項目 | 成功条件 | 現在の状況 |
|---------|-----------|---------|----------|
| **基盤** | 拡張機能読み込み | スクリプト注入確認 | ✅ PASS |
| **基盤** | ページタイプ検出 | 正確な判定 | ✅ PASS |
| **UI** | ホームページパネル | 表示・クリック動作 | ✅ PASS |
| **UI** | デバッグ機能 | 情報表示・出力 | ✅ PASS |
| **ナビ** | ページ遷移 | 全ページアクセス | ✅ PASS |
| **エラー** | 例外処理 | エラー時の安定性 | ✅ PASS |
| **改善** | ステータス表示 | 全ページ対応 | ⚠️ PARTIAL |
| **改善** | スクリプト実行 | 検証ロジック | ⚠️ PARTIAL |

## 📊 データフロー・状態管理

### 状態管理設計

```javascript
// グローバル状態オブジェクト
const YGODeckSupport = {
    version: '3.0.0',
    currentPage: '',
    isEnabled: true,
    
    // デッキデータ
    deckData: {
        main: [],
        extra: [],
        side: []
    },
    
    // UI状態
    ui: {
        mouseUIMode: false,
        controlPanel: null,
        cardPreview: null
    },
    
    // 設定・キャッシュ
    settings: {},
    cache: {}
};
```

### データ永続化

```javascript
// Chrome Storage API使用
await chrome.storage.local.set({
    'page_analysis': analysisData,
    'user_preferences': userSettings,
    'deck_cache': deckData
});

// 設定同期
await chrome.storage.sync.set({
    'global_settings': globalConfig
});
```

## 🔍 サイト構造解析システム

### 動的構造分析

```javascript
analyzeDeckEditStructure() {
    const selectors = [
        // フォーム関連
        'form[action*="member_deck.action"]',
        'input[type="hidden"][name="ope"]',
        
        // デッキ構造
        'heading[level="3"]',
        'generic[id*="main"]',
        'generic[id*="extra"]',
        'generic[id*="side"]',
        
        // カード要素
        '.deck_set',
        '.card_s',
        '[class*="deck"]'
    ];
    
    return this.analyzeElements(selectors);
}
```

### APIエンドポイント監視

```javascript
// ネットワーク活動監視
page.on('request', request => {
    const url = request.url();
    if (url.includes('.action') || 
        url.includes('/api/') || 
        url.includes('ajax')) {
        console.log(`API呼び出し: ${request.method()} ${url}`);
    }
});
```

## 🚀 パフォーマンス最適化

### レンダリング最適化

```javascript
// DOM操作の最適化
const fragment = document.createDocumentFragment();
elements.forEach(el => fragment.appendChild(el));
container.appendChild(fragment);

// イベントリスナーの効率化
container.addEventListener('click', (e) => {
    if (e.target.matches('.ygo-card')) {
        this.handleCardClick(e.target);
    }
});
```

### メモリ管理

```javascript
// クリーンアップ機能
cleanup() {
    // イベントリスナー削除
    this.removeEventListeners();
    
    // DOM要素削除
    this.removeDOMElements();
    
    // タイマー削除
    this.clearTimers();
}
```

## 🔒 セキュリティ・プライバシー考慮

### Content Security Policy 対応

```javascript
// インラインスタイル避け、CSS経由で実装
element.className = 'ygo-enhanced-card';

// eval使用回避
const func = new Function('return ' + safeCode);
```

### データ保護

```javascript
// 個人情報の非保存
const publicData = {
    pageType: this.currentPage,
    timestamp: Date.now(),
    // ユーザー識別情報は含めない
};
```

## 📈 監視・ログシステム

### ログレベル設計

```javascript
const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    static log(level, message, data = null) {
        if (level <= this.currentLevel) {
            console.log(`[YGO-${level}] ${message}`, data);
        }
    }
}
```

### メトリクス収集

```javascript
// パフォーマンスメトリクス
const metrics = {
    initTime: performance.now(),
    pageLoadTime: performance.timing.loadEventEnd,
    extensionLoadTime: this.loadTimestamp,
    errorCount: 0,
    featureUsage: {}
};
```

## 🎯 今後の拡張ポイント

### アーキテクチャ拡張計画

1. **モジュール分離** - 機能別ファイル分割
2. **プラグインシステム** - 機能追加の柔軟性
3. **国際化対応** - 多言語サポート基盤
4. **テーマシステム** - カスタマイズ可能UI
5. **API連携** - 外部サービス統合

### 技術スタック進化

- **TypeScript導入** - 型安全性向上
- **Webpack統合** - モジュールバンドリング
- **Jest追加** - ユニットテスト拡充
- **CI/CD** - 自動ビルド・デプロイ