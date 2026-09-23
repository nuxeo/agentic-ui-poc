import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import {
  DocumentDetailService,
  PrincipalPermissionsService,
  UserService,
  type NuxeoGroup,
  type NuxeoUser,
  type PrincipalPermissionPage,
  type PrincipalPermissionRow,
} from '@nuxeo-satori/platform/nuxeo-client';
import { testTranslateModule } from '@agentic-ui/testing/i18n';

import { AdminUserDetailsPageComponent } from './admin-user-details-page.component';

describe('AdminUserDetailsPageComponent', () => {
  let component: AdminUserDetailsPageComponent;
  let fixture: ComponentFixture<AdminUserDetailsPageComponent>;
  let userService: {
    getUser: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
    getGroup: ReturnType<typeof vi.fn>;
  };
  let permService: { listLocalPermissionRows: ReturnType<typeof vi.fn> };
  let documentDetail: { removePermission: ReturnType<typeof vi.fn> };
  let dialogOpen: MockInstance<MatDialog['open']>;
  let snackBarOpen: MockInstance<MatSnackBar['open']>;
  let navigate: MockInstance<Router['navigate']>;
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const mockUser = {
    id: 'jdoe',
    properties: {
      username: 'jdoe',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      company: 'Acme',
      groups: ['members', 'reviewers'],
    },
  } as unknown as NuxeoUser;

  const permPage: PrincipalPermissionPage = {
    rows: [
      {
        documentUid: 'doc-1',
        documentTitle: 'Document 1',
        documentPath: '/path/doc1',
        permission: 'Read',
        acePrincipal: 'jdoe',
        // `begin`/`end` are required and are what `timeFrameLabel` reads; `grantedBy` too.
        begin: null,
        end: null,
        grantedBy: 'Administrator',
      },
    ],
    totalDocuments: 1,
    numberOfPages: 1,
    currentPageIndex: 0,
    currentPageSize: 10,
  };

  /** The row the permission table hands back to `removePermission`. */
  const permRow = permPage.rows[0];

  beforeEach(() => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({ userId: 'jdoe' }));

    userService = {
      getUser: vi.fn().mockReturnValue(of(mockUser)),
      updateUser: vi.fn().mockReturnValue(of(mockUser)),
      deleteUser: vi.fn().mockReturnValue(of(undefined)),
      getGroup: vi.fn((id: string) =>
        of({ groupname: id, grouplabel: `${id} label` } as NuxeoGroup),
      ),
    };

    permService = {
      listLocalPermissionRows: vi.fn().mockReturnValue(of(permPage)),
    };

    documentDetail = {
      removePermission: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      // The real English catalogue: `TranslatePipe` in this template calls `translate.get()` and
      // subscribes to the service's change streams, which a `{ instant: key => key }` stub has not.
      // The assertions below therefore read the English a user sees rather than the key.
      imports: [AdminUserDetailsPageComponent, testTranslateModule()],
      providers: [
        provideZonelessChangeDetection(),
        // The real router, because this template uses `routerLink` and `RouterLink` reaches for
        // `createUrlTree` and `serializeUrl` as well as `navigate`. It must come *before* the
        // `ActivatedRoute` override: `provideRouter` supplies its own, and the later provider wins.
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } },
        { provide: UserService, useValue: userService },
        { provide: PrincipalPermissionsService, useValue: permService },
        { provide: DocumentDetailService, useValue: documentDetail },
        { provide: LOCALE_ID, useValue: 'en-US' },
      ],
    });

    fixture = TestBed.createComponent(AdminUserDetailsPageComponent);
    component = fixture.componentInstance;

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    // `MatDialog` and `MatSnackBar` cannot be replaced with root providers: this component imports
    // `MatDialogModule` and `MatSnackBarModule`, and an NgModule imported by a standalone component
    // contributes its providers to that component's *node* injector, which shadows the TestBed root.
    // A `{ provide: MatDialog, useValue: ... }` override is silently ignored — the component gets
    // the real service and `open()` then crashes on internals a stub never had.
    const injector = fixture.debugElement.injector;
    dialogOpen = vi
      .spyOn(injector.get(MatDialog), 'open')
      .mockReturnValue({ afterClosed: () => of(undefined) } as never);
    snackBarOpen = vi
      .spyOn(injector.get(MatSnackBar), 'open')
      .mockReturnValue({ afterDismissed: () => of({}) } as never);
  });

  /** Makes the next dialog close with `result`. */
  function dialogReturns(result: unknown): void {
    dialogOpen.mockReturnValue({ afterClosed: () => of(result) } as never);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load the user named in the route', () => {
      component.ngOnInit();

      expect(userService.getUser).toHaveBeenCalledWith('jdoe');
      expect(component.user()).toEqual(mockUser);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should reset state when the route moves to another user', () => {
      component.ngOnInit();
      component.error.set('stale error');
      component.localPageIndex.set(4);

      // The replacement request stays in flight, so what is asserted is the reset itself rather
      // than whatever the new response would have left behind.
      userService.getUser.mockReturnValue(new Subject<NuxeoUser>().asObservable());
      paramMapSubject.next(convertToParamMap({ userId: 'asmith' }));

      expect(component.user()).toBeNull();
      expect(component.error()).toBeNull();
      expect(component.groupInfo()).toEqual([]);
      expect(component.localPerm()).toBeNull();
      expect(component.localPageIndex()).toBe(0);
      expect(component.groupPermMap()).toEqual({});
      expect(userService.getUser).toHaveBeenLastCalledWith('asmith');
    });
  });

  describe('load', () => {
    it('should report a missing user id without calling the server', () => {
      paramMapSubject.next(convertToParamMap({}));

      component.ngOnInit();

      expect(component.error()).toBe('Missing user id.');
      expect(userService.getUser).not.toHaveBeenCalled();
    });

    it('should show loading while the user is being fetched and clear it on arrival', () => {
      component.ngOnInit();
      const pending = new Subject<NuxeoUser>();
      userService.getUser.mockReturnValue(pending.asObservable());

      component.load();
      expect(component.loading()).toBe(true);

      pending.next(mockUser);
      expect(component.loading()).toBe(false);
    });

    it("should surface the server's message when the user cannot be loaded", () => {
      userService.getUser.mockReturnValue(
        throwError(() => ({ error: { message: 'User not found' } })),
      );

      component.ngOnInit();

      expect(component.error()).toBe('User not found');
      expect(component.loading()).toBe(false);
    });

    it('should fall back to a generic message when the failure carries none', () => {
      userService.getUser.mockReturnValue(throwError(() => ({})));

      component.ngOnInit();

      expect(component.error()).toBe('Could not load user details.');
    });
  });

  describe('group info', () => {
    it("should resolve each group's display label", () => {
      component.ngOnInit();

      expect(component.groupInfo()).toEqual([
        { id: 'members', label: 'members label' },
        { id: 'reviewers', label: 'reviewers label' },
      ]);
    });

    it('should fall back to the group id when its label cannot be fetched', () => {
      userService.getGroup.mockImplementation((id: string) =>
        id === 'reviewers'
          ? throwError(() => new Error('403'))
          : of({ groupname: id, grouplabel: 'members label' } as NuxeoGroup),
      );

      component.ngOnInit();

      // One group failing must not blank the other: `catchError` is per-request, not per-forkJoin.
      expect(component.groupInfo()).toEqual([
        { id: 'members', label: 'members label' },
        { id: 'reviewers', label: 'reviewers' },
      ]);
    });

    it('should fall back to the id when a group has no label', () => {
      userService.getGroup.mockReturnValue(of({ groupname: 'members' } as NuxeoGroup));

      component.ngOnInit();

      expect(component.groupInfo()).toEqual([
        { id: 'members', label: 'members' },
        { id: 'reviewers', label: 'reviewers' },
      ]);
    });

    it('should resolve no group info for a user in no groups', () => {
      userService.getUser.mockReturnValue(
        of({ ...mockUser, properties: { ...mockUser.properties, groups: [] } }),
      );
      userService.getGroup.mockClear();

      component.ngOnInit();

      expect(component.groupInfo()).toEqual([]);
      expect(userService.getGroup).not.toHaveBeenCalled();
    });
  });

  describe('local permissions', () => {
    it("should load the user's own permissions for the first page", () => {
      component.ngOnInit();

      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('jdoe', 10, 0);
      expect(component.localPerm()).toEqual(permPage);
      expect(component.localPermLoading()).toBe(false);
    });

    it('should show loading while permissions are in flight and clear it on arrival', () => {
      component.ngOnInit();
      const pending = new Subject<PrincipalPermissionPage>();
      permService.listLocalPermissionRows.mockReturnValue(pending.asObservable());

      component.loadLocalPerms();
      expect(component.localPermLoading()).toBe(true);

      pending.next(permPage);
      expect(component.localPermLoading()).toBe(false);
    });

    it('should fall back to an empty page when permissions cannot be loaded', () => {
      component.ngOnInit();
      permService.listLocalPermissionRows.mockReturnValue(throwError(() => new Error('500')));

      component.loadLocalPerms();

      expect(component.localPerm()).toEqual({
        rows: [],
        totalDocuments: 0,
        numberOfPages: 0,
        currentPageIndex: 0,
        currentPageSize: 0,
      });
      expect(component.localPermLoading()).toBe(false);
    });

    it('should reload the page the paginator moved to', () => {
      component.ngOnInit();
      permService.listLocalPermissionRows.mockClear();

      component.onLocalPermPage({ pageIndex: 2, pageSize: 10, length: 30 } as PageEvent);

      expect(component.localPageIndex()).toBe(2);
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('jdoe', 10, 2);
    });
  });

  describe('group permissions', () => {
    it("should load every group's permissions when the user loads", () => {
      component.ngOnInit();

      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('members', 10, 0);
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('reviewers', 10, 0);
      expect(component.groupPermPage('members')).toEqual(permPage);
      expect(component.groupPermPage('reviewers')).toEqual(permPage);
      expect(component.isGroupPermLoading('members')).toBe(false);
    });

    it('should track loading per group rather than globally', () => {
      const pendingMembers = new Subject<PrincipalPermissionPage>();
      permService.listLocalPermissionRows.mockImplementation((id: string) =>
        id === 'members' ? pendingMembers.asObservable() : of(permPage),
      );

      component.ngOnInit();

      expect(component.isGroupPermLoading('members')).toBe(true);
      expect(component.isGroupPermLoading('reviewers')).toBe(false);

      pendingMembers.next(permPage);
      expect(component.isGroupPermLoading('members')).toBe(false);
    });

    it('should fall back to an empty page for a group whose permissions fail, leaving others intact', () => {
      permService.listLocalPermissionRows.mockImplementation((id: string) =>
        id === 'reviewers' ? throwError(() => new Error('500')) : of(permPage),
      );

      component.ngOnInit();

      expect(component.groupPermPage('reviewers')).toEqual({
        rows: [],
        totalDocuments: 0,
        numberOfPages: 0,
        currentPageIndex: 0,
        currentPageSize: 0,
      });
      expect(component.groupPermPage('members')).toEqual(permPage);
      expect(component.isGroupPermLoading('reviewers')).toBe(false);
    });

    it('should page one group without touching the others', () => {
      component.ngOnInit();
      permService.listLocalPermissionRows.mockClear();

      component.onGroupPermPage('members', {
        pageIndex: 3,
        pageSize: 10,
        length: 40,
      } as PageEvent);

      expect(permService.listLocalPermissionRows).toHaveBeenCalledTimes(1);
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('members', 10, 3);
    });

    it('should report no page and not loading for a group it knows nothing about', () => {
      expect(component.groupPermPage('never-loaded')).toBeNull();
      expect(component.isGroupPermLoading('never-loaded')).toBe(false);
    });
  });

  describe('openChangePassword', () => {
    beforeEach(() => {
      component.user.set(mockUser);
    });

    it('should do nothing when no user is loaded', () => {
      component.user.set(null);
      component.openChangePassword();
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('should open the dialog for the loaded user', () => {
      component.openChangePassword();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { username: 'jdoe' } }),
      );
    });

    it('should not update anything when the dialog is cancelled', () => {
      dialogReturns(undefined);

      component.openChangePassword();

      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('should set the new password and confirm it', () => {
      dialogReturns('s3cret!');

      component.openChangePassword();

      expect(userService.updateUser).toHaveBeenCalledWith('jdoe', { password: 's3cret!' });
      expect(snackBarOpen).toHaveBeenCalledWith('Password updated', 'Dismiss', { duration: 3000 });
    });

    it("should surface the server's message when the password cannot be set", () => {
      dialogReturns('weak');
      userService.updateUser.mockReturnValue(
        throwError(() => ({ error: { message: 'Password too weak' } })),
      );

      component.openChangePassword();

      expect(snackBarOpen).toHaveBeenCalledWith('Password too weak', 'Dismiss', { duration: 5000 });
    });

    it('should fall back to a generic message when the failure carries none', () => {
      dialogReturns('weak');
      userService.updateUser.mockReturnValue(throwError(() => ({})));

      component.openChangePassword();

      expect(snackBarOpen).toHaveBeenCalledWith('Password update failed', 'Dismiss', {
        duration: 5000,
      });
    });
  });

  describe('openEdit', () => {
    beforeEach(() => {
      component.user.set(mockUser);
    });

    it('should do nothing when no user is loaded', () => {
      component.user.set(null);
      component.openEdit();
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('should open the dialog in edit mode with the loaded user', () => {
      component.openEdit();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { mode: 'edit', user: mockUser } }),
      );
    });

    it('should not update anything when the dialog is cancelled', () => {
      dialogReturns(undefined);

      component.openEdit();

      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('should ignore a result from a different mode', () => {
      // The dialog is shared with the create flow; a `create` result must not be applied here.
      dialogReturns({ mode: 'create', firstName: 'Someone' });

      component.openEdit();

      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('should send every edited field and reload', () => {
      // `ngOnInit` is what puts the user id in place; without it `load()` returns at its
      // missing-user-id guard and the reload this asserts never happens.
      component.ngOnInit();
      dialogReturns({
        mode: 'edit',
        firstName: 'Janet',
        lastName: 'Doe',
        company: 'Globex',
        email: 'janet@example.com',
        password: '',
        groups: ['members'],
      });
      userService.getUser.mockClear();

      component.openEdit();

      expect(userService.updateUser).toHaveBeenCalledWith('jdoe', {
        firstName: 'Janet',
        lastName: 'Doe',
        company: 'Globex',
        email: 'janet@example.com',
        password: '',
        groups: ['members'],
      });
      expect(snackBarOpen).toHaveBeenCalledWith('User updated', 'Dismiss', { duration: 3000 });
      expect(userService.getUser).toHaveBeenCalled();
    });

    it("should surface the server's message when the edit fails", () => {
      dialogReturns({ mode: 'edit', firstName: 'Janet' });
      userService.updateUser.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already in use' } })),
      );

      component.openEdit();

      expect(snackBarOpen).toHaveBeenCalledWith('Email already in use', 'Dismiss', {
        duration: 5000,
      });
    });

    it('should fall back to a generic message when the failure carries none', () => {
      dialogReturns({ mode: 'edit', firstName: 'Janet' });
      userService.updateUser.mockReturnValue(throwError(() => ({})));

      component.openEdit();

      expect(snackBarOpen).toHaveBeenCalledWith('Update failed', 'Dismiss', { duration: 5000 });
    });
  });

  describe('confirmDelete', () => {
    beforeEach(() => {
      component.user.set(mockUser);
    });

    it('should do nothing when no user is loaded', () => {
      component.user.set(null);
      component.confirmDelete();
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('should name the user in the confirmation it asks for', () => {
      component.confirmDelete();

      expect(dialogOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          data: {
            title: 'Delete user',
            message: 'Delete user "jdoe"? This cannot be undone.',
            confirmLabel: 'Delete',
          },
        }),
      );
    });

    it('should not delete when the user declines', () => {
      dialogReturns(false);

      component.confirmDelete();

      expect(userService.deleteUser).not.toHaveBeenCalled();
    });

    it('should delete the user and return to the list', () => {
      dialogReturns(true);

      component.confirmDelete();

      expect(userService.deleteUser).toHaveBeenCalledWith('jdoe');
      expect(snackBarOpen).toHaveBeenCalledWith('User deleted', 'Dismiss', { duration: 3000 });
      expect(navigate).toHaveBeenCalledWith(['/administration/users-groups']);
    });

    it("should surface the server's message and stay on the page when the delete fails", () => {
      dialogReturns(true);
      userService.deleteUser.mockReturnValue(
        throwError(() => ({ error: { message: 'User owns documents' } })),
      );

      component.confirmDelete();

      expect(snackBarOpen).toHaveBeenCalledWith('User owns documents', 'Dismiss', {
        duration: 5000,
      });
      expect(navigate).not.toHaveBeenCalled();
    });

    it('should fall back to a generic message when the failure carries none', () => {
      dialogReturns(true);
      userService.deleteUser.mockReturnValue(throwError(() => ({})));

      component.confirmDelete();

      expect(snackBarOpen).toHaveBeenCalledWith('Delete failed', 'Dismiss', { duration: 5000 });
    });
  });

  describe('removeGroup', () => {
    beforeEach(() => {
      component.user.set(mockUser);
    });

    it('should do nothing when no user is loaded', () => {
      component.user.set(null);
      component.removeGroup('members');
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('should send the remaining groups, not the removed one', () => {
      component.removeGroup('members');

      expect(userService.updateUser).toHaveBeenCalledWith('jdoe', { groups: ['reviewers'] });
      expect(snackBarOpen).toHaveBeenCalledWith('Group removed from user', 'Dismiss', {
        duration: 2500,
      });
    });

    it('should send an empty list when the last group is removed', () => {
      component.user.set({
        ...mockUser,
        properties: { ...mockUser.properties, groups: ['members'] },
      } as NuxeoUser);

      component.removeGroup('members');

      expect(userService.updateUser).toHaveBeenCalledWith('jdoe', { groups: [] });
    });

    it("should surface the server's message when the group cannot be removed", () => {
      userService.updateUser.mockReturnValue(
        throwError(() => ({ error: { message: 'Group is mandatory' } })),
      );

      component.removeGroup('members');

      expect(snackBarOpen).toHaveBeenCalledWith('Group is mandatory', 'Dismiss', {
        duration: 5000,
      });
    });

    it('should fall back to a generic message when the failure carries none', () => {
      userService.updateUser.mockReturnValue(throwError(() => ({})));

      component.removeGroup('members');

      expect(snackBarOpen).toHaveBeenCalledWith('Could not update user groups', 'Dismiss', {
        duration: 5000,
      });
    });
  });

  describe('removePermission', () => {
    it('should remove the ACE from the local ACL and reload both permission tables', () => {
      component.ngOnInit();
      permService.listLocalPermissionRows.mockClear();

      component.removePermission(permRow);

      expect(documentDetail.removePermission).toHaveBeenCalledWith('doc-1', {
        user: 'jdoe',
        permission: 'Read',
        acl: 'local',
      });
      expect(snackBarOpen).toHaveBeenCalledWith('Permission removed', 'Dismiss', {
        duration: 2500,
      });
      // The user's own page plus one request per group, since a group ACE may have been the source.
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('jdoe', 10, 0);
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('members', 10, 0);
      expect(permService.listLocalPermissionRows).toHaveBeenCalledWith('reviewers', 10, 0);
    });

    it('should not reload group permissions when no user is loaded', () => {
      component.user.set(null);
      permService.listLocalPermissionRows.mockClear();

      component.removePermission(permRow);

      expect(permService.listLocalPermissionRows).toHaveBeenCalledTimes(1);
    });

    it("should surface the server's message when the removal fails", () => {
      documentDetail.removePermission.mockReturnValue(
        throwError(() => ({ error: { message: 'Not permitted' } })),
      );

      component.removePermission(permRow);

      expect(snackBarOpen).toHaveBeenCalledWith('Not permitted', 'Dismiss', { duration: 5000 });
    });

    it('should fall back to a generic message when the failure carries none', () => {
      documentDetail.removePermission.mockReturnValue(throwError(() => ({})));

      component.removePermission(permRow);

      expect(snackBarOpen).toHaveBeenCalledWith('Could not remove permission', 'Dismiss', {
        duration: 5000,
      });
    });
  });

  describe('timeFrameLabel', () => {
    it('should call an unbounded permission Permanent', () => {
      expect(component.timeFrameLabel(permRow)).toBe('Permanent');
    });

    it('should render a bounded permission as a date range', () => {
      const label = component.timeFrameLabel({
        ...permRow,
        begin: '2026-01-01T00:00:00.000Z',
        end: '2026-12-31T00:00:00.000Z',
      } as PrincipalPermissionRow);

      expect(label).toBe(
        `${new Date('2026-01-01T00:00:00.000Z').toLocaleString()} – ` +
          `${new Date('2026-12-31T00:00:00.000Z').toLocaleString()}`,
      );
    });

    it('should render an em dash for the open end of a half-bounded permission', () => {
      const label = component.timeFrameLabel({
        ...permRow,
        begin: null,
        end: '2026-12-31T00:00:00.000Z',
      } as PrincipalPermissionRow);

      expect(label).toBe(`— – ${new Date('2026-12-31T00:00:00.000Z').toLocaleString()}`);
    });
  });
});
