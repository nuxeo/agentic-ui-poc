import type { PrincipalPermissionRow } from '../models/principal-permissions.model';
import type { LocalPermissionRow } from '../services/settings.service';

/** Formats ACE begin/end timestamps for permission tables. */
export function principalPermissionTimeFrameLabel(row: PrincipalPermissionRow): string {
  if (!row.begin && !row.end) {
    return 'Permanent';
  }
  const begin = row.begin ? new Date(row.begin).toLocaleString() : '—';
  const end = row.end ? new Date(row.end).toLocaleString() : '—';
  return `${begin} – ${end}`;
}

/** Maps a principal permission row to the profile/settings table shape. */
export function principalPermissionToLocalRow(row: PrincipalPermissionRow): LocalPermissionRow {
  const pathSuffix = row.documentPath ? ` (${row.documentPath})` : '';
  return {
    on: `${row.documentTitle}${pathSuffix}`,
    right: row.permission,
    timeFrame: principalPermissionTimeFrameLabel(row),
    grantedBy: row.grantedBy ?? '—',
  };
}
