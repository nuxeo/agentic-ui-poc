/**
 * `?` and `#` end the path in a URL, and whitespace cannot appear in a segment, so a
 * path containing any of them describes a route no navigation can ever reach.
 */
const NOT_A_PATH_SEGMENT = /[\s?#]/;
/**
 * Why the router would refuse this path, or `null` when it would accept it.
 *
 * `Router.resetConfig` validates only under `ngDevMode`, so an invalid path is a
 * thrown `RuntimeError` in development and a permanently unmatchable route in a
 * production build. Checking here makes the two agree, and makes them both agree
 * with the tolerant-manifest contract the config loaders state: a customer who saves
 * something invalid gets the packaged application back, not a blank screen.
 *
 * The empty path is rejected even though Angular permits it. Contributions are
 * appended to the host route's children, after the shell's own `{ path: '' }`, so an
 * empty contributed path is matched by nothing and only looks like a working route.
 */
export function extensionRoutePathRejection(path) {
    if (typeof path !== 'string') {
        return `path must be a string, not ${path === null ? 'null' : typeof path}`;
    }
    if (path === '') {
        return 'path must not be empty';
    }
    if (path.startsWith('/')) {
        return `path "${path}" must be relative to the host route: Angular rejects a leading slash`;
    }
    if (NOT_A_PATH_SEGMENT.test(path)) {
        return `path "${path}" must not contain whitespace, "?" or "#"`;
    }
    return null;
}
/** Split descriptors into the ones the router can take and the ones it cannot. */
export function partitionExtensionRouteDescriptors(descriptors) {
    const accepted = [];
    const rejected = [];
    for (const descriptor of descriptors) {
        const reason = extensionRoutePathRejection(descriptor.path);
        if (reason === null)
            accepted.push(descriptor);
        else
            rejected.push({ id: descriptor.id, reason });
    }
    return { accepted, rejected };
}
