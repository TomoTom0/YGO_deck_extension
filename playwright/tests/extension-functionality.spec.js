/**
 * 遊戯王DBデッキサポート拡張機能 - Playwright機能テスト
 */
const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

// 拡張機能のパス
const EXTENSION_PATH = path.resolve(__dirname, '../../src');
const CHROME_PROFILE_PATH = '/home/tomo/work/app/YGO_deck_extension/chrome-profile';

// テスト用の設定
const TEST_CONFIG = {
  baseURL: 'https://www.db.yugioh-card.com/yugiohdb/',
  timeout: 60000,
  waitForLoadTimeout: 10000
};

test.describe('遊戯王DBデッキサポート拡張機能テスト', () => {
  let context;
  let page;

  test.beforeAll(async () => {
    console.log('🚀 テスト環境初期化中...');
    
    // Chrome拡張機能を有効にしてコンテキストを作成
    context = await chromium.launchPersistentContext(CHROME_PROFILE_PATH, {
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
    
    page = await context.newPage();
    
    // コンソールログの監視
    page.on('console', msg => {
      if (msg.text().includes('YGO Deck Support')) {
        console.log(`[EXTENSION] ${msg.type()}: ${msg.text()}`);
      }
    });
  });

  test.afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  test('ホームページでクイックアクセスパネルが表示される', async () => {
    await page.goto(TEST_CONFIG.baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    // クイックアクセスパネルの確認
    const quickAccessPanel = page.locator('#ygo-quick-access');
    await expect(quickAccessPanel).toBeVisible();

    // パネル内のボタンの確認
    const helpButton = page.locator('#ygo-home-help');
    await expect(helpButton).toBeVisible();
    
    const debugButton = page.locator('#ygo-home-debug');
    await expect(debugButton).toBeVisible();

    console.log('✅ ホームページでクイックアクセスパネルが正常に表示されています');
  });

  test('カード検索ページで拡張機能が動作する', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}card_search.action`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    // ステータス表示の確認
    const statusElement = page.locator('#ygo-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toContainText('YGO Deck Support');

    // 検索フォームの存在確認
    const searchForm = page.locator('form').first();
    await expect(searchForm).toBeVisible();

    console.log('✅ カード検索ページで拡張機能が正常に動作しています');
  });

  test('デッキ編集ページでMouseUI機能が利用可能', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}deck_edit.action`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    // MouseUI要素の確認
    const mouseUIPanel = page.locator('#ygo-mouse-ui');
    await expect(mouseUIPanel).toBeVisible();

    // MouseUI切り替えボタンの確認
    const toggleButton = page.locator('#mouse-ui-toggle');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toContainText('有効化');

    // デッキエリアの確認
    const mainDeckArea = page.locator('#ygo-deck-area-main');
    await expect(mainDeckArea).toBeVisible();
    
    const extraDeckArea = page.locator('#ygo-deck-area-extra');
    await expect(extraDeckArea).toBeVisible();
    
    const sideDeckArea = page.locator('#ygo-deck-area-side');
    await expect(sideDeckArea).toBeVisible();

    // カードエリアの確認
    const cardArea = page.locator('#ygo-card-area');
    await expect(cardArea).toBeVisible();

    console.log('✅ デッキ編集ページでMouseUI機能が利用可能です');
  });

  test('MouseUIモードの有効化・無効化が動作する', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}deck_edit.action`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    const toggleButton = page.locator('#mouse-ui-toggle');
    const controlsPanel = page.locator('#mouse-ui-controls');

    // 初期状態では無効化されている
    await expect(controlsPanel).toBeHidden();

    // MouseUIを有効化
    await toggleButton.click();
    await expect(controlsPanel).toBeVisible();
    await expect(toggleButton).toContainText('無効化');

    // 各種ボタンが表示されることを確認
    await expect(page.locator('#mouse-ui-sort')).toBeVisible();
    await expect(page.locator('#mouse-ui-shuffle')).toBeVisible();
    await expect(page.locator('#mouse-ui-clear')).toBeVisible();
    await expect(page.locator('#mouse-ui-export')).toBeVisible();
    await expect(page.locator('#mouse-ui-import')).toBeVisible();
    await expect(page.locator('#mouse-ui-save')).toBeVisible();

    // MouseUIを無効化
    await toggleButton.click();
    await expect(controlsPanel).toBeHidden();
    await expect(toggleButton).toContainText('有効化');

    console.log('✅ MouseUIモードの有効化・無効化が正常に動作しています');
  });

  test('グローバルYGOオブジェクトが正しく設定される', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}deck_edit.action`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    // グローバルYGOオブジェクトの確認
    const ygoObject = await page.evaluate(() => {
      return {
        hasMainObject: typeof window.YGO === 'object',
        hasDeckSupport: typeof window.YGO?.DeckSupport === 'object',
        hasMouseUI: typeof window.YGO?.MouseUI === 'object',
        hasDeckManager: typeof window.YGO?.DeckManager === 'object',
        hasCardSearch: typeof window.YGO?.CardSearch === 'object',
        hasUtils: typeof window.YGO?.Utils === 'object',
        hasEvents: typeof window.YGO?.Events === 'object',
        version: window.YGO?.DeckSupport?.version,
        supportLoaded: window.YGO_DECK_SUPPORT_LOADED
      };
    });

    expect(ygoObject.hasMainObject).toBeTruthy();
    expect(ygoObject.hasDeckSupport).toBeTruthy();
    expect(ygoObject.hasMouseUI).toBeTruthy();
    expect(ygoObject.hasDeckManager).toBeTruthy();
    expect(ygoObject.hasCardSearch).toBeTruthy();
    expect(ygoObject.hasUtils).toBeTruthy();
    expect(ygoObject.hasEvents).toBeTruthy();
    expect(ygoObject.version).toBe('3.1.1');
    expect(ygoObject.supportLoaded).toBeTruthy();

    console.log('✅ グローバルYGOオブジェクトが正しく設定されています');
  });

  test('ページ間遷移で拡張機能が継続動作する', async () => {
    const testPages = [
      { name: 'ホーム', url: TEST_CONFIG.baseURL },
      { name: 'カード検索', url: `${TEST_CONFIG.baseURL}card_search.action` },
      { name: 'デッキ編集', url: `${TEST_CONFIG.baseURL}deck_edit.action` }
    ];

    for (const testPage of testPages) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // 拡張機能要素の存在確認
      const extensionElements = await page.evaluate(() => {
        return document.querySelectorAll('[id*="ygo"], [class*="ygo"]').length;
      });

      expect(extensionElements).toBeGreaterThan(0);
      console.log(`✅ ${testPage.name}ページで拡張機能が動作中 (${extensionElements}個の要素)`);
    }
  });

  test('エラーハンドリングが適切に動作する', async () => {
    await page.goto(`${TEST_CONFIG.baseURL}deck_edit.action`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TEST_CONFIG.waitForLoadTimeout);

    // JavaScript エラーが発生しないことを確認
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // 各種UIアクションの実行
    await page.click('#ygo-analyze-btn');
    await page.waitForTimeout(1000);
    
    await page.click('#ygo-debug-btn');
    await page.waitForTimeout(1000);

    // エラーが発生していないことを確認
    expect(jsErrors.length).toBe(0);

    console.log('✅ エラーハンドリングが適切に動作しています');
  });
});