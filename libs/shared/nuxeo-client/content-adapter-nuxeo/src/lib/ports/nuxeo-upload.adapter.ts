import { Injectable, inject } from '@angular/core';
import { DocumentImportService } from '@agentic-ui/shared/nuxeo-client';
import {
  ContentError,
  type ContentNode,
  type ContentNodeDraft,
  type UploadCapabilities,
  type UploadHandle,
  type UploadOptions,
  type UploadPort,
  type UploadProgress,
} from '@agentic-ui/shared/content-ports';
import {
  BehaviorSubject,
  filter,
  map,
  of,
  switchMap,
  take,
  throwError,
  type Observable,
} from 'rxjs';
import { nuxeoUploadCapabilities } from '../capabilities';
import { toContentNode } from '../mapping/content-node.mapper';
import { mapNuxeoError, toContentError } from '../mapping/error.mapper';

interface StagedUpload {
  readonly handle: UploadHandle;
  readonly progress: BehaviorSubject<UploadProgress>;
  batchId?: string;
  cancelled: boolean;
}

/**
 * The Nuxeo {@link UploadPort}, over Nuxeo's batch-upload protocol: `begin` opens a
 * batch and streams the bytes into index 0; `attach` creates the document that
 * references the staged batch.
 *
 * MISFIT — the port's `begin` is synchronous (it returns a handle, not an observable)
 * while opening a Nuxeo batch is a network call. The batch id therefore lands on the
 * handle asynchronously, and `attach` waits for staging to be confirmed. Bulk and CSV
 * import stay on `DocumentImportService`; the port models one file at a time.
 */
@Injectable({ providedIn: 'root' })
export class NuxeoUploadAdapter implements UploadPort {
  private readonly imports = inject(DocumentImportService);
  private readonly staged = new Map<string, StagedUpload>();
  private sequence = 0;

  begin(file: File, _options?: UploadOptions): UploadHandle {
    const id = `nuxeo-upload-${++this.sequence}`;
    const progress = new BehaviorSubject<UploadProgress>({
      phase: 'pending',
      bytesSent: 0,
      bytesTotal: file.size,
    });

    const entry: StagedUpload = {
      handle: {
        id,
        cancel: () => this.cancelById(id),
      },
      progress,
      cancelled: false,
    };
    this.staged.set(id, entry);

    this.imports.initUploadBatch().subscribe({
      next: (batchId) => {
        if (entry.cancelled) {
          return;
        }
        entry.batchId = batchId;
        progress.next({ phase: 'uploading', bytesSent: 0, bytesTotal: file.size });
        this.transfer(entry, file);
      },
      error: (error: unknown) => {
        progress.next({ phase: 'failed', error: toContentError(error).message });
      },
    });

    return entry.handle;
  }

  progress(handle: UploadHandle): Observable<UploadProgress> {
    const entry = this.staged.get(handle.id);
    if (!entry) {
      return throwError(() => new ContentError('NotFound', `unknown upload '${handle.id}'`));
    }
    return entry.progress.asObservable();
  }

  attach(handle: UploadHandle, parentId: string, draft: ContentNodeDraft): Observable<ContentNode> {
    const entry = this.staged.get(handle.id);
    if (!entry) {
      return throwError(() => new ContentError('NotFound', `unknown upload '${handle.id}'`));
    }

    return this.awaitStaged(entry).pipe(
      switchMap((batchId) =>
        this.imports.createDocumentWithBlob(
          parentId,
          draft.name,
          draft.primaryType,
          {},
          batchId,
          0,
        ),
      ),
      mapNuxeoError(),
      map((doc) => {
        entry.progress.next({ phase: 'completed', stagingRef: entry.batchId });
        this.staged.delete(handle.id);
        return toContentNode(doc);
      }),
    );
  }

  cancel(handle: UploadHandle): void {
    this.cancelById(handle.id);
  }

  capabilities(): UploadCapabilities {
    return nuxeoUploadCapabilities;
  }

  private transfer(entry: StagedUpload, file: File): void {
    const batchId = entry.batchId;
    if (!batchId) {
      return;
    }
    this.imports
      .uploadFileToBatch(batchId, 0, file, (percent) => {
        entry.progress.next({
          phase: 'uploading',
          bytesSent: Math.round((percent / 100) * file.size),
          bytesTotal: file.size,
        });
      })
      .subscribe({
        next: () => {
          entry.progress.next({
            phase: 'processing',
            bytesSent: file.size,
            bytesTotal: file.size,
            stagingRef: batchId,
          });
        },
        error: (error: unknown) => {
          entry.progress.next({
            phase: 'failed',
            error: toContentError(error).message,
            bytesTotal: file.size,
          });
        },
      });
  }

  /**
   * Resolves once the batch exists and the bytes have been staged. Emits exactly one
   * value so `attach` completes rather than tracking the progress subject for ever.
   */
  private awaitStaged(entry: StagedUpload): Observable<string> {
    return entry.progress.pipe(
      filter((progress) => progress.phase === 'processing' || progress.phase === 'failed'),
      take(1),
      switchMap((progress) => {
        if (progress.phase === 'failed' || !entry.batchId) {
          return throwError(
            () => new ContentError('Terminal', progress.error ?? 'upload failed before attach'),
          );
        }
        return of(entry.batchId);
      }),
    );
  }

  private cancelById(id: string): void {
    const entry = this.staged.get(id);
    if (!entry) {
      return;
    }
    entry.cancelled = true;
    entry.progress.next({ phase: 'failed', error: 'cancelled' });
    this.staged.delete(id);
  }
}
