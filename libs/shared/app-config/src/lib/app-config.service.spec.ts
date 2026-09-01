import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppConfigService } from './app-config.service';
import { APP_BOOTSTRAP_CONFIG_URL } from './app-config.tokens';
import { DEFAULT_APP_BOOTSTRAP_CONFIG } from './bootstrap-config';
import { DEFAULT_APP_RUNTIME_MANIFEST } from './runtime-manifest';

const BOOTSTRAP_URL = '/agentic-ui-config/bootstrap.json';
const MANIFEST_URL = '/nuxeo/api/v1/path/default-domain/config/agentic-ui';

/**
 * `load()` awaits the bootstrap fetch before issuing the manifest one, so the
 * second request does not exist yet when the first is flushed. Yielding to the
 * macrotask queue lets that continuation run.
 */
const tick = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('AppConfigService', () => {
  let service: AppConfigService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_BOOTSTRAP_CONFIG_URL, useValue: BOOTSTRAP_URL },
      ],
    });
    service = TestBed.inject(AppConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('starts on the packaged defaults before anything is loaded', () => {
    expect(service.bootstrap()).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG);
    expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
    expect(service.diagnostics().bootstrapSource).toBe('packaged-default');
  });

  describe('loadBootstrap', () => {
    it('overlays the deployed file and records its source', async () => {
      const loaded = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).flush({
        branding: { applicationTitle: 'Acme Content' },
        defaultThemeId: 'dark',
      });

      await loaded;

      expect(service.bootstrap().branding.applicationTitle).toBe('Acme Content');
      expect(service.bootstrap().defaultThemeId).toBe('dark');
      expect(service.diagnostics().bootstrapSource).toBe('deployed-file');
      expect(service.diagnostics().messages).toEqual([]);
    });

    // Error path: no file deployed is the normal state for an untouched install.
    it('keeps the packaged defaults and explains itself on a 404', async () => {
      const loaded = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).flush('missing', { status: 404, statusText: 'Not Found' });

      await loaded;

      expect(service.bootstrap()).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG);
      expect(service.diagnostics().bootstrapSource).toBe('packaged-default');
      expect(service.diagnostics().messages[0]).toContain('HTTP 404');
    });

    it('survives a network error with no HTTP status', async () => {
      const loaded = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).error(new ProgressEvent('error'));

      await loaded;

      expect(service.bootstrap()).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG);
      expect(service.diagnostics().messages).toHaveLength(1);
    });

    it('survives a file whose contents are the wrong shape', async () => {
      const loaded = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).flush('a bare string, not an object');

      await loaded;

      expect(service.bootstrap()).toEqual(DEFAULT_APP_BOOTSTRAP_CONFIG);
      // The fetch itself succeeded, so this counts as a deployed file.
      expect(service.diagnostics().bootstrapSource).toBe('deployed-file');
    });
  });

  describe('loadManifest', () => {
    it('reads the manifest JSON out of the configuration document', async () => {
      const loaded = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush({
        properties: {
          'note:note': JSON.stringify({
            labels: { 'browse.title': 'Files' },
            featureToggles: { ai: false },
          }),
        },
      });

      await loaded;

      expect(service.manifest().labels).toEqual({ 'browse.title': 'Files' });
      expect(service.featureToggle('ai', true)).toBe(false);
      expect(service.diagnostics().manifestSource).toBe('nuxeo-document');
    });

    it('asks Nuxeo for every schema, without which the property is absent', () => {
      void service.loadManifest();
      expect(http.expectOne(MANIFEST_URL).request.headers.get('properties')).toBe('*');
    });

    it('honours a configured document path and property', async () => {
      const bootstrap = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).flush({
        manifestDocumentPath: '/tenant-a/config/ui',
        manifestDocumentProperty: 'acme:manifest',
      });
      await bootstrap;

      const loaded = service.loadManifest();
      http
        .expectOne('/nuxeo/api/v1/path/tenant-a/config/ui')
        .flush({ properties: { 'acme:manifest': '{"version":9}' } });
      await loaded;

      expect(service.manifest().version).toBe(9);
    });

    // Error paths: each of these is a supported deployment state.
    it('falls back when the configuration document does not exist', async () => {
      const loaded = service.loadManifest();
      http
        .expectOne(MANIFEST_URL)
        .flush('no such document', { status: 404, statusText: 'Not Found' });

      await loaded;

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().manifestSource).toBe('packaged-default');
      expect(service.diagnostics().messages[0]).toContain('HTTP 404');
    });

    it('falls back when the user cannot read the configuration document', async () => {
      const loaded = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush('denied', { status: 403, statusText: 'Forbidden' });

      await loaded;

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().messages[0]).toContain('HTTP 403');
    });

    it('reports a failed request as retryable and an absent document as not', async () => {
      const failed = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush('boom', { status: 500, statusText: 'Server Error' });
      await failed;
      expect(service.diagnostics().manifestAttempt).toBe('failed');

      const absent = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush('gone', { status: 404, statusText: 'Not Found' });
      await absent;
      expect(service.diagnostics().manifestAttempt).toBe('unavailable');
    });

    it('ignores a response for a load that has been superseded', async () => {
      // Two fetches in flight, as a fast logout then sign-in produces. The first answers last and
      // must not win, or the previous session's manifest lands on the current one.
      const first = service.loadManifest();
      const second = service.loadManifest();
      const [firstReq, secondReq] = http.match(MANIFEST_URL);

      secondReq.flush({ properties: { 'note:note': JSON.stringify({ labels: { a: 'second' } }) } });
      await second;
      firstReq.flush({ properties: { 'note:note': JSON.stringify({ labels: { a: 'first' } }) } });
      await first;

      expect(service.manifest().labels).toEqual({ a: 'second' });
    });

    it('resetManifest drops back to the packaged default and clears the attempt', async () => {
      const loaded = service.loadManifest();
      http
        .expectOne(MANIFEST_URL)
        .flush({ properties: { 'note:note': JSON.stringify({ labels: { a: 'b' } }) } });
      await loaded;
      expect(service.diagnostics().manifestSource).toBe('nuxeo-document');

      service.resetManifest();

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().manifestSource).toBe('packaged-default');
      expect(service.diagnostics().manifestAttempt).toBe('not-attempted');
    });

    it('falls back when the document exists but holds no manifest', async () => {
      const loaded = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush({ properties: { 'dc:title': 'agentic-ui' } });

      await loaded;

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().messages[0]).toContain('no readable JSON');
    });

    it('falls back when the manifest property holds malformed JSON', async () => {
      const loaded = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush({ properties: { 'note:note': '{"labels":' } });

      await loaded;

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().messages[0]).toContain('no readable JSON');
    });

    it('falls back when the response is not a document at all', async () => {
      const loaded = service.loadManifest();
      http.expectOne(MANIFEST_URL).flush('an HTML login page');

      await loaded;

      expect(service.manifest()).toEqual(DEFAULT_APP_RUNTIME_MANIFEST);
      expect(service.diagnostics().manifestSource).toBe('packaged-default');
    });
  });

  describe('load', () => {
    it('loads both halves in order, using the file to locate the document', async () => {
      const loaded = service.load();
      http.expectOne(BOOTSTRAP_URL).flush({ manifestDocumentPath: '/tenant-b/config/ui' });
      await tick();
      http
        .expectOne('/nuxeo/api/v1/path/tenant-b/config/ui')
        .flush({ properties: { 'note:note': '{"labels":{"a":"b"}}' } });

      await loaded;

      expect(service.manifest().labels).toEqual({ a: 'b' });
    });

    it('never rejects, so it is safe as an APP_INITIALIZER', async () => {
      const loaded = service.load();
      http.expectOne(BOOTSTRAP_URL).error(new ProgressEvent('error'));
      await tick();
      http.expectOne(MANIFEST_URL).flush('boom', { status: 500, statusText: 'Server Error' });

      await expect(loaded).resolves.toBeUndefined();
      expect(service.diagnostics().messages).toHaveLength(2);
    });
  });

  describe('featureToggle', () => {
    it('returns the caller fallback when the customer has not configured the toggle', () => {
      expect(service.featureToggle('ai', true)).toBe(true);
      expect(service.featureToggle('ai', false)).toBe(false);
    });
  });

  describe('resolveTheme', () => {
    it('resolves against the configured theme list', async () => {
      const loaded = service.loadBootstrap();
      http.expectOne(BOOTSTRAP_URL).flush({
        themes: [{ id: 'acme', tokens: { '--mat-sys-primary': 'teal' } }],
      });
      await loaded;

      expect(service.resolveTheme('acme').tokens['--mat-sys-primary']).toBe('teal');
      expect(service.resolveTheme('unknown').id).toBe('nuxeo');
      expect(service.themes()).toHaveLength(5);
    });
  });
});
