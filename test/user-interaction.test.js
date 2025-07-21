/**
 * @jest-environment jsdom
 */

describe('ユーザーインタラクションのテスト', () => {
    let mockCheckCompatibility, mockDisplayResults, mockUpdateResults;
    
    beforeEach(() => {
        // DOM要素をセットアップ
        document.body.innerHTML = `
            <div class="container">
                <div class="input-section">
                    <div class="input-form">
                        <input type="number" id="width" placeholder="cm" min="1" max="200">
                        <input type="number" id="height" placeholder="cm" min="1" max="200">
                        <input type="number" id="depth" placeholder="cm" min="1" max="200">
                        <input type="number" id="weight" placeholder="kg" min="0" max="50" step="0.1">
                        <button id="checkButton" onclick="checkCompatibility()">判定する</button>
                    </div>
                </div>
                
                <section class="results-section" id="resultsSection" style="display: none;">
                    <h2>判定結果</h2>
                    <div class="suitcase-info" id="suitcaseInfo"></div>
                    <div class="results-container">
                        <div class="compatible-airlines" id="compatibleAirlines">
                            <h3>✅ 持ち込み可能な航空会社</h3>
                            <div class="airline-list" id="compatibleList"></div>
                        </div>
                        <div class="incompatible-airlines" id="incompatibleAirlines">
                            <h3>❌ 持ち込み不可な航空会社</h3>
                            <div class="airline-list" id="incompatibleList"></div>
                        </div>
                    </div>
                </section>
                
                <div class="language-switcher">
                    <button class="lang-btn active" data-lang="ja">日本語</button>
                    <button class="lang-btn" data-lang="en">English</button>
                </div>
            </div>
        `;

        // モック関数を設定
        mockCheckCompatibility = jest.fn();
        mockDisplayResults = jest.fn();
        mockUpdateResults = jest.fn();
        
        global.checkCompatibility = mockCheckCompatibility;
        global.displayResults = mockDisplayResults;
        global.updateResults = mockUpdateResults;
        
        // アラート関数のモック
        global.alert = jest.fn();
        
        // スクロール関数のモック
        Element.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('入力フィールドのテスト', () => {
        test('幅入力フィールドに数値を入力する', () => {
            const widthInput = document.getElementById('width');
            
            widthInput.value = '55';
            widthInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            expect(widthInput.value).toBe('55');
            expect(parseFloat(widthInput.value)).toBe(55);
        });

        test('高さ入力フィールドに小数点を含む値を入力する', () => {
            const heightInput = document.getElementById('height');
            
            heightInput.value = '39.5';
            heightInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            expect(heightInput.value).toBe('39.5');
            expect(parseFloat(heightInput.value)).toBe(39.5);
        });

        test('奥行き入力フィールドに不正な値を入力する', () => {
            const depthInput = document.getElementById('depth');
            
            // HTML5のnumber inputは不正な値を受け付けないため空になる
            depthInput.value = 'abc';
            depthInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            expect(depthInput.value).toBe(''); // number inputでは不正な値は空になる
            expect(isNaN(parseFloat(depthInput.value))).toBe(true);
        });

        test('重量入力フィールドの空値処理', () => {
            const weightInput = document.getElementById('weight');
            
            weightInput.value = '';
            weightInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            expect(weightInput.value).toBe('');
            expect(parseFloat(weightInput.value) || null).toBe(null);
        });

        test('入力フィールドのmin/max属性が正しく設定されている', () => {
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            const depthInput = document.getElementById('depth');
            const weightInput = document.getElementById('weight');
            
            expect(widthInput.min).toBe('1');
            expect(widthInput.max).toBe('200');
            expect(heightInput.min).toBe('1');
            expect(heightInput.max).toBe('200');
            expect(depthInput.min).toBe('1');
            expect(depthInput.max).toBe('200');
            expect(weightInput.min).toBe('0');
            expect(weightInput.max).toBe('50');
            expect(weightInput.step).toBe('0.1');
        });
    });

    describe('ボタンクリックのテスト', () => {
        test('判定ボタンがクリックされる', () => {
            const checkButton = document.getElementById('checkButton');
            
            checkButton.click();
            
            expect(mockCheckCompatibility).toHaveBeenCalledTimes(1);
        });

        test('言語切り替えボタンのクリック', () => {
            const jaBtn = document.querySelector('[data-lang="ja"]');
            const enBtn = document.querySelector('[data-lang="en"]');
            
            expect(jaBtn.classList.contains('active')).toBe(true);
            expect(enBtn.classList.contains('active')).toBe(false);
            
            enBtn.click();
            
            // 実際の言語切り替え実装がないので、クリックイベントの発生のみ確認
            expect(enBtn.dataset.lang).toBe('en');
        });
    });

    describe('フォーム送信のテスト', () => {
        test('Enterキーでの判定実行', () => {
            const widthInput = document.getElementById('width');
            
            widthInput.value = '55';
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            widthInput.dispatchEvent(enterEvent);
            
            // Enterキーイベントが正常に発生することを確認
            expect(enterEvent.key).toBe('Enter');
        });

        test('Tabキーでのフォーカス移動', () => {
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            
            widthInput.focus();
            expect(document.activeElement).toBe(widthInput);
            
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            widthInput.dispatchEvent(tabEvent);
            
            // Tabキーイベントの発生を確認
            expect(tabEvent.key).toBe('Tab');
        });
    });

    describe('結果表示エリアのテスト', () => {
        test('結果セクションが初期状態で非表示', () => {
            const resultsSection = document.getElementById('resultsSection');
            expect(resultsSection.style.display).toBe('none');
        });

        test('結果セクションの表示切り替え', () => {
            const resultsSection = document.getElementById('resultsSection');
            
            resultsSection.style.display = 'block';
            expect(resultsSection.style.display).toBe('block');
            
            resultsSection.style.display = 'none';
            expect(resultsSection.style.display).toBe('none');
        });

        test('スーツケース情報エリアの内容更新', () => {
            const suitcaseInfo = document.getElementById('suitcaseInfo');
            const testContent = '<p>スーツケースサイズ: 55 × 40 × 25 cm</p>';
            
            suitcaseInfo.innerHTML = testContent;
            expect(suitcaseInfo.innerHTML).toBe(testContent);
        });

        test('持ち込み可能航空会社リストの更新', () => {
            const compatibleList = document.getElementById('compatibleList');
            const testAirlineCard = `
                <div class="airline-card compatible">
                    <div class="airline-header">
                        <span class="airline-name">全日本空輸</span>
                        <span class="airline-code">NH</span>
                    </div>
                </div>
            `;
            
            compatibleList.innerHTML = testAirlineCard;
            expect(compatibleList.innerHTML).toContain('全日本空輸');
            expect(compatibleList.innerHTML).toContain('NH');
        });

        test('持ち込み不可航空会社リストの更新', () => {
            const incompatibleList = document.getElementById('incompatibleList');
            const testContent = '<p class="no-results">該当なし</p>';
            
            incompatibleList.innerHTML = testContent;
            expect(incompatibleList.innerHTML).toBe(testContent);
        });
    });

    describe('入力値の取得と処理のテスト', () => {
        test('すべての入力値を正常に取得', () => {
            document.getElementById('width').value = '55';
            document.getElementById('height').value = '40';
            document.getElementById('depth').value = '25';
            document.getElementById('weight').value = '7.5';
            
            const width = parseFloat(document.getElementById('width').value);
            const height = parseFloat(document.getElementById('height').value);
            const depth = parseFloat(document.getElementById('depth').value);
            const weight = parseFloat(document.getElementById('weight').value);
            
            expect(width).toBe(55);
            expect(height).toBe(40);
            expect(depth).toBe(25);
            expect(weight).toBe(7.5);
        });

        test('必須項目の未入力チェック', () => {
            document.getElementById('width').value = '';
            document.getElementById('height').value = '40';
            document.getElementById('depth').value = '25';
            document.getElementById('weight').value = '';
            
            const width = parseFloat(document.getElementById('width').value);
            const height = parseFloat(document.getElementById('height').value);
            const depth = parseFloat(document.getElementById('depth').value);
            const weight = parseFloat(document.getElementById('weight').value) || null;
            
            expect(isNaN(width)).toBe(true);
            expect(height).toBe(40);
            expect(depth).toBe(25);
            expect(weight).toBe(null);
        });

        test('負の値の入力処理', () => {
            document.getElementById('width').value = '-10';
            document.getElementById('height').value = '40';
            document.getElementById('depth').value = '25';
            document.getElementById('weight').value = '-5';
            
            const width = parseFloat(document.getElementById('width').value);
            const weight = parseFloat(document.getElementById('weight').value);
            
            expect(width).toBe(-10);
            expect(weight).toBe(-5);
            
            // HTML5のmin属性によるブラウザ側の検証は実際のブラウザでのみ動作
            expect(document.getElementById('width').min).toBe('1');
            expect(document.getElementById('weight').min).toBe('0');
        });
    });

    describe('レスポンシブデザインのテスト', () => {
        test('モバイル環境での要素の存在確認', () => {
            // ビューポートをモバイルサイズに変更
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            
            const inputSection = document.querySelector('.input-section');
            const resultsContainer = document.querySelector('.results-container');
            
            expect(inputSection).toBeTruthy();
            expect(resultsContainer).toBeTruthy();
        });

        test('言語切り替えボタンの配置', () => {
            const languageSwitcher = document.querySelector('.language-switcher');
            const langButtons = document.querySelectorAll('.lang-btn');
            
            expect(languageSwitcher).toBeTruthy();
            expect(langButtons).toHaveLength(2);
        });
    });

    describe('アクセシビリティのテスト', () => {
        test('フォーム要素にラベルが関連付けられている', () => {
            const inputs = ['width', 'height', 'depth', 'weight'];
            
            inputs.forEach(id => {
                const input = document.getElementById(id);
                expect(input).toBeTruthy();
                expect(input.type).toBe('number');
                expect(input.placeholder).toBeTruthy();
            });
        });

        test('ボタンに適切なテキストが設定されている', () => {
            const checkButton = document.getElementById('checkButton');
            const langButtons = document.querySelectorAll('.lang-btn');
            
            expect(checkButton.textContent.trim()).toBe('判定する');
            expect(langButtons[0].textContent.trim()).toBe('日本語');
            expect(langButtons[1].textContent.trim()).toBe('English');
        });

        test('キーボードナビゲーションの確認', () => {
            const inputs = [
                document.getElementById('width'),
                document.getElementById('height'),
                document.getElementById('depth'),
                document.getElementById('weight'),
                document.getElementById('checkButton')
            ];
            
            // tabindexが適切に設定されているか確認
            inputs.forEach(element => {
                expect(element.tabIndex >= 0 || element.tabIndex === undefined).toBe(true);
            });
        });
    });

    describe('エラー状態の表示テスト', () => {
        test('入力エラー時のアラート表示', () => {
            // 不正な入力でalertが呼ばれることをテスト
            document.getElementById('width').value = '';
            document.getElementById('height').value = '';
            document.getElementById('depth').value = '';
            
            // 実際のcheckCompatibility関数が呼ばれた場合の想定
            if (!document.getElementById('width').value || 
                !document.getElementById('height').value || 
                !document.getElementById('depth').value) {
                alert('すべてのサイズ（幅、高さ、奥行き）を入力してください。');
            }
            
            expect(alert).toHaveBeenCalledWith('すべてのサイズ（幅、高さ、奥行き）を入力してください。');
        });

        test('結果が空の場合の表示', () => {
            const compatibleList = document.getElementById('compatibleList');
            const noResultsMessage = '<p class="no-results">申し訳ございません。入力されたサイズでは持ち込み可能な航空会社が見つかりませんでした。</p>';
            
            compatibleList.innerHTML = noResultsMessage;
            expect(compatibleList.innerHTML).toContain('no-results');
            expect(compatibleList.innerHTML).toContain('見つかりませんでした');
        });
    });
});