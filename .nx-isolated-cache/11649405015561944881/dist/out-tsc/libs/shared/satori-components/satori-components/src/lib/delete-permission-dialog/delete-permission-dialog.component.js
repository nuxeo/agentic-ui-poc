import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, LOCALE_ID, inject, signal, } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { DocumentDetailService, permissionRightLabel, resolveAcePrincipal, } from '@nuxeo/satori-platform/nuxeo-client';
import { failureKey, nxsAceTimeFrame, principalLabel } from '../permission-dialog-support';
import { NxsToastService, provideNxsToast } from '../toast/toast.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
const _forTrack0 = ($index, $item) => $item.label;
function NxsDeletePermissionDialogComponent_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const field_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, field_r1.label));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(field_r1.value);
} }
function NxsDeletePermissionDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 1);
    i0.ɵɵrepeaterCreate(1, NxsDeletePermissionDialogComponent_Conditional_4_For_2_Template, 6, 4, "div", null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.fields);
} }
function NxsDeletePermissionDialogComponent_Conditional_5_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, field_r3.label));
} }
function NxsDeletePermissionDialogComponent_Conditional_5_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(field_r4.value);
} }
function NxsDeletePermissionDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 2)(1, "thead")(2, "tr");
    i0.ɵɵrepeaterCreate(3, NxsDeletePermissionDialogComponent_Conditional_5_For_4_Template, 3, 3, "th", 6, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "tbody")(6, "tr");
    i0.ɵɵrepeaterCreate(7, NxsDeletePermissionDialogComponent_Conditional_5_For_8_Template, 2, 1, "td", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.fields);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.fields);
} }
function NxsDeletePermissionDialogComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 7);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "satori-components.permission-dialogs.delete.deleting"), " ");
} }
function NxsDeletePermissionDialogComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permission-dialogs.delete.delete"), " ");
} }
/**
 * Confirms, then deletes, one permission entry, as a `MatDialog`:
 * `dialog.open(NxsDeletePermissionDialogComponent, { data, role: 'alertdialog' })`.
 *
 * It deletes the entry by its id, as Web UI does, so the user's other entries on the document stay.
 * It closes with `true` once Nuxeo has deleted it; a failure is reported and the dialog stays open.
 */
export class NxsDeletePermissionDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    deleting = signal(false, ...(ngDevMode ? [{ debugName: "deleting" }] : []));
    principal = principalLabel(this.data.ace);
    right = permissionRightLabel(this.data.ace.permission, (key) => this.translate.instant(key));
    timeFrame = nxsAceTimeFrame(this.data.ace, (key, params) => this.translate.instant(key, params), this.locale);
    grantedBy = this.data.ace.creator
        ? resolveAcePrincipal(this.data.ace.creator)
        : '—';
    /** The entry's four fields, under the labels of the Permissions tab's columns. */
    fields = [
        { label: 'satori-components.permission-dialogs.user-group', value: this.principal },
        { label: 'satori-components.permission-dialogs.right', value: this.right },
        { label: 'satori-components.permission-dialogs.time-frame', value: this.timeFrame },
        { label: 'satori-components.permission-dialogs.granted-by', value: this.grantedBy },
    ];
    /**
     * Below Material's small-screen breakpoint, where MatDialog narrows to the screen, the four
     * columns do not fit, so the entry shows as one label and value row per field instead.
     * `observe()` answers with the current state as it subscribes, so the first render already has
     * the right layout and a phone never sees the table first.
     */
    narrow = toSignal(inject(BreakpointObserver)
        .observe(Breakpoints.XSmall)
        .pipe(map((state) => state.matches)), { requireSync: true });
    confirm() {
        if (this.deleting())
            return;
        this.deleting.set(true);
        this.detail
            .removePermissionById(this.data.documentUid, this.data.ace.id, this.data.acl ?? 'local')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.dialogRef.close(true),
            error: (error) => {
                this.deleting.set(false);
                this.toast.error(this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.delete')));
            },
        });
    }
    static ɵfac = function NxsDeletePermissionDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDeletePermissionDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDeletePermissionDialogComponent, selectors: [["nxs-delete-permission-dialog"]], hostAttrs: [1, "nxs-delete-permission-dialog"], features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 13, vars: 10, consts: [["mat-dialog-title", ""], [1, "nxs-delete-permission-dialog__rows"], [1, "nxs-delete-permission-dialog__entry"], ["align", "end"], ["mat-button", "", "type", "button", "mat-dialog-close", "", 3, "disabled"], ["mat-flat-button", "", "type", "button", 1, "nxs-delete-permission-dialog__delete", 3, "click", "disabled"], ["scope", "col"], ["aria-hidden", "true", 1, "nxs-spinning"]], template: function NxsDeletePermissionDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵconditionalCreate(4, NxsDeletePermissionDialogComponent_Conditional_4_Template, 3, 0, "dl", 1)(5, NxsDeletePermissionDialogComponent_Conditional_5_Template, 9, 0, "table", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions", 3)(7, "button", 4);
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "button", 5);
            i0.ɵɵlistener("click", function NxsDeletePermissionDialogComponent_Template_button_click_10_listener() { return ctx.confirm(); });
            i0.ɵɵconditionalCreate(11, NxsDeletePermissionDialogComponent_Conditional_11_Template, 4, 3)(12, NxsDeletePermissionDialogComponent_Conditional_12_Template, 2, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 6, "satori-components.permission-dialogs.delete.title"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.narrow() ? 4 : 5);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.deleting());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 8, "satori-components.permission-dialogs.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.deleting());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.deleting() ? 11 : 12);
        } }, dependencies: [MatButton, MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatIcon, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  --nxs-delete-permission-dialog-border: var(--mat-sys-outline-variant);\n  --nxs-delete-permission-dialog-header: var(--mat-sys-surface-container);\n}\n\n.nxs-delete-permission-dialog__entry[_ngcontent-%COMP%] {\n  width: 100%;\n  border: 1px solid var(--nxs-delete-permission-dialog-border);\n  border-collapse: collapse;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n\n  th,\n  td {\n    padding: 10px 16px;\n    text-align: start;\n  }\n\n  th {\n    font-size: 12px;\n    font-weight: 600;\n    background: var(--nxs-delete-permission-dialog-header);\n    border-bottom: 1px solid var(--nxs-delete-permission-dialog-border);\n  }\n}\n\n//[_ngcontent-%COMP%]   Below[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   small-screen[_ngcontent-%COMP%]   breakpoint[_ngcontent-%COMP%]:   one[_ngcontent-%COMP%]   row[_ngcontent-%COMP%]   per[_ngcontent-%COMP%]   field[_ngcontent-%COMP%], label[_ngcontent-%COMP%]   beside[_ngcontent-%COMP%]   value[_ngcontent-%COMP%], framed[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   is.\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   rows'[_ngcontent-%COMP%]   `div`s[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   group[_ngcontent-%COMP%]   each[_ngcontent-%COMP%]   pair;[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   grid[_ngcontent-%COMP%]   lines[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   labels[_ngcontent-%COMP%]   up[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   one[_ngcontent-%COMP%]   column.\n.nxs-delete-permission-dialog__rows[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: max-content minmax(0, 1fr);\n  margin: 0;\n  border: 1px solid var(--nxs-delete-permission-dialog-border);\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n\n  div {\n    display: contents;\n  }\n\n  dt,\n  dd {\n    margin: 0;\n    padding: 10px 16px;\n  }\n\n  dt {\n    font-size: 12px;\n    font-weight: 600;\n    background: var(--nxs-delete-permission-dialog-header);\n  }\n\n  dd {\n    overflow-wrap: anywhere;\n  }\n\n  div + div > * {\n    border-top: 1px solid var(--nxs-delete-permission-dialog-border);\n  }\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   spinning[_ngcontent-%COMP%]   icon,[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   progress[_ngcontent-%COMP%]   indicator,[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   button:[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   progressbar[_ngcontent-%COMP%]   there[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   an\n//[_ngcontent-%COMP%]   interactive[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   nested[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   another[_ngcontent-%COMP%]   (axe nested-interactive),[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   spinner[_ngcontent-%COMP%]   breaks[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   button's[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   (AGENTS/08-bug-patterns.md 15).\n.nxs-spinning[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_nxs-spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_nxs-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDeletePermissionDialogComponent, [{
        type: Component,
        args: [{ selector: 'nxs-delete-permission-dialog', standalone: true, imports: [MatButton, MatDialogModule, MatIcon, TranslatePipe], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-delete-permission-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.delete.title' | translate }}</h2>\n\n<mat-dialog-content>\n  @if (narrow()) {\n    <dl class=\"nxs-delete-permission-dialog__rows\">\n      @for (field of fields; track field.label) {\n        <div>\n          <dt>{{ field.label | translate }}</dt>\n          <dd>{{ field.value }}</dd>\n        </div>\n      }\n    </dl>\n  } @else {\n    <table class=\"nxs-delete-permission-dialog__entry\">\n      <thead>\n        <tr>\n          @for (field of fields; track field.label) {\n            <th scope=\"col\">{{ field.label | translate }}</th>\n          }\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          @for (field of fields; track field.label) {\n            <td>{{ field.value }}</td>\n          }\n        </tr>\n      </tbody>\n    </table>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"deleting()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-delete-permission-dialog__delete\"\n    [disabled]=\"deleting()\"\n    (click)=\"confirm()\"\n  >\n    @if (deleting()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.permission-dialogs.delete.deleting' | translate }}\n    } @else {\n      {{ 'satori-components.permission-dialogs.delete.delete' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  --nxs-delete-permission-dialog-border: var(--mat-sys-outline-variant);\n  --nxs-delete-permission-dialog-header: var(--mat-sys-surface-container);\n}\n\n.nxs-delete-permission-dialog__entry {\n  width: 100%;\n  border: 1px solid var(--nxs-delete-permission-dialog-border);\n  border-collapse: collapse;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n\n  th,\n  td {\n    padding: 10px 16px;\n    text-align: start;\n  }\n\n  th {\n    font-size: 12px;\n    font-weight: 600;\n    background: var(--nxs-delete-permission-dialog-header);\n    border-bottom: 1px solid var(--nxs-delete-permission-dialog-border);\n  }\n}\n\n// Below the small-screen breakpoint: one row per field, label beside value, framed as the table is.\n// The rows' `div`s only group each pair; the grid lines the labels up in one column.\n.nxs-delete-permission-dialog__rows {\n  display: grid;\n  grid-template-columns: max-content minmax(0, 1fr);\n  margin: 0;\n  border: 1px solid var(--nxs-delete-permission-dialog-border);\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n\n  div {\n    display: contents;\n  }\n\n  dt,\n  dd {\n    margin: 0;\n    padding: 10px 16px;\n  }\n\n  dt {\n    font-size: 12px;\n    font-weight: 600;\n    background: var(--nxs-delete-permission-dialog-header);\n  }\n\n  dd {\n    overflow-wrap: anywhere;\n  }\n\n  div + div > * {\n    border-top: 1px solid var(--nxs-delete-permission-dialog-border);\n  }\n}\n\n// A spinning icon, not a progress indicator, inside the button: a progressbar there is an\n// interactive element nested in another (axe nested-interactive), and a spinner breaks the\n// button's layout (AGENTS/08-bug-patterns.md 15).\n.nxs-spinning {\n  animation: nxs-spin 1s linear infinite;\n}\n\n@keyframes nxs-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDeletePermissionDialogComponent, { className: "NxsDeletePermissionDialogComponent", filePath: "libs/shared/satori-components/src/lib/delete-permission-dialog/delete-permission-dialog.component.ts", lineNumber: 53 }); })();
//# sourceMappingURL=delete-permission-dialog.component.js.map