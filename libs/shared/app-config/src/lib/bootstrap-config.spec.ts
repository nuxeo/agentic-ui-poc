import { describe, expect, it } from 'vitest';

import {
  DEFAULT_APP_BOOTSTRAP_CONFIG,
  mergeBootstrapConfig,
  resolveTheme,
} from './bootstrap-config';

describe('mergeBootstrapConfig', () => {
  it('returns the packaged defaults when nothing is configured', () => {
    expect(mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, undefined)).toEqual(
      DEFAULT_APP_BOOTSTRAP_CONFIG,
    );
  });

  it('overlays only the keys the customer set', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      branding: { applicationTitle: 'Acme Content' },
    });

    expect(merged.branding.applicationTitle).toBe('Acme Content');
    expect(merged.branding.documentTitle).toBe(DEFAULT_APP_BOOTSTRAP_CONFIG.branding.documentTitle);
    expect(merged.aiBackendUrl).toBe(DEFAULT_APP_BOOTSTRAP_CONFIG.aiBackendUrl);
  });

  it('distinguishes an explicit null server URL from an absent one', () => {
    expect(
      mergeBootstrapConfig(
        { ...DEFAULT_APP_BOOTSTRAP_CONFIG, nuxeoServerUrl: 'https://nuxeo.example' },
        { nuxeoServerUrl: null },
      ).nuxeoServerUrl,
    ).toBeNull();

    expect(
      mergeBootstrapConfig(
        { ...DEFAULT_APP_BOOTSTRAP_CONFIG, nuxeoServerUrl: 'https://nuxeo.example' },
        {},
      ).nuxeoServerUrl,
    ).toBe('https://nuxeo.example');
  });

  it('restyles a packaged theme without restating the others', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      themes: [{ id: 'nuxeo', label: 'Acme', tokens: { '--mat-sys-primary': 'rebeccapurple' } }],
    });

    expect(merged.themes).toHaveLength(DEFAULT_APP_BOOTSTRAP_CONFIG.themes.length);
    const nuxeo = merged.themes.find((theme) => theme.id === 'nuxeo');
    expect(nuxeo?.label).toBe('Acme');
    expect(nuxeo?.tokens['--mat-sys-primary']).toBe('rebeccapurple');
    expect(merged.themes.find((theme) => theme.id === 'dark')?.label).toBe('Dark');
  });

  it('appends an entirely new theme and defaults its palette base', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      themes: [{ id: 'acme', label: 'Acme', tokens: { '--mat-sys-primary': 'teal' } }],
    });

    const acme = merged.themes.find((theme) => theme.id === 'acme');
    expect(acme?.base).toBe('nuxeo');
    expect(acme?.tokens['--mat-sys-primary']).toBe('teal');
  });

  // Error paths: a customer who saves nonsense must still get a working application.
  it.each([
    ['null', null],
    ['a string', 'not an object'],
    ['an array', [1, 2, 3]],
    ['a number', 42],
  ])('ignores a configuration document that is %s', (_label, patch) => {
    expect(mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, patch)).toEqual(
      DEFAULT_APP_BOOTSTRAP_CONFIG,
    );
  });

  it('ignores fields whose type is wrong rather than adopting them', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      nuxeoApiOrigin: 12,
      aiBackendUrl: { url: '/nuxeo' },
      availableLanguages: 'en',
      themes: 'all of them',
      branding: 'Acme',
    });

    expect(merged).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG);
  });

  it('drops theme entries with no usable id and non-string token values', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      themes: [
        { label: 'no id at all' },
        { id: '   ' },
        'not an object',
        { id: 'acme', tokens: { '--good': 'red', '--bad': { nested: true } } },
      ],
    });

    expect(merged.themes.map((theme) => theme.id)).toEqual([
      'nuxeo',
      'dark',
      'kawaii',
      'light',
      'acme',
    ]);
    expect(merged.themes.find((theme) => theme.id === 'acme')?.tokens).toEqual({ '--good': 'red' });
  });

  it('overlays only the integration operations the customer renamed', () => {
    const base = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: {
        knowledgeDiscoveryOperations: { getAllAgents: 'Acme.Agents', invoke: 'Acme.Invoke' },
      },
    });
    const merged = mergeBootstrapConfig(base, {
      integrations: { knowledgeDiscoveryOperations: { invoke: 'Acme.Invoke2' } },
    });

    expect(merged.integrations.knowledgeDiscoveryOperations).toEqual({
      getAllAgents: 'Acme.Agents',
      invoke: 'Acme.Invoke2',
    });
  });

  it('reads both ARender endpoints together', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: {
        arender: {
          viewerOrigin: 'https://arender.example',
          nuxeoInternalUrl: 'http://nuxeo/nuxeo',
        },
      },
    });

    expect(merged.integrations.arender).toEqual({
      viewerOrigin: 'https://arender.example',
      nuxeoInternalUrl: 'http://nuxeo/nuxeo',
    });
  });

  // The comment beside `mergeIntegrations` has always said both endpoints are required, but the
  // merge used to fill a missing half from `base.arender?.… ?? ''` — and `base.arender` is `null`,
  // so a one-sided manifest produced an object with a blank endpoint: exactly the state the comment
  // claimed was impossible. That is worse than `null`, because `fetch('')` resolves against the
  // application's own origin, so an availability probe reports a viewer that is not deployed.
  it.each([
    ['only viewerOrigin', { viewerOrigin: 'https://arender.example' }],
    ['only nuxeoInternalUrl', { nuxeoInternalUrl: 'http://nuxeo/nuxeo' }],
    ['a blank viewerOrigin', { viewerOrigin: '   ', nuxeoInternalUrl: 'http://nuxeo/nuxeo' }],
    ['a blank nuxeoInternalUrl', { viewerOrigin: 'https://arender.example', nuxeoInternalUrl: '' }],
    ['neither endpoint', {}],
  ])('yields null for a manifest naming %s', (_label, arender) => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: { arender },
    });

    expect(merged.integrations.arender).toBeNull();
  });

  it('lets an explicit null turn a configured integration off', () => {
    // `isRecord(null)` is false, so this used to fall through to the base and preserve the old
    // configuration — a higher-priority manifest could reconfigure ARender but never disable it,
    // which contradicts `null` meaning "no annotation viewer".
    const complete = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: {
        arender: { viewerOrigin: 'https://a.example', nuxeoInternalUrl: 'http://nuxeo/nuxeo' },
      },
    });

    const disabled = mergeBootstrapConfig(complete, { integrations: { arender: null } });

    expect(complete.integrations.arender).not.toBeNull();
    expect(disabled.integrations.arender).toBeNull();
  });

  it('leaves a configured integration alone when the key is absent', () => {
    // The counterpart: absent must not mean disabled, or every partial manifest would wipe it.
    const complete = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: {
        arender: { viewerOrigin: 'https://a.example', nuxeoInternalUrl: 'http://nuxeo/nuxeo' },
      },
    });

    const untouched = mergeBootstrapConfig(complete, { integrations: {} });

    expect(untouched.integrations.arender).toEqual(complete.integrations.arender);
  });

  it('lets a partial override merge over an already-complete configuration', () => {
    // It is the *result* that must be complete, not the patch. A deployment overriding only the
    // viewer origin on top of a complete base is a legitimate manifest, not a half configuration.
    const complete = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: {
        arender: { viewerOrigin: 'https://a.example', nuxeoInternalUrl: 'http://nuxeo/nuxeo' },
      },
    });

    const patched = mergeBootstrapConfig(complete, {
      integrations: { arender: { viewerOrigin: 'https://b.example' } },
    });

    expect(patched.integrations.arender).toEqual({
      viewerOrigin: 'https://b.example',
      nuxeoInternalUrl: 'http://nuxeo/nuxeo',
    });
  });

  it('reads session timings and rejects nonsensical ones', () => {
    expect(
      mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
        session: { idleTimeoutMs: 60_000, warningBeforeMs: 5_000 },
      }).session,
    ).toEqual({ idleTimeoutMs: 60_000, warningBeforeMs: 5_000 });

    expect(
      mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
        session: { idleTimeoutMs: -1, warningBeforeMs: 'soon' },
      }).session,
    ).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG.session);
  });

  it('keeps only SSO endpoints that can actually be navigated to', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      sso: {
        endpoints: [
          { id: 'azure', label: 'Azure AD', path: '/nuxeo/oauth2/authorization/azure' },
          { id: 'no-path' },
          { path: '/nuxeo/no-id' },
          { id: 'relative', path: 'nuxeo/relative' },
          { id: 'unlabelled', path: '/nuxeo/unlabelled' },
        ],
        postLoginPath: '/browse',
      },
    });

    expect(merged.sso.endpoints).toEqual([
      { id: 'azure', label: 'Azure AD', path: '/nuxeo/oauth2/authorization/azure' },
      { id: 'unlabelled', label: 'unlabelled', path: '/nuxeo/unlabelled' },
    ]);
    expect(merged.sso.postLoginPath).toBe('/browse');
    expect(merged.sso.returnQueryParam).toBe(DEFAULT_APP_BOOTSTRAP_CONFIG.sso.returnQueryParam);
  });

  it('lets a customer turn every SSO button off', () => {
    expect(
      mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, { sso: { endpoints: [] } }).sso.endpoints,
    ).toEqual([]);
  });

  it('ignores integration, session and SSO sections of the wrong shape', () => {
    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, {
      integrations: 'arender',
      session: 30,
      sso: ['azure'],
    });

    expect(merged.integrations).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG.integrations);
    expect(merged.session).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG.session);
    expect(merged.sso).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG.sso);
  });

  it('falls back to the packaged languages when the configured list is empty', () => {
    expect(
      mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, { availableLanguages: [] })
        .availableLanguages,
    ).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG.availableLanguages);
  });
});

describe('resolveTheme', () => {
  it('returns the requested theme', () => {
    expect(resolveTheme(DEFAULT_APP_BOOTSTRAP_CONFIG, 'kawaii').id).toBe('kawaii');
  });

  it('falls back to the configured default for an unknown or absent id', () => {
    expect(resolveTheme(DEFAULT_APP_BOOTSTRAP_CONFIG, 'no-such-theme').id).toBe('nuxeo');
    expect(resolveTheme(DEFAULT_APP_BOOTSTRAP_CONFIG, null).id).toBe('nuxeo');
  });

  it('falls back to the first theme when the configured default does not exist', () => {
    const config = { ...DEFAULT_APP_BOOTSTRAP_CONFIG, defaultThemeId: 'missing' };
    expect(resolveTheme(config, null).id).toBe('nuxeo');
  });

  it('never returns undefined, even for an empty theme list', () => {
    const config = { ...DEFAULT_APP_BOOTSTRAP_CONFIG, themes: [] };
    expect(resolveTheme(config, 'anything').id).toBe('nuxeo');
  });
});
