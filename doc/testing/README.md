# 遊戯王DBデッキサポート テストガイド v3.1.1

## 📋 概要

遊戯王DBデッキサポート拡張機能の品質保証のため、包括的なテスト環境を構築しています。Playwrightを中心としたE2Eテスト、単体テスト、統合テストを通じて、85.7%の高いテスト成功率を維持しています。

## 🧪 テスト環境

### テスト技術スタック

| ツール | バージョン | 用途 |
|-------|-----------|------|
| **Playwright** | ^1.53.0 | E2E自動テスト |
| **Node.js** | 18+ | テスト実行環境 |
| **Chrome** | 120+ | ブラウザテスト |
| **Jest** | (準備中) | 単体テスト |

### テストカバレッジ

- **E2Eテスト**: 85.7% (12/14 テスト成功)
- **ページ対応**: ホーム、カード検索、デッキ検索、デッキ編集、デッキ詳細
- **機能テスト**: MouseUI、デッキ管理、カード検索、UI操作

## 🚀 クイックスタート

### 環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/TomoTom0/YGO_deck_extension.git
cd YGO_deck_extension

# 依存関係インストール
npm install

# Playwrightブラウザインストール
npx playwright install chromium
```

### 基本テスト実行

```bash
# 基本テスト実行
node test-extension.js

# 包括テスト実行
node comprehensive-test.js

# Playwright E2Eテスト実行
npx playwright test
```

## 📁 テスト構造

```
YGO_deck_extension/
├── 📁 playwright/                    # Playwright E2Eテスト
│   ├── playwright.config.js          # Playwright設定
│   ├── chrome-extension-config.js    # Chrome拡張機能設定
│   └── 📁 tests/
│       └── extension-functionality.spec.js  # メイン機能テスト
├── 📁 test-scripts/                  # 独立テストスクリプト
│   ├── test-extension.js             # 基本テスト
│   ├── comprehensive-test.js         # 包括テスト
│   ├── site-investigation.js         # サイト調査
│   └── deck-analysis.js              # デッキ分析
├── test-report.json                  # テスト結果レポート
└── package.json                      # テスト依存関係
```

## 🎯 テストカテゴリ

### 1. 基本機能テスト (test-extension.js)

**目的**: 拡張機能の基本動作確認

**テスト内容**:
- 拡張機能の読み込み確認
- コンテンツスクリプトの実行確認
- 各ページでの基本動作確認

**実行方法**:
```bash
node test-extension.js
```

**出力例**:
```
🚀 遊戯王DBデッキサポート拡張機能テスト開始
✅ 拡張機能読み込み: 正常
✅ ホームページ機能: 正常
✅ カード検索ページ: 正常
📊 テスト完了: 3/3 テスト成功
```

### 2. 包括テスト (comprehensive-test.js)

**目的**: 全機能の詳細動作確認

**テスト項目**:
1. **拡張機能読み込み** - Extension loading verification
2. **スクリプト実行** - Content script execution
3. **ホームページUI** - Home page interface
4. **ヘルプ機能** - Help dialog functionality  
5. **カード検索ページ検出** - Card search page detection
6. **検索フォーム** - Search form presence
7. **ステータス表示** - Extension status display
8. **デッキリスト表示** - Deck list rendering
9. **デッキクリック** - Deck click navigation
10. **デバッグ機能** - Debug functionality
11. **DOM操作** - Dynamic DOM manipulation
12. **ページ遷移** - Page navigation
13. **エラーハンドリング** - Error handling
14. **JavaScript エラー** - JavaScript error handling

**実行方法**:
```bash
node comprehensive-test.js
```

**結果分析**:
現在の成功率: **85.7%** (12/14 テスト成功)

### 3. Playwright E2Eテスト (extension-functionality.spec.js)

**目的**: ブラウザ環境での実際のユーザー操作テスト

**テスト設定**:
```javascript
// playwright.config.js
module.exports = {
  timeout: 60000,
  retries: 2,
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

**主要テストケース**:

#### 拡張機能初期化テスト
```javascript
test('拡張機能が正常に読み込まれること', async ({ page }) => {
  await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
  
  // 拡張機能の読み込み確認
  const extensionLoaded = await page.evaluate(() => {
    return window.YGO_DECK_SUPPORT_LOADED === true;
  });
  
  expect(extensionLoaded).toBe(true);
});
```

#### UI操作テスト
```javascript
test('ホームページのクイックアクセスパネルが動作すること', async ({ page }) => {
  await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
  
  // クイックアクセスパネルの表示確認
  const quickAccess = page.locator('#ygo-quick-access');
  await expect(quickAccess).toBeVisible();
  
  // ヘルプボタンのクリックテスト
  const helpButton = page.locator('#ygo-home-help');
  await helpButton.click();
  
  // ダイアログ処理
  page.on('dialog', dialog => dialog.accept());
});
```

#### デッキ編集テスト
```javascript
test('デッキ編集ページでMouseUIが動作すること', async ({ page }) => {
  // ログイン処理 (実装予定)
  
  await page.goto('https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2');
  
  // MouseUIボタンの存在確認
  const mouseUIButton = page.locator('#ygo-mouseui-toggle');
  await expect(mouseUIButton).toBeVisible();
  
  // MouseUIモード切り替え
  await mouseUIButton.click();
  
  // デッキエリアの確認
  const deckAreas = page.locator('.ygo-deck-area');
  await expect(deckAreas).toHaveCount(3); // Main, Extra, Side
});
```

## 🔧 テスト環境設定

### Playwright設定詳細

#### chrome-extension-config.js
```javascript
const path = require('path');

module.exports = {
  EXTENSION_PATH: path.resolve(__dirname, '../src'),
  CHROME_PROFILE_PATH: '/home/tomo/work/app/YGO_deck_extension/chrome-profile',
  TEST_CONFIG: {
    baseURL: 'https://www.db.yugioh-card.com/yugiohdb/',
    timeout: 60000,
    waitForLoadTimeout: 10000
  }
};
```

#### 拡張機能読み込み設定
```javascript
// Playwright context with extension
const context = await chromium.launchPersistentContext(CHROME_PROFILE_PATH, {
  headless: false,
  args: [
    `--disable-extensions-except=${EXTENSION_PATH}`,
    `--load-extension=${EXTENSION_PATH}`,
    '--disable-web-security',
    '--no-sandbox',
    '--disable-http2'
  ],
  ignoreHTTPSErrors: true
});
```

### テストデータ管理

#### 認証情報管理
```javascript
// 環境変数での認証情報管理 (実装予定)
const TEST_CREDENTIALS = {
  username: process.env.YGO_TEST_USER,
  password: process.env.YGO_TEST_PASS
};
```

#### テストデッキデータ
```javascript
// テスト用デッキレシピ
const TEST_DECK = {
  name: 'テスト用デッキ',
  main: [
    { id: '89631139', name: 'ブルーアイズ・ホワイト・ドラゴン', count: 3 },
    // ... more cards
  ],
  extra: [],
  side: []
};
```

## 📊 テスト結果レポート

### 最新テスト結果 (2025-06-11)

```json
{
  "summary": {
    "total": 14,
    "passed": 12,
    "failed": 2,
    "successRate": "85.7"
  },
  "failed_tests": [
    {
      "name": "スクリプト実行",
      "description": "コンテンツスクリプトが実行されているか",
      "reason": "window.YGO_DECK_SUPPORT_LOADED が false"
    },
    {
      "name": "ステータス表示", 
      "description": "拡張機能のステータスが表示されるか",
      "reason": "#ygo-status 要素が見つからない"
    }
  ]
}
```

### パフォーマンス指標

| 指標 | 現在値 | 目標値 |
|------|--------|--------|
| テスト実行時間 | 45秒 | 30秒 |
| 成功率 | 85.7% | 95% |
| ページ読み込み時間 | 3秒 | 2秒 |
| メモリ使用量 | 150MB | 100MB |

## 🐛 デバッグ・トラブルシューティング

### よくある問題と解決方法

#### 問題1: 拡張機能が読み込まれない
```bash
# 解決方法
1. Chrome拡張機能ページで手動リロード
2. Chromeプロファイルの確認
3. manifest.jsonの構文チェック
```

#### 問題2: Playwrightテストがタイムアウト
```javascript
// 解決方法: タイムアウト時間の調整
test.setTimeout(120000); // 2分に延長

// ネットワーク待機の追加
await page.waitForLoadState('networkidle');
```

#### 問題3: ログイン状態の保持
```javascript
// 解決方法: 永続化コンテキストの使用
const context = await chromium.launchPersistentContext(profilePath, {
  // セッション情報が保持される
});
```

### デバッグ用設定

#### デバッグモードでの実行
```bash
# 詳細ログ出力
DEBUG=1 node comprehensive-test.js

# Playwrightデバッグモード
npx playwright test --debug

# ヘッドフルモードでの実行
npx playwright test --headed
```

#### コンソールログ監視
```javascript
// テスト内でのコンソール監視
page.on('console', msg => {
  if (msg.text().includes('YGO Deck Support')) {
    console.log(`[EXTENSION] ${msg.type()}: ${msg.text()}`);
  }
});
```

## 🚀 継続的インテグレーション (CI/CD)

### GitHub Actions設定 (準備中)

```yaml
# .github/workflows/test.yml
name: Test Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Run tests
        run: |
          node comprehensive-test.js
          npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: test-report.json
```

### テスト自動化

#### Pre-commitフック
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "実行中: テスト自動実行..."
node test-extension.js
if [ $? -ne 0 ]; then
  echo "❌ テスト失敗: コミットを中断"
  exit 1
fi
echo "✅ テスト成功: コミット続行"
```

#### ナイトリービルド
```bash
# crontab設定例
0 2 * * * cd /path/to/YGO_deck_extension && node comprehensive-test.js > nightly-test.log 2>&1
```

## 📈 テスト改善計画

### 短期目標 (1ヶ月)
- [ ] 成功率を85.7% → 95%に向上
- [ ] ログイン機能の自動化
- [ ] UI コンポーネントテストの追加

### 中期目標 (3ヶ月)
- [ ] パフォーマンステストの導入
- [ ] モバイル環境テスト対応
- [ ] 回帰テストの自動化

### 長期目標 (6ヶ月)
- [ ] クロスブラウザテスト (Firefox, Safari)
- [ ] アクセシビリティテスト
- [ ] セキュリティテスト

## 🛠️ カスタムテスト作成

### 新しいテストケースの追加

```javascript
// playwright/tests/custom-feature.spec.js
const { test, expect } = require('@playwright/test');

test.describe('カスタム機能テスト', () => {
  test('新機能が正常に動作すること', async ({ page }) => {
    // テスト実装
    await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
    
    // カスタム要素の確認
    const customElement = page.locator('#custom-feature');
    await expect(customElement).toBeVisible();
    
    // 機能テスト
    await customElement.click();
    
    // 結果確認
    const result = await page.locator('#result').textContent();
    expect(result).toBe('期待される結果');
  });
});
```

### テストユーティリティ関数

```javascript
// test-utils.js
class TestUtils {
  static async waitForExtensionLoad(page) {
    await page.waitForFunction(() => {
      return window.YGO_DECK_SUPPORT_LOADED === true;
    }, { timeout: 10000 });
  }
  
  static async loginIfNeeded(page) {
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('.logout-link') !== null;
    });
    
    if (!isLoggedIn) {
      // ログイン処理
      await this.performLogin(page);
    }
  }
  
  static async performLogin(page) {
    // ログイン実装 (準備中)
  }
}

module.exports = TestUtils;
```

## 📚 参考資料

### 公式ドキュメント
- [Playwright Documentation](https://playwright.dev/)
- [Chrome Extensions Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Jest Testing Framework](https://jestjs.io/)

### プロジェクト固有リソース
- [API仕様書](../api/README.md)
- [開発ガイド](../development/README.md)
- [プロジェクト概要](../README.md)

---

**最終更新**: 2025年6月12日  
**テストバージョン**: v3.1.1  
**Playwright バージョン**: ^1.53.0