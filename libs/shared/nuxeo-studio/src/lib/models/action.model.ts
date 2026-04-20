/**
 * Configuration models for custom document actions/buttons.
 *
 * Mirrors the Nuxeo Studio Designer button configuration:
 *   Identity → Element Binding → Attributes → Activation Filters
 */

export type ActionSlot =
  | 'BLOB_ACTIONS'
  | 'COLLECTION_ACTIONS'
  | 'DOCUMENT_ACTIONS'
  | 'DOCUMENT_CREATE_ACTIONS'
  | 'DOCUMENT_MORE_ACTIONS'
  | 'FILE_UPLOAD_ACTIONS'
  | 'PUBLISH_PAGES'
  | 'RESULTS_ACTIONS'
  | 'RESULTS_SELECTION_ACTIONS'
  | 'TRASH_RESULTS_SELECTION_ACTIONS';

export type ButtonType = 'operation' | 'custom';

// ── Element Binding ──

export interface ElementBinding {
  element: string;
  icon: string;
  label: string;
  tooltip: string;
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
  showLabel: boolean;
  operation: string;
  input: string;
  syncIndexing: boolean;
}

// ── Attributes ──

export interface ActionAttributes {
  params: string;
  response: string;
  notification: string;
  download: boolean;
  event: string;
  detail: string;
  async: boolean;
  pollInterval: number;
  errorLabel: string;
  custom: Record<string, string>;
}

// ── Activation Filters ──

export interface ActivationFilter {
  docTypes?: string[];
  permissions?: string[];
  facets?: string[];
  excludeFacets?: string[];
  states?: string[];
  excludeStates?: string[];
  schemas?: string[];
  groups?: string[];
  isAdmin?: boolean;
  expression?: string;
}

// ── Full Action Config ──

export interface ActionConfig {
  id: string;
  /** Identity */
  name: string;
  available: boolean;
  buttonType: ButtonType;
  /** Slot placement */
  slot: ActionSlot;
  order: number;
  /** Element Binding */
  binding: ElementBinding;
  /** Attributes */
  attributes: ActionAttributes;
  /** Activation Filters */
  filters: ActivationFilter;
}

/** Creates a blank ActionConfig with Studio Designer defaults. */
export function createDefaultAction(): ActionConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    available: true,
    buttonType: 'operation',
    slot: 'DOCUMENT_ACTIONS',
    order: 1,
    binding: {
      element: 'nuxeo-operation-button',
      icon: '',
      label: '',
      tooltip: '',
      tooltipPosition: 'bottom',
      showLabel: false,
      operation: '',
      input: '[[document]]',
      syncIndexing: false,
    },
    attributes: {
      params: '',
      response: 'null',
      notification: '',
      download: false,
      event: 'operation-executed',
      detail: '',
      async: false,
      pollInterval: 1000,
      errorLabel: '',
      custom: {},
    },
    filters: {},
  };
}
