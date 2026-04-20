import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  type BaseThemeName,
  BASE_THEME_NAMES,
  createCustomThemeFrom,
} from '@agentic-ui/shared/nuxeo-studio';

@Component({
  selector: 'lib-new-theme-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>New Theme</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>theme name</mat-label>
        <input matInput [(ngModel)]="themeName" placeholder="My Custom Theme" />
      </mat-form-field>

      <p class="start-from-label">Start from</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-select [(ngModel)]="baseName">
          @for (b of baseNames; track b) {
            <mat-option [value]="b">{{ b }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!themeName.trim()" (click)="create()">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      .start-from-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
        margin: 4px 0 4px;
      }
      mat-dialog-content {
        min-width: 360px;
      }
    `,
  ],
})
export class NewThemeDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NewThemeDialogComponent>);

  readonly baseNames: readonly BaseThemeName[] = BASE_THEME_NAMES;
  themeName = '';
  baseName: BaseThemeName = 'default';

  create(): void {
    if (!this.themeName.trim()) return;
    const theme = createCustomThemeFrom(this.themeName.trim(), this.baseName);
    this.dialogRef.close(theme);
  }
}
