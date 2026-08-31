/**
 * Quill toolbar control order for HTML notes — matches Classic Web UI note RTE
 * (Normal → formatting → blockquote/code → lists → alignment → colors →
 * scripts → indent → link/image/video → clear formatting).
 *
 * Used by the template and unit tests to keep toolbar parity stable.
 */
export const NOTE_QUILL_TOOLBAR_CONTROLS = [
  { selector: 'select.ql-header', label: 'Text style' },
  { selector: 'button.ql-bold', label: 'Bold' },
  { selector: 'button.ql-italic', label: 'Italic' },
  { selector: 'button.ql-underline', label: 'Underline' },
  { selector: 'button.ql-strike', label: 'Strikethrough' },
  { selector: 'button.ql-blockquote', label: 'Blockquote' },
  { selector: 'button.ql-code-block', label: 'Code block' },
  { selector: 'button.ql-list[value="bullet"]', label: 'Bulleted list' },
  { selector: 'button.ql-list[value="ordered"]', label: 'Numbered list' },
  { selector: 'button.ql-align', label: 'Align left' },
  { selector: 'button.ql-align[value="center"]', label: 'Align center' },
  { selector: 'button.ql-align[value="right"]', label: 'Align right' },
  { selector: 'button.ql-align[value="justify"]', label: 'Justify' },
  { selector: 'select.ql-color', label: 'Text color' },
  { selector: 'select.ql-background', label: 'Highlight color' },
  { selector: 'button.ql-script[value="sub"]', label: 'Subscript' },
  { selector: 'button.ql-script[value="super"]', label: 'Superscript' },
  { selector: 'button.ql-indent[value="-1"]', label: 'Decrease indent' },
  { selector: 'button.ql-indent[value="+1"]', label: 'Increase indent' },
  { selector: 'button.ql-link', label: 'Insert link' },
  { selector: 'button.ql-image', label: 'Insert image' },
  {
    selector: 'button.note-quill-image-from-docs',
    label: 'Insert image from existing documents',
  },
  { selector: 'button.ql-video', label: 'Insert video' },
  { selector: 'button.ql-clean', label: 'Clear formatting' },
] as const;
