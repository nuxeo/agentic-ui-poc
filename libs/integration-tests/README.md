# integration-tests

Integration specs that run against a **live Nuxeo**, not mocks.

## Running them

```bash
npm run beta:integration
```

That is `nx run integration-tests:integration`. The target is deliberately **not** called
`test`: `nx affected -t test` and `nx run-many -t test` run on CI runners that have no Nuxeo,
and every spec here would fail there on a precondition. A name no `-t test` invocation matches
cannot be forgotten the way an exclusion list can.
