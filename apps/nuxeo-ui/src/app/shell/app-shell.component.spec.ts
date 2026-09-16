import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppShellComponent } from './app-shell.component';
import { appConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';

describe('AppShellComponent', () => {
  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    // Signals, not plain functions: the extension rules and the nav registry read these
    // reactively, and a bare function throws inside their computed.
    isAdministrator: signal(true),
    isPowerUser: signal(false),
    hasAdministrationAccess: signal(true),
    basicCredentials: () => 'dGVzdA==',
    logout: () => undefined,
  } as unknown as AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: appConfig.providers,
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();
  });

  /**
   * NXENG-762, and its duplicates NXENG-759 / NXENG-767. The header brand graphic is
   * `<sat-word-mark-logo>` from `@hylandsoftware/satori-ui/logo`, whose template is a bare
   * `<svg>` with no `<title>`. An `<svg>` with no accessible name is announced as an unnamed
   * image — WCAG 2.1 1.1.1 Non-text Content, level A — and nothing in this repository can put
   * an attribute on that `<svg>`, because the markup belongs to the dependency.
   *
   * Two things have to hold together, so both are asserted: the graphic carries a name, and
   * the vendor `<svg>` is hidden rather than left exposed underneath it. Measured on the live
   * page with `accessibility-checker-engine` and Chrome's accessibility tree: an `aria-label`
   * on the mark's own host left the violation in place; `role="img"` there silenced the rule
   * but Chrome still exposed the unnamed `<svg>` as a child of the named node.
   *
   * The name is looked up from the `<svg>` outwards rather than from a known wrapper, so the
   * test cannot pass by finding a named element that happens to sit elsewhere in the header —
   * and it still holds if the vendor adds a second mark to the lockup.
   */
  it('exposes the header brand graphic as a named image with nothing unnamed inside it', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const header = (fixture.nativeElement as HTMLElement).querySelector('sat-app-header');
    expect(header).toBeTruthy();

    const graphics = Array.from(header!.querySelectorAll('svg'));
    expect(graphics.length).toBeGreaterThan(0);

    for (const svg of graphics) {
      expect(svg.closest('[aria-hidden="true"]')).toBeTruthy();
      const named = svg.closest('[role="img"][aria-label]');
      expect(named).toBeTruthy();
      expect(named!.getAttribute('aria-label')).toBe('Hyland');
    }
  });
});
