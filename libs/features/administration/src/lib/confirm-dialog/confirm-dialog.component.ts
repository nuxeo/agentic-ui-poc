import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
}

@Component({
  selector: 'lib-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="msg">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end" class="actions">
      <button type="button" mat-button mat-dialog-close>Cancel</button>
      <button type="button" mat-flat-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .msg {
        padding-top: 0.35rem;
        max-width: 28rem;
        line-height: 1.5;
      }
      .actions {
        gap: 0.5rem;
        padding: 0.75rem 1.5rem 1.25rem;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
