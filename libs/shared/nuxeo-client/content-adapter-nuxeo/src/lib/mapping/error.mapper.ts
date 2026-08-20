import { HttpErrorResponse } from '@angular/common/http';
import { ContentError, TransientError } from '@agentic-ui/shared/content-ports';
import { catchError, type Observable, throwError } from 'rxjs';

/**
 * Maps a Nuxeo/HTTP failure onto the closed port error taxonomy so callers branch on
 * a neutral discriminant instead of an HTTP status code.
 */
export function toContentError(error: unknown): ContentError {
  if (error instanceof ContentError) {
    return error;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return new ContentError('Terminal', 'Unexpected non-HTTP failure', { cause: error });
  }

  const message = `Nuxeo request failed with status ${error.status}`;

  switch (error.status) {
    case 0:
      return new TransientError('Nuxeo request failed before a response was received', {
        cause: error,
      });
    case 401:
      return new ContentError('Unauthenticated', message, { cause: error });
    case 403:
      return new ContentError('PermissionDenied', message, { cause: error });
    case 404:
      return new ContentError('NotFound', message, { cause: error });
    case 409:
      return new ContentError('Conflict', message, { cause: error });
    case 429:
      return new TransientError(message, { cause: error, retryAfterMs: retryAfterMs(error) });
    default:
      break;
  }

  if (error.status >= 500) {
    return new TransientError(message, { cause: error });
  }
  return new ContentError('Terminal', message, { cause: error });
}

function retryAfterMs(error: HttpErrorResponse): number | undefined {
  const header = error.headers?.get('Retry-After');
  if (!header) {
    return undefined;
  }
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds * 1000 : undefined;
}

/** Rewrites any failure on the stream into a {@link ContentError}. */
export function mapNuxeoError<T>() {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(catchError((error: unknown) => throwError(() => toContentError(error))));
}
