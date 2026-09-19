import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lib-remove-attachment-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './remove-attachment-dialog.html',
  styleUrl: './remove-attachment-dialog.scss',
})
export class RemoveAttachmentDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RemoveAttachmentDialogComponent>);

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
