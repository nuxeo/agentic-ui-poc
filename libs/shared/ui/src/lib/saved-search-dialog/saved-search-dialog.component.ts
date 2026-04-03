import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface SavedSearchDialogData {
  title?: string;
  placeholder?: string;
  initialValue?: string;
}

@Component({
  selector: 'lib-saved-search-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Saved Search' }}</h2>

    <mat-dialog-content>
      <input
        class="saved-search-input"
        type="text"
        [attr.aria-label]="data.title || 'Saved Search'"
        [value]="name()"
        [placeholder]="data.placeholder || 'Enter a name for your saved search'"
        (input)="onInput(($any($event.target).value))"
        (keydown.enter)="save()"
      />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="!canSave()" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 420px;
      }

      mat-dialog-content {
        padding: 8px 24px 0 !important;
      }

      .saved-search-input {
        width: 100%;
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        padding: 10px 12px;
        font: inherit;
        color: #101828;
        outline: none;
        box-sizing: border-box;

        &:focus {
          border-color: #5c6bc0;
        }
      }

      mat-dialog-actions {
        padding: 16px 24px 20px;
      }
    `,
  ],
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
