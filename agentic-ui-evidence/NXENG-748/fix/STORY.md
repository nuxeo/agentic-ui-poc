# NXENG-748 — before and after

**Verdict: PASS** — 3 scene(s) compared, 3 of them with no visual difference; a changed assertion carries the proof.

| | Before | After |
| --- | --- | --- |
| Verdict | fail | pass |
| Checks | 9 passed / 11 | 11 passed / 11 |
| Commit | `829feae` | `829feae` |
| Recording | `before/NXENG-748-before.webm` | `after/NXENG-748-after.webm` |

Nuxeo image: _not recorded_

## At a glance

![contact sheet](./contact-sheet.png)

## Scene by scene

### Open the login screen

![Open the login screen](./diptychs/login-context.png)

### Tab to Username and confirm focus is not clipped

![Tab to Username and confirm focus is not clipped](./diptychs/username-focused.png)

### Validation still works on empty submit

![Validation still works on empty submit](./diptychs/validation-errors.png)

## Callouts

![Username field (before)](./annotated/before-login-context.png)

![Focused username (before)](./annotated/before-username-focused.png)

![Validation message (before)](./annotated/before-validation-errors.png)

![Username field (after)](./annotated/after-login-context.png)

![Focused username (after)](./annotated/after-username-focused.png)

![Validation message (after)](./annotated/after-validation-errors.png)

## Changes with no visual difference

These scenes produced byte-identical images, which is expected: the change is not
visual. In each, an assertion changed outcome between the halves, and that is the
proof — the picture is context, not evidence.

- `login-context`
- `username-focused`
- `validation-errors`

## Full narratives

- [Before](./before/STORY.md) — the bug as reported
- [After](./after/STORY.md) — the behaviour with the fix

