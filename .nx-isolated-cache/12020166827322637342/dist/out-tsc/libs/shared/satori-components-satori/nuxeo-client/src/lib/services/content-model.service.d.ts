import { Observable } from 'rxjs';
import { NuxeoContentModel } from '../models/content-model.model';
import * as i0 from "@angular/core";
/**
 * Nuxeo's content model, read from `/config/types`, `/config/facets` and `/config/schemas`.
 *
 * The model is **server-side configuration**, not data: it changes only when a package is
 * installed or a studio project deployed, never in response to anything a user does. So the
 * three reads are cached for the lifetime of the application rather than re-fetched. That is
 * not an optimisation — `MODEL` is consumed by an upstream service that builds its observable
 * in a constructor, and re-fetching on every subscription would issue three requests per
 * metadata panel open.
 *
 * Read-only on purpose. Nuxeo does not expose a write path for the content model over REST at
 * all, so there is no `set` counterpart to omit.
 */
export declare class ContentModelService {
    private readonly api;
    /**
     * `shareReplay({ refCount: false })` so the cache survives every subscriber unsubscribing.
     * With `refCount: true` the panel closing would discard it and the next open would refetch.
     */
    private readonly model$;
    getContentModel(): Observable<NuxeoContentModel>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentModelService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ContentModelService>;
}
//# sourceMappingURL=content-model.service.d.ts.map