export const APP_THEME_STORAGE_KEY = 'agentic_ui_color_theme';
/** The compiled `html[data-app-theme=...]` palettes. A configured theme names one of these as its base. */
export const COMPILED_THEME_BASES = ['nuxeo', 'dark', 'kawaii', 'light'];
export function isAppThemeId(value, themes) {
    return value !== null && themes.some((theme) => theme.id === value);
}
/**
 * Earlier releases stored palette names rather than theme ids. Kept so an
 * upgrade does not silently reset a user's chosen theme.
 */
export function migrateLegacyThemeId(raw) {
    if (!raw)
        return null;
    const legacy = {
        satori: 'nuxeo',
        azure: 'light',
        emerald: 'kawaii',
        violet: 'dark',
    };
    return legacy[raw] ?? null;
}
/**
 * The `data-app-theme` attribute value to put on `<html>`.
 *
 * A configured theme with an unrecognised `base` still has to render, so it
 * falls back to the packaged Nuxeo palette and relies on its own token
 * overrides for the parts a customer cares about.
 */
export function resolveThemeAttribute(theme) {
    return COMPILED_THEME_BASES.includes(theme.base) ? theme.base : 'nuxeo';
}
