import { Injectable, inject } from '@angular/core';
import { forkJoin, map, shareReplay } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
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
export class ContentModelService {
    api = inject(NuxeoApiBase);
    /**
     * `shareReplay({ refCount: false })` so the cache survives every subscriber unsubscribing.
     * With `refCount: true` the panel closing would discard it and the next open would refetch.
     */
    model$ = forkJoin({
        types: this.api.get('/nuxeo/api/v1/config/types'),
        facets: this.api.get('/nuxeo/api/v1/config/facets'),
        schemas: this.api.get('/nuxeo/api/v1/config/schemas'),
    }).pipe(map(({ types, facets, schemas }) => ({
        doctypes: types?.doctypes ?? {},
        // Defensive rather than decorative: these three endpoints are unauthenticated-adjacent
        // config reads that a locked-down instance can answer with an empty body, and an
        // undefined here becomes a crash inside upstream's `DocumentModel` rather than an empty
        // property list.
        facets: Array.isArray(facets) ? facets : [],
        schemas: Array.isArray(schemas) ? schemas : [],
    })), shareReplay({ bufferSize: 1, refCount: false }));
    getContentModel() {
        return this.model$;
    }
    static ɵfac = function ContentModelService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContentModelService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ContentModelService, factory: ContentModelService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentModelService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=content-model.service.js.map