import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as i0 from "@angular/core";
export class AdministrationShellComponent {
    static ɵfac = function AdministrationShellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdministrationShellComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdministrationShellComponent, selectors: [["lib-administration-shell"]], decls: 2, vars: 0, consts: [[1, "admin-shell__main"]], template: function AdministrationShellComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵelement(1, "router-outlet");
            i0.ɵɵelementEnd();
        } }, dependencies: [RouterOutlet], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  min-height: 0;\n}\n\n.admin-shell__main[_ngcontent-%COMP%] {\n  min-height: calc(100vh - 120px);\n  min-width: 0;\n  background: var(--mat-sys-surface, #fff);\n  padding: 0.25rem 0.5rem;\n  --admin-space-1: 0.5rem;\n  --admin-space-2: 0.75rem;\n  --admin-space-3: 1rem;\n  --admin-space-4: 1.25rem;\n  --admin-space-5: 1.5rem;\n  --admin-radius-1: 8px;\n  --admin-control-height: 40px;\n  --admin-row-padding-y: 0.68rem;\n}\n\n@media (max-width: 1024px) {\n  .admin-shell__main[_ngcontent-%COMP%] {\n    padding: 0;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdministrationShellComponent, [{
        type: Component,
        args: [{ selector: 'lib-administration-shell', standalone: true, imports: [RouterOutlet], template: "<section class=\"admin-shell__main\">\n  <router-outlet />\n</section>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  min-height: 0;\n}\n\n.admin-shell__main {\n  min-height: calc(100vh - 120px);\n  min-width: 0;\n  background: var(--mat-sys-surface, #fff);\n  padding: 0.25rem 0.5rem;\n  --admin-space-1: 0.5rem;\n  --admin-space-2: 0.75rem;\n  --admin-space-3: 1rem;\n  --admin-space-4: 1.25rem;\n  --admin-space-5: 1.5rem;\n  --admin-radius-1: 8px;\n  --admin-control-height: 40px;\n  --admin-row-padding-y: 0.68rem;\n}\n\n@media (max-width: 1024px) {\n  .admin-shell__main {\n    padding: 0;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdministrationShellComponent, { className: "AdministrationShellComponent", filePath: "libs/features/administration/src/lib/administration-shell/administration-shell.component.ts", lineNumber: 11 }); })();
