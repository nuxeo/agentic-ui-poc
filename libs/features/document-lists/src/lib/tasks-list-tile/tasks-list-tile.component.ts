import { Component, input, signal, inject, computed, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService, NuxeoTask, CURRENT_USERNAME } from '@agentic-ui/shared/nuxeo-client';

export interface TasksListTileConfig {
  title: string;
  limit: number;
}

@Component({
  selector: 'lib-tasks-list-tile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './tasks-list-tile.component.html',
  styleUrls: ['./tasks-list-tile.component.scss'],
})
export class TasksListTileComponent {
  // Inputs from tile config
  readonly title = input.required<string>();
  readonly limit = input<number>(10);

  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly currentUsername = inject(CURRENT_USERNAME);
  private readonly destroyRef = inject(DestroyRef);

  readonly tasks = signal<NuxeoTask[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly hasContent = computed(() => this.tasks().length > 0);

  constructor() {
    // Load tasks when component initializes or limit changes
    effect(() => {
      const userId = this.currentUsername();
      if (!userId) {
        this.loading.set(false);
        this.error.set('Sign in to see your tasks.');
        return;
      }

      const limit = Math.min(Math.max(1, this.limit()), 50);

      this.loading.set(true);
      this.error.set(null);

      this.taskService
        .getUserTasks(userId, limit)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (entries) => {
            this.tasks.set(entries);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Failed to load tasks.');
            this.loading.set(false);
          },
        });
    });
  }

  taskLabel(task: NuxeoTask): string {
    const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  taskDocTitle(task: NuxeoTask): string {
    return task.targetDocTitle ?? '';
  }

  isOverdue(task: NuxeoTask): boolean {
    return !!task.dueDate && new Date(task.dueDate) < new Date();
  }

  relativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / 60_000);
    const hours = Math.floor(absDiff / 3_600_000);
    const days = Math.floor(absDiff / 86_400_000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let label: string;
    if (years >= 1) label = years === 1 ? 'a year' : `${years} years`;
    else if (months >= 1) label = months === 1 ? 'a month' : `${months} months`;
    else if (days >= 1) label = days === 1 ? 'a day' : `${days} days`;
    else if (hours >= 1) label = hours === 1 ? 'an hour' : `${hours} hours`;
    else label = minutes <= 1 ? 'just now' : `${minutes} minutes`;

    if (label === 'just now') return label;
    return diff > 0 ? `${label} ago` : `in ${label}`;
  }

  goToTask(task: NuxeoTask): void {
    void this.router.navigate(['/tasks', task.id]);
  }
}
