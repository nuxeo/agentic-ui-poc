import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { SelectionService } from '@agentic-ui/shared/nuxeo-client';
import { isHxFolder } from '../../services/adf-hx-document.service';
import { NuxeoDocumentRouterService } from '../../services/nuxeo-document-router.service';
import {
  hxpBrowseCellValue,
  hxpDocTitle,
  hxpDocTypeLabel,
  hxpLastContributor,
} from '../../utils/hxp-browse-cell.utils';
import {
  HXP_BROWSE_ALL_COLUMNS,
  type HxpBrowseColumnDef,
  loadHxpBrowseColumnSettings,
  saveHxpBrowseColumnSettings,
} from '../../utils/hxp-browse-columns.utils';
import { hxpDocIconName } from '../../utils/hxp-doc-icon.utils';
import type { HxpBrowseViewMode } from '../hxp-browse-toolbar/hxp-browse-toolbar.component';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-document-list',
  standalone: true,
  templateUrl: './hxp-document-list.component.html',
  styleUrl: './hxp-document-list.component.scss',
  imports: [DatePipe, HxpIconComponent, HxpSpinnerComponent],
})
export class HxpDocumentListComponent {
  private readonly router = inject(NuxeoDocumentRouterService);
  private readonly selectionService = inject(SelectionService);

  readonly documents = input<Document[]>([]);
  readonly isLoading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly viewMode = input<HxpBrowseViewMode>('list');
  readonly thumbnails = input<Record<string, string>>({});

  readonly retry = output<void>();

  protected readonly columns = signal(loadHxpBrowseColumnSettings());
  protected readonly columnPanelOpen = signal(false);
  protected readonly pendingColumns = signal<HxpBrowseColumnDef[]>([]);
  protected readonly sortKey = signal('title');
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  private readonly columnPanel = viewChild<ElementRef<HTMLElement>>('columnPanel');

  protected readonly visibleColumns = computed(() => this.columns().filter((col) => col.visible));

  protected readonly sortedDocuments = computed(() => {
    const docs = [...this.documents()];
    const key = this.sortKey();
    const dir = this.sortDir();
    const mult = dir === 'asc' ? 1 : -1;

    return docs.sort((a, b) => {
      let va = '';
      let vb = '';
      if (key === 'title') {
        va = hxpDocTitle(a).toLowerCase();
        vb = hxpDocTitle(b).toLowerCase();
      } else if (key === 'modified') {
        va = a.sys_modified ?? '';
        vb = b.sys_modified ?? '';
      } else {
        va = hxpBrowseCellValue(a, key).toLowerCase();
        vb = hxpBrowseCellValue(b, key).toLowerCase();
      }
      return va < vb ? -mult : va > vb ? mult : 0;
    });
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.columnPanelOpen()) {
      this.closeColumnPanel();
    }
  }

  protected toggleSort(colKey: string): void {
    if (this.sortKey() === colKey) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(colKey);
      this.sortDir.set('asc');
    }
  }

  protected onRowClick(document: Document): void {
    this.router.navigateTo(document);
  }

  protected docIcon(doc: Document) {
    return hxpDocIconName(doc);
  }

  protected isFolderish(doc: Document): boolean {
    return isHxFolder(doc);
  }

  protected docTitle(doc: Document): string {
    return hxpDocTitle(doc);
  }

  protected docTypeLabel(doc: Document): string {
    return hxpDocTypeLabel(doc);
  }

  protected cellValue(doc: Document, key: string): string {
    return hxpBrowseCellValue(doc, key);
  }

  protected contributor(doc: Document): string {
    return hxpLastContributor(doc);
  }

  protected contributorInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
    if (!id) {
      return;
    }
    const thumb = this.thumbnailUrl(doc);
    this.selectionService.toggle(id, this.docTitle(doc), thumb, this.docTypeLabel(doc));
  }

  protected openColumnPanel(): void {
    this.pendingColumns.set(this.columns().map((col) => ({ ...col })));
    this.columnPanelOpen.set(true);
    queueMicrotask(() => this.columnPanel()?.nativeElement.focus());
  }

  protected closeColumnPanel(): void {
    this.columnPanelOpen.set(false);
  }

  protected isPendingColumn(key: string): boolean {
    return this.pendingColumns().find((col) => col.key === key)?.visible ?? false;
  }

  protected togglePendingColumn(key: string): void {
    if (key === 'title') {
      return;
    }
    this.pendingColumns.update((cols) =>
      cols.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)),
    );
  }

  protected resetColumns(): void {
    this.pendingColumns.set(HXP_BROWSE_ALL_COLUMNS.map((col) => ({ ...col })));
  }

  protected applyColumns(): void {
    const updated = this.pendingColumns();
    this.columns.set(updated);
    saveHxpBrowseColumnSettings(updated);
    this.columnPanelOpen.set(false);
  }
}
