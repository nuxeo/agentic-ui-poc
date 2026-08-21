import { Injectable, inject } from '@angular/core';
import type { Rendition } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_REPOSITORY_ID } from '../tokens/adf-hx-bridge.tokens';
import { assertDefaultRepository, type AxiosLikeResponse } from './nuxeo-version-api';

/**
 * The renditions this binding can serve, each backed by a Nuxeo `@rendition` adapter that
 * `DocumentDetailService` already exposes.
 *
 * Nuxeo can offer more per document type, but it has no endpoint through our services that
 * *enumerates* them, so listing a fixed set is honest where inventing a discovery call
 * would not be. `getRenditions` says as much rather than implying it enumerated anything.
 */
const SERVABLE_RENDITIONS = ['thumbnail', 'pdf'] as const;

/**
 * The `RENDITIONS` API port, backed by Nuxeo's `@rendition` adapter.
 *
 * Upstream's `RenditionsService` is `providedIn: 'root'` and resolves this token from the
 * root injector, so it is required by anything that reaches that service — the document
 * viewer and the thumbnail paths in particular.
 */
@Injectable()
export class NuxeoRenditionsApi {
  private readonly documentDetail = inject(DocumentDetailService);

  /**
   * The renditions this binding can produce, as a fixed list.
   *
   * **Not a discovery call.** Nuxeo exposes no rendition-enumeration endpoint through this
   * bridge, so a caller expecting the document's real available set will get this pair
   * instead. That is a narrower answer than upstream's contract implies, and saying so
   * here is better than a caller assuming otherwise.
   */
  async getRenditions(
    docId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Rendition[]>> {
    if (!docId) throw new Error('getRenditions requires a document id');
    assertDefaultRepository('getRenditions', repositoryId);
    return { data: SERVABLE_RENDITIONS.map((id) => ({ sysrendition_id: id })) };
  }

  /** Fetch one rendition's bytes. */
  async getRendition(
    docId: string,
    renditionId: string,
    repositoryId: string = DEFAULT_REPOSITORY_ID,
  ): Promise<AxiosLikeResponse<Blob>> {
    if (!docId) throw new Error('getRendition requires a document id');
    assertDefaultRepository('getRendition', repositoryId);

    if (renditionId === 'thumbnail') {
      return { data: await firstValueFrom(this.documentDetail.fetchThumbnail(docId)) };
    }
    if (renditionId === 'pdf') {
      return { data: await firstValueFrom(this.documentDetail.fetchPdfRendition(docId)) };
    }
    throw new Error(
      `getRendition cannot serve "${renditionId}": this Nuxeo binding serves only ` +
        `${SERVABLE_RENDITIONS.join(' and ')}. Add a DocumentDetailService method for it first.`,
    );
  }

  /**
   * Nuxeo generates renditions itself from converters configured on the server; there is no
   * client-side create. Throwing is the honest answer — returning a fabricated `Rendition`
   * would have a caller poll for something that will never appear.
   */
  async createRendition(): Promise<AxiosLikeResponse<Rendition>> {
    throw new Error(
      'createRendition is not implemented: Nuxeo generates renditions server-side from ' +
        'configured converters, and exposes no client-side creation call.',
    );
  }
}
