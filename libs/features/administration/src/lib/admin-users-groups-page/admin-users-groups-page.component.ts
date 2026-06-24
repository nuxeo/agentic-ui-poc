import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NuxeoGroup, NuxeoUser, UserService } from '@agentic-ui/shared/nuxeo-client';

import { ConfirmDialogComponent, ConfirmDialogData } from '@agentic-ui/shared/ui';
import {
  GroupFormDialogComponent,
  GroupFormDialogData,
  GroupFormDialogResult,
} from '../group-form-dialog/group-form-dialog.component';
import {
  UserFormDialogComponent,
  UserFormDialogData,
  UserFormDialogResult,
} from '../user-form-dialog/user-form-dialog.component';

export interface RecentUserGroupRow {
  kind: 'user' | 'group';
  name: string;
  identifier: string;
  email: string;
}

@Component({
  selector: 'lib-admin-users-groups-page',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  templateUrl: './admin-users-groups-page.component.html',
  styleUrl: './admin-users-groups-page.component.scss',
})
export class AdminUsersGroupsPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly userColumns = ['username', 'name', 'email', 'groups', 'admin', 'actions'] as const;
  readonly groupColumns = ['groupname', 'label', 'members', 'actions'] as const;
  readonly recentColumns = ['name', 'identifier', 'email'] as const;

  users = signal<NuxeoUser[]>([]);
  groups = signal<NuxeoGroup[]>([]);
  readonly pageSize = 5;
  readonly usersPageIndex = signal(0);
  readonly groupsPageIndex = signal(0);
  readonly usersTotal = signal(0);
  readonly groupsTotal = signal(0);
  usersLoading = signal(false);
  groupsLoading = signal(false);
  usersError = signal<string | null>(null);
  groupsError = signal<string | null>(null);

  combinedSearchQuery = '';
  recentRows = signal<RecentUserGroupRow[]>([]);
  recentLoading = signal(false);
  /** Client-side pages for the merged "Recently Created" table (API returns two lists merged). */
  readonly recentPageIndex = signal(0);
  readonly recentPageSize = 5;
  readonly recentRowsPage = computed(() => {
    const all = this.recentRows();
    const start = this.recentPageIndex() * this.recentPageSize;
    return all.slice(start, start + this.recentPageSize);
  });

  ngOnInit(): void {
    this.runSearch();
    this.loadRecent();
  }

  runSearch(): void {
    this.usersPageIndex.set(0);
    this.groupsPageIndex.set(0);
    this.loadUsers();
    this.loadGroups();
  }

  loadRecent(): void {
    this.recentLoading.set(true);
    forkJoin({
      users: this.userService.searchUsersPaged('', 10, 0),
      groups: this.userService.searchGroupsPaged('', 10, 0),
    }).subscribe({
      next: ({ users, groups }) => {
        const rows: RecentUserGroupRow[] = [];
        for (const u of users.entries ?? []) {
          rows.push({
            kind: 'user',
            name: this.displayName(u),
            identifier: u.id,
            email: u.properties.email ?? '',
          });
        }
        for (const g of groups.entries ?? []) {
          rows.push({
            kind: 'group',
            name: g.grouplabel || g.groupname,
            identifier: g.groupname,
            email: '',
          });
        }
        this.recentPageIndex.set(0);
        this.recentRows.set(rows);
        this.recentLoading.set(false);
      },
      error: () => {
        this.recentPageIndex.set(0);
        this.recentRows.set([]);
        this.recentLoading.set(false);
      },
    });
  }

  loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);
    this.userService
      .searchUsersPaged(this.combinedSearchQuery, this.pageSize, this.usersPageIndex())
      .subscribe({
        next: (res) => {
          this.users.set(res.entries ?? []);
          this.usersTotal.set(res.totalSize ?? res.entries?.length ?? 0);
          this.usersLoading.set(false);
        },
        error: (err) => {
          this.usersError.set(err?.message ?? 'Could not load users.');
          this.usersLoading.set(false);
        },
      });
  }

  loadGroups(): void {
    this.groupsLoading.set(true);
    this.groupsError.set(null);
    this.userService
      .searchGroupsPaged(this.combinedSearchQuery, this.pageSize, this.groupsPageIndex())
      .subscribe({
        next: (res) => {
          this.groups.set(res.entries ?? []);
          this.groupsTotal.set(res.totalSize ?? res.entries?.length ?? 0);
          this.groupsLoading.set(false);
        },
        error: (err) => {
          this.groupsError.set(err?.message ?? 'Could not load groups.');
          this.groupsLoading.set(false);
        },
      });
  }

  onUsersPage(event: PageEvent): void {
    if (event.pageIndex === this.usersPageIndex()) return;
    this.usersPageIndex.set(event.pageIndex);
    this.loadUsers();
  }

  onGroupsPage(event: PageEvent): void {
    if (event.pageIndex === this.groupsPageIndex()) return;
    this.groupsPageIndex.set(event.pageIndex);
    this.loadGroups();
  }

  onRecentPage(event: PageEvent): void {
    if (event.pageIndex === this.recentPageIndex()) return;
    this.recentPageIndex.set(event.pageIndex);
  }

  openRecentRow(row: RecentUserGroupRow): void {
    if (row.kind === 'user') {
      this.openUserDetails(row.identifier);
      return;
    }
    this.openGroupDetails(row.identifier);
  }

  selectUser(user: NuxeoUser): void {
    this.openUserDetails(user.id);
  }

  selectGroup(group: NuxeoGroup): void {
    this.openGroupDetails(group.groupname);
  }

  private openUserDetails(userId: string): void {
    this.router.navigate(['/administration/users-groups/user', userId]);
  }

  private openGroupDetails(groupId: string): void {
    this.router.navigate(['/administration/users-groups/group', groupId]);
  }

  private afterMutation(): void {
    this.runSearch();
    this.loadRecent();
  }

  openCreateUser(): void {
    this.openCreateUserDialog();
  }

  private openCreateUserDialog(): void {
    this.dialog
      .open<UserFormDialogComponent, UserFormDialogData, UserFormDialogResult | undefined>(
        UserFormDialogComponent,
        {
          width: '480px',
          maxHeight: '90vh',
          data: { mode: 'create' },
        },
      )
      .afterClosed()
      .subscribe((r) => {
        if (!r || r.mode !== 'create') return;
        const invited = !r.password;
        this.userService
          .createUser({
            username: r.username,
            firstName: r.firstName,
            lastName: r.lastName,
            company: r.company,
            email: r.email,
            password: r.password,
            groups: r.groups,
          })
          .subscribe({
            next: () => {
              this.snackBar.open(invited ? 'Invitation sent' : 'User created', 'Dismiss', {
                duration: 3000,
              });
              this.afterMutation();
              if (r.createAnother) {
                this.openCreateUserDialog();
              }
            },
            error: (e) =>
              this.snackBar.open(this.createUserErrorMessage(e, invited), 'Dismiss', {
                duration: 7000,
              }),
          });
      });
  }

  openEditUser(user: NuxeoUser): void {
    this.dialog
      .open<UserFormDialogComponent, UserFormDialogData, UserFormDialogResult | undefined>(
        UserFormDialogComponent,
        {
          width: '480px',
          maxHeight: '90vh',
          data: { mode: 'edit', user },
        },
      )
      .afterClosed()
      .subscribe((r) => {
        if (!r || r.mode !== 'edit') return;
        this.userService
          .updateUser(user.id, {
            firstName: r.firstName,
            lastName: r.lastName,
            company: r.company,
            email: r.email,
            password: r.password,
            groups: r.groups,
          })
          .subscribe({
            next: () => {
              this.snackBar.open('User updated', 'Dismiss', { duration: 3000 });
              this.afterMutation();
            },
            error: (e) =>
              this.snackBar.open(e?.error?.message ?? 'Update failed', 'Dismiss', {
                duration: 5000,
              }),
          });
      });
  }

  confirmDeleteUser(user: NuxeoUser): void {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean | undefined>(
        ConfirmDialogComponent,
        {
          width: '400px',
          data: {
            title: 'Delete user',
            message: `Delete user "${user.id}"? This cannot be undone.`,
            confirmLabel: 'Delete',
          },
        },
      )
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted', 'Dismiss', { duration: 3000 });
            this.afterMutation();
          },
          error: (e) =>
            this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Dismiss', { duration: 5000 }),
        });
      });
  }

  openCreateGroup(): void {
    this.openCreateGroupDialog();
  }

  private openCreateGroupDialog(): void {
    this.dialog
      .open<GroupFormDialogComponent, GroupFormDialogData, GroupFormDialogResult | undefined>(
        GroupFormDialogComponent,
        { width: '480px', data: { mode: 'create' } },
      )
      .afterClosed()
      .subscribe((r) => {
        if (!r || r.mode !== 'create') return;
        this.userService
          .createGroup({
            groupname: r.groupname,
            grouplabel: r.grouplabel,
            memberUsers: r.memberUsers,
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Group created', 'Dismiss', { duration: 3000 });
              this.afterMutation();
              if (r.createAnother) {
                this.openCreateGroupDialog();
              }
            },
            error: (e) =>
              this.snackBar.open(e?.error?.message ?? 'Create failed', 'Dismiss', {
                duration: 5000,
              }),
          });
      });
  }

  openEditGroup(group: NuxeoGroup): void {
    this.dialog
      .open<GroupFormDialogComponent, GroupFormDialogData, GroupFormDialogResult | undefined>(
        GroupFormDialogComponent,
        { width: '480px', data: { mode: 'edit', group } },
      )
      .afterClosed()
      .subscribe((r) => {
        if (!r || r.mode !== 'edit') return;
        this.userService
          .updateGroup(group.groupname, {
            grouplabel: r.grouplabel,
            memberUsers: r.memberUsers,
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Group updated', 'Dismiss', { duration: 3000 });
              this.afterMutation();
            },
            error: (e) =>
              this.snackBar.open(e?.error?.message ?? 'Update failed', 'Dismiss', {
                duration: 5000,
              }),
          });
      });
  }

  confirmDeleteGroup(group: NuxeoGroup): void {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean | undefined>(
        ConfirmDialogComponent,
        {
          width: '400px',
          data: {
            title: 'Delete group',
            message: `Delete group "${group.groupname}"?`,
            confirmLabel: 'Delete',
          },
        },
      )
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.userService.deleteGroup(group.groupname).subscribe({
          next: () => {
            this.snackBar.open('Group deleted', 'Dismiss', { duration: 3000 });
            this.afterMutation();
          },
          error: (e) =>
            this.snackBar.open(e?.error?.message ?? 'Delete failed', 'Dismiss', { duration: 5000 }),
        });
      });
  }

  displayName(user: NuxeoUser): string {
    const fn = user.properties.firstName?.trim() ?? '';
    const ln = user.properties.lastName?.trim() ?? '';
    const joined = `${fn} ${ln}`.trim();
    return joined || user.id;
  }

  groupsLabel(user: NuxeoUser): string {
    return (user.properties.groups ?? []).join(', ');
  }

  membersPreview(group: NuxeoGroup): string {
    const m = group.memberUsers ?? [];
    if (m.length <= 3) return m.join(', ');
    return `${m.slice(0, 3).join(', ')} +${m.length - 3}`;
  }

  private createUserErrorMessage(err: unknown, invited: boolean): string {
    const raw = (err as { error?: { message?: string } })?.error?.message?.trim();
    if (invited && raw?.toLowerCase().includes('sending a mail')) {
      return 'Invitation could not be sent. Configure outbound mail (SMTP) on the Nuxeo server.';
    }
    return raw || 'Create failed';
  }
}
