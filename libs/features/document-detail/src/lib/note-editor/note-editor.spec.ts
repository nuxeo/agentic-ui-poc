import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { NoteEditorComponent } from './note-editor';

interface FakeQuillRange {
  index: number;
  length: number;
}

interface FakeQuillLine {
  length(): number;
  domNode: { textContent: string };
}

interface FakeQuillToolbarOptions {
  container?: HTMLElement;
  handlers?: Record<string, (value: string | number | boolean) => void>;
}

interface FakeQuillOptions {
  theme?: string;
  placeholder?: string;
  modules?: { toolbar?: FakeQuillToolbarOptions };
}

/**
 * The surface of Quill that `NoteEditorComponent` and `applyHeaderFormatSelectionOnly` actually
 * use, plus recorders for every mutation.
 *
 * Declared in full up front. A double grown method-by-method inside individual tests would let
 * the component call something the double does not have and fail as an *unhandled* error rather
 * than a failing assertion.
 */
interface FakeQuill {
  editorNode: HTMLElement;
  toolbarNode: HTMLElement | undefined;
  headerHandler: ((value: string | number | boolean) => void) | undefined;
  textChangeHandlers: Array<() => void>;
  selection: FakeQuillRange | null;
  semanticHtml: string;
  docLength: number;
  focusCount: number;
  setContentsCalls: Array<{ html: string; source: string }>;
  setSelectionCalls: Array<{ index: number; length: number; source: string }>;
  insertEmbedCalls: Array<{ index: number; type: string; value: string; source: string }>;
  formatLineCalls: Array<{
    index: number;
    length: number;
    name: string;
    value: number | false;
    source: string;
  }>;
  insertTextCalls: Array<{ index: number; text: string; source: string }>;
  on(event: string, handler: () => void): void;
  getSelection(force?: boolean): FakeQuillRange | null;
  /**
   * Both real overloads: `(index, length, source)` and the shorter `(index, source)`. The
   * component uses the short form in `insertImageFromUrl` and the long one in
   * `applyExternalContent`, so a double that only understood one of them would silently record
   * a source as a length.
   */
  setSelection(index: number, lengthOrSource?: number | string, source?: string): void;
  getSemanticHTML(): string;
  getLength(): number;
  setContents(delta: { html: string }, source: string): void;
  insertEmbed(index: number, type: string, value: string, source: string): void;
  insertText(index: number, text: string, source: string): void;
  formatLine(
    index: number,
    length: number,
    name: string,
    value: number | false,
    source: string,
  ): void;
  getLine(index: number): [FakeQuillLine | null, number];
  getIndex(line: FakeQuillLine): number;
  focus(): void;
  clipboard: { convert(input: { html: string }): { html: string } };
}

/**
 * `vi.hoisted` so the recorder exists before the `vi.mock` factory below runs — `vi.mock` is
 * itself hoisted above the imports, so a plain `const` would still be in its temporal dead zone.
 */
const quillHarness = vi.hoisted(() => {
  const instances: FakeQuill[] = [];

  function create(editorNode: HTMLElement, options: FakeQuillOptions): FakeQuill {
    const instance: FakeQuill = {
      editorNode,
      toolbarNode: options.modules?.toolbar?.container,
      headerHandler: options.modules?.toolbar?.handlers?.['header'],
      textChangeHandlers: [],
      selection: null,
      semanticHtml: '',
      docLength: 1,
      focusCount: 0,
      setContentsCalls: [],
      setSelectionCalls: [],
      insertEmbedCalls: [],
      formatLineCalls: [],
      insertTextCalls: [],
      on(event, handler) {
        if (event === 'text-change') instance.textChangeHandlers.push(handler);
      },
      getSelection(force = false) {
        if (instance.selection) return instance.selection;
        // Real Quill focuses and returns a range when called with `true`.
        return force ? { index: 0, length: 0 } : null;
      },
      setSelection(index, lengthOrSource, source) {
        const length = typeof lengthOrSource === 'number' ? lengthOrSource : 0;
        const emitter =
          typeof lengthOrSource === 'number' ? (source ?? 'api') : (lengthOrSource ?? 'api');
        instance.selection = { index, length };
        instance.setSelectionCalls.push({ index, length, source: emitter });
      },
      getSemanticHTML() {
        return instance.semanticHtml;
      },
      getLength() {
        return instance.docLength;
      },
      setContents(delta, source) {
        instance.setContentsCalls.push({ html: delta.html, source });
        instance.semanticHtml = delta.html;
      },
      insertEmbed(index, type, value, source) {
        instance.insertEmbedCalls.push({ index, type, value, source });
      },
      insertText(index, text, source) {
        instance.insertTextCalls.push({ index, text, source });
      },
      formatLine(index, length, name, value, source) {
        instance.formatLineCalls.push({ index, length, name, value, source });
      },
      getLine() {
        return [null, 0];
      },
      getIndex() {
        return 0;
      },
      focus() {
        instance.focusCount += 1;
      },
      clipboard: {
        // Quill's clipboard converts HTML to a Delta; the double keeps the HTML so
        // `setContents` can be asserted against what was handed in.
        convert: (input: { html: string }) => ({ html: input.html }),
      },
    };
    instances.push(instance);
    return instance;
  }

  return { instances, create };
});

vi.mock('quill', () => ({
  default: Object.assign(
    function QuillDouble(editorNode: HTMLElement, options: FakeQuillOptions) {
      // A constructor function that returns an object: `new QuillDouble(...)` yields it.
      return quillHarness.create(editorNode, options);
    },
    { sources: { SILENT: 'silent', USER: 'user', API: 'api' } },
  ),
}));

/** Reads the private field the component uses to decide whether Quill is live. */
function quillOf(component: NoteEditorComponent): FakeQuill | null {
  return (component as unknown as { quill: FakeQuill | null }).quill;
}

function detachQuill(component: NoteEditorComponent): void {
  (component as unknown as { quill: FakeQuill | null }).quill = null;
}

function mouseDownWithTarget(target: EventTarget | null): MouseEvent {
  const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}

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

  it('sanitises script tags out of a read-only HTML note', () => {
    fixture.componentRef.setInput(
      'content',
      '<p>Safe</p><script>window.pwned = true</script><img src="x" onerror="alert(1)">',
    );
    fixture.componentRef.setInput('mimeType', 'text/html');
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    const editor = fixture.nativeElement.querySelector('.note-quill-editor .ql-editor');
    // Presence first: the safe part really did render, so the absences below are about
    // sanitisation and not about an empty view.
    expect(editor.innerHTML).toContain('Safe');
    expect(editor.innerHTML).not.toContain('<script');
    expect(editor.innerHTML).not.toContain('onerror');
  });

  it('leaves htmlReadonlyView null for a non-HTML note', () => {
    // Guard for the `if (!this.isHtml()) return null` head of the computed: mimeType here is
    // text/plain from the fixture setup.
    expect(fixture.componentInstance.htmlReadonlyView()).toBeNull();
    expect(fixture.componentInstance.markdownHtml()).toBeNull();
  });
});

describe('NoteEditorComponent source sync (NXSAT-174)', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let component: NoteEditorComponent;

  beforeEach(async () => {
    quillHarness.instances.length = 0;

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

  it('never constructs Quill when the toolbar and editor nodes are absent', () => {
    // The stub template has no `#quillToolbar`/`#quillEditor`, so `tryInitQuill` must bail
    // before `new Quill(...)`. This is what keeps the two describes above deterministic.
    expect(quillHarness.instances).toHaveLength(0);
    expect(quillOf(component)).toBeNull();
  });

  it('emits an empty body when asked to save with no live editor', () => {
    const saveSpy = vi.fn();
    component.saveNote.subscribe(saveSpy);

    component.onSave();

    // `readQuillHtml()` returns '' when Quill was never constructed. Recorded as the actual
    // behaviour: saving here would overwrite `note:note` with an empty string. Not changed —
    // in the shipped template the editor node always exists when this branch is reachable.
    expect(saveSpy).toHaveBeenCalledWith('');
  });
});

describe('NoteEditorComponent visual HTML editor', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let component: NoteEditorComponent;
  let quill: FakeQuill;
  let toolbar: HTMLElement;

  beforeEach(async () => {
    quillHarness.instances.length = 0;

    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', '<p>hello</p>');
    fixture.componentRef.setInput('mimeType', 'text/html');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(quillHarness.instances).toHaveLength(1);
    quill = quillHarness.instances[0];
    toolbar = fixture.nativeElement.querySelector('.note-quill-toolbar') as HTMLElement;
  });

  it('constructs Quill against the rendered toolbar and editor nodes', () => {
    expect(quill.toolbarNode).toBe(toolbar);
    expect(quill.editorNode).toBe(fixture.nativeElement.querySelector('.note-quill-editor'));
    expect(quillOf(component)).toBe(quill);
  });

  it('pushes the persisted note HTML into the editor silently', () => {
    // SILENT matters: an API/USER source would fire text-change and mark a freshly loaded
    // note dirty, so the next save would write back content the user never touched.
    expect(quill.setContentsCalls).toEqual([{ html: '<p>hello</p>', source: 'silent' }]);
  });

  describe('toolbar caret preservation', () => {
    it('saves the caret on toolbar mousedown and applies the header to that range', () => {
      quill.selection = { index: 3, length: 5 };

      const bold = toolbar.querySelector('.ql-bold') as HTMLElement;
      expect(bold).toBeTruthy();
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      bold.dispatchEvent(event);

      // Suppressing the default is what stops the editor losing its selection to the button.
      expect(event.defaultPrevented).toBe(true);

      // Quill has lost its selection to the toolbar by the time the handler runs.
      quill.selection = null;
      quill.headerHandler?.('2');

      expect(quill.formatLineCalls).toEqual([
        { index: 3, length: 5, name: 'header', value: 2, source: 'user' },
      ]);
    });

    it('clears the saved caret after using it once', () => {
      quill.selection = { index: 3, length: 5 };
      (toolbar.querySelector('.ql-bold') as HTMLElement).dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
      );
      quill.selection = null;
      quill.headerHandler?.('2');
      expect(quill.formatLineCalls).toHaveLength(1);

      // Applying the header re-selects the range in real Quill too, so the live selection has
      // to be cleared again to isolate what the *saved* range contributes.
      quill.selection = null;

      // A second header pick with no selection and no fresh mousedown must not reuse the
      // stale range — that is how a heading lands on text the user has since moved away from.
      quill.headerHandler?.('3');
      expect(quill.formatLineCalls).toHaveLength(1);
    });

    it('does not save a caret when there is none', () => {
      quill.selection = null;

      (toolbar.querySelector('.ql-bold') as HTMLElement).dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
      );
      quill.headerHandler?.('2');

      expect(quill.formatLineCalls).toEqual([]);
    });

    it('ignores a mousedown that did not originate inside the toolbar', () => {
      const outside = document.createElement('div');
      const event = mouseDownWithTarget(outside);

      component.onToolbarMouseDown(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores a mousedown whose target is not an element', () => {
      const event = mouseDownWithTarget(null);

      component.onToolbarMouseDown(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores a toolbar mousedown before Quill exists', () => {
      detachQuill(component);
      const bold = toolbar.querySelector('.ql-bold') as HTMLElement;
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

      bold.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it('does nothing when the header handler runs without a live editor', () => {
      detachQuill(component);
      expect(() => quill.headerHandler?.('2')).not.toThrow();
      expect(quill.formatLineCalls).toEqual([]);
    });
  });

  describe('save', () => {
    it('emits the current editor HTML', () => {
      const saveSpy = vi.fn();
      component.saveNote.subscribe(saveSpy);
      quill.semanticHtml = '<p>edited by hand</p>';

      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith('<p>edited by hand</p>');
    });

    it('emits the raw source text while source mode is active', async () => {
      const saveSpy = vi.fn();
      component.saveNote.subscribe(saveSpy);
      component.toggleSourceMode();
      fixture.detectChanges();
      await fixture.whenStable();
      component.editText.set('<p>hand written source</p>');

      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith('<p>hand written source</p>');
    });

    it('refuses to emit while a save is already in flight', () => {
      const saveSpy = vi.fn();
      component.saveNote.subscribe(saveSpy);
      fixture.componentRef.setInput('saving', true);
      fixture.detectChanges();

      component.onSave();

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('refuses to emit while the note is still loading', () => {
      const saveSpy = vi.fn();
      component.saveNote.subscribe(saveSpy);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      component.onSave();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('source mode round trip', () => {
    it('uses the live editor HTML when there are unsaved visual edits', () => {
      quill.semanticHtml = '<h1>Head</h1><p>Body</p>';
      quill.editorNode.innerHTML = '<div class="ql-editor">Head</div>';
      // Only a real text-change marks the editor dirty; without it the persisted content wins.
      quill.textChangeHandlers.forEach((handler) => handler());

      component.toggleSourceMode();

      expect(component.sourceMode()).toBe(true);
      expect(component.editText()).toBe('<h1>Head</h1>\n<p>Body</p>');
      // Quill is torn down so the textarea is the single source of truth for the HTML.
      expect(quillOf(component)).toBeNull();
      expect(quill.editorNode.innerHTML).toBe('');
    });

    it('uses the persisted content when the visual editor is untouched', () => {
      quill.semanticHtml = '<p>quill internal markup</p>';

      component.toggleSourceMode();

      expect(component.editText()).toBe('<p>hello</p>');
    });

    it('re-initialises Quill with the edited source on the way back', async () => {
      component.toggleSourceMode();
      fixture.detectChanges();
      await fixture.whenStable();
      component.editText.set('<p>from source</p>');

      component.toggleSourceMode();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.sourceMode()).toBe(false);
      expect(quillHarness.instances).toHaveLength(2);
      const reborn = quillHarness.instances[1];
      expect(reborn.setContentsCalls).toEqual([{ html: '<p>from source</p>', source: 'silent' }]);
      expect(component.editText()).toBe('<p>from source</p>');
    });

    it('refuses to toggle source mode in read-only mode', () => {
      fixture.componentRef.setInput('readOnly', true);
      fixture.detectChanges();

      component.toggleSourceMode();

      expect(component.sourceMode()).toBe(false);
    });
  });

  describe('image insertion', () => {
    it('clicks the hidden Quill image button so Quill opens its own file picker', () => {
      const hidden = fixture.nativeElement.querySelector(
        '.note-quill-hidden-image',
      ) as HTMLButtonElement;
      expect(hidden).toBeTruthy();
      const clicked = vi.fn();
      hidden.addEventListener('click', clicked);
      const event = new MouseEvent('click', { cancelable: true });

      component.onImageUploadClick(event);

      expect(event.defaultPrevented).toBe(true);
      expect(clicked).toHaveBeenCalled();
    });

    it('embeds an http(s) image at the caret and steps the caret past it', () => {
      const prompt = vi.spyOn(window, 'prompt').mockReturnValue('  https://cdn.test/a.png  ');
      quill.selection = { index: 7, length: 0 };

      component.insertImageFromUrl();

      expect(prompt).toHaveBeenCalledWith('Enter image URL', 'https://');
      expect(quill.insertEmbedCalls).toEqual([
        { index: 7, type: 'image', value: 'https://cdn.test/a.png', source: 'user' },
      ]);
      expect(quill.setSelectionCalls).toEqual([{ index: 8, length: 0, source: 'silent' }]);
      prompt.mockRestore();
    });

    it('rejects a javascript: URL', () => {
      const prompt = vi
        .spyOn(window, 'prompt')
        .mockReturnValue('javascript:alert(document.cookie)');

      component.insertImageFromUrl();

      // A javascript: URL in an <img src> is a stored-XSS vector once the note is saved and
      // re-rendered for another user.
      expect(quill.insertEmbedCalls).toEqual([]);
      prompt.mockRestore();
    });

    it('rejects a data: URL', () => {
      const prompt = vi
        .spyOn(window, 'prompt')
        .mockReturnValue('data:text/html;base64,PHNjcmlwdD4x');

      component.insertImageFromUrl();

      expect(quill.insertEmbedCalls).toEqual([]);
      prompt.mockRestore();
    });

    it('does nothing when the prompt is dismissed', () => {
      const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);

      component.insertImageFromUrl();

      expect(quill.insertEmbedCalls).toEqual([]);
      prompt.mockRestore();
    });

    it('does nothing when the prompt is left blank', () => {
      const prompt = vi.spyOn(window, 'prompt').mockReturnValue('   ');

      component.insertImageFromUrl();

      expect(quill.insertEmbedCalls).toEqual([]);
      prompt.mockRestore();
    });

    it('does not prompt at all when there is no live editor', () => {
      detachQuill(component);
      const prompt = vi.spyOn(window, 'prompt').mockReturnValue('https://cdn.test/a.png');

      component.insertImageFromUrl();

      expect(prompt).not.toHaveBeenCalled();
      prompt.mockRestore();
    });
  });

  describe('external content updates', () => {
    it('replaces the editor contents when the parent supplies new HTML', async () => {
      quill.semanticHtml = '<p>hello</p>';

      fixture.componentRef.setInput('content', '<p>updated elsewhere</p>');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quill.setContentsCalls.at(-1)).toEqual({
        html: '<p>updated elsewhere</p>',
        source: 'silent',
      });
    });

    it('leaves the editor alone when the incoming HTML already matches', async () => {
      // The parent re-emits the same note on every poll; re-setting contents would drop the
      // caret on every tick.
      const before = quill.setContentsCalls.length;
      quill.semanticHtml = '<p>same</p>';

      fixture.componentRef.setInput('content', '<p>same</p>');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quill.setContentsCalls).toHaveLength(before);
    });

    it('clamps a restored selection to the new document length', async () => {
      quill.semanticHtml = '<p>hello</p>';
      quill.selection = { index: 10, length: 4 };
      quill.docLength = 5;

      fixture.componentRef.setInput('content', '<p>much shorter</p>');
      fixture.detectChanges();
      await fixture.whenStable();

      // index clamped to docLength-1 = 4, length clamped to docLength-index = 1. Without the
      // clamp Quill throws on a selection that runs past the end of the new document.
      expect(quill.setSelectionCalls.at(-1)).toEqual({ index: 4, length: 1, source: 'silent' });
    });

    it('treats a cleared note as empty HTML rather than skipping the update', async () => {
      quill.semanticHtml = '<p>hello</p>';

      fixture.componentRef.setInput('content', '');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quill.setContentsCalls.at(-1)).toEqual({ html: '', source: 'silent' });
    });

    it('does not push parent content into the editor while source mode is active', async () => {
      component.toggleSourceMode();
      fixture.detectChanges();
      await fixture.whenStable();
      const before = quill.setContentsCalls.length;

      fixture.componentRef.setInput('content', '<p>arrived during source editing</p>');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quill.setContentsCalls).toHaveLength(before);
      expect(component.editText()).toBe('<p>hello</p>');
    });
  });

  describe('auto focus', () => {
    it('focuses the editor and announces it', async () => {
      const focusedSpy = vi.fn();
      component.focused.subscribe(focusedSpy);

      fixture.componentRef.setInput('autoFocus', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quill.focusCount).toBe(1);
      expect(focusedSpy).toHaveBeenCalled();
    });

    it('does not steal focus while source mode is active', async () => {
      component.toggleSourceMode();
      fixture.detectChanges();
      await fixture.whenStable();
      const focusedSpy = vi.fn();
      component.focused.subscribe(focusedSpy);

      fixture.componentRef.setInput('autoFocus', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(focusedSpy).not.toHaveBeenCalled();
    });

    it('does not steal focus in read-only mode', async () => {
      const focusedSpy = vi.fn();
      component.focused.subscribe(focusedSpy);
      fixture.componentRef.setInput('readOnly', true);

      fixture.componentRef.setInput('autoFocus', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(focusedSpy).not.toHaveBeenCalled();
    });

    it('does not steal focus while the note is still loading', async () => {
      const focusedSpy = vi.fn();
      component.focused.subscribe(focusedSpy);
      fixture.componentRef.setInput('loading', true);

      fixture.componentRef.setInput('autoFocus', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(focusedSpy).not.toHaveBeenCalled();
    });
  });

  it('tears Quill down when the component is destroyed', () => {
    quill.editorNode.innerHTML = '<div>leftover</div>';

    fixture.destroy();

    expect(quillOf(component)).toBeNull();
    expect(quill.editorNode.innerHTML).toBe('');
  });
});

describe('NoteEditorComponent markdown notes', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;

  beforeEach(async () => {
    quillHarness.instances.length = 0;

    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    fixture.componentRef.setInput('content', '# Title\n\n**bold** and *italic*');
    fixture.componentRef.setInput('mimeType', 'text/markdown');
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders markdown to HTML for the read-only view', () => {
    const rendered = fixture.nativeElement.querySelector('.note-markdown-rendered');
    expect(rendered).toBeTruthy();
    expect(rendered.innerHTML).toContain('<h1>Title</h1>');
    expect(rendered.innerHTML).toContain('<strong>bold</strong>');
    expect(rendered.innerHTML).toContain('<em>italic</em>');
  });

  it('does not produce an HTML read-only view for a markdown note', () => {
    // Presence asserted above; this is the complementary branch of the two computeds.
    expect(fixture.componentInstance.markdownHtml()).not.toBeNull();
    expect(fixture.componentInstance.htmlReadonlyView()).toBeNull();
  });

  it('sanitises inline HTML smuggled into markdown', () => {
    fixture.componentRef.setInput('content', 'ok <script>window.pwned=1</script>');
    fixture.detectChanges();

    const rendered = fixture.nativeElement.querySelector('.note-markdown-rendered');
    expect(rendered.innerHTML).toContain('ok');
    expect(rendered.innerHTML).not.toContain('<script');
  });

  it('never constructs Quill for a markdown note', () => {
    expect(quillHarness.instances).toHaveLength(0);
  });
});

describe('NoteEditorComponent plain text editing', () => {
  let fixture: ComponentFixture<NoteEditorComponent>;
  let component: NoteEditorComponent;

  beforeEach(async () => {
    quillHarness.instances.length = 0;

    await TestBed.configureTestingModule({
      imports: [NoteEditorComponent, NoopAnimationsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', 'original body');
    fixture.componentRef.setInput('mimeType', 'text/plain');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('mirrors the parent content into the edit buffer while not editing', () => {
    expect(component.plainTextEditMode()).toBe(false);
    expect(component.editText()).toBe('original body');

    fixture.componentRef.setInput('content', 'changed upstream');
    fixture.detectChanges();

    expect(component.editText()).toBe('changed upstream');
  });

  it('enters edit mode and focuses the textarea', async () => {
    component.enterPlainTextEdit();
    fixture.detectChanges();
    await fixture.whenStable();

    const textarea = fixture.nativeElement.querySelector(
      'textarea.note-plain-editor',
    ) as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(component.editText()).toBe('original body');
    expect(document.activeElement).toBe(textarea);
  });

  it('refuses to enter edit mode when read-only', () => {
    fixture.componentRef.setInput('readOnly', true);
    fixture.detectChanges();

    component.enterPlainTextEdit();

    expect(component.plainTextEditMode()).toBe(false);
  });

  it('discards local edits on cancel', () => {
    component.enterPlainTextEdit();
    component.editText.set('half-finished draft');

    component.cancelPlainTextEdit();

    expect(component.plainTextEditMode()).toBe(false);
    expect(component.editText()).toBe('original body');
  });

  it('emits the edit buffer on save', () => {
    const saveSpy = vi.fn();
    component.saveNote.subscribe(saveSpy);
    component.enterPlainTextEdit();
    component.editText.set('new body');

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith('new body');
    expect(component.plainTextEditMode()).toBe(true);
  });

  it('leaves edit mode once the parent echoes the saved body back', async () => {
    component.enterPlainTextEdit();
    component.editText.set('new body');
    component.onSave();

    fixture.componentRef.setInput('content', 'new body');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.plainTextEditMode()).toBe(false);
    expect(component.editText()).toBe('new body');
  });

  it('stays in edit mode when a different body arrives mid-save', async () => {
    component.enterPlainTextEdit();
    component.editText.set('new body');
    component.onSave();

    // A concurrent edit by someone else, not the echo of our own save.
    fixture.componentRef.setInput('content', 'someone else won');
    fixture.detectChanges();
    await fixture.whenStable();

    // The user's in-progress text is preserved rather than being replaced under the caret.
    expect(component.plainTextEditMode()).toBe(true);
    expect(component.editText()).toBe('new body');
  });

  /**
   * DEFECT (note-editor.ts:123-140): the exit-edit-mode branch is missed when the parent lands
   * the saved content and `saving` is still true.
   *
   * The first condition requires `!saving`; the two fallbacks require either not being in edit
   * mode or `lastEmittedSave === null`, and neither holds here. `syncedPlainContent` has already
   * been advanced, so when `saving` later flips to false the effect re-runs and short-circuits on
   * `text !== this.syncedPlainContent` — the editor never leaves edit mode. Recovering needs
   * another distinct content change.
   *
   * Left as-is and asserted as it behaves: the fix is a behaviour change in the parent/child
   * contract (either re-check on the `saving` transition, or require the parent to clear
   * `saving` before pushing content), which is not a test-only decision.
   */
  it('stays stuck in edit mode when the echo arrives before saving is cleared', async () => {
    component.enterPlainTextEdit();
    component.editText.set('new body');
    component.onSave();

    fixture.componentRef.setInput('saving', true);
    fixture.componentRef.setInput('content', 'new body');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.plainTextEditMode()).toBe(true);

    fixture.componentRef.setInput('saving', false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.plainTextEditMode()).toBe(true);
  });

  it('leaves edit mode when content changes underneath an unsaved edit', async () => {
    component.enterPlainTextEdit();
    component.editText.set('half-finished draft');

    fixture.componentRef.setInput('content', 'replaced by another user');
    fixture.detectChanges();
    await fixture.whenStable();

    // No save was emitted, so there is nothing of the user's to protect: the newer server
    // content wins and the editor drops back to the read view.
    expect(component.plainTextEditMode()).toBe(false);
    expect(component.editText()).toBe('replaced by another user');
  });

  it('auto-focuses into plain text edit mode and announces it', async () => {
    const focusedSpy = vi.fn();
    component.focused.subscribe(focusedSpy);

    fixture.componentRef.setInput('autoFocus', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.plainTextEditMode()).toBe(true);
    expect(focusedSpy).toHaveBeenCalled();
  });
});
