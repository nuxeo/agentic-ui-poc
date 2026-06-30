import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  PrincipalPermissionsService,
  SettingsService,
  UserService,
  type LocalPermissionRow,
  type NuxeoGroup,
  type NuxeoUser,
  type PrincipalPermissionPage,
  type PrincipalPermissionRow,
} from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../../auth/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

const GROUP_PERM_PAGE_SIZE = 25;

@Component({
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly settingsService = inject(SettingsService);
  private readonly permService = inject(PrincipalPermissionsService);
  private readonly dialog = inject(MatDialog);
  private readonly changePasswordButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('changePasswordButton');

  readonly username = computed(() => this.auth.username() ?? 'Unknown user');
  readonly email = signal('—');
  readonly company = signal('—');
  readonly groups = signal<Array<{ identifier: string; label: string }>>([]);
  readonly groupsLoading = signal(true);
  readonly loading = signal(true);
  readonly localPermissions = signal<LocalPermissionRow[]>([]);
  readonly localPermissionsLoading = signal(true);
  readonly groupPermMap = signal<Record<string, PrincipalPermissionPage>>({});
  readonly groupPermLoading = signal<Record<string, boolean>>({});
  readonly adminPermissions = signal<LocalPermissionRow[]>([]);
  readonly adminPermissionsLoading = signal(true);

  readonly pageSize = 5;

  readonly adminPage = signal(0);
  readonly adminPagedRows = computed(() =>
    this.adminPermissions().slice(
      this.adminPage() * this.pageSize,
      (this.adminPage() + 1) * this.pageSize,
    ),
  );
  readonly adminTotalPages = computed(() =>
    Math.ceil(this.adminPermissions().length / this.pageSize),
  );

  constructor() {
    afterNextRender(() => {
      this.changePasswordButton().nativeElement.focus();
    });

    const userId = this.auth.username();
    if (!userId) {
      this.loading.set(false);
      this.localPermissionsLoading.set(false);
      this.adminPermissionsLoading.set(false);
      this.groupsLoading.set(false);
      this.groups.set([]);
      return;
    }

    this.userService
      .getUser(userId)
      .pipe(
        takeUntilDestroyed(),
        switchMap((user) => {
          this.email.set(user.properties.email || '—');
          this.company.set(user.properties.company || '—');
          this.loading.set(false);

          const groupIds = user.properties.groups ?? [];
          if (!groupIds.length) {
            this.groups.set([]);
            this.groupsLoading.set(false);
            this.loadAllGroupPerms(user);
            return of(null);
          }

          return forkJoin(
            groupIds.map((gid) =>
              this.userService.getGroup(gid).pipe(catchError(() => of(null as NuxeoGroup | null))),
            ),
          ).pipe(
            map((resolvedGroups) => ({
              user,
              groups: groupIds.map((gid, index) => ({
                identifier: gid,
                label: resolvedGroups[index]?.grouplabel?.trim() || gid,
              })),
            })),
          );
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            return;
          }
          this.groups.set(result.groups);
          this.groupsLoading.set(false);
          this.loadAllGroupPerms(result.user);
        },
        error: () => {
          this.groupsLoading.set(false);
          this.loading.set(false);
        },
      });

    this.settingsService
      .getLocalPermissions(userId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (rows) => {
          this.localPermissions.set(rows);
          this.localPermissionsLoading.set(false);
        },
        error: () => {
          this.localPermissionsLoading.set(false);
        },
      });

    this.settingsService
      .getAdminPermissions()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (rows) => {
          this.adminPermissions.set(rows);
          this.adminPermissionsLoading.set(false);
        },
        error: () => {
          this.adminPermissionsLoading.set(false);
        },
      });
  }

  openChangePasswordDialog(): void {
    this.dialog.open(ChangePasswordDialogComponent, { width: '440px' });
  }

  groupLink(_identifier: string): string {
    // TODO: Navigate to the Group details screen once that UI route is available.
    return '#';
  }

  groupPermPage(groupId: string): PrincipalPermissionPage | null {
    return this.groupPermMap()[groupId] ?? null;
  }

  isGroupPermLoading(groupId: string): boolean {
    return this.groupPermLoading()[groupId] === true;
  }

  groupPermRows(groupId: string): LocalPermissionRow[] {
    const page = this.groupPermPage(groupId);
    if (!page) {
      return [];
    }
    return page.rows.map((row) => this.toPermissionRow(row));
  }

  groupPermTotalPages(groupId: string): number {
    const page = this.groupPermPage(groupId);
    return page ? Math.max(1, page.numberOfPages) : 1;
  }

  groupPermCurrentPage(groupId: string): number {
    return this.groupPermPage(groupId)?.currentPageIndex ?? 0;
  }

  groupPermPrev(groupId: string): void {
    const current = this.groupPermCurrentPage(groupId);
    if (current > 0) {
      this.loadGroupPermPage(groupId, current - 1);
    }
  }

  groupPermNext(groupId: string): void {
    const current = this.groupPermCurrentPage(groupId);
    if (current < this.groupPermTotalPages(groupId) - 1) {
      this.loadGroupPermPage(groupId, current + 1);
    }
  }

  adminPrev(): void {
    this.adminPage.update((p) => Math.max(0, p - 1));
  }

  adminNext(): void {
    this.adminPage.update((p) => Math.min(this.adminTotalPages() - 1, p + 1));
  }

  private loadAllGroupPerms(user: NuxeoUser): void {
    const groupIds = user.properties.groups ?? [];
    this.groupPermMap.set({});
    const loading: Record<string, boolean> = {};
    for (const groupId of groupIds) {
      loading[groupId] = true;
    }
    this.groupPermLoading.set(loading);

    for (const groupId of groupIds) {
      this.loadGroupPermPage(groupId, 0);
    }
  }

  private loadGroupPermPage(groupId: string, pageIndex: number): void {
    this.groupPermLoading.update((state) => ({ ...state, [groupId]: true }));
    this.permService
      .listLocalPermissionRows(groupId, GROUP_PERM_PAGE_SIZE, pageIndex)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (page) => {
          this.groupPermMap.update((state) => ({ ...state, [groupId]: page }));
          this.groupPermLoading.update((state) => ({ ...state, [groupId]: false }));
        },
        error: () => {
          this.groupPermMap.update((state) => ({
            ...state,
            [groupId]: {
              rows: [],
              totalDocuments: 0,
              numberOfPages: 0,
              currentPageIndex: 0,
              currentPageSize: 0,
            },
          }));
          this.groupPermLoading.update((state) => ({ ...state, [groupId]: false }));
        },
      });
  }

  private toPermissionRow(row: PrincipalPermissionRow): LocalPermissionRow {
    const pathSuffix = row.documentPath ? ` (${row.documentPath})` : '';
    return {
      on: `${row.documentTitle}${pathSuffix}`,
      right: row.permission,
      timeFrame: this.timeFrameLabel(row),
      grantedBy: row.grantedBy ?? '—',
    };
  }

  private timeFrameLabel(row: PrincipalPermissionRow): string {
    if (!row.begin && !row.end) {
      return 'Permanent';
    }
    const begin = row.begin ? new Date(row.begin).toLocaleString() : '—';
    const end = row.end ? new Date(row.end).toLocaleString() : '—';
    return `${begin} – ${end}`;
  }
}
