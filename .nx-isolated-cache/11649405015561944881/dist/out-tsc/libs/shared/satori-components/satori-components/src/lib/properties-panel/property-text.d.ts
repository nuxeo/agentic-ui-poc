/**
 * The words a property value shows as, or `''` for a value with nothing to show.
 *
 * A Nuxeo property is not always a string. With resolvers fetched, `dc:nature` arrives as a
 * directory entry and `dc:creator` as a user; a blob is an object, a multi-valued field an array.
 * Interpolating any of those prints `[object Object]` — a defect observed in another document
 * sidebar and listed as a parity target not to copy. So objects are read for the field that names
 * them, and an object with no such field shows nothing rather than its type.
 */
export declare function nxsPropertyText(value: unknown): string;
/** A username's initial for an avatar; `?` when there is no letter to show. */
export declare function nxsInitial(name: string): string;
//# sourceMappingURL=property-text.d.ts.map