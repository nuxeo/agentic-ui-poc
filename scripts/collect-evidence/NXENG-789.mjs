/**
 * NXENG-789 — Header .ke-action-btn focus ring (IBM 299839583).
 *
 *   NUXEO_DOC_UID=<any doc detail> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-789 scripts/collect-evidence/NXENG-789.mjs
 */
export const summary = 'Document detail header action shows a visible keyboard focus ring';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

export const scenes = [
  {
    act: 1,
    title: 'Open document detail header',
    intent: 'Reach Share / Export / header actions',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('detail header', '.detail-header');
      await h.shot('header-context', { highlight: '.detail-header', label: 'Header' });
    },
  },
  {
    act: 2,
    title: 'Focus a header action button',
    intent: 'Keyboard user on a stroked header control',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: { selector: '.ke-action-btn', label: 'Header action' },
    async run(page, h) {
      const btn = page.locator('.ke-action-btn').first();
      await btn.waitFor({ state: 'visible', timeout: 30000 });
      await btn.focus();
      const style = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, active: document.activeElement === el };
      });
      h.check('focus on ke-action-btn', style.active, String(style.active));
      h.check('visible outline', style.outlineStyle !== 'none' && style.outlineWidth !== '0px', `${style.outlineStyle} ${style.outlineWidth}`);
      await h.shot('header-action-focused', { highlight: '.ke-action-btn', label: 'Header action focused' });
    },
  },
  {
    act: 3,
    title: 'Focus ring on header surface',
    intent: 'Ring visible against .detail-header background',
    criterion: 'AC-2',
    async run(page, h) {
      const btn = page.locator('.ke-action-btn').first();
      await btn.focus();
      const w = await btn.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline', w === '2px', w ?? 'missing');
      await h.expectNoConsoleErrors('header', [
        /automation\/AI\./,
        /bootstrap\.json/,
        /\/nuxeo\/logout/,
      ]);
      await h.shot('header-ring-proof', { highlight: '.ke-action-btn', label: 'Focus ring' });
    },
  },
];
