import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgModel } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import {
  BrowseService,
  DirectoryEntry,
  DirectoryService,
  directoryPickerLabel,
  filterDirectoryPickerEntries,
  L10nDirectoryEntry,
  NuxeoDocument,
  formatHierarchicalL10nLabel,
  groupL10nChildrenByParent,
  createExpiresErrorStateMatcher,
  isExpiresFieldValid,
  shouldShowExpiresFieldError,
  l10nEntryLabel,
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
    MatChipsModule,
    MatIconModule,
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

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width vocab-field">
        <mat-label>Nature</mat-label>
        <mat-select
          #natureSelect
          [(ngModel)]="nature"
          panelClass="vocab-select-panel"
          (openedChange)="onNaturePanelOpen($event)"
          (selectionChange)="natureSelect.close()"
        >
          <mat-select-trigger>
            @if (nature; as natureId) {
              <mat-chip-set class="vocab-trigger-chips">
                <mat-chip (removed)="clearNature()">
                  {{ naturePillLabel(natureId) }}
                  <button
                    type="button"
                    matChipRemove
                    [attr.aria-label]="'Remove ' + naturePillLabel(natureId)"
                    (click)="$event.stopPropagation(); clearNature()"
                  >
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              </mat-chip-set>
            }
          </mat-select-trigger>
          <div class="vocab-panel__search">
            <input
              type="text"
              placeholder="Search…"
              aria-label="Search Nature"
              [(ngModel)]="naturePanelSearch"
              [ngModelOptions]="{ standalone: true }"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            />
          </div>
          <div class="vocab-panel__list">
            @for (entry of filteredNatureOptions(); track entry.id) {
              <mat-option [value]="entry.id">{{ directoryPickerLabel(entry) }}</mat-option>
            }
          </div>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width vocab-field">
        <mat-label>Subjects</mat-label>
        <mat-select
          [(ngModel)]="subjects"
          multiple
          panelClass="vocab-select-panel vocab-grouped-select-panel"
          (openedChange)="onSubjectsPanelOpen($event)"
        >
          <mat-select-trigger>
            <mat-chip-set class="vocab-trigger-chips">
              @for (id of subjects; track id) {
                <mat-chip (removed)="removeSubject(id)">
                  {{ subjectPillLabel(id) }}
                  <button
                    type="button"
                    matChipRemove
                    [attr.aria-label]="'Remove ' + subjectPillLabel(id)"
                    (click)="$event.stopPropagation()"
                  >
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              }
            </mat-chip-set>
          </mat-select-trigger>
          <div class="vocab-panel__search">
            <input
              type="text"
              placeholder="Search…"
              aria-label="Search Subjects"
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

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full-width vocab-field">
        <mat-label>Coverage</mat-label>
        <mat-select
          #coverageSelect
          [(ngModel)]="coverage"
          panelClass="vocab-select-panel vocab-grouped-select-panel"
          (openedChange)="onCoveragePanelOpen($event)"
          (selectionChange)="coverageSelect.close()"
        >
          <mat-select-trigger>
            @if (coverage; as coverageId) {
              <mat-chip-set class="vocab-trigger-chips">
                <mat-chip (removed)="clearCoverage()">
                  {{ coveragePillLabel(coverageId) }}
                  <button
                    type="button"
                    matChipRemove
                    [attr.aria-label]="'Remove ' + coveragePillLabel(coverageId)"
                    (click)="$event.stopPropagation(); clearCoverage()"
                  >
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip>
              </mat-chip-set>
            }
          </mat-select-trigger>
          <div class="vocab-panel__search">
            <input
              type="text"
              placeholder="Search…"
              aria-label="Search Coverage"
              [(ngModel)]="coveragePanelSearch"
              [ngModelOptions]="{ standalone: true }"
              (click)="$event.stopPropagation()"
              (keydown)="$event.stopPropagation()"
            />
          </div>
          <div class="vocab-panel__list">
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

      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="full-width"
        [class.expires-field-invalid]="showExpiresError()"
      >
        <mat-label>Expires</mat-label>
        <input
          matInput
          name="expires"
          [matDatepicker]="picker"
          [ngModel]="expires"
          [errorStateMatcher]="expiresErrorMatcher"
          (ngModelChange)="onExpiresChange($event)"
          (input)="onExpiresInput($event)"
          #expiresInput="ngModel"
          placeholder="mm/dd/yyyy"
        />
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-datepicker #picker />
        @if (showExpiresError()) {
          <mat-error>Enter a valid date</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close [disabled]="saving()">Cancel</button>
      <span class="spacer"></span>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!title.trim() || saving() || !isExpiresValid()"
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

      .expires-field-invalid {
        ::ng-deep .mdc-notched-outline__leading,
        ::ng-deep .mdc-notched-outline__notch,
        ::ng-deep .mdc-notched-outline__trailing {
          border-color: var(--mat-sys-error, #b3261e);
        }
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

      ::ng-deep .vocab-field .mat-mdc-select-trigger {
        height: auto;
        min-height: 24px;
        overflow: visible;
      }

      .vocab-trigger-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        width: 100%;
        padding: 6px 8px 6px 12px;
        box-sizing: border-box;
      }

      ::ng-deep .vocab-trigger-chips .mdc-evolution-chip {
        margin: 2px 4px 2px 0;
      }
    `,
  ],
})
export class EditDocumentDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<EditDocumentDialogComponent>);
  private readonly data = inject<EditDocumentDialogData>(MAT_DIALOG_DATA);
  private readonly browseService = inject(BrowseService);
  private readonly directoryService = inject(DirectoryService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('expiresInput') expiresNgModel?: NgModel;

  readonly l10nEntryLabel = l10nEntryLabel;
  protected readonly directoryPickerLabel = directoryPickerLabel;
  readonly natureEntries = signal<DirectoryEntry[]>([]);
  readonly subjectEntries = signal<L10nDirectoryEntry[]>([]);
  readonly coverageEntries = signal<L10nDirectoryEntry[]>([]);
  readonly saving = signal(false);

  naturePanelSearch = '';
  subjectsPanelSearch = '';
  coveragePanelSearch = '';

  filteredNatureOptions(): DirectoryEntry[] {
    return filterDirectoryPickerEntries(this.natureEntries(), this.naturePanelSearch);
  }

  groupedSubjectOptions(): ReturnType<typeof groupL10nChildrenByParent> {
    return groupL10nChildrenByParent(this.subjectEntries(), this.subjectsPanelSearch);
  }

  groupedCoverageOptions(): ReturnType<typeof groupL10nChildrenByParent> {
    return groupL10nChildrenByParent(this.coverageEntries(), this.coveragePanelSearch);
  }

  title = '';
  description = '';
  nature: string | null = null;
  subjects: string[] = [];
  coverage: string | null = null;
  expires: Date | null = null;
  expiresRawText = '';
  readonly expiresErrorMatcher = createExpiresErrorStateMatcher(() =>
    shouldShowExpiresFieldError(this.expiresRawText, this.expires),
  );

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
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ nature, subjects, coverage }) => {
          this.natureEntries.set(nature);
          this.subjectEntries.set(subjects);
          this.coverageEntries.set(coverage);
        },
      });
  }

  onNaturePanelOpen(open: boolean): void {
    if (!open) {
      this.naturePanelSearch = '';
      return;
    }
    this.loadNatureEntries();
  }

  private loadNatureEntries(): void {
    this.directoryService
      .getEntries('nature')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.natureEntries.set(entries),
      });
  }

  naturePillLabel(id: string): string {
    const entry = this.natureEntries().find((item) => item.id === id);
    return entry ? directoryPickerLabel(entry) : id;
  }

  subjectPillLabel(id: string): string {
    return formatHierarchicalL10nLabel(id, this.subjectEntries());
  }

  coveragePillLabel(id: string): string {
    return formatHierarchicalL10nLabel(id, this.coverageEntries());
  }

  clearNature(): void {
    this.nature = null;
  }

  clearCoverage(): void {
    this.coverage = null;
  }

  removeSubject(id: string): void {
    this.subjects = this.subjects.filter((value) => value !== id);
  }

  onSubjectsPanelOpen(open: boolean): void {
    if (!open) {
      this.subjectsPanelSearch = '';
      return;
    }
    this.loadL10nEntries('l10nsubjects', this.subjectEntries);
  }

  onCoveragePanelOpen(open: boolean): void {
    if (!open) {
      this.coveragePanelSearch = '';
      return;
    }
    this.loadL10nEntries('l10ncoverage', this.coverageEntries);
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
    if (!this.title.trim() || this.saving() || !this.isExpiresValid()) return;
    this.saving.set(true);

    const properties: Record<string, unknown> = {
      'dc:title': this.title.trim(),
      'dc:description': this.description.trim() || null,
      'dc:nature': this.nature || null,
      'dc:subjects': this.subjects,
      'dc:coverage': this.coverage || null,
      'dc:expired':
        this.expires && !Number.isNaN(this.expires.getTime()) ? this.expires.toISOString() : null,
    };

    this.browseService
      .updateDocument(this.data.document.uid, properties)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
