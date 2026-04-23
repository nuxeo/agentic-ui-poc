# Knowledge Discovery

Knowledge Discovery is integrated through the **Hyland Content Intelligence Connector (CIC)**
installed on the Nuxeo server. Only the Angular app ships from this repo — there is no
separate backend service to deploy, because the marketplace package contains the UI only.

## Runtime pieces

- Frontend route: `#/knowledge-discovery`
- Frontend client: `@agentic-ui/shared/kd-client` (`KdClientService`)
- Transport: Nuxeo automation operations at `/nuxeo/site/automation/<OpName>`
- Auth: existing Nuxeo session (SAML cookie or Basic), via the global `nuxeoAuthInterceptor`

## Nuxeo server prerequisite

The target Nuxeo instance must have the Hyland Content Intelligence Connector package
installed and configured with Knowledge Discovery credentials. The connector owns:

- OAuth 2.0 client-credentials flow with the KD IAM service
- Access-token caching and refresh
- The KD tenant and environment key

Nothing in this repo needs those secrets — they live on the Nuxeo server.

## Configuring operation names

`KdClientService` talks to Nuxeo automation operations. The names default to the
convention below, but they are connector-version specific. Override them by providing
`KD_CIC_OPERATIONS` in `app.config.ts` if your deployed connector exposes different names.

```ts
import { DEFAULT_KD_CIC_OPERATIONS, KD_CIC_OPERATIONS } from '@agentic-ui/shared/kd-client';

providers: [
  {
    provide: KD_CIC_OPERATIONS,
    useValue: {
      ...DEFAULT_KD_CIC_OPERATIONS,
      submitQuestion: 'HylandCIC.Agents.Ask', // connector-specific override
    },
  },
];
```

Default operation map:

| Client method        | Default automation op                             |
| -------------------- | ------------------------------------------------- |
| `listAgents`         | `HylandCIC.KnowledgeDiscovery.ListAgents`         |
| `getAgent`           | `HylandCIC.KnowledgeDiscovery.GetAgent`           |
| `createAgent`        | `HylandCIC.KnowledgeDiscovery.CreateAgent`        |
| `updateAgent`        | `HylandCIC.KnowledgeDiscovery.UpdateAgent`        |
| `deleteAgent`        | `HylandCIC.KnowledgeDiscovery.DeleteAgent`        |
| `listModels`         | `HylandCIC.KnowledgeDiscovery.ListModels`         |
| `listGuardrails`     | `HylandCIC.KnowledgeDiscovery.ListGuardrails`     |
| `submitQuestion`     | `HylandCIC.KnowledgeDiscovery.SubmitQuestion`     |
| `getAnswer`          | `HylandCIC.KnowledgeDiscovery.GetAnswer`          |
| `submitFeedback`     | `HylandCIC.KnowledgeDiscovery.SubmitFeedback`     |
| `getQuestionHistory` | `HylandCIC.KnowledgeDiscovery.GetQuestionHistory` |

## Request/response shape

Every call is a `POST` to `/nuxeo/site/automation/<OpName>` with
`Content-Type: application/json`:

```json
{
  "params": {
    "agentId": "agent-123",
    "question": "What contracts mention renewal clauses?",
    "dynamicFilter": null
  }
}
```

The response is whatever the Nuxeo operation returns — `KdClientService` accepts either
the normalized shape described in `kd.models.ts` (e.g. `KdAnswerResponse`) or a wrapped
form (`{ agents: [...] }`, `{ data: [...], pagination: {...} }`) and unwraps as needed.

## Local setup

```bash
npm run dev
```

Starts the Angular UI (and the AI POC backend). KD calls go straight to the Nuxeo
dev server through the existing `/nuxeo` proxy entry.

## UI flow

1. Load models, guardrails, and agents (`listModels`, `listGuardrails`, `listAgents`).
2. Create or edit an agent through the modal dialog (`createAgent` / `updateAgent`).
3. Submit a question for the selected agent (`submitQuestion`).
4. Poll `getAnswer` until the status is terminal (`Complete`, `Error`, `Blocked`).
5. Review citations and submit feedback (`submitFeedback`).
6. Reload recent questions for the selected agent (`getQuestionHistory`).
