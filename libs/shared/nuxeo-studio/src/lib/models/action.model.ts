/**
 * Configuration models for custom document actions/buttons.
 *
 * Mirrors the Nuxeo Web UI slot system (DOCUMENT_ACTIONS, BLOB_ACTIONS, etc.)
 * but stores configuration as JSON rather than Polymer HTML.
 */

export type ActionSlot =
  | 'DOCUMENT_ACTIONS'
  | 'DOCUMENT_MORE_ACTIONS'
  | 'BLOB_ACTIONS'
  | 'RESULTS_SELECTION_ACTIONS';

export interface ActionFilter {
  docTypes?: string[];
  permissions?: string[];
  facets?: string[];
  excludeFacets?: string[];
  states?: string[];
  excludeStates?: string[];
}

export interface ActionConfig {
  id: string;
  label: string;
  icon: string;
  tooltip?: string;
  operationId: string;
  operationParams?: Record<string, unknown>;
  slot: ActionSlot;
  order: number;
  filters: ActionFilter;
  confirmMessage?: string;
  successMessage?: string;
  enabled: boolean;
}
