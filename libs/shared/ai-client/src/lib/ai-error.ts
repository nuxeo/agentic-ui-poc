/**
 * Longest detail string kept from a failed response body.
 *
 * Nuxeo returns a short JSON exception, but a session that has expired returns the whole
 * HTML login page instead. The result of this function is held in a signal for as long as
 * the page lives, so the detail is bounded rather than retained whole.
 */
const MAX_DETAIL_LENGTH = 200;

/**
 * Describe a failed `AI.*` Automation call in terms a reader can act on.
 *
 * Nuxeo Automation reports a failure as
 * `{ "entity-type": "exception", "status": 500, "message": "..." }`.
 * Callers used to read `error.error`, which is the shape of the Express AI backend that was
 * retired when the operations moved into the marketplace package — so the detail was always
 * `undefined` and every caller silently showed its generic fallback. Both shapes are read
 * here so the answer is right whichever backend responds.
 */
export function aiErrorMessage(err: unknown, fallback: string): string {
  const status = readStatus(err);
  const detail = readDetail(err);

  // Angular reports an unreachable server, a DNS failure or a CORS rejection as status 0,
  // where the body is empty and "HTTP 0" would tell the reader nothing.
  if (status === 0) {
    return `${fallback} (could not reach the server)`;
  }

  // The detail is the useful half, so it is reported whenever present. A thrown object with
  // no status is not a real HttpErrorResponse, but tests and interceptors produce them and
  // dropping their message loses the only diagnostic there is.
  if (detail) {
    return status === undefined
      ? `${fallback}: ${detail}`
      : `${fallback} (HTTP ${status}: ${detail})`;
  }

  return status === undefined ? fallback : `${fallback} (HTTP ${status})`;
}

function readStatus(err: unknown): number | undefined {
  const status = (err as { status?: unknown })?.status;
  return typeof status === 'number' ? status : undefined;
}

function readDetail(err: unknown): string | undefined {
  const body = (err as { error?: unknown })?.error;

  if (typeof body === 'string') {
    // An expired session yields an HTML login page, which describes nothing about the failure.
    return body.trimStart().startsWith('<') ? undefined : clamp(body);
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    // `message` is Nuxeo Automation; `error` is the retired Express backend.
    const detail = record['message'] ?? record['error'];
    if (typeof detail === 'string') return clamp(detail);
  }

  return undefined;
}

function clamp(value: string): string {
  const text = value.trim();
  if (!text) return '';
  return text.length > MAX_DETAIL_LENGTH ? `${text.slice(0, MAX_DETAIL_LENGTH)}…` : text;
}
