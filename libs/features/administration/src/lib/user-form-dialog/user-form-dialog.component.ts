import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

import { NuxeoUser, UserService } from '@agentic-ui/shared/nuxeo-client';

export interface UserFormDialogData {
  mode: 'create' | 'edit';
  user?: NuxeoUser;
}

export interface UserFormDialogResult {
  mode: 'create' | 'edit';
  username: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  password?: string;
  groups: string[];
  /** When creating, submit again with a fresh dialog (Nuxeo Web UI parity for bulk entry). */
  createAnother?: boolean;
}

@Component({
  selector: 'lib-user-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './user-form-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .dialog-title {
        padding: 0 1.5rem 0.75rem;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.4;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 420px;
        min-height: 420px;
        max-height: 70vh;
        padding-top: 2.75rem;
        padding-bottom: 0.5rem;
        overflow-x: hidden;
      }
      .first-field {
        margin-top: 0.25rem;
      }
      .password-toggle {
        margin: 0.5rem 0 0.15rem;
      }
      .full {
        width: 100%;
      }
      .dialog-actions {
        gap: 0.5rem;
        padding: 0.75rem 1.5rem 1.25rem;
      }
      .spinner-wrap {
        display: flex;
        justify-content: center;
        padding: 0.75rem 0 1rem;
      }
      @media (max-width: 640px) {
        .form {
          min-width: 0;
        }
      }
    `,
  ],
})
export class UserFormDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(
    MatDialogRef<UserFormDialogComponent, UserFormDialogResult | undefined>,
  );
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);

  username = '';
  firstName = '';
  lastName = '';
  company = '';
  email = '';
  setUserPassword = false;
  password = '';
  confirmPassword = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  groups: string[] = [];
  groupOptions: { groupname: string; grouplabel: string }[] = [];
  groupSearchQuery = '';
  loadingGroupOptions = false;
  loadingGroups = true;
  private readonly groupSearchTerms = new Subject<string>();

  ngOnInit(): void {
    const u = this.data.user;
    if (this.data.mode === 'edit' && u) {
      this.username = u.id;
      this.firstName = u.properties.firstName ?? '';
      this.lastName = u.properties.lastName ?? '';
      this.company = u.properties.company ?? '';
      this.email = u.properties.email ?? '';
      this.groups = [...(u.properties.groups ?? [])];
    }
    this.userService
      .searchGroupsPaged('*', 200, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.groupOptions = (res.entries ?? []).map((g) => ({
            groupname: g.groupname,
            grouplabel: g.grouplabel || g.groupname,
          }));
          this.loadingGroups = false;
        },
        error: () => {
          this.loadingGroups = false;
        },
      });

    this.groupSearchTerms
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loadingGroupOptions = true;
          return this.userService.searchGroupsPaged(q || '*', 30, 0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          const selected = new Set(this.groups);
          this.groupOptions = (res.entries ?? [])
            .filter((g) => g.groupname && !selected.has(g.groupname))
            .map((g) => ({
              groupname: g.groupname,
              grouplabel: g.grouplabel || g.groupname,
            }));
          this.loadingGroupOptions = false;
        },
        error: () => {
          this.groupOptions = [];
          this.loadingGroupOptions = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.groupSearchTerms.complete();
  }

  onGroupSearch(q: string): void {
    this.groupSearchQuery = q;
    this.groupSearchTerms.next(q?.trim() ?? '');
  }

  onGroupInputFocus(): void {
    this.groupSearchTerms.next(this.groupSearchQuery?.trim() || '*');
  }

  onGroupSelected(event: MatAutocompleteSelectedEvent): void {
    const groupname = event.option.value as string;
    if (groupname && !this.groups.includes(groupname)) {
      this.groups = [...this.groups, groupname];
    }
    this.clearGroupSearch();
    event.option.deselect();
  }

  addGroupFromInput(event: MatChipInputEvent): void {
    const raw = (event.value ?? '').trim();
    if (!raw) {
      event.chipInput.clear();
      return;
    }
    if (!this.groups.includes(raw)) {
      this.groups = [...this.groups, raw];
    }
    event.chipInput.clear();
    this.clearGroupSearch();
  }

  removeGroup(groupname: string): void {
    this.groups = this.groups.filter((g) => g !== groupname);
    this.groupSearchTerms.next(this.groupSearchQuery?.trim() || '*');
  }

  private clearGroupSearch(): void {
    this.groupSearchQuery = '';
    this.groupOptions = [];
    this.groupSearchTerms.next('');
  }

  get canSave(): boolean {
    if (this.loadingGroups) {
      return false;
    }
    if (this.data.mode === 'edit' && !this.data.user) {
      return false;
    }
    if (!this.username.trim() || !this.email.trim()) {
      return false;
    }
    if (this.setUserPassword) {
      const trimmedPassword = this.password.trim();
      return trimmedPassword.length > 0 && trimmedPassword === this.confirmPassword.trim();
    }
    return true;
  }

  onSetUserPasswordChange(enabled: boolean): void {
    this.setUserPassword = enabled;
    if (!enabled) {
      this.password = '';
      this.confirmPassword = '';
    }
  }

  submit(createAnother = false): void {
    if (!this.canSave) {
      return;
    }
    const result: UserFormDialogResult = {
      mode: this.data.mode,
      username: this.username.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      company: this.company.trim(),
      email: this.email.trim(),
      groups: this.groups,
      ...(this.data.mode === 'create' ? { createAnother } : {}),
    };
    const trimmedPassword = this.password.trim();
    if (this.setUserPassword && trimmedPassword.length > 0) {
      result.password = trimmedPassword;
    }
    this.dialogRef.close(result);
  }
}
