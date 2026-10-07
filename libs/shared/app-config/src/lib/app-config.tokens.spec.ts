import { describe, expect, it } from 'vitest';

import { resolveBootstrapConfigUrl, resolveManifestConfigUrl } from './app-config.tokens';

describe('resolveBootstrapConfigUrl', () => {
  it('resolves beside the bundle in a marketplace deployment', () => {
    // Served by the configuration servlet in nuxeo-agentic-core, beside the bundle.
    expect(resolveBootstrapConfigUrl('https://nuxeo.example/nuxeo/agentic-ui/')).toBe(
      '/nuxeo/agentic-ui-config/bootstrap.json',
    );
  });

  it('resolves to the server root under the dev server', () => {
    expect(resolveBootstrapConfigUrl('http://localhost:4200/')).toBe(
      '/agentic-ui-config/bootstrap.json',
    );
  });

  it('never escapes above the root', () => {
    expect(resolveBootstrapConfigUrl('http://localhost/')).toBe(
      '/agentic-ui-config/bootstrap.json',
    );
  });

  it('ignores a base URI query string', () => {
    expect(resolveBootstrapConfigUrl('https://nuxeo.example/nuxeo/agentic-ui/?x=1')).toBe(
      '/nuxeo/agentic-ui-config/bootstrap.json',
    );
  });
});

describe('resolveManifestConfigUrl', () => {
  it('is the sibling of bootstrap.json, wherever that is served from', () => {
    expect(resolveManifestConfigUrl('/nuxeo/agentic-ui-config/bootstrap.json')).toBe(
      '/nuxeo/agentic-ui-config/manifest.json',
    );
    expect(resolveManifestConfigUrl('/agentic-ui-config/bootstrap.json')).toBe(
      '/agentic-ui-config/manifest.json',
    );
  });

  it('never points at a Nuxeo document', () => {
    expect(resolveManifestConfigUrl('/nuxeo/agentic-ui-config/bootstrap.json')).not.toContain(
      '/api/v1/',
    );
  });
});
