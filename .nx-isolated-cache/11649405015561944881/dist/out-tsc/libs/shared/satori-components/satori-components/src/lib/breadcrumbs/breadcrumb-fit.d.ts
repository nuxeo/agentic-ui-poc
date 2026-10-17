/** The breadcrumbs folded into the "…" menu: `count` of them, from the item at `start`. */
export interface BreadcrumbFold {
    readonly start: 0 | 1;
    readonly count: number;
}
/**
 * Which breadcrumbs to fold into the "…" menu so the trail fits on one line.
 *
 * The last item always stays: it is where the user is. Items fold from the second onwards, the ones
 * furthest from the current page first, as Satori's breadcrumbs fold them, so the first — where
 * the trail starts — stays while it fits. When only the first, the "…" and the last are left and
 * they still do not fit with the last cut short to its minimum, the first folds too, rather than
 * shrink to nothing while still being a link. The last item is never hidden, which is what Satori's
 * does at 110 px or narrower.
 *
 * @param widths  each item's rendered width, separator included, in trail order
 * @param overflowWidth  the "…" button's width, separator included
 * @param available  the width the trail may use
 * @param lastMinimum  the narrowest the last item is cut short to; its full width when unknown
 */
export declare function breadcrumbsToFold(widths: readonly number[], overflowWidth: number, available: number, lastMinimum?: number): BreadcrumbFold;
//# sourceMappingURL=breadcrumb-fit.d.ts.map