/**
 * MouseUI Core System
 * 実際のマウス操作によるカード移動機能の実装
 */

class MouseUICore {
    constructor() {
        this.isEnabled = false;
        this.areas = {
            main: { element: null, cards: [] },
            extra: { element: null, cards: [] },
            side: { element: null, cards: [] },
            temp: { element: null, cards: [] },
            search: { element: null, cards: [] },
            info: { element: null, cards: [] }
        };
        this.operationHistory = [];
        this.draggedCard = null;
        console.log('MouseUICore - Initialized');
    }

    /**
     * MouseUIシステムの初期化
     */
    async initialize() {
        try {
            console.log('MouseUICore - Starting initialization...');
            
            // エリアの検出と初期化
            await this.detectAreas();
            
            // マウス操作マトリックスの設定
            this.setupMouseOperations();
            
            // カード要素の初期化
            this.initializeCards();
            
            console.log('MouseUICore - Initialization complete');
            return true;
            
        } catch (error) {
            console.error('MouseUICore - Initialization error:', error);
            return false;
        }
    }

    /**
     * デッキエリアの検出
     */
    async detectAreas() {
        console.log('MouseUICore - Detecting deck areas...');

        // メインデッキエリア検出
        this.areas.main.element = this.findAreaElement([
            '.deck_set:nth-of-type(1)',
            '[class*="main"][class*="deck"]',
            '#main_deck',
            '.main-deck'
        ], 'main deck');

        // エクストラデッキエリア検出  
        this.areas.extra.element = this.findAreaElement([
            '.deck_set:nth-of-type(2)', 
            '[class*="extra"][class*="deck"]',
            '#extra_deck',
            '.extra-deck'
        ], 'extra deck');

        // サイドデッキエリア検出
        this.areas.side.element = this.findAreaElement([
            '.deck_set:nth-of-type(3)',
            '[class*="side"][class*="deck"]', 
            '#side_deck',
            '.side-deck'
        ], 'side deck');

        // テンポラリエリア（作成）
        this.createTempArea();

        // 検索エリア検出
        this.areas.search.element = this.findAreaElement([
            '#search',
            '.search_area',
            '[class*="search"]',
            '.card-search-area'
        ], 'search area');

        console.log('MouseUICore - Area detection complete');
    }

    /**
     * エリア要素を検索
     */
    findAreaElement(selectors, areaName) {
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`MouseUICore - Found ${areaName}: ${selector}`);
                    return element;
                }
            } catch (error) {
                console.warn(`MouseUICore - Invalid selector for ${areaName}: ${selector}`);
            }
        }
        
        console.warn(`MouseUICore - ${areaName} not found`);
        return null;
    }

    /**
     * テンポラリエリアの作成
     */
    createTempArea() {
        const tempArea = document.createElement('div');
        tempArea.id = 'mouseui-temp-area';
        tempArea.className = 'mouseui-temp-area';
        tempArea.innerHTML = `
            <div class="temp-area-header">
                <h4>⏳ Temp Area</h4>
                <span class="card-count">(0)</span>
            </div>
            <div class="temp-area-content" id="temp-area-content">
                <!-- Temporary cards here -->
            </div>
        `;

        // スタイル適用
        tempArea.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            min-height: 100px;
            background: #f8f9fa;
            border: 2px solid #6c757d;
            border-radius: 8px;
            padding: 10px;
            z-index: 9999;
            display: none;
        `;

        document.body.appendChild(tempArea);
        this.areas.temp.element = tempArea;
        console.log('MouseUICore - Temp area created');
    }

    /**
     * マウス操作マトリックスの設定
     */
    setupMouseOperations() {
        console.log('MouseUICore - Setting up mouse operations...');

        // 全てのカード要素にマウスイベントを設定
        const cardSelectors = [
            'img[src*="card"]',
            '[onclick*="card"]', 
            '.card-image',
            '[class*="card"]'
        ];

        cardSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    this.attachMouseEvents(element);
                });
            } catch (error) {
                console.warn(`MouseUICore - Error with selector ${selector}:`, error);
            }
        });

        console.log('MouseUICore - Mouse operations setup complete');
    }

    /**
     * カード要素にマウスイベントを設定
     */
    attachMouseEvents(cardElement) {
        // 元のイベントを保存
        const originalOnclick = cardElement.onclick;
        
        // 左クリック処理
        cardElement.addEventListener('click', (event) => {
            if (!this.isEnabled) {
                // MouseUI無効時は元の動作
                if (originalOnclick) originalOnclick.call(cardElement, event);
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            
            this.handleLeftClick(cardElement, event);
        });

        // 右クリック処理
        cardElement.addEventListener('contextmenu', (event) => {
            if (!this.isEnabled) return;
            
            event.preventDefault();
            event.stopPropagation();
            
            if (event.ctrlKey) {
                this.handleCtrlRightClick(cardElement, event);
            } else {
                this.handleRightClick(cardElement, event);
            }
        });

        // ホイールクリック処理
        cardElement.addEventListener('wheel', (event) => {
            if (!this.isEnabled) return;
            
            if (event.ctrlKey) {
                event.preventDefault();
                this.handleCtrlWheelClick(cardElement, event);
            } else {
                event.preventDefault();
                this.handleWheelClick(cardElement, event);
            }
        });

        // ダブルクリック処理
        cardElement.addEventListener('dblclick', (event) => {
            if (!this.isEnabled) return;
            
            event.preventDefault();
            this.handleDoubleClick(cardElement, event);
        });

        // Ctrl+左クリック処理
        cardElement.addEventListener('mousedown', (event) => {
            if (!this.isEnabled) return;
            
            if (event.ctrlKey && event.button === 0) {
                event.preventDefault();
                this.handleCtrlLeftClick(cardElement, event);
            }
        });

        // マウスオーバー効果
        cardElement.addEventListener('mouseenter', () => {
            if (!this.isEnabled) return;
            cardElement.style.transform = 'scale(1.05)';
            cardElement.style.transition = 'transform 0.2s ease';
            cardElement.style.zIndex = '1000';
        });

        cardElement.addEventListener('mouseleave', () => {
            if (!this.isEnabled) return;
            cardElement.style.transform = 'scale(1)';
            cardElement.style.zIndex = 'auto';
        });
    }

    /**
     * 左クリック処理 - エリア間移動
     */
    handleLeftClick(cardElement, event) {
        const sourceArea = this.getCardArea(cardElement);
        const cardData = this.extractCardData(cardElement);
        
        console.log(`MouseUICore - Left click: ${cardData.name} from ${sourceArea}`);

        switch (sourceArea) {
            case 'main':
            case 'extra':
                this.moveCardToArea(cardElement, 'side', 'Left click: Main/Extra → Side');
                break;
            case 'side':
                this.moveCardToArea(cardElement, 'main', 'Left click: Side → Main');
                break;
            case 'temp':
                this.moveCardToArea(cardElement, 'main', 'Left click: Temp → Main');
                break;
            case 'search':
            case 'info':
                this.addCardToArea(cardData, 'main', 'Left click: Search/Info → Main');
                break;
        }
    }

    /**
     * ホイールクリック処理 - カード追加/新タブ
     */
    handleWheelClick(cardElement, event) {
        const sourceArea = this.getCardArea(cardElement);
        const cardData = this.extractCardData(cardElement);
        
        console.log(`MouseUICore - Wheel click: ${cardData.name} from ${sourceArea}`);

        switch (sourceArea) {
            case 'main':
            case 'extra':
                this.duplicateCard(cardElement, sourceArea, 'Wheel click: Add copy');
                break;
            case 'side':
                this.duplicateCard(cardElement, 'side', 'Wheel click: Add copy to side');
                break;
            case 'temp':
                this.addCardToArea(cardData, 'main', 'Wheel click: Temp → Main (add)');
                break;
            case 'search':
            case 'info':
                this.openCardInNewTab(cardData);
                break;
        }
    }

    /**
     * 右クリック処理 - 削除/移動
     */
    handleRightClick(cardElement, event) {
        const sourceArea = this.getCardArea(cardElement);
        const cardData = this.extractCardData(cardElement);
        
        console.log(`MouseUICore - Right click: ${cardData.name} from ${sourceArea}`);

        switch (sourceArea) {
            case 'main':
            case 'extra':
                this.moveCardToArea(cardElement, 'temp', 'Right click: Main/Extra → Temp (delete)');
                break;
            case 'side':
                this.moveCardToArea(cardElement, 'temp', 'Right click: Side → Temp (delete)');
                break;
            case 'temp':
                this.moveCardToArea(cardElement, 'side', 'Right click: Temp → Side');
                break;
            case 'search':
            case 'info':
                this.addCardToArea(cardData, 'side', 'Right click: Search/Info → Side');
                break;
        }
    }

    /**
     * Ctrl+ホイール/右クリック処理 - 新タブでカードページ
     */
    handleCtrlWheelClick(cardElement, event) {
        const cardData = this.extractCardData(cardElement);
        this.openCardInNewTab(cardData);
    }

    handleCtrlRightClick(cardElement, event) {
        const cardData = this.extractCardData(cardElement);
        this.openCardInNewTab(cardData);
    }

    /**
     * ダブルクリック処理 - Info Area表示
     */
    handleDoubleClick(cardElement, event) {
        const cardData = this.extractCardData(cardElement);
        this.showCardInInfoArea(cardData);
    }

    /**
     * Ctrl+左クリック処理 - Info Area表示
     */
    handleCtrlLeftClick(cardElement, event) {
        const cardData = this.extractCardData(cardElement);
        this.showCardInInfoArea(cardData);
    }

    /**
     * カードの所属エリアを判定
     */
    getCardArea(cardElement) {
        for (const [areaName, area] of Object.entries(this.areas)) {
            if (area.element && area.element.contains(cardElement)) {
                return areaName;
            }
        }
        
        // 親要素から推測
        let parent = cardElement.parentElement;
        while (parent) {
            const className = parent.className.toLowerCase();
            const id = parent.id.toLowerCase();
            
            if (className.includes('main') || id.includes('main')) return 'main';
            if (className.includes('extra') || id.includes('extra')) return 'extra';
            if (className.includes('side') || id.includes('side')) return 'side';
            if (className.includes('search') || id.includes('search')) return 'search';
            if (className.includes('temp') || id.includes('temp')) return 'temp';
            
            parent = parent.parentElement;
        }
        
        return 'unknown';
    }

    /**
     * カードデータの抽出
     */
    extractCardData(cardElement) {
        return {
            id: cardElement.dataset.cardId || this.extractCardId(cardElement),
            name: cardElement.alt || cardElement.title || this.extractCardName(cardElement),
            image: cardElement.src || this.extractCardImage(cardElement),
            element: cardElement,
            timestamp: Date.now()
        };
    }

    /**
     * カードIDの抽出
     */
    extractCardId(element) {
        // onclick属性からIDを抽出
        if (element.onclick) {
            const match = element.onclick.toString().match(/(\d{8,})/);
            if (match) return match[1];
        }
        
        // href属性からIDを抽出
        if (element.href) {
            const match = element.href.match(/cid=(\d+)/);
            if (match) return match[1];
        }
        
        return 'unknown';
    }

    /**
     * カード名の抽出
     */
    extractCardName(element) {
        // img要素のalt属性
        if (element.alt) return element.alt;
        
        // title属性
        if (element.title) return element.title;
        
        // 近くのテキスト要素から抽出
        const parent = element.parentElement;
        if (parent) {
            const textContent = parent.textContent.trim();
            if (textContent && textContent.length < 50) {
                return textContent;
            }
        }
        
        return 'Unknown Card';
    }

    /**
     * カード画像URLの抽出
     */
    extractCardImage(element) {
        if (element.src) return element.src;
        
        // 背景画像から抽出
        const style = window.getComputedStyle(element);
        if (style.backgroundImage && style.backgroundImage !== 'none') {
            const match = style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
            if (match) return match[1];
        }
        
        return null;
    }

    /**
     * カードを指定エリアに移動
     */
    moveCardToArea(cardElement, targetAreaName, operation) {
        const sourceArea = this.getCardArea(cardElement);
        const cardData = this.extractCardData(cardElement);
        const targetArea = this.areas[targetAreaName];
        
        if (!targetArea.element) {
            console.warn(`MouseUICore - Target area ${targetAreaName} not found`);
            return false;
        }

        // 移動処理
        try {
            // 元の位置から削除
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.opacity = '0.5';
            
            setTimeout(() => {
                // ターゲットエリアに追加
                this.addCardToAreaElement(cardData, targetArea.element);
                
                // 元要素を削除または非表示
                if (sourceArea !== 'search' && sourceArea !== 'info') {
                    cardElement.remove();
                }
                
                // 履歴に記録
                this.recordOperation({
                    type: 'move',
                    operation: operation,
                    card: cardData,
                    from: sourceArea,
                    to: targetAreaName,
                    timestamp: Date.now()
                });
                
                this.showOperationNotification(`${operation}: ${cardData.name}`);
                
            }, 150);
            
            return true;
            
        } catch (error) {
            console.error('MouseUICore - Move error:', error);
            return false;
        }
    }

    /**
     * カードをエリアに追加
     */
    addCardToArea(cardData, targetAreaName, operation) {
        const targetArea = this.areas[targetAreaName];
        
        if (!targetArea.element) {
            console.warn(`MouseUICore - Target area ${targetAreaName} not found`);
            return false;
        }

        try {
            this.addCardToAreaElement(cardData, targetArea.element);
            
            // 履歴に記録
            this.recordOperation({
                type: 'add',
                operation: operation,
                card: cardData,
                to: targetAreaName,
                timestamp: Date.now()
            });
            
            this.showOperationNotification(`${operation}: ${cardData.name}`);
            return true;
            
        } catch (error) {
            console.error('MouseUICore - Add error:', error);
            return false;
        }
    }

    /**
     * カード要素をエリアに追加
     */
    addCardToAreaElement(cardData, areaElement) {
        const cardElement = document.createElement('div');
        cardElement.className = 'mouseui-card';
        cardElement.dataset.cardId = cardData.id;
        cardElement.innerHTML = `
            <img src="${cardData.image || ''}" alt="${cardData.name}" class="card-image">
            <div class="card-name">${cardData.name}</div>
        `;
        
        // スタイル適用
        cardElement.style.cssText = `
            display: inline-block;
            margin: 2px;
            padding: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        // 新しいカードにもマウスイベントを設定
        this.attachMouseEvents(cardElement);
        
        // エリアに追加
        const contentArea = areaElement.querySelector('.content, .deck-content, [class*="content"]') || areaElement;
        contentArea.appendChild(cardElement);
        
        // アニメーション効果
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1)';
        }, 50);
    }

    /**
     * カードを複製
     */
    duplicateCard(cardElement, areaName, operation) {
        const cardData = this.extractCardData(cardElement);
        this.addCardToArea(cardData, areaName, operation);
    }

    /**
     * 新タブでカードページを開く
     */
    openCardInNewTab(cardData) {
        if (cardData.id && cardData.id !== 'unknown') {
            const url = `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${cardData.id}`;
            window.open(url, '_blank');
            console.log(`MouseUICore - Opened card in new tab: ${cardData.name}`);
        }
    }

    /**
     * Info Areaでカード表示
     */
    showCardInInfoArea(cardData) {
        // Info Area実装は Phase 4 で対応
        console.log(`MouseUICore - Show in Info Area: ${cardData.name} (Phase 4で実装)`);
        this.showOperationNotification(`Info Area: ${cardData.name} (Phase 4で実装)`);
    }

    /**
     * 操作履歴の記録
     */
    recordOperation(operation) {
        this.operationHistory.push(operation);
        console.log('MouseUICore - Operation recorded:', operation);
    }

    /**
     * 操作通知の表示
     */
    showOperationNotification(message) {
        // 既存の通知を削除
        const existing = document.getElementById('mouseui-notification');
        if (existing) existing.remove();

        // 通知要素を作成
        const notification = document.createElement('div');
        notification.id = 'mouseui-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.opacity = '1', 50);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * MouseUIの有効/無効切り替え
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.enable();
        } else {
            this.disable();
        }
        
        return this.isEnabled;
    }

    /**
     * MouseUIを有効化
     */
    enable() {
        this.isEnabled = true;
        
        // Tempエリアを表示
        if (this.areas.temp.element) {
            this.areas.temp.element.style.display = 'block';
        }
        
        console.log('MouseUICore - Enabled');
        this.showOperationNotification('MouseUI モード有効');
    }

    /**
     * MouseUIを無効化  
     */
    disable() {
        this.isEnabled = false;
        
        // Tempエリアを非表示
        if (this.areas.temp.element) {
            this.areas.temp.element.style.display = 'none';
        }
        
        console.log('MouseUICore - Disabled');
        this.showOperationNotification('MouseUI モード無効');
    }

    /**
     * カード要素の初期化
     */
    initializeCards() {
        console.log('MouseUICore - Initializing existing cards...');
        
        // 既存のカード要素にマウスイベントを設定
        const existingCards = document.querySelectorAll('img[src*="card"], [onclick*="card"]');
        existingCards.forEach(card => {
            this.attachMouseEvents(card);
        });
        
        console.log(`MouseUICore - Initialized ${existingCards.length} existing cards`);
    }

    /**
     * 状態をストレージに保存
     */
    async saveState() {
        try {
            const state = {
                isEnabled: this.isEnabled,
                operationHistory: this.operationHistory.slice(-100), // 最新100件のみ
                timestamp: Date.now()
            };
            
            await chrome.storage.local.set({ 'mouseui_state': state });
            console.log('MouseUICore - State saved');
            
        } catch (error) {
            console.error('MouseUICore - Save state error:', error);
        }
    }

    /**
     * 状態をストレージから読み込み
     */
    async loadState() {
        try {
            const result = await chrome.storage.local.get('mouseui_state');
            const state = result.mouseui_state;
            
            if (state) {
                this.isEnabled = state.isEnabled || false;
                this.operationHistory = state.operationHistory || [];
                console.log('MouseUICore - State loaded');
            }
            
        } catch (error) {
            console.error('MouseUICore - Load state error:', error);
        }
    }
}

// グローバルに公開
window.MouseUICore = MouseUICore;