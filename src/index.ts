import { JSDOM } from 'jsdom';

export interface ParseOptions {
	darkMode?: boolean;
	className?: string;
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
		const dom = new JSDOM(htmlContent);
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