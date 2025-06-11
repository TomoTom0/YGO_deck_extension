/**
 * 遊戯王DBデッキサポート - Options Script
 */

// デフォルト設定
const DEFAULT_SETTINGS = {
    enableMouseUI: true,
    enableSearchArea: true,
    enableInfoArea: true,
    enableDebugMode: false
};

document.addEventListener('DOMContentLoaded', async () => {
    await initializeOptions();
});

async function initializeOptions() {
    try {
        // 設定を読み込み
        await loadSettings();
        
        // キャッシュ情報を更新
        await updateCacheInfo();
        
        // イベントリスナーを設定
        setupEventListeners();
        
    } catch (error) {
        console.error('Options initialization failed:', error);
        showStatusMessage('設定の初期化に失敗しました', 'error');
    }
}

async function loadSettings() {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    document.getElementById('enable-mouse-ui').checked = result.enableMouseUI;
    document.getElementById('enable-search-area').checked = result.enableSearchArea;
    document.getElementById('enable-info-area').checked = result.enableInfoArea;
    document.getElementById('enable-debug-mode').checked = result.enableDebugMode;
}

async function saveSettings() {
    const settings = {
        enableMouseUI: document.getElementById('enable-mouse-ui').checked,
        enableSearchArea: document.getElementById('enable-search-area').checked,
        enableInfoArea: document.getElementById('enable-info-area').checked,
        enableDebugMode: document.getElementById('enable-debug-mode').checked
    };
    
    try {
        await chrome.storage.sync.set(settings);
        showStatusMessage('設定を保存しました', 'success');
    } catch (error) {
        console.error('Failed to save settings:', error);
        showStatusMessage('設定の保存に失敗しました', 'error');
    }
}

async function resetSettings() {
    if (!confirm('設定をリセットしますか？この操作は元に戻せません。')) {
        return;
    }
    
    try {
        await chrome.storage.sync.set(DEFAULT_SETTINGS);
        await loadSettings();
        showStatusMessage('設定をリセットしました', 'success');
    } catch (error) {
        console.error('Failed to reset settings:', error);
        showStatusMessage('設定のリセットに失敗しました', 'error');
    }
}

async function updateCacheInfo() {
    try {
        const result = await chrome.storage.local.get(null);
        const deckCount = Object.keys(result).filter(key => 
            key.startsWith('deck_') || key.startsWith('cached_deck_')
        ).length;
        
        document.getElementById('cached-decks-count').textContent = deckCount.toString();
    } catch (error) {
        console.error('Failed to get cache info:', error);
        document.getElementById('cached-decks-count').textContent = 'エラー';
    }
}

async function clearCache() {
    if (!confirm('キャッシュをクリアしますか？保存されたデッキがすべて削除されます。')) {
        return;
    }
    
    try {
        await chrome.storage.local.clear();
        await updateCacheInfo();
        showStatusMessage('キャッシュをクリアしました', 'success');
    } catch (error) {
        console.error('Failed to clear cache:', error);
        showStatusMessage('キャッシュのクリアに失敗しました', 'error');
    }
}

async function exportCache() {
    try {
        const result = await chrome.storage.local.get(null);
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ygo-deck-support-cache-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatusMessage('キャッシュをエクスポートしました', 'success');
    } catch (error) {
        console.error('Failed to export cache:', error);
        showStatusMessage('キャッシュのエクスポートに失敗しました', 'error');
    }
}

async function showDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    
    if (debugInfo.style.display === 'none') {
        try {
            const info = await collectDebugInfo();
            debugInfo.textContent = JSON.stringify(info, null, 2);
            debugInfo.style.display = 'block';
            document.getElementById('show-debug-btn').textContent = 'デバッグ情報を隠す';
        } catch (error) {
            console.error('Failed to collect debug info:', error);
            debugInfo.textContent = 'デバッグ情報の取得に失敗しました';
            debugInfo.style.display = 'block';
        }
    } else {
        debugInfo.style.display = 'none';
        document.getElementById('show-debug-btn').textContent = 'デバッグ情報を表示';
    }
}

async function collectDebugInfo() {
    const [syncStorage, localStorage] = await Promise.all([
        chrome.storage.sync.get(null),
        chrome.storage.local.get(null)
    ]);
    
    return {
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        syncStorage,
        localStorage: {
            keys: Object.keys(localStorage),
            totalSize: JSON.stringify(localStorage).length
        },
        manifest: chrome.runtime.getManifest(),
        platform: navigator.platform,
        userAgent: navigator.userAgent
    };
}

function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

function setupEventListeners() {
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
    document.getElementById('clear-cache-btn').addEventListener('click', clearCache);
    document.getElementById('export-cache-btn').addEventListener('click', exportCache);
    document.getElementById('show-debug-btn').addEventListener('click', showDebugInfo);
}