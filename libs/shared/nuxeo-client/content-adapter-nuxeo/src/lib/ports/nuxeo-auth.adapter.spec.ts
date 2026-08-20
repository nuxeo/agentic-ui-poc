import { TestBed } from '@angular/core/testing';
import { ContentError } from '@agentic-ui/shared/content-ports';

import { NuxeoAuthAdapter } from './nuxeo-auth.adapter';

describe('NuxeoAuthAdapter', () => {
  let adapter: NuxeoAuthAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(NuxeoAuthAdapter);
  });

  it('reports that no bearer token exists instead of fabricating one', async () => {
    // Nuxeo auth is a session cookie in production and the Basic-auth interceptor in
    // development, so there is nothing for the application to hand the adapter.
    await expect(adapter.getAccessToken()).rejects.toBeInstanceOf(ContentError);
    await expect(adapter.getAccessToken()).rejects.toMatchObject({ kind: 'Unauthenticated' });
  });
});
