import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom, lastValueFrom, take, toArray } from 'rxjs';
import type {
  Document,
  DocumentApi,
  NamedQuery,
  QueryApi,
  QueryResult,
} from '@hylandsoftware/hxcs-js-client';
import { DOCUMENT_API_TOKEN, QUERY_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

import { AdfHxDocumentService } from './adf-hx-document.service';
import { ROOT_DOCUMENT } from '../tokens/adf-hx-bridge.tokens';

/**
 * Stand-ins for the two API ports, recording the request they were handed.
 *
 * The request is the observable output of this service: it composes a `NamedQuery` — default
 * sort, default limit, repository — and normalises whatever the port answers. Both halves are
 * asserted on their values; neither test asserts merely that a call happened.
 */
class FakeQueryApi {
  lastQuery: NamedQuery | undefined;
  /**
   * `hasNextPage` is widened on: the Nuxeo page provider sends it but upstream `QueryResult`
   * does not declare it, which is why the service reads it through a cast.
   */
  result: Partial<QueryResult> & { hasNextPage?: boolean } = {
    documents: [],
    limit: 0,
    offset: 0,
    totalCount: 0,
    count: 0,
  };

  getDocumentsByNamedQuery(query: NamedQuery): Promise<{ data: QueryResult }> {
    this.lastQuery = query;
    return Promise.resolve({ data: this.result as QueryResult });
  }
}

class FakeDocumentApi {
  byId = new Map<string, Document>();
  byPath = new Map<string, Document>();
  ancestors: unknown = { ancestors: [] };
  lastRepositoryId: string | undefined;
  failure: Error | undefined;

  getDocumentById(documentId: string, repositoryId: string): Promise<{ data: Document }> {
    this.lastRepositoryId = repositoryId;
    if (this.failure) return Promise.reject(this.failure);
    const found = this.byId.get(documentId);
    if (!found) return Promise.reject(new Error(`no such document ${documentId}`));
    return Promise.resolve({ data: found });
  }

  getDocumentByPath(path: string, repositoryId: string): Promise<{ data: Document }> {
    this.lastRepositoryId = repositoryId;
    if (this.failure) return Promise.reject(this.failure);
    const found = this.byPath.get(path);
    if (!found) return Promise.reject(new Error(`no such path ${path}`));
    return Promise.resolve({ data: found });
  }

  getDocumentAncestors(
    documentId: string,
    repositoryId: string,
  ): Promise<{ data: { ancestors?: Document[] } }> {
    this.lastRepositoryId = repositoryId;
    if (this.failure) return Promise.reject(this.failure);
    return Promise.resolve({ data: this.ancestors as { ancestors?: Document[] } });
  }
}

function hxDoc(fields: Partial<Document> & { sys_id: string }): Document {
  return fields as Document;
}

describe('AdfHxDocumentService', () => {
  let service: AdfHxDocumentService;
  let queryApi: FakeQueryApi;
  let documentApi: FakeDocumentApi;

  beforeEach(() => {
    queryApi = new FakeQueryApi();
    documentApi = new FakeDocumentApi();
    TestBed.configureTestingModule({
      providers: [
        AdfHxDocumentService,
        { provide: QUERY_API_TOKEN, useValue: queryApi as unknown as QueryApi },
        { provide: DOCUMENT_API_TOKEN, useValue: documentApi as unknown as DocumentApi },
      ],
    });
    service = TestBed.inject(AdfHxDocumentService);
  });

  describe('getDocumentById / getDocumentByPath', () => {
    it('unwraps the port envelope and returns the document itself', async () => {
      documentApi.byId.set('ws-1', hxDoc({ sys_id: 'ws-1', sys_title: 'Workspace' }));
      expect(await firstValueFrom(service.getDocumentById('ws-1'))).toEqual({
        sys_id: 'ws-1',
        sys_title: 'Workspace',
      });
    });

    it('unwraps a path lookup the same way', async () => {
      documentApi.byPath.set('/default-domain', hxDoc({ sys_id: 'd-1', sys_title: 'Domain' }));
      expect((await firstValueFrom(service.getDocumentByPath('/default-domain'))).sys_title).toBe(
        'Domain',
      );
    });

    it('defaults the repository to the one set on the service', async () => {
      documentApi.byId.set('ws-1', hxDoc({ sys_id: 'ws-1' }));
      await firstValueFrom(service.getDocumentById('ws-1'));
      expect(documentApi.lastRepositoryId).toBe('default');

      service.setCurrentRepository('archive');
      await firstValueFrom(service.getDocumentById('ws-1'));
      expect(documentApi.lastRepositoryId).toBe('archive');
    });

    it('lets an explicit repository override the one set on the service', async () => {
      service.setCurrentRepository('archive');
      documentApi.byId.set('ws-1', hxDoc({ sys_id: 'ws-1' }));
      await firstValueFrom(service.getDocumentById('ws-1', 'other'));
      expect(documentApi.lastRepositoryId).toBe('other');
    });

    it('propagates a port rejection rather than emitting an empty document', async () => {
      documentApi.failure = new Error('403 Forbidden');
      await expect(firstValueFrom(service.getDocumentById('secret'))).rejects.toThrow(
        '403 Forbidden',
      );
    });
  });

  describe('getAncestors', () => {
    it('returns the synthetic root alone for the root itself, with no port call', async () => {
      documentApi.failure = new Error('the port must not be reached');
      const ancestors = await firstValueFrom(service.getAncestors(ROOT_DOCUMENT.sys_id));
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0].sys_id).toBe(ROOT_DOCUMENT.sys_id);
    });

    it('prepends the synthetic root to the ancestors Nuxeo returned', async () => {
      // The breadcrumb has to start at "Repository", and Nuxeo's ancestor list does not
      // include a node for it — the synthetic root is ours.
      documentApi.ancestors = {
        ancestors: [
          hxDoc({ sys_id: 'd-1', sys_title: 'Default Domain' }),
          hxDoc({ sys_id: 'ws-1', sys_title: 'Workspace' }),
        ],
      };
      const ancestors = await firstValueFrom(service.getAncestors('doc-9'));
      expect(ancestors.map((a) => a.sys_title)).toEqual([
        'Repository',
        'Default Domain',
        'Workspace',
      ]);
    });

    it('still returns the root when the port answers with no ancestors key', async () => {
      documentApi.ancestors = {};
      const ancestors = await firstValueFrom(service.getAncestors('doc-9'));
      expect(ancestors.map((a) => a.sys_id)).toEqual([ROOT_DOCUMENT.sys_id]);
    });

    it('still returns the root when the port answers a non-array for ancestors', async () => {
      // A malformed payload must degrade to "Repository" rather than throwing inside the
      // breadcrumb, which renders above the content and would take the page with it.
      documentApi.ancestors = { ancestors: 'not-an-array' };
      const ancestors = await firstValueFrom(service.getAncestors('doc-9'));
      expect(ancestors.map((a) => a.sys_id)).toEqual([ROOT_DOCUMENT.sys_id]);
    });

    it('still returns the root when the port answers a null payload', async () => {
      documentApi.ancestors = null;
      const ancestors = await firstValueFrom(service.getAncestors('doc-9'));
      expect(ancestors.map((a) => a.sys_id)).toEqual([ROOT_DOCUMENT.sys_id]);
    });

    it('hands back a copy of the root, so a caller cannot mutate the shared constant', async () => {
      documentApi.ancestors = { ancestors: [] };
      const ancestors = await firstValueFrom(service.getAncestors('doc-9'));
      expect(ancestors[0]).not.toBe(ROOT_DOCUMENT);
      expect(ancestors[0]).toEqual({ ...ROOT_DOCUMENT });
    });
  });

  describe('the named query it composes', () => {
    it('asks advanced_document_content for a content listing', async () => {
      await firstValueFrom(service.getAllChildren('ws-1'));
      expect(queryApi.lastQuery?.queryName).toBe('advanced_document_content');
      expect(queryApi.lastQuery?.parameters).toEqual({ parentId: 'ws-1' });
    });

    it('asks tree_children for a tree expansion', async () => {
      await firstValueFrom(service.getFolderChildren('ws-1'));
      expect(queryApi.lastQuery?.queryName).toBe('tree_children');
    });

    it('sends sys_title asc by default and no folderish key', async () => {
      // `sys_isFolderish desc` was removed because Nuxeo has no sortable folderish property
      // and `NuxeoQueryApi` now refuses an unmappable key — sending it would throw.
      await firstValueFrom(service.getAllChildren('ws-1'));
      expect(queryApi.lastQuery?.sort).toEqual(['sys_title asc']);
    });

    it('uses a caller sort in place of the default', async () => {
      await firstValueFrom(service.getAllChildren('ws-1', { sort: ['sys_modified desc'] }));
      expect(queryApi.lastQuery?.sort).toEqual(['sys_modified desc']);
    });

    it('falls back to the default sort when the caller passes an empty array', async () => {
      // An empty array would leave the listing unordered, which is what the default exists
      // to prevent; `?.length` rather than `??` is what makes that hold.
      await firstValueFrom(service.getAllChildren('ws-1', { sort: [] }));
      expect(queryApi.lastQuery?.sort).toEqual(['sys_title asc']);
    });

    it('passes the caller limit and offset through', async () => {
      await firstValueFrom(service.getAllChildren('ws-1', { limit: 25, offset: 50 }));
      expect(queryApi.lastQuery?.limit).toBe(25);
      expect(queryApi.lastQuery?.offset).toBe(50);
    });

    it('preserves a zero limit rather than substituting the default', async () => {
      await firstValueFrom(service.getAllChildren('ws-1', { limit: 0 }));
      expect(queryApi.lastQuery?.limit).toBe(0);
    });

    it('carries the current repository into the query', async () => {
      service.setCurrentRepository('archive');
      await firstValueFrom(service.getAllChildren('ws-1'));
      expect(queryApi.lastQuery?.repositoryId).toBe('archive');
    });
  });

  describe('the results it normalises', () => {
    it('passes the port numbers through unchanged, including a refusal to count', async () => {
      queryApi.result = {
        documents: [hxDoc({ sys_id: 'a' }), hxDoc({ sys_id: 'b' })],
        limit: 50,
        offset: 0,
        totalCount: -2,
        count: 2,
      };
      const results = await firstValueFrom(service.getAllChildren('ws-1'));
      // `-2` is Nuxeo declining to count. Substituting `documents.length` here is the
      // recorded defect that made a paged folder look complete.
      expect(results.totalCount).toBe(-2);
      expect(results.documents).toHaveLength(2);
    });

    it('carries hasNextPage through, which is the only honest pager input when the total is unknown', async () => {
      queryApi.result = { documents: [], limit: 50, offset: 0, totalCount: -2, hasNextPage: true };
      expect((await firstValueFrom(service.getAllChildren('ws-1'))).hasNextPage).toBe(true);
    });

    it('leaves hasNextPage undefined when the port did not say', async () => {
      // `undefined` is not `false`: the pager must be able to tell "no next page" from
      // "nobody told me".
      queryApi.result = { documents: [], limit: 50, offset: 0, totalCount: 4 };
      expect((await firstValueFrom(service.getAllChildren('ws-1'))).hasNextPage).toBeUndefined();
    });

    it('defaults every absent numeric field to zero and documents to an empty list', async () => {
      queryApi.result = {};
      expect(await firstValueFrom(service.getAllChildren('ws-1'))).toEqual({
        documents: [],
        limit: 0,
        offset: 0,
        totalCount: 0,
        hasNextPage: undefined,
      });
    });
  });

  describe('the event streams components subscribe to', () => {
    it('replays the last loaded document to a late subscriber', async () => {
      // A `BehaviorSubject`, so a details panel created after the list has loaded still gets
      // the current document rather than waiting for the next navigation.
      const doc = hxDoc({ sys_id: 'ws-1', sys_title: 'Workspace' });
      service.notifyDocumentLoaded(doc);
      expect(await firstValueFrom(service.documentLoaded$)).toBe(doc);
    });

    it('starts with no loaded document rather than a placeholder', async () => {
      expect(await firstValueFrom(service.documentLoaded$)).toBeUndefined();
    });

    it('emits a selection-clear signal on request', async () => {
      const emitted = firstValueFrom(service.clearDocumentSelection$.pipe(take(1), toArray()));
      service.clearSelectionDocumentList();
      expect(await emitted).toEqual([undefined]);
    });

    it('emits a reload request on request', async () => {
      const emitted = lastValueFrom(service.documentRequestReload$.pipe(take(1), toArray()));
      service.requestReload();
      expect(await emitted).toHaveLength(1);
    });

    it('starts documentUpdated$ with an empty property map, not undefined', async () => {
      // Subscribers read `.updatedProperties` straight off the value; a `undefined` seed
      // would throw in every one of them on first render.
      const seed = await firstValueFrom(service.documentUpdated$);
      expect(seed.updatedProperties.size).toBe(0);
      expect(seed.document).toBeUndefined();
    });

    it('does not replay create, delete, copy, move or restore to a late subscriber', async () => {
      // These are `Subject`s on purpose: replaying a delete to a component that mounts later
      // would have it remove a row that is no longer in its list.
      service.documentCreated$.next(hxDoc({ sys_id: 'new-1' }));
      service.documentDeleted$.next('gone-1');
      service.documentRestored$.next(hxDoc({ sys_id: 'back-1' }));

      const seen: string[] = [];
      service.documentCreated$.subscribe(() => seen.push('created'));
      service.documentDeleted$.subscribe(() => seen.push('deleted'));
      service.documentRestored$.subscribe(() => seen.push('restored'));
      expect(seen).toEqual([]);
    });
  });
});
