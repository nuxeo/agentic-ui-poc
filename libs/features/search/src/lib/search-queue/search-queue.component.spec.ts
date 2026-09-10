import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of, type Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DocumentDetailService,
  SearchAggregationService,
  type SearchResultItem,
} from '@nuxeo-satori/platform/nuxeo-client';

import { SearchQueueComponent } from './search-queue.component';

/**
 * Covers the object-URL ledger, which is the only thing in this component that can misbehave silently.
 *
 * The effect that fetches thumbnails only ever ADDED: `objectUrls` and `thumbnailMap` kept every id
 * they had ever seen until `onDestroy`, and this queue stays mounted across searches. So every prior
 * result's thumbnail blob was retained for the lifetime of the page, growing without bound. The
 * per-id revoke-before-replace already there only covers re-fetching the *same* id; it never saw an id
 * that simply stopped being in the results.
 *
 * Create and revoke are asserted as a PAIR. Counting only creates cannot detect a leak, and counting
 * only revokes cannot detect over-revocation — the two failure modes are opposite and both matter.
 */
describe('SearchQueueComponent — thumbnail object URL lifecycle', () => {
  let fixture: ComponentFixture<SearchQueueComponent>;
  let component: SearchQueueComponent;

  const items = signal<SearchResultItem[]>([]);
  const created: string[] = [];
  const revoked: string[] = [];
  let seq = 0;

  function item(id: string): SearchResultItem {
    return { id, title: id, type: 'File' } as unknown as SearchResultItem;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    created.length = 0;
    revoked.length = 0;
    seq = 0;
    items.set([]);

    (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => {
      const url = `blob:mock/${(seq += 1)}`;
      created.push(url);
      return url;
    });
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn((u: string) => {
      revoked.push(u);
    });

    await TestBed.configureTestingModule({
      imports: [SearchQueueComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SearchAggregationService, useValue: { items } },
        {
          provide: DocumentDetailService,
          useValue: {
            fetchThumbnail: vi.fn((): Observable<Blob | null> => of(new Blob(['thumb']))),
          },
        },
      ],
    })
      .overrideComponent(SearchQueueComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(SearchQueueComponent);
    component = fixture.componentInstance;
  });

  /** Publishes a result set and lets the effect run. */
  function withResults(...ids: string[]): void {
    items.set(ids.map(item));
    fixture.detectChanges();
  }

  it('mints a thumbnail URL per result', () => {
    withResults('doc1', 'doc2');

    expect(created).toHaveLength(2);
    expect(component.thumbnailMap()['doc1']).toBe(created[0]);
    expect(component.thumbnailMap()['doc2']).toBe(created[1]);
    expect(revoked).toHaveLength(0);
  });

  it('revokes and forgets the URL of a result that left the list', () => {
    withResults('doc1', 'doc2');
    const [urlOne, urlTwo] = created;

    // A second search returns only doc2. Before the fix, doc1's URL stayed in both maps until the
    // drawer was destroyed, so repeated searches retained every thumbnail ever fetched.
    withResults('doc2');

    expect(revoked).toContain(urlOne);
    expect(revoked).not.toContain(urlTwo);
    expect(component.thumbnailMap()['doc1']).toBeUndefined();
    expect(component.thumbnailMap()['doc2']).toBe(urlTwo);
  });

  it('does not accumulate across repeated disjoint searches', () => {
    // The unbounded-growth case stated directly: three searches with no overlap must leave exactly one
    // live URL, not three.
    withResults('a');
    withResults('b');
    withResults('c');

    expect(created).toHaveLength(3);
    expect(revoked).toHaveLength(2);
    expect(Object.keys(component.thumbnailMap())).toEqual(['c']);
  });

  it('keeps a result that survives a search, without re-fetching or re-minting it', () => {
    // The positive control. Reconciliation must not revoke something still on screen, which would show
    // a broken image, and must not re-fetch it either.
    withResults('doc1', 'doc2');
    expect(created).toHaveLength(2);
    const survivor = component.thumbnailMap()['doc2'];

    withResults('doc2', 'doc3');

    expect(component.thumbnailMap()['doc2']).toBe(survivor);
    expect(revoked).not.toContain(survivor);
    expect(created).toHaveLength(3);
  });

  it('revokes everything still held on destroy', () => {
    withResults('doc1', 'doc2');

    fixture.destroy();

    for (const url of created) expect(revoked).toContain(url);
  });
});
