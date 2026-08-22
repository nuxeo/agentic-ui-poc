import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DocumentModelService } from '@alfresco/adf-hx-content-services/services';
import { firstValueFrom } from 'rxjs';

import { NuxeoModelApi, NuxeoUploadApi } from './nuxeo-unmapped-api';

/**
 * What a *refusing* port actually does to the upstream service that depends on it.
 *
 * This file exists because a claim about it was made and was wrong. `DocumentModelService`'s
 * constructor is `this.model$ = this.getModel()`, which calls `modelApi.getModel()` eagerly,
 * and that was read as "the service cannot be constructed, so metadata-sidebar is blocked at
 * construction time". It is not. `getModel` is `async`, so a `throw` in its body becomes a
 * **rejected promise**, and `from(promise)` does not touch it until something subscribes.
 *
 * The distinction changes how the failure presents, which is the whole point of binding a
 * refusing port rather than leaving the token unbound. Construction failing would take down
 * every component behind `DOCUMENT_PROPERTIES_SERVICE` at inject time. A rejection surfaces
 * only where the model is *read*, so the surrounding component renders and one panel fails.
 *
 * The conclusion that `metadata-sidebar` needs a real read-side `MODEL` is unchanged. Only
 * the mechanism is, and these tests pin it so it cannot be misremembered again.
 *
 * It also turned up a real cost of the strategy — see the third test.
 */
describe('refusing ports, and what upstream does with them', () => {
  function injectModelService(): DocumentModelService {
    TestBed.configureTestingModule({
      providers: [NuxeoModelApi, { provide: MODEL_API_TOKEN, useExisting: NuxeoModelApi }],
    });
    return TestBed.inject(DocumentModelService);
  }

  it('lets DocumentModelService construct even though MODEL refuses', async () => {
    // The load-bearing assertion: this does not throw. If it ever does, the refusing-port
    // strategy has stopped working and every component behind DOCUMENT_PROPERTIES_SERVICE
    // fails at inject time rather than at the point of use.
    const service = injectModelService();
    expect(service).toBeTruthy();

    // Settle the promise the constructor created, or it stays unhandled and Vitest reports a
    // run-level error for this file. That is not test hygiene — it is the third test's subject.
    await firstValueFrom(service.getModel()).catch(() => undefined);
  });

  it('rejects at the point the model is read, with a message naming the reason', async () => {
    const service = injectModelService();
    await expect(firstValueFrom(service.getModel())).rejects.toThrow(
      '/config/types and /config/schemas',
    );
  });

  it('creates an unhandled rejection at construction, before anything reads the model', async () => {
    // A real cost of the refusing-port strategy, found while writing the first test.
    // `DocumentModelService`'s constructor calls `modelApi.getModel()` eagerly to build
    // `model$`, so a rejected promise exists from the moment the service is injected — with
    // nothing subscribed to it. In a browser that is an `Unhandled Promise Rejection` in the
    // console, fired by injection alone rather than by any user action.
    //
    // It matters twice over: it will trip `expectNoConsoleErrors` the moment metadata-sidebar
    // or properties-viewer is adopted, and an unhandled rejection is indistinguishable at a
    // glance from a crash. A read-side `MODEL` implementation removes it; nothing short of one
    // does, because the eager call is upstream's and the rejection is ours.
    const service = injectModelService();

    let rejection: unknown;
    await firstValueFrom(service.getModel()).catch((error) => (rejection = error));
    expect(rejection).toBeInstanceOf(Error);
    // No subscription happened between construction and this line, so the promise the
    // constructor made was unhandled for that whole window.
    expect(String(rejection)).toContain('getModel is not implemented');
  });

  it('refuses every write side of MODEL rather than accepting and discarding it', async () => {
    const api = new NuxeoModelApi();
    await expect(api.setModel()).rejects.toThrow('not writable over REST');
    await expect(api.patchModel()).rejects.toThrow('not writable over REST');
    await expect(api.setModelItemsForProject()).rejects.toThrow('not writable over REST');
    await expect(api.getModelItemsForProject()).rejects.toThrow('no per-project model');
  });

  it('refuses every UPLOAD method, naming the protocol mismatch', async () => {
    const api = new NuxeoUploadApi();
    for (const call of [
      api.createUpload(),
      api.upload(),
      api.complete(),
      api.getUploadInfo(),
      api.renewCredentials(),
      api.deleteUpload(),
    ]) {
      await expect(call).rejects.toThrow('different lifecycles');
    }
  });
});
