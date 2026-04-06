import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-save-search-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Save Search</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" class="save-search-field">
        <input
          matInput
          placeholder="Enter a name for your saved search."
          [(ngModel)]="searchName"
          (keydown.enter)="onSave()"
          cdkFocusInitial
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!searchName.trim()" (click)="onSave()">
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .save-search-field {
        width: 100%;
      }
    `,
  ],
})
export class SaveSearchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SaveSearchDialogComponent>);
  searchName = '';

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    const name = this.searchName.trim();
    if (name) {
      this.dialogRef.close(name);
    }
  }
}
