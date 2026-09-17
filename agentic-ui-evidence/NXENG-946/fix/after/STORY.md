# NXENG-946 — after

**Verdict:** PASS — 9/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4211 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-946/scripts/collect-evidence/NXENG-946.mjs` |
| Recording | `NXENG-946-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page unauthenticated  _(pass)_

_A user arriving at Nuxeo Satori before signing in_

Proves: **AC-1**

- [pass] login form renders
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login page unauthenticated — 01-login-page.png](./01-login-page.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Hyland brand link landmark containment  _(pass)_

_The logo link axe flagged as outside any region landmark_

Proves: **AC-1**

- [pass] Hyland brand link is contained by a landmark
- [pass] the spotlight still points at its element

![[Act 2] Hyland brand link landmark containment — 02-brand-landmark.png](./02-brand-landmark.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Login form still works  _(pass)_

_Confirming landmark fix did not break credential entry_

Proves: **AC-2**

- [pass] username field
- [pass] password field
- [pass] Log in button
- _not covered:_ submit flow covered by unit tests; not exercised in this capture

![[Act 3] Login form still works — 03-login-form-intact.png](./03-login-form-intact.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

