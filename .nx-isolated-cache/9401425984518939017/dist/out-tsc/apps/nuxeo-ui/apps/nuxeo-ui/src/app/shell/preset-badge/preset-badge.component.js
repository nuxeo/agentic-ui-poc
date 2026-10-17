import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import * as i0 from "@angular/core";
const _c0 = a0 => ({ label: a0 });
function PresetBadgeComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 0);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const active_r1 = ctx;
    i0.ɵɵattribute("data-preset", active_r1.name)("title", active_r1.label);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 3, "app.preset.badge", i0.ɵɵpureFunction1(6, _c0, active_r1.label)), " ");
} }
/**
 * Names the presales preset in force, so nobody mistakes a demo configuration for the product's.
 *
 * Renders nothing unless a package enables preset switching and a preset is chosen — which is
 * never the case on a customer's server.
 */
export class PresetBadgeComponent {
    preset = inject(AppConfigService).activePreset;
    static ɵfac = function PresetBadgeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PresetBadgeComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PresetBadgeComponent, selectors: [["app-preset-badge"]], decls: 1, vars: 1, consts: [["role", "status", 1, "preset-badge"]], template: function PresetBadgeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, PresetBadgeComponent_Conditional_0_Template, 3, 8, "span", 0);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.preset()) ? 0 : -1, tmp_0_0);
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: contents;\n}\n\n.preset-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  // The label is package text of any length, and the title slot is narrow: shrink and truncate\n  // rather than push into the absolutely positioned search.\n  flex-shrink: 1;\n  min-width: 0;\n  max-width: 32ch;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  align-self: center;\n  margin-inline: 12px 8px;\n  padding: 2px 10px;\n  border: 1px solid var(--mat-sys-tertiary);\n  border-radius: 999px;\n  background: var(--mat-sys-tertiary-container);\n  color: var(--mat-sys-on-tertiary-container);\n  font: var(--mat-sys-label-medium);\n  white-space: nowrap;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PresetBadgeComponent, [{
        type: Component,
        args: [{ selector: 'app-preset-badge', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (preset(); as active) {\n  <span\n    class=\"preset-badge\"\n    role=\"status\"\n    [attr.data-preset]=\"active.name\"\n    [attr.title]=\"active.label\"\n  >\n    {{ 'app.preset.badge' | translate: { label: active.label } }}\n  </span>\n}\n", styles: [":host {\n  display: contents;\n}\n\n.preset-badge {\n  display: inline-block;\n  // The label is package text of any length, and the title slot is narrow: shrink and truncate\n  // rather than push into the absolutely positioned search.\n  flex-shrink: 1;\n  min-width: 0;\n  max-width: 32ch;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  align-self: center;\n  margin-inline: 12px 8px;\n  padding: 2px 10px;\n  border: 1px solid var(--mat-sys-tertiary);\n  border-radius: 999px;\n  background: var(--mat-sys-tertiary-container);\n  color: var(--mat-sys-on-tertiary-container);\n  font: var(--mat-sys-label-medium);\n  white-space: nowrap;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PresetBadgeComponent, { className: "PresetBadgeComponent", filePath: "apps/nuxeo-ui/src/app/shell/preset-badge/preset-badge.component.ts", lineNumber: 20 }); })();
