import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

import {
  AppBootstrapConfig,
  AppThemeConfig,
  DEFAULT_APP_BOOTSTRAP_CONFIG,
  mergeBootstrapConfig,
  resolveTheme,
} from './bootstrap-config';
import { APP_BOOTSTRAP_CONFIG_URL } from './app-config.tokens';
import {
  AppRuntimeManifest,
  DEFAULT_APP_RUNTIME_MANIFEST,
  parseRuntimeManifest,
} from './runtime-manifest';

/** Where a loaded configuration actually came from, so the shell can show it rather than guess. */
export type AppConfigSource = 'packaged-default' | 'deployed-file' | 'nuxeo-document';

export interface AppConfigDiagnostics {
  readonly bootstrapSource: AppConfigSource;
  readonly manifestSource: AppConfigSource;
  /** Human-readable reasons a load fell back, in the order they happened. */
  readonly messages: readonly string[];
}

/**
 * Loads the two halves of the Layer 0 configuration and exposes them as signals.
 *
 * Injects `HttpClient` directly, which the repository otherwise reserves for
 * `NuxeoApiBase`. That is deliberate and confined to this service: the Nuxeo API
 * origin is itself one of the values being configured, so a loader built on the
 * configured client would depend on its own output.
 *
 * Both loads are **tolerant by contract**. A missing configuration file, an
 * absent configuration document, a 403, or malformed JSON all fall back to the
 * packaged defaults and record why. The application must start for a customer
 * who has configured nothing, and must keep working for one who has saved
 * something invalid.
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private readonly bootstrapUrl = inject(APP_BOOTSTRAP_CONFIG_URL);

  private readonly bootstrapConfig = signal<AppBootstrapConfig>(DEFAULT_APP_BOOTSTRAP_CONFIG);
  private readonly runtimeManifest = signal<AppRuntimeManifest>(DEFAULT_APP_RUNTIME_MANIFEST);
  private readonly diagnosticsState = signal<AppConfigDiagnostics>({
    bootstrapSource: 'packaged-default',
    manifestSource: 'packaged-default',
    messages: [],
  });

  readonly bootstrap = this.bootstrapConfig.asReadonly();
  readonly manifest = this.runtimeManifest.asReadonly();
  readonly diagnostics = this.diagnosticsState.asReadonly();

  /** Themes available to the theme picker — packaged ones merged with configured ones. */
  readonly themes = computed<readonly AppThemeConfig[]>(() => this.bootstrapConfig().themes);

  /** Load both halves. Never rejects, so it is safe as an `APP_INITIALIZER`. */
  async load(): Promise<void> {
    await this.loadBootstrap();
    await this.loadManifest();
  }

  /**
   * Fetch the deployed bootstrap file and overlay it on the packaged defaults.
   * Runs before authentication, so it must not assume a session exists.
   */
  async loadBootstrap(): Promise<AppBootstrapConfig> {
    const raw = await firstValueFrom(
      this.http
        .get<unknown>(this.bootstrapUrl, { responseType: 'json' })
        .pipe(catchError((error: unknown) => of(this.failure(error)))),
    );

    if (raw instanceof ConfigLoadFailure) {
      this.note(`bootstrap configuration not loaded from ${this.bootstrapUrl}: ${raw.reason}`);
      return this.bootstrapConfig();
    }

    const merged = mergeBootstrapConfig(DEFAULT_APP_BOOTSTRAP_CONFIG, raw);
    this.bootstrapConfig.set(merged);
    this.diagnosticsState.update((current) => ({ ...current, bootstrapSource: 'deployed-file' }));
    return merged;
  }

  /**
   * Fetch the runtime manifest from the Nuxeo configuration document.
   *
   * The document is expected to be absent on a fresh install, which is why a
   * failure here is recorded and ignored rather than propagated.
   */
  async loadManifest(): Promise<AppRuntimeManifest> {
    const config = this.bootstrapConfig();
    const url = `${config.nuxeoApiOrigin}/nuxeo/api/v1/path${config.manifestDocumentPath}`;

    const response = await firstValueFrom(
      this.http
        .get<unknown>(url, {
          // `properties: *` asks Nuxeo for every schema, without which the
          // property holding the manifest is not in the payload at all.
          headers: { properties: '*', Accept: 'application/json' },
        })
        .pipe(catchError((error: unknown) => of(this.failure(error)))),
    );

    if (response instanceof ConfigLoadFailure) {
      this.note(
        `runtime manifest not loaded from ${config.manifestDocumentPath}: ${response.reason}`,
      );
      return this.runtimeManifest();
    }

    const properties =
      typeof response === 'object' && response !== null
        ? (response as { properties?: Record<string, unknown> }).properties
        : undefined;
    const parsed = parseRuntimeManifest(properties?.[config.manifestDocumentProperty]);

    if (!parsed) {
      this.note(
        `runtime manifest document ${config.manifestDocumentPath} has no readable JSON in ` +
          `"${config.manifestDocumentProperty}"`,
      );
      return this.runtimeManifest();
    }

    this.runtimeManifest.set(parsed);
    this.diagnosticsState.update((current) => ({ ...current, manifestSource: 'nuxeo-document' }));
    return parsed;
  }

  /** The active theme definition for a stored or configured theme id. */
  resolveTheme(id: string | null): AppThemeConfig {
    return resolveTheme(this.bootstrapConfig(), id);
  }

  /** A manifest feature toggle, or `fallback` when the customer has not set it. */
  featureToggle(id: string, fallback: boolean): boolean {
    const configured = this.runtimeManifest().featureToggles[id];
    return typeof configured === 'boolean' ? configured : fallback;
  }

  private failure(error: unknown): ConfigLoadFailure {
    const status = (error as { status?: unknown } | null)?.status;
    const message = (error as { message?: unknown } | null)?.message;
    if (typeof status === 'number' && status !== 0) return new ConfigLoadFailure(`HTTP ${status}`);
    return new ConfigLoadFailure(typeof message === 'string' ? message : 'request failed');
  }

  private note(message: string): void {
    this.diagnosticsState.update((current) => ({
      ...current,
      messages: [...current.messages, message],
    }));
  }
}

/**
 * Sentinel returned into the success channel by `catchError`, so a failed load
 * takes the same code path as a successful one and cannot throw past the caller.
 */
class ConfigLoadFailure {
  constructor(readonly reason: string) {}
}
