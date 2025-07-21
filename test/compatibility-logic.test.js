/**
 * @jest-environment jsdom
 */

const { 
    checkSuitcaseCompatibility, 
    createMockSuitcase, 
    createMockBaggage 
} = require('./test-utils');

describe('判定ロジックのテスト', () => {
    describe('checkSuitcaseCompatibility関数', () => {
        test('すべての制限を満たすスーツケースは互換性ありと判定される', () => {
            const suitcase = createMockSuitcase(50, 35, 20, 5); // 105cm, 5kg
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(true);
        });

        test('幅が制限を超えるスーツケースは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(60, 35, 20, 5); // 幅60cm > 55cm制限
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('高さが制限を超えるスーツケースは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(50, 45, 20, 5); // 高さ45cm > 40cm制限
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('奥行きが制限を超えるスーツケースは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(50, 35, 30, 5); // 奥行き30cm > 25cm制限
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('3辺合計が制限を超えるスーツケースは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(55, 40, 25, 5); // 120cm > 115cm制限
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('重量が制限を超えるスーツケースは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(50, 35, 20, 15); // 15kg > 10kg制限
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('重量制限がN/Aの場合は重量チェックをスキップする', () => {
            const suitcase = createMockSuitcase(50, 35, 20, 50); // 重い荷物
            const baggage = createMockBaggage('TEST', 55, 40, 25, 115, null); // 重量制限なし
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(true);
        });

        test('3辺合計制限がN/Aの場合は長さチェックをスキップする', () => {
            const suitcase = createMockSuitcase(55, 40, 25, 5); // 120cm
            const baggage = createMockBaggage('TEST', 55, 40, 25, null, 10); // 長さ制限なし
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(true);
        });

        test('重量が未入力の場合は重量チェックをスキップする', () => {
            const suitcase = createMockSuitcase(50, 35, 20, null); // 重量未入力
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 5);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(true);
        });

        test('不正な寸法データは互換性なしと判定される', () => {
            const suitcase = createMockSuitcase(50, 35, 20, 5);
            const baggage = {
                'ICAO code': 'TEST',
                'W(cm)': 'invalid',
                'H(cm)': '40',
                'D(cm)': '25',
                'Length(cm)': '115',
                'Weight(kg)': '10'
            };
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('境界値テスト: ちょうど制限値のスーツケース', () => {
            const suitcase = createMockSuitcase(55, 40, 25, 10); // すべて制限値ぴったり
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10); // 3辺合計115制限
            
            // 3辺合計が120cmで115cm制限を超えるため、falseになるべき
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(false);
        });

        test('境界値テスト: 制限値以下のスーツケース', () => {
            const suitcase = createMockSuitcase(50, 35, 20, 8); // 105cm, 8kg
            const baggage = createMockBaggage('ANA', 55, 40, 25, 115, 10);
            
            const result = checkSuitcaseCompatibility(suitcase, baggage);
            expect(result).toBe(true);
        });
    });

    describe('特殊なケースのテスト', () => {
        test('LCCの厳しい制限をテストする', () => {
            const suitcase = createMockSuitcase(56, 36, 23, 8); // 115cm, 8kg
            const lccBaggage = createMockBaggage('LCC', 55, 35, 20, 110, 7); // より厳しい制限
            
            const result = checkSuitcaseCompatibility(suitcase, lccBaggage);
            expect(result).toBe(false);
        });

        test('国内線と国際線の制限の違いをテストする', () => {
            const suitcase = createMockSuitcase(50, 38, 22, 8); // 110cm, 8kg
            
            const domesticBaggage = createMockBaggage('ANA', 45, 35, 20, 100, 10, '国内', '100席未満');
            const internationalBaggage = createMockBaggage('ANA', 55, 40, 25, 115, 10, '国際', '-');
            
            expect(checkSuitcaseCompatibility(suitcase, domesticBaggage)).toBe(false);
            expect(checkSuitcaseCompatibility(suitcase, internationalBaggage)).toBe(true);
        });

        test('機材サイズによる制限の違いをテストする', () => {
            const suitcase = createMockSuitcase(50, 38, 22, 8); // 110cm, 8kg
            
            const smallAircraftBaggage = createMockBaggage('ANA', 45, 35, 20, 100, 10, '国内', '100席未満');
            const largeAircraftBaggage = createMockBaggage('ANA', 55, 40, 25, 115, 10, '国内', '100席以上');
            
            expect(checkSuitcaseCompatibility(suitcase, smallAircraftBaggage)).toBe(false);
            expect(checkSuitcaseCompatibility(suitcase, largeAircraftBaggage)).toBe(true);
        });
    });
});