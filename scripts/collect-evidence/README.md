# Evidence Collection Scripts

Reusable Playwright-based tooling for capturing before/after evidence when fixing bugs.
Every run saves **screenshots** and a **screen recording** (MP4) to `~/Desktop/<TICKET-ID>/`.

## Quick start

```bash
# 1. Make sure the dev server is running in another terminal
npx nx serve nuxeo-ui

# 2. Run the evidence collector for a specific ticket
#    Pass the UID of a representative document in your local Nuxeo
NUXEO_DOC_UID=<uid> npm run evidence:collect -- NXSAT-175 scripts/collect-evidence/NXSAT-175.mjs
```

Output: `~/Desktop/NXSAT-175/` containing:

- `*.png` screenshots for each fix step
- `*.webm` screen recording of the full run

## Environment variables

| Variable        | Default                 | Description                                 |
| --------------- | ----------------------- | ------------------------------------------- |
| `APP_URL`       | `http://localhost:4200` | Dev server URL                              |
| `NUXEO_USER`    | `Administrator`         | Login username                              |
| `NUXEO_PASS`    | `Administrator`         | Login password                              |
| `NUXEO_DOC_UID` | _(none)_                | Document UID to open for doc-specific steps |

> Credentials fall back to the Nuxeo default dev password. Never commit real credentials.

## Writing evidence steps for a new ticket

1. Create `scripts/collect-evidence/<TICKET-ID>.mjs`
2. Export a default async function:

```js
/** @param {import('@playwright/test').Page} page */
export default async function collectEvidence(page, helpers, outDir) {
  await helpers.login();
  await helpers.goToDoc(process.env['NUXEO_DOC_UID']);

  helpers.step('Verify fix 1: <description>');
  await helpers.screenshot('fix1-description');
}
```

3. Run:

```bash
npm run evidence:collect -- <TICKET-ID> scripts/collect-evidence/<TICKET-ID>.mjs
```

## Helpers API

| Method                               | Description                                     |
| ------------------------------------ | ----------------------------------------------- |
| `helpers.login()`                    | Navigate to `APP_URL` and log in                |
| `helpers.goToDoc(uid)`               | Navigate to `/#/doc/<uid>`                      |
| `helpers.screenshot(name, locator?)` | Save `<name>.png` to `outDir`                   |
| `helpers.step(msg)`                  | Log a step label (visible in console and video) |
| `helpers.baseUrl`                    | The app base URL                                |

## How the runner works

- Opens a **headed Chromium** window (visible, so the team can watch live)
- Runs at `slowMo: 400ms` so each interaction is readable in the recording
- Automatically saves a **WebM video** of the full session via Playwright's built-in recorder
- Screenshots are saved in addition to the video for use in PR descriptions
