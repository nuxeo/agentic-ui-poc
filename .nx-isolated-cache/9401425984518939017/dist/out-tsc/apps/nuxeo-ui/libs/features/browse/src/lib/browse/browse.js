import { Component, DestroyRef, LOCALE_ID, computed, effect, inject, signal, untracked, } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of, Subject, timer, EMPTY } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowseService, BrowseContextService, ClipboardTargetService, decodeNuxeoPathSegment, parseBrowseNuxeoPathFromRouterUrl, isBrowseRouterUrl, nuxeoPathsEqualFlexible, DocumentDetailService, DirectoryService, DocumentImportService, SelectionService, TagService, docTypeIcon, avatarColor, isFolderishDocument, canAddChildren, canManageDocumentPermissions, mergeDocumentPermissionsContext, canWriteDocument, canRemoveDocument, canShowRemoveDocumentAction, canShowWriteDocumentAction, hasDocumentPermissionsEnricher, canViewDocumentAuditLog, auditActivityLabel, DOMAIN_CONTAINER_GUIDANCE_KEY, isDomainParentType, isRestrictedImportParentPath, PERMISSION_DENIED_KEY, isPermissionDeniedError, isMailSendError, mailSendFailureMessage, resolveAcePrincipal, CURRENT_USERNAME, ADMIN_ACCESS_CHECKS, shouldShowUserWorkspaceBreadcrumbs, postTrashBrowseRouterUrl, isCollectionDocument, formatRelativeTime, formatAceDateRange, permissionRightLabel, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { ConfirmDialogComponent, EditCollectionDialogComponent, ExportDialogComponent, ShareDialogComponent, trashDocumentConfirmData, trashSelectedDocumentsConfirmData, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { UpdatePermissionDialogComponent, DeletePermissionDialogComponent, ShareExternalDialogComponent, } from '@agentic-ui/shared-permission-dialogs';
import { AppExtensionsService, EXTENSION_SLOTS, descriptorLabel, ExtensionActionRegistry, ExtensionOutletComponent, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { ALL_COLUMNS, loadColumnVisibility, saveColumnSettings, } from '../column-settings-dialog/column-settings-dialog';
import { EditMetadataDialogComponent, } from '../edit-metadata-dialog/edit-metadata-dialog';
import { CreateImportDialogComponent } from '../create-import/create-import-dialog.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NXS_PERMISSIONS_PANEL_ID, NXS_PRIMITIVE_IDS, NxsActionMenuComponent, NxsBreadcrumbsComponent, NxsColumnPickerComponent, NxsDocumentListComponent, NxsDomainHintComponent, NxsDriveDialogComponent, NxsFolderPickerDialogComponent, NxsRenameDialogComponent, NxsErrorStateComponent, NxsFolderHeaderComponent, NxsPagerComponent, NxsPermissionsPanelComponent, NxsSpinnerComponent, NxsThumbnailComponent, NxsUploadQueue, NxsUploadQueueComponent, nxsErrorStatus, provideNxsThumbnailCache, NxsToastService, provideNxsToast, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/progress-spinner";
import * as i4 from "@angular/material/button";
import * as i5 from "@angular/material/tabs";
import * as i6 from "@angular/material/table";
import * as i7 from "@angular/material/sort";
import * as i8 from "@angular/material/paginator";
import * as i9 from "@angular/material/menu";
import * as i10 from "@angular/material/tooltip";
import * as i11 from "@angular/material/form-field";
import * as i12 from "@angular/material/input";
import * as i13 from "@angular/material/select";
import * as i14 from "@angular/material/datepicker";
import * as i15 from "@angular/material/autocomplete";
import * as i16 from "@angular/material/checkbox";
import * as i17 from "@hylandsoftware/satori-ui/avatar";
import * as i18 from "@hylandsoftware/satori-ui/tag";
const _c0 = (a0, a1) => ({ items: a0, label: a1 });
const _c1 = a0 => ({ count: a0 });
const _c2 = a0 => ({ name: a0 });
const _c3 = (a0, a1) => ({ documentId: a0, permissionsChanged: a1 });
const _c4 = () => ["eventId", "eventDate", "principalName", "category", "comment", "docLifeCycle"];
const _c5 = () => [10, 20, 50];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.uid;
function BrowseComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openCreateImportDialog()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 3, "browse.browse.create-folder-upload-files-or-import"))("disabled", !ctx_r2.isCurrentFolderish());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 5, "browse.browse.create-import"), " ");
} }
function BrowseComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openEditDialog()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "edit");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "browse.browse.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "browse.browse.edit"));
} }
function BrowseComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_11_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.deleteDocument()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "delete");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "browse.browse.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "browse.browse.delete"));
} }
function BrowseComponent_Conditional_19_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-breadcrumbs", 58);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const trailLabel_r6 = i0.ɵɵreadContextLet(0);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("items", ctx_r2.breadcrumbs())("label", trailLabel_r6);
} }
function BrowseComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelement(2, "lib-extension-outlet", 57, 3);
    i0.ɵɵconditionalCreate(4, BrowseComponent_Conditional_19_Conditional_4_Template, 1, 2, "nxs-breadcrumbs", 58);
} if (rf & 2) {
    const breadcrumbsOutlet_r7 = i0.ɵɵreference(3);
    const ctx_r2 = i0.ɵɵnextContext();
    const trailLabel_r8 = i0.ɵɵstoreLet(i0.ɵɵpipeBind1(1, 3, "browse.breadcrumb.label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("componentId", ctx_r2.breadcrumbsId)("componentInputs", i0.ɵɵpureFunction2(6, _c0, ctx_r2.breadcrumbs(), trailLabel_r8));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(breadcrumbsOutlet_r7.unresolved() ? 4 : -1);
} }
function BrowseComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const count_r9 = i0.ɵɵreadContextLet(28);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, count_r9 === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(4, _c1, count_r9)));
} }
function BrowseComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 59);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_36_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterText.set("")); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "browse.browse.clear"));
} }
function BrowseComponent_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 59);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_54_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.filterContributor.set("")); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "browse.browse.clear"));
} }
function BrowseComponent_For_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r12 = ctx.$implicit;
    i0.ɵɵproperty("value", t_r12);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(t_r12);
} }
function BrowseComponent_Conditional_66_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 60);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_66_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.openColumnPanel()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "tune");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "browse.browse.manage-columns"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "browse.browse.manage-columns"));
} }
function BrowseComponent_Conditional_70_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 38);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "download");
    i0.ɵɵelementEnd();
} }
function BrowseComponent_Conditional_82_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-column-picker", 63);
    i0.ɵɵlistener("apply", function BrowseComponent_Conditional_82_Conditional_1_Template_nxs_column_picker_apply_0_listener($event) { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.applyColumns($event)); })("dismiss", function BrowseComponent_Conditional_82_Conditional_1_Template_nxs_column_picker_dismiss_0_listener() { i0.ɵɵrestoreView(_r15); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeColumnPanel()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("columns", ctx_r2.pickerColumns())("required", ctx_r2.requiredColumnKeys)("defaults", ctx_r2.defaultColumnKeys());
} }
function BrowseComponent_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 39);
    i0.ɵɵconditionalCreate(1, BrowseComponent_Conditional_82_Conditional_1_Template, 1, 3, "nxs-column-picker", 61);
    i0.ɵɵelementStart(2, "nxs-document-list", 62);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("selectedIdsChange", function BrowseComponent_Conditional_82_Template_nxs_document_list_selectedIdsChange_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onListSelectionChange($event)); })("sortChange", function BrowseComponent_Conditional_82_Template_nxs_document_list_sortChange_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onListSortChange($event)); })("pageChange", function BrowseComponent_Conditional_82_Template_nxs_document_list_pageChange_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.goToPage($event)); })("open", function BrowseComponent_Conditional_82_Template_nxs_document_list_open_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onRowClick($event)); })("rowAction", function BrowseComponent_Conditional_82_Template_nxs_document_list_rowAction_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onRowAction($event)); })("retry", function BrowseComponent_Conditional_82_Template_nxs_document_list_retry_2_listener() { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadContent()); })("filesDropped", function BrowseComponent_Conditional_82_Template_nxs_document_list_filesDropped_2_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.uploadDropped($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_8_0;
    let tmp_21_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.columnPanelOpen() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("documents", ctx_r2.filteredEntries())("columns", ctx_r2.listColumns())("label", i0.ɵɵpipeBind2(3, 17, "browse.browse.contents-of", i0.ɵɵpureFunction1(25, _c2, ((tmp_8_0 = ctx_r2.currentDoc()) == null ? null : tmp_8_0.title) ?? "")))("sort", ctx_r2.listSort())("selectedIds", ctx_r2.listSelectedIds())("pageIndex", ctx_r2.pageIndex())("pageSize", ctx_r2.pageSize)("totalSize", ctx_r2.totalSize())("hasNextPage", ctx_r2.hasNextPage())("loading", ctx_r2.loading())("error", ctx_r2.error() ? ctx_r2.errorStatus() : null)("errorHeading", ctx_r2.error() ?? "")("emptyHeading", i0.ɵɵpipeBind1(4, 20, "browse.browse.this-folder-is-empty"))("rowActions", ctx_r2.rowMenus())("dropEnabled", ctx_r2.canCreateContentHere())("dropLabel", i0.ɵɵpipeBind2(5, 22, "browse.browse.drop-to-upload", i0.ɵɵpureFunction1(27, _c2, ((tmp_21_0 = ctx_r2.currentDoc()) == null ? null : tmp_21_0.title) ?? "")));
} }
function BrowseComponent_Conditional_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵelement(1, "nxs-spinner", 64);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 65);
    i0.ɵɵlistener("retry", function BrowseComponent_Conditional_84_Template_nxs_error_state_retry_0_listener() { i0.ɵɵrestoreView(_r16); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.loadContent()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", ctx_r2.errorStatus())("heading", ctx_r2.errorStatus() === 500 ? ctx : "");
} }
function BrowseComponent_Conditional_85_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52)(1, "mat-icon", 69);
    i0.ɵɵtext(2, "folder_open");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "browse.browse.this-folder-is-empty"));
} }
function BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 82);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r21); const doc_r19 = i0.ɵɵnextContext(2).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.openEditCollectionDialog(doc_r19)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "edit");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "browse.browse.edit"));
} }
function BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 82);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r22); const doc_r19 = i0.ɵɵnextContext(2).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.deleteCollectionEntry(doc_r19)); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "delete");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "browse.browse.delete"));
} }
function BrowseComponent_Conditional_85_For_3_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 80);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_85_For_3_Conditional_14_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r20); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "mat-menu", null, 4);
    i0.ɵɵconditionalCreate(6, BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_6_Template, 6, 3, "button", 81);
    i0.ɵɵconditionalCreate(7, BrowseComponent_Conditional_85_For_3_Conditional_14_Conditional_7_Template, 6, 3, "button", 81);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const collectionCardMenu_r23 = i0.ɵɵreference(5);
    const doc_r19 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("matMenuTriggerFor", collectionCardMenu_r23);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 4, "browse.browse.collection-actions"));
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r2.canEditCollectionEntry(doc_r19) ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canDeleteCollectionEntry(doc_r19) ? 7 : -1);
} }
function BrowseComponent_Conditional_85_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 70)(1, "div", 71)(2, "mat-checkbox", 72);
    i0.ɵɵlistener("change", function BrowseComponent_Conditional_85_For_3_Template_mat_checkbox_change_2_listener() { const doc_r19 = i0.ɵɵrestoreView(_r18).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.toggleSelection(doc_r19.uid)); })("click", function BrowseComponent_Conditional_85_For_3_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r18); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(3, "button", 73);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_85_For_3_Template_button_click_3_listener() { const doc_r19 = i0.ɵɵrestoreView(_r18).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onRowClick(doc_r19)); });
    i0.ɵɵelementStart(4, "div", 74)(5, "nxs-thumbnail", 75)(6, "mat-icon", 76);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 77)(9, "span", 78);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 79);
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "docTypeLabel");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(14, BrowseComponent_Conditional_85_For_3_Conditional_14_Template, 8, 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r19 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("doc-card-wrapper--selected", ctx_r2.isSelected(doc_r19.uid));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r2.isSelected(doc_r19.uid));
    i0.ɵɵariaProperty("aria-label", ctx_r2.selectionAriaLabel(doc_r19));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("documentId", doc_r19.uid);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.docIcon(doc_r19));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r19.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 9, doc_r19.type));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.isCollectionEntry(doc_r19) && ctx_r2.hasCollectionEntryActions(doc_r19) ? 14 : -1);
} }
function BrowseComponent_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, BrowseComponent_Conditional_85_Conditional_0_Template, 6, 3, "div", 52);
    i0.ɵɵelementStart(1, "div", 66);
    i0.ɵɵrepeaterCreate(2, BrowseComponent_Conditional_85_For_3_Template, 15, 11, "div", 67, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "nxs-pager", 68);
    i0.ɵɵlistener("pageChange", function BrowseComponent_Conditional_85_Template_nxs_pager_pageChange_4_listener($event) { i0.ɵɵrestoreView(_r17); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.goToPage($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r2.filteredEntries().length === 0 && ctx_r2.pageIndex() === 0 ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.filteredEntries());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("pageIndex", ctx_r2.pageIndex())("pageSize", ctx_r2.pageSize)("itemCount", ctx_r2.filteredEntries().length)("totalSize", ctx_r2.totalSize())("hasNextPage", ctx_r2.hasNextPage());
} }
function BrowseComponent_Conditional_86_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 42);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "div", 83)(3, "span", 84);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 85);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_86_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.droppedUploads.clear()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "nxs-upload-queue", 86);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("remove", function BrowseComponent_Conditional_86_Template_nxs_upload_queue_remove_9_listener($event) { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.droppedUploads.remove($event)); })("retry", function BrowseComponent_Conditional_86_Template_nxs_upload_queue_retry_9_listener() { i0.ɵɵrestoreView(_r24); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.runDroppedUploads()); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 6, "browse.browse.uploads"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 8, "browse.browse.uploads"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r2.droppedUploads.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 10, "browse.browse.clear-uploads"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("items", ctx_r2.droppedUploads.items())("label", i0.ɵɵpipeBind1(10, 12, "browse.browse.uploads"));
} }
function BrowseComponent_Conditional_90_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-permissions-panel", 88);
} if (rf & 2) {
    const folder_r25 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("documentId", folder_r25.uid)("permissionsChanged", ctx_r2.onPermissionsChanged);
} }
function BrowseComponent_Conditional_90_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 87, 5);
    i0.ɵɵconditionalCreate(2, BrowseComponent_Conditional_90_Conditional_2_Template, 1, 2, "nxs-permissions-panel", 88);
} if (rf & 2) {
    const permissionsPanelOutlet_r26 = i0.ɵɵreference(1);
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("componentId", ctx_r2.permissionsPanelId)("componentInputs", i0.ɵɵpureFunction2(3, _c3, ctx.uid, ctx_r2.onPermissionsChanged));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(permissionsPanelOutlet_r26.unresolved() ? 2 : -1);
} }
function BrowseComponent_Conditional_91_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵelement(1, "nxs-spinner", 89);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_92_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 97);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_92_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r27); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.shareWithExternal()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.new"), " ");
} }
function BrowseComponent_Conditional_92_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 95);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.the-document-is-not-shared-with"), " ");
} }
function BrowseComponent_Conditional_92_Conditional_12_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.browse.actions"));
} }
function BrowseComponent_Conditional_92_Conditional_12_For_18_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 98)(1, "button", 99);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_92_Conditional_12_For_18_Conditional_9_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r28); const ace_r29 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.editExternalPermission(ace_r29)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 100);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_92_Conditional_12_For_18_Conditional_9_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r28); const ace_r29 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.sendNotificationEmail(ace_r29)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "email");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 99);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_92_Conditional_12_For_18_Conditional_9_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r28); const ace_r29 = i0.ɵɵnextContext().$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.deletePermission(ace_r29)); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "delete");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ace_r29 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 7, "browse.browse.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 9, "browse.browse.edit"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 11, "browse.browse.send-notification-email"))("disabled", ctx_r2.actionInProgress() === "notify-" + ace_r29.id);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 13, "browse.browse.send-notification-email"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(12, 15, "browse.browse.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 17, "browse.browse.delete"));
} }
function BrowseComponent_Conditional_92_Conditional_12_For_18_Template(rf, ctx) { if (rf & 1) {
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
    i0.ɵɵconditionalCreate(9, BrowseComponent_Conditional_92_Conditional_12_For_18_Conditional_9_Template, 16, 19, "td", 98);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ace_r29 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.displayUsername(ace_r29));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.permissionLabel(ace_r29.permission));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.aceTimeFrame(ace_r29));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.aceGrantedBy(ace_r29));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.canManageCurrentPermissions() ? 9 : -1);
} }
function BrowseComponent_Conditional_92_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 96)(1, "thead")(2, "tr")(3, "th");
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
    i0.ɵɵconditionalCreate(15, BrowseComponent_Conditional_92_Conditional_12_Conditional_15_Template, 3, 3, "th");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "tbody");
    i0.ɵɵrepeaterCreate(17, BrowseComponent_Conditional_92_Conditional_12_For_18_Template, 10, 5, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "browse.browse.user"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "browse.browse.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 9, "browse.browse.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 11, "browse.browse.granted-by"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.canManageCurrentPermissions() ? 15 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r2.externalAces());
} }
function BrowseComponent_Conditional_92_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 44)(1, "div", 90)(2, "div", 91);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, BrowseComponent_Conditional_92_Conditional_5_Template, 3, 3, "button", 92);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 93);
    i0.ɵɵelement(7, "span", 94);
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, BrowseComponent_Conditional_92_Conditional_11_Template, 3, 3, "div", 95)(12, BrowseComponent_Conditional_92_Conditional_12_Template, 19, 13, "table", 96);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "browse.browse.permissions-assigned-to-external-users"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.canManageCurrentPermissions() ? 5 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 6, "browse.browse.sharing-to-external-users-does-not"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.externalAces().length === 0 ? 11 : 12);
} }
function BrowseComponent_For_129_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const a_r30 = ctx.$implicit;
    i0.ɵɵproperty("value", a_r30.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(a_r30.label);
} }
function BrowseComponent_For_139_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r31 = ctx.$implicit;
    i0.ɵɵproperty("value", c_r31.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r31.label);
} }
function BrowseComponent_Conditional_140_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵelement(1, "nxs-spinner", 89);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_141_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 50);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.no-audit-entries-found"), " ");
} }
function BrowseComponent_Conditional_142_th_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 115);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.performed-action"), " ");
} }
function BrowseComponent_Conditional_142_td_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r33 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.eventLabel(row_r33.eventId));
} }
function BrowseComponent_Conditional_142_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 115);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.date"), " ");
} }
function BrowseComponent_Conditional_142_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r34 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, row_r34.eventDate, "medium"));
} }
function BrowseComponent_Conditional_142_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 115);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.username"), " ");
} }
function BrowseComponent_Conditional_142_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116)(1, "span", 117);
    i0.ɵɵelement(2, "sat-avatar", 118);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r35 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("initials", ctx_r2.avatarInitials(row_r35.principalName))("category", ctx_r2.avatarColor(row_r35.principalName))("borderless", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r35.principalName, " ");
} }
function BrowseComponent_Conditional_142_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 115);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.category"), " ");
} }
function BrowseComponent_Conditional_142_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r36 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.categoryLabel(row_r36.category));
} }
function BrowseComponent_Conditional_142_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 119);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.comment"), " ");
} }
function BrowseComponent_Conditional_142_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r37 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r37.comment);
} }
function BrowseComponent_Conditional_142_th_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 119);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.browse.state"), " ");
} }
function BrowseComponent_Conditional_142_td_19_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "sat-status-tag", 120);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r38 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("hideIcon", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r38.docLifeCycle);
} }
function BrowseComponent_Conditional_142_td_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 116);
    i0.ɵɵconditionalCreate(1, BrowseComponent_Conditional_142_td_19_Conditional_1_Template, 2, 2, "sat-status-tag", 120);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r38 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(row_r38.docLifeCycle ? 1 : -1);
} }
function BrowseComponent_Conditional_142_tr_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 121);
} }
function BrowseComponent_Conditional_142_tr_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 122);
} }
function BrowseComponent_Conditional_142_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 101)(1, "table", 102);
    i0.ɵɵlistener("matSortChange", function BrowseComponent_Conditional_142_Template_table_matSortChange_1_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onAuditSort($event)); });
    i0.ɵɵelementContainerStart(2, 103);
    i0.ɵɵtemplate(3, BrowseComponent_Conditional_142_th_3_Template, 3, 3, "th", 104)(4, BrowseComponent_Conditional_142_td_4_Template, 2, 1, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(5, 106);
    i0.ɵɵtemplate(6, BrowseComponent_Conditional_142_th_6_Template, 3, 3, "th", 104)(7, BrowseComponent_Conditional_142_td_7_Template, 3, 4, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 107);
    i0.ɵɵtemplate(9, BrowseComponent_Conditional_142_th_9_Template, 3, 3, "th", 104)(10, BrowseComponent_Conditional_142_td_10_Template, 4, 4, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 108);
    i0.ɵɵtemplate(12, BrowseComponent_Conditional_142_th_12_Template, 3, 3, "th", 104)(13, BrowseComponent_Conditional_142_td_13_Template, 2, 1, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 109);
    i0.ɵɵtemplate(15, BrowseComponent_Conditional_142_th_15_Template, 3, 3, "th", 110)(16, BrowseComponent_Conditional_142_td_16_Template, 2, 1, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(17, 111);
    i0.ɵɵtemplate(18, BrowseComponent_Conditional_142_th_18_Template, 3, 3, "th", 110)(19, BrowseComponent_Conditional_142_td_19_Template, 2, 1, "td", 105);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(20, BrowseComponent_Conditional_142_tr_20_Template, 1, 0, "tr", 112)(21, BrowseComponent_Conditional_142_tr_21_Template, 1, 0, "tr", 113);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "mat-paginator", 114);
    i0.ɵɵlistener("page", function BrowseComponent_Conditional_142_Template_mat_paginator_page_22_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onAuditPageChange($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("dataSource", ctx_r2.filteredAuditEntries())("matSortActive", ctx_r2.sortActive())("matSortDirection", ctx_r2.sortDirection());
    i0.ɵɵadvance(19);
    i0.ɵɵproperty("matHeaderRowDef", i0.ɵɵpureFunction0(9, _c4));
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", i0.ɵɵpureFunction0(10, _c4));
    i0.ɵɵadvance();
    i0.ɵɵproperty("length", ctx_r2.auditTotalSize())("pageSize", ctx_r2.auditPageSize())("pageIndex", ctx_r2.auditPageIndex())("pageSizeOptions", i0.ɵɵpureFunction0(11, _c5));
} }
function BrowseComponent_Conditional_146_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵelement(1, "mat-spinner", 123);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_147_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52)(1, "mat-icon", 69);
    i0.ɵɵtext(2, "delete_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "browse.browse.trash-is-empty"));
} }
function BrowseComponent_Conditional_148_For_18_Template(rf, ctx) { if (rf & 1) {
    const _r39 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 125)(1, "td", 126)(2, "nxs-thumbnail", 127)(3, "mat-icon", 128);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 129);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "td")(8, "sat-category-tag", 130);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "docTypeLabel");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "td");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "td")(15, "button", 131);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_148_For_18_Template_button_click_15_listener() { const doc_r40 = i0.ɵɵrestoreView(_r39).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.restoreDocument(doc_r40)); });
    i0.ɵɵelementStart(16, "mat-icon");
    i0.ɵɵtext(17, "restore_from_trash");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(18);
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const doc_r40 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("documentId", doc_r40.uid);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.docIcon(doc_r40));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r40.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 6, doc_r40.type));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(13, 8, doc_r40.lastModified, "mediumDate"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(19, 11, "browse.browse.restore"), " ");
} }
function BrowseComponent_Conditional_148_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 53)(1, "table", 124)(2, "thead")(3, "tr")(4, "th");
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
    i0.ɵɵrepeaterCreate(17, BrowseComponent_Conditional_148_For_18_Template, 20, 13, "tr", 125, _forTrack1);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 4, "browse.browse.name"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 6, "browse.browse.type"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 8, "browse.browse.last-modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 10, "browse.browse.actions"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.trashedDocs());
} }
function BrowseComponent_Conditional_155_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 137)(1, "div", 138)(2, "div", 139);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 140)(6, "span", 141);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 142)(10, "sat-status-tag", 120);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "div", 140)(13, "span", 141);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span", 142);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 140)(20, "span", 141);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "span", 142);
    i0.ɵɵtext(24);
    i0.ɵɵpipe(25, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "div", 140)(27, "span", 141);
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "span", 143);
    i0.ɵɵelement(31, "sat-avatar", 118);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "div", 140)(34, "span", 141);
    i0.ɵɵtext(35);
    i0.ɵɵpipe(36, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "span", 143);
    i0.ɵɵelement(38, "sat-avatar", 118);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(40, "div", 138)(41, "div", 139);
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "div", 140)(45, "span", 141);
    i0.ɵɵtext(46);
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "span", 142);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 140)(51, "span", 141);
    i0.ɵɵtext(52);
    i0.ɵɵpipe(53, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(54, "span", 142);
    i0.ɵɵtext(55);
    i0.ɵɵpipe(56, "docTypeLabel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const doc_r42 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 23, "browse.browse.info"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 25, "browse.browse.state"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("hideIcon", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.docState());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 27, "browse.browse.last-modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(18, 29, doc_r42.lastModified, "mediumDate"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(22, 32, "browse.browse.created"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(25, 34, doc_r42.properties["dc:created"], "mediumDate"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 37, "browse.browse.by"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("initials", ctx_r2.avatarInitials(ctx_r2.docCreator(doc_r42)))("category", ctx_r2.avatarColor(ctx_r2.docCreator(doc_r42)))("borderless", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.docCreator(doc_r42), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(36, 39, "browse.browse.contributors"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("initials", ctx_r2.avatarInitials(ctx_r2.lastContributor(doc_r42)))("category", ctx_r2.avatarColor(ctx_r2.lastContributor(doc_r42)))("borderless", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.lastContributor(doc_r42), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(43, 41, "browse.browse.properties"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(47, 43, "browse.browse.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r42.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 45, "browse.browse.type"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(56, 47, doc_r42.type));
} }
function BrowseComponent_Conditional_155_Conditional_19_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r44 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 145)(1, "sat-category-tag", 130);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 151);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_155_Conditional_19_For_6_Template_button_click_3_listener() { const tag_r45 = i0.ɵɵrestoreView(_r44).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.removeTag(tag_r45)); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const tag_r45 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tag_r45);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-tag", i0.ɵɵpureFunction1(5, _c2, tag_r45)));
} }
function BrowseComponent_Conditional_155_Conditional_19_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 146);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.browse.no-tags-yet"));
} }
function BrowseComponent_Conditional_155_Conditional_19_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const result_r46 = ctx.$implicit;
    i0.ɵɵproperty("value", result_r46);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(result_r46);
} }
function BrowseComponent_Conditional_155_Conditional_19_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 34)(1, "span", 152);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", ctx_r2.tagInput);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("+ ", ctx_r2.tagInput);
} }
function BrowseComponent_Conditional_155_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 137)(1, "div", 139);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 144);
    i0.ɵɵrepeaterCreate(5, BrowseComponent_Conditional_155_Conditional_19_For_6_Template, 7, 7, "span", 145, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵconditionalCreate(7, BrowseComponent_Conditional_155_Conditional_19_Conditional_7_Template, 3, 3, "span", 146);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "mat-form-field", 147)(9, "input", 148);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function BrowseComponent_Conditional_155_Conditional_19_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r2 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r2.tagInput, $event) || (ctx_r2.tagInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function BrowseComponent_Conditional_155_Conditional_19_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.onTagSearch($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "mat-icon", 149);
    i0.ɵɵtext(12, "arrow_drop_down");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "mat-autocomplete", 150, 6);
    i0.ɵɵlistener("optionSelected", function BrowseComponent_Conditional_155_Conditional_19_Template_mat_autocomplete_optionSelected_13_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.selectTag($event.option.value)); });
    i0.ɵɵrepeaterCreate(15, BrowseComponent_Conditional_155_Conditional_19_For_16_Template, 2, 2, "mat-option", 34, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵconditionalCreate(17, BrowseComponent_Conditional_155_Conditional_19_Conditional_17_Template, 3, 2, "mat-option", 34);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const tagAuto_r47 = i0.ɵɵreference(14);
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 6, "browse.browse.tags"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.tags());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.tags().length === 0 ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(10, 8, "browse.browse.search-or-create-a-tag"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.tagInput);
    i0.ɵɵproperty("matAutocomplete", tagAuto_r47);
    i0.ɵɵadvance(6);
    i0.ɵɵrepeater(ctx_r2.tagSearchResults());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.showCreateOption() ? 17 : -1);
} }
function BrowseComponent_Conditional_155_Conditional_20_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 153);
    i0.ɵɵelement(1, "nxs-spinner", 154);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "browse.browse.loading"));
} }
function BrowseComponent_Conditional_155_Conditional_20_Conditional_2_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 155);
    i0.ɵɵelement(1, "sat-avatar", 156);
    i0.ɵɵelementStart(2, "div", 157)(3, "span", 158);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 159);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 160);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const entry_r48 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("initials", ctx_r2.avatarInitials(entry_r48.principalName))("category", ctx_r2.avatarColor(entry_r48.principalName))("borderless", true);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(entry_r48.principalName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.activityLabel(entry_r48));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.relativeTime(entry_r48.eventDate));
} }
function BrowseComponent_Conditional_155_Conditional_20_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 146);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.browse.no-recent-activity"));
} }
function BrowseComponent_Conditional_155_Conditional_20_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, BrowseComponent_Conditional_155_Conditional_20_Conditional_2_For_1_Template, 9, 6, "div", 155, _forTrack0);
    i0.ɵɵconditionalCreate(2, BrowseComponent_Conditional_155_Conditional_20_Conditional_2_Conditional_2_Template, 3, 3, "span", 146);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r2.activityEntries());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.activityEntries().length === 0 ? 2 : -1);
} }
function BrowseComponent_Conditional_155_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 137);
    i0.ɵɵconditionalCreate(1, BrowseComponent_Conditional_155_Conditional_20_Conditional_1_Template, 3, 3, "div", 153)(2, BrowseComponent_Conditional_155_Conditional_20_Conditional_2_Template, 3, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.activityLoading() ? 1 : 2);
} }
function BrowseComponent_Conditional_155_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "aside", 55)(1, "div", 132)(2, "span", 133);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 134);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_155_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.closePanel()); });
    i0.ɵɵelementStart(6, "mat-icon");
    i0.ɵɵtext(7, "close");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 135)(9, "button", 136);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_155_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.switchPanelSubTab("info")); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 136);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_155_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.switchPanelSubTab("tags")); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 136);
    i0.ɵɵlistener("click", function BrowseComponent_Conditional_155_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r41); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.switchPanelSubTab("activity")); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(18, BrowseComponent_Conditional_155_Conditional_18_Template, 57, 49, "div", 137);
    i0.ɵɵconditionalCreate(19, BrowseComponent_Conditional_155_Conditional_19_Template, 18, 10, "div", 137);
    i0.ɵɵconditionalCreate(20, BrowseComponent_Conditional_155_Conditional_20_Template, 3, 1, "div", 137);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.title);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 14, "browse.browse.close-panel"));
    i0.ɵɵadvance(5);
    i0.ɵɵclassProp("sub-tab--active", ctx_r2.panelSubTab() === "info");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 16, "browse.browse.info"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("sub-tab--active", ctx_r2.panelSubTab() === "tags");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 18, "browse.browse.tags"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("sub-tab--active", ctx_r2.panelSubTab() === "activity");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 20, "browse.browse.activity"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.panelSubTab() === "info" ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.panelSubTab() === "tags" ? 19 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.panelSubTab() === "activity" ? 20 : -1);
} }
/**
 * The packaged column set as descriptors, for an injector where Layer 1
 * registration has not run. Derived from `ALL_COLUMNS` rather than restated, so
 * there is one list to keep in step instead of two.
 */
const FALLBACK_COLUMN_DESCRIPTORS = ALL_COLUMNS.map((col, index) => ({
    id: `app.documentList.${col.key}`,
    label: col.label,
    field: col.key,
    order: (index + 1) * 10,
    ...(col.visible ? {} : { hiddenByDefault: true }),
}));
/**
 * The Nuxeo property each sortable column orders by on the server.
 *
 * Only these five: every browse source — `@children`, `tree_children` and
 * `default_content_collection` — was checked to sort by each of them, and they are the columns Nuxeo
 * Web UI's folder and collection views sort. A column outside this map gets a plain header, because
 * `@children` answers a property it cannot sort by with an empty page rather than an error.
 */
const SORT_FIELDS = {
    title: 'dc:title',
    modified: 'dc:modified',
    lastContributor: 'dc:lastContributor',
    created: 'dc:created',
    author: 'dc:creator',
};
/** One page of a folder: the 50 entries browse has always asked for, now with the rest reachable. */
const PAGE_SIZE = 50;
export class BrowseComponent {
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    router = inject(Router);
    browseService = inject(BrowseService);
    browseContext = inject(BrowseContextService);
    clipboardTargetService = inject(ClipboardTargetService);
    detailService = inject(DocumentDetailService);
    directoryService = inject(DirectoryService);
    tagService = inject(TagService);
    selectionService = inject(SelectionService);
    extensions = inject(AppExtensionsService);
    ruleContext = inject(ExtensionRuleContextService);
    actionRegistry = inject(ExtensionActionRegistry);
    dialog = inject(MatDialog);
    toast = inject(NxsToastService);
    importService = inject(DocumentImportService);
    /** Files dropped on the list: each one's progress and outcome, through the import's own queue. */
    droppedUploads = new NxsUploadQueue();
    /** The folder the dropped files go into, kept for a retry after the page has moved on. */
    droppedUploadPath = null;
    currentUsername = inject(CURRENT_USERNAME);
    adminAccess = inject(ADMIN_ACCESS_CHECKS);
    // Core state
    entries = signal([], ...(ngDevMode ? [{ debugName: "entries" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    /** Which error state `error` shows: the status of the request that failed. */
    errorStatus = signal(500, ...(ngDevMode ? [{ debugName: "errorStatus" }] : []));
    currentDoc = signal(null, ...(ngDevMode ? [{ debugName: "currentDoc" }] : []));
    /** The folder the address names when it could not be opened — refused, missing or failing. */
    unopenedPath = signal(null, ...(ngDevMode ? [{ debugName: "unopenedPath" }] : []));
    /** The address whose folder is on screen, as it was asked for. */
    openedPath = null;
    /** Nuxeo's count of the folder's entries; negative when it did not count them. */
    totalSize = signal(0, ...(ngDevMode ? [{ debugName: "totalSize" }] : []));
    pageSize = PAGE_SIZE;
    pageIndex = signal(0, ...(ngDevMode ? [{ debugName: "pageIndex" }] : []));
    hasNextPage = signal(false, ...(ngDevMode ? [{ debugName: "hasNextPage" }] : []));
    /** The server-side order, or `null` for the source's own. Kept across folders, like Web UI. */
    listSort = signal(null, ...(ngDevMode ? [{ debugName: "listSort" }] : []));
    currentNuxeoPath = '/';
    /** Skips the initial contentRefreshTick effect run to avoid duplicate folder loads. */
    lastSeenContentRefreshTick = -1;
    /** Skips the initial clipboardPasteTick effect run. */
    lastSeenClipboardPasteTick = -1;
    /** Clipboard paste results not yet visible in @children (eventual consistency on Cloud). */
    pendingPasteEntries = new Map();
    browsePath = signal('/', ...(ngDevMode ? [{ debugName: "browsePath" }] : []));
    browsePath$ = new Subject();
    // Details side panel
    panelOpen = signal(false, ...(ngDevMode ? [{ debugName: "panelOpen" }] : []));
    panelSubTab = signal('info', ...(ngDevMode ? [{ debugName: "panelSubTab" }] : []));
    tags = computed(() => {
        const doc = this.currentDoc();
        if (!doc)
            return [];
        const raw = doc.properties?.['nxtag:tags'];
        if (!raw)
            return [];
        return raw.map((t) => (typeof t === 'string' ? t : t.label));
    }, ...(ngDevMode ? [{ debugName: "tags" }] : []));
    activityEntries = signal([], ...(ngDevMode ? [{ debugName: "activityEntries" }] : []));
    activityLoading = signal(false, ...(ngDevMode ? [{ debugName: "activityLoading" }] : []));
    // Tag autocomplete
    tagInput = '';
    tagSearchResults = signal([], ...(ngDevMode ? [{ debugName: "tagSearchResults" }] : []));
    showCreateOption = signal(false, ...(ngDevMode ? [{ debugName: "showCreateOption" }] : []));
    tagSearch$ = new Subject();
    // Tabs
    activeTabIndex = signal(0, ...(ngDevMode ? [{ debugName: "activeTabIndex" }] : []));
    // Permissions tab
    permissionsLoaded = signal(false, ...(ngDevMode ? [{ debugName: "permissionsLoaded" }] : []));
    permissionsLoading = signal(false, ...(ngDevMode ? [{ debugName: "permissionsLoading" }] : []));
    permissionsPanelId = NXS_PERMISSIONS_PANEL_ID;
    /** The panel's writes can change the external-user shares this tab reads itself. */
    onPermissionsChanged = () => this.reloadPermissions();
    externalAces = computed(() => {
        const doc = this.currentDoc();
        const acls = doc?.contextParameters?.['acls'];
        if (!acls)
            return [];
        return acls.flatMap((a) => a.aces).filter((ace) => ace.externalUser && ace.granted);
    }, ...(ngDevMode ? [{ debugName: "externalAces" }] : []));
    canWriteCurrentDoc = computed(() => canWriteDocument(this.currentDoc()), ...(ngDevMode ? [{ debugName: "canWriteCurrentDoc" }] : []));
    canCreateContentHere = computed(() => {
        const doc = this.currentDoc();
        if (!doc || doc.type === 'Favorites' || !canAddChildren(doc) || !this.isBrowseFolderish(doc)) {
            return false;
        }
        return !isDomainParentType(doc.type) && !isRestrictedImportParentPath(doc.path);
    }, ...(ngDevMode ? [{ debugName: "canCreateContentHere" }] : []));
    canRemoveCurrentDoc = computed(() => canRemoveDocument(this.currentDoc()), ...(ngDevMode ? [{ debugName: "canRemoveCurrentDoc" }] : []));
    singleSelectedEntry = computed(() => {
        const ids = [...this.selectionService.selectedIds()];
        if (ids.length !== 1)
            return null;
        const id = ids[0];
        return this.entries().find((doc) => doc.uid === id) ?? null;
    }, ...(ngDevMode ? [{ debugName: "singleSelectedEntry" }] : []));
    showHeaderEdit = computed(() => {
        const selected = this.singleSelectedEntry();
        if (selected && isCollectionDocument(selected)) {
            return canShowWriteDocumentAction(selected);
        }
        return this.canWriteCurrentDoc();
    }, ...(ngDevMode ? [{ debugName: "showHeaderEdit" }] : []));
    showHeaderDelete = computed(() => {
        if (this.selectionService.selectedCount() > 0) {
            return this.selectedEntries().some((doc) => canShowRemoveDocumentAction(doc));
        }
        return this.canRemoveCurrentDoc();
    }, ...(ngDevMode ? [{ debugName: "showHeaderDelete" }] : []));
    canManageCurrentPermissions = computed(() => canManageDocumentPermissions(this.currentDoc()), ...(ngDevMode ? [{ debugName: "canManageCurrentPermissions" }] : []));
    actionInProgress = signal(null, ...(ngDevMode ? [{ debugName: "actionInProgress" }] : []));
    // History tab
    auditEntries = signal([], ...(ngDevMode ? [{ debugName: "auditEntries" }] : []));
    auditLoading = signal(false, ...(ngDevMode ? [{ debugName: "auditLoading" }] : []));
    auditTotalSize = signal(0, ...(ngDevMode ? [{ debugName: "auditTotalSize" }] : []));
    auditPageSize = signal(10, ...(ngDevMode ? [{ debugName: "auditPageSize" }] : []));
    auditPageIndex = signal(0, ...(ngDevMode ? [{ debugName: "auditPageIndex" }] : []));
    historyLoaded = false;
    /**
     * History-tab filter and sort state, as signals.
     *
     * These were plain fields, and `filteredAuditEntries` below is a `computed()`
     * that reads them. A computed only recomputes when a tracked *signal*
     * dependency changes, so its sole dependency was `auditEntries` — every
     * filter keystroke and every column sort updated the field, left the memoised
     * value in place, and the History tab did not move. The browse document list
     * next to it already held its filters in signals; this half had been missed.
     */
    filterUsername = signal('', ...(ngDevMode ? [{ debugName: "filterUsername" }] : []));
    filterDateFrom = signal(null, ...(ngDevMode ? [{ debugName: "filterDateFrom" }] : []));
    filterDateTo = signal(null, ...(ngDevMode ? [{ debugName: "filterDateTo" }] : []));
    filterAction = signal('', ...(ngDevMode ? [{ debugName: "filterAction" }] : []));
    filterCategory = signal('', ...(ngDevMode ? [{ debugName: "filterCategory" }] : []));
    availableActions = signal([], ...(ngDevMode ? [{ debugName: "availableActions" }] : []));
    availableCategories = signal([], ...(ngDevMode ? [{ debugName: "availableCategories" }] : []));
    eventTypeLabelMap = signal({}, ...(ngDevMode ? [{ debugName: "eventTypeLabelMap" }] : []));
    eventCategoryLabelMap = signal({}, ...(ngDevMode ? [{ debugName: "eventCategoryLabelMap" }] : []));
    sortActive = signal('eventDate', ...(ngDevMode ? [{ debugName: "sortActive" }] : []));
    sortDirection = signal('desc', ...(ngDevMode ? [{ debugName: "sortDirection" }] : []));
    filteredAuditEntries = computed(() => {
        let entries = this.auditEntries();
        const username = this.filterUsername();
        const dateFrom = this.filterDateFrom();
        const dateTo = this.filterDateTo();
        const action = this.filterAction();
        const category = this.filterCategory();
        const sortActive = this.sortActive();
        const sortDirection = this.sortDirection();
        if (username) {
            const term = username.toLowerCase();
            entries = entries.filter((e) => e.principalName?.toLowerCase().includes(term));
        }
        if (dateFrom) {
            const from = dateFrom.getTime();
            entries = entries.filter((e) => new Date(e.eventDate).getTime() >= from);
        }
        if (dateTo) {
            const to = dateTo.getTime() + 86_400_000;
            entries = entries.filter((e) => new Date(e.eventDate).getTime() < to);
        }
        if (action) {
            entries = entries.filter((e) => e.eventId === action);
        }
        if (category) {
            entries = entries.filter((e) => e.category === category);
        }
        if (sortActive && sortDirection) {
            const dir = sortDirection === 'asc' ? 1 : -1;
            const key = sortActive;
            entries = [...entries].sort((a, b) => {
                const va = String(a[key] ?? '');
                const vb = String(b[key] ?? '');
                return va.localeCompare(vb) * dir;
            });
        }
        return entries;
    }, ...(ngDevMode ? [{ debugName: "filteredAuditEntries" }] : []));
    // Trash tab
    trashedDocs = signal([], ...(ngDevMode ? [{ debugName: "trashedDocs" }] : []));
    trashLoading = signal(false, ...(ngDevMode ? [{ debugName: "trashLoading" }] : []));
    trashLoaded = false;
    // View toggle
    viewMode = signal('list', ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    csvExporting = signal(false, ...(ngDevMode ? [{ debugName: "csvExporting" }] : []));
    // ── Column settings ──
    //
    // Three layers, narrowest last: packaged descriptors registered into the
    // `documentList` slot, then the manifest's hide/reorder/relabel by id, then the
    // user's own picker. `columns` is computed rather than a signal so a manifest
    // change reflows without a reload; the user's choice is the only mutable part.
    /** Keys the user switched on, or `null` if they have never chosen. */
    userVisibleKeys = signal(loadColumnVisibility(), ...(ngDevMode ? [{ debugName: "userVisibleKeys" }] : []));
    /**
     * Descriptors resolved through Layer 1, falling back to the packaged list.
     *
     * The fallback matters: a bare `TestBed` has no `APP_INITIALIZER`, so the slot
     * is empty there, and rendering a document list with no columns at all would be
     * a worse failure than using the defaults. This mirrors how `app-config` treats
     * an absent manifest — tolerant, with the packaged values reproducing the
     * pre-Layer-1 behaviour exactly.
     */
    columnDescriptors = computed(() => {
        const resolved = this.extensions.resolve(EXTENSION_SLOTS.documentList, this.ruleContext.context());
        return resolved.length > 0 ? resolved : FALLBACK_COLUMN_DESCRIPTORS;
    }, ...(ngDevMode ? [{ debugName: "columnDescriptors" }] : []));
    columns = computed(() => {
        const chosen = this.userVisibleKeys();
        return this.columnDescriptors().map((descriptor) => ({
            key: descriptor.field,
            label: descriptor.label,
            // Carried through so the template can prefer the key; `ColumnDef` is a view model, and
            // resolving here would mean the header stopped following a language change.
            labelKey: descriptor.labelKey,
            visible: chosen ? chosen.includes(descriptor.field) : !descriptor.hiddenByDefault,
        }));
    }, ...(ngDevMode ? [{ debugName: "columns" }] : []));
    visibleColumns = computed(() => this.columns().filter((c) => c.visible), ...(ngDevMode ? [{ debugName: "visibleColumns" }] : []));
    columnPanelOpen = signal(false, ...(ngDevMode ? [{ debugName: "columnPanelOpen" }] : []));
    /** Title keys every row; the picker will not let a user switch it off. */
    requiredColumnKeys = ['title'];
    /** What Reset returns to: the descriptors' defaults, so a manifest-hidden column stays hidden. */
    defaultColumnKeys = computed(() => this.columnDescriptors()
        .filter((descriptor) => !descriptor.hiddenByDefault)
        .map((descriptor) => descriptor.field), ...(ngDevMode ? [{ debugName: "defaultColumnKeys" }] : []));
    /**
     * The active language as a signal. `translate.instant` is not reactive, so the picker's
     * labels read this to follow a language change.
     */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.currentLang });
    /** The columns as the picker offers them: names resolved for the active language. */
    pickerColumns = computed(() => {
        this.currentLang();
        return this.columns().map((column) => ({
            key: column.key,
            label: descriptorLabel(column, (key) => this.translate.instant(key)),
            visible: column.visible,
        }));
    }, ...(ngDevMode ? [{ debugName: "pickerColumns" }] : []));
    /**
     * The browse document context menu, resolved through Layer 1.
     *
     * Share, Notify Me / Unsubscribe and Export were three fixed `mat-menu-item`
     * elements here. They are the same three, in the same order, with the same
     * icons; what changed is that each is addressable by id, so a manifest can
     * hide, reorder, relabel or gate one, and a customer library can add a fourth
     * with a registration instead of an edit to this template.
     */
    contextMenuActions = computed(() => this.extensions.resolve(EXTENSION_SLOTS.contextMenu, this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "contextMenuActions" }] : []));
    /** The context menu as `nxs-action-menu` renders it: labels translated, enabled rules applied. */
    contextMenuItems = computed(() => {
        this.currentLang();
        return this.contextMenuActions().map((action) => ({
            id: action.id,
            label: descriptorLabel(action, (key) => this.translate.instant(key)),
            icon: action.icon,
            disabled: !this.isContextMenuActionEnabled(action),
        }));
    }, ...(ngDevMode ? [{ debugName: "contextMenuItems" }] : []));
    /**
     * Publish this surface's interface state so the context-menu rules can read it.
     *
     * `app.rules.isSubscribed` decides which half of the Notify Me / Unsubscribe
     * toggle is offered, and subscription state is not on the document model the
     * rule context carries — it is an enricher on the folder this page loaded.
     * Cleared on destroy, so the next surface does not inherit it.
     */
    publishFlagsToRuleContext = effect(() => this.ruleContext.flags.set({ subscribed: this.isSubscribed() === true }), ...(ngDevMode ? [{ debugName: "publishFlagsToRuleContext" }] : []));
    // Filters
    filterText = signal('', ...(ngDevMode ? [{ debugName: "filterText" }] : []));
    filterType = signal('', ...(ngDevMode ? [{ debugName: "filterType" }] : []));
    filterModifiedFrom = signal(null, ...(ngDevMode ? [{ debugName: "filterModifiedFrom" }] : []));
    filterModifiedTo = signal(null, ...(ngDevMode ? [{ debugName: "filterModifiedTo" }] : []));
    filterContributor = signal('', ...(ngDevMode ? [{ debugName: "filterContributor" }] : []));
    distinctTypes = computed(() => {
        const types = new Set(this.entries().map((e) => e.type));
        return Array.from(types).sort();
    }, ...(ngDevMode ? [{ debugName: "distinctTypes" }] : []));
    filteredEntries = computed(() => {
        let docs = this.entries();
        const text = this.filterText();
        const type = this.filterType();
        const modFrom = this.filterModifiedFrom();
        const modTo = this.filterModifiedTo();
        const contributor = this.filterContributor();
        if (text) {
            const term = text.toLowerCase();
            docs = docs.filter((d) => d.title.toLowerCase().includes(term));
        }
        if (type) {
            docs = docs.filter((d) => d.type === type);
        }
        if (modFrom) {
            const from = modFrom.getTime();
            docs = docs.filter((d) => new Date(d.lastModified).getTime() >= from);
        }
        if (modTo) {
            const to = modTo.getTime() + 86_400_000;
            docs = docs.filter((d) => new Date(d.lastModified).getTime() < to);
        }
        if (contributor) {
            const term = contributor.toLowerCase();
            docs = docs.filter((d) => (d.properties?.['dc:lastContributor'] ?? '').toLowerCase().includes(term));
        }
        // Never sorted here: the page arrives in the server's order, which is the order the user
        // asked for. Sorting a page in the browser once hid a sort the server had dropped.
        return docs;
    }, ...(ngDevMode ? [{ debugName: "filteredEntries" }] : []));
    /** Whether a toolbar filter narrows the page on screen. */
    filtersActive = computed(() => !!this.filterText() ||
        !!this.filterType() ||
        !!this.filterModifiedFrom() ||
        !!this.filterModifiedTo() ||
        !!this.filterContributor(), ...(ngDevMode ? [{ debugName: "filtersActive" }] : []));
    /**
     * The count beside the toolbar: what a filter left of this page, else Nuxeo's total, else
     * nothing — a page of fifty from a folder Nuxeo did not count is not "50 results".
     */
    resultCount = computed(() => {
        if (this.filtersActive())
            return this.filteredEntries().length;
        const total = this.totalSize();
        return total >= 0 ? total : null;
    }, ...(ngDevMode ? [{ debugName: "resultCount" }] : []));
    /** The visible columns as the document list takes them: translated, sortable where the server sorts. */
    listColumns = computed(() => {
        this.currentLang();
        return this.visibleColumns().map((column) => ({
            key: column.key,
            label: descriptorLabel(column, (key) => this.translate.instant(key)),
            sortable: column.key in SORT_FIELDS,
        }));
    }, ...(ngDevMode ? [{ debugName: "listColumns" }] : []));
    listSelectedIds = computed(() => [...this.selectionService.selectedIds()], ...(ngDevMode ? [{ debugName: "listSelectedIds" }] : []));
    /**
     * Each row's menu: the `rowActions` slot resolved with that row's document in focus, so a rule
     * reads the row's permissions, not the folder's. A collection listed here also keeps its Edit.
     */
    rowMenus = computed(() => {
        this.currentLang();
        const base = this.ruleContext.context();
        const menus = {};
        for (const doc of this.filteredEntries()) {
            const context = { ...base, document: doc };
            const entries = this.extensions
                .resolve(EXTENSION_SLOTS.rowActions, context)
                .map((action) => ({
                id: action.id,
                label: descriptorLabel(action, (key) => this.translate.instant(key)),
                icon: action.icon,
                disabled: !this.extensions.evaluateRule(action.enabledRule, context),
            }));
            if (this.isCollectionEntry(doc) && this.canEditCollectionEntry(doc)) {
                entries.unshift({
                    id: 'collection.edit',
                    label: this.translate.instant('browse.browse.edit'),
                    icon: 'edit',
                });
            }
            if (entries.length > 0)
                menus[doc.uid] = entries;
        }
        return menus;
    }, ...(ngDevMode ? [{ debugName: "rowMenus" }] : []));
    // Subscription state
    isSubscribed = computed(() => {
        const doc = this.currentDoc();
        const notifs = doc?.contextParameters?.['subscribedNotifications'];
        return notifs && notifs.length > 0;
    }, ...(ngDevMode ? [{ debugName: "isSubscribed" }] : []));
    /** Rendered by ID, so the product shows Satori's and a host without it the built-in one. */
    breadcrumbsId = NXS_PRIMITIVE_IDS.breadcrumbs;
    breadcrumbs = computed(() => {
        this.currentLang();
        const doc = this.currentDoc();
        // A folder that could not be opened has no document, so its trail comes from the address and
        // never ends at the folder shown before it.
        const path = doc?.path ?? this.unopenedPath();
        const crumbs = [
            { label: this.translate.instant('browse.breadcrumb.root'), routerLink: '/browse' },
        ];
        if (!path || path === '/')
            return crumbs;
        const parts = path.split('/').filter(Boolean);
        let accumulated = '';
        for (const part of parts) {
            accumulated += `/${part}`;
            const isCurrent = accumulated === path;
            const label = isCurrent && doc ? doc.title : decodeNuxeoPathSegment(part);
            if (isCurrent) {
                crumbs.push({ label });
            }
            else {
                crumbs.push({ label, routerLink: `/browse${accumulated}` });
            }
        }
        return crumbs;
    }, ...(ngDevMode ? [{ debugName: "breadcrumbs" }] : []));
    showBreadcrumbs = computed(() => {
        const doc = this.currentDoc();
        if (!doc?.path)
            return true;
        return shouldShowUserWorkspaceBreadcrumbs(doc.path, this.currentUsername(), this.adminAccess.isAdministrator());
    }, ...(ngDevMode ? [{ debugName: "showBreadcrumbs" }] : []));
    /** `enabledRule` renders a menu item disabled rather than hiding it. */
    isContextMenuActionEnabled(action) {
        return this.extensions.evaluateRule(action.enabledRule, this.ruleContext.context());
    }
    runContextMenuAction(action) {
        this.actionRegistry.execute(action, this.ruleContext.context());
    }
    /** The descriptor behind the entry chosen in `nxs-action-menu`, run through the registry. */
    runContextMenuItem(item) {
        const action = this.contextMenuActions().find((candidate) => candidate.id === item.id);
        if (action)
            this.runContextMenuAction(action);
    }
    /**
     * The behaviour behind the packaged context-menu ids.
     *
     * Registered from the component rather than from `provideSatoriExtensions`
     * because each handler closes over this instance, and withdrawn on destroy for
     * the same reason: a handler left registered keeps a destroyed component
     * reachable and would run against dead state. Withdrawing the registration
     * rather than the ids is what leaves a customer's handler for the same id
     * untouched.
     */
    registerContextMenuHandlers() {
        const registration = this.actionRegistry.registerPackaged({
            'app.contextMenu.share': { execute: () => this.openShareDialog() },
            'app.contextMenu.subscribe': { execute: () => this.toggleNotify() },
            'app.contextMenu.unsubscribe': { execute: () => this.toggleNotify() },
            'app.contextMenu.export': { execute: () => this.openExportDialog() },
            'app.rowActions.download': {
                execute: (context) => this.withRow(context, (doc) => this.downloadEntry(doc)),
            },
            'app.rowActions.rename': {
                execute: (context) => this.withRow(context, (doc) => this.renameEntry(doc)),
            },
            'app.rowActions.copyTo': {
                execute: (context) => this.withRow(context, (doc) => this.copyOrMoveEntry('copy', doc)),
            },
            'app.rowActions.moveTo': {
                execute: (context) => this.withRow(context, (doc) => this.copyOrMoveEntry('move', doc)),
            },
            'app.rowActions.delete': {
                execute: (context) => this.withRow(context, (doc) => this.trashEntry(doc)),
            },
        });
        this.destroyRef.onDestroy(() => {
            registration.unregister();
            this.ruleContext.flags.set({});
        });
    }
    /** A row action runs on the row's document, which arrives as the context's focused one. */
    withRow(context, run) {
        if (context.document)
            run(context.document);
    }
    constructor() {
        this.registerContextMenuHandlers();
        const initialPath = parseBrowseNuxeoPathFromRouterUrl(this.router.url);
        this.currentNuxeoPath = initialPath;
        this.browsePath.set(initialPath);
        if (isBrowseRouterUrl(this.router.url)) {
            this.browseContext.setFromRouterUrl(this.router.url);
        }
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd), map(() => parseBrowseNuxeoPathFromRouterUrl(this.router.url)), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((nuxeoPath) => {
            this.resetBrowseTabState();
            this.currentNuxeoPath = nuxeoPath;
            this.browsePath.set(nuxeoPath);
            this.pageIndex.set(0);
            if (isBrowseRouterUrl(this.router.url)) {
                this.browseContext.setFromRouterUrl(this.router.url);
            }
            this.browsePath$.next({ nuxeoPath, pageIndex: 0 });
        });
        this.browsePath$
            .pipe(switchMap(({ nuxeoPath, pageIndex }) => {
            this.loading.set(true);
            this.error.set(null);
            return this.browseService
                .getBrowseFolderContents(nuxeoPath, PAGE_SIZE, {
                currentPageIndex: pageIndex,
                sort: this.serverSort(),
            })
                .pipe(map((result) => ({ nuxeoPath, pageIndex, result })), catchError((error) => of({ nuxeoPath, pageIndex, error: nxsErrorStatus(error) })));
        }), takeUntilDestroyed())
            .subscribe((payload) => {
            if (payload.nuxeoPath !== this.currentNuxeoPath)
                return;
            if (payload.pageIndex !== this.pageIndex())
                return;
            if ('error' in payload) {
                this.errorStatus.set(payload.error);
                this.error.set(this.translate.instant('browse.message.failed-to-load-folder-contents'));
                this.loading.set(false);
                // Another folder failing leaves nothing of the one before it — not its title and
                // actions in the header, its count, nor the end of the trail. The same folder failing
                // on another page or order keeps them.
                if (payload.nuxeoPath !== this.openedPath) {
                    this.openedPath = null;
                    this.currentDoc.set(null);
                    this.entries.set([]);
                    this.totalSize.set(-1);
                    this.unopenedPath.set(payload.nuxeoPath);
                }
                return;
            }
            const { folder, entries, totalSize, redirectTo } = payload.result;
            if (redirectTo) {
                this.loading.set(false);
                void this.router.navigateByUrl(`/browse${redirectTo}`, { replaceUrl: true });
                return;
            }
            this.currentDoc.set(folder);
            this.openedPath = payload.nuxeoPath;
            this.unopenedPath.set(null);
            this.browseContext.setFromNuxeoPath(folder.path);
            this.entries.set(entries);
            this.hasNextPage.set(payload.result.hasNextPage === true);
            this.reconcilePendingPasteEntries(entries);
            const pendingCount = this.pendingPasteEntries.size;
            this.totalSize.set(totalSize === entries.length ? totalSize + pendingCount : totalSize);
            this.loading.set(false);
            this.syncClipboardTarget(folder, payload.nuxeoPath);
            if (folder.uid && folder.uid !== 'virtual-root') {
                this.loadActivity(folder.uid);
            }
        });
        this.browsePath$.next({ nuxeoPath: initialPath, pageIndex: 0 });
        effect(() => {
            const tick = this.browseContext.contentRefreshTick();
            const previousTick = this.lastSeenContentRefreshTick;
            this.lastSeenContentRefreshTick = tick;
            if (previousTick < 0 || tick === previousTick) {
                return;
            }
            untracked(() => {
                if (this.currentNuxeoPath) {
                    this.loadContent();
                }
            });
        });
        effect(() => {
            const tick = this.browseContext.clipboardPasteTick();
            const previousTick = this.lastSeenClipboardPasteTick;
            this.lastSeenClipboardPasteTick = tick;
            if (previousTick < 0 || tick === previousTick) {
                return;
            }
            untracked(() => {
                const paste = this.browseContext.consumeClipboardPasteEvent();
                if (!paste) {
                    return;
                }
                const current = this.currentDoc();
                if (current?.uid === paste.targetUid) {
                    this.applyClipboardPasteToListing(paste.documents);
                }
                if (this.currentNuxeoPath) {
                    timer(1500)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(() => {
                        if (this.currentDoc()?.uid === paste.targetUid && this.currentNuxeoPath) {
                            this.loadContent();
                        }
                    });
                }
            });
        });
        this.destroyRef.onDestroy(() => {
            this.clipboardTargetService.clear();
        });
        this.tagSearch$
            .pipe(debounceTime(250), distinctUntilChanged(), switchMap((term) => term.length > 0
            ? this.tagService.searchTags(term).pipe(catchError(() => of([])))
            : of([])), takeUntilDestroyed())
            .subscribe((results) => {
            const existing = this.tags();
            const filtered = results.filter((r) => !existing.includes(r));
            this.tagSearchResults.set(filtered);
            const exactMatch = results.some((r) => r.toLowerCase() === this.tagInput.toLowerCase());
            this.showCreateOption.set(this.tagInput.trim().length > 0 && !exactMatch);
        });
    }
    // ── Content loading ──
    syncClipboardTarget(folder, nuxeoPath) {
        if (!isFolderishDocument(folder) || folder.uid === 'virtual-root') {
            this.clipboardTargetService.clear();
            return;
        }
        const path = folder.path ?? nuxeoPath;
        this.browseService
            .getFolderContext(path)
            .pipe(catchError(() => of(folder)), takeUntilDestroyed(this.destroyRef))
            .subscribe((doc) => {
            if (nuxeoPath !== this.currentNuxeoPath)
                return;
            this.clipboardTargetService.setTarget(doc);
        });
    }
    resetBrowseTabState() {
        this.historyLoaded = false;
        this.trashLoaded = false;
        this.permissionsLoaded.set(false);
        this.permissionsLoading.set(false);
        this.activeTabIndex.set(0);
        this.pendingPasteEntries.clear();
    }
    loadContent() {
        this.browsePath$.next({ nuxeoPath: this.currentNuxeoPath, pageIndex: this.pageIndex() });
    }
    /** Another page of the same folder, in the same order. */
    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex === this.pageIndex())
            return;
        this.pageIndex.set(pageIndex);
        this.loadContent();
    }
    /** A new order starts again from the first page: page three of another order is another set. */
    onListSortChange(sort) {
        this.listSort.set(sort);
        this.pageIndex.set(0);
        this.loadContent();
    }
    /** The list's order as Nuxeo takes it; a column outside `SORT_FIELDS` is never sent. */
    serverSort() {
        const sort = this.listSort();
        const field = sort ? SORT_FIELDS[sort.key] : undefined;
        if (!sort || !field)
            return [];
        return [{ sortBy: field, sortOrder: sort.direction === 'asc' ? 'ASC' : 'DESC' }];
    }
    /** The list's selection, written back to the shared service with each document's title and type. */
    onListSelectionChange(ids) {
        const next = new Set(ids);
        const current = this.selectionService.selectedIds();
        for (const id of current) {
            if (!next.has(id))
                this.selectionService.toggle(id);
        }
        for (const id of ids) {
            if (current.has(id))
                continue;
            const doc = this.entries().find((entry) => entry.uid === id);
            this.selectionService.toggle(id, doc?.title ?? id, null, doc?.type);
        }
    }
    /** Runs a row menu's entry through the registry, with the row's document in focus. */
    onRowAction({ action, document }) {
        if (action.id === 'collection.edit') {
            this.openEditCollectionDialog(document);
            return;
        }
        const context = { ...this.ruleContext.context(), document };
        const descriptor = this.extensions
            .resolve(EXTENSION_SLOTS.rowActions, context)
            .find((candidate) => candidate.id === action.id);
        if (descriptor)
            this.actionRegistry.execute(descriptor, context);
    }
    // ── Files dropped on the list ──
    /** Uploads files dropped on the list into the folder on screen, as Create / Import's do. */
    uploadDropped(files) {
        const folder = this.currentDoc();
        if (!folder || !this.canCreateContentHere())
            return;
        if (this.droppedUploads.busy()) {
            this.toast.show(this.translate.instant('browse.message.upload-in-progress'));
            return;
        }
        this.droppedUploads.clearDone();
        this.droppedUploads.stage(files);
        this.droppedUploadPath = folder.path;
        this.runDroppedUploads();
    }
    /** Uploads what is pending in the dropped files' queue: all of them, or what failed last time. */
    runDroppedUploads() {
        const path = this.droppedUploadPath;
        const files = this.droppedUploads.pending();
        if (!path || files.length === 0 || this.droppedUploads.busy())
            return;
        this.droppedUploads.start();
        this.importService
            .importFiles(path, files, {
            onProgress: (progress) => this.droppedUploads.progress(progress),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (docs) => {
                this.droppedUploads.complete(docs);
                this.toast.show(this.translate.instant(docs.length === 1
                    ? 'common.count.created-file-one'
                    : 'common.count.created-file-many', { count: docs.length }));
                this.afterDroppedUpload(path);
            },
            error: (err) => {
                this.droppedUploads.fail(err);
                this.toast.error(this.translate.instant(isPermissionDeniedError(err) ? PERMISSION_DENIED_KEY : 'browse.message.upload-failed'));
                if (this.droppedUploads.done().length > 0)
                    this.afterDroppedUpload(path);
            },
        });
    }
    afterDroppedUpload(path) {
        this.browseContext.requestTreeRefresh();
        if (nuxeoPathsEqualFlexible(path, this.currentDoc()?.path ?? ''))
            this.loadContent();
    }
    // ── Row actions ──
    /** The row's main file, saved by the browser under the file's own name. */
    downloadEntry(doc) {
        this.detailService
            .fetchBlob(doc.uid, { clientReason: 'download' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                const content = doc.properties?.['file:content'];
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = content?.name || doc.title || 'download';
                link.click();
                URL.revokeObjectURL(url);
            },
            error: (err) => this.toast.error(this.translate.instant(isPermissionDeniedError(err)
                ? PERMISSION_DENIED_KEY
                : 'browse.message.download-failed')),
        });
    }
    /** Changes the row's title; its path name stays, so links to it keep working. */
    renameEntry(doc) {
        // The packaged rule's Immutable restriction, held here too because a manifest may clear the
        // rule, and a version's or publication's permissions still list Write.
        if (doc.facets?.includes('Immutable')) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        this.dialog
            .open(NxsRenameDialogComponent, {
            data: { documentId: doc.uid, title: doc.title },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updated) => {
            if (!updated)
                return;
            this.toast.show(this.translate.instant('browse.message.renamed', { name: updated.title ?? doc.title }));
            this.browseContext.requestTreeRefresh();
            this.loadContent();
        });
    }
    /** Chooses a folder, then copies or moves the row there. */
    copyOrMoveEntry(operation, doc) {
        const here = this.currentDoc()?.path;
        const data = {
            heading: this.translate.instant(operation === 'copy'
                ? 'browse.row-actions.copy-heading'
                : 'browse.row-actions.move-heading', { name: doc.title }),
            confirmLabel: this.translate.instant(operation === 'copy' ? 'browse.row-actions.copy-here' : 'browse.row-actions.move-here'),
            initialPath: here,
            excludePath: this.isFolderish(doc) ? doc.path : undefined,
            currentParentPath: operation === 'move' ? here : undefined,
        };
        this.dialog
            .open(NxsFolderPickerDialogComponent, { data })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef), filter((target) => !!target), switchMap((target) => (operation === 'copy'
            ? this.browseService.copyDocuments([doc.uid], target.uid)
            : this.browseService.moveDocuments([doc.uid], target.uid)).pipe(map(() => target))))
            .subscribe({
            next: (target) => {
                this.toast.show(this.translate.instant(operation === 'copy' ? 'browse.message.copied-to' : 'browse.message.moved-to', { name: doc.title, folder: target.title }));
                if (operation === 'move' && this.selectionService.isSelected(doc.uid)) {
                    this.selectionService.toggle(doc.uid);
                }
                this.browseContext.requestTreeRefresh();
                this.loadContent();
            },
            error: (err) => this.toast.error(this.translate.instant(isPermissionDeniedError(err)
                ? PERMISSION_DENIED_KEY
                : operation === 'copy'
                    ? 'browse.message.failed-to-copy'
                    : 'browse.message.failed-to-move')),
        });
    }
    /** Moves the row to the trash, after the same confirmation as the header's Delete. */
    trashEntry(doc) {
        if (isCollectionDocument(doc)) {
            this.deleteCollectionEntry(doc);
            return;
        }
        const guard$ = doc.type === 'Collections' ? this.browseService.hasChildCollections(doc.uid) : of(false);
        guard$
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((blocked) => {
            if (blocked) {
                this.showCollectionsFolderDeleteBlockedMessage();
                return EMPTY;
            }
            return this.dialog
                .open(ConfirmDialogComponent, {
                data: trashDocumentConfirmData(doc.title, (key, params) => this.translate.instant(key, params)),
            })
                .afterClosed();
        }), filter((confirmed) => confirmed === true), switchMap(() => this.detailService.trashDocument(doc.uid)))
            .subscribe({
            next: () => {
                if (this.selectionService.isSelected(doc.uid))
                    this.selectionService.toggle(doc.uid);
                this.toast.show(this.translate.instant('browse.message.moved-to-trash'));
                this.browseContext.requestTreeRefresh();
                this.loadContent();
            },
            error: (err) => this.toast.error(this.translate.instant(isPermissionDeniedError(err)
                ? PERMISSION_DENIED_KEY
                : 'browse.message.failed-to-delete')),
        });
    }
    /** Merge clipboard copy/move API results into the visible folder (Web UI updates listing immediately). */
    applyClipboardPasteToListing(documents) {
        if (documents.length === 0) {
            return;
        }
        for (const doc of documents) {
            if (doc.uid) {
                this.pendingPasteEntries.set(doc.uid, doc);
            }
        }
        let added = 0;
        let additions = [];
        const previousEntryCount = this.entries().length;
        const previousTotalSize = this.totalSize();
        this.entries.update((entries) => {
            const existingUids = new Set(entries.map((entry) => entry.uid));
            additions = documents.filter((doc) => doc.uid && !existingUids.has(doc.uid));
            added = additions.length;
            return additions.length > 0 ? [...entries, ...additions] : entries;
        });
        if (added > 0) {
            if (previousTotalSize === previousEntryCount) {
                this.totalSize.update((count) => count + added);
            }
        }
    }
    /** Keep optimistic paste rows until Nuxeo @children includes them. */
    reconcilePendingPasteEntries(serverEntries) {
        if (this.pendingPasteEntries.size === 0) {
            return;
        }
        const serverUids = new Set(serverEntries.map((entry) => entry.uid));
        for (const uid of serverUids) {
            this.pendingPasteEntries.delete(uid);
        }
        const pending = [...this.pendingPasteEntries.values()];
        if (pending.length === 0) {
            return;
        }
        this.entries.update((current) => {
            const currentUids = new Set(current.map((entry) => entry.uid));
            const additions = pending.filter((doc) => doc.uid && !currentUids.has(doc.uid));
            return additions.length > 0 ? [...current, ...additions] : current;
        });
    }
    // ── Details side panel ──
    togglePanel() {
        this.panelOpen.update((v) => !v);
    }
    closePanel() {
        this.panelOpen.set(false);
    }
    switchPanelSubTab(tab) {
        this.panelSubTab.set(tab);
    }
    loadActivity(uid) {
        if (!this.currentDoc()) {
            this.activityLoading.set(false);
            return;
        }
        if (!canViewDocumentAuditLog(this.currentDoc())) {
            this.activityEntries.set([]);
            this.activityLoading.set(false);
            return;
        }
        this.activityLoading.set(true);
        this.detailService
            .getAuditLog(uid, 5, 0)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.activityEntries.set(res.entries);
                this.activityLoading.set(false);
            },
            error: () => this.activityLoading.set(false),
        });
    }
    onTagSearch(term) {
        this.tagSearch$.next(term);
    }
    selectTag(label) {
        this.applyTag(label);
    }
    createTag() {
        const label = this.tagInput.trim();
        if (label)
            this.applyTag(label);
    }
    applyTag(label) {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.tagService.addTag(doc.uid, label).subscribe({
            next: () => {
                this.tagInput = '';
                this.tagSearchResults.set([]);
                this.showCreateOption.set(false);
                this.browseService.getByPath(this.currentNuxeoPath).subscribe({
                    next: (d) => this.currentDoc.set(d),
                });
                this.toast.show(this.translate.instant('common.tag-added', { name: label }));
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-add-tag')),
        });
    }
    removeTag(label) {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.tagService.removeTag(doc.uid, label).subscribe({
            next: () => {
                this.browseService.getByPath(this.currentNuxeoPath).subscribe({
                    next: (d) => this.currentDoc.set(d),
                });
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-remove-tag')),
        });
    }
    // ── Tab changes ──
    onTabChange(index) {
        this.activeTabIndex.set(index);
        if (index === 1) {
            this.loadPermissions();
        }
        if (index === 2 && !this.historyLoaded) {
            this.loadDirectoryEntries();
            this.loadAuditLog();
        }
        if (index === 3 && !this.trashLoaded) {
            this.loadTrash();
        }
    }
    // ── History tab ──
    loadDirectoryEntries() {
        forkJoin([
            this.directoryService.getEventTypes(),
            this.directoryService.getEventCategories(),
        ]).subscribe({
            next: ([types, cats]) => {
                this.availableActions.set(types);
                this.availableCategories.set(cats);
                const typeMap = {};
                for (const t of types)
                    typeMap[t.id] = t.label;
                this.eventTypeLabelMap.set(typeMap);
                const catMap = {};
                for (const c of cats)
                    catMap[c.id] = c.label;
                this.eventCategoryLabelMap.set(catMap);
            },
        });
    }
    loadAuditLog() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        if (!canViewDocumentAuditLog(doc)) {
            this.auditEntries.set([]);
            this.auditTotalSize.set(0);
            this.auditLoading.set(false);
            this.historyLoaded = true;
            return;
        }
        this.auditLoading.set(true);
        this.detailService
            .getAuditLog(doc.uid, this.auditPageSize(), this.auditPageIndex())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                this.auditEntries.set(res.entries);
                this.auditTotalSize.set(res.resultsCount ?? res.totalSize ?? res.entries.length);
                this.auditLoading.set(false);
                this.historyLoaded = true;
            },
            error: () => this.auditLoading.set(false),
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
        return this.eventTypeLabelMap()[eventId] ?? eventId;
    }
    activityLabel(entry) {
        return auditActivityLabel(entry, this.eventTypeLabelMap());
    }
    categoryLabel(category) {
        return this.eventCategoryLabelMap()[category] ?? category;
    }
    avatarColor = avatarColor;
    // ── Trash tab ──
    loadTrash() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.trashLoading.set(true);
        this.browseService.getTrashedChildren(doc.uid, 50).subscribe({
            next: (res) => {
                this.trashedDocs.set(res.entries);
                this.trashLoading.set(false);
                this.trashLoaded = true;
            },
            error: () => this.trashLoading.set(false),
        });
    }
    restoreDocument(doc) {
        this.browseService.restoreDocument(doc.uid).subscribe({
            next: () => {
                this.toast.show(`"${doc.title}" restored`);
                this.loadTrash();
                this.loadContent();
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-restore-document')),
        });
    }
    // ── View toggle ──
    setViewMode(mode) {
        this.viewMode.set(mode);
    }
    // ── Column settings ──
    openColumnPanel() {
        this.columnPanelOpen.set(true);
    }
    closeColumnPanel() {
        this.columnPanelOpen.set(false);
    }
    /** The picker's Done: the keys to show, in column order. */
    applyColumns(keys) {
        this.userVisibleKeys.set(keys);
        saveColumnSettings(this.columns().map((c) => ({ ...c, visible: keys.includes(c.key) })));
        this.columnPanelOpen.set(false);
    }
    // ── Filters ──
    clearFilters() {
        this.filterText.set('');
        this.filterType.set('');
        this.filterModifiedFrom.set(null);
        this.filterModifiedTo.set(null);
        this.filterContributor.set('');
    }
    // ── CSV export (server-side via Nuxeo Bulk Action) ──
    exportCsv() {
        const doc = this.currentDoc();
        if (!doc || this.csvExporting())
            return;
        this.csvExporting.set(true);
        this.toast.show(this.translate.instant('browse.message.starting-csv-export'));
        this.browseService
            .startCsvExport(doc.uid)
            .pipe(switchMap((commandId) => this.browseService.pollAndDownloadCsv(commandId)))
            .subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.title ?? 'export'}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                this.csvExporting.set(false);
                this.toast.show(this.translate.instant('browse.message.csv-exported-successfully'));
            },
            error: () => {
                this.csvExporting.set(false);
                this.toast.error(this.translate.instant('browse.message.csv-export-failed'));
            },
        });
    }
    getCellValue(doc, key) {
        switch (key) {
            case 'title':
                return doc.title;
            case 'type':
                return doc.type;
            case 'modified':
                return doc.lastModified ? new Date(doc.lastModified).toLocaleDateString(this.locale) : '';
            case 'lastContributor':
                return doc.properties?.['dc:lastContributor'] ?? '';
            case 'state':
                return doc.properties?.['dc:nature'] ?? '';
            case 'version': {
                const major = doc.properties?.['uid:major_version'];
                return major !== undefined && major !== null
                    ? `${major}.${doc.properties?.['uid:minor_version'] ?? 0}`
                    : '';
            }
            case 'created':
                return doc.properties?.['dc:created']
                    ? new Date(doc.properties['dc:created']).toLocaleDateString(this.locale)
                    : '';
            case 'author':
                return doc.properties?.['dc:creator'] ?? '';
            case 'nature':
                return doc.properties?.['dc:nature'] ?? '';
            case 'coverage':
                return doc.properties?.['dc:coverage'] ?? '';
            case 'subjects': {
                const s = doc.properties?.['dc:subjects'];
                return s?.join(', ') ?? '';
            }
            default:
                return '';
        }
    }
    // ── Action toolbar ──
    openDriveDialog() {
        const data = { folderPath: this.currentDoc()?.path ?? '/' };
        this.dialog.open(NxsDriveDialogComponent, { data });
    }
    isBrowseFolderish(doc) {
        if (!doc)
            return false;
        return doc.type === 'Favorites' || isFolderishDocument(doc);
    }
    isCurrentFolderish() {
        return this.isBrowseFolderish(this.currentDoc());
    }
    openCreateImportDialog() {
        const doc = this.currentDoc();
        if (!doc || !this.isBrowseFolderish(doc)) {
            this.toast.show(this.translate.instant('browse.message.open-a-folder-to-create-or-import'));
            return;
        }
        if (!canAddChildren(doc)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        if (isDomainParentType(doc.type) || isRestrictedImportParentPath(doc.path)) {
            this.toast.show(this.translate.instant(DOMAIN_CONTAINER_GUIDANCE_KEY), { duration: 6000 });
            return;
        }
        this.dialog
            .open(CreateImportDialogComponent, {
            width: '960px',
            height: '680px',
            maxWidth: '95vw',
            maxHeight: '95vh',
            data: { parentPath: doc.path, parentTitle: doc.title },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
            if (result?.navigateToUid || result?.navigateToUrl || result?.refreshed) {
                this.browseContext.requestTreeRefresh();
            }
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
            if (result?.refreshed)
                this.loadContent();
        });
    }
    openEditDialog() {
        const selected = this.singleSelectedEntry();
        if (selected && isCollectionDocument(selected)) {
            this.openEditCollectionDialog(selected);
            return;
        }
        const doc = this.currentDoc();
        if (!doc)
            return;
        if (!canWriteDocument(doc)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        const data = {
            uid: doc.uid,
            title: doc.title,
            description: doc.properties?.['dc:description'] ?? '',
            nature: doc.properties?.['dc:nature'] ?? '',
            subjects: doc.properties?.['dc:subjects'] ?? [],
            coverage: doc.properties?.['dc:coverage'] ?? '',
            expires: doc.properties?.['dc:expired'] ?? null,
        };
        const ref = this.dialog.open(EditMetadataDialogComponent, { data });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
            if (result)
                this.afterBrowseMetadataEdit(result);
        });
    }
    /** Reload browse content and nav tree after metadata changes (title rename, etc.). */
    afterBrowseMetadataEdit(updatedDoc) {
        this.browseContext.requestTreeRefresh();
        const previousPath = this.currentDoc()?.path;
        if (updatedDoc.path &&
            previousPath &&
            !nuxeoPathsEqualFlexible(updatedDoc.path, previousPath)) {
            this.browseContext.setFromNuxeoPath(updatedDoc.path);
            void this.router.navigateByUrl(`/browse${updatedDoc.path}`);
            return;
        }
        this.currentDoc.set(updatedDoc);
        this.loadContent();
    }
    isCollectionEntry(doc) {
        return isCollectionDocument(doc);
    }
    canEditCollectionEntry(doc) {
        return canShowWriteDocumentAction(doc);
    }
    canDeleteCollectionEntry(doc) {
        return canShowRemoveDocumentAction(doc);
    }
    hasCollectionEntryActions(doc) {
        return this.canEditCollectionEntry(doc) || this.canDeleteCollectionEntry(doc);
    }
    openEditCollectionDialog(doc) {
        this.detailService
            .getFullDocument(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (fullDoc) => {
                if (!canWriteDocument(fullDoc)) {
                    this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
                    return;
                }
                const ref = this.dialog.open(EditCollectionDialogComponent, {
                    data: { document: fullDoc },
                    width: '560px',
                });
                ref
                    .afterClosed()
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((updatedDoc) => {
                    if (updatedDoc) {
                        this.browseContext.requestTreeRefresh();
                        this.loadContent();
                        this.toast.show(this.translate.instant('browse.message.collection-updated'));
                    }
                });
            },
            error: (err) => this.toast.error(isPermissionDeniedError(err)
                ? this.translate.instant(PERMISSION_DENIED_KEY)
                : this.translate.instant('browse.message.failed-to-load-collection')),
        });
    }
    deleteCollectionEntry(doc) {
        this.detailService
            .getFullDocument(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (fullDoc) => {
                if (!canRemoveDocument(fullDoc)) {
                    this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
                    return;
                }
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: this.translate.instant('confirm.delete-collection'),
                        message: this.translate.instant('confirm.delete-document-named', {
                            name: fullDoc.title,
                        }),
                        confirmLabel: this.translate.instant('confirm.delete'),
                    },
                });
                dialogRef
                    .afterClosed()
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((confirmed) => {
                    if (!confirmed)
                        return;
                    this.detailService
                        .trashDocument(fullDoc.uid)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                        next: () => {
                            this.selectionService.clear();
                            this.browseContext.requestTreeRefresh();
                            this.loadContent();
                            this.toast.show(this.translate.instant('browse.message.collection-moved-to-trash'));
                        },
                        error: (err) => this.toast.error(isPermissionDeniedError(err)
                            ? this.translate.instant(PERMISSION_DENIED_KEY)
                            : this.translate.instant('browse.message.failed-to-delete-collection')),
                    });
                });
            },
            error: (err) => this.toast.error(isPermissionDeniedError(err)
                ? this.translate.instant(PERMISSION_DENIED_KEY)
                : this.translate.instant('browse.message.failed-to-load-collection')),
        });
    }
    deleteDocument() {
        const selectedCount = this.selectionService.selectedCount();
        if (selectedCount > 0) {
            this.deleteSelectedDocuments();
            return;
        }
        const doc = this.currentDoc();
        if (!doc)
            return;
        if (doc.type === 'Collections') {
            this.guardCollectionsFolderDelete(doc);
            return;
        }
        this.confirmTrashDocument(doc);
    }
    selectedEntries() {
        const ids = new Set(this.selectionService.selectedIds());
        return this.entries().filter((entry) => ids.has(entry.uid));
    }
    resolveSelectedDocumentForDelete(uid) {
        const entry = this.entries().find((doc) => doc.uid === uid);
        if (entry && hasDocumentPermissionsEnricher(entry)) {
            return of(entry);
        }
        return this.detailService.getFullDocument(uid).pipe(catchError(() => of(null)));
    }
    guardCollectionsFolderDelete(doc) {
        if (this.entries().some((entry) => isCollectionDocument(entry))) {
            this.showCollectionsFolderDeleteBlockedMessage();
            return;
        }
        this.browseService
            .hasChildCollections(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (hasChildCollections) => {
                if (hasChildCollections) {
                    this.showCollectionsFolderDeleteBlockedMessage();
                    return;
                }
                this.proceedToTrashDocument(doc);
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-verify-folder-contents')),
        });
    }
    proceedToTrashDocument(doc) {
        if (!canRemoveDocument(doc)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        this.openTrashConfirmDialog(doc);
    }
    showCollectionsFolderDeleteBlockedMessage() {
        this.toast.error(this.translate.instant('browse.message.remove-all-collections-from-this-folder-before'), { duration: 5000 });
    }
    confirmTrashDocument(doc) {
        if (doc.type === this.translate.instant('search.search-filters-drawer.collections')) {
            this.guardCollectionsFolderDelete(doc);
            return;
        }
        this.proceedToTrashDocument(doc);
    }
    openTrashConfirmDialog(doc) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: trashDocumentConfirmData(doc.title, (key, params) => this.translate.instant(key, params)),
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.detailService
                .trashDocument(doc.uid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.toast.show(this.translate.instant('browse.message.moved-to-trash'));
                    this.browseContext.resetContext();
                    this.browseContext.requestTreeRefresh();
                    void this.router.navigateByUrl(postTrashBrowseRouterUrl(doc.path));
                },
                error: (err) => this.toast.error(isPermissionDeniedError(err)
                    ? this.translate.instant(PERMISSION_DENIED_KEY)
                    : this.translate.instant('browse.message.failed-to-delete')),
            });
        });
    }
    deleteSelectedDocuments() {
        const ids = [...this.selectionService.selectedIds()];
        if (ids.length === 0)
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: trashSelectedDocumentsConfirmData(ids.length, (key, params) => this.translate.instant(key, params)),
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((confirmed) => {
            if (!confirmed)
                return EMPTY;
            return forkJoin(ids.map((uid) => this.resolveSelectedDocumentForDelete(uid)));
        }), switchMap((docs) => {
            const resolved = docs.filter((doc) => !!doc);
            const loadFailedCount = docs.length - resolved.length;
            const denied = resolved.filter((doc) => !canRemoveDocument(doc));
            const allowed = resolved.filter((doc) => canRemoveDocument(doc));
            if (allowed.length === 0) {
                if (loadFailedCount > 0) {
                    this.toast.error(resolved.length === 0
                        ? this.translate.instant('browse.message.failed-to-load-selected-documents-for-deletion')
                        : this.translate.instant(loadFailedCount === 1
                            ? 'common.count.skipped-unloadable-one'
                            : 'common.count.skipped-unloadable-many', { count: loadFailedCount }), { duration: 5000 });
                }
                if (resolved.length > 0) {
                    this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
                }
                return EMPTY;
            }
            if (loadFailedCount > 0) {
                this.toast.error(this.translate.instant(loadFailedCount === 1
                    ? 'common.count.skipped-unloadable-one'
                    : 'common.count.skipped-unloadable-many', { count: loadFailedCount }), { duration: 5000 });
            }
            if (denied.length > 0) {
                this.toast.error(this.translate.instant(denied.length === 1
                    ? 'common.count.skipped-no-permission-one'
                    : 'common.count.skipped-no-permission-many', { count: denied.length }), { duration: 5000 });
            }
            const collectionsFolders = allowed.filter((doc) => doc.type === 'Collections');
            if (collectionsFolders.length === 0) {
                return of(allowed);
            }
            return forkJoin(collectionsFolders.map((doc) => this.browseService.hasChildCollections(doc.uid).pipe(map((hasChildCollections) => ({ doc, hasChildCollections })), catchError(() => of({ doc, hasChildCollections: true }))))).pipe(map((checks) => {
                const blockedUids = new Set(checks.filter((check) => check.hasChildCollections).map((check) => check.doc.uid));
                if (blockedUids.size > 0) {
                    this.showCollectionsFolderDeleteBlockedMessage();
                }
                return allowed.filter((doc) => !blockedUids.has(doc.uid));
            }));
        }), switchMap((docs) => {
            if (docs.length === 0) {
                return EMPTY;
            }
            return forkJoin(docs.map((doc) => this.detailService.trashDocument(doc.uid).pipe(catchError(() => of(null))))).pipe(map((results) => ({ docs, trashed: results.filter(Boolean).length })));
        }))
            .subscribe({
            next: ({ docs, trashed }) => {
                if (trashed === 0) {
                    this.toast.error(this.translate.instant('browse.message.failed-to-delete'));
                    return;
                }
                this.selectionService.clear();
                this.toast.show(trashed === 1
                    ? this.translate.instant('browse.message.moved-to-trash')
                    : `${trashed} documents moved to trash`);
                if (trashed < docs.length) {
                    this.toast.error(this.translate.instant(docs.length - trashed === 1
                        ? 'common.count.delete-failed-one'
                        : 'common.count.delete-failed-many', { count: docs.length - trashed }), { duration: 5000 });
                }
                this.browseContext.requestTreeRefresh();
                this.loadContent();
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-delete')),
        });
    }
    downloadAll() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.detailService.exportZip(doc.uid, `${doc.title}.zip`).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${doc.title}.zip`;
                a.click();
                URL.revokeObjectURL(url);
            },
            error: () => this.toast.error(this.translate.instant('browse.message.download-failed')),
        });
    }
    openShareDialog() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.dialog.open(ShareDialogComponent, {
            data: { title: doc.title, url: window.location.href },
        });
    }
    toggleNotify() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        // Read before the call, not after: the success handler refreshes `currentDoc`,
        // so re-reading `isSubscribed()` there reports whichever of the two requests
        // resolved first and can announce the opposite of what just happened.
        const wasSubscribed = this.isSubscribed() === true;
        const action$ = wasSubscribed
            ? this.detailService.unsubscribe(doc.uid)
            : this.detailService.subscribe(doc.uid);
        action$.subscribe({
            next: () => {
                this.browseService.getByPath(this.currentNuxeoPath).subscribe({
                    next: (d) => this.currentDoc.set(d),
                });
                this.toast.show(wasSubscribed
                    ? this.translate.instant('browse.message.unsubscribed')
                    : this.translate.instant('browse.message.subscribed-to-notifications'));
            },
            error: () => this.toast.error(this.translate.instant('browse.message.failed-to-update-notifications')),
        });
    }
    openExportDialog() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        this.dialog.open(ExportDialogComponent, {
            data: {
                documentUid: doc.uid,
                documentTitle: doc.title,
                exportFn: (type, uid) => {
                    switch (type) {
                        case 'thumbnail':
                            return this.detailService.fetchThumbnail(uid);
                        case 'zip':
                            return this.detailService.exportZip(uid);
                        case 'xml':
                            return this.detailService.exportXml(uid);
                        default:
                            return this.detailService.fetchThumbnail(uid);
                    }
                },
            },
        });
    }
    // ── Helpers ──
    /** Same predicate as create/import enablement: facet/type-based folderish, plus Favorites. */
    isFolderish(doc) {
        return this.isBrowseFolderish(doc);
    }
    docIcon(doc) {
        return docTypeIcon(doc.type);
    }
    lastContributor(doc) {
        return doc.properties?.['dc:lastContributor'] ?? '';
    }
    /**
     * Initials for a `sat-avatar`, never empty.
     *
     * `SatAvatar` at `size="24"` renders `initials()[0].toUpperCase()`, which throws
     * a `TypeError` on an empty string — and every value browse binds to it can be
     * empty: `lastContributor` and `docCreator` return `''` when the Dublin Core
     * property is absent, `resolveAcePrincipal` returns `''` for an unrecognised
     * principal, and Nuxeo omits `principalName` on system audit events. The throw
     * happens inside change detection, so it takes the whole listing down, not one
     * cell.
     */
    avatarInitials(value) {
        return value?.trim() || '?';
    }
    docCreator(doc) {
        return doc.properties?.['dc:creator'] ?? '';
    }
    docState() {
        const doc = this.currentDoc();
        return doc?.properties?.['dc:nature'] ?? 'Project';
    }
    isSelected(id) {
        return this.selectionService.isSelected(id);
    }
    selectionAriaLabel(doc) {
        return this.translate.instant('common.select-item', { name: doc.title });
    }
    toggleSelection(id) {
        const doc = this.filteredEntries().find((d) => d.uid === id);
        this.selectionService.toggle(id, doc?.title ?? id, null, doc?.type);
    }
    onRowClick(doc) {
        if (isCollectionDocument(doc)) {
            void this.router.navigateByUrl(`/collections/${doc.uid}`);
            return;
        }
        if (this.isFolderish(doc)) {
            this.browseContext.setFromNuxeoPath(doc.path);
            void this.router.navigateByUrl(`/browse${doc.path}`);
        }
        else {
            void this.router.navigateByUrl(`/doc/${doc.uid}`);
        }
    }
    /**
     * Localised by `Intl.RelativeTimeFormat` rather than by a catalogue — see
     * `formatRelativeTime` for why a key per unit cannot express Polish or Arabic plurals.
     */
    relativeTime(dateStr) {
        return formatRelativeTime(dateStr, this.translate.currentLang);
    }
    permissionIcon(permission) {
        switch (permission) {
            case 'Everything':
                return 'admin_panel_settings';
            case 'ReadWrite':
                return 'edit';
            case 'Read':
                return 'visibility';
            case 'Write':
                return 'create';
            default:
                return 'lock';
        }
    }
    permissionLabel(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    aceTimeFrame(ace) {
        return formatAceDateRange(ace.begin, ace.end, (key, params) => this.translate.instant(key, params), this.locale);
    }
    displayUsername(ace) {
        return resolveAcePrincipal(ace.username).replace(/^transient\//, '');
    }
    aceGrantedBy(ace) {
        const creator = ace.creator ? resolveAcePrincipal(ace.creator) : '';
        return creator || '—';
    }
    loadPermissions(force = false) {
        const doc = this.currentDoc();
        if (!doc || this.permissionsLoading())
            return;
        if (this.permissionsLoaded() && !force)
            return;
        this.permissionsLoading.set(true);
        this.detailService
            .getDocumentPermissions(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                this.applyPermissionsDoc(updated);
                this.permissionsLoaded.set(true);
                this.permissionsLoading.set(false);
            },
            error: () => {
                this.permissionsLoading.set(false);
                this.toast.error(this.translate.instant('browse.message.failed-to-load-permissions'));
            },
        });
    }
    applyPermissionsDoc(updated) {
        const existing = this.currentDoc();
        if (!existing) {
            this.currentDoc.set(updated);
            return;
        }
        this.currentDoc.set(mergeDocumentPermissionsContext(existing, updated));
    }
    reloadPermissions() {
        this.loadPermissions(true);
    }
    deletePermission(ace) {
        const doc = this.currentDoc();
        if (!doc)
            return;
        const dialogRef = this.dialog.open(DeletePermissionDialogComponent, {
            data: {
                documentUid: doc.uid,
                ace,
                permissionLabel: this.permissionLabel(ace.permission),
                timeFrameLabel: this.aceTimeFrame(ace),
            },
            width: '560px',
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deleted) => {
            if (deleted) {
                this.reloadPermissions();
                this.toast.show(this.translate.instant('browse.message.permission-deleted'));
            }
        });
    }
    shareWithExternal() {
        const doc = this.currentDoc();
        if (!doc)
            return;
        const dialogRef = this.dialog.open(ShareExternalDialogComponent, {
            data: { documentUid: doc.uid },
            width: '520px',
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((created) => {
            if (created) {
                this.reloadPermissions();
                this.toast.show(this.translate.instant('browse.message.shared-with-external-user'));
            }
        });
    }
    editExternalPermission(ace) {
        const doc = this.currentDoc();
        if (!doc)
            return;
        const dialogRef = this.dialog.open(UpdatePermissionDialogComponent, {
            data: { documentUid: doc.uid, ace, isExternal: true },
            width: '520px',
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updated) => {
            if (updated) {
                this.reloadPermissions();
                this.toast.show(this.translate.instant('browse.message.permission-updated'));
            }
        });
    }
    sendNotificationEmail(ace) {
        const doc = this.currentDoc();
        if (!doc || this.actionInProgress())
            return;
        this.actionInProgress.set('notify-' + ace.id);
        this.detailService
            .sendNotificationEmailForPermission(doc.uid, ace.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant('browse.message.notification-email-sent'));
            },
            error: (err) => {
                this.actionInProgress.set(null);
                const message = isMailSendError(err)
                    ? mailSendFailureMessage('send', (key) => this.translate.instant(key))
                    : this.translate.instant('browse.message.failed-to-send-notification');
                this.toast.error(message, { duration: 7000 });
            },
        });
    }
    static ɵfac = function BrowseComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BrowseComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BrowseComponent, selectors: [["lib-browse"]], features: [i0.ɵɵProvidersFeature([
                provideSatoriDateAdapter(),
                provideTranslatedDatepickerIntl(),
                provideNxsToast(),
                provideNxsThumbnailCache(),
            ])], decls: 156, vars: 143, consts: [["modifiedPicker", ""], ["histFrom", ""], ["histTo", ""], ["breadcrumbsOutlet", ""], ["collectionCardMenu", "matMenu"], ["permissionsPanelOutlet", ""], ["tagAuto", "matAutocomplete"], [1, "browse-container"], [1, "browse-header", 3, "heading", "subheading", "documentType"], [1, "header-actions"], ["mat-flat-button", "", "color", "primary", 3, "matTooltip", "disabled"], ["mat-icon-button", "", 3, "click", "matTooltip"], ["mat-icon-button", "", 3, "matTooltip"], [3, "selected", "actions", "label"], [3, "documentType", "path"], [1, "browse-body"], [1, "browse-main"], [1, "tabs-header-row"], [1, "browse-tabs", 3, "selectedIndexChange", "selectedIndex"], [3, "label"], [1, "view-toolbar"], [1, "result-count"], [1, "toolbar-spacer"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "toolbar-filter-field"], ["matInput", "", 3, "ngModelChange", "ngModel"], ["matSuffix", "", "mat-icon-button", "", 1, "filter-clear-btn"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "toolbar-filter-field", "toolbar-filter-date"], [3, "rangePicker"], ["matStartDate", "", 3, "ngModelChange", "ngModel", "placeholder"], ["matEndDate", "", 3, "ngModelChange", "ngModel", "placeholder"], ["matIconSuffix", "", 3, "for"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "toolbar-filter-select"], [3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "toolbar-actions"], ["mat-icon-button", "", 1, "gear-btn", 3, "matTooltip"], ["mat-icon-button", "", 3, "click", "matTooltip", "disabled"], ["diameter", "18"], [1, "browse-list-container"], [1, "browse-loading"], ["retryable", "", 3, "status", "heading"], [1, "browse-uploads"], [1, "permissions-container"], [1, "perm-section"], [1, "history-container"], [1, "history-filters"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "filter-field"], ["matPrefix", ""], ["matInput", "", 3, "ngModelChange", "matDatepicker", "ngModel"], [1, "history-empty"], [1, "trash-container"], [1, "browse-empty"], [1, "browse-table-wrapper"], ["mat-icon-button", "", 1, "panel-toggle-btn", 3, "click", "matTooltip"], [1, "details-panel"], ["mat-flat-button", "", "color", "primary", 3, "click", "matTooltip", "disabled"], [1, "browse-breadcrumbs", 3, "componentId", "componentInputs"], [1, "browse-breadcrumbs", 3, "items", "label"], ["matSuffix", "", "mat-icon-button", "", 1, "filter-clear-btn", 3, "click"], ["mat-icon-button", "", 1, "gear-btn", 3, "click", "matTooltip"], [3, "columns", "required", "defaults"], [1, "browse-document-list", 3, "selectedIdsChange", "sortChange", "pageChange", "open", "rowAction", "retry", "filesDropped", "documents", "columns", "label", "sort", "selectedIds", "pageIndex", "pageSize", "totalSize", "hasNextPage", "loading", "error", "errorHeading", "emptyHeading", "rowActions", "dropEnabled", "dropLabel"], [3, "apply", "dismiss", "columns", "required", "defaults"], ["diameter", "36", 3, "label"], ["retryable", "", 3, "retry", "status", "heading"], [1, "card-grid"], [1, "doc-card-wrapper", 3, "doc-card-wrapper--selected"], [3, "pageChange", "pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage"], [1, "empty-icon"], [1, "doc-card-wrapper"], [1, "grid-card-checkbox"], [3, "change", "click", "checked", "aria-label"], ["type", "button", 1, "doc-card", 3, "click"], [1, "card-thumb"], [1, "card-thumb-img", 3, "documentId"], [1, "card-thumb-icon"], [1, "card-body"], [1, "card-title"], [1, "card-type"], ["mat-icon-button", "", "type", "button", 1, "grid-card-menu", 3, "click", "matMenuTriggerFor"], ["mat-menu-item", ""], ["mat-menu-item", "", 3, "click"], [1, "browse-uploads__header"], [1, "browse-uploads__title"], ["mat-button", "", "type", "button", 3, "click", "disabled"], [3, "remove", "retry", "items", "label"], [3, "componentId", "componentInputs"], [3, "documentId", "permissionsChanged"], ["diameter", "24", 3, "label"], [1, "perm-section-header"], ["role", "heading", "aria-level", "3", 1, "perm-section-title"], ["mat-button", "", "color", "primary", 1, "perm-action-btn"], [1, "perm-info-bar"], [1, "perm-info-accent"], [1, "perm-empty"], [1, "perm-table"], ["mat-button", "", "color", "primary", 1, "perm-action-btn", 3, "click"], [1, "perm-row-actions"], ["mat-icon-button", "", "type", "button", 3, "click", "matTooltip"], ["mat-icon-button", "", "type", "button", 3, "click", "matTooltip", "disabled"], [1, "history-table-wrapper"], ["mat-table", "", "matSort", "", 1, "history-table", 3, "matSortChange", "dataSource", "matSortActive", "matSortDirection"], ["matColumnDef", "eventId"], ["mat-header-cell", "", "mat-sort-header", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "eventDate"], ["matColumnDef", "principalName"], ["matColumnDef", "category"], ["matColumnDef", "comment"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["matColumnDef", "docLifeCycle"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["showFirstLastButtons", "", 3, "page", "length", "pageSize", "pageIndex", "pageSizeOptions"], ["mat-header-cell", "", "mat-sort-header", ""], ["mat-cell", ""], [1, "user-cell"], ["size", "24", "aria-hidden", "true", 3, "initials", "category", "borderless"], ["mat-header-cell", ""], ["status", "info", 3, "hideIcon"], ["mat-header-row", ""], ["mat-row", ""], ["diameter", "24"], [1, "browse-table"], [1, "browse-row"], [1, "cell-name-inner"], [1, "doc-thumb", 3, "documentId"], [1, "doc-icon"], [1, "doc-title"], ["category", "blue"], ["mat-stroked-button", "", 1, "restore-btn", 3, "click"], [1, "panel-header"], [1, "panel-title"], ["mat-icon-button", "", 3, "click"], [1, "panel-sub-tabs"], [1, "sub-tab", 3, "click"], [1, "panel-body"], [1, "panel-info-section"], ["role", "heading", "aria-level", "4", 1, "panel-section-title"], [1, "panel-info-row"], [1, "info-label"], [1, "info-value"], [1, "info-value", "avatar-value"], [1, "tags-container"], [1, "removable-tag"], [1, "no-data"], ["appearance", "outline", 1, "tag-autocomplete-field"], ["matInput", "", 3, "ngModelChange", "placeholder", "ngModel", "matAutocomplete"], ["matSuffix", ""], ["autoActiveFirstOption", "", 3, "optionSelected"], ["type", "button", 1, "tag-remove-btn", 3, "click"], [1, "create-tag-option"], [1, "panel-loading"], ["diameter", "20", 3, "label"], [1, "activity-item"], ["size", "28", "aria-hidden", "true", 3, "initials", "category", "borderless"], [1, "activity-text"], [1, "activity-user"], [1, "activity-action"], [1, "activity-time"]], template: function BrowseComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 7)(1, "nxs-folder-header", 8);
            i0.ɵɵpipe(2, "docTypeLabel");
            i0.ɵɵelementStart(3, "div", 9);
            i0.ɵɵconditionalCreate(4, BrowseComponent_Conditional_4_Template, 6, 7, "button", 10);
            i0.ɵɵelementStart(5, "button", 11);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.openDriveDialog()); });
            i0.ɵɵelementStart(8, "mat-icon");
            i0.ɵɵtext(9, "cloud_upload");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(10, BrowseComponent_Conditional_10_Template, 5, 6, "button", 12);
            i0.ɵɵconditionalCreate(11, BrowseComponent_Conditional_11_Template, 5, 6, "button", 12);
            i0.ɵɵelementStart(12, "button", 11);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵpipe(14, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.downloadAll()); });
            i0.ɵɵelementStart(15, "mat-icon");
            i0.ɵɵtext(16, "download");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "nxs-action-menu", 13);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵlistener("selected", function BrowseComponent_Template_nxs_action_menu_selected_17_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.runContextMenuItem($event)); });
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(19, BrowseComponent_Conditional_19_Template, 5, 9);
            i0.ɵɵelement(20, "nxs-domain-hint", 14);
            i0.ɵɵelementStart(21, "div", 15)(22, "div", 16)(23, "div", 17)(24, "mat-tab-group", 18);
            i0.ɵɵlistener("selectedIndexChange", function BrowseComponent_Template_mat_tab_group_selectedIndexChange_24_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onTabChange($event)); });
            i0.ɵɵelementStart(25, "mat-tab", 19);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementStart(27, "div", 20);
            i0.ɵɵdeclareLet(28);
            i0.ɵɵconditionalCreate(29, BrowseComponent_Conditional_29_Template, 3, 6, "span", 21);
            i0.ɵɵelement(30, "div", 22);
            i0.ɵɵelementStart(31, "mat-form-field", 23)(32, "mat-label");
            i0.ɵɵtext(33);
            i0.ɵɵpipe(34, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(35, "input", 24);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterText.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(36, BrowseComponent_Conditional_36_Template, 4, 3, "button", 25);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "mat-form-field", 26)(38, "mat-label");
            i0.ɵɵtext(39);
            i0.ɵɵpipe(40, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "mat-date-range-input", 27)(42, "input", 28);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_42_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterModifiedFrom.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "input", 29);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_44_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterModifiedTo.set($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelement(46, "mat-datepicker-toggle", 30)(47, "mat-date-range-picker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "mat-form-field", 23)(50, "mat-label");
            i0.ɵɵtext(51);
            i0.ɵɵpipe(52, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "input", 24);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_53_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterContributor.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(54, BrowseComponent_Conditional_54_Template, 4, 3, "button", 25);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "mat-form-field", 31)(56, "mat-label");
            i0.ɵɵtext(57);
            i0.ɵɵpipe(58, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "mat-select", 32);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_mat_select_ngModelChange_59_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterType.set($event)); });
            i0.ɵɵelementStart(60, "mat-option", 33);
            i0.ɵɵtext(61);
            i0.ɵɵpipe(62, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(63, BrowseComponent_For_64_Template, 2, 2, "mat-option", 34, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(65, "div", 35);
            i0.ɵɵconditionalCreate(66, BrowseComponent_Conditional_66_Template, 5, 6, "button", 36);
            i0.ɵɵelementStart(67, "button", 37);
            i0.ɵɵpipe(68, "translate");
            i0.ɵɵpipe(69, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_67_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.exportCsv()); });
            i0.ɵɵconditionalCreate(70, BrowseComponent_Conditional_70_Template, 2, 3, "mat-spinner", 38)(71, BrowseComponent_Conditional_71_Template, 2, 0, "mat-icon");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(72, "button", 11);
            i0.ɵɵpipe(73, "translate");
            i0.ɵɵpipe(74, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_72_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setViewMode("list")); });
            i0.ɵɵelementStart(75, "mat-icon");
            i0.ɵɵtext(76, "view_list");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(77, "button", 11);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵpipe(79, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_77_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setViewMode("card")); });
            i0.ɵɵelementStart(80, "mat-icon");
            i0.ɵɵtext(81, "grid_view");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(82, BrowseComponent_Conditional_82_Template, 6, 29, "div", 39)(83, BrowseComponent_Conditional_83_Template, 3, 3, "div", 40)(84, BrowseComponent_Conditional_84_Template, 1, 2, "nxs-error-state", 41)(85, BrowseComponent_Conditional_85_Template, 5, 6);
            i0.ɵɵconditionalCreate(86, BrowseComponent_Conditional_86_Template, 11, 14, "section", 42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(87, "mat-tab", 19);
            i0.ɵɵpipe(88, "translate");
            i0.ɵɵelementStart(89, "div", 43);
            i0.ɵɵconditionalCreate(90, BrowseComponent_Conditional_90_Template, 3, 6);
            i0.ɵɵconditionalCreate(91, BrowseComponent_Conditional_91_Template, 3, 3, "div", 40)(92, BrowseComponent_Conditional_92_Template, 13, 8, "section", 44);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(93, "mat-tab", 19);
            i0.ɵɵpipe(94, "translate");
            i0.ɵɵelementStart(95, "div", 45)(96, "div", 46)(97, "mat-form-field", 47)(98, "mat-label");
            i0.ɵɵtext(99);
            i0.ɵɵpipe(100, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(101, "input", 24);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_101_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterUsername.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(102, "mat-icon", 48);
            i0.ɵɵtext(103, "person_search");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(104, "mat-form-field", 47)(105, "mat-label");
            i0.ɵɵtext(106);
            i0.ɵɵpipe(107, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(108, "input", 49);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_108_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterDateFrom.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(109, "mat-datepicker-toggle", 30)(110, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(112, "mat-form-field", 47)(113, "mat-label");
            i0.ɵɵtext(114);
            i0.ɵɵpipe(115, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(116, "input", 49);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_input_ngModelChange_116_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterDateTo.set($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(117, "mat-datepicker-toggle", 30)(118, "mat-datepicker", null, 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(120, "mat-form-field", 47)(121, "mat-label");
            i0.ɵɵtext(122);
            i0.ɵɵpipe(123, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(124, "mat-select", 32);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_mat_select_ngModelChange_124_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterAction.set($event)); });
            i0.ɵɵelementStart(125, "mat-option", 33);
            i0.ɵɵtext(126);
            i0.ɵɵpipe(127, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(128, BrowseComponent_For_129_Template, 2, 2, "mat-option", 34, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(130, "mat-form-field", 47)(131, "mat-label");
            i0.ɵɵtext(132);
            i0.ɵɵpipe(133, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(134, "mat-select", 32);
            i0.ɵɵlistener("ngModelChange", function BrowseComponent_Template_mat_select_ngModelChange_134_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.filterCategory.set($event)); });
            i0.ɵɵelementStart(135, "mat-option", 33);
            i0.ɵɵtext(136);
            i0.ɵɵpipe(137, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(138, BrowseComponent_For_139_Template, 2, 2, "mat-option", 34, _forTrack0);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(140, BrowseComponent_Conditional_140_Template, 3, 3, "div", 40)(141, BrowseComponent_Conditional_141_Template, 3, 3, "div", 50)(142, BrowseComponent_Conditional_142_Template, 23, 12);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(143, "mat-tab", 19);
            i0.ɵɵpipe(144, "translate");
            i0.ɵɵelementStart(145, "div", 51);
            i0.ɵɵconditionalCreate(146, BrowseComponent_Conditional_146_Template, 3, 3, "div", 40)(147, BrowseComponent_Conditional_147_Template, 6, 3, "div", 52)(148, BrowseComponent_Conditional_148_Template, 19, 12, "div", 53);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(149, "button", 54);
            i0.ɵɵpipe(150, "translate");
            i0.ɵɵpipe(151, "translate");
            i0.ɵɵpipe(152, "translate");
            i0.ɵɵlistener("click", function BrowseComponent_Template_button_click_149_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.togglePanel()); });
            i0.ɵɵelementStart(153, "mat-icon");
            i0.ɵɵtext(154);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(155, BrowseComponent_Conditional_155_Template, 21, 22, "aside", 55);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_3_0;
            let tmp_4_0;
            let tmp_5_0;
            let tmp_16_0;
            let tmp_50_0;
            let tmp_53_0;
            let tmp_80_0;
            const modifiedPicker_r49 = i0.ɵɵreference(48);
            const histFrom_r50 = i0.ɵɵreference(111);
            const histTo_r51 = i0.ɵɵreference(119);
            i0.ɵɵadvance();
            i0.ɵɵproperty("heading", ((tmp_3_0 = ctx.currentDoc()) == null ? null : tmp_3_0.title) ?? "")("subheading", i0.ɵɵpipeBind1(2, 76, (tmp_4_0 = ctx.currentDoc()) == null ? null : tmp_4_0.type))("documentType", ((tmp_5_0 = ctx.currentDoc()) == null ? null : tmp_5_0.type) ?? "");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.canCreateContentHere() ? 4 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 78, "browse.browse.upload-with-nuxeo-drive"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(7, 80, "browse.browse.upload-with-nuxeo-drive"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.showHeaderEdit() ? 10 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showHeaderDelete() ? 11 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(13, 82, "browse.browse.download-all"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 84, "browse.browse.download-all"));
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("actions", ctx.contextMenuItems())("label", i0.ɵɵpipeBind1(18, 86, "browse.browse.more-actions"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.showBreadcrumbs() ? 19 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("documentType", (tmp_16_0 = ctx.currentDoc()) == null ? null : tmp_16_0.type)("path", ctx.browsePath());
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("selectedIndex", ctx.activeTabIndex());
            i0.ɵɵadvance();
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(26, 88, "browse.tab.view"));
            i0.ɵɵadvance(3);
            const count_r52 = i0.ɵɵstoreLet(ctx.resultCount());
            i0.ɵɵadvance();
            i0.ɵɵconditional(count_r52 !== null ? 29 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(34, 91, "browse.browse.filter-by-title"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterText());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.filterText() ? 36 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(40, 93, "browse.browse.modified"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("rangePicker", modifiedPicker_r49);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngModel", ctx.filterModifiedFrom())("placeholder", i0.ɵɵpipeBind1(43, 95, "browse.browse.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterModifiedTo())("placeholder", i0.ɵɵpipeBind1(45, 97, "browse.browse.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", modifiedPicker_r49);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(52, 99, "browse.browse.last-contributor"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterContributor());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.filterContributor() ? 54 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(58, 101, "browse.browse.all-types"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterType());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(62, 103, "browse.browse.all-types"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.distinctTypes());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.viewMode() === "list" ? 66 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(68, 105, "browse.browse.export-csv"))("disabled", ctx.csvExporting());
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(69, 107, "browse.browse.export-csv"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.csvExporting() ? 70 : 71);
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active-view", ctx.viewMode() === "list");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(73, 109, "browse.browse.list-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(74, 111, "browse.browse.list-view"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active-view", ctx.viewMode() === "card");
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(78, 113, "browse.browse.card-view"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(79, 115, "browse.browse.card-view"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.viewMode() === "list" ? 82 : ctx.loading() ? 83 : (tmp_50_0 = ctx.error()) ? 84 : 85, tmp_50_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.droppedUploads.items().length > 0 ? 86 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(88, 117, "browse.tab.permissions"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_53_0 = ctx.currentDoc()) ? 90 : -1, tmp_53_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.permissionsLoading() ? 91 : 92);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(94, 119, "browse.tab.history"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(100, 121, "browse.browse.username"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterUsername());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(107, 123, "browse.browse.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", histFrom_r50)("ngModel", ctx.filterDateFrom());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", histFrom_r50);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(115, 125, "browse.browse.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", histTo_r51)("ngModel", ctx.filterDateTo());
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", histTo_r51);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(123, 127, "browse.browse.action"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterAction());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(127, 129, "browse.browse.all"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.availableActions());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(133, 131, "browse.browse.category"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filterCategory());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(137, 133, "browse.browse.all"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.availableCategories());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.auditLoading() ? 140 : ctx.filteredAuditEntries().length === 0 ? 141 : 142);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("label", i0.ɵɵpipeBind1(144, 135, "browse.tab.trash"));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.trashLoading() ? 146 : ctx.trashedDocs().length === 0 ? 147 : 148);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("matTooltip", ctx.panelOpen() ? i0.ɵɵpipeBind1(150, 137, "browse.hide-details") : i0.ɵɵpipeBind1(151, 139, "browse.show-details"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(152, 141, "browse.browse.toggle-details-panel"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.panelOpen() ? "info" : "info_outline");
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_80_0 = ctx.panelOpen() && ctx.currentDoc()) ? 155 : -1, tmp_80_0);
        } }, dependencies: [NxsActionMenuComponent,
            NxsBreadcrumbsComponent,
            NxsColumnPickerComponent,
            NxsDocumentListComponent,
            NxsDomainHintComponent,
            NxsErrorStateComponent,
            NxsFolderHeaderComponent,
            NxsPagerComponent,
            NxsSpinnerComponent,
            NxsThumbnailComponent,
            NxsUploadQueueComponent,
            FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatIconModule, i2.MatIcon, MatProgressSpinnerModule, i3.MatProgressSpinner, MatButtonModule, i4.MatButton, i4.MatIconButton, MatTabsModule, i5.MatTab, i5.MatTabGroup, MatTableModule, i6.MatTable, i6.MatHeaderCellDef, i6.MatHeaderRowDef, i6.MatColumnDef, i6.MatCellDef, i6.MatRowDef, i6.MatHeaderCell, i6.MatCell, i6.MatHeaderRow, i6.MatRow, MatSortModule, i7.MatSort, i7.MatSortHeader, MatPaginatorModule, i8.MatPaginator, MatMenuModule, i9.MatMenu, i9.MatMenuItem, i9.MatMenuTrigger, MatTooltipModule, i10.MatTooltip, MatDialogModule,
            MatFormFieldModule, i11.MatFormField, i11.MatLabel, i11.MatPrefix, i11.MatSuffix, MatInputModule, i12.MatInput, MatSelectModule, i13.MatSelect, i13.MatOption, MatDatepickerModule, i14.MatDatepicker, i14.MatDatepickerInput, i14.MatDatepickerToggle, i14.MatDateRangeInput, i14.MatStartDate, i14.MatEndDate, i14.MatDateRangePicker, MatChipsModule,
            MatAutocompleteModule, i15.MatAutocomplete, i15.MatAutocompleteTrigger, MatCheckboxModule, i16.MatCheckbox, SatAvatarModule, i17.SatAvatar, SatTagModule, i18.SatCategoryTag, i18.SatStatusTag, ExtensionOutletComponent,
            NxsPermissionsPanelComponent,
            DocTypeLabelPipe,
            TranslatePipe,
            DatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n.browse-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Header[_ngcontent-%COMP%]   \u2500\u2500\n.browse-header[_ngcontent-%COMP%] {\n  padding-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex-shrink: 0;\n}\n\nsat-breadcrumbs[_ngcontent-%COMP%] {\n  padding-bottom: 12px;\n  flex-shrink: 0;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Two-column[_ngcontent-%COMP%]   body[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   \u2500\u2500\n.browse-body[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: row;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.browse-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.tabs-header-row[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n  position: relative;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Panel[_ngcontent-%COMP%]   toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   \u2500\u2500\n.panel-toggle-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4px;\n  right: 8px;\n  z-index: 2;\n  color: #555;\n  &:hover {\n    color: var(--mat-sys-primary);\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Tabs[_ngcontent-%COMP%]   \u2500\u2500\n.browse-tabs[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n\n  ::ng-deep .mat-mdc-tab-header {\n    background: #fff;\n    border-bottom: 1px solid #e0e0e0;\n    flex-shrink: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-labels {\n    gap: 0;\n    justify-content: flex-start;\n  }\n\n  ::ng-deep .mat-mdc-tab {\n    flex-grow: 0 !important;\n    min-width: 0;\n    padding: 0 20px;\n    font-size: 13px;\n    letter-spacing: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    overflow: auto;\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Details[_ngcontent-%COMP%]   Side[_ngcontent-%COMP%]   Panel[_ngcontent-%COMP%]   \u2500\u2500\n.details-panel[_ngcontent-%COMP%] {\n  width: 360px;\n  flex: 0 0 360px;\n  display: flex;\n  flex-direction: column;\n  background: #fff;\n  border-left: 1px solid #e0e0e0;\n  overflow: hidden;\n}\n\n.panel-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 12px 8px 12px 16px;\n  border-bottom: 1px solid #f0f0f0;\n  flex-shrink: 0;\n\n  .panel-title {\n    flex: 1;\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface);\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n}\n\n.panel-sub-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.sub-tab[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  background: none;\n  font-size: 13px;\n  font-weight: 500;\n  color: #888;\n  cursor: pointer;\n  text-align: center;\n  position: relative;\n  transition: color 0.15s;\n\n  &:hover {\n    color: #333;\n  }\n\n  &--active {\n    color: var(--mat-sys-primary);\n\n    &::after {\n      content: '';\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      height: 2px;\n      background: var(--mat-sys-primary);\n    }\n  }\n}\n\n.panel-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n\n.panel-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 24px;\n}\n\n//[_ngcontent-%COMP%]   Panel[_ngcontent-%COMP%]   info[_ngcontent-%COMP%]   rows\n.panel-info-section[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n\n.panel-section-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  color: #555;\n  margin: 0 0 10px;\n}\n\n.panel-info-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  padding: 6px 0;\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.info-label[_ngcontent-%COMP%] {\n  width: 110px;\n  flex-shrink: 0;\n  font-size: 12px;\n  font-weight: 500;\n  color: #888;\n}\n\n.info-value[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 13px;\n  color: #333;\n  min-width: 0;\n}\n\n.avatar-value[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.removable-tag[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0;\n  position: relative;\n}\n\n.tag-remove-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  margin-left: -4px;\n  color: #666;\n  .mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n  }\n  &:hover {\n    color: #d32f2f;\n  }\n}\n\n//[_ngcontent-%COMP%]   Tags\n.tags-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 12px;\n}\n\n.tag-autocomplete-field[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 12px;\n\n  .mat-mdc-form-field-icon-suffix {\n    color: #666;\n  }\n}\n\n.create-tag-option[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--mat-sys-primary);\n}\n\n//[_ngcontent-%COMP%]   Activity[_ngcontent-%COMP%]   items\n.activity-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 8px 0;\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.activity-text[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.activity-user[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #333;\n}\n\n.activity-action[_ngcontent-%COMP%] {\n  color: #555;\n}\n\n.activity-time[_ngcontent-%COMP%] {\n  color: #999;\n  font-size: 11px;\n}\n\n.no-data[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #999;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   View[_ngcontent-%COMP%]   toolbar[_ngcontent-%COMP%]   \u2500\u2500\n.view-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 0;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n}\n\n.result-count[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  white-space: nowrap;\n}\n\n.toolbar-spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.toolbar-filter-field[_ngcontent-%COMP%] {\n  width: 170px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  ::ng-deep input {\n    font-size: 12px;\n  }\n\n  &.toolbar-filter-date {\n    width: 210px;\n  }\n}\n\n.filter-clear-btn[_ngcontent-%COMP%] {\n  width: 24px !important;\n  height: 24px !important;\n  line-height: 24px !important;\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n\n.toolbar-filter-select[_ngcontent-%COMP%] {\n  width: 130px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  ::ng-deep .mat-mdc-select-trigger {\n    font-size: 12px;\n  }\n}\n\n.toolbar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n\n.active-view[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary) !important;\n  background: var(--mat-sys-primary-container);\n  border-radius: 4px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Loading[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   Error[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   Empty[_ngcontent-%COMP%]   \u2500\u2500\n.browse-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex: 1;\n  padding: 40px 0;\n}\n\n.browse-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  color: #999;\n  gap: 8px;\n  padding: 40px 0;\n\n  .empty-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Table[_ngcontent-%COMP%]   (List view)[_ngcontent-%COMP%]   \u2500\u2500\n.browse-list-container[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  min-height: 0;\n}\n\n.browse-document-list[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n}\n\n.browse-uploads[_ngcontent-%COMP%] {\n  margin-top: 12px;\n}\n\n.browse-uploads__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.browse-uploads__title[_ngcontent-%COMP%] {\n  font: var(--mat-sys-title-small);\n}\n\n.browse-table-wrapper[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: auto;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n}\n\n.browse-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n\n  thead {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n  }\n\n  th {\n    text-align: left;\n    padding: 10px 14px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n    white-space: nowrap;\n\n    &.sortable-th {\n      cursor: pointer;\n      user-select: none;\n      &:hover {\n        color: #333;\n        background: #f0f0f0;\n      }\n    }\n  }\n\n  td {\n    padding: 8px 14px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  .col-checkbox {\n    width: 40px;\n  }\n\n  .col-gear {\n    width: 48px;\n    text-align: right;\n    padding: 0 4px;\n  }\n\n  .col-actions,\n  .cell-actions {\n    width: 44px;\n    text-align: center;\n    padding: 0;\n  }\n}\n\n.gear-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.th-label[_ngcontent-%COMP%] {\n  vertical-align: middle;\n}\n\n.sort-arrow[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  vertical-align: middle;\n  margin-left: 2px;\n  color: #333;\n}\n\n.browse-row[_ngcontent-%COMP%] {\n  transition: background-color 0.15s;\n  cursor: pointer;\n  &:hover {\n    background: #f8f9fe;\n  }\n\n  &--selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-primary-container, #e8def8);\n    }\n  }\n}\n\n.cell-checkbox[_ngcontent-%COMP%] {\n  width: 40px;\n  text-align: center;\n  vertical-align: middle;\n}\n\n.cell-name-inner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.doc-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #9e9e9e;\n  flex-shrink: 0;\n}\n\n.doc-thumb[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 3px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid #e8e8e8;\n}\n\n.folder-icon[_ngcontent-%COMP%] {\n  color: #ffa726;\n}\n\n.doc-title[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.type-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 1;\n  text-align: center;\n  color: var(--mat-sys-on-primary-container);\n  background: var(--mat-sys-primary-container);\n  white-space: nowrap;\n}\n\n.contributor-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Card[_ngcontent-%COMP%]   view[_ngcontent-%COMP%]   \u2500\u2500\n.card-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));\n  gap: 16px;\n  padding: 8px 0;\n}\n\n.doc-card-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n\n  &:hover .grid-card-checkbox,\n  &--selected .grid-card-checkbox,\n  &:hover .grid-card-menu,\n  &:focus-within .grid-card-checkbox,\n  &:focus-within .grid-card-menu {\n    opacity: 1;\n    visibility: visible;\n  }\n\n  &--selected .doc-card {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.grid-card-menu[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 2;\n  opacity: 0;\n  visibility: hidden;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n}\n\n.doc-card[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n  cursor: pointer;\n  transition:\n    box-shadow 0.15s,\n    border-color 0.15s;\n  padding: 0;\n  font: inherit;\n  text-align: left;\n\n  &:hover {\n    border-color: var(--mat-sys-primary);\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  }\n}\n\n.grid-card-checkbox[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.card-thumb[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n}\n\n.card-thumb-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.card-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: #bdbdbd;\n}\n\n.card-body[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n}\n\n.card-title[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: #333;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.card-type[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-top: 2px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Permissions[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   \u2500\u2500\n.permissions-container[_ngcontent-%COMP%] {\n  padding: 16px 0;\n}\n\n.perm-section[_ngcontent-%COMP%] {\n  margin-bottom: 28px;\n}\n\n.perm-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n\n.perm-section-title[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: #333;\n  margin: 0;\n}\n\n.perm-action-btn[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  background: #fafafa;\n  border: 1px solid #e8e8e8;\n  border-radius: 6px;\n  padding: 12px 14px;\n  margin-bottom: 14px;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    align-self: stretch;\n    background: #e53935;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #999;\n  text-align: center;\n  padding: 20px 0;\n}\n\n.perm-row-actions[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  button {\n    opacity: 0.6;\n    &:hover {\n      opacity: 1;\n    }\n  }\n}\n\n.perm-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n\n  th {\n    text-align: left;\n    padding: 10px 14px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n  }\n\n  td {\n    padding: 10px 14px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n}\n\n.perm-user[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.perm-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: var(--mat-sys-primary);\n  vertical-align: middle;\n  margin-right: 4px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   History[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   \u2500\u2500\n.history-container[_ngcontent-%COMP%] {\n  padding: 16px 0;\n}\n\n.history-filters[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 16px;\n  align-items: center;\n}\n\n.filter-field[_ngcontent-%COMP%] {\n  width: 160px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  mat-icon[matPrefix] {\n    font-size: 18px;\n    margin-right: 4px;\n    color: #888;\n  }\n}\n\n.history-empty[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px;\n  font-size: 14px;\n  color: #999;\n}\n\n.history-table-wrapper[_ngcontent-%COMP%] {\n  overflow: auto;\n  border-radius: 8px;\n  border: 1px solid #e0e0e0;\n}\n\n.history-table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.user-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Trash[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   \u2500\u2500\n.trash-container[_ngcontent-%COMP%] {\n  padding: 16px 0;\n}\n\n.restore-btn[_ngcontent-%COMP%] {\n  font-size: 12px;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Responsive[_ngcontent-%COMP%]   \u2500\u2500\n@media[_ngcontent-%COMP%]   (max-width[_ngcontent-%COMP%]: 900px) {\n  .details-panel {\n    width: 280px;\n    flex: 0 0 280px;\n  }\n}\n\n@media (max-width: 600px) {\n  .browse-body[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n\n  .details-panel[_ngcontent-%COMP%] {\n    width: 100%;\n    flex: 0 0 auto;\n    max-height: 50%;\n    border-left: none;\n    border-top: 1px solid #e0e0e0;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BrowseComponent, [{
        type: Component,
        args: [{ selector: 'lib-browse', standalone: true, providers: [
                    provideSatoriDateAdapter(),
                    provideTranslatedDatepickerIntl(),
                    provideNxsToast(),
                    provideNxsThumbnailCache(),
                ], imports: [
                    NxsActionMenuComponent,
                    NxsBreadcrumbsComponent,
                    NxsColumnPickerComponent,
                    NxsDocumentListComponent,
                    NxsDomainHintComponent,
                    NxsErrorStateComponent,
                    NxsFolderHeaderComponent,
                    NxsPagerComponent,
                    NxsSpinnerComponent,
                    NxsThumbnailComponent,
                    NxsUploadQueueComponent,
                    DocTypeLabelPipe,
                    TranslatePipe,
                    DatePipe,
                    FormsModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatButtonModule,
                    MatTabsModule,
                    MatTableModule,
                    MatSortModule,
                    MatPaginatorModule,
                    MatMenuModule,
                    MatTooltipModule,
                    MatDialogModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatDatepickerModule,
                    MatChipsModule,
                    MatAutocompleteModule,
                    MatCheckboxModule,
                    SatAvatarModule,
                    SatTagModule,
                    ExtensionOutletComponent,
                    NxsPermissionsPanelComponent,
                ], template: "<div class=\"browse-container\">\n  <!-- Header row: doc icon/title + actions -->\n  <nxs-folder-header\n    class=\"browse-header\"\n    [heading]=\"currentDoc()?.title ?? ''\"\n    [subheading]=\"currentDoc()?.type | docTypeLabel\"\n    [documentType]=\"currentDoc()?.type ?? ''\"\n  >\n    <div class=\"header-actions\">\n      @if (canCreateContentHere()) {\n        <button\n          mat-flat-button\n          color=\"primary\"\n          [matTooltip]=\"'browse.browse.create-folder-upload-files-or-import' | translate\"\n          [disabled]=\"!isCurrentFolderish()\"\n          (click)=\"openCreateImportDialog()\"\n        >\n          <mat-icon>add</mat-icon>\n          {{ 'browse.browse.create-import' | translate }}\n        </button>\n      }\n      <button\n        mat-icon-button\n        [matTooltip]=\"'browse.browse.upload-with-nuxeo-drive' | translate\"\n        [attr.aria-label]=\"'browse.browse.upload-with-nuxeo-drive' | translate\"\n        (click)=\"openDriveDialog()\"\n      >\n        <mat-icon>cloud_upload</mat-icon>\n      </button>\n      @if (showHeaderEdit()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'browse.browse.edit' | translate\"\n          [attr.aria-label]=\"'browse.browse.edit' | translate\"\n          (click)=\"openEditDialog()\"\n        >\n          <mat-icon>edit</mat-icon>\n        </button>\n      }\n      @if (showHeaderDelete()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'browse.browse.delete' | translate\"\n          [attr.aria-label]=\"'browse.browse.delete' | translate\"\n          (click)=\"deleteDocument()\"\n        >\n          <mat-icon>delete</mat-icon>\n        </button>\n      }\n      <button\n        mat-icon-button\n        [matTooltip]=\"'browse.browse.download-all' | translate\"\n        [attr.aria-label]=\"'browse.browse.download-all' | translate\"\n        (click)=\"downloadAll()\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n      <nxs-action-menu\n        [actions]=\"contextMenuItems()\"\n        [label]=\"'browse.browse.more-actions' | translate\"\n        (selected)=\"runContextMenuItem($event)\"\n      />\n    </div>\n  </nxs-folder-header>\n\n  <!-- Breadcrumbs -->\n  @if (showBreadcrumbs()) {\n    @let trailLabel = 'browse.breadcrumb.label' | translate;\n    <lib-extension-outlet\n      #breadcrumbsOutlet\n      class=\"browse-breadcrumbs\"\n      [componentId]=\"breadcrumbsId\"\n      [componentInputs]=\"{ items: breadcrumbs(), label: trailLabel }\"\n    />\n    @if (breadcrumbsOutlet.unresolved()) {\n      <nxs-breadcrumbs class=\"browse-breadcrumbs\" [items]=\"breadcrumbs()\" [label]=\"trailLabel\" />\n    }\n  }\n\n  <nxs-domain-hint [documentType]=\"currentDoc()?.type\" [path]=\"browsePath()\" />\n\n  <!-- Main body: tabs on left, details panel on right -->\n  <div class=\"browse-body\">\n    <!-- Left: Tabs + content -->\n    <div class=\"browse-main\">\n      <div class=\"tabs-header-row\">\n        <mat-tab-group\n          class=\"browse-tabs\"\n          [selectedIndex]=\"activeTabIndex()\"\n          (selectedIndexChange)=\"onTabChange($event)\"\n        >\n          <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 VIEW TAB \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n          <mat-tab [label]=\"'browse.tab.view' | translate\">\n            <!-- Toolbar: result count + filters + view toggle + column settings + export CSV -->\n            <div class=\"view-toolbar\">\n              @let count = resultCount();\n              @if (count !== null) {\n                <span class=\"result-count\">{{\n                  (count === 1 ? 'common.count.result-one' : 'common.count.result-many')\n                    | translate: { count }\n                }}</span>\n              }\n              <div class=\"toolbar-spacer\"></div>\n\n              <mat-form-field\n                class=\"toolbar-filter-field\"\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n              >\n                <mat-label>{{ 'browse.browse.filter-by-title' | translate }}</mat-label>\n                <input matInput [ngModel]=\"filterText()\" (ngModelChange)=\"filterText.set($event)\" />\n                @if (filterText()) {\n                  <button\n                    matSuffix\n                    mat-icon-button\n                    [attr.aria-label]=\"'browse.browse.clear' | translate\"\n                    (click)=\"filterText.set('')\"\n                    class=\"filter-clear-btn\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                }\n              </mat-form-field>\n              <mat-form-field\n                class=\"toolbar-filter-field toolbar-filter-date\"\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n              >\n                <mat-label>{{ 'browse.browse.modified' | translate }}</mat-label>\n                <mat-date-range-input [rangePicker]=\"modifiedPicker\">\n                  <input\n                    matStartDate\n                    [ngModel]=\"filterModifiedFrom()\"\n                    (ngModelChange)=\"filterModifiedFrom.set($event)\"\n                    [placeholder]=\"'browse.browse.from' | translate\"\n                  />\n                  <input\n                    matEndDate\n                    [ngModel]=\"filterModifiedTo()\"\n                    (ngModelChange)=\"filterModifiedTo.set($event)\"\n                    [placeholder]=\"'browse.browse.to' | translate\"\n                  />\n                </mat-date-range-input>\n                <mat-datepicker-toggle matIconSuffix [for]=\"modifiedPicker\" />\n                <mat-date-range-picker #modifiedPicker />\n              </mat-form-field>\n              <mat-form-field\n                class=\"toolbar-filter-field\"\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n              >\n                <mat-label>{{ 'browse.browse.last-contributor' | translate }}</mat-label>\n                <input\n                  matInput\n                  [ngModel]=\"filterContributor()\"\n                  (ngModelChange)=\"filterContributor.set($event)\"\n                />\n                @if (filterContributor()) {\n                  <button\n                    matSuffix\n                    mat-icon-button\n                    [attr.aria-label]=\"'browse.browse.clear' | translate\"\n                    (click)=\"filterContributor.set('')\"\n                    class=\"filter-clear-btn\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                }\n              </mat-form-field>\n              <mat-form-field\n                class=\"toolbar-filter-select\"\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n              >\n                <mat-label>{{ 'browse.browse.all-types' | translate }}</mat-label>\n                <mat-select [ngModel]=\"filterType()\" (ngModelChange)=\"filterType.set($event)\">\n                  <mat-option value=\"\">{{ 'browse.browse.all-types' | translate }}</mat-option>\n                  @for (t of distinctTypes(); track t) {\n                    <mat-option [value]=\"t\">{{ t }}</mat-option>\n                  }\n                </mat-select>\n              </mat-form-field>\n\n              <div class=\"toolbar-actions\">\n                @if (viewMode() === 'list') {\n                  <button\n                    mat-icon-button\n                    class=\"gear-btn\"\n                    [matTooltip]=\"'browse.browse.manage-columns' | translate\"\n                    [attr.aria-label]=\"'browse.browse.manage-columns' | translate\"\n                    (click)=\"openColumnPanel()\"\n                  >\n                    <mat-icon>tune</mat-icon>\n                  </button>\n                }\n                <button\n                  mat-icon-button\n                  [matTooltip]=\"'browse.browse.export-csv' | translate\"\n                  [attr.aria-label]=\"'browse.browse.export-csv' | translate\"\n                  (click)=\"exportCsv()\"\n                  [disabled]=\"csvExporting()\"\n                >\n                  @if (csvExporting()) {\n                    <mat-spinner\n                      diameter=\"18\"\n                      [attr.aria-label]=\"'browse.browse.loading' | translate\"\n                    />\n                  } @else {\n                    <mat-icon>download</mat-icon>\n                  }\n                </button>\n                <button\n                  mat-icon-button\n                  [matTooltip]=\"'browse.browse.list-view' | translate\"\n                  [attr.aria-label]=\"'browse.browse.list-view' | translate\"\n                  [class.active-view]=\"viewMode() === 'list'\"\n                  (click)=\"setViewMode('list')\"\n                >\n                  <mat-icon>view_list</mat-icon>\n                </button>\n                <button\n                  mat-icon-button\n                  [matTooltip]=\"'browse.browse.card-view' | translate\"\n                  [attr.aria-label]=\"'browse.browse.card-view' | translate\"\n                  [class.active-view]=\"viewMode() === 'card'\"\n                  (click)=\"setViewMode('card')\"\n                >\n                  <mat-icon>grid_view</mat-icon>\n                </button>\n              </div>\n            </div>\n\n            @if (viewMode() === 'list') {\n              <div class=\"browse-list-container\">\n                @if (columnPanelOpen()) {\n                  <nxs-column-picker\n                    [columns]=\"pickerColumns()\"\n                    [required]=\"requiredColumnKeys\"\n                    [defaults]=\"defaultColumnKeys()\"\n                    (apply)=\"applyColumns($event)\"\n                    (dismiss)=\"closeColumnPanel()\"\n                  />\n                }\n                <nxs-document-list\n                  class=\"browse-document-list\"\n                  [documents]=\"filteredEntries()\"\n                  [columns]=\"listColumns()\"\n                  [label]=\"\n                    'browse.browse.contents-of' | translate: { name: currentDoc()?.title ?? '' }\n                  \"\n                  [sort]=\"listSort()\"\n                  [selectedIds]=\"listSelectedIds()\"\n                  [pageIndex]=\"pageIndex()\"\n                  [pageSize]=\"pageSize\"\n                  [totalSize]=\"totalSize()\"\n                  [hasNextPage]=\"hasNextPage()\"\n                  [loading]=\"loading()\"\n                  [error]=\"error() ? errorStatus() : null\"\n                  [errorHeading]=\"error() ?? ''\"\n                  [emptyHeading]=\"'browse.browse.this-folder-is-empty' | translate\"\n                  [rowActions]=\"rowMenus()\"\n                  (selectedIdsChange)=\"onListSelectionChange($event)\"\n                  (sortChange)=\"onListSortChange($event)\"\n                  (pageChange)=\"goToPage($event)\"\n                  (open)=\"onRowClick($event)\"\n                  (rowAction)=\"onRowAction($event)\"\n                  (retry)=\"loadContent()\"\n                  [dropEnabled]=\"canCreateContentHere()\"\n                  [dropLabel]=\"\n                    'browse.browse.drop-to-upload' | translate: { name: currentDoc()?.title ?? '' }\n                  \"\n                  (filesDropped)=\"uploadDropped($event)\"\n                />\n              </div>\n            } @else if (loading()) {\n              <div class=\"browse-loading\">\n                <nxs-spinner diameter=\"36\" [label]=\"'browse.browse.loading' | translate\" />\n              </div>\n            } @else if (error(); as message) {\n              <nxs-error-state\n                [status]=\"errorStatus()\"\n                [heading]=\"errorStatus() === 500 ? message : ''\"\n                retryable\n                (retry)=\"loadContent()\"\n              />\n            } @else {\n              @if (filteredEntries().length === 0 && pageIndex() === 0) {\n                <div class=\"browse-empty\">\n                  <mat-icon class=\"empty-icon\">folder_open</mat-icon>\n                  <p>{{ 'browse.browse.this-folder-is-empty' | translate }}</p>\n                </div>\n              }\n              <!-- Card view -->\n              <div class=\"card-grid\">\n                @for (doc of filteredEntries(); track doc.uid) {\n                  <div\n                    class=\"doc-card-wrapper\"\n                    [class.doc-card-wrapper--selected]=\"isSelected(doc.uid)\"\n                  >\n                    <div class=\"grid-card-checkbox\">\n                      <mat-checkbox\n                        [checked]=\"isSelected(doc.uid)\"\n                        [aria-label]=\"selectionAriaLabel(doc)\"\n                        (change)=\"toggleSelection(doc.uid)\"\n                        (click)=\"$event.stopPropagation()\"\n                      ></mat-checkbox>\n                    </div>\n                    <button class=\"doc-card\" type=\"button\" (click)=\"onRowClick(doc)\">\n                      <div class=\"card-thumb\">\n                        <nxs-thumbnail class=\"card-thumb-img\" [documentId]=\"doc.uid\">\n                          <mat-icon class=\"card-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n                        </nxs-thumbnail>\n                      </div>\n                      <div class=\"card-body\">\n                        <span class=\"card-title\">{{ doc.title }}</span>\n                        <span class=\"card-type\">{{ doc.type | docTypeLabel }}</span>\n                      </div>\n                    </button>\n                    @if (isCollectionEntry(doc) && hasCollectionEntryActions(doc)) {\n                      <button\n                        mat-icon-button\n                        type=\"button\"\n                        class=\"grid-card-menu\"\n                        [matMenuTriggerFor]=\"collectionCardMenu\"\n                        [attr.aria-label]=\"'browse.browse.collection-actions' | translate\"\n                        (click)=\"$event.stopPropagation()\"\n                      >\n                        <mat-icon>more_vert</mat-icon>\n                      </button>\n                      <mat-menu #collectionCardMenu=\"matMenu\">\n                        @if (canEditCollectionEntry(doc)) {\n                          <button mat-menu-item (click)=\"openEditCollectionDialog(doc)\">\n                            <mat-icon>edit</mat-icon>\n                            <span>{{ 'browse.browse.edit' | translate }}</span>\n                          </button>\n                        }\n                        @if (canDeleteCollectionEntry(doc)) {\n                          <button mat-menu-item (click)=\"deleteCollectionEntry(doc)\">\n                            <mat-icon>delete</mat-icon>\n                            <span>{{ 'browse.browse.delete' | translate }}</span>\n                          </button>\n                        }\n                      </mat-menu>\n                    }\n                  </div>\n                }\n              </div>\n              <nxs-pager\n                [pageIndex]=\"pageIndex()\"\n                [pageSize]=\"pageSize\"\n                [itemCount]=\"filteredEntries().length\"\n                [totalSize]=\"totalSize()\"\n                [hasNextPage]=\"hasNextPage()\"\n                (pageChange)=\"goToPage($event)\"\n              />\n            }\n            @if (droppedUploads.items().length > 0) {\n              <section\n                class=\"browse-uploads\"\n                [attr.aria-label]=\"'browse.browse.uploads' | translate\"\n              >\n                <div class=\"browse-uploads__header\">\n                  <span class=\"browse-uploads__title\">{{\n                    'browse.browse.uploads' | translate\n                  }}</span>\n                  <button\n                    mat-button\n                    type=\"button\"\n                    [disabled]=\"droppedUploads.busy()\"\n                    (click)=\"droppedUploads.clear()\"\n                  >\n                    {{ 'browse.browse.clear-uploads' | translate }}\n                  </button>\n                </div>\n                <nxs-upload-queue\n                  [items]=\"droppedUploads.items()\"\n                  [label]=\"'browse.browse.uploads' | translate\"\n                  (remove)=\"droppedUploads.remove($event)\"\n                  (retry)=\"runDroppedUploads()\"\n                />\n              </section>\n            }\n          </mat-tab>\n\n          <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 PERMISSIONS TAB \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n          <mat-tab [label]=\"'browse.tab.permissions' | translate\">\n            <div class=\"permissions-container\">\n              <!-- Local and inherited permissions: the nxs- panel, resolved by its registered ID so a\n                   customer library can re-register a replacement. -->\n              @if (currentDoc(); as folder) {\n                <lib-extension-outlet\n                  #permissionsPanelOutlet\n                  [componentId]=\"permissionsPanelId\"\n                  [componentInputs]=\"{\n                    documentId: folder.uid,\n                    permissionsChanged: onPermissionsChanged,\n                  }\"\n                />\n                @if (permissionsPanelOutlet.unresolved()) {\n                  <nxs-permissions-panel\n                    [documentId]=\"folder.uid\"\n                    [permissionsChanged]=\"onPermissionsChanged\"\n                  />\n                }\n              }\n              @if (permissionsLoading()) {\n                <div class=\"browse-loading\">\n                  <nxs-spinner diameter=\"24\" [label]=\"'browse.browse.loading' | translate\" />\n                </div>\n              } @else {\n                <!-- Permissions Assigned to External Users -->\n                <section class=\"perm-section\">\n                  <div class=\"perm-section-header\">\n                    <div class=\"perm-section-title\" role=\"heading\" aria-level=\"3\">\n                      {{ 'browse.browse.permissions-assigned-to-external-users' | translate }}\n                    </div>\n                    @if (canManageCurrentPermissions()) {\n                      <button\n                        mat-button\n                        color=\"primary\"\n                        class=\"perm-action-btn\"\n                        (click)=\"shareWithExternal()\"\n                      >\n                        {{ 'browse.browse.new' | translate }}\n                      </button>\n                    }\n                  </div>\n                  <div class=\"perm-info-bar\">\n                    <span class=\"perm-info-accent\"></span>\n                    <p>\n                      {{ 'browse.browse.sharing-to-external-users-does-not' | translate }}\n                    </p>\n                  </div>\n                  @if (externalAces().length === 0) {\n                    <div class=\"perm-empty\">\n                      {{ 'browse.browse.the-document-is-not-shared-with' | translate }}\n                    </div>\n                  } @else {\n                    <table class=\"perm-table\">\n                      <thead>\n                        <tr>\n                          <th>{{ 'browse.browse.user' | translate }}</th>\n                          <th>{{ 'browse.browse.right' | translate }}</th>\n                          <th>{{ 'browse.browse.time-frame' | translate }}</th>\n                          <th>{{ 'browse.browse.granted-by' | translate }}</th>\n                          @if (canManageCurrentPermissions()) {\n                            <th>{{ 'browse.browse.actions' | translate }}</th>\n                          }\n                        </tr>\n                      </thead>\n                      <tbody>\n                        @for (ace of externalAces(); track ace.id) {\n                          <tr>\n                            <td>{{ displayUsername(ace) }}</td>\n                            <td>{{ permissionLabel(ace.permission) }}</td>\n                            <td>{{ aceTimeFrame(ace) }}</td>\n                            <td>{{ aceGrantedBy(ace) }}</td>\n                            @if (canManageCurrentPermissions()) {\n                              <td class=\"perm-row-actions\">\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"'browse.browse.edit' | translate\"\n                                  [attr.aria-label]=\"'browse.browse.edit' | translate\"\n                                  type=\"button\"\n                                  (click)=\"editExternalPermission(ace)\"\n                                >\n                                  <mat-icon>edit</mat-icon>\n                                </button>\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"'browse.browse.send-notification-email' | translate\"\n                                  [attr.aria-label]=\"\n                                    'browse.browse.send-notification-email' | translate\n                                  \"\n                                  type=\"button\"\n                                  [disabled]=\"actionInProgress() === 'notify-' + ace.id\"\n                                  (click)=\"sendNotificationEmail(ace)\"\n                                >\n                                  <mat-icon>email</mat-icon>\n                                </button>\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"'browse.browse.delete' | translate\"\n                                  [attr.aria-label]=\"'browse.browse.delete' | translate\"\n                                  type=\"button\"\n                                  (click)=\"deletePermission(ace)\"\n                                >\n                                  <mat-icon>delete</mat-icon>\n                                </button>\n                              </td>\n                            }\n                          </tr>\n                        }\n                      </tbody>\n                    </table>\n                  }\n                </section>\n              }\n            </div>\n          </mat-tab>\n\n          <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 HISTORY TAB \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n          <mat-tab [label]=\"'browse.tab.history' | translate\">\n            <div class=\"history-container\">\n              <div class=\"history-filters\">\n                <mat-form-field appearance=\"outline\" class=\"filter-field\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'browse.browse.username' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [ngModel]=\"filterUsername()\"\n                    (ngModelChange)=\"filterUsername.set($event)\"\n                  />\n                  <mat-icon matPrefix>person_search</mat-icon>\n                </mat-form-field>\n                <mat-form-field appearance=\"outline\" class=\"filter-field\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'browse.browse.from' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [matDatepicker]=\"histFrom\"\n                    [ngModel]=\"filterDateFrom()\"\n                    (ngModelChange)=\"filterDateFrom.set($event)\"\n                  />\n                  <mat-datepicker-toggle matIconSuffix [for]=\"histFrom\" />\n                  <mat-datepicker #histFrom />\n                </mat-form-field>\n                <mat-form-field appearance=\"outline\" class=\"filter-field\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'browse.browse.to' | translate }}</mat-label>\n                  <input\n                    matInput\n                    [matDatepicker]=\"histTo\"\n                    [ngModel]=\"filterDateTo()\"\n                    (ngModelChange)=\"filterDateTo.set($event)\"\n                  />\n                  <mat-datepicker-toggle matIconSuffix [for]=\"histTo\" />\n                  <mat-datepicker #histTo />\n                </mat-form-field>\n                <mat-form-field appearance=\"outline\" class=\"filter-field\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'browse.browse.action' | translate }}</mat-label>\n                  <mat-select [ngModel]=\"filterAction()\" (ngModelChange)=\"filterAction.set($event)\">\n                    <mat-option value=\"\">{{ 'browse.browse.all' | translate }}</mat-option>\n                    @for (a of availableActions(); track a.id) {\n                      <mat-option [value]=\"a.id\">{{ a.label }}</mat-option>\n                    }\n                  </mat-select>\n                </mat-form-field>\n                <mat-form-field appearance=\"outline\" class=\"filter-field\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'browse.browse.category' | translate }}</mat-label>\n                  <mat-select\n                    [ngModel]=\"filterCategory()\"\n                    (ngModelChange)=\"filterCategory.set($event)\"\n                  >\n                    <mat-option value=\"\">{{ 'browse.browse.all' | translate }}</mat-option>\n                    @for (c of availableCategories(); track c.id) {\n                      <mat-option [value]=\"c.id\">{{ c.label }}</mat-option>\n                    }\n                  </mat-select>\n                </mat-form-field>\n              </div>\n\n              @if (auditLoading()) {\n                <div class=\"browse-loading\">\n                  <nxs-spinner diameter=\"24\" [label]=\"'browse.browse.loading' | translate\" />\n                </div>\n              } @else if (filteredAuditEntries().length === 0) {\n                <div class=\"history-empty\">\n                  {{ 'browse.browse.no-audit-entries-found' | translate }}\n                </div>\n              } @else {\n                <div class=\"history-table-wrapper\">\n                  <table\n                    mat-table\n                    [dataSource]=\"filteredAuditEntries()\"\n                    matSort\n                    [matSortActive]=\"sortActive()\"\n                    [matSortDirection]=\"sortDirection()\"\n                    (matSortChange)=\"onAuditSort($event)\"\n                    class=\"history-table\"\n                  >\n                    <ng-container matColumnDef=\"eventId\">\n                      <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                        {{ 'browse.browse.performed-action' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">{{ eventLabel(row.eventId) }}</td>\n                    </ng-container>\n                    <ng-container matColumnDef=\"eventDate\">\n                      <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                        {{ 'browse.browse.date' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">{{ row.eventDate | date: 'medium' }}</td>\n                    </ng-container>\n                    <ng-container matColumnDef=\"principalName\">\n                      <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                        {{ 'browse.browse.username' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">\n                        <span class=\"user-cell\">\n                          <sat-avatar\n                            [initials]=\"avatarInitials(row.principalName)\"\n                            [category]=\"avatarColor(row.principalName)\"\n                            size=\"24\"\n                            [borderless]=\"true\"\n                            aria-hidden=\"true\"\n                          />\n                          {{ row.principalName }}\n                        </span>\n                      </td>\n                    </ng-container>\n                    <ng-container matColumnDef=\"category\">\n                      <th mat-header-cell *matHeaderCellDef mat-sort-header>\n                        {{ 'browse.browse.category' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">{{ categoryLabel(row.category) }}</td>\n                    </ng-container>\n                    <ng-container matColumnDef=\"comment\">\n                      <th mat-header-cell *matHeaderCellDef>\n                        {{ 'browse.browse.comment' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">{{ row.comment }}</td>\n                    </ng-container>\n                    <ng-container matColumnDef=\"docLifeCycle\">\n                      <th mat-header-cell *matHeaderCellDef>\n                        {{ 'browse.browse.state' | translate }}\n                      </th>\n                      <td mat-cell *matCellDef=\"let row\">\n                        @if (row.docLifeCycle) {\n                          <sat-status-tag status=\"info\" [hideIcon]=\"true\">{{\n                            row.docLifeCycle\n                          }}</sat-status-tag>\n                        }\n                      </td>\n                    </ng-container>\n\n                    <tr\n                      mat-header-row\n                      *matHeaderRowDef=\"[\n                        'eventId',\n                        'eventDate',\n                        'principalName',\n                        'category',\n                        'comment',\n                        'docLifeCycle',\n                      ]\"\n                    ></tr>\n                    <tr\n                      mat-row\n                      *matRowDef=\"\n                        let row;\n                        columns: [\n                          'eventId',\n                          'eventDate',\n                          'principalName',\n                          'category',\n                          'comment',\n                          'docLifeCycle',\n                        ]\n                      \"\n                    ></tr>\n                  </table>\n                </div>\n\n                <mat-paginator\n                  [length]=\"auditTotalSize()\"\n                  [pageSize]=\"auditPageSize()\"\n                  [pageIndex]=\"auditPageIndex()\"\n                  [pageSizeOptions]=\"[10, 20, 50]\"\n                  (page)=\"onAuditPageChange($event)\"\n                  showFirstLastButtons\n                />\n              }\n            </div>\n          </mat-tab>\n\n          <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550 TRASH TAB \u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n          <mat-tab [label]=\"'browse.tab.trash' | translate\">\n            <div class=\"trash-container\">\n              @if (trashLoading()) {\n                <div class=\"browse-loading\">\n                  <mat-spinner\n                    diameter=\"24\"\n                    [attr.aria-label]=\"'browse.browse.loading' | translate\"\n                  />\n                </div>\n              } @else if (trashedDocs().length === 0) {\n                <div class=\"browse-empty\">\n                  <mat-icon class=\"empty-icon\">delete_outline</mat-icon>\n                  <p>{{ 'browse.browse.trash-is-empty' | translate }}</p>\n                </div>\n              } @else {\n                <div class=\"browse-table-wrapper\">\n                  <table class=\"browse-table\">\n                    <thead>\n                      <tr>\n                        <th>{{ 'browse.browse.name' | translate }}</th>\n                        <th>{{ 'browse.browse.type' | translate }}</th>\n                        <th>{{ 'browse.browse.last-modified' | translate }}</th>\n                        <th>{{ 'browse.browse.actions' | translate }}</th>\n                      </tr>\n                    </thead>\n                    <tbody>\n                      @for (doc of trashedDocs(); track doc.uid) {\n                        <tr class=\"browse-row\">\n                          <td class=\"cell-name-inner\">\n                            <nxs-thumbnail class=\"doc-thumb\" [documentId]=\"doc.uid\">\n                              <mat-icon class=\"doc-icon\">{{ docIcon(doc) }}</mat-icon>\n                            </nxs-thumbnail>\n                            <span class=\"doc-title\">{{ doc.title }}</span>\n                          </td>\n                          <td>\n                            <sat-category-tag category=\"blue\">{{\n                              doc.type | docTypeLabel\n                            }}</sat-category-tag>\n                          </td>\n                          <td>{{ doc.lastModified | date: 'mediumDate' }}</td>\n                          <td>\n                            <button\n                              mat-stroked-button\n                              class=\"restore-btn\"\n                              (click)=\"restoreDocument(doc)\"\n                            >\n                              <mat-icon>restore_from_trash</mat-icon>\n                              {{ 'browse.browse.restore' | translate }}\n                            </button>\n                          </td>\n                        </tr>\n                      }\n                    </tbody>\n                  </table>\n                </div>\n              }\n            </div>\n          </mat-tab>\n        </mat-tab-group>\n\n        <!-- Panel toggle button -->\n        <button\n          mat-icon-button\n          class=\"panel-toggle-btn\"\n          (click)=\"togglePanel()\"\n          [matTooltip]=\"\n            panelOpen() ? ('browse.hide-details' | translate) : ('browse.show-details' | translate)\n          \"\n          [attr.aria-label]=\"'browse.browse.toggle-details-panel' | translate\"\n        >\n          <mat-icon>{{ panelOpen() ? 'info' : 'info_outline' }}</mat-icon>\n        </button>\n      </div>\n    </div>\n\n    <!-- Right: Details Side Panel -->\n    @if (panelOpen() && currentDoc(); as doc) {\n      <aside class=\"details-panel\">\n        <div class=\"panel-header\">\n          <span class=\"panel-title\">{{ doc.title }}</span>\n          <button\n            mat-icon-button\n            (click)=\"closePanel()\"\n            [attr.aria-label]=\"'browse.browse.close-panel' | translate\"\n          >\n            <mat-icon>close</mat-icon>\n          </button>\n        </div>\n\n        <div class=\"panel-sub-tabs\">\n          <button\n            class=\"sub-tab\"\n            [class.sub-tab--active]=\"panelSubTab() === 'info'\"\n            (click)=\"switchPanelSubTab('info')\"\n          >\n            {{ 'browse.browse.info' | translate }}\n          </button>\n          <button\n            class=\"sub-tab\"\n            [class.sub-tab--active]=\"panelSubTab() === 'tags'\"\n            (click)=\"switchPanelSubTab('tags')\"\n          >\n            {{ 'browse.browse.tags' | translate }}\n          </button>\n          <button\n            class=\"sub-tab\"\n            [class.sub-tab--active]=\"panelSubTab() === 'activity'\"\n            (click)=\"switchPanelSubTab('activity')\"\n          >\n            {{ 'browse.browse.activity' | translate }}\n          </button>\n        </div>\n\n        <!-- Info sub-tab -->\n        @if (panelSubTab() === 'info') {\n          <div class=\"panel-body\">\n            <div class=\"panel-info-section\">\n              <div class=\"panel-section-title\" role=\"heading\" aria-level=\"4\">\n                {{ 'browse.browse.info' | translate }}\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.state' | translate }}</span>\n                <span class=\"info-value\">\n                  <sat-status-tag status=\"info\" [hideIcon]=\"true\">{{ docState() }}</sat-status-tag>\n                </span>\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.last-modified' | translate }}</span>\n                <span class=\"info-value\">{{ doc.lastModified | date: 'mediumDate' }}</span>\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.created' | translate }}</span>\n                <span class=\"info-value\">{{\n                  $any(doc.properties['dc:created']) | date: 'mediumDate'\n                }}</span>\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.by' | translate }}</span>\n                <span class=\"info-value avatar-value\">\n                  <sat-avatar\n                    [initials]=\"avatarInitials(docCreator(doc))\"\n                    [category]=\"avatarColor(docCreator(doc))\"\n                    size=\"24\"\n                    [borderless]=\"true\"\n                    aria-hidden=\"true\"\n                  />\n                  {{ docCreator(doc) }}\n                </span>\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.contributors' | translate }}</span>\n                <span class=\"info-value avatar-value\">\n                  <sat-avatar\n                    [initials]=\"avatarInitials(lastContributor(doc))\"\n                    [category]=\"avatarColor(lastContributor(doc))\"\n                    size=\"24\"\n                    [borderless]=\"true\"\n                    aria-hidden=\"true\"\n                  />\n                  {{ lastContributor(doc) }}\n                </span>\n              </div>\n            </div>\n\n            <div class=\"panel-info-section\">\n              <div class=\"panel-section-title\" role=\"heading\" aria-level=\"4\">\n                {{ 'browse.browse.properties' | translate }}\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.title' | translate }}</span>\n                <span class=\"info-value\">{{ doc.title }}</span>\n              </div>\n              <div class=\"panel-info-row\">\n                <span class=\"info-label\">{{ 'browse.browse.type' | translate }}</span>\n                <span class=\"info-value\">{{ doc.type | docTypeLabel }}</span>\n              </div>\n            </div>\n          </div>\n        }\n\n        <!-- Tags sub-tab -->\n        @if (panelSubTab() === 'tags') {\n          <div class=\"panel-body\">\n            <div class=\"panel-section-title\" role=\"heading\" aria-level=\"4\">\n              {{ 'browse.browse.tags' | translate }}\n            </div>\n            <div class=\"tags-container\">\n              @for (tag of tags(); track tag) {\n                <span class=\"removable-tag\">\n                  <sat-category-tag category=\"blue\">{{ tag }}</sat-category-tag>\n                  <button\n                    type=\"button\"\n                    class=\"tag-remove-btn\"\n                    (click)=\"removeTag(tag)\"\n                    [attr.aria-label]=\"'shared.remove-tag' | translate: { name: tag }\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                </span>\n              }\n              @if (tags().length === 0) {\n                <span class=\"no-data\">{{ 'browse.browse.no-tags-yet' | translate }}</span>\n              }\n            </div>\n\n            <mat-form-field class=\"tag-autocomplete-field\" appearance=\"outline\">\n              <input\n                matInput\n                [placeholder]=\"'browse.browse.search-or-create-a-tag' | translate\"\n                [(ngModel)]=\"tagInput\"\n                (ngModelChange)=\"onTagSearch($event)\"\n                [matAutocomplete]=\"tagAuto\"\n              />\n              <mat-icon matSuffix>arrow_drop_down</mat-icon>\n              <mat-autocomplete\n                #tagAuto=\"matAutocomplete\"\n                (optionSelected)=\"selectTag($event.option.value)\"\n                autoActiveFirstOption\n              >\n                @for (result of tagSearchResults(); track result) {\n                  <mat-option [value]=\"result\">{{ result }}</mat-option>\n                }\n                @if (showCreateOption()) {\n                  <mat-option [value]=\"tagInput\">\n                    <span class=\"create-tag-option\">+ {{ tagInput }}</span>\n                  </mat-option>\n                }\n              </mat-autocomplete>\n            </mat-form-field>\n          </div>\n        }\n\n        <!-- Activity sub-tab -->\n        @if (panelSubTab() === 'activity') {\n          <div class=\"panel-body\">\n            @if (activityLoading()) {\n              <div class=\"panel-loading\">\n                <nxs-spinner diameter=\"20\" [label]=\"'browse.browse.loading' | translate\" />\n              </div>\n            } @else {\n              @for (entry of activityEntries(); track entry.id) {\n                <div class=\"activity-item\">\n                  <sat-avatar\n                    [initials]=\"avatarInitials(entry.principalName)\"\n                    [category]=\"avatarColor(entry.principalName)\"\n                    size=\"28\"\n                    [borderless]=\"true\"\n                    aria-hidden=\"true\"\n                  />\n                  <div class=\"activity-text\">\n                    <span class=\"activity-user\">{{ entry.principalName }}</span>\n                    <span class=\"activity-action\">{{ activityLabel(entry) }}</span>\n                    <span class=\"activity-time\">{{ relativeTime(entry.eventDate) }}</span>\n                  </div>\n                </div>\n              }\n              @if (activityEntries().length === 0) {\n                <span class=\"no-data\">{{ 'browse.browse.no-recent-activity' | translate }}</span>\n              }\n            }\n          </div>\n        }\n      </aside>\n    }\n  </div>\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n.browse-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n}\n\n// \u2500\u2500 Header \u2500\u2500\n.browse-header {\n  padding-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  flex-shrink: 0;\n}\n\nsat-breadcrumbs {\n  padding-bottom: 12px;\n  flex-shrink: 0;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n// \u2500\u2500 Two-column body layout \u2500\u2500\n.browse-body {\n  flex: 1;\n  display: flex;\n  flex-direction: row;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.browse-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.tabs-header-row {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  overflow: hidden;\n  position: relative;\n}\n\n// \u2500\u2500 Panel toggle button \u2500\u2500\n.panel-toggle-btn {\n  position: absolute;\n  top: 4px;\n  right: 8px;\n  z-index: 2;\n  color: #555;\n  &:hover {\n    color: var(--mat-sys-primary);\n  }\n}\n\n// \u2500\u2500 Tabs \u2500\u2500\n.browse-tabs {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n\n  ::ng-deep .mat-mdc-tab-header {\n    background: #fff;\n    border-bottom: 1px solid #e0e0e0;\n    flex-shrink: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-labels {\n    gap: 0;\n    justify-content: flex-start;\n  }\n\n  ::ng-deep .mat-mdc-tab {\n    flex-grow: 0 !important;\n    min-width: 0;\n    padding: 0 20px;\n    font-size: 13px;\n    letter-spacing: 0;\n  }\n\n  ::ng-deep .mat-mdc-tab-body-wrapper {\n    flex: 1;\n    overflow: auto;\n  }\n}\n\n// \u2500\u2500 Details Side Panel \u2500\u2500\n.details-panel {\n  width: 360px;\n  flex: 0 0 360px;\n  display: flex;\n  flex-direction: column;\n  background: #fff;\n  border-left: 1px solid #e0e0e0;\n  overflow: hidden;\n}\n\n.panel-header {\n  display: flex;\n  align-items: center;\n  padding: 12px 8px 12px 16px;\n  border-bottom: 1px solid #f0f0f0;\n  flex-shrink: 0;\n\n  .panel-title {\n    flex: 1;\n    font-size: 14px;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface);\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n}\n\n.panel-sub-tabs {\n  display: flex;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n}\n\n.sub-tab {\n  flex: 1;\n  padding: 10px 16px;\n  border: none;\n  background: none;\n  font-size: 13px;\n  font-weight: 500;\n  color: #888;\n  cursor: pointer;\n  text-align: center;\n  position: relative;\n  transition: color 0.15s;\n\n  &:hover {\n    color: #333;\n  }\n\n  &--active {\n    color: var(--mat-sys-primary);\n\n    &::after {\n      content: '';\n      position: absolute;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      height: 2px;\n      background: var(--mat-sys-primary);\n    }\n  }\n}\n\n.panel-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n\n.panel-loading {\n  display: flex;\n  justify-content: center;\n  padding: 24px;\n}\n\n// Panel info rows\n.panel-info-section {\n  margin-bottom: 20px;\n}\n\n.panel-section-title {\n  font-size: 13px;\n  font-weight: 600;\n  color: #555;\n  margin: 0 0 10px;\n}\n\n.panel-info-row {\n  display: flex;\n  align-items: flex-start;\n  padding: 6px 0;\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.info-label {\n  width: 110px;\n  flex-shrink: 0;\n  font-size: 12px;\n  font-weight: 500;\n  color: #888;\n}\n\n.info-value {\n  flex: 1;\n  font-size: 13px;\n  color: #333;\n  min-width: 0;\n}\n\n.avatar-value {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.removable-tag {\n  display: inline-flex;\n  align-items: center;\n  gap: 0;\n  position: relative;\n}\n\n.tag-remove-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  margin-left: -4px;\n  color: #666;\n  .mat-icon {\n    font-size: 14px;\n    width: 14px;\n    height: 14px;\n  }\n  &:hover {\n    color: #d32f2f;\n  }\n}\n\n// Tags\n.tags-container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 12px;\n}\n\n.tag-autocomplete-field {\n  width: 100%;\n  margin-top: 12px;\n\n  .mat-mdc-form-field-icon-suffix {\n    color: #666;\n  }\n}\n\n.create-tag-option {\n  font-weight: 500;\n  color: var(--mat-sys-primary);\n}\n\n// Activity items\n.activity-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 8px 0;\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.activity-text {\n  display: flex;\n  flex-direction: column;\n  font-size: 12px;\n  line-height: 1.5;\n}\n\n.activity-user {\n  font-weight: 600;\n  color: #333;\n}\n\n.activity-action {\n  color: #555;\n}\n\n.activity-time {\n  color: #999;\n  font-size: 11px;\n}\n\n.no-data {\n  font-size: 13px;\n  color: #999;\n}\n\n// \u2500\u2500 View toolbar \u2500\u2500\n.view-toolbar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 0;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n}\n\n.result-count {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  white-space: nowrap;\n}\n\n.toolbar-spacer {\n  flex: 1;\n}\n\n.toolbar-filter-field {\n  width: 170px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  ::ng-deep input {\n    font-size: 12px;\n  }\n\n  &.toolbar-filter-date {\n    width: 210px;\n  }\n}\n\n.filter-clear-btn {\n  width: 24px !important;\n  height: 24px !important;\n  line-height: 24px !important;\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n\n.toolbar-filter-select {\n  width: 130px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  ::ng-deep .mat-mdc-select-trigger {\n    font-size: 12px;\n  }\n}\n\n.toolbar-actions {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n\n.active-view {\n  color: var(--mat-sys-primary) !important;\n  background: var(--mat-sys-primary-container);\n  border-radius: 4px;\n}\n\n// \u2500\u2500 Loading / Error / Empty \u2500\u2500\n.browse-loading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex: 1;\n  padding: 40px 0;\n}\n\n.browse-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  color: #999;\n  gap: 8px;\n  padding: 40px 0;\n\n  .empty-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n// \u2500\u2500 Table (List view) \u2500\u2500\n.browse-list-container {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  min-height: 0;\n}\n\n.browse-document-list {\n  flex: 1;\n  min-height: 0;\n}\n\n.browse-uploads {\n  margin-top: 12px;\n}\n\n.browse-uploads__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.browse-uploads__title {\n  font: var(--mat-sys-title-small);\n}\n\n.browse-table-wrapper {\n  flex: 1;\n  overflow: auto;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n}\n\n.browse-table {\n  width: 100%;\n  border-collapse: collapse;\n\n  thead {\n    position: sticky;\n    top: 0;\n    z-index: 1;\n  }\n\n  th {\n    text-align: left;\n    padding: 10px 14px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n    white-space: nowrap;\n\n    &.sortable-th {\n      cursor: pointer;\n      user-select: none;\n      &:hover {\n        color: #333;\n        background: #f0f0f0;\n      }\n    }\n  }\n\n  td {\n    padding: 8px 14px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  .col-checkbox {\n    width: 40px;\n  }\n\n  .col-gear {\n    width: 48px;\n    text-align: right;\n    padding: 0 4px;\n  }\n\n  .col-actions,\n  .cell-actions {\n    width: 44px;\n    text-align: center;\n    padding: 0;\n  }\n}\n\n.gear-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.th-label {\n  vertical-align: middle;\n}\n\n.sort-arrow {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  vertical-align: middle;\n  margin-left: 2px;\n  color: #333;\n}\n\n.browse-row {\n  transition: background-color 0.15s;\n  cursor: pointer;\n  &:hover {\n    background: #f8f9fe;\n  }\n\n  &--selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-primary-container, #e8def8);\n    }\n  }\n}\n\n.cell-checkbox {\n  width: 40px;\n  text-align: center;\n  vertical-align: middle;\n}\n\n.cell-name-inner {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.doc-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #9e9e9e;\n  flex-shrink: 0;\n}\n\n.doc-thumb {\n  width: 24px;\n  height: 24px;\n  border-radius: 3px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid #e8e8e8;\n}\n\n.folder-icon {\n  color: #ffa726;\n}\n\n.doc-title {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.type-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 1;\n  text-align: center;\n  color: var(--mat-sys-on-primary-container);\n  background: var(--mat-sys-primary-container);\n  white-space: nowrap;\n}\n\n.contributor-cell {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n// \u2500\u2500 Card view \u2500\u2500\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));\n  gap: 16px;\n  padding: 8px 0;\n}\n\n.doc-card-wrapper {\n  position: relative;\n\n  &:hover .grid-card-checkbox,\n  &--selected .grid-card-checkbox,\n  &:hover .grid-card-menu,\n  &:focus-within .grid-card-checkbox,\n  &:focus-within .grid-card-menu {\n    opacity: 1;\n    visibility: visible;\n  }\n\n  &--selected .doc-card {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.grid-card-menu {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 2;\n  opacity: 0;\n  visibility: hidden;\n  background: var(--mat-sys-surface-container-lowest, #fff);\n}\n\n.doc-card {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n  cursor: pointer;\n  transition:\n    box-shadow 0.15s,\n    border-color 0.15s;\n  padding: 0;\n  font: inherit;\n  text-align: left;\n\n  &:hover {\n    border-color: var(--mat-sys-primary);\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);\n  }\n}\n\n.grid-card-checkbox {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n}\n\n.card-thumb {\n  width: 100%;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n}\n\n.card-thumb-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.card-thumb-icon {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: #bdbdbd;\n}\n\n.card-body {\n  padding: 10px 12px;\n}\n\n.card-title {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: #333;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.card-type {\n  display: block;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #474551);\n  margin-top: 2px;\n}\n\n// \u2500\u2500 Permissions tab \u2500\u2500\n.permissions-container {\n  padding: 16px 0;\n}\n\n.perm-section {\n  margin-bottom: 28px;\n}\n\n.perm-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n\n.perm-section-title {\n  font-size: 15px;\n  font-weight: 600;\n  color: #333;\n  margin: 0;\n}\n\n.perm-action-btn {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  background: #fafafa;\n  border: 1px solid #e8e8e8;\n  border-radius: 6px;\n  padding: 12px 14px;\n  margin-bottom: 14px;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    align-self: stretch;\n    background: #e53935;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty {\n  font-size: 13px;\n  color: #999;\n  text-align: center;\n  padding: 20px 0;\n}\n\n.perm-row-actions {\n  white-space: nowrap;\n  button {\n    opacity: 0.6;\n    &:hover {\n      opacity: 1;\n    }\n  }\n}\n\n.perm-table {\n  width: 100%;\n  border-collapse: collapse;\n  background: #fff;\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  overflow: hidden;\n\n  th {\n    text-align: left;\n    padding: 10px 14px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e0e0e0;\n  }\n\n  td {\n    padding: 10px 14px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n}\n\n.perm-user {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.perm-icon {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: var(--mat-sys-primary);\n  vertical-align: middle;\n  margin-right: 4px;\n}\n\n// \u2500\u2500 History tab \u2500\u2500\n.history-container {\n  padding: 16px 0;\n}\n\n.history-filters {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 16px;\n  align-items: center;\n}\n\n.filter-field {\n  width: 160px;\n  ::ng-deep .mat-mdc-form-field-infix {\n    padding-top: 6px !important;\n    padding-bottom: 6px !important;\n    min-height: 32px !important;\n  }\n  mat-icon[matPrefix] {\n    font-size: 18px;\n    margin-right: 4px;\n    color: #888;\n  }\n}\n\n.history-empty {\n  text-align: center;\n  padding: 40px;\n  font-size: 14px;\n  color: #999;\n}\n\n.history-table-wrapper {\n  overflow: auto;\n  border-radius: 8px;\n  border: 1px solid #e0e0e0;\n}\n\n.history-table {\n  width: 100%;\n}\n\n.user-cell {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n// \u2500\u2500 Trash tab \u2500\u2500\n.trash-container {\n  padding: 16px 0;\n}\n\n.restore-btn {\n  font-size: 12px;\n}\n\n// \u2500\u2500 Responsive \u2500\u2500\n@media (max-width: 900px) {\n  .details-panel {\n    width: 280px;\n    flex: 0 0 280px;\n  }\n}\n\n@media (max-width: 600px) {\n  .browse-body {\n    flex-direction: column;\n  }\n\n  .details-panel {\n    width: 100%;\n    flex: 0 0 auto;\n    max-height: 50%;\n    border-left: none;\n    border-top: 1px solid #e0e0e0;\n  }\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BrowseComponent, { className: "BrowseComponent", filePath: "libs/features/browse/src/lib/browse/browse.ts", lineNumber: 265 }); })();
