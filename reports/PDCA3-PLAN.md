# PDCA Cycle 3 - Plan
## Phase 1.3: Text/Image UI切り替え機能

### 🎯 目標設定

#### 主要目標
- **メイン機能**: デッキ表示の切り替え機能（画像⟷テキスト）
- **ユーザビリティ**: 直感的な表示モード選択
- **パフォーマンス**: 軽量テキストモードでの高速表示
- **永続化**: 表示設定の保存・復元

#### 成功基準
- ✅ 画像表示モード: カード画像での視覚的デッキ表示
- ✅ テキスト表示モード: カード名のみの軽量表示  
- ✅ 切り替えボタン: ワンクリックでの切り替え
- ✅ 設定永続化: ブラウザ再起動後も設定維持
- ✅ レスポンシブ対応: 小画面での最適表示

---

### 🏗️ 技術仕様

#### 1. UIDisplayManager Class
```javascript
class UIDisplayManager {
    constructor() {
        this.displayMode = 'image'; // 'image' | 'text' | 'compact'
        this.preferences = {
            cardSize: 'medium',
            showCount: true,
            animateTransitions: true
        };
    }

    // 表示モード切り替え
    toggleDisplayMode() {
        const modes = ['image', 'text', 'compact'];
        const currentIndex = modes.indexOf(this.displayMode);
        this.displayMode = modes[(currentIndex + 1) % modes.length];
        this.applyDisplayMode();
        this.savePreferences();
    }

    // 表示モードの適用
    applyDisplayMode() {
        switch (this.displayMode) {
            case 'image':
                this.showImageMode();
                break;
            case 'text':
                this.showTextMode();
                break;
            case 'compact':
                this.showCompactMode();
                break;
        }
    }
}
```

#### 2. カード表示コンポーネント
```javascript
class CardDisplayComponent {
    // 画像モード表示
    renderImageMode(cardData) {
        return `
            <div class="card-display image-mode">
                <img src="${cardData.image}" alt="${cardData.name}" />
                <div class="card-overlay">
                    <span class="card-count">×${cardData.count}</span>
                </div>
            </div>
        `;
    }

    // テキストモード表示
    renderTextMode(cardData) {
        return `
            <div class="card-display text-mode">
                <span class="card-name">${cardData.name}</span>
                <span class="card-count">×${cardData.count}</span>
                <span class="card-type">[${cardData.type}]</span>
            </div>
        `;
    }

    // コンパクトモード表示
    renderCompactMode(cardData) {
        return `
            <div class="card-display compact-mode">
                <span class="card-short">${this.getShortName(cardData.name)}</span>
                <span class="count">×${cardData.count}</span>
            </div>
        `;
    }
}
```

#### 3. CSS設計
```css
/* 画像モード */
.card-display.image-mode {
    width: 120px;
    height: 175px;
    position: relative;
    margin: 4px;
}

.card-display.image-mode img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
}

/* テキストモード */
.card-display.text-mode {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    margin: 2px 0;
    border-radius: 4px;
}

/* コンパクトモード */
.card-display.compact-mode {
    display: inline-block;
    padding: 4px 8px;
    margin: 1px;
    background: #e9ecef;
    border-radius: 16px;
    font-size: 12px;
}

/* アニメーション */
.card-display {
    transition: all 0.3s ease;
}

.mode-transition {
    opacity: 0;
    transform: scale(0.9);
}
```

---

### 🛠️ 実装計画

#### Phase 1: 基本UI切り替え機能
1. **UIDisplayManagerクラス作成**
   - 基本的な表示モード管理
   - 設定の永続化機能
   - イベント処理システム

2. **表示切り替えボタン追加**
   - MouseUIコントロールパネルに統合
   - アイコン付きボタン（画像⟷テキスト⟷コンパクト）
   - 現在モードの視覚的表示

3. **カード表示コンポーネント更新**
   - 既存のaddCardToAreaElement関数を拡張
   - 3つの表示モードに対応
   - アニメーション効果追加

#### Phase 2: デッキエリア統合
1. **デッキエリア表示の更新**
   - メイン・エクストラ・サイドデッキ全対応
   - 表示モード統一制御
   - レイアウト自動調整

2. **パフォーマンス最適化**
   - 画像遅延読み込み
   - 大量カード表示の最適化
   - メモリ使用量削減

#### Phase 3: 高度機能
1. **詳細設定オプション**
   - カードサイズ調整（S/M/L）
   - 枚数表示のON/OFF
   - アニメーション有効/無効

2. **レスポンシブ対応**
   - 画面サイズに応じた自動切り替え
   - モバイル向け最適化
   - 縦画面対応

---

### 🎨 UI/UX設計

#### 切り替えボタンデザイン
```html
<div class="display-mode-controls">
    <button id="display-mode-toggle" class="mode-btn" title="表示モード切り替え">
        <span class="mode-icon">🖼️</span>
        <span class="mode-text">画像</span>
    </button>
    <div class="mode-options" style="display: none;">
        <button data-mode="image">🖼️ 画像</button>
        <button data-mode="text">📝 テキスト</button>
        <button data-mode="compact">📋 コンパクト</button>
    </div>
</div>
```

#### ユーザーフロー
1. **初回利用**: デフォルト画像モードで開始
2. **モード切り替え**: ボタンクリックで即座に変更
3. **設定保存**: 自動的にブラウザストレージに保存
4. **次回起動**: 前回設定で自動復元

---

### 📊 実装優先順位

#### High Priority
- ✅ 基本的な画像⟷テキスト切り替え
- ✅ 設定の永続化
- ✅ MouseUIとの統合

#### Medium Priority  
- ✅ コンパクトモード追加
- ✅ アニメーション効果
- ✅ 詳細設定オプション

#### Low Priority
- ✅ レスポンシブ対応
- ✅ パフォーマンス最適化
- ✅ アクセシビリティ対応

---

### 🧪 テスト計画

#### 機能テスト
1. **表示モード切り替えテスト**
   - 画像→テキスト→コンパクト→画像のループ
   - 各モードでの正常表示確認
   - カード枚数表示の整合性

2. **永続化テスト**
   - 設定保存の確認
   - ページリロード後の復元
   - ブラウザ再起動後の復元

3. **統合テスト**
   - MouseUI機能との併用
   - カード移動時の表示更新
   - 制限チェック機能との連携

#### パフォーマンステスト
1. **描画速度測定**
   - 大量カード表示時のレンダリング時間
   - モード切り替え時の応答速度
   - メモリ使用量の監視

2. **ユーザビリティテスト**
   - 切り替え操作の直感性
   - 視認性の比較（画像vs.テキスト）
   - 誤操作の可能性チェック

---

### 🎯 成功指標

#### 定量指標
- **機能正常性**: 切り替え機能100%動作
- **パフォーマンス**: モード切り替え応答時間 < 300ms
- **設定永続化**: 100%確実な保存・復元
- **テスト成功率**: 全テスト項目85%以上成功

#### 定性指標
- **ユーザビリティ**: 直感的で分かりやすい操作
- **視認性**: 各モードでの適切な情報表示
- **一貫性**: 既存UI との調和
- **拡張性**: 将来的な機能追加への対応

---

### 🔄 既存システムとの統合

#### MouseUICore連携
```javascript
// MouseUICore内での表示更新
addCardToAreaElement(cardData, areaElement) {
    const displayManager = window.UIDisplayManager;
    const cardElement = displayManager.createCardElement(cardData);
    areaElement.appendChild(cardElement);
}
```

#### DeckIntegration連携
```javascript
// デッキ統計表示の更新
updateDeckStatistics() {
    const stats = this.deckIntegration.getDeckStatistics();
    this.displayManager.updateDeckCounters(stats);
}
```

---

### 📅 実装スケジュール

#### Day 1: 基本実装
- UIDisplayManagerクラス作成
- 基本的な表示モード切り替え
- 設定永続化機能

#### Day 2: UI統合
- MouseUIとの統合
- 切り替えボタンの実装
- CSS設計と実装

#### Day 3: テスト・最適化
- 機能テスト実行
- パフォーマンス調整
- バグ修正と改善

**目標完了日**: 当日完了予定

---

## 🎯 Phase 1.3の期待成果

### ユーザー体験向上
- **選択の自由**: 用途に応じた表示モード選択
- **パフォーマンス**: 軽量テキストモードでの高速動作
- **視認性**: 状況に応じた最適な表示

### 技術的成果
- **モジュール設計**: 独立したUI管理システム
- **拡張性**: 将来的なUI機能追加の基盤
- **品質保証**: 包括的テストによる安定性確保

### プロジェクト全体への寄与
- **Phase 1完了**: MouseUI基本機能の完全実装
- **Phase 2準備**: デッキ管理システムへの移行準備
- **ユーザー満足度**: 実用的な機能提供による価値向上

---

**📅 計画完了日**: 2025-06-12  
**✅ ステータス**: PDCA3-Plan完了  
**➡️ 次回**: PDCA3-Do実装開始

**🤖 Generated with [Claude Code](https://claude.ai/code)**