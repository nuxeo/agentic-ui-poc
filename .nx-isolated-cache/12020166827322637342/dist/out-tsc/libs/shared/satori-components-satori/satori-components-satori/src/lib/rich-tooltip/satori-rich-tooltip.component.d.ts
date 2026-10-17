import type { NxsRichTooltipInputs } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
/** `nxs.primitives.richTooltip` on Satori's rich tooltip, which opens on hover and focus. */
export declare class NxsSatoriRichTooltipComponent implements NxsRichTooltipInputs {
    readonly heading: import("@angular/core").InputSignal<string>;
    readonly content: import("@angular/core").InputSignal<string>;
    readonly triggerLabel: import("@angular/core").InputSignal<string>;
    readonly icon: import("@angular/core").InputSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSatoriRichTooltipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSatoriRichTooltipComponent, "nxs-satori-rich-tooltip", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "content": { "alias": "content"; "required": true; "isSignal": true; }; "triggerLabel": { "alias": "triggerLabel"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=satori-rich-tooltip.component.d.ts.map