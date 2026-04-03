import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  email: string;
  password?: string;
  groups: string[];
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
  ],
  templateUrl: './user-form-dialog.component.html',
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 420px;
        padding-top: 0.35rem;
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
export class UserFormDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent, UserFormDialogResult | undefined>);
  readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);

  username = '';
  firstName = '';
  lastName = '';
  email = '';
  password = '';
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
      this.email = u.properties.email ?? '';
      this.groups = [...(u.properties.groups ?? [])];
    }
    this.userService.searchGroupsPaged('*', 200, 0).subscribe({
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

  submit(): void {
    if (this.data.mode === 'create') {
      if (!this.username.trim() || !this.password) {
        return;
      }
    }
    const result: UserFormDialogResult = {
      mode: this.data.mode,
      username: this.username.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      groups: this.groups,
    };
    if (this.password.length > 0) {
      result.password = this.password;
    }
    this.dialogRef.close(result);
  }
}
