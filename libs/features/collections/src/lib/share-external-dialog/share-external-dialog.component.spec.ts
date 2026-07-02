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

import { ShareExternalDialogComponent } from './share-external-dialog';

describe('ShareExternalDialogComponent (NXSAT-159)', () => {
  let fixture: ComponentFixture<ShareExternalDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;
  let addExternalPermissionWithNotification: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();
    snackBarOpenSpy = vi.fn();
    addExternalPermissionWithNotification = vi
      .fn()
      .mockReturnValue(of({ document: { uid: 'doc-1' }, notificationSent: true }));

    await TestBed.configureTestingModule({
      imports: [ShareExternalDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { documentUid: 'doc-1' } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        {
          provide: DocumentDetailService,
          useValue: { addExternalPermissionWithNotification },
        },
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
      ],
    })
      .overrideComponent(ShareExternalDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ShareExternalDialogComponent);
    fixture.componentInstance.email = 'guest@example.com';
    fixture.componentInstance.endDate = new Date('2026-12-31');
    fixture.componentInstance.notifyComment = 'Please review';
    fixture.detectChanges();
  });

  it('exposes SMTP mail hint constant', () => {
    expect(fixture.componentInstance.mailHint).toBe(PERMISSION_NOTIFICATION_MAIL_HINT);
    expect(fixture.componentInstance.mailHint).toContain('SMTP');
  });

  it('creates external permission with notification', () => {
    fixture.componentInstance.create(false);

    expect(addExternalPermissionWithNotification).toHaveBeenCalledWith(
      'doc-1',
      expect.objectContaining({
        email: 'guest@example.com',
        notify: true,
        comment: 'Please review',
      }),
    );
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Permission added and notification sent',
      'Dismiss',
      { duration: 7000 },
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('warns when permission is saved but notification fails', () => {
    addExternalPermissionWithNotification.mockReturnValue(
      of({
        document: { uid: 'doc-1' },
        notificationSent: false,
        notificationError: 'Permission was added, but the notification email could not be sent.',
      }),
    );

    fixture.componentInstance.create(false);

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining('notification email could not be sent'),
      'Dismiss',
      { duration: 7000 },
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('resets form on create-and-add-another without closing', () => {
    fixture.componentInstance.create(true);

    expect(fixture.componentInstance.email).toBe('');
    expect(fixture.componentInstance.notifyComment).toBe('');
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('shows SMTP error when create fails due to mail', () => {
    addExternalPermissionWithNotification.mockReturnValue(
      throwError(() => ({
        error: { message: 'An error occurred while sending a mail' },
      })),
    );

    fixture.componentInstance.create(false);

    expect(snackBarOpenSpy).toHaveBeenCalledWith(permissionCreateMailFailureMessage(), 'Dismiss', {
      duration: 7000,
    });
    expect(closeSpy).not.toHaveBeenCalled();
  });
});
