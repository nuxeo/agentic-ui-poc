import { NuxeoPaginatedList } from './paginated.model';
import { NuxeoAcl } from './acl.model';

export interface NuxeoDocument {
  uid: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  properties: Record<string, unknown>;
  parentRef?: string;
  lockOwner?: string | null;
  lockCreated?: string | null;
  state?: string;
  isTrashed?: boolean;
  isCheckedOut?: boolean;
  facets?: string[];
  contextParameters?: {
    acls?: NuxeoAcl[];
    favorites?: { isFavorite: boolean };
    subscribedNotifications?: string[];
    [key: string]: unknown;
  };
}

export type NuxeoDocumentList = NuxeoPaginatedList<NuxeoDocument>;
