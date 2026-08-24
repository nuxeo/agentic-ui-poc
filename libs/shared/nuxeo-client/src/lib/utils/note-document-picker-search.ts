import type { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { resolvePaginatedListTotal, type PaginatedListMeta } from './paginated-total';

/** Web UI note RTE — `nuxeo-document-picker provider="document_picker"`. */
export const NOTE_DOCUMENT_PICKER_PROVIDER = 'document_picker';

/** Web UI `nuxeo-document-picker` / `nuxeo-results-view` request headers. */
export const NOTE_DOCUMENT_PICKER_HEADERS = {
  properties: 'dublincore,file',
  'enrichers.document': 'thumbnail,permissions,highlight',
} as const;

export function escapeNxqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * NXQL equivalent of the default `document_picker` page provider
 * (Picture facet, not trashed). Used when ES-backed PP fails locally.
 *
 * Quick Search filters by title and main blob file name — `ecm:fulltext` is often
 * disabled in dev Docker while `fulltext_all` on the page provider still works in prod.
 */
export function buildNoteDocumentPickerNxql(fulltext: string): string {
  let query =
    "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' " +
    "AND ecm:primaryType = 'Picture' AND ecm:isTrashed = 0";
  const term = fulltext.trim();
  if (term) {
    const escaped = escapeNxqlLiteral(term);
    query += ` AND (dc:title LIKE '%${escaped}%' OR file:content/name LIKE '%${escaped}%')`;
  }
  return query;
}

/** Keep only Picture/image documents with a server-supplied blob URL for `<img src>`. */
export function filterInsertablePictureDocuments(
  entries: NuxeoDocumentList['entries'] | undefined,
): NuxeoDocument[] {
  return (entries ?? []).filter(hasInsertablePictureBlob);
}

/** True when `file:content.data` exists and the blob is an image (Web UI parity). */
export function hasInsertablePictureBlob(doc: NuxeoDocument): boolean {
  const fileContent = doc.properties?.['file:content'];
  if (!fileContent || typeof fileContent !== 'object') return false;
  const record = fileContent as Record<string, unknown>;
  const data = record['data'];
  if (typeof data !== 'string' || data.length === 0) return false;
  if (doc.type === 'Picture') return true;
  const mime = record['mime-type'] ?? record['mimeType'];
  return typeof mime === 'string' && mime.startsWith('image/');
}

export function normalizeDocumentPickerList(
  res: PaginatedListMeta & { entries?: NuxeoDocumentList['entries'] },
  pageSize: number,
  pageIndex: number,
): NuxeoDocumentList {
  const entries = res.entries ?? [];
  return {
    entries,
    totalSize: resolvePaginatedListTotal(res, pageSize, pageIndex),
    resultsCount: res.resultsCount,
    currentPageSize: res.currentPageSize ?? entries.length,
    currentPageIndex: res.currentPageIndex ?? pageIndex,
    numberOfPages: res.numberOfPages ?? 1,
  };
}
