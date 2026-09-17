import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NuxeoAce, DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';

export interface DeletePermissionDialogData {
  documentUid: string;
  ace: NuxeoAce;
  permissionLabel: string;
  timeFrameLabel: string;
}

@Component({
  selector: 'lib-delete-permission-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>The following permission will be deleted.</h2>

    <mat-dialog-content>
      <table class="confirm-table">
        <thead>
          <tr>
            <th>User / Group</th>
            <th>Right</th>
            <th>Time Frame</th>
            <th>Granted by</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ data.ace.username }}</td>
            <td>{{ data.permissionLabel }}</td>
            <td>{{ data.timeFrameLabel }}</td>
            <td>{{ data.ace.creator ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <span class="spacer"></span>
      <button mat-stroked-button color="warn" [disabled]="deleting()" (click)="confirmDelete()">
        @if (deleting()) {
          <mat-spinner diameter="18" />
        } @else {
          Delete
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 460px;
      }

      .confirm-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e0e0e0;
        border-radius: 4px;

        th {
          text-align: left;
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
        }

        td {
          padding: 12px 16px;
          font-size: 13px;
          color: #333;
        }
      }

      mat-dialog-actions {
        display: flex;
        gap: 8px;
        padding: 12px 24px 16px;
      }

      .spacer {
        flex: 1;
      }
    `,
  ],
})
export class DeletePermissionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeletePermissionDialogComponent>);
  readonly data = inject<DeletePermissionDialogData>(MAT_DIALOG_DATA);
  private readonly detailService = inject(DocumentDetailService);

  readonly deleting = signal(false);

  confirmDelete(): void {
    if (this.deleting()) return;
    this.deleting.set(true);

    this.detailService
      .removePermission(this.data.documentUid, {
        user: this.data.ace.username,
        permission: this.data.ace.permission,
        acl: 'local',
      })
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.dialogRef.close(true);
        },
        error: () => {
          this.deleting.set(false);
        },
      });
  }
}
