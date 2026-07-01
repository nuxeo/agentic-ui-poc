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
