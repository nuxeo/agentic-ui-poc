import * as i0 from "@angular/core";
/**
 * Previous and Next for a list the server pages, with the range on screen.
 *
 * Next/previous rather than numbered, because Nuxeo knows a listing's total only when it fits on
 * one page: `@children` reports a negative count otherwise, and `isNextPageAvailable` is the only
 * reliable fact. So Next follows `hasNextPage`, Previous follows the page index, and "of N" shows
 * only when `totalSize` is a real, non-negative total.
 *
 * It renders nothing while everything fits on one page — a first page with no next page.
 */
export declare class NxsPagerComponent {
    /** The page on screen, from zero. */
    readonly pageIndex: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** How many items a full page holds. */
    readonly pageSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** How many items the page on screen holds. */
    readonly itemCount: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Every item across every page; negative when the server did not count them. */
    readonly totalSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Whether the server has another page. */
    readonly hasNextPage: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Disables both buttons while a page loads. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /**
     * The navigation landmark's accessible name, already translated. Blank, or only whitespace or
     * zero-width characters, names it "Pages".
     */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The page index to load: one less or one more than `pageIndex`. */
    readonly pageChange: import("@angular/core").OutputEmitterRef<number>;
    protected readonly visible: import("@angular/core").Signal<boolean>;
    protected readonly first: import("@angular/core").Signal<number>;
    protected readonly last: import("@angular/core").Signal<number>;
    protected readonly knownTotal: import("@angular/core").Signal<number | null>;
    protected readonly canPrevious: import("@angular/core").Signal<boolean>;
    protected readonly canNext: import("@angular/core").Signal<boolean>;
    protected readonly ownLabel: import("@angular/core").Signal<string>;
    previous(): void;
    next(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsPagerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsPagerComponent, "nxs-pager", never, { "pageIndex": { "alias": "pageIndex"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "itemCount": { "alias": "itemCount"; "required": false; "isSignal": true; }; "totalSize": { "alias": "totalSize"; "required": false; "isSignal": true; }; "hasNextPage": { "alias": "hasNextPage"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, { "pageChange": "pageChange"; }, never, never, true, never>;
}
//# sourceMappingURL=pager.component.d.ts.map