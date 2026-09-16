import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { appConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';
import { AppShellComponent } from './app-shell.component';

/**
 * Every element under `root`, following open shadow roots — something focusable inside one
 * still takes focus away from a keyboard user.
 *
 * The shadow-root check is on entry rather than per child, so a shadow root attached to
 * `root` itself is traversed too. A walk that only looks at children covers every level
 * except the first, which is exactly where a component under test attaches one.
 */
function allDescendants(root: Element): Element[] {
  const found: Element[] = [];
  const visit = (node: Element | ShadowRoot) => {
    if (node instanceof Element && node.shadowRoot) visit(node.shadowRoot);
    for (const child of Array.from(node.children)) {
      found.push(child);
      visit(child);
    }
  };
  visit(root);
  return found;
}

/**
 * Whether an element can actually take focus — asked of the browser, by focusing it.
 *
 * Deliberately not a selector list. `a[href],button,input,…` is permanently incomplete: it
 * misses `area[href]`, `iframe`, `object`, `audio[controls]`, `video[controls]` and
 * `summary`, and would miss whatever HTML makes focusable next. `@angular/cdk/a11y`'s
 * `InteractivityChecker` has the same gap, being a maintained list rather than a complete
 * one. These specs run in real Chrome, so focus semantics are available directly.
 *
 * Focus landing anywhere off `<body>` counts: an element inside a shadow root reports its
 * host as `document.activeElement`, so comparing against the element itself would read a
 * real focus move as a miss.
 */
function canTakeFocus(element: Element): boolean {
  (document.activeElement as HTMLElement | null)?.blur();
  (element as HTMLElement).focus?.();
  const took = document.activeElement !== null && document.activeElement !== document.body;
  (document.activeElement as HTMLElement | null)?.blur();
  return took;
}

/**
 * The nearest ancestor-or-self carrying `aria-hidden="true"`, if any.
 *
 * Named for what it inspects rather than for "hidden from assistive technology", which it
 * would overclaim: `display:none`, `visibility:hidden` and the `hidden` attribute also remove
 * an element from the accessibility tree and this does not look for them. The narrower
 * reading is the safe direction here — it can only make an assertion stricter.
 */
function ariaHiddenAncestorOf(el: Element): Element | null {
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (n.getAttribute('aria-hidden') === 'true') return n;
  }
  return null;
}

/**
 * Whether an `<svg>` carries an accessible name of its own.
 *
 * `aria-labelledby` is **resolved** rather than counted: ids that match no element, or match
 * an empty one, leave the graphic unnamed. Treating the attribute's presence as proof of a
 * name would let `aria-labelledby="missing-id"` exclude an unnamed `<svg>` from the check.
 */
function hasAccessibleName(svg: Element): boolean {
  if (svg.getAttribute('aria-label')?.trim()) return true;
  if (svg.querySelector(':scope > title')?.textContent?.trim()) return true;

  const ids = svg.getAttribute('aria-labelledby')?.trim().split(/\s+/).filter(Boolean) ?? [];
  const root = svg.getRootNode() as Document | ShadowRoot;
  return ids.some((id) => Boolean(root.getElementById?.(id)?.textContent?.trim()));
}

describe('AppShellComponent — header graphics and assistive technology', () => {
  let header: HTMLElement;

  const authMock = {
    isAuthenticated: signal(true),
    username: signal('test.user'),
    // Both are read while the extension registry resolves the navigation:
    // `hasAdministrationAccess` by the `app.rules.hasAdministrationAccess` rule, and
    // `isAdministrator` by the effect that keeps the rule context in sync.
    hasAdministrationAccess: signal(true),
    isAdministrator: signal(true),
    // `undefined` rather than an empty body: `no-empty-function` is right to flag a silent
    // no-op, and this stub genuinely returns nothing.
    logout: () => undefined,
  } as unknown as AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      // `provideHttpClientTesting` last, so it replaces the real backend `appConfig` installs.
      // The shell's constructor calls `refreshFavoritesCount()`, which issues a Nuxeo search
      // through the real `CollectionService`; against the live backend that is a network
      // request from a unit test — order-dependent, offline-dependent, and noisy in the Karma
      // log. Requests are never flushed here because no assertion depends on one.
      providers: [...appConfig.providers, provideHttpClientTesting()],
    })
      .overrideProvider(AuthService, { useValue: authMock })
      .compileComponents();

    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const found = (fixture.nativeElement as HTMLElement).querySelector('sat-app-header');
    expect(found)
      .withContext('the shell must render the app header for this spec to assert anything')
      .toBeTruthy();
    header = found as HTMLElement;
  });

  /**
   * NXENG-767 (and NXENG-759, the same IBM Issue ID 29948169). The header renders
   * `<sat-word-mark-logo>`, a vendor component drawing an `<svg>` with no `<title>`, no
   * `role` and no `aria-label`. An `<svg>` with no accessible name is announced as an unnamed
   * image — WCAG 2.1 1.1.1 Non-text Content, level A, reported by IBM Equal Access as
   * `svg_graphics_labelled`. Nothing in this repo can put an attribute on that `<svg>`,
   * because the markup belongs to `@hylandsoftware/satori-ui/logo`.
   *
   * The assertion is the guarantee rather than one attribute's location: no graphic in the
   * header reaches assistive technology without a name. A test for `aria-hidden` on
   * `<sat-word-mark-logo>` would stay green while a second mark added beside it went
   * unhidden.
   *
   * Note this cannot be an axe assertion. axe's `svg-img-alt` only applies to an `<svg>` that
   * carries an explicit `role`, which the vendor's does not — `phase-6-a11y.mjs` scans this
   * very route axe-clean with an empty `KNOWN_VIOLATIONS` list, and did so while the
   * violation was present.
   */
  it('exposes no unnamed graphic in the header', () => {
    const svgs = Array.from(header.querySelectorAll('svg'));
    expect(svgs.length).withContext('the header must render at least one graphic').toBeGreaterThan(0);

    const exposedUnnamed = svgs.filter((svg) => !ariaHiddenAncestorOf(svg) && !hasAccessibleName(svg));
    expect(exposedUnnamed.map((svg) => svg.parentElement?.tagName.toLowerCase()))
      .withContext('every <svg> in the header must be hidden from assistive technology or named')
      .toEqual([]);
  });

  /**
   * The first precondition that makes `aria-hidden` a remediation rather than a suppression:
   * hiding the graphic must not take the header's own accessible name with it. The header's
   * name comes from the level-1 heading carrying the page title, not from the word mark.
   */
  it('keeps the header level-1 heading exposed to assistive technology', () => {
    // Both attributes: `aria-level` alone sets no role, so an element carrying only it is not
    // exposed as a heading at all and selecting on it would keep this green while the
    // header's heading had gone.
    const heading = header.querySelector('[role="heading"][aria-level="1"]');
    expect(heading).withContext('the header must expose a level-1 heading').toBeTruthy();
    expect(heading?.textContent?.trim()).toBeTruthy();
    expect(ariaHiddenAncestorOf(heading as Element))
      .withContext('the heading naming the page must not sit inside an aria-hidden subtree')
      .toBeNull();
  });

  /**
   * The second precondition: `aria-hidden` over focusable content is itself a violation
   * (`aria_hidden_focus_misuse`). A vendor release that added a focusable element inside the
   * lockup would reintroduce it, so this is asserted rather than checked once by hand.
   */
  it('puts nothing focusable inside an aria-hidden subtree in the header', () => {
    const hiddenRoots = Array.from(header.querySelectorAll('[aria-hidden="true"]'));
    // A sanity check on the query, not on the fix: Angular Material's icon hosts are
    // aria-hidden too, so this stays true with or without the word mark hidden. Claiming it
    // proves the fix would be a check named for something it cannot detect.
    expect(hiddenRoots.length)
      .withContext('there must be at least one aria-hidden subtree for this guard to examine')
      .toBeGreaterThan(0);

    const focusable = hiddenRoots
      .flatMap((root) => [root, ...allDescendants(root)])
      .filter(canTakeFocus)
      .map((el) => el.tagName.toLowerCase());
    expect(focusable)
      .withContext('a keyboard user must not be able to land inside a subtree screen readers cannot see')
      .toEqual([]);
  });

  // ---------------------------------------------------------------------------------------
  // Controls for the two guards above. A guard that has never been observed to fire is an
  // assumption. Both controls use cases a hand-written focusable-selector list misses, so a
  // green control cannot be confirming the part that already worked.

  it('control: the focusability guard fires on an element no selector list enumerates', () => {
    const details = document.createElement('details');
    details.innerHTML = '<summary>probe</summary><p>body</p>';
    document.body.append(details);
    expect(canTakeFocus(details.querySelector('summary') as Element))
      .withContext('<summary> is focusable in Chrome and is absent from the usual selector lists')
      .toBe(true);
    details.remove();
  });

  it('control: the subtree walk sees focusable content inside a shadow root on the root itself', () => {
    const host = document.createElement('div');
    document.body.append(host);
    host.attachShadow({ mode: 'open' }).innerHTML = '<iframe title="probe"></iframe>';
    expect([host, ...allDescendants(host)].some(canTakeFocus))
      .withContext('the walk must enter a shadow root attached to the element it was handed')
      .toBe(true);
    host.remove();
  });
});
