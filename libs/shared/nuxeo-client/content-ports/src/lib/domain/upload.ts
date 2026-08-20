/** Coarse phase of an upload, driving UI state without leaking backend protocol. */
export type UploadPhase = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

/**
 * Options supplied when starting an upload. `conflictBehaviour` is neutral over the
 * backend-specific overwrite/version semantics. Chunking fields are hints; adapters
 * that do not chunk ignore them.
 */
export interface UploadOptions {
  readonly fileName: string;
  readonly mimeType?: string;
  readonly primaryType?: string;
  readonly conflictBehaviour?: 'fail' | 'overwrite' | 'autoRename';
  readonly preferChunked?: boolean;
  readonly chunkSizeBytes?: number;
  readonly chunkConcurrency?: number;
  readonly chunkRetries?: number;
  readonly chunkRetryDelayMs?: number;
  readonly stagingPollIntervalMs?: number;
  readonly stagingPollMaxAttempts?: number;
}

/** A progress event emitted while an upload is in flight. */
export interface UploadProgress {
  readonly phase: UploadPhase;
  readonly bytesSent?: number;
  readonly bytesTotal?: number;
  /** Populated when {@link UploadProgress.phase} is `failed`. */
  readonly error?: string;
  /**
   * Opaque backend staging identifier assigned once bytes are fully received.
   * Callers that need to reference the staged payload should use this rather than
   * any backend-specific field.
   */
  readonly stagingRef?: string;
}

/**
 * A handle to an in-flight or completed upload. `nodeId` is populated once the
 * backend has materialised the node.
 */
export interface UploadHandle {
  readonly id: string;
  readonly nodeId?: string;
  cancel(): void;
}
