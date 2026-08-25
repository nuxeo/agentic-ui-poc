import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { RemoveAttachmentDialogComponent } from './remove-attachment-dialog';

const mockDialogRef = {
  close: vi.fn(),
};

describe('RemoveAttachmentDialogComponent', () => {
  let component: RemoveAttachmentDialogComponent;
  let fixture: ComponentFixture<RemoveAttachmentDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RemoveAttachmentDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveAttachmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('closes with false when the user declines', () => {
    component.cancel();

    // Explicitly `false`, not `undefined`: the caller treats a falsy-but-defined result as an
    // answered prompt, so returning `undefined` here would look like a dismissed backdrop.
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('closes with true when the user confirms', () => {
    component.confirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('wires No to decline and Yes to confirm', () => {
    const no = fixture.nativeElement.querySelector('button.btn-no') as HTMLButtonElement;
    const yes = fixture.nativeElement.querySelector('button.btn-yes') as HTMLButtonElement;
    // Presence first, so the click assertions below cannot pass vacuously.
    expect(no).toBeTruthy();
    expect(yes).toBeTruthy();

    no.click();
    expect(mockDialogRef.close).toHaveBeenLastCalledWith(false);

    yes.click();
    expect(mockDialogRef.close).toHaveBeenLastCalledWith(true);
  });
});
