/** Formats ACE begin/end timestamps for permission tables. */
export declare function formatPermissionTimeFrame(begin: string | null, end: string | null, translate: (key: string) => string, locale: string): string;
/**
 * Formats an ACE date range for the permissions tab of a document, collection or browse page.
 *
 * Those three pages each carried their own copy of this, and all three copies made the same two
 * mistakes: a hardcoded `'en-US'`, and English connectives built by interpolation — `Until ${x}`,
 * `from ${x}`, `to ${y}`. The interpolation is the worse of the two, because no catalogue entry
 * exists for a string assembled at runtime, so no translation could have reached it. The
 * `permissions.time-frame.*` keys this uses were already in `en.json` and already REUSED —
 * `share-saved-search-dialog.component.ts` resolves all four in its own `toTimeFrameLabel`, with
 * the identical four-shape branching. So this is the fourth copy of that shape selection, not the
 * first consumer of a dormant catalogue path.
 *
 * That dialog must NOT be converted to call this function, and the reason is two lines above its
 * copy: `parseTimeFrame` splits a stored label on `' - '`, the `range` key's own separator, so the
 * dialog round-trips its own output. It passes `begin`/`end` through unformatted on purpose.
 * Formatting them here would produce `Jul 01, 2026`, which that parser cannot read back.
 *
 * Distinct keys per shape rather than joining parts: a language that puts the preposition after the
 * date, or inflects it, cannot be served by concatenating `from` and `to` fragments.
 */
export declare function formatAceDateRange(begin: string | null, end: string | null, translate: (key: string, params?: Record<string, unknown>) => string, locale: string): string;
//# sourceMappingURL=permission-timeframe.utils.d.ts.map