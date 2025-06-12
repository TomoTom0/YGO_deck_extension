# フェーズ2: 新機能実装のPDCA計画

## 📋 Plan (計画) - 2025年6月12日

### 🎯 実装対象新機能

フェーズ1で整備された安定基盤の上に、以下の新機能を実装:

#### 🔥 高優先度（コア機能）
1. **カード検索結果からのクリック追加**
   - 右側検索結果エリアの検出
   - カード要素へのクリックイベント追加
   - デッキエリアへのカード追加処理

2. **基本的なカード移動処理**
   - DOM要素のカード移動
   - デッキ制限チェック（40-60枚等）
   - 視覚的フィードバック

3. **デッキ状態管理強化**
   - カード追加/削除の永続化
   - デッキ構成の保存/読み込み

#### 🟡 中優先度（ユーザビリティ）
1. **ドラッグ&ドロップ機能**
   - HTML5 Drag and Drop API実装
   - カード要素のdraggable化
   - ドロップゾーンの実装

2. **カード情報表示強化**
   - ホバー時の詳細情報表示
   - カード画像のプレビュー

### 🔍 技術仕様

#### A. カード検索結果連携
```javascript
// 実装予定の基本構造
class CardSearchIntegration {
    detectSearchResults() {
        // 公式サイトの検索結果要素を検出
        const searchResults = document.querySelectorAll('.card-result, .search-item');
        return Array.from(searchResults);
    }
    
    addClickHandlers(cardElements) {
        cardElements.forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleCardClick(e, card);
            });
        });
    }
    
    handleCardClick(event, cardElement) {
        // カード情報を抽出
        const cardData = this.extractCardData(cardElement);
        // デッキに追加
        this.addCardToDeck(cardData, 'main');
    }
}
```

#### B. デッキ管理システム
```javascript
// デッキデータ構造
const deckStructure = {
    main: [
        { 
            id: 'card_id_123',
            name: 'カード名',
            type: 'monster',
            count: 1,
            rarity: 'UR'
        }
    ],
    extra: [],
    side: [],
    metadata: {
        totalCards: 40,
        lastModified: Date.now(),
        version: '1.0'
    }
};
```

#### C. ドラッグ&ドロップ実装
```javascript
// HTML5 Drag and Drop
function enableDragAndDrop(cardElement) {
    cardElement.draggable = true;
    
    cardElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(cardData));
        e.dataTransfer.effectAllowed = 'move';
    });
}

function setupDropZones(deckAreas) {
    deckAreas.forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            const cardData = JSON.parse(e.dataTransfer.getData('application/json'));
            this.moveCardToArea(cardData, area.dataset.deckType);
        });
    });
}
```

### 📊 成功指標

#### 定量的指標
1. **機能実装完了率**: 高優先度機能 100%完了
2. **テスト成功率**: 85% → 90%以上
3. **カード追加成功率**: 95%以上
4. **エラー発生率**: 5%以下

#### 定性的指標
1. **ユーザビリティ**: 直感的なカード操作が可能
2. **パフォーマンス**: カード移動に1秒以下で応答
3. **安定性**: 連続操作でもエラーが発生しない

### 🗓️ 実装スケジュール

#### Step 1: カード検索結果連携 (高優先度)
- [ ] 公式サイト検索結果エリアの調査・特定
- [ ] カード要素の検出ロジック実装
- [ ] クリックイベントハンドラー実装
- [ ] カードデータ抽出機能実装

#### Step 2: 基本カード移動処理 (高優先度)  
- [ ] デッキエリアへのカード追加処理
- [ ] DOM要素の動的生成・挿入
- [ ] デッキ制限チェック機能
- [ ] 視覚的フィードバック実装

#### Step 3: デッキ状態管理強化 (高優先度)
- [ ] カード情報の永続化
- [ ] デッキ構成の保存機能
- [ ] 状態復元機能
- [ ] エラー回復機能

#### Step 4: ドラッグ&ドロップ (中優先度)
- [ ] HTML5 Drag and Drop API実装
- [ ] ドラッグ可能要素の設定
- [ ] ドロップゾーンの実装
- [ ] ドラッグ中の視覚効果

### 🚧 想定課題と対策

#### 技術的課題
1. **公式サイト構造の変化**
   - 対策: 複数のセレクタパターンで要素検出
   - 対策: 動的な要素検出機能

2. **カード情報の抽出精度**
   - 対策: 複数の情報源から総合判断
   - 対策: フォールバック機能の実装

3. **パフォーマンス問題**
   - 対策: 必要最小限のDOM操作
   - 対策: イベント処理の最適化

#### UX課題
1. **操作の分かりやすさ**
   - 対策: 明確な視覚的フィードバック
   - 対策: 操作ガイドの表示

2. **エラー時の対応**
   - 対策: 分かりやすいエラーメッセージ
   - 対策: 操作の取り消し機能

### 🔄 PDCAサイクル設計

#### Do (実装)
- 段階的な機能実装
- 各ステップでの動作確認
- プロトタイプベースの開発

#### Check (テスト)
- 機能ごとの単体テスト
- 統合テスト（既存機能との連携）
- ユーザビリティテスト

#### Action (改善)
- テスト結果に基づく修正
- パフォーマンス最適化
- ユーザーエクスペリエンス改善

### 🎯 期待される成果

#### ユーザーができるようになること
1. **カード検索結果をクリック** → デッキに直接追加
2. **カードをドラッグ&ドロップ** → 直感的なデッキ編集
3. **デッキ状態の保存** → セッション間でのデッキ維持
4. **制限チェック** → 適切なデッキ構築支援

#### 技術的成果
1. **安定したカード管理システム**
2. **拡張可能なアーキテクチャ**
3. **高品質なユーザーエクスペリエンス**
4. **包括的なテストカバレッジ**

### 🚀 次ステップ

計画承認後、Step 1から順次実装を開始し、各ステップでPDCAサイクルを実行します。