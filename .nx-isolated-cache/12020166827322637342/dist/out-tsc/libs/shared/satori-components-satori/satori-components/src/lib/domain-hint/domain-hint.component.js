import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DOMAIN_CONTAINER_GUIDANCE_KEY, isDomainParentType, isRepositoryRootPath, } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
function NxsDomainHintComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 0);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx_r0.guidanceKey));
} }
/**
 * The note shown where content cannot be created directly: inside a Domain, or at the
 * repository root. It tells the user to open Sections, Templates or Workspaces instead.
 *
 * Renders nothing anywhere else, so a host places it unconditionally and passes what it is
 * showing. The rule — a `Domain`, or the path `/` — is `nuxeo-client`'s, shared with the
 * Create / Import checks that refuse those locations.
 */
export class NxsDomainHintComponent {
    /** The type of the document being shown. */
    documentType = input(null, ...(ngDevMode ? [{ debugName: "documentType" }] : []));
    /** The repository path being shown. */
    path = input(null, ...(ngDevMode ? [{ debugName: "path" }] : []));
    guidanceKey = DOMAIN_CONTAINER_GUIDANCE_KEY;
    visible = computed(() => isDomainParentType(this.documentType()) || isRepositoryRootPath(this.path()), ...(ngDevMode ? [{ debugName: "visible" }] : []));
    static ɵfac = function NxsDomainHintComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDomainHintComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDomainHintComponent, selectors: [["nxs-domain-hint"]], hostAttrs: [1, "nxs-domain-hint"], inputs: { documentType: [1, "documentType"], path: [1, "path"] }, decls: 1, vars: 1, consts: [["role", "note", 1, "nxs-domain-hint__note"]], template: function NxsDomainHintComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsDomainHintComponent_Conditional_0_Template, 3, 3, "p", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.visible() ? 0 : -1);
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.nxs-domain-hint__note[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  padding: 10px 12px;\n  border-radius: 6px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 13px;\n  line-height: 1.45;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDomainHintComponent, [{
        type: Component,
        args: [{ selector: 'nxs-domain-hint', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-domain-hint' }, template: "@if (visible()) {\n  <p class=\"nxs-domain-hint__note\" role=\"note\">{{ guidanceKey | translate }}</p>\n}\n", styles: [":host {\n  display: block;\n}\n\n.nxs-domain-hint__note {\n  margin: 0 0 12px;\n  padding: 10px 12px;\n  border-radius: 6px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 13px;\n  line-height: 1.45;\n}\n"] }]
    }], null, { documentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentType", required: false }] }], path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDomainHintComponent, { className: "NxsDomainHintComponent", filePath: "libs/shared/satori-components/src/lib/domain-hint/domain-hint.component.ts", lineNumber: 26 }); })();
//# sourceMappingURL=domain-hint.component.js.map