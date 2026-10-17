import { NxsTabBodyDirective, type NxsTab } from './tab-body.directive';
import * as i0 from "@angular/core";
/**
 * The tab strip of a document page — Web UI's `nuxeo-document-page` view tabs.
 *
 * Renders the tabs the host resolved, in order, and every body from the one template the host marks
 * with `nxsTabBody`, so a tab a manifest adds renders through the same template as a packaged one.
 * Selection is by index, two-way (`[(selectedIndex)]`), so the host can switch tabs itself, as the
 * Publications count does; `selectedTabChange` also names the tab by ID, which stays right when a
 * manifest hides or reorders tabs.
 */
export declare class NxsTabsComponent {
    /** The tabs, in display order. */
    readonly tabs: import("@angular/core").InputSignal<readonly NxsTab[]>;
    /** The tab list's accessible name, already translated. Optional. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The selected tab's position. Two-way. */
    readonly selectedIndex: import("@angular/core").ModelSignal<number>;
    /** The tab the user (or the host) selected, by ID. */
    readonly selectedTabChange: import("@angular/core").OutputEmitterRef<NxsTab>;
    protected readonly body: import("@angular/core").Signal<NxsTabBodyDirective | undefined>;
    protected readonly ownLabel: import("@angular/core").Signal<string>;
    private readonly host;
    constructor();
    protected select(index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsTabsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsTabsComponent, "nxs-tabs", never, { "tabs": { "alias": "tabs"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "selectedIndex": { "alias": "selectedIndex"; "required": false; "isSignal": true; }; }, { "selectedIndex": "selectedIndexChange"; "selectedTabChange": "selectedTabChange"; }, ["body"], never, true, never>;
}
//# sourceMappingURL=tabs.component.d.ts.map