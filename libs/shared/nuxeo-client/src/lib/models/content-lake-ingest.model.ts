export interface ContentLakeIngestCommand {
  commandId: string;
}

export interface ContentLakeIngestStatus {
  commandId: string;
  state: string;
  processed: number;
  error: boolean;
  errorCount: number;
}
