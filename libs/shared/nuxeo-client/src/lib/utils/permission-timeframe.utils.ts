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
): string {
  if (!begin && !end) {
    return translate('permissions.time-frame.permanent');
  }

  const beginLabel = begin ? new Date(begin).toLocaleString() : '—';
  const endLabel = end ? new Date(end).toLocaleString() : '—';
  return `${beginLabel} – ${endLabel}`;
}
