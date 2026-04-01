import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  WidgetContainerComponent,
  WidgetGridComponent,
} from '@agentic-ui/shared/ui';

import {
  NuxeoDocument,
  NuxeoTask,
  DocumentService,
  TaskService,
  CollectionService,
} from '@agentic-ui/shared/nuxeo-client';
import { AuthService } from '../auth/auth.service';

const DOC_TYPE_ICONS: Record<string, string> = {
  File: 'description',
  Note: 'sticky_note_2',
  Picture: 'image',
  Video: 'videocam',
  Audio: 'audiotrack',
  Folder: 'folder',
  Workspace: 'workspaces',
  Domain: 'public',
  Collection: 'collections_bookmark',
  Section: 'library_books',
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    WidgetGridComponent,
    WidgetContainerComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  private readonly docService = inject(DocumentService);
  private readonly taskService = inject(TaskService);
  private readonly collectionService = inject(CollectionService);
  private readonly auth = inject(AuthService);

  readonly recentlyEdited = signal<NuxeoDocument[]>([]);
  readonly recentlyEditedLoading = signal(true);
  readonly recentlyEditedError = signal<string | null>(null);

  readonly tasks = signal<NuxeoTask[]>([]);
  readonly tasksLoading = signal(true);
  readonly tasksError = signal<string | null>(null);

  readonly recentlyViewed = signal<NuxeoDocument[]>([]);
  readonly recentlyViewedLoading = signal(true);
  readonly recentlyViewedError = signal<string | null>(null);

  readonly favorites = signal<NuxeoDocument[]>([]);
  readonly favoritesLoading = signal(true);
  readonly favoritesError = signal<string | null>(null);

  constructor() {
    const userId = this.auth.username() ?? 'Administrator';

    this.docService.getRecentlyEdited(10).subscribe({
      next: (res) => {
        this.recentlyEdited.set(res.entries);
        this.recentlyEditedLoading.set(false);
      },
      error: () => {
        this.recentlyEditedError.set('Failed to load recently edited documents.');
        this.recentlyEditedLoading.set(false);
      },
    });

    this.taskService.getUserTasks(userId, 10).subscribe({
      next: (entries) => {
        this.tasks.set(entries);
        this.tasksLoading.set(false);
      },
      error: () => {
        this.tasksError.set('Failed to load tasks.');
        this.tasksLoading.set(false);
      },
    });

    this.docService.getRecentlyViewed(userId, 10).subscribe({
      next: (res) => {
        this.recentlyViewed.set(res.entries);
        this.recentlyViewedLoading.set(false);
      },
      error: () => {
        this.recentlyViewedError.set('Failed to load recently viewed documents.');
        this.recentlyViewedLoading.set(false);
      },
    });

    this.collectionService.getFavorites(userId, 10).subscribe({
      next: (res) => {
        this.favorites.set(res.entries);
        this.favoritesLoading.set(false);
      },
      error: () => {
        this.favoritesError.set('Failed to load favorite items.');
        this.favoritesLoading.set(false);
      },
    });
  }

  docIcon(doc: NuxeoDocument): string {
    return DOC_TYPE_ICONS[doc.type] ?? 'insert_drive_file';
  }

  docTypeLabel(doc: NuxeoDocument): string {
    return doc.type ?? 'File';
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties['dc:lastContributor'] as string) ?? '';
  }

  taskLabel(task: NuxeoTask): string {
    const key = task.name
      .replace(/^wf\.\w+\./, '')
      .replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  taskDocTitle(task: NuxeoTask): string {
    return task.targetDocTitle ?? '';
  }

  taskWorkflow(task: NuxeoTask): string {
    const raw = task.workflowTitle || task.workflowModelName;
    const key = raw.replace(/^wf\.\w+\./, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
    this.router.navigate(['/tasks', task.id]);
  }
}
