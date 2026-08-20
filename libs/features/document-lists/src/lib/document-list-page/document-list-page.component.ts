import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, map, of, type Observable } from 'rxjs';
import {
  CURRENT_USERNAME,
  CollectionService,
  DocumentDetailService,
  DocumentService,
  SelectionService,
  docTypeIcon,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

/**
 * The lists this component backs.
 *
 * The first three are pages, selected by route `data.kind`. `by-id` has no route:
 * it is the same list shown a set of uids by whoever mounts it, which is what
 * lets the AI chat panel render real search results instead of describing them.
 * It is read-only by construction — see {@link LIST_DEFINITIONS} — because a list
 * mounted from a tool call must not carry a write the gateway holds no record of.
 */
export type DocumentListKind = 'recently-viewed' | 'expired-queue' | 'favorites' | 'by-id';

/**
 * How much horizontal room the list has.
 *
 * `compact` is a 400px column: the type, contributor and date columns and the
 * header row are dropped, leaving an icon, a title and a path. Nothing about the
 * data changes, only which of it is shown — the full-width pages are unaffected
 * because they never set it.
 */
export type DocumentListDensity = 'comfortable' | 'compact';

export interface DocumentListRow {
  uid: string;
  title: string;
  type: string;
  icon: string;
  path: string;
  lastContributor: string;
  /** `dc:expired` on the expired queue, `dc:modified` elsewhere. */
  date: string;
}

interface ListDefinition {
  title: string;
  dateLabel: string;
  emptyMessage: string;
  /** Favorites are per-user server state, so the page offers an un-favorite action. */
  removable: boolean;
}

const LIST_DEFINITIONS: Record<DocumentListKind, ListDefinition> = {
  'recently-viewed': {
    title: 'Recently viewed',
    dateLabel: 'Modified',
    emptyMessage: 'Documents you create or edit appear here.',
    removable: false,
  },
  'expired-queue': {
    title: 'Expired queue',
    dateLabel: 'Expired',
    emptyMessage: 'No documents have passed their expiry date.',
    removable: false,
  },
  favorites: {
    title: 'Favorites',
    dateLabel: 'Modified',
    emptyMessage: 'Use the star icon on a document to add it to your favorites.',
    removable: true,
  },
  'by-id': {
    title: 'Documents',
    dateLabel: 'Modified',
    // Not "no results": the caller asked for specific documents by uid, so an
    // empty list means every one of them was unreadable or gone. Saying so is
    // what stops a chat-rendered list implying the repository is empty.
    emptyMessage: 'None of these documents could be read.',
    removable: false,
  },
};

const PAGE_SIZE = 50;

function toRow(doc: NuxeoDocument, kind: DocumentListKind): DocumentListRow {
  const props = doc.properties ?? {};
  const dateSource = kind === 'expired-queue' ? (props['dc:expired'] as string) : doc.lastModified;
  return {
    uid: doc.uid,
    title: doc.title,
    type: doc.type,
    icon: docTypeIcon(doc.type),
    path: doc.path,
    lastContributor: (props['dc:lastContributor'] as string) ?? '',
    date: (dateSource ?? '').slice(0, 10),
  };
}

@Component({
  selector: 'lib-document-list-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './document-list-page.component.html',
  styleUrl: './document-list-page.component.scss',
})
export class DocumentListPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly documentService = inject(DocumentService);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly selectionService = inject(SelectionService);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  /** Bound from the route's `data.kind` via `withComponentInputBinding()`. */
  readonly kind = input.required<DocumentListKind>();
  /**
   * The documents to show when `kind` is `by-id`, and ignored otherwise.
   *
   * Uids only. The rows are read back from Nuxeo through `DocumentService` under
   * the caller's own session, so an unreadable uid drops out of the list rather
   * than appearing with whatever the caller was told about it.
   */
  readonly docIds = input<readonly string[]>([]);
  readonly density = input<DocumentListDensity>('comfortable');
  /**
   * Shows a checkbox per row, writing through to the application's own
   * `SelectionService` exactly as the browse, search and trash lists do.
   *
   * Off by default so the three routed pages are unchanged. It is switched on by
   * the chat widget host, which is the surface that needs "tick two of these and
   * then tell the assistant to act on them".
   */
  readonly selectable = input(false);
  /**
   * Uids the agent has suggested, shown as an indeterminate tick.
   *
   * A suggestion, never a selection: it is rendered differently, it is not in
   * `SelectionService`, and nothing downstream reads it as chosen. The user
   * turns one into a selection by clicking it, which is an ordinary
   * `SelectionService.toggle` and the only way a uid gets there.
   */
  readonly proposedIds = input<readonly string[]>([]);

  readonly rows = signal<DocumentListRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  private readonly thumbnailUrls: string[] = [];

  readonly definition = computed(() => LIST_DEFINITIONS[this.kind()]);
  readonly isEmpty = computed(() => !this.loading() && !this.error() && this.rows().length === 0);
  readonly isCompact = computed(() => this.density() === 'compact');

  /**
   * Suggestions that survive being matched against the rows actually on screen.
   *
   * The intersection matters: a proposal naming a uid this list never rendered
   * has nothing to tick, and showing a count that includes it would describe a
   * suggestion the user cannot act on.
   */
  private readonly visibleProposals = computed(() => {
    const proposed = new Set(this.proposedIds());
    return new Set(
      this.rows()
        .map((row) => row.uid)
        .filter((uid) => proposed.has(uid)),
    );
  });
  /**
   * Suggestions still outstanding — visible, and not yet taken.
   *
   * Counting the taken ones too would leave the hint saying the assistant
   * suggests two rows when one of them is already ticked, which reads as a
   * second suggestion the user cannot find. Taking a suggestion is what ends
   * it, so this and {@link isProposed} have to agree on that or the hint
   * describes rows that no longer look suggested.
   */
  readonly proposedCount = computed(
    () => [...this.visibleProposals()].filter((uid) => !this.isSelected(uid)).length,
  );

  constructor() {
    effect(() => {
      const kind = this.kind();
      // Tracked so a host that re-uses one instance for a new set of uids
      // reloads. `density` is deliberately not read here: it changes the
      // columns, never the request.
      const docIds = this.docIds();
      this.load(kind, docIds);
    });

    this.destroyRef.onDestroy(() => {
      this.thumbnailUrls.forEach((url) => URL.revokeObjectURL(url));
      this.thumbnailUrls.length = 0;
    });
  }

  reload(): void {
    this.load(this.kind(), this.docIds());
  }

  private load(kind: DocumentListKind, docIds: readonly string[]): void {
    this.loading.set(true);
    this.error.set(null);
    this.rows.set([]);

    const request = this.requestFor(kind, docIds);
    if (!request) {
      this.loading.set(false);
      this.error.set('Sign in again to see this list.');
      return;
    }

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        const rows = (result.entries ?? []).map((doc) => toRow(doc, kind));
        this.rows.set(rows);
        this.loading.set(false);
        this.loadThumbnails(rows);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(`Failed to load ${LIST_DEFINITIONS[kind].title.toLowerCase()}.`);
      },
    });
  }

  /** Null when the list needs a signed-in user and there is none. */
  private requestFor(
    kind: DocumentListKind,
    docIds: readonly string[],
  ): Observable<{ entries?: NuxeoDocument[] }> | null {
    if (kind === 'by-id') return this.documentsById(docIds);
    if (kind === 'expired-queue') {
      return this.documentService.getExpiredDocuments(PAGE_SIZE);
    }

    const user = this.currentUsername();
    if (!user) return null;

    return kind === 'favorites'
      ? this.collectionService.getFavorites(user, PAGE_SIZE)
      : this.documentService.getRecentlyViewed(user, PAGE_SIZE);
  }

  /**
   * Reads each uid as its own request, in the order given.
   *
   * One document per request rather than one NXQL `IN` clause, for two reasons
   * that both matter here. Nuxeo applies the caller's ACLs per read, so a uid the
   * caller may not see fails its own request and is dropped while the rest of the
   * list still renders — the alternative is a query whose result silently omits
   * rows with no way to tell why. And the caller's ordering survives, which an
   * `IN` clause does not promise.
   */
  private documentsById(docIds: readonly string[]): Observable<{ entries: NuxeoDocument[] }> {
    const wanted = docIds.slice(0, PAGE_SIZE);
    if (wanted.length === 0) return of({ entries: [] });
    return forkJoin(
      wanted.map((uid) =>
        this.documentService.getById(uid).pipe(catchError(() => of(null as NuxeoDocument | null))),
      ),
    ).pipe(map((docs) => ({ entries: docs.filter((doc): doc is NuxeoDocument => doc !== null) })));
  }

  openDocument(row: DocumentListRow): void {
    void this.router.navigate(['/doc', row.uid]);
  }

  isSelected(uid: string): boolean {
    return this.selectionService.isSelected(uid);
  }

  /** Suggested by the agent and not yet accepted. Mutually exclusive with selected. */
  isProposed(uid: string): boolean {
    return !this.isSelected(uid) && this.visibleProposals().has(uid);
  }

  /**
   * Accepts or drops a row, through the same call every other list in the
   * application makes.
   *
   * This is the whole of "the agent set a selection" resolving into a real one:
   * a proposed row becomes selected because a person clicked it, and the click
   * is indistinguishable from ticking a row in browse. There is deliberately no
   * variant of this method that a caller can hand a list of uids to.
   */
  toggleSelected(row: DocumentListRow): void {
    this.selectionService.toggle(
      row.uid,
      row.title,
      this.thumbnailMap()[row.uid] ?? null,
      row.type,
    );
  }

  selectLabelFor(row: DocumentListRow): string {
    if (this.isSelected(row.uid)) return `Deselect ${row.title}`;
    return this.isProposed(row.uid)
      ? `Select ${row.title}, suggested by the assistant`
      : `Select ${row.title}`;
  }

  removeFromFavorites(row: DocumentListRow): void {
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

  private loadThumbnails(rows: DocumentListRow[]): void {
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
