import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { NuxeoDriveService } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
const _forTrack0 = ($index, $item) => $item.platform;
function NxsDriveDialogComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 1);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "output", 2);
    i0.ɵɵelement(4, "nxs-spinner", 3);
    i0.ɵɵelementStart(5, "span", 4);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "satori-components.drive-dialog.name"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 4, "satori-components.drive-dialog.checking"), " ");
} }
function NxsDriveDialogComponent_Conditional_2_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "span", 9);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td")(5, "a", 10);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const pkg_r2 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(pkg_r2.platform);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("href", pkg_r2.url, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(pkg_r2.name);
} }
function NxsDriveDialogComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h2", 5);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "table", 6)(4, "thead")(5, "tr")(6, "th", 7);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th", 7);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵrepeaterCreate(13, NxsDriveDialogComponent_Conditional_2_For_14_Template, 7, 3, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "button", 8);
    i0.ɵɵlistener("click", function NxsDriveDialogComponent_Conditional_2_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.close()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 4, "satori-components.drive-dialog.title"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 6, "satori-components.drive-dialog.platform"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 8, "satori-components.drive-dialog.package"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.packages);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 10, "satori-components.drive-dialog.close"), " ");
} }
const DRIVE_PACKAGES = [
    {
        platform: 'Linux',
        name: 'Nuxeo-Drive-X86_64.AppImage',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive-x86_64.AppImage',
    },
    {
        platform: 'macOS',
        name: 'Nuxeo-Drive.Dmg',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.dmg',
    },
    {
        platform: 'Windows',
        name: 'Nuxeo-Drive.Exe',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.exe',
    },
];
/**
 * "Open with Nuxeo Drive", as a `MatDialog`: `dialog.open(NxsDriveDialogComponent, { data })`.
 *
 * It first asks Nuxeo whether this user has a Drive token. With one, it hands Drive the folder
 * through a `nxdrive://direct-transfer` link and closes itself — direct-transfer matches on the
 * server URL alone, where `nxdrive://edit` also matches the username and fails on some Drive
 * configurations. Without one, including when the check fails, it offers the installers.
 */
export class NxsDriveDialogComponent {
    dialogRef = inject(MatDialogRef);
    drive = inject(NuxeoDriveService);
    data = inject(MAT_DIALOG_DATA, { optional: true });
    packages = DRIVE_PACKAGES;
    checking = signal(true, ...(ngDevMode ? [{ debugName: "checking" }] : []));
    constructor() {
        this.drive
            .hasDriveToken()
            .pipe(takeUntilDestroyed())
            .subscribe((hasToken) => {
            if (!hasToken) {
                this.checking.set(false);
                return;
            }
            this.drive.openDriveUrl(this.drive.buildDirectTransferUrl(this.data?.folderPath || '/'));
            this.dialogRef.close();
        });
    }
    close() {
        this.dialogRef.close();
    }
    static ɵfac = function NxsDriveDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDriveDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDriveDialogComponent, selectors: [["nxs-drive-dialog"]], hostAttrs: [1, "nxs-drive-dialog"], decls: 3, vars: 1, consts: [[1, "nxs-drive-dialog__body"], ["mat-dialog-title", "", 1, "nxs-drive-dialog__name"], [1, "nxs-drive-dialog__checking"], ["diameter", "32"], [1, "nxs-drive-dialog__checking-text"], ["mat-dialog-title", "", 1, "nxs-drive-dialog__title"], [1, "nxs-drive-dialog__table"], ["scope", "col"], ["type", "button", 1, "nxs-drive-dialog__close", 3, "click"], [1, "nxs-drive-dialog__platform"], ["target", "_blank", "rel", "noopener", 1, "nxs-drive-dialog__package", 3, "href"]], template: function NxsDriveDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, NxsDriveDialogComponent_Conditional_1_Template, 8, 6)(2, NxsDriveDialogComponent_Conditional_2_Template, 18, 12);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.checking() ? 1 : 2);
        } }, dependencies: [MatDialogModule, i1.MatDialogTitle, NxsSpinnerComponent, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.nxs-drive-dialog__body[_ngcontent-%COMP%] {\n  box-sizing: border-box;\n  // Never wider than the pane MatDialog gives the dialog: below 600 px that is `100vw - 32px`,\n  // narrower than the `95vw` this once was, which scrolled sideways at 320 px.\n  width: 460px;\n  max-width: 100%;\n  padding: 28px 32px;\n}\n\n//[_ngcontent-%COMP%]   `mat-dialog-title`[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   here[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   dialog's[_ngcontent-%COMP%]   accessible[_ngcontent-%COMP%]   name;[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   dialog's[_ngcontent-%COMP%]   own.\n.nxs-drive-dialog__title.nxs-drive-dialog__title[_ngcontent-%COMP%] {\n  margin: 0 0 24px;\n  padding: 0;\n  font-size: 22px;\n  font-weight: 600;\n  line-height: normal;\n  color: var(--mat-sys-on-surface);\n\n  &::before {\n    display: none;\n  }\n}\n\n//[_ngcontent-%COMP%]   Names[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   dialog[_ngcontent-%COMP%]   while[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   check[_ngcontent-%COMP%]   runs[_ngcontent-%COMP%], when[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   visible[_ngcontent-%COMP%]   status[_ngcontent-%COMP%]   line[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   all[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   shows.\n.nxs-drive-dialog__name.nxs-drive-dialog__name[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}\n\n.nxs-drive-dialog__checking[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  padding: 32px 0;\n}\n\n.nxs-drive-dialog__checking-text[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-drive-dialog__table[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-bottom: 24px;\n  border-collapse: collapse;\n\n  th {\n    padding: 0 16px 12px 0;\n    font-size: 13px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface-variant);\n    text-align: left;\n  }\n\n  td {\n    padding: 12px 16px 12px 0;\n    border-top: 1px solid var(--mat-sys-outline-variant);\n    vertical-align: middle;\n  }\n}\n\n.nxs-drive-dialog__platform[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 3px 10px;\n  border-radius: 3px;\n  background: var(--mat-sys-inverse-surface);\n  color: var(--mat-sys-inverse-on-surface);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.nxs-drive-dialog__package[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface);\n  text-decoration: none;\n\n  &:hover,\n  &:focus-visible {\n    color: var(--mat-sys-primary);\n    text-decoration: underline;\n  }\n}\n\n.nxs-drive-dialog__close[_ngcontent-%COMP%] {\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 14px;\n  color: var(--mat-sys-primary);\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible {\n    text-decoration: underline;\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDriveDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-drive-dialog', standalone: true, imports: [MatDialogModule, NxsSpinnerComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-drive-dialog' }, template: "<div class=\"nxs-drive-dialog__body\">\n  @if (checking()) {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__name\">\n      {{ 'satori-components.drive-dialog.name' | translate }}\n    </h2>\n    <output class=\"nxs-drive-dialog__checking\">\n      <nxs-spinner diameter=\"32\" />\n      <span class=\"nxs-drive-dialog__checking-text\">\n        {{ 'satori-components.drive-dialog.checking' | translate }}\n      </span>\n    </output>\n  } @else {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__title\">\n      {{ 'satori-components.drive-dialog.title' | translate }}\n    </h2>\n    <table class=\"nxs-drive-dialog__table\">\n      <thead>\n        <tr>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.platform' | translate }}</th>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.package' | translate }}</th>\n        </tr>\n      </thead>\n      <tbody>\n        @for (pkg of packages; track pkg.platform) {\n          <tr>\n            <td>\n              <span class=\"nxs-drive-dialog__platform\">{{ pkg.platform }}</span>\n            </td>\n            <td>\n              <a\n                class=\"nxs-drive-dialog__package\"\n                [href]=\"pkg.url\"\n                target=\"_blank\"\n                rel=\"noopener\"\n                >{{ pkg.name }}</a\n              >\n            </td>\n          </tr>\n        }\n      </tbody>\n    </table>\n    <button type=\"button\" class=\"nxs-drive-dialog__close\" (click)=\"close()\">\n      {{ 'satori-components.drive-dialog.close' | translate }}\n    </button>\n  }\n</div>\n", styles: [":host {\n  display: block;\n}\n\n.nxs-drive-dialog__body {\n  box-sizing: border-box;\n  // Never wider than the pane MatDialog gives the dialog: below 600 px that is `100vw - 32px`,\n  // narrower than the `95vw` this once was, which scrolled sideways at 320 px.\n  width: 460px;\n  max-width: 100%;\n  padding: 28px 32px;\n}\n\n// `mat-dialog-title` is here for the dialog's accessible name; the layout is this dialog's own.\n.nxs-drive-dialog__title.nxs-drive-dialog__title {\n  margin: 0 0 24px;\n  padding: 0;\n  font-size: 22px;\n  font-weight: 600;\n  line-height: normal;\n  color: var(--mat-sys-on-surface);\n\n  &::before {\n    display: none;\n  }\n}\n\n// Names the dialog while the check runs, when the visible status line is all it shows.\n.nxs-drive-dialog__name.nxs-drive-dialog__name {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  margin: 0;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}\n\n.nxs-drive-dialog__checking {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  padding: 32px 0;\n}\n\n.nxs-drive-dialog__checking-text {\n  margin: 0;\n  font-size: 15px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-drive-dialog__table {\n  width: 100%;\n  margin-bottom: 24px;\n  border-collapse: collapse;\n\n  th {\n    padding: 0 16px 12px 0;\n    font-size: 13px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface-variant);\n    text-align: left;\n  }\n\n  td {\n    padding: 12px 16px 12px 0;\n    border-top: 1px solid var(--mat-sys-outline-variant);\n    vertical-align: middle;\n  }\n}\n\n.nxs-drive-dialog__platform {\n  display: inline-block;\n  padding: 3px 10px;\n  border-radius: 3px;\n  background: var(--mat-sys-inverse-surface);\n  color: var(--mat-sys-inverse-on-surface);\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.nxs-drive-dialog__package {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface);\n  text-decoration: none;\n\n  &:hover,\n  &:focus-visible {\n    color: var(--mat-sys-primary);\n    text-decoration: underline;\n  }\n}\n\n.nxs-drive-dialog__close {\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 14px;\n  color: var(--mat-sys-primary);\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible {\n    text-decoration: underline;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDriveDialogComponent, { className: "NxsDriveDialogComponent", filePath: "libs/shared/satori-components/src/lib/drive-dialog/drive-dialog.component.ts", lineNumber: 56 }); })();
