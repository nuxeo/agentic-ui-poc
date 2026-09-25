import { provideZonelessChangeDetection } from '@angular/core';
import { testTranslateModule } from '@agentic-ui/testing/i18n';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  DocumentDetailService,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  permissionCreateMailFailureMessage,
} from '@nuxeo-satori/platform/nuxeo-client';

import { AddPermissionDialogComponent } from './add-permission-dialog';

describe('AddPermissionDialogComponent (NXSAT-159)', () => {
  let fixture: ComponentFixture<AddPermissionDialogComponent>;
  let component: AddPermissionDialogComponent;
  let closeSpy: ReturnType<typeof vi.fn>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;
  let addPermissionWithNotification: ReturnType<typeof vi.fn>;

  const selectedUser = {
    id: 'user-readonly01',
    displayLabel: 'Read Only User',
    type: 'USER_TYPE' as const,
    prefixed_id: 'user:user-readonly01',
  };

  beforeEach(async () => {
    closeSpy = vi.fn();
    snackBarOpenSpy = vi.fn();
    addPermissionWithNotification = vi
      .fn()
      .mockReturnValue(of({ document: { uid: 'doc-1' }, notificationSent: true }));

    await TestBed.configureTestingModule({
      imports: [testTranslateModule(), testTranslateModule(), AddPermissionDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: { documentUid: 'doc-1' } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        {
          provide: DocumentDetailService,
          useValue: {
            searchUsersGroups: vi.fn().mockReturnValue(of([])),
            addPermissionWithNotification,
          },
        },
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
      ],
    })
      .overrideComponent(AddPermissionDialogComponent, {
        set: { imports: [], providers: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddPermissionDialogComponent);
    component = fixture.componentInstance;
    component.selectedUser = selectedUser;
    component.sendNotify = true;
    component.notifyComment = 'Please review this document';
  });

  it('exposes SMTP mail hint constant', () => {
    expect(component.mailHint).toBe(PERMISSION_NOTIFICATION_MAIL_HINT);
    expect(component.mailHint).toContain('SMTP');
  });

  it('creates permission with notification via addPermissionWithNotification', () => {
    component.create(false);

    expect(addPermissionWithNotification).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        username: 'user-readonly01',
        permission: 'Read',
        notify: true,
        comment: 'Please review this document',
      }),
    );
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Permission added and notification sent',
      'Dismiss',
      { duration: 7000 },
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('creates permission without notification when checkbox is off', () => {
    component.sendNotify = false;
    addPermissionWithNotification.mockReturnValue(
      of({ document: { uid: 'doc-1' }, notificationSent: false }),
    );

    component.create(false);

    expect(addPermissionWithNotification).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({ notify: false, comment: '' }),
    );
    expect(snackBarOpenSpy).not.toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('warns when permission is saved but notification email fails', () => {
    addPermissionWithNotification.mockReturnValue(
      of({
        document: { uid: 'doc-1' },
        notificationSent: false,
        notificationError: 'Permission was added, but the notification email could not be sent.',
      }),
    );

    component.create(false);

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('notification email could not be sent'),
      'Dismiss',
      { duration: 7000 },
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('resets form and shows snackbar on create-and-add-another', () => {
    component.create(true);

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Permission added and notification sent',
      'Dismiss',
      { duration: 7000 },
    );
    expect(component.selectedUser).toBeNull();
    expect(component.notifyComment).toBe('');
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('shows SMTP error when permission creation fails due to mail', () => {
    addPermissionWithNotification.mockReturnValue(
      throwError(() => ({
        error: { message: 'An error occurred while sending a mail' },
      })),
    );

    component.create(false);

    expect(snackBarOpenSpy).toHaveBeenCalledWith(permissionCreateMailFailureMessage(), 'Dismiss', {
      duration: 7000,
    });
    expect(closeSpy).not.toHaveBeenCalled();
  });

  describe('user selection and search', () => {
    it('updates search text and triggers search on change', () => {
      // The emission is what makes this test match its name. Asserting only `searchText` and
      // `selectedUser` leaves it green when `this.searchSubject.next(value)` is deleted, so the
      // debounce is advanced and the resulting service call is the load-bearing assertion.
      vi.useFakeTimers();
      try {
        const searchUsersGroups = TestBed.inject(DocumentDetailService)
          .searchUsersGroups as unknown as ReturnType<typeof vi.fn>;
        searchUsersGroups.mockReturnValue(of([selectedUser]));
        component.selectedUser = selectedUser;

        component.onSearchChange('new search');

        expect(component.searchText).toBe('new search');
        expect(component.selectedUser).toBeNull();

        // Nothing until the 300ms debounce elapses.
        expect(searchUsersGroups).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);

        expect(searchUsersGroups).toHaveBeenCalledWith('new search');
        expect(component.suggestions()).toEqual([selectedUser]);
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not search for an empty term', () => {
      vi.useFakeTimers();
      try {
        const searchUsersGroups = TestBed.inject(DocumentDetailService)
          .searchUsersGroups as unknown as ReturnType<typeof vi.fn>;
        component.suggestions.set([selectedUser]);

        component.onSearchChange('');
        vi.advanceTimersByTime(300);

        // The pipeline short-circuits to `of([])` below one character rather than querying.
        expect(searchUsersGroups).not.toHaveBeenCalled();
        expect(component.suggestions()).toEqual([]);
      } finally {
        vi.useRealTimers();
      }
    });

    it('sets selected user and updates search text', () => {
      component.selectedUser = null;
      component.onUserSelected(selectedUser);

      expect(component.selectedUser).toBe(selectedUser);
      expect(component.searchText).toBe('Read Only User');
    });

    it('displays user label from suggestion object', () => {
      expect(component.displayUser(selectedUser)).toBe('Read Only User');
    });

    it('displays string value as-is', () => {
      expect(component.displayUser('test-string')).toBe('test-string');
    });

    it('returns empty string for null or undefined', () => {
      // `displayUser` is typed `UserGroupSuggestion | string`, so both of these are off-type on
      // purpose: `mat-autocomplete`'s `displayWith` is called with the control's raw value, which is
      // `null` before the user has picked anything. The cast goes through `unknown` rather than
      // `any` so it reads as a deliberate off-type probe and not a silenced error.
      expect(component.displayUser(null as unknown as string)).toBe('');
      expect(component.displayUser(undefined as unknown as string)).toBe('');
    });
  });
});
