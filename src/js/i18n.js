const translations = {
  ja: {
    title: 'スーツケース手荷物持ち込みチェッカー',
    'main-title': '手荷物持ち込み判定ツール',
    description:
      'スーツケースのサイズを入力すると、どの航空会社で手荷物として持ち込めるかを確認できます。',
    'input-title': 'スーツケースのサイズを入力してください',
    width: '幅 (W)',
    height: '高さ (H)',
    depth: '奥行き (D)',
    weight: '重量 (任意)',
    'cm-placeholder': 'cm',
    'kg-placeholder': 'kg',
    'check-button': '判定する',
    'results-title': '判定結果',
    'compatible-title': '持ち込み可能な航空会社',
    'incompatible-title': '持ち込み不可な航空会社',
    disclaimer:
      '※ 各航空会社の規定は変更される可能性があります。実際の搭乗前に各航空会社の最新情報をご確認ください。',
    'suitcase-size': 'スーツケースサイズ: {width} × {height} × {depth} cm',
    'suitcase-weight': '重量: {weight} kg',
    'total-length': '3辺合計: {length} cm',
    'no-compatible':
      '申し訳ございません。入力されたサイズでは持ち込み可能な航空会社が見つかりませんでした。',
    domestic: '国内線',
    international: '国際線',
    'over-100-seats': '100席以上',
    'under-100-seats': '100席未満',
    'dimension-limit': 'サイズ制限: {w} × {h} × {d} cm',
    'weight-limit': '重量制限: {weight} kg',
    'length-limit': '3辺合計制限: {length} cm',
    'no-weight-limit': '重量制限なし',
    'no-length-limit': '3辺合計制限なし',
    'please-enter-size': 'すべてのサイズ（幅、高さ、奥行き）を入力してください。'
  },
  en: {
    title: 'Carry-on Baggage Checker',
    'main-title': 'Carry-on Baggage Checker; Can my suitcase be carried on the plane?',
    description:
      'Enter your suitcase dimensions to check which airlines allow it as carry-on baggage.',
    'input-title': 'Please enter your suitcase dimensions',
    width: 'Width (W)',
    height: 'Height (H)',
    depth: 'Depth (D)',
    weight: 'Weight (Optional)',
    'cm-placeholder': 'cm',
    'kg-placeholder': 'kg',
    'check-button': 'Check',
    'results-title': 'Results',
    'compatible-title': 'Airlines that allow carry-on',
    'incompatible-title': 'Airlines that do not allow carry-on',
    disclaimer:
      '* Airline regulations may change. Please check the latest information from each airline before your actual flight.',
    'suitcase-size': 'Suitcase size: {width} × {height} × {depth} cm',
    'suitcase-weight': 'Weight: {weight} kg',
    'total-length': 'Total dimensions: {length} cm',
    'no-compatible':
      'Sorry, no airlines were found that allow carry-on for the entered dimensions.',
    domestic: 'Domestic',
    international: 'International',
    'over-100-seats': 'Over 100 seats',
    'under-100-seats': 'Under 100 seats',
    'dimension-limit': 'Size limit: {w} × {h} × {d} cm',
    'weight-limit': 'Weight limit: {weight} kg',
    'length-limit': 'Total dimensions limit: {length} cm',
    'no-weight-limit': 'No weight limit',
    'no-length-limit': 'No dimension limit',
    'please-enter-size': 'Please enter all dimensions (width, height, depth).'
  }
};

let currentLanguage = 'ja';

function t(key, params = {}) {
  let text = translations[currentLanguage][key] || key;

  for (const [param, value] of Object.entries(params)) {
    text = text.replace(`{${param}}`, value);
  }

  return text;
}

function setLanguage(lang) {
  if (!translations[lang]) return;

  currentLanguage = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = t(key);
  });

  document.title = t('title');

  localStorage.setItem('preferred-language', lang);
}

function initializeLanguage() {
  const savedLang = localStorage.getItem('preferred-language');
  const browserLang = navigator.language.substring(0, 2);
  const defaultLang = savedLang || (translations[browserLang] ? browserLang : 'ja');

  setLanguage(defaultLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeLanguage);
