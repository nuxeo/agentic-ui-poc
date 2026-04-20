import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, concat, from, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';

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

export interface CsvImportResult {
  created: NuxeoDocument[];
  skipped: string[];
  errors: string[];
}

/** Options for {@link DocumentImportService.importFiles}. */
export interface ImportFilesOptions {
  /** When true, run post-upload classification hook after each File document is created. */
  autoClassify?: boolean;
  /** Extra metadata properties to set on each uploaded document (e.g. from an import layout form). */
  properties?: Record<string, unknown>;
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
    return of('/default-domain');
  }

  /** Start a batch upload session (POST /api/v1/upload — see Nuxeo batch upload HOWTO). */
  initUploadBatch(): Observable<string> {
    return this.http
      .post<unknown>(this.api.apiUrl('/nuxeo/api/v1/upload'), null, {
        headers: new HttpHeaders({ 'X-Upload-Type': 'batch' }),
        observe: 'response',
      })
      .pipe(
        map((resp) => {
          const fromHeader = resp.headers.get('X-Batch-Id') ?? resp.headers.get('Batch-Id');
          if (fromHeader) return fromHeader.trim();
          const body = resp.body as Record<string, unknown> | null;
          if (body && typeof body === 'object') {
            const id =
              (body['batchId'] as string) ??
              (body['batch-id'] as string) ??
              (body['uploadBatchId'] as string);
            if (id) return id;
          }
          throw new Error('Could not read upload batch id from response');
        }),
      );
  }

  /** Upload one file into a batch index (0-based). */
  uploadFileToBatch(batchId: string, fileIndex: number, file: File): Observable<void> {
    const safeName = encodeURIComponent(file.name);
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': safeName,
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
        },
      )
      .pipe(map(() => undefined));
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
    extraProperties?: Record<string, unknown>,
  ): Observable<NuxeoDocument> {
    const body = {
      'entity-type': 'document',
      name: sanitizeDocumentName(fileName),
      type: 'File',
      properties: {
        ...extraProperties,
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
    return this.http.post<NuxeoDocument>(this.urlCreateUnderPath(parentPath), body, { headers });
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

  /** Upload multiple files as File documents (single batch, sequential API calls). */
  importFiles(
    parentPath: string,
    files: File[],
    options?: ImportFilesOptions,
  ): Observable<NuxeoDocument[]> {
    if (files.length === 0) return of([]);
    const autoClassify = options?.autoClassify === true;
    const extraProps = options?.properties;
    return this.initUploadBatch().pipe(
      switchMap((batchId) => {
        const last = files.length - 1;
        const steps = files.map((file, index) =>
          this.uploadFileToBatch(batchId, index, file).pipe(
            switchMap(() =>
              this.createFileFromBatch(
                parentPath,
                file.name,
                titleFromFileName(file.name),
                batchId,
                index,
                index < last,
                extraProps,
              ).pipe(
                switchMap((doc) => this.runPostUploadClassificationIfEnabled(doc, autoClassify)),
              ),
            ),
          ),
        );
        return concat(...steps).pipe(toArray());
      }),
    );
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
