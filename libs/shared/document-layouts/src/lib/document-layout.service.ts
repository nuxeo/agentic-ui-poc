import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_BOOTSTRAP_CONFIG_URL } from '@nuxeo-satori/platform/app-config';
import { NuxeoApiBase } from '@nuxeo-satori/platform/nuxeo-client';
import {
  Observable,
  TimeoutError,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
  timeout,
} from 'rxjs';

import {
  LayoutFile,
  LayoutIndex,
  readLayoutEnvelope,
  readLayoutFile,
  readLayoutIndex,
} from './layout-file';
import { DocumentTypeDefinition, LayoutMode, ResolvedLayout } from './layout.model';
import { applyLayoutFile, generateLayout, readDocumentType } from './resolve-layout';

/** As for the bootstrap and manifest reads: `HttpClient` has no timeout of its own. */
export const LAYOUT_LOAD_TIMEOUT_MS = 10_000;

const EMPTY_INDEX: LayoutIndex = { entries: [], diagnostics: [] };

/** The directory the configuration service answers from, taken from the bootstrap URL. */
function configDirectory(bootstrapUrl: string): string {
  const path = bootstrapUrl.split(/[?#]/, 1)[0] ?? '';
  return path.slice(0, path.lastIndexOf('/') + 1);
}

export function layoutsIndexUrl(bootstrapUrl: string): string {
  return `${configDirectory(bootstrapUrl)}layouts.json`;
}

export function layoutFileUrl(bootstrapUrl: string, type: string, mode: string): string {
  return `${configDirectory(bootstrapUrl)}layouts/${encodeURIComponent(type)}/${encodeURIComponent(mode)}.layout.json`;
}

function describe(error: unknown): string {
  if (error instanceof TimeoutError) return `no response within ${LAYOUT_LOAD_TIMEOUT_MS / 1000} s`;
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === 'number' && status !== 0) return `HTTP ${status}`;
  const message = (error as { message?: unknown } | null)?.message;
  return typeof message === 'string' ? message : 'request failed';
}

/** The product app has no page showing diagnostics, so the console is where support finds them. */
function warn(message: string): void {
  console.warn(`[agentic-ui-layouts] ${message}`);
}

/**
 * Resolves the layout a document type shows in a mode.
 *
 * The contributed files come from the configuration service: `layouts.json` names the types and
 * modes a package contributed, and each file is fetched the first time a document of that type
 * needs it. Both are read once per session — the server changes them only on install and
 * restart. The type's schemas come from `/config/types/<type>`, which, asked for
 * `fetch-schema: fields`, also names the vocabulary a field is bound to.
 *
 * Tolerant, like the rest of the configuration: an unreachable or malformed index or file falls
 * back to the generated layout and says why in the console.
 */
@Injectable({ providedIn: 'root' })
export class DocumentLayoutService {
  private readonly api = inject(NuxeoApiBase);
  /** Anonymous reads skip the interceptors: no `Authorization` header, and no reset of the idle timer. */
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly bootstrapUrl = inject(APP_BOOTSTRAP_CONFIG_URL);

  private index$: Observable<LayoutIndex> | null = null;
  private readonly files = new Map<string, Observable<LayoutFile | null>>();
  private readonly types = new Map<string, Observable<DocumentTypeDefinition | null>>();

  /** The layout to render, or `null` when the type's schemas cannot be read. Never errors. */
  layoutFor(type: string, mode: LayoutMode): Observable<ResolvedLayout | null> {
    return combineLatest([this.documentType(type), this.contributed(type, mode)]).pipe(
      map(([definition, file]) => {
        if (!definition) return null;
        if (!file) return generateLayout(definition, mode);
        const { layout, skipped } = applyLayoutFile(definition, mode, file);
        for (const xpath of skipped) {
          warn(`${type}/${mode} layout: field ${xpath} is not on the ${type} type; skipped`);
        }
        return layout;
      }),
    );
  }

  private documentType(type: string): Observable<DocumentTypeDefinition | null> {
    let cached = this.types.get(type);
    if (!cached) {
      cached = this.api
        .get<unknown>(`/nuxeo/api/v1/config/types/${encodeURIComponent(type)}`, undefined, {
          'fetch-schema': 'fields',
        })
        .pipe(
          map((raw) => {
            const definition = readDocumentType(raw, type);
            if (!definition) throw new Error('the response is not a document type');
            return definition;
          }),
          catchError((error: unknown) => {
            // Not cached, so the next document of this type asks again.
            this.types.delete(type);
            warn(`schemas of ${type} not read: ${describe(error)}`);
            return of(null);
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.types.set(type, cached);
    }
    return cached;
  }

  private contributed(type: string, mode: LayoutMode): Observable<LayoutFile | null> {
    const key = `${type}/${mode}`;
    let cached = this.files.get(key);
    if (!cached) {
      cached = this.index().pipe(
        switchMap((index) =>
          index.entries.some((entry) => entry.type === type && entry.mode === mode)
            ? this.fetchFile(type, mode)
            : of(null),
        ),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.files.set(key, cached);
    }
    return cached;
  }

  private index(): Observable<LayoutIndex> {
    const url = layoutsIndexUrl(this.bootstrapUrl);
    this.index$ ??= this.http.get<unknown>(url).pipe(
      timeout(LAYOUT_LOAD_TIMEOUT_MS),
      map((raw) => {
        const index = readLayoutIndex(raw);
        if ('invalid' in index) {
          warn(`layouts from ${url} ignored: ${index.invalid}`);
          return EMPTY_INDEX;
        }
        for (const { level, code, message } of index.diagnostics) {
          warn(`server ${level} ${code}: ${message}`);
        }
        return index;
      }),
      catchError((error: unknown) => {
        warn(`layouts not loaded from ${url}: ${describe(error)}`);
        return of(EMPTY_INDEX);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.index$;
  }

  private fetchFile(type: string, mode: LayoutMode): Observable<LayoutFile | null> {
    const url = layoutFileUrl(this.bootstrapUrl, type, mode);
    return this.http.get<unknown>(url).pipe(
      timeout(LAYOUT_LOAD_TIMEOUT_MS),
      map((raw) => {
        const envelope = readLayoutEnvelope(raw, type, mode);
        if ('invalid' in envelope) {
          warn(`${type}/${mode} layout from ${url} ignored: ${envelope.invalid}`);
          return null;
        }
        const file = readLayoutFile(envelope.content);
        if ('invalid' in file) {
          warn(
            `${type}/${mode} layout from ${url} refused, showing the generated layout: ${file.invalid}`,
          );
          return null;
        }
        for (const problem of file.problems) warn(`${type}/${mode} layout: ${problem}; skipped`);
        return file;
      }),
      catchError((error: unknown) => {
        warn(`${type}/${mode} layout not loaded from ${url}: ${describe(error)}`);
        return of(null);
      }),
    );
  }
}
