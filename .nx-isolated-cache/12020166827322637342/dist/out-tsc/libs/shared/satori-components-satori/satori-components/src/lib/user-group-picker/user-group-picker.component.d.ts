import { type DoCheck } from '@angular/core';
import type { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import * as i0 from "@angular/core";
/** A user or a group, as the picker offers and returns it. */
export interface NxsPrincipal {
    /** The username or group name: what Nuxeo's permissions and workflows take. */
    readonly id: string;
    /** What the picker shows: the display name Nuxeo gives, or the id when there is none. */
    readonly label: string;
    readonly kind: 'user' | 'group';
    /** `user:<id>` or `group:<id>`, the form some Nuxeo operations take. */
    readonly prefixedId: string;
    readonly email?: string;
}
/** Whom the picker searches: Web UI's `searchType`. */
export type NxsPrincipalSearch = 'users-and-groups' | 'users' | 'groups';
/**
 * A field that finds a user or a group as the user types, and returns the one chosen — the picker
 * Add permission, sharing and workflow assignment use, as Web UI's `nuxeo-user-suggestion` is.
 *
 * It searches from three characters, Web UI's default, so a one-letter term does not list the
 * whole directory; set `minChars` for a smaller one. Typing after a choice clears it, so the value
 * is always a principal the server returned, never free text: text typed and not chosen is an
 * `nxsChooseFromList` error on the form. Use it with `ngModel` or a form control, or bind `value`
 * two-way.
 */
export declare class NxsUserGroupPickerComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** Whom to search: users and groups (the default), users only, or groups only. */
    readonly search: import("@angular/core").InputSignal<NxsPrincipalSearch>;
    /** Characters typed before the server is asked. Web UI's three by default. */
    readonly minChars: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Help under the field, already translated. */
    readonly hint: import("@angular/core").InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The principal chosen, or `null`. Two-way; a form control carries the same value. */
    readonly value: import("@angular/core").ModelSignal<NxsPrincipal | null>;
    private readonly input;
    private readonly documents;
    private readonly users;
    private readonly announcer;
    private readonly translate;
    private readonly control;
    /** What the input shows: the chosen principal's label, or what the user is typing. */
    protected readonly text: import("@angular/core").WritableSignal<string>;
    protected readonly finder: import("../pickers/search-as-you-type").NxsSearchAsYouType<NxsPrincipal>;
    protected readonly isDisabled: import("@angular/core").Signal<boolean>;
    /** Text typed and no principal chosen for it. */
    protected readonly unmatched: import("@angular/core").Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    protected readonly displayWith: (principal: NxsPrincipal | string | null) => string;
    constructor();
    /**
     * `MatInput` recomputes its error state only when its own input has a form control, and this
     * one has none — the form is on the picker — so the picker asks it to on every check.
     */
    ngDoCheck(): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    writeValue(value: NxsPrincipal | null): void;
    registerOnChange(fn: (value: NxsPrincipal | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    protected onInput(event: Event): void;
    protected choose(principal: NxsPrincipal | null): void;
    protected clear(): void;
    protected blurred(): void;
    private find;
    private announce;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsUserGroupPickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsUserGroupPickerComponent, "nxs-user-group-picker", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "search": { "alias": "search"; "required": false; "isSignal": true; }; "minChars": { "alias": "minChars"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=user-group-picker.component.d.ts.map