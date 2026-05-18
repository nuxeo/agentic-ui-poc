#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${NUXEO_CONTAINER:-nuxeo}"
LOCAL_CONF_DIR="${NUXEO_LOCAL_CONF_DIR:-nuxeo-conf}"
LOCAL_CONF_FILE="${LOCAL_CONF_DIR}/50-hyland-kd-dev.conf"

: "${KD_DISCOVERY_CLIENT_ID:?Set KD_DISCOVERY_CLIENT_ID from the Dev service account.}"
: "${KD_DISCOVERY_CLIENT_SECRET:?Set KD_DISCOVERY_CLIENT_SECRET from the Dev service account.}"
: "${HXAI_INGEST_CLIENT_ID:?Set HXAI_INGEST_CLIENT_ID from the Dev service account.}"
: "${HXAI_INGEST_CLIENT_SECRET:?Set HXAI_INGEST_CLIENT_SECRET from the Dev service account.}"

CIC_AUTH_BASE_URL="${CIC_AUTH_BASE_URL:-https://auth.iam.dev.experience.hyland.com/idp}"
KD_DISCOVERY_BASE_URL="${KD_DISCOVERY_BASE_URL:-https://discovery.dev.experience.hyland.com}"
KD_DISCOVERY_AUTH_SCOPE="${KD_DISCOVERY_AUTH_SCOPE:-hxp iam.jti-capture}"
KD_DISCOVERY_ENVIRONMENT="${KD_DISCOVERY_ENVIRONMENT:-hxai-bbdab5ca-fc5e-4c67-8b1a-7ea8da874f22}"
KE_CONTEXT_ENRICHMENT_BASE_URL="${KE_CONTEXT_ENRICHMENT_BASE_URL:-https://knowledge-enrichment.ai.dev.experience.hyland.com/latest/api/context-enrichment}"
KE_ENRICHMENT_CLIENT_ID="${KE_ENRICHMENT_CLIENT_ID:-${KD_DISCOVERY_CLIENT_ID}}"
KE_ENRICHMENT_CLIENT_SECRET="${KE_ENRICHMENT_CLIENT_SECRET:-${KD_DISCOVERY_CLIENT_SECRET}}"
KE_ENRICHMENT_AUTH_SCOPE="${KE_ENRICHMENT_AUTH_SCOPE:-environment_authorization}"

HXAI_INGEST_BASE_URL="${HXAI_INGEST_BASE_URL:-https://ingestion.insight.dev.experience.hyland.com}"
HXAI_INGEST_ENV_KEY="${HXAI_INGEST_ENV_KEY:-${KD_DISCOVERY_ENVIRONMENT}}"
HXAI_INGEST_SOURCE_ID="${HXAI_INGEST_SOURCE_ID:-efffbf29-7d45-47ec-a7f0-7a9c5df8413b}"

CIC_INGEST_BASE_URL="${CIC_INGEST_BASE_URL:-${HXAI_INGEST_BASE_URL}}"
CIC_INGEST_CLIENT_ID="${CIC_INGEST_CLIENT_ID:-${HXAI_INGEST_CLIENT_ID}}"
CIC_INGEST_CLIENT_SECRET="${CIC_INGEST_CLIENT_SECRET:-${HXAI_INGEST_CLIENT_SECRET}}"
CIC_INGEST_ENVIRONMENT="${CIC_INGEST_ENVIRONMENT:-${HXAI_INGEST_ENV_KEY}}"
CIC_INGEST_AUTH_SCOPE="${CIC_INGEST_AUTH_SCOPE:-environment_authorization}"

mkdir -p "${LOCAL_CONF_DIR}"
umask 077

cat > "${LOCAL_CONF_FILE}" <<EOF
# Hyland Knowledge Discovery / Insight Dev configuration.
# Generated locally by scripts/apply-kd-dev-config.sh.
# This directory is gitignored because it contains environment-specific secrets.

nuxeo.hyland.cic.auth.baseUrl=${CIC_AUTH_BASE_URL}
nuxeo.hyland.cic.discovery.baseUrl=${KD_DISCOVERY_BASE_URL}
nuxeo.hyland.cic.discovery.clientId=${KD_DISCOVERY_CLIENT_ID}
nuxeo.hyland.cic.discovery.clientSecret=${KD_DISCOVERY_CLIENT_SECRET}
nuxeo.hyland.cic.discovery.environment=${KD_DISCOVERY_ENVIRONMENT}
nuxeo.hyland.cic.discovery.auth.scope=${KD_DISCOVERY_AUTH_SCOPE}

nuxeo.hyland.cic.contextEnrichment.baseUrl=${KE_CONTEXT_ENRICHMENT_BASE_URL}
nuxeo.hyland.cic.enrichment.clientId=${KE_ENRICHMENT_CLIENT_ID}
nuxeo.hyland.cic.enrichment.clientSecret=${KE_ENRICHMENT_CLIENT_SECRET}
nuxeo.hyland.cic.enrichment.auth.scope=${KE_ENRICHMENT_AUTH_SCOPE}

nuxeo.hyland.cic.ingest.baseUrl=${CIC_INGEST_BASE_URL}
nuxeo.hyland.cic.ingest.clientId=${CIC_INGEST_CLIENT_ID}
nuxeo.hyland.cic.ingest.clientSecret=${CIC_INGEST_CLIENT_SECRET}
nuxeo.hyland.cic.ingest.environment=${CIC_INGEST_ENVIRONMENT}
nuxeo.hyland.cic.ingest.auth.scope=${CIC_INGEST_AUTH_SCOPE}

hxai.ingest.base.url=${HXAI_INGEST_BASE_URL}
hxai.ingest.client.id=${HXAI_INGEST_CLIENT_ID}
hxai.ingest.client.secret=${HXAI_INGEST_CLIENT_SECRET}
hxai.ingest.env.key=${HXAI_INGEST_ENV_KEY}
hxai.ingest.source.id=${HXAI_INGEST_SOURCE_ID}
EOF

docker exec "${CONTAINER}" sh -lc 'rm -f /etc/nuxeo/conf.d/50-hyland-cic.conf /etc/nuxeo/conf.d/50-hyland-kd-dev.conf'
docker cp "${LOCAL_CONF_FILE}" "${CONTAINER}:/tmp/50-hyland-kd-dev.conf"
docker exec --user root "${CONTAINER}" sh -lc 'mv /tmp/50-hyland-kd-dev.conf /etc/nuxeo/conf.d/50-hyland-kd-dev.conf && chown nuxeo:nuxeo /etc/nuxeo/conf.d/50-hyland-kd-dev.conf && chmod 600 /etc/nuxeo/conf.d/50-hyland-kd-dev.conf'
docker exec -i --user root "${CONTAINER}" python3 - <<'PY'
from pathlib import Path

nuxeo_conf = Path("/etc/nuxeo/nuxeo.conf")
kd_conf = Path("/etc/nuxeo/conf.d/50-hyland-kd-dev.conf")
prefixes = ("nuxeo.hyland.cic.", "hxai.ingest.")

lines = nuxeo_conf.read_text(errors="ignore").splitlines()
filtered = [line for line in lines if not line.startswith(prefixes)]
merged = "\n".join(filtered).rstrip() + "\n\n" + kd_conf.read_text().strip() + "\n"
nuxeo_conf.write_text(merged)
PY

if [[ "${NUXEO_RESTART:-1}" == "1" ]]; then
  docker restart "${CONTAINER}" >/dev/null
fi

echo "Knowledge Discovery and Enrichment Dev config applied to ${CONTAINER}."
