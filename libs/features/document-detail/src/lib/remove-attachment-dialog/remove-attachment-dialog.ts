import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'lib-remove-attachment-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="remove-dialog">
      <h2>Remove File</h2>
      <p>Do you really want to remove this file?</p>

      <div class="dialog-actions">
        <button class="btn-no" (click)="cancel()">No</button>
        <button class="btn-yes" (click)="confirm()">Yes</button>
      </div>
    </div>
  `,
  styles: [
    `
      .remove-dialog {
        padding: 28px 32px;
        min-width: 340px;
      }

      h2 {
        margin: 0 0 16px;
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
      }

      p {
        margin: 0 0 28px;
        font-size: 14px;
        color: #555;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-start;
        gap: 12px;
      }

      .btn-no {
        padding: 8px 24px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #fff;
        color: #3f51b5;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
        }
      }

      .btn-yes {
        padding: 8px 24px;
        border: none;
        border-radius: 4px;
        background: #3f51b5;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          background: #3949ab;
        }
      }
    `,
  ],
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
