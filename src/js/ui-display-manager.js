/**
 * UI Display Manager
 * デッキ表示の切り替え機能（画像⟷テキスト⟷コンパクト）
 */

class UIDisplayManager {
    constructor() {
        this.displayMode = 'image'; // 'image' | 'text' | 'compact'
        this.preferences = {
            cardSize: 'medium',
            showCount: true,
            animateTransitions: true,
            autoCompactThreshold: 50 // カード数がこれを超えたら自動コンパクト
        };
        this.eventListeners = {};
        console.log('UIDisplayManager - Initialized');
    }

    /**
     * 初期化処理
     */
    async initialize() {
        try {
            console.log('UIDisplayManager - Starting initialization...');
            
            // 設定を読み込み
            await this.loadPreferences();
            
            // UI要素を作成
            this.createDisplayControls();
            
            // イベントリスナーを設定
            this.setupEventListeners();
            
            // 初期表示モードを適用
            this.applyDisplayMode();
            
            console.log('UIDisplayManager - Initialization complete');
            return true;
            
        } catch (error) {
            console.error('UIDisplayManager - Initialization error:', error);
            return false;
        }
    }

    /**
     * 表示コントロールの作成
     */
    createDisplayControls() {
        // 既存のコントロールを削除
        const existingControls = document.getElementById('display-mode-controls');
        if (existingControls) {
            existingControls.remove();
        }

        // 表示モードコントロールを作成
        const controlsHTML = `
            <div id="display-mode-controls" class="display-mode-controls">
                <div class="control-header">
                    <h4>🎨 表示モード</h4>
                </div>
                <div class="mode-buttons">
                    <button id="mode-image" class="mode-btn active" data-mode="image" title="画像表示">
                        <span class="mode-icon">🖼️</span>
                        <span class="mode-text">画像</span>
                    </button>
                    <button id="mode-text" class="mode-btn" data-mode="text" title="テキスト表示">
                        <span class="mode-icon">📝</span>
                        <span class="mode-text">テキスト</span>
                    </button>
                    <button id="mode-compact" class="mode-btn" data-mode="compact" title="コンパクト表示">
                        <span class="mode-icon">📋</span>
                        <span class="mode-text">コンパクト</span>
                    </button>
                </div>
                <div class="mode-info">
                    <span id="mode-description">画像でカードを表示</span>
                </div>
                <div class="mode-options" style="display: none;">
                    <label>
                        <input type="checkbox" id="show-count" checked>
                        枚数表示
                    </label>
                    <label>
                        <input type="checkbox" id="animate-transitions" checked>
                        アニメーション
                    </label>
                    <label>
                        カードサイズ:
                        <select id="card-size">
                            <option value="small">小</option>
                            <option value="medium" selected>中</option>
                            <option value="large">大</option>
                        </select>
                    </label>
                </div>
                <button id="toggle-options" class="options-toggle">詳細設定</button>
            </div>
        `;

        // MouseUIパネルに追加
        const mouseUIPanel = document.getElementById('ygo-mouse-ui');
        if (mouseUIPanel) {
            mouseUIPanel.insertAdjacentHTML('beforeend', controlsHTML);
        } else {
            // フォールバック: body に直接追加
            const controlsElement = document.createElement('div');
            controlsElement.innerHTML = controlsHTML;
            document.body.appendChild(controlsElement);
        }

        // CSS スタイルを追加
        this.addDisplayModeStyles();
        
        console.log('UIDisplayManager - Display controls created');
    }

    /**
     * 表示モード用CSSを追加
     */
    addDisplayModeStyles() {
        const styleId = 'ui-display-manager-styles';
        
        // 既存のスタイルを削除
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const styles = `
            <style id="${styleId}">
                .display-mode-controls {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 12px;
                    margin: 8px 0;
                }

                .display-mode-controls .control-header h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    color: #495057;
                }

                .mode-buttons {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 8px;
                }

                .mode-btn {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 8px 6px;
                    border: 2px solid #dee2e6;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 11px;
                }

                .mode-btn:hover {
                    border-color: #6c757d;
                    background: #f8f9fa;
                }

                .mode-btn.active {
                    border-color: #007bff;
                    background: #e7f3ff;
                    color: #0056b3;
                }

                .mode-btn .mode-icon {
                    font-size: 16px;
                    margin-bottom: 2px;
                }

                .mode-btn .mode-text {
                    font-size: 10px;
                    font-weight: 500;
                }

                .mode-info {
                    font-size: 11px;
                    color: #6c757d;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .mode-options {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 8px;
                    margin: 8px 0;
                    font-size: 11px;
                }

                .mode-options label {
                    display: block;
                    margin: 4px 0;
                    cursor: pointer;
                }

                .mode-options input[type="checkbox"] {
                    margin-right: 6px;
                }

                .mode-options select {
                    margin-left: 6px;
                    font-size: 11px;
                }

                .options-toggle {
                    width: 100%;
                    padding: 4px 8px;
                    border: 1px solid #dee2e6;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background 0.2s ease;
                }

                .options-toggle:hover {
                    background: #f8f9fa;
                }

                /* カード表示モード */
                .card-display {
                    transition: all 0.3s ease;
                    margin: 2px;
                }

                .card-display.mode-transition {
                    opacity: 0;
                    transform: scale(0.9);
                }

                /* 画像モード */
                .card-display.image-mode {
                    display: inline-block;
                    position: relative;
                    width: 60px;
                    height: 88px;
                    margin: 3px;
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .card-display.image-mode.size-small {
                    width: 45px;
                    height: 66px;
                }

                .card-display.image-mode.size-medium {
                    width: 60px;
                    height: 88px;
                }

                .card-display.image-mode.size-large {
                    width: 75px;
                    height: 110px;
                }

                .card-display.image-mode img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .card-display.image-mode .card-overlay {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 2px 4px;
                    font-size: 10px;
                    border-radius: 2px 0 0 0;
                }

                /* テキストモード */
                .card-display.text-mode {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 6px 8px;
                    margin: 1px 0;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .card-display.text-mode .card-name {
                    flex: 1;
                    font-weight: 500;
                    color: #212529;
                }

                .card-display.text-mode .card-count {
                    margin-left: 8px;
                    color: #6c757d;
                    font-size: 11px;
                }

                .card-display.text-mode .card-type {
                    margin-left: 4px;
                    color: #6c757d;
                    font-size: 10px;
                }

                /* コンパクトモード */
                .card-display.compact-mode {
                    display: inline-block;
                    padding: 2px 6px;
                    margin: 1px;
                    background: #e9ecef;
                    border: 1px solid #ced4da;
                    border-radius: 12px;
                    font-size: 10px;
                    color: #495057;
                    cursor: pointer;
                }

                .card-display.compact-mode:hover {
                    background: #dee2e6;
                }

                .card-display.compact-mode .card-short {
                    font-weight: 500;
                }

                .card-display.compact-mode .count {
                    margin-left: 3px;
                    color: #6c757d;
                }

                /* アニメーション効果 */
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .card-display.animate-in {
                    animation: fadeInScale 0.3s ease;
                }

                /* レスポンシブ対応 */
                @media (max-width: 768px) {
                    .mode-buttons {
                        flex-direction: column;
                    }
                    
                    .card-display.image-mode {
                        width: 50px;
                        height: 73px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // モードボタンのクリック
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.setDisplayMode(mode);
            });
        });

        // 詳細設定の切り替え
        const optionsToggle = document.getElementById('toggle-options');
        if (optionsToggle) {
            optionsToggle.addEventListener('click', () => {
                this.toggleOptions();
            });
        }

        // 設定変更の監視
        const showCountCheckbox = document.getElementById('show-count');
        if (showCountCheckbox) {
            showCountCheckbox.addEventListener('change', (e) => {
                this.preferences.showCount = e.target.checked;
                this.savePreferences();
                this.refreshDisplay();
            });
        }

        const animateCheckbox = document.getElementById('animate-transitions');
        if (animateCheckbox) {
            animateCheckbox.addEventListener('change', (e) => {
                this.preferences.animateTransitions = e.target.checked;
                this.savePreferences();
            });
        }

        const cardSizeSelect = document.getElementById('card-size');
        if (cardSizeSelect) {
            cardSizeSelect.addEventListener('change', (e) => {
                this.preferences.cardSize = e.target.value;
                this.savePreferences();
                this.refreshDisplay();
            });
        }

        console.log('UIDisplayManager - Event listeners setup complete');
    }

    /**
     * 表示モードの設定
     */
    setDisplayMode(mode) {
        if (!['image', 'text', 'compact'].includes(mode)) {
            console.warn(`UIDisplayManager - Invalid display mode: ${mode}`);
            return;
        }

        console.log(`UIDisplayManager - Setting display mode to: ${mode}`);
        
        const oldMode = this.displayMode;
        this.displayMode = mode;

        // UIの更新
        this.updateModeButtons();
        this.updateModeDescription();
        
        // 表示モードの適用
        this.applyDisplayMode();
        
        // 設定の保存
        this.savePreferences();

        // イベントの発火
        this.emit('displayModeChanged', { oldMode, newMode: mode });
    }

    /**
     * モードボタンの更新
     */
    updateModeButtons() {
        const buttons = document.querySelectorAll('.mode-btn');
        buttons.forEach(button => {
            if (button.dataset.mode === this.displayMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * モード説明の更新
     */
    updateModeDescription() {
        const descriptions = {
            image: '画像でカードを表示',
            text: 'カード名をテキストで表示',
            compact: 'コンパクトにカード名を表示'
        };

        const descElement = document.getElementById('mode-description');
        if (descElement) {
            descElement.textContent = descriptions[this.displayMode];
        }
    }

    /**
     * 表示モードの適用
     */
    applyDisplayMode() {
        console.log(`UIDisplayManager - Applying display mode: ${this.displayMode}`);
        
        // 全てのカード要素を更新
        const allCardElements = document.querySelectorAll('.card-display, .mouseui-card');
        
        if (this.preferences.animateTransitions) {
            // アニメーション付きで更新
            this.applyModeWithAnimation(allCardElements);
        } else {
            // 即座に更新
            this.applyModeInstantly(allCardElements);
        }

        // デッキエリアのレイアウト調整
        this.adjustDeckAreaLayouts();
    }

    /**
     * アニメーション付きモード適用
     */
    applyModeWithAnimation(elements) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('mode-transition');
                
                setTimeout(() => {
                    this.updateCardElementDisplay(element);
                    element.classList.remove('mode-transition');
                    element.classList.add('animate-in');
                    
                    setTimeout(() => {
                        element.classList.remove('animate-in');
                    }, 300);
                }, 150);
            }, index * 10);
        });
    }

    /**
     * 即座のモード適用
     */
    applyModeInstantly(elements) {
        elements.forEach(element => {
            this.updateCardElementDisplay(element);
        });
    }

    /**
     * カード要素の表示更新
     */
    updateCardElementDisplay(element) {
        // 既存のモードクラスを削除
        element.classList.remove('image-mode', 'text-mode', 'compact-mode');
        element.classList.remove('size-small', 'size-medium', 'size-large');
        
        // 新しいモードクラスを追加
        element.classList.add(`${this.displayMode}-mode`);
        
        if (this.displayMode === 'image') {
            element.classList.add(`size-${this.preferences.cardSize}`);
        }

        // カードデータを取得
        const cardData = this.extractCardDataFromElement(element);
        
        // 表示内容を更新
        this.updateCardElementContent(element, cardData);
    }

    /**
     * 要素からカードデータを抽出
     */
    extractCardDataFromElement(element) {
        return {
            id: element.dataset.cardId || 'unknown',
            name: element.getAttribute('alt') || element.querySelector('.card-name')?.textContent || 'Unknown Card',
            image: element.querySelector('img')?.src || element.dataset.cardImage || '',
            type: element.dataset.cardType || 'unknown',
            count: parseInt(element.dataset.cardCount || '1'),
            element: element
        };
    }

    /**
     * カード要素の内容更新
     */
    updateCardElementContent(element, cardData) {
        switch (this.displayMode) {
            case 'image':
                element.innerHTML = this.renderImageMode(cardData);
                break;
            case 'text':
                element.innerHTML = this.renderTextMode(cardData);
                break;
            case 'compact':
                element.innerHTML = this.renderCompactMode(cardData);
                break;
        }
    }

    /**
     * 画像モードのレンダリング
     */
    renderImageMode(cardData) {
        const countDisplay = this.preferences.showCount && cardData.count > 1 
            ? `<div class="card-overlay"><span class="card-count">×${cardData.count}</span></div>` 
            : '';

        return `
            <img src="${cardData.image || '/placeholder-card.png'}" 
                 alt="${cardData.name}" 
                 onerror="this.src='/placeholder-card.png'" />
            ${countDisplay}
        `;
    }

    /**
     * テキストモードのレンダリング
     */
    renderTextMode(cardData) {
        const countDisplay = this.preferences.showCount 
            ? `<span class="card-count">×${cardData.count}</span>` 
            : '';
        
        const typeDisplay = cardData.type !== 'unknown' 
            ? `<span class="card-type">[${cardData.type}]</span>` 
            : '';

        return `
            <span class="card-name">${cardData.name}</span>
            ${typeDisplay}
            ${countDisplay}
        `;
    }

    /**
     * コンパクトモードのレンダリング
     */
    renderCompactMode(cardData) {
        const shortName = this.getShortName(cardData.name);
        const countDisplay = this.preferences.showCount && cardData.count > 1 
            ? `<span class="count">×${cardData.count}</span>` 
            : '';

        return `
            <span class="card-short" title="${cardData.name}">${shortName}</span>
            ${countDisplay}
        `;
    }

    /**
     * カード名の短縮
     */
    getShortName(fullName) {
        if (fullName.length <= 8) return fullName;
        
        // 日本語の場合は最初の6文字
        if (/[ひらがなカタカナ漢字]/.test(fullName)) {
            return fullName.substring(0, 6) + '...';
        }
        
        // 英語の場合は単語境界を考慮
        const words = fullName.split(' ');
        if (words.length > 1 && words[0].length <= 6) {
            return words[0] + '...';
        }
        
        return fullName.substring(0, 8) + '...';
    }

    /**
     * カード要素の作成（外部から使用）
     */
    createCardElement(cardData) {
        const element = document.createElement('div');
        element.className = 'card-display';
        element.dataset.cardId = cardData.id;
        element.dataset.cardCount = cardData.count || 1;
        element.dataset.cardType = cardData.type || 'unknown';
        element.dataset.cardImage = cardData.image || '';
        element.setAttribute('alt', cardData.name);

        this.updateCardElementDisplay(element);
        
        return element;
    }

    /**
     * デッキエリアのレイアウト調整
     */
    adjustDeckAreaLayouts() {
        const deckAreas = document.querySelectorAll('.ygo-deck-area .deck-area-content, #deck-content-main, #deck-content-extra, #deck-content-side');
        
        deckAreas.forEach(area => {
            // モードに応じたレイアウトクラスを適用
            area.classList.remove('layout-image', 'layout-text', 'layout-compact');
            area.classList.add(`layout-${this.displayMode}`);
        });
    }

    /**
     * 表示の再描画
     */
    refreshDisplay() {
        this.applyDisplayMode();
    }

    /**
     * 詳細設定の表示切り替え
     */
    toggleOptions() {
        const optionsPanel = document.querySelector('.mode-options');
        if (optionsPanel) {
            const isVisible = optionsPanel.style.display !== 'none';
            optionsPanel.style.display = isVisible ? 'none' : 'block';
            
            const toggleButton = document.getElementById('toggle-options');
            if (toggleButton) {
                toggleButton.textContent = isVisible ? '詳細設定' : '設定を閉じる';
            }
        }
    }

    /**
     * 設定の保存
     */
    async savePreferences() {
        try {
            const settings = {
                displayMode: this.displayMode,
                preferences: this.preferences,
                lastUpdated: Date.now()
            };

            await chrome.storage.local.set({ 'ui_display_settings': settings });
            console.log('UIDisplayManager - Settings saved:', settings);
        } catch (error) {
            console.error('UIDisplayManager - Error saving settings:', error);
        }
    }

    /**
     * 設定の読み込み
     */
    async loadPreferences() {
        try {
            const result = await chrome.storage.local.get('ui_display_settings');
            const settings = result.ui_display_settings;
            
            if (settings) {
                this.displayMode = settings.displayMode || 'image';
                this.preferences = { ...this.preferences, ...settings.preferences };
                console.log('UIDisplayManager - Settings loaded:', settings);
            }
        } catch (error) {
            console.error('UIDisplayManager - Error loading settings:', error);
        }
    }

    /**
     * イベント発火
     */
    emit(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('UIDisplayManager - Event callback error:', error);
                }
            });
        }
    }

    /**
     * イベントリスナーの追加
     */
    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
}

// グローバルに公開
window.UIDisplayManager = UIDisplayManager;