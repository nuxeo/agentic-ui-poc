export interface NuxeoOAuth2ServiceProvider {
  'entity-type': 'nuxeoOAuth2ServiceProvider';
  serviceName: string;
  description?: string | null;
  clientId?: string | null;
  tokenServerURL?: string | null;
  authorizationServerURL?: string | null;
  userAuthorizationURL?: string | null;
  scopes?: string[];
  enabled?: boolean;
}

export interface NuxeoOAuth2ServiceProviderList {
  'entity-type': 'nuxeoOAuth2ServiceProviders';
  entries: NuxeoOAuth2ServiceProvider[];
}

export interface NuxeoOAuth2Token {
  'entity-type': 'nuxeoOAuth2Token';
  serviceName: string;
  nuxeoLogin: string;
  serviceLogin: string;
  clientId?: string | null;
  isShared: boolean;
  sharedWith?: string[];
  creationDate: string;
}

export interface NuxeoOAuth2TokenList {
  'entity-type': 'nuxeoOAuth2Tokens';
  entries: NuxeoOAuth2Token[];
}

export interface ConnectedAccount {
  serviceName: string;
  nuxeoLogin: string;
  serviceLogin: string;
  creationDate: string;
  shared: boolean;
}

export interface AuthorizedApplication {
  name: string;
  authorizationDate: string;
}
