import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';
import {
  CURRENT_USERNAME,
  CollectionService,
  DocumentDetailService,
  docTypeIcon,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

/**
 * Favorites tile: your favorited documents.
 *
 * Extracted from the dashboard's "Favorite Items" widget to enable composable
 * pages. Shows a configurable number of favorites (default 10, max 50) with
 * document name, type, modified date, and un-favorite action.
 *
 * This tile demonstrates that user-initiated writes (clicking the star to
 * un-favorite) are allowed in page tiles, whereas agent-proposed chat widgets
 * must reject them. The distinction is captured in the registry pattern: tiles
 * are user-configured, widgets are agent-proposed.
 */

export interface FavoritesRow {
  uid: string;
  title: string;
  type: string;
  icon: string;
  modified: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Component({
  selector: 'lib-favorites-tile',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './favorites-tile.component.html',
  styleUrl: './favorites-tile.component.scss',
})
export class FavoritesTileComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  readonly title = input.required<string>();
  readonly limit = input<number>(DEFAULT_LIMIT);

  readonly rows = signal<FavoritesRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  private readonly thumbnailUrls: string[] = [];

  readonly isEmpty = computed(() => !this.loading() && !this.error() && this.rows().length === 0);
  readonly effectiveLimit = computed(() => {
    const requested = this.limit();
    return Math.min(Math.max(1, requested), MAX_LIMIT);
  });

  constructor() {
    this.load();

    this.destroyRef.onDestroy(() => {
      this.thumbnailUrls.forEach((url) => URL.revokeObjectURL(url));
      this.thumbnailUrls.length = 0;
    });
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.rows.set([]);

    const user = this.currentUsername();
    if (!user) {
      this.loading.set(false);
      this.error.set('Sign in to see your favorites.');
      return;
    }

    const pageSize = this.effectiveLimit();

    this.collectionService
      .getFavorites(user, pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const rows = (result.entries ?? []).map((doc) => this.toRow(doc));
          this.rows.set(rows);
          this.loading.set(false);
          this.loadThumbnails(rows);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Failed to load favorites.');
        },
      });
  }

  private toRow(doc: NuxeoDocument): FavoritesRow {
    return {
      uid: doc.uid,
      title: doc.title,
      type: doc.type,
      icon: docTypeIcon(doc.type),
      modified: (doc.lastModified ?? '').slice(0, 10),
    };
  }

  openDocument(row: FavoritesRow): void {
    void this.router.navigate(['/doc', row.uid]);
  }

  removeFromFavorites(row: FavoritesRow): void {
    this.detailService
      .removeFromFavorites(row.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.rows.update((rows) => rows.filter((r) => r.uid !== row.uid));
          // The shell's favorites drawer listens for this, so both views stay in step.
          window.dispatchEvent(new Event('favorites-changed'));
        },
        error: () => this.error.set('Failed to remove from favorites.'),
      });
  }

  thumbnailFor(uid: string): SafeUrl | null {
    return this.thumbnailMap()[uid] ?? null;
  }

  private loadThumbnails(rows: FavoritesRow[]): void {
    for (const row of rows) {
      if (this.thumbnailMap()[row.uid]) continue;
      this.detailService
        .fetchThumbnail(row.uid)
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailUrls.push(url);
          this.thumbnailMap.update((map) => ({
            ...map,
            [row.uid]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }
}
