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
  return typeof mime === 'string' && mime.length > 0 && typeof blob['name'] === 'string';
}

export const BLOB_NOT_ATTACHED_ERROR = 'File was not attached to the document';

/** True if documents can be created under this document. */
export function isFolderishDocument(doc: NuxeoDocument | null): boolean {
  if (!doc) return false;
  if (doc.facets?.includes('Folderish')) return true;
  return FOLDERISH_TYPES.has(doc.type);
}

export function sanitizeDocumentName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 200) || 'untitled';
}

/** Default location shown when no browse context is provided. */
export const DEFAULT_IMPORT_PARENT_PATH = '/default-domain';

export const RESTRICTED_IMPORT_LOCATION_MESSAGE =
  'Select a different container to create your content.';

/** True when content cannot be created or imported at this path (domain root only). */
export function isRestrictedImportParentPath(path: string | null | undefined): boolean {
  if (!path?.trim()) return true;
  const normalized = path.trim().replace(/\/+$/, '') || '/';
  return normalized === DEFAULT_IMPORT_PARENT_PATH;
}

export interface CsvImportResult {
  created: NuxeoDocument[];
  skipped: string[];
  errors: string[];
}

/** Options for {@link DocumentImportService.importFiles}. */
export interface ImportFilesOptions {
  /** When true, run post-upload classification hook after each File document is created. */
  autoClassify?: boolean;
  /** Reports upload/create progress (0–100) for UI progress bars. */
  onProgress?: (progress: ImportProgress) => void;
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

@Injectable({ providedIn: 'root' })
export class DocumentImportService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(NuxeoApiBase);

  /**
   * Default folder when no browse context is passed (e.g. Dashboard).
   * Uses repository root: the default domain (`/default-domain`), not a user workspace.
   */
  getDefaultImportParentPath(): Observable<string> {
    return of(DEFAULT_IMPORT_PARENT_PATH);
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
    title: string,
    batchId: string,
    fileIndex: number,
    batchNoDrop = false,
  ): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      name: sanitizeDocumentName(fileName),
      type: 'File',
      properties: {
        'dc:title': title,
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
          report?.({ phase: 'uploading', percent: uploadPct });
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
    if (files.length === 0) return of([]);
    const autoClassify = options?.autoClassify === true;
    const report = options?.onProgress;
    const fileCount = files.length;
    return this.initUploadBatch().pipe(
      switchMap((batchId) => {
        const last = files.length - 1;
        const steps = files.map((file, index) =>
          this.uploadFileToBatch(batchId, index, file, (uploadPct) => {
            if (!report) return;
            const fileSpan = 85 / fileCount;
            const base = (index / fileCount) * 85;
            report({
              phase: 'uploading',
              percent: Math.round(base + (uploadPct / 100) * fileSpan),
              fileIndex: index,
              fileCount,
            });
          }).pipe(
            switchMap(() => {
              report?.({
                phase: 'creating',
                percent: Math.round(((index + 0.5) / fileCount) * 85 + 10),
                fileIndex: index,
                fileCount,
              });
              return this.verifyBatchFileUploaded(batchId, index);
            }),
            switchMap(() =>
              this.createFileFromBatch(
                parentPath,
                file.name,
                titleFromFileName(file.name),
                batchId,
                index,
                index < last,
              ).pipe(
                tap(() =>
                  report?.({
                    phase: 'creating',
                    percent: Math.round(((index + 1) / fileCount) * 100),
                    fileIndex: index,
                    fileCount,
                  }),
                ),
                switchMap((doc) => this.runPostUploadClassificationIfEnabled(doc, autoClassify)),
              ),
            ),
          ),
        );
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
          return throwError(() => new Error(BLOB_NOT_ATTACHED_ERROR));
        }
        return timer(300).pipe(switchMap(() => this.pollDocumentMainBlob(uid, attempt + 1)));
      }),
    );
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

function titleFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
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
