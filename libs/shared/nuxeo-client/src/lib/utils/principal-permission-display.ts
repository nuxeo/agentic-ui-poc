import type { PrincipalPermissionRow } from '../models/principal-permissions.model';
import type { LocalPermissionRow } from '../services/settings.service';
import { permissionRightLabel } from './permission-label.utils';
import { formatPermissionTimeFrame } from './permission-timeframe.utils';

/** Formats ACE begin/end timestamps for permission tables. */
export function principalPermissionTimeFrameLabel(
  row: Pick<PrincipalPermissionRow, 'begin' | 'end'>,
  translate: (key: string) => string,
  locale: string,
): string {
  return formatPermissionTimeFrame(row.begin, row.end, translate, locale);
}

/** Maps a Nuxeo permission identifier to its display label in permission tables. */
export function principalPermissionRightLabel(
  permission: string,
  translate: (key: string) => string,
): string {
  return permissionRightLabel(permission, translate);
}

/** Maps a principal permission row to the profile/settings table shape. */
export function principalPermissionToLocalRow(
  row: PrincipalPermissionRow,
  translate: (key: string) => string,
  locale: string,
): LocalPermissionRow {
  return {
    documentTitle: row.documentTitle,
    documentPath: row.documentPath,
    right: row.permission,
    timeFrame: principalPermissionTimeFrameLabel(row, translate, locale),
    grantedBy: row.grantedBy ?? '—',
  };
}
