import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';
import { AuthService } from './auth.service';

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

    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    req.flush({
      id: 'poweruser01',
      properties: {
        username: 'poweruser01',
        groups: ['members', 'powerusers'],
      },
      isAdministrator: false,
    });

    expect(service.isPowerUser()).toBe(true);
    expect(service.isAdministrator()).toBe(false);
    expect(service.hasAdministrationAccess()).toBe(true);
  });

  it('does not grant administration access to regular members', () => {
    service.login('member01', 'secret', false).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/me'));
    req.flush({
      id: 'member01',
      properties: {
        username: 'member01',
        groups: ['members'],
      },
      isAdministrator: false,
    });

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
});
