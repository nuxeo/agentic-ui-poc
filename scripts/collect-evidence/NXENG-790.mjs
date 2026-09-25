/** @typedef {import('playwright').Page} Page */

export const summary =
  'Document detail Preview tab file size label meets WCAG AA text contrast (IBM 300762098)';

function parseColor(css) {
  const m = /rgba?\(([^)]+)\)/.exec(css);
  if (!m) return null;
  const parts = m[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
}

function compositeOver(fg, backdropRgb) {
  return fg.rgb.map((c, i) => Math.round(c * fg.alpha + backdropRgb[i] * (1 - fg.alpha)));
}

function relativeLuminance([r, g, b]) {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : (s + 0.055) ** 2.4 / 1.055 ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrastRatio(fgRgb, bgRgb) {
  const [hi, lo] = [relativeLuminance(fgRgb), relativeLuminance(bgRgb)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite semi-transparent foreground over an opaque footer backdrop before measuring. */
function measureTextContrast(fgCss, bgCss) {
  const fg = parseColor(fgCss);
  const bg = parseColor(bgCss);
  if (!fg || !bg || bg.alpha !== 1) {
    return null;
  }
  const painted = compositeOver(fg, bg.rgb);
  return {
    ratio: contrastRatio(painted, bg.rgb),
    painted,
    backdrop: bg.rgb,
  };
}

function assertContrast(h, label, fgCss, bgCss, minRatio = 4.5) {
  const measured = measureTextContrast(fgCss, bgCss);
  h.check(
    `${label}: computed colours resolve (opaque backdrop)`,
    measured !== null,
    `foreground ${fgCss} on background ${bgCss}`,
  );
  if (measured) {
    h.check(
      `${label}: WCAG AA text contrast (≥ ${minRatio}:1)`,
      measured.ratio >= minRatio,
      `contrast ${measured.ratio.toFixed(2)}:1 (painted rgb(${measured.painted.join(',')}) on rgb(${measured.backdrop.join(',')}))`,
    );
  }
}

export const scenes = [
  {
    act: 1,
    title: 'Open the document Preview tab',
    intent: 'A user reviewing an attachment on document detail before reading file metadata',
    criterion: 'AC-3',
    async run(page, h) {
      h.requirePrecondition(
        'NUXEO_DOC_UID is set',
        Boolean(process.env['NUXEO_DOC_UID']?.trim()),
        'Set NUXEO_DOC_UID to a document with a View-tab attachment before collecting NXENG-790 evidence (see scripts/collect-evidence/README.md).',
      );
      const docUid = process.env['NUXEO_DOC_UID'].trim();
      await h.login();
      await h.goTo(`/#/doc/${docUid}`);
      await h.expectVisible('document detail loads', 'lib-document-detail');
      // Packaged tab id `app.tabs.view` — IBM export calls this region "Preview".
      const viewTab = page.getByRole('tab', { name: /^view$/i });
      if (await viewTab.isVisible().catch(() => false)) {
        await viewTab.click();
      }
      await h.expectVisible('viewer footer renders on the View tab', '.viewer-footer .file-size');
      await h.shot('preview-tab', { highlight: '.viewer-footer', label: 'Preview viewer footer' });
    },
  },
  {
    act: 2,
    title: 'Read the file size label contrast',
    intent: 'Secondary file size text in the viewer footer toolbar region',
    criterion: 'AC-1',
    spotlight: { selector: '.file-size', label: 'File size label' },
    async run(page, h) {
      const size = page.locator('.file-size');
      await h.expectVisible('file size label is shown', '.file-size');
      const text = (await size.innerText()).trim();
      h.check('file size label is non-empty', text.length > 0, `label reads "${text}"`);

      const colors = await size.evaluate((el) => {
        const style = getComputedStyle(el);
        const footer = el.closest('.viewer-footer');
        const footerStyle = footer ? getComputedStyle(footer) : style;
        return { fg: style.color, bg: footerStyle.backgroundColor, fontSize: style.fontSize };
      });
      h.check('file size uses 11px text', colors.fontSize === '11px', `font-size is ${colors.fontSize}`);

      assertContrast(h, 'default theme', colors.fg, colors.bg);

      await page.evaluate(() => document.documentElement.setAttribute('data-app-theme', 'dark'));
      const darkColors = await size.evaluate((el) => {
        const style = getComputedStyle(el);
        const footer = el.closest('.viewer-footer');
        const footerStyle = footer ? getComputedStyle(footer) : style;
        return { fg: style.color, bg: footerStyle.backgroundColor };
      });
      assertContrast(h, 'shipped dark theme', darkColors.fg, darkColors.bg);

      h.note('IBM Equal Access rescan for issue 300762098 (AC-2) was not run; contrast is asserted above (AC-1)');
      await h.shot('file-size-label', { highlight: '.file-size', label: 'File size label' });
    },
  },
  {
    act: 3,
    title: 'Preview tab still usable',
    intent: 'Confirm the viewer and footer actions remain available after the styling change',
    criterion: 'AC-3',
    async run(page, h) {
      await h.expectVisible('file name still visible', '.file-name');
      await h.expectVisible('preview action still present', '.viewer-footer-actions button');
      h.note('IBM Equal Access rescan for issue 300762098 (AC-2) was not run in this harness; contrast is asserted in act 2');
      await h.expectNoConsoleErrors('no unexpected browser console errors', [
        /automation\/AI\./,
        '/nuxeo/api/v1/path/default-domain/config/agentic-ui',
        '/nuxeo/logout',
      ]);
      await h.shot('footer-actions');
    },
  },
];
