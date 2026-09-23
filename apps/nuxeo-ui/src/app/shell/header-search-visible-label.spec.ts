import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { appConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';
import { AppShellComponent } from './app-shell.component';

/** Stable id shared by the shell template and this spec's assertions. */
export const GLOBAL_HEADER_SEARCH_INPUT_ID = 'global-header-search-input';

describe('AppShellComponent — header global search visible label (NXENG-798)', () => {
  let http: HttpTestingController;

  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    hasAdministrationAccess: signal(true),
    isAdministrator: signal(true),
    basicCredentials: () => null,
    shareAuthToken: () => null,
    logout: () => undefined,
  } as unknown as AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    const emptyDocumentList = {
      entries: [],
      totalSize: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 0,
    };
    http.match(() => true).forEach((request) => request.flush(emptyDocumentList));
    http.verify();
  });

  /**
   * IBM Equal Access `input_label_visible` (Issue ID 1637375356) and WCAG 2.5.3 Label in Name:
   * placeholder text must not be the only visible label on the header global search field.
   */
  it('associates a visible label with the header search input instead of placeholder-only naming', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      `#${GLOBAL_HEADER_SEARCH_INPUT_ID}`,
    ) as HTMLInputElement | null;
    expect(input).withContext('header search input must render').toBeTruthy();

    const label = fixture.nativeElement.querySelector(
      `label[for="${GLOBAL_HEADER_SEARCH_INPUT_ID}"].header-search-label`,
    ) as HTMLLabelElement | null;
    expect(label).withContext('header search must expose a visible <label>').toBeTruthy();

    expect(label?.textContent?.trim())
      .withContext('visible label must render non-empty text')
      .toBeTruthy();

    const placeholder = (input?.getAttribute('placeholder') ?? '').trim();
    expect(placeholder)
      .withContext('placeholder must not substitute for the visible label')
      .not.toBe(label?.textContent?.trim());

    expect(Array.from(input?.labels ?? []))
      .withContext('the input must be named by the visible label')
      .toContain(label as HTMLLabelElement);
  });
});
