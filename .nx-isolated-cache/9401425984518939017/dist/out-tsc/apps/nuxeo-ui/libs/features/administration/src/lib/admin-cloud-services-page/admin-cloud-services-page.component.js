import { Component, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdministrationService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/tabs";
import * as i2 from "@angular/material/table";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/progress-spinner";
function AdminCloudServicesPageComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵelement(1, "mat-spinner", 11);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-cloud-services-page.loading"));
} }
function AdminCloudServicesPageComponent_Conditional_17_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-cloud-services-page.service-name"), " ");
} }
function AdminCloudServicesPageComponent_Conditional_17_td_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.providerName(p_r1));
} }
function AdminCloudServicesPageComponent_Conditional_17_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-cloud-services-page.description"), " ");
} }
function AdminCloudServicesPageComponent_Conditional_17_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.providerDescription(p_r3));
} }
function AdminCloudServicesPageComponent_Conditional_17_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-cloud-services-page.enabled"), " ");
} }
function AdminCloudServicesPageComponent_Conditional_17_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 22);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r4 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.providerEnabled(p_r4) ? i0.ɵɵpipeBind1(2, 1, "administration.yes") : "No", " ");
} }
function AdminCloudServicesPageComponent_Conditional_17_tr_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 23);
} }
function AdminCloudServicesPageComponent_Conditional_17_tr_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 24);
} }
function AdminCloudServicesPageComponent_Conditional_17_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 20);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-cloud-services-page.no-provider-defined"), " ");
} }
function AdminCloudServicesPageComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9)(1, "table", 12);
    i0.ɵɵelementContainerStart(2, 13);
    i0.ɵɵtemplate(3, AdminCloudServicesPageComponent_Conditional_17_th_3_Template, 3, 3, "th", 14)(4, AdminCloudServicesPageComponent_Conditional_17_td_4_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 16);
    i0.ɵɵtemplate(6, AdminCloudServicesPageComponent_Conditional_17_th_6_Template, 3, 3, "th", 14)(7, AdminCloudServicesPageComponent_Conditional_17_td_7_Template, 2, 1, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 17);
    i0.ɵɵtemplate(9, AdminCloudServicesPageComponent_Conditional_17_th_9_Template, 3, 3, "th", 14)(10, AdminCloudServicesPageComponent_Conditional_17_td_10_Template, 3, 3, "td", 15);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(11, AdminCloudServicesPageComponent_Conditional_17_tr_11_Template, 1, 0, "tr", 18)(12, AdminCloudServicesPageComponent_Conditional_17_tr_12_Template, 1, 0, "tr", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AdminCloudServicesPageComponent_Conditional_17_Conditional_13_Template, 3, 3, "p", 20);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r1.providers());
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.providerColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.providerColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.providers().length === 0 ? 13 : -1);
} }
export class AdminCloudServicesPageComponent {
    adminService = inject(AdministrationService);
    providers = signal([], ...(ngDevMode ? [{ debugName: "providers" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    providerColumns = ['serviceName', 'description', 'enabled'];
    ngOnInit() {
        this.refreshProviders();
    }
    refreshProviders() {
        this.loading.set(true);
        this.adminService.listOAuth2Providers().subscribe({
            next: (list) => {
                this.providers.set(list);
                this.loading.set(false);
            },
            error: () => {
                this.providers.set([]);
                this.loading.set(false);
            },
        });
    }
    providerName(p) {
        return String(p.serviceName ?? p['serviceName'] ?? p['name'] ?? '—');
    }
    providerDescription(p) {
        return String(p.description ?? p['description'] ?? '—');
    }
    providerEnabled(p) {
        const raw = p;
        return raw['enabled'] === true || raw['isEnabled'] === true;
    }
    static ɵfac = function AdminCloudServicesPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminCloudServicesPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminCloudServicesPageComponent, selectors: [["lib-admin-cloud-services-page"]], decls: 30, vars: 25, consts: [[1, "cloud-page"], [1, "cloud-page__header"], ["role", "heading", "aria-level", "1", 1, "cloud-page__title"], ["animationDuration", "0ms"], [3, "label"], [1, "tab-inner"], [1, "subhead"], ["type", "button", "mat-button", "", "color", "primary", 3, "click"], [1, "cloud-center"], [1, "table-wrap", "mat-elevation-z1"], [1, "muted"], ["diameter", "36"], ["mat-table", "", 1, "cloud-table", 3, "dataSource"], ["matColumnDef", "serviceName"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "description"], ["matColumnDef", "enabled"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [1, "empty"], ["mat-header-cell", ""], ["mat-cell", ""], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminCloudServicesPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "mat-tab-group", 3)(6, "mat-tab", 4);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementStart(8, "div", 5)(9, "div", 6)(10, "span");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "button", 7);
            i0.ɵɵlistener("click", function AdminCloudServicesPageComponent_Template_button_click_13_listener() { return ctx.refreshProviders(); });
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(16, AdminCloudServicesPageComponent_Conditional_16_Template, 3, 3, "div", 8)(17, AdminCloudServicesPageComponent_Conditional_17_Template, 14, 4, "div", 9);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(18, "mat-tab", 4);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementStart(20, "div", 5)(21, "p", 10);
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(24, "mat-tab", 4);
            i0.ɵɵpipe(25, "translate");
            i0.ɵɵelementStart(26, "div", 5)(27, "p", 10);
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 9, "admin.admin-cloud-services-page.cloud-services"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(7, 11, "admin.cloud-services.tab.providers"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 13, "admin.admin-cloud-services-page.oauth-2-service-providers"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 15, "admin.admin-cloud-services-page.refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 16 : 17);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(19, 17, "admin.cloud-services.tab.tokens"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 19, "admin.admin-cloud-services-page.oauth-token-management-is-not-exposed"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(25, 21, "admin.cloud-services.tab.consumers"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 23, "admin.admin-cloud-services-page.oauth-consumer-registration-is-typically-done"), " ");
        } }, dependencies: [MatTabsModule, i1.MatTab, i1.MatTabGroup, MatTableModule, i2.MatTable, i2.MatHeaderCellDef, i2.MatHeaderRowDef, i2.MatColumnDef, i2.MatCellDef, i2.MatRowDef, i2.MatHeaderCell, i2.MatCell, i2.MatHeaderRow, i2.MatRow, MatButtonModule, i3.MatButton, MatIconModule,
            MatProgressSpinnerModule, i4.MatProgressSpinner, TranslatePipe], styles: [".cloud-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 960px;\n}\n\n.cloud-page__header[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem;\n}\n\n.cloud-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.tab-inner[_ngcontent-%COMP%] {\n  padding: 1rem 0 1.5rem;\n}\n\n.subhead[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.75rem;\n  font-weight: 500;\n}\n\n.table-wrap[_ngcontent-%COMP%] {\n  border-radius: var(--admin-radius-1, 8px);\n  overflow: auto;\n}\n\n.cloud-table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.cloud-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1.5rem;\n}\n\n.empty[_ngcontent-%COMP%] {\n  padding: 1rem 1.25rem;\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n@media (max-width: 900px) {\n  .cloud-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}\n\n.muted[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  line-height: 1.5;\n  max-width: 60ch;\n}\n\n.cloud-page[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%], \n.cloud-page[_ngcontent-%COMP%]   .mat-mdc-outlined-button[_ngcontent-%COMP%], \n.cloud-page[_ngcontent-%COMP%]   .mat-mdc-button[_ngcontent-%COMP%] {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.cloud-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.cloud-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminCloudServicesPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-cloud-services-page', standalone: true, imports: [
                    TranslatePipe,
                    MatTabsModule,
                    MatTableModule,
                    MatButtonModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                ], template: "<div class=\"cloud-page\">\n  <header class=\"cloud-page__header\">\n    <div class=\"cloud-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-cloud-services-page.cloud-services' | translate }}\n    </div>\n  </header>\n\n  <mat-tab-group animationDuration=\"0ms\">\n    <mat-tab [label]=\"'admin.cloud-services.tab.providers' | translate\">\n      <div class=\"tab-inner\">\n        <div class=\"subhead\">\n          <span>{{ 'admin.admin-cloud-services-page.oauth-2-service-providers' | translate }}</span>\n          <button type=\"button\" mat-button color=\"primary\" (click)=\"refreshProviders()\">\n            {{ 'admin.admin-cloud-services-page.refresh' | translate }}\n          </button>\n        </div>\n        @if (loading()) {\n          <div class=\"cloud-center\">\n            <mat-spinner\n              diameter=\"36\"\n              [attr.aria-label]=\"'admin.admin-cloud-services-page.loading' | translate\"\n            />\n          </div>\n        } @else {\n          <div class=\"table-wrap mat-elevation-z1\">\n            <table mat-table [dataSource]=\"providers()\" class=\"cloud-table\">\n              <ng-container matColumnDef=\"serviceName\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-cloud-services-page.service-name' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let p\">{{ providerName(p) }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"description\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-cloud-services-page.description' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let p\">{{ providerDescription(p) }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"enabled\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-cloud-services-page.enabled' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let p\">\n                  {{ providerEnabled(p) ? ('administration.yes' | translate) : 'No' }}\n                </td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"providerColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: providerColumns\"></tr>\n            </table>\n            @if (providers().length === 0) {\n              <p class=\"empty\">\n                {{ 'admin.admin-cloud-services-page.no-provider-defined' | translate }}\n              </p>\n            }\n          </div>\n        }\n      </div>\n    </mat-tab>\n    <mat-tab [label]=\"'admin.cloud-services.tab.tokens' | translate\">\n      <div class=\"tab-inner\">\n        <p class=\"muted\">\n          {{ 'admin.admin-cloud-services-page.oauth-token-management-is-not-exposed' | translate }}\n        </p>\n      </div>\n    </mat-tab>\n    <mat-tab [label]=\"'admin.cloud-services.tab.consumers' | translate\">\n      <div class=\"tab-inner\">\n        <p class=\"muted\">\n          {{\n            'admin.admin-cloud-services-page.oauth-consumer-registration-is-typically-done'\n              | translate\n          }}\n        </p>\n      </div>\n    </mat-tab>\n  </mat-tab-group>\n</div>\n", styles: [".cloud-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 960px;\n}\n\n.cloud-page__header {\n  margin-bottom: 0.75rem;\n}\n\n.cloud-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.tab-inner {\n  padding: 1rem 0 1.5rem;\n}\n\n.subhead {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.75rem;\n  font-weight: 500;\n}\n\n.table-wrap {\n  border-radius: var(--admin-radius-1, 8px);\n  overflow: auto;\n}\n\n.cloud-table {\n  width: 100%;\n}\n\n.cloud-center {\n  display: flex;\n  justify-content: center;\n  padding: 1.5rem;\n}\n\n.empty {\n  padding: 1rem 1.25rem;\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n@media (max-width: 900px) {\n  .cloud-page {\n    padding: 1rem;\n  }\n}\n\n.muted {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  line-height: 1.5;\n  max-width: 60ch;\n}\n\n.cloud-page .mat-mdc-unelevated-button,\n.cloud-page .mat-mdc-outlined-button,\n.cloud-page .mat-mdc-button {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.cloud-table th.mat-mdc-header-cell,\n.cloud-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminCloudServicesPageComponent, { className: "AdminCloudServicesPageComponent", filePath: "libs/features/administration/src/lib/admin-cloud-services-page/admin-cloud-services-page.component.ts", lineNumber: 25 }); })();
