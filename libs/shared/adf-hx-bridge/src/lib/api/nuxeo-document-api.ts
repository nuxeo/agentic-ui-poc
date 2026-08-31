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
import { NuxeoAclService, toNuxeoLocalAclWrite } from '../services/nuxeo-acl.service';

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

    const { grants, blockInheritance, deniedPrincipals } = toNuxeoLocalAclWrite(
      properties['sys_acl'] as ACE[],
    );
    if (deniedPrincipals.length > 0) {
      throw new Error(
        `Nuxeo cannot store a deny ACE through this port: ${deniedPrincipals.join(', ')}`,
      );
    }

    await firstValueFrom(this.documentDetail.removeAcl(docId));
    for (const grant of grants) {
      await firstValueFrom(
        this.documentDetail.addPermission(docId, {
          username: grant.principal,
          permission: grant.permission,
          begin: grant.begin ?? null,
          end: grant.end ?? null,
          notify: false,
        }),
      );
    }
    // Last, because Nuxeo appends the deny ACE and a deny ahead of a grant would shadow it.
    if (blockInheritance) {
      await firstValueFrom(this.documentDetail.blockPermissionInheritance(docId));
    }

    return this.getDocumentById(docId, repositoryId);
  }

  async updateDocumentByPath(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('updateDocumentByPath is not implemented in Scope A');
  }
}

export { ROOT_DOCUMENT };
