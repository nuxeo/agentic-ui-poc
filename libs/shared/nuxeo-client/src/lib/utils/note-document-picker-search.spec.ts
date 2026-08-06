import {
  NOTE_DOCUMENT_PICKER_PROVIDER,
  buildNoteDocumentPickerNxql,
  escapeNxqlLiteral,
  filterInsertablePictureDocuments,
} from './note-document-picker-search';
import type { NuxeoDocument } from '../models/document.model';

describe('note-document-picker-search', () => {
  it('uses document_picker provider name like Web UI', () => {
    expect(NOTE_DOCUMENT_PICKER_PROVIDER).toBe('document_picker');
  });

  it('buildNoteDocumentPickerNxql filters Picture documents', () => {
    expect(buildNoteDocumentPickerNxql('')).toContain("ecm:mixinType = 'Picture'");
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
      properties: { 'file:content': { data: '/nuxeo/nxfile/default/1/file:content/a.jpg' } },
    } as NuxeoDocument;
    const withoutData = {
      uid: '2',
      properties: { 'file:content': { name: 'a.jpg' } },
    } as NuxeoDocument;

    expect(filterInsertablePictureDocuments([withData, withoutData])).toEqual([withData]);
  });
});
