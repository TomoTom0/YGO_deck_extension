/**
 * デッキ関連ページの詳細分析
 */
const { chromium } = require('playwright');

async function analyzeDeckPages() {
    console.log('🎯 デッキ関連ページ分析開始...');
    
    const context = await chromium.launchPersistentContext(
        '/home/tomo/work/app/YGO_deck_extension/chrome-profile',
        {
            headless: false,
            args: [
                '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                '--disable-web-security',
                '--no-sandbox'
            ]
        }
    );
    
    const page = await context.newPage();
    
    // ネットワーク監視を開始
    const networkRequests = [];
    page.on('request', request => {
        const url = request.url();
        const method = request.method();
        if (url.includes('yugiohdb') || url.includes('.action') || url.includes('api')) {
            networkRequests.push({ method, url, type: request.resourceType() });
        }
    });
    
    try {
        // Deck Search結果の詳細分析
        console.log('🃏 Deck Search結果ページ分析...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_search.action');
        await page.waitForLoadState('networkidle');
        
        // デッキリストの構造分析
        const deckItems = await page.locator('.deck_set, .deckset, [class*="deck"], .result_set').all();
        console.log(`📊 デッキアイテム数: ${deckItems.length}`);
        
        if (deckItems.length > 0) {
            const firstDeck = deckItems[0];
            const deckHtml = await firstDeck.innerHTML();
            console.log('🎯 最初のデッキアイテム構造:');
            console.log(deckHtml.substring(0, 500) + '...');
            
            // デッキ詳細ページへのリンクを探す
            const deckLink = await firstDeck.locator('a').first();
            if (await deckLink.isVisible()) {
                const href = await deckLink.getAttribute('href');
                console.log(`🔗 デッキ詳細リンク: ${href}`);
                
                // デッキ詳細ページに移動
                console.log('📋 デッキ詳細ページへ移動...');
                await deckLink.click();
                await page.waitForLoadState('networkidle');
                
                const detailUrl = page.url();
                console.log(`📄 デッキ詳細URL: ${detailUrl}`);
                
                // デッキ構成の分析
                const cardElements = await page.locator('.card, .card_set, [class*="card"], .monster, .spell, .trap').all();
                console.log(`🃏 カード要素数: ${cardElements.length}`);
                
                // メインデッキ、エクストラデッキ、サイドデッキの構造分析
                const mainDeck = await page.locator('.main_deck, .maindeck, [class*="main"]').first();
                const extraDeck = await page.locator('.extra_deck, .extradeck, [class*="extra"]').first();
                const sideDeck = await page.locator('.side_deck, .sidedeck, [class*="side"]').first();
                
                if (await mainDeck.isVisible()) {
                    console.log('✅ メインデッキセクション発見');
                    const mainCards = await mainDeck.locator('.card, [class*="card"]').count();
                    console.log(`  - メインデッキカード数: ${mainCards}`);
                }
                
                if (await extraDeck.isVisible()) {
                    console.log('✅ エクストラデッキセクション発見');
                    const extraCards = await extraDeck.locator('.card, [class*="card"]').count();
                    console.log(`  - エクストラデッキカード数: ${extraCards}`);
                }
                
                if (await sideDeck.isVisible()) {
                    console.log('✅ サイドデッキセクション発見');
                    const sideCards = await sideDeck.locator('.card, [class*="card"]').count();
                    console.log(`  - サイドデッキカード数: ${sideCards}`);
                }
            }
        }
        
        // Card Search結果の分析
        console.log('🔍 Card Search結果ページ分析...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action');
        await page.waitForLoadState('networkidle');
        
        // 簡単な検索を実行
        const searchButton = await page.locator('input[type="submit"], button[type="submit"]').first();
        if (await searchButton.isVisible()) {
            console.log('🔍 カード検索実行...');
            await searchButton.click();
            await page.waitForTimeout(3000);
            
            // 検索結果の構造分析
            const cardResults = await page.locator('.card_list, .cardlist, [class*="card"], .result').all();
            console.log(`🃏 検索結果カード数: ${cardResults.length}`);
            
            if (cardResults.length > 0) {
                const firstCard = cardResults[0];
                const cardHtml = await firstCard.innerHTML();
                console.log('🎯 カード結果構造:');
                console.log(cardHtml.substring(0, 300) + '...');
            }
        }
        
        // ページのCSS解析
        console.log('🎨 CSS クラス分析...');
        const allElements = await page.locator('*[class]').all();
        const classNames = new Set();
        
        for (const element of allElements.slice(0, 100)) { // 最初の100要素のみ
            const className = await element.getAttribute('class');
            if (className && (className.includes('deck') || className.includes('card'))) {
                classNames.add(className);
            }
        }
        
        console.log('🏷️  重要なCSSクラス:');
        Array.from(classNames).slice(0, 20).forEach(cls => {
            console.log(`  - ${cls}`);
        });
        
        // JavaScriptのグローバル変数・関数分析
        console.log('⚙️  JavaScript環境詳細分析...');
        const jsInfo = await page.evaluate(() => {
            const info = {
                globalVars: [],
                functions: [],
                deckData: null,
                cardData: null
            };
            
            // グローバル変数をチェック
            for (const key of Object.keys(window)) {
                if (key.includes('deck') || key.includes('card') || key.includes('data')) {
                    info.globalVars.push(key);
                }
            }
            
            // よく使われる関数名をチェック
            const commonFunctions = ['addCard', 'removeCard', 'loadDeck', 'saveDeck', 'search'];
            for (const func of commonFunctions) {
                if (typeof window[func] === 'function') {
                    info.functions.push(func);
                }
            }
            
            return info;
        });
        
        console.log('📊 JavaScript分析結果:');
        console.log(`  - グローバル変数: ${jsInfo.globalVars.slice(0, 10).join(', ')}`);
        console.log(`  - 関数: ${jsInfo.functions.join(', ')}`);
        
        // ネットワークリクエスト分析
        console.log('🌐 ネットワーク活動分析:');
        const uniqueEndpoints = [...new Set(networkRequests.map(r => r.url))];
        uniqueEndpoints.slice(0, 10).forEach(url => {
            console.log(`  - ${url}`);
        });
        
        // スクリーンショット保存
        await page.screenshot({ path: '../assets/deck-analysis-screenshot.png', fullPage: true });
        console.log('📸 分析結果スクリーンショット保存: deck-analysis-screenshot.png');
        
    } catch (error) {
        console.error('❌ 分析エラー:', error.message);
    } finally {
        await context.close();
    }
}

// 分析実行
analyzeDeckPages()
    .then(() => console.log('✅ デッキページ分析完了'))
    .catch(err => console.error('❌ 分析失敗:', err));