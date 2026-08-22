import { Injectable, inject } from '@angular/core';
import type { Model } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom } from 'rxjs';

import { ContentModelService } from '@agentic-ui/shared/nuxeo-client';

import { mapNuxeoContentModelToHx } from '../mapping/nuxeo-to-hx-model.mapper';
import type { AxiosLikeResponse } from './nuxeo-version-api';

/**
 * The `MODEL` API port — **read side only**, backed by Nuxeo's `/config/*` endpoints.
 *
 * ## Why the read side exists now
 *
 * It was bound as a refusing port for most of Phase 3, on the grounds that no adopted
 * component needed it. `metadata-sidebar` and `properties-viewer` do, through
 * `DOCUMENT_PROPERTIES_SERVICE` → `DocumentPropertiesService` → `DocumentModelService`, which
 * is `providedIn: 'root'` and calls `getModel()` **eagerly from its constructor**. A refusing
 * port did not stop that service constructing — an `async` method that throws returns a
 * rejected promise, not a synchronous throw — but it did put an **unhandled promise rejection**
 * in the console the moment anything injected it, and made every property field fail at read.
 * Both are recorded in `nuxeo-unmapped-api.spec.ts`, which was written because the opposite had
 * been claimed.
 *
 * REFUSES: R2 — the `MODEL` write half is **unimplementable**, not unimplemented.
 *
 * ## Why the write side still refuses
 *
 * HxPR treats the content model as a document it can `set` and `patch` wholesale, including
 * per-project variants. Nuxeo's model is server-side configuration deployed with a package or
 * a Studio project and **not writable over REST at all** — there is no endpoint to call, so
 * these are not unimplemented, they are unimplementable. They refuse by name rather than
 * returning a plausible success, which is the pattern `AGENTS/11-beta-program.md` §3 records.
 */
@Injectable()
export class NuxeoModelApi {
  private readonly contentModel = inject(ContentModelService);

  private static refuse(method: string, detail: string): never {
    throw new Error(`${method} is not implemented: ${detail}`);
  }

  /**
   * The whole content model, in one call from upstream's point of view.
   *
   * `ContentModelService` caches its three `/config/*` reads for the application's lifetime,
   * so this is cheap to call repeatedly. That matters more than it looks: upstream builds its
   * `model$` in a constructor and several services subscribe to it independently.
   */
  async getModel(): Promise<AxiosLikeResponse<Model>> {
    const nuxeo = await firstValueFrom(this.contentModel.getContentModel());
    return { data: mapNuxeoContentModelToHx(nuxeo) };
  }

  /**
   * Nuxeo has no per-project model, so there is nothing to scope by project id.
   *
   * Refused rather than answered with the whole model: a caller asking for one project's items
   * and silently receiving every type would be worse than an error, because it looks like it
   * worked.
   */
  async getModelItemsForProject(): Promise<never> {
    return NuxeoModelApi.refuse(
      'getModelItemsForProject',
      'Nuxeo has no per-project model, so there is no project to scope the model to. ' +
        'Answering with the whole model would look like success.',
    );
  }

  async setModel(): Promise<never> {
    return NuxeoModelApi.refuse('setModel', 'the Nuxeo content model is not writable over REST.');
  }

  async patchModel(): Promise<never> {
    return NuxeoModelApi.refuse('patchModel', 'the Nuxeo content model is not writable over REST.');
  }

  async setModelItemsForProject(): Promise<never> {
    return NuxeoModelApi.refuse(
      'setModelItemsForProject',
      'Nuxeo has no per-project model, and its model is not writable over REST.',
    );
  }
}
