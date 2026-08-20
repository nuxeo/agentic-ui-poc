import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  TrashFilterService,
  TrashService,
  type NuxeoDocument,
  type SavedSearch,
} from '@agentic-ui/shared/nuxeo-client';

import { TrashFiltersDrawerComponent } from './trash-filters-drawer.component';

function folder(path: string, title = path): NuxeoDocument {
  return {
    uid: path,
    title,
    type: 'Folder',
    path,
    lastModified: '',
    properties: {},
  };
}

function sized(uid: string, length: number, creator = 'alice'): NuxeoDocument {
  return {
    uid,
    title: uid,
    type: 'File',
    path: `/${uid}`,
    lastModified: '',
    properties: { 'file:content': { length }, 'dc:creator': creator },
  };
}

const mockTrashService = {
  searchTrash: vi.fn(() => of({ entries: [] as NuxeoDocument[] })),
  getSavedSearches: vi.fn(() => of([] as SavedSearch[])),
  getPathSuggestions: vi.fn(() => of({ entries: [] as NuxeoDocument[] })),
};

describe('TrashFiltersDrawerComponent', () => {
  let component: TrashFiltersDrawerComponent;
  let fixture: ComponentFixture<TrashFiltersDrawerComponent>;
  let filterService: TrashFilterService;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockTrashService.searchTrash.mockReturnValue(of({ entries: [] }));
    mockTrashService.getSavedSearches.mockReturnValue(of([]));
    mockTrashService.getPathSuggestions.mockReturnValue(of({ entries: [] }));

    await TestBed.configureTestingModule({
      imports: [TrashFiltersDrawerComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: TrashService, useValue: mockTrashService },
      ],
    })
      .overrideComponent(TrashFiltersDrawerComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TrashFiltersDrawerComponent);
    component = fixture.componentInstance;
    filterService = TestBed.inject(TrashFilterService);
    navigateByUrl = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true) as unknown as ReturnType<typeof vi.spyOn>;

    // Settle the constructor effect that mirrors service filters onto the local input
    // signals; if it is left pending it clobbers values a test sets directly.
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    fixture.destroy();
    TestBed.inject(TrashFilterService).reset();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  describe('aggregate counts', () => {
    it('buckets documents by file size across all five bands', () => {
      mockTrashService.searchTrash.mockReturnValue(
        of({
          entries: [
            sized('a', 1_000), // tiny
            sized('b', 200_000), // small
            sized('c', 2_000_000), // medium
            sized('d', 20_000_000), // large
            sized('e', 200_000_000), // huge
          ],
        }),
      );

      component.ngOnInit();

      const counts = Object.fromEntries(component.sizeOptions().map((o) => [o.key, o.count]));
      expect(counts).toEqual({ tiny: 1, small: 1, medium: 1, large: 1, huge: 1 });
    });

    it('treats a document with no blob as tiny', () => {
      mockTrashService.searchTrash.mockReturnValue(of({ entries: [folder('/x')] }));

      component.ngOnInit();

      expect(component.sizeOptions().find((o) => o.key === 'tiny')?.count).toBe(1);
    });

    it('ranks author counts most-frequent first and skips blank creators', () => {
      mockTrashService.searchTrash.mockReturnValue(
        of({
          entries: [
            sized('a', 1, 'bob'),
            sized('b', 1, 'alice'),
            sized('c', 1, 'alice'),
            sized('d', 1, ''),
          ],
        }),
      );

      component.ngOnInit();

      expect(component.authorOptions()).toEqual([
        { id: 'alice', label: 'alice', count: 2 },
        { id: 'bob', label: 'bob', count: 1 },
      ]);
    });

    it('survives a failing count query', () => {
      mockTrashService.searchTrash.mockReturnValue(throwError(() => new Error('boom')));

      component.ngOnInit();

      expect(component.authorOptions()).toEqual([]);
      expect(component.sizeOptions().every((o) => o.count === 0)).toBe(true);
    });
  });

  describe('filter updates', () => {
    it('onFullTextChange pushes the term into the shared filter state', () => {
      component.onFullTextChange('invoice');

      expect(component.fullText()).toBe('invoice');
      expect(filterService.filters().fullText).toBe('invoice');
    });

    it('onFullTextClear empties the term', () => {
      component.onFullTextChange('invoice');
      component.onFullTextClear();

      expect(filterService.filters().fullText).toBe('');
    });

    it('an empty path input is normalised to the root', () => {
      component.pathInput.set('');
      component.onFullTextChange('x');

      expect(filterService.filters().path).toBe('/');
    });

    it('toggleSize adds then removes a band and republishes the filters', () => {
      component.toggleSize('small');
      expect(component.isSizeSelected('small')).toBe(true);
      expect(filterService.filters().sizeRanges).toEqual(['small']);

      component.toggleSize('small');
      expect(component.isSizeSelected('small')).toBe(false);
      expect(filterService.filters().sizeRanges).toEqual([]);
    });

    it('toggleSizeExpanded flips the section', () => {
      expect(component.sizeExpanded()).toBe(true);
      component.toggleSizeExpanded();
      expect(component.sizeExpanded()).toBe(false);
    });

    it('resetFilters clears local state and the shared service', () => {
      component.onFullTextChange('invoice');
      component.toggleSize('huge');
      component.authorInput.set('alice');

      component.resetFilters();

      expect(component.fullText()).toBe('');
      expect(component.pathInput()).toBe('/');
      expect(component.authorInput()).toBe('');
      expect(component.selectedSizes().size).toBe(0);
      expect(filterService.filters()).toEqual({
        fullText: '',
        path: '/',
        author: '',
        sizeRanges: [],
      });
    });

    it('hasActiveFilters is false for the pristine state and true once a filter is set', () => {
      expect(component.hasActiveFilters()).toBe(false);
      component.onFullTextChange('x');
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('navigates to /trash when a filter changes while off-route', () => {
      vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/browse');

      component.onFullTextChange('x');

      expect(navigateByUrl).toHaveBeenCalledWith('/trash');
    });

    it('does not renavigate when already on a /trash URL', () => {
      vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/trash');
      navigateByUrl.mockClear();

      component.onFullTextChange('x');

      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('path suggestions', () => {
    it('fetches and opens suggestions for a non-empty input', () => {
      mockTrashService.getPathSuggestions.mockReturnValue(of({ entries: [folder('/a')] }));

      component.onPathInput('/a');

      expect(mockTrashService.getPathSuggestions).toHaveBeenCalledWith('/a');
      expect(component.pathSuggestions().length).toBe(1);
      expect(component.pathOpen()).toBe(true);
      expect(component.pathLoading()).toBe(false);
    });

    it('clears suggestions for an empty input without calling the API', () => {
      component.pathSuggestions.set([folder('/a')]);

      component.onPathInput('');

      expect(mockTrashService.getPathSuggestions).not.toHaveBeenCalled();
      expect(component.pathSuggestions()).toEqual([]);
    });

    it('recovers from a failing suggestion request', () => {
      mockTrashService.getPathSuggestions.mockReturnValue(throwError(() => new Error('boom')));

      component.onPathInput('/a');

      expect(component.pathSuggestions()).toEqual([]);
      expect(component.pathLoading()).toBe(false);
    });

    it('onPathFocus defaults a blank input to the root', () => {
      component.pathInput.set('');

      component.onPathFocus();

      expect(mockTrashService.getPathSuggestions).toHaveBeenCalledWith('/');
    });

    it('selectPath commits a trailing-slash path and re-queries children', () => {
      component.selectPath(folder('/default-domain/workspaces'));

      expect(component.pathInput()).toBe('/default-domain/workspaces/');
      expect(component.pathOpen()).toBe(false);
      expect(filterService.filters().path).toBe('/default-domain/workspaces/');

      vi.advanceTimersByTime(100);
      expect(mockTrashService.getPathSuggestions).toHaveBeenCalledWith(
        '/default-domain/workspaces/',
      );
    });

    it('closePathDropdown closes after the blur grace period', () => {
      component.pathOpen.set(true);

      component.closePathDropdown();
      expect(component.pathOpen()).toBe(true);

      vi.advanceTimersByTime(200);
      expect(component.pathOpen()).toBe(false);
    });

    it('Enter commits the typed path and closes the dropdown', () => {
      component.pathInput.set('/typed');
      component.pathOpen.set(true);

      component.onPathKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(component.pathOpen()).toBe(false);
      expect(filterService.filters().path).toBe('/typed');
    });

    it('other keys leave the dropdown open', () => {
      component.pathOpen.set(true);

      component.onPathKeydown(new KeyboardEvent('keydown', { key: 'a' }));

      expect(component.pathOpen()).toBe(true);
    });
  });

  describe('author picker', () => {
    beforeEach(() => {
      component.authorOptions.set([
        { id: 'alice', label: 'alice', count: 2 },
        { id: 'bob', label: 'bob', count: 1 },
      ]);
    });

    it('filteredAuthorOptions returns everything for a blank query', () => {
      component.authorInput.set('');
      expect(component.filteredAuthorOptions().length).toBe(2);
    });

    it('filteredAuthorOptions matches case-insensitively', () => {
      component.authorInput.set('ALI');
      expect(component.filteredAuthorOptions().map((a) => a.id)).toEqual(['alice']);
    });

    it('selectAuthorOption commits the author and closes the list', () => {
      component.selectAuthorOption({ id: 'alice', label: 'alice', count: 2 });

      expect(component.authorInput()).toBe('alice');
      expect(component.authorOpen()).toBe(false);
      expect(filterService.filters().author).toBe('alice');
    });

    it('selectAuthor commits a directory suggestion', () => {
      component.selectAuthor({ id: 'carol', label: 'Carol', type: 'USER_TYPE' });

      expect(component.authorInput()).toBe('carol');
      expect(filterService.filters().author).toBe('carol');
    });

    it('onAuthorInput opens the list as the user types', () => {
      component.onAuthorInput('bo');

      expect(component.authorInput()).toBe('bo');
      expect(component.authorOpen()).toBe(true);
    });

    it('onAuthorFocus opens the list', () => {
      component.onAuthorFocus();
      expect(component.authorOpen()).toBe(true);
    });

    it('closeAuthorDropdown commits the typed value after the grace period', () => {
      component.authorInput.set('dave');
      component.authorOpen.set(true);

      component.closeAuthorDropdown();
      vi.advanceTimersByTime(200);

      expect(component.authorOpen()).toBe(false);
      expect(filterService.filters().author).toBe('dave');
    });
  });

  describe('saved filters', () => {
    const saved: SavedSearch = {
      uid: 's1',
      title: 'Big old files',
      params: {
        ecm_fulltext: 'report',
        ecm_path: '/default-domain',
        dc_creator: 'alice',
        common_size: ['large', 'huge'],
      },
    };

    it('loads the saved filter list on init', () => {
      mockTrashService.getSavedSearches.mockReturnValue(of([saved]));

      component.ngOnInit();

      expect(component.savedFilters()).toEqual([saved]);
    });

    it('falls back to an empty list when the request fails', () => {
      mockTrashService.getSavedSearches.mockReturnValue(throwError(() => new Error('boom')));

      component.ngOnInit();

      expect(component.savedFilters()).toEqual([]);
    });

    it('selectSavedFilter hydrates every filter field', () => {
      component.selectSavedFilter(saved);

      expect(component.fullText()).toBe('report');
      expect(component.pathInput()).toBe('/default-domain');
      expect(component.authorInput()).toBe('alice');
      expect([...component.selectedSizes()]).toEqual(['large', 'huge']);
      expect(filterService.activeSavedFilterUid()).toBe('s1');
      expect(filterService.activeSavedFilterTitle()).toBe('Big old files');
      expect(component.savedFilterDropdownOpen()).toBe(false);
    });

    it('reads params written under the Nuxeo "defaults:" prefix', () => {
      component.selectSavedFilter({
        uid: 's2',
        title: 'Prefixed',
        params: { 'defaults:ecm_fulltext': 'memo', 'defaults:common_size': ['tiny'] },
      });

      expect(component.fullText()).toBe('memo');
      expect([...component.selectedSizes()]).toEqual(['tiny']);
    });

    it('unwraps a single-element array param', () => {
      component.selectSavedFilter({
        uid: 's3',
        title: 'Arrayed',
        params: { ecm_fulltext: ['memo'], dc_creator: ['alice'] },
      });

      expect(component.fullText()).toBe('memo');
      expect(component.authorInput()).toBe('alice');
    });

    it('parses a JSON-encoded array of size bands', () => {
      component.selectSavedFilter({
        uid: 's4',
        title: 'Json',
        params: { common_size: '["tiny","small"]' },
      });

      expect([...component.selectedSizes()]).toEqual(['tiny', 'small']);
    });

    it('falls back to comma splitting when the value is not JSON', () => {
      component.selectSavedFilter({
        uid: 's5',
        title: 'Csv',
        params: { common_size: 'tiny, small' },
      });

      expect([...component.selectedSizes()]).toEqual(['tiny', 'small']);
    });

    it('defaults a missing path to the root', () => {
      component.selectSavedFilter({ uid: 's6', title: 'Bare', params: {} });

      expect(component.pathInput()).toBe('/');
      expect(component.fullText()).toBe('');
      expect([...component.selectedSizes()]).toEqual([]);
    });

    it('tolerates a saved filter with no params object at all', () => {
      component.selectSavedFilter({
        uid: 's7',
        title: 'Null params',
        params: undefined as unknown as Record<string, unknown>,
      });

      expect(component.pathInput()).toBe('/');
    });

    it('filteredSavedFilters matches on title, case-insensitively', () => {
      component.savedFilters.set([saved, { uid: 's8', title: 'Small stuff', params: {} }]);

      component.savedFilterSearch.set('SMALL');

      expect(component.filteredSavedFilters().map((f) => f.uid)).toEqual(['s8']);
    });

    it('toggleSavedFilterDropdown flips visibility', () => {
      component.toggleSavedFilterDropdown();
      expect(component.savedFilterDropdownOpen()).toBe(true);
      component.toggleSavedFilterDropdown();
      expect(component.savedFilterDropdownOpen()).toBe(false);
    });

    it('closeSavedFilterDropdown closes after the grace period', () => {
      component.savedFilterDropdownOpen.set(true);

      component.closeSavedFilterDropdown();
      expect(component.savedFilterDropdownOpen()).toBe(true);

      vi.advanceTimersByTime(200);
      expect(component.savedFilterDropdownOpen()).toBe(false);
    });

    it('focus moving inside the dropdown keeps it open', () => {
      component.savedFilterDropdownOpen.set(true);
      const host = document.createElement('div');
      const child = document.createElement('button');
      host.appendChild(child);

      component.onSavedFilterFocusOut({
        currentTarget: host,
        relatedTarget: child,
      } as unknown as FocusEvent);

      expect(component.savedFilterDropdownOpen()).toBe(true);
    });

    it('focus leaving the dropdown closes it', () => {
      component.savedFilterDropdownOpen.set(true);
      const host = document.createElement('div');

      component.onSavedFilterFocusOut({
        currentTarget: host,
        relatedTarget: document.createElement('button'),
      } as unknown as FocusEvent);

      expect(component.savedFilterDropdownOpen()).toBe(false);
    });

    it('a focus event with no host is a defensive no-op', () => {
      component.savedFilterDropdownOpen.set(true);

      component.onSavedFilterFocusOut({
        currentTarget: null,
        relatedTarget: null,
      } as unknown as FocusEvent);

      expect(component.savedFilterDropdownOpen()).toBe(true);
    });

    it('re-hydrates from the active saved filter only when local filters are pristine', () => {
      mockTrashService.getSavedSearches.mockReturnValue(of([saved]));
      filterService.activeSavedFilterUid.set('s1');

      component.ngOnInit();

      expect(component.fullText()).toBe('report');
    });

    it('preserves in-progress edits when the saved list refreshes', () => {
      mockTrashService.getSavedSearches.mockReturnValue(of([saved]));
      filterService.activeSavedFilterUid.set('s1');
      component.onFullTextChange('my unsaved edit');

      component.ngOnInit();

      expect(component.fullText()).toBe('my unsaved edit');
    });

    it('ignores an active uid that is not in the returned list', () => {
      mockTrashService.getSavedSearches.mockReturnValue(of([saved]));
      filterService.activeSavedFilterUid.set('missing');

      component.ngOnInit();

      expect(component.fullText()).toBe('');
    });

    it('marking the saved searches dirty reloads the list', () => {
      mockTrashService.getSavedSearches.mockReturnValue(of([saved]));
      mockTrashService.getSavedSearches.mockClear();

      filterService.markSavedSearchDirty();
      fixture.detectChanges();

      expect(mockTrashService.getSavedSearches).toHaveBeenCalled();
    });
  });

  describe('misc', () => {
    it('toggleLayout delegates to the shared service', () => {
      expect(filterService.layoutMode()).toBe('filters');
      component.toggleLayout();
      expect(filterService.layoutMode()).toBe('results');
    });

    it('docIcon resolves an icon for a type', () => {
      expect(component.docIcon('Folder')).toBeTruthy();
    });

    it('openDocument navigates to the document detail route', () => {
      component.openDocument('abc');
      expect(navigateByUrl).toHaveBeenCalledWith('/doc/abc');
    });
  });
});
