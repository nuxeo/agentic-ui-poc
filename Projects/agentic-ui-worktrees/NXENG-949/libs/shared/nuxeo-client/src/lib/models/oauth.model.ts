/** OAuth2 provider as returned by Nuxeo REST (shape may vary by version). */
export interface NuxeoOAuth2Provider {
  entityType?: string;
  'entity-type'?: string;
  serviceName?: string;
  description?: string;
  enabled?: boolean;
  isEnabled?: boolean;
  [key: string]: unknown;
}
