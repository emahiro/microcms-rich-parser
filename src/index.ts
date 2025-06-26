import { JSDOM } from 'jsdom';

export interface ParseOptions {
	darkMode?: boolean;
	className?: string;
	customCSS?: string;
}

export class MicroCMSRichParser {
	private options: ParseOptions;

	constructor(options: ParseOptions = {}) {
		this.options = {
			darkMode: false,
			className: 'microcms-rich-content',
			...options
		};
	}

	parse(htmlContent: string): string {
		let dom: JSDOM;
		
		try {
			// Create JSDOM with minimal, server-safe configuration for NextJS SSG
			dom = new JSDOM(`<body>${htmlContent}</body>`, {
				resources: 'usable',
				runScripts: 'dangerously',
				pretendToBeVisual: false,
				virtualConsole: new (require('jsdom').VirtualConsole)()
			});
			
			// Override problematic constructors BEFORE they can cause issues
			const window = dom.window as any;
			
			// Prevent Image constructor issues by creating a safe mock
			window.Image = function() {
				const element = window.document.createElement('img');
				return element;
			};
			
			// Override HTMLImageElement constructor to prevent build issues
			if (window.HTMLImageElement) {
				const OriginalHTMLImageElement = window.HTMLImageElement;
				window.HTMLImageElement = function() {
					return window.document.createElement('img');
				};
				// Preserve prototype for instanceof checks
				window.HTMLImageElement.prototype = OriginalHTMLImageElement.prototype;
			}
			
			// Override createElement for img elements with additional safety
			const originalCreateElement = window.document.createElement;
			window.document.createElement = function(tagName: string) {
				const element = originalCreateElement.call(this, tagName);
				
				// Special handling for img elements
				if (tagName.toLowerCase() === 'img') {
					// Prevent any Image constructor calls during attribute setting
					const originalSetAttribute = element.setAttribute;
					element.setAttribute = function(name: string, value: string) {
						try {
							// Skip src attribute processing that might trigger Image constructor
							if (name === 'src') {
								// Directly set the attribute without triggering internal handlers
								Object.defineProperty(this, 'src', {
									value: value,
									writable: true,
									enumerable: true,
									configurable: true
								});
								return;
							}
							return originalSetAttribute.call(this, name, value);
						} catch (e) {
							// Silently ignore attribute setting errors
							return;
						}
					};
				}
				
				return element;
			};
			
		} catch (error) {
			// Ultimate fallback: Create minimal JSDOM with no features
			console.warn('JSDOM creation failed, using minimal fallback:', error);
			try {
				dom = new JSDOM(`<body>${htmlContent}</body>`, {});
			} catch (fallbackError) {
				// Last resort: Create JSDOM with string parsing only
				console.warn('Minimal JSDOM failed, using string-only parsing:', fallbackError);
				dom = new JSDOM();
				dom.window.document.body.innerHTML = htmlContent;
			}
		}
		
		const document = dom.window.document;
		const body = document.body;

		// Create wrapper container
		const wrapper = document.createElement('div');
		wrapper.className = `${this.options.className} ${this.options.darkMode ? 'dark-mode' : ''}`;

		// Process each element
		Array.from(body.children).forEach(element => {
			const processedElement = this.processElement(element as Element, document);
			wrapper.appendChild(processedElement);
		});

		// Add styles
		const style = document.createElement('style');
		style.textContent = this.generateCSS();
		wrapper.appendChild(style);

		// Add custom CSS if provided
		if (this.options.customCSS) {
			const customStyle = document.createElement('style');
			customStyle.textContent = this.options.customCSS;
			wrapper.appendChild(customStyle);
		}

		return wrapper.outerHTML;
	}

	private processElement(element: Element, document: Document): Element {
		const tagName = element.tagName.toLowerCase();

		switch (tagName) {
			case 'p':
				return this.processParagraph(element, document);
			case 'blockquote':
				return this.processBlockquote(element, document);
			case 'hr':
				return this.processHorizontalRule(element, document);
			case 'a':
				return this.processLink(element, document);
			case 'img':
				return this.processImage(element, document);
			case 'figure':
				return this.processFigure(element, document);
			default:
				return element.cloneNode(true) as Element;
		}
	}

	private processParagraph(element: Element, document: Document): Element {
		const p = document.createElement('p');
		p.className = 'rich-paragraph';
		p.innerHTML = element.innerHTML;
		return p;
	}

	private processBlockquote(element: Element, document: Document): Element {
		const blockquote = document.createElement('blockquote');
		blockquote.className = 'rich-blockquote';
		blockquote.innerHTML = element.innerHTML;
		return blockquote;
	}

	private processHorizontalRule(element: Element, document: Document): Element {
		const hr = document.createElement('hr');
		hr.className = 'rich-divider';
		return hr;
	}

	private processLink(element: Element, document: Document): Element {
		const a = document.createElement('a');
		a.className = 'rich-link';
		a.href = (element as HTMLAnchorElement).href;
		a.textContent = element.textContent;
		a.target = '_blank';
		a.rel = 'noopener noreferrer';
		return a;
	}

	private processImage(element: Element, document: Document): Element {
		const img = document.createElement('img');
		
		img.className = 'rich-image';
		
		// Safely copy attributes without triggering Image constructor
		const srcAttr = element.getAttribute('src');
		const altAttr = element.getAttribute('alt');
		const widthAttr = element.getAttribute('width');
		const heightAttr = element.getAttribute('height');
		const titleAttr = element.getAttribute('title');
		
		// Set attributes using safe methods
		if (srcAttr) {
			try {
				img.setAttribute('src', srcAttr);
			} catch (e) {
				// Fallback: direct property assignment
				(img as any).src = srcAttr;
			}
		}
		
		if (altAttr) img.setAttribute('alt', altAttr);
		else img.setAttribute('alt', '');
		
		img.setAttribute('loading', 'lazy');
		
		// Copy dimensional attributes if they exist
		if (widthAttr) img.setAttribute('width', widthAttr);
		if (heightAttr) img.setAttribute('height', heightAttr);
		if (titleAttr) img.setAttribute('title', titleAttr);
		
		return img;
	}

	private processFigure(element: Element, document: Document): Element {
		const figure = document.createElement('figure');
		figure.className = 'rich-figure';
		
		// Process child elements
		Array.from(element.children).forEach(child => {
			const processedChild = this.processElement(child, document);
			figure.appendChild(processedChild);
		});
		
		// Add figcaption styling if present
		const figcaption = figure.querySelector('figcaption');
		if (figcaption) {
			figcaption.className = 'rich-figcaption';
		}
		
		return figure;
	}

	private generateCSS(): string {
		return `
			.microcms-rich-content {
				max-width: 800px;
				margin: 0 auto;
				line-height: 1.7;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
				color: #333;
				background-color: #fff;
				padding: 2rem;
			}

			.microcms-rich-content.dark-mode {
				color: #e4e4e7;
				background-color: #1a1a1a;
			}

			.rich-paragraph {
				margin-bottom: 1.5rem;
				font-size: 1.1rem;
				color: inherit;
			}

			.rich-blockquote {
				margin: 2rem 0;
				padding: 1.5rem 2rem;
				border-left: 4px solid #3b82f6;
				background-color: #f8fafc;
				border-radius: 0 8px 8px 0;
				font-style: italic;
				position: relative;
			}

			.dark-mode .rich-blockquote {
				background-color: #2d2d30;
				border-left-color: #60a5fa;
			}

			.rich-blockquote::before {
				content: '"';
				font-size: 4rem;
				color: #3b82f6;
				position: absolute;
				top: -10px;
				left: 10px;
				font-family: serif;
			}

			.dark-mode .rich-blockquote::before {
				color: #60a5fa;
			}

			.rich-divider {
				margin: 3rem 0;
				border: none;
				height: 2px;
				background: linear-gradient(to right, transparent, #d1d5db, transparent);
			}

			.dark-mode .rich-divider {
				background: linear-gradient(to right, transparent, #4b5563, transparent);
			}

			.rich-link {
				color: #3b82f6;
				text-decoration: underline;
				text-decoration-thickness: 2px;
				text-underline-offset: 2px;
				transition: all 0.2s ease;
			}

			.rich-link:hover {
				color: #1d4ed8;
				text-decoration-thickness: 3px;
			}

			.dark-mode .rich-link {
				color: #60a5fa;
			}

			.dark-mode .rich-link:hover {
				color: #93c5fd;
			}

			.rich-image {
				max-width: 100%;
				height: auto;
				border-radius: 8px;
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
				transition: transform 0.2s ease, box-shadow 0.2s ease;
				display: block;
				margin: 1.5rem auto;
			}

			.rich-image:hover {
				transform: scale(1.02);
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
			}

			.dark-mode .rich-image {
				box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
			}

			.dark-mode .rich-image:hover {
				box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
			}

			.rich-figure {
				margin: 2rem 0;
				text-align: center;
			}

			.rich-figcaption {
				margin-top: 0.75rem;
				font-size: 0.9rem;
				color: #6b7280;
				font-style: italic;
				line-height: 1.5;
			}

			.dark-mode .rich-figcaption {
				color: #9ca3af;
			}

			@media (max-width: 768px) {
				.microcms-rich-content {
					padding: 1rem;
					font-size: 0.95rem;
				}

				.rich-paragraph {
					font-size: 1rem;
				}

				.rich-blockquote {
					padding: 1rem;
					margin: 1.5rem 0;
				}
			}
		`;
	}
}

// Convenience function for quick usage
export function parseMicroCMSHTML(htmlContent: string, options?: ParseOptions): string {
	const parser = new MicroCMSRichParser(options);
	return parser.parse(htmlContent);
}

export default MicroCMSRichParser;