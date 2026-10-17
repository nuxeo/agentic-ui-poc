import type { ExtensionRouteDescriptor } from './extension-actions';
/**
 * A route descriptor the router would not have accepted, and why.
 *
 * Reported rather than dropped for the same reason `ResolvedExtensionConfig.missing`
 * is: a customer whose entry vanished needs to be told which one and what was wrong
 * with it, or the manifest becomes something you debug by bisection.
 */
export interface RejectedExtensionRoute {
    /** Descriptor id, so the entry is findable in the manifest that declared it. */
    readonly id: string;
    /** Human-readable cause, quoting the offending path when there is one. */
    readonly reason: string;
}
export interface PartitionedExtensionRoutes {
    readonly accepted: readonly ExtensionRouteDescriptor[];
    readonly rejected: readonly RejectedExtensionRoute[];
}
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
export declare function extensionRoutePathRejection(path: unknown): string | null;
/** Split descriptors into the ones the router can take and the ones it cannot. */
export declare function partitionExtensionRouteDescriptors(descriptors: readonly ExtensionRouteDescriptor[]): PartitionedExtensionRoutes;
//# sourceMappingURL=extension-route-paths.d.ts.map