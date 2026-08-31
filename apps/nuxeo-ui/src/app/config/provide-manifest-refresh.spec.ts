import { ApplicationInitStatus, ApplicationRef, Injectable, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';

import { AuthService } from '../auth/auth.service';
import { provideManifestRefresh } from './provide-manifest-refresh';

@Injectable()
class FakeAppConfigService {
  manifestLoads = 0;

  loadManifest(): Promise<unknown> {
    this.manifestLoads += 1;
    return Promise.resolve({});
  }
}

@Injectable()
class FakeAuthService {
  readonly authenticated = signal(false);
  readonly isAuthenticated = this.authenticated.asReadonly();
}

/**
 * The behaviour under test is the fix for a real defect: the manifest is fetched
 * by an `APP_INITIALIZER`, which is before login, so the Nuxeo config document
 * answers 403 and a customer's manifest never applied on a first session.
 *
 * Each assertion is written so it fails if the re-fetch is removed: the first
 * pins that startup alone does *not* fetch (otherwise the later counts could be
 * satisfied by the pre-auth attempt and prove nothing).
 */
describe('provideManifestRefresh', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        { provide: AppConfigService, useClass: FakeAppConfigService },
        { provide: AuthService, useClass: FakeAuthService },
        ...provideManifestRefresh(),
      ],
    });

    // TestBed runs `APP_INITIALIZER` itself when the testing module is first
    // initialized; injecting the status is what forces that to have happened.
    TestBed.inject(ApplicationInitStatus);

    return {
      config: TestBed.inject(AppConfigService) as unknown as FakeAppConfigService,
      auth: TestBed.inject(AuthService) as unknown as FakeAuthService,
      // Root effects are flushed by change detection.
      flush: () => TestBed.inject(ApplicationRef).tick(),
    };
  }

  it('does not fetch the manifest while unauthenticated', () => {
    const { config, flush } = setup();

    flush();

    expect(config.manifestLoads).toBe(0);
  });

  it('fetches the manifest once the user signs in', () => {
    const { config, auth, flush } = setup();

    flush();
    auth.authenticated.set(true);
    flush();

    expect(config.manifestLoads).toBe(1);
  });

  it('does not re-fetch on unrelated change detection within one session', () => {
    const { config, auth, flush } = setup();

    auth.authenticated.set(true);
    flush();
    flush();
    flush();

    expect(config.manifestLoads).toBe(1);
  });

  it('fetches again on the next sign-in, so a manifest edited between sessions applies', () => {
    const { config, auth, flush } = setup();

    auth.authenticated.set(true);
    flush();
    auth.authenticated.set(false);
    flush();
    auth.authenticated.set(true);
    flush();

    expect(config.manifestLoads).toBe(2);
  });
});
