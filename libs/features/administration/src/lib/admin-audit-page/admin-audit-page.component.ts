import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AdministrationService,
  AuditEntry,
  DirectoryEntry,
  DirectoryService,
} from '@agentic-ui/shared/nuxeo-client';

@Component({
  selector: 'lib-admin-audit-page',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-audit-page.component.html',
  styleUrl: './admin-audit-page.component.scss',
})
export class AdminAuditPageComponent implements OnInit {
  private readonly adminService = inject(AdministrationService);
  private readonly directoryService = inject(DirectoryService);

  readonly columns = ['action', 'date', 'username', 'category', 'document', 'comment'] as const;

  entries = signal<AuditEntry[]>([]);
  totalSize = signal(0);
  loading = signal(false);
  pageIndex = signal(0);
  readonly pageSize = 50;

  principalName = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  eventAction = '';
  eventCategory = '';

  eventTypes = signal<DirectoryEntry[]>([]);
  eventCategories = signal<DirectoryEntry[]>([]);

  ngOnInit(): void {
    this.directoryService.getEventTypes().subscribe((e) => this.eventTypes.set(e));
    this.directoryService.getEventCategories().subscribe((e) => this.eventCategories.set(e));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const from = this.fromDate ? this.fromDate.toISOString() : null;
    const to = this.toDate ? this.toDate.toISOString() : null;
    const eventIds = this.eventAction ? [this.eventAction] : undefined;
    this.adminService
      .searchAuditLogs({
        pageSize: this.pageSize,
        currentPageIndex: this.pageIndex(),
        principalName: this.principalName.trim() || undefined,
        from,
        to,
        eventIds,
        category: this.eventCategory || undefined,
      })
      .subscribe({
        next: (list) => {
          this.entries.set((list.entries ?? []) as AuditEntry[]);
          this.totalSize.set(list.totalSize ?? list.entries?.length ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.entries.set([]);
          this.totalSize.set(0);
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.load();
  }

  nextPage(): void {
    this.pageIndex.update((i) => i + 1);
    this.load();
  }

  prevPage(): void {
    this.pageIndex.update((i) => Math.max(0, i - 1));
    this.load();
  }

  actionLabel(e: AuditEntry): string {
    return (
      e.eventId?.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) ?? '—'
    );
  }
}
