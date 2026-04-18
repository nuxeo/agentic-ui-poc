import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { NuxeoDocument, CollectionService } from '@agentic-ui/shared/nuxeo-client';
import { LayoutRendererComponent } from '@agentic-ui/shared/nuxeo-studio';

export interface EditCollectionDialogData {
  document: NuxeoDocument;
}

@Component({
  selector: 'lib-edit-collection-dialog',
  standalone: true,
  imports: [MatDialogModule, LayoutRendererComponent],
  templateUrl: './edit-collection-dialog.html',
  styleUrl: './edit-collection-dialog.scss',
})
export class EditCollectionDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<EditCollectionDialogComponent>);
  private readonly data = inject<EditCollectionDialogData>(MAT_DIALOG_DATA);
  private readonly collectionService = inject(CollectionService);

  readonly saving = signal(false);

  documentType = '';
  document: NuxeoDocument | null = null;

  ngOnInit(): void {
    this.document = this.data.document;
    this.documentType = this.data.document.type;
  }

  onLayoutSave(properties: Record<string, unknown>): void {
    if (this.saving()) return;
    this.saving.set(true);

    this.collectionService.updateProperties(this.data.document.uid, properties).subscribe({
      next: (updatedDoc) => {
        this.saving.set(false);
        this.dialogRef.close(updatedDoc);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
