# NXENG-745 — after

**Verdict:** PASS — 9/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4210 |
| Branch / commit | `fix/nxeng-745` @ `829feae` |
| Nuxeo image | _not recorded_ |
| Scenes file | `scripts/collect-evidence/NXENG-745.mjs` |
| Recording | `NXENG-745-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page logged out  _(pass)_

_A keyboard user arriving at sign-in without an existing session_

Proves: **AC-3**

- [pass] username field renders
- [pass] Hyland logo link still present
- _observed in the browser:_ `HTTP 401 /nuxeo/api/v1/path/default-domain/config/agentic-ui`

![[Act 1] Open the login page logged out — 01-login-layout.png](./01-login-layout.png)

## Act 2 — The fix — the behaviour as it now is

### 2. Tab from the document start  _(pass)_

_The first focusable control should bypass repeated chrome to sign-in_

Proves: **AC-1**

- [pass] skip link exists for WCAG 2.4.1
- [pass] first Tab focuses the skip link

![[Act 2] Tab from the document start — 02-first-tab-focus.png](./02-first-tab-focus.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Sign-in landmark and skip target  _(pass)_

_The form is addressable as the main sign-in block_

Proves: **AC-1**

- [pass] sign-in landmark is present
- [pass] skip target receives focus
- _observed in the browser:_ `ERROR RuntimeError: NG04002: Cannot match any routes. URL Segment: 'login-main'
    at Recognizer.noMatchError (http://localhost:4210/@fs/C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-745/.angular/cache/20.3.33/nuxeo-ui/vite/deps/chunk-PJQC2WHB.js?v=32d02ea6:2979:12)
    at http://lo`

![[Act 3] Sign-in landmark and skip target — 03-sign-in-landmark.png](./03-sign-in-landmark.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

