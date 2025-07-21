# API Documentation

このドキュメントでは、プロジェクトの主要な関数とデータ構造について説明します。

## Core Functions

### Data Loading

#### `loadTSVData()`
TSVファイルからデータを非同期で読み込みます。

```javascript
async function loadTSVData()
```

**戻り値**: `Promise<void>`
**説明**: airline.tsv、carry-on-baggage.tsv、country.tsvを並行して読み込み、グローバル変数に格納します。

#### `parseTSV(text)`
TSV形式のテキストをオブジェクト配列に変換します。

```javascript
function parseTSV(text: string): Array<Object>
```

**パラメータ**:
- `text` (string): TSV形式のテキストデータ

**戻り値**: `Array<Object>` - パースされたデータオブジェクトの配列

### Compatibility Checking

#### `checkCompatibility()`
ユーザー入力を取得し、互換性チェックを実行します。

```javascript
function checkCompatibility(): void
```

**説明**: DOM要素から寸法を取得し、すべての航空会社に対して互換性をチェックして結果を表示します。

#### `checkAllAirlines(suitcase)`
すべての航空会社に対してスーツケースの互換性をチェックします。

```javascript
function checkAllAirlines(suitcase: SuitcaseData): CompatibilityResult
```

**パラメータ**:
- `suitcase` (SuitcaseData): スーツケースの情報

**戻り値**: `CompatibilityResult` - 互換性チェック結果

```typescript
interface SuitcaseData {
  width: number;
  height: number;
  depth: number;
  weight: number | null;
  totalLength: number;
}

interface CompatibilityResult {
  compatible: AirlineInfo[];
  incompatible: AirlineInfo[];
}

interface AirlineInfo {
  icao: string;
  iata: string;
  nameJa: string;
  nameEn: string;
  country: string;
  countryJa: string;
  type: string;
  condition: string;
  restrictions: RestrictionData;
}

interface RestrictionData {
  width: number;
  height: number;
  depth: number;
  length: number | null;
  weight: number | null;
}
```

#### `checkSuitcaseCompatibility(suitcase, baggage)`
個別の航空会社規定に対してスーツケースの互換性をチェックします。

```javascript
function checkSuitcaseCompatibility(suitcase: SuitcaseData, baggage: BaggageRestriction): boolean
```

**パラメータ**:
- `suitcase` (SuitcaseData): スーツケースの情報
- `baggage` (BaggageRestriction): 航空会社の手荷物制限

**戻り値**: `boolean` - 互換性の有無

### Display Functions

#### `displayResults(suitcase, results)`
互換性チェック結果をDOM上に表示します。

```javascript
function displayResults(suitcase: SuitcaseData, results: CompatibilityResult): void
```

#### `createAirlineCard(airline, isCompatible)`
個別の航空会社情報カードのHTMLを生成します。

```javascript
function createAirlineCard(airline: AirlineInfo, isCompatible: boolean): string
```

#### `createRestrictionsHtml(restrictions)`
制限情報のHTMLを生成します。

```javascript
function createRestrictionsHtml(restrictions: RestrictionData): string
```

## Data Structures

### TSV File Formats

#### airline.tsv
```
ICAO code	IATA code	航空会社名	Airline name	Country
ANA	NH	全日本空輸	All Nippon Airways	Japan
```

#### carry-on-baggage.tsv
```
ICAO code	種別	条件	W(cm)	H(cm)	D(cm)	Length(cm)	Weight(kg)
ANA	国内	-	55	40	25	115	10
```

#### country.tsv
```
Country	国名	Region	地域
Japan	日本	Asia	アジア
```

## Error Handling

すべての関数は適切なエラーハンドリングを含んでいます：

- データ読み込み失敗時のログ出力
- 無効な入力値の検証
- TSV解析エラーの処理
- DOM要素不存在の処理

## Usage Examples

```javascript
// データ読み込み
await loadTSVData();

// スーツケース情報
const suitcase = {
  width: 55,
  height: 40, 
  depth: 25,
  weight: 8.5,
  totalLength: 120
};

// 互換性チェック
const results = checkAllAirlines(suitcase);
console.log(`Compatible airlines: ${results.compatible.length}`);
```