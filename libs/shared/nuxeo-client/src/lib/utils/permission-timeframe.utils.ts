/** Formats ACE begin/end timestamps for permission tables. */
export function formatPermissionTimeFrame(
  begin: string | null,
  end: string | null,
  // A free function has no injector. Callers pass `(key) => translate.instant(key)`; the
  // default keeps the English so a caller that has not been updated still reads sensibly
  // rather than rendering a raw key.
  translate: (key: string) => string = () => 'Permanent',
): string {
  if (!begin && !end) {
    return translate('permissions.time-frame.permanent');
  }

  const beginLabel = begin ? new Date(begin).toLocaleString() : '—';
  const endLabel = end ? new Date(end).toLocaleString() : '—';
  return `${beginLabel} – ${endLabel}`;
}
