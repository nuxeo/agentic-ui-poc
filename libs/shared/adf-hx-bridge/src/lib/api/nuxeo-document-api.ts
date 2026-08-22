import { Injectable, inject } from '@angular/core';
import type { Document, DocumentAncestors } from '@hylandsoftware/hxcs-js-client';
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
import { NuxeoAclService } from '../services/nuxeo-acl.service';

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
    const acl = await firstValueFrom(this.acl.aclFor(nuxeo));
    return acl === undefined ? mapped : { ...mapped, sys_acl: acl };
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

  async updateDocumentById(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('updateDocumentById is not implemented in Scope A');
  }

  async updateDocumentByPath(): Promise<AxiosLikeResponse<Document>> {
    throw new Error('updateDocumentByPath is not implemented in Scope A');
  }
}

export { ROOT_DOCUMENT };
