/**
 * 遊戯王DB セッション再利用版
 * 既存のChromeプロファイルのログインセッションを利用
 */
const { chromium } = require('playwright');

class YugiohDBSessionReuse {
    constructor() {
        this.context = null;
        this.page = null;
    }

    async initializeWithProfile(profilePath) {
        console.log('🚀 既存プロファイルでPlaywright開始...');
        console.log(`📁 プロファイルパス: ${profilePath}`);
        
        try {
            // 既存のChromeプロファイルを使用してPersistentContextを作成
            this.context = await chromium.launchPersistentContext(profilePath, {
                headless: false,
                args: [
                    '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                    '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=TranslateUI'
                ],
                ignoreHTTPSErrors: true,
                timeout: 60000
            });

            this.page = await this.context.newPage();
            
            console.log('✅ プロファイル読み込み成功');
            return true;
            
        } catch (error) {
            console.error('❌ プロファイル読み込み失敗:', error.message);
            return false;
        }
    }

    async testLoginStatus() {
        console.log('🔍 ログイン状態確認中...');
        
        try {
            // 遊戯王DBサイトにアクセス
            console.log('  📍 遊戯王DBサイトアクセス...');
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(5000);
            
            // ページの状態を確認
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`  📄 URL: ${currentUrl}`);
            console.log(`  📄 タイトル: ${currentTitle}`);
            
            // ログイン状態の確認
            console.log('  🔍 ログイン状態チェック...');
            
            // ログイン関連の要素を確認
            const loginElements = await this.checkLoginElements();
            
            if (loginElements.isLoggedIn) {
                console.log('  ✅ ログイン済み状態を検出！');
                console.log(`    ユーザー表示: ${loginElements.userInfo}`);
                return 'logged_in';
            } else if (loginElements.hasLoginButton) {
                console.log('  ⚠️  未ログイン状態 - ログインボタンが表示されています');
                return 'not_logged_in';
            } else {
                console.log('  ❓ ログイン状態不明');
                return 'unknown';
            }
            
        } catch (error) {
            console.error('❌ ログイン状態確認エラー:', error.message);
            return 'error';
        }
    }

    async checkLoginElements() {
        try {
            // ログアウトボタンまたはユーザー情報の存在確認
            const logoutSelectors = [
                'a[href*="logout"]',
                'button:has-text("ログアウト")',
                'a:has-text("ログアウト")',
                '.logout',
                '#logout'
            ];

            let isLoggedIn = false;
            let userInfo = '';

            for (const selector of logoutSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        isLoggedIn = true;
                        console.log(`    ✅ ログアウト要素発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // ユーザー情報の確認
            const userSelectors = [
                '.user-name',
                '.username',
                '#username',
                '.member-name',
                '.user-info',
                'span:has-text("さん")',
                'div:has-text("ようこそ")'
            ];

            for (const selector of userSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        userInfo = await element.textContent();
                        isLoggedIn = true;
                        console.log(`    👤 ユーザー情報発見: ${userInfo}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // ログインボタンの確認
            const loginSelectors = [
                'a[href*="login"]',
                'button:has-text("ログイン")',
                'a:has-text("ログイン")',
                '.login',
                '#login'
            ];

            let hasLoginButton = false;

            for (const selector of loginSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        hasLoginButton = true;
                        console.log(`    🔑 ログインボタン発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            return {
                isLoggedIn,
                userInfo,
                hasLoginButton
            };

        } catch (error) {
            console.log('    ❌ ログイン要素確認エラー');
            return {
                isLoggedIn: false,
                userInfo: '',
                hasLoginButton: false
            };
        }
    }

    async navigateToCardSearch() {
        console.log('🔍 カード検索ページへ移動...');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/card_search.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            console.log(`  📄 カード検索ページURL: ${currentUrl}`);
            
            if (currentUrl.includes('card_search')) {
                console.log('  ✅ カード検索ページアクセス成功');
                return true;
            } else {
                console.log('  ❌ カード検索ページアクセス失敗');
                return false;
            }
            
        } catch (error) {
            console.error('❌ カード検索ページアクセスエラー:', error.message);
            return false;
        }
    }

    async navigateToDeckSearch() {
        console.log('🃏 デッキ検索ページへ移動...');
        
        try {
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_search.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            console.log(`  📄 デッキ検索ページURL: ${currentUrl}`);
            
            if (currentUrl.includes('deck_search')) {
                console.log('  ✅ デッキ検索ページアクセス成功');
                return true;
            } else {
                console.log('  ❌ デッキ検索ページアクセス失敗');
                return false;
            }
            
        } catch (error) {
            console.error('❌ デッキ検索ページアクセスエラー:', error.message);
            return false;
        }
    }

    async testExtensionFunctionality() {
        console.log('🧪 拡張機能動作テスト...');
        
        try {
            // 拡張機能が読み込まれているかチェック
            const extensionLoaded = await this.page.evaluate(() => {
                return typeof window.YGO_DECK_SUPPORT_LOADED !== 'undefined' ||
                       document.querySelector('#ygo-quick-access') !== null ||
                       document.querySelector('#ygo-deck-support-ui') !== null;
            });
            
            if (extensionLoaded) {
                console.log('  ✅ 拡張機能が読み込まれています');
            } else {
                console.log('  ⚠️  拡張機能の読み込み状態が不明');
            }
            
            // コンソールログを確認
            await this.page.waitForTimeout(2000);
            
            return extensionLoaded;
            
        } catch (error) {
            console.error('❌ 拡張機能テストエラー:', error.message);
            return false;
        }
    }

    async interactiveMode() {
        console.log('');
        console.log('🎮 インタラクティブモード開始');
        console.log('');
        console.log('📋 利用可能なコマンド:');
        console.log('   h または help    - ヘルプ表示');
        console.log('   s または status  - ログイン状態確認');
        console.log('   c または card    - カード検索ページへ');
        console.log('   d または deck    - デッキ検索ページへ');
        console.log('   e または ext     - 拡張機能テスト');
        console.log('   q または quit    - 終了');
        console.log('');
        console.log('💡 ブラウザで自由に操作できます');
        console.log('');

        // 無限ループでユーザー入力待機
        while (true) {
            // ページ状態の監視
            try {
                const currentUrl = this.page.url();
                if (currentUrl.includes('yugiohdb')) {
                    // 定期的な状態確認（5分ごと）
                    await this.page.waitForTimeout(300000); // 5分
                    console.log(`⏱️  現在のページ: ${currentUrl}`);
                } else {
                    await this.page.waitForTimeout(10000); // 10秒
                }
            } catch (error) {
                console.log(`⚠️  ページ監視エラー: ${error.message}`);
                await this.page.waitForTimeout(10000);
            }
        }
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    async run(profilePath) {
        try {
            // 1. プロファイル読み込み
            const initSuccess = await this.initializeWithProfile(profilePath);
            if (!initSuccess) {
                console.log('❌ プロファイル初期化失敗');
                return;
            }

            // 2. ログイン状態確認
            const loginStatus = await this.testLoginStatus();
            
            switch (loginStatus) {
                case 'logged_in':
                    console.log('');
                    console.log('🎉 ログイン済み状態で開始できます！');
                    console.log('✅ 遊戯王DBの全機能にアクセス可能です');
                    break;
                    
                case 'not_logged_in':
                    console.log('');
                    console.log('⚠️  未ログイン状態です');
                    console.log('💡 ブラウザで手動ログインしてください');
                    break;
                    
                case 'unknown':
                    console.log('');
                    console.log('❓ ログイン状態が不明です');
                    console.log('💡 ページを確認してください');
                    break;
                    
                case 'error':
                    console.log('');
                    console.log('❌ ログイン状態確認でエラーが発生しました');
                    break;
            }

            // 3. 拡張機能テスト
            await this.testExtensionFunctionality();

            // 4. インタラクティブモード
            await this.interactiveMode();

        } catch (error) {
            console.error('💥 予期しないエラー:', error);
        }
    }
}

// コマンドライン引数からプロファイルパスを取得
const profilePath = process.argv[2] || '/home/tomo/work/app/YGO_deck_extension/chrome-profile';

console.log('🚀 遊戯王DB セッション再利用テスト');
console.log('');
console.log('📋 使用方法:');
console.log('   1. まず通常のChromeで遊戯王DBにログイン');
console.log('   2. Chromeを完全に終了');
console.log('   3. このスクリプトを実行');
console.log('');
console.log(`📁 使用プロファイル: ${profilePath}`);
console.log('');

const tester = new YugiohDBSessionReuse();

// 終了時のクリーンアップ設定
process.on('SIGINT', async () => {
    console.log('\n🛑 テスト終了...');
    await tester.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 テスト終了...');
    await tester.cleanup();
    process.exit(0);
});

// テスト開始
tester.run(profilePath).catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});