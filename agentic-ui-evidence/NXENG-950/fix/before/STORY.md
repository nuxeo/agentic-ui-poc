# NXENG-950 — before

**Verdict:** FAIL — 7/10 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4215 |
| Branch / commit | `fix/nxeng-950` @ `dc2c622` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `scripts/collect-evidence/NXENG-950.mjs` |
| Recording | `NXENG-950-before.webm` (chapters in `chapters.vtt`) |

## Failed checks

- Scene 2 ([Act 2] Login controls sit inside landmarks) — **mat-form-field infix is contained by a landmark**: infix is outside landmarks
- Scene 2 ([Act 2] Login controls sit inside landmarks) — **copyright footer uses contentinfo landmark**: footer is not a landmark
- Scene 3 ([Act 3] axe region rule on the login surface) — **axe region rule has no violations**: a

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page with a clean session  _(pass)_

_A user signing in at /#/login before accessing the repository_

Proves: **AC-1**

- [pass] login panel renders
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/me`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/me`

![[Act 1] Open the login page with a clean session — 01-login-initial.png](./01-login-initial.png)

## Act 2 — The bug — the behaviour as reported

### 2. Login controls sit inside landmarks  _(2 failed)_

_The username/password fields flagged by a11y-scout must not sit outside landmarks_

Proves: **AC-1**

- [FAIL] mat-form-field infix is contained by a landmark — infix is outside landmarks
- [FAIL] copyright footer uses contentinfo landmark — footer is not a landmark
- [pass] the spotlight still points at its element

![[Act 2] Login controls sit inside landmarks — 02-login-landmarks.png](./02-login-landmarks.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. axe region rule on the login surface  _(1 failed)_

_Confirm the reported axe `region` violation is gone without breaking the form_

Proves: **AC-2**

- [FAIL] axe region rule has no violations — a
- [pass] username field still present
- [pass] password field still present
- _not covered:_ SSO buttons and post-login routes were not exercised — login-only fix

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The bug — the behaviour as reported
- [pass] act 3 present — The proof — the criterion asserted, and what still works

