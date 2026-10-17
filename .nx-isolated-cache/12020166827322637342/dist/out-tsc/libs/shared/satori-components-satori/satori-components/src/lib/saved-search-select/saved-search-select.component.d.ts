import { type SavedSearchOption } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** A saved search the user chose: its id and its title. */
export interface NxsSavedSearchChoice {
    readonly id: string;
    readonly title: string;
}
/**
 * The saved searches the user can open — the list at the top of Web UI's search form.
 *
 * Lists the saved searches the server returns for `pageProvider`: the user's own and those shared
 * with them. It reads the list when it is first opened and again when `refresh` changes, narrows it
 * as the user types, and emits the one chosen. Loading that search's filters is the host's job.
 */
export declare class NxsSavedSearchSelectComponent {
    /** The saved search open now, or an empty string for none. */
    readonly selectedId: import("@angular/core").InputSignal<string>;
    /** Its title, shown in the box. */
    readonly selectedTitle: import("@angular/core").InputSignal<string>;
    /** The page provider whose saved searches are listed. */
    readonly pageProvider: import("@angular/core").InputSignal<string>;
    /** Change it to read the list again — after a search is saved, renamed or deleted. */
    readonly refresh: import("@angular/core").InputSignal<number>;
    /** The user chose a saved search. */
    readonly selectedChange: import("@angular/core").OutputEmitterRef<NxsSavedSearchChoice>;
    private readonly searchService;
    private readonly destroyRef;
    protected readonly inputId: string;
    protected readonly text: import("@angular/core").WritableSignal<string>;
    protected readonly searches: import("@angular/core").WritableSignal<readonly SavedSearchOption[]>;
    protected readonly state: import("@angular/core").WritableSignal<"idle" | "loading" | "loaded">;
    /** The saved searches whose title contains what is typed, unless it is the open one's title. */
    protected readonly options: import("@angular/core").Signal<readonly SavedSearchOption[]>;
    constructor();
    /** Reads the list, unless it is loading or already read. */
    protected load(): void;
    protected onInput(value: string): void;
    protected choose(id: string): void;
    /** Puts the open search's title back when the box is left without a choice. */
    protected restore(): void;
    protected readonly display: (id: string | null) => string;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSavedSearchSelectComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSavedSearchSelectComponent, "nxs-saved-search-select", never, { "selectedId": { "alias": "selectedId"; "required": false; "isSignal": true; }; "selectedTitle": { "alias": "selectedTitle"; "required": false; "isSignal": true; }; "pageProvider": { "alias": "pageProvider"; "required": false; "isSignal": true; }; "refresh": { "alias": "refresh"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; }, never, never, true, never>;
}
//# sourceMappingURL=saved-search-select.component.d.ts.map