import type {
  ContentLakeDuplicate,
  ContentLakeDuplicateCandidate,
} from '../models/content-lake-ingest.model';
import type { NuxeoDocument } from '../models/document.model';
import { NON_CONTENT_DOCUMENT_TYPES } from '../constants/non-content-document-types';

/**
 * Nuxeo primary types that the HxAI connector's default `ingestMappings`
 * contribution can send to Content Lake (documents with a main `file:content`
 * blob). Mirrors the Confluence workflow "Ingest a local Nuxeo file document".
 */
export const CONTENT_LAKE_INGEST_DOCUMENT_TYPES = new Set(['File', 'Picture', 'Video', 'Audio']);

/**
 * Machine-readable ingest marker stored on the Nuxeo document after a successful
 * Content Lake ingest. Prefer `dc:source` (rarely auto-filled) and fall back to
 * `dc:rights` for backward compatibility. A property is only written when it is
 * empty or already uses our prefix — PDF metadata often populates `dc:rights`.
 */
export const CONTENT_LAKE_INGEST_MARKER_PROPERTY = 'dc:source';
export const CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY = 'dc:rights';
export const CONTENT_LAKE_INGEST_MARKER_PROPERTIES = [
  CONTENT_LAKE_INGEST_MARKER_PROPERTY,
  CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY,
] as const;
export const CONTENT_LAKE_INGEST_MARKER_PREFIX = 'agentic-ui:content-lake:';

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

export function readBlobDigest(doc: NuxeoDocument): string | null {
  const fileContent = doc.properties['file:content'] as Record<string, unknown> | null | undefined;
  const digest = fileContent?.['digest'];
  return typeof digest === 'string' && digest.trim().length > 0 ? digest.trim() : null;
}

export function readMainBlobName(doc: NuxeoDocument): string | null {
  const fileContent = doc.properties['file:content'] as Record<string, unknown> | null | undefined;
  const name = fileContent?.['name'];
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}

export function readMainBlobLength(doc: NuxeoDocument): number {
  const fileContent = doc.properties['file:content'] as Record<string, unknown> | null | undefined;
  return Number(fileContent?.['length'] ?? 0);
}

export function buildContentLakeIngestMarker(blobDigest: string): string {
  return `${CONTENT_LAKE_INGEST_MARKER_PREFIX}${blobDigest}`;
}

export function readContentLakeIngestMarker(doc: NuxeoDocument): string | null {
  for (const property of CONTENT_LAKE_INGEST_MARKER_PROPERTIES) {
    const value = doc.properties[property];
    if (typeof value !== 'string' || !value.startsWith(CONTENT_LAKE_INGEST_MARKER_PREFIX)) {
      continue;
    }
    const digest = value.slice(CONTENT_LAKE_INGEST_MARKER_PREFIX.length).trim();
    if (digest.length > 0) {
      return digest;
    }
  }
  return null;
}

/** True when the document blob digest matches our last successful ingest marker. */
export function isContentLakeIngestCurrent(doc: NuxeoDocument | null | undefined): boolean {
  if (!doc) {
    return false;
  }
  const digest = readBlobDigest(doc);
  const marker = readContentLakeIngestMarker(doc);
  return !!digest && digest === marker;
}

/** True when the document supports ingest and is not already up to date in Content Lake. */
export function needsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean {
  return supportsContentLakeIngest(doc) && !isContentLakeIngestCurrent(doc);
}

/** True when the UI should ask Content Lake whether this blob is already indexed. */
export function shouldProbeContentLakeIngestStatus(doc: NuxeoDocument): boolean {
  return needsContentLakeIngest(doc);
}

/** True when we should probe Content Lake and backfill the ingest marker on document open. */
export function shouldBackfillContentLakeIngestMarker(doc: NuxeoDocument): boolean {
  return shouldProbeContentLakeIngestStatus(doc) && canWriteContentLakeIngestMarker(doc);
}

/**
 * Interpret the JSON payload returned by `HylandIngest.CheckDigest`. The
 * connector documents several possible shapes; we treat any explicit positive
 * signal as ingested and fail closed otherwise.
 */
export function parseContentLakeIngestCheckResult(body: unknown): boolean {
  const json = unwrapAutomationJsonPayload(body);
  if (!json || typeof json !== 'object') {
    return false;
  }

  const record = json as Record<string, unknown>;
  const responseCode = record['responseCode'];
  if (typeof responseCode === 'number' && (responseCode < 200 || responseCode >= 300)) {
    return false;
  }

  const nestedResponse = record['response'];
  if (nestedResponse !== undefined) {
    const fromResponse = parseContentLakeIngestCheckResult(nestedResponse);
    if (fromResponse) {
      return true;
    }
    if (nestedResponse && typeof nestedResponse === 'object') {
      const responseRecord = nestedResponse as Record<string, unknown>;
      if (responseRecord['exists'] === false || responseRecord['ingested'] === false) {
        return false;
      }
    }
  }

  const nestedResult = record['result'];
  if (nestedResult !== undefined && parseContentLakeIngestCheckResult(nestedResult)) {
    return true;
  }

  for (const key of [
    'ingested',
    'isIngested',
    'exists',
    'digestMatch',
    'digestMatches',
    'found',
    'match',
  ]) {
    if (record[key] === true) {
      return true;
    }
    if (record[key] === false) {
      return false;
    }
  }

  const status = String(record['status'] ?? record['state'] ?? '').toUpperCase();
  if (['INGESTED', 'INDEXED', 'PRESENT', 'FOUND', 'SUCCESS', 'UP_TO_DATE'].includes(status)) {
    return true;
  }
  if (['NOT_INGESTED', 'NOT_FOUND', 'MISSING', 'ABSENT'].includes(status)) {
    return false;
  }

  return false;
}

function unwrapAutomationJsonPayload(body: unknown): unknown {
  if (body === null || body === undefined) {
    return null;
  }

  if (typeof body === 'string') {
    return parseJsonString(body);
  }

  if (typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const nested = record['value'];
  if (nested !== undefined) {
    const fromValue = unwrapAutomationJsonPayload(nested);
    if (fromValue !== null) {
      return fromValue;
    }
  }

  if (record['entity-type'] === 'blob') {
    const data = record['data'];
    if (typeof data === 'string' && data.length > 0) {
      try {
        const decoded = atob(data);
        return parseJsonString(decoded);
      } catch {
        return null;
      }
    }
  }

  return record;
}

function parseJsonString(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function isIngestMarkerPropertyWritable(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'string' && value.startsWith(CONTENT_LAKE_INGEST_MARKER_PREFIX))
  );
}

/** First Dublin Core field that can store our ingest marker without clobbering user data. */
export function resolveIngestMarkerWriteProperty(doc: NuxeoDocument): string | null {
  for (const property of CONTENT_LAKE_INGEST_MARKER_PROPERTIES) {
    if (isIngestMarkerPropertyWritable(doc.properties[property])) {
      return property;
    }
  }
  return null;
}

export function canWriteContentLakeIngestMarker(doc: NuxeoDocument): boolean {
  return resolveIngestMarkerWriteProperty(doc) !== null;
}

export function escapeNxqlStringLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/** NXQL to find ingestible documents anywhere in the repository with matching blob name and size. */
export function buildContentLakeDuplicateSearchQuery(files: File[]): string {
  const ingestTypes = [...CONTENT_LAKE_INGEST_DOCUMENT_TYPES].map((type) => `'${type}'`).join(', ');
  const fileClauses = files.map(
    (file) =>
      `(file:content/name = '${escapeNxqlStringLiteral(file.name)}' AND file:content/length = ${file.size})`,
  );

  return [
    'SELECT * FROM Document',
    'WHERE ecm:isVersion = 0',
    'AND ecm:isTrashed = 0',
    `AND ecm:primaryType IN (${ingestTypes})`,
    `AND (${fileClauses.join(' OR ')})`,
  ].join(' ');
}

/** Repository documents whose main blob matches the selected file name and byte length. */
export function findRepositoryBlobMatches(file: File, documents: NuxeoDocument[]): NuxeoDocument[] {
  return documents.filter(
    (doc) => readMainBlobName(doc) === file.name && readMainBlobLength(doc) === file.size,
  );
}

/** Match selected files to repository documents with the same blob name and size. */
export function findContentLakeDuplicateCandidates(
  files: File[],
  repositoryMatches: NuxeoDocument[],
): ContentLakeDuplicateCandidate[] {
  const candidates: ContentLakeDuplicateCandidate[] = [];

  for (const file of files) {
    const existing = findRepositoryBlobMatches(file, repositoryMatches)[0];
    if (!existing) {
      continue;
    }

    candidates.push({
      fileName: file.name,
      existingUid: existing.uid,
      existingTitle: existing.title,
      existingPath: existing.path,
      markedIngested: isContentLakeIngestCurrent(existing),
    });
  }

  return candidates;
}

/** Match selected files to folder children that are already ingested (local marker only). */
export function findContentLakeDuplicates(
  files: File[],
  folderChildren: NuxeoDocument[],
): ContentLakeDuplicate[] {
  return findContentLakeDuplicateCandidates(files, folderChildren)
    .filter((candidate) => candidate.markedIngested)
    .map(({ markedIngested: _markedIngested, ...duplicate }) => duplicate);
}
