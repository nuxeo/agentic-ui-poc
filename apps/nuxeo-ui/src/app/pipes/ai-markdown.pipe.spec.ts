import { AiMarkdownPipe } from './ai-markdown.pipe';

/**
 * The closed sets the pipe promises to stay inside. They are repeated here rather than
 * imported so the test fails if the implementation quietly widens its own allowlist.
 */
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'del',
  'code',
  'pre',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'a',
  'span',
]);
const ALLOWED_ATTRS = new Set(['class', 'href', 'target', 'rel', 'start']);
const SAFE_SCHEME = /^(?:https?|mailto):/i;

/**
 * The safety property itself, asserted over the parsed output rather than over the string:
 * only allowlisted elements, only allowlisted attributes, and every surviving URL on a
 * scheme that cannot execute. `DOMParser` builds the tree inertly — scripts in it never
 * run and `img`/`iframe` never fetch — so a payload that got through is caught rather
 * than fired.
 */
function expectOnlySafeMarkup(html: string, source: string): void {
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  for (const element of Array.from(parsed.body.querySelectorAll('*'))) {
    const tag = element.tagName.toLowerCase();
    expect(ALLOWED_TAGS.has(tag))
      .withContext(`<${tag}> reached the DOM from: ${source}`)
      .toBeTrue();

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      expect(ALLOWED_ATTRS.has(name))
        .withContext(`[${name}] survived on <${tag}> from: ${source}`)
        .toBeTrue();
    }

    const href = element.getAttribute('href');
    if (href !== null) {
      expect(SAFE_SCHEME.test(href))
        .withContext(`href "${href}" is executable, from: ${source}`)
        .toBeTrue();
    }
  }

  // Named explicitly as well as by the allowlist above, so a failure says which payload
  // landed rather than only that some tag did.
  const dangerous = parsed.body.querySelectorAll(
    'script, style, iframe, object, embed, form, input, img, svg, link, meta, base',
  );
  expect(dangerous.length)
    .withContext(`<${dangerous[0]?.tagName.toLowerCase()}> reached the DOM from: ${source}`)
    .toBe(0);
}

describe('AiMarkdownPipe', () => {
  let pipe: AiMarkdownPipe;

  function render(markdown: string): string {
    const html = pipe.transform(markdown);
    expectOnlySafeMarkup(html, markdown);
    return html;
  }

  /** What the rendered output reads as, which is what the user actually sees. */
  function textOf(html: string): string {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  }

  beforeEach(() => {
    pipe = new AiMarkdownPipe();
  });

  describe('what a live model actually emits', () => {
    it('renders a GFM table as a table', () => {
      const html = render('| Document | Size |\n| --- | --- |\n| Contract A | 1.2 MB |');

      expect(html).toContain('<table>');
      expect(html).toContain('<th>Document</th>');
      expect(html).toContain('<td>Contract A</td>');
      // The symptom that started this: the delimiter row must not reach the screen.
      expect(textOf(html)).not.toContain('---');
    });

    it('renders headings, horizontal rules and blockquotes', () => {
      const html = render('## Overview\n\n---\n\n> Reviewed by Legal');

      expect(html).toContain('<h2>Overview</h2>');
      expect(html).toContain('<hr>');
      expect(html).toContain('<blockquote>');
      expect(textOf(html)).toContain('Reviewed by Legal');
    });

    it('renders inline code and fenced code blocks', () => {
      const inline = render('run `npm run build` first');
      expect(inline).toContain('<code>npm run build</code>');

      const fenced = render('```typescript\nconst total = 1;\n```');
      expect(fenced).toContain('<pre>');
      expect(fenced).toContain('class="language-typescript"');
      expect(textOf(fenced)).toContain('const total = 1;');
    });

    it('renders links as new-tab anchors that cannot reach back into this page', () => {
      const html = render('[the docs](https://doc.nuxeo.com/nxdoc/)');
      const anchor = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('a') as HTMLAnchorElement;

      expect(anchor.getAttribute('href')).toBe('https://doc.nuxeo.com/nxdoc/');
      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toContain('noopener');
      expect(anchor.getAttribute('rel')).toContain('noreferrer');
      expect(anchor.textContent).toBe('the docs');
    });

    it('still renders the bold, italic and lists the old pipe handled', () => {
      const html = render('**bold** and *italic*\n\n- one\n- two\n\n1. first\n2. second');

      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<ol>');
      expect(textOf(html)).toContain('second');
    });

    it('keeps a task list readable without rendering a form control', () => {
      const html = render('- [x] indexed\n- [ ] reviewed');

      expect(html).not.toContain('<input');
      expect(textOf(html)).toContain('indexed');
      expect(textOf(html)).toContain('reviewed');
    });

    it('returns a plain string, so Angular sanitizes the result a second time', () => {
      // The pipe deliberately does not return SafeHtml: `[innerHTML]` only skips Angular's
      // own sanitizer when handed a bypassed value. If this ever becomes SafeHtml again,
      // the second layer of defence is gone.
      const result: unknown = pipe.transform('**hello**');
      expect(typeof result).toBe('string');
    });

    it('renders nothing for empty, null and undefined content', () => {
      expect(pipe.transform('')).toBe('');
      expect(pipe.transform(null)).toBe('');
      expect(pipe.transform(undefined)).toBe('');
    });
  });

  describe('injection through each construct', () => {
    const scriptPayload = '<script>alert(1)</script>';

    it('shows a raw script tag as text instead of executing it', () => {
      const html = render(`Here is ${scriptPayload} for you`);

      expect(html).toContain('&lt;script&gt;');
      expect(textOf(html)).toContain(scriptPayload);
    });

    it('neutralises a script tag in a heading, a quote and a list item', () => {
      for (const markdown of [
        `### ${scriptPayload}`,
        `> ${scriptPayload}`,
        `- ${scriptPayload}`,
        `1. ${scriptPayload}`,
      ]) {
        const html = render(markdown);
        expect(textOf(html)).toContain(scriptPayload);
      }
    });

    it('neutralises HTML embedded in a table cell', () => {
      const html = render(
        `| Doc | Note |\n| --- | --- |\n| ${scriptPayload} | <img src=x onerror=alert(1)> |`,
      );

      expect(html).toContain('<table>');
      expect(html).not.toContain('<img');
      expect(textOf(html)).toContain(scriptPayload);
      expect(textOf(html)).toContain('<img src=x onerror=alert(1)>');
    });

    it('neutralises HTML inside a fenced code block and an inline code span', () => {
      const fenced = render(`\`\`\`html\n${scriptPayload}\n\`\`\``);
      expect(fenced).toContain('<pre>');
      expect(textOf(fenced)).toContain(scriptPayload);

      const inline = render(`use \`${scriptPayload}\` carefully`);
      expect(inline).toContain('<code>');
      expect(textOf(inline)).toContain(scriptPayload);
    });

    it('strips the dangerous elements a model can name directly', () => {
      for (const payload of [
        '<iframe src="javascript:alert(1)"></iframe>',
        '<svg onload=alert(1)></svg>',
        '<style>body{display:none}</style>',
        '<form action="/x"><input name="y"></form>',
        '<object data="x"></object>',
        '<body onload=alert(1)>',
        '<a href="#" onclick="alert(1)">click</a>',
        '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
      ]) {
        const html = render(payload);
        expect(html).not.toContain('<iframe');
        expect(html).not.toContain('<svg');
        expect(html).not.toContain('<style');
        expect(html).not.toContain('<input');
      }
    });
  });

  describe('link and image targets', () => {
    it('refuses a javascript: link and leaves the text behind', () => {
      const html = render('[click me](javascript:alert(1))');

      expect(html).not.toContain('<a');
      expect(html).not.toContain('javascript:');
      expect(textOf(html)).toContain('click me');
    });

    it('refuses javascript: however it is disguised', () => {
      for (const href of [
        'JaVaScRiPt:alert(1)',
        ' javascript:alert(1)',
        'java\u0009script:alert(1)',
        'java\u000ascript:alert(1)',
        'java\u0000script:alert(1)',
        '\u0001javascript:alert(1)',
      ]) {
        const html = render(`[click me](${href})`);
        expect(html)
          .withContext(`from href ${JSON.stringify(href)}`)
          .not.toContain('<a href');
      }
    });

    it('refuses data:, vbscript:, file: and blob: links', () => {
      for (const href of [
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'data:image/svg+xml;base64,PHN2Zy8+',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'blob:https://example.com/1234',
      ]) {
        const html = render(`[open](${href})`);
        expect(html).withContext(`from href ${href}`).not.toContain('<a href');
        expect(textOf(html)).toContain('open');
      }
    });

    it('never renders an image element, whatever the source', () => {
      for (const markdown of [
        '![alt text](javascript:alert(1))',
        '![alt text](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)',
        '![alt text](https://tracker.example.com/beacon.gif)',
      ]) {
        const html = render(markdown);
        expect(html).not.toContain('<img');
        expect(textOf(html)).toContain('alt text');
      }
    });

    it('keeps mailto: and in-app relative links, on a safe scheme', () => {
      const mail = render('[mail us](mailto:support@example.com)');
      expect(mail).toContain('href="mailto:support@example.com"');

      const relative = render('[the document](/#/doc/abc-123)');
      const href =
        new DOMParser()
          .parseFromString(relative, 'text/html')
          .querySelector('a')
          ?.getAttribute('href') ?? '';
      expect(href).toMatch(/^https?:/);
      expect(href).toContain('/#/doc/abc-123');
    });

    it('cannot be made to break out of the href attribute', () => {
      const html = render('[x](https://a.example.com/"onmouseover="alert(1))');
      const anchor = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('a') as HTMLAnchorElement;

      // The quotes are percent-encoded into the path, so the payload stays one attribute
      // value and never becomes a second attribute.
      expect(anchor.getAttribute('href')).toContain('%22onmouseover=%22');
      expect(anchor.getAttribute('onmouseover')).toBeNull();
      expect(anchor.attributes.length).toBe(3);
    });
  });

  describe('partial markdown, as a streaming response produces it', () => {
    it('degrades a half-written table to plain text', () => {
      const html = render('| Document | Size |\n| --- |');

      expect(html).not.toContain('<table>');
      expect(textOf(html)).toContain('| Document | Size |');
    });

    it('degrades other unterminated constructs to text or to a closed element', () => {
      const cases: Record<string, string> = {
        '**not closed': '**not closed',
        '*also not closed': '*also not closed',
        '[link text](https://exa': 'link text',
        '`unclosed code span': 'unclosed code span',
        '<img src=x onerr': '<img src=x onerr',
        '> quote with no end': 'quote with no end',
      };

      for (const [markdown, expectedText] of Object.entries(cases)) {
        const html = render(markdown);
        expect(textOf(html)).withContext(`from ${markdown}`).toContain(expectedText);
      }
    });

    it('closes an unterminated fenced code block rather than dropping the code', () => {
      const html = render('```typescript\nconst total = 1;');

      expect(html).toContain('<pre>');
      expect(html).toContain('</pre>');
      expect(textOf(html)).toContain('const total = 1;');
    });

    /**
     * The real streaming guarantee. The panel re-renders on every token, so every prefix of
     * an answer is markup the user sees — including the ones that cut a table in half, stop
     * inside an href and open a fence without closing it.
     */
    it('holds the safety property at every prefix of a streamed answer', () => {
      const answer = [
        '## Document overview',
        '',
        'I found **three** contracts. Here is the breakdown:',
        '',
        '| Document | Size | Owner |',
        '| --- | ---: | --- |',
        '| Contract A | 1.2 MB | jsmith |',
        '| Contract B | 840 KB | adupont |',
        '',
        '> Two of these are past their review date.',
        '',
        'The query I ran was `SELECT * FROM Document`, or in full:',
        '',
        '```sql',
        "SELECT * FROM Document WHERE dc:title LIKE '%contract%'",
        '```',
        '',
        'See [the retention policy](https://doc.example.com/policy) and',
        '[this one](javascript:alert(1)) for the details.',
        '',
        '- [x] indexed',
        '- [ ] reviewed',
      ].join('\n');

      for (let length = 1; length <= answer.length; length += 1) {
        const prefix = answer.slice(0, length);
        expectOnlySafeMarkup(pipe.transform(prefix), `prefix of length ${length}`);
      }

      // And the completed answer is the rich rendering the demo needs.
      const html = pipe.transform(answer);
      expect(html).toContain('<table>');
      expect(html).toContain('<h2>Document overview</h2>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<pre>');
      expect(html).toContain('href="https://doc.example.com/policy"');
      expect(html).not.toContain('javascript:');
    });
  });
});
