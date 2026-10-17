import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, afterEveryRender, booleanAttribute, computed, effect, inject, input, model, numberAttribute, output, signal, untracked, } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { ExtensionOutletComponent } from '@nuxeo/satori-platform/extensions';
import { DocTypeLabelPipe, NON_CONTENT_DOCUMENT_TYPES, avatarColor, docTypeIcon, isFolderishDocument, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsActionMenuComponent } from '../action-menu/action-menu.component';
import { NxsAvatarComponent } from '../avatar/avatar.component';
import { NxsEmptyStateComponent } from '../empty-state/empty-state.component';
import { NxsErrorStateComponent } from '../error-state/error-state.component';
import { NxsFileDropTracker } from '../file-drop';
import { NxsPagerComponent } from '../pager/pager.component';
import { NXS_PRIMITIVE_IDS } from '../primitives';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { NxsTagComponent } from '../tag/tag.component';
import { NxsThumbnailComponent } from '../thumbnail/thumbnail.component';
import { nxsVisibleText } from '../visible-text';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/checkbox";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/sort";
import * as i4 from "@angular/material/table";
const _c0 = a0 => ({ name: a0 });
const _c1 = a0 => ({ column: a0 });
const _c2 = (a0, a1, a2) => ({ $implicit: a0, key: a1, index: a2 });
const _c3 = a0 => ({ label: a0, color: "blue" });
const _c4 = (a0, a1) => ({ initials: a0, color: a1, size: "24" });
const _forTrack0 = ($index, $item) => $item.key;
function NxsDocumentListComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "nxs-spinner", 8);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.document-list.loading"));
} }
function NxsDocumentListComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 9);
    i0.ɵɵlistener("retry", function NxsDocumentListComponent_Conditional_1_Template_nxs_error_state_retry_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.retry.emit()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r3 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", status_r3)("heading", status_r3 === 500 ? ctx_r1.errorHeading() : "")("headingLevel", ctx_r1.stateHeadingLevel());
} }
function NxsDocumentListComponent_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-empty-state", 10);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("heading", ctx_r1.emptyHeading().trim() || i0.ɵɵpipeBind1(1, 3, "satori-components.document-list.empty"))("message", ctx_r1.emptyMessage())("headingLevel", ctx_r1.stateHeadingLevel());
} }
function NxsDocumentListComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsDocumentListComponent_Conditional_2_Conditional_0_Template, 2, 5, "nxs-empty-state", 10);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.pageIndex() === 0 ? 0 : -1);
} }
function NxsDocumentListComponent_Conditional_3_th_6_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "th", 21)(1, "span", 22);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-checkbox", 23);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("change", function NxsDocumentListComponent_Conditional_3_th_6_Template_mat_checkbox_change_4_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onSelectPage($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 4, "satori-components.document-list.selection"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.allOnPageSelected())("indeterminate", ctx_r1.someOnPageSelected());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind1(5, 6, "satori-components.document-list.select-page"));
} }
function NxsDocumentListComponent_Conditional_3_td_7_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 24)(1, "mat-checkbox", 25);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("mousedown", function NxsDocumentListComponent_Conditional_3_td_7_Template_mat_checkbox_mousedown_1_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.noteModifiers($event)); })("keydown", function NxsDocumentListComponent_Conditional_3_td_7_Template_mat_checkbox_keydown_1_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.noteModifiers($event)); })("change", function NxsDocumentListComponent_Conditional_3_td_7_Template_mat_checkbox_change_1_listener($event) { const i_r7 = i0.ɵɵrestoreView(_r6).index; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onCheckboxChange($event, i_r7)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const doc_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("checked", ctx_r1.isSelected(doc_r8))("tabIndex", -1);
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(2, 3, "satori-components.document-list.select", i0.ɵɵpureFunction1(6, _c0, ctx_r1.accessibleName(doc_r8))));
} }
function NxsDocumentListComponent_Conditional_3_For_9_th_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 28);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const column_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("sortActionDescription", i0.ɵɵpipeBind2(1, 2, "satori-components.document-list.sort-by", i0.ɵɵpureFunction1(5, _c1, column_r9.label)));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", column_r9.label, " ");
} }
function NxsDocumentListComponent_Conditional_3_For_9_td_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentListComponent_Conditional_3_For_9_td_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 29);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_Conditional_3_For_9_td_2_ng_container_1_Template, 1, 0, "ng-container", 30);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r10 = ctx.$implicit;
    const i_r11 = ctx.index;
    const column_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(2);
    const cell_r12 = i0.ɵɵreference(7);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", cell_r12)("ngTemplateOutletContext", i0.ɵɵpureFunction3(2, _c2, doc_r10, column_r9.key, i_r11));
} }
function NxsDocumentListComponent_Conditional_3_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0, 14);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_Conditional_3_For_9_th_1_Template, 3, 7, "th", 26)(2, NxsDocumentListComponent_Conditional_3_For_9_td_2_Template, 2, 6, "td", 27);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const column_r9 = ctx.$implicit;
    i0.ɵɵproperty("matColumnDef", column_r9.key);
} }
function NxsDocumentListComponent_Conditional_3_For_11_th_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 32);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const column_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(column_r13.label);
} }
function NxsDocumentListComponent_Conditional_3_For_11_td_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentListComponent_Conditional_3_For_11_td_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 29);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_Conditional_3_For_11_td_2_ng_container_1_Template, 1, 0, "ng-container", 30);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r14 = ctx.$implicit;
    const i_r15 = ctx.index;
    const column_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(2);
    const cell_r12 = i0.ɵɵreference(7);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", cell_r12)("ngTemplateOutletContext", i0.ɵɵpureFunction3(2, _c2, doc_r14, column_r13.key, i_r15));
} }
function NxsDocumentListComponent_Conditional_3_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0, 14);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_Conditional_3_For_11_th_1_Template, 2, 1, "th", 31)(2, NxsDocumentListComponent_Conditional_3_For_11_td_2_Template, 2, 6, "td", 27);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const column_r13 = ctx.$implicit;
    i0.ɵɵproperty("matColumnDef", column_r13.key);
} }
function NxsDocumentListComponent_Conditional_3_th_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 33)(1, "span", 22);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "satori-components.document-list.actions"));
} }
function NxsDocumentListComponent_Conditional_3_td_14_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-action-menu", 36);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("selected", function NxsDocumentListComponent_Conditional_3_td_14_Conditional_2_Template_nxs_action_menu_selected_0_listener($event) { i0.ɵɵrestoreView(_r16); const doc_r17 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onRowAction($event, doc_r17)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r17 = i0.ɵɵnextContext().$implicit;
    const entries_r18 = i0.ɵɵreadContextLet(1);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("actions", entries_r18)("label", i0.ɵɵpipeBind2(1, 2, "satori-components.document-list.row-actions", i0.ɵɵpureFunction1(5, _c0, ctx_r1.accessibleName(doc_r17))));
} }
function NxsDocumentListComponent_Conditional_3_td_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 34);
    i0.ɵɵdeclareLet(1);
    i0.ɵɵconditionalCreate(2, NxsDocumentListComponent_Conditional_3_td_14_Conditional_2_Template, 2, 7, "nxs-action-menu", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r17 = ctx.$implicit;
    i0.ɵɵadvance();
    const entries_r19 = i0.ɵɵstoreLet(i0.ɵɵnextContext(2).actionsFor(doc_r17));
    i0.ɵɵadvance();
    i0.ɵɵconditional(entries_r19.length > 0 ? 2 : -1);
} }
function NxsDocumentListComponent_Conditional_3_tr_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 37);
} }
function NxsDocumentListComponent_Conditional_3_tr_16_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 38);
    i0.ɵɵlistener("focusin", function NxsDocumentListComponent_Conditional_3_tr_16_Template_tr_focusin_0_listener() { const i_r21 = i0.ɵɵrestoreView(_r20).index; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onRowFocusIn(i_r21)); })("click", function NxsDocumentListComponent_Conditional_3_tr_16_Template_tr_click_0_listener($event) { const ctx_r21 = i0.ɵɵrestoreView(_r20); const doc_r23 = ctx_r21.$implicit; const i_r21 = ctx_r21.index; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onRowClick($event, doc_r23, i_r21)); })("keydown", function NxsDocumentListComponent_Conditional_3_tr_16_Template_tr_keydown_0_listener($event) { const ctx_r23 = i0.ɵɵrestoreView(_r20); const doc_r23 = ctx_r23.$implicit; const i_r21 = ctx_r23.index; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onRowKeydown($event, doc_r23, i_r21)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r23 = ctx.$implicit;
    const i_r21 = ctx.index;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("nxs-document-list__row--selected", ctx_r1.isSelected(doc_r23))("nxs-document-list__row--folder", ctx_r1.isFolder(doc_r23));
    i0.ɵɵattribute("data-row", i_r21)("data-uid", doc_r23.uid)("tabindex", i_r21 === ctx_r1.activeIndex() ? 0 : -1)("aria-label", ctx_r1.accessibleName(doc_r23))("aria-selected", ctx_r1.selectable() ? ctx_r1.isSelected(doc_r23) : null)("aria-rowindex", ctx_r1.rowIndex(i_r21))("aria-describedby", ctx_r1.hintId);
} }
function NxsDocumentListComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 12)(4, "table", 13);
    i0.ɵɵlistener("matSortChange", function NxsDocumentListComponent_Conditional_3_Template_table_matSortChange_4_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onSortChange($event)); });
    i0.ɵɵelementContainerStart(5, 14);
    i0.ɵɵtemplate(6, NxsDocumentListComponent_Conditional_3_th_6_Template, 6, 8, "th", 15)(7, NxsDocumentListComponent_Conditional_3_td_7_Template, 3, 8, "td", 16);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵrepeaterCreate(8, NxsDocumentListComponent_Conditional_3_For_9_Template, 3, 1, "ng-container", 14, _forTrack0);
    i0.ɵɵrepeaterCreate(10, NxsDocumentListComponent_Conditional_3_For_11_Template, 3, 1, "ng-container", 14, _forTrack0);
    i0.ɵɵelementContainerStart(12, 14);
    i0.ɵɵtemplate(13, NxsDocumentListComponent_Conditional_3_th_13_Template, 4, 3, "th", 17)(14, NxsDocumentListComponent_Conditional_3_td_14_Template, 3, 2, "td", 18);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(15, NxsDocumentListComponent_Conditional_3_tr_15_Template, 1, 0, "tr", 19)(16, NxsDocumentListComponent_Conditional_3_tr_16_Template, 1, 11, "tr", 20);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r1.hintId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 11, ctx_r1.selectable() ? "satori-components.document-list.keyboard-hint" : "satori-components.document-list.keyboard-hint-no-selection"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("dataSource", ctx_r1.documents())("matSortActive", ctx_r1.matSortActive())("matSortDirection", ctx_r1.matSortDirection());
    i0.ɵɵattribute("aria-label", ctx_r1.label())("aria-rowcount", ctx_r1.rowCount());
    i0.ɵɵadvance();
    i0.ɵɵproperty("matColumnDef", ctx_r1.selectColumn);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.sortableColumns());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.plainColumns());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matColumnDef", ctx_r1.actionsColumn);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.displayedColumns());
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.displayedColumns());
} }
function NxsDocumentListComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-pager", 39);
    i0.ɵɵlistener("pageChange", function NxsDocumentListComponent_Conditional_4_Template_nxs_pager_pageChange_0_listener($event) { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onPageChange($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("pageIndex", ctx_r1.pageIndex())("pageSize", ctx_r1.pageSize())("itemCount", ctx_r1.documents().length)("totalSize", ctx_r1.totalSize())("hasNextPage", ctx_r1.hasNextPage())("disabled", ctx_r1.loading());
} }
function NxsDocumentListComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "span", 40);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.dropLabel().trim() || i0.ɵɵpipeBind1(3, 1, "satori-components.document-list.drop"), " ");
} }
function NxsDocumentListComponent_ng_template_6_Case_0_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 45);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r27 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("nxs-document-list__icon--folder", ctx_r1.isFolder(doc_r27));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.icon(doc_r27));
} }
function NxsDocumentListComponent_ng_template_6_Case_0_Conditional_3_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentListComponent_ng_template_6_Case_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "nxs-thumbnail", 43);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_ng_template_6_Case_0_Conditional_3_ng_container_1_Template, 1, 0, "ng-container", 46);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const typeIcon_r28 = i0.ɵɵreference(2);
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("documentId", doc_r27.uid);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", typeIcon_r28);
} }
function NxsDocumentListComponent_ng_template_6_Case_0_Conditional_4_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentListComponent_ng_template_6_Case_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, NxsDocumentListComponent_ng_template_6_Case_0_Conditional_4_ng_container_0_Template, 1, 0, "ng-container", 46);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const typeIcon_r28 = i0.ɵɵreference(2);
    i0.ɵɵproperty("ngTemplateOutlet", typeIcon_r28);
} }
function NxsDocumentListComponent_ng_template_6_Case_0_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 41);
    i0.ɵɵtemplate(1, NxsDocumentListComponent_ng_template_6_Case_0_ng_template_1_Template, 2, 3, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵconditionalCreate(3, NxsDocumentListComponent_ng_template_6_Case_0_Conditional_3_Template, 2, 2, "nxs-thumbnail", 43)(4, NxsDocumentListComponent_ng_template_6_Case_0_Conditional_4_Template, 1, 1, "ng-container");
    i0.ɵɵelementStart(5, "button", 44);
    i0.ɵɵlistener("click", function NxsDocumentListComponent_ng_template_6_Case_0_Template_button_click_5_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r28 = i0.ɵɵnextContext(); const doc_r27 = ctx_r28.$implicit; const i_r30 = ctx_r28.index; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onOpenClick($event, doc_r27, i_r30)); });
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.hasThumbnail(doc_r27) ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("title", doc_r27.path);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.rowName(doc_r27), " ");
} }
function NxsDocumentListComponent_ng_template_6_Case_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-tag", 48);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const typeLabel_r31 = i0.ɵɵreadContextLet(0);
    i0.ɵɵproperty("label", typeLabel_r31);
} }
function NxsDocumentListComponent_ng_template_6_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "docTypeLabel");
    i0.ɵɵelement(2, "lib-extension-outlet", 47, 2);
    i0.ɵɵconditionalCreate(4, NxsDocumentListComponent_ng_template_6_Case_1_Conditional_4_Template, 1, 1, "nxs-tag", 48);
} if (rf & 2) {
    const tagOutlet_r32 = i0.ɵɵreference(3);
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    const typeLabel_r33 = i0.ɵɵstoreLet(i0.ɵɵpipeBind1(1, 3, doc_r27.type));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("componentId", ctx_r1.tagId)("componentInputs", i0.ɵɵpureFunction1(6, _c3, typeLabel_r33));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(tagOutlet_r32.unresolved() ? 4 : -1);
} }
function NxsDocumentListComponent_ng_template_6_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "date");
} if (rf & 2) {
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, doc_r27.lastModified, "mediumDate"), " ");
} }
function NxsDocumentListComponent_ng_template_6_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "date");
} if (rf & 2) {
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, ctx_r1.createdDate(doc_r27), "mediumDate"), " ");
} }
function NxsDocumentListComponent_ng_template_6_Case_4_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-avatar", 49);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const person_r34 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("initials", ctx_r1.initials(person_r34))("color", ctx_r1.avatarColor(person_r34));
} }
function NxsDocumentListComponent_ng_template_6_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵelementStart(1, "span", 42);
    i0.ɵɵelement(2, "lib-extension-outlet", 47, 3);
    i0.ɵɵconditionalCreate(4, NxsDocumentListComponent_ng_template_6_Case_4_Conditional_4_Template, 1, 2, "nxs-avatar", 49);
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const avatarOutlet_r35 = i0.ɵɵreference(3);
    const doc_r27 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    const person_r36 = i0.ɵɵstoreLet(ctx_r1.contributor(doc_r27));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("componentId", ctx_r1.avatarId)("componentInputs", i0.ɵɵpureFunction2(5, _c4, ctx_r1.initials(person_r36), ctx_r1.avatarColor(person_r36)));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(avatarOutlet_r35.unresolved() ? 4 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(person_r36);
} }
function NxsDocumentListComponent_ng_template_6_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r28 = i0.ɵɵnextContext();
    const doc_r27 = ctx_r28.$implicit;
    const key_r37 = ctx_r28.key;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.cellText(doc_r27, key_r37), " ");
} }
function NxsDocumentListComponent_ng_template_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsDocumentListComponent_ng_template_6_Case_0_Template, 7, 3, "span", 41)(1, NxsDocumentListComponent_ng_template_6_Case_1_Template, 5, 8)(2, NxsDocumentListComponent_ng_template_6_Case_2_Template, 2, 4)(3, NxsDocumentListComponent_ng_template_6_Case_3_Template, 2, 4)(4, NxsDocumentListComponent_ng_template_6_Case_4_Template, 7, 8, "span", 42)(5, NxsDocumentListComponent_ng_template_6_Case_5_Template, 1, 1);
} if (rf & 2) {
    let tmp_5_0;
    const key_r37 = ctx.key;
    i0.ɵɵconditional((tmp_5_0 = key_r37) === "title" ? 0 : tmp_5_0 === "type" ? 1 : tmp_5_0 === "modified" ? 2 : tmp_5_0 === "created" ? 3 : tmp_5_0 === "lastContributor" ? 4 : 5);
} }
const SELECT_COLUMN = '__select';
const ACTIONS_COLUMN = '__actions';
/** What a row's controls are found by, to keep them out of the Tab sequence. */
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
/** The same, scoped to the body rows: each alternative on its own, or the header is caught too. */
const ROW_CONTROLS = FOCUSABLE.split(',')
    .map((selector) => `tr.nxs-document-list__row ${selector.trim()}`)
    .join(', ');
let nextId = 0;
/**
 * One page of documents as a table: sortable headers, selection, keyboard navigation and a pager,
 * with the loading, empty and error states in place of the rows.
 *
 * The server pages and sorts it. The list never sorts or slices what it is given: it shows the
 * page in `documents`, and asks for another order with `sortChange` and another page with
 * `pageChange`. A Material table with `MatSort`, not virtualised —
 * `docs/satori-components/decision-table-primitive.md`.
 *
 * One row is in the Tab sequence at a time. Arrow keys move between rows, Home and End go to the
 * first and last, Space selects, Shift extends a selection from the last row selected, Ctrl or
 * Cmd+A selects the page, and Enter opens. Inside a row, Right and Left move between its controls,
 * which never take a Tab stop of their own.
 */
export class NxsDocumentListComponent {
    /** The page on screen, in the server's order. */
    documents = input.required(...(ngDevMode ? [{ debugName: "documents" }] : []));
    /** The columns, in order. The `title` column is the one that names each row. */
    columns = input.required(...(ngDevMode ? [{ debugName: "columns" }] : []));
    /** The table's accessible name, already translated, such as "Contents of Invoices". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The order the page is in, or `null` for the source's own order. */
    sort = input(null, ...(ngDevMode ? [{ debugName: "sort" }] : []));
    /** The selected documents' ids, on every page. Two-way: `[(selectedIds)]`. */
    selectedIds = model([], ...(ngDevMode ? [{ debugName: "selectedIds" }] : []));
    /** Shows the selection checkboxes. Accepts a bare attribute. */
    selectable = input(true, ...(ngDevMode ? [{ debugName: "selectable", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The page on screen, from zero. */
    pageIndex = input(0, ...(ngDevMode ? [{ debugName: "pageIndex", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many documents a full page holds. */
    pageSize = input(50, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every document across every page, or negative when the server did not count them. */
    totalSize = input(-1, ...(ngDevMode ? [{ debugName: "totalSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Whether the server has another page. */
    hasNextPage = input(false, ...(ngDevMode ? [{ debugName: "hasNextPage", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shows the loader in place of the rows. */
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The status of the request that failed, mapped with `nxsErrorStatus()`, or `null`. */
    error = input(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    /**
     * What failed, already translated — "The folder could not be loaded". Shown for a server error
     * only: a 401, 403 or 404 keeps its own heading, so a refusal never reads as a breakage.
     */
    errorHeading = input('', ...(ngDevMode ? [{ debugName: "errorHeading" }] : []));
    /** The empty state's heading, already translated. Blank says "Nothing here yet". */
    emptyHeading = input('', ...(ngDevMode ? [{ debugName: "emptyHeading" }] : []));
    /** An optional second line for the empty state, already translated. */
    emptyMessage = input('', ...(ngDevMode ? [{ debugName: "emptyMessage" }] : []));
    /** The level of the empty and error states' headings in the page outline. */
    stateHeadingLevel = input(2, ...(ngDevMode ? [{ debugName: "stateHeadingLevel" }] : []));
    /** Each row's menu entries, by document id. A row with none has no menu. */
    rowActions = input({}, ...(ngDevMode ? [{ debugName: "rowActions" }] : []));
    /** Accepts files dragged onto the list. Accepts a bare attribute. */
    dropEnabled = input(false, ...(ngDevMode ? [{ debugName: "dropEnabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** What the list says while files are dragged over it, already translated. */
    dropLabel = input('', ...(ngDevMode ? [{ debugName: "dropLabel" }] : []));
    /** The order asked for, or `null` when the user cleared it. The host fetches it. */
    sortChange = output();
    /** The page index asked for. The host fetches it. */
    pageChange = output();
    /** A row was opened: clicked, or Enter on it. */
    open = output();
    /** An entry of a row's menu was chosen. */
    rowAction = output();
    /** Files were dropped on the list. Only while `dropEnabled`. */
    filesDropped = output();
    /** Retry was pressed on a server error. */
    retry = output();
    tagId = NXS_PRIMITIVE_IDS.tag;
    avatarId = NXS_PRIMITIVE_IDS.avatar;
    hintId = `nxs-document-list-hint-${nextId++}`;
    selectColumn = SELECT_COLUMN;
    actionsColumn = ACTIONS_COLUMN;
    drop = new NxsFileDropTracker(() => this.dropEnabled());
    host = inject(ElementRef);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    direction = inject(Directionality, { optional: true });
    translations = toSignal(merge(this.translate.onLangChange, this.translate.onTranslationChange), { initialValue: null });
    /**
     * Each row's accessible name, for the row, its checkbox and its menu: its title, and, where
     * another document on the page has the same title, its place among them — so no two rows on a
     * page share a name. Titles that differ only in case or surrounding space read the same aloud,
     * so they count as the same.
     */
    accessibleNames = computed(() => {
        this.translations();
        const documents = this.documents();
        const same = (doc) => this.rowName(doc).toLocaleLowerCase();
        const counts = new Map();
        for (const doc of documents)
            counts.set(same(doc), (counts.get(same(doc)) ?? 0) + 1);
        const seen = new Map();
        const names = new Map();
        for (const doc of documents) {
            const name = this.rowName(doc);
            const count = counts.get(same(doc)) ?? 1;
            if (count === 1) {
                names.set(doc.uid, name);
                continue;
            }
            const index = (seen.get(same(doc)) ?? 0) + 1;
            seen.set(same(doc), index);
            names.set(doc.uid, this.translate.instant('satori-components.document-list.row-name-repeated', {
                name,
                index,
                count,
            }));
        }
        return names;
    }, ...(ngDevMode ? [{ debugName: "accessibleNames" }] : []));
    /** The row in the Tab sequence. */
    activeIndex = signal(0, ...(ngDevMode ? [{ debugName: "activeIndex" }] : []));
    /** Where a Shift selection extends from, and what was selected before it began. */
    anchor = 0;
    rangeBase = new Set();
    /** Whether Shift was held for the checkbox change that follows. */
    shiftHeld = false;
    selected = computed(() => new Set(this.selectedIds()), ...(ngDevMode ? [{ debugName: "selected" }] : []));
    sortableColumns = computed(() => this.columns().filter((c) => c.sortable), ...(ngDevMode ? [{ debugName: "sortableColumns" }] : []));
    plainColumns = computed(() => this.columns().filter((c) => !c.sortable), ...(ngDevMode ? [{ debugName: "plainColumns" }] : []));
    hasRowActions = computed(() => this.documents().some((doc) => this.actionsFor(doc).length > 0), ...(ngDevMode ? [{ debugName: "hasRowActions" }] : []));
    displayedColumns = computed(() => [
        ...(this.selectable() ? [SELECT_COLUMN] : []),
        ...this.columns().map((column) => column.key),
        ...(this.hasRowActions() ? [ACTIONS_COLUMN] : []),
    ], ...(ngDevMode ? [{ debugName: "displayedColumns" }] : []));
    pageIds = computed(() => this.documents().map((doc) => doc.uid), ...(ngDevMode ? [{ debugName: "pageIds" }] : []));
    allOnPageSelected = computed(() => {
        const ids = this.pageIds();
        const selected = this.selected();
        return ids.length > 0 && ids.every((id) => selected.has(id));
    }, ...(ngDevMode ? [{ debugName: "allOnPageSelected" }] : []));
    someOnPageSelected = computed(() => !this.allOnPageSelected() && this.pageIds().some((id) => this.selected().has(id)), ...(ngDevMode ? [{ debugName: "someOnPageSelected" }] : []));
    /** The header row counts as one. Unknown is `-1`, which ARIA reads as "not known". */
    rowCount = computed(() => {
        const total = this.totalSize();
        return total >= 0 ? total + 1 : -1;
    }, ...(ngDevMode ? [{ debugName: "rowCount" }] : []));
    matSortActive = computed(() => this.sort()?.key ?? '', ...(ngDevMode ? [{ debugName: "matSortActive" }] : []));
    matSortDirection = computed(() => this.sort()?.direction ?? '', ...(ngDevMode ? [{ debugName: "matSortDirection" }] : []));
    constructor() {
        // A new page starts at its first row, so the Tab stop is never left past the end of a shorter
        // one, and a Shift selection never extends from a row of the previous page.
        effect(() => {
            this.documents();
            untracked(() => {
                this.activeIndex.set(0);
                this.anchor = 0;
                this.rangeBase = new Set(this.selectedIds());
            });
        });
        // Every control inside a row leaves the Tab sequence, including the ones a resolved component
        // or a menu renders, so a page of fifty rows is one Tab stop, not a hundred and fifty. After
        // every render, because a component resolved by ID can arrive in a later one than its row.
        afterEveryRender({
            write: () => {
                for (const control of this.host.nativeElement.querySelectorAll(ROW_CONTROLS)) {
                    if (control.getAttribute('tabindex') !== '-1')
                        control.setAttribute('tabindex', '-1');
                }
            },
        });
    }
    actionsFor(doc) {
        const actions = this.rowActions();
        return actions[doc.uid] ?? [];
    }
    isSelected(doc) {
        return this.selected().has(doc.uid);
    }
    isFolder(doc) {
        return doc.type === 'Favorites' || isFolderishDocument(doc);
    }
    /** A container's rendition is only Nuxeo's generic icon, so it is not fetched; the type icon shows. */
    hasThumbnail(doc) {
        const type = doc.type?.trim().toLowerCase() ?? '';
        return type.length > 0 && !NON_CONTENT_DOCUMENT_TYPES.has(type);
    }
    icon(doc) {
        return docTypeIcon(doc.type);
    }
    rowName(doc) {
        return nxsVisibleText(doc.title) || doc.path || doc.uid;
    }
    accessibleName(doc) {
        return this.accessibleNames().get(doc.uid) ?? this.rowName(doc);
    }
    rowIndex(index) {
        return this.pageIndex() * this.pageSize() + index + 2;
    }
    contributor(doc) {
        return text(doc.properties?.['dc:lastContributor']);
    }
    /** Never empty: an empty string crashes Satori's avatar inside change detection. */
    initials(name) {
        return nxsVisibleText(name) || '?';
    }
    avatarColor(name) {
        return avatarColor(name);
    }
    /** The text of a column that is neither the title, the type, a date nor a person. */
    cellText(doc, key) {
        const properties = doc.properties ?? {};
        switch (key) {
            case 'author':
                return text(properties['dc:creator']);
            case 'state':
            case 'nature':
                return text(properties['dc:nature']);
            case 'coverage':
                return text(properties['dc:coverage']);
            case 'subjects':
                return text(properties['dc:subjects']);
            case 'version': {
                const major = properties['uid:major_version'];
                return major === undefined || major === null
                    ? ''
                    : `${major}.${properties['uid:minor_version'] ?? 0}`;
            }
            default:
                return key.includes(':') ? text(properties[key]) : '';
        }
    }
    createdDate(doc) {
        const value = doc.properties?.['dc:created'];
        return typeof value === 'string' && value ? value : null;
    }
    onSortChange(sort) {
        const next = sort.direction === 'asc' || sort.direction === 'desc'
            ? { key: sort.active, direction: sort.direction }
            : null;
        this.sortChange.emit(next);
        const column = this.columns().find((candidate) => candidate.key === sort.active)?.label ?? '';
        const key = !next
            ? 'satori-components.document-list.sort-cleared'
            : next.direction === 'asc'
                ? 'satori-components.document-list.sorted-ascending'
                : 'satori-components.document-list.sorted-descending';
        void this.announcer.announce(this.translate.instant(key, { column }), 'polite');
    }
    onPageChange(index) {
        this.pageChange.emit(index);
    }
    onRowAction(action, document) {
        this.rowAction.emit({ action, document });
    }
    onDrop(event) {
        const files = this.drop.drop(event);
        if (files.length > 0)
            this.filesDropped.emit(files);
    }
    /** Records Shift for the checkbox change it precedes, from the pointer or the keyboard. */
    noteModifiers(event) {
        this.shiftHeld = event.shiftKey;
    }
    onCheckboxChange(change, index) {
        const shift = this.shiftHeld;
        this.shiftHeld = false;
        this.activeIndex.set(index);
        if (shift)
            this.selectRange(index);
        else
            this.toggleAt(index);
        // The checkbox flips itself; put it back to what the selection says, which a range may not be.
        change.source.checked = this.selected().has(this.pageIds()[index]);
    }
    onSelectPage(change) {
        if (this.allOnPageSelected())
            this.deselectPage();
        else
            this.selectPage();
        change.source.checked = this.allOnPageSelected();
    }
    onRowClick(event, doc, index) {
        this.activeIndex.set(index);
        if (isInsideControl(event.target, event.currentTarget))
            return;
        if (this.selectable() && event.shiftKey) {
            this.selectRange(index);
            return;
        }
        if (this.selectable() && (event.ctrlKey || event.metaKey)) {
            this.toggleAt(index);
            return;
        }
        this.open.emit(doc);
    }
    onOpenClick(event, doc, index) {
        event.stopPropagation();
        this.activeIndex.set(index);
        this.open.emit(doc);
    }
    onRowFocusIn(index) {
        this.activeIndex.set(index);
    }
    onRowKeydown(event, doc, index) {
        const row = event.currentTarget;
        const onRow = event.target === row;
        const last = this.documents().length - 1;
        const { forward, backward } = this.inlineKeys();
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                const next = clamp(index + (event.key === 'ArrowDown' ? 1 : -1), 0, last);
                this.moveTo(next, event.shiftKey);
                return;
            }
            case 'Home':
            case 'End': {
                if (!onRow)
                    return;
                event.preventDefault();
                this.moveTo(event.key === 'Home' ? 0 : last, event.shiftKey);
                return;
            }
            case ' ':
                if (!onRow || !this.selectable())
                    return;
                event.preventDefault();
                if (event.shiftKey)
                    this.selectRange(index);
                else
                    this.toggleAt(index);
                return;
            case 'Enter':
                if (!onRow)
                    return;
                event.preventDefault();
                this.open.emit(doc);
                return;
            case 'a':
            case 'A':
                if (!onRow || !this.selectable() || !(event.ctrlKey || event.metaKey))
                    return;
                event.preventDefault();
                this.selectPage();
                return;
            case 'Escape':
                if (onRow)
                    return;
                event.preventDefault();
                row.focus();
                return;
        }
        if (event.key === forward || event.key === backward) {
            const controls = Array.from(row.querySelectorAll(FOCUSABLE)).filter((control) => !control.hasAttribute('disabled'));
            if (controls.length === 0)
                return;
            event.preventDefault();
            const at = onRow
                ? -1
                : controls.findIndex((control) => control.contains(event.target));
            const target = event.key === forward ? at + 1 : at - 1;
            if (target < 0)
                row.focus();
            else
                controls[Math.min(target, controls.length - 1)].focus();
        }
    }
    inlineKeys() {
        return this.direction?.value === 'rtl'
            ? { forward: 'ArrowLeft', backward: 'ArrowRight' }
            : { forward: 'ArrowRight', backward: 'ArrowLeft' };
    }
    moveTo(index, extend) {
        if (index < 0)
            return;
        this.activeIndex.set(index);
        if (extend && this.selectable())
            this.selectRange(index);
        this.focusRow(index);
    }
    focusRow(index) {
        this.host.nativeElement
            .querySelector(`tr.nxs-document-list__row[data-row="${index}"]`)
            ?.focus();
    }
    toggleAt(index) {
        const id = this.pageIds()[index];
        if (id === undefined)
            return;
        const next = new Set(this.selected());
        if (next.has(id))
            next.delete(id);
        else
            next.add(id);
        this.anchor = index;
        this.rangeBase = next;
        this.commit(next);
    }
    /** Everything selected before the range began, plus every row from the anchor to `index`. */
    selectRange(index) {
        const ids = this.pageIds();
        const [from, to] = this.anchor <= index ? [this.anchor, index] : [index, this.anchor];
        const next = new Set(this.rangeBase);
        for (const id of ids.slice(from, to + 1))
            next.add(id);
        this.commit(next);
    }
    selectPage() {
        const next = new Set(this.selected());
        for (const id of this.pageIds())
            next.add(id);
        this.rangeBase = next;
        this.commit(next);
    }
    deselectPage() {
        const next = new Set(this.selected());
        for (const id of this.pageIds())
            next.delete(id);
        this.rangeBase = next;
        this.commit(next);
    }
    /** Keeps the order ids were selected in, so the host's own list does not reshuffle. */
    commit(next) {
        const current = this.selectedIds();
        const kept = current.filter((id) => next.has(id));
        const added = [...next].filter((id) => !current.includes(id));
        this.selectedIds.set([...kept, ...added]);
    }
    static ɵfac = function NxsDocumentListComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocumentListComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocumentListComponent, selectors: [["nxs-document-list"]], hostAttrs: [1, "nxs-document-list"], hostVars: 2, hostBindings: function NxsDocumentListComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("dragenter", function NxsDocumentListComponent_dragenter_HostBindingHandler($event) { return ctx.drop.enter($event); })("dragover", function NxsDocumentListComponent_dragover_HostBindingHandler($event) { return ctx.drop.overTarget($event); })("dragleave", function NxsDocumentListComponent_dragleave_HostBindingHandler($event) { return ctx.drop.leave($event); })("drop", function NxsDocumentListComponent_drop_HostBindingHandler($event) { return ctx.onDrop($event); });
        } if (rf & 2) {
            i0.ɵɵclassProp("nxs-document-list--drag-over", ctx.drop.over());
        } }, inputs: { documents: [1, "documents"], columns: [1, "columns"], label: [1, "label"], sort: [1, "sort"], selectedIds: [1, "selectedIds"], selectable: [1, "selectable"], pageIndex: [1, "pageIndex"], pageSize: [1, "pageSize"], totalSize: [1, "totalSize"], hasNextPage: [1, "hasNextPage"], loading: [1, "loading"], error: [1, "error"], errorHeading: [1, "errorHeading"], emptyHeading: [1, "emptyHeading"], emptyMessage: [1, "emptyMessage"], stateHeadingLevel: [1, "stateHeadingLevel"], rowActions: [1, "rowActions"], dropEnabled: [1, "dropEnabled"], dropLabel: [1, "dropLabel"] }, outputs: { selectedIds: "selectedIdsChange", sortChange: "sortChange", pageChange: "pageChange", open: "open", rowAction: "rowAction", filesDropped: "filesDropped", retry: "retry" }, decls: 8, vars: 3, consts: [["cell", ""], ["typeIcon", ""], ["tagOutlet", ""], ["avatarOutlet", ""], [1, "nxs-document-list__state"], ["retryable", "", 3, "status", "heading", "headingLevel"], [3, "pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage", "disabled"], ["aria-hidden", "true", 1, "nxs-document-list__drop"], ["diameter", "36", 3, "label"], ["retryable", "", 3, "retry", "status", "heading", "headingLevel"], ["icon", "folder_open", 3, "heading", "message", "headingLevel"], [1, "cdk-visually-hidden", 3, "id"], [1, "nxs-document-list__scroller"], ["mat-table", "", "matSort", "", 1, "nxs-document-list__table", 3, "matSortChange", "dataSource", "matSortActive", "matSortDirection"], [3, "matColumnDef"], ["mat-header-cell", "", "class", "nxs-document-list__select", 4, "matHeaderCellDef"], ["mat-cell", "", "class", "nxs-document-list__select", 4, "matCellDef"], ["mat-header-cell", "", "class", "nxs-document-list__actions", 4, "matHeaderCellDef"], ["mat-cell", "", "class", "nxs-document-list__actions", 4, "matCellDef"], ["mat-header-row", "", "aria-rowindex", "1", 4, "matHeaderRowDef"], ["mat-row", "", "class", "nxs-document-list__row", 3, "nxs-document-list__row--selected", "nxs-document-list__row--folder", "focusin", "click", "keydown", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", "", 1, "nxs-document-list__select"], [1, "cdk-visually-hidden"], [3, "change", "checked", "indeterminate", "aria-label"], ["mat-cell", "", 1, "nxs-document-list__select"], [3, "mousedown", "keydown", "change", "checked", "tabIndex", "aria-label"], ["mat-header-cell", "", "mat-sort-header", "", 3, "sortActionDescription", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["mat-header-cell", "", "mat-sort-header", "", 3, "sortActionDescription"], ["mat-cell", ""], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-header-cell", ""], ["mat-header-cell", "", 1, "nxs-document-list__actions"], ["mat-cell", "", 1, "nxs-document-list__actions"], [3, "actions", "label"], [3, "selected", "actions", "label"], ["mat-header-row", "", "aria-rowindex", "1"], ["mat-row", "", 1, "nxs-document-list__row", 3, "focusin", "click", "keydown"], [3, "pageChange", "pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage", "disabled"], [1, "nxs-document-list__drop-label"], [1, "nxs-document-list__title"], [1, "nxs-document-list__person"], [1, "nxs-document-list__thumb", 3, "documentId"], ["type", "button", "tabindex", "-1", 1, "nxs-document-list__open", 3, "click"], ["aria-hidden", "true", 1, "nxs-document-list__icon"], [4, "ngTemplateOutlet"], [3, "componentId", "componentInputs"], ["color", "blue", 3, "label"], ["size", "24", 3, "initials", "color"]], template: function NxsDocumentListComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsDocumentListComponent_Conditional_0_Template, 3, 3, "div", 4)(1, NxsDocumentListComponent_Conditional_1_Template, 1, 3, "nxs-error-state", 5)(2, NxsDocumentListComponent_Conditional_2_Template, 1, 1)(3, NxsDocumentListComponent_Conditional_3_Template, 17, 13);
            i0.ɵɵconditionalCreate(4, NxsDocumentListComponent_Conditional_4_Template, 1, 6, "nxs-pager", 6);
            i0.ɵɵconditionalCreate(5, NxsDocumentListComponent_Conditional_5_Template, 4, 3, "div", 7);
            i0.ɵɵtemplate(6, NxsDocumentListComponent_ng_template_6_Template, 6, 1, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵconditional(ctx.loading() ? 0 : (tmp_1_0 = ctx.error()) ? 1 : ctx.documents().length === 0 ? 2 : 3, tmp_1_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(!ctx.error() ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.drop.over() ? 5 : -1);
        } }, dependencies: [ExtensionOutletComponent,
            MatCheckboxModule, i1.MatCheckbox, MatIconModule, i2.MatIcon, MatSortModule, i3.MatSort, i3.MatSortHeader, MatTableModule, i4.MatTable, i4.MatHeaderCellDef, i4.MatHeaderRowDef, i4.MatColumnDef, i4.MatCellDef, i4.MatRowDef, i4.MatHeaderCell, i4.MatCell, i4.MatHeaderRow, i4.MatRow, NgTemplateOutlet,
            NxsActionMenuComponent,
            NxsAvatarComponent,
            NxsEmptyStateComponent,
            NxsErrorStateComponent,
            NxsPagerComponent,
            NxsSpinnerComponent,
            NxsTagComponent,
            NxsThumbnailComponent,
            DatePipe,
            DocTypeLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-document-list-folder-color: #ffa726;\n\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-document-list__state[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px 0;\n}\n\n.nxs-document-list__scroller[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-document-list__table[_ngcontent-%COMP%] {\n  width: 100%;\n\n  th.mat-mdc-header-cell {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n    font: var(--mat-sys-label-large);\n    color: var(--mat-sys-on-surface-variant);\n    background: var(--mat-sys-surface-container-low);\n    white-space: nowrap;\n  }\n\n  td.mat-mdc-cell {\n    font: var(--mat-sys-body-medium);\n  }\n}\n\n.nxs-document-list__select[_ngcontent-%COMP%] {\n  width: 48px;\n  padding-inline: 4px;\n}\n\n.nxs-document-list__actions[_ngcontent-%COMP%] {\n  width: 48px;\n  padding-inline: 0;\n  text-align: center;\n}\n\n.nxs-document-list__row[_ngcontent-%COMP%] {\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container);\n  }\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so each ring here is also drawn\n  // on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.nxs-document-list__row--selected,\n.nxs-document-list__row--selected:hover[_ngcontent-%COMP%] {\n  background: var(--mat-sys-primary-container);\n}\n\n.nxs-document-list__title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.nxs-document-list__thumb[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  flex-shrink: 0;\n  border-radius: 3px;\n  object-fit: cover;\n}\n\n.nxs-document-list__icon[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-document-list__icon--folder[_ngcontent-%COMP%] {\n  color: var(--nxs-document-list-folder-color);\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   row's[_ngcontent-%COMP%]   primary[_ngcontent-%COMP%]   action[_ngcontent-%COMP%], styled[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   row's[_ngcontent-%COMP%]   text.\n.nxs-document-list__open[_ngcontent-%COMP%] {\n  overflow: hidden;\n  padding: 0;\n  border: 0;\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: start;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-document-list__person[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.nxs-document-list__drop[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px dashed var(--mat-sys-primary);\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--mat-sys-primary-container) 85%, transparent);\n  pointer-events: none;\n}\n\n.nxs-document-list__drop-label[_ngcontent-%COMP%] {\n  font: var(--mat-sys-title-medium);\n  color: var(--mat-sys-on-primary-container);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocumentListComponent, [{
        type: Component,
        args: [{ selector: 'nxs-document-list', standalone: true, imports: [
                    DatePipe,
                    DocTypeLabelPipe,
                    ExtensionOutletComponent,
                    MatCheckboxModule,
                    MatIconModule,
                    MatSortModule,
                    MatTableModule,
                    NgTemplateOutlet,
                    NxsActionMenuComponent,
                    NxsAvatarComponent,
                    NxsEmptyStateComponent,
                    NxsErrorStateComponent,
                    NxsPagerComponent,
                    NxsSpinnerComponent,
                    NxsTagComponent,
                    NxsThumbnailComponent,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                    class: 'nxs-document-list',
                    '[class.nxs-document-list--drag-over]': 'drop.over()',
                    '(dragenter)': 'drop.enter($event)',
                    '(dragover)': 'drop.overTarget($event)',
                    '(dragleave)': 'drop.leave($event)',
                    '(drop)': 'onDrop($event)',
                }, template: "@if (loading()) {\n  <div class=\"nxs-document-list__state\">\n    <nxs-spinner diameter=\"36\" [label]=\"'satori-components.document-list.loading' | translate\" />\n  </div>\n} @else if (error(); as status) {\n  <nxs-error-state\n    [status]=\"status\"\n    [heading]=\"status === 500 ? errorHeading() : ''\"\n    [headingLevel]=\"stateHeadingLevel()\"\n    retryable\n    (retry)=\"retry.emit()\"\n  />\n} @else if (documents().length === 0) {\n  <!-- An empty page past the first is not an empty folder: the pager says there is nothing more. -->\n  @if (pageIndex() === 0) {\n    <nxs-empty-state\n      icon=\"folder_open\"\n      [heading]=\"emptyHeading().trim() || ('satori-components.document-list.empty' | translate)\"\n      [message]=\"emptyMessage()\"\n      [headingLevel]=\"stateHeadingLevel()\"\n    />\n  }\n} @else {\n  <span class=\"cdk-visually-hidden\" [id]=\"hintId\">{{\n    (selectable()\n      ? 'satori-components.document-list.keyboard-hint'\n      : 'satori-components.document-list.keyboard-hint-no-selection'\n    ) | translate\n  }}</span>\n  <div class=\"nxs-document-list__scroller\">\n    <table\n      mat-table\n      class=\"nxs-document-list__table\"\n      [dataSource]=\"documents()\"\n      matSort\n      [matSortActive]=\"matSortActive()\"\n      [matSortDirection]=\"matSortDirection()\"\n      (matSortChange)=\"onSortChange($event)\"\n      [attr.aria-label]=\"label()\"\n      [attr.aria-rowcount]=\"rowCount()\"\n    >\n      <ng-container [matColumnDef]=\"selectColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__select\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.selection' | translate\n          }}</span>\n          <mat-checkbox\n            [checked]=\"allOnPageSelected()\"\n            [indeterminate]=\"someOnPageSelected()\"\n            [aria-label]=\"'satori-components.document-list.select-page' | translate\"\n            (change)=\"onSelectPage($event)\"\n          />\n        </th>\n        <td mat-cell *matCellDef=\"let doc; let i = index\" class=\"nxs-document-list__select\">\n          <mat-checkbox\n            [checked]=\"isSelected(doc)\"\n            [tabIndex]=\"-1\"\n            [aria-label]=\"\n              'satori-components.document-list.select' | translate: { name: accessibleName(doc) }\n            \"\n            (mousedown)=\"noteModifiers($event)\"\n            (keydown)=\"noteModifiers($event)\"\n            (change)=\"onCheckboxChange($event, i)\"\n          />\n        </td>\n      </ng-container>\n\n      @for (column of sortableColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th\n            mat-header-cell\n            *matHeaderCellDef\n            mat-sort-header\n            [sortActionDescription]=\"\n              'satori-components.document-list.sort-by' | translate: { column: column.label }\n            \"\n          >\n            {{ column.label }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      @for (column of plainColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th mat-header-cell *matHeaderCellDef>{{ column.label }}</th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      <ng-container [matColumnDef]=\"actionsColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__actions\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.actions' | translate\n          }}</span>\n        </th>\n        <td mat-cell *matCellDef=\"let doc\" class=\"nxs-document-list__actions\">\n          @let entries = actionsFor(doc);\n          @if (entries.length > 0) {\n            <nxs-action-menu\n              [actions]=\"entries\"\n              [label]=\"\n                'satori-components.document-list.row-actions'\n                  | translate: { name: accessibleName(doc) }\n              \"\n              (selected)=\"onRowAction($event, doc)\"\n            />\n          }\n        </td>\n      </ng-container>\n\n      <tr mat-header-row *matHeaderRowDef=\"displayedColumns()\" aria-rowindex=\"1\"></tr>\n      <tr\n        mat-row\n        *matRowDef=\"let doc; columns: displayedColumns(); let i = index\"\n        class=\"nxs-document-list__row\"\n        [class.nxs-document-list__row--selected]=\"isSelected(doc)\"\n        [class.nxs-document-list__row--folder]=\"isFolder(doc)\"\n        [attr.data-row]=\"i\"\n        [attr.data-uid]=\"doc.uid\"\n        [attr.tabindex]=\"i === activeIndex() ? 0 : -1\"\n        [attr.aria-label]=\"accessibleName(doc)\"\n        [attr.aria-selected]=\"selectable() ? isSelected(doc) : null\"\n        [attr.aria-rowindex]=\"rowIndex(i)\"\n        [attr.aria-describedby]=\"hintId\"\n        (focusin)=\"onRowFocusIn(i)\"\n        (click)=\"onRowClick($event, doc, i)\"\n        (keydown)=\"onRowKeydown($event, doc, i)\"\n      ></tr>\n    </table>\n  </div>\n}\n\n@if (!error()) {\n  <nxs-pager\n    [pageIndex]=\"pageIndex()\"\n    [pageSize]=\"pageSize()\"\n    [itemCount]=\"documents().length\"\n    [totalSize]=\"totalSize()\"\n    [hasNextPage]=\"hasNextPage()\"\n    [disabled]=\"loading()\"\n    (pageChange)=\"onPageChange($event)\"\n  />\n}\n\n@if (drop.over()) {\n  <div class=\"nxs-document-list__drop\" aria-hidden=\"true\">\n    <span class=\"nxs-document-list__drop-label\">\n      {{ dropLabel().trim() || ('satori-components.document-list.drop' | translate) }}\n    </span>\n  </div>\n}\n\n<ng-template #cell let-doc let-key=\"key\" let-i=\"index\">\n  @switch (key) {\n    @case ('title') {\n      <span class=\"nxs-document-list__title\">\n        <ng-template #typeIcon>\n          <mat-icon\n            class=\"nxs-document-list__icon\"\n            [class.nxs-document-list__icon--folder]=\"isFolder(doc)\"\n            aria-hidden=\"true\"\n            >{{ icon(doc) }}</mat-icon\n          >\n        </ng-template>\n        @if (hasThumbnail(doc)) {\n          <nxs-thumbnail class=\"nxs-document-list__thumb\" [documentId]=\"doc.uid\">\n            <ng-container *ngTemplateOutlet=\"typeIcon\" />\n          </nxs-thumbnail>\n        } @else {\n          <ng-container *ngTemplateOutlet=\"typeIcon\" />\n        }\n        <button\n          type=\"button\"\n          class=\"nxs-document-list__open\"\n          tabindex=\"-1\"\n          [attr.title]=\"doc.path\"\n          (click)=\"onOpenClick($event, doc, i)\"\n        >\n          {{ rowName(doc) }}\n        </button>\n      </span>\n    }\n    @case ('type') {\n      @let typeLabel = doc.type | docTypeLabel;\n      <lib-extension-outlet\n        #tagOutlet\n        [componentId]=\"tagId\"\n        [componentInputs]=\"{ label: typeLabel, color: 'blue' }\"\n      />\n      @if (tagOutlet.unresolved()) {\n        <nxs-tag [label]=\"typeLabel\" color=\"blue\" />\n      }\n    }\n    @case ('modified') {\n      {{ doc.lastModified | date: 'mediumDate' }}\n    }\n    @case ('created') {\n      {{ createdDate(doc) | date: 'mediumDate' }}\n    }\n    @case ('lastContributor') {\n      @let person = contributor(doc);\n      <span class=\"nxs-document-list__person\">\n        <lib-extension-outlet\n          #avatarOutlet\n          [componentId]=\"avatarId\"\n          [componentInputs]=\"{ initials: initials(person), color: avatarColor(person), size: '24' }\"\n        />\n        @if (avatarOutlet.unresolved()) {\n          <nxs-avatar [initials]=\"initials(person)\" [color]=\"avatarColor(person)\" size=\"24\" />\n        }\n        <span>{{ person }}</span>\n      </span>\n    }\n    @default {\n      {{ cellText(doc, key) }}\n    }\n  }\n</ng-template>\n", styles: [":host {\n  --nxs-document-list-folder-color: #ffa726;\n\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-document-list__state {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px 0;\n}\n\n.nxs-document-list__scroller {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-document-list__table {\n  width: 100%;\n\n  th.mat-mdc-header-cell {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n    font: var(--mat-sys-label-large);\n    color: var(--mat-sys-on-surface-variant);\n    background: var(--mat-sys-surface-container-low);\n    white-space: nowrap;\n  }\n\n  td.mat-mdc-cell {\n    font: var(--mat-sys-body-medium);\n  }\n}\n\n.nxs-document-list__select {\n  width: 48px;\n  padding-inline: 4px;\n}\n\n.nxs-document-list__actions {\n  width: 48px;\n  padding-inline: 0;\n  text-align: center;\n}\n\n.nxs-document-list__row {\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container);\n  }\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only, so each ring here is also drawn\n  // on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.nxs-document-list__row--selected,\n.nxs-document-list__row--selected:hover {\n  background: var(--mat-sys-primary-container);\n}\n\n.nxs-document-list__title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.nxs-document-list__thumb {\n  width: 24px;\n  height: 24px;\n  flex-shrink: 0;\n  border-radius: 3px;\n  object-fit: cover;\n}\n\n.nxs-document-list__icon {\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n  flex-shrink: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-document-list__icon--folder {\n  color: var(--nxs-document-list-folder-color);\n}\n\n// A button for the row's primary action, styled as the row's text.\n.nxs-document-list__open {\n  overflow: hidden;\n  padding: 0;\n  border: 0;\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: start;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  cursor: pointer;\n\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 2px;\n  }\n}\n\n.nxs-document-list__person {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.nxs-document-list__drop {\n  position: absolute;\n  inset: 0;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px dashed var(--mat-sys-primary);\n  border-radius: 8px;\n  background: color-mix(in srgb, var(--mat-sys-primary-container) 85%, transparent);\n  pointer-events: none;\n}\n\n.nxs-document-list__drop-label {\n  font: var(--mat-sys-title-medium);\n  color: var(--mat-sys-on-primary-container);\n}\n"] }]
    }], () => [], { documents: [{ type: i0.Input, args: [{ isSignal: true, alias: "documents", required: true }] }], columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], sort: [{ type: i0.Input, args: [{ isSignal: true, alias: "sort", required: false }] }], selectedIds: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedIds", required: false }] }, { type: i0.Output, args: ["selectedIdsChange"] }], selectable: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectable", required: false }] }], pageIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageIndex", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], totalSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "totalSize", required: false }] }], hasNextPage: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasNextPage", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], errorHeading: [{ type: i0.Input, args: [{ isSignal: true, alias: "errorHeading", required: false }] }], emptyHeading: [{ type: i0.Input, args: [{ isSignal: true, alias: "emptyHeading", required: false }] }], emptyMessage: [{ type: i0.Input, args: [{ isSignal: true, alias: "emptyMessage", required: false }] }], stateHeadingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "stateHeadingLevel", required: false }] }], rowActions: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowActions", required: false }] }], dropEnabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "dropEnabled", required: false }] }], dropLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "dropLabel", required: false }] }], sortChange: [{ type: i0.Output, args: ["sortChange"] }], pageChange: [{ type: i0.Output, args: ["pageChange"] }], open: [{ type: i0.Output, args: ["open"] }], rowAction: [{ type: i0.Output, args: ["rowAction"] }], filesDropped: [{ type: i0.Output, args: ["filesDropped"] }], retry: [{ type: i0.Output, args: ["retry"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocumentListComponent, { className: "NxsDocumentListComponent", filePath: "libs/shared/satori-components/src/lib/document-list/document-list.component.ts", lineNumber: 139 }); })();
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/** A cell value as text: a list joined, anything not a string or a number left blank. */
function text(value) {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number')
        return String(value);
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === 'string' || typeof item === 'number').join(', ');
    }
    return '';
}
/** Whether a click landed on a control inside the row, which handles it itself. */
function isInsideControl(target, row) {
    if (!(target instanceof Element) || !(row instanceof Element))
        return false;
    const control = target.closest('a, button, input, label, mat-checkbox, [role="menuitem"]');
    return control !== null && row.contains(control);
}
