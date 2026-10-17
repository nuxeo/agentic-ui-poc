/**
 * The variant for a failed request.
 *
 * 401, 403 and 404 map to themselves. Anything else — a 5xx, a network failure (status 0), an
 * error thrown with no status at all — is 500: the request did not complete and nothing says the
 * user is the reason.
 */
export function nxsErrorStatus(error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
    return status === 401 || status === 403 || status === 404 ? status : 500;
}
//# sourceMappingURL=error-status.js.map