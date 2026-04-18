import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { BrowseService, NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { BulkEditRendererComponent, type BulkEditResult } from '@agentic-ui/shared/nuxeo-studio';

export interface BulkEditDialogData {
  documents: NuxeoDocument[];
}

@Component({
  selector: 'lib-bulk-edit-dialog',
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule, BulkEditRendererComponent],
  templateUrl: './bulk-edit-dialog.component.html',
  styleUrl: './bulk-edit-dialog.component.scss',
})
export class BulkEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<BulkEditDialogComponent>);
  private readonly data = inject<BulkEditDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly documents = this.data.documents;
  readonly docType = this.data.documents[0]?.type ?? 'File';

  onApply(result: BulkEditResult): void {
    if (this.saving()) return;
    this.saving.set(true);

    const updates = this.documents.map((doc) =>
      this.browseService.updateDocument(doc.uid, result.properties),
    );

    forkJoin(updates).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(`Updated ${this.documents.length} document(s)`, 'OK', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Bulk edit failed', 'OK', { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
