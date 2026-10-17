import type { PrincipalPermissionRow } from '../models/principal-permissions.model';
import type { LocalPermissionRow } from '../services/settings.service';
/** Formats ACE begin/end timestamps for permission tables. */
export declare function principalPermissionTimeFrameLabel(row: PrincipalPermissionRow, translate: (key: string) => string, locale: string): string;
/** Maps a principal permission row to the profile/settings table shape. */
export declare function principalPermissionToLocalRow(row: PrincipalPermissionRow, translate: (key: string) => string, locale: string): LocalPermissionRow;
//# sourceMappingURL=principal-permission-display.d.ts.map