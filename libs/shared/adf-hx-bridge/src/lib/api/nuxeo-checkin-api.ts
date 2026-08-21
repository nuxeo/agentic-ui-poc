import { Injectable, inject } from '@angular/core';
import type { CopyCommand, Document } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentToHx } from '../mapping/nuxeo-to-hx-document.mapper';
import { assertDefaultRepository, type AxiosLikeResponse } from './nuxeo-version-api';
import { NuxeoCopyApi } from './nuxeo-copy-move-api';

/**
 * The `CHECKIN` API port, backed by Nuxeo's `Document.CheckIn` operation.
 *
 * Reached through `DocumentService -> CreateDocumentVersionService`. Required for the
 * document list to construct at all, not for any check-in feature the POC offers.
 *
 * The generated `CheckInApi` also declares `copy`, apparently an artefact of how the
 * OpenAPI client groups operations. It delegates to {@link NuxeoCopyApi} rather than
 * duplicating the logic or dead-ending.
 */
@Injectable()
export class NuxeoCheckInApi {
  private readonly documentDetail = inject(DocumentDetailService);
  private readonly copyApi = inject(NuxeoCopyApi);

  /**
   * @param minor `true` increments the minor version, `false` the major. Minor is
   *   Nuxeo's own default for the operation.
   */
  async checkin(
    docId: string,
    minor = true,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Document>> {
    if (!docId) throw new Error('checkin requires a document id');
    assertDefaultRepository('checkin', repositoryId);

    const checkedIn = await firstValueFrom(this.documentDetail.checkInDocument(docId, minor));
    return { data: mapNuxeoDocumentToHx(checkedIn, repositoryId) };
  }

  /** Delegates to the `COPY` port; see the class comment. */
  async copy(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
    copyCommand?: CopyCommand,
  ): Promise<AxiosLikeResponse<Document>> {
    return this.copyApi.copy(docId, repositoryId, copyCommand);
  }
}
