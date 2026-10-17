import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef, } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of, forkJoin } from 'rxjs';
import { CURRENT_USERNAME, UserService, DocumentDetailService, } from '@nuxeo/satori-platform/nuxeo-client';
import { ShareSavedSearchAddPermissionDialogComponent, } from '../share-saved-search-add-permission-dialog/share-saved-search-add-permission-dialog.component';
import { ShareSavedSearchExternalDialogComponent } from '../share-saved-search-external-dialog/share-saved-search-external-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsSpinnerComponent } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
const _forTrack0 = ($index, $item) => $item.id;
function ShareSavedSearchDialogComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "nxs-spinner", 6);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "shared-ui.share-saved-search-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "shared-ui.share-saved-search-dialog.loading-permissions"));
} }
function ShareSavedSearchDialogComponent_Conditional_10_For_31_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td", 18)(10, "button", 19);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_For_31_Template_button_click_10_listener() { const row_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editRow(row_r4.id)); });
    i0.ɵɵelementStart(12, "mat-icon");
    i0.ɵɵtext(13, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "button", 20);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_For_31_Template_button_click_14_listener() { const row_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.removeRow(row_r4.id)); });
    i0.ɵɵelementStart(16, "mat-icon");
    i0.ɵɵtext(17, "delete_outline");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const row_r4 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r4.userGroup);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r4.right);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r4.timeFrame);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r4.grantedBy || "-");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(11, 6, "shared-ui.share-saved-search-dialog.edit-permission"));
    i0.ɵɵadvance(4);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(15, 8, "shared-ui.share-saved-search-dialog.remove-permission"));
} }
function ShareSavedSearchDialogComponent_Conditional_10_ForEmpty_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 21);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "shared-ui.share-saved-search-dialog.no-permissions-defined-click-add-to"), " ");
} }
function ShareSavedSearchDialogComponent_Conditional_10_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 15);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "shared-ui.share-saved-search-dialog.if-you-want-to-explicitly-control"), " ");
} }
function ShareSavedSearchDialogComponent_Conditional_10_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "shared-ui.share-saved-search-dialog.only-local-permissions-are-applied-unblock"), " ");
} }
function ShareSavedSearchDialogComponent_Conditional_10_Conditional_44_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r5.userGroup);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r5.right);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r5.timeFrame);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r5.grantedBy || "-");
} }
function ShareSavedSearchDialogComponent_Conditional_10_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11)(1, "table", 17)(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "th");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "tbody");
    i0.ɵɵrepeaterCreate(17, ShareSavedSearchDialogComponent_Conditional_10_Conditional_44_For_18_Template, 9, 4, "tr", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "shared-ui.share-saved-search-dialog.user-group"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "shared-ui.share-saved-search-dialog.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "shared-ui.share-saved-search-dialog.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 10, "shared-ui.share-saved-search-dialog.granted-by"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.inheritedPermissions());
} }
function ShareSavedSearchDialogComponent_Conditional_10_For_77_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td", 18)(10, "button", 22);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_For_77_Template_button_click_10_listener() { const row_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editExternalPermission(row_r7)); });
    i0.ɵɵelementStart(12, "mat-icon");
    i0.ɵɵtext(13, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "button", 22);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_For_77_Template_button_click_14_listener() { const row_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.sendExternalNotification(row_r7)); });
    i0.ɵɵelementStart(16, "mat-icon");
    i0.ɵɵtext(17, "send");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "button", 23);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_For_77_Template_button_click_18_listener() { const row_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.removeExternalPermission(row_r7)); });
    i0.ɵɵelementStart(20, "mat-icon");
    i0.ɵɵtext(21, "delete_outline");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const row_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r7.userGroup);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r7.right);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r7.timeFrame);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r7.grantedBy || "-");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(11, 10, "shared-ui.share-saved-search-dialog.edit-external-permission"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(15, 12, "shared-ui.share-saved-search-dialog.send-notification"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 14, "shared-ui.share-saved-search-dialog.remove-external-permission"));
} }
function ShareSavedSearchDialogComponent_Conditional_10_ForEmpty_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 21);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "shared-ui.share-saved-search-dialog.the-saved-search-is-not-shared"), " ");
} }
function ShareSavedSearchDialogComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 7)(1, "div", 8)(2, "h3", 9);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 10);
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openAddPermissionDialog()); });
    i0.ɵɵelementStart(6, "mat-icon");
    i0.ɵɵtext(7, "add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div", 11)(11, "table", 12)(12, "thead")(13, "tr")(14, "th");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "th");
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "th");
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "th");
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "th");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(29, "tbody");
    i0.ɵɵrepeaterCreate(30, ShareSavedSearchDialogComponent_Conditional_10_For_31_Template, 18, 10, "tr", null, _forTrack0, false, ShareSavedSearchDialogComponent_Conditional_10_ForEmpty_32_Template, 4, 3, "tr");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(33, "section", 13)(34, "div", 8)(35, "h3", 9);
    i0.ɵɵtext(36);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "button", 14);
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_Template_button_click_38_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.togglePermissionInheritance()); });
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(42, ShareSavedSearchDialogComponent_Conditional_10_Conditional_42_Template, 3, 3, "p", 15)(43, ShareSavedSearchDialogComponent_Conditional_10_Conditional_43_Template, 3, 3, "p", 16);
    i0.ɵɵconditionalCreate(44, ShareSavedSearchDialogComponent_Conditional_10_Conditional_44_Template, 19, 12, "div", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "section", 13)(46, "div", 8)(47, "h3", 9);
    i0.ɵɵtext(48);
    i0.ɵɵpipe(49, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(50, "button", 14);
    i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Conditional_10_Template_button_click_50_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openExternalPermissionDialog()); });
    i0.ɵɵtext(51);
    i0.ɵɵpipe(52, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(53, "p", 15);
    i0.ɵɵtext(54);
    i0.ɵɵpipe(55, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(56, "div", 11)(57, "table", 17)(58, "thead")(59, "tr")(60, "th");
    i0.ɵɵtext(61);
    i0.ɵɵpipe(62, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "th");
    i0.ɵɵtext(64);
    i0.ɵɵpipe(65, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(66, "th");
    i0.ɵɵtext(67);
    i0.ɵɵpipe(68, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(69, "th");
    i0.ɵɵtext(70);
    i0.ɵɵpipe(71, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(72, "th");
    i0.ɵɵtext(73);
    i0.ɵɵpipe(74, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(75, "tbody");
    i0.ɵɵrepeaterCreate(76, ShareSavedSearchDialogComponent_Conditional_10_For_77_Template, 22, 16, "tr", null, _forTrack0, false, ShareSavedSearchDialogComponent_Conditional_10_ForEmpty_78_Template, 4, 3, "tr");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 24, "shared-ui.share-saved-search-dialog.permissions-defined-locally"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 26, "shared-ui.share-saved-search-dialog.new"), " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 28, "shared-ui.share-saved-search-dialog.user-group"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 30, "shared-ui.share-saved-search-dialog.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 32, "shared-ui.share-saved-search-dialog.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(25, 34, "shared-ui.share-saved-search-dialog.granted-by"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 36, "shared-ui.share-saved-search-dialog.actions"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.permissions());
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(37, 38, "shared-ui.share-saved-search-dialog.permissions-inherited-from-upper-levels"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.isInheritanceBlocked() ? i0.ɵɵpipeBind1(40, 40, "ui.unblock") : i0.ɵɵpipeBind1(41, 42, "ui.block"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r1.isInheritanceBlocked() ? 42 : 43);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.isInheritanceBlocked() ? 44 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(49, 44, "shared-ui.share-saved-search-dialog.permissions-assigned-to-external-users"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(52, 46, "shared-ui.share-saved-search-dialog.new"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(55, 48, "shared-ui.share-saved-search-dialog.sharing-with-external-users-does-not"), " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(62, 50, "shared-ui.share-saved-search-dialog.user-group"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(65, 52, "shared-ui.share-saved-search-dialog.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(68, 54, "shared-ui.share-saved-search-dialog.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(71, 56, "shared-ui.share-saved-search-dialog.granted-by"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(74, 58, "shared-ui.share-saved-search-dialog.actions"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.externalPermissions());
} }
export class ShareSavedSearchDialogComponent {
    translate = inject(TranslateService);
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    dialog = inject(MatDialog);
    currentUsername = inject(CURRENT_USERNAME);
    userService = inject(UserService);
    detailService = inject(DocumentDetailService);
    permissions = signal([], ...(ngDevMode ? [{ debugName: "permissions" }] : []));
    inheritedPermissions = signal([], ...(ngDevMode ? [{ debugName: "inheritedPermissions" }] : []));
    externalPermissions = signal([], ...(ngDevMode ? [{ debugName: "externalPermissions" }] : []));
    isInheritanceBlocked = signal(false, ...(ngDevMode ? [{ debugName: "isInheritanceBlocked" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    nextId = 1;
    ngOnInit() {
        if (this.data.id) {
            this.loadPermissionsFromApi();
        }
        else {
            this.loadPermissionsFromCurrentUser();
        }
    }
    loadPermissionsFromApi() {
        this.loading.set(true);
        this.detailService
            .getDocumentPermissions(this.data.id)
            .pipe(catchError(() => of(null)))
            .subscribe((doc) => {
            this.loading.set(false);
            if (!doc) {
                this.loadPermissionsFromCurrentUser();
                return;
            }
            this.parsePermissionsFromDocument(doc);
        });
    }
    parsePermissionsFromDocument(doc) {
        const allAcls = (doc.contextParameters?.acls ?? []);
        // Find local ACL (usually first or named 'local')
        const localAcl = allAcls.find((acl) => acl.name === 'local') || allAcls[0];
        const localAces = localAcl?.aces ?? [];
        const localRows = localAces
            .filter((ace) => !ace.externalUser)
            .map((ace, index) => ({
            id: String(index),
            userGroup: ace.username || ace.email || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: this.toTimeFrameLabel(ace.begin, ace.end),
            grantedBy: ace.creator || 'System',
        }));
        const externalRows = localAces
            .filter((ace) => !!ace.externalUser)
            .map((ace, index) => ({
            id: ace.id || `external-${index}`,
            email: ace.email || ace.username || '',
            userGroup: ace.email || ace.username || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: this.toTimeFrameLabel(ace.begin, ace.end),
            grantedBy: ace.creator || 'System',
            begin: ace.begin,
            end: ace.end,
        }));
        // Find inherited ACLs
        const inheritedAcls = allAcls.filter((acl) => acl.name !== 'local');
        this.isInheritanceBlocked.set(!allAcls.some((acl) => acl.name === 'inherited'));
        const inheritedRows = inheritedAcls
            .flatMap((acl) => acl.aces ?? [])
            .map((ace) => ({
            userGroup: ace.username || ace.email || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: 'Inherited',
            grantedBy: ace.creator || 'Parent',
        }));
        this.permissions.set(localRows);
        this.externalPermissions.set(externalRows);
        this.inheritedPermissions.set(inheritedRows);
        this.nextId = localRows.length + 1;
    }
    openExternalPermissionDialog() {
        if (!this.data.id || this.saving())
            return;
        this.dialog
            .open(ShareSavedSearchExternalDialogComponent, {
            width: '720px',
            data: { savedSearchId: this.data.id },
        })
            .afterClosed()
            .subscribe((created) => {
            if (!created)
                return;
            this.loadPermissionsFromApi();
        });
    }
    editExternalPermission(row) {
        if (!this.data.id || this.saving())
            return;
        this.dialog
            .open(ShareSavedSearchExternalDialogComponent, {
            width: '720px',
            data: {
                savedSearchId: this.data.id,
                initialData: {
                    id: row.id,
                    email: row.email,
                    right: row.right,
                    begin: row.begin,
                    end: row.end,
                },
            },
        })
            .afterClosed()
            .subscribe((updated) => {
            if (!updated)
                return;
            this.loadPermissionsFromApi();
        });
    }
    sendExternalNotification(row) {
        if (!this.data.id || this.saving() || !row.id)
            return;
        this.saving.set(true);
        this.detailService
            .sendNotificationEmailForPermission(this.data.id, row.id)
            .pipe(catchError((error) => {
            console.error('Error sending permission notification:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe(() => {
            this.saving.set(false);
        });
    }
    removeExternalPermission(row) {
        if (!this.data.id || this.saving())
            return;
        this.saving.set(true);
        this.detailService
            .removePermission(this.data.id, {
            user: row.email || row.userGroup,
            permission: this.normalizePermissionForApi({ right: row.right }).right,
            acl: 'local',
        })
            .pipe(catchError((error) => {
            console.error('Error removing external permission:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.loadPermissionsFromApi();
        });
    }
    togglePermissionInheritance() {
        if (!this.data.id || this.saving())
            return;
        this.saving.set(true);
        const op = this.isInheritanceBlocked()
            ? this.detailService.unblockPermissionInheritance(this.data.id)
            : this.detailService.blockPermissionInheritance(this.data.id);
        op.pipe(catchError((error) => {
            console.error('Error updating permission inheritance:', error);
            this.saving.set(false);
            return of(null);
        })).subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.loadPermissionsFromApi();
        });
    }
    loadPermissionsFromCurrentUser() {
        const username = this.currentUsername()?.trim();
        if (!username) {
            this.permissions.set([]);
            this.inheritedPermissions.set([]);
            return;
        }
        this.userService
            .getUser(username)
            .pipe(catchError(() => of(null)))
            .subscribe((user) => {
            if (!user) {
                this.permissions.set([]);
                this.inheritedPermissions.set([]);
                return;
            }
            this.applyUserPermissions(user);
        });
    }
    applyUserPermissions(user) {
        const localRows = [
            {
                id: String(this.nextId++),
                userGroup: this.toDisplayName(user),
                right: user.isAdministrator ? 'Manage everything' : 'Read',
                timeFrame: 'Permanent',
                grantedBy: 'System',
            },
        ];
        const groups = user.properties.groups ?? [];
        groups.forEach((group) => {
            localRows.push({
                id: String(this.nextId++),
                userGroup: group,
                right: 'Read',
                timeFrame: 'Permanent',
                grantedBy: 'Group',
            });
        });
        this.permissions.set(localRows);
        this.inheritedPermissions.set(groups.map((group) => ({
            userGroup: group,
            right: 'Inherited',
            timeFrame: 'Permanent',
            grantedBy: 'Parent',
        })));
    }
    toDisplayName(user) {
        const firstName = user.properties.firstName?.trim() ?? '';
        const lastName = user.properties.lastName?.trim() ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName)
            return fullName;
        return user.properties.username || user.id;
    }
    openAddPermissionDialog() {
        this.dialog
            .open(ShareSavedSearchAddPermissionDialogComponent, {
            width: '720px',
            data: { title: this.translate.instant('confirm.add-a-permission') },
        })
            .afterClosed()
            .subscribe((result) => {
            if (!result || result.length === 0 || !this.data.id)
                return;
            this.saving.set(true);
            // Call addPermission API for each new permission
            const requests = result.map((entry) => {
                const { right } = this.normalizePermissionForApi({
                    right: entry.right,
                });
                const [begin, end] = this.parseTimeFrame(entry.timeFrame);
                return this.detailService.addPermission(this.data.id, {
                    username: entry.userGroup,
                    permission: right,
                    begin: begin || null,
                    end: end || null,
                    notify: false,
                    comment: '',
                });
            });
            forkJoin(requests)
                .pipe(catchError((error) => {
                console.error('Error adding permissions:', error);
                this.saving.set(false);
                return of(null);
            }))
                .subscribe(() => {
                this.saving.set(false);
                // Refresh permissions from API after adding
                this.loadPermissionsFromApi();
            });
        });
    }
    removeRow(id) {
        const row = this.permissions().find((r) => r.id === id);
        if (!row || !this.data.id)
            return;
        // Remove from local state first
        this.permissions.update((rows) => rows.filter((r) => r.id !== id));
        // Call API to delete the permission
        const username = row.userGroup;
        const permission = this.normalizePermissionForApi({
            right: row.right,
        }).right;
        this.detailService
            .removePermission(this.data.id, {
            user: username,
            permission: permission,
            acl: 'local',
        })
            .pipe(catchError((error) => {
            console.error('Error removing permission:', error);
            // Revert the removal on error
            this.permissions.update((rows) => [...rows, row]);
            return of(null);
        }))
            .subscribe();
    }
    editRow(id) {
        const row = this.permissions().find((r) => r.id === id);
        if (!row)
            return;
        this.dialog
            .open(ShareSavedSearchAddPermissionDialogComponent, {
            width: '720px',
            data: {
                title: this.translate.instant('confirm.update'),
                initialData: row,
            },
        })
            .afterClosed()
            .subscribe((result) => {
            if (!result || result.length === 0)
                return;
            const updatedEntry = result[0];
            this.permissions.update((rows) => rows.map((r) => r.id === id
                ? {
                    ...r,
                    userGroup: updatedEntry.userGroup,
                    right: updatedEntry.right,
                    timeFrame: updatedEntry.timeFrame,
                    grantedBy: updatedEntry.grantedBy,
                }
                : r));
        });
    }
    save() {
        if (this.saving() || !this.data.id)
            return;
        this.saving.set(true);
        const permissions = this.permissions();
        if (permissions.length === 0) {
            this.saving.set(false);
            this.dialogRef.close(permissions);
            return;
        }
        // Create API calls for each permission
        const requests = permissions.map((perm) => {
            const { right, timeFrame } = this.normalizePermissionForApi(perm);
            const [begin, end] = this.parseTimeFrame(timeFrame);
            return this.detailService.replacePermission(this.data.id, {
                username: perm.userGroup,
                email: null,
                permission: right,
                begin: begin || null,
                end: end || null,
                notify: false,
                comment: null,
            });
        });
        forkJoin(requests)
            .pipe(catchError((error) => {
            console.error('Error saving permissions:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe(() => {
            this.saving.set(false);
            // Refresh permissions from API after save
            this.loadPermissionsFromApi();
        });
    }
    normalizePermissionForApi(perm) {
        // Normalize right values to API format
        const rightMap = {
            Read: 'Read',
            Write: 'ReadWrite',
            Edit: 'ReadWrite',
            Manage: 'Everything',
            'Manage everything': 'Everything',
            'Can collect': 'ReadCanCollect',
        };
        return {
            right: rightMap[perm.right] || perm.right,
            timeFrame: perm.timeFrame,
        };
    }
    parseTimeFrame(timeFrame) {
        if (timeFrame === 'Permanent') {
            return [null, null];
        }
        // "Until <end>" — only end date set
        if (timeFrame.startsWith('Until ')) {
            return [null, timeFrame.slice(6).trim()];
        }
        // "From <begin>" — only begin date set
        if (timeFrame.startsWith('From ')) {
            return [timeFrame.slice(5).trim(), null];
        }
        const parts = timeFrame.split(' - ');
        if (parts.length === 2) {
            return [parts[0].trim(), parts[1].trim()];
        }
        return [null, null];
    }
    toTimeFrameLabel(begin, end) {
        if (!begin && !end)
            return this.translate.instant('permissions.time-frame.permanent');
        if (!begin && end)
            return this.translate.instant('permissions.time-frame.until', { end });
        if (begin && !end)
            return this.translate.instant('permissions.time-frame.from', { begin });
        return this.translate.instant('permissions.time-frame.range', { begin, end });
    }
    static ɵfac = function ShareSavedSearchDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ShareSavedSearchDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ShareSavedSearchDialogComponent, selectors: [["lib-share-saved-search-dialog"]], decls: 15, vars: 11, consts: [[1, "dialog-header"], ["mat-dialog-title", ""], ["mat-icon-button", "", "type", "button", 1, "close-btn", 3, "click"], [1, "loading-container"], ["align", "start"], ["mat-stroked-button", "", "type", "button", 3, "click", "disabled"], ["diameter", "40", 3, "label"], [1, "permissions-section"], [1, "table-header-row"], [1, "table-title"], ["mat-stroked-button", "", "type", "button", 1, "add-btn", 3, "click", "disabled"], [1, "table-wrap"], [1, "permissions-table"], [1, "permissions-section", "muted-section"], ["mat-button", "", "type", "button", 1, "link-action-btn", 3, "click", "disabled"], [1, "section-note"], [1, "empty-row"], [1, "permissions-table", "readonly-table"], [1, "actions-cell"], ["mat-icon-button", "", "type", "button", 1, "edit-btn", 3, "click"], ["mat-icon-button", "", "type", "button", 1, "delete-btn", 3, "click"], ["colspan", "5", 1, "empty-row"], ["mat-icon-button", "", "type", "button", 3, "click", "disabled"], ["mat-icon-button", "", "type", "button", 1, "delete-btn", 3, "click", "disabled"]], template: function ShareSavedSearchDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "h2", 1);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "button", 2);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Template_button_click_4_listener() { return ctx.dialogRef.close(null); });
            i0.ɵɵelementStart(6, "mat-icon");
            i0.ɵɵtext(7, "close");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(8, "mat-dialog-content");
            i0.ɵɵconditionalCreate(9, ShareSavedSearchDialogComponent_Conditional_9_Template, 6, 6, "div", 3)(10, ShareSavedSearchDialogComponent_Conditional_10_Template, 79, 60);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "mat-dialog-actions", 4)(12, "button", 5);
            i0.ɵɵlistener("click", function ShareSavedSearchDialogComponent_Template_button_click_12_listener() { return ctx.dialogRef.close(null); });
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 5, "shared-ui.share-saved-search-dialog.share-saved-search"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 7, "shared-ui.share-saved-search-dialog.close-dialog"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.loading() ? 9 : 10);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.saving());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 9, "shared-ui.share-saved-search-dialog.close"), " ");
        } }, dependencies: [NxsSpinnerComponent,
            MatDialogModule, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, i2.MatIconButton, MatIconModule, i3.MatIcon, MatSelectModule,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  width: min(95vw, 1080px);\n  max-width: 95vw;\n  max-height: 90vh;\n}\n\n.dialog-header[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.dialog-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-right: 40px;\n}\n\n.close-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  color: #667085;\n}\n\nmat-dialog-content[_ngcontent-%COMP%] {\n  padding: 16px 24px 0 !important;\n  overflow: auto;\n  max-height: min(72vh, 780px);\n}\n\n.loading-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  text-align: center;\n}\n\n.loading-container[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  color: #667085;\n  font-size: 14px;\n}\n\n.permissions-section[_ngcontent-%COMP%] {\n  border: 1px solid #eaecf0;\n  border-radius: 10px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\n\n.muted-section[_ngcontent-%COMP%] {\n  background: #fcfcfd;\n}\n\n.table-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n\n.table-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: #101828;\n  flex: 1;\n  min-width: 0;\n}\n\n.section-note[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  padding: 10px 12px;\n  border-left: 4px solid #f97066;\n  color: #667085;\n  background: #fff;\n  line-height: 1.4;\n  font-size: 13px;\n}\n\n.table-wrap[_ngcontent-%COMP%] {\n  overflow-x: hidden;\n  border-radius: 8px;\n}\n\n.permissions-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n  table-layout: fixed;\n}\n\n.permissions-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  text-align: left;\n  padding: 10px 8px;\n  font-weight: 600;\n  color: #344054;\n  border-bottom: 2px solid #e4e7ec;\n  white-space: normal;\n  word-break: break-word;\n}\n\n.permissions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 8px;\n  border-bottom: 1px solid #f2f4f7;\n  vertical-align: middle;\n  color: #475467;\n  word-break: break-word;\n  overflow-wrap: break-word;\n}\n\n.permissions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:first-child {\n  width: 25%;\n}\n\n.permissions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(2) {\n  width: 20%;\n}\n\n.permissions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(3) {\n  width: 25%;\n}\n\n.permissions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(4) {\n  width: 20%;\n}\n\n.actions-cell[_ngcontent-%COMP%] {\n  width: 10%;\n  text-align: center;\n  padding: 8px 4px;\n  display: flex;\n  justify-content: center;\n  gap: 2px;\n  flex-shrink: 0;\n}\n\n.edit-btn[_ngcontent-%COMP%] {\n  color: #175cd3;\n  min-width: 32px;\n}\n\n.delete-btn[_ngcontent-%COMP%] {\n  color: #f04438;\n  min-width: 32px;\n}\n\n.empty-row[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #667085;\n  padding: 24px 8px !important;\n  font-style: italic;\n}\n\n.add-btn[_ngcontent-%COMP%] {\n  font-size: 13px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n\n.link-action-btn[_ngcontent-%COMP%] {\n  color: #175cd3;\n  font-weight: 600;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n\n.readonly-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 10px 8px;\n}\n\nmat-dialog-actions[_ngcontent-%COMP%] {\n  padding: 16px 24px 20px;\n}\n\n.spinner[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n  margin-right: 4px;\n  vertical-align: middle;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ShareSavedSearchDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-share-saved-search-dialog', standalone: true, imports: [
                    NxsSpinnerComponent,
                    TranslatePipe,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatSelectModule,
                ], template: "<div class=\"dialog-header\">\n  <h2 mat-dialog-title>\n    {{ 'shared-ui.share-saved-search-dialog.share-saved-search' | translate }}\n  </h2>\n  <button\n    mat-icon-button\n    class=\"close-btn\"\n    type=\"button\"\n    [attr.aria-label]=\"'shared-ui.share-saved-search-dialog.close-dialog' | translate\"\n    (click)=\"dialogRef.close(null)\"\n  >\n    <mat-icon>close</mat-icon>\n  </button>\n</div>\n\n<mat-dialog-content>\n  @if (loading()) {\n    <div class=\"loading-container\">\n      <nxs-spinner\n        diameter=\"40\"\n        [label]=\"'shared-ui.share-saved-search-dialog.loading' | translate\"\n      />\n      <p>{{ 'shared-ui.share-saved-search-dialog.loading-permissions' | translate }}</p>\n    </div>\n  } @else {\n    <section class=\"permissions-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{ 'shared-ui.share-saved-search-dialog.permissions-defined-locally' | translate }}\n        </h3>\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"add-btn\"\n          (click)=\"openAddPermissionDialog()\"\n          [disabled]=\"saving()\"\n        >\n          <mat-icon>add</mat-icon> {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of permissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"edit-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-permission' | translate\n                    \"\n                    (click)=\"editRow(row.id)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-permission' | translate\n                    \"\n                    (click)=\"removeRow(row.id)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.no-permissions-defined-click-add-to'\n                      | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-inherited-from-upper-levels'\n              | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"togglePermissionInheritance()\"\n        >\n          {{ isInheritanceBlocked() ? ('ui.unblock' | translate) : ('ui.block' | translate) }}\n        </button>\n      </div>\n      @if (!isInheritanceBlocked()) {\n        <p class=\"section-note\">\n          {{ 'shared-ui.share-saved-search-dialog.if-you-want-to-explicitly-control' | translate }}\n        </p>\n      } @else {\n        <p class=\"empty-row\">\n          {{\n            'shared-ui.share-saved-search-dialog.only-local-permissions-are-applied-unblock'\n              | translate\n          }}\n        </p>\n      }\n\n      @if (!isInheritanceBlocked()) {\n        <div class=\"table-wrap\">\n          <table class=\"permissions-table readonly-table\">\n            <thead>\n              <tr>\n                <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @for (row of inheritedPermissions(); track $index) {\n                <tr>\n                  <td>{{ row.userGroup }}</td>\n                  <td>{{ row.right }}</td>\n                  <td>{{ row.timeFrame }}</td>\n                  <td>{{ row.grantedBy || '-' }}</td>\n                </tr>\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-assigned-to-external-users' | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"openExternalPermissionDialog()\"\n        >\n          {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n      <p class=\"section-note\">\n        {{ 'shared-ui.share-saved-search-dialog.sharing-with-external-users-does-not' | translate }}\n      </p>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table readonly-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of externalPermissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"editExternalPermission(row)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.send-notification' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"sendExternalNotification(row)\"\n                  >\n                    <mat-icon>send</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"removeExternalPermission(row)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.the-saved-search-is-not-shared' | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"start\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close(null)\" [disabled]=\"saving()\">\n    {{ 'shared-ui.share-saved-search-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host {\n  display: block;\n  width: min(95vw, 1080px);\n  max-width: 95vw;\n  max-height: 90vh;\n}\n\n.dialog-header {\n  position: relative;\n}\n\n.dialog-header h2 {\n  margin: 0;\n  padding-right: 40px;\n}\n\n.close-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  color: #667085;\n}\n\nmat-dialog-content {\n  padding: 16px 24px 0 !important;\n  overflow: auto;\n  max-height: min(72vh, 780px);\n}\n\n.loading-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  text-align: center;\n}\n\n.loading-container p {\n  margin-top: 16px;\n  color: #667085;\n  font-size: 14px;\n}\n\n.permissions-section {\n  border: 1px solid #eaecf0;\n  border-radius: 10px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\n\n.muted-section {\n  background: #fcfcfd;\n}\n\n.table-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n\n.table-title {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: #101828;\n  flex: 1;\n  min-width: 0;\n}\n\n.section-note {\n  margin: 0 0 12px;\n  padding: 10px 12px;\n  border-left: 4px solid #f97066;\n  color: #667085;\n  background: #fff;\n  line-height: 1.4;\n  font-size: 13px;\n}\n\n.table-wrap {\n  overflow-x: hidden;\n  border-radius: 8px;\n}\n\n.permissions-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n  table-layout: fixed;\n}\n\n.permissions-table th {\n  text-align: left;\n  padding: 10px 8px;\n  font-weight: 600;\n  color: #344054;\n  border-bottom: 2px solid #e4e7ec;\n  white-space: normal;\n  word-break: break-word;\n}\n\n.permissions-table td {\n  padding: 8px;\n  border-bottom: 1px solid #f2f4f7;\n  vertical-align: middle;\n  color: #475467;\n  word-break: break-word;\n  overflow-wrap: break-word;\n}\n\n.permissions-table td:first-child {\n  width: 25%;\n}\n\n.permissions-table td:nth-child(2) {\n  width: 20%;\n}\n\n.permissions-table td:nth-child(3) {\n  width: 25%;\n}\n\n.permissions-table td:nth-child(4) {\n  width: 20%;\n}\n\n.actions-cell {\n  width: 10%;\n  text-align: center;\n  padding: 8px 4px;\n  display: flex;\n  justify-content: center;\n  gap: 2px;\n  flex-shrink: 0;\n}\n\n.edit-btn {\n  color: #175cd3;\n  min-width: 32px;\n}\n\n.delete-btn {\n  color: #f04438;\n  min-width: 32px;\n}\n\n.empty-row {\n  text-align: center;\n  color: #667085;\n  padding: 24px 8px !important;\n  font-style: italic;\n}\n\n.add-btn {\n  font-size: 13px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n\n.link-action-btn {\n  color: #175cd3;\n  font-weight: 600;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n\n.readonly-table td {\n  padding: 10px 8px;\n}\n\nmat-dialog-actions {\n  padding: 16px 24px 20px;\n}\n\n.spinner {\n  animation: spin 1s linear infinite;\n  margin-right: 4px;\n  vertical-align: middle;\n}\n\n@keyframes spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ShareSavedSearchDialogComponent, { className: "ShareSavedSearchDialogComponent", filePath: "libs/shared/ui/src/lib/share-saved-search-dialog/share-saved-search-dialog.component.ts", lineNumber: 79 }); })();
