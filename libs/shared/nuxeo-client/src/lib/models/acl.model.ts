export interface NuxeoAce {
  id: string;
  username: string;
  externalUser: boolean;
  permission: string;
  granted: boolean;
  creator: string | null;
  begin: string | null;
  end: string | null;
  status: 'effective' | 'pending' | 'archived';
}

export interface NuxeoAcl {
  name: string;
  aces: NuxeoAce[];
}
