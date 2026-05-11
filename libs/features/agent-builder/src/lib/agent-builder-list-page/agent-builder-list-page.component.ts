import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, switchMap, tap, finalize } from 'rxjs';

import { AbClientService, AbClientError, type AbAgentSummary } from '@agentic-ui/shared/ab-client';

@Component({
  selector: 'lib-agent-builder-list-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './agent-builder-list-page.component.html',
  styleUrl: './agent-builder-list-page.component.scss',
})
export class AgentBuilderListPageComponent {
  private readonly ab = inject(AbClientService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  readonly displayedColumns: string[] = ['name', 'description', 'lastModified'];
  readonly agents = signal<AbAgentSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly filteredAgents = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const list = this.agents();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.modelLabel ?? '').toLowerCase().includes(q),
    );
  });

  readonly pagedAgents = computed(() => {
    const list = this.filteredAgents();
    const start = this.pageIndex() * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.ab.listAgents().pipe(finalize(() => this.loading.set(false)))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => this.agents.set(list.filter((a) => a.id)),
        error: (err) => {
          if (err instanceof AbClientError) {
            this.error.set(err.message);
          } else {
            this.error.set(
              (err as { error?: { responseMessage?: string } })?.error?.responseMessage ??
                'Failed to load agents. Please try again.',
            );
          }
        },
      });

    queueMicrotask(() => this.reload$.next());
  }

  loadAgents(): void {
    this.reload$.next();
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(0);
  }

  onPage(ev: PageEvent): void {
    this.pageIndex.set(ev.pageIndex);
    this.pageSize.set(ev.pageSize);
  }

  formatLastModified(raw: string | undefined): string {
    if (!raw) return '—';
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    }
    return raw;
  }
}
