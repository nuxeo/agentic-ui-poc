/** Nuxeo DownloadService REQUEST_QUERY_PARAM_CLIENT_REASON — Web UI parity for audit. */
export const BLOB_CLIENT_REASON_PARAM = 'clientReason';

/** Nuxeo DownloadService REQUEST_HEADER_CLIENT_REASON (query param is equivalent). */
export const BLOB_CLIENT_REASON_HEADER = 'X-Client-Reason';

export type BlobClientReason = 'view' | 'download';

export interface FetchBlobOptions {
  /** Defaults to `view` (document preview). Use `download` for explicit user downloads. */
  clientReason?: BlobClientReason;
}
