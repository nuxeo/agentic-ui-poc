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

/** Answers the token-carrying request that turns the share token into a browser session. */
function flushShareSessionEstablish(mock: HttpTestingController): void {
  mock
    .expectOne(
      (r) =>
        r.url.includes('/nuxeo/api/v1/me') && r.withCredentials && r.headers.has(AUTH_TOKEN_HEADER),
    )
    .flush(TRANSIENT_ME);
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
    // The first call after the logout must be the token itself. A credential-free probe
    // placed here would fail this assertion — see bug pattern 16.
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.url).not.toContain('token=');
    expect(req.request.headers.get('X-Authentication-Token')).toBe('share-token-abc');
    expect(req.request.withCredentials).toBeFalse();
    req.flush(TRANSIENT_ME);
    flushShareSessionEstablish(httpMock);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('transient/guest@example.com');
    expect(service.shareAuthToken()).toBeNull();
  });

  it('persists the share session without a further confirmation round-trip', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionEstablish(httpMock);

    // Nuxeo can honour the token header without issuing a JSESSIONID, so a cookie-only
    // re-check cannot tell that apart from a hijacked session and rejects working links.
    // The transient/<email> assertion is the guard instead — see bug pattern 16.
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('transient/guest@example.com');
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
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionEstablish(httpMock);
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
    const tokenMe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    expect(tokenMe.request.headers.get('X-Authentication-Token')).toBe('share-token-abc');
    tokenMe.flush(TRANSIENT_ME);
    flushShareSessionEstablish(mock);

    expect(restored.username()).toBe('transient/guest@example.com');
    expect(restored.isAdministrator()).toBeFalse();
    mock.verify();
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
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionEstablish(mock);

    expect(restored.isAuthenticated()).toBeTrue();
    expect(restored.username()).toBe('transient/guest@example.com');
    mock.verify();
  });

  it('aborts when the share token resolves to a non-transient principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // A surviving JSESSIONID answered instead of the token. A share link only ever resolves
    // to transient/<email>, so adopting this would hand the link a privileged session.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(ADMINISTRATOR_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('aborts when the share token resolves to the anonymous principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    // Deployments that expose the anonymous user answer 200 with a placeholder principal
    // rather than 401. Its id is not somebody the link may sign in as.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(ANONYMOUS_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));
  });

  it('clears share token when token authentication fails', () => {
    service.authenticateWithShareToken('bad-token').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.url).not.toContain('token=');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
  });

  it('aborts when the session-establishing call is answered by another principal', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    // This call adds cookies where the one above sent none, so a surviving privileged
    // session can answer it. Persisting the transient identity would leave the UI and the
    // server session disagreeing about who is signed in.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush(ADMINISTRATOR_ME);

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.username()).toBeNull();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
  });

  it('clears share token when the session-establishing request fails', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
  });

  it('completes share-token auth even when the stale-session logout fails', () => {
    service.authenticateWithShareToken('share-token-abc').subscribe();

    // The logout is best-effort. Failing the handoff on it strands every external link
    // behind a Nuxeo that will not answer this endpoint over XHR.
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/logout'))
      .flush('Error', { status: 500, statusText: 'Error' });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush(TRANSIENT_ME);
    flushShareSessionEstablish(httpMock);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.username()).toBe('transient/guest@example.com');
    expect(service.shareAuthToken()).toBeNull();
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

    const tokenMe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    expect(tokenMe.request.headers.get(AUTH_TOKEN_HEADER)).toBe('share-token-abc');
    tokenMe.flush(TRANSIENT_ME);
    flushShareSessionEstablish(mock);

    mock.verify();
  });

  it('ensureHydrated does not rehydrate a stale cookie when the share token is rejected', () => {
    window.history.pushState({}, '', '/?token=share-token-abc');

    service.ensureHydrated().subscribe();

    httpMock.expectOne((r) => r.url.includes('/nuxeo/logout')).flush('');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials)
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Falling through to the cookie session here would sign the recipient in as whoever
    // this browser already holds, which is what hides the transient access-denied UX.
    expect(service.isAuthenticated()).toBeFalse();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/me'));

    window.history.pushState({}, '', '/');
  });
});
