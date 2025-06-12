/**
 * MouseUI表示システム
 * カード画像でのデッキ編集UI表示を管理
 */

class MouseUIDisplay {
    constructor(deckIntegration) {
        this.deckIntegration = deckIntegration;
        this.isMouseUIMode = false;
        this.originalContent = null;
        this.mouseUIContainer = null;
        this.cardAreas = {
            main: null,
            extra: null,
            side: null,
            temp: null
        };
        
        console.log('MouseUIDisplay - Initialized');
    }

    /**
     * MouseUIモードの切り替え
     */
    async toggleMouseUIMode() {
        if (this.isMouseUIMode) {
            this.hideMouseUI();
        } else {
            await this.showMouseUI();
        }
    }

    /**
     * MouseUIの表示
     */
    async showMouseUI() {
        console.log('MouseUIDisplay - Showing MouseUI...');
        
        try {
            // 既存コンテンツを隠す
            this.hideOriginalContent();
            
            // MouseUIコンテナを作成
            this.createMouseUIContainer();
            
            // デッキエリアを作成
            this.createDeckAreas();
            
            // カードを読み込んで表示
            await this.loadAndDisplayCards();
            
            this.isMouseUIMode = true;
            console.log('MouseUIDisplay - MouseUI mode activated');
            
        } catch (error) {
            console.error('MouseUIDisplay - Error showing MouseUI:', error);
        }
    }

    /**
     * MouseUIの非表示
     */
    hideMouseUI() {
        console.log('MouseUIDisplay - Hiding MouseUI...');
        
        if (this.mouseUIContainer) {
            this.mouseUIContainer.remove();
            this.mouseUIContainer = null;
        }
        
        this.showOriginalContent();
        this.isMouseUIMode = false;
        
        console.log('MouseUIDisplay - MouseUI mode deactivated');
    }

    /**
     * 元のコンテンツを隠す
     */
    hideOriginalContent() {
        const mainContent = document.querySelector('#deck_text, .deck_edit_area, .main-content');
        if (mainContent) {
            this.originalContent = mainContent;
            mainContent.style.display = 'none';
        }
    }

    /**
     * 元のコンテンツを表示
     */
    showOriginalContent() {
        if (this.originalContent) {
            this.originalContent.style.display = '';
        }
    }

    /**
     * MouseUIコンテナの作成
     */
    createMouseUIContainer() {
        this.mouseUIContainer = document.createElement('div');
        this.mouseUIContainer.id = 'ygo-mouseui-container';
        this.mouseUIContainer.innerHTML = `
            <style>
                #ygo-mouseui-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                }
                
                .mouseui-header {
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .mouseui-title {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .mouseui-controls {
                    display: flex;
                    gap: 10px;
                }
                
                .mouseui-btn {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .mouseui-btn:hover {
                    background: #45a049;
                }
                
                .mouseui-btn.secondary {
                    background: #f44336;
                }
                
                .mouseui-btn.secondary:hover {
                    background: #da190b;
                }
                
                .mouseui-content {
                    display: grid;
                    grid-template-columns: 1fr 300px 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 15px;
                    padding: 20px;
                    height: calc(100vh - 60px);
                }
                
                .deck-area {
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .deck-area-header {
                    color: white;
                    font-weight: bold;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .deck-area-count {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                
                .cards-container {
                    flex: 1;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                    gap: 8px;
                    padding: 5px;
                }
                
                .card-image {
                    width: 100%;
                    aspect-ratio: 70 / 102;
                    border-radius: 6px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    object-fit: cover;
                }
                
                .card-image:hover {
                    border-color: #FFD700;
                    transform: scale(1.05);
                    z-index: 100;
                    position: relative;
                }
                
                .card-image.loading {
                    background: #ddd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 10px;
                }
                
                #main-deck-area {
                    grid-column: 1;
                    grid-row: 1 / 3;
                }
                
                #extra-deck-area {
                    grid-column: 3;
                    grid-row: 1;
                }
                
                #side-deck-area {
                    grid-column: 3;
                    grid-row: 2;
                }
                
                #temp-area {
                    grid-column: 2;
                    grid-row: 1 / 3;
                }
                
                .temp-area-special {
                    background: rgba(255, 255, 255, 0.05);
                    border-style: dashed;
                }
            </style>
            
            <div class="mouseui-header">
                <div class="mouseui-title">🃏 Yu-Gi-Oh! MouseUI Deck Editor</div>
                <div class="mouseui-controls">
                    <button class="mouseui-btn" onclick="window.YGO.MouseUIDisplay.toggleDisplayMode()">
                        🔄 Text/Image
                    </button>
                    <button class="mouseui-btn secondary" onclick="window.YGO.MouseUIDisplay.hideMouseUI()">
                        ❌ Close MouseUI
                    </button>
                </div>
            </div>
            
            <div class="mouseui-content">
                <div id="main-deck-area" class="deck-area">
                    <div class="deck-area-header">
                        <span>🏟️ MAIN DECK</span>
                        <span class="deck-area-count" id="main-count">0</span>
                    </div>
                    <div class="cards-container" id="main-cards"></div>
                </div>
                
                <div id="temp-area" class="deck-area temp-area-special">
                    <div class="deck-area-header">
                        <span>📦 TEMP</span>
                        <span class="deck-area-count" id="temp-count">0</span>
                    </div>
                    <div class="cards-container" id="temp-cards"></div>
                </div>
                
                <div id="extra-deck-area" class="deck-area">
                    <div class="deck-area-header">
                        <span>⭐ EXTRA DECK</span>
                        <span class="deck-area-count" id="extra-count">0</span>
                    </div>
                    <div class="cards-container" id="extra-cards"></div>
                </div>
                
                <div id="side-deck-area" class="deck-area">
                    <div class="deck-area-header">
                        <span>🔄 SIDE DECK</span>
                        <span class="deck-area-count" id="side-count">0</span>
                    </div>
                    <div class="cards-container" id="side-cards"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.mouseUIContainer);
        
        // エリア参照を保存
        this.cardAreas = {
            main: document.getElementById('main-cards'),
            extra: document.getElementById('extra-cards'),
            side: document.getElementById('side-cards'),
            temp: document.getElementById('temp-cards')
        };
    }

    /**
     * デッキエリアの作成（初期設定）
     */
    createDeckAreas() {
        // エリアがすでに作成されているのでカウンターの初期化のみ
        this.updateAreaCounts();
    }

    /**
     * カードの読み込みと表示
     */
    async loadAndDisplayCards() {
        console.log('MouseUIDisplay - Loading and displaying cards...');
        
        try {
            // メインデッキのカードを表示
            const mainCards = this.deckIntegration.readMainDeckCards();
            await this.displayCardsInArea('main', mainCards);
            
            // エクストラデッキのカードを表示
            const extraCards = this.deckIntegration.readExtraDeckCards();
            await this.displayCardsInArea('extra', extraCards);
            
            // サイドデッキのカードを表示
            const sideCards = this.deckIntegration.readSideDeckCards();
            await this.displayCardsInArea('side', sideCards);
            
            // カウント更新
            this.updateAreaCounts();
            
            console.log('MouseUIDisplay - All cards loaded and displayed');
            
        } catch (error) {
            console.error('MouseUIDisplay - Error loading cards:', error);
        }
    }

    /**
     * 指定エリアにカードを表示
     */
    async displayCardsInArea(areaType, cards) {
        const container = this.cardAreas[areaType];
        if (!container) return;
        
        container.innerHTML = ''; // エリアをクリア
        
        for (const card of cards) {
            const cardElement = await this.createCardElement(card);
            container.appendChild(cardElement);
        }
    }

    /**
     * カード要素の作成
     */
    async createCardElement(cardData) {
        const cardElement = document.createElement('img');
        cardElement.className = 'card-image loading';
        cardElement.draggable = true;
        cardElement.title = `${cardData.name} (ID: ${cardData.id})`;
        cardElement.dataset.cardId = cardData.id;
        cardElement.dataset.uniqueId = cardData.uniqueId;
        
        // 最初はローディング表示
        cardElement.alt = 'Loading...';
        
        // 画像を非同期で読み込み
        try {
            const imageUrl = cardData.imageUrl;
            const imageExists = await this.deckIntegration.validateCardImage(imageUrl);
            
            if (imageExists) {
                cardElement.src = imageUrl;
                cardElement.className = 'card-image';
            } else {
                // 画像が見つからない場合はデフォルト画像
                cardElement.src = this.deckIntegration.generateCardImageUrl('unknown');
                cardElement.className = 'card-image';
                console.warn(`MouseUIDisplay - Card image not found: ${cardData.name} (${imageUrl})`);
            }
        } catch (error) {
            console.error(`MouseUIDisplay - Error loading card image for ${cardData.name}:`, error);
            cardElement.src = this.deckIntegration.generateCardImageUrl('unknown');
            cardElement.className = 'card-image';
        }
        
        // マウスイベントを追加
        this.addCardEventListeners(cardElement, cardData);
        
        return cardElement;
    }

    /**
     * カード要素にイベントリスナーを追加
     */
    addCardEventListeners(cardElement, cardData) {
        // ドラッグ開始
        cardElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                uniqueId: cardData.uniqueId,
                cardId: cardData.id,
                name: cardData.name,
                type: cardData.type
            }));
        });

        // クリックイベント（詳細表示など）
        cardElement.addEventListener('click', (e) => {
            console.log(`MouseUIDisplay - Card clicked: ${cardData.name}`);
            // 将来的にカード詳細表示機能を追加
        });

        // 右クリック（コンテキストメニュー）
        cardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log(`MouseUIDisplay - Card right-clicked: ${cardData.name}`);
            // 将来的にカード操作メニューを追加
        });
    }

    /**
     * エリアカウントの更新
     */
    updateAreaCounts() {
        Object.keys(this.cardAreas).forEach(areaType => {
            const container = this.cardAreas[areaType];
            const countElement = document.getElementById(`${areaType}-count`);
            
            if (container && countElement) {
                const cardCount = container.children.length;
                countElement.textContent = cardCount;
            }
        });
    }

    /**
     * 表示モードの切り替え（将来の機能）
     */
    toggleDisplayMode() {
        console.log('MouseUIDisplay - Toggle display mode (feature coming soon)');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MouseUIDisplay;
}

// Register as global for Chrome extension usage
if (typeof window !== 'undefined') {
    window.MouseUIDisplay = MouseUIDisplay;
}

console.log('MouseUIDisplay - Module loaded');