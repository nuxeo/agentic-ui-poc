import { Injectable, inject, signal } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocumentDetailService } from './document-detail.service';
import type { NuxeoDocument } from '../models/document.model';

type SelectionPreview = SafeUrl | string | null;

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly documentDetailService = inject(DocumentDetailService);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedLabels = signal<Map<string, string>>(new Map());
  readonly selectedPreviews = signal<Map<string, SelectionPreview>>(new Map());
  readonly selectedTypes = signal<Map<string, string>>(new Map());
  /** When true, the app shell topbar shows only count + Clear (e.g. note image picker). */
  readonly clearOnlyMode = signal(false);

  readonly selectedCount = () => this.selectedIds().size;
  readonly selectedItems = () =>
    [...this.selectedIds()].map((id) => ({
      id,
      name: this.selectedLabels().get(id) ?? id,
      preview: this.selectedPreviews().get(id) ?? null,
      type: this.selectedTypes().get(id),
    }));

  toggle(id: string, label?: string, preview?: SelectionPreview, type?: string): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    this.selectedLabels.update((current) => {
      const next = new Map(current);
      if (this.selectedIds().has(id)) {
        next.set(id, label?.trim() || next.get(id) || id);
      } else {
        next.delete(id);
      }
      return next;
    });

    this.selectedPreviews.update((current) => {
      const next = new Map(current);
      if (this.selectedIds().has(id)) {
        next.set(id, preview ?? next.get(id) ?? null);
      } else {
        next.delete(id);
      }
      return next;
    });

    this.selectedTypes.update((current) => {
      const next = new Map(current);
      if (this.selectedIds().has(id)) {
        if (type) next.set(id, type);
        else next.delete(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  selectAll(
    ids: string[],
    labels?: Record<string, string>,
    previews?: Record<string, SelectionPreview>,
    types?: Record<string, string>,
  ): void {
    this.selectedIds.set(new Set(ids));
    this.selectedLabels.update((current) => {
      const next = new Map<string, string>();
      ids.forEach((id) => {
        next.set(id, labels?.[id]?.trim() || current.get(id) || id);
      });
      return next;
    });

    this.selectedPreviews.update((current) => {
      const next = new Map<string, SelectionPreview>();
      ids.forEach((id) => {
        next.set(id, previews?.[id] ?? current.get(id) ?? null);
      });
      return next;
    });

    this.selectedTypes.update((current) => {
      const next = new Map<string, string>();
      ids.forEach((id) => {
        const docType = types?.[id] ?? current.get(id);
        if (docType) next.set(id, docType);
      });
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  isAllSelected(ids: string[]): boolean {
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  }

  isIndeterminate(ids: string[]): boolean {
    return ids.some((id) => this.selectedIds().has(id)) && !this.isAllSelected(ids);
  }

  clear(): void {
    this.selectedIds.set(new Set());
    this.selectedLabels.set(new Map());
    this.selectedPreviews.set(new Map());
    this.selectedTypes.set(new Map());
    this.clearOnlyMode.set(false);
  }

  setClearOnlyMode(enabled: boolean): void {
    this.clearOnlyMode.set(enabled);
  }

  deleteSelected(): Observable<NuxeoDocument[]> {
    const ids = [...this.selectedIds()];
    return this.documentDetailService.trashDocuments(ids).pipe(finalize(() => this.clear()));
  }
}
