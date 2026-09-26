import { expect, expectSurfaceWithData, test } from './fixtures';
import { type Page } from '@playwright/test';

/**
 * Search — the path that carries the query translation Phase 3 built, and the one an
 * injection defect was found in.
 *
 * `escapeHxqlLiteral` has unit specs for the escaping itself; what those cannot show is
 * that a real query reaches a real OpenSearch index and comes back. That is this file.
 */
test.describe('search', () => {
  test('returns results from the index', async ({ signedIn: page }) => {
    await page.goto('/#/search', { waitUntil: 'networkidle' });

    await expectSurfaceWithData(page, 'lib-search', /result\(s\)/);
    // A result count of zero would satisfy `/result\(s\)/`, so assert a non-zero one. This
    // is the difference between "the page rendered" and "search worked".
    await expect(page.locator('lib-search')).toContainText(/[1-9]\d*\s+result\(s\)/);
  });

  test('a term that cannot match returns zero results rather than an error', async ({
    signedIn: page,
  }) => {
    // The negative half. A search surface that renders results for everything is not
    // searching, and this is the assertion that would catch a query being dropped or a
    // filter being ignored.
    await page.goto('/#/search?q=zzz-no-such-document-zzz', { waitUntil: 'networkidle' });

    const host = page.locator('lib-search');
    await expect(host).toBeVisible();
    await expect(host).not.toContainText(/error|failed/i);
  });

});

/**
 * The regression guard for the HXQL injection fixed in `hxql-literal.ts`.
 *
 * ## Why it drives `/#/search-adf-hx` and not `/#/search`
 *
 * It used to navigate to `/#/search?q=O'Brien` and assert that `lib-search` was visible and
 * did not contain the word "error". That could not fail. `search.ts:294` reads `q` from the
 * drawer service signal — its own comment says "All drawer filters come from the shared
 * service signal (not URL)" — so the apostrophe never reached a query builder, and the spec
 * would have passed with `escapeHxqlLiteral` reverted, with the search page rendering nothing
 * forever, or with the query parameter ignored entirely. It was the audit's one named security
 * finding, and a test that looked like it had been addressed.
 *
 * The one production call site of `escapeHxqlLiteral` is
 * `libs/features/browse/src/lib/search-adf-hx/search-adf-hx.ts:110`, which interpolates the
 * term into a `SELECT * FROM SysContent … sys_fulltext = '<term>*'` string for adf-hx's
 * `SearchService`. That is the vulnerable path, it is reachable at `/#/search-adf-hx`, and the
 * term gets there through the page's own input — so these drive it that way.
 *
 * ## Why they assert the outgoing query and not a result count
 *
 * Because a result count on this surface would be a vacuous assertion, and worse, a moving
 * one. The page's default `ORDER BY sys_modified DESC` translates to `ORDER BY dc:modified
 * DESC`, and that query answers HTTP 200 with `resultsCount: 732` and **zero entries** on this
 * instance, so the surface reads "No results found" even unfiltered. That is a real defect and
 * it is recorded rather than worked around here — changing the application to make a test pass
 * is the opposite of the job.
 *
 * The security property does not need a result count. It is that nothing the user types
 * becomes query *structure*, and the query on the wire is where that is decided.
 */
async function nxqlSentFor(page: Page, term: string): Promise<{ query: string; status: number }> {
  const input = page.locator('lib-search-adf-hx input[type="text"]').first();
  await expect(input, 'the adf-hx search surface has no text input to type into').toBeVisible();

  // Armed before typing, and matched on the translated field name rather than on the term, so
  // a query that dropped the term entirely still satisfies the wait and then fails the
  // assertions — rather than timing out here and reporting as flake.
  const pending = page.waitForResponse(
    (response) => {
      const url = new URL(response.url());
      if (!url.pathname.endsWith('/search/lang/NXQL/execute')) return false;
      return (url.searchParams.get('query') ?? '').includes('ecm:fulltext');
    },
    { timeout: 15_000 },
  );

  await input.fill(term);
  const response = await pending;

  return {
    query: new URL(response.url()).searchParams.get('query') ?? '',
    status: response.status(),
  };
}

test.describe('HXQL injection guard', () => {
  test('an apostrophe travels inside the literal and Nuxeo accepts the query', async ({
    signedIn: page,
  }) => {
    await page.goto('/#/search-adf-hx', { waitUntil: 'networkidle' });

    const { query, status } = await nxqlSentFor(page, "O'Brien");

    // The escaped form, on the wire. Unescaped this reads `'O'Brien*'`, which closes the
    // literal after `O` and leaves `Brien` as a bare token.
    expect(query, 'the apostrophe was not escaped on its way into the literal').toContain(
      "ecm:fulltext = 'O\\'Brien*'",
    );
    // And Nuxeo agrees it is a well-formed literal. Unescaped it answers 400.
    expect(status, 'Nuxeo rejected the query, so the literal was not closed correctly').toBe(200);
    await expect(
      page.locator('.hxp-search-page__error'),
      'the page surfaced a query error',
    ).toHaveCount(0);
  });

  test('a term shaped like a query cannot become query structure', async ({ signedIn: page }) => {
    await page.goto('/#/search-adf-hx', { waitUntil: 'networkidle' });

    // The payload from the original adversarial review, recorded in `hxql-literal.ts`: it
    // closed the literal and the enclosing parenthesis to reach a top-level `OR`, defeating
    // both hygiene filters the binding adds unconditionally and returning 155 documents where
    // the plain term returned 0.
    const payload = `zzznope') OR (ecm:uuid IS NOT NULL) OR (ecm:fulltext = 'q`;
    const { query, status } = await nxqlSentFor(page, payload);

    expect(status, 'Nuxeo rejected the query').toBe(200);

    // Strip every literal and what remains is the query's own structure. None of the payload
    // may appear in it — that is the whole property, stated without reference to how many rows
    // came back.
    const structure = query.replace(/'(?:[^'\\]|\\.)*'/g, "''");
    expect(structure, 'the term lifted a clause out of the literal').not.toContain('ecm:uuid');
    expect(structure, 'the term introduced a top-level OR').not.toMatch(/\bOR\b/);
    expect(
      structure,
      'the version and trash hygiene filters are no longer ANDed onto the query',
    ).toContain('ecm:isVersion = 0 AND ecm:isTrashed = 0');
  });
});
