import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  DocumentDetailService,
  NuxeoDocument,
  buildDocumentCompareSections,
  isCompareIconField,
  type CompareRow,
} from '@agentic-ui/shared/nuxeo-client';
import { CompareIconImageComponent } from './compare-icon-image.component';

export interface DocumentCompareDialogData {
  items: Array<{ id: string; name: string }>;
}

@Component({
  selector: 'lib-document-compare-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSlideToggleModule,
    CompareIconImageComponent,
  ],
  templateUrl: './document-compare-dialog.html',
  styleUrl: './document-compare-dialog.scss',
})
export class DocumentCompareDialogComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly detailService = inject(DocumentDetailService);
  readonly data = inject<DocumentCompareDialogData>(MAT_DIALOG_DATA);

  readonly leftId = signal(this.data.items[0]?.id ?? '');
  readonly rightId = signal(this.data.items[1]?.id ?? this.data.items[0]?.id ?? '');
  readonly viewAllData = signal(false);
  readonly unifiedView = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly leftDoc = signal<NuxeoDocument | null>(null);
  readonly rightDoc = signal<NuxeoDocument | null>(null);

  readonly sections = computed(() => {
    const left = this.leftDoc();
    const right = this.rightDoc();
    if (!left || !right) return [];
    return buildDocumentCompareSections(left, right, this.viewAllData());
  });

  isIconRow(row: CompareRow): boolean {
    return isCompareIconField(row.key);
  }

  constructor() {
    effect(() => {
      const leftId = this.leftId();
      const rightId = this.rightId();
      if (!leftId || !rightId || leftId === rightId) {
        this.leftDoc.set(null);
        this.rightDoc.set(null);
        this.error.set('Select two different documents to compare.');
        return;
      }

      this.loading.set(true);
      this.error.set(null);

      forkJoin({
        left: this.detailService.getFullDocument(leftId),
        right: this.detailService.getFullDocument(rightId),
      })
        .pipe(
          catchError(() => {
            this.error.set('Failed to load documents for comparison.');
            return of(null);
          }),
          finalize(() => this.loading.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((result) => {
          if (!result) return;
          this.leftDoc.set(result.left);
          this.rightDoc.set(result.right);
        });
    });
  }
}
