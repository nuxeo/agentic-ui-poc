import { HttpClient, HttpContext, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { catchError, defer, map, of, shareReplay, switchMap, tap, throwError, } from 'rxjs';
import { AUTH_TOKEN_HEADER, readShareTokenFromBrowserUrl, stripShareTokenFromBrowserUrl, } from './share-token.util';
import { NUXEO_ESTABLISH_BROWSER_SESSION } from './nuxeo-auth.context';
import { BrowseContextService, ClipboardTargetService, NUXEO_API_ORIGIN, NUXEO_SAML_LOGIN_ENDPOINTS, NUXEO_SSO_POST_LOGIN_PATH, NUXEO_SSO_RETURN_QUERY_PARAM, SelectionService, isPowerUserFromGroups, readGroupsFromMe, } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
const STORAGE_KEY = 'agentic_ui_nuxeo_session';
const SIGNED_OUT_KEY = 'agentic_ui_signed_out';
/** Nuxeo may return boolean, string, or numeric 1 depending on marshaller/version. */
function isTruthyAdministratorFlag(value) {
    return value === true || value === 'true' || value === 1;
}
/** Reads admin flag from Nuxeo `GET /me` (shape varies slightly by version). */
function readIsAdministratorFromMe(me) {
    if (!me || typeof me !== 'object')
        return false;
    const o = me;
    if (isTruthyAdministratorFlag(o['isAdministrator']))
        return true;
    const props = o['properties'];
    if (props && typeof props === 'object') {
        const p = props['isAdministrator'];
        if (isTruthyAdministratorFlag(p))
            return true;
    }
    return false;
}
function readUsernameFromMe(me) {
    if (!me || typeof me !== 'object')
        return null;
    const id = me['id'];
    if (typeof id === 'string' && id.length > 0)
        return id;
    const props = me['properties'];
    if (props && typeof props === 'object') {
        const u = props['username'];
        if (typeof u === 'string' && u.length > 0)
            return u;
    }
    return null;
}
/** Default Nuxeo built-in admin user id — used if `/me` omits `isAdministrator`. */
function isBuiltInAdministratorUsername(username) {
    return username.trim().toLowerCase() === 'administrator';
}
function readSessionFlagsFromMe(me) {
    return {
        isAdministrator: readIsAdministratorFromMe(me),
        groups: readGroupsFromMe(me),
    };
}
/** A sign-in failure the login page shows to the user, by catalogue key. */
export class SignInError extends Error {
    messageKey;
    constructor(messageKey) {
        super(messageKey);
        this.messageKey = messageKey;
        this.name = 'SignInError';
    }
}
export class AuthService {
    http = inject(HttpClient);
    injector = inject(Injector);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    samlEndpoints = inject(NUXEO_SAML_LOGIN_ENDPOINTS);
    ssoPostLoginPath = inject(NUXEO_SSO_POST_LOGIN_PATH);
    ssoReturnQueryParam = inject(NUXEO_SSO_RETURN_QUERY_PARAM);
    state = signal(null, ...(ngDevMode ? [{ debugName: "state" }] : []));
    hydration$ = null;
    /** In-memory token for Instant Share / external permission links (Nuxeo TOKEN_AUTH). */
    shareAuthTokenValue = null;
    samlLoginOptions = computed(() => this.samlEndpoints, ...(ngDevMode ? [{ debugName: "samlLoginOptions" }] : []));
    username = computed(() => this.state()?.username ?? null, ...(ngDevMode ? [{ debugName: "username" }] : []));
    isAuthenticated = computed(() => this.state() !== null, ...(ngDevMode ? [{ debugName: "isAuthenticated" }] : []));
    /**
     * True when Nuxeo reports administrator on `/me`, or when using the built-in
     * `Administrator` account and the API omitted the flag (common with older sessions).
     */
    isAdministrator = computed(() => {
        const s = this.state();
        if (!s)
            return false;
        if (s.isAdministrator)
            return true;
        return isBuiltInAdministratorUsername(s.username);
    }, ...(ngDevMode ? [{ debugName: "isAdministrator" }] : []));
    isPowerUser = computed(() => {
        const s = this.state();
        if (!s)
            return false;
        return isPowerUserFromGroups(s.groups);
    }, ...(ngDevMode ? [{ debugName: "isPowerUser" }] : []));
    hasAdministrationAccess = computed(() => this.isAdministrator() || this.isPowerUser(), ...(ngDevMode ? [{ debugName: "hasAdministrationAccess" }] : []));
    constructor() {
        this.restoreSession();
        if (this.state()) {
            // Validation deferred to ensureHydrated() on first navigation
        }
    }
    apiUrl(path) {
        const base = this.apiOrigin.replace(/\/$/, '');
        return `${base}${path}`;
    }
    /**
     * Clears a stale Nuxeo browser session (JSESSIONID) before password login or hydration.
     * Same-origin `/nuxeo/**` requests always send cookies; an old cookie can override Basic auth.
     */
    clearStaleNuxeoCookieSession() {
        return this.http
            .get(this.apiUrl('/nuxeo/logout'), {
            withCredentials: true,
            responseType: 'text',
        })
            .pipe(map(() => undefined), catchError(() => of(undefined)));
    }
    applyBasicSessionFromMe(existing, me) {
        const flags = readSessionFlagsFromMe(me);
        this.state.set({
            kind: 'basic',
            username: existing.username,
            basic: existing.basic,
            isAdministrator: flags.isAdministrator,
            groups: flags.groups,
        });
        const remember = localStorage.getItem(STORAGE_KEY) !== null;
        this.persist(this.state(), remember);
    }
    fetchMe() {
        return this.http.get(this.apiUrl('/nuxeo/api/v1/me'), {
            headers: { Accept: 'application/json' },
        });
    }
    /**
     * After password login or hydration, establish a same-origin Nuxeo browser session
     * (JSESSIONID) so embedded note `<img src="/nuxeo/nxfile/...">` loads without headers.
     */
    establishBasicAuthBrowserSession() {
        if (this.state()?.kind !== 'basic') {
            return of(undefined);
        }
        return this.http
            .get(this.apiUrl('/nuxeo/api/v1/me'), {
            headers: { Accept: 'application/json' },
            withCredentials: true,
            context: new HttpContext().set(NUXEO_ESTABLISH_BROWSER_SESSION, true),
        })
            .pipe(map(() => undefined), catchError(() => of(undefined)));
    }
    isInvalidBasicAuthResponse(err) {
        return err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403);
    }
    isExplicitlySignedOut() {
        return sessionStorage.getItem(SIGNED_OUT_KEY) === '1';
    }
    markSignedOut() {
        sessionStorage.setItem(SIGNED_OUT_KEY, '1');
    }
    clearSignedOut() {
        sessionStorage.removeItem(SIGNED_OUT_KEY);
    }
    /** Public Nuxeo origin for full-page SAML redirects (matches API proxy in dev when origin is ''). */
    nuxeoBrowserOrigin() {
        const o = this.apiOrigin.replace(/\/$/, '');
        if (o)
            return o;
        if (typeof window !== 'undefined')
            return window.location.origin;
        return '';
    }
    restoreSession() {
        const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && 'username' in parsed) {
                if ('kind' in parsed && parsed.kind === 'cookie') {
                    const c = parsed;
                    if (c.username) {
                        this.state.set({
                            kind: 'cookie',
                            username: c.username,
                            isAdministrator: c.isAdministrator ?? false,
                            groups: c.groups ?? [],
                        });
                    }
                    return;
                }
                if ('kind' in parsed && parsed.kind === 'basic') {
                    const b = parsed;
                    if (b.username && b.basic) {
                        this.state.set({
                            kind: 'basic',
                            username: b.username,
                            basic: b.basic,
                            isAdministrator: b.isAdministrator ?? false,
                            groups: b.groups ?? [],
                        });
                    }
                    return;
                }
                const legacy = parsed;
                if (legacy.username && legacy.basic) {
                    this.state.set({
                        kind: 'basic',
                        username: legacy.username,
                        basic: legacy.basic,
                        isAdministrator: legacy.isAdministrator ?? false,
                        groups: legacy.groups ?? [],
                    });
                }
            }
        }
        catch {
            this.clearStorage();
        }
    }
    persist(session, remember) {
        this.clearStorage();
        const payload = JSON.stringify(session);
        if (remember) {
            localStorage.setItem(STORAGE_KEY, payload);
        }
        else {
            sessionStorage.setItem(STORAGE_KEY, payload);
        }
    }
    clearStorage() {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
    }
    /**
     * Run once per app load: validate stored session or detect Nuxeo SSO cookie via `/me`.
     */
    ensureHydrated() {
        if (this.hydration$)
            return this.hydration$;
        this.hydration$ = defer(() => this.runHydration()).pipe(shareReplay(1));
        return this.hydration$;
    }
    /** Token from an external share email link, used only during TOKEN_AUTH bootstrap. */
    shareAuthToken() {
        return this.shareAuthTokenValue;
    }
    runHydration() {
        const shareToken = readShareTokenFromBrowserUrl();
        if (shareToken) {
            stripShareTokenFromBrowserUrl();
            return this.authenticateWithShareToken(shareToken).pipe(switchMap(() => (this.isAuthenticated() ? of(undefined) : this.runHydration())));
        }
        if (this.isExplicitlySignedOut()) {
            this.state.set(null);
            this.clearStorage();
            return of(undefined);
        }
        const existing = this.state();
        if (existing) {
            if (existing.kind === 'basic') {
                return this.clearStaleNuxeoCookieSession().pipe(switchMap(() => this.fetchMe()), tap((me) => this.applyBasicSessionFromMe(existing, me)), switchMap(() => this.establishBasicAuthBrowserSession()), map(() => undefined), catchError((err) => {
                    if (this.isInvalidBasicAuthResponse(err)) {
                        this.logout();
                    }
                    return of(undefined);
                }));
            }
            return this.fetchMe().pipe(tap((me) => {
                const user = readUsernameFromMe(me);
                if (!user) {
                    this.state.set(null);
                    this.clearStorage();
                    return;
                }
                const flags = readSessionFlagsFromMe(me);
                const cookieSession = {
                    kind: 'cookie',
                    username: user,
                    isAdministrator: flags.isAdministrator,
                    groups: flags.groups,
                };
                this.state.set(cookieSession);
                this.persistCookie(cookieSession);
            }), map(() => undefined), catchError(() => {
                this.state.set(null);
                this.clearStorage();
                return this.tryEstablishCookieSessionOnly();
            }));
        }
        return this.tryEstablishCookieSessionOnly();
    }
    tryEstablishCookieSessionOnly() {
        return this.http
            .get(this.apiUrl('/nuxeo/api/v1/me'), { headers: { Accept: 'application/json' } })
            .pipe(tap((me) => {
            const user = readUsernameFromMe(me);
            if (!user)
                return;
            const flags = readSessionFlagsFromMe(me);
            const session = {
                kind: 'cookie',
                username: user,
                isAdministrator: flags.isAdministrator,
                groups: flags.groups,
            };
            this.state.set(session);
            this.persistCookie(session);
        }), map(() => undefined), catchError(() => of(undefined)));
    }
    persistCookie(session) {
        this.clearStorage();
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    /**
     * Start SAML / browser SSO: full window navigation to Nuxeo.
     */
    startSamlLogin(endpoint) {
        if (typeof window === 'undefined')
            return;
        this.clearSignedOut();
        const base = this.nuxeoBrowserOrigin();
        let path = endpoint.path.trim();
        if (!path.startsWith('/'))
            path = `/${path}`;
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
     * Authenticates a transient external user via the Instant Share token from an email link.
     * Sends the token in {@link AUTH_TOKEN_HEADER} only (not the URL) to avoid log/proxy leakage.
     */
    authenticateWithShareToken(token) {
        const trimmed = token.trim();
        if (!trimmed) {
            return of(undefined);
        }
        this.clearSignedOut();
        this.state.set(null);
        this.clearStorage();
        this.shareAuthTokenValue = trimmed;
        const headers = new HttpHeaders({
            Accept: 'application/json',
            [AUTH_TOKEN_HEADER]: trimmed,
        });
        return this.http
            .get(this.apiUrl('/nuxeo/api/v1/me'), {
            headers,
            withCredentials: true,
        })
            .pipe(tap((me) => {
            const user = readUsernameFromMe(me);
            if (!user) {
                this.clearShareAuth();
                return;
            }
            const flags = readSessionFlagsFromMe(me);
            const session = {
                kind: 'cookie',
                username: user,
                isAdministrator: flags.isAdministrator,
                groups: flags.groups,
            };
            this.state.set(session);
            this.persistCookie(session);
            this.clearShareAuth();
        }), map(() => undefined), catchError(() => {
            this.clearShareAuth();
            return of(undefined);
        }));
    }
    /**
     * Validates credentials against Nuxeo (`GET /nuxeo/api/v1/me`).
     */
    login(username, password, remember) {
        // Drop any prior session so Nuxeo requests use only the new credentials.
        this.clearShareAuth();
        this.state.set(null);
        this.clearStorage();
        this.hydration$ = null;
        const trimmed = username.trim();
        const basic = btoa(`${trimmed}:${password}`);
        const headers = new HttpHeaders({
            Authorization: `Basic ${basic}`,
            Accept: 'application/json',
        });
        return this.clearStaleNuxeoCookieSession().pipe(switchMap(() => this.http
            .get(this.apiUrl('/nuxeo/api/v1/me'), { headers, withCredentials: false })
            .pipe(tap((me) => {
            const flags = readSessionFlagsFromMe(me);
            const session = {
                kind: 'basic',
                username: trimmed,
                basic,
                isAdministrator: flags.isAdministrator,
                groups: flags.groups,
            };
            this.state.set(session);
            this.persist(session, remember);
            this.clearSignedOut();
            this.hydration$ = of(undefined).pipe(shareReplay(1));
        }), switchMap(() => this.establishBasicAuthBrowserSession()), map(() => undefined), catchError((err) => throwError(() => new SignInError(err?.status === 401 || err?.status === 403
            ? 'login.message.invalid-credentials'
            : 'login.message.server-unreachable'))))));
    }
    /**
     * Clears local session state and marks the browser session as explicitly signed out.
     */
    logout() {
        this.clearUserScopedUiState();
        this.clearShareAuth();
        this.state.set(null);
        this.clearStorage();
        this.markSignedOut();
        this.hydration$ = null;
    }
    clearShareAuth() {
        this.shareAuthTokenValue = null;
    }
    clearUserScopedUiState() {
        // Resolve lazily — eager inject() here would create a DI cycle via CURRENT_USERNAME.
        this.injector.get(SelectionService).resetUiState();
        this.injector.get(BrowseContextService).resetContext();
        this.injector.get(ClipboardTargetService).clear();
    }
    /**
     * Refreshes `/me` so `isAdministrator` stays accurate (e.g. after restoring an older session).
     * No-op when not authenticated.
     */
    refreshCurrentUser() {
        const session = this.state();
        if (!session) {
            return of(undefined);
        }
        if (session.kind === 'basic') {
            return this.clearStaleNuxeoCookieSession().pipe(switchMap(() => this.fetchMe()), tap((me) => this.applyBasicSessionFromMe(session, me)), map(() => undefined), catchError((err) => {
                if (this.isInvalidBasicAuthResponse(err)) {
                    this.logout();
                }
                return of(undefined);
            }));
        }
        return this.fetchMe().pipe(tap((me) => {
            const user = readUsernameFromMe(me);
            if (!user) {
                this.logout();
                return;
            }
            const flags = readSessionFlagsFromMe(me);
            const next = {
                kind: 'cookie',
                username: user,
                isAdministrator: flags.isAdministrator,
                groups: flags.groups,
            };
            this.state.set(next);
            this.persistCookie(next);
        }), map(() => undefined));
    }
    /** Value for `Authorization: Basic …` (without the prefix). */
    basicCredentials() {
        const s = this.state();
        return s?.kind === 'basic' ? s.basic : null;
    }
    static ɵfac = function AuthService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
