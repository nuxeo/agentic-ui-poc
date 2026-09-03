import { HttpContextToken } from '@angular/common/http';

/** When true, send cookies on a Basic-auth request to establish a Nuxeo browser session. */
export const NUXEO_ESTABLISH_BROWSER_SESSION = new HttpContextToken<boolean>(() => false);

/**
 * Marks a request that must be authenticated by its explicit headers alone.
 *
 * Best-effort only: the XHR backend ignores `withCredentials: false` for same-origin
 * requests, so a surviving `JSESSIONID` is still sent and can override the header
 * credentials. Callers must verify the principal they get back rather than assume
 * the cookie was excluded.
 */
export const NUXEO_OMIT_CREDENTIALS = new HttpContextToken<boolean>(() => false);
