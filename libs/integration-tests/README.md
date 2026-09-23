# integration-tests

Integration specs that run against a **live Nuxeo**, not mocks.

## Running them

```bash
export NUXEO_USER=Administrator NUXEO_PASS=Administrator
ALLOW_DEFAULT_CREDENTIALS=true npm run beta:integration
```

`NUXEO_USER` and `NUXEO_PASS` are **required** and have no defaults. This library issues
`DELETE` and `Document.Trash` against whatever server it is pointed at, so a hardcoded
`Administrator` pair would be both a credential in the repository and a default that is
silently wrong on every instance but a local Docker one — and it would mean an _absent_
environment selected privileged access rather than refusing. `NUXEO_URL` selects the server
and defaults to `http://localhost:8080`.

`ALLOW_DEFAULT_CREDENTIALS` is the env var, not `-- --allow-default-credentials`: npm appends
extra arguments to the end of the script, and the script is a two-command chain, so the flag
would land on vitest. Drop it entirely if the credentials are not the Docker defaults.

The opt-in is read **only** from the environment or the preflight CLI's own flag. It used to
be a `setupIntegrationHarness({ allowDefaultCredentials: true })` option, which all six
suites set, so the guard never fired anywhere; the option no longer exists.

## Exit codes

| Code | Meaning                                                              |
| ---- | -------------------------------------------------------------------- |
| 0    | the suite ran and passed                                             |
| 1    | the suite ran and something failed — **the code is wrong**           |
| 2    | the suite never ran — **the environment is wrong**, fix it and retry |

Exit 2 comes from `src/preflight-cli.ts`, which runs before vitest and refuses an absent or
empty Nuxeo, or the default `Administrator` / `Administrator` credentials without the opt-in
above. It is the same convention as `scripts/beta-harness/e2e-preflight.mjs`.

It has to be a separate process. `setupIntegrationHarness` also checks the preconditions in
`beforeAll`, but vitest intercepts `process.exit` in the worker and converts it into a failing
test, so nothing inside a spec can produce anything but 1. That in-test check remains as the
backstop for anyone running vitest directly:

```bash
npm run beta:integration-preflight    # just the gate
```

## Two targets, and which specs each one runs

| target        | config                   | specs                   | needs Nuxeo |
| ------------- | ------------------------ | ----------------------- | ----------- |
| `integration` | `vitest.config.mts`      | `*.integration.spec.ts` | yes         |
| `test`        | `vitest.unit.config.mts` | `*.unit.spec.ts`        | no          |

The live specs are under `integration`, deliberately. `nx affected -t test` and
`nx run-many -t test` run on CI runners that have no Nuxeo, and every one of those specs would
fail there on a precondition. A name that no `-t test` invocation matches cannot be forgotten
the way an exclusion list can.

The `test` target does not weaken that, because the two `include` patterns are disjoint: a
file cannot be both `*.unit.spec.ts` and `*.integration.spec.ts`, so a live spec has to be
renamed before `-t test` can see it, and a rename shows up in a diff.

It runs the preflight's decision logic and the CLI's exit-code mapping with `fetch` stubbed.
Those two files decide whether the suite may run at all and with which code, and while
`integration` was the only target they were exercised by nothing on CI — the gate that guards
the suite had no gate. `integration-harness.ts` and `user-fixtures.ts` stay out of it on
purpose: they issue real `DELETE`s against a real repository, and mocking that would assert
the mock rather than the behaviour.

`nx run integration-tests:integration` runs the same two commands as `npm run beta:integration`,
but nx normalises a failed command to exit 1, so **exit 2 only survives
`npm run beta:integration`**.
