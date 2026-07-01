import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  isHtmlNoteFormat,
  isMarkdownNoteFormat,
  isSafeHttpUrl,
  renderNoteMarkdown,
} from '@agentic-ui/shared/nuxeo-client';
import DOMPurify from 'dompurify';
import Quill from 'quill';
import { applyHeaderFormatSelectionOnly, type QuillRange } from './note-quill-header';

@Component({
  selector: 'lib-note-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './note-editor.html',
  styleUrl: './note-editor.scss',
})
export class NoteEditorComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly content = input.required<string>();
  readonly mimeType = input.required<string>();
  readonly saving = input(false);
  readonly loading = input(false);
  readonly autoFocus = input(false);

  readonly saveNote = output<string>();
  readonly focused = output<void>();

  readonly sourceMode = signal(false);
  readonly plainTextEditMode = signal(false);
  readonly editText = signal('');

  private readonly quillToolbarRef = viewChild<ElementRef<HTMLDivElement>>('quillToolbar');
  private readonly quillEditorRef = viewChild<ElementRef<HTMLDivElement>>('quillEditor');
  private readonly hiddenImageBtnRef = viewChild<ElementRef<HTMLButtonElement>>('hiddenImageBtn');
  private readonly plainTextEditorRef =
    viewChild<ElementRef<HTMLTextAreaElement>>('plainTextEditor');

  private quill: Quill | null = null;
  private syncedInputContent: string | null = null;
  private syncedPlainContent: string | null = null;
  private lastEmittedSave: string | null = null;
  private savedRange: QuillRange | null = null;

  readonly isHtml = () => isHtmlNoteFormat(this.mimeType());
  readonly isMarkdown = () => isMarkdownNoteFormat(this.mimeType());

  readonly markdownHtml = computed(() => {
    if (!this.isMarkdown()) return null;
    const raw = renderNoteMarkdown(this.content() ?? '');
    const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  });

  constructor() {
    afterNextRender(() => this.tryInitQuill());

    effect(() => {
      const text = this.content();
      const mime = this.mimeType();
      const source = this.sourceMode();
      const saving = this.saving();

      if (isHtmlNoteFormat(mime)) {
        this.editText.set(text);
        if (source || text === this.syncedInputContent) return;
        queueMicrotask(() => {
          if (!this.quill) {
            this.tryInitQuill();
          } else {
            this.applyExternalContent(text);
          }
          this.syncedInputContent = text;
        });
        return;
      }

      if (text !== this.syncedPlainContent) {
        this.syncedPlainContent = text;
        if (
          this.plainTextEditMode() &&
          this.lastEmittedSave !== null &&
          text === this.lastEmittedSave &&
          !saving
        ) {
          this.plainTextEditMode.set(false);
          this.lastEmittedSave = null;
          this.editText.set(text);
        } else if (!this.plainTextEditMode()) {
          this.editText.set(text);
        } else if (this.lastEmittedSave === null) {
          this.plainTextEditMode.set(false);
          this.editText.set(text);
        }
      }
    });

    effect(() => {
      if (!this.autoFocus() || this.loading()) return;
      if (this.isHtml()) {
        if (this.sourceMode()) return;
        queueMicrotask(() => {
          this.quill?.focus();
          this.focused.emit();
        });
        return;
      }
      queueMicrotask(() => {
        this.enterPlainTextEdit();
        this.focused.emit();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.quill = null;
    });
  }

  onToolbarMouseDown(event: MouseEvent): void {
    if (!this.quill) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.closest('.note-quill-toolbar')) return;
    event.preventDefault();
    const range = this.quill.getSelection();
    if (range) {
      this.savedRange = { index: range.index, length: range.length };
    }
  }

  toggleSourceMode(): void {
    if (!this.isHtml()) return;

    if (this.sourceMode()) {
      const html = this.editText();
      this.sourceMode.set(false);
      this.syncedInputContent = null;
      queueMicrotask(() => {
        this.tryInitQuill();
        this.applyExternalContent(html, true);
        this.syncedInputContent = html;
      });
      return;
    }

    if (this.quill) {
      const html = this.readQuillHtml();
      this.editText.set(html);
      this.syncedInputContent = html;
      this.quill = null;
    }
    this.sourceMode.set(true);
  }

  onImageUploadClick(event: MouseEvent): void {
    event.preventDefault();
    this.hiddenImageBtnRef()?.nativeElement.click();
  }

  insertImageFromUrl(): void {
    if (!this.quill) return;
    const url = window.prompt('Enter image URL', 'https://');
    if (!url?.trim()) return;
    const trimmed = url.trim();
    if (!isSafeHttpUrl(trimmed)) return;
    const range = this.quill.getSelection(true);
    this.quill.insertEmbed(range.index, 'image', trimmed, Quill.sources.USER);
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
  }

  onSave(): void {
    if (this.saving() || this.loading()) return;
    const body = this.isHtml()
      ? this.sourceMode()
        ? this.editText()
        : this.readQuillHtml()
      : this.editText();
    if (!this.isHtml()) {
      this.lastEmittedSave = body;
    }
    this.saveNote.emit(body);
  }

  enterPlainTextEdit(): void {
    this.editText.set(this.content());
    this.plainTextEditMode.set(true);
    queueMicrotask(() => this.plainTextEditorRef()?.nativeElement?.focus());
  }

  cancelPlainTextEdit(): void {
    this.editText.set(this.content());
    this.plainTextEditMode.set(false);
    this.lastEmittedSave = null;
  }

  private tryInitQuill(): void {
    if (this.sourceMode() || !this.isHtml() || this.loading() || this.quill) return;

    const toolbar = this.quillToolbarRef()?.nativeElement;
    const editor = this.quillEditorRef()?.nativeElement;
    if (!toolbar || !editor) return;

    const getSavedRange = (): QuillRange | null => this.savedRange;
    const clearSavedRange = (): void => {
      this.savedRange = null;
    };

    this.quill = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: toolbar,
          handlers: {
            header: (value: string | number | boolean) => {
              const editorQuill = this.quill;
              if (!editorQuill) return;
              applyHeaderFormatSelectionOnly(editorQuill, value, getSavedRange());
              clearSavedRange();
            },
          },
        },
      },
      placeholder: 'Type here...',
    });

    const html = this.content();
    this.applyExternalContent(html, true);
    this.syncedInputContent = html;
  }

  private applyExternalContent(html: string, force = false): void {
    if (!this.quill) return;

    const incoming = html || '';
    if (!force) {
      const current = this.quill.getSemanticHTML();
      if (current === incoming) return;
    }

    const selection = this.quill.getSelection();
    const delta = this.quill.clipboard.convert({ html: incoming });
    this.quill.setContents(delta, Quill.sources.SILENT);

    if (selection) {
      const docLength = this.quill.getLength();
      const index = Math.min(selection.index, Math.max(0, docLength - 1));
      const length = Math.min(selection.length, docLength - index);
      this.quill.setSelection(index, length, Quill.sources.SILENT);
    }
  }

  private readQuillHtml(): string {
    if (!this.quill) return '';
    return this.quill.getSemanticHTML();
  }
}
