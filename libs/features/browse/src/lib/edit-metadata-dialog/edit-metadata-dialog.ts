import { Component, DestroyRef, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgModel } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import {
  BrowseService,
  DirectoryService,
  DirectoryEntry,
  directoryPickerLabel,
  filterDirectoryPickerEntries,
  L10nDirectoryEntry,
  formatHierarchicalL10nLabel,
  groupL10nChildrenByParent,
  createExpiresErrorStateMatcher,
  isExpiresFieldValid,
  shouldShowExpiresFieldError,
  l10nEntryLabel,
} from '@nuxeo-satori/platform/nuxeo-client';

export interface EditMetadataDialogData {
  uid: string;
  title: string;
  description: string;
  nature: string;
  subjects: string[];
  coverage: string;
  expires: string | null;
}

@Component({
  selector: 'lib-edit-metadata-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: './edit-metadata-dialog.html',
  styleUrl: './edit-metadata-dialog.scss',
})
export class EditMetadataDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditMetadataDialogComponent>);
  private readonly data = inject<EditMetadataDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly directoryService = inject(DirectoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  title = this.data.title;
  description = this.data.description;
  nature = this.data.nature;
  subjects: string[] = [...this.data.subjects];
  coverage = this.data.coverage;
  expires: Date | null = this.data.expires ? new Date(this.data.expires) : null;
  expiresRawText = '';
  readonly expiresErrorMatcher = createExpiresErrorStateMatcher(() =>
    shouldShowExpiresFieldError(this.expiresRawText, this.expires),
  );

  @ViewChild('expiresInput') expiresNgModel?: NgModel;

  readonly saving = signal(false);
  readonly natureOptions = signal<DirectoryEntry[]>([]);
  readonly subjectOptions = signal<L10nDirectoryEntry[]>([]);
  readonly coverageOptions = signal<L10nDirectoryEntry[]>([]);

  readonly l10nEntryLabel = l10nEntryLabel;
  protected readonly directoryPickerLabel = directoryPickerLabel;
  naturePanelSearch = '';
  subjectsPanelSearch = '';
  coveragePanelSearch = '';

  filteredNatureOptions(): DirectoryEntry[] {
    return filterDirectoryPickerEntries(this.natureOptions(), this.naturePanelSearch);
  }

  groupedSubjectOptions(): ReturnType<typeof groupL10nChildrenByParent> {
    return groupL10nChildrenByParent(this.subjectOptions(), this.subjectsPanelSearch);
  }

  groupedCoverageOptions(): ReturnType<typeof groupL10nChildrenByParent> {
    return groupL10nChildrenByParent(this.coverageOptions(), this.coveragePanelSearch);
  }

  constructor() {
    this.directoryService
      .getEntries('nature')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.natureOptions.set(entries),
      });
    this.directoryService
      .getAllL10nEntries('l10nsubjects')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.subjectOptions.set(entries),
      });
    this.directoryService
      .getAllL10nEntries('l10ncoverage')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.coverageOptions.set(entries),
      });
  }

  onNaturePanelOpen(open: boolean): void {
    if (!open) {
      this.naturePanelSearch = '';
      return;
    }
    this.directoryService
      .getEntries('nature')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.natureOptions.set(entries),
      });
  }

  naturePillLabel(id: string): string {
    const entry = this.natureOptions().find((item) => item.id === id);
    return entry ? directoryPickerLabel(entry) : id;
  }

  subjectPillLabel(id: string): string {
    return formatHierarchicalL10nLabel(id, this.subjectOptions());
  }

  coveragePillLabel(id: string): string {
    return formatHierarchicalL10nLabel(id, this.coverageOptions());
  }

  clearNature(): void {
    this.nature = '';
  }

  clearCoverage(): void {
    this.coverage = '';
  }

  removeSubject(id: string): void {
    this.subjects = this.subjects.filter((value) => value !== id);
  }

  onSubjectsPanelOpen(open: boolean): void {
    if (!open) {
      this.subjectsPanelSearch = '';
      return;
    }
    this.loadL10nEntries('l10nsubjects', this.subjectOptions);
  }

  onCoveragePanelOpen(open: boolean): void {
    if (!open) {
      this.coveragePanelSearch = '';
      return;
    }
    this.loadL10nEntries('l10ncoverage', this.coverageOptions);
  }

  private loadL10nEntries(
    directoryName: string,
    target: { set: (entries: L10nDirectoryEntry[]) => void },
  ): void {
    this.directoryService
      .getAllL10nEntries(directoryName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => target.set(entries),
      });
  }

  isExpiresValid(): boolean {
    return isExpiresFieldValid(this.expiresRawText, this.expires);
  }

  showExpiresError(): boolean {
    return shouldShowExpiresFieldError(this.expiresRawText, this.expires);
  }

  onExpiresInput(event: Event): void {
    this.expiresRawText = (event.target as HTMLInputElement).value;
    const ctrl = this.expiresNgModel?.control;
    if (ctrl) {
      ctrl.markAsDirty();
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  onExpiresChange(value: Date | null): void {
    this.expires = value;
    if (value && !Number.isNaN(value.getTime())) {
      this.expiresRawText = '';
    }
  }

  save(): void {
    if (this.saving() || !this.isExpiresValid()) return;
    this.saving.set(true);

    const properties: Record<string, unknown> = {
      'dc:title': this.title.trim(),
      'dc:description': this.description,
      'dc:nature': this.nature || null,
      'dc:subjects': this.subjects,
      'dc:coverage': this.coverage || null,
      'dc:expired':
        this.expires && !Number.isNaN(this.expires.getTime()) ? this.expires.toISOString() : null,
    };

    this.browseService
      .updateDocument(this.data.uid, properties)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.saving.set(false);
          this.snackBar.open('Document updated', 'OK', { duration: 3000 });
          this.dialogRef.close(doc);
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Failed to update document', 'OK', { duration: 3000 });
        },
      });
  }
}
