import { Injectable, inject } from '@angular/core';
import type { ACE, Document, DocumentAncestors } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';
import {
  BrowseService,
  DocumentDetailService,
  type NuxeoDocument as NuxeoDocumentInput,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  DEFAULT_REPOSITORY_ID,
  isHxRootDocument,
  ROOT_DOCUMENT,
} from '../tokens/adf-hx-bridge.tokens';
import {
  mapNuxeoDocumentToHx,
  syntheticHxRepositoryRoot,
} from '../mapping/nuxeo-to-hx-document.mapper';
import {
  NuxeoAclService,
  inexpressibleLocalAces,
  rawLocalAces,
  restorableLocalAcl,
  toNuxeoLocalAclWrite,
  type NuxeoAclGrant,
  type NuxeoLocalAclWrite,
} from '../services/nuxeo-acl.service';

type AxiosLikeResponse<T> = { data: T };

@Injectable()
export class NuxeoDocumentApi {
  private readonly browse = inject(BrowseService);
  private readonly documentDetail = inject(DocumentDetailService);
  private readonly acl = inject(NuxeoAclService);

  /**
   * Adds `sys_acl`, which the synchronous mapper cannot produce.
   *
   * Nuxeo's ACE names a principal without saying whether it is a user or a group, so each distinct
   * name needs a directory lookup — see `NuxeoPrincipalResolver`. A port method is `async`, so this
   * is the first place in the chain that can do it.
   *
   * Only the **single-document** reads get it. The children fetch does not request the `acls`
   * enricher and should not: a list of fifty rows does not need fifty ACLs, and `undefined` there is
   * the honest answer rather than an empty one.
   */
  private async withAcl(nuxeo: NuxeoDocumentInput, mapped: Document): Promise<Document> {
    const [effective, local] = await Promise.all([
      firstValueFrom(this.acl.aclFor(nuxeo)),
      firstValueFrom(this.acl.localAclFor(nuxeo)),
    ]);
    if (effective === undefined) {
      return mapped;
    }
    // Two fields, not one. `sys_acl` is the document's own ACL and `sys_effectiveAcl` is every ACE
    // in force; upstream's permissions panel recovers inherited-versus-local from the difference,
    // so filling only `sys_acl` makes every inherited grant look local and saving rewrites it as
    // one. `local` cannot be `undefined` when `effective` is not — both read the same field.
    return { ...mapped, sys_acl: local ?? [], sys_effectiveAcl: effective };
  }

  async getDocumentById(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Document>> {
    if (isHxRootDocument({ sys_id: docId })) {
      return { data: syntheticHxRepositoryRoot(repositoryId) };
    }

    const nuxeo = await firstValueFrom(this.documentDetail.getFullDocument(docId));
    return { data: await this.withAcl(nuxeo, mapNuxeoDocumentToHx(nuxeo, repositoryId)) };
  }

  async getDocumentByPath(
    docPath: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Document>> {
    const safePath = docPath.replace(/\/+$/, '') || '/';
    if (safePath === '/') {
      return { data: syntheticHxRepositoryRoot(repositoryId) };
    }

    const nuxeo = await firstValueFrom(this.browse.getByPath(safePath));
    return { data: await this.withAcl(nuxeo, mapNuxeoDocumentToHx(nuxeo, repositoryId)) };
  }

  async getDocumentAncestors(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<DocumentAncestors>> {
    if (isHxRootDocument({ sys_id: docId })) {
      return { data: { ancestors: [] } };
    }

    const current = await firstValueFrom(this.documentDetail.getFullDocument(docId));
    const path = current.path.replace(/\/+$/, '') || '/';
    if (path === '/') {
      return { data: { ancestors: [] } };
    }

    const segments = path.split('/').filter(Boolean);
    const ancestorPaths: string[] = [];
    for (let i = 1; i < segments.length; i += 1) {
      ancestorPaths.push(`/${segments.slice(0, i).join('/')}`);
    }

    const ancestors = await Promise.all(
      ancestorPaths.map(async (ancestorPath) => {
        const doc = await firstValueFrom(this.browse.getByPath(ancestorPath));
        return mapNuxeoDocumentToHx(doc, repositoryId);
      }),
    );

    return { data: { ancestors } };
  }

  async createDocumentUnderParentById(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('createDocumentUnderParentById is not implemented in Scope A');
  }

  async createDocumentUnderParentByPath(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('createDocumentUnderParentByPath is not implemented in Scope A');
  }

  async deleteDocumentById(): Promise<AxiosLikeResponse<void>> {
    throw new Error('deleteDocumentById is not implemented in Scope A');
  }

  async deleteDocumentByPath(): Promise<AxiosLikeResponse<void>> {
    throw new Error('deleteDocumentByPath is not implemented in Scope A');
  }

  async patchDocumentById(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('patchDocumentById is not implemented in Scope A');
  }

  async patchDocumentByPath(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('patchDocumentByPath is not implemented in Scope A');
  }

  /**
   * The `sys_acl` half of upstream's document update, and nothing else.
   *
   * `PermissionsDataAccessService.updateDocument` is the only caller upstream has for this method,
   * and it sends exactly `{ sys_acl }`. Accepting a general property patch here would be a claim
   * this port cannot honour, so anything else is refused by name rather than half-applied.
   *
   * Nuxeo has no operation that replaces an ACL, so the desired one is written as a clear followed
   * by a replay. **The window between them is real**: a failure after the clear leaves the document
   * on its inherited permissions until the caller retries. Nuxeo enforces `WriteSecurity` on every
   * one of these calls, so a user who cannot change permissions gets a 403 on the first.
   */
  async updateDocumentById(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
    requestBody?: Record<string, unknown>,
  ): Promise<AxiosLikeResponse<Document>> {
    const properties = requestBody ?? {};
    const unsupported = Object.keys(properties).filter((key) => key !== 'sys_acl');
    if (unsupported.length > 0 || !Array.isArray(properties['sys_acl'])) {
      // The wording keeps the `<name> is not implemented in Scope A` phrase the other refused
      // writes share, because it is still true of everything except `sys_acl` and the port's own
      // spec asserts the whole family by that sentence.
      throw new Error(
        `updateDocumentById is not implemented in Scope A beyond sys_acl; received ${Object.keys(properties).join(', ') || '(nothing)'}`,
      );
    }

    const { grants, blockInheritance, deniedPrincipals, unreadableAces } = toNuxeoLocalAclWrite(
      properties['sys_acl'] as ACE[],
    );
    if (deniedPrincipals.length > 0) {
      throw new Error(
        `Nuxeo cannot store a deny ACE through this port: ${deniedPrincipals.join(', ')}`,
      );
    }
    if (unreadableAces.length > 0) {
      throw new Error(
        `Refusing to write an ACL containing an ACE this port cannot read: ${unreadableAces.join(', ')}. ` +
          'The write clears the local ACL first, so applying it would delete these rather than skip them.',
      );
    }

    // Read before writing, and refuse rather than clear, when the document holds an ACE upstream
    // cannot represent. Upstream's panel drops any permission outside Read/ReadWrite/Everything on
    // save, so combined with the clear below a document carrying `AddChildren` or `WriteSecurity`
    // lost it on the first Save and the call returned success.
    const current = await firstValueFrom(this.documentDetail.getFullDocument(docId));
    const currentLocalAcl = rawLocalAces(current);
    const inexpressible = inexpressibleLocalAces(currentLocalAcl);
    if (inexpressible.length > 0) {
      throw new Error(
        `Refusing to rewrite the ACL of ${docId}: its local ACL holds permission(s) the ` +
          `permissions panel cannot represent, so saving would silently delete them — ` +
          `${inexpressible.join(', ')}. Edit these in Nuxeo, or extend ` +
          'HX_EXPRESSIBLE_PERMISSIONS once upstream can round-trip them.',
      );
    }

    // Snapshot for the compensator below. The clear is unavoidable — Nuxeo has no replace-an-ACL
    // operation — so the best available guarantee is that a failed replay tries to put back what
    // was there and says so.
    const previous = restorableLocalAcl(currentLocalAcl);

    await firstValueFrom(this.documentDetail.removeAcl(docId));
    try {
      await this.replayLocalAcl(docId, grants, blockInheritance);
    } catch (error) {
      const restored = await this.tryRestoreLocalAcl(docId, previous);
      throw new Error(
        `The ACL of ${docId} was cleared and the replacement failed: ${describeError(error)}. ` +
          (restored
            ? 'The previous ACL was restored, so the document is unchanged.'
            : 'Restoring the previous ACL also failed, so the document is now on its inherited ' +
              'permissions with a partial local ACL and needs manual repair.'),
      );
    }

    return this.getDocumentById(docId, repositoryId);
  }

  /**
   * Replay a desired local ACL onto a document whose local ACL has just been cleared.
   *
   * `blockPermissionInheritance` runs **last** on purpose, and it is worth stating why, because the
   * reverse was proposed during review as a way to shrink the widening window: Nuxeo appends the
   * deny ACE and evaluates ACEs in order, so a deny-Everything-to-Everyone written ahead of the
   * grants would shadow every one of them. Blocking first would close the window by breaking the
   * ACL.
   */
  private async replayLocalAcl(
    docId: string,
    grants: readonly NuxeoAclGrant[],
    blockInheritance: boolean,
  ): Promise<void> {
    for (const grant of grants) {
      await firstValueFrom(
        this.documentDetail.addPermission(docId, {
          username: grant.principal,
          permission: grant.permission,
          begin: grant.begin ?? null,
          end: grant.end ?? null,
          notify: false,
          ...(grant.creator ? { creator: grant.creator } : {}),
        }),
      );
    }
    if (blockInheritance) {
      await firstValueFrom(this.documentDetail.blockPermissionInheritance(docId));
    }
  }

  /** @returns `true` when the previous ACL was put back in full. */
  private async tryRestoreLocalAcl(docId: string, previous: NuxeoLocalAclWrite): Promise<boolean> {
    try {
      // Clear first: the failed replay may have written some of the new grants, and those must not
      // survive alongside the restored ones.
      await firstValueFrom(this.documentDetail.removeAcl(docId));
      await this.replayLocalAcl(docId, previous.grants, previous.blockInheritance);
      return true;
    } catch {
      return false;
    }
  }

  async updateDocumentByPath(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('updateDocumentByPath is not implemented in Scope A');
  }
}

/**
 * An HTTP failure as something worth reading in an error message.
 *
 * `String(error)` on an `HttpErrorResponse` yields `[object Object]`, which is what the ACL
 * rollback message reported for the underlying cause — the one piece of information an operator
 * needs to tell a permission denial from an outage.
 */
function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  const { status, statusText, message } = (error ?? {}) as {
    status?: unknown;
    statusText?: unknown;
    message?: unknown;
  };
  if (typeof status === 'number') {
    return `HTTP ${status}${typeof statusText === 'string' && statusText ? ` ${statusText}` : ''}`;
  }
  return typeof message === 'string' ? message : 'unknown error';
}

export { ROOT_DOCUMENT };
