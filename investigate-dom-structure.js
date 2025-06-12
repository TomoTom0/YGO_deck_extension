/**
 * 遊戯王DB DOM構造詳細調査ツール
 * remake/実装のための現在のサイト構造分析
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.resolve(__dirname, 'src');
const WINDOWS_CHROME_PROFILE = '/mnt/c/Users/tomo/AppData/Local/Google/Chrome/User Data/Profile 2';

class DOMStructureInvestigation {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.investigationResults = {
            timestamp: new Date().toISOString(),
            purpose: 'remake/ Phase 1.1 - MouseUI マウス操作マトリックス実装のための詳細DOM調査',
            results: []
        };
    }

    async initialize() {
        console.log('🔍 DOM構造詳細調査開始...');
        
        this.context = await chromium.launchPersistentContext(WINDOWS_CHROME_PROFILE, {
            headless: false,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--disable-web-security',
                '--no-sandbox'
            ],
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true
        });

        this.page = await this.context.newPage();
        console.log('✅ 調査環境初期化完了');
        return true;
    }

    /**
     * デッキ編集ページのエリア構造詳細調査
     */
    async investigateDeckEditAreas() {
        console.log('\n🃏 デッキ編集ページエリア構造調査...');
        
        try {
            // デッキ編集ページにアクセス
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            await this.page.waitForTimeout(3000);

            const areaAnalysis = await this.page.evaluate(() => {
                const analysis = {
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString()
                };

                // 5エリアの詳細調査
                const areas = {
                    main: { name: 'メインデッキ', elements: [] },
                    extra: { name: 'エクストラデッキ', elements: [] },
                    side: { name: 'サイドデッキ', elements: [] },
                    temp: { name: 'テンポラリエリア', elements: [] },
                    search: { name: '検索エリア', elements: [] }
                };

                // メインデッキエリア検出
                const mainSelectors = [
                    '[class*="main"]', '[id*="main"]',
                    '.deck_set:nth-child(1)', '.deck_list:nth-child(1)',
                    '[class*="メイン"]', '[class*="Main"]'
                ];
                
                mainSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                            areas.main.elements.push({
                                selector: selector,
                                tag: el.tagName,
                                id: el.id,
                                className: el.className,
                                textContent: el.textContent.slice(0, 100),
                                boundingBox: {
                                    x: el.offsetLeft,
                                    y: el.offsetTop,
                                    width: el.offsetWidth,
                                    height: el.offsetHeight
                                },
                                childrenCount: el.children.length,
                                hasCards: el.querySelectorAll('img, [class*="card"], [onclick]').length
                            });
                        });
                    } catch (e) {
                        // セレクタエラーは無視
                    }
                });

                // エクストラデッキエリア検出
                const extraSelectors = [
                    '[class*="extra"]', '[id*="extra"]',
                    '.deck_set:nth-child(2)', '.deck_list:nth-child(2)',
                    '[class*="エクストラ"]', '[class*="Extra"]'
                ];
                
                extraSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                            areas.extra.elements.push({
                                selector: selector,
                                tag: el.tagName,
                                id: el.id,
                                className: el.className,
                                textContent: el.textContent.slice(0, 100),
                                boundingBox: {
                                    x: el.offsetLeft,
                                    y: el.offsetTop,
                                    width: el.offsetWidth,
                                    height: el.offsetHeight
                                },
                                childrenCount: el.children.length,
                                hasCards: el.querySelectorAll('img, [class*="card"], [onclick]').length
                            });
                        });
                    } catch (e) {
                        // セレクタエラーは無視
                    }
                });

                // サイドデッキエリア検出
                const sideSelectors = [
                    '[class*="side"]', '[id*="side"]',
                    '.deck_set:nth-child(3)', '.deck_list:nth-child(3)',
                    '[class*="サイド"]', '[class*="Side"]'
                ];
                
                sideSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                            areas.side.elements.push({
                                selector: selector,
                                tag: el.tagName,
                                id: el.id,
                                className: el.className,
                                textContent: el.textContent.slice(0, 100),
                                boundingBox: {
                                    x: el.offsetLeft,
                                    y: el.offsetTop,
                                    width: el.offsetWidth,
                                    height: el.offsetHeight
                                },
                                childrenCount: el.children.length,
                                hasCards: el.querySelectorAll('img, [class*="card"], [onclick]').length
                            });
                        });
                    } catch (e) {
                        // セレクタエラーは無視
                    }
                });

                // カード要素の詳細検出
                const cardElements = Array.from(document.querySelectorAll('img[src*="card"], [onclick*="card"], [class*="card"]')).map(el => ({
                    tag: el.tagName,
                    src: el.src || '',
                    onclick: el.onclick ? el.onclick.toString().slice(0, 200) : '',
                    className: el.className,
                    id: el.id,
                    textContent: el.textContent.slice(0, 50),
                    boundingBox: {
                        x: el.offsetLeft,
                        y: el.offsetTop,
                        width: el.offsetWidth,
                        height: el.offsetHeight
                    },
                    parent: {
                        tag: el.parentElement?.tagName,
                        className: el.parentElement?.className,
                        id: el.parentElement?.id
                    }
                }));

                // 全体レイアウト構造
                const layoutStructure = {
                    body: {
                        width: document.body.offsetWidth,
                        height: document.body.offsetHeight
                    },
                    mainContent: Array.from(document.querySelectorAll('main, .main, #main, article, .content')).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        boundingBox: {
                            x: el.offsetLeft,
                            y: el.offsetTop,
                            width: el.offsetWidth,
                            height: el.offsetHeight
                        }
                    })),
                    forms: Array.from(document.querySelectorAll('form')).map(form => ({
                        action: form.action,
                        method: form.method,
                        elements: form.elements.length,
                        boundingBox: {
                            x: form.offsetLeft,
                            y: form.offsetTop,
                            width: form.offsetWidth,
                            height: form.offsetHeight
                        }
                    }))
                };

                return {
                    analysis,
                    areas,
                    cardElements,
                    layoutStructure,
                    summary: {
                        totalCardElements: cardElements.length,
                        areaElementCounts: {
                            main: areas.main.elements.length,
                            extra: areas.extra.elements.length,
                            side: areas.side.elements.length,
                            temp: areas.temp.elements.length,
                            search: areas.search.elements.length
                        }
                    }
                };
            });

            this.investigationResults.results.push({
                type: 'deck_edit_areas_analysis',
                data: areaAnalysis
            });

            console.log(`📊 調査結果:`);
            console.log(`- カード要素総数: ${areaAnalysis.summary.totalCardElements}`);
            console.log(`- メインエリア候補: ${areaAnalysis.summary.areaElementCounts.main}`);
            console.log(`- エクストラエリア候補: ${areaAnalysis.summary.areaElementCounts.extra}`);
            console.log(`- サイドエリア候補: ${areaAnalysis.summary.areaElementCounts.side}`);

            // スクリーンショット撮影
            await this.page.screenshot({ 
                path: 'playwright/screenshots/dom-structure-investigation.png',
                fullPage: true 
            });

        } catch (error) {
            console.error('❌ DOM構造調査エラー:', error);
        }
    }

    /**
     * マウス操作テストの実行
     */
    async testMouseOperations() {
        console.log('\n🖱️ マウス操作テスト...');
        
        try {
            const mouseTestResults = await this.page.evaluate(() => {
                const results = {
                    clickableElements: [],
                    eventSupport: {}
                };

                // クリック可能要素の検出
                const clickableSelectors = [
                    'img[onclick]', 'img[src*="card"]',
                    '[onclick*="card"]', '[onclick*="deck"]',
                    'a[href*="card"]', 'button', 'input[type="button"]'
                ];

                clickableSelectors.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach((el, index) => {
                            if (index < 5) { // 最初の5要素のみ記録
                                results.clickableElements.push({
                                    selector: selector,
                                    tag: el.tagName,
                                    onclick: el.onclick ? el.onclick.toString().slice(0, 100) : '',
                                    href: el.href || '',
                                    src: el.src || '',
                                    className: el.className,
                                    id: el.id
                                });
                            }
                        });
                    } catch (e) {
                        // セレクタエラーは無視
                    }
                });

                // イベント対応状況チェック
                const testElement = document.createElement('div');
                results.eventSupport = {
                    click: 'onclick' in testElement,
                    contextmenu: 'oncontextmenu' in testElement,
                    wheel: 'onwheel' in testElement,
                    mousedown: 'onmousedown' in testElement,
                    mouseup: 'onmouseup' in testElement,
                    dblclick: 'ondblclick' in testElement
                };

                return results;
            });

            this.investigationResults.results.push({
                type: 'mouse_operations_test',
                data: mouseTestResults
            });

            console.log(`📊 マウス操作テスト結果:`);
            console.log(`- クリック可能要素: ${mouseTestResults.clickableElements.length}`);
            console.log(`- イベント対応: ${Object.entries(mouseTestResults.eventSupport).filter(([k,v]) => v).length}/6`);

        } catch (error) {
            console.error('❌ マウス操作テストエラー:', error);
        }
    }

    /**
     * 調査結果の保存
     */
    async saveResults() {
        const reportPath = 'dom-structure-investigation-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.investigationResults, null, 2));

        console.log('\n📊 DOM構造調査完了サマリー:');
        console.log('==========================================');
        console.log(`📁 調査項目: ${this.investigationResults.results.length}件`);
        console.log(`📁 詳細レポート: ${reportPath}`);
        console.log(`📸 スクリーンショット: playwright/screenshots/dom-structure-investigation.png`);
        
        return this.investigationResults;
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    async run() {
        try {
            await this.initialize();
            await this.investigateDeckEditAreas();
            await this.testMouseOperations();
            const results = await this.saveResults();

            console.log('\n🎉 DOM構造調査完了!');
            return results;

        } catch (error) {
            console.error('❌ 調査エラー:', error);
            throw error;
        }
    }
}

// 実行
if (require.main === module) {
    const investigation = new DOMStructureInvestigation();
    
    process.on('SIGINT', async () => {
        console.log('\n🛑 調査を中断しています...');
        await investigation.cleanup();
        process.exit(0);
    });

    investigation.run().catch(console.error);
}

module.exports = DOMStructureInvestigation;