module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'comma-dangle': ['error', 'never']
  },
  globals: {
    loadTSVData: 'readonly',
    parseTSV: 'readonly',
    checkCompatibility: 'readonly',
    checkAllAirlines: 'readonly',
    checkSuitcaseCompatibility: 'readonly',
    displayResults: 'readonly',
    createAirlineCard: 'readonly',
    createRestrictionsHtml: 'readonly',
    t: 'readonly',
    currentLanguage: 'readonly',
    airlinesData: 'writable',
    baggageData: 'writable',
    countriesData: 'writable'
  }
};
