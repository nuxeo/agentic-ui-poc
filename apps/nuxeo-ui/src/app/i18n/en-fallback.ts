/**
 * Compiled-in English strings, used only when the shipped catalogue cannot be
 * fetched. Deliberately limited to the chrome that would look broken as a raw
 * translation key; anything else falls back to ngx-translate's key passthrough.
 *
 * ## The two `sat.platform-nav.*` entries were empty, and that was an accessibility defect
 *
 * They were blanked on purpose, and the reason was reasonable: `sat-platform-nav` renders a
 * tooltip on the rail toggle that duplicates the visible label when the rail is expanded, and
 * emptying the key suppressed it.
 *
 * But `@hylandsoftware/satori-ui` binds **the same key** to both the tooltip and the accessible
 * name:
 *
 * ```html
 * [matTooltip]="(service.collapsed() ? 'sat.platform-nav.expand' : '…collapse') | translate"
 * [attr.aria-label]="(service.collapsed() ? 'sat.platform-nav.expand' : '…collapse') | translate"
 * ```
 *
 * So suppressing the tooltip also erased the accessible name, and the button rendered
 * `aria-label=""` — axe `button-name`, **critical**, on every surface in the application. There is
 * no way to keep the suppression and the name, because there is only one string.
 *
 * A visible duplicate tooltip is a cosmetic cost; an unnamed control is a WCAG 2.1 AA failure and
 * a procurement blocker. So the strings are restored and the tooltip is accepted. Reported
 * upstream as finding 4.6 in `docs/adf-hx-upstream-findings.md`: a component should not use one
 * translation key for both purposes, because it leaves the host no way to separate them.
 *
 * These values match upstream's own `i18n/en.json`, which is now also loaded as a translation
 * folder (see `SEEDED_FOLDERS` in `app-translate-loader.ts`). They are duplicated here because
 * this map is the fallback for a **failed fetch**, and a failed fetch must not silently restore
 * the empty name.
 */
export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {
  'sat.platform-nav.expand': 'Expand navigation',
  'sat.platform-nav.collapse': 'Collapse navigation',
  'app.title': 'Hyland Nuxeo',
  'app.nav.toggle': 'Toggle navigation menu',
  'browse.details.show': 'Show details',
  'browse.details.hide': 'Hide details',
  'browse.details.toggle': 'Toggle details panel',
  'settings.themes.title': 'Themes',
  'settings.themes.current': 'Current',
  'settings.themes.apply': 'Apply',
};
