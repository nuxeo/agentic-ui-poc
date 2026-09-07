import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import {
  ReplaceAttachmentDialogComponent,
  type ReplaceAttachmentDialogData,
} from './replace-attachment-dialog';

const mockDialogRef = {
  close: vi.fn(),
};

const dialogData: ReplaceAttachmentDialogData = {
  fileName: 'contract.pdf',
};

function aFile(name: string): File {
  return new File(['payload'], name, { type: 'application/pdf' });
}

/**
 * A `<input type="file">` whose `files` list really contains `file`.
 *
 * `FileList` has no public constructor, so the list is installed via `defineProperty` on a real
 * input element. Handing the component a plain `{ files: [file] }` literal would exercise an
 * indexable shape the browser never produces.
 */
function fileInputWith(files: File[]): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  const list: FileList = Object.assign(files.slice(), {
    item: (i: number) => files[i] ?? null,
  }) as unknown as FileList;
  Object.defineProperty(input, 'files', { value: list, configurable: true });
  return input;
}

/** A drag event carrying a `dataTransfer.files` list, which jsdom cannot build natively. */
function dragEventOn(
  currentTarget: HTMLElement,
  files: File[] | null,
): DragEvent & { preventDefault: () => void } {
  const preventDefault = vi.fn();
  const dataTransfer =
    files === null
      ? undefined
      : {
          files: Object.assign(files.slice(), {
            item: (i: number) => files[i] ?? null,
          }) as unknown as FileList,
        };
  return {
    preventDefault,
    currentTarget,
    dataTransfer,
  } as unknown as DragEvent & { preventDefault: () => void };
}

describe('ReplaceAttachmentDialogComponent', () => {
  let component: ReplaceAttachmentDialogComponent;
  let fixture: ComponentFixture<ReplaceAttachmentDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ReplaceAttachmentDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    })
      .overrideComponent(ReplaceAttachmentDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReplaceAttachmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with no file chosen and exposes the file being replaced', () => {
    expect(component.selectedFile()).toBeNull();
    expect(component.data.fileName).toBe('contract.pdf');
  });

  describe('file picker', () => {
    it('takes the first file from the input', () => {
      const input = fileInputWith([aFile('new.pdf'), aFile('ignored.pdf')]);

      component.onFileSelected({ target: input } as unknown as Event);

      expect(component.selectedFile()?.name).toBe('new.pdf');
    });

    it('keeps the previous selection when the picker is dismissed with no file', () => {
      const chosen = aFile('new.pdf');
      component.selectedFile.set(chosen);

      component.onFileSelected({ target: fileInputWith([]) } as unknown as Event);

      // Cancelling the OS file dialog fires `change` with an empty list; clearing here would
      // silently discard a file the user had already picked.
      expect(component.selectedFile()).toBe(chosen);
    });
  });

  describe('drag and drop', () => {
    it('marks the zone as a drop target and suppresses the browser default', () => {
      const zone = document.createElement('label');
      const event = dragEventOn(zone, []);

      component.onDragOver(event);

      // Without preventDefault the browser navigates to the dragged file instead of dropping it.
      expect(event.preventDefault).toHaveBeenCalled();
      expect(zone.classList.contains('dragover')).toBe(true);
    });

    it('unmarks the zone when the pointer leaves', () => {
      const zone = document.createElement('label');
      zone.classList.add('dragover');

      component.onDragLeave(dragEventOn(zone, []));

      expect(zone.classList.contains('dragover')).toBe(false);
    });

    it('accepts the first dropped file and clears the drop highlight', () => {
      const zone = document.createElement('label');
      zone.classList.add('dragover');
      const event = dragEventOn(zone, [aFile('dropped.pdf'), aFile('second.pdf')]);

      component.onDrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(zone.classList.contains('dragover')).toBe(false);
      expect(component.selectedFile()?.name).toBe('dropped.pdf');
    });

    it('keeps the previous selection when the drop carries no files', () => {
      const chosen = aFile('new.pdf');
      component.selectedFile.set(chosen);
      const zone = document.createElement('label');

      component.onDrop(dragEventOn(zone, []));

      expect(component.selectedFile()).toBe(chosen);
    });

    it('survives a drop with no dataTransfer at all', () => {
      const zone = document.createElement('label');

      expect(() => component.onDrop(dragEventOn(zone, null))).not.toThrow();
      expect(component.selectedFile()).toBeNull();
    });
  });

  it('closes with null when cancelled', () => {
    component.selectedFile.set(aFile('new.pdf'));

    component.cancel();

    // Explicitly null, not undefined: the caller distinguishes "cancelled" from "no file".
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('closes with the chosen file when confirmed', () => {
    const chosen = aFile('new.pdf');
    component.selectedFile.set(chosen);

    component.confirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(chosen);
  });
});
