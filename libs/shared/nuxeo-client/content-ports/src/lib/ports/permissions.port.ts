import type { Observable } from 'rxjs';
import type { ContentNodeRef } from '../domain/content-node';
import type { NewPermission, Permission } from '../domain/permission';
import type { PermissionsCapabilities } from './capabilities';

/**
 * Operation-shaped permissions over the wider Nuxeo-like ACE model. Optional grant
 * fields (`begin`/`end`/deny/inheritance) are honoured per adapter; unsupported ones
 * are rejected with a typed error and reported by the descriptor.
 */
export interface PermissionsPort {
  list(node: ContentNodeRef): Observable<readonly Permission[]>;
  grant(node: ContentNodeRef, ace: NewPermission): Observable<Permission>;
  revoke(node: ContentNodeRef, permissionId: string): Observable<void>;
  capabilities(): PermissionsCapabilities;
}
