# NXENG-750 — after

**Verdict:** PASS — 11/11 checks across 5 scene(s)

| | |
| --- | --- |
| App | http://localhost:4218 |
| Branch / commit | `fix/nxeng-750` @ `b7275dd` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `scripts/collect-evidence/NXENG-750.mjs` |
| Recording | `NXENG-750-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page  _(pass)_

_A user signing in with username and password on the Agentic UI login screen_

Proves: **AC-3**

- [pass] login username field
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/automation/AI.Insights`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login page — 01-login-context.png](./01-login-context.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Keyboard focus on Log in (disabled, empty form)  _(pass)_

_IBM Equal Access focuses the submit control to verify a visible focus ring_

Proves: **AC-1**

- [pass] submit button is present
- [pass] disabled submit shows visible outline (2px+ solid) or focus shadow
- [pass] the spotlight still points at its element

![[Act 2] Keyboard focus on Log in (disabled, empty form) — 02-login-submit-focused.png](./02-login-submit-focused.png)

### 3. Keyboard focus on Log in (enabled credentials)  _(pass)_

_Confirm focus ring remains visible when the button is actionable_

Proves: **AC-3**

- [pass] submit enabled with credentials
- [pass] enabled submit shows visible focus indicator
- [pass] the spotlight still points at its element

![[Act 2] Keyboard focus on Log in (enabled credentials) — 03-login-submit-enabled-focus.png](./03-login-submit-enabled-focus.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 4. Login form fields still accept keyboard focus  _(pass)_

_Ensure focus styling changes did not break username/password tab stops_

Proves: **AC-3**

- [pass] username field accepts programmatic focus
- _not covered:_ Full IBM re-scan (issue 3222288614) runs in CI a11y workflow — not replayed here

![[Act 3] Login form fields still accept keyboard focus — 04-username-focused.png](./04-username-focused.png)

### 5. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

