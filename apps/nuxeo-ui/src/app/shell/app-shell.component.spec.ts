import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { appConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';
import { AppShellComponent } from './app-shell.component';

/**
 * NXENG-759 — the Hyland word mark in the app header must be announced by name.
 *
 * `sat-word-mark-logo` renders a bare vendor `<svg>` with no `<title>`, and ships
 * `ViewEncapsulation.None`, so nothing here can label that `<svg>` directly. The header
 * markup wraps it in a named element and marks the vendor host decorative instead.
 *
 * These assert the **guarantee**, not where the attributes sit today: a test pinned to
 * `span[aria-label="Hyland"]` would pass while a second, unhidden mark was added beside it,
 * and would fail on a refactor that changed nothing a user could perceive.
 */
describe('AppShellComponent — header brand accessibility', () => {
  // Signals, not plain values: the shell's nav items and the extension rules read these
  // through `computed()`, and a non-callable stub throws before the header ever renders.
  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    isAdministrator: signal(true),
    isPowerUser: signal(false),
    hasAdministrationAccess: signal(true),
    basicCredentials: () => 'dGVzdA==',
    logout: () => undefined,
  } as unknown as AuthService;

  function accessibleName(el: Element): string {
    return (el.getAttribute('aria-label') ?? el.getAttribute('title') ?? '').trim();
  }

  function isHiddenFromAssistiveTech(el: Element): boolean {
    return el.closest('[aria-hidden="true"]') !== null;
  }

  /** `root` and every element beneath it, descending through open shadow roots. */
  function subtree(root: Element): Element[] {
    const found: Element[] = [root];
    const visit = (node: Element | ShadowRoot) => {
      for (const child of node.querySelectorAll('*')) {
        found.push(child);
        if (child.shadowRoot) visit(child.shadowRoot);
      }
    };
    if (root.shadowRoot) visit(root.shadowRoot);
    visit(root);
    return found;
  }

  /** The focused element, resolved through open shadow roots rather than stopping at a host. */
  function deepActiveElement(): Element | null {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active;
  }

  /**
   * Whether the browser actually gives this element focus — asked, not inferred.
   *
   * This replaces a selector list, which was the wrong instrument: it has to enumerate every
   * focusable form there is — `iframe`, `summary`, `area`, media with `controls`,
   * `contenteditable`, a positive `tabindex` on any tag at all — and it passes silently on
   * whatever the author did not think of, which is precisely when the test is needed.
   */
  function isFocusable(el: Element): boolean {
    if (typeof (el as Partial<HTMLElement>).focus !== 'function') return false;
    (el as HTMLElement).focus();
    const took = deepActiveElement() === el;
    (el as HTMLElement).blur?.();
    return took;
  }

  function focusableIn(root: Element): string[] {
    return subtree(root)
      .filter(isFocusable)
      .map((el) => el.tagName.toLowerCase());
  }

  /** The vendor component that draws the word mark. Present with or without the fix. */
  function wordMark(root: HTMLElement): HTMLElement {
    const el = root.querySelector<HTMLElement>('sat-app-header sat-word-mark-logo');
    if (!el) throw new Error('the app header does not render sat-word-mark-logo at all');
    return el;
  }

  /**
   * The nearest ancestor that gives the word mark an accessible name, or `null` when nothing
   * names it — which is the unfixed state, and is what each test reports in its own terms
   * rather than throwing out of a shared helper.
   */
  function namingAncestor(root: HTMLElement): HTMLElement | null {
    const header = root.querySelector('sat-app-header');
    for (
      let el: HTMLElement | null = wordMark(root);
      el && el !== header;
      el = el.parentElement
    ) {
      if (accessibleName(el)) return el;
    }
    return null;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: appConfig.providers,
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('announces the word mark with the name "Hyland"', () => {
    const named = namingAncestor(render());

    expect(named)
      .withContext('nothing gives the header word mark an accessible name')
      .not.toBeNull();
    // Return rather than dereference: the assertion above is the finding, and letting the
    // next line throw a TypeError would bury it under an unrelated stack trace.
    if (!named) return;

    expect(accessibleName(named)).toBe('Hyland');
    // The role is part of the guarantee, not decoration. Measured on the running app: a
    // bare `aria-label` on the host leaves it a `generic` node in the accessibility tree —
    // named, but not announced as a graphic — and the unlabelled `<svg>` stays exposed
    // beside it, so `svg_graphics_labelled` still fails. Only `role="img"` makes the
    // wrapper the graphic that carries the name.
    expect(named.getAttribute('role')).toBe('img');
    expect(isHiddenFromAssistiveTech(named)).toBe(false);
  });

  it('leaves no unnamed graphic exposed in the header', () => {
    const root = render();

    // The defect itself: every `<svg>` in the header must be either named or hidden. The
    // word mark's own `<svg>` cannot be named from this repo, so it has to be hidden — and
    // this catches a second vendor mark added later exactly as it catches this one.
    const exposedUnnamed = [...root.querySelectorAll('sat-app-header svg')].filter(
      (svg) =>
        !isHiddenFromAssistiveTech(svg) &&
        !accessibleName(svg) &&
        svg.querySelector('title') === null,
    );

    expect(exposedUnnamed.map((svg) => svg.outerHTML.slice(0, 80)))
      .withContext('each of these is announced as an unlabelled image')
      .toEqual([]);
  });

  it('puts the name on the element the vendor breakpoint hides', () => {
    const root = render();
    const named = namingAncestor(root);

    // The vendor stylesheet keys `display: block`, and `display: none` below 620px, off the
    // `satAppHeaderLogo` attribute. A name on any other element would keep announcing a
    // brand that is not drawn on a narrow viewport. This is what makes CSS and ARIA agree.
    expect(named)
      .withContext('nothing gives the header word mark an accessible name')
      .not.toBeNull();
    if (!named) return;

    expect(named.hasAttribute('satAppHeaderLogo'))
      .withContext(
        'the element carrying the accessible name is not the one the vendor stylesheet ' +
          'hides below 620px, so the name would outlive the graphic',
      )
      .toBe(true);
    expect(named.contains(wordMark(root))).toBe(true);
  });

  it('hides nothing focusable from assistive technology', () => {
    const root = render();

    // `aria-hidden` over a focusable element is itself a violation
    // (`aria_hidden_focus_misuse`): the control keeps its tab stop but leaves the
    // accessibility tree. Asserted because a vendor release could add one inside the lockup.
    //
    // The hidden element **itself** is included, not only its descendants — `aria-hidden` on
    // a focusable element is the same violation, and a descendant-only check misses it.
    const focusableAndHidden = [
      ...root.querySelectorAll('sat-app-header [aria-hidden="true"]'),
    ].flatMap(focusableIn);

    expect(focusableAndHidden).toEqual([]);
  });

  it('does not turn the brand into a tab stop', () => {
    const root = render();
    const brand = namingAncestor(root) ?? wordMark(root);

    // Including the brand element itself: giving the wrapper a `tabindex` would make the
    // decoration a tab stop just as surely as putting a control inside it.
    expect(focusableIn(brand)).toEqual([]);
  });
});
