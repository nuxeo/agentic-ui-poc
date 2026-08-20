import type { ContentNode } from '../domain/content-node';

/**
 * A stable, port-level key binding a named query to its typed parameter record and
 * typed result row. Phantom-typed so `runNamedQuery` infers both from the key; only
 * `key` exists at runtime.
 */
export interface NamedQueryKey<TParams, TRow> {
  readonly key: string;
  readonly __params?: TParams;
  readonly __row?: TRow;
}

/** Declares a named-query key. */
export function namedQuery<TParams, TRow>(key: string): NamedQueryKey<TParams, TRow> {
  return { key };
}

/**
 * The upstream named-query catalogue as pinned. Any adapter claiming the shared
 * contract must implement all three.
 */
export const childrenOfFolder = namedQuery<
  { parentId: string; sort?: 'name' | 'modified' },
  ContentNode
>('children-of-folder');

export const allContentOfFolder = namedQuery<{ parentId: string }, ContentNode>(
  'all-content-of-folder',
);

export const versionsOfDocument = namedQuery<{ documentId: string }, ContentNode>(
  'versions-of-document',
);

/**
 * Keys we need that the upstream catalogue does not define. They are declared here
 * rather than upstream because the catalogue is a hand-maintained list in the shared
 * ports package, so adding one is an upstream PR against a private repository. Only
 * our own adapter answers these; a different backend's adapter will reject them with
 * an `UnsupportedFilter` error, which is the documented pre-flight path via
 * {@link SearchCapabilities.supportedNamedQueries}.
 */
export const trashedChildrenOfFolder = namedQuery<{ parentId: string }, ContentNode>(
  'nuxeo:trashed-children-of-folder',
);

export const collectionMembers = namedQuery<{ collectionId: string }, ContentNode>(
  'nuxeo:collection-members',
);
