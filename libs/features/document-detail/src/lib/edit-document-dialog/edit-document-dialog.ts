import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { BrowseService, NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import { LayoutRendererComponent } from '@agentic-ui/shared/nuxeo-studio';

export interface EditDocumentDialogData {
  document: NuxeoDocument;
}

@Component({
  selector: 'lib-edit-document-dialog',
  standalone: true,
  imports: [MatDialogModule, LayoutRendererComponent],
  templateUrl: './edit-document-dialog.html',
  styleUrl: './edit-document-dialog.scss',
})
export class EditDocumentDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<EditDocumentDialogComponent>);
  private readonly data = inject<EditDocumentDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);

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

    this.browseService.updateDocument(this.data.document.uid, properties).subscribe({
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
