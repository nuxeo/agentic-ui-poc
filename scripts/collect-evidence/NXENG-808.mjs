/**
 * NXENG-808 — Header toolbar icon button focus ring (IBM 673904446).
 *
 *   NUXEO_DOC_UID=<any doc detail> EVIDENCE_PHASE=after \
 *   npm run evidence:collect -- NXENG-808 scripts/collect-evidence/NXENG-808.mjs
 */
export const summary =
  'Document detail header toolbar icon buttons show a visible keyboard focus ring';

const DOC_UID = process.env['NUXEO_DOC_UID']?.trim();
const TOOLBAR_BTN = '[data-action-id="app.toolbar.addToCollection"]';

export const scenes = [
  {
    act: 1,
    title: 'Open document detail header toolbar',
    intent: 'Reach toolbar actions such as Add to collection',
    criterion: 'AC-1',
    async run(page, h) {
      await h.login();
      await h.requirePrecondition('NUXEO_DOC_UID is set', Boolean(DOC_UID), 'Set NUXEO_DOC_UID');
      await h.goToDoc(DOC_UID);
      await h.expectVisible('detail header', '.detail-header');
      await h.expectVisible('Add to collection toolbar action', TOOLBAR_BTN);
      await h.shot('header-context', { highlight: TOOLBAR_BTN, label: 'Header toolbar' });
    },
  },
  {
    act: 2,
    title: 'Focus Add to collection',
    intent: 'Keyboard user on a header toolbar icon button',
    criterion: 'AC-2',
    hold: 2000,
    spotlight: { selector: TOOLBAR_BTN, label: 'Add to collection' },
    async run(page, h) {
      const btn = page.locator(TOOLBAR_BTN);
      await btn.waitFor({ state: 'visible', timeout: 30000 });
      await btn.focus();
      const style = await btn.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          active: document.activeElement === el,
        };
      });
      h.check('focus on toolbar icon button', style.active, String(style.active));
      h.check(
        'visible outline',
        style.outlineStyle !== 'none' && style.outlineWidth !== '0px',
        `${style.outlineStyle} ${style.outlineWidth}`,
      );
      await h.shot('toolbar-focused', { highlight: TOOLBAR_BTN, label: 'Toolbar button focused' });
    },
  },
  {
    act: 3,
    title: 'Focus ring on header surface',
    intent: 'Ring visible against .detail-header background',
    criterion: 'AC-2',
    async run(page, h) {
      const btn = page.locator(TOOLBAR_BTN);
      await btn.focus();
      const w = await btn.evaluate((el) => getComputedStyle(el).outlineWidth);
      h.check('2px outline', w === '2px', w ?? 'missing');
      await h.expectNoConsoleErrors('header toolbar', [
        /automation\/AI\./,
        /bootstrap\.json/,
        /\/nuxeo\/logout/,
      ]);
      await h.shot('toolbar-ring-proof', { highlight: TOOLBAR_BTN, label: 'Focus ring' });
    },
  },
];
