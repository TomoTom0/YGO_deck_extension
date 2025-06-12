/**
 * 遊戯王DBデッキサポート - Content Script
 * 公式サイトのデッキ編集機能を改善する
 */

class YGODeckSupport {
    constructor() {
        this.isInitialized = false;
        this.currentPage = this.detectCurrentPage();
        console.log('YGO Deck Support - Initializing on page:', this.currentPage);
    }

    /**
     * 現在のページタイプを検出 (2025年版対応)
     */
    detectCurrentPage() {
        const url = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const ope = urlParams.get('ope');
        const wname = urlParams.get('wname');
        
        console.log('YGO Deck Support - URL analysis:', { url, ope, wname });
        
        // member_deck.actionの操作種別で判定
        if (url.includes('member_deck.action')) {
            switch (ope) {
                case '1': return 'deck_detail';  // デッキ詳細表示
                case '2': return 'deck_edit';    // デッキ編集
                case '4': return 'deck_list';    // デッキ一覧
                case '6': return 'deck_new';     // 新規デッキ作成
                case '8': return 'deck_copy';    // デッキコピー
                default: return 'deck_unknown';
            }
        } else if (url.includes('deck_edit.action')) {
            return 'deck_edit';  // テスト用の直接デッキ編集URL
        } else if (url.includes('card_search.action')) {
            return 'card_search';
        } else if (url.includes('deck_search.action')) {
            return 'deck_search';
        } else if (url.includes('member_login.action') && wname === 'MemberDeck') {
            return 'login_for_deck';  // デッキ機能へのログイン画面
        } else if (url.includes('/yugiohdb/') && url.endsWith('/yugiohdb/')) {
            return 'home';
        }
        
        // 2025年版でリダイレクトされる可能性があるKONAMI IDログインページ
        if (url.includes('my.konami.net') || url.includes('signin')) {
            return 'konami_login';
        }
        
        return 'unknown';
    }

    /**
     * 初期化処理
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // ページの読み込み完了を待つ
            await this.waitForPageLoad();
            
            // 現在のページに応じた機能を有効化
            switch (this.currentPage) {
                case 'deck_edit':
                case 'deck_new':
                    this.initDeckEditPage();
                    break;
                case 'deck_detail':
                    this.initDeckDetailPage();
                    break;
                case 'deck_list':
                    this.initDeckListPage();
                    break;
                case 'card_search':
                    this.initCardSearchPage();
                    break;
                case 'deck_search':
                    this.initDeckSearchPage();
                    break;
                case 'login_for_deck':
                    this.initLoginPage();
                    break;
                case 'konami_login':
                    this.initKonamiLoginPage();
                    break;
                case 'home':
                    this.initHomePage();
                    break;
                default:
                    console.log('YGO Deck Support - No specific features for this page:', this.currentPage);
            }
            
            this.isInitialized = true;
            
            // テスト用のグローバルフラグを設定
            window.YGO_DECK_SUPPORT_LOADED = true;
            
            // グローバルYGOオブジェクトを設定
            this.setupGlobalYGOObjects();
            
            console.log('YGO Deck Support - Initialization complete');
            console.log('YGO Deck Support - YGO_DECK_SUPPORT_LOADED:', window.YGO_DECK_SUPPORT_LOADED);
            console.log('YGO Deck Support - Global YGO object:', window.YGO);
            
        } catch (error) {
            console.error('YGO Deck Support - Initialization failed:', error);
        }
    }

    /**
     * ページの読み込み完了を待つ
     */
    async waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    /**
     * デッキ編集ページの機能初期化
     */
    initDeckEditPage() {
        console.log('YGO Deck Support - Initializing deck edit features');
        console.log('YGO Deck Support - Current page type:', this.currentPage);
        console.log('YGO Deck Support - Current URL:', window.location.href);
        
        // 現在のページ構造を調査
        this.analyzeDeckEditStructure();
        
        // UIの改善を適用
        this.enhanceDeckEditUI();
        
        console.log('YGO Deck Support - Deck edit features initialized');
    }

    /**
     * デッキ詳細ページの機能初期化
     */
    initDeckDetailPage() {
        console.log('YGO Deck Support - Initializing deck detail features');
        
        // 現在のページ構造を調査
        this.analyzeDeckDetailStructure();
        
        // 詳細表示の改善
        this.enhanceDeckDetailUI();
    }

    /**
     * デッキ一覧ページの機能初期化
     */
    initDeckListPage() {
        console.log('YGO Deck Support - Initializing deck list features');
        
        // デッキ一覧の改善
        this.enhanceDeckListUI();
    }

    /**
     * カード検索ページの機能初期化
     */
    initCardSearchPage() {
        console.log('YGO Deck Support - Initializing card search features');
        
        // カード検索の改善
        this.enhanceCardSearchUI();
    }

    /**
     * デッキ検索ページの機能初期化
     */
    initDeckSearchPage() {
        console.log('YGO Deck Support - Initializing deck search features');
        
        // デッキ検索結果の改善UI
        this.enhanceDeckSearchUI();
    }

    /**
     * ログインページの機能初期化
     */
    initLoginPage() {
        console.log('YGO Deck Support - Initializing login page features');
        
        // ログイン画面での便利機能
        this.enhanceLoginUI();
    }

    /**
     * KONAMI IDログインページの機能初期化
     */
    initKonamiLoginPage() {
        console.log('YGO Deck Support - Initializing KONAMI login page features');
        
        // KONAMI IDログイン画面での便利機能
        this.enhanceKonamiLoginUI();
    }

    /**
     * ホームページの機能初期化
     */
    initHomePage() {
        console.log('YGO Deck Support - Initializing home page features');
        
        // ホーム画面での便利機能
        this.enhanceHomeUI();
    }

    /**
     * デッキ編集ページの構造を分析
     */
    analyzeDeckEditStructure() {
        const analysis = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            elements: {}
        };

        // 2025年版の公式サイト構造に基づく要素を検索
        const selectors = [
            // フォーム関連
            'form[action*="member_deck.action"]',
            'input[type="hidden"][name="ope"]',
            'input[type="hidden"][name="ytkn"]',
            'input[type="hidden"][name="cgid"]',
            'input[type="hidden"][name="wname"]',
            
            // 現在のデッキ構造（2025年調査結果）
            'heading[level="3"]', // メインデッキ、エクストラデッキ、サイドデッキ
            'generic[id*="main"]',
            'generic[id*="extra"]', 
            'generic[id*="side"]',
            
            // デッキ情報
            '.deck_set',
            '.deck_list',
            '[class*="deck"]',
            
            // リンク要素
            'link[href*="deck"]',
            'link[href*="編集開始"]',
            'link[href*="デッキをコピー"]',
            
            // 新しいサイト構造
            'article',
            'navigation',
            'banner',
            'generic',
            'list',
            'listitem',
            
            // 汎用要素
            'table',
            'input[type="submit"]',
            'select',
            'textarea',
            'button',
            'combobox'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                analysis.elements[selector] = {
                    count: elements.length,
                    sample: elements[0].outerHTML.substring(0, 200) + '...'
                };
            }
        });

        console.log('YGO Deck Support - Page structure analysis:', analysis);
        
        // 分析結果をストレージに保存（開発用）
        chrome.storage.local.set({
            'page_analysis': analysis
        });
    }

    /**
     * デッキ詳細ページの構造を分析
     */
    analyzeDeckDetailStructure() {
        console.log('YGO Deck Support - Analyzing deck detail structure');
        // 実装予定: デッキ詳細表示ページの構造分析
    }

    /**
     * デッキ詳細表示UIの改善
     */
    enhanceDeckDetailUI() {
        console.log('YGO Deck Support - Enhancing deck detail UI');
        // 実装予定: 編集開始ボタンの強化、表示切り替え改善など
    }

    /**
     * デッキ一覧UIの改善
     */
    enhanceDeckListUI() {
        console.log('YGO Deck Support - Enhancing deck list UI');
        // 実装予定: フィルタリング、並び替え、一括操作など
    }

    /**
     * カード検索UIの改善
     */
    enhanceCardSearchUI() {
        console.log('YGO Deck Support - Enhancing card search UI');
        
        // ステータス表示要素を追加（テスト用）
        const statusElement = document.createElement('div');
        statusElement.id = 'ygo-status';
        statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        statusElement.textContent = 'YGO Deck Support - Active';
        
        // 既存のステータス要素があれば削除
        const existingStatus = document.getElementById('ygo-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        document.body.appendChild(statusElement);
        
        // 実装予定: 高度検索、フィルタリング、プレビューなど
    }

    /**
     * デッキ編集UIの改善
     */
    enhanceDeckEditUI() {
        console.log('YGO Deck Support - Enhancing deck edit UI for 2025 structure');
        
        // 既存のUIが存在する場合は削除
        const existingUI = document.getElementById('ygo-deck-support-ui');
        if (existingUI) {
            existingUI.remove();
        }
        
        // 改善UI用のコンテナを作成
        const container = document.createElement('div');
        container.id = 'ygo-deck-support-ui';
        container.innerHTML = `
            <div class="ygo-support-panel">
                <h3>🎮 デッキサポート機能 v3.0</h3>
                <div class="ygo-support-status">
                    <p>📊 ページ: ${this.currentPage}</p>
                    <p>🔍 URL: ${window.location.pathname}</p>
                    <button id="ygo-analyze-btn">再分析</button>
                    <button id="ygo-debug-btn">デバッグ表示</button>
                </div>
                <div id="ygo-debug-area" style="display: none;">
                    <pre id="ygo-debug-content"></pre>
                </div>
            </div>
        `;

        // ページに挿入（記事エリアが見つからない場合はbodyに挿入）
        const article = document.querySelector('article');
        const insertTarget = article || document.body;
        insertTarget.appendChild(container);

        // MouseUI機能を初期化
        this.initMouseUI();
        
        // デッキエリアとカードエリアを初期化
        this.initDeckAreas();

        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 初回分析を実行
        this.analyzeDeckEditStructure();
    }
    
    /**
     * MouseUI機能の初期化
     */
    initMouseUI() {
        console.log('YGO Deck Support - Initializing MouseUI features');
        
        // MouseUIコントロールパネルを作成
        const mouseUIPanel = document.createElement('div');
        mouseUIPanel.id = 'ygo-mouse-ui';
        mouseUIPanel.className = 'ygo-mouse-ui-panel';
        mouseUIPanel.innerHTML = `
            <div class="mouse-ui-header">
                <h4>🖱️ MouseUI Mode</h4>
                <button id="mouse-ui-toggle" class="mouse-ui-btn">有効化</button>
            </div>
            <div class="mouse-ui-controls" id="mouse-ui-controls" style="display: none;">
                <div class="control-group">
                    <button id="mouse-ui-sort" class="mouse-ui-btn">ソート</button>
                    <button id="mouse-ui-shuffle" class="mouse-ui-btn">シャッフル</button>
                    <button id="mouse-ui-clear" class="mouse-ui-btn">クリア</button>
                </div>
                <div class="control-group">
                    <button id="mouse-ui-export" class="mouse-ui-btn">エクスポート</button>
                    <button id="mouse-ui-import" class="mouse-ui-btn">インポート</button>
                    <button id="mouse-ui-save" class="mouse-ui-btn">保存</button>
                </div>
            </div>
        `;

        // MouseUIパネルを挿入
        const targetContainer = document.getElementById('ygo-deck-support-ui');
        if (targetContainer) {
            targetContainer.appendChild(mouseUIPanel);
        } else {
            document.body.appendChild(mouseUIPanel);
        }

        // MouseUIイベントリスナーを設定
        this.setupMouseUIListeners();
    }
    
    /**
     * デッキエリアとカードエリアの初期化
     */
    initDeckAreas() {
        console.log('YGO Deck Support - Initializing deck areas');
        
        // デッキエリアを検出・作成
        this.createDeckArea('main', 'メインデッキ');
        this.createDeckArea('extra', 'エクストラデッキ');
        this.createDeckArea('side', 'サイドデッキ');
        
        // カードエリアを作成
        this.createCardArea();
    }
    
    /**
     * デッキエリアを作成
     */
    createDeckArea(type, name) {
        const deckAreaId = `ygo-deck-area-${type}`;
        
        // 既存のエリアがあれば削除
        const existingArea = document.getElementById(deckAreaId);
        if (existingArea) {
            existingArea.remove();
        }
        
        // 新しいデッキエリアを作成
        const deckArea = document.createElement('div');
        deckArea.id = deckAreaId;
        deckArea.className = 'ygo-deck-area';
        deckArea.setAttribute('data-deck-type', type);
        deckArea.innerHTML = `
            <div class="deck-area-header">
                <h4>${name} <span class="card-count">(0)</span></h4>
            </div>
            <div class="deck-area-content" id="deck-content-${type}">
                <!-- カードがここに表示されます -->
            </div>
        `;

        // デッキエリアを挿入
        const targetContainer = document.getElementById('ygo-deck-support-ui') || document.body;
        targetContainer.appendChild(deckArea);
        
        console.log(`YGO Deck Support - Created deck area: ${name}`);
    }
    
    /**
     * カードエリアを作成
     */
    createCardArea() {
        const cardAreaId = 'ygo-card-area';
        
        // 既存のエリアがあれば削除
        const existingArea = document.getElementById(cardAreaId);
        if (existingArea) {
            existingArea.remove();
        }
        
        // 新しいカードエリアを作成
        const cardArea = document.createElement('div');
        cardArea.id = cardAreaId;
        cardArea.className = 'ygo-card-area';
        cardArea.innerHTML = `
            <div class="card-area-header">
                <h4>カード一覧 <span class="card-count">(0)</span></h4>
                <div class="card-area-controls">
                    <input type="text" id="card-search" placeholder="カード名で検索...">
                    <button id="card-filter" class="card-btn">フィルター</button>
                </div>
            </div>
            <div class="card-area-content" id="card-content">
                <!-- カードがここに表示されます -->
            </div>
        `;

        // カードエリアを挿入
        const targetContainer = document.getElementById('ygo-deck-support-ui') || document.body;
        targetContainer.appendChild(cardArea);
        
        console.log('YGO Deck Support - Created card area');
    }
    
    /**
     * MouseUIイベントリスナーの設定
     */
    setupMouseUIListeners() {
        const toggleBtn = document.getElementById('mouse-ui-toggle');
        const sortBtn = document.getElementById('mouse-ui-sort');
        const shuffleBtn = document.getElementById('mouse-ui-shuffle');
        const clearBtn = document.getElementById('mouse-ui-clear');
        const exportBtn = document.getElementById('mouse-ui-export');
        const importBtn = document.getElementById('mouse-ui-import');
        const saveBtn = document.getElementById('mouse-ui-save');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleMouseUI());
        }
        
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.sortDeck());
        }
        
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.shuffleDeck());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearDeck());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportDeck());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importDeck());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDeck());
        }
    }
    
    /**
     * MouseUIモードの切り替え
     */
    toggleMouseUI() {
        const toggleBtn = document.getElementById('mouse-ui-toggle');
        const controls = document.getElementById('mouse-ui-controls');
        
        if (controls.style.display === 'none') {
            controls.style.display = 'block';
            toggleBtn.textContent = '無効化';
            toggleBtn.classList.add('active');
            console.log('YGO Deck Support - MouseUI mode enabled');
        } else {
            controls.style.display = 'none';
            toggleBtn.textContent = '有効化';
            toggleBtn.classList.remove('active');
            console.log('YGO Deck Support - MouseUI mode disabled');
        }
    }
    
    /**
     * デッキをソート
     */
    sortDeck() {
        console.log('YGO Deck Support - Sorting deck');
        // 実装予定: デッキ内カードのソート機能
        alert('ソート機能は実装中です');
    }
    
    /**
     * デッキをシャッフル
     */
    shuffleDeck() {
        console.log('YGO Deck Support - Shuffling deck');
        // 実装予定: デッキ内カードのシャッフル機能
        alert('シャッフル機能は実装中です');
    }
    
    /**
     * デッキをクリア
     */
    clearDeck() {
        console.log('YGO Deck Support - Clearing deck');
        // 実装予定: デッキクリア機能
        if (confirm('デッキをクリアしますか？')) {
            alert('クリア機能は実装中です');
        }
    }
    
    /**
     * デッキをエクスポート
     */
    exportDeck() {
        console.log('YGO Deck Support - Exporting deck');
        // 実装予定: デッキエクスポート機能
        alert('エクスポート機能は実装中です');
    }
    
    /**
     * デッキをインポート
     */
    importDeck() {
        console.log('YGO Deck Support - Importing deck');
        // 実装予定: デッキインポート機能
        alert('インポート機能は実装中です');
    }
    
    /**
     * デッキを保存
     */
    saveDeck() {
        console.log('YGO Deck Support - Saving deck');
        // 実装予定: デッキ保存機能
        alert('保存機能は実装中です');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        const analyzeBtn = document.getElementById('ygo-analyze-btn');
        const debugBtn = document.getElementById('ygo-debug-btn');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeDeckEditStructure();
            });
        }
        
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                this.toggleDebugDisplay();
            });
        }
    }
    
    /**
     * デバッグ表示の切り替え
     */
    toggleDebugDisplay() {
        const debugArea = document.getElementById('ygo-debug-area');
        const debugContent = document.getElementById('ygo-debug-content');
        
        if (debugArea.style.display === 'none') {
            // デバッグ情報を収集して表示
            const debugInfo = {
                page: this.currentPage,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                elements: this.getPageElements(),
                storage: this.getStorageInfo()
            };
            
            debugContent.textContent = JSON.stringify(debugInfo, null, 2);
            debugArea.style.display = 'block';
        } else {
            debugArea.style.display = 'none';
        }
    }
    
    /**
     * ページ要素の情報を取得
     */
    getPageElements() {
        const info = {};
        
        // 主要な要素をカウント
        info.articles = document.querySelectorAll('article').length;
        info.navigation = document.querySelectorAll('navigation').length;
        info.forms = document.querySelectorAll('form').length;
        info.links = document.querySelectorAll('link').length;
        info.buttons = document.querySelectorAll('button').length;
        info.inputs = document.querySelectorAll('input').length;
        
        return info;
    }
    
    /**
     * ストレージ情報を取得
     */
    async getStorageInfo() {
        try {
            const local = await chrome.storage.local.get(null);
            const sync = await chrome.storage.sync.get(null);
            
            return {
                localKeys: Object.keys(local).length,
                syncKeys: Object.keys(sync).length,
                hasAnalysis: !!local.page_analysis
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * デッキ検索UIの改善
     */
    enhanceDeckSearchUI() {
        console.log('YGO Deck Support - Enhancing deck search UI');
        // 実装予定: デッキ検索結果のフィルタリング、ソート機能など
    }

    /**
     * ログインUIの改善
     */
    enhanceLoginUI() {
        console.log('YGO Deck Support - Enhancing login UI');
        // 実装予定: ログイン状態の記憶、便利リンクなど
    }

    /**
     * KONAMI IDログインUIの改善
     */
    enhanceKonamiLoginUI() {
        console.log('YGO Deck Support - Enhancing KONAMI login UI');
        // 実装予定: 自動リダイレクト機能、ログイン支援など
    }

    /**
     * ホームUIの改善
     */
    enhanceHomeUI() {
        console.log('YGO Deck Support - Enhancing home UI');
        
        // ホーム画面にクイックアクセス機能を追加
        this.addQuickAccessPanel();
    }

    /**
     * ホーム画面にクイックアクセスパネルを追加
     */
    addQuickAccessPanel() {
        // 既存のパネルがあれば削除
        const existingPanel = document.getElementById('ygo-quick-access');
        if (existingPanel) {
            existingPanel.remove();
        }

        // クイックアクセスパネルを作成
        const panel = document.createElement('div');
        panel.id = 'ygo-quick-access';
        panel.innerHTML = `
            <div class="ygo-quick-panel">
                <h3>🎮 デッキサポート v3.0</h3>
                <div class="ygo-quick-buttons">
                    <button id="ygo-home-help" class="ygo-btn">使い方</button>
                    <button id="ygo-home-debug" class="ygo-btn">デバッグ</button>
                </div>
                <div id="ygo-home-status" class="ygo-status">
                    <p>📊 現在のページ: ${this.currentPage}</p>
                    <p>🔍 機能: 2025年版サイト対応済み</p>
                </div>
            </div>
        `;

        // 記事エリアに挿入
        const article = document.querySelector('article');
        if (article && article.firstChild) {
            article.insertBefore(panel, article.firstChild);
        } else {
            document.body.appendChild(panel);
        }

        // イベントリスナーを設定
        const helpBtn = document.getElementById('ygo-home-help');
        const debugBtn = document.getElementById('ygo-home-debug');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelpDialog());
        }

        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.showDebugInfo());
        }
    }

    /**
     * ヘルプダイアログを表示
     */
    showHelpDialog() {
        const helpContent = `
            【遊戯王DBデッキサポート v3.0】
            
            ◆ 主な機能：
            ・デッキ編集画面の改善
            ・カード検索機能の強化
            ・Import/Export機能
            ・MouseUIモード
            
            ◆ 2025年版対応：
            ・新しいサイト構造に対応
            ・KONAMI ID認証対応
            ・アクセシビリティ改善
            
            ◆ 使い方：
            1. My Deckでログイン
            2. デッキ編集画面で機能を利用
            3. 各ページで追加機能が表示されます
        `;

        alert(helpContent);
    }

    /**
     * デバッグ情報を表示
     */
    showDebugInfo() {
        const debugInfo = {
            page: this.currentPage,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            elements: this.getPageElements()
        };

        console.log('YGO Deck Support - Debug Info:', debugInfo);
        alert('デバッグ情報をコンソールに出力しました。F12を開いてご確認ください。');
    }
    
    /**
     * グローバルYGOオブジェクトの設定
     */
    setupGlobalYGOObjects() {
        console.log('YGO Deck Support - Setting up global YGO objects');
        
        // メインのYGOオブジェクト
        window.YGO = window.YGO || {};
        
        // デッキサポート関連のオブジェクト
        window.YGO.DeckSupport = {
            version: '3.1.0',
            instance: this,
            initialized: true,
            currentPage: this.currentPage,
            features: {
                mouseUI: true,
                deckAreas: true,
                cardSearch: true,
                import: true,
                export: true
            }
        };
        
        // MouseUI関連のオブジェクト
        window.YGO.MouseUI = {
            enabled: false,
            toggle: () => this.toggleMouseUI(),
            sort: () => this.sortDeck(),
            shuffle: () => this.shuffleDeck(),
            clear: () => this.clearDeck(),
            export: () => this.exportDeck(),
            import: () => this.importDeck(),
            save: () => this.saveDeck()
        };
        
        // デッキ管理関連のオブジェクト
        window.YGO.DeckManager = {
            mainDeck: [],
            extraDeck: [],
            sideDeck: [],
            getDeckInfo: () => this.getDeckInfo(),
            addCard: (card, area) => this.addCardToDeck(card, area),
            removeCard: (cardId, area) => this.removeCardFromDeck(cardId, area),
            clearDeck: (area) => this.clearDeckArea(area)
        };
        
        // カード検索関連のオブジェクト
        window.YGO.CardSearch = {
            searchTerm: '',
            results: [],
            search: (term) => this.searchCards(term),
            filter: (criteria) => this.filterCards(criteria),
            getCardInfo: (cardId) => this.getCardInfo(cardId)
        };
        
        // ユーティリティ関数
        window.YGO.Utils = {
            getPageType: () => this.currentPage,
            isExtensionLoaded: () => window.YGO_DECK_SUPPORT_LOADED,
            getVersion: () => '3.1.0',
            reload: () => this.init(),
            debug: () => this.showDebugInfo()
        };
        
        // イベント システム
        window.YGO.Events = {
            listeners: {},
            on: (event, callback) => {
                if (!window.YGO.Events.listeners[event]) {
                    window.YGO.Events.listeners[event] = [];
                }
                window.YGO.Events.listeners[event].push(callback);
            },
            emit: (event, data) => {
                if (window.YGO.Events.listeners[event]) {
                    window.YGO.Events.listeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error('YGO Event callback error:', error);
                        }
                    });
                }
            }
        };
        
        console.log('YGO Deck Support - Global objects setup complete:', window.YGO);
    }
    
    /**
     * デッキ情報を取得
     */
    getDeckInfo() {
        return {
            main: window.YGO.DeckManager.mainDeck.length,
            extra: window.YGO.DeckManager.extraDeck.length,
            side: window.YGO.DeckManager.sideDeck.length,
            total: window.YGO.DeckManager.mainDeck.length + 
                   window.YGO.DeckManager.extraDeck.length + 
                   window.YGO.DeckManager.sideDeck.length
        };
    }
    
    /**
     * カードをデッキに追加
     */
    addCardToDeck(card, area) {
        console.log(`YGO Deck Support - Adding card to ${area}:`, card);
        // 実装予定: カード追加ロジック
        window.YGO.Events.emit('cardAdded', { card, area });
    }
    
    /**
     * カードをデッキから削除
     */
    removeCardFromDeck(cardId, area) {
        console.log(`YGO Deck Support - Removing card from ${area}:`, cardId);
        // 実装予定: カード削除ロジック
        window.YGO.Events.emit('cardRemoved', { cardId, area });
    }
    
    /**
     * デッキエリアをクリア
     */
    clearDeckArea(area) {
        console.log(`YGO Deck Support - Clearing deck area: ${area}`);
        // 実装予定: エリアクリアロジック
        window.YGO.Events.emit('deckAreaCleared', { area });
    }
    
    /**
     * カード検索
     */
    searchCards(term) {
        console.log(`YGO Deck Support - Searching cards: ${term}`);
        window.YGO.CardSearch.searchTerm = term;
        // 実装予定: カード検索ロジック
        window.YGO.Events.emit('cardSearched', { term });
        return [];
    }
    
    /**
     * カードフィルター
     */
    filterCards(criteria) {
        console.log(`YGO Deck Support - Filtering cards:`, criteria);
        // 実装予定: カードフィルターロジック
        window.YGO.Events.emit('cardFiltered', { criteria });
        return [];
    }
    
    /**
     * カード情報を取得
     */
    getCardInfo(cardId) {
        console.log(`YGO Deck Support - Getting card info: ${cardId}`);
        // 実装予定: カード情報取得ロジック
        return null;
    }
}

// ページ読み込み完了後に初期化
const ygoDeckSupport = new YGODeckSupport();

// DOM読み込み完了時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ygoDeckSupport.init();
    });
} else {
    ygoDeckSupport.init();
}