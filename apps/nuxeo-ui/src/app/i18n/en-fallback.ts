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
 *
 * ## Every key bound to an accessible name must be here
 *
 * That is the rule, and it is narrower than "every key in the catalogue" on purpose — this map
 * is deliberately partial, and visible text degrading to a raw key is ugly where an accessible
 * name degrading to one is a WCAG failure.
 *
 * `settings.themes.search` was missing, and it is the `[attr.aria-label]` of the themes
 * toolbar's search button. A failed fetch therefore named that control `settings.themes.search`
 * — the same class of defect as the empty `sat.platform-nav.*` names above, differing only in
 * whether the wrong name is blank or is a raw key. Only one of the two is machine-detectable:
 * axe catches the blank name, because it checks that a control HAS a name. It cannot catch the
 * raw key, because a raw key is a name — it is simply not words. That is why this map is
 * enforced by a guardrail rather than left to the accessibility scan.
 *
 * `checkAccessibleNameFallbacks` in `scripts/review-guardrails.mjs` enforces exactly that rule:
 * it reads the keys our templates bind to `aria-label` and `title` through the translate pipe,
 * and fails when one of them is missing from this map or blank in it.
 */
export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {
  'sat.platform-nav.expand': 'Expand navigation',
  'sat.platform-nav.collapse': 'Collapse navigation',
  'app.title': 'Hyland Nuxeo',
  'app.nav.toggle': 'Toggle navigation menu',
  'login.panel-label': 'Log in',
  'login.skip-link': 'Skip to sign in',
  'browse.details.show': 'Show details',
  'browse.details.hide': 'Hide details',
  'browse.details.toggle': 'Toggle details panel',
  'settings.themes.title': 'Themes',
  'settings.themes.search': 'Search themes',
  'settings.themes.current': 'Current',
  'settings.themes.apply': 'Apply',
  // Shell chrome accessible names. Not the visible text from the same templates: this map is for
  // the names that would become raw keys on a control, and `checkAccessibleNameFallbacks` is the
  // list of what that means in practice.
  // Placeholders, and they are accessible names rather than hints: neither the global search box
  // nor the assistant's message box carries an `aria-label`, so the placeholder is the only thing
  // naming them — HTML-AAM's last resort. Absent here, a failed catalogue fetch named the search
  // box `shell.search.placeholder`, which is a raw key announced as a control's name.
  'shell.search.placeholder': 'Search documents, users or groups',
  'shell.ai.input-placeholder': 'Ask anything about your documents...',
  'shell.ai.open': 'AI Assistant',
  'shell.ai.clear': 'Clear chat',
  'shell.ai.close': 'Close chat',
  'shell.ai.send': 'Send message',
  'shell.settings.menu': 'Settings menu',
  'nav.refresh': 'Refresh',
  'nav.loading': 'Loading',
  'nav.favorites.remove': 'Remove from favorites',
  'nav.clipboard.remove': 'Remove from clipboard',
  // The navigation tree's folder toggle. It had NO accessible name at all — an icon-only button
  // wrapping a `mat-icon`, which Angular Material marks `aria-hidden` — so axe reported four
  // `button-name` nodes at critical. Found by the French axe scan the test plan had promised and
  // this capture was not making; the English Phase 6 scan does not open the drawer.
  'nav.tree.toggle': 'Toggle {{ name }}',
};
