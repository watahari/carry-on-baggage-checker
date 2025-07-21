# 手荷物持ち込み判定ツール

スーツケースのサイズを入力すると、どの航空会社で手荷物として持ち込めるかを判定するWebアプリケーションです。

## 機能

- ✈️ **多言語対応**: 日本語・英語の自動切り替え
- 📊 **包括的判定**: 170以上の航空会社データに対応
- 🧳 **詳細制限表示**: 各航空会社の具体的な制限内容を表示
- 📱 **レスポンシブ**: PC・タブレット・スマホ対応
- 🧪 **テスト済み**: 包括的な自動テストスイート

## 使用方法

### Webサーバーでの実行

```bash
# Python 3の場合
python3 -m http.server 8000

# Node.jsの場合（npx serve）
npx serve .

# 任意のWebサーバー
# ファイルをWebサーバーのドキュメントルートに配置
```

ブラウザで `http://localhost:8000` を開きます。

### テストの実行

#### 1. Jest（Node.js）でのテスト実行

```bash
# 依存関係をインストール
npm install

# すべてのテストを実行
npm test

# 監視モードでテスト実行
npm run test:watch

# カバレッジ付きテスト実行
npm run test:coverage
```

#### 2. ブラウザでのテスト実行

```bash
# Webサーバーを起動
npm run serve
```

ブラウザで `http://localhost:8000/test-runner.html` を開き、「すべてのテストを実行」ボタンをクリックします。

## ファイル構成

```
├── index.html           # メインページ
├── styles.css          # スタイルシート
├── script.js           # メインロジック
├── i18n.js             # 多言語システム
├── airline.tsv         # 航空会社データ
├── carry-on-baggage.tsv # 手荷物制限データ
├── country.tsv         # 国データ
├── suitcase.tsv        # スーツケースデータ
├── package.json        # Node.js設定
├── test-runner.html    # ブラウザテスト実行ページ
└── test/               # テストファイル
    ├── setup.js
    ├── test-utils.js
    ├── data-loading.test.js
    ├── compatibility-logic.test.js
    ├── i18n.test.js
    └── integration.test.js
```

## テスト内容

### 1. データ読み込み機能テスト (`data-loading.test.js`)
- TSVデータの解析
- エラーハンドリング
- 不正データの処理

### 2. 判定ロジックテスト (`compatibility-logic.test.js`)
- 寸法チェック（幅・高さ・奥行き）
- 重量制限チェック
- 3辺合計制限チェック
- 境界値テスト
- LCC・国内線・機材サイズによる制限

### 3. 多言語機能テスト (`i18n.test.js`)
- 翻訳機能
- パラメータ置換
- 言語切り替え
- ローカルストレージ連携
- DOM操作

### 4. 統合テスト (`integration.test.js`)
- エンドツーエンドシナリオ
- 複数航空会社での判定
- 実データパターンテスト
- パフォーマンステスト

## データ構造

### 航空会社データ (`airline.tsv`)
- ICAO code: 国際航空運送協会コード
- IATA code: 国際航空運輸協会コード
- 航空会社名: 日本語名
- Airline name: 英語名
- Country: 国名

### 手荷物制限データ (`carry-on-baggage.tsv`)
- ICAO code: 航空会社コード
- 種別: 国内/国際
- 条件: 機材サイズ条件
- W/H/D: 幅・高さ・奥行き制限（cm）
- Length: 3辺合計制限（cm）
- Weight: 重量制限（kg）

## 開発者向け

### 新しいテストの追加

1. `test/` ディレクトリに新しいテストファイルを作成
2. Jest形式でテストを記述
3. `package.json` のテストスクリプトで実行確認

### データの更新

TSVファイルを編集する際は、以下に注意：
- タブ区切り形式を維持
- ヘッダー行を変更しない
- ICAOコードの整合性を保つ

### ブラウザ対応

- Chrome/Safari/Firefox/Edge の最新版
- スマートフォンブラウザ対応
- IE11以前は非対応

## ライセンス

MIT License