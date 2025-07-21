/**
 * @jest-environment jsdom
 */

const { 
    parseTSV, 
    checkSuitcaseCompatibility,
    createMockSuitcase,
    createMockBaggage
} = require('./test-utils');

describe('統合テスト', () => {
    let mockAirlinesData, mockBaggageData, mockCountriesData;

    beforeEach(() => {
        // テスト用のモックデータセット
        mockAirlinesData = [
            {
                'ICAO code': 'ANA',
                'IATA code': 'NH',
                '航空会社名': '全日本空輸',
                'Airline name': 'All Nippon Airways',
                'Country': 'Japan'
            },
            {
                'ICAO code': 'JAL',
                'IATA code': 'JL',
                '航空会社名': '日本航空',
                'Airline name': 'Japan Airlines',
                'Country': 'Japan'
            },
            {
                'ICAO code': 'APJ',
                'IATA code': 'MM',
                '航空会社名': 'ピーチ・アビエーション',
                'Airline name': 'Peach Aviation',
                'Country': 'Japan'
            }
        ];

        mockBaggageData = [
            createMockBaggage('ANA', 55, 40, 25, 115, 10, '国際', '-'),
            createMockBaggage('ANA', 45, 35, 20, 110, 10, '国内', '100席未満'),
            createMockBaggage('JAL', 55, 40, 25, 115, 10, '国際', '-'),
            createMockBaggage('APJ', 55, 40, 25, 115, 7, '-', '-')
        ];

        mockCountriesData = [
            {
                'Country': 'Japan',
                '国名': '日本',
                'Area': 'East Asia',
                '地域': '東アジア'
            }
        ];
    });

    describe('エンドツーエンドのシナリオテスト', () => {
        test('標準的なキャリーケースで複数航空会社を判定する', () => {
            const standardSuitcase = createMockSuitcase(50, 35, 20, 6); // 105cm, 6kg
            
            const results = {
                compatible: [],
                incompatible: []
            };

            mockBaggageData.forEach(baggage => {
                const airline = mockAirlinesData.find(a => a['ICAO code'] === baggage['ICAO code']);
                const country = mockCountriesData.find(c => c['Country'] === airline['Country']);
                const isCompatible = checkSuitcaseCompatibility(standardSuitcase, baggage);

                const result = {
                    icao: baggage['ICAO code'],
                    nameJa: airline['航空会社名'],
                    nameEn: airline['Airline name'],
                    type: baggage['種別'],
                    condition: baggage['条件'],
                    isCompatible
                };

                if (isCompatible) {
                    results.compatible.push(result);
                } else {
                    results.incompatible.push(result);
                }
            });

            // 標準的なスーツケースは大部分の航空会社で持ち込み可能なはず
            expect(results.compatible.length).toBeGreaterThan(0);
            
            // ANA国際線、JAL国際線、ピーチは持ち込み可能
            const anaIntl = results.compatible.find(r => r.icao === 'ANA' && r.type === '国際');
            const jalIntl = results.compatible.find(r => r.icao === 'JAL' && r.type === '国際');
            const peach = results.compatible.find(r => r.icao === 'APJ');
            
            expect(anaIntl).toBeDefined();
            expect(jalIntl).toBeDefined();
            expect(peach).toBeDefined();

            // ANA国内線100席未満は持ち込み不可になる可能性が高い
            const anaDomestic = results.incompatible.find(r => r.icao === 'ANA' && r.type === '国内');
            expect(anaDomestic).toBeDefined();
        });

        test('大型スーツケースで制限に引っかかるケース', () => {
            const largeSuitcase = createMockSuitcase(60, 45, 30, 12); // 135cm, 12kg
            
            const results = mockBaggageData.map(baggage => {
                const isCompatible = checkSuitcaseCompatibility(largeSuitcase, baggage);
                return { icao: baggage['ICAO code'], type: baggage['種別'], isCompatible };
            });

            // すべての航空会社で持ち込み不可になるはず
            const compatibleCount = results.filter(r => r.isCompatible).length;
            expect(compatibleCount).toBe(0);
        });

        test('重量制限に引っかかるケース（ピーチ航空）', () => {
            const heavySuitcase = createMockSuitcase(50, 35, 20, 8); // 105cm, 8kg（ピーチは7kg制限）
            
            const peachBaggage = mockBaggageData.find(b => b['ICAO code'] === 'APJ');
            const anaBaggage = mockBaggageData.find(b => b['ICAO code'] === 'ANA' && b['種別'] === '国際');
            
            const peachCompatible = checkSuitcaseCompatibility(heavySuitcase, peachBaggage);
            const anaCompatible = checkSuitcaseCompatibility(heavySuitcase, anaBaggage);
            
            // ピーチ（7kg制限）は不可、ANA（10kg制限）は可能
            expect(peachCompatible).toBe(false);
            expect(anaCompatible).toBe(true);
        });

        test('機材サイズによる制限の違い', () => {
            const mediumSuitcase = createMockSuitcase(50, 38, 22, 8); // 110cm, 8kg
            
            const anaLarge = mockBaggageData.find(b => b['ICAO code'] === 'ANA' && b['条件'] === '-');
            const anaSmall = mockBaggageData.find(b => b['ICAO code'] === 'ANA' && b['条件'] === '100席未満');
            
            const largeAircraftCompatible = checkSuitcaseCompatibility(mediumSuitcase, anaLarge);
            const smallAircraftCompatible = checkSuitcaseCompatibility(mediumSuitcase, anaSmall);
            
            // 100席以上の機材では可能、100席未満では不可
            expect(largeAircraftCompatible).toBe(true);
            expect(smallAircraftCompatible).toBe(false);
        });
    });

    describe('実際のデータパターンテスト', () => {
        test('RIMOWAクラシックキャビンS相当のサイズ', () => {
            const rimowaClassicS = createMockSuitcase(55, 40, 20, 4.2); // 115cm, 4.2kg
            
            const results = mockBaggageData.map(baggage => {
                const airline = mockAirlinesData.find(a => a['ICAO code'] === baggage['ICAO code']);
                const isCompatible = checkSuitcaseCompatibility(rimowaClassicS, baggage);
                return {
                    airline: airline['航空会社名'],
                    type: baggage['種別'],
                    condition: baggage['条件'],
                    isCompatible
                };
            });

            // 軽量なので重量制限は問題ないが、3辺合計が115cmぴったり
            const compatibleResults = results.filter(r => r.isCompatible);
            expect(compatibleResults.length).toBeGreaterThan(0);
        });

        test('複数の航空会社データを処理するフルワークフロー', () => {
            const testSuitcase = createMockSuitcase(54, 38, 23, 5); // 115cm, 5kg
            
            // 実際のcheckAllAirlinesに相当する処理
            const compatible = [];
            const incompatible = [];

            mockBaggageData.forEach(baggage => {
                const airline = mockAirlinesData.find(a => a['ICAO code'] === baggage['ICAO code']);
                if (!airline) return;

                const country = mockCountriesData.find(c => c['Country'] === airline['Country']);
                const isCompatible = checkSuitcaseCompatibility(testSuitcase, baggage);

                const result = {
                    icao: baggage['ICAO code'],
                    iata: airline['IATA code'],
                    nameJa: airline['航空会社名'],
                    nameEn: airline['Airline name'],
                    country: airline['Country'],
                    countryJa: country ? country['国名'] : airline['Country'],
                    type: baggage['種別'],
                    condition: baggage['条件']
                };

                if (isCompatible) {
                    compatible.push(result);
                } else {
                    incompatible.push(result);
                }
            });

            // 結果の構造が正しいことを確認
            expect(compatible.length + incompatible.length).toBe(mockBaggageData.length);
            
            compatible.forEach(result => {
                expect(result).toHaveProperty('icao');
                expect(result).toHaveProperty('iata');
                expect(result).toHaveProperty('nameJa');
                expect(result).toHaveProperty('countryJa');
            });
        });
    });

    describe('エッジケースとエラーハンドリング', () => {
        test('存在しない航空会社コードの処理', () => {
            const testSuitcase = createMockSuitcase(50, 35, 20, 5);
            const invalidBaggage = createMockBaggage('INVALID', 55, 40, 25, 115, 10);
            
            // 航空会社データに存在しないICAOコード
            const airline = mockAirlinesData.find(a => a['ICAO code'] === 'INVALID');
            expect(airline).toBeUndefined();
            
            // バゲッジデータ自体は有効
            const compatibility = checkSuitcaseCompatibility(testSuitcase, invalidBaggage);
            expect(compatibility).toBe(true);
        });

        test('不完全なデータセットの処理', () => {
            const testSuitcase = createMockSuitcase(50, 35, 20, 5);
            
            // 国データが見つからない場合
            const airlineWithoutCountry = {
                'ICAO code': 'TEST',
                'IATA code': 'XX',
                '航空会社名': 'テスト航空',
                'Airline name': 'Test Airlines',
                'Country': 'Unknown Country'
            };
            
            const country = mockCountriesData.find(c => c['Country'] === airlineWithoutCountry['Country']);
            expect(country).toBeUndefined();
            
            // フォールバック値として元の国名を使用
            const countryName = country ? country['国名'] : airlineWithoutCountry['Country'];
            expect(countryName).toBe('Unknown Country');
        });
    });

    describe('パフォーマンステスト', () => {
        test('大量データの処理性能', () => {
            // 100件の航空会社データをシミュレート
            const largeAirlineData = Array.from({ length: 100 }, (_, i) => ({
                'ICAO code': `TEST${i.toString().padStart(3, '0')}`,
                'IATA code': `T${i}`,
                '航空会社名': `テスト航空${i}`,
                'Airline name': `Test Airlines ${i}`,
                'Country': 'Japan'
            }));

            const largeBaggageData = largeAirlineData.map((airline, i) => 
                createMockBaggage(airline['ICAO code'], 55, 40, 25, 115, 10)
            );

            const testSuitcase = createMockSuitcase(50, 35, 20, 5);
            
            const startTime = performance.now();
            
            const results = largeBaggageData.map(baggage => 
                checkSuitcaseCompatibility(testSuitcase, baggage)
            );
            
            const endTime = performance.now();
            const processingTime = endTime - startTime;
            
            expect(results).toHaveLength(100);
            expect(processingTime).toBeLessThan(100); // 100ms以下で処理完了
        });
    });
});