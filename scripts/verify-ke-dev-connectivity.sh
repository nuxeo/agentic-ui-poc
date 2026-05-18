#!/usr/bin/env bash
set -euo pipefail

: "${KE_ENRICHMENT_CLIENT_ID:?Set KE_ENRICHMENT_CLIENT_ID from the Dev Context API service account.}"
: "${KE_ENRICHMENT_CLIENT_SECRET:?Set KE_ENRICHMENT_CLIENT_SECRET from the Dev Context API service account.}"

CIC_AUTH_BASE_URL="${CIC_AUTH_BASE_URL:-https://auth.iam.dev.experience.hyland.com/idp}"
KE_CONTEXT_ENRICHMENT_BASE_URL="${KE_CONTEXT_ENRICHMENT_BASE_URL:-https://knowledge-enrichment.ai.dev.experience.hyland.com/latest/api/context-enrichment}"
KE_ENRICHMENT_AUTH_SCOPE="${KE_ENRICHMENT_AUTH_SCOPE:-environment_authorization}"
KE_CONTENT_TYPE="${KE_CONTENT_TYPE:-image/png}"
NUXEO_BASE_URL="${NUXEO_BASE_URL:-http://localhost:8080/nuxeo}"

export CIC_AUTH_BASE_URL
export KE_CONTEXT_ENRICHMENT_BASE_URL
export KE_ENRICHMENT_AUTH_SCOPE
export KE_ENRICHMENT_CLIENT_ID
export KE_ENRICHMENT_CLIENT_SECRET
export KE_CONTENT_TYPE
export NUXEO_BASE_URL
export NUXEO_AUTH="${NUXEO_AUTH:-}"
export VERIFY_NUXEO="${VERIFY_NUXEO:-0}"
export KE_SAMPLE_FILE="${KE_SAMPLE_FILE:-}"
export KE_SAMPLE_MIME_TYPE="${KE_SAMPLE_MIME_TYPE:-text/plain}"
export KE_SAMPLE_ACTIONS="${KE_SAMPLE_ACTIONS:-text-summarization}"

python3 - <<'PY'
import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


def request(method, url, *, headers=None, data=None):
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode("utf-8", errors="replace")
            return res.status, body
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body


failures = []
token_url = f"{os.environ['CIC_AUTH_BASE_URL'].rstrip('/')}/connect/token"
form = urllib.parse.urlencode(
    {
        "grant_type": "client_credentials",
        "scope": os.environ["KE_ENRICHMENT_AUTH_SCOPE"],
        "client_id": os.environ["KE_ENRICHMENT_CLIENT_ID"],
        "client_secret": os.environ["KE_ENRICHMENT_CLIENT_SECRET"],
    }
).encode("utf-8")

status, body = request(
    "POST",
    token_url,
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "agentic-ui-ke-dev-verify/1.0",
    },
    data=form,
)
if status != 200:
    print(f"FAIL: token request returned HTTP {status}: {body[:300]}", file=sys.stderr)
    sys.exit(1)

token = json.loads(body).get("access_token")
if not token:
    print("FAIL: token response did not include access_token", file=sys.stderr)
    sys.exit(1)
print("OK: Dev IDP issued a KE access token.")

content_type = urllib.parse.quote(os.environ["KE_CONTENT_TYPE"], safe="")
presigned_url = (
    f"{os.environ['KE_CONTEXT_ENRICHMENT_BASE_URL'].rstrip('/')}"
    f"/files/upload/presigned-url?contentType={content_type}"
)
status, body = request(
    "GET",
    presigned_url,
    headers={
        "Authorization": f"Bearer {token}",
        "Accept": "*/*",
        "User-Agent": "agentic-ui-ke-dev-verify/1.0",
    },
)
if status != 200:
    failures.append(
        f"Context Enrichment presigned URL returned HTTP {status}: {body[:300]}"
    )
else:
    print("OK: Context Enrichment presigned URL endpoint returned HTTP 200.")

if os.environ["VERIFY_NUXEO"] == "1":
    nuxeo_auth = os.environ["NUXEO_AUTH"]
    if ":" not in nuxeo_auth:
        failures.append("VERIFY_NUXEO=1 requires NUXEO_AUTH in username:password format")
    else:
        encoded = base64.b64encode(nuxeo_auth.encode("utf-8")).decode("ascii")
        operation_url = (
            f"{os.environ['NUXEO_BASE_URL'].rstrip('/')}"
            "/site/automation/HylandContentIntelligence.GetContributionNames"
        )
        status, body = request(
            "POST",
            operation_url,
            headers={
                "Authorization": f"Basic {encoded}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "agentic-ui-ke-dev-verify/1.0",
            },
            data=json.dumps({"params": {"which": "knowledgeEnrichment"}}).encode("utf-8"),
        )
        if status != 200:
            failures.append(f"Nuxeo KE contribution check returned HTTP {status}: {body[:300]}")
        elif "knowledgeEnrichment" not in body:
            failures.append(f"Nuxeo KE contribution response did not include knowledgeEnrichment: {body[:300]}")
        else:
            print("OK: Nuxeo exposes a Knowledge Enrichment contribution.")

if failures:
    for message in failures:
        print(f"FAIL: {message}", file=sys.stderr)
    sys.exit(1)
PY

if [[ "${VERIFY_NUXEO}" == "1" ]]; then
  if [[ -z "${NUXEO_AUTH}" || "${NUXEO_AUTH}" != *:* ]]; then
    exit 1
  fi

  sample_file="${KE_SAMPLE_FILE}"
  cleanup_sample=0
  if [[ -z "${sample_file}" ]]; then
    sample_file="$(mktemp)"
    cleanup_sample=1
    printf 'Knowledge Enrichment smoke test document.' > "${sample_file}"
  fi

  response_file="$(mktemp)"
  trap 'rm -f "${response_file}"; if [[ "${cleanup_sample}" == "1" ]]; then rm -f "${sample_file}"; fi' EXIT

  status="$(
    curl -sS -o "${response_file}" -w '%{http_code}' \
      -u "${NUXEO_AUTH}" \
      -X POST "${NUXEO_BASE_URL%/}/site/automation/HylandKnowledgeEnrichment.Enrich" \
      -H "Accept: application/json" \
      -F "request={\"params\":{\"actions\":\"${KE_SAMPLE_ACTIONS}\"}};type=application/json" \
      -F "input=@${sample_file};type=${KE_SAMPLE_MIME_TYPE}"
  )"

  if [[ "${status}" != "200" ]]; then
    echo "FAIL: Nuxeo KE automation returned HTTP ${status}: $(<"${response_file}")" >&2
    exit 1
  fi

  python3 - "${response_file}" <<'PY'
import json
import sys

body = open(sys.argv[1], encoding="utf-8", errors="replace").read()
try:
    parsed = json.loads(body or "{}")
except json.JSONDecodeError:
    print(f"FAIL: Nuxeo KE automation returned non-JSON: {body[:300]}", file=sys.stderr)
    sys.exit(1)

code = parsed.get("responseCode", 200)
if isinstance(code, int) and (code < 200 or code >= 300):
    print(f"FAIL: Nuxeo KE automation responseCode={code}: {body[:300]}", file=sys.stderr)
    sys.exit(1)

print("OK: Nuxeo KE automation HylandKnowledgeEnrichment.Enrich returned a success response.")
PY
fi
