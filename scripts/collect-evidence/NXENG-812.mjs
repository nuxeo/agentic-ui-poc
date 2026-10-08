/** NXENG-812 — Preview tab `.info-label` (picture metadata) WCAG 1.4.3 AA contrast (IBM 716638997). */

export const summary =
  'Document detail Preview tab picture metadata labels meet WCAG AA text contrast';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();
const WCAG_AA = 4.5;

/** @param {import('@playwright/test').Page} page */
async function contrastRatioFor(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ok: false, reason: 'missing element' };
    const fg = getComputedStyle(el).color;
    const parseColor = (css) => {
      if (!css || css.trim() === 'transparent') return null;
      const m = /^rgba?\(([^)]+)\)$/.exec(css.trim());
      if (!m) return null;
      const parts = m[1]
        .split(/[,\s/]+/)
        .filter(Boolean)
        .map(Number);
      if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
      return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
    };
    let node = el.parentElement;
    let bg = 'rgb(255, 255, 255)';
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      const parsed = parseColor(c);
      if (parsed && parsed.alpha === 1) {
        bg = c;
        break;
      }
      node = node.parentElement;
    }
    const compositeOver = (color, backdropRgb) =>
      color.rgb.map((c, i) => Math.round(c * color.alpha + backdropRgb[i] * (1 - color.alpha)));
    const lum = ([r, g, b]) => {
      const ch = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
    };
    const ratio = (fgRgb, bgRgb) => {
      const [hi, lo] = [lum(fgRgb), lum(bgRgb)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const fgColor = parseColor(fg);
    const bgColor = parseColor(bg);
    if (!fgColor || !bgColor || bgColor.alpha !== 1) {
      return { ok: false, reason: `unmeasurable colours fg=${fg} bg=${bg}`, fg, bg };
    }
    const painted = compositeOver(fgColor, bgColor.rgb);
    const r = ratio(painted, bgColor.rgb);
    return { ok: true, ratio: r, fg, bg, text: el.textContent?.trim() ?? '' };
  }, selector);
}

export const scenes = [
  {
    act: 1,
    title: 'Open a picture on Document detail',
    intent: 'Review picture metadata in the Preview tab viewer strip',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('document viewer', 'lib-document-viewer');
      await h.shot('viewer-context', {
        highlight: 'lib-document-viewer .picture-cards',
        label: 'Picture metadata strip',
      });
    },
  },
  {
    act: 2,
    title: 'Read picture metadata labels',
    intent: 'Weight / dimensions labels beside values in the viewer footer strip',
    criterion: 'AC-1',
    hold: 2500,
    spotlight: { selector: 'lib-document-viewer .info-label', label: 'Metadata label' },
    async run(page, h) {
      const label = page.locator('lib-document-viewer .info-label').first();
      await h.expectVisible('info-label in viewer', 'lib-document-viewer .info-label');
      const text = (await label.innerText().catch(() => '')).trim();
      h.check('label has text', text.length > 0, text || '(empty)');
      await label.focus();
      await h.shot('info-label-focused', {
        highlight: 'lib-document-viewer .info-label',
        label: 'Metadata label',
      });
    },
  },
  {
    act: 3,
    title: 'Contrast meets WCAG AA',
    intent: 'IBM 716638997 — 12px label text on the light picture-cards strip',
    criterion: 'AC-2',
    async run(page, h) {
      const result = await contrastRatioFor(page, 'lib-document-viewer .info-label');
      h.check('contrast measurable', result.ok === true, result.reason ?? 'ok');
      if (result.ok) {
        h.check(
          `contrast ≥ ${WCAG_AA}:1`,
          result.ratio >= WCAG_AA,
          `${result.ratio?.toFixed(2)}:1 fg=${result.fg} bg=${result.bg} "${result.text}"`,
        );
      }
      await h.shot('info-label-contrast-proof', {
        highlight: 'lib-document-viewer .info-label',
        label: 'Metadata label',
      });
    },
  },
];
