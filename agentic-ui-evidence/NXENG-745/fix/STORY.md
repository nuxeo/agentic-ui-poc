# NXENG-745 — before and after

**Verdict: PASS** — 3 scene(s) compared, 1 of them with no visual difference; a changed assertion carries the proof.

| | Before | After |
| --- | --- | --- |
| Verdict | fail | pass |
| Checks | 3 passed / 8 | 9 passed / 9 |
| Commit | `829feae` | `829feae` |
| Recording | `before/NXENG-745-before.webm` | `after/NXENG-745-after.webm` |

Nuxeo image: _not recorded_

## At a glance

![contact sheet](./contact-sheet.png)

## Scene by scene

### Open the login page logged out

![Open the login page logged out](./diptychs/login-layout.png)

### Tab from the document start

![Tab from the document start](./diptychs/first-tab-focus.png)

### Sign-in landmark and skip target

![Sign-in landmark and skip target](./diptychs/sign-in-landmark.png)

## Callouts

![Brand link (repeated content) (after)](./annotated/after-login-layout.png)

![First Tab target (brand if no skip) (after)](./annotated/after-first-tab-focus.png)

![Username field (after)](./annotated/after-sign-in-landmark.png)

## Changes with no visual difference

These scenes produced byte-identical images, which is expected: the change is not
visual. In each, an assertion changed outcome between the halves, and that is the
proof — the picture is context, not evidence.

- `login-layout`

## Full narratives

- [Before](./before/STORY.md) — the bug as reported
- [After](./after/STORY.md) — the behaviour with the fix

