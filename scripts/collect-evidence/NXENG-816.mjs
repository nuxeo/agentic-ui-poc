/**
 * NXENG-816 — Zoom in keyboard focus ring (IBM 911144409 / WCAG 2.4.7).
 *
 *   NUXEO_DOC_UID=<Picture document> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-816 scripts/collect-evidence/NXENG-816.mjs
 */
export const summary =
  'Document viewer Zoom in toolbar control shows a visible keyboard focus indicator';

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

export const scenes = [
  {
    act: 1,
    title: 'Open document detail Preview',
    intent: 'Reach the image viewer toolbar on a picture document',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('document detail', 'lib-document-detail');
      await openImagePreview(page);
      await h.expectVisible('document viewer', 'lib-document-viewer');
      await h.shot('context', {
        highlight: 'lib-document-viewer .viewer-toolbar',
        label: 'Image toolbar',
      });
    },
  },
  {
    act: 2,
    title: 'Focus Zoom in',
    intent: 'Keyboard user tabbing to the Zoom in icon button (IBM 911144409)',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: {
      selector: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
      label: 'Zoom in',
    },
    async run(page, h) {
      await openImagePreview(page);
      const btn = page.locator(
        'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
      );
      h.check('Zoom in control exists', (await btn.count()) > 0, 'Picture with image preview');
      await btn.focus();
      const o = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          active: document.activeElement === el,
        };
      });
      h.check('button receives focus', o.active === true, String(o.active));
      h.check(
        'outline is visible',
        o.outlineStyle !== 'none' && o.outlineWidth !== '0px',
        `${o.outlineStyle} ${o.outlineWidth}`,
      );
      await h.shot('zoom-in-focused', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
        label: 'Zoom in focused',
      });
    },
  },
  {
    act: 3,
    title: 'Confirm focus ring style',
    intent: 'WCAG 2.4.7 — 2px focus indicator on the toolbar strip',
    criterion: 'AC-2',
    async run(page, h) {
      const btn = page.locator(
        'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
      );
      await btn.focus();
      const w = await btn.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline width', w === '2px', w ?? 'missing');
      await h.expectNoConsoleErrors('image toolbar', [
        /automation\/AI\./,
        /bootstrap\.json/,
        /\/nuxeo\/logout/,
      ]);
      await h.shot('focus-ring-proof', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Zoom in"]',
        label: 'Focus ring',
      });
    },
  },
];
