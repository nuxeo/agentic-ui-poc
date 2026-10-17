import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.name + $item.authorizationDate;
function AuthorizedApplicationsPageComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 2);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.authorized-applications-page.loading-authorized-applications"), " ");
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 3);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td", 6)(2, "div", 7);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "app.authorized-applications-page.you-have-not-granted-any-application"), " ");
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_12_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const application_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(application_r1.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(application_r1.authorizationDate);
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_12_For_1_Template, 5, 2, "tr", null, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r1.applications());
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 4)(1, "table", 5)(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "th");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵdomElementEnd()()();
    i0.ɵɵdomElementStart(10, "tbody");
    i0.ɵɵconditionalCreate(11, AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_11_Template, 5, 3, "tr")(12, AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Conditional_12_Template, 2, 0);
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 3, "app.authorized-applications-page.name"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 5, "app.authorized-applications-page.authorization-date"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.applications().length === 0 ? 11 : 12);
} }
function AuthorizedApplicationsPageComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AuthorizedApplicationsPageComponent_Conditional_3_Conditional_0_Template, 2, 1, "div", 3)(1, AuthorizedApplicationsPageComponent_Conditional_3_Conditional_1_Template, 13, 7, "div", 4);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r1.error()) ? 0 : 1, tmp_1_0);
} }
export class AuthorizedApplicationsPageComponent {
    translate = inject(TranslateService);
    settingsService = inject(SettingsService);
    applications = signal([], ...(ngDevMode ? [{ debugName: "applications" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    constructor() {
        this.settingsService
            .getAuthorizedApplications()
            .pipe(takeUntilDestroyed())
            .subscribe({
            next: (applications) => {
                this.applications.set(applications);
                this.loading.set(false);
            },
            error: () => {
                this.error.set(this.translate.instant('settings.authorized-applications.load-failed'));
                this.loading.set(false);
            },
        });
    }
    static ɵfac = function AuthorizedApplicationsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthorizedApplicationsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuthorizedApplicationsPageComponent, selectors: [["ng-component"]], decls: 4, vars: 1, consts: [[1, "authorized-applications-page"], [1, "authorized-applications-page__card"], [1, "authorized-applications-page__state"], [1, "authorized-applications-page__state", "authorized-applications-page__state--error"], [1, "authorized-applications-table-wrapper"], [1, "authorized-applications-table"], ["colspan", "2", 1, "authorized-applications-table__empty"], [1, "authorized-applications-table__empty-content"]], template: function AuthorizedApplicationsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, AuthorizedApplicationsPageComponent_Conditional_2_Template, 3, 3, "div", 2)(3, AuthorizedApplicationsPageComponent_Conditional_3_Template, 2, 1);
            i0.ɵɵdomElementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 2 : 3);
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.authorized-applications-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n}\n\n.authorized-applications-page__card[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 1.5rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n  box-sizing: border-box;\n}\n\n.authorized-applications-page__state[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-radius: 8px;\n  background: #f8f9fc;\n  color: #555;\n}\n\n.authorized-applications-page__state--error[_ngcontent-%COMP%] {\n  background: #fff3f2;\n  color: #b42318;\n}\n\n.authorized-applications-table-wrapper[_ngcontent-%COMP%] {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.authorized-applications-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.authorized-applications-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.authorized-applications-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.875rem 1rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.95rem;\n  overflow-wrap: anywhere;\n}\n\n.authorized-applications-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.authorized-applications-table__empty[_ngcontent-%COMP%] {\n  padding: 0;\n  vertical-align: middle;\n}\n\n.authorized-applications-table__empty-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n  color: #666;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthorizedApplicationsPageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [TranslatePipe], template: "<section class=\"authorized-applications-page\">\n  <div class=\"authorized-applications-page__card\">\n    @if (loading()) {\n      <div class=\"authorized-applications-page__state\">\n        {{ 'app.authorized-applications-page.loading-authorized-applications' | translate }}\n      </div>\n    } @else {\n      @if (error(); as errorMessage) {\n        <div class=\"authorized-applications-page__state authorized-applications-page__state--error\">\n          {{ errorMessage }}\n        </div>\n      } @else {\n        <div class=\"authorized-applications-table-wrapper\">\n          <table class=\"authorized-applications-table\">\n            <thead>\n              <tr>\n                <th>{{ 'app.authorized-applications-page.name' | translate }}</th>\n                <th>{{ 'app.authorized-applications-page.authorization-date' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @if (applications().length === 0) {\n                <tr>\n                  <td colspan=\"2\" class=\"authorized-applications-table__empty\">\n                    <div class=\"authorized-applications-table__empty-content\">\n                      {{\n                        'app.authorized-applications-page.you-have-not-granted-any-application'\n                          | translate\n                      }}\n                    </div>\n                  </td>\n                </tr>\n              } @else {\n                @for (\n                  application of applications();\n                  track application.name + application.authorizationDate\n                ) {\n                  <tr>\n                    <td>{{ application.name }}</td>\n                    <td>{{ application.authorizationDate }}</td>\n                  </tr>\n                }\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    }\n  </div>\n</section>\n", styles: [":host {\n  display: block;\n}\n\n.authorized-applications-page {\n  padding: 1.5rem;\n}\n\n.authorized-applications-page__card {\n  width: 100%;\n  padding: 1.5rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n  box-sizing: border-box;\n}\n\n.authorized-applications-page__state {\n  padding: 1rem;\n  border-radius: 8px;\n  background: #f8f9fc;\n  color: #555;\n}\n\n.authorized-applications-page__state--error {\n  background: #fff3f2;\n  color: #b42318;\n}\n\n.authorized-applications-table-wrapper {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.authorized-applications-table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.authorized-applications-table th,\n.authorized-applications-table td {\n  padding: 0.875rem 1rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.95rem;\n  overflow-wrap: anywhere;\n}\n\n.authorized-applications-table th {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.authorized-applications-table__empty {\n  padding: 0;\n  vertical-align: middle;\n}\n\n.authorized-applications-table__empty-content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n  color: #666;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuthorizedApplicationsPageComponent, { className: "AuthorizedApplicationsPageComponent", filePath: "apps/nuxeo-ui/src/app/settings/authorized-applications/authorized-applications-page.component.ts", lineNumber: 13 }); })();
