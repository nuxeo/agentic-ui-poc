import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import {
  AppExtensionsService,
  EXTENSION_SLOTS,
  ExtensionRuleContextService,
  type NavItemDescriptor,
} from '@nuxeo-satori/platform/extensions';

/**
 * The template shell.
 *
 * The navigation is **resolved from the extension registry**, not written here.
 * That is the single most important line in the template: it is what makes the
 * nav addressable, so a manifest can hide, reorder, relabel or add an entry with
 * no change to this component.
 *
 * It calls `AppExtensionsService.resolve()` directly rather than injecting
 * `APP_NAV_ITEMS`. That token's factory registers the *product's* fifteen nav
 * entries as a side effect of being injected, which would point a fork at fifteen
 * routes it does not have.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly extensions = inject(AppExtensionsService);
  private readonly ruleContext = inject(ExtensionRuleContextService);

  /**
   * A `computed`, not a field, because both halves change after construction:
   * the manifest lands asynchronously, and rule results depend on the rule
   * context, which tracks the signed-in user and the current route.
   */
  protected readonly navItems = computed<readonly NavItemDescriptor[]>(() =>
    this.extensions.resolve<NavItemDescriptor>(EXTENSION_SLOTS.navbar, this.ruleContext.context()),
  );

  /** Surfaced so a fork notices a manifest naming a `$layer` that does not resolve. */
  protected readonly missingLayers = this.extensions.missingLayers;
}
