# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a data-driven system for determining carry-on baggage compatibility with airlines. The project maintains structured data about airlines, carry-on baggage restrictions, countries, and suitcase specifications to help users determine if their suitcase meets airline carry-on requirements.

## Data Architecture

The repository consists of four core TSV (Tab-Separated Values) files that form a relational dataset:

### Core Data Files

- **airline.tsv**: Airline directory with ICAO/IATA codes, Japanese and English names, and country associations
- **carry-on-baggage.tsv**: Airline-specific carry-on restrictions indexed by ICAO code, including dimensional limits (W/H/D cm), total length limits, and weight restrictions. Contains domestic/international route distinctions and aircraft size considerations (100席以上/100席未満)
- **country.tsv**: Geographic reference data mapping countries to regions with multilingual support
- **suitcase.tsv**: Product catalog of suitcase specifications with precise dimensions and weights

### Data Relationships

The dataset is designed around ICAO codes as primary keys linking airlines to their baggage policies. Country codes connect airlines to geographic regions. Suitcase dimensions can be cross-referenced against airline restrictions to determine compatibility.

### Data Characteristics

- Bilingual support (Japanese/English) across all datasets
- Metric measurements (centimeters, kilograms)
- Aircraft capacity considerations for domestic routes
- Regional categorization for airlines and countries

## Repository Structure

The project follows standard web development best practices:

```
.
├── public/                 # Static web assets
│   ├── index.html         # Main application page
│   └── test-runner.html   # Test execution page
├── src/                   # Source code
│   ├── js/               # JavaScript modules
│   │   ├── script.js     # Main application logic
│   │   ├── i18n.js       # Internationalization
│   │   └── modules.js    # Utility functions
│   └── css/              # Stylesheets
│       └── styles.css    # Main styles
├── data/                 # TSV data files
│   ├── airline.tsv       # Airline information
│   ├── carry-on-baggage.tsv # Baggage restrictions
│   ├── country.tsv       # Country data
│   └── suitcase.tsv      # Suitcase specifications
├── test/                 # Test suite
├── docs/                 # Documentation
└── .github/workflows/    # CI/CD pipelines
```

## Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Working with the Data

When modifying data files:
- Maintain tab-separated format precisely
- Preserve header structure and column order
- Keep bilingual naming consistency
- Ensure ICAO codes match between airline.tsv and carry-on-baggage.tsv
- Verify dimensional data follows cm/kg metric standards

## Testing

The project includes comprehensive test coverage:
- Unit tests for core functions
- Integration tests for data processing
- UI interaction tests
- Performance benchmarks
- Real data validation

Run tests with `npm test` before making changes.

## Code Style

- ESLint for code quality
- Prettier for consistent formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required