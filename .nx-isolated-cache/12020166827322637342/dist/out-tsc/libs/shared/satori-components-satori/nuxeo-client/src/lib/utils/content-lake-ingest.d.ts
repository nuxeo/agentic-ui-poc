import type { ContentLakeDuplicate, ContentLakeDuplicateCandidate } from '../models/content-lake-ingest.model';
import type { NuxeoDocument } from '../models/document.model';
/**
 * Nuxeo primary types that the HxAI connector's default `ingestMappings`
 * contribution can send to Content Lake (documents with a main `file:content`
 * blob). Mirrors the Confluence workflow "Ingest a local Nuxeo file document".
 */
export declare const CONTENT_LAKE_INGEST_DOCUMENT_TYPES: Set<string>;
/**
 * Machine-readable ingest marker stored on the Nuxeo document after a successful
 * Content Lake ingest. Prefer `dc:source` (rarely auto-filled) and fall back to
 * `dc:rights` for backward compatibility. A property is only written when it is
 * empty or already uses our prefix — PDF metadata often populates `dc:rights`.
 */
export declare const CONTENT_LAKE_INGEST_MARKER_PROPERTY = "dc:source";
export declare const CONTENT_LAKE_INGEST_MARKER_LEGACY_PROPERTY = "dc:rights";
export declare const CONTENT_LAKE_INGEST_MARKER_PROPERTIES: readonly ["dc:source", "dc:rights"];
export declare const CONTENT_LAKE_INGEST_MARKER_PREFIX = "agentic-ui:content-lake:";
/** Whether a Nuxeo document can be bulk-ingested into Content Lake for KD. */
export declare function supportsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean;
export declare function readBlobDigest(doc: NuxeoDocument): string | null;
export declare function readMainBlobName(doc: NuxeoDocument): string | null;
export declare function readMainBlobLength(doc: NuxeoDocument): number;
export declare function buildContentLakeIngestMarker(blobDigest: string): string;
export declare function readContentLakeIngestMarker(doc: NuxeoDocument): string | null;
/** True when the document blob digest matches our last successful ingest marker. */
export declare function isContentLakeIngestCurrent(doc: NuxeoDocument | null | undefined): boolean;
/** True when the document supports ingest and is not already up to date in Content Lake. */
export declare function needsContentLakeIngest(doc: NuxeoDocument | null | undefined): boolean;
/** True when the UI should ask Content Lake whether this blob is already indexed. */
export declare function shouldProbeContentLakeIngestStatus(doc: NuxeoDocument): boolean;
/** True when we should probe Content Lake and backfill the ingest marker on document open. */
export declare function shouldBackfillContentLakeIngestMarker(doc: NuxeoDocument): boolean;
/**
 * Interpret the JSON payload returned by `HylandIngest.CheckDigest`. The
 * connector documents several possible shapes; we treat any explicit positive
 * signal as ingested and fail closed otherwise.
 */
export declare function parseContentLakeIngestCheckResult(body: unknown): boolean;
/** First Dublin Core field that can store our ingest marker without clobbering user data. */
export declare function resolveIngestMarkerWriteProperty(doc: NuxeoDocument): string | null;
export declare function canWriteContentLakeIngestMarker(doc: NuxeoDocument): boolean;
export declare function escapeNxqlStringLiteral(value: string): string;
/** NXQL to find ingestible documents anywhere in the repository with matching blob name and size. */
export declare function buildContentLakeDuplicateSearchQuery(files: File[]): string;
/** Repository documents whose main blob matches the selected file name and byte length. */
export declare function findRepositoryBlobMatches(file: File, documents: NuxeoDocument[]): NuxeoDocument[];
/** Match selected files to repository documents with the same blob name and size. */
export declare function findContentLakeDuplicateCandidates(files: File[], repositoryMatches: NuxeoDocument[]): ContentLakeDuplicateCandidate[];
/** Match selected files to folder children that are already ingested (local marker only). */
export declare function findContentLakeDuplicates(files: File[], folderChildren: NuxeoDocument[]): ContentLakeDuplicate[];
//# sourceMappingURL=content-lake-ingest.d.ts.map