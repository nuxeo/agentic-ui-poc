import { Observable } from 'rxjs';
import { NuxeoDocument } from '../models/document.model';
import * as i0 from "@angular/core";
export declare const BLOB_HOLDING_DOC_TYPES: ReadonlySet<string>;
export declare function isBlobHoldingDocType(docType: string): boolean;
/** True when Nuxeo returned a non-empty main blob on the document. */
export declare function documentHasMainBlob(doc: NuxeoDocument): boolean;
/**
 * True when `file:content` is a persisted blob (not a pending upload-batch reference
 * and not merely a filename placeholder before binary storage completes).
 */
export declare function documentHasPersistedMainBlob(doc: NuxeoDocument): boolean;
export declare const BLOB_NOT_ATTACHED_ERROR = "File was not attached to the document";
/** Poll interval / cap when waiting for Nuxeo to persist `file:content` after create. */
export declare const MAIN_BLOB_POLL_INTERVAL_MS = 500;
export declare const MAIN_BLOB_POLL_MAX_ATTEMPTS = 30;
/** True if documents can be created under this document. */
export declare function isFolderishDocument(doc: Pick<NuxeoDocument, 'type' | 'facets'> | null): boolean;
/** Browse/nav tree nodes: folderish containers plus User Workspace Favorites. */
export declare function isBrowsableNavNode(doc: NuxeoDocument | null): boolean;
export declare function sanitizeDocumentName(name: string): string;
/** Web UI `_sanitizeName`: document path segment from title (slashes only). */
export declare function sanitizeDocumentCreateName(name: string): string;
/** Server `@emptyWithDefault` payload used to seed document creation (Web UI parity). */
export interface NuxeoCreateDocumentTemplate {
    name?: string;
    properties?: Record<string, unknown>;
}
/**
 * Merge user overrides into a server `@emptyWithDefault` template (Nuxeo Web UI create flow).
 * Skips null/empty overrides so server defaults (e.g. Domain schema fields) are preserved.
 */
export declare function mergeCreateDocumentBody(template: NuxeoCreateDocumentTemplate, docType: string, nameFallback: string, overrides: Record<string, unknown>): Record<string, unknown>;
/** Default location when no browse context is provided (e.g. Dashboard Add Content). */
export declare const DEFAULT_IMPORT_PARENT_PATH = "/";
/** Auto-provisioned domain container — not a user content-creation target. */
export declare const DOMAIN_CONTAINER_PATH = "/default-domain";
/** Catalogue key for the hint shown when the chosen location cannot hold new content. */
export declare const RESTRICTED_IMPORT_LOCATION_MESSAGE_KEY = "browse.message.restricted-import-location";
export declare function normalizeImportParentPath(path: string): string;
/** True when the path is the repository root (Domain creation only). */
export declare function isRepositoryRootPath(path: string | null | undefined): boolean;
/** True when generic content cannot be created or imported at this path (domain container). */
export declare function isRestrictedImportParentPath(path: string | null | undefined): boolean;
export interface CsvImportResult {
    created: NuxeoDocument[];
    skipped: string[];
    errors: string[];
}
/** Options for server-side CSV import via Nuxeo CSV addon (`CSV.Import`). */
export interface CsvServerImportOptions {
    path: string;
    file: File;
    /** Email the import report when the server finishes processing. */
    sendReport?: boolean;
    /** Preserve UUID, dates, author, and contributors from the CSV (document import mode). */
    documentMode?: boolean;
    /** Trim whitespace from CSV cell values (server default). */
    trim?: boolean;
}
/** Options for {@link DocumentImportService.importFiles}. */
export interface ImportFilesOptions {
    /** When true, run post-upload classification hook after each File document is created. */
    autoClassify?: boolean;
    /** Reports upload/create progress (0–100) for UI progress bars. */
    onProgress?: (progress: ImportProgress) => void;
}
/** One file in bulk import-with-properties (per-file type and Dublin Core metadata). */
export interface ImportFileEntry {
    file: File;
    docType: string;
    properties: Record<string, unknown>;
}
/** Infer blob-holding Nuxeo type from file MIME type / extension (Web UI import parity). */
export declare function inferBlobDocTypeFromFile(file: File): string;
/** Pick an allowed creatable blob type for import, preferring MIME-based inference. */
export declare function resolveImportBlobDocType(file: File, allowedTypes: readonly string[]): string;
export declare function titleFromFileName(fileName: string): string;
/** Progress payload for blob upload and document creation flows. */
export interface ImportProgress {
    phase: 'uploading' | 'creating';
    /** Overall progress from 0 to 100. */
    percent: number;
    fileIndex?: number;
    fileCount?: number;
}
export interface CreateBlobHoldingDocumentOptions {
    onProgress?: (progress: ImportProgress) => void;
}
/** Result of staging a file in an upload batch before document creation (Web UI immediate upload). */
export interface StagedBatchFile {
    batchId: string;
    fileIndex: number;
}
export interface StageFileInBatchOptions {
    onProgress?: (percent: number) => void;
}
export declare class DocumentImportService {
    private readonly http;
    private readonly api;
    /**
     * Default folder when no browse context is passed (e.g. Dashboard).
     * Uses repository root (`/`) so administrators can create domains.
     */
    getDefaultImportParentPath(): Observable<string>;
    /**
     * Bulk CSV import via Nuxeo CSV addon (`POST /automation/CSV.Import`).
     * @see https://doc.nuxeo.com/nxdoc/nuxeo-csv/
     */
    importCsvFile(options: CsvServerImportOptions): Observable<string>;
    /**
     * Start a batch upload session (`POST /api/v1/upload/new/default`).
     * @see https://doc.nuxeo.com/nxdoc/howto-upload-file-nuxeo-using-rest-api/
     */
    initUploadBatch(handler?: string): Observable<string>;
    /** Upload one file into a batch index (0-based). */
    uploadFileToBatch(batchId: string, fileIndex: number, file: File, onUploadPercent?: (percent: number) => void): Observable<void>;
    /**
     * URL to create a document under a folder.
     * Nuxeo expects `POST /api/v1/path{parentPath}` with a JSON body — not `.../@children`
     * (`@children` is for GET listing; POST there can return 405).
     */
    private urlCreateUnderPath;
    /**
     * Empty document model with server defaults for a type under `parentPath`.
     * @see https://doc.nuxeo.com/nxdoc/rest-api-web-adapters/ (`@emptyWithDefault`)
     */
    getEmptyDocumentWithDefaults(parentPath: string, docType: string): Observable<NuxeoCreateDocumentTemplate>;
    /**
     * Create a File document under `parentPath` using an uploaded batch blob.
     * @param batchNoDrop — pass true when more creations will use the same batch (Nuxeo clears the batch after first use unless this header is set).
     */
    createFileFromBatch(parentPath: string, fileName: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number, batchNoDrop?: boolean): Observable<NuxeoDocument>;
    createChildDocument(parentPath: string, name: string, docType: string, properties: Record<string, unknown>): Observable<NuxeoDocument>;
    /**
     * Create a blob-holding document (File, Audio, Picture, Video) with an uploaded batch file.
     */
    createDocumentWithBlob(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number): Observable<NuxeoDocument>;
    /**
     * Upload a file to a new batch immediately on selection (Nuxeo Web UI `immediate` upload).
     * Document creation can later reference the returned `batchId` / `fileIndex`.
     */
    stageFileInBatch(file: File, options?: StageFileInBatchOptions): Observable<StagedBatchFile>;
    /**
     * Create a blob-holding document from a file already staged in an upload batch.
     */
    createBlobHoldingDocumentFromBatch(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, batchId: string, fileIndex: number, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /**
     * Create a blob-holding document, preferring a staged batch when still available on the server.
     * Falls back to a fresh upload+create when the batch expired (common after immediate upload UX).
     */
    createBlobHoldingDocumentReliable(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, file: File, stagedBatch?: StagedBatchFile | null, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /**
     * Initialize a batch, upload `file`, and create a blob-holding document with `file:content` set.
     */
    createBlobHoldingDocument(parentPath: string, name: string, docType: string, properties: Record<string, unknown>, file: File, options?: CreateBlobHoldingDocumentOptions): Observable<NuxeoDocument>;
    /** Upload multiple files as File documents (single batch, sequential API calls). */
    importFiles(parentPath: string, files: File[], options?: ImportFilesOptions): Observable<NuxeoDocument[]>;
    /**
     * Bulk import with per-file document type and metadata (Nuxeo Web UI “Import with Properties”).
     */
    importFilesWithProperties(parentPath: string, entries: ImportFileEntry[], options?: ImportFilesOptions): Observable<NuxeoDocument[]>;
    /** Web UI parity: seed blob create from `@emptyWithDefault`, merge user props, attach batch blob. */
    private buildBlobDocumentCreateRequest;
    private isBatchFileAvailable;
    private verifyBatchFileUploaded;
    /**
     * Nuxeo may return create responses without hydrated `file:content` (null, batch refs,
     * or name-only placeholders). Poll until the binary is persisted before returning.
     */
    private withMainBlobValidation;
    private ensurePersistedMainBlob;
    private pollDocumentMainBlob;
    private fetchDocumentMainBlob;
    /**
     * Nuxeo Cloud may omit `file:content` from properties GET even after a successful batch attach.
     * Web UI reads blobs via `@blob`; fall back to HEAD on that endpoint before failing create.
     */
    private enrichDocumentFromBlobEndpointIfNeeded;
    /**
     * Placeholder for post-upload classification (e.g. Nuxeo automation / Document AI).
     * When `enabled` is false, returns the document unchanged.
     */
    private runPostUploadClassificationIfEnabled;
    /**
     * Nuxeo-style CSV (name, type, dc:title, …). Creates trees when `name` uses `/` segments.
     * Rows with `file:content` are skipped (binary import needs server-side Nuxeo CSV).
     */
    importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DocumentImportService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DocumentImportService>;
}
/**
 * Strip HTML from Nuxeo CSV import report for plain-text display. Empty when the report carries
 * no text, so the caller can supply its own translated fallback.
 */
export declare function summarizeCsvImportReport(report: string): string;
//# sourceMappingURL=document-import.service.d.ts.map