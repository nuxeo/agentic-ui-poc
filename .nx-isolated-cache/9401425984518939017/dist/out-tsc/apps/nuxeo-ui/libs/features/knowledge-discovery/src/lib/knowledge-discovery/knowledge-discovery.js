import { DatePipe, JsonPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { ContentLakeUploadComponent } from '../content-lake-upload/content-lake-upload';
import { KdCitationDialogComponent } from '../kd-citation-dialog/kd-citation-dialog';
import { KdClientService, KdDiscoveryError, buildIndexedReferences, parseAnswerSegments, } from '@agentic-ui/shared/kd-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/icon";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/progress-spinner";
import * as i7 from "@angular/material/tooltip";
const _c0 = a0 => ({ count: a0 });
const _c1 = a0 => ({ operation: a0 });
const _c2 = a0 => ({ status: a0 });
const _c3 = a0 => ({ number: a0 });
const _c4 = (a0, a1) => ({ product: a0, action: a1 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.modelName;
function KnowledgeDiscoveryComponent_Conditional_25_Conditional_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "kd.debug-http-status", i0.ɵɵpureFunction1(4, _c2, detail_r2.status)));
} }
function KnowledgeDiscoveryComponent_Conditional_25_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "details", 36)(1, "summary")(2, "mat-icon");
    i0.ɵɵtext(3, "bug_report");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵconditionalCreate(6, KnowledgeDiscoveryComponent_Conditional_25_Conditional_5_Conditional_6_Template, 3, 6, "span", 37);
    i0.ɵɵelementStart(7, "button", 38);
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_25_Conditional_5_Template_button_click_7_listener($event) { const detail_r2 = i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); ctx_r2.copyDebugInfo(detail_r2); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "content_copy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "pre", 39);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "json");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const detail_r2 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 4, "kd.debug-operation", i0.ɵɵpureFunction1(11, _c1, detail_r2.operation)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r2.status !== undefined ? 6 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "kd.knowledge-discovery.copy"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 9, detail_r2));
} }
function KnowledgeDiscoveryComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, KnowledgeDiscoveryComponent_Conditional_25_Conditional_5_Template, 15, 13, "details", 36);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.agentsError());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.debugMode() && ctx_r2.agentsErrorDetail()) ? 5 : -1, tmp_2_0);
} }
function KnowledgeDiscoveryComponent_Conditional_26_Conditional_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "kd.debug-http-status", i0.ɵɵpureFunction1(4, _c2, detail_r5.status)));
} }
function KnowledgeDiscoveryComponent_Conditional_26_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "details", 36)(1, "summary")(2, "mat-icon");
    i0.ɵɵtext(3, "bug_report");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵconditionalCreate(6, KnowledgeDiscoveryComponent_Conditional_26_Conditional_5_Conditional_6_Template, 3, 6, "span", 37);
    i0.ɵɵelementStart(7, "button", 38);
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_26_Conditional_5_Template_button_click_7_listener($event) { const detail_r5 = i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); ctx_r2.copyDebugInfo(detail_r5); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "content_copy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "pre", 39);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "json");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const detail_r5 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 4, "kd.debug-operation", i0.ɵɵpureFunction1(11, _c1, detail_r5.operation)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r5.status !== undefined ? 6 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "kd.knowledge-discovery.copy"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 9, detail_r5));
} }
function KnowledgeDiscoveryComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40)(1, "mat-icon");
    i0.ɵɵtext(2, "info_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, KnowledgeDiscoveryComponent_Conditional_26_Conditional_5_Template, 15, 13, "details", 36);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.referenceDataError());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.debugMode() && ctx_r2.referenceDataErrorDetail()) ? 5 : -1, tmp_2_0);
} }
function KnowledgeDiscoveryComponent_Conditional_27_Conditional_5_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const detail_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "kd.debug-http-status", i0.ɵɵpureFunction1(4, _c2, detail_r7.status)));
} }
function KnowledgeDiscoveryComponent_Conditional_27_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "details", 36)(1, "summary")(2, "mat-icon");
    i0.ɵɵtext(3, "bug_report");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵconditionalCreate(6, KnowledgeDiscoveryComponent_Conditional_27_Conditional_5_Conditional_6_Template, 3, 6, "span", 37);
    i0.ɵɵelementStart(7, "button", 38);
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_27_Conditional_5_Template_button_click_7_listener($event) { const detail_r7 = i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); ctx_r2.copyDebugInfo(detail_r7); return i0.ɵɵresetView($event.preventDefault()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "content_copy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "pre", 39);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "json");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const detail_r7 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 4, "kd.debug-operation", i0.ɵɵpureFunction1(11, _c1, detail_r7.operation)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detail_r7.status !== undefined ? 6 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "kd.knowledge-discovery.copy"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 9, detail_r7));
} }
function KnowledgeDiscoveryComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, KnowledgeDiscoveryComponent_Conditional_27_Conditional_5_Template, 15, 13, "details", 36);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.agentDetailsError());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.debugMode() && ctx_r2.agentDetailsErrorDetail()) ? 5 : -1, tmp_2_0);
} }
function KnowledgeDiscoveryComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵelement(1, "mat-spinner", 41);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "kd.knowledge-discovery.loading"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "kd.knowledge-discovery.waiting-for-answer"), " ");
} }
function KnowledgeDiscoveryComponent_Conditional_40_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 42)(1, "mat-icon");
    i0.ɵɵtext(2, "smart_toy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx.name, " ");
} }
function KnowledgeDiscoveryComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KnowledgeDiscoveryComponent_Conditional_40_Conditional_0_Template, 4, 1, "span", 42);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r2.selectedAgent()) ? 0 : -1, tmp_1_0);
} }
function KnowledgeDiscoveryComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.select-an-agent-on-the-right"), " ");
} }
function KnowledgeDiscoveryComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "details", 15)(1, "summary");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-form-field", 43)(5, "mat-label");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "textarea", 44);
    i0.ɵɵlistener("ngModelChange", function KnowledgeDiscoveryComponent_Conditional_48_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.dynamicFilterText.set($event)); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 4, "kd.knowledge-discovery.advanced-filter-json-optional"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 6, "kd.knowledge-discovery.dynamic-filter-json"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.dynamicFilterText())("disabled", ctx_r2.isAwaitingResponse());
} }
function KnowledgeDiscoveryComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.questionError());
} }
function KnowledgeDiscoveryComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "div", 45);
    i0.ɵɵelement(2, "mat-spinner", 46);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 47)(5, "p", 48);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 49);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 3, "kd.knowledge-discovery.loading"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, ctx_r2.loadingTitleKey()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, ctx_r2.loadingMessageKey()));
} }
function KnowledgeDiscoveryComponent_Conditional_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 50);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const currentAnswer_r9 = ctx;
    i0.ɵɵclassProp("kd-status-chip--submitted", currentAnswer_r9.status === i0.ɵɵpipeBind1(1, 9, "knowledge-discovery.submitted"))("kd-status-chip--complete", currentAnswer_r9.status === i0.ɵɵpipeBind1(2, 11, "knowledge-discovery.complete"))("kd-status-chip--error", currentAnswer_r9.status === i0.ɵɵpipeBind1(3, 13, "knowledge-discovery.error"))("kd-status-chip--blocked", currentAnswer_r9.status === i0.ɵɵpipeBind1(4, 15, "knowledge-discovery.blocked"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", currentAnswer_r9.status, " ");
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 51)(1, "div", 55);
    i0.ɵɵelement(2, "mat-spinner", 56);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "div")(5, "p", 57);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 58);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "div", 59);
    i0.ɵɵelement(12, "span", 60)(13, "span", 61)(14, "span", 62);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 3, "kd.knowledge-discovery.loading"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, ctx_r2.loadingTitleKey()));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 7, ctx_r2.loadingMessageKey()));
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const segment_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(segment_r11.text);
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 64);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const segment_r11 = i0.ɵɵnextContext().$implicit; const currentAnswer_r13 = i0.ɵɵnextContext(2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openCitationDialog(currentAnswer_r13, segment_r11.index)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const segment_r11 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 2, "shared.view-citation", i0.ɵɵpureFunction1(5, _c3, segment_r11.index)));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", segment_r11.index, " ");
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Conditional_0_Template, 2, 1, "span")(1, KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Conditional_1_Template, 3, 7, "button", 63);
} if (rf & 2) {
    const segment_r11 = ctx.$implicit;
    i0.ɵɵconditional(segment_r11.type === "text" ? 0 : 1);
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52);
    i0.ɵɵrepeaterCreate(1, KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_For_2_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const currentAnswer_r13 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.getAnswerSegments(currentAnswer_r13));
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.no-answer-text-yet"));
} }
function KnowledgeDiscoveryComponent_Conditional_72_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const currentAnswer_r13 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(currentAnswer_r13.error);
} }
function KnowledgeDiscoveryComponent_Conditional_72_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 23);
    i0.ɵɵconditionalCreate(1, KnowledgeDiscoveryComponent_Conditional_72_Conditional_1_Template, 15, 9, "div", 51)(2, KnowledgeDiscoveryComponent_Conditional_72_Conditional_2_Template, 3, 0, "div", 52)(3, KnowledgeDiscoveryComponent_Conditional_72_Conditional_3_Template, 3, 3, "p", 28);
    i0.ɵɵconditionalCreate(4, KnowledgeDiscoveryComponent_Conditional_72_Conditional_4_Template, 2, 1, "p", 16);
    i0.ɵɵelementStart(5, "div", 53)(6, "button", 54);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_72_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.submitFeedback("Good")); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "thumb_up");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 54);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_72_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.submitFeedback("Bad")); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "thumb_down");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "button", 54);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_72_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.submitFeedback("Retry")); });
    i0.ɵɵelementStart(20, "mat-icon");
    i0.ɵɵtext(21, "refresh");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const currentAnswer_r13 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isAwaitingResponse() && !currentAnswer_r13.answer ? 1 : currentAnswer_r13.answer ? 2 : 3);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(currentAnswer_r13.error ? 4 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.feedbackInFlight() !== null || currentAnswer_r13.status !== i0.ɵɵpipeBind1(7, 8, "knowledge-discovery.complete"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 10, "kd.knowledge-discovery.helpful"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.feedbackInFlight() !== null || currentAnswer_r13.status !== i0.ɵɵpipeBind1(13, 12, "knowledge-discovery.complete"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 14, "kd.knowledge-discovery.not-helpful"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.feedbackInFlight() !== null || currentAnswer_r13.status !== i0.ɵɵpipeBind1(19, 16, "knowledge-discovery.complete"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 18, "kd.knowledge-discovery.retry"), " ");
} }
function KnowledgeDiscoveryComponent_Conditional_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24)(1, "mat-icon");
    i0.ɵɵtext(2, "psychology");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "kd.knowledge-discovery.ask-a-question-to-see-the"));
} }
function KnowledgeDiscoveryComponent_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵelement(1, "mat-spinner", 56);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.loading"));
} }
function KnowledgeDiscoveryComponent_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(4, 5, "kd.knowledge-discovery.no-agents-create-in-admin", i0.ɵɵpureFunction2(8, _c4, i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.hyland-insight"), i0.ɵɵpipeBind1(3, 3, "kd.knowledge-discovery.refresh-agents"))), " ");
} }
function KnowledgeDiscoveryComponent_Conditional_86_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 65);
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_86_For_2_Template_button_click_1_listener() { const agent_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selectAgent(agent_r15.id)); });
    i0.ɵɵelementStart(2, "span", 66);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 67);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const agent_r15 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("active", ctx_r2.selectedAgentId() === agent_r15.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(agent_r15.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(agent_r15.modelName);
} }
function KnowledgeDiscoveryComponent_Conditional_86_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 29);
    i0.ɵɵrepeaterCreate(1, KnowledgeDiscoveryComponent_Conditional_86_For_2_Template, 6, 4, "li", null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.agents());
} }
function KnowledgeDiscoveryComponent_Conditional_87_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 68);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const agent_r16 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(agent_r16.description);
} }
function KnowledgeDiscoveryComponent_Conditional_87_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 71);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const agent_r16 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, agent_r16.sourceIds.length === 1 ? "common.count.source-one" : "common.count.source-many", i0.ɵɵpureFunction1(4, _c0, agent_r16.sourceIds.length)));
} }
function KnowledgeDiscoveryComponent_Conditional_87_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 30)(1, "div", 9)(2, "div")(3, "span", 10);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h3");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(8, KnowledgeDiscoveryComponent_Conditional_87_Conditional_8_Template, 2, 1, "p", 68);
    i0.ɵɵelementStart(9, "div", 69)(10, "span", 70);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span", 71);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(14, KnowledgeDiscoveryComponent_Conditional_87_Conditional_14_Template, 3, 6, "span", 71);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const agent_r16 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 6, "kd.knowledge-discovery.selected"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(agent_r16.name);
    i0.ɵɵadvance();
    i0.ɵɵconditional(agent_r16.description ? 8 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(agent_r16.modelName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(agent_r16.agentType || "standard");
    i0.ɵɵadvance();
    i0.ɵɵconditional(agent_r16.sourceIds.length > 0 ? 14 : -1);
} }
function KnowledgeDiscoveryComponent_Conditional_97_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 72);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Conditional_97_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadHistory(ctx_r2.selectedAgentId() ?? "")); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "kd.knowledge-discovery.reload-history"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "kd.knowledge-discovery.reload-history"));
} }
function KnowledgeDiscoveryComponent_Conditional_98_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵelement(1, "mat-spinner", 56);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.loading"));
} }
function KnowledgeDiscoveryComponent_Conditional_99_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.no-recent-questions"));
} }
function KnowledgeDiscoveryComponent_Conditional_100_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 73)(1, "p", 74);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 75);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r18 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r18.question);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", item_r18.status, " \u00B7 ", i0.ɵɵpipeBind2(5, 3, item_r18.dateCreated, "short"), " ");
} }
function KnowledgeDiscoveryComponent_Conditional_100_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 33);
    i0.ɵɵrepeaterCreate(1, KnowledgeDiscoveryComponent_Conditional_100_For_2_Template, 6, 6, "li", 73, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.history());
} }
function KnowledgeDiscoveryComponent_Conditional_110_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵelement(1, "mat-spinner", 56);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.loading"));
} }
function KnowledgeDiscoveryComponent_Conditional_111_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "kd.knowledge-discovery.no-models-loaded"));
} }
function KnowledgeDiscoveryComponent_Conditional_112_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 76)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 77);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const model_r19 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(model_r19.displayName || model_r19.modelName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(model_r19.status || i0.ɵɵpipeBind1(5, 2, "knowledge-discovery.unknown"));
} }
function KnowledgeDiscoveryComponent_Conditional_112_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 34);
    i0.ɵɵrepeaterCreate(1, KnowledgeDiscoveryComponent_Conditional_112_For_2_Template, 6, 4, "li", 76, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.models());
} }
/**
 * Consumer-facing Knowledge Discovery page.
 *
 * Agent management (create/edit/delete) deliberately lives outside of this
 * app: the Hyland Content Intelligence Connector exposes only read/invoke
 * operations (no CRUD) and the upstream Discovery API rejects agent create
 * requests over the connector's auth. Users manage agents in the Hyland
 * Insight admin UI; we just pick one, ask questions, and render the answer.
 */
export class KnowledgeDiscoveryComponent {
    kdClient = inject(KdClientService);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    route = inject(ActivatedRoute);
    dialog = inject(MatDialog);
    answerPollSub = null;
    insufficientAnswerText = "I don't have enough information to answer this question";
    /**
     * Inline-debug toggle. Enabled by `?debug=1` in the URL (`#/knowledge-
     * discovery?debug=1`). When on, the error banners reveal the captured
     * HTTP failure details (status, body) so a Cloud admin can triage
     * without DevTools — handy on hosted envs where the Console Logs panel
     * is empty (e.g. after a RESET NODES task).
     *
     * Sourced from `queryParamMap` (an observable) rather than `snapshot`
     * so toggling `?debug=1` in the address bar is honoured even when the
     * router reuses this component instance — which the default route reuse
     * strategy does whenever only query params change.
     */
    debugMode = toSignal(this.route.queryParamMap.pipe(map((qm) => qm.get('debug') === '1')), { requireSync: true });
    loadingAgents = signal(false, ...(ngDevMode ? [{ debugName: "loadingAgents" }] : []));
    agentsError = signal(null, ...(ngDevMode ? [{ debugName: "agentsError" }] : []));
    agentsErrorDetail = signal(null, ...(ngDevMode ? [{ debugName: "agentsErrorDetail" }] : []));
    agents = signal([], ...(ngDevMode ? [{ debugName: "agents" }] : []));
    selectedAgentId = signal(null, ...(ngDevMode ? [{ debugName: "selectedAgentId" }] : []));
    selectedAgent = signal(null, ...(ngDevMode ? [{ debugName: "selectedAgent" }] : []));
    loadingAgentDetails = signal(false, ...(ngDevMode ? [{ debugName: "loadingAgentDetails" }] : []));
    agentDetailsError = signal(null, ...(ngDevMode ? [{ debugName: "agentDetailsError" }] : []));
    agentDetailsErrorDetail = signal(null, ...(ngDevMode ? [{ debugName: "agentDetailsErrorDetail" }] : []));
    models = signal([], ...(ngDevMode ? [{ debugName: "models" }] : []));
    guardrailGroups = signal([], ...(ngDevMode ? [{ debugName: "guardrailGroups" }] : []));
    loadingReferenceData = signal(false, ...(ngDevMode ? [{ debugName: "loadingReferenceData" }] : []));
    referenceDataError = signal(null, ...(ngDevMode ? [{ debugName: "referenceDataError" }] : []));
    referenceDataErrorDetail = signal(null, ...(ngDevMode ? [{ debugName: "referenceDataErrorDetail" }] : []));
    questionText = signal('', ...(ngDevMode ? [{ debugName: "questionText" }] : []));
    dynamicFilterText = signal('', ...(ngDevMode ? [{ debugName: "dynamicFilterText" }] : []));
    questionError = signal(null, ...(ngDevMode ? [{ debugName: "questionError" }] : []));
    submittingQuestion = signal(false, ...(ngDevMode ? [{ debugName: "submittingQuestion" }] : []));
    activeQuestionId = signal(null, ...(ngDevMode ? [{ debugName: "activeQuestionId" }] : []));
    answer = signal(null, ...(ngDevMode ? [{ debugName: "answer" }] : []));
    pollingAnswer = signal(false, ...(ngDevMode ? [{ debugName: "pollingAnswer" }] : []));
    feedbackInFlight = signal(null, ...(ngDevMode ? [{ debugName: "feedbackInFlight" }] : []));
    history = signal([], ...(ngDevMode ? [{ debugName: "history" }] : []));
    loadingHistory = signal(false, ...(ngDevMode ? [{ debugName: "loadingHistory" }] : []));
    hasSelection = computed(() => this.selectedAgentId() !== null, ...(ngDevMode ? [{ debugName: "hasSelection" }] : []));
    isAwaitingResponse = computed(() => this.submittingQuestion() || this.pollingAnswer(), ...(ngDevMode ? [{ debugName: "isAwaitingResponse" }] : []));
    loadingTitleKey = computed(() => this.submittingQuestion()
        ? 'kd.knowledge-discovery.submitting-your-question'
        : 'kd.knowledge-discovery.generating-answer', ...(ngDevMode ? [{ debugName: "loadingTitleKey" }] : []));
    loadingMessageKey = computed(() => this.submittingQuestion()
        ? 'kd.knowledge-discovery.sending-the-request'
        : 'kd.knowledge-discovery.searching-the-selected-agent', ...(ngDevMode ? [{ debugName: "loadingMessageKey" }] : []));
    canClear = computed(() => this.questionText().trim().length > 0 && !this.isAwaitingResponse(), ...(ngDevMode ? [{ debugName: "canClear" }] : []));
    canAsk = computed(() => this.hasSelection() && this.canClear(), ...(ngDevMode ? [{ debugName: "canAsk" }] : []));
    clearQuestion() {
        this.questionText.set('');
    }
    /**
     * The Discovery API only accepts a `dynamicFilter` on agents that were
     * configured with a `dynamicFilterTemplate`. Sending one on an agent
     * without a template comes back as a hard 400 Bad Request. We therefore
     * only show the Advanced Filter field when the selected agent declares a
     * template.
     */
    agentSupportsDynamicFilter = computed(() => {
        const template = this.selectedAgent()?.dynamicFilterTemplate;
        return template !== null && template !== undefined;
    }, ...(ngDevMode ? [{ debugName: "agentSupportsDynamicFilter" }] : []));
    constructor() {
        this.loadReferenceData();
        this.loadAgents();
    }
    loadReferenceData() {
        this.loadingReferenceData.set(true);
        this.referenceDataError.set(null);
        this.referenceDataErrorDetail.set(null);
        forkJoin({
            models: this.kdClient.listModels(),
            guardrails: this.kdClient.listGuardrails(),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ models, guardrails }) => {
                this.models.set(models);
                this.guardrailGroups.set(guardrails.guardrailGroups);
                this.loadingReferenceData.set(false);
            },
            error: (err) => {
                this.referenceDataError.set(this.translate.instant('kd.message.failed-to-load-knowledge-discovery-models-and'));
                if (this.debugMode()) {
                    this.referenceDataErrorDetail.set(this.captureError('listModels + listGuardrails (forkJoin)', err));
                }
                this.loadingReferenceData.set(false);
            },
        });
    }
    loadAgents(selectAgentId) {
        this.loadingAgents.set(true);
        this.agentsError.set(null);
        this.agentsErrorDetail.set(null);
        this.kdClient
            .listAgents()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (agents) => {
                this.agents.set(agents);
                this.loadingAgents.set(false);
                const nextAgentId = selectAgentId ?? this.selectedAgentId() ?? agents[0]?.id ?? null;
                if (nextAgentId) {
                    this.selectAgent(nextAgentId);
                }
            },
            error: (err) => {
                this.agentsError.set(err?.error?.detail ??
                    this.translate.instant('kd.message.failed-to-load-knowledge-discovery-agents'));
                if (this.debugMode()) {
                    this.agentsErrorDetail.set(this.captureError('HylandKnowledgeDiscovery.getAllAgents', err));
                }
                this.loadingAgents.set(false);
            },
        });
    }
    selectAgent(agentId) {
        this.stopAnswerPolling();
        this.selectedAgentId.set(agentId);
        this.loadingAgentDetails.set(true);
        this.agentDetailsError.set(null);
        this.agentDetailsErrorDetail.set(null);
        this.kdClient
            .getAgent(agentId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (agent) => {
                this.selectedAgent.set(agent);
                this.loadingAgentDetails.set(false);
                this.loadHistory(agent.id);
            },
            error: (err) => {
                this.agentDetailsError.set(err?.error?.detail ?? this.translate.instant('kd.message.failed-to-load-agent-details'));
                if (this.debugMode()) {
                    this.agentDetailsErrorDetail.set(this.captureError(`HylandKnowledgeDiscovery.Invoke /agent/agents/${agentId}`, err));
                }
                this.loadingAgentDetails.set(false);
            },
        });
    }
    submitQuestion() {
        const agentId = this.selectedAgentId();
        const question = this.questionText().trim();
        if (!agentId || !question)
            return;
        let dynamicFilter = null;
        if (this.agentSupportsDynamicFilter()) {
            try {
                dynamicFilter = this.parseDynamicFilter(this.dynamicFilterText());
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : this.translate.instant('kd.message.dynamic-filter-invalid');
                this.questionError.set(message);
                return;
            }
        }
        this.submittingQuestion.set(true);
        this.questionError.set(null);
        this.answer.set(null);
        this.kdClient
            .submitQuestion({ agentId, question, dynamicFilter })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.activeQuestionId.set(result.questionId);
                const terminalStatuses = ['Complete', 'Error', 'Blocked'];
                if (terminalStatuses.includes(result.status)) {
                    this.kdClient
                        .getAnswer(result.questionId)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                        next: (answer) => {
                            this.submittingQuestion.set(false);
                            this.answer.set(answer);
                            if (this.selectedAgentId()) {
                                this.loadHistory(this.selectedAgentId() ?? '');
                            }
                        },
                        error: (err) => {
                            this.submittingQuestion.set(false);
                            this.questionError.set(this.resolveQuestionError(err, this.translate.instant('kd.message.failed-to-retrieve-the-knowledge-discovery-answer')));
                        },
                    });
                    return;
                }
                this.submittingQuestion.set(false);
                this.answer.set({
                    questionId: result.questionId,
                    agentId,
                    question,
                    status: result.status,
                    answer: '',
                    citations: [],
                });
                this.pollForAnswer(result.questionId);
            },
            error: (err) => {
                this.questionError.set(this.resolveQuestionError(err, this.translate.instant('kd.message.failed-to-submit-the-knowledge-discovery-question')));
                this.submittingQuestion.set(false);
            },
        });
    }
    /**
     * Format an error coming back from `KdClientService.submitQuestion`.
     * A 400 on a `dynamicFilter` payload is almost always the template
     * mismatch diagnosed in [docs/knowledge-discovery.md]; we surface that
     * as a targeted hint instead of the generic upstream message.
     */
    resolveQuestionError(err, fallback) {
        if (err instanceof KdDiscoveryError) {
            if (err.responseCode === 400) {
                if (this.dynamicFilterText().trim().length > 0) {
                    return this.translate.instant('kd.message.dynamic-filter-rejected');
                }
                const agent = this.selectedAgent();
                const model = this.models().find((entry) => entry.modelName === agent?.modelName);
                if (model && model.status && model.status !== 'Active') {
                    const params = {
                        model: agent?.modelName,
                        status: model.status,
                        replacement: model.replacementModelName,
                    };
                    return this.translate.instant(model.replacementModelName
                        ? 'kd.message.model-inactive-with-replacement'
                        : 'kd.message.model-inactive', params);
                }
            }
            return this.translate.instant(err.responseMessage ? 'kd.message.discovery-error' : 'kd.message.discovery-http-error', { code: err.responseCode, message: err.responseMessage });
        }
        const maybeDetail = err?.error
            ?.detail;
        const maybeMessage = err?.message;
        return maybeDetail ?? maybeMessage ?? fallback;
    }
    submitFeedback(feedback) {
        const questionId = this.activeQuestionId();
        if (!questionId)
            return;
        this.feedbackInFlight.set(feedback);
        this.kdClient
            .submitFeedback(questionId, { feedback })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.feedbackInFlight.set(null);
                this.answer.update((current) => (current ? { ...current, feedback } : current));
                if (this.selectedAgentId()) {
                    this.loadHistory(this.selectedAgentId() ?? '');
                }
            },
            error: () => {
                this.feedbackInFlight.set(null);
                this.questionError.set(this.translate.instant('kd.message.failed-to-submit-knowledge-discovery-feedback'));
            },
        });
    }
    loadHistory(agentId) {
        this.loadingHistory.set(true);
        this.kdClient
            .getQuestionHistory(agentId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (history) => {
                this.history.set(history.data);
                this.loadingHistory.set(false);
            },
            error: () => {
                this.loadingHistory.set(false);
                this.history.set([]);
            },
        });
    }
    pollForAnswer(questionId) {
        this.stopAnswerPolling();
        this.pollingAnswer.set(true);
        this.answerPollSub = timer(0, 1500)
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap(() => this.kdClient.getAnswer(questionId).pipe(catchError((err) => {
            this.questionError.set(err?.error?.detail ??
                this.translate.instant('kd.message.failed-to-retrieve-the-knowledge-discovery-answer'));
            this.pollingAnswer.set(false);
            return of(null);
        }))))
            .subscribe((answer) => {
            if (!answer)
                return;
            this.answer.set(answer);
            if (['Complete', 'Error', 'Blocked'].includes(answer.status)) {
                this.pollingAnswer.set(false);
                this.stopAnswerPolling();
                if (this.selectedAgentId()) {
                    this.loadHistory(this.selectedAgentId() ?? '');
                }
            }
        });
    }
    stopAnswerPolling() {
        this.answerPollSub?.unsubscribe();
        this.answerPollSub = null;
        this.pollingAnswer.set(false);
    }
    openContentLakeUploadDialog() {
        this.dialog.open(ContentLakeUploadComponent, {
            width: '520px',
            maxWidth: '95vw',
            autoFocus: 'dialog',
        });
    }
    getAnswerSegments(answer) {
        const formatted = this.formatAnswerText(answer.answer);
        const segments = parseAnswerSegments(formatted);
        if (segments.some((segment) => segment.type === 'citation')) {
            return segments;
        }
        const references = buildIndexedReferences(answer);
        if (references.length === 0) {
            return segments;
        }
        return [
            ...segments,
            { type: 'text', text: ' ' },
            ...references.flatMap((reference, position) => position === 0
                ? [{ type: 'citation', index: reference.index }]
                : [
                    { type: 'text', text: ' ' },
                    { type: 'citation', index: reference.index },
                ]),
        ];
    }
    openCitationDialog(answer, citationIndex) {
        this.dialog.open(KdCitationDialogComponent, {
            width: 'min(96vw, 1180px)',
            maxWidth: '96vw',
            maxHeight: '92vh',
            autoFocus: 'dialog',
            panelClass: 'kd-citation-dialog-panel',
            data: {
                answer,
                initialIndex: citationIndex,
            },
        });
    }
    formatAnswerText(answer) {
        const cleaned = answer.replace(/^#{1,6}\s*/gm, '').trim();
        if (!cleaned)
            return '';
        if (cleaned.toLowerCase() === this.insufficientAnswerText.toLowerCase()) {
            return this.translate.instant('kd.knowledge-discovery.insufficient-answer');
        }
        return cleaned;
    }
    /**
     * Normalise the disparate error shapes that flow through `KdClientService`
     * into a single inspectable record for the debug panel.
     *
     * Two shapes are common:
     *   1. `KdDiscoveryError` — thrown by the CIC envelope unwrap when the
     *      upstream Discovery API returned a non-2xx `responseCode` (the
     *      Nuxeo automation call itself succeeded). `responseCode` is the
     *      upstream HTTP status; `upstreamBody` is the upstream JSON.
     *   2. `HttpErrorResponse`-like — emitted by `HttpClient` when Nuxeo
     *      itself failed (401 session, 404 op-not-found, 502 egress). The
     *      shape varies but typically carries `status`, `statusText`, `url`,
     *      and `error` (parsed JSON if Content-Type allowed, otherwise the
     *      raw response text — often the Nuxeo login HTML for a 401).
     */
    captureError(operation, err) {
        const timestamp = new Date().toISOString();
        if (err instanceof KdDiscoveryError) {
            return {
                operation,
                status: err.responseCode,
                statusText: err.responseMessage,
                body: err.upstreamBody,
                message: err.message,
                timestamp,
            };
        }
        const httpLike = err;
        return {
            operation,
            url: httpLike?.url ?? undefined,
            status: httpLike?.status,
            statusText: httpLike?.statusText,
            body: httpLike?.error,
            message: httpLike?.message ?? String(err ?? 'Unknown error'),
            timestamp,
        };
    }
    /**
     * Copy a debug capture as pretty JSON to the clipboard. Intended for
     * pasting into a SUPNXP ticket or sharing with the satori-ui team. A
     * `console.error` fallback covers permissionless contexts (e.g. when the
     * Clipboard API is blocked by the iframe sandbox in some Nuxeo embeds).
     */
    copyDebugInfo(detail) {
        const payload = JSON.stringify(detail, null, 2);
        const clipboard = (typeof navigator !== 'undefined' ? navigator : undefined)?.clipboard;
        if (clipboard?.writeText) {
            clipboard.writeText(payload).catch(() => console.error('KD debug payload', payload));
            return;
        }
        console.error('KD debug payload', payload);
    }
    parseDynamicFilter(value) {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        let parsed;
        try {
            parsed = JSON.parse(trimmed);
        }
        catch {
            throw new Error(this.translate.instant('kd.message.dynamic-filter-not-json'));
        }
        if (parsed === null)
            return null;
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(this.translate.instant('kd.message.dynamic-filter-not-object'));
        }
        return parsed;
    }
    static ɵfac = function KnowledgeDiscoveryComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || KnowledgeDiscoveryComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: KnowledgeDiscoveryComponent, selectors: [["lib-knowledge-discovery"]], decls: 113, vars: 79, consts: [[1, "kd-page"], [1, "kd-topbar"], [1, "kd-topbar__title"], [1, "kd-eyebrow"], [1, "kd-topbar__actions"], ["mat-stroked-button", "", "type", "button", 3, "click"], [1, "kd-layout"], [1, "kd-main"], [1, "kd-card", "kd-composer"], [1, "kd-card__header"], [1, "kd-section-label"], [1, "kd-inline-status"], [1, "kd-helper"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "kd-block-field"], ["matInput", "", "rows", "3", 3, "ngModelChange", "ngModel", "disabled", "placeholder"], [1, "kd-advanced"], [1, "kd-error"], [1, "kd-progress-card"], [1, "kd-actions"], ["mat-stroked-button", "", "type", "button", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"], [1, "kd-card", "kd-answer"], [1, "kd-status-chip", 3, "kd-status-chip--submitted", "kd-status-chip--complete", "kd-status-chip--error", "kd-status-chip--blocked"], [1, "kd-answer__body"], [1, "kd-empty-state"], [1, "kd-side"], [1, "kd-card", "kd-agents"], [1, "kd-state"], [1, "kd-empty"], [1, "kd-agent-list"], [1, "kd-card", "kd-agent-summary"], [1, "kd-card"], ["mat-icon-button", "", 3, "matTooltip"], [1, "kd-history"], [1, "kd-reference"], [1, "kd-banner", "kd-banner--error"], ["open", "", 1, "kd-debug"], [1, "kd-debug__chip"], ["type", "button", "mat-stroked-button", "", 1, "kd-debug__copy", 3, "click"], [1, "kd-debug__body"], [1, "kd-banner", "kd-banner--muted"], ["diameter", "16"], [1, "kd-inline-status", "kd-inline-status--muted"], ["appearance", "outline", 1, "kd-block-field"], ["matInput", "", "rows", "3", "placeholder", "{\"property\":\"region\",\"operator\":\"equals\",\"value\":\"EMEA\"}", 3, "ngModelChange", "ngModel", "disabled"], [1, "kd-progress-card__icon"], ["diameter", "18"], [1, "kd-progress-card__content"], [1, "kd-progress-card__title"], [1, "kd-progress-card__message"], [1, "kd-status-chip"], [1, "kd-answer__loading"], [1, "kd-answer__text"], [1, "kd-feedback"], ["mat-stroked-button", "", 3, "click", "disabled"], [1, "kd-answer__loading-header"], ["diameter", "20"], [1, "kd-answer__loading-title"], [1, "kd-answer__loading-copy"], ["aria-hidden", "true", 1, "kd-answer__skeleton"], [1, "kd-answer__skeleton-line", "kd-answer__skeleton-line--wide"], [1, "kd-answer__skeleton-line"], [1, "kd-answer__skeleton-line", "kd-answer__skeleton-line--short"], ["type", "button", 1, "kd-citation-marker"], ["type", "button", 1, "kd-citation-marker", 3, "click"], ["type", "button", 1, "kd-agent-item", 3, "click"], [1, "kd-agent-item__name"], [1, "kd-agent-item__meta"], [1, "kd-muted"], [1, "kd-chip-row"], [1, "kd-chip"], [1, "kd-chip", "kd-chip--ghost"], ["mat-icon-button", "", 3, "click", "matTooltip"], [1, "kd-history__item"], [1, "kd-history__question"], [1, "kd-history__meta"], [1, "kd-reference__item"], [1, "kd-reference__meta"]], template: function KnowledgeDiscoveryComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2)(3, "span", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h1");
            i0.ɵɵtext(7);
            i0.ɵɵpipe(8, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "div", 4)(10, "button", 5);
            i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Template_button_click_10_listener() { return ctx.openContentLakeUploadDialog(); });
            i0.ɵɵelementStart(11, "mat-icon");
            i0.ɵɵtext(12, "cloud_upload");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "button", 5);
            i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Template_button_click_15_listener() { return ctx.loadReferenceData(); });
            i0.ɵɵelementStart(16, "mat-icon");
            i0.ɵɵtext(17, "sync");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "button", 5);
            i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Template_button_click_20_listener() { return ctx.loadAgents(); });
            i0.ɵɵelementStart(21, "mat-icon");
            i0.ɵɵtext(22, "refresh");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(23);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(25, KnowledgeDiscoveryComponent_Conditional_25_Template, 6, 2);
            i0.ɵɵconditionalCreate(26, KnowledgeDiscoveryComponent_Conditional_26_Template, 6, 2);
            i0.ɵɵconditionalCreate(27, KnowledgeDiscoveryComponent_Conditional_27_Template, 6, 2);
            i0.ɵɵelementStart(28, "div", 6)(29, "main", 7)(30, "section", 8)(31, "div", 9)(32, "div")(33, "span", 10);
            i0.ɵɵtext(34);
            i0.ɵɵpipe(35, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "h2");
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(39, KnowledgeDiscoveryComponent_Conditional_39_Template, 5, 6, "span", 11)(40, KnowledgeDiscoveryComponent_Conditional_40_Template, 1, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(41, KnowledgeDiscoveryComponent_Conditional_41_Template, 3, 3, "p", 12);
            i0.ɵɵelementStart(42, "mat-form-field", 13)(43, "mat-label");
            i0.ɵɵtext(44);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "textarea", 14);
            i0.ɵɵpipe(47, "translate");
            i0.ɵɵlistener("ngModelChange", function KnowledgeDiscoveryComponent_Template_textarea_ngModelChange_46_listener($event) { return ctx.questionText.set($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(48, KnowledgeDiscoveryComponent_Conditional_48_Template, 9, 8, "details", 15);
            i0.ɵɵconditionalCreate(49, KnowledgeDiscoveryComponent_Conditional_49_Template, 2, 1, "p", 16);
            i0.ɵɵconditionalCreate(50, KnowledgeDiscoveryComponent_Conditional_50_Template, 11, 9, "div", 17);
            i0.ɵɵelementStart(51, "div", 18)(52, "button", 19);
            i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Template_button_click_52_listener() { return ctx.clearQuestion(); });
            i0.ɵɵelementStart(53, "mat-icon");
            i0.ɵɵtext(54, "close");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(55);
            i0.ɵɵpipe(56, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "button", 20);
            i0.ɵɵlistener("click", function KnowledgeDiscoveryComponent_Template_button_click_57_listener() { return ctx.submitQuestion(); });
            i0.ɵɵelementStart(58, "mat-icon");
            i0.ɵɵtext(59, "send");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(60);
            i0.ɵɵpipe(61, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(62, "section", 21)(63, "div", 9)(64, "div")(65, "span", 10);
            i0.ɵɵtext(66);
            i0.ɵɵpipe(67, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(68, "h2");
            i0.ɵɵtext(69);
            i0.ɵɵpipe(70, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(71, KnowledgeDiscoveryComponent_Conditional_71_Template, 6, 17, "span", 22);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(72, KnowledgeDiscoveryComponent_Conditional_72_Template, 24, 20, "div", 23)(73, KnowledgeDiscoveryComponent_Conditional_73_Template, 6, 3, "div", 24);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(74, "aside", 25)(75, "section", 26)(76, "div", 9)(77, "div")(78, "span", 10);
            i0.ɵɵtext(79);
            i0.ɵɵpipe(80, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(81, "h3");
            i0.ɵɵtext(82);
            i0.ɵɵpipe(83, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(84, KnowledgeDiscoveryComponent_Conditional_84_Template, 3, 3, "div", 27)(85, KnowledgeDiscoveryComponent_Conditional_85_Template, 5, 11, "p", 28)(86, KnowledgeDiscoveryComponent_Conditional_86_Template, 3, 0, "ul", 29);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(87, KnowledgeDiscoveryComponent_Conditional_87_Template, 15, 8, "section", 30);
            i0.ɵɵelementStart(88, "section", 31)(89, "div", 9)(90, "div")(91, "span", 10);
            i0.ɵɵtext(92);
            i0.ɵɵpipe(93, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "h3");
            i0.ɵɵtext(95);
            i0.ɵɵpipe(96, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(97, KnowledgeDiscoveryComponent_Conditional_97_Template, 5, 6, "button", 32);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(98, KnowledgeDiscoveryComponent_Conditional_98_Template, 3, 3, "div", 27)(99, KnowledgeDiscoveryComponent_Conditional_99_Template, 3, 3, "p", 28)(100, KnowledgeDiscoveryComponent_Conditional_100_Template, 3, 0, "ul", 33);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(101, "section", 31)(102, "div", 9)(103, "div")(104, "span", 10);
            i0.ɵɵtext(105);
            i0.ɵɵpipe(106, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(107, "h3");
            i0.ɵɵtext(108);
            i0.ɵɵpipe(109, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(110, KnowledgeDiscoveryComponent_Conditional_110_Template, 3, 3, "div", 27)(111, KnowledgeDiscoveryComponent_Conditional_111_Template, 3, 3, "p", 28)(112, KnowledgeDiscoveryComponent_Conditional_112_Template, 3, 0, "ul", 34);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_25_0;
            let tmp_26_0;
            let tmp_30_0;
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 38, "kd.knowledge-discovery.knowledge-discovery"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 40, "kd.knowledge-discovery.ask-grounded-questions-with-citations"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 42, "kd.knowledge-discovery.upload-to-content-lake"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 44, "kd.knowledge-discovery.refresh-metadata"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(24, 46, "kd.knowledge-discovery.refresh-agents"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.agentsError() ? 25 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.referenceDataError() ? 26 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.agentDetailsError() ? 27 : -1);
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 48, "kd.knowledge-discovery.ask"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(38, 50, "kd.knowledge-discovery.what-would-you-like-to-know"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.isAwaitingResponse() ? 39 : 40);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.hasSelection() ? 41 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(45, 52, "kd.knowledge-discovery.your-question"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.questionText())("disabled", ctx.isAwaitingResponse())("placeholder", i0.ɵɵpipeBind1(47, 54, "kd.knowledge-discovery.question-example"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.agentSupportsDynamicFilter() ? 48 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.questionError() ? 49 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isAwaitingResponse() ? 50 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canClear());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(56, 56, "kd.knowledge-discovery.clear"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.canAsk());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(61, 58, "kd.knowledge-discovery.ask"), " ");
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(67, 60, "kd.knowledge-discovery.response"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(70, 62, "kd.knowledge-discovery.answer"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_25_0 = ctx.answer()) ? 71 : -1, tmp_25_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_26_0 = ctx.answer()) ? 72 : 73, tmp_26_0);
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(80, 64, "kd.knowledge-discovery.agents"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(83, 66, "common.available-count", i0.ɵɵpureFunction1(77, _c0, ctx.agents().length)));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loadingAgents() ? 84 : ctx.agents().length === 0 ? 85 : 86);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_30_0 = ctx.selectedAgent()) ? 87 : -1, tmp_30_0);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(93, 69, "kd.knowledge-discovery.history"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(96, 71, "kd.knowledge-discovery.recent-questions"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.selectedAgentId() ? 97 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loadingHistory() ? 98 : ctx.history().length === 0 ? 99 : 100);
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(106, 73, "kd.knowledge-discovery.models"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(109, 75, "kd.knowledge-discovery.reference-data"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loadingReferenceData() ? 110 : ctx.models().length === 0 ? 111 : 112);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, i2.MatIconButton, MatFormFieldModule, i3.MatFormField, i3.MatLabel, MatIconModule, i4.MatIcon, MatInputModule, i5.MatInput, MatProgressSpinnerModule, i6.MatProgressSpinner, MatTooltipModule, i7.MatTooltip, TranslatePipe,
            DatePipe,
            JsonPipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px 20px;\n  box-sizing: border-box;\n  background: var(--mat-sys-surface-container-low, #f5f6f8);\n  min-height: 100%;\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   top[_ngcontent-%COMP%]   bar[_ngcontent-%COMP%]   ----------\n\n.kd-topbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  flex-wrap: wrap;\n  padding: 4px 2px;\n}\n\n.kd-topbar__title[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n\n  h1 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n}\n\n.kd-topbar__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   shared[_ngcontent-%COMP%]   bits[_ngcontent-%COMP%]   ----------\n\n.kd-eyebrow[_ngcontent-%COMP%], \n.kd-section-label[_ngcontent-%COMP%] {\n  display: inline-block;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  font-size: 10.5px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  line-height: 1.2;\n}\n\n.kd-muted[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 12.5px;\n  line-height: 1.5;\n}\n\n.kd-helper[_ngcontent-%COMP%] {\n  margin: -4px 0 8px;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-empty[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 12.5px;\n}\n\n.kd-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #c62828);\n  font-size: 12.5px;\n  margin: 0;\n}\n\n.kd-state[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 8px 0;\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   cards[_ngcontent-%COMP%]   ----------\n\n.kd-card[_ngcontent-%COMP%] {\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 10px;\n  background: var(--mat-sys-surface, #fff);\n  padding: 14px 16px;\n  box-shadow: none;\n}\n\n.kd-card__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 10px;\n  margin-bottom: 10px;\n\n  h2 {\n    margin: 2px 0 0;\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n\n  h3 {\n    margin: 2px 0 0;\n    font-size: 13px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   ----------\n\n.kd-layout[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 340px);\n  gap: 12px;\n}\n\n.kd-main[_ngcontent-%COMP%], \n.kd-side[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   composer[_ngcontent-%COMP%]   ----------\n\n.kd-block-field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.kd-advanced[_ngcontent-%COMP%] {\n  margin: -4px 0 6px;\n\n  summary {\n    cursor: pointer;\n    color: var(--mat-sys-primary, #5c6bc0);\n    font-size: 12.5px;\n    font-weight: 500;\n    padding: 4px 0;\n    list-style: none;\n    user-select: none;\n\n    &::-webkit-details-marker {\n      display: none;\n    }\n\n    &::before {\n      content: '\u25B8';\n      display: inline-block;\n      margin-right: 6px;\n      transition: transform 0.15s ease;\n    }\n  }\n\n  &[open] summary::before {\n    transform: rotate(90deg);\n  }\n}\n\n.kd-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 4px;\n}\n\n.kd-inline-status[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 4px 10px;\n  border-radius: 999px;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n  font-size: 11.5px;\n  font-weight: 600;\n\n  mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n    line-height: 14px;\n  }\n}\n\n.kd-inline-status--muted[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-high, #f1f2f6);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-progress-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #dbe4ff);\n  border-radius: 10px;\n  background: linear-gradient(\n    180deg,\n    var(--mat-sys-surface-container-lowest, #f8faff) 0%,\n    var(--mat-sys-primary-container, #eef3ff) 100%\n  );\n}\n\n.kd-progress-card__icon[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  flex: 0 0 28px;\n}\n\n.kd-progress-card__content[_ngcontent-%COMP%] {\n  min-width: 0;\n}\n\n.kd-progress-card__title[_ngcontent-%COMP%], \n.kd-progress-card__message[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.kd-progress-card__title[_ngcontent-%COMP%] {\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-primary, #1f3f8f);\n}\n\n.kd-progress-card__message[_ngcontent-%COMP%] {\n  margin-top: 2px;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #52607a);\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   answer[_ngcontent-%COMP%]   ----------\n\n.kd-answer__body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.kd-answer__text[_ngcontent-%COMP%] {\n  margin: 0;\n  white-space: pre-wrap;\n  line-height: 1.55;\n  font-size: 13.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-citation-marker[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 18px;\n  height: 18px;\n  margin: 0 2px;\n  padding: 0 5px;\n  border: 1px solid var(--mat-sys-outline-variant, #d5dae3);\n  border-radius: 4px;\n  background: var(--mat-sys-surface-container-high, #eceff4);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  vertical-align: super;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-primary-container, #d7e3ff);\n    border-color: var(--mat-sys-primary, #005cbb);\n    color: var(--mat-sys-primary, #005cbb);\n  }\n}\n\n.kd-answer__loading[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-low, #f8fafc);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-answer__loading-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n}\n\n.kd-answer__loading-title[_ngcontent-%COMP%], \n.kd-answer__loading-copy[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.kd-answer__loading-title[_ngcontent-%COMP%] {\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-answer__loading-copy[_ngcontent-%COMP%] {\n  margin-top: 2px;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-answer__skeleton[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.kd-answer__skeleton-line[_ngcontent-%COMP%] {\n  display: block;\n  height: 10px;\n  border-radius: 999px;\n  background: linear-gradient(\n    90deg,\n    var(--mat-sys-surface-container-high, #e8edf5) 25%,\n    var(--mat-sys-surface-container-lowest, #f5f7fb) 50%,\n    var(--mat-sys-surface-container-high, #e8edf5) 75%\n  );\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_kd-shimmer 1.4s ease-in-out infinite;\n}\n\n.kd-answer__skeleton-line--wide[_ngcontent-%COMP%] {\n  width: 92%;\n}\n\n.kd-answer__skeleton-line[_ngcontent-%COMP%]:not(.kd-answer__skeleton-line--wide):not(\n    .kd-answer__skeleton-line--short\n  ) {\n  width: 100%;\n}\n\n.kd-answer__skeleton-line--short[_ngcontent-%COMP%] {\n  width: 68%;\n}\n\n.kd-feedback[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-top: 4px;\n\n  button mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    line-height: 16px;\n    margin-right: 4px;\n  }\n}\n\n.kd-status-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 10px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n}\n\n.kd-status-chip--submitted[_ngcontent-%COMP%] {\n  background: var(--mat-sys-tertiary-container, #fff8e1);\n  color: var(--mat-sys-on-tertiary-container, #a56b00);\n}\n.kd-status-chip--complete[_ngcontent-%COMP%] {\n  background: var(--mat-sys-secondary-container, #e7f7ed);\n  color: var(--mat-sys-on-secondary-container, #1f7a46);\n}\n.kd-status-chip--error[_ngcontent-%COMP%] {\n  background: var(--mat-sys-error-container, #fdecea);\n  color: var(--mat-sys-error, #c62828);\n}\n.kd-status-chip--blocked[_ngcontent-%COMP%] {\n  background: var(--mat-sys-tertiary-container, #f3e8ff);\n  color: var(--mat-sys-tertiary, #7b1fa2);\n}\n\n.kd-empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  min-height: 140px;\n  border: 1px dashed var(--mat-sys-outline-variant, #d0d5dd);\n  border-radius: 10px;\n  background: var(--mat-sys-surface-container-lowest, #fbfbfd);\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n  font-size: 12.5px;\n\n  mat-icon {\n    width: 28px;\n    height: 28px;\n    font-size: 28px;\n    color: var(--mat-sys-on-surface-variant, #8b8fb0);\n  }\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   sidebar[_ngcontent-%COMP%]   ----------\n\n.kd-agent-list[_ngcontent-%COMP%], \n.kd-history[_ngcontent-%COMP%], \n.kd-reference[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.kd-agent-item[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: var(--mat-sys-surface, #fff);\n  transition:\n    border-color 0.15s ease,\n    background 0.15s ease;\n\n  &:hover {\n    border-color: var(--mat-sys-outline, #c7ccd6);\n    background: var(--mat-sys-surface-container-lowest, #fafbfd);\n  }\n\n  &.active {\n    border-color: var(--mat-sys-primary, #c7d2fe);\n    background: var(--mat-sys-primary-container, #f5f7ff);\n  }\n}\n\n.kd-agent-item__name[_ngcontent-%COMP%] {\n  display: block;\n  font-weight: 600;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-agent-item__meta[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 2px;\n  font-size: 11.5px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-helper--muted[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 10px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n\n  strong {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n    line-height: 14px;\n  }\n}\n\n.kd-chip-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 8px;\n}\n\n.kd-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n}\n\n.kd-chip--ghost[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-high, #f1f2f6);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-history__item[_ngcontent-%COMP%] {\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-history__question[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n}\n\n.kd-history__meta[_ngcontent-%COMP%] {\n  margin: 2px 0 0;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n}\n\n.kd-reference__item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 6px 10px;\n  background: var(--mat-sys-surface, #fff);\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-reference__meta[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-weight: 500;\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   banners[_ngcontent-%COMP%]   ----------\n\n.kd-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  background: var(--mat-sys-surface, #fff);\n  font-size: 12.5px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.kd-banner--error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #c62828);\n  background: var(--mat-sys-error-container, #fff5f5);\n  border-color: var(--mat-sys-error, #f5c2c2);\n}\n\n.kd-banner--muted[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-debug[_ngcontent-%COMP%] {\n  margin: -6px 0 0;\n  border: 1px dashed var(--mat-sys-outline, #c7ccd6);\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-lowest, #fbfbfd);\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n\n  summary {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding: 8px 12px;\n    cursor: pointer;\n    list-style: none;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    user-select: none;\n\n    &::-webkit-details-marker {\n      display: none;\n    }\n\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n      line-height: 16px;\n      color: var(--mat-sys-on-surface-variant, #6b7280);\n    }\n  }\n\n  &[open] summary {\n    border-bottom: 1px dashed var(--mat-sys-outline-variant, #e8eaef);\n  }\n}\n\n.kd-debug__chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 8px;\n  border-radius: 999px;\n  font-size: 10.5px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  background: var(--mat-sys-error-container, #fdecea);\n  color: var(--mat-sys-error, #c62828);\n}\n\n.kd-debug__copy[_ngcontent-%COMP%] {\n  margin-left: auto;\n}\n\n.kd-debug__body[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 10px 12px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  font-size: 11.5px;\n  line-height: 1.45;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: pre-wrap;\n  word-break: break-word;\n  overflow-x: auto;\n  max-height: 320px;\n}\n\n@keyframes _ngcontent-%COMP%_kd-shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n//   ----------   density   overrides   (shrink Material defaults to match app)   ----------\n\n[_nghost-%COMP%]     {\n  .mat-mdc-form-field {\n    font-size: 13px;\n  }\n\n  .mat-mdc-text-field-wrapper {\n    background: var(--mat-sys-surface, #fff);\n  }\n\n  .mat-mdc-button,\n  .mat-mdc-outlined-button,\n  .mat-mdc-unelevated-button,\n  .mat-mdc-raised-button {\n    font-size: 12.5px;\n    letter-spacing: 0;\n    min-height: 34px;\n    line-height: 32px;\n\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n      line-height: 16px;\n      margin-right: 4px;\n    }\n\n    .mat-mdc-progress-spinner {\n      margin-right: 6px;\n    }\n  }\n\n  .mat-mdc-icon-button {\n    width: 32px;\n    height: 32px;\n    padding: 4px;\n\n    mat-icon {\n      font-size: 18px;\n      width: 18px;\n      height: 18px;\n      line-height: 18px;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   ----------[_ngcontent-%COMP%]   responsive[_ngcontent-%COMP%]   ----------\n\n@media[_ngcontent-%COMP%]   (max-width[_ngcontent-%COMP%]: 1200px) {\n  .kd-layout {\n    grid-template-columns: 1fr;\n  }\n}\n\n@media (max-width: 720px) {\n  .kd-page[_ngcontent-%COMP%] {\n    padding: 12px;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(KnowledgeDiscoveryComponent, [{
        type: Component,
        args: [{ selector: 'lib-knowledge-discovery', standalone: true, imports: [
                    TranslatePipe,
                    DatePipe,
                    FormsModule,
                    JsonPipe,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                ], template: "<div class=\"kd-page\">\n  <header class=\"kd-topbar\">\n    <div class=\"kd-topbar__title\">\n      <span class=\"kd-eyebrow\">{{ 'kd.knowledge-discovery.knowledge-discovery' | translate }}</span>\n      <h1>{{ 'kd.knowledge-discovery.ask-grounded-questions-with-citations' | translate }}</h1>\n    </div>\n    <div class=\"kd-topbar__actions\">\n      <button mat-stroked-button type=\"button\" (click)=\"openContentLakeUploadDialog()\">\n        <mat-icon>cloud_upload</mat-icon>\n        {{ 'kd.knowledge-discovery.upload-to-content-lake' | translate }}\n      </button>\n      <button mat-stroked-button type=\"button\" (click)=\"loadReferenceData()\">\n        <mat-icon>sync</mat-icon>\n        {{ 'kd.knowledge-discovery.refresh-metadata' | translate }}\n      </button>\n      <button mat-stroked-button type=\"button\" (click)=\"loadAgents()\">\n        <mat-icon>refresh</mat-icon>\n        {{ 'kd.knowledge-discovery.refresh-agents' | translate }}\n      </button>\n    </div>\n  </header>\n\n  @if (agentsError()) {\n    <div class=\"kd-banner kd-banner--error\">\n      <mat-icon>error_outline</mat-icon>\n      <span>{{ agentsError() }}</span>\n    </div>\n    @if (debugMode() && agentsErrorDetail(); as detail) {\n      <details class=\"kd-debug\" open>\n        <summary>\n          <mat-icon>bug_report</mat-icon>\n          {{ 'kd.debug-operation' | translate: { operation: detail.operation } }}\n          @if (detail.status !== undefined) {\n            <span class=\"kd-debug__chip\">{{\n              'kd.debug-http-status' | translate: { status: detail.status }\n            }}</span>\n          }\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"kd-debug__copy\"\n            (click)=\"copyDebugInfo(detail); $event.preventDefault()\"\n          >\n            <mat-icon>content_copy</mat-icon>\n            {{ 'kd.knowledge-discovery.copy' | translate }}\n          </button>\n        </summary>\n        <pre class=\"kd-debug__body\">{{ detail | json }}</pre>\n      </details>\n    }\n  }\n  @if (referenceDataError()) {\n    <div class=\"kd-banner kd-banner--muted\">\n      <mat-icon>info_outline</mat-icon>\n      <span>{{ referenceDataError() }}</span>\n    </div>\n    @if (debugMode() && referenceDataErrorDetail(); as detail) {\n      <details class=\"kd-debug\" open>\n        <summary>\n          <mat-icon>bug_report</mat-icon>\n          {{ 'kd.debug-operation' | translate: { operation: detail.operation } }}\n          @if (detail.status !== undefined) {\n            <span class=\"kd-debug__chip\">{{\n              'kd.debug-http-status' | translate: { status: detail.status }\n            }}</span>\n          }\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"kd-debug__copy\"\n            (click)=\"copyDebugInfo(detail); $event.preventDefault()\"\n          >\n            <mat-icon>content_copy</mat-icon>\n            {{ 'kd.knowledge-discovery.copy' | translate }}\n          </button>\n        </summary>\n        <pre class=\"kd-debug__body\">{{ detail | json }}</pre>\n      </details>\n    }\n  }\n  @if (agentDetailsError()) {\n    <div class=\"kd-banner kd-banner--error\">\n      <mat-icon>error_outline</mat-icon>\n      <span>{{ agentDetailsError() }}</span>\n    </div>\n    @if (debugMode() && agentDetailsErrorDetail(); as detail) {\n      <details class=\"kd-debug\" open>\n        <summary>\n          <mat-icon>bug_report</mat-icon>\n          {{ 'kd.debug-operation' | translate: { operation: detail.operation } }}\n          @if (detail.status !== undefined) {\n            <span class=\"kd-debug__chip\">{{\n              'kd.debug-http-status' | translate: { status: detail.status }\n            }}</span>\n          }\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"kd-debug__copy\"\n            (click)=\"copyDebugInfo(detail); $event.preventDefault()\"\n          >\n            <mat-icon>content_copy</mat-icon>\n            {{ 'kd.knowledge-discovery.copy' | translate }}\n          </button>\n        </summary>\n        <pre class=\"kd-debug__body\">{{ detail | json }}</pre>\n      </details>\n    }\n  }\n\n  <div class=\"kd-layout\">\n    <main class=\"kd-main\">\n      <section class=\"kd-card kd-composer\">\n        <div class=\"kd-card__header\">\n          <div>\n            <span class=\"kd-section-label\">{{ 'kd.knowledge-discovery.ask' | translate }}</span>\n            <h2>{{ 'kd.knowledge-discovery.what-would-you-like-to-know' | translate }}</h2>\n          </div>\n\n          @if (isAwaitingResponse()) {\n            <span class=\"kd-inline-status\">\n              <mat-spinner\n                diameter=\"16\"\n                [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n              />\n              {{ 'kd.knowledge-discovery.waiting-for-answer' | translate }}\n            </span>\n          } @else {\n            @if (selectedAgent(); as agent) {\n              <span class=\"kd-inline-status kd-inline-status--muted\">\n                <mat-icon>smart_toy</mat-icon>\n                {{ agent.name }}\n              </span>\n            }\n          }\n        </div>\n\n        @if (!hasSelection()) {\n          <p class=\"kd-helper\">\n            {{ 'kd.knowledge-discovery.select-an-agent-on-the-right' | translate }}\n          </p>\n        }\n\n        <mat-form-field appearance=\"outline\" class=\"kd-block-field\" subscriptSizing=\"dynamic\">\n          <mat-label>{{ 'kd.knowledge-discovery.your-question' | translate }}</mat-label>\n          <textarea\n            matInput\n            rows=\"3\"\n            [ngModel]=\"questionText()\"\n            (ngModelChange)=\"questionText.set($event)\"\n            [disabled]=\"isAwaitingResponse()\"\n            [placeholder]=\"'kd.knowledge-discovery.question-example' | translate\"\n          ></textarea>\n        </mat-form-field>\n\n        @if (agentSupportsDynamicFilter()) {\n          <details class=\"kd-advanced\">\n            <summary>\n              {{ 'kd.knowledge-discovery.advanced-filter-json-optional' | translate }}\n            </summary>\n            <mat-form-field appearance=\"outline\" class=\"kd-block-field\">\n              <mat-label>{{ 'kd.knowledge-discovery.dynamic-filter-json' | translate }}</mat-label>\n              <textarea\n                matInput\n                rows=\"3\"\n                [ngModel]=\"dynamicFilterText()\"\n                (ngModelChange)=\"dynamicFilterText.set($event)\"\n                [disabled]=\"isAwaitingResponse()\"\n                placeholder='{\"property\":\"region\",\"operator\":\"equals\",\"value\":\"EMEA\"}'\n              ></textarea>\n            </mat-form-field>\n          </details>\n        }\n\n        @if (questionError()) {\n          <p class=\"kd-error\">{{ questionError() }}</p>\n        }\n\n        @if (isAwaitingResponse()) {\n          <div class=\"kd-progress-card\">\n            <div class=\"kd-progress-card__icon\">\n              <mat-spinner\n                diameter=\"18\"\n                [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n              />\n            </div>\n            <div class=\"kd-progress-card__content\">\n              <p class=\"kd-progress-card__title\">{{ loadingTitleKey() | translate }}</p>\n              <p class=\"kd-progress-card__message\">{{ loadingMessageKey() | translate }}</p>\n            </div>\n          </div>\n        }\n\n        <div class=\"kd-actions\">\n          <button\n            mat-stroked-button\n            type=\"button\"\n            [disabled]=\"!canClear()\"\n            (click)=\"clearQuestion()\"\n          >\n            <mat-icon>close</mat-icon>\n            {{ 'kd.knowledge-discovery.clear' | translate }}\n          </button>\n          <button\n            mat-flat-button\n            color=\"primary\"\n            [disabled]=\"!canAsk()\"\n            (click)=\"submitQuestion()\"\n            type=\"button\"\n          >\n            <mat-icon>send</mat-icon>\n            {{ 'kd.knowledge-discovery.ask' | translate }}\n          </button>\n        </div>\n      </section>\n\n      <section class=\"kd-card kd-answer\">\n        <div class=\"kd-card__header\">\n          <div>\n            <span class=\"kd-section-label\">{{\n              'kd.knowledge-discovery.response' | translate\n            }}</span>\n            <h2>{{ 'kd.knowledge-discovery.answer' | translate }}</h2>\n          </div>\n\n          @if (answer(); as currentAnswer) {\n            <span\n              class=\"kd-status-chip\"\n              [class.kd-status-chip--submitted]=\"\n                currentAnswer.status === ('knowledge-discovery.submitted' | translate)\n              \"\n              [class.kd-status-chip--complete]=\"\n                currentAnswer.status === ('knowledge-discovery.complete' | translate)\n              \"\n              [class.kd-status-chip--error]=\"\n                currentAnswer.status === ('knowledge-discovery.error' | translate)\n              \"\n              [class.kd-status-chip--blocked]=\"\n                currentAnswer.status === ('knowledge-discovery.blocked' | translate)\n              \"\n            >\n              {{ currentAnswer.status }}\n            </span>\n          }\n        </div>\n\n        @if (answer(); as currentAnswer) {\n          <div class=\"kd-answer__body\">\n            @if (isAwaitingResponse() && !currentAnswer.answer) {\n              <div class=\"kd-answer__loading\">\n                <div class=\"kd-answer__loading-header\">\n                  <mat-spinner\n                    diameter=\"20\"\n                    [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n                  />\n                  <div>\n                    <p class=\"kd-answer__loading-title\">{{ loadingTitleKey() | translate }}</p>\n                    <p class=\"kd-answer__loading-copy\">{{ loadingMessageKey() | translate }}</p>\n                  </div>\n                </div>\n                <div class=\"kd-answer__skeleton\" aria-hidden=\"true\">\n                  <span class=\"kd-answer__skeleton-line kd-answer__skeleton-line--wide\"></span>\n                  <span class=\"kd-answer__skeleton-line\"></span>\n                  <span class=\"kd-answer__skeleton-line kd-answer__skeleton-line--short\"></span>\n                </div>\n              </div>\n            } @else if (currentAnswer.answer) {\n              <div class=\"kd-answer__text\">\n                @for (segment of getAnswerSegments(currentAnswer); track $index) {\n                  @if (segment.type === 'text') {\n                    <span>{{ segment.text }}</span>\n                  } @else {\n                    <button\n                      type=\"button\"\n                      class=\"kd-citation-marker\"\n                      [attr.aria-label]=\"\n                        'shared.view-citation' | translate: { number: segment.index }\n                      \"\n                      (click)=\"openCitationDialog(currentAnswer, segment.index)\"\n                    >\n                      {{ segment.index }}\n                    </button>\n                  }\n                }\n              </div>\n            } @else {\n              <p class=\"kd-empty\">{{ 'kd.knowledge-discovery.no-answer-text-yet' | translate }}</p>\n            }\n\n            @if (currentAnswer.error) {\n              <p class=\"kd-error\">{{ currentAnswer.error }}</p>\n            }\n\n            <div class=\"kd-feedback\">\n              <button\n                mat-stroked-button\n                [disabled]=\"\n                  feedbackInFlight() !== null ||\n                  currentAnswer.status !== ('knowledge-discovery.complete' | translate)\n                \"\n                (click)=\"submitFeedback('Good')\"\n              >\n                <mat-icon>thumb_up</mat-icon>\n                {{ 'kd.knowledge-discovery.helpful' | translate }}\n              </button>\n              <button\n                mat-stroked-button\n                [disabled]=\"\n                  feedbackInFlight() !== null ||\n                  currentAnswer.status !== ('knowledge-discovery.complete' | translate)\n                \"\n                (click)=\"submitFeedback('Bad')\"\n              >\n                <mat-icon>thumb_down</mat-icon>\n                {{ 'kd.knowledge-discovery.not-helpful' | translate }}\n              </button>\n              <button\n                mat-stroked-button\n                [disabled]=\"\n                  feedbackInFlight() !== null ||\n                  currentAnswer.status !== ('knowledge-discovery.complete' | translate)\n                \"\n                (click)=\"submitFeedback('Retry')\"\n              >\n                <mat-icon>refresh</mat-icon>\n                {{ 'kd.knowledge-discovery.retry' | translate }}\n              </button>\n            </div>\n          </div>\n        } @else {\n          <div class=\"kd-empty-state\">\n            <mat-icon>psychology</mat-icon>\n            <p>{{ 'kd.knowledge-discovery.ask-a-question-to-see-the' | translate }}</p>\n          </div>\n        }\n      </section>\n    </main>\n\n    <aside class=\"kd-side\">\n      <section class=\"kd-card kd-agents\">\n        <div class=\"kd-card__header\">\n          <div>\n            <span class=\"kd-section-label\">{{ 'kd.knowledge-discovery.agents' | translate }}</span>\n            <h3>{{ 'common.available-count' | translate: { count: agents().length } }}</h3>\n          </div>\n        </div>\n\n        @if (loadingAgents()) {\n          <div class=\"kd-state\">\n            <mat-spinner\n              diameter=\"20\"\n              [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n            />\n          </div>\n        } @else if (agents().length === 0) {\n          <p class=\"kd-empty\">\n            {{\n              'kd.knowledge-discovery.no-agents-create-in-admin'\n                | translate\n                  : {\n                      product: 'kd.knowledge-discovery.hyland-insight' | translate,\n                      action: 'kd.knowledge-discovery.refresh-agents' | translate,\n                    }\n            }}\n          </p>\n        } @else {\n          <ul class=\"kd-agent-list\">\n            @for (agent of agents(); track agent.id) {\n              <li>\n                <button\n                  type=\"button\"\n                  class=\"kd-agent-item\"\n                  [class.active]=\"selectedAgentId() === agent.id\"\n                  (click)=\"selectAgent(agent.id)\"\n                >\n                  <span class=\"kd-agent-item__name\">{{ agent.name }}</span>\n                  <span class=\"kd-agent-item__meta\">{{ agent.modelName }}</span>\n                </button>\n              </li>\n            }\n          </ul>\n        }\n      </section>\n\n      @if (selectedAgent(); as agent) {\n        <section class=\"kd-card kd-agent-summary\">\n          <div class=\"kd-card__header\">\n            <div>\n              <span class=\"kd-section-label\">{{\n                'kd.knowledge-discovery.selected' | translate\n              }}</span>\n              <h3>{{ agent.name }}</h3>\n            </div>\n          </div>\n\n          @if (agent.description) {\n            <p class=\"kd-muted\">{{ agent.description }}</p>\n          }\n          <div class=\"kd-chip-row\">\n            <span class=\"kd-chip\">{{ agent.modelName }}</span>\n            <span class=\"kd-chip kd-chip--ghost\">{{ agent.agentType || 'standard' }}</span>\n            @if (agent.sourceIds.length > 0) {\n              <span class=\"kd-chip kd-chip--ghost\">{{\n                (agent.sourceIds.length === 1\n                  ? 'common.count.source-one'\n                  : 'common.count.source-many'\n                ) | translate: { count: agent.sourceIds.length }\n              }}</span>\n            }\n          </div>\n        </section>\n      }\n\n      <section class=\"kd-card\">\n        <div class=\"kd-card__header\">\n          <div>\n            <span class=\"kd-section-label\">{{ 'kd.knowledge-discovery.history' | translate }}</span>\n            <h3>{{ 'kd.knowledge-discovery.recent-questions' | translate }}</h3>\n          </div>\n          @if (selectedAgentId()) {\n            <button\n              mat-icon-button\n              [matTooltip]=\"'kd.knowledge-discovery.reload-history' | translate\"\n              (click)=\"loadHistory(selectedAgentId() ?? '')\"\n              [attr.aria-label]=\"'kd.knowledge-discovery.reload-history' | translate\"\n            >\n              <mat-icon>refresh</mat-icon>\n            </button>\n          }\n        </div>\n\n        @if (loadingHistory()) {\n          <div class=\"kd-state\">\n            <mat-spinner\n              diameter=\"20\"\n              [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n            />\n          </div>\n        } @else if (history().length === 0) {\n          <p class=\"kd-empty\">{{ 'kd.knowledge-discovery.no-recent-questions' | translate }}</p>\n        } @else {\n          <ul class=\"kd-history\">\n            @for (item of history(); track item.id) {\n              <li class=\"kd-history__item\">\n                <p class=\"kd-history__question\">{{ item.question }}</p>\n                <p class=\"kd-history__meta\">\n                  {{ item.status }} \u00B7 {{ item.dateCreated | date: 'short' }}\n                </p>\n              </li>\n            }\n          </ul>\n        }\n      </section>\n\n      <section class=\"kd-card\">\n        <div class=\"kd-card__header\">\n          <div>\n            <span class=\"kd-section-label\">{{ 'kd.knowledge-discovery.models' | translate }}</span>\n            <h3>{{ 'kd.knowledge-discovery.reference-data' | translate }}</h3>\n          </div>\n        </div>\n\n        @if (loadingReferenceData()) {\n          <div class=\"kd-state\">\n            <mat-spinner\n              diameter=\"20\"\n              [attr.aria-label]=\"'kd.knowledge-discovery.loading' | translate\"\n            />\n          </div>\n        } @else if (models().length === 0) {\n          <p class=\"kd-empty\">{{ 'kd.knowledge-discovery.no-models-loaded' | translate }}</p>\n        } @else {\n          <ul class=\"kd-reference\">\n            @for (model of models(); track model.modelName) {\n              <li class=\"kd-reference__item\">\n                <span>{{ model.displayName || model.modelName }}</span>\n                <span class=\"kd-reference__meta\">{{\n                  model.status || ('knowledge-discovery.unknown' | translate)\n                }}</span>\n              </li>\n            }\n          </ul>\n        }\n      </section>\n    </aside>\n  </div>\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-page {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px 20px;\n  box-sizing: border-box;\n  background: var(--mat-sys-surface-container-low, #f5f6f8);\n  min-height: 100%;\n}\n\n// ---------- top bar ----------\n\n.kd-topbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  flex-wrap: wrap;\n  padding: 4px 2px;\n}\n\n.kd-topbar__title {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n\n  h1 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n}\n\n.kd-topbar__actions {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n// ---------- shared bits ----------\n\n.kd-eyebrow,\n.kd-section-label {\n  display: inline-block;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  font-size: 10.5px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  line-height: 1.2;\n}\n\n.kd-muted {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 12.5px;\n  line-height: 1.5;\n}\n\n.kd-helper {\n  margin: -4px 0 8px;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-empty {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 12.5px;\n}\n\n.kd-error {\n  color: var(--mat-sys-error, #c62828);\n  font-size: 12.5px;\n  margin: 0;\n}\n\n.kd-state {\n  display: flex;\n  justify-content: center;\n  padding: 8px 0;\n}\n\n// ---------- cards ----------\n\n.kd-card {\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 10px;\n  background: var(--mat-sys-surface, #fff);\n  padding: 14px 16px;\n  box-shadow: none;\n}\n\n.kd-card__header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 10px;\n  margin-bottom: 10px;\n\n  h2 {\n    margin: 2px 0 0;\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n\n  h3 {\n    margin: 2px 0 0;\n    font-size: 13px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    line-height: 1.3;\n  }\n}\n\n// ---------- layout ----------\n\n.kd-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 340px);\n  gap: 12px;\n}\n\n.kd-main,\n.kd-side {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n}\n\n// ---------- composer ----------\n\n.kd-block-field {\n  width: 100%;\n}\n\n.kd-advanced {\n  margin: -4px 0 6px;\n\n  summary {\n    cursor: pointer;\n    color: var(--mat-sys-primary, #5c6bc0);\n    font-size: 12.5px;\n    font-weight: 500;\n    padding: 4px 0;\n    list-style: none;\n    user-select: none;\n\n    &::-webkit-details-marker {\n      display: none;\n    }\n\n    &::before {\n      content: '\u25B8';\n      display: inline-block;\n      margin-right: 6px;\n      transition: transform 0.15s ease;\n    }\n  }\n\n  &[open] summary::before {\n    transform: rotate(90deg);\n  }\n}\n\n.kd-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 4px;\n}\n\n.kd-inline-status {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 4px 10px;\n  border-radius: 999px;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n  font-size: 11.5px;\n  font-weight: 600;\n\n  mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n    line-height: 14px;\n  }\n}\n\n.kd-inline-status--muted {\n  background: var(--mat-sys-surface-container-high, #f1f2f6);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-progress-card {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #dbe4ff);\n  border-radius: 10px;\n  background: linear-gradient(\n    180deg,\n    var(--mat-sys-surface-container-lowest, #f8faff) 0%,\n    var(--mat-sys-primary-container, #eef3ff) 100%\n  );\n}\n\n.kd-progress-card__icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  flex: 0 0 28px;\n}\n\n.kd-progress-card__content {\n  min-width: 0;\n}\n\n.kd-progress-card__title,\n.kd-progress-card__message {\n  margin: 0;\n}\n\n.kd-progress-card__title {\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-primary, #1f3f8f);\n}\n\n.kd-progress-card__message {\n  margin-top: 2px;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #52607a);\n}\n\n// ---------- answer ----------\n\n.kd-answer__body {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.kd-answer__text {\n  margin: 0;\n  white-space: pre-wrap;\n  line-height: 1.55;\n  font-size: 13.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-citation-marker {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 18px;\n  height: 18px;\n  margin: 0 2px;\n  padding: 0 5px;\n  border: 1px solid var(--mat-sys-outline-variant, #d5dae3);\n  border-radius: 4px;\n  background: var(--mat-sys-surface-container-high, #eceff4);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  vertical-align: super;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-primary-container, #d7e3ff);\n    border-color: var(--mat-sys-primary, #005cbb);\n    color: var(--mat-sys-primary, #005cbb);\n  }\n}\n\n.kd-answer__loading {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-low, #f8fafc);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-answer__loading-header {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n}\n\n.kd-answer__loading-title,\n.kd-answer__loading-copy {\n  margin: 0;\n}\n\n.kd-answer__loading-title {\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-answer__loading-copy {\n  margin-top: 2px;\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-answer__skeleton {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.kd-answer__skeleton-line {\n  display: block;\n  height: 10px;\n  border-radius: 999px;\n  background: linear-gradient(\n    90deg,\n    var(--mat-sys-surface-container-high, #e8edf5) 25%,\n    var(--mat-sys-surface-container-lowest, #f5f7fb) 50%,\n    var(--mat-sys-surface-container-high, #e8edf5) 75%\n  );\n  background-size: 200% 100%;\n  animation: kd-shimmer 1.4s ease-in-out infinite;\n}\n\n.kd-answer__skeleton-line--wide {\n  width: 92%;\n}\n\n.kd-answer__skeleton-line:not(.kd-answer__skeleton-line--wide):not(\n    .kd-answer__skeleton-line--short\n  ) {\n  width: 100%;\n}\n\n.kd-answer__skeleton-line--short {\n  width: 68%;\n}\n\n.kd-feedback {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-top: 4px;\n\n  button mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    line-height: 16px;\n    margin-right: 4px;\n  }\n}\n\n.kd-status-chip {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 10px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n}\n\n.kd-status-chip--submitted {\n  background: var(--mat-sys-tertiary-container, #fff8e1);\n  color: var(--mat-sys-on-tertiary-container, #a56b00);\n}\n.kd-status-chip--complete {\n  background: var(--mat-sys-secondary-container, #e7f7ed);\n  color: var(--mat-sys-on-secondary-container, #1f7a46);\n}\n.kd-status-chip--error {\n  background: var(--mat-sys-error-container, #fdecea);\n  color: var(--mat-sys-error, #c62828);\n}\n.kd-status-chip--blocked {\n  background: var(--mat-sys-tertiary-container, #f3e8ff);\n  color: var(--mat-sys-tertiary, #7b1fa2);\n}\n\n.kd-empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  min-height: 140px;\n  border: 1px dashed var(--mat-sys-outline-variant, #d0d5dd);\n  border-radius: 10px;\n  background: var(--mat-sys-surface-container-lowest, #fbfbfd);\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n  font-size: 12.5px;\n\n  mat-icon {\n    width: 28px;\n    height: 28px;\n    font-size: 28px;\n    color: var(--mat-sys-on-surface-variant, #8b8fb0);\n  }\n}\n\n// ---------- sidebar ----------\n\n.kd-agent-list,\n.kd-history,\n.kd-reference {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.kd-agent-item {\n  width: 100%;\n  text-align: left;\n  cursor: pointer;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: var(--mat-sys-surface, #fff);\n  transition:\n    border-color 0.15s ease,\n    background 0.15s ease;\n\n  &:hover {\n    border-color: var(--mat-sys-outline, #c7ccd6);\n    background: var(--mat-sys-surface-container-lowest, #fafbfd);\n  }\n\n  &.active {\n    border-color: var(--mat-sys-primary, #c7d2fe);\n    background: var(--mat-sys-primary-container, #f5f7ff);\n  }\n}\n\n.kd-agent-item__name {\n  display: block;\n  font-weight: 600;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-agent-item__meta {\n  display: block;\n  margin-top: 2px;\n  font-size: 11.5px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-helper--muted {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 10px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n\n  strong {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n    line-height: 14px;\n  }\n}\n\n.kd-chip-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 8px;\n}\n\n.kd-chip {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  background: var(--mat-sys-primary-container, #eef2ff);\n  color: var(--mat-sys-primary, #4051b5);\n}\n\n.kd-chip--ghost {\n  background: var(--mat-sys-surface-container-high, #f1f2f6);\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-history__item {\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 8px 10px;\n  background: var(--mat-sys-surface, #fff);\n}\n\n.kd-history__question {\n  margin: 0;\n  font-size: 12.5px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n}\n\n.kd-history__meta {\n  margin: 2px 0 0;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n}\n\n.kd-reference__item {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  border-radius: 8px;\n  padding: 6px 10px;\n  background: var(--mat-sys-surface, #fff);\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.kd-reference__meta {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-weight: 500;\n}\n\n// ---------- banners ----------\n\n.kd-banner {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #e8eaef);\n  background: var(--mat-sys-surface, #fff);\n  font-size: 12.5px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.kd-banner--error {\n  color: var(--mat-sys-error, #c62828);\n  background: var(--mat-sys-error-container, #fff5f5);\n  border-color: var(--mat-sys-error, #f5c2c2);\n}\n\n.kd-banner--muted {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-debug {\n  margin: -6px 0 0;\n  border: 1px dashed var(--mat-sys-outline, #c7ccd6);\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-lowest, #fbfbfd);\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n\n  summary {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    padding: 8px 12px;\n    cursor: pointer;\n    list-style: none;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    user-select: none;\n\n    &::-webkit-details-marker {\n      display: none;\n    }\n\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n      line-height: 16px;\n      color: var(--mat-sys-on-surface-variant, #6b7280);\n    }\n  }\n\n  &[open] summary {\n    border-bottom: 1px dashed var(--mat-sys-outline-variant, #e8eaef);\n  }\n}\n\n.kd-debug__chip {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 8px;\n  border-radius: 999px;\n  font-size: 10.5px;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  background: var(--mat-sys-error-container, #fdecea);\n  color: var(--mat-sys-error, #c62828);\n}\n\n.kd-debug__copy {\n  margin-left: auto;\n}\n\n.kd-debug__body {\n  margin: 0;\n  padding: 10px 12px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  font-size: 11.5px;\n  line-height: 1.45;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: pre-wrap;\n  word-break: break-word;\n  overflow-x: auto;\n  max-height: 320px;\n}\n\n@keyframes kd-shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n// ---------- density overrides (shrink Material defaults to match app) ----------\n\n:host ::ng-deep {\n  .mat-mdc-form-field {\n    font-size: 13px;\n  }\n\n  .mat-mdc-text-field-wrapper {\n    background: var(--mat-sys-surface, #fff);\n  }\n\n  .mat-mdc-button,\n  .mat-mdc-outlined-button,\n  .mat-mdc-unelevated-button,\n  .mat-mdc-raised-button {\n    font-size: 12.5px;\n    letter-spacing: 0;\n    min-height: 34px;\n    line-height: 32px;\n\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n      line-height: 16px;\n      margin-right: 4px;\n    }\n\n    .mat-mdc-progress-spinner {\n      margin-right: 6px;\n    }\n  }\n\n  .mat-mdc-icon-button {\n    width: 32px;\n    height: 32px;\n    padding: 4px;\n\n    mat-icon {\n      font-size: 18px;\n      width: 18px;\n      height: 18px;\n      line-height: 18px;\n    }\n  }\n}\n\n// ---------- responsive ----------\n\n@media (max-width: 1200px) {\n  .kd-layout {\n    grid-template-columns: 1fr;\n  }\n}\n\n@media (max-width: 720px) {\n  .kd-page {\n    padding: 12px;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(KnowledgeDiscoveryComponent, { className: "KnowledgeDiscoveryComponent", filePath: "libs/features/knowledge-discovery/src/lib/knowledge-discovery/knowledge-discovery.ts", lineNumber: 76 }); })();
