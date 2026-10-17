import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, of, switchMap, throwError, timer } from 'rxjs';
import { buildContentLakeIngestMarker, buildContentLakeDuplicateSearchQuery, findRepositoryBlobMatches, isContentLakeIngestCurrent, parseContentLakeIngestCheckResult, readBlobDigest, resolveIngestMarkerWriteProperty, shouldProbeContentLakeIngestStatus, } from '../utils/content-lake-ingest';
import { BrowseService } from './browse.service';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
const TERMINAL_BULK_STATES = new Set(['COMPLETED', 'ABORTED', 'COMPLETED_WITH_ERROR']);
export const CONTENT_LAKE_INGEST_POLL_MAX_ATTEMPTS = 60;
/**
 * Triggers HxAI Content Lake ingestion for Nuxeo documents via the
 * `nuxeo-hxai-connector` bulk `ingest` action. The Angular app never calls
 * Content Lake directly — files must exist in Nuxeo first.
 */
export class ContentLakeIngestService {
    api = inject(NuxeoApiBase);
    browseService = inject(BrowseService);
    // Its error messages reach the screen through `err.message` in two components, and the stalled
    // one is composed from status fields only this service holds, so they are resolved here.
    translate = inject(TranslateService);
    startIngest(documentUids) {
        if (documentUids.length === 0) {
            return throwError(() => new Error('At least one document id is required to ingest.'));
        }
        const query = this.buildIngestQuery(documentUids);
        return this.api
            .post('/nuxeo/api/v1/automation/Bulk.RunAction', {
            params: { action: 'ingest', query },
            context: {},
        })
            .pipe(map((body) => {
            this.throwIfAutomationException(body);
            const commandId = this.readCommandId(body);
            if (!commandId) {
                throw new Error(this.translate.instant('shared.content-lake.no-command-id'));
            }
            return { commandId };
        }));
    }
    getStatus(commandId) {
        return this.api
            .get(`/nuxeo/api/v1/bulk/${encodeURIComponent(commandId)}`)
            .pipe(map((body) => this.normalizeStatus(commandId, body)));
    }
    waitUntilComplete(commandId, pollIntervalMs = 2000, maxPollAttempts = CONTENT_LAKE_INGEST_POLL_MAX_ATTEMPTS) {
        const poll = (attempt) => this.getStatus(commandId).pipe(switchMap((status) => {
            if (this.isTerminal(status)) {
                return of(status);
            }
            if (attempt >= maxPollAttempts) {
                return throwError(() => new Error(this.buildStalledIngestMessage(status)));
            }
            return timer(pollIntervalMs).pipe(switchMap(() => poll(attempt + 1)));
        }));
        return poll(0);
    }
    /**
     * Find repository documents that match selected files (name + blob size) and are
     * already in Content Lake — via local ingest marker or `HylandIngest.CheckDigest`.
     */
    findDuplicates(files, sourceIds) {
        if (files.length === 0) {
            return of([]);
        }
        const query = buildContentLakeDuplicateSearchQuery(files);
        const pageSize = Math.min(500, Math.max(files.length * 5, files.length));
        return this.api.nxqlSearch(query, pageSize, { properties: '*' }).pipe(catchError(() => of({
            entries: [],
            totalSize: 0,
            currentPageSize: 0,
            currentPageIndex: 0,
            numberOfPages: 0,
        })), switchMap((list) => forkJoin(files.map((file) => this.resolveDuplicateForFile(file, list.entries ?? [], sourceIds))).pipe(map((results) => results.filter((result) => result !== null)))));
    }
    resolveDuplicateForFile(file, documents, sourceIds) {
        const matches = [...findRepositoryBlobMatches(file, documents)].sort((left, right) => {
            const leftMarked = isContentLakeIngestCurrent(left) ? 1 : 0;
            const rightMarked = isContentLakeIngestCurrent(right) ? 1 : 0;
            return rightMarked - leftMarked;
        });
        return this.probeFirstContentLakeMatch(matches, sourceIds).pipe(map((doc) => doc
            ? {
                fileName: file.name,
                existingUid: doc.uid,
                existingTitle: doc.title,
                existingPath: doc.path,
            }
            : null));
    }
    probeFirstContentLakeMatch(documents, sourceIds, index = 0) {
        if (index >= documents.length) {
            return of(null);
        }
        const doc = documents[index];
        if (isContentLakeIngestCurrent(doc)) {
            return of(doc);
        }
        return this.checkIngested(doc.uid, sourceIds).pipe(switchMap((ingested) => ingested ? of(doc) : this.probeFirstContentLakeMatch(documents, sourceIds, index + 1)));
    }
    /**
     * Ask the CIC ingest connector whether the document blob is already present
     * in Content Lake. Tries each `sourceId` in order, then falls back to the
     * server default (`nuxeo.hyland.cic.ingest.default.sourceId`) when set.
     */
    checkIngested(documentUid, sourceIds) {
        const uniqueSourceIds = [
            ...new Set((sourceIds ?? []).map((id) => id.trim()).filter((id) => id.length > 0)),
        ];
        // HylandIngest.CheckDigest requires a sourceId param — omitting it returns HTTP 500.
        // When KD agents expose no ids, pass "" so Nuxeo can apply
        // nuxeo.hyland.cic.ingest.default.sourceId.
        const candidates = uniqueSourceIds.length > 0 ? uniqueSourceIds : [''];
        const tryAt = (index) => {
            if (index >= candidates.length) {
                return of(false);
            }
            return this.checkIngestedOnce(documentUid, candidates[index]).pipe(switchMap((ingested) => (ingested ? of(true) : tryAt(index + 1))), catchError(() => tryAt(index + 1)));
        };
        return tryAt(0);
    }
    /**
     * On document open, probe Content Lake via `HylandIngest.CheckDigest` and
     * backfill the local ingest marker when the blob is already indexed.
     */
    backfillIngestMarkerIfNeeded(doc, sourceIds) {
        if (!shouldProbeContentLakeIngestStatus(doc)) {
            return of({
                doc: null,
                presentInContentLake: isContentLakeIngestCurrent(doc),
            });
        }
        return this.checkIngested(doc.uid, sourceIds).pipe(switchMap((ingested) => {
            if (!ingested) {
                return of({ doc: null, presentInContentLake: false });
            }
            if (!resolveIngestMarkerWriteProperty(doc)) {
                return of({ doc: null, presentInContentLake: true });
            }
            return this.markIngested([doc.uid]).pipe(map((docs) => ({
                doc: docs[0] ?? null,
                presentInContentLake: true,
            })));
        }), catchError(() => of({ doc: null, presentInContentLake: false })));
    }
    checkIngestedOnce(documentUid, sourceId) {
        const params = {
            xpath: 'file:content',
            sourceId,
        };
        return this.api
            .post('/nuxeo/api/v1/automation/HylandIngest.CheckDigest', {
            params,
            context: {},
            input: documentUid,
        })
            .pipe(map((body) => parseContentLakeIngestCheckResult(body)));
    }
    /** Persist an ingest marker on each document so the UI can skip duplicate ingests. */
    markIngested(documentUids) {
        if (documentUids.length === 0) {
            return of([]);
        }
        return forkJoin(documentUids.map((uid) => this.markSingleDocumentIngested(uid))).pipe(map((docs) => docs.filter((doc) => doc !== null)));
    }
    markSingleDocumentIngested(uid) {
        return this.api
            .get(`/nuxeo/api/v1/id/${uid}`, undefined, { properties: '*' })
            .pipe(switchMap((doc) => {
            const digest = readBlobDigest(doc);
            const writeProperty = resolveIngestMarkerWriteProperty(doc);
            if (!digest || !writeProperty) {
                return of(null);
            }
            return this.browseService.updateDocument(uid, {
                [writeProperty]: buildContentLakeIngestMarker(digest),
            });
        }));
    }
    buildIngestQuery(documentUids) {
        const escaped = documentUids.map((uid) => `'${uid.replace(/'/g, "''")}'`);
        if (escaped.length === 1) {
            return `SELECT * FROM Document WHERE ecm:uuid = ${escaped[0]}`;
        }
        return `SELECT * FROM Document WHERE ecm:uuid IN (${escaped.join(', ')})`;
    }
    throwIfAutomationException(body) {
        if (!body || typeof body !== 'object') {
            return;
        }
        const record = body;
        if (record['entity-type'] !== 'exception') {
            return;
        }
        const message = typeof record['message'] === 'string' && record['message'].trim().length > 0
            ? record['message'].trim()
            : this.translate.instant('shared.content-lake.bulk-ingest-failed');
        throw new Error(message);
    }
    readCommandId(body) {
        if (typeof body === 'string' && body.trim().length > 0) {
            return body.trim();
        }
        if (!body || typeof body !== 'object') {
            return null;
        }
        const record = body;
        const nested = record['value'];
        if (nested && typeof nested === 'object') {
            const fromNested = this.readCommandIdFromRecord(nested);
            if (fromNested) {
                return fromNested;
            }
        }
        return this.readCommandIdFromRecord(record);
    }
    readCommandIdFromRecord(record) {
        const candidates = [record['commandId'], record['id'], record['command-id']];
        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }
        return null;
    }
    normalizeStatus(commandId, body) {
        const state = String(body['state'] ?? body['status'] ?? 'UNKNOWN').toUpperCase();
        const total = this.readOptionalNumber(body['total']);
        return {
            commandId,
            state,
            processed: this.readNumber(body['processed']),
            ...(total === undefined ? {} : { total }),
            error: body['error'] === true,
            errorCount: this.readNumber(body['errorCount'] ?? body['error-count']),
        };
    }
    buildStalledIngestMessage(status) {
        const params = {
            commandId: status.commandId,
            state: status.state,
            processed: status.processed,
            total: status.total,
        };
        return this.translate.instant(status.total === undefined
            ? 'shared.content-lake.ingest-stalled-unknown-total'
            : 'shared.content-lake.ingest-stalled', params);
    }
    readNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }
    readOptionalNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    }
    isTerminal(status) {
        return TERMINAL_BULK_STATES.has(status.state.toUpperCase());
    }
    static ɵfac = function ContentLakeIngestService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContentLakeIngestService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ContentLakeIngestService, factory: ContentLakeIngestService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentLakeIngestService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
