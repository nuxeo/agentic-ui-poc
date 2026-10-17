import type { NxsTagColor, NxsTagInputs } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
/** `nxs.primitives.tag` on Satori's `sat-category-tag`. */
export declare class NxsSatoriTagComponent implements NxsTagInputs {
    readonly label: import("@angular/core").InputSignal<string>;
    readonly color: import("@angular/core").InputSignal<NxsTagColor>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSatoriTagComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSatoriTagComponent, "nxs-satori-tag", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=satori-tag.component.d.ts.map