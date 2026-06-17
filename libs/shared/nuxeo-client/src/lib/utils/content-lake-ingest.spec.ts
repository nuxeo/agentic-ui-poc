import {
  buildContentLakeIngestMarker,
  buildContentLakeDuplicateSearchQuery,
  findContentLakeDuplicateCandidates,
  findContentLakeDuplicates,
  findRepositoryBlobMatches,
  isContentLakeIngestCurrent,
  needsContentLakeIngest,
  parseContentLakeIngestCheckResult,
  readBlobDigest,
  readContentLakeIngestMarker,
  resolveIngestMarkerWriteProperty,
  shouldBackfillContentLakeIngestMarker,
  supportsContentLakeIngest,
} from './content-lake-ingest';
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
        digest: 'abc123',
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

describe('content lake ingest markers', () => {
  it('detects when the ingest marker matches the current blob digest', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { name: 'sample.pdf', length: '1024', digest: 'abc123' },
        'dc:source': buildContentLakeIngestMarker('abc123'),
      },
    });

    expect(readContentLakeIngestMarker(doc)).toBe('abc123');
    expect(readBlobDigest(doc)).toBe('abc123');
    expect(isContentLakeIngestCurrent(doc)).toBe(true);
    expect(needsContentLakeIngest(doc)).toBe(false);
  });

  it('requires re-ingest when the blob digest changes', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { name: 'sample.pdf', length: '2048', digest: 'new-digest' },
        'dc:source': buildContentLakeIngestMarker('abc123'),
      },
    });

    expect(isContentLakeIngestCurrent(doc)).toBe(false);
    expect(needsContentLakeIngest(doc)).toBe(true);
  });

  it('reads legacy markers stored on dc:rights', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { name: 'sample.pdf', length: '1024', digest: 'abc123' },
        'dc:rights': buildContentLakeIngestMarker('abc123'),
      },
    });

    expect(isContentLakeIngestCurrent(doc)).toBe(true);
  });

  it('prefers dc:source when both marker properties are writable', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { digest: 'abc123' },
        'dc:rights': 'All rights reserved',
      },
    });

    expect(resolveIngestMarkerWriteProperty(doc)).toBe('dc:source');
  });

  it('falls back to dc:rights when dc:source is occupied', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { digest: 'abc123' },
        'dc:source': 'Imported from SharePoint',
      },
    });

    expect(resolveIngestMarkerWriteProperty(doc)).toBe('dc:rights');
  });

  it('finds duplicate files by name, size, and ingest marker', () => {
    const existing = makeDoc({
      uid: 'existing-1',
      title: 'Contract.pdf',
      path: '/default-domain/workspaces/demo/Contract.pdf',
      properties: {
        'file:content': {
          name: 'Contract.pdf',
          length: '2048',
          digest: 'digest-1',
        },
        'dc:rights': buildContentLakeIngestMarker('digest-1'),
      },
    });

    const files = [new File(['x'.repeat(2048)], 'Contract.pdf')];
    const matches = findContentLakeDuplicates(files, [existing]);

    expect(matches).toHaveLength(1);
    expect(matches[0].existingUid).toBe('existing-1');
  });

  it('returns candidates without a local marker for Content Lake probing', () => {
    const existing = makeDoc({
      uid: 'existing-2',
      title: 'Contract.pdf',
      path: '/default-domain/workspaces/demo/Contract.pdf',
      properties: {
        'file:content': {
          name: 'Contract.pdf',
          length: '2048',
          digest: 'digest-2',
        },
      },
    });

    const files = [new File(['x'.repeat(2048)], 'Contract.pdf')];
    const candidates = findContentLakeDuplicateCandidates(files, [existing]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].markedIngested).toBe(false);
    expect(findContentLakeDuplicates(files, [existing])).toHaveLength(0);
  });
});

describe('buildContentLakeDuplicateSearchQuery', () => {
  it('searches ingestible documents repository-wide by blob name and size', () => {
    const query = buildContentLakeDuplicateSearchQuery([
      new File(['x'], "O'Brien.pdf"),
      new File(['y'.repeat(10)], 'notes.txt'),
    ]);

    expect(query).toContain("file:content/name = 'O''Brien.pdf'");
    expect(query).toContain('file:content/length = 10');
    expect(query).toContain("ecm:primaryType IN ('File', 'Picture', 'Video', 'Audio')");
    expect(query).toContain('ecm:isTrashed = 0');
  });

  it('finds repository matches independent of folder path', () => {
    const file = new File(['x'.repeat(2048)], 'Contract.pdf');
    const matches = findRepositoryBlobMatches(file, [
      makeDoc({
        uid: 'elsewhere',
        path: '/default-domain/workspaces/other/Contract.pdf',
        properties: {
          'file:content': { name: 'Contract.pdf', length: '2048' },
        },
      }),
    ]);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.uid).toBe('elsewhere');
  });
});

describe('parseContentLakeIngestCheckResult', () => {
  it('reads explicit ingested flags from plain JSON', () => {
    expect(parseContentLakeIngestCheckResult({ ingested: true })).toBe(true);
    expect(parseContentLakeIngestCheckResult({ ingested: false })).toBe(false);
  });

  it('reads CIC ServiceCallResult envelopes with nested response.exists', () => {
    expect(
      parseContentLakeIngestCheckResult({
        responseCode: 200,
        responseMessage: 'OK',
        response: { exists: true },
      }),
    ).toBe(true);
    expect(
      parseContentLakeIngestCheckResult({
        responseCode: 404,
        responseMessage: 'Not Found',
        response: { exists: false },
      }),
    ).toBe(false);
  });

  it('reads status strings and Nuxeo blob envelopes', () => {
    expect(parseContentLakeIngestCheckResult({ status: 'INGESTED' })).toBe(true);
    const payload = btoa(JSON.stringify({ digestMatch: true }));
    expect(
      parseContentLakeIngestCheckResult({
        'entity-type': 'blob',
        data: payload,
      }),
    ).toBe(true);
  });
});

describe('shouldBackfillContentLakeIngestMarker', () => {
  it('returns true when ingest is supported but the marker is missing', () => {
    expect(shouldBackfillContentLakeIngestMarker(makeDoc())).toBe(true);
  });

  it('returns false when the marker is already current', () => {
    const doc = makeDoc({
      properties: {
        'file:content': { name: 'sample.pdf', length: '1024', digest: 'abc123' },
        'dc:source': buildContentLakeIngestMarker('abc123'),
      },
    });
    expect(shouldBackfillContentLakeIngestMarker(doc)).toBe(false);
  });
});
