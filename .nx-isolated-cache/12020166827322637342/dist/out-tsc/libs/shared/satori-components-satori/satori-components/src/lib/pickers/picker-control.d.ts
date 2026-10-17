import { type Provider, type Type } from '@angular/core';
import { type AbstractControl, type ValidationErrors } from '@angular/forms';
/**
 * Provides a picker as the value accessor and a validator of the form control on its element —
 * `ngModel`, `formControl` or `formControlName` — so the form gets the picker's value and also
 * its own errors, such as text typed and never chosen.
 */
export declare function nxsPickerProviders(picker: () => Type<unknown>): Provider[];
/**
 * The part of a picker that talks to a form. Without a form every call here is a no-op and the
 * picker's `value` model carries the value; with one, it keeps the callbacks the form registers
 * and the control the form validates, so the picker can show the form's `required` error too.
 */
export declare class NxsPickerControl<T> {
    /** The user has left the field at least once. */
    readonly touched: import("@angular/core").WritableSignal<boolean>;
    /** The form disabled the control. */
    readonly formDisabled: import("@angular/core").WritableSignal<boolean>;
    private control;
    private onChange;
    private onTouched;
    private onValidatorChange;
    registerOnChange(fn: (value: T) => void): void;
    registerOnTouched(fn: () => void): void;
    registerOnValidatorChange(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    /** The picker's `validate`: remembers the control, and answers with the picker's own errors. */
    validate(control: AbstractControl, own: ValidationErrors | null): ValidationErrors | null;
    /** The picker's own errors changed: the form validates again. */
    revalidate(): void;
    /** The user changed the value. */
    changed(value: T): void;
    /** The user left the field. */
    blurred(): void;
    /** Touched here or in the form — `markAllAsTouched()` on submit, for example. */
    wasTouched(): boolean;
    /** The form's validators, or the picker's own, reject the value. */
    formInvalid(): boolean;
    /** The form's `required` error, or `required` given to the picker, on an empty value. */
    missing(required: boolean, empty: boolean): boolean;
}
//# sourceMappingURL=picker-control.d.ts.map