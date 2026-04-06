import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ReplaceAttachmentDialogData {
  fileName: string;
}

@Component({
  selector: 'lib-replace-attachment-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="replace-dialog">
      <h2>Replace File</h2>

      <label
        class="upload-zone"
        [class.has-file]="selectedFile()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        @if (selectedFile(); as file) {
          <span class="file-chosen">{{ file.name }}</span>
        } @else {
          <span class="upload-link">Upload main file</span>
        }
        <input #fileInput type="file" hidden (change)="onFileSelected($event)" />
      </label>

      <div class="dialog-actions">
        <button class="btn-cancel" (click)="cancel()">Cancel</button>
        <button class="btn-replace" [disabled]="!selectedFile()" (click)="confirm()">
          Replace
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .replace-dialog {
        padding: 28px 32px;
      }

      h2 {
        margin: 0 0 24px;
        font-size: 20px;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }

      .upload-zone {
        display: block;
        border: 2px dashed var(--mat-sys-outline-variant);
        border-radius: 6px;
        padding: 32px 16px;
        text-align: center;
        cursor: pointer;
        transition:
          border-color 0.15s,
          background 0.15s;
        margin-bottom: 24px;

        &:hover,
        &.dragover {
          border-color: var(--mat-sys-primary);
          background: var(--mat-sys-primary-container);
        }

        &.has-file {
          border-color: var(--mat-sys-primary);
          background: var(--mat-sys-primary-container);
        }
      }

      .upload-link {
        font-size: 14px;
        color: var(--mat-sys-primary);
        text-decoration: underline;
        cursor: pointer;
      }

      .file-chosen {
        font-size: 14px;
        color: var(--mat-sys-on-surface);
        font-weight: 500;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-start;
        gap: 12px;
      }

      .btn-cancel {
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

      .btn-replace {
        padding: 8px 24px;
        border: none;
        border-radius: 4px;
        background: #3f51b5;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;

        &:disabled {
          background: #c5cae9;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          background: #3949ab;
        }
      }
    `,
  ],
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
