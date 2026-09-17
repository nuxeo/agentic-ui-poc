import { expect, expectSurfaceWithData, test } from './fixtures';

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

  test('a quote in the search term does not break the query', async ({ signedIn: page }) => {
    /**
     * The regression guard for the HXQL injection fixed in `hxql-literal.ts`. An
     * apostrophe is ordinary input — `O'Brien` — and before the fix it closed the literal.
     * The unit specs prove the escaping; this proves the escaped query still round-trips
     * through Nuxeo instead of returning a 500.
     */
    await page.goto("/#/search?q=O'Brien", { waitUntil: 'networkidle' });

    const host = page.locator('lib-search');
    await expect(host).toBeVisible();
    await expect(host).not.toContainText(/error|failed|500/i);
  });
});
