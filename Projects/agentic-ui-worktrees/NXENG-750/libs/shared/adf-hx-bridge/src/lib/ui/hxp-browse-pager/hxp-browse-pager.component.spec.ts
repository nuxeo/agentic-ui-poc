import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HxpBrowsePagerComponent } from './hxp-browse-pager.component';

/**
 * The pager, whose whole reason for existing is that a folder larger than one page silently
 * showed its first page only.
 *
 * The behaviour that matters is what it does with Nuxeo's **refusal to count**. Nuxeo answers
 * `resultsCount: -2` whenever the folder does not fit on one page, so the label must show a
 * total exactly when there is one and never otherwise. `1–50 of 50` on a 137-document folder is
 * the specific wrong answer this component was written to stop, so it is asserted as a negative
 * next to the positive case.
 *
 * Everything on the class is `protected`, so these go through the rendered DOM. That is the
 * right level anyway: the label and the two disabled states are the contract.
 */
describe('HxpBrowsePagerComponent', () => {
  let fixture: ComponentFixture<HxpBrowsePagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HxpBrowsePagerComponent],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HxpBrowsePagerComponent);
  });

  interface PagerInputs {
    readonly pageIndex?: number;
    readonly pageSize?: number;
    readonly loaded?: number;
    readonly totalCount?: number;
    readonly hasNextPage?: boolean;
    readonly disabled?: boolean;
  }

  function render(inputs: PagerInputs): void {
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  /**
   * `fixture.nativeElement` is `any`, which makes `querySelector<T>` an untyped call that `tsc`
   * rejects (`TS2347`) even while the suite runs green — Vitest strips types through esbuild.
   * Narrowing once here keeps every query below typed.
   */
  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const must = <T extends Element>(selector: string): T => {
    const el = root().querySelector<T>(selector);
    if (!el) throw new Error(`expected an element matching ${selector}`);
    return el;
  };

  const rangeEl = (): HTMLElement => must<HTMLElement>('.hxp-pager__range');

  const range = (): string => rangeEl().textContent?.trim() ?? '';

  const button = (label: 'Previous page' | 'Next page'): HTMLButtonElement =>
    must<HTMLButtonElement>(`[aria-label="${label}"]`);

  it('renders both controls and a live range region', () => {
    render({ loaded: 10, totalCount: 10 });

    // Presence before absence: the disabled-state assertions below only mean something if
    // the buttons are rendered at all.
    expect(button('Previous page')).toBeTruthy();
    expect(button('Next page')).toBeTruthy();
    expect(rangeEl().getAttribute('role')).toBe('status');
    expect(must<HTMLElement>('nav').getAttribute('aria-label')).toBe('Document list pages');
  });

  it('shows the range with a total when Nuxeo counted', () => {
    render({ pageIndex: 0, pageSize: 50, loaded: 50, totalCount: 137 });
    expect(range()).toBe('1–50 of 137');
  });

  it('shows the range without a total when Nuxeo declined to count', () => {
    // `-2` is Nuxeo's literal answer once `resultsCountLimit` is exceeded, which is exactly
    // the case where a total would be most useful and is not available.
    render({ pageIndex: 0, pageSize: 50, loaded: 50, totalCount: -2 });
    expect(range()).toBe('1–50');
    // The specific wrong answer: the page length presented as the total, which made a paged
    // folder look complete.
    expect(range()).not.toBe('1–50 of 50');
    expect(range()).not.toContain('of');
    expect(range()).not.toContain('-2');
  });

  it('offsets the range by the page index', () => {
    render({ pageIndex: 2, pageSize: 20, loaded: 20, totalCount: 137 });
    expect(range()).toBe('41–60 of 137');
  });

  it('shows a short last page as short, not padded to the page size', () => {
    render({ pageIndex: 2, pageSize: 50, loaded: 37, totalCount: 137 });
    expect(range()).toBe('101–137 of 137');
  });

  it('says "No documents" for an empty page rather than a zero range', () => {
    // `firstRow` is 0 only on this branch, and `0–0 of 0` is what it would read without the
    // special case.
    render({ pageIndex: 0, pageSize: 50, loaded: 0, totalCount: 0 });
    expect(range()).toBe('No documents');
  });

  it('says "No documents" for an empty page even when uncounted', () => {
    render({ pageIndex: 3, pageSize: 50, loaded: 0, totalCount: -2 });
    expect(range()).toBe('No documents');
  });

  it('uses defaults that assume no count and no next page', () => {
    // The defaults are the safe end of both choices: `totalCount: -2` means "do not claim a
    // total" and `hasNextPage: false` means "do not offer a page that may not exist".
    render({});
    expect(range()).toBe('No documents');
    expect(button('Next page').disabled).toBe(true);
    expect(button('Previous page').disabled).toBe(true);
  });

  it('disables Previous on the first page and enables it after', () => {
    render({ pageIndex: 0, loaded: 50, hasNextPage: true });
    expect(button('Previous page').disabled).toBe(true);

    render({ pageIndex: 1 });
    expect(button('Previous page').disabled).toBe(false);
  });

  it('enables Next only when the server said there is one', () => {
    // Not derived from the count: the count is unavailable in every paged case, so
    // `isNextPageAvailable` from the server is the only accurate signal.
    render({ pageIndex: 0, loaded: 50, totalCount: -2, hasNextPage: false });
    expect(button('Next page').disabled).toBe(true);

    render({ hasNextPage: true });
    expect(button('Next page').disabled).toBe(false);
  });

  it('emits the next and previous page index', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((index) => emitted.push(index));

    render({ pageIndex: 2, pageSize: 20, loaded: 20, hasNextPage: true });
    button('Next page').click();
    expect(emitted).toEqual([3]);

    button('Previous page').click();
    expect(emitted).toEqual([3, 1]);
  });

  it('does not emit past either end even if a click arrives', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((index) => emitted.push(index));

    // `disabled` on the button stops a real user; the guards in `previous()`/`next()` are the
    // second line, and they are what a programmatic or synthetic click meets.
    render({ pageIndex: 0, loaded: 50, hasNextPage: false });
    button('Previous page').click();
    button('Next page').click();
    expect(emitted).toEqual([]);
  });

  it('blocks both directions while the list is loading', () => {
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((index) => emitted.push(index));

    // `disabled` overrides both, including Next when a next page genuinely exists — paging
    // again mid-fetch is how two responses race and the wrong one wins.
    render({ pageIndex: 1, loaded: 50, hasNextPage: true, disabled: true });
    expect(button('Previous page').disabled).toBe(true);
    expect(button('Next page').disabled).toBe(true);
    button('Previous page').click();
    button('Next page').click();
    expect(emitted).toEqual([]);

    // And released when loading finishes, which is the half that a disabled-flag test
    // usually forgets.
    render({ disabled: false });
    expect(button('Previous page').disabled).toBe(false);
    expect(button('Next page').disabled).toBe(false);
    button('Next page').click();
    expect(emitted).toEqual([2]);
  });

  it('still shows the range while disabled', () => {
    // The range is a `role="status"` region. Blanking it during a fetch would make a screen
    // reader announce the loss of position on every page change.
    render({ pageIndex: 0, pageSize: 50, loaded: 50, totalCount: 137, disabled: true });
    expect(range()).toBe('1–50 of 137');
  });
});
