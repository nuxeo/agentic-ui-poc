/**
 * The IDs of the primitives Satori also ships, registered by `provideNxsComponents()`.
 *
 * Each ID resolves to a Material implementation from this entry point, and the first four to a
 * Satori-backed one once `provideNxsSatoriComponents()` from `@nuxeo/satori-platform/components-satori`
 * is provided after it. `errorState` stays on Material there: Satori's error states arrive in
 * Satori 1.0, which needs a newer Angular than this package supports. Both implement the same `Nxs…Inputs` contract below, so whoever renders an ID — a
 * `lib-extension-outlet` with `componentInputs` — gets the same inputs whichever is registered.
 * A customer overriding an ID implements that contract too.
 */
export const NXS_PRIMITIVE_IDS = Object.freeze({
    avatar: 'nxs.primitives.avatar',
    breadcrumbs: 'nxs.primitives.breadcrumbs',
    tag: 'nxs.primitives.tag',
    richTooltip: 'nxs.primitives.richTooltip',
    errorState: 'nxs.primitives.errorState',
});
