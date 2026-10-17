import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id + $item.path;
function NuxeoDrivePageComponent_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td", 12)(2, "div", 11);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "app.nuxeo-drive-page.loading-synchronization-roots"), " ");
} }
function NuxeoDrivePageComponent_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "tr")(1, "td", 12)(2, "div", 11);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "app.nuxeo-drive-page.you-currently-dont-have-any-synchronization"), " ");
} }
function NuxeoDrivePageComponent_Conditional_58_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "td", 13)(6, "button", 14);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵdomListener("click", function NuxeoDrivePageComponent_Conditional_58_For_1_Template_button_click_6_listener() { const root_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.removeSynchronizationRoot(root_r2)); });
    i0.ɵɵtext(8, " \u00D7 ");
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const root_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(root_r2.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(root_r2.path);
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", ctx_r2.isRootActionPending(root_r2.id));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 4, "app.nuxeo-drive-page.remove-synchronization-root"));
} }
function NuxeoDrivePageComponent_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NuxeoDrivePageComponent_Conditional_58_For_1_Template, 9, 6, "tr", null, _forTrack0);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r2.synchronizationRoots());
} }
export class NuxeoDrivePageComponent {
    settingsService = inject(SettingsService);
    title = 'Nuxeo Drive';
    synchronizationRoots = signal([], ...(ngDevMode ? [{ debugName: "synchronizationRoots" }] : []));
    synchronizationRootsLoading = signal(true, ...(ngDevMode ? [{ debugName: "synchronizationRootsLoading" }] : []));
    synchronizationRootPendingIds = signal([], ...(ngDevMode ? [{ debugName: "synchronizationRootPendingIds" }] : []));
    constructor() {
        this.loadSynchronizationRoots();
    }
    loadSynchronizationRoots() {
        this.synchronizationRootsLoading.set(true);
        this.settingsService
            .getSynchronizationRoots()
            .pipe(takeUntilDestroyed())
            .subscribe({
            next: (roots) => {
                this.synchronizationRoots.set(roots);
                this.synchronizationRootsLoading.set(false);
            },
            error: () => {
                this.synchronizationRoots.set([]);
                this.synchronizationRootsLoading.set(false);
            },
        });
    }
    removeSynchronizationRoot(root) {
        if (!root.id || this.isRootActionPending(root.id)) {
            return;
        }
        this.synchronizationRootPendingIds.update((ids) => [...ids, root.id]);
        this.settingsService
            .setSynchronizationRoot(root.id, false)
            .pipe(takeUntilDestroyed())
            .subscribe({
            next: () => {
                this.clearPendingRoot(root.id);
                this.loadSynchronizationRoots();
            },
            error: () => {
                this.clearPendingRoot(root.id);
            },
        });
    }
    isRootActionPending(rootId) {
        return this.synchronizationRootPendingIds().includes(rootId);
    }
    clearPendingRoot(rootId) {
        this.synchronizationRootPendingIds.update((ids) => ids.filter((id) => id !== rootId));
    }
    static ɵfac = function NuxeoDrivePageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NuxeoDrivePageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NuxeoDrivePageComponent, selectors: [["ng-component"]], decls: 91, vars: 50, consts: [[1, "nuxeo-drive-page"], ["role", "heading", "aria-level", "2", 1, "nuxeo-drive-card__title"], [1, "nuxeo-drive-card"], ["role", "heading", "aria-level", "3", 1, "nuxeo-drive-card__section-title"], [1, "nuxeo-drive-card__table-wrapper"], [1, "nuxeo-drive-card__table"], ["href", "https://community.nuxeo.com/static/drive-updates/nuxeo-drive-x86_64.AppImage", "target", "_blank", "rel", "noopener noreferrer", 1, "nuxeo-drive-card__download-link"], ["href", "https://community.nuxeo.com/static/drive-updates/nuxeo-drive.dmg", "target", "_blank", "rel", "noopener noreferrer", 1, "nuxeo-drive-card__download-link"], ["href", "https://community.nuxeo.com/static/drive-updates/nuxeo-drive.exe", "target", "_blank", "rel", "noopener noreferrer", 1, "nuxeo-drive-card__download-link"], [1, "nuxeo-drive-card__action-header"], ["colspan", "6", 1, "nuxeo-drive-card__table-empty"], [1, "nuxeo-drive-card__table-empty-content"], ["colspan", "3", 1, "nuxeo-drive-card__table-empty"], [1, "nuxeo-drive-card__action-cell"], ["type", "button", 1, "nuxeo-drive-card__remove-root-button", 3, "click", "disabled"]], template: function NuxeoDrivePageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0)(1, "div", 1);
            i0.ɵɵtext(2);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(3, "article", 2)(4, "div", 3);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(7, "div", 4)(8, "table", 5)(9, "thead")(10, "tr")(11, "th");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(14, "th");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(17, "tbody")(18, "tr")(19, "td");
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(22, "td")(23, "a", 6);
            i0.ɵɵtext(24, " nuxeo-drive-x86_64.AppImage ");
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(25, "tr")(26, "td");
            i0.ɵɵtext(27, "macOS");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(28, "td")(29, "a", 7)(30, "code");
            i0.ɵɵtext(31, "Nuxeo-Drive.DMG");
            i0.ɵɵdomElementEnd()()()();
            i0.ɵɵdomElementStart(32, "tr")(33, "td");
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(36, "td")(37, "a", 8)(38, "code");
            i0.ɵɵtext(39, "Nuxeo-Drive.EXE");
            i0.ɵɵdomElementEnd()()()()()()()();
            i0.ɵɵdomElementStart(40, "article", 2)(41, "div", 3);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(44, "div", 4)(45, "table", 5)(46, "thead")(47, "tr")(48, "th");
            i0.ɵɵtext(49);
            i0.ɵɵpipe(50, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(51, "th");
            i0.ɵɵtext(52);
            i0.ɵɵpipe(53, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElement(54, "th", 9);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(55, "tbody");
            i0.ɵɵconditionalCreate(56, NuxeoDrivePageComponent_Conditional_56_Template, 5, 3, "tr")(57, NuxeoDrivePageComponent_Conditional_57_Template, 5, 3, "tr")(58, NuxeoDrivePageComponent_Conditional_58_Template, 2, 0);
            i0.ɵɵdomElementEnd()()()();
            i0.ɵɵdomElementStart(59, "article", 2)(60, "div", 3);
            i0.ɵɵtext(61);
            i0.ɵɵpipe(62, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(63, "div", 4)(64, "table", 5)(65, "thead")(66, "tr")(67, "th");
            i0.ɵɵtext(68);
            i0.ɵɵpipe(69, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(70, "th");
            i0.ɵɵtext(71);
            i0.ɵɵpipe(72, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(73, "th");
            i0.ɵɵtext(74);
            i0.ɵɵpipe(75, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(76, "th");
            i0.ɵɵtext(77);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(79, "th");
            i0.ɵɵtext(80);
            i0.ɵɵpipe(81, "translate");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(82, "th");
            i0.ɵɵtext(83);
            i0.ɵɵpipe(84, "translate");
            i0.ɵɵdomElementEnd()()();
            i0.ɵɵdomElementStart(85, "tbody")(86, "tr")(87, "td", 10)(88, "div", 11);
            i0.ɵɵtext(89);
            i0.ɵɵpipe(90, "translate");
            i0.ɵɵdomElementEnd()()()()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.title);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 18, "app.nuxeo-drive-page.packages"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 20, "app.nuxeo-drive-page.platform"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 22, "app.nuxeo-drive-page.packages-to-install"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 24, "app.nuxeo-drive-page.linux"));
            i0.ɵɵadvance(14);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 26, "app.nuxeo-drive-page.windows"));
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(43, 28, "app.nuxeo-drive-page.synchronization-roots"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 30, "app.nuxeo-drive-page.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 32, "app.nuxeo-drive-page.path"));
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.synchronizationRootsLoading() ? 56 : ctx.synchronizationRoots().length === 0 ? 57 : 58);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(62, 34, "app.nuxeo-drive-page.tokens"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(69, 36, "app.nuxeo-drive-page.token"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(72, 38, "app.nuxeo-drive-page.application"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(75, 40, "app.nuxeo-drive-page.device-identifier"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(78, 42, "app.nuxeo-drive-page.device-description"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(81, 44, "app.nuxeo-drive-page.permission"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(84, 46, "app.nuxeo-drive-page.created"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(90, 48, "app.nuxeo-drive-page.you-currently-dont-have-any-tokens"), " ");
        } }, dependencies: [TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.nuxeo-drive-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n.nuxeo-drive-card[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 1.25rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n}\n\n.nuxeo-drive-card__title[_ngcontent-%COMP%] {\n  margin: 0 0 0.75rem;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.nuxeo-drive-card__section-title[_ngcontent-%COMP%] {\n  margin: 0 0 0.75rem;\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n}\n\n.nuxeo-drive-card__table-wrapper[_ngcontent-%COMP%] {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.nuxeo-drive-card__table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.nuxeo-drive-card__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.nuxeo-drive-card__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.92rem;\n  overflow-wrap: anywhere;\n}\n\n.nuxeo-drive-card__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.nuxeo-drive-card__action-header[_ngcontent-%COMP%], \n.nuxeo-drive-card__action-cell[_ngcontent-%COMP%] {\n  width: 52px;\n  text-align: right;\n}\n\n.nuxeo-drive-card__table-empty[_ngcontent-%COMP%] {\n  padding: 0;\n  vertical-align: middle;\n}\n\n.nuxeo-drive-card__table-empty-content[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n  color: #667085;\n}\n\n.nuxeo-drive-card__download-link[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.125rem 0.375rem;\n  border-radius: 6px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n  transition:\n    background-color 120ms ease,\n    color 120ms ease;\n}\n\n.nuxeo-drive-card__download-link[_ngcontent-%COMP%]:hover, \n.nuxeo-drive-card__download-link[_ngcontent-%COMP%]:focus-visible {\n  background: #eef4ff;\n  color: #1d4ed8;\n  outline: none;\n}\n\n.nuxeo-drive-card__remove-root-button[_ngcontent-%COMP%] {\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 1.1rem;\n  line-height: 1;\n  width: 28px;\n  height: 28px;\n  border-radius: 999px;\n  cursor: pointer;\n  color: #667085;\n}\n\n.nuxeo-drive-card__remove-root-button[_ngcontent-%COMP%]:hover, \n.nuxeo-drive-card__remove-root-button[_ngcontent-%COMP%]:focus-visible {\n  background: #fee4e2;\n  color: #b42318;\n  outline: none;\n}\n\n.nuxeo-drive-card__remove-root-button[_ngcontent-%COMP%]:disabled {\n  cursor: not-allowed;\n  opacity: 0.5;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NuxeoDrivePageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [TranslatePipe], template: "<section class=\"nuxeo-drive-page\">\n  <div class=\"nuxeo-drive-card__title\" role=\"heading\" aria-level=\"2\">{{ title }}</div>\n\n  <article class=\"nuxeo-drive-card\">\n    <div class=\"nuxeo-drive-card__section-title\" role=\"heading\" aria-level=\"3\">\n      {{ 'app.nuxeo-drive-page.packages' | translate }}\n    </div>\n    <div class=\"nuxeo-drive-card__table-wrapper\">\n      <table class=\"nuxeo-drive-card__table\">\n        <thead>\n          <tr>\n            <th>{{ 'app.nuxeo-drive-page.platform' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.packages-to-install' | translate }}</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td>{{ 'app.nuxeo-drive-page.linux' | translate }}</td>\n            <td>\n              <a\n                class=\"nuxeo-drive-card__download-link\"\n                href=\"https://community.nuxeo.com/static/drive-updates/nuxeo-drive-x86_64.AppImage\"\n                target=\"_blank\"\n                rel=\"noopener noreferrer\"\n              >\n                nuxeo-drive-x86_64.AppImage\n              </a>\n            </td>\n          </tr>\n          <tr>\n            <td>macOS</td>\n            <td>\n              <a\n                class=\"nuxeo-drive-card__download-link\"\n                href=\"https://community.nuxeo.com/static/drive-updates/nuxeo-drive.dmg\"\n                target=\"_blank\"\n                rel=\"noopener noreferrer\"\n              >\n                <code>Nuxeo-Drive.DMG</code>\n              </a>\n            </td>\n          </tr>\n          <tr>\n            <td>{{ 'app.nuxeo-drive-page.windows' | translate }}</td>\n            <td>\n              <a\n                class=\"nuxeo-drive-card__download-link\"\n                href=\"https://community.nuxeo.com/static/drive-updates/nuxeo-drive.exe\"\n                target=\"_blank\"\n                rel=\"noopener noreferrer\"\n              >\n                <code>Nuxeo-Drive.EXE</code>\n              </a>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </article>\n\n  <article class=\"nuxeo-drive-card\">\n    <div class=\"nuxeo-drive-card__section-title\" role=\"heading\" aria-level=\"3\">\n      {{ 'app.nuxeo-drive-page.synchronization-roots' | translate }}\n    </div>\n    <div class=\"nuxeo-drive-card__table-wrapper\">\n      <table class=\"nuxeo-drive-card__table\">\n        <thead>\n          <tr>\n            <th>{{ 'app.nuxeo-drive-page.title' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.path' | translate }}</th>\n            <th class=\"nuxeo-drive-card__action-header\"></th>\n          </tr>\n        </thead>\n        <tbody>\n          @if (synchronizationRootsLoading()) {\n            <tr>\n              <td colspan=\"3\" class=\"nuxeo-drive-card__table-empty\">\n                <div class=\"nuxeo-drive-card__table-empty-content\">\n                  {{ 'app.nuxeo-drive-page.loading-synchronization-roots' | translate }}\n                </div>\n              </td>\n            </tr>\n          } @else if (synchronizationRoots().length === 0) {\n            <tr>\n              <td colspan=\"3\" class=\"nuxeo-drive-card__table-empty\">\n                <div class=\"nuxeo-drive-card__table-empty-content\">\n                  {{\n                    'app.nuxeo-drive-page.you-currently-dont-have-any-synchronization' | translate\n                  }}\n                </div>\n              </td>\n            </tr>\n          } @else {\n            @for (root of synchronizationRoots(); track root.id + root.path) {\n              <tr>\n                <td>{{ root.title }}</td>\n                <td>{{ root.path }}</td>\n                <td class=\"nuxeo-drive-card__action-cell\">\n                  <button\n                    type=\"button\"\n                    class=\"nuxeo-drive-card__remove-root-button\"\n                    [disabled]=\"isRootActionPending(root.id)\"\n                    (click)=\"removeSynchronizationRoot(root)\"\n                    [attr.aria-label]=\"\n                      'app.nuxeo-drive-page.remove-synchronization-root' | translate\n                    \"\n                  >\n                    \u00D7\n                  </button>\n                </td>\n              </tr>\n            }\n          }\n        </tbody>\n      </table>\n    </div>\n  </article>\n\n  <article class=\"nuxeo-drive-card\">\n    <div class=\"nuxeo-drive-card__section-title\" role=\"heading\" aria-level=\"3\">\n      {{ 'app.nuxeo-drive-page.tokens' | translate }}\n    </div>\n    <div class=\"nuxeo-drive-card__table-wrapper\">\n      <table class=\"nuxeo-drive-card__table\">\n        <thead>\n          <tr>\n            <th>{{ 'app.nuxeo-drive-page.token' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.application' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.device-identifier' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.device-description' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.permission' | translate }}</th>\n            <th>{{ 'app.nuxeo-drive-page.created' | translate }}</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td colspan=\"6\" class=\"nuxeo-drive-card__table-empty\">\n              <div class=\"nuxeo-drive-card__table-empty-content\">\n                {{ 'app.nuxeo-drive-page.you-currently-dont-have-any-tokens' | translate }}\n              </div>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </article>\n</section>\n", styles: [":host {\n  display: block;\n}\n\n.nuxeo-drive-page {\n  padding: 1.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n.nuxeo-drive-card {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 1.25rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n}\n\n.nuxeo-drive-card__title {\n  margin: 0 0 0.75rem;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.nuxeo-drive-card__section-title {\n  margin: 0 0 0.75rem;\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n}\n\n.nuxeo-drive-card__table-wrapper {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.nuxeo-drive-card__table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.nuxeo-drive-card__table th,\n.nuxeo-drive-card__table td {\n  padding: 0.75rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.92rem;\n  overflow-wrap: anywhere;\n}\n\n.nuxeo-drive-card__table th {\n  font-weight: 400;\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n}\n\n.nuxeo-drive-card__action-header,\n.nuxeo-drive-card__action-cell {\n  width: 52px;\n  text-align: right;\n}\n\n.nuxeo-drive-card__table-empty {\n  padding: 0;\n  vertical-align: middle;\n}\n\n.nuxeo-drive-card__table-empty-content {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 88px;\n  padding: 1rem;\n  text-align: center;\n  color: #667085;\n}\n\n.nuxeo-drive-card__download-link {\n  display: inline-block;\n  padding: 0.125rem 0.375rem;\n  border-radius: 6px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n  transition:\n    background-color 120ms ease,\n    color 120ms ease;\n}\n\n.nuxeo-drive-card__download-link:hover,\n.nuxeo-drive-card__download-link:focus-visible {\n  background: #eef4ff;\n  color: #1d4ed8;\n  outline: none;\n}\n\n.nuxeo-drive-card__remove-root-button {\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 1.1rem;\n  line-height: 1;\n  width: 28px;\n  height: 28px;\n  border-radius: 999px;\n  cursor: pointer;\n  color: #667085;\n}\n\n.nuxeo-drive-card__remove-root-button:hover,\n.nuxeo-drive-card__remove-root-button:focus-visible {\n  background: #fee4e2;\n  color: #b42318;\n  outline: none;\n}\n\n.nuxeo-drive-card__remove-root-button:disabled {\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NuxeoDrivePageComponent, { className: "NuxeoDrivePageComponent", filePath: "apps/nuxeo-ui/src/app/settings/nuxeo-drive/nuxeo-drive-page.component.ts", lineNumber: 13 }); })();
