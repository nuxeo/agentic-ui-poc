/** Formats ACE begin/end timestamps for permission tables. */
export function formatPermissionTimeFrame(begin: string | null, end: string | null): string {
  if (!begin && !end) {
    return 'Permanent';
  }

  const beginLabel = begin ? new Date(begin).toLocaleString() : '—';
  const endLabel = end ? new Date(end).toLocaleString() : '—';
  return `${beginLabel} – ${endLabel}`;
}
