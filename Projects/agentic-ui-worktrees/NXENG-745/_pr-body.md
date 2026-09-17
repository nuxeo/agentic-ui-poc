## What changed and why

The login route had no skip-navigation control, so keyboard users tabbed into the Hyland logo before the username field (IBM `html_skipnav_exists`, WCAG 2.4.1 A). This adds a first-focus "Skip to sign in" link targeting `#login-main` on the form, using the same off-screen-until-focused pattern as `sat-skip-to-content`.

Evidence harness: scenes files may export `skipHttpCredentials: true` so login captures are not auto-signed-in via Playwright httpCredentials.

## JIRA ticket

[NXENG-745](https://hyland.atlassian.net/browse/NXENG-745)

## Acceptance criteria

1. **[from ticket]** Skip link bypasses repeated content to sign-in; visible when keyboard-focused — verified by Playwright after capture (9/9 checks) and unit test `provides a skip link to the sign-in landmark`.
2. **[from ticket]** IBM re-scan Issue ID 2168233541 — not re-run here; fix addresses the reported mechanism (missing skip nav).
3. **[from ticket]** No regression to login layout, logo, or SSO — AC-3 checks in before/after evidence; all 11 login-page unit tests pass.

## Approach

| Candidate | Outcome |
| --- | --- |
| Reuse `sat-skip-to-content` | Rejected: hardcoded `#main-content` target, wrong for login-only layout |
| Login-local skip link + `#login-main` | **Chosen**: minimal blast radius, matches evidence selectors, aligns with Satori skip-link styling |

**Root cause:** `login-page.component.html` had no skip link and no sign-in landmark; tab order started at `a.login-brand`.

## Files modified

- `apps/nuxeo-ui/src/app/login/login-page.component.html`
- `apps/nuxeo-ui/src/app/login/login-page.component.scss`
- `apps/nuxeo-ui/src/app/login/login-page.component.spec.ts`
- `scripts/collect-evidence/story-runner.mjs` (`skipHttpCredentials` opt-out)

## How to test

- [ ] `npx nx test nuxeo-ui --include=**/login-page.component.spec.ts`
- [ ] Open `http://localhost:4200/#/login` logged out; press Tab — first focus is "Skip to sign in"
- [ ] Activate skip link — focus moves to `#login-main` (form); logo and SSO unchanged

## Blast radius

- Only the login route template/styles/tests; no shared services or authenticated shell.

## Verification

- `nuxeo-ui` lint (warnings only), test 11/11, production build OK
- Before evidence: 5/8 checks (expected repro); after: 9/9 PASS
- Full `beta:gate` not green locally (pre-existing supply-chain / guardrails on main); CI is authoritative

## Checklist

- [x] `npx nx run nuxeo-ui:test` passes (login spec)
- [x] `nuxeo-ui` production build passes
- [x] Unit regression test added
- [x] No hardcoded credentials
- [x] New SCSS uses theme tokens / no new hardcoded colours in skip-link rules
- [ ] Full `npm run beta:gate` — pending CI
