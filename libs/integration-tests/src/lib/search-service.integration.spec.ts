// @vitest-environment jsdom
/**
 * SearchService integration tests.
 *
 * Stage 5 of the integration-test plan: SearchService (839 lines) against live Nuxeo and
 * OpenSearch. The highest-risk gap per audit §6.1, §7.2.
 *
 * Tests:
 * - NXQL/HXQL query generation (including injection cases from hxql-literal.ts)
 * - Quick filters, drawer filters
 * - Sorting, pagination
 * - Saved search CRUD
 * - Error handling (4xx, 5xx)
 * - Empty results, edge cases
 *
 * Acceptance criteria (from audit §11 Stage 5), and where each actually stands:
 * - Every public method exercised against the server — NOT met. `vitest.config.mts` sets
 *   `environment: 'node'`, Angular's `HttpClient` needs `XMLHttpRequest`, and 13 of the 19
 *   tests here fail on the resulting DI poisoning. See the pull request's known issues.
 * - At least one 4xx and one 5xx tested — NOT met. See the note in `Error Handling` below.
 * - Reverting hxql-literal fix turns suite red — met, but **not here**. The guard lives in
 *   `apps/nuxeo-ui-e2e/src/search.spec.ts`, which drives the one page that composes HXQL.
 *   The block that used to stand in for it in this file could not fail; see below.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SearchService, type SearchResponse } from '@nuxeo-satori/platform/nuxeo-client';
import { setupIntegrationHarness, createTestDocument } from './integration-harness';

describe('SearchService Integration Tests', () => {
  const harness = setupIntegrationHarness();
  let searchService: SearchService;

  // `beforeEach`, not `beforeAll`. The setup file resets the TestBed between tests, so a
  // service injected once was reached through a destroyed injector from the second test
  // onward — `NG0205: Injector has already been destroyed`, which is what surfaced as soon
  // as the DOM problem above it was fixed.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // The app authenticates through an interceptor, and there is none in a bare
        // TestBed. Without this every request here runs as Anonymous — and this Nuxeo
        // answers an unauthenticated query with HTTP 200 and no rows rather than a 401,
        // so the suite would look like it was working while testing a different principal.
        provideHttpClient(
          withInterceptors([
            (req, next) => next(req.clone({ setHeaders: { Authorization: harness.auth } })),
          ]),
        ),
        SearchService,
      ],
    });

    searchService = TestBed.inject(SearchService);
  });

  describe('Basic Search', () => {
    it('can execute a simple search query', async () => {
      // Create a test document to search for
      await createTestDocument(harness, {
        type: 'File',
        name: 'search-test-doc',
        title: 'Searchable Document',
        properties: {
          'dc:description': 'This document is for search integration testing',
        },
      });

      // Execute search
      const result = await new Promise<SearchResponse>((resolve, reject) => {
        searchService
          .search({
            q: 'Searchable',
            pageSize: 10,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      console.log(`[search-integration] Found ${result.items.length} result(s)`);
    });

    it('returns empty results for a term that cannot match', async () => {
      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: 'zzz-no-such-document-zzz',
            pageSize: 10,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result.items).toHaveLength(0);
      console.log('[search-integration] Zero results handled correctly');
    });
  });

  // The `HXQL Injection Guard` block that stood here is deleted rather than repaired.
  //
  // It tested the wrong service. `escapeHxqlLiteral` has exactly one production call site —
  // `libs/features/browse/src/lib/search-adf-hx/search-adf-hx.ts:110`, which interpolates a
  // term into `SELECT * FROM SysContent WHERE sys_fulltext = '<term>*'` for adf-hx. The
  // platform `SearchService` injected here composes no query string at all; it builds
  // `HttpParams`. Reverting `escapeHxqlLiteral` to the identity function could not turn these
  // two tests red, and their only assertions were `toBeDefined()` on the response.
  //
  // So the block could not meet the acceptance criterion in this file's header, and left
  // looking like coverage it made the criterion appear met. The guard now lives in
  // `apps/nuxeo-ui-e2e/src/search.spec.ts`, drives the page that composes the HXQL, and
  // asserts the query *on the wire* — verified red by replacing `escapeHxqlLiteral` with the
  // identity function.

  describe('Filters', () => {
    it('can apply quick filters', async () => {
      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            quickFilters: 'File',
            pageSize: 10,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      console.log(`[search-integration] Quick filter returned ${result.items.length} result(s)`);
    });

    it('can filter by author', async () => {
      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            author: harness.user,
            pageSize: 10,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      console.log(`[search-integration] Author filter returned ${result.items.length} result(s)`);
    });

    it('can filter by tag', async () => {
      // `dc:subjects` is bound to the `l10nsubjects` vocabulary, so an arbitrary string is
      // rejected: `'integration-test'` produced HTTP 422 "is not a valid l10nsubjects id"
      // and the test failed on document creation, before it reached the filter at all.
      // `art` is a real entry in that directory on a stock instance.
      const subject = 'art';

      await createTestDocument(harness, {
        type: 'File',
        name: 'tagged-doc',
        title: 'Tagged Document',
        properties: {
          'dc:subjects': [subject],
        },
      });

      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            tag: subject,
            pageSize: 10,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      // May or may not find it depending on index freshness
      console.log(`[search-integration] Tag filter returned ${result.items.length} result(s)`);
    });
  });

  describe('Sorting and Pagination', () => {
    it('can sort results by title ascending', async () => {
      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            sortBy: 'dc:title',
            sortOrder: 'asc',
            pageSize: 5,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      console.log(`[search-integration] Sorted ${result.items.length} result(s) by title asc`);
    });

    it('can sort results by modified date descending', async () => {
      const result: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            sortBy: 'dc:modified',
            sortOrder: 'desc',
            pageSize: 5,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      console.log(`[search-integration] Sorted ${result.items.length} result(s) by modified desc`);
    });

    it('can paginate results', async () => {
      // Page 0
      const page0: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            pageSize: 2,
            pageIndex: 0,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      // Page 1
      const page1: any = await new Promise((resolve, reject) => {
        searchService
          .search({
            q: '',
            pageSize: 2,
            pageIndex: 1,
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(page0.items).toBeDefined();
      expect(page1.items).toBeDefined();

      // If we have enough documents, pages should differ
      if (page0.items.length > 0 && page1.items.length > 0) {
        // Compare first item IDs (they should be different if pagination works)
        const ids0 = page0.items.map((item: any) => item.id);
        const ids1 = page1.items.map((item: any) => item.id);
        const overlap = ids0.filter((id: string) => ids1.includes(id));
        expect(overlap.length).toBe(0); // Pages should not overlap
      }

      console.log(
        `[search-integration] Page 0: ${page0.items.length}, Page 1: ${page1.items.length}`,
      );
    });
  });

  describe('Autocomplete Suggestions', () => {
    it('can get autocomplete suggestions', async () => {
      await createTestDocument(harness, {
        type: 'File',
        name: 'suggestion-test',
        title: 'Suggestion Test Document',
      });

      const suggestions: any = await new Promise((resolve, reject) => {
        searchService.suggest('Suggestion', 5).subscribe({
          next: resolve,
          error: reject,
        });
      });

      expect(Array.isArray(suggestions)).toBe(true);
      console.log(`[search-integration] Got ${suggestions.length} suggestion(s)`);
    });

    it('returns empty suggestions for empty query', async () => {
      const suggestions: any = await new Promise((resolve, reject) => {
        searchService.suggest('', 5).subscribe({
          next: resolve,
          error: reject,
        });
      });

      expect(suggestions).toHaveLength(0);
      console.log('[search-integration] Empty query returns no suggestions');
    });
  });

  describe('Collections', () => {
    it('can get user collections', async () => {
      const collections: any = await new Promise((resolve, reject) => {
        searchService.getUserCollections().subscribe({
          next: resolve,
          error: reject,
        });
      });

      expect(Array.isArray(collections)).toBe(true);
      console.log(`[search-integration] Found ${collections.length} collection(s)`);
    });
  });

  describe('Saved Searches', () => {
    let savedSearchId: string;

    it('can create a saved search', async () => {
      const created: any = await new Promise((resolve, reject) => {
        searchService
          .saveSavedSearch({
            title: `Integration Test Search ${harness.runId}`,
            params: {
              // `ecm_fulltext`, not `query`. `saveSavedSearch` always sends
              // `pageProviderName: 'default_search'`, and Nuxeo rejects a `query` parameter
              // beside it: HTTP 400 "query and page provider parameters are mutually
              // exclusive (query, queryLanguage, pageProviderName)". The free-text parameter
              // of the `default_search` page provider is `ecm_fulltext`.
              ecm_fulltext: 'test',
              pageSize: '10',
            },
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(created).toBeDefined();
      savedSearchId = created.uid ?? created.id;
      expect(savedSearchId).toBeDefined();
      console.log(`[search-integration] Created saved search: ${savedSearchId}`);
    });

    it('can list saved searches', async () => {
      const searches: any = await new Promise((resolve, reject) => {
        searchService.getSavedSearches().subscribe({
          next: resolve,
          error: reject,
        });
      });

      expect(Array.isArray(searches)).toBe(true);
      const ourSearch = searches.find((s: any) => s.title?.includes(harness.runId));
      expect(ourSearch).toBeDefined();
      console.log(`[search-integration] Found ${searches.length} saved search(es)`);
    });

    // The three tests below opened with `if (!savedSearchId) { log; return }`. That guard
    // is why the review counted them among six tests that "passed" without issuing any
    // HTTP: creation was failing, so `savedSearchId` was never set and each of them
    // returned before doing anything. A test that silently returns is a test that cannot
    // report. `expect` instead, so a broken creation fails them rather than skipping them.

    it('can get a saved search by ID', async () => {
      expect(savedSearchId, 'the creating test must have run and succeeded').toBeTruthy();

      const params: any = await new Promise((resolve, reject) => {
        searchService.getSavedSearchById(savedSearchId).subscribe({
          next: resolve,
          error: reject,
        });
      });

      expect(params).toBeDefined();
      expect(params.ecm_fulltext).toBe('test');
      console.log(`[search-integration] Retrieved saved search params: ${JSON.stringify(params)}`);
    });

    it('can update a saved search', async () => {
      expect(savedSearchId, 'the creating test must have run and succeeded').toBeTruthy();

      const updated: any = await new Promise((resolve, reject) => {
        searchService
          .updateSavedSearch(savedSearchId, {
            title: `Updated Test Search ${harness.runId}`,
            params: {
              // `ecm_fulltext`, for the same reason as the creating test above: a `query`
              // parameter beside `pageProviderName` is a 400.
              ecm_fulltext: 'updated-test',
              pageSize: '20',
            },
          })
          .subscribe({
            next: resolve,
            error: reject,
          });
      });

      expect(updated).toBeDefined();
      console.log('[search-integration] Updated saved search');
    });

    it('can delete a saved search', async () => {
      expect(savedSearchId, 'the creating test must have run and succeeded').toBeTruthy();

      await new Promise((resolve, reject) => {
        searchService.deleteSavedSearch(savedSearchId).subscribe({
          next: resolve,
          error: reject,
        });
      });

      console.log('[search-integration] Deleted saved search');
    });
  });

  describe('Error Handling', () => {
    // This test used to `try`/`catch` around the call and assert `toBeDefined()` in both
    // arms — success and failure were equally acceptable, so it could not distinguish
    // correct 4xx handling from an arbitrary exception from the field being ignored
    // outright. It asserted that something happened.
    //
    // The behaviour is determinate, so it is asserted. Measured against this Nuxeo:
    //
    //   GET /nuxeo/api/v1/search/pp/default_search/execute
    //       ?sortBy=invalid_field_that_does_not_exist&sortOrder=desc&pageSize=10
    //   -> HTTP 200, "hasError": false, resultsCount 695
    //
    // The page provider tolerates an unknown sort field rather than rejecting it, so the
    // contract is "results still arrive", and reverting that would turn this red.
    it('ignores an unknown sort field and still returns results', async () => {
      const result = await new Promise<SearchResponse>((resolve, reject) => {
        searchService
          .search({
            q: '',
            sortBy: 'invalid_field_that_does_not_exist',
            pageSize: 10,
          })
          .subscribe({ next: resolve, error: reject });
      });

      // `items.length > 0`, not `toBeDefined()`. The preflight refuses to run against an
      // empty repository, so rows are guaranteed to exist — an empty page here means the
      // unknown sort field suppressed them, which is the behaviour under test.
      expect(result.items.length).toBeGreaterThan(0);
      console.log(
        `[search-integration] Unknown sort field ignored; ${result.items.length} result(s) on page 1`,
      );
    });

    // NOT COVERED, and named rather than implied: the stage's acceptance criterion asks for
    // "at least one 4xx and one 5xx tested". `SearchService.search` reaches Nuxeo only
    // through page-provider parameters, and none of them makes it answer 4xx — an unknown
    // sort field is ignored, as above. Meeting that criterion needs a method that can be
    // driven to an error status, not a wider `catch` around this one.
  });
});
