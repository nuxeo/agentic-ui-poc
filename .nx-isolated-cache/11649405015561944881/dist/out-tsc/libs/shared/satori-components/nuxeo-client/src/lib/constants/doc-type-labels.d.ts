/** Catalogue keys for the document types the packaged application knows about. */
export declare const DOC_TYPE_LABEL_KEYS: Record<string, string>;
/**
 * The display name of a Nuxeo document type.
 *
 * A known type resolves through the catalogue. A type a customer has added has no key, so its
 * own name is shown with the camel case split (`InvoiceRecord` → `Invoice Record`) — it can never
 * render as a raw `doc-type.*` key. The same fallback applies when the catalogue has not loaded
 * and `translate` hands the key back unchanged.
 */
export declare function docTypeLabel(type: string, translate: (key: string) => string): string;
//# sourceMappingURL=doc-type-labels.d.ts.map