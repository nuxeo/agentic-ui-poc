import type { NuxeoDocument, NuxeoDocumentList } from '@agentic-ui/shared/nuxeo-client';
import { DC, SYS } from '@agentic-ui/shared/content-ports';

import { toContentNode, toResultPage } from './content-node.mapper';

function doc(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'uid-1',
    title: 'Quarterly Report',
    type: 'File',
    path: '/default-domain/workspaces/report',
    lastModified: '2026-02-01T10:00:00.000Z',
    properties: {
      'dc:created': '2026-01-01T09:00:00.000Z',
      'dc:creator': 'alice',
      'dc:lastContributor': 'bob',
      'dc:title': 'Quarterly Report',
    },
    ...overrides,
  };
}

describe('toContentNode', () => {
  it('maps the typed core', () => {
    const node = toContentNode(doc({ parentRef: 'parent-1' }));

    expect(node.id).toBe('uid-1');
    expect(node.name).toBe('Quarterly Report');
    expect(node.parentId).toBe('parent-1');
    expect(node.primaryType).toBe('File');
    expect(node.createdAt).toBe('2026-01-01T09:00:00.000Z');
    expect(node.modifiedAt).toBe('2026-02-01T10:00:00.000Z');
    expect(node.createdBy).toEqual({ id: 'alice' });
    expect(node.modifiedBy).toEqual({ id: 'bob' });
  });

  it('derives folderishness and content type from facets', () => {
    expect(toContentNode(doc()).isFolderish).toBe(false);
    expect(toContentNode(doc()).type).toBe('document');

    const folder = toContentNode(doc({ type: 'Folder', facets: ['Folderish'] }));
    expect(folder.isFolderish).toBe(true);
    expect(folder.type).toBe('folder');

    expect(toContentNode(doc({ type: 'Root' })).type).toBe('root');
  });

  it('exposes properties only through the namespaced accessor', () => {
    const node = toContentNode(doc());

    expect(node.property(DC, 'title')).toBe('Quarterly Report');
    expect(node.property(DC, 'missing')).toBeUndefined();
    expect(node.hasNamespace(DC)).toBe(true);
    // The raw Nuxeo bag is not reachable from the neutral node.
    expect((node as unknown as { properties?: unknown }).properties).toBeUndefined();
  });

  it('files unprefixed Nuxeo keys under the sys namespace', () => {
    const node = toContentNode(doc({ properties: { uid: 'raw' } }));
    expect(node.property(SYS, 'uid')).toBe('raw');
  });

  it('falls back to lastModified when dc:created is absent', () => {
    const node = toContentNode(doc({ properties: {} }));
    expect(node.createdAt).toBe('2026-02-01T10:00:00.000Z');
    expect(node.createdBy).toEqual({ id: 'unknown' });
  });
});

describe('toResultPage', () => {
  function list(overrides: Partial<NuxeoDocumentList> = {}): NuxeoDocumentList {
    return {
      entries: [doc()],
      totalSize: 1,
      resultsCount: 1,
      currentPageSize: 1,
      currentPageIndex: 0,
      numberOfPages: 1,
      ...overrides,
    };
  }

  it('reports an unknown total rather than zero when Nuxeo omits the count', () => {
    const page = toResultPage(list({ resultsCount: -1 }), { offset: 0, limit: 10 });
    expect(page.total).toBeUndefined();
  });

  it('uses resultsCount when Nuxeo supplies it', () => {
    expect(toResultPage(list({ resultsCount: 42 }), { offset: 0, limit: 10 }).total).toBe(42);
  });

  it('derives hasMore from the page index when Nuxeo reports page counts', () => {
    expect(toResultPage(list({ numberOfPages: 3, currentPageIndex: 0 })).hasMore).toBe(true);
    expect(toResultPage(list({ numberOfPages: 3, currentPageIndex: 2 })).hasMore).toBe(false);
  });

  it('maps every entry onto a neutral node', () => {
    const page = toResultPage(list({ entries: [doc(), doc({ uid: 'uid-2' })] }));
    expect(page.items.map((item) => item.id)).toEqual(['uid-1', 'uid-2']);
  });
});
