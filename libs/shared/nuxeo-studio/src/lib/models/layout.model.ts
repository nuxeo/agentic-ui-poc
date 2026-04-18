/**
 * Layout configuration models.
 *
 * A LayoutConfig describes how a form should be rendered for a given
 * document type and mode (create / edit / view). The Layout Engine
 * consumes these definitions at runtime.
 */

export type LayoutMode = 'create' | 'edit' | 'view' | 'metadata' | 'import';

export type WidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'datetime'
  | 'directory'
  | 'select'
  | 'radio'
  | 'user'
  | 'group'
  | 'usergroup'
  | 'document'
  | 'blob'
  | 'htmleditor'
  | 'tag'
  | 'datatable'
  | 'complex'
  | 'list'
  | 'hidden';

// ---------- Visibility conditions ----------

export interface FieldVisibilityCondition {
  /** XPath of the field this condition depends on */
  field: string;
  /** Operator for comparison */
  operator: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty';
  /** Value to compare against (unused for empty/notEmpty) */
  value?: unknown;
}

// ---------- Validation ----------

export type ValidatorType =
  | 'required'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'crossField'
  | 'custom';

export interface FieldValidator {
  type: ValidatorType;
  /** Error message shown when validation fails */
  message: string;
  /** Regex pattern string (for 'pattern' validator) */
  pattern?: string;
  /** Numeric bound (for min/max/minLength/maxLength) */
  param?: number;
  /**
   * Cross-field: xpath of the other field to compare against.
   * The `operator` from FieldVisibilityCondition is reused for the comparison.
   */
  crossFieldXpath?: string;
  crossFieldOperator?: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte';
  /**
   * Custom validator: a function name that will be looked up from the
   * pluggable ValidatorRegistry at runtime.
   */
  customValidatorName?: string;
}

// ---------- Field widget definition ----------

export interface FieldWidgetConfig {
  /** Nuxeo property xpath, e.g. "dc:title", "contract:details/amount" */
  xpath: string;
  /** Widget type to render */
  widget: WidgetType;
  /** Display label (falls back to schema field name if not set) */
  label?: string;
  /** Whether the field is required in create/edit mode */
  required?: boolean;
  /** Placeholder text for input widgets */
  placeholder?: string;
  /** Whether the field is read-only even in edit mode */
  readOnly?: boolean;
  /** Allow multiple values (for directory, tag, user widgets) */
  multiple?: boolean;
  /** Directory name (for 'directory' and 'select' widgets) */
  directory?: string;
  /** Minimum value (for 'number' widget) */
  min?: number;
  /** Maximum value (for 'number' widget) */
  max?: number;
  /** Max length (for 'text' / 'textarea' widgets) */
  maxLength?: number;
  /** Number of rows (for 'textarea' widget) */
  rows?: number;
  /** Accepted file types (for 'blob' widget), e.g. ".pdf,.docx" */
  accept?: string;
  /** CSS class to apply to this widget's host */
  cssClass?: string;
  /** Width hint: 'full', 'half', 'third' */
  width?: 'full' | 'half' | 'third';
  /** Conditional visibility rules */
  visibleWhen?: FieldVisibilityCondition[];
  /** Cascading dependency — re-evaluate when this field changes */
  dependsOn?: string;
  /** Sub-fields for 'complex' or 'datatable' widgets */
  fields?: FieldWidgetConfig[];
  /** Column definitions for 'datatable' widget */
  columns?: DataTableColumnDef[];
  /** Extra widget-specific properties */
  properties?: Record<string, unknown>;
  /** Validators beyond simple `required` */
  validators?: FieldValidator[];
}

// ---------- Data table column ----------

export interface DataTableColumnDef {
  xpath: string;
  label: string;
  widget?: WidgetType;
  sortable?: boolean;
  width?: string;
}

// ---------- Extension points (slots) ----------

export interface ExtensionPointConfig {
  /** Unique slot name, e.g. "document-actions", "before-form" */
  name: string;
  /** Position within the section: before or after the fields */
  position: 'before' | 'after';
}

// ---------- Layout block reference ----------

export interface LayoutBlockRef {
  /**
   * The registered block name. At render-time, the Layout Engine looks up
   * the `LayoutBlock` by this name and inlines its fields.
   */
  blockName: string;
  /** Override the block label */
  label?: string;
}

// ---------- Layout block (reusable field group) ----------

export interface LayoutBlock {
  /** Unique block name for registration/lookup */
  name: string;
  /** Display label */
  label: string;
  /** Fields in this block */
  fields: FieldWidgetConfig[];
}

// ---------- Layout section ----------

export interface LayoutSection {
  /** Section heading */
  label: string;
  /** Whether the section starts collapsed */
  collapsed?: boolean;
  /** CSS class on the section container */
  cssClass?: string;
  /** Number of columns in this section (1, 2, or 3) */
  columns?: 1 | 2 | 3;
  /** Fields in this section */
  fields: FieldWidgetConfig[];
  /** Named layout blocks to inline into this section */
  blocks?: LayoutBlockRef[];
  /** Extension point slots in this section */
  extensionPoints?: ExtensionPointConfig[];
}

// ---------- Full layout config ----------

export interface LayoutConfig {
  /** Nuxeo document type this layout applies to */
  docType: string;
  /** Form mode */
  mode: LayoutMode;
  /** Ordered sections */
  sections: LayoutSection[];
  /** Global extension points rendered outside sections */
  extensionPoints?: ExtensionPointConfig[];
}

// ---------- Layout registry key ----------

export function layoutKey(docType: string, mode: LayoutMode): string {
  return `${docType}::${mode}`;
}
