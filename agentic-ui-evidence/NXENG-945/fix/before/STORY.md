# NXENG-945 — before

**Verdict:** FAIL — 7/9 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4210 |
| Branch / commit | `main` @ `829feae` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `C:/Users/akoppaka/Desktop/Projects/agentic-ui-worktrees/NXENG-945/scripts/collect-evidence/NXENG-945.scenes.mjs` |
| Recording | `NXENG-945-before.webm` (chapters in `chapters.vtt`) |

## Failed checks

- Scene 2 ([Act 2] Check the page exposes a level-one heading) — **document has at least one h1**: found 0 h1 element(s)
- Scene 2 ([Act 2] Check the page exposes a level-one heading) — **axe page-has-heading-one**: axe scan failed: Cannot find package '@axe-core/playwright' imported from C:\Users\akoppaka\Desktop\Projects\agentic-ui-worktrees\NXENG-945\scripts\collect-evidence\NXENG-945.scenes.mjs

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen without an existing session  _(pass)_

_A user who must sign in before accessing the repository_

Proves: **AC-1**

- [pass] login form is shown

## Act 2 — The bug — the behaviour as reported

### 2. Check the page exposes a level-one heading  _(2 failed)_

_Screen readers and WCAG scanners need a single h1 that names the page_

Proves: **AC-1**

- [FAIL] document has at least one h1 — found 0 h1 element(s)
- [FAIL] axe page-has-heading-one — axe scan failed: Cannot find package '@axe-core/playwright' imported from C:\Users\akoppaka\Desktop\Projects\agentic-ui-worktrees\NXENG-945\scripts\collect-evidence\NXENG-945.scenes.mjs

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
- [pass] act 2 present — The bug — the behaviour as reported
- [pass] act 3 present — The proof — the criterion asserted, and what still works

