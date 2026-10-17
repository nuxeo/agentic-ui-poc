import { Component, computed, effect, inject, signal, untracked, DestroyRef } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, finalize, filter, switchMap, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { ConfirmDialogComponent, SAVED_SEARCH_DIALOG_OPTIONS, SavedSearchDialogComponent, ShareSavedSearchDialogComponent, } from '@nuxeo/satori-platform/ui';
import { TrashService, TrashFilterService, SelectionService, SearchService, DocumentDetailService, docTypeIcon, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/tooltip";
import * as i4 from "@angular/material/checkbox";
import * as i5 from "@angular/material/progress-spinner";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/menu";
import * as i8 from "@hylandsoftware/satori-ui/tag";
const _c0 = a0 => ({ count: a0 });
const _c1 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.uid;
const _forTrack1 = ($index, $item) => $item.key;
function TrashComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "span", 16);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 17);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_1_Template_a_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectionService.clear()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 18)(8, "button", 19);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_1_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.restoreSelected()); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "restore_from_trash");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 20);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_1_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.deleteSelected()); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "delete_forever");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(3, 4, ctx_r1.selectedCount() === 1 ? "common.count.all-selected-one" : "common.count.all-selected-many", i0.ɵɵpureFunction1(13, _c0, ctx_r1.selectedCount())));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 7, "trash.trash.clear"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 9, "trash.trash.untrash-selected"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 11, "trash.trash.delete-permanently-2"), " ");
} }
function TrashComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.saveSearch()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "bookmark");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 22);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "mat-menu", null, 0)(11, "button", 23);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_12_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onEditSelectedSavedSearch()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 23);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_12_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onShareSelectedSavedSearch()); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 23);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_12_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onDeleteSelectedSavedSearch()); });
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const resultsActionsMenu_r4 = i0.ɵɵreference(10);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 7, "trash.trash.save"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matMenuTriggerFor", resultsActionsMenu_r4);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 9, "trash.trash.results-actions"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 11, "trash.trash.edit"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 13, "trash.trash.share"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 15, "trash.trash.delete"), " ");
} }
function TrashComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r1.totalResults() === 1 ? "common.count.trashed-document-one" : "common.count.trashed-document-many", i0.ɵɵpureFunction1(4, _c0, ctx_r1.totalResults())));
} }
function TrashComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵelement(1, "mat-spinner", 24);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "trash.trash.loading"));
} }
function TrashComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function TrashComponent_Conditional_39_For_29_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 42);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function TrashComponent_Conditional_39_For_29_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 43);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(doc_r7));
} }
function TrashComponent_Conditional_39_For_29_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38)(1, "div", 39)(2, "mat-checkbox", 40);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("change", function TrashComponent_Conditional_39_For_29_Template_mat_checkbox_change_2_listener() { const doc_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(doc_r7.uid)); })("click", function TrashComponent_Conditional_39_For_29_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r6); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "div", 41);
    i0.ɵɵconditionalCreate(5, TrashComponent_Conditional_39_For_29_Conditional_5_Template, 1, 1, "img", 42)(6, TrashComponent_Conditional_39_For_29_Conditional_6_Template, 2, 1, "mat-icon", 43);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 44)(8, "button", 45);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_39_For_29_Template_button_click_8_listener($event) { const doc_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(doc_r7.uid); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "sat-category-tag", 46);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "docTypeLabel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_14_0;
    const doc_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(doc_r7.uid));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(doc_r7.uid));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(3, 8, "common.select-item", i0.ɵɵpureFunction1(13, _c1, doc_r7.title)));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_14_0 = ctx_r1.thumbnailMap()[doc_r7.uid]) ? 5 : 6, tmp_14_0);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", doc_r7.title);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", doc_r7.title, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 11, doc_r7.type));
} }
function TrashComponent_Conditional_39_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "trash.trash.trash-is-empty"));
} }
function TrashComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 14)(1, "div", 25)(2, "div", 26)(3, "mat-checkbox", 27);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("change", function TrashComponent_Conditional_39_Template_mat_checkbox_change_3_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleAll()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-select", 28);
    i0.ɵɵlistener("selectionChange", function TrashComponent_Conditional_39_Template_mat_select_selectionChange_6_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setSortBy($event.value)); });
    i0.ɵɵelementStart(7, "mat-option", 29);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "mat-option", 30);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "mat-option", 31);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "mat-option", 32);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "mat-option", 33);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "button", 34);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_39_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleSortDir()); });
    i0.ɵɵelementStart(25, "mat-icon");
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(27, "div", 35);
    i0.ɵɵrepeaterCreate(28, TrashComponent_Conditional_39_For_29_Template, 13, 15, "div", 36, _forTrack0);
    i0.ɵɵconditionalCreate(30, TrashComponent_Conditional_39_Conditional_30_Template, 3, 3, "div", 37);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r1.isAllSelected())("indeterminate", ctx_r1.isIndeterminate());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(4, 15, "trash.trash.select-all"));
    i0.ɵɵproperty("disabled", ctx_r1.resultCount() === 0)("matTooltip", i0.ɵɵpipeBind1(5, 17, "trash.trash.select-all"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r1.sortBy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 19, "trash.trash.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 21, "trash.trash.created"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 23, "trash.trash.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 25, "trash.trash.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 27, "trash.trash.state"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(23, 29, "trash.trash.revert-sort-order"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 31, "trash.trash.revert-sort-order"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.sortDir() === "asc" ? "arrow_upward" : "arrow_downward");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.documents());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 30 : -1);
} }
function TrashComponent_Conditional_40_Conditional_1_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 62);
    i0.ɵɵlistener("change", function TrashComponent_Conditional_40_Conditional_1_For_8_Template_mat_checkbox_change_0_listener() { const col_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.togglePendingColumn(col_r11.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r11 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("checked", ctx_r1.isPendingColumn(col_r11.key));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, col_r11));
} }
function TrashComponent_Conditional_40_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 54);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeColumnPanel()); })("keydown.escape", function TrashComponent_Conditional_40_Conditional_1_Template_button_keydown_escape_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeColumnPanel()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 55)(3, "p", 56);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 57);
    i0.ɵɵrepeaterCreate(7, TrashComponent_Conditional_40_Conditional_1_For_8_Template, 3, 4, "mat-checkbox", 58, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 59)(10, "button", 60);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_Conditional_1_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.resetColumns()); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 61);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_Conditional_1_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.applyColumns()); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 4, "trash.trash.close-column-picker"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "trash.trash.column-settings"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.columnsForPanel);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 8, "trash.trash.reset"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 10, "trash.trash.done"), " ");
} }
function TrashComponent_Conditional_40_For_8_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 64);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_For_8_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const col_r13 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.sortByColumn(col_r13.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementStart(3, "mat-icon", 65);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r13 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 4, col_r13), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("sort-active", ctx_r1.sortBy() === col_r13.key);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.sortBy() === col_r13.key && ctx_r1.sortDir() === "desc" ? "arrow_downward" : "arrow_upward", " ");
} }
function TrashComponent_Conditional_40_For_8_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, col_r13));
} }
function TrashComponent_Conditional_40_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TrashComponent_Conditional_40_For_8_Conditional_0_Template, 5, 6, "button", 63)(1, TrashComponent_Conditional_40_For_8_Conditional_1_Template, 3, 3, "span");
} if (rf & 2) {
    const col_r13 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.SORTABLE_COLUMNS.has(col_r13.key) ? 0 : 1);
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 74);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r15 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(doc_r15));
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 73);
    i0.ɵɵconditionalCreate(1, TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Conditional_1_Template, 1, 1, "img", 74)(2, TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Conditional_2_Template, 2, 1, "mat-icon", 75);
    i0.ɵɵelementStart(3, "button", 76);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r16); const doc_r15 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(doc_r15.uid); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_22_0;
    const doc_r15 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r1.thumbnailMap()[doc_r15.uid]) ? 1 : 2, tmp_22_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", doc_r15.title);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", doc_r15.title, " ");
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r17 = i0.ɵɵnextContext().$implicit;
    const doc_r15 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r1.getCellValue(doc_r15, col_r17.key), "medium"));
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r15 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, doc_r15.type));
} }
function TrashComponent_Conditional_40_For_16_For_5_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r17 = i0.ɵɵnextContext().$implicit;
    const doc_r15 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getCellValue(doc_r15, col_r17.key));
} }
function TrashComponent_Conditional_40_For_16_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TrashComponent_Conditional_40_For_16_For_5_Conditional_0_Template, 5, 3, "span", 73)(1, TrashComponent_Conditional_40_For_16_For_5_Conditional_1_Template, 3, 4, "span")(2, TrashComponent_Conditional_40_For_16_For_5_Conditional_2_Template, 3, 3, "span")(3, TrashComponent_Conditional_40_For_16_For_5_Conditional_3_Template, 2, 1, "span");
} if (rf & 2) {
    const col_r17 = ctx.$implicit;
    i0.ɵɵconditional(col_r17.key === "title" ? 0 : col_r17.key === "modified" || col_r17.key === "created" ? 1 : col_r17.key === "type" ? 2 : 3);
} }
function TrashComponent_Conditional_40_For_16_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 66)(1, "span", 67)(2, "mat-checkbox", 68);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_For_16_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); })("change", function TrashComponent_Conditional_40_For_16_Template_mat_checkbox_change_2_listener() { const doc_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(doc_r15.uid)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, TrashComponent_Conditional_40_For_16_For_5_Template, 4, 1, null, null, _forTrack1);
    i0.ɵɵelementStart(6, "span", 69)(7, "button", 70);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_For_16_Template_button_click_7_listener($event) { const doc_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.restoreDocument(doc_r15.uid, $event)); });
    i0.ɵɵelementStart(10, "mat-icon", 71);
    i0.ɵɵtext(11, "restore_from_trash");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 72);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_For_16_Template_button_click_12_listener($event) { const doc_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.permanentlyDelete(doc_r15.uid, $event)); });
    i0.ɵɵelementStart(15, "mat-icon", 71);
    i0.ɵɵtext(16, "delete_forever");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const doc_r15 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(doc_r15.uid));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(doc_r15.uid));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(3, 12, "common.select-item", i0.ɵɵpureFunction1(23, _c1, doc_r15.title)));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(8, 15, "trash.trash.restore"))("disabled", ctx_r1.actionInProgress().has(doc_r15.uid));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 17, "trash.trash.restore"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(13, 19, "trash.trash.delete-permanently"))("disabled", ctx_r1.actionInProgress().has(doc_r15.uid));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 21, "trash.trash.delete-permanently"));
} }
function TrashComponent_Conditional_40_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "trash.trash.trash-is-empty"));
} }
function TrashComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵconditionalCreate(1, TrashComponent_Conditional_40_Conditional_1_Template, 16, 12);
    i0.ɵɵelementStart(2, "div", 47)(3, "div", 48)(4, "span", 49)(5, "mat-checkbox", 50);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("change", function TrashComponent_Conditional_40_Template_mat_checkbox_change_5_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleAll()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(7, TrashComponent_Conditional_40_For_8_Template, 2, 1, null, null, _forTrack1);
    i0.ɵɵelementStart(9, "span", 51)(10, "button", 52);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_40_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openColumnPanel()); });
    i0.ɵɵelementStart(13, "mat-icon");
    i0.ɵɵtext(14, "tune");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵrepeaterCreate(15, TrashComponent_Conditional_40_For_16_Template, 17, 25, "div", 53, _forTrack0);
    i0.ɵɵconditionalCreate(17, TrashComponent_Conditional_40_Conditional_17_Template, 3, 3, "div", 37);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.columnPanelOpen() ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isAllSelected())("indeterminate", ctx_r1.isIndeterminate());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(6, 9, "trash.trash.select-all"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(11, 11, "trash.trash.manage-columns"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 13, "trash.trash.manage-columns"));
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(ctx_r1.documents());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 17 : -1);
} }
function TrashComponent_Conditional_41_For_28_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 85);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function TrashComponent_Conditional_41_For_28_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r20 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(doc_r20));
} }
function TrashComponent_Conditional_41_For_28_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 83)(1, "div", 84);
    i0.ɵɵconditionalCreate(2, TrashComponent_Conditional_41_For_28_Conditional_2_Template, 1, 1, "img", 85)(3, TrashComponent_Conditional_41_For_28_Conditional_3_Template, 2, 1, "mat-icon", 86);
    i0.ɵɵelementStart(4, "span", 87)(5, "mat-checkbox", 68);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_41_For_28_Template_mat_checkbox_click_5_listener($event) { i0.ɵɵrestoreView(_r19); return i0.ɵɵresetView($event.stopPropagation()); })("change", function TrashComponent_Conditional_41_For_28_Template_mat_checkbox_change_5_listener() { const doc_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(doc_r20.uid)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "div", 88)(8, "div", 89)(9, "button", 90);
    i0.ɵɵlistener("click", function TrashComponent_Conditional_41_For_28_Template_button_click_9_listener($event) { const doc_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(doc_r20.uid); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "sat-category-tag", 46);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "docTypeLabel");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 91)(15, "button", 70);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_41_For_28_Template_button_click_15_listener($event) { const doc_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.restoreDocument(doc_r20.uid, $event)); });
    i0.ɵɵelementStart(18, "mat-icon", 71);
    i0.ɵɵtext(19, "restore_from_trash");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "button", 72);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_41_For_28_Template_button_click_20_listener($event) { const doc_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.permanentlyDelete(doc_r20.uid, $event)); });
    i0.ɵɵelementStart(23, "mat-icon", 71);
    i0.ɵɵtext(24, "delete_forever");
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    let tmp_12_0;
    const doc_r20 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(doc_r20.uid));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_12_0 = ctx_r1.thumbnailMap()[doc_r20.uid]) ? 2 : 3, tmp_12_0);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(doc_r20.uid));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(6, 14, "common.select-item", i0.ɵɵpureFunction1(27, _c1, doc_r20.title)));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", doc_r20.title);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", doc_r20.title, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 17, doc_r20.type));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(16, 19, "trash.trash.restore"))("disabled", ctx_r1.actionInProgress().has(doc_r20.uid));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 21, "trash.trash.restore"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(21, 23, "trash.trash.delete-permanently"))("disabled", ctx_r1.actionInProgress().has(doc_r20.uid));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(22, 25, "trash.trash.delete-permanently"));
} }
function TrashComponent_Conditional_41_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "trash.trash.trash-is-empty"));
} }
function TrashComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 77)(1, "div", 78)(2, "mat-checkbox", 79);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("change", function TrashComponent_Conditional_41_Template_mat_checkbox_change_2_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleAll()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "mat-select", 80);
    i0.ɵɵlistener("selectionChange", function TrashComponent_Conditional_41_Template_mat_select_selectionChange_5_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setSortBy($event.value)); });
    i0.ɵɵelementStart(6, "mat-option", 29);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "mat-option", 30);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "mat-option", 31);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "mat-option", 32);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "mat-option", 33);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "button", 34);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵlistener("click", function TrashComponent_Conditional_41_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleSortDir()); });
    i0.ɵɵelementStart(24, "mat-icon");
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(26, "div", 81);
    i0.ɵɵrepeaterCreate(27, TrashComponent_Conditional_41_For_28_Template, 25, 29, "div", 82, _forTrack0);
    i0.ɵɵconditionalCreate(29, TrashComponent_Conditional_41_Conditional_29_Template, 3, 3, "div", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isAllSelected())("indeterminate", ctx_r1.isIndeterminate());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(3, 15, "trash.trash.select-all"));
    i0.ɵɵproperty("disabled", ctx_r1.resultCount() === 0)("matTooltip", i0.ɵɵpipeBind1(4, 17, "trash.trash.select-all"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r1.sortBy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 19, "trash.trash.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 21, "trash.trash.created"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 23, "trash.trash.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 25, "trash.trash.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 27, "trash.trash.state"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(22, 29, "trash.trash.revert-sort-order"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(23, 31, "trash.trash.revert-sort-order"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.sortDir() === "asc" ? "arrow_upward" : "arrow_downward");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.documents());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 29 : -1);
} }
const ALL_COLUMNS = [
    { key: 'title', labelKey: 'trash.column.title', label: 'Title', width: '2fr' },
    { key: 'type', labelKey: 'trash.column.type', label: 'Type', width: '1fr' },
    { key: 'modified', labelKey: 'trash.column.modified', label: 'Modified', width: '1fr' },
    {
        key: 'contributor',
        labelKey: 'trash.column.contributor',
        label: 'Last contributor',
        width: '1.2fr',
    },
    { key: 'created', labelKey: 'trash.column.created', label: 'Created', width: '1fr' },
    { key: 'author', labelKey: 'trash.column.author', label: 'Author', width: '1fr' },
    { key: 'state', labelKey: 'trash.column.state', label: 'State', width: '1fr' },
];
const SORT_FIELD_MAP = {
    title: 'dc:title',
    type: 'dc:type',
    modified: 'dc:modified',
    contributor: 'dc:lastContributor',
    created: 'dc:created',
    author: 'dc:creator',
    state: 'ecm:currentLifeCycleState',
};
const SORTABLE_COLUMNS = new Set(['title', 'modified', 'contributor', 'created', 'author']);
export class TrashComponent {
    translate = inject(TranslateService);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    snackBar = inject(MatSnackBar);
    dialog = inject(MatDialog);
    trashService = inject(TrashService);
    searchService = inject(SearchService);
    detailService = inject(DocumentDetailService);
    trashFilterService = inject(TrashFilterService);
    selectionService = inject(SelectionService);
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    documents = signal([], ...(ngDevMode ? [{ debugName: "documents" }] : []));
    totalResults = signal(0, ...(ngDevMode ? [{ debugName: "totalResults" }] : []));
    viewMode = signal('table', ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    sortBy = signal('created', ...(ngDevMode ? [{ debugName: "sortBy" }] : []));
    sortDir = signal('desc', ...(ngDevMode ? [{ debugName: "sortDir" }] : []));
    visibleColumnKeys = signal(['title', 'type', 'modified', 'contributor'], ...(ngDevMode ? [{ debugName: "visibleColumnKeys" }] : []));
    columnPanelOpen = signal(false, ...(ngDevMode ? [{ debugName: "columnPanelOpen" }] : []));
    pendingColumnKeys = signal(['title', 'type', 'modified', 'contributor'], ...(ngDevMode ? [{ debugName: "pendingColumnKeys" }] : []));
    columnsForPanel = ALL_COLUMNS;
    SORTABLE_COLUMNS = SORTABLE_COLUMNS;
    visibleColumns = computed(() => ALL_COLUMNS.filter((c) => this.visibleColumnKeys().includes(c.key)), ...(ngDevMode ? [{ debugName: "visibleColumns" }] : []));
    gridTemplate = computed(() => ['40px', ...this.visibleColumns().map((c) => c.width), '80px'].join(' '), ...(ngDevMode ? [{ debugName: "gridTemplate" }] : []));
    resultCount = computed(() => this.documents().length, ...(ngDevMode ? [{ debugName: "resultCount" }] : []));
    selectedCount = computed(() => this.selectionService.selectedCount(), ...(ngDevMode ? [{ debugName: "selectedCount" }] : []));
    isAllSelected = computed(() => this.selectionService.isAllSelected(this.documents().map((d) => d.uid)), ...(ngDevMode ? [{ debugName: "isAllSelected" }] : []));
    isIndeterminate = computed(() => this.selectionService.isIndeterminate(this.documents().map((d) => d.uid)), ...(ngDevMode ? [{ debugName: "isIndeterminate" }] : []));
    actionInProgress = signal(new Set(), ...(ngDevMode ? [{ debugName: "actionInProgress" }] : []));
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    thumbnailGeneration = 0;
    /** Sequence for search requests, so a superseded response cannot write. See `search()`. */
    searchGeneration = 0;
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    deletingSavedSearch = signal(false, ...(ngDevMode ? [{ debugName: "deletingSavedSearch" }] : []));
    constructor() {
        this.destroyRef.onDestroy(() => this.clearThumbnails());
        effect(() => {
            this.trashFilterService.filters();
            this.sortBy();
            this.sortDir();
            untracked(() => this.search());
        }, { allowSignalWrites: true });
    }
    search() {
        // Every response is checked against this before it is allowed to write anything.
        //
        // `beginThumbnailBatch()` alone did not make overlapping searches safe, because the request
        // never compared it: if A starts, B starts and completes, then A completes, A still overwrote
        // `documents`, `totalResults` and the shared filter-service results with its stale entries, and
        // its `loadThumbnails` then cleared B's thumbnails in favour of its own. The sibling components
        // avoid this structurally by driving search through `switchMap`, which cancels the previous
        // request; this one subscribes imperatively, so it needs the guard.
        const generation = ++this.searchGeneration;
        this.loading.set(true);
        this.error.set(null);
        this.trashFilterService.resultsLoading.set(true);
        this.beginThumbnailBatch();
        const f = this.trashFilterService.filters();
        const sortField = SORT_FIELD_MAP[this.sortBy()] ?? 'dc:created';
        this.trashService
            .searchTrash({
            fullText: f.fullText,
            path: f.path,
            author: f.author,
            sizeRanges: f.sizeRanges,
            sortBy: sortField,
            sortOrder: this.sortDir(),
            pageSize: 100,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                if (generation !== this.searchGeneration)
                    return;
                const entries = res.entries ?? [];
                this.documents.set(entries);
                this.totalResults.set(res.resultsCount ?? entries.length);
                this.loading.set(false);
                this.trashFilterService.resultsLoading.set(false);
                this.trashFilterService.results.set(entries.map((d) => ({ uid: d.uid, title: d.title, type: d.type })));
                this.trashFilterService.totalResults.set(res.resultsCount ?? entries.length);
                this.loadThumbnails(entries);
            },
            error: () => {
                // Guarded too: a stale failure would otherwise show an error over a newer search's
                // successful results and clear its loading state.
                if (generation !== this.searchGeneration)
                    return;
                this.error.set(this.translate.instant('trash.message.failed-to-load-trashed-documents'));
                this.loading.set(false);
                this.trashFilterService.resultsLoading.set(false);
            },
        });
    }
    docIcon(doc) {
        return docTypeIcon(doc.type);
    }
    saveAsSearch() {
        const dialogRef = this.dialog.open(SavedSearchDialogComponent, {
            ...SAVED_SEARCH_DIALOG_OPTIONS,
            data: {
                title: this.translate.instant('ui.saved-search'),
                placeholder: this.translate.instant('saved-search.dialog.name-placeholder'),
            },
        });
        dialogRef
            .afterClosed()
            .pipe(filter((name) => !!name?.trim()), switchMap((name) => {
            this.saving.set(true);
            return this.trashService.saveSearch(name.trim(), this.buildFilterParams()).pipe(finalize(() => this.saving.set(false)), catchError(() => {
                this.snackBar.open(this.translate.instant('assets.message.failed-to-save-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
                return of(null);
            }));
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
            if (!result)
                return;
            this.trashFilterService.activeSavedFilterUid.set(result.uid);
            this.trashFilterService.activeSavedFilterTitle.set(result.title);
            this.trashFilterService.markSavedSearchDirty();
            this.snackBar.open(this.translate.instant('common.search-saved', { name: result.title }), this.translate.instant('common.ok'), { duration: 3000 });
        });
    }
    saveSearch() {
        const uid = this.trashFilterService.activeSavedFilterUid();
        const title = this.trashFilterService.activeSavedFilterTitle();
        if (!uid || !title)
            return;
        this.saving.set(true);
        this.trashService
            .updateSearch(uid, title, this.buildFilterParams())
            .pipe(finalize(() => this.saving.set(false)), catchError(() => {
            this.snackBar.open(this.translate.instant('assets.message.failed-to-save-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
            return of(null);
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
            if (!result)
                return;
            this.trashFilterService.markSavedSearchDirty();
            this.snackBar.open(this.translate.instant('common.search-updated', { name: title }), this.translate.instant('common.ok'), { duration: 3000 });
        });
    }
    onEditSelectedSavedSearch() {
        const uid = this.trashFilterService.activeSavedFilterUid();
        const title = this.trashFilterService.activeSavedFilterTitle();
        if (!uid || !title)
            return;
        this.dialog
            .open(SavedSearchDialogComponent, {
            ...SAVED_SEARCH_DIALOG_OPTIONS,
            data: {
                title: this.translate.instant('ui.edit-saved-search'),
                placeholder: this.translate.instant('saved-search.dialog.name-placeholder'),
                initialValue: title.trim(),
            },
        })
            .afterClosed()
            .pipe(map((newTitle) => (typeof newTitle === 'string' ? newTitle.trim() : '')), filter((trimmedTitle) => !!trimmedTitle), switchMap((trimmedTitle) => this.trashService
            .updateSearch(uid, trimmedTitle, this.buildFilterParams())
            .pipe(map(() => trimmedTitle))), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (trimmedTitle) => {
                this.trashFilterService.activeSavedFilterTitle.set(trimmedTitle);
                this.trashFilterService.markSavedSearchDirty();
                this.snackBar.open(this.translate.instant('common.search-updated', { name: trimmedTitle }), this.translate.instant('common.ok'), { duration: 3000 });
            },
            error: () => {
                this.snackBar.open(this.translate.instant('assets.message.failed-to-update-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
            },
        });
    }
    onShareSelectedSavedSearch() {
        const id = this.trashFilterService.activeSavedFilterUid()?.trim();
        if (!id)
            return;
        this.dialog.open(ShareSavedSearchDialogComponent, {
            width: '95vw',
            maxWidth: '1080px',
            data: {
                title: this.trashFilterService.activeSavedFilterTitle()?.trim() ||
                    this.translate.instant('ui.saved-search'),
                id,
            },
        });
    }
    onDeleteSelectedSavedSearch() {
        const uid = this.trashFilterService.activeSavedFilterUid();
        const title = this.trashFilterService.activeSavedFilterTitle();
        if (!uid || !title || this.deletingSavedSearch())
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-saved-search'),
                message: this.translate.instant('confirm.delete-saved-search-named', {
                    name: title.trim(),
                }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.deletingSavedSearch.set(true);
            this.searchService
                .deleteSavedSearch(uid)
                .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.deletingSavedSearch.set(false)))
                .subscribe({
                next: () => {
                    this.trashFilterService.reset();
                    this.trashFilterService.markSavedSearchDirty();
                    this.snackBar.open(this.translate.instant('common.search-deleted', { name: title }), this.translate.instant('common.ok'), { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open(this.translate.instant('trash.message.failed-to-delete-search'), this.translate.instant('common.dismiss'), { duration: 5000 });
                },
            });
        });
    }
    buildFilterParams() {
        const f = this.trashFilterService.filters();
        const params = {};
        if (f.fullText)
            params['ecm_fulltext'] = f.fullText;
        if (f.path && f.path !== '/')
            params['ecm_path'] = f.path;
        if (f.author)
            params['dc_creator'] = f.author;
        if (f.sizeRanges.length > 0)
            params['common_size'] = f.sizeRanges;
        return params;
    }
    setViewMode(mode) {
        this.viewMode.set(mode);
    }
    setSortBy(value) {
        this.sortBy.set(value);
        this.search();
    }
    toggleSortDir() {
        this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
        this.search();
    }
    sortByColumn(key) {
        if (!SORTABLE_COLUMNS.has(key))
            return;
        if (this.sortBy() === key) {
            this.toggleSortDir();
        }
        else {
            this.sortBy.set(key);
            this.sortDir.set('asc');
            this.search();
        }
    }
    openDocument(uid) {
        if (!uid)
            return;
        void this.router.navigateByUrl(`/doc/${uid}`);
    }
    getCellValue(doc, key) {
        const props = doc.properties ?? {};
        switch (key) {
            case 'title':
                return doc.title ?? props['dc:title'] ?? '';
            case 'type':
                return doc.type ?? '';
            case 'modified':
                return props['dc:modified'] ?? '';
            case 'contributor':
                return props['dc:lastContributor'] ?? '';
            case 'created':
                return props['dc:created'] ?? '';
            case 'author':
                return props['dc:creator'] ?? '';
            case 'state':
                return doc.state ?? '';
            default:
                return '';
        }
    }
    isSelected(id) {
        return this.selectionService.isSelected(id);
    }
    toggleSelection(id) {
        const doc = this.documents().find((d) => d.uid === id);
        this.selectionService.toggle(id, doc?.title ?? id, this.thumbnailMap()[id] ?? null);
    }
    toggleAll() {
        if (this.isAllSelected()) {
            this.selectionService.clear();
        }
        else {
            const docs = this.documents();
            const labels = {};
            const previews = {};
            docs.forEach((doc) => {
                labels[doc.uid] = doc.title;
                previews[doc.uid] = this.thumbnailMap()[doc.uid] ?? null;
            });
            this.selectionService.selectAll(docs.map((d) => d.uid), labels, previews);
        }
    }
    restoreSelected() {
        const ids = [...this.selectionService.selectedIds()];
        if (ids.length === 0)
            return;
        const inProgress = new Set(this.actionInProgress());
        ids.forEach((id) => inProgress.add(id));
        this.actionInProgress.set(inProgress);
        let completed = 0;
        for (const uid of ids) {
            this.trashService
                .restoreDocument(uid)
                .pipe(finalize(() => {
                this.markInProgress(uid, false);
                completed++;
                if (completed === ids.length) {
                    this.selectionService.clear();
                    this.snackBar.open(`${ids.length} document(s) restored.`, this.translate.instant('common.ok'), { duration: 3000 });
                }
            }), takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => this.documents.update((docs) => docs.filter((d) => d.uid !== uid)),
                error: () => this.snackBar.open(this.translate.instant('trash.message.failed-to-restore-a-document'), this.translate.instant('common.dismiss'), { duration: 3000 }),
            });
        }
    }
    deleteSelected() {
        const ids = [...this.selectionService.selectedIds()];
        if (ids.length === 0)
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.permanently-delete-documents'),
                message: ids.length === 1
                    ? this.translate.instant('confirm.permanently-delete-warning')
                    : this.translate.instant('confirm.permanently-delete-documents-count', {
                        count: ids.length,
                    }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (!confirmed)
                return;
            const inProgress = new Set(this.actionInProgress());
            ids.forEach((id) => inProgress.add(id));
            this.actionInProgress.set(inProgress);
            let completed = 0;
            for (const uid of ids) {
                this.trashService
                    .permanentlyDelete(uid)
                    .pipe(finalize(() => {
                    this.markInProgress(uid, false);
                    completed++;
                    if (completed === ids.length) {
                        this.selectionService.clear();
                        this.snackBar.open(`${ids.length} document(s) permanently deleted.`, this.translate.instant('common.ok'), {
                            duration: 3000,
                        });
                    }
                }), takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: () => this.documents.update((docs) => docs.filter((d) => d.uid !== uid)),
                    error: () => this.snackBar.open(this.translate.instant('trash.message.failed-to-delete-a-document'), this.translate.instant('common.dismiss'), { duration: 3000 }),
                });
            }
        });
    }
    restoreDocument(uid, event) {
        event?.stopPropagation();
        if (this.actionInProgress().has(uid))
            return;
        this.markInProgress(uid, true);
        this.trashService
            .restoreDocument(uid)
            .pipe(finalize(() => this.markInProgress(uid, false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.snackBar.open(this.translate.instant('trash.message.document-restored'), this.translate.instant('common.ok'), { duration: 3000 });
                this.documents.update((docs) => docs.filter((d) => d.uid !== uid));
            },
            error: () => this.snackBar.open(this.translate.instant('trash.message.failed-to-restore-document'), this.translate.instant('common.dismiss'), { duration: 5000 }),
        });
    }
    permanentlyDelete(uid, event) {
        event?.stopPropagation();
        if (this.actionInProgress().has(uid))
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.permanently-delete-document'),
                message: this.translate.instant('confirm.permanently-delete-warning'),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.markInProgress(uid, true);
            this.trashService
                .permanentlyDelete(uid)
                .pipe(finalize(() => this.markInProgress(uid, false)), takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('trash.message.document-permanently-deleted'), this.translate.instant('common.ok'), { duration: 3000 });
                    this.documents.update((docs) => docs.filter((d) => d.uid !== uid));
                },
                error: () => this.snackBar.open(this.translate.instant('trash.message.failed-to-delete-document'), this.translate.instant('common.dismiss'), { duration: 5000 }),
            });
        });
    }
    isPendingColumn(key) {
        return this.pendingColumnKeys().includes(key);
    }
    togglePendingColumn(key) {
        const current = this.pendingColumnKeys();
        if (current.includes(key)) {
            this.pendingColumnKeys.set(current.filter((k) => k !== key));
        }
        else {
            const ordered = ALL_COLUMNS.map((c) => c.key);
            this.pendingColumnKeys.set(ordered.filter((k) => [...current, key].includes(k)));
        }
    }
    openColumnPanel() {
        this.pendingColumnKeys.set(this.visibleColumnKeys());
        this.columnPanelOpen.set(true);
    }
    closeColumnPanel() {
        this.columnPanelOpen.set(false);
    }
    resetColumns() {
        this.pendingColumnKeys.set(['title', 'type', 'modified', 'contributor']);
    }
    applyColumns() {
        this.visibleColumnKeys.set(ALL_COLUMNS.map((c) => c.key).filter((k) => this.pendingColumnKeys().includes(k)));
        this.columnPanelOpen.set(false);
    }
    exportCsv() {
        const escape = (v) => `"${v.replaceAll('"', '""')}"`;
        const headers = ['Title', 'Type', 'Modified', 'Last Contributor', 'Created', 'Author', 'State'];
        const rows = this.documents().map((doc) => [
            this.getCellValue(doc, 'title'),
            this.getCellValue(doc, 'type'),
            this.getCellValue(doc, 'modified'),
            this.getCellValue(doc, 'contributor'),
            this.getCellValue(doc, 'created'),
            this.getCellValue(doc, 'author'),
            this.getCellValue(doc, 'state'),
        ].map((c) => escape(c)));
        const csv = [headers.map((h) => escape(h)), ...rows].map((l) => l.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trash-results.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
    markInProgress(uid, add) {
        this.actionInProgress.update((s) => {
            const next = new Set(s);
            if (add)
                next.add(uid);
            else
                next.delete(uid);
            return next;
        });
    }
    loadThumbnails(docs) {
        // Mint a new generation rather than reading the current one — two overlapping trash searches
        // could otherwise both capture the generation set by one `beginThumbnailBatch()`, letting the
        // first search's late callbacks pass the guard and reappear after the second cleared them.
        const generation = ++this.thumbnailGeneration;
        this.clearThumbnails();
        for (const doc of docs) {
            this.detailService
                .fetchThumbnail(doc.uid)
                .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
                .subscribe((blob) => {
                if (!blob || generation !== this.thumbnailGeneration)
                    return;
                const url = URL.createObjectURL(blob);
                this.setThumbnail(doc.uid, url);
            });
        }
    }
    beginThumbnailBatch() {
        this.thumbnailGeneration += 1;
    }
    clearThumbnails() {
        // Drop the selection layer's copies FIRST. It retains these exact strings and binds them into
        // `<img [src]>` in the shell topbar, and selection survives a new search — so revoking without
        // this leaves selected items pointing at revoked blob URLs. See `SelectionService.forgetPreviews`.
        this.selectionService.forgetPreviews();
        const urls = new Set([
            ...Object.values(this.thumbnailMap()),
            ...Object.values(this.trashFilterService.resultThumbnails()),
        ].filter((url) => !!url));
        for (const url of urls)
            URL.revokeObjectURL(url);
        this.thumbnailMap.set({});
        this.trashFilterService.resultThumbnails.set({});
    }
    setThumbnail(uid, url) {
        const previous = this.thumbnailMap()[uid] ?? this.trashFilterService.resultThumbnails()[uid];
        if (previous && previous !== url)
            URL.revokeObjectURL(previous);
        this.thumbnailMap.update((m) => ({ ...m, [uid]: url }));
        this.trashFilterService.resultThumbnails.update((m) => ({ ...m, [uid]: url }));
    }
    static ɵfac = function TrashComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TrashComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TrashComponent, selectors: [["lib-trash"]], decls: 42, vars: 45, consts: [["resultsActionsMenu", "matMenu"], [1, "results-page"], [1, "selection-bar"], [1, "page-header-row"], [1, "page-header-title"], [1, "page-header-actions"], ["mat-flat-button", "", 1, "save-as-btn", 3, "click", "disabled"], [1, "results-toolbar"], [1, "results-summary"], [1, "results-count"], [1, "toolbar-actions"], ["mat-icon-button", "", 1, "toolbar-btn", 3, "click", "matTooltip"], [1, "results-loading"], [1, "results-error"], [1, "grid-container"], [1, "list-wrapper"], [1, "selection-bar-count"], [1, "selection-bar-clear", 3, "click"], [1, "selection-bar-actions"], ["mat-flat-button", "", "color", "primary", 1, "selection-action-btn", 3, "click"], ["mat-flat-button", "", "color", "warn", 1, "selection-action-btn", 3, "click"], ["mat-flat-button", "", 1, "save-btn", 3, "click", "disabled"], ["mat-icon-button", "", "type", "button", 3, "matMenuTriggerFor"], ["mat-menu-item", "", "type", "button", 3, "click"], ["diameter", "32"], [1, "grid-action-bar"], [1, "grid-actions-left"], [3, "change", "checked", "indeterminate", "aria-label", "disabled", "matTooltip"], [1, "grid-select", 3, "selectionChange", "value"], ["value", "title"], ["value", "created"], ["value", "modified"], ["value", "contributor"], ["value", "state"], ["mat-icon-button", "", 1, "action-btn", 3, "click", "matTooltip"], [1, "result-grid"], [1, "result-card", 3, "selected"], [1, "results-empty"], [1, "result-card"], [1, "grid-card-checkbox", "col-hover-select"], [3, "change", "click", "checked", "aria-label"], [1, "result-card-thumbnail"], ["alt", "", 1, "result-thumbnail-image", 3, "src"], [1, "result-icon"], [1, "result-card-body"], ["type", "button", 1, "result-name", 3, "click", "title"], ["category", "gray"], [1, "result-list"], [1, "list-header"], [1, "col-checkbox"], [3, "change", "checked", "indeterminate", "aria-label"], [1, "col-gear"], ["mat-icon-button", "", 1, "gear-btn", 3, "click", "matTooltip"], [1, "list-row", 3, "selected", "grid-template-columns"], ["type", "button", 1, "col-panel-backdrop", 3, "click", "keydown.escape"], [1, "col-panel"], [1, "col-panel-title"], [1, "col-panel-list"], [1, "col-panel-option", 3, "checked"], [1, "col-panel-actions"], ["mat-button", "", 3, "click"], ["mat-flat-button", "", "color", "primary", 3, "click"], [1, "col-panel-option", 3, "change", "checked"], ["type", "button", 1, "col-sortable"], ["type", "button", 1, "col-sortable", 3, "click"], [1, "sort-icon"], [1, "list-row"], [1, "col-checkbox", "col-hover-select"], [3, "click", "change", "checked", "aria-label"], [1, "col-actions"], ["mat-icon-button", "", 1, "action-btn", 3, "click", "matTooltip", "disabled"], [1, "action-icon"], ["mat-icon-button", "", 1, "action-btn", "action-danger", 3, "click", "matTooltip", "disabled"], [1, "col-name"], ["alt", "", 1, "row-thumbnail-image", 3, "src"], [1, "row-icon"], ["type", "button", 1, "row-name-text", 3, "click", "title"], [1, "list-action-bar"], [1, "list-actions-left"], [1, "list-select-all", 3, "change", "checked", "indeterminate", "aria-label", "disabled", "matTooltip"], [1, "list-select", 3, "selectionChange", "value"], [1, "simple-list"], [1, "simple-list-item", 3, "selected"], [1, "simple-list-item"], [1, "simple-list-thumb-wrap"], ["alt", "", 1, "simple-list-thumb", 3, "src"], [1, "simple-list-icon"], [1, "simple-list-checkbox", "col-hover-select"], [1, "simple-list-body"], [1, "simple-list-header"], ["type", "button", 1, "simple-list-title", 3, "click", "title"], [1, "simple-list-actions", "col-hover-actions"]], template: function TrashComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1);
            i0.ɵɵconditionalCreate(1, TrashComponent_Conditional_1_Template, 18, 15, "div", 2);
            i0.ɵɵelementStart(2, "div", 3)(3, "span", 4);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "div", 5)(7, "button", 6);
            i0.ɵɵlistener("click", function TrashComponent_Template_button_click_7_listener() { return ctx.saveAsSearch(); });
            i0.ɵɵelementStart(8, "mat-icon");
            i0.ɵɵtext(9, "bookmark_add");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(12, TrashComponent_Conditional_12_Template, 20, 17);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(13, "div", 7)(14, "div", 8);
            i0.ɵɵconditionalCreate(15, TrashComponent_Conditional_15_Template, 3, 6, "span", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "div", 10)(17, "button", 11);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵlistener("click", function TrashComponent_Template_button_click_17_listener() { return ctx.exportCsv(); });
            i0.ɵɵelementStart(20, "mat-icon");
            i0.ɵɵtext(21, "download");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "button", 11);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵlistener("click", function TrashComponent_Template_button_click_22_listener() { return ctx.setViewMode("grid"); });
            i0.ɵɵelementStart(25, "mat-icon");
            i0.ɵɵtext(26, "grid_view");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(27, "button", 11);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵlistener("click", function TrashComponent_Template_button_click_27_listener() { return ctx.setViewMode("table"); });
            i0.ɵɵelementStart(30, "mat-icon");
            i0.ɵɵtext(31, "view_list");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(32, "button", 11);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵlistener("click", function TrashComponent_Template_button_click_32_listener() { return ctx.setViewMode("list"); });
            i0.ɵɵelementStart(35, "mat-icon");
            i0.ɵɵtext(36, "format_list_bulleted");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(37, TrashComponent_Conditional_37_Template, 3, 3, "div", 12);
            i0.ɵɵconditionalCreate(38, TrashComponent_Conditional_38_Template, 2, 1, "div", 13);
            i0.ɵɵconditionalCreate(39, TrashComponent_Conditional_39_Template, 31, 33, "div", 14);
            i0.ɵɵconditionalCreate(40, TrashComponent_Conditional_40_Template, 18, 15, "div", 15);
            i0.ɵɵconditionalCreate(41, TrashComponent_Conditional_41_Template, 30, 33);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.selectedCount() > 0 ? 1 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 25, "trash.trash.search-results"));
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 27, "trash.trash.save-as"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.trashFilterService.hasSavedFilter() ? 12 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.resultCount() > 0 ? 15 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(18, 29, "trash.trash.export-csv"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 31, "trash.trash.export-csv"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "grid");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(23, 33, "trash.trash.grid-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 35, "trash.trash.grid-view"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "table");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(28, 37, "trash.trash.table-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(29, 39, "trash.trash.table-view"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "list");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(33, 41, "trash.trash.list-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(34, 43, "trash.trash.list-view"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.loading() ? 37 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() && !ctx.loading() ? 38 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.viewMode() === "grid" ? 39 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.viewMode() === "table" ? 40 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() && ctx.viewMode() === "list" ? 41 : -1);
        } }, dependencies: [MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTooltipModule, i3.MatTooltip, MatCheckboxModule, i4.MatCheckbox, MatProgressSpinnerModule, i5.MatProgressSpinner, MatSelectModule, i6.MatSelect, i6.MatOption, MatSnackBarModule,
            MatMenuModule, i7.MatMenu, i7.MatMenuItem, i7.MatMenuTrigger, MatDialogModule,
            SatTagModule, i8.SatCategoryTag, DocTypeLabelPipe,
            DescriptorLabelPipe,
            TranslatePipe,
            DatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.results-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n\n\n\n.page-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  margin-bottom: 12px;\n}\n\n.page-header-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.page-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.save-as-btn[_ngcontent-%COMP%] {\n  background: #1565c0;\n  color: #fff;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.save-btn[_ngcontent-%COMP%] {\n  background: #43a047;\n  color: #fff;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.results-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.results-count[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.toolbar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.toolbar-btn[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n.results-loading[_ngcontent-%COMP%], \n.results-error[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error[_ngcontent-%COMP%] {\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n\n\n\n.selection-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 8px 16px;\n  background: var(--mat-sys-primary, #5c6bc0);\n  color: #fff;\n  border-radius: 6px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.selection-bar-count[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.selection-bar-clear[_ngcontent-%COMP%] {\n  font-size: 13px;\n  text-decoration: underline;\n  cursor: pointer;\n  opacity: 0.85;\n\n  &:hover {\n    opacity: 1;\n  }\n}\n\n.selection-bar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-left: auto;\n}\n\n.selection-action-btn[_ngcontent-%COMP%] {\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n\n\n\n.grid-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  overflow: hidden;\n}\n\n.grid-action-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.grid-actions-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select[_ngcontent-%COMP%] {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.result-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  padding-bottom: 16px;\n  align-content: start;\n}\n\n\n\n.result-card[_ngcontent-%COMP%]:focus-within   .grid-card-checkbox[_ngcontent-%COMP%], \n.result-card[_ngcontent-%COMP%]:focus-within   .grid-card-actions[_ngcontent-%COMP%], \n.simple-list-item[_ngcontent-%COMP%]:focus-within   .simple-list-checkbox[_ngcontent-%COMP%], \n.simple-list-item[_ngcontent-%COMP%]:focus-within   .simple-list-actions[_ngcontent-%COMP%] {\n  opacity: 1;\n  visibility: visible;\n}\n\n.result-card[_ngcontent-%COMP%] {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition: box-shadow 0.15s ease;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n    .grid-card-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.result-card-thumbnail[_ngcontent-%COMP%] {\n  height: 160px;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n}\n\n.result-icon[_ngcontent-%COMP%] {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: #bdbdbd;\n}\n\n.result-thumbnail-image[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  display: block;\n}\n\n.result-card-body[_ngcontent-%COMP%] {\n  padding: 12px;\n  flex-grow: 1;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n.result-head[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.result-name[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.result-type-tag[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 4px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1.4;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 4px;\n}\n\n\n\n\n.list-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  padding-bottom: 24px;\n}\n\n.result-list[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n}\n\n.list-header[_ngcontent-%COMP%] {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n\n.list-row[_ngcontent-%COMP%] {\n  \n\n  position: relative;\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n    .col-hover-actions,\n    .col-hover-select {\n      opacity: 1;\n      visibility: visible;\n    }\n    .col-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  \n\n\n  &:focus-within {\n    .col-hover-actions,\n    .col-hover-select,\n    .col-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    .col-hover-select {\n      visibility: visible;\n    }\n  }\n}\n\n.col-checkbox[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-name[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-thumbnail-image[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.row-name-text[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.col-gear[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.col-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.col-sortable[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.gear-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.col-panel-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font: inherit;\n  padding: 0;\n}\n\n.col-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n  padding: 14px 16px;\n  min-width: 200px;\n  display: flex;\n  flex-direction: column;\n  max-height: 420px;\n}\n\n.col-panel-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px;\n}\n\n.col-panel-list[_ngcontent-%COMP%] {\n  overflow-y: auto;\n  flex: 1;\n  margin-bottom: 2px;\n}\n\n.col-panel-option[_ngcontent-%COMP%] {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.col-panel-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eceef3);\n}\n\n\n\n\n.list-action-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.list-actions-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.list-select[_ngcontent-%COMP%] {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.list-select-all[_ngcontent-%COMP%] {\n  margin-right: 4px;\n}\n\n.simple-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  padding: 4px 0 16px;\n}\n\n.simple-list-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  position: relative;\n  min-height: 72px;\n  cursor: pointer;\n  transition: background 0.2s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.simple-list-thumb-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  width: 56px;\n  height: 56px;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border-radius: 6px;\n}\n\n.simple-list-icon[_ngcontent-%COMP%] {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  color: #bdbdbd;\n}\n\n.simple-list-thumb[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 56px;\n  object-fit: cover;\n  border-radius: 6px;\n}\n\n.simple-list-checkbox[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 1;\n}\n\n.simple-list-body[_ngcontent-%COMP%] {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  flex: 1;\n  gap: 6px;\n}\n\n.simple-list-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.simple-list-title[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.2;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.simple-list-type-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n.simple-list-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n\n\n\n.action-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.action-danger[_ngcontent-%COMP%] {\n  &:hover {\n    color: #d32f2f;\n  }\n}\n\n.action-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n\n.results-empty[_ngcontent-%COMP%] {\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 14px;\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.result-name[_ngcontent-%COMP%], \n.row-name-text[_ngcontent-%COMP%], \n.simple-list-title[_ngcontent-%COMP%] {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n\n\n\n.grid-card-checkbox[_ngcontent-%COMP%], \n.simple-list-checkbox[_ngcontent-%COMP%], \n.col-checkbox[_ngcontent-%COMP%], \n.grid-card-actions[_ngcontent-%COMP%], \n.simple-list-actions[_ngcontent-%COMP%], \n.col-hover-actions[_ngcontent-%COMP%], \n.col-gear[_ngcontent-%COMP%], \n.action-btn[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TrashComponent, [{
        type: Component,
        args: [{ selector: 'lib-trash', standalone: true, imports: [
                    DocTypeLabelPipe,
                    DescriptorLabelPipe,
                    TranslatePipe,
                    DatePipe,
                    MatButtonModule,
                    MatIconModule,
                    MatTooltipModule,
                    MatCheckboxModule,
                    MatProgressSpinnerModule,
                    MatSelectModule,
                    MatSnackBarModule,
                    MatMenuModule,
                    MatDialogModule,
                    SatTagModule,
                ], template: "<div class=\"results-page\">\n  @if (selectedCount() > 0) {\n    <div class=\"selection-bar\">\n      <span class=\"selection-bar-count\">{{\n        (selectedCount() === 1 ? 'common.count.all-selected-one' : 'common.count.all-selected-many')\n          | translate: { count: selectedCount() }\n      }}</span>\n      <a class=\"selection-bar-clear\" (click)=\"selectionService.clear()\">{{\n        'trash.trash.clear' | translate\n      }}</a>\n      <div class=\"selection-bar-actions\">\n        <button\n          mat-flat-button\n          color=\"primary\"\n          class=\"selection-action-btn\"\n          (click)=\"restoreSelected()\"\n        >\n          <mat-icon>restore_from_trash</mat-icon>\n          {{ 'trash.trash.untrash-selected' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"warn\"\n          class=\"selection-action-btn\"\n          (click)=\"deleteSelected()\"\n        >\n          <mat-icon>delete_forever</mat-icon>\n          {{ 'trash.trash.delete-permanently-2' | translate }}\n        </button>\n      </div>\n    </div>\n  }\n\n  <div class=\"page-header-row\">\n    <span class=\"page-header-title\">{{ 'trash.trash.search-results' | translate }}</span>\n    <div class=\"page-header-actions\">\n      <button mat-flat-button class=\"save-as-btn\" [disabled]=\"saving()\" (click)=\"saveAsSearch()\">\n        <mat-icon>bookmark_add</mat-icon>\n        {{ 'trash.trash.save-as' | translate }}\n      </button>\n      @if (trashFilterService.hasSavedFilter()) {\n        <button mat-flat-button class=\"save-btn\" [disabled]=\"saving()\" (click)=\"saveSearch()\">\n          <mat-icon>bookmark</mat-icon>\n          {{ 'trash.trash.save' | translate }}\n        </button>\n        <button\n          mat-icon-button\n          type=\"button\"\n          [matMenuTriggerFor]=\"resultsActionsMenu\"\n          [attr.aria-label]=\"'trash.trash.results-actions' | translate\"\n        >\n          <mat-icon>more_vert</mat-icon>\n        </button>\n        <mat-menu #resultsActionsMenu=\"matMenu\">\n          <button mat-menu-item type=\"button\" (click)=\"onEditSelectedSavedSearch()\">\n            {{ 'trash.trash.edit' | translate }}\n          </button>\n          <button mat-menu-item type=\"button\" (click)=\"onShareSelectedSavedSearch()\">\n            {{ 'trash.trash.share' | translate }}\n          </button>\n          <button mat-menu-item type=\"button\" (click)=\"onDeleteSelectedSavedSearch()\">\n            {{ 'trash.trash.delete' | translate }}\n          </button>\n        </mat-menu>\n      }\n    </div>\n  </div>\n\n  <div class=\"results-toolbar\">\n    <div class=\"results-summary\">\n      @if (resultCount() > 0) {\n        <span class=\"results-count\">{{\n          (totalResults() === 1\n            ? 'common.count.trashed-document-one'\n            : 'common.count.trashed-document-many'\n          ) | translate: { count: totalResults() }\n        }}</span>\n      }\n    </div>\n\n    <div class=\"toolbar-actions\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'trash.trash.export-csv' | translate\"\n        [attr.aria-label]=\"'trash.trash.export-csv' | translate\"\n        (click)=\"exportCsv()\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [class.active]=\"viewMode() === 'grid'\"\n        [matTooltip]=\"'trash.trash.grid-view' | translate\"\n        [attr.aria-label]=\"'trash.trash.grid-view' | translate\"\n        (click)=\"setViewMode('grid')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>grid_view</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [class.active]=\"viewMode() === 'table'\"\n        [matTooltip]=\"'trash.trash.table-view' | translate\"\n        [attr.aria-label]=\"'trash.trash.table-view' | translate\"\n        (click)=\"setViewMode('table')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>view_list</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [class.active]=\"viewMode() === 'list'\"\n        [matTooltip]=\"'trash.trash.list-view' | translate\"\n        [attr.aria-label]=\"'trash.trash.list-view' | translate\"\n        (click)=\"setViewMode('list')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>format_list_bulleted</mat-icon>\n      </button>\n    </div>\n  </div>\n\n  @if (loading()) {\n    <div class=\"results-loading\">\n      <mat-spinner diameter=\"32\" [attr.aria-label]=\"'trash.trash.loading' | translate\" />\n    </div>\n  }\n\n  @if (error() && !loading()) {\n    <div class=\"results-error\">{{ error() }}</div>\n  }\n\n  <!-- \u2500\u2500\u2500\u2500\u2500 GRID VIEW \u2500\u2500\u2500\u2500\u2500 -->\n  @if (!loading() && !error() && viewMode() === 'grid') {\n    <div class=\"grid-container\">\n      <div class=\"grid-action-bar\">\n        <div class=\"grid-actions-left\">\n          <mat-checkbox\n            [checked]=\"isAllSelected()\"\n            [indeterminate]=\"isIndeterminate()\"\n            [aria-label]=\"'trash.trash.select-all' | translate\"\n            [disabled]=\"resultCount() === 0\"\n            [matTooltip]=\"'trash.trash.select-all' | translate\"\n            (change)=\"toggleAll()\"\n          ></mat-checkbox>\n\n          <mat-select\n            [value]=\"sortBy()\"\n            (selectionChange)=\"setSortBy($event.value)\"\n            class=\"grid-select\"\n          >\n            <mat-option value=\"title\">{{ 'trash.trash.title' | translate }}</mat-option>\n            <mat-option value=\"created\">{{ 'trash.trash.created' | translate }}</mat-option>\n            <mat-option value=\"modified\">{{ 'trash.trash.modified' | translate }}</mat-option>\n            <mat-option value=\"contributor\">{{\n              'trash.trash.last-contributor' | translate\n            }}</mat-option>\n            <mat-option value=\"state\">{{ 'trash.trash.state' | translate }}</mat-option>\n          </mat-select>\n\n          <button\n            mat-icon-button\n            [matTooltip]=\"'trash.trash.revert-sort-order' | translate\"\n            [attr.aria-label]=\"'trash.trash.revert-sort-order' | translate\"\n            (click)=\"toggleSortDir()\"\n            class=\"action-btn\"\n          >\n            <mat-icon>{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>\n          </button>\n        </div>\n      </div>\n\n      <div class=\"result-grid\">\n        @for (doc of documents(); track doc.uid) {\n          <div class=\"result-card\" [class.selected]=\"isSelected(doc.uid)\">\n            <div class=\"grid-card-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(doc.uid)\"\n                [aria-label]=\"'common.select-item' | translate: { name: doc.title }\"\n                (change)=\"toggleSelection(doc.uid)\"\n                (click)=\"$event.stopPropagation()\"\n              ></mat-checkbox>\n            </div>\n            <div class=\"result-card-thumbnail\">\n              @if (thumbnailMap()[doc.uid]; as thumb) {\n                <img class=\"result-thumbnail-image\" [src]=\"thumb\" alt=\"\" />\n              } @else {\n                <mat-icon class=\"result-icon\">{{ docIcon(doc) }}</mat-icon>\n              }\n            </div>\n            <div class=\"result-card-body\">\n              <button\n                type=\"button\"\n                class=\"result-name\"\n                [title]=\"doc.title\"\n                (click)=\"openDocument(doc.uid); $event.stopPropagation()\"\n              >\n                {{ doc.title }}\n              </button>\n              <sat-category-tag category=\"gray\">{{ doc.type | docTypeLabel }}</sat-category-tag>\n            </div>\n          </div>\n        }\n\n        @if (resultCount() === 0) {\n          <div class=\"results-empty\">{{ 'trash.trash.trash-is-empty' | translate }}</div>\n        }\n      </div>\n    </div>\n  }\n\n  <!-- \u2500\u2500\u2500\u2500\u2500 TABLE VIEW \u2500\u2500\u2500\u2500\u2500 -->\n  @if (!loading() && !error() && viewMode() === 'table') {\n    <div class=\"list-wrapper\">\n      @if (columnPanelOpen()) {\n        <button\n          type=\"button\"\n          class=\"col-panel-backdrop\"\n          [attr.aria-label]=\"'trash.trash.close-column-picker' | translate\"\n          (click)=\"closeColumnPanel()\"\n          (keydown.escape)=\"closeColumnPanel()\"\n        ></button>\n        <div class=\"col-panel\">\n          <p class=\"col-panel-title\">{{ 'trash.trash.column-settings' | translate }}</p>\n          <div class=\"col-panel-list\">\n            @for (col of columnsForPanel; track col.key) {\n              <mat-checkbox\n                class=\"col-panel-option\"\n                [checked]=\"isPendingColumn(col.key)\"\n                (change)=\"togglePendingColumn(col.key)\"\n                >{{ col | descriptorLabel }}</mat-checkbox\n              >\n            }\n          </div>\n          <div class=\"col-panel-actions\">\n            <button mat-button (click)=\"resetColumns()\">\n              {{ 'trash.trash.reset' | translate }}\n            </button>\n            <button mat-flat-button color=\"primary\" (click)=\"applyColumns()\">\n              {{ 'trash.trash.done' | translate }}\n            </button>\n          </div>\n        </div>\n      }\n\n      <div class=\"result-list\">\n        <div class=\"list-header\" [style.grid-template-columns]=\"gridTemplate()\">\n          <span class=\"col-checkbox\">\n            <mat-checkbox\n              [checked]=\"isAllSelected()\"\n              [indeterminate]=\"isIndeterminate()\"\n              [aria-label]=\"'trash.trash.select-all' | translate\"\n              (change)=\"toggleAll()\"\n            ></mat-checkbox>\n          </span>\n          @for (col of visibleColumns(); track col.key) {\n            @if (SORTABLE_COLUMNS.has(col.key)) {\n              <button type=\"button\" class=\"col-sortable\" (click)=\"sortByColumn(col.key)\">\n                {{ col | descriptorLabel }}\n                <mat-icon class=\"sort-icon\" [class.sort-active]=\"sortBy() === col.key\">\n                  {{\n                    sortBy() === col.key && sortDir() === 'desc' ? 'arrow_downward' : 'arrow_upward'\n                  }}\n                </mat-icon>\n              </button>\n            } @else {\n              <span>{{ col | descriptorLabel }}</span>\n            }\n          }\n          <span class=\"col-gear\">\n            <button\n              mat-icon-button\n              class=\"gear-btn\"\n              [matTooltip]=\"'trash.trash.manage-columns' | translate\"\n              [attr.aria-label]=\"'trash.trash.manage-columns' | translate\"\n              (click)=\"openColumnPanel()\"\n            >\n              <mat-icon>tune</mat-icon>\n            </button>\n          </span>\n        </div>\n\n        @for (doc of documents(); track doc.uid) {\n          <div\n            class=\"list-row\"\n            [class.selected]=\"isSelected(doc.uid)\"\n            [style.grid-template-columns]=\"gridTemplate()\"\n          >\n            <span class=\"col-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(doc.uid)\"\n                [aria-label]=\"'common.select-item' | translate: { name: doc.title }\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"toggleSelection(doc.uid)\"\n              ></mat-checkbox>\n            </span>\n            @for (col of visibleColumns(); track col.key) {\n              @if (col.key === 'title') {\n                <span class=\"col-name\">\n                  @if (thumbnailMap()[doc.uid]; as thumb) {\n                    <img class=\"row-thumbnail-image\" [src]=\"thumb\" alt=\"\" />\n                  } @else {\n                    <mat-icon class=\"row-icon\">{{ docIcon(doc) }}</mat-icon>\n                  }\n                  <button\n                    type=\"button\"\n                    class=\"row-name-text\"\n                    [title]=\"doc.title\"\n                    (click)=\"openDocument(doc.uid); $event.stopPropagation()\"\n                  >\n                    {{ doc.title }}\n                  </button>\n                </span>\n              } @else if (col.key === 'modified' || col.key === 'created') {\n                <span>{{ getCellValue(doc, col.key) | date: 'medium' }}</span>\n              } @else if (col.key === 'type') {\n                <span>{{ doc.type | docTypeLabel }}</span>\n              } @else {\n                <span>{{ getCellValue(doc, col.key) }}</span>\n              }\n            }\n            <span class=\"col-actions\">\n              <button\n                mat-icon-button\n                [matTooltip]=\"'trash.trash.restore' | translate\"\n                [attr.aria-label]=\"'trash.trash.restore' | translate\"\n                class=\"action-btn\"\n                [disabled]=\"actionInProgress().has(doc.uid)\"\n                (click)=\"restoreDocument(doc.uid, $event)\"\n              >\n                <mat-icon class=\"action-icon\">restore_from_trash</mat-icon>\n              </button>\n              <button\n                mat-icon-button\n                [matTooltip]=\"'trash.trash.delete-permanently' | translate\"\n                [attr.aria-label]=\"'trash.trash.delete-permanently' | translate\"\n                class=\"action-btn action-danger\"\n                [disabled]=\"actionInProgress().has(doc.uid)\"\n                (click)=\"permanentlyDelete(doc.uid, $event)\"\n              >\n                <mat-icon class=\"action-icon\">delete_forever</mat-icon>\n              </button>\n            </span>\n          </div>\n        }\n\n        @if (resultCount() === 0) {\n          <div class=\"results-empty\">{{ 'trash.trash.trash-is-empty' | translate }}</div>\n        }\n      </div>\n    </div>\n  }\n\n  <!-- \u2500\u2500\u2500\u2500\u2500 LIST VIEW \u2500\u2500\u2500\u2500\u2500 -->\n  @if (!loading() && !error() && viewMode() === 'list') {\n    <div class=\"list-action-bar\">\n      <div class=\"list-actions-left\">\n        <mat-checkbox\n          [checked]=\"isAllSelected()\"\n          [indeterminate]=\"isIndeterminate()\"\n          [aria-label]=\"'trash.trash.select-all' | translate\"\n          [disabled]=\"resultCount() === 0\"\n          [matTooltip]=\"'trash.trash.select-all' | translate\"\n          (change)=\"toggleAll()\"\n          class=\"list-select-all\"\n        ></mat-checkbox>\n\n        <mat-select\n          [value]=\"sortBy()\"\n          (selectionChange)=\"setSortBy($event.value)\"\n          class=\"list-select\"\n        >\n          <mat-option value=\"title\">{{ 'trash.trash.title' | translate }}</mat-option>\n          <mat-option value=\"created\">{{ 'trash.trash.created' | translate }}</mat-option>\n          <mat-option value=\"modified\">{{ 'trash.trash.modified' | translate }}</mat-option>\n          <mat-option value=\"contributor\">{{\n            'trash.trash.last-contributor' | translate\n          }}</mat-option>\n          <mat-option value=\"state\">{{ 'trash.trash.state' | translate }}</mat-option>\n        </mat-select>\n\n        <button\n          mat-icon-button\n          [matTooltip]=\"'trash.trash.revert-sort-order' | translate\"\n          [attr.aria-label]=\"'trash.trash.revert-sort-order' | translate\"\n          (click)=\"toggleSortDir()\"\n          class=\"action-btn\"\n        >\n          <mat-icon>{{ sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>\n        </button>\n      </div>\n    </div>\n\n    <div class=\"simple-list\">\n      @for (doc of documents(); track doc.uid) {\n        <div class=\"simple-list-item\" [class.selected]=\"isSelected(doc.uid)\">\n          <div class=\"simple-list-thumb-wrap\">\n            @if (thumbnailMap()[doc.uid]; as thumb) {\n              <img class=\"simple-list-thumb\" [src]=\"thumb\" alt=\"\" />\n            } @else {\n              <mat-icon class=\"simple-list-icon\">{{ docIcon(doc) }}</mat-icon>\n            }\n            <span class=\"simple-list-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(doc.uid)\"\n                [aria-label]=\"'common.select-item' | translate: { name: doc.title }\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"toggleSelection(doc.uid)\"\n              ></mat-checkbox>\n            </span>\n          </div>\n          <div class=\"simple-list-body\">\n            <div class=\"simple-list-header\">\n              <button\n                type=\"button\"\n                class=\"simple-list-title\"\n                [title]=\"doc.title\"\n                (click)=\"openDocument(doc.uid); $event.stopPropagation()\"\n              >\n                {{ doc.title }}\n              </button>\n              <sat-category-tag category=\"gray\">{{ doc.type | docTypeLabel }}</sat-category-tag>\n            </div>\n            <div class=\"simple-list-actions col-hover-actions\">\n              <button\n                mat-icon-button\n                [matTooltip]=\"'trash.trash.restore' | translate\"\n                [attr.aria-label]=\"'trash.trash.restore' | translate\"\n                class=\"action-btn\"\n                [disabled]=\"actionInProgress().has(doc.uid)\"\n                (click)=\"restoreDocument(doc.uid, $event)\"\n              >\n                <mat-icon class=\"action-icon\">restore_from_trash</mat-icon>\n              </button>\n              <button\n                mat-icon-button\n                [matTooltip]=\"'trash.trash.delete-permanently' | translate\"\n                [attr.aria-label]=\"'trash.trash.delete-permanently' | translate\"\n                class=\"action-btn action-danger\"\n                [disabled]=\"actionInProgress().has(doc.uid)\"\n                (click)=\"permanentlyDelete(doc.uid, $event)\"\n              >\n                <mat-icon class=\"action-icon\">delete_forever</mat-icon>\n              </button>\n            </div>\n          </div>\n        </div>\n      }\n\n      @if (resultCount() === 0) {\n        <div class=\"results-empty\">{{ 'trash.trash.trash-is-empty' | translate }}</div>\n      }\n    </div>\n  }\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n}\n\n.results-page {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n/* \u2500\u2500 Page Header Row \u2500\u2500 */\n\n.page-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  margin-bottom: 12px;\n}\n\n.page-header-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.page-header-actions {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.save-as-btn {\n  background: #1565c0;\n  color: #fff;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.save-btn {\n  background: #43a047;\n  color: #fff;\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.results-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-summary {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.results-count {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.toolbar-actions {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.toolbar-btn {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n.results-loading,\n.results-error {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error {\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n/* \u2500\u2500 Selection Bar \u2500\u2500 */\n\n.selection-bar {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 8px 16px;\n  background: var(--mat-sys-primary, #5c6bc0);\n  color: #fff;\n  border-radius: 6px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.selection-bar-count {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.selection-bar-clear {\n  font-size: 13px;\n  text-decoration: underline;\n  cursor: pointer;\n  opacity: 0.85;\n\n  &:hover {\n    opacity: 1;\n  }\n}\n\n.selection-bar-actions {\n  display: flex;\n  gap: 8px;\n  margin-left: auto;\n}\n\n.selection-action-btn {\n  font-size: 13px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n/* \u2500\u2500 Grid View \u2500\u2500 */\n\n.grid-container {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  overflow: hidden;\n}\n\n.grid-action-bar {\n  display: flex;\n  align-items: center;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.grid-actions-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.result-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  padding-bottom: 16px;\n  align-content: start;\n}\n\n/* Keyboard focus inside a card or a simple-list row reveals its hidden checkbox and actions. */\n.result-card:focus-within .grid-card-checkbox,\n.result-card:focus-within .grid-card-actions,\n.simple-list-item:focus-within .simple-list-checkbox,\n.simple-list-item:focus-within .simple-list-actions {\n  opacity: 1;\n  visibility: visible;\n}\n\n.result-card {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition: box-shadow 0.15s ease;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n    .grid-card-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.result-card-thumbnail {\n  height: 160px;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n}\n\n.result-icon {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: #bdbdbd;\n}\n\n.result-thumbnail-image {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  display: block;\n}\n\n.result-card-body {\n  padding: 12px;\n  flex-grow: 1;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n.result-head {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.result-name {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.result-type-tag {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 4px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1.4;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 4px;\n}\n\n/* \u2500\u2500 Table View \u2500\u2500 */\n\n.list-wrapper {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  padding-bottom: 24px;\n}\n\n.result-list {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n}\n\n.list-header {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n}\n\n.list-row {\n  /* positioning context for the title button's stretched hit area */\n  position: relative;\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n    .col-hover-actions,\n    .col-hover-select {\n      opacity: 1;\n      visibility: visible;\n    }\n    .col-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  /* A keyboard user's focus lands on a row's checkbox and actions, which are hidden until hover.\n     Reveal them while focus is inside the row, so the focused control is visible. */\n  &:focus-within {\n    .col-hover-actions,\n    .col-hover-select,\n    .col-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    .col-hover-select {\n      visibility: visible;\n    }\n  }\n}\n\n.col-checkbox {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-name {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-thumbnail-image {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.row-name-text {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.col-gear {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.col-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.col-sortable {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.gear-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.col-panel-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font: inherit;\n  padding: 0;\n}\n\n.col-panel {\n  position: absolute;\n  top: 43px;\n  right: 0;\n  z-index: 100;\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\n  padding: 14px 16px;\n  min-width: 200px;\n  display: flex;\n  flex-direction: column;\n  max-height: 420px;\n}\n\n.col-panel-title {\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px;\n}\n\n.col-panel-list {\n  overflow-y: auto;\n  flex: 1;\n  margin-bottom: 2px;\n}\n\n.col-panel-option {\n  display: flex;\n  margin-bottom: 6px;\n}\n\n.col-panel-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eceef3);\n}\n\n/* \u2500\u2500 List View \u2500\u2500 */\n\n.list-action-bar {\n  display: flex;\n  align-items: center;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.list-actions-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.list-select {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.list-select-all {\n  margin-right: 4px;\n}\n\n.simple-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  padding: 4px 0 16px;\n}\n\n.simple-list-item {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  position: relative;\n  min-height: 72px;\n  cursor: pointer;\n  transition: background 0.2s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.simple-list-thumb-wrap {\n  position: relative;\n  width: 56px;\n  height: 56px;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border-radius: 6px;\n}\n\n.simple-list-icon {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  color: #bdbdbd;\n}\n\n.simple-list-thumb {\n  width: 56px;\n  height: 56px;\n  object-fit: cover;\n  border-radius: 6px;\n}\n\n.simple-list-checkbox {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 1;\n}\n\n.simple-list-body {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  flex: 1;\n  gap: 6px;\n}\n\n.simple-list-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.simple-list-title {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.2;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.simple-list-type-badge {\n  display: inline-flex;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n.simple-list-actions {\n  display: flex;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n/* \u2500\u2500 Common \u2500\u2500 */\n\n.action-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.action-danger {\n  &:hover {\n    color: #d32f2f;\n  }\n}\n\n.action-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n\n.results-empty {\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 14px;\n}\n\n/*\n  Stretched hit area for the row's single control.\n * ---------------------------------------------\n * These rows used to be `<button>` elements wrapping a checkbox and action buttons, which is\n * `nested-interactive` \u2014 invalid HTML and WCAG 4.1.2, because a control cannot contain a\n * control. The title is now the row's one real control, and this pseudo-element extends its\n * clickable area over the whole row, so clicking anywhere still opens the document.\n *\n * The alternative was a focusable `<div role=\"button\">` with key handlers, which reintroduces\n * exactly the nesting this removes; `@angular-eslint`'s `interactive-supports-focus` and\n * `click-events-have-key-events` reject the middle ground of a click handler on a plain div,\n * and they are right to.\n */\n.result-name,\n.row-name-text,\n.simple-list-title {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n/* The controls have to sit above that overlay. `z-index` alone did nothing here: these\n   wrappers were `position: static`, on which `z-index` has no effect. */\n.grid-card-checkbox,\n.simple-list-checkbox,\n.col-checkbox,\n.grid-card-actions,\n.simple-list-actions,\n.col-hover-actions,\n.col-gear,\n.action-btn {\n  position: relative;\n  z-index: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TrashComponent, { className: "TrashComponent", filePath: "libs/features/trash/src/lib/trash/trash.component.ts", lineNumber: 100 }); })();
