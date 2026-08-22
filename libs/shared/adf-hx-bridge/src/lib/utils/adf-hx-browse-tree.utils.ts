import {
  cumulativeNuxeoPathPrefixes,
  normalizeNuxeoPath,
  nuxeoPathSegments,
} from '@nuxeo-satori/platform/nuxeo-client';
import type { Document } from '@hylandsoftware/hxcs-js-client';

/** Normalized Nuxeo path for an Hx document. */
export function hxDocPath(doc: Document): string {
  return normalizeNuxeoPath(doc.sys_path ?? '/');
}

/** Path prefixes to expand below a tree root (excludes the root path itself). */
export function pathPrefixesBelowRoot(rootPath: string, activePath: string): string[] {
  const root = normalizeNuxeoPath(rootPath);
  const active = normalizeNuxeoPath(activePath);
  if (active === root) {
    return [];
  }

  const prefixes = cumulativeNuxeoPathPrefixes(active);
  if (root === '/') {
    return prefixes;
  }

  return prefixes.filter((prefix) => prefix !== root && prefix.startsWith(`${root}/`));
}

export function isAncestorNuxeoPath(nodePath: string, activePath: string): boolean {
  return isHxAncestorPath(nodePath, activePath);
}

export function isHxAncestorPath(nodePath: string, activePath: string): boolean {
  const nodeSegments = nuxeoPathSegments(nodePath);
  const activeSegments = nuxeoPathSegments(activePath);
  if (nodeSegments.length >= activeSegments.length) {
    return false;
  }
  return nodeSegments.every((segment, index) => segment === activeSegments[index]);
}

/** Scope key for tree re-rooting: repository root or top-level domain path. */
export function adfHxBrowseTreeScopeKey(activePath: string): string {
  return hxBrowseTreeScopeKey(activePath);
}

export function hxBrowseTreeScopeKey(activePath: string): string {
  const normalized = normalizeNuxeoPath(activePath);
  if (normalized === '/') {
    return '/';
  }
  const parts = normalized.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : '/';
}

export function isHxRepositoryRootPath(nuxeoPath: string): boolean {
  return normalizeNuxeoPath(nuxeoPath) === '/';
}

export function hxTopLevelFolderPath(nuxeoPath: string): string | null {
  const normalized = normalizeNuxeoPath(nuxeoPath);
  if (normalized === '/') {
    return null;
  }
  const parts = normalized.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : null;
}

export { cumulativeNuxeoPathPrefixes };
