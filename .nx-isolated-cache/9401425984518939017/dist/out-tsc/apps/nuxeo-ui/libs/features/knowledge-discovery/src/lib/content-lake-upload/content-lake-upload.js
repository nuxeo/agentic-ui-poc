import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteTrigger, } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { BrowseService, ContentLakeIngestService, DocumentImportService, isFolderishDocument, } from '@nuxeo/satori-platform/nuxeo-client';
import { KdClientService } from '@agentic-ui/shared/kd-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/icon";
import * as i6 from "@angular/material/autocomplete";
import * as i7 from "@angular/material/select";
import * as i8 from "@angular/material/input";
import * as i9 from "@angular/material/progress-spinner";
import * as i10 from "@angular/material/tooltip";
const _c0 = ["fileInput"];
const _forTrack0 = ($index, $item) => $item.path;
const _forTrack1 = ($index, $item) => $item.name + $item.size;
const _forTrack2 = ($index, $item) => $item.fileName;
const _forTrack3 = ($index, $item) => $item.uid;
function ContentLakeUploadComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 8);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "kd.content-lake-upload.loading"));
} }
function ContentLakeUploadComponent_For_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r2.path);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(option_r2.title);
} }
function ContentLakeUploadComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.folderBrowseError());
} }
function ContentLakeUploadComponent_Conditional_37_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const file_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(file_r4.name);
} }
function ContentLakeUploadComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 17);
    i0.ɵɵrepeaterCreate(1, ContentLakeUploadComponent_Conditional_37_For_2_Template, 2, 1, "li", null, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.selectedFiles());
} }
function ContentLakeUploadComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 28);
    i0.ɵɵlistener("click", function ContentLakeUploadComponent_Conditional_38_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.clearSelection()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "kd.content-lake-upload.clear"), " ");
} }
function ContentLakeUploadComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "kd.content-lake-upload.checking-for-existing-content-lake-copies"), " ");
} }
function ContentLakeUploadComponent_Conditional_40_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 29);
    i0.ɵɵlistener("click", function ContentLakeUploadComponent_Conditional_40_For_6_Template_button_click_3_listener() { const match_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.openDocument(match_r7.existingUid)); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 30);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const match_r7 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(match_r7.fileName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 3, "kd.content-lake-upload.open-existing-document"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(match_r7.existingPath);
} }
function ContentLakeUploadComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20)(1, "p", 21);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul");
    i0.ɵɵrepeaterCreate(5, ContentLakeUploadComponent_Conditional_40_For_6_Template, 8, 5, "li", null, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "kd.content-lake-upload.these-files-match-documents-already-indexed"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.duplicateMatches());
} }
function ContentLakeUploadComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.statusMessage());
} }
function ContentLakeUploadComponent_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.errorMessage());
} }
function ContentLakeUploadComponent_Conditional_43_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 29);
    i0.ɵɵlistener("click", function ContentLakeUploadComponent_Conditional_43_For_2_Template_button_click_1_listener() { const doc_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.openDocument(doc_r9.uid)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 30);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const doc_r9 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", doc_r9.title, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(doc_r9.path);
} }
function ContentLakeUploadComponent_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 22);
    i0.ɵɵrepeaterCreate(1, ContentLakeUploadComponent_Conditional_43_For_2_Template, 5, 2, "li", null, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.uploadedDocuments());
} }
function ContentLakeUploadComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23);
    i0.ɵɵelement(1, "mat-spinner", 31);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 2, "kd.content-lake-upload.loading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 4, "kd.content-lake-upload.ingesting-into-content-lake"));
} }
function ContentLakeUploadComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 27);
    i0.ɵɵtext(1, "autorenew");
    i0.ɵɵelementEnd();
} }
function ContentLakeUploadComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon");
    i0.ɵɵtext(1, "cloud_upload");
    i0.ɵɵelementEnd();
} }
function normalizeFolderPath(path) {
    return path.replace(/\/+$/, '') || '/';
}
function parentFolderPath(path) {
    const normalized = normalizeFolderPath(path);
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length <= 1) {
        return null;
    }
    return `/${parts.slice(0, -1).join('/')}`;
}
/** Parent folder + partial segment when the user is typing after `/`. */
function getPathCompletionContext(path) {
    const trimmed = path.trim();
    if (!trimmed) {
        return null;
    }
    const endsWithSlash = trimmed.endsWith('/');
    const lastSlash = trimmed.lastIndexOf('/');
    if (lastSlash < 0) {
        return null;
    }
    if (!endsWithSlash && lastSlash === 0) {
        return null;
    }
    const parentRaw = trimmed.slice(0, lastSlash);
    const parentPath = normalizeFolderPath(parentRaw || '/');
    const partial = trimmed.slice(lastSlash + 1);
    return { parentPath, partial };
}
export class ContentLakeUploadComponent {
    destroyRef = inject(DestroyRef);
    translate = inject(TranslateService);
    dialogRef = inject((MatDialogRef));
    importService = inject(DocumentImportService);
    ingestService = inject(ContentLakeIngestService);
    kdClient = inject(KdClientService);
    browseService = inject(BrowseService);
    router = inject(Router);
    snackBar = inject(MatSnackBar);
    fileInput = viewChild('fileInput', ...(ngDevMode ? [{ debugName: "fileInput" }] : []));
    folderAutocompleteTrigger = viewChild(MatAutocompleteTrigger, ...(ngDevMode ? [{ debugName: "folderAutocompleteTrigger" }] : []));
    folderSuggestionsRequestId = 0;
    duplicateCheckRequestId = 0;
    /** Ignore one input event matching this value (autocomplete sync after selection). */
    ignorePathInputValue = null;
    parentPath = signal('/default-domain', ...(ngDevMode ? [{ debugName: "parentPath" }] : []));
    filteredFolderOptions = signal([], ...(ngDevMode ? [{ debugName: "filteredFolderOptions" }] : []));
    loadingSubfolders = signal(false, ...(ngDevMode ? [{ debugName: "loadingSubfolders" }] : []));
    folderBrowseError = signal(null, ...(ngDevMode ? [{ debugName: "folderBrowseError" }] : []));
    selectedFiles = signal([], ...(ngDevMode ? [{ debugName: "selectedFiles" }] : []));
    phase = signal('idle', ...(ngDevMode ? [{ debugName: "phase" }] : []));
    statusMessage = signal(null, ...(ngDevMode ? [{ debugName: "statusMessage" }] : []));
    errorMessage = signal(null, ...(ngDevMode ? [{ debugName: "errorMessage" }] : []));
    uploadedDocuments = signal([], ...(ngDevMode ? [{ debugName: "uploadedDocuments" }] : []));
    ingestProcessedCount = signal(0, ...(ngDevMode ? [{ debugName: "ingestProcessedCount" }] : []));
    duplicateMatches = signal([], ...(ngDevMode ? [{ debugName: "duplicateMatches" }] : []));
    checkingDuplicates = signal(false, ...(ngDevMode ? [{ debugName: "checkingDuplicates" }] : []));
    onParentPathUserInput(event) {
        const path = event.target.value;
        if (this.ignorePathInputValue === path) {
            this.ignorePathInputValue = null;
            return;
        }
        this.ignorePathInputValue = null;
        if (path === this.parentPath()) {
            return;
        }
        this.parentPath.set(path);
        this.refreshFolderSuggestions(path);
        this.refreshDuplicateCheck();
    }
    onFolderOptionSelected(event) {
        const path = event.option.value;
        this.ignorePathInputValue = path;
        this.cancelFolderSuggestionsRequest();
        this.parentPath.set(path);
        this.clearFolderSuggestions();
        this.folderAutocompleteTrigger()?.closePanel();
        this.refreshDuplicateCheck();
    }
    goUpOneFolderLevel() {
        const parent = parentFolderPath(this.parentPath());
        if (!parent) {
            return;
        }
        this.cancelFolderSuggestionsRequest();
        this.parentPath.set(parent);
        this.clearFolderSuggestions();
        this.folderAutocompleteTrigger()?.closePanel();
        this.refreshDuplicateCheck();
    }
    canGoUpOneFolderLevel() {
        return parentFolderPath(this.parentPath()) !== null;
    }
    folderBreadcrumb() {
        const parts = normalizeFolderPath(this.parentPath()).split('/').filter(Boolean);
        return parts.length === 0
            ? '/'
            : parts
                .map((segment) => {
                if (segment === 'default-domain') {
                    return 'Domain';
                }
                if (segment === 'workspaces') {
                    return 'Workspaces';
                }
                return decodeURIComponent(segment);
            })
                .join(' › ');
    }
    onFilesSelected(event) {
        const input = event.target;
        const files = input.files ? Array.from(input.files) : [];
        this.selectedFiles.set(files);
        this.errorMessage.set(null);
        this.duplicateMatches.set([]);
        if (files.length > 0) {
            this.statusMessage.set(files.length === 1
                ? `Selected "${files[0].name}".`
                : this.translate.instant(files.length === 1
                    ? 'kd.content-lake-upload.selected-one'
                    : 'kd.content-lake-upload.selected-many', { count: files.length }));
            this.refreshDuplicateCheck();
        }
    }
    clearSelection() {
        this.selectedFiles.set([]);
        this.statusMessage.set(null);
        this.errorMessage.set(null);
        this.duplicateMatches.set([]);
        const input = this.fileInput()?.nativeElement;
        if (input) {
            input.value = '';
        }
    }
    uploadToContentLake() {
        const files = this.selectedFiles();
        const parentPath = this.parentPath().trim();
        if (files.length === 0 ||
            !parentPath ||
            this.phase() === 'uploading' ||
            this.phase() === 'ingesting' ||
            this.duplicateMatches().length > 0) {
            return;
        }
        this.phase.set('uploading');
        this.errorMessage.set(null);
        this.uploadedDocuments.set([]);
        this.ingestProcessedCount.set(0);
        this.statusMessage.set(this.translate.instant('kd.message.uploading-to-nuxeo'));
        this.importService
            .importFiles(parentPath, files)
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((documents) => {
            const uploads = documents.map((doc) => this.toUploadedDocument(doc));
            this.uploadedDocuments.set(uploads);
            this.phase.set('ingesting');
            this.statusMessage.set(this.translate.instant('kd.message.sending-documents-to-content-lake'));
            return this.ingestService.startIngest(uploads.map((doc) => doc.uid));
        }), switchMap((command) => this.ingestService.waitUntilComplete(command.commandId)), switchMap((status) => {
            const uids = this.uploadedDocuments().map((doc) => doc.uid);
            return this.ingestService.markIngested(uids).pipe(map(() => status));
        }))
            .subscribe({
            next: (status) => {
                this.ingestProcessedCount.set(status.processed);
                if (status.error || status.errorCount > 0) {
                    const message = this.translate.instant('kd.content-lake-upload.ingest-finished-with-errors', { count: status.errorCount });
                    this.phase.set('error');
                    this.errorMessage.set(message);
                    this.statusMessage.set(null);
                    this.showFailureToast(message);
                    return;
                }
                const count = status.processed || this.uploadedDocuments().length;
                const message = this.translate.instant(count === 1
                    ? 'kd.content-lake-upload.ingested-one'
                    : 'kd.content-lake-upload.ingested-many', { count });
                this.phase.set('complete');
                this.statusMessage.set(message);
                this.showSuccessToast(message);
                this.dialogRef.close({ uploadedDocuments: this.uploadedDocuments() });
            },
            error: (err) => {
                const message = err.message || this.translate.instant('kd.content-lake-upload.upload-or-ingest-failed');
                this.phase.set('error');
                this.errorMessage.set(message);
                this.statusMessage.set(null);
                this.showFailureToast(message);
            },
        });
    }
    close() {
        if (!this.isBusy()) {
            this.dialogRef.close();
        }
    }
    openDocument(uid) {
        this.dialogRef.close();
        void this.router.navigateByUrl(`/doc/${uid}`);
    }
    isBusy() {
        const current = this.phase();
        return current === 'uploading' || current === 'ingesting';
    }
    toUploadedDocument(doc) {
        const dcTitle = doc.properties?.['dc:title'];
        const title = (typeof doc.title === 'string' && doc.title.trim()) ||
            (typeof dcTitle === 'string' && dcTitle.trim()) ||
            doc.uid;
        return {
            uid: doc.uid,
            title,
            path: doc.path,
        };
    }
    showSuccessToast(message) {
        this.snackBar.open(message, this.translate.instant('common.ok'), { duration: 5000 });
    }
    showFailureToast(message) {
        this.snackBar.open(message, this.translate.instant('common.dismiss'), { duration: 7000 });
    }
    refreshFolderSuggestions(path) {
        const context = getPathCompletionContext(path);
        if (!context) {
            this.clearFolderSuggestions();
            return;
        }
        this.loadSubfolderOptions(context.parentPath, context.partial);
    }
    cancelFolderSuggestionsRequest() {
        this.folderSuggestionsRequestId += 1;
    }
    clearFolderSuggestions() {
        this.filteredFolderOptions.set([]);
        this.folderBrowseError.set(null);
        this.loadingSubfolders.set(false);
    }
    loadSubfolderOptions(parentPath, partial) {
        const normalized = normalizeFolderPath(parentPath);
        if (!normalized) {
            this.filteredFolderOptions.set([]);
            this.folderBrowseError.set(this.translate.instant('kd.message.enter-a-nuxeo-folder-path'));
            return;
        }
        const requestId = this.folderSuggestionsRequestId + 1;
        this.folderSuggestionsRequestId = requestId;
        this.loadingSubfolders.set(true);
        this.folderBrowseError.set(null);
        this.browseService
            .getByPath(normalized)
            .pipe(takeUntilDestroyed(this.destroyRef), switchMap((doc) => {
            if (!isFolderishDocument(doc)) {
                return of({ entries: [] });
            }
            return this.browseService.getChildren(normalized, 200, 0);
        }), catchError(() => of(null)))
            .subscribe({
            next: (list) => {
                if (requestId !== this.folderSuggestionsRequestId) {
                    return;
                }
                this.loadingSubfolders.set(false);
                if (!list) {
                    this.filteredFolderOptions.set([]);
                    this.folderBrowseError.set(this.translate.instant('kd.message.could-not-load-subfolders-for-this-path'));
                    return;
                }
                const options = (list.entries ?? [])
                    .filter((doc) => isFolderishDocument(doc) && doc.path)
                    .map((doc) => ({
                    path: normalizeFolderPath(doc.path),
                    title: doc.title?.trim() || doc.path.split('/').pop() || doc.path,
                }))
                    .sort((left, right) => left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }));
                const filtered = this.filterFolderOptions(options, partial);
                this.filteredFolderOptions.set(filtered);
                if (options.length === 0) {
                    this.folderBrowseError.set(this.translate.instant('kd.message.no-subfolders-here-upload-into-this-folder'));
                }
                else if (filtered.length > 0) {
                    queueMicrotask(() => {
                        if (requestId === this.folderSuggestionsRequestId) {
                            this.folderAutocompleteTrigger()?.openPanel();
                        }
                    });
                }
            },
        });
    }
    filterFolderOptions(options, partial) {
        const needle = partial.trim().toLowerCase();
        if (!needle) {
            return options;
        }
        return options.filter((option) => {
            const segment = option.path.split('/').pop()?.toLowerCase() ?? '';
            return option.title.toLowerCase().startsWith(needle) || segment.startsWith(needle);
        });
    }
    refreshDuplicateCheck() {
        const files = this.selectedFiles();
        if (files.length === 0) {
            this.duplicateCheckRequestId += 1;
            this.duplicateMatches.set([]);
            this.checkingDuplicates.set(false);
            return;
        }
        const requestId = this.duplicateCheckRequestId + 1;
        this.duplicateCheckRequestId = requestId;
        this.checkingDuplicates.set(true);
        this.kdClient
            .listIngestSourceIds()
            .pipe(switchMap((sourceIds) => this.ingestService.findDuplicates(files, sourceIds)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (matches) => {
                if (requestId !== this.duplicateCheckRequestId) {
                    return;
                }
                this.duplicateMatches.set(matches);
                this.checkingDuplicates.set(false);
            },
            error: () => {
                if (requestId !== this.duplicateCheckRequestId) {
                    return;
                }
                this.duplicateMatches.set([]);
                this.checkingDuplicates.set(false);
            },
        });
    }
    static ɵfac = function ContentLakeUploadComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContentLakeUploadComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ContentLakeUploadComponent, selectors: [["lib-content-lake-upload"]], viewQuery: function ContentLakeUploadComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.fileInput, _c0, 5);
            i0.ɵɵviewQuerySignal(ctx.folderAutocompleteTrigger, MatAutocompleteTrigger, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, decls: 54, vars: 46, consts: [["folderAuto", "matAutocomplete"], ["fileInput", ""], ["mat-dialog-title", ""], [1, "kd-content-lake-upload"], [1, "kd-muted", "kd-content-lake-upload__intro"], [1, "kd-content-lake-upload__path-row"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "kd-content-lake-upload__field"], ["matInput", "", "placeholder", "/default-domain/workspaces/MyWorkspace", 3, "input", "ngModel", "matAutocomplete", "disabled"], ["matSuffix", "", "diameter", "18"], ["autoActiveFirstOption", "", 3, "optionSelected"], [3, "value"], ["type", "button", "mat-icon-button", "", 1, "kd-content-lake-upload__up-btn", 3, "click", "matTooltip", "disabled"], [1, "kd-content-lake-upload__breadcrumb"], [1, "kd-content-lake-upload__folder-hint"], [1, "kd-content-lake-upload__picker"], ["type", "file", "hidden", "", "multiple", "", 3, "change", "disabled"], [1, "kd-content-lake-upload__picker-label"], [1, "kd-content-lake-upload__files"], ["type", "button", "mat-stroked-button", "", 1, "kd-content-lake-upload__clear"], [1, "kd-content-lake-upload__status"], [1, "kd-content-lake-upload__duplicates"], [1, "kd-content-lake-upload__error"], [1, "kd-content-lake-upload__results"], [1, "kd-content-lake-upload__progress"], ["align", "end"], ["type", "button", "mat-button", "", 3, "click", "disabled"], ["type", "button", "mat-flat-button", "", "color", "primary", 3, "click", "disabled"], [1, "kd-spinning"], ["type", "button", "mat-stroked-button", "", 1, "kd-content-lake-upload__clear", 3, "click"], ["type", "button", 1, "kd-content-lake-upload__doc-link", 3, "click"], [1, "kd-content-lake-upload__doc-meta"], ["diameter", "18"]], template: function ContentLakeUploadComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "h2", 2);
            i0.ɵɵtext(1);
            i0.ɵɵpipe(2, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "mat-dialog-content", 3)(4, "p", 4);
            i0.ɵɵtext(5);
            i0.ɵɵpipe(6, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 5)(8, "mat-form-field", 6)(9, "mat-label");
            i0.ɵɵtext(10);
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "input", 7);
            i0.ɵɵlistener("input", function ContentLakeUploadComponent_Template_input_input_12_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onParentPathUserInput($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(13, ContentLakeUploadComponent_Conditional_13_Template, 2, 3, "mat-spinner", 8);
            i0.ɵɵelementStart(14, "mat-autocomplete", 9, 0);
            i0.ɵɵlistener("optionSelected", function ContentLakeUploadComponent_Template_mat_autocomplete_optionSelected_14_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onFolderOptionSelected($event)); });
            i0.ɵɵrepeaterCreate(16, ContentLakeUploadComponent_For_17_Template, 2, 2, "mat-option", 10, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-hint");
            i0.ɵɵtext(19);
            i0.ɵɵpipe(20, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "button", 11);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵlistener("click", function ContentLakeUploadComponent_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.goUpOneFolderLevel()); });
            i0.ɵɵelementStart(24, "mat-icon");
            i0.ɵɵtext(25, "arrow_upward");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(26, "p", 12);
            i0.ɵɵtext(27);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(28, ContentLakeUploadComponent_Conditional_28_Template, 2, 1, "p", 13);
            i0.ɵɵelementStart(29, "label", 14)(30, "input", 15, 1);
            i0.ɵɵlistener("change", function ContentLakeUploadComponent_Template_input_change_30_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onFilesSelected($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "span", 16)(33, "mat-icon");
            i0.ɵɵtext(34, "upload_file");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(35);
            i0.ɵɵpipe(36, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(37, ContentLakeUploadComponent_Conditional_37_Template, 3, 0, "ul", 17);
            i0.ɵɵconditionalCreate(38, ContentLakeUploadComponent_Conditional_38_Template, 3, 3, "button", 18);
            i0.ɵɵconditionalCreate(39, ContentLakeUploadComponent_Conditional_39_Template, 3, 3, "p", 19);
            i0.ɵɵconditionalCreate(40, ContentLakeUploadComponent_Conditional_40_Template, 7, 3, "div", 20);
            i0.ɵɵconditionalCreate(41, ContentLakeUploadComponent_Conditional_41_Template, 2, 1, "p", 19);
            i0.ɵɵconditionalCreate(42, ContentLakeUploadComponent_Conditional_42_Template, 2, 1, "p", 21);
            i0.ɵɵconditionalCreate(43, ContentLakeUploadComponent_Conditional_43_Template, 3, 0, "ul", 22);
            i0.ɵɵconditionalCreate(44, ContentLakeUploadComponent_Conditional_44_Template, 6, 6, "div", 23);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "mat-dialog-actions", 24)(46, "button", 25);
            i0.ɵɵlistener("click", function ContentLakeUploadComponent_Template_button_click_46_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.close()); });
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "button", 26);
            i0.ɵɵlistener("click", function ContentLakeUploadComponent_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.uploadToContentLake()); });
            i0.ɵɵconditionalCreate(50, ContentLakeUploadComponent_Conditional_50_Template, 2, 0, "mat-icon", 27)(51, ContentLakeUploadComponent_Conditional_51_Template, 2, 0, "mat-icon");
            i0.ɵɵtext(52);
            i0.ɵɵpipe(53, "translate");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            const folderAuto_r10 = i0.ɵɵreference(15);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 28, "kd.content-lake-upload.upload-to-content-lake"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 30, "kd.content-lake-upload.files-are-uploaded-to-nuxeo-first"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 32, "kd.content-lake-upload.nuxeo-folder-path"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.parentPath())("matAutocomplete", folderAuto_r10)("disabled", ctx.isBusy());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loadingSubfolders() ? 13 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.filteredFolderOptions());
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 34, "kd.content-lake-upload.type-to-browse-subfolders"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(22, 36, "kd.content-lake-upload.up-one-folder-level"))("disabled", ctx.isBusy() || !ctx.canGoUpOneFolderLevel());
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(23, 38, "kd.content-lake-upload.up-one-folder-level"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.folderBreadcrumb());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.folderBrowseError() ? 28 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.isBusy());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(36, 40, "kd.content-lake-upload.choose-file-many"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.selectedFiles().length > 0 ? 37 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.selectedFiles().length > 0 && !ctx.isBusy() ? 38 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.checkingDuplicates() ? 39 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.duplicateMatches().length > 0 ? 40 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.statusMessage() ? 41 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorMessage() ? 42 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.uploadedDocuments().length > 0 ? 43 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.phase() === "ingesting" ? 44 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.isBusy());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(48, 42, "kd.content-lake-upload.close"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.selectedFiles().length === 0 || ctx.isBusy() || !ctx.parentPath().trim() || ctx.checkingDuplicates() || ctx.duplicateMatches().length > 0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isBusy() ? 50 : 51);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(53, 44, "knowledge-discovery.content-lake-upload.upload"), " ");
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatDialogModule, i2.MatDialogTitle, i2.MatDialogActions, i2.MatDialogContent, MatButtonModule, i3.MatButton, i3.MatIconButton, MatFormFieldModule, i4.MatFormField, i4.MatLabel, i4.MatHint, i4.MatSuffix, MatIconModule, i5.MatIcon, MatAutocompleteModule, i6.MatAutocomplete, i7.MatOption, i6.MatAutocompleteTrigger, MatInputModule, i8.MatInput, MatProgressSpinnerModule, i9.MatProgressSpinner, MatTooltipModule, i10.MatTooltip, TranslatePipe], styles: [".kd-content-lake-upload[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: min(480px, 90vw);\n  padding-top: 4px;\n}\n\n.kd-muted[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 12.5px;\n  line-height: 1.5;\n}\n\n.kd-content-lake-upload__intro[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n}\n\n.kd-content-lake-upload__path-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n}\n\n.kd-content-lake-upload__field[_ngcontent-%COMP%] {\n  flex: 1;\n  width: 100%;\n  margin-bottom: 4px;\n}\n\n.kd-content-lake-upload__up-btn[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  flex-shrink: 0;\n}\n\n.kd-content-lake-upload__breadcrumb[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-content-lake-upload__folder-hint[_ngcontent-%COMP%] {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  line-height: 1.45;\n}\n\n.kd-content-lake-upload__picker[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n}\n\n.kd-content-lake-upload__picker-label[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 12px;\n  border: 1px dashed var(--mat-sys-outline-variant, #c5c9d2);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 12.5px;\n  color: var(--mat-sys-primary, #00639b);\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f5f7fa);\n  }\n}\n\n.kd-content-lake-upload__files[_ngcontent-%COMP%] {\n  margin: 0 0 10px;\n  padding-left: 18px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-content-lake-upload__clear[_ngcontent-%COMP%] {\n  align-self: flex-start;\n  margin-bottom: 8px;\n}\n\n.kd-content-lake-upload__duplicates[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  font-size: 12px;\n\n  ul {\n    margin: 8px 0 0;\n    padding-left: 18px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  }\n\n  li {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n  }\n}\n\n.kd-content-lake-upload__status[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-content-lake-upload__error[_ngcontent-%COMP%] {\n  margin: 8px 0 0;\n  font-size: 12.5px;\n  color: var(--mat-sys-error, #b3261e);\n  line-height: 1.45;\n}\n\n.kd-content-lake-upload__results[_ngcontent-%COMP%] {\n  margin: 10px 0 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.kd-content-lake-upload__doc-link[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  color: var(--mat-sys-primary, #00639b);\n  font-size: 12.5px;\n  font-weight: 600;\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible {\n    text-decoration: underline;\n    outline: none;\n  }\n}\n\n.kd-content-lake-upload__doc-meta[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 2px;\n  font-size: 11.5px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  word-break: break-all;\n}\n\n.kd-content-lake-upload__progress[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-spinning[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_kd-spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_kd-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentLakeUploadComponent, [{
        type: Component,
        args: [{ selector: 'lib-content-lake-upload', standalone: true, imports: [
                    TranslatePipe,
                    FormsModule,
                    MatDialogModule,
                    MatButtonModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatAutocompleteModule,
                    MatInputModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                ], template: "<h2 mat-dialog-title>{{ 'kd.content-lake-upload.upload-to-content-lake' | translate }}</h2>\n\n<mat-dialog-content class=\"kd-content-lake-upload\">\n  <p class=\"kd-muted kd-content-lake-upload__intro\">\n    {{ 'kd.content-lake-upload.files-are-uploaded-to-nuxeo-first' | translate }}\n  </p>\n\n  <div class=\"kd-content-lake-upload__path-row\">\n    <mat-form-field\n      class=\"kd-content-lake-upload__field\"\n      appearance=\"outline\"\n      subscriptSizing=\"dynamic\"\n    >\n      <mat-label>{{ 'kd.content-lake-upload.nuxeo-folder-path' | translate }}</mat-label>\n      <input\n        matInput\n        [ngModel]=\"parentPath()\"\n        (input)=\"onParentPathUserInput($event)\"\n        [matAutocomplete]=\"folderAuto\"\n        [disabled]=\"isBusy()\"\n        placeholder=\"/default-domain/workspaces/MyWorkspace\"\n      />\n      @if (loadingSubfolders()) {\n        <mat-spinner\n          matSuffix\n          diameter=\"18\"\n          [attr.aria-label]=\"'kd.content-lake-upload.loading' | translate\"\n        />\n      }\n      <mat-autocomplete\n        #folderAuto=\"matAutocomplete\"\n        autoActiveFirstOption\n        (optionSelected)=\"onFolderOptionSelected($event)\"\n      >\n        @for (option of filteredFolderOptions(); track option.path) {\n          <mat-option [value]=\"option.path\">{{ option.title }}</mat-option>\n        }\n      </mat-autocomplete>\n      <mat-hint>{{ 'kd.content-lake-upload.type-to-browse-subfolders' | translate }}</mat-hint>\n    </mat-form-field>\n    <button\n      type=\"button\"\n      mat-icon-button\n      class=\"kd-content-lake-upload__up-btn\"\n      [matTooltip]=\"'kd.content-lake-upload.up-one-folder-level' | translate\"\n      [disabled]=\"isBusy() || !canGoUpOneFolderLevel()\"\n      (click)=\"goUpOneFolderLevel()\"\n      [attr.aria-label]=\"'kd.content-lake-upload.up-one-folder-level' | translate\"\n    >\n      <mat-icon>arrow_upward</mat-icon>\n    </button>\n  </div>\n\n  <p class=\"kd-content-lake-upload__breadcrumb\">{{ folderBreadcrumb() }}</p>\n\n  @if (folderBrowseError()) {\n    <p class=\"kd-content-lake-upload__folder-hint\">{{ folderBrowseError() }}</p>\n  }\n\n  <label class=\"kd-content-lake-upload__picker\">\n    <input\n      #fileInput\n      type=\"file\"\n      hidden\n      multiple\n      [disabled]=\"isBusy()\"\n      (change)=\"onFilesSelected($event)\"\n    />\n    <span class=\"kd-content-lake-upload__picker-label\">\n      <mat-icon>upload_file</mat-icon>\n      <!-- Always plural: the input carries `multiple`, so several files can be chosen. -->\n      {{ 'kd.content-lake-upload.choose-file-many' | translate }}\n    </span>\n  </label>\n\n  @if (selectedFiles().length > 0) {\n    <ul class=\"kd-content-lake-upload__files\">\n      @for (file of selectedFiles(); track file.name + file.size) {\n        <li>{{ file.name }}</li>\n      }\n    </ul>\n  }\n\n  @if (selectedFiles().length > 0 && !isBusy()) {\n    <button\n      type=\"button\"\n      mat-stroked-button\n      class=\"kd-content-lake-upload__clear\"\n      (click)=\"clearSelection()\"\n    >\n      {{ 'kd.content-lake-upload.clear' | translate }}\n    </button>\n  }\n\n  @if (checkingDuplicates()) {\n    <p class=\"kd-content-lake-upload__status\">\n      {{ 'kd.content-lake-upload.checking-for-existing-content-lake-copies' | translate }}\n    </p>\n  }\n\n  @if (duplicateMatches().length > 0) {\n    <div class=\"kd-content-lake-upload__duplicates\">\n      <p class=\"kd-content-lake-upload__error\">\n        {{ 'kd.content-lake-upload.these-files-match-documents-already-indexed' | translate }}\n      </p>\n      <ul>\n        @for (match of duplicateMatches(); track match.fileName) {\n          <li>\n            <strong>{{ match.fileName }}</strong>\n            <button\n              type=\"button\"\n              class=\"kd-content-lake-upload__doc-link\"\n              (click)=\"openDocument(match.existingUid)\"\n            >\n              {{ 'kd.content-lake-upload.open-existing-document' | translate }}\n            </button>\n            <span class=\"kd-content-lake-upload__doc-meta\">{{ match.existingPath }}</span>\n          </li>\n        }\n      </ul>\n    </div>\n  }\n\n  @if (statusMessage()) {\n    <p class=\"kd-content-lake-upload__status\">{{ statusMessage() }}</p>\n  }\n\n  @if (errorMessage()) {\n    <p class=\"kd-content-lake-upload__error\">{{ errorMessage() }}</p>\n  }\n\n  @if (uploadedDocuments().length > 0) {\n    <ul class=\"kd-content-lake-upload__results\">\n      @for (doc of uploadedDocuments(); track doc.uid) {\n        <li>\n          <button\n            type=\"button\"\n            class=\"kd-content-lake-upload__doc-link\"\n            (click)=\"openDocument(doc.uid)\"\n          >\n            {{ doc.title }}\n          </button>\n          <span class=\"kd-content-lake-upload__doc-meta\">{{ doc.path }}</span>\n        </li>\n      }\n    </ul>\n  }\n\n  @if (phase() === 'ingesting') {\n    <div class=\"kd-content-lake-upload__progress\">\n      <mat-spinner diameter=\"18\" [attr.aria-label]=\"'kd.content-lake-upload.loading' | translate\" />\n      <span>{{ 'kd.content-lake-upload.ingesting-into-content-lake' | translate }}</span>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button type=\"button\" mat-button [disabled]=\"isBusy()\" (click)=\"close()\">\n    {{ 'kd.content-lake-upload.close' | translate }}\n  </button>\n  <button\n    type=\"button\"\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"\n      selectedFiles().length === 0 ||\n      isBusy() ||\n      !parentPath().trim() ||\n      checkingDuplicates() ||\n      duplicateMatches().length > 0\n    \"\n    (click)=\"uploadToContentLake()\"\n  >\n    @if (isBusy()) {\n      <mat-icon class=\"kd-spinning\">autorenew</mat-icon>\n    } @else {\n      <mat-icon>cloud_upload</mat-icon>\n    }\n    {{ 'knowledge-discovery.content-lake-upload.upload' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [".kd-content-lake-upload {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: min(480px, 90vw);\n  padding-top: 4px;\n}\n\n.kd-muted {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 12.5px;\n  line-height: 1.5;\n}\n\n.kd-content-lake-upload__intro {\n  margin: 0 0 12px;\n}\n\n.kd-content-lake-upload__path-row {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n}\n\n.kd-content-lake-upload__field {\n  flex: 1;\n  width: 100%;\n  margin-bottom: 4px;\n}\n\n.kd-content-lake-upload__up-btn {\n  margin-top: 4px;\n  flex-shrink: 0;\n}\n\n.kd-content-lake-upload__breadcrumb {\n  margin: 0 0 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #6b7280);\n}\n\n.kd-content-lake-upload__folder-hint {\n  margin: -4px 0 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  line-height: 1.45;\n}\n\n.kd-content-lake-upload__picker {\n  display: block;\n  margin-bottom: 8px;\n}\n\n.kd-content-lake-upload__picker-label {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 12px;\n  border: 1px dashed var(--mat-sys-outline-variant, #c5c9d2);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 12.5px;\n  color: var(--mat-sys-primary, #00639b);\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f5f7fa);\n  }\n}\n\n.kd-content-lake-upload__files {\n  margin: 0 0 10px;\n  padding-left: 18px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-content-lake-upload__clear {\n  align-self: flex-start;\n  margin-bottom: 8px;\n}\n\n.kd-content-lake-upload__duplicates {\n  margin: 8px 0;\n  font-size: 12px;\n\n  ul {\n    margin: 8px 0 0;\n    padding-left: 18px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  }\n\n  li {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n  }\n}\n\n.kd-content-lake-upload__status {\n  margin: 0;\n  font-size: 12.5px;\n  color: var(--mat-sys-on-surface-variant, #4b5563);\n}\n\n.kd-content-lake-upload__error {\n  margin: 8px 0 0;\n  font-size: 12.5px;\n  color: var(--mat-sys-error, #b3261e);\n  line-height: 1.45;\n}\n\n.kd-content-lake-upload__results {\n  margin: 10px 0 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.kd-content-lake-upload__doc-link {\n  display: block;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  color: var(--mat-sys-primary, #00639b);\n  font-size: 12.5px;\n  font-weight: 600;\n  cursor: pointer;\n\n  &:hover,\n  &:focus-visible {\n    text-decoration: underline;\n    outline: none;\n  }\n}\n\n.kd-content-lake-upload__doc-meta {\n  display: block;\n  margin-top: 2px;\n  font-size: 11.5px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  word-break: break-all;\n}\n\n.kd-content-lake-upload__progress {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 8px;\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n}\n\n.kd-spinning {\n  animation: kd-spin 1s linear infinite;\n}\n\n@keyframes kd-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n"] }]
    }], null, { fileInput: [{ type: i0.ViewChild, args: ['fileInput', { isSignal: true }] }], folderAutocompleteTrigger: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatAutocompleteTrigger), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ContentLakeUploadComponent, { className: "ContentLakeUploadComponent", filePath: "libs/features/knowledge-discovery/src/lib/content-lake-upload/content-lake-upload.ts", lineNumber: 98 }); })();
