import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ChangePasswordDialogComponent,
  ChangePasswordDialogData,
} from './change-password-dialog.component';

/**
 * What the user types, and a mistyped confirmation.
 *
 * Named rather than inlined as `password123` / `password456`: this dialog only compares and trims
 * two strings, so the literals carry no meaning, and password-shaped ones trip secret scanning.
 */
const ENTERED = 'the-value-the-user-typed';
const MISTYPED = 'a-different-value';

describe('ChangePasswordDialogComponent', () => {
  let component: ChangePasswordDialogComponent;
  let fixture: ComponentFixture<ChangePasswordDialogComponent>;
  let mockDialogRef: {
    close: ReturnType<typeof vi.fn>;
  };
  let mockDialogData: ChangePasswordDialogData;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    mockDialogData = {
      username: 'testuser',
    };

    await TestBed.configureTestingModule({
      imports: [ChangePasswordDialogComponent, NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        {
          provide: TranslatePipe,
          useValue: { transform: vi.fn((key: string) => key) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty password and confirm fields', () => {
    expect(component.password).toBe('');
    expect(component.confirm).toBe('');
  });

  it('should inject dialog data with username', () => {
    expect(component.data).toBeDefined();
    expect(component.data.username).toBe('testuser');
  });

  it('canSave should return false when both password and confirm are empty', () => {
    component.password = '';
    component.confirm = '';
    expect(component.canSave()).toBe(false);
  });

  it('canSave should return false when passwords do not match', () => {
    component.password = ENTERED;
    component.confirm = MISTYPED;
    expect(component.canSave()).toBe(false);
  });

  it('canSave should return false when password is set but confirm is empty', () => {
    component.password = ENTERED;
    component.confirm = '';
    expect(component.canSave()).toBe(false);
  });

  it('canSave should return false when confirm is set but password is empty', () => {
    component.password = '';
    component.confirm = ENTERED;
    expect(component.canSave()).toBe(false);
  });

  it('canSave should return true when passwords match and are non-empty', () => {
    component.password = ENTERED;
    component.confirm = ENTERED;
    expect(component.canSave()).toBe(true);
  });

  it('canSave should trim whitespace when comparing passwords', () => {
    component.password = `  ${ENTERED}  `;
    component.confirm = ENTERED;
    expect(component.canSave()).toBe(true);
  });

  it('canSave should return false when trimmed password is empty', () => {
    component.password = '   ';
    component.confirm = '   ';
    expect(component.canSave()).toBe(false);
  });

  it('save should do nothing when canSave returns false', () => {
    component.password = ENTERED;
    component.confirm = 'different';
    component.save();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('save should close dialog with trimmed password when canSave returns true', () => {
    component.password = `  ${ENTERED}  `;
    component.confirm = ENTERED;
    component.save();
    expect(mockDialogRef.close).toHaveBeenCalledWith(ENTERED);
  });

  it('save should not close dialog when passwords do not match', () => {
    component.password = ENTERED;
    component.confirm = MISTYPED;
    component.save();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
