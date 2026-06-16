import type { NuxeoDocument } from '../models/document.model';
import { NON_CONTENT_DOCUMENT_TYPES } from '../constants/non-content-document-types';

/**
 * Nuxeo primary types that the HxAI connector's default `ingestMappings`
 * contribution can send to Content Lake (documents with a main `file:content`
 * blob). Mirrors the Confluence workflow "Ingest a local Nuxeo file document".
 */
export const CONTENT_LAKE_INGEST_DOCUMENT_TYPES = new Set(['File', 'Picture', 'Video', 'Audio']);

function hasIngestibleMainBlob(doc: NuxeoDocument): boolean {
  const fileContent = doc.properties['file:content'] as Record<string, unknown> | null | undefined;
  if (!fileContent || typeof fileContent !== 'object') {
    return false;
  }

  const name = fileContent['name'];
  const length = Number(fileContent['length'] ?? 0);
  const data = fileContent['data'];
  const blobUrl = fileContent['blobUrl'];

  return (
    (typeof name === 'string' && name.trim().length > 0) ||
    length > 0 ||
    (typeof data === 'string' && data.length > 0) ||
    (typeof blobUrl === 'string' && blobUrl.length > 0)
  );
}

/** Whether a Nuxeo document can be bulk-ingested into Content Lake for KD. */
export function supportsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean {
  if (!doc || doc.isTrashed) {
    return false;
  }

  const primaryType = doc.type?.trim();
  if (!primaryType || NON_CONTENT_DOCUMENT_TYPES.has(primaryType.toLowerCase())) {
    return false;
  }

  if (!CONTENT_LAKE_INGEST_DOCUMENT_TYPES.has(primaryType)) {
    return false;
  }

  return hasIngestibleMainBlob(doc);
}
