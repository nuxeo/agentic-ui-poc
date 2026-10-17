import { type DoCheck } from '@angular/core';
import type { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { type MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as i0 from "@angular/core";
/**
 * A date field: typed, or chosen from Material's calendar — the thin wrapper over the Material
 * datepicker the application's date fields share.
 *
 * A typed date is read in the order the user's locale writes dates — `03/04/2026` is 3 April in
 * French and 4 March in American English — where Material's native adapter reads every one as
 * American. A host that provides its own date adapter, other than Material's native one, keeps it.
 * The calendar's labels are translated. Text that is not a date, or a date outside `min` and `max`,
 * shows an error with an example in the locale's format and is an error on the form
 * (`nxsDateParse`, `nxsDateMin`, `nxsDateMax`); the value is then `null`.
 */
export declare class NxsDateInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The earliest date allowed, or `null`. */
    readonly min: import("@angular/core").InputSignal<Date | null>;
    /** The latest date allowed, or `null`. */
    readonly max: import("@angular/core").InputSignal<Date | null>;
    /** Help under the field, already translated. */
    readonly hint: import("@angular/core").InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The date, at local midnight, or `null`. Two-way; a form control carries the same value. */
    readonly value: import("@angular/core").ModelSignal<Date | null>;
    private readonly adapter;
    private readonly formats;
    private readonly input;
    private readonly dateInput;
    /** The date the field last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    private readonly control;
    /** What the user typed, while it is not a date the field holds. */
    private readonly typed;
    protected readonly isDisabled: import("@angular/core").Signal<boolean>;
    /** Why the typed text or the date is refused, if it is. */
    protected readonly problem: import("@angular/core").Signal<"parse" | "min" | "max" | null>;
    /** A date written the way the locale writes dates, with a day above 12 so the order shows. */
    protected readonly example: import("@angular/core").Signal<string>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: Date | null): void;
    registerOnChange(fn: (value: Date | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    protected formatted(date: unknown): string;
    /**
     * The raw text, on each key. The datepicker emits `dateInput` only when its date changes, so text
     * that is not a date, typed into an empty field, reaches the picker only here.
     */
    protected typing(event: Event): void;
    /** Each key typed, and a date chosen from the calendar: the datepicker has parsed the text. */
    protected changed(event: MatDatepickerInputEvent<unknown>): void;
    protected blurred(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDateInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDateInputComponent, "nxs-date-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=date-input.component.d.ts.map