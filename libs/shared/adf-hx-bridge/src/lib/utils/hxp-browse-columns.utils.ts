export interface HxpBrowseColumnDef {
  key: string;
  label: string;
  visible: boolean;
}

export const HXP_BROWSE_ALL_COLUMNS: HxpBrowseColumnDef[] = [
  { key: 'title', label: 'Title', visible: true },
  { key: 'type', label: 'Type', visible: false },
  { key: 'modified', label: 'Modified', visible: true },
  { key: 'lastContributor', label: 'Last Contributor', visible: true },
  { key: 'state', label: 'State', visible: false },
  { key: 'version', label: 'Version', visible: false },
  { key: 'created', label: 'Created', visible: false },
  { key: 'author', label: 'Author', visible: false },
  { key: 'nature', label: 'Nature', visible: false },
  { key: 'coverage', label: 'Coverage', visible: false },
  { key: 'subjects', label: 'Subjects', visible: false },
  { key: 'flags', label: 'Flags', visible: false },
];

const STORAGE_KEY = 'browse_column_settings';

export function loadHxpBrowseColumnSettings(): HxpBrowseColumnDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const keys = JSON.parse(stored) as string[];
      return HXP_BROWSE_ALL_COLUMNS.map((col) => ({ ...col, visible: keys.includes(col.key) }));
    }
  } catch {
    /* use defaults */
  }
  return HXP_BROWSE_ALL_COLUMNS.map((col) => ({ ...col }));
}

export function saveHxpBrowseColumnSettings(columns: HxpBrowseColumnDef[]): void {
  const visibleKeys = columns.filter((c) => c.visible).map((c) => c.key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleKeys));
}
