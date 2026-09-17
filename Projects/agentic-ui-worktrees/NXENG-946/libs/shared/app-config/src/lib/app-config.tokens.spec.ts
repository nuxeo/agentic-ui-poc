import { describe, expect, it } from 'vitest';

import { resolveBootstrapConfigUrl } from './app-config.tokens';

describe('resolveBootstrapConfigUrl', () => {
  it('resolves beside the bundle in a marketplace deployment', () => {
    // The installer copies `web` over `.../nuxeo.war/agentic-ui` with
    // overwrite="true"; the sibling directory is what survives an upgrade.
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
