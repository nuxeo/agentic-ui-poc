import { Injectable } from '@angular/core';

/**
 * The one API port whose Nuxeo equivalent is a **different protocol**, not a different
 * endpoint.
 *
 * `MODEL` used to live here too. Its read side is implemented now, over Nuxeo's `/config/*`
 * endpoints — see `nuxeo-model-api.ts`, which keeps the same refusing treatment for the write
 * side because Nuxeo genuinely has no REST path for it.
 *
 * It is bound rather than left unbound on purpose. Eleven upstream services are
 * `providedIn: 'root'` and `inject()` their port tokens at construction, so an unbound
 * token makes every one of them — and therefore every component that touches them — fail
 * to construct at all. Binding a port whose unmappable methods throw means a component
 * constructs, renders what it can, and fails **at the point of use** with a message that
 * says exactly which operation has no Nuxeo equivalent and why.
 *
 * It does not return a plausible-looking empty value. `AGENTS/11-beta-program.md` records
 * `NuxeoQueryApi` silently discarding its sort as the defect pattern to avoid, and an empty
 * `[]` from an upload call is the same mistake with a bigger blast radius.
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
