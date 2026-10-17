import { type MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { type MatChipInputEvent } from '@angular/material/chips';
import * as i0 from "@angular/core";
/** One entry of the suggestion list: an existing tag, or the typed text as a new one. */
interface NxsTagOption {
    readonly label: string;
    readonly isNew: boolean;
}
/**
 * A document's tags, added and removed in place — Web UI's `nuxeo-tag-suggestion` with
 * `allow-new-tags`, as the document page uses it.
 *
 * It tags the document itself through `TagService`. As in Web UI:
 *
 * - Typing suggests existing tags through the `Tag.Suggestion` operation, and offers the typed text
 *   as a new tag when no tag matches it exactly. Enter adds what is highlighted.
 * - Each change is saved at once; there is no Save button. Nuxeo normalises a label, so the chip
 *   shows the label it stored, and a toast says what changed.
 * - `readOnly` shows the tags without the box or the remove buttons. Web UI's rule for it is
 *   `canTagDocument`: Write on the document itself, not a version or a proxy.
 *
 * Changes are sent one at a time, in order, so an answer can never overwrite a later one.
 * `tagsChange` hands the document's tags to the host after each saved change.
 */
export declare class NxsTagEditorComponent {
    private readonly tagService;
    private readonly translate;
    private readonly toast;
    /** The document to tag. */
    readonly documentUid: import("@angular/core").InputSignal<string>;
    /** The document's tags as loaded — `nxtag:tags`' labels. */
    readonly tags: import("@angular/core").InputSignal<readonly string[]>;
    /** Shows the tags only, with no box and no remove buttons. */
    readonly readOnly: import("@angular/core").InputSignal<boolean>;
    /** The document's tags after each saved change, as Nuxeo stored them. */
    readonly tagsChange: import("@angular/core").OutputEmitterRef<readonly string[]>;
    protected readonly id: string;
    private readonly boxRef;
    private readonly trigger;
    /** The tags as last known: the input, then each answer from the server. */
    protected readonly saved: import("@angular/core").WritableSignal<readonly string[]>;
    protected readonly adding: import("@angular/core").WritableSignal<readonly string[]>;
    protected readonly removing: import("@angular/core").WritableSignal<ReadonlySet<string>>;
    protected readonly term: import("@angular/core").WritableSignal<string>;
    private readonly suggestions;
    /** The chips: the saved tags less those being removed. Tags being added show after them. */
    protected readonly shown: import("@angular/core").Signal<string[]>;
    protected readonly options: import("@angular/core").Signal<readonly NxsTagOption[]>;
    private readonly requests;
    private readonly terms;
    constructor();
    protected typed(value: string): void;
    /** A suggestion picked with the mouse, or highlighted when Enter was pressed. */
    protected picked(event: MatAutocompleteSelectedEvent): void;
    /** Enter in the box. Ignored while a suggestion is highlighted: picking it adds the tag. */
    protected entered(event: MatChipInputEvent): void;
    protected remove(tag: string): void;
    private add;
    private send;
    private settle;
    private failure;
    private clearBox;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsTagEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsTagEditorComponent, "nxs-tag-editor", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "tags": { "alias": "tags"; "required": false; "isSignal": true; }; "readOnly": { "alias": "readOnly"; "required": false; "isSignal": true; }; }, { "tagsChange": "tagsChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=tag-editor.component.d.ts.map