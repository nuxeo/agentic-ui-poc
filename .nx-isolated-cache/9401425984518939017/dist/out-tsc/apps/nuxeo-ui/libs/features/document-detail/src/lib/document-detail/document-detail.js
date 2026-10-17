import { Component, DestroyRef, LOCALE_ID, inject, isDevMode, signal, computed, effect, ElementRef, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AppExtensionsService, EXTENSION_SLOTS, ExtensionActionRegistry, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, descriptorLabel, } from '@nuxeo/satori-platform/extensions';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CdkAriaLive } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowseService, DocumentDetailService, DirectoryService, formatHierarchicalL10nLabel, resolveNatureLabel, NuxeoApiBase, TaskService, WorkflowService, CURRENT_USERNAME, avatarColor, ARenderService, NUXEO_API_ORIGIN, navigableUrlOrNull, insecureAllowedForHost, originOf, TagService, ContentLakeIngestService, buildContentLakeIngestMarker, isContentLakeIngestCurrent, needsContentLakeIngest, readBlobDigest, resolveIngestMarkerWriteProperty, shouldProbeContentLakeIngestStatus, supportsContentLakeIngest, canManageDocumentPermissions, canPublishDocument, canTagDocument, canWriteDocument, canRemoveDocument, canViewDocumentAuditLog, hasDocumentPermission, WRITE_VERSION, mergeDocumentPermissionsContext, auditActivityLabel, resolveAcePrincipal, PERMISSION_DENIED_KEY, isPermissionDeniedError, isBlobHoldingDocType, isFolderishDocument, isCollectionDocument, BrowseContextService, decodeNuxeoPathSegment, noteFormatLabel, normalizeNuxeoPath, parentNuxeoFolderPath, renderNoteMarkdown, isMailSendError, mailSendFailureMessage, readClipboardDocs, writeClipboardDocs, renderTrustedHtml, toBrowseRouterUrl, trustObjectUrl, formatRelativeTime, permissionRightLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatBreadcrumbsComponent } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { AiGatewayService, AiChatService, AiFeatureFlagService, aiErrorMessage, } from '@agentic-ui/shared/ai-client';
import { KeClientService, KeEnrichmentError, } from '@agentic-ui/shared/ke-client';
import { DocumentLayoutComponent } from '@agentic-ui/shared/document-layouts';
import { KdClientService } from '@agentic-ui/shared/kd-client';
import { catchError, finalize, forkJoin, map, merge, Observable, of, switchMap, throwError, timer, } from 'rxjs';
import { ConfirmDialogComponent, DocumentViewerComponent, ExportDialogComponent, ShareDialogComponent, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { AddToCollectionDialogComponent } from '../add-to-collection-dialog/add-to-collection-dialog';
import { PublishDialogComponent } from '../publish-dialog/publish-dialog';
import { AttachmentPreviewDialogComponent } from '../attachment-preview-dialog/attachment-preview-dialog';
import { ReplaceAttachmentDialogComponent } from '../replace-attachment-dialog/replace-attachment-dialog';
import { RemoveAttachmentDialogComponent } from '../remove-attachment-dialog/remove-attachment-dialog';
import { EditDocumentDialogComponent } from '../edit-document-dialog/edit-document-dialog';
import { NoteEditorComponent } from '../note-editor/note-editor';
import { documentTypeTraits } from './document-type-traits';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { NXS_PERMISSIONS_PANEL_ID, NxsCommentExtraDirective, NxsCommentsComponent, NxsTagEditorComponent, NxsDeletePermissionDialogComponent, NxsShareExternalDialogComponent, NxsUpdatePermissionDialogComponent, NxsDetailsPanelComponent, NxsDocumentHistoryComponent, NxsDocumentToolbarComponent, NxsDriveDialogComponent, NxsManageVersionsComponent, NxsErrorStateComponent, NxsPermissionsPanelComponent, NxsPropertiesPanelComponent, NxsSpinnerComponent, NxsTabBodyDirective, NxsTabsComponent, NxsTagComponent, NxsToastService, nxsAceTimeFrame, nxsErrorStatus, nxsToggleFavorite, provideNxsToast, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/progress-spinner";
import * as i4 from "@angular/material/tooltip";
import * as i5 from "@angular/material/menu";
import * as i6 from "@angular/material/form-field";
import * as i7 from "@angular/material/select";
import * as i8 from "@hylandsoftware/satori-ui/avatar";
import * as i9 from "@hylandsoftware/satori-ui/tag";
const _c0 = ["panelToggle"];
const _c1 = ["publicationsHeading"];
const _c2 = a0 => ({ version: a0 });
const _c3 = a0 => ({ workflow: a0 });
const _c4 = a0 => ({ due: a0 });
const _c5 = (a0, a1) => ({ documentId: a0, permissionsChanged: a1 });
const _c6 = a0 => ({ $implicit: a0, depth: 0 });
const _c7 = a0 => ({ name: a0 });
const _c8 = (a0, a1) => ({ $implicit: a0, depth: a1 });
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.name;
const _forTrack2 = ($index, $item) => $item.uid;
const _forTrack3 = ($index, $item) => $item.doc.uid;
const _forTrack4 = ($index, $item) => $item.label;
const _forTrack5 = ($index, $item) => $item.index;
function DocumentDetailComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵelement(1, "nxs-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 15)(1, "button", 17);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_1_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.goBack()); });
    i0.ɵɵelementStart(2, "mat-icon", 18);
    i0.ɵɵtext(3, "arrow_back");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", ctx_r1.errorStatus())("heading", ctx)("headingLevel", 1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "document-detail.document-detail.go-back-2"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 40);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "sell");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 40);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "category");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 40);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "short_text");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 26)(1, "button", 39);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_10_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runTextEntityExtraction()); });
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_2_Template, 2, 0, "mat-icon", 40)(3, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_3_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 39);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_10_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runTextClassification()); });
    i0.ɵɵconditionalCreate(7, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_7_Template, 2, 0, "mat-icon", 40)(8, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_8_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 39);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_10_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runTextSummarization()); });
    i0.ɵɵconditionalCreate(12, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_12_Template, 2, 0, "mat-icon", 40)(13, DocumentDetailComponent_Conditional_2_Conditional_10_Conditional_13_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.keActionInFlight() !== null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isKeActionRunning("named-entity-recognition-text") ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 9, "document-detail.document-detail.extract-named-entities-text"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.keActionInFlight() !== null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isKeActionRunning("text-classification") ? 7 : 8);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 11, "document-detail.document-detail.classify-document"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.keActionInFlight() !== null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isKeActionRunning("text-summarization") ? 12 : 13);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 13, "document-detail.document-detail.summarize-document"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 40);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "image_search");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 26)(1, "button", 39);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_11_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runImageEnrichment()); });
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_11_Conditional_2_Template, 2, 0, "mat-icon", 40)(3, DocumentDetailComponent_Conditional_2_Conditional_11_Conditional_3_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.keActionInFlight() !== null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isKeActionRunning("image-enrichment") ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 3, "document-detail.document-detail.describe-image"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 41);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelement(5, "mat-spinner", 44);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("matTooltip", ctx_r1.contentLakeIngestInFlight() ? i0.ɵɵpipeBind1(1, 3, "document-detail.ingesting-into-content-lake") : i0.ɵɵpipeBind1(2, 5, "document-detail.checking-content-lake-status"));
    i0.ɵɵattribute("aria-label", ctx_r1.contentLakeIngestInFlight() ? i0.ɵɵpipeBind1(3, 7, "document-detail.ingesting-into-content-lake") : i0.ɵɵpipeBind1(4, 9, "document-detail.checking-content-lake-status"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 11, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 42);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "button", 45);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cloud_done");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 3, "document-detail.document-detail.indexed-in-content-lake"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 5, "document-detail.document-detail.already-in-content-lake"));
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 7, "document-detail.document-detail.already-ingested-to-content-lake"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.ingestToContentLake()); });
    i0.ɵɵelementStart(2, "span", 47);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "mat-icon", 18);
    i0.ɵɵtext(6, "cloud_upload");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 3, "document-detail.document-detail.ingest-to-content-lake"))("disabled", ctx_r1.keActionInFlight() !== null);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "document-detail.document-detail.ingest-to-content-lake"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_0_Template, 7, 13, "span", 41)(1, DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_1_Template, 7, 9, "span", 42)(2, DocumentDetailComponent_Conditional_2_Conditional_12_Conditional_2_Template, 7, 7, "button", 43);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.contentLakeIngestInFlight() || ctx_r1.contentLakePresenceChecking() ? 0 : ctx_r1.showsContentLakeIngested() ? 1 : 2);
} }
function DocumentDetailComponent_Conditional_2_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48)(1, "mat-icon");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("ke-status-banner--error", ctx_r1.keError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.keError() ? "error_outline" : "auto_awesome");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.keError() || ctx_r1.keStatus());
} }
function DocumentDetailComponent_Conditional_2_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48)(1, "mat-icon");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("ke-status-banner--error", ctx_r1.contentLakeIngestError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.contentLakeIngestError() ? "error_outline" : "cloud_upload");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.contentLakeIngestError() || ctx_r1.contentLakeIngestStatus());
} }
function DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 54);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.restoreFromTrash()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "restore_from_trash");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "restore");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "document-detail.document-detail.restore"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 55);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.permanentlyDelete()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "delete_forever");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "permanentDelete");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "document-detail.document-detail.delete-permanently"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 28)(1, "mat-icon", 49);
    i0.ɵɵtext(2, "info");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 50);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(6, "span", 51);
    i0.ɵɵconditionalCreate(7, DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_7_Template, 5, 4, "button", 52);
    i0.ɵɵconditionalCreate(8, DocumentDetailComponent_Conditional_2_Conditional_15_Conditional_8_Template, 5, 4, "button", 53);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 3, "document-detail.document-detail.you-are-viewing-a-trashed-document"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.canWriteDoc() ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canRemoveDoc() ? 8 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_16_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 60);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_16_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.confirmRestoreVersion()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "restore");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "restore");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(4, 2, "document-detail.version-restore", i0.ɵɵpureFunction1(5, _c2, ctx_r1.versionLabel())), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 29)(1, "mat-icon", 56);
    i0.ɵɵtext(2, "info");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 57);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 58);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_16_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.showLatestVersion()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, DocumentDetailComponent_Conditional_2_Conditional_16_Conditional_9_Template, 5, 7, "button", 59);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(5, 3, "document-detail.version-viewing", i0.ɵɵpureFunction1(8, _c2, ctx_r1.versionLabel())));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 6, "document-detail.version-go-to-latest"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canRestoreVersion() ? 9 : -1);
} }
function DocumentDetailComponent_Conditional_2_For_18_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 30)(1, "mat-icon", 61);
    i0.ɵɵtext(2, "warning");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 62);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(6, "span", 63);
    i0.ɵɵelementStart(7, "button", 64);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_For_18_Template_button_click_7_listener() { const wf_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.abandonWorkflow(wf_r12)); });
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const wf_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(5, 3, "document-detail.workflow-started-on-document", i0.ɵɵpureFunction1(8, _c3, ctx_r1.workflowDisplayName(wf_r12))), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r1.abandoningWorkflow());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 6, "document-detail.document-detail.abandon"), " ");
} }
function DocumentDetailComponent_Conditional_2_For_20_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const task_r14 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "document-detail.task-due-before", i0.ɵɵpureFunction1(4, _c4, ctx_r1.taskDueLabel(task_r14))), " ");
} }
function DocumentDetailComponent_Conditional_2_For_20_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 31)(1, "mat-icon", 65);
    i0.ɵɵtext(2, "check_box");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 66);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵconditionalCreate(6, DocumentDetailComponent_Conditional_2_For_20_Conditional_6_Template, 2, 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "span", 67);
    i0.ɵɵelementStart(8, "button", 68);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_For_20_Template_button_click_8_listener() { const task_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.goToTask(task_r14)); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const task_r14 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 3, "document-detail.document-detail.you-have-a-task-to-process"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.taskDueLabel(task_r14) ? 6 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 5, "document-detail.document-detail.process"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 72);
    i0.ɵɵelement(1, "mat-spinner", 74);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 73);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.no-workflow-models-available"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 78);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const wf_r17 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", wf_r17.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.workflowDisplayName(wf_r17));
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 81);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 75)(1, "mat-label", 76);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-select", 77);
    i0.ɵɵlistener("selectionChange", function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Template_mat_select_selectionChange_4_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.selectedWorkflowModel.set($event.value)); });
    i0.ɵɵrepeaterCreate(5, DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_For_6_Template, 2, 2, "mat-option", 78, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 79)(8, "button", 80);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r16); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.startProcess()); });
    i0.ɵɵconditionalCreate(9, DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Conditional_9_Template, 2, 3, "mat-spinner", 81);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "document-detail.document-detail.choose-process"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.selectedWorkflowModel());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.availableWorkflows());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", !ctx_r1.selectedWorkflowModel() || ctx_r1.startingWorkflow());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.startingWorkflow() ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 7, "document-detail.document-detail.start"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 69);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_21_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r15); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeStartProcess()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 70)(3, "div", 71);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_6_Template, 3, 3, "div", 72)(7, DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_7_Template, 3, 3, "p", 73)(8, DocumentDetailComponent_Conditional_2_Conditional_21_Conditional_8_Template, 12, 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "document-detail.document-detail.close-start-process-dialog"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 5, "document-detail.document-detail.start-process"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.workflowsLoading() ? 6 : ctx_r1.availableWorkflows().length === 0 ? 7 : 8);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const viewTabContent_r18 = i0.ɵɵreference(28);
    i0.ɵɵproperty("ngTemplateOutlet", viewTabContent_r18);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const annotationsTabContent_r19 = i0.ɵɵreference(32);
    i0.ɵɵproperty("ngTemplateOutlet", annotationsTabContent_r19);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const permissionsTabContent_r20 = i0.ɵɵreference(34);
    i0.ɵɵproperty("ngTemplateOutlet", permissionsTabContent_r20);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const historyTabContent_r21 = i0.ɵɵreference(36);
    i0.ɵɵproperty("ngTemplateOutlet", historyTabContent_r21);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const publishingTabContent_r22 = i0.ɵɵreference(38);
    i0.ɵɵproperty("ngTemplateOutlet", publishingTabContent_r22);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const aiInsightsTabContent_r23 = i0.ɵɵreference(40);
    i0.ɵɵproperty("ngTemplateOutlet", aiInsightsTabContent_r23);
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 83);
} if (rf & 2) {
    const tab_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("componentId", ctx_r1.tabComponentId(tab_r24.id));
} }
function DocumentDetailComponent_Conditional_2_ng_template_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_ng_template_26_Case_0_Template, 1, 1, "ng-container", 82)(1, DocumentDetailComponent_Conditional_2_ng_template_26_Case_1_Template, 1, 1, "ng-container", 82)(2, DocumentDetailComponent_Conditional_2_ng_template_26_Case_2_Template, 1, 1, "ng-container", 82)(3, DocumentDetailComponent_Conditional_2_ng_template_26_Case_3_Template, 1, 1, "ng-container", 82)(4, DocumentDetailComponent_Conditional_2_ng_template_26_Case_4_Template, 1, 1, "ng-container", 82)(5, DocumentDetailComponent_Conditional_2_ng_template_26_Case_5_Template, 1, 1, "ng-container", 82)(6, DocumentDetailComponent_Conditional_2_ng_template_26_Case_6_Template, 1, 1, "lib-extension-outlet", 83);
} if (rf & 2) {
    let tmp_12_0;
    const tab_r24 = ctx.$implicit;
    i0.ɵɵconditional((tmp_12_0 = tab_r24.id) === "app.tabs.view" ? 0 : tmp_12_0 === "app.tabs.annotations" ? 1 : tmp_12_0 === "app.tabs.permissions" ? 2 : tmp_12_0 === "app.tabs.history" ? 3 : tmp_12_0 === "app.tabs.publishing" ? 4 : tmp_12_0 === "app.tabs.aiInsights" ? 5 : 6);
} }
function DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(3);
    const packagedViewContent_r25 = i0.ɵɵreference(30);
    i0.ɵɵproperty("ngTemplateOutlet", packagedViewContent_r25);
} }
function DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 84, 9);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_0_Conditional_2_Template, 1, 1, "ng-container", 82);
} if (rf & 2) {
    const view_r26 = ctx;
    const documentViewOutlet_r27 = i0.ɵɵreference(1);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("document-view-outlet--unresolved", documentViewOutlet_r27.unresolved());
    i0.ɵɵproperty("componentId", view_r26.componentId ?? view_r26.id)("componentInputs", ctx_r1.documentViewInputs());
    i0.ɵɵattribute("data-document-view-id", view_r26.id);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(documentViewOutlet_r27.unresolved() ? 2 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 82);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const packagedViewContent_r25 = i0.ɵɵreference(30);
    i0.ɵɵproperty("ngTemplateOutlet", packagedViewContent_r25);
} }
function DocumentDetailComponent_Conditional_2_ng_template_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_0_Template, 3, 6)(1, DocumentDetailComponent_Conditional_2_ng_template_27_Conditional_1_Template, 1, 1, "ng-container", 82);
} if (rf & 2) {
    let tmp_11_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_11_0 = ctx_r1.documentView()) ? 0 : 1, tmp_11_0);
} }
function DocumentDetailComponent_Conditional_2_ng_template_29_Case_0_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-note-editor", 87);
    i0.ɵɵlistener("saveNote", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_0_Template_lib_note_editor_saveNote_0_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.saveNote($event)); })("focused", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_0_Template_lib_note_editor_focused_0_listener() { i0.ɵɵrestoreView(_r28); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.focusNoteEditor.set(false)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("content", ctx_r1.noteEditorBody())("mimeType", ctx_r1.mimeType())("uploadParentPath", ctx_r1.noteImageUploadParentPath())("loading", ctx_r1.viewerLoading())("saving", ctx_r1.noteSaving())("autoFocus", ctx_r1.focusNoteEditor())("readOnly", !ctx_r1.canWriteDoc());
} }
function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-document-viewer", 88);
    i0.ɵɵlistener("downloadClicked", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_downloadClicked_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.download()); })("previewClicked", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_previewClicked_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.previewMainBlob()); })("openWithDriveClicked", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_openWithDriveClicked_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openDriveDialog()); })("formatDownload", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_formatDownload_0_listener($event) { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.downloadPictureFormat($event)); })("replaceMainFileClicked", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_replaceMainFileClicked_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openReplaceMainFileDialog()); })("removeMainFileClicked", function DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template_lib_document_viewer_removeMainFileClicked_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openRemoveMainFileDialog()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_33_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("blobUrl", ctx_r1.blobUrl())("rawBlobUrl", ctx_r1.rawBlobUrl())("blobType", ctx_r1.mainBlobType())("mimeType", ctx_r1.mimeType())("fileName", ctx_r1.fileName())("fileSize", ctx_r1.fileSize())("loading", ctx_r1.viewerLoading())("noteContent", ctx_r1.noteContent())("noteHtml", ctx_r1.noteHtml())("videoSources", ctx_r1.videoSources())("storyboard", ctx_r1.storyboard())("posterUrl", ctx_r1.posterUrl())("hasPdfRendition", ctx_r1.hasPdfRendition())("previewUrl", ctx_r1.previewUrl())("pictureInfo", ctx_r1.pictureInfo())("pictureViews", ctx_r1.pictureViews())("exifData", ctx_r1.exifData())("iptcData", ctx_r1.iptcData())("videoInfo", ctx_r1.videoInfo())("arenderUrl", ctx_r1.arenderUrl())("arenderReloadId", ctx_r1.arenderReloadId())("viewerDocUid", ((tmp_33_0 = ctx_r1.doc()) == null ? null : tmp_33_0.uid) ?? "")("annotationsTab", false)("showMainFileControls", !!ctx_r1.fileName() && ctx_r1.canWriteDoc() && !ctx_r1.isTrashed())("mainFileActionInProgress", ctx_r1.actionInProgress());
} }
function DocumentDetailComponent_Conditional_2_ng_template_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_ng_template_29_Case_0_Template, 1, 7, "lib-note-editor", 85)(1, DocumentDetailComponent_Conditional_2_ng_template_29_Case_1_Template, 1, 25, "lib-document-viewer", 86);
} if (rf & 2) {
    let tmp_11_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_11_0 = ctx_r1.packagedDocumentView()) === "noteEditor" ? 0 : 1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_31_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-document-viewer", 88);
    i0.ɵɵlistener("downloadClicked", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_downloadClicked_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.download()); })("previewClicked", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_previewClicked_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.previewMainBlob()); })("openWithDriveClicked", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_openWithDriveClicked_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openDriveDialog()); })("formatDownload", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_formatDownload_0_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.downloadPictureFormat($event)); })("replaceMainFileClicked", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_replaceMainFileClicked_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openReplaceMainFileDialog()); })("removeMainFileClicked", function DocumentDetailComponent_Conditional_2_ng_template_31_Template_lib_document_viewer_removeMainFileClicked_0_listener() { i0.ɵɵrestoreView(_r30); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openRemoveMainFileDialog()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_32_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("blobUrl", ctx_r1.blobUrl())("rawBlobUrl", ctx_r1.rawBlobUrl())("blobType", ctx_r1.mainBlobType())("mimeType", ctx_r1.mimeType())("fileName", ctx_r1.fileName())("fileSize", ctx_r1.fileSize())("loading", ctx_r1.viewerLoading())("noteContent", ctx_r1.noteContent())("noteHtml", ctx_r1.noteHtml())("videoSources", ctx_r1.videoSources())("storyboard", ctx_r1.storyboard())("posterUrl", ctx_r1.posterUrl())("hasPdfRendition", ctx_r1.hasPdfRendition())("previewUrl", ctx_r1.previewUrl())("pictureInfo", ctx_r1.pictureInfo())("pictureViews", ctx_r1.pictureViews())("exifData", ctx_r1.exifData())("iptcData", ctx_r1.iptcData())("videoInfo", ctx_r1.videoInfo())("arenderUrl", ctx_r1.arenderUrl())("arenderReloadId", ctx_r1.arenderReloadId())("viewerDocUid", ((tmp_32_0 = ctx_r1.doc()) == null ? null : tmp_32_0.uid) ?? "")("annotationsTab", true)("showMainFileControls", !ctx_r1.isNoteDocument() && !!ctx_r1.fileName() && ctx_r1.canWriteDoc() && !ctx_r1.isTrashed())("mainFileActionInProgress", ctx_r1.actionInProgress());
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-permissions-panel", 93);
} if (rf & 2) {
    const current_r31 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("documentId", current_r31.uid)("permissionsChanged", ctx_r1.onPermissionsChanged);
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 92, 10);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_1_Conditional_2_Template, 1, 2, "nxs-permissions-panel", 93);
} if (rf & 2) {
    const permissionsPanelOutlet_r32 = i0.ɵɵreference(1);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("componentId", ctx_r1.permissionsPanelId)("componentInputs", i0.ɵɵpureFunction2(3, _c5, ctx.uid, ctx_r1.onPermissionsChanged));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(permissionsPanelOutlet_r32.unresolved() ? 2 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 90);
    i0.ɵɵelement(1, "nxs-spinner", 94);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 102);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openExternalPermissionDialog()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.new"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 100);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.the-document-is-not-shared-with"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "th");
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 104)(1, "button", 105);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Conditional_9_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r34); const ace_r35 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.editExternalPermission(ace_r35)); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 106);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Conditional_9_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r34); const ace_r35 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.sendPermissionNotification(ace_r35)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "send");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 105);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Conditional_9_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r34); const ace_r35 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.deletePermission(ace_r35)); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "delete");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ace_r35 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 7, "document-detail.document-detail.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 9, "document-detail.document-detail.edit-permission"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 11, "document-detail.document-detail.send-notification-email"))("disabled", ctx_r1.actionInProgress() === "notify-" + ace_r35.id);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 13, "document-detail.document-detail.send-notification"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(12, 15, "document-detail.document-detail.delete"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 17, "document-detail.document-detail.delete-permission"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Template(rf, ctx) { if (rf & 1) {
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
    i0.ɵɵconditionalCreate(9, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Conditional_9_Template, 16, 19, "td", 104);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ace_r35 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.displayUsername(ace_r35));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.permissionLabel(ace_r35.permission));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.aceTimeFrame(ace_r35));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.aceGrantedBy(ace_r35));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canManagePermissions() ? 9 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 101)(1, "table", 103)(2, "thead")(3, "tr")(4, "th");
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
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_Conditional_16_Template, 1, 0, "th");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "tbody");
    i0.ɵɵrepeaterCreate(18, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_For_19_Template, 10, 5, "tr", null, _forTrack0);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 5, "document-detail.document-detail.user"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 7, "document-detail.document-detail.right"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 9, "document-detail.document-detail.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 11, "document-detail.document-detail.granted-by"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canManagePermissions() ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.externalAces());
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 91)(1, "div", 95)(2, "div", 96);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_5_Template, 3, 3, "button", 97);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 98);
    i0.ɵɵelement(7, "span", 99);
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_11_Template, 3, 3, "div", 100)(12, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Conditional_12_Template, 20, 13, "div", 101);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "document-detail.document-detail.permissions-assigned-to-external-users"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canManagePermissions() ? 5 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 6, "document-detail.document-detail.sharing-to-external-users-does-not"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.externalAces().length === 0 ? 11 : 12);
} }
function DocumentDetailComponent_Conditional_2_ng_template_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 89);
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_1_Template, 3, 6);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_2_Template, 3, 3, "div", 90);
    i0.ɵɵconditionalCreate(3, DocumentDetailComponent_Conditional_2_ng_template_33_Conditional_3_Template, 13, 8, "section", 91);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_11_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_11_0 = ctx_r1.doc()) ? 1 : -1, tmp_11_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionsLoading() ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.showExternalShares() ? 3 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_35_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-document-history", 107);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("documentUid", ctx_r1.doc().uid);
} }
function DocumentDetailComponent_Conditional_2_ng_template_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_ng_template_35_Conditional_0_Template, 1, 1, "nxs-document-history", 107);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.historyShown() ? 0 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 117);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.document-detail.unpublish-all"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r36 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 116);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r36); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.unpublishAll()); });
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Conditional_1_Template, 2, 3, "mat-spinner", 117)(2, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Conditional_2_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "unpublish-all");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.actionInProgress() === "unpublish-all" ? 1 : 2);
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 113);
    i0.ɵɵelement(1, "mat-spinner", 44);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 114)(1, "mat-icon");
    i0.ɵɵtext(2, "cloud_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "document-detail.document-detail.this-document-has-not-been-published"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r37 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 128);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_22_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r37); const pub_r38 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.unpublishDocument(pub_r38)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "unpublish");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "document-detail.document-detail.unpublish"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r39 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 129);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_23_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r39); const pub_r38 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.republishDocument(pub_r38)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r1.actionInProgress() === "republish");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "document-detail.document-detail.republish"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "div", 119)(3, "mat-icon", 120);
    i0.ɵɵtext(4, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 121);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "td")(8, "sat-status-tag", 122);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "td");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td")(13, "div", 123)(14, "span", 124);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "td");
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "td", 125);
    i0.ɵɵconditionalCreate(22, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_22_Template, 3, 4, "button", 126);
    i0.ɵɵconditionalCreate(23, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Conditional_23_Template, 3, 4, "button", 127);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const pub_r38 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r1.publishedPath(pub_r38));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("hideIcon", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.publishedVersion(pub_r38));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.publishedRendition(pub_r38));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.publishedBy(pub_r38).charAt(0).toUpperCase());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.publishedBy(pub_r38));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(20, 9, ctx_r1.publishedDate(pub_r38), "longDate"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.canUnpublish(pub_r38) ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canRepublish(pub_r38) ? 23 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 115)(1, "thead")(2, "tr")(3, "th");
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
    i0.ɵɵelementStart(15, "th");
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(18, "th", 118);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "tbody");
    i0.ɵɵrepeaterCreate(20, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_For_21_Template, 24, 12, "tr", null, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "document-detail.document-detail.path"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "document-detail.document-detail.version"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 9, "document-detail.document-detail.rendition"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 11, "document-detail.document-detail.publisher"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 13, "document-detail.document-detail.publish-date"));
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.publishedDocs());
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 132);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "publish");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "document-detail.document-detail.publish"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 113);
    i0.ɵɵelement(1, "mat-spinner", 44);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 114)(1, "mat-icon");
    i0.ɵɵtext(2, "folder_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "document-detail.document-detail.no-sections-available-for-publishing"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_For_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_For_2_ng_container_0_Template, 1, 0, "ng-container", 136);
} if (rf & 2) {
    const node_r41 = ctx.$implicit;
    i0.ɵɵnextContext(5);
    const sectionNodeTpl_r42 = i0.ɵɵreference(4);
    i0.ɵɵproperty("ngTemplateOutlet", sectionNodeTpl_r42)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c6, node_r41));
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 135);
    i0.ɵɵrepeaterCreate(1, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_For_2_Template, 1, 4, "ng-container", null, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.sectionTree());
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r40 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 109)(1, "div", 110)(2, "div", 130);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 131);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r40); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.publishToSection()); });
    i0.ɵɵconditionalCreate(6, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_6_Template, 2, 3, "mat-spinner", 132)(7, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_7_Template, 5, 3, "ng-container");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 133);
    i0.ɵɵelement(9, "span", 134);
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(13, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_13_Template, 3, 3, "div", 113)(14, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_14_Template, 6, 3, "div", 114)(15, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Conditional_15_Template, 3, 0, "div", 135);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 5, "document-detail.document-detail.publish-to-a-section"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.selectedSectionId() || ctx_r1.publishing());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.publishing() ? 6 : 7);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 7, "document-detail.document-detail.select-a-section-below-to-publish"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.sectionsLoading() ? 13 : ctx_r1.sectionTree().length === 0 ? 14 : 15);
} }
function DocumentDetailComponent_Conditional_2_ng_template_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 108)(1, "section", 109)(2, "div", 110)(3, "div", 111, 11);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_7_Template, 3, 2, "button", 112);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_8_Template, 3, 3, "div", 113)(9, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_9_Template, 6, 3, "div", 114)(10, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_10_Template, 22, 15, "table", 115);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, DocumentDetailComponent_Conditional_2_ng_template_37_Conditional_11_Template, 16, 9, "section", 109);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "document-detail.document-detail.publication-details"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.publishedDocs().length > 0 ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.publishLoading() ? 8 : ctx_r1.publishedDocs().length === 0 ? 9 : 10);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.canPublish() ? 11 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 148);
    i0.ɵɵelement(1, "mat-spinner", 117);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r44 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 166);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r44); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.generateSummary()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.aiSummary() ? i0.ɵɵpipeBind1(4, 1, "document-detail.regenerate") : i0.ɵɵpipeBind1(5, 3, "document-detail.generate"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 152);
    i0.ɵɵelement(1, "div", 167)(2, "div", 167)(3, "div", 168)(4, "div", 169);
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Conditional_3_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const point_r45 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(point_r45);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 171)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul");
    i0.ɵɵrepeaterCreate(5, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Conditional_3_For_6_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "document-detail.document-detail.key-points"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.aiSummary().keyPoints);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 153)(1, "p", 170);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Conditional_3_Template, 7, 3, "div", 171);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.aiSummary().summary);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.aiSummary().keyPoints.length ? 3 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 154)(1, "p");
    i0.ɵɵtext(2, " \"Summary will appear here after generation. The model will analyze semantic structure and key thematic elements...\" ");
    i0.ɵɵelementEnd()();
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 152);
    i0.ɵɵelement(1, "div", 168)(2, "div", 169);
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_45_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r46 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 173);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_45_For_2_Template_button_click_0_listener() { const tag_r47 = i0.ɵɵrestoreView(_r46).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.applyAiTag(tag_r47.label)); });
    i0.ɵɵelementStart(2, "span", 174);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 175);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-icon", 176);
    i0.ɵɵtext(7, "add_circle_outline");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const tag_r47 = ctx.$implicit;
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 3, "shared.add-tag", i0.ɵɵpureFunction1(6, _c7, tag_r47.label)));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(tag_r47.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", (tag_r47.confidence * 100).toFixed(0), "%");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 156);
    i0.ɵɵrepeaterCreate(1, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_45_For_2_Template, 8, 8, "button", 172, _forTrack4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.aiSuggestedTags());
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 158);
    i0.ɵɵelement(1, "mat-spinner", 117);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "document-detail.document-detail.loading"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "document-detail.document-detail.suggest-tags"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r48 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 177);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_48_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r48); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.suggestTags()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "document-detail.document-detail.suggest-tags"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_61_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 152);
    i0.ɵɵelement(1, "div", 167)(2, "div", 167)(3, "div", 168);
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_62_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 178)(1, "span", 179);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 180)(5, "sat-status-tag", 182);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "document-detail.document-detail.workflow"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("hideIcon", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.aiClassification().suggestedWorkflow);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 160)(1, "div", 178)(2, "span", 179);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 180);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 178)(8, "span", 179);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "sat-category-tag", 181);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 178)(14, "span", 179);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span", 180);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(19, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_62_Conditional_19_Template, 7, 5, "div", 178);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, "document-detail.document-detail.description"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.aiClassification().description);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 9, "document-detail.document-detail.primary-category"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.aiClassification().nature);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 11, "document-detail.document-detail.subjects"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.aiClassification().subjects.join(", "));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.aiClassification().suggestedWorkflow !== "none" ? 19 : -1);
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 160)(1, "div", 178)(2, "span", 179);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 183);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 178)(9, "span", 179);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span", 183);
    i0.ɵɵtext(13, "\u2014");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 3, "document-detail.document-detail.primary-category"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(7, 5, "document-detail.document-detail.unclassified"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 7, "document-detail.document-detail.complexity-level"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 161);
    i0.ɵɵelement(1, "mat-spinner", 117);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "document-detail.document-detail.loading"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "document-detail.document-detail.classify"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_66_Template(rf, ctx) { if (rf & 1) {
    const _r49 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 184);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_66_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r49); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.classifyDocument()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "tune");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "document-detail.document-detail.classify"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 163)(1, "div", 185);
    i0.ɵɵelement(2, "mat-spinner", 186);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 185);
    i0.ɵɵelement(8, "mat-spinner", 186);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 4, "document-detail.document-detail.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "document-detail.document-detail.scanning-archive"));
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 8, "document-detail.document-detail.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 10, "document-detail.document-detail.scanning-archive"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_80_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r50 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 188);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_80_For_2_Template_button_click_0_listener() { const simDoc_r51 = i0.ɵɵrestoreView(_r50).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.navigateToDoc(simDoc_r51.uid)); });
    i0.ɵɵelementStart(1, "mat-icon", 189);
    i0.ɵɵtext(2, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 190)(4, "span", 191);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 192);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span", 193);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const simDoc_r51 = ctx.$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(simDoc_r51.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(simDoc_r51.path);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", (simDoc_r51.score * 100).toFixed(0), "%");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_80_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 164);
    i0.ɵɵrepeaterCreate(1, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_80_For_2_Template, 10, 3, "button", 187, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.aiSimilarDocs());
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 163)(1, "div", 194)(2, "mat-icon", 195);
    i0.ɵɵtext(3, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 194)(8, "mat-icon", 195);
    i0.ɵɵtext(9, "description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, "document-detail.document-detail.document-preview"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 4, "document-detail.document-detail.document-preview"));
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 158);
    i0.ɵɵelement(1, "mat-spinner", 117);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "document-detail.document-detail.loading"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 4, "document-detail.document-detail.find-connections"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_84_Template(rf, ctx) { if (rf & 1) {
    const _r52 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 177);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_84_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r52); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.findSimilar()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "search");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "document-detail.document-detail.find-connections"), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 165)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.aiError(), " ");
} }
function DocumentDetailComponent_Conditional_2_ng_template_39_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 137)(1, "div", 138)(2, "div", 139)(3, "div", 140);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 141);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 142);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_ng_template_39_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r43); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openAiAssistant()); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 143)(15, "section", 144)(16, "div", 145)(17, "span", 146)(18, "mat-icon");
    i0.ɵɵtext(19, "auto_awesome");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 147);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_23_Template, 3, 3, "button", 148)(24, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_24_Template, 6, 5, "button", 149);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "p", 150);
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "div", 151);
    i0.ɵɵconditionalCreate(29, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_29_Template, 5, 0, "div", 152)(30, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_30_Template, 4, 2, "div", 153)(31, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_31_Template, 3, 0, "div", 154);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(32, "section", 144)(33, "div", 145)(34, "span", 155)(35, "mat-icon");
    i0.ɵɵtext(36, "sell");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 147);
    i0.ɵɵtext(38);
    i0.ɵɵpipe(39, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "p", 150);
    i0.ɵɵtext(41);
    i0.ɵɵpipe(42, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "div", 151);
    i0.ɵɵconditionalCreate(44, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_44_Template, 3, 0, "div", 152)(45, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_45_Template, 3, 0, "div", 156);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "div", 157);
    i0.ɵɵconditionalCreate(47, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_47_Template, 5, 6, "button", 158)(48, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_48_Template, 5, 3, "button", 159);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "section", 144)(50, "div", 145)(51, "span", 146)(52, "mat-icon");
    i0.ɵɵtext(53, "tune");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(54, "div", 147);
    i0.ɵɵtext(55);
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "p", 150);
    i0.ɵɵtext(58);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "div", 151);
    i0.ɵɵconditionalCreate(61, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_61_Template, 4, 0, "div", 152)(62, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_62_Template, 20, 13, "div", 160)(63, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_63_Template, 14, 9, "div", 160);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(64, "div", 157);
    i0.ɵɵconditionalCreate(65, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_65_Template, 5, 6, "button", 161)(66, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_66_Template, 5, 3, "button", 162);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(67, "section", 144)(68, "div", 145)(69, "span", 155)(70, "mat-icon");
    i0.ɵɵtext(71, "hub");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(72, "div", 147);
    i0.ɵɵtext(73);
    i0.ɵɵpipe(74, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(75, "p", 150);
    i0.ɵɵtext(76);
    i0.ɵɵpipe(77, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(78, "div", 151);
    i0.ɵɵconditionalCreate(79, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_79_Template, 13, 12, "div", 163)(80, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_80_Template, 3, 0, "div", 164)(81, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_81_Template, 13, 6, "div", 163);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(82, "div", 157);
    i0.ɵɵconditionalCreate(83, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_83_Template, 5, 6, "button", 158)(84, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_84_Template, 5, 3, "button", 159);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(85, DocumentDetailComponent_Conditional_2_ng_template_39_Conditional_85_Template, 4, 1, "div", 165);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 20, "document-detail.document-detail.ai-insights"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 22, "document-detail.document-detail.augment-your-editorial-workflow-with-cognitive"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 24, "document-detail.document-detail.ai-assistant"), " ");
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 26, "document-detail.document-detail.document-summary"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiSummaryLoading() ? 23 : 24);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(27, 28, "document-detail.document-detail.utilize-large-language-models-to-distill"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiSummaryLoading() ? 29 : ctx_r1.aiSummary() ? 30 : 31);
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 30, "document-detail.document-detail.suggested-tags"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(42, 32, "document-detail.document-detail.automatic-taxonomy-mapping-based-on-entity"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiTagsLoading() ? 44 : ctx_r1.aiSuggestedTags().length ? 45 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiTagsLoading() ? 47 : 48);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(56, 34, "document-detail.document-detail.classification-amp-metadata"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(59, 36, "document-detail.document-detail.categorize-content-into-predefined-editorial-verticals"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiClassifyLoading() ? 61 : ctx_r1.aiClassification() ? 62 : 63);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.aiClassifyLoading() ? 65 : 66);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(74, 38, "document-detail.document-detail.related-documents"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(77, 40, "document-detail.document-detail.discover-documents-within-the-archive-that"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiSimilarLoading() ? 79 : ctx_r1.aiSimilarDocs().length ? 80 : 81);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.aiSimilarLoading() ? 83 : 84);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiError() ? 85 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-tag", 207);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("label", ctx_r1.versionLabel());
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r55 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-manage-versions", 209);
    i0.ɵɵlistener("versionSelected", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_1_Template_nxs_manage_versions_versionSelected_0_listener($event) { i0.ɵɵrestoreView(_r55); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.openVersion($event)); })("latestSelected", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_1_Template_nxs_manage_versions_latestSelected_0_listener() { i0.ɵɵrestoreView(_r55); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.showLatestVersion()); })("versionCreated", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_1_Template_nxs_manage_versions_versionCreated_0_listener() { i0.ɵɵrestoreView(_r55); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.onVersionCreated()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const versioned_r56 = i0.ɵɵnextContext();
    i0.ɵɵproperty("document", versioned_r56);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_0_Template, 1, 1, "nxs-tag", 207)(1, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Conditional_1_Template, 1, 1, "nxs-manage-versions", 208);
} if (rf & 2) {
    i0.ɵɵconditional(ctx.isProxy ? 0 : 1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r57 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-tag-editor", 210);
    i0.ɵɵlistener("tagsChange", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_2_Template_nxs_tag_editor_tagsChange_0_listener($event) { i0.ɵɵrestoreView(_r57); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.setTags($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("documentUid", ctx.uid)("tags", ctx_r1.tags())("readOnly", !ctx_r1.canTag());
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 205);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.there-are-no-attachments"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r60 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 217);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "mat-menu", null, 12)(7, "button", 218);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Conditional_22_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r60); const att_r59 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.openReplaceDialog(att_r59)); });
    i0.ɵɵelementStart(8, "mat-icon");
    i0.ɵɵtext(9, "find_replace");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "button", 218);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Conditional_22_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r60); const att_r59 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.openRemoveDialog(att_r59)); });
    i0.ɵɵelementStart(14, "mat-icon");
    i0.ɵɵtext(15, "cancel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const attMenu_r61 = i0.ɵɵreference(6);
    i0.ɵɵproperty("matMenuTriggerFor", attMenu_r61)("matTooltip", i0.ɵɵpipeBind1(1, 5, "document-detail.document-detail.more"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 7, "document-detail.document-detail.more-actions"));
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 9, "document-detail.document-detail.replace"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 11, "document-detail.document-detail.remove"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r58 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 211)(1, "div", 212)(2, "span", 213);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 214);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 215)(7, "button", 216);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r58); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.openDriveDialog()); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11, "open_in_new");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 216);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Template_button_click_12_listener() { const att_r59 = i0.ɵɵrestoreView(_r58).$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.previewAttachment(att_r59)); });
    i0.ɵɵelementStart(15, "mat-icon");
    i0.ɵɵtext(16, "visibility");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "button", 216);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Template_button_click_17_listener() { const att_r59 = i0.ɵɵrestoreView(_r58).$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.downloadAttachment(att_r59.url, att_r59.name)); });
    i0.ɵɵelementStart(20, "mat-icon");
    i0.ɵɵtext(21, "download");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(22, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Conditional_22_Template, 19, 13);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const att_r59 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(att_r59.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatBytes(att_r59.size));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(8, 9, "document-detail.document-detail.open-in-nuxeo-drive"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 11, "document-detail.document-detail.open-in-nuxeo-drive"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(13, 13, "document-detail.document-detail.preview"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 15, "document-detail.document-detail.preview"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(18, 17, "document-detail.document-detail.download"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 19, "document-detail.document-detail.download"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r1.canWriteDoc() ? 22 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_For_1_Template, 23, 21, "div", 211, _forTrack5);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵrepeater(ctx_r1.attachments());
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r62 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 206)(1, "span", 219);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 220, 13);
    i0.ɵɵlistener("change", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_10_Template_input_change_4_listener($event) { i0.ɵɵrestoreView(_r62); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.uploadAttachment($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "document-detail.document-detail.upload-attachment"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Template(rf, ctx) { if (rf & 1) {
    const _r54 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-properties-panel", 200);
    i0.ɵɵlistener("publicationsSelected", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Template_nxs_properties_panel_publicationsSelected_0_listener() { i0.ɵɵrestoreView(_r54); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.goToPublishingTab()); });
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_1_Template, 2, 1);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_2_Template, 1, 3, "nxs-tag-editor", 201);
    i0.ɵɵelement(3, "lib-document-layout", 202)(4, "div", 203);
    i0.ɵɵelementStart(5, "div", 204);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_8_Template, 3, 3, "p", 205)(9, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_9_Template, 2, 0);
    i0.ɵɵconditionalCreate(10, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Conditional_10_Template, 6, 3, "label", 206);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_18_0;
    let tmp_19_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("document", ctx_r1.doc())("vocabularyLabel", ctx_r1.vocabularyLabel())("processRunning", ctx_r1.documentWorkflows().length > 0)("versionLabel", ctx_r1.versionLabel())("publications", ctx_r1.publicationCount())("format", ctx_r1.isNoteDocument() ? ctx_r1.noteFormatDisplay() : "");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_18_0 = ctx_r1.doc()) ? 1 : -1, tmp_18_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_19_0 = ctx_r1.doc()) ? 2 : -1, tmp_19_0);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("--document-layout-label-color", "var(--document-detail-properties-label-muted)");
    i0.ɵɵproperty("document", ctx_r1.doc());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 14, "document-detail.document-detail.attachments"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.attachments().length === 0 ? 8 : 9);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canWriteDoc() ? 10 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 117);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "psychology");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 224)(1, "div", 225)(2, "mat-icon");
    i0.ɵɵtext(3, "forum");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "p", 226);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, "document-detail.document-detail.thread-summary"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.aiThreadSummary());
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r63 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 222)(1, "button", 223);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r63); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.analyzeCommentSentiment()); });
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_2_Template, 2, 3, "mat-spinner", 117)(3, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_3_Template, 2, 0, "mat-icon");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Conditional_6_Template, 9, 4, "div", 224);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.aiSentimentLoading());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.aiSentimentLoading() ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "document-detail.document-detail.analyze-sentiment"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiThreadSummary() ? 6 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 230)(1, "mat-icon", 231);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 229)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Conditional_0_Conditional_3_Template, 4, 1, "p", 230);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_20_0;
    const sent_r65 = ctx;
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("sentiment-badge sentiment-", sent_r65.sentiment));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", sent_r65.sentiment, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_20_0 = sent_r65.summary) ? 3 : -1, tmp_20_0);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Conditional_0_Template, 4, 5, "div", 229);
} if (rf & 2) {
    let tmp_16_0;
    const comment_r66 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵconditional((tmp_16_0 = ctx_r1.aiSentimentMap()[comment_r66.id]) ? 0 : -1, tmp_16_0);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r64 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-comments", 227);
    i0.ɵɵlistener("threadChange", function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_Template_nxs_comments_threadChange_0_listener($event) { i0.ɵɵrestoreView(_r64); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.comments.set($event)); });
    i0.ɵɵtemplate(1, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_ng_template_1_Template, 1, 1, "ng-template", 228);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("documentUid", ctx.uid);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 198);
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_1_Template, 7, 6);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Conditional_2_Template, 2, 1, "nxs-comments", 221);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_13_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.featureFlags.aiEnabled() && ctx_r1.comments().length > 0 ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_13_0 = ctx_r1.doc()) ? 2 : -1, tmp_13_0);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 232);
    i0.ɵɵelement(1, "nxs-spinner", 94);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.loading"));
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 233);
    i0.ɵɵelement(1, "sat-avatar", 234);
    i0.ɵɵelementStart(2, "div", 235)(3, "span", 236);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 237);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 238);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const entry_r67 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("initials", entry_r67.principalName)("category", ctx_r1.avatarColor(entry_r67.principalName))("borderless", true);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(entry_r67.principalName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.activityLabel(entry_r67));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.relativeTime(entry_r67.eventDate));
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 205);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "document-detail.document-detail.no-recent-activity"), " ");
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_For_1_Template, 9, 6, "div", 233, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵconditionalCreate(2, DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_Conditional_2_Template, 3, 3, "p", 205);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵrepeater(ctx_r1.panelActivity());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.panelActivity().length === 0 ? 2 : -1);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 199);
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_1_Template, 3, 3, "div", 232)(2, DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Conditional_2_Template, 3, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.panelActivityLoading() ? 1 : 2);
} }
function DocumentDetailComponent_Conditional_2_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    const _r53 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-details-panel", 196);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("selectedChange", function DocumentDetailComponent_Conditional_2_Conditional_47_Template_nxs_details_panel_selectedChange_0_listener($event) { i0.ɵɵrestoreView(_r53); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.switchPanelSubTab($event)); })("closed", function DocumentDetailComponent_Conditional_2_Conditional_47_Template_nxs_details_panel_closed_0_listener() { i0.ɵɵrestoreView(_r53); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closePropertiesPanel()); });
    i0.ɵɵconditionalCreate(3, DocumentDetailComponent_Conditional_2_Conditional_47_Case_3_Template, 11, 16, "nxs-properties-panel", 197)(4, DocumentDetailComponent_Conditional_2_Conditional_47_Case_4_Template, 3, 2, "div", 198)(5, DocumentDetailComponent_Conditional_2_Conditional_47_Case_5_Template, 3, 1, "div", 199);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_16_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("heading", ctx_r1.fileName())("label", i0.ɵɵpipeBind1(1, 6, "document-detail.document-detail.document-properties"))("closeLabel", i0.ɵɵpipeBind1(2, 8, "document-detail.document-detail.close-panel"))("tabs", ctx_r1.panelViews())("selected", ctx_r1.activePanelView());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_16_0 = ctx_r1.activePanelView()) === "properties" ? 3 : tmp_16_0 === "comments" ? 4 : tmp_16_0 === "activity" ? 5 : -1);
} }
function DocumentDetailComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "button", 20);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.goBack()); });
    i0.ɵɵelement(3, "mat-icon", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 22)(5, "div", 23);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "sat-breadcrumbs", 24);
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Template_sat_breadcrumbs_click_7_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onBreadcrumbClick($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "nxs-document-toolbar", 25);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("selected", function DocumentDetailComponent_Conditional_2_Template_nxs_document_toolbar_selected_8_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.runToolbarEntry($event)); });
    i0.ɵɵconditionalCreate(10, DocumentDetailComponent_Conditional_2_Conditional_10_Template, 16, 15, "div", 26);
    i0.ɵɵconditionalCreate(11, DocumentDetailComponent_Conditional_2_Conditional_11_Template, 6, 5, "div", 26);
    i0.ɵɵconditionalCreate(12, DocumentDetailComponent_Conditional_2_Conditional_12_Template, 3, 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(13, DocumentDetailComponent_Conditional_2_Conditional_13_Template, 5, 4, "div", 27);
    i0.ɵɵconditionalCreate(14, DocumentDetailComponent_Conditional_2_Conditional_14_Template, 5, 4, "div", 27);
    i0.ɵɵconditionalCreate(15, DocumentDetailComponent_Conditional_2_Conditional_15_Template, 9, 5, "div", 28);
    i0.ɵɵconditionalCreate(16, DocumentDetailComponent_Conditional_2_Conditional_16_Template, 10, 10, "div", 29);
    i0.ɵɵrepeaterCreate(17, DocumentDetailComponent_Conditional_2_For_18_Template, 10, 10, "div", 30, _forTrack0);
    i0.ɵɵrepeaterCreate(19, DocumentDetailComponent_Conditional_2_For_20_Template, 11, 7, "div", 31, _forTrack0);
    i0.ɵɵconditionalCreate(21, DocumentDetailComponent_Conditional_2_Conditional_21_Template, 9, 7);
    i0.ɵɵelementStart(22, "div", 32)(23, "div", 33)(24, "div", 34)(25, "nxs-tabs", 35);
    i0.ɵɵlistener("selectedIndexChange", function DocumentDetailComponent_Conditional_2_Template_nxs_tabs_selectedIndexChange_25_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onTabChange($event)); });
    i0.ɵɵtemplate(26, DocumentDetailComponent_Conditional_2_ng_template_26_Template, 7, 1, "ng-template", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(27, DocumentDetailComponent_Conditional_2_ng_template_27_Template, 2, 1, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor)(29, DocumentDetailComponent_Conditional_2_ng_template_29_Template, 2, 1, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor)(31, DocumentDetailComponent_Conditional_2_ng_template_31_Template, 1, 25, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor)(33, DocumentDetailComponent_Conditional_2_ng_template_33_Template, 4, 3, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor)(35, DocumentDetailComponent_Conditional_2_ng_template_35_Template, 1, 1, "ng-template", null, 5, i0.ɵɵtemplateRefExtractor)(37, DocumentDetailComponent_Conditional_2_ng_template_37_Template, 12, 6, "ng-template", null, 6, i0.ɵɵtemplateRefExtractor)(39, DocumentDetailComponent_Conditional_2_ng_template_39_Template, 86, 42, "ng-template", null, 7, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementStart(41, "button", 37, 8);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵlistener("click", function DocumentDetailComponent_Conditional_2_Template_button_click_41_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.propertiesPanelOpen.set(!ctx_r1.propertiesPanelOpen())); });
    i0.ɵɵelementStart(45, "mat-icon", 18);
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(47, DocumentDetailComponent_Conditional_2_Conditional_47_Template, 6, 10, "nxs-details-panel", 38);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 19, "document-detail.document-detail.go-back"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.doc().title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("items", ctx_r1.breadcrumbItems());
    i0.ɵɵadvance();
    i0.ɵɵproperty("actions", ctx_r1.toolbarEntries())("moreLabel", i0.ɵɵpipeBind1(9, 21, "document-detail.document-detail.more-actions"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.isTrashed() && !ctx_r1.isVersionView() && ctx_r1.supportsTextKnowledgeEnrichment() ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.isTrashed() && !ctx_r1.isVersionView() && ctx_r1.supportsImageKnowledgeEnrichment() ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.isTrashed() && !ctx_r1.isVersionView() && ctx_r1.showsContentLakeIngestAction() ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.keStatus() || ctx_r1.keError() ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((ctx_r1.contentLakeIngestStatus() || ctx_r1.contentLakeIngestError()) && !ctx_r1.contentLakeIngestInFlight() ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isTrashed() ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isVersionView() ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.documentWorkflows());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.documentTasks());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.showStartProcessPanel() ? 21 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("tabs", ctx_r1.detailTabEntries())("selectedIndex", ctx_r1.activeTabIndex());
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(43, 23, ctx_r1.detailsPanelToggleLabelKey()));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(44, 25, ctx_r1.detailsPanelToggleLabelKey()));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.propertiesPanelOpen() ? "info" : "info_outline");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.propertiesPanelOpen() ? 47 : -1);
} }
function DocumentDetailComponent_ng_template_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r70 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 245);
    i0.ɵɵlistener("click", function DocumentDetailComponent_ng_template_3_Conditional_1_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r70); const node_r69 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); ctx_r1.toggleSectionNode(node_r69); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(1, "mat-icon", 246);
    i0.ɵɵtext(2, " chevron_right ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const node_r69 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵclassProp("section-arrow--expanded", node_r69.expanded);
} }
function DocumentDetailComponent_ng_template_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 241);
} }
function DocumentDetailComponent_ng_template_3_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 244);
    i0.ɵɵtext(1, "check_circle");
    i0.ɵɵelementEnd();
} }
function DocumentDetailComponent_ng_template_3_Conditional_8_For_1_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function DocumentDetailComponent_ng_template_3_Conditional_8_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, DocumentDetailComponent_ng_template_3_Conditional_8_For_1_ng_container_0_Template, 1, 0, "ng-container", 136);
} if (rf & 2) {
    const child_r71 = ctx.$implicit;
    const depth_r72 = i0.ɵɵnextContext(2).depth;
    i0.ɵɵnextContext();
    const sectionNodeTpl_r42 = i0.ɵɵreference(4);
    i0.ɵɵproperty("ngTemplateOutlet", sectionNodeTpl_r42)("ngTemplateOutletContext", i0.ɵɵpureFunction2(2, _c8, child_r71, depth_r72 + 1));
} }
function DocumentDetailComponent_ng_template_3_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentDetailComponent_ng_template_3_Conditional_8_For_1_Template, 1, 5, "ng-container", null, _forTrack3);
} if (rf & 2) {
    const node_r69 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵrepeater(node_r69.children);
} }
function DocumentDetailComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    const _r68 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 239);
    i0.ɵɵlistener("click", function DocumentDetailComponent_ng_template_3_Template_div_click_0_listener() { const node_r69 = i0.ɵɵrestoreView(_r68).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection(node_r69.doc.uid)); })("keydown.enter", function DocumentDetailComponent_ng_template_3_Template_div_keydown_enter_0_listener() { const node_r69 = i0.ɵɵrestoreView(_r68).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.selectSection(node_r69.doc.uid)); })("keydown.space", function DocumentDetailComponent_ng_template_3_Template_div_keydown_space_0_listener($event) { const node_r69 = i0.ɵɵrestoreView(_r68).$implicit; const ctx_r1 = i0.ɵɵnextContext(); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.selectSection(node_r69.doc.uid)); });
    i0.ɵɵconditionalCreate(1, DocumentDetailComponent_ng_template_3_Conditional_1_Template, 3, 2, "button", 240)(2, DocumentDetailComponent_ng_template_3_Conditional_2_Template, 1, 0, "span", 241);
    i0.ɵɵelementStart(3, "mat-icon", 242);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 243);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, DocumentDetailComponent_ng_template_3_Conditional_7_Template, 2, 0, "mat-icon", 244);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, DocumentDetailComponent_ng_template_3_Conditional_8_Template, 2, 0);
} if (rf & 2) {
    const node_r69 = ctx.$implicit;
    const depth_r72 = ctx.depth;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("padding-left", 16 + depth_r72 * 24, "px");
    i0.ɵɵclassProp("section-node--selected", ctx_r1.selectedSectionId() === node_r69.doc.uid);
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r69.children.length > 0 ? 1 : 2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.sectionIcon(node_r69));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(node_r69.doc.title);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.selectedSectionId() === node_r69.doc.uid ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r69.expanded && node_r69.children.length > 0 ? 8 : -1);
} }
const TAG_CATEGORIES = [
    'yellow',
    'blue',
    'teal',
    'purple',
    'red',
    'pink',
    'orange',
];
/**
 * Sentinel value the Hyland Knowledge Enrichment `text-classification` action returns
 * when the model cannot match the document to any of the supplied candidate classes.
 * We must never write this to `dc:nature` — it is not a valid vocabulary id and Nuxeo
 * will reject the PUT with HTTP 422 ("Cannot find vocabulary value").
 *
 * See AGENTS/08-bug-patterns.md ("AI free-form output written to a vocabulary field").
 */
const KE_NO_MATCH_SENTINEL = 'not_from_provided_classes';
/** Catalogue keys for the progress, success and failure message of each enrichment action. */
const KE_MESSAGE_KEYS = {
    'text-classification': {
        start: 'document-detail.message.ke-start-classification',
        success: 'document-detail.message.ke-success-classification',
        failed: 'document-detail.message.ke-failed-classification',
    },
    'named-entity-recognition-text': {
        start: 'document-detail.message.ke-start-entity-extraction',
        success: 'document-detail.message.ke-success-entity-extraction',
        failed: 'document-detail.message.ke-failed-entity-extraction',
    },
    'text-summarization': {
        start: 'document-detail.message.ke-start-summarization',
        success: 'document-detail.message.ke-success-summarization',
        failed: 'document-detail.message.ke-failed-summarization',
    },
    'image-enrichment': {
        start: 'document-detail.message.ke-start-image-enrichment',
        success: 'document-detail.message.ke-success-image-enrichment',
        failed: 'document-detail.message.ke-failed-image-enrichment',
    },
};
/**
 * The message for a refused restore. 403 is also what Nuxeo answers when another user holds
 * the lock, which removes `WriteVersion` from everyone but its owner and administrators.
 */
function restoreVersionErrorKey(err) {
    if (isPermissionDeniedError(err))
        return 'document-detail.message.restore-version-forbidden';
    if (err?.status === 409) {
        return 'document-detail.message.restore-version-conflict';
    }
    return 'document-detail.message.failed-to-restore-version';
}
const MIME_BY_EXTENSION = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    xml: 'text/xml',
    json: 'application/json',
    md: 'text/markdown',
};
export class DocumentDetailComponent {
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    extensionRuleContext = inject(ExtensionRuleContextService);
    extensions = inject(AppExtensionsService);
    actionRegistry = inject(ExtensionActionRegistry);
    componentRegistry = inject(ExtensionComponentRegistry);
    route = inject(ActivatedRoute);
    router = inject(Router);
    browseService = inject(BrowseService);
    detailService = inject(DocumentDetailService);
    browseContext = inject(BrowseContextService);
    directoryService = inject(DirectoryService);
    http = inject(HttpClient);
    toast = inject(NxsToastService);
    dialog = inject(MatDialog);
    appConfig = inject(AppConfigService);
    nuxeoApi = inject(NuxeoApiBase);
    taskService = inject(TaskService);
    workflowService = inject(WorkflowService);
    currentUsername = inject(CURRENT_USERNAME);
    arenderService = inject(ARenderService);
    sanitizer = inject(DomSanitizer);
    /** `''` when the dev proxy is in use, in which case preview URLs arrive same-origin. */
    nuxeoApiOrigin = inject(NUXEO_API_ORIGIN);
    tagService = inject(TagService);
    aiGateway = inject(AiGatewayService);
    keClient = inject(KeClientService);
    contentLakeIngestService = inject(ContentLakeIngestService);
    kdClient = inject(KdClientService);
    aiChatService = inject(AiChatService);
    featureFlags = inject(AiFeatureFlagService);
    doc = signal(null, ...(ngDevMode ? [{ debugName: "doc" }] : []));
    /**
     * Publish the focused document to the extension rule context.
     *
     * `app.rules.canWrite`, `canRemove`, `canAddChildren`, `canManagePermissions`,
     * `hasDocument`, `isType`, `hasFacet`, `isNote` and the two trash rules all read
     * `ExtensionRuleContext.document`. Nothing populated it before, so every one
     * of them answered `false` while the reference doc described them as working.
     * This page is the only surface with a single document in focus, so it is the
     * one that owns the write; `ngOnDestroy` clears it again.
     */
    publishDocumentToRuleContext = effect(() => this.extensionRuleContext.document.set(this.doc()), ...(ngDevMode ? [{ debugName: "publishDocumentToRuleContext" }] : []));
    /**
     * Publish this page's interface state, which the toolbar rules read.
     *
     * None of it is derivable from the document: favourite and subscription state
     * are separate fetches, clipboard membership is local storage, and "an
     * operation is in flight" is not a fact about the document at all. Without it
     * a toggle could not be two descriptors gated by opposite rules, and the
     * label a manifest sets for "Notify Me" would be overwritten by the component
     * whenever the user happened to be subscribed.
     *
     * Cleared in `ngOnDestroy` alongside the document, for the same reason.
     */
    publishFlagsToRuleContext = effect(() => {
        const busy = this.actionInProgress();
        this.extensionRuleContext.flags.set({
            favorite: this.isFavorite(),
            locked: this.isLocked(),
            subscribed: this.isSubscribed(),
            inClipboard: this.isInClipboard(),
            hasVersion: this.hasVersion(),
            aiEnabled: this.featureFlags.aiEnabled(),
            ...(busy ? { [`busy.${busy}`]: true } : {}),
        });
    }, ...(ngDevMode ? [{ debugName: "publishFlagsToRuleContext" }] : []));
    /** The toolbar actions this document is offered, overflow included, with every rule applied. */
    toolbarActions = computed(() => this.extensions.resolve(EXTENSION_SLOTS.toolbar, this.extensionRuleContext.context()), ...(ngDevMode ? [{ debugName: "toolbarActions" }] : []));
    /** Ticks when the language or its catalogue changes, so `instant` lookups in computeds re-run. */
    translationTick = toSignal(merge(this.translate.onLangChange, this.translate.onTranslationChange, this.translate.onDefaultLangChange).pipe(map((_, index) => index)), { initialValue: -1 });
    /**
     * The toolbar slot, resolved for `nxs-document-toolbar`: labels translated, enabled rules
     * evaluated, and the Unlock tooltip naming who holds the lock. `overflow` sends an entry to the
     * "More actions" menu; `overflow: false` in a manifest promotes it out.
     */
    toolbarEntries = computed(() => {
        this.translationTick();
        return this.toolbarActions().map((action) => ({
            id: action.id,
            label: descriptorLabel(action, (key) => this.translate.instant(key)),
            icon: action.icon,
            tooltip: this.toolbarTooltip(action),
            disabled: !this.isToolbarActionEnabled(action),
            active: this.isToolbarActionActive(action),
            overflow: !!action.overflow,
        }));
    }, ...(ngDevMode ? [{ debugName: "toolbarEntries" }] : []));
    /**
     * The tab strip, resolved through Layer 1.
     *
     * The five packaged bodies are still markup in this template and are matched
     * by id; a tab a manifest adds renders through `ExtensionOutletComponent`. So
     * hiding, reordering, relabelling and gating work for every tab, and adding
     * one works without touching this file.
     */
    detailTabs = computed(() => this.extensions.resolve(EXTENSION_SLOTS.tabs, this.extensionRuleContext.context()), ...(ngDevMode ? [{ debugName: "detailTabs" }] : []));
    /** The tab strip for `nxs-tabs`: labels translated, so a language change relabels it. */
    detailTabEntries = computed(() => {
        this.translationTick();
        return this.detailTabs().map((tab) => ({
            id: tab.id,
            label: descriptorLabel(tab, (key) => this.translate.instant(key)),
            icon: tab.icon,
        }));
    }, ...(ngDevMode ? [{ debugName: "detailTabEntries" }] : []));
    /** The component a contributed tab renders: its `componentId`, else its own ID. */
    tabComponentId(id) {
        const tab = this.detailTabs().find((candidate) => candidate.id === id);
        return tab?.componentId ?? id;
    }
    /**
     * The View tab body contributed for this document, or `null` for the packaged view.
     *
     * The first `documentView` entry, by order, whose rule admits the focused document and
     * whose component is registered. An entry naming a component this build lacks is skipped
     * rather than chosen, so the manifest can precede the library that backs it. The registry
     * is not a signal; components register in environment initializers, before this page.
     */
    documentView = computed(() => this.extensions
        .resolve(EXTENSION_SLOTS.documentView, this.extensionRuleContext.context())
        .find((view) => this.componentRegistry.has(view.componentId ?? view.id)) ?? null, ...(ngDevMode ? [{ debugName: "documentView" }] : []));
    /** What this page does differently for the focused document's type. See `document-type-traits.ts`. */
    typeTraits = computed(() => documentTypeTraits(this.doc()?.type), ...(ngDevMode ? [{ debugName: "typeTraits" }] : []));
    /**
     * The packaged View tab body for the focused document's type: what renders when no
     * `documentView` entry takes the tab, and when the entry that did fails to load.
     */
    packagedDocumentView = computed(() => this.typeTraits().view, ...(ngDevMode ? [{ debugName: "packagedDocumentView" }] : []));
    /** `document` last, so a manifest `inputs.document` cannot stand in for the one on screen. */
    documentViewInputs = computed(() => ({
        ...this.documentView()?.inputs,
        document: this.doc(),
    }), ...(ngDevMode ? [{ debugName: "documentViewInputs" }] : []));
    /**
     * The id of the selected tab.
     *
     * The lazy loads behind Permissions, History and Publishing used to key off
     * the literal indices 2, 3 and 4. Once a manifest can hide or reorder a tab
     * those indices address a different tab, so they key off the id instead.
     */
    activeTabId = computed(() => this.detailTabs()[this.activeTabIndex()]?.id ?? null, ...(ngDevMode ? [{ debugName: "activeTabId" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    blobLoading = signal(false, ...(ngDevMode ? [{ debugName: "blobLoading" }] : []));
    viewerLoading = computed(() => this.loading() || (this.blobLoading() && !this.blobUrl() && this.videoSources().length === 0), ...(ngDevMode ? [{ debugName: "viewerLoading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    /** Which error state `error` shows: the status of the document request that failed. */
    errorStatus = signal(500, ...(ngDevMode ? [{ debugName: "errorStatus" }] : []));
    blobUrl = signal(null, ...(ngDevMode ? [{ debugName: "blobUrl" }] : []));
    noteContent = signal(null, ...(ngDevMode ? [{ debugName: "noteContent" }] : []));
    noteHtml = signal(null, ...(ngDevMode ? [{ debugName: "noteHtml" }] : []));
    noteSaving = signal(false, ...(ngDevMode ? [{ debugName: "noteSaving" }] : []));
    focusNoteEditor = signal(false, ...(ngDevMode ? [{ debugName: "focusNoteEditor" }] : []));
    videoSources = signal([], ...(ngDevMode ? [{ debugName: "videoSources" }] : []));
    storyboard = signal([], ...(ngDevMode ? [{ debugName: "storyboard" }] : []));
    /** Raw string: `video[poster]` is SecurityContext.NONE. See `DocumentViewerComponent.rawBlobUrl`. */
    posterUrl = signal(null, ...(ngDevMode ? [{ debugName: "posterUrl" }] : []));
    hasPdfRendition = signal(false, ...(ngDevMode ? [{ debugName: "hasPdfRendition" }] : []));
    previewUrl = signal(null, ...(ngDevMode ? [{ debugName: "previewUrl" }] : []));
    pictureInfo = signal(null, ...(ngDevMode ? [{ debugName: "pictureInfo" }] : []));
    pictureViews = signal([], ...(ngDevMode ? [{ debugName: "pictureViews" }] : []));
    exifData = signal(null, ...(ngDevMode ? [{ debugName: "exifData" }] : []));
    iptcData = signal(null, ...(ngDevMode ? [{ debugName: "iptcData" }] : []));
    videoInfo = signal(null, ...(ngDevMode ? [{ debugName: "videoInfo" }] : []));
    arenderUrl = signal(null, ...(ngDevMode ? [{ debugName: "arenderUrl" }] : []));
    /** Bumped when the ARender previewer URL changes so the iframe is recreated (avoids stale session / wrong doc). */
    arenderReloadId = signal(0, ...(ngDevMode ? [{ debugName: "arenderReloadId" }] : []));
    propertiesPanelOpen = signal(true, ...(ngDevMode ? [{ debugName: "propertiesPanelOpen" }] : []));
    panelSubTab = signal('properties', ...(ngDevMode ? [{ debugName: "panelSubTab" }] : []));
    panelToggle = viewChild('panelToggle', ...(ngDevMode ? [{ debugName: "panelToggle", read: ElementRef }] : [{ read: ElementRef }]));
    publicationsHeading = viewChild('publicationsHeading', ...(ngDevMode ? [{ debugName: "publicationsHeading", read: ElementRef }] : [{ read: ElementRef }]));
    /** Web UI's side pane offers Comments only on a document with the `Commentable` facet. */
    panelViews = computed(() => {
        this.translationTick();
        const view = (id) => ({
            id,
            label: this.translate.instant(`document-detail.document-detail.${id}`),
        });
        const commentable = this.doc()?.facets?.includes('Commentable') ?? false;
        return [view('properties'), ...(commentable ? [view('comments')] : []), view('activity')];
    }, ...(ngDevMode ? [{ debugName: "panelViews" }] : []));
    activePanelView = computed(() => {
        const selected = this.panelSubTab();
        return this.panelViews().some((view) => view.id === selected) ? selected : 'properties';
    }, ...(ngDevMode ? [{ debugName: "activePanelView" }] : []));
    vocabularyLabel = computed(() => {
        const nature = this.natureVocabulary();
        const coverage = this.coverageVocabulary();
        const subjects = this.subjectVocabulary();
        return (directory, id) => directory === 'nature'
            ? resolveNatureLabel(id, nature)
            : formatHierarchicalL10nLabel(id, directory === 'l10ncoverage' ? coverage : subjects);
    }, ...(ngDevMode ? [{ debugName: "vocabularyLabel" }] : []));
    /**
     * The unwrapped object URL behind `blobUrl`. Public and a signal because the template forwards
     * it to `lib-document-viewer[rawBlobUrl]` for the three `SecurityContext.NONE` bindings
     * (`source[src]`, `audio[src]`, `video[poster]`), where a `SafeResourceUrl` stringifies instead
     * of being unwrapped. `blobUrl` remains the wrapped value for `iframe[src]`.
     */
    rawBlobUrl = signal(null, ...(ngDevMode ? [{ debugName: "rawBlobUrl" }] : []));
    /**
     * `Blob.type` of the main blob, i.e. the served `Content-Type`.
     *
     * Read by the template, so not private: it gates both the attachment dialog and the embedded
     * viewer's iframe branches, which must decide on what was served rather than on metadata.
     */
    mainBlobType = signal('', ...(ngDevMode ? [{ debugName: "mainBlobType" }] : []));
    videoObjectUrls = [];
    storyboardObjectUrls = [];
    /** A storyboard load is already running for the current document. */
    storyboardInFlight = false;
    docUid = '';
    /** Token of the newest `loadDocument` read; the page is reused across `:uid` changes. */
    documentLoadGeneration = 0;
    metadataRefreshAttempt = 0;
    blobLoadGeneration = 0;
    /** Set when navigating here immediately after create/import with a main blob. */
    freshBlobDocument = false;
    /** Set when navigating here immediately after creating a Note. */
    freshNoteDocument = false;
    breadcrumbPathCache = null;
    breadcrumbItemsCache = [];
    // AI Insights state
    aiSummary = signal(null, ...(ngDevMode ? [{ debugName: "aiSummary" }] : []));
    aiSummaryLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiSummaryLoading" }] : []));
    aiSuggestedTags = signal([], ...(ngDevMode ? [{ debugName: "aiSuggestedTags" }] : []));
    aiTagsLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiTagsLoading" }] : []));
    aiClassification = signal(null, ...(ngDevMode ? [{ debugName: "aiClassification" }] : []));
    aiClassifyLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiClassifyLoading" }] : []));
    aiSimilarDocs = signal([], ...(ngDevMode ? [{ debugName: "aiSimilarDocs" }] : []));
    aiSimilarLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiSimilarLoading" }] : []));
    aiError = signal(null, ...(ngDevMode ? [{ debugName: "aiError" }] : []));
    aiSentimentMap = signal({}, ...(ngDevMode ? [{ debugName: "aiSentimentMap" }] : []));
    aiThreadSummary = signal(null, ...(ngDevMode ? [{ debugName: "aiThreadSummary" }] : []));
    aiSentimentLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiSentimentLoading" }] : []));
    keActionInFlight = signal(null, ...(ngDevMode ? [{ debugName: "keActionInFlight" }] : []));
    keStatus = signal(null, ...(ngDevMode ? [{ debugName: "keStatus" }] : []));
    keError = signal(null, ...(ngDevMode ? [{ debugName: "keError" }] : []));
    contentLakeIngestInFlight = signal(false, ...(ngDevMode ? [{ debugName: "contentLakeIngestInFlight" }] : []));
    contentLakeIngestStatus = signal(null, ...(ngDevMode ? [{ debugName: "contentLakeIngestStatus" }] : []));
    contentLakeIngestError = signal(null, ...(ngDevMode ? [{ debugName: "contentLakeIngestError" }] : []));
    /** Set after a successful ingest or CheckDigest probe when the marker cannot be persisted. */
    contentLakePresenceVerified = signal(false, ...(ngDevMode ? [{ debugName: "contentLakePresenceVerified" }] : []));
    contentLakePresenceChecking = signal(false, ...(ngDevMode ? [{ debugName: "contentLakePresenceChecking" }] : []));
    // Loaded from the Nuxeo `nature` directory and supplied as candidate classes to the
    // KE text-classification model. Sourcing live ids guarantees the value we write back
    // to `dc:nature` is in the vocabulary (Nuxeo enforces this and returns 422 otherwise).
    // Refreshed on each document navigation (Nuxeo Web UI parity).
    natureVocabulary = signal([], ...(ngDevMode ? [{ debugName: "natureVocabulary" }] : []));
    coverageVocabulary = signal([], ...(ngDevMode ? [{ debugName: "coverageVocabulary" }] : []));
    subjectVocabulary = signal([], ...(ngDevMode ? [{ debugName: "subjectVocabulary" }] : []));
    /** The thread `nxs-comments` loaded, comments and replies, for the sentiment analysis. */
    comments = signal([], ...(ngDevMode ? [{ debugName: "comments" }] : []));
    // Panel activity state (recent activity for the side panel)
    panelActivity = signal([], ...(ngDevMode ? [{ debugName: "panelActivity" }] : []));
    panelActivityLoading = signal(false, ...(ngDevMode ? [{ debugName: "panelActivityLoading" }] : []));
    panelActivityLoaded = false;
    currentMajor = computed(() => {
        const d = this.doc();
        return Number(d?.properties['uid:major_version'] ?? 0);
    }, ...(ngDevMode ? [{ debugName: "currentMajor" }] : []));
    currentMinor = computed(() => {
        const d = this.doc();
        return Number(d?.properties['uid:minor_version'] ?? 0);
    }, ...(ngDevMode ? [{ debugName: "currentMinor" }] : []));
    hasVersion = computed(() => {
        return this.currentMajor() > 0 || this.currentMinor() > 0;
    }, ...(ngDevMode ? [{ debugName: "hasVersion" }] : []));
    // Workflow / Task state
    documentTasks = signal([], ...(ngDevMode ? [{ debugName: "documentTasks" }] : []));
    documentTasksLoading = signal(false, ...(ngDevMode ? [{ debugName: "documentTasksLoading" }] : []));
    documentWorkflows = signal([], ...(ngDevMode ? [{ debugName: "documentWorkflows" }] : []));
    abandoningWorkflow = signal(false, ...(ngDevMode ? [{ debugName: "abandoningWorkflow" }] : []));
    availableWorkflows = signal([], ...(ngDevMode ? [{ debugName: "availableWorkflows" }] : []));
    workflowsLoading = signal(false, ...(ngDevMode ? [{ debugName: "workflowsLoading" }] : []));
    startingWorkflow = signal(false, ...(ngDevMode ? [{ debugName: "startingWorkflow" }] : []));
    showStartProcessPanel = signal(false, ...(ngDevMode ? [{ debugName: "showStartProcessPanel" }] : []));
    selectedWorkflowModel = signal('', ...(ngDevMode ? [{ debugName: "selectedWorkflowModel" }] : []));
    // Document action states
    isLocked = signal(false, ...(ngDevMode ? [{ debugName: "isLocked" }] : []));
    lockOwner = signal(null, ...(ngDevMode ? [{ debugName: "lockOwner" }] : []));
    lockCreated = signal(null, ...(ngDevMode ? [{ debugName: "lockCreated" }] : []));
    /** Token of the lock request that owns `actionInProgress`; navigation invalidates it. */
    lockRequest = 0;
    isFavorite = signal(false, ...(ngDevMode ? [{ debugName: "isFavorite" }] : []));
    isSubscribed = signal(false, ...(ngDevMode ? [{ debugName: "isSubscribed" }] : []));
    actionInProgress = signal(null, ...(ngDevMode ? [{ debugName: "actionInProgress" }] : []));
    clipboardDocs = signal(readClipboardDocs(), ...(ngDevMode ? [{ debugName: "clipboardDocs" }] : []));
    isInClipboard = computed(() => this.clipboardDocs().some((d) => d.uid === this.docUid), ...(ngDevMode ? [{ debugName: "isInClipboard" }] : []));
    permissionsTabLoaded = false;
    /**
     * `nxs-document-history` reads the audit trail and its vocabularies when it is created, and a tab
     * body is created with the page, so it is rendered only once its tab has been shown.
     */
    historyShown = signal(false, ...(ngDevMode ? [{ debugName: "historyShown" }] : []));
    activeTabIndex = signal(0, ...(ngDevMode ? [{ debugName: "activeTabIndex" }] : []));
    permissionsLoading = signal(false, ...(ngDevMode ? [{ debugName: "permissionsLoading" }] : []));
    /** The `eventTypes` vocabulary's labels, for the side panel's activity; read once. */
    eventTypeLabels = signal(new Map(), ...(ngDevMode ? [{ debugName: "eventTypeLabels" }] : []));
    eventTypesRequested = false;
    // Publishing tab state
    publishedDocs = signal([], ...(ngDevMode ? [{ debugName: "publishedDocs" }] : []));
    publishLoading = signal(false, ...(ngDevMode ? [{ debugName: "publishLoading" }] : []));
    sectionTree = signal([], ...(ngDevMode ? [{ debugName: "sectionTree" }] : []));
    sectionsLoading = signal(false, ...(ngDevMode ? [{ debugName: "sectionsLoading" }] : []));
    selectedSectionId = signal(null, ...(ngDevMode ? [{ debugName: "selectedSectionId" }] : []));
    publishing = signal(false, ...(ngDevMode ? [{ debugName: "publishing" }] : []));
    publishTabLoaded = false;
    mimeType = computed(() => {
        const d = this.doc();
        if (!d)
            return '';
        const noteMime = d.properties['note:mime_type'];
        if (noteMime)
            return noteMime;
        const fc = d.properties['file:content'];
        return this.resolveMainContentMime(fc, d);
    }, ...(ngDevMode ? [{ debugName: "mimeType" }] : []));
    /** A document whose body is note text, edited in the note editor, with no main file. */
    isNoteDocument = computed(() => this.packagedDocumentView() === 'noteEditor', ...(ngDevMode ? [{ debugName: "isNoteDocument" }] : []));
    noteFormatDisplay = computed(() => noteFormatLabel(this.mimeType()), ...(ngDevMode ? [{ debugName: "noteFormatDisplay" }] : []));
    noteEditorBody = computed(() => this.noteContent() ?? '', ...(ngDevMode ? [{ debugName: "noteEditorBody" }] : []));
    /** Parent folder for note RTE image uploads (Web UI stores uploaded pictures in the repository). */
    noteImageUploadParentPath = computed(() => {
        const path = this.doc()?.path;
        if (!path)
            return null;
        const slash = path.lastIndexOf('/');
        return slash > 0 ? path.slice(0, slash) : '/';
    }, ...(ngDevMode ? [{ debugName: "noteImageUploadParentPath" }] : []));
    isImage = computed(() => this.mimeType().startsWith('image/'), ...(ngDevMode ? [{ debugName: "isImage" }] : []));
    isPdf = computed(() => this.mimeType() === 'application/pdf', ...(ngDevMode ? [{ debugName: "isPdf" }] : []));
    fileName = computed(() => {
        const d = this.doc();
        if (!d)
            return '';
        const fc = d.properties['file:content'];
        return fc?.['name'] ?? d.title;
    }, ...(ngDevMode ? [{ debugName: "fileName" }] : []));
    fileSize = computed(() => {
        const d = this.doc();
        if (!d)
            return '';
        const fc = d.properties['file:content'];
        const len = Number(fc?.['length'] ?? 0);
        if (len === 0)
            return '';
        if (len < 1024)
            return `${len} B`;
        if (len < 1024 * 1024)
            return `${(len / 1024).toFixed(2)} KB`;
        return `${(len / (1024 * 1024)).toFixed(2)} MB`;
    }, ...(ngDevMode ? [{ debugName: "fileSize" }] : []));
    breadcrumbItems = computed(() => {
        const d = this.doc();
        if (!d)
            return [];
        const path = d.path ?? '';
        const cacheKey = `${path}\0${d.title}`;
        if (cacheKey === this.breadcrumbPathCache) {
            return this.breadcrumbItemsCache;
        }
        const parts = path.split('/').filter(Boolean);
        parts.pop();
        this.breadcrumbPathCache = cacheKey;
        let accumulated = '/';
        this.breadcrumbItemsCache = parts.map((s) => {
            accumulated = normalizeNuxeoPath(`${accumulated}/${s}`);
            return {
                label: decodeNuxeoPathSegment(s),
                href: toBrowseRouterUrl(accumulated),
            };
        });
        return this.breadcrumbItemsCache;
    }, ...(ngDevMode ? [{ debugName: "breadcrumbItems" }] : []));
    browseUrlForPath(nuxeoPath) {
        return toBrowseRouterUrl(nuxeoPath);
    }
    onBreadcrumbClick(event) {
        const anchor = event.target.closest('a');
        const href = anchor?.getAttribute('href');
        if (href) {
            event.preventDefault();
            void this.router.navigateByUrl(href);
        }
    }
    versionLabel = computed(() => {
        const d = this.doc();
        if (!d)
            return '';
        const label = `${this.currentMajor()}.${this.currentMinor()}`;
        return d.isCheckedOut ? `${label}+` : label;
    }, ...(ngDevMode ? [{ debugName: "versionLabel" }] : []));
    publicationCount = computed(() => this.publishedDocs().length, ...(ngDevMode ? [{ debugName: "publicationCount" }] : []));
    tags = computed(() => {
        const d = this.doc();
        if (!d)
            return [];
        const raw = d.properties['nxtag:tags'];
        if (!raw)
            return [];
        return raw.map((t) => (typeof t === 'string' ? t : t.label));
    }, ...(ngDevMode ? [{ debugName: "tags" }] : []));
    fileMimeType = computed(() => {
        const d = this.doc();
        if (!d)
            return '';
        const fileContent = d.properties['file:content'];
        const directMime = fileContent?.['mime-type'] ?? '';
        if (directMime)
            return directMime;
        const pictureViews = d.properties['picture:views'];
        const pictureContent = pictureViews?.[0]?.['content'];
        return pictureContent?.['mime-type'] ?? '';
    }, ...(ngDevMode ? [{ debugName: "fileMimeType" }] : []));
    supportsTextKnowledgeEnrichment = computed(() => this.fileMimeType() === 'application/pdf', ...(ngDevMode ? [{ debugName: "supportsTextKnowledgeEnrichment" }] : []));
    supportsImageKnowledgeEnrichment = computed(() => {
        const mime = this.fileMimeType();
        return mime.startsWith('image/') || this.typeTraits().picture;
    }, ...(ngDevMode ? [{ debugName: "supportsImageKnowledgeEnrichment" }] : []));
    canIngestToContentLake = computed(() => needsContentLakeIngest(this.doc()), ...(ngDevMode ? [{ debugName: "canIngestToContentLake" }] : []));
    showsContentLakeIngested = computed(() => isContentLakeIngestCurrent(this.doc()) || this.contentLakePresenceVerified(), ...(ngDevMode ? [{ debugName: "showsContentLakeIngested" }] : []));
    showsContentLakeIngestAction = computed(() => supportsContentLakeIngest(this.doc()), ...(ngDevMode ? [{ debugName: "showsContentLakeIngestAction" }] : []));
    attachments = computed(() => {
        const d = this.doc();
        if (!d)
            return [];
        const files = d.properties['files:files'];
        if (!files)
            return [];
        return files
            .filter((f) => f.file)
            .map((f, i) => ({
            index: i,
            name: f.file['name'] ?? 'Untitled',
            size: Number(f.file['length'] ?? 0),
            mimeType: f.file['mime-type'] ?? '',
            url: f.file['data'] ?? '',
        }));
    }, ...(ngDevMode ? [{ debugName: "attachments" }] : []));
    // Permissions tab computed
    /**
     * Web UI's external-user card: granted, pending or effective shares on the document's own ACLs.
     * An inherited share is the parent's to edit, and an archived one has expired.
     */
    externalAces = computed(() => {
        const d = this.doc();
        const acls = d?.contextParameters?.['acls'];
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
    visiblePermissions = computed(() => this.doc()?.contextParameters?.['userVisiblePermissions'], ...(ngDevMode ? [{ debugName: "visiblePermissions" }] : []));
    /**
     * The page is showing a version rather than the live document.
     *
     * A version's `permissions` enricher repeats the live document's — `Write`, `WriteSecurity`
     * and the rest — while the server refuses to modify it, so the enricher alone would render
     * every edit control. The write gates below therefore also ask this.
     */
    isVersionView = computed(() => this.doc()?.isVersion === true, ...(ngDevMode ? [{ debugName: "isVersionView" }] : []));
    canManagePermissions = computed(() => !this.isVersionView() && canManageDocumentPermissions(this.doc()), ...(ngDevMode ? [{ debugName: "canManagePermissions" }] : []));
    permissionsPanelId = NXS_PERMISSIONS_PANEL_ID;
    /** The panel's writes can change the external-user shares this tab reads itself. */
    onPermissionsChanged = () => this.reloadDocumentPermissions();
    canWriteDoc = computed(() => !this.isVersionView() && canWriteDocument(this.doc()), ...(ngDevMode ? [{ debugName: "canWriteDoc" }] : []));
    /** Web UI's `isTaggable`: Write on the document itself, not a version or a proxy. */
    canTag = computed(() => canTagDocument(this.doc()), ...(ngDevMode ? [{ debugName: "canTag" }] : []));
    canRemoveDoc = computed(() => canRemoveDocument(this.doc()), ...(ngDevMode ? [{ debugName: "canRemoveDoc" }] : []));
    /** `Document.RestoreVersion` is checked against `WriteVersion`, not `Write`. */
    canRestoreVersion = computed(() => this.isVersionView() && hasDocumentPermission(this.doc(), WRITE_VERSION), ...(ngDevMode ? [{ debugName: "canRestoreVersion" }] : []));
    /** The Publishing tab's own Publish, gated as the toolbar's is (`app.rules.canPublish`). */
    canPublish = computed(() => canPublishDocument(this.doc()), ...(ngDevMode ? [{ debugName: "canPublish" }] : []));
    /** Web UI's `_canUnpublish`: `WriteVersion` on the publication itself, not on this document. */
    canUnpublish(pub) {
        return hasDocumentPermission(pub, WRITE_VERSION);
    }
    /** Web UI's `_canRepublish`: an older version is published, or this one with changes since. */
    canRepublish(pub) {
        if (!this.canUnpublish(pub))
            return false;
        const sameVersion = Number(pub.properties?.['uid:major_version'] ?? 0) === this.currentMajor() &&
            Number(pub.properties?.['uid:minor_version'] ?? 0) === this.currentMinor();
        return this.isOlderVersion(pub) || (sameVersion && this.doc()?.isCheckedOut === true);
    }
    permissionLabel(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    aceTimeFrame(ace) {
        return nxsAceTimeFrame(ace, (key, params) => this.translate.instant(key, params), this.locale);
    }
    displayUsername(ace) {
        return resolveAcePrincipal(ace.username).replace(/^transient\//, '');
    }
    aceGrantedBy(ace) {
        const creator = ace.creator ? resolveAcePrincipal(ace.creator) : '';
        return creator || '—';
    }
    /** `enabledRule` renders a control disabled rather than hiding it. */
    isToolbarActionEnabled(action) {
        return this.extensions.evaluateRule(action.enabledRule, this.extensionRuleContext.context());
    }
    /**
     * Inline toolbar buttons are `disabledInteractive` so a disabled one still shows its tooltip,
     * which means a click reaches here and has to be refused here.
     */
    runToolbarAction(action) {
        if (!this.isToolbarActionEnabled(action))
            return;
        this.actionRegistry.execute(action, this.extensionRuleContext.context());
    }
    runToolbarEntry(entry) {
        const action = this.toolbarActions().find((candidate) => candidate.id === entry.id);
        if (action)
            this.runToolbarAction(action);
    }
    /** A manifest's `tooltip` wins; otherwise Unlock names who holds the lock. Null falls back to the label. */
    toolbarTooltip(action) {
        if (action.tooltip !== undefined)
            return action.tooltip;
        return action.id === 'app.toolbar.unlock' ? this.lockedByLabel() : null;
    }
    /** The highlighted padlock Web UI shows on a locked document. */
    isToolbarActionActive(action) {
        return action.id === 'app.toolbar.unlock' && this.isLocked();
    }
    lockedByLabel() {
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
    /**
     * The behaviour behind the packaged toolbar ids.
     *
     * Registered from the component because every handler closes over this
     * instance, and withdrawn on destroy for the same reason — a handler left
     * registered keeps a destroyed component reachable and the next invocation
     * runs against dead state. Withdrawing the registration rather than the ids
     * is what leaves a customer's handler for the same id untouched.
     *
     * The two halves of each toggle share one method, exactly as the single
     * `(click)` binding did before: which half is *offered* is the rules' job.
     */
    registerToolbarHandlers() {
        const handlers = {
            'app.toolbar.edit': () => this.onEditClick(),
            'app.toolbar.editProperties': () => this.onEditClick(),
            'app.toolbar.addToCollection': () => this.openAddToCollectionDialog(),
            'app.toolbar.delete': () => this.trashDocument(),
            'app.toolbar.lock': () => this.toggleLock(),
            'app.toolbar.unlock': () => this.toggleLock(),
            'app.toolbar.addToFavorites': () => this.toggleFavorite(),
            'app.toolbar.removeFromFavorites': () => this.toggleFavorite(),
            'app.toolbar.share': () => this.shareDocument(),
            'app.toolbar.publish': () => this.openPublishDialog(),
            'app.toolbar.subscribe': () => this.toggleSubscription(),
            'app.toolbar.unsubscribe': () => this.toggleSubscription(),
            'app.toolbar.addToClipboard': () => this.toggleClipboard(),
            'app.toolbar.removeFromClipboard': () => this.toggleClipboard(),
            'app.toolbar.export': () => this.exportDocument(),
            'app.toolbar.startProcess': () => this.openStartProcess(),
        };
        const registration = this.actionRegistry.registerPackaged(Object.fromEntries(Object.entries(handlers).map(([id, run]) => [id, { execute: () => run() }])));
        this.destroyRef.onDestroy(() => registration.unregister());
    }
    ngOnInit() {
        this.registerToolbarHandlers();
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const uid = params.get('uid');
            if (!uid) {
                this.errorStatus.set(404);
                this.error.set(this.translate.instant('document-detail.message.no-document-id-provided'));
                this.loading.set(false);
                return;
            }
            this.freshBlobDocument =
                this.route.snapshot.queryParamMap.get('fresh') === '1' ||
                    this.readFreshBlobNavigationState();
            this.freshNoteDocument = this.readFreshNoteNavigationState();
            this.resetState();
            this.releaseLockRequest();
            this.docUid = uid;
            this.loadVocabularies();
            this.loadDocument(uid);
        });
    }
    readFreshBlobNavigationState() {
        const fromCurrent = this.router.getCurrentNavigation()?.extras?.state;
        if (fromCurrent?.freshBlobDocument === true) {
            return true;
        }
        const historyState = history.state;
        return historyState?.freshBlobDocument === true;
    }
    readFreshNoteNavigationState() {
        const fromCurrent = this.router.getCurrentNavigation()?.extras?.state;
        if (fromCurrent?.freshNote === true) {
            return true;
        }
        const historyState = history.state;
        return historyState?.freshNote === true;
    }
    /** Pre-loads vocabulary data for metadata display and KE classification (live queries). */
    loadVocabularies() {
        this.directoryService
            .getEntries('nature')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.natureVocabulary.set(entries),
            error: () => this.natureVocabulary.set([]),
        });
        forkJoin({
            coverage: this.directoryService.getAllL10nEntries('l10ncoverage'),
            subjects: this.directoryService.getAllL10nEntries('l10nsubjects'),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ coverage, subjects }) => {
                this.coverageVocabulary.set(coverage);
                this.subjectVocabulary.set(subjects);
            },
            error: () => {
                this.coverageVocabulary.set([]);
                this.subjectVocabulary.set([]);
            },
        });
    }
    resetState() {
        this.metadataRefreshAttempt = 0;
        this.blobLoadGeneration += 1;
        // `resetViewerState()` above now revokes and clears `rawBlobUrl`, so the block that used to
        // repeat it here is gone. Two places doing the same cleanup is how they drift apart.
        this.resetViewerState();
        this.doc.set(null);
        this.blobUrl.set(null);
        this.blobLoading.set(false);
        this.arenderUrl.set(null);
        this.error.set(null);
        this.comments.set([]);
        this.panelActivity.set([]);
        this.panelActivityLoaded = false;
        this.actionInProgress.set(null);
        this.showStartProcessPanel.set(false);
        this.documentTasks.set([]);
        this.documentWorkflows.set([]);
        this.keActionInFlight.set(null);
        this.keStatus.set(null);
        this.keError.set(null);
        this.contentLakeIngestInFlight.set(false);
        this.contentLakeIngestStatus.set(null);
        this.contentLakeIngestError.set(null);
        this.contentLakePresenceVerified.set(false);
        this.contentLakePresenceChecking.set(false);
        this.panelSubTab.set('properties');
        this.permissionsTabLoaded = false;
        this.publishTabLoaded = false;
        this.historyShown.set(this.activeTabId() === 'app.tabs.history');
        // Not just the `publishTabLoaded` flag above: `loadPublishingData()` skips its own fetch
        // while this array is non-empty, so the previous document's entries would both show in the
        // side panel's count and keep Unpublish pointing at its proxies — indefinitely if the new
        // document's count request then failed.
        this.publishedDocs.set([]);
        this.publishLoading.set(false);
    }
    generateSummary() {
        if (!this.docUid)
            return;
        this.aiSummaryLoading.set(true);
        this.aiError.set(null);
        this.aiGateway.summarize(this.docUid).subscribe({
            next: (res) => {
                this.aiSummary.set(res);
                this.aiSummaryLoading.set(false);
            },
            error: (err) => {
                this.aiError.set(aiErrorMessage(err, this.translate.instant('document-detail.message.summary-generation-failed')));
                this.aiSummaryLoading.set(false);
            },
        });
    }
    suggestTags() {
        if (!this.docUid)
            return;
        this.aiTagsLoading.set(true);
        this.aiError.set(null);
        this.aiGateway.suggestTags(this.docUid).subscribe({
            next: (res) => {
                this.aiSuggestedTags.set(res.tags);
                this.aiTagsLoading.set(false);
            },
            error: (err) => {
                this.aiError.set(aiErrorMessage(err, this.translate.instant('document-detail.message.tag-suggestion-failed')));
                this.aiTagsLoading.set(false);
            },
        });
    }
    applyAiTag(tagLabel) {
        if (!this.docUid)
            return;
        this.tagService.addTag(this.docUid, tagLabel).subscribe({
            next: (labels) => {
                this.setTags(labels);
                this.aiSuggestedTags.update((tags) => tags.filter((t) => t.label !== tagLabel));
                this.toast.show(this.translate.instant('common.tag-applied', { name: tagLabel }));
            },
            error: () => this.toast.error(this.translate.instant('document-detail.message.failed-to-apply-tag')),
        });
    }
    /** Keeps the document's `nxtag:tags` in step with what Nuxeo answered to a tag change. */
    setTags(labels) {
        this.doc.update((d) => d && {
            ...d,
            properties: { ...d.properties, 'nxtag:tags': labels.map((label) => ({ label })) },
        });
    }
    classifyDocument() {
        if (!this.docUid)
            return;
        this.aiClassifyLoading.set(true);
        this.aiError.set(null);
        this.aiGateway.classify(this.docUid).subscribe({
            next: (res) => {
                this.aiClassification.set(res);
                this.aiClassifyLoading.set(false);
            },
            error: (err) => {
                this.aiError.set(aiErrorMessage(err, this.translate.instant('document-detail.message.classification-failed')));
                this.aiClassifyLoading.set(false);
            },
        });
    }
    findSimilar() {
        if (!this.docUid)
            return;
        this.aiSimilarLoading.set(true);
        this.aiError.set(null);
        this.aiGateway.findSimilar(this.docUid).subscribe({
            next: (res) => {
                this.aiSimilarDocs.set(res.documents);
                this.aiSimilarLoading.set(false);
            },
            error: (err) => {
                this.aiError.set(aiErrorMessage(err, this.translate.instant('document-detail.message.similar-doc-search-failed')));
                this.aiSimilarLoading.set(false);
            },
        });
    }
    runTextClassification() {
        const candidates = this.natureVocabulary().map((entry) => entry.id);
        if (candidates.length === 0) {
            const message = this.translate.instant('document-detail.message.classification-unavailable-vocabulary');
            this.keError.set(message);
            this.toast.error(message);
            return;
        }
        this.runKnowledgeEnrichment('text-classification', {
            actions: ['text-classification'],
            classes: candidates,
        });
    }
    runTextEntityExtraction() {
        this.runKnowledgeEnrichment('named-entity-recognition-text', {
            actions: ['named-entity-recognition-text'],
        });
    }
    runTextSummarization() {
        this.runKnowledgeEnrichment('text-summarization', {
            actions: ['text-summarization'],
            maxWordCount: 150,
        });
    }
    runImageEnrichment() {
        this.runKnowledgeEnrichment('image-enrichment', {
            actions: ['image-description', 'named-entity-recognition-image'],
            maxWordCount: 100,
        });
    }
    ingestToContentLake() {
        const uid = this.docUid;
        if (!uid || !this.canIngestToContentLake() || this.contentLakeIngestInFlight()) {
            return;
        }
        this.contentLakeIngestInFlight.set(true);
        this.contentLakeIngestError.set(null);
        this.contentLakeIngestStatus.set(null);
        this.contentLakeIngestService
            .startIngest([uid])
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((command) => this.contentLakeIngestService.waitUntilComplete(command.commandId)), switchMap((status) => this.contentLakeIngestService
            .markIngested([uid])
            .pipe(map((updatedDocs) => ({ status, updatedDoc: updatedDocs[0] ?? null })))), finalize(() => this.contentLakeIngestInFlight.set(false)))
            .subscribe({
            next: ({ status, updatedDoc }) => {
                if (status.error || status.errorCount > 0) {
                    const message = this.translate.instant('document-detail.message.content-lake-ingest-finished-with-errors', { count: status.errorCount });
                    this.contentLakeIngestError.set(message);
                    this.contentLakeIngestStatus.set(null);
                    this.toast.error(message);
                    return;
                }
                const message = this.translate.instant('document-detail.message.ingested-to-content-lake');
                this.contentLakeIngestStatus.set(message);
                this.contentLakePresenceVerified.set(true);
                if (updatedDoc) {
                    this.doc.set(updatedDoc);
                }
                else {
                    this.applyContentLakeIngestMarkerLocally();
                }
                this.toast.show(message);
            },
            error: (err) => {
                const message = err.message ||
                    this.translate.instant('document-detail.message.content-lake-ingest-failed');
                this.contentLakeIngestError.set(message);
                this.contentLakeIngestStatus.set(null);
                this.toast.error(message);
            },
        });
    }
    isKeActionRunning(action) {
        return this.keActionInFlight() === action;
    }
    navigateToDoc(uid) {
        void this.router.navigateByUrl(`/doc/${uid}`);
    }
    openAiAssistant() {
        this.aiChatService.openPanel({ docId: this.docUid ?? undefined, page: this.router.url });
    }
    analyzeCommentSentiment() {
        const allComments = this.comments();
        if (!allComments.length)
            return;
        this.aiSentimentLoading.set(true);
        this.aiSentimentMap.set({});
        this.aiThreadSummary.set(null);
        const payload = allComments.map((c) => ({ id: c.id, text: c.text }));
        this.aiGateway.analyzeSentiment(payload).subscribe({
            next: (res) => {
                const map = {};
                for (const item of res.sentiments) {
                    map[item.id] = item;
                }
                this.aiSentimentMap.set(map);
                this.aiThreadSummary.set(res.threadSummary);
                this.aiSentimentLoading.set(false);
            },
            error: () => {
                this.aiSentimentLoading.set(false);
            },
        });
    }
    runKnowledgeEnrichment(uiAction, request) {
        if (!this.docUid || this.keActionInFlight())
            return;
        this.keActionInFlight.set(uiAction);
        this.keError.set(null);
        this.keStatus.set(this.keStartMessage(uiAction));
        this.detailService
            .fetchBlob(this.docUid)
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((blob) => this.keClient.enrich(blob, {
            ...request,
            sourceId: this.docUid,
        })), switchMap((result) => this.persistKnowledgeEnrichment(uiAction, result)), finalize(() => this.keActionInFlight.set(null)))
            .subscribe({
            next: (updatedDoc) => {
                this.doc.set(updatedDoc);
                this.syncActionStates(updatedDoc);
                this.keStatus.set(this.keSuccessMessage(uiAction));
                this.toast.show(this.keSuccessMessage(uiAction));
            },
            error: (err) => {
                const message = this.resolveKnowledgeEnrichmentError(err, uiAction);
                this.keError.set(message);
                this.keStatus.set(null);
                this.toast.error(message);
            },
        });
    }
    persistKnowledgeEnrichment(uiAction, result) {
        const docId = this.docUid;
        const propertyUpdates = {};
        let tagsToApply = [];
        switch (uiAction) {
            case 'text-classification': {
                const category = result.textClassification?.result?.trim();
                const vocabularySize = this.natureVocabulary().length;
                if (!category) {
                    console.warn('[KE] text-classification returned no category', result);
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-no-category'));
                }
                if (category === KE_NO_MATCH_SENTINEL) {
                    console.warn(`[KE] text-classification: no match against ${vocabularySize} candidate(s)`, { candidates: this.natureVocabulary().map((entry) => entry.id), result });
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-no-category-match', {
                        count: vocabularySize,
                    }));
                }
                // Map back to a vocabulary id. Accept either the id or the display label
                // (the LLM occasionally returns the human-readable label rather than the id).
                const resolvedId = this.resolveNatureVocabularyId(category);
                if (!resolvedId) {
                    console.warn(`[KE] text-classification: "${category}" is not in the nature vocabulary`, {
                        candidates: this.natureVocabulary().map((entry) => entry.id),
                        result,
                    });
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-category-not-in-vocabulary', {
                        category,
                        count: vocabularySize,
                    }));
                }
                propertyUpdates['dc:nature'] = resolvedId;
                break;
            }
            case 'text-summarization': {
                const summary = result.textSummary?.result?.trim();
                if (!summary) {
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-no-summary'));
                }
                propertyUpdates['dc:description'] = summary;
                break;
            }
            case 'named-entity-recognition-text': {
                tagsToApply = this.collectNamedEntityTags(result.namedEntityText?.result);
                if (tagsToApply.length === 0) {
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-no-text-entities'));
                }
                break;
            }
            case 'image-enrichment': {
                const description = result.imageDescription?.result?.trim();
                tagsToApply = this.collectNamedEntityTags(result.namedEntityImage?.result);
                if (description) {
                    propertyUpdates['dc:description'] = description;
                }
                if (Object.keys(propertyUpdates).length === 0 && tagsToApply.length === 0) {
                    return this.throwKeResultError(this.translate.instant('document-detail.message.ke-no-image-result'));
                }
                break;
            }
        }
        const existingTags = new Set(this.tags().map((tag) => tag.toLowerCase()));
        const uniqueTags = tagsToApply.filter((tag) => !existingTags.has(tag.toLowerCase()));
        const update$ = Object.keys(propertyUpdates).length > 0
            ? this.browseService.updateDocument(docId, propertyUpdates)
            : of(null);
        const tags$ = uniqueTags.length > 0
            ? forkJoin(uniqueTags.map((tag) => this.tagService.addTag(docId, tag)))
            : of([]);
        return forkJoin({ updated: update$, tags: tags$ }).pipe(switchMap(() => this.detailService.getFullDocument(docId)));
    }
    /**
     * Maps a KE classification result back to a Nuxeo `nature` vocabulary id.
     * Accepts a match against either `id` or `displayLabel` (case-insensitive) since
     * the LLM sometimes returns the human-readable label.
     */
    resolveNatureVocabularyId(value) {
        const needle = value.trim().toLowerCase();
        if (!needle)
            return null;
        const match = this.natureVocabulary().find((entry) => entry.id.toLowerCase() === needle || entry.displayLabel.toLowerCase() === needle);
        return match?.id ?? null;
    }
    collectNamedEntityTags(entityMap) {
        if (!entityMap)
            return [];
        const values = Object.values(entityMap).flatMap((entries) => entries ?? []);
        return Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));
    }
    keStartMessage(action) {
        return this.translate.instant(KE_MESSAGE_KEYS[action].start);
    }
    keSuccessMessage(action) {
        return this.translate.instant(KE_MESSAGE_KEYS[action].success);
    }
    resolveKnowledgeEnrichmentError(error, action) {
        const fallback = this.translate.instant(KE_MESSAGE_KEYS[action].failed);
        if (error instanceof KeEnrichmentError && error.messageKey) {
            return this.translate.instant(error.messageKey, error.messageParams);
        }
        if (error instanceof Error && error.message) {
            if (error.message.includes('No authentication info for calling the Enrichment service')) {
                return this.translate.instant('document-detail.message.ke-not-configured');
            }
            return error.message;
        }
        const maybeMessage = error?.error
            ?.message;
        if (maybeMessage?.includes('No authentication info for calling the Enrichment service')) {
            return this.translate.instant('document-detail.message.ke-not-configured');
        }
        return maybeMessage ?? error?.message ?? fallback;
    }
    throwKeResultError(message) {
        return new Observable((subscriber) => {
            subscriber.error(new Error(message));
        });
    }
    ngOnDestroy() {
        // Leaving the last viewed document in the context would let a rule on
        // another page answer about a document the user is no longer looking at.
        this.extensionRuleContext.document.set(null);
        this.extensionRuleContext.flags.set({});
        const raw = this.rawBlobUrl();
        if (raw) {
            URL.revokeObjectURL(raw);
        }
        for (const url of this.videoObjectUrls) {
            URL.revokeObjectURL(url);
        }
        this.revokeStoryboardObjectUrls();
    }
    maybeBackfillContentLakeMarker(doc) {
        // The backfill writes the marker to the document, and a version is read-only.
        if (doc.isVersion)
            return;
        if (!shouldProbeContentLakeIngestStatus(doc)) {
            if (isContentLakeIngestCurrent(doc)) {
                this.contentLakePresenceVerified.set(true);
            }
            return;
        }
        this.contentLakePresenceChecking.set(true);
        this.kdClient
            .listIngestSourceIds()
            .pipe(switchMap((sourceIds) => this.contentLakeIngestService.backfillIngestMarkerIfNeeded(doc, sourceIds)), finalize(() => this.contentLakePresenceChecking.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
            if (result.presentInContentLake) {
                this.contentLakePresenceVerified.set(true);
            }
            if (result.doc && this.doc()?.uid === result.doc.uid) {
                this.doc.set(result.doc);
            }
        });
    }
    applyContentLakeIngestMarkerLocally() {
        const doc = this.doc();
        if (!doc) {
            return;
        }
        const digest = readBlobDigest(doc);
        const writeProperty = resolveIngestMarkerWriteProperty(doc);
        if (!digest || !writeProperty) {
            return;
        }
        this.doc.set({
            ...doc,
            properties: {
                ...doc.properties,
                [writeProperty]: buildContentLakeIngestMarker(digest),
            },
        });
    }
    loadDocument(uid) {
        const generation = ++this.documentLoadGeneration;
        const isCurrent = () => generation === this.documentLoadGeneration && uid === this.docUid;
        this.loading.set(true);
        this.error.set(null);
        this.detailService
            .getFullDocument(uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (!isCurrent())
                    return;
                if (isCollectionDocument(doc)) {
                    void this.router.navigate(['/collections', doc.uid], { replaceUrl: true });
                    return;
                }
                if (isFolderishDocument(doc) && doc.path) {
                    this.browseContext.setFromDocument(doc);
                    void this.router.navigateByUrl(this.browseUrlForPath(doc.path), { replaceUrl: true });
                    return;
                }
                this.doc.set(doc);
                this.browseContext.setFromDocument(doc);
                this.syncActionStates(doc);
                this.loading.set(false);
                if (this.activeTabId() === 'app.tabs.permissions') {
                    this.reloadDocumentPermissions();
                }
                if (this.panelSubTab() === 'activity' && !this.panelActivityLoaded) {
                    this.loadPanelActivity();
                }
                this.loadBlob(doc);
                if (this.freshNoteDocument && documentTypeTraits(doc.type).view === 'noteEditor') {
                    this.focusNoteEditor.set(true);
                    this.freshNoteDocument = false;
                }
                this.scheduleMetadataRefreshIfNeeded(doc);
                this.loadPublicationCount(uid);
                this.loadDocumentTasks(uid);
                this.loadDocumentWorkflows(uid);
                this.loadARenderUrl(doc);
                this.maybeBackfillContentLakeMarker(doc);
            },
            error: (err) => {
                if (!isCurrent())
                    return;
                this.errorStatus.set(nxsErrorStatus(err));
                this.error.set(this.translate.instant('document-detail.message.failed-to-load-document'));
                this.loading.set(false);
            },
        });
    }
    /* ─── Workflow / Task methods ─── */
    loadDocumentTasks(uid) {
        this.documentTasksLoading.set(true);
        const generation = this.documentLoadGeneration;
        const userId = this.currentUsername() ?? 'Administrator';
        this.taskService.getDocumentTasks(uid, userId).subscribe({
            next: (tasks) => {
                if (uid !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                this.documentTasks.set(tasks);
                this.documentTasksLoading.set(false);
            },
            error: () => {
                if (uid === this.docUid && generation === this.documentLoadGeneration) {
                    this.documentTasksLoading.set(false);
                }
            },
        });
    }
    loadDocumentWorkflows(uid) {
        // A late answer for the document the route left would put its workflow banner, and
        // its Abandon button, on the page now showing another — a version, say.
        const generation = this.documentLoadGeneration;
        this.workflowService.getDocumentWorkflows(uid).subscribe({
            next: (wfs) => {
                if (uid === this.docUid && generation === this.documentLoadGeneration) {
                    this.documentWorkflows.set(wfs);
                }
            },
            error: () => {
                if (uid === this.docUid && generation === this.documentLoadGeneration) {
                    this.documentWorkflows.set([]);
                }
            },
        });
    }
    abandonWorkflow(wf) {
        this.abandoningWorkflow.set(true);
        this.workflowService.cancelWorkflow(wf.id).subscribe({
            next: () => {
                this.abandoningWorkflow.set(false);
                this.toast.show(this.translate.instant('document-detail.message.workflow-abandoned'));
                this.loadDocumentWorkflows(this.docUid);
                this.loadDocumentTasks(this.docUid);
            },
            error: () => {
                this.abandoningWorkflow.set(false);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-abandon-workflow'));
            },
        });
    }
    taskDueLabel(task) {
        if (!task.dueDate)
            return '';
        const d = new Date(task.dueDate);
        return d.toLocaleDateString(this.locale, { month: 'long', day: 'numeric', year: 'numeric' });
    }
    openStartProcess() {
        const requestedFor = this.docUid;
        const generation = this.documentLoadGeneration;
        this.showStartProcessPanel.set(true);
        this.workflowsLoading.set(true);
        this.detailService.getRunnableWorkflows(requestedFor).subscribe({
            next: (models) => {
                if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                this.availableWorkflows.set(models);
                this.workflowsLoading.set(false);
            },
            error: () => {
                if (requestedFor === this.docUid && generation === this.documentLoadGeneration) {
                    this.availableWorkflows.set([]);
                    this.workflowsLoading.set(false);
                }
            },
        });
    }
    closeStartProcess() {
        this.showStartProcessPanel.set(false);
        this.selectedWorkflowModel.set('');
    }
    startProcess() {
        const model = this.selectedWorkflowModel();
        if (!model)
            return;
        this.startingWorkflow.set(true);
        this.workflowService.startWorkflow(this.docUid, model).subscribe({
            next: () => {
                this.startingWorkflow.set(false);
                this.closeStartProcess();
                this.toast.show(this.translate.instant('document-detail.message.workflow-started-successfully'));
                this.loadDocumentTasks(this.docUid);
                this.loadDocumentWorkflows(this.docUid);
            },
            error: () => {
                this.startingWorkflow.set(false);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-start-workflow'));
            },
        });
    }
    goToTask(task) {
        void this.router.navigateByUrl('/tasks/' + task.id);
    }
    taskLabel(task) {
        const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\./g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    /** Turn "ParallelDocumentReview" or "wf.x.Y" into "Parallel Document Review" */
    workflowDisplayName(wf) {
        // Use workflowModelName or name — the title is an i18n key (wf.x.Y)
        const raw = (wf.workflowModelName ?? wf.name) || wf.title;
        // If it looks like an i18n key, strip the prefix
        const cleaned = raw.startsWith('wf.') ? raw.replace(/^wf\.\w+\./, '') : raw;
        return cleaned
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    syncActionStates(doc) {
        this.isLocked.set(!!(doc.lockOwner || doc.lockCreated));
        this.lockOwner.set(doc.lockOwner ?? null);
        this.lockCreated.set(doc.lockCreated ?? null);
        this.isFavorite.set(doc.contextParameters?.favorites?.isFavorite ?? false);
        const subs = doc.contextParameters?.subscribedNotifications;
        this.isSubscribed.set(Array.isArray(subs) && subs.length > 0);
    }
    loadBlob(doc) {
        const generation = ++this.blobLoadGeneration;
        this.resetViewerState();
        this.blobLoading.set(true);
        const noteText = doc.properties['note:note'];
        const noteMime = doc.properties['note:mime_type'];
        if (noteText !== undefined && noteText !== null) {
            this.noteContent.set(noteText);
            if (noteMime === 'text/markdown') {
                const rawHtml = this.renderMarkdown(noteText);
                this.noteHtml.set(renderTrustedHtml(this.sanitizer, rawHtml, { ADD_ATTR: ['target'] }));
            }
            this.blobLoading.set(false);
            return;
        }
        const picViews = doc.properties['picture:views'];
        if (picViews?.length) {
            this.extractPictureMetadata(doc, picViews);
        }
        const transcodedVideos = doc.properties['vid:transcodedVideos'];
        if (transcodedVideos && transcodedVideos.length > 0) {
            this.loadVideoSources(doc, transcodedVideos, generation);
            this.extractVideoInfo(doc);
            return;
        }
        const traits = documentTypeTraits(doc.type);
        const fc = doc.properties['file:content'];
        if (!fc) {
            if (traits.picture) {
                this.fetchMainBlob(doc, generation);
                return;
            }
            if (traits.preview) {
                this.loadPreviewFallback(doc);
            }
            else {
                this.blobLoading.set(false);
            }
            return;
        }
        const mime = this.resolveMainContentMime(fc, doc);
        if (traits.picture || (picViews?.length && !mime)) {
            this.fetchMainBlob(doc, generation);
            return;
        }
        if (mime.startsWith('video/')) {
            this.fetchMainBlob(doc, generation);
            this.loadStoryboard(doc);
            this.extractVideoInfo(doc);
            return;
        }
        if (mime.startsWith('audio/') || mime.startsWith('image/') || mime === 'application/pdf') {
            this.fetchMainBlob(doc, generation);
            return;
        }
        if (mime.startsWith('text/') || mime === 'application/json') {
            this.detailService
                .fetchBlob(doc.uid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (blob) => {
                    if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                        return;
                    void blob.text().then((text) => this.noteContent.set(text));
                    this.blobLoading.set(false);
                    this.freshBlobDocument = false;
                },
                error: () => {
                    if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                        return;
                    this.loadPreviewFallback(doc);
                },
            });
            return;
        }
        const renditions = (doc.contextParameters?.['renditions'] ?? []);
        if (renditions.some((r) => r.name === 'pdf')) {
            this.hasPdfRendition.set(true);
            this.detailService
                .fetchPdfRendition(doc.uid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (blob) => {
                    if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                        return;
                    this.setBlobUrl(blob);
                    this.blobLoading.set(false);
                    this.freshBlobDocument = false;
                },
                error: () => {
                    if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                        return;
                    this.loadPreviewFallback(doc);
                },
            });
            return;
        }
        if (isBlobHoldingDocType(doc.type) && this.hasFileContentBlob(fc)) {
            this.fetchMainBlob(doc, generation);
            return;
        }
        this.loadPreviewFallback(doc);
    }
    resolveMainContentMime(fc, doc) {
        const mime = fc?.['mime-type'] ?? '';
        if (mime)
            return mime;
        const fileName = fc?.['name'] ?? doc.title ?? '';
        return this.mimeTypeFromFileName(fileName);
    }
    mimeTypeFromFileName(fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        return MIME_BY_EXTENSION[ext] ?? '';
    }
    hasFileContentBlob(fc) {
        return !!(fc['digest'] ||
            fc['data'] ||
            (typeof fc['name'] === 'string' && fc['name'].length > 0) ||
            Number(fc['length'] ?? 0) > 0);
    }
    fetchMainBlob(doc, generation, attempt = 0) {
        const maxAttempts = this.freshBlobDocument || isBlobHoldingDocType(doc.type) ? 8 : 1;
        this.detailService
            .fetchBlob(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                    return;
                this.setBlobUrl(blob);
                this.blobLoading.set(false);
                this.freshBlobDocument = false;
                this.clearFreshUploadQueryParam();
            },
            error: () => {
                if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                    return;
                if (attempt + 1 < maxAttempts) {
                    timer(400)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe(() => {
                        if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                            return;
                        this.fetchMainBlob(doc, generation, attempt + 1);
                    });
                    return;
                }
                this.freshBlobDocument = false;
                this.loadPreviewFallback(doc);
            },
        });
    }
    clearFreshUploadQueryParam() {
        if (this.route.snapshot.queryParamMap.get('fresh') !== '1')
            return;
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { fresh: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
    /**
     * Nuxeo may return partially hydrated Picture metadata immediately after create/import.
     * Poll briefly and merge metadata without resetting an already-visible preview.
     */
    scheduleMetadataRefreshIfNeeded(doc) {
        if (!this.documentMetadataIncomplete(doc))
            return;
        const uid = doc.uid;
        const maxAttempts = 6;
        const poll = () => {
            if (uid !== this.docUid || this.metadataRefreshAttempt >= maxAttempts)
                return;
            this.metadataRefreshAttempt += 1;
            timer(500)
                .pipe(takeUntilDestroyed(this.destroyRef), switchMap(() => this.detailService.getFullDocument(uid)))
                .subscribe({
                next: (refetched) => {
                    if (uid !== this.docUid)
                        return;
                    this.syncDocumentMetadataFromRefetch(refetched);
                    if (this.documentMetadataIncomplete(refetched) &&
                        this.metadataRefreshAttempt < maxAttempts) {
                        poll();
                    }
                },
                error: () => {
                    // Stop polling on transient failures; preview may already be visible.
                },
            });
        };
        poll();
    }
    syncDocumentMetadataFromRefetch(doc) {
        this.doc.set(doc);
        const picViews = doc.properties['picture:views'];
        if (picViews?.length) {
            this.extractPictureMetadata(doc, picViews);
        }
        this.extractVideoInfo(doc);
        const transcodedVideos = doc.properties['vid:transcodedVideos'];
        if (transcodedVideos?.length && this.videoSources().length === 0 && !this.blobUrl()) {
            this.loadVideoSources(doc, transcodedVideos, this.blobLoadGeneration);
        }
        if (this.storyboard().length === 0) {
            this.loadStoryboard(doc);
        }
        if (!this.blobUrl() && this.videoSources().length === 0) {
            this.fetchMainBlob(doc, this.blobLoadGeneration);
        }
    }
    documentMetadataIncomplete(doc) {
        const traits = documentTypeTraits(doc.type);
        if (traits.picture) {
            return this.pictureMetadataIncomplete(doc);
        }
        if (traits.video) {
            return this.videoDocumentMetadataIncomplete(doc);
        }
        if (this.hasVideoContent(doc)) {
            return this.videoInfoIncomplete(doc);
        }
        return false;
    }
    hasVideoContent(doc) {
        if (documentTypeTraits(doc.type).video) {
            return true;
        }
        const fc = doc.properties['file:content'];
        return this.resolveMainContentMime(fc, doc).startsWith('video/');
    }
    videoDocumentMetadataIncomplete(doc) {
        return this.videoInfoIncomplete(doc) || this.storyboardIncomplete(doc);
    }
    videoInfoIncomplete(doc) {
        if (this.videoInfo()) {
            return false;
        }
        const raw = doc.properties['vid:info'];
        if (!raw) {
            // File attachments with video MIME never receive vid:info from Nuxeo.
            return documentTypeTraits(doc.type).video;
        }
        return !Object.values(raw).some((value) => value !== null && value !== undefined && String(value).trim() !== '');
    }
    storyboardIncomplete(doc) {
        if (this.storyboard().length > 0) {
            return false;
        }
        // File documents with a video attachment do not get server-side storyboards.
        if (!documentTypeTraits(doc.type).video) {
            return false;
        }
        const sb = doc.properties['vid:storyboard'];
        return !sb || sb.length === 0;
    }
    pictureMetadataIncomplete(doc) {
        const info = doc.properties['picture:info'];
        const views = doc.properties['picture:views'];
        if (!info || !views?.length) {
            return true;
        }
        const width = Number(info['width'] ?? 0);
        const height = Number(info['height'] ?? 0);
        if (width <= 0 || height <= 0) {
            return true;
        }
        return !views.some((view) => {
            const title = view['title'] ?? '';
            const viewWidth = Number(view['width'] ?? 0);
            return ((title === 'FullHD' || title === 'OriginalJpeg' || title === 'Medium') && viewWidth > 200);
        });
    }
    loadVideoSources(doc, transcodedVideos, generation) {
        const entries = this.collectTranscodedVideoEntries(transcodedVideos);
        if (entries.length === 0) {
            this.fetchMainBlob(doc, generation);
            this.loadStoryboard(doc, generation);
            return;
        }
        this.fetchPreferredVideoSource(doc, entries, generation, 0);
    }
    collectTranscodedVideoEntries(transcodedVideos) {
        const entries = [];
        for (const tv of transcodedVideos) {
            const content = tv['content'];
            const dataUrl = content?.['data'] ?? '';
            const tvMime = content?.['mime-type'] ?? 'video/mp4';
            const label = tv['name'] ?? '';
            if (dataUrl && tvMime.startsWith('video/')) {
                entries.push({ dataUrl, mimeType: tvMime, label });
            }
        }
        return entries.sort((left, right) => {
            const leftScore = left.mimeType.includes('mp4') ? 0 : 1;
            const rightScore = right.mimeType.includes('mp4') ? 0 : 1;
            return leftScore - rightScore;
        });
    }
    fetchPreferredVideoSource(doc, entries, generation, index) {
        if (index >= entries.length) {
            this.fetchMainBlob(doc, generation);
            this.loadStoryboard(doc, generation);
            return;
        }
        const entry = entries[index];
        this.http
            .get(this.resolveNuxeoBlobRequestUrl(entry.dataUrl), { responseType: 'blob' })
            .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
            .subscribe((blob) => {
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) {
                return;
            }
            if (!blob) {
                this.fetchPreferredVideoSource(doc, entries, generation, index + 1);
                return;
            }
            const rawUrl = URL.createObjectURL(blob);
            this.videoObjectUrls.push(rawUrl);
            // Raw string, no bypass: this feeds `<source [src]>`, which is SecurityContext.NONE, so a
            // SafeResourceUrl is never unwrapped and stringifies into the attribute instead. The
            // transcoded-video source list was broken that way until this was unwrapped.
            this.videoSources.set([
                {
                    url: rawUrl,
                    mimeType: entry.mimeType,
                    label: entry.label,
                },
            ]);
            this.blobLoading.set(false);
            this.loadStoryboard(doc, generation);
        });
    }
    /**
     * Nuxeo blob `data` URLs from REST responses are often absolute (e.g. :8080). Rewrite to the
     * proxied `/nuxeo/...` path so HttpClient + the auth interceptor can fetch them.
     */
    resolveNuxeoBlobRequestUrl(dataUrl) {
        if (dataUrl.startsWith('/nuxeo/')) {
            return dataUrl;
        }
        try {
            const url = new URL(dataUrl, window.location.origin);
            const nuxeoIdx = url.pathname.indexOf('/nuxeo/');
            if (nuxeoIdx >= 0) {
                return `${url.pathname.slice(nuxeoIdx)}${url.search}`;
            }
        }
        catch {
            // Fall through to returning the original URL.
        }
        return dataUrl;
    }
    loadStoryboard(doc, generation = this.blobLoadGeneration) {
        // Several callers race for one video: `loadBlob` asks, and `setBlobUrl` asks
        // again from inside the `fetchMainBlob` it just started. Against a real server
        // the first request has not answered when the second arrives, so `storyboard()`
        // is still empty and every frame was fetched twice.
        if (this.storyboard().length > 0 || this.storyboardInFlight) {
            return;
        }
        const sb = doc.properties['vid:storyboard'];
        if (sb?.length) {
            this.storyboardInFlight = true;
            this.loadServerStoryboard(doc, sb, generation);
            return;
        }
        const videoObjectUrl = this.rawBlobUrl() ?? this.videoObjectUrls[0] ?? null;
        if (videoObjectUrl && this.mimeType().startsWith('video/')) {
            this.storyboardInFlight = true;
            void this.generateClientStoryboard(videoObjectUrl, generation).finally(() => this.releaseStoryboardGuard(doc, generation));
        }
    }
    /**
     * Release the in-flight guard only for the load that still owns it.
     *
     * A response for a previously-viewed document arrives after the next load has taken
     * the guard, and clearing it there lets the next caller start the duplicate fetch the
     * guard was added to prevent — `storyboard()` is still empty, so it is no barrier.
     */
    releaseStoryboardGuard(doc, generation) {
        if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) {
            return;
        }
        this.storyboardInFlight = false;
    }
    loadServerStoryboard(doc, sb, generation) {
        const entries = sb.map((entry, index) => ({
            index,
            timecode: Number(entry['timecode'] ?? 0),
            thumbUrl: this.resolveStoryboardThumbnailUrl(entry['content']),
            label: entry['comment'] ?? '',
        }));
        forkJoin(entries.map((entry) => this.fetchStoryboardThumbnailBlob(doc.uid, entry.index, entry.thumbUrl).pipe(map((blob) => ({ entry, blob })), catchError(() => of(null)))))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((results) => {
            this.releaseStoryboardGuard(doc, generation);
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) {
                return;
            }
            const items = [];
            for (const result of results) {
                if (!result) {
                    continue;
                }
                const rawUrl = URL.createObjectURL(result.blob);
                this.storyboardObjectUrls.push(rawUrl);
                items.push({
                    timecode: result.entry.timecode,
                    thumbnailUrl: rawUrl,
                    label: result.entry.label,
                });
            }
            if (items.length > 0) {
                this.storyboard.set(items);
                return;
            }
            const videoObjectUrl = this.rawBlobUrl() ?? this.videoObjectUrls[0] ?? null;
            if (videoObjectUrl && this.mimeType().startsWith('video/')) {
                void this.generateClientStoryboard(videoObjectUrl, generation);
            }
        });
    }
    fetchStoryboardThumbnailBlob(uid, index, dataUrl) {
        return this.detailService.fetchBlobByXpath(uid, `vid:storyboard/${index}/content`).pipe(catchError(() => {
            if (!dataUrl) {
                return throwError(() => new Error('Storyboard thumbnail URL missing'));
            }
            return this.http.get(this.resolveNuxeoBlobRequestUrl(dataUrl), { responseType: 'blob' });
        }));
    }
    /** Generate evenly spaced preview frames when Nuxeo has no `vid:storyboard` (e.g. File + .mp4). */
    async generateClientStoryboard(videoObjectUrl, generation) {
        if (generation !== this.blobLoadGeneration || this.storyboard().length > 0) {
            return;
        }
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = videoObjectUrl;
        try {
            await new Promise((resolve, reject) => {
                const onLoaded = () => {
                    video.removeEventListener('loadedmetadata', onLoaded);
                    video.removeEventListener('error', onError);
                    resolve();
                };
                const onError = () => {
                    video.removeEventListener('loadedmetadata', onLoaded);
                    video.removeEventListener('error', onError);
                    reject(new Error('Failed to load video for storyboard generation'));
                };
                video.addEventListener('loadedmetadata', onLoaded);
                video.addEventListener('error', onError);
                video.load();
                // Storyboard thumbnails are optional; a metadata load failure leaves the strip empty.
            }).catch(() => undefined);
            if (generation !== this.blobLoadGeneration || this.storyboard().length > 0) {
                return;
            }
            const duration = video.duration;
            if (!Number.isFinite(duration) || duration <= 0) {
                return;
            }
            const frameCount = Math.min(10, Math.max(4, Math.ceil(duration)));
            const timecodes = frameCount === 1
                ? [0]
                : Array.from({ length: frameCount }, (_, index) => (duration * index) / (frameCount - 1));
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                return;
            }
            const items = [];
            for (const timecode of timecodes) {
                if (generation !== this.blobLoadGeneration) {
                    return;
                }
                await this.seekVideoForStoryboard(video, timecode);
                if (generation !== this.blobLoadGeneration) {
                    return;
                }
                if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                    continue;
                }
                canvas.width = video.videoWidth || 320;
                canvas.height = video.videoHeight || 180;
                try {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                catch {
                    continue;
                }
                const blob = await new Promise((resolve) => canvas.toBlob((value) => resolve(value), 'image/jpeg', 0.75));
                if (generation !== this.blobLoadGeneration) {
                    return;
                }
                if (!blob) {
                    continue;
                }
                const rawUrl = URL.createObjectURL(blob);
                this.storyboardObjectUrls.push(rawUrl);
                items.push({
                    timecode,
                    thumbnailUrl: rawUrl,
                    label: this.formatStoryboardTimecode(timecode),
                });
            }
            if (generation === this.blobLoadGeneration && items.length > 0) {
                this.storyboard.set(items);
            }
        }
        finally {
            video.removeAttribute('src');
            video.load();
        }
    }
    seekVideoForStoryboard(video, timecode) {
        if (Math.abs(video.currentTime - timecode) < 0.01) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(timeoutId);
                video.removeEventListener('seeked', onSeeked);
                video.removeEventListener('error', onError);
                resolve();
            };
            const onSeeked = () => finish();
            const onError = () => finish();
            const timeoutId = setTimeout(finish, 5000);
            video.addEventListener('seeked', onSeeked);
            video.addEventListener('error', onError);
            video.currentTime = timecode;
        });
    }
    formatStoryboardTimecode(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    /** Web UI prefers `content.viewUrl`, then falls back to `content.data`. */
    resolveStoryboardThumbnailUrl(content) {
        if (!content) {
            return '';
        }
        const viewUrl = String(content['viewUrl'] ?? '').trim();
        if (viewUrl) {
            return viewUrl;
        }
        return String(content['data'] ?? '').trim();
    }
    revokeStoryboardObjectUrls() {
        for (const url of this.storyboardObjectUrls) {
            URL.revokeObjectURL(url);
        }
        this.storyboardObjectUrls = [];
    }
    extractVideoInfo(doc) {
        const raw = doc.properties['vid:info'];
        if (!raw)
            return;
        const parseNum = (value) => {
            const n = Number(value);
            return Number.isFinite(n) ? n : undefined;
        };
        const parseStr = (value) => {
            if (value === null || value === undefined)
                return undefined;
            const s = String(value).trim();
            return s || undefined;
        };
        const info = {
            duration: parseNum(raw['duration']),
            width: parseNum(raw['width']),
            height: parseNum(raw['height']),
            format: parseStr(raw['format']),
            videoCodec: parseStr(raw['videoCodec']),
            audioCodec: parseStr(raw['audioCodec']),
            frameRate: parseNum(raw['frameRate']),
        };
        if (Object.values(info).some((v) => v !== undefined)) {
            this.videoInfo.set(info);
        }
    }
    loadFallbackBlob(doc, generation = this.blobLoadGeneration) {
        this.detailService
            .fetchBlob(doc.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                    return;
                this.setBlobUrl(blob);
                this.blobLoading.set(false);
                this.freshBlobDocument = false;
            },
            error: () => {
                if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid)
                    return;
                this.loadPreviewFallback(doc);
            },
        });
    }
    loadPreviewFallback(doc) {
        const previewCtx = doc.contextParameters?.['preview'];
        // This URL comes from the Nuxeo REST response, so it is server-supplied rather than built here,
        // and it is bypassed and loaded into an iframe. Constrain it to the repository we are already
        // talking to: either same-origin — which is how it arrives behind the dev proxy, where
        // NUXEO_API_ORIGIN is '' — or the configured Nuxeo origin. Anything else is dropped, and the
        // viewer falls through to its "Preview not available" placeholder.
        //
        // `allowInsecure` covers dev mode OR an application already served over plaintext. Gating it on
        // `isDevMode()` alone silently removed the preview fallback from any production build served
        // over `http://` — an ordinary on-prem deployment — because the URL is same-origin and so
        // necessarily `http:` too. An iframe is only a downgrade relative to its host document; where
        // the host is already plaintext there is nothing to downgrade, and the origin allow-list below
        // is what actually constrains where it can point.
        //
        // Through `insecureAllowedForHost` rather than the inline `isDevMode() || hostIsInsecure` this
        // reasoning was first written as. That expression was correct here and duplicated nowhere else,
        // which is exactly how the two ARender sites ended up with a stricter answer to the same question.
        const safe = navigableUrlOrNull(previewCtx?.url, {
            base: window.location.origin,
            allowedOrigins: [window.location.origin, originOf(this.nuxeoApiOrigin)],
            allowInsecure: insecureAllowedForHost(isDevMode()),
        });
        if (safe) {
            this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(safe));
        }
        this.blobLoading.set(false);
        this.freshBlobDocument = false;
    }
    resetViewerState() {
        this.blobUrl.set(null);
        // `rawBlobUrl` belongs here, beside `blobUrl`, not only in `resetState`.
        //
        // `loadBlob` calls this on its own, so the two viewer inputs could disagree: `blobUrl` null
        // while `rawBlobUrl` still held the *previous* document's object URL. That is not inert. If the
        // blob fetch then falls through to `loadPreviewFallback`, `previewUrl` is set, so
        // `contentType()` gets past its "nothing to show" guard and dispatches on MIME — and for
        // `audio/*` the template binds `<audio [src]="rawBlobUrl()">`, rendering the old document's
        // audio under the new document's title.
        this.revokeRawBlobUrl();
        this.noteContent.set(null);
        this.noteHtml.set(null);
        this.noteSaving.set(false);
        this.focusNoteEditor.set(false);
        this.videoSources.set([]);
        this.storyboard.set([]);
        this.posterUrl.set(null);
        this.hasPdfRendition.set(false);
        this.previewUrl.set(null);
        this.pictureInfo.set(null);
        this.pictureViews.set([]);
        this.exifData.set(null);
        this.iptcData.set(null);
        this.videoInfo.set(null);
        this.storyboardInFlight = false;
        this.revokeStoryboardObjectUrls();
        for (const url of this.videoObjectUrls) {
            URL.revokeObjectURL(url);
        }
        this.videoObjectUrls = [];
    }
    extractPictureMetadata(doc, picViews) {
        const info = doc.properties['picture:info'];
        if (info) {
            const width = Number(info['width'] ?? 0);
            const height = Number(info['height'] ?? 0);
            if (width > 0 && height > 0) {
                const weight = Number(info['weight'] ?? 0);
                this.pictureInfo.set({
                    width,
                    height,
                    format: info['format'] ?? '',
                    colorSpace: info['colorSpace'] ?? '',
                    depth: Number(info['depth'] ?? 0),
                    weight: this.formatBytes(weight),
                });
            }
        }
        const views = picViews.map((v) => {
            const content = v['content'];
            const len = Number(content?.['length'] ?? 0);
            return {
                title: v['title'] ?? '',
                width: Number(v['width'] ?? 0),
                height: Number(v['height'] ?? 0),
                fileSize: this.formatBytes(len),
                format: (content?.['mime-type'] ?? '').replace('image/', '').toUpperCase(),
                downloadUrl: content?.['data'] ?? '',
            };
        });
        this.pictureViews.set(views);
        const imd = doc.properties['imd:image_description'];
        const exif = {};
        const dateOrig = doc.properties['imd:date_time_original'];
        if (dateOrig)
            exif.dateTimeOriginal = dateOrig;
        const orient = doc.properties['imd:orientation'];
        if (orient)
            exif.orientation = orient;
        const fNum = doc.properties['imd:fnumber'];
        if (fNum)
            exif.fNumber = `f/${fNum}`;
        const exposure = doc.properties['imd:exposure_time'];
        if (exposure)
            exif.exposureTime = String(exposure);
        const iso = doc.properties['imd:iso_speed_ratings'];
        if (iso)
            exif.isoSpeedRatings = String(iso);
        const focal = doc.properties['imd:focal_length'];
        if (focal)
            exif.focalLength = `${focal}mm`;
        if (Object.keys(exif).length > 0) {
            this.exifData.set(exif);
        }
        const iptc = {};
        const copyright = doc.properties['iptc:copyright'];
        if (copyright)
            iptc.copyright = copyright;
        const rights = doc.properties['iptc:rights'];
        if (rights)
            iptc.rights = rights;
        const source = doc.properties['iptc:source'];
        if (source)
            iptc.source = source;
        const desc = imd ?? doc.properties['iptc:description'];
        if (desc)
            iptc.description = desc;
        if (Object.keys(iptc).length > 0) {
            this.iptcData.set(iptc);
        }
    }
    downloadPictureFormat(url) {
        if (!url)
            return;
        window.open(url, '_blank');
    }
    renderMarkdown(text) {
        return renderNoteMarkdown(text);
    }
    /** Revoke the current raw object URL and clear the signal. The only place that pairing lives. */
    revokeRawBlobUrl() {
        const previousRaw = this.rawBlobUrl();
        if (previousRaw)
            URL.revokeObjectURL(previousRaw);
        this.rawBlobUrl.set(null);
        this.mainBlobType.set('');
    }
    setBlobUrl(blob) {
        this.revokeRawBlobUrl();
        const rawUrl = URL.createObjectURL(blob);
        this.rawBlobUrl.set(rawUrl);
        // Retained for the preview dialog's iframe gate: it must decide on the type the server actually
        // served, not on the document metadata, which can disagree. See AttachmentPreviewData.blobType.
        this.mainBlobType.set(blob.type);
        // Both forms are kept deliberately: the wrapped one for `iframe[src]`, which throws on a raw
        // string, and the raw one for `source[src]` / `audio[src]` / `video[poster]`, which are
        // SecurityContext.NONE and would stringify the wrapper into the attribute.
        this.blobUrl.set(trustObjectUrl(this.sanitizer, rawUrl));
        const doc = this.doc();
        if (doc && this.mimeType().startsWith('video/') && this.storyboard().length === 0) {
            this.loadStoryboard(doc);
        }
    }
    onTabChange(raw) {
        const index = Math.floor(Number(raw));
        if (!Number.isFinite(index) || index < 0) {
            return;
        }
        this.activeTabIndex.set(index);
        this.loadDataForTab(this.detailTabs()[index]?.id ?? null);
    }
    /** The lazy loads the Permissions, Publishing and History tabs need on first show. */
    loadDataForTab(id) {
        if (id === 'app.tabs.history')
            this.historyShown.set(true);
        if (id === 'app.tabs.permissions' && !this.permissionsTabLoaded) {
            this.reloadDocumentPermissions();
        }
        if (id === 'app.tabs.publishing' && !this.publishTabLoaded) {
            this.loadPublishingData();
        }
    }
    reloadDocumentPermissions() {
        const requestedFor = this.docUid;
        if (!requestedFor)
            return;
        const generation = this.documentLoadGeneration;
        this.permissionsLoading.set(true);
        this.detailService
            .getDocumentPermissions(requestedFor)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                // Late, this would put the previous document — or its permissions — on the page.
                if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                const existing = this.doc();
                if (!existing) {
                    this.doc.set(updated);
                }
                else {
                    this.doc.set(mergeDocumentPermissionsContext(existing, updated));
                }
                this.permissionsTabLoaded = true;
                this.permissionsLoading.set(false);
            },
            error: () => {
                if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                this.permissionsLoading.set(false);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-refresh-permissions'));
            },
        });
    }
    avatarColor = avatarColor;
    tagCategory(index) {
        return TAG_CATEGORIES[index % TAG_CATEGORIES.length];
    }
    /**
     * A version's publications are its live document's, as Web UI lists them: a proxy names the live
     * document as its `proxyVersionableId`, so asking with the version's own uid finds none.
     */
    loadPublicationCount(uid) {
        const generation = this.documentLoadGeneration;
        this.detailService.getPublishedVersions(this.liveDocumentUid()).subscribe({
            next: (res) => {
                if (uid !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                this.publishedDocs.set(res.entries);
                this.publishLoading.set(false);
            },
            error: () => {
                if (uid === this.docUid && generation === this.documentLoadGeneration) {
                    this.publishLoading.set(false);
                }
            },
        });
    }
    loadPublishingData() {
        this.publishLoading.set(true);
        this.sectionsLoading.set(true);
        if (this.publishedDocs().length === 0) {
            const requestedFor = this.docUid;
            const generation = this.documentLoadGeneration;
            this.detailService.getPublishedVersions(this.liveDocumentUid()).subscribe({
                next: (res) => {
                    if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                        return;
                    this.publishedDocs.set(res.entries);
                    this.publishLoading.set(false);
                },
                error: () => {
                    if (requestedFor === this.docUid && generation === this.documentLoadGeneration) {
                        this.publishLoading.set(false);
                    }
                },
            });
        }
        else {
            this.publishLoading.set(false);
        }
        this.detailService.getSectionTree().subscribe({
            next: (res) => {
                this.sectionTree.set(this.buildSectionTree(res.entries));
                this.sectionsLoading.set(false);
                // Marked loaded only here, as every other tab in this component does:
                // setting it up front left a failed section tree permanently empty,
                // because returning to the tab saw the flag and never retried.
                this.publishTabLoaded = true;
            },
            error: () => this.sectionsLoading.set(false),
        });
    }
    buildSectionTree(docs) {
        const nodeMap = new Map();
        const roots = [];
        for (const doc of docs) {
            nodeMap.set(doc.path, { doc, children: [], expanded: true });
        }
        for (const doc of docs) {
            const node = nodeMap.get(doc.path);
            if (!node)
                continue;
            const parentPath = doc.path.split('/').slice(0, -1).join('/');
            const parent = nodeMap.get(parentPath);
            if (parent) {
                parent.children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    selectSection(id) {
        this.selectedSectionId.set(this.selectedSectionId() === id ? null : id);
    }
    toggleSectionNode(node) {
        node.expanded = !node.expanded;
        this.sectionTree.update((t) => [...t]);
    }
    publishToSection() {
        const target = this.selectedSectionId();
        if (!target || !this.docUid || !this.canPublish())
            return;
        this.publishing.set(true);
        this.detailService.publishDocument(this.docUid, target, { override: true }).subscribe({
            next: () => {
                this.publishing.set(false);
                this.selectedSectionId.set(null);
                this.toast.show(this.translate.instant('document-detail.message.document-published'));
                this.refreshPublishedDocs();
            },
            error: () => {
                this.publishing.set(false);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-publish'));
            },
        });
    }
    sectionIcon(node) {
        return documentTypeTraits(node.doc.type).sectionIcon;
    }
    publishedPath(doc) {
        return doc.path;
    }
    publishedVersion(doc) {
        const major = doc.properties?.['uid:major_version'] ?? 0;
        const minor = doc.properties?.['uid:minor_version'] ?? 0;
        return `${major}.${minor}`;
    }
    isOlderVersion(pub) {
        const pubMajor = Number(pub.properties?.['uid:major_version'] ?? 0);
        const pubMinor = Number(pub.properties?.['uid:minor_version'] ?? 0);
        return (pubMajor < this.currentMajor() ||
            (pubMajor === this.currentMajor() && pubMinor < this.currentMinor()));
    }
    publishedRendition(doc) {
        const nature = doc.properties?.['dc:nature'];
        if (nature)
            return nature;
        const mime = doc.properties?.['file:content']?.['mime-type'];
        if (mime === 'application/pdf')
            return 'PDF';
        return 'None';
    }
    publishedBy(doc) {
        return (doc.properties?.['dc:lastContributor'] ??
            doc.properties?.['dc:creator'] ??
            '');
    }
    publishedDate(doc) {
        return doc.properties?.['dc:modified'] ?? doc.lastModified ?? '';
    }
    goToPublishingTab() {
        // By id, not by literal 4: a manifest that hides or reorders a tab moves it.
        const index = this.detailTabs().findIndex((tab) => tab.id === 'app.tabs.publishing');
        if (index < 0)
            return;
        this.onTabChange(index);
    }
    unpublishDocument(proxyDoc) {
        if (this.actionInProgress())
            return;
        this.confirmPublicationAction('document-detail.document-detail.unpublish', 'document-detail.document-detail.unpublish-confirm', () => {
            this.actionInProgress.set('unpublish');
            this.detailService
                .unpublishDocument(proxyDoc.uid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.publishedDocs.update((docs) => docs.filter((d) => d.uid !== proxyDoc.uid));
                    this.focusPublicationsHeading();
                    this.toast.show(this.translate.instant('document-detail.message.publication-removed'));
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-unpublish'));
                },
            });
        });
    }
    republishDocument(proxyDoc) {
        if (this.actionInProgress())
            return;
        this.confirmPublicationAction('document-detail.document-detail.republish', 'document-detail.document-detail.republish-confirm', () => {
            this.actionInProgress.set('republish');
            this.republishToSectionByProxy(proxyDoc);
        });
    }
    republishToSectionByProxy(proxyDoc) {
        const sectionPath = proxyDoc.path.split('/').slice(0, -1).join('/');
        // Find section UID from the section tree or query for it
        const findSection = (nodes) => {
            for (const n of nodes) {
                if (n.doc.path === sectionPath)
                    return n.doc.uid;
                const found = findSection(n.children);
                if (found)
                    return found;
            }
            return null;
        };
        const sectionUid = findSection(this.sectionTree());
        if (sectionUid) {
            this.doRepublish(sectionUid);
        }
        else {
            const query = `SELECT * FROM Document WHERE ecm:path = '${sectionPath}' AND ecm:isTrashed = 0`;
            this.nuxeoApi.nxqlSearch(query, 1).subscribe({
                next: (res) => {
                    if (res.entries.length > 0) {
                        this.doRepublish(res.entries[0].uid);
                    }
                    else {
                        this.actionInProgress.set(null);
                        this.toast.error(this.translate.instant('document-detail.message.section-not-found'));
                    }
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-republish'));
                },
            });
        }
    }
    doRepublish(targetSectionUid) {
        this.detailService
            .publishDocument(this.docUid, targetSectionUid, { override: true })
            .subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.focusPublicationsHeading();
                this.toast.show(this.translate.instant('document-detail.message.document-republished'));
                this.refreshPublishedDocs();
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-republish'));
            },
        });
    }
    unpublishAll() {
        if (this.publishedDocs().length === 0 || this.actionInProgress())
            return;
        this.confirmPublicationAction('document-detail.document-detail.unpublish-all', 'document-detail.document-detail.unpublish-all-confirm', () => {
            const docs = this.publishedDocs();
            if (docs.length === 0)
                return;
            this.actionInProgress.set('unpublish-all');
            const deletions = docs.map((d) => this.detailService.unpublishDocument(d.uid));
            forkJoin(deletions)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.publishedDocs.set([]);
                    this.focusPublicationsHeading();
                    this.toast.show(this.translate.instant('document-detail.message.all-publications-removed'));
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-remove-some-publications'));
                    this.refreshPublishedDocs();
                },
            });
        });
    }
    /**
     * Web UI asks before each publication action (`nuxeo-document-publications`). On Cancel the
     * dialog returns focus to the button that opened it.
     */
    confirmPublicationAction(actionKey, questionKey, run) {
        const action = this.translate.instant(actionKey);
        this.dialog
            .open(ConfirmDialogComponent, {
            data: {
                title: action,
                message: this.translate.instant(questionKey),
                confirmLabel: action,
            },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (confirmed && !this.actionInProgress())
                run();
        });
    }
    /** The button that ran a publication action may leave with its row, so focus goes to the heading. */
    focusPublicationsHeading() {
        this.publicationsHeading()?.nativeElement?.focus();
    }
    refreshPublishedDocs() {
        const requestedFor = this.docUid;
        const generation = this.documentLoadGeneration;
        this.detailService.getPublishedVersions(this.liveDocumentUid()).subscribe({
            next: (res) => {
                if (requestedFor === this.docUid && generation === this.documentLoadGeneration) {
                    this.publishedDocs.set(res.entries);
                }
            },
        });
    }
    // ── Document Actions ──
    toggleLock() {
        if (this.actionInProgress() || !this.isLockable() || !this.requireWritePermission())
            return;
        // Captured before the request: the page is reused across `:uid` changes, so when the response
        // lands `docUid` and `isLocked()` may describe another document.
        const uid = this.docUid;
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
                if (uid !== this.docUid)
                    return;
                this.isLocked.set(!wasLocked);
                // Nuxeo records the caller as the lock owner; naming a fixed account here
                // told every user someone else held their own lock.
                this.lockOwner.set(wasLocked ? null : (updated?.lockOwner ?? this.currentUsername() ?? null));
                this.lockCreated.set(wasLocked ? null : (updated?.lockCreated ?? new Date().toISOString()));
                this.toast.show(this.translate.instant(wasLocked
                    ? 'document-detail.message.document-unlocked'
                    : 'document-detail.message.document-locked'));
            },
            error: (err) => {
                if (request !== this.lockRequest)
                    return;
                this.actionInProgress.set(null);
                if (uid !== this.docUid)
                    return;
                this.toast.error(this.translate.instant(this.lockRefusalKey(err, wasLocked)));
            },
        });
    }
    /**
     * On navigation, a lock request for the previous document stops owning the busy flag, so the new
     * document's controls are not held disabled by it, and its late response cannot clear a newer one.
     */
    releaseLockRequest() {
        this.lockRequest += 1;
        if (this.actionInProgress() === 'lock')
            this.actionInProgress.set(null);
    }
    lockRefusalKey(err, wasLocked) {
        switch (err?.status) {
            case 403:
                return wasLocked ? 'common.lock.unlock-no-permission' : 'common.lock.lock-no-permission';
            case 409:
                return wasLocked ? 'common.lock.locked-by-another-user' : 'common.lock.already-locked';
            default:
                return 'document-detail.message.failed-to-toggle-lock';
        }
    }
    toggleFavorite() {
        if (this.actionInProgress())
            return;
        this.actionInProgress.set('favorite');
        const uid = this.docUid;
        nxsToggleFavorite(this.detailService, uid, this.isFavorite())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (favorite) => {
                // The page is reused when `:uid` changes: an answer for the document left behind says
                // nothing about the star of the one now shown, which loaded its own.
                if (uid === this.docUid)
                    this.isFavorite.set(favorite);
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant(favorite
                    ? 'document-detail.message.added-to-favorites'
                    : 'document-detail.message.removed-from-favorites'));
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-update-favorites'));
            },
        });
    }
    toggleSubscription() {
        if (this.actionInProgress())
            return;
        this.actionInProgress.set('subscribe');
        const op = this.isSubscribed()
            ? this.detailService.unsubscribe(this.docUid)
            : this.detailService.subscribe(this.docUid);
        op.subscribe({
            next: () => {
                const wasSub = this.isSubscribed();
                this.isSubscribed.set(!wasSub);
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant(wasSub
                    ? 'document-detail.message.notifications-disabled'
                    : 'document-detail.message.notifications-enabled'));
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('browse.message.failed-to-update-notifications'));
            },
        });
    }
    isTrashed = computed(() => {
        const d = this.doc();
        return d?.isTrashed === true || d?.state === 'deleted';
    }, ...(ngDevMode ? [{ debugName: "isTrashed" }] : []));
    trashDocument() {
        if (this.actionInProgress() || !this.requireRemovePermission())
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-document'),
                message: this.translate.instant('confirm.delete-document-question'),
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
                .trashDocument(this.docUid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('document-detail.message.document-moved-to-trash'));
                    this.goBack();
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-delete-document'));
                },
            });
        });
    }
    restoreFromTrash() {
        if (this.actionInProgress() || !this.requireWritePermission())
            return;
        this.actionInProgress.set('restore');
        this.detailService
            .restoreFromTrash(this.docUid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant('document-detail.message.document-restored'));
                this.loadDocument(this.docUid);
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('browse.message.failed-to-restore-document'));
            },
        });
    }
    permanentlyDelete() {
        if (this.actionInProgress() || !this.requireRemovePermission())
            return;
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.permanently-delete-document'),
                message: this.translate.instant('confirm.permanently-delete-warning'),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        });
        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.actionInProgress.set('permanentDelete');
            this.detailService
                .permanentlyDelete(this.docUid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('document-detail.message.document-permanently-deleted'));
                    this.goBack();
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-permanently-delete-document'));
                },
            });
        });
    }
    toggleClipboard() {
        const current = this.clipboardDocs();
        const d = this.doc();
        if (!d)
            return;
        if (this.isInClipboard()) {
            const updated = current.filter((c) => c.uid !== this.docUid);
            this.clipboardDocs.set(updated);
            writeClipboardDocs(updated);
            this.toast.show(this.translate.instant('collections.message.removed-from-clipboard'));
        }
        else {
            const updated = [...current, { uid: d.uid, title: d.title, type: d.type }];
            this.clipboardDocs.set(updated);
            writeClipboardDocs(updated);
            this.toast.show(this.translate.instant('collections.message.added-to-clipboard'));
        }
        window.dispatchEvent(new Event('clipboard-changed'));
    }
    exportDocument() {
        this.dialog.open(ExportDialogComponent, {
            data: {
                documentUid: this.docUid,
                documentTitle: this.doc()?.title ?? 'document',
                exportFn: (type, uid) => {
                    switch (type) {
                        case 'thumbnail':
                            return this.detailService.fetchThumbnail(uid);
                        case 'pdf':
                            return this.detailService.fetchPdfRendition(uid);
                        case 'zip':
                            return this.detailService.exportZip(uid, `${this.doc()?.title ?? 'export'}.zip`);
                        case 'xml':
                            return this.detailService.exportXml(uid);
                    }
                },
            },
            width: '440px',
        });
    }
    openAddToCollectionDialog() {
        const ref = this.dialog.open(AddToCollectionDialogComponent, {
            width: '440px',
            autoFocus: false,
        });
        ref.afterClosed().subscribe((collectionId) => {
            if (!collectionId)
                return;
            this.actionInProgress.set('collection');
            this.detailService.addToCollection(this.docUid, collectionId).subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('document-detail.message.added-to-collection'));
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-add-to-collection'));
                },
            });
        });
    }
    openEditDialog() {
        const currentDoc = this.doc();
        if (!currentDoc || !this.requireWritePermission())
            return;
        const ref = this.dialog.open(EditDocumentDialogComponent, {
            width: '720px',
            maxWidth: '95vw',
            data: { document: currentDoc },
        });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updatedDoc) => {
            if (!updatedDoc)
                return;
            this.browseContext.requestTreeRefresh();
            this.browseContext.setFromDocument(updatedDoc);
            this.doc.set(updatedDoc);
            this.syncActionStates(updatedDoc);
            this.loadVocabularies();
            this.toast.show(this.translate.instant('browse.message.document-updated'));
            this.loadDocument(this.docUid);
        });
    }
    /** Toolbar Edit opens metadata; note-surface pencil focuses inline content (Web UI parity). */
    onEditClick() {
        this.openEditDialog();
    }
    saveNote(body) {
        const doc = this.doc();
        if (!doc || this.noteSaving() || !this.requireWritePermission())
            return;
        this.noteSaving.set(true);
        const mime = this.mimeType();
        this.browseService
            .updateDocument(doc.uid, {
            'note:note': body,
            'note:mime_type': mime,
        }, { enrichPermissions: true })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                this.noteSaving.set(false);
                this.doc.set(this.mergeUpdatedDocument(doc, updated));
                this.noteContent.set(body);
                if (mime === 'text/markdown') {
                    const rawHtml = this.renderMarkdown(body);
                    this.noteHtml.set(renderTrustedHtml(this.sanitizer, rawHtml, { ADD_ATTR: ['target'] }));
                }
                else {
                    this.noteHtml.set(null);
                }
                this.toast.show(this.translate.instant('document-detail.message.note-saved'));
            },
            error: (err) => {
                this.noteSaving.set(false);
                this.toast.error(isPermissionDeniedError(err)
                    ? this.translate.instant(PERMISSION_DENIED_KEY)
                    : this.translate.instant('document-detail.message.failed-to-save-note'));
            },
        });
    }
    shareDocument() {
        this.dialog.open(ShareDialogComponent, {
            data: {
                title: this.doc()?.title ?? this.translate.instant('document-detail.share-fallback-title'),
                url: window.location.href,
            },
            width: '520px',
        });
    }
    /**
     * Keeps enricher data when a Note PUT omits contextParameters or returns empty
     * permissions/acls arrays (NXSAT-196). Permission refresh GETs use the default merge.
     */
    mergeUpdatedDocument(existing, updated) {
        if (!existing.contextParameters && !updated.contextParameters) {
            return updated;
        }
        // Note PUT only: treat empty permissions/acls arrays from Nuxeo as absent (NXSAT-196).
        return mergeDocumentPermissionsContext({ ...updated, contextParameters: existing.contextParameters }, updated, { treatEmptyEnricherAsAbsent: true });
    }
    /**
     * The packaged Lock/Unlock rules' Immutable/Root restriction, held here too because a manifest
     * may clear those rules, and an administrator keeps Write on a version.
     */
    isLockable() {
        const d = this.doc();
        return !d?.facets?.includes('Immutable') && d?.type !== 'Root';
    }
    /**
     * Through `canWriteDoc`, so a version is refused here too: a manifest may re-enable a write
     * action's rule, and the handler must not then open an editor on a version.
     */
    requireWritePermission() {
        if (this.canWriteDoc())
            return true;
        this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
        return false;
    }
    requireRemovePermission() {
        if (canRemoveDocument(this.doc()))
            return true;
        this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
        return false;
    }
    goBack() {
        const d = this.doc();
        if (d) {
            void this.router.navigateByUrl(this.browseUrlForPath(parentNuxeoFolderPath(d.path)));
        }
        else {
            void this.router.navigateByUrl(this.browseUrlForPath('/'));
        }
    }
    download() {
        if (!this.docUid)
            return;
        this.detailService
            .fetchBlob(this.docUid, { clientReason: 'download' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = objectUrl;
                anchor.download = this.fileName();
                anchor.click();
                URL.revokeObjectURL(objectUrl);
                this.refreshPanelActivityIfVisible();
            },
            error: () => this.toast.error(this.translate.instant('document-detail.message.failed-to-download-document')),
        });
    }
    refreshPanelActivityIfVisible() {
        if (this.panelSubTab() !== 'activity')
            return;
        this.panelActivityLoaded = false;
        this.loadPanelActivity();
    }
    previewMainBlob() {
        const rawUrl = this.rawBlobUrl();
        if (!rawUrl)
            return;
        const safeUrl = trustObjectUrl(this.sanitizer, rawUrl);
        this.dialog.open(AttachmentPreviewDialogComponent, {
            width: '90vw',
            maxWidth: '1200px',
            maxHeight: '95vh',
            panelClass: 'preview-dialog-panel',
            data: {
                name: this.fileName(),
                mimeType: this.mimeType(),
                blobType: this.mainBlobType(),
                blobUrl: safeUrl,
                rawUrl,
                // The document viewer behind this dialog is still bound to the same object URL.
                ownsRawUrl: false,
            },
        });
    }
    loadARenderUrl(doc) {
        const xpath = this.blobXPathForARender(doc);
        if (!xpath) {
            this.arenderUrl.set(null);
            return;
        }
        const requestedDocUid = doc.uid;
        this.arenderUrl.set(null);
        this.arenderService
            .isAvailable()
            .pipe(switchMap((available) => available ? this.arenderService.getPreviewerUrl(doc.uid, xpath) : of(null)), 
        // The `requestedDocUid` guard below only prevents a *stale* document's result being
        // applied; it does not unsubscribe, so without this the subscription outlives the
        // component. Required by convention on every `.subscribe()` in this repo.
        takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (url) => {
                if (requestedDocUid !== this.docUid)
                    return;
                // Validate at the point of trust, not only where the URL was built. `ARenderService`
                // already refuses a `viewerOrigin` that is not an http(s) origin, so this is the second
                // of two independent checks — the value is about to be bypassed and navigated in an
                // iframe, which is a privilege boundary, and a boundary defended in exactly one place is
                // one refactor away from being undefended. Rejecting leaves `arenderUrl` null, which the
                // template renders as "Annotations are not available" — the same path as ARender not
                // being deployed.
                // Host-aware, matching `ARenderService` and the preview fallback. Left on a bare
                // `isDevMode()` this second check would reject on an http host what the first now allows,
                // so ARender would still be dead for on-prem plaintext — the defence-in-depth pair has to
                // agree on the policy, not just both be present.
                const safe = navigableUrlOrNull(url, {
                    allowInsecure: insecureAllowedForHost(isDevMode()),
                });
                if (safe) {
                    this.arenderUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(safe));
                    this.arenderReloadId.update((n) => n + 1);
                }
            },
            error: () => {
                if (requestedDocUid !== this.docUid)
                    return;
                this.arenderUrl.set(null);
            },
        });
    }
    /**
     * Blob xpath for Document.ARenderGetPreviewerUrl so annotations align with the main blob (file:content).
     */
    blobXPathForARender(doc) {
        if (doc.properties['note:note'] !== undefined && doc.properties['note:note'] !== null) {
            return null;
        }
        const fc = doc.properties['file:content'];
        if (!fc || !(fc['digest'] ?? fc['data'])) {
            const pics = doc.properties['picture:views'];
            if (!pics?.length)
                return null;
        }
        return 'file:content';
    }
    // ── Panel Sub-Tab Switching ──
    switchPanelSubTab(tab) {
        if (tab !== 'properties' && tab !== 'comments' && tab !== 'activity')
            return;
        this.panelSubTab.set(tab);
        if (tab === 'activity' && !this.panelActivityLoaded) {
            this.loadPanelActivity();
        }
    }
    /**
     * Localised by `Intl.RelativeTimeFormat` rather than by a catalogue — see
     * `formatRelativeTime` for why a key per unit cannot express Polish or Arabic plurals.
     */
    relativeTime(dateStr) {
        return formatRelativeTime(dateStr, this.translate.currentLang);
    }
    // ── Panel Activity ──
    loadPanelActivity() {
        if (!this.docUid)
            return;
        this.loadEventTypeLabels();
        const doc = this.doc();
        if (!doc) {
            this.panelActivityLoading.set(false);
            return;
        }
        if (!canViewDocumentAuditLog(doc)) {
            this.panelActivity.set([]);
            this.panelActivityLoading.set(false);
            this.panelActivityLoaded = true;
            return;
        }
        this.panelActivityLoading.set(true);
        const requestedFor = this.docUid;
        const generation = this.documentLoadGeneration;
        this.detailService
            .getAuditLog(requestedFor, 20, 0)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                    return;
                this.panelActivity.set(res.entries);
                this.panelActivityLoading.set(false);
                this.panelActivityLoaded = true;
            },
            error: () => {
                if (requestedFor === this.docUid && generation === this.documentLoadGeneration) {
                    this.panelActivityLoading.set(false);
                }
            },
        });
    }
    activityLabel(entry) {
        return auditActivityLabel(entry, this.eventTypeLabels());
    }
    /** The activity list names an event by its vocabulary label once the vocabulary is read. */
    loadEventTypeLabels() {
        if (this.eventTypesRequested)
            return;
        this.eventTypesRequested = true;
        this.directoryService
            .getEventTypes()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (types) => this.eventTypeLabels.set(new Map(types.map((t) => [t.id, t.displayLabel]))),
            error: () => (this.eventTypesRequested = false),
        });
    }
    // ── Versioning ──
    /** `nxs-manage-versions` created one: the document is checked in at it now. */
    onVersionCreated() {
        this.loadDocument(this.docUid);
    }
    /** The live document — this one, or the one a version on screen belongs to. */
    liveDocumentUid() {
        const d = this.doc();
        return (d?.isVersion && d.versionableId) || this.docUid;
    }
    versionString(doc) {
        const major = Number(doc.properties['uid:major_version'] ?? 0);
        const minor = Number(doc.properties['uid:minor_version'] ?? 0);
        return `${major}.${minor}`;
    }
    /** Move between a document and its versions. */
    navigateWithinVersions(uid) {
        void this.router.navigate(['/doc', uid]);
    }
    /** Open a version read-only. Choosing one from the list never restores it. */
    openVersion(version) {
        if (version.uid !== this.docUid)
            this.navigateWithinVersions(version.uid);
    }
    /** Leave a version for the live document it belongs to. */
    showLatestVersion() {
        const liveUid = this.liveDocumentUid();
        if (liveUid !== this.docUid)
            this.navigateWithinVersions(liveUid);
    }
    /** Restoring replaces the live document's content, so it is confirmed first. */
    confirmRestoreVersion() {
        const version = this.doc();
        if (!version || !this.canRestoreVersion() || this.actionInProgress())
            return;
        const label = this.versionString(version);
        this.dialog
            .open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('document-detail.version-restore-confirm-title'),
                message: this.translate.instant('document-detail.version-restore-replaces-content', {
                    version: label,
                }),
                confirmLabel: this.translate.instant('document-detail.version-restore', {
                    version: label,
                }),
            },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (confirmed)
                this.restoreVersion(version);
        });
    }
    restoreVersion(version) {
        if (!hasDocumentPermission(version, WRITE_VERSION)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        const generation = this.documentLoadGeneration;
        const versionUid = version.uid;
        this.actionInProgress.set('restore');
        this.detailService
            .restoreVersion(versionUid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                if (generation !== this.documentLoadGeneration)
                    return;
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant('document-detail.restored-to-version', {
                    version: this.versionString(version),
                }));
                const liveUid = version.versionableId;
                if (liveUid && liveUid !== this.docUid) {
                    this.navigateWithinVersions(liveUid);
                }
                else {
                    this.loadDocument(this.docUid);
                }
            },
            error: (err) => {
                if (generation !== this.documentLoadGeneration)
                    return;
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant(restoreVersionErrorKey(err)));
            },
        });
    }
    // ── Publish ──
    /**
     * Web UI's `isPublishable`, so a version is published as it is: `Document.PublishToSection`
     * runs on the document on screen, and the dialog lists the live document's versions.
     */
    openPublishDialog() {
        const doc = this.doc();
        if (!doc || !canPublishDocument(doc)) {
            this.toast.error(this.translate.instant(PERMISSION_DENIED_KEY));
            return;
        }
        const requestedFor = this.docUid;
        const generation = this.documentLoadGeneration;
        const openDialog = (versions) => {
            if (requestedFor !== this.docUid || generation !== this.documentLoadGeneration)
                return;
            this.dialog
                .open(PublishDialogComponent, {
                width: '620px',
                panelClass: 'publish-dialog-panel',
                data: {
                    documentUid: doc.uid,
                    documentTitle: doc.title,
                    versionLabel: this.versionLabel(),
                    renditions: this.buildRenditionOptions(),
                    versions,
                },
            })
                .afterClosed()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((published) => {
                if (!published)
                    return;
                this.publishTabLoaded = false;
                this.refreshPublishedDocs();
            });
        };
        this.detailService
            .getVersionsDirect(this.liveDocumentUid())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (versions) => openDialog(versions),
            error: () => openDialog([]),
        });
    }
    buildRenditionOptions() {
        const d = this.doc();
        const rends = d?.contextParameters?.['renditions'];
        const labelMap = {
            thumbnail: this.translate.instant('rendition.thumbnail'),
            pdf: this.translate.instant('rendition.pdf'),
            zipExport: this.translate.instant('rendition.zip-export'),
            xmlExport: this.translate.instant('rendition.xml-export'),
        };
        if (!rends)
            return Object.entries(labelMap).map(([name, label]) => ({ name, label }));
        return rends.map((r) => ({ name: r.name, label: labelMap[r.name] ?? r.name }));
    }
    previewAttachment(att) {
        this.http
            .get(att.url, { responseType: 'blob' })
            // Without this, navigating away while the request is in flight still mints an object URL and
            // opens a dialog after teardown — the URL is only revoked by the dialog that never opened.
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                const safeUrl = trustObjectUrl(this.sanitizer, objectUrl);
                this.dialog.open(AttachmentPreviewDialogComponent, {
                    width: '90vw',
                    maxWidth: '1200px',
                    maxHeight: '95vh',
                    panelClass: 'preview-dialog-panel',
                    data: {
                        name: att.name,
                        mimeType: att.mimeType,
                        // The served type, not the metadata one — the iframe gate needs what the browser
                        // will actually parse by.
                        blobType: blob.type,
                        blobUrl: safeUrl,
                        rawUrl: objectUrl,
                        // Minted just above for this dialog, so the dialog revokes it on close.
                        ownsRawUrl: true,
                    },
                });
            },
            error: () => this.toast.error(this.translate.instant('document-detail.message.failed-to-load-preview')),
        });
    }
    openDriveDialog() {
        // Drive opens the folder that holds the document.
        const docPath = this.doc()?.path ?? '';
        const parentPath = docPath.includes('/') ? docPath.split('/').slice(0, -1).join('/') : '/';
        const data = { folderPath: parentPath || '/' };
        this.dialog.open(NxsDriveDialogComponent, { data });
    }
    deletePermission(ace) {
        const ref = this.dialog.open(NxsDeletePermissionDialogComponent, {
            width: '560px',
            maxWidth: '95vw',
            role: 'alertdialog',
            data: {
                documentUid: this.docUid,
                ace,
                acl: ace.aclName,
            },
        });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((deleted) => {
            if (deleted) {
                this.toast.show(this.translate.instant('browse.message.permission-deleted'));
                this.reloadDocumentPermissions();
            }
        });
    }
    editExternalPermission(ace) {
        const ref = this.dialog.open(NxsUpdatePermissionDialogComponent, {
            maxWidth: '95vw',
            data: {
                documentUid: this.docUid,
                ace,
                permissions: this.visiblePermissions(),
            },
        });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updated) => {
            if (updated)
                this.reloadDocumentPermissions();
        });
    }
    sendPermissionNotification(ace) {
        if (this.actionInProgress())
            return;
        this.actionInProgress.set('notify-' + ace.id);
        this.detailService
            .sendNotificationEmailForPermission(this.docUid, ace.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.toast.show(this.translate.instant('browse.message.notification-email-sent'));
            },
            error: (err) => {
                this.actionInProgress.set(null);
                this.toast.error(isMailSendError(err)
                    ? mailSendFailureMessage('send', (key) => this.translate.instant(key))
                    : this.translate.instant('document-detail.message.failed-to-send-notification'));
            },
        });
    }
    openExternalPermissionDialog() {
        if (!this.docUid)
            return;
        const data = {
            documentUid: this.docUid,
            permissions: this.visiblePermissions(),
        };
        const ref = this.dialog.open(NxsShareExternalDialogComponent, { maxWidth: '95vw', data });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((shared) => {
            if (shared)
                this.reloadDocumentPermissions();
        });
    }
    uploadAttachment(event) {
        if (!this.requireWritePermission()) {
            event.target.value = '';
            return;
        }
        const input = event.target;
        const file = input.files?.[0];
        if (!file)
            return;
        this.actionInProgress.set('upload');
        this.detailService.uploadAttachment(this.docUid, file).subscribe({
            next: () => {
                this.actionInProgress.set(null);
                this.toast.show(`"${file.name}" attached`);
                this.loadDocument(this.docUid);
            },
            error: () => {
                this.actionInProgress.set(null);
                this.toast.error(this.translate.instant('document-detail.message.failed-to-upload-attachment'));
            },
        });
        input.value = '';
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 B';
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    downloadAttachment(url, name) {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.target = '_blank';
        a.click();
    }
    openReplaceDialog(att) {
        if (!this.requireWritePermission())
            return;
        const ref = this.dialog.open(ReplaceAttachmentDialogComponent, {
            width: '480px',
            data: { fileName: att.name },
        });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((file) => {
            if (!file)
                return;
            this.actionInProgress.set('replace');
            this.detailService
                .replaceAttachment(this.docUid, att.index, file)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(`"${att.name}" replaced`);
                    this.loadDocument(this.docUid);
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-replace-attachment'));
                },
            });
        });
    }
    openRemoveDialog(att) {
        if (!this.requireWritePermission())
            return;
        const ref = this.dialog.open(RemoveAttachmentDialogComponent, { width: '400px' });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.actionInProgress.set('remove');
            this.detailService
                .removeAttachment(this.docUid, att.index)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(`"${att.name}" removed`);
                    this.loadDocument(this.docUid);
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-remove-attachment'));
                },
            });
        });
    }
    openReplaceMainFileDialog() {
        if (!this.requireWritePermission())
            return;
        const ref = this.dialog.open(ReplaceAttachmentDialogComponent, {
            width: '480px',
            data: { fileName: this.fileName() },
        });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((file) => {
            if (!file)
                return;
            this.actionInProgress.set('replace-main');
            this.detailService
                .replaceMainFile(this.docUid, file)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('document-detail.message.main-file-replaced'));
                    this.loadDocument(this.docUid);
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-replace-main-file'));
                },
            });
        });
    }
    openRemoveMainFileDialog() {
        if (!this.requireWritePermission())
            return;
        const ref = this.dialog.open(RemoveAttachmentDialogComponent, { width: '400px' });
        ref
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (!confirmed)
                return;
            this.actionInProgress.set('remove-main');
            this.detailService
                .removeMainFile(this.docUid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => {
                    this.actionInProgress.set(null);
                    this.toast.show(this.translate.instant('document-detail.message.main-file-removed'));
                    this.loadDocument(this.docUid);
                },
                error: () => {
                    this.actionInProgress.set(null);
                    this.toast.error(this.translate.instant('document-detail.message.failed-to-remove-main-file'));
                },
            });
        });
    }
    /** Shared by matTooltip and aria-label on the details panel toggle (WCAG 2.5.3, NXENG-766). */
    detailsPanelToggleLabelKey() {
        return this.propertiesPanelOpen()
            ? 'document-detail.hide-details'
            : 'document-detail.show-details';
    }
    /** The close button leaves with the panel, so focus goes to the button that reopens it. */
    closePropertiesPanel() {
        this.propertiesPanelOpen.set(false);
        this.panelToggle()?.nativeElement?.focus();
    }
    openPropertiesPanel() {
        this.propertiesPanelOpen.set(true);
    }
    static ɵfac = function DocumentDetailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentDetailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentDetailComponent, selectors: [["lib-document-detail"]], viewQuery: function DocumentDetailComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.panelToggle, _c0, 5, ElementRef);
            i0.ɵɵviewQuerySignal(ctx.publicationsHeading, _c1, 5, ElementRef);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, features: [i0.ɵɵProvidersFeature([provideTranslatedDatepickerIntl(), provideSatoriDateAdapter(), provideNxsToast()])], decls: 5, vars: 1, consts: [["sectionNodeTpl", ""], ["viewTabContent", ""], ["packagedViewContent", ""], ["annotationsTabContent", ""], ["permissionsTabContent", ""], ["historyTabContent", ""], ["publishingTabContent", ""], ["aiInsightsTabContent", ""], ["panelToggle", ""], ["documentViewOutlet", ""], ["permissionsPanelOutlet", ""], ["publicationsHeading", ""], ["attMenu", "matMenu"], ["attachmentInput", ""], [1, "detail-loading"], [1, "detail-error", 3, "status", "heading", "headingLevel"], ["diameter", "40", 3, "label"], ["mat-stroked-button", "", "type", "button", 3, "click"], ["aria-hidden", "true"], [1, "detail-header"], ["mat-icon-button", "", 1, "detail-header-go-back-btn", 3, "click"], ["aria-hidden", "true", 1, "detail-header-go-back-icon"], [1, "header-info"], ["role", "heading", "aria-level", "1", 1, "header-title"], [3, "click", "items"], [1, "header-actions", 3, "selected", "actions", "moreLabel"], [1, "ke-action-group"], [1, "ke-status-banner", 3, "ke-status-banner--error"], [1, "trashed-banner"], [1, "version-banner"], [1, "workflow-banner"], [1, "task-action-banner"], [1, "detail-body"], [1, "detail-main"], [1, "tabs-header-row"], [1, "detail-tabs", 3, "selectedIndexChange", "tabs", "selectedIndex"], ["nxsTabBody", ""], ["mat-icon-button", "", 1, "panel-toggle-btn", 3, "click", "matTooltip"], [1, "properties-panel", 3, "heading", "label", "closeLabel", "tabs", "selected"], ["type", "button", "mat-stroked-button", "", 1, "ke-action-btn", 3, "click", "disabled"], [1, "ke-spinning"], ["aria-busy", "true", 1, "content-lake-ingest-loader", 3, "matTooltip"], ["matTooltipClass", "mat-tooltip-multiline", "matTooltipPosition", "below", 1, "content-lake-ingest-marker", 3, "matTooltip"], ["mat-icon-button", "", "type", "button", 1, "content-lake-ingest-btn", 3, "matTooltip", "disabled"], ["diameter", "24"], ["mat-icon-button", "", "type", "button", "disabled", "", "tabindex", "-1"], ["mat-icon-button", "", "type", "button", 1, "content-lake-ingest-btn", 3, "click", "matTooltip", "disabled"], ["cdkAriaLive", "off", 1, "cdk-visually-hidden"], [1, "ke-status-banner"], [1, "trashed-banner-icon"], [1, "trashed-banner-text"], [1, "trashed-banner-spacer"], ["mat-stroked-button", "", 1, "trashed-banner-btn", 3, "disabled"], ["mat-stroked-button", "", 1, "trashed-banner-btn", "trashed-banner-btn--danger", 3, "disabled"], ["mat-stroked-button", "", 1, "trashed-banner-btn", 3, "click", "disabled"], ["mat-stroked-button", "", 1, "trashed-banner-btn", "trashed-banner-btn--danger", 3, "click", "disabled"], [1, "version-banner-icon"], [1, "version-banner-text"], ["mat-button", "", "type", "button", 1, "version-banner-latest", 3, "click"], ["mat-flat-button", "", "type", "button", 1, "version-banner-restore", 3, "disabled"], ["mat-flat-button", "", "type", "button", 1, "version-banner-restore", 3, "click", "disabled"], [1, "workflow-banner-icon"], [1, "workflow-banner-text"], [1, "workflow-banner-spacer"], ["mat-button", "", 1, "workflow-banner-abandon", 3, "click", "disabled"], [1, "task-action-icon"], [1, "task-action-text"], [1, "task-action-spacer"], ["mat-flat-button", "", 1, "task-action-btn", 3, "click"], ["type", "button", 1, "start-process-backdrop", 3, "click"], [1, "start-process-dialog"], ["role", "heading", "aria-level", "2", 1, "start-process-title"], [1, "start-process-loading"], [1, "start-process-empty"], ["diameter", "28"], ["appearance", "outline", 1, "start-process-field"], [1, "start-process-label"], [3, "selectionChange", "value"], [3, "value"], [1, "start-process-actions"], ["mat-flat-button", "", "color", "primary", 1, "start-process-btn", 3, "click", "disabled"], ["diameter", "18", 1, "inline-spinner"], [3, "ngTemplateOutlet"], [3, "componentId"], [1, "document-view-outlet", 3, "componentId", "componentInputs"], [3, "content", "mimeType", "uploadParentPath", "loading", "saving", "autoFocus", "readOnly"], [3, "blobUrl", "rawBlobUrl", "blobType", "mimeType", "fileName", "fileSize", "loading", "noteContent", "noteHtml", "videoSources", "storyboard", "posterUrl", "hasPdfRendition", "previewUrl", "pictureInfo", "pictureViews", "exifData", "iptcData", "videoInfo", "arenderUrl", "arenderReloadId", "viewerDocUid", "annotationsTab", "showMainFileControls", "mainFileActionInProgress"], [3, "saveNote", "focused", "content", "mimeType", "uploadParentPath", "loading", "saving", "autoFocus", "readOnly"], [3, "downloadClicked", "previewClicked", "openWithDriveClicked", "formatDownload", "replaceMainFileClicked", "removeMainFileClicked", "blobUrl", "rawBlobUrl", "blobType", "mimeType", "fileName", "fileSize", "loading", "noteContent", "noteHtml", "videoSources", "storyboard", "posterUrl", "hasPdfRendition", "previewUrl", "pictureInfo", "pictureViews", "exifData", "iptcData", "videoInfo", "arenderUrl", "arenderReloadId", "viewerDocUid", "annotationsTab", "showMainFileControls", "mainFileActionInProgress"], [1, "permissions-container"], [1, "perm-loading"], [1, "perm-section"], [3, "componentId", "componentInputs"], [3, "documentId", "permissionsChanged"], ["diameter", "28", 3, "label"], [1, "perm-section-header"], ["role", "heading", "aria-level", "3", 1, "perm-section-title"], ["mat-button", "", "color", "primary", "type", "button", 1, "perm-action-btn"], [1, "perm-info-bar"], [1, "perm-info-accent"], [1, "perm-empty"], [1, "perm-table-wrap"], ["mat-button", "", "color", "primary", "type", "button", 1, "perm-action-btn", 3, "click"], [1, "perm-table"], [1, "perm-row-actions"], ["mat-icon-button", "", "type", "button", 3, "click", "matTooltip"], ["mat-icon-button", "", "type", "button", 3, "click", "matTooltip", "disabled"], [1, "history-container", 3, "documentUid"], [1, "publish-container"], [1, "publish-section"], [1, "publish-section-header"], ["role", "heading", "aria-level", "3", "tabindex", "-1", 1, "publish-section-title"], ["mat-stroked-button", "", 1, "unpublish-all-btn", 3, "disabled"], [1, "publish-loading"], [1, "publish-empty"], [1, "publish-table"], ["mat-stroked-button", "", 1, "unpublish-all-btn", 3, "click", "disabled"], ["diameter", "16"], [1, "pub-actions-col"], [1, "pub-title-cell"], [1, "pub-doc-icon"], [1, "pub-path-text"], ["status", "neutral", 3, "hideIcon"], [1, "pub-publisher"], [1, "avatar-sm", "pub-avatar"], [1, "pub-actions-cell"], ["mat-stroked-button", "", 1, "pub-action-btn", "unpublish-btn", 3, "disabled"], ["mat-flat-button", "", "color", "primary", 1, "pub-action-btn", "republish-btn", 3, "disabled"], ["mat-stroked-button", "", 1, "pub-action-btn", "unpublish-btn", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", 1, "pub-action-btn", "republish-btn", 3, "click", "disabled"], ["role", "heading", "aria-level", "3", 1, "publish-section-title"], ["mat-flat-button", "", "color", "primary", 1, "publish-btn", 3, "click", "disabled"], ["diameter", "18"], [1, "publish-info-bar"], [1, "publish-info-accent"], [1, "section-tree"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "ai-tab-content"], [1, "ai-insights-hero"], [1, "ai-insights-hero-text"], [1, "ai-insights-title"], [1, "ai-insights-subtitle"], ["mat-flat-button", "", 1, "ai-btn-primary", 3, "click"], [1, "ai-insights-grid"], [1, "ai-card"], [1, "ai-card-header"], [1, "ai-card-icon", "ai-card-icon--purple"], [1, "ai-card-title"], ["mat-flat-button", "", "disabled", "", 1, "ai-btn-primary", "ai-btn-sm"], ["mat-flat-button", "", 1, "ai-btn-primary", "ai-btn-sm"], [1, "ai-card-desc"], [1, "ai-card-body"], [1, "ai-loading-skeleton"], [1, "ai-summary-result"], [1, "ai-placeholder-quote"], [1, "ai-card-icon", "ai-card-icon--indigo"], [1, "ai-tags-list"], [1, "ai-card-actions"], ["mat-stroked-button", "", "disabled", "", 1, "ai-btn-outline"], ["mat-stroked-button", "", 1, "ai-btn-outline"], [1, "ai-meta-rows"], ["mat-flat-button", "", "disabled", "", 1, "ai-btn-primary", "ai-btn-full"], ["mat-flat-button", "", 1, "ai-btn-primary", "ai-btn-full"], [1, "ai-doc-thumbs"], [1, "ai-similar-list"], [1, "ai-error-banner"], ["mat-flat-button", "", 1, "ai-btn-primary", "ai-btn-sm", 3, "click"], [1, "skeleton-line", "wide"], [1, "skeleton-line", "medium"], [1, "skeleton-line", "short"], [1, "ai-summary-text"], [1, "ai-key-points"], ["type", "button", 1, "ai-tag-chip"], ["type", "button", 1, "ai-tag-chip", 3, "click"], [1, "ai-tag-label"], [1, "ai-tag-confidence"], [1, "ai-tag-add"], ["mat-stroked-button", "", 1, "ai-btn-outline", 3, "click"], [1, "ai-meta-row"], [1, "ai-meta-key"], [1, "ai-meta-val"], ["category", "blue"], ["status", "info", 3, "hideIcon"], [1, "ai-meta-val", "ai-meta-val--muted"], ["mat-flat-button", "", 1, "ai-btn-primary", "ai-btn-full", 3, "click"], [1, "ai-doc-thumb", "ai-doc-thumb--skeleton"], ["diameter", "20"], [1, "ai-similar-item"], [1, "ai-similar-item", 3, "click"], [1, "ai-similar-icon"], [1, "ai-similar-info"], [1, "ai-similar-title"], [1, "ai-similar-path"], [1, "ai-similar-score"], [1, "ai-doc-thumb"], [1, "ai-doc-thumb-icon"], [1, "properties-panel", 3, "selectedChange", "closed", "heading", "label", "closeLabel", "tabs", "selected"], [1, "detail-properties", 3, "document", "vocabularyLabel", "processRunning", "versionLabel", "publications", "format"], [1, "comments-panel"], [1, "activity-panel"], [1, "detail-properties", 3, "publicationsSelected", "document", "vocabularyLabel", "processRunning", "versionLabel", "publications", "format"], ["nxsTags", "", 3, "documentUid", "tags", "readOnly"], ["mode", "metadata", 3, "document"], [1, "prop-section-divider"], ["role", "heading", "aria-level", "4", 1, "section-title"], [1, "section-empty"], [1, "upload-attachment-zone"], ["nxsVersion", "", 3, "label"], ["nxsVersion", "", 3, "document"], ["nxsVersion", "", 3, "versionSelected", "latestSelected", "versionCreated", "document"], ["nxsTags", "", 3, "tagsChange", "documentUid", "tags", "readOnly"], [1, "attachment-card"], [1, "attachment-info"], [1, "attachment-name"], [1, "attachment-size"], [1, "attachment-actions"], ["mat-icon-button", "", 3, "click", "matTooltip"], ["mat-icon-button", "", 3, "matMenuTriggerFor", "matTooltip"], ["mat-menu-item", "", 3, "click"], [1, "upload-link"], ["type", "file", "hidden", "", 3, "change"], [3, "documentUid"], [1, "sentiment-toolbar"], [1, "ai-sentiment-btn", 3, "click", "disabled"], [1, "sentiment-summary-panel"], [1, "sentiment-summary-header"], [1, "sentiment-summary-text"], [3, "threadChange", "documentUid"], ["nxsCommentExtra", ""], [1, "comment-sentiment"], [1, "sentiment-inline-summary"], [1, "sentiment-inline-icon"], [1, "panel-loading"], [1, "activity-card"], ["size", "28", "aria-hidden", "true", 3, "initials", "category", "borderless"], [1, "activity-info"], [1, "activity-user"], [1, "activity-action"], [1, "activity-time"], ["role", "button", "tabindex", "0", 1, "section-node", 3, "click", "keydown.enter", "keydown.space"], ["type", "button", 1, "section-toggle"], [1, "section-toggle-spacer"], [1, "section-icon"], [1, "section-label"], [1, "section-check"], ["type", "button", 1, "section-toggle", 3, "click"], [1, "section-arrow"]], template: function DocumentDetailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, DocumentDetailComponent_Conditional_0_Template, 3, 3, "div", 14)(1, DocumentDetailComponent_Conditional_1_Template, 6, 6, "nxs-error-state", 15)(2, DocumentDetailComponent_Conditional_2_Template, 48, 27);
            i0.ɵɵtemplate(3, DocumentDetailComponent_ng_template_3_Template, 9, 9, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵconditional(ctx.loading() ? 0 : (tmp_1_0 = ctx.error()) ? 1 : ctx.doc() ? 2 : -1, tmp_1_0);
        } }, dependencies: [NxsCommentExtraDirective,
            NxsCommentsComponent,
            NxsTagEditorComponent,
            NxsDetailsPanelComponent,
            NxsDocumentHistoryComponent,
            NxsDocumentToolbarComponent,
            NxsErrorStateComponent,
            NxsManageVersionsComponent,
            NxsPropertiesPanelComponent,
            NxsSpinnerComponent,
            NxsTabBodyDirective,
            NxsTabsComponent,
            NxsTagComponent,
            CdkAriaLive,
            NgTemplateOutlet,
            FormsModule,
            MatIconModule, i1.MatIcon, MatButtonModule, i2.MatButton, i2.MatIconButton, MatProgressSpinnerModule, i3.MatProgressSpinner, MatTooltipModule, i4.MatTooltip, MatMenuModule, i5.MatMenu, i5.MatMenuItem, i5.MatMenuTrigger, MatDialogModule,
            MatDividerModule,
            MatFormFieldModule, i6.MatFormField, i6.MatLabel, MatInputModule,
            MatSelectModule, i7.MatSelect, i7.MatOption, DocumentLayoutComponent,
            DocumentViewerComponent,
            ExtensionOutletComponent,
            NxsPermissionsPanelComponent,
            NoteEditorComponent,
            SatAvatarModule, i8.SatAvatar, SatBreadcrumbsComponent,
            SatTagModule, i9.SatCategoryTag, i9.SatStatusTag, TranslatePipe,
            DatePipe], styles: ["[_nghost-%COMP%] {\n  \n\n  \n\n  \n\n  --document-detail-properties-panel-surface: #ffffff;\n  --document-detail-properties-label-muted: #5c5f6b;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n//[_ngcontent-%COMP%]   Loading[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   Error\n.detail-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex: 1;\n  min-height: 400px;\n}\n\n.detail-error[_ngcontent-%COMP%] {\n  flex: 1;\n  justify-content: center;\n}\n\n//[_ngcontent-%COMP%]   Header\n.detail-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 16px;\n  background: #fff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  // Header stays #fff in every packaged theme; positive-offset focus rings must contrast with it.\n  --agentic-document-detail-header-focus-outline: #3f51b5;\n}\n\n.header-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.header-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nsat-breadcrumbs[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #888;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n\n  button {\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.content-lake-ingest-loader[_ngcontent-%COMP%], \n.content-lake-ingest-marker[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  flex-shrink: 0;\n  cursor: default;\n}\n\n.ke-action-group[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n//[_ngcontent-%COMP%]   Spin[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   leading[_ngcontent-%COMP%]   <mat-icon[_ngcontent-%COMP%] > on[_ngcontent-%COMP%]   KE[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]   while[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   action[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   flight.\n//[_ngcontent-%COMP%]   We[_ngcontent-%COMP%]   deliberately[_ngcontent-%COMP%]   use[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   spinning[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]   instead[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   <mat-spinner[_ngcontent-%COMP%] > , because\n//[_ngcontent-%COMP%]   <mat-spinner[_ngcontent-%COMP%] > renders[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   block-level[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   breaks[_ngcontent-%COMP%]   Material's\n//[_ngcontent-%COMP%]   stroked-button[_ngcontent-%COMP%]   content[_ngcontent-%COMP%]   alignment[_ngcontent-%COMP%]   (the text gets pushed onto the next line).\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   laid[_ngcontent-%COMP%]   out[_ngcontent-%COMP%]   identically[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   static[_ngcontent-%COMP%]   leading[_ngcontent-%COMP%]   icon,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   swapping\n//[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   out[_ngcontent-%COMP%]   causes[_ngcontent-%COMP%]   zero[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   shift.\n//\n//[_ngcontent-%COMP%]   IMPORTANT:[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   glyph[_ngcontent-%COMP%]   MUST[_ngcontent-%COMP%]   exist[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   legacy[_ngcontent-%COMP%]   \"Material[_ngcontent-%COMP%]   Icons\"[_ngcontent-%COMP%]   font[_ngcontent-%COMP%]   that\n//[_ngcontent-%COMP%]   apps/nuxeo-ui/src/index.html[_ngcontent-%COMP%]   loads.[_ngcontent-%COMP%]   `progress_activity`[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   Material\n//[_ngcontent-%COMP%]   Symbols[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   renders[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   empty[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   here,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   use[_ngcontent-%COMP%]   `autorenew`.\n.ke-action-btn[_ngcontent-%COMP%]   mat-icon.ke-spinning[_ngcontent-%COMP%] {\n  animation: ke-spin 1s linear infinite;\n}\n\n//[_ngcontent-%COMP%]   NXENG-789[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   issue[_ngcontent-%COMP%]   299839583[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   Material[_ngcontent-%COMP%]   stroked[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]   suppress[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   default[_ngcontent-%COMP%]   focus[_ngcontent-%COMP%]   ring.\n//[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `:focus`[_ngcontent-%COMP%]   only;[_ngcontent-%COMP%]   keep[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   standalone.\n//\n//[_ngcontent-%COMP%]   Positive[_ngcontent-%COMP%]   `outline-offset`[_ngcontent-%COMP%]   paints[_ngcontent-%COMP%]   outside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   button;[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   pixels[_ngcontent-%COMP%]   behind[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   header's\n//[_ngcontent-%COMP%]   fixed[_ngcontent-%COMP%]   `#fff`[_ngcontent-%COMP%]   (`.detail-header` above)[_ngcontent-%COMP%], not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   themed[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   chrome.[_ngcontent-%COMP%]   In[_ngcontent-%COMP%]   dark[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   kawaii[_ngcontent-%COMP%], \n//[_ngcontent-%COMP%]   `--mat-sys-primary`[_ngcontent-%COMP%]   resolves[_ngcontent-%COMP%]   too[_ngcontent-%COMP%]   pale[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   surface[_ngcontent-%COMP%]   (1.71[_ngcontent-%COMP%]:1).   Use[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   same[_ngcontent-%COMP%]   indigo[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   toggle[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   1.4.11[_ngcontent-%COMP%]   holds[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   white[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   every[_ngcontent-%COMP%]   theme.\n.ke-action-btn.mat-mdc-outlined-button[_ngcontent-%COMP%]:focus {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}\n\n.ke-action-btn.mat-mdc-outlined-button[_ngcontent-%COMP%]:focus-visible {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}\n\n@keyframes _ngcontent-%COMP%_ke-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.ke-status-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  font-size: 13px;\n}\n\n.action-active[_ngcontent-%COMP%] {\n  color: var(--mat-sys-tertiary) !important;\n}\n\n  .mat-mdc-menu-panel.mat-mdc-menu-panel {\n  min-width: 200px;\n\n  .mat-mdc-menu-item {\n    font-size: 13px;\n    height: 40px;\n    min-height: 40px;\n\n    .mat-icon {\n      font-size: 20px;\n      width: 20px;\n      height: 20px;\n      margin-right: 12px;\n      color: #555;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Body[_ngcontent-%COMP%]:   two-column[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   below[_ngcontent-%COMP%]   header\n.detail-body[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: row;\n  min-height: 0;\n  overflow: hidden;\n}\n\n//[_ngcontent-%COMP%]   Left[_ngcontent-%COMP%]   column[_ngcontent-%COMP%]:   tabs[_ngcontent-%COMP%]    + their[_ngcontent-%COMP%]   content\n.detail-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.tabs-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  position: relative;\n  // Tab header stays #fff in every packaged theme; ring must contrast with that surface.\n  --agentic-document-detail-panel-toggle-focus-outline: #3f51b5;\n}\n\n.panel-toggle-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4px;\n  right: 8px;\n  z-index: 2;\n  color: #555;\n\n  &:hover {\n    color: #3f51b5;\n  }\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   #fff[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   every[_ngcontent-%COMP%]   packaged[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]; the[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   toggle's[_ngcontent-%COMP%]   focus[_ngcontent-%COMP%]   ring\n//[_ngcontent-%COMP%]   (`document-detail-panel-toggle-focus.scss`)[_ngcontent-%COMP%]   assumes[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   surface.\n.detail-tabs[_ngcontent-%COMP%] {\n  --nxs-tabs-header-surface: #fff;\n  --nxs-tabs-header-border: #e0e0e0;\n  --nxs-tabs-focus-outline: var(--agentic-document-detail-panel-toggle-focus-outline);\n  --nxs-tabs-icon-color: #6366f1;\n}\n\n//[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   contributed[_ngcontent-%COMP%]   View[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   body[_ngcontent-%COMP%]   brings[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   layout[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own;[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   body[_ngcontent-%COMP%]   clips,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   scrolls[_ngcontent-%COMP%]   here.\n.document-view-outlet[_ngcontent-%COMP%] {\n  display: block;\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n\n  // The packaged view renders beside it as the fallback; an empty flex child would share the space.\n  &--unresolved {\n    display: none;\n  }\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   details[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   (right sidebar, outside tabs)[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   fixed[_ngcontent-%COMP%]   light[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   every[_ngcontent-%COMP%]   theme,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   its\n//[_ngcontent-%COMP%]   colours[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   pinned[_ngcontent-%COMP%]   here[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   read[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   theme.\n.properties-panel[_ngcontent-%COMP%] {\n  --document-detail-properties-panel-border: #e0e0e0;\n  width: 380px;\n  flex: 0 0 380px;\n  border-left: 1px solid var(--document-detail-properties-panel-border);\n  --nxs-details-panel-surface: var(--document-detail-properties-panel-surface);\n  --nxs-details-panel-text: #333;\n  --nxs-details-panel-divider: #e0e0e0;\n  --nxs-details-panel-muted: var(--document-detail-properties-label-muted);\n}\n\n.detail-properties[_ngcontent-%COMP%] {\n  --nxs-properties-panel-label: var(--document-detail-properties-label-muted);\n  --nxs-properties-panel-value: #333;\n  --nxs-properties-panel-divider: #eee;\n  --nxs-properties-panel-link: #3f51b5;\n}\n\n.no-publications[_ngcontent-%COMP%] {\n  \n\n  color: var(--document-detail-properties-label-muted);\n}\n\n.avatar-sm[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  --document-detail-avatar-surface: #e57373;\n  --document-detail-avatar-text: #fff;\n  background: var(--document-detail-avatar-surface);\n  color: var(--document-detail-avatar-text);\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n//[_ngcontent-%COMP%]   Section[_ngcontent-%COMP%]   dividers[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   titles\n.prop-section-divider[_ngcontent-%COMP%] {\n  height: 1px;\n  background: #f0f0f0;\n  margin: 16px 0;\n}\n\n.section-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: #333;\n  margin: 0 0 8px;\n}\n\n.section-empty[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--document-detail-properties-label-muted);\n  margin: 0;\n}\n\n//[_ngcontent-%COMP%]   Attachments\n.attachment-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 0;\n  border-bottom: 1px solid #f0f0f0;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.attachment-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n  flex: 1;\n}\n\n.attachment-name[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #333;\n  font-weight: 500;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.attachment-size[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #999;\n}\n\n.attachment-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-shrink: 0;\n\n  button {\n    width: 30px !important;\n    height: 30px !important;\n    line-height: 30px !important;\n    color: #555;\n\n    mat-icon {\n      font-size: 18px;\n      width: 18px;\n      height: 18px;\n    }\n\n    &:hover {\n      color: #3f51b5;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Upload[_ngcontent-%COMP%]   attachment[_ngcontent-%COMP%]   zone[_ngcontent-%COMP%]   (label associates with file input for a11y)\n.upload-attachment-zone[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 12px;\n  padding: 14px;\n  border: 2px dashed #ccc;\n  border-radius: 6px;\n  text-align: center;\n  cursor: pointer;\n  transition:\n    border-color 0.15s,\n    background 0.15s;\n\n  &:hover {\n    border-color: var(--mat-sys-primary);\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.upload-link[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n  cursor: pointer;\n}\n\n.collection-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 10px;\n  border-radius: 16px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 12px;\n  font-weight: 500;\n  margin: 2px 4px 2px 0;\n}\n\n.collection-icon[_ngcontent-%COMP%] {\n  font-size: 14px !important;\n  width: 14px !important;\n  height: 14px !important;\n}\n\n//[_ngcontent-%COMP%]   History[_ngcontent-%COMP%]   tab:[_ngcontent-%COMP%]   nxs-document-history[_ngcontent-%COMP%]   fills[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   tab[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   scrolls[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   it.\n.history-container[_ngcontent-%COMP%] {\n  display: block;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 16px 20px;\n}\n\n//[_ngcontent-%COMP%]   Permissions[_ngcontent-%COMP%]   tab\n.permissions-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.perm-section[_ngcontent-%COMP%] {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n}\n\n.perm-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 12px 0 4px;\n}\n\n.perm-section--local[_ngcontent-%COMP%] {\n  border-color: var(--mat-sys-outline-variant, #d0d0d0);\n\n  .perm-section-header {\n    background: var(--mat-sys-surface-container-low, #f8f9fe);\n  }\n\n  .perm-section-title {\n    font-size: 15px;\n  }\n}\n\n.perm-table-wrap[_ngcontent-%COMP%] {\n  padding: 0 16px 16px;\n}\n\n.perm-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.perm-section-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.perm-action-btn[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: #ef5350;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty[_ngcontent-%COMP%] {\n  padding: 24px 20px;\n  text-align: center;\n  font-size: 13px;\n  color: #999;\n}\n\n.perm-empty--local[_ngcontent-%COMP%] {\n  margin: 0 16px 16px;\n  padding: 28px 20px;\n  background: var(--mat-sys-surface-container-lowest, #fafafa);\n  border: 1px dashed var(--mat-sys-outline-variant, #d8d8d8);\n  border-radius: 8px;\n  color: var(--mat-sys-on-surface-variant, #666);\n  font-weight: 500;\n}\n\n.perm-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 8px;\n  table-layout: auto;\n\n  tbody tr {\n    height: auto;\n  }\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.perm-row-actions[_ngcontent-%COMP%] {\n  text-align: right;\n  white-space: nowrap;\n\n  button {\n    color: #999;\n\n    &:hover {\n      color: #555;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Publishing[_ngcontent-%COMP%]   tab\n.publish-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.publish-section[_ngcontent-%COMP%] {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n.publish-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.publish-section-title[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.publish-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.publish-info-bar[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .publish-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: var(--mat-sys-primary);\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.publish-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 32px;\n}\n\n.publish-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 32px 20px;\n  color: #999;\n  gap: 8px;\n\n  mat-icon {\n    font-size: 36px;\n    width: 36px;\n    height: 36px;\n  }\n\n  p {\n    font-size: 13px;\n    margin: 0;\n  }\n}\n\n.publish-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.pub-title-cell[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.pub-doc-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-primary);\n  flex-shrink: 0;\n}\n\n.pub-path[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #666;\n}\n\n.pub-path-text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #333;\n  word-break: break-all;\n}\n\n.pub-publisher[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.pub-avatar[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  font-size: 11px;\n}\n\n.pub-actions-col[_ngcontent-%COMP%] {\n  text-align: right;\n  width: 220px;\n}\n\n.pub-actions-cell[_ngcontent-%COMP%] {\n  text-align: right;\n  white-space: nowrap;\n}\n\n.pub-action-btn[_ngcontent-%COMP%] {\n  font-size: 12px !important;\n  height: 32px !important;\n  padding: 0 16px !important;\n  margin-left: 8px;\n}\n\n.republish-btn[_ngcontent-%COMP%] {\n  background: #3f51b5 !important;\n  color: #fff !important;\n}\n\n.unpublish-all-btn[_ngcontent-%COMP%] {\n  font-size: 12px;\n  height: 32px;\n  padding: 0 16px;\n}\n\n//[_ngcontent-%COMP%]   Section[_ngcontent-%COMP%]   tree[_ngcontent-%COMP%]   picker\n.section-tree[_ngcontent-%COMP%] {\n  padding: 8px 0;\n}\n\n.section-node[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  height: 38px;\n  padding-right: 16px;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-lowest);\n  }\n\n  &--selected {\n    background: var(--mat-sys-primary-container);\n\n    &:hover {\n      background: #dde0f5;\n    }\n  }\n}\n\n.section-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  flex-shrink: 0;\n}\n\n.section-toggle-spacer[_ngcontent-%COMP%] {\n  display: inline-block;\n  width: 24px;\n  flex-shrink: 0;\n}\n\n.section-arrow[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #999;\n  transition: transform 0.2s ease;\n\n  &--expanded {\n    transform: rotate(90deg);\n  }\n}\n\n.section-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #ffa726;\n  flex-shrink: 0;\n}\n\n.section-label[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 13px;\n  color: #333;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.section-check[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-primary);\n  flex-shrink: 0;\n}\n\n//[_ngcontent-%COMP%]   Placeholder[_ngcontent-%COMP%]   tabs\n.tab-placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  color: #999;\n  gap: 12px;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Panel[_ngcontent-%COMP%]   loading[_ngcontent-%COMP%]   \u2500\u2500\n.panel-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Comments[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   \u2500\u2500\n.comments-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Sentiment[_ngcontent-%COMP%]   Analysis[_ngcontent-%COMP%]   \u2500\u2500\n.sentiment-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  padding: 0 0 12px;\n}\n\n.ai-sentiment-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 14px;\n  border: none;\n  border-radius: 20px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  color: #fff;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: opacity 0.2s;\n\n  &:hover:not(:disabled) {\n    opacity: 0.88;\n  }\n  &:disabled {\n    opacity: 0.55;\n    cursor: not-allowed;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.sentiment-summary-panel[_ngcontent-%COMP%] {\n  background: #f5f3ff;\n  border: 1px solid #e0dbfa;\n  border-radius: 10px;\n  padding: 14px 16px;\n  margin-bottom: 14px;\n}\n\n.sentiment-summary-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-weight: 600;\n  font-size: 13px;\n  color: #6366f1;\n  margin-bottom: 6px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #6366f1;\n  }\n}\n\n.sentiment-summary-text[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 13px;\n  color: #374151;\n  line-height: 1.5;\n}\n\n.sentiment-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 8px;\n  border-radius: 10px;\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: capitalize;\n  margin-left: 6px;\n\n  &.sentiment-positive {\n    background: #d1fae5;\n    color: #065f46;\n  }\n  &.sentiment-neutral {\n    background: #e5e7eb;\n    color: #374151;\n  }\n  &.sentiment-negative {\n    background: #fee2e2;\n    color: #991b1b;\n  }\n  &.sentiment-urgent {\n    background: #fef3c7;\n    color: #92400e;\n  }\n}\n\n.sentiment-inline-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n  margin: 4px 0 0;\n  font-size: 12px;\n  color: #6b7280;\n  font-style: italic;\n  line-height: 1.4;\n}\n\n.sentiment-inline-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  color: #8b5cf6;\n  flex-shrink: 0;\n  margin-top: 1px;\n}\n\n.comment-sentiment[_ngcontent-%COMP%] {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n\n  .sentiment-badge {\n    margin-left: 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   \u2500\u2500[_ngcontent-%COMP%]   Activity[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   \u2500\u2500\n.activity-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n.activity-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 10px 0;\n  border-bottom: 1px solid #f0f0f0;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.activity-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 4px;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.activity-user[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #333;\n}\n\n.activity-action[_ngcontent-%COMP%] {\n  color: #555;\n}\n\n.activity-time[_ngcontent-%COMP%] {\n  color: #999;\n  font-size: 11px;\n}\n\n//[_ngcontent-%COMP%]   Publish[_ngcontent-%COMP%]   dialog[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   -[_ngcontent-%COMP%]   remove[_ngcontent-%COMP%]   default[_ngcontent-%COMP%]   Material[_ngcontent-%COMP%]   dialog[_ngcontent-%COMP%]   padding\n::ng-deep[_ngcontent-%COMP%]   .publish-dialog-panel[_ngcontent-%COMP%]   .mat-mdc-dialog-container[_ngcontent-%COMP%]   .mdc-dialog__surface[_ngcontent-%COMP%] {\n  padding: 0;\n}\n\n::ng-deep[_ngcontent-%COMP%]   .publish-dialog-panel[_ngcontent-%COMP%]   .mat-mdc-dialog-container[_ngcontent-%COMP%]   .mdc-dialog__content[_ngcontent-%COMP%] {\n  padding: 0;\n}\n\n::ng-deep[_ngcontent-%COMP%]   .preview-dialog-panel[_ngcontent-%COMP%]   .mat-mdc-dialog-container[_ngcontent-%COMP%]   .mdc-dialog__surface[_ngcontent-%COMP%] {\n  padding: 0;\n  overflow: hidden;\n  border-radius: 8px;\n}\n\n::ng-deep[_ngcontent-%COMP%]   .preview-dialog-panel[_ngcontent-%COMP%]   .mat-mdc-dialog-container[_ngcontent-%COMP%]   .mdc-dialog__content[_ngcontent-%COMP%] {\n  padding: 0;\n  max-height: none;\n}\n\n\n.trashed-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: #e3f2fd;\n  border-bottom: 1px solid #90caf9;\n  flex-shrink: 0;\n\n  .trashed-banner-icon {\n    color: #1565c0;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .trashed-banner-text {\n    font-size: 13px;\n    color: #0d47a1;\n    font-weight: 500;\n  }\n\n  .trashed-banner-spacer {\n    flex: 1;\n  }\n\n  .trashed-banner-btn {\n    white-space: nowrap;\n    font-size: 12px;\n    display: inline-flex;\n    align-items: center;\n    gap: 4px;\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n    }\n    &--danger {\n      color: #d32f2f;\n      border-color: #d32f2f;\n    }\n  }\n}\n\n.action-danger[_ngcontent-%COMP%] {\n  color: #d32f2f !important;\n}\n\n\n\n.workflow-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: #fef3e0;\n  border-bottom: 1px solid #f5d9a0;\n  flex-shrink: 0;\n\n  .workflow-banner-icon {\n    color: #e6a117;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .workflow-banner-text {\n    font-size: 13px;\n    color: #5d4037;\n\n    strong {\n      font-weight: 600;\n    }\n  }\n\n  .workflow-banner-spacer {\n    flex: 1;\n  }\n\n  .workflow-banner-abandon {\n    color: #d84315;\n    font-weight: 600;\n    font-size: 13px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    white-space: nowrap;\n  }\n}\n\n\n\n.task-action-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: var(--mat-sys-primary, #1a73e8);\n  flex-shrink: 0;\n\n  .task-action-icon {\n    color: #fff;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .task-action-text {\n    font-size: 13px;\n    color: #fff;\n\n    strong {\n      font-weight: 600;\n    }\n  }\n\n  .task-action-spacer {\n    flex: 1;\n  }\n\n  .task-action-btn {\n    background: #fff;\n    color: var(--mat-sys-primary, #1a73e8);\n    font-weight: 600;\n    font-size: 13px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    border-radius: 4px;\n    min-width: 90px;\n  }\n}\n\n\n\n.start-process-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: rgba(0, 0, 0, 0.32);\n  z-index: 1000;\n  cursor: pointer;\n  appearance: none;\n  font: inherit;\n}\n\n.start-process-dialog[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 1001;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);\n  padding: 32px 40px;\n  min-width: 420px;\n  max-width: 520px;\n  width: 90vw;\n\n  .start-process-title {\n    margin: 0 0 24px;\n    font-size: 20px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface, #212121);\n  }\n\n  .start-process-label {\n    display: block;\n    font-size: 13px;\n    color: var(--mat-sys-on-surface-variant, #666);\n    margin-bottom: 8px;\n  }\n\n  .start-process-field {\n    width: 100%;\n  }\n\n  .start-process-loading {\n    display: flex;\n    justify-content: center;\n    padding: 32px 0;\n  }\n\n  .start-process-empty {\n    font-size: 14px;\n    color: var(--mat-sys-on-surface-variant, #666);\n    text-align: center;\n    padding: 20px 0;\n    margin: 0;\n  }\n\n  .start-process-actions {\n    display: flex;\n    justify-content: flex-end;\n    margin-top: 16px;\n  }\n\n  .start-process-btn {\n    min-width: 100px;\n    text-transform: uppercase;\n    font-weight: 500;\n    letter-spacing: 0.5px;\n  }\n\n  .inline-spinner {\n    display: inline-block;\n    margin-right: 6px;\n    vertical-align: middle;\n  }\n}\n\n//[_ngcontent-%COMP%]   AI[_ngcontent-%COMP%]   Insights[_ngcontent-%COMP%]   Tab\n\n.ai-tab-content[_ngcontent-%COMP%] {\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  \n\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n//[_ngcontent-%COMP%]   Hero[_ngcontent-%COMP%]   Header\n.ai-insights-hero[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 0 0 4px;\n}\n\n.ai-insights-hero-text[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.ai-insights-title[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0 0 4px;\n}\n\n.ai-insights-subtitle[_ngcontent-%COMP%] {\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  margin: 0;\n  max-width: 520px;\n}\n\n//[_ngcontent-%COMP%]   2x2[_ngcontent-%COMP%]   Card[_ngcontent-%COMP%]   Grid\n.ai-insights-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n\n  @media (max-width: 800px) {\n    grid-template-columns: 1fr;\n  }\n}\n\n//[_ngcontent-%COMP%]   Card[_ngcontent-%COMP%]   Base\n.ai-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #dde1e6);\n  border-radius: 12px;\n  padding: 16px;\n  transition: box-shadow 0.2s ease;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);\n  }\n}\n\n.ai-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 6px;\n}\n\n.ai-card-icon[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &--purple {\n    background: rgba(99, 102, 241, 0.1);\n\n    mat-icon {\n      color: #6366f1;\n    }\n  }\n\n  &--indigo {\n    background: rgba(99, 102, 241, 0.08);\n\n    mat-icon {\n      color: #818cf8;\n    }\n  }\n}\n\n.ai-card-title[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 14px;\n  font-weight: 600;\n  margin: 0;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.ai-card-desc[_ngcontent-%COMP%] {\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  margin: 0 0 12px;\n}\n\n.ai-card-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n}\n\n.ai-card-actions[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  display: flex;\n  justify-content: center;\n  gap: 10px;\n\n  &--dual {\n    justify-content: flex-start;\n  }\n}\n\n//[_ngcontent-%COMP%]   Buttons\n.ai-btn-primary[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #6366f1, #818cf8) !important;\n  color: #fff !important;\n  border: none !important;\n  border-radius: 8px !important;\n  padding: 0 14px !important;\n  height: 32px;\n  font-size: 12px;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: filter 0.15s ease;\n\n  &:hover:not([disabled]) {\n    filter: brightness(1.08);\n  }\n\n  &[disabled] {\n    opacity: 0.6;\n    cursor: default;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n\n  &.ai-btn-sm {\n    height: 34px;\n    padding: 0 14px !important;\n    border-radius: 8px !important;\n    font-size: 12px;\n    margin-left: auto;\n  }\n\n  &.ai-btn-full {\n    min-width: 140px;\n    justify-content: center;\n  }\n}\n\n.ai-btn-outline[_ngcontent-%COMP%] {\n  border: 1px solid #6366f1 !important;\n  color: #6366f1 !important;\n  background: transparent !important;\n  border-radius: 10px !important;\n  padding: 0 18px !important;\n  height: 38px;\n  font-size: 13px;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover:not([disabled]) {\n    background: rgba(99, 102, 241, 0.06) !important;\n  }\n\n  &[disabled] {\n    opacity: 0.6;\n    cursor: default;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n\n    circle {\n      stroke: #6366f1;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Loading[_ngcontent-%COMP%]   Skeleton\n.ai-loading-skeleton[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n\n  .skeleton-line {\n    height: 14px;\n    border-radius: 6px;\n    background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);\n    background-size: 200% 100%;\n    animation: shimmer 1.5s infinite;\n  }\n\n  .wide {\n    width: 100%;\n  }\n  .medium {\n    width: 70%;\n  }\n  .short {\n    width: 40%;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   Placeholder[_ngcontent-%COMP%]   Quote\n.ai-placeholder-quote[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  border-left: 3px solid #6366f1;\n  border-radius: 0 10px 10px 0;\n  padding: 14px 16px;\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    font-style: italic;\n    line-height: 1.6;\n    color: var(--mat-sys-on-surface-variant, #8b8fa4);\n  }\n}\n\n//[_ngcontent-%COMP%]   Summary[_ngcontent-%COMP%]   Result\n.ai-summary-result[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  border-left: 3px solid #6366f1;\n  border-radius: 0 8px 8px 0;\n  padding: 12px 14px;\n}\n\n.ai-summary-text[_ngcontent-%COMP%] {\n  font-size: 13px;\n  line-height: 1.6;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0;\n}\n\n.ai-key-points[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  font-size: 13px;\n\n  strong {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  ul {\n    margin: 8px 0 0;\n    padding-left: 20px;\n\n    li {\n      margin-bottom: 4px;\n      line-height: 1.5;\n      color: var(--mat-sys-on-surface-variant, #5c5f6b);\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Tags\n.ai-tags-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n\n.ai-tag-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 16px;\n  font-size: 12px;\n  border: 1px solid rgba(99, 102, 241, 0.2);\n  background: rgba(99, 102, 241, 0.04);\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  transition: all 0.2s ease;\n\n  &:hover {\n    background: rgba(99, 102, 241, 0.1);\n    border-color: #6366f1;\n\n    .ai-tag-add {\n      opacity: 1;\n    }\n  }\n}\n\n.ai-tag-label[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  font-weight: 500;\n}\n\n.ai-tag-confidence[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #6366f1;\n  font-weight: 600;\n}\n\n.ai-tag-add[_ngcontent-%COMP%] {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: #6366f1;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n}\n\n//[_ngcontent-%COMP%]   Classification[_ngcontent-%COMP%]   Metadata[_ngcontent-%COMP%]   Rows\n.ai-meta-rows[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-meta-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e4e6eb);\n  gap: 12px;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.ai-meta-key[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  white-space: nowrap;\n}\n\n.ai-meta-val[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  text-align: right;\n\n  &--muted {\n    color: var(--mat-sys-on-surface-variant, #9498a9);\n    font-style: italic;\n  }\n}\n\n//[_ngcontent-%COMP%]   Document[_ngcontent-%COMP%]   Thumbnails[_ngcontent-%COMP%]   (placeholder)\n.ai-doc-thumbs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n\n.ai-doc-thumb[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 20px 12px;\n  border: 1px dashed var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 12px;\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  color: var(--mat-sys-on-surface-variant, #9498a9);\n  font-size: 12px;\n\n  &--skeleton {\n    border-style: solid;\n    border-color: rgba(99, 102, 241, 0.15);\n    background: rgba(99, 102, 241, 0.04);\n    color: #6366f1;\n    font-size: 11px;\n  }\n}\n\n.ai-doc-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  color: var(--mat-sys-on-surface-variant, #b0b4c4);\n}\n\n//[_ngcontent-%COMP%]   Similar[_ngcontent-%COMP%]   Documents[_ngcontent-%COMP%]   List\n.ai-similar-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.ai-similar-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 12px;\n  border: 1px solid var(--mat-sys-outline-variant, #dde1e6);\n  border-radius: 10px;\n  background: none;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f6f7fb);\n    border-color: rgba(99, 102, 241, 0.3);\n  }\n}\n\n.ai-similar-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.ai-similar-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-similar-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-similar-path[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-similar-score[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  color: #6366f1;\n  flex-shrink: 0;\n}\n\n//[_ngcontent-%COMP%]   Error[_ngcontent-%COMP%]   Banner\n.ai-error-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 12px;\n  background: #fdecea;\n  color: #d32f2f;\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n//[_ngcontent-%COMP%]   NXENG-944[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   WCAG[_ngcontent-%COMP%]   2.1[_ngcontent-%COMP%]   SC[_ngcontent-%COMP%]   1.3.4[_ngcontent-%COMP%]   Orientation:[_ngcontent-%COMP%]   reflow[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   narrow[_ngcontent-%COMP%]   viewports[_ngcontent-%COMP%]   (max-width only).\n@media[_ngcontent-%COMP%]   (max-width: 900px)[_ngcontent-%COMP%] {\n  .detail-body {\n    flex-direction: column;\n  }\n\n  .properties-panel {\n    width: 100%;\n    flex: 0 0 auto;\n    max-height: 50vh;\n    max-height: min(50dvh, 50vh);\n    border-left: none;\n    border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  }\n}", "//[_ngcontent-%COMP%]   NXENG-826[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   arrow_back[_ngcontent-%COMP%]   via[_ngcontent-%COMP%]   codepoint[_ngcontent-%COMP%]   (no[_ngcontent-%COMP%]   ligature[_ngcontent-%COMP%]   text[_ngcontent-%COMP%]; legacy Material Icons font).\n.detail-header[_ngcontent-%COMP%]   mat-icon.detail-header-go-back-icon[_ngcontent-%COMP%]::before {\n  content: '\\e5c4';\n  font: 24px/1 'Material Icons';\n}", "//[_ngcontent-%COMP%]   NXSAT-516[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   1808686844[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   standalone[_ngcontent-%COMP%]   stylesheet[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   main[_ngcontent-%COMP%]   document-detail[_ngcontent-%COMP%]   bundle[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   under[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   36[_ngcontent-%COMP%]   kB[_ngcontent-%COMP%]   cap.\n.detail-header-go-back-btn.mat-mdc-icon-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}", "//[_ngcontent-%COMP%]   NXSAT-544[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   2834597055[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   standalone[_ngcontent-%COMP%]   stylesheet[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   document-detail.scss[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   under[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   36[_ngcontent-%COMP%]   kB[_ngcontent-%COMP%]   cap.\n//[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   keep[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   standalone[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%], not\n//[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   comma[_ngcontent-%COMP%]   list[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus-visible`   (see AGENTS/08-bug-patterns.md \u00A717).\n.panel-toggle-btn.mat-mdc-icon-button[_ngcontent-%COMP%]:focus {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-panel-toggle-focus-outline);\n  outline-offset: 2px;\n}", "//[_ngcontent-%COMP%]   NXSAT-332[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   standalone[_ngcontent-%COMP%]   stylesheet[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   main[_ngcontent-%COMP%]   document-detail[_ngcontent-%COMP%]   bundle[_ngcontent-%COMP%]   stays[_ngcontent-%COMP%]   under[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   36[_ngcontent-%COMP%]   kB[_ngcontent-%COMP%]   cap.\n.version-banner[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 4px 10px;\n  padding: 8px 16px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  flex-shrink: 0;\n\n  .version-banner-icon {\n    color: var(--mat-sys-on-surface-variant);\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  // Grows to push the actions right; below its basis the actions wrap onto their own line\n  // rather than squeezing each other at 320 CSS pixels (WCAG 1.4.10).\n  .version-banner-text {\n    flex: 1 1 12rem;\n    font-size: 13px;\n    font-weight: 500;\n  }\n\n  .version-banner-latest,\n  .version-banner-restore {\n    flex-shrink: 0;\n    white-space: nowrap;\n  }\n\n  .version-banner-restore mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentDetailComponent, [{
        type: Component,
        args: [{ selector: 'lib-document-detail', standalone: true, imports: [
                    NxsCommentExtraDirective,
                    NxsCommentsComponent,
                    NxsTagEditorComponent,
                    NxsDetailsPanelComponent,
                    NxsDocumentHistoryComponent,
                    NxsDocumentToolbarComponent,
                    NxsErrorStateComponent,
                    NxsManageVersionsComponent,
                    NxsPropertiesPanelComponent,
                    NxsSpinnerComponent,
                    NxsTabBodyDirective,
                    NxsTabsComponent,
                    NxsTagComponent,
                    CdkAriaLive,
                    TranslatePipe,
                    DatePipe,
                    NgTemplateOutlet,
                    FormsModule,
                    MatIconModule,
                    MatButtonModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                    MatMenuModule,
                    MatDialogModule,
                    MatDividerModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    DocumentLayoutComponent,
                    DocumentViewerComponent,
                    ExtensionOutletComponent,
                    NxsPermissionsPanelComponent,
                    NoteEditorComponent,
                    SatAvatarModule,
                    SatBreadcrumbsComponent,
                    SatTagModule,
                ], providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter(), provideNxsToast()], template: "@if (loading()) {\n  <div class=\"detail-loading\">\n    <nxs-spinner diameter=\"40\" [label]=\"'document-detail.document-detail.loading' | translate\" />\n  </div>\n} @else if (error(); as message) {\n  <nxs-error-state\n    class=\"detail-error\"\n    [status]=\"errorStatus()\"\n    [heading]=\"message\"\n    [headingLevel]=\"1\"\n  >\n    <button mat-stroked-button type=\"button\" (click)=\"goBack()\">\n      <mat-icon aria-hidden=\"true\">arrow_back</mat-icon>\n      {{ 'document-detail.document-detail.go-back-2' | translate }}\n    </button>\n  </nxs-error-state>\n} @else if (doc()) {\n  <!-- Header -->\n  <div class=\"detail-header\">\n    <button\n      mat-icon-button\n      class=\"detail-header-go-back-btn\"\n      (click)=\"goBack()\"\n      [attr.aria-label]=\"'document-detail.document-detail.go-back' | translate\"\n    >\n      <!-- NXENG-826: empty mat-icon + CSS codepoint (legacy Material Icons font \u2014 fontIcon needs a class set). -->\n      <mat-icon aria-hidden=\"true\" class=\"detail-header-go-back-icon\"></mat-icon>\n    </button>\n    <div class=\"header-info\">\n      <div class=\"header-title\" role=\"heading\" aria-level=\"1\">{{ doc()!.title }}</div>\n      <sat-breadcrumbs\n        [items]=\"breadcrumbItems()\"\n        (click)=\"onBreadcrumbClick($event)\"\n      ></sat-breadcrumbs>\n    </div>\n    <nxs-document-toolbar\n      class=\"header-actions\"\n      [actions]=\"toolbarEntries()\"\n      [moreLabel]=\"'document-detail.document-detail.more-actions' | translate\"\n      (selected)=\"runToolbarEntry($event)\"\n    >\n      @if (!isTrashed() && !isVersionView() && supportsTextKnowledgeEnrichment()) {\n        <div class=\"ke-action-group\">\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"ke-action-btn\"\n            [disabled]=\"keActionInFlight() !== null\"\n            (click)=\"runTextEntityExtraction()\"\n          >\n            @if (isKeActionRunning('named-entity-recognition-text')) {\n              <mat-icon class=\"ke-spinning\">autorenew</mat-icon>\n            } @else {\n              <mat-icon>sell</mat-icon>\n            }\n            {{ 'document-detail.document-detail.extract-named-entities-text' | translate }}\n          </button>\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"ke-action-btn\"\n            [disabled]=\"keActionInFlight() !== null\"\n            (click)=\"runTextClassification()\"\n          >\n            @if (isKeActionRunning('text-classification')) {\n              <mat-icon class=\"ke-spinning\">autorenew</mat-icon>\n            } @else {\n              <mat-icon>category</mat-icon>\n            }\n            {{ 'document-detail.document-detail.classify-document' | translate }}\n          </button>\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"ke-action-btn\"\n            [disabled]=\"keActionInFlight() !== null\"\n            (click)=\"runTextSummarization()\"\n          >\n            @if (isKeActionRunning('text-summarization')) {\n              <mat-icon class=\"ke-spinning\">autorenew</mat-icon>\n            } @else {\n              <mat-icon>short_text</mat-icon>\n            }\n            {{ 'document-detail.document-detail.summarize-document' | translate }}\n          </button>\n        </div>\n      }\n\n      @if (!isTrashed() && !isVersionView() && supportsImageKnowledgeEnrichment()) {\n        <div class=\"ke-action-group\">\n          <button\n            type=\"button\"\n            mat-stroked-button\n            class=\"ke-action-btn\"\n            [disabled]=\"keActionInFlight() !== null\"\n            (click)=\"runImageEnrichment()\"\n          >\n            @if (isKeActionRunning('image-enrichment')) {\n              <mat-icon class=\"ke-spinning\">autorenew</mat-icon>\n            } @else {\n              <mat-icon>image_search</mat-icon>\n            }\n            {{ 'document-detail.document-detail.describe-image' | translate }}\n          </button>\n        </div>\n      }\n\n      @if (!isTrashed() && !isVersionView() && showsContentLakeIngestAction()) {\n        @if (contentLakeIngestInFlight() || contentLakePresenceChecking()) {\n          <span\n            class=\"content-lake-ingest-loader\"\n            [matTooltip]=\"\n              contentLakeIngestInFlight()\n                ? ('document-detail.ingesting-into-content-lake' | translate)\n                : ('document-detail.checking-content-lake-status' | translate)\n            \"\n            [attr.aria-label]=\"\n              contentLakeIngestInFlight()\n                ? ('document-detail.ingesting-into-content-lake' | translate)\n                : ('document-detail.checking-content-lake-status' | translate)\n            \"\n            aria-busy=\"true\"\n          >\n            <mat-spinner\n              diameter=\"24\"\n              [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n            />\n          </span>\n        } @else if (showsContentLakeIngested()) {\n          <span\n            class=\"content-lake-ingest-marker\"\n            [matTooltip]=\"'document-detail.document-detail.indexed-in-content-lake' | translate\"\n            matTooltipClass=\"mat-tooltip-multiline\"\n            matTooltipPosition=\"below\"\n            [attr.aria-label]=\"\n              'document-detail.document-detail.already-in-content-lake' | translate\n            \"\n          >\n            <button\n              mat-icon-button\n              type=\"button\"\n              disabled\n              tabindex=\"-1\"\n              [attr.aria-label]=\"\n                'document-detail.document-detail.already-ingested-to-content-lake' | translate\n              \"\n            >\n              <mat-icon>cloud_done</mat-icon>\n            </button>\n          </span>\n        } @else {\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"content-lake-ingest-btn\"\n            [matTooltip]=\"'document-detail.document-detail.ingest-to-content-lake' | translate\"\n            [disabled]=\"keActionInFlight() !== null\"\n            (click)=\"ingestToContentLake()\"\n          >\n            <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n              'document-detail.document-detail.ingest-to-content-lake' | translate\n            }}</span>\n            <mat-icon aria-hidden=\"true\">cloud_upload</mat-icon>\n          </button>\n        }\n      }\n    </nxs-document-toolbar>\n  </div>\n\n  @if (keStatus() || keError()) {\n    <div class=\"ke-status-banner\" [class.ke-status-banner--error]=\"keError()\">\n      <mat-icon>{{ keError() ? 'error_outline' : 'auto_awesome' }}</mat-icon>\n      <span>{{ keError() || keStatus() }}</span>\n    </div>\n  }\n\n  @if ((contentLakeIngestStatus() || contentLakeIngestError()) && !contentLakeIngestInFlight()) {\n    <div class=\"ke-status-banner\" [class.ke-status-banner--error]=\"contentLakeIngestError()\">\n      <mat-icon>{{ contentLakeIngestError() ? 'error_outline' : 'cloud_upload' }}</mat-icon>\n      <span>{{ contentLakeIngestError() || contentLakeIngestStatus() }}</span>\n    </div>\n  }\n\n  @if (isTrashed()) {\n    <div class=\"trashed-banner\">\n      <mat-icon class=\"trashed-banner-icon\">info</mat-icon>\n      <span class=\"trashed-banner-text\">{{\n        'document-detail.document-detail.you-are-viewing-a-trashed-document' | translate\n      }}</span>\n      <span class=\"trashed-banner-spacer\"></span>\n      @if (canWriteDoc()) {\n        <button\n          mat-stroked-button\n          class=\"trashed-banner-btn\"\n          (click)=\"restoreFromTrash()\"\n          [disabled]=\"actionInProgress() === 'restore'\"\n        >\n          <mat-icon>restore_from_trash</mat-icon>\n          {{ 'document-detail.document-detail.restore' | translate }}\n        </button>\n      }\n      @if (canRemoveDoc()) {\n        <button\n          mat-stroked-button\n          class=\"trashed-banner-btn trashed-banner-btn--danger\"\n          (click)=\"permanentlyDelete()\"\n          [disabled]=\"actionInProgress() === 'permanentDelete'\"\n        >\n          <mat-icon>delete_forever</mat-icon>\n          {{ 'document-detail.document-detail.delete-permanently' | translate }}\n        </button>\n      }\n    </div>\n  }\n\n  @if (isVersionView()) {\n    <div class=\"version-banner\">\n      <mat-icon class=\"version-banner-icon\">info</mat-icon>\n      <span class=\"version-banner-text\">{{\n        'document-detail.version-viewing' | translate: { version: versionLabel() }\n      }}</span>\n      <button mat-button type=\"button\" class=\"version-banner-latest\" (click)=\"showLatestVersion()\">\n        {{ 'document-detail.version-go-to-latest' | translate }}\n      </button>\n      @if (canRestoreVersion()) {\n        <button\n          mat-flat-button\n          type=\"button\"\n          class=\"version-banner-restore\"\n          (click)=\"confirmRestoreVersion()\"\n          [disabled]=\"actionInProgress() === 'restore'\"\n        >\n          <mat-icon>restore</mat-icon>\n          {{ 'document-detail.version-restore' | translate: { version: versionLabel() } }}\n        </button>\n      }\n    </div>\n  }\n\n  <!-- Workflow info banner (yellow) \u2014 one per running workflow -->\n  @for (wf of documentWorkflows(); track wf.id) {\n    <div class=\"workflow-banner\">\n      <mat-icon class=\"workflow-banner-icon\">warning</mat-icon>\n      <span class=\"workflow-banner-text\">\n        {{\n          'document-detail.workflow-started-on-document'\n            | translate: { workflow: workflowDisplayName(wf) }\n        }}\n      </span>\n      <span class=\"workflow-banner-spacer\"></span>\n      <button\n        mat-button\n        class=\"workflow-banner-abandon\"\n        [disabled]=\"abandoningWorkflow()\"\n        (click)=\"abandonWorkflow(wf)\"\n      >\n        {{ 'document-detail.document-detail.abandon' | translate }}\n      </button>\n    </div>\n  }\n\n  <!-- Task action banner (blue) \u2014 one per pending task -->\n  @for (task of documentTasks(); track task.id) {\n    <div class=\"task-action-banner\">\n      <mat-icon class=\"task-action-icon\">check_box</mat-icon>\n      <span class=\"task-action-text\">\n        {{ 'document-detail.document-detail.you-have-a-task-to-process' | translate }}\n        @if (taskDueLabel(task)) {\n          {{ 'document-detail.task-due-before' | translate: { due: taskDueLabel(task) } }}\n        }\n      </span>\n      <span class=\"task-action-spacer\"></span>\n      <button mat-flat-button class=\"task-action-btn\" (click)=\"goToTask(task)\">\n        {{ 'document-detail.document-detail.process' | translate }}\n      </button>\n    </div>\n  }\n\n  <!-- Start Process modal dialog -->\n  @if (showStartProcessPanel()) {\n    <button\n      type=\"button\"\n      class=\"start-process-backdrop\"\n      (click)=\"closeStartProcess()\"\n      [attr.aria-label]=\"'document-detail.document-detail.close-start-process-dialog' | translate\"\n    ></button>\n    <div class=\"start-process-dialog\">\n      <div class=\"start-process-title\" role=\"heading\" aria-level=\"2\">\n        {{ 'document-detail.document-detail.start-process' | translate }}\n      </div>\n\n      @if (workflowsLoading()) {\n        <div class=\"start-process-loading\">\n          <mat-spinner\n            diameter=\"28\"\n            [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n          />\n        </div>\n      } @else if (availableWorkflows().length === 0) {\n        <p class=\"start-process-empty\">\n          {{ 'document-detail.document-detail.no-workflow-models-available' | translate }}\n        </p>\n      } @else {\n        <mat-form-field appearance=\"outline\" class=\"start-process-field\">\n          <mat-label class=\"start-process-label\">{{\n            'document-detail.document-detail.choose-process' | translate\n          }}</mat-label>\n          <mat-select\n            [value]=\"selectedWorkflowModel()\"\n            (selectionChange)=\"selectedWorkflowModel.set($event.value)\"\n          >\n            @for (wf of availableWorkflows(); track wf.name) {\n              <mat-option [value]=\"wf.name\">{{ workflowDisplayName(wf) }}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n\n        <div class=\"start-process-actions\">\n          <button\n            mat-flat-button\n            color=\"primary\"\n            class=\"start-process-btn\"\n            [disabled]=\"!selectedWorkflowModel() || startingWorkflow()\"\n            (click)=\"startProcess()\"\n          >\n            @if (startingWorkflow()) {\n              <mat-spinner\n                diameter=\"18\"\n                class=\"inline-spinner\"\n                [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n              />\n            }\n            {{ 'document-detail.document-detail.start' | translate }}\n          </button>\n        </div>\n      }\n    </div>\n  }\n\n  <!-- Main body: tabs on left, properties panel on right -->\n  <div class=\"detail-body\">\n    <!-- Left: Tabs + content -->\n    <div class=\"detail-main\">\n      <div class=\"tabs-header-row\">\n        <nxs-tabs\n          class=\"detail-tabs\"\n          [tabs]=\"detailTabEntries()\"\n          [selectedIndex]=\"activeTabIndex()\"\n          (selectedIndexChange)=\"onTabChange($event)\"\n        >\n          <ng-template nxsTabBody let-tab>\n            @switch (tab.id) {\n              @case ('app.tabs.view') {\n                <ng-container [ngTemplateOutlet]=\"viewTabContent\" />\n              }\n              @case ('app.tabs.annotations') {\n                <ng-container [ngTemplateOutlet]=\"annotationsTabContent\" />\n              }\n              @case ('app.tabs.permissions') {\n                <ng-container [ngTemplateOutlet]=\"permissionsTabContent\" />\n              }\n              @case ('app.tabs.history') {\n                <ng-container [ngTemplateOutlet]=\"historyTabContent\" />\n              }\n              @case ('app.tabs.publishing') {\n                <ng-container [ngTemplateOutlet]=\"publishingTabContent\" />\n              }\n              @case ('app.tabs.aiInsights') {\n                <ng-container [ngTemplateOutlet]=\"aiInsightsTabContent\" />\n              }\n              @default {\n                <lib-extension-outlet [componentId]=\"tabComponentId(tab.id)\" />\n              }\n            }\n          </ng-template>\n        </nxs-tabs>\n\n        <ng-template #viewTabContent>\n          @if (documentView(); as view) {\n            <lib-extension-outlet\n              #documentViewOutlet\n              class=\"document-view-outlet\"\n              [class.document-view-outlet--unresolved]=\"documentViewOutlet.unresolved()\"\n              [attr.data-document-view-id]=\"view.id\"\n              [componentId]=\"view.componentId ?? view.id\"\n              [componentInputs]=\"documentViewInputs()\"\n            />\n            @if (documentViewOutlet.unresolved()) {\n              <ng-container [ngTemplateOutlet]=\"packagedViewContent\" />\n            }\n          } @else {\n            <ng-container [ngTemplateOutlet]=\"packagedViewContent\" />\n          }\n        </ng-template>\n\n        <ng-template #packagedViewContent>\n          @switch (packagedDocumentView()) {\n            @case ('noteEditor') {\n              <lib-note-editor\n                [content]=\"noteEditorBody()\"\n                [mimeType]=\"mimeType()\"\n                [uploadParentPath]=\"noteImageUploadParentPath()\"\n                [loading]=\"viewerLoading()\"\n                [saving]=\"noteSaving()\"\n                [autoFocus]=\"focusNoteEditor()\"\n                [readOnly]=\"!canWriteDoc()\"\n                (saveNote)=\"saveNote($event)\"\n                (focused)=\"focusNoteEditor.set(false)\"\n              />\n            }\n            @default {\n              <lib-document-viewer\n                [blobUrl]=\"blobUrl()\"\n                [rawBlobUrl]=\"rawBlobUrl()\"\n                [blobType]=\"mainBlobType()\"\n                [mimeType]=\"mimeType()\"\n                [fileName]=\"fileName()\"\n                [fileSize]=\"fileSize()\"\n                [loading]=\"viewerLoading()\"\n                [noteContent]=\"noteContent()\"\n                [noteHtml]=\"noteHtml()\"\n                [videoSources]=\"videoSources()\"\n                [storyboard]=\"storyboard()\"\n                [posterUrl]=\"posterUrl()\"\n                [hasPdfRendition]=\"hasPdfRendition()\"\n                [previewUrl]=\"previewUrl()\"\n                [pictureInfo]=\"pictureInfo()\"\n                [pictureViews]=\"pictureViews()\"\n                [exifData]=\"exifData()\"\n                [iptcData]=\"iptcData()\"\n                [videoInfo]=\"videoInfo()\"\n                [arenderUrl]=\"arenderUrl()\"\n                [arenderReloadId]=\"arenderReloadId()\"\n                [viewerDocUid]=\"doc()?.uid ?? ''\"\n                [annotationsTab]=\"false\"\n                [showMainFileControls]=\"!!fileName() && canWriteDoc() && !isTrashed()\"\n                [mainFileActionInProgress]=\"actionInProgress()\"\n                (downloadClicked)=\"download()\"\n                (previewClicked)=\"previewMainBlob()\"\n                (openWithDriveClicked)=\"openDriveDialog()\"\n                (formatDownload)=\"downloadPictureFormat($event)\"\n                (replaceMainFileClicked)=\"openReplaceMainFileDialog()\"\n                (removeMainFileClicked)=\"openRemoveMainFileDialog()\"\n              />\n            }\n          }\n        </ng-template>\n\n        <ng-template #annotationsTabContent>\n          <lib-document-viewer\n            [blobUrl]=\"blobUrl()\"\n            [rawBlobUrl]=\"rawBlobUrl()\"\n            [blobType]=\"mainBlobType()\"\n            [mimeType]=\"mimeType()\"\n            [fileName]=\"fileName()\"\n            [fileSize]=\"fileSize()\"\n            [loading]=\"viewerLoading()\"\n            [noteContent]=\"noteContent()\"\n            [noteHtml]=\"noteHtml()\"\n            [videoSources]=\"videoSources()\"\n            [storyboard]=\"storyboard()\"\n            [posterUrl]=\"posterUrl()\"\n            [hasPdfRendition]=\"hasPdfRendition()\"\n            [previewUrl]=\"previewUrl()\"\n            [pictureInfo]=\"pictureInfo()\"\n            [pictureViews]=\"pictureViews()\"\n            [exifData]=\"exifData()\"\n            [iptcData]=\"iptcData()\"\n            [videoInfo]=\"videoInfo()\"\n            [arenderUrl]=\"arenderUrl()\"\n            [arenderReloadId]=\"arenderReloadId()\"\n            [viewerDocUid]=\"doc()?.uid ?? ''\"\n            [annotationsTab]=\"true\"\n            [showMainFileControls]=\"\n              !isNoteDocument() && !!fileName() && canWriteDoc() && !isTrashed()\n            \"\n            [mainFileActionInProgress]=\"actionInProgress()\"\n            (downloadClicked)=\"download()\"\n            (previewClicked)=\"previewMainBlob()\"\n            (openWithDriveClicked)=\"openDriveDialog()\"\n            (formatDownload)=\"downloadPictureFormat($event)\"\n            (replaceMainFileClicked)=\"openReplaceMainFileDialog()\"\n            (removeMainFileClicked)=\"openRemoveMainFileDialog()\"\n          />\n        </ng-template>\n\n        <ng-template #permissionsTabContent>\n          <div class=\"permissions-container\">\n            <!-- Local and inherited permissions: the nxs- panel, resolved by its registered ID so a\n                 customer library can re-register a replacement. -->\n            @if (doc(); as current) {\n              <lib-extension-outlet\n                #permissionsPanelOutlet\n                [componentId]=\"permissionsPanelId\"\n                [componentInputs]=\"{\n                  documentId: current.uid,\n                  permissionsChanged: onPermissionsChanged,\n                }\"\n              />\n              @if (permissionsPanelOutlet.unresolved()) {\n                <nxs-permissions-panel\n                  [documentId]=\"current.uid\"\n                  [permissionsChanged]=\"onPermissionsChanged\"\n                />\n              }\n            }\n\n            @if (permissionsLoading()) {\n              <div class=\"perm-loading\">\n                <nxs-spinner\n                  diameter=\"28\"\n                  [label]=\"'document-detail.document-detail.loading' | translate\"\n                />\n              </div>\n            }\n            <!-- Permissions Assigned to External Users -->\n            @if (showExternalShares()) {\n              <section class=\"perm-section\">\n                <div class=\"perm-section-header\">\n                  <div class=\"perm-section-title\" role=\"heading\" aria-level=\"3\">\n                    {{\n                      'document-detail.document-detail.permissions-assigned-to-external-users'\n                        | translate\n                    }}\n                  </div>\n                  @if (canManagePermissions()) {\n                    <button\n                      mat-button\n                      color=\"primary\"\n                      type=\"button\"\n                      class=\"perm-action-btn\"\n                      (click)=\"openExternalPermissionDialog()\"\n                    >\n                      {{ 'document-detail.document-detail.new' | translate }}\n                    </button>\n                  }\n                </div>\n                <div class=\"perm-info-bar\">\n                  <span class=\"perm-info-accent\"></span>\n                  <p>\n                    {{\n                      'document-detail.document-detail.sharing-to-external-users-does-not'\n                        | translate\n                    }}\n                  </p>\n                </div>\n                @if (externalAces().length === 0) {\n                  <div class=\"perm-empty\">\n                    {{\n                      'document-detail.document-detail.the-document-is-not-shared-with' | translate\n                    }}\n                  </div>\n                } @else {\n                  <div class=\"perm-table-wrap\">\n                    <table class=\"perm-table\">\n                      <thead>\n                        <tr>\n                          <th>{{ 'document-detail.document-detail.user' | translate }}</th>\n                          <th>{{ 'document-detail.document-detail.right' | translate }}</th>\n                          <th>{{ 'document-detail.document-detail.time-frame' | translate }}</th>\n                          <th>{{ 'document-detail.document-detail.granted-by' | translate }}</th>\n                          @if (canManagePermissions()) {\n                            <th></th>\n                          }\n                        </tr>\n                      </thead>\n                      <tbody>\n                        @for (ace of externalAces(); track ace.id) {\n                          <tr>\n                            <td>{{ displayUsername(ace) }}</td>\n                            <td>{{ permissionLabel(ace.permission) }}</td>\n                            <td>{{ aceTimeFrame(ace) }}</td>\n                            <td>{{ aceGrantedBy(ace) }}</td>\n                            @if (canManagePermissions()) {\n                              <td class=\"perm-row-actions\">\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"'document-detail.document-detail.edit' | translate\"\n                                  [attr.aria-label]=\"\n                                    'document-detail.document-detail.edit-permission' | translate\n                                  \"\n                                  type=\"button\"\n                                  (click)=\"editExternalPermission(ace)\"\n                                >\n                                  <mat-icon>edit</mat-icon>\n                                </button>\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"\n                                    'document-detail.document-detail.send-notification-email'\n                                      | translate\n                                  \"\n                                  [attr.aria-label]=\"\n                                    'document-detail.document-detail.send-notification' | translate\n                                  \"\n                                  type=\"button\"\n                                  [disabled]=\"actionInProgress() === 'notify-' + ace.id\"\n                                  (click)=\"sendPermissionNotification(ace)\"\n                                >\n                                  <mat-icon>send</mat-icon>\n                                </button>\n                                <button\n                                  mat-icon-button\n                                  [matTooltip]=\"\n                                    'document-detail.document-detail.delete' | translate\n                                  \"\n                                  [attr.aria-label]=\"\n                                    'document-detail.document-detail.delete-permission' | translate\n                                  \"\n                                  type=\"button\"\n                                  (click)=\"deletePermission(ace)\"\n                                >\n                                  <mat-icon>delete</mat-icon>\n                                </button>\n                              </td>\n                            }\n                          </tr>\n                        }\n                      </tbody>\n                    </table>\n                  </div>\n                }\n              </section>\n            }\n          </div>\n        </ng-template>\n\n        <ng-template #historyTabContent>\n          @if (historyShown()) {\n            <nxs-document-history class=\"history-container\" [documentUid]=\"doc()!.uid\" />\n          }\n        </ng-template>\n\n        <ng-template #publishingTabContent>\n          <div class=\"publish-container\">\n            <!-- Publication details -->\n            <section class=\"publish-section\">\n              <div class=\"publish-section-header\">\n                <div\n                  #publicationsHeading\n                  class=\"publish-section-title\"\n                  role=\"heading\"\n                  aria-level=\"3\"\n                  tabindex=\"-1\"\n                >\n                  {{ 'document-detail.document-detail.publication-details' | translate }}\n                </div>\n                @if (publishedDocs().length > 0) {\n                  <button\n                    mat-stroked-button\n                    class=\"unpublish-all-btn\"\n                    [disabled]=\"actionInProgress() === 'unpublish-all'\"\n                    (click)=\"unpublishAll()\"\n                  >\n                    @if (actionInProgress() === 'unpublish-all') {\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      />\n                    } @else {\n                      {{ 'document-detail.document-detail.unpublish-all' | translate }}\n                    }\n                  </button>\n                }\n              </div>\n              @if (publishLoading()) {\n                <div class=\"publish-loading\">\n                  <mat-spinner\n                    diameter=\"24\"\n                    [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                  />\n                </div>\n              } @else if (publishedDocs().length === 0) {\n                <div class=\"publish-empty\">\n                  <mat-icon>cloud_off</mat-icon>\n                  <p>\n                    {{\n                      'document-detail.document-detail.this-document-has-not-been-published'\n                        | translate\n                    }}\n                  </p>\n                </div>\n              } @else {\n                <table class=\"publish-table\">\n                  <thead>\n                    <tr>\n                      <th>{{ 'document-detail.document-detail.path' | translate }}</th>\n                      <th>{{ 'document-detail.document-detail.version' | translate }}</th>\n                      <th>{{ 'document-detail.document-detail.rendition' | translate }}</th>\n                      <th>{{ 'document-detail.document-detail.publisher' | translate }}</th>\n                      <th>{{ 'document-detail.document-detail.publish-date' | translate }}</th>\n                      <th class=\"pub-actions-col\"></th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    @for (pub of publishedDocs(); track pub.uid) {\n                      <tr>\n                        <td>\n                          <div class=\"pub-title-cell\">\n                            <mat-icon class=\"pub-doc-icon\">description</mat-icon>\n                            <span class=\"pub-path-text\">{{ publishedPath(pub) }}</span>\n                          </div>\n                        </td>\n                        <td>\n                          <sat-status-tag status=\"neutral\" [hideIcon]=\"true\">{{\n                            publishedVersion(pub)\n                          }}</sat-status-tag>\n                        </td>\n                        <td>{{ publishedRendition(pub) }}</td>\n                        <td>\n                          <div class=\"pub-publisher\">\n                            <span class=\"avatar-sm pub-avatar\">{{\n                              publishedBy(pub).charAt(0).toUpperCase()\n                            }}</span>\n                            <span>{{ publishedBy(pub) }}</span>\n                          </div>\n                        </td>\n                        <td>{{ publishedDate(pub) | date: 'longDate' }}</td>\n                        <td class=\"pub-actions-cell\">\n                          @if (canUnpublish(pub)) {\n                            <button\n                              mat-stroked-button\n                              class=\"pub-action-btn unpublish-btn\"\n                              [disabled]=\"actionInProgress() === 'unpublish'\"\n                              (click)=\"unpublishDocument(pub)\"\n                            >\n                              {{ 'document-detail.document-detail.unpublish' | translate }}\n                            </button>\n                          }\n                          @if (canRepublish(pub)) {\n                            <button\n                              mat-flat-button\n                              color=\"primary\"\n                              class=\"pub-action-btn republish-btn\"\n                              [disabled]=\"actionInProgress() === 'republish'\"\n                              (click)=\"republishDocument(pub)\"\n                            >\n                              {{ 'document-detail.document-detail.republish' | translate }}\n                            </button>\n                          }\n                        </td>\n                      </tr>\n                    }\n                  </tbody>\n                </table>\n              }\n            </section>\n\n            <!-- Publish to Section -->\n            @if (canPublish()) {\n              <section class=\"publish-section\">\n                <div class=\"publish-section-header\">\n                  <div class=\"publish-section-title\" role=\"heading\" aria-level=\"3\">\n                    {{ 'document-detail.document-detail.publish-to-a-section' | translate }}\n                  </div>\n                  <button\n                    mat-flat-button\n                    color=\"primary\"\n                    class=\"publish-btn\"\n                    [disabled]=\"!selectedSectionId() || publishing()\"\n                    (click)=\"publishToSection()\"\n                  >\n                    @if (publishing()) {\n                      <mat-spinner\n                        diameter=\"18\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      />\n                    } @else {\n                      <ng-container>\n                        <mat-icon>publish</mat-icon>\n                        {{ 'document-detail.document-detail.publish' | translate }}\n                      </ng-container>\n                    }\n                  </button>\n                </div>\n\n                <div class=\"publish-info-bar\">\n                  <span class=\"publish-info-accent\"></span>\n                  <p>\n                    {{\n                      'document-detail.document-detail.select-a-section-below-to-publish'\n                        | translate\n                    }}\n                  </p>\n                </div>\n\n                @if (sectionsLoading()) {\n                  <div class=\"publish-loading\">\n                    <mat-spinner\n                      diameter=\"24\"\n                      [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                    />\n                  </div>\n                } @else if (sectionTree().length === 0) {\n                  <div class=\"publish-empty\">\n                    <mat-icon>folder_off</mat-icon>\n                    <p>\n                      {{\n                        'document-detail.document-detail.no-sections-available-for-publishing'\n                          | translate\n                      }}\n                    </p>\n                  </div>\n                } @else {\n                  <div class=\"section-tree\">\n                    @for (node of sectionTree(); track node.doc.uid) {\n                      <ng-container\n                        *ngTemplateOutlet=\"sectionNodeTpl; context: { $implicit: node, depth: 0 }\"\n                      />\n                    }\n                  </div>\n                }\n              </section>\n            }\n          </div>\n        </ng-template>\n\n        <ng-template #aiInsightsTabContent>\n          <div class=\"ai-tab-content\">\n            <!-- Hero Header -->\n            <div class=\"ai-insights-hero\">\n              <div class=\"ai-insights-hero-text\">\n                <div class=\"ai-insights-title\">\n                  {{ 'document-detail.document-detail.ai-insights' | translate }}\n                </div>\n                <p class=\"ai-insights-subtitle\">\n                  {{\n                    'document-detail.document-detail.augment-your-editorial-workflow-with-cognitive'\n                      | translate\n                  }}\n                </p>\n              </div>\n              <button mat-flat-button class=\"ai-btn-primary\" (click)=\"openAiAssistant()\">\n                <mat-icon>auto_awesome</mat-icon>\n                {{ 'document-detail.document-detail.ai-assistant' | translate }}\n              </button>\n            </div>\n\n            <!-- 2x2 Card Grid -->\n            <div class=\"ai-insights-grid\">\n              <!-- Document Summary Card -->\n              <section class=\"ai-card\">\n                <div class=\"ai-card-header\">\n                  <span class=\"ai-card-icon ai-card-icon--purple\">\n                    <mat-icon>auto_awesome</mat-icon>\n                  </span>\n                  <div class=\"ai-card-title\">\n                    {{ 'document-detail.document-detail.document-summary' | translate }}\n                  </div>\n                  @if (aiSummaryLoading()) {\n                    <button mat-flat-button class=\"ai-btn-primary ai-btn-sm\" disabled>\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      ></mat-spinner>\n                    </button>\n                  } @else {\n                    <button\n                      mat-flat-button\n                      class=\"ai-btn-primary ai-btn-sm\"\n                      (click)=\"generateSummary()\"\n                    >\n                      <mat-icon>auto_awesome</mat-icon>\n                      {{\n                        aiSummary()\n                          ? ('document-detail.regenerate' | translate)\n                          : ('document-detail.generate' | translate)\n                      }}\n                    </button>\n                  }\n                </div>\n                <p class=\"ai-card-desc\">\n                  {{\n                    'document-detail.document-detail.utilize-large-language-models-to-distill'\n                      | translate\n                  }}\n                </p>\n                <div class=\"ai-card-body\">\n                  @if (aiSummaryLoading()) {\n                    <div class=\"ai-loading-skeleton\">\n                      <div class=\"skeleton-line wide\"></div>\n                      <div class=\"skeleton-line wide\"></div>\n                      <div class=\"skeleton-line medium\"></div>\n                      <div class=\"skeleton-line short\"></div>\n                    </div>\n                  } @else if (aiSummary()) {\n                    <div class=\"ai-summary-result\">\n                      <p class=\"ai-summary-text\">{{ aiSummary()!.summary }}</p>\n                      @if (aiSummary()!.keyPoints.length) {\n                        <div class=\"ai-key-points\">\n                          <strong>{{\n                            'document-detail.document-detail.key-points' | translate\n                          }}</strong>\n                          <ul>\n                            @for (point of aiSummary()!.keyPoints; track point) {\n                              <li>{{ point }}</li>\n                            }\n                          </ul>\n                        </div>\n                      }\n                    </div>\n                  } @else {\n                    <div class=\"ai-placeholder-quote\">\n                      <p>\n                        \"Summary will appear here after generation. The model will analyze semantic\n                        structure and key thematic elements...\"\n                      </p>\n                    </div>\n                  }\n                </div>\n              </section>\n\n              <!-- Suggested Tags Card -->\n              <section class=\"ai-card\">\n                <div class=\"ai-card-header\">\n                  <span class=\"ai-card-icon ai-card-icon--indigo\">\n                    <mat-icon>sell</mat-icon>\n                  </span>\n                  <div class=\"ai-card-title\">\n                    {{ 'document-detail.document-detail.suggested-tags' | translate }}\n                  </div>\n                </div>\n                <p class=\"ai-card-desc\">\n                  {{\n                    'document-detail.document-detail.automatic-taxonomy-mapping-based-on-entity'\n                      | translate\n                  }}\n                </p>\n                <div class=\"ai-card-body\">\n                  @if (aiTagsLoading()) {\n                    <div class=\"ai-loading-skeleton\">\n                      <div class=\"skeleton-line medium\"></div>\n                      <div class=\"skeleton-line short\"></div>\n                    </div>\n                  } @else if (aiSuggestedTags().length) {\n                    <div class=\"ai-tags-list\">\n                      @for (tag of aiSuggestedTags(); track tag.label) {\n                        <button\n                          class=\"ai-tag-chip\"\n                          type=\"button\"\n                          [attr.aria-label]=\"'shared.add-tag' | translate: { name: tag.label }\"\n                          (click)=\"applyAiTag(tag.label)\"\n                        >\n                          <span class=\"ai-tag-label\">{{ tag.label }}</span>\n                          <span class=\"ai-tag-confidence\"\n                            >{{ (tag.confidence * 100).toFixed(0) }}%</span\n                          >\n                          <mat-icon class=\"ai-tag-add\">add_circle_outline</mat-icon>\n                        </button>\n                      }\n                    </div>\n                  }\n                </div>\n                <div class=\"ai-card-actions\">\n                  @if (aiTagsLoading()) {\n                    <button mat-stroked-button class=\"ai-btn-outline\" disabled>\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      ></mat-spinner>\n                      {{ 'document-detail.document-detail.suggest-tags' | translate }}\n                    </button>\n                  } @else {\n                    <button mat-stroked-button class=\"ai-btn-outline\" (click)=\"suggestTags()\">\n                      <mat-icon>auto_awesome</mat-icon>\n                      {{ 'document-detail.document-detail.suggest-tags' | translate }}\n                    </button>\n                  }\n                </div>\n              </section>\n\n              <!-- Classification & Metadata Card -->\n              <section class=\"ai-card\">\n                <div class=\"ai-card-header\">\n                  <span class=\"ai-card-icon ai-card-icon--purple\">\n                    <mat-icon>tune</mat-icon>\n                  </span>\n                  <div class=\"ai-card-title\">\n                    {{ 'document-detail.document-detail.classification-amp-metadata' | translate }}\n                  </div>\n                </div>\n                <p class=\"ai-card-desc\">\n                  {{\n                    'document-detail.document-detail.categorize-content-into-predefined-editorial-verticals'\n                      | translate\n                  }}\n                </p>\n                <div class=\"ai-card-body\">\n                  @if (aiClassifyLoading()) {\n                    <div class=\"ai-loading-skeleton\">\n                      <div class=\"skeleton-line wide\"></div>\n                      <div class=\"skeleton-line wide\"></div>\n                      <div class=\"skeleton-line medium\"></div>\n                    </div>\n                  } @else if (aiClassification()) {\n                    <div class=\"ai-meta-rows\">\n                      <div class=\"ai-meta-row\">\n                        <span class=\"ai-meta-key\">{{\n                          'document-detail.document-detail.description' | translate\n                        }}</span>\n                        <span class=\"ai-meta-val\">{{ aiClassification()!.description }}</span>\n                      </div>\n                      <div class=\"ai-meta-row\">\n                        <span class=\"ai-meta-key\">{{\n                          'document-detail.document-detail.primary-category' | translate\n                        }}</span>\n                        <sat-category-tag category=\"blue\">{{\n                          aiClassification()!.nature\n                        }}</sat-category-tag>\n                      </div>\n                      <div class=\"ai-meta-row\">\n                        <span class=\"ai-meta-key\">{{\n                          'document-detail.document-detail.subjects' | translate\n                        }}</span>\n                        <span class=\"ai-meta-val\">{{\n                          aiClassification()!.subjects.join(', ')\n                        }}</span>\n                      </div>\n                      @if (aiClassification()!.suggestedWorkflow !== 'none') {\n                        <div class=\"ai-meta-row\">\n                          <span class=\"ai-meta-key\">{{\n                            'document-detail.document-detail.workflow' | translate\n                          }}</span>\n                          <span class=\"ai-meta-val\">\n                            <sat-status-tag status=\"info\" [hideIcon]=\"true\">{{\n                              aiClassification()!.suggestedWorkflow\n                            }}</sat-status-tag>\n                          </span>\n                        </div>\n                      }\n                    </div>\n                  } @else {\n                    <div class=\"ai-meta-rows\">\n                      <div class=\"ai-meta-row\">\n                        <span class=\"ai-meta-key\">{{\n                          'document-detail.document-detail.primary-category' | translate\n                        }}</span>\n                        <span class=\"ai-meta-val ai-meta-val--muted\">{{\n                          'document-detail.document-detail.unclassified' | translate\n                        }}</span>\n                      </div>\n                      <div class=\"ai-meta-row\">\n                        <span class=\"ai-meta-key\">{{\n                          'document-detail.document-detail.complexity-level' | translate\n                        }}</span>\n                        <span class=\"ai-meta-val ai-meta-val--muted\">&mdash;</span>\n                      </div>\n                    </div>\n                  }\n                </div>\n                <div class=\"ai-card-actions\">\n                  @if (aiClassifyLoading()) {\n                    <button mat-flat-button class=\"ai-btn-primary ai-btn-full\" disabled>\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      ></mat-spinner>\n                      {{ 'document-detail.document-detail.classify' | translate }}\n                    </button>\n                  } @else {\n                    <button\n                      mat-flat-button\n                      class=\"ai-btn-primary ai-btn-full\"\n                      (click)=\"classifyDocument()\"\n                    >\n                      <mat-icon>tune</mat-icon>\n                      {{ 'document-detail.document-detail.classify' | translate }}\n                    </button>\n                  }\n                </div>\n              </section>\n\n              <!-- Related Documents Card -->\n              <section class=\"ai-card\">\n                <div class=\"ai-card-header\">\n                  <span class=\"ai-card-icon ai-card-icon--indigo\">\n                    <mat-icon>hub</mat-icon>\n                  </span>\n                  <div class=\"ai-card-title\">\n                    {{ 'document-detail.document-detail.related-documents' | translate }}\n                  </div>\n                </div>\n                <p class=\"ai-card-desc\">\n                  {{\n                    'document-detail.document-detail.discover-documents-within-the-archive-that'\n                      | translate\n                  }}\n                </p>\n                <div class=\"ai-card-body\">\n                  @if (aiSimilarLoading()) {\n                    <div class=\"ai-doc-thumbs\">\n                      <div class=\"ai-doc-thumb ai-doc-thumb--skeleton\">\n                        <mat-spinner\n                          diameter=\"20\"\n                          [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                        ></mat-spinner>\n                        <span>{{\n                          'document-detail.document-detail.scanning-archive' | translate\n                        }}</span>\n                      </div>\n                      <div class=\"ai-doc-thumb ai-doc-thumb--skeleton\">\n                        <mat-spinner\n                          diameter=\"20\"\n                          [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                        ></mat-spinner>\n                        <span>{{\n                          'document-detail.document-detail.scanning-archive' | translate\n                        }}</span>\n                      </div>\n                    </div>\n                  } @else if (aiSimilarDocs().length) {\n                    <div class=\"ai-similar-list\">\n                      @for (simDoc of aiSimilarDocs(); track simDoc.uid) {\n                        <button class=\"ai-similar-item\" (click)=\"navigateToDoc(simDoc.uid)\">\n                          <mat-icon class=\"ai-similar-icon\">description</mat-icon>\n                          <div class=\"ai-similar-info\">\n                            <span class=\"ai-similar-title\">{{ simDoc.title }}</span>\n                            <span class=\"ai-similar-path\">{{ simDoc.path }}</span>\n                          </div>\n                          <span class=\"ai-similar-score\"\n                            >{{ (simDoc.score * 100).toFixed(0) }}%</span\n                          >\n                        </button>\n                      }\n                    </div>\n                  } @else {\n                    <div class=\"ai-doc-thumbs\">\n                      <div class=\"ai-doc-thumb\">\n                        <mat-icon class=\"ai-doc-thumb-icon\">description</mat-icon>\n                        <span>{{\n                          'document-detail.document-detail.document-preview' | translate\n                        }}</span>\n                      </div>\n                      <div class=\"ai-doc-thumb\">\n                        <mat-icon class=\"ai-doc-thumb-icon\">description</mat-icon>\n                        <span>{{\n                          'document-detail.document-detail.document-preview' | translate\n                        }}</span>\n                      </div>\n                    </div>\n                  }\n                </div>\n                <div class=\"ai-card-actions\">\n                  @if (aiSimilarLoading()) {\n                    <button mat-stroked-button class=\"ai-btn-outline\" disabled>\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      ></mat-spinner>\n                      {{ 'document-detail.document-detail.find-connections' | translate }}\n                    </button>\n                  } @else {\n                    <button mat-stroked-button class=\"ai-btn-outline\" (click)=\"findSimilar()\">\n                      <mat-icon>search</mat-icon>\n                      {{ 'document-detail.document-detail.find-connections' | translate }}\n                    </button>\n                  }\n                </div>\n              </section>\n            </div>\n\n            @if (aiError()) {\n              <div class=\"ai-error-banner\">\n                <mat-icon>error_outline</mat-icon>\n                {{ aiError() }}\n              </div>\n            }\n          </div>\n        </ng-template>\n\n        <button\n          #panelToggle\n          mat-icon-button\n          class=\"panel-toggle-btn\"\n          (click)=\"propertiesPanelOpen.set(!propertiesPanelOpen())\"\n          [matTooltip]=\"detailsPanelToggleLabelKey() | translate\"\n          [attr.aria-label]=\"detailsPanelToggleLabelKey() | translate\"\n        >\n          <mat-icon aria-hidden=\"true\">{{\n            propertiesPanelOpen() ? 'info' : 'info_outline'\n          }}</mat-icon>\n        </button>\n      </div>\n    </div>\n\n    <!-- Right: details panel (persists across all tabs) -->\n    @if (propertiesPanelOpen()) {\n      <nxs-details-panel\n        class=\"properties-panel\"\n        [heading]=\"fileName()\"\n        [label]=\"'document-detail.document-detail.document-properties' | translate\"\n        [closeLabel]=\"'document-detail.document-detail.close-panel' | translate\"\n        [tabs]=\"panelViews()\"\n        [selected]=\"activePanelView()\"\n        (selectedChange)=\"switchPanelSubTab($event)\"\n        (closed)=\"closePropertiesPanel()\"\n      >\n        @switch (activePanelView()) {\n          @case ('properties') {\n            <nxs-properties-panel\n              class=\"detail-properties\"\n              [document]=\"doc()\"\n              [vocabularyLabel]=\"vocabularyLabel()\"\n              [processRunning]=\"documentWorkflows().length > 0\"\n              [versionLabel]=\"versionLabel()\"\n              [publications]=\"publicationCount()\"\n              [format]=\"isNoteDocument() ? noteFormatDisplay() : ''\"\n              (publicationsSelected)=\"goToPublishingTab()\"\n            >\n              @if (doc(); as versioned) {\n                <!-- A publication has no versions of its own to pick from; Web UI shows a tag too. -->\n                @if (versioned.isProxy) {\n                  <nxs-tag nxsVersion [label]=\"versionLabel()\" />\n                } @else {\n                  <nxs-manage-versions\n                    nxsVersion\n                    [document]=\"versioned\"\n                    (versionSelected)=\"openVersion($event)\"\n                    (latestSelected)=\"showLatestVersion()\"\n                    (versionCreated)=\"onVersionCreated()\"\n                  />\n                }\n              }\n              @if (doc(); as tagged) {\n                <nxs-tag-editor\n                  nxsTags\n                  [documentUid]=\"tagged.uid\"\n                  [tags]=\"tags()\"\n                  [readOnly]=\"!canTag()\"\n                  (tagsChange)=\"setTags($event)\"\n                />\n              }\n              <lib-document-layout\n                [document]=\"doc()\"\n                mode=\"metadata\"\n                [style.--document-layout-label-color]=\"'var(--document-detail-properties-label-muted)'\"\n              />\n\n              <div class=\"prop-section-divider\"></div>\n\n              <div class=\"section-title\" role=\"heading\" aria-level=\"4\">\n                {{ 'document-detail.document-detail.attachments' | translate }}\n              </div>\n              @if (attachments().length === 0) {\n                <p class=\"section-empty\">\n                  {{ 'document-detail.document-detail.there-are-no-attachments' | translate }}\n                </p>\n              } @else {\n                @for (att of attachments(); track att.index) {\n                  <div class=\"attachment-card\">\n                    <div class=\"attachment-info\">\n                      <span class=\"attachment-name\">{{ att.name }}</span>\n                      <span class=\"attachment-size\">{{ formatBytes(att.size) }}</span>\n                    </div>\n                    <div class=\"attachment-actions\">\n                      <button\n                        mat-icon-button\n                        [matTooltip]=\"\n                          'document-detail.document-detail.open-in-nuxeo-drive' | translate\n                        \"\n                        [attr.aria-label]=\"\n                          'document-detail.document-detail.open-in-nuxeo-drive' | translate\n                        \"\n                        (click)=\"openDriveDialog()\"\n                      >\n                        <mat-icon>open_in_new</mat-icon>\n                      </button>\n                      <button\n                        mat-icon-button\n                        [matTooltip]=\"'document-detail.document-detail.preview' | translate\"\n                        [attr.aria-label]=\"'document-detail.document-detail.preview' | translate\"\n                        (click)=\"previewAttachment(att)\"\n                      >\n                        <mat-icon>visibility</mat-icon>\n                      </button>\n                      <button\n                        mat-icon-button\n                        [matTooltip]=\"'document-detail.document-detail.download' | translate\"\n                        [attr.aria-label]=\"'document-detail.document-detail.download' | translate\"\n                        (click)=\"downloadAttachment(att.url, att.name)\"\n                      >\n                        <mat-icon>download</mat-icon>\n                      </button>\n                      @if (canWriteDoc()) {\n                        <button\n                          mat-icon-button\n                          [matMenuTriggerFor]=\"attMenu\"\n                          [matTooltip]=\"'document-detail.document-detail.more' | translate\"\n                          [attr.aria-label]=\"\n                            'document-detail.document-detail.more-actions' | translate\n                          \"\n                        >\n                          <mat-icon>more_vert</mat-icon>\n                        </button>\n                        <mat-menu #attMenu=\"matMenu\">\n                          <button mat-menu-item (click)=\"openReplaceDialog(att)\">\n                            <mat-icon>find_replace</mat-icon>\n                            <span>{{ 'document-detail.document-detail.replace' | translate }}</span>\n                          </button>\n                          <button mat-menu-item (click)=\"openRemoveDialog(att)\">\n                            <mat-icon>cancel</mat-icon>\n                            <span>{{ 'document-detail.document-detail.remove' | translate }}</span>\n                          </button>\n                        </mat-menu>\n                      }\n                    </div>\n                  </div>\n                }\n              }\n\n              @if (canWriteDoc()) {\n                <label class=\"upload-attachment-zone\">\n                  <span class=\"upload-link\">{{\n                    'document-detail.document-detail.upload-attachment' | translate\n                  }}</span>\n                  <input #attachmentInput type=\"file\" hidden (change)=\"uploadAttachment($event)\" />\n                </label>\n              }\n            </nxs-properties-panel>\n          }\n          @case ('comments') {\n            <div class=\"comments-panel\">\n              @if (featureFlags.aiEnabled() && comments().length > 0) {\n                <div class=\"sentiment-toolbar\">\n                  <button\n                    class=\"ai-sentiment-btn\"\n                    (click)=\"analyzeCommentSentiment()\"\n                    [disabled]=\"aiSentimentLoading()\"\n                  >\n                    @if (aiSentimentLoading()) {\n                      <mat-spinner\n                        diameter=\"16\"\n                        [attr.aria-label]=\"'document-detail.document-detail.loading' | translate\"\n                      />\n                    } @else {\n                      <mat-icon>psychology</mat-icon>\n                    }\n                    {{ 'document-detail.document-detail.analyze-sentiment' | translate }}\n                  </button>\n                </div>\n\n                @if (aiThreadSummary()) {\n                  <div class=\"sentiment-summary-panel\">\n                    <div class=\"sentiment-summary-header\">\n                      <mat-icon>forum</mat-icon>\n                      <span>{{\n                        'document-detail.document-detail.thread-summary' | translate\n                      }}</span>\n                    </div>\n                    <p class=\"sentiment-summary-text\">{{ aiThreadSummary() }}</p>\n                  </div>\n                }\n              }\n              @if (doc(); as commented) {\n                <nxs-comments [documentUid]=\"commented.uid\" (threadChange)=\"comments.set($event)\">\n                  <ng-template nxsCommentExtra let-comment>\n                    @if (aiSentimentMap()[comment.id]; as sent) {\n                      <div class=\"comment-sentiment\">\n                        <span class=\"sentiment-badge sentiment-{{ sent.sentiment }}\">\n                          {{ sent.sentiment }}\n                        </span>\n                        @if (sent.summary; as sentSummary) {\n                          <p class=\"sentiment-inline-summary\">\n                            <mat-icon class=\"sentiment-inline-icon\">auto_awesome</mat-icon>\n                            {{ sentSummary }}\n                          </p>\n                        }\n                      </div>\n                    }\n                  </ng-template>\n                </nxs-comments>\n              }\n            </div>\n          }\n          @case ('activity') {\n            <div class=\"activity-panel\">\n              @if (panelActivityLoading()) {\n                <div class=\"panel-loading\">\n                  <nxs-spinner\n                    diameter=\"28\"\n                    [label]=\"'document-detail.document-detail.loading' | translate\"\n                  />\n                </div>\n              } @else {\n                @for (entry of panelActivity(); track $index) {\n                  <div class=\"activity-card\">\n                    <sat-avatar\n                      [initials]=\"entry.principalName\"\n                      [category]=\"avatarColor(entry.principalName)\"\n                      size=\"28\"\n                      [borderless]=\"true\"\n                      aria-hidden=\"true\"\n                    />\n                    <div class=\"activity-info\">\n                      <span class=\"activity-user\">{{ entry.principalName }}</span>\n                      <span class=\"activity-action\">{{ activityLabel(entry) }}</span>\n                      <span class=\"activity-time\">{{ relativeTime(entry.eventDate) }}</span>\n                    </div>\n                  </div>\n                }\n\n                @if (panelActivity().length === 0) {\n                  <p class=\"section-empty\">\n                    {{ 'document-detail.document-detail.no-recent-activity' | translate }}\n                  </p>\n                }\n              }\n            </div>\n          }\n        }\n      </nxs-details-panel>\n    }\n  </div>\n}\n\n<ng-template #sectionNodeTpl let-node let-depth=\"depth\">\n  <div\n    class=\"section-node\"\n    [class.section-node--selected]=\"selectedSectionId() === node.doc.uid\"\n    [style.padding-left.px]=\"16 + depth * 24\"\n    role=\"button\"\n    tabindex=\"0\"\n    (click)=\"selectSection(node.doc.uid)\"\n    (keydown.enter)=\"selectSection(node.doc.uid)\"\n    (keydown.space)=\"$event.preventDefault(); selectSection(node.doc.uid)\"\n  >\n    @if (node.children.length > 0) {\n      <button\n        class=\"section-toggle\"\n        (click)=\"toggleSectionNode(node); $event.stopPropagation()\"\n        type=\"button\"\n      >\n        <mat-icon class=\"section-arrow\" [class.section-arrow--expanded]=\"node.expanded\">\n          chevron_right\n        </mat-icon>\n      </button>\n    } @else {\n      <span class=\"section-toggle-spacer\"></span>\n    }\n    <mat-icon class=\"section-icon\">{{ sectionIcon(node) }}</mat-icon>\n    <span class=\"section-label\">{{ node.doc.title }}</span>\n    @if (selectedSectionId() === node.doc.uid) {\n      <mat-icon class=\"section-check\">check_circle</mat-icon>\n    }\n  </div>\n\n  @if (node.expanded && node.children.length > 0) {\n    @for (child of node.children; track child.doc.uid) {\n      <ng-container\n        *ngTemplateOutlet=\"sectionNodeTpl; context: { $implicit: child, depth: depth + 1 }\"\n      />\n    }\n  }\n</ng-template>\n", styles: [":host {\n  /* NXENG-774 \u2014 properties sidebar stays a fixed light panel in every theme (IBM 280073873). */\n  /* NXENG-858 / NXENG-891 / NXENG-895 \u2014 the properties panel labels (.detail-properties) reuse label-muted on that panel (IBM 1792790291, 2951482449, 2993932592). */\n  /* NXENG-925 \u2014 .section-empty uses the same muted token (IBM 3935479306). */\n  --document-detail-properties-panel-surface: #ffffff;\n  --document-detail-properties-label-muted: #5c5f6b;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n  background: var(--mat-sys-surface-container-lowest);\n}\n\n// Loading / Error\n.detail-loading {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex: 1;\n  min-height: 400px;\n}\n\n.detail-error {\n  flex: 1;\n  justify-content: center;\n}\n\n// Header\n.detail-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 16px;\n  background: #fff;\n  border-bottom: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  // Header stays #fff in every packaged theme; positive-offset focus rings must contrast with it.\n  --agentic-document-detail-header-focus-outline: #3f51b5;\n}\n\n.header-info {\n  flex: 1;\n  min-width: 0;\n}\n\n.header-title {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\nsat-breadcrumbs {\n  font-size: 11px;\n  color: #888;\n\n  ::ng-deep .sat-breadcrumbs-chevron {\n    display: none;\n  }\n\n  ::ng-deep .sat-breadcrumbs-list li:not(:last-child)::after {\n    content: '\u203A';\n    margin-left: 4px;\n    color: currentColor;\n    opacity: 0.75;\n    line-height: 1;\n  }\n}\n\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n\n  button {\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.content-lake-ingest-loader,\n.content-lake-ingest-marker {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 40px;\n  height: 40px;\n  flex-shrink: 0;\n  cursor: default;\n}\n\n.ke-action-group {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n// Spin the leading <mat-icon> on KE buttons while an action is in flight.\n// We deliberately use a spinning mat-icon instead of <mat-spinner>, because\n// <mat-spinner> renders as a block-level element that breaks Material's\n// stroked-button content alignment (the text gets pushed onto the next line).\n// A mat-icon is laid out identically to the static leading icon, so swapping\n// in and out causes zero layout shift.\n//\n// IMPORTANT: the glyph MUST exist in the legacy \"Material Icons\" font that\n// apps/nuxeo-ui/src/index.html loads. `progress_activity` is in Material\n// Symbols only and renders as an empty box here, so use `autorenew`.\n.ke-action-btn mat-icon.ke-spinning {\n  animation: ke-spin 1s linear infinite;\n}\n\n// NXENG-789 / IBM issue 299839583 \u2014 Material stroked buttons suppress the default focus ring.\n// IBM Equal Access `style_focus_visible` reads `:focus` only; keep this selector standalone.\n//\n// Positive `outline-offset` paints outside the button; the pixels behind it are the header's\n// fixed `#fff` (`.detail-header` above), not the themed page chrome. In dark and kawaii,\n// `--mat-sys-primary` resolves too pale on that surface (1.71:1). Use the same indigo as the\n// panel toggle so 1.4.11 holds on the white header in every theme.\n.ke-action-btn.mat-mdc-outlined-button:focus {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}\n\n.ke-action-btn.mat-mdc-outlined-button:focus-visible {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}\n\n@keyframes ke-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.ke-status-banner {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  font-size: 13px;\n}\n\n.action-active {\n  color: var(--mat-sys-tertiary) !important;\n}\n\n::ng-deep .mat-mdc-menu-panel.mat-mdc-menu-panel {\n  min-width: 200px;\n\n  .mat-mdc-menu-item {\n    font-size: 13px;\n    height: 40px;\n    min-height: 40px;\n\n    .mat-icon {\n      font-size: 20px;\n      width: 20px;\n      height: 20px;\n      margin-right: 12px;\n      color: #555;\n    }\n  }\n}\n\n// Body: two-column layout below header\n.detail-body {\n  flex: 1;\n  display: flex;\n  flex-direction: row;\n  min-height: 0;\n  overflow: hidden;\n}\n\n// Left column: tabs + their content\n.detail-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.tabs-header-row {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  position: relative;\n  // Tab header stays #fff in every packaged theme; ring must contrast with that surface.\n  --agentic-document-detail-panel-toggle-focus-outline: #3f51b5;\n}\n\n.panel-toggle-btn {\n  position: absolute;\n  top: 4px;\n  right: 8px;\n  z-index: 2;\n  color: #555;\n\n  &:hover {\n    color: #3f51b5;\n  }\n}\n\n// The tab header stays #fff in every packaged theme; the panel toggle's focus ring\n// (`document-detail-panel-toggle-focus.scss`) assumes that surface.\n.detail-tabs {\n  --nxs-tabs-header-surface: #fff;\n  --nxs-tabs-header-border: #e0e0e0;\n  --nxs-tabs-focus-outline: var(--agentic-document-detail-panel-toggle-focus-outline);\n  --nxs-tabs-icon-color: #6366f1;\n}\n\n// A contributed View tab body brings no layout of its own; the tab body clips, so it scrolls here.\n.document-view-outlet {\n  display: block;\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n\n  // The packaged view renders beside it as the fallback; an empty flex child would share the space.\n  &--unresolved {\n    display: none;\n  }\n}\n\n// The details panel (right sidebar, outside tabs) is a fixed light panel in every theme, so its\n// colours are pinned here rather than read from the theme.\n.properties-panel {\n  --document-detail-properties-panel-border: #e0e0e0;\n  width: 380px;\n  flex: 0 0 380px;\n  border-left: 1px solid var(--document-detail-properties-panel-border);\n  --nxs-details-panel-surface: var(--document-detail-properties-panel-surface);\n  --nxs-details-panel-text: #333;\n  --nxs-details-panel-divider: #e0e0e0;\n  --nxs-details-panel-muted: var(--document-detail-properties-label-muted);\n}\n\n.detail-properties {\n  --nxs-properties-panel-label: var(--document-detail-properties-label-muted);\n  --nxs-properties-panel-value: #333;\n  --nxs-properties-panel-divider: #eee;\n  --nxs-properties-panel-link: #3f51b5;\n}\n\n.no-publications {\n  /* NXENG-917 \u2014 #aaa was 2.32:1 on the panel (IBM 3603735683); reuse light-panel muted token. */\n  color: var(--document-detail-properties-label-muted);\n}\n\n.avatar-sm {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  --document-detail-avatar-surface: #e57373;\n  --document-detail-avatar-text: #fff;\n  background: var(--document-detail-avatar-surface);\n  color: var(--document-detail-avatar-text);\n  font-size: 11px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n// Section dividers and titles\n.prop-section-divider {\n  height: 1px;\n  background: #f0f0f0;\n  margin: 16px 0;\n}\n\n.section-title {\n  font-size: 14px;\n  font-weight: 600;\n  color: #333;\n  margin: 0 0 8px;\n}\n\n.section-empty {\n  font-size: 13px;\n  color: var(--document-detail-properties-label-muted);\n  margin: 0;\n}\n\n// Attachments\n.attachment-card {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 0;\n  border-bottom: 1px solid #f0f0f0;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.attachment-info {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n  flex: 1;\n}\n\n.attachment-name {\n  font-size: 13px;\n  color: #333;\n  font-weight: 500;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.attachment-size {\n  font-size: 11px;\n  color: #999;\n}\n\n.attachment-actions {\n  display: flex;\n  flex-shrink: 0;\n\n  button {\n    width: 30px !important;\n    height: 30px !important;\n    line-height: 30px !important;\n    color: #555;\n\n    mat-icon {\n      font-size: 18px;\n      width: 18px;\n      height: 18px;\n    }\n\n    &:hover {\n      color: #3f51b5;\n    }\n  }\n}\n\n// Upload attachment zone (label associates with file input for a11y)\n.upload-attachment-zone {\n  display: block;\n  margin-top: 12px;\n  padding: 14px;\n  border: 2px dashed #ccc;\n  border-radius: 6px;\n  text-align: center;\n  cursor: pointer;\n  transition:\n    border-color 0.15s,\n    background 0.15s;\n\n  &:hover {\n    border-color: var(--mat-sys-primary);\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.upload-link {\n  font-size: 13px;\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n  cursor: pointer;\n}\n\n.collection-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 10px;\n  border-radius: 16px;\n  background: var(--mat-sys-primary-container);\n  color: var(--mat-sys-on-primary-container);\n  font-size: 12px;\n  font-weight: 500;\n  margin: 2px 4px 2px 0;\n}\n\n.collection-icon {\n  font-size: 14px !important;\n  width: 14px !important;\n  height: 14px !important;\n}\n\n// History tab: nxs-document-history fills the tab and scrolls inside it.\n.history-container {\n  display: block;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 16px 20px;\n}\n\n// Permissions tab\n.permissions-container {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.perm-section {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n}\n\n.perm-loading {\n  display: flex;\n  justify-content: center;\n  padding: 12px 0 4px;\n}\n\n.perm-section--local {\n  border-color: var(--mat-sys-outline-variant, #d0d0d0);\n\n  .perm-section-header {\n    background: var(--mat-sys-surface-container-low, #f8f9fe);\n  }\n\n  .perm-section-title {\n    font-size: 15px;\n  }\n}\n\n.perm-table-wrap {\n  padding: 0 16px 16px;\n}\n\n.perm-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.perm-section-title {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.perm-action-btn {\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.perm-info-bar {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .perm-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: #ef5350;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.perm-empty {\n  padding: 24px 20px;\n  text-align: center;\n  font-size: 13px;\n  color: #999;\n}\n\n.perm-empty--local {\n  margin: 0 16px 16px;\n  padding: 28px 20px;\n  background: var(--mat-sys-surface-container-lowest, #fafafa);\n  border: 1px dashed var(--mat-sys-outline-variant, #d8d8d8);\n  border-radius: 8px;\n  color: var(--mat-sys-on-surface-variant, #666);\n  font-weight: 500;\n}\n\n.perm-table {\n  width: 100%;\n  border-collapse: collapse;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 8px;\n  table-layout: auto;\n\n  tbody tr {\n    height: auto;\n  }\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.perm-row-actions {\n  text-align: right;\n  white-space: nowrap;\n\n  button {\n    color: #999;\n\n    &:hover {\n      color: #555;\n    }\n  }\n}\n\n// Publishing tab\n.publish-container {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 20px;\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.publish-section {\n  background: #fff;\n  border: 1px solid #e8e8e8;\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n.publish-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-bottom: 1px solid #f0f0f0;\n}\n\n.publish-section-title {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.publish-btn {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: none;\n}\n\n.publish-info-bar {\n  display: flex;\n  gap: 12px;\n  padding: 14px 20px;\n  background: #fafafa;\n  border-bottom: 1px solid #f0f0f0;\n\n  .publish-info-accent {\n    width: 3px;\n    min-height: 100%;\n    background: var(--mat-sys-primary);\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: #555;\n    line-height: 1.5;\n  }\n}\n\n.publish-loading {\n  display: flex;\n  justify-content: center;\n  padding: 32px;\n}\n\n.publish-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 32px 20px;\n  color: #999;\n  gap: 8px;\n\n  mat-icon {\n    font-size: 36px;\n    width: 36px;\n    height: 36px;\n  }\n\n  p {\n    font-size: 13px;\n    margin: 0;\n  }\n}\n\n.publish-table {\n  width: 100%;\n  border-collapse: collapse;\n\n  th {\n    text-align: left;\n    padding: 10px 20px;\n    font-size: 12px;\n    font-weight: 600;\n    color: #555;\n    background: #fafafa;\n    border-bottom: 1px solid #e8e8e8;\n  }\n\n  td {\n    padding: 12px 20px;\n    font-size: 13px;\n    color: #333;\n    border-bottom: 1px solid #f5f5f5;\n  }\n\n  tbody tr:hover {\n    background: #f8f9fe;\n  }\n\n  tbody tr:last-child td {\n    border-bottom: none;\n  }\n}\n\n.pub-title-cell {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.pub-doc-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-primary);\n  flex-shrink: 0;\n}\n\n.pub-path {\n  font-size: 12px;\n  color: #666;\n}\n\n.pub-path-text {\n  font-size: 12px;\n  color: #333;\n  word-break: break-all;\n}\n\n.pub-publisher {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.pub-avatar {\n  width: 24px;\n  height: 24px;\n  font-size: 11px;\n}\n\n.pub-actions-col {\n  text-align: right;\n  width: 220px;\n}\n\n.pub-actions-cell {\n  text-align: right;\n  white-space: nowrap;\n}\n\n.pub-action-btn {\n  font-size: 12px !important;\n  height: 32px !important;\n  padding: 0 16px !important;\n  margin-left: 8px;\n}\n\n.republish-btn {\n  background: #3f51b5 !important;\n  color: #fff !important;\n}\n\n.unpublish-all-btn {\n  font-size: 12px;\n  height: 32px;\n  padding: 0 16px;\n}\n\n// Section tree picker\n.section-tree {\n  padding: 8px 0;\n}\n\n.section-node {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  height: 38px;\n  padding-right: 16px;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-lowest);\n  }\n\n  &--selected {\n    background: var(--mat-sys-primary-container);\n\n    &:hover {\n      background: #dde0f5;\n    }\n  }\n}\n\n.section-toggle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  flex-shrink: 0;\n}\n\n.section-toggle-spacer {\n  display: inline-block;\n  width: 24px;\n  flex-shrink: 0;\n}\n\n.section-arrow {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #999;\n  transition: transform 0.2s ease;\n\n  &--expanded {\n    transform: rotate(90deg);\n  }\n}\n\n.section-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #ffa726;\n  flex-shrink: 0;\n}\n\n.section-label {\n  flex: 1;\n  font-size: 13px;\n  color: #333;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.section-check {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-primary);\n  flex-shrink: 0;\n}\n\n// Placeholder tabs\n.tab-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  color: #999;\n  gap: 12px;\n\n  mat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n}\n\n// \u2500\u2500 Panel loading \u2500\u2500\n.panel-loading {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}\n\n// \u2500\u2500 Comments panel \u2500\u2500\n.comments-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n// \u2500\u2500 Sentiment Analysis \u2500\u2500\n.sentiment-toolbar {\n  display: flex;\n  justify-content: flex-end;\n  padding: 0 0 12px;\n}\n\n.ai-sentiment-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 14px;\n  border: none;\n  border-radius: 20px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  color: #fff;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: opacity 0.2s;\n\n  &:hover:not(:disabled) {\n    opacity: 0.88;\n  }\n  &:disabled {\n    opacity: 0.55;\n    cursor: not-allowed;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n    circle {\n      stroke: #fff;\n    }\n  }\n}\n\n.sentiment-summary-panel {\n  background: #f5f3ff;\n  border: 1px solid #e0dbfa;\n  border-radius: 10px;\n  padding: 14px 16px;\n  margin-bottom: 14px;\n}\n\n.sentiment-summary-header {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-weight: 600;\n  font-size: 13px;\n  color: #6366f1;\n  margin-bottom: 6px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #6366f1;\n  }\n}\n\n.sentiment-summary-text {\n  margin: 0;\n  font-size: 13px;\n  color: #374151;\n  line-height: 1.5;\n}\n\n.sentiment-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 8px;\n  border-radius: 10px;\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: capitalize;\n  margin-left: 6px;\n\n  &.sentiment-positive {\n    background: #d1fae5;\n    color: #065f46;\n  }\n  &.sentiment-neutral {\n    background: #e5e7eb;\n    color: #374151;\n  }\n  &.sentiment-negative {\n    background: #fee2e2;\n    color: #991b1b;\n  }\n  &.sentiment-urgent {\n    background: #fef3c7;\n    color: #92400e;\n  }\n}\n\n.sentiment-inline-summary {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n  margin: 4px 0 0;\n  font-size: 12px;\n  color: #6b7280;\n  font-style: italic;\n  line-height: 1.4;\n}\n\n.sentiment-inline-icon {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  color: #8b5cf6;\n  flex-shrink: 0;\n  margin-top: 1px;\n}\n\n.comment-sentiment {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n\n  .sentiment-badge {\n    margin-left: 0;\n  }\n}\n\n// \u2500\u2500 Activity panel \u2500\u2500\n.activity-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n.activity-card {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 10px 0;\n  border-bottom: 1px solid #f0f0f0;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.activity-info {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 4px;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.activity-user {\n  font-weight: 600;\n  color: #333;\n}\n\n.activity-action {\n  color: #555;\n}\n\n.activity-time {\n  color: #999;\n  font-size: 11px;\n}\n\n// Publish dialog panel - remove default Material dialog padding\n::ng-deep .publish-dialog-panel .mat-mdc-dialog-container .mdc-dialog__surface {\n  padding: 0;\n}\n\n::ng-deep .publish-dialog-panel .mat-mdc-dialog-container .mdc-dialog__content {\n  padding: 0;\n}\n\n::ng-deep .preview-dialog-panel .mat-mdc-dialog-container .mdc-dialog__surface {\n  padding: 0;\n  overflow: hidden;\n  border-radius: 8px;\n}\n\n::ng-deep .preview-dialog-panel .mat-mdc-dialog-container .mdc-dialog__content {\n  padding: 0;\n  max-height: none;\n}\n/* \u2500\u2500\u2500 Trashed document banner (blue) \u2500\u2500\u2500 */\n.trashed-banner {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: #e3f2fd;\n  border-bottom: 1px solid #90caf9;\n  flex-shrink: 0;\n\n  .trashed-banner-icon {\n    color: #1565c0;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .trashed-banner-text {\n    font-size: 13px;\n    color: #0d47a1;\n    font-weight: 500;\n  }\n\n  .trashed-banner-spacer {\n    flex: 1;\n  }\n\n  .trashed-banner-btn {\n    white-space: nowrap;\n    font-size: 12px;\n    display: inline-flex;\n    align-items: center;\n    gap: 4px;\n    mat-icon {\n      font-size: 16px;\n      width: 16px;\n      height: 16px;\n    }\n    &--danger {\n      color: #d32f2f;\n      border-color: #d32f2f;\n    }\n  }\n}\n\n.action-danger {\n  color: #d32f2f !important;\n}\n\n/* \u2500\u2500\u2500 Workflow info banner (yellow) \u2500\u2500\u2500 */\n.workflow-banner {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: #fef3e0;\n  border-bottom: 1px solid #f5d9a0;\n  flex-shrink: 0;\n\n  .workflow-banner-icon {\n    color: #e6a117;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .workflow-banner-text {\n    font-size: 13px;\n    color: #5d4037;\n\n    strong {\n      font-weight: 600;\n    }\n  }\n\n  .workflow-banner-spacer {\n    flex: 1;\n  }\n\n  .workflow-banner-abandon {\n    color: #d84315;\n    font-weight: 600;\n    font-size: 13px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    white-space: nowrap;\n  }\n}\n\n/* \u2500\u2500\u2500 Task action banner (blue) \u2500\u2500\u2500 */\n.task-action-banner {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: var(--mat-sys-primary, #1a73e8);\n  flex-shrink: 0;\n\n  .task-action-icon {\n    color: #fff;\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  .task-action-text {\n    font-size: 13px;\n    color: #fff;\n\n    strong {\n      font-weight: 600;\n    }\n  }\n\n  .task-action-spacer {\n    flex: 1;\n  }\n\n  .task-action-btn {\n    background: #fff;\n    color: var(--mat-sys-primary, #1a73e8);\n    font-weight: 600;\n    font-size: 13px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    border-radius: 4px;\n    min-width: 90px;\n  }\n}\n\n/* \u2500\u2500\u2500 Start-process modal dialog \u2500\u2500\u2500 */\n.start-process-backdrop {\n  position: fixed;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: rgba(0, 0, 0, 0.32);\n  z-index: 1000;\n  cursor: pointer;\n  appearance: none;\n  font: inherit;\n}\n\n.start-process-dialog {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 1001;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);\n  padding: 32px 40px;\n  min-width: 420px;\n  max-width: 520px;\n  width: 90vw;\n\n  .start-process-title {\n    margin: 0 0 24px;\n    font-size: 20px;\n    font-weight: 500;\n    color: var(--mat-sys-on-surface, #212121);\n  }\n\n  .start-process-label {\n    display: block;\n    font-size: 13px;\n    color: var(--mat-sys-on-surface-variant, #666);\n    margin-bottom: 8px;\n  }\n\n  .start-process-field {\n    width: 100%;\n  }\n\n  .start-process-loading {\n    display: flex;\n    justify-content: center;\n    padding: 32px 0;\n  }\n\n  .start-process-empty {\n    font-size: 14px;\n    color: var(--mat-sys-on-surface-variant, #666);\n    text-align: center;\n    padding: 20px 0;\n    margin: 0;\n  }\n\n  .start-process-actions {\n    display: flex;\n    justify-content: flex-end;\n    margin-top: 16px;\n  }\n\n  .start-process-btn {\n    min-width: 100px;\n    text-transform: uppercase;\n    font-weight: 500;\n    letter-spacing: 0.5px;\n  }\n\n  .inline-spinner {\n    display: inline-block;\n    margin-right: 6px;\n    vertical-align: middle;\n  }\n}\n\n// AI Insights Tab\n\n.ai-tab-content {\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  /* NXENG-944 \u2014 fill the mat-tab body via flex; viewport subtraction collapses on short landscape. */\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n}\n\n// Hero Header\n.ai-insights-hero {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 0 0 4px;\n}\n\n.ai-insights-hero-text {\n  flex: 1;\n  min-width: 0;\n}\n\n.ai-insights-title {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0 0 4px;\n}\n\n.ai-insights-subtitle {\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  margin: 0;\n  max-width: 520px;\n}\n\n// 2x2 Card Grid\n.ai-insights-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n\n  @media (max-width: 800px) {\n    grid-template-columns: 1fr;\n  }\n}\n\n// Card Base\n.ai-card {\n  display: flex;\n  flex-direction: column;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #dde1e6);\n  border-radius: 12px;\n  padding: 16px;\n  transition: box-shadow 0.2s ease;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);\n  }\n}\n\n.ai-card-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 6px;\n}\n\n.ai-card-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  &--purple {\n    background: rgba(99, 102, 241, 0.1);\n\n    mat-icon {\n      color: #6366f1;\n    }\n  }\n\n  &--indigo {\n    background: rgba(99, 102, 241, 0.08);\n\n    mat-icon {\n      color: #818cf8;\n    }\n  }\n}\n\n.ai-card-title {\n  flex: 1;\n  font-size: 14px;\n  font-weight: 600;\n  margin: 0;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.ai-card-desc {\n  font-size: 12px;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  margin: 0 0 12px;\n}\n\n.ai-card-body {\n  flex: 1;\n  min-height: 0;\n}\n\n.ai-card-actions {\n  margin-top: 12px;\n  display: flex;\n  justify-content: center;\n  gap: 10px;\n\n  &--dual {\n    justify-content: flex-start;\n  }\n}\n\n// Buttons\n.ai-btn-primary {\n  background: linear-gradient(135deg, #6366f1, #818cf8) !important;\n  color: #fff !important;\n  border: none !important;\n  border-radius: 8px !important;\n  padding: 0 14px !important;\n  height: 32px;\n  font-size: 12px;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: filter 0.15s ease;\n\n  &:hover:not([disabled]) {\n    filter: brightness(1.08);\n  }\n\n  &[disabled] {\n    opacity: 0.6;\n    cursor: default;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n\n    circle {\n      stroke: #fff;\n    }\n  }\n\n  &.ai-btn-sm {\n    height: 34px;\n    padding: 0 14px !important;\n    border-radius: 8px !important;\n    font-size: 12px;\n    margin-left: auto;\n  }\n\n  &.ai-btn-full {\n    min-width: 140px;\n    justify-content: center;\n  }\n}\n\n.ai-btn-outline {\n  border: 1px solid #6366f1 !important;\n  color: #6366f1 !important;\n  background: transparent !important;\n  border-radius: 10px !important;\n  padding: 0 18px !important;\n  height: 38px;\n  font-size: 13px;\n  font-weight: 500;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover:not([disabled]) {\n    background: rgba(99, 102, 241, 0.06) !important;\n  }\n\n  &[disabled] {\n    opacity: 0.6;\n    cursor: default;\n  }\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n\n  mat-spinner {\n    display: inline-block;\n    width: 16px !important;\n    height: 16px !important;\n    flex-shrink: 0;\n\n    svg {\n      width: 16px !important;\n      height: 16px !important;\n    }\n\n    circle {\n      stroke: #6366f1;\n    }\n  }\n}\n\n// Loading Skeleton\n.ai-loading-skeleton {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n\n  .skeleton-line {\n    height: 14px;\n    border-radius: 6px;\n    background: linear-gradient(90deg, #e8e8ee 25%, #f4f4f8 50%, #e8e8ee 75%);\n    background-size: 200% 100%;\n    animation: shimmer 1.5s infinite;\n  }\n\n  .wide {\n    width: 100%;\n  }\n  .medium {\n    width: 70%;\n  }\n  .short {\n    width: 40%;\n  }\n}\n\n@keyframes shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n// Placeholder Quote\n.ai-placeholder-quote {\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  border-left: 3px solid #6366f1;\n  border-radius: 0 10px 10px 0;\n  padding: 14px 16px;\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    font-style: italic;\n    line-height: 1.6;\n    color: var(--mat-sys-on-surface-variant, #8b8fa4);\n  }\n}\n\n// Summary Result\n.ai-summary-result {\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  border-left: 3px solid #6366f1;\n  border-radius: 0 8px 8px 0;\n  padding: 12px 14px;\n}\n\n.ai-summary-text {\n  font-size: 13px;\n  line-height: 1.6;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  margin: 0;\n}\n\n.ai-key-points {\n  margin-top: 12px;\n  font-size: 13px;\n\n  strong {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  ul {\n    margin: 8px 0 0;\n    padding-left: 20px;\n\n    li {\n      margin-bottom: 4px;\n      line-height: 1.5;\n      color: var(--mat-sys-on-surface-variant, #5c5f6b);\n    }\n  }\n}\n\n// Tags\n.ai-tags-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n\n.ai-tag-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 16px;\n  font-size: 12px;\n  border: 1px solid rgba(99, 102, 241, 0.2);\n  background: rgba(99, 102, 241, 0.04);\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  transition: all 0.2s ease;\n\n  &:hover {\n    background: rgba(99, 102, 241, 0.1);\n    border-color: #6366f1;\n\n    .ai-tag-add {\n      opacity: 1;\n    }\n  }\n}\n\n.ai-tag-label {\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  font-weight: 500;\n}\n\n.ai-tag-confidence {\n  font-size: 11px;\n  color: #6366f1;\n  font-weight: 600;\n}\n\n.ai-tag-add {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: #6366f1;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n}\n\n// Classification Metadata Rows\n.ai-meta-rows {\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-meta-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e4e6eb);\n  gap: 12px;\n\n  &:last-child {\n    border-bottom: none;\n  }\n}\n\n.ai-meta-key {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #6b7080);\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  white-space: nowrap;\n}\n\n.ai-meta-val {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  text-align: right;\n\n  &--muted {\n    color: var(--mat-sys-on-surface-variant, #9498a9);\n    font-style: italic;\n  }\n}\n\n// Document Thumbnails (placeholder)\n.ai-doc-thumbs {\n  display: flex;\n  gap: 12px;\n}\n\n.ai-doc-thumb {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 20px 12px;\n  border: 1px dashed var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 12px;\n  background: var(--mat-sys-surface-container-low, #f6f7fb);\n  color: var(--mat-sys-on-surface-variant, #9498a9);\n  font-size: 12px;\n\n  &--skeleton {\n    border-style: solid;\n    border-color: rgba(99, 102, 241, 0.15);\n    background: rgba(99, 102, 241, 0.04);\n    color: #6366f1;\n    font-size: 11px;\n  }\n}\n\n.ai-doc-thumb-icon {\n  font-size: 28px;\n  width: 28px;\n  height: 28px;\n  color: var(--mat-sys-on-surface-variant, #b0b4c4);\n}\n\n// Similar Documents List\n.ai-similar-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.ai-similar-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 12px;\n  border: 1px solid var(--mat-sys-outline-variant, #dde1e6);\n  border-radius: 10px;\n  background: none;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f6f7fb);\n    border-color: rgba(99, 102, 241, 0.3);\n  }\n}\n\n.ai-similar-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.ai-similar-info {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-similar-title {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-similar-path {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-similar-score {\n  font-size: 12px;\n  font-weight: 600;\n  color: #6366f1;\n  flex-shrink: 0;\n}\n\n// Error Banner\n.ai-error-banner {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 12px;\n  background: #fdecea;\n  color: #d32f2f;\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n// NXENG-944 \u2014 WCAG 2.1 SC 1.3.4 Orientation: reflow on narrow viewports (max-width only).\n@media (max-width: 900px) {\n  .detail-body {\n    flex-direction: column;\n  }\n\n  .properties-panel {\n    width: 100%;\n    flex: 0 0 auto;\n    max-height: 50vh;\n    max-height: min(50dvh, 50vh);\n    border-left: none;\n    border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  }\n}\n", "// NXENG-826 \u2014 arrow_back via codepoint (no ligature text; legacy Material Icons font).\n.detail-header mat-icon.detail-header-go-back-icon::before {\n  content: '\\e5c4';\n  font: 24px/1 'Material Icons';\n}\n", "// NXSAT-516 / IBM 1808686844 \u2014 standalone stylesheet so the main document-detail bundle stays under the 36 kB cap.\n.detail-header-go-back-btn.mat-mdc-icon-button:focus {\n  outline: 2px solid var(--agentic-document-detail-header-focus-outline);\n  outline-offset: 2px;\n}\n", "// NXSAT-544 / IBM 2834597055 \u2014 standalone stylesheet so document-detail.scss stays under the 36 kB cap.\n// IBM Equal Access `style_focus_visible` reads `:focus` only \u2014 keep a standalone selector, not\n// a comma list with `:focus-visible` (see AGENTS/08-bug-patterns.md \u00A717).\n.panel-toggle-btn.mat-mdc-icon-button:focus {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--agentic-document-detail-panel-toggle-focus-outline);\n  outline-offset: 2px;\n}\n", "// NXSAT-332 \u2014 standalone stylesheet so the main document-detail bundle stays under the 36 kB cap.\n.version-banner {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 4px 10px;\n  padding: 8px 16px;\n  background: var(--mat-sys-surface-container-high);\n  color: var(--mat-sys-on-surface);\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  flex-shrink: 0;\n\n  .version-banner-icon {\n    color: var(--mat-sys-on-surface-variant);\n    font-size: 22px;\n    width: 22px;\n    height: 22px;\n  }\n\n  // Grows to push the actions right; below its basis the actions wrap onto their own line\n  // rather than squeezing each other at 320 CSS pixels (WCAG 1.4.10).\n  .version-banner-text {\n    flex: 1 1 12rem;\n    font-size: 13px;\n    font-weight: 500;\n  }\n\n  .version-banner-latest,\n  .version-banner-restore {\n    flex-shrink: 0;\n    white-space: nowrap;\n  }\n\n  .version-banner-restore mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n"] }]
    }], null, { panelToggle: [{ type: i0.ViewChild, args: ['panelToggle', { ...{ read: ElementRef }, isSignal: true }] }], publicationsHeading: [{ type: i0.ViewChild, args: ['publicationsHeading', { ...{ read: ElementRef }, isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentDetailComponent, { className: "DocumentDetailComponent", filePath: "libs/features/document-detail/src/lib/document-detail/document-detail.ts", lineNumber: 357 }); })();
