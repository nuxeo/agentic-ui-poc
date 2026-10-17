import { DatePipe } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdministrationService, DirectoryService, } from '@nuxeo/satori-platform/nuxeo-client';
import { AiGatewayService, AiFeatureFlagService, } from '@agentic-ui/shared/ai-client';
import { TranslatePipe } from '@ngx-translate/core';
import { provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/select";
import * as i6 from "@angular/material/datepicker";
import * as i7 from "@angular/material/table";
import * as i8 from "@angular/material/icon";
import * as i9 from "@angular/material/progress-spinner";
import * as i10 from "@angular/material/tooltip";
const _c0 = a0 => ({ count: a0 });
const _c1 = a0 => ({ page: a0 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.description;
const _forTrack2 = ($index, $item) => $item.label;
const _forTrack3 = ($index, $item) => $item.name;
function AdminAuditPageComponent_Conditional_9_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "admin.audit.critical-count", i0.ɵɵpureFunction1(4, _c0, ctx_r2.highSeverityCount())));
} }
function AdminAuditPageComponent_Conditional_9_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 31);
    i0.ɵɵelement(1, "div", 33);
    i0.ɵɵelementStart(2, "div", 34);
    i0.ɵɵelement(3, "div", 35)(4, "div", 35)(5, "div", 35);
    i0.ɵɵelementEnd()();
} }
function AdminAuditPageComponent_Conditional_9_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32)(1, "mat-icon");
    i0.ɵɵtext(2, "verified");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "admin.admin-audit-page.no-anomalies-detected-in-the-last"));
} }
function AdminAuditPageComponent_Conditional_9_Conditional_22_For_4_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const a_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, a_r4.events.length === 1 ? "common.count.related-event-one" : "common.count.related-event-many", i0.ɵɵpureFunction1(4, _c0, a_r4.events.length)), " ");
} }
function AdminAuditPageComponent_Conditional_9_Conditional_22_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 39)(1, "div", 40)(2, "mat-icon");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 41);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 42);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "p", 43);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, AdminAuditPageComponent_Conditional_9_Conditional_22_For_4_Conditional_10_Template, 3, 6, "div", 44);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const a_r4 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵclassMap("ai-anomaly-card--" + a_r4.severity);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("sev-icon sev-icon--" + a_r4.severity);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.severityIcon(a_r4.severity));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(a_r4.severity);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(a_r4.timestamp);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(a_r4.description);
    i0.ɵɵadvance();
    i0.ɵɵconditional(a_r4.events.length ? 10 : -1);
} }
function AdminAuditPageComponent_Conditional_9_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 37);
    i0.ɵɵrepeaterCreate(3, AdminAuditPageComponent_Conditional_9_Conditional_22_For_4_Template, 11, 9, "div", 38, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.anomalySummary());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.anomalies());
} }
function AdminAuditPageComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 22)(1, "div", 23)(2, "div", 24)(3, "mat-icon", 25);
    i0.ɵɵtext(4, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 26);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, AdminAuditPageComponent_Conditional_9_Conditional_8_Template, 3, 6, "span", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 28)(10, "button", 29);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_9_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadAnomalies()); });
    i0.ɵɵelementStart(13, "mat-icon");
    i0.ɵɵtext(14, "refresh");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "button", 30);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_9_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.dismissAnomalies()); });
    i0.ɵɵelementStart(18, "mat-icon");
    i0.ɵɵtext(19, "close");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(20, AdminAuditPageComponent_Conditional_9_Conditional_20_Template, 6, 0, "div", 31)(21, AdminAuditPageComponent_Conditional_9_Conditional_21_Template, 6, 3, "div", 32)(22, AdminAuditPageComponent_Conditional_9_Conditional_22_Template, 5, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("ai-anomaly-banner--loading", ctx_r2.anomalyLoading());
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 10, "admin.admin-audit-page.ai-anomaly-detection"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.highSeverityCount() > 0 ? 8 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(11, 12, "admin.admin-audit-page.refresh"))("disabled", ctx_r2.anomalyLoading());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 14, "admin.admin-audit-page.refresh"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(16, 16, "admin.admin-audit-page.dismiss"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(17, 18, "admin.admin-audit-page.dismiss"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.anomalyLoading() ? 20 : ctx_r2.anomalies().length === 0 ? 21 : 22);
} }
function AdminAuditPageComponent_Conditional_10_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 48);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "admin.admin-audit-page.loading"));
} }
function AdminAuditPageComponent_Conditional_10_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 52);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_10_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onNlSearch()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "search");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", !ctx_r2.nlQuery.trim())("matTooltip", i0.ɵɵpipeBind1(1, 3, "admin.admin-audit-page.search-with-ai"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 5, "admin.admin-audit-page.search-with-ai"));
} }
function AdminAuditPageComponent_Conditional_10_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_10_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.clearNlSearch()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "clear");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "admin.admin-audit-page.clear-ai-filters"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "admin.admin-audit-page.clear-ai-filters"));
} }
function AdminAuditPageComponent_Conditional_10_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 51)(1, "mat-icon");
    i0.ɵɵtext(2, "lightbulb");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.nlExplanation());
} }
function AdminAuditPageComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 7)(1, "div", 45)(2, "mat-icon", 46);
    i0.ɵɵtext(3, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 47);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Conditional_10_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.nlQuery, $event) || (ctx_r2.nlQuery = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("keydown.enter", function AdminAuditPageComponent_Conditional_10_Template_input_keydown_enter_4_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onNlSearch()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminAuditPageComponent_Conditional_10_Conditional_5_Template, 2, 3, "mat-spinner", 48)(6, AdminAuditPageComponent_Conditional_10_Conditional_6_Template, 5, 7, "button", 49);
    i0.ɵɵconditionalCreate(7, AdminAuditPageComponent_Conditional_10_Conditional_7_Template, 5, 6, "button", 50);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, AdminAuditPageComponent_Conditional_10_Conditional_8_Template, 5, 1, "div", 51);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.nlQuery);
    i0.ɵɵproperty("disabled", ctx_r2.nlLoading());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.nlLoading() ? 5 : 6);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.nlExplanation() ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.nlExplanation() ? 8 : -1);
} }
function AdminAuditPageComponent_For_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r8 = ctx.$implicit;
    i0.ɵɵproperty("value", t_r8.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(t_r8.displayLabel || t_r8.id);
} }
function AdminAuditPageComponent_For_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r9 = ctx.$implicit;
    i0.ɵɵproperty("value", c_r9.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r9.displayLabel || c_r9.id);
} }
function AdminAuditPageComponent_Conditional_56_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_56_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.summarizeEntries()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.summaryLoading() || ctx_r2.entries().length === 0)("matTooltip", i0.ɵɵpipeBind1(1, 3, "admin.admin-audit-page.ai-summarizes-the-currently-visible-entries"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 5, "admin.admin-audit-page.summarize-with-ai"), " ");
} }
function AdminAuditPageComponent_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "p", 53);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, AdminAuditPageComponent_Conditional_56_Conditional_4_Template, 6, 7, "button", 54);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(3, 2, ctx_r2.totalSize() === 1 ? "common.count.event-one" : "common.count.event-many", i0.ɵɵpureFunction1(5, _c0, ctx_r2.totalSize())), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.featureFlags.aiEnabled() ? 4 : -1);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 58);
    i0.ɵɵelement(1, "mat-spinner", 59);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "admin.admin-audit-page.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(5, 4, "admin.audit.analyzing-entries", i0.ɵɵpureFunction1(7, _c0, ctx_r2.entries().length)));
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 63)(1, "mat-icon");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 64)(4, "span", 65);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 66);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const stat_r12 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.summaryStatIcon(stat_r12.icon));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(stat_r12.value);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(stat_r12.label);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 61);
    i0.ɵɵrepeaterCreate(1, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_2_For_2_Template, 8, 3, "div", 63, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.auditSummary().stats);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_3_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 68)(1, "mat-icon");
    i0.ɵɵtext(2, "person");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const u_r13 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", u_r13.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", u_r13.count, ")");
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "h4");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 67);
    i0.ɵɵrepeaterCreate(5, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_3_For_6_Template, 6, 2, "span", 68, _forTrack3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "admin.admin-audit-page.most-active-users"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.auditSummary().topUsers);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_4_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const h_r14 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(h_r14);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "h4");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 69);
    i0.ɵɵrepeaterCreate(5, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_4_For_6_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "admin.admin-audit-page.highlights"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.auditSummary().highlights);
} }
function AdminAuditPageComponent_Conditional_57_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 60);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_2_Template, 3, 0, "div", 61);
    i0.ɵɵconditionalCreate(3, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_3_Template, 7, 3, "div", 62);
    i0.ɵɵconditionalCreate(4, AdminAuditPageComponent_Conditional_57_Conditional_12_Conditional_4_Template, 7, 3, "div", 62);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.auditSummary().summary);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.auditSummary().stats.length ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.auditSummary().topUsers.length ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.auditSummary().highlights.length ? 4 : -1);
} }
function AdminAuditPageComponent_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 20)(1, "div", 56)(2, "mat-icon", 25);
    i0.ɵɵtext(3, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 57);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_57_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closeSummary()); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(11, AdminAuditPageComponent_Conditional_57_Conditional_11_Template, 6, 9, "div", 58)(12, AdminAuditPageComponent_Conditional_57_Conditional_12_Template, 5, 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 3, "admin.admin-audit-page.ai-summary"));
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 5, "admin.admin-audit-page.close-ai-summary"));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r2.summaryLoading() ? 11 : ctx_r2.auditSummary() ? 12 : -1);
} }
function AdminAuditPageComponent_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵelement(1, "mat-spinner", 70);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.loading"));
} }
function AdminAuditPageComponent_Conditional_59_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.performed-action"), " ");
} }
function AdminAuditPageComponent_Conditional_59_td_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r16 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.actionLabel(e_r16));
} }
function AdminAuditPageComponent_Conditional_59_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.date"));
} }
function AdminAuditPageComponent_Conditional_59_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r17 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, e_r17.eventDate, "medium"));
} }
function AdminAuditPageComponent_Conditional_59_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.username"), " ");
} }
function AdminAuditPageComponent_Conditional_59_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r18 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(e_r18.principalName);
} }
function AdminAuditPageComponent_Conditional_59_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.category"), " ");
} }
function AdminAuditPageComponent_Conditional_59_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r19 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(e_r19.category);
} }
function AdminAuditPageComponent_Conditional_59_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.document"), " ");
} }
function AdminAuditPageComponent_Conditional_59_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r20 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(e_r20.docPath || "\u2014");
} }
function AdminAuditPageComponent_Conditional_59_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 85);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-audit-page.comment"), " ");
} }
function AdminAuditPageComponent_Conditional_59_td_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const e_r21 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(e_r21.comment || "\u2014");
} }
function AdminAuditPageComponent_Conditional_59_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 87);
} }
function AdminAuditPageComponent_Conditional_59_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 88);
} }
function AdminAuditPageComponent_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 71)(1, "table", 72);
    i0.ɵɵelementContainerStart(2, 73);
    i0.ɵɵtemplate(3, AdminAuditPageComponent_Conditional_59_th_3_Template, 3, 3, "th", 74)(4, AdminAuditPageComponent_Conditional_59_td_4_Template, 2, 1, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 76);
    i0.ɵɵtemplate(6, AdminAuditPageComponent_Conditional_59_th_6_Template, 3, 3, "th", 74)(7, AdminAuditPageComponent_Conditional_59_td_7_Template, 3, 4, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 77);
    i0.ɵɵtemplate(9, AdminAuditPageComponent_Conditional_59_th_9_Template, 3, 3, "th", 74)(10, AdminAuditPageComponent_Conditional_59_td_10_Template, 2, 1, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 78);
    i0.ɵɵtemplate(12, AdminAuditPageComponent_Conditional_59_th_12_Template, 3, 3, "th", 74)(13, AdminAuditPageComponent_Conditional_59_td_13_Template, 2, 1, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 79);
    i0.ɵɵtemplate(15, AdminAuditPageComponent_Conditional_59_th_15_Template, 3, 3, "th", 74)(16, AdminAuditPageComponent_Conditional_59_td_16_Template, 2, 1, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 80);
    i0.ɵɵtemplate(18, AdminAuditPageComponent_Conditional_59_th_18_Template, 3, 3, "th", 74)(19, AdminAuditPageComponent_Conditional_59_td_19_Template, 2, 1, "td", 75);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, AdminAuditPageComponent_Conditional_59_tr_20_Template, 1, 0, "tr", 81)(21, AdminAuditPageComponent_Conditional_59_tr_21_Template, 1, 0, "tr", 82);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 83)(23, "button", 84);
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_59_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.prevPage()); });
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "span");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "button", 84);
    i0.ɵɵlistener("click", function AdminAuditPageComponent_Conditional_59_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.nextPage()); });
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r2.entries());
    i0.ɵɵadvance(19);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r2.columns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r2.columns);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.pageIndex() === 0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 8, "admin.admin-audit-page.previous"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(28, 10, "common.page-number", i0.ɵɵpureFunction1(15, _c1, ctx_r2.pageIndex() + 1)));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", (ctx_r2.pageIndex() + 1) * 50 >= ctx_r2.totalSize());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(31, 13, "admin.admin-audit-page.next"), " ");
} }
export class AdminAuditPageComponent {
    adminService = inject(AdministrationService);
    directoryService = inject(DirectoryService);
    aiGateway = inject(AiGatewayService);
    featureFlags = inject(AiFeatureFlagService);
    columns = ['action', 'date', 'username', 'category', 'document', 'comment'];
    entries = signal([], ...(ngDevMode ? [{ debugName: "entries" }] : []));
    totalSize = signal(0, ...(ngDevMode ? [{ debugName: "totalSize" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    pageIndex = signal(0, ...(ngDevMode ? [{ debugName: "pageIndex" }] : []));
    pageSize = 50;
    principalName = '';
    fromDate = null;
    toDate = null;
    eventAction = '';
    eventCategory = '';
    eventTypes = signal([], ...(ngDevMode ? [{ debugName: "eventTypes" }] : []));
    eventCategories = signal([], ...(ngDevMode ? [{ debugName: "eventCategories" }] : []));
    /* --- AI Anomaly Detection --- */
    anomalies = signal([], ...(ngDevMode ? [{ debugName: "anomalies" }] : []));
    anomalySummary = signal('', ...(ngDevMode ? [{ debugName: "anomalySummary" }] : []));
    anomalyLoading = signal(false, ...(ngDevMode ? [{ debugName: "anomalyLoading" }] : []));
    anomalyDismissed = signal(false, ...(ngDevMode ? [{ debugName: "anomalyDismissed" }] : []));
    highSeverityCount = computed(() => this.anomalies().filter((a) => a.severity === 'high').length, ...(ngDevMode ? [{ debugName: "highSeverityCount" }] : []));
    /* --- AI Natural-Language Search --- */
    nlQuery = '';
    nlLoading = signal(false, ...(ngDevMode ? [{ debugName: "nlLoading" }] : []));
    nlExplanation = signal('', ...(ngDevMode ? [{ debugName: "nlExplanation" }] : []));
    /* --- AI Summarization --- */
    auditSummary = signal(null, ...(ngDevMode ? [{ debugName: "auditSummary" }] : []));
    summaryLoading = signal(false, ...(ngDevMode ? [{ debugName: "summaryLoading" }] : []));
    summaryOpen = signal(false, ...(ngDevMode ? [{ debugName: "summaryOpen" }] : []));
    ngOnInit() {
        this.directoryService.getEventTypes().subscribe((e) => this.eventTypes.set(e));
        this.directoryService.getEventCategories().subscribe((e) => this.eventCategories.set(e));
        this.load();
        this.loadAnomalies();
    }
    load() {
        this.loading.set(true);
        const from = this.fromDate ? this.fromDate.toISOString() : null;
        const to = this.toDate ? this.toDate.toISOString() : null;
        const eventIds = this.eventAction ? [this.eventAction] : undefined;
        this.adminService
            .searchAuditLogs({
            pageSize: this.pageSize,
            currentPageIndex: this.pageIndex(),
            principalName: this.principalName.trim() || undefined,
            from,
            to,
            eventIds,
            category: this.eventCategory || undefined,
        })
            .subscribe({
            next: (list) => {
                this.entries.set((list.entries ?? []));
                this.totalSize.set(list.totalSize ?? list.entries?.length ?? 0);
                this.loading.set(false);
            },
            error: () => {
                this.entries.set([]);
                this.totalSize.set(0);
                this.loading.set(false);
            },
        });
    }
    applyFilters() {
        this.pageIndex.set(0);
        this.load();
    }
    nextPage() {
        this.pageIndex.update((i) => i + 1);
        this.load();
    }
    prevPage() {
        this.pageIndex.update((i) => Math.max(0, i - 1));
        this.load();
    }
    actionLabel(e) {
        return e.eventId?.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) ?? '—';
    }
    /* --- AI: Anomaly Detection --- */
    loadAnomalies() {
        // `ngOnInit` calls this unconditionally and the banner is gated in the template, so without
        // this guard an opted-out user still POSTed `AI.Anomalies` on every visit to the audit page.
        if (!this.featureFlags.aiEnabled())
            return;
        this.anomalyLoading.set(true);
        this.aiGateway.detectAnomalies('24h').subscribe({
            next: (res) => {
                this.anomalies.set(res.anomalies ?? []);
                this.anomalySummary.set(res.summary ?? '');
                this.anomalyLoading.set(false);
            },
            error: () => this.anomalyLoading.set(false),
        });
    }
    dismissAnomalies() {
        this.anomalyDismissed.set(true);
    }
    severityIcon(sev) {
        return sev === 'high' ? 'error' : sev === 'medium' ? 'warning' : 'info';
    }
    /* --- AI: Natural-Language Search --- */
    onNlSearch() {
        if (!this.nlQuery.trim())
            return;
        this.nlLoading.set(true);
        this.nlExplanation.set('');
        this.aiGateway.auditNlFilter(this.nlQuery.trim()).subscribe({
            next: (res) => {
                this.applyAiFilter(res);
                this.nlExplanation.set(res.explanation || '');
                this.nlLoading.set(false);
            },
            error: () => this.nlLoading.set(false),
        });
    }
    applyAiFilter(f) {
        if (f.principalName)
            this.principalName = f.principalName;
        if (f.eventId)
            this.eventAction = f.eventId;
        if (f.category)
            this.eventCategory = f.category;
        if (f.from)
            this.fromDate = new Date(f.from);
        if (f.to)
            this.toDate = new Date(f.to);
        this.applyFilters();
    }
    clearNlSearch() {
        this.nlQuery = '';
        this.nlExplanation.set('');
        this.principalName = '';
        this.eventAction = '';
        this.eventCategory = '';
        this.fromDate = null;
        this.toDate = null;
        this.applyFilters();
    }
    /* --- AI: Summarize --- */
    summarizeEntries() {
        const raw = this.entries();
        if (!raw.length)
            return;
        this.summaryLoading.set(true);
        this.summaryOpen.set(true);
        this.aiGateway.auditSummarize(raw).subscribe({
            next: (res) => {
                this.auditSummary.set(res);
                this.summaryLoading.set(false);
            },
            error: () => {
                this.auditSummary.set(null);
                this.summaryLoading.set(false);
            },
        });
    }
    closeSummary() {
        this.summaryOpen.set(false);
    }
    summaryStatIcon(icon) {
        const map = {
            edit: 'edit',
            delete: 'delete',
            security: 'shield',
            login: 'login',
            download: 'download',
            workflow: 'account_tree',
            info: 'info',
        };
        return map[icon] || 'info';
    }
    static ɵfac = function AdminAuditPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminAuditPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminAuditPageComponent, selectors: [["lib-admin-audit-page"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()])], decls: 60, vars: 44, consts: [["fromPicker", ""], ["toPicker", ""], [1, "audit-page"], [1, "audit-page__header"], ["role", "heading", "aria-level", "1", 1, "audit-page__title"], ["type", "button", "mat-icon-button", ""], [1, "ai-anomaly-banner", 3, "ai-anomaly-banner--loading"], [1, "ai-nl-search"], [1, "audit-filters", "mat-elevation-z0"], ["appearance", "outline", "subscriptSizing", "dynamic"], ["matInput", "", "name", "principalName", 3, "ngModelChange", "ngModel"], ["matInput", "", "name", "fromDate", 3, "ngModelChange", "matDatepicker", "ngModel"], ["matSuffix", "", 3, "for"], ["matInput", "", "name", "toDate", 3, "ngModelChange", "matDatepicker", "ngModel"], ["name", "eventAction", 3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], ["name", "eventCategory", 3, "ngModelChange", "ngModel"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click"], [1, "audit-toolbar"], [1, "ai-summary-panel"], [1, "audit-center"], [1, "ai-anomaly-banner"], [1, "ai-anomaly-banner__header"], [1, "ai-anomaly-banner__title-row"], [1, "ai-sparkle-icon"], [1, "ai-anomaly-banner__title"], [1, "ai-anomaly-badge", "ai-anomaly-badge--high"], [1, "ai-anomaly-banner__actions"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip", "disabled"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip"], [1, "ai-anomaly-banner__skeleton"], [1, "ai-anomaly-banner__empty"], [1, "ai-skeleton-bar", "ai-skeleton-bar--long"], [1, "ai-skeleton-row"], [1, "ai-skeleton-card"], [1, "ai-anomaly-banner__summary"], [1, "ai-anomaly-cards"], [1, "ai-anomaly-card", 3, "class"], [1, "ai-anomaly-card"], [1, "ai-anomaly-card__header"], [1, "ai-anomaly-card__severity"], [1, "ai-anomaly-card__time"], [1, "ai-anomaly-card__desc"], [1, "ai-anomaly-card__events"], [1, "ai-nl-search__input-row"], [1, "ai-nl-search__icon"], ["type", "text", "placeholder", "Ask AI: e.g. \"show login failures last week\" or \"what did Administrator do yesterday\"", 1, "ai-nl-search__input", 3, "ngModelChange", "keydown.enter", "ngModel", "disabled"], ["diameter", "20", 1, "ai-nl-search__spinner"], ["type", "button", "mat-icon-button", "", 3, "disabled", "matTooltip"], ["type", "button", "mat-icon-button", "", 3, "matTooltip"], [1, "ai-nl-search__explanation"], ["type", "button", "mat-icon-button", "", 3, "click", "disabled", "matTooltip"], [1, "audit-meta"], ["type", "button", "mat-stroked-button", "", 1, "ai-summarize-btn", 3, "disabled", "matTooltip"], ["type", "button", "mat-stroked-button", "", 1, "ai-summarize-btn", 3, "click", "disabled", "matTooltip"], [1, "ai-summary-panel__header"], ["type", "button", "mat-icon-button", "", 3, "click"], [1, "ai-summary-panel__loading"], ["diameter", "28"], [1, "ai-summary-panel__text"], [1, "ai-summary-stats"], [1, "ai-summary-section"], [1, "ai-summary-stat-card"], [1, "ai-summary-stat-card__body"], [1, "ai-summary-stat-card__value"], [1, "ai-summary-stat-card__label"], [1, "ai-summary-users"], [1, "ai-summary-user-chip"], [1, "ai-summary-highlights"], ["diameter", "40"], [1, "audit-table-wrap", "mat-elevation-z1"], ["mat-table", "", 1, "audit-table", 3, "dataSource"], ["matColumnDef", "action"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "date"], ["matColumnDef", "username"], ["matColumnDef", "category"], ["matColumnDef", "document"], ["matColumnDef", "comment"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [1, "audit-pager"], ["type", "button", "mat-button", "", 3, "click", "disabled"], ["mat-header-cell", ""], ["mat-cell", ""], ["mat-header-row", ""], ["mat-row", ""]], template: function AdminAuditPageComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 2)(1, "header", 3)(2, "div", 4);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "button", 5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementStart(7, "mat-icon");
            i0.ɵɵtext(8, "settings");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(9, AdminAuditPageComponent_Conditional_9_Template, 23, 20, "section", 6);
            i0.ɵɵconditionalCreate(10, AdminAuditPageComponent_Conditional_10_Template, 9, 5, "section", 7);
            i0.ɵɵelementStart(11, "div", 8)(12, "mat-form-field", 9)(13, "mat-label");
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "input", 10);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Template_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.principalName, $event) || (ctx.principalName = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "mat-form-field", 9)(18, "mat-label");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "input", 11);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Template_input_ngModelChange_21_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.fromDate, $event) || (ctx.fromDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(22, "mat-datepicker-toggle", 12)(23, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "mat-form-field", 9)(26, "mat-label");
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "input", 13);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Template_input_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.toDate, $event) || (ctx.toDate = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(30, "mat-datepicker-toggle", 12)(31, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "mat-form-field", 9)(34, "mat-label");
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "mat-select", 14);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Template_mat_select_ngModelChange_37_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.eventAction, $event) || (ctx.eventAction = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(38, "mat-option", 15);
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(41, AdminAuditPageComponent_For_42_Template, 2, 2, "mat-option", 16, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "mat-form-field", 9)(44, "mat-label");
            i0.ɵɵtext(45);
            i0.ɵɵpipe(46, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "mat-select", 17);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminAuditPageComponent_Template_mat_select_ngModelChange_47_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.eventCategory, $event) || (ctx.eventCategory = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementStart(48, "mat-option", 15);
            i0.ɵɵtext(49);
            i0.ɵɵpipe(50, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(51, AdminAuditPageComponent_For_52_Template, 2, 2, "mat-option", 16, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(53, "button", 18);
            i0.ɵɵlistener("click", function AdminAuditPageComponent_Template_button_click_53_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.applyFilters()); });
            i0.ɵɵtext(54);
            i0.ɵɵpipe(55, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(56, AdminAuditPageComponent_Conditional_56_Template, 5, 7, "div", 19);
            i0.ɵɵconditionalCreate(57, AdminAuditPageComponent_Conditional_57_Template, 13, 7, "section", 20);
            i0.ɵɵconditionalCreate(58, AdminAuditPageComponent_Conditional_58_Template, 3, 3, "div", 21)(59, AdminAuditPageComponent_Conditional_59_Template, 32, 17);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            const fromPicker_r22 = i0.ɵɵreference(24);
            const toPicker_r23 = i0.ɵɵreference(32);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 24, "admin.admin-audit-page.audit"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 26, "admin.admin-audit-page.settings-placeholder"));
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() && !ctx.anomalyDismissed() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 10 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 28, "admin.admin-audit-page.filter-by-username"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.principalName);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 30, "admin.admin-audit-page.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r22);
            i0.ɵɵtwoWayProperty("ngModel", ctx.fromDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r22);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 32, "admin.admin-audit-page.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r23);
            i0.ɵɵtwoWayProperty("ngModel", ctx.toDate);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r23);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 34, "admin.admin-audit-page.performed-actions"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.eventAction);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 36, "admin.admin-audit-page.all-actions"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.eventTypes());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(46, 38, "admin.admin-audit-page.event-category"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.eventCategory);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(50, 40, "admin.admin-audit-page.all-categories"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.eventCategories());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(55, 42, "admin.admin-audit-page.apply"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.loading() ? 56 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() && ctx.summaryOpen() ? 57 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 58 : 59);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, i2.MatIconButton, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatSuffix, MatInputModule, i4.MatInput, MatSelectModule, i5.MatSelect, i5.MatOption, MatDatepickerModule, i6.MatDatepicker, i6.MatDatepickerInput, i6.MatDatepickerToggle, MatTableModule, i7.MatTable, i7.MatHeaderCellDef, i7.MatHeaderRowDef, i7.MatColumnDef, i7.MatCellDef, i7.MatRowDef, i7.MatHeaderCell, i7.MatCell, i7.MatHeaderRow, i7.MatRow, MatIconModule, i8.MatIcon, MatProgressSpinnerModule, i9.MatProgressSpinner, MatTooltipModule, i10.MatTooltip, TranslatePipe,
            DatePipe], styles: ["\n\n$ai-purple[_ngcontent-%COMP%]:   #7c3aed[_ngcontent-%COMP%];\n$ai-purple-light[_ngcontent-%COMP%]:   #ede9fe[_ngcontent-%COMP%];\n$ai-purple-border[_ngcontent-%COMP%]:   #c4b5fd[_ngcontent-%COMP%];\n$sev-high[_ngcontent-%COMP%]:   #dc2626[_ngcontent-%COMP%];\n$sev-high-bg[_ngcontent-%COMP%]:   #fef2f2[_ngcontent-%COMP%];\n$sev-med[_ngcontent-%COMP%]:   #f59e0b[_ngcontent-%COMP%];\n$sev-med-bg[_ngcontent-%COMP%]:   #fffbeb[_ngcontent-%COMP%];\n$sev-low[_ngcontent-%COMP%]:   #3b82f6[_ngcontent-%COMP%];\n$sev-low-bg[_ngcontent-%COMP%]:   #eff6ff[_ngcontent-%COMP%];\n\n@keyframes _ngcontent-%COMP%_ai-fade-in {\n  from {\n    opacity: 0;\n    transform: translateY(-6px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n@keyframes _ngcontent-%COMP%_ai-shimmer {\n  0% {\n    background-position: -200% 0;\n  }\n  100% {\n    background-position: 200% 0;\n  }\n}\n\n\n\n.audit-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1280px;\n}\n\n.audit-page__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 1rem;\n}\n\n.audit-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n\n\n\n\n.ai-anomaly-banner[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, $ai-purple-light 0%, #f5f3ff 50%, #faf5ff 100%);\n  border: 1px solid $ai-purple-border;\n  border-radius: 12px;\n  padding: 1rem 1.25rem;\n  margin-bottom: 1.25rem;\n  animation: _ngcontent-%COMP%_ai-fade-in 0.4s ease-out;\n}\n\n.ai-anomaly-banner__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ai-anomaly-banner__title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.ai-sparkle-icon[_ngcontent-%COMP%] {\n  color: $ai-purple;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.ai-anomaly-banner__title[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: $ai-purple;\n}\n\n.ai-anomaly-banner__actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.25rem;\n}\n\n.ai-anomaly-badge[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  padding: 2px 8px;\n  border-radius: 10px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n\n  &--high {\n    background: $sev-high;\n    color: #fff;\n  }\n}\n\n.ai-anomaly-banner__summary[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: rgba(0, 0, 0, 0.7);\n  margin: 0.5rem 0;\n  line-height: 1.5;\n}\n\n.ai-anomaly-banner__empty[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem 0 0.25rem;\n  font-size: 0.875rem;\n  color: #16a34a;\n\n  mat-icon {\n    color: #16a34a;\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n\n\n.ai-anomaly-cards[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 0.75rem;\n  margin-top: 0.5rem;\n}\n\n.ai-anomaly-card[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  padding: 0.75rem;\n  border-left: 4px solid transparent;\n  transition: box-shadow 0.2s;\n\n  &--high {\n    background: $sev-high-bg;\n    border-left-color: $sev-high;\n  }\n  &--medium {\n    background: $sev-med-bg;\n    border-left-color: $sev-med;\n  }\n  &--low {\n    background: $sev-low-bg;\n    border-left-color: $sev-low;\n  }\n\n  &:hover {\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  }\n}\n\n.ai-anomaly-card__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.35rem;\n}\n\n.sev-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n\n  &--high {\n    color: $sev-high;\n  }\n  &--medium {\n    color: $sev-med;\n  }\n  &--low {\n    color: $sev-low;\n  }\n}\n\n.ai-anomaly-card__severity[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n\n.ai-anomaly-card__time[_ngcontent-%COMP%] {\n  margin-left: auto;\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.45);\n}\n\n.ai-anomaly-card__desc[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  line-height: 1.45;\n  margin: 0;\n  color: rgba(0, 0, 0, 0.75);\n}\n\n.ai-anomaly-card__events[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.45);\n  margin-top: 0.35rem;\n}\n\n\n\n.ai-anomaly-banner__skeleton[_ngcontent-%COMP%] {\n  padding: 0.5rem 0;\n}\n\n.ai-skeleton-bar[_ngcontent-%COMP%] {\n  height: 12px;\n  border-radius: 6px;\n  background: linear-gradient(90deg, #e9e5f5 25%, #f3f0fa 50%, #e9e5f5 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_ai-shimmer 1.5s infinite;\n\n  &--long {\n    width: 70%;\n    margin-bottom: 0.75rem;\n  }\n}\n\n.ai-skeleton-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n}\n\n.ai-skeleton-card[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 64px;\n  border-radius: 8px;\n  background: linear-gradient(90deg, #e9e5f5 25%, #f3f0fa 50%, #e9e5f5 75%);\n  background-size: 200% 100%;\n  animation: _ngcontent-%COMP%_ai-shimmer 1.5s infinite;\n}\n\n\n\n\n\n.ai-nl-search[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  animation: _ngcontent-%COMP%_ai-fade-in 0.35s ease-out 0.1s both;\n}\n\n.ai-nl-search__input-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  background: #f8f7ff;\n  border: 1px solid $ai-purple-border;\n  border-radius: 10px;\n  padding: 0.35rem 0.5rem 0.35rem 0.75rem;\n  transition:\n    border-color 0.2s,\n    box-shadow 0.2s;\n\n  &:focus-within {\n    border-color: $ai-purple;\n    box-shadow: 0 0 0 3px rgba($ai-purple, 0.1);\n  }\n}\n\n.ai-nl-search__icon[_ngcontent-%COMP%] {\n  color: $ai-purple;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  flex-shrink: 0;\n}\n\n.ai-nl-search__input[_ngcontent-%COMP%] {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 0.875rem;\n  color: rgba(0, 0, 0, 0.85);\n  padding: 0.35rem 0;\n\n  &::placeholder {\n    color: rgba(0, 0, 0, 0.4);\n  }\n}\n\n.ai-nl-search__spinner[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n\n.ai-nl-search__explanation[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.4rem;\n  margin-top: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  background: #fefce8;\n  border-radius: 8px;\n  font-size: 0.8rem;\n  color: rgba(0, 0, 0, 0.7);\n  line-height: 1.45;\n  animation: _ngcontent-%COMP%_ai-fade-in 0.3s ease-out;\n\n  mat-icon {\n    color: #ca8a04;\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    flex-shrink: 0;\n    margin-top: 1px;\n  }\n}\n\n\n\n.audit-filters[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--admin-space-2, 0.75rem);\n  align-items: center;\n  margin-bottom: 1rem;\n\n  mat-form-field {\n    min-width: 160px;\n    flex: 1 1 160px;\n  }\n}\n\n\n\n.audit-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.5rem;\n}\n\n.audit-meta[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  margin: 0;\n}\n\n.ai-summarize-btn[_ngcontent-%COMP%] {\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  color: $ai-purple !important;\n  border-color: $ai-purple-border !important;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &:hover:not([disabled]) {\n    background: $ai-purple-light !important;\n  }\n}\n\n\n\n\n\n.ai-summary-panel[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);\n  border: 1px solid $ai-purple-border;\n  border-radius: 12px;\n  padding: 1rem 1.25rem;\n  margin-bottom: 1rem;\n  animation: _ngcontent-%COMP%_ai-fade-in 0.35s ease-out;\n}\n\n.ai-summary-panel__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: $ai-purple;\n  margin-bottom: 0.5rem;\n\n  button {\n    margin-left: auto;\n  }\n}\n\n.ai-summary-panel__loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.5rem 0;\n  font-size: 0.85rem;\n  color: rgba(0, 0, 0, 0.55);\n}\n\n.ai-summary-panel__text[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  line-height: 1.55;\n  color: rgba(0, 0, 0, 0.75);\n  margin: 0 0 0.75rem;\n}\n\n.ai-summary-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem;\n  margin-bottom: 0.75rem;\n}\n\n.ai-summary-stat-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  background: #fff;\n  border: 1px solid rgba($ai-purple, 0.15);\n  border-radius: 8px;\n  padding: 0.5rem 0.75rem;\n  min-width: 120px;\n\n  mat-icon {\n    color: $ai-purple;\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n.ai-summary-stat-card__body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-summary-stat-card__value[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 700;\n  color: rgba(0, 0, 0, 0.85);\n  line-height: 1.2;\n}\n\n.ai-summary-stat-card__label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.ai-summary-section[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n\n  h4 {\n    font-size: 0.8rem;\n    font-weight: 600;\n    color: rgba(0, 0, 0, 0.65);\n    margin: 0 0 0.35rem;\n  }\n}\n\n.ai-summary-users[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.ai-summary-user-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  background: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 16px;\n  padding: 0.2rem 0.65rem;\n  font-size: 0.75rem;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    color: rgba(0, 0, 0, 0.4);\n  }\n}\n\n.ai-summary-highlights[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-left: 1.25rem;\n  font-size: 0.8rem;\n  line-height: 1.6;\n  color: rgba(0, 0, 0, 0.7);\n}\n\n\n\n.audit-table-wrap[_ngcontent-%COMP%] {\n  overflow: auto;\n  max-height: 560px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.audit-table[_ngcontent-%COMP%] {\n  width: 100%;\n  font-size: 0.875rem;\n\n  th.mat-mdc-header-cell,\n  td.mat-mdc-cell {\n    padding-top: var(--admin-row-padding-y, 0.68rem);\n    padding-bottom: var(--admin-row-padding-y, 0.68rem);\n  }\n}\n\n.audit-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.audit-pager[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  margin-top: 0.75rem;\n}\n\n.audit-page[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%] {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.audit-page[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%], \n.audit-page[_ngcontent-%COMP%]   .mat-mdc-outlined-button[_ngcontent-%COMP%], \n.audit-page[_ngcontent-%COMP%]   .mat-mdc-button[_ngcontent-%COMP%] {\n  min-height: var(--admin-control-height, 40px);\n}\n\n@media (max-width: 900px) {\n  .audit-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n\n  .ai-anomaly-cards[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .ai-summary-stats[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminAuditPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-audit-page', standalone: true, providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()], imports: [
                    TranslatePipe,
                    DatePipe,
                    FormsModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    MatTableModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                ], template: "<div class=\"audit-page\">\n  <header class=\"audit-page__header\">\n    <div class=\"audit-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-audit-page.audit' | translate }}\n    </div>\n    <button\n      type=\"button\"\n      mat-icon-button\n      [attr.aria-label]=\"'admin.admin-audit-page.settings-placeholder' | translate\"\n    >\n      <mat-icon>settings</mat-icon>\n    </button>\n  </header>\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 AI Anomaly Detection Banner \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  @if (featureFlags.aiEnabled() && !anomalyDismissed()) {\n    <section class=\"ai-anomaly-banner\" [class.ai-anomaly-banner--loading]=\"anomalyLoading()\">\n      <div class=\"ai-anomaly-banner__header\">\n        <div class=\"ai-anomaly-banner__title-row\">\n          <mat-icon class=\"ai-sparkle-icon\">auto_awesome</mat-icon>\n          <span class=\"ai-anomaly-banner__title\">{{\n            'admin.admin-audit-page.ai-anomaly-detection' | translate\n          }}</span>\n          @if (highSeverityCount() > 0) {\n            <span class=\"ai-anomaly-badge ai-anomaly-badge--high\">{{\n              'admin.audit.critical-count' | translate: { count: highSeverityCount() }\n            }}</span>\n          }\n        </div>\n        <div class=\"ai-anomaly-banner__actions\">\n          <button\n            type=\"button\"\n            mat-icon-button\n            [matTooltip]=\"'admin.admin-audit-page.refresh' | translate\"\n            [attr.aria-label]=\"'admin.admin-audit-page.refresh' | translate\"\n            (click)=\"loadAnomalies()\"\n            [disabled]=\"anomalyLoading()\"\n          >\n            <mat-icon>refresh</mat-icon>\n          </button>\n          <button\n            type=\"button\"\n            mat-icon-button\n            [matTooltip]=\"'admin.admin-audit-page.dismiss' | translate\"\n            [attr.aria-label]=\"'admin.admin-audit-page.dismiss' | translate\"\n            (click)=\"dismissAnomalies()\"\n          >\n            <mat-icon>close</mat-icon>\n          </button>\n        </div>\n      </div>\n\n      @if (anomalyLoading()) {\n        <div class=\"ai-anomaly-banner__skeleton\">\n          <div class=\"ai-skeleton-bar ai-skeleton-bar--long\"></div>\n          <div class=\"ai-skeleton-row\">\n            <div class=\"ai-skeleton-card\"></div>\n            <div class=\"ai-skeleton-card\"></div>\n            <div class=\"ai-skeleton-card\"></div>\n          </div>\n        </div>\n      } @else if (anomalies().length === 0) {\n        <div class=\"ai-anomaly-banner__empty\">\n          <mat-icon>verified</mat-icon>\n          <span>{{ 'admin.admin-audit-page.no-anomalies-detected-in-the-last' | translate }}</span>\n        </div>\n      } @else {\n        <p class=\"ai-anomaly-banner__summary\">{{ anomalySummary() }}</p>\n        <div class=\"ai-anomaly-cards\">\n          @for (a of anomalies(); track a.description) {\n            <div class=\"ai-anomaly-card\" [class]=\"'ai-anomaly-card--' + a.severity\">\n              <div class=\"ai-anomaly-card__header\">\n                <mat-icon [class]=\"'sev-icon sev-icon--' + a.severity\">{{\n                  severityIcon(a.severity)\n                }}</mat-icon>\n                <span class=\"ai-anomaly-card__severity\">{{ a.severity }}</span>\n                <span class=\"ai-anomaly-card__time\">{{ a.timestamp }}</span>\n              </div>\n              <p class=\"ai-anomaly-card__desc\">{{ a.description }}</p>\n              @if (a.events.length) {\n                <div class=\"ai-anomaly-card__events\">\n                  {{\n                    (a.events.length === 1\n                      ? 'common.count.related-event-one'\n                      : 'common.count.related-event-many'\n                    ) | translate: { count: a.events.length }\n                  }}\n                </div>\n              }\n            </div>\n          }\n        </div>\n      }\n    </section>\n  }\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 AI Natural Language Search \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  @if (featureFlags.aiEnabled()) {\n    <section class=\"ai-nl-search\">\n      <div class=\"ai-nl-search__input-row\">\n        <mat-icon class=\"ai-nl-search__icon\">auto_awesome</mat-icon>\n        <input\n          class=\"ai-nl-search__input\"\n          type=\"text\"\n          placeholder='Ask AI: e.g. \"show login failures last week\" or \"what did Administrator do yesterday\"'\n          [(ngModel)]=\"nlQuery\"\n          (keydown.enter)=\"onNlSearch()\"\n          [disabled]=\"nlLoading()\"\n        />\n        @if (nlLoading()) {\n          <mat-spinner\n            diameter=\"20\"\n            class=\"ai-nl-search__spinner\"\n            [attr.aria-label]=\"'admin.admin-audit-page.loading' | translate\"\n          />\n        } @else {\n          <button\n            type=\"button\"\n            mat-icon-button\n            (click)=\"onNlSearch()\"\n            [disabled]=\"!nlQuery.trim()\"\n            [matTooltip]=\"'admin.admin-audit-page.search-with-ai' | translate\"\n            [attr.aria-label]=\"'admin.admin-audit-page.search-with-ai' | translate\"\n          >\n            <mat-icon>search</mat-icon>\n          </button>\n        }\n        @if (nlExplanation()) {\n          <button\n            type=\"button\"\n            mat-icon-button\n            (click)=\"clearNlSearch()\"\n            [matTooltip]=\"'admin.admin-audit-page.clear-ai-filters' | translate\"\n            [attr.aria-label]=\"'admin.admin-audit-page.clear-ai-filters' | translate\"\n          >\n            <mat-icon>clear</mat-icon>\n          </button>\n        }\n      </div>\n      @if (nlExplanation()) {\n        <div class=\"ai-nl-search__explanation\">\n          <mat-icon>lightbulb</mat-icon>\n          <span>{{ nlExplanation() }}</span>\n        </div>\n      }\n    </section>\n  }\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 Standard Filters \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  <div class=\"audit-filters mat-elevation-z0\">\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n      <mat-label>{{ 'admin.admin-audit-page.filter-by-username' | translate }}</mat-label>\n      <input matInput [(ngModel)]=\"principalName\" name=\"principalName\" />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n      <mat-label>{{ 'admin.admin-audit-page.from' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"fromPicker\" [(ngModel)]=\"fromDate\" name=\"fromDate\" />\n      <mat-datepicker-toggle matSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n      <mat-label>{{ 'admin.admin-audit-page.to' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"toPicker\" [(ngModel)]=\"toDate\" name=\"toDate\" />\n      <mat-datepicker-toggle matSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n      <mat-label>{{ 'admin.admin-audit-page.performed-actions' | translate }}</mat-label>\n      <mat-select [(ngModel)]=\"eventAction\" name=\"eventAction\">\n        <mat-option value=\"\">{{ 'admin.admin-audit-page.all-actions' | translate }}</mat-option>\n        @for (t of eventTypes(); track t.id) {\n          <mat-option [value]=\"t.id\">{{ t.displayLabel || t.id }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n      <mat-label>{{ 'admin.admin-audit-page.event-category' | translate }}</mat-label>\n      <mat-select [(ngModel)]=\"eventCategory\" name=\"eventCategory\">\n        <mat-option value=\"\">{{ 'admin.admin-audit-page.all-categories' | translate }}</mat-option>\n        @for (c of eventCategories(); track c.id) {\n          <mat-option [value]=\"c.id\">{{ c.displayLabel || c.id }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n    <button type=\"button\" mat-flat-button color=\"primary\" (click)=\"applyFilters()\">\n      {{ 'admin.admin-audit-page.apply' | translate }}\n    </button>\n  </div>\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 Results Toolbar \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  @if (!loading()) {\n    <div class=\"audit-toolbar\">\n      <p class=\"audit-meta\">\n        {{\n          (totalSize() === 1 ? 'common.count.event-one' : 'common.count.event-many')\n            | translate: { count: totalSize() }\n        }}\n      </p>\n      @if (featureFlags.aiEnabled()) {\n        <button\n          type=\"button\"\n          mat-stroked-button\n          class=\"ai-summarize-btn\"\n          (click)=\"summarizeEntries()\"\n          [disabled]=\"summaryLoading() || entries().length === 0\"\n          [matTooltip]=\"\n            'admin.admin-audit-page.ai-summarizes-the-currently-visible-entries' | translate\n          \"\n        >\n          <mat-icon>auto_awesome</mat-icon>\n          {{ 'admin.admin-audit-page.summarize-with-ai' | translate }}\n        </button>\n      }\n    </div>\n  }\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 AI Summary Panel \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  @if (featureFlags.aiEnabled() && summaryOpen()) {\n    <section class=\"ai-summary-panel\">\n      <div class=\"ai-summary-panel__header\">\n        <mat-icon class=\"ai-sparkle-icon\">auto_awesome</mat-icon>\n        <span>{{ 'admin.admin-audit-page.ai-summary' | translate }}</span>\n        <button\n          type=\"button\"\n          mat-icon-button\n          [attr.aria-label]=\"'admin.admin-audit-page.close-ai-summary' | translate\"\n          (click)=\"closeSummary()\"\n        >\n          <mat-icon>close</mat-icon>\n        </button>\n      </div>\n      @if (summaryLoading()) {\n        <div class=\"ai-summary-panel__loading\">\n          <mat-spinner\n            diameter=\"28\"\n            [attr.aria-label]=\"'admin.admin-audit-page.loading' | translate\"\n          />\n          <span>{{\n            'admin.audit.analyzing-entries' | translate: { count: entries().length }\n          }}</span>\n        </div>\n      } @else if (auditSummary()) {\n        <p class=\"ai-summary-panel__text\">{{ auditSummary()!.summary }}</p>\n\n        @if (auditSummary()!.stats.length) {\n          <div class=\"ai-summary-stats\">\n            @for (stat of auditSummary()!.stats; track stat.label) {\n              <div class=\"ai-summary-stat-card\">\n                <mat-icon>{{ summaryStatIcon(stat.icon) }}</mat-icon>\n                <div class=\"ai-summary-stat-card__body\">\n                  <span class=\"ai-summary-stat-card__value\">{{ stat.value }}</span>\n                  <span class=\"ai-summary-stat-card__label\">{{ stat.label }}</span>\n                </div>\n              </div>\n            }\n          </div>\n        }\n\n        @if (auditSummary()!.topUsers.length) {\n          <div class=\"ai-summary-section\">\n            <h4>{{ 'admin.admin-audit-page.most-active-users' | translate }}</h4>\n            <div class=\"ai-summary-users\">\n              @for (u of auditSummary()!.topUsers; track u.name) {\n                <span class=\"ai-summary-user-chip\">\n                  <mat-icon>person</mat-icon>\n                  {{ u.name }} <strong>({{ u.count }})</strong>\n                </span>\n              }\n            </div>\n          </div>\n        }\n\n        @if (auditSummary()!.highlights.length) {\n          <div class=\"ai-summary-section\">\n            <h4>{{ 'admin.admin-audit-page.highlights' | translate }}</h4>\n            <ul class=\"ai-summary-highlights\">\n              @for (h of auditSummary()!.highlights; track h) {\n                <li>{{ h }}</li>\n              }\n            </ul>\n          </div>\n        }\n      }\n    </section>\n  }\n\n  <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 Audit Table \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n  @if (loading()) {\n    <div class=\"audit-center\">\n      <mat-spinner diameter=\"40\" [attr.aria-label]=\"'admin.admin-audit-page.loading' | translate\" />\n    </div>\n  } @else {\n    <div class=\"audit-table-wrap mat-elevation-z1\">\n      <table mat-table [dataSource]=\"entries()\" class=\"audit-table\">\n        <ng-container matColumnDef=\"action\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-audit-page.performed-action' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let e\">{{ actionLabel(e) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"date\">\n          <th mat-header-cell *matHeaderCellDef>{{ 'admin.admin-audit-page.date' | translate }}</th>\n          <td mat-cell *matCellDef=\"let e\">{{ e.eventDate | date: 'medium' }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"username\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-audit-page.username' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let e\">{{ e.principalName }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"category\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-audit-page.category' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let e\">{{ e.category }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"document\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-audit-page.document' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let e\">{{ e.docPath || '\u2014' }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"comment\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'admin.admin-audit-page.comment' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let e\">{{ e.comment || '\u2014' }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"columns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: columns\"></tr>\n      </table>\n    </div>\n    <div class=\"audit-pager\">\n      <button type=\"button\" mat-button (click)=\"prevPage()\" [disabled]=\"pageIndex() === 0\">\n        {{ 'admin.admin-audit-page.previous' | translate }}\n      </button>\n      <span>{{ 'common.page-number' | translate: { page: pageIndex() + 1 } }}</span>\n      <button\n        type=\"button\"\n        mat-button\n        (click)=\"nextPage()\"\n        [disabled]=\"(pageIndex() + 1) * 50 >= totalSize()\"\n      >\n        {{ 'admin.admin-audit-page.next' | translate }}\n      </button>\n    </div>\n  }\n</div>\n", styles: ["/* \u2500\u2500\u2500\u2500\u2500 Tokens \u2500\u2500\u2500\u2500\u2500 */\n$ai-purple: #7c3aed;\n$ai-purple-light: #ede9fe;\n$ai-purple-border: #c4b5fd;\n$sev-high: #dc2626;\n$sev-high-bg: #fef2f2;\n$sev-med: #f59e0b;\n$sev-med-bg: #fffbeb;\n$sev-low: #3b82f6;\n$sev-low-bg: #eff6ff;\n\n@keyframes ai-fade-in {\n  from {\n    opacity: 0;\n    transform: translateY(-6px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n@keyframes ai-shimmer {\n  0% {\n    background-position: -200% 0;\n  }\n  100% {\n    background-position: 200% 0;\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500 Page layout \u2500\u2500\u2500\u2500\u2500 */\n.audit-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1280px;\n}\n\n.audit-page__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 1rem;\n}\n\n.audit-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   AI Anomaly Detection Banner\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.ai-anomaly-banner {\n  background: linear-gradient(135deg, $ai-purple-light 0%, #f5f3ff 50%, #faf5ff 100%);\n  border: 1px solid $ai-purple-border;\n  border-radius: 12px;\n  padding: 1rem 1.25rem;\n  margin-bottom: 1.25rem;\n  animation: ai-fade-in 0.4s ease-out;\n}\n\n.ai-anomaly-banner__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ai-anomaly-banner__title-row {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.ai-sparkle-icon {\n  color: $ai-purple;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.ai-anomaly-banner__title {\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: $ai-purple;\n}\n\n.ai-anomaly-banner__actions {\n  display: flex;\n  gap: 0.25rem;\n}\n\n.ai-anomaly-badge {\n  font-size: 0.7rem;\n  font-weight: 600;\n  padding: 2px 8px;\n  border-radius: 10px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n\n  &--high {\n    background: $sev-high;\n    color: #fff;\n  }\n}\n\n.ai-anomaly-banner__summary {\n  font-size: 0.85rem;\n  color: rgba(0, 0, 0, 0.7);\n  margin: 0.5rem 0;\n  line-height: 1.5;\n}\n\n.ai-anomaly-banner__empty {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem 0 0.25rem;\n  font-size: 0.875rem;\n  color: #16a34a;\n\n  mat-icon {\n    color: #16a34a;\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n/* Anomaly cards */\n.ai-anomaly-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 0.75rem;\n  margin-top: 0.5rem;\n}\n\n.ai-anomaly-card {\n  border-radius: 8px;\n  padding: 0.75rem;\n  border-left: 4px solid transparent;\n  transition: box-shadow 0.2s;\n\n  &--high {\n    background: $sev-high-bg;\n    border-left-color: $sev-high;\n  }\n  &--medium {\n    background: $sev-med-bg;\n    border-left-color: $sev-med;\n  }\n  &--low {\n    background: $sev-low-bg;\n    border-left-color: $sev-low;\n  }\n\n  &:hover {\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  }\n}\n\n.ai-anomaly-card__header {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.35rem;\n}\n\n.sev-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n\n  &--high {\n    color: $sev-high;\n  }\n  &--medium {\n    color: $sev-med;\n  }\n  &--low {\n    color: $sev-low;\n  }\n}\n\n.ai-anomaly-card__severity {\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n\n.ai-anomaly-card__time {\n  margin-left: auto;\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.45);\n}\n\n.ai-anomaly-card__desc {\n  font-size: 0.8rem;\n  line-height: 1.45;\n  margin: 0;\n  color: rgba(0, 0, 0, 0.75);\n}\n\n.ai-anomaly-card__events {\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.45);\n  margin-top: 0.35rem;\n}\n\n/* Skeleton loading */\n.ai-anomaly-banner__skeleton {\n  padding: 0.5rem 0;\n}\n\n.ai-skeleton-bar {\n  height: 12px;\n  border-radius: 6px;\n  background: linear-gradient(90deg, #e9e5f5 25%, #f3f0fa 50%, #e9e5f5 75%);\n  background-size: 200% 100%;\n  animation: ai-shimmer 1.5s infinite;\n\n  &--long {\n    width: 70%;\n    margin-bottom: 0.75rem;\n  }\n}\n\n.ai-skeleton-row {\n  display: flex;\n  gap: 0.75rem;\n}\n\n.ai-skeleton-card {\n  flex: 1;\n  height: 64px;\n  border-radius: 8px;\n  background: linear-gradient(90deg, #e9e5f5 25%, #f3f0fa 50%, #e9e5f5 75%);\n  background-size: 200% 100%;\n  animation: ai-shimmer 1.5s infinite;\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   AI Natural Language Search\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.ai-nl-search {\n  margin-bottom: 1rem;\n  animation: ai-fade-in 0.35s ease-out 0.1s both;\n}\n\n.ai-nl-search__input-row {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  background: #f8f7ff;\n  border: 1px solid $ai-purple-border;\n  border-radius: 10px;\n  padding: 0.35rem 0.5rem 0.35rem 0.75rem;\n  transition:\n    border-color 0.2s,\n    box-shadow 0.2s;\n\n  &:focus-within {\n    border-color: $ai-purple;\n    box-shadow: 0 0 0 3px rgba($ai-purple, 0.1);\n  }\n}\n\n.ai-nl-search__icon {\n  color: $ai-purple;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  flex-shrink: 0;\n}\n\n.ai-nl-search__input {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 0.875rem;\n  color: rgba(0, 0, 0, 0.85);\n  padding: 0.35rem 0;\n\n  &::placeholder {\n    color: rgba(0, 0, 0, 0.4);\n  }\n}\n\n.ai-nl-search__spinner {\n  flex-shrink: 0;\n}\n\n.ai-nl-search__explanation {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.4rem;\n  margin-top: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  background: #fefce8;\n  border-radius: 8px;\n  font-size: 0.8rem;\n  color: rgba(0, 0, 0, 0.7);\n  line-height: 1.45;\n  animation: ai-fade-in 0.3s ease-out;\n\n  mat-icon {\n    color: #ca8a04;\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    flex-shrink: 0;\n    margin-top: 1px;\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500 Standard Filters \u2500\u2500\u2500\u2500\u2500 */\n.audit-filters {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--admin-space-2, 0.75rem);\n  align-items: center;\n  margin-bottom: 1rem;\n\n  mat-form-field {\n    min-width: 160px;\n    flex: 1 1 160px;\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500 Results toolbar \u2500\u2500\u2500\u2500\u2500 */\n.audit-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.5rem;\n}\n\n.audit-meta {\n  font-size: 0.9rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  margin: 0;\n}\n\n.ai-summarize-btn {\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  color: $ai-purple !important;\n  border-color: $ai-purple-border !important;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &:hover:not([disabled]) {\n    background: $ai-purple-light !important;\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   AI Summary Panel\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.ai-summary-panel {\n  background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);\n  border: 1px solid $ai-purple-border;\n  border-radius: 12px;\n  padding: 1rem 1.25rem;\n  margin-bottom: 1rem;\n  animation: ai-fade-in 0.35s ease-out;\n}\n\n.ai-summary-panel__header {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 600;\n  font-size: 0.95rem;\n  color: $ai-purple;\n  margin-bottom: 0.5rem;\n\n  button {\n    margin-left: auto;\n  }\n}\n\n.ai-summary-panel__loading {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.5rem 0;\n  font-size: 0.85rem;\n  color: rgba(0, 0, 0, 0.55);\n}\n\n.ai-summary-panel__text {\n  font-size: 0.85rem;\n  line-height: 1.55;\n  color: rgba(0, 0, 0, 0.75);\n  margin: 0 0 0.75rem;\n}\n\n.ai-summary-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem;\n  margin-bottom: 0.75rem;\n}\n\n.ai-summary-stat-card {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  background: #fff;\n  border: 1px solid rgba($ai-purple, 0.15);\n  border-radius: 8px;\n  padding: 0.5rem 0.75rem;\n  min-width: 120px;\n\n  mat-icon {\n    color: $ai-purple;\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n.ai-summary-stat-card__body {\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-summary-stat-card__value {\n  font-size: 1rem;\n  font-weight: 700;\n  color: rgba(0, 0, 0, 0.85);\n  line-height: 1.2;\n}\n\n.ai-summary-stat-card__label {\n  font-size: 0.7rem;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.ai-summary-section {\n  margin-top: 0.5rem;\n\n  h4 {\n    font-size: 0.8rem;\n    font-weight: 600;\n    color: rgba(0, 0, 0, 0.65);\n    margin: 0 0 0.35rem;\n  }\n}\n\n.ai-summary-users {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.ai-summary-user-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  background: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 16px;\n  padding: 0.2rem 0.65rem;\n  font-size: 0.75rem;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    color: rgba(0, 0, 0, 0.4);\n  }\n}\n\n.ai-summary-highlights {\n  margin: 0;\n  padding-left: 1.25rem;\n  font-size: 0.8rem;\n  line-height: 1.6;\n  color: rgba(0, 0, 0, 0.7);\n}\n\n/* \u2500\u2500\u2500\u2500\u2500 Table \u2500\u2500\u2500\u2500\u2500 */\n.audit-table-wrap {\n  overflow: auto;\n  max-height: 560px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.audit-table {\n  width: 100%;\n  font-size: 0.875rem;\n\n  th.mat-mdc-header-cell,\n  td.mat-mdc-cell {\n    padding-top: var(--admin-row-padding-y, 0.68rem);\n    padding-bottom: var(--admin-row-padding-y, 0.68rem);\n  }\n}\n\n.audit-center {\n  display: flex;\n  justify-content: center;\n  padding: 2rem;\n}\n\n.audit-pager {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  margin-top: 0.75rem;\n}\n\n.audit-page .mat-mdc-form-field {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.audit-page .mat-mdc-unelevated-button,\n.audit-page .mat-mdc-outlined-button,\n.audit-page .mat-mdc-button {\n  min-height: var(--admin-control-height, 40px);\n}\n\n@media (max-width: 900px) {\n  .audit-page {\n    padding: 1rem;\n  }\n\n  .ai-anomaly-cards {\n    grid-template-columns: 1fr;\n  }\n\n  .ai-summary-stats {\n    flex-direction: column;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminAuditPageComponent, { className: "AdminAuditPageComponent", filePath: "libs/features/administration/src/lib/admin-audit-page/admin-audit-page.component.ts", lineNumber: 54 }); })();
