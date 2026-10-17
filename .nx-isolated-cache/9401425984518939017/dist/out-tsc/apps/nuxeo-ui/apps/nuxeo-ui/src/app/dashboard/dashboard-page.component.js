import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkAriaLive } from '@angular/cdk/a11y';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { WidgetContainerComponent, WidgetGridComponent } from '@nuxeo/satori-platform/ui';
import { DocumentService, DocumentDetailService, TaskService, CollectionService, docTypeIcon, docTypeLabel, FOLDERISH_TYPES, avatarColor, formatRelativeTime, } from '@nuxeo/satori-platform/nuxeo-client';
import { AuthService } from '../auth/auth.service';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { AiGatewayService, AiFeatureFlagService, aiErrorMessage, } from '@agentic-ui/shared/ai-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/progress-spinner";
import * as i4 from "@angular/material/tooltip";
import * as i5 from "@hylandsoftware/satori-ui/avatar";
const _c0 = a0 => ({ count: a0 });
const _c1 = () => [1, 2, 3];
const _forTrack0 = ($index, $item) => $item.text;
const _forTrack1 = ($index, $item) => $item.uid;
const _forTrack2 = ($index, $item) => $item.id;
function DashboardPageComponent_Conditional_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r0.aiInsights().length === 1 ? "common.count.actionable-item-one" : "common.count.actionable-item-many", i0.ɵɵpureFunction1(4, _c0, ctx_r0.aiInsights().length)));
} }
function DashboardPageComponent_Conditional_1_Conditional_9_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22);
    i0.ɵɵelement(1, "div", 23)(2, "div", 24);
    i0.ɵɵelementEnd();
} }
function DashboardPageComponent_Conditional_1_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵrepeaterCreate(1, DashboardPageComponent_Conditional_1_Conditional_9_For_2_Template, 3, 0, "div", 22, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(0, _c1));
} }
function DashboardPageComponent_Conditional_1_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21)(1, "mat-icon");
    i0.ɵɵtext(2, "cloud_off");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.aiInsightsError(), " ");
} }
function DashboardPageComponent_Conditional_1_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21)(1, "mat-icon");
    i0.ɵɵtext(2, "check_circle");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "app.dashboard-page.all-clear-no-insights-right-now"), " ");
} }
function DashboardPageComponent_Conditional_1_Conditional_12_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 26);
    i0.ɵɵlistener("click", function DashboardPageComponent_Conditional_1_Conditional_12_For_2_Template_button_click_0_listener() { const insight_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.navigateToInsight(insight_r3.link)); });
    i0.ɵɵelementStart(1, "div", 27)(2, "span", 28)(3, "mat-icon");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 29);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p", 30);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 31);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementStart(12, "mat-icon", 32);
    i0.ɵɵtext(13, "arrow_forward");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const insight_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("high", insight_r3.priority === "high")("medium", insight_r3.priority === "medium")("low", insight_r3.priority === "low");
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap(insight_r3.priority);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.insightIcon(insight_r3.icon));
    i0.ɵɵadvance();
    i0.ɵɵclassMap(insight_r3.priority);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(insight_r3.priority);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(insight_r3.text);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 14, "app.dashboard-page.view-details"), " ");
} }
function DashboardPageComponent_Conditional_1_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵrepeaterCreate(1, DashboardPageComponent_Conditional_1_Conditional_12_For_2_Template, 14, 16, "button", 25, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.aiInsights());
} }
function DashboardPageComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "div", 15)(2, "div", 16)(3, "mat-icon", 17);
    i0.ɵɵtext(4, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 18);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, DashboardPageComponent_Conditional_1_Conditional_8_Template, 3, 6, "span", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, DashboardPageComponent_Conditional_1_Conditional_9_Template, 3, 1, "div", 20)(10, DashboardPageComponent_Conditional_1_Conditional_10_Template, 4, 1, "div", 21)(11, DashboardPageComponent_Conditional_1_Conditional_11_Template, 5, 3, "div", 21)(12, DashboardPageComponent_Conditional_1_Conditional_12_Template, 3, 0, "div", 20);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 3, "app.dashboard-page.ai-insights"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r0.aiInsightsLoading() && ctx_r0.aiInsights().length > 0 ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.aiInsightsLoading() ? 9 : ctx_r0.aiInsightsError() ? 10 : ctx_r0.aiInsights().length === 0 ? 11 : 12);
} }
function DashboardPageComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.loading"));
} }
function DashboardPageComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.recentlyEditedError());
} }
function DashboardPageComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.no-recent-edits"));
} }
function DashboardPageComponent_Conditional_8_For_14_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 38);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function DashboardPageComponent_Conditional_8_For_14_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.docIcon(doc_r5));
} }
function DashboardPageComponent_Conditional_8_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 35);
    i0.ɵɵlistener("click", function DashboardPageComponent_Conditional_8_For_14_Template_tr_click_0_listener() { const doc_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.navigateToDoc(doc_r5)); });
    i0.ɵɵelementStart(1, "td", 36)(2, "div", 37);
    i0.ɵɵconditionalCreate(3, DashboardPageComponent_Conditional_8_For_14_Conditional_3_Template, 1, 1, "img", 38)(4, DashboardPageComponent_Conditional_8_For_14_Conditional_4_Template, 2, 1, "mat-icon", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 40);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td", 41);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td", 42)(11, "span", 43);
    i0.ɵɵelement(12, "sat-avatar", 44);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_11_0;
    const doc_r5 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_11_0 = ctx_r0.thumbnailMap()[doc_r5.uid]) ? 3 : 4, tmp_11_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r5.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(9, 7, doc_r5.lastModified, "mediumDate"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("initials", ctx_r0.lastContributor(doc_r5))("category", ctx_r0.avatarColor(ctx_r0.lastContributor(doc_r5)))("borderless", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.lastContributor(doc_r5), " ");
} }
function DashboardPageComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 7)(1, "thead")(2, "tr")(3, "th");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵrepeaterCreate(13, DashboardPageComponent_Conditional_8_For_14_Template, 14, 10, "tr", 34, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "app.dashboard-page.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "app.dashboard-page.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "app.dashboard-page.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.recentlyEdited());
} }
function DashboardPageComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.loading"));
} }
function DashboardPageComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.tasksError());
} }
function DashboardPageComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.no-pending-tasks"));
} }
function DashboardPageComponent_Conditional_14_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const task_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.taskDocTitle(task_r7));
} }
function DashboardPageComponent_Conditional_14_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 46);
    i0.ɵɵlistener("click", function DashboardPageComponent_Conditional_14_For_2_Template_div_click_0_listener() { const task_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.goToTask(task_r7)); });
    i0.ɵɵelementStart(1, "div", 47);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, DashboardPageComponent_Conditional_14_For_2_Conditional_3_Template, 2, 1, "div", 48);
    i0.ɵɵelementStart(4, "div", 49);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementStart(7, "span", 50);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 51);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const task_r7 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.taskLabel(task_r7));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.taskDocTitle(task_r7) ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("task-overdue", ctx_r0.isOverdue(task_r7));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 7, "app.dashboard-page.due"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.relativeTime(task_r7.dueDate));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.taskWorkflow(task_r7));
} }
function DashboardPageComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵrepeaterCreate(1, DashboardPageComponent_Conditional_14_For_2_Template, 11, 9, "div", 45, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.tasks());
} }
function DashboardPageComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.loading"));
} }
function DashboardPageComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.recentlyViewedError());
} }
function DashboardPageComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.no-recently-viewed-items"), " ");
} }
function DashboardPageComponent_Conditional_20_For_14_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 38);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function DashboardPageComponent_Conditional_20_For_14_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r9 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.docIcon(doc_r9));
} }
function DashboardPageComponent_Conditional_20_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 35);
    i0.ɵɵlistener("click", function DashboardPageComponent_Conditional_20_For_14_Template_tr_click_0_listener() { const doc_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.navigateToDoc(doc_r9)); });
    i0.ɵɵelementStart(1, "td", 36)(2, "div", 37);
    i0.ɵɵconditionalCreate(3, DashboardPageComponent_Conditional_20_For_14_Conditional_3_Template, 1, 1, "img", 38)(4, DashboardPageComponent_Conditional_20_For_14_Conditional_4_Template, 2, 1, "mat-icon", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 40);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td")(8, "span", 52);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "td", 41);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_11_0;
    const doc_r9 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_11_0 = ctx_r0.thumbnailMap()[doc_r9.uid]) ? 3 : 4, tmp_11_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r9.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.docTypeLabel(doc_r9));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.relativeTime(doc_r9.lastModified));
} }
function DashboardPageComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 7)(1, "thead")(2, "tr")(3, "th");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵrepeaterCreate(13, DashboardPageComponent_Conditional_20_For_14_Template, 12, 4, "tr", 34, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "app.dashboard-page.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "app.dashboard-page.type"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "app.dashboard-page.last-viewed"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.recentlyViewed());
} }
function DashboardPageComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "mat-spinner", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.loading"));
} }
function DashboardPageComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.favoritesError());
} }
function DashboardPageComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.dashboard-page.you-havent-starred-documents-yet"), " ");
} }
function DashboardPageComponent_Conditional_26_For_14_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 38);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function DashboardPageComponent_Conditional_26_For_14_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r11 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.docIcon(doc_r11));
} }
function DashboardPageComponent_Conditional_26_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 35);
    i0.ɵɵlistener("click", function DashboardPageComponent_Conditional_26_For_14_Template_tr_click_0_listener() { const doc_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.navigateToDoc(doc_r11)); });
    i0.ɵɵelementStart(1, "td", 36)(2, "div", 37);
    i0.ɵɵconditionalCreate(3, DashboardPageComponent_Conditional_26_For_14_Conditional_3_Template, 1, 1, "img", 38)(4, DashboardPageComponent_Conditional_26_For_14_Conditional_4_Template, 2, 1, "mat-icon", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 40);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td", 41);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td", 42)(11, "span", 43);
    i0.ɵɵelement(12, "sat-avatar", 44);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_11_0;
    const doc_r11 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_11_0 = ctx_r0.thumbnailMap()[doc_r11.uid]) ? 3 : 4, tmp_11_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r11.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(9, 7, doc_r11.lastModified, "mediumDate"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("initials", ctx_r0.lastContributor(doc_r11))("category", ctx_r0.avatarColor(ctx_r0.lastContributor(doc_r11)))("borderless", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.lastContributor(doc_r11), " ");
} }
function DashboardPageComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 7)(1, "thead")(2, "tr")(3, "th");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th");
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵrepeaterCreate(13, DashboardPageComponent_Conditional_26_For_14_Template, 14, 10, "tr", 34, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "app.dashboard-page.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 5, "app.dashboard-page.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "app.dashboard-page.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.favorites());
} }
export class DashboardPageComponent {
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    router = inject(Router);
    dialog = inject(MatDialog);
    docService = inject(DocumentService);
    taskService = inject(TaskService);
    collectionService = inject(CollectionService);
    detailService = inject(DocumentDetailService);
    auth = inject(AuthService);
    aiGateway = inject(AiGatewayService);
    featureFlags = inject(AiFeatureFlagService);
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    recentlyEdited = signal([], ...(ngDevMode ? [{ debugName: "recentlyEdited" }] : []));
    recentlyEditedLoading = signal(true, ...(ngDevMode ? [{ debugName: "recentlyEditedLoading" }] : []));
    recentlyEditedError = signal(null, ...(ngDevMode ? [{ debugName: "recentlyEditedError" }] : []));
    tasks = signal([], ...(ngDevMode ? [{ debugName: "tasks" }] : []));
    tasksLoading = signal(true, ...(ngDevMode ? [{ debugName: "tasksLoading" }] : []));
    tasksError = signal(null, ...(ngDevMode ? [{ debugName: "tasksError" }] : []));
    recentlyViewed = signal([], ...(ngDevMode ? [{ debugName: "recentlyViewed" }] : []));
    recentlyViewedLoading = signal(true, ...(ngDevMode ? [{ debugName: "recentlyViewedLoading" }] : []));
    recentlyViewedError = signal(null, ...(ngDevMode ? [{ debugName: "recentlyViewedError" }] : []));
    favorites = signal([], ...(ngDevMode ? [{ debugName: "favorites" }] : []));
    favoritesLoading = signal(true, ...(ngDevMode ? [{ debugName: "favoritesLoading" }] : []));
    favoritesError = signal(null, ...(ngDevMode ? [{ debugName: "favoritesError" }] : []));
    aiInsights = signal([], ...(ngDevMode ? [{ debugName: "aiInsights" }] : []));
    aiInsightsLoading = signal(true, ...(ngDevMode ? [{ debugName: "aiInsightsLoading" }] : []));
    aiInsightsError = signal(null, ...(ngDevMode ? [{ debugName: "aiInsightsError" }] : []));
    constructor() {
        this.destroyRef.onDestroy(() => this.revokeThumbnails());
        const userId = this.auth.username() ?? 'Administrator';
        this.docService.getRecentlyEdited(10).subscribe({
            next: (res) => {
                this.recentlyEdited.set(res.entries);
                this.recentlyEditedLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => {
                this.recentlyEditedError.set(this.translate.instant('app.message.failed-to-load-recently-edited-documents'));
                this.recentlyEditedLoading.set(false);
            },
        });
        this.taskService.getUserTasks(userId, 10).subscribe({
            next: (entries) => {
                this.tasks.set(entries);
                this.tasksLoading.set(false);
            },
            error: () => {
                this.tasksError.set(this.translate.instant('tasks.message.failed-to-load-tasks'));
                this.tasksLoading.set(false);
            },
        });
        this.docService.getRecentlyViewed(userId, 10).subscribe({
            next: (res) => {
                this.recentlyViewed.set(res.entries);
                this.recentlyViewedLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => {
                this.recentlyViewedError.set(this.translate.instant('app.message.failed-to-load-recently-viewed-documents'));
                this.recentlyViewedLoading.set(false);
            },
        });
        this.collectionService.getFavorites(userId, 10).subscribe({
            next: (res) => {
                this.favorites.set(res.entries);
                this.favoritesLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => {
                this.favoritesError.set(this.translate.instant('app.message.failed-to-load-favorite-items'));
                this.favoritesLoading.set(false);
            },
        });
        // The banner is already hidden by the same flag, but hiding it never stopped the request:
        // an opted-out user still had their dashboard sent to `AI.Insights` on every load.
        if (!this.featureFlags.aiEnabled()) {
            this.aiInsightsLoading.set(false);
            return;
        }
        this.aiGateway.getInsights(userId).subscribe({
            next: (res) => {
                this.aiInsights.set(res.insights);
                this.aiInsightsLoading.set(false);
            },
            error: (err) => {
                this.aiInsightsError.set(aiErrorMessage(err, this.translate.instant('app.message.ai-insights-unavailable')));
                this.aiInsightsLoading.set(false);
            },
        });
    }
    navigateToDoc(doc) {
        if (doc.type === 'Collection') {
            void this.router.navigate(['/collections', doc.uid]);
            return;
        }
        if (FOLDERISH_TYPES.has(doc.type)) {
            void this.router.navigate(['/browse' + doc.path]);
            return;
        }
        void this.router.navigate(['/doc', doc.uid]);
    }
    openCreateImport() {
        void import('@agentic-ui/feature-browse').then((m) => {
            this.dialog
                .open(m.CreateImportDialogComponent, {
                width: '960px',
                height: '680px',
                maxWidth: '95vw',
                maxHeight: '95vh',
                data: {},
            })
                .afterClosed()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((result) => {
                if (result?.navigateToUrl) {
                    if (result.navigateToUrl.startsWith('/doc/')) {
                        const uid = result.navigateToUrl.slice('/doc/'.length);
                        void this.router.navigate(['/doc', uid], {
                            queryParams: { fresh: '1' },
                            state: {
                                freshBlobDocument: true,
                                freshNote: result.freshNote === true,
                            },
                        });
                    }
                    else {
                        void this.router.navigateByUrl(result.navigateToUrl);
                    }
                    return;
                }
                const browsePath = result?.navigateToPath?.replace(/\/+$/, '');
                if (browsePath && browsePath !== '/') {
                    void this.router.navigateByUrl(`/browse${browsePath}`);
                    return;
                }
                if (result?.navigateToUid) {
                    void this.router.navigate(['/doc', result.navigateToUid], {
                        queryParams: { fresh: '1' },
                        state: {
                            freshBlobDocument: true,
                            freshNote: result.freshNote === true,
                        },
                    });
                    return;
                }
                if (result?.refreshed && result.path) {
                    const parts = result.path.replace(/^\/+/, '').split('/').filter(Boolean);
                    void this.router.navigate(['/browse', ...parts]);
                }
            });
        });
    }
    docIcon(doc) {
        return docTypeIcon(doc.type);
    }
    docTypeLabel(doc) {
        return docTypeLabel(doc.type ?? 'File', (key) => this.translate.instant(key));
    }
    lastContributor(doc) {
        return doc.properties['dc:lastContributor'] ?? '';
    }
    avatarColor(name) {
        return avatarColor(name);
    }
    taskLabel(task) {
        const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\./g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    taskDocTitle(task) {
        return task.targetDocTitle ?? '';
    }
    taskWorkflow(task) {
        const raw = task.workflowTitle || task.workflowModelName;
        const key = raw.replace(/^wf\.\w+\./, '');
        return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    isOverdue(task) {
        return !!task.dueDate && new Date(task.dueDate) < new Date();
    }
    /**
     * Localised by `Intl.RelativeTimeFormat`, which also covers the future case this used to
     * spell as `in ${label}` — a positive offset produces "in 3 days" in each language's own
     * word order. See `formatRelativeTime`.
     */
    relativeTime(dateStr) {
        return formatRelativeTime(dateStr, this.translate.currentLang);
    }
    goToTask(task) {
        this.router.navigate(['/tasks', task.id]);
    }
    insightIcon(icon) {
        const map = {
            task: 'assignment',
            document: 'description',
            warning: 'warning',
            info: 'info',
            workflow: 'account_tree',
        };
        return map[icon] ?? 'info';
    }
    insightPriorityColor(priority) {
        return priority === 'high' ? '#d32f2f' : priority === 'medium' ? '#ed6c02' : '#2e7d32';
    }
    navigateToInsight(link) {
        if (link)
            void this.router.navigateByUrl(link);
    }
    loadThumbnails(docs) {
        for (const doc of docs) {
            if (this.thumbnailMap()[doc.uid])
                continue;
            this.detailService
                .fetchThumbnail(doc.uid)
                // Both operators are load-bearing and both were missing. Without
                // `takeUntilDestroyed` the subscription outlives the component and writes to a
                // dead signal; without tracking the url for `revokeObjectURL` the blob is pinned
                // in memory for the life of the document. `loadThumbnails` is called from three
                // separate responses here, so a dashboard left open accumulated one un-revoked
                // blob per document per refresh.
                .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
                .subscribe((blob) => {
                if (!blob)
                    return;
                const url = URL.createObjectURL(blob);
                this.thumbnailMap.update((m) => {
                    const previous = m[doc.uid];
                    if (previous && previous !== url)
                        URL.revokeObjectURL(previous);
                    return {
                        ...m,
                        [doc.uid]: url,
                    };
                });
            });
        }
    }
    /**
     * Every blob URL currently owned by this page.
     *
     * `thumbnailMap` now stores the raw object-URL strings directly, so teardown derives from the map
     * itself and revokes each current entry on destroy.
     */
    revokeThumbnails() {
        for (const url of Object.values(this.thumbnailMap()))
            if (url)
                URL.revokeObjectURL(url);
    }
    static ɵfac = function DashboardPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DashboardPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DashboardPageComponent, selectors: [["app-dashboard-page"]], decls: 34, vars: 24, consts: [[1, "dashboard-page"], [1, "ai-insights-banner"], [3, "columns"], ["icon", "edit", "iconColor", "var(--mat-sys-primary)", 3, "title"], [1, "widget-loading"], [1, "widget-error"], [1, "widget-empty"], [1, "widget-table"], ["icon", "assignment", "iconColor", "var(--mat-sys-error)", 3, "title"], [1, "task-list"], ["icon", "visibility", "iconColor", "var(--mat-sys-secondary)", 3, "title"], ["icon", "star", "iconColor", "var(--mat-sys-tertiary)", 3, "title"], ["mat-fab", "", "color", "primary", "type", "button", "matTooltipPosition", "above", "matTooltipShowDelay", "300", 1, "dashboard-create-fab", 3, "click", "matTooltip"], ["cdkAriaLive", "off", 1, "cdk-visually-hidden"], ["aria-hidden", "true"], [1, "ai-banner-header"], [1, "ai-banner-title-row"], [1, "ai-banner-icon"], [1, "ai-banner-title"], [1, "ai-banner-count"], [1, "ai-kpi-row"], [1, "ai-banner-empty"], [1, "ai-kpi-card", "ai-kpi-card--skeleton"], [1, "skeleton-bar", "wide"], [1, "skeleton-bar", "medium"], [1, "ai-kpi-card", 3, "high", "medium", "low"], [1, "ai-kpi-card", 3, "click"], [1, "ai-kpi-top"], [1, "ai-kpi-icon-wrap"], [1, "ai-kpi-priority"], [1, "ai-kpi-text"], [1, "ai-kpi-action"], [1, "ai-kpi-arrow"], ["diameter", "28"], [1, "widget-row"], [1, "widget-row", 3, "click"], [1, "doc-title-cell"], [1, "doc-thumb"], ["alt", "", 1, "doc-thumb-img", 3, "src"], [1, "doc-thumb-icon"], [1, "doc-title"], [1, "doc-date"], [1, "doc-contributor"], [1, "contributor-cell"], ["size", "24", "aria-hidden", "true", 3, "initials", "category", "borderless"], [1, "task-card"], [1, "task-card", 3, "click"], [1, "task-action"], [1, "task-doc-title"], [1, "task-due"], [1, "task-due-value"], [1, "task-workflow"], [1, "type-label"]], template: function DashboardPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, DashboardPageComponent_Conditional_1_Template, 13, 5, "div", 1);
            i0.ɵɵelementStart(2, "lib-widget-grid", 2)(3, "lib-widget-container", 3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵconditionalCreate(5, DashboardPageComponent_Conditional_5_Template, 3, 3, "div", 4)(6, DashboardPageComponent_Conditional_6_Template, 2, 1, "div", 5)(7, DashboardPageComponent_Conditional_7_Template, 3, 3, "div", 6)(8, DashboardPageComponent_Conditional_8_Template, 15, 9, "table", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "lib-widget-container", 8);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵconditionalCreate(11, DashboardPageComponent_Conditional_11_Template, 3, 3, "div", 4)(12, DashboardPageComponent_Conditional_12_Template, 2, 1, "div", 5)(13, DashboardPageComponent_Conditional_13_Template, 3, 3, "div", 6)(14, DashboardPageComponent_Conditional_14_Template, 3, 0, "div", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "lib-widget-container", 10);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵconditionalCreate(17, DashboardPageComponent_Conditional_17_Template, 3, 3, "div", 4)(18, DashboardPageComponent_Conditional_18_Template, 2, 1, "div", 5)(19, DashboardPageComponent_Conditional_19_Template, 3, 3, "div", 6)(20, DashboardPageComponent_Conditional_20_Template, 15, 9, "table", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "lib-widget-container", 11);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵconditionalCreate(23, DashboardPageComponent_Conditional_23_Template, 3, 3, "div", 4)(24, DashboardPageComponent_Conditional_24_Template, 2, 1, "div", 5)(25, DashboardPageComponent_Conditional_25_Template, 3, 3, "div", 6)(26, DashboardPageComponent_Conditional_26_Template, 15, 9, "table", 7);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(27, "button", 12);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵlistener("click", function DashboardPageComponent_Template_button_click_27_listener() { return ctx.openCreateImport(); });
            i0.ɵɵelementStart(29, "span", 13);
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "mat-icon", 14);
            i0.ɵɵtext(33, "add");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", 2);
            i0.ɵɵadvance();
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(4, 12, "dashboard.recently-edited"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.recentlyEditedLoading() ? 5 : ctx.recentlyEditedError() ? 6 : ctx.recentlyEdited().length === 0 ? 7 : 8);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(10, 14, "dashboard.tasks"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.tasksLoading() ? 11 : ctx.tasksError() ? 12 : ctx.tasks().length === 0 ? 13 : 14);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(16, 16, "dashboard.recently-viewed"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.recentlyViewedLoading() ? 17 : ctx.recentlyViewedError() ? 18 : ctx.recentlyViewed().length === 0 ? 19 : 20);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("title", i0.ɵɵpipeBind1(22, 18, "dashboard.favorite-items"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.favoritesLoading() ? 23 : ctx.favoritesError() ? 24 : ctx.favorites().length === 0 ? 25 : 26);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(28, 20, "app.dashboard-page.create-or-import"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(31, 22, "app.dashboard-page.create-or-import"));
        } }, dependencies: [MatDialogModule,
            MatButtonModule, i1.MatFabButton, MatIconModule, i2.MatIcon, MatProgressSpinnerModule, i3.MatProgressSpinner, MatTooltipModule, i4.MatTooltip, CdkAriaLive,
            WidgetGridComponent,
            WidgetContainerComponent,
            SatTagModule,
            SatAvatarModule, i5.SatAvatar, TranslatePipe,
            DatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  background: #f4f5f7;\n}\n\n.dashboard-page[_ngcontent-%COMP%] {\n  position: relative;\n  padding: 0 8px 96px;\n  box-sizing: border-box;\n}\n\n\n\n\n\n\n.dashboard-create-fab.mat-mdc-fab[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 100;\n  right: max(40px, calc(24px + env(safe-area-inset-right, 0px)));\n  bottom: max(40px, calc(24px + env(safe-area-inset-bottom, 0px)));\n\n  --mdc-fab-container-color: var(--mat-sys-primary);\n  --mdc-fab-icon-color: var(--mat-sys-on-primary);\n  --mat-fab-foreground-color: var(--mat-sys-on-primary);\n\n  mat-icon {\n    color: var(--mat-sys-on-primary);\n  }\n}\n\n.widget-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-weight: 600;\n    color: #667085;\n    font-size: 11px;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    border-bottom: 1px solid #e8eaef;\n    position: sticky;\n    top: 0;\n    background: #ffffff;\n    z-index: 1;\n  }\n\n  td {\n    padding: 10px 20px;\n    color: #344054;\n    border-bottom: 1px solid #f2f4f7;\n    vertical-align: middle;\n  }\n\n  .empty-row {\n    text-align: center;\n    color: var(--mat-sys-on-surface-variant, #474551);\n    padding: 32px 20px;\n    font-size: 13px;\n  }\n}\n\n.widget-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px 20px;\n}\n\n.widget-error[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--mat-sys-error);\n  padding: 32px 20px;\n  font-size: 13px;\n}\n\n.widget-empty[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  padding: 32px 20px;\n  font-size: 13px;\n}\n\n.widget-row[_ngcontent-%COMP%] {\n  cursor: pointer;\n\n  &:hover {\n    background: #f9fafb;\n  }\n}\n\n.doc-title-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-thumb[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 32px;\n  height: 32px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border: 1px solid #e8e8e8;\n}\n\n.doc-thumb-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.doc-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #9e9e9e;\n}\n\n.doc-title[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  max-width: 220px;\n}\n\n.doc-date[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  color: #666;\n  font-size: 12px;\n}\n\n.contributor-cell[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: #344054;\n  white-space: nowrap;\n}\n\n.type-label[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 12px;\n  font-size: 11px;\n  font-weight: 500;\n  color: #3c4fe0;\n  background: #eef0fd;\n  white-space: nowrap;\n}\n\n.task-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n.task-card[_ngcontent-%COMP%] {\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n  line-height: 1.5;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f5f5f5);\n  }\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.task-action[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 13px;\n  color: #333;\n}\n\n.task-doc-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #555;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.task-due[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-top: 2px;\n}\n\n.task-due-value[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\n.task-overdue[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b02b36);\n\n  .task-due-value {\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n.task-workflow[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #666;\n  margin-top: 1px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   AI[_ngcontent-%COMP%]   Insights[_ngcontent-%COMP%]   Banner[_ngcontent-%COMP%]   \u2500\u2500\n//[_ngcontent-%COMP%]   NXENG-939[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   9067535242[_ngcontent-%COMP%]:   decorative[_ngcontent-%COMP%]   gradients[_ngcontent-%COMP%]   made[_ngcontent-%COMP%]   automated[_ngcontent-%COMP%]   contrast[_ngcontent-%COMP%]   checks\n//[_ngcontent-%COMP%]   \"Needs[_ngcontent-%COMP%]   review\".[_ngcontent-%COMP%]   Use[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   opaque[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]   surface[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   text[_ngcontent-%COMP%]   contrast[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   measurable.\n.ai-insights-banner[_ngcontent-%COMP%] {\n  margin: 24px 24px 0;\n  padding: 20px 24px 24px;\n  background: var(--mat-sys-surface-container-low, #f3f3f6);\n  border: 1px solid var(--mat-sys-outline-variant, #c8c6cc);\n  border-radius: 16px;\n}\n\n.ai-banner-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n\n.ai-banner-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ai-banner-icon[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary, #6750a4);\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n}\n\n.ai-banner-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  letter-spacing: -0.02em;\n}\n\n.ai-banner-count[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-primary, #6750a4);\n  font-weight: 500;\n  background: color-mix(in srgb, var(--mat-sys-primary, #6750a4) 8%, transparent);\n  padding: 3px 10px;\n  border-radius: 20px;\n}\n\n.ai-banner-empty[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0;\n  // IBM 9044252072 / NXENG-940 \u2014 empty copy tracks the themed banner surface (NXENG-939).\n  color: var(--mat-sys-on-surface-variant, #474551);\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: currentColor;\n  }\n}\n\n//[_ngcontent-%COMP%]   KPI[_ngcontent-%COMP%]   card[_ngcontent-%COMP%]   row\n.ai-kpi-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 14px;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  padding-bottom: 2px;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n.ai-kpi-card[_ngcontent-%COMP%] {\n  flex: 1 1 0;\n  min-width: 220px;\n  max-width: 320px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 16px 18px;\n  border-radius: 12px;\n  border: 1px solid #e8eaef;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  scroll-snap-align: start;\n  position: relative;\n  overflow: hidden;\n\n  &::after {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 3px;\n    height: 100%;\n    border-radius: 0 3px 3px 0;\n  }\n\n  &.high::after {\n    background: #d32f2f;\n  }\n  &.medium::after {\n    background: #ed6c02;\n  }\n  &.low::after {\n    background: #2e7d32;\n  }\n\n  &:hover {\n    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);\n    transform: translateY(-2px);\n\n    .ai-kpi-arrow {\n      transform: translateX(2px);\n    }\n  }\n}\n\n.ai-kpi-card--skeleton[_ngcontent-%COMP%] {\n  pointer-events: none;\n  min-height: 100px;\n\n  .skeleton-bar {\n    height: 12px;\n    border-radius: 6px;\n    background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);\n    background-size: 200% 100%;\n    animation: _ngcontent-%COMP%_skeleton-shimmer 1.5s infinite;\n\n    &.wide {\n      width: 90%;\n    }\n    &.medium {\n      width: 60%;\n    }\n  }\n}\n\n@keyframes _ngcontent-%COMP%_skeleton-shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n.ai-kpi-top[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ai-kpi-icon-wrap[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &.high {\n    background: #fdecea;\n    color: #d32f2f;\n  }\n  &.medium {\n    background: #fff3e0;\n    color: #ed6c02;\n  }\n  &.low {\n    background: #e8f5e9;\n    color: #2e7d32;\n  }\n}\n\n.ai-kpi-priority[_ngcontent-%COMP%] {\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding: 2px 8px;\n  border-radius: 4px;\n\n  &.high {\n    background: #fdecea;\n    color: #d32f2f;\n  }\n  &.medium {\n    background: #fff3e0;\n    color: #ed6c02;\n  }\n  &.low {\n    background: #e8f5e9;\n    color: #2e7d32;\n  }\n}\n\n.ai-kpi-text[_ngcontent-%COMP%] {\n  font-size: 13px;\n  line-height: 1.5;\n  color: #344054;\n  margin: 0;\n  flex: 1;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.ai-kpi-action[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 12px;\n  font-weight: 600;\n  color: #7c4dff;\n  margin-top: auto;\n}\n\n.ai-kpi-arrow[_ngcontent-%COMP%] {\n  font-size: 14px !important;\n  width: 14px !important;\n  height: 14px !important;\n  transition: transform 0.2s ease;\n}\n\n@media (max-width: 900px) {\n  .ai-insights-banner[_ngcontent-%COMP%] {\n    margin: 16px 16px 0;\n    padding: 16px;\n  }\n\n  .ai-kpi-card[_ngcontent-%COMP%] {\n    min-width: 200px;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DashboardPageComponent, [{
        type: Component,
        args: [{ selector: 'app-dashboard-page', standalone: true, imports: [
                    TranslatePipe,
                    DatePipe,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                    CdkAriaLive,
                    WidgetGridComponent,
                    WidgetContainerComponent,
                    SatTagModule,
                    SatAvatarModule,
                ], template: "<div class=\"dashboard-page\">\n  <!-- AI Insights Banner -->\n  @if (featureFlags.aiEnabled()) {\n    <div class=\"ai-insights-banner\">\n      <div class=\"ai-banner-header\">\n        <div class=\"ai-banner-title-row\">\n          <mat-icon class=\"ai-banner-icon\">auto_awesome</mat-icon>\n          <span class=\"ai-banner-title\">{{ 'app.dashboard-page.ai-insights' | translate }}</span>\n        </div>\n        @if (!aiInsightsLoading() && aiInsights().length > 0) {\n          <span class=\"ai-banner-count\">{{\n            (aiInsights().length === 1\n              ? 'common.count.actionable-item-one'\n              : 'common.count.actionable-item-many'\n            ) | translate: { count: aiInsights().length }\n          }}</span>\n        }\n      </div>\n\n      @if (aiInsightsLoading()) {\n        <div class=\"ai-kpi-row\">\n          @for (i of [1, 2, 3]; track i) {\n            <div class=\"ai-kpi-card ai-kpi-card--skeleton\">\n              <div class=\"skeleton-bar wide\"></div>\n              <div class=\"skeleton-bar medium\"></div>\n            </div>\n          }\n        </div>\n      } @else if (aiInsightsError()) {\n        <div class=\"ai-banner-empty\">\n          <mat-icon>cloud_off</mat-icon>\n          {{ aiInsightsError() }}\n        </div>\n      } @else if (aiInsights().length === 0) {\n        <div class=\"ai-banner-empty\">\n          <mat-icon>check_circle</mat-icon>\n          {{ 'app.dashboard-page.all-clear-no-insights-right-now' | translate }}\n        </div>\n      } @else {\n        <div class=\"ai-kpi-row\">\n          @for (insight of aiInsights(); track insight.text) {\n            <button\n              class=\"ai-kpi-card\"\n              [class.high]=\"insight.priority === 'high'\"\n              [class.medium]=\"insight.priority === 'medium'\"\n              [class.low]=\"insight.priority === 'low'\"\n              (click)=\"navigateToInsight(insight.link)\"\n            >\n              <div class=\"ai-kpi-top\">\n                <span class=\"ai-kpi-icon-wrap\" [class]=\"insight.priority\">\n                  <mat-icon>{{ insightIcon(insight.icon) }}</mat-icon>\n                </span>\n                <span class=\"ai-kpi-priority\" [class]=\"insight.priority\">{{\n                  insight.priority\n                }}</span>\n              </div>\n              <p class=\"ai-kpi-text\">{{ insight.text }}</p>\n              <span class=\"ai-kpi-action\">\n                {{ 'app.dashboard-page.view-details' | translate }}\n                <mat-icon class=\"ai-kpi-arrow\">arrow_forward</mat-icon>\n              </span>\n            </button>\n          }\n        </div>\n      }\n    </div>\n  }\n\n  <lib-widget-grid [columns]=\"2\">\n    <lib-widget-container\n      [title]=\"'dashboard.recently-edited' | translate\"\n      icon=\"edit\"\n      iconColor=\"var(--mat-sys-primary)\"\n    >\n      @if (recentlyEditedLoading()) {\n        <div class=\"widget-loading\">\n          <mat-spinner diameter=\"28\" [attr.aria-label]=\"'app.dashboard-page.loading' | translate\" />\n        </div>\n      } @else if (recentlyEditedError()) {\n        <div class=\"widget-error\">{{ recentlyEditedError() }}</div>\n      } @else if (recentlyEdited().length === 0) {\n        <div class=\"widget-empty\">{{ 'app.dashboard-page.no-recent-edits' | translate }}</div>\n      } @else {\n        <table class=\"widget-table\">\n          <thead>\n            <tr>\n              <th>{{ 'app.dashboard-page.title' | translate }}</th>\n              <th>{{ 'app.dashboard-page.modified' | translate }}</th>\n              <th>{{ 'app.dashboard-page.last-contributor' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (doc of recentlyEdited(); track doc.uid) {\n              <tr class=\"widget-row\" (click)=\"navigateToDoc(doc)\">\n                <td class=\"doc-title-cell\">\n                  <div class=\"doc-thumb\">\n                    @if (thumbnailMap()[doc.uid]; as thumb) {\n                      <img [src]=\"thumb\" alt=\"\" class=\"doc-thumb-img\" />\n                    } @else {\n                      <mat-icon class=\"doc-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n                    }\n                  </div>\n                  <span class=\"doc-title\">{{ doc.title }}</span>\n                </td>\n                <td class=\"doc-date\">{{ doc.lastModified | date: 'mediumDate' }}</td>\n                <td class=\"doc-contributor\">\n                  <span class=\"contributor-cell\">\n                    <sat-avatar\n                      [initials]=\"lastContributor(doc)\"\n                      [category]=\"avatarColor(lastContributor(doc))\"\n                      size=\"24\"\n                      [borderless]=\"true\"\n                      aria-hidden=\"true\"\n                    />\n                    {{ lastContributor(doc) }}\n                  </span>\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      }\n    </lib-widget-container>\n\n    <lib-widget-container\n      [title]=\"'dashboard.tasks' | translate\"\n      icon=\"assignment\"\n      iconColor=\"var(--mat-sys-error)\"\n    >\n      @if (tasksLoading()) {\n        <div class=\"widget-loading\">\n          <mat-spinner diameter=\"28\" [attr.aria-label]=\"'app.dashboard-page.loading' | translate\" />\n        </div>\n      } @else if (tasksError()) {\n        <div class=\"widget-error\">{{ tasksError() }}</div>\n      } @else if (tasks().length === 0) {\n        <div class=\"widget-empty\">{{ 'app.dashboard-page.no-pending-tasks' | translate }}</div>\n      } @else {\n        <div class=\"task-list\">\n          @for (task of tasks(); track task.id) {\n            <div class=\"task-card\" (click)=\"goToTask(task)\">\n              <div class=\"task-action\">{{ taskLabel(task) }}</div>\n              @if (taskDocTitle(task)) {\n                <div class=\"task-doc-title\">{{ taskDocTitle(task) }}</div>\n              }\n              <div class=\"task-due\" [class.task-overdue]=\"isOverdue(task)\">\n                {{ 'app.dashboard-page.due' | translate }}\n                <span class=\"task-due-value\">{{ relativeTime(task.dueDate) }}</span>\n              </div>\n              <div class=\"task-workflow\">{{ taskWorkflow(task) }}</div>\n            </div>\n          }\n        </div>\n      }\n    </lib-widget-container>\n\n    <lib-widget-container\n      [title]=\"'dashboard.recently-viewed' | translate\"\n      icon=\"visibility\"\n      iconColor=\"var(--mat-sys-secondary)\"\n    >\n      @if (recentlyViewedLoading()) {\n        <div class=\"widget-loading\">\n          <mat-spinner diameter=\"28\" [attr.aria-label]=\"'app.dashboard-page.loading' | translate\" />\n        </div>\n      } @else if (recentlyViewedError()) {\n        <div class=\"widget-error\">{{ recentlyViewedError() }}</div>\n      } @else if (recentlyViewed().length === 0) {\n        <div class=\"widget-empty\">\n          {{ 'app.dashboard-page.no-recently-viewed-items' | translate }}\n        </div>\n      } @else {\n        <table class=\"widget-table\">\n          <thead>\n            <tr>\n              <th>{{ 'app.dashboard-page.title' | translate }}</th>\n              <th>{{ 'app.dashboard-page.type' | translate }}</th>\n              <th>{{ 'app.dashboard-page.last-viewed' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (doc of recentlyViewed(); track doc.uid) {\n              <tr class=\"widget-row\" (click)=\"navigateToDoc(doc)\">\n                <td class=\"doc-title-cell\">\n                  <div class=\"doc-thumb\">\n                    @if (thumbnailMap()[doc.uid]; as thumb) {\n                      <img [src]=\"thumb\" alt=\"\" class=\"doc-thumb-img\" />\n                    } @else {\n                      <mat-icon class=\"doc-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n                    }\n                  </div>\n                  <span class=\"doc-title\">{{ doc.title }}</span>\n                </td>\n                <td>\n                  <span class=\"type-label\">{{ docTypeLabel(doc) }}</span>\n                </td>\n                <td class=\"doc-date\">{{ relativeTime(doc.lastModified) }}</td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      }\n    </lib-widget-container>\n\n    <lib-widget-container\n      [title]=\"'dashboard.favorite-items' | translate\"\n      icon=\"star\"\n      iconColor=\"var(--mat-sys-tertiary)\"\n    >\n      @if (favoritesLoading()) {\n        <div class=\"widget-loading\">\n          <mat-spinner diameter=\"28\" [attr.aria-label]=\"'app.dashboard-page.loading' | translate\" />\n        </div>\n      } @else if (favoritesError()) {\n        <div class=\"widget-error\">{{ favoritesError() }}</div>\n      } @else if (favorites().length === 0) {\n        <div class=\"widget-empty\">\n          {{ 'app.dashboard-page.you-havent-starred-documents-yet' | translate }}\n        </div>\n      } @else {\n        <table class=\"widget-table\">\n          <thead>\n            <tr>\n              <th>{{ 'app.dashboard-page.title' | translate }}</th>\n              <th>{{ 'app.dashboard-page.modified' | translate }}</th>\n              <th>{{ 'app.dashboard-page.last-contributor' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (doc of favorites(); track doc.uid) {\n              <tr class=\"widget-row\" (click)=\"navigateToDoc(doc)\">\n                <td class=\"doc-title-cell\">\n                  <div class=\"doc-thumb\">\n                    @if (thumbnailMap()[doc.uid]; as thumb) {\n                      <img [src]=\"thumb\" alt=\"\" class=\"doc-thumb-img\" />\n                    } @else {\n                      <mat-icon class=\"doc-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n                    }\n                  </div>\n                  <span class=\"doc-title\">{{ doc.title }}</span>\n                </td>\n                <td class=\"doc-date\">{{ doc.lastModified | date: 'mediumDate' }}</td>\n                <td class=\"doc-contributor\">\n                  <span class=\"contributor-cell\">\n                    <sat-avatar\n                      [initials]=\"lastContributor(doc)\"\n                      [category]=\"avatarColor(lastContributor(doc))\"\n                      size=\"24\"\n                      [borderless]=\"true\"\n                      aria-hidden=\"true\"\n                    />\n                    {{ lastContributor(doc) }}\n                  </span>\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      }\n    </lib-widget-container>\n  </lib-widget-grid>\n\n  <button\n    mat-fab\n    color=\"primary\"\n    type=\"button\"\n    class=\"dashboard-create-fab\"\n    (click)=\"openCreateImport()\"\n    [matTooltip]=\"'app.dashboard-page.create-or-import' | translate\"\n    matTooltipPosition=\"above\"\n    matTooltipShowDelay=\"300\"\n  >\n    <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n      'app.dashboard-page.create-or-import' | translate\n    }}</span>\n    <mat-icon aria-hidden=\"true\">add</mat-icon>\n  </button>\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  background: #f4f5f7;\n}\n\n.dashboard-page {\n  position: relative;\n  padding: 0 8px 96px;\n  box-sizing: border-box;\n}\n\n/**\n * Nuxeo-style FAB: inset from edges (not flush to corner), theme primary fill + on-primary icon.\n * Explicit MDC vars so the FAB always follows --mat-sys-* (matches app theme / Themes page).\n */\n.dashboard-create-fab.mat-mdc-fab {\n  position: fixed;\n  z-index: 100;\n  right: max(40px, calc(24px + env(safe-area-inset-right, 0px)));\n  bottom: max(40px, calc(24px + env(safe-area-inset-bottom, 0px)));\n\n  --mdc-fab-container-color: var(--mat-sys-primary);\n  --mdc-fab-icon-color: var(--mat-sys-on-primary);\n  --mat-fab-foreground-color: var(--mat-sys-on-primary);\n\n  mat-icon {\n    color: var(--mat-sys-on-primary);\n  }\n}\n\n.widget-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-weight: 600;\n    color: #667085;\n    font-size: 11px;\n    text-transform: uppercase;\n    letter-spacing: 0.04em;\n    border-bottom: 1px solid #e8eaef;\n    position: sticky;\n    top: 0;\n    background: #ffffff;\n    z-index: 1;\n  }\n\n  td {\n    padding: 10px 20px;\n    color: #344054;\n    border-bottom: 1px solid #f2f4f7;\n    vertical-align: middle;\n  }\n\n  .empty-row {\n    text-align: center;\n    color: var(--mat-sys-on-surface-variant, #474551);\n    padding: 32px 20px;\n    font-size: 13px;\n  }\n}\n\n.widget-loading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px 20px;\n}\n\n.widget-error {\n  text-align: center;\n  color: var(--mat-sys-error);\n  padding: 32px 20px;\n  font-size: 13px;\n}\n\n.widget-empty {\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  padding: 32px 20px;\n  font-size: 13px;\n}\n\n.widget-row {\n  cursor: pointer;\n\n  &:hover {\n    background: #f9fafb;\n  }\n}\n\n.doc-title-cell {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-thumb {\n  flex-shrink: 0;\n  width: 32px;\n  height: 32px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border: 1px solid #e8e8e8;\n}\n\n.doc-thumb-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.doc-thumb-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #9e9e9e;\n}\n\n.doc-title {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  max-width: 220px;\n}\n\n.doc-date {\n  white-space: nowrap;\n  color: #666;\n  font-size: 12px;\n}\n\n.contributor-cell {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: #344054;\n  white-space: nowrap;\n}\n\n.type-label {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 12px;\n  font-size: 11px;\n  font-weight: 500;\n  color: #3c4fe0;\n  background: #eef0fd;\n  white-space: nowrap;\n}\n\n.task-list {\n  display: flex;\n  flex-direction: column;\n}\n\n.task-card {\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n  line-height: 1.5;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f5f5f5);\n  }\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.task-action {\n  font-weight: 600;\n  font-size: 13px;\n  color: #333;\n}\n\n.task-doc-title {\n  font-size: 13px;\n  color: #555;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.task-due {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-top: 2px;\n}\n\n.task-due-value {\n  font-weight: 500;\n}\n\n.task-overdue {\n  color: var(--mat-sys-error, #b02b36);\n\n  .task-due-value {\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n.task-workflow {\n  font-size: 12px;\n  color: #666;\n  margin-top: 1px;\n}\n\n// \u2500\u2500 AI Insights Banner \u2500\u2500\n// NXENG-939 \u2014 IBM 9067535242: decorative gradients made automated contrast checks\n// \"Needs review\". Use an opaque theme surface so text contrast is measurable.\n.ai-insights-banner {\n  margin: 24px 24px 0;\n  padding: 20px 24px 24px;\n  background: var(--mat-sys-surface-container-low, #f3f3f6);\n  border: 1px solid var(--mat-sys-outline-variant, #c8c6cc);\n  border-radius: 16px;\n}\n\n.ai-banner-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n}\n\n.ai-banner-title-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ai-banner-icon {\n  color: var(--mat-sys-primary, #6750a4);\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n}\n\n.ai-banner-title {\n  font-size: 16px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  letter-spacing: -0.02em;\n}\n\n.ai-banner-count {\n  font-size: 12px;\n  color: var(--mat-sys-primary, #6750a4);\n  font-weight: 500;\n  background: color-mix(in srgb, var(--mat-sys-primary, #6750a4) 8%, transparent);\n  padding: 3px 10px;\n  border-radius: 20px;\n}\n\n.ai-banner-empty {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 0;\n  // IBM 9044252072 / NXENG-940 \u2014 empty copy tracks the themed banner surface (NXENG-939).\n  color: var(--mat-sys-on-surface-variant, #474551);\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: currentColor;\n  }\n}\n\n// KPI card row\n.ai-kpi-row {\n  display: flex;\n  gap: 14px;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  padding-bottom: 2px;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n.ai-kpi-card {\n  flex: 1 1 0;\n  min-width: 220px;\n  max-width: 320px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 16px 18px;\n  border-radius: 12px;\n  border: 1px solid #e8eaef;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  scroll-snap-align: start;\n  position: relative;\n  overflow: hidden;\n\n  &::after {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 3px;\n    height: 100%;\n    border-radius: 0 3px 3px 0;\n  }\n\n  &.high::after {\n    background: #d32f2f;\n  }\n  &.medium::after {\n    background: #ed6c02;\n  }\n  &.low::after {\n    background: #2e7d32;\n  }\n\n  &:hover {\n    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);\n    transform: translateY(-2px);\n\n    .ai-kpi-arrow {\n      transform: translateX(2px);\n    }\n  }\n}\n\n.ai-kpi-card--skeleton {\n  pointer-events: none;\n  min-height: 100px;\n\n  .skeleton-bar {\n    height: 12px;\n    border-radius: 6px;\n    background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);\n    background-size: 200% 100%;\n    animation: skeleton-shimmer 1.5s infinite;\n\n    &.wide {\n      width: 90%;\n    }\n    &.medium {\n      width: 60%;\n    }\n  }\n}\n\n@keyframes skeleton-shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n.ai-kpi-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ai-kpi-icon-wrap {\n  width: 32px;\n  height: 32px;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &.high {\n    background: #fdecea;\n    color: #d32f2f;\n  }\n  &.medium {\n    background: #fff3e0;\n    color: #ed6c02;\n  }\n  &.low {\n    background: #e8f5e9;\n    color: #2e7d32;\n  }\n}\n\n.ai-kpi-priority {\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding: 2px 8px;\n  border-radius: 4px;\n\n  &.high {\n    background: #fdecea;\n    color: #d32f2f;\n  }\n  &.medium {\n    background: #fff3e0;\n    color: #ed6c02;\n  }\n  &.low {\n    background: #e8f5e9;\n    color: #2e7d32;\n  }\n}\n\n.ai-kpi-text {\n  font-size: 13px;\n  line-height: 1.5;\n  color: #344054;\n  margin: 0;\n  flex: 1;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n.ai-kpi-action {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 12px;\n  font-weight: 600;\n  color: #7c4dff;\n  margin-top: auto;\n}\n\n.ai-kpi-arrow {\n  font-size: 14px !important;\n  width: 14px !important;\n  height: 14px !important;\n  transition: transform 0.2s ease;\n}\n\n@media (max-width: 900px) {\n  .ai-insights-banner {\n    margin: 16px 16px 0;\n    padding: 16px;\n  }\n\n  .ai-kpi-card {\n    min-width: 200px;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DashboardPageComponent, { className: "DashboardPageComponent", filePath: "apps/nuxeo-ui/src/app/dashboard/dashboard-page.component.ts", lineNumber: 74 }); })();
