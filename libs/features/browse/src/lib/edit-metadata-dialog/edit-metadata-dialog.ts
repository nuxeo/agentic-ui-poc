import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BrowseService, NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { LayoutRendererComponent } from '@agentic-ui/shared/nuxeo-studio';

export interface EditMetadataDialogData {
  document: NuxeoDocument;
}

@Component({
  selector: 'lib-edit-metadata-dialog',
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule, LayoutRendererComponent],
  templateUrl: './edit-metadata-dialog.html',
  styleUrl: './edit-metadata-dialog.scss',
})
export class EditMetadataDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditMetadataDialogComponent>);
  private readonly data = inject<EditMetadataDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly document = this.data.document;
  readonly documentType = this.data.document.type;

  onLayoutSave(properties: Record<string, unknown>): void {
    if (this.saving()) return;
    this.saving.set(true);

    this.browseService.updateDocument(this.document.uid, properties).subscribe({
      next: (doc) => {
        this.saving.set(false);
        this.snackBar.open('Document updated', 'OK', { duration: 3000 });
        this.dialogRef.close(doc);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to update document', 'OK', { duration: 3000 });
      },
    });
  }
}
