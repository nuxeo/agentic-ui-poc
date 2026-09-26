# integration-tests

Integration specs that run against a **live Nuxeo**, not mocks.

## Running them

```bash
export NUXEO_USER=<your user> NUXEO_PASS=<your password>
export INTEGRATION_ALLOWED_HOSTS=localhost:8080
npm run beta:integration
```

`NUXEO_USER` and `NUXEO_PASS` are **required** and have no defaults. This library issues
`DELETE` and `Document.Trash` against whatever server it is pointed at, so a fallback pair
would be both a credential in the repository and a guess that is silently wrong on every
instance but one — and it would mean an _absent_ environment selected privileged access rather
than refusing. `NUXEO_URL` selects the server and defaults to `http://localhost:8080`.

### `INTEGRATION_ALLOWED_HOSTS` — the host allowlist

**The suite refuses to run against any host not named here.** It creates and deletes documents
and users, so the question that decides whether a run is safe is _which server_, and this is
where you answer it.

| Property                        | Behaviour                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Unset or blank                  | **Nothing is permitted.** There is no implicit allowlist and no fallback.            |
| `localhost`                     | Not special-cased. Named like any other host or refused like any other host.         |
| `localhost,ci.internal`         | Comma-separated; spaces around the commas are trimmed; matching is case-insensitive. |
| `localhost`                     | No port, so any port on that hostname.                                               |
| `localhost:8080`                | Carries a port, so that host **and** port exactly.                                   |
| `evil-localhost` vs `localhost` | Whole-host equality, never a substring. A suffix match would admit both.             |

Refusal is a **precondition failure, exit 2** — the environment is wrong, not the code — and the
message names the host it refused and the exact `export` that would permit it.

This replaced a guard that compared the credentials against `Administrator`/`Administrator` and
refused that pair without an `ALLOW_DEFAULT_CREDENTIALS` opt-in. That control could not do what
its own message claimed: production credentials are by definition not the Docker default, so
every real production pair took the other branch, was recorded as _satisfied_, and the suite
proceeded to delete against whatever `NUXEO_URL` named. `ALLOW_DEFAULT_CREDENTIALS`, the
`--allow-default-credentials` flag and the `setupIntegrationHarness({ allowDefaultCredentials })`
option are all **gone**; the allowlist is read from the environment and from nowhere else, so no
spec and no CLI invocation can relax it on the caller's behalf.

`localhost` deliberately gets no exemption. The old guard's flaw was treating one value as
inherently safe, and `localhost` is an alias for whatever a tunnel or an `/etc/hosts` line says
it is.

## Exit codes

| Code | Meaning                                                              |
| ---- | -------------------------------------------------------------------- |
| 0    | the suite ran and passed                                             |
| 1    | the suite ran and something failed — **the code is wrong**           |
| 2    | the suite never ran — **the environment is wrong**, fix it and retry |

Exit 2 comes from `src/preflight-cli.ts`, which runs before vitest and refuses an absent or
empty Nuxeo, an unusable `NUXEO_URL`, or a target host not named in
`INTEGRATION_ALLOWED_HOSTS`. It is the same convention as
`scripts/beta-harness/e2e-preflight.mjs`.

The two codes are kept distinguishable on purpose, and it is checked rather than assumed —
refusing an unlisted host exits 2 while a genuine assertion failure in the suite exits 1.

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
