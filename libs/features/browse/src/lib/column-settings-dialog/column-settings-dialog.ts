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

export function loadColumnSettings(): ColumnDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const keys = JSON.parse(stored) as string[];
      return ALL_COLUMNS.map((col) => ({ ...col, visible: keys.includes(col.key) }));
    }
  } catch {
    /* use defaults */
  }
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
