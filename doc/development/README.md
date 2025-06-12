# 遊戯王DBデッキサポート 開発ガイド v3.1.1

## 📋 開発概要

遊戯王DBデッキサポート拡張機能の開発に参加するための包括的なガイドです。Chrome Extension Manifest v3、Playwright テスト、モダンなJavaScript開発手法を採用しています。

## 🚀 開発環境セットアップ

### 必要な環境

| ツール | バージョン | 必須度 |
|-------|-----------|-------|
| **Node.js** | 18.0+ | 必須 |
| **npm** | 9.0+ | 必須 |
| **Google Chrome** | 120+ | 必須 |
| **Git** | 2.30+ | 必須 |
| **VSCode** | 最新 | 推奨 |

### 初期セットアップ

```bash
# 1. リポジトリのフォーク & クローン
git clone https://github.com/[your-username]/YGO_deck_extension.git
cd YGO_deck_extension

# 2. 依存関係のインストール
npm install

# 3. Playwright ブラウザのインストール
npx playwright install chromium

# 4. 拡張機能の動作確認
node test-extension.js
```

### VSCode推奨拡張機能

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-playwright.playwright",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### プロジェクト設定

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.js": "javascript",
    "*.json": "jsonc"
  }
}
```

## 🏗️ プロジェクト構造詳細

```
YGO_deck_extension/
├── 📁 src/                           # Chrome拡張機能本体
│   ├── manifest.json                 # 拡張機能設定 (Manifest v3)
│   ├── 📁 js/
│   │   ├── content.js                # メインスクリプト (1000+ lines)
│   │   ├── content-debug.js          # デバッグ用スクリプト
│   │   ├── popup.js                  # ポップアップ機能
│   │   └── options.js                # オプションページ
│   ├── 📁 css/
│   │   └── content.css               # スタイルシート
│   ├── 📁 images/                    # アイコン・画像
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   ├── popup.html                    # ポップアップHTML
│   └── options.html                  # オプションページHTML
├── 📁 doc/                           # プロジェクトドキュメント
│   ├── README.md                     # プロジェクト概要
│   ├── 📁 api/
│   │   └── README.md                 # API仕様書
│   ├── 📁 testing/
│   │   └── README.md                 # テストガイド
│   └── 📁 development/
│       └── README.md                 # 開発ガイド (このファイル)
├── 📁 playwright/                    # E2Eテスト
│   ├── playwright.config.js          # Playwright設定
│   ├── chrome-extension-config.js    # 拡張機能テスト設定
│   └── 📁 tests/
│       └── extension-functionality.spec.js
├── 📁 data/                          # カードデータベース
│   ├── ygo_db_simple.tsv             # カード基本情報
│   └── fromConstant.tsv              # 定数データ
├── 📁 docker/                        # データ更新システム
├── 📁 chrome-profile/                # Chrome テストプロファイル (gitignore)
├── test-extension.js                 # 基本テストスクリプト
├── comprehensive-test.js             # 包括テストスクリプト
├── package.json                      # Node.js設定
├── .gitignore                        # Git除外設定
└── README.md                         # プロジェクトREADME
```

## 🔄 開発ワークフロー

### 1. 基本開発サイクル

```bash
# 1. 新しい機能ブランチの作成
git checkout -b feature/new-awesome-feature

# 2. コード変更
vim src/js/content.js

# 3. Chrome拡張機能のリロード
# Chrome > 拡張機能 > 遊戯王DBデッキサポート > 更新ボタン

# 4. 基本テスト実行
node test-extension.js

# 5. 包括テスト実行
node comprehensive-test.js

# 6. Playwright E2Eテスト
npx playwright test

# 7. コミット & プッシュ
git add .
git commit -m "feat: Add awesome new feature"
git push origin feature/new-awesome-feature

# 8. Pull Request作成
```

### 2. 継続的品質管理

```bash
# 日次品質チェック
npm run quality-check

# 週次完全テスト
npm run full-test

# 月次パフォーマンステスト
npm run performance-test
```

### 3. リリースプロセス

```bash
# バージョン更新
npm version patch  # v3.1.1 → v3.1.2

# リリースブランチ作成
git checkout -b release/v3.1.2

# 最終テスト実行
npm run release-test

# マージ & タグ付け
git checkout main
git merge release/v3.1.2
git tag v3.1.2
git push origin main --tags
```

## 🛠️ 開発ツールとスクリプト

### NPMスクリプト

```json
// package.json
{
  "scripts": {
    "test": "node test-extension.js",
    "test:full": "node comprehensive-test.js",
    "test:e2e": "npx playwright test",
    "test:debug": "DEBUG=1 node comprehensive-test.js",
    "lint": "eslint src/js/**/*.js",
    "lint:fix": "eslint src/js/**/*.js --fix",
    "format": "prettier --write src/**/*.{js,html,css}",
    "dev": "node dev-server.js",
    "build": "node build-extension.js",
    "analyze": "node analyze-code.js"
  }
}
```

### 開発用スクリプト

#### 自動リロード開発サーバー
```javascript
// dev-server.js (実装予定)
const chokidar = require('chokidar');
const { exec } = require('child_process');

const watcher = chokidar.watch('src/**/*');

watcher.on('change', (path) => {
  console.log(`ファイル変更検出: ${path}`);
  
  // 拡張機能の自動リロード
  exec('node reload-extension.js', (error, stdout) => {
    if (error) {
      console.error(`リロードエラー: ${error}`);
    } else {
      console.log('拡張機能リロード完了');
    }
  });
});
```

#### コード品質チェック
```javascript
// quality-check.js
const { exec } = require('child_process');

async function runQualityChecks() {
  console.log('🔍 コード品質チェック開始...');
  
  // ESLint実行
  await runCommand('npm run lint');
  
  // Prettier実行
  await runCommand('npm run format');
  
  // テスト実行
  await runCommand('npm test');
  
  console.log('✅ 品質チェック完了');
}

runQualityChecks();
```

## 🧪 テスト開発

### テストの種類と責任

| テスト種別 | 実行頻度 | 担当 | 目的 |
|------------|----------|------|------|
| **単体テスト** | コミット毎 | 開発者 | 関数・クラス単位の動作確認 |
| **統合テスト** | PR毎 | 開発者 | モジュール間の連携確認 |
| **E2Eテスト** | リリース前 | QA | ユーザー操作シナリオ確認 |
| **パフォーマンステスト** | 週次 | 開発者 | 性能劣化の早期発見 |

### 新しいテストケースの作成

#### 単体テスト例
```javascript
// tests/unit/deck-manager.test.js (準備中)
const { YGODeckSupport } = require('../../src/js/content.js');

describe('DeckManager', () => {
  let deckSupport;
  
  beforeEach(() => {
    deckSupport = new YGODeckSupport();
  });
  
  test('getDeckInfo returns correct deck information', () => {
    // テスト実装
    const deckInfo = deckSupport.getDeckInfo();
    
    expect(deckInfo).toHaveProperty('main');
    expect(deckInfo).toHaveProperty('extra');
    expect(deckInfo).toHaveProperty('side');
    expect(deckInfo).toHaveProperty('total');
  });
});
```

#### E2Eテスト例
```javascript
// playwright/tests/new-feature.spec.js
const { test, expect } = require('@playwright/test');

test.describe('新機能テスト', () => {
  test('新機能が期待通りに動作する', async ({ page }) => {
    // テストページに移動
    await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
    
    // 拡張機能の読み込み待機
    await page.waitForFunction(() => window.YGO_DECK_SUPPORT_LOADED);
    
    // 新機能の要素を取得
    const newFeatureButton = page.locator('#new-feature-button');
    await expect(newFeatureButton).toBeVisible();
    
    // 機能実行
    await newFeatureButton.click();
    
    // 結果確認
    const result = await page.locator('#result').textContent();
    expect(result).toBe('期待される結果');
  });
});
```

## 📝 コーディング規約

### JavaScript スタイルガイド

#### 基本原則
- **ES2020+** の機能を積極活用
- **Async/Await** を非同期処理で使用
- **Arrow Functions** を適切に使用
- **Template Literals** で文字列結合
- **Destructuring** でコード簡潔化

#### 命名規約
```javascript
// クラス名: PascalCase
class YGODeckSupport {
  // プライベートメソッド: _camelCase
  _initializePrivateMethod() {}
  
  // パブリックメソッド: camelCase
  initializeDeckEditPage() {}
  
  // 定数: UPPER_SNAKE_CASE
  static readonly MAX_DECK_SIZE = 60;
  
  // 変数: camelCase
  const deckManager = new DeckManager();
}
```

#### 関数設計指針
```javascript
// 👍 Good: 単一責任の原則
function validateDeckSize(deck) {
  return deck.length >= 40 && deck.length <= 60;
}

function formatDeckInfo(deckInfo) {
  return `Main: ${deckInfo.main}, Extra: ${deckInfo.extra}, Side: ${deckInfo.side}`;
}

// 👎 Bad: 複数の責任を持つ関数
function validateAndFormatDeck(deck) {
  // バリデーションとフォーマットを同時に行う
}
```

#### エラーハンドリング
```javascript
// 👍 Good: 具体的なエラーハンドリング
async function loadDeckData(deckId) {
  try {
    const response = await fetch(`/api/deck/${deckId}`);
    
    if (!response.ok) {
      throw new Error(`デッキ読み込み失敗: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('DeckManager: デッキ読み込みエラー:', error);
    throw new Error(`デッキ読み込みに失敗しました: ${error.message}`);
  }
}
```

### HTML/CSS 規約

#### HTML構造
```html
<!-- 👍 Good: セマンティックHTML -->
<section class="ygo-deck-manager" id="ygo-deck-manager">
  <header class="ygo-deck-header">
    <h2 class="ygo-deck-title">デッキ管理</h2>
  </header>
  
  <main class="ygo-deck-content">
    <div class="ygo-deck-area ygo-deck-main" data-area="main">
      <!-- Main deck cards -->
    </div>
  </main>
</section>
```

#### CSS設計 (BEM + YGOUI)
```css
/* ブロック */
.ygo-deck-manager {
  /* デッキ管理全体のスタイル */
}

/* エレメント */
.ygo-deck-manager__header {
  /* ヘッダー部分のスタイル */
}

.ygo-deck-manager__title {
  /* タイトルのスタイル */
}

/* モディファイア */
.ygo-deck-manager--mouseui-mode {
  /* MouseUIモード時のスタイル */
}

/* 状態クラス */
.ygo-deck-manager.is-loading {
  /* ローディング状態 */
}
```

## 🔌 拡張機能開発ベストプラクティス

### Manifest v3 対応

```json
// src/manifest.json
{
  "manifest_version": 3,
  "name": "遊戯王DBデッキサポート",
  "version": "3.1.1",
  
  // 権限は最小限に
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  
  // ホスト権限を明確に指定
  "host_permissions": [
    "https://www.db.yugioh-card.com/*"
  ],
  
  // Content Security Policy
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### パフォーマンス最適化

#### DOM操作の最適化
```javascript
// 👍 Good: DocumentFragmentを使用
function renderCards(cards) {
  const fragment = document.createDocumentFragment();
  
  cards.forEach(card => {
    const cardElement = createCardElement(card);
    fragment.appendChild(cardElement);
  });
  
  // 一度にDOMに追加
  container.appendChild(fragment);
}

// 👎 Bad: 個別にDOM操作
function renderCardsBad(cards) {
  cards.forEach(card => {
    const cardElement = createCardElement(card);
    container.appendChild(cardElement); // 毎回reflow発生
  });
}
```

#### メモリリーク対策
```javascript
class YGODeckSupport {
  constructor() {
    this.eventListeners = new Map();
  }
  
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    
    // 清理のため記録
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler });
  }
  
  cleanup() {
    // 全イベントリスナーを削除
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.clear();
  }
}
```

### セキュリティ考慮事項

#### XSS対策
```javascript
// 👍 Good: 適切なエスケープ
function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.textContent = card.name; // 自動エスケープ
  
  // HTML属性も適切に設定
  cardDiv.setAttribute('data-card-id', card.id);
  
  return cardDiv;
}

// 👎 Bad: innerHTML直接使用
function createCardElementBad(card) {
  const cardDiv = document.createElement('div');
  cardDiv.innerHTML = `<span>${card.name}</span>`; // XSSリスク
  
  return cardDiv;
}
```

## 🎯 機能開発プロセス

### 1. 要件定義

#### 機能要求書テンプレート
```markdown
## 機能概要
- **機能名**: 新しいMouseUI機能
- **目的**: ユーザビリティの向上
- **対象ユーザー**: デッキ編集を行う全ユーザー

## 要件詳細
### 機能要件
- [ ] マウスクリックでカード移動
- [ ] ドラッグ&ドロップ対応
- [ ] リアルタイム枚数表示

### 非機能要件
- [ ] レスポンス時間: 100ms以内
- [ ] メモリ使用量: +50MB以内
- [ ] ブラウザ対応: Chrome 120+

## 受け入れ条件
- [ ] 既存機能への影響なし
- [ ] テストカバレッジ 90%以上
- [ ] パフォーマンス劣化なし
```

### 2. 設計フェーズ

#### API設計
```javascript
// 新機能のAPI設計例
window.YGO.NewFeature = {
  // 設定
  config: {
    enabled: false,
    animationSpeed: 300
  },
  
  // 公開メソッド
  enable() { /* 実装 */ },
  disable() { /* 実装 */ },
  configure(options) { /* 実装 */ },
  
  // 内部状態
  _state: {
    initialized: false,
    activeElements: []
  }
};
```

### 3. 実装フェーズ

#### 段階的実装
```bash
# Phase 1: 基本機能実装
git checkout -b feature/new-feature-phase1

# Phase 2: UI/UX改善
git checkout -b feature/new-feature-phase2

# Phase 3: パフォーマンス最適化
git checkout -b feature/new-feature-phase3
```

### 4. レビュープロセス

#### Pull Request チェックリスト
- [ ] **機能動作**: 要件通りに動作するか
- [ ] **テストカバレッジ**: 新規コードのテスト実装
- [ ] **パフォーマンス**: 性能劣化がないか
- [ ] **互換性**: 既存機能への影響確認
- [ ] **セキュリティ**: XSS、インジェクション対策
- [ ] **コード品質**: ESLint、Prettier適用
- [ ] **ドキュメント**: README、API仕様書更新

## 🤝 コントリビューション

### Issue報告

#### バグ報告テンプレート
```markdown
## バグ概要
簡潔なバグの説明

## 再現手順
1. XXXページにアクセス
2. XXXボタンをクリック
3. XXXが表示される

## 期待される動作
XXXが表示されるべき

## 実際の動作
XXXが表示されない

## 環境情報
- OS: Windows 11
- Chrome バージョン: 120.0.6099.129
- 拡張機能バージョン: v3.1.1

## 追加情報
- コンソールエラー: [添付]
- スクリーンショット: [添付]
```

#### 機能要望テンプレート
```markdown
## 機能概要
実装したい機能の概要

## 動機・背景
なぜこの機能が必要か

## 提案する解決方法
具体的な実装アイデア

## 代替案
他の解決方法があれば

## 追加コンテキスト
その他参考情報
```

### Pull Request ガイドライン

#### PRタイトル規約
```
type(scope): description

例:
feat(mouseui): Add drag and drop functionality
fix(deck): Fix card count display issue
docs(api): Update YGO object documentation
test(e2e): Add deck editing test cases
```

#### PR説明テンプレート
```markdown
## 変更概要
このPRで実装した変更の概要

## 変更内容
- [ ] 新機能Aの実装
- [ ] バグBの修正
- [ ] テストCの追加

## テスト方法
1. XXXの手順で動作確認
2. XXXのテストを実行

## 影響範囲
- 影響するファイル: src/js/content.js, src/css/content.css
- 互換性: 既存APIとの完全互換性維持

## スクリーンショット
(UI変更がある場合)

## チェックリスト
- [ ] テスト実行済み
- [ ] ドキュメント更新済み
- [ ] コードレビュー依頼済み
```

## 📊 品質管理

### コード品質指標

| 指標 | 現在値 | 目標値 |
|------|--------|--------|
| **テストカバレッジ** | 85.7% | 95% |
| **ESLintエラー** | 0 | 0 |
| **TypeScript型エラー** | N/A | 0 |
| **Cyclomatic Complexity** | < 10 | < 8 |
| **Bundle Size** | < 500KB | < 400KB |

### 継続的改善プロセス

#### 週次レビュー
```bash
# 品質指標収集
npm run metrics:collect

# パフォーマンス分析
npm run performance:analyze

# セキュリティ監査
npm audit

# 依存関係更新確認
npm outdated
```

#### 月次改善計画
1. **技術的負債の洗い出し**
2. **パフォーマンス改善計画策定**
3. **新技術導入検討**
4. **チーム学習計画**

## 🚀 デプロイメント

### リリース手順

```bash
# 1. バージョン更新
npm version [patch|minor|major]

# 2. Changelog更新
npm run changelog:generate

# 3. 最終テスト
npm run test:release

# 4. ビルド作成
npm run build:production

# 5. リリースタグ作成
git tag -a v3.1.2 -m "Release version 3.1.2"

# 6. GitHub Release作成
gh release create v3.1.2 ./dist/extension.zip \
  --title "v3.1.2" \
  --notes-file CHANGELOG.md
```

### Chrome Web Store 公開 (準備中)

```bash
# 1. 本番ビルド作成
npm run build:store

# 2. テストアカウントでの動作確認
npm run test:store

# 3. アップロード用ZIP作成
npm run package:store

# 4. Chrome Web Store Developer Dashboardで公開
```

## 📚 学習リソース

### Chrome拡張機能開発
- [Chrome Extensions Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension API Reference](https://developer.chrome.com/docs/extensions/reference/)

### JavaScript/Web開発
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [Web.dev](https://web.dev/)

### テスト・品質
- [Playwright Documentation](https://playwright.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint Configuration](https://eslint.org/)

### プロジェクト固有
- [遊戯王公式DB](https://www.db.yugioh-card.com/)
- [API仕様書](../api/README.md)
- [テストガイド](../testing/README.md)

---

**最終更新**: 2025年6月12日  
**開発チーム**: TomoTomo  
**貢献者歓迎**: GitHub Issues & Pull Requests