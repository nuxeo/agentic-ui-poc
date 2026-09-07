import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { assertDefaultRepository, type AxiosLikeResponse } from './nuxeo-version-api';

/**
 * The `DOWNLOAD` API port, backed by Nuxeo's `@blob` adapter.
 *
 * Reached from the context-menu action handlers rather than from
 * `DocumentCacheService`: `FileDownloadService -> SingleFileDownloadService ->
 * BlobDownloadService -> DOWNLOAD_API_TOKEN`. Required even with
 * `[contextMenuActions]="false"`, because `ContextMenuActionsService` constructs its
 * handlers eagerly and that input only controls rendering.
 *
 * Upstream splits the parameter as `propertyXPathAndFilename` — xpath and download
 * filename joined by a slash, e.g. `file:content/invoice.pdf`. Nuxeo's `@blob` adapter
 * takes the xpath alone and names the file from the blob, so the filename half is parsed
 * off and **deliberately dropped**, recorded here rather than pretended away.
 */
@Injectable()
export class NuxeoDownloadApi {
  private readonly documentDetail = inject(DocumentDetailService);

  /**
   * @param inline unused by Nuxeo's `@blob` adapter, which sets no `Content-Disposition`
   *   from a parameter. An explicit `inline` request is refused rather than ignored.
   */
  async downloadByIdAndXPath(
    docId: string,
    propertyXPathAndFilename: string,
    inline?: boolean,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Blob>> {
    if (!docId) throw new Error('downloadByIdAndXPath requires a document id');
    assertDefaultRepository('downloadByIdAndXPath', repositoryId);
    if (inline) {
      throw new Error(
        "downloadByIdAndXPath cannot honour inline=true: Nuxeo's @blob adapter takes no " +
          'disposition parameter. Fetch the blob and render it from an object URL instead.',
      );
    }

    const blob = await firstValueFrom(
      this.documentDetail.fetchBlobByXpath(docId, parseXPath(propertyXPathAndFilename)),
    );
    return { data: blob };
  }

  /**
   * Upstream uses this to learn a blob's size and type without fetching it. Nuxeo exposes
   * no blob-metadata endpoint through our services, and fetching the blob to describe it
   * would make an "info" call as expensive as a download.
   */
  async downloadInfoByIdAndXPath(): Promise<AxiosLikeResponse<void>> {
    throw new Error(
      'downloadInfoByIdAndXPath is not implemented: Nuxeo exposes no blob-metadata endpoint ' +
        'through this bridge, and fetching the blob to describe it would cost a full download.',
    );
  }

  /**
   * Upstream expects a pre-signed, expiring URL. Nuxeo's `@blob` URLs are ordinary
   * authenticated endpoints, so returning one would hand out a link that works only for
   * an already-authenticated session and never expires. Claiming otherwise is worse than
   * not implementing it.
   */
  async downloadUrlByIdAndXPath(): Promise<AxiosLikeResponse<string>> {
    throw new Error(
      'downloadUrlByIdAndXPath is not implemented: Nuxeo @blob URLs are authenticated rather ' +
        'than pre-signed, so no expiring shareable URL can be produced here.',
    );
  }
}

/**
 * Take the xpath from `<xpath>` or `<xpath>/<filename>`. Nuxeo xpaths contain a colon
 * and no slash — `file:content`, `blobholder:0` — so the first segment is the xpath.
 */
function parseXPath(propertyXPathAndFilename: string): string {
  if (!propertyXPathAndFilename) {
    throw new Error('downloadByIdAndXPath requires a property xpath');
  }
  return propertyXPathAndFilename.split('/')[0];
}
