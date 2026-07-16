import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import {
  NuxeoDocument,
  DirectoryEntry,
  L10nDirectoryEntry,
  CollectionService,
  DirectoryService,
  formatHierarchicalL10nLabel,
  groupL10nChildrenByParent,
  l10nEntryLabel,
} from '@agentic-ui/shared/nuxeo-client';

export interface EditCollectionDialogData {
  document: NuxeoDocument;
}

@Component({
  selector: 'lib-edit-collection-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Edit Collection</h2>

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
        <mat-select
          [(ngModel)]="subjects"
          multiple
          placeholder="Select a value."
          panelClass="vocab-select-panel vocab-grouped-select-panel"
          (openedChange)="onSubjectsPanelOpen($event)"
        >
          <div class="vocab-panel__search">
            <input
              type="text"
              placeholder="Search…"
              [(ngModel)]="subjectsPanelSearch"
              [ngModelOptions]="{ standalone: true }"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            />
          </div>
          <div class="vocab-panel__list">
            @for (group of groupedSubjectOptions(); track group.parentLabel) {
              <mat-optgroup [label]="group.parentLabel">
                @for (entry of group.entries; track entry.id) {
                  <mat-option [value]="entry.id">{{ l10nEntryLabel(entry) }}</mat-option>
                }
              </mat-optgroup>
            }
          </div>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width">
        <mat-label>Coverage</mat-label>
        <mat-select
          [(ngModel)]="coverage"
          placeholder="Select a value."
          panelClass="vocab-select-panel vocab-grouped-select-panel"
          (openedChange)="onCoveragePanelOpen($event)"
        >
          @if (coverage) {
            <mat-select-trigger>{{ coverageDisplayLabel() }}</mat-select-trigger>
          }
          <div class="vocab-panel__search">
            <input
              type="text"
              placeholder="Search…"
              [(ngModel)]="coveragePanelSearch"
              [ngModelOptions]="{ standalone: true }"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            />
          </div>
          <div class="vocab-panel__list">
            <mat-option [value]="null">-- None --</mat-option>
            @for (group of groupedCoverageOptions(); track group.parentLabel) {
              <mat-optgroup [label]="group.parentLabel">
                @for (entry of group.entries; track entry.id) {
                  <mat-option [value]="entry.id">{{ l10nEntryLabel(entry) }}</mat-option>
                }
              </mat-optgroup>
            }
          </div>
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
      <button mat-stroked-button mat-dialog-close>Cancel</button>
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
    `
      ::ng-deep .mat-mdc-select-panel.vocab-select-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        max-height: 320px;
        padding-top: 0;
      }

      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search {
        flex: 0 0 auto;
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
      }

      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search input {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font: inherit;
        font-size: 0.875rem;
      }

      ::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__list {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }

      ::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup-label,
      ::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup .mdc-list-group__subheader {
        font-weight: 700;
        font-size: 0.8125rem;
        background: #fafafa;
        padding: 10px 16px 6px;
        border-bottom: 1px solid #f0f0f0;
      }
    `,
  ],
})
export class EditCollectionDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<EditCollectionDialogComponent>);
  private readonly data = inject<EditCollectionDialogData>(MAT_DIALOG_DATA);
  private readonly collectionService = inject(CollectionService);
  private readonly directoryService = inject(DirectoryService);

  readonly l10nEntryLabel = l10nEntryLabel;
  readonly natureEntries = signal<DirectoryEntry[]>([]);
  readonly subjectEntries = signal<L10nDirectoryEntry[]>([]);
  readonly coverageEntries = signal<L10nDirectoryEntry[]>([]);
  readonly saving = signal(false);

  subjectsPanelSearch = '';
  coveragePanelSearch = '';

  readonly groupedSubjectOptions = computed(() =>
    groupL10nChildrenByParent(this.subjectEntries(), this.subjectsPanelSearch),
  );

  readonly groupedCoverageOptions = computed(() =>
    groupL10nChildrenByParent(this.coverageEntries(), this.coveragePanelSearch),
  );

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
      subjects: this.directoryService.getAllL10nEntries('l10nsubjects'),
      coverage: this.directoryService.getAllL10nEntries('l10ncoverage'),
    }).subscribe({
      next: ({ nature, subjects, coverage }) => {
        this.natureEntries.set(nature);
        this.subjectEntries.set(subjects);
        this.coverageEntries.set(coverage);
      },
    });
  }

  onSubjectsPanelOpen(open: boolean): void {
    if (!open) this.subjectsPanelSearch = '';
  }

  onCoveragePanelOpen(open: boolean): void {
    if (!open) this.coveragePanelSearch = '';
  }

  coverageDisplayLabel(): string {
    return formatHierarchicalL10nLabel(this.coverage, this.coverageEntries());
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

    this.collectionService.updateProperties(this.data.document.uid, properties).subscribe({
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
