import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import {
  buildNotePictureNxfileUrl,
  extractMainBlobFileName,
  notePictureInsertUrl,
} from './note-image-url';

describe('note-image-url', () => {
  it('buildNotePictureNxfileUrl matches Web UI nxfile pattern', () => {
    expect(buildNotePictureNxfileUrl('abc-123', 'Beach.jpg')).toBe(
      '/nuxeo/nxfile/default/abc-123/file:content/Beach.jpg',
    );
  });

  it('extractMainBlobFileName reads file:content name', () => {
    const doc = {
      uid: '1',
      properties: { 'file:content': { name: 'photo.png' } },
    } as NuxeoDocument;
    expect(extractMainBlobFileName(doc)).toBe('photo.png');
  });

  it('notePictureInsertUrl returns null when blob name is missing', () => {
    const doc = { uid: '1', properties: {} } as NuxeoDocument;
    expect(notePictureInsertUrl(doc)).toBeNull();
  });
});
