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
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.scss',
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
