/**
 * 遊戯王DBステルスログイン - 自動化検出回避版
 */
const { chromium } = require('playwright');

class YugiohDBStealthLogin {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        console.log('🚀 遊戯王DBステルスログイン開始...');
        
        // より高度な自動化検出回避設定
        this.browser = await chromium.launch({
            headless: false,
            args: [
                // 基本設定
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                
                // 自動化検出回避（強化版）
                '--disable-blink-features=AutomationControlled',
                '--exclude-switches=enable-automation',
                '--disable-extensions-except=/home/tomo/work/app/YGO_deck_extension/src',
                '--load-extension=/home/tomo/work/app/YGO_deck_extension/src',
                
                // セキュリティ関連の無効化
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-features=TranslateUI',
                '--allow-running-insecure-content',
                '--disable-component-update',
                
                // ネットワーク関連
                '--disable-http2',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                
                // その他
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-logging',
                '--disable-gpu-logging',
                '--silent-debugger-extension-api',
                '--hide-scrollbars',
                '--mute-audio',
                
                // User-Agent偽装強化
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            ],
            ignoreHTTPSErrors: true,
            timeout: 60000
        });

        this.context = await this.browser.newContext({
            ignoreHTTPSErrors: true,
            
            // より自然なUser-Agent
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            
            // 自然なヘッダー設定
            extraHTTPHeaders: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            
            // ビューポート設定（一般的なサイズ）
            viewport: { width: 1920, height: 1080 },
            
            // その他設定
            bypassCSP: true,
            javaScriptEnabled: true,
            
            // 自然な設定
            locale: 'ja-JP',
            timezoneId: 'Asia/Tokyo'
        });

        // より自然なタイムアウト設定
        this.context.setDefaultTimeout(60000);
        this.context.setDefaultNavigationTimeout(90000);

        this.page = await this.context.newPage();
        
        // 自動化検出の追加回避策
        await this.page.addInitScript(() => {
            // webdriver プロパティを削除
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // プラグイン情報を自然に
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // 言語設定を自然に
            Object.defineProperty(navigator, 'languages', {
                get: () => ['ja', 'en-US', 'en'],
            });
            
            // Chrome runtime を削除
            if (window.chrome && window.chrome.runtime) {
                delete window.chrome.runtime.onConnect;
                delete window.chrome.runtime.onMessage;
            }
            
            // Permissions API を自然に
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });
        
        // ログ監視（エラーのみ）
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' && !text.includes('bluetooth') && !text.includes('analytics') && !text.includes('google')) {
                console.log(`[BROWSER ERROR] ${text}`);
            }
        });

        this.page.on('response', response => {
            const url = response.url();
            const status = response.status();
            if (status === 403 && (url.includes('konami') || url.includes('yugioh'))) {
                console.log(`⚠️  403エラー検出: ${url}`);
            }
        });
    }

    async navigateStealthily() {
        console.log('🥷 ステルスナビゲーション開始...');
        
        try {
            // まず通常のページから開始
            console.log('  📍 通常ページアクセス...');
            await this.page.goto('https://www.db.yugioh-card.com/yugiohdb/', {
                waitUntil: 'domcontentloaded',
                timeout: 90000
            });
            
            // 自然な待機時間
            await this.naturalWait(3000, 5000);
            
            // ページスクロールで自然な操作をシミュレート
            console.log('  📜 自然なページ操作...');
            await this.page.mouse.move(100, 100);
            await this.naturalWait(1000, 2000);
            await this.page.mouse.move(500, 300);
            await this.naturalWait(500, 1000);
            
            // ログインリンクを探す
            console.log('  🔍 ログインリンク検索...');
            const loginLink = await this.page.locator('a[href*="login"]').first();
            
            if (await loginLink.isVisible()) {
                // リンクまでマウス移動
                const linkBox = await loginLink.boundingBox();
                if (linkBox) {
                    await this.page.mouse.move(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
                    await this.naturalWait(500, 1000);
                }
                
                console.log('  👆 ログインリンククリック...');
                await loginLink.click();
                
                // 自然な遷移待機
                console.log('  ⏳ ページ遷移待機...');
                await this.naturalWait(5000, 8000);
                
                // 新しいページのURL確認
                const currentUrl = this.page.url();
                console.log(`  📄 遷移先URL: ${currentUrl}`);
                
                if (currentUrl.includes('403') || currentUrl.includes('error')) {
                    console.log('  ❌ 403エラーページに遷移しました');
                    return false;
                } else if (currentUrl.includes('konami.net')) {
                    console.log('  ✅ My KONAMIページに正常遷移');
                    return true;
                } else {
                    console.log('  ⚠️  予期しないページに遷移');
                    return false;
                }
                
            } else {
                console.log('  ❌ ログインリンクが見つかりません');
                return false;
            }
            
        } catch (error) {
            console.error('❌ ステルスナビゲーションエラー:', error.message);
            return false;
        }
    }

    async naturalWait(minMs, maxMs) {
        const waitTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        await this.page.waitForTimeout(waitTime);
    }

    async handleKonamiLogin() {
        console.log('🎯 My KONAMIログイン処理...');
        
        try {
            // 現在のページ状態確認
            const currentUrl = this.page.url();
            console.log(`  📍 現在URL: ${currentUrl}`);
            
            if (currentUrl.includes('403')) {
                console.log('  ❌ 403エラーページです');
                return null;
            }
            
            // ページ全体の読み込み完了を待機
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            await this.naturalWait(3000, 5000);
            
            console.log('  🔍 ログインフォーム要素検索...');
            
            // より柔軟なフォーム検索
            let userField = null;
            let passField = null;
            let submitButton = null;
            let attempts = 0;
            const maxAttempts = 15;
            
            while ((!userField || !passField) && attempts < maxAttempts) {
                attempts++;
                console.log(`    試行 ${attempts}/${maxAttempts}...`);
                
                // 可能性のあるボタンを自然にクリック
                if (attempts <= 5) {
                    await this.clickPossibleButtons();
                }
                
                // フォーム要素を検索
                try {
                    // ユーザー名フィールド
                    const userSelectors = [
                        '#login-form-id',
                        'input[type="text"]:visible',
                        'input[type="email"]:visible',
                        'input[name*="user"]:visible',
                        'input[name*="mail"]:visible',
                        'input[placeholder*="メール"]:visible',
                        'input[placeholder*="ユーザー"]:visible'
                    ];
                    
                    for (const selector of userSelectors) {
                        try {
                            const element = await this.page.locator(selector).first();
                            if (await element.isVisible() && await element.isEnabled()) {
                                userField = element;
                                console.log(`    👤 ユーザー名フィールド発見: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    // パスワードフィールド
                    const passSelectors = [
                        '#login-form-password',
                        'input[type="password"]:visible'
                    ];
                    
                    for (const selector of passSelectors) {
                        try {
                            const element = await this.page.locator(selector).first();
                            if (await element.isVisible() && await element.isEnabled()) {
                                passField = element;
                                console.log(`    🔒 パスワードフィールド発見: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    // 送信ボタン
                    const submitSelectors = [
                        '#login-form-login-button-id',
                        'button[type="submit"]:visible',
                        'input[type="submit"]:visible',
                        'button:has-text("ログイン"):visible'
                    ];
                    
                    for (const selector of submitSelectors) {
                        try {
                            const element = await this.page.locator(selector).first();
                            if (await element.isVisible()) {
                                submitButton = element;
                                console.log(`    📤 送信ボタン発見: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                } catch (e) {
                    console.log(`    ⚠️  検索中にエラー: ${e.message}`);
                }
                
                if (userField && passField) {
                    console.log('  ✅ ログインフォーム要素検出完了!');
                    break;
                }
                
                await this.naturalWait(2000, 3000);
            }
            
            if (userField && passField) {
                return { userField, passField, submitButton };
            } else {
                console.log('  ❌ ログインフォーム要素が見つかりません');
                await this.debugPageState();
                return null;
            }
            
        } catch (error) {
            console.error('❌ My KONAMIログイン処理エラー:', error.message);
            return null;
        }
    }

    async clickPossibleButtons() {
        try {
            const buttonTexts = ['ログイン', '別の', 'ID', 'KONAMI', 'メール'];
            const buttons = await this.page.locator('button:visible').all();
            
            for (const button of buttons) {
                try {
                    const text = await button.textContent();
                    if (text && buttonTexts.some(keyword => text.includes(keyword))) {
                        console.log(`    🔘 ボタンクリック: "${text}"`);
                        
                        // 自然なクリック操作
                        const box = await button.boundingBox();
                        if (box) {
                            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                            await this.naturalWait(300, 700);
                            await button.click();
                            await this.naturalWait(1000, 2000);
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (error) {
            // ボタンクリックエラーは無視
        }
    }

    async debugPageState() {
        console.log('  🔧 ページ状態デバッグ:');
        
        try {
            const url = this.page.url();
            const title = await this.page.title();
            console.log(`    📄 URL: ${url}`);
            console.log(`    📄 タイトル: ${title}`);
            
            const allInputs = await this.page.locator('input').all();
            console.log(`    📝 総input数: ${allInputs.length}`);
            
            const visibleInputs = await this.page.locator('input:visible').all();
            console.log(`    👁️  表示input数: ${visibleInputs.length}`);
            
            for (let i = 0; i < Math.min(visibleInputs.length, 5); i++) {
                try {
                    const input = visibleInputs[i];
                    const type = await input.getAttribute('type');
                    const id = await input.getAttribute('id');
                    const enabled = await input.isEnabled();
                    console.log(`      ${i + 1}. type="${type}" id="${id}" enabled=${enabled}`);
                } catch (e) {
                    console.log(`      ${i + 1}. [取得エラー]`);
                }
            }
            
        } catch (error) {
            console.log('    ❌ デバッグ情報取得エラー');
        }
    }

    async prepareLogin(loginElements) {
        console.log('🧪 ログイン準備...');
        
        if (!loginElements) {
            return false;
        }

        try {
            const { userField, passField, submitButton } = loginElements;
            
            // フィールドの有効性確認
            const userEnabled = await userField.isEnabled();
            const passEnabled = await passField.isEnabled();
            const submitEnabled = submitButton ? await submitButton.isEnabled() : true;
            
            console.log('  📋 フィールド状態:');
            console.log(`    👤 ユーザー名フィールド: enabled=${userEnabled}`);
            console.log(`    🔒 パスワードフィールド: enabled=${passEnabled}`);
            console.log(`    📤 送信ボタン: enabled=${submitEnabled}`);
            
            if (!userEnabled || !passEnabled) {
                console.log('  ❌ フィールドが無効です');
                return false;
            }
            
            // テスト入力で動作確認
            console.log('  🧪 フィールドテスト中...');
            
            // 自然なクリックとフォーカス
            const userBox = await userField.boundingBox();
            if (userBox) {
                await this.page.mouse.move(userBox.x + userBox.width / 2, userBox.y + userBox.height / 2);
                await this.naturalWait(300, 500);
                await this.page.mouse.click(userBox.x + userBox.width / 2, userBox.y + userBox.height / 2);
            }
            await this.naturalWait(500, 1000);
            
            // テスト入力
            await userField.fill('test@example.com');
            await this.naturalWait(500, 1000);
            
            const passBox = await passField.boundingBox();
            if (passBox) {
                await this.page.mouse.move(passBox.x + passBox.width / 2, passBox.y + passBox.height / 2);
                await this.naturalWait(300, 500);
                await this.page.mouse.click(passBox.x + passBox.width / 2, passBox.y + passBox.height / 2);
            }
            await this.naturalWait(500, 1000);
            
            await passField.fill('testpassword');
            await this.naturalWait(1000, 1500);
            
            // 入力値確認
            const userValue = await userField.inputValue();
            const passValue = await passField.inputValue();
            
            if (userValue === 'test@example.com' && passValue === 'testpassword') {
                console.log('  ✅ フィールドテスト成功');
                
                // テスト入力をクリア
                await userField.selectText();
                await userField.press('Delete');
                await passField.selectText();  
                await passField.press('Delete');
                
                console.log('  🎯 ログイン準備完了!');
                return true;
                
            } else {
                console.log('  ❌ フィールドテスト失敗');
                return false;
            }
            
        } catch (error) {
            console.error('❌ ログイン準備エラー:', error.message);
            return false;
        }
    }

    async waitForUserLogin() {
        console.log('');
        console.log('🎉 ログイン準備完了！');
        console.log('');
        console.log('👤 ログイン手順:');
        console.log('   1. ブラウザでユーザー名/メールアドレスを入力');
        console.log('   2. パスワードを入力');
        console.log('   3. ログインボタンをクリック');
        console.log('   4. 遊戯王DBへの自動リダイレクトを待機');
        console.log('');
        console.log('🛑 終了: Ctrl+C');
        console.log('');
        
        let lastUrl = this.page.url();
        let checkCount = 0;
        
        while (true) {
            await this.naturalWait(4000, 6000);
            checkCount++;
            
            try {
                const currentUrl = this.page.url();
                const currentTitle = await this.page.title();
                
                if (currentUrl !== lastUrl) {
                    console.log(`📍 URL変化: ${currentUrl}`);
                    lastUrl = currentUrl;
                    
                    // ログイン成功判定
                    if (currentUrl.includes('yugiohdb') && !currentUrl.includes('signin') && !currentUrl.includes('login')) {
                        console.log('');
                        console.log('🎊🎊🎊 ログイン成功！🎊🎊🎊');
                        console.log(`   成功URL: ${currentUrl}`);
                        console.log(`   タイトル: ${currentTitle}`);
                        console.log('');
                        console.log('✅ 遊戯王データベースにアクセス可能になりました！');
                        break;
                    }
                }
                
                if (checkCount % 10 === 0) {
                    console.log(`⏱️  ログイン待機中... (${checkCount * 5}秒経過)`);
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
            
            // 2. ステルスナビゲーション
            const navSuccess = await this.navigateStealthily();
            if (!navSuccess) {
                console.log('❌ ナビゲーション失敗');
                return;
            }
            
            // 3. My KONAMIログイン処理
            const loginElements = await this.handleKonamiLogin();
            if (!loginElements) {
                console.log('❌ ログインフォーム処理失敗');
                return;
            }
            
            // 4. ログイン準備
            const prepareSuccess = await this.prepareLogin(loginElements);
            if (!prepareSuccess) {
                console.log('❌ ログイン準備失敗');
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
const tester = new YugiohDBStealthLogin();

process.on('SIGINT', async () => {
    console.log('\n🛑 テスト終了...');
    await tester.cleanup();
    process.exit(0);
});

tester.run().catch(error => {
    console.error('❌ テスト実行失敗:', error);
    process.exit(1);
});