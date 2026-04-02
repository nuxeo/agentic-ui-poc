import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

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
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Share With External User</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" placeholder="name@company.com" [(ngModel)]="email" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Right</mat-label>
        <mat-select [(ngModel)]="permission">
          @for (opt of permissionOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <div class="date-fields">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input matInput [matDatepicker]="fromPicker" [(ngModel)]="beginDate" />
          <mat-datepicker-toggle matIconSuffix [for]="fromPicker" />
          <mat-datepicker #fromPicker />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>To</mat-label>
          <input matInput [matDatepicker]="toPicker" [(ngModel)]="endDate" required />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker" />
          <mat-datepicker #toPicker />
        </mat-form-field>
      </div>

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
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <span class="spacer"></span>
      <button
        mat-flat-button
        color="primary"
        class="create-another-btn"
        [disabled]="!isValid() || saving()"
        (click)="create(true)"
      >
        @if (saving() && addAnother) {
          <mat-spinner diameter="18" />
        } @else {
          Create And Add Another
        }
      </button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!isValid() || saving()"
        (click)="create(false)"
      >
        @if (saving() && !addAnother) {
          <mat-spinner diameter="18" />
        } @else {
          Create
        }
      </button>
    </mat-dialog-actions>
  `,
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
  private readonly dialogRef = inject(MatDialogRef<ShareExternalDialogComponent>);
  private readonly data = inject<ShareExternalDialogData>(MAT_DIALOG_DATA);
  private readonly detailService = inject(DocumentDetailService);

  readonly saving = signal(false);
  readonly permissionOptions = PERMISSION_OPTIONS;

  email = '';
  permission = 'Read';
  beginDate: Date | null = null;
  endDate: Date | null = null;
  notifyComment = '';
  addAnother = false;

  isValid(): boolean {
    return this.email.includes('@') && !!this.endDate;
  }

  create(andAddAnother: boolean): void {
    if (!this.isValid() || this.saving()) return;
    this.addAnother = andAddAnother;
    this.saving.set(true);

    const params: {
      email: string;
      permission: string;
      notify: boolean;
      comment?: string;
      begin?: string | null;
      end: string;
    } = {
      email: this.email,
      permission: this.permission,
      notify: true,
      begin: this.beginDate ? this.formatDateISO(this.beginDate) : null,
      end: this.endDate ? this.formatDateISO(this.endDate) : '',
    };

    if (this.notifyComment.trim()) {
      params.comment = this.notifyComment.trim();
    }

    this.detailService.addExternalPermission(this.data.documentUid, params).subscribe({
      next: () => {
        this.saving.set(false);
        if (andAddAnother) {
          this.resetForm();
        } else {
          this.dialogRef.close(true);
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  private resetForm(): void {
    this.email = '';
    this.permission = 'Read';
    this.beginDate = null;
    this.endDate = null;
    this.notifyComment = '';
  }

  private formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const offset = -d.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const oh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const om = String(Math.abs(offset) % 60).padStart(2, '0');
    return `${y}-${m}-${day}T23:59:59${sign}${oh}:${om}`;
  }
}
