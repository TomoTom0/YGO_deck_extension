/**
 * Chrome拡張機能のテストスクリプト
 */
const { chromium } = require('playwright');

async function testExtension() {
    console.log('🚀 Chrome拡張機能テスト開始...');
    
    // Chrome起動設定（persistentContextを使用）
    const context = await chromium.launchPersistentContext(
        '/home/tomo/work/app/YGO_deck_extension/chrome-profile',
        {
            headless: false, // ブラウザを表示
            args: [
                '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                '--disable-web-security',
                '--no-sandbox'
            ]
        }
    );
    
    const page = await context.newPage();
    
    // コンソールログを監視
    page.on('console', msg => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    try {
        console.log('📍 遊戯王サイトにアクセス中...');
        await page.goto('https://www.db.yugioh-card.com/yugiohdb/');
        
        // ページ読み込み完了まで待機
        await page.waitForLoadState('networkidle');
        
        // 拡張機能のデバッグUIを確認
        console.log('🔍 拡張機能のデバッグUI確認中...');
        const debugElement = await page.locator('#ygo-debug-test').first();
        
        if (await debugElement.isVisible()) {
            console.log('✅ 拡張機能のデバッグUI発見!');
            const debugText = await debugElement.textContent();
            console.log(`📝 デバッグテキスト: ${debugText}`);
        } else {
            console.log('❌ 拡張機能のデバッグUIが見つかりません');
        }
        
        // 3秒待機（デバッグUIの更新を待つ）
        await page.waitForTimeout(3000);
        
        // 更新後のデバッグUIを確認
        if (await debugElement.isVisible()) {
            const updatedText = await debugElement.textContent();
            console.log(`🔄 更新後のデバッグテキスト: ${updatedText}`);
        }
        
        // スクリーンショット撮影
        await page.screenshot({ path: 'extension-test-screenshot.png' });
        console.log('📸 スクリーンショットを保存: extension-test-screenshot.png');
        
    } catch (error) {
        console.error('❌ エラー発生:', error.message);
    } finally {
        console.log('🔚 ブラウザを閉じています...');
        await context.close();
    }
}

// テスト実行
testExtension()
    .then(() => console.log('✅ テスト完了'))
    .catch(err => console.error('❌ テスト失敗:', err));