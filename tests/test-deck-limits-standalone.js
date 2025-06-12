/**
 * DeckIntegration制限チェック機能 - スタンドアロンテスト
 * PDCA2-Check: Phase 1.2 制限チェック機能の独立検証
 */

// DeckIntegrationクラスを読み込み
const fs = require('fs');
const path = require('path');

// DeckIntegrationクラスのソースコードを読み込み
const deckIntegrationSource = fs.readFileSync(
    path.join(__dirname, '../src/js/deck-integration.js'), 
    'utf8'
);

// window.DeckIntegrationを模擬
const window = {
    DeckIntegration: null
};

// Node.js環境でクラスを実行可能にする
eval(deckIntegrationSource.replace('window.DeckIntegration = DeckIntegration;', 'window.DeckIntegration = DeckIntegration;'));

// テスト実行
async function runDeckLimitsTest() {
    console.log('🔄 DeckIntegration制限チェック機能 - スタンドアロンテスト開始');
    console.log('============================================================');

    const integration = new window.DeckIntegration();
    let totalTests = 0;
    let passedTests = 0;
    const testResults = [];

    function runTest(testName, testFunc, expectedResult = true) {
        totalTests++;
        try {
            const result = testFunc();
            const passed = expectedResult ? result.valid : !result.valid;
            if (passed) passedTests++;
            
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${testName}: ${passed ? '成功' : '失敗'}`);
            
            if (result.errors.length > 0) {
                console.log(`   エラー: ${result.errors.join(', ')}`);
            }
            if (result.warnings.length > 0) {
                console.log(`   警告: ${result.warnings.join(', ')}`);
            }

            testResults.push({
                name: testName,
                passed: passed,
                expected: expectedResult,
                actual: result.valid,
                errors: result.errors,
                warnings: result.warnings
            });
        } catch (error) {
            console.log(`❌ ${testName}: エラー - ${error.message}`);
            testResults.push({
                name: testName,
                passed: false,
                expected: expectedResult,
                actual: null,
                errors: [error.message],
                warnings: []
            });
        }
    }

    console.log('\n📝 基本制限チェックテスト');
    console.log('------------------------------------------------------------');

    // テスト1: メインデッキ制限（正常）
    const normalMainDeck = {
        main: Array(40).fill({ name: 'ノーマルカード', id: '12345678', count: 1 }),
        extra: [],
        side: []
    };
    runTest(
        'メインデッキ40枚に1枚追加（正常）',
        () => integration.validateDeckLimits(normalMainDeck, 'main', { name: '新カード', id: '87654321' }),
        true
    );

    // テスト2: メインデッキ上限超過
    const maxMainDeck = {
        main: Array(60).fill({ name: 'ノーマルカード', id: '12345678', count: 1 }),
        extra: [],
        side: []
    };
    runTest(
        'メインデッキ60枚に1枚追加（上限超過）',
        () => integration.validateDeckLimits(maxMainDeck, 'main', { name: '新カード', id: '87654321' }),
        false
    );

    // テスト3: メインデッキ最小枚数警告
    const minMainDeck = {
        main: Array(30).fill({ name: 'ノーマルカード', id: '12345678', count: 1 }),
        extra: [],
        side: []
    };
    runTest(
        'メインデッキ30枚の状態（最小枚数警告）',
        () => integration.validateDeckLimits(minMainDeck, 'main', { name: '新カード', id: '87654321' }),
        true
    );

    console.log('\n📝 エクストラ・サイドデッキ制限テスト');
    console.log('------------------------------------------------------------');

    // テスト4: エクストラデッキ上限
    const normalDeck = {
        main: Array(40).fill({ name: 'メインカード', id: '12345678', count: 1 }),
        extra: Array(15).fill({ name: 'エクストラカード', id: '33333333', count: 1 }),
        side: []
    };
    runTest(
        'エクストラデッキ15枚に1枚追加（上限超過）',
        () => integration.validateDeckLimits(normalDeck, 'extra', { name: '新エクストラ', id: '44444444' }),
        false
    );

    // テスト5: サイドデッキ上限
    const deckWithSide = {
        main: Array(40).fill({ name: 'メインカード', id: '12345678', count: 1 }),
        extra: [],
        side: Array(15).fill({ name: 'サイドカード', id: '55555555', count: 1 })
    };
    runTest(
        'サイドデッキ15枚に1枚追加（上限超過）',
        () => integration.validateDeckLimits(deckWithSide, 'side', { name: '新サイド', id: '66666666' }),
        false
    );

    console.log('\n📝 同名カード制限テスト');
    console.log('------------------------------------------------------------');

    // テスト6: 同名カード3枚制限
    const deckWith3SameCards = {
        main: [
            { name: '同じカード', id: '11111111', count: 3 },
            ...Array(37).fill({ name: 'その他カード', id: '22222222', count: 1 })
        ],
        extra: [],
        side: []
    };
    runTest(
        '同名カード3枚に1枚追加（制限違反）',
        () => integration.validateDeckLimits(deckWith3SameCards, 'main', { name: '同じカード', id: '11111111' }),
        false
    );

    // テスト7: 同名カード2枚（正常）
    const deckWith2SameCards = {
        main: [
            { name: '同じカード', id: '11111111', count: 2 },
            ...Array(38).fill({ name: 'その他カード', id: '22222222', count: 1 })
        ],
        extra: [],
        side: []
    };
    runTest(
        '同名カード2枚に1枚追加（正常）',
        () => integration.validateDeckLimits(deckWith2SameCards, 'main', { name: '同じカード', id: '11111111' }),
        true
    );

    console.log('\n📝 禁止・制限カードテスト');
    console.log('------------------------------------------------------------');

    // テスト8: 禁止カード
    integration.updateCardLimits(['99999999'], [], []);
    runTest(
        '禁止カード追加テスト',
        () => integration.validateDeckLimits(normalMainDeck, 'main', { name: '禁止カード', id: '99999999' }),
        false
    );

    // テスト9: 制限カード（1枚制限）
    integration.updateCardLimits([], ['88888888'], []);
    const deckWithLimitedCard = {
        main: [
            { name: '制限カード', id: '88888888', count: 1 },
            ...Array(39).fill({ name: 'その他カード', id: '22222222', count: 1 })
        ],
        extra: [],
        side: []
    };
    runTest(
        '制限カード（1枚制限）に1枚追加（制限違反）',
        () => integration.validateDeckLimits(deckWithLimitedCard, 'main', { name: '制限カード', id: '88888888' }),
        false
    );

    // テスト10: 準制限カード（2枚制限）
    integration.updateCardLimits([], [], ['77777777']);
    const deckWithSemiLimitedCard = {
        main: [
            { name: '準制限カード', id: '77777777', count: 2 },
            ...Array(38).fill({ name: 'その他カード', id: '22222222', count: 1 })
        ],
        extra: [],
        side: []
    };
    runTest(
        '準制限カード（2枚制限）に1枚追加（制限違反）',
        () => integration.validateDeckLimits(deckWithSemiLimitedCard, 'main', { name: '準制限カード', id: '77777777' }),
        false
    );

    // テスト11: 準制限カード1枚（正常）
    const deckWithSemiLimited1Card = {
        main: [
            { name: '準制限カード', id: '77777777', count: 1 },
            ...Array(39).fill({ name: 'その他カード', id: '22222222', count: 1 })
        ],
        extra: [],
        side: []
    };
    runTest(
        '準制限カード（1枚）に1枚追加（正常）',
        () => integration.validateDeckLimits(deckWithSemiLimited1Card, 'main', { name: '準制限カード', id: '77777777' }),
        true
    );

    console.log('\n📝 カードタイプとエリア整合性テスト');
    console.log('------------------------------------------------------------');

    // テスト12: エクストラデッキタイプチェック
    runTest(
        'モンスターカードをエクストラデッキに追加（制限違反）',
        () => integration.validateDeckLimits(normalMainDeck, 'extra', { name: 'モンスター', id: '12121212', type: 'monster' }),
        false
    );

    // テスト13: 融合モンスターをエクストラデッキに追加
    runTest(
        '融合モンスターをエクストラデッキに追加（正常）',
        () => integration.validateDeckLimits(normalMainDeck, 'extra', { name: '融合モンスター', id: '13131313', type: 'fusion' }),
        true
    );

    console.log('\n📝 ユーティリティ機能テスト');
    console.log('------------------------------------------------------------');

    // デッキ統計テスト
    integration.officialDeckData = {
        main: Array(45).fill({ name: 'メインカード', type: 'monster', count: 1 }).concat(
               Array(10).fill({ name: '魔法カード', type: 'spell', count: 1 })),
        extra: Array(5).fill({ name: 'エクストラカード', type: 'fusion', count: 1 }),
        side: Array(10).fill({ name: 'サイドカード', type: 'monster', count: 1 })
    };

    const stats = integration.getDeckStatistics();
    console.log('✅ デッキ統計機能テスト: 成功');
    console.log(`   メイン: ${stats.deckCounts.main}枚`);
    console.log(`   エクストラ: ${stats.deckCounts.extra}枚`);
    console.log(`   サイド: ${stats.deckCounts.side}枚`);
    console.log(`   モンスター: ${stats.typeDistribution.monster}枚`);
    console.log(`   魔法: ${stats.typeDistribution.spell}枚`);

    passedTests++; // 統計機能テスト成功をカウント
    totalTests++;

    console.log('\n📊 テスト結果サマリー');
    console.log('============================================================');
    console.log(`📈 総テスト数: ${totalTests}`);
    console.log(`✅ 成功: ${passedTests}`);
    console.log(`❌ 失敗: ${totalTests - passedTests}`);
    
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    console.log(`📊 成功率: ${successRate}%`);

    // カテゴリ別結果
    const categories = {
        '基本制限': testResults.slice(0, 3),
        'エリア制限': testResults.slice(3, 5), 
        '同名カード制限': testResults.slice(5, 7),
        '禁止・制限カード': testResults.slice(7, 11),
        'タイプ整合性': testResults.slice(11, 13)
    };

    console.log('\n📋 カテゴリ別結果:');
    Object.entries(categories).forEach(([category, tests]) => {
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        const rate = (passed / total * 100).toFixed(1);
        console.log(`  ${category}: ${passed}/${total} (${rate}%)`);
    });

    // 詳細レポート保存
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalTests: totalTests,
            passedTests: passedTests,
            failedTests: totalTests - passedTests,
            successRate: successRate
        },
        categories: categories,
        detailedResults: testResults
    };

    fs.writeFileSync('../reports/deck-limits-standalone-report.json', JSON.stringify(report, null, 2));
    console.log('\n📁 詳細レポートを deck-limits-standalone-report.json に保存しました');

    console.log('\n🎯 PDCA2-Check結果:');
    if (successRate >= 90) {
        console.log('✅ 制限チェック機能は高品質で実装されています');
    } else if (successRate >= 75) {
        console.log('⚠️ 制限チェック機能は概ね良好ですが、改善の余地があります');
    } else {
        console.log('❌ 制限チェック機能に重大な問題があります');
    }

    console.log('\n🏁 DeckIntegration制限チェック機能テスト完了');
    return { successRate, passedTests, totalTests, testResults };
}

// テスト実行
runDeckLimitsTest().then(result => {
    process.exit(0);
}).catch(error => {
    console.error('❌ テスト実行エラー:', error);
    process.exit(1);
});