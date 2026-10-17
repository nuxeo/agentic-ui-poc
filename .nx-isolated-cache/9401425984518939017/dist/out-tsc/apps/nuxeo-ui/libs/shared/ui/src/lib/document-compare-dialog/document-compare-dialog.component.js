import { Component, LOCALE_ID, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentDetailService, buildDocumentCompareSections, isCompareIconField, } from '@nuxeo/satori-platform/nuxeo-client';
import { CompareIconImageComponent } from './compare-icon-image.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsSpinnerComponent } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/checkbox";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/select";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/slide-toggle";
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.key;
function DocumentCompareDialogComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r1.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1.name);
} }
function DocumentCompareDialogComponent_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r2.name);
} }
function DocumentCompareDialogComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵelement(1, "nxs-spinner", 15);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "shared-ui.document-compare-dialog.loading"));
} }
function DocumentCompareDialogComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.error());
} }
function DocumentCompareDialogComponent_Conditional_30_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "ui.document-compare-dialog.no-document-data-available-to-compare"), " ");
} }
function DocumentCompareDialogComponent_Conditional_30_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "ui.document-compare-dialog.no-differences-found-between-the-selected"), " ");
} }
function DocumentCompareDialogComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵconditionalCreate(1, DocumentCompareDialogComponent_Conditional_30_Conditional_1_Template, 2, 3)(2, DocumentCompareDialogComponent_Conditional_30_Conditional_2_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.viewAllData() ? 1 : 2);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-compare-icon-image", 28);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(4).$implicit;
    i0.ɵɵproperty("path", row_r4.left)("alt", row_r4.label);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(4).$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r4.left, " ");
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 26);
    i0.ɵɵconditionalCreate(1, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Conditional_1_Template, 1, 2, "lib-compare-icon-image", 28)(2, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isIconRow(row_r4) ? 1 : 2);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-compare-icon-image", 28);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(4).$implicit;
    i0.ɵɵproperty("path", row_r4.right)("alt", row_r4.label);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(4).$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r4.right, " ");
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵconditionalCreate(1, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Conditional_1_Template, 1, 2, "lib-compare-icon-image", 28)(2, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isIconRow(row_r4) ? 1 : 2);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_0_Template, 3, 1, "span", 26);
    i0.ɵɵconditionalCreate(1, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Conditional_1_Template, 3, 1, "span", 27);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵconditional(row_r4.left ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(row_r4.right ? 1 : -1);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-compare-icon-image", 28);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵproperty("path", row_r4.left || row_r4.right)("alt", row_r4.label);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r4.left || row_r4.right, " ");
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 25);
    i0.ɵɵconditionalCreate(1, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Conditional_1_Template, 1, 2, "lib-compare-icon-image", 28)(2, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isIconRow(row_r4) ? 1 : 2);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21)(1, "span", 23);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 24);
    i0.ɵɵconditionalCreate(4, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_4_Template, 2, 2)(5, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Conditional_5_Template, 3, 1, "span", 25);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r4.label);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(row_r4.differs ? 4 : 5);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "div", 29)(2, "span", 23);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 25);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 30)(7, "span", 23);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 25);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(row_r4.label);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("compare-field-value--changed", row_r4.differs && row_r4.left);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r4.left, " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(row_r4.label);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("compare-field-value--changed", row_r4.differs && row_r4.right);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r4.right, " ");
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_0_Template, 6, 2, "div", 21)(1, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Conditional_1_Template, 11, 8, "div", 22);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r2.unifiedView() ? 0 : 1);
} }
function DocumentCompareDialogComponent_Conditional_31_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "details", 16)(1, "summary", 17)(2, "span", 18);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-icon", 19);
    i0.ɵɵtext(5, "expand_more");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 20);
    i0.ɵɵrepeaterCreate(7, DocumentCompareDialogComponent_Conditional_31_For_2_For_8_Template, 2, 1, null, null, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const section_r5 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(section_r5.label);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(section_r5.fields);
} }
function DocumentCompareDialogComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵrepeaterCreate(1, DocumentCompareDialogComponent_Conditional_31_For_2_Template, 9, 1, "details", 16, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.sections());
} }
export class DocumentCompareDialogComponent {
    detailService = inject(DocumentDetailService);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    data = inject(MAT_DIALOG_DATA);
    leftId = signal(this.data.items[0]?.id ?? '', ...(ngDevMode ? [{ debugName: "leftId" }] : []));
    rightId = signal(this.data.items[1]?.id ?? this.data.items[0]?.id ?? '', ...(ngDevMode ? [{ debugName: "rightId" }] : []));
    viewAllData = signal(false, ...(ngDevMode ? [{ debugName: "viewAllData" }] : []));
    unifiedView = signal(false, ...(ngDevMode ? [{ debugName: "unifiedView" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    leftDoc = signal(null, ...(ngDevMode ? [{ debugName: "leftDoc" }] : []));
    rightDoc = signal(null, ...(ngDevMode ? [{ debugName: "rightDoc" }] : []));
    sections = computed(() => {
        const left = this.leftDoc();
        const right = this.rightDoc();
        if (!left || !right)
            return [];
        return buildDocumentCompareSections(left, right, this.viewAllData(), this.locale);
    }, ...(ngDevMode ? [{ debugName: "sections" }] : []));
    isIconRow(row) {
        return isCompareIconField(row.key);
    }
    constructor() {
        effect((onCleanup) => {
            const leftId = this.leftId();
            const rightId = this.rightId();
            if (!leftId || !rightId || leftId === rightId) {
                this.leftDoc.set(null);
                this.rightDoc.set(null);
                this.error.set(this.translate.instant('shared-ui.message.select-two-different-documents-to-compare'));
                this.loading.set(false);
                return;
            }
            this.loading.set(true);
            this.error.set(null);
            let cancelled = false;
            const subscription = forkJoin({
                left: this.detailService.getFullDocument(leftId),
                right: this.detailService.getFullDocument(rightId),
            })
                .pipe(catchError(() => {
                if (!cancelled) {
                    this.error.set(this.translate.instant('shared-ui.message.failed-to-load-documents-for-comparison'));
                }
                return of(null);
            }))
                .subscribe((result) => {
                if (cancelled)
                    return;
                this.loading.set(false);
                if (!result)
                    return;
                this.leftDoc.set(result.left);
                this.rightDoc.set(result.right);
            });
            onCleanup(() => {
                cancelled = true;
                subscription.unsubscribe();
            });
        });
    }
    static ɵfac = function DocumentCompareDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentCompareDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentCompareDialogComponent, selectors: [["lib-document-compare-dialog"]], decls: 36, vars: 23, consts: [["mat-dialog-title", ""], [1, "compare-content"], [1, "compare-selectors"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "compare-select"], [3, "selectionChange", "value"], [3, "value"], ["aria-hidden", "true", 1, "compare-swap-icon"], [1, "compare-view-controls"], [3, "change", "checked"], [1, "compare-loading"], [1, "compare-error"], [1, "compare-empty"], [1, "compare-sections"], ["align", "end"], ["type", "button", "mat-stroked-button", "", "mat-dialog-close", ""], ["diameter", "32", 3, "label"], ["open", "", 1, "compare-section"], [1, "compare-section-header"], [1, "compare-section-title"], [1, "compare-section-chevron"], [1, "compare-section-body"], [1, "compare-field-row", "compare-field-row--unified"], [1, "compare-field-row"], [1, "compare-field-label"], [1, "compare-field-values"], [1, "compare-field-value"], [1, "compare-field-value", "compare-field-value--removed"], [1, "compare-field-value", "compare-field-value--added"], [3, "path", "alt"], [1, "compare-side", "compare-side--left"], [1, "compare-side", "compare-side--right"]], template: function DocumentCompareDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "h2", 0);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 1)(4, "div", 2)(5, "mat-form-field", 3)(6, "mat-label");
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "mat-select", 4);
            i0.ɵɵlistener("selectionChange", function DocumentCompareDialogComponent_Template_mat_select_selectionChange_9_listener($event) { return ctx.leftId.set($event.value); });
            i0.ɵɵrepeaterCreate(10, DocumentCompareDialogComponent_For_11_Template, 2, 2, "mat-option", 5, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "mat-icon", 6);
            i0.ɵɵtext(13, "swap_horiz");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "mat-form-field", 3)(15, "mat-label");
            i0.ɵɵtext(16);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-select", 4);
            i0.ɵɵlistener("selectionChange", function DocumentCompareDialogComponent_Template_mat_select_selectionChange_18_listener($event) { return ctx.rightId.set($event.value); });
            i0.ɵɵrepeaterCreate(19, DocumentCompareDialogComponent_For_20_Template, 2, 2, "mat-option", 5, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "div", 7)(22, "mat-checkbox", 8);
            i0.ɵɵlistener("change", function DocumentCompareDialogComponent_Template_mat_checkbox_change_22_listener($event) { return ctx.viewAllData.set($event.checked); });
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "mat-slide-toggle", 8);
            i0.ɵɵlistener("change", function DocumentCompareDialogComponent_Template_mat_slide_toggle_change_25_listener($event) { return ctx.unifiedView.set($event.checked); });
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(28, DocumentCompareDialogComponent_Conditional_28_Template, 3, 3, "div", 9)(29, DocumentCompareDialogComponent_Conditional_29_Template, 2, 1, "p", 10)(30, DocumentCompareDialogComponent_Conditional_30_Template, 3, 1, "p", 11)(31, DocumentCompareDialogComponent_Conditional_31_Template, 3, 0, "div", 12);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "mat-dialog-actions", 13)(33, "button", 14);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 11, "shared-ui.document-compare-dialog.compare-documents"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 13, "shared-ui.document-compare-dialog.document-1"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.leftId());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.data.items);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 15, "shared-ui.document-compare-dialog.document-2"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.rightId());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.data.items);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("checked", ctx.viewAllData());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 17, "shared-ui.document-compare-dialog.view-all-data"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("checked", ctx.unifiedView());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 19, "shared-ui.document-compare-dialog.unified-view"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 28 : ctx.error() ? 29 : ctx.sections().length === 0 ? 30 : 31);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(35, 21, "shared-ui.document-compare-dialog.close"), " ");
        } }, dependencies: [NxsSpinnerComponent,
            MatDialogModule, i1.MatDialogClose, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, MatCheckboxModule, i3.MatCheckbox, MatFormFieldModule, i4.MatFormField, i4.MatLabel, MatSelectModule, i5.MatSelect, i5.MatOption, MatIconModule, i6.MatIcon, MatSlideToggleModule, i7.MatSlideToggle, CompareIconImageComponent,
            TranslatePipe], styles: [".compare-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  min-width: min(1280px, 94vw);\n  max-height: 78vh;\n}\n\n.compare-selectors[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px 16px;\n}\n\n.compare-swap-icon[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.compare-view-controls[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px 20px;\n  margin-left: auto;\n}\n\n.compare-select[_ngcontent-%COMP%] {\n  min-width: 280px;\n  flex: 1;\n}\n\n.compare-loading[_ngcontent-%COMP%], \n.compare-empty[_ngcontent-%COMP%], \n.compare-error[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  font-size: 14px;\n}\n\n.compare-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b3261e);\n}\n\n.compare-sections[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  overflow: auto;\n}\n\n.compare-section[_ngcontent-%COMP%] {\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.compare-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  cursor: pointer;\n  list-style: none;\n\n  &::-webkit-details-marker {\n    display: none;\n  }\n}\n\n.compare-section-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.compare-section-chevron[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  transition: transform 0.15s ease;\n}\n\n.compare-section[_ngcontent-%COMP%]:not([open])   .compare-section-chevron[_ngcontent-%COMP%] {\n  transform: rotate(-90deg);\n}\n\n.compare-section-body[_ngcontent-%COMP%] {\n  padding: 4px 0 8px;\n}\n\n.compare-field-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 24px;\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #f0f1f4);\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.compare-field-row--unified[_ngcontent-%COMP%] {\n  grid-template-columns: minmax(110px, 20%) minmax(0, 1fr);\n  gap: 12px 24px;\n  align-items: start;\n}\n\n.compare-field-values[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n  min-width: 0;\n}\n\n.compare-side[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(110px, 28%) minmax(0, 1fr);\n  gap: 12px 16px;\n  align-items: start;\n  min-width: 0;\n}\n\n.compare-field-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  word-break: break-word;\n}\n\n.compare-field-value[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: pre-wrap;\n  word-break: break-word;\n  min-height: 1.25rem;\n}\n\n.compare-side--left[_ngcontent-%COMP%]   .compare-field-value--changed[_ngcontent-%COMP%] {\n  background: var(--mat-sys-error-container, #fde8e7);\n  color: var(--mat-sys-on-error-container, #601410);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-side--right[_ngcontent-%COMP%]   .compare-field-value--changed[_ngcontent-%COMP%] {\n  background: var(--mat-sys-tertiary-container, #d7f5e3);\n  color: var(--mat-sys-on-tertiary-container, #0d3b24);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-field-value--removed[_ngcontent-%COMP%] {\n  background: var(--mat-sys-error-container, #fde8e7);\n  color: var(--mat-sys-on-error-container, #601410);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-field-value--added[_ngcontent-%COMP%] {\n  background: var(--mat-sys-tertiary-container, #d7f5e3);\n  color: var(--mat-sys-on-tertiary-container, #0d3b24);\n  padding: 2px 6px;\n  border-radius: 2px;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentCompareDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-document-compare-dialog', standalone: true, imports: [
                    NxsSpinnerComponent,
                    TranslatePipe,
                    MatDialogModule,
                    MatButtonModule,
                    MatCheckboxModule,
                    MatFormFieldModule,
                    MatSelectModule,
                    MatIconModule,
                    MatSlideToggleModule,
                    CompareIconImageComponent,
                ], template: "<h2 mat-dialog-title>{{ 'shared-ui.document-compare-dialog.compare-documents' | translate }}</h2>\n\n<mat-dialog-content class=\"compare-content\">\n  <div class=\"compare-selectors\">\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-1' | translate }}</mat-label>\n      <mat-select [value]=\"leftId()\" (selectionChange)=\"leftId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <mat-icon class=\"compare-swap-icon\" aria-hidden=\"true\">swap_horiz</mat-icon>\n\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-2' | translate }}</mat-label>\n      <mat-select [value]=\"rightId()\" (selectionChange)=\"rightId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <div class=\"compare-view-controls\">\n      <mat-checkbox [checked]=\"viewAllData()\" (change)=\"viewAllData.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.view-all-data' | translate }}\n      </mat-checkbox>\n      <mat-slide-toggle [checked]=\"unifiedView()\" (change)=\"unifiedView.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.unified-view' | translate }}\n      </mat-slide-toggle>\n    </div>\n  </div>\n\n  @if (loading()) {\n    <div class=\"compare-loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'shared-ui.document-compare-dialog.loading' | translate\"\n      />\n    </div>\n  } @else if (error()) {\n    <p class=\"compare-error\">{{ error() }}</p>\n  } @else if (sections().length === 0) {\n    <p class=\"compare-empty\">\n      @if (viewAllData()) {\n        {{ 'ui.document-compare-dialog.no-document-data-available-to-compare' | translate }}\n      } @else {\n        {{ 'ui.document-compare-dialog.no-differences-found-between-the-selected' | translate }}\n      }\n    </p>\n  } @else {\n    <div class=\"compare-sections\">\n      @for (section of sections(); track section.id) {\n        <details class=\"compare-section\" open>\n          <summary class=\"compare-section-header\">\n            <span class=\"compare-section-title\">{{ section.label }}</span>\n            <mat-icon class=\"compare-section-chevron\">expand_more</mat-icon>\n          </summary>\n\n          <div class=\"compare-section-body\">\n            @for (row of section.fields; track row.key) {\n              @if (unifiedView()) {\n                <div class=\"compare-field-row compare-field-row--unified\">\n                  <span class=\"compare-field-label\">{{ row.label }}</span>\n                  <div class=\"compare-field-values\">\n                    @if (row.differs) {\n                      @if (row.left) {\n                        <span class=\"compare-field-value compare-field-value--removed\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.left\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.left }}\n                          }\n                        </span>\n                      }\n                      @if (row.right) {\n                        <span class=\"compare-field-value compare-field-value--added\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.right\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.right }}\n                          }\n                        </span>\n                      }\n                    } @else {\n                      <span class=\"compare-field-value\">\n                        @if (isIconRow(row)) {\n                          <lib-compare-icon-image\n                            [path]=\"row.left || row.right\"\n                            [alt]=\"row.label\"\n                          />\n                        } @else {\n                          {{ row.left || row.right }}\n                        }\n                      </span>\n                    }\n                  </div>\n                </div>\n              } @else {\n                <div class=\"compare-field-row\">\n                  <div class=\"compare-side compare-side--left\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.left\"\n                    >\n                      {{ row.left }}\n                    </span>\n                  </div>\n                  <div class=\"compare-side compare-side--right\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.right\"\n                    >\n                      {{ row.right }}\n                    </span>\n                  </div>\n                </div>\n              }\n            }\n          </div>\n        </details>\n      }\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button type=\"button\" mat-stroked-button mat-dialog-close>\n    {{ 'shared-ui.document-compare-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [".compare-content {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  min-width: min(1280px, 94vw);\n  max-height: 78vh;\n}\n\n.compare-selectors {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px 16px;\n}\n\n.compare-swap-icon {\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.compare-view-controls {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px 20px;\n  margin-left: auto;\n}\n\n.compare-select {\n  min-width: 280px;\n  flex: 1;\n}\n\n.compare-loading,\n.compare-empty,\n.compare-error {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 120px;\n  font-size: 14px;\n}\n\n.compare-error {\n  color: var(--mat-sys-error, #b3261e);\n}\n\n.compare-sections {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  overflow: auto;\n}\n\n.compare-section {\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 4px;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.compare-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  cursor: pointer;\n  list-style: none;\n\n  &::-webkit-details-marker {\n    display: none;\n  }\n}\n\n.compare-section-title {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.compare-section-chevron {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  transition: transform 0.15s ease;\n}\n\n.compare-section:not([open]) .compare-section-chevron {\n  transform: rotate(-90deg);\n}\n\n.compare-section-body {\n  padding: 4px 0 8px;\n}\n\n.compare-field-row {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 24px;\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #f0f1f4);\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.compare-field-row--unified {\n  grid-template-columns: minmax(110px, 20%) minmax(0, 1fr);\n  gap: 12px 24px;\n  align-items: start;\n}\n\n.compare-field-values {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: center;\n  min-width: 0;\n}\n\n.compare-side {\n  display: grid;\n  grid-template-columns: minmax(110px, 28%) minmax(0, 1fr);\n  gap: 12px 16px;\n  align-items: start;\n  min-width: 0;\n}\n\n.compare-field-label {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  word-break: break-word;\n}\n\n.compare-field-value {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: pre-wrap;\n  word-break: break-word;\n  min-height: 1.25rem;\n}\n\n.compare-side--left .compare-field-value--changed {\n  background: var(--mat-sys-error-container, #fde8e7);\n  color: var(--mat-sys-on-error-container, #601410);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-side--right .compare-field-value--changed {\n  background: var(--mat-sys-tertiary-container, #d7f5e3);\n  color: var(--mat-sys-on-tertiary-container, #0d3b24);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-field-value--removed {\n  background: var(--mat-sys-error-container, #fde8e7);\n  color: var(--mat-sys-on-error-container, #601410);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n\n.compare-field-value--added {\n  background: var(--mat-sys-tertiary-container, #d7f5e3);\n  color: var(--mat-sys-on-tertiary-container, #0d3b24);\n  padding: 2px 6px;\n  border-radius: 2px;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentCompareDialogComponent, { className: "DocumentCompareDialogComponent", filePath: "libs/shared/ui/src/lib/document-compare-dialog/document-compare-dialog.component.ts", lineNumber: 44 }); })();
