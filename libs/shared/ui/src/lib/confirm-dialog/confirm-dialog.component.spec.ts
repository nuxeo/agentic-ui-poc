import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { ConfirmDialogComponent, type ConfirmDialogData } from './confirm-dialog.component';
import { trashDocumentConfirmData, trashSelectedDocumentsConfirmData } from './trash-confirm.utils';

/**
 * `MatDialogClose` resolves `MatDialogRef` optionally, but the two buttons in this template
 * carry `mat-dialog-close` / `[mat-dialog-close]="true"`, and the whole point of the confirm
 * button is the value it closes with. A stub ref is therefore provided so `close` can be
 * observed: "a button exists" would not distinguish Cancel from Confirm, which is the one
 * distinction a destructive-action dialog has to get right.
 */
const mockDialogRef = {
  close: vi.fn((_result?: unknown): void => undefined),
  // Declared even though this component never calls them: `MatDialogClose` reads `_matDialogRef`
  // internals via the injected ref in some Material versions, and adding a method to the literal
  // later is a TypeScript error on a property that does not exist.
  addPanelClass: vi.fn((_classes: string | string[]): void => undefined),
  removePanelClass: vi.fn((_classes: string | string[]): void => undefined),
};

/**
 * Fills every required field of `ConfirmDialogData`. No trailing `as ConfirmDialogData`: the cast
 * is what would let an incomplete fixture through if the interface gained a required member.
 */
function dialogData(overrides: Partial<ConfirmDialogData> = {}): ConfirmDialogData {
  return {
    title: 'Move to Trash',
    message: 'Move "Report.pdf" to trash?',
    ...overrides,
  };
}

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let component: ConfirmDialogComponent;

  async function render(data: ConfirmDialogData): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function buttons(): HTMLButtonElement[] {
    return [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the injected dialog data', async () => {
    const data = dialogData();
    await render(data);

    expect(component.data).toBe(data);
  });

  it('renders the title and message it was given', async () => {
    await render(dialogData({ title: 'Delete forever', message: 'This cannot be undone.' }));

    expect(fixture.nativeElement.querySelector('[mat-dialog-title]')?.textContent?.trim()).toBe(
      'Delete forever',
    );
    expect(fixture.nativeElement.querySelector('.msg')?.textContent?.trim()).toBe(
      'This cannot be undone.',
    );
  });

  it('labels the confirm button "Confirm" when the caller supplies no label', async () => {
    await render(dialogData({ confirmLabel: undefined }));

    const rendered = buttons();
    // Presence first: an empty NodeList would make every label assertion below vacuous.
    expect(rendered).toHaveLength(2);
    expect(rendered[0].textContent?.trim()).toBe('Cancel');
    expect(rendered[1].textContent?.trim()).toBe('Confirm');
  });

  it('uses the caller-supplied confirm label when there is one', async () => {
    await render(dialogData({ confirmLabel: 'Delete' }));

    expect(buttons()[1].textContent?.trim()).toBe('Delete');
  });

  it('closes with true from the confirm button and with no value from cancel', async () => {
    await render(dialogData({ confirmLabel: 'Delete' }));
    const [cancel, confirm] = buttons();

    confirm.click();
    // `true` is the contract every caller branches on (`afterClosed()` -> `if (result)`).
    // Closing with `undefined` here would silently turn every confirmation into a no-op.
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);

    mockDialogRef.close.mockClear();
    cancel.click();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    // Asserts what actually happens, not what the markup reads like. Cancel is the bare
    // attribute form `mat-dialog-close`, and `MatDialogClose` takes its result from the
    // attribute value — which for a valueless attribute is `''`, not `undefined`.
    //
    // Harmless here only because every caller branches on truthiness (`if (result)`), and `''`
    // is falsy. Recorded rather than "fixed" to `[mat-dialog-close]="false"`: that changes the
    // value the dialog resolves with, and a caller doing `result !== undefined` would flip
    // from cancel to confirm. Left alone, asserted exactly, so a Material change here is loud.
    expect(mockDialogRef.close.mock.calls[0][0]).toBe('');
    expect(mockDialogRef.close.mock.calls[0][0]).toBeFalsy();
  });

  it('neither button submits a form', async () => {
    await render(dialogData());

    // Both are `type="button"`. A default `type="submit"` inside a dialog hosted in a form
    // submits the surrounding form as well as closing, which is how a "Cancel" ends up saving.
    expect(buttons().map((button) => button.getAttribute('type'))).toEqual(['button', 'button']);
  });

  describe('with data built by the trash-confirm helpers', () => {
    it('renders the single-document copy for trashDocumentConfirmData', async () => {
      await render(trashDocumentConfirmData('  Report.pdf  '));

      expect(fixture.nativeElement.querySelector('.msg')?.textContent?.trim()).toBe(
        'Move "Report.pdf" to trash?',
      );
      expect(buttons()[1].textContent?.trim()).toBe('Delete');
    });

    it('renders the counted copy for trashSelectedDocumentsConfirmData', async () => {
      await render(trashSelectedDocumentsConfirmData(4));

      expect(fixture.nativeElement.querySelector('.msg')?.textContent?.trim()).toBe(
        'Delete 4 selected document(s)?',
      );
    });
  });
});
