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

// 画像を含むサンプルHTML
const sampleHTMLWithImages = `
<p>これは画像を含むコンテンツです。</p>
<img src="https://via.placeholder.com/800x400/3b82f6/ffffff?text=Sample+Image+1" alt="サンプル画像1" title="美しい風景写真">
<p>単体画像の後に段落が続きます。</p>
<figure>
    <img src="https://via.placeholder.com/600x300/10b981/ffffff?text=Figure+Image" alt="フィギュア内の画像" width="600" height="300">
    <figcaption>これはfigureタグで囲まれた画像とキャプションです。</figcaption>
</figure>
<p>複数の画像を含むコンテンツの例：</p>
<img src="https://via.placeholder.com/400x200/ef4444/ffffff?text=Small+Image" alt="小さな画像">
<blockquote>
    <p>画像の間に引用を入れることもできます。</p>
</blockquote>
<img src="https://via.placeholder.com/700x350/8b5cf6/ffffff?text=Another+Image" alt="もう一つの画像" loading="lazy">
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

// テスト4: カスタムCSS
console.log('\n4. カスタムCSS（カスタムフォント）:');
const customCSSParser = new MicroCMSRichParser({
	darkMode: false,
	customCSS: `
		.microcms-rich-content {
			font-family: 'Comic Sans MS', cursive, sans-serif !important;
			background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
			border-radius: 15px;
		}
		.rich-paragraph {
			color: #2c3e50 !important;
			font-size: 1.2rem !important;
		}
	`
});
const customCSSResult = customCSSParser.parse(sampleHTML);
console.log('✅ カスタムCSSパース成功 - 文字数:', customCSSResult.length);

// テスト5: 画像を含むHTML
console.log('\n5. 画像を含むHTML:');
const imageResult = parseMicroCMSHTML(sampleHTMLWithImages);
console.log('✅ 画像パース成功 - 文字数:', imageResult.length);

// テスト6: 画像付きダークモード
console.log('\n6. 画像付きダークモード:');
const imageDarkResult = parseMicroCMSHTML(sampleHTMLWithImages, { darkMode: true });
console.log('✅ 画像付きダークモードパース成功 - 文字数:', imageDarkResult.length);

// テスト7: 生成されたHTMLの確認
console.log('\n7. 生成されたHTMLの確認:');
console.log('- ライトモード CSS クラス含有:', lightModeResult.includes('microcms-rich-content'));
console.log('- ダークモード CSS クラス含有:', darkModeResult.includes('dark-mode'));
console.log('- スタイル要素含有:', lightModeResult.includes('<style>'));
console.log('- カスタムCSS含有:', customCSSResult.includes('Comic Sans MS'));
console.log('- 画像クラス含有:', imageResult.includes('rich-image'));
console.log('- フィギュアクラス含有:', imageResult.includes('rich-figure'));
console.log('- キャプションクラス含有:', imageResult.includes('rich-figcaption'));

// テスト8: HTMLファイル出力
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
    
    <h1>カスタムCSS</h1>
    ${customCSSResult}
    
    <h1>画像を含むコンテンツ（ライトモード）</h1>
    ${imageResult}
    
    <h1>画像を含むコンテンツ（ダークモード）</h1>
    ${imageDarkResult}
</body>
</html>`;

fs.writeFileSync(`${__dirname}/test-output.html`, testHTML);
console.log('\n8. HTMLファイル出力:');
console.log('✅ test-output.html を生成しました（画像テストケースを含む）');

console.log('\n=== テスト完了 ===');
console.log('ブラウザで examples/test-output.html を開いて結果を確認してください。');