/** Nuxeo Note `note:mime_type` values and display labels (matches Nuxeo Web UI). */
export const NOTE_FORMAT_OPTIONS = [
  { value: 'text/html', label: 'HTML' },
  { value: 'text/plain', label: 'Text' },
  { value: 'text/xml', label: 'XML' },
  { value: 'text/markdown', label: 'Markdown' },
] as const;

export type NoteMimeType = (typeof NOTE_FORMAT_OPTIONS)[number]['value'];

const NOTE_FORMAT_LABELS = new Map<string, string>(
  NOTE_FORMAT_OPTIONS.map((opt) => [opt.value, opt.label]),
);

/** Default empty body for a new note of the given format. */
export function defaultNoteContent(mimeType: string): string {
  return mimeType === 'text/html' ? '<p></p>' : '';
}

/** Human-readable label for `note:mime_type` (e.g. `text/html` → `HTML`). */
export function noteFormatLabel(mimeType: string | null | undefined): string {
  if (!mimeType) return 'HTML';
  return NOTE_FORMAT_LABELS.get(mimeType) ?? mimeType;
}

export function isHtmlNoteFormat(mimeType: string): boolean {
  return mimeType === 'text/html';
}
