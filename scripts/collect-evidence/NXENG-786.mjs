/**
 * NXENG-786 — Download Medium keyboard focus ring (IBM 298748541).
 *
 *   NUXEO_DOC_UID=<Picture with Medium rendition> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-786 scripts/collect-evidence/NXENG-786.mjs
 */
export const summary = 'Download Medium shows a visible keyboard focus indicator on the preview strip';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

/** @param {import('@playwright/test').Page} page */
async function ensureAdditionalFormats(page) {
  const tab = page.getByRole('tab', { name: /view|preview/i }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ timeout: 15000 });
  }
  const firstDownload = page.locator('lib-document-viewer .format-download-btn').first();
  await firstDownload.waitFor({ state: 'visible', timeout: 90000 });
  await firstDownload.scrollIntoViewIfNeeded();
}

/** @param {import('@playwright/test').Page} page */
function formatDownloadButton(page, renditionTitle) {
  return page
    .locator('lib-document-viewer .format-row')
    .filter({ has: page.locator('.format-name', { hasText: renditionTitle }) })
    .locator('button.format-download-btn');
}

export const scenes = [
  {
    act: 1,
    title: 'Open document detail Preview',
    intent: 'Reach Additional formats download controls',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await ensureAdditionalFormats(page);
      await h.expectVisible('document viewer', 'lib-document-viewer');
      await h.shot('context', { highlight: 'lib-document-viewer', label: 'Preview' });
    },
  },
  {
    act: 2,
    title: 'Focus Download Medium',
    intent: 'Keyboard focus on Medium rendition download',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: { selector: 'lib-document-viewer .format-download-btn', label: 'Download Medium' },
    async run(page, h) {
      await ensureAdditionalFormats(page);
      const btn = formatDownloadButton(page, 'Medium').first();
      h.check('Download Medium exists', (await formatDownloadButton(page, 'Medium').count()) > 0, 'Picture with Medium rendition');
      await btn.focus();
      const style = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, active: document.activeElement === el };
      });
      h.check('focus received', style.active, String(style.active));
      h.check('visible outline', style.outlineStyle !== 'none' && style.outlineWidth !== '0px', `${style.outlineStyle} ${style.outlineWidth}`);
      await h.shot('focused-medium', {
        highlight: 'lib-document-viewer .format-row',
        label: 'Download Medium focused',
      });
    },
  },
  {
    act: 3,
    title: 'Focus ring proof',
    intent: 'Same .format-download-btn styling as FullHD (NXENG-781)',
    criterion: 'AC-3',
    async run(page, h) {
      const btn = formatDownloadButton(page, 'Medium').first();
      await btn.focus();
      const w = await btn.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline', w === '2px', w ?? 'missing');
      await h.shot('medium-ring-proof', {
        highlight: 'lib-document-viewer .format-download-btn',
        label: 'Focus ring',
      });
    },
  },
];
