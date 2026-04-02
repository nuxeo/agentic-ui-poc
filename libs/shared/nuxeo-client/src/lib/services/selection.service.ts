import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocumentDetailService } from './document-detail.service';
import type { NuxeoDocument } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly documentDetailService = inject(DocumentDetailService);

  readonly selectedIds = signal<Set<string>>(new Set());

  readonly selectedCount = () => this.selectedIds().size;

  toggle(id: string): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  selectAll(ids: string[]): void {
    this.selectedIds.set(new Set(ids));
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
  }

  deleteSelected(): Observable<NuxeoDocument[]> {
    const ids = [...this.selectedIds()];
    return this.documentDetailService.trashDocuments(ids).pipe(
      finalize(() => this.clear()),
    );
  }
}
