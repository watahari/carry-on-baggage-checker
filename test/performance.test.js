/**
 * @jest-environment jsdom
 */

const modules = require('../src/modules');
const {
    parseTSV,
    checkSuitcaseCompatibility,
    checkAllAirlines,
    calculateSuitcaseVolume,
    generateCompatibilityReport,
    setTestData
} = modules;

describe('パフォーマンステスト', () => {
    beforeEach(() => {
        // 高精度タイマーのモック
        if (!performance.now) {
            performance.now = jest.fn(() => Date.now());
        }
    });

    describe('大量データ処理のパフォーマンス', () => {
        test('1000件の航空会社データの処理速度', () => {
            // 1000件のテストデータを生成
            const largeAirlines = Array.from({ length: 1000 }, (_, i) => ({
                'ICAO code': `TEST${i.toString().padStart(4, '0')}`,
                'IATA code': `T${i.toString().padStart(2, '0')}`,
                '航空会社名': `テスト航空${i}`,
                'Airline name': `Test Airlines ${i}`,
                'Country': i % 10 === 0 ? 'USA' : 'Japan'
            }));

            const largeBaggage = Array.from({ length: 1000 }, (_, i) => ({
                'ICAO code': `TEST${i.toString().padStart(4, '0')}`,
                '種別': i % 2 === 0 ? '国内' : '国際',
                '条件': i % 5 === 0 ? '100席未満' : '100席以上',
                'W(cm)': (50 + (i % 10)).toString(),
                'H(cm)': (35 + (i % 10)).toString(),
                'D(cm)': (20 + (i % 5)).toString(),
                'Length(cm)': (110 + (i % 20)).toString(),
                'Weight(kg)': (7 + (i % 8)).toString()
            }));

            const largeCountries = [
                { 'Country': 'Japan', '国名': '日本', 'Area': 'East Asia', '地域': '東アジア' },
                { 'Country': 'USA', '国名': 'アメリカ', 'Area': 'North America', '地域': '北アメリカ' }
            ];

            setTestData(largeAirlines, largeBaggage, largeCountries);

            const testSuitcase = { width: 55, height: 40, depth: 25, totalLength: 120, weight: 10 };
            
            const startTime = performance.now();
            const result = checkAllAirlines(testSuitcase);
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            
            expect(result.compatible.length + result.incompatible.length).toBe(1000);
            expect(processingTime).toBeLessThan(1000); // 1秒以内で処理完了
            
            console.log(`1000件の処理時間: ${processingTime.toFixed(2)}ms`);
        });

        test('10000件のTSVデータ解析の処理速度', () => {
            // 10000行のTSVデータを生成
            let tsvData = 'ICAO code\tIATA code\t航空会社名\tAirline name\tCountry\n';
            for (let i = 0; i < 10000; i++) {
                tsvData += `TEST${i}\tT${i}\tテスト航空${i}\tTest Air ${i}\tJapan\n`;
            }

            const startTime = performance.now();
            const result = parseTSV(tsvData);
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            
            expect(result).toHaveLength(10000);
            expect(processingTime).toBeLessThan(2000); // 2秒以内で解析完了
            
            console.log(`10000行TSV解析時間: ${processingTime.toFixed(2)}ms`);
        });

        test('複数の判定を同時実行した場合のパフォーマンス', () => {
            const airlines = Array.from({ length: 100 }, (_, i) => ({
                'ICAO code': `TEST${i}`,
                '航空会社名': `テスト航空${i}`,
                'Airline name': `Test Air ${i}`,
                'Country': 'Japan'
            }));

            const baggage = Array.from({ length: 100 }, (_, i) => ({
                'ICAO code': `TEST${i}`,
                'W(cm)': '55',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            }));

            setTestData(airlines, baggage, [
                { 'Country': 'Japan', '国名': '日本', 'Area': 'East Asia', '地域': '東アジア' }
            ]);

            // 100個の異なるスーツケースで同時判定
            const suitcases = Array.from({ length: 100 }, (_, i) => ({
                width: 50 + i % 10,
                height: 35 + i % 8,
                depth: 20 + i % 5,
                totalLength: 105 + i % 15,
                weight: 5 + i % 10
            }));

            const startTime = performance.now();
            const results = suitcases.map(suitcase => checkAllAirlines(suitcase));
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            
            expect(results).toHaveLength(100);
            expect(processingTime).toBeLessThan(500); // 500ms以内で完了
            
            console.log(`100件同時判定時間: ${processingTime.toFixed(2)}ms`);
        });
    });

    describe('メモリ使用量の最適化テスト', () => {
        test('大量データ処理後のメモリリークチェック', () => {
            const initialHeapUsed = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            
            // 大量データを処理
            for (let i = 0; i < 1000; i++) {
                const largeData = Array.from({ length: 100 }, (_, j) => ({
                    'ICAO code': `TEMP${i}${j}`,
                    '航空会社名': `一時的航空${i}${j}`,
                    'Country': 'TempCountry'
                }));
                
                // データを設定して処理
                setTestData(largeData, largeData.map(d => ({
                    'ICAO code': d['ICAO code'],
                    'W(cm)': '55',
                    'H(cm)': '40',
                    'D(cm)': '25',
                    'Length(cm)': '115',
                    'Weight(kg)': '10'
                })), []);
                
                const testSuitcase = { width: 50, height: 35, depth: 20, totalLength: 105, weight: 5 };
                checkAllAirlines(testSuitcase);
            }
            
            // ガベージコレクションの実行（Node.js環境）
            if (global.gc) {
                global.gc();
            }
            
            const finalHeapUsed = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            const memoryIncrease = finalHeapUsed - initialHeapUsed;
            
            // メモリ使用量の増加が合理的な範囲内であることを確認
            expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB以内
            
            console.log(`メモリ使用量変化: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        });

    });

    describe('計算処理のパフォーマンス', () => {
        test('体積計算の高速化', () => {
            const iterations = 100000;
            const dimensions = Array.from({ length: iterations }, (_, i) => [
                50 + (i % 20),
                35 + (i % 15),
                20 + (i % 10)
            ]);

            const startTime = performance.now();
            const volumes = dimensions.map(([w, h, d]) => calculateSuitcaseVolume(w, h, d));
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            
            expect(volumes).toHaveLength(iterations);
            expect(processingTime).toBeLessThan(100); // 100ms以内で完了
            
            console.log(`${iterations}件の体積計算: ${processingTime.toFixed(2)}ms`);
        });

        test('判定処理のバッチ最適化', () => {
            const testSuitcase = { width: 55, height: 40, depth: 25, totalLength: 120, weight: 10 };
            
            // 1000個の制限データを作成
            const baggageList = Array.from({ length: 1000 }, (_, i) => ({
                'W(cm)': (50 + (i % 15)).toString(),
                'H(cm)': (35 + (i % 12)).toString(),
                'D(cm)': (20 + (i % 8)).toString(),
                'Length(cm)': (110 + (i % 25)).toString(),
                'Weight(kg)': (7 + (i % 10)).toString()
            }));

            // 個別処理の時間測定
            const startTime1 = performance.now();
            const individualResults = baggageList.map(baggage => 
                checkSuitcaseCompatibility(testSuitcase, baggage)
            );
            const endTime1 = performance.now();

            // バッチ処理の時間測定（配列操作を最適化）
            const startTime2 = performance.now();
            const batchResults = [];
            for (let i = 0; i < baggageList.length; i++) {
                batchResults[i] = checkSuitcaseCompatibility(testSuitcase, baggageList[i]);
            }
            const endTime2 = performance.now();

            const individualTime = endTime1 - startTime1;
            const batchTime = endTime2 - startTime2;

            expect(individualResults).toHaveLength(1000);
            expect(batchResults).toHaveLength(1000);
            expect(Math.abs(batchTime - individualTime)).toBeLessThan(individualTime * 0.5); // 性能差は50%以内

            console.log(`個別処理時間: ${individualTime.toFixed(2)}ms`);
            console.log(`バッチ処理時間: ${batchTime.toFixed(2)}ms`);
        });
    });

    describe('DOM操作のパフォーマンス', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="compatibleList"></div>
                <div id="incompatibleList"></div>
            `;
        });


        test('スクロールパフォーマンスの確認', () => {
            const testElement = document.createElement('div');
            testElement.style.height = '10000px';
            testElement.innerHTML = Array.from({ length: 1000 }, (_, i) => 
                `<div style="height: 10px;">Item ${i}</div>`
            ).join('');
            
            document.body.appendChild(testElement);

            const scrollStartTime = performance.now();
            
            // スクロールイベントのシミュレーション
            for (let i = 0; i < 100; i++) {
                const scrollEvent = new Event('scroll');
                testElement.dispatchEvent(scrollEvent);
            }
            
            const scrollEndTime = performance.now();
            const scrollTime = scrollEndTime - scrollStartTime;

            expect(scrollTime).toBeLessThan(50); // 50ms以内
            
            console.log(`スクロールイベント処理時間: ${scrollTime.toFixed(2)}ms`);
            
            document.body.removeChild(testElement);
        });
    });

    describe('レスポンス時間の SLA テスト', () => {
        test('一般的な使用ケースで500ms以内の応答', () => {
            // 実際の使用規模のデータ（170航空会社程度）
            const realisticAirlines = Array.from({ length: 170 }, (_, i) => ({
                'ICAO code': `REAL${i.toString().padStart(3, '0')}`,
                '航空会社名': `リアル航空${i}`,
                'Airline name': `Real Airlines ${i}`,
                'Country': ['Japan', 'USA', 'China', 'Korea', 'Thailand'][i % 5]
            }));

            const realisticBaggage = realisticAirlines.map((airline, i) => ({
                'ICAO code': airline['ICAO code'],
                '種別': ['国内', '国際'][i % 2],
                '条件': i % 5 === 0 ? '100席未満' : '100席以上',
                'W(cm)': [55, 56, 54][i % 3].toString(),
                'H(cm)': [40, 36, 45][i % 3].toString(),
                'D(cm)': [25, 23, 20][i % 3].toString(),
                'Length(cm)': [115, 120, 'N/A'][i % 3].toString(),
                'Weight(kg)': [10, 7, 'N/A'][i % 3].toString()
            }));

            const countries = [
                { 'Country': 'Japan', '国名': '日本', '地域': '東アジア' },
                { 'Country': 'USA', '国名': 'アメリカ', '地域': '北アメリカ' },
                { 'Country': 'China', '国名': '中国', '地域': '東アジア' },
                { 'Country': 'Korea', '国名': '韓国', '地域': '東アジア' },
                { 'Country': 'Thailand', '国名': 'タイ', '地域': '東南アジア' }
            ];

            setTestData(realisticAirlines, realisticBaggage, countries);

            const testSuitcase = { width: 55, height: 40, depth: 25, totalLength: 120, weight: 10 };
            
            const startTime = performance.now();
            const result = checkAllAirlines(testSuitcase);
            const report = generateCompatibilityReport(testSuitcase, result);
            const endTime = performance.now();
            
            const totalTime = endTime - startTime;
            
            expect(totalTime).toBeLessThan(500); // SLA: 500ms以内
            expect(result.compatible.length + result.incompatible.length).toBe(170);
            expect(report).toBeTruthy();
            
            console.log(`リアルケース処理時間: ${totalTime.toFixed(2)}ms`);
            console.log(`互換性率: ${report.compatibilityRate.toFixed(1)}%`);
        });

        test('最悪ケースでも1000ms以内の応答', () => {
            // 最大サイズのデータセット
            const maxAirlines = Array.from({ length: 500 }, (_, i) => ({
                'ICAO code': `MAX${i.toString().padStart(3, '0')}`,
                '航空会社名': `最大航空${i}`.repeat(5), // 長い名前
                'Airline name': `Max Airlines ${i}`.repeat(5),
                'Country': `Country${i % 50}` // 50の異なる国
            }));

            const maxBaggage = maxAirlines.map(airline => ({
                'ICAO code': airline['ICAO code'],
                '種別': '国際',
                '条件': '100席以上',
                'W(cm)': '55.123456789', // 小数点多数
                'H(cm)': '40.987654321',
                'D(cm)': '25.555555555',
                'Length(cm)': '115.123456789',
                'Weight(kg)': '10.987654321'
            }));

            const maxCountries = Array.from({ length: 50 }, (_, i) => ({
                'Country': `Country${i}`,
                '国名': `国${i}`,
                '地域': `地域${i % 10}`
            }));

            setTestData(maxAirlines, maxBaggage, maxCountries);

            const complexSuitcase = { 
                width: 55.123456789, 
                height: 40.987654321, 
                depth: 25.555555555, 
                totalLength: 121.666666665, 
                weight: 10.5 
            };
            
            const startTime = performance.now();
            const result = checkAllAirlines(complexSuitcase);
            const report = generateCompatibilityReport(complexSuitcase, result);
            const endTime = performance.now();
            
            const totalTime = endTime - startTime;
            
            expect(totalTime).toBeLessThan(1000); // 最悪ケースSLA: 1000ms以内
            expect(result.compatible.length + result.incompatible.length).toBe(500);
            
            console.log(`最悪ケース処理時間: ${totalTime.toFixed(2)}ms`);
        });
    });
});