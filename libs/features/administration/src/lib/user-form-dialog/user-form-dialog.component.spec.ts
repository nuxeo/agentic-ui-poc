import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { UserService } from '@agentic-ui/shared/nuxeo-client';

import { UserFormDialogComponent, UserFormDialogData } from './user-form-dialog.component';

describe('UserFormDialogComponent (NXSAT-152)', () => {
  let component: UserFormDialogComponent;
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let closeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();
    await TestBed.configureTestingModule({
      imports: [UserFormDialogComponent, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'create' } satisfies UserFormDialogData,
        },
        {
          provide: MatDialogRef,
          useValue: { close: closeSpy },
        },
        {
          provide: UserService,
          useValue: {
            searchGroupsPaged: vi.fn().mockReturnValue(of({ entries: [], totalSize: 0 })),
          },
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

  it('omits password from dialog result when toggle is off', () => {
    component.username = 'invite.user';
    component.email = 'invite.user@example.com';

    component.submit(false);

    const result = closeSpy.mock.calls[0][0];
    expect(result).not.toHaveProperty('password');
  });

  it('passes createAnother when creating another user', () => {
    component.username = 'another.user';
    component.email = 'another.user@example.com';

    component.submit(true);

    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ createAnother: true }));
  });
});
