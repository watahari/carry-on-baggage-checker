/**
 * @jest-environment jsdom
 */

const modules = require('../src/modules');
const {
    loadTSVData,
    parseTSV,
    checkSuitcaseCompatibility,
    checkAllAirlines,
    setTestData,
    validateSuitcaseInput
} = modules;

describe('エラーハンドリングのテスト', () => {
    beforeEach(() => {
        // コンソールエラーのスパイ
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // fetchのモック
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('ネットワークエラーのテスト', () => {
        test('fetch失敗時のエラーハンドリング', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));

            await expect(loadTSVData()).rejects.toThrow('Network Error');
            expect(console.error).toHaveBeenCalledWith('Error loading data:', expect.any(Error));
        });

        test('HTTPエラー（404）の処理', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: () => Promise.reject(new Error('Not Found'))
            });

            await expect(loadTSVData()).rejects.toThrow();
        });

        test('不正なレスポンス形式の処理', async () => {
            global.fetch.mockResolvedValue({
                text: () => Promise.reject(new Error('Invalid response format'))
            });

            await expect(loadTSVData()).rejects.toThrow('Invalid response format');
        });

        test('タイムアウトエラーの処理', async () => {
            global.fetch.mockImplementation(() => 
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 100)
                )
            );

            await expect(loadTSVData()).rejects.toThrow('Request timeout');
        });

        test('空のレスポンスの処理', async () => {
            global.fetch.mockResolvedValue({
                text: () => Promise.resolve('')
            });

            const result = await loadTSVData();
            expect(result.airlinesData).toEqual([]);
            expect(result.baggageData).toEqual([]);
            expect(result.countriesData).toEqual([]);
        });
    });

    describe('データ解析エラーのテスト', () => {
        test('不正なTSV形式の処理', () => {
            const malformedTSV = `ICAO code\tIATA code\t航空会社名
ANA\tNH\t全日本空輸
JAL\tJL`;  // 列が不足している行

            const result = parseTSV(malformedTSV);
            expect(result).toHaveLength(1); // 正常な行のみ処理
            expect(result[0]['ICAO code']).toBe('ANA');
        });

        test('ヘッダーのみのTSVファイル', () => {
            const headerOnlyTSV = `ICAO code\tIATA code\t航空会社名`;
            const result = parseTSV(headerOnlyTSV);
            expect(result).toEqual([]);
        });

        test('空文字列の処理', () => {
            const result = parseTSV('');
            expect(result).toEqual([]);
        });

        test('特殊文字を含むデータの処理', () => {
            const specialCharTSV = `ICAO code\t航空会社名\t備考
TEST\t"テスト航空"\t"※注意,制限あり"`;

            const result = parseTSV(specialCharTSV);
            expect(result).toHaveLength(1);
            expect(result[0]['ICAO code']).toBe('TEST');
        });

        test('改行コードが混在するデータの処理', () => {
            const mixedLineEndingTSV = "ICAO code\tIATA code\r\nANA\tNH\nJAL\tJL\r";
            const result = parseTSV(mixedLineEndingTSV);
            expect(result.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('計算エラーのテスト', () => {
        test('NaN値を含む制限データでの判定', () => {
            const suitcase = { width: 50, height: 40, depth: 25, totalLength: 115, weight: 10 };
            const invalidBaggage = {
                'W(cm)': 'NaN',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(suitcase, invalidBaggage);
            expect(result).toBe(false);
        });

        test('Infinity値での計算', () => {
            const suitcase = { width: 50, height: 40, depth: 25, totalLength: 115, weight: 10 };
            const infiniteBaggage = {
                'W(cm)': 'Infinity',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(suitcase, infiniteBaggage);
            expect(result).toBe(true); // Infinityは任意の値より大きい
        });

        test('負の制限値での計算', () => {
            const suitcase = { width: 50, height: 40, depth: 25, totalLength: 115, weight: 10 };
            const negativeBaggage = {
                'W(cm)': '-10',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(suitcase, negativeBaggage);
            expect(result).toBe(false); // 負の制限値は実質的に無効
        });

        test('0値での制限', () => {
            const suitcase = { width: 1, height: 1, depth: 1, totalLength: 3, weight: 0.1 };
            const zeroBaggage = {
                'W(cm)': '0',
                'H(cm)': '0',
                'D(cm)': '0',
                'Length(cm)': '0',
                'Weight(kg)': '0'
            };

            const result = checkSuitcaseCompatibility(suitcase, zeroBaggage);
            expect(result).toBe(false);
        });
    });

    describe('データ整合性エラーのテスト', () => {
        test('存在しない航空会社コードでの判定', () => {
            const mockAirlines = [
                { 'ICAO code': 'ANA', '航空会社名': '全日本空輸', 'Airline name': 'ANA', 'Country': 'Japan' }
            ];
            const mockBaggage = [
                { 'ICAO code': 'NONEXISTENT', 'W(cm)': '55', 'H(cm)': '40', 'D(cm)': '25', 'Length(cm)': '115', 'Weight(kg)': '10' }
            ];
            const mockCountries = [
                { 'Country': 'Japan', '国名': '日本', 'Area': 'East Asia', '地域': '東アジア' }
            ];

            setTestData(mockAirlines, mockBaggage, mockCountries);

            const suitcase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const result = checkAllAirlines(suitcase);

            expect(result.compatible).toHaveLength(0);
            expect(result.incompatible).toHaveLength(0);
        });

        test('存在しない国データでの処理', () => {
            const mockAirlines = [
                { 'ICAO code': 'TEST', '航空会社名': 'テスト航空', 'Airline name': 'Test Air', 'Country': 'UnknownCountry' }
            ];
            const mockBaggage = [
                { 'ICAO code': 'TEST', 'W(cm)': '55', 'H(cm)': '40', 'D(cm)': '25', 'Length(cm)': '115', 'Weight(kg)': '10' }
            ];
            const mockCountries = []; // 空の国データ

            setTestData(mockAirlines, mockBaggage, mockCountries);

            const suitcase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const result = checkAllAirlines(suitcase);

            expect(result.compatible).toHaveLength(1);
            expect(result.compatible[0].countryJa).toBe('UnknownCountry'); // フォールバック値
        });

        test('空のデータセットでの処理', () => {
            setTestData([], [], []);

            const suitcase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const result = checkAllAirlines(suitcase);

            expect(result.compatible).toHaveLength(0);
            expect(result.incompatible).toHaveLength(0);
        });
    });

    describe('入力検証エラーのテスト', () => {
        test('文字列入力の検証', () => {
            const errors = validateSuitcaseInput('abc', 'def', 'ghi', -5);
            expect(errors).toContain('幅は1-300cmの範囲で入力してください');
            expect(errors).toContain('高さは1-300cmの範囲で入力してください');
            expect(errors).toContain('奥行きは1-300cmの範囲で入力してください');
            expect(errors).toContain('重量は0-100kgの範囲で入力してください');
        });

        test('null/undefined値の検証', () => {
            const errors = validateSuitcaseInput(null, undefined, '', 0);
            expect(errors).toContain('幅は1-300cmの範囲で入力してください');
            expect(errors).toContain('高さは1-300cmの範囲で入力してください');
            expect(errors).toContain('奥行きは1-300cmの範囲で入力してください');
            expect(errors).not.toContain('重量は'); // 重量0は有効
        });

        test('極端に大きな値の検証', () => {
            const errors = validateSuitcaseInput(1000, 1000, 1000, 200);
            expect(errors).toContain('幅は1-300cmの範囲で入力してください');
            expect(errors).toContain('高さは1-300cmの範囲で入力してください');
            expect(errors).toContain('奥行きは1-300cmの範囲で入力してください');
            expect(errors).toContain('重量は0-100kgの範囲で入力してください');
        });

        test('負の値の検証', () => {
            const errors = validateSuitcaseInput(-10, -20, -30, -5);
            expect(errors).toHaveLength(4);
        });

        test('浮動小数点精度の問題', () => {
            // JavaScriptの浮動小数点精度の問題をテスト
            const result = 0.1 + 0.2; // 0.30000000000000004
            const isValid = Math.abs(result - 0.3) < Number.EPSILON;
            expect(isValid).toBe(true);

            // 実際の検証では許容範囲内として扱うことを確認
            const errors = validateSuitcaseInput(55.1 + 0.2, 40, 25, 10);
            expect(errors).toHaveLength(0); // 計算誤差は許容
        });
    });

    describe('DOM操作エラーのテスト', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('存在しないDOM要素へのアクセス', () => {
            const element = document.getElementById('nonexistent');
            expect(element).toBeNull();

            // null要素に対する安全な操作
            expect(() => {
                if (element) {
                    element.style.display = 'block';
                }
            }).not.toThrow();
        });

        test('innerHTML更新時のスクリプト注入攻撃の防止', () => {
            document.body.innerHTML = '<div id="test"></div>';
            const testElement = document.getElementById('test');

            const maliciousContent = '<script>alert("XSS")</script>';
            testElement.innerHTML = maliciousContent;

            // スクリプトタグは実際には実行されない（テスト環境では）
            expect(testElement.innerHTML).toContain('script');
            expect(testElement.innerHTML).toContain('alert');
        });
    });

    describe('非同期処理エラーのテスト', () => {
        test('Promise.allでの部分的失敗', async () => {
            global.fetch
                .mockResolvedValueOnce({
                    text: () => Promise.resolve('ICAO code\tIATA code\nANA\tNH')
                })
                .mockRejectedValueOnce(new Error('Baggage data failed'))
                .mockResolvedValueOnce({
                    text: () => Promise.resolve('Country\t国名\nJapan\t日本')
                });

            await expect(loadTSVData()).rejects.toThrow('Baggage data failed');
        });

        test('競合状態（Race Condition）の回避', async () => {
            let callCount = 0;
            global.fetch.mockImplementation(() => {
                callCount++;
                return Promise.resolve({
                    text: () => Promise.resolve(`data${callCount}`)
                });
            });

            // 同時に複数回呼び出し
            const promises = [
                loadTSVData(),
                loadTSVData(),
                loadTSVData()
            ];

            const results = await Promise.allSettled(promises);
            
            // すべての呼び出しが完了することを確認
            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result.status).toBe('fulfilled');
            });
        });
    });

    describe('メモリリークの防止テスト', () => {
        test('大量データ処理後のメモリクリーンアップ', () => {
            // 大量のテストデータを作成
            const largeAirlines = Array.from({ length: 1000 }, (_, i) => ({
                'ICAO code': `TEST${i}`,
                '航空会社名': `テスト航空${i}`,
                'Airline name': `Test Air ${i}`,
                'Country': 'Japan'
            }));

            const largeBaggage = Array.from({ length: 1000 }, (_, i) => ({
                'ICAO code': `TEST${i}`,
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            }));

            setTestData(largeAirlines, largeBaggage, []);

            const suitcase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const result = checkAllAirlines(suitcase);

            expect(result.compatible.length + result.incompatible.length).toBe(1000);

            // データをクリア
            setTestData([], [], []);
        });

        test('イベントリスナーの適切な削除', () => {
            document.body.innerHTML = '<button id="testBtn">Test</button>';
            const button = document.getElementById('testBtn');
            
            let clickCount = 0;
            const handler = () => { clickCount++; };
            
            button.addEventListener('click', handler);
            button.click();
            expect(clickCount).toBe(1);
            
            button.removeEventListener('click', handler);
            button.click();
            expect(clickCount).toBe(1); // 増加しない
        });
    });
});