/**
 * Compiled-in English strings, used only when the shipped catalogue cannot be
 * fetched. Deliberately limited to the chrome that would look broken as a raw
 * translation key; anything else falls back to ngx-translate's key passthrough.
 *
 * The two `sat.platform-nav.*` entries are intentionally empty: Satori renders a
 * tooltip on the nav rail toggle that duplicates the visible label, and blanking
 * these keys is how the application suppresses it. They predate this catalogue
 * and are preserved verbatim.
 */
export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {
  'sat.platform-nav.expand': '',
  'sat.platform-nav.collapse': '',
  'app.title': 'Hyland Nuxeo',
  'app.nav.toggle': 'Toggle navigation menu',
  'browse.details.show': 'Show details',
  'browse.details.hide': 'Hide details',
  'browse.details.toggle': 'Toggle details panel',
  'settings.themes.title': 'Themes',
  'settings.themes.current': 'Current',
  'settings.themes.apply': 'Apply',
};
