# 手荷物持ち込み判定ツール / Carry-on Baggage Checker

スーツケースのサイズを入力すると、どの航空会社で手荷物として持ち込めるかを判定するWebアプリケーションです。

A web application that determines which airlines allow your suitcase as carry-on baggage based on the dimensions you input.

## 🌟 主な機能 / Features

- 📏 スーツケースサイズ入力（幅・高さ・奥行き・重量）
- ✈️ 航空会社別の持ち込み判定
- 🌍 多言語対応（日本語・英語）
- 📱 レスポンシブデザイン
- 🧪 包括的なテストカバレッジ

- 📏 Suitcase dimension input (width, height, depth, weight)
- ✈️ Airline-specific compatibility checking
- 🌍 Multi-language support (Japanese/English)
- 📱 Responsive design
- 🧪 Comprehensive test coverage

## 🚀 クイックスタート / Quick Start

### 必要環境 / Prerequisites

- Node.js 18以上 / Node.js 18+
- npm または yarn / npm or yarn
- モダンWebブラウザ / Modern web browser

### インストール / Installation

```bash
# リポジトリをクローン / Clone the repository
git clone <repository-url>
cd Can_my_suitcase_be_carried_on_the_plane

# 依存関係をインストール / Install dependencies
npm install

# 開発サーバーを起動 / Start development server
npm start
```

ブラウザで `http://localhost:8000` にアクセスしてください。
Access `http://localhost:8000` in your browser.

## 📁 プロジェクト構造 / Project Structure

```
.
├── public/                 # 静的ファイル / Static files
│   ├── index.html         # メインHTML / Main HTML
│   └── test-runner.html   # テスト実行ページ / Test runner page
├── src/                   # ソースコード / Source code
│   ├── js/               # JavaScriptファイル / JavaScript files
│   │   ├── script.js     # メインロジック / Main logic
│   │   ├── i18n.js       # 国際化 / Internationalization
│   │   └── modules.js    # モジュール関数 / Module functions
│   └── css/              # スタイルシート / Stylesheets
│       └── styles.css    # メインスタイル / Main styles
├── data/                 # データファイル / Data files
│   ├── airline.tsv       # 航空会社データ / Airline data
│   ├── carry-on-baggage.tsv # 手荷物規定 / Baggage regulations
│   ├── country.tsv       # 国家データ / Country data
│   └── suitcase.tsv      # スーツケースデータ / Suitcase data
├── test/                 # テストファイル / Test files
└── docs/                 # ドキュメント / Documentation
```

## 📊 データ構造 / Data Structure

このプロジェクトは4つのTSVファイルによる関係データベース構造を持ちます：
This project uses a relational database structure with four TSV files:

### airline.tsv
航空会社の基本情報（ICAO/IATAコード、日英名称、所属国）
Basic airline information (ICAO/IATA codes, Japanese/English names, countries)

### carry-on-baggage.tsv
航空会社別の手荷物制限（寸法・重量・路線別制限）
Airline-specific baggage restrictions (dimensions, weight, route-specific limits)

### country.tsv
国家・地域データ（多言語対応）
Country and regional data (multilingual support)

### suitcase.tsv
スーツケース製品カタログ（正確な寸法・重量）
Suitcase product catalog (precise dimensions and weights)

## 🛠️ 開発 / Development

### 利用可能なスクリプト / Available Scripts

```bash
# 開発サーバー起動 / Start development server
npm start

# テスト実行 / Run tests
npm test

# テスト監視モード / Watch mode tests
npm run test:watch

# カバレッジ付きテスト / Tests with coverage
npm run test:coverage

# リント実行 / Run linter
npm run lint

# リント修正 / Fix linting issues
npm run lint:fix

# コード整形 / Format code
npm run format

# ビルド / Build
npm run build

# クリーンアップ / Clean up
npm run clean
```

### 開発環境設定 / Development Environment

プロジェクトには以下の開発ツールが設定されています：
The project includes the following development tools:

- **ESLint**: コード品質チェック / Code quality checking
- **Prettier**: コード整形 / Code formatting
- **Jest**: テストフレームワーク / Testing framework
- **EditorConfig**: エディタ設定統一 / Editor configuration consistency

## 🧪 テスト / Testing

包括的なテストスイートが含まれています：
Includes a comprehensive test suite:

- ✅ データ読み込みテスト / Data loading tests
- ✅ 互換性判定ロジックテスト / Compatibility logic tests
- ✅ 国際化機能テスト / Internationalization tests
- ✅ ユーザーインタラクションテスト / User interaction tests
- ✅ エッジケーステスト / Edge case tests
- ✅ パフォーマンステスト / Performance tests
- ✅ エンドツーエンドテスト / End-to-end tests

```bash
# 全テスト実行 / Run all tests
npm test

# 特定のテストファイル実行 / Run specific test file
npm test -- test/script.test.js

# カバレッジレポート生成 / Generate coverage report
npm run test:coverage
```

## 🌐 多言語対応 / Internationalization

アプリケーションは日本語と英語をサポートしています：
The application supports Japanese and English:

- 動的言語切替 / Dynamic language switching
- パラメータ付き翻訳 / Parameterized translations
- ローカライズされたデータ表示 / Localized data display

翻訳の追加や修正は `src/js/i18n.js` で行えます。
Add or modify translations in `src/js/i18n.js`.

## 📋 コントリビューション / Contributing

1. フォークしてブランチを作成 / Fork and create branch
2. 変更を実装 / Implement changes
3. テストを追加・実行 / Add and run tests
4. リント・フォーマットを実行 / Run linting and formatting
5. プルリクエストを作成 / Create pull request

## 📄 ライセンス / License

MIT License - 詳細は LICENSE ファイルを参照してください。
MIT License - see LICENSE file for details.

## ⚠️ 免責事項 / Disclaimer

このツールは参考情報として提供されます。実際の搭乗前には各航空会社の最新規定を必ずご確認ください。

This tool is provided for reference purposes. Always check the latest regulations from each airline before actual boarding.