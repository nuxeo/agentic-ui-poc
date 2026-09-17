# NXENG-748 — after

**Verdict:** PASS — 11/11 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4211 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | _not recorded_ |
| Scenes file | `C:\Users\akoppaka\Desktop\Projects\agentic-ui-worktrees\NXENG-748\scripts\collect-evidence\NXENG-748.mjs` |
| Recording | `NXENG-748-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen  _(pass)_

_User arrives at sign-in before tabbing into the form_

Proves: **AC-3**

- [pass] username field is on screen
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/automation/AI.Insights`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`
- _observed in the browser:_ `HTTP 404 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login screen — 01-login-context.png](./01-login-context.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Tab to Username and confirm focus is not clipped  _(pass)_

_Keyboard user focuses the username control_

Proves: **AC-1**

- [pass] keyboard focus lands on username input
- [pass] focus center hits the username input
- [pass] username outline wrapper overflow is visible
- [pass] username field uses login-field-username styling
- [pass] username input has scroll-margin for focus visibility
- [pass] the spotlight still points at its element

![[Act 2] Tab to Username and confirm focus is not clipped — 02-username-focused.png](./02-username-focused.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Validation still works on empty submit  _(pass)_

_Accessibility fix must not hide required-field errors_

Proves: **AC-3**

- [pass] username required error is shown

![[Act 3] Validation still works on empty submit — 03-validation-errors.png](./03-validation-errors.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

