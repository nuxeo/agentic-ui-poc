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
