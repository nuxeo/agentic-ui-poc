import { NuxeoPaginatedList } from './paginated.model';

export interface AuditEntry {
  id: number;
  category: string;
  principalName: string;
  comment: string;
  docLifeCycle: string;
  docPath: string;
  docType: string;
  docUUID: string;
  eventId: string;
  repositoryId: string;
  eventDate: string;
  logDate: string;
  extended: Record<string, unknown>;
}

export type AuditLogList = NuxeoPaginatedList<AuditEntry>;
