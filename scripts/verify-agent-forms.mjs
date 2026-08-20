/**
 * Live verification for the chat-rendered metadata form (plan A7 stage 3).
 *
 * Drives a real browser against a real gateway and a real model, and reports what is
 * actually on screen and what actually reached Nuxeo. It exists because every defect this
 * feature has had was invisible to a green unit suite:
 *
 *  - the model reported a change using its own proposed value, so the user was told their
 *    edit was saved under text they had just replaced;
 *  - given the stored values, the model then called the user's own edit "a concurrent edit
 *    or a server-side override" and offered to revert it;
 *  - a failed write carried a note instructing the model to report what was saved;
 *  - a gateway refusal was printed to the user as their own decline.
 *
 * Four of those are about what a *person* or a *model* is told, which no assertion on a
 * merged argument object can see. So the checks below read the rendered DOM and the tool
 * result text, not internal state.
 *
 * ## Running it
 *
 *   # 1. A gateway on a scratch port. NEVER use 3100 — that is a detached, frozen
 *   #    demo-scripted gateway for leadership demos.
 *   set -a; source ~/.nuxeo-agent-gateway.env; set +a   # never print this file
 *   PORT=3197 npx tsx apps/agent-gateway/src/main.ts &
 *
 *   # 2. A dev server proxying /agent to that port and /nuxeo to 8090.
 *   npx ng serve nuxeo-ui --proxy-config <your-proxy>.json --port 4201
 *
 *   # 3. This script.
 *   CHROME_PATH="$(node -e "…")" node scripts/verify-agent-forms.mjs <document-uid>
 *
 * `ng serve` reads `--proxy-config` **once at startup**: editing the file after it is
 * running changes nothing, and because both gateways answer correctly there is no error
 * to notice. If a run seems to ignore a rebuilt gateway, restart `ng serve`.
 *
 * Scenarios: `happy` (default), `failed-write`, `refusal`. See SCENARIOS.
 */

import { chromium } from 'playwright';

const SHOTS = 'docs/images/a7-skeleton';
const APP = process.env['APP_URL'] ?? 'http://localhost:4201';
const UID = process.argv[2];
const SCENARIO = process.argv[3] ?? 'happy';

/**
 * Local dev credentials. Documented in `docs/beta-demo-runbook.md` as the Nuxeo dev
 * defaults; deliberately NOT read from `~/.nuxeo-agent-gateway.env`, whose values must
 * never be echoed into a log, a fixture or a screenshot.
 */
const USER = process.env['NUXEO_USER'] ?? 'Administrator';
const PASS = process.env['NUXEO_PASSWORD'] ?? 'Administrator';

const SCENARIOS = {
  /** A write the user edits by hand and approves. Screenshots 13–15. */
  happy: {
    prompt: (uid) =>
      `Use nuxeo.updateMetadata to set the description of document ${uid} to ` +
      `"Checked during browser verification".`,
    shots: ['13-stage3-form-in-chat', '14-stage3-form-edited', '15-stage3-form-submitted'],
    edit: 'Edited by hand in the chat form',
  },
  /**
   * The same write against a document Nuxeo will refuse with a 403.
   *
   * What this catches, and what no unit test did until it was written: the note attached
   * to the result. It used to say "report what was saved and do not offer to change it
   * back" on top of the error, priming the model to claim a write that never happened.
   */
  'failed-write': {
    prompt: (uid) =>
      `Use nuxeo.updateMetadata to set the description of document ${uid} to ` +
      `"This write should be refused".`,
    shots: ['20-failed-write-form', '21-failed-write-edited', '22-failed-write-reported'],
    edit: 'A value the user typed that must not be reported as saved',
  },
  /**
   * A write the gateway refuses before anybody is asked — retention or legal hold.
   *
   * The card must not say "Declined by the user": the one person reading it is the one
   * person who knows they did not decline.
   */
  refusal: {
    prompt: (uid) => `Use nuxeo.updateMetadata to retitle document ${uid} to "Renamed".`,
    shots: ['23-refusal-card'],
    edit: null,
  },
};

if (!UID) {
  console.error('Usage: node scripts/verify-agent-forms.mjs <document-uid> [scenario]');
  console.error(`Scenarios: ${Object.keys(SCENARIOS).join(', ')}`);
  process.exit(1);
}
const scenario = SCENARIOS[SCENARIO];
if (!scenario) {
  console.error(`Unknown scenario "${SCENARIO}". Known: ${Object.keys(SCENARIOS).join(', ')}`);
  process.exit(1);
}

/** Everything printed goes through here, so `no-console` stays satisfied honestly. */
const report = (label, value) =>
  console.warn(`\n=== ${label} ===\n${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`);

const browser = await chromium.launch({ executablePath: process.env['CHROME_PATH'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

/**
 * Authorization at the network layer, scoped to the app's origin.
 *
 * Two traps, both cost an hour the first time. `httpCredentials` alone establishes a
 * *cookie* session, so `AuthService.basicCredentials()` is null and `AGENT_DEV_AUTH_HEADERS`
 * forwards nothing. And setting the header globally via `extraHTTPHeaders` trips the CORS
 * preflight on Google Fonts, so every Material icon renders as its ligature text (`au`,
 * `pa`, `ed`) instead of a glyph.
 *
 * The first trap was originally recorded here as a harness quirk — a cookie session makes
 * the run answer `401 unauthenticated`. It was not a quirk: it was the product defect that
 * moved the gateway to `/nuxeo/agent/*` so the Nuxeo session cookie reaches it at all (see
 * `libs/shared/agent-client/src/lib/agent.config.ts`). A cookie session now authenticates
 * the run on its own. This route is kept because a cookie session and an explicit header
 * are different code paths and this script should not care which one the app is using.
 */
const basic = `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`;
await context.route(`${APP}/**`, (route) =>
  route.continue({ headers: { ...route.request().headers(), authorization: basic } }),
);

const page = await context.newPage();
const problems = [];
page.on('pageerror', (error) => problems.push(`pageerror: ${String(error).slice(0, 300)}`));
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(`console: ${message.text().slice(0, 300)}`);
});

const panel = () => page.locator('.ai-chat-panel');
const shot = async (name) => {
  await panel().screenshot({ path: `${SHOTS}/${name}.png` });
  report('screenshot', name);
};

// `domcontentloaded`, not `networkidle`: a dev server holds a live-reload socket open, so
// `networkidle` never settles and the call times out.
await page.goto(APP, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('sat-app-header', { timeout: 40_000 });

if (!(await panel().isVisible())) {
  await page.locator('button[aria-label="AI Assistant"]').click();
  await page.waitForSelector('.ai-chat-panel', { timeout: 15_000 });
}

// The capability probe runs once at bootstrap, so a page loaded with the gateway up must
// be in AGENT mode. In STANDARD mode nothing below is exercising the agent path at all.
const mode = (await page.locator('.ai-chat-mode').first().innerText()).trim();
report('panel mode', mode);
if (!/agent/i.test(mode)) throw new Error(`Expected the AGENT badge, got "${mode}".`);

const input = page.locator('.ai-chat-input');
await input.fill(scenario.prompt(UID));
await input.press('Enter');

/** The rendered form, or null when the gateway refused before raising one. */
async function waitForFormOrRefusal() {
  const form = page.locator('lib-document-metadata-form');
  const settled = page.locator('.ai-tool-card-result');
  await Promise.race([
    form.waitFor({ timeout: 150_000 }).catch(() => undefined),
    settled.first().waitFor({ timeout: 150_000 }).catch(() => undefined),
  ]);
  return (await form.count()) > 0 ? form : null;
}

const form = await waitForFormOrRefusal();
await page.waitForTimeout(1500);

if (!form) {
  // The refusal path: no form, no approval buttons, one settled card.
  await shot(scenario.shots[0]);
  report(
    'refusal on screen',
    await page.evaluate(() => ({
      resultLines: [...document.querySelectorAll('.ai-tool-card-result')].map((node) =>
        node.textContent.replace(/\s+/g, ' ').trim().slice(0, 240),
      ),
      // The assertion that matters: a gateway refusal must not be attributed to the user.
      saysUserDeclined: document.body.textContent.includes('Declined by the user'),
      approvalButtonRows: document.querySelectorAll('.ai-approval-actions').length,
    })),
  );
  report('console problems', problems.length ? problems : 'none');
  await browser.close();
  process.exit(0);
}

await shot(scenario.shots[0]);

// What is on screen, read out of the DOM rather than assumed.
report(
  'form on screen',
  await page.evaluate(() => {
    const root = document.querySelector('lib-document-metadata-form');
    return {
      target: root.querySelector('.metadata-form__target-label')?.textContent?.trim(),
      uidShown: root.querySelector('.metadata-form__target-uid')?.textContent?.trim(),
      proposedNote: root.querySelector('.metadata-form__proposed-note')?.textContent?.trim(),
      editable: [...root.querySelectorAll('.metadata-form__field')].map((field) => ({
        label: field.querySelector('.metadata-form__label')?.textContent?.trim().replace(/\s+/g, ' '),
        value: field.querySelector('.metadata-form__control')?.value,
        suggested: !!field.querySelector('.metadata-form__badge'),
      })),
      // Display-only rows now carry provenance too: `source` is set from whether the
      // write mentioned the field, regardless of whether it is editable, so a proposed
      // `dc:creator` would otherwise print as the document's own value.
      displayOnly: [...root.querySelectorAll('.metadata-form__readonly-row')].map((row) => ({
        label: row.querySelector('dt')?.textContent?.replace(/\s+/g, ' ').trim(),
        value: row.querySelector('dd')?.textContent?.trim(),
        suggested: !!row.querySelector('.metadata-form__badge'),
      })),
      // The card's approve/decline buttons must be gone — the form replaced them...
      approvalButtonRows: document.querySelectorAll('.ai-approval-actions').length,
      // ...and the action line saying what will happen must remain.
      actionLine: document
        .querySelector('.ai-approval-row-action')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
    };
  }),
);

if (scenario.edit) {
  await form
    .locator('.metadata-form__field', { hasText: 'Description' })
    .locator('textarea')
    .fill(scenario.edit);
  await page.waitForTimeout(400);
  await shot(scenario.shots[1]);
}

await page.locator('.metadata-form__submit').click();
await page.waitForTimeout(12_000);
await shot(scenario.shots[2] ?? scenario.shots.at(-1));

report(
  'after submit',
  await page.evaluate(() => ({
    formStillMounted: !!document.querySelector('lib-document-metadata-form'),
    verdict: document.querySelector('.ai-approval-row-answer')?.textContent?.trim(),
    // The settled card must show what RAN, not what the model proposed. It used to keep
    // the proposal, so a ticked card read back a description the user had deleted while
    // the prose below correctly reported what was saved.
    cardArgs: [...document.querySelectorAll('.ai-tool-card-args')].map((node) =>
      node.textContent.replace(/\s+/g, ' ').trim().slice(0, 300),
    ),
    resultLines: [...document.querySelectorAll('.ai-tool-card-result')].map((node) =>
      node.textContent.replace(/\s+/g, ' ').trim().slice(0, 300),
    ),
    // Whatever the model finally said. On a failed write this must not claim success.
    assistantProse: [...document.querySelectorAll('.ai-msg.assistant .ai-msg-content')]
      .map((node) => node.textContent.replace(/\s+/g, ' ').trim())
      .at(-1)
      ?.slice(0, 600),
  })),
);

report('console problems', problems.length ? problems : 'none');
await browser.close();
