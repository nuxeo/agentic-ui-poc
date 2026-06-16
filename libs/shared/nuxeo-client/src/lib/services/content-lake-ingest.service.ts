import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap, throwError, timer } from 'rxjs';

import type {
  ContentLakeIngestCommand,
  ContentLakeIngestStatus,
} from '../models/content-lake-ingest.model';
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
  private readonly http = inject(HttpClient);

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
    return this.http
      .get<
        Record<string, unknown>
      >(this.api.apiUrl(`/nuxeo/api/v1/bulk/${encodeURIComponent(commandId)}`))
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
