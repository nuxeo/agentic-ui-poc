import { Component, DestroyRef, LOCALE_ID, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CollectionService, DocumentDetailService, DirectoryService, avatarColor, canViewDocumentAuditLog, canWriteDocument, canRemoveDocument, canShowWriteDocumentAction, canShowRemoveDocumentAction, hasDocumentPermissionsEnricher, PERMISSION_DENIED_KEY, isPermissionDeniedError, isMailSendError, mailSendFailureMessage, readClipboardDocs, writeClipboardDocs, CURRENT_USERNAME, ADMIN_ACCESS_CHECKS, shouldShowUserWorkspaceBreadcrumbs, postTrashBrowseRouterUrl, BrowseContextService, canManageDocumentPermissions, decodeNuxeoPathSegment, permissionRightLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { ShareDialogComponent, ExportDialogComponent, ConfirmDialogComponent, EditCollectionDialogComponent, DateMaskPipe, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { ExtensionOutletComponent } from '@nuxeo/satori-platform/extensions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NXS_PERMISSIONS_PANEL_ID, NXS_PRIMITIVE_IDS, NxsBreadcrumbsComponent, NxsDeletePermissionDialogComponent, NxsDocumentListComponent, NxsFolderHeaderComponent, NxsPermissionsPanelComponent, NxsShareExternalDialogComponent, NxsSpinnerComponent, NxsUpdatePermissionDialogComponent, nxsAceTimeFrame, nxsErrorStatus, provideNxsThumbnailCache, NxsToastService, provideNxsToast, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/tabs";
import * as i5 from "@angular/material/tooltip";
import * as i6 from "@angular/material/menu";
import * as i7 from "@angular/material/table";
import * as i8 from "@angular/material/sort";
import * as i9 from "@angular/material/paginator";
import * as i10 from "@angular/material/form-field";
import * as i11 from "@angular/material/input";
import * as i12 from "@angular/material/select";
import * as i13 from "@angular/material/datepicker";
import * as i14 from "@hylandsoftware/satori-ui/avatar";
import * as i15 from "@hylandsoftware/satori-ui/tag";
const _c0 = a0 => ({ name: a0 });
const _c1 = (a0, a1) => ({ items: a0, label: a1 });
const _c2 = a0 => ({ count: a0 });
const _c3 = (a0, a1) => ({ documentId: a0, permissionsChanged: a1 });
const _c4 = () => [10, 20, 50];
const _forTrack0 = ($index, $item) => $item.id;
function CollectionDetailComponent_Conditional_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "collections.collection-detail.this-collection-does-not-exist-or"), " ");
} }
function CollectionDetailComponent_Conditional_1_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "collections.collection-detail.the-collection-could-not-be-loaded"), " ");
} }
function CollectionDetailComponent_Conditional_1_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_1_Conditional_11_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.retryLoad()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.try-again"), " ");
} }
function CollectionDetailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "mat-icon", 7);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 8);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 9);
    i0.ɵɵconditionalCreate(8, CollectionDetailComponent_Conditional_1_Conditional_8_Template, 2, 3)(9, CollectionDetailComponent_Conditional_1_Conditional_9_Template, 2, 3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 10);
    i0.ɵɵconditionalCreate(11, CollectionDetailComponent_Conditional_1_Conditional_11_Template, 3, 3, "button", 11);
    i0.ɵɵelementStart(12, "button", 12);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_1_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.goToCollections()); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.loadState() === "not-found" ? "search_off" : "error_outline", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.loadState() === "not-found" ? i0.ɵɵpipeBind1(5, 5, "collections.collection-not-found") : i0.ɵɵpipeBind1(6, 7, "collections.collection-unavailable"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r2.loadState() === "not-found" ? 8 : 9);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.loadState() === "error" ? 11 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 9, "collections.collection-detail.back-to-collections"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-breadcrumbs", 45);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const trailLabel_r5 = i0.ɵɵreadContextLet(1);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("items", ctx_r2.breadcrumbItems())("label", trailLabel_r5);
} }
function CollectionDetailComponent_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵdeclareLet(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelement(3, "lib-extension-outlet", 44, 3);
    i0.ɵɵconditionalCreate(5, CollectionDetailComponent_Conditional_2_Conditional_2_Conditional_5_Template, 1, 2, "nxs-breadcrumbs", 45);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const breadcrumbsOutlet_r6 = i0.ɵɵreference(4);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    const trailLabel_r7 = i0.ɵɵstoreLet(i0.ɵɵpipeBind1(2, 3, "collections.collection-detail.breadcrumbs"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("componentId", ctx_r2.breadcrumbsId)("componentInputs", i0.ɵɵpureFunction2(6, _c1, ctx_r2.breadcrumbItems(), trailLabel_r7));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(breadcrumbsOutlet_r6.unresolved() ? 5 : -1);
} }
function CollectionDetailComponent_Conditional_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.editCollection()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "edit");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "collections.collection-detail.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "collections.collection-detail.edit"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.deleteCollection()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "delete");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r2.actionInProgress() === "trash")("matTooltip", i0.ɵɵpipeBind1(1, 3, "collections.collection-detail.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 5, "collections.collection-detail.delete"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_16_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.toggleLock()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("lock-toggle--active", ctx_r2.isLocked() && ctx_r2.canEditCollection());
    i0.ɵɵproperty("disabled", ctx_r2.actionInProgress() === "lock" || !ctx_r2.canEditCollection())("matTooltip", ctx_r2.lockTooltip() ?? (ctx_r2.isLocked() ? i0.ɵɵpipeBind1(1, 6, "collections.unlock") : i0.ɵɵpipeBind1(2, 8, "collections.lock")));
    i0.ɵɵattribute("aria-label", ctx_r2.isLocked() ? i0.ɵɵpipeBind1(3, 10, "collections.unlock") : i0.ɵɵpipeBind1(4, 12, "collections.lock"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r2.isLocked() ? "lock" : "lock_open");
} }
function CollectionDetailComponent_Conditional_2_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, ctx_r2.totalSize() === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(4, _c2, ctx_r2.totalSize())), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_66_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-permissions-panel", 47);
} if (rf & 2) {
    const current_r11 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("documentId", current_r11.uid)("permissionsChanged", ctx_r2.onPermissionsChanged);
} }
function CollectionDetailComponent_Conditional_2_Conditional_66_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 44, 4);
    i0.ɵɵconditionalCreate(2, CollectionDetailComponent_Conditional_2_Conditional_66_Conditional_2_Template, 1, 2, "nxs-permissions-panel", 47);
} if (rf & 2) {
    const permissionsPanelOutlet_r12 = i0.ɵɵreference(1);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("componentId", ctx_r2.permissionsPanelId)("componentInputs", i0.ɵɵpureFunction2(3, _c3, ctx.uid, ctx_r2.onPermissionsChanged));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(permissionsPanelOutlet_r12.unresolved() ? 2 : -1);
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.shareWithExternal()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.new"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 53);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.the-document-is-not-shared-with"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.actions"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 56)(1, "button", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Conditional_9_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r14); const ace_r15 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.editExternalPermission(ace_r15)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 57);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Conditional_9_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r14); const ace_r15 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.sendNotificationEmail(ace_r15)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "send");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 16);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Conditional_9_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r14); const ace_r15 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.deletePermission(ace_r15)); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "delete");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ace_r15 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 7, "collections.collection-detail.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 9, "collections.collection-detail.edit-permission"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 11, "collections.collection-detail.send-notification-email"))("disabled", ctx_r2.actionInProgress() === "notify-" + ace_r15.id);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 13, "collections.collection-detail.send-notification"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(12, 15, "collections.collection-detail.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 17, "collections.collection-detail.delete-permission"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Template(rf, ctx) { if (rf & 1) {
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
    i0.ɵɵconditionalCreate(9, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Conditional_9_Template, 16, 19, "td", 56);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ace_r15 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.displayUsername(ace_r15));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.permissionLabel(ace_r15.permission));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.aceTimeFrame(ace_r15));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ace_r15.creator ?? "\u2014");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canManagePermissions() ? 9 : -1);
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 54)(1, "thead")(2, "tr")(3, "th");
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
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_Conditional_15_Template, 3, 3, "th");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "tbody");
    i0.ɵɵrepeaterCreate(17, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_For_18_Template, 10, 5, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "collections.collection-detail.user"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "collections.collection-detail.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 9, "collections.collection-detail.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 11, "collections.collection-detail.granted-by"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.canManagePermissions() ? 15 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.externalAces());
} }
function CollectionDetailComponent_Conditional_2_Conditional_67_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 30)(1, "div", 48)(2, "div", 49);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_5_Template, 3, 3, "button", 50);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 51);
    i0.ɵɵelement(7, "span", 52);
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_11_Template, 3, 3, "div", 53)(12, CollectionDetailComponent_Conditional_2_Conditional_67_Conditional_12_Template, 19, 13, "table", 54);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "collections.collection-detail.permissions-assigned-to-external-users"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.canManagePermissions() ? 5 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 6, "collections.collection-detail.sharing-to-external-users-does-not"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.externalAces().length === 0 ? 11 : 12);
} }
function CollectionDetailComponent_Conditional_2_For_110_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const action_r16 = ctx.$implicit;
    i0.ɵɵproperty("value", action_r16.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(action_r16.displayLabel);
} }
function CollectionDetailComponent_Conditional_2_For_120_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cat_r17 = ctx.$implicit;
    i0.ɵɵproperty("value", cat_r17.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(cat_r17.displayLabel);
} }
function CollectionDetailComponent_Conditional_2_Conditional_121_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵelement(1, "nxs-spinner", 58);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.loading"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_122_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43)(1, "mat-icon");
    i0.ɵɵtext(2, "event_busy");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "collections.collection-detail.no-history-entries-found"));
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.performed-action"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r19 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.eventLabel(entry_r19.eventId));
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.date"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 75);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r20 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, entry_r20.eventDate, "longDate"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.username"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 75)(1, "div", 76);
    i0.ɵɵelement(2, "sat-avatar", 77);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const entry_r21 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("initials", entry_r21.principalName)("category", ctx_r2.avatarColor(entry_r21.principalName))("borderless", true);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(entry_r21.principalName);
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.category"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r22 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.categoryLabel(entry_r22.category));
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 78);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.comment"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 79);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r23 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r23.comment);
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 78);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "collections.collection-detail.state"), " ");
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_td_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 75)(1, "sat-status-tag", 80);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r24 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("hideIcon", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r24.docLifeCycle);
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 81);
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 82);
} }
function CollectionDetailComponent_Conditional_2_Conditional_123_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 59)(1, "table", 60);
    i0.ɵɵlistener("matSortChange", function CollectionDetailComponent_Conditional_2_Conditional_123_Template_table_matSortChange_1_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onAuditSort($event)); });
    i0.ɵɵelementContainerStart(2, 61);
    i0.ɵɵtemplate(3, CollectionDetailComponent_Conditional_2_Conditional_123_th_3_Template, 3, 3, "th", 62)(4, CollectionDetailComponent_Conditional_2_Conditional_123_td_4_Template, 2, 1, "td", 63);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 64);
    i0.ɵɵtemplate(6, CollectionDetailComponent_Conditional_2_Conditional_123_th_6_Template, 3, 3, "th", 62)(7, CollectionDetailComponent_Conditional_2_Conditional_123_td_7_Template, 3, 4, "td", 63);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 65);
    i0.ɵɵtemplate(9, CollectionDetailComponent_Conditional_2_Conditional_123_th_9_Template, 3, 3, "th", 62)(10, CollectionDetailComponent_Conditional_2_Conditional_123_td_10_Template, 5, 4, "td", 63);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 66);
    i0.ɵɵtemplate(12, CollectionDetailComponent_Conditional_2_Conditional_123_th_12_Template, 3, 3, "th", 62)(13, CollectionDetailComponent_Conditional_2_Conditional_123_td_13_Template, 2, 1, "td", 63);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 67);
    i0.ɵɵtemplate(15, CollectionDetailComponent_Conditional_2_Conditional_123_th_15_Template, 3, 3, "th", 68)(16, CollectionDetailComponent_Conditional_2_Conditional_123_td_16_Template, 2, 1, "td", 69);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 70);
    i0.ɵɵtemplate(18, CollectionDetailComponent_Conditional_2_Conditional_123_th_18_Template, 3, 3, "th", 68)(19, CollectionDetailComponent_Conditional_2_Conditional_123_td_19_Template, 3, 2, "td", 63);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, CollectionDetailComponent_Conditional_2_Conditional_123_tr_20_Template, 1, 0, "tr", 71)(21, CollectionDetailComponent_Conditional_2_Conditional_123_tr_21_Template, 1, 0, "tr", 72);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "mat-paginator", 73);
    i0.ɵɵlistener("page", function CollectionDetailComponent_Conditional_2_Conditional_123_Template_mat_paginator_page_22_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onAuditPageChange($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r2.filteredAuditEntries());
    i0.ɵɵadvance(19);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r2.historyDisplayedColumns)("matHeaderRowDefSticky", true);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r2.historyDisplayedColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", ctx_r2.auditTotalSize())("pageSize", ctx_r2.auditPageSize())("pageIndex", ctx_r2.auditPageIndex())("pageSizeOptions", i0.ɵɵpureFunction0(8, _c4));
} }
function CollectionDetailComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-folder-header", 13);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵconditionalCreate(2, CollectionDetailComponent_Conditional_2_Conditional_2_Template, 6, 9, "div", 14);
    i0.ɵɵelementStart(3, "div", 15)(4, "button", 16);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadMembers()); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "sync");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, CollectionDetailComponent_Conditional_2_Conditional_9_Template, 5, 6, "button", 17);
    i0.ɵɵconditionalCreate(10, CollectionDetailComponent_Conditional_2_Conditional_10_Template, 5, 7, "button", 18);
    i0.ɵɵelementStart(11, "button", 19);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.exportCollection()); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "download");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, CollectionDetailComponent_Conditional_2_Conditional_16_Template, 7, 14, "button", 20);
    i0.ɵɵelementStart(17, "button", 21);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementStart(20, "mat-icon");
    i0.ɵɵtext(21, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "button", 17);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementStart(25, "mat-icon");
    i0.ɵɵtext(26, "search");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "mat-menu", null, 0)(29, "button", 22);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.shareCollection()); });
    i0.ɵɵelementStart(30, "mat-icon");
    i0.ɵɵtext(31, "share");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "span");
    i0.ɵɵtext(33);
    i0.ɵɵpipe(34, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "button", 23);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_35_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleSubscription()); });
    i0.ɵɵelementStart(36, "mat-icon");
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "span");
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(42, "button", 22);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleClipboard()); });
    i0.ɵɵelementStart(43, "mat-icon");
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "span");
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵpipe(48, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "button", 23);
    i0.ɵɵlistener("click", function CollectionDetailComponent_Conditional_2_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.exportCollection()); });
    i0.ɵɵelementStart(50, "mat-icon");
    i0.ɵɵtext(51, "download");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(52, "span");
    i0.ɵɵtext(53);
    i0.ɵɵpipe(54, "translate");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(55, "mat-tab-group", 24);
    i0.ɵɵlistener("selectedIndexChange", function CollectionDetailComponent_Conditional_2_Template_mat_tab_group_selectedIndexChange_55_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onTabChange($event)); });
    i0.ɵɵelementStart(56, "mat-tab", 25);
    i0.ɵɵpipe(57, "translate");
    i0.ɵɵelementStart(58, "div", 26);
    i0.ɵɵconditionalCreate(59, CollectionDetailComponent_Conditional_2_Conditional_59_Template, 3, 6, "div", 27);
    i0.ɵɵelementStart(60, "nxs-document-list", 28);
    i0.ɵɵpipe(61, "translate");
    i0.ɵɵpipe(62, "translate");
    i0.ɵɵlistener("sortChange", function CollectionDetailComponent_Conditional_2_Template_nxs_document_list_sortChange_60_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onMemberSortChange($event)); })("pageChange", function CollectionDetailComponent_Conditional_2_Template_nxs_document_list_pageChange_60_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.goToMemberPage($event)); })("open", function CollectionDetailComponent_Conditional_2_Template_nxs_document_list_open_60_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onRowClick($event)); })("retry", function CollectionDetailComponent_Conditional_2_Template_nxs_document_list_retry_60_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadMembers()); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(63, "mat-tab", 25);
    i0.ɵɵpipe(64, "translate");
    i0.ɵɵelementStart(65, "div", 29);
    i0.ɵɵconditionalCreate(66, CollectionDetailComponent_Conditional_2_Conditional_66_Template, 3, 6);
    i0.ɵɵconditionalCreate(67, CollectionDetailComponent_Conditional_2_Conditional_67_Template, 13, 8, "section", 30);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(68, "mat-tab", 25);
    i0.ɵɵpipe(69, "translate");
    i0.ɵɵelementStart(70, "div", 31)(71, "div", 32)(72, "div", 33)(73, "mat-form-field", 34)(74, "mat-label");
    i0.ɵɵtext(75);
    i0.ɵɵpipe(76, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(77, "input", 35);
    i0.ɵɵpipe(78, "translate");
    i0.ɵɵlistener("ngModelChange", function CollectionDetailComponent_Conditional_2_Template_input_ngModelChange_77_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterUsername.set($event)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(79, "div", 33)(80, "mat-form-field", 36)(81, "mat-label");
    i0.ɵɵtext(82);
    i0.ɵɵpipe(83, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(84, "input", 37);
    i0.ɵɵpipe(85, "translate");
    i0.ɵɵpipe(86, "dateMask");
    i0.ɵɵlistener("ngModelChange", function CollectionDetailComponent_Conditional_2_Template_input_ngModelChange_84_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterDateFrom.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(87, "mat-datepicker-toggle", 38)(88, "mat-datepicker", null, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(90, "mat-form-field", 36)(91, "mat-label");
    i0.ɵɵtext(92);
    i0.ɵɵpipe(93, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(94, "input", 37);
    i0.ɵɵpipe(95, "translate");
    i0.ɵɵpipe(96, "dateMask");
    i0.ɵɵlistener("ngModelChange", function CollectionDetailComponent_Conditional_2_Template_input_ngModelChange_94_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterDateTo.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(97, "mat-datepicker-toggle", 38)(98, "mat-datepicker", null, 2);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(100, "div", 33)(101, "mat-form-field", 36)(102, "mat-label");
    i0.ɵɵtext(103);
    i0.ɵɵpipe(104, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(105, "mat-select", 39);
    i0.ɵɵlistener("ngModelChange", function CollectionDetailComponent_Conditional_2_Template_mat_select_ngModelChange_105_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterAction.set($event)); });
    i0.ɵɵelementStart(106, "mat-option", 40);
    i0.ɵɵtext(107);
    i0.ɵɵpipe(108, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(109, CollectionDetailComponent_Conditional_2_For_110_Template, 2, 2, "mat-option", 41, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(111, "mat-form-field", 36)(112, "mat-label");
    i0.ɵɵtext(113);
    i0.ɵɵpipe(114, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(115, "mat-select", 39);
    i0.ɵɵlistener("ngModelChange", function CollectionDetailComponent_Conditional_2_Template_mat_select_ngModelChange_115_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterCategory.set($event)); });
    i0.ɵɵelementStart(116, "mat-option", 40);
    i0.ɵɵtext(117);
    i0.ɵɵpipe(118, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(119, CollectionDetailComponent_Conditional_2_For_120_Template, 2, 2, "mat-option", 41, _forTrack0);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(121, CollectionDetailComponent_Conditional_2_Conditional_121_Template, 3, 3, "div", 42)(122, CollectionDetailComponent_Conditional_2_Conditional_122_Template, 6, 3, "div", 43)(123, CollectionDetailComponent_Conditional_2_Conditional_123_Template, 23, 9);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_5_0;
    let tmp_32_0;
    let tmp_44_0;
    const moreMenu_r25 = i0.ɵɵreference(28);
    const fromPicker_r26 = i0.ɵɵreference(89);
    const toPicker_r27 = i0.ɵɵreference(99);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("documentType", "Collection")("heading", ((tmp_5_0 = ctx_r2.collection()) == null ? null : tmp_5_0.title) ?? i0.ɵɵpipeBind1(1, 63, "collections.collection"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.showBreadcrumbs() && ctx_r2.breadcrumbItems().length ? 2 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(5, 65, "collections.collection-detail.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 67, "collections.collection-detail.refresh"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.canEditCollection() ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canDeleteCollection() ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.actionInProgress() === "export")("matTooltip", i0.ɵɵpipeBind1(12, 69, "collections.collection-detail.export"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 71, "collections.collection-detail.export"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r2.showsLockAction() ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matMenuTriggerFor", moreMenu_r25)("matTooltip", i0.ɵɵpipeBind1(18, 73, "collections.collection-detail.more-actions"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 75, "collections.collection-detail.more-actions"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(23, 77, "collections.collection-detail.search"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 79, "collections.collection-detail.search"));
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 81, "collections.collection-detail.share"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.actionInProgress() === "subscribe");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.isSubscribed() ? "notifications_active" : "notifications");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.isSubscribed() ? i0.ɵɵpipeBind1(40, 83, "collections.unsubscribe") : i0.ɵɵpipeBind1(41, 85, "collections.notify-me"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r2.isInClipboard() ? "content_paste_off" : "content_paste");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.isInClipboard() ? i0.ɵɵpipeBind1(47, 87, "collections.remove-from-clipboard") : i0.ɵɵpipeBind1(48, 89, "collections.add-to-clipboard"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r2.actionInProgress() === "export");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(54, 91, "collections.collection-detail.export"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(57, 93, "collections.tab.view"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.members().length > 0 && ctx_r2.totalSize() >= 0 && !ctx_r2.loading() && !ctx_r2.error() ? 59 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("documents", ctx_r2.members())("columns", ctx_r2.memberColumns())("label", i0.ɵɵpipeBind2(61, 95, "collections.collection-detail.members-of", i0.ɵɵpureFunction1(128, _c0, ((tmp_32_0 = ctx_r2.collection()) == null ? null : tmp_32_0.title) ?? "")))("selectable", false)("sort", ctx_r2.memberSort())("pageIndex", ctx_r2.memberPageIndex())("pageSize", ctx_r2.memberPageSize)("totalSize", ctx_r2.totalSize())("hasNextPage", ctx_r2.membersHaveNextPage())("loading", ctx_r2.loading())("error", ctx_r2.error() ? ctx_r2.errorStatus() : null)("errorHeading", ctx_r2.error() ?? "")("emptyHeading", i0.ɵɵpipeBind1(62, 98, "collections.collection-detail.this-collection-is-empty"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(64, 100, "collections.tab.permissions"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_44_0 = ctx_r2.collection()) ? 66 : -1, tmp_44_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.showExternalShares() ? 67 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(69, 102, "collections.tab.history"));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(76, 104, "collections.collection-detail.username"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(78, 106, "collections.collection-detail.filter-by-username"))("ngModel", ctx_r2.filterUsername());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(83, 108, "collections.collection-detail.from"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", fromPicker_r26)("placeholder", i0.ɵɵpipeBind1(86, 112, i0.ɵɵpipeBind1(85, 110, "common.date-mask")))("ngModel", ctx_r2.filterDateFrom());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", fromPicker_r26);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(93, 114, "collections.collection-detail.to"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", toPicker_r27)("placeholder", i0.ɵɵpipeBind1(96, 118, i0.ɵɵpipeBind1(95, 116, "common.date-mask")))("ngModel", ctx_r2.filterDateTo());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", toPicker_r27);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(104, 120, "collections.collection-detail.performed-actions"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.filterAction());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(108, 122, "collections.collection-detail.select-event-actions"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.availableActions());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(114, 124, "collections.collection-detail.event-category"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r2.filterCategory());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(118, 126, "collections.collection-detail.select-event-category"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.availableCategories());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.auditLoading() ? 121 : ctx_r2.filteredAuditEntries().length === 0 ? 122 : 123);
} }
/**
 * The property each member column sorts by on the server: the three columns this page shows, each
 * of which Nuxeo Web UI's collection view also sorts, and `default_content_collection` was checked
 * to accept.
 */
const MEMBER_SORT_FIELDS = {
    title: 'dc:title',
    modified: 'dc:modified',
    lastContributor: 'dc:lastContributor',
};
const MEMBER_PAGE_SIZE = 50;
export class CollectionDetailComponent {
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    route = inject(ActivatedRoute);
    router = inject(Router);
    collectionService = inject(CollectionService);
    detailService = inject(DocumentDetailService);
    directoryService = inject(DirectoryService);
    toast = inject(NxsToastService);
    dialog = inject(MatDialog);
    destroyRef = inject(DestroyRef);
    currentUsername = inject(CURRENT_USERNAME);
    adminAccess = inject(ADMIN_ACCESS_CHECKS);
    appConfig = inject(AppConfigService);
    collection = signal(null, ...(ngDevMode ? [{ debugName: "collection" }] : []));
    /**
     * Whether the collection itself resolved, kept separate from `collection` because a null
     * document has three different meanings — still loading, gone, and unreachable — and the page
     * must not offer actions in the last two. Before this existed, a failed load left `collection`
     * at null and the template's `collection()?.title ?? 'Collection'` rendered the full surface,
     * tabs and actions included, for a collection that did not exist.
     */
    loadState = signal('loading', ...(ngDevMode ? [{ debugName: "loadState" }] : []));
    members = signal([], ...(ngDevMode ? [{ debugName: "members" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    /** Which error state `error` shows: the status of the member request that failed. */
    errorStatus = signal(500, ...(ngDevMode ? [{ debugName: "errorStatus" }] : []));
    totalSize = signal(0, ...(ngDevMode ? [{ debugName: "totalSize" }] : []));
    memberPageSize = MEMBER_PAGE_SIZE;
    memberPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "memberPageIndex" }] : []));
    membersHaveNextPage = signal(false, ...(ngDevMode ? [{ debugName: "membersHaveNextPage" }] : []));
    memberSort = signal(null, ...(ngDevMode ? [{ debugName: "memberSort" }] : []));
    /** The active language as a signal, so the column names follow a language change. */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.currentLang });
    /** The member columns, as the list takes them: translated, each sorted on the server. */
    memberColumns = computed(() => {
        this.currentLang();
        return [
            { key: 'title', label: this.translate.instant('collections.collection-detail.title') },
            { key: 'modified', label: this.translate.instant('collections.collection-detail.modified') },
            {
                key: 'lastContributor',
                label: this.translate.instant('collections.collection-detail.last-contributor'),
            },
        ].map((column) => ({ ...column, sortable: column.key in MEMBER_SORT_FIELDS }));
    }, ...(ngDevMode ? [{ debugName: "memberColumns" }] : []));
    /** Request token for the members load — see `loadMembers`. */
    memberGeneration = 0;
    /**
     * Request token for the collection read and its fallback. Without it a read for a collection
     * navigated away from could land later and install its lock state, and `toggleLock()` would then
     * send the wrong operation to the collection now on screen.
     */
    collectionGeneration = 0;
    /** Token of the lock request that owns `actionInProgress`; navigation invalidates it. */
    lockRequest = 0;
    isLocked = signal(false, ...(ngDevMode ? [{ debugName: "isLocked" }] : []));
    lockOwner = signal(null, ...(ngDevMode ? [{ debugName: "lockOwner" }] : []));
    lockCreated = signal(null, ...(ngDevMode ? [{ debugName: "lockCreated" }] : []));
    isSubscribed = signal(false, ...(ngDevMode ? [{ debugName: "isSubscribed" }] : []));
    actionInProgress = signal(null, ...(ngDevMode ? [{ debugName: "actionInProgress" }] : []));
    clipboardDocs = signal(readClipboardDocs(), ...(ngDevMode ? [{ debugName: "clipboardDocs" }] : []));
    collectionUid = '';
    // History tab state
    auditEntries = signal([], ...(ngDevMode ? [{ debugName: "auditEntries" }] : []));
    auditLoading = signal(false, ...(ngDevMode ? [{ debugName: "auditLoading" }] : []));
    auditTotalSize = signal(0, ...(ngDevMode ? [{ debugName: "auditTotalSize" }] : []));
    auditPageSize = signal(20, ...(ngDevMode ? [{ debugName: "auditPageSize" }] : []));
    auditPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "auditPageIndex" }] : []));
    historyDisplayedColumns = [
        'eventId',
        'eventDate',
        'principalName',
        'category',
        'comment',
        'docLifeCycle',
    ];
    historyLoaded = false;
    activeTabIndex = signal(0, ...(ngDevMode ? [{ debugName: "activeTabIndex" }] : []));
    filterUsername = signal('', ...(ngDevMode ? [{ debugName: "filterUsername" }] : []));
    filterDateFrom = signal(null, ...(ngDevMode ? [{ debugName: "filterDateFrom" }] : []));
    filterDateTo = signal(null, ...(ngDevMode ? [{ debugName: "filterDateTo" }] : []));
    filterAction = signal('', ...(ngDevMode ? [{ debugName: "filterAction" }] : []));
    filterCategory = signal('', ...(ngDevMode ? [{ debugName: "filterCategory" }] : []));
    availableActions = signal([], ...(ngDevMode ? [{ debugName: "availableActions" }] : []));
    availableCategories = signal([], ...(ngDevMode ? [{ debugName: "availableCategories" }] : []));
    eventTypeLabelMap = new Map();
    eventCategoryLabelMap = new Map();
    sortActive = signal('', ...(ngDevMode ? [{ debugName: "sortActive" }] : []));
    sortDirection = signal('', ...(ngDevMode ? [{ debugName: "sortDirection" }] : []));
    breadcrumbPathCache = null;
    breadcrumbItemsCache = [];
    /** Rendered by ID, so the product shows Satori's and a host without it the built-in one. */
    breadcrumbsId = NXS_PRIMITIVE_IDS.breadcrumbs;
    isInClipboard = computed(() => this.clipboardDocs().some((d) => d.uid === this.collectionUid), ...(ngDevMode ? [{ debugName: "isInClipboard" }] : []));
    canEditCollection = computed(() => canShowWriteDocumentAction(this.collection()), ...(ngDevMode ? [{ debugName: "canEditCollection" }] : []));
    canDeleteCollection = computed(() => canShowRemoveDocumentAction(this.collection()), ...(ngDevMode ? [{ debugName: "canDeleteCollection" }] : []));
    /**
     * Write holders may lock; anyone who can read a locked collection sees that it is, and by whom.
     * Nuxeo's default lock policy takes Write on a locked document away from everyone but its owner
     * and administrators, so `canEditCollection` also decides who may unlock. Never offered on a
     * version, an immutable document or the repository root, as in Web UI.
     */
    showsLockAction = computed(() => {
        // Until the current read lands, `collection()` still holds the previous document.
        if (this.loadState() !== 'loaded')
            return false;
        const col = this.collection();
        if (col?.facets?.includes('Immutable') || col?.type === 'Root')
            return false;
        return this.isLocked() || this.canEditCollection();
    }, ...(ngDevMode ? [{ debugName: "showsLockAction" }] : []));
    browseContext = inject(BrowseContextService);
    breadcrumbItems = computed(() => {
        const col = this.collection();
        if (!col?.path)
            return [];
        if (col.path === this.breadcrumbPathCache) {
            return this.breadcrumbItemsCache;
        }
        const segments = col.path.split('/').filter(Boolean);
        segments.pop();
        this.breadcrumbPathCache = col.path;
        let accumulated = '/browse';
        this.breadcrumbItemsCache = segments.map((s) => {
            accumulated += `/${s}`;
            return { label: decodeNuxeoPathSegment(s), routerLink: accumulated };
        });
        return this.breadcrumbItemsCache;
    }, ...(ngDevMode ? [{ debugName: "breadcrumbItems" }] : []));
    showBreadcrumbs = computed(() => {
        const col = this.collection();
        if (!col?.path)
            return false;
        return shouldShowUserWorkspaceBreadcrumbs(col.path, this.currentUsername(), this.adminAccess.isAdministrator());
    }, ...(ngDevMode ? [{ debugName: "showBreadcrumbs" }] : []));
    /** The collection's local and inherited entries: the `nxs-` panel, resolved by its ID. */
    permissionsPanelId = NXS_PERMISSIONS_PANEL_ID;
    /** The panel's writes can change the external shares this tab lists itself. */
    onPermissionsChanged = () => this.loadCollection();
    /**
     * Web UI's external-user card: the collection's own pending and effective shares. An inherited
     * share is the parent's to edit, and an archived one has expired.
     */
    externalAces = computed(() => {
        const acls = this.collection()?.contextParameters?.['acls'];
        if (!acls)
            return [];
        return acls
            .filter((acl) => acl.name !== 'inherited')
            .flatMap((acl) => acl.aces.map((ace) => ({ ...ace, aclName: acl.name })))
            .filter((ace) => ace.externalUser &&
            ace.granted &&
            (ace.status === 'pending' || ace.status === 'effective'));
    }, ...(ngDevMode ? [{ debugName: "externalAces" }] : []));
    /** Web UI's `org.nuxeo.web.ui.permissions.externalUsers`, on unless a package turns it off. */
    showExternalShares = computed(() => this.appConfig.featureToggle('permissions.externalUsers', true), ...(ngDevMode ? [{ debugName: "showExternalShares" }] : []));
    canManagePermissions = computed(() => canManageDocumentPermissions(this.collection()), ...(ngDevMode ? [{ debugName: "canManagePermissions" }] : []));
    constructor() {
        this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            this.releaseLockRequest();
            this.collectionUid = params.get('uid') ?? '';
            this.historyLoaded = false;
            if (this.collectionUid) {
                this.loadCollection();
                this.loadMembers();
            }
        });
    }
    /** Retry after a transport or permission failure. Not offered for `not-found`, which retrying cannot change. */
    retryLoad() {
        this.loadCollection();
    }
    goToCollections() {
        void this.router.navigateByUrl('/collections');
    }
    loadCollection() {
        const generation = ++this.collectionGeneration;
        const requestedUid = this.collectionUid;
        const isCurrent = () => generation === this.collectionGeneration && requestedUid === this.collectionUid;
        this.loadState.set('loading');
        this.isLocked.set(false);
        this.lockOwner.set(null);
        this.lockCreated.set(null);
        this.detailService
            .getFullDocument(requestedUid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (!isCurrent())
                    return;
                this.collection.set(doc);
                this.loadState.set('loaded');
                this.syncActionStates(doc);
                if (this.activeTabIndex() === 2 && !this.historyLoaded) {
                    this.loadAuditLog();
                }
            },
            error: () => {
                if (!isCurrent())
                    return;
                this.collectionService
                    .getById(requestedUid)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (doc) => {
                        if (!isCurrent())
                            return;
                        this.collection.set(doc);
                        this.loadState.set('loaded');
                        this.syncActionStates(doc);
                        if (this.activeTabIndex() === 2 && !this.historyLoaded) {
                            this.loadAuditLog();
                        }
                    },
                    // Both reads failed. A 404 means the collection is genuinely absent — a mistyped,
                    // stale or deleted link — and is reported as such; anything else is a transport or
                    // permission failure the user can retry, and saying "does not exist" there would be
                    // a guess. Either way the page must stop pretending it loaded something.
                    error: (err) => {
                        if (!isCurrent())
                            return;
                        this.collection.set(null);
                        this.loadState.set(err?.status === 404 ? 'not-found' : 'error');
                    },
                });
            },
        });
    }
    syncActionStates(doc) {
        this.isLocked.set(!!(doc.lockOwner || doc.lockCreated));
        this.lockOwner.set(doc.lockOwner ?? null);
        this.lockCreated.set(doc.lockCreated ?? null);
        const subs = doc.contextParameters?.subscribedNotifications;
        this.isSubscribed.set(Array.isArray(subs) && subs.length > 0);
    }
    loadMembers() {
        // Claimed at request start, and checked on BOTH callbacks.
        //
        // Navigating A -> B starts two member requests; if B resolves first and A lands afterwards, A
        // overwrote `members` and `totalSize` with the previous collection's data.
        //
        // The uid is captured as well as the counter: the route can change between request and response,
        // and the uid is what the user is actually looking at.
        const generation = ++this.memberGeneration;
        const requestedUid = this.collectionUid;
        this.loading.set(true);
        this.error.set(null);
        const sort = this.memberSort();
        const sortBy = sort ? MEMBER_SORT_FIELDS[sort.key] : undefined;
        this.collectionService
            .getCollectionMembers(requestedUid, MEMBER_PAGE_SIZE, {
            currentPageIndex: this.memberPageIndex(),
            sort: sort && sortBy ? [{ sortBy, sortOrder: sort.direction === 'asc' ? 'ASC' : 'DESC' }] : [],
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                if (generation !== this.memberGeneration || requestedUid !== this.collectionUid)
                    return;
                this.members.set(res.entries);
                this.totalSize.set(res.totalSize);
                this.membersHaveNextPage.set(res.isNextPageAvailable === true);
                this.loading.set(false);
            },
            error: (err) => {
                // Guarded too, and it has to clear `loading` only for the request that still owns it — a
                // stale failure would otherwise show an error over a newer collection's results. The
                // superseding call already set `loading` true for itself.
                if (generation !== this.memberGeneration || requestedUid !== this.collectionUid)
                    return;
                this.errorStatus.set(nxsErrorStatus(err));
                this.error.set(this.translate.instant('collections.message.failed-to-load-collection-contents'));
                this.loading.set(false);
            },
        });
    }
    /** Another page of members, in the same order. */
    goToMemberPage(pageIndex) {
        if (pageIndex < 0 || pageIndex === this.memberPageIndex())
            return;
        this.memberPageIndex.set(pageIndex);
        this.loadMembers();
    }
    /** A new order starts from the first page. */
    onMemberSortChange(sort) {
        this.memberSort.set(sort);
        this.memberPageIndex.set(0);
        this.loadMembers();
    }
    onRowClick(doc) {
        void this.router.navigateByUrl(`/doc/${doc.uid}`);
    }
    // --- Actions ---
    editCollection() {
        const col = this.collection();
        if (!col)
            return;
        if (hasDocumentPermissionsEnricher(col) && !canWriteDocument(col)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        const dialogRef = this.dialog.open(EditCollectionDialogComponent, {
            data: { document: col },
            width: '560px',
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updatedDoc) => {
            if (updatedDoc) {
                this.collection.set(updatedDoc);
                this.browseContext.requestTreeRefresh();
                this.toast.show(this.translate.instant('browse.message.collection-updated'));
            }
        });
    }
    toggleLock() {
        if (this.actionInProgress() || !this.showsLockAction())
            return;
        if (!this.canEditCollection()) {
            this.toast.error(this.translate.instant(this.isLocked() ? 'common.lock.locked-by-another-user' : PERMISSION_DENIED_KEY));
            return;
        }
        // Captured before the request: the page is reused across `:uid` changes, so when the response
        // lands `collectionUid` and `isLocked()` may describe another collection.
        const uid = this.collectionUid;
        const wasLocked = this.isLocked();
        const request = ++this.lockRequest;
        this.actionInProgress.set('lock');
        const op = wasLocked
            ? this.detailService.unlockDocument(uid)
            : this.detailService.lockDocument(uid);
        op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (updated) => {
                if (request !== this.lockRequest)
                    return;
                this.actionInProgress.set(null);
                if (uid !== this.collectionUid)
                    return;
                this.isLocked.set(!wasLocked);
                // Nuxeo records the caller as the lock owner; naming a fixed account here would
                // tell every user someone else held their own lock.
                this.lockOwner.set(wasLocked ? null : (updated?.lockOwner ?? this.currentUsername() ?? null));
                this.lockCreated.set(wasLocked ? null : (updated?.lockCreated ?? new Date().toISOString()));
                this.toast.show(this.translate.instant(wasLocked
                    ? 'collections.message.collection-unlocked'
                    : 'collections.message.collection-locked'));
            },
            error: (err) => {
                if (request !== this.lockRequest)
                    return;
                this.actionInProgress.set(null);
                if (uid !== this.collectionUid)
                    return;
                this.toast.error(this.translate.instant(this.lockRefusalKey(err, wasLocked)));
            },
        });
    }
    /**
     * On navigation, a lock request for the previous collection stops owning the busy flag, so the
     * new one's controls are not held disabled by it, and its late response cannot clear a newer one.
     */
    releaseLockRequest() {
        this.lockRequest += 1;
        if (this.actionInProgress() === 'lock')
            this.actionInProgress.set(null);
    }
    /** "Locked by {owner} on {date}", or null while unlocked. */
    lockTooltip() {
        const owner = this.lockOwner();
        const created = this.lockCreated();
        if (!this.isLocked() || !owner || !created)
            return null;
        const date = new Date(created).toLocaleDateString(this.locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
        return this.translate.instant('common.lock.locked-by', { owner, date });
    }
    lockRefusalKey(err, wasLocked) {
        switch (err?.status) {
            case 403:
                return wasLocked ? 'common.lock.unlock-no-permission' : 'common.lock.lock-no-permission';
            case 409:
                return wasLocked ? 'common.lock.locked-by-another-user' : 'common.lock.already-locked';
            default:
                return 'browse.message.action-failed';
        }
    }
    toggleSubscription() {
        if (this.actionInProgress())
            return;
        this.actionInProgress.set('subscribe');
        const op = this.isSubscribed()
            ? this.detailService.unsubscribe(this.collectionUid)
            : this.detailService.subscribe(this.collectionUid);
        op.subscribe({
            next: () => {
                const wasSub = this.isSubscribed();
                this.isSubscribed.set(!wasSub);
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant(wasSub
                    ? 'collections.message.notifications-disabled'
                    : 'collections.message.notifications-enabled'));
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('browse.message.action-failed'));
            },
        });
    }
    deleteCollection() {
        const col = this.collection();
        if (this.actionInProgress())
            return;
        if (col && hasDocumentPermissionsEnricher(col) && !canRemoveDocument(col)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-collection'),
                message: this.translate.instant('confirm.delete-collection-question'),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.actionInProgress.set('trash');
            this.detailService
                .trashDocument(this.collectionUid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('browse.message.collection-moved-to-trash'));
                    this.browseContext.requestTreeRefresh();
                    const col = this.collection();
                    const redirectUrl = col?.path ? postTrashBrowseRouterUrl(col.path) : '/collections';
                    void this.router.navigateByUrl(redirectUrl);
                },
                error: (err) => {
                    this.actionInProgress.set(null);
                    this.toast.error(isPermissionDeniedError(err)
                        ? this.translate.instant(PERMISSION_DENIED_KEY)
                        : this.translate.instant('browse.message.failed-to-delete-collection'));
                },
            });
        });
    }
    toggleClipboard() {
        const current = this.clipboardDocs();
        const col = this.collection();
        if (!col)
            return;
        if (this.isInClipboard()) {
            const updated = current.filter((c) => c.uid !== this.collectionUid);
            this.clipboardDocs.set(updated);
            writeClipboardDocs(updated);
            this.toast.show(this.translate.instant('collections.message.removed-from-clipboard'));
        }
        else {
            const updated = [...current, { uid: col.uid, title: col.title, type: col.type }];
            this.clipboardDocs.set(updated);
            writeClipboardDocs(updated);
            this.toast.show(this.translate.instant('collections.message.added-to-clipboard'));
        }
        window.dispatchEvent(new Event('clipboard-changed'));
    }
    exportCollection() {
        const title = this.collection()?.title ?? 'collection';
        this.dialog.open(ExportDialogComponent, {
            data: {
                documentUid: this.collectionUid,
                documentTitle: title,
                exportFn: (type, uid) => {
                    switch (type) {
                        case 'thumbnail':
                            return this.detailService.fetchThumbnail(uid);
                        case 'pdf':
                            return this.detailService.fetchPdfRendition(uid);
                        case 'zip':
                            return this.collectionService.bulkDownload(uid, `${title}.zip`);
                        case 'xml':
                            return this.detailService.exportXml(uid);
                    }
                },
            },
            width: '440px',
        });
    }
    shareCollection() {
        this.dialog.open(ShareDialogComponent, {
            data: {
                title: this.collection()?.title ?? this.translate.instant('collections.share-fallback-title'),
                url: window.location.href,
            },
            width: '520px',
        });
    }
    permissionLabel(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** The day each date's writer picked, as the panel and the dialogs show it. */
    aceTimeFrame(ace) {
        return nxsAceTimeFrame(ace, (key, params) => this.translate.instant(key, params), this.locale);
    }
    deletePermission(ace) {
        const dialogRef = this.dialog.open(NxsDeletePermissionDialogComponent, {
            width: '560px',
            maxWidth: '95vw',
            role: 'alertdialog',
            data: {
                documentUid: this.collectionUid,
                ace,
                acl: ace.aclName,
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deleted) => {
            if (deleted) {
                this.loadCollection();
                this.toast.show(this.translate.instant('browse.message.permission-deleted'));
            }
        });
    }
    displayUsername(ace) {
        return ace.username.replace(/^transient\//, '');
    }
    editExternalPermission(ace) {
        this.withVisiblePermissions((permissions) => this.dialog
            .open(NxsUpdatePermissionDialogComponent, {
            maxWidth: '95vw',
            data: {
                documentUid: this.collectionUid,
                ace,
                permissions,
            },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updated) => {
            if (updated)
                this.loadCollection();
        }));
    }
    sendNotificationEmail(ace) {
        if (this.actionInProgress())
            return;
        this.actionInProgress.set('notify-' + ace.id);
        this.detailService.sendNotificationEmailForPermission(this.collectionUid, ace.id).subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant('browse.message.notification-email-sent'));
            },
            error: (err) => {
                this.actionInProgress.set(null);
                this.toast.error(isMailSendError(err)
                    ? mailSendFailureMessage('send', (key) => this.translate.instant(key))
                    : this.translate.instant('collections.message.failed-to-send-notification'));
            },
        });
    }
    shareWithExternal() {
        this.withVisiblePermissions((permissions) => this.dialog
            .open(NxsShareExternalDialogComponent, {
            maxWidth: '95vw',
            data: {
                documentUid: this.collectionUid,
                permissions,
            },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((shared) => {
            if (shared)
                this.loadCollection();
        }));
    }
    /**
     * The rights a Collection offers, from the `userVisiblePermissions` enricher — Read,
     * ReadCanCollect, ReadWrite and Everything on a stock server — rather than a fixed list. A
     * failed read leaves the dialogs to their own default.
     */
    withVisiblePermissions(open) {
        const requestedFor = this.collectionUid;
        this.detailService
            .getDocumentPermissions(requestedFor)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (requestedFor !== this.collectionUid)
                    return;
                const visible = doc.contextParameters?.['userVisiblePermissions'];
                open(Array.isArray(visible) ? visible : null);
            },
            error: () => {
                if (requestedFor === this.collectionUid)
                    open(null);
            },
        });
    }
    // --- History tab ---
    filteredAuditEntries = computed(() => {
        let entries = this.auditEntries();
        const username = this.filterUsername();
        const dateFrom = this.filterDateFrom();
        const dateTo = this.filterDateTo();
        const action = this.filterAction();
        const category = this.filterCategory();
        const active = this.sortActive();
        const direction = this.sortDirection();
        if (username) {
            const lower = username.toLowerCase();
            entries = entries.filter((e) => e.principalName.toLowerCase().includes(lower));
        }
        if (dateFrom) {
            const from = dateFrom.getTime();
            entries = entries.filter((e) => new Date(e.eventDate).getTime() >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            entries = entries.filter((e) => new Date(e.eventDate).getTime() <= to.getTime());
        }
        if (action) {
            entries = entries.filter((e) => e.eventId === action);
        }
        if (category) {
            entries = entries.filter((e) => e.category === category);
        }
        if (active && direction) {
            const dir = direction === 'asc' ? 1 : -1;
            const key = active;
            entries = [...entries].sort((a, b) => {
                const va = a[key] ?? '';
                const vb = b[key] ?? '';
                return va < vb ? -dir : va > vb ? dir : 0;
            });
        }
        return entries;
    }, ...(ngDevMode ? [{ debugName: "filteredAuditEntries" }] : []));
    onTabChange(index) {
        this.activeTabIndex.set(index);
        if (index === 2 && !this.historyLoaded) {
            this.loadDirectoryEntries();
            this.loadAuditLog();
        }
    }
    loadDirectoryEntries() {
        forkJoin({
            types: this.directoryService.getEventTypes(),
            categories: this.directoryService.getEventCategories(),
        }).subscribe({
            next: ({ types, categories }) => {
                this.availableActions.set(types);
                this.availableCategories.set(categories);
                this.eventTypeLabelMap = new Map(types.map((t) => [t.id, t.displayLabel]));
                this.eventCategoryLabelMap = new Map(categories.map((c) => [c.id, c.displayLabel]));
            },
        });
    }
    loadAuditLog() {
        if (!this.collectionUid)
            return;
        const collection = this.collection();
        if (!collection) {
            this.auditLoading.set(false);
            return;
        }
        if (!canViewDocumentAuditLog(collection)) {
            this.auditEntries.set([]);
            this.auditTotalSize.set(0);
            this.auditLoading.set(false);
            this.historyLoaded = true;
            return;
        }
        this.auditLoading.set(true);
        this.detailService
            .getAuditLog(this.collectionUid, this.auditPageSize(), this.auditPageIndex())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.auditEntries.set(res.entries);
                this.auditTotalSize.set(res.resultsCount ?? res.totalSize ?? res.entries.length);
                this.auditLoading.set(false);
                this.historyLoaded = true;
            },
            error: () => {
                this.auditLoading.set(false);
                this.historyLoaded = false;
            },
        });
    }
    onAuditPageChange(event) {
        this.auditPageSize.set(event.pageSize);
        this.auditPageIndex.set(event.pageIndex);
        this.loadAuditLog();
    }
    onAuditSort(sort) {
        this.sortActive.set(sort.active);
        this.sortDirection.set(sort.direction);
    }
    eventLabel(eventId) {
        return (this.eventTypeLabelMap.get(eventId) ??
            eventId.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()));
    }
    categoryLabel(category) {
        return (this.eventCategoryLabelMap.get(category) ??
            category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (c) => c.toUpperCase())
                .replace('event ', '')
                .replace(' Category', ''));
    }
    avatarColor = avatarColor;
    static ɵfac = function CollectionDetailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CollectionDetailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CollectionDetailComponent, selectors: [["lib-collection-detail"]], features: [i0.ɵɵProvidersFeature([
                provideSatoriDateAdapter(),
                provideTranslatedDatepickerIntl(),
                provideNxsToast(),
                provideNxsThumbnailCache(),
            ])], decls: 3, vars: 1, consts: [["moreMenu", "matMenu"], ["fromPicker", ""], ["toPicker", ""], ["breadcrumbsOutlet", ""], ["permissionsPanelOutlet", ""], [1, "collection-page"], ["role", "status", 1, "collection-unavailable"], [1, "unavailable-icon"], ["role", "heading", "aria-level", "1", 1, "unavailable-title"], [1, "unavailable-detail"], [1, "unavailable-actions"], ["mat-stroked-button", ""], ["mat-stroked-button", "", 3, "click"], [1, "collection-header", 3, "documentType", "heading"], ["nxsFolderHeaderDetail", "", 1, "header-path-row"], [1, "header-actions"], ["mat-icon-button", "", 3, "click", "matTooltip"], ["mat-icon-button", "", 3, "matTooltip"], ["mat-icon-button", "", 3, "disabled", "matTooltip"], ["mat-icon-button", "", 3, "click", "disabled", "matTooltip"], ["mat-icon-button", "", "type", "button", "data-testid", "collection-lock-toggle", "disabledInteractive", "", 3, "disabled", "lock-toggle--active", "matTooltip"], ["mat-icon-button", "", 3, "matMenuTriggerFor", "matTooltip"], ["mat-menu-item", "", 3, "click"], ["mat-menu-item", "", 3, "click", "disabled"], ["animationDuration", "0ms", "mat-stretch-tabs", "false", 1, "collection-tabs", 3, "selectedIndexChange"], [3, "label"], [1, "tab-content"], [1, "result-count"], [1, "members-list", 3, "sortChange", "pageChange", "open", "retry", "documents", "columns", "label", "selectable", "sort", "pageIndex", "pageSize", "totalSize", "hasNextPage", "loading", "error", "errorHeading", "emptyHeading"], [1, "permissions-container"], [1, "perm-section"], [1, "history-container"], [1, "history-filters"], [1, "filter-row"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "filter-field", "filter-field--wide"], ["matInput", "", 3, "ngModelChange", "placeholder", "ngModel"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "filter-field"], ["matInput", "", 3, "ngModelChange", "matDatepicker", "placeholder", "ngModel"], ["matIconSuffix", "", 3, "for"], [3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "history-loading"], [1, "history-empty"], [3, "componentId", "componentInputs"], [3, "items", "label"], ["mat-icon-button", "", "type", "button", "data-testid", "collection-lock-toggle", "disabledInteractive", "", 3, "click", "disabled", "matTooltip"], [3, "documentId", "permissionsChanged"], [1, "perm-section-header"], ["role", "heading", "aria-level", "3", 1, "perm-section-title"], ["mat-button", "", "color", "primary", "type", "button", 1, "perm-action-btn"], [1, "perm-info-bar"], [1, "perm-info-accent"], [1, "perm-empty"], [1, "perm-table"], ["mat-button", "", "color", "primary", "type", "button", 1, "perm-action-btn", 3, "click"], [1, "perm-row-actions"], ["mat-icon-button", "", 3, "click", "matTooltip", "disabled"], ["diameter", "32", 3, "label"], [1, "history-table-wrapper"], ["mat-table", "", "matSort", "", 1, "history-table", 3, "matSortChange", "dataSource"], ["matColumnDef", "eventId"], ["mat-header-cell", "", "mat-sort-header", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "eventDate"], ["matColumnDef", "principalName"], ["matColumnDef", "category"], ["matColumnDef", "comment"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", "class", "comment-cell", 4, "matCellDef"], ["matColumnDef", "docLifeCycle"], ["mat-header-row", "", 4, "matHeaderRowDef", "matHeaderRowDefSticky"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "page", "length", "pageSize", "pageIndex", "pageSizeOptions"], ["mat-header-cell", "", "mat-sort-header", ""], ["mat-cell", ""], [1, "user-cell"], ["size", "24", "aria-hidden", "true", 3, "initials", "category", "borderless"], ["mat-header-cell", ""], ["mat-cell", "", 1, "comment-cell"], ["status", "info", 3, "hideIcon"], ["mat-header-row", ""], ["mat-row", ""]], template: function CollectionDetailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 5);
            i0.ɵɵconditionalCreate(1, CollectionDetailComponent_Conditional_1_Template, 15, 11, "div", 6)(2, CollectionDetailComponent_Conditional_2_Template, 124, 130);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loadState() === "not-found" || ctx.loadState() === "error" ? 1 : 2);
        } }, dependencies: [ExtensionOutletComponent,
            NxsBreadcrumbsComponent,
            NxsDocumentListComponent,
            NxsFolderHeaderComponent,
            NxsPermissionsPanelComponent,
            NxsSpinnerComponent,
            FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatIconModule, i2.MatIcon, MatButtonModule, i3.MatButton, i3.MatIconButton, MatTabsModule, i4.MatTab, i4.MatTabGroup, MatTooltipModule, i5.MatTooltip, MatMenuModule, i6.MatMenu, i6.MatMenuItem, i6.MatMenuTrigger, MatDialogModule,
            MatTableModule, i7.MatTable, i7.MatHeaderCellDef, i7.MatHeaderRowDef, i7.MatColumnDef, i7.MatCellDef, i7.MatRowDef, i7.MatHeaderCell, i7.MatCell, i7.MatHeaderRow, i7.MatRow, MatSortModule, i8.MatSort, i8.MatSortHeader, MatPaginatorModule, i9.MatPaginator, MatFormFieldModule, i10.MatFormField, i10.MatLabel, i10.MatSuffix, MatInputModule, i11.MatInput, MatSelectModule, i12.MatSelect, i12.MatOption, MatDatepickerModule, i13.MatDatepicker, i13.MatDatepickerInput, i13.MatDatepickerToggle, SatAvatarModule, i14.SatAvatar, SatTagModule, i15.SatStatusTag, DateMaskPipe,
            TranslatePipe,
            DatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  background: #fff;\n}\n\n.collection-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n//[_ngcontent-%COMP%]   Shown[_ngcontent-%COMP%]   instead[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   collection[_ngcontent-%COMP%]   surface[_ngcontent-%COMP%]   when[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   document[_ngcontent-%COMP%]   did[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   resolve[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   stale[_ngcontent-%COMP%]   or\n//[_ngcontent-%COMP%]   mistyped[_ngcontent-%COMP%]   link[_ngcontent-%COMP%]   cannot[_ngcontent-%COMP%]   present[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   working-looking[_ngcontent-%COMP%]   collection[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   actions[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   it.\n.collection-unavailable[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 48px 24px;\n  text-align: center;\n\n  .unavailable-icon {\n    width: 48px;\n    height: 48px;\n    font-size: 48px;\n    color: var(--mat-sys-on-surface-variant, #5f6368);\n  }\n\n  .unavailable-title {\n    font-size: 20px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface, #202124);\n  }\n\n  .unavailable-detail {\n    max-width: 420px;\n    color: var(--mat-sys-on-surface-variant, #5f6368);\n  }\n\n  .unavailable-actions {\n    display: flex;\n    gap: 8px;\n    margin-top: 8px;\n  }\n}\n\n//[_ngcontent-%COMP%]   Header\n.collection-header[_ngcontent-%COMP%] {\n  --nxs-folder-header-heading-size: 16px;\n  padding: 12px 24px;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.header-path-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 12px;\n  color: #888;\n  margin-top: 2px;\n}\n\nsat-breadcrumbs[_ngcontent-%COMP%] {\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex-shrink: 0;\n\n  button {\n    color: #555;\n\n    &:hover {\n      color: var(--mat-sys-on-surface);\n    }\n\n    &[disabled] {\n      color: #ccc;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Tabs\n.collection-tabs[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n  .collection-tabs {\n  .mat-mdc-tab-header {\n    border-bottom: 1px solid #e0e0e0;\n    padding-left: 24px;\n  }\n\n  .mat-mdc-tab-labels {\n    gap: 8px;\n  }\n\n  .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    overflow: hidden;\n  }\n\n  .mat-mdc-tab-body-content {\n    overflow: auto;\n  }\n}\n\n.tab-content[_ngcontent-%COMP%] {\n  padding: 20px 24px;\n}\n\n.tab-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 48px 0;\n}\n\n.tab-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 48px 0;\n  color: #999;\n  gap: 8px;\n\n  .empty-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n.tab-placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 64px 0;\n  color: #bbb;\n  gap: 8px;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   Results\n.result-count[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #666;\n  padding-bottom: 12px;\n}\n\n.members-table-wrapper[_ngcontent-%COMP%] {\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: auto;\n}\n\n.members-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n\n  thead {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n  }\n\n  th {\n    text-align: left;\n    padding: 12px 16px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n  }\n\n  td {\n    padding: 10px 16px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  .col-title {\n    width: 45%;\n  }\n\n  .col-modified {\n    width: 25%;\n  }\n\n  .col-contributor {\n    width: 30%;\n  }\n}\n\n.member-row[_ngcontent-%COMP%] {\n  transition: background-color 0.15s;\n  cursor: pointer;\n\n  &:hover {\n    background: #f8f9fe;\n  }\n}\n\n.cell-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-thumb[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 3px;\n  object-fit: cover;\n  flex-shrink: 0;\n}\n\n.doc-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #ffa726;\n  flex-shrink: 0;\n}\n\n.doc-name[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.cell-contributor[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.contributor-avatar[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  background: #e65100;\n  color: #fff;\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n//[_ngcontent-%COMP%]   Permissions[_ngcontent-%COMP%]   tab\n.permissions-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px 24px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.perm-section[_ngcontent-%COMP%] {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n.perm-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.perm-section-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.perm-action-btn[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: #ef5350;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty[_ngcontent-%COMP%] {\n  padding: 24px 20px;\n  text-align: center;\n  font-size: 13px;\n  color: #999;\n}\n\n.perm-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.perm-row-actions[_ngcontent-%COMP%] {\n  text-align: right;\n  white-space: nowrap;\n\n  button {\n    color: #999;\n\n    &:hover {\n      color: #555;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   History[_ngcontent-%COMP%]   tab\n.history-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.history-filters[_ngcontent-%COMP%] {\n  padding: 16px 20px 8px;\n  background: #fff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.filter-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 8px;\n}\n\n.filter-field[_ngcontent-%COMP%] {\n  flex: 1;\n\n  &--wide {\n    flex: 1;\n  }\n\n  ::ng-deep .mat-mdc-form-field-subscript-wrapper {\n    display: none;\n  }\n\n  ::ng-deep .mat-mdc-text-field-wrapper {\n    padding: 0 12px;\n  }\n\n  ::ng-deep .mat-mdc-form-field-infix {\n    min-height: 40px;\n    padding-top: 8px !important;\n    padding-bottom: 8px !important;\n  }\n\n  ::ng-deep .mat-mdc-floating-label {\n    font-size: 13px;\n  }\n\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading,\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch,\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing {\n    border-color: #d0d0d0;\n  }\n\n  ::ng-deep input.mat-mdc-input-element {\n    font-size: 13px;\n  }\n\n  ::ng-deep .mat-mdc-select-trigger {\n    font-size: 13px;\n  }\n}\n\n.history-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px;\n  flex: 1;\n}\n\n.history-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 40px;\n  color: #999;\n  gap: 8px;\n  flex: 1;\n\n  mat-icon {\n    font-size: 40px;\n    width: 40px;\n    height: 40px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n.history-table-wrapper[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: auto;\n  min-height: 0;\n}\n\n.history-table[_ngcontent-%COMP%] {\n  width: 100%;\n\n  .mat-mdc-header-cell {\n    font-weight: 600;\n    font-size: 12px;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 2px solid #e0e0e0;\n    padding: 12px 16px;\n  }\n\n  .mat-mdc-cell {\n    font-size: 13px;\n    color: #333;\n    padding: 10px 16px;\n    border-bottom: 1px solid #f0f0f0;\n  }\n\n  .mat-mdc-row:hover {\n    background: #f8f9fe;\n  }\n}\n\n.user-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.comment-cell[_ngcontent-%COMP%] {\n  max-width: 240px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.state-badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 500;\n  color: var(--mat-sys-on-primary-container);\n  background: var(--mat-sys-primary-container);\n  text-transform: capitalize;\n}\n\n  .history-container .mat-mdc-paginator {\n  flex-shrink: 0;\n  border-top: 1px solid #e0e0e0;\n  font-size: 12px;\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   highlighted[_ngcontent-%COMP%]   padlock[_ngcontent-%COMP%]   Web[_ngcontent-%COMP%]   UI[_ngcontent-%COMP%]   shows[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   locked[_ngcontent-%COMP%]   document[_ngcontent-%COMP%], only[_ngcontent-%COMP%]   where[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   user[_ngcontent-%COMP%]   may[_ngcontent-%COMP%]   unlock[_ngcontent-%COMP%]   it.\n.header-actions[_ngcontent-%COMP%]   button.lock-toggle--active[_ngcontent-%COMP%]:not(.mat-mdc-button-disabled) {\n  color: var(--mat-sys-primary);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CollectionDetailComponent, [{
        type: Component,
        args: [{ selector: 'lib-collection-detail', standalone: true, providers: [
                    provideSatoriDateAdapter(),
                    provideTranslatedDatepickerIntl(),
                    provideNxsToast(),
                    provideNxsThumbnailCache(),
                ], imports: [
                    DateMaskPipe,
                    ExtensionOutletComponent,
                    NxsBreadcrumbsComponent,
                    NxsDocumentListComponent,
                    NxsFolderHeaderComponent,
                    NxsPermissionsPanelComponent,
                    NxsSpinnerComponent,
                    TranslatePipe,
                    DatePipe,
                    FormsModule,
                    MatIconModule,
                    MatButtonModule,
                    MatTabsModule,
                    MatTooltipModule,
                    MatMenuModule,
                    MatDialogModule,
                    MatTableModule,
                    MatSortModule,
                    MatPaginatorModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    SatAvatarModule,
                    SatTagModule,
                ], template: "<div class=\"collection-page\">\n  @if (loadState() === 'not-found' || loadState() === 'error') {\n    <div class=\"collection-unavailable\" role=\"status\">\n      <mat-icon class=\"unavailable-icon\">\n        {{ loadState() === 'not-found' ? 'search_off' : 'error_outline' }}\n      </mat-icon>\n      <div class=\"unavailable-title\" role=\"heading\" aria-level=\"1\">\n        {{\n          loadState() === 'not-found'\n            ? ('collections.collection-not-found' | translate)\n            : ('collections.collection-unavailable' | translate)\n        }}\n      </div>\n      <div class=\"unavailable-detail\">\n        @if (loadState() === 'not-found') {\n          {{ 'collections.collection-detail.this-collection-does-not-exist-or' | translate }}\n        } @else {\n          {{ 'collections.collection-detail.the-collection-could-not-be-loaded' | translate }}\n        }\n      </div>\n      <div class=\"unavailable-actions\">\n        @if (loadState() === 'error') {\n          <button mat-stroked-button (click)=\"retryLoad()\">\n            {{ 'collections.collection-detail.try-again' | translate }}\n          </button>\n        }\n        <button mat-stroked-button (click)=\"goToCollections()\">\n          {{ 'collections.collection-detail.back-to-collections' | translate }}\n        </button>\n      </div>\n    </div>\n  } @else {\n    <!-- Header -->\n    <nxs-folder-header\n      class=\"collection-header\"\n      [documentType]=\"'Collection'\"\n      [heading]=\"collection()?.title ?? ('collections.collection' | translate)\"\n    >\n      @if (showBreadcrumbs() && breadcrumbItems().length) {\n        <div class=\"header-path-row\" nxsFolderHeaderDetail>\n          @let trailLabel = 'collections.collection-detail.breadcrumbs' | translate;\n          <lib-extension-outlet\n            #breadcrumbsOutlet\n            [componentId]=\"breadcrumbsId\"\n            [componentInputs]=\"{ items: breadcrumbItems(), label: trailLabel }\"\n          />\n          @if (breadcrumbsOutlet.unresolved()) {\n            <nxs-breadcrumbs [items]=\"breadcrumbItems()\" [label]=\"trailLabel\" />\n          }\n        </div>\n      }\n\n      <div class=\"header-actions\">\n        <button\n          mat-icon-button\n          [matTooltip]=\"'collections.collection-detail.refresh' | translate\"\n          [attr.aria-label]=\"'collections.collection-detail.refresh' | translate\"\n          (click)=\"loadMembers()\"\n        >\n          <mat-icon>sync</mat-icon>\n        </button>\n        @if (canEditCollection()) {\n          <button\n            mat-icon-button\n            [matTooltip]=\"'collections.collection-detail.edit' | translate\"\n            [attr.aria-label]=\"'collections.collection-detail.edit' | translate\"\n            (click)=\"editCollection()\"\n          >\n            <mat-icon>edit</mat-icon>\n          </button>\n        }\n        @if (canDeleteCollection()) {\n          <button\n            mat-icon-button\n            (click)=\"deleteCollection()\"\n            [disabled]=\"actionInProgress() === 'trash'\"\n            [matTooltip]=\"'collections.collection-detail.delete' | translate\"\n            [attr.aria-label]=\"'collections.collection-detail.delete' | translate\"\n          >\n            <mat-icon>delete</mat-icon>\n          </button>\n        }\n        <button\n          mat-icon-button\n          (click)=\"exportCollection()\"\n          [disabled]=\"actionInProgress() === 'export'\"\n          [matTooltip]=\"'collections.collection-detail.export' | translate\"\n          [attr.aria-label]=\"'collections.collection-detail.export' | translate\"\n        >\n          <mat-icon>download</mat-icon>\n        </button>\n        @if (showsLockAction()) {\n          <!-- An icon button rather than a menu item: `disabledInteractive` keeps a reader's\n               disabled Unlock focusable, so \"Locked by \u2026\" is reachable from the keyboard, which a\n               disabled menu item is not. -->\n          <button\n            mat-icon-button\n            type=\"button\"\n            data-testid=\"collection-lock-toggle\"\n            (click)=\"toggleLock()\"\n            [disabled]=\"actionInProgress() === 'lock' || !canEditCollection()\"\n            disabledInteractive\n            [class.lock-toggle--active]=\"isLocked() && canEditCollection()\"\n            [matTooltip]=\"\n              lockTooltip() ??\n              (isLocked() ? ('collections.unlock' | translate) : ('collections.lock' | translate))\n            \"\n            [attr.aria-label]=\"\n              isLocked() ? ('collections.unlock' | translate) : ('collections.lock' | translate)\n            \"\n          >\n            <mat-icon>{{ isLocked() ? 'lock' : 'lock_open' }}</mat-icon>\n          </button>\n        }\n        <button\n          mat-icon-button\n          [matMenuTriggerFor]=\"moreMenu\"\n          [matTooltip]=\"'collections.collection-detail.more-actions' | translate\"\n          [attr.aria-label]=\"'collections.collection-detail.more-actions' | translate\"\n        >\n          <mat-icon>more_vert</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          [matTooltip]=\"'collections.collection-detail.search' | translate\"\n          [attr.aria-label]=\"'collections.collection-detail.search' | translate\"\n        >\n          <mat-icon>search</mat-icon>\n        </button>\n      </div>\n\n      <mat-menu #moreMenu=\"matMenu\">\n        <button mat-menu-item (click)=\"shareCollection()\">\n          <mat-icon>share</mat-icon>\n          <span>{{ 'collections.collection-detail.share' | translate }}</span>\n        </button>\n        <button\n          mat-menu-item\n          (click)=\"toggleSubscription()\"\n          [disabled]=\"actionInProgress() === 'subscribe'\"\n        >\n          <mat-icon>{{ isSubscribed() ? 'notifications_active' : 'notifications' }}</mat-icon>\n          <span>{{\n            isSubscribed()\n              ? ('collections.unsubscribe' | translate)\n              : ('collections.notify-me' | translate)\n          }}</span>\n        </button>\n        <button mat-menu-item (click)=\"toggleClipboard()\">\n          <mat-icon>{{ isInClipboard() ? 'content_paste_off' : 'content_paste' }}</mat-icon>\n          <span>{{\n            isInClipboard()\n              ? ('collections.remove-from-clipboard' | translate)\n              : ('collections.add-to-clipboard' | translate)\n          }}</span>\n        </button>\n        <button\n          mat-menu-item\n          (click)=\"exportCollection()\"\n          [disabled]=\"actionInProgress() === 'export'\"\n        >\n          <mat-icon>download</mat-icon>\n          <span>{{ 'collections.collection-detail.export' | translate }}</span>\n        </button>\n      </mat-menu>\n    </nxs-folder-header>\n\n    <!-- Tabs -->\n    <mat-tab-group\n      class=\"collection-tabs\"\n      animationDuration=\"0ms\"\n      mat-stretch-tabs=\"false\"\n      (selectedIndexChange)=\"onTabChange($event)\"\n    >\n      <mat-tab [label]=\"'collections.tab.view' | translate\">\n        <div class=\"tab-content\">\n          @if (members().length > 0 && totalSize() >= 0 && !loading() && !error()) {\n            <div class=\"result-count\">\n              {{\n                (totalSize() === 1 ? 'common.count.result-one' : 'common.count.result-many')\n                  | translate: { count: totalSize() }\n              }}\n            </div>\n          }\n          <nxs-document-list\n            class=\"members-list\"\n            [documents]=\"members()\"\n            [columns]=\"memberColumns()\"\n            [label]=\"\n              'collections.collection-detail.members-of'\n                | translate: { name: collection()?.title ?? '' }\n            \"\n            [selectable]=\"false\"\n            [sort]=\"memberSort()\"\n            [pageIndex]=\"memberPageIndex()\"\n            [pageSize]=\"memberPageSize\"\n            [totalSize]=\"totalSize()\"\n            [hasNextPage]=\"membersHaveNextPage()\"\n            [loading]=\"loading()\"\n            [error]=\"error() ? errorStatus() : null\"\n            [errorHeading]=\"error() ?? ''\"\n            [emptyHeading]=\"'collections.collection-detail.this-collection-is-empty' | translate\"\n            (sortChange)=\"onMemberSortChange($event)\"\n            (pageChange)=\"goToMemberPage($event)\"\n            (open)=\"onRowClick($event)\"\n            (retry)=\"loadMembers()\"\n          />\n        </div>\n      </mat-tab>\n\n      <mat-tab [label]=\"'collections.tab.permissions' | translate\">\n        <div class=\"permissions-container\">\n          <!-- Local and inherited permissions: the nxs- panel, resolved by its registered ID so a\n               customer library can re-register a replacement. -->\n          @if (collection(); as current) {\n            <lib-extension-outlet\n              #permissionsPanelOutlet\n              [componentId]=\"permissionsPanelId\"\n              [componentInputs]=\"{\n                documentId: current.uid,\n                permissionsChanged: onPermissionsChanged,\n              }\"\n            />\n            @if (permissionsPanelOutlet.unresolved()) {\n              <nxs-permissions-panel\n                [documentId]=\"current.uid\"\n                [permissionsChanged]=\"onPermissionsChanged\"\n              />\n            }\n          }\n\n          <!-- Permissions Assigned to External Users -->\n          @if (showExternalShares()) {\n            <section class=\"perm-section\">\n              <div class=\"perm-section-header\">\n                <div class=\"perm-section-title\" role=\"heading\" aria-level=\"3\">\n                  {{\n                    'collections.collection-detail.permissions-assigned-to-external-users'\n                      | translate\n                  }}\n                </div>\n                @if (canManagePermissions()) {\n                  <button\n                    mat-button\n                    color=\"primary\"\n                    type=\"button\"\n                    class=\"perm-action-btn\"\n                    (click)=\"shareWithExternal()\"\n                  >\n                    {{ 'collections.collection-detail.new' | translate }}\n                  </button>\n                }\n              </div>\n              <div class=\"perm-info-bar\">\n                <span class=\"perm-info-accent\"></span>\n                <p>\n                  {{\n                    'collections.collection-detail.sharing-to-external-users-does-not' | translate\n                  }}\n                </p>\n              </div>\n              @if (externalAces().length === 0) {\n                <div class=\"perm-empty\">\n                  {{ 'collections.collection-detail.the-document-is-not-shared-with' | translate }}\n                </div>\n              } @else {\n                <table class=\"perm-table\">\n                  <thead>\n                    <tr>\n                      <th>{{ 'collections.collection-detail.user' | translate }}</th>\n                      <th>{{ 'collections.collection-detail.right' | translate }}</th>\n                      <th>{{ 'collections.collection-detail.time-frame' | translate }}</th>\n                      <th>{{ 'collections.collection-detail.granted-by' | translate }}</th>\n                      @if (canManagePermissions()) {\n                        <th>{{ 'collections.collection-detail.actions' | translate }}</th>\n                      }\n                    </tr>\n                  </thead>\n                  <tbody>\n                    @for (ace of externalAces(); track ace.id) {\n                      <tr>\n                        <td>{{ displayUsername(ace) }}</td>\n                        <td>{{ permissionLabel(ace.permission) }}</td>\n                        <td>{{ aceTimeFrame(ace) }}</td>\n                        <td>{{ ace.creator ?? '\u2014' }}</td>\n                        @if (canManagePermissions()) {\n                          <td class=\"perm-row-actions\">\n                            <button\n                              mat-icon-button\n                              [matTooltip]=\"'collections.collection-detail.edit' | translate\"\n                              [attr.aria-label]=\"\n                                'collections.collection-detail.edit-permission' | translate\n                              \"\n                              (click)=\"editExternalPermission(ace)\"\n                            >\n                              <mat-icon>edit</mat-icon>\n                            </button>\n                            <button\n                              mat-icon-button\n                              [matTooltip]=\"\n                                'collections.collection-detail.send-notification-email' | translate\n                              \"\n                              [attr.aria-label]=\"\n                                'collections.collection-detail.send-notification' | translate\n                              \"\n                              [disabled]=\"actionInProgress() === 'notify-' + ace.id\"\n                              (click)=\"sendNotificationEmail(ace)\"\n                            >\n                              <mat-icon>send</mat-icon>\n                            </button>\n                            <button\n                              mat-icon-button\n                              [matTooltip]=\"'collections.collection-detail.delete' | translate\"\n                              [attr.aria-label]=\"\n                                'collections.collection-detail.delete-permission' | translate\n                              \"\n                              (click)=\"deletePermission(ace)\"\n                            >\n                              <mat-icon>delete</mat-icon>\n                            </button>\n                          </td>\n                        }\n                      </tr>\n                    }\n                  </tbody>\n                </table>\n              }\n            </section>\n          }\n        </div>\n      </mat-tab>\n\n      <mat-tab [label]=\"'collections.tab.history' | translate\">\n        <div class=\"history-container\">\n          <!-- Filters -->\n          <div class=\"history-filters\">\n            <div class=\"filter-row\">\n              <mat-form-field\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n                class=\"filter-field filter-field--wide\"\n              >\n                <mat-label>{{ 'collections.collection-detail.username' | translate }}</mat-label>\n                <input\n                  matInput\n                  [placeholder]=\"'collections.collection-detail.filter-by-username' | translate\"\n                  [ngModel]=\"filterUsername()\"\n                  (ngModelChange)=\"filterUsername.set($event)\"\n                />\n              </mat-form-field>\n            </div>\n\n            <div class=\"filter-row\">\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"filter-field\">\n                <mat-label>{{ 'collections.collection-detail.from' | translate }}</mat-label>\n                <input\n                  matInput\n                  [matDatepicker]=\"fromPicker\"\n                  [placeholder]=\"'common.date-mask' | translate | dateMask\"\n                  [ngModel]=\"filterDateFrom()\"\n                  (ngModelChange)=\"filterDateFrom.set($event)\"\n                />\n                <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n                <mat-datepicker #fromPicker />\n              </mat-form-field>\n\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"filter-field\">\n                <mat-label>{{ 'collections.collection-detail.to' | translate }}</mat-label>\n                <input\n                  matInput\n                  [matDatepicker]=\"toPicker\"\n                  [placeholder]=\"'common.date-mask' | translate | dateMask\"\n                  [ngModel]=\"filterDateTo()\"\n                  (ngModelChange)=\"filterDateTo.set($event)\"\n                />\n                <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n                <mat-datepicker #toPicker />\n              </mat-form-field>\n            </div>\n\n            <div class=\"filter-row\">\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"filter-field\">\n                <mat-label>{{\n                  'collections.collection-detail.performed-actions' | translate\n                }}</mat-label>\n                <mat-select [ngModel]=\"filterAction()\" (ngModelChange)=\"filterAction.set($event)\">\n                  <mat-option value=\"\">{{\n                    'collections.collection-detail.select-event-actions' | translate\n                  }}</mat-option>\n                  @for (action of availableActions(); track action.id) {\n                    <mat-option [value]=\"action.id\">{{ action.displayLabel }}</mat-option>\n                  }\n                </mat-select>\n              </mat-form-field>\n\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"filter-field\">\n                <mat-label>{{\n                  'collections.collection-detail.event-category' | translate\n                }}</mat-label>\n                <mat-select\n                  [ngModel]=\"filterCategory()\"\n                  (ngModelChange)=\"filterCategory.set($event)\"\n                >\n                  <mat-option value=\"\">{{\n                    'collections.collection-detail.select-event-category' | translate\n                  }}</mat-option>\n                  @for (cat of availableCategories(); track cat.id) {\n                    <mat-option [value]=\"cat.id\">{{ cat.displayLabel }}</mat-option>\n                  }\n                </mat-select>\n              </mat-form-field>\n            </div>\n          </div>\n\n          <!-- Table -->\n          @if (auditLoading()) {\n            <div class=\"history-loading\">\n              <nxs-spinner\n                diameter=\"32\"\n                [label]=\"'collections.collection-detail.loading' | translate\"\n              />\n            </div>\n          } @else if (filteredAuditEntries().length === 0) {\n            <div class=\"history-empty\">\n              <mat-icon>event_busy</mat-icon>\n              <p>{{ 'collections.collection-detail.no-history-entries-found' | translate }}</p>\n            </div>\n          } @else {\n            <div class=\"history-table-wrapper\">\n              <table\n                mat-table\n                [dataSource]=\"filteredAuditEntries()\"\n                matSort\n                (matSortChange)=\"onAuditSort($event)\"\n                class=\"history-table\"\n              >\n                <ng-container matColumnDef=\"eventId\">\n                  <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                    {{ 'collections.collection-detail.performed-action' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\">{{ eventLabel(entry.eventId) }}</td>\n                </ng-container>\n\n                <ng-container matColumnDef=\"eventDate\">\n                  <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                    {{ 'collections.collection-detail.date' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\">\n                    {{ entry.eventDate | date: 'longDate' }}\n                  </td>\n                </ng-container>\n\n                <ng-container matColumnDef=\"principalName\">\n                  <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                    {{ 'collections.collection-detail.username' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\">\n                    <div class=\"user-cell\">\n                      <sat-avatar\n                        [initials]=\"entry.principalName\"\n                        [category]=\"avatarColor(entry.principalName)\"\n                        size=\"24\"\n                        [borderless]=\"true\"\n                        aria-hidden=\"true\"\n                      />\n                      <span>{{ entry.principalName }}</span>\n                    </div>\n                  </td>\n                </ng-container>\n\n                <ng-container matColumnDef=\"category\">\n                  <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                    {{ 'collections.collection-detail.category' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\">{{ categoryLabel(entry.category) }}</td>\n                </ng-container>\n\n                <ng-container matColumnDef=\"comment\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'collections.collection-detail.comment' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\" class=\"comment-cell\">{{ entry.comment }}</td>\n                </ng-container>\n\n                <ng-container matColumnDef=\"docLifeCycle\">\n                  <th mat-header-cell *matHeaderCellDef>\n                    {{ 'collections.collection-detail.state' | translate }}\n                  </th>\n                  <td mat-cell *matCellDef=\"let entry\">\n                    <sat-status-tag status=\"info\" [hideIcon]=\"true\">{{\n                      entry.docLifeCycle\n                    }}</sat-status-tag>\n                  </td>\n                </ng-container>\n\n                <tr mat-header-row *matHeaderRowDef=\"historyDisplayedColumns; sticky: true\"></tr>\n                <tr mat-row *matRowDef=\"let row; columns: historyDisplayedColumns\"></tr>\n              </table>\n            </div>\n\n            <mat-paginator\n              [length]=\"auditTotalSize()\"\n              [pageSize]=\"auditPageSize()\"\n              [pageIndex]=\"auditPageIndex()\"\n              [pageSizeOptions]=\"[10, 20, 50]\"\n              (page)=\"onAuditPageChange($event)\"\n              showFirstLastButtons\n            />\n          }\n        </div>\n      </mat-tab>\n    </mat-tab-group>\n  }\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  background: #fff;\n}\n\n.collection-page {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n// Shown instead of the collection surface when the document did not resolve, so a stale or\n// mistyped link cannot present a working-looking collection with actions on it.\n.collection-unavailable {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 48px 24px;\n  text-align: center;\n\n  .unavailable-icon {\n    width: 48px;\n    height: 48px;\n    font-size: 48px;\n    color: var(--mat-sys-on-surface-variant, #5f6368);\n  }\n\n  .unavailable-title {\n    font-size: 20px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface, #202124);\n  }\n\n  .unavailable-detail {\n    max-width: 420px;\n    color: var(--mat-sys-on-surface-variant, #5f6368);\n  }\n\n  .unavailable-actions {\n    display: flex;\n    gap: 8px;\n    margin-top: 8px;\n  }\n}\n\n// Header\n.collection-header {\n  --nxs-folder-header-heading-size: 16px;\n  padding: 12px 24px;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.header-path-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 12px;\n  color: #888;\n  margin-top: 2px;\n}\n\nsat-breadcrumbs {\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex-shrink: 0;\n\n  button {\n    color: #555;\n\n    &:hover {\n      color: var(--mat-sys-on-surface);\n    }\n\n    &[disabled] {\n      color: #ccc;\n    }\n  }\n}\n\n// Tabs\n.collection-tabs {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n::ng-deep .collection-tabs {\n  .mat-mdc-tab-header {\n    border-bottom: 1px solid #e0e0e0;\n    padding-left: 24px;\n  }\n\n  .mat-mdc-tab-labels {\n    gap: 8px;\n  }\n\n  .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    overflow: hidden;\n  }\n\n  .mat-mdc-tab-body-content {\n    overflow: auto;\n  }\n}\n\n.tab-content {\n  padding: 20px 24px;\n}\n\n.tab-loading {\n  display: flex;\n  justify-content: center;\n  padding: 48px 0;\n}\n\n.tab-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 48px 0;\n  color: #999;\n  gap: 8px;\n\n  .empty-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n.tab-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 64px 0;\n  color: #bbb;\n  gap: 8px;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n// Results\n.result-count {\n  font-size: 13px;\n  color: #666;\n  padding-bottom: 12px;\n}\n\n.members-table-wrapper {\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: auto;\n}\n\n.members-table {\n  width: 100%;\n  border-collapse: collapse;\n\n  thead {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n  }\n\n  th {\n    text-align: left;\n    padding: 12px 16px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n  }\n\n  td {\n    padding: 10px 16px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  .col-title {\n    width: 45%;\n  }\n\n  .col-modified {\n    width: 25%;\n  }\n\n  .col-contributor {\n    width: 30%;\n  }\n}\n\n.member-row {\n  transition: background-color 0.15s;\n  cursor: pointer;\n\n  &:hover {\n    background: #f8f9fe;\n  }\n}\n\n.cell-title {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.doc-thumb {\n  width: 24px;\n  height: 24px;\n  border-radius: 3px;\n  object-fit: cover;\n  flex-shrink: 0;\n}\n\n.doc-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #ffa726;\n  flex-shrink: 0;\n}\n\n.doc-name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.cell-contributor {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.contributor-avatar {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  background: #e65100;\n  color: #fff;\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n// Permissions tab\n.permissions-container {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px 24px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.perm-section {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n.perm-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.perm-section-title {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.perm-action-btn {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: #ef5350;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty {\n  padding: 24px 20px;\n  text-align: center;\n  font-size: 13px;\n  color: #999;\n}\n\n.perm-table {\n  width: 100%;\n  border-collapse: collapse;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.perm-row-actions {\n  text-align: right;\n  white-space: nowrap;\n\n  button {\n    color: #999;\n\n    &:hover {\n      color: #555;\n    }\n  }\n}\n\n// History tab\n.history-container {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.history-filters {\n  padding: 16px 20px 8px;\n  background: #fff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.filter-row {\n  display: flex;\n  gap: 12px;\n  margin-bottom: 8px;\n}\n\n.filter-field {\n  flex: 1;\n\n  &--wide {\n    flex: 1;\n  }\n\n  ::ng-deep .mat-mdc-form-field-subscript-wrapper {\n    display: none;\n  }\n\n  ::ng-deep .mat-mdc-text-field-wrapper {\n    padding: 0 12px;\n  }\n\n  ::ng-deep .mat-mdc-form-field-infix {\n    min-height: 40px;\n    padding-top: 8px !important;\n    padding-bottom: 8px !important;\n  }\n\n  ::ng-deep .mat-mdc-floating-label {\n    font-size: 13px;\n  }\n\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading,\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__notch,\n  ::ng-deep .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__trailing {\n    border-color: #d0d0d0;\n  }\n\n  ::ng-deep input.mat-mdc-input-element {\n    font-size: 13px;\n  }\n\n  ::ng-deep .mat-mdc-select-trigger {\n    font-size: 13px;\n  }\n}\n\n.history-loading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px;\n  flex: 1;\n}\n\n.history-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 40px;\n  color: #999;\n  gap: 8px;\n  flex: 1;\n\n  mat-icon {\n    font-size: 40px;\n    width: 40px;\n    height: 40px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n.history-table-wrapper {\n  flex: 1;\n  overflow: auto;\n  min-height: 0;\n}\n\n.history-table {\n  width: 100%;\n\n  .mat-mdc-header-cell {\n    font-weight: 600;\n    font-size: 12px;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 2px solid #e0e0e0;\n    padding: 12px 16px;\n  }\n\n  .mat-mdc-cell {\n    font-size: 13px;\n    color: #333;\n    padding: 10px 16px;\n    border-bottom: 1px solid #f0f0f0;\n  }\n\n  .mat-mdc-row:hover {\n    background: #f8f9fe;\n  }\n}\n\n.user-cell {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.comment-cell {\n  max-width: 240px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.state-badge {\n  display: inline-block;\n  padding: 2px 10px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 500;\n  color: var(--mat-sys-on-primary-container);\n  background: var(--mat-sys-primary-container);\n  text-transform: capitalize;\n}\n\n::ng-deep .history-container .mat-mdc-paginator {\n  flex-shrink: 0;\n  border-top: 1px solid #e0e0e0;\n  font-size: 12px;\n}\n\n// The highlighted padlock Web UI shows on a locked document, only where the user may unlock it.\n.header-actions button.lock-toggle--active:not(.mat-mdc-button-disabled) {\n  color: var(--mat-sys-primary);\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CollectionDetailComponent, { className: "CollectionDetailComponent", filePath: "libs/features/collections/src/lib/collection-detail/collection-detail.ts", lineNumber: 149 }); })();
