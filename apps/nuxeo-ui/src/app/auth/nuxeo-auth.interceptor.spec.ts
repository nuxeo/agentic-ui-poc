import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { nuxeoAuthInterceptor } from './nuxeo-auth.interceptor';
import { SessionTimeoutService } from './session-timeout.service';
import { AUTH_TOKEN_HEADER } from './share-token.util';

describe('nuxeoAuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  let sessionTimeout: jasmine.SpyObj<SessionTimeoutService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'basicCredentials',
      'shareAuthToken',
    ]);
    auth.isAuthenticated.and.returnValue(true);
    auth.basicCredentials.and.returnValue(null);
    auth.shareAuthToken.and.returnValue(null);

    sessionTimeout = jasmine.createSpyObj<SessionTimeoutService>('SessionTimeoutService', [
      'recordActivity',
      'expireDueToServer',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([nuxeoAuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: SessionTimeoutService, useValue: sessionTimeout },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('records activity on successful Nuxeo responses', () => {
    http.get('/nuxeo/api/v1/me').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/me');
    req.flush({ id: 'user01' });
    expect(sessionTimeout.recordActivity).toHaveBeenCalled();
  });

  it('expires the session on HTTP 401 while authenticated', () => {
    http.get('/nuxeo/api/v1/id/doc-1').subscribe({ error: () => undefined });
    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(sessionTimeout.expireDueToServer).toHaveBeenCalled();
  });

  it('does not expire the session on HTTP 403', () => {
    http.get('/nuxeo/api/v1/id/doc-1').subscribe({ error: () => undefined });
    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    expect(sessionTimeout.expireDueToServer).not.toHaveBeenCalled();
  });

  it('does not expire the session on HTTP 401 before authentication', () => {
    auth.isAuthenticated.and.returnValue(false);
    http.get('/nuxeo/api/v1/me').subscribe({ error: () => undefined });
    const req = httpMock.expectOne('/nuxeo/api/v1/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(sessionTimeout.expireDueToServer).not.toHaveBeenCalled();
  });

  it('sets withCredentials false for basic-auth API requests', () => {
    auth.basicCredentials.and.returnValue(btoa('test-user:test-pass'));
    http.get('/nuxeo/api/v1/me').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/me');
    expect(req.request.withCredentials).toBe(false);
    req.flush({ id: 'test-user' });
  });

  it('sends browser credentials for basic-auth logout to clear stale cookies', () => {
    auth.basicCredentials.and.returnValue(btoa('test-user:test-pass'));
    http.get('/nuxeo/logout', { withCredentials: true }).subscribe();
    const req = httpMock.expectOne('/nuxeo/logout');
    expect(req.request.withCredentials).toBe(true);
    req.flush('');
  });

  it('sends browser credentials for cookie-based sessions', () => {
    http.get('/nuxeo/api/v1/me').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/me');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'sso-user' });
  });

  it('ignores non-Nuxeo requests', () => {
    http.get('/assets/config.json').subscribe();
    const req = httpMock.expectOne('/assets/config.json');
    req.flush({});
    expect(sessionTimeout.recordActivity).not.toHaveBeenCalled();
  });

  it('sends X-Authentication-Token for external share sessions', () => {
    auth.isAuthenticated.and.returnValue(false);
    auth.shareAuthToken.and.returnValue('share-token-abc');
    http.get('/nuxeo/api/v1/id/doc-1').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1');
    expect(req.request.headers.get(AUTH_TOKEN_HEADER)).toBe('share-token-abc');
    req.flush({ uid: 'doc-1' });
  });

  it('does not send share token header after authentication is established', () => {
    auth.isAuthenticated.and.returnValue(true);
    auth.shareAuthToken.and.returnValue('share-token-abc');
    http.get('/nuxeo/api/v1/id/doc-1').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1');
    expect(req.request.headers.has(AUTH_TOKEN_HEADER)).toBeFalse();
    req.flush({ uid: 'doc-1' });
  });
});
