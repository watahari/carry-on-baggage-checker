/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const modules = require('../src/modules');
const {
    parseTSV,
    checkAllAirlines,
    generateCompatibilityReport,
    setTestData
} = modules;

describe('実際のデータでのE2Eテスト', () => {
    let realAirlinesData, realBaggageData, realCountriesData, realSuitcaseData;

    beforeAll(async () => {
        try {
            // 実際のTSVファイルを読み込み
            const airlinesPath = path.join(__dirname, '..', 'airline.tsv');
            const baggagePath = path.join(__dirname, '..', 'carry-on-baggage.tsv');
            const countriesPath = path.join(__dirname, '..', 'country.tsv');
            const suitcasePath = path.join(__dirname, '..', 'suitcase.tsv');

            if (fs.existsSync(airlinesPath)) {
                const airlinesText = fs.readFileSync(airlinesPath, 'utf8');
                realAirlinesData = parseTSV(airlinesText);
            } else {
                realAirlinesData = [];
            }

            if (fs.existsSync(baggagePath)) {
                const baggageText = fs.readFileSync(baggagePath, 'utf8');
                realBaggageData = parseTSV(baggageText);
            } else {
                realBaggageData = [];
            }

            if (fs.existsSync(countriesPath)) {
                const countriesText = fs.readFileSync(countriesPath, 'utf8');
                realCountriesData = parseTSV(countriesText);
            } else {
                realCountriesData = [];
            }

            if (fs.existsSync(suitcasePath)) {
                const suitcaseText = fs.readFileSync(suitcasePath, 'utf8');
                realSuitcaseData = parseTSV(suitcaseText);
            } else {
                realSuitcaseData = [];
            }

            setTestData(realAirlinesData, realBaggageData, realCountriesData);
        } catch (error) {
            console.warn('実際のデータファイルが見つかりません。モックデータを使用します。', error);
            // モックデータで代用
            realAirlinesData = [
                { 'ICAO code': 'ANA', 'IATA code': 'NH', '航空会社名': '全日本空輸', 'Airline name': 'All Nippon Airways', 'Country': 'Japan' },
                { 'ICAO code': 'JAL', 'IATA code': 'JL', '航空会社名': '日本航空', 'Airline name': 'Japan Airlines', 'Country': 'Japan' }
            ];
            
            realBaggageData = [
                { 'ICAO code': 'ANA', '種別': '国際', '条件': '-', 'W(cm)': '55', 'H(cm)': '40', 'D(cm)': '25', 'Length(cm)': '115', 'Weight(kg)': '10' },
                { 'ICAO code': 'JAL', '種別': '国際', '条件': '-', 'W(cm)': '55', 'H(cm)': '40', 'D(cm)': '25', 'Length(cm)': '115', 'Weight(kg)': '10' }
            ];
            
            realCountriesData = [
                { 'Country': 'Japan', '国名': '日本', 'Area': 'East Asia', '地域': '東アジア' }
            ];
            
            realSuitcaseData = [
                { 'Name of Suit case': 'RIMOWA Classic Cabin', 'スーツケース名': 'RIMOWAクラシック', 'W(cm)': '55', 'H(cm)': '40', 'D(cm)': '23', 'Weight(kg)': '4.3' }
            ];

            setTestData(realAirlinesData, realBaggageData, realCountriesData);
        }
    });

    describe('実データの品質検証', () => {
        test('航空会社データの完整性', () => {
            expect(realAirlinesData).toBeDefined();
            expect(Array.isArray(realAirlinesData)).toBe(true);
            
            if (realAirlinesData.length > 0) {
                const sample = realAirlinesData[0];
                expect(sample).toHaveProperty('ICAO code');
                expect(sample).toHaveProperty('IATA code');
                expect(sample).toHaveProperty('航空会社名');
                expect(sample).toHaveProperty('Country');
                
                console.log(`航空会社データ件数: ${realAirlinesData.length}`);
            }
        });

        test('手荷物制限データの完整性', () => {
            expect(realBaggageData).toBeDefined();
            expect(Array.isArray(realBaggageData)).toBe(true);
            
            if (realBaggageData.length > 0) {
                const sample = realBaggageData[0];
                expect(sample).toHaveProperty('ICAO code');
                expect(sample).toHaveProperty('W(cm)');
                expect(sample).toHaveProperty('H(cm)');
                expect(sample).toHaveProperty('D(cm)');
                
                console.log(`手荷物制限データ件数: ${realBaggageData.length}`);
            }
        });

        test('国データの完整性', () => {
            expect(realCountriesData).toBeDefined();
            expect(Array.isArray(realCountriesData)).toBe(true);
            
            if (realCountriesData.length > 0) {
                const sample = realCountriesData[0];
                expect(sample).toHaveProperty('Country');
                expect(sample).toHaveProperty('国名');
                
                console.log(`国データ件数: ${realCountriesData.length}`);
            }
        });

        test('データ間の関連性チェック', () => {
            if (realAirlinesData.length > 0 && realBaggageData.length > 0) {
                // 航空会社データと手荷物データのICAOコード整合性
                const airlineICAOs = new Set(realAirlinesData.map(a => a['ICAO code']));
                const baggageICAOs = new Set(realBaggageData.map(b => b['ICAO code']));
                
                const matchingICAOs = Array.from(airlineICAOs).filter(icao => baggageICAOs.has(icao));
                const matchingRate = matchingICAOs.length / airlineICAOs.size * 100;
                
                expect(matchingRate).toBeGreaterThan(50); // 50%以上のデータが関連している
                
                console.log(`ICAO コードマッチング率: ${matchingRate.toFixed(1)}%`);
                console.log(`マッチング数: ${matchingICAOs.length}/${airlineICAOs.size}`);
            }
        });
    });

    describe('実スーツケースでの判定テスト', () => {
        const testCases = [
            {
                name: 'RIMOWA Classic Cabin相当',
                suitcase: { width: 55, height: 40, depth: 23, totalLength: 118, weight: 4.3 },
                expectedCompatibilityRate: 80 // 80%以上の航空会社で利用可能と予想
            },
            {
                name: '標準的なキャリーケース',
                suitcase: { width: 54, height: 38, depth: 22, totalLength: 114, weight: 3.5 },
                expectedCompatibilityRate: 85
            },
            {
                name: 'LCC対応小型ケース',
                suitcase: { width: 50, height: 35, depth: 20, totalLength: 105, weight: 2.8 },
                expectedCompatibilityRate: 95
            },
            {
                name: '大型ケース（制限ギリギリ）',
                suitcase: { width: 56, height: 45, depth: 25, totalLength: 126, weight: 10 },
                expectedCompatibilityRate: 30 // 制限が厳しいので低め
            },
            {
                name: '超軽量ケース',
                suitcase: { width: 55, height: 40, depth: 20, totalLength: 115, weight: 1.8 },
                expectedCompatibilityRate: 90
            }
        ];

        testCases.forEach(({ name, suitcase, expectedCompatibilityRate }) => {
            test(`${name}での判定`, () => {
                if (realBaggageData.length === 0) {
                    console.log(`${name}: 実データがないためスキップ`);
                    return;
                }

                const startTime = performance.now();
                const results = checkAllAirlines(suitcase);
                const report = generateCompatibilityReport(suitcase, results);
                const endTime = performance.now();

                const totalAirlines = results.compatible.length + results.incompatible.length;
                const actualCompatibilityRate = report.compatibilityRate;
                const processingTime = endTime - startTime;

                expect(totalAirlines).toBeGreaterThan(0);
                expect(actualCompatibilityRate).toBeGreaterThanOrEqual(0);
                expect(actualCompatibilityRate).toBeLessThanOrEqual(100);
                expect(processingTime).toBeLessThan(1000);

                // 予想との乖離をログ出力（テストは失敗させない）
                const rateDeviation = Math.abs(actualCompatibilityRate - expectedCompatibilityRate);
                
                console.log(`${name}:`);
                console.log(`  対象航空会社数: ${totalAirlines}`);
                console.log(`  互換性率: ${actualCompatibilityRate.toFixed(1)}% (予想: ${expectedCompatibilityRate}%)`);
                console.log(`  処理時間: ${processingTime.toFixed(2)}ms`);
                console.log(`  予想との乖離: ${rateDeviation.toFixed(1)}%`);

                if (rateDeviation > 20) {
                    console.warn(`  ⚠️ 予想から20%以上乖離しています`);
                }
            });
        });
    });

    describe('実データでの境界値テスト', () => {
        test('各制限値の境界での判定', () => {
            if (realBaggageData.length === 0) return;

            // 実データから制限値の統計を取得
            const widthLimits = realBaggageData.map(b => parseFloat(b['W(cm)'])).filter(w => !isNaN(w));
            const heightLimits = realBaggageData.map(b => parseFloat(b['H(cm)'])).filter(h => !isNaN(h));
            const depthLimits = realBaggageData.map(b => parseFloat(b['D(cm)'])).filter(d => !isNaN(d));

            const minWidth = Math.min(...widthLimits);
            const maxWidth = Math.max(...widthLimits);
            const minHeight = Math.min(...heightLimits);
            const maxHeight = Math.max(...heightLimits);
            const minDepth = Math.min(...depthLimits);
            const maxDepth = Math.max(...depthLimits);

            console.log(`幅制限範囲: ${minWidth} - ${maxWidth} cm`);
            console.log(`高さ制限範囲: ${minHeight} - ${maxHeight} cm`);
            console.log(`奥行制限範囲: ${minDepth} - ${maxDepth} cm`);

            // 最小制限値での判定
            const minSuitcase = {
                width: minWidth - 0.1,
                height: minHeight - 0.1,
                depth: minDepth - 0.1,
                totalLength: (minWidth + minHeight + minDepth) - 0.3,
                weight: 1
            };

            const minResults = checkAllAirlines(minSuitcase);
            const minReport = generateCompatibilityReport(minSuitcase, minResults);

            expect(minReport.compatibilityRate).toBeGreaterThan(0); // 何かしら対応可能
            
            // 最大制限値での判定
            const maxSuitcase = {
                width: maxWidth,
                height: maxHeight,
                depth: maxDepth,
                totalLength: maxWidth + maxHeight + maxDepth,
                weight: 5
            };

            const maxResults = checkAllAirlines(maxSuitcase);
            const maxReport = generateCompatibilityReport(maxSuitcase, maxResults);

            console.log(`最小サイズでの互換性率: ${minReport.compatibilityRate.toFixed(1)}%`);
            console.log(`最大サイズでの互換性率: ${maxReport.compatibilityRate.toFixed(1)}%`);
        });
    });

    describe('地域別の制限傾向分析', () => {
        test('地域別の制限パターン分析', () => {
            if (realAirlinesData.length === 0 || realBaggageData.length === 0 || realCountriesData.length === 0) return;

            const regionStats = {};

            realBaggageData.forEach(baggage => {
                const airline = realAirlinesData.find(a => a['ICAO code'] === baggage['ICAO code']);
                if (!airline) return;

                const country = realCountriesData.find(c => c['Country'] === airline['Country']);
                const region = country ? country['地域'] : 'その他';

                if (!regionStats[region]) {
                    regionStats[region] = {
                        count: 0,
                        widthSum: 0,
                        heightSum: 0,
                        depthSum: 0,
                        weightSum: 0,
                        weightCount: 0
                    };
                }

                const stats = regionStats[region];
                stats.count++;
                
                const width = parseFloat(baggage['W(cm)']);
                const height = parseFloat(baggage['H(cm)']);
                const depth = parseFloat(baggage['D(cm)']);
                const weight = parseFloat(baggage['Weight(kg)']);

                if (!isNaN(width)) stats.widthSum += width;
                if (!isNaN(height)) stats.heightSum += height;
                if (!isNaN(depth)) stats.depthSum += depth;
                if (!isNaN(weight)) {
                    stats.weightSum += weight;
                    stats.weightCount++;
                }
            });

            // 地域別平均を計算
            Object.entries(regionStats).forEach(([region, stats]) => {
                const avgWidth = stats.widthSum / stats.count;
                const avgHeight = stats.heightSum / stats.count;
                const avgDepth = stats.depthSum / stats.count;
                const avgWeight = stats.weightCount > 0 ? stats.weightSum / stats.weightCount : 0;

                expect(avgWidth).toBeGreaterThan(0);
                expect(avgHeight).toBeGreaterThan(0);
                expect(avgDepth).toBeGreaterThan(0);

                console.log(`${region} (${stats.count}社):`);
                console.log(`  平均サイズ制限: ${avgWidth.toFixed(1)} × ${avgHeight.toFixed(1)} × ${avgDepth.toFixed(1)} cm`);
                if (avgWeight > 0) {
                    console.log(`  平均重量制限: ${avgWeight.toFixed(1)} kg`);
                }
            });
        });
    });

    describe('実データでのパフォーマンス検証', () => {
        test('実データでの処理性能', () => {
            if (realBaggageData.length === 0) return;

            const testSuitcase = { width: 55, height: 40, depth: 25, totalLength: 120, weight: 7 };
            
            const iterations = 10;
            const times = [];

            for (let i = 0; i < iterations; i++) {
                const startTime = performance.now();
                const results = checkAllAirlines(testSuitcase);
                const report = generateCompatibilityReport(testSuitcase, results);
                const endTime = performance.now();
                
                times.push(endTime - startTime);
            }

            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);

            expect(avgTime).toBeLessThan(500); // 平均500ms以内
            expect(maxTime).toBeLessThan(1000); // 最大1秒以内

            console.log(`実データ処理性能 (${realBaggageData.length}社):`);
            console.log(`  平均処理時間: ${avgTime.toFixed(2)}ms`);
            console.log(`  最小処理時間: ${minTime.toFixed(2)}ms`);
            console.log(`  最大処理時間: ${maxTime.toFixed(2)}ms`);
        });
    });

    describe('データ品質の問題検出', () => {
        test('不正なデータの検出', () => {
            if (realBaggageData.length === 0) return;

            const issues = [];

            realBaggageData.forEach((baggage, index) => {
                const icao = baggage['ICAO code'];
                const width = parseFloat(baggage['W(cm)']);
                const height = parseFloat(baggage['H(cm)']);
                const depth = parseFloat(baggage['D(cm)']);
                const weight = parseFloat(baggage['Weight(kg)']);

                // 基本的な妥当性チェック
                if (!icao || icao.trim() === '') {
                    issues.push(`行${index + 2}: ICAOコードが空`);
                }

                if (isNaN(width) || width <= 0 || width > 200) {
                    issues.push(`行${index + 2}: 幅の値が異常 (${baggage['W(cm)']})`);
                }

                if (isNaN(height) || height <= 0 || height > 200) {
                    issues.push(`行${index + 2}: 高さの値が異常 (${baggage['H(cm)']})`);
                }

                if (isNaN(depth) || depth <= 0 || depth > 200) {
                    issues.push(`行${index + 2}: 奥行きの値が異常 (${baggage['D(cm)']})`);
                }

                if (!isNaN(weight) && (weight < 0 || weight > 50)) {
                    issues.push(`行${index + 2}: 重量の値が異常 (${baggage['Weight(kg)']})`);
                }

                // 論理的な妥当性チェック
                if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
                    if (width < height || width < depth) {
                        issues.push(`行${index + 2}: 寸法の論理エラー - 幅が最大でない可能性`);
                    }
                }
            });

            // 問題がある場合は警告として出力
            if (issues.length > 0) {
                console.warn(`データ品質の問題を${issues.length}件検出:`);
                issues.slice(0, 10).forEach(issue => console.warn(`  ${issue}`));
                if (issues.length > 10) {
                    console.warn(`  ... 他${issues.length - 10}件`);
                }
            } else {
                console.log('データ品質: 問題は検出されませんでした');
            }

            // テストとしては、致命的な問題がないことのみ確認
            const criticalIssues = issues.filter(issue => 
                issue.includes('ICAOコードが空') || 
                issue.includes('値が異常')
            );

            expect(criticalIssues.length / realBaggageData.length).toBeLessThan(0.1); // 10%未満の問題率
        });
    });
});