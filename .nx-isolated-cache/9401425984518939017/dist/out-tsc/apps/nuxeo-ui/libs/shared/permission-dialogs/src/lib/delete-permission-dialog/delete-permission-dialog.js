import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/progress-spinner";
function DeletePermissionDialogComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 5);
} }
function DeletePermissionDialogComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "permission-dialogs.delete-permission-dialog.delete"), " ");
} }
export class DeletePermissionDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    deleting = signal(false, ...(ngDevMode ? [{ debugName: "deleting" }] : []));
    confirmDelete() {
        if (this.deleting())
            return;
        this.deleting.set(true);
        this.detailService
            .removePermission(this.data.documentUid, {
            user: this.data.ace.username,
            permission: this.data.ace.permission,
            acl: 'local',
        })
            .subscribe({
            next: () => {
                this.deleting.set(false);
                this.dialogRef.close(true);
            },
            error: () => {
                this.deleting.set(false);
            },
        });
    }
    static ɵfac = function DeletePermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DeletePermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DeletePermissionDialogComponent, selectors: [["lib-delete-permission-dialog"]], decls: 37, vars: 24, consts: [["mat-dialog-title", ""], [1, "confirm-table"], ["mat-stroked-button", "", "mat-dialog-close", ""], [1, "spacer"], ["mat-stroked-button", "", "color", "warn", 3, "click", "disabled"], ["diameter", "18"]], template: function DeletePermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content")(4, "table", 1)(5, "thead")(6, "tr")(7, "th");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "th");
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "th");
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "th");
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(19, "tbody")(20, "tr")(21, "td");
            i0.ɵɵtext(22);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "td");
            i0.ɵɵtext(24);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "td");
            i0.ɵɵtext(26);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "td");
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(29, "mat-dialog-actions")(30, "button", 2);
            i0.ɵɵtext(31);
            i0.ɵɵpipe(32, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(33, "span", 3);
            i0.ɵɵelementStart(34, "button", 4);
            i0.ɵɵlistener("click", function DeletePermissionDialogComponent_Template_button_click_34_listener() { return ctx.confirmDelete(); });
            i0.ɵɵconditionalCreate(35, DeletePermissionDialogComponent_Conditional_35_Template, 1, 0, "mat-spinner", 5)(36, DeletePermissionDialogComponent_Conditional_36_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 12, "permissions.delete-permission-dialog.the-following-permission-will-be-deleted"), "\n");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 14, "permissions.delete-permission-dialog.user-group"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 16, "permissions.delete-permission-dialog.right"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 18, "permissions.delete-permission-dialog.time-frame"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 20, "permissions.delete-permission-dialog.granted-by"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.data.ace.username);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.data.permissionLabel);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.data.timeFrameLabel);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.data.ace.creator ?? "\u2014");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(32, 22, "permissions.delete-permission-dialog.cancel"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.deleting());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.deleting() ? 35 : 36);
        } }, dependencies: [MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, MatProgressSpinnerModule, i3.MatProgressSpinner, TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 460px;\n      }\n\n      .confirm-table[_ngcontent-%COMP%] {\n        width: 100%;\n        border-collapse: collapse;\n        border: 1px solid #e0e0e0;\n        border-radius: 4px;\n\n        th {\n          text-align: left;\n          padding: 10px 16px;\n          font-size: 12px;\n          font-weight: 600;\n          color: #333;\n          background: #fafafa;\n          border-bottom: 1px solid #e0e0e0;\n        }\n\n        td {\n          padding: 12px 16px;\n          font-size: 13px;\n          color: #333;\n        }\n      }\n\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        display: flex;\n        gap: 8px;\n        padding: 12px 24px 16px;\n      }\n\n      .spacer[_ngcontent-%COMP%] {\n        flex: 1;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DeletePermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-delete-permission-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule, MatProgressSpinnerModule], template: "<h2 mat-dialog-title>\n  {{ 'permissions.delete-permission-dialog.the-following-permission-will-be-deleted' | translate }}\n</h2>\n\n<mat-dialog-content>\n  <table class=\"confirm-table\">\n    <thead>\n      <tr>\n        <th>{{ 'permissions.delete-permission-dialog.user-group' | translate }}</th>\n        <th>{{ 'permissions.delete-permission-dialog.right' | translate }}</th>\n        <th>{{ 'permissions.delete-permission-dialog.time-frame' | translate }}</th>\n        <th>{{ 'permissions.delete-permission-dialog.granted-by' | translate }}</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>{{ data.ace.username }}</td>\n        <td>{{ data.permissionLabel }}</td>\n        <td>{{ data.timeFrameLabel }}</td>\n        <td>{{ data.ace.creator ?? '\u2014' }}</td>\n      </tr>\n    </tbody>\n  </table>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close>\n    {{ 'permissions.delete-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button mat-stroked-button color=\"warn\" [disabled]=\"deleting()\" (click)=\"confirmDelete()\">\n    @if (deleting()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'permission-dialogs.delete-permission-dialog.delete' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 460px;\n      }\n\n      .confirm-table {\n        width: 100%;\n        border-collapse: collapse;\n        border: 1px solid #e0e0e0;\n        border-radius: 4px;\n\n        th {\n          text-align: left;\n          padding: 10px 16px;\n          font-size: 12px;\n          font-weight: 600;\n          color: #333;\n          background: #fafafa;\n          border-bottom: 1px solid #e0e0e0;\n        }\n\n        td {\n          padding: 12px 16px;\n          font-size: 13px;\n          color: #333;\n        }\n      }\n\n      mat-dialog-actions {\n        display: flex;\n        gap: 8px;\n        padding: 12px 24px 16px;\n      }\n\n      .spacer {\n        flex: 1;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DeletePermissionDialogComponent, { className: "DeletePermissionDialogComponent", filePath: "libs/shared/permission-dialogs/src/lib/delete-permission-dialog/delete-permission-dialog.ts", lineNumber: 63 }); })();
