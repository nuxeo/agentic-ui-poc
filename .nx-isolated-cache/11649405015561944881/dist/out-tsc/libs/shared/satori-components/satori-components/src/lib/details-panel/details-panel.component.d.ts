import * as i0 from "@angular/core";
/** One view of a details panel — Properties, Comments, Activity — already resolved by the host. */
export interface NxsDetailsPanelTab {
    readonly id: string;
    /** What the tab says, already translated. */
    readonly label: string;
}
/**
 * The side panel of a document page — Web UI's `nuxeo-document-page` side pane, with its
 * Comments and Activity tabs, here with Properties beside them.
 *
 * It owns the frame: a header naming the document with a close button, a strip of ARIA tabs, and
 * one tab panel holding whatever the host projects for the selected view. Which views exist (Web
 * UI offers Comments only on a `Commentable` document) and what each shows are the host's.
 */
export declare class NxsDetailsPanelComponent {
    private readonly element;
    private readonly uid;
    private readonly tabButtons;
    /** The header text — usually the document's title or file name. */
    readonly heading: import("@angular/core").InputSignal<string>;
    /** The panel's accessible name, already translated. Blank falls back to `heading`. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The views, in order. */
    readonly tabs: import("@angular/core").InputSignal<readonly NxsDetailsPanelTab[]>;
    /** The selected view's ID. Two-way; one that is not in `tabs` selects the first. */
    readonly selected: import("@angular/core").ModelSignal<string>;
    /** The close button's accessible name. Blank falls back to "Close details". */
    readonly closeLabel: import("@angular/core").InputSignal<string>;
    /** The close button was pressed. The host decides what closing means. */
    readonly closed: import("@angular/core").OutputEmitterRef<void>;
    protected readonly regionLabel: import("@angular/core").Signal<string | null>;
    protected readonly ownCloseLabel: import("@angular/core").Signal<string>;
    protected readonly activeId: import("@angular/core").Signal<string>;
    protected readonly panelId: string;
    protected tabId(id: string): string;
    protected select(tab: NxsDetailsPanelTab): void;
    /** The ARIA tabs pattern: arrows move and select (automatic activation), Home and End jump. */
    protected onKeydown(event: KeyboardEvent, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDetailsPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDetailsPanelComponent, "nxs-details-panel", never, { "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "tabs": { "alias": "tabs"; "required": true; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "closeLabel": { "alias": "closeLabel"; "required": false; "isSignal": true; }; }, { "selected": "selectedChange"; "closed": "closed"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=details-panel.component.d.ts.map