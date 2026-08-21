import { Injectable } from '@angular/core';

/**
 * The two API ports whose Nuxeo equivalent is a **different protocol**, not a different
 * endpoint.
 *
 * They are bound rather than left unbound on purpose. Eleven upstream services are
 * `providedIn: 'root'` and `inject()` their port tokens at construction, so an unbound
 * token makes every one of them — and therefore every component that touches them — fail
 * to construct at all. Binding a port whose unmappable methods throw means a component
 * constructs, renders what it can, and fails **at the point of use** with a message that
 * says exactly which operation has no Nuxeo equivalent and why.
 *
 * Neither returns a plausible-looking empty value. `AGENTS/11-beta-program.md` records
 * `NuxeoQueryApi` silently discarding its sort as the defect pattern to avoid, and an empty
 * `[]` from a model call is the same mistake with a bigger blast radius.
 */

/**
 * The `UPLOAD` port.
 *
 * HxPR uploads are a six-call chunked protocol with its own credential renewal:
 * `createUpload`, `upload`, `complete`, `getUploadInfo`, `renewCredentials`, `deleteUpload`.
 * Nuxeo uses batch uploads — `POST /upload/{batchId}/{fileIdx}` then an operation that
 * consumes the batch — which is a different lifecycle, not a renamed one. Mapping them is
 * real work and belongs with whichever component first needs it.
 */
@Injectable()
export class NuxeoUploadApi {
  private static refuse(method: string): never {
    throw new Error(
      `${method} is not implemented: HxPR's chunked upload protocol and Nuxeo's batch upload ` +
        'are different lifecycles rather than different endpoints. See AGENTS/11-beta-program.md ' +
        'section 3 before mapping them.',
    );
  }

  async createUpload(): Promise<never> {
    return NuxeoUploadApi.refuse('createUpload');
  }
  async upload(): Promise<never> {
    return NuxeoUploadApi.refuse('upload');
  }
  async complete(): Promise<never> {
    return NuxeoUploadApi.refuse('complete');
  }
  async getUploadInfo(): Promise<never> {
    return NuxeoUploadApi.refuse('getUploadInfo');
  }
  async renewCredentials(): Promise<never> {
    return NuxeoUploadApi.refuse('renewCredentials');
  }
  async deleteUpload(): Promise<never> {
    return NuxeoUploadApi.refuse('deleteUpload');
  }
}

/**
 * The `MODEL` port.
 *
 * HxPR treats the content model as one document it can `get`, `set` and `patch` wholesale,
 * including per-project variants. Nuxeo's model is server-side configuration exposed
 * piecemeal through `/config/types` and `/config/schemas` and is **not** writable over
 * REST. `setModel` and `patchModel` therefore have no Nuxeo equivalent at all, and the read
 * side needs a translation from Nuxeo's type/schema shape that no component has required
 * yet.
 */
@Injectable()
export class NuxeoModelApi {
  private static refuse(method: string, detail: string): never {
    throw new Error(`${method} is not implemented: ${detail}`);
  }

  async getModel(): Promise<never> {
    return NuxeoModelApi.refuse(
      'getModel',
      'Nuxeo exposes its content model piecemeal through /config/types and /config/schemas, ' +
        "which needs a translation to HxPR's single-document Model shape. No adopted component " +
        'requires it yet.',
    );
  }
  async getModelItemsForProject(): Promise<never> {
    return NuxeoModelApi.refuse('getModelItemsForProject', 'Nuxeo has no per-project model.');
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
