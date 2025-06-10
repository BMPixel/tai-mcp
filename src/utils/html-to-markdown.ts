import TurndownService from 'turndown';
import { marked } from 'marked';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined'
});

// Custom rules for email-specific HTML
turndownService.addRule('removeScripts', {
  filter: ['script', 'style', 'meta', 'head'],
  replacement: () => ''
});

turndownService.addRule('blockquote', {
  filter: 'blockquote',
  replacement: (content) => {
    return content
      .split('\n')
      .map(line => `> ${line}`)
      .join('\n') + '\n\n';
  }
});

turndownService.addRule('tables', {
  filter: 'table',
  replacement: (content, node) => {
    // Simple table conversion - may not be perfect for complex tables
    return `\n${content}\n`;
  }
});

export function convertHtmlToMarkdown(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Clean up common email HTML issues
    let cleaned = html
      // Remove outlook-specific tags
      .replace(/<\/?o:p[^>]*>/gi, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      // Convert common email line breaks
      .replace(/<br[^>]*>/gi, '\n');

    const markdown = turndownService.turndown(cleaned);
    
    // Post-process markdown
    return markdown
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  } catch (error) {
    // If conversion fails, return the original HTML
    return html;
  }
}

export function extractPlainText(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // Remove all HTML tags and decode entities
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    return html;
  }
}

// Configure marked for secure email content
marked.setOptions({
  gfm: true,
  breaks: true
});

export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    // Convert markdown to HTML
    const html = marked.parse(markdown) as string;
    
    // Clean up the generated HTML
    return html
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  } catch (error) {
    // If conversion fails, wrap the original markdown in a paragraph
    return `<p>${markdown.replace(/\n/g, '<br>')}</p>`;
  }
}