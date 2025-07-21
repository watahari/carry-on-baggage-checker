// テスト可能なモジュール化されたバージョン
let airlinesData = [];
let baggageData = [];
let countriesData = [];

function parseTSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t');
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split('\t');
    if (row.length === headers.length) {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      data.push(rowData);
    }
  }

  return data;
}

async function loadTSVData() {
  try {
    const [airlinesResponse, baggageResponse, countriesResponse] = await Promise.all([
      fetch('data/airline.tsv'),
      fetch('data/carry-on-baggage.tsv'),
      fetch('data/country.tsv')
    ]);

    const airlinesText = await airlinesResponse.text();
    const baggageText = await baggageResponse.text();
    const countriesText = await countriesResponse.text();

    airlinesData = parseTSV(airlinesText);
    baggageData = parseTSV(baggageText);
    countriesData = parseTSV(countriesText);

    return { airlinesData, baggageData, countriesData };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

function checkSuitcaseCompatibility(suitcase, baggage) {
  const maxW = parseFloat(baggage['W(cm)']);
  const maxH = parseFloat(baggage['H(cm)']);
  const maxD = parseFloat(baggage['D(cm)']);
  const maxLength = baggage['Length(cm)'] === 'N/A' ? null : parseFloat(baggage['Length(cm)']);
  const maxWeight = baggage['Weight(kg)'] === 'N/A' ? null : parseFloat(baggage['Weight(kg)']);

  if (isNaN(maxW) || isNaN(maxH) || isNaN(maxD)) return false;

  const dimensionsMatch =
    suitcase.width <= maxW && suitcase.height <= maxH && suitcase.depth <= maxD;

  const lengthMatch = maxLength === null || suitcase.totalLength <= maxLength;
  const weightMatch =
    maxWeight === null || suitcase.weight === null || suitcase.weight <= maxWeight;

  return dimensionsMatch && lengthMatch && weightMatch;
}

function checkAllAirlines(suitcase) {
  const compatible = [];
  const incompatible = [];

  baggageData.forEach(baggage => {
    const airline = airlinesData.find(a => a['ICAO code'] === baggage['ICAO code']);
    if (!airline) return;

    const country = countriesData.find(c => c['Country'] === airline['Country']);
    const isCompatible = checkSuitcaseCompatibility(suitcase, baggage);

    const result = {
      icao: baggage['ICAO code'],
      iata: airline['IATA code'],
      nameJa: airline['航空会社名'],
      nameEn: airline['Airline name'],
      country: airline['Country'],
      countryJa: country ? country['国名'] : airline['Country'],
      type: baggage['種別'],
      condition: baggage['条件'],
      restrictions: {
        width: parseFloat(baggage['W(cm)']),
        height: parseFloat(baggage['H(cm)']),
        depth: parseFloat(baggage['D(cm)']),
        length: baggage['Length(cm)'] === 'N/A' ? null : parseFloat(baggage['Length(cm)']),
        weight: baggage['Weight(kg)'] === 'N/A' ? null : parseFloat(baggage['Weight(kg)'])
      }
    };

    if (isCompatible) {
      compatible.push(result);
    } else {
      incompatible.push(result);
    }
  });

  return { compatible, incompatible };
}

function validateSuitcaseInput(width, height, depth, weight) {
  const errors = [];

  const w = parseFloat(width);
  const h = parseFloat(height);
  const d = parseFloat(depth);
  const wt = parseFloat(weight);

  if (isNaN(w) || w <= 0 || w > 300) {
    errors.push('幅は1-300cmの範囲で入力してください');
  }

  if (isNaN(h) || h <= 0 || h > 300) {
    errors.push('高さは1-300cmの範囲で入力してください');
  }

  if (isNaN(d) || d <= 0 || d > 300) {
    errors.push('奥行きは1-300cmの範囲で入力してください');
  }

  if (weight !== null && weight !== undefined && !isNaN(wt) && (wt < 0 || wt > 100)) {
    errors.push('重量は0-100kgの範囲で入力してください');
  }

  return errors;
}

function calculateSuitcaseVolume(width, height, depth) {
  return width * height * depth;
}

function categorizeAirlinesByRegion(results) {
  const regions = {};

  results.forEach(airline => {
    const country = countriesData.find(c => c['Country'] === airline.country);
    const region = country ? country['地域'] : 'その他';

    if (!regions[region]) {
      regions[region] = [];
    }
    regions[region].push(airline);
  });

  return regions;
}

function findSimilarSuitcases(userSuitcase) {
  // 実際のスーツケースデータとの比較
  return []; // 実装は後で行う
}

function generateCompatibilityReport(suitcase, results) {
  const totalAirlines = results.compatible.length + results.incompatible.length;
  const compatibilityRate =
    totalAirlines === 0 ? 0 : (results.compatible.length / totalAirlines) * 100;

  const regionBreakdown = categorizeAirlinesByRegion(results.compatible);

  const restrictionAnalysis = {
    weightIssues: results.incompatible.filter(
      a =>
        suitcase.weight &&
        a.restrictions &&
        a.restrictions.weight &&
        suitcase.weight > a.restrictions.weight
    ).length,
    dimensionIssues: results.incompatible.filter(
      a =>
        a.restrictions &&
        (suitcase.width > a.restrictions.width ||
          suitcase.height > a.restrictions.height ||
          suitcase.depth > a.restrictions.depth)
    ).length,
    lengthIssues: results.incompatible.filter(
      a => a.restrictions && a.restrictions.length && suitcase.totalLength > a.restrictions.length
    ).length
  };

  return {
    compatibilityRate,
    regionBreakdown,
    restrictionAnalysis,
    totalAirlines,
    volume: calculateSuitcaseVolume(suitcase.width, suitcase.height, suitcase.depth)
  };
}

// Node.jsとブラウザの両方で使用可能にする
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseTSV,
    loadTSVData,
    checkSuitcaseCompatibility,
    checkAllAirlines,
    validateSuitcaseInput,
    calculateSuitcaseVolume,
    categorizeAirlinesByRegion,
    generateCompatibilityReport,
    findSimilarSuitcases,
    // データアクセス用
    getAirlinesData: () => airlinesData,
    getBaggageData: () => baggageData,
    getCountriesData: () => countriesData,
    setTestData: (airlines, baggage, countries) => {
      airlinesData = airlines || [];
      baggageData = baggage || [];
      countriesData = countries || [];
    }
  };
}

// ブラウザ用のグローバル関数
if (typeof window !== 'undefined') {
  window.parseTSV = parseTSV;
  window.loadTSVData = loadTSVData;
  window.checkSuitcaseCompatibility = checkSuitcaseCompatibility;
  window.checkAllAirlines = checkAllAirlines;
  window.validateSuitcaseInput = validateSuitcaseInput;
  window.generateCompatibilityReport = generateCompatibilityReport;
}
