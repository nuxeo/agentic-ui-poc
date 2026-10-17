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
import { DocumentDetailService, PrincipalPermissionsService, UserService, principalPermissionTimeFrameLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { ConfirmDialogComponent } from '@nuxeo/satori-platform/ui';
import { GroupFormDialogComponent, } from '../group-form-dialog/group-form-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/table";
import * as i4 from "@angular/material/progress-spinner";
import * as i5 from "@angular/material/tooltip";
import * as i6 from "@angular/material/paginator";
const _c0 = () => [];
const _c1 = a0 => ({ count: a0 });
const _c2 = a0 => ["/administration/users-groups/user", a0];
const _c3 = a0 => ["/administration/users-groups/group", a0];
const _c4 = a0 => ["/doc", a0];
const _c5 = a0 => ({ name: a0 });
function AdminGroupDetailsPageComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 5);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.loading"));
} }
function AdminGroupDetailsPageComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.name"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26)(1, "a", 27);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const member_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c2, member_r3));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(member_r3);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 25);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_38_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 26)(1, "button", 28);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_38_Template_button_click_1_listener() { const member_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.removeMember(member_r5)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-group-details-page.remove-member"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-group-details-page.remove-member"));
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 29);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 30);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.no-users-in-this-group"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.name"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26)(1, "a", 27);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const nested_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c3, nested_r6));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(nested_r6);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 25);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_53_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 26)(1, "button", 28);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_53_Template_button_click_1_listener() { const nested_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.removeNestedGroup(nested_r8)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-group-details-page.remove-nested-group"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-group-details-page.remove-nested-group"));
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 29);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 30);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.no-nested-groups"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "mat-spinner", 31);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.loading"));
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.on"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26)(1, "div", 38)(2, "a", 27);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 39);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r10 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(3, _c4, row_r10.documentUid));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r10.documentTitle);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r10.documentPath);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.right"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r11 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r11.permission);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.time-frame"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r12 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.timeFrameLabel(row_r12));
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "admin.admin-group-details-page.granted-by"), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r13 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r13.grantedBy ?? "\u2014");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th", 25);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_15_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 26)(1, "button", 28);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_15_Template_button_click_1_listener() { const row_r15 = i0.ɵɵrestoreView(_r14).$implicit; const ctx_r0 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r0.removePermission(row_r15)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "delete_outline");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 2, "admin.admin-group-details-page.remove-permission"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "admin.admin-group-details-page.remove-permission"));
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_tr_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 29);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 30);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r16 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, "admin.no-permissions-for", i0.ɵɵpureFunction1(4, _c5, g_r16.grouplabel || g_r16.groupname)), " ");
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "table", 32);
    i0.ɵɵelementContainerStart(1, 33);
    i0.ɵɵtemplate(2, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_2_Template, 3, 3, "th", 18)(3, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_3_Template, 6, 5, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(4, 34);
    i0.ɵɵtemplate(5, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_5_Template, 3, 3, "th", 18)(6, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_6_Template, 2, 1, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(7, 35);
    i0.ɵɵtemplate(8, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_8_Template, 3, 3, "th", 18)(9, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_9_Template, 2, 1, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(10, 36);
    i0.ɵɵtemplate(11, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_11_Template, 3, 3, "th", 18)(12, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_12_Template, 2, 1, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(13, 20);
    i0.ɵɵtemplate(14, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_th_14_Template, 1, 0, "th", 18)(15, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_td_15_Template, 6, 6, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(16, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_tr_16_Template, 1, 0, "tr", 21)(17, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_tr_17_Template, 1, 0, "tr", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_Conditional_18_Template, 3, 6, "p", 23);
    i0.ɵɵelementStart(19, "mat-paginator", 37);
    i0.ɵɵlistener("page", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_Template_mat_paginator_page_19_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r0.onLocalPermPage($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const lp_r17 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("dataSource", lp_r17.rows);
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.permColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional(lp_r17.rows.length === 0 ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", lp_r17.totalDocuments)("pageSize", ctx_r0.permPageSize)("pageIndex", ctx_r0.localPageIndex())("hidePageSize", true);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Conditional_0_Template, 20, 8);
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_4_0 = ctx_r0.localPerm()) ? 0 : -1, tmp_4_0);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 6)(1, "header", 7)(2, "div")(3, "div", 8);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 9);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 10)(8, "button", 11);
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.confirmDelete()); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "delete_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 11);
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openEdit()); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "person_add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "button", 12);
    i0.ɵɵlistener("click", function AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openEdit()); });
    i0.ɵɵelementStart(19, "mat-icon");
    i0.ɵɵtext(20, "edit");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(23, "p", 13);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "section", 6)(28, "header", 14)(29, "div", 15);
    i0.ɵɵtext(30);
    i0.ɵɵpipe(31, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(32, "table", 16);
    i0.ɵɵelementContainerStart(33, 17);
    i0.ɵɵtemplate(34, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_34_Template, 3, 3, "th", 18)(35, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_35_Template, 3, 4, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(36, 20);
    i0.ɵɵtemplate(37, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_37_Template, 1, 0, "th", 18)(38, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_38_Template, 6, 6, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(39, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_39_Template, 1, 0, "tr", 21)(40, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_40_Template, 1, 0, "tr", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(41, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_41_Template, 3, 3, "p", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "section", 6)(43, "header", 14)(44, "div", 15);
    i0.ɵɵtext(45);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(47, "table", 16);
    i0.ɵɵelementContainerStart(48, 24);
    i0.ɵɵtemplate(49, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_49_Template, 3, 3, "th", 18)(50, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_50_Template, 3, 4, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(51, 20);
    i0.ɵɵtemplate(52, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_th_52_Template, 1, 0, "th", 18)(53, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_td_53_Template, 6, 6, "td", 19);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(54, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_54_Template, 1, 0, "tr", 21)(55, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_tr_55_Template, 1, 0, "tr", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(56, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_56_Template, 3, 3, "p", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "section", 6)(58, "header", 14)(59, "div", 15);
    i0.ɵɵtext(60);
    i0.ɵɵpipe(61, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(62, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_62_Template, 3, 3, "div", 3)(63, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Conditional_63_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r16 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", g_r16.grouplabel || g_r16.groupname, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(g_r16.groupname);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 19, "admin.admin-group-details-page.delete"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 21, "admin.admin-group-details-page.add-members"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 23, "admin.admin-group-details-page.edit"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind2(25, 25, (g_r16.memberUsers ?? i0.ɵɵpureFunction0(37, _c0)).length === 1 ? "common.count.member-one" : "common.count.member-many", i0.ɵɵpureFunction1(39, _c1, (g_r16.memberUsers ?? i0.ɵɵpureFunction0(38, _c0)).length)), " \u2022 ", i0.ɵɵpipeBind2(26, 28, (g_r16.memberGroups ?? i0.ɵɵpureFunction0(41, _c0)).length === 1 ? "common.count.nested-group-one" : "common.count.nested-group-many", i0.ɵɵpureFunction1(43, _c1, (g_r16.memberGroups ?? i0.ɵɵpureFunction0(42, _c0)).length)), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(31, 31, "admin.admin-group-details-page.users"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("dataSource", g_r16.memberUsers ?? i0.ɵɵpureFunction0(45, _c0));
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.userColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.userColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional((g_r16.memberUsers ?? i0.ɵɵpureFunction0(46, _c0)).length === 0 ? 41 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(46, 33, "admin.admin-group-details-page.nested-groups"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("dataSource", g_r16.memberGroups ?? i0.ɵɵpureFunction0(47, _c0));
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r0.nestedColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r0.nestedColumns);
    i0.ɵɵadvance();
    i0.ɵɵconditional((g_r16.memberGroups ?? i0.ɵɵpureFunction0(48, _c0)).length === 0 ? 56 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(61, 35, "admin.admin-group-details-page.local-permissions"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.localPermLoading() ? 62 : ctx_r0.localPerm() ? 63 : -1);
} }
function AdminGroupDetailsPageComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminGroupDetailsPageComponent_Conditional_9_Conditional_0_Template, 64, 49);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.group()) ? 0 : -1, tmp_1_0);
} }
export class AdminGroupDetailsPageComponent {
    route = inject(ActivatedRoute);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    router = inject(Router);
    userService = inject(UserService);
    permService = inject(PrincipalPermissionsService);
    documentDetail = inject(DocumentDetailService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    group = signal(null, ...(ngDevMode ? [{ debugName: "group" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    userColumns = ['username', 'actions'];
    nestedColumns = ['groupname', 'actions'];
    permColumns = ['on', 'right', 'timeFrame', 'grantedBy', 'actions'];
    localPerm = signal(null, ...(ngDevMode ? [{ debugName: "localPerm" }] : []));
    localPermLoading = signal(false, ...(ngDevMode ? [{ debugName: "localPermLoading" }] : []));
    localPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "localPageIndex" }] : []));
    permPageSize = 10;
    groupId = '';
    resetState() {
        this.group.set(null);
        this.loading.set(false);
        this.error.set(null);
        this.localPerm.set(null);
        this.localPermLoading.set(false);
        this.localPageIndex.set(0);
    }
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.groupId = paramMap.get('groupId') ?? '';
            this.resetState();
            this.load();
        });
    }
    load() {
        if (!this.groupId) {
            this.error.set(this.translate.instant('admin.message.missing-group-id'));
            return;
        }
        this.loading.set(true);
        this.error.set(null);
        this.userService.getGroup(this.groupId).subscribe({
            next: (group) => {
                this.group.set(group);
                this.loading.set(false);
                this.localPageIndex.set(0);
                this.loadLocalPerms();
            },
            error: (e) => {
                this.error.set(e?.error?.message ?? this.translate.instant('admin.message.could-not-load-group-details'));
                this.loading.set(false);
            },
        });
    }
    openEdit() {
        const group = this.group();
        if (!group)
            return;
        this.dialog
            .open(GroupFormDialogComponent, {
            width: '480px',
            data: { mode: 'edit', group },
        })
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
                    this.load();
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.update-failed'), this.translate.instant('common.dismiss'), {
                    duration: 5000,
                }),
            });
        });
    }
    confirmDelete() {
        const group = this.group();
        if (!group)
            return;
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
                    this.router.navigate(['/administration/users-groups']);
                },
                error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.delete-failed'), this.translate.instant('common.dismiss'), { duration: 5000 }),
            });
        });
    }
    removeMember(userId) {
        const group = this.group();
        if (!group)
            return;
        const nextMembers = (group.memberUsers ?? []).filter((id) => id !== userId);
        this.userService.updateGroup(group.groupname, { memberUsers: nextMembers }).subscribe({
            next: () => {
                this.snackBar.open(this.translate.instant('admin.message.member-removed'), this.translate.instant('common.dismiss'), { duration: 2500 });
                this.load();
            },
            error: (e) => this.snackBar.open(e?.error?.message ?? this.translate.instant('admin.message.could-not-remove-member'), this.translate.instant('common.dismiss'), {
                duration: 5000,
            }),
        });
    }
    loadLocalPerms() {
        this.localPermLoading.set(true);
        this.permService
            .listLocalPermissionRows(this.groupId, this.permPageSize, this.localPageIndex())
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
    removeNestedGroup(nestedId) {
        const group = this.group();
        if (!group)
            return;
        const next = (group.memberGroups ?? []).filter((id) => id !== nestedId);
        this.userService.updateGroup(group.groupname, { memberGroups: next }).subscribe({
            next: () => {
                this.snackBar.open(this.translate.instant('admin.message.nested-group-removed'), this.translate.instant('common.dismiss'), { duration: 2500 });
                this.load();
            },
            error: (e) => this.snackBar.open(e?.error?.message ??
                this.translate.instant('admin.message.could-not-update-nested-groups'), this.translate.instant('common.dismiss'), {
                duration: 5000,
            }),
        });
    }
    static ɵfac = function AdminGroupDetailsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminGroupDetailsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminGroupDetailsPageComponent, selectors: [["lib-admin-group-details-page"]], decls: 10, vars: 4, consts: [[1, "gd-page"], [1, "gd-back"], ["routerLink", "/administration/users-groups", "mat-button", ""], [1, "gd-center"], [1, "gd-error"], ["diameter", "36"], [1, "gd-card", "mat-elevation-z1"], [1, "gd-head"], ["role", "heading", "aria-level", "1", 1, "gd-title"], [1, "gd-sub"], [1, "gd-actions"], ["type", "button", "mat-button", "", 3, "click"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click"], [1, "gd-meta"], [1, "gd-section-head"], ["role", "heading", "aria-level", "2", 1, "gd-section-heading"], ["mat-table", "", 1, "gd-table", 3, "dataSource"], ["matColumnDef", "username"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "actions"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], [1, "gd-empty"], ["matColumnDef", "groupname"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "gd-link", 3, "routerLink"], ["type", "button", "mat-icon-button", "", 3, "click", "matTooltip"], ["mat-header-row", ""], ["mat-row", ""], ["diameter", "32"], ["mat-table", "", 1, "gd-table", "gd-perm-table", 3, "dataSource"], ["matColumnDef", "on"], ["matColumnDef", "right"], ["matColumnDef", "timeFrame"], ["matColumnDef", "grantedBy"], [3, "page", "length", "pageSize", "pageIndex", "hidePageSize"], [1, "gd-on"], [1, "gd-path"]], template: function AdminGroupDetailsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "a", 2)(3, "mat-icon");
            i0.ɵɵtext(4, "arrow_back");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(7, AdminGroupDetailsPageComponent_Conditional_7_Template, 3, 3, "div", 3)(8, AdminGroupDetailsPageComponent_Conditional_8_Template, 2, 1, "p", 4)(9, AdminGroupDetailsPageComponent_Conditional_9_Template, 1, 1);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 2, "admin.admin-group-details-page.back-to-users-amp-groups"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 7 : ctx.error() ? 8 : ctx.group() ? 9 : -1);
        } }, dependencies: [RouterLink,
            MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTableModule, i3.MatTable, i3.MatHeaderCellDef, i3.MatHeaderRowDef, i3.MatColumnDef, i3.MatCellDef, i3.MatRowDef, i3.MatHeaderCell, i3.MatCell, i3.MatHeaderRow, i3.MatRow, MatProgressSpinnerModule, i4.MatProgressSpinner, MatTooltipModule, i5.MatTooltip, MatDialogModule,
            MatSnackBarModule,
            MatPaginatorModule, i6.MatPaginator, TranslatePipe], styles: [".gd-page[_ngcontent-%COMP%] {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.gd-back[_ngcontent-%COMP%] {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.gd-card[_ngcontent-%COMP%] {\n  border-radius: var(--admin-radius-1, 8px);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-3, 1rem);\n}\n\n.gd-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n.gd-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 600;\n}\n\n.gd-sub[_ngcontent-%COMP%] {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n}\n\n.gd-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n\n.gd-meta[_ngcontent-%COMP%] {\n  margin: 0.75rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n}\n\n.gd-section-head[_ngcontent-%COMP%]   .gd-section-heading[_ngcontent-%COMP%] {\n  margin: 0 0 var(--admin-space-2, 0.75rem);\n  font-size: 1rem;\n  font-weight: 600;\n}\n\n.gd-table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.gd-table[_ngcontent-%COMP%]   th.mat-mdc-header-cell[_ngcontent-%COMP%], \n.gd-table[_ngcontent-%COMP%]   td.mat-mdc-cell[_ngcontent-%COMP%] {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n.gd-empty[_ngcontent-%COMP%] {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.gd-center[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 1.25rem;\n}\n\n.gd-error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.gd-on[_ngcontent-%COMP%]   .gd-path[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  margin-top: 0.15rem;\n  word-break: break-all;\n}\n\n.gd-perm-table[_ngcontent-%COMP%] {\n  margin-bottom: 0.25rem;\n}\n\n.gd-link[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary, #1565c0);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n}\n\n.gd-link[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminGroupDetailsPageComponent, [{
        type: Component,
        args: [{ selector: 'lib-admin-group-details-page', standalone: true, imports: [
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
                ], template: "<div class=\"gd-page\">\n  <div class=\"gd-back\">\n    <a routerLink=\"/administration/users-groups\" mat-button>\n      <mat-icon>arrow_back</mat-icon>\n      {{ 'admin.admin-group-details-page.back-to-users-amp-groups' | translate }}\n    </a>\n  </div>\n\n  @if (loading()) {\n    <div class=\"gd-center\">\n      <mat-spinner\n        diameter=\"36\"\n        [attr.aria-label]=\"'admin.admin-group-details-page.loading' | translate\"\n      />\n    </div>\n  } @else if (error()) {\n    <p class=\"gd-error\">{{ error() }}</p>\n  } @else if (group()) {\n    @if (group(); as g) {\n      <section class=\"gd-card mat-elevation-z1\">\n        <header class=\"gd-head\">\n          <div>\n            <div class=\"gd-title\" role=\"heading\" aria-level=\"1\">\n              {{ g.grouplabel || g.groupname }}\n            </div>\n            <p class=\"gd-sub\">{{ g.groupname }}</p>\n          </div>\n          <div class=\"gd-actions\">\n            <button type=\"button\" mat-button (click)=\"confirmDelete()\">\n              <mat-icon>delete_outline</mat-icon>\n              {{ 'admin.admin-group-details-page.delete' | translate }}\n            </button>\n            <button type=\"button\" mat-button (click)=\"openEdit()\">\n              <mat-icon>person_add</mat-icon>\n              {{ 'admin.admin-group-details-page.add-members' | translate }}\n            </button>\n            <button type=\"button\" mat-flat-button color=\"primary\" (click)=\"openEdit()\">\n              <mat-icon>edit</mat-icon>\n              {{ 'admin.admin-group-details-page.edit' | translate }}\n            </button>\n          </div>\n        </header>\n        <p class=\"gd-meta\">\n          {{\n            ((g.memberUsers ?? []).length === 1\n              ? 'common.count.member-one'\n              : 'common.count.member-many'\n            ) | translate: { count: (g.memberUsers ?? []).length }\n          }}\n          \u2022\n          {{\n            ((g.memberGroups ?? []).length === 1\n              ? 'common.count.nested-group-one'\n              : 'common.count.nested-group-many'\n            ) | translate: { count: (g.memberGroups ?? []).length }\n          }}\n        </p>\n      </section>\n\n      <section class=\"gd-card mat-elevation-z1\">\n        <header class=\"gd-section-head\">\n          <div class=\"gd-section-heading\" role=\"heading\" aria-level=\"2\">\n            {{ 'admin.admin-group-details-page.users' | translate }}\n          </div>\n        </header>\n        <table mat-table [dataSource]=\"g.memberUsers ?? []\" class=\"gd-table\">\n          <ng-container matColumnDef=\"username\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-group-details-page.name' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let member\">\n              <a class=\"gd-link\" [routerLink]=\"['/administration/users-groups/user', member]\">{{\n                member\n              }}</a>\n            </td>\n          </ng-container>\n          <ng-container matColumnDef=\"actions\">\n            <th mat-header-cell *matHeaderCellDef></th>\n            <td mat-cell *matCellDef=\"let member\">\n              <button\n                type=\"button\"\n                mat-icon-button\n                (click)=\"removeMember(member)\"\n                [attr.aria-label]=\"'admin.admin-group-details-page.remove-member' | translate\"\n                [matTooltip]=\"'admin.admin-group-details-page.remove-member' | translate\"\n              >\n                <mat-icon>close</mat-icon>\n              </button>\n            </td>\n          </ng-container>\n          <tr mat-header-row *matHeaderRowDef=\"userColumns\"></tr>\n          <tr mat-row *matRowDef=\"let row; columns: userColumns\"></tr>\n        </table>\n        @if ((g.memberUsers ?? []).length === 0) {\n          <p class=\"gd-empty\">\n            {{ 'admin.admin-group-details-page.no-users-in-this-group' | translate }}\n          </p>\n        }\n      </section>\n\n      <section class=\"gd-card mat-elevation-z1\">\n        <header class=\"gd-section-head\">\n          <div class=\"gd-section-heading\" role=\"heading\" aria-level=\"2\">\n            {{ 'admin.admin-group-details-page.nested-groups' | translate }}\n          </div>\n        </header>\n        <table mat-table [dataSource]=\"g.memberGroups ?? []\" class=\"gd-table\">\n          <ng-container matColumnDef=\"groupname\">\n            <th mat-header-cell *matHeaderCellDef>\n              {{ 'admin.admin-group-details-page.name' | translate }}\n            </th>\n            <td mat-cell *matCellDef=\"let nested\">\n              <a class=\"gd-link\" [routerLink]=\"['/administration/users-groups/group', nested]\">{{\n                nested\n              }}</a>\n            </td>\n          </ng-container>\n          <ng-container matColumnDef=\"actions\">\n            <th mat-header-cell *matHeaderCellDef></th>\n            <td mat-cell *matCellDef=\"let nested\">\n              <button\n                type=\"button\"\n                mat-icon-button\n                (click)=\"removeNestedGroup(nested)\"\n                [attr.aria-label]=\"'admin.admin-group-details-page.remove-nested-group' | translate\"\n                [matTooltip]=\"'admin.admin-group-details-page.remove-nested-group' | translate\"\n              >\n                <mat-icon>close</mat-icon>\n              </button>\n            </td>\n          </ng-container>\n          <tr mat-header-row *matHeaderRowDef=\"nestedColumns\"></tr>\n          <tr mat-row *matRowDef=\"let row; columns: nestedColumns\"></tr>\n        </table>\n        @if ((g.memberGroups ?? []).length === 0) {\n          <p class=\"gd-empty\">\n            {{ 'admin.admin-group-details-page.no-nested-groups' | translate }}\n          </p>\n        }\n      </section>\n\n      <section class=\"gd-card mat-elevation-z1\">\n        <header class=\"gd-section-head\">\n          <div class=\"gd-section-heading\" role=\"heading\" aria-level=\"2\">\n            {{ 'admin.admin-group-details-page.local-permissions' | translate }}\n          </div>\n        </header>\n        @if (localPermLoading()) {\n          <div class=\"gd-center\">\n            <mat-spinner\n              diameter=\"32\"\n              [attr.aria-label]=\"'admin.admin-group-details-page.loading' | translate\"\n            />\n          </div>\n        } @else if (localPerm()) {\n          @if (localPerm(); as lp) {\n            <table mat-table [dataSource]=\"lp.rows\" class=\"gd-table gd-perm-table\">\n              <ng-container matColumnDef=\"on\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-group-details-page.on' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">\n                  <div class=\"gd-on\">\n                    <a class=\"gd-link\" [routerLink]=\"['/doc', row.documentUid]\">{{\n                      row.documentTitle\n                    }}</a>\n                    <div class=\"gd-path\">{{ row.documentPath }}</div>\n                  </div>\n                </td>\n              </ng-container>\n              <ng-container matColumnDef=\"right\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-group-details-page.right' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ row.permission }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"timeFrame\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-group-details-page.time-frame' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ timeFrameLabel(row) }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"grantedBy\">\n                <th mat-header-cell *matHeaderCellDef>\n                  {{ 'admin.admin-group-details-page.granted-by' | translate }}\n                </th>\n                <td mat-cell *matCellDef=\"let row\">{{ row.grantedBy ?? '\u2014' }}</td>\n              </ng-container>\n              <ng-container matColumnDef=\"actions\">\n                <th mat-header-cell *matHeaderCellDef></th>\n                <td mat-cell *matCellDef=\"let row\">\n                  <button\n                    type=\"button\"\n                    mat-icon-button\n                    (click)=\"removePermission(row)\"\n                    [attr.aria-label]=\"\n                      'admin.admin-group-details-page.remove-permission' | translate\n                    \"\n                    [matTooltip]=\"'admin.admin-group-details-page.remove-permission' | translate\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </ng-container>\n              <tr mat-header-row *matHeaderRowDef=\"permColumns\"></tr>\n              <tr mat-row *matRowDef=\"let row; columns: permColumns\"></tr>\n            </table>\n            @if (lp.rows.length === 0) {\n              <p class=\"gd-empty\">\n                {{ 'admin.no-permissions-for' | translate: { name: g.grouplabel || g.groupname } }}\n              </p>\n            }\n            <mat-paginator\n              [length]=\"lp.totalDocuments\"\n              [pageSize]=\"permPageSize\"\n              [pageIndex]=\"localPageIndex()\"\n              [hidePageSize]=\"true\"\n              (page)=\"onLocalPermPage($event)\"\n            />\n          }\n        }\n      </section>\n    }\n  }\n</div>\n", styles: [".gd-page {\n  padding: var(--admin-space-4, 1.25rem) var(--admin-space-5, 1.5rem) 2rem;\n  max-width: 1200px;\n}\n\n.gd-back {\n  margin-bottom: var(--admin-space-2, 0.75rem);\n}\n\n.gd-card {\n  border-radius: var(--admin-radius-1, 8px);\n  padding: var(--admin-space-3, 1rem);\n  margin-bottom: var(--admin-space-3, 1rem);\n}\n\n.gd-head {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: var(--admin-space-2, 0.75rem);\n}\n\n.gd-title {\n  margin: 0;\n  font-size: 1.15rem;\n  font-weight: 600;\n}\n\n.gd-sub {\n  margin: 0.2rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));\n}\n\n.gd-actions {\n  display: flex;\n  gap: 0.4rem;\n  flex-wrap: wrap;\n}\n\n.gd-meta {\n  margin: 0.75rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.65));\n}\n\n.gd-section-head .gd-section-heading {\n  margin: 0 0 var(--admin-space-2, 0.75rem);\n  font-size: 1rem;\n  font-weight: 600;\n}\n\n.gd-table {\n  width: 100%;\n}\n\n.gd-table th.mat-mdc-header-cell,\n.gd-table td.mat-mdc-cell {\n  padding-top: var(--admin-row-padding-y, 0.68rem);\n  padding-bottom: var(--admin-row-padding-y, 0.68rem);\n}\n\n.gd-empty {\n  margin: 0.5rem 0 0;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n}\n\n.gd-center {\n  display: flex;\n  justify-content: center;\n  padding: 1.25rem;\n}\n\n.gd-error {\n  color: var(--mat-sys-error, #b00020);\n}\n\n.gd-on .gd-path {\n  font-size: 0.8rem;\n  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.55));\n  margin-top: 0.15rem;\n  word-break: break-all;\n}\n\n.gd-perm-table {\n  margin-bottom: 0.25rem;\n}\n\n.gd-link {\n  color: var(--mat-sys-primary, #1565c0);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n}\n\n.gd-link:hover {\n  text-decoration: underline;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminGroupDetailsPageComponent, { className: "AdminGroupDetailsPageComponent", filePath: "libs/features/administration/src/lib/admin-group-details-page/admin-group-details-page.component.ts", lineNumber: 49 }); })();
