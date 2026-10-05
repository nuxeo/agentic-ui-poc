import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';

import { AppExtensionsService } from './app-extensions.service';
import { ExtensionRuleContextService } from './extension-rule-context.service';
import { ExtensionRuleRegistry } from './extension-rules';
import { APP_NAV_ITEMS, PACKAGED_NAV_ITEMS } from './nav-items';

/**
 * Administration visibility, which Phase 2 moved from a hardcoded
 * `path === '/administration' && !auth.hasAdministrationAccess()` filter in the
 * shell to `rule: 'app.rules.hasAdministrationAccess'` on the descriptor.
 *
 * Phase 2's evidence ran solely as Administrator, so the negative case — the
 * one that matters — was never exercised anywhere. These specs are that case.
 */
describe('APP_NAV_ITEMS — Administration gating', () => {
  /** The manifest signal `AppExtensionsService` reads; `{}` is the packaged default. */
  const manifest = signal<{ extensions?: unknown }>({});

  function setUp() {
    manifest.set({});
    TestBed.configureTestingModule({
      providers: [{ provide: AppConfigService, useValue: { manifest } }],
    });
  }

  function navIds(): readonly string[] {
    return TestBed.inject(APP_NAV_ITEMS)().map((item) => item.id);
  }

  /** Packaged ids the registry is expected to render: `disabled` entries never are. */
  function enabledPackagedIds(): readonly string[] {
    return PACKAGED_NAV_ITEMS.filter((item) => !item.disabled).map((item) => item.id);
  }

  beforeEach(setUp);

  it('shows Administration to a user with administration access', () => {
    TestBed.inject(AppExtensionsService).registerRules({
      'app.rules.hasAdministrationAccess': () => true,
    });
    expect(navIds()).toContain('app.navbar.administration');
  });

  it('hides Administration from a user without administration access', () => {
    TestBed.inject(AppExtensionsService).registerRules({
      'app.rules.hasAdministrationAccess': () => false,
    });
    const ids = navIds();
    expect(ids).not.toContain('app.navbar.administration');
    // Nothing else may disappear with it — a filter that removed too much would
    // otherwise pass the assertion above.
    expect(ids).toEqual(enabledPackagedIds().filter((id) => id !== 'app.navbar.administration'));
  });

  it('hides Administration when the gating rule has not been registered at all', () => {
    // The registration-order hazard: the rule is contributed by the shell's
    // APP_INITIALIZER, so a consumer that resolves the navbar earlier sees an
    // unknown id. Fail-open would expose Administration to everyone.
    expect(TestBed.inject(ExtensionRuleRegistry).has('app.rules.hasAdministrationAccess')).toBe(
      false,
    );
    expect(navIds()).not.toContain('app.navbar.administration');
  });

  it('still lets a manifest ungate Administration deliberately, with rule: null', () => {
    // Fail-closed must not become un-overridable, or a customer who genuinely
    // wants the entry visible has no Layer 1 route to it.
    manifest.set({ extensions: { overrides: { 'app.navbar.administration': { rule: null } } } });
    expect(navIds()).toContain('app.navbar.administration');
  });

  it('renders every enabled packaged entry, in order, for an administrator', () => {
    TestBed.inject(AppExtensionsService).registerRules({
      'app.rules.hasAdministrationAccess': () => true,
    });
    TestBed.inject(ExtensionRuleContextService).isAdministrator.set(true);
    expect(navIds()).toEqual(enabledPackagedIds());
  });

  it('does not render the legacy Browse entry, leaving only the adf-hx one', () => {
    // Two entries reading "Browse" was the bug. `disabled` on the descriptor is
    // what removes it, so this fails the moment that flag is dropped.
    const ids = navIds();
    expect(ids).not.toContain('app.navbar.browse');
    expect(ids).toContain('app.navbar.browseAdfHx');
  });

  it('keeps the disabled descriptor in the packaged list, which the shell reads for titles', () => {
    // The reason `app.navbar.browse` is `disabled` rather than deleted: the shell's
    // `pageTitle` matches the route against the **unfiltered** `PACKAGED_NAV_ITEMS`, so
    // deleting the entry would leave `/#/browse` — still routable, still linked from the
    // dashboard — headed with the product name instead of "Browse".
    //
    // This asserts the descriptor's presence, not the rendered heading; `pageTitle` lives
    // in `AppShellComponent` and has no spec of its own.
    const browse = PACKAGED_NAV_ITEMS.find((item) => item.id === 'app.navbar.browse');
    expect(browse?.path).toBe('/browse');
    expect(browse?.label).toBe('Browse');
  });

  it('lets a manifest restore the legacy Browse entry by clearing disabled', () => {
    // `docs/extension-reference.md` tells a customer who wants both browse
    // surfaces to re-state the id as a slot addition, and says an `overrides`
    // entry will not do it. Both halves of that promise are asserted here.
    manifest.set({ extensions: { overrides: { 'app.navbar.browse': { visible: true } } } });
    expect(navIds()).not.toContain('app.navbar.browse');

    manifest.set({ extensions: { slots: { navbar: [{ id: 'app.navbar.browse' }] } } });
    expect(navIds()).not.toContain('app.navbar.browse');

    manifest.set({
      extensions: { slots: { navbar: [{ id: 'app.navbar.browse', disabled: false }] } },
    });
    expect(navIds()).toContain('app.navbar.browse');
  });
});
