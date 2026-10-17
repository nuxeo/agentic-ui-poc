import { inject, provideEnvironmentInitializer, runInInjectionContext, Injector, } from '@angular/core';
import { ExtensionActionRegistry } from './extension-actions';
import { ExtensionComponentRegistry, } from './extension-component-registry.service';
import { ExtensionRuleRegistry } from './extension-rules';
import { ExtensionSlotRegistry } from './extension-slot-registry.service';
/**
 * Register a layer's contributions to the addressable surface.
 *
 * Call it in `bootstrapApplication`'s providers, once per contributing layer:
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     ...provideAppConfig(),
 *     provideSatoriExtensions(PACKAGED_CONTRIBUTIONS),
 *     provideSatoriExtensions(() => {
 *       const injector = inject(Injector);
 *       return {
 *         rules: { 'acme.rules.isPilotUser': () => injector.get(AcmeService).isPilot() },
 *         components: { 'acme.sidebar.reports': () => import('./reports').then((m) => m.Reports) },
 *       };
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Ordering, which is the reason this is a provider and not a service call
 *
 * Contributions are applied in an **environment initializer**, so every id is
 * registered before the first component resolves a slot. Registering from a
 * component constructor instead leaves a window in which a rule id is unknown,
 * and an unknown rule fails open — which is how the Administration nav entry
 * came to flash for a non-administrator. An environment initializer runs earlier
 * than `APP_INITIALIZER`, so it closes that window rather than narrowing it.
 *
 * Multiple calls **layer** in provider order, and later wins per id, which is
 * what makes a customer layer able to override a packaged rule, component or
 * handler. Slot descriptors accumulate rather than replace; use the manifest's
 * `overrides` to hide or reorder a packaged entry.
 *
 * Returns `EnvironmentProviders`, so it cannot be mistakenly listed in a
 * component's `providers` — where it would run too late to be worth anything.
 */
export function provideSatoriExtensions(contributor) {
    return provideEnvironmentInitializer(() => {
        const injector = inject(Injector);
        const slots = inject(ExtensionSlotRegistry);
        const rules = inject(ExtensionRuleRegistry);
        const components = inject(ExtensionComponentRegistry);
        const actions = inject(ExtensionActionRegistry);
        // The factory runs in *this* injection context, so a contributed rule may
        // `inject()` its own dependencies. `runInInjectionContext` rather than a
        // bare call, because a factory declared in a customer library has no
        // ambient context of its own.
        const contributions = typeof contributor === 'function'
            ? runInInjectionContext(injector, contributor)
            : contributor;
        // `failClosed` is declared before the evaluators register, because the
        // window it guards is the one *before* registration. The registry accepts
        // the declaration in either order for exactly this reason.
        if (contributions.failClosedRules?.length) {
            rules.declareFailClosed(contributions.failClosedRules);
        }
        if (contributions.rules) {
            rules.registerRules(contributions.rules);
        }
        if (contributions.components) {
            components.register(contributions.components);
        }
        if (contributions.actions) {
            actions.register(contributions.actions);
        }
        for (const [slot, entries] of Object.entries(contributions.slots ?? {})) {
            slots.register(slot, entries);
        }
    });
}
