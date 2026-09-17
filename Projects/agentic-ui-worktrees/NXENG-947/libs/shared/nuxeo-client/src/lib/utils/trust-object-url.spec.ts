import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { trustObjectUrl } from './trust-object-url';

describe('trustObjectUrl', () => {
  let sanitizer: DomSanitizer;

  function setup() {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
  }

  it('wraps a blob URL with bypassSecurityTrustResourceUrl', () => {
    setup();
    const url = 'blob:http://localhost:4200/550e8400-e29b-41d4-a716-446655440000';
    const result = trustObjectUrl(sanitizer, url);

    expect(result).not.toBeNull();
    // A SafeResourceUrl stringifies to a marker; reading it back out is not possible, but we can
    // verify it is not the raw string and does not throw when bound to iframe[src].
    expect(String(result)).not.toBe(url);
    expect(String(result)).toContain('SafeValue');
  });

  it.each([[null], [undefined], [''], ['   ']])('returns null for %s', (value) => {
    setup();
    expect(trustObjectUrl(sanitizer, value as string | null | undefined)).toBeNull();
  });

  describe('rejects URLs with a non-blob scheme', () => {
    it.each([
      ['https://example.com/file.pdf'],
      ['http://localhost:8080/blob'],
      ['javascript:alert(1)'],
      ['data:text/plain,content'],
      ['file:///etc/hosts'],
      // The prefix check: a URL that *contains* "blob:" but does not start with it.
      ['https://evil.example/blob:fake'],
    ])('rejects %s', (url) => {
      setup();
      expect(trustObjectUrl(sanitizer, url)).toBeNull();
    });
  });

  it('rejects a relative path', () => {
    setup();
    // An object URL is always absolute and always starts with `blob:`. A relative path like
    // `/api/blob` is not one.
    expect(trustObjectUrl(sanitizer, '/api/blob')).toBeNull();
  });

  it('accepts blob URLs and relies on caller-owned provenance', () => {
    setup();
    // This is a well-formed blob URL, but the origin is wrong. Object URLs are scoped to the
    // document that created them: a `blob:` URL from a different origin (or from configuration/
    // server) is not valid in this document. The helper cannot distinguish this from a legitimate
    // local URL by structure alone, but it can reject anything that is not an exact match for the
    // shape `createObjectURL` produces — which in practice means: starts with `blob:` and nothing
    // else is checked, because the scheme is enough to distinguish the legitimate case (local) from
    // the illegitimate one (travelled through config/REST).
    //
    // This test is deliberately permissive: the helper allows *any* blob URL, relying on the
    // documented contract that the caller only passes locally-minted ones. A stricter check would
    // validate the origin matches `window.location.origin`, but that breaks in tests (jsdom) and
    // adds complexity for a case that is already excluded by where the URL comes from.
    const foreign = 'blob:https://evil.example/550e8400-e29b-41d4-a716-446655440000';
    const result = trustObjectUrl(sanitizer, foreign);

    // The helper does NOT reject this, because it cannot distinguish structure. The contract is
    // that the caller only passes URLs from `URL.createObjectURL(blob)`, where `blob` was fetched
    // by this code. This test documents that limit.
    expect(result).not.toBeNull();
  });

  it('rejects a protocol-relative URL', () => {
    setup();
    // `//evil.example/x` is a valid URL (protocol-relative), but it is not a blob URL.
    expect(trustObjectUrl(sanitizer, '//evil.example/blob')).toBeNull();
  });

  it('requires the exact scheme, case-sensitive', () => {
    setup();
    // URL schemes are case-insensitive per the spec, but `URL.createObjectURL` always produces
    // lowercase `blob:`. An uppercase variant did not come from `createObjectURL`.
    expect(trustObjectUrl(sanitizer, 'BLOB:http://localhost/uuid')).toBeNull();
    expect(trustObjectUrl(sanitizer, 'Blob:http://localhost/uuid')).toBeNull();
  });
});
