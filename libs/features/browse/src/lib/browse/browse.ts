import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  NuxeoDocument,
  BrowseService,
  DocumentDetailService,
  docTypeIcon,
} from '@agentic-ui/shared/nuxeo-client';

const FOLDERISH_TYPES = new Set([
  'Domain',
  'Folder',
  'OrderedFolder',
  'Workspace',
  'WorkspaceRoot',
  'SectionRoot',
  'Section',
  'TemplateRoot',
  'Collection',
  'Collections',
  'Favorites',
]);

interface BreadcrumbSegment {
  label: string;
  routerPath: string;
}

@Component({
  selector: 'lib-browse',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class BrowseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly browseService = inject(BrowseService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly entries = signal<NuxeoDocument[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentDoc = signal<NuxeoDocument | null>(null);
  readonly totalSize = signal(0);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  private currentNuxeoPath = '/';

  readonly breadcrumbs = computed<BreadcrumbSegment[]>(() => {
    const doc = this.currentDoc();
    const crumbs: BreadcrumbSegment[] = [{ label: 'Root', routerPath: '/browse' }];
    if (!doc || doc.path === '/') return crumbs;

    const parts = doc.path.split('/').filter(Boolean);
    let accumulated = '/browse';
    for (const part of parts) {
      accumulated += `/${part}`;
      crumbs.push({ label: decodeURIComponent(part), routerPath: accumulated });
    }
    return crumbs;
  });

  constructor() {
    this.route.url.pipe(takeUntilDestroyed()).subscribe((segments) => {
      const subPath = segments.map((s) => s.path).join('/');
      this.currentNuxeoPath = subPath ? `/${subPath}` : '/';
      this.loadContent();
    });
  }

  loadContent(): void {
    this.loading.set(true);
    this.error.set(null);

    this.browseService.getByPath(this.currentNuxeoPath).subscribe({
      next: (doc) => this.currentDoc.set(doc),
      error: () => this.currentDoc.set(null),
    });

    this.browseService.getChildren(this.currentNuxeoPath, 50).subscribe({
      next: (res) => {
        this.entries.set(res.entries);
        this.totalSize.set(res.totalSize);
        this.loading.set(false);
        this.loadThumbnails(res.entries);
      },
      error: () => {
        this.error.set('Failed to load folder contents.');
        this.loading.set(false);
      },
    });
  }

  private loadThumbnails(docs: NuxeoDocument[]): void {
    this.thumbnailMap.set({});
    for (const doc of docs) {
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

  isFolderish(doc: NuxeoDocument): boolean {
    return FOLDERISH_TYPES.has(doc.type);
  }

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:lastContributor'] as string) ?? '';
  }

  onRowClick(doc: NuxeoDocument): void {
    if (this.isFolderish(doc)) {
      void this.router.navigateByUrl(`/browse${doc.path}`);
    } else {
      void this.router.navigateByUrl(`/doc/${doc.uid}`);
    }
  }
}
