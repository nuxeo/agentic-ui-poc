/** NXENG-812 — Preview `.info-label` on picture strip (IBM 716638997). Screenshots only; 1.4.3 is axe-owned. */

export const summary = 'Document detail Preview — picture metadata labels on the viewer strip';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

/** @param {import('@playwright/test').Page} page */
async function openPicturePreview(page) {
  const tab = page.getByRole('tab', { name: /view|preview/i }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ timeout: 15000 });
  }
  await page
    .locator('lib-document-viewer .picture-cards .info-label')
    .first()
    .waitFor({ state: 'visible', timeout: 90000 });
}

export const scenes = [
  {
    act: 1,
    title: 'Open picture Preview',
    intent: 'Picture document with metadata labels visible (AC-1)',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await openPicturePreview(page);
      await h.expectVisible('picture metadata strip', 'lib-document-viewer .picture-cards');
      await h.expectVisible('info-label', 'lib-document-viewer .info-label');
      await h.shot('viewer-context', {
        highlight: 'lib-document-viewer .picture-cards',
        label: 'Picture metadata strip',
      });
    },
  },
  {
    act: 2,
    title: 'Metadata labels readable',
    intent: 'Label/value pairs on the light strip (AC-1)',
    criterion: 'AC-1',
    hold: 2500,
    spotlight: { selector: 'lib-document-viewer .info-label', label: 'Metadata label' },
    async run(page, h) {
      await openPicturePreview(page);
      const text = await page
        .locator('lib-document-viewer .info-label')
        .first()
        .innerText()
        .catch(() => '');
      h.check('label text present', text.trim().length > 0, text.trim() || '(empty)');
      await h.shot('info-label-strip', {
        highlight: 'lib-document-viewer .info-label',
        label: 'Metadata labels',
      });
    },
  },
  {
    act: 3,
    title: 'Strip capture for review',
    intent: 'Contrast proof is Karma + axe; this scene is photographic only',
    criterion: 'AC-2',
    async run(page, h) {
      await openPicturePreview(page);
      await h.expectNoConsoleErrors('document viewer', [/automation\/AI\./, /\/nuxeo\/logout/]);
      await h.shot('info-label-contrast-proof', {
        highlight: 'lib-document-viewer .picture-cards',
        label: 'Metadata strip',
      });
    },
  },
];
