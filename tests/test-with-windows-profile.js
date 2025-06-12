/**
 * 遊戯王DBデッキサポート - Windows Chrome Profile使用テスト
 * ログイン済みセッション永続化でのテスト実行
 */

const { chromium } = require('playwright');
const path = require('path');

// 設定
const EXTENSION_PATH = path.resolve(__dirname, 'src');
const WINDOWS_CHROME_PROFILE = '/mnt/c/Users/tomo/AppData/Local/Google/Chrome/User Data/Profile 2';

class WindowsProfileTest {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.testResults = [];
    }

    /**
     * テスト結果を追加
     */
    addTestResult(name, passed, details = '') {
        const result = {
            name,
            passed,
            details,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        console.log(`${passed ? '✅' : '❌'} ${name}: ${details}`);
    }

    /**
     * Chromeコンテキストの初期化（Windows Profile使用）
     */
    async initializeContext() {
        console.log('🚀 Windows Chrome Profile使用でテスト環境初期化中...');
        
        try {
            // Windows ChromeプロファイルでPersistentContextを作成
            this.context = await chromium.launchPersistentContext(WINDOWS_CHROME_PROFILE, {
                headless: false,
                args: [
                    `--disable-extensions-except=${EXTENSION_PATH}`,
                    `--load-extension=${EXTENSION_PATH}`,
                    '--disable-web-security',
                    '--no-sandbox',
                    '--disable-http2',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-background-timer-throttling',
                    '--disable-blink-features=AutomationControlled',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                ],
                viewport: { width: 1920, height: 1080 },
                ignoreHTTPSErrors: true,
                timeout: 120000
            });

            // 新しいページを作成
            this.page = await this.context.newPage();
            
            // コンソールログをキャプチャ
            this.page.on('console', msg => {
                if (msg.text().includes('YGO')) {
                    console.log(`[EXTENSION] ${msg.type()}: ${msg.text()}`);
                }
            });

            this.addTestResult('Windows Profile初期化', true, 'セッション永続化コンテキスト作成成功');
            return true;

        } catch (error) {
            this.addTestResult('Windows Profile初期化', false, `エラー: ${error.message}`);
            return false;
        }
    }

    /**
     * 遊戯王DBログイン状態の確認
     */
    async checkLoginStatus() {
        console.log('🔐 遊戯王DBログイン状態確認中...');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', { 
                waitUntil: 'networkidle',
                timeout: 60000 
            });

            // ログイン状態を確認（修正版 - CSS4セレクタ回避）
            const loginElements = await this.page.evaluate(() => {
                return {
                    loginButton: document.querySelector('a[href*="login"], input[value*="ログイン"]') !== null,
                    userInfo: document.querySelector('.user-info, .member-info, [class*="user"], [class*="member"]') !== null,
                    deckMenu: document.querySelector('a[href*="member_deck"], [href*="deck"]') !== null,
                    konamiId: document.querySelector('[href*="konami"], [href*="my.konami"]') !== null,
                    currentUrl: window.location.href,
                    pageTitle: document.title,
                    bodyText: document.body.innerText.slice(0, 500), // ページ内容サンプル
                    hasMenuItems: document.querySelectorAll('a, button, input').length
                };
            });

            console.log('ログイン状態チェック結果:', loginElements);

            // ログイン状態判定
            const isLoggedIn = loginElements.deckMenu || 
                              loginElements.userInfo || 
                              (!loginElements.loginButton && !loginElements.konamiId);

            this.addTestResult('遊戯王DBログイン状態', 
                isLoggedIn, 
                isLoggedIn ? 'ログイン済み状態確認' : 'ログインが必要');

            // デッキ編集ページへのアクセステスト
            if (isLoggedIn) {
                await this.testDeckEditAccess();
            }

            return isLoggedIn;

        } catch (error) {
            this.addTestResult('ログイン状態確認', false, `エラー: ${error.message}`);
            return false;
        }
    }

    /**
     * デッキ編集ページアクセステスト
     */
    async testDeckEditAccess() {
        console.log('🃏 デッキ編集ページアクセステスト...');
        
        try {
            // デッキ編集ページに直接アクセス
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            // ページが正常にロードされたか確認
            const pageInfo = await this.page.evaluate(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    hasLoginRedirect: window.location.href.includes('login') || window.location.href.includes('signin'),
                    hasDeckContent: document.querySelector('[class*="deck"], [id*="deck"], .card') !== null,
                    hasErrorMessage: document.querySelector('.error, [class*="error"]') !== null
                };
            });

            console.log('デッキ編集ページ情報:', pageInfo);

            if (pageInfo.hasLoginRedirect) {
                this.addTestResult('デッキ編集ページアクセス', false, 'ログインページにリダイレクトされました');
                return false;
            }

            if (pageInfo.hasErrorMessage) {
                this.addTestResult('デッキ編集ページアクセス', false, 'エラーページが表示されました');
                return false;
            }

            this.addTestResult('デッキ編集ページアクセス', true, 'デッキ編集ページに正常アクセス');
            
            // 拡張機能の動作確認
            await this.testExtensionOnDeckEdit();
            
            return true;

        } catch (error) {
            this.addTestResult('デッキ編集ページアクセス', false, `エラー: ${error.message}`);
            return false;
        }
    }

    /**
     * デッキ編集ページでの拡張機能動作確認
     */
    async testExtensionOnDeckEdit() {
        console.log('🔧 デッキ編集ページでの拡張機能動作確認...');
        
        try {
            // 拡張機能の読み込み確認
            await this.page.waitForTimeout(3000); // 拡張機能初期化待ち

            const extensionStatus = await this.page.evaluate(() => {
                return {
                    ygoLoaded: typeof window.YGO_DECK_SUPPORT_LOADED !== 'undefined' ? window.YGO_DECK_SUPPORT_LOADED : false,
                    ygoObject: typeof window.YGO !== 'undefined',
                    ygoObjectKeys: typeof window.YGO !== 'undefined' ? Object.keys(window.YGO) : [],
                    mouseUIElements: document.querySelectorAll('[id*="mouse"], [class*="mouse"], [id*="ygo"]').length,
                    deckAreas: document.querySelectorAll('[id*="deck"], [class*="deck"]').length,
                    extensionElements: document.querySelectorAll('[id*="ygo"], [class*="ygo-extension"]').length
                };
            });

            console.log('拡張機能ステータス:', extensionStatus);

            this.addTestResult('YGO_DECK_SUPPORT_LOADEDフラグ', 
                extensionStatus.ygoLoaded, 
                extensionStatus.ygoLoaded ? 'フラグ設定済み' : 'フラグ未設定');

            this.addTestResult('グローバルYGOオブジェクト', 
                extensionStatus.ygoObject, 
                extensionStatus.ygoObject ? `${extensionStatus.ygoObjectKeys.length}個のキー: ${extensionStatus.ygoObjectKeys.join(', ')}` : 'オブジェクト未設定');

            this.addTestResult('MouseUI要素', 
                extensionStatus.mouseUIElements > 0, 
                `${extensionStatus.mouseUIElements}個の要素検出`);

            this.addTestResult('デッキエリア要素', 
                extensionStatus.deckAreas > 0, 
                `${extensionStatus.deckAreas}個の要素検出`);

            this.addTestResult('拡張機能UI要素', 
                extensionStatus.extensionElements > 0, 
                `${extensionStatus.extensionElements}個の要素検出`);

            // スクリーンショット撮影
            const screenshotPath = `playwright/screenshots/windows-profile-test-${new Date().toISOString().split('T')[0]}.png`;
            await this.page.screenshot({ 
                path: screenshotPath, 
                fullPage: true 
            });
            console.log(`📸 スクリーンショット保存: ${screenshotPath}`);

        } catch (error) {
            this.addTestResult('拡張機能動作確認', false, `エラー: ${error.message}`);
        }
    }

    /**
     * テスト結果の出力
     */
    async generateReport() {
        const summary = {
            total: this.testResults.length,
            passed: this.testResults.filter(r => r.passed).length,
            failed: this.testResults.filter(r => r.failed).length,
            successRate: ((this.testResults.filter(r => r.passed).length / this.testResults.length) * 100).toFixed(1)
        };

        console.log('\n📊 Windows Profile テスト結果サマリー');
        console.log('============================================================');
        console.log(`📈 総テスト数: ${summary.total}`);
        console.log(`✅ 成功: ${summary.passed}`);
        console.log(`❌ 失敗: ${summary.failed}`);
        console.log(`📊 成功率: ${summary.successRate}%`);

        console.log('\n📋 詳細結果:');
        this.testResults.forEach((result, index) => {
            console.log(`${index + 1}. ${result.passed ? '✅' : '❌'} ${result.name}`);
            console.log(`   ${result.details}`);
        });

        // JSONレポート出力
        const report = {
            timestamp: new Date().toISOString(),
            environment: 'Windows Chrome Profile',
            summary,
            details: this.testResults
        };

        const fs = require('fs');
        fs.writeFileSync('../reports/windows-profile-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📁 詳細レポートを windows-profile-test-report.json に保存しました');
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
     * メインテスト実行
     */
    async run() {
        try {
            console.log('🎯 遊戯王DBデッキサポート - Windows Profile テスト開始\n');

            // 環境初期化
            const initialized = await this.initializeContext();
            if (!initialized) {
                throw new Error('環境初期化に失敗しました');
            }

            // ログイン状態確認
            await this.checkLoginStatus();

            // レポート生成
            await this.generateReport();

            console.log('\n🏁 Windows Profile テストが完了しました');
            console.log('💡 ブラウザを開いたままにして手動での追加確認も可能です');
            console.log('🛑 終了する場合は Ctrl+C を押してください');

        } catch (error) {
            console.error('❌ テスト実行エラー:', error.message);
            this.addTestResult('テスト実行', false, error.message);
            await this.generateReport();
        }
    }
}

// テスト実行
if (require.main === module) {
    const test = new WindowsProfileTest();
    
    // Ctrl+C ハンドラ
    process.on('SIGINT', async () => {
        console.log('\n🛑 テストを中断しています...');
        await test.cleanup();
        process.exit(0);
    });

    test.run().catch(console.error);
}

module.exports = WindowsProfileTest;