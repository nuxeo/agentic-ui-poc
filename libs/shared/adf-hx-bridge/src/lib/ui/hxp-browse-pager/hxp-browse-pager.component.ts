import { Component, computed, input, output } from '@angular/core';

/**
 * MISSING(adf-hx): M7 — upstream's document list has no pager, so a folder larger than one page
 * silently showed its first page only. adf-core's DataTable ships paginator *styles* and the
 * component's template contains no paginator at all.
 *
 * **Next/previous rather than numbered pages, and that is forced rather than chosen.** Nuxeo sets
 * `resultsCountLimit` to the requested `pageSize` and counts only within it, so `resultsCount` is a
 * real total **exactly when the folder fits on one page** and `-2` otherwise. Measured: `pageSize=39`
 * over 39 children answered `39`; `pageSize=20` over the same folder answered `-2`. The total is
 * known only when there is nothing to page, so a numbered pager is impossible in every case where
 * it would help. `isNextPageAvailable` is accurate in both cases.
 *
 * When the server *does* report a count, the range is shown; when it does not, the range is shown
 * without a total. Neither case displays a number the server did not provide.
 */
@Component({
  selector: 'hxp-browse-pager',
  standalone: true,
  templateUrl: './hxp-browse-pager.component.html',
  styleUrl: './hxp-browse-pager.component.scss',
})
export class HxpBrowsePagerComponent {
  readonly pageIndex = input<number>(0);
  readonly pageSize = input<number>(50);
  /** Rows on the current page. */
  readonly loaded = input<number>(0);
  /** Nuxeo's count, or a negative number when it declined to count. */
  readonly totalCount = input<number>(-2);
  readonly hasNextPage = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly pageChange = output<number>();

  protected readonly hasTotal = computed(() => this.totalCount() >= 0);
  protected readonly firstRow = computed(() =>
    this.loaded() === 0 ? 0 : this.pageIndex() * this.pageSize() + 1,
  );
  protected readonly lastRow = computed(() => this.pageIndex() * this.pageSize() + this.loaded());
  protected readonly canPrevious = computed(() => !this.disabled() && this.pageIndex() > 0);
  protected readonly canNext = computed(() => !this.disabled() && this.hasNextPage());

  /**
   * The range, and a total only when the server gave one.
   *
   * `1–50 of 137` when counted, `1–50` when not. Never `1–50 of 50`, which is what showing the page
   * length as the total produced and why a paged folder looked complete.
   */
  protected readonly rangeLabel = computed(() =>
    this.loaded() === 0
      ? 'No documents'
      : this.hasTotal()
        ? `${this.firstRow()}–${this.lastRow()} of ${this.totalCount()}`
        : `${this.firstRow()}–${this.lastRow()}`,
  );

  protected previous(): void {
    if (this.canPrevious()) this.pageChange.emit(this.pageIndex() - 1);
  }

  protected next(): void {
    if (this.canNext()) this.pageChange.emit(this.pageIndex() + 1);
  }
}
