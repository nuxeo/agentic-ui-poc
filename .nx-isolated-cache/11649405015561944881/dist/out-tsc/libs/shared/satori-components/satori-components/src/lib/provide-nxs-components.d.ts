import type { EnvironmentProviders } from '@angular/core';
/**
 * Register the library's components by ID, on Material. Needs no Satori.
 *
 * Registration goes through `provideSatoriExtensions`, so it layers like every other contribution:
 * in provider order, later wins per ID. List it **before** `provideNxsSatoriComponents()` from
 * `@nuxeo/satori-platform/components-satori`, which re-registers four of the `NXS_PRIMITIVE_IDS` on
 * Satori, and before your own `provideSatoriExtensions(...)` calls, so an override of yours wins:
 *
 * ```ts
 * providers: [
 *   provideNxsComponents(),
 *   provideNxsSatoriComponents(), // only with access to @hylandsoftware/satori-ui
 *   provideSatoriExtensions({ components: { 'nxs.primitives.tag': () => import('./acme-tag').then((m) => m.AcmeTag) } }),
 * ];
 * ```
 */
export declare function provideNxsComponents(): EnvironmentProviders;
//# sourceMappingURL=provide-nxs-components.d.ts.map