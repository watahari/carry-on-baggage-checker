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

function createMockSuitcase(width, height, depth, weight = null) {
    return {
        width,
        height,
        depth,
        weight,
        totalLength: width + height + depth
    };
}

function createMockBaggage(icao, w, h, d, length = null, weight = null, type = '-', condition = '-') {
    return {
        'ICAO code': icao,
        '種別': type,
        '条件': condition,
        'W(cm)': w.toString(),
        'H(cm)': h.toString(),
        'D(cm)': d.toString(),
        'Length(cm)': length === null ? 'N/A' : length.toString(),
        'Weight(kg)': weight === null ? 'N/A' : weight.toString()
    };
}

module.exports = {
    parseTSV,
    checkSuitcaseCompatibility,
    createMockSuitcase,
    createMockBaggage
};