import { sanitizeRichHtml, sanitizePlainText } from '../sanitize.util';

describe('sanitize.util', () => {
  describe('sanitizeRichHtml', () => {
    it('script tag-ыг устгана', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      expect(sanitizeRichHtml(dirty)).toBe('<p>Hello</p>');
    });

    it('onerror event handler-ыг устгана', () => {
      const dirty = '<img src="x" onerror="alert(\'xss\')">';
      const result = sanitizeRichHtml(dirty);
      expect(result).not.toContain('onerror');
    });

    it('onclick event handler-ыг устгана', () => {
      const dirty = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = sanitizeRichHtml(dirty);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me');
    });

    it('javascript: URL-ыг хориглоно', () => {
      const dirty = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeRichHtml(dirty);
      expect(result).not.toContain('javascript:');
    });

    it('style attribute-г устгана', () => {
      const dirty = '<p style="background:url(javascript:alert(1))">Text</p>';
      const result = sanitizeRichHtml(dirty);
      expect(result).not.toContain('style');
    });

    it('зөвшөөрөгдсөн tag-уудыг хадгална', () => {
      const html =
        '<p>Text</p><strong>Bold</strong><em>Italic</em><code>code</code><pre>preformatted</pre>';
      expect(sanitizeRichHtml(html)).toBe(html);
    });

    it('a tag-д href зөвшөөрнө, rel автомат нэмнэ', () => {
      const dirty = '<a href="https://example.com">Link</a>';
      const result = sanitizeRichHtml(dirty);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('img tag-д src, alt зөвшөөрнө', () => {
      const dirty = '<img src="https://example.com/img.png" alt="Image">';
      const result = sanitizeRichHtml(dirty);
      expect(result).toContain('src="https://example.com/img.png"');
      expect(result).toContain('alt="Image"');
    });

    it('iframe tag-ыг устгана', () => {
      const dirty = '<iframe src="https://evil.com"></iframe>';
      expect(sanitizeRichHtml(dirty)).toBe('');
    });

    it('хүснэгт tag-ыг зөвшөөрнө', () => {
      const html =
        '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
      expect(sanitizeRichHtml(html)).toBe(html);
    });

    it('blockquote, h1-h6, ul/ol/li зөвшөөрнө', () => {
      const html = '<blockquote><h3>Title</h3><ul><li>Item</li></ul></blockquote>';
      expect(sanitizeRichHtml(html)).toBe(html);
    });

    it('хоосон string буцаана', () => {
      expect(sanitizeRichHtml('')).toBe('');
    });

    it('null/undefined-д хоосон string буцаана', () => {
      expect(sanitizeRichHtml(null as any)).toBe('');
      expect(sanitizeRichHtml(undefined as any)).toBe('');
    });

    it('data: URL scheme хориглоно (img src дээр)', () => {
      const dirty = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = sanitizeRichHtml(dirty);
      expect(result).not.toContain('data:');
    });
  });

  describe('sanitizePlainText', () => {
    it('бүх HTML tag-ыг устгана', () => {
      const dirty = '<p>Hello <strong>World</strong></p>';
      expect(sanitizePlainText(dirty)).toBe('Hello World');
    });

    it('script tag + контентыг бүрэн устгана', () => {
      const dirty = '<script>alert("xss")</script>Safe text';
      expect(sanitizePlainText(dirty)).toBe('Safe text');
    });

    it('цэвэр текстийг хэвээр үлдээнэ', () => {
      const text = 'Hello World, энэ бол тест 123!';
      expect(sanitizePlainText(text)).toBe(text);
    });

    it('хоосон string буцаана', () => {
      expect(sanitizePlainText('')).toBe('');
    });

    it('null/undefined-д хоосон string буцаана', () => {
      expect(sanitizePlainText(null as any)).toBe('');
      expect(sanitizePlainText(undefined as any)).toBe('');
    });
  });
});
