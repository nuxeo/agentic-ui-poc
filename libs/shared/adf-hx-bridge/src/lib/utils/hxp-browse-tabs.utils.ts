export type HxpBrowseTabId = 'view' | 'permissions' | 'history' | 'trash';

export const HXP_BROWSE_TABS: ReadonlyArray<{ id: HxpBrowseTabId; label: string }> = [
  { id: 'view', label: 'View' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'history', label: 'History' },
  { id: 'trash', label: 'Trash' },
];
