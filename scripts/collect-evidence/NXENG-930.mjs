/** @typedef {import('@playwright/test').Page} Page */

export const summary =
  'Preview tab Additional Formats format-type label meets WCAG 1.4.3 AA contrast on white';

const DOC_UID = process.env['NUXEO_DOC_UID'] ?? '54016a72-5300-44b0-a96d-06937aa6a887';
const WCAG_AA_NORMAL = 4.5;

function parseRgb(cssColor) {
  const m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function luminance([r, g, b]) {
  const s = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function measureFormatTypeContrast(page) {
  return page.evaluate(() => {
    const el = document.querySelector('lib-document-viewer .format-type');
    if (!el) return { found: false };

    function parseRgba(css) {
      const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], alpha: m[4] !== undefined ? Number(m[4]) : 1 };
    }

    function opaqueBackground(node) {
      let cur = node;
      while (cur && cur instanceof Element) {
        const parsed = parseRgba(getComputedStyle(cur).backgroundColor);
        if (parsed && parsed.alpha > 0.05) return parsed.rgb;
        cur = cur.parentElement;
      }
      return [255, 255, 255];
    }

    const style = getComputedStyle(el);
    const fg = parseRgba(style.color)?.rgb;
    const bg = opaqueBackground(el);
    return {
      found: true,
      text: el.textContent?.trim() ?? '',
      color: style.color,
      backgroundRgb: bg,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fgRgb: fg,
    };
  });
}

export const scenes = [
  {
    act: 1,
    title: 'Open the Picture document on Document detail',
    intent: 'A user reviewing image renditions in the Preview tab',
    criterion: 'AC-3',
    async run(page, h) {
      await h.login();
      await h.goTo(`/#/doc/${DOC_UID}`);
      await h.expectVisible('document detail loads', 'lib-document-detail');
      await h.shot('doc-detail-preview', { highlight: 'lib-document-viewer', label: 'Preview viewer' });
    },
  },
  {
    act: 2,
    title: 'Read the format label in Additional Formats',
    intent: 'The JPEG/PNG format tag beside each rendition size in the viewer strip',
    criterion: 'AC-1',
    hold: 2000,
    spotlight: { selector: 'lib-document-viewer .format-type', label: 'Format type label' },
    async run(page, h) {
      await h.expectVisible('additional formats section', 'lib-document-viewer .picture-card');
      const format = page.locator('lib-document-viewer .format-type').filter({ hasText: /\S/ }).first();
      await format.waitFor({ state: 'visible', timeout: 60000 });
      const raw = await measureFormatTypeContrast(page);
      h.check('format-type element is present', raw.found === true, JSON.stringify(raw));
      const fg = raw.fgRgb ?? parseRgb(raw.color);
      const bg = raw.backgroundRgb ?? [255, 255, 255];
      let ratio = 0;
      if (fg && bg) ratio = contrastRatio(fg, bg);
      h.check(
        'format-type contrast meets WCAG AA (4.5:1)',
        ratio >= WCAG_AA_NORMAL,
        `ratio=${ratio.toFixed(2)} color=${raw.color} bg=rgb(${bg.join(',')})`,
      );
      await h.shot('format-type-label', {
        highlight: 'lib-document-viewer .format-type',
        label: 'Format type label',
      });
    },
  },
  {
    act: 3,
    title: 'Confirm preview tab layout after the contrast fix',
    intent: 'Smoke check that the viewer footer still renders on document detail (not a keyboard/auth regression suite)',
    criterion: 'AC-2',
    async run(page, h) {
      await h.expectVisible('viewer footer still present', 'lib-document-viewer .viewer-footer');
      const url = page.url();
      h.check('still on document detail route', /#\/doc\//.test(url), url);
      await h.shot('viewer-footer-intact', {
        highlight: 'lib-document-viewer .viewer-footer',
        label: 'Viewer footer',
      });
    },
  },
];
