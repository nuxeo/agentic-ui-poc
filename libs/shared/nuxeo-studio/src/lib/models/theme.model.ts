/**
 * A single CSS variable entry within a theme category.
 */
export interface ThemeCssVariable {
  name: string;
  value: string;
}

/**
 * A category grouping of CSS variables (e.g. "Nuxeo Branding colors", "App Header").
 */
export interface ThemeCssCategory {
  label: string;
  variables: ThemeCssVariable[];
}

/**
 * Full theme definition matching the Nuxeo Studio Designer structure.
 */
export interface ThemeDefinition {
  id: string;
  name: string;
  isCustom: boolean;
  isDefault: boolean;
  basedOn: string | null;
  categories: ThemeCssCategory[];
  logoUrl: string;
  backgroundUrl: string;
  screenshotUrl: string;
}

/** @deprecated — kept for backward-compat; migrate to ThemeDefinition */
export interface ThemeConfig {
  id: string;
  name: string;
  available: boolean;
  primaryColor: string;
  accentColor: string;
  warnColor: string;
  fontFamily: string;
  headerBackground: string;
  headerTextColor: string;
  sidebarBackground: string;
  logoUrl: string;
  customProperties: Record<string, string>;
}

/** @deprecated */
export function createDefaultTheme(): ThemeConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    available: true,
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    warnColor: '#f44336',
    fontFamily: 'Roboto, sans-serif',
    headerBackground: '#1976d2',
    headerTextColor: '#ffffff',
    sidebarBackground: '#fafafa',
    logoUrl: '',
    customProperties: {},
  };
}

function brandingVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-app-font': "'Inter', Arial, sans-serif",
    '--nuxeo-text-default': '#3a3a54',
    '--nuxeo-primary-color': '#0066ff',
    '--nuxeo-secondary-color': '#1f2b8f',
    '--nuxeo-page-background': '#f5f5f5',
    '--nuxeo-border': 'rgba(0, 0, 0, 0.15)',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'Nuxeo Branding colors',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function headerVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-app-header': 'var(--nuxeo-text-default)',
    '--nuxeo-app-header-background': '#fff',
    '--nuxeo-app-header-pill': '#ecf3f7',
    '--nuxeo-app-header-pill-hover': 'var(--nuxeo-primary-color)',
    '--nuxeo-app-header-pill-active': 'var(--nuxeo-secondary-color)',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'App Header',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function sidebarVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-sidebar-background': '#068826',
    '--nuxeo-sidebar-menu': 'rgba(255, 255, 255, 0.5)',
    '--nuxeo-sidebar-menu-hover': 'rgba(255, 255, 255, 1)',
    '--nuxeo-badge-background': '#fb6107',
    '--nuxeo-drawer-header': 'var(--nuxeo-text-default)',
    '--nuxeo-drawer-text': 'var(--nuxeo-text-default)',
    '--nuxeo-drawer-background': '#fff',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'App Sidebar & Drawers',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function quickSearchVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-quicksearch-text': 'var(--nuxeo-text-default)',
    '--nuxeo-quicksearch-background': '#fff',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'App Quick Search',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function tagVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-tag-background': 'rgba(0, 0, 0, 0.05)',
    '--nuxeo-tag-text': 'var(--nuxeo-text-default)',
    '--nuxeo-pill-filter-background': 'rgba(0, 0, 0, 0.05)',
    '--nuxeo-pill-filter-background-active': 'var(--nuxeo-secondary-color)',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'Tags & Pills',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function boxVars(overrides: Record<string, string> = {}): ThemeCssCategory {
  const defaults: Record<string, string> = {
    '--nuxeo-box': '#fff',
    '--nuxeo-table-header-background': '#fff',
    '--nuxeo-table-items-background': '#ffffff',
    '--nuxeo-grid-selected': 'var(--nuxeo-primary-color)',
  };
  const merged = { ...defaults, ...overrides };
  return {
    label: 'Boxes, Tables & Listings',
    variables: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

function makeTheme(
  id: string,
  name: string,
  isCustom: boolean,
  categoryOverrides: Record<string, Record<string, string>>,
): ThemeDefinition {
  return {
    id,
    name,
    isCustom,
    isDefault: name === 'default',
    basedOn: null,
    categories: [
      brandingVars(categoryOverrides['branding']),
      headerVars(categoryOverrides['header']),
      sidebarVars(categoryOverrides['sidebar']),
      quickSearchVars(categoryOverrides['quickSearch']),
      tagVars(categoryOverrides['tags']),
      boxVars(categoryOverrides['boxes']),
    ],
    logoUrl: '',
    backgroundUrl: '',
    screenshotUrl: '',
  };
}

export const BASE_THEME_NAMES = ['default', 'dark', 'light', 'kawaii'] as const;
export type BaseThemeName = (typeof BASE_THEME_NAMES)[number];

export function createBaseTheme(baseName: BaseThemeName): ThemeDefinition {
  switch (baseName) {
    case 'dark':
      return makeTheme(`builtin-dark`, 'darkTheme', false, {
        branding: {
          '--nuxeo-text-default': '#e0e0e0',
          '--nuxeo-primary-color': '#90caf9',
          '--nuxeo-secondary-color': '#64b5f6',
          '--nuxeo-page-background': '#121212',
          '--nuxeo-border': 'rgba(255, 255, 255, 0.12)',
        },
        header: {
          '--nuxeo-app-header': '#e0e0e0',
          '--nuxeo-app-header-background': '#1e1e1e',
          '--nuxeo-app-header-pill': '#333',
        },
        sidebar: {
          '--nuxeo-sidebar-background': '#1e1e1e',
          '--nuxeo-sidebar-menu': 'rgba(255, 255, 255, 0.5)',
          '--nuxeo-drawer-background': '#2c2c2c',
          '--nuxeo-drawer-header': '#e0e0e0',
          '--nuxeo-drawer-text': '#bbb',
        },
        quickSearch: {
          '--nuxeo-quicksearch-text': '#e0e0e0',
          '--nuxeo-quicksearch-background': '#2c2c2c',
        },
        tags: {
          '--nuxeo-tag-background': 'rgba(255, 255, 255, 0.08)',
          '--nuxeo-tag-text': '#e0e0e0',
          '--nuxeo-pill-filter-background': 'rgba(255, 255, 255, 0.08)',
        },
        boxes: {
          '--nuxeo-box': '#2c2c2c',
          '--nuxeo-table-header-background': '#333',
          '--nuxeo-table-items-background': '#2c2c2c',
        },
      });
    case 'light':
      return makeTheme('builtin-light', 'lightTheme', false, {
        branding: {
          '--nuxeo-primary-color': '#1565c0',
          '--nuxeo-secondary-color': '#0d47a1',
          '--nuxeo-page-background': '#ffffff',
        },
        header: {
          '--nuxeo-app-header-background': '#f5f5f5',
        },
        sidebar: {
          '--nuxeo-sidebar-background': '#e8eaf6',
          '--nuxeo-sidebar-menu': 'rgba(0, 0, 0, 0.5)',
          '--nuxeo-sidebar-menu-hover': 'rgba(0, 0, 0, 0.87)',
        },
      });
    case 'kawaii':
      return makeTheme('builtin-kawaii', 'kawaiiTheme', false, {
        branding: {
          '--nuxeo-primary-color': '#e91e63',
          '--nuxeo-secondary-color': '#ad1457',
          '--nuxeo-page-background': '#fce4ec',
          '--nuxeo-text-default': '#4a0e2a',
        },
        header: {
          '--nuxeo-app-header': '#4a0e2a',
          '--nuxeo-app-header-background': '#f8bbd0',
          '--nuxeo-app-header-pill': '#f48fb1',
        },
        sidebar: {
          '--nuxeo-sidebar-background': '#c2185b',
          '--nuxeo-sidebar-menu': 'rgba(255, 255, 255, 0.6)',
          '--nuxeo-badge-background': '#ff6f00',
          '--nuxeo-drawer-background': '#fce4ec',
        },
        tags: {
          '--nuxeo-tag-background': 'rgba(233, 30, 99, 0.1)',
          '--nuxeo-pill-filter-background': 'rgba(233, 30, 99, 0.1)',
        },
      });
    default:
      return makeTheme('builtin-default', 'defaultTheme', false, {});
  }
}

export function getAllBaseThemes(): ThemeDefinition[] {
  return BASE_THEME_NAMES.map((n) => createBaseTheme(n));
}

export function createCustomThemeFrom(name: string, baseName: BaseThemeName): ThemeDefinition {
  const base = createBaseTheme(baseName);
  return {
    ...base,
    id: crypto.randomUUID(),
    name,
    isCustom: true,
    isDefault: false,
    basedOn: baseName,
  };
}

export function themeToCSS(theme: ThemeDefinition): string {
  const lines: string[] = ['<custom-style>', '    <style is="custom-style">', '        html {'];

  for (const cat of theme.categories) {
    lines.push(`            /* ${cat.label} */`);
    for (const v of cat.variables) {
      lines.push(`            ${v.name}: ${v.value};`);
    }
    lines.push('');
  }

  lines.push('        }', '    </style>', '</custom-style>');
  return lines.join('\n');
}
