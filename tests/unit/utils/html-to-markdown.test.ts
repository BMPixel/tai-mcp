import { describe, it, expect } from '@jest/globals';
import { convertHtmlToMarkdown, extractPlainText } from '../../../src/utils/html-to-markdown.js';

describe('HTML to Markdown Utils', () => {
  describe('convertHtmlToMarkdown', () => {
    it('should convert basic HTML to markdown', () => {
      const html = '<h1>Title</h1><p>This is a <strong>test</strong> paragraph.</p>';
      const markdown = convertHtmlToMarkdown(html);
      
      expect(markdown).toContain('# Title');
      expect(markdown).toContain('**test**');
    });

    it('should handle links correctly', () => {
      const html = '<p>Visit <a href="https://example.com">this link</a></p>';
      const markdown = convertHtmlToMarkdown(html);
      
      expect(markdown).toContain('[this link](https://example.com)');
    });

    it('should handle blockquotes', () => {
      const html = '<blockquote>This is a quote</blockquote>';
      const markdown = convertHtmlToMarkdown(html);
      
      expect(markdown).toContain('> This is a quote');
    });

    it('should handle empty or invalid input', () => {
      expect(convertHtmlToMarkdown('')).toBe('');
      expect(convertHtmlToMarkdown(null as any)).toBe('');
      expect(convertHtmlToMarkdown(undefined as any)).toBe('');
    });

    it('should remove script tags', () => {
      const html = '<p>Content</p><script>alert("hello");</script>';
      const markdown = convertHtmlToMarkdown(html);
      
      expect(markdown).toContain('Content');
      expect(markdown).not.toContain('alert');
    });

    it('should clean up outlook-specific tags', () => {
      const html = '<p>Content</p><o:p></o:p>';
      const markdown = convertHtmlToMarkdown(html);
      
      expect(markdown).toContain('Content');
      expect(markdown).not.toContain('<o:p>');
    });
  });

  describe('extractPlainText', () => {
    it('should extract plain text from HTML', () => {
      const html = '<h1>Title</h1><p>This is <strong>bold</strong> text.</p>';
      const text = extractPlainText(html);
      
      expect(text).toBe('TitleThis is bold text.');
    });

    it('should decode HTML entities', () => {
      const html = '<p>Ben &amp; Jerry&apos;s &lt;ice cream&gt;</p>';
      const text = extractPlainText(html);
      
      expect(text).toBe("Ben & Jerry&apos;s <ice cream>");
    });

    it('should handle non-breaking spaces', () => {
      const html = '<p>Word&nbsp;with&nbsp;spaces</p>';
      const text = extractPlainText(html);
      
      expect(text).toBe('Word with spaces');
    });

    it('should handle empty or invalid input', () => {
      expect(extractPlainText('')).toBe('');
      expect(extractPlainText(null as any)).toBe('');
      expect(extractPlainText(undefined as any)).toBe('');
    });

    it('should normalize whitespace', () => {
      const html = '<p>Multiple   spaces\n\nand\t\tlines</p>';
      const text = extractPlainText(html);
      
      expect(text).toBe('Multiple spaces and lines');
    });
  });
});