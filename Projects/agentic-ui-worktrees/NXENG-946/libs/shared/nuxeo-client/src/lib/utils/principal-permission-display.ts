import type { PrincipalPermissionRow } from '../models/principal-permissions.model';
import type { LocalPermissionRow } from '../services/settings.service';
import { formatPermissionTimeFrame } from './permission-timeframe.utils';

/** Formats ACE begin/end timestamps for permission tables. */
export function principalPermissionTimeFrameLabel(row: PrincipalPermissionRow): string {
  return formatPermissionTimeFrame(row.begin, row.end);
}

/** Maps a principal permission row to the profile/settings table shape. */
export function principalPermissionToLocalRow(row: PrincipalPermissionRow): LocalPermissionRow {
  return {
    documentTitle: row.documentTitle,
    documentPath: row.documentPath,
    right: row.permission,
    timeFrame: principalPermissionTimeFrameLabel(row),
    grantedBy: row.grantedBy ?? '—',
  };
}
