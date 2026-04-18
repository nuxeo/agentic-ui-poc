/**
 * Nuxeo schema and document type definitions as returned by the
 * /nuxeo/api/v1/config/* REST endpoints.
 */

// ---------- Schema field definitions ----------

export type NuxeoFieldType =
  | 'string'
  | 'date'
  | 'integer'
  | 'long'
  | 'float'
  | 'double'
  | 'boolean'
  | 'blob'
  | 'complex'
  | 'string[]'
  | 'integer[]'
  | 'date[]'
  | 'blob[]'
  | 'complex[]';

export interface NuxeoFieldConstraint {
  name: string;
  parameters: Record<string, unknown>;
}

export interface NuxeoFieldDef {
  /** Full xpath, e.g. "dc:title" or "contract:details/amount" */
  xpath: string;
  /** Short field name, e.g. "title" */
  name: string;
  /** Parent schema prefix, e.g. "dc" */
  schemaPrefix: string;
  /** Data type */
  type: NuxeoFieldType;
  /** Sub-fields when type is 'complex' or 'complex[]' */
  fields?: NuxeoFieldDef[];
  /** Default value from schema definition */
  defaultValue?: unknown;
  /** Server-side constraints (required, pattern, min/max, etc.) */
  constraints: NuxeoFieldConstraint[];
}

// ---------- Schema definitions ----------

export interface NuxeoSchemaDefinition {
  name: string;
  prefix: string;
  fields: NuxeoFieldDef[];
}

// ---------- Document type definitions ----------

export interface NuxeoTypeDefinition {
  /** Document type name, e.g. "File", "Contract" */
  name: string;
  /** Parent type, e.g. "Document" */
  parent: string;
  /** Facets attached to this type */
  facets: string[];
  /** Schema names attached to this type (includes inherited) */
  schemas: string[];
  /** All field definitions (resolved from attached schemas) */
  fields: NuxeoFieldDef[];
}

// ---------- API response shapes ----------

/** Raw response from GET /nuxeo/api/v1/config/types/{type} */
export interface NuxeoTypeResponse {
  name: string;
  parent: string;
  facets: string[];
  schemas: {
    name: string;
    prefix: string;
    fields: Record<string, NuxeoFieldResponseEntry>;
  }[];
}

/** Individual field entry in the config API response */
export interface NuxeoFieldResponseEntry {
  type: string;
  constraints?: NuxeoFieldConstraint[];
  fields?: Record<string, NuxeoFieldResponseEntry>;
  defaultValue?: unknown;
}

/** Raw response from GET /nuxeo/api/v1/config/schemas/{schema} */
export interface NuxeoSchemaResponse {
  name: string;
  '@prefix': string;
  fields: Record<string, NuxeoFieldResponseEntry>;
}
