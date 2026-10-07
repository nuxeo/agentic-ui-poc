/** @typedef {import('./runner-types.mjs').EvidenceHelpers} EvidenceHelpers */

export const summary =
  'Document detail sidebar sub-tab buttons show a visible keyboard focus ring (WCAG 2.4.7)';

export const scenes = [
  {
    act: 1,
    title: 'Open a document in the detail view',
    intent: 'Review metadata in the right-hand properties sidebar',
    criterion: 'AC-1',
    async run(page, h) {
      const docUid = process.env['NUXEO_DOC_UID'];
      h.check('NUXEO_DOC_UID is set', Boolean(docUid), 'set NUXEO_DOC_UID for beta document');
      if (!docUid) return;

      await h.login();
      await h.goToDoc(docUid);
      await h.expectVisible('document detail loads', 'lib-document-detail');
      await h.shot('doc-detail-context', { highlight: 'aside.properties-panel', label: 'Properties sidebar' });
    },
  },
  {
    act: 2,
    title: 'Tab to the Activity sub-tab control',
    intent: 'Switch sidebar sections with the keyboard',
    criterion: 'AC-1',
    spotlight: { selector: 'aside.properties-panel .sub-tab:nth-child(3)', label: 'Activity sub-tab' },
    async run(page, h) {
      const activityTab = page.locator('aside.properties-panel .sub-tab').nth(2);
      await activityTab.focus();
      await page.waitForTimeout(400);

      const styles = await activityTab.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outlineStyle: s.outlineStyle,
          outlineWidth: s.outlineWidth,
          outlineColor: s.outlineColor,
        };
      });

      h.check('focus outline is painted', styles.outlineStyle !== 'none', `outline-style=${styles.outlineStyle}`);
      h.check(
        'focus outline is at least 2px',
        Number.parseFloat(styles.outlineWidth) >= 2,
        `outline-width=${styles.outlineWidth}`,
      );
      h.check('outline colour is set', styles.outlineColor !== 'rgba(0, 0, 0, 0)', `outline-color=${styles.outlineColor}`);

      await h.shot('activity-sub-tab-focused', {
        highlight: 'aside.properties-panel .sub-tab:nth-child(3)',
        label: 'Keyboard focus on Activity sub-tab',
      });
    },
  },
  {
    act: 3,
    title: 'Confirm Comments sub-tab still receives focus',
    intent: 'Adjacent sidebar tabs remain keyboard operable',
    criterion: 'AC-3',
    async run(page, h) {
      const commentsTab = page.locator('aside.properties-panel .sub-tab').nth(1);
      await commentsTab.focus();
      const styles = await commentsTab.evaluate((el) => getComputedStyle(el).outlineStyle);
      h.check('Comments sub-tab shows focus outline', styles !== 'none', `outline-style=${styles}`);
      await h.shot('comments-sub-tab-focused', {
        highlight: 'aside.properties-panel .sub-tab:nth-child(2)',
        label: 'Keyboard focus on Comments sub-tab',
      });
    },
  },
];
