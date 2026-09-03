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
  contextParameters: { permissions: ['Read'] },
};

/** The History tab only loads for a collection the user may read. */
const READABLE_COLLECTION: NuxeoDocument = {
  ...SHARED_COLLECTION,
  contextParameters: { permissions: ['Read'] },
};

/** A member whose type is eligible for a thumbnail request. */
const MEMBER_FILE: NuxeoDocument = {
  uid: 'member-1',
  title: 'Report.pdf',
  type: 'File',
  path: '/default-domain/UserWorkspaces/alice/report.pdf',
  lastModified: '2026-01-01T00:00:00Z',
  properties: {},
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

  it('clears the previous collection while the next one loads', async () => {
    // collection-2 never replies, so the component stays in its loading state.
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      uid === 'collection-1' ? of(SHARED_COLLECTION) : EMPTY,
    );
    mockCollectionService.getCollectionMembers.mockImplementation((uid: string) =>
      uid === 'collection-1' ? of({ entries: [OTHER_COLLECTION], totalSize: 1 }) : EMPTY,
    );

    fixture = await createComponent('alice');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.collection()?.uid).toBe('collection-1');
    component.isLocked.set(true);

    paramMap$.next(convertToParamMap({ uid: 'collection-2' }));
    fixture.detectChanges();

    // Header actions stay enabled while loading, so acting on collection-1's document or
    // lock state here would send that state to collection-2.
    expect(component.collection()).toBeNull();
    expect(component.members()).toEqual([]);
    expect(component.totalSize()).toBe(0);
    expect(component.isLocked()).toBe(false);
    expect(component.loading()).toBe(true);
  });

  it('discards a history reply that arrives after the route moved on', async () => {
    const pendingAudit = new Subject<{ entries: unknown[]; totalSize: number }>();
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      of(uid === 'collection-1' ? READABLE_COLLECTION : OTHER_COLLECTION),
    );
    // Switching to collection-2 reloads History straight away because the tab is already
    // open, so only collection-1's request may be left hanging.
    mockDocumentDetailService.getAuditLog.mockImplementation((uid: string) =>
      uid === 'collection-1' ? pendingAudit.asObservable() : EMPTY,
    );

    fixture = await createComponent('alice');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.onTabChange(2);
    fixture.detectChanges();

    paramMap$.next(convertToParamMap({ uid: 'collection-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    pendingAudit.next({
      entries: [{ id: 1, eventId: 'documentModified', eventDate: '2026-01-01T00:00:00Z' }],
      totalSize: 1,
    });
    fixture.detectChanges();

    expect(component.auditEntries()).toEqual([]);

    // History was never marked loaded for collection-2, so opening the tab refetches
    // rather than showing collection-1's audit entries.
    mockDocumentDetailService.getAuditLog.mockClear();
    component.onTabChange(2);
    expect(mockDocumentDetailService.getAuditLog).toHaveBeenCalledWith(
      'collection-2',
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('keeps a metadata denial when the members request later succeeds', async () => {
    const pendingMetadata = new Subject<NuxeoDocument>();
    const pendingMembers = new Subject<{ entries: NuxeoDocument[]; totalSize: number }>();
    mockDocumentDetailService.getFullDocument.mockReturnValue(pendingMetadata.asObservable());
    mockCollectionService.getById.mockReturnValue(forbidden());
    mockCollectionService.getCollectionMembers.mockReturnValue(pendingMembers.asObservable());

    fixture = await createComponent('transient/guest@example.com', {
      uid: 'shared-1',
      title: 'Quarterly Report',
    });
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.externalShareAccessDenied()).toBe(false);

    // The denial lands while the members request is already in flight.
    pendingMetadata.error({ status: 403 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.externalShareAccessDenied()).toBe(true);

    pendingMembers.next({ entries: [], totalSize: 0 });
    fixture.detectChanges();
    await fixture.whenStable();

    // Taking over here would leave the share message rendered as a generic retry error,
    // making the outcome depend on which request answered first.
    expect(component.externalShareAccessDenied()).toBe(true);
    expect(component.error()).toContain('Quarterly Report');
  });

  it('clears the History spinner when the route changes with an audit request pending', async () => {
    const pendingAudit = new Subject<{ entries: unknown[]; totalSize: number }>();
    // collection-2's metadata never arrives, so nothing starts a replacement request.
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      uid === 'collection-1' ? of(READABLE_COLLECTION) : EMPTY,
    );
    mockDocumentDetailService.getAuditLog.mockReturnValue(pendingAudit.asObservable());

    fixture = await createComponent('alice');
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.onTabChange(2);
    fixture.detectChanges();
    expect(component.auditLoading()).toBe(true);

    paramMap$.next(convertToParamMap({ uid: 'collection-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.auditLoading()).toBe(false);
  });

  it('ignores a thumbnail that arrives after the route moved on', async () => {
    const pendingThumbnail = new Subject<Blob>();
    mockDocumentDetailService.getFullDocument.mockImplementation((uid: string) =>
      of(uid === 'collection-1' ? READABLE_COLLECTION : OTHER_COLLECTION),
    );
    mockCollectionService.getCollectionMembers.mockImplementation((uid: string) =>
      uid === 'collection-1'
        ? of({ entries: [MEMBER_FILE], totalSize: 1 })
        : of({ entries: [], totalSize: 0 }),
    );
    mockDocumentDetailService.fetchThumbnail.mockReturnValue(pendingThumbnail.asObservable());

    fixture = await createComponent('alice');
    const component = fixture.componentInstance;
    fixture.detectChanges();

    paramMap$.next(convertToParamMap({ uid: 'collection-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    pendingThumbnail.next(new Blob(['thumb']));
    fixture.detectChanges();

    // Creating the URL now would show collection-1's thumbnail and leak a blob past the
    // revocation that already ran.
    expect(component.thumbnailMap()).toEqual({});
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
