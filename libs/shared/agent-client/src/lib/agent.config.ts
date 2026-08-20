import { InjectionToken } from '@angular/core';

/**
 * Origin prefix for the agent gateway. Empty by default, which makes every call a
 * same-origin absolute path under {@link AGENT_BASE_PATH}.
 *
 * Same-origin is a hard requirement, not a default worth overriding: `HttpAgent`
 * builds its `RequestInit` without a `credentials` option, so `fetch` falls back to
 * `same-origin` and a cross-origin gateway silently loses the Nuxeo session cookie
 * (ADR 001, "Why same-origin is a hard requirement").
 */
export const AGENT_RUNTIME_BASE_URL = new InjectionToken<string>('AGENT_RUNTIME_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

/**
 * Where the browser reaches the gateway, and the one detail that decides whether the
 * caller has an identity at all.
 *
 * It is under `/nuxeo/` deliberately. Tomcat scopes its session cookie to the context
 * path — Nuxeo answers `Set-Cookie: JSESSIONID=…; Path=/nuxeo; HttpOnly` — and a cookie
 * is sent only to request paths inside its `Path`. A gateway mounted at `/agent/run` is
 * therefore *same-origin and still cookie-less*: the browser withholds `JSESSIONID`
 * because the path does not match, `resolveCaller`'s `GET /me` is rejected, and the run
 * comes back `401`. Same origin is necessary and not sufficient; the path has to be
 * inside the cookie's scope too.
 *
 * That was a live defect, and its shape is worth remembering because nothing about it
 * looks like an authentication problem from the outside. The capability probe needs no
 * credential, so the header keeps its `AGENT` badge; every other request in the
 * application carries the cookie correctly because every other request *is* under
 * `/nuxeo/`; and the browser reports the `401` as "The assistant is unavailable. Check
 * the connection and try again." So a fully working, fully signed-in application shows
 * a connection error against a gateway that is running and reachable.
 *
 * A `Authorization: Basic …` header hid it in local development (`AGENT_DEV_AUTH_HEADERS`)
 * but only for password logins: an SSO or cookie session has no readable credential to
 * lend — `JSESSIONID` is `HttpOnly` — so it failed exactly as production did.
 *
 * The reverse proxy strips this `/nuxeo` prefix before forwarding, so the gateway's own
 * routes stay `/agent/*` and its HTTP surface is unchanged. See
 * `apps/agent-gateway/deploy/nginx.conf.example` and `apps/nuxeo-ui/proxy.conf*.json`.
 */
export const AGENT_BASE_PATH = '/nuxeo/agent';

/**
 * Extra headers for `HttpAgent`'s `fetch`, read fresh before every run.
 *
 * `HttpAgent` calls `fetch` directly and so never passes through Angular's
 * `NuxeoAuthInterceptor`. Cookie and SSO sessions need nothing from this token: the run
 * goes to {@link AGENT_BASE_PATH}, which is inside the Nuxeo session cookie's `Path`, so
 * `JSESSIONID` is sent by the browser on its own. What this token exists for is the
 * password login used on `localhost:4200`, where the app holds `Authorization: Basic …`
 * rather than a Nuxeo cookie and `fetch` has no interceptor to attach it.
 *
 * It is a supplement to the cookie and never a substitute for it. Relying on it to carry
 * every caller is what hid the missing `/nuxeo` prefix for as long as it did — see
 * {@link AGENT_BASE_PATH}.
 *
 * A function, not a value: the credential does not exist until the user logs in, which
 * happens long after this token is constructed.
 */
export const AGENT_DEV_AUTH_HEADERS = new InjectionToken<() => Record<string, string>>(
  'AGENT_DEV_AUTH_HEADERS',
  { providedIn: 'root', factory: () => () => ({}) },
);

/** ADR 001: the bootstrap capability probe gets two seconds and no more. */
export const AGENT_CAPABILITY_PROBE_TIMEOUT_MS = 2000;

/** Overridable only so tests can exercise the timeout without waiting two seconds. */
export const AGENT_CAPABILITY_PROBE_TIMEOUT = new InjectionToken<number>(
  'AGENT_CAPABILITY_PROBE_TIMEOUT',
  { providedIn: 'root', factory: () => AGENT_CAPABILITY_PROBE_TIMEOUT_MS },
);

export function agentRunUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}${AGENT_BASE_PATH}/run`;
}

export function agentCapabilitiesUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}${AGENT_BASE_PATH}/capabilities`;
}
