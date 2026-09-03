import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { BehaviorSubject, EMPTY, Subject, of, throwError } from 'rxjs';
import {
  ADMIN_ACCESS_CHECKS,
  BrowseContextService,
  CollectionService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  NuxeoDocument,
  SharedDocumentRef,
} from '@agentic-ui/shared/nuxeo-client';
import { CollectionDetailComponent } from './collection-detail';

const SHARED_COLLECTION: NuxeoDocument = {
  uid: 'collection-1',
  title: 'Quarterly Reports',
  type: 'Collection',
  path: '/default-domain/UserWorkspaces/alice/quarterly-reports',
  lastModified: '2026-01-01T00:00:00Z',
  properties: {},
};

const OTHER_COLLECTION: NuxeoDocument = {
  ...SHARED_COLLECTION,
  uid: 'collection-2',
  title: 'Annual Reports',
  path: '/default-domain/UserWorkspaces/alice/annual-reports',
};

const mockCollectionService = {
  getById: vi.fn(() => EMPTY),
  getCollectionMembers: vi.fn(() => of({ entries: [], totalSize: 0 })),
};

const mockDocumentDetailService = {
  getFullDocument: vi.fn(() => EMPTY),
  fetchThumbnail: vi.fn(() => EMPTY),
  getAuditLog: vi.fn(() => of({ entries: [], totalSize: 0 })),
};

const mockDirectoryService = {
  getEventTypes: vi.fn(() => of([])),
  getEventCategories: vi.fn(() => of([])),
};

const forbidden = () => throwError(() => ({ status: 403 }));

/** Denies every request the collection page makes for its own document and members. */
function denyCollectionAccess(): void {
  mockDocumentDetailService.getFullDocument.mockReturnValue(forbidden());
  mockCollectionService.getById.mockReturnValue(forbidden());
  mockCollectionService.getCollectionMembers.mockReturnValue(forbidden());
}

let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

async function createComponent(
  username: string,
  sharedDocument?: SharedDocumentRef,
): Promise<ComponentFixture<CollectionDetailComponent>> {
  await TestBed.configureTestingModule({
    imports: [CollectionDetailComponent],
    providers: [
      provideExperimentalZonelessChangeDetection(),
      provideRouter([], withDisabledInitialNavigation()),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: paramMap$.asObservable(),
          queryParamMap: of(convertToParamMap({})),
          snapshot: { queryParamMap: convertToParamMap({}) },
        },
      },
      { provide: CollectionService, useValue: mockCollectionService },
      { provide: DocumentDetailService, useValue: mockDocumentDetailService },
      { provide: DirectoryService, useValue: mockDirectoryService },
      { provide: CURRENT_USERNAME, useValue: () => username },
      {
        provide: ADMIN_ACCESS_CHECKS,
        useValue: {
          isAdministrator: () => false,
          isPowerUser: () => false,
          hasAdministrationAccess: () => false,
        },
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: MatDialog, useValue: { open: vi.fn(() => ({ afterClosed: () => of(false) })) } },
    ],
  })
    .overrideComponent(CollectionDetailComponent, {
      set: { imports: [], template: '<div></div>' },
    })
    .compileComponents();

  // The component loads on construction, so the recovery target must exist beforehand.
  if (sharedDocument) {
    TestBed.inject(BrowseContextService).setSharedDocument(sharedDocument);
  }
  return TestBed.createComponent(CollectionDetailComponent);
}

describe('CollectionDetailComponent transient external-share recovery (NXSAT-211)', () => {
  let fixture: ComponentFixture<CollectionDetailComponent>;

  beforeEach(async () => {
    // BrowseContextService restores sharedDocument from sessionStorage on construction.
    sessionStorage.clear();
    paramMap$ = new BehaviorSubject(convertToParamMap({ uid: 'collection-1' }));
    await TestBed.resetTestingModule();
    vi.clearAllMocks();
    mockCollectionService.getById.mockReturnValue(EMPTY);
    mockCollectionService.getCollectionMembers.mockReturnValue(of({ entries: [], totalSize: 0 }));
    mockDocumentDetailService.getFullDocument.mockReturnValue(EMPTY);
  });

  afterEach(() => {
    fixture?.destroy();
    sessionStorage.clear();
  });

  it('shows shared-document access message when a transient user cannot read the collection', async () => {
    denyCollectionAccess();
    fixture = await createComponent('transient/guest@example.com', {
      uid: 'shared-1',
      title: 'Quarterly Report',
    });
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.accessDenied()).toBe(true);
    expect(component.externalShareAccessDenied()).toBe(true);
    expect(component.externalShareAccessDeniedDetailText()).toContain('Quarterly Report');
    expect(component.error()).toContain('Quarterly Report');
    expect(component.error()).not.toBe('Failed to load collection contents.');
    expect(component.externalShareBackLabel()).toBe('Back to Quarterly Report');
    expect(component.canReturnToSharedDocument()).toBe(true);
  });

  it('keeps the generic error for non-transient users denied a collection', async () => {
    denyCollectionAccess();
    fixture = await createComponent('alice');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.externalShareAccessDenied()).toBe(false);
    expect(component.error()).toBe('Failed to load collection contents.');
  });

  it('registers a shared collection as the recovery target and hides repository breadcrumbs', async () => {
    mockDocumentDetailService.getFullDocument.mockReturnValue(of(SHARED_COLLECTION));
    fixture = await createComponent('transient/guest@example.com');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(TestBed.inject(BrowseContextService).sharedDocument()).toEqual({
      uid: 'collection-1',
      title: 'Quarterly Reports',
    });
    expect(component.showBreadcrumbs()).toBe(false);
    // The recovery target is this very collection, so Back would be a no-op.
    expect(component.canReturnToSharedDocument()).toBe(false);
  });

  it('ignores a collection response that arrives after the route moved on', async () => {
    const pending = new Subject<NuxeoDocument>();
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      uid === 'collection-1' ? pending.asObservable() : of(OTHER_COLLECTION),
    );

    fixture = await createComponent('transient/guest@example.com');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    paramMap$.next(convertToParamMap({ uid: 'collection-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    pending.next(SHARED_COLLECTION);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.collection()?.uid).toBe('collection-2');
    expect(TestBed.inject(BrowseContextService).sharedDocument()).toEqual({
      uid: 'collection-2',
      title: 'Annual Reports',
    });
  });

  it('keeps the denied state when a late metadata success follows a members denial', async () => {
    const pendingMetadata = new Subject<NuxeoDocument>();
    mockDocumentDetailService.getFullDocument.mockReturnValue(pendingMetadata.asObservable());
    mockCollectionService.getCollectionMembers.mockReturnValue(forbidden());

    fixture = await createComponent('transient/guest@example.com', {
      uid: 'shared-1',
      title: 'Quarterly Report',
    });
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.externalShareAccessDenied()).toBe(true);

    pendingMetadata.next(SHARED_COLLECTION);
    fixture.detectChanges();
    await fixture.whenStable();

    // Clearing the flag here would drop the recovery panel while keeping its message.
    expect(component.externalShareAccessDenied()).toBe(true);
    expect(component.error()).toContain('Quarterly Report');
  });
});
