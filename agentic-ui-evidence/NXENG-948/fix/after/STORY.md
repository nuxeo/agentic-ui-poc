# NXENG-948 — after

**Verdict:** PASS — 9/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4213 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-948/scripts/collect-evidence/NXENG-948.mjs` |
| Recording | `NXENG-948-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen  _(pass)_

_A user signing in to Nuxeo Satori before entering credentials_

Proves: **AC-1**

- [pass] login form renders
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login screen — 01-login-page.png](./01-login-page.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Scan for content outside landmarks  _(pass)_

_The username field region flagged by a11y-scout (mat-form-field infix)_

Proves: **AC-1**

- [pass] login panel is a main landmark
- [pass] main landmark has an accessible name
- [pass] login: no region violations on login page
- [pass] the spotlight still points at its element

![[Act 2] Scan for content outside landmarks — 02-login-landmarks.png](./02-login-landmarks.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Login still submits credentials  _(pass)_

_Confirming landmark markup did not break the primary action_

Proves: **AC-2**

- [pass] Log in button
- _not covered:_ full auth flow not exercised — out of scope for landmark fix

![[Act 3] Login still submits credentials — 03-login-submit.png](./03-login-submit.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

