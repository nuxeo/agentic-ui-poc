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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import {
  DocumentDetailService,
  UserGroupSuggestion,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  isMailSendError,
  permissionCreateMailFailureMessage,
} from '@nuxeo-satori/platform/nuxeo-client';

export interface AddPermissionDialogData {
  documentUid: string;
}

const PERMISSION_OPTIONS = [
  { value: 'Read', label: 'Read' },
  { value: 'ReadWrite', label: 'Edit' },
  { value: 'Everything', label: 'Manage everything' },
  { value: 'ReadCanCollect', label: 'Can collect' },
];

@Component({
  selector: 'lib-add-permission-dialog',
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
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Add a Permission</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>User / Group</mat-label>
        <input
          matInput
          placeholder="Search for users and groups"
          [ngModel]="searchText"
          (ngModelChange)="onSearchChange($event)"
          [matAutocomplete]="userAuto"
          required
        />
        <mat-autocomplete
          #userAuto="matAutocomplete"
          (optionSelected)="onUserSelected($event.option.value)"
          [displayWith]="displayUser"
        >
          @for (suggestion of suggestions(); track suggestion.id) {
            <mat-option [value]="suggestion">
              <mat-icon class="suggestion-icon">
                {{ suggestion.type === 'USER_TYPE' ? 'person' : 'group' }}
              </mat-icon>
              {{ suggestion.displayLabel }}
              <span class="suggestion-id">({{ suggestion.id }})</span>
            </mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Right</mat-label>
        <mat-select [(ngModel)]="permission">
          @for (opt of permissionOptions; track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <div class="time-frame-section">
        <label class="field-label">Time Frame</label>
        <mat-radio-group [(ngModel)]="timeFrame" class="time-frame-radios">
          <mat-radio-button value="permanent">Permanent</mat-radio-button>
          <mat-radio-button value="date-based">Date-based</mat-radio-button>
        </mat-radio-group>
      </div>

      <div class="date-fields">
        <mat-form-field appearance="outline">
          <mat-label>From</mat-label>
          <input
            matInput
            [matDatepicker]="fromPicker"
            [(ngModel)]="beginDate"
            [disabled]="timeFrame === 'permanent'"
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
            [disabled]="timeFrame === 'permanent'"
          />
          <mat-datepicker-toggle matIconSuffix [for]="toPicker" />
          <mat-datepicker #toPicker />
        </mat-form-field>
      </div>

      <mat-checkbox [(ngModel)]="sendNotify" class="notify-checkbox">
        Send an email to notify user
      </mat-checkbox>

      @if (sendNotify) {
        <p class="mail-hint">{{ mailHint }}</p>
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
        class="create-another-btn"
        [disabled]="!selectedUser || saving()"
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
        [disabled]="!selectedUser || saving()"
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

      .suggestion-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 8px;
        vertical-align: middle;
        color: #666;
      }

      .suggestion-id {
        color: #999;
        font-size: 12px;
        margin-left: 4px;
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

      .create-another-btn {
        background: #3f51b5 !important;
      }
    `,
  ],
})
export class AddPermissionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AddPermissionDialogComponent>);
  private readonly data = inject<AddPermissionDialogData>(MAT_DIALOG_DATA);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();

  readonly suggestions = signal<UserGroupSuggestion[]>([]);
  readonly saving = signal(false);

  readonly permissionOptions = PERMISSION_OPTIONS;
  readonly mailHint = PERMISSION_NOTIFICATION_MAIL_HINT;

  searchText = '';
  selectedUser: UserGroupSuggestion | null = null;
  permission = 'Read';
  timeFrame: 'permanent' | 'date-based' = 'permanent';
  beginDate: Date | null = null;
  endDate: Date | null = null;
  sendNotify = true;
  notifyComment = '';
  addAnother = false;

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          term.length >= 1 ? this.detailService.searchUsersGroups(term) : of([]),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((results) => this.suggestions.set(results));
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.selectedUser = null;
    this.searchSubject.next(value);
  }

  onUserSelected(suggestion: UserGroupSuggestion): void {
    this.selectedUser = suggestion;
    this.searchText = suggestion.displayLabel;
  }

  displayUser(suggestion: UserGroupSuggestion | string): string {
    if (!suggestion) return '';
    if (typeof suggestion === 'string') return suggestion;
    return suggestion.displayLabel;
  }

  create(andAddAnother: boolean): void {
    if (!this.selectedUser || this.saving()) return;
    this.addAnother = andAddAnother;
    this.saving.set(true);

    this.detailService
      .addPermissionWithNotification(this.data.documentUid, {
        username: this.selectedUser.id,
        permission: this.permission,
        notify: this.sendNotify,
        comment: this.sendNotify && this.notifyComment.trim() ? this.notifyComment.trim() : '',
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
          if (andAddAnother) {
            if (message) {
              this.snackBar.open(message, 'Dismiss', { duration: 7000 });
            }
            this.resetForm();
          } else {
            if (message) {
              this.snackBar.open(message, 'Dismiss', { duration: 7000 });
            }
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
    if (this.sendNotify && notificationSent) {
      return 'Permission added and notification sent';
    }
    if (this.sendNotify) {
      return null;
    }
    return null;
  }

  private resetForm(): void {
    this.searchText = '';
    this.selectedUser = null;
    this.permission = 'Read';
    this.timeFrame = 'permanent';
    this.beginDate = null;
    this.endDate = null;
    this.notifyComment = '';
    this.suggestions.set([]);
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private permissionErrorMessage(err: unknown): string {
    if (isMailSendError(err)) {
      return permissionCreateMailFailureMessage();
    }
    const raw = (err as { error?: { message?: string } })?.error?.message?.trim();
    return raw || 'Could not add permission';
  }
}
