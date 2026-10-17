import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentDetailService } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/progress-spinner";
const _forTrack0 = ($index, $item) => $item.uid;
const _forTrack1 = ($index, $item) => $item.name;
function PublishDialogComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 9);
    i0.ɵɵelementEnd();
} }
function PublishDialogComponent_Conditional_7_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", s_r3.uid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r1.sectionIndent(s_r3.depth), "", s_r3.title);
} }
function PublishDialogComponent_Conditional_7_Conditional_18_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const r_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", r_r5.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(r_r5.label);
} }
function PublishDialogComponent_Conditional_7_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 20)(1, "span", 24);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "select", 25);
    i0.ɵɵtwoWayListener("ngModelChange", function PublishDialogComponent_Conditional_7_Conditional_18_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.selectedRendition, $event) || (ctx_r1.selectedRendition = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(5, "option", 26);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "option", 27);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(11, PublishDialogComponent_Conditional_7_Conditional_18_For_12_Template, 2, 2, "option", 16, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "document-detail.publish-dialog.renditions"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.selectedRendition);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "document-detail.publish-dialog.none"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 8, "document-detail.publish-dialog.default-rendition"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.data.renditions);
} }
function PublishDialogComponent_Conditional_7_For_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const v_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("value", ctx_r1.versionStr(v_r6));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.versionStr(v_r6));
} }
function PublishDialogComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "label", 11);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "span", 12);
    i0.ɵɵtext(5, "*");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 13)(7, "select", 14);
    i0.ɵɵtwoWayListener("ngModelChange", function PublishDialogComponent_Conditional_7_Template_select_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.selectedSectionId, $event) || (ctx_r1.selectedSectionId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(8, "option", 15);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(11, PublishDialogComponent_Conditional_7_For_12_Template, 2, 3, "option", 16, _forTrack0);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 17)(14, "label", 18)(15, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function PublishDialogComponent_Conditional_7_Template_input_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.showRenditions, $event) || (ctx_r1.showRenditions = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, PublishDialogComponent_Conditional_7_Conditional_18_Template, 13, 10, "div", 20);
    i0.ɵɵelementStart(19, "div", 20)(20, "span", 21);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "select", 22);
    i0.ɵɵtwoWayListener("ngModelChange", function PublishDialogComponent_Conditional_7_Template_select_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.selectedVersion, $event) || (ctx_r1.selectedVersion = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(24, "option", 16);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(26, PublishDialogComponent_Conditional_7_For_27_Template, 2, 2, "option", 16, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 20)(29, "span", 23);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "label", 18)(33, "input", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function PublishDialogComponent_Conditional_7_Template_input_ngModelChange_33_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.overrideExisting, $event) || (ctx_r1.overrideExisting = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(3, 13, "document-detail.publish-dialog.location"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.selectedSectionId);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 15, "document-detail.publish-dialog.choose-where-to-publish"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.flatSections());
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.showRenditions);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 17, "document-detail.publish-dialog.show-renditions"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.showRenditions ? 18 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 19, "document-detail.publish-dialog.version"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.selectedVersion);
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", ctx_r1.data.versionLabel);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.data.versionLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.data.versions);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 21, "document-detail.publish-dialog.options"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.overrideExisting);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 23, "document-detail.publish-dialog.override-existing-publications"), " ");
} }
function PublishDialogComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 8);
} }
function PublishDialogComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.publish-dialog.publish"), " ");
} }
export class PublishDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    detailService = inject(DocumentDetailService);
    snackBar = inject(MatSnackBar);
    flatSections = signal([], ...(ngDevMode ? [{ debugName: "flatSections" }] : []));
    sectionsLoading = signal(true, ...(ngDevMode ? [{ debugName: "sectionsLoading" }] : []));
    publishing = signal(false, ...(ngDevMode ? [{ debugName: "publishing" }] : []));
    selectedSectionId = '';
    selectedVersion = '';
    showRenditions = false;
    selectedRendition = '';
    overrideExisting = false;
    ngOnInit() {
        this.selectedVersion = this.data.versionLabel;
        this.detailService.getSectionTree().subscribe({
            next: (res) => {
                this.flatSections.set(this.flattenSections(res.entries));
                this.sectionsLoading.set(false);
            },
            error: () => this.sectionsLoading.set(false),
        });
    }
    flattenSections(docs) {
        const pathMap = new Map();
        for (const doc of docs)
            pathMap.set(doc.path, doc);
        const childrenMap = new Map();
        const roots = [];
        for (const doc of docs) {
            const parentPath = doc.path.split('/').slice(0, -1).join('/');
            if (pathMap.has(parentPath)) {
                const siblings = childrenMap.get(parentPath) ?? [];
                siblings.push(doc);
                childrenMap.set(parentPath, siblings);
            }
            else {
                roots.push(doc);
            }
        }
        const result = [];
        const walk = (nodes, depth) => {
            for (const doc of nodes) {
                result.push({ uid: doc.uid, title: doc.title, depth });
                const children = childrenMap.get(doc.path) ?? [];
                if (children.length > 0)
                    walk(children, depth + 1);
            }
        };
        walk(roots, 0);
        return result;
    }
    sectionIndent(depth) {
        return '\u00A0\u00A0'.repeat(depth);
    }
    versionStr(doc) {
        const major = Number(doc.properties['uid:major_version'] ?? 0);
        const minor = Number(doc.properties['uid:minor_version'] ?? 0);
        return `${major}.${minor}`;
    }
    close() {
        this.dialogRef.close();
    }
    publish() {
        if (!this.selectedSectionId || this.publishing())
            return;
        this.publishing.set(true);
        const renditionName = this.showRenditions && this.selectedRendition && this.selectedRendition !== '__default__'
            ? this.selectedRendition
            : undefined;
        const defaultRendition = this.showRenditions && this.selectedRendition === '__default__';
        this.detailService
            .publishDocument(this.data.documentUid, this.selectedSectionId, {
            override: this.overrideExisting,
            renditionName,
            defaultRendition,
        })
            .subscribe({
            next: () => {
                this.publishing.set(false);
                this.snackBar.open(`"${this.data.documentTitle}" published successfully`, this.translate.instant('common.ok'), {
                    duration: 3000,
                });
                this.dialogRef.close(true);
            },
            error: () => {
                this.publishing.set(false);
                this.snackBar.open(this.translate.instant('document-detail.message.failed-to-publish-document'), this.translate.instant('common.ok'), { duration: 3000 });
            },
        });
    }
    static ɵfac = function PublishDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublishDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PublishDialogComponent, selectors: [["lib-publish-dialog"]], decls: 15, vars: 9, consts: [[1, "pub-dialog"], [1, "pub-header"], [1, "pub-divider"], [1, "pub-body"], [1, "pub-loading"], [1, "pub-actions"], [1, "btn", "btn-cancel", 3, "click"], [1, "btn", "btn-publish", 3, "click", "disabled"], ["diameter", "16"], ["diameter", "28"], [1, "field-group"], ["for", "publish-dialog-location", 1, "field-label"], [1, "required"], [1, "select-wrapper"], ["id", "publish-dialog-location", 1, "native-select", 3, "ngModelChange", "ngModel"], ["value", "", "disabled", "", "selected", ""], [3, "value"], [1, "options-row"], [1, "checkbox-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "inline-group"], ["id", "publish-version-label", 1, "inline-label"], ["aria-labelledby", "publish-version-label", 1, "inline-select", "version-select", 3, "ngModelChange", "ngModel"], [1, "inline-label"], ["id", "publish-renditions-label", 1, "inline-label"], ["aria-labelledby", "publish-renditions-label", 1, "inline-select", "rendition-select", 3, "ngModelChange", "ngModel"], ["value", ""], ["value", "__default__"]], template: function PublishDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(4, "div", 2);
            i0.ɵɵelementStart(5, "div", 3);
            i0.ɵɵconditionalCreate(6, PublishDialogComponent_Conditional_6_Template, 2, 0, "div", 4)(7, PublishDialogComponent_Conditional_7_Template, 36, 25);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "div", 5)(9, "button", 6);
            i0.ɵɵlistener("click", function PublishDialogComponent_Template_button_click_9_listener() { return ctx.close(); });
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "button", 7);
            i0.ɵɵlistener("click", function PublishDialogComponent_Template_button_click_12_listener() { return ctx.publish(); });
            i0.ɵɵconditionalCreate(13, PublishDialogComponent_Conditional_13_Template, 1, 0, "mat-spinner", 8)(14, PublishDialogComponent_Conditional_14_Template, 2, 3);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 5, "document-detail.publish-dialog.internal-publication"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.sectionsLoading() ? 6 : 7);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "document-detail.publish-dialog.cancel"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.selectedSectionId || ctx.publishing());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.publishing() ? 13 : 14);
        } }, dependencies: [FormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.CheckboxControlValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgModel, MatDialogModule,
            MatButtonModule,
            MatIconModule,
            MatProgressSpinnerModule, i2.MatProgressSpinner, MatSnackBarModule,
            TranslatePipe], styles: [".pub-dialog[_ngcontent-%COMP%] {\n        display: flex;\n        flex-direction: column;\n        min-width: 540px;\n      }\n\n      .pub-header[_ngcontent-%COMP%] {\n        text-align: center;\n        font-size: 15px;\n        font-weight: 400;\n        color: #333;\n        padding: 20px 24px 12px;\n      }\n\n      .pub-divider[_ngcontent-%COMP%] {\n        height: 3px;\n        background: #3f51b5;\n        margin: 0 0 20px;\n      }\n\n      .pub-body[_ngcontent-%COMP%] {\n        padding: 0 24px;\n      }\n\n      .pub-loading[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: center;\n        padding: 32px 0;\n      }\n\n      \n\n      .field-group[_ngcontent-%COMP%] {\n        margin-bottom: 20px;\n      }\n\n      .field-label[_ngcontent-%COMP%] {\n        display: block;\n        font-size: 12px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 4px;\n      }\n\n      .required[_ngcontent-%COMP%] {\n        color: #d32f2f;\n      }\n\n      .select-wrapper[_ngcontent-%COMP%] {\n        position: relative;\n      }\n\n      .native-select[_ngcontent-%COMP%] {\n        width: 100%;\n        padding: 10px 32px 10px 0;\n        border: none;\n        border-bottom: 1px solid #ccc;\n        background: transparent;\n        font-size: 14px;\n        color: #333;\n        appearance: none;\n        outline: none;\n        cursor: pointer;\n        background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\");\n        background-repeat: no-repeat;\n        background-position: right 4px center;\n\n        &:focus {\n          border-bottom-color: #3f51b5;\n          border-bottom-width: 2px;\n        }\n      }\n\n      \n\n      .options-row[_ngcontent-%COMP%] {\n        display: flex;\n        align-items: center;\n        gap: 20px;\n        flex-wrap: wrap;\n        margin-bottom: 20px;\n      }\n\n      .checkbox-label[_ngcontent-%COMP%] {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 13px;\n        color: #333;\n        cursor: pointer;\n        white-space: nowrap;\n\n        input[type='checkbox'] {\n          width: 16px;\n          height: 16px;\n          accent-color: #3f51b5;\n          cursor: pointer;\n        }\n      }\n\n      .inline-group[_ngcontent-%COMP%] {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      .inline-label[_ngcontent-%COMP%] {\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        white-space: nowrap;\n      }\n\n      .inline-select[_ngcontent-%COMP%] {\n        padding: 4px 20px 4px 6px;\n        border: 1px solid #ccc;\n        border-radius: 3px;\n        background: #fff;\n        font-size: 13px;\n        color: #333;\n        appearance: none;\n        cursor: pointer;\n        background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\");\n        background-repeat: no-repeat;\n        background-position: right 4px center;\n      }\n\n      .version-select[_ngcontent-%COMP%] {\n        width: 65px;\n      }\n      .rendition-select[_ngcontent-%COMP%] {\n        width: 160px;\n      }\n\n      \n\n      .pub-actions[_ngcontent-%COMP%] {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 16px 24px 20px;\n      }\n\n      .btn[_ngcontent-%COMP%] {\n        padding: 8px 24px;\n        border-radius: 4px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        border: 1px solid #ccc;\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      .btn-cancel[_ngcontent-%COMP%] {\n        background: #fff;\n        color: #333;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-publish[_ngcontent-%COMP%] {\n        background: #3f51b5;\n        color: #fff;\n        border-color: #3f51b5;\n\n        &:hover {\n          background: #3949ab;\n        }\n\n        &:disabled {\n          background: #e0e0e0;\n          color: #999;\n          border-color: #e0e0e0;\n          cursor: default;\n        }\n      }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublishDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-publish-dialog', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatSnackBarModule,
                ], template: "<div class=\"pub-dialog\">\n  <div class=\"pub-header\">\n    {{ 'document-detail.publish-dialog.internal-publication' | translate }}\n  </div>\n  <div class=\"pub-divider\"></div>\n\n  <div class=\"pub-body\">\n    @if (sectionsLoading()) {\n      <div class=\"pub-loading\">\n        <mat-spinner diameter=\"28\" />\n      </div>\n    } @else {\n      <!-- Location -->\n      <div class=\"field-group\">\n        <label class=\"field-label\" for=\"publish-dialog-location\"\n          >{{ 'document-detail.publish-dialog.location' | translate }}\n          <span class=\"required\">*</span></label\n        >\n        <div class=\"select-wrapper\">\n          <select\n            id=\"publish-dialog-location\"\n            class=\"native-select\"\n            [(ngModel)]=\"selectedSectionId\"\n          >\n            <option value=\"\" disabled selected>\n              {{ 'document-detail.publish-dialog.choose-where-to-publish' | translate }}\n            </option>\n            @for (s of flatSections(); track s.uid) {\n              <option [value]=\"s.uid\">{{ sectionIndent(s.depth) }}{{ s.title }}</option>\n            }\n          </select>\n        </div>\n      </div>\n\n      <!-- Options row -->\n      <div class=\"options-row\">\n        <label class=\"checkbox-label\">\n          <input type=\"checkbox\" [(ngModel)]=\"showRenditions\" />\n          {{ 'document-detail.publish-dialog.show-renditions' | translate }}\n        </label>\n\n        @if (showRenditions) {\n          <div class=\"inline-group\">\n            <span class=\"inline-label\" id=\"publish-renditions-label\">{{\n              'document-detail.publish-dialog.renditions' | translate\n            }}</span>\n            <!-- A <span> has no labelling relationship to a control, so the select was unnamed.\n                 `aria-labelledby` is the association a <label for> would give, and a <label> is\n                 wrong here: this span also heads a group rather than one field. -->\n            <select\n              class=\"inline-select rendition-select\"\n              [(ngModel)]=\"selectedRendition\"\n              aria-labelledby=\"publish-renditions-label\"\n            >\n              <option value=\"\">{{ 'document-detail.publish-dialog.none' | translate }}</option>\n              <option value=\"__default__\">\n                {{ 'document-detail.publish-dialog.default-rendition' | translate }}\n              </option>\n              @for (r of data.renditions; track r.name) {\n                <option [value]=\"r.name\">{{ r.label }}</option>\n              }\n            </select>\n          </div>\n        }\n\n        <div class=\"inline-group\">\n          <span class=\"inline-label\" id=\"publish-version-label\">{{\n            'document-detail.publish-dialog.version' | translate\n          }}</span>\n          <select\n            class=\"inline-select version-select\"\n            [(ngModel)]=\"selectedVersion\"\n            aria-labelledby=\"publish-version-label\"\n          >\n            <option [value]=\"data.versionLabel\">{{ data.versionLabel }}</option>\n            @for (v of data.versions; track v.uid) {\n              <option [value]=\"versionStr(v)\">{{ versionStr(v) }}</option>\n            }\n          </select>\n        </div>\n\n        <div class=\"inline-group\">\n          <span class=\"inline-label\">{{\n            'document-detail.publish-dialog.options' | translate\n          }}</span>\n          <label class=\"checkbox-label\">\n            <input type=\"checkbox\" [(ngModel)]=\"overrideExisting\" />\n            {{ 'document-detail.publish-dialog.override-existing-publications' | translate }}\n          </label>\n        </div>\n      </div>\n    }\n  </div>\n\n  <div class=\"pub-actions\">\n    <button class=\"btn btn-cancel\" (click)=\"close()\">\n      {{ 'document-detail.publish-dialog.cancel' | translate }}\n    </button>\n    <button\n      class=\"btn btn-publish\"\n      [disabled]=\"!selectedSectionId || publishing()\"\n      (click)=\"publish()\"\n    >\n      @if (publishing()) {\n        <mat-spinner diameter=\"16\" />\n      } @else {\n        {{ 'document-detail.publish-dialog.publish' | translate }}\n      }\n    </button>\n  </div>\n</div>\n", styles: ["\n      .pub-dialog {\n        display: flex;\n        flex-direction: column;\n        min-width: 540px;\n      }\n\n      .pub-header {\n        text-align: center;\n        font-size: 15px;\n        font-weight: 400;\n        color: #333;\n        padding: 20px 24px 12px;\n      }\n\n      .pub-divider {\n        height: 3px;\n        background: #3f51b5;\n        margin: 0 0 20px;\n      }\n\n      .pub-body {\n        padding: 0 24px;\n      }\n\n      .pub-loading {\n        display: flex;\n        justify-content: center;\n        padding: 32px 0;\n      }\n\n      /* Location field */\n      .field-group {\n        margin-bottom: 20px;\n      }\n\n      .field-label {\n        display: block;\n        font-size: 12px;\n        font-weight: 500;\n        color: #555;\n        margin-bottom: 4px;\n      }\n\n      .required {\n        color: #d32f2f;\n      }\n\n      .select-wrapper {\n        position: relative;\n      }\n\n      .native-select {\n        width: 100%;\n        padding: 10px 32px 10px 0;\n        border: none;\n        border-bottom: 1px solid #ccc;\n        background: transparent;\n        font-size: 14px;\n        color: #333;\n        appearance: none;\n        outline: none;\n        cursor: pointer;\n        background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\");\n        background-repeat: no-repeat;\n        background-position: right 4px center;\n\n        &:focus {\n          border-bottom-color: #3f51b5;\n          border-bottom-width: 2px;\n        }\n      }\n\n      /* Options row */\n      .options-row {\n        display: flex;\n        align-items: center;\n        gap: 20px;\n        flex-wrap: wrap;\n        margin-bottom: 20px;\n      }\n\n      .checkbox-label {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n        font-size: 13px;\n        color: #333;\n        cursor: pointer;\n        white-space: nowrap;\n\n        input[type='checkbox'] {\n          width: 16px;\n          height: 16px;\n          accent-color: #3f51b5;\n          cursor: pointer;\n        }\n      }\n\n      .inline-group {\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      .inline-label {\n        font-size: 13px;\n        font-weight: 500;\n        color: #555;\n        white-space: nowrap;\n      }\n\n      .inline-select {\n        padding: 4px 20px 4px 6px;\n        border: 1px solid #ccc;\n        border-radius: 3px;\n        background: #fff;\n        font-size: 13px;\n        color: #333;\n        appearance: none;\n        cursor: pointer;\n        background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\");\n        background-repeat: no-repeat;\n        background-position: right 4px center;\n      }\n\n      .version-select {\n        width: 65px;\n      }\n      .rendition-select {\n        width: 160px;\n      }\n\n      /* Actions */\n      .pub-actions {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 16px 24px 20px;\n      }\n\n      .btn {\n        padding: 8px 24px;\n        border-radius: 4px;\n        font-size: 14px;\n        font-weight: 500;\n        cursor: pointer;\n        border: 1px solid #ccc;\n        display: inline-flex;\n        align-items: center;\n        gap: 6px;\n      }\n\n      .btn-cancel {\n        background: #fff;\n        color: #333;\n\n        &:hover {\n          background: #f5f5f5;\n        }\n      }\n\n      .btn-publish {\n        background: #3f51b5;\n        color: #fff;\n        border-color: #3f51b5;\n\n        &:hover {\n          background: #3949ab;\n        }\n\n        &:disabled {\n          background: #e0e0e0;\n          color: #999;\n          border-color: #e0e0e0;\n          cursor: default;\n        }\n      }\n    "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PublishDialogComponent, { className: "PublishDialogComponent", filePath: "libs/features/document-detail/src/lib/publish-dialog/publish-dialog.ts", lineNumber: 220 }); })();
