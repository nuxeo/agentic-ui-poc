import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  DocumentDetailService,
  NuxeoAce,
  PERMISSION_NOTIFICATION_MAIL_HINT,
  permissionUpdateMailFailureMessage,
} from '@agentic-ui/shared/nuxeo-client';

import { UpdatePermissionDialogComponent } from './update-permission-dialog';

describe('UpdatePermissionDialogComponent (NXSAT-159)', () => {
  let fixture: ComponentFixture<UpdatePermissionDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;
  let replacePermissionWithNotification: ReturnType<typeof vi.fn>;
  let removePermission: ReturnType<typeof vi.fn>;
  let addExternalPermissionWithNotification: ReturnType<typeof vi.fn>;

  const ace: NuxeoAce = {
    id: 'ace-1',
    username: 'user-readonly01',
    externalUser: false,
    permission: 'Read',
    granted: true,
    creator: 'admin',
    begin: null,
    end: null,
    status: 'effective',
  };

  beforeEach(async () => {
    closeSpy = vi.fn();
    replacePermissionWithNotification = vi
      .fn()
      .mockReturnValue(of({ document: { uid: 'doc-1' }, notificationSent: true }));
    removePermission = vi.fn().mockReturnValue(of({ uid: 'doc-1' }));
    addExternalPermissionWithNotification = vi
      .fn()
      .mockReturnValue(of({ document: { uid: 'doc-1' }, notificationSent: true }));

    await TestBed.configureTestingModule({
      imports: [UpdatePermissionDialogComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { documentUid: 'doc-1', ace, isExternal: false },
        },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        {
          provide: DocumentDetailService,
          useValue: {
            replacePermissionWithNotification,
            removePermission,
            addExternalPermissionWithNotification,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePermissionDialogComponent);
    snackBarOpenSpy = vi.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open');
    fixture.componentInstance.sendNotify = true;
    fixture.componentInstance.notifyComment = 'Updated access';
    fixture.detectChanges();
  });

  it('exposes SMTP mail hint constant', () => {
    expect(fixture.componentInstance.mailHint).toBe(PERMISSION_NOTIFICATION_MAIL_HINT);
  });

  it('updates local permission via replacePermissionWithNotification', () => {
    fixture.componentInstance.update();

    expect(replacePermissionWithNotification).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        id: 'ace-1',
        username: 'user-readonly01',
        notify: true,
        comment: 'Updated access',
      }),
    );
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Permission updated and notification sent',
      'Dismiss',
      { duration: 7000 },
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('warns when local update saves but notification fails', () => {
    replacePermissionWithNotification.mockReturnValue(
      of({
        document: { uid: 'doc-1' },
        notificationSent: false,
        notificationError: 'Permission was updated, but the notification email could not be sent.',
      }),
    );

    fixture.componentInstance.update();

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('notification email could not be sent'),
      'Dismiss',
      { duration: 7000 },
    );
  });

  it('updates external permission via addExternalPermissionWithNotification', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UpdatePermissionDialogComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            documentUid: 'doc-1',
            ace: { ...ace, username: 'transient/guest@example.com', externalUser: true },
            isExternal: true,
          },
        },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        {
          provide: DocumentDetailService,
          useValue: {
            replacePermissionWithNotification,
            removePermission,
            addExternalPermissionWithNotification,
          },
        },
      ],
    }).compileComponents();

    const externalFixture = TestBed.createComponent(UpdatePermissionDialogComponent);
    snackBarOpenSpy = vi.spyOn(externalFixture.debugElement.injector.get(MatSnackBar), 'open');
    externalFixture.componentInstance.endDate = new Date('2026-12-31');
    externalFixture.componentInstance.notifyComment = 'External invite';
    externalFixture.detectChanges();

    externalFixture.componentInstance.update();

    expect(removePermission).toHaveBeenCalled();
    expect(addExternalPermissionWithNotification).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        email: 'guest@example.com',
        notify: true,
        comment: 'External invite',
      }),
    );
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Permission updated and notification sent',
      'Dismiss',
      { duration: 7000 },
    );
  });

  it('shows SMTP error when update fails due to mail', () => {
    replacePermissionWithNotification.mockReturnValue(
      throwError(() => ({
        error: { message: 'An error occurred while sending a mail' },
      })),
    );

    fixture.componentInstance.update();

    expect(snackBarOpenSpy).toHaveBeenCalledWith(permissionUpdateMailFailureMessage(), 'Dismiss', {
      duration: 7000,
    });
    expect(closeSpy).not.toHaveBeenCalled();
  });
});
