import type { NuxeoDocument, NuxeoDocumentList } from '@agentic-ui/shared/nuxeo-client';
import {
  DC,
  FILE,
  SYS,
  type ContentNode,
  type ContentType,
  type NamespaceRef,
  type PageRequest,
  type PrincipalRef,
  type SearchResultPage,
} from '@agentic-ui/shared/content-ports';

const FOLDERISH_FACET = 'Folderish';

/** Namespaces this adapter populates on every node it returns. */
const POPULATED_NAMESPACES: readonly NamespaceRef[] = [SYS, DC, FILE];

function principal(id: unknown): PrincipalRef {
  return { id: typeof id === 'string' && id.length > 0 ? id : 'unknown' };
}

function contentType(doc: NuxeoDocument, isFolderish: boolean): ContentType {
  if (doc.type === 'Root') {
    return 'root';
  }
  return isFolderish ? 'folder' : 'document';
}

/**
 * Splits a Nuxeo property key (`dc:title`) into its schema prefix and local name.
 * Keys without a prefix are treated as belonging to the `sys` namespace, matching
 * how the neutral model treats repository-level fields.
 */
function splitPropertyKey(key: string): { namespace: string; local: string } {
  const separator = key.indexOf(':');
  if (separator === -1) {
    return { namespace: SYS, local: key };
  }
  return { namespace: key.slice(0, separator), local: key.slice(separator + 1) };
}

/**
 * Maps a Nuxeo document onto the neutral {@link ContentNode}.
 *
 * The property bag is exposed only through `property()`/`hasNamespace()`; the raw
 * Nuxeo `properties` record is never handed out, so callers cannot quietly grow a
 * dependency on Nuxeo's schema vocabulary through the port.
 */
export function toContentNode(doc: NuxeoDocument): ContentNode {
  const isFolderish = doc.facets?.includes(FOLDERISH_FACET) ?? false;
  const properties = doc.properties ?? {};

  const bag = new Map<string, unknown>();
  const namespaces = new Set<string>(POPULATED_NAMESPACES);
  for (const [key, value] of Object.entries(properties)) {
    const { namespace, local } = splitPropertyKey(key);
    bag.set(`${namespace}\u0000${local}`, value);
    namespaces.add(namespace);
  }

  const created = properties['dc:created'];
  const creator = properties['dc:creator'];
  const contributor = properties['dc:lastContributor'];

  return {
    id: doc.uid,
    parentId: doc.parentRef,
    name: doc.title,
    path: doc.path,
    type: contentType(doc, isFolderish),
    isFolderish,
    primaryType: doc.type,
    mixins: new Set(doc.facets ?? []),
    createdAt: typeof created === 'string' ? created : doc.lastModified,
    modifiedAt: doc.lastModified,
    createdBy: principal(creator),
    modifiedBy: principal(contributor ?? creator),
    property<T = unknown>(namespace: NamespaceRef, key: string): T | undefined {
      return bag.get(`${namespace}\u0000${key}`) as T | undefined;
    },
    hasNamespace(namespace: NamespaceRef): boolean {
      return namespaces.has(namespace);
    },
  };
}

/**
 * Maps a Nuxeo paginated list onto a neutral result page.
 *
 * `total` is taken from `resultsCount` when Nuxeo supplies it and left `undefined`
 * otherwise, because the contract requires an absent total to mean "unknown" rather
 * than zero. `totalSize` is deliberately not used as a fallback: Nuxeo returns `-1`
 * for it on unbounded page providers.
 */
export function toResultPage(
  list: NuxeoDocumentList,
  page?: PageRequest,
): SearchResultPage<ContentNode> {
  const items = (list.entries ?? []).map(toContentNode);
  const total =
    typeof list.resultsCount === 'number' && list.resultsCount >= 0 ? list.resultsCount : undefined;
  const pageIndex = list.currentPageIndex ?? 0;
  const numberOfPages = list.numberOfPages ?? 0;

  const hasMore =
    numberOfPages > 0
      ? pageIndex + 1 < numberOfPages
      : total !== undefined && page !== undefined
        ? page.offset + items.length < total
        : items.length > 0 && page !== undefined && items.length >= page.limit;

  return { items, total, hasMore };
}
