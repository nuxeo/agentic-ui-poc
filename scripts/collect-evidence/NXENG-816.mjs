/**
 * NXENG-816 — Zoom in keyboard focus ring (IBM 911144409 / WCAG 2.4.7).
 * Evidence is photographic; regression is Karma (`document-viewer-toolbar-focus-ring.spec.ts`).
 * WCAG verdicts are owned by axe runtime (`docs/accessibility.md`).
 *
 *   NUXEO_DOC_UID=<Picture document> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-816 scripts/collect-evidence/NXENG-816.mjs
 */
export const summary =
  'Document viewer Zoom in toolbar — keyboard focus (screenshots for IBM 911144409)';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

/** @param {import('@playwright/test').Page} page */
async function openImagePreview(page) {
  const tab = page.getByRole('tab', { name: /view|preview/i }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ timeout: 15000 });
  }
  const zoomIn = page.locator('lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]');
  await zoomIn.waitFor({ state: 'visible', timeout: 90000 });
  await zoomIn.scrollIntoViewIfNeeded();
}

/** @param {import('@playwright/test').Page} page */
async function tabToZoomIn(page) {
  for (let i = 0; i < 50; i += 1) {
    const active = await page.evaluate(
      () => document.activeElement?.getAttribute('aria-label') ?? '',
    );
    if (active === 'Zoom in') return true;
    await page.keyboard.press('Tab');
  }
  return false;
}

export const scenes = [
  {
    act: 1,
    title: 'Open document detail Preview',
    intent: 'Picture document with image viewer toolbar (AC-1)',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('document detail', 'lib-document-detail');
      await openImagePreview(page);
      await h.expectVisible('Zoom in control', 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]');
      await h.shot('context', {
        highlight: 'lib-document-viewer .viewer-toolbar',
        label: 'Image toolbar',
      });
    },
  },
  {
    act: 2,
    title: 'Tab to Zoom in',
    intent: 'Keyboard path to Zoom in before/after fix (AC-2)',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: {
      selector: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
      label: 'Zoom in',
    },
    async run(page, h) {
      await openImagePreview(page);
      await page.keyboard.press('Tab');
      const reached = await tabToZoomIn(page);
      h.check('Tab reached Zoom in', reached, reached ? 'focused' : 'not focused after Tab walk');
      await h.shot('zoom-in-focused', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
        label: 'Zoom in after keyboard Tab',
      });
    },
  },
  {
    act: 3,
    title: 'Capture without console noise',
    intent: 'Stable viewer strip for review package',
    criterion: 'AC-2',
    async run(page, h) {
      await openImagePreview(page);
      await h.expectNoConsoleErrors('image toolbar', [
        /automation\/AI\./,
        /bootstrap\.json/,
        /\/nuxeo\/logout/,
      ]);
      await h.shot('focus-ring-proof', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
        label: 'Toolbar strip',
      });
    },
  },
];
