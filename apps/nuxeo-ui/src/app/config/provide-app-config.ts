import { APP_INITIALIZER, Provider, inject } from '@angular/core';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { UserPreferenceValues, UserPreferencesService } from '@alfresco/adf-core';
import { TranslateService } from '@ngx-translate/core';

import { REGISTERED_LOCALES } from '../i18n/register-locale-data';
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
} from '@nuxeo-satori/platform/nuxeo-client';

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
      useFactory:
        (
          config: AppConfigService,
          translate: TranslateService,
          userPreferences: UserPreferencesService,
        ) =>
        async () => {
          await config.load();
          // Sequenced inside one initializer on purpose: Angular runs
          // `APP_INITIALIZER` functions concurrently, and the catalogue to load
          // is named by the configuration that has just been fetched. The
          // manifest's `labels` are layered on by `AppTranslateLoader`, so this
          // also has to happen after the manifest has landed.
          const { defaultLanguage } = config.bootstrap();
          translate.setFallbackLang('en');
          await firstValueFrom(translate.use(defaultLanguage));

          /*
           * WORKAROUND(adf-hx): W14 — adf-core takes ownership of the language the moment any
           * adf-hx surface renders, and it has never heard of our Layer 0 `defaultLanguage`.
           *
           * `TranslationService`'s constructor reads the locale from adf-core's own
           * `UserPreferencesService` and calls `loadTranslation(locale, 'en')`, which calls
           * `translate.use(...)` on the shared ngx-translate instance. It also holds an
           * `effect` on `localeSignal()` that does the same on every later change. So the
           * language we set three lines above survives exactly until the first adf-hx
           * component constructs, and then silently reverts.
           *
           * Measured before the fix: with `defaultLanguage: 'fr'`, the seven ordinary shell
           * routes rendered French and both adf-hx surfaces — the `/#/browse-adf-hx` route and
           * the adf-hx nav drawer — reverted to English, re-fetching all five catalogues for
           * `en`. No page reload was involved: `performance.getEntriesByType('navigation')`
           * stayed at one entry.
           *
           * Writing our language into adf-core's preference is the only lever that survives,
           * because `initUserLanguage()` resolves stored locale first, then adf-core's own
           * `AppConfigService` `locale` key, then `'en'` — and we own neither of the last two.
           *
           * **Set on every boot, deliberately.** `set()` also persists to storage, and stored
           * locale *wins over* configuration in `initUserLanguage()`. Writing it once would
           * mean a customer who later changes `defaultLanguage` keeps the old language forever
           * on any browser that had already run the app. Re-asserting it here every boot makes
           * our Layer 0 configuration authoritative and stale storage irrelevant.
           *
           * This costs no bundle: `app.config.ts` already imports
           * `CONTEXT_MENU_ACTIONS_PROVIDERS` from adf-hx, so adf-core is eager either way —
           * see the initial-bundle decision in `AGENTS/11-beta-program.md` §3.
           */
          /*
           * Only hand adf-core a locale we can actually format in.
           *
           * `translate.use('xx')` is harmless — every string falls through to the English
           * fallback. Angular's date, number and currency pipes are not so forgiving: given a
           * locale with no registered data they throw `NG0701` rather than degrading, so a
           * customer who sets `defaultLanguage` to a locale we do not ship — a typo is enough —
           * would get English text and a broken date in every list.
           *
           * Measured: with `defaultLanguage: 'xx'`, eleven `InvalidPipeArgument` errors on a
           * single pass of the evidence capture. Strings were fine, which is exactly what makes
           * it easy to miss.
           *
           * So the string language and the formatting locale are allowed to differ here, on
           * purpose. Strings follow the configuration; formatting follows the configuration
           * only where we have the data to honour it.
           */
          const formattingLocale = REGISTERED_LOCALES.includes(defaultLanguage)
            ? defaultLanguage
            : 'en';
          userPreferences.set(UserPreferenceValues.Locale, formattingLocale);
        },
      deps: [AppConfigService, TranslateService, UserPreferencesService],
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
      // Straight through, including `null`. `integrations.arender` is already typed
      // `AppARenderConfig | null` and defaults to `null`, and `ARENDER_CONFIG` is nullable, so
      // there is nothing to substitute.
      //
      // This used to fall back to compiled-in `http://localhost:8180` and
      // `http://nuxeo-auth-proxy/nuxeo` when unconfigured — which is what a shipped build with no
      // manifest actually used, pointing the annotation viewer at the user's own machine over
      // plaintext (Sonar S5332, and a hardcoded config default of the kind
      // `.cursor/rules/security.mdc` prohibits). `ARenderService` now degrades to
      // "Annotations are not available" instead.
      useFactory: () => inject(AppConfigService).bootstrap().integrations.arender,
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
