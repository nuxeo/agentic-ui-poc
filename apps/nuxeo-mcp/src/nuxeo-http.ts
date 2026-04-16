import type { loadConfig } from './config.js';

export type NuxeoConfig = ReturnType<typeof loadConfig>;

function headers(cfg: NuxeoConfig, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Basic ${cfg.basicToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    properties: 'dublincore',
    ...extra,
  };
}

export async function nuxeoGet(
  cfg: NuxeoConfig,
  pathAndQuery: string,
  extraHeaders?: Record<string, string>,
): Promise<unknown> {
  const url = `${cfg.baseUrl}${pathAndQuery}`;
  const res = await fetch(url, { headers: headers(cfg, extraHeaders) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Nuxeo HTTP ${res.status}: ${text.slice(0, 2000)}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/** Trim trailing slashes; ensure leading slash (matches BrowseService). */
export function safeNuxeoPath(nuxeoPath: string): string {
  const t = nuxeoPath.trim();
  const withoutTrailing = t.replace(/\/+$/, '') || '/';
  return withoutTrailing.startsWith('/') ? withoutTrailing : `/${withoutTrailing}`;
}
