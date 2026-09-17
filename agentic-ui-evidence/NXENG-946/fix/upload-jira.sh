#!/usr/bin/env bash
set -euo pipefail
TICKET=NXENG-946
EVID="$(dirname "$0")"
U="$(cat ~/.jira_email):$(cat ~/.jira_token)"
upload() {
  curl -sS --fail-with-body -u "$U" -H "X-Atlassian-Token: no-check" \
    -F "file=@$1;filename=$2" \
    "https://hyland.atlassian.net/rest/api/3/issue/$TICKET/attachments" >/dev/null
  echo "ok $2"
}
cd "$EVID"
upload contact-sheet.png "$TICKET-before-after.png"
upload before/NXENG-946-before.webm "$TICKET-before.webm"
upload after/NXENG-946-after.webm "$TICKET-after.webm"
for half in before after; do
  for f in "$half"/*.png; do
    base=$(basename "${f%.png}" | sed 's/^[0-9]*-//')
    upload "$f" "$TICKET-$half-$base.png"
  done
done
curl -sS --fail-with-body -u "$U" -H "Content-Type: application/json" -X POST \
  "https://hyland.atlassian.net/rest/api/3/issue/$TICKET/remotelink" \
  -d '{"globalId":"github-pr-201","application":{"type":"com.github","name":"GitHub"},"relationship":"fixed by","object":{"url":"https://github.com/nuxeo/agentic-ui-poc/pull/201","title":"PR #201 — fix(NXENG-946): wrap login panel in main landmark"}}'
echo "remote link ok"
