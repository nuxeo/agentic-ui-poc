/**
 * The closed union of additive enrichments — pure side-data that populates an
 * already-defined optional domain field without changing the typed return shape.
 * Enrichments that change the return type use a `getWith…` method on
 * {@link DocumentPort} instead.
 */
export type AdditiveEnrichmentKey = 'parent-ref' | 'creator-display-name';
