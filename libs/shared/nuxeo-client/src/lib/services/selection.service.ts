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

  readonly selectedCount = () => this.selectedIds().size;
  readonly selectedItems = () =>
    [...this.selectedIds()].map((id) => ({
      id,
      name: this.selectedLabels().get(id) ?? id,
      preview: this.selectedPreviews().get(id) ?? null,
    }));

  toggle(id: string, label?: string, preview?: SelectionPreview): void {
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
  }

  selectAll(ids: string[], labels?: Record<string, string>, previews?: Record<string, SelectionPreview>): void {
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
  }

  deleteSelected(): Observable<NuxeoDocument[]> {
    const ids = [...this.selectedIds()];
    return this.documentDetailService.trashDocuments(ids).pipe(
      finalize(() => this.clear()),
    );
  }
}
