import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

import {
  DocumentService,
  DocumentDetailService,
  NuxeoDocument,
  docTypeIcon,
  FOLDERISH_TYPES,
  avatarColor,
} from '@agentic-ui/shared/nuxeo-client';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';

/**
 * Page tile showing documents the user recently edited.
 *
 * Extracted from dashboard-page.component.html lines 64-117 as part of the
 * page builder tile extraction (Task #4, tile 1 of 3).
 *
 * Config schema:
 * - title: string (displayed in tile header)
 * - limit: number (default 10, max 50)
 *
 * Displays:
 * - Document list with thumbnails
 * - Title, modified date, last contributor
 * - Click navigates to document detail / browse / collection
 * - Empty state when no recent edits
 * - Error state on fetch failure
 */
@Component({
  selector: 'lib-recently-edited-tile',
  standalone: true,
  imports: [DatePipe, MatIconModule, MatProgressSpinnerModule, SatAvatarModule],
  templateUrl: './recently-edited-tile.component.html',
  styleUrl: './recently-edited-tile.component.scss',
})
export class RecentlyEditedTileComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly docService = inject(DocumentService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly title = input.required<string>();
  readonly limit = input<number>(10);

  readonly documents = signal<NuxeoDocument[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  constructor() {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    this.loading.set(true);
    this.error.set(null);

    const limit = Math.min(Math.max(1, this.limit()), 50);

    this.docService
      .getRecentlyEdited(limit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.documents.set(res.entries);
          this.loading.set(false);
          this.loadThumbnails(res.entries);
        },
        error: () => {
          this.error.set('Failed to load recently edited documents.');
          this.loading.set(false);
        },
      });
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

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties['dc:lastContributor'] as string) ?? '';
  }

  avatarColor(name: string) {
    return avatarColor(name);
  }
}
