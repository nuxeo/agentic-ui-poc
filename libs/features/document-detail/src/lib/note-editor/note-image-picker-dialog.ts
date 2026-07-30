import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';

import {
  DocumentDetailService,
  NuxeoDocument,
  SearchService,
  SelectionService,
} from '@agentic-ui/shared/nuxeo-client';
import { extractMainBlobFileName } from './note-image-url';

@Component({
  selector: 'lib-note-image-picker-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-image-picker-dialog.html',
  styleUrl: './note-image-picker-dialog.scss',
})
export class NoteImagePickerDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(
    MatDialogRef<NoteImagePickerDialogComponent, NuxeoDocument[]>,
  );
  private readonly searchService = inject(SearchService);
  private readonly documentDetailService = inject(DocumentDetailService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly selectionService = inject(SelectionService);

  private readonly blobUrls: string[] = [];
  private selectionSnapshot: {
    ids: Set<string>;
    labels: Map<string, string>;
    previews: Map<string, SafeUrl | string | null>;
    types: Map<string, string>;
  } | null = null;

  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly results = signal<NuxeoDocument[]>([]);
  readonly totalSize = signal(0);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  private readonly selectedDocByUid = signal<Map<string, NuxeoDocument>>(new Map());

  readonly resultsLabel = computed(() => {
    const count = this.totalSize();
    return `${count} result(s)`;
  });

  readonly isAllSelected = computed(() => {
    const uids = this.results().map((doc) => doc.uid);
    return this.selectionService.isAllSelected(uids);
  });

  readonly isIndeterminate = computed(() => {
    const uids = this.results().map((doc) => doc.uid);
    return this.selectionService.isIndeterminate(uids);
  });

  constructor() {
    this.captureSelectionSnapshot();
    this.selectionService.clear();
    this.selectionService.setClearOnlyMode(true);

    this.destroyRef.onDestroy(() => {
      this.selectionService.setClearOnlyMode(false);
      this.restoreSelectionSnapshot();
      for (const url of this.blobUrls) {
        URL.revokeObjectURL(url);
      }
    });
  }

  ngOnInit(): void {
    this.runSearch('');
  }

  search(): void {
    this.runSearch(this.searchTerm().trim());
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.runSearch('');
  }

  displayFileName(doc: NuxeoDocument): string {
    return extractMainBlobFileName(doc) ?? doc.title ?? doc.uid;
  }

  isSelected(uid: string): boolean {
    return this.selectionService.isSelected(uid);
  }

  toggleSelection(doc: NuxeoDocument): void {
    this.selectionService.toggle(
      doc.uid,
      this.displayFileName(doc),
      this.thumbnailMap()[doc.uid] ?? null,
      doc.type,
    );
    if (this.selectionService.isSelected(doc.uid)) {
      this.rememberSelectedDoc(doc);
    } else {
      this.forgetSelectedDoc(doc.uid);
    }
  }

  toggleSelectAll(): void {
    const visible = this.results();
    if (visible.length === 0) return;

    if (this.isAllSelected()) {
      for (const doc of visible) {
        if (this.selectionService.isSelected(doc.uid)) {
          this.selectionService.toggle(doc.uid);
          this.forgetSelectedDoc(doc.uid);
        }
      }
      return;
    }

    for (const doc of visible) {
      if (!this.selectionService.isSelected(doc.uid)) {
        this.selectionService.toggle(
          doc.uid,
          this.displayFileName(doc),
          this.thumbnailMap()[doc.uid] ?? null,
          doc.type,
        );
        this.rememberSelectedDoc(doc);
      }
    }
  }

  confirm(): void {
    const ids = [...this.selectionService.selectedIds()];
    const cached = this.selectedDocByUid();
    const resultsMap = new Map(this.results().map((doc) => [doc.uid, doc]));
    const selected = ids
      .map((uid) => cached.get(uid) ?? resultsMap.get(uid))
      .filter((doc): doc is NuxeoDocument => !!doc);
    this.dialogRef.close(selected);
  }

  private runSearch(fulltext: string): void {
    this.loading.set(true);
    this.searchService
      .searchDocumentPicker({ fulltext, pageSize: 40 })
      .pipe(
        catchError(() => of({ entries: [], totalSize: 0, resultsCount: 0 })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.loading.set(false);
        const entries = res.entries ?? [];
        this.results.set(entries);
        this.totalSize.set(res.totalSize ?? res.resultsCount ?? entries.length);
        this.pruneSelection(entries);
        this.loadThumbnails(entries);
      });
  }

  /** Drop selections that are no longer visible after Quick Search. */
  private pruneSelection(entries: NuxeoDocument[]): void {
    const visible = new Set(entries.map((doc) => doc.uid));
    for (const uid of this.selectionService.selectedIds()) {
      if (!visible.has(uid)) {
        this.selectionService.toggle(uid);
        this.forgetSelectedDoc(uid);
      }
    }
  }

  private rememberSelectedDoc(doc: NuxeoDocument): void {
    this.selectedDocByUid.update((map) => new Map(map).set(doc.uid, doc));
  }

  private forgetSelectedDoc(uid: string): void {
    this.selectedDocByUid.update((map) => {
      const next = new Map(map);
      next.delete(uid);
      return next;
    });
  }

  private captureSelectionSnapshot(): void {
    this.selectionSnapshot = {
      ids: new Set(this.selectionService.selectedIds()),
      labels: new Map(this.selectionService.selectedLabels()),
      previews: new Map(this.selectionService.selectedPreviews()),
      types: new Map(this.selectionService.selectedTypes()),
    };
  }

  private restoreSelectionSnapshot(): void {
    const snapshot = this.selectionSnapshot;
    this.selectionSnapshot = null;
    if (!snapshot) return;

    const ids = [...snapshot.ids];
    if (ids.length === 0) {
      this.selectionService.clear();
      return;
    }

    this.selectionService.selectAll(
      ids,
      Object.fromEntries(snapshot.labels),
      Object.fromEntries(snapshot.previews),
      Object.fromEntries(snapshot.types),
    );
  }

  private loadThumbnails(docs: NuxeoDocument[]): void {
    for (const doc of docs) {
      if (this.thumbnailMap()[doc.uid]) continue;
      this.documentDetailService
        .fetchThumbnail(doc.uid)
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.blobUrls.push(url);
          this.thumbnailMap.update((map) => ({
            ...map,
            [doc.uid]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }
}
