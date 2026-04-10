import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

export interface CreateVersionDialogData {
  documentUid: string;
  documentTitle: string;
  currentMajor: number;
  currentMinor: number;
}

@Component({
  selector: 'lib-create-version-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>
      Create Version for {{ data.documentTitle }} - Version {{ data.currentMajor }}.{{
        data.currentMinor
      }}
    </h2>

    <mat-dialog-content>
      <mat-radio-group [(ngModel)]="increment" class="version-options">
        <mat-radio-button value="Minor" class="version-option">
          <span class="version-badge">{{ data.currentMajor }}.{{ data.currentMinor + 1 }}</span>
          Minor version
        </mat-radio-button>
        <mat-radio-button value="Major" class="version-option">
          <span class="version-badge">{{ data.currentMajor + 1 }}.0</span>
          Major version
        </mat-radio-button>
      </mat-radio-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="saving()">
        @if (saving()) {
          <mat-spinner diameter="18" />
        } @else {
          Create Version
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2 {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }

      :host {
        min-width: 400px;
        display: block;
      }

      .version-options {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 0 8px;
      }

      .version-option {
        display: flex;
        align-items: center;
      }

      .version-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 2px 8px;
        border-radius: 4px;
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        font-size: 13px;
        font-weight: 600;
        margin-right: 8px;
      }

      mat-dialog-actions {
        padding: 16px 0 0;
        gap: 8px;
      }
    `,
  ],
})
export class CreateVersionDialogComponent {
  readonly data = inject<CreateVersionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CreateVersionDialogComponent>);
  private readonly detailService = inject(DocumentDetailService);
  private readonly snackBar = inject(MatSnackBar);

  increment: 'Major' | 'Minor' = 'Major';
  readonly saving = signal(false);

  create(): void {
    if (this.saving()) return;
    this.saving.set(true);

    this.detailService.createVersion(this.data.documentUid, this.increment).subscribe({
      next: (doc) => {
        this.saving.set(false);
        const label =
          this.increment === 'Major'
            ? `${this.data.currentMajor + 1}.0`
            : `${this.data.currentMajor}.${this.data.currentMinor + 1}`;
        this.snackBar.open(`Version ${label} created`, 'OK', { duration: 3000 });
        this.dialogRef.close(doc);
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Failed to create version', 'OK', { duration: 3000 });
      },
    });
  }
}
