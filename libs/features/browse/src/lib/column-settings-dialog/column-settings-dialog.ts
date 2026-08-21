import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
}

/**
 * The packaged column set, kept only as the **fallback** for an injector where
 * Layer 1 registration has not run.
 *
 * `PACKAGED_BROWSE_COLUMNS` in `@agentic-ui/shared/extensions` is now the source
 * of truth, and `provide-app-extensions.ts` registers it into the `documentList`
 * slot. This list must mirror it. It survives because a component spec that
 * builds a bare `TestBed` has no `APP_INITIALIZER`, and resolving an empty slot
 * would render a document list with no columns — a silent regression far worse
 * than a stale duplicate. `packaged-columns.spec.ts` asserts the two agree, so
 * the duplication cannot drift unnoticed.
 */
export const ALL_COLUMNS: ColumnDef[] = [
  { key: 'title', label: 'Title', visible: true },
  { key: 'type', label: 'Type', visible: false },
  { key: 'modified', label: 'Modified', visible: true },
  { key: 'lastContributor', label: 'Last Contributor', visible: true },
  { key: 'state', label: 'State', visible: false },
  { key: 'version', label: 'Version', visible: false },
  { key: 'created', label: 'Created', visible: false },
  { key: 'author', label: 'Author', visible: false },
  { key: 'nature', label: 'Nature', visible: false },
  { key: 'coverage', label: 'Coverage', visible: false },
  { key: 'subjects', label: 'Subjects', visible: false },
  { key: 'flags', label: 'Flags', visible: false },
];

const STORAGE_KEY = 'browse_column_settings';

/**
 * The keys the user has switched on, or `null` when they have never chosen.
 *
 * `null` and `[]` are different: never-chosen means "use whatever the descriptors
 * default to", whereas an empty array means the user switched everything off.
 * Returning `[]` for both would silently override a manifest's `hiddenByDefault`
 * decisions with the packaged defaults on a fresh browser.
 */
export function loadColumnVisibility(): readonly string[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : null;
  } catch {
    return null;
  }
}

export function loadColumnSettings(): ColumnDef[] {
  const keys = loadColumnVisibility();
  if (keys) return ALL_COLUMNS.map((col) => ({ ...col, visible: keys.includes(col.key) }));
  return ALL_COLUMNS.map((col) => ({ ...col }));
}

export function saveColumnSettings(columns: ColumnDef[]): void {
  const visibleKeys = columns.filter((c) => c.visible).map((c) => c.key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleKeys));
}

@Component({
  selector: 'lib-column-settings-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>Columns Settings</h2>

    <mat-dialog-content>
      @for (col of columns; track col.key) {
        <mat-checkbox [(ngModel)]="col.visible" [disabled]="col.key === 'title'">
          {{ col.label }}
        </mat-checkbox>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="reset()">Reset</button>
      <button mat-flat-button color="primary" (click)="done()">Done</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 300px;
      }
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px 24px !important;
      }
      mat-dialog-actions {
        padding: 8px 24px 16px;
      }
    `,
  ],
})
export class ColumnSettingsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ColumnSettingsDialogComponent>);
  private readonly data = inject<ColumnDef[]>(MAT_DIALOG_DATA);

  columns: ColumnDef[] = this.data.map((c) => ({ ...c }));

  reset(): void {
    this.columns = ALL_COLUMNS.map((c) => ({ ...c }));
  }

  done(): void {
    saveColumnSettings(this.columns);
    this.dialogRef.close(this.columns);
  }
}
