/**
 * The one place that makes a browser page render the `zz` pseudo-locale, and proves it did.
 *
 * Both audits need this and only one of them had it. `pseudo-locale-audit.mjs` was fixed to
 * intercept the Layer 0 config and assert the sentinel; `pseudo-locale-deep.mjs` was then wired
 * into `npm run i18n:audit` without it, so the deep pass — the one that opens dialogs and menus,
 * where a missed string is least likely to be noticed by hand — ran against the packaged `en`
 * default. Under English every string is plain ASCII prose, which is exactly what these audits
 * report as untranslated, so its findings were unreadable in both directions: a correctly keyed
 * string looked like a miss, and a real miss was indistinguishable from one.
 *
 * Two separate processes cannot share a browser, so sharing the SETUP is the only way both stay
 * correct when one is changed. That is the point of this module existing rather than the override
 * being copied.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The Layer 0 config request the application makes at startup. */
export const BOOTSTRAP_ROUTE = '**/agentic-ui-config/bootstrap.json';

/** `⟦` — it can only come from a generated `zz` catalogue, so seeing it proves one loaded. */
export const SENTINEL = '\u27E6';

const PACKAGED_BOOTSTRAP = join(
  process.cwd(),
  'nuxeo-agentic-ui-package/src/main/config/bootstrap.json',
);

/** The packaged config with only the language swapped, leaving branding and everything else alone. */
const bootstrapForPseudoLocale = () => {
  const config = JSON.parse(readFileSync(PACKAGED_BOOTSTRAP, 'utf8'));
  config.defaultLanguage = 'zz';
  // The default must also be advertised, or it is not selectable and the loader may refuse it.
  config.availableLanguages = [...new Set([...(config.availableLanguages ?? []), 'zz'])];
  return JSON.stringify(config, null, 2);
};

/** Serves `defaultLanguage: 'zz'` for every bootstrap request this page makes. */
export async function servePseudoLocale(page) {
  await page.route(BOOTSTRAP_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'cache-control': 'no-store' },
      body: bootstrapForPseudoLocale(),
    }),
  );
}

/** Whether the pseudo-locale has actually rendered on the page as it currently stands. */
export async function sentinelPresent(page) {
  return page.evaluate((mark) => document.body.innerText.includes(mark), SENTINEL);
}

/**
 * Refuses to let a run report a total it cannot support.
 *
 * Without the pseudo-locale active the "untranslated" count approaches the whole application, which
 * reads as a catastrophic result rather than a broken audit — the two failure modes produce
 * opposite conclusions from identical output. So this exits non-zero rather than printing a number
 * someone would quote.
 */
export function requireSentinel(seen, audit) {
  if (seen) return;
  console.error(
    `${audit}: the pseudo-locale never rendered — no \`${SENTINEL}\` appeared on any surface, so ` +
      'this run cannot tell an untranslated string from an unloaded catalogue and its count means ' +
      'nothing.\n' +
      '  - run `npm run i18n:pseudo` first, so the zz catalogues exist\n' +
      '  - check the dev server is serving them, and that BOOTSTRAP_ROUTE here still matches the ' +
      'URL the application fetches',
  );
  process.exit(1);
}

/**
 * Whether a string the audit found is text a user reads.
 *
 * This lived in both audits as a byte-identical copy of
 * `/^[A-Za-z][A-Za-z0-9 ,.'&()\/-]{2,}$/`, and that pattern silently discarded every string
 * containing `?`, `!`, `:`, `"`, `%` or `\u2026`, or starting with a digit. The instrument used to
 * claim "everything remaining is accounted for" could not see `Are you sure?`, `Company:`,
 * `50% complete` or `Loading\u2026` — which is exactly the punctuation an interface is full of, and
 * the reason this pull request kept reporting itself complete for eight review rounds.
 *
 * It is now permissive by default and exclusion is done by ORIGIN — the data containers and the
 * instance-data list — not by spelling. A filter that admits text through a punctuation allowlist
 * cannot be audited, because what it drops is invisible.
 *
 * The pseudo-locale is what separates signal from noise here: anything catalogue-sourced comes back
 * wrapped in `\u27E6\u2026\u27E7`, so a string WITHOUT the sentinel is by definition not from a
 * catalogue. Keeping every such string and filtering by where it renders is the honest order.
 */
export const looksLikeUiText = (text) => {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.includes(SENTINEL)) return false;
  // At least three ASCII letters, so pure numbers, dates, ids and punctuation runs are not prose.
  return (trimmed.match(/[A-Za-z]/g) ?? []).length >= 3;
};
