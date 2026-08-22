import { Component, inject, input, output } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';

import { SelectionService } from '@nuxeo-satori/platform/nuxeo-client';

import { isHxFolder } from '../../utils/hxp-document.predicates';
import { hxpDocTitle, hxpDocTypeLabel } from '../../utils/hxp-browse-cell.utils';
import { hxpDocIconName } from '../../utils/hxp-doc-icon.utils';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';

/**
 * The card view of a document list, with thumbnails.
 *
 * Extracted from `hxp-document-list` when upstream's `HxpDocumentListComponent` took over
 * the table. Upstream renders a DataTable and nothing else — no card view, no thumbnails —
 * so these are **rehomed** rather than lost. They were always host concerns: a
 * presentational alternative layout over the same documents.
 *
 * Deliberately not merged into the host page's template. Keeping it a component keeps the
 * markup and its selection behaviour in one testable place, and the host stays a
 * composition of list-or-cards rather than a fork of both.
 */
/**
 * MISSING(adf-hx): M2 — upstream offers a DataTable and no card view, so thumbnails have no home
 * without this.
 */
@Component({
  selector: 'hxp-document-cards',
  standalone: true,
  templateUrl: './hxp-document-cards.component.html',
  styleUrl: './hxp-document-cards.component.scss',
  imports: [HxpIconComponent],
})
export class HxpDocumentCardsComponent {
  private readonly selectionService = inject(SelectionService);

  readonly documents = input<Document[]>([]);
  /** Object URLs keyed by `sys_id`, fetched by the host. */
  readonly thumbnails = input<Record<string, string>>({});

  readonly documentClick = output<Document>();

  protected docTitle(doc: Document): string {
    return hxpDocTitle(doc);
  }

  protected docTypeLabel(doc: Document): string {
    return hxpDocTypeLabel(doc);
  }

  protected docIcon(doc: Document) {
    return hxpDocIconName(doc);
  }

  protected isFolderish(doc: Document): boolean {
    return isHxFolder(doc);
  }

  protected thumbnailUrl(doc: Document): string | null {
    const id = doc.sys_id;
    return id ? (this.thumbnails()[id] ?? null) : null;
  }

  protected isSelected(doc: Document): boolean {
    const id = doc.sys_id;
    return id ? this.selectionService.isSelected(id) : false;
  }

  protected selectionLabel(doc: Document): string {
    return `Select ${this.docTitle(doc)}`;
  }

  protected toggleSelection(doc: Document, event: Event): void {
    event.stopPropagation();
    const id = doc.sys_id;
    if (!id) return;
    this.selectionService.toggle(
      id,
      this.docTitle(doc),
      this.thumbnailUrl(doc),
      this.docTypeLabel(doc),
    );
  }
}
