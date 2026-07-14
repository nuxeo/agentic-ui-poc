import type { NuxeoDocument } from '../models/document.model';
import { isFolderishDocument } from '../services/document-import.service';

/** Decode a single repository path segment; returns the raw segment if decoding fails. */
export function decodeNuxeoPathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** True when the router URL is a browse main-view route. */
export function isBrowseRouterUrl(routerUrl: string): boolean {
  const withoutQuery = routerUrl.split('?')[0];
  const path = (withoutQuery.includes('#') ? withoutQuery.split('#').pop() : withoutQuery) ?? '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized === '/browse' || normalized.startsWith('/browse/');
}

/** Parse the Nuxeo repository path from a router URL (e.g. `/#/browse/default-domain/foo` → `/default-domain/foo`). */
export function parseBrowseNuxeoPathFromRouterUrl(routerUrl: string): string {
  const withoutQuery = routerUrl.split('?')[0];
  const path = (withoutQuery.includes('#') ? withoutQuery.split('#').pop() : withoutQuery) ?? '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const prefix = '/browse';
  if (normalized === prefix || normalized === `${prefix}/`) return '/';
  if (!normalized.startsWith(`${prefix}/`)) return '/';
  const remainder = normalized.slice(prefix.length);
  const decoded = remainder
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeNuxeoPathSegment(segment))
    .join('/');
  return decoded ? `/${decoded}` : '/';
}

/** Normalize a Nuxeo path for stable comparisons. */
export function normalizeNuxeoPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, '') || '/';
}

/** Case-insensitive Nuxeo path equality (Nuxeo may vary segment casing per server). */
export function nuxeoPathsEqual(a: string, b: string): boolean {
  return normalizeNuxeoPath(a).toLowerCase() === normalizeNuxeoPath(b).toLowerCase();
}

/** Slugify a single path segment for flexible matching (`Domain 1` ≈ `domain-1`). */
export function slugifyNuxeoPathSegment(segment: string): string {
  return decodeNuxeoPathSegment(segment).trim().toLowerCase().replace(/\s+/g, '-');
}

/** Segment-wise path comparison tolerating spaces vs hyphens and casing. */
export function nuxeoPathSegments(path: string): string[] {
  return normalizeNuxeoPath(path).split('/').filter(Boolean).map(slugifyNuxeoPathSegment);
}

export function nuxeoPathsEqualFlexible(a: string, b: string): boolean {
  const left = nuxeoPathSegments(a);
  const right = nuxeoPathSegments(b);
  if (left.length !== right.length) return false;
  return left.every((segment, index) => segment === right[index]);
}

/** Build an app browse route from a repository path. */
export function toBrowseRouterUrl(nuxeoPath: string): string {
  const normalized = normalizeNuxeoPath(nuxeoPath);
  if (normalized === '/') return '/browse';
  const encodedPath = normalized
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/browse/${encodedPath}`;
}

/** Parent folder path for a document path (e.g. `/a/b/file.pdf` → `/a/b`). */
export function parentNuxeoFolderPath(docPath: string): string {
  const normalized = normalizeNuxeoPath(docPath);
  if (normalized === '/') return '/';
  const parts = normalized.split('/').filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
}

/**
 * Nuxeo Web UI browse-tree context: folderish containers use their path;
 * leaf documents highlight their containing folder in the tree.
 */
export function browseTreeContextPath(doc: NuxeoDocument): string {
  if (doc.type === 'Root') {
    return normalizeNuxeoPath(doc.path);
  }
  if (isFolderishDocument(doc) && doc.type !== 'Collection') {
    return normalizeNuxeoPath(doc.path);
  }
  return parentNuxeoFolderPath(doc.path);
}

/**
 * Cumulative path prefixes for tree expansion, e.g.
 * `/default-domain/workspaces` → [`/default-domain`, `/default-domain/workspaces`].
 */
export function cumulativeNuxeoPathPrefixes(nuxeoPath: string): string[] {
  const normalized = normalizeNuxeoPath(nuxeoPath);
  if (normalized === '/') return [];
  const parts = normalized.split('/').filter(Boolean);
  const prefixes: string[] = [];
  let accumulated = '';
  for (const part of parts) {
    accumulated += `/${part}`;
    prefixes.push(accumulated);
  }
  return prefixes;
}

/** First path segment as a folder path (e.g. `/Domain-5/workspaces` → `/Domain-5`). */
export function topLevelNuxeoFolderPath(nuxeoPath: string): string | null {
  const normalized = normalizeNuxeoPath(nuxeoPath);
  if (normalized === '/') return null;
  const parts = normalized.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : null;
}

/** Prefixes that must be expanded to reveal the active folder (all but the last segment). */
export function expandableNuxeoPathPrefixes(nuxeoPath: string): string[] {
  const prefixes = cumulativeNuxeoPathPrefixes(nuxeoPath);
  return prefixes.slice(0, -1);
}
