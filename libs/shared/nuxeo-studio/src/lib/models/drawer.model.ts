import type { ActivationFilter } from './action.model';

export interface DrawerItemConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  order: number;
  available: boolean;
  /** Route path for this drawer item */
  routePath: string;
  /** Optional: custom element tag name instead of route */
  customElement?: string;
  /** Activation filters */
  filters: ActivationFilter;
}

export function createDefaultDrawerItem(): DrawerItemConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    label: '',
    icon: 'folder',
    order: 100,
    available: true,
    routePath: '',
    filters: {},
  };
}
