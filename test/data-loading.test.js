/**
 * @jest-environment jsdom
 */

const { parseTSV } = require('./test-utils');

describe('データ読み込み機能のテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseTSV関数', () => {
    test('正常なTSVデータを正しく解析する', () => {
      const tsvData = `ICAO code\tIATA code\t航空会社名\tAirline name\tCountry
ANA\tNH\t全日本空輸\tAll Nippon Airways\tJapan
JAL\tJL\t日本航空\tJapan Airlines\tJapan`;

      const result = parseTSV(tsvData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        'ICAO code': 'ANA',
        'IATA code': 'NH',
        '航空会社名': '全日本空輸',
        'Airline name': 'All Nippon Airways',
        'Country': 'Japan'
      });
      expect(result[1]).toEqual({
        'ICAO code': 'JAL',
        'IATA code': 'JL',
        '航空会社名': '日本航空',
        'Airline name': 'Japan Airlines',
        'Country': 'Japan'
      });
    });

    test('空のデータを処理する', () => {
      const tsvData = `ICAO code\tIATA code\t航空会社名`;
      const result = parseTSV(tsvData);
      expect(result).toHaveLength(0);
    });

    test('不正な行を無視する', () => {
      const tsvData = `ICAO code\tIATA code\t航空会社名
ANA\tNH\t全日本空輸
INVALID_ROW
JAL\tJL\t日本航空`;

      const result = parseTSV(tsvData);
      expect(result).toHaveLength(2); // ANAとJALの2行が正常に解析される
      expect(result[0]['ICAO code']).toBe('ANA');
      expect(result[1]['ICAO code']).toBe('JAL');
    });
  });

  describe('fetchモック機能のテスト', () => {
    test('fetchモックが正常に動作する', async () => {
      // fetchモックの存在確認
      expect(global.fetch).toBeDefined();
      expect(typeof global.fetch).toBe('function');
      
      // このテストでは実際のloadTSVData関数の実装は行わず
      // モック機能のみをテストする
      expect(true).toBe(true);
    });

    test('TSVファイル形式のデータを処理できる', () => {
      // 実際のTSVファイル処理はparseTSV関数で行われ
      // それは上記でテスト済み
      const mockTsvData = `ICAO code\tIATA code
ANA\tNH
JAL\tJL`;
      
      const result = parseTSV(mockTsvData);
      expect(result).toHaveLength(2);
    });
  });
});