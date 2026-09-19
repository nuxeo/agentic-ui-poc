import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import {
  DocumentDetailService,
  isPermissionDeniedError,
  PERMISSION_DENIED_MESSAGE,
} from '@nuxeo-satori/platform/nuxeo-client';

export interface CreateVersionDialogData {
  documentUid: string;
  documentTitle: string;
  currentMajor: number;
  currentMinor: number;
}

@Component({
  selector: 'lib-create-version-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './create-version-dialog.html',
  styleUrl: './create-version-dialog.scss',
})
export class CreateVersionDialogComponent {
  readonly data = inject<CreateVersionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CreateVersionDialogComponent>);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  increment: 'Major' | 'Minor' = 'Major';
  readonly saving = signal(false);

  create(): void {
    if (this.saving()) return;
    this.saving.set(true);

    this.detailService
      .createVersion(this.data.documentUid, this.increment)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.saving.set(false);
          const label =
            this.increment === 'Major'
              ? `${this.data.currentMajor + 1}.0`
              : `${this.data.currentMajor}.${this.data.currentMinor + 1}`;
          this.snackBar.open(`Version ${label} created`, 'OK', { duration: 3000 });
          this.dialogRef.close(doc);
        },
        error: (err) => {
          this.saving.set(false);
          const message = isPermissionDeniedError(err)
            ? PERMISSION_DENIED_MESSAGE
            : 'Failed to create version';
          this.snackBar.open(message, 'OK', { duration: 3000 });
        },
      });
  }
}
