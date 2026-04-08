import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';
import { WidgetContainerComponent, WidgetGridComponent } from '@agentic-ui/shared/ui';

import {
  NuxeoDocument,
  NuxeoTask,
  DocumentService,
  DocumentDetailService,
  TaskService,
  CollectionService,
  docTypeIcon,
  FOLDERISH_TYPES,
} from '@agentic-ui/shared/nuxeo-client';
import { AuthService } from '../auth/auth.service';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    WidgetGridComponent,
    WidgetContainerComponent,
    SatTagModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly docService = inject(DocumentService);
  private readonly taskService = inject(TaskService);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly auth = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

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
        this.loadThumbnails(res.entries);
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
        this.loadThumbnails(res.entries);
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
        this.loadThumbnails(res.entries);
      },
      error: () => {
        this.favoritesError.set('Failed to load favorite items.');
        this.favoritesLoading.set(false);
      },
    });
  }

  navigateToDoc(doc: NuxeoDocument): void {
    if (doc.type === 'Collection') {
      void this.router.navigate(['/collections', doc.uid]);
      return;
    }

    if (FOLDERISH_TYPES.has(doc.type)) {
      void this.router.navigate(['/browse' + doc.path]);
      return;
    }

    void this.router.navigate(['/doc', doc.uid]);
  }

  openCreateImport(): void {
    void import('@agentic-ui/feature-browse').then((m) => {
      this.dialog
        .open(m.CreateImportDialogComponent, {
          width: '900px',
          maxWidth: '95vw',
          data: {},
        })
        .afterClosed()
        .subscribe((result: { refreshed?: boolean; path?: string } | undefined) => {
          if (result?.refreshed && result.path) {
            const parts = result.path.replace(/^\/+/, '').split('/').filter(Boolean);
            void this.router.navigate(['/browse', ...parts]);
          }
        });
    });
  }

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  docTypeLabel(doc: NuxeoDocument): string {
    return doc.type ?? 'File';
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties['dc:lastContributor'] as string) ?? '';
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

  taskWorkflow(task: NuxeoTask): string {
    const raw = task.workflowTitle || task.workflowModelName;
    const key = raw.replace(/^wf\.\w+\./, '');
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
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

  private loadThumbnails(docs: NuxeoDocument[]): void {
    for (const doc of docs) {
      if (this.thumbnailMap()[doc.uid]) continue;
      this.detailService
        .fetchThumbnail(doc.uid)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailMap.update((m) => ({
            ...m,
            [doc.uid]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }
}
