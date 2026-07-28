import type { NuxeoAcl } from '../models/acl.model';
import type { NuxeoDocument } from '../models/document.model';

/** Nuxeo may return a plain string or an enriched user/group entity when fetch-acls is set. */
export function resolveAcePrincipal(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';

  const entity = value as {
    id?: string;
    name?: string;
    groupname?: string;
    grouplabel?: string;
    properties?: { username?: string; groupname?: string; email?: string };
  };

  return (
    entity.properties?.username ??
    entity.properties?.groupname ??
    entity.groupname ??
    entity.id ??
    entity.name ??
    entity.grouplabel ??
    ''
  );
}

/**
 * Prefer a non-empty enricher value from `updated`; fall back to `existing`.
 * PUT responses without enrichers may return empty arrays — treat those as absent.
 */
export function preferEnricherValue<T>(
  updated: T | undefined,
  existing: T | undefined,
): T | undefined {
  if (Array.isArray(updated)) {
    return updated.length > 0 ? updated : existing;
  }
  return updated ?? existing;
}

/** Merges ACL + permissions enrichers from a permissions fetch into an existing document. */
export function mergeDocumentPermissionsContext(
  existing: NuxeoDocument,
  updated: NuxeoDocument,
): NuxeoDocument {
  const normalized = normalizeDocumentAcls(updated);
  return {
    ...existing,
    contextParameters: {
      ...existing.contextParameters,
      acls: preferEnricherValue(
        normalized.contextParameters?.['acls'],
        existing.contextParameters?.['acls'],
      ),
      permissions: preferEnricherValue(
        normalized.contextParameters?.['permissions'],
        existing.contextParameters?.['permissions'],
      ),
    },
  };
}

/** Normalizes ACL username/creator fields to strings for UI and automation calls. */
export function normalizeDocumentAcls(doc: NuxeoDocument): NuxeoDocument {
  const acls = doc.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
  if (!acls?.length) return doc;

  const normalizedAcls = acls.map((acl) => ({
    ...acl,
    aces: acl.aces.map((ace) => ({
      ...ace,
      username: resolveAcePrincipal(ace.username),
      creator: ace.creator ? resolveAcePrincipal(ace.creator) : null,
    })),
  }));

  return {
    ...doc,
    contextParameters: {
      ...doc.contextParameters,
      acls: normalizedAcls,
    },
  };
}
