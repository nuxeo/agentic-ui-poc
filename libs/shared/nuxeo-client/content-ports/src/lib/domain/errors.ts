/**
 * The closed port-level error taxonomy. Every adapter maps its native error shape
 * onto exactly one of these kinds at the port boundary, so callers branch on a
 * backend-neutral discriminant rather than on HTTP status codes.
 */
export type ContentErrorKind =
  | 'Unauthenticated'
  | 'PermissionDenied'
  | 'NotFound'
  | 'Conflict'
  | 'UnsupportedField'
  | 'UnsupportedFilter'
  | 'UnsupportedEnrichment'
  | 'Transient'
  | 'Terminal';

/**
 * The neutral error raised across every port. `cause` preserves the adapter-native
 * error for logging without leaking it into control flow.
 */
export class ContentError extends Error {
  readonly kind: ContentErrorKind;
  override readonly cause?: unknown;

  constructor(kind: ContentErrorKind, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ContentError';
    this.kind = kind;
    this.cause = options?.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * A temporary failure that is safe to retry. `retryAfterMs`, when present, is the
 * adapter's hint for how long to wait.
 */
export class TransientError extends ContentError {
  readonly retryAfterMs?: number;

  constructor(message: string, options?: { cause?: unknown; retryAfterMs?: number }) {
    super('Transient', message, options);
    this.name = 'TransientError';
    this.retryAfterMs = options?.retryAfterMs;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Narrows an unknown thrown value to a {@link ContentError}. */
export function isContentError(value: unknown): value is ContentError {
  return value instanceof ContentError;
}
