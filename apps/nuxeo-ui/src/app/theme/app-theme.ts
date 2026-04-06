export type AppThemeId = 'nuxeo' | 'dark' | 'kawaii' | 'light';

export const APP_THEME_STORAGE_KEY = 'agentic_ui_color_theme';

export interface AppThemePreviewColors {
  sidebar: string;
  surface: string;
  header: string;
  accent: string;
  tile: string;
}

export interface AppThemeDefinition {
  id: AppThemeId;
  label: string;
  preview: AppThemePreviewColors;
}

export const APP_THEMES: readonly AppThemeDefinition[] = [
  {
    id: 'nuxeo',
    label: 'Nuxeo',
    preview: {
      sidebar: '#1a237e',
      surface: '#f5f5f5',
      header: '#e8eaf6',
      accent: '#2196f3',
      tile: '#dce3f5',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    preview: {
      sidebar: '#1e2a3a',
      surface: '#0d1117',
      header: '#161b22',
      accent: '#3d5afe',
      tile: '#21262d',
    },
  },
  {
    id: 'kawaii',
    label: 'Kawaii',
    preview: {
      sidebar: '#880e4f',
      surface: '#fce4ec',
      header: '#f8bbd9',
      accent: '#e91e63',
      tile: '#f5c6d6',
    },
  },
  {
    id: 'light',
    label: 'Light',
    preview: {
      sidebar: '#37474f',
      surface: '#eceff1',
      header: '#cfd8dc',
      accent: '#00bcd4',
      tile: '#b0bec5',
    },
  },
];

export function isAppThemeId(value: string | null): value is AppThemeId {
  return value === 'nuxeo' || value === 'dark' || value === 'kawaii' || value === 'light';
}

export function migrateLegacyThemeId(raw: string | null): AppThemeId | null {
  if (!raw) return null;
  const legacy: Record<string, AppThemeId> = {
    satori: 'nuxeo',
    azure: 'light',
    emerald: 'kawaii',
    violet: 'dark',
  };
  return legacy[raw] ?? null;
}
