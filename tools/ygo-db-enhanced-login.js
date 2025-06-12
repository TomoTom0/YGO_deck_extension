/**
 * 遊戯王DB強化ログインテスト - 動的フォーム対応版
 */
const { chromium } = require('playwright');

class YugiohDBEnhancedLogin {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 遊戯王DB強化ログインテスト開始...');
        
        // さらなる対策を追加したブラウザ設定
        this.browser = await chromium.launch({
            headless: false,
            args: [
                '--disable-http2',
                '--disable-features=VizDisplayCompositor',
                '--disable-web-security',
                '--disable-features=TranslateUI',
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
                '--silent-debugger-extension-api',
                '--disable-blink-features=AutomationControlled' // 自動化検出を無効化
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
            // JavaScript有効化とイベント処理の改善
            javaScriptEnabled: true
        });

        // タイムアウト設定をさらに長く
        this.context.setDefaultTimeout(120000);
        this.context.setDefaultNavigationTimeout(180000);

        this.page = await this.context.newPage();
        
        // より詳細なログ監視
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('error') || text.includes('Error')) {
                console.log(`[BROWSER ERROR] ${text}`);
            } else if (type === 'log' || type === 'info') {
                console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
            }
        });

        this.page.on('requestfailed', request => {
            const url = request.url();
            const failure = request.failure();
            if (!url.includes('google-analytics') && !url.includes('facebook') && !url.includes('twitter')) {
                console.log(`❌ 重要なリクエスト失敗: ${url} - ${failure?.errorText}`);
            }
        });

        this.page.on('response', response => {
            if (!response.ok() && !response.url().includes('google-analytics')) {
                console.log(`⚠️  レスポンスエラー: ${response.url()} - ${response.status()}`);
            }
        });

        // ページエラーイベントの監視
        this.page.on('pageerror', error => {
            console.log(`💥 ページエラー: ${error.message}`);
        });
    }

    async accessLoginPage() {
        console.log('🌐 ログインページアクセス...');
        
        try {
            // ホームページから開始
            console.log('  📍 ホームページにアクセス中...');
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',
                timeout: 180000
            });
            
            console.log('  ✅ ホームページ読み込み成功');
            await this.page.waitForTimeout(5000);

            // ログインリンクを探してクリック
            console.log('  🔍 ログインリンク検索中...');
            const loginLink = await this.page.locator('a[href*="login"]').first();
            
            if (await loginLink.isVisible()) {
                console.log('  👆 ログインリンククリック...');
                await loginLink.click();
                
                // ページ遷移を待機（複数の方法で）
                console.log('  ⏳ ページ遷移待機中...');
                
                try {
                    // URL変化を待機
                    await this.page.waitForURL('**/signin**', { timeout: 30000 });
                } catch (e) {
                    console.log('  📍 URL変化待機がタイムアウト、別の方法で確認中...');
                }
                
                // DOM内容を待機
                await this.page.waitForTimeout(10000); // 10秒待機
                
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                console.log(`  📄 現在のURL: ${currentUrl}`);
                console.log(`  📄 現在のタイトル: ${currentTitle}`);
                
                return true;
            } else {
                console.log('  ❌ ログインリンクが見つかりません');
                return false;
            }
            
        } catch (error) {
            console.error('❌ ログインページアクセス失敗:', error.message);
            return false;
        }
    }

    async waitForFormLoad() {
        console.log('📝 ログインフォーム読み込み待機...');
        
        try {
            // 複数の待機戦略を組み合わせ
            console.log('  ⏳ JavaScript実行完了を待機中...');
            
            // 1. ネットワークアイドル状態を待機
            try {
                await this.page.waitForLoadState('networkidle', { timeout: 30000 });
                console.log('  ✅ ネットワークアイドル状態確認');
            } catch (e) {
                console.log('  ⚠️  ネットワークアイドル待機タイムアウト、続行...');
            }
            
            // 2. DOM読み込み完了を待機
            await this.page.waitForLoadState('domcontentloaded');
            console.log('  ✅ DOM読み込み完了');
            
            // 3. 追加の待機時間
            await this.page.waitForTimeout(15000); // 15秒待機
            
            // 4. フォーム要素の動的検索
            console.log('  🔍 フォーム要素動的検索中...');
            
            let formFound = false;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (!formFound && attempts < maxAttempts) {
                attempts++;
                console.log(`    検索試行 ${attempts}/${maxAttempts}...`);
                
                // 様々なセレクターでフォーム要素を検索
                const selectors = [
                    'input[type="text"]',
                    'input[type="email"]', 
                    'input[type="password"]',
                    'input[name*="user"]',
                    'input[name*="mail"]',
                    'input[name*="login"]',
                    'input[id*="login"]',
                    'input[id*="user"]',
                    'input[id*="mail"]',
                    'form input',
                    '#login-form-id',
                    '#login-form-password'
                ];
                
                for (const selector of selectors) {
                    try {
                        const elements = await this.page.locator(selector).all();
                        if (elements.length > 0) {
                            for (const element of elements) {
                                if (await element.isVisible()) {
                                    console.log(`    ✅ フォーム要素発見: ${selector}`);
                                    formFound = true;
                                    break;
                                }
                            }
                            if (formFound) break;
                        }
                    } catch (e) {
                        // このセレクターでは見つからない
                        continue;
                    }
                }
                
                if (!formFound) {
                    console.log(`    待機中... (${attempts * 3}秒経過)`);
                    await this.page.waitForTimeout(3000);
                }
            }
            
            if (formFound) {
                console.log('  🎯 ログインフォーム検出成功');
                return true;
            } else {
                console.log('  ❌ ログインフォーム検出失敗');
                return false;
            }
            
        } catch (error) {
            console.error('❌ フォーム読み込み待機エラー:', error.message);
            return false;
        }
    }

    async findAndPrepareLoginForm() {
        console.log('🎯 ログインフォーム準備...');
        
        try {
            // より柔軟なフォーム検索
            const formSearches = [
                // My KONAMIサイト専用セレクター
                { 
                    userSelector: '#login-form-id',
                    passSelector: '#login-form-password',
                    submitSelector: 'button[type="submit"], input[type="submit"], .login-btn'
                },
                // 一般的なログインフォーム
                {
                    userSelector: 'input[type="text"], input[type="email"], input[name*="user"], input[name*="mail"]',
                    passSelector: 'input[type="password"]',
                    submitSelector: 'button[type="submit"], input[type="submit"]'
                }
            ];

            let userField = null;
            let passField = null;
            let submitButton = null;

            for (const search of formSearches) {
                console.log(`  🔍 セレクター試行: ${search.userSelector}`);
                
                try {
                    // ユーザー名フィールド検索
                    const userElements = await this.page.locator(search.userSelector).all();
                    for (const element of userElements) {
                        if (await element.isVisible()) {
                            userField = element;
                            console.log(`    👤 ユーザー名フィールド発見`);
                            break;
                        }
                    }

                    // パスワードフィールド検索
                    if (userField) {
                        const passElements = await this.page.locator(search.passSelector).all();
                        for (const element of passElements) {
                            if (await element.isVisible()) {
                                passField = element;
                                console.log(`    🔒 パスワードフィールド発見`);
                                break;
                            }
                        }
                    }

                    // 送信ボタン検索
                    if (userField && passField) {
                        const submitElements = await this.page.locator(search.submitSelector).all();
                        for (const element of submitElements) {
                            if (await element.isVisible()) {
                                submitButton = element;
                                console.log(`    📤 送信ボタン発見`);
                                break;
                            }
                        }
                        
                        // フォーム要素が全て見つかったら終了
                        if (submitButton) break;
                    }
                } catch (e) {
                    console.log(`    ❌ セレクター "${search.userSelector}" でエラー`);
                    continue;
                }
            }

            if (userField && passField) {
                console.log('  ✅ ログインフォーム準備完了!');
                
                // フィールドの詳細情報を表示
                try {
                    const userFieldInfo = {
                        id: await userField.getAttribute('id'),
                        name: await userField.getAttribute('name'),
                        type: await userField.getAttribute('type')
                    };
                    
                    const passFieldInfo = {
                        id: await passField.getAttribute('id'),
                        name: await passField.getAttribute('name'),
                        type: await passField.getAttribute('type')
                    };
                    
                    console.log(`    👤 ユーザー名フィールド: id="${userFieldInfo.id}" name="${userFieldInfo.name}" type="${userFieldInfo.type}"`);
                    console.log(`    🔒 パスワードフィールド: id="${passFieldInfo.id}" name="${passFieldInfo.name}" type="${passFieldInfo.type}"`);
                    
                    if (submitButton) {
                        const submitInfo = {
                            id: await submitButton.getAttribute('id'),
                            type: await submitButton.getAttribute('type'),
                            text: await submitButton.textContent()
                        };
                        console.log(`    📤 送信ボタン: id="${submitInfo.id}" type="${submitInfo.type}" text="${submitInfo.text}"`);
                    }
                    
                } catch (e) {
                    console.log('    📋 フィールド詳細情報取得でエラー');
                }
                
                return { userField, passField, submitButton };
                
            } else {
                console.log('  ❌ 必要なフォーム要素が見つかりません');
                
                // デバッグ情報を表示
                await this.debugPageElements();
                
                return null;
            }
            
        } catch (error) {
            console.error('❌ ログインフォーム準備エラー:', error.message);
            return null;
        }
    }

    async debugPageElements() {
        console.log('  🔧 デバッグ: ページ要素詳細');
        
        try {
            // 全input要素の詳細を表示
            const allInputs = await this.page.locator('input').all();
            console.log(`    📝 input要素数: ${allInputs.length}`);
            
            for (let i = 0; i < Math.min(allInputs.length, 8); i++) {
                try {
                    const input = allInputs[i];
                    const id = await input.getAttribute('id');
                    const name = await input.getAttribute('name');
                    const type = await input.getAttribute('type');
                    const className = await input.getAttribute('class');
                    const visible = await input.isVisible();
                    
                    console.log(`      ${i + 1}. id="${id}" name="${name}" type="${type}" class="${className}" visible=${visible}`);
                } catch (e) {
                    console.log(`      ${i + 1}. [取得エラー]`);
                }
            }

            // 全button要素の詳細を表示
            const allButtons = await this.page.locator('button').all();
            console.log(`    🔘 button要素数: ${allButtons.length}`);
            
            for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
                try {
                    const button = allButtons[i];
                    const id = await button.getAttribute('id');
                    const type = await button.getAttribute('type');
                    const className = await button.getAttribute('class');
                    const text = await button.textContent();
                    const visible = await button.isVisible();
                    
                    console.log(`      ${i + 1}. id="${id}" type="${type}" class="${className}" text="${text}" visible=${visible}`);
                } catch (e) {
                    console.log(`      ${i + 1}. [取得エラー]`);
                }
            }
            
        } catch (error) {
            console.log('    ❌ デバッグ情報取得エラー');
        }
    }

    async testFormInteraction(loginForm) {
        console.log('🧪 フォーム操作テスト...');
        
        if (!loginForm || !loginForm.userField || !loginForm.passField) {
            console.log('  ❌ フォーム要素が不足しています');
            return false;
        }

        try {
            const { userField, passField, submitButton } = loginForm;
            
            // フィールドにフォーカスしてテスト入力
            console.log('  📝 テスト入力実行中...');
            
            // ユーザー名フィールドテスト
            await userField.click();
            await this.page.waitForTimeout(1000);
            await userField.fill('test@example.com');
            console.log('    ✅ ユーザー名フィールド入力成功');
            
            // パスワードフィールドテスト
            await passField.click();
            await this.page.waitForTimeout(1000);
            await passField.fill('testpassword');
            console.log('    ✅ パスワードフィールド入力成功');
            
            // 送信ボタンの状態確認
            if (submitButton) {
                const isEnabled = await submitButton.isEnabled();
                const isVisible = await submitButton.isVisible();
                console.log(`    📤 送信ボタン状態: enabled=${isEnabled}, visible=${isVisible}`);
                
                if (isEnabled && isVisible) {
                    console.log('  🎯 フォーム準備完了! ユーザーが実際の認証情報を入力できます');
                    return true;
                } else {
                    console.log('  ⚠️  送信ボタンが無効または非表示です');
                }
            } else {
                console.log('  ⚠️  送信ボタンが見つかりませんが、Enterキーで送信可能です');
                return true;
            }
            
        } catch (error) {
            console.error('❌ フォーム操作テストエラー:', error.message);
            return false;
        }
    }

    async waitForUserInteraction() {
        console.log('⏳ ユーザー操作待機モード');
        console.log('');
        console.log('👤 以下の手順で操作してください:');
        console.log('   1. ブラウザでテスト入力を削除');
        console.log('   2. 正しいユーザー名/メールアドレスを入力');
        console.log('   3. 正しいパスワードを入力');
        console.log('   4. ログインボタンを押すか、Enterキーを押す');
        console.log('   5. ログイン完了まで待機');
        console.log('');
        console.log('🛑 テスト終了する場合は Ctrl+C を押してください');
        console.log('');
        
        let lastUrl = this.page.url();
        let lastTitle = await this.page.title();
        
        // 無限ループで状態監視
        while (true) {
            await this.page.waitForTimeout(3000);
            
            try {
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                // URL変化を検出
                if (currentUrl !== lastUrl) {
                    console.log(`📍 URL変化検出: ${lastUrl} → ${currentUrl}`);
                    lastUrl = currentUrl;
                }
                
                // タイトル変化を検出
                if (currentTitle !== lastTitle) {
                    console.log(`📄 タイトル変化検出: ${lastTitle} → ${currentTitle}`);
                    lastTitle = currentTitle;
                }
                
                // ログイン成功の兆候を確認
                if (currentUrl.includes('member') || 
                    currentUrl.includes('mypage') || 
                    currentUrl.includes('dashboard') ||
                    currentTitle.includes('マイページ') ||
                    currentTitle.includes('My Page') ||
                    currentTitle.includes('Dashboard')) {
                    
                    console.log('');
                    console.log('🎉 ログイン成功の可能性があります!');
                    console.log(`   URL: ${currentUrl}`);
                    console.log(`   タイトル: ${currentTitle}`);
                    console.log('');
                }
                
            } catch (error) {
                // ページエラーは無視して継続
                console.log(`⚠️  ページ状態確認でエラー: ${error.message}`);
            }
        }
    }

    async run() {
        try {
            await this.initialize();
            
            // 1. ログインページアクセス
            const accessSuccess = await this.accessLoginPage();
            if (!accessSuccess) {
                console.log('❌ ログインページアクセスに失敗');
                return;
            }
            
            // 2. フォーム読み込み待機
            const loadSuccess = await this.waitForFormLoad();
            if (!loadSuccess) {
                console.log('❌ ログインフォーム読み込みに失敗');
                return;
            }
            
            // 3. ログインフォーム準備
            const loginForm = await this.findAndPrepareLoginForm();
            if (!loginForm) {
                console.log('❌ ログインフォーム準備に失敗');
                return;
            }
            
            // 4. フォーム操作テスト
            const testSuccess = await this.testFormInteraction(loginForm);
            if (!testSuccess) {
                console.log('❌ フォーム操作テストに失敗');
                return;
            }
            
            // 5. ユーザー操作待機
            await this.waitForUserInteraction();
            
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
const tester = new YugiohDBEnhancedLogin();

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