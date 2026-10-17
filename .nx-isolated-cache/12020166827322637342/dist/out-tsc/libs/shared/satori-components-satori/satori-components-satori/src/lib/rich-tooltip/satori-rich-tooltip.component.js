import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SatRichTooltip, SatRichTooltipContent, SatRichTooltipTitle, SatRichTooltipTrigger, } from '@hylandsoftware/satori-ui/rich-tooltip';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
/** `nxs.primitives.richTooltip` on Satori's rich tooltip, which opens on hover and focus. */
export class NxsSatoriRichTooltipComponent {
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    content = input.required(...(ngDevMode ? [{ debugName: "content" }] : []));
    triggerLabel = input.required(...(ngDevMode ? [{ debugName: "triggerLabel" }] : []));
    icon = input('info', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = function NxsSatoriRichTooltipComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsSatoriRichTooltipComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsSatoriRichTooltipComponent, selectors: [["nxs-satori-rich-tooltip"]], hostAttrs: [1, "nxs-satori-rich-tooltip", 2, "display", "inline-block"], inputs: { heading: [1, "heading"], content: [1, "content"], triggerLabel: [1, "triggerLabel"], icon: [1, "icon"] }, decls: 9, vars: 5, consts: [["tooltip", "satRichTooltip"], ["mat-icon-button", "", "type", "button", 1, "nxs-satori-rich-tooltip__trigger", 3, "satRichTooltipTriggerFor"], ["aria-hidden", "true"]], template: function NxsSatoriRichTooltipComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "button", 1)(1, "mat-icon", 2);
            i0.ɵɵtext(2);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(3, "sat-rich-tooltip", null, 0)(5, "sat-rich-tooltip-title");
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "sat-rich-tooltip-content");
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const tooltip_r1 = i0.ɵɵreference(4);
            i0.ɵɵproperty("satRichTooltipTriggerFor", tooltip_r1);
            i0.ɵɵattribute("aria-label", ctx.triggerLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.icon());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.heading());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.content());
        } }, dependencies: [MatButtonModule, i1.MatIconButton, MatIconModule, i2.MatIcon, SatRichTooltip,
            SatRichTooltipContent,
            SatRichTooltipTitle,
            SatRichTooltipTrigger], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsSatoriRichTooltipComponent, [{
        type: Component,
        args: [{ selector: 'nxs-satori-rich-tooltip', standalone: true, imports: [
                    MatButtonModule,
                    MatIconModule,
                    SatRichTooltip,
                    SatRichTooltipContent,
                    SatRichTooltipTitle,
                    SatRichTooltipTrigger,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-satori-rich-tooltip', style: 'display: inline-block' }, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-satori-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [satRichTooltipTriggerFor]=\"tooltip\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<sat-rich-tooltip #tooltip=\"satRichTooltip\">\n  <sat-rich-tooltip-title>{{ heading() }}</sat-rich-tooltip-title>\n  <sat-rich-tooltip-content>{{ content() }}</sat-rich-tooltip-content>\n</sat-rich-tooltip>\n" }]
    }], null, { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], triggerLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "triggerLabel", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsSatoriRichTooltipComponent, { className: "NxsSatoriRichTooltipComponent", filePath: "libs/shared/satori-components-satori/src/lib/rich-tooltip/satori-rich-tooltip.component.ts", lineNumber: 28 }); })();
//# sourceMappingURL=satori-rich-tooltip.component.js.map