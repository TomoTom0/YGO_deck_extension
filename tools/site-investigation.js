/**
 * 遊戯王公式サイトの構造調査スクリプト
 */
const { chromium } = require('playwright');

async function investigateSite() {
    console.log('🔍 遊戯王公式サイト構造調査開始...');
    
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
    
    try {
        // メインページを調査
        console.log('📍 メインページ調査中...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
        await page.waitForLoadState('networkidle');
        
        // ページ情報取得
        const title = await page.title();
        const url = page.url();
        console.log(`📄 タイトル: ${title}`);
        console.log(`🌐 URL: ${url}`);
        
        // My Deckリンクを探す
        const myDeckLink = await page.locator('a:has-text("My Deck")').first();
        if (await myDeckLink.isVisible()) {
            const href = await myDeckLink.getAttribute('href');
            console.log(`🎯 My Deckリンク発見: ${href}`);
            
            // My Deckページに移動
            console.log('🔄 My Deckページへ移動中...');
            await myDeckLink.click();
            await page.waitForLoadState('networkidle');
            
            const newUrl = page.url();
            console.log(`🎮 移動後URL: ${newUrl}`);
            
            // ログインページかどうか確認
            if (newUrl.includes('member_login')) {
                console.log('🔑 ログインページに到達');
                
                // ログインフォームの構造を調査
                const loginForm = await page.locator('form').first();
                if (await loginForm.isVisible()) {
                    console.log('📝 ログインフォーム発見');
                    
                    // フォーム要素を調査
                    const inputs = await page.locator('input').all();
                    for (const input of inputs) {
                        const type = await input.getAttribute('type');
                        const name = await input.getAttribute('name');
                        const id = await input.getAttribute('id');
                        console.log(`  - Input: type=${type}, name=${name}, id=${id}`);
                    }
                }
            }
        }
        
        // Card Searchページを調査
        console.log('🔍 Card Searchページ調査中...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action');
        await page.waitForLoadState('networkidle');
        
        // カード検索フォームの構造を調査
        const searchForm = await page.locator('form').first();
        if (await searchForm.isVisible()) {
            console.log('🔍 カード検索フォーム発見');
            
            // 検索条件の入力要素を調査
            const searchInputs = await page.locator('input, select').all();
            console.log(`📊 検索要素数: ${searchInputs.length}`);
        }
        
        // Deck Searchページを調査
        console.log('🃏 Deck Searchページ調査中...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_search.action');
        await page.waitForLoadState('networkidle');
        
        // デッキ検索結果の構造を調査
        const deckList = await page.locator('.deck-list, .result-list, [class*="deck"], [class*="result"]').first();
        if (await deckList.isVisible()) {
            console.log('🎯 デッキリスト要素発見');
            const className = await deckList.getAttribute('class');
            console.log(`  - クラス名: ${className}`);
        }
        
        // JavaScriptフレームワーク・ライブラリを調査
        console.log('⚙️  JavaScript環境調査中...');
        const jsLibs = await page.evaluate(() => {
            const libs = {};
            if (typeof jQuery !== 'undefined') libs.jQuery = jQuery.fn.jquery;
            if (typeof $ !== 'undefined') libs.$ = true;
            if (typeof angular !== 'undefined') libs.angular = angular.version.full;
            if (typeof React !== 'undefined') libs.React = React.version;
            if (typeof Vue !== 'undefined') libs.Vue = Vue.version;
            return libs;
        });
        console.log('📚 JavaScript ライブラリ:', jsLibs);
        
        // AJAX/APIエンドポイントを調査
        console.log('🌐 ネットワーク活動監視中...');
        page.on('request', request => {
            const url = request.url();
            if (url.includes('.action') || url.includes('/api/') || url.includes('ajax')) {
                console.log(`📡 API エンドポイント: ${request.method()} ${url}`);
            }
        });
        
        // 簡単な検索を実行してAPIを調査
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action');
        await page.waitForLoadState('networkidle');
        
        // 検索ボタンを探して実行
        const searchButton = await page.locator('input[type="submit"], button[type="submit"], button:has-text("検索"), button:has-text("Search")').first();
        if (await searchButton.isVisible()) {
            console.log('🔍 検索実行中...');
            await searchButton.click();
            await page.waitForTimeout(3000); // API呼び出しを待機
        }
        
        // スクリーンショット保存
        await page.screenshot({ path: '../assets/site-investigation-screenshot.png', fullPage: true });
        console.log('📸 調査結果スクリーンショット保存: site-investigation-screenshot.png');
        
    } catch (error) {
        console.error('❌ 調査エラー:', error.message);
    } finally {
        await context.close();
    }
}

// 調査実行
investigateSite()
    .then(() => console.log('✅ サイト構造調査完了'))
    .catch(err => console.error('❌ 調査失敗:', err));