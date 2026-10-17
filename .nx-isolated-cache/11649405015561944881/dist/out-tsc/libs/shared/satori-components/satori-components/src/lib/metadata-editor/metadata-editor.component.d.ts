import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { ErrorStateMatcher } from '@angular/material/core';
import { DirectoryEntry, directoryPickerLabel, groupL10nChildrenByParent, l10nEntryLabel } from '@nuxeo/satori-platform/nuxeo-client';
import type { NxsHeadingLevel } from '../heading-level';
import { NxsTab } from '../tabs/tab-body.directive';
import { FieldError, FieldKind } from './metadata-editor-form';
import { NxsEditorDisplay, NxsEditorField, NxsEditorFieldType, NxsEditorSection } from './metadata-editor.model';
import * as i0 from "@angular/core";
/** A field the editor renders, with its label still a key when the editor owns the field. */
interface EditorField extends NxsEditorField {
    readonly labelKey?: string;
}
/**
 * The form that edits a document's properties — Web UI's `nuxeo-document-edit` and
 * `nuxeo-document-create` layouts, schema-driven.
 *
 * It owns the Dublin Core fields every document has (title, description, nature, subjects,
 * coverage, expiry), then renders the `sections` it is given: one control per field, chosen from
 * the field's type, with the schema's constraints checked as the user types.
 *
 * The host owns the buttons. On Save it calls `validate()`, which shows every error, announces how
 * many fields need a correction and moves focus to the first; when that passes, it sends
 * `dirtyProperties()` for an edit or `properties()` for a create. Errors the server reports go
 * back through `showServerErrors()`.
 */
export declare class NxsMetadataEditorComponent {
    /** The type's fields beyond Dublin Core, from its layout. A field Dublin Core already has is skipped. */
    readonly sections: import("@angular/core").InputSignal<readonly NxsEditorSection[]>;
    /** Show `sections` one after another under headings, or as tabs. */
    readonly display: import("@angular/core").InputSignal<NxsEditorDisplay>;
    /** The current property values. A new object resets the form and discards what was typed. */
    readonly values: import("@angular/core").InputSignal<Readonly<Record<string, unknown>>>;
    /** Show the Dublin Core fields. Off for a type that has no `dublincore` schema. */
    readonly dublinCore: import("@angular/core").InputSignal<boolean>;
    /** While saving: every control is read-only. */
    readonly disabled: import("@angular/core").InputSignal<boolean>;
    /** The level of the section headings, one below the dialog or page title. */
    readonly headingLevel: import("@angular/core").InputSignal<NxsHeadingLevel>;
    /** The tab strip's accessible name in tabs display. Empty uses the default. */
    readonly tabsLabel: import("@angular/core").InputSignal<string>;
    /** Every value passes its field's constraints, or not. Emitted when that changes. */
    readonly validChange: import("@angular/core").OutputEmitterRef<boolean>;
    private readonly directories;
    private readonly translate;
    private readonly destroyRef;
    private readonly injector;
    private readonly host;
    /** The datepickers' adapter, from `provideNxsDateAdapter()`: date controls hold its dates. */
    private readonly dateAdapter;
    protected readonly id: string;
    protected readonly form: FormGroup<Record<string, AbstractControl<any, any, any>>>;
    /** Bumped whenever controls are added or removed, so the template reads the new set. */
    protected readonly structure: import("@angular/core").WritableSignal<number>;
    protected readonly submitted: import("@angular/core").WritableSignal<boolean>;
    protected readonly invalidCount: import("@angular/core").WritableSignal<number>;
    protected readonly selectedTab: import("@angular/core").WritableSignal<number>;
    protected readonly panelSearch: import("@angular/core").WritableSignal<string>;
    private readonly vocabularies;
    private readonly requested;
    private builtFrom;
    /** Never shown: stands in for a control of an unexpected shape so a binding never throws. */
    private readonly detached;
    private readonly detachedList;
    private valid;
    /**
     * The server's message per field, with the value it refused. Held as a validator rather than
     * set once with `setErrors`, because re-enabling the form after a save re-runs every validator
     * and would drop it; it lapses as soon as the value differs from the one refused.
     */
    private readonly serverMessages;
    /** Server messages arrived while the form was disabled: reveal them once it is enabled. */
    private revealOnEnable;
    protected readonly standardFields: import("@angular/core").Signal<readonly EditorField[]>;
    protected readonly typeSections: import("@angular/core").Signal<readonly NxsEditorSection[]>;
    protected readonly tabs: import("@angular/core").Signal<readonly NxsTab[]>;
    private readonly fields;
    protected readonly errorMatcher: ErrorStateMatcher;
    protected readonly l10nEntryLabel: typeof l10nEntryLabel;
    protected readonly directoryPickerLabel: typeof directoryPickerLabel;
    constructor();
    /**
     * Shows every error, announces how many fields need a correction and focuses the first.
     * Answers whether the form can be saved.
     */
    validate(): boolean;
    /** The values the user changed, by xpath, as the document properties take them. */
    dirtyProperties(): Record<string, unknown>;
    /** Every value in the form, by xpath — what a new document is created with. */
    properties(): Record<string, unknown>;
    /**
     * Puts the server's messages on the fields they name, by xpath, until the value changes.
     * Answers the messages for fields the form does not show, for the host to report another way.
     */
    showServerErrors(errors: Readonly<Record<string, string>>): string[];
    protected kindOf(definition: NxsEditorFieldType, depth: number): FieldKind;
    protected controlFor(field: EditorField): AbstractControl | null;
    protected asControl(control: AbstractControl): FormControl;
    protected asArray(control: AbstractControl): FormArray;
    /** A complex field's sub-fields, labelled from their names. */
    protected subFields(definition: NxsEditorFieldType): readonly EditorField[];
    protected subControl(group: AbstractControl, name: string): AbstractControl | null;
    protected showError(control: AbstractControl): boolean;
    protected errorOf(control: AbstractControl): FieldError | null;
    /** The message for an error, naming the field so it reads on its own in the error summary's wake. */
    protected errorText(error: FieldError, label: string): string;
    protected search(event: Event): void;
    protected isRequired(definition: NxsEditorFieldType): boolean;
    protected inputType(definition: NxsEditorFieldType): 'number' | 'text';
    protected step(definition: NxsEditorFieldType): string | null;
    protected readOnlyText(control: AbstractControl): string;
    protected flatOptions(directory: string): readonly DirectoryEntry[];
    protected groupedOptions(directory: string): ReturnType<typeof groupL10nChildrenByParent>;
    protected usesL10n(directory: string): boolean;
    /** A vocabulary value's label, `Parent/Child` for a hierarchical one. The stored ID until loaded. */
    protected vocabularyLabel(directory: string, id: unknown): string;
    protected listValue(control: AbstractControl): readonly unknown[];
    /** Each vocabulary panel opens with an empty search. */
    protected panelToggled(): void;
    protected clearValue(control: AbstractControl, multiple: boolean): void;
    protected removeItem(control: AbstractControl, index: number): void;
    protected addItem(control: AbstractControl, definition: NxsEditorFieldType, event: MatChipInputEvent): void;
    protected addComplexItem(control: AbstractControl, definition: NxsEditorFieldType, depth: number): void;
    protected removeComplexItem(control: AbstractControl, index: number): void;
    protected selectTab(index: number): void;
    private build;
    private applyDisabled;
    private heldServerMessage;
    /** `enable()` reaches every control; a file or an unsupported shape stays read-only. */
    private lockReadOnly;
    private loadVocabularies;
    private collect;
    private statusChanged;
    private countInvalid;
    /** Opens the tab holding the first invalid field, then focuses it once it has rendered. */
    private revealFirstInvalid;
    /** A tab's content attaches a render after the tab is selected, so the field may not exist yet. */
    private focusFirstInvalid;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsMetadataEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsMetadataEditorComponent, "nxs-metadata-editor", never, { "sections": { "alias": "sections"; "required": false; "isSignal": true; }; "display": { "alias": "display"; "required": false; "isSignal": true; }; "values": { "alias": "values"; "required": false; "isSignal": true; }; "dublinCore": { "alias": "dublinCore"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "tabsLabel": { "alias": "tabsLabel"; "required": false; "isSignal": true; }; }, { "validChange": "validChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=metadata-editor.component.d.ts.map