import { Component, LOCALE_ID, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentDetailService, PrincipalPermissionsService, UserService, principalPermissionTimeFrameLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { ConfirmDialogComponent } from '@nuxeo/satori-platform/ui';
import { UserFormDialogComponent, } from '../user-form-dialog/user-form-dialog.component';
import { ChangePasswordDialogComponent, } from '../change-password-dialog/change-password-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/table";
import * as i4 from "@angular/material/progress-spinner";
import * as i5 from "@angular/material/tooltip";
import * as i6 from "@angular/material/paginator";
const _c0 = a0 => ["/administration/users-groups/group", a0];
const _c1 = a0 => ["/doc", a0];
const _c2 = a0 => ({ group: a0 });
const _c3 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function AdminUserDetailsPageComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 5);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.loading"));
} }
function AdminUserDetailsPageComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.name"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31)(1, "a", 32);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const g_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, g_r3.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(g_r3.label);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.identifier"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(g_r4.id);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 30);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_56_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 31)(1, "button", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_56_Template_button_click_1_listener() { const g_r6 = i0.ɵɵrestoreView(_r5).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.removeGroup(g_r6.id)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-user-details-page.remove-group"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-user-details-page.remove-group"));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_tr_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 34);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_tr_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 35);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.no-groups-assigned"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 36);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.loading"));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.on"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31)(1, "div", 43)(2, "a", 32);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 44);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r8 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(3, _c1, row_r8.documentUid));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r8.documentTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r8.documentPath);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.right"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r9.permission);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.time-frame"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r10 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.timeFrameLabel(row_r10));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.granted-by"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r11 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r11.grantedBy ?? "\u2014");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 30);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_15_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 31)(1, "button", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_15_Template_button_click_1_listener() { const row_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r0 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r0.removePermission(row_r13)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "delete_outline");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-user-details-page.remove-permission"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-user-details-page.remove-permission"));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_tr_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 34);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 35);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.no-local-permissions"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "table", 37);
    i0.ɵɵelementContainerStart(1, 38);
    i0.ɵɵtemplate(2, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_2_Template, 3, 3, "th", 22)(3, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_3_Template, 6, 5, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(4, 39);
    i0.ɵɵtemplate(5, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_5_Template, 3, 3, "th", 22)(6, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_6_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(7, 40);
    i0.ɵɵtemplate(8, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_8_Template, 3, 3, "th", 22)(9, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_9_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(10, 41);
    i0.ɵɵtemplate(11, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_11_Template, 3, 3, "th", 22)(12, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_12_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(13, 25);
    i0.ɵɵtemplate(14, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_th_14_Template, 1, 0, "th", 22)(15, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_td_15_Template, 6, 6, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(16, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_tr_16_Template, 1, 0, "tr", 26)(17, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_tr_17_Template, 1, 0, "tr", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_Conditional_18_Template, 3, 3, "p", 28);
    i0.ɵɵelementStart(19, "mat-paginator", 42);
    i0.ɵɵlistener("page", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_Template_mat_paginator_page_19_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r0.onLocalPermPage($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const lp_r14 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("dataSource", lp_r14.rows);
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(lp_r14.rows.length === 0 ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", lp_r14.totalDocuments)("pageSize", ctx_r0.permPageSize)("pageIndex", ctx_r0.localPageIndex())("hidePageSize", true);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Conditional_0_Template, 20, 8);
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_4_0 = ctx_r0.localPerm()) ? 0 : -1, tmp_4_0);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 36);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.loading"));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.on"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31)(1, "div", 43)(2, "a", 32);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 44);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r16 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(3, _c1, row_r16.documentUid));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r16.documentTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r16.documentPath);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.right"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r17 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r17.permission);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.time-frame"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r18 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.timeFrameLabel(row_r18));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 30);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-user-details-page.granted-by"), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r19 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r19.grantedBy ?? "\u2014");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 30);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_15_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 31)(1, "button", 33);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_15_Template_button_click_1_listener() { const row_r21 = i0.ɵɵrestoreView(_r20).$implicit; const ctx_r0 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r0.removePermission(row_r21)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "delete_outline");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-user-details-page.remove-permission"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-user-details-page.remove-permission"));
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_tr_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 34);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 35);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r22 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, "admin.no-permissions-for", i0.ɵɵpureFunction1(4, _c3, g_r22.label)), " ");
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "table", 37);
    i0.ɵɵelementContainerStart(1, 38);
    i0.ɵɵtemplate(2, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_2_Template, 3, 3, "th", 22)(3, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_3_Template, 6, 5, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(4, 39);
    i0.ɵɵtemplate(5, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_5_Template, 3, 3, "th", 22)(6, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_6_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(7, 40);
    i0.ɵɵtemplate(8, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_8_Template, 3, 3, "th", 22)(9, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_9_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(10, 41);
    i0.ɵɵtemplate(11, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_11_Template, 3, 3, "th", 22)(12, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_12_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(13, 25);
    i0.ɵɵtemplate(14, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_th_14_Template, 1, 0, "th", 22)(15, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_td_15_Template, 6, 6, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(16, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_tr_16_Template, 1, 0, "tr", 26)(17, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_tr_17_Template, 1, 0, "tr", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_Conditional_18_Template, 3, 6, "p", 28);
    i0.ɵɵelementStart(19, "mat-paginator", 42);
    i0.ɵɵlistener("page", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_Template_mat_paginator_page_19_listener($event) { i0.ɵɵrestoreView(_r15); const g_r22 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.onGroupPermPage(g_r22.id, $event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const gp_r23 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("dataSource", gp_r23.rows);
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(gp_r23.rows.length === 0 ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", gp_r23.totalDocuments)("pageSize", ctx_r0.permPageSize)("pageIndex", gp_r23.currentPageIndex)("hidePageSize", true);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Conditional_0_Template, 20, 8);
} if (rf & 2) {
    let tmp_14_0;
    const g_r22 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_14_0 = ctx_r0.groupPermPage(g_r22.id)) ? 0 : -1, tmp_14_0);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 16)(1, "header", 29)(2, "div", 18);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_5_Template, 3, 3, "div", 3)(6, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Conditional_6_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r22 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(4, 2, "settings.profile.group-permissions-heading", i0.ɵɵpureFunction1(5, _c2, g_r22.label)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.isGroupPermLoading(g_r22.id) ? 5 : ctx_r0.groupPermPage(g_r22.id) ? 6 : -1);
} }
function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 6)(1, "div", 7)(2, "div", 8)(3, "mat-icon");
    i0.ɵɵtext(4, "person");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 9)(6, "div", 10);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 11);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 12)(11, "button", 13);
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.confirmDelete()); });
    i0.ɵɵelementStart(12, "mat-icon");
    i0.ɵɵtext(13, "delete_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 13);
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openChangePassword()); });
    i0.ɵɵelementStart(17, "mat-icon");
    i0.ɵɵtext(18, "lock");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "button", 14);
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openEdit()); });
    i0.ɵɵelementStart(22, "mat-icon");
    i0.ɵɵtext(23, "edit");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "div", 15)(27, "div")(28, "strong");
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "div")(33, "strong");
    i0.ɵɵtext(34);
    i0.ɵɵpipe(35, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(37, "section", 16)(38, "header", 17)(39, "div", 18);
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "button", 19);
    i0.ɵɵlistener("click", function AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openEdit()); });
    i0.ɵɵelementStart(43, "mat-icon");
    i0.ɵɵtext(44, "add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(47, "table", 20);
    i0.ɵɵelementContainerStart(48, 21);
    i0.ɵɵtemplate(49, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_49_Template, 3, 3, "th", 22)(50, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_50_Template, 3, 4, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(51, 24);
    i0.ɵɵtemplate(52, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_52_Template, 3, 3, "th", 22)(53, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_53_Template, 2, 1, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(54, 25);
    i0.ɵɵtemplate(55, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_th_55_Template, 1, 0, "th", 22)(56, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_td_56_Template, 6, 6, "td", 23);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(57, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_tr_57_Template, 1, 0, "tr", 26)(58, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_tr_58_Template, 1, 0, "tr", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(59, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_59_Template, 3, 3, "p", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "section", 16)(61, "header", 29)(62, "div", 18);
    i0.ɵɵtext(63);
    i0.ɵɵpipe(64, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(65, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_65_Template, 3, 3, "div", 3)(66, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Conditional_66_Template, 1, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(67, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_For_68_Template, 7, 7, "section", 16, _forTrack0);
} if (rf & 2) {
    const u_r24 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(u_r24.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", u_r24.properties.firstName, " ", u_r24.properties.lastName);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 18, "admin.admin-user-details-page.delete"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(20, 20, "admin.admin-user-details-page.change-password"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(25, 22, "admin.admin-user-details-page.edit"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 24, "admin.admin-user-details-page.email"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", u_r24.properties.email || "\u2014", " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(35, 26, "admin.admin-user-details-page.company"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", u_r24.properties.company || "\u2014", " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(41, 28, "admin.admin-user-details-page.groups"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(46, 30, "admin.admin-user-details-page.add-to-group"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("dataSource", ctx_r0.groupInfo());
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.groupColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.groupColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.groupInfo().length === 0 ? 59 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(64, 32, "admin.admin-user-details-page.local-permissions"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.localPermLoading() ? 65 : ctx_r0.localPerm() ? 66 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.groupInfo());
} }
function AdminUserDetailsPageComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminUserDetailsPageComponent_Conditional_9_Conditional_0_Template, 69, 34);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.user()) ? 0 : -1, tmp_1_0);
} }
const PERM_PAGE_SIZE = 10;
export class AdminUserDetailsPageComponent {
    route = inject(ActivatedRoute);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    router = inject(Router);
    userService = inject(UserService);
    permService = inject(PrincipalPermissionsService);
    documentDetail = inject(DocumentDetailService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    user = signal(null, ...(ngDevMode ? [{ debugName: "user" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    groupColumns = ['name', 'identifier', 'actions'];
    permColumns = ['on', 'right', 'timeFrame', 'grantedBy', 'actions'];
    /** Group display names for the Groups table and permission section titles. */
    groupInfo = signal([], ...(ngDevMode ? [{ debugName: "groupInfo" }] : []));
    localPerm = signal(null, ...(ngDevMode ? [{ debugName: "localPerm" }] : []));
    localPermLoading = signal(false, ...(ngDevMode ? [{ debugName: "localPermLoading" }] : []));
    localPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "localPageIndex" }] : []));
    groupPermMap = signal({}, ...(ngDevMode ? [{ debugName: "groupPermMap" }] : []));
    groupPermLoading = signal({}, ...(ngDevMode ? [{ debugName: "groupPermLoading" }] : []));
    permPageSize = PERM_PAGE_SIZE;
    userId = '';
    resetState() {
        this.user.set(null);
        this.loading.set(false);
        this.error.set(null);
        this.groupInfo.set([]);
        this.localPerm.set(null);
        this.localPermLoading.set(false);
        this.localPageIndex.set(0);
        this.groupPermMap.set({});
        this.groupPermLoading.set({});
    }
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.userId = paramMap.get('userId') ?? '';
            this.resetState();
            this.load();
        });
    }
    load() {
        if (!this.userId) {
            this.error.set(this.translate.instant('admin.message.missing-user-id'));
            return;
        }
        this.loading.set(true);
        this.error.set(null);
        this.userService.getUser(this.userId).subscribe({
            next: (user) => {
                this.user.set(user);
                this.loading.set(false);
                this.loadGroupInfo(user);
                this.localPageIndex.set(0);
                this.loadLocalPerms();
                this.loadAllGroupPerms(user);
            },
            error: (e) => {
                this.error.set(e?.error?.message ?? this.translate.instant('admin.message.could-not-load-user-details'));
                this.loading.set(false);
            },
        });
    }
    loadGroupInfo(user) {
        const groups = user.properties.groups ?? [];
        if (!groups.length) {
            this.groupInfo.set([]);
            return;
        }
        forkJoin(groups.map((gid) => this.userService.getGroup(gid).pipe(catchError(() => of(null))))).subscribe((gs) => {
            this.groupInfo.set(groups.map((gid, i) => ({
                id: gid,
                label: gs[i]?.grouplabel ?? gid,
            })));
        });
    }
    loadLocalPerms() {
        this.localPermLoading.set(true);
        this.permService
            .listLocalPermissionRows(this.userId, PERM_PAGE_SIZE, this.localPageIndex())
            .subscribe({
            next: (p) => {
                this.localPerm.set(p);
                this.localPermLoading.set(false);
            },
            error: () => {
                this.localPerm.set({
                    rows: [],
                    totalDocuments: 0,
                    numberOfPages: 0,
                    currentPageIndex: 0,
                    currentPageSize: 0,
                });
                this.localPermLoading.set(false);
            },
        });
    }
    onLocalPermPage(e) {
        this.localPageIndex.set(e.pageIndex);
        this.loadLocalPerms();
    }
    loadAllGroupPerms(user) {
        const groups = user.properties.groups ?? [];
        this.groupPermMap.set({});
        const loading = {};
        for (const g of groups) {
            loading[g] = true;
        }
        this.groupPermLoading.set(loading);
        for (const g of groups) {
            this.loadGroupPermPage(g, 0);
        }
    }
    loadGroupPermPage(groupId, pageIndex) {
        this.groupPermLoading.update((m) => ({ ...m, [groupId]: true }));
        this.permService.listLocalPermissionRows(groupId, PERM_PAGE_SIZE, pageIndex).subscribe({
            next: (p) => {
                this.groupPermMap.update((m) => ({ ...m, [groupId]: p }));
                this.groupPermLoading.update((m) => ({ ...m, [groupId]: false }));
            },
            error: () => {
                this.groupPermMap.update((m) => ({
                    ...m,
                    [groupId]: {
                        rows: [],
                        totalDocuments: 0,
                        numberOfPages: 0,
                        currentPageIndex: 0,
                        currentPageSize: 0,
                    },
                }));
                this.groupPermLoading.update((m) => ({ ...m, [groupId]: false }));
            },
        });
    }
    onGroupPermPage(groupId, e) {
        this.loadGroupPermPage(groupId, e.pageIndex);
    }
    groupPermPage(groupId) {
        return this.groupPermMap()[groupId] ?? null;
    }
    isGroupPermLoading(groupId) {
        return this.groupPermLoading()[groupId] === true;
    }
    openChangePassword() {
        const user = this.user();
        if (!user)
            return;
        this.dialog
            .open(ChangePasswordDialogComponent, {
            width: '400px',
            data: { username: user.id },
        })
            .afterClosed()
            .subscribe((newPassword) => {
            if (!newPassword)
                return;
            this.userService.updateUser(user.id, { password: newPassword }).subscribe({
                next: () => {
                    this.snackBar.open(this.translate.instant('admin.message.password-updated'), this.translate.instant('common.dismiss'), { duration: 3000 });
                    this.load();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.password-update-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    openEdit() {
        const user = this.user();
        if (!user)
            return;
        this.dialog
            .open(UserFormDialogComponent, {
            width: '480px',
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
                    this.load();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.update-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    confirmDelete() {
        const user = this.user();
        if (!user)
            return;
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
                    this.router.navigate(['/administration/users-groups']);
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.delete-failed'), this.translate.instant('common.dismiss'), { duration: 5000 }),
            });
        });
    }
    removeGroup(groupId) {
        const user = this.user();
        if (!user)
            return;
        const nextGroups = (user.properties.groups ?? []).filter((g) => g !== groupId);
        this.userService.updateUser(user.id, { groups: nextGroups }).subscribe({
            next: () => {
                this.snackBar.open(this.translate.instant('admin.message.group-removed-from-user'), this.translate.instant('common.dismiss'), { duration: 2500 });
                this.load();
            },
            error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.could-not-update-user-groups'), this.translate.instant('common.dismiss'), {
                duration: 5000,
            }),
        });
    }
    removePermission(row) {
        this.documentDetail
            .removePermission(row.documentUid, {
            user: row.acePrincipal,
            permission: row.permission,
            acl: 'local',
        })
            .subscribe({
            next: () => {
                this.snackBar.open(this.translate.instant('admin.message.permission-removed'), this.translate.instant('common.dismiss'), { duration: 2500 });
                this.loadLocalPerms();
                const u = this.user();
                if (u)
                    this.loadAllGroupPerms(u);
            },
            error: (e) => this.snackBar.open(e?.error?.message ??
                this.translate.instant('admin.message.could-not-remove-permission'), this.translate.instant('common.dismiss'), {
                duration: 5000,
            }),
        });
    }
    timeFrameLabel(row) {
        return principalPermissionTimeFrameLabel(row, (key) => this.translate.instant(key), this.locale);
    }
    static ɵfac = function AdminUserDetailsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminUserDetailsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminUserDetailsPageComponent, selectors: [["lib-admin-user-details-page"]], decls: 10, vars: 4, consts: [[1, "ud-page"], [1, "ud-back"], ["routerLink", "/administration/users-groups", "mat-button", ""], [1, "ud-center"], [1, "ud-error"], ["diameter", "36"], [1, "ud-card", "mat-elevation-z1", "ud-profile"], [1, "ud-profile__main"], ["aria-hidden", "true", 1, "ud-avatar"], [1, "ud-profile__text"], ["role", "heading", "aria-level", "1", 1, "ud-title"], [1, "ud-sub"], [1, "ud-actions"], ["type", "button", "mat-button", "", 3, "click"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click"], [1, "ud-meta"], [1, "ud-card", "mat-elevation-z1"], [1, "ud-section-head", "ud-section-head--row"], ["role", "heading", "aria-level", "2", 1, "ud-section-heading"], ["type", "button", "mat-stroked-button", "", "color", "primary", 3, "click"], ["mat-table", "", 1, "ud-table", 3, "dataSource"], ["matColumnDef", "name"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "identifier"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [1, "ud-empty"], [1, "ud-section-head"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "ud-link", 3, "routerLink"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip"], ["mat-header-row", ""], ["mat-row", ""], ["diameter", "32"], ["mat-table", "", 1, "ud-table", "ud-perm-table", 3, "dataSource"], ["matColumnDef", "on"], ["matColumnDef", "right"], ["matColumnDef", "timeFrame"], ["matColumnDef", "grantedBy"], [3, "page", "length", "pageSize", "pageIndex", "hidePageSize"], [1, "ud-on"], [1, "ud-path"]], template: function AdminUserDetailsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "a", 2)(3, "mat-icon");
            i0.ɵɵtext(4, "arrow_back");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(7, AdminUserDetailsPageComponent_Conditional_7_Template, 3, 3, "div", 3)(8, AdminUserDetailsPageComponent_Conditional_8_Template, 2, 1, "p", 4)(9, AdminUserDetailsPageComponent_Conditional_9_Template, 1, 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "admin.admin-user-details-page.back-to-users-amp-groups"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 7 : ctx.error() ? 8 : ctx.user() ? 9 : -1);
        } }, dependencies: [RouterLink,
            MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTableModule, i3.MatTable, i3.MatHeaderCellDef, i3.MatHeaderRowDef, i3.MatColumnDef, i3.MatCellDef, i3.MatRowDef, i3.MatHeaderCell, i3.MatCell, i3.MatHeaderRow, i3.MatRow, MatProgressSpinnerModule, i4.MatProgressSpinner, MatTooltipModule, i5.MatTooltip, MatDialogModule,
            MatSnackBarModule,
            MatPaginatorModule, i6.MatPaginator, TranslatePipe], styles: [".ud-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.ud-back[_ngcontent-%COMP%] {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.ud-card[_ngcontent-%COMP%] {\n  border-radius: var(--admin-radius-1, 8px);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-3, 1rem);\n}\n\n.ud-profile[_ngcontent-%COMP%] {\n  display: grid;\n  gap: var(--admin-space-3, 1rem);\n}\n\n.ud-profile__main[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: var(--admin-space-3, 1rem);\n}\n\n.ud-avatar[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: var(--mat-sys-surface-container-highest, rgba(0, 0, 0, 0.08));\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ud-avatar[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n}\n\n.ud-profile__text[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.ud-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n.ud-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 600;\n}\n\n.ud-sub[_ngcontent-%COMP%] {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n}\n\n.ud-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n\n.ud-meta[_ngcontent-%COMP%] {\n  margin-top: 0;\n  display: grid;\n  grid-template-columns: repeat(2, minmax(220px, 1fr));\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n@media (min-width: 720px) {\n  .ud-profile[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr auto;\n    align-items: start;\n  }\n\n  .ud-meta[_ngcontent-%COMP%] {\n    grid-column: 1 / -1;\n  }\n}\n\n.ud-section-head[_ngcontent-%COMP%]   .ud-section-heading[_ngcontent-%COMP%] {\n  margin: 0 0 var(--admin-space-2, 0.75rem);\n  font-size: 1rem;\n  font-weight: 600;\n}\n\n.ud-section-head--row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n\n.ud-section-head--row[_ngcontent-%COMP%]   .ud-section-heading[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.ud-link[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary, #1565c0);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n}\n\n.ud-link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n\n.ud-table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.ud-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.ud-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n.ud-empty[_ngcontent-%COMP%] {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ud-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1.25rem;\n}\n\n.ud-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.ud-on[_ngcontent-%COMP%]   .ud-path[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  margin-top: 0.15rem;\n  word-break: break-all;\n}\n\n.ud-perm-table[_ngcontent-%COMP%] {\n  margin-bottom: 0.25rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminUserDetailsPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-user-details-page', standalone: true, imports: [
                    TranslatePipe,
                    RouterLink,
                    MatButtonModule,
                    MatIconModule,
                    MatTableModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                    MatDialogModule,
                    MatSnackBarModule,
                    MatPaginatorModule,
                ], template: "<div class=\"ud-page\">\n  <div class=\"ud-back\">\n    <a routerLink=\"/administration/users-groups\" mat-button>\n      <mat-icon>arrow_back</mat-icon>\n      {{ 'admin.admin-user-details-page.back-to-users-amp-groups' | translate }}\n    </a>\n  </div>\n\n  @if (loading()) {\n    <div class=\"ud-center\">\n      <mat-spinner\n        diameter=\"36\"\n        [attr.aria-label]=\"'admin.admin-user-details-page.loading' | translate\"\n      />\n    </div>\n  } @else if (error()) {\n    <p class=\"ud-error\">{{ error() }}</p>\n  } @else if (user()) {\n    @if (user(); as u) {\n      <section class=\"ud-card mat-elevation-z1 ud-profile\">\n        <div class=\"ud-profile__main\">\n          <div class=\"ud-avatar\" aria-hidden=\"true\">\n            <mat-icon>person</mat-icon>\n          </div>\n          <div class=\"ud-profile__text\">\n            <div class=\"ud-title\" role=\"heading\" aria-level=\"1\">{{ u.id }}</div>\n            <p class=\"ud-sub\">{{ u.properties.firstName }} {{ u.properties.lastName }}</p>\n          </div>\n        </div>\n        <div class=\"ud-actions\">\n          <button type=\"button\" mat-button (click)=\"confirmDelete()\">\n            <mat-icon>delete_outline</mat-icon>\n            {{ 'admin.admin-user-details-page.delete' | translate }}\n          </button>\n          <button type=\"button\" mat-button (click)=\"openChangePassword()\">\n            <mat-icon>lock</mat-icon>\n            {{ 'admin.admin-user-details-page.change-password' | translate }}\n          </button>\n          <button type=\"button\" mat-flat-button color=\"primary\" (click)=\"openEdit()\">\n            <mat-icon>edit</mat-icon>\n            {{ 'admin.admin-user-details-page.edit' | translate }}\n          </button>\n        </div>\n        <div class=\"ud-meta\">\n          <div>\n            <strong>{{ 'admin.admin-user-details-page.email' | translate }}</strong>\n            {{ u.properties.email || '\u2014' }}\n          </div>\n          <div>\n            <strong>{{ 'admin.admin-user-details-page.company' | translate }}</strong>\n            {{ u.properties.company || '\u2014' }}\n          </div>\n        </div>\n      </section>\n\n      <section class=\"ud-card mat-elevation-z1\">\n        <header class=\"ud-section-head ud-section-head--row\">\n          <div class=\"ud-section-heading\" role=\"heading\" aria-level=\"2\">\n            {{ 'admin.admin-user-details-page.groups' | translate }}\n          </div>\n          <button type=\"button\" mat-stroked-button color=\"primary\" (click)=\"openEdit()\">\n            <mat-icon>add</mat-icon>\n            {{ 'admin.admin-user-details-page.add-to-group' | translate }}\n          </button>\n        </header>\n        <table mat-table [dataSource]=\"groupInfo()\" class=\"ud-table\">\n          <ng-container matColumnDef=\"name\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-user-details-page.name' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let g\">\n              <a class=\"ud-link\" [routerLink]=\"['/administration/users-groups/group', g.id]\">{{\n                g.label\n              }}</a>\n            </td>\n          </ng-container>\n          <ng-container matColumnDef=\"identifier\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-user-details-page.identifier' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let g\">{{ g.id }}</td>\n          </ng-container>\n          <ng-container matColumnDef=\"actions\">\n            <th mat-header-cell *matHeaderCellDef></th>\n            <td mat-cell *matCellDef=\"let g\">\n              <button\n                type=\"button\"\n                mat-icon-button\n                (click)=\"removeGroup(g.id)\"\n                [attr.aria-label]=\"'admin.admin-user-details-page.remove-group' | translate\"\n                [matTooltip]=\"'admin.admin-user-details-page.remove-group' | translate\"\n              >\n                <mat-icon>close</mat-icon>\n              </button>\n            </td>\n          </ng-container>\n          <tr mat-header-row *matHeaderRowDef=\"groupColumns\"></tr>\n          <tr mat-row *matRowDef=\"let row; columns: groupColumns\"></tr>\n        </table>\n        @if (groupInfo().length === 0) {\n          <p class=\"ud-empty\">\n            {{ 'admin.admin-user-details-page.no-groups-assigned' | translate }}\n          </p>\n        }\n      </section>\n\n      <section class=\"ud-card mat-elevation-z1\">\n        <header class=\"ud-section-head\">\n          <div class=\"ud-section-heading\" role=\"heading\" aria-level=\"2\">\n            {{ 'admin.admin-user-details-page.local-permissions' | translate }}\n          </div>\n        </header>\n        @if (localPermLoading()) {\n          <div class=\"ud-center\">\n            <mat-spinner\n              diameter=\"32\"\n              [attr.aria-label]=\"'admin.admin-user-details-page.loading' | translate\"\n            />\n          </div>\n        } @else if (localPerm()) {\n          @if (localPerm(); as lp) {\n            <table mat-table [dataSource]=\"lp.rows\" class=\"ud-table ud-perm-table\">\n              <ng-container matColumnDef=\"on\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-user-details-page.on' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">\n                  <div class=\"ud-on\">\n                    <a class=\"ud-link\" [routerLink]=\"['/doc', row.documentUid]\">{{\n                      row.documentTitle\n                    }}</a>\n                    <div class=\"ud-path\">{{ row.documentPath }}</div>\n                  </div>\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"right\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-user-details-page.right' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ row.permission }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"timeFrame\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-user-details-page.time-frame' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ timeFrameLabel(row) }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"grantedBy\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-user-details-page.granted-by' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ row.grantedBy ?? '\u2014' }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"actions\">\n                <th mat-header-cell *matHeaderCellDef></th>\n                <td mat-cell *matCellDef=\"let row\">\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"removePermission(row)\"\n                    [attr.aria-label]=\"\n                      'admin.admin-user-details-page.remove-permission' | translate\n                    \"\n                    [matTooltip]=\"'admin.admin-user-details-page.remove-permission' | translate\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"permColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: permColumns\"></tr>\n            </table>\n            @if (lp.rows.length === 0) {\n              <p class=\"ud-empty\">\n                {{ 'admin.admin-user-details-page.no-local-permissions' | translate }}\n              </p>\n            }\n            <mat-paginator\n              [length]=\"lp.totalDocuments\"\n              [pageSize]=\"permPageSize\"\n              [pageIndex]=\"localPageIndex()\"\n              [hidePageSize]=\"true\"\n              (page)=\"onLocalPermPage($event)\"\n            />\n          }\n        }\n      </section>\n\n      @for (g of groupInfo(); track g.id) {\n        <section class=\"ud-card mat-elevation-z1\">\n          <header class=\"ud-section-head\">\n            <div class=\"ud-section-heading\" role=\"heading\" aria-level=\"2\">\n              {{ 'settings.profile.group-permissions-heading' | translate: { group: g.label } }}\n            </div>\n          </header>\n          @if (isGroupPermLoading(g.id)) {\n            <div class=\"ud-center\">\n              <mat-spinner\n                diameter=\"32\"\n                [attr.aria-label]=\"'admin.admin-user-details-page.loading' | translate\"\n              />\n            </div>\n          } @else if (groupPermPage(g.id)) {\n            @if (groupPermPage(g.id); as gp) {\n              <table mat-table [dataSource]=\"gp.rows\" class=\"ud-table ud-perm-table\">\n                <ng-container matColumnDef=\"on\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'admin.admin-user-details-page.on' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let row\">\n                    <div class=\"ud-on\">\n                      <a class=\"ud-link\" [routerLink]=\"['/doc', row.documentUid]\">{{\n                        row.documentTitle\n                      }}</a>\n                      <div class=\"ud-path\">{{ row.documentPath }}</div>\n                    </div>\n                  </td>\n                </ng-container>\n                <ng-container matColumnDef=\"right\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'admin.admin-user-details-page.right' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let row\">{{ row.permission }}</td>\n                </ng-container>\n                <ng-container matColumnDef=\"timeFrame\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'admin.admin-user-details-page.time-frame' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let row\">{{ timeFrameLabel(row) }}</td>\n                </ng-container>\n                <ng-container matColumnDef=\"grantedBy\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'admin.admin-user-details-page.granted-by' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let row\">{{ row.grantedBy ?? '\u2014' }}</td>\n                </ng-container>\n                <ng-container matColumnDef=\"actions\">\n                  <th mat-header-cell *matHeaderCellDef></th>\n                  <td mat-cell *matCellDef=\"let row\">\n                    <button\n                      type=\"button\"\n                      mat-icon-button\n                      (click)=\"removePermission(row)\"\n                      [attr.aria-label]=\"\n                        'admin.admin-user-details-page.remove-permission' | translate\n                      \"\n                      [matTooltip]=\"'admin.admin-user-details-page.remove-permission' | translate\"\n                    >\n                      <mat-icon>delete_outline</mat-icon>\n                    </button>\n                  </td>\n                </ng-container>\n                <tr mat-header-row *matHeaderRowDef=\"permColumns\"></tr>\n                <tr mat-row *matRowDef=\"let row; columns: permColumns\"></tr>\n              </table>\n              @if (gp.rows.length === 0) {\n                <p class=\"ud-empty\">\n                  {{ 'admin.no-permissions-for' | translate: { name: g.label } }}\n                </p>\n              }\n              <mat-paginator\n                [length]=\"gp.totalDocuments\"\n                [pageSize]=\"permPageSize\"\n                [pageIndex]=\"gp.currentPageIndex\"\n                [hidePageSize]=\"true\"\n                (page)=\"onGroupPermPage(g.id, $event)\"\n              />\n            }\n          }\n        </section>\n      }\n    }\n  }\n</div>\n", styles: [".ud-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.ud-back {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.ud-card {\n  border-radius: var(--admin-radius-1, 8px);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-3, 1rem);\n}\n\n.ud-profile {\n  display: grid;\n  gap: var(--admin-space-3, 1rem);\n}\n\n.ud-profile__main {\n  display: flex;\n  align-items: flex-start;\n  gap: var(--admin-space-3, 1rem);\n}\n\n.ud-avatar {\n  flex-shrink: 0;\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: var(--mat-sys-surface-container-highest, rgba(0, 0, 0, 0.08));\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ud-avatar mat-icon {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n}\n\n.ud-profile__text {\n  flex: 1;\n  min-width: 0;\n}\n\n.ud-head {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n.ud-title {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 600;\n}\n\n.ud-sub {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n}\n\n.ud-actions {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n\n.ud-meta {\n  margin-top: 0;\n  display: grid;\n  grid-template-columns: repeat(2, minmax(220px, 1fr));\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n@media (min-width: 720px) {\n  .ud-profile {\n    grid-template-columns: 1fr auto;\n    align-items: start;\n  }\n\n  .ud-meta {\n    grid-column: 1 / -1;\n  }\n}\n\n.ud-section-head .ud-section-heading {\n  margin: 0 0 var(--admin-space-2, 0.75rem);\n  font-size: 1rem;\n  font-weight: 600;\n}\n\n.ud-section-head--row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n\n.ud-section-head--row .ud-section-heading {\n  margin: 0;\n}\n\n.ud-link {\n  color: var(--mat-sys-primary, #1565c0);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n}\n\n.ud-link:hover {\n  text-decoration: underline;\n}\n\n.ud-table {\n  width: 100%;\n}\n\n.ud-table th.mat-mdc-header-cell,\n.ud-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n.ud-empty {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.ud-center {\n  display: flex;\n  justify-content: center;\n  padding: 1.25rem;\n}\n\n.ud-error {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.ud-on .ud-path {\n  font-size: 0.8rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  margin-top: 0.15rem;\n  word-break: break-all;\n}\n\n.ud-perm-table {\n  margin-bottom: 0.25rem;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminUserDetailsPageComponent, { className: "AdminUserDetailsPageComponent", filePath: "libs/features/administration/src/lib/admin-user-details-page/admin-user-details-page.component.ts", lineNumber: 57 }); })();
