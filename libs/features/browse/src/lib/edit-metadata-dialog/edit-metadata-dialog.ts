import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  BrowseService,
  DirectoryService,
  DirectoryEntry,
  L10nDirectoryEntry,
} from '@agentic-ui/shared/nuxeo-client';

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
  ],
  template: `
    <h2 mat-dialog-title>Edit</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="title" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="description" rows="2"></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nature</mat-label>
        <mat-select [(ngModel)]="nature">
          <mat-option value="">Select a value.</mat-option>
          @for (entry of natureOptions(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Subjects</mat-label>
        <mat-select [(ngModel)]="subjects" multiple>
          @for (entry of subjectOptions(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.properties.label_en || entry.id }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Coverage</mat-label>
        <mat-select [(ngModel)]="coverage">
          <mat-option value="">Select a value.</mat-option>
          @for (entry of coverageOptions(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.properties.label_en || entry.id }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Expires</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="expires" />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close [disabled]="saving()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="saving() || !title.trim()"
        (click)="save()"
      >
        @if (saving()) {
          <mat-spinner diameter="18" />
        } @else {
          Save
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 480px;
      }
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 24px !important;
      }
      .full-width {
        width: 100%;
      }
      mat-dialog-actions {
        padding: 8px 24px 16px;
      }
    `,
  ],
})
export class EditMetadataDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditMetadataDialogComponent>);
  private readonly data = inject<EditMetadataDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly directoryService = inject(DirectoryService);
  private readonly snackBar = inject(MatSnackBar);

  title = this.data.title;
  description = this.data.description;
  nature = this.data.nature;
  subjects: string[] = [...this.data.subjects];
  coverage = this.data.coverage;
  expires: Date | null = this.data.expires ? new Date(this.data.expires) : null;

  readonly saving = signal(false);
  readonly natureOptions = signal<DirectoryEntry[]>([]);
  readonly subjectOptions = signal<L10nDirectoryEntry[]>([]);
  readonly coverageOptions = signal<L10nDirectoryEntry[]>([]);

  constructor() {
    this.directoryService.getEntries('nature').subscribe({
      next: (entries) => this.natureOptions.set(entries),
    });
    this.directoryService.getL10nEntries('l10nsubjects').subscribe({
      next: (entries) => this.subjectOptions.set(entries),
    });
    this.directoryService.getL10nEntries('l10ncoverage').subscribe({
      next: (entries) => this.coverageOptions.set(entries),
    });
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);

    const properties: Record<string, unknown> = {
      'dc:title': this.title.trim(),
      'dc:description': this.description,
      'dc:nature': this.nature || null,
      'dc:subjects': this.subjects,
      'dc:coverage': this.coverage || null,
      'dc:expired': this.expires ? this.expires.toISOString() : null,
    };

    this.browseService.updateDocument(this.data.uid, properties).subscribe({
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
