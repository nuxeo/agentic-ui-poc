import type { NuxeoDocument } from '../models/document.model';
export interface NuxeoSubtypeEntry {
    type: string;
    facets?: string[];
}
/** Preferred display order for common workspace content types. */
export declare const WORKSPACE_CONTENT_TYPE_ORDER: readonly ["Audio", "Collection", "File", "Folder", "Note", "OrderedFolder", "Picture", "Video", "Workspace"];
/**
 * Parses allowed child document types from the Nuxeo `subtypes` document enricher.
 * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
 */
export declare function parseDocumentSubtypes(doc: NuxeoDocument): string[];
/** Sorts API subtypes with workspace content types first (stable, known order). */
export declare function sortDocumentSubtypes(types: string[]): string[];
//# sourceMappingURL=parse-document-subtypes.d.ts.map