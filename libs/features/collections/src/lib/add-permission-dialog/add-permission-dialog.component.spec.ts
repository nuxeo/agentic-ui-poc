import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  DocumentDetailService,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  permissionCreateMailFailureMessage,
} from '@agentic-ui/shared/nuxeo-client';

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
  };

  beforeEach(async () => {
    closeSpy = vi.fn();
    addPermissionWithNotification = vi
      .fn()
      .mockReturnValue(of({ document: { uid: 'doc-1' }, notificationSent: true }));

    await TestBed.configureTestingModule({
      imports: [AddPermissionDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { documentUid: 'doc-1' } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        {
          provide: DocumentDetailService,
          useValue: {
            searchUsersGroups: vi.fn().mockReturnValue(of([])),
            addPermissionWithNotification,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPermissionDialogComponent);
    snackBarOpenSpy = vi.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open');
    component = fixture.componentInstance;
    component.selectedUser = selectedUser;
    component.sendNotify = true;
    component.notifyComment = 'Please review this document';
    fixture.detectChanges();
  });

  it('exposes SMTP mail hint constant', () => {
    expect(component.mailHint).toBe(PERMISSION_NOTIFICATION_MAIL_HINT);
  });

  it('shows mail hint in template when notify is enabled', () => {
    const hint = fixture.nativeElement.querySelector('.mail-hint');
    expect(hint?.textContent).toContain('SMTP');
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
});
