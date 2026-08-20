import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService, docTypeIcon, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { type DocumentCardField } from './document-card-fields';

const DEFAULT_FIELDS: readonly DocumentCardField[] = ['type', 'modified', 'creator'];

const FIELD_LABELS: Readonly<Record<DocumentCardField, string>> = {
  type: 'Type',
  created: 'Created',
  modified: 'Modified',
  creator: 'Created by',
  contributor: 'Last edited by',
  path: 'Location',
  state: 'Lifecycle state',
};

export interface DocumentCardEntry {
  readonly label: string;
  readonly value: string;
}

function fieldValue(doc: NuxeoDocument, field: DocumentCardField): string {
  const props = doc.properties ?? {};
  const text = (key: string): string => {
    const value = props[key];
    return typeof value === 'string' ? value : '';
  };

  switch (field) {
    case 'type':
      return doc.type ?? '';
    case 'created':
      return text('dc:created').slice(0, 10);
    case 'modified':
      return (text('dc:modified') || doc.lastModified || '').slice(0, 10);
    case 'creator':
      return text('dc:creator');
    case 'contributor':
      return text('dc:lastContributor');
    case 'path':
      return doc.path ?? '';
    case 'state':
      return doc.state ?? '';
  }
}

/**
 * A read-only summary of one document: its title, its icon, and a chosen subset
 * of its Dublin Core fields.
 *
 * Built for the chat panel rather than extracted from it. `document-detail` is
 * 3,962 lines against twenty injected services with no extractable metadata
 * sub-component, so lifting is not on the table (plan A7, "explicitly out of
 * scope"); this is the smaller thing that can be built honestly and reused on a
 * page later.
 *
 * It lives in `libs/shared/ui` rather than in a feature, which is what lets its
 * widget definition ship beside it in `document-metadata-card.agent-widget.ts`
 * instead of having to be written into `apps/nuxeo-ui`. That is the shape a
 * customer-contributed widget takes.
 *
 * **Read-only.** It reads one document through `DocumentService` under the
 * caller's own session and offers exactly one action, opening the document,
 * which is navigation rather than a write. Nothing here reaches a mutating
 * service, which is the precondition for mounting it somewhere the agent chose.
 */
@Component({
  selector: 'lib-document-metadata-card',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './document-metadata-card.component.html',
  styleUrl: './document-metadata-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentMetadataCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly documentService = inject(DocumentService);

  readonly docId = input.required<string>();
  readonly fields = input<readonly DocumentCardField[]>(DEFAULT_FIELDS);

  readonly document = signal<NuxeoDocument | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly title = computed(() => this.document()?.title ?? '');
  readonly icon = computed(() => docTypeIcon(this.document()?.type ?? ''));

  /** Only fields the document actually carries. An empty row says nothing useful. */
  readonly entries = computed<DocumentCardEntry[]>(() => {
    const doc = this.document();
    if (!doc) return [];
    return this.fields()
      .map((field) => ({ label: FIELD_LABELS[field], value: fieldValue(doc, field) }))
      .filter((entry) => entry.value !== '');
  });

  constructor() {
    effect(() => this.load(this.docId()));
  }

  open(): void {
    const doc = this.document();
    if (doc) void this.router.navigate(['/doc', doc.uid]);
  }

  private load(docId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.document.set(null);

    this.documentService
      .getById(docId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.document.set(doc);
          this.loading.set(false);
        },
        // Deliberately does not distinguish 404 from 403. Nuxeo's own answer to
        // an unreadable document is the same either way, and telling a caller
        // that a document exists but is not theirs is a disclosure the page
        // views do not make.
        error: () => {
          this.loading.set(false);
          this.error.set('That document could not be read.');
        },
      });
  }
}
