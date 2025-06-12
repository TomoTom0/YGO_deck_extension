/**
 * 遊戯王DB - セッション永続化版
 * 一度ログインしたセッションを永続的に保持
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class YugiohDBPersistentSession {
    constructor() {
        this.context = null;
        this.page = null;
        this.sessionDir = '/home/tomo/work/app/YGO_deck_extension/playwright-session';
    }

    async ensureSessionDirectory() {
        if (!fs.existsSync(this.sessionDir)) {
            console.log('📁 セッションディレクトリ作成中...');
            fs.mkdirSync(this.sessionDir, { recursive: true });
            console.log(`✅ セッションディレクトリ作成: ${this.sessionDir}`);
        } else {
            console.log(`📁 既存セッションディレクトリ: ${this.sessionDir}`);
        }
    }

    async initializeWithPersistentSession() {
        console.log('🚀 セッション永続化版Playwright開始...');
        
        // セッションディレクトリの確保
        await this.ensureSessionDirectory();
        
        try {
            // PersistentContextを使用してセッションを永続化
            this.context = await chromium.launchPersistentContext(this.sessionDir, {
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
                    '--disable-blink-features=AutomationControlled',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--no-first-run',
                    '--no-default-browser-check'
                ],
                
                ignoreHTTPSErrors: true,
                timeout: 60000,
                
                // 自然なブラウザ設定
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'ja-JP',
                timezoneId: 'Asia/Tokyo',
                
                // セッション永続化のキーポイント
                bypassCSP: true,
                javaScriptEnabled: true
            });

            // 既存のページを取得または新規作成
            const pages = this.context.pages();
            if (pages.length > 0) {
                this.page = pages[0];
                console.log('📄 既存のページを使用');
            } else {
                this.page = await this.context.newPage();
                console.log('📄 新しいページを作成');
            }
            
            // エラー監視
            this.page.on('console', msg => {
                const type = msg.type();
                const text = msg.text();
                if (type === 'error' && !text.includes('bluetooth') && !text.includes('analytics') && !text.includes('404')) {
                    console.log(`[BROWSER ERROR] ${text}`);
                }
            });

            console.log(`✅ セッション永続化初期化成功`);
            console.log(`📁 セッション保存先: ${this.sessionDir}`);
            return true;
            
        } catch (error) {
            console.error('❌ セッション永続化初期化失敗:', error.message);
            return false;
        }
    }

    async testLoginStatus() {
        console.log('🔍 ログイン状態確認中...');
        
        try {
            // 現在のページURLを確認
            const currentUrl = this.page.url();
            console.log(`  📍 現在のURL: ${currentUrl}`);
            
            // 遊戯王DBサイトにアクセス（セッション保持状態で）
            if (!currentUrl.includes('yugiohdb')) {
                console.log('  📍 遊戯王DBサイトにナビゲート...');
                await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 90000
                });
            }
            
            await this.page.waitForTimeout(5000);
            
            const finalUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`  📄 最終URL: ${finalUrl}`);
            console.log(`  📄 タイトル: ${currentTitle}`);
            
            // ログイン状態の詳細確認
            console.log('  🔍 ログイン状態詳細チェック...');
            
            const loginElements = await this.checkLoginElements();
            
            if (loginElements.isLoggedIn) {
                console.log('  ✅ ログイン済み状態を検出！');
                if (loginElements.userInfo) {
                    console.log(`    👤 ユーザー情報: ${loginElements.userInfo}`);
                }
                if (loginElements.logoutElement) {
                    console.log(`    🚪 ログアウト要素: ${loginElements.logoutElement}`);
                }
                return 'logged_in';
            } else if (loginElements.hasLoginButton) {
                console.log('  ⚠️  未ログイン状態 - ログインボタンが表示');
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
            let isLoggedIn = false;
            let userInfo = '';
            let logoutElement = '';

            // より包括的なログアウト要素検索
            const logoutSelectors = [
                'a[href*="logout"]',
                'button:has-text("ログアウト")',
                'a:has-text("ログアウト")',
                'button:has-text("LOGOUT")',
                'a:has-text("LOGOUT")',
                '.logout',
                '#logout',
                '[onclick*="logout"]',
                'form[action*="logout"]'
            ];

            for (const selector of logoutSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        isLoggedIn = true;
                        logoutElement = selector;
                        console.log(`    ✅ ログアウト要素発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // ユーザー情報・会員情報の確認
            const userSelectors = [
                '.user-name',
                '.username',
                '#username',
                '.member-name',
                '.user-info',
                '.member-info',
                'span:has-text("さん")',
                'div:has-text("ようこそ")',
                '.header-user',
                '.login-user',
                '.member',
                '[class*="user"]',
                '[id*="user"]'
            ];

            for (const selector of userSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible()) {
                        const text = await element.textContent();
                        if (text && text.trim().length > 0 && 
                            (text.includes('さん') || text.includes('ようこそ') || text.includes('会員'))) {
                            userInfo = text.trim();
                            isLoggedIn = true;
                            console.log(`    👤 ユーザー情報発見: ${userInfo}`);
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }

            // Cookieからログイン状態を確認
            const cookies = await this.context.cookies();
            const sessionCookies = cookies.filter(cookie => 
                cookie.name.toLowerCase().includes('session') || 
                cookie.name.toLowerCase().includes('login') ||
                cookie.name.toLowerCase().includes('auth') ||
                cookie.domain.includes('konami') ||
                cookie.domain.includes('yugioh')
            );

            if (sessionCookies.length > 0) {
                console.log(`    🍪 セッションCookie検出: ${sessionCookies.length}個`);
                sessionCookies.forEach(cookie => {
                    console.log(`      - ${cookie.name} (${cookie.domain})`);
                });
                
                // セッションCookieがあれば、ログイン状態の可能性が高い
                if (!isLoggedIn && sessionCookies.some(c => c.value && c.value.length > 10)) {
                    console.log(`    🔑 有効なセッションCookieによりログイン状態と推定`);
                    isLoggedIn = true;
                }
            }

            // ログインボタンの確認
            const loginSelectors = [
                'a[href*="login"]',
                'button:has-text("ログイン")',
                'a:has-text("ログイン")',
                'button:has-text("LOGIN")',
                'a:has-text("LOGIN")',
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
                logoutElement,
                hasLoginButton,
                sessionCookieCount: sessionCookies.length
            };

        } catch (error) {
            console.log('    ❌ ログイン要素確認エラー');
            return {
                isLoggedIn: false,
                userInfo: '',
                logoutElement: '',
                hasLoginButton: false,
                sessionCookieCount: 0
            };
        }
    }

    async performLogin() {
        console.log('🔐 ブラウザ内ログイン支援...');
        
        try {
            console.log('  💡 手動ログイン手順:');
            console.log('    1. ブラウザでログインボタンをクリック');
            console.log('    2. My KONAMIでログイン情報を入力');
            console.log('    3. ログイン完了まで待機');
            console.log('    4. 遊戯王DBページに戻る');
            console.log('    5. このターミナルでEnterキーを押す');
            console.log('');
            
            // ユーザーの手動ログイン完了を待機
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            
            return new Promise((resolve) => {
                console.log('⏳ ログイン完了後、Enterキーを押してください...');
                
                process.stdin.on('data', async (key) => {
                    if (key === '\r' || key === '\n' || key === '\u0003') {
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                        
                        console.log('🔍 ログイン状態を再確認中...');
                        const loginStatus = await this.testLoginStatus();
                        resolve(loginStatus === 'logged_in');
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ ログイン支援エラー:', error.message);
            return false;
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
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/deck_edit.action', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            await this.page.waitForTimeout(5000);
            
            const currentUrl = this.page.url();
            console.log(`  📄 デッキ編集ページURL: ${currentUrl}`);
            
            if (currentUrl.includes('deck_edit') || currentUrl.includes('deck')) {
                console.log('  ✅ デッキ編集ページアクセス成功');
                console.log('  💡 拡張機能のMouseUI機能をテストしてください');
                return true;
            } else if (currentUrl.includes('login') || currentUrl.includes('signin')) {
                console.log('  ❌ ログインページにリダイレクトされました');
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
            const extensionStatus = await this.page.evaluate(() => {
                const results = {
                    YGO_DECK_SUPPORT_LOADED: typeof window.YGO_DECK_SUPPORT_LOADED !== 'undefined',
                    quickAccess: document.querySelector('#ygo-quick-access') !== null,
                    deckSupportUI: document.querySelector('#ygo-deck-support-ui') !== null,
                    ygoElements: [],
                    consoleMessages: []
                };
                
                // YGO関連の要素を検索
                const allElements = document.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.id && element.id.includes('ygo')) {
                        results.ygoElements.push({
                            type: 'id',
                            value: element.id,
                            tagName: element.tagName
                        });
                    }
                    if (element.className && element.className.includes && element.className.includes('ygo')) {
                        results.ygoElements.push({
                            type: 'class',
                            value: element.className,
                            tagName: element.tagName
                        });
                    }
                });
                
                return results;
            });
            
            console.log('  📋 拡張機能状態:');
            console.log(`    YGO_DECK_SUPPORT_LOADED: ${extensionStatus.YGO_DECK_SUPPORT_LOADED}`);
            console.log(`    Quick Access要素: ${extensionStatus.quickAccess}`);
            console.log(`    Deck Support UI要素: ${extensionStatus.deckSupportUI}`);
            console.log(`    YGO関連要素数: ${extensionStatus.ygoElements.length}`);
            
            if (extensionStatus.ygoElements.length > 0) {
                console.log('  🔍 YGO関連要素:');
                extensionStatus.ygoElements.slice(0, 5).forEach((elem, index) => {
                    console.log(`    ${index + 1}. ${elem.tagName} ${elem.type}="${elem.value}"`);
                });
            }
            
            const isLoaded = extensionStatus.YGO_DECK_SUPPORT_LOADED || 
                           extensionStatus.quickAccess || 
                           extensionStatus.deckSupportUI || 
                           extensionStatus.ygoElements.length > 0;
            
            if (isLoaded) {
                console.log('  ✅ 拡張機能が正常に読み込まれています');
            } else {
                console.log('  ⚠️  拡張機能の読み込み状態が不明');
                console.log('  💡 F12でデベロッパーツールを開いてコンソールを確認してください');
            }
            
            return isLoaded;
            
        } catch (error) {
            console.error('❌ 拡張機能テストエラー:', error.message);
            return false;
        }
    }

    async interactiveSession() {
        console.log('');
        console.log('🎮 インタラクティブセッション開始');
        console.log('');
        console.log('📋 利用可能なコマンド:');
        console.log('   c - カード検索ページへ移動');
        console.log('   d - デッキ編集ページへ移動');
        console.log('   e - 拡張機能テスト実行');
        console.log('   s - ログイン状態確認');
        console.log('   q - 終了');
        console.log('');
        console.log('💡 ブラウザで自由に操作できます');
        console.log('🛑 終了: Ctrl+C または q');
        console.log('');

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let lastUrl = this.page.url();
        let urlCheckInterval;

        // URL変化監視
        urlCheckInterval = setInterval(async () => {
            try {
                const currentUrl = this.page.url();
                if (currentUrl !== lastUrl) {
                    console.log(`📍 ページ遷移: ${currentUrl}`);
                    lastUrl = currentUrl;
                    
                    if (currentUrl.includes('deck_edit')) {
                        console.log('  🃏 デッキ編集ページを検出 - 拡張機能をテストしてください');
                    } else if (currentUrl.includes('card_search')) {
                        console.log('  🔍 カード検索ページを検出');
                    }
                }
            } catch (error) {
                // URL取得エラーは無視
            }
        }, 5000);

        return new Promise((resolve) => {
            process.stdin.on('data', async (key) => {
                const command = key.toString().toLowerCase().trim();
                
                switch (command) {
                    case 'c':
                        console.log('');
                        await this.navigateToCardSearch();
                        break;
                        
                    case 'd':
                        console.log('');
                        await this.navigateToDeckEdit();
                        break;
                        
                    case 'e':
                        console.log('');
                        await this.testExtensionFunctionality();
                        break;
                        
                    case 's':
                        console.log('');
                        await this.testLoginStatus();
                        break;
                        
                    case 'q':
                    case '\u0003': // Ctrl+C
                        clearInterval(urlCheckInterval);
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                        resolve();
                        return;
                }
                
                console.log('');
                console.log('📋 コマンド: c(カード検索) d(デッキ編集) e(拡張機能テスト) s(状態確認) q(終了)');
            });
        });
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
        }
    }

    async run() {
        try {
            // 1. セッション永続化初期化
            const initSuccess = await this.initializeWithPersistentSession();
            if (!initSuccess) {
                return;
            }

            // 2. ログイン状態確認
            let loginStatus = await this.testLoginStatus();
            
            console.log('');
            if (loginStatus === 'logged_in') {
                console.log('🎉 ログイン済み状態で開始！');
                console.log('✅ セッションが正常に保持されています');
            } else {
                console.log('⚠️  ログインが必要です');
                console.log('💡 ブラウザ内でログインを完了してください');
                
                const loginSuccess = await this.performLogin();
                if (loginSuccess) {
                    console.log('🎉 ログイン成功！セッションが保存されました');
                    loginStatus = 'logged_in';
                } else {
                    console.log('⚠️  ログイン状態の確認ができませんでした');
                }
            }

            // 3. 拡張機能テスト
            if (loginStatus === 'logged_in') {
                await this.testExtensionFunctionality();
            }

            // 4. インタラクティブセッション
            await this.interactiveSession();

        } catch (error) {
            console.error('💥 予期しないエラー:', error);
        }
    }
}

console.log('🚀 遊戯王DB - セッション永続化版');
console.log('💾 セッション情報が自動保存され、次回起動時に復元されます');
console.log('');

const tester = new YugiohDBPersistentSession();

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