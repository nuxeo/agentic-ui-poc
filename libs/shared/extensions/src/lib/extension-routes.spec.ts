import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterOutlet, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';

import { provideExtensionRoutes } from './extension-routes';
import { provideSatoriExtensions } from './provide-satori-extensions';

@Component({ standalone: true, selector: 'lib-test-home', template: 'PACKAGED HOME' })
class HomeComponent {}

@Component({
  standalone: true,
  selector: 'lib-test-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class ShellComponent {}

@Component({
  standalone: true,
  selector: 'lib-test-reports',
  template: '<p class="reports">CONTRIBUTED REPORTS PAGE</p>',
})
class ReportsComponent {}

/**
 * A manifest with one `routes` entry, fed the way the product feeds one.
 *
 * `AppExtensionsService` reads `AppConfigService.manifest().extensions`, so
 * standing in a manifest here exercises the real merge path rather than calling
 * `ExtensionSlotRegistry.register()` directly — which is what a customer cannot
 * do and therefore what this test must not do either.
 */
function provideManifest(extensions: unknown) {
  return {
    provide: AppConfigService,
    useValue: { manifest: signal({ extensions }) },
  };
}

describe('provideExtensionRoutes', () => {
  /**
   * The claim: a route that exists only in the manifest resolves to a registered
   * component and that component's markup is in the document.
   *
   * Seen red on purpose by removing `provideExtensionRoutes()` from the
   * providers: `navigateByUrl('/reports')` then rejected with
   * `NG04002: Cannot match any routes. URL Segment: 'reports'`, which is exactly
   * the state the four reserved slots were in before this change.
   */
  it('renders a component named only by the manifest at a path only the manifest declares', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: '',
              component: ShellComponent,
              children: [{ path: '', component: HomeComponent }],
            },
          ],
          withComponentInputBinding(),
        ),
        provideManifest({
          slots: {
            routes: [
              {
                id: 'acme.routes.reports',
                path: 'reports',
                componentId: 'acme.components.reports',
              },
            ],
          },
        }),
        provideSatoriExtensions({ components: { 'acme.components.reports': ReportsComponent } }),
        provideExtensionRoutes(),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/reports');
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(harness.routeNativeElement?.ownerDocument.body.textContent).toContain(
      'CONTRIBUTED REPORTS PAGE',
    );
  });

  /**
   * The negative half. An entry the manifest marks `disabled` must not produce a
   * route at all — otherwise `disabled` would be cosmetic, and the assertion
   * above would pass for any manifest whatsoever.
   */
  it('does not register a disabled entry', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: '',
              component: ShellComponent,
              children: [{ path: '', component: HomeComponent }],
            },
          ],
          withComponentInputBinding(),
        ),
        provideManifest({
          slots: {
            routes: [
              {
                id: 'acme.routes.reports',
                path: 'reports',
                componentId: 'acme.components.reports',
                disabled: true,
              },
            ],
          },
        }),
        provideSatoriExtensions({ components: { 'acme.components.reports': ReportsComponent } }),
        provideExtensionRoutes(),
      ],
    });

    const harness = await RouterTestingHarness.create();

    await expect(harness.navigateByUrl('/reports')).rejects.toThrow(/Cannot match any routes/);
  });

  /**
   * The packaged config must survive the merge. `resetConfig` replaces the whole
   * router configuration, so a contribution that dropped the application's own
   * routes would still pass the first test.
   */
  it('leaves the application routes intact', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: '',
              component: ShellComponent,
              children: [{ path: '', component: HomeComponent }],
            },
          ],
          withComponentInputBinding(),
        ),
        provideManifest({
          slots: {
            routes: [
              {
                id: 'acme.routes.reports',
                path: 'reports',
                componentId: 'acme.components.reports',
              },
            ],
          },
        }),
        provideSatoriExtensions({ components: { 'acme.components.reports': ReportsComponent } }),
        provideExtensionRoutes(),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    harness.detectChanges();

    expect(harness.routeNativeElement?.ownerDocument.body.textContent).toContain('PACKAGED HOME');
  });
});
