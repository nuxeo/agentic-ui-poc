import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import type { AuditEntry, DirectoryEntry } from '@nuxeo-satori/platform/nuxeo-client';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-browse-history',
  standalone: true,
  templateUrl: './hxp-browse-history.component.html',
  styleUrl: './hxp-browse-history.component.scss',
  imports: [DatePipe, HxpSpinnerComponent],
})
export class HxpBrowseHistoryComponent {
  readonly loading = input(false);
  readonly entries = input<AuditEntry[]>([]);
  readonly totalSize = input(0);
  readonly pageSize = input(10);
  readonly pageIndex = input(0);
  readonly availableActions = input<DirectoryEntry[]>([]);
  readonly availableCategories = input<DirectoryEntry[]>([]);
  readonly eventTypeLabelMap = input<Record<string, string>>({});
  readonly eventCategoryLabelMap = input<Record<string, string>>({});

  readonly filterUsername = input('');
  readonly filterDateFrom = input('');
  readonly filterDateTo = input('');
  readonly filterAction = input('');
  readonly filterCategory = input('');

  readonly filterUsernameChange = output<string>();
  readonly filterDateFromChange = output<string>();
  readonly filterDateToChange = output<string>();
  readonly filterActionChange = output<string>();
  readonly filterCategoryChange = output<string>();
  readonly pageChange = output<{ pageIndex: number; pageSize: number }>();
  readonly sortChange = output<{ active: keyof AuditEntry; direction: 'asc' | 'desc' }>();

  readonly sortActive = input<keyof AuditEntry>('eventDate');
  readonly sortDirection = input<'asc' | 'desc'>('desc');

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalSize() / this.pageSize())),
  );

  protected eventLabel(eventId: string): string {
    return this.eventTypeLabelMap()[eventId] ?? eventId;
  }

  protected categoryLabel(category: string): string {
    return this.eventCategoryLabelMap()[category] ?? category;
  }

  protected toggleSort(column: keyof AuditEntry): void {
    const active = this.sortActive();
    const direction = this.sortDirection();
    if (active === column) {
      this.sortChange.emit({ active: column, direction: direction === 'asc' ? 'desc' : 'asc' });
      return;
    }
    this.sortChange.emit({ active: column, direction: 'asc' });
  }

  protected sortIcon(column: keyof AuditEntry): 'arrow-up' | 'arrow-down' | null {
    if (this.sortActive() !== column) {
      return null;
    }
    return this.sortDirection() === 'asc' ? 'arrow-up' : 'arrow-down';
  }

  protected previousPage(): void {
    const index = this.pageIndex();
    if (index <= 0) {
      return;
    }
    this.pageChange.emit({ pageIndex: index - 1, pageSize: this.pageSize() });
  }

  protected nextPage(): void {
    const index = this.pageIndex();
    if (index + 1 >= this.pageCount()) {
      return;
    }
    this.pageChange.emit({ pageIndex: index + 1, pageSize: this.pageSize() });
  }
}
