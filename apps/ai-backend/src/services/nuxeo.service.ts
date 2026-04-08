import { config, nuxeoBasicAuth } from '../config.js';

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Basic ${nuxeoBasicAuth()}`,
    'Content-Type': 'application/json',
    properties: 'dublincore',
    ...extra,
  };
}

function url(path: string): string {
  return `${config.nuxeoUrl}${path}`;
}

export async function nuxeoGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(url(path), { headers: headers() });
  if (!res.ok) throw new Error(`Nuxeo GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function nuxeoPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Nuxeo POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function nxqlSearch(query: string, pageSize = 20): Promise<unknown> {
  const params = new URLSearchParams({ query, pageSize: String(pageSize) });
  return nuxeoGet(`/nuxeo/api/v1/search/lang/NXQL/execute?${params}`);
}

export async function getDocumentById(uid: string): Promise<unknown> {
  return nuxeoGet(`/nuxeo/api/v1/id/${uid}?properties=dublincore`);
}

export async function getDocumentBlob(uid: string): Promise<string> {
  const res = await fetch(url(`/nuxeo/api/v1/id/${uid}/@blob/file:content`), {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Blob fetch for ${uid} failed: ${res.status}`);
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text') || contentType.includes('json')) {
    return res.text();
  }
  return `[Binary content: ${contentType}, ${res.headers.get('content-length') ?? 'unknown'} bytes]`;
}

export async function getAuditEvents(docId?: string, pageSize = 50): Promise<unknown> {
  if (docId) {
    return nuxeoGet(`/nuxeo/api/v1/id/${docId}/@audit?pageSize=${pageSize}`);
  }
  return nuxeoPost('/nuxeo/api/v1/automation/Audit.QueryWithPageProvider', {
    params: { pageSize },
  });
}

export async function getDocumentAcl(uid: string): Promise<unknown> {
  return nuxeoGet(`/nuxeo/api/v1/id/${uid}/@acl`);
}

export async function getUserTasks(userId: string): Promise<unknown> {
  return nuxeoGet(`/nuxeo/api/v1/task?userId=${userId}&pageSize=50`);
}

export async function searchDocuments(query: string, pageSize = 10): Promise<unknown> {
  return nxqlSearch(query, pageSize);
}
