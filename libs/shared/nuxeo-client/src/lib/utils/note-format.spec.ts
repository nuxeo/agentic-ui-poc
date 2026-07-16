import { describe, expect, it } from 'vitest';
import {
  defaultNoteContent,
  formatNoteHtmlForSourceView,
  noteFormatLabel,
  NOTE_FORMAT_OPTIONS,
} from './note-format';

describe('note-format', () => {
  it('exposes all Web UI note formats', () => {
    expect(NOTE_FORMAT_OPTIONS.map((o) => o.value)).toEqual([
      'text/html',
      'text/plain',
      'text/xml',
      'text/markdown',
    ]);
  });

  it('defaultNoteContent returns empty paragraph for HTML', () => {
    expect(defaultNoteContent('text/html')).toBe('<p></p>');
    expect(defaultNoteContent('text/plain')).toBe('');
  });

  it('noteFormatLabel maps mime types to labels', () => {
    expect(noteFormatLabel('text/html')).toBe('HTML');
    expect(noteFormatLabel('text/markdown')).toBe('Markdown');
    expect(noteFormatLabel(null)).toBe('HTML');
    expect(noteFormatLabel('application/custom')).toBe('application/custom');
  });

  it('formatNoteHtmlForSourceView expands block tags and decodes nbsp (NXSAT-174)', () => {
    expect(formatNoteHtmlForSourceView('<h1>Heading&nbsp;1</h1><h2>Heading&nbsp;2</h2>')).toBe(
      '<h1>Heading 1</h1>\n<h2>Heading 2</h2>',
    );
    expect(formatNoteHtmlForSourceView('')).toBe('');
  });
});
