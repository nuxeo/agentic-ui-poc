import * as i0 from "@angular/core";
/** One entry in an action menu. */
export interface NxsMenuAction {
    /** The action's registered ID; rendered as `data-action-id`. */
    readonly id: string;
    /** What the entry says, already translated. */
    readonly label: string;
    /** An optional Material icon ligature. Decorative. */
    readonly icon?: string;
    /** Shown but not selectable — the action's enabled rule said no. */
    readonly disabled?: boolean;
}
/**
 * An icon button that opens a menu of actions — the renderer for an action slot such as
 * `contextMenu`.
 *
 * Presentational: the host resolves its slot's descriptors into entries (labels translated, enabled
 * rules evaluated) and runs the action `selected` names, so the library takes no dependency on the
 * extensions barrel. With no entries it renders nothing; a trigger that opens an empty menu is a
 * control that does nothing.
 */
export declare class NxsActionMenuComponent {
    /** The entries, in display order. */
    readonly actions: import("@angular/core").InputSignal<readonly NxsMenuAction[]>;
    /**
     * The trigger's accessible name and tooltip, already translated — "More actions". A blank one is
     * the caller's mistake, and it falls back to the library's own "More actions" rather than hiding
     * the entries or leaving an icon button with no name.
     */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The trigger's Material icon ligature. */
    readonly icon: import("@angular/core").InputSignal<string>;
    /** The entry the user chose. Never a disabled one. */
    readonly selected: import("@angular/core").OutputEmitterRef<NxsMenuAction>;
    /** The label as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly ownLabel: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsActionMenuComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsActionMenuComponent, "nxs-action-menu", never, { "actions": { "alias": "actions"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, never, never, true, never>;
}
//# sourceMappingURL=action-menu.component.d.ts.map