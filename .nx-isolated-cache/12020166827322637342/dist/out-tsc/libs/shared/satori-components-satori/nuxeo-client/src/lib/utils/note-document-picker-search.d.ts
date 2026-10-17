import type { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { type PaginatedListMeta } from './paginated-total';
/** Web UI note RTE — `nuxeo-document-picker provider="document_picker"`. */
export declare const NOTE_DOCUMENT_PICKER_PROVIDER = "document_picker";
/** Web UI `nuxeo-document-picker` / `nuxeo-results-view` request headers. */
export declare const NOTE_DOCUMENT_PICKER_HEADERS: {
    readonly properties: "dublincore,file";
    readonly 'enrichers.document': "thumbnail,permissions,highlight";
};
/**
 * NXQL equivalent of the default `document_picker` page provider
 * (Picture facet, not trashed). Used when ES-backed PP fails locally.
 *
 * Quick Search filters by title and main blob file name — `ecm:fulltext` is often
 * disabled in dev Docker while `fulltext_all` on the page provider still works in prod.
 */
export declare function buildNoteDocumentPickerNxql(fulltext: string): string;
/** Keep only Picture/image documents with a server-supplied blob URL for `<img src>`. */
export declare function filterInsertablePictureDocuments(entries: NuxeoDocumentList['entries'] | undefined): NuxeoDocument[];
/** True when `file:content.data` exists and the blob is an image (Web UI parity). */
export declare function hasInsertablePictureBlob(doc: NuxeoDocument): boolean;
export declare function normalizeDocumentPickerList(res: PaginatedListMeta & {
    entries?: NuxeoDocumentList['entries'];
}, pageSize: number, pageIndex: number): NuxeoDocumentList;
//# sourceMappingURL=note-document-picker-search.d.ts.map