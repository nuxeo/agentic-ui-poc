# NXENG-949 — after

**Verdict:** PASS — 10/10 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4214 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-949/scripts/collect-evidence/NXENG-949.mjs` |
| Recording | `NXENG-949-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen  _(pass)_

_A user signing in before entering credentials_

Proves: **AC-1**

- [pass] login form renders
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/automation/AI.Insights`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login screen — 01-login-page.png](./01-login-page.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Password label sits inside a landmark  _(pass)_

_Screen reader users navigating by landmark must reach the password field label_

Proves: **AC-1**

- [pass] password label is visible
- [pass] password mat-label is inside the main landmark
- [pass] copyright line is in a footer landmark
- [pass] the spotlight still points at its element

![[Act 2] Password label sits inside a landmark — 02-password-label-landmark.png](./02-password-label-landmark.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Login landmarks cover the panel content  _(pass)_

_Confirm no login labels or footer text sit outside document landmarks_

Proves: **AC-2**

- [pass] login panel content is contained in landmarks
- [pass] no browser console errors

![[Act 3] Login landmarks cover the panel content — 03-login-a11y-clean.png](./03-login-a11y-clean.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

