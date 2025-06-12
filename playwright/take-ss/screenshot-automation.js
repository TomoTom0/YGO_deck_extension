/**
 * 遊戯王DBデッキサポート拡張機能 - スクリーンショット自動撮影
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 拡張機能のパス
const EXTENSION_PATH = path.resolve(__dirname, '../../src');
const CHROME_PROFILE_PATH = '/home/tomo/work/app/YGO_deck_extension/chrome-profile';

class ScreenshotAutomation {
  constructor() {
    this.context = null;
    this.page = null;
    this.screenshotDir = path.resolve(__dirname, '../screenshots');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  }

  async initialize() {
    console.log('🚀 スクリーンショット撮影環境初期化中...');
    
    // スクリーンショット保存ディレクトリの作成
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    // Chrome拡張機能を有効にしてコンテキストを作成
    this.context = await chromium.launchPersistentContext(CHROME_PROFILE_PATH, {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--disable-web-security',
        '--no-sandbox',
        '--disable-http2'
      ],
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 } // Full HD解像度
    });
    
    this.page = await this.context.newPage();
    
    // コンソールログの監視
    this.page.on('console', msg => {
      if (msg.text().includes('YGO Deck Support')) {
        console.log(`[EXTENSION] ${msg.type()}: ${msg.text()}`);
      }
    });

    console.log('✅ 環境初期化完了');
  }

  async takeScreenshot(url, filename, description, options = {}) {
    console.log(`📸 スクリーンショット撮影: ${description}`);
    
    try {
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      
      // 拡張機能の読み込み完了を待機
      await this.page.waitForTimeout(options.waitTime || 8000);
      
      // 特定の要素の表示を待機
      if (options.waitForElement) {
        await this.page.waitForSelector(options.waitForElement, { timeout: 30000 });
      }

      // スクリーンショット撮影
      const screenshotPath = path.join(this.screenshotDir, `${this.timestamp}_${filename}.png`);
      
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage || true,
        type: 'png'
      });

      console.log(`  ✅ 保存完了: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      console.error(`  ❌ エラー: ${error.message}`);
      return null;
    }
  }

  async takeElementScreenshot(selector, filename, description) {
    console.log(`📸 要素スクリーンショット撮影: ${description}`);
    
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      
      const screenshotPath = path.join(this.screenshotDir, `${this.timestamp}_${filename}.png`);
      
      await element.screenshot({
        path: screenshotPath,
        type: 'png'
      });

      console.log(`  ✅ 要素保存完了: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      console.error(`  ❌ 要素エラー: ${error.message}`);
      return null;
    }
  }

  async captureAllScreenshots() {
    console.log('🎯 全画面スクリーンショット撮影開始\n');

    const screenshots = [
      {
        url: 'https://www.db.yugioh-card.com/yugiohdb/',
        filename: '01_home_page',
        description: 'ホームページ - クイックアクセスパネル表示',
        options: { waitForElement: '#ygo-quick-access', waitTime: 5000 }
      },
      {
        url: 'https://www.db.yugioh-card.com/yugiohdb/card_search.action',
        filename: '02_card_search',
        description: 'カード検索ページ - ステータス表示',
        options: { waitForElement: '#ygo-status', waitTime: 6000 }
      },
      {
        url: 'https://www.db.yugioh-card.com/yugiohdb/deck_edit.action',
        filename: '03_deck_edit_initial',
        description: 'デッキ編集ページ - 初期状態',
        options: { waitForElement: '#ygo-deck-support-ui', waitTime: 10000 }
      }
    ];

    const results = [];
    
    for (const screenshot of screenshots) {
      const result = await this.takeScreenshot(
        screenshot.url,
        screenshot.filename,
        screenshot.description,
        screenshot.options
      );
      results.push({ ...screenshot, path: result });
      
      // ページ間の待機時間
      await this.page.waitForTimeout(2000);
    }

    // デッキ編集ページでの詳細キャプチャ
    await this.captureDetailed();

    return results;
  }

  async captureDetailed() {
    console.log('\n🔍 詳細要素キャプチャ開始');
    
    // デッキ編集ページに移動（既にいる場合もある）
    await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_edit.action');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(10000);

    const detailCaptures = [
      {
        selector: '#ygo-deck-support-ui',
        filename: '04_deck_support_panel',
        description: 'デッキサポートパネル'
      },
      {
        selector: '#ygo-mouse-ui',
        filename: '05_mouse_ui_panel',
        description: 'MouseUIパネル'
      },
      {
        selector: '#ygo-deck-area-main',
        filename: '06_main_deck_area',
        description: 'メインデッキエリア'
      },
      {
        selector: '#ygo-card-area',
        filename: '07_card_area',
        description: 'カードエリア'
      }
    ];

    for (const capture of detailCaptures) {
      await this.takeElementScreenshot(
        capture.selector,
        capture.filename,
        capture.description
      );
      await this.page.waitForTimeout(1000);
    }

    // MouseUI有効化後のキャプチャ
    console.log('\n🖱️ MouseUI有効化後のキャプチャ');
    
    try {
      const toggleButton = this.page.locator('#mouse-ui-toggle');
      await toggleButton.click();
      await this.page.waitForTimeout(2000);

      await this.takeElementScreenshot(
        '#mouse-ui-controls',
        '08_mouse_ui_controls_active',
        'MouseUIコントロール（有効化後）'
      );

      await this.takeScreenshot(
        this.page.url(),
        '09_deck_edit_mouse_ui_active',
        'デッキ編集ページ - MouseUI有効化後',
        { waitTime: 2000, fullPage: true }
      );

    } catch (error) {
      console.error('MouseUI有効化キャプチャでエラー:', error.message);
    }
  }

  async generateReport(results) {
    console.log('\n📋 レポート生成中...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalScreenshots: results.length,
      successfulCaptures: results.filter(r => r.path !== null).length,
      screenshots: results.map(r => ({
        description: r.description,
        filename: r.filename,
        url: r.url,
        success: r.path !== null,
        path: r.path
      }))
    };

    const reportPath = path.join(this.screenshotDir, `${this.timestamp}_screenshot_report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📁 レポート保存: ${reportPath}`);
    console.log(`📊 結果: ${report.successfulCaptures}/${report.totalScreenshots} 成功`);

    return report;
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    console.log('🧹 クリーンアップ完了');
  }

  async run() {
    try {
      await this.initialize();
      const results = await this.captureAllScreenshots();
      const report = await this.generateReport(results);
      
      console.log('\n🎉 スクリーンショット撮影完了!');
      console.log(`📂 保存先: ${this.screenshotDir}`);
      
      return report;
      
    } catch (error) {
      console.error('💥 予期しないエラー:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// スクリプト実行
if (require.main === module) {
  const automation = new ScreenshotAutomation();
  automation.run().catch(console.error);
}

module.exports = ScreenshotAutomation;