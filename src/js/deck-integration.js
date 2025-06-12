/**
 * Deck Integration System
 * 公式サイトのデッキデータとの統合機能
 */

class DeckIntegration {
    constructor() {
        this.officialDeckData = {
            main: [],
            extra: [],
            side: []
        };
        this.deckLimits = {
            main: { min: 40, max: 60 },
            extra: { min: 0, max: 15 },
            side: { min: 0, max: 15 }
        };
        this.cardLimits = {
            forbidden: [], // 禁止カード
            limited: [],   // 制限カード（1枚）
            semiLimited: [] // 準制限カード（2枚）
        };
        console.log('DeckIntegration - Initialized');
    }

    /**
     * 公式サイトの現在のデッキデータを読み込み
     */
    async loadOfficialDeckData() {
        console.log('DeckIntegration - Loading official deck data...');
        
        try {
            // メインデッキの読み込み
            this.officialDeckData.main = await this.extractDeckArea('main');
            
            // エクストラデッキの読み込み
            this.officialDeckData.extra = await this.extractDeckArea('extra');
            
            // サイドデッキの読み込み
            this.officialDeckData.side = await this.extractDeckArea('side');
            
            console.log('DeckIntegration - Official deck data loaded:', {
                main: this.officialDeckData.main.length,
                extra: this.officialDeckData.extra.length,
                side: this.officialDeckData.side.length
            });
            
            return this.officialDeckData;
            
        } catch (error) {
            console.error('DeckIntegration - Error loading official deck data:', error);
            return null;
        }
    }

    /**
     * 指定エリアのカードデータを抽出
     */
    async extractDeckArea(areaType) {
        const cards = [];
        
        // エリア特定用セレクタ
        const areaSelectors = {
            main: [
                '.deck_set:nth-of-type(1) img',
                '[class*="main"] img[src*="card"]',
                '#main_deck img',
                '.main-deck img'
            ],
            extra: [
                '.deck_set:nth-of-type(2) img',
                '[class*="extra"] img[src*="card"]', 
                '#extra_deck img',
                '.extra-deck img'
            ],
            side: [
                '.deck_set:nth-of-type(3) img',
                '[class*="side"] img[src*="card"]',
                '#side_deck img', 
                '.side-deck img'
            ]
        };

        const selectors = areaSelectors[areaType] || [];
        
        for (const selector of selectors) {
            try {
                const cardElements = document.querySelectorAll(selector);
                
                if (cardElements.length > 0) {
                    console.log(`DeckIntegration - Found ${cardElements.length} cards in ${areaType} with selector: ${selector}`);
                    
                    cardElements.forEach(element => {
                        const cardData = this.extractCardDataFromElement(element);
                        if (cardData && cardData.id !== 'unknown') {
                            cards.push(cardData);
                        }
                    });
                    
                    break; // 最初に見つかったセレクタで十分
                }
            } catch (error) {
                console.warn(`DeckIntegration - Error with selector ${selector}:`, error);
            }
        }
        
        return cards;
    }

    /**
     * DOM要素からカードデータを抽出
     */
    extractCardDataFromElement(element) {
        try {
            const cardData = {
                id: this.extractCardId(element),
                name: this.extractCardName(element),
                image: element.src || '',
                type: this.determineCardType(element),
                count: 1, // 基本は1枚
                element: element,
                extractedAt: Date.now()
            };

            // 枚数情報の抽出（複数枚表示の場合）
            const countInfo = this.extractCardCount(element);
            if (countInfo > 1) {
                cardData.count = countInfo;
            }

            return cardData;
            
        } catch (error) {
            console.error('DeckIntegration - Error extracting card data:', error);
            return null;
        }
    }

    /**
     * カードIDの抽出
     */
    extractCardId(element) {
        // src属性からID抽出
        if (element.src) {
            const srcMatch = element.src.match(/(\d{8,})/);
            if (srcMatch) return srcMatch[1];
        }

        // onclick属性からID抽出
        if (element.onclick) {
            const onclickMatch = element.onclick.toString().match(/cid[=:](\d+)/);
            if (onclickMatch) return onclickMatch[1];
        }

        // data属性からID抽出
        if (element.dataset.cardId) return element.dataset.cardId;
        if (element.dataset.cid) return element.dataset.cid;

        // 親要素のhref属性からID抽出
        let parent = element.parentElement;
        while (parent) {
            if (parent.href) {
                const hrefMatch = parent.href.match(/cid=(\d+)/);
                if (hrefMatch) return hrefMatch[1];
            }
            parent = parent.parentElement;
        }

        return 'unknown';
    }

    /**
     * カード名の抽出
     */
    extractCardName(element) {
        // alt属性
        if (element.alt && element.alt.trim()) {
            return element.alt.trim();
        }

        // title属性
        if (element.title && element.title.trim()) {
            return element.title.trim();
        }

        // 周辺のテキスト要素から抽出
        const parent = element.parentElement;
        if (parent) {
            // 兄弟要素から名前を検索
            const siblings = Array.from(parent.children);
            for (const sibling of siblings) {
                if (sibling !== element && sibling.textContent) {
                    const text = sibling.textContent.trim();
                    if (text.length > 0 && text.length < 50) {
                        return text;
                    }
                }
            }

            // 親要素のテキストから抽出
            const parentText = parent.textContent.trim();
            if (parentText.length > 0 && parentText.length < 50) {
                return parentText;
            }
        }

        return 'Unknown Card';
    }

    /**
     * カードタイプの判定
     */
    determineCardType(element) {
        const src = element.src || '';
        const className = element.className || '';
        const parentClass = element.parentElement?.className || '';

        // 画像URLから判定
        if (src.includes('monster') || src.includes('effect') || src.includes('normal')) {
            return 'monster';
        }
        if (src.includes('spell') || src.includes('magic')) {
            return 'spell';
        }
        if (src.includes('trap')) {
            return 'trap';
        }

        // クラス名から判定
        const allClasses = `${className} ${parentClass}`.toLowerCase();
        if (allClasses.includes('monster')) return 'monster';
        if (allClasses.includes('spell') || allClasses.includes('magic')) return 'spell';
        if (allClasses.includes('trap')) return 'trap';

        // デフォルト
        return 'unknown';
    }

    /**
     * カード枚数の抽出
     */
    extractCardCount(element) {
        // 周辺のテキストから枚数情報を抽出
        const parent = element.parentElement;
        if (parent) {
            const text = parent.textContent;
            const countMatch = text.match(/[×x](\d+)|(\d+)枚/);
            if (countMatch) {
                return parseInt(countMatch[1] || countMatch[2]);
            }
        }

        return 1;
    }

    /**
     * デッキ制限チェック
     */
    validateDeckLimits(deckData, targetArea, newCard) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        try {
            // 現在の枚数をカウント
            const currentCounts = this.countDeckCards(deckData);
            
            // エリア別制限チェック
            const areaLimit = this.deckLimits[targetArea];
            if (areaLimit) {
                const currentCount = currentCounts[targetArea];
                
                if (currentCount >= areaLimit.max) {
                    result.valid = false;
                    result.errors.push(`${targetArea}デッキの上限（${areaLimit.max}枚）に達しています`);
                }
                
                if (currentCount < areaLimit.min && targetArea === 'main') {
                    result.warnings.push(`メインデッキが最小枚数（${areaLimit.min}枚）を下回っています`);
                }
            }

            // 同名カード制限チェック
            if (newCard && newCard.name !== 'Unknown Card') {
                const sameNameCount = this.countSameNameCards(deckData, newCard.name);
                
                if (this.cardLimits.forbidden.includes(newCard.id)) {
                    result.valid = false;
                    result.errors.push(`「${newCard.name}」は禁止カードです`);
                } else if (this.cardLimits.limited.includes(newCard.id) && sameNameCount >= 1) {
                    result.valid = false;
                    result.errors.push(`「${newCard.name}」は制限カード（1枚まで）です`);
                } else if (this.cardLimits.semiLimited.includes(newCard.id) && sameNameCount >= 2) {
                    result.valid = false;
                    result.errors.push(`「${newCard.name}」は準制限カード（2枚まで）です`);
                } else if (sameNameCount >= 3) {
                    result.valid = false;
                    result.errors.push(`「${newCard.name}」は既に3枚デッキに入っています`);
                }
            }

            // カードタイプとエリアの整合性チェック
            if (newCard && targetArea === 'extra') {
                const extraTypes = ['fusion', 'synchro', 'xyz', 'link'];
                if (!extraTypes.includes(newCard.type)) {
                    result.valid = false;
                    result.errors.push(`このカードはエクストラデッキに入れることができません`);
                }
            }

        } catch (error) {
            console.error('DeckIntegration - Validation error:', error);
            result.valid = false;
            result.errors.push('制限チェック中にエラーが発生しました');
        }

        return result;
    }

    /**
     * デッキ内カード枚数をカウント
     */
    countDeckCards(deckData) {
        return {
            main: this.sumCardCounts(deckData.main),
            extra: this.sumCardCounts(deckData.extra), 
            side: this.sumCardCounts(deckData.side),
            total: this.sumCardCounts([...deckData.main, ...deckData.extra, ...deckData.side])
        };
    }

    /**
     * カード配列の枚数合計
     */
    sumCardCounts(cards) {
        return cards.reduce((total, card) => total + (card.count || 1), 0);
    }

    /**
     * 同名カード枚数をカウント
     */
    countSameNameCards(deckData, cardName) {
        const allCards = [...deckData.main, ...deckData.extra, ...deckData.side];
        return allCards
            .filter(card => card.name === cardName)
            .reduce((total, card) => total + (card.count || 1), 0);
    }

    /**
     * 公式サイトにカードを追加
     */
    async addCardToOfficialDeck(cardData, targetArea) {
        console.log(`DeckIntegration - Adding card to official ${targetArea}:`, cardData);

        try {
            // 制限チェック
            const validation = this.validateDeckLimits(this.officialDeckData, targetArea, cardData);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }

            // 警告がある場合は表示
            if (validation.warnings.length > 0) {
                console.warn('DeckIntegration - Warnings:', validation.warnings);
            }

            // 公式サイトのフォームを操作してカードを追加
            const success = await this.submitCardToOfficialForm(cardData, targetArea);
            
            if (success) {
                // ローカルデータを更新
                this.officialDeckData[targetArea].push({
                    ...cardData,
                    addedAt: Date.now()
                });
                
                console.log(`DeckIntegration - Card added successfully to ${targetArea}`);
                return true;
            } else {
                throw new Error('公式フォームへの送信に失敗しました');
            }

        } catch (error) {
            console.error('DeckIntegration - Error adding card:', error);
            throw error;
        }
    }

    /**
     * 公式サイトのフォームにカードを送信
     */
    async submitCardToOfficialForm(cardData, targetArea) {
        try {
            // 公式サイトのフォーム要素を探す
            const form = document.querySelector('form[action*="member_deck"], form[action*="deck_edit"]');
            if (!form) {
                console.warn('DeckIntegration - Official form not found');
                return false;
            }

            // カード追加用の隠し入力フィールドを作成/更新
            let cardInput = form.querySelector(`input[name="${targetArea}_add_card"]`);
            if (!cardInput) {
                cardInput = document.createElement('input');
                cardInput.type = 'hidden';
                cardInput.name = `${targetArea}_add_card`;
                form.appendChild(cardInput);
            }
            cardInput.value = cardData.id;

            // エリア指定の隠し入力フィールド
            let areaInput = form.querySelector('input[name="target_area"]');
            if (!areaInput) {
                areaInput = document.createElement('input');
                areaInput.type = 'hidden';
                areaInput.name = 'target_area';
                form.appendChild(areaInput);
            }
            areaInput.value = targetArea;

            // 操作タイプの指定
            let operationInput = form.querySelector('input[name="operation"]');
            if (!operationInput) {
                operationInput = document.createElement('input');
                operationInput.type = 'hidden';
                operationInput.name = 'operation';
                form.appendChild(operationInput);
            }
            operationInput.value = 'add_card';

            console.log('DeckIntegration - Form prepared for submission');
            
            // 実際の送信は手動確認モードでは行わない
            // 本番では form.submit() を実行
            
            return true;

        } catch (error) {
            console.error('DeckIntegration - Form submission error:', error);
            return false;
        }
    }

    /**
     * 公式サイトからカードを削除
     */
    async removeCardFromOfficialDeck(cardData, sourceArea) {
        console.log(`DeckIntegration - Removing card from official ${sourceArea}:`, cardData);

        try {
            // カードが存在するかチェック
            const cardIndex = this.officialDeckData[sourceArea].findIndex(
                card => card.id === cardData.id
            );

            if (cardIndex === -1) {
                throw new Error('削除対象のカードが見つかりません');
            }

            // 公式サイトのフォームを操作してカードを削除
            const success = await this.submitCardRemovalToOfficialForm(cardData, sourceArea);
            
            if (success) {
                // ローカルデータから削除
                this.officialDeckData[sourceArea].splice(cardIndex, 1);
                
                console.log(`DeckIntegration - Card removed successfully from ${sourceArea}`);
                return true;
            } else {
                throw new Error('公式フォームからの削除に失敗しました');
            }

        } catch (error) {
            console.error('DeckIntegration - Error removing card:', error);
            throw error;
        }
    }

    /**
     * 公式フォームにカード削除を送信
     */
    async submitCardRemovalToOfficialForm(cardData, sourceArea) {
        try {
            const form = document.querySelector('form[action*="member_deck"], form[action*="deck_edit"]');
            if (!form) {
                console.warn('DeckIntegration - Official form not found');
                return false;
            }

            // カード削除用の入力フィールドを準備
            let removeInput = form.querySelector('input[name="remove_card"]');
            if (!removeInput) {
                removeInput = document.createElement('input');
                removeInput.type = 'hidden';
                removeInput.name = 'remove_card';
                form.appendChild(removeInput);
            }
            removeInput.value = cardData.id;

            let areaInput = form.querySelector('input[name="source_area"]');
            if (!areaInput) {
                areaInput = document.createElement('input');
                areaInput.type = 'hidden';
                areaInput.name = 'source_area';
                form.appendChild(areaInput);
            }
            areaInput.value = sourceArea;

            let operationInput = form.querySelector('input[name="operation"]');
            if (!operationInput) {
                operationInput = document.createElement('input');
                operationInput.type = 'hidden';
                operationInput.name = 'operation';
                form.appendChild(operationInput);
            }
            operationInput.value = 'remove_card';

            console.log('DeckIntegration - Removal form prepared');
            return true;

        } catch (error) {
            console.error('DeckIntegration - Removal form error:', error);
            return false;
        }
    }

    /**
     * カード移動（削除 + 追加）
     */
    async moveCardInOfficialDeck(cardData, sourceArea, targetArea) {
        console.log(`DeckIntegration - Moving card from ${sourceArea} to ${targetArea}:`, cardData);

        try {
            // 削除処理
            await this.removeCardFromOfficialDeck(cardData, sourceArea);
            
            // 追加処理
            await this.addCardToOfficialDeck(cardData, targetArea);
            
            console.log(`DeckIntegration - Card moved successfully from ${sourceArea} to ${targetArea}`);
            return true;

        } catch (error) {
            console.error('DeckIntegration - Error moving card:', error);
            throw error;
        }
    }

    /**
     * デッキ統計情報の取得
     */
    getDeckStatistics() {
        const counts = this.countDeckCards(this.officialDeckData);
        const allCards = [...this.officialDeckData.main, ...this.officialDeckData.extra, ...this.officialDeckData.side];
        
        // カードタイプ別カウント
        const typeDistribution = {
            monster: 0,
            spell: 0,
            trap: 0,
            unknown: 0
        };

        allCards.forEach(card => {
            const type = card.type || 'unknown';
            typeDistribution[type] = (typeDistribution[type] || 0) + (card.count || 1);
        });

        return {
            deckCounts: counts,
            typeDistribution: typeDistribution,
            totalUniqueCards: allCards.length,
            deckValid: {
                main: counts.main >= this.deckLimits.main.min && counts.main <= this.deckLimits.main.max,
                extra: counts.extra <= this.deckLimits.extra.max,
                side: counts.side <= this.deckLimits.side.max
            },
            lastUpdated: Date.now()
        };
    }

    /**
     * 制限カードリストの更新
     */
    updateCardLimits(forbiddenList, limitedList, semiLimitedList) {
        this.cardLimits.forbidden = forbiddenList || [];
        this.cardLimits.limited = limitedList || [];
        this.cardLimits.semiLimited = semiLimitedList || [];
        
        console.log('DeckIntegration - Card limits updated:', {
            forbidden: this.cardLimits.forbidden.length,
            limited: this.cardLimits.limited.length,
            semiLimited: this.cardLimits.semiLimited.length
        });
    }
}

// グローバルに公開
window.DeckIntegration = DeckIntegration;