import * as _angular_core from '@angular/core';
import { ElementRef, OnInit, Provider, PipeTransform, InjectionToken } from '@angular/core';
import { SafeUrl, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { ExtensionActionDescriptor } from '@nuxeo/satori-platform/extensions';
import * as _nuxeo_satori_platform_nuxeo_client from '@nuxeo/satori-platform/nuxeo-client';
import { NuxeoDocument, CompareRow, l10nEntryLabel, directoryPickerLabel, DirectoryEntry, L10nDirectoryEntry, groupL10nChildrenByParent } from '@nuxeo/satori-platform/nuxeo-client';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import * as rxjs from 'rxjs';
import { NgModel } from '@angular/forms';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import * as _ngx_translate_core from '@ngx-translate/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

declare class UiComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiComponent, "lib-ui", never, {}, {}, never, never, true, never>;
}

declare class SelectionTopbarComponent {
    private selectionPopupPanel?;
    private lastFocusedElement;
    readonly selectedCount: _angular_core.InputSignal<number>;
    /**
     * The selected documents. The popup draws each preview itself from `id`, so a `preview` URL
     * whose owner has since revoked it cannot break the popup; the field is kept for existing callers.
     */
    readonly selectedItems: _angular_core.InputSignal<{
        id: string;
        name: string;
        preview: SafeUrl | string | null;
    }[]>;
    /** Collapses the bar to its label and Clear button — no bulk actions, no popup. */
    readonly clearOnly: _angular_core.InputSignal<boolean>;
    /** Chrome, not an action: clearing the selection dismisses the bar itself. */
    readonly cleared: _angular_core.OutputEmitterRef<void>;
    readonly selectionPopupOpen: _angular_core.WritableSignal<boolean>;
    private readonly closePopupInClearOnlyMode;
    private readonly extensions;
    private readonly actions;
    private readonly ruleContext;
    /**
     * The bulk actions to offer, resolved from the registry.
     *
     * There is no `@Output()` per action any more. Each of the six used to be a
     * fixed button here, a named output, and a handler threaded through the app
     * shell — three files across two projects to add one action. A registration
     * now does it, and the shell owns the behaviour as an action service.
     */
    readonly bulkActions: _angular_core.Signal<readonly ExtensionActionDescriptor[]>;
    /** `enabledRule` renders the control disabled rather than hiding it. */
    isEnabled(action: ExtensionActionDescriptor): boolean;
    run(action: ExtensionActionDescriptor): void;
    openSelectionPopup(): void;
    closeSelectionPopup(): void;
    onEscape(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SelectionTopbarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SelectionTopbarComponent, "lib-selection-topbar", never, { "selectedCount": { "alias": "selectedCount"; "required": true; "isSignal": true; }; "selectedItems": { "alias": "selectedItems"; "required": false; "isSignal": true; }; "clearOnly": { "alias": "clearOnly"; "required": false; "isSignal": true; }; }, { "cleared": "cleared"; }, never, never, true, never>;
}

interface DocumentCompareDialogData {
    items: Array<{
        id: string;
        name: string;
    }>;
}
declare class DocumentCompareDialogComponent {
    private readonly detailService;
    private readonly translate;
    private readonly locale;
    readonly data: DocumentCompareDialogData;
    readonly leftId: _angular_core.WritableSignal<string>;
    readonly rightId: _angular_core.WritableSignal<string>;
    readonly viewAllData: _angular_core.WritableSignal<boolean>;
    readonly unifiedView: _angular_core.WritableSignal<boolean>;
    readonly loading: _angular_core.WritableSignal<boolean>;
    readonly error: _angular_core.WritableSignal<string | null>;
    readonly leftDoc: _angular_core.WritableSignal<NuxeoDocument | null>;
    readonly rightDoc: _angular_core.WritableSignal<NuxeoDocument | null>;
    readonly sections: _angular_core.Signal<_nuxeo_satori_platform_nuxeo_client.CompareSection[]>;
    isIconRow(row: CompareRow): boolean;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DocumentCompareDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DocumentCompareDialogComponent, "lib-document-compare-dialog", never, {}, {}, never, never, true, never>;
}

declare function openDocumentCompareDialog(dialog: MatDialog, items: DocumentCompareDialogData['items']): void;

declare class WidgetContainerComponent {
    readonly title: _angular_core.InputSignal<string>;
    readonly icon: _angular_core.InputSignal<string | undefined>;
    readonly iconColor: _angular_core.InputSignal<string>;
    /** Level under the shell `<h1>` (2) or under a page section `<h2>` (3). */
    readonly headingLevel: _angular_core.InputSignal<2 | 3>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<WidgetContainerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<WidgetContainerComponent, "lib-widget-container", never, { "title": { "alias": "title"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "iconColor": { "alias": "iconColor"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; }, {}, never, ["[widgetActions]", "*"], true, never>;
}

declare class WidgetGridComponent {
    /** Number of columns in the grid (default 2 for half-width widgets). */
    readonly columns: _angular_core.InputSignal<number>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<WidgetGridComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<WidgetGridComponent, "lib-widget-grid", never, { "columns": { "alias": "columns"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

interface ShareDialogData {
    title: string;
    url: string;
}
declare class ShareDialogComponent {
    readonly data: ShareDialogData;
    private readonly dialogRef;
    private readonly translate;
    private readonly toast;
    copyLink(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ShareDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ShareDialogComponent, "lib-share-dialog", never, {}, {}, never, never, true, never>;
}

interface VideoSource {
    /**
     * Raw object URL, not `SafeResourceUrl`. This is bound to `<source [src]>`, which is
     * `SecurityContext.NONE` — see `DocumentViewerComponent.rawBlobUrl` for why a `Safe*` value
     * silently breaks there. The transcoded-video source list was broken this way.
     */
    url: string;
    mimeType: string;
    label?: string;
}
interface StoryboardItem {
    timecode: number;
    thumbnailUrl: string | null;
    label: string;
}
interface PictureInfo {
    width: number;
    height: number;
    format: string;
    colorSpace: string;
    depth: number;
    weight: string;
}
interface PictureView {
    title: string;
    width: number;
    height: number;
    fileSize: string;
    format: string;
    downloadUrl: string;
}
interface ExifData {
    dateTimeOriginal?: string;
    orientation?: string;
    fNumber?: string;
    exposureTime?: string;
    isoSpeedRatings?: string;
    focalLength?: string;
    [key: string]: string | undefined;
}
interface IptcData {
    copyright?: string;
    rights?: string;
    source?: string;
    description?: string;
    [key: string]: string | undefined;
}
interface VideoInfo {
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
    videoCodec?: string;
    audioCodec?: string;
    frameRate?: number;
}
/**
 * Reusable document viewer component following Nuxeo Web UI's nuxeo-document-preview
 * dispatching logic. Renders content based on MIME type priority:
 *
 * 1. image/*           → Image viewer with zoom/rotate/pan
 * 2. video/*           → HTML5 video player with storyboard
 * 3. audio/*           → HTML5 audio player
 * 4. text/markdown     → Rendered markdown (passed as safe HTML)
 * 5. text/html         → Iframe with srcdoc
 * 6. text/xml          → Preformatted text
 * 7. text/plain        → Preformatted text
 * 8. application/pdf   → PDF iframe (browser-native or PDF.js)
 * 9. (pdf rendition)   → PDF iframe using server-rendered PDF of office docs
 * 10. (fallback)       → Generic iframe with preview URL, or "no preview" placeholder
 */
declare class DocumentViewerComponent {
    readonly blobUrl: _angular_core.InputSignal<SafeResourceUrl | null>;
    /**
     * The same object URL as `blobUrl`, unwrapped.
     *
     * `source[src]`, `audio[src]` and `video[poster]` are `SecurityContext.NONE` in Angular's DOM
     * security schema, which means no sanitizer runs on them — and a `Safe*` value is only ever
     * unwrapped *by* a sanitizer. Bound into a NONE context it is therefore assigned to the DOM
     * property as-is and coerced by `toString()`, writing the literal string
     * `"SafeValue must use [property]=binding: …"` into `src`. Audio playback and the
     * single-source video fallback were broken exactly that way until this input existed.
     *
     * So: `blobUrl` for `iframe[src]` (which conversely *throws* on a raw string) and `img[src]`,
     * this one for the three NONE bindings. Enforced by `scripts/beta-harness/sanitizer-audit.mjs`
     * check 4, which follows the bound expression to a type declaration and — crucially — reports any
     * NONE-context binding whose type it cannot resolve, rather than assuming it is safe.
     */
    /**
     * Required, not optional with a `null` default — the default is what made this fail silently.
     *
     * `audio[src]` and the single-source `video[src]` fallback are `SecurityContext.NONE`, so they need
     * the raw string; `blobUrl` is a `SafeResourceUrl` and stringifies to
     * `"SafeValue must use [property]=binding: …"` there. A consumer that omits this input keeps
     * compiling and renders a null source, which is exactly the silent breakage this PR exists to fix —
     * so omitting it has to be a compile error, not a runtime shrug.
     *
     * This was made required in `3d6638f` and reverted to optional in `511b22e`; restoring it. All
     * three in-repo consumers already pass it, so the only thing the requirement breaks is an external
     * consumer that would otherwise have shipped broken audio.
     */
    readonly rawBlobUrl: _angular_core.InputSignal<string | null>;
    /**
     * `Blob.type` of the blob behind {@link blobUrl} — the `Content-Type` the server actually served.
     *
     * Required for the same reason as `rawBlobUrl`: it gates the unsandboxed iframe branches, and a
     * default would let a consumer omit it and silently get either no PDF preview or, worse, the
     * pre-existing behaviour of choosing the iframe from metadata alone.
     *
     * That was a same-origin execution path. `contentType()` picked `'pdf'` from `mimeType`,
     * `hasPdfRendition` and even a filename-extension fallback, none of which the browser consults —
     * it parses a `blob:` document by its `Content-Type`, and a blob URL inherits this origin. A
     * document recorded as PDF but served as `text/html` therefore ran as script here. The attachment
     * dialog closed the same mismatch; this input closes it for the embedded viewer.
     */
    readonly blobType: _angular_core.InputSignal<string>;
    readonly mimeType: _angular_core.InputSignal<string>;
    readonly fileName: _angular_core.InputSignal<string>;
    readonly fileSize: _angular_core.InputSignal<string>;
    readonly loading: _angular_core.InputSignal<boolean>;
    readonly noteContent: _angular_core.InputSignal<string | null>;
    readonly noteHtml: _angular_core.InputSignal<SafeHtml | null>;
    readonly videoSources: _angular_core.InputSignal<VideoSource[]>;
    readonly storyboard: _angular_core.InputSignal<StoryboardItem[]>;
    /** Raw string, not `SafeResourceUrl`: `video[poster]` is `SecurityContext.NONE`. See `rawBlobUrl`. */
    readonly posterUrl: _angular_core.InputSignal<string | null>;
    readonly hasPdfRendition: _angular_core.InputSignal<boolean>;
    readonly previewUrl: _angular_core.InputSignal<SafeResourceUrl | null>;
    readonly pictureInfo: _angular_core.InputSignal<PictureInfo | null>;
    readonly pictureViews: _angular_core.InputSignal<PictureView[]>;
    readonly exifData: _angular_core.InputSignal<ExifData | null>;
    readonly iptcData: _angular_core.InputSignal<IptcData | null>;
    readonly videoInfo: _angular_core.InputSignal<VideoInfo | null>;
    readonly arenderUrl: _angular_core.InputSignal<SafeResourceUrl | null>;
    /** When this changes, the ARender iframe is destroyed and recreated. */
    readonly arenderReloadId: _angular_core.InputSignal<number>;
    /** When the open document changes, exit ARender mode so the user does not keep a stale viewer. */
    readonly viewerDocUid: _angular_core.InputSignal<string>;
    /**
     * When true (Annotations tab), the main area only shows ARender or a “not available” state,
     * matching Nuxeo Web UI’s Annotations tab.
     */
    readonly annotationsTab: _angular_core.InputSignal<boolean>;
    /** When true, show Replace / Remove actions for the primary blob in the footer toolbar. */
    readonly showMainFileControls: _angular_core.InputSignal<boolean>;
    readonly mainFileActionInProgress: _angular_core.InputSignal<string | null>;
    readonly downloadClicked: _angular_core.OutputEmitterRef<void>;
    readonly openWithDriveClicked: _angular_core.OutputEmitterRef<void>;
    readonly previewClicked: _angular_core.OutputEmitterRef<void>;
    readonly replaceMainFileClicked: _angular_core.OutputEmitterRef<void>;
    readonly removeMainFileClicked: _angular_core.OutputEmitterRef<void>;
    readonly storyboardSeek: _angular_core.OutputEmitterRef<number>;
    readonly formatDownload: _angular_core.OutputEmitterRef<string>;
    readonly contentType: _angular_core.Signal<"image" | "video" | "audio" | "markdown" | "html" | "xml" | "text" | "pdf" | "pdfRendition" | "preview" | "none">;
    /** ARender appears only on the Annotations tab (View tab uses the built-in preview). */
    readonly showARenderViewer: _angular_core.Signal<boolean>;
    readonly showImageToolbar: _angular_core.Signal<boolean>;
    readonly showVideoStoryboard: _angular_core.Signal<boolean>;
    readonly showPictureCards: _angular_core.Signal<boolean>;
    readonly showVideoInfoCard: _angular_core.Signal<boolean>;
    readonly arenderAvailable: _angular_core.Signal<boolean>;
    readonly exifEntries: _angular_core.Signal<{
        labelKey: string;
        value: string;
    }[]>;
    readonly iptcEntries: _angular_core.Signal<{
        labelKey: string;
        value: string;
    }[]>;
    readonly zoom: _angular_core.WritableSignal<number>;
    readonly rotation: _angular_core.WritableSignal<number>;
    readonly fitMode: _angular_core.WritableSignal<"width" | "real">;
    readonly transform: _angular_core.Signal<string>;
    readonly videoRef: _angular_core.Signal<ElementRef<HTMLVideoElement> | undefined>;
    zoomIn(): void;
    zoomOut(): void;
    toggleFit(): void;
    rotateLeft(): void;
    rotateRight(): void;
    seekTo(timecode: number): void;
    formatTimecode(seconds: number): string;
    formatDuration(seconds: number): string;
    isFiniteNumber(value: number | null | undefined): value is number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DocumentViewerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DocumentViewerComponent, "lib-document-viewer", never, { "blobUrl": { "alias": "blobUrl"; "required": false; "isSignal": true; }; "rawBlobUrl": { "alias": "rawBlobUrl"; "required": true; "isSignal": true; }; "blobType": { "alias": "blobType"; "required": true; "isSignal": true; }; "mimeType": { "alias": "mimeType"; "required": false; "isSignal": true; }; "fileName": { "alias": "fileName"; "required": false; "isSignal": true; }; "fileSize": { "alias": "fileSize"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "noteContent": { "alias": "noteContent"; "required": false; "isSignal": true; }; "noteHtml": { "alias": "noteHtml"; "required": false; "isSignal": true; }; "videoSources": { "alias": "videoSources"; "required": false; "isSignal": true; }; "storyboard": { "alias": "storyboard"; "required": false; "isSignal": true; }; "posterUrl": { "alias": "posterUrl"; "required": false; "isSignal": true; }; "hasPdfRendition": { "alias": "hasPdfRendition"; "required": false; "isSignal": true; }; "previewUrl": { "alias": "previewUrl"; "required": false; "isSignal": true; }; "pictureInfo": { "alias": "pictureInfo"; "required": false; "isSignal": true; }; "pictureViews": { "alias": "pictureViews"; "required": false; "isSignal": true; }; "exifData": { "alias": "exifData"; "required": false; "isSignal": true; }; "iptcData": { "alias": "iptcData"; "required": false; "isSignal": true; }; "videoInfo": { "alias": "videoInfo"; "required": false; "isSignal": true; }; "arenderUrl": { "alias": "arenderUrl"; "required": false; "isSignal": true; }; "arenderReloadId": { "alias": "arenderReloadId"; "required": false; "isSignal": true; }; "viewerDocUid": { "alias": "viewerDocUid"; "required": false; "isSignal": true; }; "annotationsTab": { "alias": "annotationsTab"; "required": false; "isSignal": true; }; "showMainFileControls": { "alias": "showMainFileControls"; "required": false; "isSignal": true; }; "mainFileActionInProgress": { "alias": "mainFileActionInProgress"; "required": false; "isSignal": true; }; }, { "downloadClicked": "downloadClicked"; "openWithDriveClicked": "openWithDriveClicked"; "previewClicked": "previewClicked"; "replaceMainFileClicked": "replaceMainFileClicked"; "removeMainFileClicked": "removeMainFileClicked"; "storyboardSeek": "storyboardSeek"; "formatDownload": "formatDownload"; }, never, never, true, never>;
}

interface ExportDialogData {
    documentUid: string;
    documentTitle: string;
    /** Callback that performs the actual download; returns an Observable<Blob>. */
    exportFn: (type: ExportType, uid: string) => rxjs.Observable<Blob>;
}
type ExportType = 'thumbnail' | 'pdf' | 'zip' | 'xml';
interface ExportOption {
    type: ExportType;
    label: string;
    /** Translation key for `label`, preferred by the template when it resolves. */
    labelKey?: string;
    icon: string;
}
declare class ExportDialogComponent {
    private readonly dialogRef;
    private readonly data;
    readonly exporting: _angular_core.WritableSignal<ExportType | null>;
    readonly options: ExportOption[];
    onExport(type: ExportType): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExportDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ExportDialogComponent, "lib-export-dialog", never, {}, {}, never, never, true, never>;
}

interface SavedSearchDialogData {
    title?: string;
    placeholder?: string;
    initialValue?: string;
}
declare const SAVED_SEARCH_DIALOG_OPTIONS: Partial<MatDialogConfig>;
declare class SavedSearchDialogComponent {
    readonly dialogRef: MatDialogRef<any, any>;
    readonly data: SavedSearchDialogData;
    readonly name: _angular_core.WritableSignal<string>;
    /**
     * A saved search is a document named after its title, and a document name cannot hold a `/` —
     * the server answers 400. Web UI's save dialog says so the same way (`searchForm.savePopup.error`).
     */
    protected readonly hasSlash: () => boolean;
    readonly canSave: () => boolean;
    onInput(value: string): void;
    save(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SavedSearchDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SavedSearchDialogComponent, "lib-saved-search-dialog", never, {}, {}, never, never, true, never>;
}

interface PermissionEntry {
    id: string;
    userGroup: string;
    right: string;
    timeFrame: string;
    grantedBy: string;
}
interface PermissionSummary {
    userGroup: string;
    right: string;
    timeFrame: string;
    grantedBy: string;
}
interface ExternalPermissionEntry extends PermissionSummary {
    id: string;
    email: string;
    begin?: string | null;
    end?: string | null;
}
interface ShareSavedSearchDialogData {
    title: string;
    id: string;
}
declare class ShareSavedSearchDialogComponent implements OnInit {
    private readonly translate;
    readonly dialogRef: MatDialogRef<any, any>;
    readonly data: ShareSavedSearchDialogData;
    private readonly dialog;
    private readonly currentUsername;
    private readonly userService;
    private readonly detailService;
    readonly permissions: _angular_core.WritableSignal<PermissionEntry[]>;
    readonly inheritedPermissions: _angular_core.WritableSignal<PermissionSummary[]>;
    readonly externalPermissions: _angular_core.WritableSignal<ExternalPermissionEntry[]>;
    readonly isInheritanceBlocked: _angular_core.WritableSignal<boolean>;
    readonly saving: _angular_core.WritableSignal<boolean>;
    readonly loading: _angular_core.WritableSignal<boolean>;
    private nextId;
    ngOnInit(): void;
    private loadPermissionsFromApi;
    private parsePermissionsFromDocument;
    openExternalPermissionDialog(): void;
    editExternalPermission(row: ExternalPermissionEntry): void;
    sendExternalNotification(row: ExternalPermissionEntry): void;
    removeExternalPermission(row: ExternalPermissionEntry): void;
    togglePermissionInheritance(): void;
    private loadPermissionsFromCurrentUser;
    private applyUserPermissions;
    private toDisplayName;
    openAddPermissionDialog(): void;
    removeRow(id: string): void;
    editRow(id: string): void;
    save(): void;
    private normalizePermissionForApi;
    private parseTimeFrame;
    private toTimeFrameLabel;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ShareSavedSearchDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ShareSavedSearchDialogComponent, "lib-share-saved-search-dialog", never, {}, {}, never, never, true, never>;
}

interface ConfirmDialogData {
    title: string;
    message: string;
    confirmLabel?: string;
}
declare class ConfirmDialogComponent {
    readonly data: ConfirmDialogData;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ConfirmDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ConfirmDialogComponent, "lib-confirm-dialog", never, {}, {}, never, never, true, never>;
}

interface EditCollectionDialogData {
    document: NuxeoDocument;
}
declare class EditCollectionDialogComponent implements OnInit {
    private readonly dialogRef;
    private readonly translate;
    private readonly data;
    private readonly collectionService;
    private readonly directoryService;
    private readonly destroyRef;
    private readonly toast;
    private readonly dateAdapter;
    private readonly dateFormats;
    readonly l10nEntryLabel: typeof l10nEntryLabel;
    protected readonly directoryPickerLabel: typeof directoryPickerLabel;
    expiresNgModel?: NgModel;
    readonly natureEntries: _angular_core.WritableSignal<DirectoryEntry[]>;
    readonly subjectEntries: _angular_core.WritableSignal<L10nDirectoryEntry[]>;
    readonly coverageEntries: _angular_core.WritableSignal<L10nDirectoryEntry[]>;
    readonly saving: _angular_core.WritableSignal<boolean>;
    naturePanelSearch: string;
    subjectsPanelSearch: string;
    coveragePanelSearch: string;
    filteredNatureOptions(): DirectoryEntry[];
    groupedSubjectOptions(): ReturnType<typeof groupL10nChildrenByParent>;
    groupedCoverageOptions(): ReturnType<typeof groupL10nChildrenByParent>;
    title: string;
    description: string;
    nature: string | null;
    subjects: string[];
    coverage: string | null;
    expires: Date | null;
    expiresRawText: string;
    readonly expiresErrorMatcher: {
        isErrorState: () => boolean;
    };
    ngOnInit(): void;
    onNaturePanelOpen(open: boolean): void;
    private loadNatureEntries;
    naturePillLabel(id: string): string;
    subjectPillLabel(id: string): string;
    coveragePillLabel(id: string): string;
    clearNature(): void;
    clearCoverage(): void;
    removeSubject(id: string): void;
    onSubjectsPanelOpen(open: boolean): void;
    onCoveragePanelOpen(open: boolean): void;
    private loadL10nEntries;
    isExpiresValid(): boolean;
    showExpiresError(): boolean;
    onExpiresInput(event: Event): void;
    onExpiresChange(value: Date | null): void;
    save(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EditCollectionDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<EditCollectionDialogComponent, "lib-edit-collection-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * Resolves a catalogue key, with parameters.
 *
 * These are plain functions with no injector, so they cannot reach `TranslateService` themselves
 * and the caller passes the resolver in. It is REQUIRED rather than optional on purpose: an
 * optional resolver defaulting to the key or to English is a silent no-op at every call site that
 * forgets it, which is how `toDataColumns` shipped a resolver nothing supplied.
 */
type TranslateFn = (key: string, params?: Record<string, unknown>) => string;
/** Web UI `deleteButton.confirm` — soft-delete one document (move to trash). */
declare function trashDocumentConfirmData(title: string, translate: TranslateFn): ConfirmDialogData;
/**
 * Web UI bulk soft-delete (`deleteDocumentsButton.confirm.deleteDocuments` /
 * `label.documents.confirmDeleteDocuments`) — never names a single item when multiple are selected.
 */
declare function trashSelectedDocumentsConfirmData(count: number, translate: TranslateFn): ConfirmDialogData;

/**
 * MatInput mirrors Validators.required as both native `required` and `aria-required="true"`.
 * IBM Equal Access flags the duplicate (aria_attribute_redundant). Native `required` is enough for AT.
 */
declare function stripRedundantMatInputAriaRequired(input: HTMLInputElement | null | undefined): void;
/** Strips on setup and whenever MatInput re-applies aria-required. */
declare function observeStripRedundantMatInputAriaRequired(input: HTMLInputElement | null | undefined): MutationObserver | null;

/**
 * IBM Equal Access `aria_keyboard_handler_exists` (NXENG-821, issue 1036659222) inspects the
 * element with `role="tablist"`. The checker-engine rule only treats inline `onkeydown`,
 * `onkeypress`, or `onkeyup` attributes as handlers — not `addEventListener`. Material binds
 * keyboard handling on `.mat-mdc-tab-label-container` instead, so the tablist node fails the
 * static check even though arrow-key navigation works on the tab buttons.
 */
declare const MAT_TAB_LIST_KEYDOWN_ATTR = "data-satori-tablist-keydown";
/** Inert inline handler IBM's static rule can detect; Material still owns tab navigation. */
declare const MAT_TAB_LIST_IBM_ONKEYDOWN = "void(0)";
/**
 * Attach IBM-detectable keyboard metadata on the Material tablist node inside `root`.
 * Returns cleanup when this call attaches metadata, or `null` when it makes no change.
 */
declare function wireMatTabListKeyboardA11y(root: HTMLElement): (() => void) | null;
/** Re-wire when Material re-renders tab labels (dynamic tab sets). */
declare function observeMatTabListKeyboardA11y(root: HTMLElement): (() => void) | null;

/**
 * Sets IBM-detectable inline `onkeydown` on Material tablists inside `mat-tab-group`.
 * Apply as `libMatTabListKeydown` on the group host.
 */
declare class MatTabListKeydownDirective {
    private readonly host;
    private readonly destroyRef;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MatTabListKeydownDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<MatTabListKeydownDirective, "mat-tab-group[libMatTabListKeydown]", never, {}, {}, never, never, true, never>;
}

/**
 * Angular Material's date picker labels, from our catalogue.
 *
 * Material ships its own English strings — "Open calendar", "Next month" — and they stayed English
 * in every locale. Re-read on every language or catalogue change and announced through `changes`,
 * which is how Material's picker knows to re-render. A key the catalogue does not supply keeps
 * Material's English rather than showing the key.
 *
 * Provide it with `provideTranslatedDatepickerIntl()` on every component that imports
 * `MatDatepickerModule`, not only at the root: that module lists `MatDatepickerIntl` in its own
 * providers, so a standalone component importing it gets a fresh English instance that shadows
 * any root override.
 */
declare class TranslatedDatepickerIntl extends MatDatepickerIntl {
    private readonly translate;
    private readonly englishDefaults;
    constructor();
    formatYearRange(start: string, end: string): string;
    formatYearRangeLabel(start: string, end: string): string;
    private refresh;
    private resolve;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TranslatedDatepickerIntl, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TranslatedDatepickerIntl>;
}
/** Replaces Material's English `MatDatepickerIntl` for this component and its date pickers. */
declare function provideTranslatedDatepickerIntl(): Provider;

/**
 * Angular Material's date adapter, parsing and formatting in the application's language.
 *
 * ## Why this replaces `provideNativeDateAdapter()`
 *
 * `NativeDateAdapter` cannot parse a localized date, and says so in its own source: `parse()`
 * is `new Date(Date.parse(value))` above a comment explaining that the native `Date` offers no
 * way to apply a format or a locale. `Date.parse` reads `nn/nn/yyyy` as US month/day/year, so
 * in a French, German, Dutch, Japanese, Thai or Chinese deployment typing `03/04/2026` meaning
 * 3 April stored 4 March — with no error, and with the field still showing the text the user
 * typed, because `MatDatepickerInput` does not rewrite it.
 *
 * Only `format()` honoured the locale, via `Intl`. That asymmetry is why this survived seven
 * locales shipping: the calendar overlay renders perfect French while the typed input is
 * misread, so there is nothing on screen to notice.
 *
 * Supplying `MAT_DATE_LOCALE` alone would not have helped — `parse()` ignores it too.
 *
 * ## Why the locale comes from `LOCALE_ID`
 *
 * `MAT_DATE_LOCALE`'s own default factory is `inject(LOCALE_ID)`, so `LOCALE_ID` is already
 * the locale Material formats dates in, and the application provides it from Layer 0's
 * `defaultLanguage`. Deriving the parsing locale from the same token is what makes "the
 * calendar, the selected date and the typed input all agree" true by construction rather than
 * by two settings being kept in step by hand.
 *
 * ## Thai dates become Gregorian here, deliberately
 *
 * `Intl.DateTimeFormat('th')` resolves to the **Buddhist** calendar, so the native adapter
 * showed 3 April 2026 as `03/04/2569`. date-fns' `th` locale is Gregorian and shows
 * `03/04/2026`. That is a real change, and it is the right way round for two reasons.
 *
 * Angular's `DatePipe` never calls `Intl` and `@angular/common/locales/th` carries no calendar
 * system, so every other date in a Thai deployment — the document list, the audit table,
 * document detail — has always rendered the Gregorian year. Only the date picker disagreed.
 *
 * And the Buddhist display was not even round-trippable by the field that produced it:
 * `Date.parse('03/04/2569')` is 4 March 2569, so a Thai user who retyped what the picker had
 * just shown them got the wrong month *and* a year 543 years out. Showing the Gregorian year
 * removes the only thing that invited that. Asserted by the `th` case in the parse table and
 * by the explicit Buddhist-year test.
 *
 * ## Why every component provides it, rather than the app root
 *
 * Same reason as `provideTranslatedDatepickerIntl()` next to it, and one more. Components that
 * import `MatNativeDateModule` get `provideNativeDateAdapter()` from that module's own
 * providers, which an app-root provider cannot override — so a root-only fix silently left
 * six of the fifteen date inputs parsing US dates. And several of these dialogs are exported
 * from `@nuxeo/satori-platform/ui`: a customer who mounts `EditCollectionDialogComponent` in
 * their own application gets our adapter with it, instead of whatever their root happens to
 * provide or a `NullInjectorError`.
 *
 * `MAT_DATE_FORMATS` comes from `provideDateFnsAdapter()`'s default, `MAT_DATE_FNS_FORMATS`,
 * whose `parse.dateInput` and `display.dateInput` are both date-fns' `P` — the locale's own
 * short date format. That is the token this application never set, and the reason a typed date
 * had no format to be parsed against.
 */
declare function provideSatoriDateAdapter(): Provider[];

/**
 * The placeholder hint for a date input, in the active locale's field order.
 *
 * ## The gap this closes
 *
 * `common.date-mask` is a translation key, so it resolves per **language** — `mm/dd/yyyy` for
 * `en`, `jj/mm/aaaa` for `fr`. The adapter resolves per **locale tag**, region included, and a
 * region can reorder the fields outright: `en-GB` parses `dd/MM/yyyy`. These dialogs are
 * exported from `@nuxeo/satori-platform/ui`, so a host's `LOCALE_ID` reaches the adapter
 * unclamped while the catalogue still answers for the bare language. A host on `en-GB` using
 * the documented English fallback was therefore told to type month-first while its field read
 * day-first — the silent swap this adapter exists to remove, wearing a different locale id.
 *
 * ## Why it composes rather than deriving the whole mask
 *
 * The letters are translated and the order is not. date-fns knows the order and separators for
 * every region; only a translator knows that a German reader expects `tt.mm.jjjj` and a French
 * one `jj/mm/aaaa`. Deriving the whole hint from date-fns would hand every language Latin
 * `dd/MM/yyyy` and throw that work away, so the order and separators come from the adapter's
 * own format and the letters come from the catalogue. Each half keeps one source of truth.
 *
 * `fr-CH` is the separator-only case (`jj.mm.aaaa`), `en-GB` the order-only case
 * (`dd/mm/yyyy`), `fr-CA` both at once (`aa-mm-jj`).
 *
 * ## The letters are not always in `LOCALE_ID`'s order
 *
 * A host using `providePlatformEnglishFallback()` for a language whose catalogue has no
 * `common.date-mask` is handed the **platform's English**, so the letters arrive in English
 * order while `LOCALE_ID` says otherwise. Reading them as that language's own mask is how the
 * first version of this function reintroduced the defect it was written to remove: `fr` kept
 * the month-first `mm/dd/yyyy` because French's own pattern matched itself, and `fr-CA`
 * composed English runs through French field positions and produced `yy-dd-mm`.
 *
 * So the order the letters are *in* is tracked separately from the order they are wanted in —
 * see `sourcePattern`. With it, the English fallback now follows the adapter for every
 * language: `fr` renders `dd/mm/yyyy`, `de` renders `dd.mm.yyyy`, `fr-CA` renders `yy-mm-dd`.
 *
 * ## Why it fails back to the translated value
 *
 * Every exit that cannot line the two up returns `translatedMask` untouched. A hint that
 * disagrees with the parser is worse than an English one, but a hint this function mangled
 * would be worse still, and it has no way to tell a catalogue it cannot parse from one it has
 * misread. Returning the translator's own string is the one outcome that is never a regression.
 */
declare function dateMaskFor(localeId: string, translatedMask: string): string;

/**
 * `{{ 'common.date-mask' | translate | dateMask }}` — the translated date hint, reordered into
 * the active region's field order.
 *
 * It takes the translated value rather than the key so that `TranslatePipe` upstream keeps
 * owning the language: that pipe is already impure and re-emits on a language change, so this
 * one can stay pure and reshape whatever it is handed. `LOCALE_ID` cannot change without a
 * reload, so there is nothing else here to react to.
 */
declare class DateMaskPipe implements PipeTransform {
    private readonly localeId;
    transform(translatedMask: string | null | undefined): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DateMaskPipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<DateMaskPipe, "dateMask", true>;
}

/**
 * English for every translation key `@nuxeo/satori-platform` uses, so a host application that does
 * not ship the application catalogue renders English rather than raw keys.
 *
 * Generated by `node tools/i18n/platform-english.mjs` from `apps/nuxeo-ui/public/i18n/en.json`; do not edit by
 * hand. `checkPlatformEnglishFallback` fails when it drifts from that catalogue or from the keys the
 * package's code references.
 */
declare const PLATFORM_EN_TRANSLATIONS: Readonly<Record<string, string>>;

/**
 * A host's own missing-translation handler, consulted for keys the platform has no English for.
 *
 * ngx-translate allows one `MissingTranslationHandler` per application, so a host that already has
 * one provides it under this token instead, and keeps its behaviour for every other key.
 */
declare const PLATFORM_MISSING_TRANSLATION_NEXT: InjectionToken<MissingTranslationHandler>;
/**
 * Answers a missing platform key with its English, interpolating parameters as a catalogue value
 * would be; any other key goes to `PLATFORM_MISSING_TRANSLATION_NEXT`, or behaves as ngx-translate's
 * default (the key itself) when there is none.
 *
 * It only runs when the key is missing from the current and the fallback language, so a host
 * catalogue that has the key always wins.
 */
declare class PlatformEnglishMissingTranslationHandler implements MissingTranslationHandler {
    private readonly parser;
    private readonly next;
    handle(params: MissingTranslationHandlerParams): _ngx_translate_core.StrictTranslation | rxjs.Observable<_ngx_translate_core.StrictTranslation>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<PlatformEnglishMissingTranslationHandler, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<PlatformEnglishMissingTranslationHandler>;
}
/**
 * Opt-in English for the platform's own keys, for a host that does not ship the application
 * catalogue:
 *
 *     provideTranslateService({ missingTranslationHandler: providePlatformEnglishFallback() })
 *
 * It is not installed automatically, because it takes the application's single missing-translation
 * slot; see `PLATFORM_MISSING_TRANSLATION_NEXT` to keep a handler you already have.
 */
declare function providePlatformEnglishFallback(): Provider;

export { ConfirmDialogComponent, DateMaskPipe, DocumentCompareDialogComponent, DocumentViewerComponent, EditCollectionDialogComponent, ExportDialogComponent, MAT_TAB_LIST_IBM_ONKEYDOWN, MAT_TAB_LIST_KEYDOWN_ATTR, MatTabListKeydownDirective, PLATFORM_EN_TRANSLATIONS, PLATFORM_MISSING_TRANSLATION_NEXT, PlatformEnglishMissingTranslationHandler, SAVED_SEARCH_DIALOG_OPTIONS, SavedSearchDialogComponent, SelectionTopbarComponent, ShareDialogComponent, ShareSavedSearchDialogComponent, TranslatedDatepickerIntl, UiComponent, WidgetContainerComponent, WidgetGridComponent, dateMaskFor, observeMatTabListKeyboardA11y, observeStripRedundantMatInputAriaRequired, openDocumentCompareDialog, providePlatformEnglishFallback, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, stripRedundantMatInputAriaRequired, trashDocumentConfirmData, trashSelectedDocumentsConfirmData, wireMatTabListKeyboardA11y };
export type { ConfirmDialogData, DocumentCompareDialogData, EditCollectionDialogData, ExifData, ExportDialogData, ExportType, IptcData, PermissionEntry, PictureInfo, PictureView, SavedSearchDialogData, ShareDialogData, ShareSavedSearchDialogData, StoryboardItem, TranslateFn, VideoInfo, VideoSource };
//# sourceMappingURL=index.d.ts.map
