import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { vi } from 'vitest';

import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import {
  EXTENSION_SLOTS,
  PACKAGED_DOCUMENT_TABS,
  PACKAGED_DOCUMENT_TOOLBAR_ACTIONS,
  provideSatoriExtensions,
} from '@nuxeo-satori/platform/extensions';
import {
  ARenderService,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  NuxeoApiBase,
  TagService,
  TaskService,
  WorkflowService,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  AiChatService,
  AiFeatureFlagService,
  AiGatewayService,
} from '@agentic-ui/shared/ai-client';
import { KeClientService, type KeEnrichmentResult } from '@agentic-ui/shared/ke-client';

import { DocumentDetailComponent } from './document-detail';

/**
 * The `toolbar` and `tabs` slots, asserted **against the rendered template**.
 *
 * The sibling spec files stub the template out — `.overrideComponent(… template:
 * '<div></div>')` — which is right for testing the load chain and useless here.
 * The defect this file exists to prevent is exactly a descriptor that resolves
 * and never reaches a screen, so nothing short of the real template can assert it.
 *
 * Every contribution below arrives through `AppConfigService.manifest()`, which
 * is the only route a customer has. Registering into `ExtensionSlotRegistry`
 * directly would prove that the registry works and nothing about Layer 1.
 */

// jsdom implements neither, and the real template pulls in Satori breadcrumbs and
// the Material tab strip, both of which observe their host on construction.
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver ??= class {
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
};

const CONTRIBUTED_TAB_MARKER = 'CONTRIBUTED CLAIMS PANEL';

@Component({
  standalone: true,
  selector: 'lib-test-claims-panel',
  template: '<p class="claims">CONTRIBUTED CLAIMS PANEL</p>',
})
class ClaimsPanelComponent {}

function doc(over: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Test Document',
    type: 'File',
    path: '/default-domain/workspaces/ws/test-document',
    state: 'project',
    lastModified: '2026-08-24T10:00:00.000Z',
    properties: {},
    contextParameters: { permissions: ['Read', 'Write', 'ReadWrite', 'Everything', 'Remove'] },
    ...over,
  };
}

const emptyKe = (): Observable<KeEnrichmentResult> =>
  of({ textClassification: { result: '' } } as KeEnrichmentResult);

const mockDetailService = {
  getFullDocument: vi.fn((): Observable<NuxeoDocument> => of(doc())),
  fetchBlob: vi.fn((): Observable<Blob> => of(new Blob(['x'], { type: 'text/plain' }))),
  fetchBlobByXpath: vi.fn((): Observable<Blob> => of(new Blob(['x']))),
  fetchThumbnail: vi.fn((): Observable<Blob> => of(new Blob(['x'], { type: 'image/png' }))),
  fetchPdfRendition: vi.fn((): Observable<Blob> =>
    of(new Blob(['x'], { type: 'application/pdf' })),
  ),
  getAllComments: vi.fn((): Observable<{ entries: unknown[] }> => of({ entries: [] })),
  getVersions: vi.fn((): Observable<unknown[]> => of([])),
  getPublishedVersions: vi.fn((): Observable<unknown[]> => of([])),
  getSectionTree: vi.fn((): Observable<unknown[]> => of([])),
  getRunnableWorkflows: vi.fn((): Observable<unknown[]> => of([])),
  getAuditLog: vi.fn((): Observable<Record<string, unknown>> =>
    of({ entries: [], resultsCount: 0 }),
  ),
  getDocumentPermissions: vi.fn((): Observable<NuxeoDocument> => of(doc())),
  exportXml: vi.fn((): Observable<Blob> => of(new Blob(['<xml/>']))),
  exportZip: vi.fn((): Observable<Blob> => of(new Blob(['zip']))),
};

const mockDirectoryService = {
  getEventTypes: vi.fn((): Observable<unknown[]> => of([])),
  getEventCategories: vi.fn((): Observable<unknown[]> => of([])),
  getEntries: vi.fn((): Observable<unknown[]> => of([])),
  getAllL10nEntries: vi.fn((): Observable<unknown[]> => of([])),
};

const manifest = signal<{ extensions?: unknown }>({});

describe('DocumentDetailComponent — rendered Layer 1 slots', () => {
  let fixture: ComponentFixture<DocumentDetailComponent>;

  // jsdom has neither, and the viewer path creates a blob URL for every document.
  (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:mock/1');
  (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();

  async function render(extensions: unknown): Promise<void> {
    manifest.set({ extensions });
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      // `TranslateModule` is bootstrapped by the app, not the feature: the
      // adf-hx components inside the detail template inject `TranslateService`.
      imports: [DocumentDetailComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ uid: 'doc-1' })),
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: BrowseService, useValue: { updateDocument: vi.fn(() => of(doc())) } },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: KeClientService, useValue: { enrich: emptyKe } },
        { provide: TaskService, useValue: { getDocumentTasks: vi.fn(() => of([])) } },
        {
          provide: WorkflowService,
          useValue: { getDocumentWorkflows: vi.fn(() => of([])) },
        },
        {
          provide: ARenderService,
          useValue: { isAvailable: vi.fn(() => of(false)), getPreviewerUrl: vi.fn(() => of(null)) },
        },
        { provide: TagService, useValue: { searchTags: vi.fn(() => of([])) } },
        {
          provide: AiGatewayService,
          useValue: { summarize: vi.fn(() => of(null)), classify: vi.fn(() => of(null)) },
        },
        { provide: AiChatService, useValue: { openPanel: vi.fn() } },
        { provide: AiFeatureFlagService, useValue: { aiEnabled: signal(false) } },
        { provide: NuxeoApiBase, useValue: { nxqlSearch: vi.fn(() => of({ entries: [] })) } },
        { provide: CURRENT_USERNAME, useValue: () => 'tester' },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: MatDialog,
          useValue: { open: vi.fn(() => ({ afterClosed: () => of(undefined) })) },
        },
        { provide: AppConfigService, useValue: { manifest } },
        provideSatoriExtensions({
          slots: {
            [EXTENSION_SLOTS.toolbar]: PACKAGED_DOCUMENT_TOOLBAR_ACTIONS,
            [EXTENSION_SLOTS.tabs]: PACKAGED_DOCUMENT_TABS,
          },
          components: { 'acme.tabs.claims': ClaimsPanelComponent },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => fixture?.destroy());

  function actionIds(): string[] {
    return [...fixture.nativeElement.querySelectorAll('[data-action-id]')].map((el) =>
      (el as HTMLElement).getAttribute('data-action-id'),
    ) as string[];
  }

  function tabLabels(): string[] {
    return [...fixture.nativeElement.querySelectorAll('.mat-mdc-tab .mdc-tab__text-label')].map(
      (el) => (el as HTMLElement).textContent?.trim() ?? '',
    );
  }

  describe('toolbar', () => {
    /**
     * The claim: an action that exists **only** in the manifest is a real button
     * in the document-detail header.
     *
     * Seen red on purpose by reverting the header back to its fixed markup —
     * `@for (action of toolbarActions())` replaced by the four hardcoded
     * `<button mat-icon-button>` elements. The assertion failed with
     * `expected [ 'app.toolbar.edit', … ] to contain 'acme.toolbar.archive'`,
     * and with the ids gone entirely it failed on an empty array. That is the
     * state `toolbar` was in before this change: the registry accepted the
     * entry, and nothing on the page read it.
     */
    it('renders an action contributed only by the manifest', async () => {
      await render({
        slots: {
          toolbar: [
            { id: 'acme.toolbar.archive', label: 'Archive', icon: 'inventory_2', order: 5 },
          ],
        },
      });

      expect(actionIds()).toContain('acme.toolbar.archive');
      const button = fixture.nativeElement.querySelector(
        '[data-action-id="acme.toolbar.archive"]',
      ) as HTMLElement;
      expect(button.getAttribute('aria-label')).toBe('Archive');
      expect(button.textContent).toContain('inventory_2');
    });

    /** The shipped default is unchanged: the packaged ids are the ones that render. */
    it('renders the packaged actions when the manifest contributes nothing', async () => {
      await render({});

      expect(actionIds()).toContain('app.toolbar.edit');
      expect(actionIds()).toContain('app.toolbar.delete');
      // The write half is inline; Share lives behind the overflow menu, whose
      // content Material only creates when the menu opens.
      expect(actionIds()).not.toContain('app.toolbar.share');
    });

    /**
     * The negative half, and the one that makes the positive assertion mean
     * something: if the header still held fixed markup, `visible: false` would
     * change nothing and the packaged button would still be there.
     */
    it('removes a packaged action when the manifest hides it', async () => {
      await render({ overrides: { 'app.toolbar.edit': { visible: false } } });

      expect(actionIds()).not.toContain('app.toolbar.edit');
      expect(actionIds()).toContain('app.toolbar.delete');
    });

    /** `order` decides the rendered sequence, not the order of the packaged array. */
    it('honours a manifest order against the packaged entries', async () => {
      await render({ overrides: { 'app.toolbar.delete': { order: 1 } } });

      const inline = actionIds();
      expect(inline.indexOf('app.toolbar.delete')).toBeLessThan(inline.indexOf('app.toolbar.edit'));
    });
  });

  describe('tabs', () => {
    /**
     * The claim: a tab that exists only in the manifest is in the tab strip, and
     * selecting it renders the registered component through
     * `ExtensionOutletComponent`.
     *
     * Seen red on purpose by restoring the five fixed `<mat-tab>` children in
     * place of `@for (tab of detailTabs())`: the label assertion failed with
     * `expected [ 'View', 'Annotations', 'Permissions', 'History', 'Publishing' ]
     * to contain 'Claims'`.
     */
    it('renders a tab contributed only by the manifest and its registered component', async () => {
      await render({
        slots: {
          tabs: [
            { id: 'acme.tabs.claims', label: 'Claims', order: 15, componentId: 'acme.tabs.claims' },
          ],
        },
      });

      expect(tabLabels()).toContain('Claims');

      const claimsTab = [...fixture.nativeElement.querySelectorAll('.mat-mdc-tab')].find((el) =>
        (el as HTMLElement).textContent?.includes('Claims'),
      ) as HTMLElement;
      claimsTab.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(CONTRIBUTED_TAB_MARKER);
    });

    it('renders the packaged tabs when the manifest contributes nothing', async () => {
      await render({});

      expect(tabLabels()).toEqual(['View', 'Annotations', 'Permissions', 'History', 'Publishing']);
    });

    /** Hiding and reordering a packaged tab — the half fixed markup cannot do. */
    it('hides and reorders packaged tabs from the manifest', async () => {
      await render({
        overrides: {
          'app.tabs.history': { visible: false },
          'app.tabs.publishing': { order: 5, label: 'Where published' },
        },
      });

      expect(tabLabels()).toEqual(['Where published', 'View', 'Annotations', 'Permissions']);
    });
  });
});
