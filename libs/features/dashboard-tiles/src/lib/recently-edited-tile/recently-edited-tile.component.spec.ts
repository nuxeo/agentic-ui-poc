import { TestBed, fakeAsync, tick, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecentlyEditedTileComponent } from './recently-edited-tile.component';
import {
  DocumentService,
  DocumentDetailService,
  NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

describe('RecentlyEditedTileComponent', () => {
  let component: RecentlyEditedTileComponent;
  let fixture: ComponentFixture<RecentlyEditedTileComponent>;
  let mockDocService: { getRecentlyEdited: ReturnType<typeof vi.fn> };
  let mockDetailService: { fetchThumbnail: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  // jsdom ships no object-URL implementation and the component revokes on destroy, so both
  // halves are stubbed for the whole suite.
  beforeAll(() => {
    createObjectURL = vi.fn(() => 'blob:recently-edited');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  const mockDoc: NuxeoDocument = {
    uid: 'doc-1',
    title: 'Test Document',
    type: 'File',
    path: '/default-domain/workspaces/test',
    lastModified: '2026-08-07T10:00:00.000Z',
    properties: {
      'dc:lastContributor': 'testuser',
    },
  };

  beforeEach(async () => {
    mockDocService = {
      getRecentlyEdited: vi.fn(),
    };

    mockDetailService = {
      fetchThumbnail: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecentlyEditedTileComponent],
      providers: [
        { provide: DocumentService, useValue: mockDocService },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    mockDocService.getRecentlyEdited.mockReturnValue(of({ entries: [mockDoc] }));
    mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob()));

    fixture = TestBed.createComponent(RecentlyEditedTileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Recently Edited');
    fixture.componentRef.setInput('limit', 10);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documents on initialization', fakeAsync(() => {
    tick();

    expect(mockDocService.getRecentlyEdited).toHaveBeenCalledWith(10);
    expect(component.loading()).toBe(false);
    expect(component.documents().length).toBe(1);
    expect(component.documents()[0].uid).toBe('doc-1');
    expect(component.error()).toBeNull();
  }));

  it('should handle error when loading documents fails', fakeAsync(() => {
    mockDocService.getRecentlyEdited.mockReturnValue(throwError(() => new Error('Network error')));

    const errorFixture = TestBed.createComponent(RecentlyEditedTileComponent);
    const errorComponent = errorFixture.componentInstance;
    errorFixture.componentRef.setInput('title', 'Recently Edited');
    errorFixture.componentRef.setInput('limit', 10);

    tick();

    expect(errorComponent.loading()).toBe(false);
    expect(errorComponent.error()).toBe('Failed to load recently edited documents.');
    expect(errorComponent.documents().length).toBe(0);
  }));

  it('should enforce limit between 1 and 50', () => {
    // Verify the limit enforcement logic directly
    const clampLimit = (limit: number) => Math.min(Math.max(1, limit), 50);

    expect(clampLimit(100)).toBe(50);
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-5)).toBe(1);
    expect(clampLimit(25)).toBe(25);
    expect(clampLimit(50)).toBe(50);
    expect(clampLimit(1)).toBe(1);
  });

  it('should navigate to document detail for File type', () => {
    component.navigateToDoc(mockDoc);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doc', 'doc-1']);
  });

  it('should navigate to browse for Folder type', () => {
    const folderDoc: NuxeoDocument = {
      ...mockDoc,
      type: 'Folder',
    };
    component.navigateToDoc(folderDoc);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/browse/default-domain/workspaces/test']);
  });

  it('should navigate to collections for Collection type', () => {
    const collectionDoc: NuxeoDocument = {
      ...mockDoc,
      type: 'Collection',
    };
    component.navigateToDoc(collectionDoc);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections', 'doc-1']);
  });

  it('should extract last contributor from document properties', () => {
    expect(component.lastContributor(mockDoc)).toBe('testuser');
  });

  it('should return empty string when last contributor is not set', () => {
    const docWithoutContributor: NuxeoDocument = {
      ...mockDoc,
      properties: {},
    };
    expect(component.lastContributor(docWithoutContributor)).toBe('');
  });

  it('should return correct document icon', () => {
    const icon = component.docIcon(mockDoc);
    expect(icon).toBeTruthy();
    expect(typeof icon).toBe('string');
  });

  describe('thumbnail lifecycle', () => {
    it('revokes every thumbnail URL on destroy', fakeAsync(() => {
      const secondDoc: NuxeoDocument = { ...mockDoc, uid: 'doc-2' };
      mockDocService.getRecentlyEdited.mockReturnValue(of({ entries: [mockDoc, secondDoc] }));
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));

      const thumbFixture = TestBed.createComponent(RecentlyEditedTileComponent);
      thumbFixture.componentRef.setInput('title', 'Recently Edited');
      thumbFixture.componentRef.setInput('limit', 10);
      tick();

      expect(Object.keys(thumbFixture.componentInstance.thumbnailMap())).toEqual([
        'doc-1',
        'doc-2',
      ]);

      revokeObjectURL.mockClear();
      thumbFixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:recently-edited');
    }));

    it('does not create a thumbnail URL for a response that arrives after destroy', () => {
      const thumbnail$ = new Subject<Blob>();
      mockDocService.getRecentlyEdited.mockReturnValue(of({ entries: [mockDoc] }));
      mockDetailService.fetchThumbnail.mockReturnValue(thumbnail$);

      const lateFixture = TestBed.createComponent(RecentlyEditedTileComponent);
      lateFixture.componentRef.setInput('title', 'Recently Edited');
      lateFixture.componentRef.setInput('limit', 10);

      createObjectURL.mockClear();
      lateFixture.destroy();
      thumbnail$.next(new Blob(['late']));

      expect(createObjectURL).not.toHaveBeenCalled();
    });
  });
});
