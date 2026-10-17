import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { catchError, filter, forkJoin, map, of, switchMap, tap, timer } from 'rxjs';
import { UserService, resolvePaginatedListTotal, } from '@nuxeo/satori-platform/nuxeo-client';
import { ConfirmDialogComponent } from '@nuxeo/satori-platform/ui';
import { GroupFormDialogComponent, } from '../group-form-dialog/group-form-dialog.component';
import { UserFormDialogComponent, } from '../user-form-dialog/user-form-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/table";
import * as i7 from "@angular/material/tabs";
import * as i8 from "@angular/material/tooltip";
import * as i9 from "@angular/material/progress-spinner";
import * as i10 from "@angular/material/menu";
import * as i11 from "@angular/material/paginator";
const _c0 = ["ugTabGroup"];
const _c1 = a0 => [a0];
function AdminUsersGroupsPageComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵelement(1, "mat-spinner", 25);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.loading"));
} }
function AdminUsersGroupsPageComponent_Conditional_45_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.name"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_45_td_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 38);
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_45_td_4_Template_button_click_1_listener() { const row_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.openRecentRow(row_r3)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r3 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", row_r3.name, " ");
} }
function AdminUsersGroupsPageComponent_Conditional_45_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.identifier"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_45_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r5.identifier);
} }
function AdminUsersGroupsPageComponent_Conditional_45_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.email"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_45_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r6.email || "\u2014");
} }
function AdminUsersGroupsPageComponent_Conditional_45_tr_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 39);
} }
function AdminUsersGroupsPageComponent_Conditional_45_tr_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 40);
} }
function AdminUsersGroupsPageComponent_Conditional_45_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-paginator", 41);
    i0.ɵɵlistener("page", function AdminUsersGroupsPageComponent_Conditional_45_Conditional_13_Template_mat_paginator_page_0_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.onRecentPage($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("length", ctx_r3.recentRows().length)("pageIndex", ctx_r3.recentPageIndex())("pageSize", ctx_r3.recentPageSize)("pageSizeOptions", i0.ɵɵpureFunction1(5, _c1, ctx_r3.recentPageSize))("hidePageSize", true);
} }
function AdminUsersGroupsPageComponent_Conditional_45_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.no-recent-user-or-group"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "table", 26);
    i0.ɵɵelementContainerStart(2, 27);
    i0.ɵɵtemplate(3, AdminUsersGroupsPageComponent_Conditional_45_th_3_Template, 3, 3, "th", 28)(4, AdminUsersGroupsPageComponent_Conditional_45_td_4_Template, 3, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 30);
    i0.ɵɵtemplate(6, AdminUsersGroupsPageComponent_Conditional_45_th_6_Template, 3, 3, "th", 28)(7, AdminUsersGroupsPageComponent_Conditional_45_td_7_Template, 2, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 31);
    i0.ɵɵtemplate(9, AdminUsersGroupsPageComponent_Conditional_45_th_9_Template, 3, 3, "th", 28)(10, AdminUsersGroupsPageComponent_Conditional_45_td_10_Template, 2, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(11, AdminUsersGroupsPageComponent_Conditional_45_tr_11_Template, 1, 0, "tr", 32)(12, AdminUsersGroupsPageComponent_Conditional_45_tr_12_Template, 1, 0, "tr", 33);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AdminUsersGroupsPageComponent_Conditional_45_Conditional_13_Template, 1, 7, "mat-paginator", 34);
    i0.ɵɵconditionalCreate(14, AdminUsersGroupsPageComponent_Conditional_45_Conditional_14_Template, 3, 3, "p", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r3.recentRowsPage());
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r3.recentColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r3.recentColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.recentRows().length > 0 ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.recentRows().length === 0 ? 14 : -1);
} }
function AdminUsersGroupsPageComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵelement(1, "mat-spinner", 42);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.loading"));
} }
function AdminUsersGroupsPageComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.usersError());
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.username"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 38);
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_52_td_4_Template_button_click_1_listener() { const u_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.selectUser(u_r10)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const u_r10 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", u_r10.id, " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.name"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_7_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 38);
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_52_td_7_Template_button_click_1_listener() { const u_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.selectUser(u_r12)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const u_r12 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.displayName(u_r12), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.email"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const u_r13 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(u_r13.properties.email);
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.groups"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 48);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const u_r14 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.groupsLabel(u_r14));
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.admin"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_16_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 49);
    i0.ɵɵtext(1, "verified");
    i0.ɵɵelementEnd();
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 37);
    i0.ɵɵconditionalCreate(1, AdminUsersGroupsPageComponent_Conditional_52_td_16_Conditional_1_Template, 2, 0, "mat-icon", 49);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const u_r15 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(u_r15.isAdministrator ? 1 : -1);
} }
function AdminUsersGroupsPageComponent_Conditional_52_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 36);
} }
function AdminUsersGroupsPageComponent_Conditional_52_td_19_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 17);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_52_td_19_Template_button_click_1_listener() { const u_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.openEditUser(u_r17)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 17);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_52_td_19_Template_button_click_6_listener() { const u_r17 = i0.ɵɵrestoreView(_r16).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.confirmDeleteUser(u_r17)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "delete_outline");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 4, "admin.admin-users-groups-page.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 6, "admin.admin-users-groups-page.edit-user"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 8, "admin.admin-users-groups-page.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 10, "admin.admin-users-groups-page.delete-user"));
} }
function AdminUsersGroupsPageComponent_Conditional_52_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 39);
} }
function AdminUsersGroupsPageComponent_Conditional_52_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 40);
} }
function AdminUsersGroupsPageComponent_Conditional_52_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.usersEmptyMessage());
} }
function AdminUsersGroupsPageComponent_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "table", 26);
    i0.ɵɵelementContainerStart(2, 43);
    i0.ɵɵtemplate(3, AdminUsersGroupsPageComponent_Conditional_52_th_3_Template, 3, 3, "th", 28)(4, AdminUsersGroupsPageComponent_Conditional_52_td_4_Template, 3, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 27);
    i0.ɵɵtemplate(6, AdminUsersGroupsPageComponent_Conditional_52_th_6_Template, 3, 3, "th", 28)(7, AdminUsersGroupsPageComponent_Conditional_52_td_7_Template, 3, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 31);
    i0.ɵɵtemplate(9, AdminUsersGroupsPageComponent_Conditional_52_th_9_Template, 3, 3, "th", 28)(10, AdminUsersGroupsPageComponent_Conditional_52_td_10_Template, 2, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 44);
    i0.ɵɵtemplate(12, AdminUsersGroupsPageComponent_Conditional_52_th_12_Template, 3, 3, "th", 28)(13, AdminUsersGroupsPageComponent_Conditional_52_td_13_Template, 2, 1, "td", 45);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 46);
    i0.ɵɵtemplate(15, AdminUsersGroupsPageComponent_Conditional_52_th_15_Template, 3, 3, "th", 28)(16, AdminUsersGroupsPageComponent_Conditional_52_td_16_Template, 2, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 47);
    i0.ɵɵtemplate(18, AdminUsersGroupsPageComponent_Conditional_52_th_18_Template, 1, 0, "th", 28)(19, AdminUsersGroupsPageComponent_Conditional_52_td_19_Template, 11, 12, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, AdminUsersGroupsPageComponent_Conditional_52_tr_20_Template, 1, 0, "tr", 32)(21, AdminUsersGroupsPageComponent_Conditional_52_tr_21_Template, 1, 0, "tr", 33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "mat-paginator", 41);
    i0.ɵɵlistener("page", function AdminUsersGroupsPageComponent_Conditional_52_Template_mat_paginator_page_22_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.onUsersPage($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, AdminUsersGroupsPageComponent_Conditional_52_Conditional_23_Template, 2, 1, "p", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r3.users());
    i0.ɵɵadvance(19);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r3.userColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r3.userColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", ctx_r3.usersTotal())("pageIndex", ctx_r3.usersPageIndex())("pageSize", ctx_r3.pageSize)("pageSizeOptions", i0.ɵɵpureFunction1(9, _c1, ctx_r3.pageSize))("hidePageSize", true);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.users().length === 0 ? 23 : -1);
} }
function AdminUsersGroupsPageComponent_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵelement(1, "mat-spinner", 42);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.loading"));
} }
function AdminUsersGroupsPageComponent_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.groupsError());
} }
function AdminUsersGroupsPageComponent_Conditional_57_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.name"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_4_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 38);
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_57_td_4_Template_button_click_1_listener() { const g_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.selectGroup(g_r20)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const g_r20 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", g_r20.groupname, " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.label"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r21 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(g_r21.grouplabel);
} }
function AdminUsersGroupsPageComponent_Conditional_57_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-users-groups-page.members"), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const member_r24 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", member_r24, " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 53)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 54, 2);
    i0.ɵɵlistener("mouseenter", function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template_button_mouseenter_3_listener() { i0.ɵɵrestoreView(_r22); const membersTrigger_r23 = i0.ɵɵreference(4); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.openMembersMenu(membersTrigger_r23)); })("mouseleave", function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template_button_mouseleave_3_listener() { i0.ɵɵrestoreView(_r22); const membersTrigger_r23 = i0.ɵɵreference(4); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.scheduleCloseMembersMenu(membersTrigger_r23)); });
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "mat-menu", 55, 3)(8, "div", 56);
    i0.ɵɵlistener("mouseenter", function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template_div_mouseenter_8_listener() { i0.ɵɵrestoreView(_r22); const membersTrigger_r23 = i0.ɵɵreference(4); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.onMembersMenuPanelEnter(membersTrigger_r23)); })("mouseleave", function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template_div_mouseleave_8_listener() { i0.ɵɵrestoreView(_r22); const membersTrigger_r23 = i0.ɵɵreference(4); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.onMembersMenuPanelLeave(membersTrigger_r23)); });
    i0.ɵɵrepeaterCreate(9, AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_For_10_Template, 2, 1, "button", 57, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const membersTrigger_r23 = i0.ɵɵreference(4);
    const membersMenu_r25 = i0.ɵɵreference(7);
    const g_r26 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r3.membersPreviewLeading(g_r26), ",");
    i0.ɵɵadvance();
    i0.ɵɵproperty("matMenuTriggerFor", membersMenu_r25);
    i0.ɵɵattribute("aria-label", ctx_r3.membersMoreAriaLabel(g_r26))("aria-expanded", membersTrigger_r23.menuOpen)("aria-haspopup", "menu");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" +", ctx_r3.membersOverflowCount(g_r26), " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("hasBackdrop", false);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r3.membersOverflowUsernames(g_r26));
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const g_r26 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.membersPreview(g_r26), " ");
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 48);
    i0.ɵɵconditionalCreate(1, AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_1_Template, 11, 7)(2, AdminUsersGroupsPageComponent_Conditional_57_td_10_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r26 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.membersOverflowCount(g_r26) > 0 ? 1 : 2);
} }
function AdminUsersGroupsPageComponent_Conditional_57_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 36);
} }
function AdminUsersGroupsPageComponent_Conditional_57_td_13_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 37)(1, "button", 17);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_57_td_13_Template_button_click_1_listener() { const g_r28 = i0.ɵɵrestoreView(_r27).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.openEditGroup(g_r28)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 17);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Conditional_57_td_13_Template_button_click_6_listener() { const g_r28 = i0.ɵɵrestoreView(_r27).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.confirmDeleteGroup(g_r28)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "delete_outline");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 4, "admin.admin-users-groups-page.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 6, "admin.admin-users-groups-page.edit-group"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 8, "admin.admin-users-groups-page.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 10, "admin.admin-users-groups-page.delete-group"));
} }
function AdminUsersGroupsPageComponent_Conditional_57_tr_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 39);
} }
function AdminUsersGroupsPageComponent_Conditional_57_tr_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 40);
} }
function AdminUsersGroupsPageComponent_Conditional_57_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.groupsEmptyMessage());
} }
function AdminUsersGroupsPageComponent_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "table", 26);
    i0.ɵɵelementContainerStart(2, 50);
    i0.ɵɵtemplate(3, AdminUsersGroupsPageComponent_Conditional_57_th_3_Template, 3, 3, "th", 28)(4, AdminUsersGroupsPageComponent_Conditional_57_td_4_Template, 3, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 51);
    i0.ɵɵtemplate(6, AdminUsersGroupsPageComponent_Conditional_57_th_6_Template, 3, 3, "th", 28)(7, AdminUsersGroupsPageComponent_Conditional_57_td_7_Template, 2, 1, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 52);
    i0.ɵɵtemplate(9, AdminUsersGroupsPageComponent_Conditional_57_th_9_Template, 3, 3, "th", 28)(10, AdminUsersGroupsPageComponent_Conditional_57_td_10_Template, 3, 1, "td", 45);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 47);
    i0.ɵɵtemplate(12, AdminUsersGroupsPageComponent_Conditional_57_th_12_Template, 1, 0, "th", 28)(13, AdminUsersGroupsPageComponent_Conditional_57_td_13_Template, 11, 12, "td", 29);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(14, AdminUsersGroupsPageComponent_Conditional_57_tr_14_Template, 1, 0, "tr", 32)(15, AdminUsersGroupsPageComponent_Conditional_57_tr_15_Template, 1, 0, "tr", 33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "mat-paginator", 41);
    i0.ɵɵlistener("page", function AdminUsersGroupsPageComponent_Conditional_57_Template_mat_paginator_page_16_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.onGroupsPage($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(17, AdminUsersGroupsPageComponent_Conditional_57_Conditional_17_Template, 2, 1, "p", 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r3.groups());
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r3.groupColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r3.groupColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", ctx_r3.groupsTotal())("pageIndex", ctx_r3.groupsPageIndex())("pageSize", ctx_r3.pageSize)("pageSizeOptions", i0.ɵɵpureFunction1(9, _c1, ctx_r3.pageSize))("hidePageSize", true);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.groups().length === 0 ? 17 : -1);
} }
export class AdminUsersGroupsPageComponent {
    userService = inject(UserService);
    translate = inject(TranslateService);
    /** The active language as a signal, so a `computed` that calls `instant()` recomputes on a switch. */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.getCurrentLang() });
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    membersMenuCloseTimer = null;
    membersMenuHoverTrigger = null;
    constructor() {
        this.destroyRef.onDestroy(() => this.cancelCloseMembersMenu());
    }
    userColumns = ['username', 'name', 'email', 'groups', 'admin', 'actions'];
    groupColumns = ['groupname', 'label', 'members', 'actions'];
    recentColumns = ['name', 'identifier', 'email'];
    users = signal([], ...(ngDevMode ? [{ debugName: "users" }] : []));
    groups = signal([], ...(ngDevMode ? [{ debugName: "groups" }] : []));
    pageSize = 20;
    usersPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "usersPageIndex" }] : []));
    groupsPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "groupsPageIndex" }] : []));
    usersTotal = signal(0, ...(ngDevMode ? [{ debugName: "usersTotal" }] : []));
    groupsTotal = signal(0, ...(ngDevMode ? [{ debugName: "groupsTotal" }] : []));
    usersLoading = signal(false, ...(ngDevMode ? [{ debugName: "usersLoading" }] : []));
    groupsLoading = signal(false, ...(ngDevMode ? [{ debugName: "groupsLoading" }] : []));
    usersError = signal(null, ...(ngDevMode ? [{ debugName: "usersError" }] : []));
    groupsError = signal(null, ...(ngDevMode ? [{ debugName: "groupsError" }] : []));
    combinedSearchQuery = '';
    recentRows = signal([], ...(ngDevMode ? [{ debugName: "recentRows" }] : []));
    recentLoading = signal(false, ...(ngDevMode ? [{ debugName: "recentLoading" }] : []));
    /** Client-side pages for the merged "Recently Created" table (API returns two lists merged). */
    recentPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "recentPageIndex" }] : []));
    recentPageSize = 5;
    recentRowsPage = computed(() => {
        const all = this.recentRows();
        const start = this.recentPageIndex() * this.recentPageSize;
        return all.slice(start, start + this.recentPageSize);
    }, ...(ngDevMode ? [{ debugName: "recentRowsPage" }] : []));
    selectedTabIndex = signal(0, ...(ngDevMode ? [{ debugName: "selectedTabIndex" }] : []));
    usersTabLabel = computed(() => {
        this.currentLang();
        return this.translate.instant('admin.admin-users-groups-page.users-tab', {
            count: this.usersTotal(),
        });
    }, ...(ngDevMode ? [{ debugName: "usersTabLabel" }] : []));
    groupsTabLabel = computed(() => {
        this.currentLang();
        return this.translate.instant('admin.admin-users-groups-page.groups-tab', {
            count: this.groupsTotal(),
        });
    }, ...(ngDevMode ? [{ debugName: "groupsTabLabel" }] : []));
    tabGroup = viewChild('ugTabGroup', ...(ngDevMode ? [{ debugName: "tabGroup" }] : []));
    ngOnInit() {
        this.runSearch();
        this.loadRecent();
    }
    runSearch() {
        this.usersPageIndex.set(0);
        this.groupsPageIndex.set(0);
        this.usersLoading.set(true);
        this.groupsLoading.set(true);
        this.usersError.set(null);
        this.groupsError.set(null);
        const query = this.combinedSearchQuery;
        forkJoin({
            users: this.userService.searchUsersPaged(query, this.pageSize, 0).pipe(catchError((err) => {
                this.usersError.set(err?.message ?? this.translate.instant('admin.message.could-not-load-users'));
                return of({ 'entity-type': 'users', entries: [], totalSize: 0 });
            })),
            groups: this.userService.searchGroupsPaged(query, this.pageSize, 0).pipe(catchError((err) => {
                this.groupsError.set(err?.message ?? this.translate.instant('admin.message.could-not-load-groups'));
                return of({
                    'entity-type': 'groups',
                    entries: [],
                    totalSize: 0,
                });
            })),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ users, groups }) => {
                const usersTotal = resolvePaginatedListTotal(users, this.pageSize, 0);
                const groupsTotal = resolvePaginatedListTotal(groups, this.pageSize, 0);
                this.users.set(users.entries ?? []);
                this.usersTotal.set(usersTotal);
                this.groups.set(groups.entries ?? []);
                this.groupsTotal.set(groupsTotal);
                this.applySearchTabSelection(query, usersTotal, groupsTotal);
                this.usersLoading.set(false);
                this.groupsLoading.set(false);
            },
            error: () => {
                this.usersLoading.set(false);
                this.groupsLoading.set(false);
            },
        });
    }
    loadRecent() {
        this.recentLoading.set(true);
        this.userService
            .getRecentlyCreatedUsersAndGroups(50, 0)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                const rows = (res.entries ?? [])
                    .map((doc) => this.mapRecentEntry(doc))
                    .filter((row) => row !== null);
                this.recentPageIndex.set(0);
                this.recentRows.set(rows);
                this.recentLoading.set(false);
            },
            error: () => {
                this.recentPageIndex.set(0);
                this.recentRows.set([]);
                this.recentLoading.set(false);
            },
        });
    }
    loadUsers() {
        this.usersLoading.set(true);
        this.usersError.set(null);
        const pageIndex = this.usersPageIndex();
        this.userService
            .searchUsersPaged(this.combinedSearchQuery, this.pageSize, pageIndex)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.users.set(res.entries ?? []);
                this.usersTotal.set(resolvePaginatedListTotal(res, this.pageSize, pageIndex));
                this.usersLoading.set(false);
            },
            error: (err) => {
                this.usersError.set(err?.message ?? this.translate.instant('admin.message.could-not-load-users'));
                this.usersLoading.set(false);
            },
        });
    }
    loadGroups() {
        this.groupsLoading.set(true);
        this.groupsError.set(null);
        const pageIndex = this.groupsPageIndex();
        this.userService
            .searchGroupsPaged(this.combinedSearchQuery, this.pageSize, pageIndex)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.groups.set(res.entries ?? []);
                this.groupsTotal.set(resolvePaginatedListTotal(res, this.pageSize, pageIndex));
                this.groupsLoading.set(false);
            },
            error: (err) => {
                this.groupsError.set(err?.message ?? this.translate.instant('admin.message.could-not-load-groups'));
                this.groupsLoading.set(false);
            },
        });
    }
    onUsersPage(event) {
        if (event.pageIndex === this.usersPageIndex())
            return;
        this.usersPageIndex.set(event.pageIndex);
        this.loadUsers();
    }
    onGroupsPage(event) {
        if (event.pageIndex === this.groupsPageIndex())
            return;
        this.groupsPageIndex.set(event.pageIndex);
        this.loadGroups();
    }
    onRecentPage(event) {
        if (event.pageIndex === this.recentPageIndex())
            return;
        this.recentPageIndex.set(event.pageIndex);
    }
    openRecentRow(row) {
        if (row.kind === 'user') {
            this.openUserDetails(row.identifier);
            return;
        }
        this.openGroupDetails(row.identifier);
    }
    selectUser(user) {
        this.openUserDetails(user.id);
    }
    selectGroup(group) {
        this.openGroupDetails(group.groupname);
    }
    openUserDetails(userId) {
        this.router.navigate(['/administration/users-groups/user', userId]);
    }
    openGroupDetails(groupId) {
        this.router.navigate(['/administration/users-groups/group', groupId]);
    }
    afterMutation() {
        this.runSearch();
        // Audit indexing can be async (Nuxeo Web UI refreshes after a short delay).
        timer(1000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadRecent());
    }
    openCreateUser() {
        this.openCreateUserDialog();
    }
    openCreateUserDialog() {
        this.dialog
            .open(UserFormDialogComponent, {
            width: '480px',
            maxHeight: '90vh',
            data: { mode: 'create' },
        })
            .afterClosed()
            .pipe(filter((r) => !!r && r.mode === 'create'), switchMap((r) => {
            const invited = r.invited === true;
            if (invited) {
                return of({ r, invited: true, user: null });
            }
            return this.userService.getUser(r.username).pipe(map((user) => ({ r, invited: false, user })), catchError(() => of({ r, invited: false, user: null })));
        }), tap(({ r, invited, user }) => {
            if (!invited && user) {
                const current = this.users();
                if (!current.some((u) => u.id === user.id)) {
                    this.users.set([user, ...current]);
                }
            }
            this.snackBar.open(invited
                ? this.translate.instant('admin.invitation-sent', { email: r.email })
                : this.translate.instant('admin.message.user-created'), this.translate.instant('common.dismiss'), { duration: invited ? 6000 : 3000 });
            if (!invited) {
                this.combinedSearchQuery = r.username;
            }
            this.afterMutation();
        }), map(({ r }) => r.createAnother === true), takeUntilDestroyed(this.destroyRef))
            .subscribe((createAnother) => {
            if (createAnother) {
                this.openCreateUserDialog();
            }
        });
    }
    openEditUser(user) {
        this.dialog
            .open(UserFormDialogComponent, {
            width: '480px',
            maxHeight: '90vh',
            data: { mode: 'edit', user },
        })
            .afterClosed()
            .subscribe((r) => {
            if (!r || r.mode !== 'edit')
                return;
            this.userService
                .updateUser(user.id, {
                firstName: r.firstName,
                lastName: r.lastName,
                company: r.company,
                email: r.email,
                password: r.password,
                groups: r.groups,
            })
                .subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.user-updated'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.afterMutation();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.update-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    confirmDeleteUser(user) {
        this.dialog
            .open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: this.translate.instant('confirm.delete-user'),
                message: this.translate.instant('confirm.delete-user-named', { name: user.id }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        })
            .afterClosed()
            .subscribe((ok) => {
            if (!ok)
                return;
            this.userService.deleteUser(user.id).subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.user-deleted'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.afterMutation();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.delete-failed'), this.translate.instant('common.dismiss'), { duration: 5000 }),
            });
        });
    }
    openCreateGroup() {
        this.openCreateGroupDialog();
    }
    openCreateGroupDialog() {
        this.dialog
            .open(GroupFormDialogComponent, { width: '480px', data: { mode: 'create' } })
            .afterClosed()
            .subscribe((r) => {
            if (!r || r.mode !== 'create')
                return;
            this.userService
                .createGroup({
                groupname: r.groupname,
                grouplabel: r.grouplabel,
                memberUsers: r.memberUsers,
            })
                .subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.group-created'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.afterMutation();
                    if (r.createAnother) {
                        this.openCreateGroupDialog();
                    }
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.create-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    openEditGroup(group) {
        this.dialog
            .open(GroupFormDialogComponent, { width: '480px', data: { mode: 'edit', group } })
            .afterClosed()
            .subscribe((r) => {
            if (!r || r.mode !== 'edit')
                return;
            this.userService
                .updateGroup(group.groupname, {
                grouplabel: r.grouplabel,
                memberUsers: r.memberUsers,
            })
                .subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.group-updated'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.afterMutation();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.update-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    confirmDeleteGroup(group) {
        this.dialog
            .open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: this.translate.instant('confirm.delete-group'),
                message: this.translate.instant('confirm.delete-group-named', {
                    name: group.groupname,
                }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        })
            .afterClosed()
            .subscribe((ok) => {
            if (!ok)
                return;
            this.userService.deleteGroup(group.groupname).subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.group-deleted'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.afterMutation();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.delete-failed'), this.translate.instant('common.dismiss'), { duration: 5000 }),
            });
        });
    }
    usersEmptyMessage() {
        if (this.combinedSearchQuery.trim() && this.users().length === 0 && this.groupsTotal() > 0) {
            return this.translate.instant('admin.admin-users-groups-page.no-users-match-see-groups');
        }
        return this.translate.instant('admin.admin-users-groups-page.no-users-match');
    }
    groupsEmptyMessage() {
        if (this.combinedSearchQuery.trim() && this.groups().length === 0 && this.usersTotal() > 0) {
            return this.translate.instant('admin.admin-users-groups-page.no-groups-match-see-users');
        }
        return this.translate.instant('admin.admin-users-groups-page.no-groups-match');
    }
    /** Switch tabs after a combined search based on which result set has matches. */
    applySearchTabSelection(query, usersTotal, groupsTotal) {
        if (!query.trim()) {
            return;
        }
        if (usersTotal === 0 && groupsTotal > 0) {
            this.selectResultsTab(1);
        }
        else if (usersTotal > 0) {
            this.selectResultsTab(0);
        }
    }
    selectResultsTab(index) {
        this.selectedTabIndex.set(index);
        queueMicrotask(() => {
            const group = this.tabGroup();
            if (group) {
                group.selectedIndex = index;
            }
        });
    }
    mapRecentEntry(doc) {
        if (doc.type === 'user') {
            const props = doc.properties;
            const firstName = String(props['user:firstName'] ?? '').trim();
            const lastName = String(props['user:lastName'] ?? '').trim();
            const joined = `${firstName} ${lastName}`.trim();
            return {
                kind: 'user',
                name: joined || doc.uid,
                identifier: doc.uid,
                email: String(props['user:email'] ?? ''),
            };
        }
        if (doc.type === 'group') {
            const label = String(doc.properties['group:grouplabel'] ?? '').trim();
            return {
                kind: 'group',
                name: label || doc.uid,
                identifier: doc.uid,
                email: '',
            };
        }
        return null;
    }
    displayName(user) {
        const fn = user.properties.firstName?.trim() ?? '';
        const ln = user.properties.lastName?.trim() ?? '';
        const joined = `${fn} ${ln}`.trim();
        return joined || user.id;
    }
    groupsLabel(user) {
        return (user.properties.groups ?? []).join(', ');
    }
    memberUsernames(group) {
        return group.memberUsers ?? [];
    }
    membersPreviewLeading(group) {
        const members = this.memberUsernames(group);
        if (!members.length)
            return '—';
        return members.slice(0, 3).join(', ');
    }
    membersOverflowCount(group) {
        return Math.max(0, this.memberUsernames(group).length - 3);
    }
    membersOverflowUsernames(group) {
        return this.memberUsernames(group).slice(3);
    }
    openMembersMenu(trigger) {
        this.membersMenuHoverTrigger = trigger;
        this.cancelCloseMembersMenu();
        if (!trigger.menuOpen) {
            trigger.openMenu();
        }
    }
    scheduleCloseMembersMenu(trigger) {
        this.cancelCloseMembersMenu();
        this.membersMenuCloseTimer = setTimeout(() => {
            if (this.membersMenuHoverTrigger === trigger) {
                trigger.closeMenu();
            }
        }, 200);
    }
    onMembersMenuPanelEnter(trigger) {
        this.membersMenuHoverTrigger = trigger;
        this.cancelCloseMembersMenu();
    }
    onMembersMenuPanelLeave(trigger) {
        this.scheduleCloseMembersMenu(trigger);
    }
    cancelCloseMembersMenu() {
        if (this.membersMenuCloseTimer) {
            clearTimeout(this.membersMenuCloseTimer);
            this.membersMenuCloseTimer = null;
        }
    }
    membersMoreAriaLabel(group) {
        const count = this.membersOverflowCount(group);
        return this.translate.instant(count === 1
            ? 'admin.admin-users-groups-page.show-more-members-one'
            : 'admin.admin-users-groups-page.show-more-members-many', { count });
    }
    membersPreview(group) {
        const members = this.memberUsernames(group);
        if (!members.length)
            return '—';
        if (members.length <= 3)
            return members.join(', ');
        return `${members.slice(0, 3).join(', ')}, +${members.length - 3}`;
    }
    static ɵfac = function AdminUsersGroupsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminUsersGroupsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminUsersGroupsPageComponent, selectors: [["lib-admin-users-groups-page"]], viewQuery: function AdminUsersGroupsPageComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.tabGroup, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, decls: 58, vars: 35, consts: [["newMenu", "matMenu"], ["ugTabGroup", ""], ["membersTrigger", "matMenuTrigger"], ["membersMenu", "matMenu"], [1, "ug-page"], [1, "ug-page__header"], ["role", "heading", "aria-level", "1", 1, "ug-page__title"], [1, "ug-toolbar"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "ug-search"], ["matInput", "", "name", "combinedQ", 3, "ngModelChange", "keyup.enter", "ngModel"], ["type", "button", "mat-icon-button", "", "matSuffix", "", 3, "click"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "matMenuTriggerFor"], ["type", "button", "mat-menu-item", "", 3, "click"], [1, "ug-recent"], [1, "ug-recent__head"], [1, "ug-recent__ico"], ["role", "heading", "aria-level", "2", 1, "ug-recent__title"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip"], [1, "ug-center"], [1, "ug-table-wrap", "mat-elevation-z0"], ["animationDuration", "0ms", 1, "ug-tabs", 3, "selectedIndexChange", "selectedIndex"], [3, "label"], [1, "ug-tab-pad"], [1, "ug-error"], [1, "ug-table-wrap", "mat-elevation-z1"], ["diameter", "32"], ["mat-table", "", 1, "ug-table", 3, "dataSource"], ["matColumnDef", "name"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "identifier"], ["matColumnDef", "email"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "length", "pageIndex", "pageSize", "pageSizeOptions", "hidePageSize"], [1, "ug-empty"], ["mat-header-cell", ""], ["mat-cell", ""], ["type", "button", 1, "ug-link-btn", 3, "click"], ["mat-header-row", ""], ["mat-row", ""], ["showFirstLastButtons", "", 3, "page", "length", "pageIndex", "pageSize", "pageSizeOptions", "hidePageSize"], ["diameter", "40"], ["matColumnDef", "username"], ["matColumnDef", "groups"], ["mat-cell", "", "class", "cell-muted", 4, "matCellDef"], ["matColumnDef", "admin"], ["matColumnDef", "actions"], ["mat-cell", "", 1, "cell-muted"], ["aria-hidden", "true", 1, "ok"], ["matColumnDef", "groupname"], ["matColumnDef", "label"], ["matColumnDef", "members"], [1, "ug-members-inline"], ["type", "button", 1, "ug-members-more", 3, "mouseenter", "mouseleave", "matMenuTriggerFor"], ["xPosition", "after", "yPosition", "below", 1, "ug-members-menu", 3, "hasBackdrop"], [1, "ug-members-menu__panel", 3, "mouseenter", "mouseleave"], ["mat-menu-item", "", "type", "button", "disabled", "", 1, "ug-members-menu__item"]], template: function AdminUsersGroupsPageComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 4)(1, "header", 5)(2, "div", 6);
            i0.ɵɵtext(3);
            i0.ɵɵpipe(4, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 7)(6, "mat-form-field", 8)(7, "mat-label");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "input", 9);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminUsersGroupsPageComponent_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.combinedSearchQuery, $event) || (ctx.combinedSearchQuery = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵlistener("keyup.enter", function AdminUsersGroupsPageComponent_Template_input_keyup_enter_10_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.runSearch()); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "button", 10);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.runSearch()); });
            i0.ɵɵelementStart(13, "mat-icon");
            i0.ɵɵtext(14, "search");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(15, "button", 11)(16, "mat-icon");
            i0.ɵɵtext(17, "add");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "mat-menu", null, 0)(22, "button", 12);
            i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.openCreateUser()); });
            i0.ɵɵelementStart(23, "mat-icon");
            i0.ɵɵtext(24, "person_add");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "button", 12);
            i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Template_button_click_27_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.openCreateGroup()); });
            i0.ɵɵelementStart(28, "mat-icon");
            i0.ɵɵtext(29, "group_add");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(30);
            i0.ɵɵpipe(31, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(32, "section", 13)(33, "div", 14)(34, "mat-icon", 15);
            i0.ɵɵtext(35, "history");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "div", 16);
            i0.ɵɵtext(37);
            i0.ɵɵpipe(38, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(39, "button", 17);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵpipe(41, "translate");
            i0.ɵɵlistener("click", function AdminUsersGroupsPageComponent_Template_button_click_39_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.loadRecent()); });
            i0.ɵɵelementStart(42, "mat-icon");
            i0.ɵɵtext(43, "refresh");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(44, AdminUsersGroupsPageComponent_Conditional_44_Template, 3, 3, "div", 18)(45, AdminUsersGroupsPageComponent_Conditional_45_Template, 15, 5, "div", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "mat-tab-group", 20, 1);
            i0.ɵɵlistener("selectedIndexChange", function AdminUsersGroupsPageComponent_Template_mat_tab_group_selectedIndexChange_46_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.selectedTabIndex.set($event)); });
            i0.ɵɵelementStart(48, "mat-tab", 21)(49, "div", 22);
            i0.ɵɵconditionalCreate(50, AdminUsersGroupsPageComponent_Conditional_50_Template, 3, 3, "div", 18)(51, AdminUsersGroupsPageComponent_Conditional_51_Template, 2, 1, "p", 23)(52, AdminUsersGroupsPageComponent_Conditional_52_Template, 24, 11, "div", 24);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(53, "mat-tab", 21)(54, "div", 22);
            i0.ɵɵconditionalCreate(55, AdminUsersGroupsPageComponent_Conditional_55_Template, 3, 3, "div", 18)(56, AdminUsersGroupsPageComponent_Conditional_56_Template, 2, 1, "p", 23)(57, AdminUsersGroupsPageComponent_Conditional_57_Template, 18, 11, "div", 24);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            const newMenu_r29 = i0.ɵɵreference(21);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 17, "admin.admin-users-groups-page.users-amp-groups"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 19, "admin.admin-users-groups-page.search-for-users-and-groups"));
            i0.ɵɵadvance(2);
            i0.ɵɵtwoWayProperty("ngModel", ctx.combinedSearchQuery);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 21, "admin.admin-users-groups-page.run-search"));
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("matMenuTriggerFor", newMenu_r29);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 23, "admin.admin-users-groups-page.new"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 25, "admin.admin-users-groups-page.new-user"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(31, 27, "admin.admin-users-groups-page.new-group"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(38, 29, "admin.admin-users-groups-page.recently-created-users-and-groups"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(40, 31, "admin.admin-users-groups-page.refresh"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(41, 33, "admin.admin-users-groups-page.refresh-recent"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.recentLoading() ? 44 : 45);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("selectedIndex", ctx.selectedTabIndex());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", ctx.usersTabLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.usersLoading() ? 50 : ctx.usersError() ? 51 : 52);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("label", ctx.groupsTabLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.groupsLoading() ? 55 : ctx.groupsError() ? 56 : 57);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, i2.MatIconButton, MatIconModule, i3.MatIcon, MatInputModule, i4.MatInput, i5.MatFormField, i5.MatLabel, i5.MatSuffix, MatFormFieldModule,
            MatTableModule, i6.MatTable, i6.MatHeaderCellDef, i6.MatHeaderRowDef, i6.MatColumnDef, i6.MatCellDef, i6.MatRowDef, i6.MatHeaderCell, i6.MatCell, i6.MatHeaderRow, i6.MatRow, MatTabsModule, i7.MatTab, i7.MatTabGroup, MatTooltipModule, i8.MatTooltip, MatProgressSpinnerModule, i9.MatProgressSpinner, MatDialogModule,
            MatSnackBarModule,
            MatMenuModule, i10.MatMenu, i10.MatMenuItem, i10.MatMenuTrigger, MatPaginatorModule, i11.MatPaginator, TranslatePipe], styles: [".ug-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1100px;\n}\n\n.ug-page__header[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem;\n}\n\n.ug-page__title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.ug-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--admin-space-2, 0.75rem);\n  margin-bottom: var(--admin-space-4, 1.25rem);\n}\n\n.ug-detail-card[_ngcontent-%COMP%] {\n  margin-bottom: var(--admin-space-3, 1rem);\n  padding: var(--admin-space-3, 1rem) var(--admin-space-3, 1rem) var(--admin-space-2, 0.75rem);\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.ug-detail-head[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 0.75rem;\n  align-items: start;\n  margin-bottom: 0.75rem;\n}\n\n.ug-detail-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.ug-detail-sub[_ngcontent-%COMP%] {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n  font-size: 0.875rem;\n}\n\n.ug-detail-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  flex-wrap: wrap;\n}\n\n.ug-members-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 0.5rem;\n}\n\n.ug-chip-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 999px;\n  padding: 0.2rem 0.35rem 0.2rem 0.8rem;\n}\n\n.ug-link-btn[_ngcontent-%COMP%] {\n  border: 0;\n  background: transparent;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n  font: inherit;\n  padding: 0.1rem 0;\n  text-align: left;\n  line-height: 1.3;\n}\n\n.ug-link-btn[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n\n.ug-search[_ngcontent-%COMP%] {\n  flex: 1 1 280px;\n  min-width: 260px;\n}\n\n.ug-recent[_ngcontent-%COMP%] {\n  margin-bottom: 1.25rem;\n}\n\n.ug-recent__head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  margin-bottom: 0.5rem;\n}\n\n.ug-recent__ico[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  width: 1.25rem;\n  height: 1.25rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ug-recent__title[_ngcontent-%COMP%] {\n  flex: 1;\n  margin: 0;\n  font-size: 0.95rem;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.8));\n}\n\n.ug-tabs[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n}\n\n.ug-tab-pad[_ngcontent-%COMP%] {\n  padding: 0.9rem 0 1rem;\n}\n\n.ug-table-wrap[_ngcontent-%COMP%] {\n  border-radius: var(--admin-radius-1, 8px);\n  overflow: auto;\n}\n\n.ug-table[_ngcontent-%COMP%] {\n  width: 100%;\n\n  th.mat-mdc-header-cell,\n  td.mat-mdc-cell {\n    padding-top: var(--admin-row-padding-y, 0.68rem);\n    padding-bottom: var(--admin-row-padding-y, 0.68rem);\n    vertical-align: middle;\n  }\n}\n\n.ug-page[_ngcontent-%COMP%]   .mat-mdc-form-field[_ngcontent-%COMP%] {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.ug-page[_ngcontent-%COMP%]   .mat-mdc-unelevated-button[_ngcontent-%COMP%], \n.ug-page[_ngcontent-%COMP%]   .mat-mdc-outlined-button[_ngcontent-%COMP%], \n.ug-page[_ngcontent-%COMP%]   .mat-mdc-button[_ngcontent-%COMP%] {\n  min-height: var(--admin-control-height, 40px);\n}\n\nmat-paginator[_ngcontent-%COMP%] {\n  border-top: 1px solid rgba(0, 0, 0, 0.08);\n}\n\n.cell-muted[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n  font-size: 0.875rem;\n}\n\n.ug-members-inline[_ngcontent-%COMP%] {\n  display: inline;\n}\n\n.ug-members-more[_ngcontent-%COMP%] {\n  border: 0;\n  background: transparent;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n  font: inherit;\n  font-size: 0.875rem;\n  font-weight: 500;\n  margin-left: 0.2rem;\n  padding: 0;\n  text-decoration: underline;\n  text-underline-offset: 2px;\n}\n\n.ug-members-more[_ngcontent-%COMP%]:hover, \n.ug-members-more[_ngcontent-%COMP%]:focus-visible {\n  color: var(--mat-sys-primary, #0d47a1);\n}\n\n[_nghost-%COMP%]     .ug-members-menu.mat-mdc-menu-panel {\n  min-width: 12rem;\n  max-width: 20rem;\n}\n\n.ug-members-menu__panel[_ngcontent-%COMP%] {\n  padding: 0.25rem 0;\n}\n\n.ug-members-menu__item[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87));\n  font-size: 0.9rem;\n  font-weight: 500;\n  line-height: 1.45;\n  min-height: 2.25rem;\n  opacity: 1;\n}\n\n.ok[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary, #1565c0);\n  font-size: 1.25rem;\n  width: 1.25rem;\n  height: 1.25rem;\n}\n\n.ug-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1rem;\n}\n\n.ug-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.ug-empty[_ngcontent-%COMP%] {\n  padding: 1rem 1.25rem;\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  font-size: 0.9rem;\n}\n\n@media (max-width: 900px) {\n  .ug-page[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n\n  .ug-search[_ngcontent-%COMP%] {\n    min-width: 100%;\n  }\n\n  .ug-detail-head[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminUsersGroupsPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-users-groups-page', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatButtonModule,
                    MatIconModule,
                    MatInputModule,
                    MatFormFieldModule,
                    MatTableModule,
                    MatTabsModule,
                    MatTooltipModule,
                    MatProgressSpinnerModule,
                    MatDialogModule,
                    MatSnackBarModule,
                    MatMenuModule,
                    MatPaginatorModule,
                ], template: "<div class=\"ug-page\">\n  <header class=\"ug-page__header\">\n    <div class=\"ug-page__title\" role=\"heading\" aria-level=\"1\">\n      {{ 'admin.admin-users-groups-page.users-amp-groups' | translate }}\n    </div>\n  </header>\n\n  <div class=\"ug-toolbar\">\n    <mat-form-field appearance=\"outline\" class=\"ug-search\" subscriptSizing=\"dynamic\">\n      <mat-label>{{\n        'admin.admin-users-groups-page.search-for-users-and-groups' | translate\n      }}</mat-label>\n      <input\n        matInput\n        name=\"combinedQ\"\n        [(ngModel)]=\"combinedSearchQuery\"\n        (keyup.enter)=\"runSearch()\"\n      />\n      <button\n        type=\"button\"\n        mat-icon-button\n        matSuffix\n        (click)=\"runSearch()\"\n        [attr.aria-label]=\"'admin.admin-users-groups-page.run-search' | translate\"\n      >\n        <mat-icon>search</mat-icon>\n      </button>\n    </mat-form-field>\n\n    <button type=\"button\" mat-flat-button color=\"primary\" [matMenuTriggerFor]=\"newMenu\">\n      <mat-icon>add</mat-icon>\n      {{ 'admin.admin-users-groups-page.new' | translate }}\n    </button>\n    <mat-menu #newMenu=\"matMenu\">\n      <button type=\"button\" mat-menu-item (click)=\"openCreateUser()\">\n        <mat-icon>person_add</mat-icon>\n        {{ 'admin.admin-users-groups-page.new-user' | translate }}\n      </button>\n      <button type=\"button\" mat-menu-item (click)=\"openCreateGroup()\">\n        <mat-icon>group_add</mat-icon>\n        {{ 'admin.admin-users-groups-page.new-group' | translate }}\n      </button>\n    </mat-menu>\n  </div>\n\n  <section class=\"ug-recent\">\n    <div class=\"ug-recent__head\">\n      <mat-icon class=\"ug-recent__ico\">history</mat-icon>\n      <div class=\"ug-recent__title\" role=\"heading\" aria-level=\"2\">\n        {{ 'admin.admin-users-groups-page.recently-created-users-and-groups' | translate }}\n      </div>\n      <button\n        type=\"button\"\n        mat-icon-button\n        (click)=\"loadRecent()\"\n        [attr.aria-label]=\"'admin.admin-users-groups-page.refresh-recent' | translate\"\n        [matTooltip]=\"'admin.admin-users-groups-page.refresh' | translate\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    </div>\n    @if (recentLoading()) {\n      <div class=\"ug-center\">\n        <mat-spinner\n          diameter=\"32\"\n          [attr.aria-label]=\"'admin.admin-users-groups-page.loading' | translate\"\n        />\n      </div>\n    } @else {\n      <div class=\"ug-table-wrap mat-elevation-z0\">\n        <table mat-table [dataSource]=\"recentRowsPage()\" class=\"ug-table\">\n          <ng-container matColumnDef=\"name\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-users-groups-page.name' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let row\">\n              <button type=\"button\" class=\"ug-link-btn\" (click)=\"openRecentRow(row)\">\n                {{ row.name }}\n              </button>\n            </td>\n          </ng-container>\n          <ng-container matColumnDef=\"identifier\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-users-groups-page.identifier' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let row\">{{ row.identifier }}</td>\n          </ng-container>\n          <ng-container matColumnDef=\"email\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-users-groups-page.email' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let row\">{{ row.email || '\u2014' }}</td>\n          </ng-container>\n          <tr mat-header-row *matHeaderRowDef=\"recentColumns\"></tr>\n          <tr mat-row *matRowDef=\"let row; columns: recentColumns\"></tr>\n        </table>\n        @if (recentRows().length > 0) {\n          <mat-paginator\n            [length]=\"recentRows().length\"\n            [pageIndex]=\"recentPageIndex()\"\n            [pageSize]=\"recentPageSize\"\n            [pageSizeOptions]=\"[recentPageSize]\"\n            [hidePageSize]=\"true\"\n            showFirstLastButtons\n            (page)=\"onRecentPage($event)\"\n          />\n        }\n        @if (recentRows().length === 0) {\n          <p class=\"ug-empty\">\n            {{ 'admin.admin-users-groups-page.no-recent-user-or-group' | translate }}\n          </p>\n        }\n      </div>\n    }\n  </section>\n\n  <mat-tab-group\n    #ugTabGroup\n    animationDuration=\"0ms\"\n    class=\"ug-tabs\"\n    [selectedIndex]=\"selectedTabIndex()\"\n    (selectedIndexChange)=\"selectedTabIndex.set($event)\"\n  >\n    <mat-tab [label]=\"usersTabLabel()\">\n      <div class=\"ug-tab-pad\">\n        @if (usersLoading()) {\n          <div class=\"ug-center\">\n            <mat-spinner\n              diameter=\"40\"\n              [attr.aria-label]=\"'admin.admin-users-groups-page.loading' | translate\"\n            />\n          </div>\n        } @else if (usersError()) {\n          <p class=\"ug-error\">{{ usersError() }}</p>\n        } @else {\n          <div class=\"ug-table-wrap mat-elevation-z1\">\n            <table mat-table [dataSource]=\"users()\" class=\"ug-table\">\n              <ng-container matColumnDef=\"username\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.username' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let u\">\n                  <button type=\"button\" class=\"ug-link-btn\" (click)=\"selectUser(u)\">\n                    {{ u.id }}\n                  </button>\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"name\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.name' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let u\">\n                  <button type=\"button\" class=\"ug-link-btn\" (click)=\"selectUser(u)\">\n                    {{ displayName(u) }}\n                  </button>\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"email\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.email' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let u\">{{ u.properties.email }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"groups\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.groups' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let u\" class=\"cell-muted\">{{ groupsLabel(u) }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"admin\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.admin' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let u\">\n                  @if (u.isAdministrator) {\n                    <mat-icon class=\"ok\" aria-hidden=\"true\">verified</mat-icon>\n                  }\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"actions\">\n                <th mat-header-cell *matHeaderCellDef></th>\n                <td mat-cell *matCellDef=\"let u\">\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"openEditUser(u)\"\n                    [attr.aria-label]=\"'admin.admin-users-groups-page.edit-user' | translate\"\n                    [matTooltip]=\"'admin.admin-users-groups-page.edit' | translate\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"confirmDeleteUser(u)\"\n                    [attr.aria-label]=\"'admin.admin-users-groups-page.delete-user' | translate\"\n                    [matTooltip]=\"'admin.admin-users-groups-page.delete' | translate\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"userColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: userColumns\"></tr>\n            </table>\n            <mat-paginator\n              [length]=\"usersTotal()\"\n              [pageIndex]=\"usersPageIndex()\"\n              [pageSize]=\"pageSize\"\n              [pageSizeOptions]=\"[pageSize]\"\n              [hidePageSize]=\"true\"\n              showFirstLastButtons\n              (page)=\"onUsersPage($event)\"\n            />\n            @if (users().length === 0) {\n              <p class=\"ug-empty\">{{ usersEmptyMessage() }}</p>\n            }\n          </div>\n        }\n      </div>\n    </mat-tab>\n\n    <mat-tab [label]=\"groupsTabLabel()\">\n      <div class=\"ug-tab-pad\">\n        @if (groupsLoading()) {\n          <div class=\"ug-center\">\n            <mat-spinner\n              diameter=\"40\"\n              [attr.aria-label]=\"'admin.admin-users-groups-page.loading' | translate\"\n            />\n          </div>\n        } @else if (groupsError()) {\n          <p class=\"ug-error\">{{ groupsError() }}</p>\n        } @else {\n          <div class=\"ug-table-wrap mat-elevation-z1\">\n            <table mat-table [dataSource]=\"groups()\" class=\"ug-table\">\n              <ng-container matColumnDef=\"groupname\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.name' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let g\">\n                  <button type=\"button\" class=\"ug-link-btn\" (click)=\"selectGroup(g)\">\n                    {{ g.groupname }}\n                  </button>\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"label\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.label' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let g\">{{ g.grouplabel }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"members\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-users-groups-page.members' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let g\" class=\"cell-muted\">\n                  @if (membersOverflowCount(g) > 0) {\n                    <span class=\"ug-members-inline\">\n                      <span>{{ membersPreviewLeading(g) }},</span>\n                      <button\n                        type=\"button\"\n                        class=\"ug-members-more\"\n                        [matMenuTriggerFor]=\"membersMenu\"\n                        #membersTrigger=\"matMenuTrigger\"\n                        (mouseenter)=\"openMembersMenu(membersTrigger)\"\n                        (mouseleave)=\"scheduleCloseMembersMenu(membersTrigger)\"\n                        [attr.aria-label]=\"membersMoreAriaLabel(g)\"\n                        [attr.aria-expanded]=\"membersTrigger.menuOpen\"\n                        [attr.aria-haspopup]=\"'menu'\"\n                      >\n                        +{{ membersOverflowCount(g) }}\n                      </button>\n                    </span>\n                    <mat-menu\n                      #membersMenu=\"matMenu\"\n                      class=\"ug-members-menu\"\n                      [hasBackdrop]=\"false\"\n                      xPosition=\"after\"\n                      yPosition=\"below\"\n                    >\n                      <div\n                        class=\"ug-members-menu__panel\"\n                        (mouseenter)=\"onMembersMenuPanelEnter(membersTrigger)\"\n                        (mouseleave)=\"onMembersMenuPanelLeave(membersTrigger)\"\n                      >\n                        @for (member of membersOverflowUsernames(g); track member) {\n                          <button\n                            mat-menu-item\n                            type=\"button\"\n                            class=\"ug-members-menu__item\"\n                            disabled\n                          >\n                            {{ member }}\n                          </button>\n                        }\n                      </div>\n                    </mat-menu>\n                  } @else {\n                    {{ membersPreview(g) }}\n                  }\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"actions\">\n                <th mat-header-cell *matHeaderCellDef></th>\n                <td mat-cell *matCellDef=\"let g\">\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"openEditGroup(g)\"\n                    [attr.aria-label]=\"'admin.admin-users-groups-page.edit-group' | translate\"\n                    [matTooltip]=\"'admin.admin-users-groups-page.edit' | translate\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"confirmDeleteGroup(g)\"\n                    [attr.aria-label]=\"'admin.admin-users-groups-page.delete-group' | translate\"\n                    [matTooltip]=\"'admin.admin-users-groups-page.delete' | translate\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"groupColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: groupColumns\"></tr>\n            </table>\n            <mat-paginator\n              [length]=\"groupsTotal()\"\n              [pageIndex]=\"groupsPageIndex()\"\n              [pageSize]=\"pageSize\"\n              [pageSizeOptions]=\"[pageSize]\"\n              [hidePageSize]=\"true\"\n              showFirstLastButtons\n              (page)=\"onGroupsPage($event)\"\n            />\n            @if (groups().length === 0) {\n              <p class=\"ug-empty\">{{ groupsEmptyMessage() }}</p>\n            }\n          </div>\n        }\n      </div>\n    </mat-tab>\n  </mat-tab-group>\n</div>\n", styles: [".ug-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1100px;\n}\n\n.ug-page__header {\n  margin-bottom: 0.75rem;\n}\n\n.ug-page__title {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 500;\n}\n\n.ug-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: var(--admin-space-2, 0.75rem);\n  margin-bottom: var(--admin-space-4, 1.25rem);\n}\n\n.ug-detail-card {\n  margin-bottom: var(--admin-space-3, 1rem);\n  padding: var(--admin-space-3, 1rem) var(--admin-space-3, 1rem) var(--admin-space-2, 0.75rem);\n  border-radius: var(--admin-radius-1, 8px);\n  background: var(--mat-sys-surface, #fff);\n}\n\n.ug-detail-head {\n  display: flex;\n  justify-content: space-between;\n  gap: 0.75rem;\n  align-items: start;\n  margin-bottom: 0.75rem;\n}\n\n.ug-detail-title {\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.ug-detail-sub {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n  font-size: 0.875rem;\n}\n\n.ug-detail-actions {\n  display: flex;\n  align-items: center;\n  gap: 0.375rem;\n  flex-wrap: wrap;\n}\n\n.ug-members-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 0.5rem;\n}\n\n.ug-chip-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  border-radius: 999px;\n  padding: 0.2rem 0.35rem 0.2rem 0.8rem;\n}\n\n.ug-link-btn {\n  border: 0;\n  background: transparent;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n  font: inherit;\n  padding: 0.1rem 0;\n  text-align: left;\n  line-height: 1.3;\n}\n\n.ug-link-btn:hover {\n  text-decoration: underline;\n}\n\n.ug-search {\n  flex: 1 1 280px;\n  min-width: 260px;\n}\n\n.ug-recent {\n  margin-bottom: 1.25rem;\n}\n\n.ug-recent__head {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  margin-bottom: 0.5rem;\n}\n\n.ug-recent__ico {\n  font-size: 1.25rem;\n  width: 1.25rem;\n  height: 1.25rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ug-recent__title {\n  flex: 1;\n  margin: 0;\n  font-size: 0.95rem;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.8));\n}\n\n.ug-tabs {\n  margin-top: 0.5rem;\n}\n\n.ug-tab-pad {\n  padding: 0.9rem 0 1rem;\n}\n\n.ug-table-wrap {\n  border-radius: var(--admin-radius-1, 8px);\n  overflow: auto;\n}\n\n.ug-table {\n  width: 100%;\n\n  th.mat-mdc-header-cell,\n  td.mat-mdc-cell {\n    padding-top: var(--admin-row-padding-y, 0.68rem);\n    padding-bottom: var(--admin-row-padding-y, 0.68rem);\n    vertical-align: middle;\n  }\n}\n\n.ug-page .mat-mdc-form-field {\n  --mat-form-field-container-height: var(--admin-control-height, 40px);\n}\n\n.ug-page .mat-mdc-unelevated-button,\n.ug-page .mat-mdc-outlined-button,\n.ug-page .mat-mdc-button {\n  min-height: var(--admin-control-height, 40px);\n}\n\nmat-paginator {\n  border-top: 1px solid rgba(0, 0, 0, 0.08);\n}\n\n.cell-muted {\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n  font-size: 0.875rem;\n}\n\n.ug-members-inline {\n  display: inline;\n}\n\n.ug-members-more {\n  border: 0;\n  background: transparent;\n  color: var(--mat-sys-primary, #1565c0);\n  cursor: pointer;\n  font: inherit;\n  font-size: 0.875rem;\n  font-weight: 500;\n  margin-left: 0.2rem;\n  padding: 0;\n  text-decoration: underline;\n  text-underline-offset: 2px;\n}\n\n.ug-members-more:hover,\n.ug-members-more:focus-visible {\n  color: var(--mat-sys-primary, #0d47a1);\n}\n\n:host ::ng-deep .ug-members-menu.mat-mdc-menu-panel {\n  min-width: 12rem;\n  max-width: 20rem;\n}\n\n.ug-members-menu__panel {\n  padding: 0.25rem 0;\n}\n\n.ug-members-menu__item {\n  color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87));\n  font-size: 0.9rem;\n  font-weight: 500;\n  line-height: 1.45;\n  min-height: 2.25rem;\n  opacity: 1;\n}\n\n.ok {\n  color: var(--mat-sys-primary, #1565c0);\n  font-size: 1.25rem;\n  width: 1.25rem;\n  height: 1.25rem;\n}\n\n.ug-center {\n  display: flex;\n  justify-content: center;\n  padding: 1rem;\n}\n\n.ug-error {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.ug-empty {\n  padding: 1rem 1.25rem;\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  font-size: 0.9rem;\n}\n\n@media (max-width: 900px) {\n  .ug-page {\n    padding: 1rem;\n  }\n\n  .ug-search {\n    min-width: 100%;\n  }\n\n  .ug-detail-head {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n}\n"] }]
    }], () => [], { tabGroup: [{ type: i0.ViewChild, args: ['ugTabGroup', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminUsersGroupsPageComponent, { className: "AdminUsersGroupsPageComponent", filePath: "libs/features/administration/src/lib/admin-users-groups-page/admin-users-groups-page.component.ts", lineNumber: 71 }); })();
