# NXENG-747 — before

**Verdict:** ERROR — 0/0 checks across 1 scene(s)

| | |
| --- | --- |
| App | http://localhost:4216 |
| Branch / commit | `fix/nxeng-747` @ `c4d3b51` |
| Nuxeo image | `nuxeo-recover:clean` |
| Scenes file | `scripts/collect-evidence/NXENG-747.scenes.mjs` |
| Recording | `NXENG-747-before.webm` (chapters in `chapters.vtt`) |

> **The capture aborted before completing every scene.**
>
> locator.waitFor: Timeout 90000ms exceeded.
Call log:
  - waiting for getByLabel(/username/i) to be visible


> **No checks were recorded, so this capture proves nothing.**
>
> Screenshots show that the app rendered something. They do not show that it rendered
> the right thing. Add an assertion per scene.

## Act 1 — Setup — where we are and what the user is trying to do

### 1. Open the login screen  _(no checks)_

_Reach the sign-in form unauthenticated_

Proves: **AC-1**

