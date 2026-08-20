import {
  FORWARDED_CREDENTIAL_HEADERS,
  type CallerIdentity,
  type FetchLike,
} from '../identity/caller-identity';

/**
 * The only way out of this process to Nuxeo.
 *
 * Three invariants, each of which exists because breaking it is a security bug
 * rather than a functional one:
 *
 *  - Every request takes a `CallerIdentity`. There is no anonymous overload and
 *    no service-account mode, so a tool physically cannot query Nuxeo as anyone
 *    but the signed-in user.
 *  - The credential headers are applied *after* any per-request headers, so a
 *    tool cannot override or strip them, deliberately or by accident.
 *  - The target host comes from server configuration. Callers supply a path,
 *    which must be repository-relative and rooted at `/nuxeo/`; an absolute URL
 *    or a traversal escape is rejected before a socket is opened (ADR 001,
 *    identity propagation rule 7).
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** `BodyInit` is not a Node global; take it from the `fetch` types we already use. */
export type RequestBody = NonNullable<RequestInit['body']>;

export interface NuxeoRequest {
  readonly method: HttpMethod;
  /** Repository-relative path, e.g. `/nuxeo/api/v1/id/abc`. Never a full URL. */
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | boolean | undefined>>;
  /** JSON request body. Mutually exclusive with `body`. */
  readonly json?: unknown;
  /** Pre-encoded body, for multipart uploads. Mutually exclusive with `json`. */
  readonly body?: RequestBody;
  readonly headers?: Readonly<Record<string, string>>;
  readonly accept?: string;
  readonly signal?: AbortSignal;
}

export class NuxeoRequestError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    /** Upstream body, truncated. Server-side logging only — never sent to the user. */
    readonly detail: string,
  ) {
    super(`Nuxeo returned ${status} for ${path}`);
    this.name = 'NuxeoRequestError';
  }
}

const ALLOWED_PATH_PREFIXES = ['/nuxeo/api/v1/', '/nuxeo/site/'];
const MAX_ERROR_DETAIL = 512;

/** Rejects anything that is not a server-controlled, repository-relative path. */
export function assertServerControlledPath(path: string): void {
  if (!path.startsWith('/')) {
    throw new Error(`Nuxeo path must be repository-relative, got "${path}".`);
  }
  // `//host/x` is protocol-relative and would leave the configured server.
  if (path.startsWith('//') || path.includes('://')) {
    throw new Error(`Nuxeo path must not be absolute, got "${path}".`);
  }
  if (path.includes('..')) {
    throw new Error(`Nuxeo path must not contain traversal segments, got "${path}".`);
  }
  if (!ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    throw new Error(
      `Nuxeo path must start with one of ${ALLOWED_PATH_PREFIXES.join(', ')}, got "${path}".`,
    );
  }
}

/**
 * Drops every credential header from a per-request header set.
 *
 * Spreading the caller's headers last is not enough on its own: a caller
 * authenticated by cookie has no `authorization` entry to overwrite, so a tool
 * that set one would have it sent alongside the session. Removing the whole
 * class first means the only credential on the wire is the caller's.
 */
function stripCredentialHeaders(
  headers: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const forbidden = new Set<string>(FORWARDED_CREDENTIAL_HEADERS);
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !forbidden.has(name.toLowerCase())),
  );
}

export class NuxeoRestClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  async fetch(caller: CallerIdentity, request: NuxeoRequest): Promise<Response> {
    assertServerControlledPath(request.path);

    const url = new URL(`${this.baseUrl}${request.path}`);
    for (const [key, value] of Object.entries(request.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      accept: request.accept ?? 'application/json',
      ...stripCredentialHeaders(request.headers),
      // Applied last on purpose: the caller's identity is not overridable.
      ...caller.credentialHeaders,
    };

    let body: RequestBody | undefined = request.body;
    if (request.json !== undefined) {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(request.json);
    }

    const response = await this.fetchImpl(url.toString(), {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
      ...(request.signal ? { signal: request.signal } : {}),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new NuxeoRequestError(response.status, request.path, detail.slice(0, MAX_ERROR_DETAIL));
    }

    return response;
  }

  async json<T>(caller: CallerIdentity, request: NuxeoRequest): Promise<T> {
    const response = await this.fetch(caller, request);
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  async binary(
    caller: CallerIdentity,
    request: NuxeoRequest,
  ): Promise<{ data: ArrayBuffer; contentType: string; filename: string }> {
    const response = await this.fetch(caller, { accept: '*/*', ...request });
    const disposition = response.headers.get('content-disposition') ?? '';
    const match = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|([^;\n]*))/.exec(disposition);
    return {
      data: await response.arrayBuffer(),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      filename: (match?.[2] ?? match?.[3] ?? 'content').trim(),
    };
  }

  /**
   * Nuxeo Automation envelope: `POST /nuxeo/api/v1/automation/<id>` with
   * `{ params, context, input }` (AGENTS/02-nuxeo-apis.md).
   */
  automation<T>(
    caller: CallerIdentity,
    operationId: string,
    params: Record<string, unknown> = {},
    options: { readonly input?: unknown; readonly signal?: AbortSignal } = {},
  ): Promise<T> {
    return this.json<T>(caller, {
      method: 'POST',
      path: `/nuxeo/api/v1/automation/${encodeURIComponent(operationId)}`,
      json: {
        params,
        context: {},
        ...(options.input === undefined ? {} : { input: options.input }),
      },
      ...(options.signal ? { signal: options.signal } : {}),
    });
  }
}
