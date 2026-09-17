# NXENG-945 — after

**Verdict:** PASS — 9/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4210 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-945/scripts/collect-evidence/NXENG-945.scenes.mjs` |
| Recording | `NXENG-945-after.webm` (chapters in `chapters.vtt`) |

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen without an existing session  _(pass)_

_A user who must sign in before accessing the repository_

Proves: **AC-1**

- [pass] login form is shown

## Act 2 — The fix — the behaviour as it now is

### 2. Check the page exposes a level-one heading  _(pass)_

_Screen readers and WCAG scanners need a single h1 that names the page_

Proves: **AC-1**

- [pass] document has at least one h1
- [pass] h1 has non-empty accessible name

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Credentials form still works after the heading change  _(pass)_

_Confirming username, password and submit are unchanged for keyboard and sighted users_

Proves: **AC-2**

- [pass] username field
- [pass] password field
- [pass] log in button
- _not covered:_ successful authentication was not exercised — out of scope for this markup fix

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The fix — the behaviour as it now is
- [pass] act 3 present — The proof — the criterion asserted, and what still works

