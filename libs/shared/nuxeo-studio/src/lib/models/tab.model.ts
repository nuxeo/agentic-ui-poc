import type { ActivationFilter } from './action.model';
import type { LayoutMode } from './layout.model';

export interface TabConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  order: number;
  available: boolean;
  /** Which layout mode content to show in this tab */
  contentMode: LayoutMode | 'custom';
  /** For custom content: reference to a custom element tag name */
  customElement?: string;
  /** Activation filters — same as buttons */
  filters: ActivationFilter;
}

export function createDefaultTab(): TabConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    label: '',
    icon: 'tab',
    order: 10,
    available: true,
    contentMode: 'view',
    filters: {},
  };
}
