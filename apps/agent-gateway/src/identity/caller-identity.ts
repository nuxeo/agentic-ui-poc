import type { IncomingHttpHeaders } from 'node:http';

/**
 * Caller identity — the single most important property of this design.
 *
 * The gateway never decides who the caller is. It forwards the credential the
 * browser already sent to `GET /nuxeo/api/v1/me` and lets Nuxeo answer. Every
 * downstream call in the run then carries those same headers, so Nuxeo applies
 * the caller's ACLs to each read and write. An agent that queried Nuxeo with a
 * service account would return documents the user cannot see, silently and with
 * no audit signal — see ADR 001, "Identity propagation".
 *
 * Two structural choices keep that from regressing:
 *
 *  1. `CallerIdentity` is the only carrier of credential headers in the process,
 *     and `NuxeoRestClient` will not issue a request without one. There is no
 *     code path that reaches Nuxeo anonymously, so "forgot to forward the
 *     identity" is a type error rather than a silent ACL bypass.
 *  2. Headers are forwarded by allow-list. Copying the inbound header set would
 *     leak `Host`, `Origin`, `Referer` and any client-supplied `X-NX*` header
 *     into Nuxeo.
 */

/** ADR 001, identity propagation rule 6. Nothing outside this list is forwarded. */
export const FORWARDED_CREDENTIAL_HEADERS = [
  'cookie',
  'authorization',
  'x-authentication-token',
] as const;

export interface CallerIdentity {
  /** Nuxeo principal id, as reported by `/me`. Never derived from client input. */
  readonly principalId: string;
  readonly isAdministrator: boolean;
  /** The exact headers to replay on every downstream Nuxeo call. */
  readonly credentialHeaders: Readonly<Record<string, string>>;
}

export class UnauthenticatedCallerError extends Error {
  readonly code = 'UNAUTHENTICATED';

  constructor(message = 'Not authenticated.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'UnauthenticatedCallerError';
  }
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface ResolveCallerOptions {
  readonly nuxeoBaseUrl: string;
  readonly fetchImpl?: FetchLike;
  readonly signal?: AbortSignal;
}

/**
 * Picks the credential-bearing headers out of the inbound request. Array-valued
 * headers (only `set-cookie` in practice, but Node types allow more) are joined
 * with `; ` the way an HTTP client would have sent them.
 */
export function extractCredentialHeaders(headers: IncomingHttpHeaders): Record<string, string> {
  const forwarded: Record<string, string> = {};
  for (const name of FORWARDED_CREDENTIAL_HEADERS) {
    const value = headers[name];
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join('; ');
      if (joined) forwarded[name] = joined;
    } else if (typeof value === 'string' && value.length > 0) {
      forwarded[name] = value;
    }
  }
  return forwarded;
}

interface NuxeoMeResponse {
  readonly id?: string;
  readonly uid?: string;
  readonly isAdministrator?: boolean;
  readonly properties?: { readonly username?: string };
}

/**
 * Validates the caller against Nuxeo. A non-200 from `/me` is an unauthenticated
 * caller, full stop — the gateway has no other way to identify anyone.
 *
 * Called on every run and never cached: a permission change or a logout between
 * two runs must take effect on the next one (ADR 001, rule 5).
 */
export async function resolveCaller(
  headers: IncomingHttpHeaders,
  options: ResolveCallerOptions,
): Promise<CallerIdentity> {
  const credentialHeaders = extractCredentialHeaders(headers);

  // No credential at all cannot become a valid session, so short-circuit rather
  // than spending a round trip on a guaranteed 401. This is also what makes
  // "an unauthenticated request never reaches Nuxeo" literally true.
  if (Object.keys(credentialHeaders).length === 0) {
    throw new UnauthenticatedCallerError('No Nuxeo session was presented.');
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(`${options.nuxeoBaseUrl}/nuxeo/api/v1/me`, {
      method: 'GET',
      headers: { ...credentialHeaders, accept: 'application/json' },
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (cause) {
    throw new UnauthenticatedCallerError('Could not reach Nuxeo to validate the session.', {
      cause,
    });
  }

  if (!response.ok) {
    throw new UnauthenticatedCallerError('Nuxeo rejected the caller session.');
  }

  const me = (await response.json()) as NuxeoMeResponse;
  const principalId = me.id ?? me.uid ?? me.properties?.username;
  if (!principalId) {
    throw new UnauthenticatedCallerError('Nuxeo returned no principal for the caller session.');
  }

  return {
    principalId,
    isAdministrator: me.isAdministrator === true,
    credentialHeaders: Object.freeze({ ...credentialHeaders }),
  };
}
