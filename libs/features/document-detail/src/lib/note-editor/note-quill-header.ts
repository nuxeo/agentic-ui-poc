import Quill from 'quill';

export interface QuillRange {
  index: number;
  length: number;
}

export function parseHeaderValue(
  value: string | number | boolean | null | undefined,
): number | false {
  if (value === '' || value === false || value === null || value === undefined) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 6 ? parsed : false;
}

/**
 * Apply heading style like Word: selected text only, or newly typed text when nothing is selected.
 * Never restyles the whole note unless the user explicitly selected all of it.
 */
export function applyHeaderFormatSelectionOnly(
  quill: Quill,
  value: string | number | boolean | null | undefined,
  savedRange?: QuillRange | null,
): void {
  const headerValue = parseHeaderValue(value);
  const range = quill.getSelection() ?? savedRange;
  if (!range) return;

  if (range.length > 0) {
    quill.formatLine(range.index, range.length, 'header', headerValue, Quill.sources.USER);
    quill.setSelection(range.index, range.length, Quill.sources.SILENT);
    return;
  }

  const [line, offset] = quill.getLine(range.index);
  if (!line) return;

  const lineIndex = quill.getIndex(line);
  const lineLength = line.length();
  const lineText = line.domNode.textContent ?? '';
  const hasTextBefore = offset > 0;
  const hasTextAfter = offset < lineText.length;

  if (hasTextBefore) {
    quill.insertText(range.index, '\n', Quill.sources.USER);
    const newIndex = range.index + 1;
    quill.setSelection(newIndex, 0, Quill.sources.SILENT);
    quill.formatLine(newIndex, 1, 'header', headerValue, Quill.sources.USER);
    return;
  }

  if (hasTextAfter) {
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.setSelection(range.index, 0, Quill.sources.SILENT);
    quill.formatLine(range.index, 1, 'header', headerValue, Quill.sources.USER);
    return;
  }

  quill.formatLine(lineIndex, lineLength, 'header', headerValue, Quill.sources.USER);
  quill.setSelection(range.index, 0, Quill.sources.SILENT);
}
