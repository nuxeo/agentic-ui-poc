import type { Page } from '@playwright/test';
import { expect, test } from './a11y-fixtures';

/**
 * WCAG scan of the three **display modes** the application has never been rendered in by any
 * layer: dark theme, Windows High Contrast (`forced-colors: active`), and reduced motion.
 *
 * ## Why these three, and why now
 *
 * All three are one line of Playwright configuration, none had ever been set in this repository
 * (`colorScheme`, `forcedColors` and `reducedMotion` appear in no config or spec), and each
 * covers a criterion nothing else reaches:
 *
 *   - **Dark theme** changes every colour pair on the page, so `color-contrast` has to be
 *     re-measured. The light-theme result says nothing about it.
 *   - **Forced colors** (1.4.8 / 1.4.11 in practice) replaces author colours with a user palette.
 *     The repository contains **no** `forced-colors`, `-ms-high-contrast` or `forced-color-adjust`
 *     rule anywhere, so nothing has been adapted for it.
 *   - **Reduced motion** (2.3.3, and a vestibular-safety concern well beyond it) is the one with
 *     a defect already visible in the source — see below.
 *
 * ## The trap this file exists to avoid, in two parts
 *
 * **Dark mode is not `prefers-color-scheme` here.** `AppThemeService` sets a `data-app-theme`
 * attribute on `<html>` from a `localStorage` key, and `styles.scss` keys its palettes off that
 * attribute. Setting Playwright's `colorScheme: 'dark'` would flip the browser's own form-control
 * rendering and change nothing about the application's theme — a scan that looks like it covered
 * dark mode and did not. This file seeds the storage key instead, then asserts the resolved
 * background is actually dark before scanning.
 *
 * **A zero under reduced motion proves nothing on its own.** If the measurement is broken it also
 * reports zero. Every motion measurement below is therefore run twice, once with
 * `reducedMotion: 'reduce'` and once with `'no-preference'`, and the control is what gives the
 * reduced number meaning.
 *
 * ## What the motion measurement actually found — read this before trusting a verdict
 *
 * This application binds no Angular animation trigger in any template, so route changes are
 * instant and there is no transition to measure. The reduced-motion check below is therefore a
 * **tripwire, not a result** — and getting it to say so honestly took two attempts:
 *
 *   - The first run reported "reduced motion is NOT honoured, longest 6665ms". That was wrong.
 *     Identifying each animation showed all of them were `mdc-circular-progress__*` — Material's
 *     indeterminate spinner, a looping CSS animation that runs regardless of any route change.
 *     **Zero finite animations were observed in either run**, so no route transition was ever
 *     captured and the verdict was about furniture.
 *   - The fix was identification, not more sampling. The report now records each animation's
 *     target, duration and iteration count, distinguishes looping from finite, and prints
 *     INCONCLUSIVE rather than a verdict when the control saw no finite animation. That is what
 *     stopped the wrong claim, and it is the load-bearing part of this file.
 *
 * When someone does bind an animation trigger, this spec starts returning a real verdict. Two
 * things to get right then, because a previous iteration of this work got both wrong: durations
 * must read `--app-motion-duration-*` or `matchMedia` rather than being hardcoded, and a
 * `prefers-reduced-motion` block in a stylesheet cannot reach Angular animations at all, because
 * they run through the Web Animations API.
 *
 * Separately and genuinely live: the spinners keep looping under `prefers-reduced-motion:
 * reduce`. Whether an indeterminate progress spinner should stop is a judgement call, but it is
 * a real observation about the running application rather than about dead files.
 *
 * Run:  npm run a11y:modes
 */

const THEME_STORAGE_KEY = 'agentic_ui_color_theme';

/** The same seven surfaces `surfaces.a11y.spec.ts` covers, so results are comparable. */
const ROUTES: ReadonlyArray<readonly [label: string, route: string, host: string]> = [
  ['browse', '/#/browse', 'lib-browse'],
  ['search', '/#/search', 'lib-search'],
  ['trash', '/#/trash', 'lib-trash'],
  ['tasks', '/#/tasks', 'lib-tasks-page'],
  ['administration', '/#/administration', 'lib-administration-shell'],
  ['knowledge discovery', '/#/knowledge-discovery', 'lib-knowledge-discovery'],
  ['adf-hx browse POC', '/#/browse-adf-hx', 'lib-browse-adf-hx-poc'],
];

interface ModeResult {
  readonly mode: string;
  readonly route: string;
  readonly findings: number;
  readonly blockers: number;
  readonly rules: readonly string[];
}
const results: ModeResult[] = [];

/** One animation observed mid-flight, identified well enough to tell what produced it. */
interface ObservedAnimation {
  readonly target: string;
  readonly durationMs: number;
  readonly iterations: string;
  readonly kind: string;
}

/** Max concurrent animations and longest declared duration seen while `action` ran. */
interface MotionSample {
  readonly peakConcurrent: number;
  readonly longestMs: number;
  readonly totalObserved: number;
  /** Deduplicated by target+duration. The reason the raw counts above are interpretable. */
  readonly animations: readonly ObservedAnimation[];
}
const motion: Array<{ label: string; sample: MotionSample }> = [];

/**
 * State the motion probe parks on the page between its two `page.evaluate()` calls.
 *
 * Declared as a real `Window` augmentation rather than reached by casting `window` to an
 * inline shape in each block. `review:guardrails` flagged the cast version as a broad type
 * escape, and rightly: it restated the shape twice, so the two halves of the probe could drift
 * and the compiler would not notice.
 */
declare global {
  interface Window {
    __motionProbe?: {
      frames: number[];
      seen: ObservedAnimation[];
      raf?: number;
    };
  }
}

/** Relative luminance of the page background, so "the dark theme applied" is measurable. */
async function backgroundLuminance(page: Page): Promise<number> {
  return page.evaluate(() => {
    const rgb = getComputedStyle(document.body).backgroundColor;
    const m = rgb.match(/\d+(\.\d+)?/g);
    if (!m) return 1;
    const [r, g, b] = m.slice(0, 3).map((v) => {
      const c = Number(v) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  });
}

/**
 * Sample `document.getAnimations()` every frame while a route change runs.
 *
 * `getAnimations()` is the right instrument precisely because Angular's animations go through the
 * Web Animations API — a CSS-only probe would miss them entirely, which is the same blind spot
 * that makes a `prefers-reduced-motion` stylesheet block look like it covers them when it cannot.
 *
 * The navigation is driven by assigning `location.hash` rather than `page.goto`, because the app
 * uses hash routing: `goto` would be a document load and the router's `:enter`/`:leave`
 * transitions would never run.
 */
async function measureRouteChangeMotion(page: Page, toHash: string): Promise<MotionSample> {
  await page.evaluate(() => {
    const probe: NonNullable<Window['__motionProbe']> = { frames: [], seen: [] };
    window.__motionProbe = probe;

    const describe = (el: Element | null): string => {
      if (!el) return '(no target)';
      const id = el.id ? `#${el.id}` : '';
      const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0];
      return `${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}`;
    };

    const sample = () => {
      const running = document.getAnimations();
      probe.frames.push(running.length);
      for (const a of running) {
        const t = a.effect?.getTiming();
        const d = typeof t?.duration === 'number' ? t.duration : 0;
        // `instanceof KeyframeEffect` rather than casting: `target` lives on KeyframeEffect,
        // not on the AnimationEffect base, so this is a real narrowing and an effect that is
        // some other subtype is reported as "(no target)" instead of reading as undefined.
        const effect = a.effect;
        const target = describe(effect instanceof KeyframeEffect ? effect.target : null);
        const iterations = String(t?.iterations ?? 1);
        // `CSSAnimation`/`CSSTransition` vs a bare `Animation` is exactly the distinction that
        // separates a CSS-driven effect from an Angular/WAAPI one, and it is what tells us
        // whether a CSS media query could ever have reached it.
        const kind = a.constructor?.name ?? 'Animation';
        const key = `${target}|${d}|${kind}`;
        if (!probe.seen.some((s) => `${s.target}|${s.durationMs}|${s.kind}` === key)) {
          probe.seen.push({ target, durationMs: Math.round(d), iterations, kind });
        }
      }
      probe.raf = requestAnimationFrame(sample);
    };
    probe.raf = requestAnimationFrame(sample);
  });

  await page.evaluate((h) => {
    location.hash = h;
  }, toHash);
  // Long enough to contain the longest declared transition (320ms) with headroom.
  await page.waitForTimeout(900);

  return page.evaluate(() => {
    const probe = window.__motionProbe;
    if (probe?.raf) cancelAnimationFrame(probe.raf);
    const frames = probe?.frames ?? [];
    const seen = probe?.seen ?? [];
    return {
      peakConcurrent: frames.reduce((m, n) => Math.max(m, n), 0),
      longestMs: seen.reduce((m, s) => Math.max(m, s.durationMs), 0),
      totalObserved: frames.reduce((n, f) => n + f, 0),
      animations: seen,
    };
  });
}

// ───────────────────────────── dark theme ─────────────────────────────

test.describe('accessibility: dark theme', () => {
  test.beforeEach(async ({ signedIn: page }) => {
    // Seeded before any navigation so `AppThemeService` reads it during app init, rather than
    // being flipped afterwards and re-scanning a page mid-transition.
    await page.addInitScript(({ key }) => localStorage.setItem(key, 'dark'), {
      key: THEME_STORAGE_KEY,
    });
  });

  for (const [label, route, host] of ROUTES) {
    test(`scans ${label} in dark theme`, async ({ signedIn: page, a11y }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator(host), `${host} must render`).toBeVisible();

      // Two assertions, because either alone is satisfiable while dark mode is not actually on:
      // the attribute can be set by something that failed to load a palette, and a dark
      // background can occur in the default theme. Together they mean the palette applied.
      await expect(
        page.locator('html'),
        'the dark palette must be selected, or this scan is a light-theme scan with a dark label',
      ).toHaveAttribute('data-app-theme', 'dark');
      const lum = await backgroundLuminance(page);
      expect(lum, `body background luminance ${lum.toFixed(3)} is not dark`).toBeLessThan(0.2);

      const { findings } = await a11y.scanPage({
        level: 'AA',
        failOnBlockers: false,
        noFocusIndicatorScreenshots: true,
        // Off deliberately. Dark theme changes colour, not focus order or trap behaviour, and
        // `surfaces.a11y.spec.ts` already walks these routes. NOTE: this also disables the
        // reflow scanner, which rides the same flag in `scan-page.ts`; reflow is covered
        // separately by `scripts/a11y-reflow-probe.mjs`.
        keyboard: false,
        extraWaitMs: 400,
      });
      results.push({
        mode: 'dark',
        route: label,
        findings: findings.length,
        blockers: findings.filter((f) => f.severity === 'blocker').length,
        rules: [...new Set(findings.map((f) => f.ruleId))].sort(),
      });
    });
  }
});

// ─────────────────────── forced colors (high contrast) ───────────────────────

test.describe('accessibility: forced colors', () => {
  test.use({ forcedColors: 'active' });

  for (const [label, route, host] of ROUTES) {
    test(`scans ${label} in forced-colors mode`, async ({ signedIn: page, a11y }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator(host), `${host} must render`).toBeVisible();

      // Prove the emulation reached the page. Without this the whole describe could silently
      // run in normal colours and report a clean high-contrast pass.
      const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
      expect(active, 'forced-colors emulation did not reach the page').toBe(true);

      const { findings } = await a11y.scanPage({
        level: 'AA',
        failOnBlockers: false,
        noFocusIndicatorScreenshots: true,
        keyboard: false,
        extraWaitMs: 400,
      });
      results.push({
        mode: 'forced-colors',
        route: label,
        findings: findings.length,
        blockers: findings.filter((f) => f.severity === 'blocker').length,
        rules: [...new Set(findings.map((f) => f.ruleId))].sort(),
      });
    });
  }
});

// ───────────────────────────── reduced motion ─────────────────────────────

/**
 * The experiment, not a scan: does the application actually stop animating when asked to?
 *
 * Two runs of one measurement. The control establishes that the probe can see this application's
 * animations at all; the reduced run is only interpretable against it.
 */
test.describe('accessibility: motion', () => {
  test.describe('control — no motion preference', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('route change animates normally', async ({ signedIn: page }) => {
      await page.goto('/#/browse', { waitUntil: 'networkidle' });
      await expect(page.locator('lib-browse')).toBeVisible();
      const sample = await measureRouteChangeMotion(page, '#/search');
      motion.push({ label: 'no-preference', sample });

      // If this is zero the probe is broken and the reduced-motion number below means nothing.
      expect(
        sample.peakConcurrent,
        'the control observed no animations at all — the probe cannot see this app, so the ' +
          'reduced-motion result is not interpretable',
      ).toBeGreaterThan(0);
    });
  });

  test.describe('with prefers-reduced-motion: reduce', () => {
    test.use({ reducedMotion: 'reduce' });

    test('route change respects the preference', async ({ signedIn: page }) => {
      await page.goto('/#/browse', { waitUntil: 'networkidle' });
      await expect(page.locator('lib-browse')).toBeVisible();

      const honoured = await page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
      expect(honoured, 'reduced-motion emulation did not reach the page').toBe(true);

      const sample = await measureRouteChangeMotion(page, '#/search');
      motion.push({ label: 'reduce', sample });
    });
  });
});

// ───────────────────────────── report ─────────────────────────────

test.describe('accessibility: display modes report', () => {
  test('emits the consolidated report', async ({ a11y }) => {
    const { state, reportPaths } = await a11y.generateReport({
      reportName: 'nuxeo-satori-display-modes',
      failOnBlockers: false,
    });

    const byMode = new Map<string, ModeResult[]>();
    for (const r of results) byMode.set(r.mode, [...(byMode.get(r.mode) ?? []), r]);

    const lines: string[] = ['', '  findings by display mode', ''];
    for (const [mode, rows] of byMode) {
      const total = rows.reduce((n, r) => n + r.findings, 0);
      const blockers = rows.reduce((n, r) => n + r.blockers, 0);
      lines.push(
        `  ${mode}  —  ${total} findings, ${blockers} blockers across ${rows.length} routes`,
      );
      for (const r of rows) {
        lines.push(
          `    ${r.route.padEnd(22)} ${String(r.findings).padStart(3)}  ${r.rules.join(', ') || '—'}`,
        );
      }
      lines.push('');
    }

    lines.push('  motion — animations observed during one route change');
    // Looping animations are ambient furniture — indeterminate spinners, skeleton shimmer — and
    // they run whether or not a route changed. Counting them as evidence of a route transition
    // is how a probe ends up reporting a confident verdict about something it never measured.
    const isAmbient = (a: ObservedAnimation) =>
      a.iterations === 'Infinity' || Number(a.iterations) > 1;
    for (const m of motion) {
      const transitions = m.sample.animations.filter((a) => !isAmbient(a));
      const ambient = m.sample.animations.filter(isAmbient);
      lines.push(
        `    ${m.label}  —  peak concurrent ${m.sample.peakConcurrent}, ` +
          `${transitions.length} finite, ${ambient.length} looping`,
      );
      for (const a of m.sample.animations) {
        lines.push(
          `      ${isAmbient(a) ? 'loop  ' : 'finite'} ${String(a.durationMs).padStart(5)}ms  ` +
            `${a.kind.padEnd(13)} ${a.target}`,
        );
      }
    }
    const control = motion.find((m) => m.label === 'no-preference')?.sample;
    const reduced = motion.find((m) => m.label === 'reduce')?.sample;
    if (control && reduced) {
      const controlT = control.animations.filter((a) => !isAmbient(a));
      const reducedT = reduced.animations.filter((a) => !isAmbient(a));
      lines.push('');
      if (controlT.length === 0) {
        lines.push(
          '    INCONCLUSIVE: the control observed no finite animation during the route change,',
          '    so this probe did not capture a route transition at all and the reduced-motion',
          '    number below says nothing. Only looping/ambient animations were seen.',
        );
      } else if (reducedT.length === 0) {
        lines.push(
          `    VERDICT: reduced motion IS honoured — ${controlT.length} finite animation(s) with`,
          '    no preference, none under prefers-reduced-motion: reduce.',
        );
      } else {
        lines.push(
          `    VERDICT: reduced motion is NOT honoured — ${reducedT.length} finite animation(s)`,
          `    still ran under the preference (longest ${Math.max(...reducedT.map((a) => a.durationMs))}ms),`,
          `    against ${controlT.length} with no preference.`,
        );
      }
    }
    lines.push(
      '',
      `  total findings : ${state.findings.length}`,
      `  report         : ${reportPaths.html}`,
      '',
    );

    // eslint-disable-next-line no-console
    console.log(lines.join('\n'));

    // Assert the deliverable: both colour modes covered every route, and both motion runs
    // recorded. A mode that silently skipped would otherwise read as a clean mode.
    expect(
      results.filter((r) => r.mode === 'dark').length,
      'dark theme must cover every route',
    ).toBe(ROUTES.length);
    expect(
      results.filter((r) => r.mode === 'forced-colors').length,
      'forced-colors must cover every route',
    ).toBe(ROUTES.length);
    expect(motion.length, 'both motion runs must have recorded').toBe(2);
  });
});
