/**
 * Quill toolbar control order for HTML notes — matches Classic Web UI note RTE
 * (Normal → formatting → blockquote/code → lists → alignment → colors →
 * scripts → indent → link/image/video → clear formatting).
 *
 * Used by the unit tests to keep toolbar parity stable, and to check each control's accessible
 * name is the catalogue text for its `labelKey`.
 */
export const NOTE_QUILL_TOOLBAR_CONTROLS = [
  { selector: 'select.ql-header', labelKey: 'document-detail.note-editor.text-style' },
  { selector: 'button.ql-bold', labelKey: 'document-detail.note-editor.bold' },
  { selector: 'button.ql-italic', labelKey: 'document-detail.note-editor.italic' },
  { selector: 'button.ql-underline', labelKey: 'document-detail.note-editor.underline' },
  { selector: 'button.ql-strike', labelKey: 'document-detail.note-editor.strikethrough' },
  { selector: 'button.ql-blockquote', labelKey: 'document-detail.note-editor.blockquote' },
  { selector: 'button.ql-code-block', labelKey: 'document-detail.note-editor.code-block' },
  {
    selector: 'button.ql-list[value="bullet"]',
    labelKey: 'document-detail.note-editor.bulleted-list',
  },
  {
    selector: 'button.ql-list[value="ordered"]',
    labelKey: 'document-detail.note-editor.numbered-list',
  },
  { selector: 'button.ql-align', labelKey: 'document-detail.note-editor.align-left' },
  {
    selector: 'button.ql-align[value="center"]',
    labelKey: 'document-detail.note-editor.align-center',
  },
  {
    selector: 'button.ql-align[value="right"]',
    labelKey: 'document-detail.note-editor.align-right',
  },
  { selector: 'button.ql-align[value="justify"]', labelKey: 'document-detail.note-editor.justify' },
  { selector: 'select.ql-color', labelKey: 'document-detail.note-editor.text-color' },
  { selector: 'select.ql-background', labelKey: 'document-detail.note-editor.highlight-color' },
  { selector: 'button.ql-script[value="sub"]', labelKey: 'document-detail.note-editor.subscript' },
  {
    selector: 'button.ql-script[value="super"]',
    labelKey: 'document-detail.note-editor.superscript',
  },
  {
    selector: 'button.ql-indent[value="-1"]',
    labelKey: 'document-detail.note-editor.decrease-indent',
  },
  {
    selector: 'button.ql-indent[value="+1"]',
    labelKey: 'document-detail.note-editor.increase-indent',
  },
  { selector: 'button.ql-link', labelKey: 'document-detail.note-editor.insert-link' },
  { selector: 'button.ql-image', labelKey: 'document-detail.note-editor.insert-image' },
  {
    selector: 'button.note-quill-image-from-docs',
    labelKey: 'document-detail.note-editor.insert-image-from-existing-documents',
  },
  { selector: 'button.ql-video', labelKey: 'document-detail.note-editor.insert-video' },
  { selector: 'button.ql-clean', labelKey: 'document-detail.note-editor.clear-formatting' },
] as const;
