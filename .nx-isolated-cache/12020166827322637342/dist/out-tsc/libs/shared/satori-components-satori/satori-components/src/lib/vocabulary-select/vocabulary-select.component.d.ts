import { type DoCheck } from '@angular/core';
import type { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import * as i0 from "@angular/core";
/** One entry the select offers: its id, what it shows, and the parent it is listed under. */
interface Entry {
    readonly id: string;
    readonly label: string;
}
interface EntryGroup {
    /** The parent's label; empty for a vocabulary with no hierarchy. */
    readonly label: string;
    readonly entries: readonly Entry[];
}
type Loaded = {
    readonly status: 'loading';
} | {
    readonly status: 'failed';
} | {
    readonly status: 'loaded';
    /** Every selectable entry, by id, with the label the field and its chips show. */
    readonly labels: ReadonlyMap<string, string>;
    readonly filter: (text: string) => readonly EntryGroup[];
};
/**
 * A field that chooses one entry, or several, from a Nuxeo vocabulary — Nature, Subjects, Coverage
 * or any directory — as Web UI's `nuxeo-directory-suggestion` does.
 *
 * It lists the whole vocabulary on focus and narrows it as the user types. A hierarchical one —
 * `l10nsubjects`, `l10ncoverage` — is listed under its parents, and a chosen child is stored and
 * shown as Web UI stores it: `europe/France`, labelled `Europe/France`. A parent with no children,
 * such as `antarctica`, is chosen as itself. With `multiple` each choice is a chip, removed with its button or
 * Backspace. The value is the entry's id, or a list of ids; an id the vocabulary no longer has is
 * kept and shown as it is, so opening a document never drops a value. Text typed and not chosen is
 * an `nxsChooseFromList` error on the form.
 */
export declare class NxsVocabularySelectComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The directory to choose from, such as `nature` or `l10ncoverage`. */
    readonly directory: import("@angular/core").InputSignal<string>;
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** Choose several entries; the value is then a list of ids. */
    readonly multiple: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Help under the field, already translated. */
    readonly hint: import("@angular/core").InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The id chosen, or `null`; with `multiple`, the ids chosen, in order. Two-way. */
    readonly value: import("@angular/core").ModelSignal<string | readonly string[] | null>;
    /** The input's id, in either mode: the form field's label names the input through it. */
    protected readonly inputId: string;
    private readonly directories;
    private readonly destroyRef;
    private readonly input;
    private readonly grid;
    private readonly control;
    private readonly loads;
    /** The value the picker last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    protected readonly loaded: import("@angular/core").WritableSignal<Loaded>;
    /** What the input shows: the chosen entry's label (single), or what the user is typing. */
    protected readonly text: import("@angular/core").WritableSignal<string>;
    /** The chosen ids, whichever mode. */
    protected readonly chosen: import("@angular/core").Signal<readonly string[]>;
    protected readonly isDisabled: import("@angular/core").Signal<boolean>;
    protected readonly groups: import("@angular/core").Signal<readonly EntryGroup[]>;
    /** Text typed and no entry chosen for it. */
    protected readonly unmatched: import("@angular/core").Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatInput` and `MatChipGrid` recompute their error state only with a form control of their own. */
    ngDoCheck(): void;
    writeValue(value: string | readonly string[] | null): void;
    registerOnChange(fn: (value: string | readonly string[] | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    /** The label the field and its chips show for an id: the entry's, or the id itself. */
    protected labelOf(id: string): string;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    protected opened(): void;
    protected choose(id: string): void;
    protected remove(id: string): void;
    protected clear(): void;
    protected blurred(): void;
    private commit;
    private reload;
    private load;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsVocabularySelectComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsVocabularySelectComponent, "nxs-vocabulary-select", never, { "directory": { "alias": "directory"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=vocabulary-select.component.d.ts.map