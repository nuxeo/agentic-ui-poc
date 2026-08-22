import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { NuxeoQueryApi } from './nuxeo-query-api';
import { ROOT_DOCUMENT } from '../tokens/adf-hx-bridge.tokens';

describe('NuxeoQueryApi', () => {
  let api: NuxeoQueryApi;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoQueryApi],
    });
    api = TestBed.inject(NuxeoQueryApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('maps tree_children at repository root to nav bootstrap entries', async () => {
    const pending = api.getDocumentsByNamedQuery({
      queryName: 'tree_children',
      parameters: { parentId: ROOT_DOCUMENT.sys_id },
      limit: 50,
      offset: 0,
    });

    const rootReq = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/path/'));
    rootReq.flush({
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    });

    const treeReq = httpMock.expectOne((r) =>
      r.url.includes('/nuxeo/api/v1/search/pp/tree_children/execute'),
    );
    treeReq.flush({
      entries: [
        {
          uid: 'domain-1',
          title: 'Default Domain',
          type: 'Domain',
          path: '/default-domain',
          lastModified: '2026-01-01T00:00:00.000Z',
          properties: {},
        },
      ],
      totalSize: 1,
    });

    const response = await pending;
    expect(response.data.documents).toHaveLength(1);
    expect(response.data.documents?.[0]?.sys_title).toBe('Default Domain');
    expect(response.data.documents?.[0]?.sys_isFolderish).toBe(true);
  });

  describe('the sort, which used to be silently discarded', () => {
    const workspace = {
      uid: 'ws-1',
      title: 'Workspace',
      type: 'Workspace',
      path: '/default-domain/workspaces/ws',
      lastModified: '2026-02-01T00:00:00.000Z',
      properties: {},
    };

    /** Lets an `await` inside the port run before the next request is expected. */
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

    /**
     * Answers the two lookups `queryFolderContents` makes before it fetches children, awaiting a
     * tick between them.
     *
     * The tick is load-bearing. `resolvePath` uses `await`, so the port's continuation — and
     * therefore the *next* request — only runs on a following microtask. Flushing both
     * synchronously, the way the `tree_children` test can because it composes with `switchMap`,
     * fails with "Expected one matching request, found none".
     */
    async function flushParentLookup() {
      httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/id/ws-1')).flush(workspace);
      await tick();
      httpMock
        .expectOne((r) => r.url.includes('/nuxeo/api/v1/path/default-domain/workspaces/ws'))
        .flush(workspace);
      await tick();
    }

    it('translates an HxPR sort key into the Nuxeo property @children orders by', async () => {
      const pending = api.getDocumentsByNamedQuery({
        queryName: 'advanced_document_content',
        parameters: { parentId: 'ws-1' },
        limit: 50,
        offset: 0,
        sort: ['sys_modified desc'],
      } as Parameters<typeof api.getDocumentsByNamedQuery>[0]);
      await flushParentLookup();

      const children = httpMock.expectOne((r) => r.url.includes('/@children'));
      // The whole point: the sort reaches the server. It used to be accepted and dropped.
      expect(children.request.params.get('sortBy')).toBe('dc:modified');
      expect(children.request.params.get('sortOrder')).toBe('DESC');
      children.flush({ entries: [], resultsCount: -2, isNextPageAvailable: false });
      await pending;
    });

    it('sends several sort fields in matching order', async () => {
      const pending = api.getDocumentsByNamedQuery({
        queryName: 'advanced_document_content',
        parameters: { parentId: 'ws-1' },
        limit: 50,
        sort: ['sys_creator asc', 'sys_title desc'],
      } as Parameters<typeof api.getDocumentsByNamedQuery>[0]);
      await flushParentLookup();

      const children = httpMock.expectOne((r) => r.url.includes('/@children'));
      expect(children.request.params.get('sortBy')).toBe('dc:creator,dc:title');
      expect(children.request.params.get('sortOrder')).toBe('ASC,DESC');
      children.flush({ entries: [], resultsCount: -2 });
      await pending;
    });

    it('turns offset into a server page index rather than slicing one big fetch', async () => {
      const pending = api.getDocumentsByNamedQuery({
        queryName: 'advanced_document_content',
        parameters: { parentId: 'ws-1' },
        limit: 50,
        offset: 100,
      } as Parameters<typeof api.getDocumentsByNamedQuery>[0]);
      await flushParentLookup();

      const children = httpMock.expectOne((r) => r.url.includes('/@children'));
      // Slicing was what made the 50-child ceiling invisible: page two was never requested.
      expect(children.request.params.get('currentPageIndex')).toBe('2');
      expect(children.request.params.get('pageSize')).toBe('50');
      children.flush({ entries: [], resultsCount: -2 });
      await pending;
    });

    it("passes Nuxeo's own count through, including its refusal to count", async () => {
      const pending = api.getDocumentsByNamedQuery({
        queryName: 'advanced_document_content',
        parameters: { parentId: 'ws-1' },
        limit: 2,
      } as Parameters<typeof api.getDocumentsByNamedQuery>[0]);
      await flushParentLookup();
      httpMock
        .expectOne((r) => r.url.includes('/@children'))
        .flush({
          entries: [
            {
              uid: 'a',
              title: 'A',
              type: 'File',
              path: '/x/a',
              lastModified: '2026-01-01T00:00:00.000Z',
              properties: {},
            },
            {
              uid: 'b',
              title: 'B',
              type: 'File',
              path: '/x/b',
              lastModified: '2026-01-01T00:00:00.000Z',
              properties: {},
            },
          ],
          // `-2` is Nuxeo's "not computed" for the @children page provider.
          resultsCount: -2,
          isNextPageAvailable: true,
        });

      const result = (await pending).data;
      // NOT 2. Reporting the page length as the total is the recorded defect: it makes a paged
      // folder look complete, and a pager built on it would show "1-2 of 2".
      expect(result.totalCount).toBe(-2);
      expect(result.count).toBe(2);
      expect((result as { hasNextPage?: boolean }).hasNextPage).toBe(true);
    });

    it('refuses a sort key Nuxeo cannot order by, rather than emptying the folder', async () => {
      // Nuxeo answers an unsupported `sortBy` with HTTP 200 and ZERO entries — verified against
      // the local instance with `sortBy=ecm:isFolder`. Forwarding it would render an empty folder.
      await expect(
        api.getDocumentsByNamedQuery({
          queryName: 'advanced_document_content',
          parameters: { parentId: 'ws-1' },
          sort: ['sys_isFolderish desc'],
        } as Parameters<typeof api.getDocumentsByNamedQuery>[0]),
      ).rejects.toThrow('Cannot sort by "sys_isFolderish"');
    });

    it('names the sortable keys in the refusal, so the caller can pick another', async () => {
      await expect(
        api.getDocumentsByNamedQuery({
          queryName: 'advanced_document_content',
          parameters: { parentId: 'ws-1' },
          sort: ['sys_madeUp asc'],
        } as Parameters<typeof api.getDocumentsByNamedQuery>[0]),
      ).rejects.toThrow('sys_title');
    });

    it('rejects a direction that is neither asc nor desc', async () => {
      await expect(
        api.getDocumentsByNamedQuery({
          queryName: 'advanced_document_content',
          parameters: { parentId: 'ws-1' },
          sort: ['sys_title sideways'],
        } as Parameters<typeof api.getDocumentsByNamedQuery>[0]),
      ).rejects.toThrow('direction must be asc or desc');
    });
  });

  /**
   * The HXQL entry point, reached by upstream's `SearchService`. The statement is upstream's
   * own, copied from `DocumentVersionsService.getVersionsById` — if these tests are updated
   * because the text changed, the port's regex has to change with them.
   */
  describe('getDocumentsByQuery', () => {
    const versionsQuery = (id: string) =>
      `SELECT * FROM SysContent WHERE sys_parentId = '${id}' AND sysver_isVersion = 1 ORDER BY sysver_created DESC`;

    /** Two versions, returned oldest-first the way `Document.GetVersions` does. */
    const nuxeoVersions = [
      {
        uid: 'ver-0-1',
        title: 'Invoice',
        type: 'File',
        path: '/default-domain/workspaces/ws/Invoice',
        lastModified: '2026-02-01T10:00:00.000Z',
        isVersion: true,
        isCheckedOut: false,
        versionableId: 'live-1',
        parentRef: 'folder-1',
        properties: {
          'uid:major_version': 0,
          'uid:minor_version': 1,
          'dc:lastContributor': 'jdoe',
          'dc:creator': 'Administrator',
          'dc:description': 'the document description, not the version comment',
        },
      },
      {
        uid: 'ver-0-2',
        title: 'Invoice',
        type: 'File',
        path: '/default-domain/workspaces/ws/Invoice',
        lastModified: '2026-02-02T10:00:00.000Z',
        isVersion: true,
        isCheckedOut: false,
        versionableId: 'live-1',
        parentRef: 'folder-1',
        properties: {
          'uid:major_version': 0,
          'uid:minor_version': 2,
          'dc:lastContributor': 'jdoe',
          'dc:creator': 'Administrator',
        },
      },
    ];

    function flushVersions(entries: unknown[] = nuxeoVersions) {
      httpMock
        .expectOne((r) => r.url.includes('/@op/Document.GetVersions'))
        .flush({ 'entity-type': 'documents', entries });
    }

    it('reads versions through Document.GetVersions, not the search index', async () => {
      const pending = api.getDocumentsByQuery({ query: versionsQuery('live-1'), sort: [] });
      // The operation on the *live* document, which is the id carried in the statement.
      const req = httpMock.expectOne((r) =>
        r.url.includes('/nuxeo/api/v1/id/live-1/@op/Document.GetVersions'),
      );
      expect(req.request.method).toBe('POST');
      req.flush({ 'entity-type': 'documents', entries: nuxeoVersions });

      const response = await pending;
      expect(response.data.documents).toHaveLength(2);
      expect(response.data.totalCount).toBe(2);
    });

    it('honours ORDER BY sysver_created DESC even though Nuxeo answers oldest-first', async () => {
      const pending = api.getDocumentsByQuery({ query: versionsQuery('live-1') });
      flushVersions();

      const documents = (await pending).data.documents ?? [];
      // Reversed relative to the flushed order: the statement asks for newest first, and a
      // port that returned Nuxeo's order would look correct on a one-version document.
      expect(documents.map((d) => d.sys_id)).toEqual(['ver-0-2', 'ver-0-1']);
    });

    it('maps the version fields upstream panel reads', async () => {
      const pending = api.getDocumentsByQuery({ query: versionsQuery('live-1') });
      flushVersions();

      const newest = (await pending).data.documents?.[0];
      expect(newest?.['sysver_isVersion']).toBe(true);
      expect(newest?.['sysver_title']).toBe('0.2');
      expect(newest?.['sysver_created']).toBe('2026-02-02T10:00:00.000Z');
      expect(newest?.['sysver_creator']).toBe('jdoe');
      // `sys_parentId` has to be the live document, not Nuxeo's `parentRef` (the folder):
      // `DocumentVersionsService.getCurrentDocument` follows it to reload the live document.
      expect(newest?.sys_parentId).toBe('live-1');
    });

    it('leaves the version comment unset rather than showing the document description', async () => {
      const pending = api.getDocumentsByQuery({ query: versionsQuery('live-1') });
      flushVersions();

      // Nuxeo keeps the check-in comment in the audit log, so `sysver_description` has no
      // document-level source. `dc:description` is a different thing and must not leak in.
      const oldest = (await pending).data.documents?.[1];
      expect(oldest?.['sysver_description']).toBeUndefined();
      expect(oldest?.['sysver_expires']).toBeUndefined();
    });

    it('applies limit and offset to the version list', async () => {
      const pending = api.getDocumentsByQuery({ query: versionsQuery('live-1'), limit: 1 });
      flushVersions();

      const result = (await pending).data;
      expect(result.documents).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.totalCount).toBe(2);
    });

    it('refuses an HXQL statement with unmapped fields', async () => {
      // An empty result set is indistinguishable from an empty repository, which is how a
      // silently unsupported query becomes a bug report about missing documents.
      await expect(
        api.getDocumentsByQuery({
          query: `SELECT * FROM SysContent WHERE sys_unmappedField = 'x'`,
        }),
      ).rejects.toThrow('Cannot translate HXQL field');
    });

    it('refuses an empty statement', async () => {
      await expect(api.getDocumentsByQuery({})).rejects.toThrow('does not understand');
    });

    it('refuses a sort it would otherwise discard', async () => {
      await expect(
        api.getDocumentsByQuery({ query: versionsQuery('live-1'), sort: ['sys_title asc'] }),
      ).rejects.toThrow('cannot apply the sort');
    });

    it('refuses a non-default repository', async () => {
      await expect(
        api.getDocumentsByQuery({ query: versionsQuery('live-1'), repositoryId: 'other' }),
      ).rejects.toThrow('serves only "default"');
    });

    it('refuses a versions query with no document id', async () => {
      await expect(api.getDocumentsByQuery({ query: versionsQuery('') })).rejects.toThrow(
        'carried no document id',
      );
    });

    it('translates a search statement to NXQL and asks Nuxeo for it', async () => {
      // The translation is asserted **at the wire**, not through the return value.
      // A port that answered `[]` without ever calling Nuxeo would satisfy a
      // result-shape assertion, and an empty result set is indistinguishable from
      // an empty repository — which is the whole failure mode `REFUSES: R3`
      // existed to avoid.
      const pending = api.getDocumentsByQuery({
        query: `SELECT * FROM SysContent WHERE sys_fulltext = 'invoice*' ORDER BY sys_modified DESC`,
        limit: 10,
        offset: 0,
      });

      const search = httpMock.expectOne((r) =>
        r.url.includes('/nuxeo/api/v1/search/lang/NXQL/execute'),
      );
      const nxql = search.request.params.get('query') ?? '';
      // HxPR field names must not survive into NXQL: Nuxeo has never heard of them.
      expect(nxql).toContain("ecm:fulltext = 'invoice*'");
      expect(nxql).toContain('ORDER BY dc:modified DESC');
      expect(nxql).not.toMatch(/sys_/);
      search.flush({ entries: [], resultsCount: 0 });

      const result = (await pending).data;
      expect(result.documents).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("accepts the search page's own first query, which carries no WHERE", async () => {
      // With an empty search box and no filters the page sends exactly this. An
      // earlier cut required `WHERE`, so this fell through to the refusal branch
      // and the search page threw before the user had typed anything.
      const pending = api.getDocumentsByQuery({
        query: 'SELECT * FROM SysContent ORDER BY sys_modified DESC',
        limit: 50,
      });

      const search = httpMock.expectOne((r) => r.url.includes('/search/lang/NXQL/execute'));
      const nxql = search.request.params.get('query') ?? '';
      expect(nxql).toContain('ORDER BY dc:modified DESC');
      search.flush({ entries: [], resultsCount: 0 });
      await pending;
    });

    it('excludes versions and trashed documents from every search', async () => {
      // Without this, searching returns every version of every match plus the
      // trash. Upstream's HXQL carries no equivalent, so the hygiene is ours.
      const pending = api.getDocumentsByQuery({
        query: `SELECT * FROM SysContent WHERE sys_fulltext = 'invoice*'`,
        limit: 50,
      });

      const search = httpMock.expectOne((r) => r.url.includes('/search/lang/NXQL/execute'));
      const nxql = search.request.params.get('query') ?? '';
      expect(nxql).toContain('ecm:isVersion = 0');
      expect(nxql).toContain('ecm:isTrashed = 0');
      // The user's own filter has to survive alongside them.
      expect(nxql).toContain("ecm:fulltext = 'invoice*'");
      search.flush({ entries: [], resultsCount: 0 });
      await pending;
    });

    it('does not mistake a search term containing sys_ for an untranslatable field', async () => {
      const pending = api.getDocumentsByQuery({
        query: `SELECT * FROM SysContent WHERE sys_fulltext = 'sys_id*'`,
        limit: 50,
      });

      const search = httpMock.expectOne((r) => r.url.includes('/search/lang/NXQL/execute'));
      expect(search.request.params.get('query')).toContain("ecm:fulltext = 'sys_id*'");
      search.flush({ entries: [], resultsCount: 0 });
      await pending;
    });

    it('refuses a search statement naming a field with no Nuxeo equivalent', async () => {
      // Refused by name rather than forwarded. A field Nuxeo cannot resolve comes
      // back as an empty page, not an error, so forwarding it would report an
      // empty repository.
      await expect(
        api.getDocumentsByQuery({
          query: `SELECT * FROM SysContent WHERE sys_madeUpField = 'x'`,
        }),
      ).rejects.toThrow('Cannot translate HXQL field');
    });
  });
});
