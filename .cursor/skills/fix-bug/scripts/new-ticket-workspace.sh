#!/usr/bin/env bash
#
# Create (or tear down) an isolated workspace for one bug-fix ticket.
#
#   new-ticket-workspace.sh <TICKET-ID> [--branch <name>]
#   new-ticket-workspace.sh <TICKET-ID> --remove [--force]
#
# A workspace is: its own git worktree, its own dev-server port, its own proxy
# config, and its own Nuxeo data root at /default-domain/workspaces/<TICKET>. Two
# agents can therefore work two tickets at once without fighting over HEAD, the
# stash stack, or a port.
#
# What is *shared* by default, and deliberately:
#   - node_modules is hardlinked from the primary checkout when the lockfile
#     matches. Those are the same inodes, so never `npm install` in a workspace.
#   - Nuxeo is the long-lived `nuxeo` container; the per-ticket data root is the
#     isolation. An extra container costs ~2 GB of RAM. Pass `--nuxeo own` for a
#     dedicated, freshly pulled one when the ticket needs a different package set
#     or server config, a clean instance, a specific version, or destructive ops.
#
# Options:
#   --branch <name>   create/checkout this branch in the worktree (default: fix/<ticket-slug>)
#   --remove          tear the workspace down (container, worktree, ports). Keeps the evidence.
#   --force           with --remove, discard uncommitted work in the worktree
#   --no-install      skip `npm ci` in the worktree (you will have no node_modules)
#   --image <ref>     Nuxeo image to run (default: the image the shared `nuxeo` container runs)
#   --help
#
# Idempotent: re-running prints the existing workspace's env.sh rather than rebuilding.
# Source the printed env.sh, then run every later command from $NX_WT.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
WORKTREE_ROOT="${AGENTIC_UI_WORKTREE_ROOT:-$HOME/Desktop/Projects/agentic-ui-worktrees}"
EVIDENCE_ROOT="${AGENTIC_UI_EVIDENCE_DIR:-$HOME/Desktop/agentic-ui-evidence}"
SHARED_CONTAINER="${AGENTIC_UI_SHARED_NUXEO:-nuxeo}"
SHARED_NETWORK="${AGENTIC_UI_NUXEO_NETWORK:-nuxeo-net}"

die() { echo "error: $*" >&2; exit 1; }
note() { echo "  $*"; }

usage() {
  cat <<'USAGE'
Create (or tear down) an isolated workspace for one bug-fix ticket.

  new-ticket-workspace.sh <TICKET-ID> [--branch <name>]
  new-ticket-workspace.sh <TICKET-ID> --remove [--force]

  --branch <name>   create/checkout this branch (default: fix/<ticket-slug>)
  --nuxeo shared    reuse the shared `nuxeo` container, with a per-ticket data root (default)
  --nuxeo own       run a dedicated freshly pulled container for this ticket
  --image <ref>     Nuxeo image for --nuxeo own (default: the shared container's image)
  --no-pull         with --nuxeo own, reuse the local image instead of pulling the latest
  --remove          tear down container + worktree. Keeps the evidence.
  --force           with --remove, discard uncommitted work
  --no-install      skip node_modules setup in the worktree

Use --nuxeo own when the bug needs a different package set or server config, a clean or
empty instance, a specific Nuxeo version, or destructive operations (trash purge, reindex,
admin settings). Otherwise share: an extra container costs ~2 GB of RAM, and containers
accumulate.
USAGE
}

# ---------------------------------------------------------------- arguments

[[ $# -ge 1 ]] || { usage; exit 2; }
case "${1:-}" in -h|--help) usage; exit 0 ;; esac

TICKET="$1"; shift
[[ "$TICKET" =~ ^[A-Za-z]+-[0-9]+$ ]] || die "ticket id must look like NXSAT-123, got '$TICKET'"

BRANCH=""; REMOVE=0; FORCE=0; INSTALL=1; IMAGE=""; NUXEO_MODE="shared"; PULL=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)     BRANCH="${2:?--branch needs a value}"; shift 2 ;;
    --image)      IMAGE="${2:?--image needs a value}"; shift 2 ;;
    --nuxeo)      NUXEO_MODE="${2:?--nuxeo needs shared|own}"; shift 2 ;;
    --remove)     REMOVE=1; shift ;;
    --force)      FORCE=1; shift ;;
    --no-install) INSTALL=0; shift ;;
    --no-pull)    PULL=0; shift ;;
    -h|--help)    usage; exit 0 ;;
    *)            die "unknown option '$1'" ;;
  esac
done
[[ "$NUXEO_MODE" == "shared" || "$NUXEO_MODE" == "own" ]] || die "--nuxeo must be 'shared' or 'own', got '$NUXEO_MODE'"

SLUG="$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')"
WT="$WORKTREE_ROOT/$TICKET"
CONTAINER="nx-$SLUG"
EVID="$EVIDENCE_ROOT/$TICKET/fix"
BRANCH="${BRANCH:-fix/$SLUG}"

# ---------------------------------------------------------------- teardown

if [[ $REMOVE -eq 1 ]]; then
  echo "Tearing down workspace for $TICKET"

  # Refuse *before* destroying anything. This used to remove the container and its indices
  # first and only then check the worktree, so `--remove` on dirty work killed the live server
  # and the repro state and then aborted — the opposite of the promise that work survives
  # without `--force`.
  if [[ -d "$WT" ]] && [[ $FORCE -eq 0 ]] && [[ -n "$(git -C "$WT" status --porcelain 2>/dev/null)" ]]; then
    die "$WT has uncommitted changes. Commit them, or re-run with --force to discard. Nothing was removed."
  fi

  if docker ps -aq -f "name=^${CONTAINER}$" | grep -q .; then
    docker rm -f "$CONTAINER" >/dev/null
    note "removed container $CONTAINER"

    # The container is gone but its indices are not: they live in the shared OpenSearch node
    # and would accumulate one pair per ticket forever. Deleted by exact name — the ticket id
    # is regex-validated above, so this can never widen into the shared `nuxeo-projectnos`.
    for idx in "nuxeo-$SLUG" "nuxeo-$SLUG-audit"; do
      code="$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "http://localhost:9200/$idx" || true)"
      [[ "$code" == "200" ]] && note "removed index $idx"
    done
  else
    note "no container $CONTAINER"
  fi

  if [[ -d "$WT" ]]; then
    git -C "$REPO_ROOT" worktree remove --force "$WT"
    git -C "$REPO_ROOT" worktree prune
    note "removed worktree $WT"
  else
    note "no worktree $WT"
  fi

  rmdir "$WORKTREE_ROOT" 2>/dev/null || true
  echo "Done. Evidence kept at $EVID"
  exit 0
fi

# ---------------------------------------------------------------- preflight

command -v docker >/dev/null || die "docker not found on PATH"
docker info >/dev/null 2>&1 || die "Docker is not running — start Docker Desktop and retry"

shared_env() { docker inspect "$SHARED_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null; }

if [[ "$NUXEO_MODE" == "own" ]]; then
  # Reuse the shared instance's image and licence so package download works. The CLID is a
  # secret: read at run time, passed straight to `docker run`, never written to disk and
  # never echoed.
  if [[ -z "$IMAGE" ]]; then
    IMAGE="$(docker inspect "$SHARED_CONTAINER" --format '{{.Config.Image}}' 2>/dev/null || true)"
    [[ -n "$IMAGE" ]] || die "cannot read the image from container '$SHARED_CONTAINER'; pass --image <ref>"
  fi
  CLID="$(shared_env | sed -n 's/^NUXEO_CLID=//p' | head -1)"
  PACKAGES="$(shared_env | sed -n 's/^NUXEO_PACKAGES=//p' | head -1)"
  [[ -n "$CLID" ]] || die "no NUXEO_CLID on '$SHARED_CONTAINER' — package download fails with 'Registration required'"
  # No fallback package list. This app talks to the REST API, so the base platform is enough;
  # inventing a default here would install packages the ticket did not ask for and make the
  # throwaway instance differ from the shared one in a way the evidence would not record.
  # Pass --image and set NUXEO_PACKAGES on the shared container if a ticket needs more.
else
  docker ps -q -f "name=^${SHARED_CONTAINER}$" | grep -q . \
    || die "shared container '$SHARED_CONTAINER' is not running. Start it, or use --nuxeo own."
fi

# ---------------------------------------------------------------- free ports

free_port() {
  local p="$1"
  while lsof -iTCP:"$p" -sTCP:LISTEN -t >/dev/null 2>&1; do p=$((p + 1)); done
  echo "$p"
}

if [[ "$NUXEO_MODE" == "own" ]]; then
  NX_PORT="$(free_port 8090)"
else
  NX_PORT="$(docker port "$SHARED_CONTAINER" 8080/tcp 2>/dev/null | head -1 | sed 's/.*://')"
  [[ -n "$NX_PORT" ]] || die "cannot read the published port of '$SHARED_CONTAINER'"
fi
# Reuse the port this workspace was created with. Allocating a free one on every run meant
# that re-running while the dev server was listening moved the port to the next free one and
# rewrote env.sh, so the evidence commands then targeted a port with nothing behind it — the
# advertised idempotent reuse quietly broke exactly when the workspace was in use.
APP_PORT="$( [[ -f "$WT/env.sh" ]] && sed -n 's/^export NX_APP_PORT="\([0-9]*\)".*/\1/p' "$WT/env.sh" | head -1 )"
[[ -n "${APP_PORT:-}" ]] || APP_PORT="$(free_port 4210)"

# ---------------------------------------------------------------- worktree

mkdir -p "$WORKTREE_ROOT" "$EVID"

if [[ -d "$WT" ]]; then
  note "worktree already exists at $WT — reusing"
else
  git -C "$REPO_ROOT" fetch origin main --quiet
  if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git -C "$REPO_ROOT" worktree add "$WT" "$BRANCH" >/dev/null
  else
    git -C "$REPO_ROOT" worktree add -b "$BRANCH" "$WT" origin/main >/dev/null
  fi
  note "worktree $WT on branch $BRANCH"
fi

# node_modules is 920 MB across ~66k files here, and `npm ci` takes minutes. When the
# worktree's lockfile matches the primary checkout's, the dependency tree is by definition
# identical, so hardlink it instead: rsync --link-dest shares inodes, which costs no extra
# disk and finishes in seconds. Verified on macOS by comparing inodes, not assumed.
#
# Hardlinks, not a symlink: `npm ci` deletes node_modules before rewriting it, and through a
# symlink that would delete the primary checkout's copy.
if [[ $INSTALL -eq 1 ]] && [[ ! -d "$WT/node_modules" ]]; then
  if [[ -d "$REPO_ROOT/node_modules" ]] \
     && cmp -s "$REPO_ROOT/package-lock.json" "$WT/package-lock.json"; then
    note "lockfile matches the primary checkout — hardlinking node_modules (no extra disk)…"
    if rsync -a --link-dest="$REPO_ROOT/node_modules/" \
             "$REPO_ROOT/node_modules/" "$WT/node_modules/"; then
      note "node_modules hardlinked from $REPO_ROOT"
      LINKED_MODULES=1
      # Evidence capture needs Playwright, and a hardlinked tree is the one place you must
      # not `npm install`. Catch it here, while the fix is to run one command in the primary
      # checkout — not at the capture step, with the repro already set up.
      if [[ ! -d "$WT/node_modules/@playwright/test" ]]; then
        note "WARNING: Playwright is missing. Install it in the PRIMARY checkout, then re-create:"
        note "  (cd '$REPO_ROOT' && npm install --no-save @playwright/test && npx playwright install chromium)"
        note "  bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh $TICKET --remove --force"
        note "  bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh $TICKET"
      fi
    else
      note "hardlink failed — falling back to npm ci"
      (cd "$WT" && npm ci)
    fi
  else
    note "lockfile differs (or no primary node_modules) — running npm ci (~1 GB, minutes)…"
    (cd "$WT" && npm ci)
  fi
fi

# ---------------------------------------------------------------- nuxeo

# No credential defaults. Falling back to Administrator meant the data root was created with
# privileged credentials whenever the variables were unset, which the repo's env-only rule
# exists to prevent — and it hid a misconfigured environment behind a working command.
[[ -n "${NUXEO_USER:-}" && -n "${NUXEO_PASS:-}" ]] || die "NUXEO_USER and NUXEO_PASS must be set (no default). For a local dev instance: export NUXEO_USER=Administrator NUXEO_PASS=Administrator"

DATA_ROOT="/default-domain/workspaces/$TICKET"

if [[ "$NUXEO_MODE" == "own" ]]; then
  # Ticket-scoped OpenSearch indices. A dedicated container still reuses the shared
  # `nuxeo-opensearch` node — a second node costs 512 MB+ — but it must never write to the
  # shared instance's indices, so every index name is namespaced by ticket.
  mkdir -p "$WT/.nuxeo-conf"
  shopt -s nullglob
  for f in "$REPO_ROOT"/nuxeo-conf/*.conf; do cp "$f" "$WT/.nuxeo-conf/"; done
  shopt -u nullglob

  # The `99-` prefix is load-bearing. Nuxeo concatenates conf.d/*.conf in filename order and
  # the last occurrence of a key wins, so this file must sort after the repo's `90-staging-
  # services.conf`, which sets the shared `nuxeo-projectnos` index names. Verified by reading
  # the effective nuxeo.conf inside a running container: both values are present, ours last.
  cat > "$WT/.nuxeo-conf/99-ticket-$SLUG.conf" <<EOF
# Generated by new-ticket-workspace.sh for $TICKET — do not edit by hand.
# Namespaced so this throwaway instance cannot touch the shared instance's indices.
nuxeo.opensearch2.client.server=http://nuxeo-opensearch:9200
nuxeo.search.client.default.opensearch2.index.name=nuxeo-$SLUG
nuxeo.search.client.default.opensearch2.settings.numberOfReplicas=0
nuxeo.search.client.default.opensearch2.settings.numberOfShards=1
nuxeo.audit.backend.default.opensearch2.index.name=nuxeo-$SLUG-audit
nuxeo.audit.backend.default.opensearch2.settings.numberOfReplicas=0
nuxeo.audit.backend.default.opensearch2.settings.numberOfShards=1
EOF

  # Running, stopped and absent are three different states. Matching them all with `docker ps
  # -aq` reported a stopped container as a ready workspace, because the readiness check only
  # ran on the newly-created path.
  if docker ps -q -f "name=^${CONTAINER}$" | grep -q .; then
    note "container $CONTAINER already running — reusing"
    NX_PORT="$(docker port "$CONTAINER" 8080/tcp | head -1 | sed 's/.*://')"
  elif docker ps -aq -f "name=^${CONTAINER}$" | grep -q .; then
    note "container $CONTAINER exists but is stopped — starting it"
    docker start "$CONTAINER" >/dev/null
    NX_PORT="$(docker port "$CONTAINER" 8080/tcp | head -1 | sed 's/.*://')"
  else
    # Pulling dominates the cost: a measured `--nuxeo own` workspace took 6m26s, of which
    # ~5m was this one line against a three-month-old local image. Still the default, because
    # the digest below is only meaningful if it is current — `--no-pull` opts out knowingly.
    if [[ $PULL -eq 1 ]]; then
      note "pulling the latest build of ${IMAGE}… (minutes; --no-pull reuses the local image)"
      docker pull "$IMAGE" >/dev/null
    else
      note "--no-pull: reusing the local ${IMAGE}"
    fi
    DIGEST="$(docker inspect "$IMAGE" --format '{{index .RepoDigests 0}}' 2>/dev/null || echo "$IMAGE")"
    echo "$DIGEST" > "$EVID/nuxeo-image.txt"
    note "image digest recorded in $EVID/nuxeo-image.txt"

    # Creating the network when it is missing does not help: the generated conf points at
    # `http://nuxeo-opensearch:9200`, and an empty network has no such host, so Nuxeo would
    # boot and never become ready. Fail with setup guidance instead of starting something
    # that cannot work.
    docker network inspect "$SHARED_NETWORK" >/dev/null 2>&1 \
      || die "docker network '$SHARED_NETWORK' does not exist. The dedicated container needs it to reach OpenSearch. Start the shared dev stack first, or create the network and attach an OpenSearch container named 'nuxeo-opensearch'."
    docker network inspect "$SHARED_NETWORK" --format '{{range .Containers}}{{.Name}} {{end}}' \
      | grep -q 'nuxeo-opensearch' \
      || die "no 'nuxeo-opensearch' container is attached to network '$SHARED_NETWORK'. The generated conf points at http://nuxeo-opensearch:9200, so Nuxeo would never become ready. Start it before using --nuxeo own."

    docker run -d --name "$CONTAINER" \
      --network "$SHARED_NETWORK" \
      -p "$NX_PORT:8080" \
      -e NUXEO_DEV_MODE=true \
      -e NUXEO_PACKAGES="$PACKAGES" \
      -e NUXEO_CLID="$CLID" \
      -v "$WT/.nuxeo-conf:/etc/nuxeo/conf.d:ro" \
      "$IMAGE" >/dev/null
    note "started $CONTAINER on http://localhost:$NX_PORT/nuxeo"
  fi

  # One readiness check for every path — created, started, or already running — and it must
  # be able to fail. The old loop ran only after `docker run` and had no check after its
  # timeout, so a Nuxeo that never came up was still announced as a ready workspace.
  printf '  waiting for Nuxeo on :%s' "$NX_PORT"
  ready=0
  for _ in $(seq 1 120); do
    if [[ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$NX_PORT/nuxeo/runningstatus" || true)" == "200" ]]; then
      ready=1; echo " — up"; break
    fi
    printf '.'; sleep 5
  done
  [[ $ready -eq 1 ]] || die "Nuxeo on :$NX_PORT did not become ready within 10 minutes. Check 'docker logs $CONTAINER'."
else
  # Sharing the instance costs nothing and starts instantly, but two tickets writing into the
  # same tree trip over each other's documents. A per-ticket workspace keeps the data apart
  # without a second JVM. It is created once and left behind — it is cheap, and deleting it
  # would destroy a repro another agent may still need.
  docker inspect "$SHARED_CONTAINER" --format '{{.Config.Image}}' > "$EVID/nuxeo-image.txt" 2>/dev/null || true
  note "sharing container $SHARED_CONTAINER on http://localhost:$NX_PORT/nuxeo"
fi

# The data root belongs to both modes. It used to live inside the shared branch only, while
# `env.sh` advertised `NX_DATA_ROOT` in both — so under `--nuxeo own` every seeding or
# navigation step pointed at a document that was never created.
#
# Check before creating: Nuxeo does **not** reject a duplicate name. It auto-renames the new
# document (`NXSAT-123.1789367579996`) and returns 201, so a `409` branch never fires and
# every re-run would leave another workspace behind. Measured — three accumulated before this
# check existed.
api="http://localhost:$NX_PORT/nuxeo/api/v1/path/default-domain/workspaces"
exists="$(curl -s -o /dev/null -w '%{http_code}' -u "$NUXEO_USER:$NUXEO_PASS" "$api/$TICKET" || true)"
if [[ "$exists" == "200" ]]; then
  note "data root $DATA_ROOT already exists — reusing"
else
  code="$(curl -s -o /dev/null -w '%{http_code}' -u "$NUXEO_USER:$NUXEO_PASS" \
    -H 'Content-Type: application/json' -X POST "$api" \
    -d "{\"entity-type\":\"document\",\"name\":\"$TICKET\",\"type\":\"Workspace\",\"properties\":{\"dc:title\":\"$TICKET — agent workspace\"}}" || true)"
  case "$code" in
    201) note "created data root $DATA_ROOT" ;;
    *)   note "could not create $DATA_ROOT (HTTP $code) — seed data manually if the repro needs it" ;;
  esac
fi

# ---------------------------------------------------------------- proxy conf

# `apps/nuxeo-ui/proxy.conf.json` hardcodes :8080, which is the shared instance. Point this
# workspace's dev server at its own container instead. Gitignored, so it cannot be committed.
PROXY="$WT/apps/nuxeo-ui/proxy.conf.ticket-$SLUG.json"
cat > "$PROXY" <<EOF
{
  "/nuxeo": {
    "target": "http://localhost:$NX_PORT",
    "secure": false,
    "changeOrigin": true,
    "autoRewrite": true,
    "headers": {
      "X-NXproperties": "*",
      "Origin": "http://localhost:$NX_PORT"
    }
  }
}
EOF

# ---------------------------------------------------------------- env.sh

cat > "$WT/env.sh" <<EOF
# Source this, then run everything from \$NX_WT.
export NX_TICKET="$TICKET"
export NX_WT="$WT"
export NX_BRANCH="$BRANCH"
export NX_NUXEO_MODE="$NUXEO_MODE"
export NX_CONTAINER="$([[ "$NUXEO_MODE" == "own" ]] && echo "$CONTAINER" || echo "$SHARED_CONTAINER")"
export NX_PORT="$NX_PORT"
export NX_URL="http://localhost:$NX_PORT/nuxeo"
export NX_DATA_ROOT="$DATA_ROOT"
export NX_APP_PORT="$APP_PORT"
export NX_PROXY="apps/nuxeo-ui/proxy.conf.ticket-$SLUG.json"
export TICKET="$TICKET"
export EVID="$EVID"
export APP_URL="http://localhost:$APP_PORT"
EOF

if [[ "$NUXEO_MODE" == "own" ]]; then
  NUXEO_LINE="http://localhost:$NX_PORT/nuxeo   (dedicated container $CONTAINER)"
  TEARDOWN_NOTE="removes the container and the worktree, keeps the evidence"
else
  NUXEO_LINE="http://localhost:$NX_PORT/nuxeo   (shared $SHARED_CONTAINER — do not disturb it)"
  TEARDOWN_NOTE="removes the worktree only; the shared container is left alone"
fi

cat <<EOF

Workspace ready for $TICKET

  worktree   $WT  (branch $BRANCH)
  nuxeo      $NUXEO_LINE
  data root  $DATA_ROOT
  dev server http://localhost:$APP_PORT
  evidence   $EVID
EOF

if [[ "${LINKED_MODULES:-0}" == "1" ]]; then
  cat <<'EOF'

  node_modules is HARDLINKED to the primary checkout. Editing a file in it edits both.
  Never run `npm install` here — re-create the workspace with --no-install and run `npm ci`
  if this ticket needs a dependency change.
EOF
fi

cat <<EOF

Next:

  . "$WT/env.sh"
  cd "\$NX_WT"
  npx nx serve nuxeo-ui --proxy-config "\$NX_PROXY" --port "\$NX_APP_PORT"

Tear down when the PR is open ($TEARDOWN_NOTE):

  bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh $TICKET --remove
EOF
