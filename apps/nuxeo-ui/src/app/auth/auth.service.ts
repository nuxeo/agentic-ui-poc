import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, defer, map, of, shareReplay, tap, throwError } from 'rxjs';

import {
  NUXEO_API_ORIGIN,
  NUXEO_SAML_LOGIN_ENDPOINTS,
  NUXEO_SSO_POST_LOGIN_PATH,
  NUXEO_SSO_RETURN_QUERY_PARAM,
  type NuxeoSamlLoginEndpoint,
} from '@agentic-ui/shared/nuxeo-client';

const STORAGE_KEY = 'agentic_ui_nuxeo_session';

interface BasicStoredSession {
  kind: 'basic';
  username: string;
  basic: string;
  isAdministrator: boolean;
}

interface CookieStoredSession {
  kind: 'cookie';
  username: string;
  isAdministrator: boolean;
}

type StoredSession = BasicStoredSession | CookieStoredSession;

/** Legacy payload before `kind` was introduced. */
interface LegacyStoredSession {
  username: string;
  basic: string;
  isAdministrator: boolean;
}

/** Nuxeo may return boolean, string, or numeric 1 depending on marshaller/version. */
function isTruthyAdministratorFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1;
}

/** Reads admin flag from Nuxeo `GET /me` (shape varies slightly by version). */
function readIsAdministratorFromMe(me: unknown): boolean {
  if (!me || typeof me !== 'object') return false;
  const o = me as Record<string, unknown>;
  if (isTruthyAdministratorFlag(o['isAdministrator'])) return true;
  const props = o['properties'];
  if (props && typeof props === 'object') {
    const p = (props as Record<string, unknown>)['isAdministrator'];
    if (isTruthyAdministratorFlag(p)) return true;
  }
  return false;
}

function readUsernameFromMe(me: unknown): string | null {
  if (!me || typeof me !== 'object') return null;
  const id = (me as Record<string, unknown>)['id'];
  if (typeof id === 'string' && id.length > 0) return id;
  const props = (me as Record<string, unknown>)['properties'];
  if (props && typeof props === 'object') {
    const u = (props as Record<string, unknown>)['username'];
    if (typeof u === 'string' && u.length > 0) return u;
  }
  return null;
}

/** Default Nuxeo built-in admin user id — used if `/me` omits `isAdministrator`. */
function isBuiltInAdministratorUsername(username: string): boolean {
  return username.trim().toLowerCase() === 'administrator';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly samlEndpoints = inject(NUXEO_SAML_LOGIN_ENDPOINTS);
  private readonly ssoPostLoginPath = inject(NUXEO_SSO_POST_LOGIN_PATH);
  private readonly ssoReturnQueryParam = inject(NUXEO_SSO_RETURN_QUERY_PARAM);

  private readonly state = signal<StoredSession | null>(null);
  private hydration$: Observable<void> | null = null;

  readonly samlLoginOptions = computed(() => this.samlEndpoints);

  readonly username = computed(() => this.state()?.username ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);
  /**
   * True when Nuxeo reports administrator on `/me`, or when using the built-in
   * `Administrator` account and the API omitted the flag (common with older sessions).
   */
  readonly isAdministrator = computed(() => {
    const s = this.state();
    if (!s) return false;
    if (s.isAdministrator) return true;
    return isBuiltInAdministratorUsername(s.username);
  });

  constructor() {
    this.restoreSession();
    if (this.state()) {
      // Validation deferred to ensureHydrated() on first navigation
    }
  }

  private apiUrl(path: string): string {
    const base = this.apiOrigin.replace(/\/$/, '');
    return `${base}${path}`;
  }

  /** Public Nuxeo origin for full-page SAML redirects (matches API proxy in dev when origin is ''). */
  private nuxeoBrowserOrigin(): string {
    const o = this.apiOrigin.replace(/\/$/, '');
    if (o) return o;
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  }

  private restoreSession(): void {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredSession | LegacyStoredSession;
      if (parsed && typeof parsed === 'object' && 'username' in parsed) {
        if ('kind' in parsed && parsed.kind === 'cookie') {
          const c = parsed as CookieStoredSession;
          if (c.username) {
            this.state.set({
              kind: 'cookie',
              username: c.username,
              isAdministrator: c.isAdministrator ?? false,
            });
          }
          return;
        }
        if ('kind' in parsed && parsed.kind === 'basic') {
          const b = parsed as BasicStoredSession;
          if (b.username && b.basic) {
            this.state.set({
              kind: 'basic',
              username: b.username,
              basic: b.basic,
              isAdministrator: b.isAdministrator ?? false,
            });
          }
          return;
        }
        const legacy = parsed as LegacyStoredSession;
        if (legacy.username && legacy.basic) {
          this.state.set({
            kind: 'basic',
            username: legacy.username,
            basic: legacy.basic,
            isAdministrator: legacy.isAdministrator ?? false,
          });
        }
      }
    } catch {
      this.clearStorage();
    }
  }

  private persist(session: StoredSession, remember: boolean): void {
    this.clearStorage();
    const payload = JSON.stringify(session);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, payload);
    } else {
      sessionStorage.setItem(STORAGE_KEY, payload);
    }
  }

  private clearStorage(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Run once per app load: validate stored session or detect Nuxeo SSO cookie via `/me`.
   */
  ensureHydrated(): Observable<void> {
    if (this.hydration$) return this.hydration$;
    this.hydration$ = defer(() => this.runHydration()).pipe(shareReplay(1));
    return this.hydration$;
  }

  private runHydration(): Observable<void> {
    const existing = this.state();
    if (existing) {
      return this.http
        .get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), { headers: { Accept: 'application/json' } })
        .pipe(
          tap((me) => {
            const user = readUsernameFromMe(me);
            if (!user) {
              this.logout();
              return;
            }
            if (existing.kind === 'basic') {
              this.state.set({
                kind: 'basic',
                username: user,
                basic: existing.basic,
                isAdministrator: readIsAdministratorFromMe(me),
              });
              const remember = localStorage.getItem(STORAGE_KEY) !== null;
              this.persist(this.state()!, remember);
            } else {
              const cookieSession: CookieStoredSession = {
                kind: 'cookie',
                username: user,
                isAdministrator: readIsAdministratorFromMe(me),
              };
              this.state.set(cookieSession);
              this.persistCookie(cookieSession);
            }
          }),
          map(() => undefined),
          catchError(() => {
            this.state.set(null);
            this.clearStorage();
            return this.tryEstablishCookieSessionOnly();
          }),
        );
    }
    return this.tryEstablishCookieSessionOnly();
  }

  private tryEstablishCookieSessionOnly(): Observable<void> {
    return this.http
      .get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), { headers: { Accept: 'application/json' } })
      .pipe(
        tap((me) => {
          const user = readUsernameFromMe(me);
          if (!user) return;
          const session: CookieStoredSession = {
            kind: 'cookie',
            username: user,
            isAdministrator: readIsAdministratorFromMe(me),
          };
          this.state.set(session);
          this.persistCookie(session);
        }),
        map(() => undefined),
        catchError(() => of(undefined)),
      );
  }

  private persistCookie(session: CookieStoredSession): void {
    this.clearStorage();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Start SAML / browser SSO: full window navigation to Nuxeo.
   */
  startSamlLogin(endpoint: NuxeoSamlLoginEndpoint): void {
    if (typeof window === 'undefined') return;
    const base = this.nuxeoBrowserOrigin();
    let path = endpoint.path.trim();
    if (!path.startsWith('/')) path = `/${path}`;
    const url = new URL(path, `${base}/`);
    if (this.ssoReturnQueryParam) {
      const path = this.ssoPostLoginPath.startsWith('/')
        ? this.ssoPostLoginPath
        : `/${this.ssoPostLoginPath}`;
      const returnTo = `${window.location.origin}${path}`;
      url.searchParams.set(this.ssoReturnQueryParam, returnTo);
    }
    window.location.assign(url.toString());
  }

  /**
   * Validates credentials against Nuxeo (`GET /nuxeo/api/v1/me`).
   */
  login(username: string, password: string, remember: boolean): Observable<void> {
    const trimmed = username.trim();
    const basic = btoa(`${trimmed}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${basic}`,
      Accept: 'application/json',
    });

    return this.http.get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), { headers }).pipe(
      tap((me) => {
        const session: BasicStoredSession = {
          kind: 'basic',
          username: trimmed,
          basic,
          isAdministrator: readIsAdministratorFromMe(me),
        };
        this.state.set(session);
        this.persist(session, remember);
        this.hydration$ = of(undefined).pipe(shareReplay(1));
      }),
      map(() => undefined),
      catchError((err) =>
        throwError(
          () =>
            new Error(
              err?.status === 401 || err?.status === 403
                ? 'Invalid username or password.'
                : 'Could not reach Nuxeo. Check the server, proxy, and URL.',
            ),
        ),
      ),
    );
  }

  /**
   * Clears local session. Cookie (SSO) sessions also navigate to Nuxeo logout so the HttpOnly cookie is cleared.
   */
  logout(): void {
    const session = this.state();
    const wasCookie = session?.kind === 'cookie';
    this.state.set(null);
    this.clearStorage();
    this.hydration$ = null;

    if (wasCookie && typeof window !== 'undefined') {
      window.location.assign(this.apiUrl('/nuxeo/logout'));
    }
  }

  /**
   * Refreshes `/me` so ` stays accurate (e.g. after restoring an older session).
   * No-op when not authenticated.
   */
  refreshCurrentUser(): Observable<void> {
    const session = this.state();
    if (!session) {
      return of(undefined);
    }
    return this.http
      .get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), { headers: { Accept: 'application/json' } })
      .pipe(
        tap((me) => {
          const user = readUsernameFromMe(me);
          if (!user) {
            this.logout();
            return;
          }
          if (session.kind === 'basic') {
            const next: BasicStoredSession = {
              kind: 'basic',
              username: user,
              basic: session.basic,
              isAdministrator: readIsAdministratorFromMe(me),
            };
            this.state.set(next);
            this.persistCurrent(next);
          } else {
            const next: CookieStoredSession = {
              kind: 'cookie',
              username: user,
              isAdministrator: readIsAdministratorFromMe(me),
            };
            this.state.set(next);
            this.persistCookie(next);
          }
        }),
        map(() => undefined),
      );
  }

  private persistCurrent(session: StoredSession): void {
    const remember = localStorage.getItem(STORAGE_KEY) !== null;
    this.persist(session, remember);
  }

  /** Value for `Authorization: Basic …` (without the prefix). */
  basicCredentials(): string | null {
    const s = this.state();
    return s?.kind === 'basic' ? s.basic : null;
  }
}
