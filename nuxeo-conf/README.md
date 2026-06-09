# Nuxeo server configuration fragments

Files in this folder are **Nuxeo server** configuration, not Angular config.
They are meant to be copied into the `nuxeo` docker container at
`/etc/nuxeo/conf.d/` where Nuxeo merges them into the effective `nuxeo.conf`.

## Layout

| File                        | Tracked? | Purpose                                                     |
| --------------------------- | -------- | ----------------------------------------------------------- |
| `50-hyland-cic.sample.conf` | yes      | Template with every property name + safe placeholder values |
| `50-hyland-cic.conf`        | **no**   | Your local copy with real tenant credentials (gitignored)   |

The `.gitignore` allows only `*.sample.conf` to be committed — any file
matching `*.conf` is ignored. Never rename the real file to drop the
`.sample` suffix and commit it.

## Where the values come from

All values (IDP URL, client id/secret, discovery base URL, `hxai-environment`
key) are assigned per HX customer account and documented at:

> Confluence: _Nuxeo → Insight Authentication and Environment for Testing_
> https://hyland.atlassian.net/wiki/spaces/HxAI/pages/1329661828

Treat anything from that page as a secret.

## Applying the config to the running container

```bash
# 1. Copy your edited (untracked) file into the running container.
docker cp nuxeo-conf/50-hyland-cic.conf nuxeo:/etc/nuxeo/conf.d/50-hyland-cic.conf

# 2. Restart Nuxeo so it re-reads conf.d/*.conf.
docker restart nuxeo

# 3. Confirm the config was applied (should print "default").
docker exec nuxeo curl -s -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/site/automation/HylandContentIntelligence.GetContributionNames \
  -d '{"params": {"which": "knowledgeDiscovery"}}'

# 4. Exercise the real Discovery API through the connector.
docker exec nuxeo curl -s -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/site/automation/HylandKnowledgeDiscovery.getAllAgents \
  -d '{"params": {}}'
```

## Knowledge Enrichment config

Knowledge Enrichment uses the same CIC bundle but a different property family
than Knowledge Discovery:

```conf
nuxeo.hyland.cic.contextEnrichment.baseUrl=...
nuxeo.hyland.cic.enrichment.clientId=...
nuxeo.hyland.cic.enrichment.clientSecret=...
nuxeo.hyland.cic.enrichment.auth.scope=environment_authorization
nuxeo.hyland.cic.ingest.baseUrl=...
nuxeo.hyland.cic.ingest.clientId=...
nuxeo.hyland.cic.ingest.clientSecret=...
nuxeo.hyland.cic.ingest.environment=...
```

These values are read from the bundle's `service-enrichment-contrib.xml`.
The `nuxeo.hyland.cic.ingest.*` values are read from
`service-ingest-contrib.xml` and support connector upload/presigned URL flows.

If they are missing, the KE automation op fails with:

```text
No authentication info for calling the Enrichment service.
```

That error means the Angular request shape reached Nuxeo correctly, but the
server does not yet have valid KE credentials/base URL configured.

## Verifying KE from the running container

First confirm the CIC bundle has an active KE contribution:

```bash
docker exec nuxeo curl -s -u Administrator:Administrator \
  -X POST -H "Content-Type: application/json" \
  http://localhost:8080/nuxeo/site/automation/HylandContentIntelligence.GetContributionNames \
  -d '{"params": {"which": "knowledgeEnrichment"}}'
```

Expected result:

```json
{ "knowledgeEnrichment": ["default"] }
```

Then smoke-test the multipart KE op:

```bash
printf 'KE smoke test' >/tmp/ke-sample.txt

curl -sS -u Administrator:Administrator \
  -X POST "http://localhost:8080/nuxeo/site/automation/HylandKnowledgeEnrichment.Enrich" \
  -H "Accept: application/json" \
  -F "request={\"params\":{\"actions\":\"text-summarization\"}};type=application/json" \
  -F "input=@/tmp/ke-sample.txt;type=text/plain"
```

With missing config, the current expected response is the connector error above.
Once KE credentials are configured, this call should return a JSON result from
the Context API instead.

If the response is `{ "responseMessage": "Forbidden", "responseCode": 403 }`
(or the direct probe `scripts/verify-ke-dev-connectivity.sh` prints
`HTTP 403: {"title":"Authorization Error",...}` on the
`/files/upload/presigned-url` step), the service account can authenticate but
its token does not carry the Content-Lake permissions the resource server
checks. Granting roles to its User Group on the _Content Lake_ application
card alone is **not enough** — the External Application's `Application`
binding (the required field in the External Application form) constrains the
token's `appkey`, and a Discovery-bound External App
(`Application = Content Intelligence Connector`, `appkey = "insight"`) cannot
issue a token that carries `cin-context-api.*` or `content-lake-api.*`
permissions. Register a separate KE-only External Application bound to a
Content-Lake-issuing application, point only `nuxeo.hyland.cic.enrichment.*`
at it, and keep Discovery/ingest on the existing one. See
[`../docs/knowledge-enrichment.md`](../docs/knowledge-enrichment.md) section
_"KE requires a SEPARATE External Application from Discovery"_ for the full
walkthrough and a JWT-decoding command that proves the token shape changed.

## Ingesting Nuxeo documents

The CIC labs connector configured here only **queries** Knowledge Discovery.
To actually ship Nuxeo documents into the Content Lake indexes that KD
searches, install the companion `nuxeo-hxai-connector` marketplace package
(different namespace: `hxai.*`). See the **Ingesting Nuxeo documents**
section in [`../docs/knowledge-discovery.md`](../docs/knowledge-discovery.md)
for the one-shot install command and the `hxai.ingest.*` config block.

## Known gotchas

- **Discovery host vs Insight UI host.** `https://discovery.<env>.experience.hyland.com`
  is the API root; the `<env-key>.insight.<env>.ncp.hyland.com` hosts only serve
  the Insight UI (HTML) and will fail every automation call with empty-body
  401/404s.
- **Scopes for the new service-account format.** Clients minted in the Hyland
  Experience Admin Portal (IDs starting with `sc-`, secrets starting with
  `hyx_cs_`) are rejected by the Dev IDP for the connector's baked-in scope
  `hxp hxp.integrations environment_authorization iam.jti-capture` with
  `{"error":"invalid_scope"}`. Set the scope explicitly:

  ```conf
  nuxeo.hyland.cic.discovery.auth.scope=hxp iam.jti-capture
  ```

  The connector surfaces this as
  `No authentication info for calling the Knowledge Discovery service` —
  because the token request returned 400, so `getToken()` returns `null`.

- **KE credentials are separate from KD credentials.** The same CIC bundle can
  talk to both services, but Knowledge Enrichment reads
  `nuxeo.hyland.cic.contextEnrichment.*` and `nuxeo.hyland.cic.enrichment.*`.
  A working Discovery setup alone does not enable KE.

- **KE needs its own External Application, not just its own role grant.** The
  Discovery SA's External App is bound to `Application = Content Intelligence Connector`
  and mints tokens with `appkey: "insight"` — those tokens never carry
  `cin-context-api.*` or `content-lake-api.*` permissions, regardless of what
  user-group roles you grant on the Content Lake application card. The Context
  API's `/files/upload/presigned-url` endpoint will return HTTP 403 with
  `{"title":"Authorization Error",...}` until you point
  `nuxeo.hyland.cic.enrichment.clientId` / `nuxeo.hyland.cic.enrichment.clientSecret`
  at a separate External App bound to a Content-Lake-issuing Application
  (which mints `appkey: "content-lake"` tokens). Same Mapped Service User works
  for both — the binding is per External App, not per user. Full walkthrough
  plus a JWT decode that proves the fix in
  [`../docs/knowledge-enrichment.md`](../docs/knowledge-enrichment.md).

- **Prefer integrations/staging for KE validation.** The linked engineering
  notes in `NXENG-42` describe the older dev KE environment as unstable and
  recommend the integrations/staging path for reliable demos.

- **Agent model compatibility.** If `askQuestionAndGetAnswer` returns
  `Model '...' is not recognized` from the upstream Discovery API, that agent
  was created against a model no longer served on the target environment.
  Re-create the agent in the Insight UI against a supported model (e.g.
  `meta.llama4-scout-17b-instruct-v1:0`).

## Making the mount permanent

The snippet above survives container restarts but is lost on recreation.
To persist across `docker compose down / up`, bind-mount this folder:

```yaml
# docker-compose (excerpt)
services:
  nuxeo:
    volumes:
      - ./nuxeo-conf:/etc/nuxeo/conf.d:ro
```

Nuxeo already loads `/etc/nuxeo/conf.d/*.conf` on startup, so any `*.conf`
file dropped here (sample excluded via ordering) gets merged automatically.
