import { EnvironmentProviders } from '@angular/core';

/**
 * Re-register the avatar, breadcrumbs, tag and rich tooltip `NXS_PRIMITIVE_IDS` on Satori, over the
 * Material implementations `provideNxsComponents()` registered.
 *
 * `NXS_PRIMITIVE_IDS.errorState` is left on Material: Satori's `sat-401-` to `sat-500-error-state`
 * ship only in Satori 1.0, which needs Angular 22, and the Satori this package can install has no
 * error state. Registering one here is the whole change once it can.
 *
 * Satori-if-available, Material otherwise, decided by which providers an application lists — not
 * at build time and not by a runtime probe. This entry point is the only one in the package that
 * imports `@hylandsoftware/satori-ui`, an optional peer, so an application without GitHub Packages
 * access never imports it and still gets every ID from `@nuxeo/satori-platform/components`.
 *
 * List it after `provideNxsComponents()`, because later registrations win. The Satori components
 * also need what any Satori host provides: `provideSatori()` from
 * `@hylandsoftware/satori-ui/providers` for the theme and icons, and Satori's `sat.*` catalogue in
 * ngx-translate — `provideAndConfigureSatoriUITranslations` from `@hylandsoftware/satori-ui/translations`,
 * or seeded into your own loader as `apps/nuxeo-ui` does. Without the catalogue, the breadcrumbs'
 * landmark and the tooltip's close hint render as raw keys.
 */
declare function provideNxsSatoriComponents(): EnvironmentProviders;

export { provideNxsSatoriComponents };
//# sourceMappingURL=index.d.ts.map
