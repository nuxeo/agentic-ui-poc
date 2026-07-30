import { buildNoteImagesInsertHtml } from './note-image-insert';

describe('note-image-insert', () => {
  it('wraps each image URL in its own paragraph', () => {
    const html = buildNoteImagesInsertHtml([
      '/nuxeo/nxfile/default/a/file:content/one.jpg',
      '/nuxeo/nxfile/default/b/file:content/two.png',
    ]);
    expect(html).toBe(
      '<p><img src="/nuxeo/nxfile/default/a/file:content/one.jpg"></p>' +
        '<p><img src="/nuxeo/nxfile/default/b/file:content/two.png"></p>',
    );
  });

  it('escapes quotes in URLs for HTML attributes', () => {
    const url = '/nuxeo/nxfile/default/x/file:content/a"b.jpg';
    expect(buildNoteImagesInsertHtml([url])).toBe(
      '<p><img src="/nuxeo/nxfile/default/x/file:content/a&quot;b.jpg"></p>',
    );
  });
});
