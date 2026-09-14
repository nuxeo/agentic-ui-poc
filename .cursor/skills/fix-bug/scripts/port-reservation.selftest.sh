#!/usr/bin/env bash
#
# Self-test for the port reservation in new-ticket-workspace.sh.
#
#   bash .cursor/skills/fix-bug/scripts/port-reservation.selftest.sh
#
# This exists because the bug it guards was invisible to every existing check and only appears
# with more than one workspace: `free_port` skipped a port while something was *listening* on
# it, so a batch of workspaces created before any dev server started all received 4210.
#
# The functions are extracted from the real script rather than copied, so the test cannot pass
# against a stale duplicate. It asserts the extraction found them, so a refactor that moves
# them fails loudly instead of silently testing nothing.

set -euo pipefail

SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/new-ticket-workspace.sh"
[[ -f "$SCRIPT" ]] || { echo "error: $SCRIPT not found" >&2; exit 1; }

BLOCK="$(sed -n '/^PORT_DIR=/,/^if \[\[ "\$NUXEO_MODE"/p' "$SCRIPT" | sed '$d')"
for fn in port_lock port_unlock port_taken reserve_port; do
  grep -q "^${fn}()" <<<"$BLOCK" \
    || { echo "error: could not extract ${fn}() — the script's layout changed; fix this test" >&2; exit 1; }
done

PASS=0
FAIL=0
ok()   { PASS=$((PASS + 1)); echo "  ok   — $1"; }
bad()  { FAIL=$((FAIL + 1)); echo "  FAIL — $1"; }
check() { [[ "$2" == "$3" ]] && ok "$1" || bad "$1 (expected '$3', got '$2')"; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Stand up the extracted functions against a temporary worktree root. `note` and `die` come
# from the host script; the test supplies its own.
harness() {
  cat <<EOF
set -euo pipefail
WORKTREE_ROOT="$TMP/worktrees"
WT="\$1"
note() { :; }
die()  { echo "die: \$*" >&2; exit 1; }
$BLOCK
EOF
}

alloc() { # alloc <worktree-path> <start> -> port
  local wt="$1" start="$2"
  mkdir -p "$wt"
  bash -c "$(harness)"' ; reserve_port "$2"' _ "$wt" "$start"
}

echo "Port reservation self-test"

# ---------------------------------------------------------------- 1. a batch of twelve
# The original defect, stated as a test: twelve workspaces created back to back, nothing
# listening on any port. Before the fix every call returned 4210.
declare -a PORTS=()
for i in $(seq 1 12); do
  PORTS+=("$(alloc "$TMP/worktrees/NXSAT-$i" 4210)")
done
UNIQUE="$(printf '%s\n' "${PORTS[@]}" | sort -u | wc -l | tr -d ' ')"
check "twelve workspaces get twelve distinct ports" "$UNIQUE" "12"
check "the first one still gets the documented base port" "${PORTS[0]}" "4210"

# ---------------------------------------------------------------- 2. concurrent allocation
# Check-then-claim without a lock: all of these scan before any of them writes.
rm -rf "$TMP/worktrees"
for i in $(seq 1 8); do
  ( alloc "$TMP/worktrees/CONC-$i" 4210 > "$TMP/conc-$i" ) &
done
wait
# `reserve_port` prints without a trailing newline, so `cat` would run the numbers together
# into one line and `sort -u` would report a single unique value however well the lock worked.
UNIQUE="$(for i in $(seq 1 8); do cat "$TMP/conc-$i"; echo; done | sort -u | wc -l | tr -d ' ')"
check "eight concurrent allocations do not collide" "$UNIQUE" "8"

# ---------------------------------------------------------------- 3. idempotent for one ticket
# Re-running for the same workspace must return the same number, not creep to the next one:
# the script's env.sh reuse depends on it, and a moving port silently retargets evidence.
rm -rf "$TMP/worktrees"
FIRST="$(alloc "$TMP/worktrees/SAME" 4210)"
AGAIN="$(alloc "$TMP/worktrees/SAME" 4210)"
check "re-running the same workspace reuses its port" "$AGAIN" "$FIRST"

# ---------------------------------------------------------------- 4. reclaim after teardown
# A reservation whose worktree no longer exists must not hold the number forever, or the range
# fills up across weeks of tickets.
rm -rf "$TMP/worktrees"
GONE="$(alloc "$TMP/worktrees/GONE" 4210)"
rm -rf "$TMP/worktrees/GONE"
REUSED="$(alloc "$TMP/worktrees/FRESH" 4210)"
check "a dead worktree's port is reclaimed" "$REUSED" "$GONE"

# ---------------------------------------------------------------- 5. live listener is skipped
# The behaviour the original version got right, kept: a port in use by anything at all —
# another workspace's server, or an unrelated process — is not handed out.
rm -rf "$TMP/worktrees"
python3 -c "
import socket,sys,time
s=socket.socket(); s.bind(('127.0.0.1',0)); s.listen(1)
print(s.getsockname()[1]); sys.stdout.flush()
time.sleep(30)
" > "$TMP/listener-port" &
LISTENER=$!
for _ in $(seq 50); do [[ -s "$TMP/listener-port" ]] && break; sleep 0.1; done
BUSY="$(cat "$TMP/listener-port")"
GOT="$(alloc "$TMP/worktrees/BUSY" "$BUSY")"
disown "$LISTENER" 2>/dev/null || true   # else bash announces "Terminated"
kill "$LISTENER" 2>/dev/null || true
if [[ -n "$BUSY" ]]; then
  [[ "$GOT" != "$BUSY" ]] && ok "a port with a live listener is skipped" \
                          || bad "a port with a live listener is skipped (got $GOT)"
else
  bad "could not start a listener to test against"
fi

# ---------------------------------------------------------------- 6. stale lock is reclaimed
# A run killed between mkdir and rmdir would otherwise block every later run forever.
rm -rf "$TMP/worktrees"
mkdir -p "$TMP/worktrees/.ports.lock"
printf '999999' > "$TMP/worktrees/.ports.lock/pid" # a pid that cannot be alive
mkdir -p "$TMP/worktrees/LOCKED"
# No `timeout` here: it is GNU coreutils and absent from a stock macOS, so using it made this
# check fail on a missing command while reporting the reclaim as broken. Watchdog by hand.
bash -c "$(harness)"' ; reserve_port 4210' _ "$TMP/worktrees/LOCKED" >/dev/null 2>&1 &
LOCK_TEST=$!
( sleep 20; kill -9 "$LOCK_TEST" 2>/dev/null ) &
WATCHDOG=$!
if wait "$LOCK_TEST" 2>/dev/null; then
  ok "a lock held by a dead process is reclaimed"
else
  bad "a lock held by a dead process blocked allocation"
fi
disown "$WATCHDOG" 2>/dev/null || true
kill "$WATCHDOG" 2>/dev/null || true

echo
if [[ $FAIL -gt 0 ]]; then
  echo "port-reservation: FAIL — $FAIL of $((PASS + FAIL)) checks failed"
  exit 1
fi
echo "port-reservation: pass — $PASS checks"
