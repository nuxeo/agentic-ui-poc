/**
 * NXENG-817 — Rotate left (image toolbar) keyboard focus ring (IBM 922184956).
 */
export const summary =
  'Document detail Preview — Rotate left shows a visible keyboard focus indicator';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

/** @param {import('@playwright/test').Page} page */
async function ensureImagePreview(page) {
  const tab = page.getByRole('tab', { name: /view|preview/i }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ timeout: 15000 });
  }
  const toolbar = page.locator('lib-document-viewer .viewer-toolbar');
  await toolbar.waitFor({ state: 'visible', timeout: 90000 });
}

/** @param {import('@playwright/test').Page} page */
function rotateLeftButton(page) {
  return page.locator('lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]');
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
      await ensureImagePreview(page);
      await h.expectVisible('document viewer', 'lib-document-viewer');
      await h.shot('context', { highlight: 'lib-document-viewer .viewer-toolbar', label: 'Toolbar' });
    },
  },
  {
    act: 2,
    title: 'Focus Rotate left',
    intent: 'IBM style_focus_visible on the reported control',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: {
      selector: 'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',
      label: 'Rotate left',
    },
    async run(page, h) {
      await ensureImagePreview(page);
      const btn = rotateLeftButton(page);
      h.check('Rotate left exists', (await btn.count()) > 0, 'Picture with image toolbar');
      await btn.focus();
      const style = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          active: document.activeElement === el,
        };
      });
      h.check('focus received', style.active, String(style.active));
      h.check(
        'visible outline',
        style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
        `${style.outlineStyle} ${style.outlineWidth}`,
      );
      await h.shot('rotate-left-focused', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',
        label: 'Rotate left focused',
      });
    },
  },
  {
    act: 3,
    title: 'Focus ring proof',
    intent: 'WCAG 2.4.7 — 2px ring on :focus (IBM reads :focus only)',
    criterion: 'AC-3',
    async run(page, h) {
      const btn = rotateLeftButton(page);
      await btn.focus();
      const style = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { outlineWidth: s.outlineWidth, outlineOffset: s.outlineOffset };
      });
      h.check('2px outline', style.outlineWidth === '2px', style.outlineWidth ?? 'missing');
      h.check('positive offset', style.outlineOffset === '2px', style.outlineOffset ?? 'missing');
      await h.shot('rotate-left-ring-proof', {
        highlight: 'lib-document-viewer .viewer-toolbar button[aria-label="Rotate left"]',
        label: 'Focus ring',
      });
    },
  },
];
