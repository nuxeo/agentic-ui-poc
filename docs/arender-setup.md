# ARender (Annotations Viewer) Setup Guide

This guide walks through setting up the ARender document viewer for the Annotations tab in the Nuxeo Angular UI.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (localhost:4200)                                       │
│  ┌──────────────────────┐    ┌────────────────────────────────┐ │
│  │  Angular App         │    │  ARender UI (iframe)           │ │
│  │  Annotations Tab     │───▶│  localhost:9080                │ │
│  └──────────┬───────────┘    └────────────────────────────────┘ │
│             │ /nuxeo proxy                                      │
└─────────────┼───────────────────────────────────────────────────┘
              │
   ┌──────────▼──────────┐
   │  Nuxeo Server       │  ◀─── host port 8080
   │  localhost:8080      │
   └──────────▲──────────┘
              │
┌─────────────┼───────────────────── Docker (nuxeo-net) ──────────┐
│  ┌──────────┴──────────┐                                        │
│  │  nginx auth-proxy   │  Adds Basic Auth header to all         │
│  │  (nuxeo-auth-proxy) │  /nuxeo/* requests toward Nuxeo        │
│  └──────────▲──────────┘                                        │
│             │                                                   │
│  ┌──────────┴──────────┐    ┌──────────────────────────────┐    │
│  │  ARender UI         │───▶│  Document Service Broker     │    │
│  │  (arender-ui:8080)  │    │  (dsb-service:8761)          │    │
│  └─────────────────────┘    └──────────┬───────────────────┘    │
│                                        │                        │
│                    ┌───────────────────┬┴──────────────────┐    │
│                    │                   │                    │    │
│             ┌──────▼──────┐  ┌────────▼───────┐  ┌────────▼──┐ │
│             │  Renderer   │  │  Text Handler  │  │  Converter│ │
│             │  (drn:9091) │  │  (dth:8899)    │  │  (dcv:…)  │ │
│             └─────────────┘  └────────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**How it works:**

1. The Angular app constructs an ARender URL: `http://localhost:9080/?url=<nxfile-url>`
2. The `nxfile-url` points to the nginx auth-proxy inside Docker: `http://nuxeo-auth-proxy/nuxeo/nxfile/default/{docUid}/file:content`
3. ARender's `DefaultURLParser` picks up the `url` parameter and asks the service broker to fetch it
4. The service broker downloads the blob through the nginx proxy, which injects Basic Auth credentials
5. The service broker hands the blob to the rendition microservices for processing
6. ARender renders the document with full annotation support

## Prerequisites

- **Docker Desktop** (with Docker Compose v2)
- **Nuxeo Server** running on `localhost:8080`
- Access to the Nuxeo private Docker registry (`docker-private-arondor-proxy.packages.nuxeo.com`)

## Step 1: Log in to the Docker Registry

```bash
docker login docker-private-arondor-proxy.packages.nuxeo.com
```

Use your Nuxeo Online Services credentials. If you don't have access, contact your Nuxeo administrator.

## Step 2: Create the Docker Network

ARender containers communicate over a shared Docker network. Create it once:

```bash
docker network create nuxeo-net
```

## Step 3: Configure Nuxeo Credentials

The nginx auth-proxy injects Basic Auth when ARender fetches blobs from Nuxeo. Credentials are loaded from the `NUXEO_BASIC_AUTH` variable in `.env.arender` — **never hardcoded in config files**.

The default value in `.env.arender` is `QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y` (base64 for `Administrator:Administrator`). To use different credentials:

```bash
echo -n "username:password" | base64
```

Then update `.env.arender`:

```
NUXEO_BASIC_AUTH=<your-base64-output>
```

For example, for `john:s3cret`:

```bash
echo -n "john:s3cret" | base64
# Output: am9objpzM2NyZXQ=
```

Then set `NUXEO_BASIC_AUTH=am9objpzM2NyZXQ=` in `.env.arender`.

## Step 4: Verify Nuxeo Port

The proxy forwards requests to `host.docker.internal:8080`. If your Nuxeo runs on a different port, update `nginx-arender-proxy.conf`:

```nginx
proxy_pass http://host.docker.internal:<YOUR_PORT>/nuxeo/;
proxy_set_header Host host.docker.internal:<YOUR_PORT>;
```

## Step 5: Start the ARender Stack

From the project root:

```bash
docker compose -f arender-docker-compose.yml --env-file .env.arender up -d
```

Wait ~20 seconds for all services to initialize. Verify everything is running:

```bash
docker compose -f arender-docker-compose.yml --env-file .env.arender ps
```

You should see 6 containers: `nuxeo-auth-proxy`, `arender-ui`, `dsb-service`, `drn-service`, `dth-service`, `dcv-service`.

## Step 6: Verify the Setup

1. **Check ARender UI** — open http://localhost:9080 in a browser. You should see the ARender viewer (it will show a default demo PDF if no document is specified).

2. **Check nginx proxy** — from inside a container:

   ```bash
   docker exec arender-ui wget -q -O /dev/null --server-response \
     "http://nuxeo-auth-proxy/nuxeo/api/v1/me" 2>&1 | head -5
   ```

   You should see `HTTP/1.1 200`.

3. **Check the Annotations tab** — navigate to any document in the Angular app (`http://localhost:4200/doc/<uid>`) and click the **Annotations** tab. The document should render inside the ARender viewer.

## Stopping the Stack

```bash
docker compose -f arender-docker-compose.yml --env-file .env.arender down
```

Add `-v` to also remove the temporary rendition volume:

```bash
docker compose -f arender-docker-compose.yml --env-file .env.arender down -v
```

## Troubleshooting

### ARender shows the default "ARender.pdf" demo document

The service broker can't fetch the blob. Check:

1. **nginx proxy is running:** `docker ps | grep nuxeo-auth-proxy`
2. **Nuxeo is reachable from Docker:**
   ```bash
   docker exec dsb-service wget -q -O /dev/null --server-response \
     "http://nuxeo-auth-proxy/nuxeo/api/v1/me" 2>&1
   ```
3. **Credentials are correct** in `nginx-arender-proxy.conf`
4. **Service broker whitelist** — `dsb-service` must have `AUTHORIZED_URLS=http://nuxeo-auth-proxy/` in its environment

### "Could not open document" error in ARender

Check the service broker logs:

```bash
docker logs dsb-service 2>&1 | grep -i "error\|forbidden"
```

- **"Forbidden path"** — The `authorized.urls` whitelist doesn't include the proxy URL. Ensure the `AUTHORIZED_URLS` and `authorized.urls` env vars are set on the `service-broker` service in the compose file.

### "Annotations are not available for this document"

The Angular app couldn't construct a blob URL for this document type. ARender annotations are only available for documents with a `file:content` blob (PDFs, Office files, images, etc.). Note-type documents don't have blobs and won't show the ARender viewer.

### Platform mismatch warnings (arm64 / amd64)

The ARender Docker images are built for `linux/amd64`. On Apple Silicon (M1/M2/M3), Docker Desktop runs them under Rosetta emulation. The warnings are cosmetic — the containers work correctly, though slightly slower than native.

### Port conflicts

| Service        | Default Port | Override                                   |
| -------------- | ------------ | ------------------------------------------ |
| ARender UI     | 9080 (host)  | Change `ports` in compose for `ui`         |
| Service Broker | 8761         | Change `ports` for `service-broker`        |
| Renderer       | 9091         | Change `ports` for `document-renderer`     |
| Text Handler   | 8899         | Change `ports` for `document-text-handler` |
| Converter      | 19999        | Change `ports` for `document-converter`    |

If you change the ARender UI port, also update the `ARENDER_CONFIG` provider in the Angular app (see below).

## Angular Configuration

The `ARENDER_CONFIG` injection token in `libs/shared/nuxeo-client/src/lib/arender.config.ts` controls the ARender URLs:

| Property           | Default                         | Description                             |
| ------------------ | ------------------------------- | --------------------------------------- |
| `viewerOrigin`     | `http://localhost:9080`         | ARender UI URL as seen by the browser   |
| `nuxeoInternalUrl` | `http://nuxeo-auth-proxy/nuxeo` | Nuxeo URL as seen by ARender containers |

Override in `app.config.ts` if needed:

```typescript
import { ARENDER_CONFIG } from '@agentic-ui/shared/nuxeo-client';

{
  provide: ARENDER_CONFIG,
  useValue: {
    viewerOrigin: 'http://localhost:9090',        // custom ARender port
    nuxeoInternalUrl: 'http://nuxeo-auth-proxy/nuxeo',
  },
}
```

## File Reference

| File                         | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `arender-docker-compose.yml` | Docker Compose for all ARender + nginx proxy services |
| `.env.arender`               | ARender image version                                 |
| `nginx-arender-proxy.conf`   | Nginx config that injects Basic Auth for Nuxeo        |
