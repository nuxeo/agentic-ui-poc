import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  DocumentDetailService,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  isMailSendError,
  permissionCreateMailFailureMessage,
} from '@nuxeo-satori/platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';

export interface ShareExternalDialogData {
  documentUid: string;
}

const PERMISSION_OPTIONS = [
  { value: 'Read', label: 'Read' },
  { value: 'ReadWrite', label: 'Edit' },
  { value: 'Everything', label: 'Manage everything' },
  { value: 'ReadCanCollect', label: 'Can collect' },
];

@Component({
  selector: 'lib-share-external-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './share-external-dialog.html',
  styles: [
    `
      :host {
        display: block;
        min-width: 480px;
      }

      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 8px !important;
      }

      .full-width {
        width: 100%;
      }

      .field-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #555;
        margin-bottom: 6px;
      }

      .date-fields {
        display: flex;
        gap: 16px;

        mat-form-field {
          flex: 1;
        }
      }

      .notify-section {
        margin-top: 4px;
      }

      .mail-hint {
        margin: 0 0 8px;
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.4;
      }

      mat-dialog-actions {
        display: flex;
        gap: 8px;
        padding: 8px 24px 16px;
      }

      .spacer {
        flex: 1;
      }

      .create-another-btn {
        background: #3f51b5 !important;
      }
    `,
  ],
})
export class ShareExternalDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ShareExternalDialogComponent, boolean>);
  private readonly data = inject<ShareExternalDialogData>(MAT_DIALOG_DATA);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  readonly permissionOptions = PERMISSION_OPTIONS;
  readonly mailHint = PERMISSION_NOTIFICATION_MAIL_HINT;

  email = '';
  permission = 'Read';
  beginDate: Date | null = null;
  endDate: Date | null = null;
  notifyComment = '';
  addAnother = false;
  private createdAny = false;

  cancel(): void {
    this.dialogRef.close(this.createdAny);
  }

  isValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) && !!this.endDate;
  }

  create(andAddAnother: boolean): void {
    if (!this.isValid() || this.saving()) return;
    this.addAnother = andAddAnother;
    this.saving.set(true);
    const email = this.email.trim();

    this.detailService
      .addExternalPermissionWithNotification(this.data.documentUid, {
        email,
        permission: this.permission,
        notify: true,
        begin: this.beginDate ? this.formatDate(this.beginDate) : null,
        end: this.endDate ? this.formatDate(this.endDate) : null,
        comment: this.notifyComment.trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          this.createdAny = true;
          const message = this.successMessage(result.notificationSent, result.notificationError);
          if (message) {
            this.snackBar.open(message, 'Dismiss', { duration: 7000 });
          }
          if (andAddAnother) {
            this.resetForm();
          } else {
            this.dialogRef.close(true);
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.snackBar.open(this.permissionErrorMessage(err), 'Dismiss', { duration: 7000 });
        },
      });
  }

  private successMessage(notificationSent: boolean, notificationError?: string): string | null {
    if (notificationError) {
      return notificationError;
    }
    if (notificationSent) {
      return 'Permission added and notification sent';
    }
    return null;
  }

  private permissionErrorMessage(err: unknown): string {
    if (isMailSendError(err)) {
      return permissionCreateMailFailureMessage();
    }
    const raw = (err as { error?: { message?: string } })?.error?.message?.trim();
    return raw || 'Could not share with external user';
  }

  private resetForm(): void {
    this.email = '';
    this.permission = 'Read';
    this.beginDate = null;
    this.endDate = null;
    this.notifyComment = '';
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
