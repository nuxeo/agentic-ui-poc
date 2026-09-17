# NXENG-745 — before

**Verdict:** FAIL — 3/8 checks across 4 scene(s)

| | |
| --- | --- |
| App | http://localhost:4210 |
| Branch / commit | `fix/nxeng-745` @ `829feae` |
| Nuxeo image | _not recorded_ |
| Scenes file | `scripts/collect-evidence/NXENG-745.mjs` |
| Recording | `NXENG-745-before.webm` (chapters in `chapters.vtt`) |

## Failed checks

- Scene 1 ([Act 1] Open the login page logged out) — **username field renders**: selector not visible within 10000ms: input[formcontrolname="username"]
- Scene 1 ([Act 1] Open the login page logged out) — **Hyland logo link still present**: selector not visible within 10000ms: a.login-brand
- Scene 2 ([Act 2] Tab from the document start) — **skip link exists for WCAG 2.4.1**: found 0 skip link(s)
- Scene 2 ([Act 2] Tab from the document start) — **first Tab focuses the skip link**: active element href/tag: BODY
- Scene 3 ([Act 3] Sign-in landmark and skip target) — **sign-in landmark is present**: missing #login-main

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login page logged out  _(2 failed)_

_A keyboard user arriving at sign-in without an existing session_

Proves: **AC-3**

- [FAIL] username field renders — selector not visible within 10000ms: input[formcontrolname="username"]
- [FAIL] Hyland logo link still present — selector not visible within 10000ms: a.login-brand

![[Act 1] Open the login page logged out — 01-login-layout.png](./01-login-layout.png)

## Act 2 — The bug — the behaviour as reported

### 2. Tab from the document start  _(2 failed)_

_The first focusable control should bypass repeated chrome to sign-in_

Proves: **AC-1**

- [FAIL] skip link exists for WCAG 2.4.1 — found 0 skip link(s)
- [FAIL] first Tab focuses the skip link — active element href/tag: BODY

![[Act 2] Tab from the document start — 02-first-tab-focus.png](./02-first-tab-focus.png)

## Act 3 — The proof — the criterion asserted, and what still works

### 3. Sign-in landmark and skip target  _(1 failed)_

_The form is addressable as the main sign-in block_

Proves: **AC-1**

- [FAIL] sign-in landmark is present — missing #login-main

![[Act 3] Sign-in landmark and skip target — 03-sign-in-landmark.png](./03-sign-in-landmark.png)

### 4. Story structure  _(pass)_

- [pass] act 1 present — Setup — where we are and what the user is trying to do
- [pass] act 2 present — The bug — the behaviour as reported
- [pass] act 3 present — The proof — the criterion asserted, and what still works

