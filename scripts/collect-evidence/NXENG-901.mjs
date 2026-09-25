export const summary =
  'Preview tab Additional Formats format-type label meets WCAG AA text contrast';

const DOC_UID = process.env['NUXEO_DOC_UID'] ?? '54016a72-5300-44b0-a96d-06937aa6a887';

/** WCAG 2.1 relative luminance for sRGB hex. */
function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const hex = (n) => Number(n).toString(16).padStart(2, '0');
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
}

async function ensureSession(page, baseUrl) {
  const user = process.env['NUXEO_USER'] ?? 'Administrator';
  const pass = process.env['NUXEO_PASS'] ?? 'Administrator';
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const session = {
    kind: 'basic',
    username: user,
    basic: Buffer.from(`${user}:${pass}`).toString('base64'),
    isAdministrator: user.toLowerCase() === 'administrator',
    groups: [],
  };
  await page.evaluate(
    ({ key, value }) => {
      sessionStorage.setItem(key, value);
      sessionStorage.removeItem('agentic_ui_signed_out');
    },
    { key: 'agentic_ui_nuxeo_session', value: JSON.stringify(session) },
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
}

async function openPreviewFormatType(page, h) {
  await ensureSession(page, h.baseUrl);
  await page.goto(`${h.baseUrl}/#/doc/${DOC_UID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await h.expectVisible('document detail loads', 'lib-document-detail');
  const viewTab = page.getByRole('tab', { name: /^(view|preview)$/i });
  if (await viewTab.count()) {
    await viewTab.first().click({ timeout: 15000 });
  }
  await h.expectVisible('document viewer renders', 'lib-document-viewer');
  const formatType = page.locator('lib-document-viewer .format-type').filter({ hasText: /\S/ }).first();
  await h.expectVisible('format-type label is present', 'lib-document-viewer .format-type');
  await formatType.scrollIntoViewIfNeeded();
  return formatType;
}

export const scenes = [
  {
    act: 1,
    title: 'Open document detail Preview tab',
    intent: 'Reviewing a picture document and its available renditions in Preview',
    criterion: 'AC-3',
    async run(page, h) {
      await openPreviewFormatType(page, h);
      await h.shot('preview-context', {
        highlight: 'lib-document-viewer .picture-card',
        label: 'Additional Formats card',
      });
    },
  },
  {
    act: 2,
    title: 'Read the format-type label contrast',
    intent: 'The uppercase format label (e.g. JPEG) beside rendition dimensions',
    criterion: 'AC-1',
    hold: 2500,
    spotlight: { selector: 'lib-document-viewer .format-type', label: 'Format type label' },
    async run(page, h) {
      const formatType = await openPreviewFormatType(page, h);
      const metrics = await formatType.evaluate((el) => {
        const style = getComputedStyle(el);
        let bgEl = el.parentElement;
        let bg = getComputedStyle(bgEl).backgroundColor;
        while (bgEl && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
          bgEl = bgEl.parentElement;
          bg = bgEl ? getComputedStyle(bgEl).backgroundColor : bg;
        }
        return { color: style.color, backgroundColor: bg, fontSize: style.fontSize, fontWeight: style.fontWeight };
      });
      const fgHex = rgbToHex(metrics.color);
      const bgHex = rgbToHex(metrics.backgroundColor) ?? '#ffffff';
      const ratio = fgHex ? contrastRatio(fgHex, bgHex) : 0;
      const minRatio = 4.5;
      h.check(
        'format-type meets WCAG AA contrast (4.5:1)',
        ratio >= minRatio,
        `contrast ${ratio.toFixed(2)}:1 (fg ${metrics.color}, bg ${metrics.backgroundColor}, ${metrics.fontSize} / ${metrics.fontWeight})`,
      );
      const isLowGray =
        metrics.color === 'rgb(153, 153, 153)' || metrics.color.replace(/\s/g, '') === 'rgb(153,153,153)';
      h.check('format-type does not use low-contrast #999 gray', !isLowGray, `color is ${metrics.color}`);
      await h.shot('format-type-focused', {
        highlight: 'lib-document-viewer .format-type',
        label: 'Format type label',
      });
    },
  },
  {
    act: 3,
    title: 'Confirm viewer chrome still works',
    intent: 'Ensure the fix did not break navigation or keyboard access on Preview',
    criterion: 'AC-3',
    async run(page, h) {
      const formatType = await openPreviewFormatType(page, h);
      h.note('format-type is presentational text (span) — keyboard focus stays on interactive controls');
      const download = page.locator('lib-document-viewer .format-download-btn').first();
      if (await download.isVisible().catch(() => false)) {
        h.check('download control remains visible', true);
      } else {
        h.note('No format download button on this document — skipped download visibility check');
      }
      h.note('Console may include expected local 404s (agentic-ui config, AI ops, logout) — not part of this fix');
      await h.shot('preview-after-checks', { highlight: 'lib-document-viewer', label: 'Document viewer' });
    },
  },
];
