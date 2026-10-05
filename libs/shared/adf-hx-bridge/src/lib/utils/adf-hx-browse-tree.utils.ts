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

/**
 * Whether a tree folder may show an expand arrow.
 *
 * A folder the `QUERY` port marked `hasSubfoldersKey: false` holds only files, which browse does
 * not list. Unmarked means unknown, and keeps the arrow.
 */
export function hxTreeNodeIsExpandable(doc: Document, hasSubfoldersKey: string): boolean {
  return doc.sys_isFolderish === true && doc[hasSubfoldersKey] !== false;
}

/** The part of `chain` (root first) from the tree's own root down, or all of it if absent. */
export function hxTreeBranchFromRoot(
  chain: readonly Document[],
  rootId: string | undefined,
): Document[] {
  const index = chain.findIndex((doc) => doc.sys_id === rootId);
  return index >= 0 ? chain.slice(index) : [...chain];
}

/** The minimum a collapse decision needs from a tree node. */
export interface HxTreeNodeState {
  readonly path: string;
  readonly level: number;
  readonly expanded: boolean;
  readonly skeleton: boolean;
}

/**
 * The expanded nodes to collapse so only the branch down to `activePath` stays open, as
 * production browse does.
 *
 * Only the topmost off-path node of a branch is returned: collapsing it removes its descendants
 * from the tree, and collapsing a node that is no longer there corrupts the tree's node list.
 * The tree's own root (level 0) is never collapsed. `nodes` is in tree order.
 */
export function hxTreeNodesToCollapse<T extends HxTreeNodeState>(
  nodes: readonly T[],
  activePath: string,
): T[] {
  const active = normalizeNuxeoPath(activePath);
  const collapse: T[] = [];
  let collapsedPath: string | null = null;
  for (const node of nodes) {
    if (node.level === 0 || node.skeleton) continue;
    const path = normalizeNuxeoPath(node.path);
    if (collapsedPath && path.startsWith(`${collapsedPath}/`)) continue;
    const onPath = path === active || isHxAncestorPath(path, active);
    if (node.expanded && !onPath) {
      collapse.push(node);
      collapsedPath = path;
    }
  }
  return collapse;
}

export { cumulativeNuxeoPathPrefixes };
