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
  templateUrl: './add-permission-dialog.html',
  styleUrl: './add-permission-dialog.scss',
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
