/** NXENG-856 — Preview tab `.format-type` label WCAG 1.4.3 AA contrast. */

export const summary =
  'Document detail Preview tab format-type label meets WCAG AA text contrast';

const DOC_UID = process.env['NUXEO_DOC_UID'] ?? '0ce540ce-9c47-44d5-8c78-5e47d1e0a91a';

/** @param {import('@playwright/test').Page} page */
async function contrastRatioFor(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ok: false, reason: 'missing element' };
    const fg = getComputedStyle(el).color;
    let node = el.parentElement;
    let bg = 'rgb(255, 255, 255)';
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && !c.startsWith('rgba(0, 0, 0,')) {
        bg = c;
        break;
      }
      node = node.parentElement;
    }
    const parse = (css) => {
      const m = css.match(/[\d.]+/g)?.map(Number) ?? [];
      return [m[0] ?? 0, m[1] ?? 0, m[2] ?? 0];
    };
    const lum = ([r, g, b]) => {
      const ch = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const r = ratio(parse(fg), parse(bg));
    return { ok: true, ratio: r, fg, bg, text: el.textContent?.trim() ?? '' };
  }, selector);
}

export const scenes = [
  {
    act: 1,
    title: 'Open a picture on Document detail',
    intent: 'Review additional renditions in the Preview tab viewer strip',
    criterion: 'AC-3',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition(
        'NUXEO_DOC_UID is set',
        Boolean(DOC_UID),
        'Set NUXEO_DOC_UID to a Picture with Additional formats',
      );
      await h.goToDoc(DOC_UID);
      await h.expectVisible('document detail loads', 'lib-document-detail');
      await h.shot('doc-detail', { highlight: 'lib-document-detail', label: 'Document detail' });
    },
  },
  {
    act: 2,
    title: 'Read the format label in Additional formats',
    intent: 'The uppercase format name beside each rendition size',
    criterion: 'AC-1',
    hold: 2500,
    spotlight: { selector: 'lib-document-viewer .format-type', label: 'Format type label' },
    async run(page, h) {
      const viewTab = page.getByRole('tab', { name: /view|preview/i }).first();
      if (await viewTab.isVisible().catch(() => false)) {
        await viewTab.click({ timeout: 15000 });
      }
      await h.expectVisible('document viewer', 'lib-document-viewer');
      const format = page.locator('lib-document-viewer .format-type').filter({ hasText: /\S/ }).first();
      await format.waitFor({ state: 'visible', timeout: 30000 });
      await format.scrollIntoViewIfNeeded();
      h.check('format-type label visible', await format.isVisible(), 'lib-document-viewer .format-type');
      const text = (await format.innerText()).trim();
      h.check('format label is non-empty', text.length > 0, `reads "${text}"`);
      await h.shot('format-type-row', {
        highlight: 'lib-document-viewer .format-row',
        label: 'Additional formats row',
      });
    },
  },
  {
    act: 3,
    title: 'Measure contrast on the format-type label',
    intent: 'WCAG 2.1 SC 1.4.3 AA requires 4.5:1 for 11px body text',
    criterion: 'AC-1',
    hold: 2000,
    spotlight: { selector: 'lib-document-viewer .format-type', label: 'Format type label' },
    async run(page, h) {
      const viewTab = page.getByRole('tab', { name: /view|preview/i }).first();
      if (await viewTab.isVisible().catch(() => false)) {
        await viewTab.click({ timeout: 15000 }).catch(() => {});
      }
      await h.expectVisible('format-type label', 'lib-document-viewer .format-type');
      const result = await contrastRatioFor(page, 'lib-document-viewer .format-type');
      h.check(
        'contrast ratio is measurable',
        result.ok === true,
        result.reason ?? `fg ${result.fg} on ${result.bg}`,
      );
      if (result.ok) {
        h.check(
          'format-type meets WCAG AA 4.5:1',
          result.ratio >= 4.5,
          `${result.ratio.toFixed(2)}:1 for "${result.text}"`,
        );
      }
      await h.expectNoConsoleErrors('view tab', [
        /agentic-ui/i,
        /AI\.Insights/i,
        /\/nuxeo\/logout/i,
      ]);
      await h.shot('format-type-contrast', {
        highlight: 'lib-document-viewer .format-type',
        label: 'Format type label',
      });
    },
  },
];
