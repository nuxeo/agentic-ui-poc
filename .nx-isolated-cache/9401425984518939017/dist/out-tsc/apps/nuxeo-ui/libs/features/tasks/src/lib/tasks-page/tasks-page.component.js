import { Component, DestroyRef, LOCALE_ID, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { TaskService, UserService, WorkflowService, DocumentService, NuxeoApiBase, CURRENT_USERNAME, trustObjectUrl, taskDueDistance, } from '@nuxeo/satori-platform/nuxeo-client';
import { DocumentViewerComponent, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { SatBreadcrumbsComponent } from '@hylandsoftware/satori-ui/breadcrumbs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/progress-spinner";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/input";
import * as i7 from "@angular/material/select";
import * as i8 from "@angular/material/tooltip";
import * as i9 from "@angular/material/divider";
const _forTrack0 = ($index, $item) => $item.name;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.groupname;
function TasksPageComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2)(1, "mat-icon");
    i0.ɵɵtext(2, "assignment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "tasks.tasks-page.select-a-task"), " ");
} }
function TasksPageComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 4);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "tasks.tasks-page.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "tasks.tasks-page.loading-2"));
} }
function TasksPageComponent_Conditional_4_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "sat-breadcrumbs", 40);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_5_Template_sat_breadcrumbs_click_2_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onBreadcrumbClick($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.targetDoc().title, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("items", ctx_r2.breadcrumbItems());
} }
function TasksPageComponent_Conditional_4_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.selectedTask().targetDocTitle || i0.ɵɵpipeBind1(2, 1, "tasks.document"), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_23_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 46)(1, "mat-icon", 53);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "button", 54);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_For_15_Template_button_click_4_listener() { const actor_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.removeDelegateActor(actor_r6)); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const actor_r6 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(actor_r6.startsWith("group:") ? "group" : "person");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.formatParticipant(actor_r6), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_2_Template_button_click_0_listener() { const user_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addDelegateActor("user:" + user_r8.id)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "person");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const user_r8 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", user_r8.properties.firstName, " ", user_r8.properties.lastName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r8.id);
} }
function TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_4_Template_button_click_0_listener() { const group_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addDelegateActor("group:" + group_r10.groupname)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "group");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r10 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(group_r10.grouplabel || group_r10.groupname);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r10.groupname);
} }
function TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48);
    i0.ɵɵrepeaterCreate(1, TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_2_Template, 7, 3, "button", 55, _forTrack1);
    i0.ɵɵrepeaterCreate(3, TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_For_4_Template, 7, 2, "button", 55, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.delegateUserResults());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.delegateGroupResults());
} }
function TasksPageComponent_Conditional_4_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "div", 41)(2, "div", 42);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 43);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDelegatePanel()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "p", 44);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 45);
    i0.ɵɵrepeaterCreate(14, TasksPageComponent_Conditional_4_Conditional_23_For_15_Template, 7, 2, "span", 46, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "mat-form-field", 28)(17, "mat-label");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "input", 47);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_23_Template_input_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.delegateInput, $event) || (ctx_r2.delegateInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("input", function TasksPageComponent_Conditional_4_Conditional_23_Template_input_input_20_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.searchDelegateUsers()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(22, TasksPageComponent_Conditional_4_Conditional_23_Conditional_22_Template, 5, 0, "div", 48);
    i0.ɵɵelementStart(23, "mat-form-field", 28)(24, "mat-label");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "textarea", 49);
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_23_Template_textarea_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.delegateComment, $event) || (ctx_r2.delegateComment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 50)(29, "button", 51);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDelegatePanel()); });
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "button", 52);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_23_Template_button_click_32_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.confirmDelegate()); });
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 13, "tasks.tasks-page.delegate-task"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 15, "tasks.tasks-page.close"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 17, "tasks.tasks-page.close"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 19, "tasks.tasks-page.add-users-or-groups-to-delegate"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.delegateActors);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 21, "tasks.tasks-page.search-users-or-groups"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.delegateInput);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(21, 23, "tasks.tasks-page.type-to-search"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.delegateUserResults().length > 0 || ctx_r2.delegateGroupResults().length > 0 ? 22 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 25, "tasks.tasks-page.comment-optional"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.delegateComment);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(31, 27, "tasks.tasks-page.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.delegateActors.length === 0 || ctx_r2.submitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(34, 29, "tasks.tasks-page.delegate"), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_24_For_15_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 46)(1, "mat-icon", 53);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "button", 54);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_For_15_Template_button_click_4_listener() { const actor_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.removeReassignActor(actor_r13)); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const actor_r13 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(actor_r13.startsWith("group:") ? "group" : "person");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.formatParticipant(actor_r13), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_2_Template_button_click_0_listener() { const user_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addReassignActor("user:" + user_r15.id)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "person");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const user_r15 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", user_r15.properties.firstName, " ", user_r15.properties.lastName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r15.id);
} }
function TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_4_Template_button_click_0_listener() { const group_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addReassignActor("group:" + group_r17.groupname)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "group");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r17 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(group_r17.grouplabel || group_r17.groupname);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r17.groupname);
} }
function TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48);
    i0.ɵɵrepeaterCreate(1, TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_2_Template, 7, 3, "button", 55, _forTrack1);
    i0.ɵɵrepeaterCreate(3, TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_For_4_Template, 7, 2, "button", 55, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.reassignUserResults());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.reassignGroupResults());
} }
function TasksPageComponent_Conditional_4_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 20)(1, "div", 41)(2, "div", 42);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 43);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeReassignPanel()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "p", 44);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 45);
    i0.ɵɵrepeaterCreate(14, TasksPageComponent_Conditional_4_Conditional_24_For_15_Template, 7, 2, "span", 46, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "mat-form-field", 28)(17, "mat-label");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "input", 47);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_24_Template_input_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.reassignInput, $event) || (ctx_r2.reassignInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("input", function TasksPageComponent_Conditional_4_Conditional_24_Template_input_input_20_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.searchReassignUsers()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(22, TasksPageComponent_Conditional_4_Conditional_24_Conditional_22_Template, 5, 0, "div", 48);
    i0.ɵɵelementStart(23, "mat-form-field", 28)(24, "mat-label");
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "textarea", 49);
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_24_Template_textarea_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.reassignComment, $event) || (ctx_r2.reassignComment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 50)(29, "button", 51);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeReassignPanel()); });
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "button", 52);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_24_Template_button_click_32_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.confirmReassign()); });
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 13, "tasks.tasks-page.reassign-task"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 15, "tasks.tasks-page.close"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 17, "tasks.tasks-page.close"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 19, "tasks.tasks-page.select-new-assignees-the-current-assignees"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.reassignActors);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 21, "tasks.tasks-page.search-users-or-groups"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.reassignInput);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(21, 23, "tasks.tasks-page.type-to-search"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.reassignUserResults().length > 0 || ctx_r2.reassignGroupResults().length > 0 ? 22 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 25, "tasks.tasks-page.comment-optional"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.reassignComment);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(31, 27, "tasks.tasks-page.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.reassignActors.length === 0 || ctx_r2.submitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(34, 29, "tasks.tasks-page.reassign"), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 58);
    i0.ɵɵelement(1, "mat-spinner", 61);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "tasks.tasks-page.loading"));
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 64);
    i0.ɵɵtext(1, "check_circle");
    i0.ɵɵelementEnd();
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 65);
    i0.ɵɵtext(1, "radio_button_checked");
    i0.ɵɵelementEnd();
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 66);
    i0.ɵɵtext(1, "radio_button_unchecked");
    i0.ɵɵelementEnd();
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 68);
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "div", 63);
    i0.ɵɵconditionalCreate(2, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_2_Template, 2, 0, "mat-icon", 64)(3, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_3_Template, 2, 0, "mat-icon", 65)(4, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_4_Template, 2, 0, "mat-icon", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 67);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Conditional_7_Template, 1, 0, "div", 68);
} if (rf & 2) {
    const node_r19 = ctx.$implicit;
    const ɵ$index_272_r20 = ctx.$index;
    const ɵ$count_272_r21 = ctx.$count;
    i0.ɵɵclassProp("current", node_r19.isCurrent)("done", node_r19.state === "done");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(node_r19.state === "done" ? 2 : node_r19.isCurrent ? 3 : 4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(node_r19.title);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!(ɵ$index_272_r20 === ɵ$count_272_r21 - 1) ? 7 : -1);
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 59);
    i0.ɵɵrepeaterCreate(1, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_For_2_Template, 8, 7, null, null, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.graphNodes());
} }
function TasksPageComponent_Conditional_4_Conditional_25_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 60)(1, "mat-icon");
    i0.ɵɵtext(2, "account_tree");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "tasks.tasks-page.no-graph-data-available"));
} }
function TasksPageComponent_Conditional_4_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "div", 41)(2, "div", 42);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 43);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_25_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r18); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeGraphPanel()); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(10, TasksPageComponent_Conditional_4_Conditional_25_Conditional_10_Template, 3, 3, "div", 58)(11, TasksPageComponent_Conditional_4_Conditional_25_Conditional_11_Template, 3, 0, "div", 59)(12, TasksPageComponent_Conditional_4_Conditional_25_Conditional_12_Template, 6, 3, "div", 60);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "tasks.tasks-page.workflow-graph"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 6, "tasks.tasks-page.close"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 8, "tasks.tasks-page.close"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.graphLoading() ? 10 : ctx_r2.graphNodes().length > 0 ? 11 : 12);
} }
function TasksPageComponent_Conditional_4_For_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 25)(1, "span", 69);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 70);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const actor_r22 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(actor_r22.charAt(0).toUpperCase());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(actor_r22);
} }
function TasksPageComponent_Conditional_4_Conditional_33_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 71)(1, "span", 72);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 70);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const actor_r23 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(actor_r23.replace("user:", "").replace("group:", "").charAt(0).toUpperCase());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.formatParticipant(actor_r23));
} }
function TasksPageComponent_Conditional_4_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "span", 23);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 24);
    i0.ɵɵrepeaterCreate(5, TasksPageComponent_Conditional_4_Conditional_33_For_6_Template, 5, 2, "span", 71, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "tasks.tasks-page.delegated-to"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.delegatedActorsList);
} }
function TasksPageComponent_Conditional_4_Conditional_40_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 46)(1, "mat-icon", 53);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "button", 54);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_40_For_6_Template_button_click_4_listener() { const p_r26 = i0.ɵɵrestoreView(_r25).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.removeParticipant(p_r26)); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const p_r26 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(p_r26.startsWith("group:") ? "group" : "person");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.formatParticipant(p_r26), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_40_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 75);
    i0.ɵɵtext(1, "hourglass_empty");
    i0.ɵɵelementEnd();
} }
function TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_2_Template_button_click_0_listener() { const user_r28 = i0.ɵɵrestoreView(_r27).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addParticipant("user:" + user_r28.id)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "person");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const user_r28 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", user_r28.properties.firstName, " ", user_r28.properties.lastName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r28.id);
} }
function TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_4_Template_button_click_0_listener() { const group_r30 = i0.ɵɵrestoreView(_r29).$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.addParticipant("group:" + group_r30.groupname)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "group");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 57);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const group_r30 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(group_r30.grouplabel || group_r30.groupname);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r30.groupname);
} }
function TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48);
    i0.ɵɵrepeaterCreate(1, TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_2_Template, 7, 3, "button", 55, _forTrack1);
    i0.ɵɵrepeaterCreate(3, TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_For_4_Template, 7, 2, "button", 55, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.userResults());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.groupResults());
} }
function TasksPageComponent_Conditional_4_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 22)(1, "span", 73);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 74);
    i0.ɵɵrepeaterCreate(5, TasksPageComponent_Conditional_4_Conditional_40_For_6_Template, 7, 2, "span", 46, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-form-field", 28)(8, "mat-label");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 47);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_40_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.participantInput, $event) || (ctx_r2.participantInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("input", function TasksPageComponent_Conditional_4_Conditional_40_Template_input_input_11_listener() { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.searchUsers()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, TasksPageComponent_Conditional_4_Conditional_40_Conditional_13_Template, 2, 0, "mat-icon", 75);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(14, TasksPageComponent_Conditional_4_Conditional_40_Conditional_14_Template, 5, 0, "div", 48);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 22)(16, "mat-form-field", 28)(17, "mat-label");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "mat-select", 76);
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Conditional_40_Template_mat_select_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.validationOrReview, $event) || (ctx_r2.validationOrReview = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(21, "mat-option", 77);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "mat-option", 78);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 10, "tasks.tasks-page.participants"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.participants);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 12, "tasks.tasks-page.search-users-or-groups"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.participantInput);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(12, 14, "tasks.tasks-page.type-to-search"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.searching() ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.userResults().length > 0 || ctx_r2.groupResults().length > 0 ? 14 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 16, "tasks.tasks-page.review-type"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.validationOrReview);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 18, "tasks.tasks-page.simple-review"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(26, 20, "tasks.tasks-page.validation"));
} }
function TasksPageComponent_Conditional_4_For_49_Template(rf, ctx) { if (rf & 1) {
    const _r31 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 79);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_For_49_Template_button_click_0_listener() { const action_r32 = i0.ɵɵrestoreView(_r31).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.executeAction(action_r32)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r32 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("primary", ctx_r2.actionColor(action_r32) === "primary")("warn", ctx_r2.actionColor(action_r32) === "warn");
    i0.ɵɵproperty("disabled", ctx_r2.submitting());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.actionLabel(action_r32), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 32);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "tasks.tasks-page.loading"));
} }
function TasksPageComponent_Conditional_4_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵelement(1, "mat-divider");
    i0.ɵɵelementStart(2, "button", 80);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Conditional_51_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r33); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.abandonWorkflow()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.submitting());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "tasks.tasks-page.abandon-workflow"), " ");
} }
function TasksPageComponent_Conditional_4_Conditional_52_For_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 84)(1, "span", 87);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r34 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(c_r34.author.charAt(0).toUpperCase());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", c_r34.author, " ");
} }
function TasksPageComponent_Conditional_4_Conditional_52_For_7_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 85);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r34 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r34.date);
} }
function TasksPageComponent_Conditional_4_Conditional_52_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 82)(1, "div", 83);
    i0.ɵɵconditionalCreate(2, TasksPageComponent_Conditional_4_Conditional_52_For_7_Conditional_2_Template, 4, 2, "span", 84);
    i0.ɵɵconditionalCreate(3, TasksPageComponent_Conditional_4_Conditional_52_For_7_Conditional_3_Template, 2, 1, "span", 85);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 86);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const c_r34 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(c_r34.author ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(c_r34.date ? 3 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(c_r34.text);
} }
function TasksPageComponent_Conditional_4_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34);
    i0.ɵɵelement(1, "mat-divider");
    i0.ɵɵelementStart(2, "span", 23);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 81);
    i0.ɵɵrepeaterCreate(6, TasksPageComponent_Conditional_4_Conditional_52_For_7_Template, 6, 3, "div", 82, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "tasks.tasks-page.comments"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.taskComments);
} }
function TasksPageComponent_Conditional_4_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-document-viewer", 88);
    i0.ɵɵlistener("downloadClicked", function TasksPageComponent_Conditional_4_Conditional_60_Template_lib_document_viewer_downloadClicked_0_listener() { i0.ɵɵrestoreView(_r35); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.download()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("blobUrl", ctx_r2.previewUrl())("rawBlobUrl", ctx_r2.rawPreviewUrl())("blobType", ctx_r2.previewBlobType())("mimeType", ctx_r2.viewerMimeType())("fileName", ctx_r2.fileName())("fileSize", ctx_r2.fileSize())("loading", ctx_r2.docLoading());
} }
function TasksPageComponent_Conditional_4_Conditional_61_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 39)(1, "mat-icon");
    i0.ɵɵtext(2, "insert_drive_file");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.docLoading() ? "Loading..." : i0.ɵɵpipeBind1(5, 1, "tasks.no-document"));
} }
function TasksPageComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 6)(2, "mat-icon", 7);
    i0.ɵɵtext(3, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 8);
    i0.ɵɵconditionalCreate(5, TasksPageComponent_Conditional_4_Conditional_5_Template, 3, 2)(6, TasksPageComponent_Conditional_4_Conditional_6_Template, 3, 3, "div", 9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "div", 10)(8, "section", 11)(9, "div", 12)(10, "div", 13)(11, "div", 14);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 15)(14, "button", 16);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openDelegatePanel()); });
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 17);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openReassignPanel()); });
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "button", 18);
    i0.ɵɵlistener("click", function TasksPageComponent_Conditional_4_Template_button_click_20_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openGraphPanel()); });
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, TasksPageComponent_Conditional_4_Conditional_23_Template, 35, 31, "div", 19);
    i0.ɵɵconditionalCreate(24, TasksPageComponent_Conditional_4_Conditional_24_Template, 35, 31, "div", 20);
    i0.ɵɵconditionalCreate(25, TasksPageComponent_Conditional_4_Conditional_25_Template, 13, 10, "div", 21);
    i0.ɵɵelementStart(26, "div", 22)(27, "span", 23);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "div", 24);
    i0.ɵɵrepeaterCreate(31, TasksPageComponent_Conditional_4_For_32_Template, 5, 2, "span", 25, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(33, TasksPageComponent_Conditional_4_Conditional_33_Template, 7, 3, "div", 22);
    i0.ɵɵelementStart(34, "div", 22)(35, "span", 23);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "span", 26);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(40, TasksPageComponent_Conditional_4_Conditional_40_Template, 27, 22);
    i0.ɵɵelementStart(41, "div", 22)(42, "label", 27);
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "mat-form-field", 28)(46, "input", 29);
    i0.ɵɵtwoWayListener("ngModelChange", function TasksPageComponent_Conditional_4_Template_input_ngModelChange_46_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.comment, $event) || (ctx_r2.comment = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(47, "div", 30);
    i0.ɵɵrepeaterCreate(48, TasksPageComponent_Conditional_4_For_49_Template, 2, 6, "button", 31, _forTrack0);
    i0.ɵɵconditionalCreate(50, TasksPageComponent_Conditional_4_Conditional_50_Template, 2, 3, "mat-spinner", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(51, TasksPageComponent_Conditional_4_Conditional_51_Template, 7, 4, "div", 33);
    i0.ɵɵconditionalCreate(52, TasksPageComponent_Conditional_4_Conditional_52_Template, 8, 3, "div", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "div", 35)(54, "button", 36);
    i0.ɵɵpipe(55, "translate");
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵelementStart(57, "mat-icon");
    i0.ɵɵtext(58, "chevron_left");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(59, "section", 37);
    i0.ɵɵconditionalCreate(60, TasksPageComponent_Conditional_4_Conditional_60_Template, 1, 7, "lib-document-viewer", 38)(61, TasksPageComponent_Conditional_4_Conditional_61_Template, 6, 3, "div", 39);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_20_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.targetDoc() ? 5 : 6);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.taskDirective(ctx_r2.selectedTask()), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(16, 23, "tasks.tasks-page.delegate"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 25, "tasks.tasks-page.reassign"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 27, "tasks.tasks-page.view-graph"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.showDelegatePanel() ? 23 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.showReassignPanel() ? 24 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.showGraphPanel() ? 25 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 29, "tasks.tasks-page.actors-in-this-task"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.taskActors());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.delegatedActorsList.length > 0 ? 33 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(37, 31, "tasks.tasks-page.due"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("overdue", ctx_r2.isOverdue(ctx_r2.selectedTask()));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.dueLabel(ctx_r2.selectedTask()), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.isChooseParticipants ? 40 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 33, "tasks.tasks-page.comment"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.comment);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.actions);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.submitting() ? 50 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(((tmp_20_0 = ctx_r2.selectedTask()) == null ? null : tmp_20_0.workflowInstanceId) ? 51 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.taskComments.length > 0 ? 52 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(55, 35, "tasks.tasks-page.collapse"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(56, 37, "tasks.tasks-page.collapse"));
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r2.targetDoc() ? 60 : 61);
} }
const DUE_LABEL_KEYS = {
    due: {
        one: 'tasks.due-label.due-in-days-one',
        many: 'tasks.due-label.due-in-days-many',
        hours: 'tasks.due-label.due-in-hours-many',
        underTwoHours: 'tasks.due-label.due-in-less-than-an-hour',
    },
    overdue: {
        one: 'tasks.due-label.overdue-days-one',
        many: 'tasks.due-label.overdue-days-many',
        hours: 'tasks.due-label.overdue-hours-many',
        underTwoHours: 'tasks.due-label.overdue-less-than-an-hour',
    },
};
export class TasksPageComponent {
    route = inject(ActivatedRoute);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    router = inject(Router);
    taskService = inject(TaskService);
    userService = inject(UserService);
    workflowService = inject(WorkflowService);
    docService = inject(DocumentService);
    nuxeoApi = inject(NuxeoApiBase);
    http = inject(HttpClient);
    sanitizer = inject(DomSanitizer);
    currentUsername = inject(CURRENT_USERNAME);
    snackBar = inject(MatSnackBar);
    destroyRef = inject(DestroyRef);
    constructor() {
        // The preview object URL was only revoked when the selection changed, so navigating away while
        // a preview was on screen leaked it for the lifetime of the tab. `review-guardrails.mjs` sees a
        // `revokeObjectURL` in this file and is satisfied; it cannot tell that no destroy path reaches
        // it. Pre-existing, and fixed here because this component's preview flow changed.
        this.destroyRef.onDestroy(() => this.clearPreviewBlob());
    }
    /* ─── Task list ─── */
    tasks = signal([], ...(ngDevMode ? [{ debugName: "tasks" }] : []));
    listLoading = signal(true, ...(ngDevMode ? [{ debugName: "listLoading" }] : []));
    listError = signal(null, ...(ngDevMode ? [{ debugName: "listError" }] : []));
    /* ─── Selected task & document ─── */
    selectedTask = signal(null, ...(ngDevMode ? [{ debugName: "selectedTask" }] : []));
    targetDoc = signal(null, ...(ngDevMode ? [{ debugName: "targetDoc" }] : []));
    previewBlobUrl = signal(null, ...(ngDevMode ? [{ debugName: "previewBlobUrl" }] : []));
    /**
     * The unwrapped object URL behind `previewBlobUrl`, forwarded to the viewer's `rawBlobUrl` for
     * its `SecurityContext.NONE` bindings (`source[src]`, `audio[src]`, `video[poster]`), where a
     * `SafeResourceUrl` stringifies instead of being unwrapped.
     */
    rawPreviewUrl = signal(null, ...(ngDevMode ? [{ debugName: "rawPreviewUrl" }] : []));
    /** `Blob.type` of the preview blob. See `DocumentViewerComponent.blobType`. */
    previewBlobType = signal('', ...(ngDevMode ? [{ debugName: "previewBlobType" }] : []));
    taskLoading = signal(false, ...(ngDevMode ? [{ debugName: "taskLoading" }] : []));
    docLoading = signal(false, ...(ngDevMode ? [{ debugName: "docLoading" }] : []));
    submitting = signal(false, ...(ngDevMode ? [{ debugName: "submitting" }] : []));
    /**
     * Bumped on every task selection. `takeUntilDestroyed` cancels on teardown but not on *reselection*,
     * so without this a slow response for a previously selected task can land after a faster one and
     * overwrite `targetDoc` and the preview with stale content. Every async continuation below compares
     * the generation it captured against the current one and drops out if it has been superseded.
     */
    selectionGeneration = 0;
    /* ─── Form fields ─── */
    comment = '';
    participants = [];
    participantInput = '';
    dueDate = null;
    validationOrReview = 'simpleReview';
    /* ─── Delegate / Reassign dialogs ─── */
    showDelegatePanel = signal(false, ...(ngDevMode ? [{ debugName: "showDelegatePanel" }] : []));
    showReassignPanel = signal(false, ...(ngDevMode ? [{ debugName: "showReassignPanel" }] : []));
    delegateInput = '';
    delegateActors = [];
    reassignInput = '';
    reassignActors = [];
    delegateComment = '';
    reassignComment = '';
    /* ─── Delegate/Reassign search results ─── */
    delegateUserResults = signal([], ...(ngDevMode ? [{ debugName: "delegateUserResults" }] : []));
    delegateGroupResults = signal([], ...(ngDevMode ? [{ debugName: "delegateGroupResults" }] : []));
    reassignUserResults = signal([], ...(ngDevMode ? [{ debugName: "reassignUserResults" }] : []));
    reassignGroupResults = signal([], ...(ngDevMode ? [{ debugName: "reassignGroupResults" }] : []));
    /* ─── View Graph ─── */
    showGraphPanel = signal(false, ...(ngDevMode ? [{ debugName: "showGraphPanel" }] : []));
    graphData = signal(null, ...(ngDevMode ? [{ debugName: "graphData" }] : []));
    graphLoading = signal(false, ...(ngDevMode ? [{ debugName: "graphLoading" }] : []));
    /* ─── User search ─── */
    userResults = signal([], ...(ngDevMode ? [{ debugName: "userResults" }] : []));
    groupResults = signal([], ...(ngDevMode ? [{ debugName: "groupResults" }] : []));
    searching = signal(false, ...(ngDevMode ? [{ debugName: "searching" }] : []));
    breadcrumbPathCache = null;
    breadcrumbItemsCache = [];
    /* ─── Computed ─── */
    hasSelection = computed(() => this.selectedTask() !== null, ...(ngDevMode ? [{ debugName: "hasSelection" }] : []));
    breadcrumbItems = computed(() => {
        const doc = this.targetDoc();
        if (!doc?.path)
            return [];
        if (doc.path === this.breadcrumbPathCache) {
            return this.breadcrumbItemsCache;
        }
        this.breadcrumbPathCache = doc.path;
        let accumulated = '/browse';
        this.breadcrumbItemsCache = doc.path
            .split('/')
            .filter(Boolean)
            .map((s) => {
            accumulated += `/${s}`;
            return { label: decodeURIComponent(s), href: accumulated };
        });
        return this.breadcrumbItemsCache;
    }, ...(ngDevMode ? [{ debugName: "breadcrumbItems" }] : []));
    onBreadcrumbClick(event) {
        const anchor = event.target.closest('a');
        const href = anchor?.getAttribute('href');
        if (href) {
            event.preventDefault();
            void this.router.navigateByUrl(href);
        }
    }
    /** Actors assigned to the current task (from task actors list). */
    taskActors = computed(() => {
        const task = this.selectedTask();
        if (!task)
            return [];
        return (task.actors ?? []).map((a) => a.id);
    }, ...(ngDevMode ? [{ debugName: "taskActors" }] : []));
    get isChooseParticipants() {
        const t = this.selectedTask();
        if (!t)
            return false;
        const name = (t.name || '').toLowerCase();
        const directive = (t.directive || '').toLowerCase();
        const hasStartReview = (t.taskInfo?.taskActions ?? []).some((a) => a.name === 'start_review');
        return (hasStartReview ||
            name.includes('chooseparticipants') ||
            name.includes('choose_participants') ||
            name.includes('choose participants') ||
            directive.includes('select') ||
            directive.includes('chooseparticipants'));
    }
    get actions() {
        return this.selectedTask()?.taskInfo?.taskActions ?? [];
    }
    /* ════════════════════════════════════════════════════════
       Lifecycle
       ════════════════════════════════════════════════════════ */
    ngOnInit() {
        this.loadTasks();
    }
    /* ════════════════════════════════════════════════════════
       Task List
       ════════════════════════════════════════════════════════ */
    loadTasks() {
        this.listLoading.set(true);
        this.listError.set(null);
        const userId = this.currentUsername() ?? 'Administrator';
        this.taskService.getUserTasks(userId, 50).subscribe({
            next: (entries) => {
                this.tasks.set(entries);
                this.listLoading.set(false);
                const taskId = this.route.snapshot.paramMap.get('taskId');
                if (taskId) {
                    const found = entries.find((t) => t.id === taskId);
                    if (found)
                        this.selectTask(found);
                    else
                        this.loadAndSelectTask(taskId);
                }
                else if (entries.length > 0) {
                    this.selectTask(entries[0]);
                }
            },
            error: () => {
                this.listError.set(this.translate.instant('tasks.message.failed-to-load-tasks'));
                this.listLoading.set(false);
            },
        });
    }
    selectTask(task) {
        const gen = ++this.selectionGeneration;
        this.selectedTask.set(task);
        this.targetDoc.set(null);
        this.clearPreviewBlob();
        // Reset here, not only in the response handlers. A superseded response returns early on the
        // generation guard without clearing this, and a selection with no target document never starts
        // a request to clear it — so without this line, selecting a task with no document while another
        // is still loading leaves its "No document" placeholder stuck on "Loading...".
        this.docLoading.set(false);
        // `taskLoading` needs the same treatment, for the same reason, and did not get it when
        // `loadAndSelectTask` gained its generation guard: the superseded route response now returns at
        // the guard *before* reaching `taskLoading.set(false)`, so a click during a pending route load
        // left the page on its loading state permanently. The trap was already documented two lines up
        // for `docLoading`; the guard reintroduced it one field over.
        this.taskLoading.set(false);
        this.resetForm();
        this.router.navigate(['/tasks', task.id], { replaceUrl: true });
        const vars = task.variables ?? {};
        if (Array.isArray(vars['participants'])) {
            this.participants = vars['participants'];
        }
        if (vars['end_date']) {
            this.dueDate = new Date(vars['end_date']);
        }
        else {
            const d = new Date();
            d.setDate(d.getDate() + 5);
            this.dueDate = d;
        }
        const targetRef = task.targetDocumentIds?.[0];
        const docId = targetRef?.uid || targetRef?.id;
        // If the enricher already provided a full document object, use it directly
        if (targetRef?.uid && targetRef?.title) {
            this.targetDoc.set({
                uid: targetRef.uid,
                title: targetRef.title,
                type: targetRef.type ?? '',
                path: targetRef.path ?? '',
                lastModified: '',
                properties: {},
            });
            // Still fetch full doc to get properties (file:content etc.) for preview
            this.fetchTargetDoc(targetRef.uid, gen);
        }
        else if (docId) {
            this.fetchTargetDoc(docId, gen);
        }
    }
    /**
     * Fetch the task's target document, ignoring the response if the selection has moved on.
     * @param gen the `selectionGeneration` captured when this fetch was requested
     */
    fetchTargetDoc(docId, gen) {
        this.docLoading.set(true);
        this.docService
            .getById(docId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (gen !== this.selectionGeneration)
                    return;
                this.targetDoc.set(doc);
                this.docLoading.set(false);
                this.loadPreviewBlob(doc, gen);
            },
            error: () => {
                if (gen !== this.selectionGeneration)
                    return;
                this.docLoading.set(false);
            },
        });
    }
    loadAndSelectTask(taskId) {
        // Claims the selection before the request, so a click during it wins.
        //
        // `selectionGeneration` previously only covered work started *by* `selectTask`, and this route
        // request was not tied to it until its response arrived. So: route opens task A, the user clicks
        // task B while A is still loading, then A's response lands and calls `selectTask(A)` — silently
        // switching the user back to a task they had navigated away from.
        const gen = ++this.selectionGeneration;
        this.taskLoading.set(true);
        this.taskService
            .getTask(taskId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (task) => {
                if (gen !== this.selectionGeneration)
                    return;
                this.taskLoading.set(false);
                this.selectTask(task);
            },
            error: () => {
                // Guarded too: a stale failure would otherwise clear the loading state of a newer selection.
                if (gen !== this.selectionGeneration)
                    return;
                this.taskLoading.set(false);
            },
        });
    }
    /** Re-fetch the currently selected task to refresh its actors / state. */
    refreshCurrentTask() {
        const current = this.selectedTask();
        if (!current)
            return;
        // Reads the generation without incrementing it: this refreshes the existing selection rather than
        // making a new one. The guard is still needed — the same defect as `loadAndSelectTask`, one method
        // down and not flagged in review: a refresh of task A landing after the user selected task B would
        // overwrite B with A.
        const gen = this.selectionGeneration;
        this.taskService
            .getTask(current.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                if (gen !== this.selectionGeneration)
                    return;
                this.selectedTask.set(updated);
            },
            error: () => {
                /* keep current */
            },
        });
    }
    resetForm() {
        this.comment = '';
        this.participants = [];
        this.participantInput = '';
        this.dueDate = null;
        this.validationOrReview = 'simpleReview';
        this.userResults.set([]);
        this.groupResults.set([]);
        this.closeDelegatePanel();
        this.closeReassignPanel();
        this.closeGraphPanel();
    }
    /* ════════════════════════════════════════════════════════
       User / Group Search
       ════════════════════════════════════════════════════════ */
    searchUsers() {
        const q = this.participantInput.trim();
        if (q.length < 2) {
            this.userResults.set([]);
            this.groupResults.set([]);
            return;
        }
        this.searching.set(true);
        this.userService.searchUsers(q).subscribe({
            next: (users) => {
                this.userResults.set(users);
                this.searching.set(false);
            },
            error: () => this.searching.set(false),
        });
        this.userService.searchGroups(q).subscribe({
            next: (groups) => this.groupResults.set(groups),
            error: () => {
                /* swallow */
            },
        });
    }
    addParticipant(id) {
        if (!this.participants.includes(id)) {
            this.participants = [...this.participants, id];
        }
        this.participantInput = '';
        this.userResults.set([]);
        this.groupResults.set([]);
    }
    removeParticipant(id) {
        this.participants = this.participants.filter((p) => p !== id);
    }
    formatParticipant(id) {
        return id.replace(/^(user:|group:)/, '');
    }
    /* ════════════════════════════════════════════════════════
       Task Actions
       ════════════════════════════════════════════════════════ */
    executeAction(action) {
        const task = this.selectedTask();
        if (!task)
            return;
        this.submitting.set(true);
        const variables = {};
        if (this.isChooseParticipants) {
            variables['participants'] =
                this.participants.length > 0
                    ? this.participants.map((p) => (p.includes(':') ? p : `user:${p}`))
                    : [`user:${this.currentUsername() ?? 'Administrator'}`];
            if (this.dueDate) {
                variables['end_date'] = this.dueDate.toISOString();
            }
            else {
                // Nuxeo requires an end_date — default to 7 days from now
                const d = new Date();
                d.setDate(d.getDate() + 7);
                variables['end_date'] = d.toISOString();
            }
            if (this.validationOrReview)
                variables['validationOrReview'] = this.validationOrReview;
        }
        if (this.comment)
            variables['comment'] = this.comment;
        this.taskService
            .completeTask(task.id, action.name, variables, this.comment || undefined)
            .subscribe({
            next: () => {
                this.submitting.set(false);
                this.snackBar.open(this.translate.instant('tasks.message.task-completed-successfully'), this.translate.instant('common.close'), {
                    duration: 4000,
                });
                this.selectedTask.set(null);
                this.targetDoc.set(null);
                // Navigate to /tasks (no task ID) so loadTasks picks the next available task
                this.router.navigate(['/tasks'], { replaceUrl: true }).then(() => {
                    this.loadTasks();
                });
                this.taskService.notifyTasksChanged();
            },
            error: (err) => {
                this.submitting.set(false);
                const msg = err?.error?.message || this.translate.instant('tasks.message.failed-to-complete-task');
                this.snackBar.open(msg, this.translate.instant('common.close'), { duration: 6000 });
            },
        });
    }
    abandonWorkflow() {
        const task = this.selectedTask();
        if (!task?.workflowInstanceId)
            return;
        this.submitting.set(true);
        this.workflowService.cancelWorkflow(task.workflowInstanceId).subscribe({
            next: () => {
                this.submitting.set(false);
                this.snackBar.open(this.translate.instant('tasks.message.workflow-abandoned'), this.translate.instant('common.close'), { duration: 4000 });
                this.selectedTask.set(null);
                this.targetDoc.set(null);
                this.router.navigate(['/tasks'], { replaceUrl: true }).then(() => {
                    this.loadTasks();
                });
                this.taskService.notifyTasksChanged();
            },
            error: () => {
                this.submitting.set(false);
                this.snackBar.open(this.translate.instant('tasks.message.failed-to-abandon-workflow'), this.translate.instant('common.close'), {
                    duration: 4000,
                });
            },
        });
    }
    /* ════════════════════════════════════════════════════════
       Delegate Task
       ════════════════════════════════════════════════════════ */
    openDelegatePanel() {
        this.showDelegatePanel.set(true);
        this.showReassignPanel.set(false);
    }
    closeDelegatePanel() {
        this.showDelegatePanel.set(false);
        this.delegateInput = '';
        this.delegateActors = [];
        this.delegateComment = '';
        this.delegateUserResults.set([]);
        this.delegateGroupResults.set([]);
    }
    searchDelegateUsers() {
        const q = this.delegateInput.trim();
        if (q.length < 2) {
            this.delegateUserResults.set([]);
            this.delegateGroupResults.set([]);
            return;
        }
        this.userService.searchUsers(q).subscribe({
            next: (users) => this.delegateUserResults.set(users),
            error: () => {
                /* swallow */
            },
        });
        this.userService.searchGroups(q).subscribe({
            next: (groups) => this.delegateGroupResults.set(groups),
            error: () => {
                /* swallow */
            },
        });
    }
    addDelegateActor(id) {
        if (!this.delegateActors.includes(id)) {
            this.delegateActors = [...this.delegateActors, id];
        }
        this.delegateInput = '';
        this.delegateUserResults.set([]);
        this.delegateGroupResults.set([]);
    }
    removeDelegateActor(id) {
        this.delegateActors = this.delegateActors.filter((a) => a !== id);
    }
    confirmDelegate() {
        const task = this.selectedTask();
        if (!task || this.delegateActors.length === 0)
            return;
        this.submitting.set(true);
        this.taskService
            .delegateTask(task.id, this.delegateActors, this.delegateComment || undefined)
            .subscribe({
            next: () => {
                this.submitting.set(false);
                this.snackBar.open(this.translate.instant('tasks.message.task-delegated-successfully'), this.translate.instant('common.close'), { duration: 4000 });
                this.closeDelegatePanel();
                this.refreshCurrentTask();
                this.loadTasks();
                this.taskService.notifyTasksChanged();
            },
            error: (err) => {
                this.submitting.set(false);
                const msg = err?.error?.message || this.translate.instant('tasks.message.failed-to-delegate-task');
                this.snackBar.open(msg, this.translate.instant('common.close'), { duration: 6000 });
            },
        });
    }
    /* ════════════════════════════════════════════════════════
       Reassign Task
       ════════════════════════════════════════════════════════ */
    openReassignPanel() {
        this.showReassignPanel.set(true);
        this.showDelegatePanel.set(false);
    }
    closeReassignPanel() {
        this.showReassignPanel.set(false);
        this.reassignInput = '';
        this.reassignActors = [];
        this.reassignComment = '';
        this.reassignUserResults.set([]);
        this.reassignGroupResults.set([]);
    }
    searchReassignUsers() {
        const q = this.reassignInput.trim();
        if (q.length < 2) {
            this.reassignUserResults.set([]);
            this.reassignGroupResults.set([]);
            return;
        }
        this.userService.searchUsers(q).subscribe({
            next: (users) => this.reassignUserResults.set(users),
            error: () => {
                /* swallow */
            },
        });
        this.userService.searchGroups(q).subscribe({
            next: (groups) => this.reassignGroupResults.set(groups),
            error: () => {
                /* swallow */
            },
        });
    }
    addReassignActor(id) {
        if (!this.reassignActors.includes(id)) {
            this.reassignActors = [...this.reassignActors, id];
        }
        this.reassignInput = '';
        this.reassignUserResults.set([]);
        this.reassignGroupResults.set([]);
    }
    removeReassignActor(id) {
        this.reassignActors = this.reassignActors.filter((a) => a !== id);
    }
    confirmReassign() {
        const task = this.selectedTask();
        if (!task || this.reassignActors.length === 0)
            return;
        this.submitting.set(true);
        this.taskService
            .reassignTask(task.id, this.reassignActors, this.reassignComment || undefined)
            .subscribe({
            next: () => {
                this.submitting.set(false);
                this.snackBar.open(this.translate.instant('tasks.message.task-reassigned-successfully'), this.translate.instant('common.close'), { duration: 4000 });
                this.closeReassignPanel();
                this.refreshCurrentTask();
                this.loadTasks();
                this.taskService.notifyTasksChanged();
            },
            error: (err) => {
                this.submitting.set(false);
                const msg = err?.error?.message || this.translate.instant('tasks.message.failed-to-reassign-task');
                this.snackBar.open(msg, this.translate.instant('common.close'), { duration: 6000 });
            },
        });
    }
    /* ════════════════════════════════════════════════════════
       View Graph
       ════════════════════════════════════════════════════════ */
    openGraphPanel() {
        const task = this.selectedTask();
        if (!task?.workflowInstanceId)
            return;
        this.showGraphPanel.set(true);
        this.graphLoading.set(true);
        this.graphData.set(null);
        this.workflowService.getWorkflowGraph(task.workflowInstanceId).subscribe({
            next: (data) => {
                this.graphData.set(data);
                this.graphLoading.set(false);
            },
            error: () => {
                this.graphData.set({ error: 'Failed to load graph' });
                this.graphLoading.set(false);
            },
        });
    }
    closeGraphPanel() {
        this.showGraphPanel.set(false);
        this.graphData.set(null);
    }
    /** Get graph node entries for rendering. */
    graphNodes() {
        const data = this.graphData();
        if (!data || data['error'])
            return [];
        const nodes = (data['nodes'] ?? data['elements'] ?? []);
        const currentNode = this.selectedTask()?.nodeName;
        return nodes.map((n) => ({
            id: n['id'] ?? '',
            title: n['title'] ?? n['id'] ?? '',
            state: n['state'] ?? '',
            isCurrent: n['id'] === currentNode,
        }));
    }
    /* ════════════════════════════════════════════════════════
       Task Comments (from task.comments array)
       ════════════════════════════════════════════════════════ */
    get taskComments() {
        const task = this.selectedTask();
        if (!task?.comments)
            return [];
        // Comments can be objects {author, text, date} or plain strings
        return task.comments.map((c) => {
            if (typeof c === 'string')
                return { author: '', text: c, date: '' };
            const obj = c;
            return {
                author: obj['author'] ?? '',
                text: obj['text'] ?? obj['comment'] ?? '',
                date: obj['date'] ?? obj['creationDate'] ?? '',
            };
        });
    }
    /** Delegated actors on the current task. */
    get delegatedActorsList() {
        const task = this.selectedTask();
        if (!task?.delegatedActors)
            return [];
        return task.delegatedActors.map((a) => a.id);
    }
    /* ════════════════════════════════════════════════════════
       URL Helpers
       ════════════════════════════════════════════════════════ */
    /** @param gen the `selectionGeneration` captured when this preview was requested */
    loadPreviewBlob(doc, gen) {
        this.clearPreviewBlob();
        const fc = doc.properties?.['file:content'];
        if (!fc)
            return;
        const mime = fc['mime-type'] ?? '';
        // Audio and video need the real blob, not a thumbnail image: the viewer dispatches on the
        // document's own MIME type, so a thumbnail rendition would be handed to <audio>/<video>.
        // Everything else that is not an image previews as a thumbnail image of itself.
        //
        // The `application/(g|m)xf` arm mirrors `DocumentViewerComponent.contentType`, which classifies
        // those broadcast containers as 'video'. Matching only `video/` here left them fetching a
        // thumbnail that the viewer then fed to <video>. If that classifier gains a MIME type, this
        // must follow — the two are coupled by the viewer's dispatch and nothing enforces it.
        const needsOwnBlob = /^image\//.test(mime) ||
            /^audio\//.test(mime) ||
            /^video\//.test(mime) ||
            /^application\/(g|m)xf$/.test(mime);
        const url = this.nuxeoApi.apiUrl(needsOwnBlob
            ? `/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`
            : `/nuxeo/api/v1/id/${doc.uid}/@rendition/thumbnail`);
        this.http
            .get(url, { responseType: 'blob' })
            // Without this, a request in flight when the component is destroyed still mints an object URL
            // — after the destroy hook that would have revoked it has already run.
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                // A response for a superseded selection must not install itself over the current preview.
                if (gen !== this.selectionGeneration)
                    return;
                // Revoke whatever is currently held before replacing it, or the outgoing object URL leaks
                // for the lifetime of the document.
                this.clearPreviewBlob();
                const rawUrl = URL.createObjectURL(blob);
                this.rawPreviewUrl.set(rawUrl);
                // The served Content-Type, which is what gates the viewer's iframe branches.
                this.previewBlobType.set(blob.type);
                this.previewBlobUrl.set(trustObjectUrl(this.sanitizer, rawUrl));
            },
            error: () => {
                /* preview not available */
            },
        });
    }
    clearPreviewBlob() {
        const raw = this.rawPreviewUrl();
        if (raw) {
            URL.revokeObjectURL(raw);
            this.rawPreviewUrl.set(null);
        }
        this.previewBlobType.set('');
        this.previewBlobUrl.set(null);
    }
    previewUrl() {
        return this.previewBlobUrl();
    }
    downloadUrl() {
        const doc = this.targetDoc();
        if (!doc)
            return null;
        return this.nuxeoApi.apiUrl(`/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`);
    }
    download() {
        const url = this.downloadUrl();
        if (url)
            window.open(url, '_blank');
    }
    fileSize() {
        const doc = this.targetDoc();
        const content = doc?.properties?.['file:content'];
        if (!content?.['length'])
            return '';
        const bytes = content['length'];
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    /** The document's own content type, from metadata. Describes the *document*, not what we fetched. */
    mimeType() {
        const doc = this.targetDoc();
        const fc = doc?.properties?.['file:content'];
        return fc?.['mime-type'] ?? '';
    }
    /**
     * What to tell the viewer the blob *is* — the served type once a blob has arrived, metadata before.
     *
     * These genuinely differ here, and passing metadata was a live bug. `loadPreviewBlob` only fetches
     * the real blob for image/audio/video; for everything else it fetches `@rendition/thumbnail`, which
     * is an image. So a PDF task document handed the viewer `application/pdf` while the blob behind the
     * URL was a PNG. That was harmless-looking until the viewer began checking the served type, at
     * which point `contentType()` saw a PDF claim with a non-PDF blob and correctly refused to render
     * anything — the preview went blank.
     *
     * Describing the blob is also the more correct dispatch: the thumbnail now takes the `image` branch
     * and renders in `<img>` rather than being displayed inside an iframe.
     */
    viewerMimeType() {
        return this.previewBlobType() || this.mimeType();
    }
    fileName() {
        const doc = this.targetDoc();
        const content = doc?.properties?.['file:content'];
        return content?.['name'] || doc?.title || '';
    }
    /* ════════════════════════════════════════════════════════
       Formatting Helpers
       ════════════════════════════════════════════════════════ */
    taskLabel(task) {
        const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\./g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    taskDirective(task) {
        if (task.directive) {
            const d = task.directive.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
            return d
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/\./g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return this.taskLabel(task);
    }
    taskWorkflow(task) {
        const raw = task.workflowTitle || task.workflowModelName || '';
        const key = raw.replace(/^wf\.\w+\./, '');
        return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    dueDateFormatted(task) {
        if (!task.dueDate)
            return '';
        return new Date(task.dueDate).toLocaleDateString(this.locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    actionLabel(action) {
        const raw = action.label || action.name;
        const key = raw.replace(/^wf\.\w+\./, '');
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    actionColor(action) {
        const n = action.name.toLowerCase();
        if (n.includes('reject') || n.includes('cancel'))
            return 'warn';
        if (n.includes('approve') || n.includes('validate') || n.includes('start'))
            return 'primary';
        return '';
    }
    actionIcon(action) {
        const n = action.name.toLowerCase();
        if (n.includes('approve') || n.includes('validate'))
            return 'check_circle';
        if (n.includes('reject'))
            return 'cancel';
        if (n.includes('start'))
            return 'play_arrow';
        if (n.includes('cancel'))
            return 'block';
        return 'send';
    }
    isOverdue(task) {
        return !!task.dueDate && new Date(task.dueDate) < new Date();
    }
    dueLabel(task) {
        if (!task.dueDate)
            return '';
        const { due, unit, count } = taskDueDistance(task.dueDate);
        const keys = due ? DUE_LABEL_KEYS.due : DUE_LABEL_KEYS.overdue;
        const key = unit === 'days'
            ? count === 1
                ? keys.one
                : keys.many
            : unit === 'hours'
                ? keys.hours
                : keys.underTwoHours;
        return this.translate.instant(key, { count });
    }
    docProp(key) {
        return this.targetDoc()?.properties?.[key] ?? null;
    }
    static ɵfac = function TasksPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TasksPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TasksPageComponent, selectors: [["lib-tasks-page"]], features: [i0.ɵɵProvidersFeature([provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()])], decls: 5, vars: 1, consts: [[1, "tasks-page"], [1, "detail-area"], [1, "empty-detail"], [1, "loading-detail"], ["diameter", "36"], [1, "doc-header-bar"], [1, "doc-header-top"], [1, "doc-header-type-icon"], [1, "doc-header-titles"], ["role", "heading", "aria-level", "1", 1, "doc-main-title"], [1, "task-content-area"], [1, "task-form-panel"], [1, "task-form-scroll"], [1, "task-form-header"], ["role", "heading", "aria-level", "3", 1, "task-form-title"], [1, "task-header-actions"], ["type", "button", 1, "delegate-link", 3, "click"], ["type", "button", 1, "reassign-link", 3, "click"], ["type", "button", 1, "view-graph-link", 3, "click"], [1, "action-panel", "delegate-panel"], [1, "action-panel", "reassign-panel"], [1, "action-panel", "graph-panel"], [1, "task-form-section"], [1, "section-label"], [1, "actor-chips"], [1, "actor-chip"], [1, "due-value"], ["for", "tasks-page-comment-input", 1, "section-label"], ["appearance", "outline", 1, "full-width"], ["id", "tasks-page-comment-input", "matInput", "", "placeholder", "", 3, "ngModelChange", "ngModel"], [1, "task-form-actions"], [1, "nuxeo-action-btn", 3, "primary", "warn", "disabled"], ["diameter", "20"], [1, "task-form-section", "abandon-section"], [1, "task-form-section", "comments-section"], [1, "panel-collapse-handle"], ["mat-icon-button", "", 3, "matTooltip"], [1, "doc-preview-panel"], [3, "blobUrl", "rawBlobUrl", "blobType", "mimeType", "fileName", "fileSize", "loading"], [1, "preview-placeholder"], [3, "click", "items"], [1, "action-panel-header"], ["role", "heading", "aria-level", "4", 1, "action-panel-title"], ["mat-icon-button", "", 3, "click", "matTooltip"], [1, "action-panel-hint"], [1, "action-panel-chips"], [1, "participant-chip"], ["matInput", "", 3, "ngModelChange", "input", "ngModel", "placeholder"], [1, "search-dropdown"], ["matInput", "", "rows", "3", 3, "ngModelChange", "ngModel"], [1, "action-panel-buttons"], [1, "nuxeo-action-btn", "outline", 3, "click"], [1, "nuxeo-action-btn", "primary", 3, "click", "disabled"], [1, "chip-type-icon"], [1, "chip-x", 3, "click"], ["type", "button", 1, "dropdown-item"], ["type", "button", 1, "dropdown-item", 3, "click"], [1, "dropdown-id"], [1, "graph-loading"], [1, "graph-nodes"], [1, "graph-empty"], ["diameter", "24"], [1, "graph-node"], [1, "graph-node-marker"], [1, "node-icon", "done"], [1, "node-icon", "current"], [1, "node-icon", "pending"], [1, "graph-node-title"], [1, "graph-connector"], [1, "actor-avatar"], [1, "actor-name"], [1, "actor-chip", "delegated"], [1, "actor-avatar", "delegated"], [1, "section-label", "required"], [1, "participant-chips"], ["matSuffix", ""], [3, "ngModelChange", "ngModel"], ["value", "simpleReview"], ["value", "validation"], [1, "nuxeo-action-btn", 3, "click", "disabled"], [1, "nuxeo-action-btn", "outline", "warn-outline", 3, "click", "disabled"], [1, "comments-list"], [1, "comment-item"], [1, "comment-header"], [1, "comment-author"], [1, "comment-date"], [1, "comment-text"], [1, "actor-avatar", "small"], [3, "downloadClicked", "blobUrl", "rawBlobUrl", "blobType", "mimeType", "fileName", "fileSize", "loading"]], template: function TasksPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, TasksPageComponent_Conditional_2_Template, 6, 3, "div", 2)(3, TasksPageComponent_Conditional_3_Template, 6, 6, "div", 3)(4, TasksPageComponent_Conditional_4_Template, 62, 39);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.hasSelection() ? 2 : ctx.taskLoading() ? 3 : 4);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatIconModule, i2.MatIcon, MatButtonModule, i3.MatIconButton, MatProgressSpinnerModule, i4.MatProgressSpinner, MatFormFieldModule, i5.MatFormField, i5.MatLabel, i5.MatSuffix, MatInputModule, i6.MatInput, MatSelectModule, i7.MatSelect, i7.MatOption, MatDatepickerModule,
            MatSnackBarModule,
            MatTooltipModule, i8.MatTooltip, MatTabsModule,
            MatDividerModule, i9.MatDivider, DocumentViewerComponent,
            SatBreadcrumbsComponent,
            TranslatePipe], styles: ["\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.tasks-page[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr;\n  height: 100%;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n}\n\n\n\n\n\n\n.detail-area[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n\n.empty-detail[_ngcontent-%COMP%], \n.loading-detail[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  \n\n  color: var(--mat-sys-on-surface-variant, #474551);\n  gap: 0.5rem;\n\n  mat-icon {\n    font-size: 52px;\n    width: 52px;\n    height: 52px;\n    color: var(--mat-sys-outline-variant, #c8c5d3);\n  }\n\n  p {\n    margin: 0;\n    font-size: 0.9rem;\n  }\n}\n\n\n\n\n.doc-header-bar[_ngcontent-%COMP%] {\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  background: var(--mat-sys-surface-container-lowest, #fff);\n  padding: 10px 20px;\n  flex-shrink: 0;\n}\n\n.doc-header-top[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-header-type-icon[_ngcontent-%COMP%] {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.doc-header-titles[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.doc-main-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\nsat-breadcrumbs[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  margin-top: 2px;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n\n\n\n\n\n.task-content-area[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(320px, 1fr) 2fr;\n  flex: 1;\n  overflow: hidden;\n}\n\n\n\n\n.task-form-panel[_ngcontent-%COMP%] {\n  display: flex;\n  border-right: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  position: relative;\n  overflow: hidden;\n}\n\n.task-form-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px 24px;\n}\n\n.task-form-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.task-form-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.task-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n}\n\n.delegate-link[_ngcontent-%COMP%], \n.reassign-link[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: var(--mat-sys-primary, #5654ac);\n  cursor: pointer;\n  white-space: nowrap;\n\n  &:where(button) {\n    padding: 0;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-decoration: none;\n  }\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.view-graph-link[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-size: 0.82rem;\n  color: var(--mat-sys-primary, #5654ac);\n  cursor: pointer;\n  margin-bottom: 16px;\n\n  &:where(button) {\n    padding: 0;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-decoration: none;\n  }\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n\n\n\n.action-panel[_ngcontent-%COMP%] {\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  border-radius: 12px;\n  padding: 24px;\n  margin-bottom: 20px;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);\n}\n\n.action-panel-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n\n  .action-panel-title {\n    margin: 0;\n    font-size: 1rem;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n}\n\n.action-panel-hint[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin: 0 0 20px 0;\n}\n\n.action-panel-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 16px;\n  min-height: 4px;\n}\n\n.action-panel-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  margin-top: 16px;\n  padding-top: 8px;\n}\n\n\n\n\n.graph-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 16px 0;\n}\n\n.graph-nodes[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 4px 0;\n}\n\n.graph-node[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 0;\n}\n\n.graph-node-marker[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n\n.node-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n\n  &.done {\n    color: var(--sat-sys-success-icon, #4d9c4c);\n  }\n\n  &.current {\n    color: var(--mat-sys-primary, #5654ac);\n  }\n\n  &.pending {\n    color: var(--mat-sys-outline, #777683);\n  }\n}\n\n.graph-node-title[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.graph-node.current[_ngcontent-%COMP%]   .graph-node-title[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--mat-sys-primary, #5654ac);\n}\n\n.graph-node.done[_ngcontent-%COMP%]   .graph-node-title[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.graph-connector[_ngcontent-%COMP%] {\n  width: 2px;\n  height: 12px;\n  background: var(--mat-sys-outline-variant, #c8c5d3);\n  margin-left: 8px;\n}\n\n.graph-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 16px 0;\n  color: var(--mat-sys-outline, #777683);\n  font-size: 0.82rem;\n\n  mat-icon {\n    font-size: 28px;\n    width: 28px;\n    height: 28px;\n  }\n}\n\n\n\n\n.abandon-section[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding-top: 16px;\n\n  .nuxeo-action-btn {\n    margin-top: 8px;\n  }\n}\n\n.warn-outline[_ngcontent-%COMP%] {\n  background: transparent !important;\n  color: var(--mat-sys-error, #b02b36) !important;\n  border-color: var(--mat-sys-error, #b02b36) !important;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &:hover {\n    background: var(--mat-sys-error-container, #fbe2e3) !important;\n  }\n}\n\n\n\n\n.comments-section[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding-top: 16px;\n\n  .section-label {\n    margin-top: 8px;\n    margin-bottom: 8px;\n  }\n}\n\n.comments-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.comment-item[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n  border-radius: 6px;\n  border-left: 3px solid var(--mat-sys-primary, #5654ac);\n}\n\n.comment-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.comment-author[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.comment-date[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.comment-text[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  line-height: 1.4;\n}\n\n\n\n\n.actor-chip.delegated[_ngcontent-%COMP%]   .actor-avatar.delegated[_ngcontent-%COMP%] {\n  background: var(--sat-sys-cat-blue-container, #e5f3fc);\n  color: var(--sat-sys-on-cat-blue-container, #3060c6);\n}\n\n.actor-avatar.small[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  font-size: 0.65rem;\n}\n\n\n\n\n.task-form-section[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n\n.section-label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.78rem;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-bottom: 4px;\n\n  &.required::after {\n    content: ' *';\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n.due-value[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--sat-sys-success-icon, #4d9c4c);\n  font-weight: 500;\n\n  &.overdue {\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n\n\n\n.actor-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 4px;\n}\n\n.actor-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.actor-avatar[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  background: var(--sat-sys-important-icon, #c74f54);\n  color: var(--mat-sys-on-primary, #fff);\n  font-size: 0.72rem;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n.actor-name[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n}\n\n\n\n\n.participant-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 8px;\n  min-height: 26px;\n}\n\n.participant-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 2px 6px 2px 4px;\n  background: var(--sat-sys-cat-blue-container, #e5f3fc);\n  color: var(--sat-sys-on-cat-blue-container, #3060c6);\n  border-radius: 12px;\n  font-size: 0.78rem;\n  font-weight: 500;\n\n  .chip-type-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n  }\n\n  .chip-x {\n    display: inline-flex;\n    align-items: center;\n    background: none;\n    border: none;\n    padding: 0;\n    cursor: pointer;\n    color: var(--mat-sys-on-surface-variant, #474551);\n\n    mat-icon {\n      font-size: 13px;\n      width: 13px;\n      height: 13px;\n    }\n\n    &:hover {\n      color: var(--mat-sys-error, #b02b36);\n    }\n  }\n}\n\n\n\n\n.search-dropdown[_ngcontent-%COMP%] {\n  max-height: 160px;\n  overflow-y: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  border-radius: 4px;\n  margin-top: -6px;\n  margin-bottom: 10px;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n}\n\n.dropdown-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 12px;\n  cursor: pointer;\n  font-size: 0.82rem;\n\n  &:where(button) {\n    width: 100%;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-align: left;\n  }\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f4f3f7);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    color: var(--mat-sys-on-surface-variant, #474551);\n  }\n\n  .dropdown-id {\n    margin-left: auto;\n    color: var(--mat-sys-outline, #777683);\n    font-size: 0.72rem;\n  }\n}\n\n.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n//[_ngcontent-%COMP%]   Consistent[_ngcontent-%COMP%]   spacing[_ngcontent-%COMP%]   between[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   fields[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   action[_ngcontent-%COMP%]   panels\n.action-panel[_ngcontent-%COMP%] {\n  mat-form-field + mat-form-field {\n    margin-top: 8px;\n  }\n\n  mat-form-field {\n    margin-bottom: 4px;\n  }\n\n  textarea[matInput] {\n    resize: vertical;\n    min-height: 60px;\n  }\n}\n\n\n\n\n.task-form-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-top: 8px;\n}\n\n.nuxeo-action-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 20px;\n  border-radius: 20px;\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 2px solid var(--mat-sys-primary, #5654ac);\n  background: var(--mat-sys-primary, #5654ac);\n  color: var(--mat-sys-on-primary, #fff);\n  transition:\n    background 0.15s,\n    box-shadow 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-on-primary-container, #3e3b92);\n    border-color: var(--mat-sys-on-primary-container, #3e3b92);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: default;\n  }\n\n  &.primary {\n    background: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n    color: var(--mat-sys-on-primary, #fff);\n  }\n\n  &.warn {\n    background: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n    color: var(--mat-sys-on-primary, #fff);\n  }\n\n  &.outline {\n    background: transparent;\n    color: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n\n    &:hover {\n      background: var(--mat-sys-primary-container, #e2dfff);\n    }\n  }\n}\n\n\n\n\n.panel-collapse-handle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n  border-left: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  cursor: pointer;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant, #474551);\n  }\n}\n\n\n\n\n\n\n.doc-preview-panel[_ngcontent-%COMP%] {\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n}\n\n.preview-placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  gap: 0.5rem;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TasksPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-tasks-page', standalone: true, providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()], imports: [
                    TranslatePipe,
                    FormsModule,
                    MatIconModule,
                    MatButtonModule,
                    MatProgressSpinnerModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    MatSnackBarModule,
                    MatTooltipModule,
                    MatTabsModule,
                    MatDividerModule,
                    DocumentViewerComponent,
                    SatBreadcrumbsComponent,
                ], template: "<div class=\"tasks-page\">\n  <!-- Task list lives in the shell nav drawer only (single inbox). -->\n  <div class=\"detail-area\">\n    @if (!hasSelection()) {\n      <div class=\"empty-detail\">\n        <mat-icon>assignment</mat-icon>\n        <p>\n          {{ 'tasks.tasks-page.select-a-task' | translate }}\n        </p>\n      </div>\n    } @else if (taskLoading()) {\n      <div class=\"loading-detail\">\n        <mat-spinner\n          diameter=\"36\"\n          [attr.aria-label]=\"'tasks.tasks-page.loading' | translate\"\n        /><span>{{ 'tasks.tasks-page.loading-2' | translate }}</span>\n      </div>\n    } @else {\n      <!-- Document Header Bar (title + breadcrumb) \u2014 spans full width -->\n      <div class=\"doc-header-bar\">\n        <div class=\"doc-header-top\">\n          <mat-icon class=\"doc-header-type-icon\">description</mat-icon>\n          <div class=\"doc-header-titles\">\n            @if (targetDoc()) {\n              <div class=\"doc-main-title\" role=\"heading\" aria-level=\"1\">\n                {{ targetDoc()!.title }}\n              </div>\n              <sat-breadcrumbs\n                [items]=\"breadcrumbItems()\"\n                (click)=\"onBreadcrumbClick($event)\"\n              ></sat-breadcrumbs>\n            } @else {\n              <div class=\"doc-main-title\" role=\"heading\" aria-level=\"1\">\n                {{ selectedTask()!.targetDocTitle || ('tasks.document' | translate) }}\n              </div>\n            }\n          </div>\n        </div>\n      </div>\n\n      <!-- Two-panel split: Task Form (left) + Document Preview (right) -->\n      <div class=\"task-content-area\">\n        <!-- \u2500\u2500\u2500 Task Form Panel (middle column) \u2500\u2500\u2500 -->\n        <section class=\"task-form-panel\">\n          <div class=\"task-form-scroll\">\n            <!-- Task title + Delegate / Reassign links -->\n            <div class=\"task-form-header\">\n              <div class=\"task-form-title\" role=\"heading\" aria-level=\"3\">\n                {{ taskDirective(selectedTask()!) }}\n              </div>\n              <div class=\"task-header-actions\">\n                <button type=\"button\" class=\"delegate-link\" (click)=\"openDelegatePanel()\">\n                  {{ 'tasks.tasks-page.delegate' | translate }}\n                </button>\n                <button type=\"button\" class=\"reassign-link\" (click)=\"openReassignPanel()\">\n                  {{ 'tasks.tasks-page.reassign' | translate }}\n                </button>\n              </div>\n            </div>\n\n            <!-- View Graph link -->\n            <button type=\"button\" class=\"view-graph-link\" (click)=\"openGraphPanel()\">\n              {{ 'tasks.tasks-page.view-graph' | translate }}\n            </button>\n\n            <!-- \u2550\u2550\u2550 Delegate Panel (inline) \u2550\u2550\u2550 -->\n            @if (showDelegatePanel()) {\n              <div class=\"action-panel delegate-panel\">\n                <div class=\"action-panel-header\">\n                  <div class=\"action-panel-title\" role=\"heading\" aria-level=\"4\">\n                    {{ 'tasks.tasks-page.delegate-task' | translate }}\n                  </div>\n                  <button\n                    mat-icon-button\n                    (click)=\"closeDelegatePanel()\"\n                    [matTooltip]=\"'tasks.tasks-page.close' | translate\"\n                    [attr.aria-label]=\"'tasks.tasks-page.close' | translate\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                </div>\n                <p class=\"action-panel-hint\">\n                  {{ 'tasks.tasks-page.add-users-or-groups-to-delegate' | translate }}\n                </p>\n\n                <div class=\"action-panel-chips\">\n                  @for (actor of delegateActors; track actor) {\n                    <span class=\"participant-chip\">\n                      <mat-icon class=\"chip-type-icon\">{{\n                        actor.startsWith('group:') ? 'group' : 'person'\n                      }}</mat-icon>\n                      {{ formatParticipant(actor) }}\n                      <button class=\"chip-x\" (click)=\"removeDelegateActor(actor)\">\n                        <mat-icon>close</mat-icon>\n                      </button>\n                    </span>\n                  }\n                </div>\n\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.search-users-or-groups' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [(ngModel)]=\"delegateInput\"\n                    (input)=\"searchDelegateUsers()\"\n                    [placeholder]=\"'tasks.tasks-page.type-to-search' | translate\"\n                  />\n                </mat-form-field>\n\n                @if (delegateUserResults().length > 0 || delegateGroupResults().length > 0) {\n                  <div class=\"search-dropdown\">\n                    @for (user of delegateUserResults(); track user.id) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addDelegateActor('user:' + user.id)\"\n                      >\n                        <mat-icon>person</mat-icon>\n                        <span>{{ user.properties.firstName }} {{ user.properties.lastName }}</span>\n                        <span class=\"dropdown-id\">{{ user.id }}</span>\n                      </button>\n                    }\n                    @for (group of delegateGroupResults(); track group.groupname) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addDelegateActor('group:' + group.groupname)\"\n                      >\n                        <mat-icon>group</mat-icon>\n                        <span>{{ group.grouplabel || group.groupname }}</span>\n                        <span class=\"dropdown-id\">{{ group.groupname }}</span>\n                      </button>\n                    }\n                  </div>\n                }\n\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.comment-optional' | translate }}</mat-label>\n                  <textarea matInput [(ngModel)]=\"delegateComment\" rows=\"3\"></textarea>\n                </mat-form-field>\n\n                <div class=\"action-panel-buttons\">\n                  <button class=\"nuxeo-action-btn outline\" (click)=\"closeDelegatePanel()\">\n                    {{ 'tasks.tasks-page.cancel' | translate }}\n                  </button>\n                  <button\n                    class=\"nuxeo-action-btn primary\"\n                    [disabled]=\"delegateActors.length === 0 || submitting()\"\n                    (click)=\"confirmDelegate()\"\n                  >\n                    {{ 'tasks.tasks-page.delegate' | translate }}\n                  </button>\n                </div>\n              </div>\n            }\n\n            <!-- \u2550\u2550\u2550 Reassign Panel (inline) \u2550\u2550\u2550 -->\n            @if (showReassignPanel()) {\n              <div class=\"action-panel reassign-panel\">\n                <div class=\"action-panel-header\">\n                  <div class=\"action-panel-title\" role=\"heading\" aria-level=\"4\">\n                    {{ 'tasks.tasks-page.reassign-task' | translate }}\n                  </div>\n                  <button\n                    mat-icon-button\n                    (click)=\"closeReassignPanel()\"\n                    [matTooltip]=\"'tasks.tasks-page.close' | translate\"\n                    [attr.aria-label]=\"'tasks.tasks-page.close' | translate\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                </div>\n                <p class=\"action-panel-hint\">\n                  {{ 'tasks.tasks-page.select-new-assignees-the-current-assignees' | translate }}\n                </p>\n\n                <div class=\"action-panel-chips\">\n                  @for (actor of reassignActors; track actor) {\n                    <span class=\"participant-chip\">\n                      <mat-icon class=\"chip-type-icon\">{{\n                        actor.startsWith('group:') ? 'group' : 'person'\n                      }}</mat-icon>\n                      {{ formatParticipant(actor) }}\n                      <button class=\"chip-x\" (click)=\"removeReassignActor(actor)\">\n                        <mat-icon>close</mat-icon>\n                      </button>\n                    </span>\n                  }\n                </div>\n\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.search-users-or-groups' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [(ngModel)]=\"reassignInput\"\n                    (input)=\"searchReassignUsers()\"\n                    [placeholder]=\"'tasks.tasks-page.type-to-search' | translate\"\n                  />\n                </mat-form-field>\n\n                @if (reassignUserResults().length > 0 || reassignGroupResults().length > 0) {\n                  <div class=\"search-dropdown\">\n                    @for (user of reassignUserResults(); track user.id) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addReassignActor('user:' + user.id)\"\n                      >\n                        <mat-icon>person</mat-icon>\n                        <span>{{ user.properties.firstName }} {{ user.properties.lastName }}</span>\n                        <span class=\"dropdown-id\">{{ user.id }}</span>\n                      </button>\n                    }\n                    @for (group of reassignGroupResults(); track group.groupname) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addReassignActor('group:' + group.groupname)\"\n                      >\n                        <mat-icon>group</mat-icon>\n                        <span>{{ group.grouplabel || group.groupname }}</span>\n                        <span class=\"dropdown-id\">{{ group.groupname }}</span>\n                      </button>\n                    }\n                  </div>\n                }\n\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.comment-optional' | translate }}</mat-label>\n                  <textarea matInput [(ngModel)]=\"reassignComment\" rows=\"3\"></textarea>\n                </mat-form-field>\n\n                <div class=\"action-panel-buttons\">\n                  <button class=\"nuxeo-action-btn outline\" (click)=\"closeReassignPanel()\">\n                    {{ 'tasks.tasks-page.cancel' | translate }}\n                  </button>\n                  <button\n                    class=\"nuxeo-action-btn primary\"\n                    [disabled]=\"reassignActors.length === 0 || submitting()\"\n                    (click)=\"confirmReassign()\"\n                  >\n                    {{ 'tasks.tasks-page.reassign' | translate }}\n                  </button>\n                </div>\n              </div>\n            }\n\n            <!-- \u2550\u2550\u2550 Graph Panel (inline) \u2550\u2550\u2550 -->\n            @if (showGraphPanel()) {\n              <div class=\"action-panel graph-panel\">\n                <div class=\"action-panel-header\">\n                  <div class=\"action-panel-title\" role=\"heading\" aria-level=\"4\">\n                    {{ 'tasks.tasks-page.workflow-graph' | translate }}\n                  </div>\n                  <button\n                    mat-icon-button\n                    (click)=\"closeGraphPanel()\"\n                    [matTooltip]=\"'tasks.tasks-page.close' | translate\"\n                    [attr.aria-label]=\"'tasks.tasks-page.close' | translate\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                </div>\n\n                @if (graphLoading()) {\n                  <div class=\"graph-loading\">\n                    <mat-spinner\n                      diameter=\"24\"\n                      [attr.aria-label]=\"'tasks.tasks-page.loading' | translate\"\n                    />\n                  </div>\n                } @else if (graphNodes().length > 0) {\n                  <div class=\"graph-nodes\">\n                    @for (node of graphNodes(); track node.id; let i = $index; let last = $last) {\n                      <div\n                        class=\"graph-node\"\n                        [class.current]=\"node.isCurrent\"\n                        [class.done]=\"node.state === 'done'\"\n                      >\n                        <div class=\"graph-node-marker\">\n                          @if (node.state === 'done') {\n                            <mat-icon class=\"node-icon done\">check_circle</mat-icon>\n                          } @else if (node.isCurrent) {\n                            <mat-icon class=\"node-icon current\">radio_button_checked</mat-icon>\n                          } @else {\n                            <mat-icon class=\"node-icon pending\">radio_button_unchecked</mat-icon>\n                          }\n                        </div>\n                        <span class=\"graph-node-title\">{{ node.title }}</span>\n                      </div>\n                      @if (!last) {\n                        <div class=\"graph-connector\"></div>\n                      }\n                    }\n                  </div>\n                } @else {\n                  <div class=\"graph-empty\">\n                    <mat-icon>account_tree</mat-icon>\n                    <span>{{ 'tasks.tasks-page.no-graph-data-available' | translate }}</span>\n                  </div>\n                }\n              </div>\n            }\n\n            <!-- Actors in this task -->\n            <div class=\"task-form-section\">\n              <span class=\"section-label\">{{\n                'tasks.tasks-page.actors-in-this-task' | translate\n              }}</span>\n              <div class=\"actor-chips\">\n                @for (actor of taskActors(); track actor) {\n                  <span class=\"actor-chip\">\n                    <span class=\"actor-avatar\">{{ actor.charAt(0).toUpperCase() }}</span>\n                    <span class=\"actor-name\">{{ actor }}</span>\n                  </span>\n                }\n              </div>\n            </div>\n\n            <!-- Delegated actors (if any) -->\n            @if (delegatedActorsList.length > 0) {\n              <div class=\"task-form-section\">\n                <span class=\"section-label\">{{ 'tasks.tasks-page.delegated-to' | translate }}</span>\n                <div class=\"actor-chips\">\n                  @for (actor of delegatedActorsList; track actor) {\n                    <span class=\"actor-chip delegated\">\n                      <span class=\"actor-avatar delegated\">{{\n                        actor.replace('user:', '').replace('group:', '').charAt(0).toUpperCase()\n                      }}</span>\n                      <span class=\"actor-name\">{{ formatParticipant(actor) }}</span>\n                    </span>\n                  }\n                </div>\n              </div>\n            }\n\n            <!-- Due date display -->\n            <div class=\"task-form-section\">\n              <span class=\"section-label\">{{ 'tasks.tasks-page.due' | translate }}</span>\n              <span class=\"due-value\" [class.overdue]=\"isOverdue(selectedTask()!)\">\n                {{ dueLabel(selectedTask()!) }}\n              </span>\n            </div>\n\n            @if (isChooseParticipants) {\n              <!-- Participants field -->\n              <div class=\"task-form-section\">\n                <span class=\"section-label required\">{{\n                  'tasks.tasks-page.participants' | translate\n                }}</span>\n\n                <div class=\"participant-chips\">\n                  @for (p of participants; track p) {\n                    <span class=\"participant-chip\">\n                      <mat-icon class=\"chip-type-icon\">{{\n                        p.startsWith('group:') ? 'group' : 'person'\n                      }}</mat-icon>\n                      {{ formatParticipant(p) }}\n                      <button class=\"chip-x\" (click)=\"removeParticipant(p)\">\n                        <mat-icon>close</mat-icon>\n                      </button>\n                    </span>\n                  }\n                </div>\n\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.search-users-or-groups' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [(ngModel)]=\"participantInput\"\n                    (input)=\"searchUsers()\"\n                    [placeholder]=\"'tasks.tasks-page.type-to-search' | translate\"\n                  />\n                  @if (searching()) {\n                    <mat-icon matSuffix>hourglass_empty</mat-icon>\n                  }\n                </mat-form-field>\n\n                @if (userResults().length > 0 || groupResults().length > 0) {\n                  <div class=\"search-dropdown\">\n                    @for (user of userResults(); track user.id) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addParticipant('user:' + user.id)\"\n                      >\n                        <mat-icon>person</mat-icon>\n                        <span>{{ user.properties.firstName }} {{ user.properties.lastName }}</span>\n                        <span class=\"dropdown-id\">{{ user.id }}</span>\n                      </button>\n                    }\n                    @for (group of groupResults(); track group.groupname) {\n                      <button\n                        type=\"button\"\n                        class=\"dropdown-item\"\n                        (click)=\"addParticipant('group:' + group.groupname)\"\n                      >\n                        <mat-icon>group</mat-icon>\n                        <span>{{ group.grouplabel || group.groupname }}</span>\n                        <span class=\"dropdown-id\">{{ group.groupname }}</span>\n                      </button>\n                    }\n                  </div>\n                }\n              </div>\n\n              <!-- Review Type -->\n              <div class=\"task-form-section\">\n                <mat-form-field appearance=\"outline\" class=\"full-width\">\n                  <mat-label>{{ 'tasks.tasks-page.review-type' | translate }}</mat-label>\n                  <mat-select [(ngModel)]=\"validationOrReview\">\n                    <mat-option value=\"simpleReview\">{{\n                      'tasks.tasks-page.simple-review' | translate\n                    }}</mat-option>\n                    <mat-option value=\"validation\">{{\n                      'tasks.tasks-page.validation' | translate\n                    }}</mat-option>\n                  </mat-select>\n                </mat-form-field>\n              </div>\n            }\n\n            <!-- Comment -->\n            <div class=\"task-form-section\">\n              <label class=\"section-label\" for=\"tasks-page-comment-input\">{{\n                'tasks.tasks-page.comment' | translate\n              }}</label>\n              <mat-form-field appearance=\"outline\" class=\"full-width\">\n                <input\n                  id=\"tasks-page-comment-input\"\n                  matInput\n                  [(ngModel)]=\"comment\"\n                  placeholder=\"\"\n                />\n              </mat-form-field>\n            </div>\n\n            <!-- Action buttons -->\n            <div class=\"task-form-actions\">\n              @for (action of actions; track action.name) {\n                <button\n                  class=\"nuxeo-action-btn\"\n                  [class.primary]=\"actionColor(action) === 'primary'\"\n                  [class.warn]=\"actionColor(action) === 'warn'\"\n                  [disabled]=\"submitting()\"\n                  (click)=\"executeAction(action)\"\n                >\n                  {{ actionLabel(action) }}\n                </button>\n              }\n              @if (submitting()) {\n                <mat-spinner\n                  diameter=\"20\"\n                  [attr.aria-label]=\"'tasks.tasks-page.loading' | translate\"\n                />\n              }\n            </div>\n\n            <!-- Abandon workflow button -->\n            @if (selectedTask()?.workflowInstanceId) {\n              <div class=\"task-form-section abandon-section\">\n                <mat-divider />\n                <button\n                  class=\"nuxeo-action-btn outline warn-outline\"\n                  [disabled]=\"submitting()\"\n                  (click)=\"abandonWorkflow()\"\n                >\n                  <mat-icon>cancel</mat-icon> {{ 'tasks.tasks-page.abandon-workflow' | translate }}\n                </button>\n              </div>\n            }\n\n            <!-- Task comments history -->\n            @if (taskComments.length > 0) {\n              <div class=\"task-form-section comments-section\">\n                <mat-divider />\n                <span class=\"section-label\">{{ 'tasks.tasks-page.comments' | translate }}</span>\n                <div class=\"comments-list\">\n                  @for (c of taskComments; track $index) {\n                    <div class=\"comment-item\">\n                      <div class=\"comment-header\">\n                        @if (c.author) {\n                          <span class=\"comment-author\">\n                            <span class=\"actor-avatar small\">{{\n                              c.author.charAt(0).toUpperCase()\n                            }}</span>\n                            {{ c.author }}\n                          </span>\n                        }\n                        @if (c.date) {\n                          <span class=\"comment-date\">{{ c.date }}</span>\n                        }\n                      </div>\n                      <p class=\"comment-text\">{{ c.text }}</p>\n                    </div>\n                  }\n                </div>\n              </div>\n            }\n          </div>\n\n          <!-- Collapse handle -->\n          <div class=\"panel-collapse-handle\">\n            <button\n              mat-icon-button\n              [matTooltip]=\"'tasks.tasks-page.collapse' | translate\"\n              [attr.aria-label]=\"'tasks.tasks-page.collapse' | translate\"\n            >\n              <mat-icon>chevron_left</mat-icon>\n            </button>\n          </div>\n        </section>\n\n        <!-- \u2500\u2500\u2500 Document Preview Panel (right column) \u2500\u2500\u2500 -->\n        <section class=\"doc-preview-panel\">\n          @if (targetDoc()) {\n            <lib-document-viewer\n              [blobUrl]=\"previewUrl()\"\n              [rawBlobUrl]=\"rawPreviewUrl()\"\n              [blobType]=\"previewBlobType()\"\n              [mimeType]=\"viewerMimeType()\"\n              [fileName]=\"fileName()\"\n              [fileSize]=\"fileSize()\"\n              [loading]=\"docLoading()\"\n              (downloadClicked)=\"download()\"\n            />\n          } @else {\n            <div class=\"preview-placeholder\">\n              <mat-icon>insert_drive_file</mat-icon>\n              <span>{{ docLoading() ? 'Loading...' : ('tasks.no-document' | translate) }}</span>\n            </div>\n          }\n        </section>\n      </div>\n    }\n  </div>\n</div>\n", styles: ["/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   Tasks page \u2014 task list in shell nav drawer; form + preview here\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n\n:host {\n  display: block;\n  height: 100%;\n}\n\n.tasks-page {\n  display: grid;\n  grid-template-columns: 1fr;\n  height: 100%;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   Detail area (header + content)\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n\n.detail-area {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n\n.empty-detail,\n.loading-detail {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  /* The outline token is 4.46:1 on white, under WCAG AA's 4.5:1 for this text; on-surface-variant clears it. */\n  color: var(--mat-sys-on-surface-variant, #474551);\n  gap: 0.5rem;\n\n  mat-icon {\n    font-size: 52px;\n    width: 52px;\n    height: 52px;\n    color: var(--mat-sys-outline-variant, #c8c5d3);\n  }\n\n  p {\n    margin: 0;\n    font-size: 0.9rem;\n  }\n}\n\n/* \u2500\u2500\u2500 Document Header Bar \u2500\u2500\u2500 */\n\n.doc-header-bar {\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  background: var(--mat-sys-surface-container-lowest, #fff);\n  padding: 10px 20px;\n  flex-shrink: 0;\n}\n\n.doc-header-top {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-header-type-icon {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.doc-header-titles {\n  flex: 1;\n  min-width: 0;\n}\n\n.doc-main-title {\n  margin: 0;\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\nsat-breadcrumbs {\n  font-size: 0.72rem;\n  margin-top: 2px;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   TASK CONTENT AREA \u2014 2-panel split (form + preview)\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n\n.task-content-area {\n  display: grid;\n  grid-template-columns: minmax(320px, 1fr) 2fr;\n  flex: 1;\n  overflow: hidden;\n}\n\n/* \u2500\u2500\u2500 Task Form Panel (left/middle) \u2500\u2500\u2500 */\n\n.task-form-panel {\n  display: flex;\n  border-right: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  position: relative;\n  overflow: hidden;\n}\n\n.task-form-scroll {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px 24px;\n}\n\n.task-form-header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.task-form-title {\n  margin: 0;\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.task-header-actions {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n}\n\n.delegate-link,\n.reassign-link {\n  font-size: 0.82rem;\n  color: var(--mat-sys-primary, #5654ac);\n  cursor: pointer;\n  white-space: nowrap;\n\n  &:where(button) {\n    padding: 0;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-decoration: none;\n  }\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.view-graph-link {\n  display: inline-block;\n  font-size: 0.82rem;\n  color: var(--mat-sys-primary, #5654ac);\n  cursor: pointer;\n  margin-bottom: 16px;\n\n  &:where(button) {\n    padding: 0;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-decoration: none;\n  }\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n/* \u2500\u2500\u2500 Action panels (delegate / reassign / graph) \u2500\u2500\u2500 */\n\n.action-panel {\n  background: #fff;\n  border: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  border-radius: 12px;\n  padding: 24px;\n  margin-bottom: 20px;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);\n}\n\n.action-panel-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n\n  .action-panel-title {\n    margin: 0;\n    font-size: 1rem;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n}\n\n.action-panel-hint {\n  font-size: 0.82rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin: 0 0 20px 0;\n}\n\n.action-panel-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 16px;\n  min-height: 4px;\n}\n\n.action-panel-buttons {\n  display: flex;\n  gap: 10px;\n  margin-top: 16px;\n  padding-top: 8px;\n}\n\n/* \u2500\u2500\u2500 Graph panel \u2500\u2500\u2500 */\n\n.graph-loading {\n  display: flex;\n  justify-content: center;\n  padding: 16px 0;\n}\n\n.graph-nodes {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 4px 0;\n}\n\n.graph-node {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 0;\n}\n\n.graph-node-marker {\n  display: flex;\n  align-items: center;\n}\n\n.node-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n\n  &.done {\n    color: var(--sat-sys-success-icon, #4d9c4c);\n  }\n\n  &.current {\n    color: var(--mat-sys-primary, #5654ac);\n  }\n\n  &.pending {\n    color: var(--mat-sys-outline, #777683);\n  }\n}\n\n.graph-node-title {\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.graph-node.current .graph-node-title {\n  font-weight: 600;\n  color: var(--mat-sys-primary, #5654ac);\n}\n\n.graph-node.done .graph-node-title {\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.graph-connector {\n  width: 2px;\n  height: 12px;\n  background: var(--mat-sys-outline-variant, #c8c5d3);\n  margin-left: 8px;\n}\n\n.graph-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 16px 0;\n  color: var(--mat-sys-outline, #777683);\n  font-size: 0.82rem;\n\n  mat-icon {\n    font-size: 28px;\n    width: 28px;\n    height: 28px;\n  }\n}\n\n/* \u2500\u2500\u2500 Abandon workflow \u2500\u2500\u2500 */\n\n.abandon-section {\n  margin-top: 16px;\n  padding-top: 16px;\n\n  .nuxeo-action-btn {\n    margin-top: 8px;\n  }\n}\n\n.warn-outline {\n  background: transparent !important;\n  color: var(--mat-sys-error, #b02b36) !important;\n  border-color: var(--mat-sys-error, #b02b36) !important;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &:hover {\n    background: var(--mat-sys-error-container, #fbe2e3) !important;\n  }\n}\n\n/* \u2500\u2500\u2500 Task comments history \u2500\u2500\u2500 */\n\n.comments-section {\n  margin-top: 16px;\n  padding-top: 16px;\n\n  .section-label {\n    margin-top: 8px;\n    margin-bottom: 8px;\n  }\n}\n\n.comments-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.comment-item {\n  padding: 8px 12px;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n  border-radius: 6px;\n  border-left: 3px solid var(--mat-sys-primary, #5654ac);\n}\n\n.comment-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.comment-author {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.comment-date {\n  font-size: 0.7rem;\n  color: var(--mat-sys-on-surface-variant, #474551);\n}\n\n.comment-text {\n  margin: 0;\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  line-height: 1.4;\n}\n\n/* \u2500\u2500\u2500 Delegated actor chips \u2500\u2500\u2500 */\n\n.actor-chip.delegated .actor-avatar.delegated {\n  background: var(--sat-sys-cat-blue-container, #e5f3fc);\n  color: var(--sat-sys-on-cat-blue-container, #3060c6);\n}\n\n.actor-avatar.small {\n  width: 20px;\n  height: 20px;\n  font-size: 0.65rem;\n}\n\n/* \u2500\u2500\u2500 Task form sections \u2500\u2500\u2500 */\n\n.task-form-section {\n  margin-bottom: 16px;\n}\n\n.section-label {\n  display: block;\n  font-size: 0.78rem;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-bottom: 4px;\n\n  &.required::after {\n    content: ' *';\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n.due-value {\n  font-size: 0.85rem;\n  color: var(--sat-sys-success-icon, #4d9c4c);\n  font-weight: 500;\n\n  &.overdue {\n    color: var(--mat-sys-error, #b02b36);\n  }\n}\n\n/* \u2500\u2500\u2500 Actor chips \u2500\u2500\u2500 */\n\n.actor-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 4px;\n}\n\n.actor-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 0.82rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.actor-avatar {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  background: var(--sat-sys-important-icon, #c74f54);\n  color: var(--mat-sys-on-primary, #fff);\n  font-size: 0.72rem;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n.actor-name {\n  font-size: 0.82rem;\n}\n\n/* \u2500\u2500\u2500 Participant chips \u2500\u2500\u2500 */\n\n.participant-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 8px;\n  min-height: 26px;\n}\n\n.participant-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 2px 6px 2px 4px;\n  background: var(--sat-sys-cat-blue-container, #e5f3fc);\n  color: var(--sat-sys-on-cat-blue-container, #3060c6);\n  border-radius: 12px;\n  font-size: 0.78rem;\n  font-weight: 500;\n\n  .chip-type-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n  }\n\n  .chip-x {\n    display: inline-flex;\n    align-items: center;\n    background: none;\n    border: none;\n    padding: 0;\n    cursor: pointer;\n    color: var(--mat-sys-on-surface-variant, #474551);\n\n    mat-icon {\n      font-size: 13px;\n      width: 13px;\n      height: 13px;\n    }\n\n    &:hover {\n      color: var(--mat-sys-error, #b02b36);\n    }\n  }\n}\n\n/* \u2500\u2500\u2500 Search dropdown \u2500\u2500\u2500 */\n\n.search-dropdown {\n  max-height: 160px;\n  overflow-y: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  border-radius: 4px;\n  margin-top: -6px;\n  margin-bottom: 10px;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n}\n\n.dropdown-item {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 12px;\n  cursor: pointer;\n  font-size: 0.82rem;\n\n  &:where(button) {\n    width: 100%;\n    border: none;\n    background: transparent;\n    font: inherit;\n    color: inherit;\n    text-align: left;\n  }\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f4f3f7);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    color: var(--mat-sys-on-surface-variant, #474551);\n  }\n\n  .dropdown-id {\n    margin-left: auto;\n    color: var(--mat-sys-outline, #777683);\n    font-size: 0.72rem;\n  }\n}\n\n.full-width {\n  width: 100%;\n}\n\n// Consistent spacing between form fields inside action panels\n.action-panel {\n  mat-form-field + mat-form-field {\n    margin-top: 8px;\n  }\n\n  mat-form-field {\n    margin-bottom: 4px;\n  }\n\n  textarea[matInput] {\n    resize: vertical;\n    min-height: 60px;\n  }\n}\n\n/* \u2500\u2500\u2500 Action buttons \u2500\u2500\u2500 */\n\n.task-form-actions {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-top: 8px;\n}\n\n.nuxeo-action-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 20px;\n  border-radius: 20px;\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 2px solid var(--mat-sys-primary, #5654ac);\n  background: var(--mat-sys-primary, #5654ac);\n  color: var(--mat-sys-on-primary, #fff);\n  transition:\n    background 0.15s,\n    box-shadow 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-on-primary-container, #3e3b92);\n    border-color: var(--mat-sys-on-primary-container, #3e3b92);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: default;\n  }\n\n  &.primary {\n    background: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n    color: var(--mat-sys-on-primary, #fff);\n  }\n\n  &.warn {\n    background: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n    color: var(--mat-sys-on-primary, #fff);\n  }\n\n  &.outline {\n    background: transparent;\n    color: var(--mat-sys-primary, #5654ac);\n    border-color: var(--mat-sys-primary, #5654ac);\n\n    &:hover {\n      background: var(--mat-sys-primary-container, #e2dfff);\n    }\n  }\n}\n\n/* \u2500\u2500\u2500 Collapse handle (between form & preview) \u2500\u2500\u2500 */\n\n.panel-collapse-handle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n  border-left: 1px solid var(--mat-sys-outline-variant, #c8c5d3);\n  cursor: pointer;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant, #474551);\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n   Document Preview Panel (right)\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n\n.doc-preview-panel {\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  background: var(--mat-sys-surface-container-low, #f4f3f7);\n}\n\n.preview-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  gap: 0.5rem;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TasksPageComponent, { className: "TasksPageComponent", filePath: "libs/features/tasks/src/lib/tasks-page/tasks-page.component.ts", lineNumber: 81 }); })();
