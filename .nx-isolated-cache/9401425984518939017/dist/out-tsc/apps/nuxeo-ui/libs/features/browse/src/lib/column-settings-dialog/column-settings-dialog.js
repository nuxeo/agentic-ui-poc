import { Component, inject } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/checkbox";
const _forTrack0 = ($index, $item) => $item.key;
function ColumnSettingsDialogComponent_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 5);
    i0.ɵɵtwoWayListener("ngModelChange", function ColumnSettingsDialogComponent_For_5_Template_mat_checkbox_ngModelChange_0_listener($event) { const col_r2 = i0.ɵɵrestoreView(_r1).$implicit; i0.ɵɵtwoWayBindingSet(col_r2.visible, $event) || (col_r2.visible = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r2 = ctx.$implicit;
    i0.ɵɵtwoWayProperty("ngModel", col_r2.visible);
    i0.ɵɵproperty("disabled", col_r2.key === "title");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, col_r2), " ");
} }
/**
 * The packaged column set, kept only as the **fallback** for an injector where
 * Layer 1 registration has not run.
 *
 * `PACKAGED_BROWSE_COLUMNS` in `@nuxeo/satori-platform/extensions` is now the source
 * of truth, and `provide-app-extensions.ts` registers it into the `documentList`
 * slot. This list must mirror it. It survives because a component spec that
 * builds a bare `TestBed` has no `APP_INITIALIZER`, and resolving an empty slot
 * would render a document list with no columns — a silent regression far worse
 * than a stale duplicate. `packaged-columns.spec.ts` asserts the two agree, so
 * the duplication cannot drift unnoticed.
 */
export const ALL_COLUMNS = [
    { key: 'title', labelKey: 'browse.column.title', label: 'Title', visible: true },
    { key: 'type', labelKey: 'browse.column.type', label: 'Type', visible: false },
    { key: 'modified', labelKey: 'browse.column.modified', label: 'Modified', visible: true },
    {
        key: 'lastContributor',
        labelKey: 'browse.column.lastcontributor',
        label: 'Last Contributor',
        visible: true,
    },
    { key: 'state', labelKey: 'browse.column.state', label: 'State', visible: false },
    { key: 'version', labelKey: 'browse.column.version', label: 'Version', visible: false },
    { key: 'created', labelKey: 'browse.column.created', label: 'Created', visible: false },
    { key: 'author', labelKey: 'browse.column.author', label: 'Author', visible: false },
    { key: 'nature', labelKey: 'browse.column.nature', label: 'Nature', visible: false },
    { key: 'coverage', labelKey: 'browse.column.coverage', label: 'Coverage', visible: false },
    { key: 'subjects', labelKey: 'browse.column.subjects', label: 'Subjects', visible: false },
    { key: 'flags', labelKey: 'browse.column.flags', label: 'Flags', visible: false },
];
const STORAGE_KEY = 'browse_column_settings';
/**
 * The keys the user has switched on, or `null` when they have never chosen.
 *
 * `null` and `[]` are different: never-chosen means "use whatever the descriptors
 * default to", whereas an empty array means the user switched everything off.
 * Returning `[]` for both would silently override a manifest's `hiddenByDefault`
 * decisions with the packaged defaults on a fresh browser.
 */
export function loadColumnVisibility() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === null)
            return null;
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : null;
    }
    catch {
        return null;
    }
}
export function loadColumnSettings() {
    const keys = loadColumnVisibility();
    if (keys)
        return ALL_COLUMNS.map((col) => ({ ...col, visible: keys.includes(col.key) }));
    return ALL_COLUMNS.map((col) => ({ ...col }));
}
export function saveColumnSettings(columns) {
    const visibleKeys = columns.filter((c) => c.visible).map((c) => c.key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleKeys));
}
export class ColumnSettingsDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    columns = this.data.map((c) => ({ ...c }));
    reset() {
        this.columns = ALL_COLUMNS.map((c) => ({ ...c }));
    }
    done() {
        saveColumnSettings(this.columns);
        this.dialogRef.close(this.columns);
    }
    static ɵfac = function ColumnSettingsDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ColumnSettingsDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ColumnSettingsDialogComponent, selectors: [["lib-column-settings-dialog"]], decls: 13, vars: 9, consts: [["mat-dialog-title", ""], [3, "ngModel", "disabled"], ["align", "end"], ["mat-stroked-button", "", 3, "click"], ["mat-flat-button", "", "color", "primary", 3, "click"], [3, "ngModelChange", "ngModel", "disabled"]], template: function ColumnSettingsDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content");
            i0.ɵɵrepeaterCreate(4, ColumnSettingsDialogComponent_For_5_Template, 3, 5, "mat-checkbox", 1, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-dialog-actions", 2)(7, "button", 3);
            i0.ɵɵlistener("click", function ColumnSettingsDialogComponent_Template_button_click_7_listener() { return ctx.reset(); });
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "button", 4);
            i0.ɵɵlistener("click", function ColumnSettingsDialogComponent_Template_button_click_10_listener() { return ctx.done(); });
            i0.ɵɵtext(11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 3, "browse.column-settings-dialog.columns-settings"));
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.columns);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 5, "browse.column-settings-dialog.reset"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 7, "browse.column-settings-dialog.done"), " ");
        } }, dependencies: [FormsModule, i1.NgControlStatus, i1.NgModel, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, MatCheckboxModule, i4.MatCheckbox, DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n        display: block;\n        min-width: 300px;\n      }\n      mat-dialog-content[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        padding: 16px 24px !important;\n      }\n      mat-dialog-actions[_ngcontent-%COMP%] {\n        padding: 8px 24px 16px;\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ColumnSettingsDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-column-settings-dialog', standalone: true, imports: [
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatCheckboxModule,
                ], template: "<h2 mat-dialog-title>{{ 'browse.column-settings-dialog.columns-settings' | translate }}</h2>\n\n<mat-dialog-content>\n  @for (col of columns; track col.key) {\n    <mat-checkbox [(ngModel)]=\"col.visible\" [disabled]=\"col.key === 'title'\">\n      {{ col | descriptorLabel }}\n    </mat-checkbox>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-stroked-button (click)=\"reset()\">\n    {{ 'browse.column-settings-dialog.reset' | translate }}\n  </button>\n  <button mat-flat-button color=\"primary\" (click)=\"done()\">\n    {{ 'browse.column-settings-dialog.done' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: ["\n      :host {\n        display: block;\n        min-width: 300px;\n      }\n      mat-dialog-content {\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        padding: 16px 24px !important;\n      }\n      mat-dialog-actions {\n        padding: 8px 24px 16px;\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ColumnSettingsDialogComponent, { className: "ColumnSettingsDialogComponent", filePath: "libs/features/browse/src/lib/column-settings-dialog/column-settings-dialog.ts", lineNumber: 111 }); })();
