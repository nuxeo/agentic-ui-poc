import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import {
  BrowseService,
  ContentLakeIngestService,
  DocumentImportService,
  isFolderishDocument,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

type UploadPhase = 'idle' | 'uploading' | 'ingesting' | 'complete' | 'error';

export interface ContentLakeUploadedDocument {
  uid: string;
  title: string;
  path: string;
}

export interface ContentLakeFolderOption {
  path: string;
  title: string;
}

function normalizeFolderPath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

function parentFolderPath(path: string): string | null {
  const normalized = normalizeFolderPath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return null;
  }
  return `/${parts.slice(0, -1).join('/')}`;
}

/** Parent folder + partial segment when the user is typing after `/`. */
function getPathCompletionContext(path: string): { parentPath: string; partial: string } | null {
  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  const endsWithSlash = trimmed.endsWith('/');
  const lastSlash = trimmed.lastIndexOf('/');
  if (lastSlash < 0) {
    return null;
  }

  if (!endsWithSlash && lastSlash === 0) {
    return null;
  }

  const parentRaw = trimmed.slice(0, lastSlash);
  const parentPath = normalizeFolderPath(parentRaw || '/');
  const partial = trimmed.slice(lastSlash + 1);
  return { parentPath, partial };
}

@Component({
  selector: 'lib-content-lake-upload',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './content-lake-upload.html',
  styleUrl: './content-lake-upload.scss',
})
export class ContentLakeUploadComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<ContentLakeUploadComponent>);
  private readonly importService = inject(DocumentImportService);
  private readonly ingestService = inject(ContentLakeIngestService);
  private readonly browseService = inject(BrowseService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly folderAutocompleteTrigger = viewChild(MatAutocompleteTrigger);
  private folderSuggestionsRequestId = 0;
  /** Ignore one input event matching this value (autocomplete sync after selection). */
  private ignorePathInputValue: string | null = null;

  readonly parentPath = signal('/default-domain');
  readonly filteredFolderOptions = signal<ContentLakeFolderOption[]>([]);
  readonly loadingSubfolders = signal(false);
  readonly folderBrowseError = signal<string | null>(null);
  readonly selectedFiles = signal<File[]>([]);
  readonly phase = signal<UploadPhase>('idle');
  readonly statusMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly uploadedDocuments = signal<ContentLakeUploadedDocument[]>([]);
  readonly ingestProcessedCount = signal(0);

  constructor() {
    this.importService
      .getDefaultImportParentPath()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (path) => {
          this.parentPath.set(path);
        },
      });
  }

  onParentPathUserInput(event: Event): void {
    const path = (event.target as HTMLInputElement).value;
    if (this.ignorePathInputValue === path) {
      this.ignorePathInputValue = null;
      return;
    }
    this.ignorePathInputValue = null;
    if (path === this.parentPath()) {
      return;
    }
    this.parentPath.set(path);
    this.refreshFolderSuggestions(path);
  }

  onFolderOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const path = event.option.value as string;
    this.ignorePathInputValue = path;
    this.cancelFolderSuggestionsRequest();
    this.parentPath.set(path);
    this.clearFolderSuggestions();
    this.folderAutocompleteTrigger()?.closePanel();
  }

  goUpOneFolderLevel(): void {
    const parent = parentFolderPath(this.parentPath());
    if (!parent) {
      return;
    }
    this.cancelFolderSuggestionsRequest();
    this.parentPath.set(parent);
    this.clearFolderSuggestions();
    this.folderAutocompleteTrigger()?.closePanel();
  }

  canGoUpOneFolderLevel(): boolean {
    return parentFolderPath(this.parentPath()) !== null;
  }

  folderBreadcrumb(): string {
    const parts = normalizeFolderPath(this.parentPath()).split('/').filter(Boolean);
    return parts.length === 0
      ? '/'
      : parts
          .map((segment) => {
            if (segment === 'default-domain') {
              return 'Domain';
            }
            if (segment === 'workspaces') {
              return 'Workspaces';
            }
            return decodeURIComponent(segment);
          })
          .join(' › ');
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
    this.errorMessage.set(null);
    if (files.length > 0) {
      this.statusMessage.set(
        files.length === 1 ? `Selected "${files[0].name}".` : `Selected ${files.length} files.`,
      );
    }
  }

  clearSelection(): void {
    this.selectedFiles.set([]);
    this.statusMessage.set(null);
    this.errorMessage.set(null);
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  uploadToContentLake(): void {
    const files = this.selectedFiles();
    const parentPath = this.parentPath().trim();
    if (
      files.length === 0 ||
      !parentPath ||
      this.phase() === 'uploading' ||
      this.phase() === 'ingesting'
    ) {
      return;
    }

    this.phase.set('uploading');
    this.errorMessage.set(null);
    this.uploadedDocuments.set([]);
    this.ingestProcessedCount.set(0);
    this.statusMessage.set('Uploading to Nuxeo...');

    this.importService
      .importFiles(parentPath, files)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((documents) => {
          const uploads = documents.map((doc) => this.toUploadedDocument(doc));
          this.uploadedDocuments.set(uploads);
          this.phase.set('ingesting');
          this.statusMessage.set('Sending documents to Content Lake...');
          return this.ingestService.startIngest(uploads.map((doc) => doc.uid));
        }),
        switchMap((command) => this.ingestService.waitUntilComplete(command.commandId)),
      )
      .subscribe({
        next: (status) => {
          this.ingestProcessedCount.set(status.processed);
          if (status.error || status.errorCount > 0) {
            const message =
              `Content Lake ingest finished with errors (${status.errorCount} failed). ` +
              'Check that the HxAI connector and ingest credentials are configured on Nuxeo.';
            this.phase.set('error');
            this.errorMessage.set(message);
            this.statusMessage.set(null);
            this.showFailureToast(message);
            return;
          }
          const count = status.processed || this.uploadedDocuments().length;
          const message = `Uploaded and ingested ${count} document(s) to Content Lake.`;
          this.phase.set('complete');
          this.statusMessage.set(message);
          this.showSuccessToast(message);
          this.dialogRef.close({ uploadedDocuments: this.uploadedDocuments() });
        },
        error: (err: Error) => {
          const message = err.message || 'Upload or Content Lake ingest failed.';
          this.phase.set('error');
          this.errorMessage.set(message);
          this.statusMessage.set(null);
          this.showFailureToast(message);
        },
      });
  }

  close(): void {
    if (!this.isBusy()) {
      this.dialogRef.close();
    }
  }

  openDocument(uid: string): void {
    this.dialogRef.close();
    void this.router.navigateByUrl(`/doc/${uid}`);
  }

  isBusy(): boolean {
    const current = this.phase();
    return current === 'uploading' || current === 'ingesting';
  }

  private toUploadedDocument(doc: NuxeoDocument): ContentLakeUploadedDocument {
    const dcTitle = doc.properties?.['dc:title'];
    const title =
      (typeof doc.title === 'string' && doc.title.trim()) ||
      (typeof dcTitle === 'string' && dcTitle.trim()) ||
      doc.uid;
    return {
      uid: doc.uid,
      title,
      path: doc.path,
    };
  }

  private showSuccessToast(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }

  private showFailureToast(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 7000 });
  }

  private refreshFolderSuggestions(path: string): void {
    const context = getPathCompletionContext(path);
    if (!context) {
      this.clearFolderSuggestions();
      return;
    }
    this.loadSubfolderOptions(context.parentPath, context.partial);
  }

  private cancelFolderSuggestionsRequest(): void {
    this.folderSuggestionsRequestId += 1;
  }

  private clearFolderSuggestions(): void {
    this.filteredFolderOptions.set([]);
    this.folderBrowseError.set(null);
    this.loadingSubfolders.set(false);
  }

  private loadSubfolderOptions(parentPath: string, partial: string): void {
    const normalized = normalizeFolderPath(parentPath);
    if (!normalized) {
      this.filteredFolderOptions.set([]);
      this.folderBrowseError.set('Enter a Nuxeo folder path.');
      return;
    }

    const requestId = this.folderSuggestionsRequestId + 1;
    this.folderSuggestionsRequestId = requestId;
    this.loadingSubfolders.set(true);
    this.folderBrowseError.set(null);

    this.browseService
      .getByPath(normalized)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((doc) => {
          if (!isFolderishDocument(doc)) {
            return of({ entries: [] as NuxeoDocument[] });
          }
          return this.browseService.getChildren(normalized, 200, 0);
        }),
        catchError(() => of(null)),
      )
      .subscribe({
        next: (list) => {
          if (requestId !== this.folderSuggestionsRequestId) {
            return;
          }
          this.loadingSubfolders.set(false);
          if (!list) {
            this.filteredFolderOptions.set([]);
            this.folderBrowseError.set(
              'Could not load subfolders for this path. Check the path or your permissions.',
            );
            return;
          }

          const options = (list.entries ?? [])
            .filter((doc) => isFolderishDocument(doc) && doc.path)
            .map((doc) => ({
              path: normalizeFolderPath(doc.path),
              title: doc.title?.trim() || doc.path.split('/').pop() || doc.path,
            }))
            .sort((left, right) =>
              left.title.localeCompare(right.title, undefined, { sensitivity: 'base' }),
            );

          const filtered = this.filterFolderOptions(options, partial);
          this.filteredFolderOptions.set(filtered);
          if (options.length === 0) {
            this.folderBrowseError.set(
              'No subfolders here. Upload into this folder or go up one level.',
            );
          } else if (filtered.length > 0) {
            queueMicrotask(() => {
              if (requestId === this.folderSuggestionsRequestId) {
                this.folderAutocompleteTrigger()?.openPanel();
              }
            });
          }
        },
      });
  }

  private filterFolderOptions(
    options: ContentLakeFolderOption[],
    partial: string,
  ): ContentLakeFolderOption[] {
    const needle = partial.trim().toLowerCase();
    if (!needle) {
      return options;
    }
    return options.filter((option) => {
      const segment = option.path.split('/').pop()?.toLowerCase() ?? '';
      return option.title.toLowerCase().startsWith(needle) || segment.startsWith(needle);
    });
  }
}
