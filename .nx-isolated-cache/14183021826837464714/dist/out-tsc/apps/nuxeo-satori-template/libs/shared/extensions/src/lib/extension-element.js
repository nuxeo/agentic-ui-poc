/** `Array.prototype.filter` predicate: keep entries that are not disabled. */
export function filterEnabled(entry) {
    return !entry.disabled;
}
/**
 * `Array.prototype.sort` comparator: ascending `order`, an absent `order` as `MAX_SAFE_INTEGER`.
 *
 * Equal keys compare as `0`, so registration order survives among them: `sort` is stable.
 */
export function sortByOrder(a, b) {
    // `=== undefined`, not `??`: a `null` order must take part in the subtraction and sort as `0`.
    const left = a.order === undefined ? Number.MAX_SAFE_INTEGER : a.order;
    const right = b.order === undefined ? Number.MAX_SAFE_INTEGER : b.order;
    return left - right;
}
