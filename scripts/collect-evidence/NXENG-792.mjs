/**
 * NXENG-792 — Sidebar .sub-tab focus ring (IBM 321710239).
 *
 *   NUXEO_DOC_UID=<any doc detail> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-792 scripts/collect-evidence/NXENG-792.mjs
 */
export const summary = 'Document detail sidebar sub-tabs show a visible keyboard focus ring';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();

export const scenes = [
  {
    act: 1,
    title: 'Open document detail sidebar',
    intent: 'Properties / Comments / Activity tabs',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('properties panel', '.properties-panel');
      await h.shot('sidebar-context', { highlight: '.panel-sub-tabs', label: 'Sub-tabs' });
    },
  },
  {
    act: 2,
    title: 'Focus Activity sub-tab',
    intent: 'Edge tab — ring must not clip in overflow-hidden panel',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: { selector: '.sub-tab', label: 'Sub-tab' },
    async run(page, h) {
      const tabs = page.locator('.properties-panel .sub-tab');
      const count = await tabs.count();
      h.check('sub-tabs present', count >= 3, `count=${count}`);
      const last = tabs.nth(count - 1);
      await last.focus();
      const style = await last.evaluate((el) => {
        const s = getComputedStyle(el);
        return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, active: document.activeElement === el };
      });
      h.check('focus on sub-tab', style.active, String(style.active));
      h.check('visible outline', style.outlineStyle !== 'none' && style.outlineWidth !== '0px', `${style.outlineStyle} ${style.outlineWidth}`);
      await h.shot('sub-tab-focused', { highlight: '.sub-tab', label: 'Sub-tab focused' });
    },
  },
  {
    act: 3,
    title: 'Focus ring proof',
    intent: 'WCAG 2.4.7 visible indicator on :focus',
    criterion: 'AC-2',
    async run(page, h) {
      const tab = page.locator('.properties-panel .sub-tab').first();
      await tab.focus();
      const w = await tab.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline', w === '2px', w ?? 'missing');
      await h.shot('sub-tab-ring-proof', { highlight: '.sub-tab', label: 'Focus ring' });
    },
  },
];
