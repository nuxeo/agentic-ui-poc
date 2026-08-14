import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { NoteEditorComponent } from './note-editor';

vi.mock('quill', () => ({
  default: Object.assign(vi.fn(), { sources: { SILENT: 'silent', USER: 'user' } }),
}));

describe('NoteEditorComponent (NXSAT-163)', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()],
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

describe('NoteEditorComponent source sync (NXSAT-174)', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let component: NoteEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(NoteEditorComponent, {
        set: { template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', '<p>parent</p>');
    fixture.componentRef.setInput('mimeType', 'text/html');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('does not overwrite editText from parent while source mode is active', async () => {
    component.sourceMode.set(true);
    component.editText.set('<p>local source html</p>');
    await fixture.whenStable();

    fixture.componentRef.setInput('content', '<p>stale parent content</p>');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.editText()).toBe('<p>local source html</p>');
  });

  it('restores editText after leaving source mode', async () => {
    component.sourceMode.set(true);
    component.editText.set('<p>edited in source</p>');

    component.toggleSourceMode();
    await fixture.whenStable();

    expect(component.sourceMode()).toBe(false);
    expect(component.editText()).toBe('<p>edited in source</p>');
  });

  it('enters source mode from stored note:note when visual editor is unchanged (NXSAT-174)', () => {
    fixture.componentRef.setInput('content', '<h1>Heading 1</h1><h2>Heading 2</h2>');
    fixture.detectChanges();

    component.toggleSourceMode();

    expect(component.sourceMode()).toBe(true);
    expect(component.editText()).toBe('<h1>Heading 1</h1>\n<h2>Heading 2</h2>');
  });
});
