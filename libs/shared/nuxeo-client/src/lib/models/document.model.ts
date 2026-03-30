import { NuxeoPaginatedList } from './paginated.model';

export interface NuxeoDocument {
  uid: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  properties: Record<string, unknown>;
}

export type NuxeoDocumentList = NuxeoPaginatedList<NuxeoDocument>;
