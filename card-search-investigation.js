/**
 * 遊戯王DBカード検索機能調査ツール
 * 画面右側のカード検索エリアの構造を詳細に調査
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.resolve(__dirname, 'src');
const WINDOWS_CHROME_PROFILE = '/mnt/c/Users/tomo/AppData/Local/Google/Chrome/User Data/Profile 2';

class CardSearchInvestigation {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.investigationResults = [];
    }

    async initialize() {
        console.log('🔍 カード検索機能調査開始...');
        
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
        
        // コンソールログをキャプチャ
        this.page.on('console', msg => {
            if (msg.text().includes('YGO') || msg.text().includes('card') || msg.text().includes('search')) {
                console.log(`[PAGE] ${msg.type()}: ${msg.text()}`);
            }
        });

        console.log('✅ 調査環境初期化完了');
        return true;
    }

    /**
     * カード検索ページの詳細調査
     */
    async investigateCardSearchPage() {
        console.log('\n📖 カード検索ページ調査...');
        
        try {
            // カード検索ページにアクセス
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            await this.page.waitForTimeout(3000); // ページ完全読み込み待ち

            // ページ構造の詳細分析
            const pageAnalysis = await this.page.evaluate(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    
                    // 検索フォーム関連
                    searchForms: Array.from(document.querySelectorAll('form')).map(form => ({
                        id: form.id,
                        className: form.className,
                        action: form.action,
                        method: form.method,
                        elements: form.elements.length
                    })),
                    
                    // 検索結果エリア候補
                    possibleResultAreas: Array.from(document.querySelectorAll([
                        '[class*="result"]',
                        '[id*="result"]', 
                        '[class*="card"]',
                        '[id*="card"]',
                        '[class*="list"]',
                        '[id*="list"]',
                        '.content',
                        '#content',
                        'main',
                        'article'
                    ].join(','))).map(el => ({
                        tag: el.tagName,
                        id: el.id,
                        className: el.className,
                        childrenCount: el.children.length,
                        textContent: el.textContent.slice(0, 100),
                        visible: el.offsetParent !== null
                    })),
                    
                    // 入力フィールド
                    inputFields: Array.from(document.querySelectorAll('input, select, textarea')).map(input => ({
                        type: input.type,
                        name: input.name,
                        id: input.id,
                        className: input.className,
                        placeholder: input.placeholder,
                        value: input.value
                    })),
                    
                    // ボタン
                    buttons: Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map(btn => ({
                        type: btn.type,
                        id: btn.id,
                        className: btn.className,
                        textContent: btn.textContent || btn.value,
                        onclick: btn.onclick ? btn.onclick.toString().slice(0, 100) : null
                    }))
                };
            });

            this.investigationResults.push({
                type: 'card_search_page_analysis',
                timestamp: new Date().toISOString(),
                data: pageAnalysis
            });

            console.log(`📋 検索フォーム数: ${pageAnalysis.searchForms.length}`);
            console.log(`📋 入力フィールド数: ${pageAnalysis.inputFields.length}`);
            console.log(`📋 検索結果エリア候補: ${pageAnalysis.possibleResultAreas.length}`);

            // スクリーンショット撮影
            await this.page.screenshot({ 
                path: 'playwright/screenshots/card-search-page-analysis.png',
                fullPage: true 
            });

        } catch (error) {
            console.error('❌ カード検索ページ調査エラー:', error);
        }
    }

    /**
     * 実際の検索実行とレスポンス調査
     */
    async investigateSearchExecution() {
        console.log('\n🔍 検索実行とレスポンス調査...');
        
        try {
            // 簡単な検索を実行（例: カード名 "ブルー"）
            const searchInput = await this.page.locator('input[name*="keyword"], input[name*="card"], input[type="text"]').first();
            
            if (await searchInput.isVisible()) {
                console.log('📝 検索フィールドに入力中...');
                await searchInput.fill('ブルーアイズ');
                await this.page.waitForTimeout(1000);

                // 検索実行ボタンを探してクリック
                const searchButton = await this.page.locator([
                    'input[type="submit"]',
                    'button[type="submit"]', 
                    'button:has-text("検索")',
                    'input[value*="検索"]'
                ].join(', ')).first();

                if (await searchButton.isVisible()) {
                    console.log('🔍 検索実行...');
                    
                    // ネットワークレスポンスを監視
                    const responsePromise = this.page.waitForResponse(response => 
                        response.url().includes('card') || 
                        response.url().includes('search') ||
                        response.url().includes('result')
                    );

                    await searchButton.click();
                    
                    try {
                        const response = await responsePromise;
                        console.log(`📡 レスポンス URL: ${response.url()}`);
                        console.log(`📡 ステータス: ${response.status()}`);
                    } catch (timeoutError) {
                        console.log('⏰ レスポンス待機タイムアウト（ページリダイレクトの可能性）');
                    }

                    // 検索結果ページの読み込み待ち
                    await this.page.waitForTimeout(5000);

                    // 検索結果ページの分析
                    await this.analyzeSearchResults();
                }
            }

        } catch (error) {
            console.error('❌ 検索実行調査エラー:', error);
        }
    }

    /**
     * 検索結果ページの詳細分析
     */
    async analyzeSearchResults() {
        console.log('\n📊 検索結果ページ分析...');
        
        try {
            const resultsAnalysis = await this.page.evaluate(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    
                    // カード結果要素の検出
                    cardElements: Array.from(document.querySelectorAll([
                        '[class*="card"]',
                        '[id*="card"]',
                        '[class*="result"]',
                        '[class*="item"]',
                        'tr', // テーブル行
                        'li', // リストアイテム
                        '.row',
                        '[data-card]'
                    ].join(','))).map(el => ({
                        tag: el.tagName,
                        id: el.id,
                        className: el.className,
                        textContent: el.textContent.slice(0, 150),
                        hasImage: el.querySelector('img') !== null,
                        hasLinks: el.querySelector('a') !== null,
                        clickable: el.onclick !== null || el.style.cursor === 'pointer',
                        boundingBox: {
                            width: el.offsetWidth,
                            height: el.offsetHeight
                        },
                        visible: el.offsetParent !== null
                    })).filter(el => 
                        el.textContent.includes('ブルー') || 
                        el.textContent.includes('青') ||
                        el.className.includes('card') ||
                        el.id.includes('card') ||
                        (el.hasImage && el.boundingBox.width > 50)
                    ),
                    
                    // ページネーション
                    pagination: Array.from(document.querySelectorAll([
                        '[class*="page"]',
                        '[class*="nav"]',
                        'a[href*="page"]',
                        'button[onclick*="page"]'
                    ].join(','))).map(el => ({
                        tag: el.tagName,
                        className: el.className,
                        textContent: el.textContent,
                        href: el.href
                    })),
                    
                    // 検索結果統計
                    resultStats: {
                        totalElements: document.querySelectorAll('*').length,
                        imageCount: document.querySelectorAll('img').length,
                        linkCount: document.querySelectorAll('a').length,
                        tableCount: document.querySelectorAll('table').length
                    }
                };
            });

            this.investigationResults.push({
                type: 'search_results_analysis',
                timestamp: new Date().toISOString(),
                data: resultsAnalysis
            });

            console.log(`📋 検出されたカード要素: ${resultsAnalysis.cardElements.length}`);
            console.log(`📋 ページネーション要素: ${resultsAnalysis.pagination.length}`);
            console.log(`📋 画像要素: ${resultsAnalysis.resultStats.imageCount}`);

            // 検索結果ページのスクリーンショット
            await this.page.screenshot({ 
                path: 'playwright/screenshots/card-search-results-analysis.png',
                fullPage: true 
            });

            // 個別カード要素のスクリーンショット（最初の3つ）
            const cardElements = await this.page.locator('[class*="card"], tr, li').all();
            for (let i = 0; i < Math.min(3, cardElements.length); i++) {
                try {
                    if (await cardElements[i].isVisible()) {
                        await cardElements[i].screenshot({ 
                            path: `playwright/screenshots/card-element-${i + 1}.png` 
                        });
                    }
                } catch (error) {
                    console.log(`⚠️ カード要素 ${i + 1} のスクリーンショット失敗`);
                }
            }

        } catch (error) {
            console.error('❌ 検索結果分析エラー:', error);
        }
    }

    /**
     * デッキ編集ページでの検索エリア調査
     */
    async investigateDeckEditSearchArea() {
        console.log('\n🃏 デッキ編集ページの検索エリア調査...');
        
        try {
            // デッキ編集ページにアクセス
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=2', {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            await this.page.waitForTimeout(3000);

            const deckEditAnalysis = await this.page.evaluate(() => {
                return {
                    url: window.location.href,
                    title: document.title,
                    
                    // 右側のカード検索エリアの検出
                    rightSideAreas: Array.from(document.querySelectorAll([
                        '[style*="float: right"]',
                        '[style*="position: absolute"][style*="right"]',
                        '.right',
                        '.sidebar',
                        '.search-area',
                        'iframe', // iframe内の可能性
                        '[class*="card-search"]',
                        '[id*="search"]'
                    ].join(','))).map(el => ({
                        tag: el.tagName,
                        id: el.id,
                        className: el.className,
                        style: el.style.cssText,
                        boundingBox: {
                            x: el.offsetLeft,
                            y: el.offsetTop,
                            width: el.offsetWidth,
                            height: el.offsetHeight
                        },
                        childrenCount: el.children.length,
                        hasSearchElements: el.querySelectorAll('input, select, button').length > 0,
                        visible: el.offsetParent !== null
                    })),
                    
                    // レイアウト構造
                    layoutStructure: {
                        bodyWidth: document.body.offsetWidth,
                        bodyHeight: document.body.offsetHeight,
                        mainContent: Array.from(document.querySelectorAll('main, .main, #main, .content, #content')).map(el => ({
                            tag: el.tagName,
                            className: el.className,
                            boundingBox: {
                                x: el.offsetLeft,
                                width: el.offsetWidth
                            }
                        }))
                    },
                    
                    // iframe検出
                    iframes: Array.from(document.querySelectorAll('iframe')).map(iframe => ({
                        src: iframe.src,
                        width: iframe.width,
                        height: iframe.height,
                        id: iframe.id,
                        className: iframe.className
                    }))
                };
            });

            this.investigationResults.push({
                type: 'deck_edit_search_area_analysis',
                timestamp: new Date().toISOString(),
                data: deckEditAnalysis
            });

            console.log(`📋 右側エリア候補: ${deckEditAnalysis.rightSideAreas.length}`);
            console.log(`📋 iframe要素: ${deckEditAnalysis.iframes.length}`);

            // デッキ編集ページのスクリーンショット
            await this.page.screenshot({ 
                path: 'playwright/screenshots/deck-edit-search-area-analysis.png',
                fullPage: true 
            });

        } catch (error) {
            console.error('❌ デッキ編集ページ調査エラー:', error);
        }
    }

    /**
     * 調査結果の保存とレポート生成
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            investigation: 'YGO Card Search Functionality',
            results: this.investigationResults,
            summary: {
                totalInvestigations: this.investigationResults.length,
                pagesCovered: ['card_search', 'search_results', 'deck_edit'],
                keyFindings: []
            }
        };

        // キーファインディングの生成
        this.investigationResults.forEach(result => {
            if (result.type === 'card_search_page_analysis') {
                report.summary.keyFindings.push(`検索フォーム: ${result.data.searchForms.length}個`);
                report.summary.keyFindings.push(`入力フィールド: ${result.data.inputFields.length}個`);
            } else if (result.type === 'search_results_analysis') {
                report.summary.keyFindings.push(`カード要素検出: ${result.data.cardElements.length}個`);
            } else if (result.type === 'deck_edit_search_area_analysis') {
                report.summary.keyFindings.push(`右側エリア候補: ${result.data.rightSideAreas.length}個`);
                report.summary.keyFindings.push(`iframe要素: ${result.data.iframes.length}個`);
            }
        });

        const reportPath = 'card-search-investigation-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n📊 調査完了サマリー:');
        console.log('==========================================');
        console.log(`📁 調査結果: ${report.summary.totalInvestigations}件`);
        report.summary.keyFindings.forEach(finding => {
            console.log(`📋 ${finding}`);
        });
        console.log(`📁 詳細レポート: ${reportPath}`);
        console.log(`📸 スクリーンショット: playwright/screenshots/`);
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    async run() {
        try {
            await this.initialize();
            await this.investigateCardSearchPage();
            await this.investigateSearchExecution();
            await this.investigateDeckEditSearchArea();
            await this.generateReport();

            console.log('\n🎉 カード検索機能調査完了!');
            console.log('💡 ブラウザを開いたままにして手動確認も可能です');

        } catch (error) {
            console.error('❌ 調査エラー:', error);
        }
    }
}

// 実行
if (require.main === module) {
    const investigation = new CardSearchInvestigation();
    
    process.on('SIGINT', async () => {
        console.log('\n🛑 調査を中断しています...');
        await investigation.cleanup();
        process.exit(0);
    });

    investigation.run().catch(console.error);
}

module.exports = CardSearchInvestigation;