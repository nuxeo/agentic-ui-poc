export type DashboardWidgetType =
  | 'recent-documents'
  | 'tasks'
  | 'favorites'
  | 'collections'
  | 'saved-searches'
  | 'analytics'
  | 'custom';

export interface DashboardWidgetConfig {
  id: string;
  type: DashboardWidgetType;
  label: string;
  icon: string;
  /** Grid position */
  row: number;
  col: number;
  /** Size in grid cells */
  width: number;
  height: number;
  /** Widget-specific config */
  properties: Record<string, unknown>;
  available: boolean;
}

export interface DashboardConfig {
  id: string;
  name: string;
  /** Grid columns */
  columns: number;
  widgets: DashboardWidgetConfig[];
}

export function createDefaultDashboard(): DashboardConfig {
  return {
    id: crypto.randomUUID(),
    name: 'Default Dashboard',
    columns: 3,
    widgets: [
      {
        id: crypto.randomUUID(),
        type: 'recent-documents',
        label: 'Recently Updated',
        icon: 'update',
        row: 0,
        col: 0,
        width: 2,
        height: 1,
        properties: { pageSize: 10 },
        available: true,
      },
      {
        id: crypto.randomUUID(),
        type: 'tasks',
        label: 'Pending Tasks',
        icon: 'assignment',
        row: 0,
        col: 2,
        width: 1,
        height: 1,
        properties: {},
        available: true,
      },
      {
        id: crypto.randomUUID(),
        type: 'favorites',
        label: 'Favorites',
        icon: 'star',
        row: 1,
        col: 0,
        width: 1,
        height: 1,
        properties: {},
        available: true,
      },
      {
        id: crypto.randomUUID(),
        type: 'collections',
        label: 'Collections',
        icon: 'library_books',
        row: 1,
        col: 1,
        width: 1,
        height: 1,
        properties: {},
        available: true,
      },
    ],
  };
}
