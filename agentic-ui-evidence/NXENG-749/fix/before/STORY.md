# NXENG-749 — before

**Verdict:** FAIL — 11/13 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4217 |
| Branch / commit | `fix/nxeng-749` @ `312bc0a` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `scripts/collect-evidence/NXENG-749.mjs` |
| Recording | `NXENG-749-before.webm` (chapters in `chapters.vtt`) |

## Failed checks

- Scene 2 ([Act 2] Tab to the password field) — **focused password field stacks above username (z-index)**: z-index=auto
- Scene 2 ([Act 2] Tab to the password field) — **password input reserves scroll margin for focus visibility**: scroll-margin-block=0px

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page  _(pass)_

_A user signing in with username and password on the Satori login screen_

Proves: **AC-1**

- [pass] login form renders
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/me`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/me`

![[Act 1] Open the login page — 01-login-initial.png](./01-login-initial.png)

## Act 2 — The bug — the behaviour as reported

### 2. Tab to the password field  _(2 failed)_

_Keyboard user moves focus from the Hyland logo through username to password_

Proves: **AC-1**

- [pass] password input exists
- [pass] password input holds keyboard focus
- [pass] password input center is not covered by another element
- [FAIL] focused password field stacks above username (z-index) — z-index=auto
- [pass] password outline wrapper does not clip focus
- [FAIL] password input reserves scroll margin for focus visibility — scroll-margin-block=0px
- [pass] the spotlight still points at its element

![[Act 2] Tab to the password field — 02-password-focused.png](./02-password-focused.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Username field and submit still work  _(pass)_

_Confirm login layout and controls were not regressed_

Proves: **AC-4**

- [pass] username field still present
- [pass] submit button still present
- _not covered:_ SSO providers were not configured in this workspace — SSO buttons not exercised

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The bug — the behaviour as reported
- [pass] act 3 present — The proof — the criterion asserted, and what still works

