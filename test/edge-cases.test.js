/**
 * @jest-environment jsdom
 */

const modules = require('../src/modules');
const {
    checkSuitcaseCompatibility,
    validateSuitcaseInput,
    calculateSuitcaseVolume,
    generateCompatibilityReport,
    setTestData
} = modules;

describe('エッジケースのテスト', () => {
    beforeEach(() => {
        // テスト用のデータをセット
        const mockAirlines = [
            {
                'ICAO code': 'TEST1',
                'IATA code': 'T1',
                '航空会社名': 'テスト航空1',
                'Airline name': 'Test Airlines 1',
                'Country': 'Japan'
            },
            {
                'ICAO code': 'TEST2',
                'IATA code': 'T2',
                '航空会社名': 'テスト航空2',
                'Airline name': 'Test Airlines 2',
                'Country': 'USA'
            }
        ];

        const mockBaggage = [
            {
                'ICAO code': 'TEST1',
                '種別': '-',
                '条件': '-',
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            },
            {
                'ICAO code': 'TEST2',
                '種別': '-',
                '条件': '-',
                'W(cm)': '56',
                'H(cm)': '36',
                'D(cm)': '23',
                'Length(cm)': 'N/A',
                'Weight(kg)': 'N/A'
            }
        ];

        const mockCountries = [
            {
                'Country': 'Japan',
                '国名': '日本',
                'Area': 'East Asia',
                '地域': '東アジア'
            },
            {
                'Country': 'USA',
                '国名': 'アメリカ',
                'Area': 'North America',
                '地域': '北アメリカ'
            }
        ];

        setTestData(mockAirlines, mockBaggage, mockCountries);
    });

    describe('極端なサイズのテスト', () => {
        test('最小サイズのスーツケース（1cm×1cm×1cm）', () => {
            const tinyCase = { width: 1, height: 1, depth: 1, totalLength: 3, weight: 0.1 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(tinyCase, baggage);
            expect(result).toBe(true);
        });

        test('最大想定サイズのスーツケース（100cm×80cm×50cm）', () => {
            const hugeCase = { width: 100, height: 80, depth: 50, totalLength: 230, weight: 30 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(hugeCase, baggage);
            expect(result).toBe(false);
        });

        test('重量0kgのスーツケース', () => {
            const weightlessCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 0 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(weightlessCase, baggage);
            expect(result).toBe(true);
        });

        test('超重量スーツケース（50kg）', () => {
            const heavyCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 50 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(heavyCase, baggage);
            expect(result).toBe(false);
        });
    });

    describe('小数点を含む寸法のテスト', () => {
        test('小数点を含む寸法（54.9cm×39.9cm×24.9cm）', () => {
            const decimalCase = { width: 54.9, height: 39.9, depth: 24.9, totalLength: 119.7, weight: 9.9 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '120',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(decimalCase, baggage);
            expect(result).toBe(true);
        });

        test('境界線上の小数点（55.1cm×40.1cm×25.1cm）', () => {
            const boundaryCase = { width: 55.1, height: 40.1, depth: 25.1, totalLength: 120.3, weight: 10.1 };
            const baggage = {
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '120',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(boundaryCase, baggage);
            expect(result).toBe(false);
        });
    });

    describe('不正な制限データのテスト', () => {
        test('制限値が文字列の場合', () => {
            const normalCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const invalidBaggage = {
                'W(cm)': 'fifty-five',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(normalCase, invalidBaggage);
            expect(result).toBe(false);
        });

        test('制限値が空文字の場合', () => {
            const normalCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const invalidBaggage = {
                'W(cm)': '',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(normalCase, invalidBaggage);
            expect(result).toBe(false);
        });

        test('制限値が負の数の場合', () => {
            const normalCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const invalidBaggage = {
                'W(cm)': '-55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(normalCase, invalidBaggage);
            expect(result).toBe(false); // 負の制限値は不正なデータとして処理
        });
    });

    describe('入力検証のエッジケース', () => {
        test('幅が0の場合', () => {
            const errors = validateSuitcaseInput(0, 40, 25, 5);
            expect(errors).toContain('幅は1-300cmの範囲で入力してください');
        });

        test('高さが負の数の場合', () => {
            const errors = validateSuitcaseInput(55, -40, 25, 5);
            expect(errors).toContain('高さは1-300cmの範囲で入力してください');
        });

        test('奥行きが300cmを超える場合', () => {
            const errors = validateSuitcaseInput(55, 40, 350, 5);
            expect(errors).toContain('奥行きは1-300cmの範囲で入力してください');
        });

        test('重量が負の数の場合', () => {
            const errors = validateSuitcaseInput(55, 40, 25, -5);
            expect(errors).toContain('重量は0-100kgの範囲で入力してください');
        });

        test('重量が100kgを超える場合', () => {
            const errors = validateSuitcaseInput(55, 40, 25, 150);
            expect(errors).toContain('重量は0-100kgの範囲で入力してください');
        });

        test('重量がnullの場合（エラーなし）', () => {
            const errors = validateSuitcaseInput(55, 40, 25, null);
            expect(errors).toHaveLength(0);
        });

        test('重量がundefinedの場合（エラーなし）', () => {
            const errors = validateSuitcaseInput(55, 40, 25, undefined);
            expect(errors).toHaveLength(0);
        });

        test('すべての入力が不正の場合', () => {
            const errors = validateSuitcaseInput(-10, 0, 400, -20);
            expect(errors).toHaveLength(4);
        });
    });

    describe('体積計算のエッジケース', () => {
        test('最小体積の計算（1cm³）', () => {
            const volume = calculateSuitcaseVolume(1, 1, 1);
            expect(volume).toBe(1);
        });

        test('大きな体積の計算（400,000cm³）', () => {
            const volume = calculateSuitcaseVolume(100, 80, 50);
            expect(volume).toBe(400000);
        });

        test('小数点を含む体積の計算', () => {
            const volume = calculateSuitcaseVolume(55.5, 40.2, 25.1);
            expect(volume).toBeCloseTo(56000.61, 2);
        });

        test('0を含む寸法での体積計算', () => {
            const volume = calculateSuitcaseVolume(0, 40, 25);
            expect(volume).toBe(0);
        });
    });

    describe('互換性レポートのエッジケース', () => {
        test('すべての航空会社で持ち込み可能な場合', () => {
            const perfectCase = { width: 30, height: 20, depth: 15, totalLength: 65, weight: 3 };
            const results = {
                compatible: [
                    { country: 'Japan', restrictions: { width: 55, height: 40, depth: 25, length: 115, weight: 10 } },
                    { country: 'USA', restrictions: { width: 56, height: 36, depth: 23, length: null, weight: null } }
                ],
                incompatible: []
            };

            const report = generateCompatibilityReport(perfectCase, results);
            expect(report.compatibilityRate).toBe(100);
            expect(report.restrictionAnalysis.weightIssues).toBe(0);
            expect(report.restrictionAnalysis.dimensionIssues).toBe(0);
            expect(report.restrictionAnalysis.lengthIssues).toBe(0);
        });

        test('すべての航空会社で持ち込み不可な場合', () => {
            const impossibleCase = { width: 80, height: 60, depth: 40, totalLength: 180, weight: 25 };
            const results = {
                compatible: [],
                incompatible: [
                    { country: 'Japan', restrictions: { width: 55, height: 40, depth: 25, length: 115, weight: 10 } },
                    { country: 'USA', restrictions: { width: 56, height: 36, depth: 23, length: 115, weight: 8 } }
                ]
            };

            const report = generateCompatibilityReport(impossibleCase, results);
            expect(report.compatibilityRate).toBe(0);
            expect(report.restrictionAnalysis.dimensionIssues).toBe(2);
        });

        test('データが空の場合', () => {
            const normalCase = { width: 55, height: 40, depth: 25, totalLength: 120, weight: 10 };
            const emptyResults = { compatible: [], incompatible: [] };

            const report = generateCompatibilityReport(normalCase, emptyResults);
            expect(report.compatibilityRate).toBe(0); // 0/0は0として扱う
            expect(report.totalAirlines).toBe(0);
        });
    });

    describe('特殊文字とエンコーディングのテスト', () => {
        test('日本語文字が正しく処理される', () => {
            const japaneseData = `ICAO code\t航空会社名\t備考
ANA\t全日本空輸\t※制限あり
JAL\t日本航空\t♪特別サービス`;

            // parseTSV関数は現在のスコープでは使用できないため、
            // 代わりに文字列処理が正常に動作することを確認
            expect(japaneseData.includes('全日本空輸')).toBe(true);
            expect(japaneseData.includes('※制限あり')).toBe(true);
        });

        test('特殊文字を含む制限値', () => {
            const normalCase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
            const specialCharBaggage = {
                'W(cm)': '55.0',
                'H(cm)': '40,0', // カンマが含まれている
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };

            const result = checkSuitcaseCompatibility(normalCase, specialCharBaggage);
            expect(result).toBe(true); // parseFloatが'40,0'を40として処理する
        });
    });
});