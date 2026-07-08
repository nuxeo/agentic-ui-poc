import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { NoteEditorComponent } from './note-editor';

describe('NoteEditorComponent (NXSAT-163)', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, NoopAnimationsModule],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    fixture.componentRef.setInput('content', 'Hello note');
    fixture.componentRef.setInput('mimeType', 'text/plain');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows edit controls for writable notes', () => {
    fixture.componentRef.setInput('readOnly', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.note-plain-edit-btn')).toBeTruthy();
  });

  it('hides edit controls in read-only mode', () => {
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.note-plain-edit-btn')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.note-plain-readonly')?.textContent).toContain(
      'Hello note',
    );
  });

  it('does not emit saveNote when read-only', () => {
    const saveSpy = vi.fn();
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    fixture.componentInstance.saveNote.subscribe(saveSpy);

    fixture.componentInstance.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('renders read-only HTML notes inside a Quill editor container', () => {
    fixture.componentRef.setInput('content', '<p class="ql-align-center">Centered</p>');
    fixture.componentRef.setInput('mimeType', 'text/html');
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector(
      '.note-quill-editor.ql-container .ql-editor',
    );
    expect(editor).toBeTruthy();
    expect(editor.innerHTML).toContain('ql-align-center');
  });
});
