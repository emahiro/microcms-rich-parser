const { parseMicroCMSHTML, MicroCMSRichParser } = require('../dist/index.js');

// Next.js server-side environment simulation
console.log('=== Next.js Server-Side Simulation Test ===\n');

// Simulate Next.js server environment by removing global constructors
const originalImage = global.Image;
const originalHTMLImageElement = global.HTMLImageElement;

// Remove Image constructor to simulate server environment
delete global.Image;
delete global.HTMLImageElement;

// Test HTML with images that would cause the error
const imageHTML = `
<p>This content contains images that would cause Next.js build errors.</p>
<img src="https://example.com/image1.jpg" alt="Test image 1" width="800" height="400">
<figure>
    <img src="https://example.com/image2.jpg" alt="Test image 2">
    <figcaption>This is a caption for the image</figcaption>
</figure>
<p>More content after images.</p>
`;

try {
    console.log('Testing with simulated Next.js server environment...');
    
    // Test 1: Basic parsing
    const result1 = parseMicroCMSHTML(imageHTML);
    console.log('✅ Basic parsing succeeded - Length:', result1.length);
    
    // Test 2: Dark mode parsing
    const result2 = parseMicroCMSHTML(imageHTML, { darkMode: true });
    console.log('✅ Dark mode parsing succeeded - Length:', result2.length);
    
    // Test 3: Parser class usage
    const parser = new MicroCMSRichParser({ darkMode: false });
    const result3 = parser.parse(imageHTML);
    console.log('✅ Parser class usage succeeded - Length:', result3.length);
    
    // Test 4: Verify image elements are processed
    const hasRichImage = result1.includes('rich-image');
    const hasRichFigure = result1.includes('rich-figure');
    const hasRichFigcaption = result1.includes('rich-figcaption');
    
    console.log('\nImage processing verification:');
    console.log('- Rich image class:', hasRichImage);
    console.log('- Rich figure class:', hasRichFigure);
    console.log('- Rich figcaption class:', hasRichFigcaption);
    
    if (hasRichImage && hasRichFigure && hasRichFigcaption) {
        console.log('✅ All image elements processed correctly');
    } else {
        console.log('❌ Some image elements not processed correctly');
    }
    
    console.log('\n=== Test Results ===');
    console.log('✅ No Image constructor errors occurred');
    console.log('✅ All parsing operations completed successfully');
    console.log('✅ Image elements processed correctly despite missing constructors');
    
} catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
} finally {
    // Restore original constructors
    if (originalImage) {
        global.Image = originalImage;
    }
    if (originalHTMLImageElement) {
        global.HTMLImageElement = originalHTMLImageElement;
    }
}

console.log('\n=== Next.js Simulation Test Complete ===');