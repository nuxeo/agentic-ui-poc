import { readShareTokenFromBrowserUrl, stripShareTokenFromBrowserUrl } from './share-token.util';

describe('share-token.util', () => {
  it('reads token from search query before hash', () => {
    expect(
      readShareTokenFromBrowserUrl('https://host/nuxeo/agentic-ui/?token=abc123#/doc/doc-1'),
    ).toBe('abc123');
  });

  it('reads token from hash query', () => {
    expect(
      readShareTokenFromBrowserUrl('https://host/nuxeo/agentic-ui/#/doc/doc-1?token=abc123'),
    ).toBe('abc123');
  });

  it('returns null when token is absent', () => {
    expect(readShareTokenFromBrowserUrl('https://host/nuxeo/agentic-ui/#/doc/doc-1')).toBeNull();
  });

  it('strips token from search and hash query', () => {
    const replaceState = jasmine.createSpy('replaceState');
    const original = window.history.replaceState;
    window.history.replaceState = replaceState;

    try {
      stripShareTokenFromBrowserUrl('https://host/nuxeo/agentic-ui/?token=abc123#/doc/doc-1');
      expect(replaceState).toHaveBeenCalledWith(
        window.history.state,
        '',
        'https://host/nuxeo/agentic-ui/#/doc/doc-1',
      );

      replaceState.calls.reset();
      stripShareTokenFromBrowserUrl('https://host/nuxeo/agentic-ui/#/doc/doc-1?token=abc123');
      expect(replaceState).toHaveBeenCalledWith(
        window.history.state,
        '',
        'https://host/nuxeo/agentic-ui/#/doc/doc-1',
      );
    } finally {
      window.history.replaceState = original;
    }
  });
});
