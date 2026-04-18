import { Type } from '@angular/core';
import { NuxeoFieldType } from './schema.model';
import { WidgetType } from './layout.model';

/**
 * Descriptor that the WidgetRegistry uses to resolve a field/widget
 * type combination to a concrete Angular component class.
 */
export interface WidgetDescriptor {
  /** Widget type identifier */
  type: WidgetType;
  /** Angular component class that renders this widget */
  component: Type<unknown>;
  /** Human-readable name shown in tooling / diagnostics */
  label: string;
  /** Which schema field types this widget can handle */
  supportedFieldTypes: NuxeoFieldType[];
}

/**
 * Common input/output contract that every widget component must satisfy.
 * Widget components receive these as Angular inputs and emit changes.
 */
export interface NxWidgetContext {
  /** Nuxeo xpath for this field, e.g. "dc:title" */
  xpath: string;
  /** Current value read from the document properties */
  value: unknown;
  /** Rendering mode */
  mode: import('./layout.model').LayoutMode;
  /** Whether the field is mandatory */
  required: boolean;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Read-only override (field is not editable even in edit mode) */
  readOnly: boolean;
  /** Allow multiple values */
  multiple: boolean;
  /** Directory name (for directory/select widgets) */
  directory?: string;
  /** Minimum value (number widgets) */
  min?: number;
  /** Maximum value (number widgets) */
  max?: number;
  /** Max length (text / textarea) */
  maxLength?: number;
  /** Textarea rows */
  rows?: number;
  /** Accepted file types (blob widget) */
  accept?: string;
  /** Whether the field is disabled (e.g. dependent field with unmet condition) */
  disabled: boolean;
  /** Sub-field definitions (complex / datatable) */
  fields?: import('./layout.model').FieldWidgetConfig[];
  /** Extra widget-specific properties */
  properties?: Record<string, unknown>;
  /** Validation error messages for this field */
  validationErrors?: string[];
}

/**
 * Default field type → widget type mapping.
 * Used by the auto-generation engine when no explicit layout exists.
 */
export const DEFAULT_WIDGET_MAP: Record<NuxeoFieldType, WidgetType> = {
  string: 'text',
  date: 'date',
  integer: 'number',
  long: 'number',
  float: 'number',
  double: 'number',
  boolean: 'checkbox',
  blob: 'blob',
  complex: 'complex',
  'string[]': 'tag',
  'integer[]': 'list',
  'date[]': 'list',
  'blob[]': 'blob',
  'complex[]': 'datatable',
};
