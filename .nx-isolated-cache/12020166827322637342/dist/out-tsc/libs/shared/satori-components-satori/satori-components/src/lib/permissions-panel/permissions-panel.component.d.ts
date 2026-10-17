import { type UserGroupSuggestion } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsAceRow, type NxsPermissionChange, type NxsPermissionRefusal, type NxsPermissionsSnapshot } from './permissions-model';
import { type NxsSaveOutcome } from './permissions-panel.service';
import * as i0 from "@angular/core";
/** The ID the panel is registered under, so a customer library can re-register a replacement. */
export declare const NXS_PERMISSIONS_PANEL_ID = "nxs.components.permissionsPanel";
type LoadError = 'denied' | 'not-found' | 'failed';
/** One row of the local table: an ACE the server holds, or one the user is adding. */
interface LocalItem {
    readonly key: string;
    /** The server's entry, absent for a staged addition. */
    readonly row: NxsAceRow | null;
    readonly principal: string;
    /** The principal's display name, or empty when the server sent none. */
    readonly principalLabel: string;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
    readonly state: 'unchanged' | 'changed' | 'removed' | 'added';
    readonly granted: boolean;
    /** Why the entry cannot be edited here, as a catalogue key; `null` when it can. */
    readonly lockedReason: string | null;
    /** Permissions this entry holds that the server's lists do not offer, so its select can show them. */
    readonly extraPermissions: readonly string[];
}
interface EditorState {
    readonly mode: 'add' | 'edit';
    readonly item: LocalItem | null;
}
/**
 * A document's permissions: local and inherited ACEs, blocked inheritance, and each ACE's time
 * frame and status, with add, edit and remove over the server's list for the document type, Nuxeo's
 * standard permissions and every other permission the server reports to the user.
 *
 * **Every write addresses one ACE.** Changes are staged and applied on Save as one
 * `Document.AddPermission`, `ReplacePermission` or `RemovePermission`-by-id per change, so an
 * entry the user did not touch is never written. Before writing, the ACL is read again and a
 * change that cannot be written faithfully refuses the whole save, naming each entry and why;
 * afterwards it is read once more and any change the server does not show is reported. See
 * `refusalsFor` and `unconfirmedChanges`.
 *
 * **Hiding a control is not a security control.** The panel offers editing when the read says the
 * user holds `WriteSecurity` or `Everything` and the document is not a version, and Nuxeo checks
 * every write regardless.
 *
 * Its chrome is translated through ngx-translate under `satori-components.permissions-panel.*`,
 * and permission names under `permissions.right.*`, both in the application's catalogue.
 * External-user sharing is not shown here; the host owns that flow.
 */
export declare class NxsPermissionsPanelComponent {
    /** The uid of the document whose permissions to show. */
    readonly documentId: import("@angular/core").InputSignal<string>;
    /**
     * Called after a write that may have changed the document's ACL, so a host showing other
     * ACL-derived content — the external-user shares this panel leaves to it — can read it again.
     */
    readonly permissionsChanged: import("@angular/core").InputSignal<(() => void) | null>;
    private readonly service;
    private readonly translate;
    private readonly locale;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    /** Starts every id the template sets, so two panels on one page never share one. */
    protected readonly idPrefix: string;
    protected readonly localColumns: string[];
    protected readonly inheritedColumns: string[];
    protected readonly otherColumns: string[];
    protected readonly snapshot: import("@angular/core").WritableSignal<NxsPermissionsSnapshot | null>;
    protected readonly loading: import("@angular/core").WritableSignal<boolean>;
    protected readonly loadError: import("@angular/core").WritableSignal<LoadError | null>;
    protected readonly saving: import("@angular/core").WritableSignal<boolean>;
    protected readonly outcome: import("@angular/core").WritableSignal<NxsSaveOutcome | null>;
    protected readonly inheritanceBusy: import("@angular/core").WritableSignal<boolean>;
    protected readonly inheritanceError: import("@angular/core").WritableSignal<string | null>;
    /** Staged changes: by ACE id for an existing entry, by a generated key for an addition. */
    protected readonly staged: import("@angular/core").WritableSignal<ReadonlyMap<string, NxsPermissionChange>>;
    private addCounter;
    /** Display names of staged additions, from the search suggestion the user picked. */
    private readonly addedLabels;
    protected readonly editor: import("@angular/core").WritableSignal<EditorState | null>;
    protected readonly editorPrincipal: import("@angular/core").WritableSignal<UserGroupSuggestion | null>;
    protected readonly editorQuery: import("@angular/core").WritableSignal<string>;
    protected readonly editorPermission: import("@angular/core").WritableSignal<string>;
    protected readonly editorDated: import("@angular/core").WritableSignal<boolean>;
    /** The time frame's days, at local midnight. */
    protected readonly editorBegin: import("@angular/core").WritableSignal<Date | null>;
    protected readonly editorEnd: import("@angular/core").WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly editorBeginField: import("@angular/core").Signal<unknown>;
    protected readonly editorEndField: import("@angular/core").Signal<unknown>;
    protected readonly editorSubmitted: import("@angular/core").WritableSignal<boolean>;
    protected readonly suggestions: import("@angular/core").WritableSignal<UserGroupSuggestion[]>;
    private readonly loads;
    private readonly searches;
    /**
     * Bumped whenever the document changes. A save or inheritance change still in flight finishes on
     * its own document, but its answer is dropped rather than shown on this one.
     */
    private generation;
    protected readonly loadErrorKey: import("@angular/core").Signal<string>;
    protected readonly canManage: import("@angular/core").Signal<boolean>;
    /**
     * False while a save or an inheritance change is in flight: a save replaces the staged changes
     * with those it did not send when it answers, so one staged after it started would be lost.
     */
    protected readonly editable: import("@angular/core").Signal<boolean>;
    protected readonly trackItem: (_index: number, item: LocalItem) => string;
    protected readonly pendingCount: import("@angular/core").Signal<number>;
    /** The permission groups every select offers, in the server's order. */
    protected readonly permissionGroups: import("@angular/core").Signal<{
        label: string;
        permissions: readonly string[];
    }[]>;
    private readonly offered;
    protected readonly localItems: import("@angular/core").Signal<LocalItem[]>;
    /** Permissions the entry being edited holds that the server's lists do not offer. */
    protected readonly editorExtraPermissions: import("@angular/core").Signal<readonly string[]>;
    protected readonly editorInvalidRange: import("@angular/core").Signal<boolean>;
    constructor();
    protected reload(): void;
    protected permissionLabel(permission: string): string;
    /** An ACE's time frame, from staged days or the server's instants alike. */
    protected timeFrame(begin: string | null, end: string | null): string;
    /** `principal — permission`, for refusal and failure lines. */
    protected entryLabel(principal: string, permission: string): string;
    protected serverMessage(error: unknown): string;
    protected isDenied(error: unknown): boolean;
    protected setPermission(item: LocalItem, permission: string): void;
    protected toggleRemove(item: LocalItem): void;
    protected dismissOutcome(): void;
    protected discard(): void;
    protected openAdd(): void;
    protected openEdit(item: LocalItem): void;
    protected closeEditor(): void;
    protected onPrincipalInput(value: string): void;
    protected onPrincipalSelected(suggestion: UserGroupSuggestion): void;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected displaySuggestion(suggestion: UserGroupSuggestion | string | null): string;
    protected applyEditor(): void;
    protected save(): void;
    protected toggleInheritance(): void;
    protected refusalReasonKey(refusal: NxsPermissionRefusal): string;
    protected failedEntry(outcome: Extract<NxsSaveOutcome, {
        kind: 'failed';
    }>): string;
    private clearStaged;
    private notifyChanged;
    private keepStaged;
    private load;
    private fromRow;
    /** Stages a replacement, or drops it when it would write the entry back unchanged. */
    private stageReplace;
    private updateAdd;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsPermissionsPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsPermissionsPanelComponent, "nxs-permissions-panel", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "permissionsChanged": { "alias": "permissionsChanged"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=permissions-panel.component.d.ts.map