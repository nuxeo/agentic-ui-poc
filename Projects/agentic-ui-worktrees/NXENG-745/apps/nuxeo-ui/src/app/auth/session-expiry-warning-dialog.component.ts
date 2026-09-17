import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface SessionExpiryWarningDialogData {
  warningMinutes: number;
}

@Component({
  selector: 'app-session-expiry-warning-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './session-expiry-warning-dialog.component.html',
  styleUrl: './session-expiry-warning-dialog.component.scss',
})
export class SessionExpiryWarningDialogComponent {
  readonly data = inject<SessionExpiryWarningDialogData>(MAT_DIALOG_DATA);
}
