import { type Provider } from '@angular/core';
import { type Observable } from 'rxjs';
import * as i0 from "@angular/core";
/** How many thumbnail requests one cache keeps in flight at once. */
export declare const NXS_THUMBNAIL_CONCURRENCY = 4;
/**
 * How long a thumbnail nothing shows is kept, in milliseconds, before its URL is revoked — long
 * enough for a view switch to show it again, short enough that a revisited page fetches afresh.
 */
export declare const NXS_THUMBNAIL_GRACE = 2000;
/**
 * The thumbnails of one page, shared by every `nxs-thumbnail` under the component that provides it.
 *
 * Three things a per-thumbnail fetch cannot do. Two thumbnails of the same document share one
 * request and one blob URL. A view switch — list to cards — that destroys a thumbnail and creates
 * another for the same document reuses the URL instead of fetching again. And at most
 * `NXS_THUMBNAIL_CONCURRENCY` requests run at once, however many results the page renders.
 *
 * A URL nothing shows is revoked `NXS_THUMBNAIL_GRACE` after its last thumbnail goes, and every URL
 * when the providing component is destroyed. So nothing outlives the page, and a document shown
 * again later is fetched again, as it was before this cache existed.
 */
export declare class NxsThumbnailCache {
    private readonly documents;
    private readonly destroyRef;
    private readonly entries;
    private readonly waiting;
    private running;
    constructor();
    /**
     * The blob URL of a document's thumbnail — `null` when there is none — held for as long as it is
     * subscribed. The stream stays open once it has answered: unsubscribing is what lets the URL go.
     */
    lend(documentId: string): Observable<string | null>;
    /** The bytes behind `url` did not decode: forget the document, so the URL is not handed out again. */
    discard(documentId: string, url: string): void;
    private hold;
    private letGo;
    private next;
    private drop;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsThumbnailCache, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NxsThumbnailCache>;
}
/** Lists `NxsThumbnailCache` in a page component's `providers`, for every thumbnail under it. */
export declare function provideNxsThumbnailCache(): Provider;
//# sourceMappingURL=thumbnail-cache.d.ts.map