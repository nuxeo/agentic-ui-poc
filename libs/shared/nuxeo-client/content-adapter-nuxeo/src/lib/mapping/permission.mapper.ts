import type { NuxeoAce, NuxeoAcl } from '@agentic-ui/shared/nuxeo-client';
import type { Permission } from '@agentic-ui/shared/content-ports';

/**
 * Maps a Nuxeo ACE onto the neutral {@link Permission}.
 *
 * Nuxeo's tri-state `status` (`effective`/`pending`/`archived`) is collapsed onto the
 * contract's boolean `effective`, and the original value is preserved in `source` so
 * the distinction between "not yet effective" and "expired" is not lost — the neutral
 * shape has nowhere else to carry it.
 */
export function toPermission(ace: NuxeoAce, aclName: string): Permission {
  return {
    id: ace.id,
    principal: { id: ace.username },
    permission: ace.permission,
    granted: ace.granted,
    effective: ace.status === 'effective',
    source: `${aclName}:${ace.status}`,
    begin: ace.begin ?? undefined,
    end: ace.end ?? undefined,
  };
}

/** Flattens every ACL on a document into a single neutral permission list. */
export function toPermissions(acls: readonly NuxeoAcl[] | undefined): readonly Permission[] {
  if (!acls?.length) {
    return [];
  }
  return acls.flatMap((acl) => (acl.aces ?? []).map((ace) => toPermission(ace, acl.name)));
}
