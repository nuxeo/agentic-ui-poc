import { type DoCheck } from '@angular/core';
import type { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import * as i0 from "@angular/core";
/** A document the input offered: what it shows, and what `documentChange` reports. */
export interface NxsDocumentReference {
    readonly uid: string;
    readonly title: string;
    readonly type: string;
    readonly path: string;
}
/**
 * The query Web UI's `default_document_suggestion` page provider runs, for `term`: a full-text
 * prefix match on documents that are not hidden, not versions and not in the trash — optionally of
 * the given types. Every value is escaped, so a term or a type is text in the query, never NXQL.
 */
export declare function nxsDocumentSuggestionQuery(term: string, types?: readonly string[]): string;
/**
 * A field that finds a document as the user types and returns the uid of the one chosen — for a
 * property that points at another document, as Web UI's `nuxeo-document-suggestion` is: its value
 * is what the property stores, the uid, or the path with `idProperty="path"`.
 *
 * It searches the repository's full text from three characters, twenty results at a time, leaving
 * out hidden documents, versions and the trash, as Web UI does; `documentTypes` narrows it further.
 * Each result shows its type icon, title and path. A uid or path the form already holds is looked
 * up to show its title; one the user may not read, or that no longer exists, is kept and shown as it
 * is. Typing after a choice clears it, and text typed and not chosen is an `nxsChooseFromList` error
 * on the form. `documentChange` reports the whole document chosen, for a host that shows more.
 */
export declare class NxsDocumentReferenceInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** Offer only documents of these types, such as `['File', 'Note']`. Every type when empty. */
    readonly documentTypes: import("@angular/core").InputSignal<readonly string[]>;
    /** What the value holds, as Web UI's `idProperty`: the document's uid (the default) or its path. */
    readonly idProperty: import("@angular/core").InputSignal<"uid" | "path">;
    /** Help under the field, already translated. */
    readonly hint: import("@angular/core").InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The uid (or path) of the document chosen, or `null`. Two-way; a form control carries it too. */
    readonly value: import("@angular/core").ModelSignal<string | null>;
    /** The document the user chose, or `null` when the choice was cleared. */
    readonly documentChange: import("@angular/core").OutputEmitterRef<NxsDocumentReference | null>;
    protected readonly minChars = 3;
    private readonly api;
    private readonly announcer;
    private readonly translate;
    private readonly input;
    private readonly control;
    private readonly lookups;
    /** The value the field last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    /** The document the value names, once known: chosen here, or looked up from a stored uid. */
    protected readonly document: import("@angular/core").WritableSignal<NxsDocumentReference | null>;
    protected readonly text: import("@angular/core").WritableSignal<string>;
    protected readonly finder: import("../pickers/search-as-you-type").NxsSearchAsYouType<NxsDocumentReference>;
    protected readonly isDisabled: import("@angular/core").Signal<boolean>;
    protected readonly unmatched: import("@angular/core").Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    protected readonly displayWith: (document: NxsDocumentReference | string | null) => string;
    constructor();
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    protected choose(document: NxsDocumentReference | null): void;
    protected clear(): void;
    protected blurred(): void;
    private find;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocumentReferenceInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocumentReferenceInputComponent, "nxs-document-reference-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "documentTypes": { "alias": "documentTypes"; "required": false; "isSignal": true; }; "idProperty": { "alias": "idProperty"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "documentChange": "documentChange"; }, never, never, true, never>;
}
//# sourceMappingURL=document-reference-input.component.d.ts.map