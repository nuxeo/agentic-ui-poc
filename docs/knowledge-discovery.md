# Knowledge Discovery

Knowledge Discovery is integrated through the **Hyland Content Intelligence
Connector (CIC)** installed on the Nuxeo server. Only the Angular app ships
from this repo — there is no separate backend service to deploy, because
the marketplace package contains the UI only.

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

# Optional — defaults baked into the connector. Override only if needed.
#nuxeo.hyland.cic.discovery.auth.grantType=client_credentials
#nuxeo.hyland.cic.discovery.auth.scope=hxp hxp.integrations environment_authorization iam.jti-capture

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

Everything else hits the generic `Invoke` op, which the connector forwards
to the Discovery API using the `{httpMethod, endpoint, jsonPayloadStr}`
params (authentication + `hxai-environment` header are injected
server-side). `KdClientService` stringifies request bodies into
`jsonPayloadStr` automatically.

| Client method        | HTTP   | Upstream path (default)            |
| -------------------- | ------ | ---------------------------------- |
| `getAgent(id)`       | GET    | `/agent/agents/{id}`               |
| `createAgent`        | POST   | `/agent/agents`                    |
| `updateAgent(id)`    | PUT    | `/agent/agents/{id}`               |
| `deleteAgent(id)`    | DELETE | `/agent/agents/{id}`               |
| `listModels`         | GET    | `/agent/models`                    |
| `listGuardrails`     | GET    | `/agent/guardrails`                |
| `getQuestionHistory` | GET    | `/agent/questions?agentId=...&...` |

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
  "response": {
    /* upstream JSON body */
  },
  "responseCode": 200,
  "responseMessage": "OK"
}
```

`KdClientService` unwraps this automatically. Non-2xx `responseCode`
values are surfaced as a thrown `Error` with `responseMessage` in the
message.

## Local setup

```bash
npm run dev
```

Starts the Angular UI. KD calls go through the existing `/nuxeo` proxy
entry to the Nuxeo dev server. No additional dev service is required.

## UI flow

1. Load models, guardrails, and agents (`listModels`, `listGuardrails`, `listAgents`).
2. Create or edit an agent through the modal dialog (`createAgent` / `updateAgent`).
3. Submit a question for the selected agent (`submitQuestion` — one-shot via `askQuestionAndGetAnswer`).
4. Review citations. For terminal statuses the answer is displayed immediately; any non-terminal status still polls via `getAnswer`.
5. Submit feedback (`submitFeedback`; currently stored client-side until the connector exposes a feedback op for single-shot questions).
6. Reload recent questions for the selected agent (`getQuestionHistory`).
