import { supportsContentLakeIngest } from './content-lake-ingest';
import type { NuxeoDocument } from '../models/document.model';

function makeDoc(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Sample',
    type: 'File',
    path: '/default-domain/sample.pdf',
    lastModified: '2026-06-12T00:00:00.000Z',
    properties: {
      'file:content': {
        name: 'sample.pdf',
        'mime-type': 'application/pdf',
        length: '1024',
      },
    },
    ...overrides,
  };
}

describe('supportsContentLakeIngest', () => {
  it('returns true for a File document with a main blob', () => {
    expect(supportsContentLakeIngest(makeDoc())).toBe(true);
  });

  it('returns false for trashed documents', () => {
    expect(supportsContentLakeIngest(makeDoc({ isTrashed: true }))).toBe(false);
  });

  it('returns false for folderish types', () => {
    expect(supportsContentLakeIngest(makeDoc({ type: 'Folder', properties: {} }))).toBe(false);
  });

  it('returns false when file:content is missing', () => {
    expect(supportsContentLakeIngest(makeDoc({ properties: {} }))).toBe(false);
  });

  it('returns true for Picture documents with a main blob', () => {
    expect(
      supportsContentLakeIngest(
        makeDoc({
          type: 'Picture',
          properties: {
            'file:content': {
              name: 'photo.jpg',
              'mime-type': 'image/jpeg',
              length: '2048',
            },
          },
        }),
      ),
    ).toBe(true);
  });

  it('returns false for Note documents without ingestible primary types', () => {
    expect(
      supportsContentLakeIngest(
        makeDoc({
          type: 'Note',
          properties: { 'note:note': 'Hello' },
        }),
      ),
    ).toBe(false);
  });
});
