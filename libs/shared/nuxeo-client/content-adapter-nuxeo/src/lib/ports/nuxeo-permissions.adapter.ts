import { Injectable, inject } from '@angular/core';
import { DocumentDetailService, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import {
  ContentError,
  type ContentNodeRef,
  type NewPermission,
  type Permission,
  type PermissionsCapabilities,
  type PermissionsPort,
} from '@agentic-ui/shared/content-ports';
import { map, switchMap, throwError, type Observable } from 'rxjs';
import { nuxeoPermissionsCapabilities } from '../capabilities';
import { mapNuxeoError } from '../mapping/error.mapper';
import { toPermissions } from '../mapping/permission.mapper';

/**
 * The Nuxeo {@link PermissionsPort}.
 *
 * Nuxeo's ACE model is the wider of the two the contract spans, so this adapter
 * honours every optional field. The notification-carrying variants
 * (`addPermissionWithNotification` and friends) have no representation in the port
 * and stay on `DocumentDetailService`.
 */
@Injectable({ providedIn: 'root' })
export class NuxeoPermissionsAdapter implements PermissionsPort {
  private readonly detail = inject(DocumentDetailService);

  list(node: ContentNodeRef): Observable<readonly Permission[]> {
    return this.detail.getDocumentPermissions(node.id).pipe(
      mapNuxeoError(),
      map((doc) => toPermissions(doc.contextParameters?.acls)),
    );
  }

  grant(node: ContentNodeRef, ace: NewPermission): Observable<Permission> {
    if (!ace.granted) {
      // Nuxeo can store a deny ACE, but `Document.AddPermission` only ever writes a
      // grant. Failing loudly beats silently writing the opposite of the request.
      return throwError(
        () =>
          new ContentError(
            'UnsupportedField',
            'nuxeo adapter cannot write a deny ACE through Document.AddPermission',
          ),
      );
    }

    return this.detail
      .addPermission(node.id, {
        username: ace.principal.id,
        permission: ace.permission,
        begin: ace.begin ?? null,
        end: ace.end ?? null,
      })
      .pipe(
        mapNuxeoError(),
        map((doc) => matchGranted(doc, ace)),
      );
  }

  /**
   * MISFIT — the contract never promises `Permission.id` is a durable backend handle, so
   * the id is read back off the ACL before it is used, costing an extra read per revoke.
   * The read is not optional: `Document.RemovePermission` identifies an ACE by id, and its
   * only other handle, `user`, removes every ACE for that principal on the ACL. An id that
   * no longer resolves is a `NotFound`, never a broader revoke.
   */
  revoke(node: ContentNodeRef, permissionId: string): Observable<void> {
    return this.list(node).pipe(
      switchMap((permissions) => {
        const target = permissions.find((permission) => permission.id === permissionId);
        if (!target?.id) {
          return throwError(
            () => new ContentError('NotFound', `no permission '${permissionId}' on '${node.id}'`),
          );
        }
        return this.detail
          .removePermission(node.id, { aceId: target.id, acl: aclNameOf(target) })
          .pipe(mapNuxeoError());
      }),
      map(() => undefined),
    );
  }

  capabilities(): PermissionsCapabilities {
    return nuxeoPermissionsCapabilities;
  }
}

/**
 * `toPermission` encodes the ACL an ACE came from as `<aclName>:<status>` in `source`,
 * because the neutral shape has nowhere else to carry it. Revoking has to name the same
 * ACL, otherwise Nuxeo looks for the id on `local` and finds nothing.
 */
function aclNameOf(permission: Permission): string {
  return permission.source?.split(':')[0] || 'local';
}

/**
 * `Document.AddPermission` returns the document rather than the created ACE, so the
 * new entry is located by matching the request against the returned ACL.
 */
function matchGranted(doc: NuxeoDocument, requested: NewPermission): Permission {
  const permissions = toPermissions(doc.contextParameters?.acls);
  const match = permissions.find(
    (permission) =>
      permission.principal.id === requested.principal.id &&
      permission.permission === requested.permission &&
      permission.granted,
  );
  if (!match) {
    throw new ContentError('Terminal', 'nuxeo did not report the granted permission');
  }
  return match;
}
