import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UserService } from '@agentic-ui/shared/nuxeo-client';

import { UserFormDialogComponent, UserFormDialogData } from './user-form-dialog.component';

describe('UserFormDialogComponent (NXSAT-152)', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;
  let createUserSpy: ReturnType<typeof vi.fn>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();
    createUserSpy = vi.fn().mockReturnValue(of({ id: 'new.user' }));
    snackBarOpenSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'create' } satisfies UserFormDialogData,
        },
        {
          provide: MatDialogRef,
          useValue: { close: closeSpy, disableClose: false },
        },
        {
          provide: UserService,
          useValue: {
            searchGroupsPaged: vi.fn().mockReturnValue(of({ entries: [], totalSize: 0 })),
            createUser: createUserSpy,
          },
        },
        {
          provide: MatSnackBar,
          useValue: { open: snackBarOpenSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.loadingGroups = false;
  });

  it('defaults Set user password toggle to off', () => {
    expect(component.setUserPassword).toBe(false);
  });

  it('allows save with username and email when password toggle is off', () => {
    component.username = 'new.user';
    component.email = 'new.user@example.com';

    expect(component.canSave).toBe(true);
  });

  it('calls createUser and closes on success without password when toggle is off', () => {
    component.username = 'invite.user';
    component.email = 'invite.user@example.com';

    component.submit(false);

    expect(createUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'invite.user',
        email: 'invite.user@example.com',
      }),
    );
    expect(closeSpy).toHaveBeenCalled();
    const result = closeSpy.mock.calls[0][0];
    expect(result).not.toHaveProperty('password');
  });

  it('passes createAnother when creating another user', () => {
    component.username = 'another.user';
    component.email = 'another.user@example.com';

    component.submit(true);

    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ createAnother: true }));
  });

  it('shows toast and keeps dialog open when create fails', fakeAsync(() => {
    createUserSpy.mockReturnValue(
      throwError(() => ({ error: { message: 'Failed to invoke operation: User.Invite' } })),
    );
    component.username = 'fail.user';
    component.email = 'fail.user@example.com';

    component.submit(false);
    tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Failed to invoke operation: User.Invite',
      'Dismiss',
      expect.objectContaining({ duration: 7000 }),
    );
    expect(component.saving()).toBe(false);
  }));

  it('shows simplified API message for invite mail failures', fakeAsync(() => {
    createUserSpy.mockReturnValue(
      throwError(() => ({
        error: {
          message:
            'Failed to invoke operation: User.Invite, Failed to invoke operation User.Invite, An error occurred while sending a mail',
        },
      })),
    );
    component.username = 'fail.user';
    component.email = 'fail.user@example.com';

    component.submit(false);
    tick();

    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'An error occurred while sending a mail',
      'Dismiss',
      expect.objectContaining({ duration: 7000 }),
    );
  }));

  it('adds selected group without concatenating typed prefix (NXSAT-151)', () => {
    const deselect = vi.fn();
    component.groupSearchQuery = 'power';

    component.onGroupSelected({
      option: { value: 'powerusers', deselect },
    } as unknown as MatAutocompleteSelectedEvent);

    expect(component.groups).toEqual(['powerusers']);
    expect(component.groupSearchQuery).toBe('');
    expect(deselect).toHaveBeenCalled();

    const chipInput = { clear: vi.fn() };
    component.addGroupFromInput({
      value: 'powerpowerusers',
      chipInput,
    } as unknown as MatChipInputEvent);

    expect(component.groups).toEqual(['powerusers']);
    expect(chipInput.clear).toHaveBeenCalled();
  });
});
