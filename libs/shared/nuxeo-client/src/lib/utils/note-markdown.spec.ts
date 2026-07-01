import { describe, expect, it } from 'vitest';
import { isMarkdownNoteFormat, isSafeHttpUrl, renderNoteMarkdown } from './note-markdown';

describe('note-markdown', () => {
  it('isMarkdownNoteFormat identifies markdown mime type', () => {
    expect(isMarkdownNoteFormat('text/markdown')).toBe(true);
    expect(isMarkdownNoteFormat('text/html')).toBe(false);
  });

  it('isSafeHttpUrl allows only http and https', () => {
    expect(isSafeHttpUrl('https://example.com/a.png')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeHttpUrl('not a url')).toBe(false);
  });

  it('renderNoteMarkdown converts headings, emphasis, and lists', () => {
    const md = [
      '# H1 Heading',
      '## H2 Heading',
      'Some text here.',
      '**Some bold text.**',
      '*Some italics.*',
      'Some bullet points:',
      '* one',
      '* two',
      '* three',
    ].join('\n');

    const html = renderNoteMarkdown(md);

    expect(html).toContain('<h1>H1 Heading</h1>');
    expect(html).toContain('<h2>H2 Heading</h2>');
    expect(html).toContain('<strong>Some bold text.</strong>');
    expect(html).toContain('<em>Some italics.</em>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>three</li>');
  });

  it('renderNoteMarkdown escapes HTML and rejects unsafe link protocols', () => {
    const html = renderNoteMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1))');

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('[x](javascript:alert(1))');
    expect(html).not.toContain('href="javascript:');
  });
});
