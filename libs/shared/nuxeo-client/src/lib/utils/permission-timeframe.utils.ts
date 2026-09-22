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
  // Required for the same reason `translate` is: the Intl date methods, called with no locale
  // argument, read the host's locale rather than the one the user picked in the app, so the two
  // disagree whenever they differ. A default here would reintroduce exactly that silent mismatch.
  //
  // Deliberately describes the call rather than spelling it out: `docs/i18n-status.md` and
  // `CHANGELOG.md` both advertise a grep for the argument-less form that "must stay empty", and a
  // comment containing that expression is a hit, which makes the advertised check unusable.
  locale: string,
): string {
  if (!begin && !end) {
    return translate('permissions.time-frame.permanent');
  }

  const beginLabel = begin ? formatAceInstant(begin, locale) : '—';
  const endLabel = end ? formatAceInstant(end, locale) : '—';
  return `${beginLabel} – ${endLabel}`;
}

/**
 * `timeZone: 'UTC'` is load-bearing, not tidiness.
 *
 * The permission dialogs emit these boundaries as a date-only `YYYY-MM-DD` built from the
 * picker's **local** calendar date (`add-permission-dialog.ts`, `update-permission-dialog.ts`,
 * `share-external-dialog.ts` all do `${y}-${m}-${day}`). `new Date('2026-07-01')` parses that as
 * UTC midnight, so formatting it in a host zone west of UTC renders the day before: a user in Los
 * Angeles picks 1 July, saves, and the table reads 30 June. Formatting in UTC makes the calendar
 * date the user chose round-trip, and the locale still decides the ordering and the month name.
 *
 * `formatCompareDate` in `document-compare.utils.ts` already did this; these two did not, which is
 * the inconsistency rather than the rule.
 */
function formatAceInstant(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, { timeZone: 'UTC' });
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

  // `timeZone: 'UTC'` for the reason given on `formatAceInstant` above: these are calendar dates
  // the user picked, not instants, and formatting them in the host zone moves the day west of UTC.
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });

  if (begin && end) {
    return translate('permissions.time-frame.range', { begin: fmt(begin), end: fmt(end) });
  }
  if (end) {
    return translate('permissions.time-frame.until', { end: fmt(end) });
  }
  return translate('permissions.time-frame.from', { begin: fmt(begin as string) });
}
