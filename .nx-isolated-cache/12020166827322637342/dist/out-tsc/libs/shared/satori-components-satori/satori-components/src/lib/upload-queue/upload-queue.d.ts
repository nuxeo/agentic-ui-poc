import type { NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsErrorStatus } from '../error-state/error-status';
/** Where a file stands: chosen, waiting its turn, on its way, created, or refused. */
export type NxsUploadState = 'staged' | 'waiting' | 'uploading' | 'done' | 'failed';
/** One file in an upload queue. */
export interface NxsUploadItem {
    readonly id: string;
    readonly file: File;
    readonly state: NxsUploadState;
    /** This file's own progress, 0 to 100. */
    readonly percent: number;
    /** Why it failed, by status, when it did. */
    readonly error: NxsErrorStatus | null;
    /** The document created from it, once done. */
    readonly document: NuxeoDocument | null;
}
/**
 * The progress `DocumentImportService` reports while it uploads a list of files in one batch:
 * the whole list's percent and the index of the file in hand.
 */
export interface NxsUploadProgress {
    readonly percent: number;
    readonly fileIndex?: number;
    readonly fileCount?: number;
}
/**
 * The state of one upload queue: the files chosen, then each file's progress and outcome while
 * they upload, in order. `nxs-upload-queue` draws it.
 *
 * It does no request itself. A page stages files, then runs its upload — usually
 * `DocumentImportService.importFiles(path, queue.pending(), { onProgress: (p) => queue.progress(p) })`
 * — and reports the outcome with `complete` or `fail`. So the same queue serves an import dialog
 * and files dropped on a list, with the request each already makes.
 */
export declare class NxsUploadQueue {
    private readonly state;
    /** The ids of the files in the run under way, in upload order. */
    private running;
    /** Every file, in the order chosen. */
    readonly items: import("@angular/core").Signal<readonly NxsUploadItem[]>;
    /** Whether a run is under way. */
    readonly busy: import("@angular/core").Signal<boolean>;
    readonly done: import("@angular/core").Signal<NxsUploadItem[]>;
    readonly failed: import("@angular/core").Signal<NxsUploadItem[]>;
    /** Adds files to the queue, not yet uploading. */
    stage(files: readonly File[]): void;
    /** The files not uploaded yet — chosen, or refused last time — in order: what a run uploads. */
    pending(): File[];
    /** Marks the pending files as this run's, waiting their turn. */
    start(): void;
    /** Moves the run along: files before `fileIndex` are on their way to done, that one is uploading. */
    progress(progress: NxsUploadProgress): void;
    /** The run finished: each file created, its document in the same order. */
    complete(documents: readonly NuxeoDocument[]): void;
    /**
     * The run stopped on a failure. Files that had reached 100% were created, and are done; the first
     * that had not failed, with the error's status; the ones after it never started, and go back to
     * the queue for another run.
     */
    fail(error: unknown): void;
    /** Takes a file out, unless it is part of a run under way. */
    remove(id: string): void;
    /** Drops the files that are done, keeping the rest. */
    clearDone(): void;
    /** Empties the queue, unless a run is under way. */
    clear(): void;
    private update;
}
//# sourceMappingURL=upload-queue.d.ts.map