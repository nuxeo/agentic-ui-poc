import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.serviceName + $item.serviceLogin;
function CloudServicesPageComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 3);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.cloud-services-page.loading-connected-accounts"), " ");
} }
function CloudServicesPageComponent_Conditional_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 4);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
} }
function CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td", 7)(2, "div", 8);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "app.cloud-services-page.no-tokens-defined"), " ");
} }
function CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_21_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(9, "td");
    i0.ɵɵtext(10);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const account_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(account_r1.serviceName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(account_r1.nuxeoLogin);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(account_r1.serviceLogin);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(account_r1.creationDate);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.sharedLabel(account_r1.shared));
} }
function CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_21_For_1_Template, 11, 5, "tr", null, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r1.serviceAccounts());
} }
function CloudServicesPageComponent_Conditional_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 5)(1, "table", 6)(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "th");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(10, "th");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(13, "th");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(16, "th");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵdomElementStart(19, "tbody");
    i0.ɵɵconditionalCreate(20, CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_20_Template, 5, 3, "tr")(21, CloudServicesPageComponent_Conditional_6_Conditional_1_Conditional_21_Template, 2, 0);
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "app.cloud-services-page.service-name"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 8, "app.cloud-services-page.nuxeo-login"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 10, "app.cloud-services-page.service-login"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 12, "app.cloud-services-page.creation-date"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 14, "app.cloud-services-page.shared"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.serviceAccounts().length === 0 ? 20 : 21);
} }
function CloudServicesPageComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CloudServicesPageComponent_Conditional_6_Conditional_0_Template, 2, 1, "div", 4)(1, CloudServicesPageComponent_Conditional_6_Conditional_1_Template, 22, 16, "div", 5);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r1.error()) ? 0 : 1, tmp_1_0);
} }
export class CloudServicesPageComponent {
    translate = inject(TranslateService);
    settingsService = inject(SettingsService);
    titleKey = 'settings.cloud-services.title';
    serviceAccounts = signal([], ...(ngDevMode ? [{ debugName: "serviceAccounts" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    constructor() {
        this.settingsService
            .getConnectedAccounts()
            .pipe(takeUntilDestroyed())
            .subscribe({
            next: (accounts) => {
                this.serviceAccounts.set(accounts);
                this.loading.set(false);
            },
            error: () => {
                this.error.set(this.translate.instant('settings.cloud-services.load-failed'));
                this.loading.set(false);
            },
        });
    }
    sharedLabel(shared) {
        return shared ? 'Yes' : 'No';
    }
    static ɵfac = function CloudServicesPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CloudServicesPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CloudServicesPageComponent, selectors: [["ng-component"]], decls: 7, vars: 4, consts: [[1, "connected-accounts-page"], [1, "connected-accounts-page__card"], ["role", "heading", "aria-level", "2", 1, "connected-accounts-page__title"], [1, "connected-accounts-page__state"], [1, "connected-accounts-page__state", "connected-accounts-page__state--error"], [1, "connected-accounts-table-wrapper"], [1, "connected-accounts-table"], ["colspan", "5", 1, "connected-accounts-table__empty"], [1, "connected-accounts-table__empty-content"]], template: function CloudServicesPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(5, CloudServicesPageComponent_Conditional_5_Template, 3, 3, "div", 3)(6, CloudServicesPageComponent_Conditional_6_Template, 2, 1);
            i0.ɵɵdomElementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, ctx.titleKey), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 5 : 6);
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.connected-accounts-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n}\n\n.connected-accounts-page__card[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 1.5rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n  box-sizing: border-box;\n}\n\n.connected-accounts-page__title[_ngcontent-%COMP%] {\n  margin: 0 0 1rem;\n  font-size: 1.5rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.connected-accounts-page__state[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-radius: 8px;\n  background: #f8f9fc;\n  color: #555;\n}\n\n.connected-accounts-page__state--error[_ngcontent-%COMP%] {\n  background: #fff3f2;\n  color: #b42318;\n}\n\n.connected-accounts-table-wrapper[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  width: 100%;\n}\n\n.connected-accounts-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.connected-accounts-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.connected-accounts-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.875rem 1rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.95rem;\n  overflow-wrap: anywhere;\n}\n\n.connected-accounts-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.connected-accounts-table__empty[_ngcontent-%COMP%] {\n  color: #666;\n  vertical-align: middle;\n  padding: 0;\n}\n\n.connected-accounts-table__empty-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n}\n\n.connected-accounts-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:last-child, \n.connected-accounts-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:last-child {\n  width: 96px;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CloudServicesPageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [TranslatePipe], template: "<section class=\"connected-accounts-page\">\n  <div class=\"connected-accounts-page__card\">\n    <div class=\"connected-accounts-page__title\" role=\"heading\" aria-level=\"2\">\n      {{ titleKey | translate }}\n    </div>\n\n    @if (loading()) {\n      <div class=\"connected-accounts-page__state\">\n        {{ 'app.cloud-services-page.loading-connected-accounts' | translate }}\n      </div>\n    } @else {\n      @if (error(); as errorMessage) {\n        <div class=\"connected-accounts-page__state connected-accounts-page__state--error\">\n          {{ errorMessage }}\n        </div>\n      } @else {\n        <div class=\"connected-accounts-table-wrapper\">\n          <table class=\"connected-accounts-table\">\n            <thead>\n              <tr>\n                <th>{{ 'app.cloud-services-page.service-name' | translate }}</th>\n                <th>{{ 'app.cloud-services-page.nuxeo-login' | translate }}</th>\n                <th>{{ 'app.cloud-services-page.service-login' | translate }}</th>\n                <th>{{ 'app.cloud-services-page.creation-date' | translate }}</th>\n                <th>{{ 'app.cloud-services-page.shared' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @if (serviceAccounts().length === 0) {\n                <tr>\n                  <td colspan=\"5\" class=\"connected-accounts-table__empty\">\n                    <div class=\"connected-accounts-table__empty-content\">\n                      {{ 'app.cloud-services-page.no-tokens-defined' | translate }}\n                    </div>\n                  </td>\n                </tr>\n              } @else {\n                @for (\n                  account of serviceAccounts();\n                  track account.serviceName + account.serviceLogin\n                ) {\n                  <tr>\n                    <td>{{ account.serviceName }}</td>\n                    <td>{{ account.nuxeoLogin }}</td>\n                    <td>{{ account.serviceLogin }}</td>\n                    <td>{{ account.creationDate }}</td>\n                    <td>{{ sharedLabel(account.shared) }}</td>\n                  </tr>\n                }\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    }\n  </div>\n</section>\n", styles: [":host {\n  display: block;\n}\n\n.connected-accounts-page {\n  padding: 1.5rem;\n}\n\n.connected-accounts-page__card {\n  width: 100%;\n  padding: 1.5rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n  box-sizing: border-box;\n}\n\n.connected-accounts-page__title {\n  margin: 0 0 1rem;\n  font-size: 1.5rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.connected-accounts-page__state {\n  padding: 1rem;\n  border-radius: 8px;\n  background: #f8f9fc;\n  color: #555;\n}\n\n.connected-accounts-page__state--error {\n  background: #fff3f2;\n  color: #b42318;\n}\n\n.connected-accounts-table-wrapper {\n  overflow-x: auto;\n  width: 100%;\n}\n\n.connected-accounts-table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.connected-accounts-table th,\n.connected-accounts-table td {\n  padding: 0.875rem 1rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.95rem;\n  overflow-wrap: anywhere;\n}\n\n.connected-accounts-table th {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.connected-accounts-table__empty {\n  color: #666;\n  vertical-align: middle;\n  padding: 0;\n}\n\n.connected-accounts-table__empty-content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n}\n\n.connected-accounts-table th:last-child,\n.connected-accounts-table td:last-child {\n  width: 96px;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CloudServicesPageComponent, { className: "CloudServicesPageComponent", filePath: "apps/nuxeo-ui/src/app/settings/cloud-services/cloud-services-page.component.ts", lineNumber: 13 }); })();
