import * as i0 from "@angular/core";
/**
 * A document's thumbnail rendition, fetched through the authenticated client and shown from a blob
 * URL that no caller creates or revokes.
 *
 * Under a page that lists `provideNxsThumbnailCache()`, the page's `NxsThumbnailCache` owns the URL:
 * thumbnails of one document share it, a view switch reuses it, requests are bounded, and it is
 * revoked once nothing shows it and with the page. Without one, this component owns it and revokes
 * it when the document changes and when it is destroyed.
 *
 * Until the image arrives — and when there is none, the request fails or the bytes do not decode —
 * the projected content shows instead, usually the document-type icon. While it shows, the host
 * has no box of its own (`display: contents`), so the fallback lays out exactly as it would without
 * this wrapper. Size the thumbnail with a class on the host; the image fills it and takes the host's
 * `object-fit` and `border-radius`. Do not set `display` on the host.
 *
 * Decorative by default, like Web UI's `nuxeo-document-thumbnail`: a blank `alt` hides it from
 * assistive technology, because the title beside it already names the document.
 */
export declare class NxsThumbnailComponent {
    /** The document whose `thumbnail` rendition to show. */
    readonly documentId: import("@angular/core").InputSignal<string>;
    /** The image's text alternative, already translated. Blank marks it decorative. */
    readonly alt: import("@angular/core").InputSignal<string>;
    protected readonly url: import("@angular/core").WritableSignal<string | null>;
    private readonly documents;
    private readonly cache;
    /** Whether `url` is this component's to revoke — it is not when a page cache lent it. */
    private owned;
    constructor();
    private load;
    /** The bytes arrived but are not an image the browser can draw. */
    protected broken(): void;
    private own;
    private clear;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsThumbnailComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsThumbnailComponent, "nxs-thumbnail", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "alt": { "alias": "alt"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=thumbnail.component.d.ts.map