import { Component, inject, input, output, signal, effect, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

import { NuxeoDocument, NuxeoApiBase, DocumentService } from '@agentic-ui/shared/nuxeo-client';
import { AuthService } from '../../auth/auth.service';
import { AppNavItem } from '../../platform-nav-items';

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
  selector: 'app-nav-drawer',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly docService = inject(DocumentService);
  private readonly nuxeoApi = inject(NuxeoApiBase);
  private readonly auth = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();

  readonly recentlyViewed = signal<NuxeoDocument[]>([]);
  readonly recentlyViewedLoading = signal(false);
  readonly recentlyViewedError = signal<string | null>(null);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  private recentlyViewedLoaded = false;
  private blobUrls: string[] = [];

  constructor() {
    effect(() => {
      const item = this.activeItem();
      if (item?.path === '/recently-viewed' && !this.recentlyViewedLoaded) {
        this.loadRecentlyViewed();
      }
    });
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
  }

  private loadRecentlyViewed(): void {
    this.recentlyViewedLoaded = true;
    this.recentlyViewedLoading.set(true);
    this.recentlyViewedError.set(null);

    const userId = this.auth.username() ?? 'Administrator';
    this.docService.getRecentlyViewed(userId, 20).subscribe({
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
  }

  private loadThumbnails(docs: NuxeoDocument[]): void {
    for (const doc of docs) {
      if (this.thumbnailMap()[doc.uid]) continue;
      this.nuxeoApi.fetchThumbnail(doc.uid).pipe(
        catchError(() => of(null)),
      ).subscribe((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        this.blobUrls.push(url);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnailMap.update((map) => ({ ...map, [doc.uid]: safeUrl }));
      });
    }
  }

  refreshRecentlyViewed(): void {
    this.recentlyViewedLoaded = false;
    this.loadRecentlyViewed();
  }

  openDocument(doc: NuxeoDocument): void {
    this.itemSelected.emit(`/doc/${doc.uid}`);
  }

  docIcon(doc: NuxeoDocument): string {
    return DOC_TYPE_ICONS[doc.type] ?? 'insert_drive_file';
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

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties['dc:lastContributor'] as string) ?? '';
  }
}
