import { Injectable, inject } from '@angular/core';
import type { CopyCommand, Document, MoveCommand } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { BrowseService } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { mapNuxeoDocumentToHx } from '../mapping/nuxeo-to-hx-document.mapper';
import { assertDefaultRepository, type AxiosLikeResponse } from './nuxeo-version-api';

/**
 * The `COPY` API port, backed by Nuxeo's `Document.Copy` operation.
 *
 * Needed because upstream's `DocumentService` takes a `SingleItemCopyService`, which
 * injects `COPY_API_TOKEN` — three levels below the component, and non-optional at
 * every link.
 */
@Injectable()
export class NuxeoCopyApi {
  private readonly browse = inject(BrowseService);

  /**
   * **`copyCommand.name` is not honoured.** Nuxeo's `Document.Copy` names the copy
   * itself and offers no rename in the same call, so a requested name is refused rather
   * than silently dropped.
   */
  async copy(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
    copyCommand?: CopyCommand,
  ): Promise<AxiosLikeResponse<Document>> {
    if (!docId) throw new Error('copy requires a document id');
    assertDefaultRepository('copy', repositoryId);
    if (!copyCommand?.targetParentId) throw new Error('copy requires copyCommand.targetParentId');
    if (copyCommand.name) {
      throw new Error(
        'copy cannot rename in the same operation: Nuxeo Document.Copy names the copy itself. ' +
          'Copy first, then rename, rather than having the requested name silently ignored.',
      );
    }

    const copied = await firstValueFrom(
      this.browse.copyDocuments([docId], copyCommand.targetParentId),
    );
    const first = copied[0];
    if (!first) throw new Error(`copy of ${docId} returned no document from Nuxeo`);
    return { data: mapNuxeoDocumentToHx(first, repositoryId) };
  }
}

/** The `MOVE` API port. Reached the same way, through `SingleItemMoveService`. */
@Injectable()
export class NuxeoMoveApi {
  private readonly browse = inject(BrowseService);

  async move(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
    moveCommand?: MoveCommand,
  ): Promise<AxiosLikeResponse<Document>> {
    if (!docId) throw new Error('move requires a document id');
    assertDefaultRepository('move', repositoryId);
    if (!moveCommand?.targetParentId) throw new Error('move requires moveCommand.targetParentId');

    const moved = await firstValueFrom(
      this.browse.moveDocuments([docId], moveCommand.targetParentId),
    );
    const first = moved[0];
    if (!first) throw new Error(`move of ${docId} returned no document from Nuxeo`);
    return { data: mapNuxeoDocumentToHx(first, repositoryId) };
  }
}
