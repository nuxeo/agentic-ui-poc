import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AdministrationService, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { AiGatewayService, AiFeatureFlagService, } from '@agentic-ui/shared/ai-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/tabs";
import * as i7 from "@angular/material/table";
import * as i8 from "@angular/material/progress-spinner";
const _c0 = a0 => ({ tool: a0 });
const _c1 = () => ["type", "count"];
const _c2 = (a0, a1) => ({ shown: a0, total: a1 });
const _forTrack0 = ($index, $item) => $item.description;
function AdminAnalyticsPageComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.distribution-analytics-is-disabled-because-the"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "mat-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.loading"));
} }
function AdminAnalyticsPageComponent_Conditional_22_th_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.primary-type"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_22_td_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, row_r2.type));
} }
function AdminAnalyticsPageComponent_Conditional_22_th_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.count"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_22_td_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r3.count);
} }
function AdminAnalyticsPageComponent_Conditional_22_tr_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 26);
} }
function AdminAnalyticsPageComponent_Conditional_22_tr_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 27);
} }
function AdminAnalyticsPageComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "table", 17);
    i0.ɵɵelementContainerStart(6, 18);
    i0.ɵɵtemplate(7, AdminAnalyticsPageComponent_Conditional_22_th_7_Template, 3, 3, "th", 19)(8, AdminAnalyticsPageComponent_Conditional_22_td_8_Template, 3, 3, "td", 20);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(9, 21);
    i0.ɵɵtemplate(10, AdminAnalyticsPageComponent_Conditional_22_th_10_Template, 3, 3, "th", 19)(11, AdminAnalyticsPageComponent_Conditional_22_td_11_Template, 2, 1, "td", 20);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(12, AdminAnalyticsPageComponent_Conditional_22_tr_12_Template, 1, 0, "tr", 22)(13, AdminAnalyticsPageComponent_Conditional_22_tr_13_Template, 1, 0, "tr", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 15);
    i0.ɵɵlistener("click", function AdminAnalyticsPageComponent_Conditional_22_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r1); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.refreshDistribution()); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 6, "admin.admin-analytics-page.total-documents-under-this-path"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.totalUnderPath() ?? "\u2014");
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r3.typeRows());
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("matHeaderRowDef", i0.ɵɵpureFunction0(10, _c1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", i0.ɵɵpureFunction0(11, _c1));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 8, "admin.admin-analytics-page.refresh"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "mat-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.loading"));
} }
function AdminAnalyticsPageComponent_Conditional_32_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.path"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_32_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(doc_r5.path);
} }
function AdminAnalyticsPageComponent_Conditional_32_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.type"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_32_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, doc_r6.type));
} }
function AdminAnalyticsPageComponent_Conditional_32_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 24);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.modified"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_32_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r7 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, doc_r7.lastModified, "medium"));
} }
function AdminAnalyticsPageComponent_Conditional_32_tr_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 26);
} }
function AdminAnalyticsPageComponent_Conditional_32_tr_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 27);
} }
function AdminAnalyticsPageComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 28)(4, "table", 29);
    i0.ɵɵelementContainerStart(5, 30);
    i0.ɵɵtemplate(6, AdminAnalyticsPageComponent_Conditional_32_th_6_Template, 3, 3, "th", 19)(7, AdminAnalyticsPageComponent_Conditional_32_td_7_Template, 2, 1, "td", 20);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 18);
    i0.ɵɵtemplate(9, AdminAnalyticsPageComponent_Conditional_32_th_9_Template, 3, 3, "th", 19)(10, AdminAnalyticsPageComponent_Conditional_32_td_10_Template, 3, 3, "td", 20);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 31);
    i0.ɵɵtemplate(12, AdminAnalyticsPageComponent_Conditional_32_th_12_Template, 3, 3, "th", 19)(13, AdminAnalyticsPageComponent_Conditional_32_td_13_Template, 3, 4, "td", 20);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(14, AdminAnalyticsPageComponent_Conditional_32_tr_14_Template, 1, 0, "tr", 22)(15, AdminAnalyticsPageComponent_Conditional_32_tr_15_Template, 1, 0, "tr", 23);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 4, "admin.analytics.showing-of-total", i0.ɵɵpureFunction2(7, _c2, ctx_r3.repoDocs().length, ctx_r3.repoTotal())), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("dataSource", ctx_r3.repoDocs());
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r3.repoColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r3.repoColumns);
} }
function AdminAnalyticsPageComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "mat-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.loading"));
} }
function AdminAnalyticsPageComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 15);
    i0.ɵɵlistener("click", function AdminAnalyticsPageComponent_Conditional_52_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.refreshWorkflow()); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, "admin.admin-analytics-page.documents-with-workflow-related-primary-types"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.wfTotal() ?? "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 5, "admin.admin-analytics-page.refresh"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_53_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 41);
    i0.ɵɵtext(1, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "admin.admin-analytics-page.ai-audit-anomalies"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 40);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "admin.admin-analytics-page.loading"));
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "auto_awesome");
    i0.ɵɵelementEnd();
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵelement(1, "mat-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.loading"));
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_For_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 48);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const anomaly_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(anomaly_r10.timestamp);
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45)(1, "div", 46)(2, "span", 47);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "uppercase");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_For_2_Conditional_5_Template, 2, 1, "span", 48);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 49);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const anomaly_r10 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵstyleProp("border-left-color", ctx_r3.severityColor(anomaly_r10.severity));
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("color", ctx_r3.severityColor(anomaly_r10.severity));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, anomaly_r10.severity));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(anomaly_r10.timestamp ? 5 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(anomaly_r10.description);
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43);
    i0.ɵɵrepeaterCreate(1, AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_For_2_Template, 8, 9, "div", 44, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r3.aiAnomalies());
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.no-anomalies-detected-your-system-looks"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42)(1, "mat-icon");
    i0.ɵɵtext(2, "info");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_5_Template, 3, 0, "div", 43)(6, AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Conditional_6_Template, 3, 3, "p", 13);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.aiAnomalySummary());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.aiAnomalies().length ? 5 : 6);
} }
function AdminAnalyticsPageComponent_Conditional_53_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-analytics-page.click-scan-for-anomalies-to-run"), " ");
} }
function AdminAnalyticsPageComponent_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-tab");
    i0.ɵɵtemplate(1, AdminAnalyticsPageComponent_Conditional_53_ng_template_1_Template, 4, 3, "ng-template", 32);
    i0.ɵɵelementStart(2, "div", 6)(3, "div", 33)(4, "mat-form-field", 34)(5, "mat-label");
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "select", 35);
    i0.ɵɵlistener("ngModelChange", function AdminAnalyticsPageComponent_Conditional_53_Template_select_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.aiAnomalyTimeRange.set($event)); });
    i0.ɵɵelementStart(9, "option", 36);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option", 37);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 38);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "button", 39);
    i0.ɵɵlistener("click", function AdminAnalyticsPageComponent_Conditional_53_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r9); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.runAnomalyDetection()); });
    i0.ɵɵconditionalCreate(19, AdminAnalyticsPageComponent_Conditional_53_Conditional_19_Template, 2, 3, "mat-spinner", 40)(20, AdminAnalyticsPageComponent_Conditional_53_Conditional_20_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(23, AdminAnalyticsPageComponent_Conditional_53_Conditional_23_Template, 3, 3, "div", 11)(24, AdminAnalyticsPageComponent_Conditional_53_Conditional_24_Template, 7, 2)(25, AdminAnalyticsPageComponent_Conditional_53_Conditional_25_Template, 3, 3, "p", 13);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 9, "admin.admin-analytics-page.time-range"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r3.aiAnomalyTimeRange());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 11, "admin.admin-analytics-page.last-24-hours"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 13, "admin.admin-analytics-page.last-7-days"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 15, "admin.admin-analytics-page.last-30-days"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.aiAnomalyLoading());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.aiAnomalyLoading() ? 19 : 20);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 17, "administration.admin-analytics-page.scan-for-anomalies"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.aiAnomalyLoading() ? 23 : ctx_r3.aiAnomalySummary() ? 24 : 25);
} }
function escapeNxqlLiteral(s) {
    return s.replace(/'/g, "''");
}
export class AdminAnalyticsPageComponent {
    adminApi = inject(AdministrationService);
    translate = inject(TranslateService);
    aiGateway = inject(AiGatewayService);
    featureFlags = inject(AiFeatureFlagService);
    distPath = signal('/default-domain/', ...(ngDevMode ? [{ debugName: "distPath" }] : []));
    repoPath = signal('/default-domain/', ...(ngDevMode ? [{ debugName: "repoPath" }] : []));
    distLoading = signal(false, ...(ngDevMode ? [{ debugName: "distLoading" }] : []));
    repoLoading = signal(false, ...(ngDevMode ? [{ debugName: "repoLoading" }] : []));
    wfLoading = signal(false, ...(ngDevMode ? [{ debugName: "wfLoading" }] : []));
    distributionWarning = signal(false, ...(ngDevMode ? [{ debugName: "distributionWarning" }] : []));
    totalUnderPath = signal(null, ...(ngDevMode ? [{ debugName: "totalUnderPath" }] : []));
    typeRows = signal([], ...(ngDevMode ? [{ debugName: "typeRows" }] : []));
    repoDocs = signal([], ...(ngDevMode ? [{ debugName: "repoDocs" }] : []));
    repoTotal = signal(0, ...(ngDevMode ? [{ debugName: "repoTotal" }] : []));
    searchMetricTotal = signal(null, ...(ngDevMode ? [{ debugName: "searchMetricTotal" }] : []));
    wfTotal = signal(null, ...(ngDevMode ? [{ debugName: "wfTotal" }] : []));
    repoColumns = ['path', 'type', 'modified'];
    aiAnomalies = signal([], ...(ngDevMode ? [{ debugName: "aiAnomalies" }] : []));
    aiAnomalySummary = signal('', ...(ngDevMode ? [{ debugName: "aiAnomalySummary" }] : []));
    aiAnomalyLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiAnomalyLoading" }] : []));
    aiAnomalyTimeRange = signal('24h', ...(ngDevMode ? [{ debugName: "aiAnomalyTimeRange" }] : []));
    primaryTypes = ['Folder', 'File', 'Note', 'Picture', 'Workspace', 'Collection'];
    ngOnInit() {
        this.adminApi.getDefaultDomainPath().subscribe({
            next: (p) => {
                const prefix = p.endsWith('/') ? p : `${p}/`;
                this.distPath.set(prefix);
                this.repoPath.set(prefix);
                this.refreshDistribution();
                this.refreshRepositorySample();
                this.refreshSearchMetric();
                this.refreshWorkflow();
            },
            error: () => {
                this.refreshDistribution();
                this.refreshRepositorySample();
                this.refreshSearchMetric();
                this.refreshWorkflow();
            },
        });
    }
    refreshDistribution() {
        const raw = this.distPath().trim() || '/default-domain/';
        const path = raw.endsWith('/') ? raw : `${raw}/`;
        this.distPath.set(path);
        const p = escapeNxqlLiteral(path);
        const base = `ecm:path STARTSWITH '${p}' AND ecm:isVersion = 0 AND ecm:isTrashed = 0 AND ecm:mixinType != 'HiddenInNavigation'`;
        const warn = path === '/default-domain/' || path === '/default-domain';
        this.distributionWarning.set(warn);
        if (warn) {
            this.totalUnderPath.set(null);
            this.typeRows.set([]);
            return;
        }
        this.distLoading.set(true);
        const totalQ = `SELECT * FROM Document WHERE ${base}`;
        const countObs = [
            this.adminApi.getNxqlTotalSize(totalQ),
            ...this.primaryTypes.map((t) => this.adminApi.getNxqlTotalSize(`SELECT * FROM Document WHERE ${base} AND ecm:primaryType = '${t}'`)),
        ];
        forkJoin(countObs).subscribe({
            next: (nums) => {
                const [total, ...counts] = nums;
                this.totalUnderPath.set(total);
                this.typeRows.set(this.primaryTypes.map((type, i) => ({ type, count: counts[i] ?? 0 })));
                this.distLoading.set(false);
            },
            error: () => {
                this.distLoading.set(false);
                this.totalUnderPath.set(null);
                this.typeRows.set([]);
            },
        });
    }
    refreshRepositorySample() {
        const raw = this.repoPath().trim() || '/default-domain/';
        const path = raw.endsWith('/') ? raw : `${raw}/`;
        this.repoPath.set(path);
        const p = escapeNxqlLiteral(path);
        const q = `SELECT * FROM Document WHERE ecm:path STARTSWITH '${p}' AND ecm:isVersion = 0 ` +
            `AND ecm:isTrashed = 0 ORDER BY dc:modified DESC`;
        this.repoLoading.set(true);
        this.adminApi.nxqlSearch(q, 25, 0).subscribe({
            next: (list) => {
                this.repoDocs.set(list.entries ?? []);
                this.repoTotal.set(list.totalSize ?? list.entries?.length ?? 0);
                this.repoLoading.set(false);
            },
            error: () => {
                this.repoDocs.set([]);
                this.repoTotal.set(0);
                this.repoLoading.set(false);
            },
        });
    }
    refreshSearchMetric() {
        const q = `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 ` +
            `AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
        this.adminApi.getNxqlTotalSize(q).subscribe({
            next: (n) => this.searchMetricTotal.set(n),
            error: () => this.searchMetricTotal.set(null),
        });
    }
    runAnomalyDetection() {
        this.aiAnomalyLoading.set(true);
        this.aiGateway.detectAnomalies(this.aiAnomalyTimeRange()).subscribe({
            next: (res) => {
                this.aiAnomalies.set(res.anomalies);
                this.aiAnomalySummary.set(res.summary);
                this.aiAnomalyLoading.set(false);
            },
            error: () => {
                this.aiAnomalies.set([]);
                this.aiAnomalySummary.set(this.translate.instant('admin.message.failed-to-detect-anomalies'));
                this.aiAnomalyLoading.set(false);
            },
        });
    }
    severityColor(severity) {
        return severity === 'high' ? '#d32f2f' : severity === 'medium' ? '#ed6c02' : '#2e7d32';
    }
    refreshWorkflow() {
        const q = `SELECT * FROM Document WHERE ecm:primaryType IN ('DocumentRoute', 'Route', 'RoutingTask')`;
        this.wfLoading.set(true);
        this.adminApi.getNxqlTotalSize(q).subscribe({
            next: (n) => {
                this.wfTotal.set(n);
                this.wfLoading.set(false);
            },
            error: () => {
                this.wfTotal.set(null);
                this.wfLoading.set(false);
            },
        });
    }
    static ɵfac = function AdminAnalyticsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminAnalyticsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminAnalyticsPageComponent, selectors: [["lib-admin-analytics-page"]], decls: 54, vars: 45, consts: [[1, "admin-page"], [1, "admin-page__header"], ["role", "heading", "aria-level", "1", 1, "admin-page__title"], ["type", "button", "mat-icon-button", ""], ["animationDuration", "0ms", 1, "admin-tabs"], [3, "label"], [1, "tab-pad"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "path-field"], ["matInput", "", "name", "distPath", 3, "ngModelChange", "blur", "ngModel"], ["matPrefix", ""], ["role", "status", 1, "callout", "callout--warn"], [1, "center"], ["matInput", "", "name", "repoPath", 3, "ngModelChange", "blur", "keydown.enter", "ngModel"], [1, "muted"], [1, "body"], ["type", "button", "mat-stroked-button", "", 3, "click"], ["diameter", "36"], ["mat-table", "", 1, "mini-table", "mat-elevation-z0", 3, "dataSource"], ["matColumnDef", "type"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "count"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", ""], ["mat-cell", ""], ["mat-header-row", ""], ["mat-row", ""], [1, "table-scroll", "mat-elevation-z1"], ["mat-table", "", 1, "mini-table", 3, "dataSource"], ["matColumnDef", "path"], ["matColumnDef", "modified"], ["mat-tab-label", ""], [1, "anomaly-controls"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "time-range-field"], ["matNativeControl", "", 3, "ngModelChange", "ngModel"], ["value", "24h"], ["value", "7d"], ["value", "30d"], ["type", "button", "mat-flat-button", "", 1, "ai-scan-btn", 3, "click", "disabled"], ["diameter", "18"], [1, "ai-tab-icon"], [1, "anomaly-summary"], [1, "anomaly-list"], [1, "anomaly-card", 3, "border-left-color"], [1, "anomaly-card"], [1, "anomaly-header"], [1, "anomaly-severity"], [1, "anomaly-time"], [1, "anomaly-desc"]], template: function AdminAnalyticsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "button", 3);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementStart(7, "mat-icon");
            i0.ɵɵtext(8, "search");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(9, "mat-tab-group", 4)(10, "mat-tab", 5);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementStart(12, "div", 6)(13, "mat-form-field", 7)(14, "mat-label");
            i0.ɵɵtext(15);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "input", 8);
            i0.ɵɵlistener("ngModelChange", function AdminAnalyticsPageComponent_Template_input_ngModelChange_17_listener($event) { return ctx.distPath.set($event); })("blur", function AdminAnalyticsPageComponent_Template_input_blur_17_listener() { return ctx.refreshDistribution(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-icon", 9);
            i0.ɵɵtext(19, "folder");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(20, AdminAnalyticsPageComponent_Conditional_20_Template, 3, 3, "div", 10)(21, AdminAnalyticsPageComponent_Conditional_21_Template, 3, 3, "div", 11)(22, AdminAnalyticsPageComponent_Conditional_22_Template, 17, 12);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "mat-tab", 5);
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵelementStart(25, "div", 6)(26, "mat-form-field", 7)(27, "mat-label");
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "input", 12);
            i0.ɵɵlistener("ngModelChange", function AdminAnalyticsPageComponent_Template_input_ngModelChange_30_listener($event) { return ctx.repoPath.set($event); })("blur", function AdminAnalyticsPageComponent_Template_input_blur_30_listener() { return ctx.refreshRepositorySample(); })("keydown.enter", function AdminAnalyticsPageComponent_Template_input_keydown_enter_30_listener() { return ctx.refreshRepositorySample(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(31, AdminAnalyticsPageComponent_Conditional_31_Template, 3, 3, "div", 11)(32, AdminAnalyticsPageComponent_Conditional_32_Template, 16, 10);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(33, "mat-tab", 5);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵelementStart(35, "div", 6)(36, "p", 13);
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementStart(39, "strong");
            i0.ɵɵtext(40);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(41, "p", 14);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵpipe(44, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "button", 15);
            i0.ɵɵlistener("click", function AdminAnalyticsPageComponent_Template_button_click_45_listener() { return ctx.refreshSearchMetric(); });
            i0.ɵɵtext(46);
            i0.ɵɵpipe(47, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(48, "mat-tab", 5);
            i0.ɵɵpipe(49, "translate");
            i0.ɵɵelementStart(50, "div", 6);
            i0.ɵɵconditionalCreate(51, AdminAnalyticsPageComponent_Conditional_51_Template, 3, 3, "div", 11)(52, AdminAnalyticsPageComponent_Conditional_52_Template, 8, 7);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(53, AdminAnalyticsPageComponent_Conditional_53_Template, 26, 19, "mat-tab");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 18, "admin.admin-analytics-page.analytics"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 20, "admin.admin-analytics-page.search-placeholder"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(11, 22, "admin.analytics.tab.document-distribution"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 24, "admin.admin-analytics-page.path"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.distPath());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.distributionWarning() ? 20 : ctx.distLoading() ? 21 : 22);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(24, 26, "admin.analytics.tab.repository-content"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 28, "admin.admin-analytics-page.path-prefix"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.repoPath());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.repoLoading() ? 31 : 32);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(34, 30, "admin.analytics.tab.search"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(38, 32, "admin.admin-analytics-page.indexed-documents-non-hidden-non-proxy"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.searchMetricTotal() ?? "\u2014");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(44, 36, "admin.admin-analytics-page.mirrors-nxql-search", i0.ɵɵpureFunction1(43, _c0, i0.ɵɵpipeBind1(43, 34, "admin.admin-analytics-page.nxql-search"))), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(47, 39, "admin.admin-analytics-page.refresh"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(49, 41, "admin.analytics.tab.workflow"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.wfLoading() ? 51 : 52);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 53 : -1);
        } }, dependencies: [FormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, i2.MatIconButton, MatIconModule, i3.MatIcon, MatInputModule, i4.MatInput, i5.MatFormField, i5.MatLabel, i5.MatPrefix, MatFormFieldModule,
            MatTabsModule, i6.MatTabLabel, i6.MatTab, i6.MatTabGroup, MatTableModule, i7.MatTable, i7.MatHeaderCellDef, i7.MatHeaderRowDef, i7.MatColumnDef, i7.MatCellDef, i7.MatRowDef, i7.MatHeaderCell, i7.MatCell, i7.MatHeaderRow, i7.MatRow, MatProgressSpinnerModule, i8.MatProgressSpinner, DocTypeLabelPipe,
            TranslatePipe,
            DatePipe,
            UpperCasePipe], styles: [".admin-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1100px;\n}\n\n.admin-page__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.5rem;\n}\n\n.admin-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.admin-tabs[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n}\n\n.tab-pad[_ngcontent-%COMP%] {\n  padding: 1rem 0 1.5rem;\n}\n\n.path-field[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 480px;\n}\n\n.callout[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  border-radius: 4px;\n  border-left: 4px solid var(--mat-sys-tertiary, #ff9800);\n  background: var(--mat-sys-surface-container-high, #f5f5f5);\n  margin-bottom: 1rem;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n\n.muted[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  font-size: 0.95rem;\n}\n\n.body[_ngcontent-%COMP%] {\n  max-width: 52ch;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.8));\n}\n\n.center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1rem;\n}\n\n.mini-table[_ngcontent-%COMP%] {\n  width: 100%;\n  margin: 1rem 0;\n}\n\n.table-scroll[_ngcontent-%COMP%] {\n  overflow: auto;\n  max-height: 420px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.admin-page[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%] {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.admin-page[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%], \n.admin-page[_ngcontent-%COMP%]   .mat-mdc-outlined-button[_ngcontent-%COMP%], \n.admin-page[_ngcontent-%COMP%]   .mat-mdc-button[_ngcontent-%COMP%] {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.mini-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.mini-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n@media (max-width: 900px) {\n  .admin-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n}\n\n.ai-tab-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  margin-right: 6px;\n  color: #7c4dff;\n}\n\n.anomaly-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  margin-bottom: 16px;\n}\n\n.time-range-field[_ngcontent-%COMP%] {\n  min-width: 160px;\n}\n\n.ai-scan-btn[_ngcontent-%COMP%] {\n  min-height: 56px;\n  background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n  color: #fff;\n  border-radius: 8px;\n  font-weight: 500;\n  white-space: nowrap;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n\n  mat-icon {\n    margin-right: 4px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 18px !important;\n    height: 18px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 18px !important;\n      height: 18px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.anomaly-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-low, #f8f9fc);\n  margin-bottom: 16px;\n  font-size: 14px;\n  line-height: 1.5;\n\n  mat-icon {\n    color: #7c4dff;\n    flex-shrink: 0;\n    margin-top: 2px;\n  }\n}\n\n.anomaly-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.anomaly-card[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-left: 4px solid;\n}\n\n.anomaly-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 6px;\n}\n\n.anomaly-severity[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n\n.anomaly-time[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n}\n\n.anomaly-desc[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminAnalyticsPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-analytics-page', standalone: true, imports: [
                    DocTypeLabelPipe,
                    TranslatePipe,
                    DatePipe,
                    UpperCasePipe,
                    FormsModule,
                    MatButtonModule,
                    MatIconModule,
                    MatInputModule,
                    MatFormFieldModule,
                    MatTabsModule,
                    MatTableModule,
                    MatProgressSpinnerModule,
                ], template: "<div class=\"admin-page\">\n  <header class=\"admin-page__header\">\n    <div class=\"admin-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-analytics-page.analytics' | translate }}\n    </div>\n    <button\n      type=\"button\"\n      mat-icon-button\n      [attr.aria-label]=\"'admin.admin-analytics-page.search-placeholder' | translate\"\n    >\n      <mat-icon>search</mat-icon>\n    </button>\n  </header>\n\n  <mat-tab-group animationDuration=\"0ms\" class=\"admin-tabs\">\n    <mat-tab [label]=\"'admin.analytics.tab.document-distribution' | translate\">\n      <div class=\"tab-pad\">\n        <mat-form-field appearance=\"outline\" class=\"path-field\" subscriptSizing=\"dynamic\">\n          <mat-label>{{ 'admin.admin-analytics-page.path' | translate }}</mat-label>\n          <input\n            matInput\n            name=\"distPath\"\n            [ngModel]=\"distPath()\"\n            (ngModelChange)=\"distPath.set($event)\"\n            (blur)=\"refreshDistribution()\"\n          />\n          <mat-icon matPrefix>folder</mat-icon>\n        </mat-form-field>\n\n        @if (distributionWarning()) {\n          <div class=\"callout callout--warn\" role=\"status\">\n            {{\n              'admin.admin-analytics-page.distribution-analytics-is-disabled-because-the'\n                | translate\n            }}\n          </div>\n        } @else if (distLoading()) {\n          <div class=\"center\">\n            <mat-spinner\n              diameter=\"36\"\n              [attr.aria-label]=\"'admin.admin-analytics-page.loading' | translate\"\n            />\n          </div>\n        } @else {\n          <p class=\"muted\">\n            {{ 'admin.admin-analytics-page.total-documents-under-this-path' | translate }}\n            <strong>{{ totalUnderPath() ?? '\u2014' }}</strong>\n          </p>\n          <table mat-table [dataSource]=\"typeRows()\" class=\"mini-table mat-elevation-z0\">\n            <ng-container matColumnDef=\"type\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-analytics-page.primary-type' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ row.type | docTypeLabel }}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"count\">\n              <th mat-header-cell *matHeaderCellDef>\n                {{ 'admin.admin-analytics-page.count' | translate }}\n              </th>\n              <td mat-cell *matCellDef=\"let row\">{{ row.count }}</td>\n            </ng-container>\n            <tr mat-header-row *matHeaderRowDef=\"['type', 'count']\"></tr>\n            <tr mat-row *matRowDef=\"let row; columns: ['type', 'count']\"></tr>\n          </table>\n          <button type=\"button\" mat-stroked-button (click)=\"refreshDistribution()\">\n            {{ 'admin.admin-analytics-page.refresh' | translate }}\n          </button>\n        }\n      </div>\n    </mat-tab>\n\n    <mat-tab [label]=\"'admin.analytics.tab.repository-content' | translate\">\n      <div class=\"tab-pad\">\n        <mat-form-field appearance=\"outline\" class=\"path-field\" subscriptSizing=\"dynamic\">\n          <mat-label>{{ 'admin.admin-analytics-page.path-prefix' | translate }}</mat-label>\n          <input\n            matInput\n            name=\"repoPath\"\n            [ngModel]=\"repoPath()\"\n            (ngModelChange)=\"repoPath.set($event)\"\n            (blur)=\"refreshRepositorySample()\"\n            (keydown.enter)=\"refreshRepositorySample()\"\n          />\n        </mat-form-field>\n        @if (repoLoading()) {\n          <div class=\"center\">\n            <mat-spinner\n              diameter=\"36\"\n              [attr.aria-label]=\"'admin.admin-analytics-page.loading' | translate\"\n            />\n          </div>\n        } @else {\n          <p class=\"muted\">\n            {{\n              'admin.analytics.showing-of-total'\n                | translate: { shown: repoDocs().length, total: repoTotal() }\n            }}\n          </p>\n          <div class=\"table-scroll mat-elevation-z1\">\n            <table mat-table [dataSource]=\"repoDocs()\" class=\"mini-table\">\n              <ng-container matColumnDef=\"path\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-analytics-page.path' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let doc\">{{ doc.path }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"type\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-analytics-page.type' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let doc\">{{ doc.type | docTypeLabel }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"modified\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-analytics-page.modified' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let doc\">{{ doc.lastModified | date: 'medium' }}</td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"repoColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: repoColumns\"></tr>\n            </table>\n          </div>\n        }\n      </div>\n    </mat-tab>\n\n    <mat-tab [label]=\"'admin.analytics.tab.search' | translate\">\n      <div class=\"tab-pad\">\n        <p class=\"muted\">\n          {{ 'admin.admin-analytics-page.indexed-documents-non-hidden-non-proxy' | translate }}\n          <strong>{{ searchMetricTotal() ?? '\u2014' }}</strong>\n        </p>\n        <p class=\"body\">\n          {{\n            'admin.admin-analytics-page.mirrors-nxql-search'\n              | translate: { tool: 'admin.admin-analytics-page.nxql-search' | translate }\n          }}\n        </p>\n        <button type=\"button\" mat-stroked-button (click)=\"refreshSearchMetric()\">\n          {{ 'admin.admin-analytics-page.refresh' | translate }}\n        </button>\n      </div>\n    </mat-tab>\n\n    <mat-tab [label]=\"'admin.analytics.tab.workflow' | translate\">\n      <div class=\"tab-pad\">\n        @if (wfLoading()) {\n          <div class=\"center\">\n            <mat-spinner\n              diameter=\"36\"\n              [attr.aria-label]=\"'admin.admin-analytics-page.loading' | translate\"\n            />\n          </div>\n        } @else {\n          <p class=\"muted\">\n            {{\n              'admin.admin-analytics-page.documents-with-workflow-related-primary-types' | translate\n            }}\n            <strong>{{ wfTotal() ?? '\u2014' }}</strong>\n          </p>\n          <button type=\"button\" mat-stroked-button (click)=\"refreshWorkflow()\">\n            {{ 'admin.admin-analytics-page.refresh' | translate }}\n          </button>\n        }\n      </div>\n    </mat-tab>\n    @if (featureFlags.aiEnabled()) {\n      <mat-tab>\n        <ng-template mat-tab-label>\n          <mat-icon class=\"ai-tab-icon\">auto_awesome</mat-icon>\n          {{ 'admin.admin-analytics-page.ai-audit-anomalies' | translate }}\n        </ng-template>\n        <div class=\"tab-pad\">\n          <div class=\"anomaly-controls\">\n            <mat-form-field appearance=\"outline\" class=\"time-range-field\" subscriptSizing=\"dynamic\">\n              <mat-label>{{ 'admin.admin-analytics-page.time-range' | translate }}</mat-label>\n              <select\n                matNativeControl\n                [ngModel]=\"aiAnomalyTimeRange()\"\n                (ngModelChange)=\"aiAnomalyTimeRange.set($event)\"\n              >\n                <option value=\"24h\">\n                  {{ 'admin.admin-analytics-page.last-24-hours' | translate }}\n                </option>\n                <option value=\"7d\">\n                  {{ 'admin.admin-analytics-page.last-7-days' | translate }}\n                </option>\n                <option value=\"30d\">\n                  {{ 'admin.admin-analytics-page.last-30-days' | translate }}\n                </option>\n              </select>\n            </mat-form-field>\n            <button\n              type=\"button\"\n              mat-flat-button\n              class=\"ai-scan-btn\"\n              [disabled]=\"aiAnomalyLoading()\"\n              (click)=\"runAnomalyDetection()\"\n            >\n              @if (aiAnomalyLoading()) {\n                <mat-spinner\n                  diameter=\"18\"\n                  [attr.aria-label]=\"'admin.admin-analytics-page.loading' | translate\"\n                ></mat-spinner>\n              } @else {\n                <mat-icon>auto_awesome</mat-icon>\n              }\n              {{ 'administration.admin-analytics-page.scan-for-anomalies' | translate }}\n            </button>\n          </div>\n\n          @if (aiAnomalyLoading()) {\n            <div class=\"center\">\n              <mat-spinner\n                diameter=\"36\"\n                [attr.aria-label]=\"'admin.admin-analytics-page.loading' | translate\"\n              />\n            </div>\n          } @else if (aiAnomalySummary()) {\n            <div class=\"anomaly-summary\">\n              <mat-icon>info</mat-icon>\n              <span>{{ aiAnomalySummary() }}</span>\n            </div>\n            @if (aiAnomalies().length) {\n              <div class=\"anomaly-list\">\n                @for (anomaly of aiAnomalies(); track anomaly.description) {\n                  <div\n                    class=\"anomaly-card\"\n                    [style.border-left-color]=\"severityColor(anomaly.severity)\"\n                  >\n                    <div class=\"anomaly-header\">\n                      <span\n                        class=\"anomaly-severity\"\n                        [style.color]=\"severityColor(anomaly.severity)\"\n                        >{{ anomaly.severity | uppercase }}</span\n                      >\n                      @if (anomaly.timestamp) {\n                        <span class=\"anomaly-time\">{{ anomaly.timestamp }}</span>\n                      }\n                    </div>\n                    <p class=\"anomaly-desc\">{{ anomaly.description }}</p>\n                  </div>\n                }\n              </div>\n            } @else {\n              <p class=\"muted\">\n                {{\n                  'admin.admin-analytics-page.no-anomalies-detected-your-system-looks' | translate\n                }}\n              </p>\n            }\n          } @else {\n            <p class=\"muted\">\n              {{ 'admin.admin-analytics-page.click-scan-for-anomalies-to-run' | translate }}\n            </p>\n          }\n        </div>\n      </mat-tab>\n    }\n  </mat-tab-group>\n</div>\n", styles: [".admin-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1100px;\n}\n\n.admin-page__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.5rem;\n}\n\n.admin-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.admin-tabs {\n  margin-top: 0.5rem;\n}\n\n.tab-pad {\n  padding: 1rem 0 1.5rem;\n}\n\n.path-field {\n  width: 100%;\n  max-width: 480px;\n}\n\n.callout {\n  padding: 0.75rem 1rem;\n  border-radius: 4px;\n  border-left: 4px solid var(--mat-sys-tertiary, #ff9800);\n  background: var(--mat-sys-surface-container-high, #f5f5f5);\n  margin-bottom: 1rem;\n  font-size: 0.9rem;\n  line-height: 1.4;\n}\n\n.muted {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n  font-size: 0.95rem;\n}\n\n.body {\n  max-width: 52ch;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.8));\n}\n\n.center {\n  display: flex;\n  justify-content: center;\n  padding: 1rem;\n}\n\n.mini-table {\n  width: 100%;\n  margin: 1rem 0;\n}\n\n.table-scroll {\n  overflow: auto;\n  max-height: 420px;\n  border-radius: var(--admin-radius-1, 8px);\n}\n\n.admin-page .mat-mdc-form-field {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.admin-page .mat-mdc-unelevated-button,\n.admin-page .mat-mdc-outlined-button,\n.admin-page .mat-mdc-button {\n  min-height: var(--admin-control-height, 40px);\n}\n\n.mini-table th.mat-mdc-header-cell,\n.mini-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n@media (max-width: 900px) {\n  .admin-page {\n    padding: 1rem;\n  }\n}\n\n.ai-tab-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  margin-right: 6px;\n  color: #7c4dff;\n}\n\n.anomaly-controls {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  margin-bottom: 16px;\n}\n\n.time-range-field {\n  min-width: 160px;\n}\n\n.ai-scan-btn {\n  min-height: 56px;\n  background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n  color: #fff;\n  border-radius: 8px;\n  font-weight: 500;\n  white-space: nowrap;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n\n  mat-icon {\n    margin-right: 4px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 18px !important;\n    height: 18px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 18px !important;\n      height: 18px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.anomaly-summary {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container-low, #f8f9fc);\n  margin-bottom: 16px;\n  font-size: 14px;\n  line-height: 1.5;\n\n  mat-icon {\n    color: #7c4dff;\n    flex-shrink: 0;\n    margin-top: 2px;\n  }\n}\n\n.anomaly-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.anomaly-card {\n  padding: 12px 16px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-left: 4px solid;\n}\n\n.anomaly-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 6px;\n}\n\n.anomaly-severity {\n  font-size: 11px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n\n.anomaly-time {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n}\n\n.anomaly-desc {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminAnalyticsPageComponent, { className: "AdminAnalyticsPageComponent", filePath: "libs/features/administration/src/lib/admin-analytics-page/admin-analytics-page.component.ts", lineNumber: 47 }); })();
