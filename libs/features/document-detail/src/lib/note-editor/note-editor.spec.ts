import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { NoteEditorComponent } from './note-editor';

vi.mock('quill', () => ({
  default: Object.assign(vi.fn(), { sources: { SILENT: 'silent', USER: 'user' } }),
}));

describe('NoteEditorComponent source sync (NXSAT-174)', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let component: NoteEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
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
});
