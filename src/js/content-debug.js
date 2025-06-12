/**
 * デバッグ用シンプルなコンテンツスクリプト
 */

console.log('🎮 YGO Deck Support DEBUG - Script loaded!');
console.log('🔍 Current URL:', window.location.href);
console.log('📊 Page title:', document.title);

// ページ読み込み完了後に実行
function init() {
    console.log('🚀 YGO Deck Support DEBUG - Initializing...');
    
    // 簡単なテストUIを作成
    const testDiv = document.createElement('div');
    testDiv.id = 'ygo-debug-test';
    testDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: red;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    testDiv.innerHTML = '🎮 拡張機能動作中!';
    
    document.body.appendChild(testDiv);
    console.log('✅ YGO Deck Support DEBUG - Test UI added!');
    
    // 3秒後に詳細情報を表示
    setTimeout(() => {
        testDiv.innerHTML = `
            🎮 拡張機能OK!<br>
            📄 ${document.title.substring(0, 20)}...<br>
            🌐 ${window.location.pathname}
        `;
        testDiv.style.background = 'green';
    }, 3000);
}

// DOM読み込み完了を待つ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}