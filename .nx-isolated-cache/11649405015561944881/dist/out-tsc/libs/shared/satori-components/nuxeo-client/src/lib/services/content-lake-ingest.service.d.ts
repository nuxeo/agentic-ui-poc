import { Observable } from 'rxjs';
import type { ContentLakeDuplicate, ContentLakeBackfillResult, ContentLakeIngestCommand, ContentLakeIngestStatus } from '../models/content-lake-ingest.model';
import type { NuxeoDocument } from '../models/document.model';
import * as i0 from "@angular/core";
export declare const CONTENT_LAKE_INGEST_POLL_MAX_ATTEMPTS = 60;
/**
 * Triggers HxAI Content Lake ingestion for Nuxeo documents via the
 * `nuxeo-hxai-connector` bulk `ingest` action. The Angular app never calls
 * Content Lake directly — files must exist in Nuxeo first.
 */
export declare class ContentLakeIngestService {
    private readonly api;
    private readonly browseService;
    private readonly translate;
    startIngest(documentUids: string[]): Observable<ContentLakeIngestCommand>;
    getStatus(commandId: string): Observable<ContentLakeIngestStatus>;
    waitUntilComplete(commandId: string, pollIntervalMs?: number, maxPollAttempts?: number): Observable<ContentLakeIngestStatus>;
    /**
     * Find repository documents that match selected files (name + blob size) and are
     * already in Content Lake — via local ingest marker or `HylandIngest.CheckDigest`.
     */
    findDuplicates(files: File[], sourceIds?: string[]): Observable<ContentLakeDuplicate[]>;
    private resolveDuplicateForFile;
    private probeFirstContentLakeMatch;
    /**
     * Ask the CIC ingest connector whether the document blob is already present
     * in Content Lake. Tries each `sourceId` in order, then falls back to the
     * server default (`nuxeo.hyland.cic.ingest.default.sourceId`) when set.
     */
    checkIngested(documentUid: string, sourceIds?: string[]): Observable<boolean>;
    /**
     * On document open, probe Content Lake via `HylandIngest.CheckDigest` and
     * backfill the local ingest marker when the blob is already indexed.
     */
    backfillIngestMarkerIfNeeded(doc: NuxeoDocument, sourceIds?: string[]): Observable<ContentLakeBackfillResult>;
    private checkIngestedOnce;
    /** Persist an ingest marker on each document so the UI can skip duplicate ingests. */
    markIngested(documentUids: string[]): Observable<NuxeoDocument[]>;
    private markSingleDocumentIngested;
    private buildIngestQuery;
    private throwIfAutomationException;
    private readCommandId;
    private readCommandIdFromRecord;
    private normalizeStatus;
    private buildStalledIngestMessage;
    private readNumber;
    private readOptionalNumber;
    private isTerminal;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentLakeIngestService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContentLakeIngestService>;
}
//# sourceMappingURL=content-lake-ingest.service.d.ts.map