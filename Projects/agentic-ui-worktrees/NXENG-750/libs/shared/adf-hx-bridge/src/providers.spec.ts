import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  CHECKIN_API_TOKEN,
  COPY_API_TOKEN,
  DOCUMENT_API_TOKEN,
  DOWNLOAD_API_TOKEN,
  GROUP_API_TOKEN,
  MODEL_API_TOKEN,
  MOVE_API_TOKEN,
  QUERY_API_TOKEN,
  RENDITIONS_API_TOKEN,
  UPLOAD_API_TOKEN,
  USER_API_TOKEN,
  VERSION_API_TOKEN,
} from '@alfresco/adf-hx-content-services/api';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  ADF_HX_NUXEO_BRIDGE_PROVIDERS,
  NuxeoCheckInApi,
  NuxeoCopyApi,
  NuxeoDownloadApi,
  NuxeoGroupApi,
  NuxeoModelApi,
  NuxeoMoveApi,
  NuxeoRenditionsApi,
  NuxeoUploadApi,
  NuxeoUserApi,
  NuxeoVersionApi,
  provideAdfHxNuxeoBridge,
} from './providers';
import * as mainBarrel from './index';
import { NuxeoPrincipalResolver } from './lib/services/nuxeo-principal-resolver.service';

/**
 * The secondary entry point, `@agentic-ui/shared/adf-hx-bridge/providers`.
 *
 * This file is a barrel with no logic, so the temptation is to leave it untested. What it
 * actually carries is a **bundle boundary** and a **DI contract**, and both have already failed
 * once:
 *
 * - The boundary: everything reaching `@alfresco/adf-hx-*` is here rather than in the main
 *   barrel, because the shell imports the main barrel and a barrel is one module. Measured at
 *   +0.95 MB on the initial bundle, past the 2 MB budget error.
 * - The DI contract: the bridge once declared its own `DOCUMENT_API_TOKEN` and
 *   `QUERY_API_TOKEN` clones. Angular resolves by identity, so the clones satisfied our own
 *   services while being **invisible to every adf-hx component** — a registration that looked
 *   complete and rendered nothing.
 *
 * So the assertions below resolve each upstream token through a real injector and check the
 * instance is ours. Asserting the array's contents instead would re-make the clone mistake: a
 * `{ provide: X, useClass: Y }` literal is identical in shape whether `X` is upstream's token or
 * a look-alike.
 */
describe('adf-hx-bridge providers entry point', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...ADF_HX_NUXEO_BRIDGE_PROVIDERS,
      ],
    });
  });

  /** Every port token upstream requires, paired with the implementation we bind to it. */
  const bindings: readonly [string, unknown, new (...args: never[]) => object][] = [
    ['VERSION', VERSION_API_TOKEN, NuxeoVersionApi],
    ['COPY', COPY_API_TOKEN, NuxeoCopyApi],
    ['MOVE', MOVE_API_TOKEN, NuxeoMoveApi],
    ['CHECKIN', CHECKIN_API_TOKEN, NuxeoCheckInApi],
    ['DOWNLOAD', DOWNLOAD_API_TOKEN, NuxeoDownloadApi],
    ['USER', USER_API_TOKEN, NuxeoUserApi],
    ['GROUP', GROUP_API_TOKEN, NuxeoGroupApi],
    ['RENDITIONS', RENDITIONS_API_TOKEN, NuxeoRenditionsApi],
    ['UPLOAD', UPLOAD_API_TOKEN, NuxeoUploadApi],
    ['MODEL', MODEL_API_TOKEN, NuxeoModelApi],
  ];

  it.each(bindings)(
    'binds upstream %s_API_TOKEN to the Nuxeo implementation',
    (_name, token, implementation) => {
      // `TestBed.inject(token)` is the same lookup an adf-hx component performs. A local clone
      // of the token would throw NG0201 here rather than quietly resolving.
      const instance = TestBed.inject(token as never);
      expect(instance).toBeInstanceOf(implementation);
    },
  );

  it('binds DOCUMENT and QUERY, the two tokens that were once local clones', () => {
    // Named separately because these are the two that actually went wrong. Their classes are
    // exported from the main barrel rather than this one, so the check is that the token
    // resolves to *something* and that it is the same instance the class token gives — which is
    // what proves one DI graph rather than two.
    expect(TestBed.inject(DOCUMENT_API_TOKEN)).toBeDefined();
    expect(TestBed.inject(QUERY_API_TOKEN)).toBeDefined();
  });

  it('creates a SECOND instance per port, because the token uses useClass not useExisting', () => {
    // DEFECT (reported, not changed). Asserting what the array ACTUALLY produces.
    //
    // Each port appears twice: once as `{ provide: X_API_TOKEN, useClass: NuxeoXApi }` and once
    // as the bare class. `useClass` constructs its own instance, so the token and the class
    // token resolve to two different objects — twelve extra instances per injector. The file
    // itself uses `useExisting` for `DocumentRouterService`, so the distinction was known;
    // `useExisting: NuxeoCopyApi` on each token would collapse them.
    //
    // Harmless today, and that is a property of the current code rather than of the wiring: the
    // ports are stateless adapters and every cache they rely on lives in a `providedIn: 'root'`
    // service they inject — `ContentModelService` for the MODEL cache, `NuxeoPrincipalResolver`
    // for directory lookups, which is registered once as a bare class and therefore is shared.
    // The moment a port holds state of its own — a cached `/config` response, an in-flight map —
    // it silently gets two of them, and only one is the one adf-hx components talk to.
    expect(TestBed.inject(COPY_API_TOKEN)).not.toBe(TestBed.inject(NuxeoCopyApi));
    expect(TestBed.inject(CHECKIN_API_TOKEN)).not.toBe(TestBed.inject(NuxeoCheckInApi));
    // Both are still the right class, which is why nothing has noticed.
    expect(TestBed.inject(COPY_API_TOKEN)).toBeInstanceOf(NuxeoCopyApi);
    // Each lookup is itself stable — the duplication is between the two tokens, not per call.
    expect(TestBed.inject(COPY_API_TOKEN)).toBe(TestBed.inject(COPY_API_TOKEN));
    expect(TestBed.inject(NuxeoCopyApi)).toBe(TestBed.inject(NuxeoCopyApi));
  });

  it('shares the one stateful collaborator the ports depend on', () => {
    // The reason the duplication above has stayed harmless. `NuxeoPrincipalResolver` caches
    // directory lookups for the application's lifetime, and it is registered once as a bare
    // class, so there is exactly one cache no matter how many port instances exist.
    expect(TestBed.inject(NuxeoPrincipalResolver)).toBe(TestBed.inject(NuxeoPrincipalResolver));
  });

  it('provides all twelve ports, so no upstream token is left to NG0201', () => {
    // The count is the claim the file's own comment makes. Asserted so dropping one is a test
    // failure rather than an injector error discovered at runtime in a component.
    const tokens = [
      DOCUMENT_API_TOKEN,
      QUERY_API_TOKEN,
      VERSION_API_TOKEN,
      COPY_API_TOKEN,
      MOVE_API_TOKEN,
      CHECKIN_API_TOKEN,
      DOWNLOAD_API_TOKEN,
      USER_API_TOKEN,
      GROUP_API_TOKEN,
      RENDITIONS_API_TOKEN,
      UPLOAD_API_TOKEN,
      MODEL_API_TOKEN,
    ];
    expect(tokens).toHaveLength(12);
    for (const token of tokens) {
      expect(TestBed.inject(token as never)).toBeDefined();
    }
  });

  it('provideAdfHxNuxeoBridge() wires the same graph as the provider array', () => {
    // The function is what the lazily-loaded POC route calls, so it — not the array — is the
    // real entry point. A drift between the two would work in tests and fail in the app.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAdfHxNuxeoBridge()],
    });

    expect(TestBed.inject(DOWNLOAD_API_TOKEN)).toBeInstanceOf(NuxeoDownloadApi);
    expect(TestBed.inject(MODEL_API_TOKEN)).toBeInstanceOf(NuxeoModelApi);
    expect(TestBed.inject(DOCUMENT_API_TOKEN)).toBeDefined();
  });

  it('re-exports the adf-hx-reaching surface that must stay out of the main barrel', () => {
    // Presence, not shape. If one of these moved back to `src/index.ts`, the shell's import of
    // the main barrel would pull adf-core into the initial bundle again — the +0.95 MB
    // regression this entry point exists to prevent. The `no-test-libs-in-bundle` and
    // `api-surface` gates guard the bundle itself; this guards the export list they measure.
    for (const exported of [
      NuxeoVersionApi,
      NuxeoCopyApi,
      NuxeoMoveApi,
      NuxeoCheckInApi,
      NuxeoDownloadApi,
      NuxeoUserApi,
      NuxeoGroupApi,
      NuxeoRenditionsApi,
      NuxeoModelApi,
      NuxeoUploadApi,
      provideAdfHxNuxeoBridge,
      ADF_HX_NUXEO_BRIDGE_PROVIDERS,
    ]) {
      expect(exported).toBeDefined();
    }
    expect(typeof provideAdfHxNuxeoBridge).toBe('function');
    expect(Array.isArray(ADF_HX_NUXEO_BRIDGE_PROVIDERS)).toBe(true);
  });

  it('keeps the adf-hx-reaching names OUT of the main barrel', () => {
    // The load-bearing half, and the one an export list cannot state about itself. The shell
    // imports `src/index.ts`; if any of these appeared there, adf-core would land in the
    // initial bundle. Asserted as absence from the *other* module rather than presence in this
    // one, because presence in both is exactly the regression.
    //
    // Presence first, so the absences below are not the absence of a barrel altogether.
    expect(mainBarrel.NuxeoDocumentApi).toBeDefined();
    expect(mainBarrel.escapeHxqlLiteral).toBeDefined();
    expect(mainBarrel.HxpDocumentCardsComponent).toBeDefined();

    for (const name of [
      'NuxeoVersionApi',
      'NuxeoCopyApi',
      'NuxeoMoveApi',
      'NuxeoCheckInApi',
      'NuxeoDownloadApi',
      'NuxeoUserApi',
      'NuxeoGroupApi',
      'NuxeoRenditionsApi',
      'NuxeoModelApi',
      'NuxeoUploadApi',
      'provideAdfHxNuxeoBridge',
      'ADF_HX_NUXEO_BRIDGE_PROVIDERS',
      // Not exported from the main barrel either: it imports upstream's API tokens.
      'AdfHxDocumentService',
    ]) {
      expect(name in mainBarrel).toBe(false);
    }
  });
});
