import { Injectable, inject } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentToHx } from '../mapping/nuxeo-to-hx-document.mapper';

/**
 * The shape upstream expects back. adf-hx's generated client is Axios-based, so every
 * port returns `{ data }` rather than the value directly. Only `data` is read by the
 * consumers we provide for, so the rest of the Axios response is not fabricated —
 * inventing a `status: 200` and empty `headers` would assert things this port cannot
 * know.
 */
export type AxiosLikeResponse<T> = { data: T };

/**
 * Nuxeo here serves one repository. A caller passing anything else is asking for an
 * operation this binding cannot perform, so it is refused rather than silently
 * retargeted at the default — accepting a parameter and discarding it is the defect
 * `NuxeoQueryApi` already has with its sort.
 */
export function assertDefaultRepository(operation: string, repositoryId: string): void {
  if (repositoryId !== DEFAULT_REPOSITORY_ID) {
    throw new Error(
      `${operation} cannot target repository "${repositoryId}": this Nuxeo binding serves only ` +
        `"${DEFAULT_REPOSITORY_ID}".`,
    );
  }
}

/**
 * The `VERSION` API port, backed by Nuxeo.
 *
 * The upstream contract is unusually small: `@hylandsoftware/hxcs-js-client`'s
 * `VersionApi` declares exactly one method. Version *listing* goes through the `QUERY`
 * port, so this is the whole interface rather than a subset of it.
 *
 * It exists because upstream's `DocumentService` requires `VERSION_API_TOKEN`
 * **non-optionally**, alongside `DOCUMENT_API_TOKEN` and `QUERY_API_TOKEN`. Without it
 * every adf-hx component reaching `DocumentCacheService` — including
 * `HxpDocumentListComponent` — fails at construction with `NG0201`.
 */
@Injectable()
export class NuxeoVersionApi {
  private readonly documentDetail = inject(DocumentDetailService);

  /**
   * Restore a document from one of its versions.
   *
   * Nuxeo's `Document.RestoreVersion` takes the **version's** own id, matching
   * upstream's `versionId`, and returns the restored live document.
   */
  async restoreVersion(
    versionId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Document>> {
    if (!versionId) throw new Error('restoreVersion requires a version id');
    assertDefaultRepository('restoreVersion', repositoryId);

    const restored = await firstValueFrom(this.documentDetail.restoreVersion(versionId));
    return { data: mapNuxeoDocumentToHx(restored, repositoryId) };
  }
}
