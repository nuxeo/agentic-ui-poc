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
```

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
