import { Injectable } from '@angular/core';
import { ContentError, type AuthPort } from '@agentic-ui/shared/content-ports';

/**
 * The Nuxeo {@link AuthPort}.
 *
 * DIVERGENCE — the contract assumes bearer-token auth: the adapter pulls a token from
 * the application and attaches it per request. This application does not work that
 * way. In production it is same-origin with Nuxeo and authenticates with a SAML
 * session cookie; in development `nuxeoAuthInterceptor` attaches Basic auth. In both
 * cases there is no token for the application to hand over, and credentials are
 * attached by the interceptor rather than by the adapter.
 *
 * This implementation therefore reports that no token-based credential exists rather
 * than fabricating one. It is registered so the token resolves and the substitution
 * boundary stays complete; a backend that genuinely needs bearer tokens would supply
 * a real implementation. See `AGENTS/00-architecture.md`.
 */
@Injectable({ providedIn: 'root' })
export class NuxeoAuthAdapter implements AuthPort {
  getAccessToken(): Promise<string> {
    return Promise.reject(
      new ContentError(
        'Unauthenticated',
        'nuxeo adapter authenticates via session cookie or the auth interceptor, not a bearer token',
      ),
    );
  }
}
