import { describe, expect, it } from 'vitest';

import { NuxeoUploadApi } from './nuxeo-unmapped-api';

/**
 * The `UPLOAD` port refuses every call, and must do so by name.
 *
 * The behaviour that matters is *not returning a plausible-looking empty value*. A refusing
 * port is bound rather than left unbound so that a component constructs and fails at the point
 * of use; that only helps if the failure says which operation has no Nuxeo equivalent.
 *
 * What a refusing port does to the upstream service that depends on it is covered in
 * `nuxeo-model-api.spec.ts`, against the service that actually consumes one.
 */
describe('NuxeoUploadApi', () => {
  it('refuses every method, naming the protocol mismatch', async () => {
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

  it('names the method that was called, not just the port', async () => {
    // Six methods sharing one message would make a stack trace the only way to tell which
    // call failed.
    const api = new NuxeoUploadApi();
    await expect(api.createUpload()).rejects.toThrow('createUpload');
    await expect(api.renewCredentials()).rejects.toThrow('renewCredentials');
  });
});
