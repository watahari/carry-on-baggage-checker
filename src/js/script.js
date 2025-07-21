let airlinesData = [];
let baggageData = [];
let countriesData = [];

async function loadTSVData() {
    try {
        const [airlinesResponse, baggageResponse, countriesResponse] = await Promise.all([
            fetch('../data/airline.tsv'),
            fetch('../data/carry-on-baggage.tsv'),
            fetch('../data/country.tsv')
        ]);

        const airlinesText = await airlinesResponse.text();
        const baggageText = await baggageResponse.text();
        const countriesText = await countriesResponse.text();

        airlinesData = parseTSV(airlinesText);
        baggageData = parseTSV(baggageText);
        countriesData = parseTSV(countriesText);

        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

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

function checkCompatibility() {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const depth = parseFloat(document.getElementById('depth').value);
    const weight = parseFloat(document.getElementById('weight').value) || null;

    if (!width || !height || !depth) {
        alert(t('please-enter-size'));
        return;
    }

    const totalLength = width + height + depth;
    const userSuitcase = { width, height, depth, weight, totalLength };

    const results = checkAllAirlines(userSuitcase);
    displayResults(userSuitcase, results);
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

function checkSuitcaseCompatibility(suitcase, baggage) {
    const maxW = parseFloat(baggage['W(cm)']);
    const maxH = parseFloat(baggage['H(cm)']);
    const maxD = parseFloat(baggage['D(cm)']);
    const maxLength = baggage['Length(cm)'] === 'N/A' ? null : parseFloat(baggage['Length(cm)']);
    const maxWeight = baggage['Weight(kg)'] === 'N/A' ? null : parseFloat(baggage['Weight(kg)']);

    if (isNaN(maxW) || isNaN(maxH) || isNaN(maxD)) return false;

    const dimensionsMatch = suitcase.width <= maxW && 
                           suitcase.height <= maxH && 
                           suitcase.depth <= maxD;

    const lengthMatch = maxLength === null || suitcase.totalLength <= maxLength;
    const weightMatch = maxWeight === null || suitcase.weight === null || suitcase.weight <= maxWeight;

    return dimensionsMatch && lengthMatch && weightMatch;
}

function displayResults(suitcase, results) {
    const resultsSection = document.getElementById('resultsSection');
    const suitcaseInfo = document.getElementById('suitcaseInfo');
    const compatibleList = document.getElementById('compatibleList');
    const incompatibleList = document.getElementById('incompatibleList');

    let suitcaseInfoHtml = `
        <p><strong>${t('suitcase-size', {
            width: suitcase.width,
            height: suitcase.height,
            depth: suitcase.depth
        })}</strong></p>
        <p>${t('total-length', { length: suitcase.totalLength })}</p>
    `;

    if (suitcase.weight) {
        suitcaseInfoHtml += `<p>${t('suitcase-weight', { weight: suitcase.weight })}</p>`;
    }

    suitcaseInfo.innerHTML = suitcaseInfoHtml;

    compatibleList.innerHTML = results.compatible.length > 0 
        ? results.compatible.map(airline => createAirlineCard(airline, true)).join('')
        : `<p class="no-results">${t('no-compatible')}</p>`;

    incompatibleList.innerHTML = results.incompatible.length > 0
        ? results.incompatible.map(airline => createAirlineCard(airline, false)).join('')
        : '<p class="no-results">-</p>';

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createAirlineCard(airline, isCompatible) {
    const airlineName = currentLanguage === 'ja' ? airline.nameJa : (airline.nameEn || airline.nameJa);
    const countryName = currentLanguage === 'ja' ? airline.countryJa : airline.country;
    
    let typeText = '';
    if (airline.type === '国内') {
        typeText = t('domestic');
    } else if (airline.type === '国際') {
        typeText = t('international');
    }
    
    let conditionText = '';
    if (airline.condition === '100席以上') {
        conditionText = t('over-100-seats');
    } else if (airline.condition === '100席未満') {
        conditionText = t('under-100-seats');
    }

    const restrictionsHtml = createRestrictionsHtml(airline.restrictions);

    return `
        <div class="airline-card ${isCompatible ? 'compatible' : 'incompatible'}">
            <div class="airline-header">
                <span class="airline-name">${airlineName}</span>
                <span class="airline-code">${airline.iata}</span>
            </div>
            <div class="airline-details">
                <span class="country">${countryName}</span>
                ${typeText ? `<span class="route-type">${typeText}</span>` : ''}
                ${conditionText ? `<span class="aircraft-condition">${conditionText}</span>` : ''}
            </div>
            <div class="restrictions">
                ${restrictionsHtml}
            </div>
        </div>
    `;
}

function createRestrictionsHtml(restrictions) {
    let html = '';
    
    if (!isNaN(restrictions.width) && !isNaN(restrictions.height) && !isNaN(restrictions.depth)) {
        html += `<div class="restriction-item">${t('dimension-limit', {
            w: restrictions.width,
            h: restrictions.height,
            d: restrictions.depth
        })}</div>`;
    }
    
    if (restrictions.weight !== null && !isNaN(restrictions.weight)) {
        html += `<div class="restriction-item">${t('weight-limit', { weight: restrictions.weight })}</div>`;
    } else {
        html += `<div class="restriction-item">${t('no-weight-limit')}</div>`;
    }
    
    if (restrictions.length !== null && !isNaN(restrictions.length)) {
        html += `<div class="restriction-item">${t('length-limit', { length: restrictions.length })}</div>`;
    } else {
        html += `<div class="restriction-item">${t('no-length-limit')}</div>`;
    }
    
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    loadTSVData();
});