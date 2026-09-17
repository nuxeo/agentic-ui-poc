# NXENG-947 — after

**Verdict:** PASS — 9/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4212 |
| Branch / commit | `fix/nxeng-947` @ `dc2c622` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `scripts/collect-evidence/NXENG-947.mjs` |
| Recording | `NXENG-947-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen  _(pass)_

_A user signing in before any repository content loads_

Proves: **AC-1**

- [pass] username field is shown
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login screen — 01-login-initial.png](./01-login-initial.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Landmarks contain the sign-in panel  _(pass)_

_Screen reader users navigate by landmark; orphan labels fail WCAG 1.3.1 region_

Proves: **AC-1**

- [pass] username label is inside a main landmark
- [pass] copyright uses a footer landmark
- [pass] the spotlight still points at its element

![[Act 2] Landmarks contain the sign-in panel — 02-login-landmarks.png](./02-login-landmarks.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Sign-in still works  _(pass)_

_Landmark markup must not break the credential form_

Proves: **AC-2**

- [pass] password field still present
- [pass] submit button still present
- _not covered:_ shared Nuxeo may 404 /config/agentic-ui on login — not part of this fix

![[Act 3] Sign-in still works — 03-login-form-intact.png](./03-login-form-intact.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

