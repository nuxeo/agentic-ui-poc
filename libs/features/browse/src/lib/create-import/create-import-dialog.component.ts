import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  BrowseService,
  DirectoryService,
  DocumentImportService,
  RESTRICTED_IMPORT_LOCATION_MESSAGE,
  docTypeIcon,
  isBlobHoldingDocType,
  isFolderishDocument,
  isRestrictedImportParentPath,
  sanitizeDocumentName,
  type DirectoryEntry,
  type L10nDirectoryEntry,
} from '@agentic-ui/shared/nuxeo-client';

export interface CreateImportDialogData {
  /** Import target folder; if omitted, falls back to `DocumentImportService.getDefaultImportParentPath()`. */
  parentPath?: string | null;
  parentTitle?: string;
}

export type DialogTab = 'create' | 'import';

export interface DocTypeDef {
  type: string;
  label: string;
  icon: string;
}

const NOTE_FORMAT_OPTIONS = [
  { value: 'text/html', label: 'HTML' },
  { value: 'text/plain', label: 'Text' },
  { value: 'text/xml', label: 'XML' },
  { value: 'text/markdown', label: 'Markdown' },
] as const;

function defaultNoteContent(mimeType: string): string {
  return mimeType === 'text/html' ? '<p></p>' : '';
}

const DOC_TYPE_LABELS: Record<string, string> = {
  Audio: 'Audio',
  Collection: 'Collection',
  File: 'File',
  Folder: 'Folder',
  Note: 'Note',
  OrderedFolder: 'Ordered Folder',
  Picture: 'Picture',
  Video: 'Video',
  Workspace: 'Workspace',
  Section: 'Section',
  SectionRoot: 'Section Root',
  TemplateRoot: 'Template Root',
  Domain: 'Domain',
  WorkspaceRoot: 'Workspace Root',
};

function docTypeLabel(type: string): string {
  return DOC_TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function toDocTypeDefs(types: string[]): DocTypeDef[] {
  return types.map((type) => ({
    type,
    label: docTypeLabel(type),
    icon: docTypeIcon(type),
  }));
}

const DIALOG_SIZE = {
  content: { width: '960px', height: '680px' },
  success: { width: '440px' },
} as const;

@Component({
  selector: 'lib-create-import-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-import-dialog.component.html',
  styleUrl: './create-import-dialog.component.scss',
})
export class CreateImportDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<CreateImportDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<CreateImportDialogData>(MAT_DIALOG_DATA);
  private readonly importService = inject(DocumentImportService);
  private readonly browse = inject(BrowseService);
  private readonly directoryService = inject(DirectoryService);

  private folderContextRequestId = 0;
  private locationSuggestionsRequestId = 0;

  readonly noteFormatOptions = NOTE_FORMAT_OPTIONS;
  readonly restrictedLocationMessage = RESTRICTED_IMPORT_LOCATION_MESSAGE;

  constructor() {
    effect(() => {
      const path = this.parentPath();
      if (!path) return;
      this.loadLocationSuggestions(path);
      if (isRestrictedImportParentPath(path)) {
        this.creatableTypes.set([]);
        this.loadingContext.set(false);
        this.typesLoadError.set(null);
        return;
      }
      this.loadFolderContext(path);
    });

    effect(() => {
      const v = this.view();
      if (v === 'success') {
        this.dialogRef.updateSize(DIALOG_SIZE.success.width);
      } else {
        this.dialogRef.updateSize(DIALOG_SIZE.content.width, DIALOG_SIZE.content.height);
      }
    });
  }

  readonly resolvingPath = signal(false);
  readonly parentPath = signal<string | null>(null);
  readonly pathError = signal<string | null>(null);

  readonly view = signal<'main' | 'templateForm' | 'success'>('main');
  readonly activeTab = signal<DialogTab>('create');

  readonly selectedDocType = signal<DocTypeDef | null>(null);
  readonly creatableTypes = signal<DocTypeDef[]>([]);
  readonly loadingContext = signal(false);
  readonly typesLoadError = signal<string | null>(null);

  locationInput = '';

  readonly locationSuggestions = signal<{ path: string; title: string }[]>([]);
  readonly locationDropdownOpen = signal(false);
  readonly locationHighlightIndex = signal(-1);
  readonly loadingLocationSuggestions = signal(false);

  readonly natureEntries = signal<DirectoryEntry[]>([]);
  readonly subjectEntries = signal<L10nDirectoryEntry[]>([]);
  readonly coverageEntries = signal<L10nDirectoryEntry[]>([]);
  readonly directoriesLoaded = signal(false);

  docTitle = '';
  description = '';
  nature: string | null = null;
  subjects: string[] = [];
  coverage: string | null = null;
  naturePanelSearch = '';
  subjectsPanelSearch = '';
  coveragePanelSearch = '';
  expires: Date | null = null;
  noteFormat = 'text/html';

  readonly mainFile = signal<File | null>(null);
  readonly dragOverContent = signal(false);

  readonly uploadFiles = signal<File[]>([]);

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly dragOverUpload = signal(false);

  readonly hasContentField = computed(() => {
    const type = this.selectedDocType()?.type;
    return type ? isBlobHoldingDocType(type) : false;
  });

  readonly createMissingMainFile = computed(() => {
    const type = this.selectedDocType()?.type;
    return type ? isBlobHoldingDocType(type) && !this.mainFile() : false;
  });

  readonly isNoteType = computed(() => this.selectedDocType()?.type === 'Note');

  readonly locationRestricted = computed(() => isRestrictedImportParentPath(this.parentPath()));

  ngOnInit(): void {
    this.loadDirectories();

    const p = this.data.parentPath;
    if (p && p.trim()) {
      this.parentPath.set(this.normalizePath(p));
      this.syncLocationInputFromPath();
    } else {
      this.resolvingPath.set(true);
      this.importService
        .getDefaultImportParentPath()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (path) => {
            this.parentPath.set(this.normalizePath(path));
            this.syncLocationInputFromPath();
            this.resolvingPath.set(false);
          },
          error: () => {
            this.pathError.set(
              'Could not resolve a default folder. Open a folder in Browse first.',
            );
            this.resolvingPath.set(false);
          },
        });
    }
  }

  private loadDirectories(): void {
    forkJoin({
      nature: this.directoryService.getEntries('nature'),
      subjects: this.directoryService.getAllL10nEntries('l10nsubjects'),
      coverage: this.directoryService.getAllL10nEntries('l10ncoverage'),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ nature, subjects, coverage }) => {
          this.natureEntries.set(nature);
          this.subjectEntries.set(subjects);
          this.coverageEntries.set(coverage);
          this.directoriesLoaded.set(true);
        },
        error: () => {
          this.directoriesLoaded.set(true);
        },
      });
  }

  private loadFolderContext(path: string): void {
    const requestId = this.folderContextRequestId + 1;
    this.folderContextRequestId = requestId;
    this.loadingContext.set(true);
    this.typesLoadError.set(null);
    this.browse
      .getCreatableSubtypes(path)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          if (requestId !== this.folderContextRequestId) {
            return;
          }
          this.creatableTypes.set(toDocTypeDefs(types));
          this.loadingContext.set(false);
        },
        error: () => {
          if (requestId !== this.folderContextRequestId) {
            return;
          }
          this.creatableTypes.set([]);
          this.typesLoadError.set('Could not load creatable document types for this folder.');
          this.loadingContext.set(false);
        },
      });
  }

  private loadLocationSuggestions(path: string): void {
    const requestId = this.locationSuggestionsRequestId + 1;
    this.locationSuggestionsRequestId = requestId;
    this.loadingLocationSuggestions.set(true);
    this.browse
      .getChildren(path, 50, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          if (requestId !== this.locationSuggestionsRequestId) {
            return;
          }
          const folders = (list.entries ?? []).filter((d) => isFolderishDocument(d));
          this.locationSuggestions.set(
            folders.map((f) => ({
              path: this.normalizePath(f.path ?? path),
              title: f.title ?? f.path?.split('/').pop() ?? '',
            })),
          );
          this.locationHighlightIndex.set(folders.length > 0 ? 0 : -1);
          this.loadingLocationSuggestions.set(false);
        },
        error: () => {
          if (requestId !== this.locationSuggestionsRequestId) {
            return;
          }
          this.locationSuggestions.set([]);
          this.locationHighlightIndex.set(-1);
          this.loadingLocationSuggestions.set(false);
        },
      });
  }

  private normalizePath(path: string): string {
    const trimmed = path.trim();
    if (!trimmed) return '/';
    const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeading.replace(/\/+$/, '') || '/';
  }

  private syncLocationInputFromPath(): void {
    const path = this.parentPath();
    if (path) {
      this.locationInput = this.normalizePath(path);
    }
  }

  commitLocationInput(): void {
    const raw = this.locationInput.trim();
    if (!raw) return;
    const normalized = this.normalizePath(raw);
    this.parentPath.set(normalized);
    this.locationInput = normalized;
    this.locationDropdownOpen.set(false);
    this.locationHighlightIndex.set(-1);
  }

  onLocationFocus(): void {
    if (this.locationInput.endsWith('/')) {
      this.locationDropdownOpen.set(true);
      this.loadLocationSuggestions(this.pathForLocationSuggestions());
    }
  }

  /** Show child folders when the input ends with `/`. */
  onLocationInput(): void {
    if (!this.locationInput.endsWith('/')) {
      this.locationDropdownOpen.set(false);
      this.locationHighlightIndex.set(-1);
      return;
    }
    this.locationDropdownOpen.set(true);
    this.loadLocationSuggestions(this.pathForLocationSuggestions());
  }

  onLocationKeydown(event: KeyboardEvent): void {
    const suggestions = this.locationSuggestions();
    const navigable = this.isLocationDropdownNavigable();

    switch (event.key) {
      case 'ArrowDown':
        if (!navigable) {
          if (this.locationInput.endsWith('/')) {
            this.locationDropdownOpen.set(true);
            this.loadLocationSuggestions(this.pathForLocationSuggestions());
          }
          return;
        }
        event.preventDefault();
        this.locationHighlightIndex.update((i) => (i < suggestions.length - 1 ? i + 1 : 0));
        this.scrollLocationHighlightIntoView();
        break;
      case 'ArrowUp':
        if (!navigable) return;
        event.preventDefault();
        this.locationHighlightIndex.update((i) => (i > 0 ? i - 1 : suggestions.length - 1));
        this.scrollLocationHighlightIntoView();
        break;
      case 'Enter':
        event.preventDefault();
        if (navigable) {
          const idx = this.locationHighlightIndex();
          if (idx >= 0 && idx < suggestions.length) {
            this.selectLocationSuggestion(suggestions[idx].path);
            return;
          }
        }
        this.commitLocationInput();
        break;
      case 'Escape':
        if (this.locationDropdownOpen()) {
          event.preventDefault();
          this.locationDropdownOpen.set(false);
          this.locationHighlightIndex.set(-1);
        }
        break;
    }
  }

  private isLocationDropdownNavigable(): boolean {
    return (
      this.locationDropdownOpen() &&
      !this.loadingLocationSuggestions() &&
      this.locationSuggestions().length > 0
    );
  }

  private scrollLocationHighlightIntoView(): void {
    setTimeout(() => {
      document.querySelector('.location-option--active')?.scrollIntoView({ block: 'nearest' });
    });
  }

  private pathForLocationSuggestions(): string {
    const raw = this.locationInput.trim();
    if (raw.endsWith('/')) {
      return this.normalizePath(raw);
    }
    return this.parentPath() ?? '/';
  }

  onLocationBlur(): void {
    setTimeout(() => {
      this.locationDropdownOpen.set(false);
      this.commitLocationInput();
    }, 150);
  }

  selectLocationSuggestion(path: string): void {
    const normalized = this.normalizePath(path);
    this.parentPath.set(normalized);
    this.locationInput = normalized;
    this.locationDropdownOpen.set(false);
    this.locationHighlightIndex.set(-1);
  }

  setActiveTab(tab: DialogTab): void {
    if (this.view() === 'templateForm') {
      this.resetFormState();
      this.view.set('main');
    }
    this.activeTab.set(tab);
    this.error.set(null);
  }

  startCreateFromType(docType: DocTypeDef): void {
    if (this.locationRestricted()) return;
    this.resetFormState();
    this.selectedDocType.set(docType);
    this.error.set(null);
    this.view.set('templateForm');
  }

  private resetFormState(): void {
    this.selectedDocType.set(null);
    this.docTitle = '';
    this.description = '';
    this.nature = null;
    this.subjects = [];
    this.coverage = null;
    this.naturePanelSearch = '';
    this.subjectsPanelSearch = '';
    this.coveragePanelSearch = '';
    this.expires = null;
    this.noteFormat = 'text/html';
    this.mainFile.set(null);
    this.dragOverContent.set(false);
  }

  subjectPillLabel(id: string): string {
    const entry = this.subjectEntries().find((e) => e.id === id);
    if (!entry) return id;
    const label = entry.properties.label_en ?? id;
    const parentId = entry.properties.parent;
    if (!parentId || label.includes('/')) return label;
    const parent = this.subjectEntries().find((e) => e.id === parentId);
    const parentLabel = parent?.properties.label_en ?? parentId;
    return `${parentLabel}/${label}`;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.locationDropdownOpen()) {
      this.locationDropdownOpen.set(false);
      this.locationHighlightIndex.set(-1);
    }
  }

  onNaturePanelOpen(opened: boolean): void {
    if (opened) {
      this.naturePanelSearch = '';
    }
  }

  onSubjectsPanelOpen(opened: boolean): void {
    if (opened) {
      this.subjectsPanelSearch = '';
    }
  }

  onCoveragePanelOpen(opened: boolean): void {
    if (opened) {
      this.coveragePanelSearch = '';
    }
  }

  filteredNatureOptions(): DirectoryEntry[] {
    const q = this.naturePanelSearch.trim().toLowerCase();
    return this.natureEntries()
      .filter((e) => {
        if (!q) return true;
        const label = e.displayLabel.toLowerCase();
        return label.includes(q) || e.id.toLowerCase().includes(q);
      })
      .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
  }

  groupedSubjectOptions(): { parentLabel: string; entries: L10nDirectoryEntry[] }[] {
    return this.groupL10nEntries(this.subjectEntries(), this.subjectsPanelSearch);
  }

  groupedCoverageOptions(): { parentLabel: string; entries: L10nDirectoryEntry[] }[] {
    return this.groupL10nEntries(this.coverageEntries(), this.coveragePanelSearch);
  }

  private groupL10nEntries(
    entries: L10nDirectoryEntry[],
    query: string,
  ): { parentLabel: string; entries: L10nDirectoryEntry[] }[] {
    if (!entries.length) return [];

    const parentLabels = new Map(entries.map((e) => [e.id, e.properties.label_en ?? e.id]));
    const q = query.trim().toLowerCase();

    const filtered = entries.filter((e) => {
      if (e.properties.obsolete) return false;
      if (!e.properties.parent) return false;
      if (!q) return true;
      const label = (e.properties.label_en ?? e.id).toLowerCase();
      const parentLabel = (parentLabels.get(e.properties.parent) ?? '').toLowerCase();
      return label.includes(q) || e.id.toLowerCase().includes(q) || parentLabel.includes(q);
    });

    const groups = new Map<string, L10nDirectoryEntry[]>();
    for (const entry of filtered) {
      const parent = entry.properties.parent;
      const list = groups.get(parent) ?? [];
      list.push(entry);
      groups.set(parent, list);
    }

    return [...groups.entries()]
      .map(([parentId, groupEntries]) => ({
        parentLabel: parentLabels.get(parentId) ?? parentId,
        entries: groupEntries.sort(
          (a, b) => (a.properties.ordering ?? 0) - (b.properties.ordering ?? 0),
        ),
      }))
      .sort((a, b) => a.parentLabel.localeCompare(b.parentLabel));
  }

  addSubject(id: string): void {
    if (!id || this.subjects.includes(id)) return;
    this.subjects = [...this.subjects, id];
  }

  removeSubject(id: string): void {
    this.subjects = this.subjects.filter((v) => v !== id);
  }

  goMain(): void {
    this.resetFormState();
    this.view.set('main');
    this.error.set(null);
  }

  private buildDocumentProperties(title: string): Record<string, unknown> {
    const docType = this.selectedDocType();
    const props: Record<string, unknown> = {
      'dc:title': title,
      'dc:description': this.description.trim() || null,
      'dc:nature': this.nature || null,
      'dc:subjects': this.subjects,
      'dc:coverage': this.coverage || null,
      'dc:expired': this.expires?.toISOString() ?? null,
    };

    if (docType?.type === 'Note') {
      props['note:note'] = defaultNoteContent(this.noteFormat);
      props['note:mime_type'] = this.noteFormat;
    }

    return props;
  }

  createDocument(): void {
    this.commitLocationInput();
    if (this.locationRestricted()) return;
    const path = this.parentPath();
    const docType = this.selectedDocType();
    if (!path || !docType || !this.docTitle.trim()) return;

    const title = this.docTitle.trim();
    const name = sanitizeDocumentName(title);
    const properties = this.buildDocumentProperties(title);
    const mainFile = this.mainFile();

    this.busy.set(true);
    this.error.set(null);

    if (isBlobHoldingDocType(docType.type)) {
      if (!mainFile) {
        this.error.set('A file is required for this document type.');
        return;
      }
    }

    const create$ =
      mainFile && isBlobHoldingDocType(docType.type)
        ? this.importService.createBlobHoldingDocument(
            path,
            name,
            docType.type,
            properties,
            mainFile,
          )
        : this.importService.createChildDocument(path, name, docType.type, properties);

    create$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busy.set(false);
        this.successMessage.set(`Created ${docType.type} “${title}”.`);
        this.view.set('success');
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        this.busy.set(false);
        this.error.set(err?.error?.message ?? err?.message ?? 'Create failed');
      },
    });
  }

  onMainFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.mainFile.set(file);
    input.value = '';
  }

  onContentDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverContent.set(false);
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.mainFile.set(file);
  }

  onContentDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOverContent.set(true);
  }

  onContentDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverContent.set(false);
  }

  clearMainFile(): void {
    this.mainFile.set(null);
  }

  onUploadInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    if (!list?.length) return;
    this.addFiles(Array.from(list));
    input.value = '';
  }

  onUploadDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverUpload.set(false);
    const list = ev.dataTransfer?.files;
    if (list?.length) this.addFiles(Array.from(list));
  }

  onUploadDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.dragOverUpload.set(true);
  }

  onUploadDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOverUpload.set(false);
  }

  private addFiles(files: File[]): void {
    this.uploadFiles.update((cur) => [...cur, ...files]);
  }

  removeUploadAt(i: number): void {
    this.uploadFiles.update((files) => files.filter((_, j) => j !== i));
  }

  runUpload(): void {
    this.commitLocationInput();
    if (this.locationRestricted()) return;
    const path = this.parentPath();
    const files = this.uploadFiles();
    if (!path || files.length === 0) return;
    this.busy.set(true);
    this.error.set(null);
    this.importService
      .importFiles(path, files)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          this.busy.set(false);
          this.successMessage.set(`Uploaded ${docs.length} file(s).`);
          this.view.set('success');
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.busy.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Upload failed');
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  doneNavigateBrowse(): void {
    const p = this.parentPath();
    this.dialogRef.close({ refreshed: true, path: p });
  }
}
