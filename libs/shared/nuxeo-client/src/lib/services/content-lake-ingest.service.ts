import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, throwError, timer } from 'rxjs';

import type {
  ContentLakeDuplicate,
  ContentLakeBackfillResult,
  ContentLakeIngestCommand,
  ContentLakeIngestStatus,
} from '../models/content-lake-ingest.model';
import type { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import {
  buildContentLakeIngestMarker,
  buildContentLakeDuplicateSearchQuery,
  findRepositoryBlobMatches,
  isContentLakeIngestCurrent,
  parseContentLakeIngestCheckResult,
  readBlobDigest,
  resolveIngestMarkerWriteProperty,
  shouldProbeContentLakeIngestStatus,
} from '../utils/content-lake-ingest';
import { BrowseService } from './browse.service';
import { NuxeoApiBase } from './nuxeo-api-base';

const TERMINAL_BULK_STATES = new Set(['COMPLETED', 'ABORTED', 'COMPLETED_WITH_ERROR']);

/**
 * Triggers HxAI Content Lake ingestion for Nuxeo documents via the
 * `nuxeo-hxai-connector` bulk `ingest` action. The Angular app never calls
 * Content Lake directly — files must exist in Nuxeo first.
 */
@Injectable({ providedIn: 'root' })
export class ContentLakeIngestService {
  private readonly api = inject(NuxeoApiBase);
  private readonly browseService = inject(BrowseService);

  startIngest(documentUids: string[]): Observable<ContentLakeIngestCommand> {
    if (documentUids.length === 0) {
      return throwError(() => new Error('At least one document id is required to ingest.'));
    }

    const query = this.buildIngestQuery(documentUids);
    return this.api
      .post<Record<string, unknown>>('/nuxeo/api/v1/automation/Bulk.RunAction', {
        params: { action: 'ingest', query },
        context: {},
      })
      .pipe(
        map((body) => {
          this.throwIfAutomationException(body);
          const commandId = this.readCommandId(body);
          if (!commandId) {
            throw new Error('Bulk ingest did not return a command id.');
          }
          return { commandId };
        }),
      );
  }

  getStatus(commandId: string): Observable<ContentLakeIngestStatus> {
    return this.api
      .get<Record<string, unknown>>(`/nuxeo/api/v1/bulk/${encodeURIComponent(commandId)}`)
      .pipe(map((body) => this.normalizeStatus(commandId, body)));
  }

  waitUntilComplete(commandId: string, pollIntervalMs = 2000): Observable<ContentLakeIngestStatus> {
    const poll = (): Observable<ContentLakeIngestStatus> =>
      this.getStatus(commandId).pipe(
        switchMap((status) => {
          if (this.isTerminal(status)) {
            return of(status);
          }
          return timer(pollIntervalMs).pipe(switchMap(() => poll()));
        }),
      );

    return poll();
  }

  /**
   * Find repository documents that match selected files (name + blob size) and are
   * already in Content Lake — via local ingest marker or `HylandIngest.CheckDigest`.
   */
  findDuplicates(files: File[], sourceIds?: string[]): Observable<ContentLakeDuplicate[]> {
    if (files.length === 0) {
      return of([]);
    }

    const query = buildContentLakeDuplicateSearchQuery(files);
    const pageSize = Math.min(500, Math.max(files.length * 5, files.length));

    return this.api.nxqlSearch(query, pageSize, { properties: '*' }).pipe(
      catchError(() =>
        of({
          entries: [],
          totalSize: 0,
          currentPageSize: 0,
          currentPageIndex: 0,
          numberOfPages: 0,
        } satisfies NuxeoDocumentList),
      ),
      switchMap((list) =>
        forkJoin(
          files.map((file) => this.resolveDuplicateForFile(file, list.entries ?? [], sourceIds)),
        ).pipe(
          map((results) =>
            results.filter((result): result is ContentLakeDuplicate => result !== null),
          ),
        ),
      ),
    );
  }

  private resolveDuplicateForFile(
    file: File,
    documents: NuxeoDocument[],
    sourceIds?: string[],
  ): Observable<ContentLakeDuplicate | null> {
    const matches = [...findRepositoryBlobMatches(file, documents)].sort((left, right) => {
      const leftMarked = isContentLakeIngestCurrent(left) ? 1 : 0;
      const rightMarked = isContentLakeIngestCurrent(right) ? 1 : 0;
      return rightMarked - leftMarked;
    });

    return this.probeFirstContentLakeMatch(matches, sourceIds).pipe(
      map((doc) =>
        doc
          ? {
              fileName: file.name,
              existingUid: doc.uid,
              existingTitle: doc.title,
              existingPath: doc.path,
            }
          : null,
      ),
    );
  }

  private probeFirstContentLakeMatch(
    documents: NuxeoDocument[],
    sourceIds?: string[],
    index = 0,
  ): Observable<NuxeoDocument | null> {
    if (index >= documents.length) {
      return of(null);
    }

    const doc = documents[index];
    if (isContentLakeIngestCurrent(doc)) {
      return of(doc);
    }

    return this.checkIngested(doc.uid, sourceIds).pipe(
      switchMap((ingested) =>
        ingested ? of(doc) : this.probeFirstContentLakeMatch(documents, sourceIds, index + 1),
      ),
    );
  }

  /**
   * Ask the CIC ingest connector whether the document blob is already present
   * in Content Lake. Tries each `sourceId` in order, then falls back to the
   * server default (`nuxeo.hyland.cic.ingest.default.sourceId`) when set.
   */
  checkIngested(documentUid: string, sourceIds?: string[]): Observable<boolean> {
    const uniqueSourceIds = [
      ...new Set((sourceIds ?? []).map((id) => id.trim()).filter((id) => id.length > 0)),
    ];
    // HylandIngest.CheckDigest requires a sourceId param — omitting it returns HTTP 500.
    // When KD agents expose no ids, pass "" so Nuxeo can apply
    // nuxeo.hyland.cic.ingest.default.sourceId.
    const candidates = uniqueSourceIds.length > 0 ? uniqueSourceIds : [''];

    const tryAt = (index: number): Observable<boolean> => {
      if (index >= candidates.length) {
        return of(false);
      }

      return this.checkIngestedOnce(documentUid, candidates[index]).pipe(
        switchMap((ingested) => (ingested ? of(true) : tryAt(index + 1))),
        catchError(() => tryAt(index + 1)),
      );
    };

    return tryAt(0);
  }

  /**
   * On document open, probe Content Lake via `HylandIngest.CheckDigest` and
   * backfill the local ingest marker when the blob is already indexed.
   */
  backfillIngestMarkerIfNeeded(
    doc: NuxeoDocument,
    sourceIds?: string[],
  ): Observable<ContentLakeBackfillResult> {
    if (!shouldProbeContentLakeIngestStatus(doc)) {
      return of({
        doc: null,
        presentInContentLake: isContentLakeIngestCurrent(doc),
      });
    }

    return this.checkIngested(doc.uid, sourceIds).pipe(
      switchMap((ingested) => {
        if (!ingested) {
          return of({ doc: null, presentInContentLake: false });
        }
        if (!resolveIngestMarkerWriteProperty(doc)) {
          return of({ doc: null, presentInContentLake: true });
        }
        return this.markIngested([doc.uid]).pipe(
          map((docs) => ({
            doc: docs[0] ?? null,
            presentInContentLake: true,
          })),
        );
      }),
      catchError(() => of({ doc: null, presentInContentLake: false })),
    );
  }

  private checkIngestedOnce(documentUid: string, sourceId: string): Observable<boolean> {
    const params: Record<string, unknown> = {
      xpath: 'file:content',
      sourceId,
    };

    return this.api
      .post<unknown>('/nuxeo/api/v1/automation/HylandIngest.CheckDigest', {
        params,
        context: {},
        input: documentUid,
      })
      .pipe(map((body) => parseContentLakeIngestCheckResult(body)));
  }

  /** Persist an ingest marker on each document so the UI can skip duplicate ingests. */
  markIngested(documentUids: string[]): Observable<NuxeoDocument[]> {
    if (documentUids.length === 0) {
      return of([]);
    }

    return forkJoin(documentUids.map((uid) => this.markSingleDocumentIngested(uid))).pipe(
      map((docs) => docs.filter((doc): doc is NuxeoDocument => doc !== null)),
    );
  }

  private markSingleDocumentIngested(uid: string): Observable<NuxeoDocument | null> {
    return this.api
      .get<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}`, undefined, { properties: '*' })
      .pipe(
        switchMap((doc) => {
          const digest = readBlobDigest(doc);
          const writeProperty = resolveIngestMarkerWriteProperty(doc);
          if (!digest || !writeProperty) {
            return of(null);
          }
          return this.browseService.updateDocument(uid, {
            [writeProperty]: buildContentLakeIngestMarker(digest),
          });
        }),
      );
  }

  private buildIngestQuery(documentUids: string[]): string {
    const escaped = documentUids.map((uid) => `'${uid.replace(/'/g, "''")}'`);
    if (escaped.length === 1) {
      return `SELECT * FROM Document WHERE ecm:uuid = ${escaped[0]}`;
    }
    return `SELECT * FROM Document WHERE ecm:uuid IN (${escaped.join(', ')})`;
  }

  private throwIfAutomationException(body: unknown): void {
    if (!body || typeof body !== 'object') {
      return;
    }
    const record = body as Record<string, unknown>;
    if (record['entity-type'] !== 'exception') {
      return;
    }
    const message =
      typeof record['message'] === 'string' && record['message'].trim().length > 0
        ? record['message'].trim()
        : 'Bulk ingest request failed.';
    throw new Error(message);
  }

  private readCommandId(body: unknown): string | null {
    if (typeof body === 'string' && body.trim().length > 0) {
      return body.trim();
    }
    if (!body || typeof body !== 'object') {
      return null;
    }

    const record = body as Record<string, unknown>;
    const nested = record['value'];
    if (nested && typeof nested === 'object') {
      const fromNested = this.readCommandIdFromRecord(nested as Record<string, unknown>);
      if (fromNested) {
        return fromNested;
      }
    }

    return this.readCommandIdFromRecord(record);
  }

  private readCommandIdFromRecord(record: Record<string, unknown>): string | null {
    const candidates = [record['commandId'], record['id'], record['command-id']];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
    return null;
  }

  private normalizeStatus(
    commandId: string,
    body: Record<string, unknown>,
  ): ContentLakeIngestStatus {
    const state = String(body['state'] ?? body['status'] ?? 'UNKNOWN').toUpperCase();
    return {
      commandId,
      state,
      processed: this.readNumber(body['processed']),
      error: body['error'] === true,
      errorCount: this.readNumber(body['errorCount'] ?? body['error-count']),
    };
  }

  private readNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  private isTerminal(status: ContentLakeIngestStatus): boolean {
    return TERMINAL_BULK_STATES.has(status.state.toUpperCase());
  }
}
