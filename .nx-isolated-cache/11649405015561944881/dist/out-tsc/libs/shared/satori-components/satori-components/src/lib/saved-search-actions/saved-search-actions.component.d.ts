import * as i0 from "@angular/core";
/**
 * The actions on the search being shown — Web UI's `nuxeo-saved-search-actions`.
 *
 * Offers Save as whenever there is something to save, and, on an open saved search the user may
 * change, Save (once its filters have changed), Rename, Share and Delete. Whether the user may change
 * it is the server's answer: the saved search's `WriteProperties` permission, read when it opens. A
 * search shared read-only can still be saved as a copy. It emits what was chosen; the host asks for
 * names and confirmations and sends the requests.
 */
export declare class NxsSavedSearchActionsComponent {
    /** The saved search open now, or an empty string for none. */
    readonly savedSearchId: import("@angular/core").InputSignal<string>;
    /** Whether the filters differ from the open saved search's. */
    readonly dirty: import("@angular/core").InputSignal<boolean>;
    /** Whether any filter is set: with no saved search open, the only thing Save as can save. */
    readonly hasFilters: import("@angular/core").InputSignal<boolean>;
    /** Save the filters as a new saved search. */
    readonly saveAs: import("@angular/core").OutputEmitterRef<void>;
    /** Save the filters into the open saved search. */
    readonly save: import("@angular/core").OutputEmitterRef<void>;
    /** Rename the open saved search. */
    readonly rename: import("@angular/core").OutputEmitterRef<void>;
    /** Share the open saved search. */
    readonly share: import("@angular/core").OutputEmitterRef<void>;
    /** Delete the open saved search. */
    readonly remove: import("@angular/core").OutputEmitterRef<void>;
    private readonly documents;
    /**
     * Whether the user may change the open saved search: `true` only once the server has said so, so
     * Save, Rename, Share and Delete stay hidden while it is asked and when it cannot answer.
     */
    protected readonly canEdit: import("@angular/core").Signal<boolean>;
    protected readonly isSaved: import("@angular/core").Signal<boolean>;
    protected readonly showSaveAs: import("@angular/core").Signal<boolean>;
    protected readonly showSave: import("@angular/core").Signal<boolean>;
    protected readonly showMenu: import("@angular/core").Signal<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSavedSearchActionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSavedSearchActionsComponent, "nxs-saved-search-actions", never, { "savedSearchId": { "alias": "savedSearchId"; "required": false; "isSignal": true; }; "dirty": { "alias": "dirty"; "required": false; "isSignal": true; }; "hasFilters": { "alias": "hasFilters"; "required": false; "isSignal": true; }; }, { "saveAs": "saveAs"; "save": "save"; "rename": "rename"; "share": "share"; "remove": "remove"; }, never, never, true, never>;
}
//# sourceMappingURL=saved-search-actions.component.d.ts.map