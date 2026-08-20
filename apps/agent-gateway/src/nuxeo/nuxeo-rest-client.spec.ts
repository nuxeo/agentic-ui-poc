import { describe, expect, it } from 'vitest';

import {
  jsonResponse,
  recordingFetch,
  testCaller,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
} from '../testing/test-doubles';
import {
  assertServerControlledPath,
  NuxeoRequestError,
  NuxeoRestClient,
} from './nuxeo-rest-client';

describe('assertServerControlledPath', () => {
  it('accepts repository-relative REST and site paths', () => {
    expect(() => assertServerControlledPath('/nuxeo/api/v1/id/abc')).not.toThrow();
    expect(() => assertServerControlledPath('/nuxeo/site/automation/Op')).not.toThrow();
  });

  // ADR 001 rule 7: the caller must not be able to choose which Nuxeo instance
  // is called. A tool argument that reached the path would otherwise let a
  // prompt-injected model exfiltrate the session cookie to another host.
  it.each([
    'https://evil.example.com/nuxeo/api/v1/me',
    '//evil.example.com/nuxeo/api/v1/me',
    '/nuxeo/api/v1/../../evil',
    'nuxeo/api/v1/id/abc',
    '/other/api/v1/id/abc',
  ])('rejects "%s"', (path) => {
    expect(() => assertServerControlledPath(path)).toThrow();
  });
});

describe('NuxeoRestClient', () => {
  it('forwards the caller credential on every request', async () => {
    const recorder = recordingFetch(() => jsonResponse({ uid: 'abc' }));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.json(testCaller(), { method: 'GET', path: '/nuxeo/api/v1/id/abc' });

    expect(recorder.requests[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
  });

  // The whole point of applying credentials last: a tool cannot drop or
  // substitute the caller's identity, deliberately or by copy-paste accident.
  it('does not let a per-request header override the caller credential', async () => {
    const recorder = recordingFetch(() => jsonResponse({}));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.json(testCaller(), {
      method: 'GET',
      path: '/nuxeo/api/v1/id/abc',
      headers: { cookie: 'JSESSIONID=attacker', authorization: 'Basic YWRtaW46YWRtaW4=' },
    });

    expect(recorder.requests[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
    expect(recorder.requests[0]?.headers['authorization']).toBeUndefined();
  });

  it('builds the URL from the configured base plus query parameters', async () => {
    const recorder = recordingFetch(() => jsonResponse({ entries: [] }));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.json(testCaller(), {
      method: 'GET',
      path: '/nuxeo/api/v1/search/lang/NXQL/execute',
      query: { query: 'SELECT * FROM Document', pageSize: 10, skipped: undefined },
    });

    const url = new URL(recorder.requests[0]?.url ?? '');
    expect(url.origin).toBe(TEST_NUXEO_BASE_URL);
    expect(url.searchParams.get('query')).toBe('SELECT * FROM Document');
    expect(url.searchParams.get('pageSize')).toBe('10');
    expect(url.searchParams.has('skipped')).toBe(false);
  });

  it('sends a JSON body with the right content type', async () => {
    const recorder = recordingFetch(() => jsonResponse({}));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.json(testCaller(), {
      method: 'PUT',
      path: '/nuxeo/api/v1/id/abc',
      json: { 'entity-type': 'document', properties: { 'dc:title': 'New' } },
    });

    expect(recorder.requests[0]?.headers['content-type']).toBe('application/json');
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toMatchObject({
      properties: { 'dc:title': 'New' },
    });
  });

  it('raises NuxeoRequestError carrying the upstream status', async () => {
    const recorder = recordingFetch(() => jsonResponse({ message: 'denied' }, 403));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await expect(
      client.json(testCaller(), { method: 'GET', path: '/nuxeo/api/v1/id/abc' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('truncates the upstream error body kept for logging', async () => {
    const recorder = recordingFetch(() => new Response('x'.repeat(4000), { status: 500 }));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    const error = await client
      .json(testCaller(), { method: 'GET', path: '/nuxeo/api/v1/id/abc' })
      .catch((caught: unknown) => caught as NuxeoRequestError);

    expect((error as NuxeoRequestError).detail.length).toBeLessThanOrEqual(512);
  });

  it('returns undefined for an empty 200 body rather than throwing on JSON.parse', async () => {
    const recorder = recordingFetch(() => new Response('', { status: 200 }));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await expect(
      client.json(testCaller(), { method: 'DELETE', path: '/nuxeo/api/v1/id/abc' }),
    ).resolves.toBeUndefined();
  });

  it('wraps automation calls in the params/context envelope', async () => {
    const recorder = recordingFetch(() => jsonResponse({ uid: 'col-1' }));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.automation(testCaller(), 'Collection.Create', { name: 'Q3' });

    expect(recorder.requests[0]?.url).toBe(
      `${TEST_NUXEO_BASE_URL}/nuxeo/api/v1/automation/Collection.Create`,
    );
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toEqual({
      params: { name: 'Q3' },
      context: {},
    });
  });

  it('includes the automation input only when one is supplied', async () => {
    const recorder = recordingFetch(() => jsonResponse({}));
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    await client.automation(testCaller(), 'Document.Move', { target: 'f' }, { input: 'doc:a' });

    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toMatchObject({ input: 'doc:a' });
  });

  it('reads a binary blob with its content type and filename', async () => {
    const recorder = recordingFetch(
      () =>
        new Response('pdf-bytes', {
          status: 200,
          headers: {
            'content-type': 'application/pdf',
            'content-disposition': 'attachment; filename="contract.pdf"',
          },
        }),
    );
    const client = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);

    const blob = await client.binary(testCaller(), {
      method: 'GET',
      path: '/nuxeo/api/v1/id/abc/@blob/file:content',
    });

    expect(blob.contentType).toBe('application/pdf');
    expect(blob.filename).toBe('contract.pdf');
    expect(blob.data.byteLength).toBe(9);
  });
});
