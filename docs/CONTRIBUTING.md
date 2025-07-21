# Contributing Guide

このプロジェクトへの貢献方法について説明します。

## 開発環境のセットアップ

### 必要なソフトウェア
- Node.js 18以上
- npm または yarn
- Git

### 初期セットアップ
```bash
# リポジトリをフォーク・クローン
git clone <your-fork-url>
cd Can_my_suitcase_be_carried_on_the_plane

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 開発ワークフロー

### 1. ブランチ作成
```bash
git checkout -b feature/your-feature-name
```

### 2. 開発
- コードを変更
- テストを追加・実行
- リント・フォーマットを実行

### 3. テスト実行
```bash
# 全テスト実行
npm test

# カバレッジ確認
npm run test:coverage

# リント実行
npm run lint

# フォーマット実行
npm run format
```

### 4. コミット
```bash
git add .
git commit -m "feat: 新機能の説明"
```

### 5. プッシュ・プルリクエスト
```bash
git push origin feature/your-feature-name
```

## コーディング規約

### JavaScript
- ES2021+ の機能を使用
- 2スペースインデント
- セミコロン必須
- シングルクォート使用
- ESLint ルールに従う

### HTML
- セマンティックなマークアップ
- 多言語対応のためdata-i18n属性を使用
- アクセシビリティを考慮

### CSS
- BEM記法の使用を推奨
- レスポンシブデザイン対応
- CSS変数の活用

## データファイル編集

TSVファイルを編集する際の注意点：

### 形式の維持
- タブ区切り形式を厳密に維持
- ヘッダー行の構造と列順序を保持
- 日英バイリンガル対応の一貫性

### データの整合性
- ICAOコードの一致（airline.tsvとcarry-on-baggage.tsv間）
- 寸法データはcm/kg単位で統一
- 航空機定員の考慮（国内線での100席以上/未満）

## テストの追加

新機能を追加する際は、対応するテストも必ず追加してください：

```javascript
// test/your-feature.test.js
import { describe, test, expect } from '@jest/globals';

describe('Your Feature', () => {
  test('should work correctly', () => {
    // テストコード
    expect(result).toBe(expected);
  });
});
```

## プルリクエスト

プルリクエストを作成する際は：

1. **明確なタイトル**：変更内容が分かるタイトルを付ける
2. **詳細な説明**：変更内容と理由を説明
3. **テストの実行**：すべてのテストがパスすることを確認
4. **スクリーンショット**：UI変更がある場合は画像を添付

### PRテンプレート
```markdown
## 概要
変更内容の簡潔な説明

## 変更内容
- [ ] 機能追加
- [ ] バグ修正
- [ ] ドキュメント更新
- [ ] リファクタリング

## テスト
- [ ] 既存テストがパス
- [ ] 新しいテストを追加
- [ ] 手動テストを実行

## 確認事項
- [ ] リント・フォーマットを実行
- [ ] ブラウザ動作確認
- [ ] 多言語表示確認
```

## 問題報告

バグを見つけた場合は、以下の情報を含めてIssueを作成してください：

- ブラウザとバージョン
- 再現手順
- 期待される動作
- 実際の動作
- エラーメッセージ（あれば）

## 機能提案

新機能のアイデアがある場合は、Issueで提案してください：

- 提案の背景と目的
- 想定される利用シーン
- 実装の概要案
- 既存機能への影響

ご貢献をお待ちしています！