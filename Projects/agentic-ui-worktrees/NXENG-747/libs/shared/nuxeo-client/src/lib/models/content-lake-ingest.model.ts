export interface ContentLakeIngestCommand {
  commandId: string;
}

export interface ContentLakeIngestStatus {
  commandId: string;
  state: string;
  processed: number;
  total?: number;
  error: boolean;
  errorCount: number;
}

/** A local file that already exists in the target folder and is ingested in Content Lake. */
export interface ContentLakeDuplicate {
  fileName: string;
  existingUid: string;
  existingTitle: string;
  existingPath: string;
}

/** Same-name, same-size folder child that may already be indexed in Content Lake. */
export interface ContentLakeDuplicateCandidate extends ContentLakeDuplicate {
  markedIngested: boolean;
}

/** Result of probing Content Lake and optionally persisting the local ingest marker. */
export interface ContentLakeBackfillResult {
  doc: import('./document.model').NuxeoDocument | null;
  presentInContentLake: boolean;
}
