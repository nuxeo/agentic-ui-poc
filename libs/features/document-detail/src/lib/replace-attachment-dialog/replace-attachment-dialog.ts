import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ReplaceAttachmentDialogData {
  fileName: string;
}

@Component({
  selector: 'lib-replace-attachment-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './replace-attachment-dialog.html',
  styleUrl: './replace-attachment-dialog.scss',
})
export class ReplaceAttachmentDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ReplaceAttachmentDialogComponent>);
  readonly data: ReplaceAttachmentDialogData = inject(MAT_DIALOG_DATA);
  readonly selectedFile = signal<File | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    this.dialogRef.close(this.selectedFile());
  }
}
