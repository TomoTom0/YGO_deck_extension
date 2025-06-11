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
     * 現在のページタイプを検出
     */
    detectCurrentPage() {
        const url = window.location.href;
        
        if (url.includes('/deck_edit')) {
            return 'deck_edit';
        } else if (url.includes('/deck_view')) {
            return 'deck_view';
        } else if (url.includes('/card_search')) {
            return 'card_search';
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
                    this.initDeckEditPage();
                    break;
                case 'deck_view':
                    this.initDeckViewPage();
                    break;
                default:
                    console.log('YGO Deck Support - No specific features for this page');
            }
            
            this.isInitialized = true;
            console.log('YGO Deck Support - Initialization complete');
            
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
        
        // 現在のページ構造を調査
        this.analyzeDeckEditStructure();
        
        // UIの改善を適用
        this.enhanceDeckEditUI();
    }

    /**
     * デッキ閲覧ページの機能初期化
     */
    initDeckViewPage() {
        console.log('YGO Deck Support - Initializing deck view features');
        
        // 現在のページ構造を調査
        this.analyzeDeckViewStructure();
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

        // 主要な要素を検索
        const selectors = [
            'form[name="form1"]',
            'table',
            'input[type="submit"]',
            'select',
            'textarea',
            '.deck',
            '.card',
            '#main',
            '#extra',
            '#side'
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
     * デッキ閲覧ページの構造を分析
     */
    analyzeDeckViewStructure() {
        console.log('YGO Deck Support - Analyzing deck view structure');
        // 実装予定
    }

    /**
     * デッキ編集UIの改善
     */
    enhanceDeckEditUI() {
        // 改善UI用のコンテナを作成
        const container = document.createElement('div');
        container.id = 'ygo-deck-support-ui';
        container.innerHTML = `
            <div class="ygo-support-panel">
                <h3>デッキサポート機能</h3>
                <div class="ygo-support-status">
                    <p>ページ構造を分析中...</p>
                    <button id="ygo-analyze-btn">再分析</button>
                </div>
            </div>
        `;

        // ページに挿入
        document.body.appendChild(container);

        // イベントリスナーを設定
        document.getElementById('ygo-analyze-btn').addEventListener('click', () => {
            this.analyzeDeckEditStructure();
        });
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