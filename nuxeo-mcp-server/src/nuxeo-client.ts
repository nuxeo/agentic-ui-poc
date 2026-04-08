import { getAuthHeader } from './config.js';

export interface NuxeoRequestInit {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
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
    if (init.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(this.url(path, init.query), {
      method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Nuxeo HTTP ${res.status}: ${text.slice(0, 4000)}`);
    }
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  nxqlSearch(query: string, pageSize: number, currentPageIndex = 0): Promise<unknown> {
    return this.request('GET', '/api/v1/search/lang/NXQL/execute', {
      query: { query, pageSize, currentPageIndex },
      headers: { properties: '*' },
    });
  }

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

  runAutomation(operationId: string, body: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/api/v1/automation/${encodeURIComponent(operationId)}`, {
      body,
      headers: { properties: '*' },
    });
  }

  getDocType(type: string): Promise<unknown> {
    return this.request('GET', `/api/v1/config/types/${encodeURIComponent(type)}`);
  }

  getSchema(schemaName: string): Promise<unknown> {
    return this.request('GET', `/api/v1/config/schemas/${encodeURIComponent(schemaName)}`);
  }
}
