import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface SavedSearchDialogData {
  title?: string;
  placeholder?: string;
  initialValue?: string;
}

export const SAVED_SEARCH_DIALOG_OPTIONS: Partial<MatDialogConfig> = {
  autoFocus: true,
};

@Component({
  selector: 'lib-saved-search-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './saved-search-dialog.component.html',
  styleUrl: './saved-search-dialog.component.scss',
})
export class SavedSearchDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SavedSearchDialogComponent, string | undefined>);
  readonly data = inject<SavedSearchDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};
  readonly name = signal(this.data.initialValue ?? '');

  readonly canSave = () => this.name().trim().length > 0;

  onInput(value: string): void {
    this.name.set(value);
  }

  save(): void {
    if (!this.canSave()) return;
    this.dialogRef.close(this.name().trim());
  }
}
