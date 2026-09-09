import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderTrustedHtml } from './render-trusted-html';

/**
 * These tests RENDER the result and read the DOM back, rather than asserting the return value is
 * non-null.
 *
 * That distinction is the whole point. A `SafeHtml` is an opaque wrapper — its inner value cannot be
 * read out — so `expect(result).not.toBeNull()` passes whether or not DOMPurify ran, and would still
 * pass if this helper returned `bypassSecurityTrustHtml(html)` with no sanitisation at all. That is
 * precisely the defect class this helper exists to prevent, so a test that cannot detect it is not
 * evidence. Binding to `[innerHTML]` and reading `innerHTML` back is the only way to assert what
 * actually reaches the DOM.
 */
@Component({
  standalone: true,
  template: `<div [innerHTML]="html()"></div>`,
})
class HostComponent {
  readonly html = signal<SafeHtml | null>(null);
}

describe('renderTrustedHtml', () => {
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    sanitizer = TestBed.inject(DomSanitizer);
  });

  /** Renders `html` through the helper and returns what actually landed in the DOM. */
  function rendered(html: string, config?: Parameters<typeof renderTrustedHtml>[2]): string {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.html.set(renderTrustedHtml(sanitizer, html, config));
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    return div.innerHTML;
  }

  it('renders safe markup unchanged', () => {
    expect(rendered('<p>Safe content</p>')).toBe('<p>Safe content</p>');
  });

  it('renders through the bypass, so Angular does not strip the markup itself', () => {
    // Without the bypass, Angular's own HTML sanitizer would run on the string. This asserts the
    // helper's wrapper is doing its job: `<strong>` survives as an element rather than as text.
    expect(rendered('<strong>bold</strong>')).toBe('<strong>bold</strong>');
  });

  describe('DOMPurify actually runs', () => {
    it('removes a script element', () => {
      const out = rendered('<p>Safe</p><script>alert(1)</script><p>content</p>');
      expect(out).not.toContain('<script');
      expect(out).not.toContain('alert(1)');
      expect(out).toBe('<p>Safe</p><p>content</p>');
    });

    it('removes an inline event handler but keeps the element', () => {
      const out = rendered('<p onclick="alert(1)">Click me</p>');
      expect(out).not.toContain('onclick');
      expect(out).toBe('<p>Click me</p>');
    });

    it('removes a javascript: href but keeps the anchor', () => {
      const out = rendered('<a href="javascript:alert(1)">Link</a>');
      expect(out).not.toContain('javascript:');
      expect(out).toBe('<a>Link</a>');
    });

    it('removes an img onerror payload', () => {
      const out = rendered('<img src="x" onerror="alert(1)">');
      expect(out).not.toContain('onerror');
    });

    it('removes an iframe', () => {
      const out = rendered('<iframe src="https://evil.example"></iframe>');
      expect(out).not.toContain('<iframe');
    });

    it('removes an svg script payload', () => {
      const out = rendered('<svg><script>alert(1)</script></svg>');
      expect(out).not.toContain('alert(1)');
    });
  });

  describe('caller-supplied config is applied', () => {
    it('honours ALLOWED_TAGS, stripping tags outside the list', () => {
      const out = rendered('<p>Text with <mark>highlight</mark> and <strong>bold</strong></p>', {
        ALLOWED_TAGS: ['mark'],
      });
      // `<p>` and `<strong>` are stripped to their text content; only `<mark>` survives as an element.
      expect(out).toContain('<mark>highlight</mark>');
      expect(out).not.toContain('<strong>');
      expect(out).not.toContain('<p>');
      expect(out).toContain('bold');
    });

    it('honours ADD_ATTR, keeping attributes DOMPurify would otherwise drop', () => {
      const withConfig = rendered('<a href="https://example.com" target="_blank">Link</a>', {
        ADD_ATTR: ['target'],
      });
      expect(withConfig).toContain('target="_blank"');

      // The negative half: without ADD_ATTR the same input loses `target`, which proves the config
      // is what kept it rather than DOMPurify's default.
      const withoutConfig = rendered('<a href="https://example.com" target="_blank">Link</a>');
      expect(withoutConfig).not.toContain('target');
    });

    it('preserves tags that are explicitly allowed', () => {
      const out = rendered('<strong>Bold</strong> and <em>italic</em>', {
        ALLOWED_TAGS: ['strong', 'em'],
      });
      expect(out).toBe('<strong>Bold</strong> and <em>italic</em>');
    });

    it('still strips a script when a config is supplied', () => {
      // A caller's allow-list must not accidentally re-admit script.
      const out = rendered('<mark>ok</mark><script>alert(1)</script>', { ALLOWED_TAGS: ['mark'] });
      expect(out).not.toContain('alert(1)');
    });
  });

  describe('unsafe config is rejected', () => {
    it('rejects unsupported DOMPurify config keys', () => {
      expect(() =>
        rendered('<p>ok</p>', {
          FORBID_TAGS: ['script'],
        } as Parameters<typeof renderTrustedHtml>[2]),
      ).toThrow(/unsupported DOMPurify config key/);
    });

    it('rejects active-content tags in ALLOWED_TAGS', () => {
      expect(() =>
        rendered('<script>alert(1)</script>', {
          ALLOWED_TAGS: ['script'],
        }),
      ).toThrow(/active-content tags/);
    });

    it('rejects executable attributes in ADD_ATTR', () => {
      expect(() =>
        rendered('<p onclick="alert(1)">x</p>', {
          ADD_ATTR: ['onclick'],
        }),
      ).toThrow(/executable attributes/);
    });
  });

  describe('edge cases', () => {
    it('renders empty HTML as empty', () => {
      expect(rendered('')).toBe('');
    });

    it('renders plain text with no tags', () => {
      expect(rendered('Plain text content')).toBe('Plain text content');
    });

    it('closes malformed markup rather than throwing', () => {
      expect(() => rendered('<p>Unclosed tag<div>Nested without closing')).not.toThrow();
    });

    it('escapes a bare angle bracket rather than dropping the text', () => {
      const out = rendered('5 < 10 and 10 > 5');
      expect(out).toContain('5 ');
      expect(out).toContain('10');
    });
  });
});
