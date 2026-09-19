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
  templateUrl: './delete-permission-dialog.html',
  styleUrl: './delete-permission-dialog.scss',
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
