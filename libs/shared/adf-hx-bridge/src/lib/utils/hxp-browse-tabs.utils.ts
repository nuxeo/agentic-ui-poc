export type HxpBrowseTabId =
  'view' | 'permissions' | 'properties' | 'versions' | 'history' | 'trash';

export const HXP_BROWSE_TABS: ReadonlyArray<{
  id: HxpBrowseTabId;
  labelKey: string;
  label: string;
}> = [
  { id: 'view', labelKey: 'hxp.tab.view', label: 'View' },
  { id: 'permissions', labelKey: 'hxp.tab.permissions', label: 'Permissions' },
  // Properties and Versions are per-**document**, not per-folder: both act on the row selected
  // in View rather than on the folder being browsed. See the selection guard in
  // `browse-adf-hx-poc.html` — without it Versions would always show the folder's own single
  // "current version" and look like a working feature that answers nothing.
  { id: 'properties', labelKey: 'hxp.tab.properties', label: 'Properties' },
  { id: 'versions', labelKey: 'hxp.tab.versions', label: 'Versions' },
  { id: 'history', labelKey: 'hxp.tab.history', label: 'History' },
  { id: 'trash', labelKey: 'hxp.tab.trash', label: 'Trash' },
];
