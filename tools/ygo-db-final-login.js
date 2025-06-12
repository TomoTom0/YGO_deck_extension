/**
 * 遊戯王DB最終ログインテスト - 動的フォーム完全対応版
 */
const { chromium } = require('playwright');

class YugiohDBFinalLogin {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 遊戯王DB最終ログインテスト開始...');
        
        this.browser = await chromium.launch({
            headless: false,
            args: [
                '--disable-http2',
                '--disable-web-security',
                '--disable-features=TranslateUI',
                '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--no-first-run',
                '--no-default-browser-check'
            ],
            ignoreHTTPSErrors: true,
            timeout: 60000
        });

        this.context = await this.browser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            },
            bypassCSP: true,
            javaScriptEnabled: true
        });

        this.context.setDefaultTimeout(120000);
        this.context.setDefaultNavigationTimeout(180000);

        this.page = await this.context.newPage();
        
        // エラー監視（重要なもののみ）
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' && !text.includes('bluetooth') && !text.includes('analytics')) {
                console.log(`[BROWSER ERROR] ${text}`);
            }
        });

        this.page.on('pageerror', error => {
            console.log(`💥 ページエラー: ${error.message}`);
        });
    }

    async navigateToLogin() {
        console.log('🌐 ログインページナビゲーション...');
        
        try {
            console.log('  📍 ホームページアクセス...');
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',
                timeout: 180000
            });
            
            await this.page.waitForTimeout(3000);
            
            console.log('  🔍 ログインリンククリック...');
            const loginLink = await this.page.locator('a[href*="login"]').first();
            await loginLink.click();
            
            console.log('  ⏳ My KONAMIページ読み込み待機...');
            await this.page.waitForTimeout(10000);
            
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`  📄 現在のURL: ${currentUrl}`);
            console.log(`  📄 現在のタイトル: ${currentTitle}`);
            
            if (currentUrl.includes('konami.net')) {
                console.log('  ✅ My KONAMIページに正常に遷移しました');
                return true;
            } else {
                console.log('  ❌ 予期しないページに遷移しました');
                return false;
            }
            
        } catch (error) {
            console.error('❌ ページナビゲーションエラー:', error.message);
            return false;
        }
    }

    async handleLoginForm() {
        console.log('📝 ログインフォーム処理...');
        
        try {
            // フォーム要素を活性化
            console.log('  🔧 フォーム要素活性化中...');
            
            // まず初期状態で表示されているログイン選択ボタンをクリック
            const loginSelectButton = await this.page.locator('#login-select-form-login-button-id');
            if (await loginSelectButton.isVisible()) {
                console.log('  👆 ログイン選択ボタンクリック...');
                await loginSelectButton.click();
                await this.page.waitForTimeout(3000);
            }
            
            // または「別のKONAMI IDでログイン」ボタンをクリック
            const anotherIdButton = await this.page.locator('text=別のKONAMI IDでログイン');
            if (await anotherIdButton.isVisible()) {
                console.log('  👆 別のKONAMI IDでログインボタンクリック...');
                await anotherIdButton.click();
                await this.page.waitForTimeout(3000);
            }
            
            // フォーム要素が表示されるまで待機
            console.log('  ⏳ フォーム要素表示待機...');
            
            let userField = null;
            let passField = null;
            let submitButton = null;
            
            // 最大20回試行でフォーム要素を検索
            for (let attempt = 1; attempt <= 20; attempt++) {
                console.log(`    検索試行 ${attempt}/20...`);
                
                try {
                    // ユーザー名フィールドの検索
                    const userElement = await this.page.locator('#login-form-id').first();
                    if (await userElement.isVisible()) {
                        userField = userElement;
                        console.log('    👤 ユーザー名フィールド発見');
                    }
                    
                    // パスワードフィールドの検索
                    const passElement = await this.page.locator('#login-form-password').first();
                    if (await passElement.isVisible()) {
                        passField = passElement;
                        console.log('    🔒 パスワードフィールド発見');
                    }
                    
                    // 送信ボタンの検索
                    const submitElement = await this.page.locator('#login-form-login-button-id').first();
                    if (await submitElement.isVisible()) {
                        submitButton = submitElement;
                        console.log('    📤 送信ボタン発見');
                    }
                    
                    // 全て見つかったら終了
                    if (userField && passField && submitButton) {
                        console.log('  🎯 ログインフォーム完全準備完了!');
                        break;
                    }
                    
                } catch (e) {
                    // エラーは無視して継続
                }
                
                // 各種ボタンクリックを試行してフォームを活性化
                if (attempt <= 10) {
                    try {
                        // 可能性のあるボタンを全てクリックしてみる
                        const buttons = await this.page.locator('button:visible').all();
                        for (const button of buttons) {
                            const text = await button.textContent();
                            if (text && (text.includes('ログイン') || text.includes('別の') || text.includes('ID'))) {
                                console.log(`    🔘 ボタンクリック試行: "${text}"`);
                                await button.click();
                                await this.page.waitForTimeout(2000);
                                break;
                            }
                        }
                    } catch (e) {
                        // ボタンクリックエラーは無視
                    }
                }
                
                await this.page.waitForTimeout(2000);
            }
            
            // フォーム準備が完了したかチェック
            if (userField && passField) {
                console.log('  ✅ ログインフォーム準備成功!');
                console.log('  📋 フォーム詳細:');
                
                try {
                    const userEnabled = await userField.isEnabled();
                    const passEnabled = await passField.isEnabled();
                    const submitEnabled = submitButton ? await submitButton.isEnabled() : false;
                    
                    console.log(`    👤 ユーザー名フィールド: enabled=${userEnabled}`);
                    console.log(`    🔒 パスワードフィールド: enabled=${passEnabled}`);
                    console.log(`    📤 送信ボタン: enabled=${submitEnabled}`);
                    
                } catch (e) {
                    console.log('    📋 フィールド状態取得でエラー');
                }
                
                return { userField, passField, submitButton };
                
            } else {
                console.log('  ❌ ログインフォーム準備失敗');
                
                // 現在のページ状態をデバッグ出力
                await this.debugCurrentState();
                
                return null;
            }
            
        } catch (error) {
            console.error('❌ ログインフォーム処理エラー:', error.message);
            return null;
        }
    }

    async debugCurrentState() {
        console.log('  🔧 現在のページ状態デバッグ:');
        
        try {
            // 表示されているボタンを全て表示
            const visibleButtons = await this.page.locator('button:visible').all();
            console.log(`    🔘 表示中のボタン数: ${visibleButtons.length}`);
            
            for (let i = 0; i < Math.min(visibleButtons.length, 8); i++) {
                try {
                    const button = visibleButtons[i];
                    const text = await button.textContent();
                    const id = await button.getAttribute('id');
                    console.log(`      ${i + 1}. "${text}" (id: ${id})`);
                } catch (e) {
                    console.log(`      ${i + 1}. [取得エラー]`);
                }
            }
            
            // 表示されているinput要素を全て表示
            const visibleInputs = await this.page.locator('input:visible').all();
            console.log(`    📝 表示中のinput数: ${visibleInputs.length}`);
            
            for (let i = 0; i < Math.min(visibleInputs.length, 5); i++) {
                try {
                    const input = visibleInputs[i];
                    const type = await input.getAttribute('type');
                    const id = await input.getAttribute('id');
                    const name = await input.getAttribute('name');
                    console.log(`      ${i + 1}. type="${type}" id="${id}" name="${name}"`);
                } catch (e) {
                    console.log(`      ${i + 1}. [取得エラー]`);
                }
            }
            
        } catch (error) {
            console.log('    ❌ デバッグ情報取得エラー');
        }
    }

    async testAndPrepareForm(loginForm) {
        console.log('🧪 フォーム動作テスト...');
        
        if (!loginForm || !loginForm.userField || !loginForm.passField) {
            console.log('  ❌ フォーム要素が不足');
            return false;
        }

        try {
            const { userField, passField, submitButton } = loginForm;
            
            // フィールドクリアとテスト入力
            console.log('  🧹 フィールドクリア...');
            await userField.click();
            await userField.fill('');
            await passField.click();
            await passField.fill('');
            
            console.log('  📝 テスト入力...');
            await userField.fill('test@example.com');
            await this.page.waitForTimeout(1000);
            await passField.fill('testpassword');
            await this.page.waitForTimeout(1000);
            
            // フィールドの値を確認
            const userValue = await userField.inputValue();
            const passValue = await passField.inputValue();
            
            if (userValue === 'test@example.com' && passValue === 'testpassword') {
                console.log('  ✅ フィールド入力テスト成功');
                
                // テスト入力をクリア
                console.log('  🧹 テスト入力クリア...');
                await userField.click();
                await userField.fill('');
                await passField.click();
                await passField.fill('');
                
                console.log('  🎯 フォーム準備完了! ユーザーが入力可能です');
                return true;
                
            } else {
                console.log('  ❌ フィールド入力テスト失敗');
                console.log(`    期待: test@example.com / testpassword`);
                console.log(`    実際: ${userValue} / ${passValue}`);
                return false;
            }
            
        } catch (error) {
            console.error('❌ フォーム動作テストエラー:', error.message);
            return false;
        }
    }

    async waitForUserLogin() {
        console.log('⏳ ユーザーログイン待機モード');
        console.log('');
        console.log('🎯 ログインの準備が完了しました！');
        console.log('');
        console.log('📋 ログイン手順:');
        console.log('   1. ブラウザのユーザー名フィールドに入力');
        console.log('   2. パスワードフィールドに入力');
        console.log('   3. ログインボタンをクリック');
        console.log('   4. ログイン完了まで待機');
        console.log('');
        console.log('🛑 テスト終了: Ctrl+C');
        console.log('');
        
        let lastUrl = this.page.url();
        let lastTitle = await this.page.title();
        let checkCount = 0;
        
        // 状態監視ループ
        while (true) {
            await this.page.waitForTimeout(5000);
            checkCount++;
            
            try {
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                // URL/タイトル変化の検出
                let changed = false;
                if (currentUrl !== lastUrl) {
                    console.log(`📍 URL変化: ${currentUrl}`);
                    lastUrl = currentUrl;
                    changed = true;
                }
                
                if (currentTitle !== lastTitle) {
                    console.log(`📄 タイトル変化: ${currentTitle}`);
                    lastTitle = currentTitle;
                    changed = true;
                }
                
                // ログイン成功の判定
                if (currentUrl.includes('yugiohdb') && !currentUrl.includes('signin') && !currentUrl.includes('login')) {
                    console.log('');
                    console.log('🎉🎉🎉 ログイン成功！🎉🎉🎉');
                    console.log(`   成功URL: ${currentUrl}`);
                    console.log(`   成功タイトル: ${currentTitle}`);
                    console.log('');
                    console.log('✅ 遊戯王DBにログインできました！');
                    console.log('   これで拡張機能の開発・テストが可能です。');
                    break;
                } else if (currentUrl.includes('member') || 
                          currentUrl.includes('mypage') || 
                          currentTitle.includes('マイページ')) {
                    console.log('');
                    console.log('🎊 My KONAMIログイン成功！');
                    console.log('   遊戯王DBへの自動リダイレクトを待機中...');
                    console.log('');
                }
                
                // 10回ごとに状態レポート
                if (checkCount % 10 === 0 && !changed) {
                    console.log(`⏱️  状態監視中... (${checkCount * 5}秒経過)`);
                    console.log(`   現在のURL: ${currentUrl}`);
                }
                
            } catch (error) {
                console.log(`⚠️  状態確認エラー: ${error.message}`);
            }
        }
    }

    async run() {
        try {
            // 1. 初期化
            await this.initialize();
            
            // 2. ログインページナビゲーション
            const navSuccess = await this.navigateToLogin();
            if (!navSuccess) {
                console.log('❌ ログインページナビゲーション失敗');
                return;
            }
            
            // 3. ログインフォーム処理
            const loginForm = await this.handleLoginForm();
            if (!loginForm) {
                console.log('❌ ログインフォーム処理失敗');
                return;
            }
            
            // 4. フォーム動作テスト
            const testSuccess = await this.testAndPrepareForm(loginForm);
            if (!testSuccess) {
                console.log('❌ フォーム動作テスト失敗');
                return;
            }
            
            // 5. ユーザーログイン待機
            await this.waitForUserLogin();
            
        } catch (error) {
            console.error('💥 予期しないエラー:', error);
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// テスト実行
const tester = new YugiohDBFinalLogin();

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
tester.run().catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});