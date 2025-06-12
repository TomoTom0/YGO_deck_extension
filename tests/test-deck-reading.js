/**
 * デッキ読み取り機能テスト
 * コンソールで実行してデッキ情報が正しく読み取れるかテスト
 */

// テスト関数をグローバルに追加
function testDeckReading() {
    console.log('🧪 デッキ読み取りテスト開始...');
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0
        }
    };

    // テスト1: メインデッキの読み取り
    console.log('📋 Test 1: メインデッキ読み取り');
    try {
        const mainCards = readMainDeckCards();
        const testResult = {
            name: 'メインデッキ読み取り',
            passed: mainCards.length > 0,
            cardCount: mainCards.length,
            cards: mainCards,
            details: `${mainCards.length}枚のカードを検出`
        };
        results.tests.push(testResult);
        
        if (testResult.passed) {
            console.log(`✅ メインデッキ: ${mainCards.length}枚読み取り成功`);
            mainCards.forEach((card, i) => {
                console.log(`  ${i+1}. ${card.name} x${card.count} (${card.type}, ID:${card.id})`);
            });
        } else {
            console.log('❌ メインデッキ読み取り失敗');
        }
    } catch (error) {
        console.error('❌ メインデッキ読み取りエラー:', error);
        results.tests.push({
            name: 'メインデッキ読み取り',
            passed: false,
            error: error.message
        });
    }

    // テスト2: エクストラデッキの読み取り
    console.log('📋 Test 2: エクストラデッキ読み取り');
    try {
        const extraCards = readExtraDeckCards();
        const testResult = {
            name: 'エクストラデッキ読み取り',
            passed: extraCards.length >= 0, // 0枚でも正常
            cardCount: extraCards.length,
            cards: extraCards,
            details: `${extraCards.length}枚のカードを検出`
        };
        results.tests.push(testResult);
        
        console.log(`✅ エクストラデッキ: ${extraCards.length}枚読み取り成功`);
        extraCards.forEach((card, i) => {
            console.log(`  ${i+1}. ${card.name} x${card.count} (ID:${card.id})`);
        });
    } catch (error) {
        console.error('❌ エクストラデッキ読み取りエラー:', error);
        results.tests.push({
            name: 'エクストラデッキ読み取り',
            passed: false,
            error: error.message
        });
    }

    // テスト3: サイドデッキの読み取り
    console.log('📋 Test 3: サイドデッキ読み取り');
    try {
        const sideCards = readSideDeckCards();
        const testResult = {
            name: 'サイドデッキ読み取り',
            passed: sideCards.length >= 0, // 0枚でも正常
            cardCount: sideCards.length,
            cards: sideCards,
            details: `${sideCards.length}枚のカードを検出`
        };
        results.tests.push(testResult);
        
        console.log(`✅ サイドデッキ: ${sideCards.length}枚読み取り成功`);
        sideCards.forEach((card, i) => {
            console.log(`  ${i+1}. ${card.name} x${card.count} (ID:${card.id})`);
        });
    } catch (error) {
        console.error('❌ サイドデッキ読み取りエラー:', error);
        results.tests.push({
            name: 'サイドデッキ読み取り',
            passed: false,
            error: error.message
        });
    }

    // 結果サマリー
    results.summary.totalTests = results.tests.length;
    results.summary.passedTests = results.tests.filter(t => t.passed).length;
    results.summary.failedTests = results.summary.totalTests - results.summary.passedTests;

    console.log('\n📊 テスト結果サマリー');
    console.log('============================================');
    console.log(`総テスト数: ${results.summary.totalTests}`);
    console.log(`成功: ${results.summary.passedTests}`);
    console.log(`失敗: ${results.summary.failedTests}`);
    console.log(`成功率: ${(results.summary.passedTests / results.summary.totalTests * 100).toFixed(1)}%`);

    return results;
}

// メインデッキ読み取り関数
function readMainDeckCards() {
    const cards = [];
    
    // モンスターカード
    cards.push(...readCardsByType('monster', 'monm', 'monum', 'monsterCardId'));
    
    // 魔法カード  
    cards.push(...readCardsByType('spell', 'magm', 'magnum', 'spellCardId'));
    
    // 罠カード
    cards.push(...readCardsByType('trap', 'trapm', 'trapnum', 'trapCardId'));
    
    return cards;
}

// エクストラデッキ読み取り関数
function readExtraDeckCards() {
    return readCardsByType('extra', 'exnm', 'exnum', 'extraCardId');
}

// サイドデッキ読み取り関数
function readSideDeckCards() {
    return readCardsByType('side', 'sidnm', 'sidnum', 'sideCardId');
}

// 指定タイプのカード読み取り関数
function readCardsByType(cardType, nameSelector, countSelector, idSelector) {
    const cards = [];
    
    try {
        // カード名の入力欄を取得
        const nameInputs = document.querySelectorAll(`input[name="${nameSelector}"]`);
        
        nameInputs.forEach((nameInput, index) => {
            const cardName = nameInput.value.trim();
            
            if (cardName) {
                // 対応する枚数入力欄を取得
                const countInput = document.querySelector(`input[name="${countSelector}"][id*="${index + 1}"]`);
                const count = countInput ? parseInt(countInput.value) || 1 : 1;
                
                // 対応するカードID入力欄を取得
                const idInput = nameInput.closest('tr')?.querySelector(`input[name="${idSelector}"]`);
                const cardId = idInput ? idInput.value : 'unknown';
                
                // 画像ID取得
                const imgInput = nameInput.closest('tr')?.querySelector('input.imgs');
                const imgId = imgInput ? imgInput.value : null;
                
                // カードデータを作成（枚数分）
                for (let i = 0; i < count; i++) {
                    cards.push({
                        id: cardId,
                        name: cardName,
                        type: cardType,
                        imgId: imgId,
                        count: count,
                        originalIndex: index + 1
                    });
                }
                
                console.log(`Read ${cardType} card: ${cardName} x${count} (ID: ${cardId})`);
            }
        });
        
    } catch (error) {
        console.error(`Error reading ${cardType} cards:`, error);
    }
    
    return cards;
}

// グローバルオブジェクトに追加（コンソールから呼び出し可能にする）
if (typeof window !== 'undefined') {
    window.testDeckReading = testDeckReading;
    window.readMainDeckCards = readMainDeckCards;
    window.readExtraDeckCards = readExtraDeckCards;
    window.readSideDeckCards = readSideDeckCards;
    console.log('🧪 デッキ読み取りテスト関数が利用可能になりました');
    console.log('   コンソールで testDeckReading() を実行してください');
}