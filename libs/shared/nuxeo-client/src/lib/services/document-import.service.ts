import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, concat, defer, from, of, throwError, timer } from 'rxjs';
import { catchError, concatMap, filter, map, switchMap, tap, toArray } from 'rxjs/operators';

import { NuxeoDocument } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';

const FOLDERISH_TYPES = new Set([
  'Domain',
  'Folder',
  'OrderedFolder',
  'Workspace',
  'WorkspaceRoot',
  'SectionRoot',
  'Section',
  'TemplateRoot',
  'Collection',
  'Collections',
]);

/** Document types whose create/import flow must attach a main blob (`file:content`). */
const BLOB_HOLDING_DOC_TYPES_INTERNAL = new Set(['File', 'Audio', 'Picture', 'Video']);
export const BLOB_HOLDING_DOC_TYPES: ReadonlySet<string> = BLOB_HOLDING_DOC_TYPES_INTERNAL;

export function isBlobHoldingDocType(docType: string): boolean {
  return BLOB_HOLDING_DOC_TYPES.has(docType);
}

/** True when Nuxeo returned a non-empty main blob on the document. */
export function documentHasMainBlob(doc: NuxeoDocument): boolean {
  const fc = doc.properties?.['file:content'];
  if (!fc || typeof fc !== 'object') return false;
  const blob = fc as Record<string, unknown>;
  const length = blob['length'];
  if (length !== null && length !== undefined && Number(length) > 0) return true;
  const name = blob['name'];
  if (typeof name === 'string' && name.length > 0) return true;
  const digest = blob['digest'];
  return typeof digest === 'string' && digest.length > 0;
}

/**
 * True when `file:content` is a persisted blob (not a pending upload-batch reference
 * and not merely a filename placeholder before binary storage completes).
 */
export function documentHasPersistedMainBlob(doc: NuxeoDocument): boolean {
  const fc = doc.properties?.['file:content'];
  if (!fc || typeof fc !== 'object') return false;
  const blob = fc as Record<string, unknown>;
  if (blob['upload-batch']) return false;

  const digest = blob['digest'];
  if (typeof digest === 'string' && digest.length > 0) return true;

  if (blob['data']) return true;

  const lengthRaw = blob['length'];
  if (lengthRaw !== null && lengthRaw !== undefined && lengthRaw !== '') {
    const length = Number(lengthRaw);
    if (Number.isFinite(length)) {
      if (length > 0) return true;
      if (length === 0 && (blob['mime-type'] || blob['data'])) return true;
    }
  }

  const mime = blob['mime-type'];
  const name = blob['name'];
  return typeof mime === 'string' && mime.length > 0 && typeof name === 'string' && name.length > 0;
}

export const BLOB_NOT_ATTACHED_ERROR = 'File was not attached to the document';

/** True if documents can be created under this document. */
export function isFolderishDocument(doc: NuxeoDocument | null): boolean {
  if (!doc) return false;
  if (doc.facets?.includes('Folderish')) return true;
  return FOLDERISH_TYPES.has(doc.type);
}

/** Browse/nav tree nodes: folderish containers plus User Workspace Favorites. */
export function isBrowsableNavNode(doc: NuxeoDocument | null): boolean {
  if (!doc) return false;
  return doc.type === 'Favorites' || isFolderishDocument(doc);
}

export function sanitizeDocumentName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 200) || 'untitled';
}

/** Default location when no browse context is provided (e.g. Dashboard Add Content). */
export const DEFAULT_IMPORT_PARENT_PATH = '/';

/** Auto-provisioned domain container — not a user content-creation target. */
export const DOMAIN_CONTAINER_PATH = '/default-domain';

export const RESTRICTED_IMPORT_LOCATION_MESSAGE =
  'Select a different container to create your content.';

export function normalizeImportParentPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, '') || '/';
}

/** True when the path is the repository root (Domain creation only). */
export function isRepositoryRootPath(path: string | null | undefined): boolean {
  if (!path?.trim()) return false;
  return normalizeImportParentPath(path) === '/';
}

/** True when generic content cannot be created or imported at this path (domain container). */
export function isRestrictedImportParentPath(path: string | null | undefined): boolean {
  if (!path?.trim()) return true;
  return normalizeImportParentPath(path) === DOMAIN_CONTAINER_PATH;
}

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

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'svg',
  'tif',
  'tiff',
  'heic',
  'heif',
]);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', 'wmv']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma']);

/** Infer blob-holding Nuxeo type from file MIME type / extension (Web UI import parity). */
export function inferBlobDocTypeFromFile(file: File): string {
  const mime = file.type.toLowerCase();
  const ext = file.name.includes('.') ? (file.name.split('.').pop()?.toLowerCase() ?? '') : '';

  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(ext)) {
    return 'Picture';
  }
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(ext)) {
    return 'Video';
  }
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(ext)) {
    return 'Audio';
  }
  return 'File';
}

/** Pick an allowed creatable blob type for import, preferring MIME-based inference. */
export function resolveImportBlobDocType(file: File, allowedTypes: readonly string[]): string {
  const inferred = inferBlobDocTypeFromFile(file);
  if (allowedTypes.includes(inferred)) {
    return inferred;
  }
  if (allowedTypes.includes('File')) {
    return 'File';
  }
  return allowedTypes.find((t) => isBlobHoldingDocType(t)) ?? 'File';
}

export function titleFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

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

@Injectable({ providedIn: 'root' })
export class DocumentImportService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(NuxeoApiBase);

  /**
   * Default folder when no browse context is passed (e.g. Dashboard).
   * Uses repository root (`/`) so administrators can create domains.
   */
  getDefaultImportParentPath(): Observable<string> {
    return of(DEFAULT_IMPORT_PARENT_PATH);
  }

  /**
   * Bulk CSV import via Nuxeo CSV addon (`POST /automation/CSV.Import`).
   * @see https://doc.nuxeo.com/nxdoc/nuxeo-csv/
   */
  importCsvFile(options: CsvServerImportOptions): Observable<string> {
    const path = normalizeImportParentPath(options.path);
    const request = JSON.stringify({
      params: {
        path,
        sendReport: options.sendReport === true,
        documentMode: options.documentMode === true,
        trim: options.trim !== false,
      },
      context: {},
    });
    const formData = new FormData();
    formData.append('request', new Blob([request], { type: 'application/json' }));
    formData.append('file', options.file);
    return this.http.post(this.api.apiUrl('/nuxeo/api/v1/automation/CSV.Import'), formData, {
      responseType: 'text',
    });
  }

  /**
   * Start a batch upload session (`POST /api/v1/upload/new/default`).
   * @see https://doc.nuxeo.com/nxdoc/howto-upload-file-nuxeo-using-rest-api/
   */
  initUploadBatch(handler = 'default'): Observable<string> {
    return this.http
      .post<unknown>(
        this.api.apiUrl(`/nuxeo/api/v1/upload/new/${encodeURIComponent(handler)}`),
        null,
        { observe: 'response' },
      )
      .pipe(map((resp) => readBatchIdFromInitResponse(resp)));
  }

  /** Upload one file into a batch index (0-based). */
  uploadFileToBatch(
    batchId: string,
    fileIndex: number,
    file: File,
    onUploadPercent?: (percent: number) => void,
  ): Observable<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': sanitizeHttpHeaderValue(file.name),
    };
    if (file.type) {
      headers['X-File-Type'] = file.type;
    }
    return this.http
      .post(
        this.api.apiUrl(`/nuxeo/api/v1/upload/${encodeURIComponent(batchId)}/${fileIndex}`),
        file,
        {
          headers: new HttpHeaders(headers),
          responseType: 'text',
          reportProgress: true,
          observe: 'events',
        },
      )
      .pipe(
        tap((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total && event.total > 0 ? event.total : file.size;
            const percent = total > 0 ? Math.min(100, Math.round((event.loaded * 100) / total)) : 0;
            onUploadPercent?.(percent);
            return;
          }
          if (event.type === HttpEventType.Response) {
            onUploadPercent?.(100);
          }
        }),
        filter((event) => event.type === HttpEventType.Response),
        map(() => undefined),
      );
  }

  /**
   * URL to create a document under a folder.
   * Nuxeo expects `POST /api/v1/path{parentPath}` with a JSON body — not `.../@children`
   * (`@children` is for GET listing; POST there can return 405).
   */
  private urlCreateUnderPath(parentPath: string): string {
    const safePath = parentPath.replace(/\/+$/, '') || '/';
    return this.api.apiUrl(`/nuxeo/api/v1/path${safePath}`);
  }

  /**
   * Create a File document under `parentPath` using an uploaded batch blob.
   * @param batchNoDrop — pass true when more creations will use the same batch (Nuxeo clears the batch after first use unless this header is set).
   */
  createFileFromBatch(
    parentPath: string,
    fileName: string,
    docType: string,
    properties: Record<string, unknown>,
    batchId: string,
    fileIndex: number,
    batchNoDrop = false,
  ): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      name: sanitizeDocumentName(fileName),
      type: docType,
      properties: {
        ...properties,
        'file:content': {
          'upload-batch': batchId,
          'upload-fileId': String(fileIndex),
        },
      },
    };
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (batchNoDrop) {
      headers = headers.set('X-Batch-No-Drop', 'true');
    }
    return this.withMainBlobValidation(
      this.http.post<NuxeoDocument>(this.urlCreateUnderPath(parentPath), body, { headers }),
    );
  }

  createChildDocument(
    parentPath: string,
    name: string,
    docType: string,
    properties: Record<string, unknown>,
  ): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      name: sanitizeDocumentName(name),
      type: docType,
      properties,
    };
    return this.http.post<NuxeoDocument>(this.urlCreateUnderPath(parentPath), body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Create a blob-holding document (File, Audio, Picture, Video) with an uploaded batch file.
   */
  createDocumentWithBlob(
    parentPath: string,
    name: string,
    docType: string,
    properties: Record<string, unknown>,
    batchId: string,
    fileIndex: number,
  ): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      name: sanitizeDocumentName(name),
      type: docType,
      properties: {
        ...properties,
        'file:content': {
          'upload-batch': batchId,
          'upload-fileId': String(fileIndex),
        },
      },
    };
    return this.withMainBlobValidation(
      this.http.post<NuxeoDocument>(this.urlCreateUnderPath(parentPath), body, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  /**
   * Upload a file to a new batch immediately on selection (Nuxeo Web UI `immediate` upload).
   * Document creation can later reference the returned `batchId` / `fileIndex`.
   */
  stageFileInBatch(file: File, options?: StageFileInBatchOptions): Observable<StagedBatchFile> {
    const report = options?.onProgress;
    return this.initUploadBatch().pipe(
      switchMap((batchId) =>
        this.uploadFileToBatch(batchId, 0, file, report).pipe(
          switchMap(() => this.verifyBatchFileUploaded(batchId, 0)),
          map(() => ({ batchId, fileIndex: 0 })),
        ),
      ),
    );
  }

  /**
   * Create a blob-holding document from a file already staged in an upload batch.
   */
  createBlobHoldingDocumentFromBatch(
    parentPath: string,
    name: string,
    docType: string,
    properties: Record<string, unknown>,
    batchId: string,
    fileIndex: number,
    options?: CreateBlobHoldingDocumentOptions,
  ): Observable<NuxeoDocument> {
    const report = options?.onProgress;
    report?.({ phase: 'creating', percent: 90 });
    return this.createDocumentWithBlob(
      parentPath,
      name,
      docType,
      properties,
      batchId,
      fileIndex,
    ).pipe(tap(() => report?.({ phase: 'creating', percent: 100 })));
  }

  /**
   * Initialize a batch, upload `file`, and create a blob-holding document with `file:content` set.
   */
  createBlobHoldingDocument(
    parentPath: string,
    name: string,
    docType: string,
    properties: Record<string, unknown>,
    file: File,
    options?: CreateBlobHoldingDocumentOptions,
  ): Observable<NuxeoDocument> {
    const report = options?.onProgress;
    return defer(() => {
      report?.({ phase: 'uploading', percent: 0 });
      return this.initUploadBatch();
    }).pipe(
      switchMap((batchId) =>
        this.uploadFileToBatch(batchId, 0, file, (uploadPct) => {
          report?.({ phase: 'uploading', percent: Math.round(uploadPct * 0.85) });
        }).pipe(
          switchMap(() => {
            report?.({ phase: 'creating', percent: 90 });
            return this.verifyBatchFileUploaded(batchId, 0);
          }),
          switchMap(() => {
            report?.({ phase: 'creating', percent: 95 });
            return this.createDocumentWithBlob(parentPath, name, docType, properties, batchId, 0);
          }),
          tap(() => report?.({ phase: 'creating', percent: 100 })),
        ),
      ),
    );
  }

  /** Upload multiple files as File documents (single batch, sequential API calls). */
  importFiles(
    parentPath: string,
    files: File[],
    options?: ImportFilesOptions,
  ): Observable<NuxeoDocument[]> {
    const entries: ImportFileEntry[] = files.map((file) => ({
      file,
      docType: 'File',
      properties: { 'dc:title': titleFromFileName(file.name) },
    }));
    return this.importFilesWithProperties(parentPath, entries, options);
  }

  /**
   * Bulk import with per-file document type and metadata (Nuxeo Web UI “Import with Properties”).
   */
  importFilesWithProperties(
    parentPath: string,
    entries: ImportFileEntry[],
    options?: ImportFilesOptions,
  ): Observable<NuxeoDocument[]> {
    if (entries.length === 0) return of([]);
    const autoClassify = options?.autoClassify === true;
    const report = options?.onProgress;
    const fileCount = entries.length;
    return this.initUploadBatch().pipe(
      switchMap((batchId) => {
        const last = entries.length - 1;
        const steps = entries.map((entry, index) => {
          const segment = 100 / fileCount;
          const segmentStart = index * segment;
          const { file, docType, properties } = entry;
          const title = (properties['dc:title'] as string) || titleFromFileName(file.name);
          const createProperties = {
            ...properties,
            'dc:title': title,
          };
          return this.uploadFileToBatch(batchId, index, file, (uploadPct) => {
            if (!report) return;
            report({
              phase: 'uploading',
              percent: Math.round(segmentStart + (uploadPct / 100) * segment * 0.85),
              fileIndex: index,
              fileCount,
            });
          }).pipe(
            switchMap(() => {
              report?.({
                phase: 'creating',
                percent: Math.round(segmentStart + segment * 0.88),
                fileIndex: index,
                fileCount,
              });
              return this.verifyBatchFileUploaded(batchId, index);
            }),
            switchMap(() =>
              this.createFileFromBatch(
                parentPath,
                file.name,
                docType,
                createProperties,
                batchId,
                index,
                index < last,
              ).pipe(
                tap(() =>
                  report?.({
                    phase: 'creating',
                    percent: index === last ? 100 : Math.round((index + 1) * segment),
                    fileIndex: index,
                    fileCount,
                  }),
                ),
                switchMap((doc) => this.runPostUploadClassificationIfEnabled(doc, autoClassify)),
              ),
            ),
          );
        });
        return concat(...steps).pipe(toArray());
      }),
    );
  }

  private verifyBatchFileUploaded(batchId: string, fileIndex: number): Observable<void> {
    return this.http
      .get<unknown>(
        this.api.apiUrl(`/nuxeo/api/v1/upload/${encodeURIComponent(batchId)}/${fileIndex}`),
      )
      .pipe(
        map((info) => {
          if (!info || typeof info !== 'object') {
            throw new Error('Upload verification failed: batch file not found');
          }
          const record = info as Record<string, unknown>;
          const size = record['size'] ?? record['uploadedSize'];
          if (size !== null && size !== undefined) {
            const numericSize = Number(size);
            if (Number.isFinite(numericSize) && numericSize >= 0) {
              return undefined;
            }
          }
          const name = record['name'];
          if (typeof name === 'string' && name.length > 0) {
            return undefined;
          }
          throw new Error('Upload verification failed: batch file metadata missing');
        }),
      );
  }

  /**
   * Nuxeo may return create responses without hydrated `file:content` (null, batch refs,
   * or name-only placeholders). Poll until the binary is persisted before returning.
   */
  private withMainBlobValidation(create$: Observable<NuxeoDocument>): Observable<NuxeoDocument> {
    return create$.pipe(switchMap((doc) => this.ensurePersistedMainBlob(doc)));
  }

  private ensurePersistedMainBlob(doc: NuxeoDocument): Observable<NuxeoDocument> {
    if (documentHasPersistedMainBlob(doc)) {
      return of(doc);
    }
    return this.pollDocumentMainBlob(doc.uid, 0);
  }

  private pollDocumentMainBlob(uid: string, attempt: number): Observable<NuxeoDocument> {
    const maxAttempts = 12;
    return this.fetchDocumentMainBlob(uid).pipe(
      switchMap((refetched) => {
        if (documentHasPersistedMainBlob(refetched)) {
          return of(refetched);
        }
        if (attempt >= maxAttempts) {
          return this.trashOrphanDocument(uid).pipe(
            catchError(() => of(undefined)),
            switchMap(() => throwError(() => new Error(BLOB_NOT_ATTACHED_ERROR))),
          );
        }
        return timer(300).pipe(switchMap(() => this.pollDocumentMainBlob(uid, attempt + 1)));
      }),
    );
  }

  /** Best-effort cleanup when blob attachment fails after the document shell was created. */
  private trashOrphanDocument(uid: string): Observable<void> {
    const input = uid.startsWith('doc:') ? uid : `doc:${uid}`;
    return this.api
      .post<NuxeoDocument>('/nuxeo/api/v1/automation/Document.Trash', {
        params: {},
        context: {},
        input,
      })
      .pipe(map(() => undefined));
  }

  private fetchDocumentMainBlob(uid: string): Observable<NuxeoDocument> {
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}`, undefined, {
      properties: 'file:content',
    });
  }

  /**
   * Placeholder for post-upload classification (e.g. Nuxeo automation / Document AI).
   * When `enabled` is false, returns the document unchanged.
   */
  private runPostUploadClassificationIfEnabled(
    doc: NuxeoDocument,
    enabled: boolean,
  ): Observable<NuxeoDocument> {
    if (!enabled) return of(doc);
    return of(doc);
  }

  /**
   * Nuxeo-style CSV (name, type, dc:title, …). Creates trees when `name` uses `/` segments.
   * Rows with `file:content` are skipped (binary import needs server-side Nuxeo CSV).
   */
  importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult> {
    const table = parseCsvTable(csvText);
    if (table.length < 2) {
      return of({ created: [], skipped: [], errors: ['CSV has no data rows'] });
    }
    const headers = table[0].map((h) => h.trim());
    const lower = headers.map((h) => h.toLowerCase());
    const nameIdx = lower.indexOf('name');
    const typeIdx = lower.indexOf('type');
    if (nameIdx < 0 || typeIdx < 0) {
      return of({
        created: [],
        skipped: [],
        errors: ['CSV must include columns "name" and "type" (header row).'],
      });
    }

    interface Row {
      relPath: string;
      docType: string;
      props: Record<string, unknown>;
    }

    const rows: Row[] = [];
    const skipped: string[] = [];

    for (let r = 1; r < table.length; r++) {
      const cells = table[r];
      if (cells.every((c) => !String(c).trim())) continue;
      let skipRow = false;
      const relPath = String(cells[nameIdx] ?? '').trim();
      const docType = String(cells[typeIdx] ?? '').trim();
      if (!relPath || !docType) {
        skipped.push(`Row ${r + 1}: missing name or type`);
        continue;
      }
      const props: Record<string, unknown> = {};
      for (let c = 0; c < headers.length; c++) {
        if (c === nameIdx || c === typeIdx) continue;
        const key = headers[c];
        if (!key) continue;
        const val = String(cells[c] ?? '').trim();
        if (key.toLowerCase() === 'file:content' && val) {
          skipped.push(`${relPath}: file:content — use Upload or server CSV`);
          skipRow = true;
          break;
        }
        if (val !== '') props[key] = val;
      }
      if (skipRow) continue;
      rows.push({ relPath, docType, props });
    }

    rows.sort((a, b) => a.relPath.split('/').length - b.relPath.split('/').length);

    const pathMap = new Map<string, string>();
    pathMap.set('', parentPath.replace(/\/+$/, '') || '/');

    return from(rows).pipe(
      concatMap((row) => {
        const parts = row.relPath.split('/').filter(Boolean);
        const localName = parts[parts.length - 1];
        const parentRel = parts.slice(0, -1).join('/');
        const parentAbs = pathMap.get(parentRel);
        if (!parentAbs) {
          return of<{ ok: NuxeoDocument } | { fail: string }>({
            fail: `No parent path for "${row.relPath}" — check CSV order and parent rows`,
          });
        }
        const title = (row.props['dc:title'] as string) || localName;
        const props: Record<string, unknown> = { ...row.props, 'dc:title': title };
        if (row.docType === 'Note' && props['note:note'] === undefined) {
          props['note:note'] = '<p></p>';
        }
        return this.createChildDocument(parentAbs, localName, row.docType, props).pipe(
          tap((doc) => pathMap.set(row.relPath, doc.path)),
          map((doc) => ({ ok: doc })),
          catchError((err: { message?: string; error?: { message?: string } }) =>
            of({
              fail: `${row.relPath}: ${err?.error?.message ?? err?.message ?? 'Create failed'}`,
            }),
          ),
        );
      }),
      toArray(),
      map((results) => {
        const created: NuxeoDocument[] = [];
        const errors: string[] = [];
        for (const res of results) {
          if ('ok' in res && res.ok) created.push(res.ok);
          else if ('fail' in res && res.fail) errors.push(res.fail);
        }
        return { created, skipped, errors };
      }),
    );
  }
}

/** Strip HTML from Nuxeo CSV import report for plain-text display. */
export function summarizeCsvImportReport(report: string): string {
  const text = report
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text || 'CSV import completed.';
}

/** Strip control characters unsafe for HTTP header values (e.g. CR/LF injection). */
function sanitizeHttpHeaderValue(value: string): string {
  const cleaned = value
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .trim();
  return cleaned || 'untitled';
}

function readBatchIdFromInitResponse(resp: HttpResponse<unknown>): string {
  const fromHeader = resp.headers.get('X-Batch-Id') ?? resp.headers.get('Batch-Id');
  if (fromHeader?.trim()) return fromHeader.trim();
  const body = resp.body;
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    const id =
      (record['batchId'] as string) ??
      (record['batch-id'] as string) ??
      (record['uploadBatchId'] as string);
    if (id) return id;
  }
  throw new Error('Could not read upload batch id from response');
}

/** RFC 4180–friendly: quoted fields may contain commas and newlines. */
function parseCsvTable(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let rowHasCharacters = false;

  const pushField = (): void => {
    currentRow.push(currentField.trim());
    currentField = '';
  };

  const pushRow = (): void => {
    pushField();
    if (rowHasCharacters) {
      rows.push(currentRow);
    }
    currentRow = [];
    rowHasCharacters = false;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      rowHasCharacters = true;
      if (inQuotes && text[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      rowHasCharacters = true;
      pushField();
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      pushRow();
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      continue;
    }

    currentField += char;
    rowHasCharacters = true;
  }

  if (rowHasCharacters || currentField.length > 0 || currentRow.length > 0) {
    pushRow();
  }

  return rows;
}
