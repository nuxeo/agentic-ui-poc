import { Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SettingsService, UserService, type LocalPermissionRow } from '@agentic-ui/shared/nuxeo-client';

import { AuthService } from '../../auth/auth.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

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
  private readonly dialog = inject(MatDialog);
  private readonly changePasswordButton = viewChild.required<ElementRef<HTMLButtonElement>>('changePasswordButton');

  readonly username = computed(() => this.auth.username() ?? 'Unknown user');
  readonly email = signal('—');
  readonly company = signal('—');
  readonly group = signal<{ identifier: string; label: string } | null>(null);
  readonly groupsLoading = signal(true);
  readonly loading = signal(true);
  readonly localPermissions = signal<LocalPermissionRow[]>([]);
  readonly localPermissionsLoading = signal(true);
  readonly adminPermissions = signal<LocalPermissionRow[]>([]);
  readonly adminPermissionsLoading = signal(true);

  readonly pageSize = 5;

  readonly adminPage = signal(0);
  readonly adminPagedRows = computed(() =>
    this.adminPermissions().slice(this.adminPage() * this.pageSize, (this.adminPage() + 1) * this.pageSize),
  );
  readonly adminTotalPages = computed(() => Math.ceil(this.adminPermissions().length / this.pageSize));

  constructor() {
    afterNextRender(() => {
      this.changePasswordButton().nativeElement.focus();
    });

    const userId = this.auth.username();
    if (!userId) {
      this.loading.set(false);
      this.localPermissionsLoading.set(false);
      this.adminPermissionsLoading.set(false);
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
          const identifier = (user.properties.groups ?? [])[0] ?? '';
          if (!identifier) {
            return of({ identifier: '', label: '' });
          }
          return this.userService.getGroup(identifier).pipe(
            catchError(() => of({ grouplabel: identifier, groupname: identifier })),
            switchMap((g) => of({ identifier, label: (g as { grouplabel?: string }).grouplabel?.trim() || identifier })),
          );
        }),
      )
      .subscribe({
        next: (groupData) => {
          this.group.set(groupData.identifier ? groupData : null);
          this.groupsLoading.set(false);
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

  adminPrev(): void { this.adminPage.update((p) => Math.max(0, p - 1)); }
  adminNext(): void { this.adminPage.update((p) => Math.min(this.adminTotalPages() - 1, p + 1)); }

}
