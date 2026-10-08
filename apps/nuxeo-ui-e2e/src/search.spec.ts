import { expect, expectSurfaceWithData, test } from './fixtures';
import { type Page } from '@playwright/test';

/**
 * Search — the path that carries the query translation Phase 3 built, and the one an
 * injection defect was found in.
 *
 * `escapeNxqlLiteral` and `escapeHxqlLiteral` have unit specs for the escaping itself; what those
 * cannot show is that a real query reaches a real OpenSearch index and comes back. That is this
 * file.
 */

/**
 * The drawer's full-text input. It is rendered by `lib-search-filters-drawer` in the app shell's
 * navigation drawer, through an extension outlet — not inside `lib-search` — so a locator scoped
 * to `lib-search` finds nothing.
 */
function fullTextInput(page: Page) {
  return page.locator('lib-search-filters-drawer input.filter-input').first();
}

const PAGE_PROVIDER = '/search/pp/default_search/execute';
const NXQL = '/search/lang/NXQL/execute';

interface SentSearch {
  /** `page-provider`: Nuxeo binds the term into the query. `nxql`: the page wrote the query text. */
  readonly endpoint: 'page-provider' | 'nxql';
  readonly params: URLSearchParams;
  readonly status: number;
  readonly resultsCount: number | null;
}

/**
 * Type `term` into the drawer's full-text input, press Enter, and return the search request that
 * produced — on whichever endpoint carried it.
 *
 * Armed after the page has settled and before Enter, which is the only thing that makes the drawer
 * search. Matched on the endpoint rather than on the term, so a page that dropped the term, or
 * moved it into hand-built NXQL, still satisfies the wait and is then judged by the assertions —
 * rather than timing out here and reporting as flake.
 */
async function searchSentFor(page: Page, term: string): Promise<SentSearch> {
  await page.goto('/#/search', { waitUntil: 'networkidle' });

  const input = fullTextInput(page);
  await expect(input, 'the search drawer has no full-text input').toBeVisible();
  await input.fill(term);

  const pending = page.waitForResponse(
    (response) => {
      const path = new URL(response.url()).pathname;
      return path.endsWith(PAGE_PROVIDER) || path.endsWith(NXQL);
    },
    { timeout: 15_000 },
  );
  await input.press('Enter');
  const response = await pending;

  const url = new URL(response.url());
  // A body that is not JSON — a proxy error page — becomes `resultsCount: null` rather than a throw
  // here, so the spec fails at its own status and count assertions, which name what went wrong.
  const body: { resultsCount?: unknown } | null = await response.json().catch(() => null);
  return {
    endpoint: url.pathname.endsWith(NXQL) ? 'nxql' : 'page-provider',
    params: url.searchParams,
    status: response.status(),
    resultsCount: typeof body?.resultsCount === 'number' ? body.resultsCount : null,
  };
}

test.describe('search', () => {
  test('returns results from the index', async ({ signedIn: page }) => {
    await page.goto('/#/search', { waitUntil: 'networkidle' });

    await expectSurfaceWithData(page, 'lib-search', /\d+\s+results?\b/);
    // A result count of zero would satisfy the pattern above, so assert a non-zero one. This
    // is the difference between "the page rendered" and "search worked".
    await expect(page.locator('lib-search .results-count')).toHaveText(/^[1-9]\d*\s+results?$/);
  });

  test('a term that cannot match returns zero results rather than an error', async ({
    signedIn: page,
  }) => {
    // The negative half. A search surface that renders results for everything is not
    // searching, and this is the assertion that would catch a query being dropped or a
    // filter being ignored. The term goes through the drawer filter input — not `?q=` in
    // the URL, which `search.ts` deliberately does not read for the query text.
    //
    // Asserted on the wire, not on the page: `/search` sets an `error()` signal when a search
    // fails and never renders it, so a 400 shows the same empty state as a genuine zero.
    const sent = await searchSentFor(page, 'zzz-no-such-document-zzz');

    expect(sent.status, 'Nuxeo did not accept the search').toBe(200);
    expect(sent.resultsCount, 'a term that cannot match returned documents').toBe(0);
    await expect(page.locator('lib-search .results-empty').first()).toBeVisible();
  });
});

/**
 * The regression guard for NXQL injection through the search term.
 *
 * ## Why `/#/search`
 *
 * These two cases used to drive `/#/search-adf-hx`, which interpolated the term into a
 * `sys_fulltext = '<term>*'` literal through `escapeHxqlLiteral` — the path the original
 * adversarial review found the injection in. NXSAT-308 deletes that route with the rest of
 * adf-hx, so the coverage moves to the search page that stays, before the route goes.
 *
 * `/#/search` writes no query text at all. `SearchService.search` sends the drawer's term to the
 * `default_search` page provider as the `ecm_fulltext` named parameter, and Nuxeo binds it into
 * the predicate server-side. There is no client-side escape to assert, so these assert the
 * property any implementation has to keep — **the term reaches Nuxeo as data, never as query
 * structure** — on whichever endpoint carries it:
 *
 *   - page provider: the bound `ecm_fulltext` value is the term verbatim, and no other parameter
 *     carries it. A client that pre-escapes, strips or rewrites the term fails here;
 *   - NXQL: the term sits inside an escaped literal, and stripping every literal leaves none of
 *     it behind. This branch is for a rewrite of the search page that builds NXQL itself, which
 *     the `nxs-` rebuild of search results could; it does not run against today's page.
 *
 * ## What is load-bearing
 *
 * The wire, not the page: as above, `/search` never renders its error signal, so a DOM "no error"
 * check would be vacuous, and there is none. The status Nuxeo answered and the `resultsCount` it
 * returned are what can fail. Measured on the shared instance on 2026-10-08: the payload below as
 * the bound value returns 0 documents; the same payload concatenated into an NXQL literal returns
 * 1,940 — every document — and an unescaped apostrophe in NXQL answers HTTP 400.
 */

/** Everything in the request that is not data: the NXQL with every literal stripped, or every page-provider parameter but the bound term. */
function structureOf(sent: SentSearch): string {
  if (sent.endpoint === 'nxql') {
    return (sent.params.get('query') ?? '').replace(/'(?:[^'\\]|\\.)*'/g, "''");
  }
  return [...sent.params]
    .filter(([name]) => name !== 'ecm_fulltext')
    .map(([name, value]) => `${name}=${value}`)
    .join('&');
}

/** On the page provider, the term must be the bound value exactly as typed. */
function expectBoundVerbatim(sent: SentSearch, term: string) {
  expect(
    sent.params.get('ecm_fulltext'),
    'the term did not reach Nuxeo as the bound ecm_fulltext value, verbatim',
  ).toBe(term);
}

test.describe('NXQL injection guard', () => {
  test('an apostrophe travels as data and Nuxeo accepts the query', async ({ signedIn: page }) => {
    const sent = await searchSentFor(page, "O'Brien");

    if (sent.endpoint === 'page-provider') {
      expectBoundVerbatim(sent, "O'Brien");
    } else {
      // Unescaped this reads `'O'Brien*'`, which closes the literal after `O` and leaves `Brien`
      // as a bare token.
      expect(
        sent.params.get('query'),
        'the apostrophe was not escaped on its way into the literal',
      ).toContain("'O\\'Brien");
    }
    expect(structureOf(sent), 'part of the term is outside its literal').not.toContain('Brien');
    // And Nuxeo agrees it is well-formed. Unescaped in NXQL it answers 400.
    expect(sent.status, 'Nuxeo rejected the query, so the literal was not closed correctly').toBe(
      200,
    );
  });

  test('a term shaped like a query cannot become query structure', async ({ signedIn: page }) => {
    // The payload from the original adversarial review, recorded in `hxql-literal.ts`: it
    // closed the literal and the enclosing parenthesis to reach a top-level `OR`, defeating
    // both hygiene filters the binding adds unconditionally and returning 155 documents where
    // the plain term returned 0.
    const payload = `zzznope') OR (ecm:uuid IS NOT NULL) OR (ecm:fulltext = 'q`;
    const sent = await searchSentFor(page, payload);

    expect(sent.status, 'Nuxeo rejected the query').toBe(200);

    if (sent.endpoint === 'page-provider') {
      expectBoundVerbatim(sent, payload);
    } else {
      expect(
        structureOf(sent),
        'the version and trash hygiene filters are no longer ANDed onto the query',
      ).toContain('ecm:isVersion = 0 AND ecm:isTrashed = 0');
    }
    // None of the payload may appear in the query's own structure — the property, stated without
    // reference to how many rows came back.
    const structure = structureOf(sent);
    expect(structure, 'the term lifted a clause out of the literal').not.toContain('ecm:uuid');
    expect(structure, 'the term introduced a top-level OR').not.toMatch(/\bOR\b/);

    // And the outcome Nuxeo reports. As data the payload matches nothing; as structure it matched
    // every document on this instance.
    expect(sent.resultsCount, 'the payload matched documents, so it ran as a query').toBe(0);
    await expect(
      page.locator('lib-search .results-count'),
      'the page shows a result count for a term that matches nothing',
    ).toHaveCount(0);
  });
});
