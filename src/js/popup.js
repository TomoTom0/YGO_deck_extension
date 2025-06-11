/**
 * 遊戯王DBデッキサポート - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    await initializePopup();
});

async function initializePopup() {
    try {
        // 現在のタブ情報を取得
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // ページタイプを判定
        const pageType = detectPageType(tab.url);
        document.getElementById('current-page').textContent = getPageTypeName(pageType);
        
        // 拡張機能の状態を確認
        const extensionStatus = isExtensionActive(tab.url);
        const statusElement = document.getElementById('extension-status');
        
        if (extensionStatus) {
            statusElement.textContent = '有効';
            statusElement.className = 'status-active';
        } else {
            statusElement.textContent = '無効';
            statusElement.className = 'status-inactive';
        }
        
        // イベントリスナーを設定
        setupEventListeners(tab);
        
    } catch (error) {
        console.error('Popup initialization failed:', error);
    }
}

function detectPageType(url) {
    if (!url) return 'unknown';
    
    if (url.includes('db.yugioh-card.com')) {
        if (url.includes('/deck_edit')) {
            return 'deck_edit';
        } else if (url.includes('/deck_view')) {
            return 'deck_view';
        } else if (url.includes('/card_search')) {
            return 'card_search';
        } else if (url.includes('/yugiohdb/')) {
            return 'ygo_db';
        }
    }
    
    return 'other';
}

function getPageTypeName(pageType) {
    const names = {
        'deck_edit': 'デッキ編集',
        'deck_view': 'デッキ閲覧',
        'card_search': 'カード検索',
        'ygo_db': '遊戯王DB',
        'other': 'その他のページ',
        'unknown': '不明'
    };
    
    return names[pageType] || '不明';
}

function isExtensionActive(url) {
    return url && url.includes('db.yugioh-card.com');
}

function setupEventListeners(tab) {
    // 再読み込みボタン
    document.getElementById('refresh-btn').addEventListener('click', () => {
        chrome.tabs.reload(tab.id);
        window.close();
    });
    
    // 設定ボタン
    document.getElementById('options-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        window.close();
    });
    
    // ヘルプリンク
    document.getElementById('help-link').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ 
            url: 'https://github.com/TomoTom0/YGO_deck_extension' 
        });
        window.close();
    });
}