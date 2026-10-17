import { formatPermissionTimeFrame } from './permission-timeframe.utils';
/** Formats ACE begin/end timestamps for permission tables. */
export function principalPermissionTimeFrameLabel(row, translate, locale) {
    return formatPermissionTimeFrame(row.begin, row.end, translate, locale);
}
/** Maps a principal permission row to the profile/settings table shape. */
export function principalPermissionToLocalRow(row, translate, locale) {
    return {
        documentTitle: row.documentTitle,
        documentPath: row.documentPath,
        right: row.permission,
        timeFrame: principalPermissionTimeFrameLabel(row, translate, locale),
        grantedBy: row.grantedBy ?? '—',
    };
}
//# sourceMappingURL=principal-permission-display.js.map