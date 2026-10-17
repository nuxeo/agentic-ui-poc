import { AbstractControl, FormGroup } from '@angular/forms';
import type { DateAdapter } from '@angular/material/core';
import { NxsEditorFieldType } from './metadata-editor.model';
/** Deeper complex fields are shown read-only: no schema shipped with Nuxeo nests further. */
export declare const MAX_COMPLEX_DEPTH = 4;
export type FieldKind = 'text' | 'number' | 'date' | 'boolean' | 'vocabulary' | 'list' | 'vocabulary-list' | 'complex' | 'complex-list' | 'read-only';
export declare const baseType: (definition: NxsEditorFieldType) => string;
export declare function fieldKind(definition: NxsEditorFieldType, depth?: number): FieldKind;
/** One complex list item, empty, for the "Add" button. */
export declare function newComplexItem(definition: NxsEditorFieldType, adapter: DateAdapter<unknown>, depth: number): FormGroup;
/**
 * The control for one field, holding its current value in the shape its form control edits. A
 * date field's value is a date as `adapter`, the datepicker's, holds dates: a JS `Date` for
 * Material's native adapter and date-fns, a Luxon `DateTime` for Luxon's.
 */
export declare function buildControl(definition: NxsEditorFieldType, value: unknown, adapter: DateAdapter<unknown>, depth?: number): AbstractControl;
/**
 * A control's value as the document property takes it. A date is an ISO 8601 instant whatever
 * `adapter`, the one the control was built with, holds dates as.
 */
export declare function propertyValue(definition: NxsEditorFieldType, control: AbstractControl, adapter: DateAdapter<unknown>, depth?: number, multiline?: boolean): unknown;
/** One error to show: a message key and what it interpolates, or the server's own message. */
export interface FieldError {
    readonly key: string;
    readonly params: Readonly<Record<string, unknown>>;
}
/** The error to show for a control, most fundamental first: one message at a time. */
export declare function firstError(control: AbstractControl): FieldError | null;
//# sourceMappingURL=metadata-editor-form.d.ts.map