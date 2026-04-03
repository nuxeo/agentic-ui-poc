import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
  memberGroups: string[];
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
  private readonly dialogRef = inject(MatDialogRef<GroupFormDialogComponent, GroupFormDialogResult | undefined>);
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

  /** Nested group ids (memberGroups). */
  memberGroupNames: string[] = [];
  groupSearchQuery = '';
  filteredGroups: NuxeoGroup[] = [];
  private readonly groupSearchTerms = new Subject<string>();

  ngOnInit(): void {
    const g = this.data.group;
    if (this.data.mode === 'edit' && g) {
      this.groupname = g.groupname;
      this.grouplabel = g.grouplabel ?? '';
      this.memberUsernames = [...(g.memberUsers ?? [])];
      this.memberGroupNames = [...(g.memberGroups ?? [])];
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

    this.groupSearchTerms
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => {
          const query = (q ?? '').trim() || '*';
          return this.userService.searchGroupsPaged(query, 30, 0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          const taken = new Set(this.memberGroupNames);
          const selfName = this.groupname.trim();
          this.filteredGroups = (res.entries ?? []).filter(
            (g) => g.groupname && !taken.has(g.groupname) && g.groupname !== selfName,
          );
        },
        error: () => {
          this.filteredGroups = [];
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

  onGroupSearch(q: string): void {
    this.groupSearchQuery = q;
    this.groupSearchTerms.next(q);
  }

  onNestedGroupInputFocus(): void {
    this.groupSearchTerms.next(this.groupSearchQuery);
  }

  onGroupSelected(event: MatAutocompleteSelectedEvent): void {
    const g = event.option.value as NuxeoGroup;
    if (g?.groupname && !this.memberGroupNames.includes(g.groupname)) {
      this.memberGroupNames = [...this.memberGroupNames, g.groupname];
    }
    this.resetGroupSearchState();
    event.option.deselect();
  }

  addNestedGroupFromInput(event: MatChipInputEvent): void {
    const raw = (event.value ?? '').trim();
    if (!raw) {
      event.chipInput.clear();
      return;
    }
    if (raw === this.groupname.trim()) {
      event.chipInput.clear();
      return;
    }
    if (!this.memberGroupNames.includes(raw)) {
      this.memberGroupNames = [...this.memberGroupNames, raw];
    }
    event.chipInput.clear();
    this.resetGroupSearchState();
  }

  removeNestedGroup(id: string): void {
    this.memberGroupNames = this.memberGroupNames.filter((x) => x !== id);
    this.groupSearchTerms.next(this.groupSearchQuery);
  }

  private resetGroupSearchState(): void {
    this.groupSearchQuery = '';
    this.filteredGroups = [];
    this.groupSearchTerms.next('');
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
      memberGroups: [...this.memberGroupNames],
      ...(this.data.mode === 'create' ? { createAnother } : {}),
    });
  }
}
