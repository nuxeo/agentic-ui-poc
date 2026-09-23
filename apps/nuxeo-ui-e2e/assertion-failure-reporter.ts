import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestStep,
} from '@playwright/test/reporter';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

/**
 * Records, for every spec that failed, whether a **real assertion** was what failed.
 *
 * ## Why this exists
 *
 * `scripts/e2e-negative-control.sh` runs the suite with a deliberately wrong password and
 * asserts that at least N specs fail *at their own assertions* — the point being that a spec
 * which only dies in a fixture would have failed identically with an empty body, so it proves
 * nothing about what it checks.
 *
 * It classified those failures by the filename in the error location: a failure located in a
 * `*.spec.ts` file counted, anything else did not. Review was right that this does not hold.
 * A `page.goto()` timeout or a rejected `waitForResponse()` is thrown from a line the spec
 * wrote, so its error location IS a `.spec.ts` file, and it counted toward the threshold with
 * no `expect` having run at all. A run where the wrong password broke navigation everywhere
 * could therefore satisfy a control whose entire purpose is to prove the specs read
 * repository data.
 *
 * Measured rather than argued, on Playwright 1.63 — three deliberate failures, one per shape:
 *
 *   failed at `expect(1 + 1).toBe(3)`            errorLocation probe.spec.ts:5   <- should count
 *   threw from a helper in another file          errorLocation helper.ts:2       <- should not
 *   rejected with "Timeout 45000ms exceeded"     errorLocation probe.spec.ts:15  <- should not
 *
 * The filename test cannot separate the first from the third. They differ by one thing only:
 * whether an assertion ran. `scripts/beta-harness/assertion-reporter.selftest.mjs` keeps
 * those three cases executable so this cannot regress unnoticed.
 *
 * ## Why a reporter, and why not the JSON report
 *
 * The obvious cheap fix is matching Playwright's error text, which is the same class of
 * fragility as the reporter-phrase grep the script was written to replace — trading one
 * string-matching dependency for another is not progress.
 *
 * Playwright already carries the fact first-class: every `expect()` produces a `TestStep`
 * with `category === 'expect'`, and a failing one carries an `error`. But its JSON reporter
 * does not serialize `steps` — `TestResult` in `results.json` has only
 * `error`/`errors`/`errorLocation` — so the data exists in process and nowhere on disk.
 * Hence a reporter of our own, writing the one fact the control needs.
 *
 * ## The rule
 *
 * A spec counts when its final attempt has a failing `expect` step that is **not** inside a
 * hook. The hook exclusion is the same conservatism the filename test was reaching for, done
 * on evidence: an `expect` that fails in `beforeEach` appears nested under
 * `Before Hooks -> beforeEach hook`, and the body never ran, so it says nothing about what the
 * body asserts.
 *
 * Unlike the filename test this is not a heuristic in either direction. It no longer excludes
 * a genuine repository-data assertion merely because it lives in `fixtures.ts`
 * (`expectSurfaceWithData()` was in exactly that position), and it no longer admits a
 * navigation timeout merely because it was thrown from a spec file.
 *
 * ## Module shape
 *
 * No `import.meta` anywhere: Playwright transpiles a `.ts` reporter and loads it through
 * `require`, so a file containing `import.meta` is treated as an ES module and dies on
 * `exports is not defined in ES module scope` before a single test runs. Paths therefore come
 * from `FullConfig` in `onBegin`, resolved against the config's own directory — the same
 * convention as the `json` reporter registered beside it, so both land in `dist/e2e/`
 * regardless of the working directory.
 */

/** Where the failing `expect` sat, if there was one. */
interface AssertionFailure {
  /** The `expect` step's title, e.g. `expect.toHaveText`. */
  assertion: string;
  /** `file:line` of the step, for the human-readable table the control prints. */
  where: string;
}

interface FailedSpec {
  title: string;
  /** Repo-relative path of the spec file. */
  file: string;
  line: number;
  project: string;
  /** The whole point: did an assertion of the spec's own fail? */
  failedAtAssertion: boolean;
  assertion: AssertionFailure | null;
  /** Where the run says the error happened, kept for diagnosis only — never for classifying. */
  errorLocation: string;
}

interface Report {
  generatedAt: string;
  totalSpecs: number;
  failedSpecs: number;
  atAssertion: number;
  beforeAssertion: number;
  specs: FailedSpec[];
}

/**
 * Failing `expect` steps that are not inside a hook, innermost first.
 *
 * `underHook` is inherited down the tree rather than tested per step, because the `expect`
 * itself is never the hook — it sits two levels under `Before Hooks -> beforeEach hook`.
 */
function failingAssertions(steps: readonly TestStep[], underHook = false): TestStep[] {
  return steps.flatMap((step) => {
    const inHook = underHook || step.category === 'hook';
    const nested = failingAssertions(step.steps ?? [], inHook);
    const self = step.category === 'expect' && step.error && !inHook ? [step] : [];
    return [...nested, ...self];
  });
}

export default class AssertionFailureReporter implements Reporter {
  private suite: Suite | undefined;
  private outputFile = '';
  private baseDir = process.cwd();
  private readonly requestedOutputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    this.requestedOutputFile = options.outputFile ?? '../../dist/e2e/assertion-failures.json';
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.suite = suite;
    this.baseDir = config.configFile ? dirname(config.configFile) : config.rootDir;
    this.outputFile = resolve(this.baseDir, this.requestedOutputFile);
  }

  onEnd(_result: FullResult): void {
    const all = this.suite?.allTests() ?? [];
    // `unexpected` means every attempt failed — the same population as `spec.ok === false`
    // in the JSON report. A spec that passed on retry is not a failure here either.
    const failed = all.filter((t) => t.outcome() === 'unexpected');
    const specs = failed.map((test) => this.describe(test));
    const report: Report = {
      generatedAt: new Date().toISOString(),
      totalSpecs: all.length,
      failedSpecs: specs.length,
      atAssertion: specs.filter((s) => s.failedAtAssertion).length,
      beforeAssertion: specs.filter((s) => !s.failedAtAssertion).length,
      specs,
    };
    mkdirSync(dirname(this.outputFile), { recursive: true });
    writeFileSync(this.outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  private describe(test: TestCase): FailedSpec {
    const last = test.results.at(-1);
    const assertions = failingAssertions(last?.steps ?? []);
    const first = assertions[0];
    const errorLocation = last?.errors?.[0]?.location ?? last?.error?.location ?? null;
    const show = (file: string, line: number) => `${relative(this.baseDir, file)}:${line}`;
    return {
      // `titlePath()` is [root, project, file, ...describes, title]. Slice by position and
      // filter afterwards, never the reverse: an unnamed project contributes a second empty
      // entry, so filtering first shifts everything left by one and silently drops the
      // outermost `describe` from the title.
      title: test.titlePath().slice(3).filter(Boolean).join(' > ') || test.title,
      file: relative(this.baseDir, test.location.file),
      line: test.location.line,
      project: test.parent.project()?.name ?? 'unknown',
      failedAtAssertion: first !== undefined,
      assertion: first
        ? {
            assertion: first.title,
            where: first.location ? show(first.location.file, first.location.line) : 'unknown',
          }
        : null,
      errorLocation: errorLocation ? show(errorLocation.file, errorLocation.line) : 'unknown',
    };
  }
}
