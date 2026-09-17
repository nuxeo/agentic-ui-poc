# NXENG-745 — before-fix evidence (not yet attached to Jira)

Captured: 2026-09-15 · App: `http://localhost:4200/#/login` · Branch: current `main` (no skip link in template)

| File | Purpose |
|------|---------|
| `NXENG-745-before-01-login-initial.png` | Login load — no skip link visible |
| `NXENG-745-before-02-after-first-tab.png` | After 1st Tab: focus on Hyland logo link (not a bypass) |
| `NXENG-745-before-03-after-second-tab.png` | After 2nd Tab: focus moves toward form |
| `NXENG-745-before-04-login-panel-full.png` | Full-page login panel |
| `NXENG-745-before.webm` | Short recording: Tab through logo → username |

Automated check: `skip link elements: 0` (no `.login-skip-link` / `a[href="#login-main"]`).

Re-run: `node scripts/collect-evidence/NXENG-745-before-standalone.mjs` (dev server on :4200).
