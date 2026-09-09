import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ARENDER_CONFIG } from '../arender.config';
import { CURRENT_USERNAME } from '../current-user.token';
import { ARenderService } from './arender.service';

/**
 * ARender is optional: `integrations.arender` in the Layer 0 bootstrap file defaults to
 * `null`, and no manifest in this repository sets it. So "not configured" is not an edge case, it
 * is the default deployment, and every method has to answer for it.
 *
 * These tests exist because nothing did. `ARENDER_CONFIG` was typed non-nullable while the
 * provider that fills it could yield `null`, and Angular's `Provider` union types `useFactory` as
 * `(...args: any[]) => any` — so `typecheck` could not see the mismatch and the gate stayed green.
 * The unconfigured path reached the "Annotations are not available" placeholder only because a
 * `TypeError` was raised inside an Observable subscriber, converted to an error notification, and
 * swallowed by a caller's `error:` handler. Right outcome, wrong mechanism, and one refactor away
 * from a crash.
 */
function setup(
  cfg: { viewerOrigin: string; nuxeoInternalUrl: string } | null,
  user: string | null = null,
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: ARENDER_CONFIG, useValue: cfg },
      { provide: CURRENT_USERNAME, useValue: () => user },
    ],
  });
  return TestBed.inject(ARenderService);
}

const CONFIGURED = {
  viewerOrigin: 'https://arender.example.com',
  nuxeoInternalUrl: 'https://nuxeo-auth-proxy.internal/nuxeo',
};

describe('ARenderService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('when ARender is not configured', () => {
    it('reports unavailable rather than throwing', async () => {
      const service = setup(null);
      await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
    });

    it('does not probe the network at all', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const service = setup(null);

      await firstValueFrom(service.isAvailable());

      // `fetch(undefined)` would resolve against the current origin and could report a viewer as
      // present when none is configured.
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('yields no previewer URL rather than throwing synchronously', async () => {
      const service = setup(null);
      // Synchronous throw, not an error notification: the caller's `error:` handler cannot catch
      // this, so it would escape as an unhandled exception.
      expect(() => service.getPreviewerUrl('doc-1')).not.toThrow();
      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
    });

    it('yields no diff URL rather than throwing synchronously', async () => {
      const service = setup(null);
      expect(() => service.getDiffUrl('doc-1', 'doc-2')).not.toThrow();
      await expect(firstValueFrom(service.getDiffUrl('doc-1', 'doc-2'))).resolves.toBeNull();
    });
  });

  // A blank endpoint is worse than a null config, and it is reachable: `mergeIntegrations` in
  // `bootstrap-config.ts` carries the comment "Both endpoints are required: half an ARender
  // configuration is worse than none" but does not enforce it, so a manifest naming only
  // `viewerOrigin` produces `nuxeoInternalUrl: ''`. Left unguarded, `fetch('')` resolves against
  // the application's own origin — reporting a viewer as present when none is deployed.
  describe.each([
    ['no viewerOrigin', { viewerOrigin: '', nuxeoInternalUrl: 'https://proxy.internal/nuxeo' }],
    ['no nuxeoInternalUrl', { viewerOrigin: 'https://arender.example.com', nuxeoInternalUrl: '' }],
    ['whitespace-only endpoints', { viewerOrigin: '   ', nuxeoInternalUrl: '  ' }],
  ])('when ARender is half-configured (%s)', (_label, cfg) => {
    it('treats the configuration as absent rather than probing the app origin', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const service = setup(cfg);

      await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('yields no previewer URL, so nothing same-origin reaches the iframe', async () => {
      const service = setup(cfg);
      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
    });
  });

  // The Category C attack, at the layer that can stop it before a URL is even built.
  //
  // `viewerOrigin` comes from the Layer 0 bootstrap file, which is a customer-editable surface.
  // A `javascript:` value is complete, non-blank and accepted by `new URL()`, so it passes every
  // check that predates this one — and it ends up string-concatenated, bypassed, and loaded into an
  // iframe, which is script execution in this application's origin from a config value.
  describe('when viewerOrigin is not safe to navigate', () => {
    it.each([
      ['javascript:alert(1)'],
      ['data:text/html,<script>alert(1)</script>'],
      // The assertion here is about the `file:` *scheme* being rejected; the path is incidental.
      // It deliberately avoids the well-known shadow-file path, which GitGuardian's
      // generic-password detector reports as a hardcoded secret — a test fixture is not worth a
      // failing security check for a string the test does not need.
      ['file:///etc/hosts'],
      ['not-a-url'],
      ['//protocol-relative.example'],
    ])('treats viewerOrigin=%s as unconfigured', async (viewerOrigin) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const service = setup({ viewerOrigin, nuxeoInternalUrl: 'https://proxy.internal/nuxeo' });

      await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
      await expect(firstValueFrom(service.getDiffUrl('a', 'b'))).resolves.toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('permits a plaintext http viewer origin in a dev build', async () => {
      // `isDevMode()` is true under Vitest, which is the dev path: local ARender runs over http.
      const service = setup({
        viewerOrigin: 'http://localhost:9080',
        nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo',
      });

      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toContain(
        'http://localhost:9080/?url=',
      );
    });

    it('rejects a plaintext http viewer origin in a production build', async () => {
      // Angular's `isDevMode()` reads the `ngDevMode` global, so clearing it exercises the real
      // production branch rather than a mock of it. Scoped and restored, because a false
      // `ngDevMode` changes other Angular behaviour too.
      const previous = (globalThis as { ngDevMode?: unknown }).ngDevMode;
      (globalThis as { ngDevMode?: unknown }).ngDevMode = false;
      try {
        const service = setup({
          viewerOrigin: 'http://viewer.example.com',
          nuxeoInternalUrl: 'https://proxy.internal/nuxeo',
        });

        // A plaintext document in an iframe is a downgrade, and ARender carries annotations.
        await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
        await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
      } finally {
        (globalThis as { ngDevMode?: unknown }).ngDevMode = previous;
      }
    });

    it('still accepts a plain http nuxeoInternalUrl, which is fetched server-side', async () => {
      // This one is encoded into the `url=` parameter and fetched by ARender's own server through
      // the auth-proxy sidecar. It is legitimately http and must not be rejected.
      const service = setup({
        viewerOrigin: 'https://arender.example.com',
        nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo',
      });

      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toContain(
        encodeURIComponent('http://nuxeo-auth-proxy/nuxeo/nxfile/default/doc-1/file:content'),
      );
    });

    it.each([['javascript:alert(1)'], ['not-a-url']])(
      'treats nuxeoInternalUrl=%s as unconfigured',
      async (nuxeoInternalUrl) => {
        const service = setup({ viewerOrigin: 'https://arender.example.com', nuxeoInternalUrl });
        await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
      },
    );
  });

  describe('when ARender is configured', () => {
    it('builds a previewer URL with the nxfile URL encoded as the url parameter', async () => {
      const service = setup(CONFIGURED);

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      expect(url).toBe(
        'https://arender.example.com/?url=' +
          encodeURIComponent(
            'https://nuxeo-auth-proxy.internal/nuxeo/nxfile/default/doc-1/file:content',
          ),
      );
    });

    it('honours a non-default blob xpath', async () => {
      const service = setup(CONFIGURED);

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1', 'files:files/0/file'));

      expect(url).toContain(encodeURIComponent('/nxfile/default/doc-1/files:files/0/file'));
    });

    it('appends the current user so annotations are attributed', async () => {
      const service = setup(CONFIGURED, 'jdoe');

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      expect(url).toContain('&user=jdoe');
    });

    it('omits the user parameter when nobody is logged in', async () => {
      const service = setup(CONFIGURED, null);

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      expect(url).not.toContain('user=');
    });

    it('encodes a username containing reserved characters so it round-trips', async () => {
      const service = setup(CONFIGURED, 'a b&c');

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      // Asserts the decoded value, not one particular spelling of the encoding. `URLSearchParams`
      // writes a space as `+` where `encodeURIComponent` writes `%20`; both are correct for a query
      // string and any form-encoded parser reads them identically. Pinning the spelling made this
      // test fail when the builder moved to `URL`/`searchParams` even though the `user` parameter
      // still carried exactly the right name.
      expect(new URL(url!).searchParams.get('user')).toBe('a b&c');
      expect(url).not.toContain('a b&c');
    });

    // The defect this suite previously could not see: the origin-only predicate accepted a base carrying
    // its own query or fragment, and the builder concatenated `/?url=...` onto it as text. With
    // `?tenant=x` the whole suffix became part of `tenant`'s value; with `#frag` it stayed in the
    // fragment and was never sent. Either way ARender received no document, and every assertion
    // here was `toContain('url=')` — which passes on both broken URLs.
    describe.each([
      ['a query string', 'https://arender.example/app?tenant=x'],
      ['a fragment', 'https://arender.example/app#frag'],
      ['userinfo', 'https://user:pass@arender.example'],
    ])('when viewerOrigin carries %s', (_label, viewerOrigin) => {
      it('treats the configuration as unusable rather than building a broken URL', async () => {
        const service = setup({ viewerOrigin, nuxeoInternalUrl: 'https://proxy.internal/nuxeo' });

        await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
        await expect(firstValueFrom(service.getDiffUrl('a', 'b'))).resolves.toBeNull();
        await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
      });
    });

    it('rejects a nuxeoInternalUrl with a fragment, which would truncate the nxfile path', async () => {
      const service = setup({
        viewerOrigin: 'https://arender.example',
        nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo#x',
      });

      await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
    });

    // A *bare* delimiter, which passed validation until review found it: `new URL(...).search` and
    // `.hash` are both `''` for a URL ending in `?` or `#`, so the check that existed to prove
    // "appending to this base is safe" accepted the two bases appending to which is not safe.
    // Appended as text, `http://nuxeo-auth-proxy/nuxeo?` yields a request whose path is only
    // `/nuxeo` and whose nxfile suffix is a query string — ARender fetches the repository root
    // instead of the blob, and reports no error while doing it.
    it.each([
      ['a trailing question mark', 'http://nuxeo-auth-proxy/nuxeo?'],
      ['a trailing hash', 'http://nuxeo-auth-proxy/nuxeo#'],
    ])(
      'rejects a nuxeoInternalUrl ending in %s rather than pointing ARender at the wrong resource',
      async (_label, nuxeoInternalUrl) => {
        const service = setup({ viewerOrigin: 'https://arender.example', nuxeoInternalUrl });

        await expect(firstValueFrom(service.getPreviewerUrl('doc-1'))).resolves.toBeNull();
        await expect(firstValueFrom(service.getDiffUrl('a', 'b'))).resolves.toBeNull();
      },
    );

    // The string builder wrote `${viewerOrigin}/?url=`, so a path-prefixed viewer always got a
    // trailing slash. `new URL()` does not add one, and `/arender` and `/arender/` are different
    // routes — so moving to `searchParams` could have repointed every prefixed deployment.
    it.each([
      ['a bare origin', 'https://arender.example', '/'],
      ['a path prefix without a trailing slash', 'https://arender.example/arender', '/arender/'],
      ['a path prefix with a trailing slash', 'https://arender.example/arender/', '/arender/'],
    ])('keeps the trailing-slash contract for %s', async (_label, viewerOrigin, expectedPath) => {
      const service = setup({ viewerOrigin, nuxeoInternalUrl: 'https://proxy.internal/nuxeo' });

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      expect(new URL(url!).pathname).toBe(expectedPath);
      expect(new URL(url!).searchParams.getAll('url')).toHaveLength(1);
    });

    // The nxfile URL is resolved with `new URL()` rather than concatenated, so the base's trailing
    // slash cannot change the path it addresses. Asserted on the decoded `url` parameter, because
    // the failure this guards — `/nuxeo//nxfile/...` or `/nxfile/...` with `/nuxeo` dropped — is a
    // path difference that `toContain` on the whole URL would not distinguish.
    it.each([
      ['no trailing slash', 'https://proxy.internal/nuxeo', '/nuxeo/nxfile/default/doc-1/file:content'],
      ['a trailing slash', 'https://proxy.internal/nuxeo/', '/nuxeo/nxfile/default/doc-1/file:content'],
      ['a bare origin', 'https://proxy.internal', '/nxfile/default/doc-1/file:content'],
      ['a two-segment path', 'https://proxy.internal/a/b', '/a/b/nxfile/default/doc-1/file:content'],
    ])('resolves the nxfile path against a base with %s', async (_label, nuxeoInternalUrl, expectedPath) => {
      const service = setup({ viewerOrigin: 'https://arender.example', nuxeoInternalUrl });

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      const nxfile = new URL(new URL(url!).searchParams.getAll('url')[0]);
      expect(nxfile.pathname).toBe(expectedPath);
      expect(nxfile.search).toBe('');
      expect(nxfile.hash).toBe('');
    });

    it('produces exactly one top-level url parameter naming the nxfile path', async () => {
      const service = setup(CONFIGURED);

      const url = await firstValueFrom(service.getPreviewerUrl('doc-1'));

      // `getAll`, not `toContain`: the point is that `url` is a real top-level parameter with the
      // right value, which string matching cannot distinguish from `url=` buried in another value.
      const params = new URL(url!).searchParams.getAll('url');
      expect(params).toHaveLength(1);
      expect(params[0]).toContain('/nxfile/default/doc-1/file:content');
    });

    it('builds a diff URL carrying both documents', async () => {
      const service = setup(CONFIGURED);

      const url = await firstValueFrom(service.getDiffUrl('left-1', 'right-2'));

      expect(url).toContain(encodeURIComponent('/nxfile/default/left-1/file:content'));
      expect(url).toContain(encodeURIComponent('/nxfile/default/right-2/file:content'));
    });

    it('reports available when the viewer answers', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
      const service = setup(CONFIGURED);

      await expect(firstValueFrom(service.isAvailable())).resolves.toBe(true);
    });

    it('reports unavailable when the viewer is unreachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network error'));
      const service = setup(CONFIGURED);

      await expect(firstValueFrom(service.isAvailable())).resolves.toBe(false);
    });

    it('probes the configured origin, not the app origin', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(null, { status: 200 }));
      const service = setup(CONFIGURED);

      await firstValueFrom(service.isAvailable());

      expect(fetchSpy).toHaveBeenCalledWith('https://arender.example.com', { mode: 'no-cors' });
    });
  });
});
