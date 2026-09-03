import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  NUXEO_API_ORIGIN,
  SelectionService,
  BrowseContextService,
  ClipboardTargetService,
} from '@agentic-ui/shared/nuxeo-client';
import { AuthService } from './auth.service';
import { nuxeoAuthInterceptor } from './nuxeo-auth.interceptor';
import { AUTH_TOKEN_HEADER } from './share-token.util';

const TRANSIENT_ME = {
  id: 'transient/guest@example.com',
  properties: { username: 'transient/guest@example.com', groups: [] },
  isAdministrator: false,
};

const ADMINISTRATOR_ME = {
  id: 'Administrator',
  properties: { username: 'Administrator', groups: ['administrators'] },
  isAdministrator: true,
};

/** Deployments that expose the anonymous user answer `/me` with this instead of a 401. */
const ANONYMOUS_ME = {
  id: 'Guest',
  properties: { username: 'Guest', groups: [] },
  isAdministrator: false,
  isAnonymous: true,
};

/**
 * Answers the credential-free probe the share flow makes after logout to confirm no
 * browser session survived. A 401 means the cookie is gone and the token can be trusted.
 */
function flushNoResidualCookieSession(mock: HttpTestingController): void {
  const probe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
  expect(probe.request.headers.has(AUTH_TOKEN_HEADER)).toBeFalse();
  probe.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
}

/**
 * Answers the pair of calls that turn the token into a browser session: the
 * token-carrying request that creates the cookie, then the token-free request that
 * proves the cookie is actually there.
 */
function flushShareSessionHandshake(mock: HttpTestingController, confirmMe: object): void {
  mock
    .expectOne(
      (r) =>
        r.url.includes('/nuxeo/api/v1/me') && r.withCredentials && r.headers.has(AUTH_TOKEN_HEADER),
    )
    .flush(TRANSIENT_ME);
  const confirm = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials);
  expect(confirm.request.headers.has(AUTH_TOKEN_HEADER)).toBeFalse();
  confirm.flush(confirmMe);
}

describe('AuthService poweruser access', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('sets isPowerUser and hasAdministrationAccess after login', () => {
    service.login('poweruser01', 'secret', false).subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush({
        id: 'poweruser01',
        properties: {
          username: 'poweruser01',
          groups: ['members', 'powerusers'],
        },
        isAdministrator: false,
      });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({ id: 'poweruser01' });

    expect(service.isPowerUser()).toBe(true);
    expect(service.isAdministrator()).toBe(false);
    expect(service.hasAdministrationAccess()).toBe(true);
  });

  it('does not grant administration access to regular members', () => {
    service.login('member01', 'secret', false).subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.withCredentials).toBeFalse();
    req.flush({
      id: 'member01',
      properties: {
        username: 'member01',
        groups: ['members'],
      },
      isAdministrator: false,
    });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({ id: 'member01' });

    expect(service.isPowerUser()).toBe(false);
    expect(service.hasAdministrationAccess()).toBe(false);
  });

  it('restores poweruser groups from persisted session', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'basic',
        username: 'poweruser01',
        basic: btoa('poweruser01:secret'),
        isAdministrator: false,
        groups: ['members', 'powerusers'],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const restored = TestBed.inject(AuthService);
    expect(restored.isPowerUser()).toBe(true);
    expect(restored.hasAdministrationAccess()).toBe(true);
  });

  it('preserves basic-auth username on hydration when /me matches stored user', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'basic',
        username: 'test-user',
        basic: btoa('test-user:test-pass'),
        isAdministrator: true,
        groups: ['administrators'],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const hydrated = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    hydrated.ensureHydrated().subscribe();
    mock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush({
        id: 'test-user',
        properties: {
          username: 'test-user',
          email: 'test.user@gmail.com',
          groups: ['administrators'],
        },
        isAdministrator: true,
      });
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({ id: 'test-user' });

    expect(hydrated.username()).toBe('test-user');
    mock.verify();
  });

  it('clears basic-auth session when /me returns 403 during hydration', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'basic',
        username: 'test-user',
        basic: btoa('test-user:test-pass'),
        isAdministrator: false,
        groups: ['members'],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const hydrated = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    hydrated.ensureHydrated().subscribe();
    mock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(hydrated.isAuthenticated()).toBe(false);
    mock.verify();
  });

  it('preserves basic-auth username on hydration when /me principal differs from stale cookie', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'basic',
        username: 'test-user',
        basic: btoa('test-user:test-pass'),
        isAdministrator: true,
        groups: ['administrators'],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const hydrated = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    hydrated.ensureHydrated().subscribe();
    mock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush({
        id: 'test.user@gmail.com',
        properties: { username: 'test.user@gmail.com', groups: ['members'] },
        isAdministrator: false,
      });
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({ id: 'test-user' });

    expect(hydrated.isAuthenticated()).toBe(true);
    expect(hydrated.username()).toBe('test-user');
    mock.verify();
  });

  it('logout clears browse selection and navigation context', () => {
    const selection = TestBed.inject(SelectionService);
    const browseContext = TestBed.inject(BrowseContextService);
    const clipboardTarget = TestBed.inject(ClipboardTargetService);

    selection.toggle('doc-1', 'Doc 1');
    selection.setClearOnlyMode(true);
    browseContext.setFromNuxeoPath('/default-domain/workspaces/demo');
    clipboardTarget.setTarget({
      uid: 'folder-1',
      title: 'Demo',
      type: 'Folder',
      path: '/default-domain/workspaces/demo',
      lastModified: '',
      properties: {},
    });

    service.login('member01', 'secret', false).subscribe();
    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush({
        id: 'member01',
        properties: { username: 'member01', groups: ['members'] },
        isAdministrator: false,
      });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({ id: 'member01' });

    service.logout();

    expect(selection.selectedCount()).toBe(0);
    expect(selection.clearOnlyMode()).toBe(false);
    expect(browseContext.contextPath()).toBe('/');
    expect(clipboardTarget.target()).toBeNull();
  });

  it('authenticates external share links via token', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.url).not.toContain('token=');
    expect(req.request.headers.get('X-Authentication-Token')).toBe('share-token-abc');
    expect(req.request.withCredentials).toBeFalse();
    req.flush(TRANSIENT_ME);
    flushShareSessionHandshake(httpMock, TRANSIENT_ME);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('transient/guest@example.com');
    expect(service.shareAuthToken()).toBeNull();
  });

  it('clears user-scoped UI state before external share token auth', () => {
    const selection = TestBed.inject(SelectionService);
    const browseContext = TestBed.inject(BrowseContextService);
    selection.toggle('doc-1', 'Doc 1');
    browseContext.setSharedDocument({ uid: 'old-share', title: 'Old Share' });

    service.authenticateWithShareToken('share-token-abc').subscribe();

    expect(selection.selectedCount()).toBe(0);
    expect(browseContext.sharedDocument()).toBeNull();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionHandshake(httpMock, TRANSIENT_ME);
  });

  it('clears an existing browser session before external share token auth', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'cookie',
        username: 'Administrator',
        isAdministrator: true,
        groups: ['administrators'],
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const restored = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    restored.authenticateWithShareToken('share-token-abc').subscribe();

    mock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(mock);
    const tokenMe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    expect(tokenMe.request.headers.get('X-Authentication-Token')).toBe('share-token-abc');
    tokenMe.flush(TRANSIENT_ME);
    flushShareSessionHandshake(mock, TRANSIENT_ME);

    expect(restored.username()).toBe('transient/guest@example.com');
    expect(restored.isAdministrator()).toBeFalse();
    mock.verify();
  });

  it('aborts share-token auth when a browser session survives the logout', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // Logout did not clear the JSESSIONID, so it would out-rank the share token.
    httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me')).flush(ADMINISTRATOR_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('accepts a share link that resolves to the same principal as the previous session', () => {
    sessionStorage.setItem(
      'agentic_ui_nuxeo_session',
      JSON.stringify({
        kind: 'cookie',
        username: 'transient/guest@example.com',
        isAdministrator: false,
        groups: [],
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NUXEO_API_ORIGIN, useValue: '' }],
    });
    const restored = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    // A second share link mailed to the same external address is still valid.
    restored.authenticateWithShareToken('share-token-def').subscribe();

    mock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(mock);
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionHandshake(mock, TRANSIENT_ME);

    expect(restored.isAuthenticated()).toBeTrue();
    expect(restored.username()).toBe('transient/guest@example.com');
    mock.verify();
  });

  it('aborts when the established browser session belongs to another principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    // A cookie answered the session-establishing call instead of the token.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush(ADMINISTRATOR_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
  });

  it('treats an anonymous residual response as no surviving session', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // Rejecting the link here would break external shares on every deployment that
    // answers 200 with the anonymous principal rather than 401.
    httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me')).flush(ANONYMOUS_ME);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionHandshake(httpMock, TRANSIENT_ME);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('transient/guest@example.com');
    httpMock.verify();
  });

  it('aborts share-token auth when the residual probe is forbidden rather than rejected', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // A 403 can come from a session that survived but is barred from this endpoint, so
    // it is no proof the cookie is gone.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('aborts share-token auth when the residual-cookie probe is inconclusive', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // A server error says nothing about whether a JSESSIONID survived. Treating it as
    // "no cookie" would send the token alongside a session that outranks it.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush('Error', { status: 503, statusText: 'Service Unavailable' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('aborts when no browser session was created for the share principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.headers.has(AUTH_TOKEN_HEADER))
      .flush(TRANSIENT_ME);
    // Nuxeo honoured the header without issuing a cookie. Persisting an authenticated
    // state here would leave every later request anonymous once the token is dropped.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
  });

  it('aborts when the confirmed browser session belongs to another principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    // A cookie raced in between the probe and the confirmation.
    flushShareSessionHandshake(httpMock, ADMINISTRATOR_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
  });

  it('clears share token when token authentication fails', () => {
    service.authenticateWithShareToken('bad-token').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    flushNoResidualCookieSession(httpMock);
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.url).not.toContain('token=');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
  });

  it('aborts share-token auth when stale session logout fails', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/logout'))
      .flush('Error', { status: 500, statusText: 'Error' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('does not attach share token to stale-session logout via interceptor', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([nuxeoAuthInterceptor])),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });
    const authWithInterceptor = TestBed.inject(AuthService);
    const mock = TestBed.inject(HttpTestingController);

    authWithInterceptor.authenticateWithShareToken('share-token-abc').subscribe();

    const logoutReq = mock.expectOne((r) => r.url.includes('/nuxeo/logout'));
    expect(logoutReq.request.headers.has(AUTH_TOKEN_HEADER)).toBeFalse();
    logoutReq.flush('');

    // The residual-cookie probe must stay credential-free, or it would prove nothing.
    flushNoResidualCookieSession(mock);

    const tokenMe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    expect(tokenMe.request.headers.get(AUTH_TOKEN_HEADER)).toBe('share-token-abc');
    tokenMe.flush(TRANSIENT_ME);
    // The token is dropped once the cookie exists, so the interceptor must leave the
    // confirmation request bare — that is the only reason it proves anything.
    flushShareSessionHandshake(mock, TRANSIENT_ME);

    mock.verify();
  });

  it('ensureHydrated does not rehydrate stale cookie when share-token logout fails', () => {
    window.history.pushState({}, '', '/?token=share-token-abc');

    service.ensureHydrated().subscribe();

    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/logout'))
      .flush('Error', { status: 500, statusText: 'Error' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));

    window.history.pushState({}, '', '/');
  });
});
