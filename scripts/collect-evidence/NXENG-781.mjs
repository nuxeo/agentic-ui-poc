/**
 * NXENG-781 — Download FullHD keyboard focus ring (IBM 247628794).
 *
 *   NUXEO_DOC_UID=<Picture with FullHD rendition> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-781 scripts/collect-evidence/NXENG-781.mjs
 */
export const summary = 'Download FullHD shows a visible keyboard focus indicator on the preview strip';

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
    intent: 'Reach Additional formats download controls on a picture document',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('document detail', 'lib-document-detail');
      await ensureAdditionalFormats(page);
      await h.expectVisible('document viewer', 'lib-document-viewer');
      await h.shot('context', { highlight: 'lib-document-viewer .format-row', label: 'Additional formats' });
    },
  },
  {
    act: 2,
    title: 'Focus Download FullHD',
    intent: 'Keyboard user tabbing to the FullHD download icon button',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: { selector: 'lib-document-viewer .format-download-btn', label: 'Download FullHD' },
    async run(page, h) {
      await ensureAdditionalFormats(page);
      const btn = formatDownloadButton(page, 'FullHD');
      h.check('Download FullHD control exists', (await btn.count()) > 0, 'Picture with FullHD rendition');
      await btn.first().focus();
      const o = await btn.first().evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          active: document.activeElement === el,
        };
      });
      h.check('button receives focus', o.active === true, String(o.active));
      h.check('outline is visible', o.outlineStyle !== 'none' && o.outlineWidth !== '0px', `${o.outlineStyle} ${o.outlineWidth}`);
      await h.shot('focused-fullhd', {
        highlight: 'lib-document-viewer .format-row:has(.format-name)',
        label: 'Download FullHD focused',
      });
    },
  },
  {
    act: 3,
    title: 'Confirm focus ring style',
    intent: 'WCAG 2.4.7 — 2px focus indicator on the light strip',
    criterion: 'AC-2',
    async run(page, h) {
      const btn = formatDownloadButton(page, 'FullHD').first();
      await btn.focus();
      const w = await btn.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline width', w === '2px', w ?? 'missing');
      await h.expectNoConsoleErrors('preview strip', [
        /automation\/AI\./,
        /bootstrap\.json/,
        /\/nuxeo\/logout/,
      ]);
      await h.shot('focus-ring-proof', {
        highlight: 'lib-document-viewer .format-download-btn',
        label: 'Focus ring',
      });
    },
  },
];
