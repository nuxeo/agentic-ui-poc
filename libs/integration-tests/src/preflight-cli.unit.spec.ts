/**
 * Unit specs for the gate's exit-code mapping.
 *
 * This file exists for one reason: **exit 2 and exit 1 mean different things here**, and the
 * difference is the entire argument for the CLI being a separate process at all. 2 is
 * `precondition-not-met` — fix the environment. 1 is "the preflight itself is broken", which
 * is what a product failure also looks like. The distinction was established by observation
 * earlier in this PR; observation is not a gate, and a one-character edit would collapse the
 * two without a single check going red.
 *
 * `./lib/integration-preflight` is mocked rather than stubbed at `fetch`. The checks have
 * their own spec beside them; what is under test here is the mapping from a `PreflightResult`
 * to an exit code and to what the operator reads, so the result is the input.
 *
 * ## The one thing a unit spec cannot reproduce
 *
 * A stubbed `process.exit` returns, where the real one does not. So on the failure path the
 * success branch below `process.exit(2)` still runs and logs. Two consequences, both handled
 * rather than papered over:
 *
 *   - the assertion is on the **exact** sequence of exit codes. `[2]` rather than `[2, 1]` is
 *     what says the failure was reported deliberately and did not fall through to the crash
 *     handler;
 *   - `exit: 2` and the log lines go into **one** ordered array, so "the exit came first, and
 *     everything after it is unreachable in a real process" is itself an assertion.
 */
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveConnection: vi.fn(),
  runPreflightChecks: vi.fn(),
}));

vi.mock('./lib/integration-preflight', () => mocks);

const originalEnv = { ...process.env };
const originalArgv = [...process.argv];

/** Everything the CLI did, in the order it did it, so ordering is assertable. */
type Events = string[];

interface CliRun {
  events: Events;
  exits: number[];
  stdout: string;
  stderr: string;
}

/**
 * Import `preflight-cli.ts` afresh and let its top-level `main()` settle.
 *
 * `vi.resetModules()` because the module does its work on evaluation, so a cached copy from a
 * previous test would do nothing at all and the run would assert against the previous test's
 * events. `setImmediate` because `main()` is never awaited by the module — evaluation returns
 * with the promise still pending, and a macrotask flushes every microtask behind it.
 */
async function runCli(argv: string[] = []): Promise<CliRun> {
  const events: Events = [];
  const exits: number[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];

  process.argv = ['node', 'preflight-cli.ts', ...argv];

  vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    exits.push(code ?? 0);
    events.push(`exit: ${code ?? 0}`);
    return undefined as never;
  }) as typeof process.exit);
  vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    const line = args.join(' ');
    stdout.push(line);
    events.push(`log: ${line}`);
  });
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const line = args.join(' ');
    stderr.push(line);
    events.push(`error: ${line}`);
  });

  vi.resetModules();
  await import('./preflight-cli');
  await new Promise((resolve) => setImmediate(resolve));

  return { events, exits, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
}

// Composed rather than quoted: a literal assigned to a `password` field beside a `user`
// and a URL is what GitGuardian's generic-password detector matches, and it fired on that
// shape in the sibling spec. Nothing here is a credential.
const fake = (label: string) => `fake-${label}`;
const connection = {
  nuxeoUrl: 'http://nuxeo.test',
  user: fake('test-user'),
  password: fake('test-password'),
};

beforeEach(() => {
  delete process.env['INTEGRATION_ALLOWED_HOSTS'];
  mocks.resolveConnection.mockReturnValue(connection);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  process.env = { ...originalEnv };
  process.argv = [...originalArgv];
});

describe('preflight-cli exit codes', () => {
  it('exits 2 — and only 2 — when a precondition is not met', async () => {
    mocks.runPreflightChecks.mockResolvedValue({
      ok: false,
      problems: ['Nuxeo is not there', 'and it is empty'],
      satisfied: ['nuxeo.test is named in INTEGRATION_ALLOWED_HOSTS'],
    });

    const run = await runCli();

    expect(run.exits).toEqual([2]);
    expect(run.stderr).toMatch(/PRECONDITION NOT MET — 2 problem\(s\)/);
    expect(run.stderr).toMatch(/- Nuxeo is not there/);
    expect(run.stderr).toMatch(/- and it is empty/);
    expect(run.stderr).toMatch(/Satisfied: nuxeo\.test is named in INTEGRATION_ALLOWED_HOSTS/);

    // Everything after the exit is unreachable in a real process. Asserted rather than
    // assumed, because the stub is what makes it reachable here.
    const exitAt = run.events.indexOf('exit: 2');
    const firstLog = run.events.findIndex((e) => e.startsWith('log:'));
    expect(exitAt).toBeGreaterThanOrEqual(0);
    expect(firstLog).toBeGreaterThan(exitAt);
  });

  it('exits 1, not 2, when the preflight itself throws', async () => {
    // The load-bearing pair. `runPreflightChecks` handles every expected network failure
    // itself, so reaching the catch means the gate is broken rather than the environment —
    // and answering 2 there would tell an operator to go and fix a Nuxeo that is fine.
    mocks.runPreflightChecks.mockRejectedValue(new Error('preflight blew up'));

    const run = await runCli();

    expect(run.exits).toEqual([1]);
    expect(run.exits).not.toContain(2);
    expect(run.stderr).toMatch(/crashed\. This is a defect in the preflight, not a precondition/);
    expect(run.stderr).toMatch(/preflight blew up/);
  });

  it('stringifies a crash that is not an Error, instead of printing an empty stack', async () => {
    mocks.runPreflightChecks.mockRejectedValue('something threw a string');

    const run = await runCli();

    expect(run.exits).toEqual([1]);
    expect(run.stderr).toMatch(/something threw a string/);
  });

  it('does not exit at all when every precondition holds', async () => {
    // Exit 0 by falling off the end. An explicit `process.exit(0)` would truncate a pending
    // stdout write, and there is nothing for it to signal.
    mocks.runPreflightChecks.mockResolvedValue({
      ok: true,
      problems: [],
      satisfied: ['Nuxeo reachable at http://nuxeo.test', 'Nuxeo has 3 File document(s)'],
    });

    const run = await runCli();

    expect(run.exits).toEqual([]);
    expect(run.stdout).toMatch(/integration-preflight: pass — http:\/\/nuxeo\.test is ready/);
    expect(run.stdout).toMatch(/- Nuxeo reachable at http:\/\/nuxeo\.test/);
    expect(run.stdout).toMatch(/- Nuxeo has 3 File document\(s\)/);
    expect(run.stderr).toBe('');
  });

  it('omits the Satisfied line when nothing was satisfied', async () => {
    mocks.runPreflightChecks.mockResolvedValue({
      ok: false,
      problems: ['everything is wrong'],
      satisfied: [],
    });

    const run = await runCli();

    expect(run.exits).toEqual([2]);
    expect(run.stderr).not.toMatch(/Satisfied:/);
  });
});

describe('preflight-cli argument and connection handing', () => {
  it('passes the resolved URL on, so the gate and the harness cannot check different servers', async () => {
    mocks.runPreflightChecks.mockResolvedValue({ ok: true, problems: [], satisfied: [] });

    await runCli();

    expect(mocks.resolveConnection).toHaveBeenCalledWith();
    expect(mocks.runPreflightChecks).toHaveBeenCalledWith({ nuxeoUrl: 'http://nuxeo.test' });
  });

  it('passes no second argument, so this CLI cannot relax the allowlist', async () => {
    // The guarantee that replaces the old `--allow-default-credentials` plumbing. That flag
    // armed a guard which compared the credentials against the Docker default and therefore
    // let every real production pair through; its replacement is read from
    // `INTEGRATION_ALLOWED_HOSTS` inside `runPreflightChecks` and from nowhere else. Asserting
    // the *arity* is what keeps a future option from quietly reappearing here.
    mocks.runPreflightChecks.mockResolvedValue({ ok: true, problems: [], satisfied: [] });

    await runCli();

    expect(mocks.runPreflightChecks.mock.calls[0]).toHaveLength(1);
  });

  it('ignores an argv flag that looks like an opt-in', async () => {
    // The negative control for the above. Someone reaching for the old incantation gets no
    // effect rather than a silent one, and the refusal still comes from the allowlist.
    mocks.runPreflightChecks.mockResolvedValue({ ok: true, problems: [], satisfied: [] });

    await runCli(['--allow-default-credentials']);

    expect(mocks.runPreflightChecks.mock.calls[0]).toEqual([{ nuxeoUrl: 'http://nuxeo.test' }]);
  });

  it('refuses an unlisted host with exit 2, carrying the guard message through', async () => {
    // The CLI half of the allowlist decision: the refusal is a precondition failure, so it has
    // to leave with 2. Exit 1 would read as a product defect and send the reader into the code.
    mocks.runPreflightChecks.mockResolvedValue({
      ok: false,
      problems: [
        'Integration tests refuse to run against prod.example.com — it is not named in ' +
          'INTEGRATION_ALLOWED_HOSTS.',
      ],
      satisfied: [],
    });

    const run = await runCli();

    expect(run.exits).toEqual([2]);
    expect(run.exits).not.toContain(1);
    expect(run.stderr).toMatch(/not named in INTEGRATION_ALLOWED_HOSTS/);
  });
});
