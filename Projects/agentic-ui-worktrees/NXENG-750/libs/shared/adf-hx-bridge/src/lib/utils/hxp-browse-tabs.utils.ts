export type HxpBrowseTabId =
  'view' | 'permissions' | 'properties' | 'versions' | 'history' | 'trash';

export const HXP_BROWSE_TABS: ReadonlyArray<{ id: HxpBrowseTabId; label: string }> = [
  { id: 'view', label: 'View' },
  { id: 'permissions', label: 'Permissions' },
  // Properties and Versions are per-**document**, not per-folder: both act on the row selected
  // in View rather than on the folder being browsed. See the selection guard in
  // `browse-adf-hx-poc.html` — without it Versions would always show the folder's own single
  // "current version" and look like a working feature that answers nothing.
  { id: 'properties', label: 'Properties' },
  { id: 'versions', label: 'Versions' },
  { id: 'history', label: 'History' },
  { id: 'trash', label: 'Trash' },
];
