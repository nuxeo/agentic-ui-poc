import { NOTE_QUILL_TOOLBAR_CONTROLS } from './note-quill-toolbar';

describe('note-quill-toolbar', () => {
  it('defines Web UI parity toolbar control order without table', () => {
    const selectors = NOTE_QUILL_TOOLBAR_CONTROLS.map((c) => c.selector);
    expect(selectors).not.toContain('button.ql-table');
    expect(selectors.indexOf('button.ql-link')).toBeLessThan(selectors.indexOf('button.ql-image'));
    expect(selectors.indexOf('button.ql-image')).toBeLessThan(
      selectors.indexOf('button.note-quill-image-from-docs'),
    );
    expect(selectors.indexOf('button.note-quill-image-from-docs')).toBeLessThan(
      selectors.indexOf('button.ql-video'),
    );
    expect(selectors.indexOf('button.ql-align[value="justify"]')).toBeLessThan(
      selectors.indexOf('select.ql-color'),
    );
    expect(selectors.at(-1)).toBe('button.ql-clean');
  });
});
