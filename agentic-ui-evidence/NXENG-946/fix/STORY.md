# NXENG-946 — before and after

**Verdict: PASS** — 3 scene(s) compared, 3 of them with no visual difference; a changed assertion carries the proof.

| | Before | After |
| --- | --- | --- |
| Verdict | fail | pass |
| Checks | 8 passed / 9 | 9 passed / 9 |
| Commit | `829feae` | `829feae` |
| Recording | `before/NXENG-946-before.webm` | `after/NXENG-946-after.webm` |

Nuxeo image: `nuxeo-recover:clean`

## At a glance

![contact sheet](./contact-sheet.png)

## Scene by scene

### Open the login page unauthenticated

![Open the login page unauthenticated](./diptychs/login-page.png)

### Hyland brand link landmark containment

![Hyland brand link landmark containment](./diptychs/brand-landmark.png)

### Login form still works

![Login form still works](./diptychs/login-form-intact.png)

## Callouts

![Hyland brand link (before)](./annotated/before-login-page.png)

![Hyland brand link (before)](./annotated/before-brand-landmark.png)

![Login form (before)](./annotated/before-login-form-intact.png)

![Hyland brand link (after)](./annotated/after-login-page.png)

![Hyland brand link (after)](./annotated/after-brand-landmark.png)

![Login form (after)](./annotated/after-login-form-intact.png)

## Changes with no visual difference

These scenes produced byte-identical images, which is expected: the change is not
visual. In each, an assertion changed outcome between the halves, and that is the
proof — the picture is context, not evidence.

- `login-page`
- `brand-landmark`
- `login-form-intact`

## Full narratives

- [Before](./before/STORY.md) — the bug as reported
- [After](./after/STORY.md) — the behaviour with the fix

