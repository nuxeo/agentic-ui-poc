import { APP_INITIALIZER, Provider, inject } from '@angular/core';
import { AppConfigService } from '@agentic-ui/shared/app-config';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AI_BACKEND_URL } from '@agentic-ui/shared/ai-client';
import { DEFAULT_KD_CIC_OPERATIONS, KD_CIC_OPERATIONS } from '@agentic-ui/shared/kd-client';
import { DEFAULT_KE_CIC_OPERATIONS, KE_CIC_OPERATIONS } from '@agentic-ui/shared/ke-client';
import {
  ARENDER_CONFIG,
  NUXEO_API_ORIGIN,
  NUXEO_SAML_LOGIN_ENDPOINTS,
  NUXEO_SERVER_URL,
  NUXEO_SSO_POST_LOGIN_PATH,
  NUXEO_SSO_RETURN_QUERY_PARAM,
} from '@agentic-ui/shared/nuxeo-client';

import {
  DEFAULT_SESSION_TIMEOUT_CONFIG,
  SESSION_TIMEOUT_CONFIG,
  resolveSessionTimeoutConfig,
} from '../auth/session-timeout.config';

/**
 * Nuxeo Drive and ARender connect to the server directly, bypassing the Angular
 * dev proxy, so they need the real origin rather than a relative path. In
 * production the SPA is served from the Nuxeo server itself.
 */
function derivedNuxeoServerUrl(): string {
  const isDevProxy = window.location.port === '4200';
  return isDevProxy ? 'http://localhost:8080/nuxeo' : `${window.location.origin}/nuxeo`;
}

/**
 * Point every configuration `InjectionToken` at the loaded Layer 0 configuration.
 *
 * The token pattern was already the documented override idiom — `kd.config.ts`
 * says in as many words to "override the token in `app.config.ts` rather than
 * editing this file" — so this converts the whole set in one move without
 * changing a single consumer. Each factory falls back to the value that was
 * previously compiled in, which is what makes an unconfigured deployment
 * byte-for-byte equivalent to the current release.
 *
 * Ordering note: `loadAppConfig` runs as an `APP_INITIALIZER`, while these
 * factories are evaluated on first injection. The configuration loader is the
 * only consumer that runs before the load completes, and it deliberately uses
 * relative URLs so it does not depend on its own output.
 */
export function provideAppConfig(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (config: AppConfigService, translate: TranslateService) => async () => {
        await config.load();
        // Sequenced inside one initializer on purpose: Angular runs
        // `APP_INITIALIZER` functions concurrently, and the catalogue to load
        // is named by the configuration that has just been fetched. The
        // manifest's `labels` are layered on by `AppTranslateLoader`, so this
        // also has to happen after the manifest has landed.
        const { defaultLanguage } = config.bootstrap();
        translate.setFallbackLang('en');
        await firstValueFrom(translate.use(defaultLanguage));
      },
      deps: [AppConfigService, TranslateService],
      multi: true,
    },
    {
      provide: NUXEO_API_ORIGIN,
      useFactory: () => inject(AppConfigService).bootstrap().nuxeoApiOrigin,
    },
    {
      provide: NUXEO_SERVER_URL,
      useFactory: () =>
        inject(AppConfigService).bootstrap().nuxeoServerUrl ?? derivedNuxeoServerUrl(),
    },
    {
      // AI operations are served by the Java marketplace package over Automation.
      provide: AI_BACKEND_URL,
      useFactory: () => inject(AppConfigService).bootstrap().aiBackendUrl,
    },
    {
      provide: ARENDER_CONFIG,
      useFactory: () => {
        const configured = inject(AppConfigService).bootstrap().integrations.arender;
        return (
          configured ?? {
            viewerOrigin: 'http://localhost:8180',
            nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo',
          }
        );
      },
    },
    {
      provide: KD_CIC_OPERATIONS,
      useFactory: () => ({
        ...DEFAULT_KD_CIC_OPERATIONS,
        ...inject(AppConfigService).bootstrap().integrations.knowledgeDiscoveryOperations,
      }),
    },
    {
      provide: KE_CIC_OPERATIONS,
      useFactory: () => ({
        ...DEFAULT_KE_CIC_OPERATIONS,
        ...inject(AppConfigService).bootstrap().integrations.knowledgeEnrichmentOperations,
      }),
    },
    {
      provide: NUXEO_SAML_LOGIN_ENDPOINTS,
      useFactory: () =>
        inject(AppConfigService)
          .bootstrap()
          .sso.endpoints.map((endpoint) => ({ ...endpoint })),
    },
    {
      provide: NUXEO_SSO_POST_LOGIN_PATH,
      useFactory: () => inject(AppConfigService).bootstrap().sso.postLoginPath ?? '/dashboard',
    },
    {
      provide: NUXEO_SSO_RETURN_QUERY_PARAM,
      useFactory: () => inject(AppConfigService).bootstrap().sso.returnQueryParam,
    },
    {
      provide: SESSION_TIMEOUT_CONFIG,
      useFactory: () => {
        // `resolveSessionTimeoutConfig` returns the shared default object by
        // identity unless the dev-only debug key shortened the timeout. That
        // manual-QA override must keep winning over deployed configuration.
        const resolved = resolveSessionTimeoutConfig();
        if (resolved !== DEFAULT_SESSION_TIMEOUT_CONFIG) return resolved;
        const configured = inject(AppConfigService).bootstrap().session;
        return {
          idleTimeoutMs: configured.idleTimeoutMs ?? resolved.idleTimeoutMs,
          warningBeforeMs: configured.warningBeforeMs ?? resolved.warningBeforeMs,
        };
      },
    },
  ];
}
