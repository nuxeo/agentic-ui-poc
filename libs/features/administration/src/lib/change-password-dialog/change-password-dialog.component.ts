import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ChangePasswordDialogData {
  username: string;
}

@Component({
  selector: 'lib-change-password-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss',
})
export class ChangePasswordDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<ChangePasswordDialogComponent, string | undefined>,
  );
  readonly data = inject<ChangePasswordDialogData>(MAT_DIALOG_DATA);

  password = '';
  confirm = '';

  canSave(): boolean {
    const p = this.password.trim();
    return p.length > 0 && p === this.confirm.trim();
  }

  save(): void {
    if (!this.canSave()) return;
    this.dialogRef.close(this.password.trim());
  }
}
