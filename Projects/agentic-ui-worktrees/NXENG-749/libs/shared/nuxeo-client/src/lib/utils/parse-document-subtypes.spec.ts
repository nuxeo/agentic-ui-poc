import { describe, expect, it } from 'vitest';

import type { NuxeoDocument } from '../models/document.model';
import { parseDocumentSubtypes, sortDocumentSubtypes } from './parse-document-subtypes';

function docWithSubtypes(subtypes: unknown): NuxeoDocument {
  return {
    uid: '1',
    title: 'Folder',
    type: 'Folder',
    path: '/default-domain/workspaces/demo',
    lastModified: '',
    properties: {},
    contextParameters: { subtypes },
  };
}

describe('parseDocumentSubtypes', () => {
  it('returns empty array when subtypes enricher is missing', () => {
    expect(parseDocumentSubtypes({ ...docWithSubtypes(undefined), contextParameters: {} })).toEqual(
      [],
    );
  });

  it('parses Nuxeo subtype objects with type and facets', () => {
    const result = parseDocumentSubtypes(
      docWithSubtypes([
        { type: 'File', facets: ['Downloadable', 'Versionable'] },
        { type: 'Folder', facets: ['Folderish'] },
      ]),
    );
    expect(result).toEqual(['File', 'Folder']);
  });

  it('parses legacy string entries', () => {
    expect(parseDocumentSubtypes(docWithSubtypes(['Section', 'Workspace']))).toEqual([
      'Section',
      'Workspace',
    ]);
  });

  it('deduplicates repeated types', () => {
    expect(
      parseDocumentSubtypes(
        docWithSubtypes([{ type: 'File' }, { type: 'File' }, { type: 'Note' }]),
      ),
    ).toEqual(['File', 'Note']);
  });
});

describe('sortDocumentSubtypes', () => {
  it('places known workspace types first in canonical order', () => {
    expect(sortDocumentSubtypes(['Workspace', 'Audio', 'File', 'Section'])).toEqual([
      'Audio',
      'File',
      'Workspace',
      'Section',
    ]);
  });
});
