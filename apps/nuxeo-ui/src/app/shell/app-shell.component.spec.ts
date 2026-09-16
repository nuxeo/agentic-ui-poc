import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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
    // `null`, not a base64 literal: the header renders without credentials, and a
    // credential-shaped string has no business in a TypeScript source even in a double.
    basicCredentials: () => null,
    shareAuthToken: () => null,
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

  /**
   * Whether the element is reachable by pressing Tab — focusable *and* in the tab order.
   *
   * Deliberately narrower than `isFocusable`, because the two tests below ask different
   * questions. `focus()` succeeds on `tabindex="-1"`, which is programmatically focusable but
   * is not a tab stop; a test named for tab order must not fail on one.
   */
  function isTabStop(el: Element): boolean {
    return isFocusable(el) && (el as HTMLElement).tabIndex >= 0;
  }

  /** The width the vendor stylesheet stops drawing the header logo at. */
  const LOGO_BREAKPOINT_PX = 619;

  /**
   * The selectors that set `display: none` inside a media query which is in force at
   * `LOGO_BREAKPOINT_PX`, read out of the live CSSOM.
   *
   * Karma cannot resize the browser, so the breakpoint cannot be reached by making the
   * window narrow. Reading the rule that governs it is the next best thing and is a real
   * assertion rather than a restatement of the markup: if the vendor drops the rule, changes
   * its width, or the wrapper stops matching it, this goes red — which is precisely the
   * regression of "the name outlives the graphic" that a presence check could not see.
   */
  function selectorsHiddenAtBreakpoint(): string[] {
    const selectors: string[] = [];
    const widthOf = (condition: string) =>
      Number(/max-width:\s*(\d+(?:\.\d+)?)px/.exec(condition)?.[1] ?? NaN);

    const scan = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule) {
          // `>=` because a `max-width: 619px` query is in force at exactly 619px.
          if (widthOf(rule.conditionText) >= LOGO_BREAKPOINT_PX) {
            for (const inner of rule.cssRules) {
              if (
                inner instanceof CSSStyleRule &&
                inner.style.getPropertyValue('display').trim() === 'none'
              ) {
                selectors.push(inner.selectorText);
              }
            }
          }
          scan(rule.cssRules);
        }
      }
    };

    for (const sheet of document.styleSheets) {
      // A stylesheet the document cannot read is one this assertion cannot speak for; it is
      // skipped rather than counted as "no rule", which would have made the check vacuous.
      let rules: CSSRuleList | null = null;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (rules) scan(rules);
    }
    return selectors;
  }

  function matchesIn(root: Element, predicate: (el: Element) => boolean): string[] {
    return subtree(root)
      .filter(predicate)
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
      // Rendering the real shell runs its constructor effects — `refreshFavoritesCount()`
      // among them — so without a testing backend each assertion would issue a live Nuxeo
      // request and the header's behaviour would be entangled with the network. The testing
      // backend replaces the real one, so the requests are captured and never sent. They are
      // deliberately not flushed: none of them feeds the header markup under test.
      providers: [...appConfig.providers, provideHttpClientTesting()],
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();
  });

  afterEach(() => {
    // Drain rather than `verify()`: the shell legitimately fires several requests this suite
    // has no opinion about, and failing on them would make the header tests report a defect
    // that is not theirs.
    TestBed.inject(HttpTestingController).match(() => true);
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
    // The `<title>` must actually say something: an empty or whitespace-only one is not an
    // accessible name, and testing only for the element's presence would let it count.
    const exposedUnnamed = [...root.querySelectorAll('sat-app-header svg')].filter(
      (svg) =>
        !isHiddenFromAssistiveTech(svg) &&
        !accessibleName(svg) &&
        !(svg.querySelector('title')?.textContent ?? '').trim(),
    );

    expect(exposedUnnamed.map((svg) => svg.outerHTML.slice(0, 80)))
      .withContext('each of these is announced as an unlabelled image')
      .toEqual([]);
  });

  it(`hides the accessible name along with the graphic at ${LOGO_BREAKPOINT_PX}px`, () => {
    const root = render();
    const named = namingAncestor(root);

    expect(named)
      .withContext('nothing gives the header word mark an accessible name')
      .not.toBeNull();
    if (!named) return;

    // The graphic is inside the named element, so hiding one hides the other. Without this
    // the name could sit on an element the breakpoint rule does not cover.
    expect(named.contains(wordMark(root))).toBe(true);

    const hidden = selectorsHiddenAtBreakpoint();
    // Guard against the vacuous pass: if no such rule is in the CSSOM at all, the assertion
    // below would be comparing against an empty set and could never fail.
    expect(hidden.length)
      .withContext(
        `no display:none rule found in any media query in force at ${LOGO_BREAKPOINT_PX}px — ` +
          'the vendor breakpoint this test relies on is gone, so the claim is unverifiable',
      )
      .toBeGreaterThan(0);

    expect(hidden.some((selector) => named.matches(selector)))
      .withContext(
        `the element carrying the accessible name is not hidden at ${LOGO_BREAKPOINT_PX}px, ` +
          `so "Hyland" would still be announced where nothing is drawn. Rules checked: ` +
          hidden.join(' | '),
      )
      .toBe(true);
  });

  it('hides nothing focusable from assistive technology', () => {
    const root = render();

    // `aria-hidden` over a focusable element is itself a violation
    // (`aria_hidden_focus_misuse`): the control keeps its tab stop but leaves the
    // accessibility tree. Asserted because a vendor release could add one inside the lockup.
    //
    // The hidden element **itself** is included, not only its descendants — `aria-hidden` on
    // a focusable element is the same violation, and a descendant-only check misses it.
    //
    // `isFocusable`, not `isTabStop`: the ARIA rule is about focusable content, and a
    // `tabindex="-1"` control inside a hidden subtree can still be reached by a script or a
    // roving-focus widget and would then be focused while absent from the accessibility tree.
    const focusableAndHidden = [
      ...root.querySelectorAll('sat-app-header [aria-hidden="true"]'),
    ].flatMap((hidden) => matchesIn(hidden, isFocusable));

    expect(focusableAndHidden).toEqual([]);
  });

  it('does not turn the brand into a tab stop', () => {
    const root = render();
    const brand = namingAncestor(root) ?? wordMark(root);

    // Including the brand element itself: giving the wrapper a `tabindex` would make the
    // decoration a tab stop just as surely as putting a control inside it.
    expect(matchesIn(brand, isTabStop)).toEqual([]);
  });
});
