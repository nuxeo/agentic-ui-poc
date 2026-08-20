import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ContentError, TransientError } from '@agentic-ui/shared/content-ports';

import { toContentError } from './error.mapper';

function httpError(status: number, headers?: HttpHeaders): HttpErrorResponse {
  return new HttpErrorResponse({ status, statusText: 'error', headers });
}

describe('toContentError', () => {
  it.each([
    [401, 'Unauthenticated'],
    [403, 'PermissionDenied'],
    [404, 'NotFound'],
    [409, 'Conflict'],
  ])('maps HTTP %i onto %s', (status, kind) => {
    expect(toContentError(httpError(status)).kind).toBe(kind);
  });

  it('treats server errors and connection failures as retryable', () => {
    expect(toContentError(httpError(500))).toBeInstanceOf(TransientError);
    expect(toContentError(httpError(503))).toBeInstanceOf(TransientError);
    expect(toContentError(httpError(0))).toBeInstanceOf(TransientError);
  });

  it('reads the Retry-After hint on a throttled response', () => {
    const headers = new HttpHeaders({ 'Retry-After': '30' });
    const error = toContentError(httpError(429));
    expect(error).toBeInstanceOf(TransientError);

    const withHeader = toContentError(httpError(429, headers)) as TransientError;
    expect(withHeader.retryAfterMs).toBe(30_000);
  });

  it('maps an unmatched 4xx onto a terminal failure', () => {
    expect(toContentError(httpError(418)).kind).toBe('Terminal');
  });

  it('passes an existing ContentError through unchanged', () => {
    const original = new ContentError('UnsupportedFilter', 'nope');
    expect(toContentError(original)).toBe(original);
  });

  it('wraps a non-HTTP failure and preserves the cause', () => {
    const cause = new Error('boom');
    const mapped = toContentError(cause);
    expect(mapped.kind).toBe('Terminal');
    expect(mapped.cause).toBe(cause);
  });
});
