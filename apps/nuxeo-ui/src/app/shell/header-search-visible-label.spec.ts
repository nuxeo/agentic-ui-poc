import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';

import { appConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';
import { AppShellComponent } from './app-shell.component';

/** Stable id shared by the shell template and this spec's assertions. */
export const GLOBAL_HEADER_SEARCH_INPUT_ID = 'global-header-search-input';

const SEARCH_LABEL_KEY = 'shell.search.placeholder';
/** Distinct marker so the spec proves the catalogue resolved, not a raw key string. */
const SEARCH_LABEL_MARKER = '⟪NXENG-798-visible-search-label⟫';

const authMock = {
  isAuthenticated: signal(true),
  username: signal('test.user'),
  hasAdministrationAccess: signal(true),
  isAdministrator: signal(true),
  basicCredentials: () => null,
  shareAuthToken: () => null,
  logout: () => undefined,
} as unknown as AuthService;

describe('AppShellComponent — header global search visible label (NXENG-798)', () => {
  let http: HttpTestingController;
  /** fakeAsync does not advance CSS transitions; suppress so caption geometry is instant. */
  let transitionSuppress: HTMLStyleElement;

  beforeEach(async () => {
    transitionSuppress = document.createElement('style');
    transitionSuppress.textContent =
      '.header-search-label { transition: none !important; }';
    document.head.appendChild(transitionSuppress);

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [...appConfig.providers, provideHttpClientTesting()],
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    transitionSuppress?.remove();

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
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { [SEARCH_LABEL_KEY]: SEARCH_LABEL_MARKER }, true);
    translate.use('en');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      `#${GLOBAL_HEADER_SEARCH_INPUT_ID}`,
    ) as HTMLInputElement | null;
    expect(input).withContext('header search input must render').toBeTruthy();

    const label = fixture.nativeElement.querySelector(
      `label[for="${GLOBAL_HEADER_SEARCH_INPUT_ID}"].header-search-label`,
    ) as HTMLLabelElement | null;
    expect(label).withContext('header search must expose a visible <label>').toBeTruthy();

    const labelText = label!.textContent!.trim();
    expect(labelText)
      .withContext('visible label must render the seeded catalogue string')
      .toBe(SEARCH_LABEL_MARKER);

    const placeholder = (input!.getAttribute('placeholder') ?? '').trim();
    expect(placeholder)
      .withContext('placeholder must not substitute for the visible label')
      .not.toBe(labelText);
    expect(placeholder)
      .withContext('placeholder must be empty so the label is the visible name')
      .toBe('');

    const associatedLabels = Array.from((input as HTMLInputElement).labels ?? []);
    expect(associatedLabels)
      .withContext('the input must be named by the visible label')
      .toContain(label as HTMLLabelElement);

    const labelStyle = getComputedStyle(label!);
    expect(labelStyle.display)
      .withContext('label must not be display:none')
      .not.toBe('none');
    expect(labelStyle.visibility)
      .withContext('label must not be visibility:hidden')
      .not.toBe('hidden');
    expect(Number.parseFloat(labelStyle.opacity))
      .withContext('label must be painted while the field is empty')
      .toBeGreaterThan(0);

    const { width, height } = label!.getBoundingClientRect();
    expect(width)
      .withContext('label must occupy horizontal space in the layout')
      .toBeGreaterThan(0);
    expect(height)
      .withContext('label must occupy vertical space in the layout')
      .toBeGreaterThan(0);
  });

  it('keeps a shrunken visible label while a query is entered and restores the empty state when cleared', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { [SEARCH_LABEL_KEY]: SEARCH_LABEL_MARKER }, true);
    translate.use('en');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      `#${GLOBAL_HEADER_SEARCH_INPUT_ID}`,
    ) as HTMLInputElement;
    const wrap = fixture.nativeElement.querySelector('.header-search-input-wrap') as HTMLElement;

    const emptyLabel = fixture.nativeElement.querySelector(
      `label[for="${GLOBAL_HEADER_SEARCH_INPUT_ID}"].header-search-label`,
    ) as HTMLLabelElement;
    expect(Number.parseFloat(getComputedStyle(emptyLabel).fontSize))
      .withContext('empty-state label uses the overlay size from app-shell.component.scss')
      .toBe(14);

    fixture.componentInstance.onGlobalSearchInput('reports');
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.globalSearchTerm())
      .withContext('filled-state styling is driven from globalSearchTerm')
      .toBe('reports');
    expect(wrap.classList.contains('header-search-filled'))
      .withContext('filled state must drive persistent-label styling')
      .toBe(true);

    expect(input.value)
      .withContext('typed query must remain visible in the field')
      .toBe('reports');

    const filledLabel = fixture.nativeElement.querySelector(
      `label[for="${GLOBAL_HEADER_SEARCH_INPUT_ID}"].header-search-label`,
    ) as HTMLLabelElement;
    expect(filledLabel.classList.contains('header-search-label--caption'))
      .withContext('filled state must apply the caption label class')
      .toBe(true);
    expect(filledLabel.textContent!.trim())
      .withContext('caption must keep the catalogue string visible while a query is entered')
      .toBe(SEARCH_LABEL_MARKER);

    const filledLabelStyle = getComputedStyle(filledLabel);
    expect(Number.parseFloat(filledLabelStyle.opacity))
      .withContext('label must stay painted while a query is entered')
      .toBeGreaterThan(0);
    expect(Number.parseFloat(filledLabelStyle.fontSize))
      .withContext(
        'caption must shrink the live AppShell label (styles.scss single declaration)',
      )
      .toBe(11);
    expect(filledLabelStyle.transform)
      .withContext('caption must drop the centered overlay translate on the live shell label')
      .toBe('none');

    fixture.componentInstance.onGlobalSearchInput('');
    fixture.detectChanges();
    tick();

    expect(input.value).toBe('');
    expect(wrap.classList.contains('header-search-filled'))
      .withContext('cleared field must leave the empty-state styling')
      .toBe(false);
  }));
});
