import { getAuthHeader } from './config.js';

export interface NuxeoRequestInit {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  rawBody?: Buffer | Uint8Array;
}

export class NuxeoClient {
  constructor(private readonly baseUrl: string) {}

  private url(path: string, query?: NuxeoRequestInit['query']): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    const full = `${this.baseUrl.replace(/\/+$/, '')}${p}`;
    if (!query || Object.keys(query).length === 0) return full;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      sp.set(k, String(v));
    }
    return `${full}?${sp.toString()}`;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    init: NuxeoRequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: getAuthHeader(),
      ...init.headers,
    };

    let fetchBody: string | Buffer | Uint8Array | undefined;
    if (init.rawBody !== undefined) {
      fetchBody = init.rawBody;
    } else if (init.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(init.body);
    }

    const res = await fetch(this.url(path, init.query), {
      method,
      headers,
      body: fetchBody,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Nuxeo HTTP ${res.status}: ${text.slice(0, 4000)}`);
    }
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  // ── Search ──────────────────────────────────────────────

  nxqlSearch(query: string, pageSize: number, currentPageIndex = 0): Promise<unknown> {
    return this.request('GET', '/api/v1/search/lang/NXQL/execute', {
      query: { query, pageSize, currentPageIndex },
      headers: { properties: '*' },
    });
  }

  // ── Document CRUD ───────────────────────────────────────

  getDocumentById(uid: string): Promise<unknown> {
    return this.request('GET', `/api/v1/id/${encodeURIComponent(uid)}`, {
      query: { enrichers: 'documentURL' },
      headers: { properties: '*' },
    });
  }

  getDocumentByPath(path: string): Promise<unknown> {
    const safe = path.startsWith('/') ? path : `/${path}`;
    return this.request('GET', `/api/v1/path${safe}`, {
      query: { enrichers: 'documentURL' },
      headers: { properties: '*' },
    });
  }

  createDocument(parentPath: string, entity: Record<string, unknown>): Promise<unknown> {
    const safe = parentPath.replace(/\/+$/, '') || '/';
    return this.request('POST', `/api/v1/path${safe}`, { body: entity });
  }

  updateDocument(uid: string, properties: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/api/v1/id/${encodeURIComponent(uid)}`, {
      body: { 'entity-type': 'document', uid, properties },
      headers: { properties: '*' },
    });
  }

  trashDocument(uid: string): Promise<unknown> {
    return this.runAutomation('Document.Trash', { input: uid });
  }

  deleteDocument(uid: string): Promise<unknown> {
    return this.request('DELETE', `/api/v1/id/${encodeURIComponent(uid)}`);
  }

  // ── Children / Browse ───────────────────────────────────

  listChildren(
    uid: string | undefined,
    path: string | undefined,
    pageSize: number,
    currentPageIndex: number,
  ): Promise<unknown> {
    if (uid) {
      return this.request('GET', `/api/v1/id/${encodeURIComponent(uid)}/@children`, {
        query: { pageSize, currentPageIndex },
        headers: { properties: '*' },
      });
    }
    const safe = (path ?? '/').startsWith('/') ? path! : `/${path}`;
    return this.request('GET', `/api/v1/path${safe}/@children`, {
      query: { pageSize, currentPageIndex },
      headers: { properties: '*' },
    });
  }

  // ── Automation ──────────────────────────────────────────

  runAutomation(operationId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/api/v1/automation/${encodeURIComponent(operationId)}`, {
      body,
      headers: { properties: '*' },
    });
  }

  // ── Schema / Type config ────────────────────────────────

  getDocType(type: string): Promise<unknown> {
    return this.request('GET', `/api/v1/config/types/${encodeURIComponent(type)}`);
  }

  getSchema(schemaName: string): Promise<unknown> {
    return this.request('GET', `/api/v1/config/schemas/${encodeURIComponent(schemaName)}`);
  }

  // ── Permissions (ACLs) ──────────────────────────────────

  getAcl(uid: string): Promise<unknown> {
    return this.request('GET', `/api/v1/id/${encodeURIComponent(uid)}`, {
      query: { enrichers: 'acls' },
      headers: { properties: '*' },
    });
  }

  addPermission(uid: string, params: Record<string, unknown>): Promise<unknown> {
    return this.runAutomation('Document.AddPermission', {
      input: uid,
      params,
      context: {},
    });
  }

  // ── Workflows / Tasks ──────────────────────────────────

  listTasks(userId?: string, workflowModelName?: string, documentId?: string): Promise<unknown> {
    const query: Record<string, string | undefined> = {};
    if (userId) query.userId = userId;
    if (workflowModelName) query.workflowModelName = workflowModelName;
    if (documentId) query.workflowInstanceId = documentId;
    return this.request('GET', '/api/v1/task', { query });
  }

  completeTask(
    taskId: string,
    action: string,
    variables: Record<string, unknown> = {},
  ): Promise<unknown> {
    return this.request(
      'PUT',
      `/api/v1/task/${encodeURIComponent(taskId)}/${encodeURIComponent(action)}`,
      {
        body: {
          'entity-type': 'task',
          id: taskId,
          variables,
        },
      },
    );
  }

  // ── Batch Upload ────────────────────────────────────────

  async createBatch(): Promise<string> {
    const res = await this.request<{ batchId: string }>('POST', '/api/v1/upload/new/upload');
    return res.batchId;
  }

  async uploadBlob(
    batchId: string,
    fileIndex: number,
    filename: string,
    mimeType: string,
    data: Buffer,
  ): Promise<unknown> {
    return this.request('POST', `/api/v1/upload/${encodeURIComponent(batchId)}/${fileIndex}`, {
      rawBody: data,
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Upload-Type': 'normal',
        'X-File-Name': encodeURIComponent(filename),
        'X-File-Type': mimeType,
        'X-File-Size': String(data.length),
      },
    });
  }

  attachBlob(documentUid: string, batchId: string, fileIndex = 0): Promise<unknown> {
    return this.runAutomation('Blob.AttachOnDocument', {
      input: `upload:${batchId}:${fileIndex}`,
      params: { document: documentUid },
      context: {},
    });
  }

  // ── Users / Groups ─────────────────────────────────────

  searchUsers(query: string, pageSize = 20): Promise<unknown> {
    return this.request('GET', '/api/v1/user/search', {
      query: { q: query, pageSize },
    });
  }

  searchGroups(query: string, pageSize = 20): Promise<unknown> {
    return this.request('GET', '/api/v1/group/search', {
      query: { q: query, pageSize },
    });
  }

  // ── Collections ─────────────────────────────────────────

  addToCollection(documentUid: string, collectionUid: string): Promise<unknown> {
    return this.runAutomation('Document.AddToCollection', {
      input: documentUid,
      params: { collection: collectionUid },
      context: {},
    });
  }

  removeFromCollection(documentUid: string, collectionUid: string): Promise<unknown> {
    return this.runAutomation('Document.RemoveFromCollection', {
      input: documentUid,
      params: { collection: collectionUid },
      context: {},
    });
  }

  // ── Tags ────────────────────────────────────────────────

  tagDocument(uid: string, tags: string[]): Promise<unknown> {
    return this.runAutomation('Services.TagDocument', {
      input: uid,
      params: { tags: tags.join(',') },
      context: {},
    });
  }

  untagDocument(uid: string, tags: string[]): Promise<unknown> {
    return this.runAutomation('Services.UntagDocument', {
      input: uid,
      params: { tags: tags.join(',') },
      context: {},
    });
  }

  // ── Renditions ──────────────────────────────────────────

  listRenditions(uid: string): Promise<unknown> {
    return this.request('GET', `/api/v1/id/${encodeURIComponent(uid)}`, {
      query: { enrichers: 'renditions' },
      headers: { properties: '*' },
    });
  }
}
