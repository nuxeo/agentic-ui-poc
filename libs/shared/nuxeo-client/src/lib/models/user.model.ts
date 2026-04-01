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
  };
  isAdministrator?: boolean;
  isAnonymous?: boolean;
}

export interface NuxeoUserList {
  'entity-type': 'users';
  entries: NuxeoUser[];
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
}
