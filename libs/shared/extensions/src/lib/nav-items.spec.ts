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
    expect(ids).toEqual(
      PACKAGED_NAV_ITEMS.filter((item) => item.id !== 'app.navbar.administration').map(
        (item) => item.id,
      ),
    );
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

  it('reproduces the packaged navigation exactly for an administrator', () => {
    TestBed.inject(AppExtensionsService).registerRules({
      'app.rules.hasAdministrationAccess': () => true,
    });
    TestBed.inject(ExtensionRuleContextService).isAdministrator.set(true);
    expect(navIds()).toEqual(PACKAGED_NAV_ITEMS.map((item) => item.id));
  });
});
