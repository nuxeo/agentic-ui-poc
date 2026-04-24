import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import {
  BrowseService,
  DirectoryEntry,
  DirectoryService,
  L10nDirectoryEntry,
  NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

export interface EditDocumentDialogData {
  document: NuxeoDocument;
}

@Component({
  selector: 'lib-edit-document-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Edit Document</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Title</mat-label>
        <input matInput [(ngModel)]="title" required />
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="description" rows="2"></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Nature</mat-label>
        <mat-select [(ngModel)]="nature" placeholder="Select a value.">
          <mat-option [value]="null">-- None --</mat-option>
          @for (entry of natureEntries(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.displayLabel }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Subjects</mat-label>
        <mat-select [(ngModel)]="subjects" multiple placeholder="Select a value.">
          @for (entry of subjectEntries(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.properties.label_en ?? entry.id }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Coverage</mat-label>
        <mat-select [(ngModel)]="coverage" placeholder="Select a value.">
          <mat-option [value]="null">-- None --</mat-option>
          @for (entry of coverageEntries(); track entry.id) {
            <mat-option [value]="entry.id">{{ entry.properties.label_en ?? entry.id }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Expires</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="expires" />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close [disabled]="saving()">Cancel</button>
      <span class="spacer"></span>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!title.trim() || saving()"
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
        gap: 20px;
        padding-top: 12px !important;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-actions {
        display: flex;
        padding: 8px 24px 16px;
      }

      .spacer {
        flex: 1;
      }
    `,
  ],
})
export class EditDocumentDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<EditDocumentDialogComponent>);
  private readonly data = inject<EditDocumentDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly directoryService = inject(DirectoryService);

  readonly natureEntries = signal<DirectoryEntry[]>([]);
  readonly subjectEntries = signal<L10nDirectoryEntry[]>([]);
  readonly coverageEntries = signal<L10nDirectoryEntry[]>([]);
  readonly saving = signal(false);

  title = '';
  description = '';
  nature: string | null = null;
  subjects: string[] = [];
  coverage: string | null = null;
  expires: Date | null = null;

  ngOnInit(): void {
    const doc = this.data.document;
    const props = doc.properties ?? {};

    this.title = (props['dc:title'] as string) ?? doc.title ?? '';
    this.description = (props['dc:description'] as string) ?? '';
    this.nature = (props['dc:nature'] as string) ?? null;
    this.subjects = (props['dc:subjects'] as string[]) ?? [];
    this.coverage = (props['dc:coverage'] as string) ?? null;
    const rawExpires = props['dc:expired'] as string | null;
    this.expires = rawExpires ? new Date(rawExpires) : null;

    forkJoin({
      nature: this.directoryService.getEntries('nature'),
      subjects: this.directoryService.getL10nEntries('l10nsubjects'),
      coverage: this.directoryService.getL10nEntries('l10ncoverage'),
    }).subscribe({
      next: ({ nature, subjects, coverage }) => {
        this.natureEntries.set(nature);
        this.subjectEntries.set(subjects);
        this.coverageEntries.set(coverage);
      },
    });
  }

  save(): void {
    if (!this.title.trim() || this.saving()) return;
    this.saving.set(true);

    const properties: Record<string, unknown> = {
      'dc:title': this.title.trim(),
      'dc:description': this.description.trim() || null,
      'dc:nature': this.nature || null,
      'dc:subjects': this.subjects,
      'dc:coverage': this.coverage || null,
      'dc:expired': this.expires?.toISOString() ?? null,
    };

    this.browseService.updateDocument(this.data.document.uid, properties).subscribe({
      next: (updatedDoc) => {
        this.saving.set(false);
        this.dialogRef.close(updatedDoc);
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
