/**

 * NXENG-817 — Rotate left toolbar focus (IBM 922184956). Screenshots + Tab path;

 * Karma regression for outline/contrast; a11y-scout owns focus visibility at scan time.
 * This harness does not assert ring appearance (`docs/accessibility.md`).

 */

export const summary =

  'Document detail Preview — Rotate left keyboard focus (screenshots)';



const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();



/** @param {import('@playwright/test').Page} page */

async function openImagePreview(page) {

  const rotate = page.locator(

    'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',

  );

  if (!(await rotate.isVisible().catch(() => false))) {

    const tab = page.getByRole('tab', { name: /view|preview/i }).first();

    if (await tab.isVisible().catch(() => false)) {

      await tab.click({ timeout: 15000 });

    }

  }

  await rotate.waitFor({ state: 'visible', timeout: 90000 });

}



/** @param {import('@playwright/test').Page} page */

async function tabToRotateLeft(page) {

  for (let i = 0; i < 50; i += 1) {

    const active = await page.evaluate(

      () => document.activeElement?.getAttribute('aria-label') ?? '',

    );

    if (active === 'Rotate left') return true;

    await page.keyboard.press('Tab');

  }

  return false;

}



export const scenes = [

  {

    act: 1,

    title: 'Open Preview with toolbar',

    intent: 'Picture document; Rotate left on image toolbar (AC-1)',

    criterion: 'AC-1',

    async run(page, h) {

      await h.login();

      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');

      await h.goToDoc(DOC_UID);

      await openImagePreview(page);

      await h.expectVisible(

        'Rotate left',

        'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',

      );

      await h.shot('context', {

        highlight: 'lib-document-viewer .viewer-toolbar',

        label: 'Toolbar with Rotate left',

      });

    },

  },

  {

    act: 2,

    title: 'Tab to Rotate left',

    intent: 'Keyboard focus path (AC-2)',

    criterion: 'AC-2',

    hold: 2000,

    spotlight: {

      selector: 'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',

      label: 'Rotate left',

    },

    async run(page, h) {

      await openImagePreview(page);

      await page.keyboard.press('Tab');

      const reached = await tabToRotateLeft(page);

      h.check('Tab reached Rotate left', reached, reached ? 'focused' : 'not after Tab walk');

      await h.shot('rotate-left-focused', {

        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',

        label: 'Rotate left after Tab',

      });

    },

  },

  {

    act: 3,

    title: 'Stable toolbar capture',

    intent: 'No layout regression signal in capture (AC-3 photographic)',

    criterion: 'AC-3',

    async run(page, h) {

      await openImagePreview(page);

      await h.expectNoConsoleErrors('viewer toolbar', [/automation\/AI\./, /\/nuxeo\/logout/]);

      await h.shot('rotate-left-ring-proof', {

        highlight: 'lib-document-viewer .viewer-toolbar',

        label: 'Toolbar strip',

      });

    },

  },

];


