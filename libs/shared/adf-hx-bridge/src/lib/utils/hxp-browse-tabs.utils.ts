export type HxpBrowseTabId = 'view' | 'permissions' | 'versions' | 'history' | 'trash';

export const HXP_BROWSE_TABS: ReadonlyArray<{ id: HxpBrowseTabId; label: string }> = [
  { id: 'view', label: 'View' },
  { id: 'permissions', label: 'Permissions' },
  // Versions sits next to Permissions because both are per-document rather than per-folder:
  // this tab acts on the row selected in View, not on the folder being browsed. See the
  // selection guard in `browse-adf-hx-poc.html` — without it the tab would always show the
  // folder's own single "current version" and look like a working feature that answers
  // nothing.
  { id: 'versions', label: 'Versions' },
  { id: 'history', label: 'History' },
  { id: 'trash', label: 'Trash' },
];
