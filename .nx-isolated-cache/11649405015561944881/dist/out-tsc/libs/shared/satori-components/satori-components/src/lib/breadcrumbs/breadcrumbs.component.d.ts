import type { NxsBreadcrumbItem, NxsBreadcrumbsInputs } from '../primitives';
import * as i0 from "@angular/core";
/** One entry on the trail as drawn: an item, or the "…" button that holds the folded ones. */
type TrailEntry = {
    readonly kind: 'item';
    readonly item: NxsBreadcrumbItem;
    readonly index: number;
} | {
    readonly kind: 'overflow';
};
/**
 * A breadcrumb trail — the Material implementation of `nxs.primitives.breadcrumbs`.
 *
 * It stays on one line. When the trail is wider than its box, the items after the first fold into
 * a "…" menu, furthest from the current page first, as Satori's do. The first stays while it fits
 * beside the "…" and the current page; in a box too narrow for that it folds too. The current page
 * always stays, its label cut short rather than hidden. A router item needs the host to provide
 * the router, as `routerLink` always does.
 */
export declare class NxsBreadcrumbsComponent implements NxsBreadcrumbsInputs {
    /**
     * The trail, outermost first. An item with `routerLink` navigates in the app, one with `href` is a
     * plain link, and one with neither is text — the current page, when it is the last.
     */
    readonly items: import("@angular/core").InputSignal<readonly NxsBreadcrumbItem[]>;
    /**
     * The navigation landmark's accessible name, already translated, such as "Breadcrumbs". Blank, or
     * only whitespace or zero-width characters, leaves the landmark unnamed rather than named " ".
     */
    readonly label: import("@angular/core").InputSignal<string>;
    protected readonly name: import("@angular/core").Signal<string>;
    private readonly host;
    private readonly destroyRef;
    /** The items folded into the "…" menu, as last measured. */
    private readonly fold;
    protected readonly hiddenItems: import("@angular/core").Signal<NxsBreadcrumbItem[]>;
    protected readonly entries: import("@angular/core").Signal<readonly TrailEntry[]>;
    constructor();
    protected linkKind(item: NxsBreadcrumbItem): 'router' | 'href' | 'text';
    /** The last measurement, kept within a trail that may have shortened since. */
    private foldFor;
    private measure;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsBreadcrumbsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsBreadcrumbsComponent, "nxs-breadcrumbs", never, { "items": { "alias": "items"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=breadcrumbs.component.d.ts.map