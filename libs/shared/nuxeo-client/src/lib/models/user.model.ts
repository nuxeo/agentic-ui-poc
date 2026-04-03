export interface NuxeoUser {
  'entity-type': 'user';
  id: string;
  properties: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    groups: string[];
    company?: string;
    /** Set only when creating or changing password (not returned on GET in some setups). */
    password?: string;
  };
  isAdministrator?: boolean;
  isAnonymous?: boolean;
}

export interface NuxeoUserList {
  'entity-type': 'users';
  entries: NuxeoUser[];
  totalSize?: number;
  currentPageSize?: number;
  currentPageIndex?: number;
  numberOfPages?: number;
}

export interface NuxeoGroup {
  'entity-type': 'group';
  groupname: string;
  grouplabel: string;
  memberUsers?: string[];
  memberGroups?: string[];
}

export interface NuxeoGroupList {
  'entity-type': 'groups';
  entries: NuxeoGroup[];
  totalSize?: number;
  currentPageSize?: number;
  currentPageIndex?: number;
  numberOfPages?: number;
}
