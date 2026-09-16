/**
 * Template for a bug-fix evidence story. Copy to `<TICKET-ID>.mjs` and edit.
 *
 * Run it twice — once on the unfixed branch, once with the fix — then combine:
 *
 *   EVIDENCE_PHASE=before npm run evidence:collect -- <TICKET-ID> scripts/collect-evidence/<TICKET-ID>.mjs
 *   EVIDENCE_PHASE=after  npm run evidence:collect -- <TICKET-ID> scripts/collect-evidence/<TICKET-ID>.mjs
 *   npm run evidence:story -- <TICKET-ID>
 *
 * ## The three acts are not decoration
 *
 * A reviewer who was not in the ticket needs to know what the user was trying to do before a
 * screenshot of a broken screen means anything. Act 1 establishes that, Act 2 shows the
 * behaviour, Act 3 proves the criterion and shows the neighbouring features still work. The
 * runner asserts all three acts are present, so a capture cannot quietly become a pile of
 * screenshots again.
 *
 * ## Every scene names a criterion
 *
 * `criterion` is an id from the acceptance criteria written during ticket analysis
 * (`fix-bug` Phase 1a). A scene without one fails the run: "it looked right" is the claim
 * this artifact exists to replace.
 *
 * ## The same file produces both halves
 *
 * Do not branch on `EVIDENCE_PHASE` inside a scene. The before and after runs must perform
 * identical actions so the only difference in the output is the fix — that is what makes the
 * side-by-side comparison evidence rather than illustration.
 *
 * ## Public routes (e.g. login)
 *
 * Optional export: `export const skipHttpCredentials = true;`
 * Skips Playwright `httpCredentials` so Nuxeo `/me` hydration does not auto-sign-in before
 * the login form renders. Scenes that need an authenticated session still call `h.login()`.
 */

/** One line for the title card and the top of STORY.md. */
export const summary = 'Vocabulary labels render raw i18n keys instead of their translations';

export const scenes = [
  {
    act: 1,
    title: 'Open the vocabulary the ticket names',
    intent: 'An administrator reviewing the country vocabulary before editing an entry',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.goTo('/#/administration/vocabularies');
      await h.expectVisible('the vocabularies page renders', 'mat-select');
      await h.shot('vocabularies-page', { highlight: 'mat-select', label: 'Vocabulary picker' });
    },
  },

  {
    act: 2,
    // Keep the wording neutral — the same file runs before and after, so a title that says
    // "the bug" is wrong in half the runs.
    title: 'Read the Label column',
    intent: 'The column that should show a human-readable label for each entry',
    criterion: 'AC-1',
    hold: 3000,
    // Outline this element in the recording so a viewer knows where to look. Red on the
    // before half, green on after — derived from the phase, not settable here. It never
    // appears in the screenshots, and the run fails if the outline stops pointing at it.
    spotlight: { selector: 'td.mat-column-label', label: 'Label column' },
    async run(page, h) {
      const cell = page.locator('td.mat-column-label').first();
      await h.expectVisible('the label column has rows', 'td.mat-column-label');

      // Assert the actual content, not that something rendered. A screenshot cannot tell a
      // translated label from an untranslated key at a glance, so the DOM has to.
      const text = (await cell.innerText().catch(() => '')).trim();
      h.check('label is not a raw i18n key', !/^[a-z]+(\.[a-zA-Z]+)+$/.test(text), `label reads "${text}"`);

      await h.shot('label-column', { highlight: 'td.mat-column-label', label: 'Label column' });
    },
  },

  {
    act: 3,
    title: 'The rest of the screen still works',
    intent: 'Confirming the change did not disturb the neighbouring behaviour',
    criterion: 'AC-2',
    async run(page, h) {
      await h.expectVisible('the entry table still renders', 'table');
      h.note('sorting and pagination were not exercised — out of scope for this fix');
      await h.expectNoConsoleErrors();
      await h.shot('final-state');
    },
  },
];
