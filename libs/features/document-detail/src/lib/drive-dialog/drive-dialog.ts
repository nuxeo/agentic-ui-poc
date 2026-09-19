import { Component, inject, signal, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NuxeoDriveService } from '@nuxeo-satori/platform/nuxeo-client';

export interface DriveDialogData {
  docUid: string;
  filename: string;
  blobUrl: string;
  docPath?: string;
}

interface DrivePackage {
  platform: string;
  name: string;
  url: string;
}

const DRIVE_PACKAGES: DrivePackage[] = [
  {
    platform: 'Linux',
    name: 'Nuxeo-Drive-X86_64.AppImage',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive-x86_64.AppImage',
  },
  {
    platform: 'macOS',
    name: 'Nuxeo-Drive.Dmg',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.dmg',
  },
  {
    platform: 'Windows',
    name: 'Nuxeo-Drive.Exe',
    url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.exe',
  },
];

@Component({
  selector: 'lib-drive-dialog',
  standalone: true,
  imports: [MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './drive-dialog.html',
  styleUrl: './drive-dialog.scss',
})
export class DriveDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DriveDialogComponent>);
  private readonly driveService = inject(NuxeoDriveService);
  private readonly data = inject<DriveDialogData>(MAT_DIALOG_DATA);

  readonly packages = DRIVE_PACKAGES;
  readonly checking = signal(true);

  ngOnInit(): void {
    this.driveService.hasDriveToken().subscribe((hasToken) => {
      if (hasToken) {
        // Use direct-transfer (same as the working browse page button) with the document's
        // parent folder path. nxdrive://edit requires username matching that fails on some
        // Drive configurations, while direct-transfer only matches by server URL.
        const docPath = this.data.docPath ?? '/';
        const url = this.driveService.buildDirectTransferUrl(docPath);
        this.driveService.openDriveUrl(url);
        this.dialogRef.close();
      } else {
        this.checking.set(false);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
