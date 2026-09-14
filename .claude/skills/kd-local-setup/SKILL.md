---
name: kd-local-setup
description: Configure local Nuxeo Docker for Knowledge Discovery, HxAI ingestion, Nucleus sync, and ingest local Nuxeo documents or blobs into Content Lake. Use when the user asks to set up KD in local, configure local KD, setup KD ingestion in Docker, upload a file to Content Lake, ingest a Nuxeo document, ingest an attachment/blob for KD, or validate KD retrieval.
---

# KD Local Setup

Use this skill to configure the running local `nuxeo` Docker container for Knowledge Discovery (KD), ingest Nuxeo content into Content Lake, and validate that KD can answer from the ingested content.

## Expected User Prompts

- `set up KD in local`
- `configure local KD`
- `upload file to content lake`
- `ingest this Nuxeo document`
- `ingest this attachment for KD`
- `validate KD retrieval`

## Safety Rules

- Never print client secrets in final answers, docs, Jira, Confluence, commits, or screenshots.
- Update only the running local Docker container unless the user explicitly asks for repo-managed config.
- Start with a single-document ingest before a workspace or repository backfill.
- Ask for confirmation before broad workspace/repository ingest.
- Do not run destructive Docker or git commands.

## Shared Dev Defaults

Use these defaults for the current team Dev POC unless the user provides overrides. These are identifiers and endpoints, not secrets.

```text
container=nuxeo
nuxeoUser=Administrator
nuxeoPassword=Administrator
environmentKey=hxai-bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22
environmentId=bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22
contentSourceId=efffbf29-7d45-47ec-a7f0-7a9c5df8413b
kdDiscoveryClientId=sc-4f1612f4-d336-40a2-89c3-542e2e6660b8
ingestNucleusClientId=sc-47f4831d-aff1-42ad-bd77-16e32928305b
keEnrichmentClientId=sc-a6f50725-bacb-4b4b-8f6a-8cb356eb62e3
discoveryBaseUrl=https://discovery.dev.experience.hyland.com
ingestBaseUrl=https://ingestion.insight.dev.experience.hyland.com
nucleusAuthBaseUrl=https://auth.iam.dev.experience.hyland.com
nucleusSystemIntegrationBaseUrl=https://api.nucleus.dev.experience.hyland.com
contextEnrichmentBaseUrl=https://knowledge-enrichment.ai.dev.experience.hyland.com/latest/api/context-enrichment
```

Knowledge Enrichment requires a **different External Application** than
Discovery on the same tenant, because the Discovery SA is bound to
`Application = Content Intelligence Connector` (mints tokens with
`appkey: "insight"`) and the Context API endpoint
`/files/upload/presigned-url` rejects those tokens with HTTP 403.
`keEnrichmentClientId` above is the Content-Lake-bound External App
(mints tokens with `appkey: "content-lake"`); use it only for
`nuxeo.hyland.cic.enrichment.*`. Keep Discovery, ingest, and `hxai.*`
on `kdDiscoveryClientId`. Full background and a JWT decode that proves
this distinction in `docs/knowledge-enrichment.md`.

Do not hardcode or invent client secrets. Ask for the current secrets when they are missing from the running container config, and write them only into the local Docker container config.

## Required Inputs

Before configuring local KD, collect or confirm:

- Nuxeo container name, default: `nuxeo`
- Nuxeo credentials for local testing, default: `Administrator:Administrator`
- Environment key, default from Shared Dev Defaults
- Content Source Id, default from Shared Dev Defaults
- KD / Discovery client id, default from Shared Dev Defaults
- KD / Discovery client secret, ask if not already configured
- Ingest / Nucleus client id, default from Shared Dev Defaults
- Ingest / Nucleus client secret, ask if not already configured
- KE / Context API client id, default from Shared Dev Defaults (only when configuring KE; required for `nuxeo.hyland.cic.enrichment.*`, do NOT reuse the Discovery client id here)
- KE / Context API client secret, ask if not already configured
- Target environment, default: Dev

Use approved secret handling. If a secret is needed for a command, keep it in shell variables or write it only to local container config. Do not echo it back to the user.

## Workflow: Configure Local Docker KD

1. Confirm the `nuxeo` container is running.

2. Install the required Nuxeo packages if they are not already installed:

   ```bash
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl mp-add nuxeo-labs-content-intelligence-connector
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl mp-add nuxeo-hxai-connector-2025.1.0
   ```

   Persist the HxAI connector install across restarts when using the local Docker container:

   ```bash
   echo "install nuxeo-hxai-connector-2025.1.0" \
     | docker exec -i nuxeo tee /var/lib/nuxeo/installAfterRestart.log
   ```

   Verify the installed bundles:

   ```bash
   docker exec nuxeo sh -lc 'ls /opt/nuxeo/server/nxserver/bundles | grep -E "content-intelligence|hxai"'
   ```

3. Read the current config first. If the required secret values already exist, reuse them without printing them:

   ```bash
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get nuxeo.hyland.cic.discovery.clientId
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get hxai.ingest.client.id
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get hxai.ingest.source.id
   ```

4. Update or create `/etc/nuxeo/conf.d/50-hyland-cic.conf` inside the container with:

   ```properties
   nuxeo.hyland.cic.discovery.baseUrl=https://discovery.dev.experience.hyland.com
   nuxeo.hyland.cic.discovery.clientId=sc-4f1612f4-d336-40a2-89c3-542e2e6660b8
   nuxeo.hyland.cic.discovery.clientSecret=<discovery-client-secret>
   nuxeo.hyland.cic.discovery.environment=hxai-bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22
   nuxeo.hyland.cic.discovery.auth.scope=hxp iam.jti-capture

   hxai.ingest.base.url=https://ingestion.insight.dev.experience.hyland.com
   hxai.ingest.client.id=sc-47f4831d-aff1-42ad-bd77-16e32928305b
   hxai.ingest.client.secret=<ingest-client-secret>
   hxai.ingest.env.key=hxai-bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22
   hxai.ingest.source.id=efffbf29-7d45-47ec-a7f0-7a9c5df8413b

   hxai.nucleus.auth.base.url=https://auth.iam.dev.experience.hyland.com
   hxai.nucleus.system.integration.base.url=https://api.nucleus.dev.experience.hyland.com
   hxai.nucleus.client.id=sc-47f4831d-aff1-42ad-bd77-16e32928305b
   hxai.nucleus.client.secret=<ingest-client-secret>
   hxai.nucleus.system.id=efffbf29-7d45-47ec-a7f0-7a9c5df8413b
   ```

5. Update or create `/opt/nuxeo/server/nxserver/config/hxai-dev-config.xml` for non-production endpoint overrides:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <component name="org.nuxeo.hxai.configuration.test" version="1.0.0">
     <require>org.nuxeo.hxai.configuration</require>
     <extension point="configuration" target="org.nuxeo.runtime.ConfigurationService">
       <property name="hxai.nucleus.auth.base.url">https://auth.iam.dev.experience.hyland.com</property>
       <property name="hxai.nucleus.system.integration.base.url">https://api.nucleus.dev.experience.hyland.com</property>
       <property name="hxai.ingest.base.url">https://ingestion.insight.dev.experience.hyland.com</property>
       <property name="hxai.ingest.binary.check.threshold.byte.size">261214400</property>
       <property name="hxai.ingest.presigned.url.cache.size.max">100</property>
       <property name="hxai.connection.pool.size.max">1</property>
       <property name="hxai.executor.pool.size.max">1</property>
     </extension>
   </component>
   ```

6. Restart the container:

   ```bash
   docker restart nuxeo
   ```

7. Verify selected config values without printing secrets:

   ```bash
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get nuxeo.hyland.cic.discovery.clientId
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get hxai.ingest.source.id
   docker exec nuxeo /opt/nuxeo/server/bin/nuxeoctl config --get hxai.ingest.env.key
   ```

8. Verify KD operations:

   ```bash
   curl -sS -u Administrator:Administrator \
     -X POST -H "Content-Type: application/json" \
     http://localhost:8080/nuxeo/site/automation/HylandKnowledgeDiscovery.getAllAgents \
     -d '{"params":{}}'
   ```

## Workflow: Sync Users And Groups

Run this before validating KD access against ingested local documents:

```bash
curl -sS -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/api/v1/automation/Nucleus.Sync.Users.Groups \
  -d '{"params":{}}'
```

A `204 No Content` response is acceptable and means the operation was accepted.

## Workflow: Ingest A Local Nuxeo File Document

1. Accept either:
   - A Nuxeo document UUID
   - A UI URL like `http://localhost:4200/#/doc/<uuid>`

2. Extract the UUID. For `#/doc/<uuid>`, use the final path segment.

3. Validate the document and blob:

   ```bash
   curl -sS -u Administrator:Administrator \
     -H "properties:*" \
     http://localhost:8080/nuxeo/api/v1/id/<document-uuid>
   ```

   Confirm:
   - `type` is usually `File`
   - `properties.file:content` exists for a main file blob
   - `properties.file:content.mime-type` is expected, such as `application/pdf` or `image/png`

4. Trigger ingest for that document:

   ```bash
   curl -sS -u Administrator:Administrator \
     -X POST \
     -H "Content-Type: application/json" \
     http://localhost:8080/nuxeo/api/v1/automation/Bulk.RunAction \
     -d '{
       "params": {
         "action": "ingest",
         "query": "SELECT * FROM Document WHERE ecm:uuid = '\''<document-uuid>'\''"
       }
     }'
   ```

5. Extract `commandId` from the response and poll:

   ```bash
   curl -sS -u Administrator:Administrator \
     http://localhost:8080/nuxeo/api/v1/bulk/<command-id>
   ```

6. Success criteria:
   - `state` is `COMPLETED`
   - `processed` is at least `1`
   - `error` is `false`
   - `errorCount` is `0`

## Workflow: Ingest An Attachment Or Blob

The HxAI connector ingests the Nuxeo document and its configured blob metadata together.

- If the file is already attached to a Nuxeo document, ingest the owning document by UUID.
- If the file is only local, upload or attach it to a Nuxeo document first, then ingest that document.
- For the primary file blob, expect xpath `file:content`.
- For non-primary blob xpaths, confirm the connector configuration includes that xpath before assuming KD can see it.

Validation command for a specific blob:

```bash
curl -sS -u Administrator:Administrator \
  -I \
  http://localhost:8080/nuxeo/api/v1/id/<document-uuid>/@blob/file:content
```

Then run the document ingest workflow.

## Workflow: Upload File To Content Lake

When the user says `upload file to content lake`, do not call Content Lake directly. Use the supported Nuxeo path:

```text
local file -> Nuxeo document/blob -> HxAI ingest -> Content Lake
```

Ask which case applies:

1. `Existing Nuxeo document URL or UUID`
   - Run the local Nuxeo file document ingest workflow.

2. `New local file`
   - Ask for the local file path and target Nuxeo parent folder path, default `/default-domain/workspaces/Narasimha`.
   - Upload/create a Nuxeo `File` document with that blob.
   - Confirm the created document UUID.
   - Run the local Nuxeo file document ingest workflow for the new UUID.

3. `Attach to existing Nuxeo document`
   - Ask for the local file path and target document UUID.
   - Attach the file as `file:content` or the requested blob xpath.
   - Run the local Nuxeo file document ingest workflow for the owning document UUID.

## Workflow: Ingest A Workspace

Only run after a single-document ingest succeeds and the user confirms the scope.

```bash
curl -sS -u Administrator:Administrator \
  -X POST \
  -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/api/v1/automation/Bulk.RunAction \
  -d '{
    "params": {
      "action": "ingest",
      "query": "SELECT * FROM Document WHERE ecm:path STARTSWITH '\''/default-domain/workspaces/Narasimha'\'' AND ecm:primaryType = '\''File'\'' AND ecm:isTrashed = 0"
    }
  }'
```

Poll the returned `commandId` with `/nuxeo/api/v1/bulk/<command-id>`.

## Workflow: Validate KD Retrieval

1. Ask a content-specific question through the configured KD agent:

   ```bash
   curl -sS -u Administrator:Administrator \
     -X POST \
     -H "Content-Type: application/json" \
     http://localhost:8080/nuxeo/api/v1/automation/HylandKnowledgeDiscovery.askQuestionAndGetAnswer \
     -d '{
       "params": {
         "agentId": "<agent-id>",
         "question": "<content-specific-question>"
       }
     }'
   ```

2. Confirm:
   - `responseCode` is `200`
   - `response.answer` contains a grounded answer
   - `response.objectReferences` contains the expected object id

3. Expected object id format:

   ```text
   <content-source-id>__<nuxeo-document-uuid>
   ```

4. If the answer is weak but references are present, retry with a question that uses exact terms from the document title or content.

## Troubleshooting

- `getAllAgents` fails: check `nuxeo.hyland.cic.discovery.*` config and token scope.
- Ingest fails with `401` or `403`: check ingest/Nucleus client, environment key, and content source id.
- Ingest fails with `400`: retry a single document and inspect Nuxeo logs for the rejected payload.
- KD returns no local content: confirm the document was ingested, has embeddings, and the Insight agent is bound to the right content source.
- Content Lake lookup returns `403` for one client but KD works: validate using the KD/Discovery client identity, not only the ingest/Nucleus identity.
- KE `Enrich` returns `403 {"title":"Authorization Error",...}` on `/files/upload/presigned-url`: do NOT chase user-group role grants alone — the Discovery External App's `Application = Content Intelligence Connector` binding produces `appkey: "insight"` tokens that the Context API rejects no matter the roles. Confirm `nuxeo.hyland.cic.enrichment.clientId/clientSecret` point at a separate, Content-Lake-bound External App (`appkey: "content-lake"` token). Decode the JWT and verify `hxp_authorization.appkey == "content-lake"` and `hxp_authorization.permission` contains `cin-context-api.contentprocessing.write` and `content-lake-api.documents.*`. See `docs/knowledge-enrichment.md` section _"KE requires a SEPARATE External Application from Discovery"_.
