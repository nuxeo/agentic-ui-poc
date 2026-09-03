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
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    expect(req.request.url).not.toContain('token=');
    expect(req.request.headers.get('X-Authentication-Token')).toBe('share-token-abc');
    expect(req.request.withCredentials).toBeFalse();
    req.flush({
      id: 'transient/guest@example.com',
      properties: { username: 'transient/guest@example.com', groups: [] },
      isAdministrator: false,
    });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({
        id: 'transient/guest@example.com',
        properties: { username: 'transient/guest@example.com', groups: [] },
        isAdministrator: false,
      });

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
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    req.flush({
      id: 'transient/guest@example.com',
      properties: { username: 'transient/guest@example.com', groups: [] },
      isAdministrator: false,
    });
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({
        id: 'transient/guest@example.com',
        properties: { username: 'transient/guest@example.com', groups: [] },
        isAdministrator: false,
      });
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
    tokenMe.flush({
      id: 'transient/guest@example.com',
      properties: { username: 'transient/guest@example.com', groups: [] },
      isAdministrator: false,
    });
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({
        id: 'transient/guest@example.com',
        properties: { username: 'transient/guest@example.com', groups: [] },
        isAdministrator: false,
      });

    expect(restored.username()).toBe('transient/guest@example.com');
    expect(restored.isAdministrator()).toBeFalse();
    mock.verify();
  });

  it('aborts share-token auth when the superseded cookie principal answers the token probe', () => {
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
    // Same-origin XHR still sent the surviving JSESSIONID, so Nuxeo answered as the old user.
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me'))
      .flush({
        id: 'Administrator',
        properties: { username: 'Administrator', groups: ['administrators'] },
        isAdministrator: true,
      });

    expect(restored.isAuthenticated()).toBeFalse();
    expect(restored.username()).toBeNull();
    expect(restored.shareAuthToken()).toBeNull();
    expect(sessionStorage.getItem('agentic_ui_signed_out')).toBe('1');
    mock.verify();
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

    const tokenMe = mock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && !r.withCredentials);
    expect(tokenMe.request.headers.get(AUTH_TOKEN_HEADER)).toBe('share-token-abc');
    tokenMe.flush({
      id: 'transient/guest@example.com',
      properties: { username: 'transient/guest@example.com', groups: [] },
      isAdministrator: false,
    });
    mock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/me') && r.withCredentials)
      .flush({
        id: 'transient/guest@example.com',
        properties: { username: 'transient/guest@example.com', groups: [] },
        isAdministrator: false,
      });

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
