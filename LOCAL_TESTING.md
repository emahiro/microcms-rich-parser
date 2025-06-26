# MicroCMS Rich Parser - ローカルテストガイド

このドキュメントでは、`microcms-rich-parser` ライブラリをローカル環境で簡単にテストする方法を説明します。

## 🚀 クイックスタート

### 前提条件

- Node.js がインストールされていること
- ライブラリがビルドされていること

### 1. ライブラリのビルド

```bash
cd /Users/hiromichiema/src/github.com/emahiro/llmlab/microcms-rich-parser
npm install
npm run build
```

### 2. テスト方法の選択

以下の3つの方法でライブラリをテストできます：

## 📋 方法1: Node.js でのテスト

最もシンプルな方法です。コマンドラインで結果を確認できます。

```bash
# examples ディレクトリに移動
cd examples

# Node.js テストスクリプトを実行
node test-node.js
```

### 実行結果

```
=== MicroCMS Rich Parser テスト ===

1. 基本的な使用方法（ライトモード）:
✅ パース成功 - 文字数: 12345

2. ダークモード:
✅ ダークモードパース成功 - 文字数: 12456

3. カスタムクラス名:
✅ カスタムクラス名パース成功

4. 生成されたHTMLの確認:
- ライトモード CSS クラス含有: true
- ダークモード CSS クラス含有: true
- スタイル要素含有: true

5. HTMLファイル出力:
✅ test-output.html を生成しました

=== テスト完了 ===
ブラウザで examples/test-output.html を開いて結果を確認してください。
```

## 🌐 方法2: ブラウザでのインタラクティブテスト

実際のブラウザでスタイリングを確認できます。

### ローカルサーバーの起動

```bash
# examples ディレクトリに移動
cd examples

# Python を使ったローカルサーバー（推奨）
python3 -m http.server 8080

# または npm を使用
npm run serve
```

### ブラウザでアクセス

1. ブラウザで `http://localhost:8080` にアクセス
2. `test-browser.html` をクリック
3. インタラクティブなテストページが表示されます

### 利用可能な機能

- 🌙 **ダークモード切り替え**: チェックボックスでライト/ダークモードを切り替え
- 🎨 **カスタムクラス名**: CSS クラス名をカスタマイズ
- 🔄 **リアルタイム更新**: 設定変更時に即座に結果を反映
- 📄 **生HTML表示**: 生成されたHTMLコードを確認

## 📁 方法3: 静的ファイルとして直接開く

サーバーを起動せずに、直接HTMLファイルを開くことも可能です。

```bash
# test-output.html を直接ブラウザで開く
open examples/test-output.html  # macOS
start examples/test-output.html # Windows
xdg-open examples/test-output.html # Linux
```

## 📂 ファイル構成

```
microcms-rich-parser/
├── examples/
│   ├── test-node.js           # Node.js テストスクリプト
│   ├── test-browser.html      # ブラウザテストページ
│   ├── test-output.html       # 生成されるテスト結果
│   └── package.json          # examples用の設定
├── dist/
│   ├── index.js              # ビルドされたライブラリ
│   └── index.d.ts            # TypeScript定義ファイル
└── src/
    └── index.ts              # ソースコード
```

## 🧪 テスト内容

### 含まれているテストケース

1. **基本的なパース機能**
   - MicroCMSのHTMLレスポンスを正しくパースできるか
   - CSSスタイルが適用されているか

2. **ダークモード**
   - ダークモード用のCSSクラスが適用されるか
   - 色彩設定が正しく反映されるか

3. **カスタマイズ機能**
   - カスタムクラス名が設定できるか
   - オプションが正しく動作するか

4. **HTMLエレメントの処理**
   - 段落（`<p>`）のスタイリング
   - ブロッククォート（`<blockquote>`）の装飾
   - リンク（`<a>`）のスタイリング
   - 水平線（`<hr>`）の装飾

### サンプルデータ

テストには実際のMicroCMSレスポンスを模したHTMLデータを使用しています：

- 日本語テキスト
- ブロッククォート
- 外部リンク
- 水平線
- 複数段落の構成

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. "Cannot find module" エラー

```bash
# ライブラリをビルドし直す
npm run build

# Node.js のバージョンを確認
node --version
```

#### 2. ブラウザでスタイルが適用されない

- ローカルサーバーを使用してアクセスしているか確認
- ブラウザの開発者ツールでコンソールエラーを確認
- `dist/index.js` ファイルが存在するか確認

#### 3. 文字化けが発生する

- HTMLファイルの文字エンコーディングが UTF-8 に設定されているか確認
- ブラウザの文字エンコーディング設定を確認

#### 4. CSS スタイルが読み込まれない

- ライブラリが CSS を内部に含んでいるため、外部CSSファイルは不要
- `npm run build` でビルドが正常に完了しているか確認

## 📝 カスタマイズ

### 独自のテストデータを使用する

`test-node.js` または `test-browser.html` 内の `sampleHTML` 変数を編集してください：

```javascript
const sampleHTML = `あなたのMicroCMSレスポンスHTMLをここに貼り付け`;
```

### スタイルのカスタマイズ

生成されるCSSをカスタマイズしたい場合は、`src/index.ts` を編集してから再ビルドしてください：

```bash
# ソースコードを編集後
npm run build

# テストを再実行
cd examples
node test-node.js
```

## 🎯 次のステップ

ローカルテストが成功したら：

1. **本番環境での統合**: 実際のプロジェクトにライブラリを組み込み
2. **NPM公開**: README.md の公開手順に従ってNPMに公開
3. **カスタマイズ**: 必要に応じてスタイルや機能を拡張

## 📞 サポート

問題が発生した場合：

1. ブラウザの開発者ツールでエラーを確認
2. Node.js のバージョンが対応しているか確認
3. ライブラリが最新の状態でビルドされているか確認

---

**Happy Coding! 🚀**