import { type SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { type NxsBreadcrumbItem, type NxsBreadcrumbsInputs } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
/**
 * `nxs.primitives.breadcrumbs` on Satori's `sat-breadcrumbs`, which collapses a long trail.
 *
 * Needs `provideSatori()` for the chevron icon, and Satori's `sat.*` catalogue loaded into
 * ngx-translate for the "Show more breadcrumbs" button, and for the landmark's name when `label`
 * is blank.
 */
export declare class NxsSatoriBreadcrumbsComponent implements NxsBreadcrumbsInputs {
    readonly items: import("@angular/core").InputSignal<readonly NxsBreadcrumbItem[]>;
    /** The landmark's accessible name, already translated. Blank keeps Satori's own name. */
    readonly label: import("@angular/core").InputSignal<string>;
    protected readonly satoriItems: import("@angular/core").Signal<SatBreadcrumbsItem[]>;
    private readonly host;
    /** The name Satori last wrote on its landmark, and the one this component left there. */
    private satoriName;
    private shownName;
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSatoriBreadcrumbsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSatoriBreadcrumbsComponent, "nxs-satori-breadcrumbs", never, { "items": { "alias": "items"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=satori-breadcrumbs.component.d.ts.map