import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ShareDialogData {
  title: string;
  url: string;
}

@Component({
  selector: 'lib-share-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>Share the Document</h2>

    <mat-dialog-content>
      <p class="share-subtitle">Internal Access link to {{ data.title }}.</p>
      <div class="share-link-row">
        <input class="share-link-input" readonly [value]="data.url" #linkInput />
        <button mat-icon-button class="copy-btn" (click)="copyLink()" aria-label="Copy link">
          <mat-icon>link</mat-icon>
        </button>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 420px;
      }

      .share-subtitle {
        margin: 0 0 16px;
        font-size: 14px;
        color: #555;
      }

      .share-link-row {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 4px 4px 4px 12px;
        background: #fafafa;
      }

      .share-link-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 13px;
        color: var(--mat-sys-on-surface);
        outline: none;
        min-width: 0;
        font-family: inherit;
      }

      .copy-btn {
        flex-shrink: 0;
        color: var(--mat-sys-primary);
      }

      mat-dialog-actions {
        padding: 8px 24px 16px;
      }
    `,
  ],
})
export class ShareDialogComponent {
  readonly data = inject<ShareDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ShareDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  copyLink(): void {
    navigator.clipboard.writeText(this.data.url).then(
      () => this.snackBar.open('Link copied to clipboard', 'OK', { duration: 3000 }),
      () => this.snackBar.open('Failed to copy link', 'OK', { duration: 3000 }),
    );
  }
}
