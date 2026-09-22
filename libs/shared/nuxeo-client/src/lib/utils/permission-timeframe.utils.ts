/** Formats ACE begin/end timestamps for permission tables. */
export function formatPermissionTimeFrame(
  begin: string | null,
  end: string | null,
  // A free function has no injector, so the caller passes the resolver. REQUIRED, not defaulted.
  //
  // The default used to be `() => 'Permanent'`, which ignores the key and returns that literal for
  // whatever it is asked — and its comment said this "keeps the English so a caller that has not
  // been updated still reads sensibly". Three callers were never updated, so three permission
  // tables rendered `Permanent` in every locale. That rationalisation is the same one that let
  // `toDataColumns`, `hxpRelativeTime` and `trash-confirm.utils` ship untranslated: a default
  // producing the untranslated answer turns every forgotten call site into a silent no-op, where a
  // required parameter turns it into a compile error.
  translate: (key: string) => string,
  // Required for the same reason `translate` is: `toLocaleString()` with no argument reads the
  // host's locale, not the one the user picked in the app, so the two disagree whenever they
  // differ. A default here would reintroduce exactly that silent mismatch.
  locale: string,
): string {
  if (!begin && !end) {
    return translate('permissions.time-frame.permanent');
  }

  const beginLabel = begin ? new Date(begin).toLocaleString(locale) : '—';
  const endLabel = end ? new Date(end).toLocaleString(locale) : '—';
  return `${beginLabel} – ${endLabel}`;
}

/**
 * Formats an ACE date range for the permissions tab of a document, collection or browse page.
 *
 * Those three pages each carried their own copy of this, and all three copies made the same two
 * mistakes: a hardcoded `'en-US'`, and English connectives built by interpolation — `Until ${x}`,
 * `from ${x}`, `to ${y}`. The interpolation is the worse of the two, because no catalogue entry
 * exists for a string assembled at runtime, so no translation could have reached it. The
 * `permissions.time-frame.*` keys this uses were already in `en.json` and already unused.
 *
 * Distinct keys per shape rather than joining parts: a language that puts the preposition after the
 * date, or inflects it, cannot be served by concatenating `from` and `to` fragments.
 */
export function formatAceDateRange(
  begin: string | null,
  end: string | null,
  translate: (key: string, params?: Record<string, unknown>) => string,
  locale: string,
): string {
  if (!begin && !end) {
    return translate('permissions.time-frame.permanent');
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });

  if (begin && end) {
    return translate('permissions.time-frame.range', { begin: fmt(begin), end: fmt(end) });
  }
  if (end) {
    return translate('permissions.time-frame.until', { end: fmt(end) });
  }
  return translate('permissions.time-frame.from', { begin: fmt(begin as string) });
}
