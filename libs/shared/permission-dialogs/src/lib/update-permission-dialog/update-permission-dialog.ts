import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { switchMap } from 'rxjs';
import {
  DocumentDetailService,
  NuxeoAce,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  isMailSendError,
  permissionUpdateMailFailureMessage,
} from '@nuxeo-satori/platform/nuxeo-client';

export interface UpdatePermissionDialogData {
  documentUid: string;
  ace: NuxeoAce;
  isExternal?: boolean;
}

const PERMISSION_OPTIONS = [
  { value: 'Read', label: 'Read' },
  { value: 'ReadWrite', label: 'Edit' },
  { value: 'Everything', label: 'Manage everything' },
  { value: 'ReadCanCollect', label: 'Can collect' },
];

@Component({
  selector: 'lib-update-permission-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Update Permission</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Right</mat-label>
        <mat-select [(ngModel)]="permission">
          @for (opt of permissionOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (!isExternal) {
        <div class="time-frame-section">
          <label class="field-label">Time Frame</label>
          <mat-radio-group [(ngModel)]="timeFrame" class="time-frame-radios">
            <mat-radio-button value="permanent">Permanent</mat-radio-button>
            <mat-radio-button value="date-based">Date-based</mat-radio-button>
          </mat-radio-group>
        </div>
      }

      <div class="date-fields">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input
            matInput
            [matDatepicker]="fromPicker"
            [(ngModel)]="beginDate"
            [disabled]="!isExternal && timeFrame === 'permanent'"
          />
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker" />
          <mat-datepicker #fromPicker />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>To</mat-label>
          <input
            matInput
            [matDatepicker]="toPicker"
            [(ngModel)]="endDate"
            [disabled]="!isExternal && timeFrame === 'permanent'"
            [required]="isExternal"
          />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker" />
          <mat-datepicker #toPicker />
        </mat-form-field>
      </div>

      @if (!isExternal) {
        <mat-checkbox [(ngModel)]="sendNotify" class="notify-checkbox">
          Send an email to notify user
        </mat-checkbox>
      }

      @if (!isExternal && sendNotify) {
        <p class="mail-hint">{{ mailHint }}</p>
      }

      @if (isExternal || sendNotify) {
        <div class="notify-section">
          <label class="field-label">Notification email</label>
          <mat-form-field appearance="outline" class="full-width">
            <textarea
              matInput
              [(ngModel)]="notifyComment"
              rows="2"
              placeholder="Hi! Could you comment on this document and..."
            ></textarea>
          </mat-form-field>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <span class="spacer"></span>
      <button
        mat-flat-button
        color="primary"
        [disabled]="saving() || (isExternal && !endDate)"
        (click)="update()"
      >
        @if (saving()) {
          <mat-spinner diameter="18" />
        } @else {
          Update
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 440px;
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

      .time-frame-section {
        margin-bottom: 8px;
      }

      .time-frame-radios {
        display: flex;
        gap: 24px;
      }

      .date-fields {
        display: flex;
        gap: 16px;

        mat-form-field {
          flex: 1;
        }
      }

      .notify-checkbox {
        margin: 4px 0 8px;
      }

      .mail-hint {
        margin: 0 0 8px;
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.4;
      }

      .notify-section {
        margin-top: 4px;
      }

      mat-dialog-actions {
        display: flex;
        gap: 8px;
        padding: 8px 24px 16px;
      }

      .spacer {
        flex: 1;
      }
    `,
  ],
})
export class UpdatePermissionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UpdatePermissionDialogComponent>);
  private readonly data = inject<UpdatePermissionDialogData>(MAT_DIALOG_DATA);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly saving = signal(false);
  readonly permissionOptions = PERMISSION_OPTIONS;
  readonly mailHint = PERMISSION_NOTIFICATION_MAIL_HINT;
  readonly isExternal: boolean;

  permission: string;
  timeFrame: 'permanent' | 'date-based';
  beginDate: Date | null;
  endDate: Date | null;
  sendNotify = false;
  notifyComment = '';

  constructor() {
    const ace = this.data.ace;
    this.isExternal = this.data.isExternal ?? false;
    this.permission = ace.permission;
    this.timeFrame = ace.begin || ace.end ? 'date-based' : 'permanent';
    this.beginDate = ace.begin ? new Date(ace.begin) : null;
    this.endDate = ace.end ? new Date(ace.end) : null;
  }

  update(): void {
    if (this.saving()) return;
    this.saving.set(true);

    if (this.isExternal) {
      this.updateExternal();
    } else {
      this.updateLocal();
    }
  }

  private updateLocal(): void {
    this.detailService
      .replacePermissionWithNotification(this.data.documentUid, {
        id: this.data.ace.id,
        username: this.data.ace.username,
        permission: this.permission,
        notify: this.sendNotify,
        comment: this.sendNotify && this.notifyComment.trim() ? this.notifyComment.trim() : null,
        begin:
          this.timeFrame === 'date-based' && this.beginDate
            ? this.formatDate(this.beginDate)
            : null,
        end: this.timeFrame === 'date-based' && this.endDate ? this.formatDate(this.endDate) : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          const message = this.successMessage(result.notificationSent, result.notificationError);
          if (message) {
            this.snackBar.open(message, 'Dismiss', { duration: 7000 });
          }
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving.set(false);
          this.snackBar.open(this.permissionErrorMessage(err), 'Dismiss', { duration: 7000 });
        },
      });
  }

  private updateExternal(): void {
    const ace = this.data.ace;
    const email = ace.username.replace(/^transient\//, '');

    this.detailService
      .removePermission(this.data.documentUid, {
        user: ace.username,
        permission: ace.permission,
        acl: 'local',
      })
      .pipe(
        switchMap(() =>
          this.detailService.addExternalPermissionWithNotification(this.data.documentUid, {
            email,
            permission: this.permission,
            begin: this.beginDate ? this.formatDate(this.beginDate) : null,
            end: this.endDate ? this.formatDate(this.endDate) : null,
            notify: true,
            comment: this.notifyComment.trim() || undefined,
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          const message = this.successMessage(result.notificationSent, result.notificationError);
          if (message) {
            this.snackBar.open(message, 'Dismiss', { duration: 7000 });
          }
          this.dialogRef.close(true);
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
    if (this.sendNotify && notificationSent) {
      return 'Permission updated and notification sent';
    }
    if (this.isExternal && notificationSent) {
      return 'Permission updated and notification sent';
    }
    return null;
  }

  private permissionErrorMessage(err: unknown): string {
    if (isMailSendError(err)) {
      return permissionUpdateMailFailureMessage();
    }
    const raw = (err as { error?: { message?: string } })?.error?.message?.trim();
    return raw || 'Could not update permission';
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
