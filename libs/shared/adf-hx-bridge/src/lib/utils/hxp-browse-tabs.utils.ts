export type HxpBrowseTabId = 'view' | 'permissions' | 'history' | 'trash';

/**
 * The folder tabs, matching production browse.
 *
 * Properties and Versions were tabs here until 2026-09-23. Both belong to a single document
 * rather than to the folder being browsed, and production browse keeps them on the document
 * page, which a row click already opens.
 */
export const HXP_BROWSE_TABS: ReadonlyArray<{
  id: HxpBrowseTabId;
  labelKey: string;
  label: string;
}> = [
  { id: 'view', labelKey: 'hxp.tab.view', label: 'View' },
  { id: 'permissions', labelKey: 'hxp.tab.permissions', label: 'Permissions' },
  { id: 'history', labelKey: 'hxp.tab.history', label: 'History' },
  { id: 'trash', labelKey: 'hxp.tab.trash', label: 'Trash' },
];
