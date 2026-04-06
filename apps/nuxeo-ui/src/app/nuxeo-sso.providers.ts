import {
  NUXEO_SAML_LOGIN_ENDPOINTS,
  type NuxeoSamlLoginEndpoint,
} from '@agentic-ui/shared/nuxeo-client';

/**
 * Browser SSO buttons redirect to these paths under the Nuxeo origin (`NUXEO_API_ORIGIN` or current host).
 * Registration IDs must match your Nuxeo/OpenID/SAML setup — copy real URLs from Hyland Web UI (login → Network).
 */
const defaultSamlEndpoints: NuxeoSamlLoginEndpoint[] = [
  {
    id: 'azure',
    label: 'Log In With Azure SAML',
    path: '/nuxeo/oauth2/authorization/azure',
  },
  {
    id: 'okta',
    label: 'Log In With Okta SAML',
    path: '/nuxeo/oauth2/authorization/okta',
  },
];

export const nuxeoSamlProviders = [
  {
    provide: NUXEO_SAML_LOGIN_ENDPOINTS,
    useValue: defaultSamlEndpoints,
  },
];
