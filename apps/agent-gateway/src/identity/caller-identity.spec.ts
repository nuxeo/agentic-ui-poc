import { describe, expect, it } from 'vitest';

import {
  jsonResponse,
  meResponse,
  recordingFetch,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
} from '../testing/test-doubles';
import {
  extractCredentialHeaders,
  resolveCaller,
  UnauthenticatedCallerError,
} from './caller-identity';

describe('extractCredentialHeaders', () => {
  it('forwards only the three credential-bearing headers', () => {
    const forwarded = extractCredentialHeaders({
      cookie: TEST_SESSION_COOKIE,
      authorization: 'Basic am9objpwdw==',
      'x-authentication-token': 'token-123',
      host: 'gateway.internal',
      origin: 'https://evil.example.com',
      referer: 'https://evil.example.com/page',
      'x-nxdocumentproperties': '*',
      'user-agent': 'Mozilla/5.0',
    });

    expect(Object.keys(forwarded).sort()).toEqual([
      'authorization',
      'cookie',
      'x-authentication-token',
    ]);
  });

  // Copying the inbound header set wholesale would let a caller inject
  // X-NX* headers straight into Nuxeo — hence an allow-list, not a deny-list.
  it('does not forward client-supplied X-NX headers', () => {
    const forwarded = extractCredentialHeaders({ 'x-nxvoidoperation': 'true' });
    expect(forwarded).toEqual({});
  });

  it('joins array-valued headers the way a client would have sent them', () => {
    const forwarded = extractCredentialHeaders({ cookie: ['a=1', 'b=2'] });
    expect(forwarded['cookie']).toBe('a=1; b=2');
  });

  it('ignores empty header values', () => {
    expect(extractCredentialHeaders({ cookie: '' })).toEqual({});
  });
});

describe('resolveCaller', () => {
  it('validates the session against /me and returns the Nuxeo principal', async () => {
    const recorder = recordingFetch(() => meResponse('alice'));

    const caller = await resolveCaller(
      { cookie: TEST_SESSION_COOKIE },
      { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl },
    );

    expect(caller.principalId).toBe('alice');
    expect(recorder.requests).toHaveLength(1);
    expect(recorder.requests[0]?.url).toBe(`${TEST_NUXEO_BASE_URL}/nuxeo/api/v1/me`);
    expect(recorder.requests[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
  });

  it('never lets the gateway decide the principal: a 401 from /me is a 401 here', async () => {
    const recorder = recordingFetch(() => jsonResponse({ error: 'unauthorized' }, 401));

    await expect(
      resolveCaller(
        { cookie: 'expired' },
        { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl },
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedCallerError);
  });

  // This is the property the whole identity model rests on. With no credential
  // there is nothing to validate, so nothing is sent to Nuxeo at all.
  it('does not contact Nuxeo when the caller presented no credential', async () => {
    const recorder = recordingFetch();

    await expect(
      resolveCaller({}, { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl }),
    ).rejects.toBeInstanceOf(UnauthenticatedCallerError);

    expect(recorder.requests).toHaveLength(0);
  });

  it('treats an unreachable Nuxeo as unauthenticated rather than as an authenticated caller', async () => {
    const failing = async () => {
      throw new Error('ECONNREFUSED');
    };

    await expect(
      resolveCaller(
        { cookie: TEST_SESSION_COOKIE },
        { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: failing },
      ),
    ).rejects.toBeInstanceOf(UnauthenticatedCallerError);
  });

  it('rejects a /me response with no principal', async () => {
    const recorder = recordingFetch(() => jsonResponse({ 'entity-type': 'user' }));

    await expect(
      resolveCaller(
        { cookie: TEST_SESSION_COOKIE },
        { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl },
      ),
    ).rejects.toThrow(/no principal/);
  });

  it('falls back to properties.username when Nuxeo omits id', async () => {
    const recorder = recordingFetch(() =>
      jsonResponse({ 'entity-type': 'user', properties: { username: 'bob' } }),
    );

    const caller = await resolveCaller(
      { authorization: 'Basic Ym9iOnB3' },
      { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl },
    );

    expect(caller.principalId).toBe('bob');
  });

  // ADR 001 rule 5: no caching across runs, so a logout or a permission change
  // between two runs takes effect on the next one.
  it('re-validates on every call instead of caching the principal', async () => {
    const recorder = recordingFetch(() => meResponse('alice'));
    const options = { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl };

    await resolveCaller({ cookie: TEST_SESSION_COOKIE }, options);
    await resolveCaller({ cookie: TEST_SESSION_COOKIE }, options);

    expect(recorder.requests).toHaveLength(2);
  });

  it('freezes the credential headers so a tool cannot mutate them mid-run', async () => {
    const recorder = recordingFetch(() => meResponse());
    const caller = await resolveCaller(
      { cookie: TEST_SESSION_COOKIE },
      { nuxeoBaseUrl: TEST_NUXEO_BASE_URL, fetchImpl: recorder.fetchImpl },
    );

    expect(Object.isFrozen(caller.credentialHeaders)).toBe(true);
  });
});
