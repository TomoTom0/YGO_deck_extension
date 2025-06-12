/**
 * 遊戯王DB - Windows Profile使用版
 * 既存のWindows Chrome Profile 2のセッションを利用
 */
const { chromium } = require('playwright');

class YugiohDBWindowsProfile {
    constructor() {
        this.context = null;
        this.page = null;
    }

    async initializeWithWindowsProfile() {
        console.log('🚀 Windows Chrome Profile使用でPlaywright開始...');
        
        // Windows側のProfile 2パス
        const windowsProfilePath = 'C:\\Users\\tomo\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 2';
        
        console.log(`📁 Windowsプロファイルパス: ${windowsProfilePath}`);
        
        try {
            // Windows Profile 2を使用してPersistentContextを作成
            this.context = await chromium.launchPersistentContext(windowsProfilePath, {
                headless: false,
                
                // 拡張機能読み込み
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
                
                // 自然なUser-Agent
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            });

            this.page = await this.context.newPage();
            
            // エラー監視
            this.page.on('console', msg => {
                const type = msg.type();
                const text = msg.text();
                if (type === 'error' && !text.includes('bluetooth') && !text.includes('analytics')) {
                    console.log(`[BROWSER ERROR] ${text}`);
                }
            });

            console.log('✅ Windows Profile読み込み成功');
            return true;
            
        } catch (error) {
            console.error('❌ Windows Profile読み込み失敗:', error.message);
            console.log('');
            console.log('🔧 対処法:');
            console.log('   1. Windows側でChrome Profile 2を一度起動してログイン');
            console.log('   2. Chromeを完全終了');
            console.log('   3. このスクリプトを再実行');
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
                timeout: 90000
            });
            
            await this.page.waitForTimeout(5000);
            
            // ページの状態を確認
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`  📄 URL: ${currentUrl}`);
            console.log(`  📄 タイトル: ${currentTitle}`);
            
            // ログイン状態の確認
            console.log('  🔍 ログイン状態チェック...');
            
            const loginElements = await this.checkLoginElements();
            
            if (loginElements.isLoggedIn) {
                console.log('  ✅ ログイン済み状態を検出！');
                if (loginElements.userInfo) {
                    console.log(`    👤 ユーザー情報: ${loginElements.userInfo}`);
                }
                return 'logged_in';
            } else if (loginElements.hasLoginButton) {
                console.log('  ⚠️  未ログイン状態 - ログインボタンが表示されています');
                console.log('  💡 Windows側のChrome Profile 2でログインしてください');
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
                '#logout',
                'a:has-text("LOGOUT")'
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
                'div:has-text("ようこそ")',
                '.header-user',
                '.login-user'
            ];

            for (const selector of userSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        userInfo = await element.textContent();
                        if (userInfo && userInfo.trim().length > 0) {
                            isLoggedIn = true;
                            console.log(`    👤 ユーザー情報発見: ${userInfo.trim()}`);
                            break;
                        }
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
                '#login',
                'a:has-text("LOGIN")'
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
                userInfo: userInfo.trim(),
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
            
            return currentUrl.includes('card_search');
            
        } catch (error) {
            console.error('❌ カード検索ページアクセスエラー:', error.message);
            return false;
        }
    }

    async navigateToDeckEdit() {
        console.log('🃏 デッキ編集ページへ移動...');
        
        try {
            // デッキ編集ページのURL（ログイン必須）
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_edit.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(5000);
            
            const currentUrl = this.page.url();
            console.log(`  📄 デッキ編集ページURL: ${currentUrl}`);
            
            if (currentUrl.includes('deck_edit') || currentUrl.includes('deck')) {
                console.log('  ✅ デッキ編集ページアクセス成功');
                return true;
            } else if (currentUrl.includes('login') || currentUrl.includes('signin')) {
                console.log('  ❌ ログインページにリダイレクトされました');
                console.log('  💡 ログインが必要です');
                return false;
            } else {
                console.log('  ❓ 予期しないページに遷移');
                return false;
            }
            
        } catch (error) {
            console.error('❌ デッキ編集ページアクセスエラー:', error.message);
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
                console.log('  💡 開発者ツール(F12)でコンソールを確認してください');
            }
            
            // 追加の拡張機能チェック
            const extensionElements = await this.page.evaluate(() => {
                const elements = [];
                
                // 拡張機能が追加する可能性のある要素
                const selectors = [
                    '#ygo-quick-access',
                    '#ygo-deck-support-ui',
                    '.ygo-extension',
                    '[id*="ygo"]',
                    '[class*="ygo"]'
                ];
                
                selectors.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) {
                        elements.push({
                            selector: selector,
                            id: element.id,
                            className: element.className
                        });
                    }
                });
                
                return elements;
            });
            
            if (extensionElements.length > 0) {
                console.log('  🔍 拡張機能要素検出:');
                extensionElements.forEach((elem, index) => {
                    console.log(`    ${index + 1}. ${elem.selector} (id: ${elem.id}, class: ${elem.className})`);
                });
            }
            
            return extensionLoaded;
            
        } catch (error) {
            console.error('❌ 拡張機能テストエラー:', error.message);
            return false;
        }
    }

    async interactiveSession() {
        console.log('');
        console.log('🎮 インタラクティブセッション開始');
        console.log('');
        console.log('📋 利用可能な操作:');
        console.log('   - ブラウザで自由に操作できます');
        console.log('   - 拡張機能の動作確認');
        console.log('   - 各種ページのテスト');
        console.log('');
        console.log('🛑 終了: Ctrl+C');
        console.log('');

        let lastUrl = this.page.url();
        let checkCount = 0;

        // 無限ループで状態監視
        while (true) {
            await this.page.waitForTimeout(10000); // 10秒ごとにチェック
            checkCount++;
            
            try {
                const currentUrl = this.page.url();
                
                // URL変化を検出
                if (currentUrl !== lastUrl) {
                    console.log(`📍 ページ遷移: ${currentUrl}`);
                    lastUrl = currentUrl;
                    
                    // 特定のページでの追加チェック
                    if (currentUrl.includes('deck_edit')) {
                        console.log('  🃏 デッキ編集ページを検出');
                        console.log('  💡 拡張機能の MouseUI 機能をテストしてください');
                    } else if (currentUrl.includes('card_search')) {
                        console.log('  🔍 カード検索ページを検出');
                        console.log('  💡 検索結果での拡張機能動作を確認してください');
                    }
                }
                
                // 30回ごとに状態レポート（5分ごと）
                if (checkCount % 30 === 0) {
                    console.log(`⏱️  セッション継続中... (${Math.floor(checkCount / 6)}分経過)`);
                    console.log(`   現在のページ: ${currentUrl}`);
                }
                
            } catch (error) {
                console.log(`⚠️  状態確認エラー: ${error.message}`);
            }
        }
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    async run() {
        try {
            // 1. Windows Profile初期化
            const initSuccess = await this.initializeWithWindowsProfile();
            if (!initSuccess) {
                return;
            }

            // 2. ログイン状態確認
            const loginStatus = await this.testLoginStatus();
            
            console.log('');
            switch (loginStatus) {
                case 'logged_in':
                    console.log('🎉 ログイン済み状態で開始！');
                    console.log('✅ 遊戯王DBの全機能にアクセス可能です');
                    
                    // 3. 拡張機能テスト
                    await this.testExtensionFunctionality();
                    
                    // 4. 追加テストページへのナビゲーション提案
                    console.log('');
                    console.log('📋 テスト可能なページ:');
                    console.log('   - カード検索ページ');
                    console.log('   - デッキ編集ページ（拡張機能のメイン機能）');
                    
                    break;
                    
                case 'not_logged_in':
                    console.log('⚠️  未ログイン状態です');
                    console.log('');
                    console.log('🔧 ログイン手順:');
                    console.log('   1. Windows側でChrome Profile 2を開く');
                    console.log('   2. 遊戯王DBにログイン');
                    console.log('   3. Chromeを終了');
                    console.log('   4. このスクリプトを再実行');
                    break;
                    
                default:
                    console.log('❓ ログイン状態が不明です');
                    console.log('💡 ブラウザでページ状態を確認してください');
            }

            // 5. インタラクティブセッション
            await this.interactiveSession();

        } catch (error) {
            console.error('💥 予期しないエラー:', error);
        }
    }
}

console.log('🚀 遊戯王DB - Windows Profile使用版');
console.log('📁 使用プロファイル: C:\\Users\\tomo\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 2');
console.log('');

const tester = new YugiohDBWindowsProfile();

// 終了時のクリーンアップ設定
process.on('SIGINT', async () => {
    console.log('\n🛑 セッション終了...');
    await tester.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 セッション終了...');
    await tester.cleanup();
    process.exit(0);
});

// テスト開始
tester.run().catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});