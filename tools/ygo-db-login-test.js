/**
 * 遊戯王DBログインテスト - HTTP/2エラー対策版
 */
const { chromium } = require('playwright');

class YugiohDBLoginTest {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 遊戯王DBログインテスト開始...');
        
        // HTTP/2エラー対策のブラウザ設定
        this.browser = await chromium.launch({
            headless: false,
            args: [
                '--disable-http2',                    // HTTP/2を無効化
                '--disable-features=VizDisplayCompositor',
                '--disable-web-security',             // Web security無効化
                '--disable-features=TranslateUI',     // 翻訳UI無効化
                '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-background-timer-throttling',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-logging',
                '--disable-gpu-logging',
                '--silent-debugger-extension-api'
            ],
            ignoreHTTPSErrors: true,                  // HTTPS エラーを無視
            timeout: 60000                            // タイムアウト 60秒
        });

        this.context = await this.browser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',  // HTTP/2のcompression問題を回避
                'Connection': 'keep-alive'
            },
            // タイムアウト設定を長めに
            bypassCSP: true
        });

        // ネットワークとページ設定
        this.context.setDefaultTimeout(60000);
        this.context.setDefaultNavigationTimeout(90000);

        this.page = await this.context.newPage();
        
        // コンソールログとネットワークエラーの監視
        this.page.on('console', msg => {
            console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
        });

        this.page.on('requestfailed', request => {
            console.log(`❌ リクエスト失敗: ${request.url()} - ${request.failure()?.errorText}`);
        });

        this.page.on('response', response => {
            if (!response.ok()) {
                console.log(`⚠️  レスポンスエラー: ${response.url()} - ${response.status()}`);
            }
        });
    }

    async testSiteAccess() {
        console.log('🌐 遊戯王DBサイトアクセステスト...');
        
        try {
            // 段階的にサイトにアクセス
            console.log('  📍 ホームページにアクセス中...');
            
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',  // networkidle待機を避ける
                timeout: 90000
            });
            
            console.log('  ✅ ホームページ読み込み成功');
            
            // ページの基本情報を確認
            const title = await this.page.title();
            const url = this.page.url();
            console.log(`  📄 タイトル: ${title}`);
            console.log(`  🔗 URL: ${url}`);
            
            // 少し待機してコンテンツ読み込み完了を待つ
            await this.page.waitForTimeout(3000);
            
            return true;
            
        } catch (error) {
            console.error('❌ サイトアクセス失敗:', error.message);
            
            // エラー時のスクリーンショット撮影
            try {
                await this.page.screenshot({ 
                    path: '../assets/error-screenshot.png',
                    fullPage: true 
                });
                console.log('📸 エラースクリーンショットを保存: error-screenshot.png');
            } catch (screenshotError) {
                console.log('スクリーンショット撮影にも失敗');
            }
            
            return false;
        }
    }

    async findLoginButton() {
        console.log('🔍 ログインボタン検索中...');
        
        try {
            // 複数のログインボタンセレクターを試行
            const loginSelectors = [
                'a[href*="login"]',
                'button:has-text("ログイン")',
                'a:has-text("ログイン")',
                '.login',
                '#login',
                'input[type="submit"][value*="ログイン"]',
                'button[type="submit"]:has-text("ログイン")',
                'a:has-text("会員ログイン")',
                'a:has-text("MEMBER LOGIN")',
                'a[href*="member"]'
            ];

            let loginButton = null;
            let foundSelector = '';

            for (const selector of loginSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        loginButton = element;
                        foundSelector = selector;
                        console.log(`  ✅ ログインボタン発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // このセレクターでは見つからない、次を試行
                    continue;
                }
            }

            if (!loginButton) {
                // ページ全体のテキストから手動で検索
                console.log('  🔎 手動でログインリンクを検索中...');
                
                const allLinks = await this.page.locator('a').all();
                for (const link of allLinks) {
                    try {
                        const text = await link.textContent();
                        const href = await link.getAttribute('href');
                        
                        if (text && (text.includes('ログイン') || text.includes('LOGIN') || text.includes('会員'))) {
                            console.log(`  📎 ログインリンク候補: "${text}" -> ${href}`);
                            loginButton = link;
                            foundSelector = `リンクテキスト: ${text}`;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            if (loginButton) {
                console.log(`  🎯 ログインボタン特定: ${foundSelector}`);
                return loginButton;
            } else {
                console.log('  ❌ ログインボタンが見つかりません');
                
                // デバッグ情報を出力
                console.log('  🔧 デバッグ: ページ内のリンクを一覧表示');
                const allLinks = await this.page.locator('a').all();
                for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
                    try {
                        const text = await allLinks[i].textContent();
                        const href = await allLinks[i].getAttribute('href');
                        console.log(`    ${i + 1}. "${text}" -> ${href}`);
                    } catch (e) {
                        console.log(`    ${i + 1}. [取得エラー]`);
                    }
                }
                
                return null;
            }
            
        } catch (error) {
            console.error('❌ ログインボタン検索エラー:', error.message);
            return null;
        }
    }

    async clickLoginButton(loginButton) {
        console.log('👆 ログインボタンクリック...');
        
        try {
            // ボタンがクリック可能になるまで待機
            await loginButton.waitFor({ state: 'visible', timeout: 10000 });
            
            // 実際にクリック
            await loginButton.click();
            
            console.log('  ✅ ログインボタンクリック成功');
            
            // ページ遷移またはモーダル表示を待機
            await this.page.waitForTimeout(3000);
            
            // ログイン後のページ確認
            const newUrl = this.page.url();
            const newTitle = await this.page.title();
            
            console.log(`  📄 遷移後URL: ${newUrl}`);
            console.log(`  📄 遷移後タイトル: ${newTitle}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ ログインボタンクリック失敗:', error.message);
            return false;
        }
    }

    async findLoginForm() {
        console.log('📝 ログインフォーム検索中...');
        
        try {
            // ユーザー名/メールアドレス入力フィールドを検索
            const userFieldSelectors = [
                'input[name*="user"]',
                'input[name*="mail"]',
                'input[name*="email"]',
                'input[name*="id"]',
                'input[name*="login"]',
                'input[type="text"]',
                '#username',
                '#userid',
                '#email',
                '#login_id'
            ];

            // パスワード入力フィールドを検索
            const passFieldSelectors = [
                'input[type="password"]',
                'input[name*="pass"]',
                '#password',
                '#pass'
            ];

            let userField = null;
            let passField = null;

            // ユーザー名フィールド検索
            for (const selector of userFieldSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        userField = element;
                        console.log(`  👤 ユーザー名フィールド発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // パスワードフィールド検索
            for (const selector of passFieldSelectors) {
                try {
                    const element = await this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 2000 })) {
                        passField = element;
                        console.log(`  🔒 パスワードフィールド発見: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (userField && passField) {
                console.log('  ✅ ログインフォーム確認完了');
                return { userField, passField };
            } else {
                console.log('  ❌ ログインフォームが見つかりません');
                
                // デバッグ: 全input要素を表示
                const allInputs = await this.page.locator('input').all();
                console.log('  🔧 デバッグ: ページ内のinput要素');
                for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
                    try {
                        const type = await allInputs[i].getAttribute('type');
                        const name = await allInputs[i].getAttribute('name');
                        const id = await allInputs[i].getAttribute('id');
                        console.log(`    ${i + 1}. type="${type}" name="${name}" id="${id}"`);
                    } catch (e) {
                        console.log(`    ${i + 1}. [取得エラー]`);
                    }
                }
                
                return null;
            }
            
        } catch (error) {
            console.error('❌ ログインフォーム検索エラー:', error.message);
            return null;
        }
    }

    async waitForUserInput() {
        console.log('⏳ ユーザー入力待機中...');
        console.log('   ユーザー名とパスワードを入力してください');
        console.log('   入力が完了したら、このプロセスを停止してください (Ctrl+C)');
        
        // 無限ループで待機
        while (true) {
            await this.page.waitForTimeout(5000);
            
            // ページの状態をチェック
            try {
                const url = this.page.url();
                const title = await this.page.title();
                
                // ログイン成功やページ変化の兆候をチェック
                if (url.includes('member') || url.includes('mypage') || title.includes('マイページ')) {
                    console.log('🎉 ログイン成功の可能性があります!');
                    console.log(`   現在のURL: ${url}`);
                    console.log(`   現在のタイトル: ${title}`);
                }
                
            } catch (error) {
                // ページエラーは無視して継続
            }
        }
    }

    async run() {
        try {
            await this.initialize();
            
            // サイトアクセステスト
            const accessSuccess = await this.testSiteAccess();
            if (!accessSuccess) {
                console.log('❌ サイトアクセスに失敗しました');
                return;
            }
            
            // ログインボタン検索
            const loginButton = await this.findLoginButton();
            if (!loginButton) {
                console.log('❌ ログインボタンが見つかりません');
                return;
            }
            
            // ログインボタンクリック
            const clickSuccess = await this.clickLoginButton(loginButton);
            if (!clickSuccess) {
                console.log('❌ ログインボタンクリックに失敗しました');
                return;
            }
            
            // ログインフォーム検索
            const loginForm = await this.findLoginForm();
            if (!loginForm) {
                console.log('❌ ログインフォームが見つかりません');
                return;
            }
            
            console.log('✅ ログインフォーム準備完了!');
            console.log('   ユーザー名とパスワードを入力できます');
            
            // ユーザー入力待機
            await this.waitForUserInput();
            
        } catch (error) {
            console.error('💥 予期しないエラー:', error);
        } finally {
            // クリーンアップは手動で行う（ユーザーがCtrl+Cで停止）
            console.log('🧹 テスト終了');
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// テスト実行
const tester = new YugiohDBLoginTest();

// 終了時のクリーンアップ設定
process.on('SIGINT', async () => {
    console.log('\n🛑 ユーザーによる中断...');
    await tester.cleanup();
    process.exit(0);
});

// テスト開始
tester.run().catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});