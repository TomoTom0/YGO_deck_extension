/**
 * 遊戯王DBデッキサポート - ログイン状態でのスクリーンショット撮影
 * Windows Chrome Profile使用でのログイン済み状態での詳細撮影
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 設定
const EXTENSION_PATH = path.resolve(__dirname, 'src');
const WINDOWS_CHROME_PROFILE = '/mnt/c/Users/tomo/AppData/Local/Google/Chrome/User Data/Profile 2';
const SCREENSHOT_DIR = path.resolve(__dirname, 'playwright/screenshots');

class LoginScreenshotCapture {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.screenshots = [];
    }

    /**
     * 環境初期化
     */
    async initialize() {
        console.log('🚀 ログイン状態スクリーンショット撮影環境初期化中...');
        
        try {
            // Windows ChromeプロファイルでPersistentContextを作成
            this.context = await chromium.launchPersistentContext(WINDOWS_CHROME_PROFILE, {
                headless: false,
                args: [
                    `--disable-extensions-except=${EXTENSION_PATH}`,
                    `--load-extension=${EXTENSION_PATH}`,
                    '--disable-web-security',
                    '--no-sandbox',
                    '--disable-http2'
                ],
                viewport: { width: 1920, height: 1080 },
                ignoreHTTPSErrors: true
            });

            this.page = await this.context.newPage();
            
            // コンソールログをキャプチャ
            this.page.on('console', msg => {
                if (msg.text().includes('YGO')) {
                    console.log(`[EXTENSION] ${msg.type()}: ${msg.text()}`);
                }
            });

            console.log('✅ 環境初期化完了');
            return true;

        } catch (error) {
            console.error('❌ 環境初期化失敗:', error.message);
            return false;
        }
    }

    /**
     * スクリーンショット撮影とメタデータ保存
     */
    async captureScreenshot(description, filename, url = null, elementSelector = null) {
        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const fullFilename = `${timestamp}_${filename}.png`;
            const screenshotPath = path.join(SCREENSHOT_DIR, fullFilename);

            console.log(`📸 スクリーンショット撮影: ${description}`);

            if (url) {
                await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
                await this.page.waitForTimeout(3000); // 拡張機能初期化待ち
            }

            if (elementSelector) {
                // 要素が存在する場合のみキャプチャ
                const element = await this.page.locator(elementSelector).first();
                if (await element.isVisible()) {
                    await element.screenshot({ path: screenshotPath });
                } else {
                    console.log(`⚠️ 要素が見つかりません: ${elementSelector}`);
                    return false;
                }
            } else {
                // フルページスクリーンショット
                await this.page.screenshot({ 
                    path: screenshotPath, 
                    fullPage: true 
                });
            }

            // メタデータ保存
            const metadata = {
                description,
                filename: fullFilename,
                url: url || this.page.url(),
                timestamp: new Date().toISOString(),
                success: true,
                path: screenshotPath
            };

            this.screenshots.push(metadata);
            console.log(`  ✅ 保存完了: ${screenshotPath}`);
            return true;

        } catch (error) {
            console.error(`  ❌ スクリーンショット失敗: ${error.message}`);
            return false;
        }
    }

    /**
     * ログイン状態での包括的スクリーンショット撮影
     */
    async captureLoginStateScreenshots() {
        console.log('🎯 ログイン状態でのスクリーンショット撮影開始\n');

        // 1. ホームページ（ログイン済み）
        await this.captureScreenshot(
            'ホームページ - ログイン済み状態',
            'login_01_home_logged_in',
            'https://www.db.yugioh-card.com/yugiohdb/'
        );

        // 2. マイデッキページ
        await this.captureScreenshot(
            'マイデッキページ - デッキ一覧',
            'login_02_my_deck_list',
            'https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=4'
        );

        // 3. デッキ編集ページ（ログイン状態）
        await this.captureScreenshot(
            'デッキ編集ページ - ログイン済み初期状態',
            'login_03_deck_edit_initial',
            'https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2'
        );

        // 4. 拡張機能UI要素の詳細撮影
        console.log('\n🔍 拡張機能UI要素の詳細撮影');

        // デッキサポートパネル
        await this.captureScreenshot(
            'デッキサポートパネル - ログイン状態',
            'login_04_deck_support_panel',
            null,
            '#ygo-deck-support-panel, .ygo-panel, [id*="ygo-deck"]'
        );

        // MouseUIパネル
        await this.captureScreenshot(
            'MouseUIパネル - ログイン状態',
            'login_05_mouse_ui_panel',
            null,
            '#ygo-mouse-ui-panel, [id*="mouse-ui"], .mouse-ui-panel'
        );

        // デッキエリア
        await this.captureScreenshot(
            'デッキエリア - ログイン状態',
            'login_06_deck_areas',
            null,
            '#ygo-main-deck, .deck-area, [id*="deck-area"]'
        );

        // カードエリア
        await this.captureScreenshot(
            'カードエリア - ログイン状態',
            'login_07_card_area',
            null,
            '#ygo-card-area, .card-area, [class*="card"]'
        );

        // 5. MouseUI機能有効化テスト
        console.log('\n🖱️ MouseUI機能有効化テスト');
        
        try {
            // MouseUIトグルボタンをクリック
            const toggleButton = this.page.locator('#mouse-ui-toggle, .mouse-ui-toggle, [onclick*="mouseUI"]').first();
            if (await toggleButton.isVisible()) {
                await toggleButton.click();
                await this.page.waitForTimeout(1000);
                
                await this.captureScreenshot(
                    'MouseUI有効化後のコントロール',
                    'login_08_mouse_ui_active',
                    null,
                    '#mouse-ui-controls, .mouse-ui-controls'
                );
            }
        } catch (error) {
            console.log('⚠️ MouseUI切り替えテストでエラー:', error.message);
        }

        // 6. カード検索ページ（ログイン状態）
        await this.captureScreenshot(
            'カード検索ページ - ログイン済み状態',
            'login_09_card_search_logged_in',
            'https://www.db.yugioh-card.com/yugiohdb/card_search.action'
        );

        // 7. デッキ編集ページ全体（MouseUI有効化後）
        await this.captureScreenshot(
            'デッキ編集ページ - MouseUI有効化後全体',
            'login_10_deck_edit_full_active',
            'https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2'
        );
    }

    /**
     * 拡張機能状態の詳細調査
     */
    async investigateExtensionState() {
        console.log('\n🔬 拡張機能状態の詳細調査');

        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            await this.page.waitForTimeout(5000); // 拡張機能完全初期化待ち

            const detailedState = await this.page.evaluate(() => {
                const state = {
                    // フラグとオブジェクト
                    ygoLoaded: typeof window.YGO_DECK_SUPPORT_LOADED !== 'undefined' ? window.YGO_DECK_SUPPORT_LOADED : 'undefined',
                    ygoObject: typeof window.YGO !== 'undefined',
                    ygoKeys: typeof window.YGO !== 'undefined' ? Object.keys(window.YGO) : [],
                    
                    // DOM要素
                    allYgoElements: document.querySelectorAll('[id*="ygo"], [class*="ygo"]').length,
                    mouseUIElements: document.querySelectorAll('[id*="mouse"], [class*="mouse-ui"]').length,
                    deckElements: document.querySelectorAll('[id*="deck"], [class*="deck"]').length,
                    
                    // 拡張機能特有の要素
                    quickAccessPanel: document.querySelector('#ygo-quick-access') !== null,
                    deckSupportPanel: document.querySelector('#ygo-deck-support-panel') !== null,
                    mouseUIPanel: document.querySelector('#ygo-mouse-ui-panel') !== null,
                    
                    // ページ情報
                    url: window.location.href,
                    title: document.title,
                    
                    // 機能状態
                    mouseUIEnabled: typeof window.YGO !== 'undefined' && window.YGO.MouseUI ? window.YGO.MouseUI.enabled : 'undefined',
                    
                    // DOM構造サンプル
                    bodyStructure: Array.from(document.querySelectorAll('[id*="ygo"], [class*="ygo"]')).map(el => ({
                        tag: el.tagName,
                        id: el.id,
                        className: el.className,
                        visible: el.offsetParent !== null
                    }))
                };
                
                return state;
            });

            console.log('拡張機能詳細状態:', JSON.stringify(detailedState, null, 2));

            // 調査結果をファイルに保存
            const investigationReport = {
                timestamp: new Date().toISOString(),
                environment: 'Windows Chrome Profile - Logged In',
                state: detailedState
            };

            fs.writeFileSync('extension-state-investigation.json', JSON.stringify(investigationReport, null, 2));
            console.log('📁 調査結果を extension-state-investigation.json に保存しました');

        } catch (error) {
            console.error('❌ 拡張機能状態調査エラー:', error.message);
        }
    }

    /**
     * レポート生成
     */
    async generateReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            totalScreenshots: this.screenshots.length,
            successfulCaptures: this.screenshots.filter(s => s.success).length,
            screenshots: this.screenshots
        };

        const reportPath = path.join(SCREENSHOT_DIR, `${timestamp.split('T')[0]}_login_screenshot_report.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`\n📊 スクリーンショット撮影結果: ${report.successfulCaptures}/${report.totalScreenshots} 成功`);
        console.log(`📁 レポート保存: ${reportPath}`);
    }

    /**
     * クリーンアップ
     */
    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    /**
     * メイン実行
     */
    async run() {
        try {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('環境初期化に失敗しました');
            }

            await this.captureLoginStateScreenshots();
            await this.investigateExtensionState();
            await this.generateReport();

            console.log('\n🎉 ログイン状態スクリーンショット撮影完了!');
            console.log(`📂 保存先: ${SCREENSHOT_DIR}`);
            console.log('💡 ブラウザを開いたままにして手動確認も可能です');
            console.log('🛑 終了する場合は Ctrl+C を押してください');

        } catch (error) {
            console.error('❌ スクリーンショット撮影エラー:', error.message);
        }
    }
}

// 実行
if (require.main === module) {
    const capture = new LoginScreenshotCapture();
    
    // Ctrl+C ハンドラ
    process.on('SIGINT', async () => {
        console.log('\n🛑 撮影を中断しています...');
        await capture.cleanup();
        process.exit(0);
    });

    capture.run().catch(console.error);
}

module.exports = LoginScreenshotCapture;