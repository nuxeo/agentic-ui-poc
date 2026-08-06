# ADR 001 — Agent runtime: host, transport, identity and deployment

|            |                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Status     | Accepted                                                                                            |
| Date       | 2026-08-06                                                                                          |
| Deciders   | Nuxeo Satori Agentic Beta — Phase 0                                                                 |
| Supersedes | The open decision in the Satori Agentic Beta plan, track A2 ("where the agent runtime lives")       |
| Blocks     | A2 gateway app, A3 tool layer, A4 `libs/shared/agent-client`, A5 chat surface, A9 capability gating |

This document is **normative for Phase 1**. The gateway team and the Angular client team
build against it in parallel, so every wire-level statement here is meant to be
implementable without a further conversation. Where a statement is marked MUST, a
deviation is a bug in the implementation, not a matter of taste.

Everything asserted about the AG-UI SDK below was verified first-hand against
`@ag-ui/*` `0.0.57` in `spikes/ag-ui-sse/` on 2026-08-06, not taken from documentation.

---

## Context

Today's AI features are single-shot RPC. The Angular app posts to Nuxeo Automation
operations (`AI.Chat`, `AI.Summarize`, `AI.Classify`, …) served by the standalone
[nuxeo-ai-package](https://github.com/nuxeo/nuxeo-ai-package) Java bundle, via
`libs/shared/ai-client/src/lib/ai-gateway.service.ts`. That path cannot stream tokens,
cannot run a multi-step tool loop, cannot pause for human approval, and holds no durable
conversation. Chat history is an in-memory signal wiped on reload.

The Beta needs a real agent runtime speaking [AG-UI](https://github.com/ag-ui-protocol/ag-ui),
and the first question is where it runs. The team's recent precedent points one way — AI
capability was deliberately moved _out_ of this monorepo into a Java marketplace bundle —
while the SDK maturity points the other. This ADR resolves that tension and then pins down
the contract tightly enough that two teams can build the two halves independently.

### How this application is actually deployed

This matters more than it first appears, so it is stated up front as fact rather than
assumption. `nuxeo-agentic-core` is an OSGi/Nuxeo bundle, not a Spring Boot application:
it ships a `META-INF/MANIFEST.MF` with `Bundle-SymbolicName: org.nuxeo.agentic.core` and
contributes `OSGI-INF/*` components. Its deployment fragment maps Nuxeo's authentication
filter over the SPA path:

```xml
<extension target="web#WEB-INF/web.xml">
  <filter-mapping>
    <filter-name>NuxeoAuthenticationFilter</filter-name>
    <url-pattern>/agentic-ui/*</url-pattern>
  </filter-mapping>
</extension>
```

So in production the Angular app is served from the Nuxeo WAR at `/agentic-ui/*`, on the
same origin as `/nuxeo/*`, behind Nuxeo's own authentication filter. The agent runtime has
to join that origin. It cannot sit on a different host and port and expect the browser to
keep behaving.

---

## Decision

### The runtime lives in this repo as `apps/agent-gateway`, an Nx Node application

A standalone TypeScript service, built and versioned with the UI it serves, reverse-proxied
onto the Nuxeo origin at `/agent/*`. The existing Automation path stays as a graceful
fallback for deployments where the gateway is absent.

The four reasons, in the order they mattered:

**The Java AG-UI SDK cannot be used inside a Nuxeo bundle without writing the server half
ourselves.** The community Java SDK ([`Work-m8/ag-ui-4j`](https://github.com/Work-m8/ag-ui-4j))
splits into `java-core` (event types) and a server story that is _Spring Boot only_ —
`AgUiService` returning a Spring `SseEmitter`, wired by Spring Boot autoconfiguration.
Nuxeo is OSGi on Tomcat with JAX-RS/WebEngine. None of that autoconfiguration applies.
Choosing Java therefore does not mean "use the Java SDK"; it means using `java-core`'s
event POJOs and hand-writing SSE emission, backpressure, cancellation, chunk-to-message
normalisation and protocol-version tracking against Nuxeo's servlet stack. That is the
expensive, bug-prone half of the protocol, and it is precisely the half the TypeScript SDK
gives away.

**The maturity gap between the two SDKs is large and measurable, not a matter of taste.**
Checked on 2026-08-06:

|                     | TypeScript                                       | Java                                                           |
| ------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Package             | `@ag-ui/client`, `@ag-ui/core`, `@ag-ui/encoder` | `com.ag-ui:java-core`, `:spring`                               |
| Version             | `0.0.57`                                         | `0.0.1`                                                        |
| Ownership           | First-party, `ag-ui-protocol` org                | Community, single maintainer, MIT                              |
| Last release        | 2026-07-31                                       | Repo last pushed 2025-12-15                                    |
| Distribution        | npm, ~996k downloads/week                        | **Not resolvable from Maven Central** (`g:com.ag-ui` → 0 hits) |
| Server-side support | Encoder + full event schema                      | Spring Boot only                                               |

An artifact we cannot resolve from Maven Central is not a dependency we can put in a
customer-shipped marketplace package. That alone is close to disqualifying.

**The client half is TypeScript regardless.** `libs/shared/agent-client` wraps
`@ag-ui/client`'s `HttpAgent` whichever host wins. Choosing Java means maintaining two
independent implementations of one fast-moving pre-1.0 protocol, in two languages, and
keeping them in lockstep through every breaking change. Choosing TypeScript means one
`@ag-ui/*` version number governs both ends.

**Team skills and iteration speed.** This repo is Angular and TypeScript; the agent loop,
the tool layer and the chat UI will be iterated on together and frequently during Beta.
A shared language and a shared `nx affected` graph makes that a single change set with a
single test run.

### The cost we are accepting, stated plainly

A third deployment artifact for self-hosted customers, and a reverse-proxy configuration
they must get right. This is the top risk in the plan and choosing Node does not make it
go away — it makes it our responsibility. It is paid for in the deployment section below
and by making the Automation fallback a first-class, tested path rather than a promise.

---

## Alternatives considered and rejected

### Extend `nuxeo-ai-package` with an AG-UI endpoint (Java)

Genuinely the strongest alternative, and it wins on the single dimension that matters most
to OnPrem customers: **zero new artifacts**. It reuses the marketplace install the customer
already performs, inherits `NuxeoAuthenticationFilter` so the identity problem solves
itself, needs no reverse-proxy documentation, and is consistent with the team's own recent
decision to move AI capability into that bundle. If the Java SDK were mature and on Maven
Central, this ADR would very likely have gone the other way, and if the SDK situation
changes materially before Track B closes, this is the option to revisit.

Rejected because the Java SDK's only server implementation targets Spring Boot, which
Nuxeo is not; because `com.ag-ui` artifacts are not on Maven Central and so cannot be
declared as dependencies of a shipped package; and because it forces two divergent
implementations of a pre-1.0 protocol. The deployment advantage is real but it is a
one-time integration cost, whereas the protocol-drift cost recurs on every AG-UI release
for the life of the product.

A secondary problem: a long-lived SSE connection per active chat occupies a Tomcat request
thread for the duration of the run. Nuxeo's connector pool is sized for short REST calls.
Multi-minute agent runs would need separate tuning and would compete with ordinary document
traffic for threads. A Node process on an event loop absorbs idle streams far more cheaply.

### A TypeScript service in its own repository

Same runtime advantages as the chosen option, and cleaner if the gateway ever serves more
than this UI. Rejected for Beta because it splits one feature across two repos and two CI
pipelines while the protocol and the tool layer are still churning weekly, and because
`nx affected` can no longer see that a change to `libs/shared/agent-client` should retest
the gateway. Extracting later is a directory move plus a pipeline; doing it now taxes every
change in between.

### WebSocket instead of SSE

Rejected. AG-UI's default transport is SSE, `HttpAgent` speaks it out of the box, and the
event flow is overwhelmingly server-to-client. SSE also traverses corporate proxies and
Nuxeo's existing filter chain as an ordinary HTTP response, which WebSocket upgrade does
not reliably do. Client-to-server messages during a run are carried by frontend-defined
tool results on the next `POST /agent/run`, not by a duplex channel.

---

## Transport and wire contract

Everything in this section is normative. Field names and shapes were read from the
`0.0.57` zod schemas, not from prose documentation.

### Endpoints

| Method | Path                  | Auth           | Purpose                                    |
| ------ | --------------------- | -------------- | ------------------------------------------ |
| `GET`  | `/agent/capabilities` | None           | Capability probe for the fallback decision |
| `POST` | `/agent/run`          | Caller session | Run the agent, stream AG-UI events         |
| `GET`  | `/agent/health`       | None           | Liveness for the container orchestrator    |

All three MUST be served on the **same origin** as the Angular app and Nuxeo. See the
deployment section — this is a security requirement, not a convenience.

### `POST /agent/run` request

`Content-Type: application/json`, `Accept: text/event-stream`. The body is an AG-UI
`RunAgentInput`:

| Field            | Type            | Required | Notes                                                           |
| ---------------- | --------------- | -------- | --------------------------------------------------------------- |
| `threadId`       | `string`        | yes      | Stable across turns; keys thread persistence                    |
| `runId`          | `string`        | yes      | Unique per run                                                  |
| `parentRunId`    | `string`        | no       |                                                                 |
| `messages`       | `Message[]`     | yes      | Full conversation so far; discriminated on `role`               |
| `tools`          | `Tool[]`        | yes      | Frontend-defined tools; may be `[]` but MUST be present         |
| `context`        | `Context[]`     | yes      | `{ description, value }` pairs; may be `[]` but MUST be present |
| `state`          | `any`           | no       | Shared state the client currently holds                         |
| `forwardedProps` | `any`           | no       |                                                                 |
| `resume`         | `ResumeEntry[]` | no       | Responses to interrupts opened by a previous run                |

`tools` and `context` are **required arrays** in the schema. The gateway MUST reject a body
that omits them with `400`, and the client MUST always send them. `HttpAgent` does this
correctly by default; hand-rolled callers frequently do not.

A `Tool` is `{ name, description, parameters?, metadata? }`. Note `description` is
required. A `Context` entry is `{ description, value }`, both required strings.

### Response framing

On success: `200` with these headers.

```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

`no-transform` and `X-Accel-Buffering: no` are not optional. Without them an intermediate
proxy may buffer the whole response, which turns streaming back into the request/response
behaviour we are replacing — and it will look like it works, because the content is still
correct, just delivered all at once at the end.

Each event is one SSE frame: `data: <json>\n\n`. Use `EventEncoder` from `@ag-ui/encoder`
rather than building frames by hand; it also negotiates the protobuf encoding when the
client's `Accept` header asks for it.

Headers MUST be flushed before the agent loop starts, so the client sees `200` immediately
rather than after the first model token.

### Event sequence

The canonical successful run:

```
RUN_STARTED
  ( TEXT_MESSAGE_CHUNK | TOOL_CALL_CHUNK | TOOL_CALL_RESULT | STATE_DELTA | CUSTOM )*
RUN_FINISHED
```

A failed run ends in `RUN_ERROR` instead of `RUN_FINISHED`. Exactly one terminal event is
emitted per run.

| Event                | Fields                                                       | Notes                                           |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `RUN_STARTED`        | `threadId`, `runId` (both required)                          | MUST be the first frame                         |
| `TEXT_MESSAGE_CHUNK` | `messageId?`, `role?`, `delta?`, `name?`                     | Assistant token stream                          |
| `TOOL_CALL_CHUNK`    | `toolCallId?`, `toolCallName?`, `parentMessageId?`, `delta?` | `delta` carries partial JSON arguments          |
| `TOOL_CALL_RESULT`   | `messageId`, `toolCallId`, `content` (all required), `role?` | `content` is a string; JSON must be stringified |
| `STATE_DELTA`        | `delta` (required)                                           | RFC 6902 JSON Patch array                       |
| `RUN_FINISHED`       | `threadId`, `runId` (required), `result?`, `outcome?`        |                                                 |
| `RUN_ERROR`          | `message` (required), `code?`                                | Terminal; the stream then ends                  |

Every event also accepts optional `timestamp` (epoch ms) and `rawEvent`. The gateway SHOULD
set `timestamp` — it is what makes latency debuggable in the field.

### Rules the SDK enforces, which the gateway MUST obey

These are hard failures inside `@ag-ui/client`'s `transformChunks`, verified by reading the
0.0.57 implementation. Violating one throws in the browser, mid-run:

1. The first `TEXT_MESSAGE_CHUNK` of a message MUST carry a `messageId`.
2. The first `TOOL_CALL_CHUNK` of a call MUST carry **both** `toolCallId` and `toolCallName`.
   Subsequent chunks of the same call carry only `delta`.
3. Interleaving closes the open block. Emitting a `TOOL_CALL_CHUNK` while a text message is
   open implicitly ends that text message.

Consequence of rule 3, observed in the spike and easy to get wrong: if the agent emits text,
then a tool call, then more text **reusing the same `messageId`**, the SDK produces _two_
separate assistant messages. Phase 1 MUST allocate a fresh `messageId` for each text segment
that follows a tool call, unless two bubbles in the transcript is genuinely the intent.

`STATE_DELTA.delta` is applied with `fast-json-patch` in validating mode. A malformed patch
is dropped silently, so shared state simply fails to update with no error anywhere. Prefer
whole-value `add`/`replace` operations on top-level keys over deep array-index surgery.

### Cancellation

The client calls `HttpAgent.abortRun()`, which aborts the underlying `fetch`. The gateway
MUST listen for `request.on('close')`, stop the model call and any in-flight tool work, and
release the Nuxeo connection. An aborted run emits no terminal event — the socket simply
closes, and the SDK treats `AbortError` as a normal cancellation rather than a failure.

### Errors

| Condition                        | Response                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Caller not authenticated         | `401` JSON, before the stream opens                                              |
| Body fails `RunAgentInputSchema` | `400` JSON with the zod issues, before the stream opens                          |
| Failure after the stream opened  | `200` stream carrying `RUN_ERROR`, then close — never a mid-stream status change |

Once the first byte of the stream is written the status code is fixed, so all subsequent
failures MUST be reported in-band as `RUN_ERROR`.

`RUN_ERROR.message` is rendered to the user. It MUST NOT contain stack traces, NXQL, internal
hostnames, or upstream provider payloads. Log the detail server-side against the `runId` and
send the user a clean sentence plus a `code`.

### `GET /agent/capabilities`

Unauthenticated by design: the frontend has to decide whether an agent runtime exists before
it knows who the user is, and a `401` here would be indistinguishable from "not deployed".
It returns no user data and no configuration secrets.

```json
{
  "agentRuntime": true,
  "protocol": "ag-ui",
  "protocolVersion": "0.0.57",
  "transports": ["sse"],
  "endpoints": { "run": "/agent/run" },
  "features": {
    "streaming": true,
    "toolCalls": true,
    "humanInTheLoop": true,
    "sharedState": true,
    "threadPersistence": true,
    "cancel": true
  }
}
```

Client-side rules for `AiFeatureFlagService` (plan item A9):

- Probe once during app bootstrap with a **2 second timeout**.
- Treat any of these as "no agent runtime": network error, timeout, non-`200`, unparseable
  body, or `agentRuntime !== true`.
- Cache the outcome for the browser session. Do not re-probe per chat open — a slow probe
  on every interaction is worse than a stale answer.
- Never cache the outcome in `localStorage`. A customer who installs the gateway must not
  have to clear browser storage to see it.
- The result is a separate signal from the existing `aiEnabled()` opt-out. Both must be true
  to use the agent path. `aiEnabled()` false means the user opted out of AI entirely;
  `agentRuntime` false means fall back to the Automation path, which is still AI.
- Individual `features` flags gate UI affordances only. The chat surface MUST render and
  function with every optional feature false.

---

## Identity propagation

**The gateway holds no credentials of its own.** This is the single most important property
of the design. An agent that queried Nuxeo with a service account would return documents the
user is not allowed to see, and would do it silently, with no error and no audit signal.
Every rule below exists to make that failure impossible rather than unlikely.

### Rules

1. The gateway MUST NOT define `NUXEO_AUTH`, a username, a password, a shared token, or any
   other Nuxeo credential in its environment, config, or code. There is nothing to leak and
   nothing to misconfigure. Per `AGENTS/07-security.md` there are also no fallback defaults —
   but here the stronger statement holds: the variable must not exist at all.
2. On every `POST /agent/run`, before any model or tool call, the gateway MUST validate the
   caller by issuing `GET /nuxeo/api/v1/me`, forwarding only the credential-bearing headers
   the caller already sent: `Cookie`, `Authorization`, `X-Authentication-Token`.
3. A non-`200` from `/me` MUST produce `401` from `/agent/run`. The gateway never decides who
   the caller is; Nuxeo does.
4. Every downstream Nuxeo call made by the tool layer during that run MUST carry the same
   forwarded headers, so Nuxeo applies the caller's ACLs to every read and write.
5. The resolved principal MUST NOT be cached across runs. A run is short; a permission change
   or logout between runs must take effect on the next one.
6. Headers are forwarded by allow-list, never by copying the whole inbound header set. Copying
   everything leaks `Host`, `Origin`, `Referer` and any client-supplied `X-NX*` headers into
   Nuxeo.
7. The caller MUST NOT be able to influence which Nuxeo instance is called. The Nuxeo base URL
   comes from server configuration only.

### Why same-origin is a hard requirement

`HttpAgent.requestInit()` in `0.0.57` is, verbatim:

```js
{ method: 'POST', headers: { ...this.headers, 'Content-Type': 'application/json',
  Accept: 'text/event-stream' }, body: JSON.stringify(input), signal: this.abortController.signal }
```

There is **no `credentials` option**, so `fetch` uses its default of `same-origin`. If the
gateway is served from a different origin than the SPA, the browser silently omits the Nuxeo
session cookie, `/me` returns `401`, and the agent stops working — or worse, if someone
"fixes" it by relaxing the check, it starts working as nobody. Same-origin is what makes the
whole identity model function. Do not attempt to solve this with CORS and
`credentials: 'include'`: it would require `Access-Control-Allow-Credentials` with a
non-wildcard origin, weaken the cookie's `SameSite` protection, and reintroduce CSRF surface
on an endpoint that mutates documents.

### Development mode

In development the Angular app runs on `:4200` and `NuxeoAuthInterceptor` injects
`Authorization: Basic …` into `HttpClient` requests to `/nuxeo/*`. `HttpAgent` uses `fetch`
directly and therefore **bypasses Angular's interceptor chain entirely** — a real trap,
because it works in production and fails only locally.

`libs/shared/agent-client` MUST therefore supply the dev credential explicitly through
`HttpAgentConfig`, which accepts both a `headers` record and a `fetch` override. Wire it from
the same `environment.ts` value the interceptor already uses, and only when
`environment.production` is false. Extend `apps/nuxeo-ui/proxy.conf.json` with an `/agent`
entry pointing at the local gateway so the browser still sees one origin in dev.

This is not a violation of the `AGENTS/07-security.md` rule against `fetch()` for Nuxeo URLs:
`HttpAgent` calls `/agent/run`, which is our gateway, not `/nuxeo/*`. No component may call
`/nuxeo/*` with `fetch()`, and that rule is unchanged.

---

## Thread persistence

Threads are stored as Nuxeo documents in the calling user's workspace. No new datastore is
introduced, and the gateway stays stateless — which is what allows it to be scaled or
restarted without a session-affinity story.

- Written through the same forwarded caller identity as every other Nuxeo call, so a thread
  is owned and ACL-protected by its author with no extra permission model.
- Keyed by `threadId`. `POST /agent/run` loads prior messages when the client sends a known
  `threadId`, appends the new turn, and saves before emitting `RUN_FINISHED`.
- Persistence failure MUST NOT fail the run. Emit the completed answer, log the failure, and
  degrade to an in-memory thread for that session. Losing history is an annoyance; losing the
  answer the user waited thirty seconds for is not.
- Sharing reuses the existing permissions dialog (plan A6), which follows for free from
  threads being ordinary documents.
- The exact document type, schema and workspace path are Phase 2 detail and are deliberately
  not fixed here. This ADR fixes only that threads are Nuxeo documents written as the caller.

This also gives the KD feedback bug (plan A6) somewhere real to write to;
`submitFeedback()` currently mutates a local `Map` and returns `of(undefined)`.

---

## Deployment

### Cloud

The gateway runs as a container alongside Nuxeo. The ingress routes `/agent/*` to it and
everything else to Nuxeo, so the browser sees a single origin.

### OnPrem — the honest version

This is the cost of the decision and it is the top risk in the plan. Self-hosted customers
today install a Maven marketplace package for the UI and a second for AI. The gateway is a
third artifact, and unlike the other two it is a process to run rather than a bundle to
install. We owe them three things:

1. **A container image** published to the same registry as the rest of the product,
   configured entirely by environment variables, with `GET /agent/health` for orchestration.
2. **A worked reverse-proxy configuration**, shipped and tested, not described. One origin
   in front of both Nuxeo and the gateway:
   - `/agent/*` → gateway
   - everything else → Nuxeo
   - proxy buffering **off** on `/agent/*` (`proxy_buffering off;` in nginx). This is the
     single most likely misconfiguration, and its symptom is the nastiest: everything works,
     it just does not stream. Call it out in the runbook, and give support a one-line
     `curl -N` reproduction.
   - read timeout raised above the longest expected agent run.
3. **A supported "do not install it" path.** The capability probe means a customer who never
   deploys the gateway gets today's Automation-backed AI and no broken UI. This path is not a
   theoretical fallback — it MUST be exercised in CI and in the release test plan, because it
   is the configuration a meaningful number of OnPrem customers will actually run.

If a future release folds the gateway into the Nuxeo WAR as a bundled Node sidecar or a
JVM-hosted runtime, this ADR should be revisited. It is a packaging change, not a protocol
change, and nothing in the wire contract above would move.

### Configuration

Strictly from environment variables, validated at startup, process exits non-zero on a
missing required value, no fallback defaults, per `AGENTS/07-security.md`.

| Variable               | Required | Purpose                                                 |
| ---------------------- | -------- | ------------------------------------------------------- |
| `NUXEO_BASE_URL`       | yes      | Server-side base URL for tool calls and `/me`           |
| `HAIP_BASE_URL`        | yes      | HAIP model gateway endpoint                             |
| `HAIP_API_KEY`         | yes      | HAIP credential — the gateway's own, for the model only |
| `AGENT_MODEL`          | yes      | Model identifier                                        |
| `PORT`                 | no       | Defaults to `3100`                                      |
| `AGENT_MAX_STEPS`      | no       | Tool-loop bound                                         |
| `AGENT_RUN_TIMEOUT_MS` | no       | Hard ceiling per run                                    |

`HAIP_API_KEY` is the one credential the gateway holds, and it authenticates the gateway to
the model provider — never to Nuxeo. There is deliberately no Nuxeo credential in this table.

---

## Verified during the A1 spike

Recorded so Phase 1 does not re-derive any of it. Spike lives in `spikes/ag-ui-sse/`.

| Finding                                                                       | Evidence                                                                                 |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@ag-ui/core`, `@ag-ui/encoder`, `@ag-ui/client` all `0.0.57` install cleanly | 81 packages, 6 production dependencies                                                   |
| AG-UI events stream incrementally over `text/event-stream`                    | 17 frames arriving across 975 ms, first at 0 ms                                          |
| `@ag-ui/client` `HttpAgent` consumes the stream unmodified                    | `verify-client.mjs` — full normalised event sequence, state applied, run result returned |
| A real browser renders tokens progressively                                   | `evidence-browser-run.png` — frame log `+29ms` … `+1000ms`                               |
| `@ag-ui/client` type-resolves under TypeScript 5.6.3 with `module: preserve`  | `tsc -p typecheck/tsconfig.json` exits 0 via `dist/index.d.mts`                          |
| Dual CJS/ESM build                                                            | `exports: { ".": { require: "./dist/index.js", import: "./dist/index.mjs" } }`           |
| **RxJS does not dedupe by default**                                           | See below                                                                                |

### The RxJS pin, which the plan gets slightly wrong

The plan states that `@ag-ui/client` uses RxJS 7.8.1, "the same version this repo pins", and
concludes the adapter is therefore thin. The conclusion is right; the premise needs a
correction that Phase 1 must act on.

`@ag-ui/client@0.0.57` depends on `rxjs` at **exactly `7.8.1`**, not `^7.8.1`. This repo
declares `~7.8.0` and currently resolves to **7.8.2**. Because an exact `7.8.1` cannot be
satisfied by the hoisted 7.8.2, npm installs a second copy:

```
├─┬ @ag-ui/client@0.0.57
│ └── rxjs@7.8.1          <- nested duplicate
└── rxjs@7.8.2
```

Two RxJS copies in one bundle means duplicated operator code and `instanceof Observable`
checks that can fail across the boundary — exactly the kind of defect that shows up as an
inexplicable Angular interop bug weeks later. The fix is one line in the root
`package.json`, verified in the spike to collapse the tree to a single deduped `rxjs@7.8.2`:

```json
"overrides": { "rxjs": "$rxjs" }
```

`$rxjs` resolves to the root's own direct dependency spec. A literal version string is
rejected by npm with `EOVERRIDE` when it conflicts with the direct dependency, so use the
`$`-reference form. Phase 1 MUST add this alongside the `@ag-ui/*` dependencies and assert
`npm ls rxjs --all` shows one entry.

---

## Consequences

**Good.** One language across the agent client, gateway and tool layer, with one `@ag-ui/*`
version governing both ends of the protocol. First-party SDK support for the fast-moving
parts — chunk normalisation, event verification, JSON Patch state, cancellation. The gateway
holds no Nuxeo credential, so the worst-case ACL bypass is structurally impossible rather
than defended against. The whole thing is inside `nx affected`, so a change to the client
retests the gateway.

**Bad.** A third deployment artifact for OnPrem customers, and a reverse-proxy configuration
whose most likely misconfiguration degrades silently. A second runtime to patch, scan and
monitor. Divergence from the team's precedent of consolidating AI capability into
`nuxeo-ai-package`, which needs to be explained to whoever set that precedent.

**Neutral.** The Automation path stays and must keep working, which is ongoing cost but also
the thing that makes the OnPrem story survivable.

---

## Open items for Phase 1

- Add `@ag-ui/core`, `@ag-ui/encoder`, `@ag-ui/client` at `0.0.57` **and** the
  `"overrides": { "rxjs": "$rxjs" }` entry to the root `package.json`.
- AG-UI is pre-1.0 and the enum already carries `THINKING_*` events deprecated in favour of
  `REASONING_*` "removed in 1.0.0". Pin exact versions, do not use carets, and treat an SDK
  bump as a change requiring a run of the streaming E2E test.
- `protocolVersion` in the capability probe is currently the SDK version. If the protocol
  ever versions independently of the packages, this needs to track the protocol.
- Rate limiting and a per-user concurrent-run cap on `/agent/run`. An agent run is far more
  expensive than a REST call and the endpoint is authenticated but unthrottled.
- Confirm with the epic owner that a third OnPrem artifact is acceptable for Beta. This is
  the assumption most likely to be overturned by someone outside the engineering team, and
  it is cheaper to overturn now than after A2–A5 are built.
