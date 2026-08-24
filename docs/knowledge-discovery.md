# Knowledge Discovery

Knowledge Discovery (KD) is integrated through **two complementary Nuxeo
marketplace plugins** on the Nuxeo server, with only the Angular UI
shipping from this repo:

| Plugin                                      | Role                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `nuxeo-labs-content-intelligence-connector` | Exposes `HylandKnowledgeDiscovery.*` automation ops; our `KdClientService` calls these to list/ask/converse. |
| `nuxeo-hxai-connector`                      | Ships Nuxeo document binaries + metadata into the HxAI Ingestion service so KD has something to search.      |

The two plugins use **different property namespaces** (`nuxeo.hyland.cic.*`
vs. `hxai.*`), **different service accounts**, and **different base URLs**.
They must both be installed and configured for the end-to-end flow.

```text
Nuxeo doc ──(hxai-connector listener)──▶ HxAI Ingest API ──▶ Content Lake
                                                               │
                                                               ▼
                                                         Agent (Insight UI)
                                                               │
                                KdClientService  ──▶  HylandKnowledgeDiscovery.askQuestionAndGetAnswer
```

## Runtime pieces

- Frontend route: `#/knowledge-discovery`
- Frontend client: `@agentic-ui/shared/kd-client` (`KdClientService`)
- Transport: Nuxeo automation operations at `/nuxeo/site/automation/<OpName>`
- Auth: existing Nuxeo session (SAML cookie or Basic), via the global `nuxeoAuthInterceptor`
- CIC bundle on the server: `nuxeo-labs-content-intelligence-connector` (2025.x)

## Nuxeo server prerequisite

The Nuxeo server must have the Content Intelligence Connector installed
and configured. The connector owns the secrets (client id/secret), the
OAuth 2.0 client-credentials flow with the HX IDP, token caching, and the
`hxai-environment` header. Nothing in this repo needs those secrets.

### `nuxeo.conf` properties (real names from the connector)

Put these in `$NUXEO_HOME/bin/nuxeo.conf` or any `*.conf` file under
`/etc/nuxeo/conf.d/` (docker image appends those on first boot). See
[`../nuxeo-conf/README.md`](../nuxeo-conf/README.md) for the docker flow
used in local dev.

```properties
# Shared HX IDP — /connect/token is appended by the connector.
nuxeo.hyland.cic.auth.baseUrl=https://auth.iam.<env>.experience.hyland.com/idp

# Knowledge Discovery
nuxeo.hyland.cic.discovery.baseUrl=https://discovery.<env>.experience.hyland.com
nuxeo.hyland.cic.discovery.clientId=sc-...
nuxeo.hyland.cic.discovery.clientSecret=...
nuxeo.hyland.cic.discovery.environment=hxai-<uuid>

# REQUIRED for the new `sc-*` / `hyx_cs_*` service accounts issued from the
# Hyland Experience Admin Portal — the connector's baked-in default
# (`hxp hxp.integrations environment_authorization iam.jti-capture`) is
# rejected by the current Dev IDP as `invalid_scope`, which surfaces as
# "No authentication info for calling the Knowledge Discovery service".
nuxeo.hyland.cic.discovery.auth.scope=hxp iam.jti-capture

# Optional — grantType defaults to client_credentials.
#nuxeo.hyland.cic.discovery.auth.grantType=client_credentials

# Hyland Agents service (if you use HylandAgents.* ops)
#nuxeo.hyland.cic.agents.baseUrl=...
#nuxeo.hyland.cic.agents.clientId=...
#nuxeo.hyland.cic.agents.clientSecret=...
```

Verify the config was picked up:

```bash
curl -s -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://<nuxeo>/nuxeo/site/automation/HylandContentIntelligence.GetContributionNames \
  -d '{"params": {"which": "knowledgeDiscovery"}}'
# → {"knowledgeDiscovery":["default"],...}
```

## Operation surface

The connector exposes a small first-class surface plus a generic
passthrough. `KdClientService` uses the named ops where they exist and
falls back to the passthrough for the rest.

### First-class automation operations (connector 2025.x)

| Client method                                     | Automation op                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `listAgents`                                      | `HylandKnowledgeDiscovery.getAllAgents`                                                        |
| `submitQuestion`                                  | `HylandKnowledgeDiscovery.askQuestionAndGetAnswer`                                             |
| _(conversation APIs reserved for future UI flow)_ | `HylandKnowledgeDiscovery.startConversation`, `.continueConversation`, `.conversationFeedback` |

### Passthrough via `HylandKnowledgeDiscovery.Invoke`

Read-only metadata hits the generic `Invoke` op, which the connector
forwards to the Discovery API using the `{httpMethod, endpoint, jsonPayloadStr}`
params (authentication + `hxai-environment` header are injected
server-side). `KdClientService` stringifies request bodies into
`jsonPayloadStr` automatically. The `Invoke` op only supports
`GET`/`POST`/`PUT`; any `DELETE` is rejected by the connector with
`Only GET, POST and PUT are supported.`

| Client method        | HTTP | Upstream path (default)                                    |
| -------------------- | ---- | ---------------------------------------------------------- |
| `getAgent(id)`       | GET  | `/agent/agents/{id}`                                       |
| `listModels`         | GET  | `/agent/models`                                            |
| `listGuardrails`     | GET  | `/agent/guardrails`                                        |
| `getQuestionHistory` | GET  | `/qna/agents/{id}/questions/history?pageNumber=&pageSize=` |

The Discovery product is actually two services on the same host; both are
hit through the same `Invoke` passthrough:

- **Agent API** (`/agent/*`) — agents, models, guardrails, avatars.
  Swagger: `https://discovery.<env>.experience.hyland.com/agent/swagger`
- **QnA API** (`/qna/*`) — questions, answers, conversations, feedback,
  question history, feedback breakdowns.
  Swagger: `https://discovery.<env>.experience.hyland.com/qna/swagger`

Question history specifically lives on the QnA side; earlier attempts
against `/agent/questions?agentId=...` returned `404 Not Found` because
that endpoint does not exist on the Agent service. The current client
path is verified live against the QnA Swagger and returns
`{pagination, data}` (`data[]` elements carry a
`responseCompleteness` field that `KdClientService` normalises to the
shared `KdResponseStatus` enum).

### Agent management (create / edit / delete) is NOT exposed here

Agent CRUD is deliberately out of scope for this app. The CIC connector
does not ship a first-class agent create/update/delete op (its
`HylandAgents.*` surface is `getAllAgents`, `LookupAgent`, and the
`Invoke*Agent` family — no write operations), and `HylandKnowledgeDiscovery.Invoke`:

- Rejects `DELETE` at the connector layer.
- Returns `400 Bad Request` from the upstream Discovery service for
  `POST /agent/agents`, even with a valid payload.

Agent creation, editing, and deletion are performed in the **Hyland
Insight admin UI**. Once an agent exists there, it becomes available in
this app automatically through `listAgents`.

Paths and op names are injection-token overridable per deployment:

```ts
import {
  DEFAULT_KD_CIC_OPERATIONS,
  DEFAULT_KD_UPSTREAM_PATHS,
  KD_CIC_OPERATIONS,
  KD_UPSTREAM_PATHS,
} from '@agentic-ui/shared/kd-client';

providers: [
  {
    provide: KD_CIC_OPERATIONS,
    useValue: { ...DEFAULT_KD_CIC_OPERATIONS, getAllAgents: 'Custom.Agents.List' },
  },
  {
    provide: KD_UPSTREAM_PATHS,
    useValue: { ...DEFAULT_KD_UPSTREAM_PATHS, listModels: '/v1/models' },
  },
];
```

## Response envelope

Every CIC op returns the same envelope:

```json
{
  "response": {/* upstream JSON body */},
  "responseCode": 200,
  "responseMessage": "OK"
}
```

`KdClientService` unwraps this automatically. Non-2xx `responseCode`
values are surfaced as a thrown `Error` with `responseMessage` in the
message.

## Ingesting Nuxeo documents (making them discoverable)

KD only answers against documents that exist inside a Content Lake source
attached to the queried agent. The `nuxeo-hxai-connector` is what puts
Nuxeo documents there.

### 1. Install the plugin

```bash
# The Docker image pulled from `docker-private.packages.nuxeo.com` already
# has marketplace access (CLID is baked into the volume). Install the
# plugin once and it persists across `docker restart`:
docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl mp-add nuxeo-hxai-connector-2025.1.0
echo "install nuxeo-hxai-connector-2025.1.0" \
  | docker exec -i nuxeo tee /var/lib/nuxeo/installAfterRestart.log
docker restart nuxeo

# Verify
docker exec nuxeo ls /opt/nuxeo/server/nxserver/bundles/ | grep hxai
# → nuxeo-hxai-connector-core-2025.1.jar
```

For reproducible image rebuilds, add `nuxeo-hxai-connector` to the
`NUXEO_PACKAGES` env var of the Nuxeo container.

### 2. Credentials

Request a **separate** service account from the Hyland Experience Admin
Portal scoped to **Ingest** (these are different credentials from the
Discovery pair used by `KdClientService`). Put them in `nuxeo.conf` /
`/etc/nuxeo/conf.d/*.conf` under the `hxai.*` namespace — see
[`../nuxeo-conf/50-hyland-cic.sample.conf`](../nuxeo-conf/50-hyland-cic.sample.conf)
for the full block.

> **Documented vs. reachable Dev host — they disagree today.** The
> authoritative Hyland Confluence page
> ([_Nuxeo → Insight Authentication and Environment for Testing_](https://hyland.atlassian.net/wiki/spaces/HxAI/pages/1329661828))
> lists the Dev ingestion base URL as `https://ingestion-api.insight.dev.ncp.hyland.com`.
> Verified from both our dev host and the Nuxeo container, that hostname
> currently returns **NXDOMAIN** (DNS SERVFAIL from `8.8.8.8`). The only
> Dev ingestion host that resolves and responds is
> `https://ingestion.insight.dev.experience.hyland.com` (it answers HTTP
> 401 with a Discovery-scoped token, which matches "valid host, wrong
> scope" rather than "wrong URL").
>
> Until the `ncp.hyland.com` hostname is publicly resolvable (or a
> networking change makes it reachable from the Nuxeo container), pin the
> connector to the `experience.hyland.com` host and escalate the discrepancy
> to the HxAI team:
>
> | Environment | Ingestion base URL (actually reachable)                                                                                                                                |
> | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Dev         | `https://ingestion.insight.dev.experience.hyland.com` _(Confluence documents `https://ingestion-api.insight.dev.ncp.hyland.com` but that does not resolve in DNS yet)_ |
> | Staging     | `https://ingestion.insight.staging.experience.hyland.com`                                                                                                              |
> | Prod        | `https://ingestion.insight.<prod>.experience.hyland.com`                                                                                                               |
>
> The connector appends `/v1/presigned-urls` and `/v1/ingestion-events`.

Minimum (Dev example — using the reachable host):

```properties
hxai.ingest.base.url=https://ingestion.insight.dev.experience.hyland.com
hxai.ingest.client.id=sc-...
hxai.ingest.client.secret=hyx_cs_...
hxai.ingest.env.key=hxai-<uuid>   # same env key as the Discovery config
```

> **Dev/non-prod base URLs must also be pinned via `ConfigurationService`.**
> The compiled defaults for `hxai.nucleus.auth.base.url`,
> `hxai.nucleus.system.integration.base.url`, and `hxai.ingest.base.url`
> point at **PROD**. `nuxeo.conf` entries alone are NOT honoured at runtime
> by the connector — add a ConfigurationService XML contribution on the
> classpath:
>
> ```xml
> <!-- /opt/nuxeo/server/nxserver/config/hxai-dev-config.xml -->
> <component name="org.nuxeo.hxai.dev.override" version="1.0.0">
>   <require>org.nuxeo.hxai.configuration</require>
>   <extension target="org.nuxeo.runtime.ConfigurationService" point="configuration">
>     <property name="hxai.nucleus.auth.base.url">https://auth.iam.dev.experience.hyland.com</property>
>     <property name="hxai.nucleus.system.integration.base.url">https://api.nucleus.dev.experience.hyland.com</property>
>     <property name="hxai.ingest.base.url">https://ingestion.insight.dev.experience.hyland.com</property>
>   </extension>
> </component>
> ```
>
> Without this, token calls hit the PROD IDP and fail with
> `{"error":"invalid_client"}`, which the connector rewraps as
> `Error occurred while trying to authenticate to HxAi, grant type: client_credentials scope: hxp`.

### 3. What gets sent (default mapping)

The plugin ships a sensible default `ingestMappings` contribution — every
document with `dublincore` and `file:content` facets is mapped to the HxAI
"default" type and sent with:

- `dc:title` → basename
- `dc:created` / `dc:modified` → epoch timestamps
- `dc:creator` / `dc:lastContributor` → identity
- `file:content` and `files:files` → binaries (uploaded via presigned URL)
- the Nuxeo UUID → HxAI `objectId` (so you can later constrain a question
  to specific Nuxeo docs via `contextObjectIds`)

The listener `ingestlistener` fires synchronously on `documentModified`,
`documentSecurityUpdated`, and `documentRestored`, so new content shows up
in CIC within seconds of a save.

### 4. Custom doctype → source mapping (optional)

Override the defaults by contributing XML against the
`org.nuxeo.hxai.IngestMappingServiceComponent` component, extension point
`ingestMappings` / `ingestTransformations` / `ingestPropertyMappers`.
Example: send a `Contract` doctype with a bespoke property mapping:

```xml
<extension
    target="org.nuxeo.hxai.IngestMappingServiceComponent"
    point="ingestMappings">
  <ingest id="Contract" args="@system dublincore file:content contract" />
</extension>
```

See the bundled `ingest-mapping-service-config.xml` inside
`nuxeo-hxai-connector-core-<ver>.jar` for the full vocabulary.

### 5. Retrofitting already-existing content

For documents that existed **before** the listener was enabled, run the
`ingest` bulk action (registered by the plugin) against an NXQL query:

```bash
curl -s -u Administrator:Administrator \
  -X POST "http://<nuxeo>/nuxeo/api/v1/search/bulk/ingest" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM Document WHERE ecm:primaryType = '"'"'File'"'"'"}'
```

Monitor via Nuxeo's admin console → Bulk Actions.

### 6. Wiring the agent

In the Hyland Insight UI, create (or edit) an Agent and attach the Content
Lake source that the ingest points at. Once both sides are healthy, the
agent will start citing Nuxeo documents — the citation `objectId` is the
Nuxeo UUID, which our UI can resolve back to a Nuxeo permalink.

## Local setup

```bash
npm run dev
```

Starts the Angular UI. KD calls go through the existing `/nuxeo` proxy
entry to the Nuxeo dev server. No additional dev service is required.

## Troubleshooting

| Symptom                                                                                                                                                               | Cause                                                                                                                                                                     | Fix                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `No authentication info for calling the Knowledge Discovery service`                                                                                                  | Token request hit `400 invalid_scope` (new Admin-Portal service accounts reject legacy scopes)                                                                            | Set `nuxeo.hyland.cic.discovery.auth.scope=hxp iam.jti-capture`                                                                                                                                                                                                                                                                                                                                                  |
| `{"responseCode":401}` / empty upstream body                                                                                                                          | `discovery.baseUrl` points at the Insight UI host                                                                                                                         | Use the API host: `https://discovery.<env>.experience.hyland.com`                                                                                                                                                                                                                                                                                                                                                |
| `Model '...' is not recognized. Please update the agent to use a supported model.`                                                                                    | The agent was created against a retired model                                                                                                                             | Re-create the agent in the Insight UI against a supported model (e.g. `meta.llama4-scout-17b-instruct-v1:0`)                                                                                                                                                                                                                                                                                                     |
| `403 Upstream Service Exception` from the Discovery API                                                                                                               | Service account not provisioned for the target environment                                                                                                                | Escalate to the HxAI team with the `traceId` from the error envelope                                                                                                                                                                                                                                                                                                                                             |
| `Error occurred while trying to authenticate to HxAi, grant type: client_credentials scope: hxp` during `Bulk.RunAction` / the ingest listener                        | `hxai.nucleus.auth.base.url` is still on PROD (Dev needs `auth.iam.dev...`)                                                                                               | Add the `ConfigurationService` XML contribution shown in "Ingesting Nuxeo documents → 2. Credentials" and restart Nuxeo                                                                                                                                                                                                                                                                                          |
| `Couldn't ingest payload: [...] HTTP status code: 401` / `Couldn't fetch presigned URLs. HTTP status code: 401` (connector got a token but the Ingest API rejects it) | Service account is not authorized against the **Ingest** service for this environment (Discovery scope alone is not enough; scope `hxp.ingest` is `invalid_scope` on Dev) | Ask the Hyland team to provision Ingest authorization for the client, or issue a second service account scoped to the Dev ingestion host (`ingestion.insight.dev.experience.hyland.com`) / Staging/Prod (`ingestion.insight.<env>.experience.hyland.com`)                                                                                                                                                        |
| `Couldn't fetch presigned URLs. HTTP status code: 403` against the Dev tenant                                                                                         | Service account does **not** have Ingest authorization on Dev (Discovery-scoped credentials return 403 against the presigned-URL endpoint)                                | Request a separate, Ingest-scoped service account from the HxAI team for Dev. Note: the Confluence page documents `https://ingestion-api.insight.dev.ncp.hyland.com` as the Dev host, but that hostname does not resolve in public DNS yet — keep `hxai.ingest.base.url=https://ingestion.insight.dev.experience.hyland.com` until the `ncp.hyland.com` host is reachable and escalate the discrepancy upstream. |

## UI flow

### Upload to Content Lake

The **Upload to Content Lake** button on `#/knowledge-discovery` opens a dialog
where users pick local file(s), upload them as Nuxeo `File` documents, and
trigger the HxAI bulk `ingest` action so the content becomes searchable by KD
agents. Flow:

1. Choose file(s) and optional Nuxeo folder path (defaults to `/default-domain`).
2. `DocumentImportService.importFiles` creates the Nuxeo documents.
3. `ContentLakeIngestService.startIngest` + `waitUntilComplete` polls bulk status.
4. Uploaded document links open in document detail (`/#/doc/:uid`).

### Ask questions

1. Load models, guardrails, and agents (`listModels`, `listGuardrails`, `listAgents`).
2. Pick an existing agent (agents are created and edited in the Hyland Insight admin UI — this page is read-only for agent management).
3. Submit a question for the selected agent (`submitQuestion` — one-shot via `askQuestionAndGetAnswer`).
4. Review citations. For terminal statuses the answer is displayed immediately; any non-terminal status still polls via `getAnswer`.
5. Submit feedback (`submitFeedback`; currently stored client-side until the connector exposes a feedback op for single-shot questions).
6. Reload recent questions for the selected agent (`getQuestionHistory`).
