import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { signal } from '@angular/core';

import {
  AppTranslateLoader,
  UPSTREAM_KEY_ALIAS_PAIRS,
  applyUpstreamKeyAliases,
} from './app-translate-loader';
import { EN_FALLBACK_TRANSLATIONS } from './en-fallback';

/** The four folders `SEEDED_FOLDERS` declares, in order, plus the app's own catalogue last. */
const SEEDED_FOLDER_COUNT = 4;

/** A catalogue as served: nested or flat, string leaves only once flattened. */
type CatalogueBody = Record<string, unknown>;

describe('applyUpstreamKeyAliases', () => {
  it('copies the canonical value onto the key upstream asks for', () => {
    const catalogue = applyUpstreamKeyAliases({
      'DOCUMENT_TREE.TOGGLE_ARIA-LABEL': 'Toggle',
    });

    expect(catalogue['DOCUMENT_TREE.TOGGLE_ARIA-LABEL ']).toBe('Toggle');
  });

  it('copies the translated value, not a hardcoded English one', () => {
    const catalogue = applyUpstreamKeyAliases({
      'DOCUMENT_TREE.TOGGLE_ARIA-LABEL': 'Basculer',
    });

    expect(catalogue['DOCUMENT_TREE.TOGGLE_ARIA-LABEL ']).toBe('Basculer');
  });

  it('leaves an alias upstream already ships alone', () => {
    const catalogue = applyUpstreamKeyAliases({
      'DOCUMENT_TREE.TOGGLE_ARIA-LABEL': 'Toggle',
      'DOCUMENT_TREE.TOGGLE_ARIA-LABEL ': 'Upstream fixed it',
    });

    expect(catalogue['DOCUMENT_TREE.TOGGLE_ARIA-LABEL ']).toBe('Upstream fixed it');
  });

  it('adds nothing when the canonical key is absent', () => {
    expect(applyUpstreamKeyAliases({})).toEqual({});
  });

  /**
   * The negative control for the whole workaround. Every alias exists *because* it differs from
   * its canonical key by whitespace a reader cannot see. A formatter, an editor's
   * trim-on-save, or a helpful cleanup that collapses the two makes the alias a no-op and
   * silently restores the defect — the accessible name goes back to rendering a raw key, and
   * nothing else changes. This is the assertion that turns that into a red test.
   */
  it('keeps every alias distinct from its canonical key, differing only by trailing whitespace', () => {
    expect(UPSTREAM_KEY_ALIAS_PAIRS.length).toBeGreaterThan(0);

    for (const [alias, canonical] of UPSTREAM_KEY_ALIAS_PAIRS) {
      expect(alias).not.toBe(canonical);
      expect(alias.trimEnd()).toBe(canonical);
    }
  });
});

describe('AppTranslateLoader', () => {
  let loader: AppTranslateLoader;
  let httpMock: HttpTestingController;

  function configure(labels: Record<string, string> = {}): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AppConfigService,
          useValue: { manifest: signal({ labels }) },
        },
      ],
    });

    loader = TestBed.inject(AppTranslateLoader);
    httpMock = TestBed.inject(HttpTestingController);
  }

  /**
   * Answers every outstanding request: the seeded folders in declaration order, then the app's
   * own catalogue. `getTranslation` issues them in one `forkJoin`, so they are all pending at
   * once and the order of `httpMock.match` is the order the loader built them in.
   */
  function flushCatalogues(folders: CatalogueBody[], app: CatalogueBody): void {
    const requests = httpMock.match(() => true);
    expect(requests.length).toBe(SEEDED_FOLDER_COUNT + 1);

    requests.slice(0, SEEDED_FOLDER_COUNT).forEach((request, index) => {
      request.flush(folders[index] ?? {});
    });
    requests[SEEDED_FOLDER_COUNT].flush(app);
  }

  afterEach(() => httpMock.verify());

  it('aliases the document tree toggle key from the adf-hx catalogue', () => {
    configure();
    let merged: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((value) => (merged = value));

    flushCatalogues([{}, { DOCUMENT_TREE: { 'TOGGLE_ARIA-LABEL': 'Toggle' } }], {});

    expect(merged?.['DOCUMENT_TREE.TOGGLE_ARIA-LABEL ']).toBe('Toggle');
  });

  it('lets the manifest override an aliased key, so it stays Layer 0 configurable', () => {
    configure({ 'DOCUMENT_TREE.TOGGLE_ARIA-LABEL ': 'Expand folder' });
    let merged: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((value) => (merged = value));

    flushCatalogues([{}, { DOCUMENT_TREE: { 'TOGGLE_ARIA-LABEL': 'Toggle' } }], {});

    expect(merged?.['DOCUMENT_TREE.TOGGLE_ARIA-LABEL ']).toBe('Expand folder');
  });

  it('applies precedence folders < app catalogue < manifest labels', () => {
    configure({ 'a.key': 'from manifest' });
    let merged: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((value) => (merged = value));

    flushCatalogues([{ a: { key: 'from folder' }, 'only.folder': 'folder' }], {
      a: { key: 'from app' },
      'only.app': 'app',
    });

    expect(merged?.['a.key']).toBe('from manifest');
    expect(merged?.['only.folder']).toBe('folder');
    expect(merged?.['only.app']).toBe('app');
  });

  it('falls back to the compiled-in English map when the app catalogue cannot be fetched', () => {
    configure();
    let merged: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((value) => (merged = value));

    const requests = httpMock.match(() => true);
    requests.slice(0, SEEDED_FOLDER_COUNT).forEach((request) => request.flush({}));
    requests[SEEDED_FOLDER_COUNT].flush('', { status: 404, statusText: 'Not Found' });

    expect(merged?.['app.title']).toBe(EN_FALLBACK_TRANSLATIONS['app.title']);
  });

  /**
   * Regression test for the themes search button, whose `[attr.aria-label]` is
   * `settings.themes.search`. The key was in the shipped catalogue and absent from the fallback,
   * so a failed fetch named that control with the raw key. Asserted here rather than only in the
   * guardrail because this is the path that actually renders the wrong name.
   */
  it('names every accessible-name key on a failed fetch, not just some of them', () => {
    configure();
    let merged: Record<string, string> | undefined;
    loader.getTranslation('en').subscribe((value) => (merged = value));

    const requests = httpMock.match(() => true);
    requests.slice(0, SEEDED_FOLDER_COUNT).forEach((request) => request.flush({}));
    requests[SEEDED_FOLDER_COUNT].flush('', { status: 500, statusText: 'Server Error' });

    expect(merged?.['settings.themes.search']).toBe('Search themes');
  });

  it('exposes the merged folder catalogue to adf-core synchronously once loaded', () => {
    configure();
    loader.getTranslation('en').subscribe();
    flushCatalogues([{ DOCUMENT_TREE: { ROOT: 'Home' } }], {});

    expect(loader.getFullTranslationJSON('en')['DOCUMENT_TREE.ROOT']).toBe('Home');
  });
});
