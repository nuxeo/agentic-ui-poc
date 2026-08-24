import {
  NOTE_DOCUMENT_PICKER_PROVIDER,
  buildNoteDocumentPickerNxql,
  escapeNxqlLiteral,
  filterInsertablePictureDocuments,
  hasInsertablePictureBlob,
} from './note-document-picker-search';
import type { NuxeoDocument } from '../models/document.model';

describe('note-document-picker-search', () => {
  it('uses document_picker provider name like Web UI', () => {
    expect(NOTE_DOCUMENT_PICKER_PROVIDER).toBe('document_picker');
  });

  it('buildNoteDocumentPickerNxql filters Picture documents', () => {
    expect(buildNoteDocumentPickerNxql('')).toContain("ecm:primaryType = 'Picture'");
    expect(buildNoteDocumentPickerNxql('')).toContain('ecm:isTrashed = 0');
    expect(buildNoteDocumentPickerNxql('')).not.toContain('dc:title LIKE');
  });

  it('buildNoteDocumentPickerNxql filters Quick Search by title and file name', () => {
    const query = buildNoteDocumentPickerNxql('beach');
    expect(query).toContain("dc:title LIKE '%beach%'");
    expect(query).toContain("file:content/name LIKE '%beach%'");
  });

  it('escapeNxqlLiteral escapes single quotes', () => {
    expect(escapeNxqlLiteral("O'Brien")).toBe("O''Brien");
    expect(buildNoteDocumentPickerNxql("O'Brien")).toContain("O''Brien");
  });

  it('filterInsertablePictureDocuments keeps only docs with file:content.data', () => {
    const withData = {
      uid: '1',
      type: 'Picture',
      properties: { 'file:content': { data: '/nuxeo/nxfile/default/1/file:content/a.jpg' } },
    } as NuxeoDocument;
    const withoutData = {
      uid: '2',
      type: 'Picture',
      properties: { 'file:content': { name: 'a.jpg' } },
    } as NuxeoDocument;
    const nonImage = {
      uid: '3',
      type: 'File',
      properties: {
        'file:content': {
          data: '/nuxeo/nxfile/default/3/file:content/doc.pdf',
          'mime-type': 'application/pdf',
        },
      },
    } as NuxeoDocument;

    expect(filterInsertablePictureDocuments([withData, withoutData, nonImage])).toEqual([withData]);
  });

  it('hasInsertablePictureBlob accepts image mime types on non-Picture docs', () => {
    const doc = {
      uid: '4',
      type: 'File',
      properties: {
        'file:content': {
          data: '/nuxeo/nxfile/default/4/file:content/scan.png',
          'mime-type': 'image/png',
        },
      },
    } as NuxeoDocument;
    expect(hasInsertablePictureBlob(doc)).toBe(true);
  });
});
