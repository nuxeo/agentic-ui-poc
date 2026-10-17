import * as i0 from "@angular/core";
/** One control on a document toolbar, already resolved by the host. */
export interface NxsToolbarAction {
    /** The action's registered ID; rendered as `data-action-id`. */
    readonly id: string;
    /**
     * What the control says, already translated. An icon button's accessible name starts with it
     * and goes on with its tooltip when that says more.
     */
    readonly label: string;
    /** A Material icon ligature. Decorative; an inline control without one shows its label. */
    readonly icon?: string;
    /** Hover and focus text, already translated. Falls back to `label`. */
    readonly tooltip?: string | null;
    /** Shown but not runnable — the action's enabled rule said no. */
    readonly disabled?: boolean;
    /** Drawn in its "on" colour, as the padlock of a locked document is. */
    readonly active?: boolean;
    /** Behind the "More actions" menu rather than inline. */
    readonly overflow?: boolean;
}
/**
 * The action row of a document page — Web UI's `nuxeo-actions-menu` in the document header.
 *
 * Presentational: the host resolves its slot's descriptors (labels translated, rules and enabled
 * rules evaluated, tooltips chosen) and runs the action `selected` names, so the library takes no
 * dependency on the extensions barrel. Inline entries are icon buttons that stay focusable while
 * disabled, so their tooltip — "Locked by Jane on 3 May" — is reachable from the keyboard; the rest
 * sit behind one "More actions" button. Content projected into it renders before the actions.
 */
export declare class NxsDocumentToolbarComponent {
    /** Every entry, in display order; `overflow` decides which group each one is in. */
    readonly actions: import("@angular/core").InputSignal<readonly NxsToolbarAction[]>;
    /**
     * The group's accessible name, already translated. Blank falls back to the library's own
     * "Document actions".
     */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The menu button's accessible name and tooltip. Blank falls back to "More actions". */
    readonly moreLabel: import("@angular/core").InputSignal<string>;
    /** The entry the user ran. Never a disabled one. */
    readonly selected: import("@angular/core").OutputEmitterRef<NxsToolbarAction>;
    protected readonly inline: import("@angular/core").Signal<NxsToolbarAction[]>;
    protected readonly overflow: import("@angular/core").Signal<NxsToolbarAction[]>;
    protected readonly ownLabel: import("@angular/core").Signal<string>;
    protected readonly ownMoreLabel: import("@angular/core").Signal<string>;
    /** A tooltip only when there is one to show: Material renders an empty one as a blank bubble. */
    protected tooltipOf(action: NxsToolbarAction): string;
    /** What the tooltip adds to the label, if anything — "Locked by Jane on 3 May" on Unlock. */
    protected extraOf(action: NxsToolbarAction): string;
    /**
     * An icon button's accessible name: its label, then what its tooltip adds, so a keyboard or
     * screen-reader user hears the lock owner a mouse user reads.
     */
    protected nameOf(action: NxsToolbarAction): string;
    /**
     * Inline buttons are `disabledInteractive`, so a click on a disabled one still arrives here and
     * is refused here.
     */
    protected run(action: NxsToolbarAction): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocumentToolbarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocumentToolbarComponent, "nxs-document-toolbar", never, { "actions": { "alias": "actions"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "moreLabel": { "alias": "moreLabel"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=document-toolbar.component.d.ts.map