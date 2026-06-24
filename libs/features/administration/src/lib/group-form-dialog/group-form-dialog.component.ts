import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { NuxeoGroup, NuxeoUser, UserService } from '@agentic-ui/shared/nuxeo-client';

export interface GroupFormDialogData {
  mode: 'create' | 'edit';
  group?: NuxeoGroup;
}

export interface GroupFormDialogResult {
  mode: 'create' | 'edit';
  groupname: string;
  grouplabel: string;
  memberUsers: string[];
  /** When creating, submit again with a fresh dialog (Nuxeo Web UI parity for bulk entry). */
  createAnother?: boolean;
}

@Component({
  selector: 'lib-group-form-dialog',
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
  ],
  templateUrl: './group-form-dialog.component.html',
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
        padding-top: 2.75rem;
        padding-bottom: 0.5rem;
        overflow-x: hidden;
      }
      .first-field {
        margin-top: 0.25rem;
      }
      .full {
        width: 100%;
      }
      .dialog-actions {
        gap: 0.5rem;
        padding: 0.75rem 1.5rem 1.25rem;
      }
      .member-opt {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        line-height: 1.25;
      }
      .member-opt__id {
        font-weight: 500;
      }
      .member-opt__meta {
        font-size: 0.8125rem;
        opacity: 0.75;
      }
      @media (max-width: 640px) {
        .form {
          min-width: 0;
        }
      }
    `,
  ],
})
export class GroupFormDialogComponent implements OnInit {
  private readonly dialogRef = inject(
    MatDialogRef<GroupFormDialogComponent, GroupFormDialogResult | undefined>,
  );
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = inject<GroupFormDialogData>(MAT_DIALOG_DATA);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  groupname = '';
  grouplabel = '';
  /** Selected member usernames (ids). */
  memberUsernames: string[] = [];
  userSearchQuery = '';
  filteredUsers: NuxeoUser[] = [];

  private readonly searchTerms = new Subject<string>();

  ngOnInit(): void {
    const g = this.data.group;
    if (this.data.mode === 'edit' && g) {
      this.groupname = g.groupname;
      this.grouplabel = g.grouplabel ?? '';
      this.memberUsernames = [...(g.memberUsers ?? [])];
    }

    this.searchTerms
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          const query = (q ?? '').trim() || '*';
          return this.userService.searchUsersPaged(query, 30, 0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          const ids = new Set(this.memberUsernames);
          this.filteredUsers = (res.entries ?? []).filter((u) => u.id && !ids.has(u.id));
        },
        error: () => {
          this.filteredUsers = [];
        },
      });
  }

  onUserSearch(q: string): void {
    this.userSearchQuery = q;
    this.searchTerms.next(q);
  }

  onMemberInputFocus(): void {
    // Ensure autocomplete calls API even when user reopens with the same query.
    this.searchTerms.next(this.userSearchQuery);
  }

  userDisplayLine(u: NuxeoUser): string {
    const fn = u.properties?.firstName?.trim() ?? '';
    const ln = u.properties?.lastName?.trim() ?? '';
    const name = `${fn} ${ln}`.trim();
    const email = u.properties?.email ?? '';
    if (name && email) return `${name} · ${email}`;
    return name || email || '';
  }

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const u = event.option.value as NuxeoUser;
    if (u?.id && !this.memberUsernames.includes(u.id)) {
      this.memberUsernames = [...this.memberUsernames, u.id];
    }
    this.resetSearchState();
    event.option.deselect();
  }

  addMemberFromInput(event: MatChipInputEvent): void {
    const raw = (event.value ?? '').trim();
    if (!raw) {
      event.chipInput.clear();
      return;
    }
    if (!this.memberUsernames.includes(raw)) {
      this.memberUsernames = [...this.memberUsernames, raw];
    }
    event.chipInput.clear();
    this.resetSearchState();
  }

  removeMember(id: string): void {
    this.memberUsernames = this.memberUsernames.filter((x) => x !== id);
    this.searchTerms.next(this.userSearchQuery);
  }

  private resetSearchState(): void {
    this.userSearchQuery = '';
    this.filteredUsers = [];
    // Break distinctUntilChanged cache for reliable subsequent calls.
    this.searchTerms.next('');
  }

  submit(createAnother = false): void {
    if (this.data.mode === 'create' && !this.groupname.trim()) {
      return;
    }
    this.dialogRef.close({
      mode: this.data.mode,
      groupname: this.groupname.trim(),
      grouplabel: this.grouplabel.trim(),
      memberUsers: [...this.memberUsernames],
      ...(this.data.mode === 'create' ? { createAnother } : {}),
    });
  }
}
