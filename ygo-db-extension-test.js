/**
 * 遊戯王DB拡張機能テスト実行版
 * ログイン状態で拡張機能の動作を詳細テスト
 */
const { chromium } = require('playwright');

class YugiohDBExtensionTest {
    constructor() {
        this.context = null;
        this.page = null;
        this.sessionDir = '/home/tomo/work/app/YGO_deck_extension/playwright-session';
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 遊戯王DB拡張機能テスト開始...');
        
        try {
            this.context = await chromium.launchPersistentContext(this.sessionDir, {
                headless: false,
                args: [
                    '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                    '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=TranslateUI',
                    '--disable-blink-features=AutomationControlled'
                ],
                ignoreHTTPSErrors: true,
                timeout: 60000,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            });

            const pages = this.context.pages();
            this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
            
            console.log('✅ テスト環境初期化成功');
            return true;
            
        } catch (error) {
            console.error('❌ テスト環境初期化失敗:', error.message);
            return false;
        }
    }

    addTestResult(testName, passed, details = '') {
        this.testResults.push({
            name: testName,
            passed,
            details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${testName}${details ? ': ' + details : ''}`);
    }

    async testHomePage() {
        console.log('🏠 テスト1: ホームページ機能確認');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(3000);
            
            const url = this.page.url();
            const title = await this.page.title();
            
            this.addTestResult('ホームページアクセス', 
                url.includes('yugiohdb'), 
                `URL: ${url}`);
            
            this.addTestResult('ページタイトル', 
                title.includes('遊戯王') || title.includes('Yu-Gi-Oh'), 
                `タイトル: ${title}`);
            
            // Quick Accessパネルの確認
            const quickAccess = await this.page.locator('#ygo-quick-access').first();
            const hasQuickAccess = await quickAccess.isVisible();
            
            this.addTestResult('Quick Accessパネル表示', 
                hasQuickAccess, 
                hasQuickAccess ? '表示されています' : '表示されていません');
            
            if (hasQuickAccess) {
                // ヘルプボタンのテスト
                const helpButton = await this.page.locator('#ygo-home-help').first();
                const hasHelpButton = await helpButton.isVisible();
                
                this.addTestResult('ヘルプボタン表示', 
                    hasHelpButton, 
                    hasHelpButton ? 'ボタンが表示されています' : 'ボタンが見つかりません');
                
                if (hasHelpButton) {
                    try {
                        await helpButton.click();
                        await this.page.waitForTimeout(1000);
                        this.addTestResult('ヘルプボタン動作', true, 'クリック成功');
                    } catch (e) {
                        this.addTestResult('ヘルプボタン動作', false, 'クリック失敗');
                    }
                }
            }
            
            return true;
            
        } catch (error) {
            this.addTestResult('ホームページテスト', false, `エラー: ${error.message}`);
            return false;
        }
    }

    async testCardSearchPage() {
        console.log('🔍 テスト2: カード検索ページ機能確認');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(5000);
            
            const url = this.page.url();
            this.addTestResult('カード検索ページアクセス', 
                url.includes('card_search'), 
                `URL: ${url}`);
            
            // 検索フォームの存在確認
            const searchForm = await this.page.locator('form').first();
            const hasSearchForm = await searchForm.isVisible();
            
            this.addTestResult('検索フォーム表示', 
                hasSearchForm, 
                hasSearchForm ? 'フォームが表示されています' : 'フォームが見つかりません');
            
            // 拡張機能要素の確認
            const extensionElements = await this.page.evaluate(() => {
                const elements = [];
                const selectors = ['#ygo-status', '.ygo-extension', '[id*="ygo"]', '[class*="ygo"]'];
                
                selectors.forEach(selector => {
                    const found = document.querySelectorAll(selector);
                    if (found.length > 0) {
                        elements.push({
                            selector,
                            count: found.length
                        });
                    }
                });
                
                return elements;
            });
            
            this.addTestResult('拡張機能要素検出', 
                extensionElements.length > 0, 
                `${extensionElements.length}種類の要素を検出`);
            
            if (extensionElements.length > 0) {
                extensionElements.forEach(elem => {
                    console.log(`    - ${elem.selector}: ${elem.count}個`);
                });
            }
            
            return true;
            
        } catch (error) {
            this.addTestResult('カード検索ページテスト', false, `エラー: ${error.message}`);
            return false;
        }
    }

    async testDeckEditPage() {
        console.log('🃏 テスト3: デッキ編集ページ機能確認（メイン機能）');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_edit.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(8000); // デッキ編集ページは読み込みに時間がかかる
            
            const url = this.page.url();
            
            if (url.includes('login') || url.includes('signin')) {
                this.addTestResult('デッキ編集ページアクセス', false, 'ログインページにリダイレクトされました');
                return false;
            }
            
            this.addTestResult('デッキ編集ページアクセス', 
                url.includes('deck_edit') || url.includes('deck'), 
                `URL: ${url}`);
            
            // MouseUI関連要素の確認（更新されたセレクター）
            const mouseUIElements = await this.page.evaluate(() => {
                const elements = {
                    mouseUI: document.querySelector('#ygo-mouse-ui') !== null,
                    deckArea: document.querySelector('.ygo-deck-area') !== null || 
                             document.querySelector('#ygo-deck-area-main') !== null ||
                             document.querySelector('#ygo-deck-area-extra') !== null ||
                             document.querySelector('#ygo-deck-area-side') !== null,
                    cardArea: document.querySelector('.ygo-card-area') !== null || 
                             document.querySelector('#ygo-card-area') !== null,
                    mouseUIPanel: document.querySelector('.ygo-mouse-ui-panel') !== null,
                    deckSupportUI: document.querySelector('#ygo-deck-support-ui') !== null,
                    allYgoElements: document.querySelectorAll('[id*="ygo"], [class*="ygo"]').length,
                    // 個別デッキエリアの確認
                    mainDeckArea: document.querySelector('#ygo-deck-area-main') !== null,
                    extraDeckArea: document.querySelector('#ygo-deck-area-extra') !== null,
                    sideDeckArea: document.querySelector('#ygo-deck-area-side') !== null,
                    // MouseUIコントロールの確認
                    mouseUIToggle: document.querySelector('#mouse-ui-toggle') !== null,
                    mouseUIControls: document.querySelector('#mouse-ui-controls') !== null
                };
                
                return elements;
            });
            
            this.addTestResult('MouseUI要素検出', 
                mouseUIElements.mouseUI, 
                mouseUIElements.mouseUI ? 'MouseUI要素が見つかりました' : 'MouseUI要素が見つかりません');
            
            this.addTestResult('デッキエリア検出', 
                mouseUIElements.deckArea, 
                mouseUIElements.deckArea ? 'デッキエリアが見つかりました' : 'デッキエリアが見つかりません');
            
            this.addTestResult('カードエリア検出', 
                mouseUIElements.cardArea, 
                mouseUIElements.cardArea ? 'カードエリアが見つかりました' : 'カードエリアが見つかりません');
            
            this.addTestResult('YGO拡張要素総数', 
                mouseUIElements.allYgoElements > 0, 
                `${mouseUIElements.allYgoElements}個の要素を検出`);
            
            // デッキ編集機能の実際のテスト
            if (mouseUIElements.deckArea || mouseUIElements.cardArea) {
                await this.testDeckEditFunctionality();
            }
            
            return true;
            
        } catch (error) {
            this.addTestResult('デッキ編集ページテスト', false, `エラー: ${error.message}`);
            return false;
        }
    }

    async testDeckEditFunctionality() {
        console.log('  🎮 デッキ編集機能詳細テスト...');
        
        try {
            // カード要素の確認
            const cardElements = await this.page.evaluate(() => {
                const cards = document.querySelectorAll('.card, [class*="card"], img[src*="card"]');
                return {
                    totalCards: cards.length,
                    cardImages: Array.from(cards).slice(0, 5).map(card => ({
                        tagName: card.tagName,
                        className: card.className,
                        src: card.src || 'N/A'
                    }))
                };
            });
            
            this.addTestResult('カード要素検出', 
                cardElements.totalCards > 0, 
                `${cardElements.totalCards}個のカード要素を検出`);
            
            // マウスイベントのテスト
            if (cardElements.totalCards > 0) {
                try {
                    // 最初のカード要素にマウスを移動
                    const firstCard = await this.page.locator('.card, [class*="card"], img[src*="card"]').first();
                    if (await firstCard.isVisible()) {
                        const box = await firstCard.boundingBox();
                        if (box) {
                            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                            await this.page.waitForTimeout(1000);
                            
                            this.addTestResult('マウス操作テスト', true, 'カード要素へのマウス移動成功');
                        }
                    }
                } catch (e) {
                    this.addTestResult('マウス操作テスト', false, `マウス操作エラー: ${e.message}`);
                }
            }
            
            // デッキ保存・読み込み機能の確認
            const deckFunctions = await this.page.evaluate(() => {
                const functions = {
                    saveButton: document.querySelector('button:has-text("保存"), input[value*="保存"], [onclick*="save"]') !== null,
                    loadButton: document.querySelector('button:has-text("読み込"), input[value*="読み込"], [onclick*="load"]') !== null,
                    exportButton: document.querySelector('button:has-text("エクスポート"), [onclick*="export"]') !== null,
                    importButton: document.querySelector('button:has-text("インポート"), [onclick*="import"]') !== null,
                    ygoSaveFunction: typeof window.saveYgoDeck === 'function',
                    ygoLoadFunction: typeof window.loadYgoDeck === 'function'
                };
                
                return functions;
            });
            
            this.addTestResult('デッキ保存ボタン', 
                deckFunctions.saveButton, 
                deckFunctions.saveButton ? '保存ボタンが見つかりました' : '保存ボタンが見つかりません');
            
            this.addTestResult('デッキ読み込みボタン', 
                deckFunctions.loadButton, 
                deckFunctions.loadButton ? '読み込みボタンが見つかりました' : '読み込みボタンが見つかりません');
            
            this.addTestResult('YGO保存関数', 
                deckFunctions.ygoSaveFunction, 
                deckFunctions.ygoSaveFunction ? 'YGO保存関数が定義されています' : 'YGO保存関数が見つかりません');
            
            this.addTestResult('YGO読み込み関数', 
                deckFunctions.ygoLoadFunction, 
                deckFunctions.ygoLoadFunction ? 'YGO読み込み関数が定義されています' : 'YGO読み込み関数が見つかりません');
            
        } catch (error) {
            this.addTestResult('デッキ編集機能テスト', false, `エラー: ${error.message}`);
        }
    }

    async testConsoleAndErrors() {
        console.log('🔧 テスト4: コンソールエラーと拡張機能ログ確認');
        
        try {
            const consoleInfo = await this.page.evaluate(() => {
                // YGOオブジェクトの詳細確認
                const ygoObjectDetails = {};
                if (typeof window.YGO === 'object') {
                    ygoObjectDetails.main = true;
                    ygoObjectDetails.deckSupport = typeof window.YGO.DeckSupport === 'object';
                    ygoObjectDetails.mouseUI = typeof window.YGO.MouseUI === 'object';
                    ygoObjectDetails.deckManager = typeof window.YGO.DeckManager === 'object';
                    ygoObjectDetails.cardSearch = typeof window.YGO.CardSearch === 'object';
                    ygoObjectDetails.utils = typeof window.YGO.Utils === 'object';
                    ygoObjectDetails.events = typeof window.YGO.Events === 'object';
                }
                
                return {
                    ygoLoaded: typeof window.YGO_DECK_SUPPORT_LOADED !== 'undefined' && window.YGO_DECK_SUPPORT_LOADED === true,
                    ygoVersion: (window.YGO && window.YGO.DeckSupport && window.YGO.DeckSupport.version) || window.YGO_DECK_SUPPORT_VERSION || 'unknown',
                    extensionErrors: window.YGO_EXTENSION_ERRORS || [],
                    globalYgoObjects: Object.keys(window).filter(key => key.includes('YGO') || key.includes('ygo')),
                    ygoObjectDetails: ygoObjectDetails,
                    ygoMainObject: typeof window.YGO === 'object',
                    ygoObjectKeys: window.YGO ? Object.keys(window.YGO) : []
                };
            });
            
            this.addTestResult('YGO_DECK_SUPPORT_LOADED', 
                consoleInfo.ygoLoaded, 
                consoleInfo.ygoLoaded ? `バージョン: ${consoleInfo.ygoVersion}` : '読み込まれていません');
            
            this.addTestResult('拡張機能エラー', 
                consoleInfo.extensionErrors.length === 0, 
                consoleInfo.extensionErrors.length > 0 ? `${consoleInfo.extensionErrors.length}個のエラー` : 'エラーなし');
            
            this.addTestResult('グローバルYGOオブジェクト', 
                consoleInfo.ygoMainObject && consoleInfo.ygoObjectKeys.length > 0, 
                consoleInfo.ygoMainObject ? `YGOオブジェクト: ${consoleInfo.ygoObjectKeys.join(', ')}` : '0個のYGO関連オブジェクト');
            
            // 詳細なYGOオブジェクト情報をログ出力
            if (consoleInfo.ygoMainObject) {
                console.log(`    YGOメインオブジェクト: 存在`);
                console.log(`    YGOサブオブジェクト: ${consoleInfo.ygoObjectKeys.join(', ')}`);
                Object.entries(consoleInfo.ygoObjectDetails).forEach(([key, value]) => {
                    console.log(`      ${key}: ${value ? '✓' : '✗'}`);
                });
            }
            
            if (consoleInfo.globalYgoObjects.length > 0) {
                console.log(`    グローバルYGO変数: ${consoleInfo.globalYgoObjects.join(', ')}`);
            }
            
            return true;
            
        } catch (error) {
            this.addTestResult('コンソール確認テスト', false, `エラー: ${error.message}`);
            return false;
        }
    }

    async testNavigationAndPageTransitions() {
        console.log('🔄 テスト5: ページ遷移と拡張機能継続性');
        
        const testPages = [
            { name: 'ホーム', url: 'https://www.db.yugioh-card.com/yugiohdb/' },
            { name: 'カード検索', url: 'https://www.db.yugioh-card.com/yugiohdb/card_search.action' },
            { name: 'デッキ検索', url: 'https://www.db.yugioh-card.com/yugiohdb/deck_search.action' }
        ];
        
        let successfulTransitions = 0;
        let extensionPersistence = 0;
        
        for (const testPage of testPages) {
            try {
                await this.page.goto(testPage.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });
                
                await this.page.waitForTimeout(3000);
                
                const url = this.page.url();
                if (url.includes(testPage.url.split('/').pop().split('.')[0])) {
                    successfulTransitions++;
                    
                    // 各ページでの拡張機能要素確認
                    const hasExtension = await this.page.evaluate(() => {
                        return document.querySelectorAll('[id*="ygo"], [class*="ygo"]').length > 0;
                    });
                    
                    if (hasExtension) {
                        extensionPersistence++;
                    }
                    
                    console.log(`    ✅ ${testPage.name}ページ: 拡張機能${hasExtension ? '動作中' : '未検出'}`);
                }
                
            } catch (error) {
                console.log(`    ❌ ${testPage.name}ページ: アクセス失敗`);
            }
        }
        
        this.addTestResult('ページ遷移成功率', 
            successfulTransitions === testPages.length, 
            `${successfulTransitions}/${testPages.length}ページ成功`);
        
        this.addTestResult('拡張機能継続性', 
            extensionPersistence > 0, 
            `${extensionPersistence}/${testPages.length}ページで動作確認`);
        
        return successfulTransitions > 0;
    }

    generateTestReport() {
        console.log('\n📊 テスト結果レポート');
        console.log('='.repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
        
        console.log(`📈 総テスト数: ${totalTests}`);
        console.log(`✅ 成功: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`📊 成功率: ${successRate}%`);
        console.log('');
        
        // カテゴリ別結果
        const categories = {
            '基本機能': this.testResults.filter(r => r.name.includes('ページアクセス') || r.name.includes('タイトル')),
            '拡張機能UI': this.testResults.filter(r => r.name.includes('Quick Access') || r.name.includes('拡張機能要素') || r.name.includes('MouseUI')),
            'デッキ編集': this.testResults.filter(r => r.name.includes('デッキ') || r.name.includes('カード') || r.name.includes('マウス')),
            'システム': this.testResults.filter(r => r.name.includes('YGO_DECK') || r.name.includes('エラー') || r.name.includes('継続性'))
        };
        
        Object.entries(categories).forEach(([category, tests]) => {
            if (tests.length > 0) {
                const categoryPassed = tests.filter(t => t.passed).length;
                const categoryRate = ((categoryPassed / tests.length) * 100).toFixed(1);
                console.log(`📋 ${category}: ${categoryPassed}/${tests.length} (${categoryRate}%)`);
            }
        });
        
        console.log('');
        console.log('📋 詳細結果:');
        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.name}`);
            if (result.details) {
                console.log(`   ${result.details}`);
            }
        });
        
        // 推奨事項
        console.log('');
        console.log('💡 推奨事項:');
        
        if (failedTests === 0) {
            console.log('   🎉 すべてのテストが成功しました！拡張機能は正常に動作しています。');
        } else {
            if (this.testResults.some(r => !r.passed && r.name.includes('MouseUI'))) {
                console.log('   - MouseUI機能の実装を確認してください');
            }
            if (this.testResults.some(r => !r.passed && r.name.includes('YGO_DECK_SUPPORT_LOADED'))) {
                console.log('   - content.jsでのYGO_DECK_SUPPORT_LOADEDフラグ設定を確認してください');
            }
            if (this.testResults.some(r => !r.passed && r.name.includes('デッキ編集ページ'))) {
                console.log('   - デッキ編集ページでのログイン状態を確認してください');
            }
        }
        
        // レポートをファイルに保存
        const reportData = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                successRate: parseFloat(successRate)
            },
            categories,
            details: this.testResults,
            timestamp: new Date().toISOString(),
            recommendations: []
        };
        
        const fs = require('fs');
        fs.writeFileSync('/home/tomo/work/app/YGO_deck_extension/extension-test-report.json', 
                         JSON.stringify(reportData, null, 2));
        console.log('\n📁 詳細レポートを extension-test-report.json に保存しました');
    }

    async runAllTests() {
        try {
            console.log('🎯 遊戯王DB拡張機能 包括テスト開始');
            console.log('');
            
            // 1. ホームページテスト
            await this.testHomePage();
            console.log('');
            
            // 2. カード検索ページテスト
            await this.testCardSearchPage();
            console.log('');
            
            // 3. デッキ編集ページテスト（メイン）
            await this.testDeckEditPage();
            console.log('');
            
            // 4. コンソール・エラー確認
            await this.testConsoleAndErrors();
            console.log('');
            
            // 5. ページ遷移テスト
            await this.testNavigationAndPageTransitions();
            console.log('');
            
            // テスト結果レポート生成
            this.generateTestReport();
            
        } catch (error) {
            console.error('💥 テスト実行中にエラーが発生:', error);
        }
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }
}

// テスト実行
const tester = new YugiohDBExtensionTest();

async function runTests() {
    const initSuccess = await tester.initialize();
    if (!initSuccess) {
        console.log('❌ テスト環境初期化失敗');
        return;
    }
    
    await tester.runAllTests();
    
    console.log('\n🏁 すべてのテストが完了しました');
    console.log('💡 ブラウザを開いたままにして手動での追加確認も可能です');
    console.log('🛑 終了する場合は Ctrl+C を押してください');
    
    // ブラウザを開いたままにする
    await new Promise(resolve => {
        process.on('SIGINT', async () => {
            console.log('\n🛑 テスト終了...');
            await tester.cleanup();
            process.exit(0);
        });
    });
}

runTests().catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});