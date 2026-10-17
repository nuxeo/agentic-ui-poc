import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, LOCALE_ID, afterNextRender, computed, inject, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PrincipalPermissionsService, SettingsService, UserService, principalPermissionToLocalRow, } from '@nuxeo/satori-platform/nuxeo-client';
import { AuthService } from '../../auth/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { GroupPermLazyLoadDirective } from './group-perm-lazy-load.directive';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
const _c0 = ["changePasswordButton"];
const _c1 = (a0, a1, a2) => ({ rows: a0, emptyMessage: a1, tableLabel: a2 });
const _c2 = a0 => ({ group: a0 });
const _c3 = (a0, a1, a2) => ({ totalPages: a0, currentPage: a1, groupId: a2 });
const _forTrack0 = ($index, $item) => $item.identifier;
const _forTrack1 = ($index, $item) => $item.documentTitle + $item.documentPath + $item.right + $item.timeFrame + $item.grantedBy;
function ProfilePageComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.profile-page.loading-profile-details"), " ");
} }
function ProfilePageComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 11)(1, "div", 17)(2, "dt");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "dd");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 17)(8, "dt");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "dd");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 4, "app.profile-page.email"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.email());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 6, "app.profile-page.company"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.company());
} }
function ProfilePageComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "app.profile-page.loading-groups"));
} }
function ProfilePageComponent_Conditional_23_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 19);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "app.profile-page.no-groups-found"), " ");
} }
function ProfilePageComponent_Conditional_23_Conditional_12_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "a", 20)(3, "mat-icon", 8);
    i0.ɵɵtext(4, "groups");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const g_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("href", ctx_r1.groupLink(g_r3.identifier), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(g_r3.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(g_r3.identifier);
} }
function ProfilePageComponent_Conditional_23_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ProfilePageComponent_Conditional_23_Conditional_12_For_1_Template, 9, 3, "tr", null, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r1.groups());
} }
function ProfilePageComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "table", 18)(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "tbody");
    i0.ɵɵconditionalCreate(11, ProfilePageComponent_Conditional_23_Conditional_11_Template, 4, 3, "tr")(12, ProfilePageComponent_Conditional_23_Conditional_12_Template, 2, 0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 3, "app.profile-page.name"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 5, "app.profile-page.identifier"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.groups().length === 0 ? 11 : 12);
} }
function ProfilePageComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "app.profile-page.loading-local-permissions"), " ");
} }
function ProfilePageComponent_Conditional_29_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function ProfilePageComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, ProfilePageComponent_Conditional_29_ng_container_0_Template, 1, 0, "ng-container", 21);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    const permissionTableBody_r4 = i0.ɵɵreference(33);
    i0.ɵɵproperty("ngTemplateOutlet", permissionTableBody_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction3(6, _c1, ctx_r1.localPermissions(), i0.ɵɵpipeBind1(1, 2, "settings.profile.no-local-permissions"), i0.ɵɵpipeBind1(2, 4, "settings.profile.local-permissions")));
} }
function ProfilePageComponent_For_31_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, "settings.profile.loading-group-permissions", i0.ɵɵpureFunction1(4, _c2, g_r6.label)), " ");
} }
function ProfilePageComponent_For_31_Conditional_5_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function ProfilePageComponent_For_31_Conditional_5_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function ProfilePageComponent_For_31_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, ProfilePageComponent_For_31_Conditional_5_ng_container_0_Template, 1, 0, "ng-container", 21)(1, ProfilePageComponent_For_31_Conditional_5_ng_container_1_Template, 1, 0, "ng-container", 21);
} if (rf & 2) {
    const g_r6 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    const permissionTableBody_r4 = i0.ɵɵreference(33);
    const permissionPagination_r7 = i0.ɵɵreference(35);
    i0.ɵɵproperty("ngTemplateOutlet", permissionTableBody_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction3(4, _c1, ctx_r1.groupPermRows(g_r6.identifier), g_r6.label + " does not have permissions.", g_r6.label + " permissions"));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", permissionPagination_r7)("ngTemplateOutletContext", i0.ɵɵpureFunction3(8, _c3, ctx_r1.groupPermTotalPages(g_r6.identifier), ctx_r1.groupPermCurrentPage(g_r6.identifier), g_r6.identifier));
} }
function ProfilePageComponent_For_31_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 22);
    i0.ɵɵlistener("visible", function ProfilePageComponent_For_31_Template_article_visible_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onGroupPermSectionVisible($event)); });
    i0.ɵɵelementStart(1, "div", 13);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ProfilePageComponent_For_31_Conditional_4_Template, 3, 6, "p", 14)(5, ProfilePageComponent_For_31_Conditional_5_Template, 2, 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const g_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("libGroupPermLazyLoad", g_r6.identifier);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(3, 3, "settings.profile.group-permissions-heading", i0.ɵɵpureFunction1(6, _c2, g_r6.label)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isGroupPermLoading(g_r6.identifier) ? 4 : ctx_r1.hasGroupPermLoaded(g_r6.identifier) ? 5 : -1);
} }
function ProfilePageComponent_ng_template_32_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 29);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const emptyMessage_r8 = i0.ɵɵnextContext().emptyMessage;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(emptyMessage_r8);
} }
function ProfilePageComponent_ng_template_32_Conditional_23_For_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function ProfilePageComponent_ng_template_32_Conditional_23_For_1_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 33)(1, "mat-icon", 8);
    i0.ɵɵtext(2, "groups");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const permission_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(permission_r9.grantedBy);
} }
function ProfilePageComponent_ng_template_32_Conditional_23_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "div", 30);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, ProfilePageComponent_ng_template_32_Conditional_23_For_1_Conditional_4_Template, 2, 1, "div", 31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td")(6, "span", 32);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "td");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td");
    i0.ɵɵconditionalCreate(11, ProfilePageComponent_ng_template_32_Conditional_23_For_1_Conditional_11_Template, 5, 1, "span", 33);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_19_0;
    const permission_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(permission_r9.documentTitle);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_19_0 = permission_r9.documentPath) ? 4 : -1, tmp_19_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(permission_r9.right);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(permission_r9.timeFrame);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.showGrantedBy(permission_r9.grantedBy) ? 11 : -1);
} }
function ProfilePageComponent_ng_template_32_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ProfilePageComponent_ng_template_32_Conditional_23_For_1_Template, 12, 5, "tr", null, _forTrack1);
} if (rf & 2) {
    const rows_r10 = i0.ɵɵnextContext().rows;
    i0.ɵɵrepeater(rows_r10);
} }
function ProfilePageComponent_ng_template_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "table", 23)(2, "colgroup");
    i0.ɵɵelement(3, "col", 24)(4, "col", 25)(5, "col", 26)(6, "col", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "thead")(8, "tr")(9, "th", 28);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th", 28);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "th", 28);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "th", 28);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "tbody");
    i0.ɵɵconditionalCreate(22, ProfilePageComponent_ng_template_32_Conditional_22_Template, 3, 1, "tr")(23, ProfilePageComponent_ng_template_32_Conditional_23_Template, 2, 0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const rows_r10 = ctx.rows;
    const tableLabel_r11 = ctx.tableLabel;
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", tableLabel_r11);
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 6, "app.profile-page.on"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 8, "app.profile-page.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 10, "app.profile-page.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 12, "app.profile-page.granted-by"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(rows_r10.length === 0 ? 22 : 23);
} }
function ProfilePageComponent_ng_template_34_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 34)(1, "button", 35);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function ProfilePageComponent_ng_template_34_Conditional_0_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r12); const groupId_r13 = i0.ɵɵnextContext().groupId; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.groupPermPrev(groupId_r13)); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "chevron_left");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 36);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 35);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function ProfilePageComponent_ng_template_34_Conditional_0_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r12); const groupId_r13 = i0.ɵɵnextContext().groupId; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.groupPermNext(groupId_r13)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "chevron_right");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r13 = i0.ɵɵnextContext();
    const totalPages_r15 = ctx_r13.totalPages;
    const currentPage_r16 = ctx_r13.currentPage;
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", currentPage_r16 === 0);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 6, "app.profile-page.previous-page"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", currentPage_r16 + 1, " / ", totalPages_r15);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", currentPage_r16 === totalPages_r15 - 1);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 8, "app.profile-page.next-page"));
} }
function ProfilePageComponent_ng_template_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ProfilePageComponent_ng_template_34_Conditional_0_Template, 11, 10, "div", 34);
} if (rf & 2) {
    const totalPages_r15 = ctx.totalPages;
    i0.ɵɵconditional(totalPages_r15 > 1 ? 0 : -1);
} }
const GROUP_PERM_PAGE_SIZE = 25;
export class ProfilePageComponent {
    auth = inject(AuthService);
    translate = inject(TranslateService);
    /** The active language as a signal, so a `computed` that calls `instant()` recomputes on a switch. */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.getCurrentLang() });
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    userService = inject(UserService);
    settingsService = inject(SettingsService);
    permService = inject(PrincipalPermissionsService);
    dialog = inject(MatDialog);
    changePasswordButton = viewChild.required('changePasswordButton');
    username = computed(() => {
        this.currentLang();
        return this.auth.username() ?? this.translate.instant('settings.profile.unknown-user');
    }, ...(ngDevMode ? [{ debugName: "username" }] : []));
    email = signal('—', ...(ngDevMode ? [{ debugName: "email" }] : []));
    company = signal('—', ...(ngDevMode ? [{ debugName: "company" }] : []));
    groups = signal([], ...(ngDevMode ? [{ debugName: "groups" }] : []));
    groupsLoading = signal(true, ...(ngDevMode ? [{ debugName: "groupsLoading" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    localPermissions = signal([], ...(ngDevMode ? [{ debugName: "localPermissions" }] : []));
    localPermissionsLoading = signal(true, ...(ngDevMode ? [{ debugName: "localPermissionsLoading" }] : []));
    groupPermMap = signal({}, ...(ngDevMode ? [{ debugName: "groupPermMap" }] : []));
    groupPermLoading = signal({}, ...(ngDevMode ? [{ debugName: "groupPermLoading" }] : []));
    constructor() {
        afterNextRender(() => {
            this.changePasswordButton().nativeElement.focus();
        });
        const userId = this.auth.username();
        if (!userId) {
            this.loading.set(false);
            this.localPermissionsLoading.set(false);
            this.groupsLoading.set(false);
            this.groups.set([]);
            return;
        }
        this.userService
            .getUser(userId)
            .pipe(takeUntilDestroyed(), switchMap((user) => {
            this.email.set(user.properties.email || '—');
            this.company.set(user.properties.company || '—');
            this.loading.set(false);
            const groupIds = user.properties.groups ?? [];
            if (!groupIds.length) {
                this.groups.set([]);
                this.groupsLoading.set(false);
                return of(null);
            }
            return forkJoin(groupIds.map((gid) => this.userService.getGroup(gid).pipe(catchError(() => of(null))))).pipe(map((resolvedGroups) => ({
                user,
                groups: groupIds.map((gid, index) => ({
                    identifier: gid,
                    label: resolvedGroups[index]?.grouplabel?.trim() || gid,
                })),
            })));
        }))
            .subscribe({
            next: (result) => {
                if (!result) {
                    return;
                }
                this.groups.set(result.groups);
                this.groupsLoading.set(false);
            },
            error: () => {
                this.groupsLoading.set(false);
                this.loading.set(false);
            },
        });
        this.settingsService
            .getLocalPermissions(userId)
            .pipe(takeUntilDestroyed())
            .subscribe({
            next: (rows) => {
                this.localPermissions.set(rows);
                this.localPermissionsLoading.set(false);
            },
            error: () => {
                this.localPermissionsLoading.set(false);
            },
        });
    }
    openChangePasswordDialog() {
        this.dialog.open(ChangePasswordDialogComponent, { width: '440px' });
    }
    groupLink(_identifier) {
        // TODO: Navigate to the Group details screen once that UI route is available.
        return '#';
    }
    groupPermPage(groupId) {
        return this.groupPermMap()[groupId] ?? null;
    }
    isGroupPermLoading(groupId) {
        return this.groupPermLoading()[groupId] === true;
    }
    hasGroupPermLoaded(groupId) {
        return this.groupPermMap()[groupId] !== undefined;
    }
    onGroupPermSectionVisible(groupId) {
        if (this.hasGroupPermLoaded(groupId) || this.isGroupPermLoading(groupId)) {
            return;
        }
        this.loadGroupPermPage(groupId, 0);
    }
    groupPermRows(groupId) {
        const page = this.groupPermPage(groupId);
        if (!page) {
            return [];
        }
        return page.rows.map((row) => principalPermissionToLocalRow(row, (key) => this.translate.instant(key), this.locale));
    }
    groupPermTotalPages(groupId) {
        const page = this.groupPermPage(groupId);
        return page ? Math.max(1, page.numberOfPages) : 1;
    }
    groupPermCurrentPage(groupId) {
        return this.groupPermPage(groupId)?.currentPageIndex ?? 0;
    }
    groupPermPrev(groupId) {
        const current = this.groupPermCurrentPage(groupId);
        if (current > 0) {
            this.loadGroupPermPage(groupId, current - 1);
        }
    }
    groupPermNext(groupId) {
        const current = this.groupPermCurrentPage(groupId);
        if (current < this.groupPermTotalPages(groupId) - 1) {
            this.loadGroupPermPage(groupId, current + 1);
        }
    }
    showGrantedBy(grantedBy) {
        return grantedBy !== '—';
    }
    loadGroupPermPage(groupId, pageIndex) {
        this.groupPermLoading.update((state) => ({ ...state, [groupId]: true }));
        this.permService
            .listLocalPermissionRows(groupId, GROUP_PERM_PAGE_SIZE, pageIndex)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (page) => {
                this.groupPermMap.update((state) => ({ ...state, [groupId]: page }));
                this.groupPermLoading.update((state) => ({ ...state, [groupId]: false }));
            },
            error: () => {
                this.groupPermMap.update((state) => ({
                    ...state,
                    [groupId]: {
                        rows: [],
                        totalDocuments: 0,
                        numberOfPages: 0,
                        currentPageIndex: 0,
                        currentPageSize: 0,
                    },
                }));
                this.groupPermLoading.update((state) => ({ ...state, [groupId]: false }));
            },
        });
    }
    static ɵfac = function ProfilePageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfilePageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProfilePageComponent, selectors: [["ng-component"]], viewQuery: function ProfilePageComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.changePasswordButton, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, decls: 36, vars: 13, consts: [["changePasswordButton", ""], ["permissionTableBody", ""], ["permissionPagination", ""], [1, "profile-page"], [1, "profile-cards"], [1, "profile-card", "profile-card--primary"], [1, "profile-card__header"], ["role", "heading", "aria-level", "2", 1, "profile-card__title"], ["aria-hidden", "true"], ["type", "button", 1, "profile-card__password-btn", 3, "click"], [1, "profile-card__loading"], [1, "profile-card__details"], [1, "profile-card"], ["role", "heading", "aria-level", "3", 1, "profile-card__section-title"], [1, "profile-card__text"], [1, "profile-card__table-wrapper"], [1, "profile-card", 3, "libGroupPermLazyLoad"], [1, "profile-card__detail-row"], [1, "profile-card__table"], ["colspan", "2", 1, "profile-card__table-empty"], ["target", "_blank", "rel", "noopener noreferrer", 1, "profile-card__pill-link", 3, "href"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "profile-card", 3, "visible", "libGroupPermLazyLoad"], [1, "profile-perm-table"], [1, "profile-perm-table__col-on"], [1, "profile-perm-table__col-right"], [1, "profile-perm-table__col-time"], [1, "profile-perm-table__col-granted"], ["scope", "col"], ["colspan", "4", 1, "profile-perm-table__empty"], [1, "profile-perm-table__doc-title"], [1, "profile-perm-table__doc-path"], [1, "profile-perm-table__right-tag"], [1, "profile-perm-table__granted-by"], [1, "profile-card__pagination"], ["mat-icon-button", "", "type", "button", 3, "click", "disabled"], [1, "profile-card__pagination-label"]], template: function ProfilePageComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "section", 3)(1, "div", 4)(2, "article", 5)(3, "header", 6)(4, "div", 7)(5, "mat-icon", 8);
            i0.ɵɵtext(6, "account_circle");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "span");
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "button", 9, 0);
            i0.ɵɵlistener("click", function ProfilePageComponent_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.openChangePasswordDialog()); });
            i0.ɵɵelementStart(11, "mat-icon", 8);
            i0.ɵɵtext(12, "lock");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "span");
            i0.ɵɵtext(14);
            i0.ɵɵpipe(15, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(16, ProfilePageComponent_Conditional_16_Template, 3, 3, "p", 10)(17, ProfilePageComponent_Conditional_17_Template, 13, 8, "dl", 11);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "article", 12)(19, "div", 13);
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(22, ProfilePageComponent_Conditional_22_Template, 3, 3, "p", 14)(23, ProfilePageComponent_Conditional_23_Template, 13, 7, "div", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "article", 12)(25, "div", 13);
            i0.ɵɵtext(26);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(28, ProfilePageComponent_Conditional_28_Template, 3, 3, "p", 14)(29, ProfilePageComponent_Conditional_29_Template, 3, 10, "ng-container");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(30, ProfilePageComponent_For_31_Template, 6, 8, "article", 16, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(32, ProfilePageComponent_ng_template_32_Template, 24, 14, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor)(34, ProfilePageComponent_ng_template_34_Template, 1, 1, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.username());
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 7, "app.profile-page.change-password"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.loading() ? 16 : 17);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(21, 9, "app.profile-page.groups"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.groupsLoading() ? 22 : 23);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 11, "app.profile-page.local-permissions"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.localPermissionsLoading() ? 28 : 29);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.groups());
        } }, dependencies: [NgTemplateOutlet,
            MatIconModule, i1.MatIcon, MatButtonModule, i2.MatIconButton, GroupPermLazyLoadDirective,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.profile-page[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n}\n\n.profile-cards[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  width: 100%;\n}\n\n.profile-card[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 1.25rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n}\n\n.profile-card--primary[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.profile-card__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n}\n\n.profile-card__title[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin: 0;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__title[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  color: #667085;\n}\n\n.profile-card__password-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  border: none;\n  background: none;\n  color: var(--mat-sys-on-surface);\n  font: inherit;\n  font-size: 0.875rem;\n  line-height: 1;\n  text-align: left;\n  padding: 14px 16px;\n  cursor: pointer;\n  transition:\n    background-color 120ms ease,\n    color 120ms ease,\n    box-shadow 120ms ease;\n}\n\n.profile-card__password-btn[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  width: 1rem;\n  height: 1rem;\n  font-size: 1rem;\n  color: inherit;\n}\n\n.profile-card__password-btn[_ngcontent-%COMP%]:hover {\n  background: var(--mat-sys-surface-container-low);\n}\n\n.profile-card__password-btn[_ngcontent-%COMP%]:focus, \n.profile-card__password-btn[_ngcontent-%COMP%]:focus-visible {\n  background: var(--mat-sys-surface-container-low);\n  box-shadow: 0 0 0 3px rgba(52, 64, 84, 0.08);\n  outline: none;\n}\n\n.profile-card__loading[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #555;\n}\n\n.profile-card__details[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0.5rem 0 0 0.5rem;\n}\n\n.profile-card__detail-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 92px 1fr;\n  gap: 0.5rem;\n  padding: 0.25rem 0;\n}\n\n.profile-card__detail-row[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #475467;\n}\n\n.profile-card__detail-row[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__section-title[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__text[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #555;\n  line-height: 1.5;\n}\n\n.profile-card__table-wrapper[_ngcontent-%COMP%] {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.profile-card__table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.profile-card__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.profile-card__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.92rem;\n  overflow-wrap: anywhere;\n}\n\n.profile-card__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n  font-weight: 400;\n}\n\n.profile-card__table-empty[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #667085;\n}\n\n.profile-card__pill-link[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  max-width: 100%;\n  padding: 0.2rem 0.6rem;\n  border-radius: 999px;\n  background: #eef4ff;\n  color: #1d4ed8;\n  text-decoration: none;\n  font-weight: 500;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.profile-card__pill-link[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  width: 1rem;\n  height: 1rem;\n}\n\n.profile-card__pill-link[_ngcontent-%COMP%]:hover {\n  background: #dbeafe;\n}\n\n.profile-perm-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.profile-perm-table__col-on[_ngcontent-%COMP%] {\n  width: 37.5%;\n}\n\n.profile-perm-table__col-right[_ngcontent-%COMP%], \n.profile-perm-table__col-time[_ngcontent-%COMP%] {\n  width: 25%;\n}\n\n.profile-perm-table__col-granted[_ngcontent-%COMP%] {\n  width: 12.5%;\n}\n\n.profile-perm-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.profile-perm-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding: 0.75rem 1rem;\n  box-sizing: border-box;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  text-align: left;\n  vertical-align: top;\n}\n\n.profile-perm-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-low);\n  border-bottom: 2px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface-variant);\n  font-weight: 400;\n}\n\n.profile-perm-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface);\n}\n\n.profile-perm-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] {\n  border-bottom: none;\n}\n\n.profile-perm-table__doc-title[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-perm-table__doc-path[_ngcontent-%COMP%] {\n  margin-top: 0.15rem;\n  color: var(--mat-sys-primary);\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}\n\n.profile-perm-table__right-tag[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 0.06em 0.3em;\n  border-radius: 3px;\n  background: var(--mat-sys-secondary);\n  color: var(--mat-sys-on-secondary);\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n.profile-perm-table__granted-by[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  max-width: 100%;\n  min-width: 0;\n  padding: 0.15rem 0.45rem;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  font-size: 0.82rem;\n  overflow: hidden;\n}\n\n.profile-perm-table__granted-by[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.profile-perm-table__granted-by[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%] {\n  width: 1rem;\n  height: 1rem;\n  font-size: 1rem;\n}\n\n.profile-perm-table__empty[_ngcontent-%COMP%] {\n  padding: 1.5rem 0.7rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-weight: 300;\n  opacity: 0.5;\n}\n\n.profile-card__pagination[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\n.profile-card__pagination-label[_ngcontent-%COMP%] {\n  min-width: 3rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 0.875rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfilePageComponent, [{
        type: Component,
        args: [{ standalone: true, imports: [
                    TranslatePipe,
                    NgTemplateOutlet,
                    MatIconModule,
                    MatButtonModule,
                    GroupPermLazyLoadDirective,
                ], template: "<section class=\"profile-page\">\n  <div class=\"profile-cards\">\n    <article class=\"profile-card profile-card--primary\">\n      <header class=\"profile-card__header\">\n        <div class=\"profile-card__title\" role=\"heading\" aria-level=\"2\">\n          <mat-icon aria-hidden=\"true\">account_circle</mat-icon>\n          <span>{{ username() }}</span>\n        </div>\n        <button\n          type=\"button\"\n          class=\"profile-card__password-btn\"\n          (click)=\"openChangePasswordDialog()\"\n          #changePasswordButton\n        >\n          <mat-icon aria-hidden=\"true\">lock</mat-icon>\n          <span>{{ 'app.profile-page.change-password' | translate }}</span>\n        </button>\n      </header>\n\n      @if (loading()) {\n        <p class=\"profile-card__loading\">\n          {{ 'app.profile-page.loading-profile-details' | translate }}\n        </p>\n      } @else {\n        <dl class=\"profile-card__details\">\n          <div class=\"profile-card__detail-row\">\n            <dt>{{ 'app.profile-page.email' | translate }}</dt>\n            <dd>{{ email() }}</dd>\n          </div>\n          <div class=\"profile-card__detail-row\">\n            <dt>{{ 'app.profile-page.company' | translate }}</dt>\n            <dd>{{ company() }}</dd>\n          </div>\n        </dl>\n      }\n    </article>\n\n    <article class=\"profile-card\">\n      <div class=\"profile-card__section-title\" role=\"heading\" aria-level=\"3\">\n        {{ 'app.profile-page.groups' | translate }}\n      </div>\n\n      @if (groupsLoading()) {\n        <p class=\"profile-card__text\">{{ 'app.profile-page.loading-groups' | translate }}</p>\n      } @else {\n        <div class=\"profile-card__table-wrapper\">\n          <table class=\"profile-card__table\">\n            <thead>\n              <tr>\n                <th>{{ 'app.profile-page.name' | translate }}</th>\n                <th>{{ 'app.profile-page.identifier' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @if (groups().length === 0) {\n                <tr>\n                  <td colspan=\"2\" class=\"profile-card__table-empty\">\n                    {{ 'app.profile-page.no-groups-found' | translate }}\n                  </td>\n                </tr>\n              } @else {\n                @for (g of groups(); track g.identifier) {\n                  <tr>\n                    <td>\n                      <a\n                        class=\"profile-card__pill-link\"\n                        [href]=\"groupLink(g.identifier)\"\n                        target=\"_blank\"\n                        rel=\"noopener noreferrer\"\n                      >\n                        <mat-icon aria-hidden=\"true\">groups</mat-icon>\n                        <span>{{ g.label }}</span>\n                      </a>\n                    </td>\n                    <td>{{ g.identifier }}</td>\n                  </tr>\n                }\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    </article>\n\n    <article class=\"profile-card\">\n      <div class=\"profile-card__section-title\" role=\"heading\" aria-level=\"3\">\n        {{ 'app.profile-page.local-permissions' | translate }}\n      </div>\n\n      @if (localPermissionsLoading()) {\n        <p class=\"profile-card__text\">\n          {{ 'app.profile-page.loading-local-permissions' | translate }}\n        </p>\n      } @else {\n        <ng-container\n          *ngTemplateOutlet=\"\n            permissionTableBody;\n            context: {\n              rows: localPermissions(),\n              emptyMessage: ('settings.profile.no-local-permissions' | translate),\n              tableLabel: ('settings.profile.local-permissions' | translate),\n            }\n          \"\n        />\n      }\n    </article>\n\n    @for (g of groups(); track g.identifier) {\n      <article\n        class=\"profile-card\"\n        [libGroupPermLazyLoad]=\"g.identifier\"\n        (visible)=\"onGroupPermSectionVisible($event)\"\n      >\n        <div class=\"profile-card__section-title\" role=\"heading\" aria-level=\"3\">\n          {{ 'settings.profile.group-permissions-heading' | translate: { group: g.label } }}\n        </div>\n\n        @if (isGroupPermLoading(g.identifier)) {\n          <p class=\"profile-card__text\">\n            {{ 'settings.profile.loading-group-permissions' | translate: { group: g.label } }}\n          </p>\n        } @else if (hasGroupPermLoaded(g.identifier)) {\n          <ng-container\n            *ngTemplateOutlet=\"\n              permissionTableBody;\n              context: {\n                rows: groupPermRows(g.identifier),\n                emptyMessage: g.label + ' does not have permissions.',\n                tableLabel: g.label + ' permissions',\n              }\n            \"\n          />\n          <ng-container\n            *ngTemplateOutlet=\"\n              permissionPagination;\n              context: {\n                totalPages: groupPermTotalPages(g.identifier),\n                currentPage: groupPermCurrentPage(g.identifier),\n                groupId: g.identifier,\n              }\n            \"\n          />\n        }\n      </article>\n    }\n  </div>\n</section>\n\n<ng-template\n  #permissionTableBody\n  let-rows=\"rows\"\n  let-emptyMessage=\"emptyMessage\"\n  let-tableLabel=\"tableLabel\"\n>\n  <div class=\"profile-card__table-wrapper\">\n    <table class=\"profile-perm-table\" [attr.aria-label]=\"tableLabel\">\n      <colgroup>\n        <col class=\"profile-perm-table__col-on\" />\n        <col class=\"profile-perm-table__col-right\" />\n        <col class=\"profile-perm-table__col-time\" />\n        <col class=\"profile-perm-table__col-granted\" />\n      </colgroup>\n      <thead>\n        <tr>\n          <th scope=\"col\">{{ 'app.profile-page.on' | translate }}</th>\n          <th scope=\"col\">{{ 'app.profile-page.right' | translate }}</th>\n          <th scope=\"col\">{{ 'app.profile-page.time-frame' | translate }}</th>\n          <th scope=\"col\">{{ 'app.profile-page.granted-by' | translate }}</th>\n        </tr>\n      </thead>\n      <tbody>\n        @if (rows.length === 0) {\n          <tr>\n            <td colspan=\"4\" class=\"profile-perm-table__empty\">{{ emptyMessage }}</td>\n          </tr>\n        } @else {\n          @for (\n            permission of rows;\n            track permission.documentTitle +\n              permission.documentPath +\n              permission.right +\n              permission.timeFrame +\n              permission.grantedBy\n          ) {\n            <tr>\n              <td>\n                <div class=\"profile-perm-table__doc-title\">{{ permission.documentTitle }}</div>\n                @if (permission.documentPath; as docPath) {\n                  <div class=\"profile-perm-table__doc-path\">{{ docPath }}</div>\n                }\n              </td>\n              <td>\n                <span class=\"profile-perm-table__right-tag\">{{ permission.right }}</span>\n              </td>\n              <td>{{ permission.timeFrame }}</td>\n              <td>\n                @if (showGrantedBy(permission.grantedBy)) {\n                  <span class=\"profile-perm-table__granted-by\">\n                    <mat-icon aria-hidden=\"true\">groups</mat-icon>\n                    <span>{{ permission.grantedBy }}</span>\n                  </span>\n                }\n              </td>\n            </tr>\n          }\n        }\n      </tbody>\n    </table>\n  </div>\n</ng-template>\n\n<ng-template\n  #permissionPagination\n  let-totalPages=\"totalPages\"\n  let-currentPage=\"currentPage\"\n  let-groupId=\"groupId\"\n>\n  @if (totalPages > 1) {\n    <div class=\"profile-card__pagination\">\n      <button\n        mat-icon-button\n        type=\"button\"\n        [disabled]=\"currentPage === 0\"\n        (click)=\"groupPermPrev(groupId)\"\n        [attr.aria-label]=\"'app.profile-page.previous-page' | translate\"\n      >\n        <mat-icon>chevron_left</mat-icon>\n      </button>\n      <span class=\"profile-card__pagination-label\">{{ currentPage + 1 }} / {{ totalPages }}</span>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [disabled]=\"currentPage === totalPages - 1\"\n        (click)=\"groupPermNext(groupId)\"\n        [attr.aria-label]=\"'app.profile-page.next-page' | translate\"\n      >\n        <mat-icon>chevron_right</mat-icon>\n      </button>\n    </div>\n  }\n</ng-template>\n", styles: [":host {\n  display: block;\n}\n\n.profile-page {\n  padding: 1.5rem;\n}\n\n.profile-cards {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  width: 100%;\n}\n\n.profile-card {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 1.25rem;\n  border: 1px solid #e8e8e8;\n  border-radius: 12px;\n  background: #fff;\n}\n\n.profile-card--primary {\n  width: 100%;\n}\n\n.profile-card__header {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n}\n\n.profile-card__title {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin: 0;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__title mat-icon {\n  color: #667085;\n}\n\n.profile-card__password-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  border: none;\n  background: none;\n  color: var(--mat-sys-on-surface);\n  font: inherit;\n  font-size: 0.875rem;\n  line-height: 1;\n  text-align: left;\n  padding: 14px 16px;\n  cursor: pointer;\n  transition:\n    background-color 120ms ease,\n    color 120ms ease,\n    box-shadow 120ms ease;\n}\n\n.profile-card__password-btn mat-icon {\n  width: 1rem;\n  height: 1rem;\n  font-size: 1rem;\n  color: inherit;\n}\n\n.profile-card__password-btn:hover {\n  background: var(--mat-sys-surface-container-low);\n}\n\n.profile-card__password-btn:focus,\n.profile-card__password-btn:focus-visible {\n  background: var(--mat-sys-surface-container-low);\n  box-shadow: 0 0 0 3px rgba(52, 64, 84, 0.08);\n  outline: none;\n}\n\n.profile-card__loading {\n  margin: 0;\n  color: #555;\n}\n\n.profile-card__details {\n  margin: 0;\n  padding: 0.5rem 0 0 0.5rem;\n}\n\n.profile-card__detail-row {\n  display: grid;\n  grid-template-columns: 92px 1fr;\n  gap: 0.5rem;\n  padding: 0.25rem 0;\n}\n\n.profile-card__detail-row dt {\n  margin: 0;\n  color: #475467;\n}\n\n.profile-card__detail-row dd {\n  margin: 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__section-title {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-card__text {\n  margin: 0;\n  color: #555;\n  line-height: 1.5;\n}\n\n.profile-card__table-wrapper {\n  width: 100%;\n  overflow-x: auto;\n}\n\n.profile-card__table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n\n.profile-card__table th,\n.profile-card__table td {\n  padding: 0.75rem;\n  border-bottom: 1px solid #e8e8e8;\n  text-align: left;\n  font-size: 0.92rem;\n  overflow-wrap: anywhere;\n}\n\n.profile-card__table th {\n  color: var(--mat-sys-on-surface);\n  background: #f8f9fc;\n  font-weight: 400;\n}\n\n.profile-card__table-empty {\n  text-align: center;\n  color: #667085;\n}\n\n.profile-card__pill-link {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.35rem;\n  max-width: 100%;\n  padding: 0.2rem 0.6rem;\n  border-radius: 999px;\n  background: #eef4ff;\n  color: #1d4ed8;\n  text-decoration: none;\n  font-weight: 500;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.profile-card__pill-link mat-icon {\n  font-size: 1rem;\n  width: 1rem;\n  height: 1rem;\n}\n\n.profile-card__pill-link:hover {\n  background: #dbeafe;\n}\n\n.profile-perm-table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.profile-perm-table__col-on {\n  width: 37.5%;\n}\n\n.profile-perm-table__col-right,\n.profile-perm-table__col-time {\n  width: 25%;\n}\n\n.profile-perm-table__col-granted {\n  width: 12.5%;\n}\n\n.profile-perm-table th,\n.profile-perm-table td {\n  min-width: 0;\n  padding: 0.75rem 1rem;\n  box-sizing: border-box;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  text-align: left;\n  vertical-align: top;\n}\n\n.profile-perm-table thead th {\n  background: var(--mat-sys-surface-container-low);\n  border-bottom: 2px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface-variant);\n  font-weight: 400;\n}\n\n.profile-perm-table tbody tr {\n  background: var(--mat-sys-surface);\n}\n\n.profile-perm-table tbody tr:last-child td {\n  border-bottom: none;\n}\n\n.profile-perm-table__doc-title {\n  color: var(--mat-sys-on-surface);\n}\n\n.profile-perm-table__doc-path {\n  margin-top: 0.15rem;\n  color: var(--mat-sys-primary);\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}\n\n.profile-perm-table__right-tag {\n  display: inline-block;\n  padding: 0.06em 0.3em;\n  border-radius: 3px;\n  background: var(--mat-sys-secondary);\n  color: var(--mat-sys-on-secondary);\n  font-size: 0.75rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n.profile-perm-table__granted-by {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n  max-width: 100%;\n  min-width: 0;\n  padding: 0.15rem 0.45rem;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  font-size: 0.82rem;\n  overflow: hidden;\n}\n\n.profile-perm-table__granted-by > span {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.profile-perm-table__granted-by mat-icon {\n  width: 1rem;\n  height: 1rem;\n  font-size: 1rem;\n}\n\n.profile-perm-table__empty {\n  padding: 1.5rem 0.7rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-weight: 300;\n  opacity: 0.5;\n}\n\n.profile-card__pagination {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\n.profile-card__pagination-label {\n  min-width: 3rem;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 0.875rem;\n}\n"] }]
    }], () => [], { changePasswordButton: [{ type: i0.ViewChild, args: ['changePasswordButton', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProfilePageComponent, { className: "ProfilePageComponent", filePath: "apps/nuxeo-ui/src/app/settings/profile/profile-page.component.ts", lineNumber: 48 }); })();
