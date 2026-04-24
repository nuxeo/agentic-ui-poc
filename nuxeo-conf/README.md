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
