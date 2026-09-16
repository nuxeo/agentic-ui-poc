import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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
 *
 * The walk steps out of a shadow root onto its host, because `parentElement` is `null` at the
 * boundary and `aria-hidden` on the host does hide the shadow content beneath it.
 */
function ariaHiddenAncestorOf(el: Element): Element | null {
  for (let n: Element | null = el; n; ) {
    if (n.getAttribute('aria-hidden') === 'true') return n;
    const root = n.getRootNode();
    n = n.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
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

/**
 * Every `<svg>` under `root` that assistive technology would reach without a name.
 *
 * Shared by the assertion and its control, so the control cannot pass by exercising a
 * re-implementation of the census instead of the census itself.
 */
function exposedUnnamedGraphics(root: Element): SVGSVGElement[] {
  return [root, ...allDescendants(root)]
    .filter((el): el is SVGSVGElement => el instanceof SVGSVGElement)
    .filter((svg) => !ariaHiddenAncestorOf(svg) && !hasAccessibleName(svg));
}

/**
 * Every `aria-hidden="true"` subtree under `root`, found through the shadow-aware walk.
 *
 * Not `querySelectorAll('[aria-hidden="true"]')`: that stops at each shadow boundary, so a
 * hidden subtree inside an open shadow root — and everything focusable in it — would never be
 * examined, and the guard below would stay green with the violation present.
 */
function ariaHiddenSubtreesIn(root: Element): Element[] {
  return [root, ...allDescendants(root)].filter((el) => el.getAttribute('aria-hidden') === 'true');
}

/**
 * Everything inside an `aria-hidden` subtree of `root` that can take focus — the
 * `aria_hidden_focus_misuse` violation, expressed as a census.
 *
 * Shared by the assertion and all of its controls, so a control cannot pass by exercising a
 * re-implementation of the walk, or by testing `canTakeFocus` on a detached probe while the
 * census itself has stopped traversing.
 */
function focusableInsideHiddenSubtrees(root: Element): Element[] {
  return ariaHiddenSubtreesIn(root)
    .flatMap((hidden) => [hidden, ...allDescendants(hidden)])
    .filter(canTakeFocus);
}

describe('AppShellComponent — header graphics and assistive technology', () => {
  let header: HTMLElement;
  let http: HttpTestingController;

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

    http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const found = (fixture.nativeElement as HTMLElement).querySelector('sat-app-header');
    expect(found)
      .withContext('the shell must render the app header for this spec to assert anything')
      .toBeTruthy();
    header = found as HTMLElement;
  });

  // The same cleanup `provide-app-extensions.spec.ts` uses: the shell's startup queues
  // requests — the favourites search from `refreshFavoritesCount()` among them — so flushing
  // everything and then verifying leaves an empty queue for the next spec.
  //
  // It does **not** detect an unexpected request, and does not claim to: matching everything
  // before `verify()` means `verify()` can only catch a request that arrives *after* the
  // flush loop. Enumerating the startup requests here instead would couple a spec about
  // header markup to the app's bootstrap, translation and manifest calls, and go red whenever
  // those change for reasons this spec has no opinion about.
  afterEach(() => {
    http.match(() => true).forEach((request) => request.flush({}));
    http.verify();
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
    // Anchored on the subject, not on a graphic count. The header also renders several
    // `mat-icon` SVGs, so "at least one <svg> exists" would keep this green if
    // `<sat-word-mark-logo>` stopped rendering at all — the census would then have nothing to
    // find and the test would pass by vacuity.
    const wordMark = header.querySelector('sat-word-mark-logo');
    expect(wordMark).withContext('the header must still render the word mark').toBeTruthy();
    expect(
      [wordMark as Element, ...allDescendants(wordMark as Element)].filter(
        (el) => el instanceof SVGSVGElement,
      ).length,
    )
      .withContext('the word mark must still draw a graphic for this census to be about anything')
      .toBeGreaterThan(0);

    expect(exposedUnnamedGraphics(header).map((svg) => svg.parentElement?.tagName.toLowerCase()))
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
    // A sanity check on the census, not on the fix: Angular Material's icon hosts are
    // aria-hidden too, so this stays true with or without the word mark hidden. Claiming it
    // proves the fix would be a check named for something it cannot detect.
    expect(ariaHiddenSubtreesIn(header).length)
      .withContext('there must be at least one aria-hidden subtree for this guard to examine')
      .toBeGreaterThan(0);

    expect(focusableInsideHiddenSubtrees(header).map((el) => el.tagName.toLowerCase()))
      .withContext('a keyboard user must not be able to land inside a subtree screen readers cannot see')
      .toEqual([]);
  });

  // ---------------------------------------------------------------------------------------
  // Controls. A guard that has never been observed to fire is an assumption.
  //
  // Every control drives the **same** census function its assertion uses, and plants its
  // probe in the **rendered** header rather than in a detached fragment. Both matter: a
  // control that re-implements the walk, or that tests the leaf predicate in isolation, stays
  // green when the census itself stops traversing — which is precisely what it exists to
  // detect. Each probe is also a case the obvious implementation misses.

  it('control: the graphic census crosses an open shadow boundary, in both directions', () => {
    const host = document.createElement('div');
    header.append(host);
    host.attachShadow({ mode: 'open' }).innerHTML = '<svg viewBox="0 0 1 1"><path d="M0 0" /></svg>';

    // Seen: `querySelectorAll('svg')` on the header would return nothing for this graphic.
    expect(exposedUnnamedGraphics(header).length)
      .withContext('an unnamed <svg> inside an open shadow root must be counted')
      .toBe(1);

    // And hiding the host hides it: the aria-hidden walk has to step out of the shadow root
    // onto its host, where `parentElement` is null.
    host.setAttribute('aria-hidden', 'true');
    expect(exposedUnnamedGraphics(header).length)
      .withContext('aria-hidden on the shadow host must cover the graphic inside it')
      .toBe(0);

    host.remove();
  });

  it('control: the focusability census finds a <summary> planted in the hidden word mark', () => {
    // The word mark specifically, not the first `[aria-hidden="true"]` in the header: that is
    // the mobile-nav trigger's `mat-icon`, which the vendor stylesheet sets to `display:none`
    // above 675px. `focus()` does nothing to an unrendered element, so a probe planted there
    // would report "not focusable" for a reason that has nothing to do with the census.
    const hidden = header.querySelector('sat-word-mark-logo[aria-hidden="true"]');
    expect(hidden)
      .withContext('the control plants into the subtree this fix hides')
      .toBeTruthy();

    const details = document.createElement('details');
    details.innerHTML = '<summary>probe</summary><p>body</p>';
    hidden?.append(details);

    // Through the census, inside the rendered header: this goes red if the walk stops
    // descending, if the hidden-root collection misses the subtree, or if focusability were
    // ever downgraded to a selector list — `<summary>` appears in none of the usual ones.
    expect(focusableInsideHiddenSubtrees(header).map((el) => el.tagName.toLowerCase()))
      .withContext('a focusable <summary> inside an aria-hidden subtree must be caught')
      .toContain('summary');

    details.remove();
  });

  it('control: the focusability census reaches an aria-hidden subtree inside a shadow root', () => {
    const host = document.createElement('div');
    header.append(host);
    host.attachShadow({ mode: 'open' }).innerHTML =
      '<div aria-hidden="true"><iframe title="probe"></iframe></div>';

    // Two properties at once, both of which a light-DOM `querySelectorAll` would miss: the
    // hidden subtree itself lives behind a shadow boundary, and the focusable element inside
    // it is an <iframe> — focusable, and absent from hand-written selector lists.
    expect(focusableInsideHiddenSubtrees(header).map((el) => el.tagName.toLowerCase()))
      .withContext('an aria-hidden subtree nested in a shadow root must still be examined')
      .toContain('iframe');

    host.remove();
  });
});
