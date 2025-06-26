const { parseMicroCMSHTML, MicroCMSRichParser } = require('../dist/index.js');

// MicroCMSから返されるサンプルHTML
const sampleHTML = `
<p>これは最初の段落です。Here is some English text.</p>
<p>これは2番目の段落で、<a href="https://example.com" target="_blank" rel="noopener noreferrer">外部サイトへのリンク</a>が含まれています。</p>
<blockquote><p>これは引用ブロックです。引用はインデントされ、スタイルが適用されます。</p></blockquote>
<p>段落には、<strong>太字</strong>、<em>イタリック</em>、<u>下線</u>などの基本的な書式設定を含めることができます。</p>
<hr>
<p>これは水平線の下にある最後の段落です。</p>
`;

console.log('=== MicroCMS Rich Parser テスト ===\n');

// テスト1: 基本的な使用方法
console.log('1. 基本的な使用方法（ライトモード）:');
const lightModeResult = parseMicroCMSHTML(sampleHTML);
console.log('✅ パース成功 - 文字数:', lightModeResult.length);

// テスト2: ダークモード
console.log('\n2. ダークモード:');
const darkModeResult = parseMicroCMSHTML(sampleHTML, { darkMode: true });
console.log('✅ ダークモードパース成功 - 文字数:', darkModeResult.length);

// テスト3: カスタムクラス名
console.log('\n3. カスタムクラス名:');
const parser = new MicroCMSRichParser({
	darkMode: false,
	className: 'my-custom-blog-content'
});
const customResult = parser.parse(sampleHTML);
console.log('✅ カスタムクラス名パース成功 - 文字数:', customResult.length);

// テスト4: 生成されたHTMLの確認
console.log('\n4. 生成されたHTMLの確認:');
console.log('- ライトモード CSS クラス含有:', lightModeResult.includes('microcms-rich-content'));
console.log('- ダークモード CSS クラス含有:', darkModeResult.includes('dark-mode'));
console.log('- スタイル要素含有:', lightModeResult.includes('<style>'));

// テスト5: HTMLファイル出力
const fs = require('node:fs');
const testHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MicroCMS Rich Parser - ローカルテスト</title>
</head>
<body>
    <h1>ライトモード</h1>
    ${lightModeResult}
    
    <h1>ダークモード</h1>
    ${darkModeResult}
</body>
</html>`;

fs.writeFileSync(`${__dirname}/test-output.html`, testHTML);
console.log('\n5. HTMLファイル出力:');
console.log('✅ test-output.html を生成しました');

console.log('\n=== テスト完了 ===');
console.log('ブラウザで examples/test-output.html を開いて結果を確認してください。');