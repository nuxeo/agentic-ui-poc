import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Component, DestroyRef, HostListener, ViewChild, computed, effect, inject, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { BrowseService, DirectoryService, DocumentImportService, RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY, DOMAIN_CONTAINER_GUIDANCE_KEY, defaultNoteContent, BLOB_NOT_ATTACHED_ERROR, docTypeLabel, directoryPickerLabel, filterDirectoryPickerEntries, isBlobHoldingDocType, isDomainParentType, isFolderishDocument, isRepositoryRootPath, isRestrictedImportParentPath, resolveCreatableSubtypes, resolveImportBlobDocType, titleFromFileName, NOTE_FORMAT_OPTIONS, sanitizeDocumentName, summarizeCsvImportReport, formatHierarchicalL10nLabel, createExpiresErrorStateMatcher, isExpiresFieldValid, documentNavigationUrl, isCollectionDocument, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DateMaskPipe, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, } from '@nuxeo/satori-platform/ui';
import { NxsDocTypeIconComponent, NxsDropzoneComponent, NxsSpinnerComponent, NxsToastService, NxsUploadQueue, NxsUploadQueueComponent, provideNxsToast, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/chips";
import * as i8 from "@angular/material/datepicker";
import * as i9 from "@angular/material/progress-bar";
import * as i10 from "@angular/material/slide-toggle";
import * as i11 from "@angular/material/checkbox";
import * as i12 from "@angular/forms";
const _c0 = ["mainFileInput"];
const _c1 = ["expiresInput"];
const _c2 = a0 => ({ type: a0 });
const _c3 = () => ({ standalone: true });
const _c4 = a0 => ({ percent: a0 });
const _c5 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.path;
const _forTrack1 = ($index, $item) => $item.type;
const _forTrack2 = ($index, $item) => $item.id;
const _forTrack3 = ($index, $item) => $item.parentLabel;
const _forTrack4 = ($index, $item) => $item.value;
function CreateImportDialogComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "button", 15);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setActiveTab("create")); });
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 15);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_1_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setActiveTab("import")); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 15);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_1_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setActiveTab("csv")); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 13, "browse.create-import-dialog.create-or-import"));
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("tab-btn--active", ctx_r1.activeTab() === "create");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeTab() === "create");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 15, "browse.create-import-dialog.create"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("tab-btn--active", ctx_r1.activeTab() === "import");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeTab() === "import");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 17, "browse.create-import-dialog.import"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("tab-btn--active", ctx_r1.activeTab() === "csv");
    i0.ɵɵattribute("aria-selected", ctx_r1.activeTab() === "csv");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 19, "browse.create-import-dialog.csv"), " ");
} }
function CreateImportDialogComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵelement(1, "nxs-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.resolving-target-folder"));
} }
function CreateImportDialogComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.pathError());
} }
function CreateImportDialogComponent_Conditional_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵelement(1, "nxs-spinner", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.working"));
} }
function CreateImportDialogComponent_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24);
    i0.ɵɵelement(1, "nxs-spinner", 26);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.loading-folders"));
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 27)(1, "button", 28);
    i0.ɵɵlistener("mousedown", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_For_3_Template_button_mousedown_1_listener($event) { i0.ɵɵrestoreView(_r4); return i0.ɵɵresetView($event.preventDefault()); })("click", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_For_3_Template_button_click_1_listener() { const s_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.selectLocationSuggestion(s_r5.path)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r5 = ctx.$implicit;
    const ɵ$index_77_r6 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("location-option--active", ctx_r1.locationHighlightIndex() === ɵ$index_77_r6);
    i0.ɵɵattribute("aria-selected", ctx_r1.locationHighlightIndex() === ɵ$index_77_r6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", s_r5.title || s_r5.path, " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 25);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_For_3_Template, 3, 4, "li", 27, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "browse.create-import-dialog.available-folders"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.locationSuggestions());
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_0_Template, 6, 6, "div", 24)(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Conditional_1_Template, 4, 3, "ul", 25);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r1.loadingLocationSuggestions() ? 0 : ctx_r1.locationSuggestions().length > 0 ? 1 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵelement(1, "span", 29);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, ctx_r1.importLocationHint()), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30);
    i0.ɵɵelement(1, "nxs-spinner", 34);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.loading-document-types"));
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.typesLoadError());
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.create-import-dialog.no-document-types-can-be-created"), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_3_For_2_Template_button_click_0_listener() { const dt_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r1.startCreateFromType(dt_r8)); });
    i0.ɵɵelement(1, "nxs-doc-type-icon", 37);
    i0.ɵɵelementStart(2, "span", 38);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const dt_r8 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(6);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.locationRestricted());
    i0.ɵɵadvance();
    i0.ɵɵproperty("type", dt_r8.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(dt_r8.label);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵrepeaterCreate(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_3_For_2_Template, 4, 3, "button", 35, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.creatableTypes());
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_0_Template, 6, 6, "div", 30)(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_1_Template, 2, 1, "p", 31)(2, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_2_Template, 3, 3, "p", 32)(3, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Conditional_3_Template, 3, 0, "div", 33);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵconditional(ctx_r1.loadingContext() ? 0 : ctx_r1.typesLoadError() ? 1 : ctx_r1.creatableTypes().length === 0 ? 2 : 3);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Conditional_0_Template, 4, 1);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(!ctx_r1.locationRestricted() ? 0 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "browse.create-import-dialog.file-import-is-not-available-at"), " choose a folder below. ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, ctx_r1.importLocationHint()), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 32);
    i0.ɵɵconditionalCreate(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Conditional_1_Template, 2, 3)(2, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Conditional_2_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isAtRepositoryRoot() ? 1 : 2);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.importError(), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 39)(1, "nxs-dropzone", 40);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("files", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Template_nxs_dropzone_files_1_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.stageImportFiles($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "nxs-upload-queue", 41);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("remove", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Template_nxs_upload_queue_remove_4_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.uploads.remove($event)); })("retry", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Template_nxs_upload_queue_retry_4_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.runUpload()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Conditional_6_Template, 2, 1, "p", 42);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy())("label", i0.ɵɵpipeBind1(2, 6, "browse.create-import-dialog.drag-and-drop-or-click-to"))("buttonLabel", ctx_r1.uploads.items().length > 0 ? i0.ɵɵpipeBind1(3, 8, "browse.create-import-dialog.add-more-files") : "");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("items", ctx_r1.uploads.items())("label", i0.ɵɵpipeBind1(5, 10, "browse.create-import-dialog.selected-files"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.importError() ? 6 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_0_Template, 3, 1, "p", 32)(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Conditional_1_Template, 7, 12, "div", 39);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r1.importRestricted() ? 0 : 1);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx_r1.importLocationHint()));
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "ul", 49)(1, "li")(2, "span", 52);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 53);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Conditional_7_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.clearCsvFile()); });
    i0.ɵɵelementStart(6, "mat-icon");
    i0.ɵɵtext(7, "close");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.name);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(5, 3, "browse.create-import-dialog.remove-csv-file"));
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 45);
    i0.ɵɵlistener("dragover", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_div_dragover_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onCsvDragOver($event)); })("dragleave", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_div_dragleave_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onCsvDragLeave($event)); })("drop", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_div_drop_0_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onCsvDrop($event)); });
    i0.ɵɵelementStart(1, "input", 46, 0);
    i0.ɵɵlistener("change", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_input_change_1_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onCsvInputChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 47);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r10); const csvInput_r11 = i0.ɵɵreference(2); return i0.ɵɵresetView(csvInput_r11.click()); });
    i0.ɵɵelementStart(4, "span", 48);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(7, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Conditional_7_Template, 8, 5, "ul", 49);
    i0.ɵɵelementStart(8, "div", 50)(9, "mat-slide-toggle", 51);
    i0.ɵɵlistener("change", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_mat_slide_toggle_change_9_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.csvSendReport.set($event.checked)); });
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "mat-slide-toggle", 51);
    i0.ɵɵlistener("change", function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template_mat_slide_toggle_change_12_listener($event) { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.csvDocumentMode.set($event.checked)); });
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_9_0;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵclassProp("dropzone--active", ctx_r1.dragOverCsv());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 12, "browse.create-import-dialog.click-to-select-a-csv-file"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_9_0 = ctx_r1.csvFile()) ? 7 : -1, tmp_9_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.csvSendReport())("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 14, "browse.create-import-dialog.receive-the-import-report-by-email"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.csvDocumentMode())("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 16, "browse.create-import-dialog.apply-date-author-and-dublin-core"), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 43);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.importError());
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 54);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "mat-progress-bar", 55);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const progress_r13 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.uploadProgressLabel(progress_r13));
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", progress_r13.percent);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_0_Template, 3, 3, "p", 32)(1, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_1_Template, 15, 18);
    i0.ɵɵconditionalCreate(2, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_2_Template, 2, 1, "p", 43);
    i0.ɵɵconditionalCreate(3, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Conditional_3_Template, 4, 2, "div", 44);
} if (rf & 2) {
    let tmp_5_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r1.csvImportRestricted() ? 0 : 1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.importError() ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = ctx_r1.uploadProgress()) ? 3 : -1, tmp_5_0);
} }
function CreateImportDialogComponent_Conditional_5_Case_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "span", 20);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 21)(5, "input", 22);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_2_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.locationInput, $event) || (ctx_r1.locationInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("focus", function CreateImportDialogComponent_Conditional_5_Case_2_Template_input_focus_5_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationFocus()); })("input", function CreateImportDialogComponent_Conditional_5_Case_2_Template_input_input_5_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationInput()); })("blur", function CreateImportDialogComponent_Conditional_5_Case_2_Template_input_blur_5_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationBlur()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_2_Template_input_keydown_5_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationKeydown($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_7_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_8_Template, 4, 3, "p", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_9_Template, 1, 1)(10, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_10_Template, 2, 1)(11, CreateImportDialogComponent_Conditional_5_Case_2_Conditional_11_Template, 4, 3);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("location-bar--restricted", ctx_r1.locationRestricted());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 9, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.locationInput);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 11, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.locationDropdownOpen() ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.locationRestricted() ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.activeTab() === "create" ? 9 : ctx_r1.activeTab() === "import" ? 10 : 11);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24);
    i0.ɵɵelement(1, "nxs-spinner", 26);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.loading-folders"));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 27)(1, "button", 28);
    i0.ɵɵlistener("mousedown", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_For_3_Template_button_mousedown_1_listener($event) { i0.ɵɵrestoreView(_r15); return i0.ɵɵresetView($event.preventDefault()); })("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_For_3_Template_button_click_1_listener() { const s_r16 = i0.ɵɵrestoreView(_r15).$implicit; const ctx_r1 = i0.ɵɵnextContext(6); return i0.ɵɵresetView(ctx_r1.selectLocationSuggestion(s_r16.path)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r16 = ctx.$implicit;
    const ɵ$index_237_r17 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(6);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("location-option--active", ctx_r1.locationHighlightIndex() === ɵ$index_237_r17);
    i0.ɵɵattribute("aria-selected", ctx_r1.locationHighlightIndex() === ɵ$index_237_r17);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", s_r16.title || s_r16.path, " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 25);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_For_3_Template, 3, 4, "li", 27, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "browse.create-import-dialog.available-folders"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.locationSuggestions());
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_0_Template, 6, 6, "div", 24)(1, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Conditional_1_Template, 4, 3, "ul", 25);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵconditional(ctx_r1.loadingLocationSuggestions() ? 0 : ctx_r1.locationSuggestions().length > 0 ? 1 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵelement(1, "span", 29);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, ctx_r1.importLocationHint()), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 78);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.create-import-dialog.upload-a-main-file-to-create"), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 78);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.contentError(), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "browse.create-import-dialog.uploading-percent", i0.ɵɵpureFunction1(4, _c4, ctx_r1.mainFileUploadPercent())), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "browse.create-import-dialog.upload-complete"), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-progress-bar", 85);
    i0.ɵɵelementStart(1, "span", 86);
    i0.ɵɵconditionalCreate(2, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Conditional_2_Template, 2, 6)(3, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Conditional_3_Template, 2, 3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(6);
    i0.ɵɵclassProp("content-file-progress--complete", ctx_r1.mainFileUploadComplete());
    i0.ɵɵproperty("value", ctx_r1.mainFileUploadPercent());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.mainFileUploading() ? 2 : 3);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 81)(1, "div", 83)(2, "span", 84);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Conditional_4_Template, 4, 4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 53);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Template_button_click_5_listener($event) { i0.ɵɵrestoreView(_r19); const ctx_r1 = i0.ɵɵnextContext(5); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r1.clearMainFile()); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.name);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.mainFileUploading() || ctx_r1.mainFileUploadComplete() ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.mainFileUploading());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 4, "browse.create-import-dialog.remove-file"));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 87);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r20); i0.ɵɵnextContext(); const mainFileInput_r21 = i0.ɵɵreference(7); return i0.ɵɵresetView(mainFileInput_r21.click()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "browse.create-import-dialog.upload-main-file"), " ");
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 77);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_3_Template, 3, 3, "p", 78);
    i0.ɵɵconditionalCreate(4, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_4_Template, 2, 1, "p", 78);
    i0.ɵɵelementStart(5, "div", 79);
    i0.ɵɵlistener("dragover", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template_div_dragover_5_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onContentDragOver($event)); })("dragleave", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template_div_dragleave_5_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onContentDragLeave($event)); })("drop", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template_div_drop_5_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onContentDrop($event)); });
    i0.ɵɵelementStart(6, "input", 80, 5);
    i0.ɵɵlistener("change", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.onMainFileInputChange($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_8_Template, 9, 6, "div", 81)(9, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Conditional_9_Template, 3, 3, "button", 82);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_17_0;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 11, "browse.create-import-dialog.content"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.createMissingMainFile() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.contentError() ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("content-dropzone--active", ctx_r1.dragOverContent())("content-dropzone--filled", ctx_r1.mainFile())("content-dropzone--uploading", ctx_r1.mainFileUploading());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.mainFileUploading());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_17_0 = ctx_r1.mainFile()) ? 8 : 9, tmp_17_0);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_26_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r23 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r23.value);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opt_r23.label);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 61)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "mat-select", 88);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_26_Template_mat_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r1.noteFormat, $event) || (ctx_r1.noteFormat = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵrepeaterCreate(5, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_26_For_6_Template, 2, 2, "mat-option", 70, _forTrack4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "browse.create-import-dialog.format"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.noteFormat);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.noteFormatOptions);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 66)(1, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_34_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.clearNature()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 90);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_34_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(4); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r1.clearNature()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const natureId_r26 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.naturePillLabel(natureId_r26), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.naturePillLabel(natureId_r26))));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r27 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", entry_r27.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.directoryPickerLabel(entry_r27));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_49_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_49_Template_mat_chip_removed_0_listener() { const id_r29 = i0.ɵɵrestoreView(_r28).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.removeSubject(id_r29)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 90);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_49_Template_button_click_2_listener($event) { i0.ɵɵrestoreView(_r28); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r29 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.subjectPillLabel(id_r29), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.subjectPillLabel(id_r29))));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_55_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r30 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r30.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r30.properties.label_en ?? entry_r30.id);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 73);
    i0.ɵɵrepeaterCreate(1, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_55_For_2_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r31 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r31.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r31.entries);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 66)(1, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_63_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.clearCoverage()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 90);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_63_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r33); const ctx_r1 = i0.ɵɵnextContext(4); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r1.clearCoverage()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const coverageId_r34 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.coveragePillLabel(coverageId_r34), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.coveragePillLabel(coverageId_r34))));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_69_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r35 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r35.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r35.properties.label_en ?? entry_r35.id);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_69_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 73);
    i0.ɵɵrepeaterCreate(1, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_69_For_2_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r36 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r36.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r36.entries);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.create-import-dialog.enter-a-valid-date"));
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 56);
    i0.ɵɵelement(1, "nxs-doc-type-icon", 57);
    i0.ɵɵelementStart(2, "span", 58);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 59)(6, "div", 60)(7, "span", 20);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 21)(11, "input", 22);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.locationInput, $event) || (ctx_r1.locationInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("focus", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_focus_11_listener() { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onLocationFocus()); })("input", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_input_11_listener() { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onLocationInput()); })("blur", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_blur_11_listener() { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onLocationBlur()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_keydown_11_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onLocationKeydown($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_13_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(14, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_14_Template, 4, 3, "p", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "mat-form-field", 61)(16, "mat-label");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "input", 62);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_19_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.docTitle, $event) || (ctx_r1.docTitle = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "mat-form-field", 61)(21, "mat-label");
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "input", 63);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.description, $event) || (ctx_r1.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(25, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_25_Template, 10, 13);
    i0.ɵɵconditionalCreate(26, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_26_Template, 7, 4, "mat-form-field", 61);
    i0.ɵɵelementStart(27, "mat-form-field", 64)(28, "mat-label");
    i0.ɵɵtext(29);
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "mat-select", 65, 1);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_ngModelChange_31_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.nature, $event) || (ctx_r1.nature = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_openedChange_31_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onNaturePanelOpen($event)); })("selectionChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_selectionChange_31_listener() { i0.ɵɵrestoreView(_r14); const natureSelect_r24 = i0.ɵɵreference(32); return i0.ɵɵresetView(natureSelect_r24.close()); });
    i0.ɵɵelementStart(33, "mat-select-trigger");
    i0.ɵɵconditionalCreate(34, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_34_Template, 7, 7, "mat-chip-set", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 67)(36, "input", 68);
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.naturePanelSearch, $event) || (ctx_r1.naturePanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_click_36_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_keydown_36_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "div", 69);
    i0.ɵɵrepeaterCreate(39, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_40_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(41, "mat-form-field", 71)(42, "mat-label");
    i0.ɵɵtext(43);
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "mat-select", 72);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_ngModelChange_45_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.subjects, $event) || (ctx_r1.subjects = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_openedChange_45_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onSubjectsPanelOpen($event)); });
    i0.ɵɵelementStart(46, "mat-select-trigger")(47, "mat-chip-set", 66);
    i0.ɵɵrepeaterCreate(48, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_49_Template, 6, 7, "mat-chip", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 67)(51, "input", 68);
    i0.ɵɵpipe(52, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_51_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.subjectsPanelSearch, $event) || (ctx_r1.subjectsPanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_click_51_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_keydown_51_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(53, "div", 69);
    i0.ɵɵrepeaterCreate(54, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_55_Template, 3, 1, "mat-optgroup", 73, _forTrack3);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(56, "mat-form-field", 64)(57, "mat-label");
    i0.ɵɵtext(58);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "mat-select", 74, 2);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_ngModelChange_60_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.coverage, $event) || (ctx_r1.coverage = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_openedChange_60_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onCoveragePanelOpen($event)); })("selectionChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_mat_select_selectionChange_60_listener() { i0.ɵɵrestoreView(_r14); const coverageSelect_r32 = i0.ɵɵreference(61); return i0.ɵɵresetView(coverageSelect_r32.close()); });
    i0.ɵɵelementStart(62, "mat-select-trigger");
    i0.ɵɵconditionalCreate(63, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_63_Template, 7, 7, "mat-chip-set", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(64, "div", 67)(65, "input", 68);
    i0.ɵɵpipe(66, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_65_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.coveragePanelSearch, $event) || (ctx_r1.coveragePanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_click_65_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_keydown_65_listener($event) { i0.ɵɵrestoreView(_r14); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(67, "div", 69);
    i0.ɵɵrepeaterCreate(68, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_For_69_Template, 3, 1, "mat-optgroup", 73, _forTrack3);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(70, "mat-form-field", 61)(71, "mat-label");
    i0.ɵɵtext(72);
    i0.ɵɵpipe(73, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "input", 75, 3);
    i0.ɵɵpipe(76, "translate");
    i0.ɵɵpipe(77, "dateMask");
    i0.ɵɵlistener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_ngModelChange_74_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onExpiresChange($event)); })("input", function CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template_input_input_74_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onExpiresInput($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(78, "mat-datepicker-toggle", 76)(79, "mat-datepicker", null, 4);
    i0.ɵɵconditionalCreate(81, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Conditional_81_Template, 3, 3, "mat-error");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_25_0;
    let tmp_39_0;
    const dt_r37 = ctx;
    const expiresPicker_r38 = i0.ɵɵreference(80);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("type", dt_r37.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(4, 42, "browse.create-import-dialog.new-of-type", i0.ɵɵpureFunction1(71, _c2, dt_r37.label)), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("location-bar--restricted", ctx_r1.locationRestricted());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 45, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.locationInput);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 47, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.locationDropdownOpen() ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.locationRestricted() ? 14 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 49, "browse.create-import-dialog.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.docTitle);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 51, "browse.create-import-dialog.description"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.description);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.hasContentField() ? 25 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isNoteType() ? 26 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(30, 53, "browse.create-import-dialog.nature"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.nature);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_25_0 = ctx_r1.nature) ? 34 : -1, tmp_25_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(37, 55, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.naturePanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(73, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.filteredNatureOptions());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(44, 57, "browse.create-import-dialog.subjects"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.subjects);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.subjects);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(52, 59, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.subjectsPanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(74, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.groupedSubjectOptions());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 61, "browse.create-import-dialog.coverage"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.coverage);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_39_0 = ctx_r1.coverage) ? 63 : -1, tmp_39_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(66, 63, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.coveragePanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(75, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.groupedCoverageOptions());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("expires-field-invalid", ctx_r1.showExpiresError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(73, 65, "browse.create-import-dialog.expires"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", expiresPicker_r38)("ngModel", ctx_r1.expires)("errorStateMatcher", ctx_r1.expiresErrorMatcher)("placeholder", i0.ɵɵpipeBind1(77, 69, i0.ɵɵpipeBind1(76, 67, "common.date-mask")));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("for", expiresPicker_r38);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.showExpiresError() ? 81 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Case_3_Conditional_0_Template, 82, 76);
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_2_0 = ctx_r1.selectedDocType()) ? 0 : -1, tmp_2_0);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const dt_r40 = ctx.$implicit;
    i0.ɵɵproperty("value", dt_r40.type);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(dt_r40.label);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 66)(1, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_18_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r43); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.clearNature()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 90);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_18_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r43); const ctx_r1 = i0.ɵɵnextContext(4); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r1.clearNature()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const natureId_r44 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.naturePillLabel(natureId_r44), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.naturePillLabel(natureId_r44))));
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r45 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", entry_r45.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.directoryPickerLabel(entry_r45));
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_33_Template(rf, ctx) { if (rf & 1) {
    const _r46 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_33_Template_mat_chip_removed_0_listener() { const id_r47 = i0.ɵɵrestoreView(_r46).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.removeSubject(id_r47)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 90);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_33_Template_button_click_2_listener($event) { i0.ɵɵrestoreView(_r46); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r47 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.subjectPillLabel(id_r47), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.subjectPillLabel(id_r47))));
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_39_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r48 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r48.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r48.properties.label_en ?? entry_r48.id);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 73);
    i0.ɵɵrepeaterCreate(1, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_39_For_2_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r49 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r49.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r49.entries);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    const _r51 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-set", 66)(1, "mat-chip", 89);
    i0.ɵɵlistener("removed", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_47_Template_mat_chip_removed_1_listener() { i0.ɵɵrestoreView(_r51); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.clearCoverage()); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "button", 90);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_47_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r51); const ctx_r1 = i0.ɵɵnextContext(4); $event.stopPropagation(); return i0.ɵɵresetView(ctx_r1.clearCoverage()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "cancel");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const coverageId_r52 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.coveragePillLabel(coverageId_r52), " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(4, 2, "shared.remove-item", i0.ɵɵpureFunction1(5, _c5, ctx_r1.coveragePillLabel(coverageId_r52))));
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_53_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r53 = ctx.$implicit;
    i0.ɵɵproperty("value", entry_r53.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(entry_r53.properties.label_en ?? entry_r53.id);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 73);
    i0.ɵɵrepeaterCreate(1, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_53_For_2_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r54 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r54.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r54.entries);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "browse.create-import-dialog.enter-a-valid-date"));
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 94)(1, "mat-form-field", 61)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 62);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.docTitle, $event) || (ctx_r1.docTitle = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "mat-form-field", 61)(7, "mat-label");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "input", 63);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.description, $event) || (ctx_r1.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "mat-form-field", 64)(12, "mat-label");
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "mat-select", 65, 6);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.nature, $event) || (ctx_r1.nature = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_openedChange_15_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onNaturePanelOpen($event)); })("selectionChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_selectionChange_15_listener() { i0.ɵɵrestoreView(_r41); const importNatureSelect_r42 = i0.ɵɵreference(16); return i0.ɵɵresetView(importNatureSelect_r42.close()); });
    i0.ɵɵelementStart(17, "mat-select-trigger");
    i0.ɵɵconditionalCreate(18, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_18_Template, 7, 7, "mat-chip-set", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 67)(20, "input", 68);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.naturePanelSearch, $event) || (ctx_r1.naturePanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_click_20_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_keydown_20_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 69);
    i0.ɵɵrepeaterCreate(23, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_24_Template, 2, 2, "mat-option", 70, _forTrack2);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(25, "mat-form-field", 71)(26, "mat-label");
    i0.ɵɵtext(27);
    i0.ɵɵpipe(28, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "mat-select", 72);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.subjects, $event) || (ctx_r1.subjects = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_openedChange_29_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onSubjectsPanelOpen($event)); });
    i0.ɵɵelementStart(30, "mat-select-trigger")(31, "mat-chip-set", 66);
    i0.ɵɵrepeaterCreate(32, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_33_Template, 6, 7, "mat-chip", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 67)(35, "input", 68);
    i0.ɵɵpipe(36, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_35_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.subjectsPanelSearch, $event) || (ctx_r1.subjectsPanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_click_35_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_keydown_35_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 69);
    i0.ɵɵrepeaterCreate(38, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_39_Template, 3, 1, "mat-optgroup", 73, _forTrack3);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(40, "mat-form-field", 64)(41, "mat-label");
    i0.ɵɵtext(42);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "mat-select", 74, 7);
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_ngModelChange_44_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.coverage, $event) || (ctx_r1.coverage = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("openedChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_openedChange_44_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onCoveragePanelOpen($event)); })("selectionChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_mat_select_selectionChange_44_listener() { i0.ɵɵrestoreView(_r41); const importCoverageSelect_r50 = i0.ɵɵreference(45); return i0.ɵɵresetView(importCoverageSelect_r50.close()); });
    i0.ɵɵelementStart(46, "mat-select-trigger");
    i0.ɵɵconditionalCreate(47, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_47_Template, 7, 7, "mat-chip-set", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "div", 67)(49, "input", 68);
    i0.ɵɵpipe(50, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_49_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.coveragePanelSearch, $event) || (ctx_r1.coveragePanelSearch = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_click_49_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_keydown_49_listener($event) { i0.ɵɵrestoreView(_r41); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(51, "div", 69);
    i0.ɵɵrepeaterCreate(52, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_For_53_Template, 3, 1, "mat-optgroup", 73, _forTrack3);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(54, "mat-form-field", 61)(55, "mat-label");
    i0.ɵɵtext(56);
    i0.ɵɵpipe(57, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(58, "input", 99);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵpipe(60, "dateMask");
    i0.ɵɵlistener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_ngModelChange_58_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onExpiresChange($event)); })("input", function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template_input_input_58_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onExpiresInput($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(61, "mat-datepicker-toggle", 76)(62, "mat-datepicker", null, 8);
    i0.ɵɵconditionalCreate(64, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Conditional_64_Template, 3, 3, "mat-error");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_12_0;
    let tmp_26_0;
    const importExpiresPicker_r55 = i0.ɵɵreference(63);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 30, "browse.create-import-dialog.title"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.docTitle);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 32, "browse.create-import-dialog.description"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.description);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 34, "browse.create-import-dialog.nature"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.nature);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_12_0 = ctx_r1.nature) ? 18 : -1, tmp_12_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(21, 36, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.naturePanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(52, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.filteredNatureOptions());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(28, 38, "browse.create-import-dialog.subjects"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.subjects);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.subjects);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(36, 40, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.subjectsPanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(53, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.groupedSubjectOptions());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 42, "browse.create-import-dialog.coverage"));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.coverage);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_26_0 = ctx_r1.coverage) ? 47 : -1, tmp_26_0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(50, 44, "browse.create-import-dialog.search"));
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.coveragePanelSearch);
    i0.ɵɵproperty("ngModelOptions", i0.ɵɵpureFunction0(54, _c3));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.groupedCoverageOptions());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("expires-field-invalid", ctx_r1.showExpiresError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(57, 46, "browse.create-import-dialog.expires"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", importExpiresPicker_r55)("ngModel", ctx_r1.expires)("errorStateMatcher", ctx_r1.expiresErrorMatcher)("placeholder", i0.ɵɵpipeBind1(60, 50, i0.ɵɵpipeBind1(59, 48, "common.date-mask")));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", importExpiresPicker_r55);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.showExpiresError() ? 64 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 43);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.importError());
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 54);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "mat-progress-bar", 55);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const progress_r56 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.uploadProgressLabel(progress_r56));
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", progress_r56.percent);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_For_29_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 105);
    i0.ɵɵtext(1, "check_circle");
    i0.ɵɵelementEnd();
} }
function CreateImportDialogComponent_Conditional_5_Case_4_For_29_Template(rf, ctx) { if (rf & 1) {
    const _r57 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 100)(1, "mat-checkbox", 101);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("change", function CreateImportDialogComponent_Conditional_5_Case_4_For_29_Template_mat_checkbox_change_1_listener($event) { const ɵ$index_647_r58 = i0.ɵɵrestoreView(_r57).$index; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleImportFileChecked(ɵ$index_647_r58, $event.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 102);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_5_Case_4_For_29_Template_button_click_3_listener() { const ɵ$index_647_r58 = i0.ɵɵrestoreView(_r57).$index; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.selectImportFile(ɵ$index_647_r58)); });
    i0.ɵɵelementStart(4, "span", 103);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 104);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, CreateImportDialogComponent_Conditional_5_Case_4_For_29_Conditional_8_Template, 2, 0, "mat-icon", 105);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r59 = ctx.$implicit;
    const ɵ$index_647_r58 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("import-file-item--active", ctx_r1.importFileIndex() === ɵ$index_647_r58);
    i0.ɵɵadvance();
    i0.ɵɵproperty("checked", entry_r59.checked)("disabled", ctx_r1.busy());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(2, 9, "shared.include-file", i0.ɵɵpureFunction1(12, _c5, entry_r59.file.name)));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(entry_r59.file.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(entry_r59.state.title);
    i0.ɵɵadvance();
    i0.ɵɵconditional(entry_r59.visited ? 8 : -1);
} }
function CreateImportDialogComponent_Conditional_5_Case_4_Template(rf, ctx) { if (rf & 1) {
    const _r39 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 17)(1, "div", 91)(2, "div", 60)(3, "span", 20);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 21)(7, "input", 22);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵtwoWayListener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.locationInput, $event) || (ctx_r1.locationInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("focus", function CreateImportDialogComponent_Conditional_5_Case_4_Template_input_focus_7_listener() { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationFocus()); })("input", function CreateImportDialogComponent_Conditional_5_Case_4_Template_input_input_7_listener() { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationInput()); })("blur", function CreateImportDialogComponent_Conditional_5_Case_4_Template_input_blur_7_listener() { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationBlur()); })("keydown", function CreateImportDialogComponent_Conditional_5_Case_4_Template_input_keydown_7_listener($event) { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onLocationKeydown($event)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "mat-form-field", 61)(10, "mat-label");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "mat-select", 92);
    i0.ɵɵlistener("ngModelChange", function CreateImportDialogComponent_Conditional_5_Case_4_Template_mat_select_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r39); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.importDocType.set($event)); });
    i0.ɵɵelementStart(14, "mat-option", 93);
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(17, CreateImportDialogComponent_Conditional_5_Case_4_For_18_Template, 2, 2, "mat-option", 70, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(19, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_19_Template, 65, 55, "div", 94);
    i0.ɵɵconditionalCreate(20, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_20_Template, 2, 1, "p", 43);
    i0.ɵɵconditionalCreate(21, CreateImportDialogComponent_Conditional_5_Case_4_Conditional_21_Template, 4, 2, "div", 44);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "aside", 95);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementStart(24, "p", 96);
    i0.ɵɵtext(25);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "ul", 97);
    i0.ɵɵrepeaterCreate(28, CreateImportDialogComponent_Conditional_5_Case_4_For_29_Template, 9, 14, "li", 98, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_14_0;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("location-bar--restricted", ctx_r1.locationRestricted());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 15, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.locationInput);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 17, "browse.create-import-dialog.location"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 19, "browse.create-import-dialog.type"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r1.importDocType())("disabled", ctx_r1.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(16, 21, "browse.create-import-dialog.select-a-value"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.importBlobTypeOptions());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.showImportBlobMetadataFields() ? 19 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.importError() ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_14_0 = ctx_r1.uploadProgress()) ? 21 : -1, tmp_14_0);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(23, 23, "browse.create-import-dialog.files-to-import"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 25, "browse.create-import-dialog.unchecked-files-will-be-discarded"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.importEntries());
} }
function CreateImportDialogComponent_Conditional_5_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18)(1, "mat-icon", 106);
    i0.ɵɵtext(2, "check_circle");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2", 107);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 108);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, "browse.create-import-dialog.done"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.successMessage());
} }
function CreateImportDialogComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateImportDialogComponent_Conditional_5_Conditional_0_Template, 6, 6, "div", 12);
    i0.ɵɵconditionalCreate(1, CreateImportDialogComponent_Conditional_5_Conditional_1_Template, 2, 1, "p", 13);
    i0.ɵɵconditionalCreate(2, CreateImportDialogComponent_Conditional_5_Case_2_Template, 12, 13)(3, CreateImportDialogComponent_Conditional_5_Case_3_Template, 1, 1)(4, CreateImportDialogComponent_Conditional_5_Case_4_Template, 30, 27, "div", 17)(5, CreateImportDialogComponent_Conditional_5_Case_5_Template, 8, 4, "div", 18);
} if (rf & 2) {
    let tmp_3_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.busy() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.error() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_3_0 = ctx_r1.view()) === "main" ? 2 : tmp_3_0 === "templateForm" ? 3 : tmp_3_0 === "importProperties" ? 4 : tmp_3_0 === "success" ? 5 : -1);
} }
function CreateImportDialogComponent_Conditional_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r60 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 112);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r60); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.close()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.cancel"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r61 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 113);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r61); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.close()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 114);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_3_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r61); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.doneNavigateBrowse()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.close"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "browse.create-import-dialog.ok"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r62 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 115);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r62); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.goMain()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 116);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_4_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r62); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.createDocument()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 4, "browse.create-import-dialog.back"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.docTitle.trim() || ctx_r1.locationRestricted() || ctx_r1.createMissingMainFile() || ctx_r1.mainFileUploadPending() || !ctx_r1.isExpiresValid());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 6, "browse.create-import-dialog.create"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r63 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 117);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r63); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.startImportProperties()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 116);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_5_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r63); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runUpload()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.importRestricted());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 4, "browse.create-import-dialog.add-properties"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || ctx_r1.importRestricted());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 6, "browse.create-import-dialog.create"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r64 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 118)(1, "button", 119);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_6_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r64); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editImportPrevious()); });
    i0.ɵɵelementStart(2, "mat-icon", 120);
    i0.ɵɵtext(3, "chevron_left");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 119);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_6_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r64); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editImportNext()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementStart(9, "mat-icon", 120);
    i0.ɵɵtext(10, "chevron_right");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 119);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_6_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r64); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.applyImportToAll()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(14, "span", 110);
    i0.ɵɵelementStart(15, "button", 116);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_6_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r64); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runImportWithProperties()); });
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r1.canEditImportPrevious() || ctx_r1.busy());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 8, "browse.create-import-dialog.edit-previous"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.canEditImportNext() || ctx_r1.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 10, "browse.create-import-dialog.edit-next"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.canApplyImportToAll());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 12, "browse.create-import-dialog.apply-to-all"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.canCreateImportWithProperties());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 14, "browse.create-import-dialog.create"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r65 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 116);
    i0.ɵɵlistener("click", function CreateImportDialogComponent_Conditional_6_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r65); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.runCsvImport()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() || !ctx_r1.csvFile() || ctx_r1.csvImportRestricted());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "browse.create-import-dialog.import"), " ");
} }
function CreateImportDialogComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-dialog-actions", 14);
    i0.ɵɵconditionalCreate(1, CreateImportDialogComponent_Conditional_6_Conditional_1_Template, 3, 4, "button", 109);
    i0.ɵɵelement(2, "span", 110);
    i0.ɵɵconditionalCreate(3, CreateImportDialogComponent_Conditional_6_Conditional_3_Template, 6, 6)(4, CreateImportDialogComponent_Conditional_6_Conditional_4_Template, 6, 8)(5, CreateImportDialogComponent_Conditional_6_Conditional_5_Template, 6, 8)(6, CreateImportDialogComponent_Conditional_6_Conditional_6_Template, 18, 16)(7, CreateImportDialogComponent_Conditional_6_Conditional_7_Template, 3, 4, "button", 111);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.view() !== "success" ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.view() === "success" ? 3 : ctx_r1.view() === "templateForm" ? 4 : ctx_r1.view() === "main" && ctx_r1.activeTab() === "import" && ctx_r1.uploads.pending().length > 0 ? 5 : ctx_r1.view() === "importProperties" ? 6 : ctx_r1.view() === "main" && ctx_r1.activeTab() === "csv" ? 7 : -1);
} }
function defaultImportPropertiesState(file) {
    return {
        title: titleFromFileName(file.name),
        description: '',
        nature: null,
        subjects: [],
        coverage: null,
        expires: null,
        expiresRawText: '',
    };
}
function cloneImportPropertiesState(state) {
    return {
        ...state,
        subjects: [...state.subjects],
        expires: state.expires ? new Date(state.expires.getTime()) : null,
    };
}
/** Web UI copies metadata to all files but keeps each destination file's own name as title. */
function applyImportPropertiesTemplate(template, file, keepTemplateTitle) {
    const state = cloneImportPropertiesState(template);
    if (!keepTemplateTitle) {
        state.title = titleFromFileName(file.name);
    }
    return state;
}
function toDocTypeDefs(types, translate) {
    return types.map((type) => ({
        type,
        label: docTypeLabel(type, translate),
    }));
}
const DIALOG_SIZE = {
    content: { width: '960px', height: '680px' },
    success: { width: '440px' },
};
export class CreateImportDialogComponent {
    translate = inject(TranslateService);
    mainFileInput;
    expiresNgModel;
    dialogRef = inject((MatDialogRef));
    destroyRef = inject(DestroyRef);
    dateAdapter = inject(DateAdapter);
    dateFormats = inject(MAT_DATE_FORMATS);
    data = inject(MAT_DIALOG_DATA);
    importService = inject(DocumentImportService);
    browse = inject(BrowseService);
    directoryService = inject(DirectoryService);
    toast = inject(NxsToastService);
    folderContextRequestId = 0;
    locationSuggestionsRequestId = 0;
    mainFileUploadRequestId = 0;
    mainFileBatchId = null;
    noteFormatOptions = NOTE_FORMAT_OPTIONS;
    constructor() {
        effect(() => {
            const path = this.parentPath();
            if (!path)
                return;
            this.loadLocationSuggestions(path);
            if (isRestrictedImportParentPath(path)) {
                this.creatableTypes.set([]);
                this.loadingContext.set(false);
                this.typesLoadError.set(null);
                return;
            }
            this.loadFolderContext(path);
        });
        effect(() => {
            const v = this.view();
            if (v === 'success') {
                this.dialogRef.updateSize(DIALOG_SIZE.success.width);
            }
            else {
                this.dialogRef.updateSize(DIALOG_SIZE.content.width, DIALOG_SIZE.content.height);
            }
        });
    }
    resolvingPath = signal(false, ...(ngDevMode ? [{ debugName: "resolvingPath" }] : []));
    parentPath = signal(null, ...(ngDevMode ? [{ debugName: "parentPath" }] : []));
    pathError = signal(null, ...(ngDevMode ? [{ debugName: "pathError" }] : []));
    view = signal('main', ...(ngDevMode ? [{ debugName: "view" }] : []));
    activeTab = signal('create', ...(ngDevMode ? [{ debugName: "activeTab" }] : []));
    selectedDocType = signal(null, ...(ngDevMode ? [{ debugName: "selectedDocType" }] : []));
    parentFolderType = signal(null, ...(ngDevMode ? [{ debugName: "parentFolderType" }] : []));
    creatableTypes = signal([], ...(ngDevMode ? [{ debugName: "creatableTypes" }] : []));
    loadingContext = signal(false, ...(ngDevMode ? [{ debugName: "loadingContext" }] : []));
    typesLoadError = signal(null, ...(ngDevMode ? [{ debugName: "typesLoadError" }] : []));
    locationInput = '';
    locationSuggestions = signal([], ...(ngDevMode ? [{ debugName: "locationSuggestions" }] : []));
    locationDropdownOpen = signal(false, ...(ngDevMode ? [{ debugName: "locationDropdownOpen" }] : []));
    locationHighlightIndex = signal(-1, ...(ngDevMode ? [{ debugName: "locationHighlightIndex" }] : []));
    loadingLocationSuggestions = signal(false, ...(ngDevMode ? [{ debugName: "loadingLocationSuggestions" }] : []));
    natureEntries = signal([], ...(ngDevMode ? [{ debugName: "natureEntries" }] : []));
    directoryPickerLabel = directoryPickerLabel;
    subjectEntries = signal([], ...(ngDevMode ? [{ debugName: "subjectEntries" }] : []));
    coverageEntries = signal([], ...(ngDevMode ? [{ debugName: "coverageEntries" }] : []));
    directoriesLoaded = signal(false, ...(ngDevMode ? [{ debugName: "directoriesLoaded" }] : []));
    docTitle = '';
    description = '';
    nature = null;
    subjects = [];
    coverage = null;
    naturePanelSearch = '';
    subjectsPanelSearch = '';
    coveragePanelSearch = '';
    expires = null;
    expiresRawText = '';
    expiresErrorMatcher = createExpiresErrorStateMatcher(() => this.showExpiresError());
    noteFormat = 'text/html';
    importDocType = signal('', ...(ngDevMode ? [{ debugName: "importDocType" }] : []));
    importEntries = signal([], ...(ngDevMode ? [{ debugName: "importEntries" }] : []));
    importFileIndex = signal(0, ...(ngDevMode ? [{ debugName: "importFileIndex" }] : []));
    mainFile = signal(null, ...(ngDevMode ? [{ debugName: "mainFile" }] : []));
    mainFileUploading = signal(false, ...(ngDevMode ? [{ debugName: "mainFileUploading" }] : []));
    mainFileUploadComplete = signal(false, ...(ngDevMode ? [{ debugName: "mainFileUploadComplete" }] : []));
    mainFileUploadPercent = signal(0, ...(ngDevMode ? [{ debugName: "mainFileUploadPercent" }] : []));
    dragOverContent = signal(false, ...(ngDevMode ? [{ debugName: "dragOverContent" }] : []));
    /**
     * The import tab's files: chosen, then each one's progress and outcome while they upload. What is
     * still pending in it is what Create uploads.
     */
    uploads = new NxsUploadQueue();
    csvFile = signal(null, ...(ngDevMode ? [{ debugName: "csvFile" }] : []));
    csvSendReport = signal(false, ...(ngDevMode ? [{ debugName: "csvSendReport" }] : []));
    csvDocumentMode = signal(false, ...(ngDevMode ? [{ debugName: "csvDocumentMode" }] : []));
    busy = signal(false, ...(ngDevMode ? [{ debugName: "busy" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    contentError = signal(null, ...(ngDevMode ? [{ debugName: "contentError" }] : []));
    importError = signal(null, ...(ngDevMode ? [{ debugName: "importError" }] : []));
    uploadProgress = signal(null, ...(ngDevMode ? [{ debugName: "uploadProgress" }] : []));
    successMessage = signal(null, ...(ngDevMode ? [{ debugName: "successMessage" }] : []));
    dragOverCsv = signal(false, ...(ngDevMode ? [{ debugName: "dragOverCsv" }] : []));
    hasContentField = computed(() => {
        const type = this.selectedDocType()?.type;
        return type ? isBlobHoldingDocType(type) : false;
    }, ...(ngDevMode ? [{ debugName: "hasContentField" }] : []));
    createMissingMainFile = computed(() => {
        const type = this.selectedDocType()?.type;
        return type ? isBlobHoldingDocType(type) && !this.mainFile() : false;
    }, ...(ngDevMode ? [{ debugName: "createMissingMainFile" }] : []));
    mainFileUploadPending = computed(() => {
        const type = this.selectedDocType()?.type;
        if (!type || !isBlobHoldingDocType(type))
            return false;
        const file = this.mainFile();
        if (!file)
            return false;
        return this.mainFileUploading() || !this.mainFileUploadComplete();
    }, ...(ngDevMode ? [{ debugName: "mainFileUploadPending" }] : []));
    isNoteType = computed(() => this.selectedDocType()?.type === 'Note', ...(ngDevMode ? [{ debugName: "isNoteType" }] : []));
    importBlobTypeOptions = computed(() => this.creatableTypes().filter((dt) => isBlobHoldingDocType(dt.type)), ...(ngDevMode ? [{ debugName: "importBlobTypeOptions" }] : []));
    importBlobTypeNames = computed(() => this.importBlobTypeOptions().map((dt) => dt.type), ...(ngDevMode ? [{ debugName: "importBlobTypeNames" }] : []));
    /** Dublin Core metadata fields for blob-holding import types (File, Picture, Audio, Video). */
    showImportBlobMetadataFields = computed(() => {
        const type = this.importDocType();
        return !!type && isBlobHoldingDocType(type);
    }, ...(ngDevMode ? [{ debugName: "showImportBlobMetadataFields" }] : []));
    canEditImportPrevious = computed(() => this.importFileIndex() > 0, ...(ngDevMode ? [{ debugName: "canEditImportPrevious" }] : []));
    canEditImportNext = computed(() => this.importFileIndex() < this.importEntries().length - 1, ...(ngDevMode ? [{ debugName: "canEditImportNext" }] : []));
    hasCheckedImportFiles = computed(() => this.importEntries().some((entry) => entry.checked), ...(ngDevMode ? [{ debugName: "hasCheckedImportFiles" }] : []));
    canCreateImportWithProperties = computed(() => this.isImportBatchReadyToCreate(), ...(ngDevMode ? [{ debugName: "canCreateImportWithProperties" }] : []));
    currentImportFileLabel = computed(() => {
        const entry = this.importEntries()[this.importFileIndex()];
        return entry?.file.name ?? '';
    }, ...(ngDevMode ? [{ debugName: "currentImportFileLabel" }] : []));
    locationRestricted = computed(() => isRestrictedImportParentPath(this.parentPath()) ||
        isDomainParentType(this.parentFolderType()), ...(ngDevMode ? [{ debugName: "locationRestricted" }] : []));
    importRestricted = computed(() => this.locationRestricted() || isRepositoryRootPath(this.parentPath()), ...(ngDevMode ? [{ debugName: "importRestricted" }] : []));
    /** CSV import matches Nuxeo Web UI: allowed at repository root, blocked on domain containers. */
    csvImportRestricted = computed(() => this.locationRestricted(), ...(ngDevMode ? [{ debugName: "csvImportRestricted" }] : []));
    isAtRepositoryRoot = computed(() => isRepositoryRootPath(this.parentPath()), ...(ngDevMode ? [{ debugName: "isAtRepositoryRoot" }] : []));
    importLocationHint = computed(() => {
        if (isDomainParentType(this.parentFolderType())) {
            return DOMAIN_CONTAINER_GUIDANCE_KEY;
        }
        return RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY;
    }, ...(ngDevMode ? [{ debugName: "importLocationHint" }] : []));
    ngOnInit() {
        this.loadDirectories();
        const p = this.data.parentPath;
        if (p && p.trim()) {
            this.parentPath.set(this.normalizePath(p));
            this.syncLocationInputFromPath();
        }
        else {
            this.resolvingPath.set(true);
            this.importService
                .getDefaultImportParentPath()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (path) => {
                    this.parentPath.set(this.normalizePath(path));
                    this.syncLocationInputFromPath();
                    this.resolvingPath.set(false);
                },
                error: () => {
                    this.pathError.set(this.translate.instant('browse.message.could-not-resolve-a-default-folder-open'));
                    this.resolvingPath.set(false);
                },
            });
        }
    }
    loadDirectories() {
        forkJoin({
            nature: this.directoryService.getEntries('nature'),
            subjects: this.directoryService.getAllL10nEntries('l10nsubjects'),
            coverage: this.directoryService.getAllL10nEntries('l10ncoverage'),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ nature, subjects, coverage }) => {
                this.natureEntries.set(nature);
                this.subjectEntries.set(subjects);
                this.coverageEntries.set(coverage);
                this.directoriesLoaded.set(true);
            },
            error: () => {
                this.directoriesLoaded.set(true);
            },
        });
    }
    loadFolderContext(path) {
        const requestId = this.folderContextRequestId + 1;
        this.folderContextRequestId = requestId;
        this.loadingContext.set(true);
        this.typesLoadError.set(null);
        this.browse
            .getFolderContext(path)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => {
                if (requestId !== this.folderContextRequestId) {
                    return;
                }
                this.parentFolderType.set(doc.type);
                this.creatableTypes.set(toDocTypeDefs(resolveCreatableSubtypes(doc), (key) => this.translate.instant(key)));
                this.loadingContext.set(false);
            },
            error: () => {
                if (requestId !== this.folderContextRequestId) {
                    return;
                }
                this.parentFolderType.set(null);
                this.creatableTypes.set([]);
                this.typesLoadError.set(this.translate.instant('browse.create-import.types-load-failed'));
                this.loadingContext.set(false);
            },
        });
    }
    loadLocationSuggestions(path) {
        const requestId = this.locationSuggestionsRequestId + 1;
        this.locationSuggestionsRequestId = requestId;
        this.loadingLocationSuggestions.set(true);
        this.browse
            .getChildren(path, 50, 0)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (list) => {
                if (requestId !== this.locationSuggestionsRequestId) {
                    return;
                }
                const folders = (list.entries ?? []).filter((d) => isFolderishDocument(d));
                this.locationSuggestions.set(folders.map((f) => ({
                    path: this.normalizePath(f.path ?? path),
                    title: f.title ?? f.path?.split('/').pop() ?? '',
                })));
                this.locationHighlightIndex.set(folders.length > 0 ? 0 : -1);
                this.loadingLocationSuggestions.set(false);
            },
            error: () => {
                if (requestId !== this.locationSuggestionsRequestId) {
                    return;
                }
                this.locationSuggestions.set([]);
                this.locationHighlightIndex.set(-1);
                this.loadingLocationSuggestions.set(false);
            },
        });
    }
    normalizePath(path) {
        const trimmed = path.trim();
        if (!trimmed)
            return '/';
        const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return withLeading.replace(/\/+$/, '') || '/';
    }
    syncLocationInputFromPath() {
        const path = this.parentPath();
        if (path) {
            this.locationInput = this.normalizePath(path);
        }
    }
    commitLocationInput() {
        const raw = this.locationInput.trim();
        if (!raw)
            return;
        const normalized = this.normalizePath(raw);
        this.parentPath.set(normalized);
        this.locationInput = normalized;
        this.locationDropdownOpen.set(false);
        this.locationHighlightIndex.set(-1);
    }
    onLocationFocus() {
        if (this.locationInput.endsWith('/')) {
            this.locationDropdownOpen.set(true);
            this.loadLocationSuggestions(this.pathForLocationSuggestions());
        }
    }
    /** Show child folders when the input ends with `/`. */
    onLocationInput() {
        if (!this.locationInput.endsWith('/')) {
            this.locationDropdownOpen.set(false);
            this.locationHighlightIndex.set(-1);
            return;
        }
        this.locationDropdownOpen.set(true);
        this.loadLocationSuggestions(this.pathForLocationSuggestions());
    }
    onLocationKeydown(event) {
        const suggestions = this.locationSuggestions();
        const navigable = this.isLocationDropdownNavigable();
        switch (event.key) {
            case 'ArrowDown':
                if (!navigable) {
                    if (this.locationInput.endsWith('/')) {
                        this.locationDropdownOpen.set(true);
                        this.loadLocationSuggestions(this.pathForLocationSuggestions());
                    }
                    return;
                }
                event.preventDefault();
                this.locationHighlightIndex.update((i) => (i < suggestions.length - 1 ? i + 1 : 0));
                this.scrollLocationHighlightIntoView();
                break;
            case 'ArrowUp':
                if (!navigable)
                    return;
                event.preventDefault();
                this.locationHighlightIndex.update((i) => (i > 0 ? i - 1 : suggestions.length - 1));
                this.scrollLocationHighlightIntoView();
                break;
            case 'Enter':
                event.preventDefault();
                if (navigable) {
                    const idx = this.locationHighlightIndex();
                    if (idx >= 0 && idx < suggestions.length) {
                        this.selectLocationSuggestion(suggestions[idx].path);
                        return;
                    }
                }
                this.commitLocationInput();
                break;
            case 'Escape':
                if (this.locationDropdownOpen()) {
                    event.preventDefault();
                    this.locationDropdownOpen.set(false);
                    this.locationHighlightIndex.set(-1);
                }
                break;
        }
    }
    isLocationDropdownNavigable() {
        return (this.locationDropdownOpen() &&
            !this.loadingLocationSuggestions() &&
            this.locationSuggestions().length > 0);
    }
    scrollLocationHighlightIntoView() {
        setTimeout(() => {
            document.querySelector('.location-option--active')?.scrollIntoView({ block: 'nearest' });
        });
    }
    pathForLocationSuggestions() {
        const raw = this.locationInput.trim();
        if (raw.endsWith('/')) {
            return this.normalizePath(raw);
        }
        return this.parentPath() ?? '/';
    }
    onLocationBlur() {
        setTimeout(() => {
            this.locationDropdownOpen.set(false);
            this.commitLocationInput();
        }, 150);
    }
    selectLocationSuggestion(path) {
        const normalized = this.normalizePath(path);
        this.parentPath.set(normalized);
        this.locationInput = normalized;
        this.locationDropdownOpen.set(false);
        this.locationHighlightIndex.set(-1);
    }
    setActiveTab(tab) {
        if (this.view() === 'templateForm' || this.view() === 'importProperties') {
            this.resetFormState();
            this.resetImportPropertiesState();
            this.view.set('main');
        }
        this.activeTab.set(tab);
        this.error.set(null);
        this.importError.set(null);
        if (tab === 'import') {
            this.csvFile.set(null);
            this.dragOverCsv.set(false);
        }
        else if (tab === 'csv') {
            this.uploads.clear();
        }
        else if (tab === 'create') {
            this.csvFile.set(null);
            this.uploads.clear();
        }
    }
    startCreateFromType(docType) {
        if (this.locationRestricted())
            return;
        this.resetFormState();
        this.selectedDocType.set(docType);
        this.error.set(null);
        this.contentError.set(null);
        this.view.set('templateForm');
    }
    resetFormState() {
        this.selectedDocType.set(null);
        this.docTitle = '';
        this.description = '';
        this.nature = null;
        this.subjects = [];
        this.coverage = null;
        this.naturePanelSearch = '';
        this.subjectsPanelSearch = '';
        this.coveragePanelSearch = '';
        this.expires = null;
        this.expiresRawText = '';
        this.noteFormat = 'text/html';
        this.mainFile.set(null);
        this.mainFileUploading.set(false);
        this.mainFileUploadComplete.set(false);
        this.mainFileUploadPercent.set(0);
        this.mainFileBatchId = null;
        this.mainFileUploadRequestId++;
        this.dragOverContent.set(false);
        this.contentError.set(null);
        this.uploadProgress.set(null);
    }
    isExpiresValid() {
        return this.isExpiresStateValid(this.expiresRawText, this.expires);
    }
    /**
     * One Expires check for the live form and for an entry's saved state alike.
     *
     * Next saves the form without validating it, so `isImportFormComplete()` alone only ever
     * described the file on screen: an invalid expiry typed on file 1 was serialized as
     * `dc:expired: null` and sent when the batch was submitted from file 3.
     */
    isExpiresStateValid(expiresRawText, expires) {
        const parsed = expiresRawText.trim()
            ? this.dateAdapter.parse(expiresRawText, this.dateFormats.parse.dateInput)
            : expires;
        return isExpiresFieldValid(expiresRawText, parsed);
    }
    showExpiresError() {
        return !this.isExpiresValid();
    }
    /** Type selected and required Dublin Core fields are valid on the current form. */
    isImportFormComplete() {
        return this.showImportBlobMetadataFields() && !!this.docTitle.trim() && this.isExpiresValid();
    }
    /** Checked batch is ready for Create (form complete and on last file or all checked visited). */
    isImportBatchReadyToCreate() {
        if (!this.hasCheckedImportFiles() || !this.isImportFormComplete()) {
            return false;
        }
        const entries = this.importEntries();
        const onLast = this.importFileIndex() >= entries.length - 1;
        const allCheckedVisited = entries
            .filter((entry) => entry.checked)
            .every((entry) => entry.visited);
        if (!onLast && !allCheckedVisited)
            return false;
        // The entry on screen is covered by `isImportFormComplete()` above; its own saved state is
        // a navigation behind. Every other checked entry is judged on what Next stored for it.
        const current = this.importFileIndex();
        return entries.every((entry, index) => !entry.checked ||
            index === current ||
            this.isExpiresStateValid(entry.state.expiresRawText, entry.state.expires));
    }
    /** Apply To All is only available on the first file while metadata is still being configured. */
    canApplyImportToAll() {
        if (!this.hasCheckedImportFiles())
            return false;
        if (this.importEntries().length <= 1)
            return false;
        if (this.importFileIndex() !== 0)
            return false;
        return !this.isImportBatchReadyToCreate();
    }
    onExpiresInput(event) {
        this.expiresRawText = event.target.value;
        // Parse synchronously so validation and the saved payload agree even before ngModel updates.
        this.expires = this.dateAdapter.parse(this.expiresRawText.trim(), this.dateFormats.parse.dateInput);
        const ctrl = this.expiresNgModel?.control;
        if (ctrl) {
            ctrl.markAsDirty();
            ctrl.markAsTouched();
            ctrl.updateValueAndValidity({ emitEvent: false });
        }
    }
    onExpiresChange(value) {
        this.expires = value;
        if (value && !Number.isNaN(value.getTime())) {
            this.expiresRawText = '';
        }
    }
    uploadProgressLabel(progress) {
        if (progress.phase === 'creating') {
            return this.translate.instant('browse.message.creating-document');
        }
        if (progress.fileCount && progress.fileCount > 1 && progress.fileIndex !== undefined) {
            return this.translate.instant('browse.message.uploading-file-of', {
                index: progress.fileIndex + 1,
                count: progress.fileCount,
            });
        }
        return this.translate.instant('browse.message.uploading');
    }
    formatFileSize(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0)
            return '';
        if (bytes < 1024)
            return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024)
            return `${kb.toFixed(2)} KB`;
        const mb = kb / 1024;
        if (mb < 1024)
            return `${mb.toFixed(2)} MB`;
        return `${(mb / 1024).toFixed(2)} GB`;
    }
    subjectPillLabel(id) {
        const entry = this.subjectEntries().find((e) => e.id === id);
        if (!entry)
            return id;
        const label = entry.properties.label_en ?? id;
        const parentId = entry.properties.parent;
        if (!parentId || label.includes('/'))
            return label;
        const parent = this.subjectEntries().find((e) => e.id === parentId);
        const parentLabel = parent?.properties.label_en ?? parentId;
        return `${parentLabel}/${label}`;
    }
    naturePillLabel(id) {
        const entry = this.natureEntries().find((e) => e.id === id);
        return entry ? directoryPickerLabel(entry) : id;
    }
    coveragePillLabel(id) {
        const entry = this.coverageEntries().find((e) => e.id === id);
        if (!entry)
            return id;
        const label = entry.properties.label_en ?? id;
        const parentId = entry.properties.parent;
        if (!parentId || label.includes('/'))
            return label;
        const parent = this.coverageEntries().find((e) => e.id === parentId);
        const parentLabel = parent?.properties.label_en ?? parentId;
        return `${parentLabel}/${label}`;
    }
    clearNature() {
        this.nature = null;
    }
    clearCoverage() {
        this.coverage = null;
    }
    onEscapeKey() {
        if (this.locationDropdownOpen()) {
            this.locationDropdownOpen.set(false);
            this.locationHighlightIndex.set(-1);
        }
    }
    onNaturePanelOpen(opened) {
        if (opened) {
            this.naturePanelSearch = '';
            this.loadNatureEntries();
        }
    }
    loadNatureEntries() {
        this.directoryService
            .getEntries('nature')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.natureEntries.set(entries),
        });
    }
    onSubjectsPanelOpen(opened) {
        if (opened) {
            this.subjectsPanelSearch = '';
            this.loadL10nEntries('l10nsubjects', this.subjectEntries);
        }
    }
    onCoveragePanelOpen(opened) {
        if (opened) {
            this.coveragePanelSearch = '';
            this.loadL10nEntries('l10ncoverage', this.coverageEntries);
        }
    }
    loadL10nEntries(directoryName, target) {
        this.directoryService
            .getAllL10nEntries(directoryName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => target.set(entries),
        });
    }
    filteredNatureOptions() {
        return filterDirectoryPickerEntries(this.natureEntries(), this.naturePanelSearch);
    }
    groupedSubjectOptions() {
        return this.groupL10nEntries(this.subjectEntries(), this.subjectsPanelSearch);
    }
    groupedCoverageOptions() {
        return this.groupL10nEntries(this.coverageEntries(), this.coveragePanelSearch);
    }
    coverageDisplayLabel() {
        return formatHierarchicalL10nLabel(this.coverage, this.coverageEntries());
    }
    groupL10nEntries(entries, query) {
        if (!entries.length)
            return [];
        const parentLabels = new Map(entries.map((e) => [e.id, e.properties.label_en ?? e.id]));
        const q = query.trim().toLowerCase();
        const filtered = entries.filter((e) => {
            if (e.properties.obsolete)
                return false;
            if (!e.properties.parent)
                return false;
            if (!q)
                return true;
            const label = (e.properties.label_en ?? e.id).toLowerCase();
            const parentLabel = (parentLabels.get(e.properties.parent) ?? '').toLowerCase();
            return label.includes(q) || e.id.toLowerCase().includes(q) || parentLabel.includes(q);
        });
        const groups = new Map();
        for (const entry of filtered) {
            const parent = entry.properties.parent;
            const list = groups.get(parent) ?? [];
            list.push(entry);
            groups.set(parent, list);
        }
        return [...groups.entries()]
            .map(([parentId, groupEntries]) => ({
            parentLabel: parentLabels.get(parentId) ?? parentId,
            entries: groupEntries.sort((a, b) => (a.properties.ordering ?? 0) - (b.properties.ordering ?? 0)),
        }))
            .sort((a, b) => a.parentLabel.localeCompare(b.parentLabel));
    }
    addSubject(id) {
        if (!id || this.subjects.includes(id))
            return;
        this.subjects = [...this.subjects, id];
    }
    removeSubject(id) {
        this.subjects = this.subjects.filter((v) => v !== id);
    }
    goMain() {
        this.resetFormState();
        this.resetImportPropertiesState();
        this.view.set('main');
        this.error.set(null);
        this.contentError.set(null);
    }
    startImportProperties() {
        if (this.importRestricted())
            return;
        const files = this.uploads.pending();
        if (files.length === 0)
            return;
        const allowedTypes = this.importBlobTypeNames();
        const entries = files.map((file) => ({
            file,
            checked: true,
            docType: resolveImportBlobDocType(file, allowedTypes),
            visited: false,
            state: defaultImportPropertiesState(file),
        }));
        this.importEntries.set(entries);
        this.importFileIndex.set(0);
        this.error.set(null);
        this.importError.set(null);
        this.loadImportEntryToForm(0);
        this.view.set('importProperties');
    }
    toggleImportFileChecked(index, checked) {
        this.importEntries.update((entries) => entries.map((entry, i) => (i === index ? { ...entry, checked } : entry)));
    }
    selectImportFile(index) {
        if (index === this.importFileIndex())
            return;
        this.saveImportFormToCurrentEntry();
        this.importFileIndex.set(index);
        this.loadImportEntryToForm(index);
    }
    editImportPrevious() {
        if (!this.canEditImportPrevious())
            return;
        this.saveImportFormToCurrentEntry();
        const nextIndex = this.importFileIndex() - 1;
        this.importFileIndex.set(nextIndex);
        this.loadImportEntryToForm(nextIndex);
    }
    editImportNext() {
        if (!this.canEditImportNext())
            return;
        this.saveImportFormToCurrentEntry();
        const nextIndex = this.importFileIndex() + 1;
        this.importFileIndex.set(nextIndex);
        this.loadImportEntryToForm(nextIndex);
    }
    applyImportToAll() {
        if (!this.canApplyImportToAll())
            return;
        this.saveImportFormToCurrentEntry();
        const template = cloneImportPropertiesState(this.readImportFormState());
        const docType = this.importDocType();
        this.importEntries.update((entries) => entries.map((entry, index) => entry.checked
            ? {
                ...entry,
                docType: docType || entry.docType,
                visited: true,
                state: applyImportPropertiesTemplate(template, entry.file, index === 0),
            }
            : entry));
        const lastIndex = this.importEntries().length - 1;
        this.importFileIndex.set(lastIndex);
        this.loadImportEntryToForm(lastIndex);
    }
    runImportWithProperties() {
        this.commitLocationInput();
        if (this.importRestricted())
            return;
        if (!this.canCreateImportWithProperties())
            return;
        const path = this.parentPath();
        if (!path)
            return;
        this.saveImportFormToCurrentEntry();
        const apiEntries = this.importEntries()
            .filter((entry) => entry.checked)
            .map((entry) => ({
            file: entry.file,
            docType: entry.docType,
            properties: this.buildPropertiesFromImportState(entry.state),
        }));
        if (apiEntries.length === 0)
            return;
        this.busy.set(true);
        this.error.set(null);
        this.importError.set(null);
        this.uploadProgress.set(null);
        this.importService
            .importFilesWithProperties(path, apiEntries, {
            onProgress: (progress) => this.uploadProgress.set(progress),
        })
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            this.busy.set(false);
            this.uploadProgress.set(null);
        }))
            .subscribe({
            next: (docs) => {
                this.toast.show(this.translate.instant(docs.length === 1
                    ? 'common.count.created-document-one'
                    : 'common.count.created-document-many', { count: docs.length }));
                this.dialogRef.close({
                    refreshed: true,
                    path,
                    navigateToUid: docs.length === 1 ? docs[0].uid : undefined,
                });
            },
            error: (err) => {
                this.importError.set(err?.error?.message ??
                    err?.message ??
                    this.translate.instant('admin.message.create-failed'));
            },
        });
    }
    resetImportPropertiesState() {
        this.importEntries.set([]);
        this.importFileIndex.set(0);
        this.importDocType.set('');
    }
    readImportFormState() {
        return {
            title: this.docTitle,
            description: this.description,
            nature: this.nature,
            subjects: [...this.subjects],
            coverage: this.coverage,
            expires: this.expires,
            expiresRawText: this.expiresRawText,
        };
    }
    saveImportFormToCurrentEntry() {
        const index = this.importFileIndex();
        const state = this.readImportFormState();
        this.importEntries.update((entries) => {
            if (!entries[index])
                return entries;
            const next = [...entries];
            next[index] = {
                ...next[index],
                docType: this.importDocType() || next[index].docType,
                visited: true,
                state,
            };
            return next;
        });
    }
    loadImportEntryToForm(index) {
        const entry = this.importEntries()[index];
        if (!entry)
            return;
        this.importDocType.set(entry.docType);
        this.docTitle = entry.state.title;
        this.description = entry.state.description;
        this.nature = entry.state.nature;
        this.subjects = [...entry.state.subjects];
        this.coverage = entry.state.coverage;
        this.expires = entry.state.expires;
        this.expiresRawText = entry.state.expiresRawText;
        this.naturePanelSearch = '';
        this.subjectsPanelSearch = '';
        this.coveragePanelSearch = '';
    }
    buildPropertiesFromImportState(state) {
        return {
            'dc:title': state.title.trim(),
            'dc:description': state.description.trim() || null,
            'dc:nature': state.nature || null,
            'dc:subjects': [...state.subjects],
            'dc:coverage': state.coverage || null,
            'dc:expired': state.expires && !Number.isNaN(state.expires.getTime())
                ? state.expires.toISOString()
                : null,
        };
    }
    buildDocumentProperties(title) {
        const docType = this.selectedDocType();
        const props = {
            'dc:title': title,
            'dc:description': this.description.trim() || null,
            'dc:nature': this.nature || null,
            'dc:subjects': this.subjects,
            'dc:coverage': this.coverage || null,
            'dc:expired': this.expires && !Number.isNaN(this.expires.getTime()) ? this.expires.toISOString() : null,
        };
        if (docType?.type === 'Note') {
            props['note:note'] = defaultNoteContent(this.noteFormat);
            props['note:mime_type'] = this.noteFormat;
        }
        return props;
    }
    createDocument() {
        this.commitLocationInput();
        if (this.locationRestricted())
            return;
        const path = this.parentPath();
        const docType = this.selectedDocType();
        if (!path || !docType || !this.docTitle.trim())
            return;
        if (!this.isExpiresValid())
            return;
        const title = this.docTitle.trim();
        const name = sanitizeDocumentName(title);
        const properties = this.buildDocumentProperties(title);
        const mainFile = this.mainFile();
        const hasBlob = isBlobHoldingDocType(docType.type);
        if (hasBlob && !mainFile) {
            this.contentError.set(this.translate.instant('browse.message.a-file-is-required-for-this-document'));
            return;
        }
        if (hasBlob && mainFile && this.mainFileUploadPending()) {
            this.contentError.set(this.translate.instant('browse.message.please-wait-for-the-file-upload-to'));
            return;
        }
        this.busy.set(true);
        this.error.set(null);
        this.contentError.set(null);
        const create$ = mainFile && hasBlob
            ? this.importService.createBlobHoldingDocumentReliable(path, name, docType.type, properties, mainFile, this.mainFileBatchId && this.mainFileUploadComplete()
                ? { batchId: this.mainFileBatchId, fileIndex: 0 }
                : null, {
                onProgress: (progress) => this.uploadProgress.set(progress),
            })
            : this.importService.createChildDocument(path, name, docType.type, properties);
        create$
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            this.busy.set(false);
            if (!this.mainFileUploading()) {
                this.uploadProgress.set(null);
            }
        }))
            .subscribe({
            next: (doc) => this.finishCreateAndNavigate(doc, title, docType.type, !!mainFile),
            error: (err) => {
                const raw = err?.error?.message ?? err?.message;
                const message = raw === BLOB_NOT_ATTACHED_ERROR
                    ? this.translate.instant('browse.message.file-not-attached')
                    : (raw ?? this.translate.instant('browse.message.create-failed'));
                if (hasBlob && mainFile) {
                    this.contentError.set(message);
                }
                else {
                    this.error.set(message);
                }
            },
        });
    }
    finishCreateAndNavigate(doc, title, docTypeName, hadFile) {
        this.mainFile.set(null);
        if (!hadFile) {
            this.toast.show(this.translate.instant('browse.create-import-dialog.created-named', {
                type: docTypeName,
                title,
            }));
        }
        this.dialogRef.close({
            refreshed: true,
            path: this.parentPath(),
            navigateToUrl: documentNavigationUrl(doc, docTypeName),
            navigateToUid: isCollectionDocument(doc, docTypeName) || doc.type === 'Domain' ? undefined : doc.uid,
            navigateToPath: doc.type === 'Domain' ? doc.path : undefined,
            freshNote: docTypeName === 'Note',
        });
    }
    onMainFileInputChange(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (file) {
            this.stageMainFile(file);
        }
        input.value = '';
    }
    onContentDrop(ev) {
        ev.preventDefault();
        this.dragOverContent.set(false);
        const file = ev.dataTransfer?.files?.[0];
        if (file) {
            this.stageMainFile(file);
        }
    }
    onContentDragOver(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dragOverContent.set(true);
    }
    onContentDragLeave(ev) {
        ev.preventDefault();
        this.dragOverContent.set(false);
    }
    clearMainFile() {
        this.mainFileUploadRequestId++;
        this.mainFile.set(null);
        this.mainFileUploading.set(false);
        this.mainFileUploadComplete.set(false);
        this.mainFileUploadPercent.set(0);
        this.mainFileBatchId = null;
        this.contentError.set(null);
        if (this.mainFileInput?.nativeElement) {
            this.mainFileInput.nativeElement.value = '';
        }
    }
    stageMainFile(file) {
        const requestId = ++this.mainFileUploadRequestId;
        this.mainFile.set(file);
        this.mainFileUploading.set(true);
        this.mainFileUploadComplete.set(false);
        this.mainFileUploadPercent.set(0);
        this.mainFileBatchId = null;
        this.contentError.set(null);
        this.importService
            .stageFileInBatch(file, {
            onProgress: (percent) => {
                if (requestId !== this.mainFileUploadRequestId)
                    return;
                this.mainFileUploadPercent.set(percent);
            },
        })
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            if (requestId !== this.mainFileUploadRequestId)
                return;
            this.mainFileUploading.set(false);
        }))
            .subscribe({
            next: ({ batchId }) => {
                if (requestId !== this.mainFileUploadRequestId)
                    return;
                this.mainFileBatchId = batchId;
                this.mainFileUploadComplete.set(true);
                this.mainFileUploadPercent.set(100);
            },
            error: (err) => {
                if (requestId !== this.mainFileUploadRequestId)
                    return;
                this.mainFile.set(null);
                this.mainFileBatchId = null;
                this.mainFileUploadPercent.set(0);
                this.contentError.set(err?.error?.message ??
                    err?.message ??
                    this.translate.instant('browse.message.file-upload-failed'));
            },
        });
    }
    /** Files dropped on the import tab's zone, or chosen with its button. */
    stageImportFiles(files) {
        if (files.length === 0)
            return;
        this.uploads.stage(files);
        this.importError.set(null);
    }
    removeUploadAt(i) {
        const item = this.uploads.items()[i];
        if (item)
            this.uploads.remove(item.id);
    }
    onCsvInputChange(event) {
        const input = event.target;
        const file = input.files?.[0];
        input.value = '';
        if (!file)
            return;
        this.selectCsvFile(file);
    }
    onCsvDrop(ev) {
        ev.preventDefault();
        this.dragOverCsv.set(false);
        const file = ev.dataTransfer?.files?.[0];
        if (!file)
            return;
        this.selectCsvFile(file);
    }
    selectCsvFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.csvFile.set(null);
            this.error.set(this.translate.instant('browse.message.please-select-a-csv-file'));
            return;
        }
        this.csvFile.set(file);
        this.error.set(null);
    }
    onCsvDragOver(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dragOverCsv.set(true);
    }
    onCsvDragLeave(ev) {
        ev.preventDefault();
        this.dragOverCsv.set(false);
    }
    clearCsvFile() {
        this.csvFile.set(null);
    }
    /**
     * Uploads the pending files in one batch, each file followed in the queue. A failure keeps the
     * files already created, says which one was refused, and leaves it and the rest for another try.
     */
    runUpload() {
        this.commitLocationInput();
        if (this.importRestricted())
            return;
        const path = this.parentPath();
        const files = this.uploads.pending();
        if (!path || files.length === 0)
            return;
        this.busy.set(true);
        this.error.set(null);
        this.importError.set(null);
        this.uploadProgress.set(null);
        this.uploads.start();
        this.importService
            .importFiles(path, files, {
            onProgress: (progress) => {
                this.uploadProgress.set(progress);
                this.uploads.progress(progress);
            },
        })
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
            this.busy.set(false);
            this.uploadProgress.set(null);
        }))
            .subscribe({
            next: (docs) => {
                this.uploads.complete(docs);
                const created = this.uploads.done();
                this.toast.show(this.translate.instant(created.length === 1
                    ? 'common.count.created-file-one'
                    : 'common.count.created-file-many', { count: created.length }));
                this.dialogRef.close({
                    refreshed: true,
                    path,
                    navigateToUid: created.length === 1 ? created[0].document?.uid : undefined,
                });
            },
            error: (err) => {
                this.uploads.fail(err);
                this.importError.set(err?.error?.message ??
                    err?.message ??
                    this.translate.instant('browse.message.upload-failed'));
            },
        });
    }
    runCsvImport() {
        this.commitLocationInput();
        if (this.csvImportRestricted())
            return;
        const path = this.parentPath();
        const file = this.csvFile();
        if (!path || !file)
            return;
        this.busy.set(true);
        this.error.set(null);
        this.importService
            .importCsvFile({
            path,
            file,
            sendReport: this.csvSendReport(),
            documentMode: this.csvDocumentMode(),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (report) => {
                this.busy.set(false);
                this.csvFile.set(null);
                const summary = summarizeCsvImportReport(report) ||
                    this.translate.instant('browse.message.csv-import-completed');
                this.successMessage.set(summary);
                this.view.set('success');
            },
            error: (err) => {
                this.busy.set(false);
                if (err?.status === 404) {
                    this.error.set(this.translate.instant('browse.message.csv-import-is-not-available-install-the'));
                    return;
                }
                this.error.set(err?.error?.message ??
                    err?.message ??
                    this.translate.instant('browse.message.csv-import-failed'));
            },
        });
    }
    /** Closes; after a partly failed upload the folder already holds the files created, so it refreshes. */
    close() {
        if (this.uploads.done().length > 0) {
            this.dialogRef.close({ refreshed: true, path: this.parentPath() });
            return;
        }
        this.dialogRef.close();
    }
    doneNavigateBrowse() {
        const p = this.parentPath();
        this.dialogRef.close({ refreshed: true, path: p });
    }
    static ɵfac = function CreateImportDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CreateImportDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CreateImportDialogComponent, selectors: [["lib-create-import-dialog"]], viewQuery: function CreateImportDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
            i0.ɵɵviewQuery(_c1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.mainFileInput = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.expiresNgModel = _t.first);
        } }, hostBindings: function CreateImportDialogComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function CreateImportDialogComponent_keydown_escape_HostBindingHandler() { return ctx.onEscapeKey(); }, i0.ɵɵresolveDocument);
        } }, features: [i0.ɵɵProvidersFeature([provideTranslatedDatepickerIntl(), provideSatoriDateAdapter(), provideNxsToast()])], decls: 7, vars: 11, consts: [["csvInput", ""], ["natureSelect", ""], ["coverageSelect", ""], ["expiresInput", "ngModel"], ["expiresPicker", ""], ["mainFileInput", ""], ["importNatureSelect", ""], ["importCoverageSelect", ""], ["importExpiresPicker", ""], [1, "create-import-root"], ["role", "tablist", 1, "tab-header"], [1, "dialog-body"], [1, "state-row"], [1, "error-text"], ["align", "start", 1, "dialog-footer"], ["type", "button", "role", "tab", 1, "tab-btn", 3, "click"], ["diameter", "32", 3, "label"], [1, "import-properties-layout"], ["role", "status", "aria-live", "polite", 1, "success-panel"], [1, "location-bar"], [1, "location-label"], [1, "location-input-wrap"], ["type", "text", 1, "location-input", 3, "ngModelChange", "focus", "input", "blur", "keydown", "ngModel", "disabled"], ["role", "alert", 1, "location-hint"], [1, "location-dropdown", "location-dropdown--loading"], ["role", "listbox", 1, "location-dropdown"], ["diameter", "20", 3, "label"], ["role", "presentation"], ["type", "button", "role", "option", 1, "location-option", 3, "mousedown", "click"], ["aria-hidden", "true", 1, "location-hint-bar"], [1, "state-row", "state-row--compact"], [1, "error-text", "types-error"], [1, "empty-hint"], ["role", "list", 1, "doctype-grid"], ["diameter", "24", 3, "label"], ["type", "button", "role", "listitem", 1, "doctype-tile", 3, "disabled"], ["type", "button", "role", "listitem", 1, "doctype-tile", 3, "click", "disabled"], [1, "doctype-icon", 3, "type"], [1, "doctype-label"], [1, "import-tab-panel"], ["multiple", "", 1, "import-dropzone", 3, "files", "disabled", "label", "buttonLabel"], [1, "import-queue", 3, "remove", "retry", "items", "label"], ["role", "alert", 1, "error-text", "import-error", "import-error--staged"], ["role", "alert", 1, "error-text", "import-error"], ["role", "status", "aria-live", "polite", 1, "upload-progress", "upload-progress--import"], [1, "dropzone", "dropzone--csv", 3, "dragover", "dragleave", "drop"], ["type", "file", "accept", ".csv,text/csv", 3, "change", "disabled"], ["type", "button", 1, "dropzone-inner", 3, "click", "disabled"], [1, "dropzone-text"], [1, "file-list"], [1, "csv-options"], [3, "change", "checked", "disabled"], [1, "file-name"], ["mat-icon-button", "", "type", "button", 3, "click", "disabled"], [1, "upload-progress-label"], ["mode", "determinate", 3, "value"], [1, "type-form-header"], [1, "type-form-icon", 3, "type"], [1, "type-form-title"], [1, "create-form"], [1, "location-bar", "location-bar--form"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "full-width"], ["matInput", "", "required", "", 3, "ngModelChange", "ngModel"], ["matInput", "", 3, "ngModelChange", "ngModel"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "full-width", "vocab-field"], ["panelClass", "vocab-select-panel", 3, "ngModelChange", "openedChange", "selectionChange", "ngModel"], [1, "subjects-trigger-chips"], [1, "vocab-panel__search"], ["type", "text", 3, "ngModelChange", "click", "keydown", "placeholder", "ngModel", "ngModelOptions"], [1, "vocab-panel__list"], [3, "value"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "full-width", "vocab-field", "subjects-field"], ["multiple", "", "panelClass", "vocab-select-panel vocab-grouped-select-panel subjects-select-panel", 3, "ngModelChange", "openedChange", "ngModel"], [3, "label"], ["panelClass", "vocab-select-panel vocab-grouped-select-panel", 3, "ngModelChange", "openedChange", "selectionChange", "ngModel"], ["matInput", "", "name", "expires", 3, "ngModelChange", "input", "matDatepicker", "ngModel", "errorStateMatcher", "placeholder"], ["matIconSuffix", "", 3, "for"], [1, "field-label"], ["role", "alert", 1, "error-text", "content-required-hint"], [1, "content-dropzone", 3, "dragover", "dragleave", "drop"], ["type", "file", 3, "change", "disabled"], [1, "content-file-row"], ["type", "button", 1, "content-upload-btn"], [1, "content-file-info"], [1, "content-file-name"], ["mode", "determinate", 1, "content-file-progress", 3, "value"], [1, "content-file-progress-label"], ["type", "button", 1, "content-upload-btn", 3, "click"], [3, "ngModelChange", "ngModel"], [3, "removed"], ["type", "button", "matChipRemove", "", 3, "click"], [1, "import-properties-form"], [3, "ngModelChange", "ngModel", "disabled"], ["value", ""], [1, "import-detail-fields"], [1, "import-properties-sidebar"], [1, "import-sidebar-hint"], ["role", "list", 1, "import-file-list"], [1, "import-file-item", 3, "import-file-item--active"], ["matInput", "", "name", "importExpires", 3, "ngModelChange", "input", "matDatepicker", "ngModel", "errorStateMatcher", "placeholder"], [1, "import-file-item"], [3, "change", "checked", "disabled", "aria-label"], ["type", "button", 1, "import-file-select", 3, "click", "disabled"], [1, "import-file-name"], [1, "import-file-title"], ["aria-hidden", "true", 1, "import-file-done"], ["aria-hidden", "true", 1, "success-icon"], ["mat-dialog-title", "", 1, "success-heading"], [1, "success-message"], ["mat-stroked-button", "", "type", "button", 1, "btn-cancel", 3, "disabled"], [1, "footer-spacer"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "disabled"], ["mat-stroked-button", "", "type", "button", 1, "btn-cancel", 3, "click", "disabled"], ["mat-button", "", "type", "button", 3, "click"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click"], ["mat-stroked-button", "", "type", "button", 1, "btn-back", 3, "click", "disabled"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"], ["mat-stroked-button", "", "type", "button", 1, "btn-add-properties", 3, "click", "disabled"], [1, "import-footer-nav"], ["mat-button", "", "type", "button", 1, "btn-nav-link", 3, "click", "disabled"], ["aria-hidden", "true"]], template: function CreateImportDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 9);
            i0.ɵɵconditionalCreate(1, CreateImportDialogComponent_Conditional_1_Template, 11, 21, "div", 10);
            i0.ɵɵelementStart(2, "mat-dialog-content", 11);
            i0.ɵɵconditionalCreate(3, CreateImportDialogComponent_Conditional_3_Template, 6, 6, "div", 12)(4, CreateImportDialogComponent_Conditional_4_Template, 2, 1, "p", 13)(5, CreateImportDialogComponent_Conditional_5_Template, 6, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, CreateImportDialogComponent_Conditional_6_Template, 8, 2, "mat-dialog-actions", 14);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassProp("form-view", ctx.view() === "templateForm" || ctx.view() === "importProperties")("success-view", ctx.view() === "success");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.view() !== "success" ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("dialog-body--main", ctx.view() === "main")("dialog-body--form", ctx.view() === "templateForm" || ctx.view() === "importProperties");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.resolvingPath() ? 3 : ctx.pathError() ? 4 : 5);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.resolvingPath() && !ctx.pathError() ? 6 : -1);
        } }, dependencies: [NxsDocTypeIconComponent,
            NxsDropzoneComponent,
            NxsSpinnerComponent,
            NxsUploadQueueComponent,
            MatDialogModule, i1.MatDialogTitle, i1.MatDialogActions, i1.MatDialogContent, MatButtonModule, i2.MatButton, i2.MatIconButton, MatIconModule, i3.MatIcon, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatError, i4.MatSuffix, MatInputModule, i5.MatInput, MatSelectModule, i6.MatSelect, i6.MatSelectTrigger, i6.MatOption, i6.MatOptgroup, MatChipsModule, i7.MatChip, i7.MatChipRemove, i7.MatChipSet, MatDatepickerModule, i8.MatDatepicker, i8.MatDatepickerInput, i8.MatDatepickerToggle, MatProgressBarModule, i9.MatProgressBar, MatSlideToggleModule, i10.MatSlideToggle, MatCheckboxModule, i11.MatCheckbox, FormsModule, i12.DefaultValueAccessor, i12.NgControlStatus, i12.RequiredValidator, i12.NgModel, DateMaskPipe,
            TranslatePipe], styles: ["$primary-blue[_ngcontent-%COMP%]:   var(--mat-sys-primary, #0066ff)[_ngcontent-%COMP%];\n$tab-inactive[_ngcontent-%COMP%]:   var(--mat-sys-on-surface-variant, #6b7280)[_ngcontent-%COMP%];\n$location-bg[_ngcontent-%COMP%]:   var(--mat-sys-surface-container, #f3f4f6)[_ngcontent-%COMP%];\n$tile-bg[_ngcontent-%COMP%]:   var(--mat-sys-surface-container-low, #f5f6f8)[_ngcontent-%COMP%];\n$tile-hover[_ngcontent-%COMP%]:   var(--mat-sys-surface-container-high, #eef0f4)[_ngcontent-%COMP%];\n\n[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-width: min(95vw, 560px);\n  max-width: 95vw;\n  box-sizing: border-box;\n\n  &:has(.success-view) {\n    height: auto;\n    min-height: 0;\n    min-width: min(95vw, 440px);\n  }\n}\n\n.create-import-root[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1 1 auto;\n  min-height: 0;\n  height: 100%;\n\n  &.success-view {\n    flex: 0 0 auto;\n    min-height: 0;\n    height: auto;\n\n    .dialog-body {\n      flex: 0 0 auto;\n      min-height: 0;\n      max-height: none;\n      overflow: hidden;\n      padding: 0;\n    }\n\n    .dialog-footer {\n      border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n      justify-content: flex-end;\n      padding: 12px 24px 20px;\n    }\n  }\n}\n\n.dialog-body[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n  min-width: 280px;\n  min-height: 0;\n  max-width: 100%;\n  padding: 0;\n  box-sizing: border-box;\n  overflow: visible;\n}\n\n.dialog-body--main[_ngcontent-%COMP%], \n.dialog-body--form[_ngcontent-%COMP%] {\n  padding: 0;\n  min-height: 480px;\n  max-height: none;\n  overflow-y: auto;\n}\n\n.dialog-body--main[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n\n\n.tab-header[_ngcontent-%COMP%] {\n  display: flex;\n  flex-shrink: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n}\n\n.tab-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 16px 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.9375rem;\n  font-weight: 500;\n  color: $tab-inactive;\n  cursor: pointer;\n  position: relative;\n  transition: color 0.15s ease;\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  &--active {\n    color: $primary-blue;\n    font-weight: 600;\n\n    &::after {\n      content: '';\n      position: absolute;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      height: 3px;\n      background: $primary-blue;\n    }\n  }\n\n  &:focus-visible {\n    outline: 2px solid $primary-blue;\n    outline-offset: -2px;\n  }\n}\n\n\n\n.location-bar[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 16px 24px;\n  background: $location-bg;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n  &--restricted .location-input {\n    border-bottom-color: var(--mat-sys-outline, #9ca3af);\n  }\n}\n\n.location-hint[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  gap: 10px;\n  margin: 10px 0 0;\n  font-size: 0.8125rem;\n  line-height: 1.45;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.location-hint-bar[_ngcontent-%COMP%] {\n  width: 3px;\n  flex-shrink: 0;\n  background: var(--mat-sys-error, #b3261e);\n  border-radius: 1px;\n}\n\n.location-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  font-weight: 400;\n}\n\n.location-input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.location-dropdown[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  z-index: 10;\n  margin: 4px 0 0;\n  padding: 4px 0;\n  list-style: none;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  border-radius: 4px;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--mat-sys-on-surface, #1a1c1e) 10%, transparent);\n  max-height: 220px;\n  overflow-y: auto;\n\n  &--loading {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    padding: 12px 16px;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface-variant, #6b7280);\n  }\n}\n\n.location-option[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.875rem;\n  text-align: left;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible,\n  &--active {\n    background: var(--mat-sys-primary-container, #e8f0fe);\n    outline: none;\n  }\n}\n\n.location-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline, #9ca3af);\n  background: transparent;\n  padding: 4px 0 6px;\n  font: inherit;\n  font-size: 0.9375rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  box-sizing: border-box;\n\n  &:focus {\n    outline: none;\n    border-bottom-color: $primary-blue;\n    border-bottom-width: 2px;\n    padding-bottom: 5px;\n  }\n\n  &:disabled {\n    opacity: 0.6;\n    cursor: not-allowed;\n  }\n}\n\n\n\n.doctype-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(8, minmax(0, 1fr));\n  gap: 8px;\n  padding: 24px;\n\n  @media (max-width: 720px) {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  @media (max-width: 400px) {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n}\n\n.doctype-tile[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 16px 8px;\n  min-height: 96px;\n  border: none;\n  border-radius: 4px;\n  background: $tile-bg;\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover:not(:disabled) {\n    background: $tile-hover;\n  }\n\n  &:focus-visible {\n    outline: 2px solid $primary-blue;\n    outline-offset: 2px;\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n}\n\n.doctype-icon[_ngcontent-%COMP%] {\n  --nxs-icon-size: 32px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.doctype-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface, #374151);\n  text-align: center;\n  line-height: 1.3;\n}\n\n\n\n.import-tab-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1 1 auto;\n  min-height: 0;\n  padding-top: 24px;\n\n  .import-dropzone {\n    margin: 0 24px 16px;\n    min-height: 160px;\n  }\n\n  .import-queue {\n    margin: 0 24px 16px;\n  }\n\n  .import-error--staged {\n    margin: -8px 24px 16px;\n  }\n}\n\n\n\n.dropzone[_ngcontent-%COMP%] {\n  position: relative;\n  margin: 24px;\n  border: 2px dashed var(--mat-sys-outline-variant, #d1d5db);\n  border-radius: 4px;\n  background: $tile-bg;\n\n  .dropzone-file-input {\n    position: absolute;\n    width: 0;\n    height: 0;\n    opacity: 0;\n    overflow: hidden;\n    pointer-events: none;\n  }\n\n  &--import {\n    min-height: 320px;\n\n    &:not(.dropzone--filled) .dropzone-file-input {\n      inset: 0;\n      width: 100%;\n      height: 100%;\n      opacity: 0;\n      cursor: pointer;\n      pointer-events: auto;\n      z-index: 1;\n    }\n  }\n\n  &--filled {\n    min-height: 0;\n    padding: 16px;\n    background: var(--mat-sys-surface, #fff);\n  }\n\n  &--csv {\n    min-height: 320px;\n    margin-top: 0;\n    margin-bottom: 16px;\n\n    input[type='file'] {\n      position: absolute;\n      inset: 0;\n      opacity: 0;\n      cursor: pointer;\n      z-index: 1;\n    }\n  }\n\n  &--active {\n    border-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n\n  &--disabled {\n    opacity: 0.55;\n    pointer-events: none;\n  }\n}\n\n.dropzone-inner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  flex: 1 1 auto;\n  min-height: 320px;\n  padding: 48px 24px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font: inherit;\n}\n\n.dropzone-text[_ngcontent-%COMP%] {\n  font-size: 0.9375rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n  line-height: 1.5;\n}\n\n.import-error--staged[_ngcontent-%COMP%], \n.upload-progress--staged[_ngcontent-%COMP%] {\n  margin: 0 24px 16px;\n}\n\n.csv-options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  margin: 0 24px 24px;\n  padding-top: 4px;\n\n  mat-slide-toggle {\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n}\n\n\n\n.dialog-footer[_ngcontent-%COMP%] {\n  display: flex;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: flex-start;\n  align-self: stretch;\n  width: 100%;\n  box-sizing: border-box;\n  gap: 8px 12px;\n  padding: 16px 24px 20px;\n  margin: 0;\n\n  .footer-spacer {\n    flex: 1 1 auto;\n    min-width: 8px;\n  }\n\n  .btn-cancel {\n    border-color: $primary-blue;\n    color: $primary-blue;\n  }\n\n  .btn-back {\n    color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  }\n\n  .import-footer-nav {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 4px 8px;\n  }\n\n  .btn-nav-link {\n    color: $primary-blue;\n    min-width: 0;\n    padding: 0 8px;\n\n    &:disabled {\n      color: var(--mat-sys-on-surface-variant, #9ca3af);\n    }\n\n    mat-icon {\n      width: 18px;\n      height: 18px;\n      font-size: 18px;\n    }\n  }\n}\n\n\n\n.import-properties-layout[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  min-height: 480px;\n}\n\n.import-properties-form[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n  min-width: 0;\n  padding: 16px 24px 24px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n\n  .location-bar--form {\n    margin-bottom: 0;\n  }\n}\n\n.import-detail-fields[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n\n.import-properties-sidebar[_ngcontent-%COMP%] {\n  flex: 0 0 280px;\n  max-width: 36%;\n  border-left: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  padding: 16px;\n  background: var(--mat-sys-surface-container-lowest, #fafafa);\n  overflow-y: auto;\n}\n\n.import-sidebar-hint[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  font-size: 0.8125rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-file-list[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.import-file-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-bottom: 4px;\n  border-radius: 4px;\n  border-left: 3px solid transparent;\n\n  &--active {\n    border-left-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n}\n\n.import-file-select[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n  min-width: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  padding: 8px 4px;\n  cursor: pointer;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n\n  &:disabled {\n    cursor: not-allowed;\n    opacity: 0.6;\n  }\n}\n\n.import-file-name[_ngcontent-%COMP%] {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.875rem;\n}\n\n.import-file-title[_ngcontent-%COMP%] {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-file-done[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n  color: var(--mat-sys-tertiary, #0d904f);\n}\n\n.btn-add-properties[_ngcontent-%COMP%] {\n  border-color: $primary-blue;\n  color: $primary-blue;\n}\n\n.template-form-lead[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  font-size: 0.875rem;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.form-view[_ngcontent-%COMP%]   .dialog-body[_ngcontent-%COMP%] {\n  padding: 0;\n}\n\n.type-form-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 16px 24px 8px;\n}\n\n.type-form-icon[_ngcontent-%COMP%] {\n  --nxs-icon-size: 22px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.type-form-title[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.create-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 0 24px 24px;\n}\n\n.location-bar--form[_ngcontent-%COMP%] {\n  margin: 0 -24px 12px;\n  border-bottom: none;\n}\n\n.field-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  margin: 0 0 4px;\n}\n\n.content-dropzone[_ngcontent-%COMP%] {\n  position: relative;\n  min-height: 120px;\n  margin-bottom: 0;\n  border: 2px dashed var(--mat-sys-outline-variant, #d1d5db);\n  border-radius: 4px;\n  background: $tile-bg;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  input[type='file'] {\n    position: absolute;\n    inset: 0;\n    opacity: 0;\n    cursor: pointer;\n    z-index: 1;\n  }\n\n  &--active {\n    border-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n\n  &--filled {\n    padding: 12px 16px;\n    min-height: auto;\n\n    input[type='file'] {\n      display: none;\n    }\n  }\n\n  &--uploading {\n    border-color: $primary-blue;\n  }\n}\n\n.content-upload-btn[_ngcontent-%COMP%] {\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.9375rem;\n  font-weight: 500;\n  color: $primary-blue;\n  cursor: pointer;\n  padding: 24px;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.content-file-row[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 12px;\n  width: 100%;\n}\n\n.content-file-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.content-file-progress[_ngcontent-%COMP%] {\n  width: 100%;\n  border-radius: 2px;\n\n  &--complete {\n    ::ng-deep .mdc-linear-progress__bar-inner {\n      border-color: var(--mat-sys-primary, #0066ff);\n    }\n  }\n}\n\n.content-file-progress-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.content-file-name[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.875rem;\n}\n\n.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.vocab-field[_ngcontent-%COMP%] {\n  ::ng-deep .mat-mdc-select-trigger {\n    height: auto;\n    min-height: 24px;\n    overflow: visible;\n  }\n\n  .subjects-trigger-chips {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 4px;\n    width: 100%;\n    padding: 6px 8px 6px 12px;\n    box-sizing: border-box;\n  }\n\n  ::ng-deep .mat-mdc-chip-set .mdc-evolution-chip {\n    margin: 2px 4px 2px 0;\n  }\n}\n\n.expires-field-invalid[_ngcontent-%COMP%] {\n  ::ng-deep .mdc-notched-outline__leading,\n  ::ng-deep .mdc-notched-outline__notch,\n  ::ng-deep .mdc-notched-outline__trailing {\n    border-color: var(--mat-sys-error, #b3261e);\n  }\n}\n\n.vocab-dropdown-wrap[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n//   Mat-select   panels   render   in   a   CDK   overlay   outside   [_nghost-%COMP%]   \u2014[_ngcontent-%COMP%]   use[_ngcontent-%COMP%]   unscoped[_ngcontent-%COMP%]    .\n  .mat-mdc-select-panel.vocab-select-panel {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  max-height: 320px;\n  padding-top: 0;\n\n  .vocab-panel__search {\n    flex: 0 0 auto;\n    padding: 8px 12px;\n    background: var(--mat-sys-surface, #fff);\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n    input {\n      width: 100%;\n      box-sizing: border-box;\n      padding: 8px 12px;\n      border: 1px solid var(--mat-sys-outline-variant, #d1d5db);\n      border-radius: 4px;\n      font: inherit;\n      font-size: 0.875rem;\n      color: var(--mat-sys-on-surface, #1a1c1e);\n      background: var(--mat-sys-surface, #fff);\n\n      &:focus {\n        outline: none;\n        border-color: $primary-blue;\n      }\n    }\n  }\n\n  .vocab-panel__list {\n    flex: 1 1 auto;\n    min-height: 0;\n    overflow-x: hidden;\n    overflow-y: auto;\n  }\n}\n\n  .vocab-grouped-select-panel {\n  .mat-mdc-optgroup-label,\n  .mat-mdc-optgroup .mdc-list-group__subheader {\n    font-weight: 700;\n    font-size: 0.8125rem;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    background: var(--mat-sys-surface-container-lowest, #fafafa);\n    padding: 10px 16px 6px;\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #f0f0f0);\n    min-height: auto;\n    line-height: 1.4;\n  }\n}\n\n  .subjects-select-panel {\n  .mat-mdc-option {\n    .mat-pseudo-checkbox,\n    mat-pseudo-checkbox {\n      display: none;\n    }\n\n    .mdc-list-item__primary-text {\n      margin-left: 0;\n    }\n  }\n}\n\n.form-view[_ngcontent-%COMP%] {\n  .dialog-footer {\n    border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  }\n}\n\n.file-list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0 24px 16px;\n  padding: 0;\n  max-height: 160px;\n  overflow-y: auto;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n  li {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 12px;\n    padding: 8px 0;\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n    font-size: 0.875rem;\n  }\n}\n\n.file-name[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.state-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 24px;\n\n  &--compact {\n    padding: 16px 24px;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface-variant, #6b7280);\n  }\n}\n\n.error-text[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b3261e);\n  font-size: 13px;\n  margin: 0 24px 8px;\n  padding-top: 8px;\n}\n\n.success-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 36px 32px 28px;\n  text-align: center;\n  box-sizing: border-box;\n}\n\n.success-icon[_ngcontent-%COMP%] {\n  font-size: 56px;\n  width: 56px;\n  height: 56px;\n  color: $primary-blue;\n}\n\n.success-heading[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.success-message[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9375rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  max-width: 34ch;\n  word-break: break-word;\n}\n\n.detail-list[_ngcontent-%COMP%] {\n  font-size: 12px;\n  margin: 0 24px 12px;\n  padding-left: 18px;\n}\n\n.error-list[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error, #b3261e);\n}\n\n.subtle[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #888);\n  margin: 0 24px;\n}\n\n.empty-hint[_ngcontent-%COMP%] {\n  margin: 24px;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n}\n\n.types-error[_ngcontent-%COMP%] {\n  margin: 16px 24px;\n  padding-top: 0;\n}\n\n.upload-progress[_ngcontent-%COMP%] {\n  margin: 0 24px 12px;\n\n  &--import {\n    margin-top: 8px;\n  }\n}\n\n.upload-progress-label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 0.8125rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-error[_ngcontent-%COMP%] {\n  margin-top: 0;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CreateImportDialogComponent, [{
        type: Component,
        args: [{ selector: 'lib-create-import-dialog', standalone: true, imports: [
                    DateMaskPipe,
                    NxsDocTypeIconComponent,
                    NxsDropzoneComponent,
                    NxsSpinnerComponent,
                    NxsUploadQueueComponent,
                    TranslatePipe,
                    MatDialogModule,
                    MatButtonModule,
                    MatIconModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatSelectModule,
                    MatChipsModule,
                    MatDatepickerModule,
                    MatProgressBarModule,
                    MatSlideToggleModule,
                    MatCheckboxModule,
                    FormsModule,
                ], providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter(), provideNxsToast()], template: "<div\n  class=\"create-import-root\"\n  [class.form-view]=\"view() === 'templateForm' || view() === 'importProperties'\"\n  [class.success-view]=\"view() === 'success'\"\n>\n  @if (view() !== 'success') {\n    <div\n      class=\"tab-header\"\n      role=\"tablist\"\n      [attr.aria-label]=\"'browse.create-import-dialog.create-or-import' | translate\"\n    >\n      <button\n        type=\"button\"\n        role=\"tab\"\n        class=\"tab-btn\"\n        [class.tab-btn--active]=\"activeTab() === 'create'\"\n        [attr.aria-selected]=\"activeTab() === 'create'\"\n        (click)=\"setActiveTab('create')\"\n      >\n        {{ 'browse.create-import-dialog.create' | translate }}\n      </button>\n      <button\n        type=\"button\"\n        role=\"tab\"\n        class=\"tab-btn\"\n        [class.tab-btn--active]=\"activeTab() === 'import'\"\n        [attr.aria-selected]=\"activeTab() === 'import'\"\n        (click)=\"setActiveTab('import')\"\n      >\n        {{ 'browse.create-import-dialog.import' | translate }}\n      </button>\n      <button\n        type=\"button\"\n        role=\"tab\"\n        class=\"tab-btn\"\n        [class.tab-btn--active]=\"activeTab() === 'csv'\"\n        [attr.aria-selected]=\"activeTab() === 'csv'\"\n        (click)=\"setActiveTab('csv')\"\n      >\n        {{ 'browse.create-import-dialog.csv' | translate }}\n      </button>\n    </div>\n  }\n\n  <mat-dialog-content\n    class=\"dialog-body\"\n    [class.dialog-body--main]=\"view() === 'main'\"\n    [class.dialog-body--form]=\"view() === 'templateForm' || view() === 'importProperties'\"\n  >\n    @if (resolvingPath()) {\n      <div class=\"state-row\">\n        <nxs-spinner diameter=\"32\" [label]=\"'browse.create-import-dialog.loading' | translate\" />\n        <span>{{ 'browse.create-import-dialog.resolving-target-folder' | translate }}</span>\n      </div>\n    } @else if (pathError()) {\n      <p class=\"error-text\">{{ pathError() }}</p>\n    } @else {\n      @if (busy()) {\n        <div class=\"state-row\">\n          <nxs-spinner diameter=\"32\" [label]=\"'browse.create-import-dialog.loading' | translate\" />\n          <span>{{ 'browse.create-import-dialog.working' | translate }}</span>\n        </div>\n      }\n\n      @if (error()) {\n        <p class=\"error-text\">{{ error() }}</p>\n      }\n\n      @switch (view()) {\n        @case ('main') {\n          <div class=\"location-bar\" [class.location-bar--restricted]=\"locationRestricted()\">\n            <span class=\"location-label\">{{\n              'browse.create-import-dialog.location' | translate\n            }}</span>\n            <div class=\"location-input-wrap\">\n              <input\n                type=\"text\"\n                class=\"location-input\"\n                [(ngModel)]=\"locationInput\"\n                [attr.aria-label]=\"'browse.create-import-dialog.location' | translate\"\n                [disabled]=\"busy()\"\n                (focus)=\"onLocationFocus()\"\n                (input)=\"onLocationInput()\"\n                (blur)=\"onLocationBlur()\"\n                (keydown)=\"onLocationKeydown($event)\"\n              />\n              @if (locationDropdownOpen()) {\n                @if (loadingLocationSuggestions()) {\n                  <div class=\"location-dropdown location-dropdown--loading\">\n                    <nxs-spinner\n                      diameter=\"20\"\n                      [label]=\"'browse.create-import-dialog.loading' | translate\"\n                    />\n                    <span>{{ 'browse.create-import-dialog.loading-folders' | translate }}</span>\n                  </div>\n                } @else if (locationSuggestions().length > 0) {\n                  <ul\n                    class=\"location-dropdown\"\n                    role=\"listbox\"\n                    [attr.aria-label]=\"'browse.create-import-dialog.available-folders' | translate\"\n                  >\n                    @for (s of locationSuggestions(); track s.path; let i = $index) {\n                      <li role=\"presentation\">\n                        <button\n                          type=\"button\"\n                          class=\"location-option\"\n                          role=\"option\"\n                          [attr.aria-selected]=\"locationHighlightIndex() === i\"\n                          [class.location-option--active]=\"locationHighlightIndex() === i\"\n                          (mousedown)=\"$event.preventDefault()\"\n                          (click)=\"selectLocationSuggestion(s.path)\"\n                        >\n                          {{ s.title || s.path }}\n                        </button>\n                      </li>\n                    }\n                  </ul>\n                }\n              }\n            </div>\n            @if (locationRestricted()) {\n              <p class=\"location-hint\" role=\"alert\">\n                <span class=\"location-hint-bar\" aria-hidden=\"true\"></span>\n                {{ importLocationHint() | translate }}\n              </p>\n            }\n          </div>\n\n          @if (activeTab() === 'create') {\n            @if (!locationRestricted()) {\n              @if (loadingContext()) {\n                <div class=\"state-row state-row--compact\">\n                  <nxs-spinner\n                    diameter=\"24\"\n                    [label]=\"'browse.create-import-dialog.loading' | translate\"\n                  />\n                  <span>{{\n                    'browse.create-import-dialog.loading-document-types' | translate\n                  }}</span>\n                </div>\n              } @else if (typesLoadError()) {\n                <p class=\"error-text types-error\">{{ typesLoadError() }}</p>\n              } @else if (creatableTypes().length === 0) {\n                <p class=\"empty-hint\">\n                  {{ 'browse.create-import-dialog.no-document-types-can-be-created' | translate }}\n                </p>\n              } @else {\n                <div class=\"doctype-grid\" role=\"list\">\n                  @for (dt of creatableTypes(); track dt.type) {\n                    <button\n                      type=\"button\"\n                      class=\"doctype-tile\"\n                      role=\"listitem\"\n                      [disabled]=\"busy() || locationRestricted()\"\n                      (click)=\"startCreateFromType(dt)\"\n                    >\n                      <nxs-doc-type-icon class=\"doctype-icon\" [type]=\"dt.type\" />\n                      <span class=\"doctype-label\">{{ dt.label }}</span>\n                    </button>\n                  }\n                </div>\n              }\n            }\n          } @else if (activeTab() === 'import') {\n            @if (importRestricted()) {\n              <p class=\"empty-hint\">\n                @if (isAtRepositoryRoot()) {\n                  {{ 'browse.create-import-dialog.file-import-is-not-available-at' | translate }}\n                  choose a folder below.\n                } @else {\n                  {{ importLocationHint() | translate }}\n                }\n              </p>\n            } @else {\n              <div class=\"import-tab-panel\">\n                <nxs-dropzone\n                  class=\"import-dropzone\"\n                  multiple\n                  [disabled]=\"busy()\"\n                  [label]=\"'browse.create-import-dialog.drag-and-drop-or-click-to' | translate\"\n                  [buttonLabel]=\"\n                    uploads.items().length > 0\n                      ? ('browse.create-import-dialog.add-more-files' | translate)\n                      : ''\n                  \"\n                  (files)=\"stageImportFiles($event)\"\n                />\n                <nxs-upload-queue\n                  class=\"import-queue\"\n                  [items]=\"uploads.items()\"\n                  [label]=\"'browse.create-import-dialog.selected-files' | translate\"\n                  (remove)=\"uploads.remove($event)\"\n                  (retry)=\"runUpload()\"\n                />\n\n                @if (importError()) {\n                  <p class=\"error-text import-error import-error--staged\" role=\"alert\">\n                    {{ importError() }}\n                  </p>\n                }\n              </div>\n            }\n          } @else {\n            @if (csvImportRestricted()) {\n              <p class=\"empty-hint\">{{ importLocationHint() | translate }}</p>\n            } @else {\n              <div\n                class=\"dropzone dropzone--csv\"\n                [class.dropzone--active]=\"dragOverCsv()\"\n                (dragover)=\"onCsvDragOver($event)\"\n                (dragleave)=\"onCsvDragLeave($event)\"\n                (drop)=\"onCsvDrop($event)\"\n              >\n                <input\n                  #csvInput\n                  type=\"file\"\n                  accept=\".csv,text/csv\"\n                  (change)=\"onCsvInputChange($event)\"\n                  [disabled]=\"busy()\"\n                />\n                <button\n                  type=\"button\"\n                  class=\"dropzone-inner\"\n                  [disabled]=\"busy()\"\n                  (click)=\"csvInput.click()\"\n                >\n                  <span class=\"dropzone-text\">{{\n                    'browse.create-import-dialog.click-to-select-a-csv-file' | translate\n                  }}</span>\n                </button>\n              </div>\n\n              @if (csvFile(); as csv) {\n                <ul class=\"file-list\">\n                  <li>\n                    <span class=\"file-name\">{{ csv.name }}</span>\n                    <button\n                      mat-icon-button\n                      type=\"button\"\n                      [disabled]=\"busy()\"\n                      (click)=\"clearCsvFile()\"\n                      [attr.aria-label]=\"'browse.create-import-dialog.remove-csv-file' | translate\"\n                    >\n                      <mat-icon>close</mat-icon>\n                    </button>\n                  </li>\n                </ul>\n              }\n\n              <div class=\"csv-options\">\n                <mat-slide-toggle\n                  [checked]=\"csvSendReport()\"\n                  [disabled]=\"busy()\"\n                  (change)=\"csvSendReport.set($event.checked)\"\n                >\n                  {{ 'browse.create-import-dialog.receive-the-import-report-by-email' | translate }}\n                </mat-slide-toggle>\n                <mat-slide-toggle\n                  [checked]=\"csvDocumentMode()\"\n                  [disabled]=\"busy()\"\n                  (change)=\"csvDocumentMode.set($event.checked)\"\n                >\n                  {{ 'browse.create-import-dialog.apply-date-author-and-dublin-core' | translate }}\n                </mat-slide-toggle>\n              </div>\n            }\n            @if (importError()) {\n              <p class=\"error-text import-error\" role=\"alert\">{{ importError() }}</p>\n            }\n            @if (uploadProgress(); as progress) {\n              <div class=\"upload-progress upload-progress--import\" role=\"status\" aria-live=\"polite\">\n                <span class=\"upload-progress-label\">{{ uploadProgressLabel(progress) }}</span>\n                <mat-progress-bar mode=\"determinate\" [value]=\"progress.percent\" />\n              </div>\n            }\n          }\n        }\n        @case ('templateForm') {\n          @if (selectedDocType(); as dt) {\n            <div class=\"type-form-header\">\n              <nxs-doc-type-icon class=\"type-form-icon\" [type]=\"dt.type\" />\n              <span class=\"type-form-title\">\n                {{ 'browse.create-import-dialog.new-of-type' | translate: { type: dt.label } }}\n              </span>\n            </div>\n\n            <div class=\"create-form\">\n              <div\n                class=\"location-bar location-bar--form\"\n                [class.location-bar--restricted]=\"locationRestricted()\"\n              >\n                <span class=\"location-label\">{{\n                  'browse.create-import-dialog.location' | translate\n                }}</span>\n                <div class=\"location-input-wrap\">\n                  <input\n                    type=\"text\"\n                    class=\"location-input\"\n                    [(ngModel)]=\"locationInput\"\n                    [attr.aria-label]=\"'browse.create-import-dialog.location' | translate\"\n                    [disabled]=\"busy()\"\n                    (focus)=\"onLocationFocus()\"\n                    (input)=\"onLocationInput()\"\n                    (blur)=\"onLocationBlur()\"\n                    (keydown)=\"onLocationKeydown($event)\"\n                  />\n                  @if (locationDropdownOpen()) {\n                    @if (loadingLocationSuggestions()) {\n                      <div class=\"location-dropdown location-dropdown--loading\">\n                        <nxs-spinner\n                          diameter=\"20\"\n                          [label]=\"'browse.create-import-dialog.loading' | translate\"\n                        />\n                        <span>{{ 'browse.create-import-dialog.loading-folders' | translate }}</span>\n                      </div>\n                    } @else if (locationSuggestions().length > 0) {\n                      <ul\n                        class=\"location-dropdown\"\n                        role=\"listbox\"\n                        [attr.aria-label]=\"\n                          'browse.create-import-dialog.available-folders' | translate\n                        \"\n                      >\n                        @for (s of locationSuggestions(); track s.path; let i = $index) {\n                          <li role=\"presentation\">\n                            <button\n                              type=\"button\"\n                              class=\"location-option\"\n                              role=\"option\"\n                              [attr.aria-selected]=\"locationHighlightIndex() === i\"\n                              [class.location-option--active]=\"locationHighlightIndex() === i\"\n                              (mousedown)=\"$event.preventDefault()\"\n                              (click)=\"selectLocationSuggestion(s.path)\"\n                            >\n                              {{ s.title || s.path }}\n                            </button>\n                          </li>\n                        }\n                      </ul>\n                    }\n                  }\n                </div>\n                @if (locationRestricted()) {\n                  <p class=\"location-hint\" role=\"alert\">\n                    <span class=\"location-hint-bar\" aria-hidden=\"true\"></span>\n                    {{ importLocationHint() | translate }}\n                  </p>\n                }\n              </div>\n\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                <mat-label>{{ 'browse.create-import-dialog.title' | translate }}</mat-label>\n                <input matInput [(ngModel)]=\"docTitle\" required />\n              </mat-form-field>\n\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                <mat-label>{{ 'browse.create-import-dialog.description' | translate }}</mat-label>\n                <input matInput [(ngModel)]=\"description\" />\n              </mat-form-field>\n\n              @if (hasContentField()) {\n                <div class=\"field-label\">\n                  {{ 'browse.create-import-dialog.content' | translate }}\n                </div>\n                @if (createMissingMainFile()) {\n                  <p class=\"error-text content-required-hint\" role=\"alert\">\n                    {{ 'browse.create-import-dialog.upload-a-main-file-to-create' | translate }}\n                  </p>\n                }\n                @if (contentError()) {\n                  <p class=\"error-text content-required-hint\" role=\"alert\">\n                    {{ contentError() }}\n                  </p>\n                }\n                <div\n                  class=\"content-dropzone\"\n                  [class.content-dropzone--active]=\"dragOverContent()\"\n                  [class.content-dropzone--filled]=\"mainFile()\"\n                  [class.content-dropzone--uploading]=\"mainFileUploading()\"\n                  (dragover)=\"onContentDragOver($event)\"\n                  (dragleave)=\"onContentDragLeave($event)\"\n                  (drop)=\"onContentDrop($event)\"\n                >\n                  <input\n                    #mainFileInput\n                    type=\"file\"\n                    (change)=\"onMainFileInputChange($event)\"\n                    [disabled]=\"busy() || mainFileUploading()\"\n                  />\n                  @if (mainFile(); as file) {\n                    <div class=\"content-file-row\">\n                      <div class=\"content-file-info\">\n                        <span class=\"content-file-name\">{{ file.name }}</span>\n                        @if (mainFileUploading() || mainFileUploadComplete()) {\n                          <mat-progress-bar\n                            class=\"content-file-progress\"\n                            mode=\"determinate\"\n                            [value]=\"mainFileUploadPercent()\"\n                            [class.content-file-progress--complete]=\"mainFileUploadComplete()\"\n                          />\n                          <span class=\"content-file-progress-label\">\n                            @if (mainFileUploading()) {\n                              {{\n                                'browse.create-import-dialog.uploading-percent'\n                                  | translate: { percent: mainFileUploadPercent() }\n                              }}\n                            } @else {\n                              {{ 'browse.create-import-dialog.upload-complete' | translate }}\n                            }\n                          </span>\n                        }\n                      </div>\n                      <button\n                        mat-icon-button\n                        type=\"button\"\n                        [attr.aria-label]=\"'browse.create-import-dialog.remove-file' | translate\"\n                        [disabled]=\"busy() || mainFileUploading()\"\n                        (click)=\"$event.stopPropagation(); clearMainFile()\"\n                      >\n                        <mat-icon>close</mat-icon>\n                      </button>\n                    </div>\n                  } @else {\n                    <button\n                      type=\"button\"\n                      class=\"content-upload-btn\"\n                      (click)=\"mainFileInput.click()\"\n                    >\n                      {{ 'browse.create-import-dialog.upload-main-file' | translate }}\n                    </button>\n                  }\n                </div>\n              }\n\n              @if (isNoteType()) {\n                <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                  <mat-label>{{ 'browse.create-import-dialog.format' | translate }}</mat-label>\n                  <mat-select [(ngModel)]=\"noteFormat\">\n                    @for (opt of noteFormatOptions; track opt.value) {\n                      <mat-option [value]=\"opt.value\">{{ opt.label }}</mat-option>\n                    }\n                  </mat-select>\n                </mat-form-field>\n              }\n\n              <mat-form-field\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n                class=\"full-width vocab-field\"\n              >\n                <mat-label>{{ 'browse.create-import-dialog.nature' | translate }}</mat-label>\n                <mat-select\n                  #natureSelect\n                  [(ngModel)]=\"nature\"\n                  panelClass=\"vocab-select-panel\"\n                  (openedChange)=\"onNaturePanelOpen($event)\"\n                  (selectionChange)=\"natureSelect.close()\"\n                >\n                  <mat-select-trigger>\n                    @if (nature; as natureId) {\n                      <mat-chip-set class=\"subjects-trigger-chips\">\n                        <mat-chip (removed)=\"clearNature()\">\n                          {{ naturePillLabel(natureId) }}\n                          <button\n                            type=\"button\"\n                            matChipRemove\n                            [attr.aria-label]=\"\n                              'shared.remove-item' | translate: { name: naturePillLabel(natureId) }\n                            \"\n                            (click)=\"$event.stopPropagation(); clearNature()\"\n                          >\n                            <mat-icon>cancel</mat-icon>\n                          </button>\n                        </mat-chip>\n                      </mat-chip-set>\n                    }\n                  </mat-select-trigger>\n                  <div class=\"vocab-panel__search\">\n                    <input\n                      type=\"text\"\n                      [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                      [(ngModel)]=\"naturePanelSearch\"\n                      [ngModelOptions]=\"{ standalone: true }\"\n                      (click)=\"$event.stopPropagation()\"\n                      (keydown)=\"$event.stopPropagation()\"\n                    />\n                  </div>\n                  <div class=\"vocab-panel__list\">\n                    @for (entry of filteredNatureOptions(); track entry.id) {\n                      <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n                    }\n                  </div>\n                </mat-select>\n              </mat-form-field>\n\n              <mat-form-field\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n                class=\"full-width vocab-field subjects-field\"\n              >\n                <mat-label>{{ 'browse.create-import-dialog.subjects' | translate }}</mat-label>\n                <mat-select\n                  multiple\n                  [(ngModel)]=\"subjects\"\n                  panelClass=\"vocab-select-panel vocab-grouped-select-panel subjects-select-panel\"\n                  (openedChange)=\"onSubjectsPanelOpen($event)\"\n                >\n                  <mat-select-trigger>\n                    <mat-chip-set class=\"subjects-trigger-chips\">\n                      @for (id of subjects; track id) {\n                        <mat-chip (removed)=\"removeSubject(id)\">\n                          {{ subjectPillLabel(id) }}\n                          <button\n                            type=\"button\"\n                            matChipRemove\n                            [attr.aria-label]=\"\n                              'shared.remove-item' | translate: { name: subjectPillLabel(id) }\n                            \"\n                            (click)=\"$event.stopPropagation()\"\n                          >\n                            <mat-icon>cancel</mat-icon>\n                          </button>\n                        </mat-chip>\n                      }\n                    </mat-chip-set>\n                  </mat-select-trigger>\n                  <div class=\"vocab-panel__search\">\n                    <input\n                      type=\"text\"\n                      [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                      [(ngModel)]=\"subjectsPanelSearch\"\n                      [ngModelOptions]=\"{ standalone: true }\"\n                      (click)=\"$event.stopPropagation()\"\n                      (keydown)=\"$event.stopPropagation()\"\n                    />\n                  </div>\n                  <div class=\"vocab-panel__list\">\n                    @for (group of groupedSubjectOptions(); track group.parentLabel) {\n                      <mat-optgroup [label]=\"group.parentLabel\">\n                        @for (entry of group.entries; track entry.id) {\n                          <mat-option [value]=\"entry.id\">{{\n                            entry.properties.label_en ?? entry.id\n                          }}</mat-option>\n                        }\n                      </mat-optgroup>\n                    }\n                  </div>\n                </mat-select>\n              </mat-form-field>\n\n              <mat-form-field\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n                class=\"full-width vocab-field\"\n              >\n                <mat-label>{{ 'browse.create-import-dialog.coverage' | translate }}</mat-label>\n                <mat-select\n                  #coverageSelect\n                  [(ngModel)]=\"coverage\"\n                  panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n                  (openedChange)=\"onCoveragePanelOpen($event)\"\n                  (selectionChange)=\"coverageSelect.close()\"\n                >\n                  <mat-select-trigger>\n                    @if (coverage; as coverageId) {\n                      <mat-chip-set class=\"subjects-trigger-chips\">\n                        <mat-chip (removed)=\"clearCoverage()\">\n                          {{ coveragePillLabel(coverageId) }}\n                          <button\n                            type=\"button\"\n                            matChipRemove\n                            [attr.aria-label]=\"\n                              'shared.remove-item'\n                                | translate: { name: coveragePillLabel(coverageId) }\n                            \"\n                            (click)=\"$event.stopPropagation(); clearCoverage()\"\n                          >\n                            <mat-icon>cancel</mat-icon>\n                          </button>\n                        </mat-chip>\n                      </mat-chip-set>\n                    }\n                  </mat-select-trigger>\n                  <div class=\"vocab-panel__search\">\n                    <input\n                      type=\"text\"\n                      [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                      [(ngModel)]=\"coveragePanelSearch\"\n                      [ngModelOptions]=\"{ standalone: true }\"\n                      (click)=\"$event.stopPropagation()\"\n                      (keydown)=\"$event.stopPropagation()\"\n                    />\n                  </div>\n                  <div class=\"vocab-panel__list\">\n                    @for (group of groupedCoverageOptions(); track group.parentLabel) {\n                      <mat-optgroup [label]=\"group.parentLabel\">\n                        @for (entry of group.entries; track entry.id) {\n                          <mat-option [value]=\"entry.id\">{{\n                            entry.properties.label_en ?? entry.id\n                          }}</mat-option>\n                        }\n                      </mat-optgroup>\n                    }\n                  </div>\n                </mat-select>\n              </mat-form-field>\n\n              <mat-form-field\n                appearance=\"outline\"\n                subscriptSizing=\"dynamic\"\n                class=\"full-width\"\n                [class.expires-field-invalid]=\"showExpiresError()\"\n              >\n                <mat-label>{{ 'browse.create-import-dialog.expires' | translate }}</mat-label>\n                <input\n                  matInput\n                  name=\"expires\"\n                  [matDatepicker]=\"expiresPicker\"\n                  [ngModel]=\"expires\"\n                  [errorStateMatcher]=\"expiresErrorMatcher\"\n                  (ngModelChange)=\"onExpiresChange($event)\"\n                  (input)=\"onExpiresInput($event)\"\n                  #expiresInput=\"ngModel\"\n                  [placeholder]=\"'common.date-mask' | translate | dateMask\"\n                />\n                <mat-datepicker-toggle matIconSuffix [for]=\"expiresPicker\" />\n                <mat-datepicker #expiresPicker />\n                @if (showExpiresError()) {\n                  <mat-error>{{\n                    'browse.create-import-dialog.enter-a-valid-date' | translate\n                  }}</mat-error>\n                }\n              </mat-form-field>\n            </div>\n          }\n        }\n        @case ('importProperties') {\n          <div class=\"import-properties-layout\">\n            <div class=\"import-properties-form\">\n              <div\n                class=\"location-bar location-bar--form\"\n                [class.location-bar--restricted]=\"locationRestricted()\"\n              >\n                <span class=\"location-label\">{{\n                  'browse.create-import-dialog.location' | translate\n                }}</span>\n                <div class=\"location-input-wrap\">\n                  <input\n                    type=\"text\"\n                    class=\"location-input\"\n                    [(ngModel)]=\"locationInput\"\n                    [attr.aria-label]=\"'browse.create-import-dialog.location' | translate\"\n                    [disabled]=\"busy()\"\n                    (focus)=\"onLocationFocus()\"\n                    (input)=\"onLocationInput()\"\n                    (blur)=\"onLocationBlur()\"\n                    (keydown)=\"onLocationKeydown($event)\"\n                  />\n                </div>\n              </div>\n\n              <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                <mat-label>{{ 'browse.create-import-dialog.type' | translate }}</mat-label>\n                <mat-select\n                  [ngModel]=\"importDocType()\"\n                  (ngModelChange)=\"importDocType.set($event)\"\n                  [disabled]=\"busy()\"\n                >\n                  <mat-option value=\"\">{{\n                    'browse.create-import-dialog.select-a-value' | translate\n                  }}</mat-option>\n                  @for (dt of importBlobTypeOptions(); track dt.type) {\n                    <mat-option [value]=\"dt.type\">{{ dt.label }}</mat-option>\n                  }\n                </mat-select>\n              </mat-form-field>\n\n              @if (showImportBlobMetadataFields()) {\n                <div class=\"import-detail-fields\">\n                  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                    <mat-label>{{ 'browse.create-import-dialog.title' | translate }}</mat-label>\n                    <input matInput [(ngModel)]=\"docTitle\" required />\n                  </mat-form-field>\n\n                  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n                    <mat-label>{{\n                      'browse.create-import-dialog.description' | translate\n                    }}</mat-label>\n                    <input matInput [(ngModel)]=\"description\" />\n                  </mat-form-field>\n\n                  <mat-form-field\n                    appearance=\"outline\"\n                    subscriptSizing=\"dynamic\"\n                    class=\"full-width vocab-field\"\n                  >\n                    <mat-label>{{ 'browse.create-import-dialog.nature' | translate }}</mat-label>\n                    <mat-select\n                      #importNatureSelect\n                      [(ngModel)]=\"nature\"\n                      panelClass=\"vocab-select-panel\"\n                      (openedChange)=\"onNaturePanelOpen($event)\"\n                      (selectionChange)=\"importNatureSelect.close()\"\n                    >\n                      <mat-select-trigger>\n                        @if (nature; as natureId) {\n                          <mat-chip-set class=\"subjects-trigger-chips\">\n                            <mat-chip (removed)=\"clearNature()\">\n                              {{ naturePillLabel(natureId) }}\n                              <button\n                                type=\"button\"\n                                matChipRemove\n                                [attr.aria-label]=\"\n                                  'shared.remove-item'\n                                    | translate: { name: naturePillLabel(natureId) }\n                                \"\n                                (click)=\"$event.stopPropagation(); clearNature()\"\n                              >\n                                <mat-icon>cancel</mat-icon>\n                              </button>\n                            </mat-chip>\n                          </mat-chip-set>\n                        }\n                      </mat-select-trigger>\n                      <div class=\"vocab-panel__search\">\n                        <input\n                          type=\"text\"\n                          [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                          [(ngModel)]=\"naturePanelSearch\"\n                          [ngModelOptions]=\"{ standalone: true }\"\n                          (click)=\"$event.stopPropagation()\"\n                          (keydown)=\"$event.stopPropagation()\"\n                        />\n                      </div>\n                      <div class=\"vocab-panel__list\">\n                        @for (entry of filteredNatureOptions(); track entry.id) {\n                          <mat-option [value]=\"entry.id\">{{\n                            directoryPickerLabel(entry)\n                          }}</mat-option>\n                        }\n                      </div>\n                    </mat-select>\n                  </mat-form-field>\n\n                  <mat-form-field\n                    appearance=\"outline\"\n                    subscriptSizing=\"dynamic\"\n                    class=\"full-width vocab-field subjects-field\"\n                  >\n                    <mat-label>{{ 'browse.create-import-dialog.subjects' | translate }}</mat-label>\n                    <mat-select\n                      multiple\n                      [(ngModel)]=\"subjects\"\n                      panelClass=\"vocab-select-panel vocab-grouped-select-panel subjects-select-panel\"\n                      (openedChange)=\"onSubjectsPanelOpen($event)\"\n                    >\n                      <mat-select-trigger>\n                        <mat-chip-set class=\"subjects-trigger-chips\">\n                          @for (id of subjects; track id) {\n                            <mat-chip (removed)=\"removeSubject(id)\">\n                              {{ subjectPillLabel(id) }}\n                              <button\n                                type=\"button\"\n                                matChipRemove\n                                [attr.aria-label]=\"\n                                  'shared.remove-item' | translate: { name: subjectPillLabel(id) }\n                                \"\n                                (click)=\"$event.stopPropagation()\"\n                              >\n                                <mat-icon>cancel</mat-icon>\n                              </button>\n                            </mat-chip>\n                          }\n                        </mat-chip-set>\n                      </mat-select-trigger>\n                      <div class=\"vocab-panel__search\">\n                        <input\n                          type=\"text\"\n                          [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                          [(ngModel)]=\"subjectsPanelSearch\"\n                          [ngModelOptions]=\"{ standalone: true }\"\n                          (click)=\"$event.stopPropagation()\"\n                          (keydown)=\"$event.stopPropagation()\"\n                        />\n                      </div>\n                      <div class=\"vocab-panel__list\">\n                        @for (group of groupedSubjectOptions(); track group.parentLabel) {\n                          <mat-optgroup [label]=\"group.parentLabel\">\n                            @for (entry of group.entries; track entry.id) {\n                              <mat-option [value]=\"entry.id\">{{\n                                entry.properties.label_en ?? entry.id\n                              }}</mat-option>\n                            }\n                          </mat-optgroup>\n                        }\n                      </div>\n                    </mat-select>\n                  </mat-form-field>\n\n                  <mat-form-field\n                    appearance=\"outline\"\n                    subscriptSizing=\"dynamic\"\n                    class=\"full-width vocab-field\"\n                  >\n                    <mat-label>{{ 'browse.create-import-dialog.coverage' | translate }}</mat-label>\n                    <mat-select\n                      #importCoverageSelect\n                      [(ngModel)]=\"coverage\"\n                      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n                      (openedChange)=\"onCoveragePanelOpen($event)\"\n                      (selectionChange)=\"importCoverageSelect.close()\"\n                    >\n                      <mat-select-trigger>\n                        @if (coverage; as coverageId) {\n                          <mat-chip-set class=\"subjects-trigger-chips\">\n                            <mat-chip (removed)=\"clearCoverage()\">\n                              {{ coveragePillLabel(coverageId) }}\n                              <button\n                                type=\"button\"\n                                matChipRemove\n                                [attr.aria-label]=\"\n                                  'shared.remove-item'\n                                    | translate: { name: coveragePillLabel(coverageId) }\n                                \"\n                                (click)=\"$event.stopPropagation(); clearCoverage()\"\n                              >\n                                <mat-icon>cancel</mat-icon>\n                              </button>\n                            </mat-chip>\n                          </mat-chip-set>\n                        }\n                      </mat-select-trigger>\n                      <div class=\"vocab-panel__search\">\n                        <input\n                          type=\"text\"\n                          [placeholder]=\"'browse.create-import-dialog.search' | translate\"\n                          [(ngModel)]=\"coveragePanelSearch\"\n                          [ngModelOptions]=\"{ standalone: true }\"\n                          (click)=\"$event.stopPropagation()\"\n                          (keydown)=\"$event.stopPropagation()\"\n                        />\n                      </div>\n                      <div class=\"vocab-panel__list\">\n                        @for (group of groupedCoverageOptions(); track group.parentLabel) {\n                          <mat-optgroup [label]=\"group.parentLabel\">\n                            @for (entry of group.entries; track entry.id) {\n                              <mat-option [value]=\"entry.id\">{{\n                                entry.properties.label_en ?? entry.id\n                              }}</mat-option>\n                            }\n                          </mat-optgroup>\n                        }\n                      </div>\n                    </mat-select>\n                  </mat-form-field>\n\n                  <mat-form-field\n                    appearance=\"outline\"\n                    subscriptSizing=\"dynamic\"\n                    class=\"full-width\"\n                    [class.expires-field-invalid]=\"showExpiresError()\"\n                  >\n                    <mat-label>{{ 'browse.create-import-dialog.expires' | translate }}</mat-label>\n                    <input\n                      matInput\n                      name=\"importExpires\"\n                      [matDatepicker]=\"importExpiresPicker\"\n                      [ngModel]=\"expires\"\n                      [errorStateMatcher]=\"expiresErrorMatcher\"\n                      (ngModelChange)=\"onExpiresChange($event)\"\n                      (input)=\"onExpiresInput($event)\"\n                      [placeholder]=\"'common.date-mask' | translate | dateMask\"\n                    />\n                    <mat-datepicker-toggle matIconSuffix [for]=\"importExpiresPicker\" />\n                    <mat-datepicker #importExpiresPicker />\n                    @if (showExpiresError()) {\n                      <mat-error>{{\n                        'browse.create-import-dialog.enter-a-valid-date' | translate\n                      }}</mat-error>\n                    }\n                  </mat-form-field>\n                </div>\n              }\n\n              @if (importError()) {\n                <p class=\"error-text import-error\" role=\"alert\">{{ importError() }}</p>\n              }\n              @if (uploadProgress(); as progress) {\n                <div\n                  class=\"upload-progress upload-progress--import\"\n                  role=\"status\"\n                  aria-live=\"polite\"\n                >\n                  <span class=\"upload-progress-label\">{{ uploadProgressLabel(progress) }}</span>\n                  <mat-progress-bar mode=\"determinate\" [value]=\"progress.percent\" />\n                </div>\n              }\n            </div>\n\n            <aside\n              class=\"import-properties-sidebar\"\n              [attr.aria-label]=\"'browse.create-import-dialog.files-to-import' | translate\"\n            >\n              <p class=\"import-sidebar-hint\">\n                {{ 'browse.create-import-dialog.unchecked-files-will-be-discarded' | translate }}\n              </p>\n              <ul class=\"import-file-list\" role=\"list\">\n                @for (entry of importEntries(); track $index; let i = $index) {\n                  <li\n                    class=\"import-file-item\"\n                    [class.import-file-item--active]=\"importFileIndex() === i\"\n                  >\n                    <mat-checkbox\n                      [checked]=\"entry.checked\"\n                      [disabled]=\"busy()\"\n                      (change)=\"toggleImportFileChecked(i, $event.checked)\"\n                      [aria-label]=\"'shared.include-file' | translate: { name: entry.file.name }\"\n                    />\n                    <button\n                      type=\"button\"\n                      class=\"import-file-select\"\n                      [disabled]=\"busy()\"\n                      (click)=\"selectImportFile(i)\"\n                    >\n                      <span class=\"import-file-name\">{{ entry.file.name }}</span>\n                      <span class=\"import-file-title\">{{ entry.state.title }}</span>\n                    </button>\n                    @if (entry.visited) {\n                      <mat-icon class=\"import-file-done\" aria-hidden=\"true\">check_circle</mat-icon>\n                    }\n                  </li>\n                }\n              </ul>\n            </aside>\n          </div>\n        }\n        @case ('success') {\n          <div class=\"success-panel\" role=\"status\" aria-live=\"polite\">\n            <mat-icon class=\"success-icon\" aria-hidden=\"true\">check_circle</mat-icon>\n            <h2 mat-dialog-title class=\"success-heading\">\n              {{ 'browse.create-import-dialog.done' | translate }}\n            </h2>\n            <p class=\"success-message\">{{ successMessage() }}</p>\n          </div>\n        }\n      }\n    }\n  </mat-dialog-content>\n\n  @if (!resolvingPath() && !pathError()) {\n    <mat-dialog-actions class=\"dialog-footer\" align=\"start\">\n      @if (view() !== 'success') {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"btn-cancel\"\n          [disabled]=\"busy()\"\n          (click)=\"close()\"\n        >\n          {{ 'browse.create-import-dialog.cancel' | translate }}\n        </button>\n      }\n      <span class=\"footer-spacer\"></span>\n      @if (view() === 'success') {\n        <button mat-button type=\"button\" (click)=\"close()\">\n          {{ 'browse.create-import-dialog.close' | translate }}\n        </button>\n        <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"doneNavigateBrowse()\">\n          {{ 'browse.create-import-dialog.ok' | translate }}\n        </button>\n      } @else if (view() === 'templateForm') {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"btn-back\"\n          [disabled]=\"busy()\"\n          (click)=\"goMain()\"\n        >\n          {{ 'browse.create-import-dialog.back' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"\n            busy() ||\n            !docTitle.trim() ||\n            locationRestricted() ||\n            createMissingMainFile() ||\n            mainFileUploadPending() ||\n            !isExpiresValid()\n          \"\n          (click)=\"createDocument()\"\n        >\n          {{ 'browse.create-import-dialog.create' | translate }}\n        </button>\n      } @else if (view() === 'main' && activeTab() === 'import' && uploads.pending().length > 0) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"btn-add-properties\"\n          [disabled]=\"busy() || importRestricted()\"\n          (click)=\"startImportProperties()\"\n        >\n          {{ 'browse.create-import-dialog.add-properties' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"busy() || importRestricted()\"\n          (click)=\"runUpload()\"\n        >\n          {{ 'browse.create-import-dialog.create' | translate }}\n        </button>\n      } @else if (view() === 'importProperties') {\n        <div class=\"import-footer-nav\">\n          <button\n            mat-button\n            type=\"button\"\n            class=\"btn-nav-link\"\n            [disabled]=\"!canEditImportPrevious() || busy()\"\n            (click)=\"editImportPrevious()\"\n          >\n            <mat-icon aria-hidden=\"true\">chevron_left</mat-icon>\n            {{ 'browse.create-import-dialog.edit-previous' | translate }}\n          </button>\n          <button\n            mat-button\n            type=\"button\"\n            class=\"btn-nav-link\"\n            [disabled]=\"!canEditImportNext() || busy()\"\n            (click)=\"editImportNext()\"\n          >\n            {{ 'browse.create-import-dialog.edit-next' | translate }}\n            <mat-icon aria-hidden=\"true\">chevron_right</mat-icon>\n          </button>\n          <button\n            mat-button\n            type=\"button\"\n            class=\"btn-nav-link\"\n            [disabled]=\"busy() || !canApplyImportToAll()\"\n            (click)=\"applyImportToAll()\"\n          >\n            {{ 'browse.create-import-dialog.apply-to-all' | translate }}\n          </button>\n        </div>\n        <span class=\"footer-spacer\"></span>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"busy() || !canCreateImportWithProperties()\"\n          (click)=\"runImportWithProperties()\"\n        >\n          {{ 'browse.create-import-dialog.create' | translate }}\n        </button>\n      } @else if (view() === 'main' && activeTab() === 'csv') {\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"busy() || !csvFile() || csvImportRestricted()\"\n          (click)=\"runCsvImport()\"\n        >\n          {{ 'browse.create-import-dialog.import' | translate }}\n        </button>\n      }\n    </mat-dialog-actions>\n  }\n</div>\n", styles: ["$primary-blue: var(--mat-sys-primary, #0066ff);\n$tab-inactive: var(--mat-sys-on-surface-variant, #6b7280);\n$location-bg: var(--mat-sys-surface-container, #f3f4f6);\n$tile-bg: var(--mat-sys-surface-container-low, #f5f6f8);\n$tile-hover: var(--mat-sys-surface-container-high, #eef0f4);\n\n:host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-width: min(95vw, 560px);\n  max-width: 95vw;\n  box-sizing: border-box;\n\n  &:has(.success-view) {\n    height: auto;\n    min-height: 0;\n    min-width: min(95vw, 440px);\n  }\n}\n\n.create-import-root {\n  display: flex;\n  flex-direction: column;\n  flex: 1 1 auto;\n  min-height: 0;\n  height: 100%;\n\n  &.success-view {\n    flex: 0 0 auto;\n    min-height: 0;\n    height: auto;\n\n    .dialog-body {\n      flex: 0 0 auto;\n      min-height: 0;\n      max-height: none;\n      overflow: hidden;\n      padding: 0;\n    }\n\n    .dialog-footer {\n      border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n      justify-content: flex-end;\n      padding: 12px 24px 20px;\n    }\n  }\n}\n\n.dialog-body {\n  flex: 1 1 auto;\n  min-width: 280px;\n  min-height: 0;\n  max-width: 100%;\n  padding: 0;\n  box-sizing: border-box;\n  overflow: visible;\n}\n\n.dialog-body--main,\n.dialog-body--form {\n  padding: 0;\n  min-height: 480px;\n  max-height: none;\n  overflow-y: auto;\n}\n\n.dialog-body--main {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n}\n\n/* \u2500\u2500\u2500 Tabs \u2500\u2500\u2500 */\n.tab-header {\n  display: flex;\n  flex-shrink: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n}\n\n.tab-btn {\n  flex: 1;\n  padding: 16px 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.9375rem;\n  font-weight: 500;\n  color: $tab-inactive;\n  cursor: pointer;\n  position: relative;\n  transition: color 0.15s ease;\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n\n  &--active {\n    color: $primary-blue;\n    font-weight: 600;\n\n    &::after {\n      content: '';\n      position: absolute;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      height: 3px;\n      background: $primary-blue;\n    }\n  }\n\n  &:focus-visible {\n    outline: 2px solid $primary-blue;\n    outline-offset: -2px;\n  }\n}\n\n/* \u2500\u2500\u2500 Location bar \u2500\u2500\u2500 */\n.location-bar {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 16px 24px;\n  background: $location-bg;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n  &--restricted .location-input {\n    border-bottom-color: var(--mat-sys-outline, #9ca3af);\n  }\n}\n\n.location-hint {\n  display: flex;\n  align-items: stretch;\n  gap: 10px;\n  margin: 10px 0 0;\n  font-size: 0.8125rem;\n  line-height: 1.45;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.location-hint-bar {\n  width: 3px;\n  flex-shrink: 0;\n  background: var(--mat-sys-error, #b3261e);\n  border-radius: 1px;\n}\n\n.location-label {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  font-weight: 400;\n}\n\n.location-input-wrap {\n  position: relative;\n}\n\n.location-dropdown {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  z-index: 10;\n  margin: 4px 0 0;\n  padding: 4px 0;\n  list-style: none;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  border-radius: 4px;\n  box-shadow: 0 4px 12px color-mix(in srgb, var(--mat-sys-on-surface, #1a1c1e) 10%, transparent);\n  max-height: 220px;\n  overflow-y: auto;\n\n  &--loading {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    padding: 12px 16px;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface-variant, #6b7280);\n  }\n}\n\n.location-option {\n  display: block;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.875rem;\n  text-align: left;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible,\n  &--active {\n    background: var(--mat-sys-primary-container, #e8f0fe);\n    outline: none;\n  }\n}\n\n.location-input {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline, #9ca3af);\n  background: transparent;\n  padding: 4px 0 6px;\n  font: inherit;\n  font-size: 0.9375rem;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  box-sizing: border-box;\n\n  &:focus {\n    outline: none;\n    border-bottom-color: $primary-blue;\n    border-bottom-width: 2px;\n    padding-bottom: 5px;\n  }\n\n  &:disabled {\n    opacity: 0.6;\n    cursor: not-allowed;\n  }\n}\n\n/* \u2500\u2500\u2500 Document type grid \u2500\u2500\u2500 */\n.doctype-grid {\n  display: grid;\n  grid-template-columns: repeat(8, minmax(0, 1fr));\n  gap: 8px;\n  padding: 24px;\n\n  @media (max-width: 720px) {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  @media (max-width: 400px) {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n}\n\n.doctype-tile {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 16px 8px;\n  min-height: 96px;\n  border: none;\n  border-radius: 4px;\n  background: $tile-bg;\n  cursor: pointer;\n  transition: background 0.15s ease;\n\n  &:hover:not(:disabled) {\n    background: $tile-hover;\n  }\n\n  &:focus-visible {\n    outline: 2px solid $primary-blue;\n    outline-offset: 2px;\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n}\n\n.doctype-icon {\n  --nxs-icon-size: 32px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.doctype-label {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface, #374151);\n  text-align: center;\n  line-height: 1.3;\n}\n\n/* \u2500\u2500\u2500 Import tab panel \u2500\u2500\u2500 */\n.import-tab-panel {\n  display: flex;\n  flex-direction: column;\n  flex: 1 1 auto;\n  min-height: 0;\n  padding-top: 24px;\n\n  .import-dropzone {\n    margin: 0 24px 16px;\n    min-height: 160px;\n  }\n\n  .import-queue {\n    margin: 0 24px 16px;\n  }\n\n  .import-error--staged {\n    margin: -8px 24px 16px;\n  }\n}\n\n/* \u2500\u2500\u2500 Import dropzone \u2500\u2500\u2500 */\n.dropzone {\n  position: relative;\n  margin: 24px;\n  border: 2px dashed var(--mat-sys-outline-variant, #d1d5db);\n  border-radius: 4px;\n  background: $tile-bg;\n\n  .dropzone-file-input {\n    position: absolute;\n    width: 0;\n    height: 0;\n    opacity: 0;\n    overflow: hidden;\n    pointer-events: none;\n  }\n\n  &--import {\n    min-height: 320px;\n\n    &:not(.dropzone--filled) .dropzone-file-input {\n      inset: 0;\n      width: 100%;\n      height: 100%;\n      opacity: 0;\n      cursor: pointer;\n      pointer-events: auto;\n      z-index: 1;\n    }\n  }\n\n  &--filled {\n    min-height: 0;\n    padding: 16px;\n    background: var(--mat-sys-surface, #fff);\n  }\n\n  &--csv {\n    min-height: 320px;\n    margin-top: 0;\n    margin-bottom: 16px;\n\n    input[type='file'] {\n      position: absolute;\n      inset: 0;\n      opacity: 0;\n      cursor: pointer;\n      z-index: 1;\n    }\n  }\n\n  &--active {\n    border-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n\n  &--disabled {\n    opacity: 0.55;\n    pointer-events: none;\n  }\n}\n\n.dropzone-inner {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  flex: 1 1 auto;\n  min-height: 320px;\n  padding: 48px 24px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  font: inherit;\n}\n\n.dropzone-text {\n  font-size: 0.9375rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n  line-height: 1.5;\n}\n\n.import-error--staged,\n.upload-progress--staged {\n  margin: 0 24px 16px;\n}\n\n.csv-options {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  margin: 0 24px 24px;\n  padding-top: 4px;\n\n  mat-slide-toggle {\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n  }\n}\n\n/* \u2500\u2500\u2500 Footer \u2500\u2500\u2500 */\n.dialog-footer {\n  display: flex;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: flex-start;\n  align-self: stretch;\n  width: 100%;\n  box-sizing: border-box;\n  gap: 8px 12px;\n  padding: 16px 24px 20px;\n  margin: 0;\n\n  .footer-spacer {\n    flex: 1 1 auto;\n    min-width: 8px;\n  }\n\n  .btn-cancel {\n    border-color: $primary-blue;\n    color: $primary-blue;\n  }\n\n  .btn-back {\n    color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  }\n\n  .import-footer-nav {\n    display: flex;\n    flex-wrap: wrap;\n    align-items: center;\n    gap: 4px 8px;\n  }\n\n  .btn-nav-link {\n    color: $primary-blue;\n    min-width: 0;\n    padding: 0 8px;\n\n    &:disabled {\n      color: var(--mat-sys-on-surface-variant, #9ca3af);\n    }\n\n    mat-icon {\n      width: 18px;\n      height: 18px;\n      font-size: 18px;\n    }\n  }\n}\n\n/* \u2500\u2500\u2500 Import with properties (NXSAT-185) \u2500\u2500\u2500 */\n.import-properties-layout {\n  display: flex;\n  align-items: stretch;\n  min-height: 480px;\n}\n\n.import-properties-form {\n  flex: 1 1 auto;\n  min-width: 0;\n  padding: 16px 24px 24px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n\n  .location-bar--form {\n    margin-bottom: 0;\n  }\n}\n\n.import-detail-fields {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n\n.import-properties-sidebar {\n  flex: 0 0 280px;\n  max-width: 36%;\n  border-left: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  padding: 16px;\n  background: var(--mat-sys-surface-container-lowest, #fafafa);\n  overflow-y: auto;\n}\n\n.import-sidebar-hint {\n  margin: 0 0 12px;\n  font-size: 0.8125rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-file-list {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.import-file-item {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-bottom: 4px;\n  border-radius: 4px;\n  border-left: 3px solid transparent;\n\n  &--active {\n    border-left-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n}\n\n.import-file-select {\n  flex: 1 1 auto;\n  min-width: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  padding: 8px 4px;\n  cursor: pointer;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n\n  &:disabled {\n    cursor: not-allowed;\n    opacity: 0.6;\n  }\n}\n\n.import-file-name {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.875rem;\n}\n\n.import-file-title {\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-file-done {\n  flex-shrink: 0;\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n  color: var(--mat-sys-tertiary, #0d904f);\n}\n\n.btn-add-properties {\n  border-color: $primary-blue;\n  color: $primary-blue;\n}\n\n.template-form-lead {\n  margin: 0 0 12px;\n  font-size: 0.875rem;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.form-view .dialog-body {\n  padding: 0;\n}\n\n.type-form-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 16px 24px 8px;\n}\n\n.type-form-icon {\n  --nxs-icon-size: 22px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.type-form-title {\n  font-size: 1rem;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.create-form {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 0 24px 24px;\n}\n\n.location-bar--form {\n  margin: 0 -24px 12px;\n  border-bottom: none;\n}\n\n.field-label {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  margin: 0 0 4px;\n}\n\n.content-dropzone {\n  position: relative;\n  min-height: 120px;\n  margin-bottom: 0;\n  border: 2px dashed var(--mat-sys-outline-variant, #d1d5db);\n  border-radius: 4px;\n  background: $tile-bg;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  input[type='file'] {\n    position: absolute;\n    inset: 0;\n    opacity: 0;\n    cursor: pointer;\n    z-index: 1;\n  }\n\n  &--active {\n    border-color: $primary-blue;\n    background: var(--mat-sys-primary-container, #e8f0fe);\n  }\n\n  &--filled {\n    padding: 12px 16px;\n    min-height: auto;\n\n    input[type='file'] {\n      display: none;\n    }\n  }\n\n  &--uploading {\n    border-color: $primary-blue;\n  }\n}\n\n.content-upload-btn {\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 0.9375rem;\n  font-weight: 500;\n  color: $primary-blue;\n  cursor: pointer;\n  padding: 24px;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.content-file-row {\n  position: relative;\n  z-index: 2;\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 12px;\n  width: 100%;\n}\n\n.content-file-info {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.content-file-progress {\n  width: 100%;\n  border-radius: 2px;\n\n  &--complete {\n    ::ng-deep .mdc-linear-progress__bar-inner {\n      border-color: var(--mat-sys-primary, #0066ff);\n    }\n  }\n}\n\n.content-file-progress-label {\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.content-file-name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 0.875rem;\n}\n\n.full-width {\n  width: 100%;\n}\n\n.vocab-field {\n  ::ng-deep .mat-mdc-select-trigger {\n    height: auto;\n    min-height: 24px;\n    overflow: visible;\n  }\n\n  .subjects-trigger-chips {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 4px;\n    width: 100%;\n    padding: 6px 8px 6px 12px;\n    box-sizing: border-box;\n  }\n\n  ::ng-deep .mat-mdc-chip-set .mdc-evolution-chip {\n    margin: 2px 4px 2px 0;\n  }\n}\n\n.expires-field-invalid {\n  ::ng-deep .mdc-notched-outline__leading,\n  ::ng-deep .mdc-notched-outline__notch,\n  ::ng-deep .mdc-notched-outline__trailing {\n    border-color: var(--mat-sys-error, #b3261e);\n  }\n}\n\n.vocab-dropdown-wrap {\n  position: relative;\n}\n\n// Mat-select panels render in a CDK overlay outside :host \u2014 use unscoped ::ng-deep.\n::ng-deep .mat-mdc-select-panel.vocab-select-panel {\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  max-height: 320px;\n  padding-top: 0;\n\n  .vocab-panel__search {\n    flex: 0 0 auto;\n    padding: 8px 12px;\n    background: var(--mat-sys-surface, #fff);\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n    input {\n      width: 100%;\n      box-sizing: border-box;\n      padding: 8px 12px;\n      border: 1px solid var(--mat-sys-outline-variant, #d1d5db);\n      border-radius: 4px;\n      font: inherit;\n      font-size: 0.875rem;\n      color: var(--mat-sys-on-surface, #1a1c1e);\n      background: var(--mat-sys-surface, #fff);\n\n      &:focus {\n        outline: none;\n        border-color: $primary-blue;\n      }\n    }\n  }\n\n  .vocab-panel__list {\n    flex: 1 1 auto;\n    min-height: 0;\n    overflow-x: hidden;\n    overflow-y: auto;\n  }\n}\n\n::ng-deep .vocab-grouped-select-panel {\n  .mat-mdc-optgroup-label,\n  .mat-mdc-optgroup .mdc-list-group__subheader {\n    font-weight: 700;\n    font-size: 0.8125rem;\n    color: var(--mat-sys-on-surface, #1a1c1e);\n    background: var(--mat-sys-surface-container-lowest, #fafafa);\n    padding: 10px 16px 6px;\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #f0f0f0);\n    min-height: auto;\n    line-height: 1.4;\n  }\n}\n\n::ng-deep .subjects-select-panel {\n  .mat-mdc-option {\n    .mat-pseudo-checkbox,\n    mat-pseudo-checkbox {\n      display: none;\n    }\n\n    .mdc-list-item__primary-text {\n      margin-left: 0;\n    }\n  }\n}\n\n.form-view {\n  .dialog-footer {\n    border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n  }\n}\n\n.file-list {\n  list-style: none;\n  margin: 0 24px 16px;\n  padding: 0;\n  max-height: 160px;\n  overflow-y: auto;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n\n  li {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 12px;\n    padding: 8px 0;\n    border-bottom: 1px solid var(--mat-sys-outline-variant, #e5e7eb);\n    font-size: 0.875rem;\n  }\n}\n\n.file-name {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.state-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 24px;\n\n  &--compact {\n    padding: 16px 24px;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface-variant, #6b7280);\n  }\n}\n\n.error-text {\n  color: var(--mat-sys-error, #b3261e);\n  font-size: 13px;\n  margin: 0 24px 8px;\n  padding-top: 8px;\n}\n\n.success-panel {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 12px;\n  padding: 36px 32px 28px;\n  text-align: center;\n  box-sizing: border-box;\n}\n\n.success-icon {\n  font-size: 56px;\n  width: 56px;\n  height: 56px;\n  color: $primary-blue;\n}\n\n.success-heading {\n  margin: 0;\n  font-size: 1.25rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n}\n\n.success-message {\n  margin: 0;\n  font-size: 0.9375rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  max-width: 34ch;\n  word-break: break-word;\n}\n\n.detail-list {\n  font-size: 12px;\n  margin: 0 24px 12px;\n  padding-left: 18px;\n}\n\n.error-list {\n  color: var(--mat-sys-error, #b3261e);\n}\n\n.subtle {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #888);\n  margin: 0 24px;\n}\n\n.empty-hint {\n  margin: 24px;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n  text-align: center;\n}\n\n.types-error {\n  margin: 16px 24px;\n  padding-top: 0;\n}\n\n.upload-progress {\n  margin: 0 24px 12px;\n\n  &--import {\n    margin-top: 8px;\n  }\n}\n\n.upload-progress-label {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 0.8125rem;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.import-error {\n  margin-top: 0;\n}\n"] }]
    }], () => [], { mainFileInput: [{
            type: ViewChild,
            args: ['mainFileInput']
        }], expiresNgModel: [{
            type: ViewChild,
            args: ['expiresInput']
        }], onEscapeKey: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CreateImportDialogComponent, { className: "CreateImportDialogComponent", filePath: "libs/features/browse/src/lib/create-import/create-import-dialog.component.ts", lineNumber: 194 }); })();
