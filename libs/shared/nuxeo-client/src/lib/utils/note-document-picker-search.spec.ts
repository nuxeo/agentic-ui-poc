import {
  NOTE_DOCUMENT_PICKER_PROVIDER,
  buildNoteDocumentPickerNxql,
  filterInsertablePictureDocuments,
  hasInsertablePictureBlob,
} from './note-document-picker-search';
import type { NuxeoDocument } from '../models/document.model';

/** A complete `NuxeoDocument`, so a fixture states only the fields its test is about. */
function pictureDoc(overrides: Partial<NuxeoDocument> & Pick<NuxeoDocument, 'uid'>): NuxeoDocument {
  return {
    title: 'Document',
    type: 'File',
    path: '/default-domain/workspaces/document',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  };
}

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

  /**
   * The local copy of the escape this module used to carry doubled the quote and
   * ignored backslashes entirely, so `\' OR 1 = 1 OR '` broke out of the LIKE literal.
   * It now delegates to the shared helper.
   */
  it('buildNoteDocumentPickerNxql escapes quotes and backslashes in the search term', () => {
    expect(buildNoteDocumentPickerNxql("O'Brien")).toContain(
      String.raw`dc:title LIKE '%O\'Brien%'`,
    );
    expect(buildNoteDocumentPickerNxql(String.raw`\' OR 1 = 1 OR '`)).toContain(
      String.raw`dc:title LIKE '%\\\' OR 1 = 1 OR \'%'`,
    );
  });

  it('filterInsertablePictureDocuments keeps only docs with file:content.data', () => {
    const withData = pictureDoc({
      uid: '1',
      type: 'Picture',
      properties: { 'file:content': { data: '/nuxeo/nxfile/default/1/file:content/a.jpg' } },
    });
    const withoutData = pictureDoc({
      uid: '2',
      type: 'Picture',
      properties: { 'file:content': { name: 'a.jpg' } },
    });
    const nonImage = pictureDoc({
      uid: '3',
      type: 'File',
      properties: {
        'file:content': {
          data: '/nuxeo/nxfile/default/3/file:content/doc.pdf',
          'mime-type': 'application/pdf',
        },
      },
    });

    expect(filterInsertablePictureDocuments([withData, withoutData, nonImage])).toEqual([withData]);
  });

  it('hasInsertablePictureBlob accepts image mime types on non-Picture docs', () => {
    const doc = pictureDoc({
      uid: '4',
      type: 'File',
      properties: {
        'file:content': {
          data: '/nuxeo/nxfile/default/4/file:content/scan.png',
          'mime-type': 'image/png',
        },
      },
    });
    expect(hasInsertablePictureBlob(doc)).toBe(true);
  });
});
