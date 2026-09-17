#!/usr/bin/env bash
set -euo pipefail

: "${KD_DISCOVERY_CLIENT_ID:?Set KD_DISCOVERY_CLIENT_ID from the Dev service account.}"
: "${KD_DISCOVERY_CLIENT_SECRET:?Set KD_DISCOVERY_CLIENT_SECRET from the Dev service account.}"

CIC_AUTH_BASE_URL="${CIC_AUTH_BASE_URL:-https://auth.iam.dev.experience.hyland.com/idp}"
KD_DISCOVERY_BASE_URL="${KD_DISCOVERY_BASE_URL:-https://discovery.dev.experience.hyland.com}"
KD_DISCOVERY_AUTH_SCOPE="${KD_DISCOVERY_AUTH_SCOPE:-hxp iam.jti-capture}"
KD_DISCOVERY_ENVIRONMENT="${KD_DISCOVERY_ENVIRONMENT:-hxai-bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22}"
KD_DISCOVERY_APP="${KD_DISCOVERY_APP:-hxai-discovery}"
HXAI_INGEST_BASE_URL="${HXAI_INGEST_BASE_URL:-https://ingestion.insight.dev.experience.hyland.com}"
NUXEO_BASE_URL="${NUXEO_BASE_URL:-http://localhost:8080/nuxeo}"

export CIC_AUTH_BASE_URL
export KD_DISCOVERY_BASE_URL
export KD_DISCOVERY_AUTH_SCOPE
export KD_DISCOVERY_CLIENT_ID
export KD_DISCOVERY_CLIENT_SECRET
export KD_DISCOVERY_ENVIRONMENT
export KD_DISCOVERY_APP
export HXAI_INGEST_BASE_URL
export NUXEO_BASE_URL
export NUXEO_AUTH="${NUXEO_AUTH:-}"
export VERIFY_INGEST="${VERIFY_INGEST:-0}"
export VERIFY_NUXEO="${VERIFY_NUXEO:-0}"

python3 - <<'PY'
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


def request(method, url, *, headers=None, data=None):
    payload = None
    if data is not None:
        payload = data.encode("utf-8")
    req = urllib.request.Request(url, data=payload, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode("utf-8", errors="replace")
            return res.status, body
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body


def fail(message):
    print(f"FAIL: {message}", file=sys.stderr)
    sys.exit(1)


failures = []


token_url = f"{os.environ['CIC_AUTH_BASE_URL'].rstrip('/')}/connect/token"
form = urllib.parse.urlencode(
    {
        "grant_type": "client_credentials",
        "scope": os.environ["KD_DISCOVERY_AUTH_SCOPE"],
        "client_id": os.environ["KD_DISCOVERY_CLIENT_ID"],
        "client_secret": os.environ["KD_DISCOVERY_CLIENT_SECRET"],
    }
)

status, body = request(
    "POST",
    token_url,
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "agentic-ui-kd-dev-verify/1.0",
    },
    data=form,
)
if status != 200:
    fail(f"token request returned HTTP {status}: {body[:300]}")

token = json.loads(body).get("access_token")
if not token:
    fail("token response did not include access_token")
print("OK: Dev IDP issued an access token.")

common_headers = {
    "Authorization": f"Bearer {token}",
    "Hxp-Environment": os.environ["KD_DISCOVERY_ENVIRONMENT"],
    "Hxp-App": os.environ["KD_DISCOVERY_APP"],
    "User-Agent": "agentic-ui-kd-dev-verify/1.0",
}

agents_url = f"{os.environ['KD_DISCOVERY_BASE_URL'].rstrip('/')}/agent/agents"
status, body = request("GET", agents_url, headers=common_headers)
if status != 200:
    failures.append(f"Knowledge Discovery agent list returned HTTP {status}: {body[:300]}")
else:
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        parsed = body
    agent_count = len(parsed) if isinstance(parsed, list) else len(parsed.get("agents", [])) if isinstance(parsed, dict) else 0
    print(f"OK: Knowledge Discovery agent list reachable ({agent_count} agents reported).")

if os.environ["VERIFY_INGEST"] == "1":
    ingest_url = f"{os.environ['HXAI_INGEST_BASE_URL'].rstrip('/')}/v1/presigned-urls?count=1"
    status, body = request("POST", ingest_url, headers=common_headers)
    if status != 200:
        failures.append(f"Insight ingestion presigned URL request returned HTTP {status}: {body[:300]}")
    else:
        print("OK: Insight ingestion presigned URL endpoint returned HTTP 200.")

if os.environ["VERIFY_NUXEO"] == "1":
    nuxeo_auth = os.environ["NUXEO_AUTH"]
    if ":" not in nuxeo_auth:
        failures.append("VERIFY_NUXEO=1 requires NUXEO_AUTH in username:password format")
        nuxeo_auth = ""
    import base64

    if nuxeo_auth:
        encoded = base64.b64encode(nuxeo_auth.encode("utf-8")).decode("ascii")
        operation_url = f"{os.environ['NUXEO_BASE_URL'].rstrip('/')}/site/automation/HylandKnowledgeDiscovery.getAllAgents"
        status, body = request(
            "POST",
            operation_url,
            headers={
                "Authorization": f"Basic {encoded}",
                "Content-Type": "application/json+nxrequest",
                "Accept": "application/json",
                "X-NXVoidOperation": "false",
                "User-Agent": "agentic-ui-kd-dev-verify/1.0",
            },
            data=json.dumps({"params": {}, "context": {}}),
        )
        if status != 200:
            failures.append(f"Nuxeo KD automation returned HTTP {status}: {body[:300]}")
        else:
            print("OK: Nuxeo KD automation HylandKnowledgeDiscovery.getAllAgents returned HTTP 200.")

if failures:
    for message in failures:
        print(f"FAIL: {message}", file=sys.stderr)
    sys.exit(1)
PY
