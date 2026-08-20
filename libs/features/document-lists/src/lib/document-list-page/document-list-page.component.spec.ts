import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  CURRENT_USERNAME,
  CollectionService,
  DocumentDetailService,
  DocumentService,
  SelectionService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { DocumentListPageComponent, type DocumentListKind } from './document-list-page.component';

function doc(uid: string, overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid,
    title: `Doc ${uid}`,
    type: 'File',
    path: `/default-domain/workspaces/${uid}`,
    lastModified: '2026-03-04T09:00:00.000Z',
    properties: { 'dc:lastContributor': 'alice' },
    ...overrides,
  };
}

function list(entries: NuxeoDocument[]) {
  return {
    entries,
    totalSize: entries.length,
    currentPageSize: entries.length,
    currentPageIndex: 0,
    numberOfPages: 1,
  };
}

const mockDocumentService = {
  getRecentlyViewed: vi.fn(() => EMPTY),
  getExpiredDocuments: vi.fn(() => EMPTY),
  getById: vi.fn((uid: string) => of(doc(uid))),
};
const mockCollectionService = { getFavorites: vi.fn(() => EMPTY) };
/** Stands in for the real selection, so `isSelected` can be driven from a test. */
const selected = new Set<string>();
const selectionService = {
  toggle: vi.fn(),
  isSelected: vi.fn((uid: string) => selected.has(uid)),
};
const mockDetailService = {
  fetchThumbnail: vi.fn(() => EMPTY),
  removeFromFavorites: vi.fn(() => EMPTY),
};

describe('DocumentListPageComponent', () => {
  let component: DocumentListPageComponent;
  let fixture: ComponentFixture<DocumentListPageComponent>;
  let navigate: ReturnType<typeof vi.fn>;
  let username: string | null;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  // jsdom ships no object-URL implementation and the component revokes on destroy, so both
  // halves are stubbed for the whole suite.
  beforeAll(() => {
    createObjectURL = vi.fn(() => 'blob:list');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  async function createComponent(kind: DocumentListKind, inputs: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({
      imports: [DocumentListPageComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: CollectionService, useValue: mockCollectionService },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: SelectionService, useValue: selectionService },
        { provide: CURRENT_USERNAME, useValue: () => username },
      ],
    })
      // Shallow-render: the Material imports bring zone-tracked handles that hang the
      // runner, and the assertions are all on component state.
      .overrideComponent(DocumentListPageComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    navigate = vi.fn().mockResolvedValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(navigate);

    fixture = TestBed.createComponent(DocumentListPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('kind', kind);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    selected.clear();
    selectionService.isSelected.mockImplementation((uid: string) => selected.has(uid));
    username = 'satori-admin';
    mockDocumentService.getRecentlyViewed.mockReturnValue(of(list([])));
    mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([])));
    mockCollectionService.getFavorites.mockReturnValue(of(list([])));
    mockDetailService.fetchThumbnail.mockReturnValue(EMPTY);
    mockDetailService.removeFromFavorites.mockReturnValue(EMPTY);
    mockDocumentService.getById.mockImplementation((uid: string) => of(doc(uid)));
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('recently viewed', () => {
    it('loads the signed-in user’s documents and maps them to rows', async () => {
      mockDocumentService.getRecentlyViewed.mockReturnValue(of(list([doc('a')])));

      await createComponent('recently-viewed');

      expect(mockDocumentService.getRecentlyViewed).toHaveBeenCalledWith('satori-admin', 50);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect(component.rows()).toEqual([
        {
          uid: 'a',
          title: 'Doc a',
          type: 'File',
          icon: expect.any(String),
          path: '/default-domain/workspaces/a',
          lastContributor: 'alice',
          date: '2026-03-04',
        },
      ]);
      expect(component.definition().title).toBe('Recently viewed');
      expect(component.definition().removable).toBe(false);
    });

    it('asks the user to sign in again when there is no username', async () => {
      username = null;

      await createComponent('recently-viewed');

      expect(mockDocumentService.getRecentlyViewed).not.toHaveBeenCalled();
      expect(component.error()).toBe('Sign in again to see this list.');
      expect(component.loading()).toBe(false);
    });

    it('reports a failure without leaving the page spinning', async () => {
      mockDocumentService.getRecentlyViewed.mockReturnValue(throwError(() => new Error('500')));

      await createComponent('recently-viewed');

      expect(component.error()).toBe('Failed to load recently viewed.');
      expect(component.loading()).toBe(false);
      expect(component.rows()).toEqual([]);
    });
  });

  describe('expired queue', () => {
    it('loads without a username and dates rows from dc:expired', async () => {
      username = null;
      mockDocumentService.getExpiredDocuments.mockReturnValue(
        of(list([doc('a', { properties: { 'dc:expired': '2025-12-31T00:00:00.000Z' } })])),
      );

      await createComponent('expired-queue');

      expect(mockDocumentService.getExpiredDocuments).toHaveBeenCalledWith(50);
      expect(component.rows()[0].date).toBe('2025-12-31');
      expect(component.rows()[0].lastContributor).toBe('');
      expect(component.definition().dateLabel).toBe('Expired');
    });

    it('leaves the date blank when dc:expired is missing', async () => {
      mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([doc('a')])));

      await createComponent('expired-queue');

      expect(component.rows()[0].date).toBe('');
    });

    it('reports a failure with the list name', async () => {
      mockDocumentService.getExpiredDocuments.mockReturnValue(throwError(() => new Error('500')));

      await createComponent('expired-queue');

      expect(component.error()).toBe('Failed to load expired queue.');
    });
  });

  /**
   * The list shown a set of uids by whoever mounts it, which is what the AI chat
   * panel renders after a search. Everything here is a property of that being
   * read-only and of the rows coming from Nuxeo rather than from the caller.
   */
  describe('by id', () => {
    it('reads each uid under the caller’s own session and keeps their order', async () => {
      await createComponent('by-id', { docIds: ['b', 'a'] });

      expect(mockDocumentService.getById.mock.calls).toEqual([['b'], ['a']]);
      expect(component.rows().map((row) => row.uid)).toEqual(['b', 'a']);
      expect(component.loading()).toBe(false);
    });

    // ACLs are Nuxeo's to enforce, one read at a time. A uid the caller cannot
    // see fails its own request and drops out; the rest of the list still shows.
    it('drops a document the caller may not read rather than failing the list', async () => {
      mockDocumentService.getById.mockImplementation((uid: string) =>
        uid === 'secret' ? throwError(() => new Error('403')) : of(doc(uid)),
      );

      await createComponent('by-id', { docIds: ['a', 'secret', 'b'] });

      expect(component.rows().map((row) => row.uid)).toEqual(['a', 'b']);
      expect(component.error()).toBeNull();
    });

    it('says the documents could not be read when every one of them failed', async () => {
      mockDocumentService.getById.mockImplementation(() => throwError(() => new Error('404')));

      await createComponent('by-id', { docIds: ['a', 'b'] });

      expect(component.rows()).toEqual([]);
      expect(component.isEmpty()).toBe(true);
      expect(component.definition().emptyMessage).toBe('None of these documents could be read.');
    });

    it('reads nothing at all when given no uids', async () => {
      await createComponent('by-id', { docIds: [] });

      expect(mockDocumentService.getById).not.toHaveBeenCalled();
      expect(component.isEmpty()).toBe(true);
    });

    it('offers no remove action, so a list mounted from a tool call cannot write', async () => {
      await createComponent('by-id', { docIds: ['a'] });

      expect(component.definition().removable).toBe(false);
    });

    it('re-reads when the host shows it a different set of uids', async () => {
      await createComponent('by-id', { docIds: ['a'] });
      fixture.componentRef.setInput('docIds', ['b', 'c']);
      fixture.detectChanges();

      expect(component.rows().map((row) => row.uid)).toEqual(['b', 'c']);
    });

    it('needs no signed-in user, unlike the list pages', async () => {
      username = null;

      await createComponent('by-id', { docIds: ['a'] });

      expect(component.error()).toBeNull();
      expect(component.rows().map((row) => row.uid)).toEqual(['a']);
    });

    it('caps the reads at a page, whatever it is handed', async () => {
      const docIds = Array.from({ length: 80 }, (_, i) => `uid-${i}`);

      await createComponent('by-id', { docIds });

      expect(mockDocumentService.getById).toHaveBeenCalledTimes(50);
    });

    // The 400px column, which is the host's decision and changes only which
    // columns are drawn — never which documents are read.
    it('drops columns when compact without changing the request', async () => {
      await createComponent('by-id', { docIds: ['a'], density: 'compact' });

      expect(component.isCompact()).toBe(true);
      expect(mockDocumentService.getById.mock.calls).toEqual([['a']]);
    });

    it('is comfortable unless a host says otherwise', async () => {
      await createComponent('by-id', { docIds: ['a'] });

      expect(component.isCompact()).toBe(false);
    });
  });

  describe('favorites', () => {
    it('loads the collection members for the signed-in user', async () => {
      mockCollectionService.getFavorites.mockReturnValue(of(list([doc('a')])));

      await createComponent('favorites');

      expect(mockCollectionService.getFavorites).toHaveBeenCalledWith('satori-admin', 50);
      expect(component.definition().removable).toBe(true);
      expect(component.rows().length).toBe(1);
    });

    it('drops a row and notifies the shell when un-favorited', async () => {
      mockCollectionService.getFavorites.mockReturnValue(of(list([doc('a'), doc('b')])));
      mockDetailService.removeFromFavorites.mockReturnValue(of(doc('a')));
      const dispatch = vi.spyOn(window, 'dispatchEvent');

      await createComponent('favorites');
      component.removeFromFavorites(component.rows()[0]);

      expect(mockDetailService.removeFromFavorites).toHaveBeenCalledWith('a');
      expect(component.rows().map((r) => r.uid)).toEqual(['b']);
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'favorites-changed' }));

      dispatch.mockRestore();
    });

    it('keeps the row and surfaces an error when un-favoriting fails', async () => {
      mockCollectionService.getFavorites.mockReturnValue(of(list([doc('a')])));
      mockDetailService.removeFromFavorites.mockReturnValue(throwError(() => new Error('403')));

      await createComponent('favorites');
      component.removeFromFavorites(component.rows()[0]);

      expect(component.rows().map((r) => r.uid)).toEqual(['a']);
      expect(component.error()).toBe('Failed to remove from favorites.');
    });

    it('asks the user to sign in again when there is no username', async () => {
      username = null;

      await createComponent('favorites');

      expect(mockCollectionService.getFavorites).not.toHaveBeenCalled();
      expect(component.error()).toBe('Sign in again to see this list.');
    });
  });

  describe('shared behaviour', () => {
    it('reports the empty state only once loading has finished', async () => {
      await createComponent('expired-queue');

      expect(component.rows()).toEqual([]);
      expect(component.isEmpty()).toBe(true);
      expect(component.definition().emptyMessage).toContain('expiry date');
    });

    it('does not report empty while an error is showing', async () => {
      mockDocumentService.getExpiredDocuments.mockReturnValue(throwError(() => new Error('500')));

      await createComponent('expired-queue');

      expect(component.isEmpty()).toBe(false);
    });

    it('tolerates a response with no entries array', async () => {
      mockDocumentService.getExpiredDocuments.mockReturnValue(
        of({ entries: undefined } as unknown as ReturnType<typeof list>),
      );

      await createComponent('expired-queue');

      expect(component.rows()).toEqual([]);
    });

    it('refetches on reload', async () => {
      await createComponent('expired-queue');

      component.reload();

      expect(mockDocumentService.getExpiredDocuments).toHaveBeenCalledTimes(2);
    });

    it('reloads when the route kind changes', async () => {
      await createComponent('expired-queue');

      fixture.componentRef.setInput('kind', 'favorites');
      fixture.detectChanges();

      expect(mockCollectionService.getFavorites).toHaveBeenCalledTimes(1);
      expect(component.definition().title).toBe('Favorites');
    });

    it('opens the document detail page for a row', async () => {
      mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([doc('a')])));

      await createComponent('expired-queue');
      component.openDocument(component.rows()[0]);

      expect(navigate).toHaveBeenCalledWith(['/doc', 'a']);
    });

    it('exposes a sanitized thumbnail per row', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([doc('a')])));

      await createComponent('expired-queue');

      expect(mockDetailService.fetchThumbnail).toHaveBeenCalledWith('a');
      expect(component.thumbnailFor('a')).toBeTruthy();
    });

    it('ignores a thumbnail that fails to load', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(throwError(() => new Error('404')));
      mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([doc('a')])));

      await createComponent('expired-queue');

      expect(component.thumbnailFor('a')).toBeNull();
    });

    it('revokes every thumbnail URL on destroy', async () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      mockDocumentService.getExpiredDocuments.mockReturnValue(of(list([doc('a'), doc('b')])));

      await createComponent('expired-queue');
      revokeObjectURL.mockClear();
      fixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * A7 stage 2. The list is where a suggestion becomes a decision, so the two
   * have to stay distinguishable right up to the click that converts one.
   */
  describe('selection', () => {
    it('shows no checkboxes and touches nothing on the three routed pages', async () => {
      mockDocumentService.getRecentlyViewed.mockReturnValue(of(list([doc('a')])));

      await createComponent('recently-viewed');

      expect(component.selectable()).toBe(false);
      expect(component.proposedCount()).toBe(0);
    });

    it('ticks through the application selection service, like every other list', async () => {
      await createComponent('by-id', { docIds: ['a'], selectable: true });

      component.toggleSelected(component.rows()[0]);

      expect(selectionService.toggle).toHaveBeenCalledWith('a', 'Doc a', null, 'File');
    });

    it('renders a proposal as a suggestion rather than as a tick', async () => {
      await createComponent('by-id', { docIds: ['a', 'b'], selectable: true, proposedIds: ['a'] });

      expect(component.isProposed('a')).toBe(true);
      expect(component.isSelected('a')).toBe(false);
      expect(component.proposedCount()).toBe(1);
    });

    it('stops calling a row proposed once the user has actually selected it', async () => {
      selected.add('a');
      await createComponent('by-id', { docIds: ['a'], selectable: true, proposedIds: ['a'] });

      expect(component.isSelected('a')).toBe(true);
      expect(component.isProposed('a')).toBe(false);
    });

    /**
     * Caught on screen, not by a test: the hint kept saying two rows were
     * suggested after one of them had been ticked, because the count and the
     * per-row check disagreed about what taking a suggestion means. The number
     * in the hint has to be the number of rows that still *look* suggested, or
     * it describes rows the user cannot find.
     */
    it('counts only the suggestions still outstanding', async () => {
      selected.add('a');
      await createComponent('by-id', {
        docIds: ['a', 'b'],
        selectable: true,
        proposedIds: ['a', 'b'],
      });

      expect(component.proposedCount()).toBe(1);
    });

    /**
     * The uid the model wanted is not among the rows Nuxeo returned — because
     * the caller cannot read it, or it does not exist. Counting it would put a
     * number on screen the user cannot reconcile with the ticks in front of
     * them, which is the beginning of confirming something unseen.
     */
    it('ignores a proposal for a document that is not in the list', async () => {
      mockDocumentService.getById.mockImplementation((uid: string) =>
        uid === 'gone' ? throwError(() => new Error('403')) : of(doc(uid)),
      );

      await createComponent('by-id', {
        docIds: ['a', 'gone'],
        selectable: true,
        proposedIds: ['gone'],
      });

      expect(component.rows().map((row) => row.uid)).toEqual(['a']);
      expect(component.proposedCount()).toBe(0);
      expect(component.isProposed('gone')).toBe(false);
    });

    it('says in the accessible name whether a row was suggested', async () => {
      await createComponent('by-id', { docIds: ['a', 'b'], selectable: true, proposedIds: ['a'] });
      const [suggested, plain] = component.rows();

      expect(component.selectLabelFor(suggested)).toContain('suggested by the assistant');
      expect(component.selectLabelFor(plain)).toBe('Select Doc b');
    });
  });
});
