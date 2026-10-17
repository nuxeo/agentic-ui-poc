import { type DoCheck } from '@angular/core';
import type { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { type MatChipInputEvent } from '@angular/material/chips';
import * as i0 from "@angular/core";
/**
 * A field of tags: existing ones suggested as the user types, as Web UI's `nuxeo-tag-suggestion`
 * does, and a new one added with Enter, a comma or its "Add" entry. Each tag is a chip, removed
 * with its button or Backspace.
 *
 * A form control, not an editor of a document's tags: the value is the list of labels, and the host
 * saves it — through `TagService.addTag` and `removeTag`, for a document's tags. A label is trimmed,
 * and one the field already holds, whatever its case, is not added twice.
 */
export declare class NxsTagInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** Let the user add a tag no document has yet. On by default, as in Web UI. */
    readonly allowNew: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Help under the field, already translated. */
    readonly hint: import("@angular/core").InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The tags, in the order they were added. Two-way; a form control carries the same value. */
    readonly value: import("@angular/core").ModelSignal<readonly string[]>;
    protected readonly separators: readonly [13, 188];
    /** The input's id: the form field's label names the input through it. One per field. */
    protected readonly inputId: string;
    private readonly tags;
    private readonly announcer;
    private readonly translate;
    private readonly grid;
    private readonly trigger;
    private readonly control;
    protected readonly text: import("@angular/core").WritableSignal<string>;
    protected readonly finder: import("../pickers/search-as-you-type").NxsSearchAsYouType<string>;
    protected readonly isDisabled: import("@angular/core").Signal<boolean>;
    /** Suggestions the field does not hold yet. */
    protected readonly suggestions: import("@angular/core").Signal<string[]>;
    /** The typed text as a new tag, when it may be added and is not already there. */
    protected readonly addable: import("@angular/core").Signal<string | null>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatChipGrid` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: readonly string[] | null): void;
    registerOnChange(fn: (value: readonly string[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    /** No errors of its own: a typed tag is added or discarded, never left half-chosen. */
    validate(control: AbstractControl): ValidationErrors | null;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    /** Enter or a comma: add what was typed, unless the user is on a suggestion, which wins. */
    protected tokenEnd(event: MatChipInputEvent): void;
    protected add(tag: string): void;
    protected remove(tag: string): void;
    protected blurred(): void;
    private holds;
    private commit;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsTagInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsTagInputComponent, "nxs-tag-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "allowNew": { "alias": "allowNew"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=tag-input.component.d.ts.map