import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  AssetAggregationService,
  DocumentDetailService,
  type AssetQueueItem,
} from '@agentic-ui/shared/nuxeo-client';

import { AssetsQueueComponent } from './assets-queue.component';

function item(id: string): AssetQueueItem {
  return { id, title: `Asset ${id}`, type: 'File', icon: 'description' };
}

const mockDetailService = { fetchThumbnail: vi.fn(() => EMPTY) };

describe('AssetsQueueComponent', () => {
  let component: AssetsQueueComponent;
  let fixture: ComponentFixture<AssetsQueueComponent>;
  let aggregationService: AssetAggregationService;
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let urlCounter: number;

  // jsdom ships no object-URL implementation and the component revokes on destroy, so both
  // halves are stubbed for the whole suite.
  beforeAll(() => {
    createObjectURL = vi.fn(() => `blob:queue-${++urlCounter}`);
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    urlCounter = 0;
    mockDetailService.fetchThumbnail.mockReturnValue(EMPTY);

    await TestBed.configureTestingModule({
      imports: [AssetsQueueComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: DocumentDetailService, useValue: mockDetailService },
      ],
    })
      .overrideComponent(AssetsQueueComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(AssetsQueueComponent);
    component = fixture.componentInstance;
    aggregationService = TestBed.inject(AssetAggregationService);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('mirrors the aggregation service queue items', () => {
    aggregationService.items.set([item('a'), item('b')]);

    expect(component.items().map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('emits the clicked item', () => {
    const emitted: AssetQueueItem[] = [];
    component.itemSelected.subscribe((value) => emitted.push(value));

    component.onItemClick(item('a'));

    expect(emitted).toEqual([item('a')]);
  });

  it('returns null for an item with no thumbnail', () => {
    expect(component.thumbnailFor('a')).toBeNull();
  });

  describe('thumbnails', () => {
    it('fetches one thumbnail per queue item and sanitizes the URL', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      aggregationService.items.set([item('a'), item('b')]);

      fixture.detectChanges();

      expect(mockDetailService.fetchThumbnail).toHaveBeenCalledTimes(2);
      expect(component.thumbnailFor('a')).toBeTruthy();
      expect(component.thumbnailFor('b')).toBeTruthy();
    });

    it('does not refetch a thumbnail it already holds', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      aggregationService.items.set([item('a')]);
      fixture.detectChanges();

      aggregationService.items.set([item('a'), item('b')]);
      fixture.detectChanges();

      expect(mockDetailService.fetchThumbnail).toHaveBeenCalledTimes(2);
      expect(mockDetailService.fetchThumbnail).toHaveBeenLastCalledWith('b');
    });

    it('swallows a failed thumbnail fetch and allows a later retry', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(throwError(() => new Error('404')));
      aggregationService.items.set([item('a')]);
      fixture.detectChanges();

      expect(component.thumbnailFor('a')).toBeNull();

      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      aggregationService.items.set([item('a'), item('b')]);
      fixture.detectChanges();

      expect(component.thumbnailFor('a')).toBeTruthy();
    });

    it('revokes the previous URL when an item is refetched', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      aggregationService.items.set([item('a')]);
      fixture.detectChanges();

      // Clearing the map lets the effect re-fetch the same id, which must not leak the
      // first object URL.
      component.thumbnailMap.set({});
      aggregationService.items.set([item('a'), item('b')]);
      fixture.detectChanges();

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:queue-1');
    });

    it('revokes every retained URL on destroy', () => {
      mockDetailService.fetchThumbnail.mockReturnValue(of(new Blob(['x'])));
      aggregationService.items.set([item('a'), item('b')]);
      fixture.detectChanges();
      revokeObjectURL.mockClear();

      fixture.destroy();

      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });
});
