/**
 * The one place the pinned install versions live.
 *
 * Reviewed on PR #225: pinning the versions in every printed install command is only a real
 * guarantee if there is one place to change them. Before this, the same two literals were
 * typed out in nine files — `preflight.mjs`, three diagnostics, `README.md`, `a11y-scout.md`,
 * `authoring.md` and two spec file comments — and a re-pin meant finding every copy by hand.
 *
 * `README.md:60` explains WHY these are pinned rather than left to resolve to "latest": the
 * recorded findings in this folder were measured against this exact engine, and an unpinned
 * later install can silently swap it, making a re-scan incomparable to that baseline.
 *
 * The markdown and spec-comment copies of these strings cannot `import` this file — they are
 * prose, not code — so they are not generated from it. They are kept in sync by hand, and each
 * one says so: "kept in sync with a11y/versions.mjs". Every script that actually PRINTS or
 * RUNS an install command does import from here, so there is exactly one runtime source.
 */

import { readFileSync } from 'node:fs';

/** Matches `@axe-core/playwright@4.13.0`, which `axe-differential.mjs` confirms resolves the
 * same deduped `axe-core@4.13.0` that `a11y-scout@0.3.0` uses. */
export const AXE_CORE_PLAYWRIGHT_VERSION = '4.13.0';

/** The `@playwright/test` version the recorded baseline was measured with. */
export const PLAYWRIGHT_TEST_VERSION = '1.63.0';

/** The hand-distributed a11y-scout tarballs this folder has been verified against. */
export const A11Y_SCOUT_VERSION = '0.3.0';

export const PINNED_PLAYWRIGHT_TEST = `@playwright/test@${PLAYWRIGHT_TEST_VERSION}`;
export const PINNED_AXE_CORE_PLAYWRIGHT = `@axe-core/playwright@${AXE_CORE_PLAYWRIGHT_VERSION}`;

/** The full four-package install line, minus the leading `npm install --no-save`. */
export const PINNED_INSTALL_ARGS = `${PINNED_PLAYWRIGHT_TEST} ${PINNED_AXE_CORE_PLAYWRIGHT}`;

/**
 * What each package's version must actually be, for the preflight to check against.
 *
 * A pin written only into an install command pins nothing: it is advice to whoever reads it,
 * and `node_modules` is untracked here, so a tree installed before a re-pin — or installed
 * without `--no-save` from a stale lockfile — keeps running and reports nothing. The versions
 * are load-bearing (see `README.md:60`), so they are verified rather than recommended.
 *
 * The a11y-scout packages are hand-distributed tarballs with no registry behind them, but
 * both still declare a version in their manifest, so they are checked the same way.
 */
export const PINNED = {
  '@playwright/test': PLAYWRIGHT_TEST_VERSION,
  '@axe-core/playwright': AXE_CORE_PLAYWRIGHT_VERSION,
  'a11y-scout': A11Y_SCOUT_VERSION,
  '@a11y-scout/playwright': A11Y_SCOUT_VERSION,
};

/**
 * The `axe-core` the baseline was measured with.
 *
 * Not in `PINNED`: nothing installs it directly. It arrives as a transitive dependency of
 * both `@axe-core/playwright` and `a11y-scout`, and the finding counts in this folder are
 * the output of THIS engine — a later one adds and retires rules, so a re-scan against a
 * different version is not comparable to the recorded numbers. Reported, not enforced,
 * because the fix is to re-pin the two packages above rather than to install it by hand.
 */
export const BASELINE_AXE_CORE = '4.13.0';

/**
 * The version in an installed package's manifest, or `null` if it is not installed or its
 * manifest is unreadable.
 *
 * Reads `node_modules/<pkg>/package.json` directly rather than importing the package: the
 * caller is asking what is on disk, and importing runs the package's entry point, which for
 * `@playwright/test` is not free. `null` means "no answer", which the caller reports as a
 * missing install rather than as a mismatch.
 *
 * @param {string} pkg
 * @returns {string | null}
 */
export function installedVersion(pkg) {
  try {
    const manifest = JSON.parse(
      readFileSync(new URL(`../node_modules/${pkg}/package.json`, import.meta.url), 'utf8'),
    );
    return typeof manifest.version === 'string' ? manifest.version : null;
  } catch {
    return null;
  }
}
